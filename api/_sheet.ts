// /api/_sheet.ts
// Helper zum Schreiben in das Master-Google-Sheet via Apps Script Webhook.
//
// 2 Modi:
//   1. saveOnboardingPending(onboardingId, formData)
//      → schreibt KOMPLETTES Onboarding-Formular ins Sheet, Status "pending_payment"
//      → wird vom /api/save-onboarding Endpoint aufgerufen (vor Stripe-Checkout)
//
//   2. updateOnboardingPaid(onboardingId, stripeData)
//      → updated bestehende Zeile auf Status "paid", trägt Stripe-Daten ein
//      → wird vom /api/stripe-webhook bei checkout.session.completed aufgerufen
//
// Apps Script erwartet im POST-Body:
//   { secret, action: "save_pending" | "update_paid", ...rest }

// ═══════════════════════════════════════════════════════════
// Types — komplettes Onboarding-Schema
// ═══════════════════════════════════════════════════════════

export type OnboardingFormData = {
  // Basics
  companyName?: string;
  industry?: string;
  anrede?: string;
  tonfall?: string;

  // Adresse
  street?: string;
  zip?: string;
  city?: string;
  country?: string;

  // Öffnungszeiten — als Object { mo: "9-18", ... } oder JSON-String
  hours?: Record<string, any> | string;

  // Services & FAQ — Arrays
  services?: Array<{ name: string; price: string }> | string;
  faqs?: Array<{ q: string; a: string }> | string;

  // Kontakt
  waCountry?: string;
  waNumber?: string;
  bizEmail?: string;
  bizEmailVerified?: boolean;
  phoneCountry?: string;
  phone?: string;

  // API-Pfad
  apiPath?: string; // 'have' | 'tutorial' | 'guided'
  apiKey?: string;  // wir speichern das NICHT im Sheet — nur "Ja/Nein hinterlegt"
  needsWaSetup?: boolean;

  // Bot-Prompt
  botPrompt?: string;

  // Sheets
  sheetsConnected?: boolean;

  // Guided-Pfad
  guidedTopics?: string[] | string;
  guidedSlot?: string;
  guidedPlatform?: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;

  // Plan-Auswahl (vor Stripe)
  selectedPlan?: string; // pioneer_6 | pioneer_3 | standard | setup_only
  wantSetup?: boolean;

  // Misc
  paymentTermsAccepted?: boolean;
};

export type StripePaidData = {
  stripeSessionId: string;
  plan: string;
  setupIncluded: boolean;
  totalAmount: string; // formatiert "49,99€"
  flow: string; // "subscription" | "setup_only"
  customerEmail?: string;
  subscriptionId?: string;
  paymentIntentId?: string;
};

// ═══════════════════════════════════════════════════════════
// Internal: HTTP POST zum Apps Script
// ═══════════════════════════════════════════════════════════

async function postToSheet(payload: Record<string, any>): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEET_SECRET;

  if (!url || !secret) {
    console.error("[sheet] GOOGLE_SHEET_WEBHOOK_URL oder GOOGLE_SHEET_SECRET fehlt");
    return { ok: false, error: "missing_env" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, ...payload }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("[sheet] HTTP error:", res.status);
      return { ok: false, error: `status_${res.status}` };
    }

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[sheet] Invalid JSON response:", text.slice(0, 200));
      return { ok: false, error: "invalid_response" };
    }

    if (!data.ok) {
      console.error("[sheet] Apps Script returned error:", data?.error);
      return { ok: false, error: data?.error || "unknown" };
    }

    console.log("[sheet] OK:", payload.action);
    return { ok: true };
  } catch (err: any) {
    console.error("[sheet] Exception:", err?.message);
    return { ok: false, error: err?.message || "unknown" };
  }
}

// ═══════════════════════════════════════════════════════════
// Helper: serialize complex fields safely for sheet cell
// ═══════════════════════════════════════════════════════════

function safeStringify(v: any): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function flatten(form: OnboardingFormData): Record<string, string> {
  // Normalisiere alle Felder zu Strings — Sheet-cells sind Strings
  return {
    firma: form.companyName || "",
    branche: form.industry || "",
    anrede: form.anrede || "",
    tonfall: form.tonfall || "",
    street: form.street || "",
    zip: form.zip || "",
    city: form.city || "",
    country: form.country || "",
    hours_json: safeStringify(form.hours),
    services_json: safeStringify(form.services),
    faqs_json: safeStringify(form.faqs),
    wa_country: form.waCountry || "",
    wa_number: form.waNumber || "",
    email: form.bizEmail || "",
    email_verified: form.bizEmailVerified ? "Ja" : "Nein",
    phone_country: form.phoneCountry || "",
    phone: form.phone || "",
    api_path: form.apiPath || "",
    api_key_provided: form.apiKey ? "Ja" : "Nein",
    needs_wa_setup: form.needsWaSetup ? "Ja" : "Nein",
    bot_prompt: form.botPrompt || "",
    sheets_connected: form.sheetsConnected ? "Ja" : "Nein",
    guided_topics: safeStringify(form.guidedTopics),
    guided_slot: form.guidedSlot || "",
    guided_platform: form.guidedPlatform || "",
    calendly_event_uri: form.calendlyEventUri || "",
    calendly_invitee_uri: form.calendlyInviteeUri || "",
    selected_plan: form.selectedPlan || "",
    want_setup: form.wantSetup ? "Ja" : "Nein",
  };
}

// ═══════════════════════════════════════════════════════════
// Public: Save Pending (vor Stripe-Checkout)
// ═══════════════════════════════════════════════════════════

export async function saveOnboardingPending(
  onboardingId: string,
  form: OnboardingFormData,
): Promise<{ ok: boolean; error?: string }> {
  if (!onboardingId) {
    return { ok: false, error: "missing_onboarding_id" };
  }

  const fields = flatten(form);
  return postToSheet({
    action: "save_pending",
    onboarding_id: onboardingId,
    status: "pending_payment",
    created_at: new Date().toISOString(),
    ...fields,
  });
}

// ═══════════════════════════════════════════════════════════
// Public: Update Paid (vom Stripe-Webhook)
// ═══════════════════════════════════════════════════════════

export async function updateOnboardingPaid(
  onboardingId: string,
  stripe: StripePaidData,
): Promise<{ ok: boolean; error?: string }> {
  if (!onboardingId) {
    // Fallback: ohne onboarding_id können wir die Zeile nicht finden
    // → wir loggen es trotzdem als "orphan" für manuelle Aufarbeitung
    console.warn("[sheet] updateOnboardingPaid ohne onboarding_id — wird als orphan gespeichert");
    return postToSheet({
      action: "save_orphan_paid",
      stripe_session_id: stripe.stripeSessionId,
      plan: stripe.plan,
      setup_included: stripe.setupIncluded ? "Ja" : "Nein",
      total: stripe.totalAmount,
      flow: stripe.flow,
      email: stripe.customerEmail || "",
      subscription_id: stripe.subscriptionId || "",
      payment_intent_id: stripe.paymentIntentId || "",
      paid_at: new Date().toISOString(),
    });
  }

  return postToSheet({
    action: "update_paid",
    onboarding_id: onboardingId,
    status: "paid",
    paid_at: new Date().toISOString(),
    stripe_session_id: stripe.stripeSessionId,
    plan: stripe.plan,
    setup_included: stripe.setupIncluded ? "Ja" : "Nein",
    total: stripe.totalAmount,
    flow: stripe.flow,
    subscription_id: stripe.subscriptionId || "",
    payment_intent_id: stripe.paymentIntentId || "",
  });
}
