// /api/stripe-checkout.ts
// Vercel Serverless Function für Mr. Bell Stripe Checkout
// Pfade:
//  - "subscription"  → Pioneer 6 / Pioneer 3 / Standard (mit optionalem Setup-Add-On)
//  - "setup_only"    → 99€ einmalig (Pfad "Ich habe keine API")
//
// Mindestlaufzeiten:
//  - Pioneer 6: 6 Monate
//  - Pioneer 3: 3 Monate
//  - Standard:  0 (monatlich kündbar)
//
// Refund-Logik: 99€-Setup-Refund nur wenn Kunde innerhalb 30 Tagen nach
// Setup-Kauf einen Pioneer-6-Plan startet UND die 6 Monate komplett erfüllt.
// Refund wird manuell ausgelöst (Stripe Dashboard) — Webhook trackt nur die Bedingungen.

import Stripe from "stripe";

const PRICE_IDS = {
  pioneer_6: "price_1TTjRbQ4E1Gs5uQEEwn0Um4o",
  pioneer_3: "price_1TTjSlQ4E1Gs5uQELqLHGRea",
  standard:  "price_1TTjTbQ4E1Gs5uQEEASdLuhe",
  setup_99:  "price_1TTjWKQ4E1Gs5uQE5gZ8vWrQ",
} as const;

type PlanKey = "pioneer_6" | "pioneer_3" | "standard";

const MIN_TERM_MONTHS: Record<PlanKey, number> = {
  pioneer_6: 6,
  pioneer_3: 3,
  standard:  0,
};

const ALLOWED_ORIGINS = [
  "https://mrbell.de",
  "https://www.mrbell.de",
];

function setCORS(req: any, res: any) {
  const origin = req.headers?.origin || "";
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    origin === "http://localhost:3000";
  if (isAllowed) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: any, res: any) {
  setCORS(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY fehlt");
    return res.status(500).json({ error: "Server-Konfiguration unvollständig" });
  }
  const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18.acacia" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const {
      plan,
      includeSetup,
      customerEmail,
      companyName,
      onboardingId,
      metadata,
    } = body;

    if (!customerEmail || typeof customerEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: "Gültige Email erforderlich" });
    }
    if (!plan || !["pioneer_6", "pioneer_3", "standard", "setup_only"].includes(plan)) {
      return res.status(400).json({ error: "Ungültiger Plan" });
    }

    const baseUrl = (req.headers?.origin || "https://mrbell.de").replace(/\/$/, "");
    const successUrl = `${baseUrl}/erfolg.html?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;
    const cancelUrl  = `${baseUrl}/abbruch.html?plan=${plan}`;

    const baseMeta: Record<string, string> = {
      plan,
      companyName: companyName || "",
      includesSetup: String(!!includeSetup),
      onboardingId: onboardingId || "",
      ...(metadata || {}),
    };

    // ============================================
    // PFAD A: setup_only (99€ einmalig)
    // ============================================
    if (plan === "setup_only") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card", "sepa_debit"],
        line_items: [{ price: PRICE_IDS.setup_99, quantity: 1 }],
        customer_email: customerEmail,
        success_url: successUrl,
        cancel_url: cancelUrl,
        locale: "de",
        billing_address_collection: "required",
        metadata: { ...baseMeta, flow: "setup_only" },
        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: "Mr. Bell — Geführtes Setup (30-min Video-Termin)",
            footer:
              "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung). " +
              "Refund-Anspruch: 99€ werden erstattet, wenn innerhalb von 30 Tagen nach diesem Kauf " +
              "eine Pioneer-6-Monate-Mitgliedschaft abgeschlossen und die 6-monatige Mindestlaufzeit " +
              "vollständig erfüllt wird.",
          },
        },
        consent_collection: { terms_of_service: "required" },
        custom_text: {
          terms_of_service_acceptance: {
            message:
              "Ich habe die [AGB](https://mrbell.de/agb.html), " +
              "[Datenschutzerklärung](https://mrbell.de/datenschutz.html) und " +
              "[Widerrufsbelehrung](https://mrbell.de/widerruf.html) gelesen und akzeptiere diese (B2B nach § 14 BGB).",
          },
        },
      });
      return res.status(200).json({ url: session.url, sessionId: session.id });
    }

    // ============================================
    // PFAD B: Subscription (Pioneer 6 / 3 / Standard)
    // ============================================
    const planKey = plan as PlanKey;
    const subPriceId = PRICE_IDS[planKey];
    const minTermMonths = MIN_TERM_MONTHS[planKey];

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: subPriceId, quantity: 1 },
    ];
    if (includeSetup) {
      lineItems.push({ price: PRICE_IDS.setup_99, quantity: 1 });
    }

    const planLabel =
      planKey === "pioneer_6" ? "Pioneer 6 Monate" :
      planKey === "pioneer_3" ? "Pioneer 3 Monate" : "Standard";

    const trialDays = 5;

    const subMeta: Record<string, string> = {
      ...baseMeta,
      flow: "subscription",
      minTermMonths: String(minTermMonths),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "sepa_debit"],
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: "de",
      billing_address_collection: "required",
      subscription_data: {
        trial_period_days: trialDays,
        description:
          `Mr. Bell ${planLabel}` +
          (includeSetup ? " + Geführtes Setup" : "") +
          (minTermMonths > 0 ? ` · ${minTermMonths} Mo Mindestlaufzeit` : " · monatlich kündbar"),
        metadata: subMeta,
      },
      metadata: subMeta,
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        terms_of_service_acceptance: {
          message:
            `Ich habe die [AGB](https://mrbell.de/agb.html), ` +
            `[Datenschutzerklärung](https://mrbell.de/datenschutz.html) und ` +
            `[Widerrufsbelehrung](https://mrbell.de/widerruf.html) gelesen und akzeptiere diese.` +
            (minTermMonths > 0
              ? ` Ich akzeptiere die Mindestlaufzeit von ${minTermMonths} Monaten.`
              : ` Monatlich kündbar mit 30 Tagen Frist zum Monatsende.`) +
            ` B2B nach § 14 BGB.`,
        },
      },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });

  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return res.status(500).json({
      error: "Checkout konnte nicht erstellt werden",
      detail: err?.message || String(err),
    });
  }
}
