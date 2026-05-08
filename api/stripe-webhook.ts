// /api/stripe-webhook.ts
// Vercel Serverless Function für Stripe Webhook Events
//
// Reagiert auf:
//  - checkout.session.completed     → Sheet auf "paid" + Customer-Footer setzen + Bot freischalten
//  - customer.subscription.created  → Abo gestartet (z.B. nach Trial)
//  - customer.subscription.updated  → Plan-Wechsel, Status-Änderung
//  - customer.subscription.deleted  → Kündigung
//  - invoice.payment_failed         → Zahlung fehlgeschlagen → Mahn-Email
//  - invoice.paid                   → Erfolgreiche Folge-Zahlung
//  - invoice.upcoming               → Footer auf kommender Invoice setzen (Backup)
//
// USt-Disclaimer-Strategie:
//   1. Bei checkout.session.completed: setzen wir invoice_settings.footer auf den Customer
//      → ALLE zukünftigen Invoices (auch automatische Renewals) erben diesen Footer
//   2. Bei invoice.upcoming als Sicherheitsnetz: nochmal den Footer auf die Draft-Invoice setzen
//
// Refund-Logik: Bei Pioneer-6-Subscription nach Setup-Kauf wird Customer als
// "refund_eligible" markiert für späteren manuellen Refund nach 6 Mo.
//
// Datenflow:
//   1. Frontend POST /api/save-onboarding (vor Stripe) → Sheet-Row "pending_payment"
//   2. Frontend POST /api/stripe-checkout mit onboardingId → Stripe-Metadata enthält onboardingId
//   3. Stripe Webhook checkout.session.completed → updateOnboardingPaid() + Customer-Footer setzen

import Stripe from "stripe";
import { sendOrderConfirmation, sendInternalNotification } from "./_resend.js";
import { updateOnboardingPaid } from "./_sheet.js";

export const config = {
  api: {
    bodyParser: false, // Stripe braucht raw body für Signatur-Validierung
  },
};

// ═══════════════════════════════════════════════════════════
// Kleinunternehmer-Disclaimer (§19 UStG)
// MUSS auf JEDER Rechnung erscheinen — wir setzen ihn auf Customer-Level
// damit auch automatische Folge-Rechnungen ihn erben.
// ═══════════════════════════════════════════════════════════
const KLEINUNTERNEHMER_FOOTER =
  "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung). " +
  "Mr. Bell · Inhaber: Ben Deschler · Scheibenstr. 2, 76530 Baden-Baden · " +
  "kontakt@mrbell.de · mrbell.de";

async function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(typeof c === "string" ? Buffer.from(c) : c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const N8N_WEBHOOK_URL = process.env.N8N_PROVISION_WEBHOOK_URL || "";

async function notifyN8n(payload: any) {
  if (!N8N_WEBHOOK_URL) {
    console.warn("N8N_PROVISION_WEBHOOK_URL nicht gesetzt — Bot-Provisionierung übersprungen");
    return;
  }
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("n8n notify failed", e);
  }
}

