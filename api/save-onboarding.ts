// /api/save-onboarding.ts
// Pre-Save Onboarding-Daten ins Master-Sheet (Status: pending_payment)
// Wird vom Frontend aufgerufen NACH Email-Verify und VOR Stripe-Checkout.
//
// POST { onboardingId, formData }
//   → schreibt komplettes formData ins Sheet
//   → returnt { ok: true } oder { ok: false, error }

import { saveOnboardingPending, type OnboardingFormData } from "./_sheet.js";

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

// Basic UUID v4 Validation (akzeptiert auch andere ID-Formate min 8 Zeichen)
function isValidId(id: string): boolean {
  return typeof id === "string" && id.length >= 8 && id.length <= 64 && /^[a-zA-Z0-9_-]+$/.test(id);
}

// Sanitize: schneide zu lange Strings ab (Apps Script kann nicht riesige cells handlen)
function sanitize(form: any): OnboardingFormData {
  if (!form || typeof form !== "object") return {};

  const truncate = (s: any, max: number): string => {
    if (typeof s !== "string") return "";
    return s.length > max ? s.slice(0, max) : s;
  };

  // botPrompt: max 5000 chars (Apps Script cell limit ist 50k, wir sind sicher unten)
  // andere Felder: max 500 chars
  return {
    companyName: truncate(form.companyName, 200),
    industry: truncate(form.industry, 100),
    anrede: truncate(form.anrede, 100),
    tonfall: truncate(form.tonfall, 100),
    street: truncate(form.street, 200),
    zip: truncate(form.zip, 20),
    city: truncate(form.city, 100),
    country: truncate(form.country, 100),
    hours: form.hours, // Object oder String, wird in _sheet gestringified
    services: form.services, // Array
    faqs: form.faqs, // Array
    waCountry: truncate(form.waCountry, 10),
    waNumber: truncate(form.waNumber, 30),
    bizEmail: truncate(form.bizEmail, 200).toLowerCase(),
    bizEmailVerified: !!form.bizEmailVerified,
    phoneCountry: truncate(form.phoneCountry, 10),
    phone: truncate(form.phone, 30),
    apiPath: truncate(form.apiPath, 30),
    apiKey: form.apiKey ? "PROVIDED" : "", // wir speichern den KEY NIE — nur ob er da ist
    needsWaSetup: !!form.needsWaSetup,
    botPrompt: truncate(form.botPrompt, 5000),
    sheetsConnected: !!form.sheetsConnected,
    guidedTopics: form.guidedTopics,
    guidedSlot: truncate(form.guidedSlot, 100),
    guidedPlatform: truncate(form.guidedPlatform, 100),
    calendlyEventUri: truncate(form.calendlyEventUri, 300),
    calendlyInviteeUri: truncate(form.calendlyInviteeUri, 300),
    selectedPlan: truncate(form.selectedPlan, 30),
    wantSetup: !!form.wantSetup,
    paymentTermsAccepted: !!form.paymentTermsAccepted,
  };
}

export default async function handler(req: any, res: any) {
  setCORS(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const onboardingId = String(body.onboardingId || "").trim();
    const formData = body.formData;

    if (!isValidId(onboardingId)) {
      return res.status(400).json({ error: "Ungültige onboardingId" });
    }
    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ error: "formData fehlt" });
    }

    const cleaned = sanitize(formData);
    const result = await saveOnboardingPending(onboardingId, cleaned);

    if (!result.ok) {
      console.error("[save-onboarding] sheet write failed:", result.error);
      // Wir antworten trotzdem 200 — das Onboarding soll nicht abbrechen wenn das Sheet kurzzeitig down ist
      // Stripe-Webhook-Pfad fängt es später nochmal ab (orphan-row)
      return res.status(200).json({ ok: false, error: result.error, soft_fail: true });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("[save-onboarding] error:", err?.message);
    return res.status(500).json({ error: "Server-Fehler" });
  }
}
