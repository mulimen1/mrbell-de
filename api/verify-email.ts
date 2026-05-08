// /api/verify-email.ts
// Email-Verifizierung im Onboarding (Step 13).
//
// 2 Actions:
//   POST { action: "send", email }   → generiert 6-stelligen Code, sendet Email
//   POST { action: "verify", email, code } → prüft Code → ok/error
//
// Speicherung: in-memory Map (resettet bei Cold Start, okay für MVP).
// Für Production später: Redis/Upstash.

import { sendVerificationCode } from "./_resend.js";

type CodeEntry = { code: string; expiresAt: number; attempts: number };
const codes = new Map<string, CodeEntry>();
const CODE_TTL_MS = 15 * 60 * 1000; // 15 Minuten
const MAX_ATTEMPTS = 5;

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

function generateCode(): string {
  // 6-stellig, ohne führende Nullen-Probleme (immer 6 Zeichen)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email: string): boolean {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanupExpired() {
  const now = Date.now();
  for (const [email, entry] of codes.entries()) {
    if (entry.expiresAt < now) codes.delete(email);
  }
}

export default async function handler(req: any, res: any) {
  setCORS(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  cleanupExpired();

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const action = body.action;
    const email = String(body.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Ungültige Email-Adresse" });
    }

    // ────────── ACTION: SEND ──────────
    if (action === "send") {
      // Rate-Limit: max 1 Code-Anfrage pro Email pro 30 Sekunden
      const existing = codes.get(email);
      if (existing && Date.now() - (existing.expiresAt - CODE_TTL_MS) < 30 * 1000) {
        return res.status(429).json({ error: "Bitte warten Sie 30 Sekunden vor erneutem Senden." });
      }

      const code = generateCode();
      codes.set(email, {
        code,
        expiresAt: Date.now() + CODE_TTL_MS,
        attempts: 0,
      });

      const result = await sendVerificationCode(email, code);
      if (!result.ok) {
        console.error("[verify-email] Failed to send code:", result.error);
        return res.status(500).json({ error: "Email konnte nicht gesendet werden. Bitte erneut versuchen." });
      }

      return res.status(200).json({ ok: true });
    }

    // ────────── ACTION: VERIFY ──────────
    if (action === "verify") {
      const code = String(body.code || "").trim();
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ error: "Code muss 6-stellig sein" });
      }

      const entry = codes.get(email);
      if (!entry) {
        return res.status(400).json({ error: "Kein Code für diese Email. Bitte neuen Code anfordern." });
      }
      if (entry.expiresAt < Date.now()) {
        codes.delete(email);
        return res.status(400).json({ error: "Code abgelaufen. Bitte neuen Code anfordern." });
      }
      if (entry.attempts >= MAX_ATTEMPTS) {
        codes.delete(email);
        return res.status(400).json({ error: "Zu viele Fehlversuche. Bitte neuen Code anfordern." });
      }

      entry.attempts++;
      if (entry.code !== code) {
        return res.status(400).json({ error: `Falscher Code. Verbleibende Versuche: ${MAX_ATTEMPTS - entry.attempts}` });
      }

      // Erfolg → Code löschen damit nicht wiederverwendbar
      codes.delete(email);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unbekannte Action" });
  } catch (err: any) {
    console.error("[verify-email] error:", err?.message);
    return res.status(500).json({ error: "Server-Fehler" });
  }
}
