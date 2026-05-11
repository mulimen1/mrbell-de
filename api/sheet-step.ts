// /api/sheet-step.ts
// Trackt jeden abgeschlossenen Onboarding-Schritt ins Sheet.
// Fire-and-forget — kein await, kein Blocking.

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

  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEET_SECRET;
  if (!url || !secret) return res.status(200).json({ ok: false });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { onboardingId, step, companyName, industry, anrede, tonfall, city, timestamp } = body;

    if (!onboardingId) return res.status(200).json({ ok: false });

    const payload = {
      secret,
      action: "save_step",
      onboarding_id: onboardingId,
      step: step || "",
      company_name: companyName || "",
      industry: industry || "",
      anrede: anrede || "",
      tonfall: tonfall || "",
      city: city || "",
      timestamp: timestamp || new Date().toISOString(),
    };

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(200).json({ ok: false });
  }
}
