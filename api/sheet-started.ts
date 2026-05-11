// /api/sheet-started.ts
// Feuert wenn Besucher den Bell-Chat CTA klickt und ins Onboarding wechselt.
// Schreibt Status "onboarding_started" ins Master-Sheet — damit wir Drop-offs sehen.

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
  if (!url || !secret) return res.status(500).json({ error: "missing_env" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { onboardingId, startedAt } = body;

    if (!onboardingId) return res.status(400).json({ error: "missing_onboarding_id" });

    const payload = {
      secret,
      action: "save_started",
      onboarding_id: onboardingId,
      status: "onboarding_started",
      started_at: startedAt || new Date().toISOString(),
    };

    const sheetRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!sheetRes.ok) {
      console.error("[sheet-started] HTTP error:", sheetRes.status);
      return res.status(200).json({ ok: false }); // 200 damit der Client nicht abbricht
    }

    console.log("[sheet-started] OK:", onboardingId);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("[sheet-started] Exception:", err?.message);
    return res.status(200).json({ ok: false }); // 200 — fire-and-forget
  }
}