// ═══════════════════════════════════════════════════════════
// Setzt den USt-Disclaimer-Footer auf Customer-Level.
// Damit erben ALLE zukünftigen Invoices den Footer automatisch.
// ═══════════════════════════════════════════════════════════
async function setCustomerInvoiceFooter(stripe: Stripe, customerId: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || ("deleted" in customer && customer.deleted)) return;

    const existingFooter = (customer as Stripe.Customer).invoice_settings?.footer;
    if (existingFooter && existingFooter.includes("§ 19 UStG")) {
      // schon gesetzt — skip
      return;
    }

    await stripe.customers.update(customerId, {
      invoice_settings: {
        footer: KLEINUNTERNEHMER_FOOTER,
      },
    });
    console.log(`[stripe-webhook] Customer-Footer gesetzt für ${customerId}`);
  } catch (e) {
    console.error("[stripe-webhook] setCustomerInvoiceFooter failed:", e);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error("Stripe Env Vars fehlen");
    return res.status(500).json({ error: "Konfiguration unvollständig" });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18.acacia" });

  let event: Stripe.Event;
  try {
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
  }

  console.log(`Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      // ============================================
      // Checkout abgeschlossen
      // ============================================
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata || {};
        const flow = meta.flow || "";
        const plan = meta.plan || "";
        const companyName = meta.companyName || "";
        const onboardingId = meta.onboardingId || "";

        console.log("Checkout completed:", { flow, plan, companyName, onboardingId, sessionId: session.id });

        // ────────────────────────────────────────────────
        // Wenn Customer existiert: USt-Footer auf Customer-Level setzen
        // → ALLE zukünftigen Rechnungen erben den Footer
        // ────────────────────────────────────────────────
        const customerId = typeof session.customer === "string"
          ? session.customer
          : (session.customer ? session.customer.id : null);

        if (customerId) {
          await setCustomerInvoiceFooter(stripe, customerId);
        }

        // Wenn es ein setup_only Kauf war: Markiere im Customer-Metadata für 30-Tage-Refund-Tracking
        if (flow === "setup_only" && session.payment_intent) {
          const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
          if (session.customer_email) {
            // Suche oder erstelle Customer und vermerke Setup-Kauf
            const existing = await stripe.customers.list({ email: session.customer_email, limit: 1 });
            const customer = existing.data[0]
              ? existing.data[0]
              : await stripe.customers.create({
                  email: session.customer_email,
                  name: companyName,
                  invoice_settings: { footer: KLEINUNTERNEHMER_FOOTER },
                });

            await stripe.customers.update(customer.id, {
              invoice_settings: { footer: KLEINUNTERNEHMER_FOOTER }, // sicherstellen
              metadata: {
                ...customer.metadata,
                setup_payment_intent: piId,
                setup_paid_at: String(Math.floor(Date.now() / 1000)),
                setup_refund_window_until: String(Math.floor(Date.now() / 1000) + 30 * 24 * 3600),
                companyName,
                onboardingId,
              },
            });
          }
        }

        // Wenn Subscription: prüfe ob Pioneer 6 + ob es vorher einen setup_only Kauf gab
        if (flow === "subscription" && plan === "pioneer_6" && customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && !("deleted" in customer && customer.deleted)) {
            const cMeta = (customer as Stripe.Customer).metadata || {};
            const refundWindowUntil = parseInt(cMeta.setup_refund_window_until || "0", 10);
            const setupPiId = cMeta.setup_payment_intent;
            const now = Math.floor(Date.now() / 1000);

            if (setupPiId && refundWindowUntil && now <= refundWindowUntil) {
              // Kunde ist refund-berechtigt: markiere Subscription-Start
              await stripe.customers.update(customerId, {
                metadata: {
                  ...cMeta,
                  refund_eligible: "true",
                  refund_eligible_marked_at: String(now),
                  refund_eligible_subscription_id: typeof session.subscription === "string" ? session.subscription : "",
                },
              });
              console.log(`Customer ${customerId} ist refund-berechtigt für Setup-PI ${setupPiId}`);
            }
          }
        }

        // n8n triggern damit der Bot bereitgestellt wird
        await notifyN8n({
          event: "checkout_completed",
          flow,
          plan,
          companyName,
          onboardingId,
          customerEmail: session.customer_email,
          sessionId: session.id,
          subscriptionId: typeof session.subscription === "string" ? session.subscription : "",
          paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
        });

        const totalAmount = session.amount_total
          ? `${(session.amount_total / 100).toFixed(2).replace(".", ",")}€`
          : "";
        const setupIncluded = (meta.includesSetup === "true" || flow === "setup_only");

        // ════════════════════════════════════════════════════════
        // Email-Bestätigung an Kunde (Resend)
        // ════════════════════════════════════════════════════════
        if (session.customer_email) {
          try {
            await sendOrderConfirmation(session.customer_email, {
              firma: companyName,
              plan: plan || "",
              total: totalAmount,
              setupIncluded,
            });
          } catch (e) {
            console.error("[stripe-webhook] sendOrderConfirmation failed:", e);
          }
        }

        // ════════════════════════════════════════════════════════
        // Internal Notification an dich (Resend)
        // ════════════════════════════════════════════════════════
        try {
          await sendInternalNotification({
            firma: companyName,
            email: session.customer_email || "",
            plan: plan || "",
            total: totalAmount,
            sessionId: session.id,
          });
        } catch (e) {
          console.error("[stripe-webhook] sendInternalNotification failed:", e);
        }

        // ════════════════════════════════════════════════════════
        // Master-Sheet Update: pending_payment → paid
        // ════════════════════════════════════════════════════════
        try {
          const sheetResult = await updateOnboardingPaid(onboardingId, {
            stripeSessionId: session.id,
            plan: plan || "",
            setupIncluded,
            totalAmount,
            flow,
            customerEmail: session.customer_email || "",
            subscriptionId: typeof session.subscription === "string" ? session.subscription : "",
            paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
          });
          if (!sheetResult.ok) {
            console.error("[stripe-webhook] Sheet update failed:", sheetResult.error);
          }
        } catch (e) {
          console.error("[stripe-webhook] updateOnboardingPaid threw:", e);
        }

        break;
      }

      // ============================================
      // Subscription erstellt / aktualisiert / gelöscht
      // ============================================
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        // USt-Footer sicherstellen (auch falls Subscription außerhalb von Checkout entsteht)
        if (event.type === "customer.subscription.created") {
          await setCustomerInvoiceFooter(stripe, customerId);
        }

        await notifyN8n({
          event: event.type,
          subscriptionId: sub.id,
          customerId,
          status: sub.status,
          plan: sub.metadata?.plan || "",
          companyName: sub.metadata?.companyName || "",
          onboardingId: sub.metadata?.onboardingId || "",
          currentPeriodEnd: sub.current_period_end,
          cancelAt: sub.cancel_at,
          canceledAt: sub.canceled_at,
        });
        break;
      }

      // ============================================
      // Erfolgreiche Folge-Zahlung
      // ============================================
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await notifyN8n({
          event: "invoice_paid",
          customerId: typeof invoice.customer === "string" ? invoice.customer : "",
          invoiceId: invoice.id,
          subscriptionId: typeof invoice.subscription === "string" ? invoice.subscription : "",
          amountPaid: invoice.amount_paid,
        });
        break;
      }

      // ============================================
      // Kommende Invoice (Backup-Mechanismus für Footer)
      // Stripe ruft das ~1h vor jeder geplanten Renewal auf.
      // Wir patchen den Footer falls er fehlt.
      // ============================================
      case "invoice.upcoming": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : "";
        if (customerId) {
          await setCustomerInvoiceFooter(stripe, customerId);
        }
        break;
      }

      // ============================================
      // Zahlung fehlgeschlagen → Mahn-Workflow
      // ============================================
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await notifyN8n({
          event: "invoice_payment_failed",
          customerId: typeof invoice.customer === "string" ? invoice.customer : "",
          invoiceId: invoice.id,
          subscriptionId: typeof invoice.subscription === "string" ? invoice.subscription : "",
          amountDue: invoice.amount_due,
          attemptCount: invoice.attempt_count,
        });
        break;
      }

      default:
        // Unbekannte Events ignorieren
        break;
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    // Wir antworten trotzdem 200 damit Stripe nicht endlos retried
  }

  return res.status(200).json({ received: true });
}
