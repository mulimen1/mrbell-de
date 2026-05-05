// /api/stripe-webhook.ts
// Vercel Serverless Function für Stripe Webhook Events
//
// Reagiert auf:
//  - checkout.session.completed     → Kunde hat bezahlt → Bot freischalten / Setup-Termin bestätigen
//  - customer.subscription.created  → Abo gestartet (z.B. nach Trial)
//  - customer.subscription.updated  → Plan-Wechsel, Status-Änderung
//  - customer.subscription.deleted  → Kündigung
//  - invoice.payment_failed         → Zahlung fehlgeschlagen → Mahn-Email
//  - invoice.paid                   → Erfolgreiche Folge-Zahlung
//
// Bei Pioneer-Subscription nach Setup-Kauf wird `refund_eligible_setup_charge_id`
// im Customer-Metadata vermerkt — für späteren manuellen Refund nach 6 Mo.

import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false, // Stripe braucht raw body für Signatur-Validierung
  },
};

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

        // Wenn es ein setup_only Kauf war: Markiere im Customer-Metadata für 30-Tage-Refund-Tracking
        if (flow === "setup_only" && session.payment_intent) {
          const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
          if (session.customer_email) {
            // Suche oder erstelle Customer und vermerke Setup-Kauf
            const existing = await stripe.customers.list({ email: session.customer_email, limit: 1 });
            const customer = existing.data[0]
              ? existing.data[0]
              : await stripe.customers.create({ email: session.customer_email, name: companyName });

            await stripe.customers.update(customer.id, {
              metadata: {
                ...customer.metadata,
                setup_payment_intent: piId,
                setup_paid_at: String(Math.floor(Date.now() / 1000)),
                setup_refund_window_until: String(Math.floor(Date.now() / 1000) + 30 * 24 * 3600),
                companyName,
              },
            });
          }
        }

        // Wenn Subscription: prüfe ob Pioneer 6 + ob es vorher einen setup_only Kauf gab
        if (flow === "subscription" && plan === "pioneer_6" && session.customer) {
          const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
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
        break;
      }

      // ============================================
      // Subscription erstellt / aktualisiert / gelöscht
      // ============================================
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await notifyN8n({
          event: event.type,
          subscriptionId: sub.id,
          customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          status: sub.status,
          plan: sub.metadata?.plan || "",
          companyName: sub.metadata?.companyName || "",
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
    // (interne Fehler werden geloggt)
  }

  return res.status(200).json({ received: true });
}
