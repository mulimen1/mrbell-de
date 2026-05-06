// /api/test-chat.ts
// Vercel Serverless Function für den Live-Test-Chat im Onboarding.
// Nimmt einen dynamisch zusammengebauten System-Prompt und das Conversation-History,
// ruft Anthropic's Claude Haiku 4.5 auf und gibt die Antwort zurück.
//
// Kostenkontrolle: Server-Side Hard-Limit zusätzlich zum Frontend-Limit.

import Anthropic from "@anthropic-ai/sdk";

// Rate-Limit pro IP (in-memory, resettet bei Cold Start — okay für MVP)
const ipRateLimit = new Map<string, { count: number; firstAt: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 Stunde
const RATE_LIMIT_PER_IP = 30;          // 30 Test-Calls pro IP pro Stunde

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

function getClientIp(req: any): string {
  const xff = req.headers?.["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.headers?.["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || now - entry.firstAt > RATE_WINDOW_MS) {
    ipRateLimit.set(ip, { count: 1, firstAt: now });
    return { allowed: true, remaining: RATE_LIMIT_PER_IP - 1 };
  }
  if (entry.count >= RATE_LIMIT_PER_IP) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_PER_IP - entry.count };
}

export default async function handler(req: any, res: any) {
  setCORS(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY fehlt");
    return res.status(500).json({ error: "Server-Konfiguration unvollständig" });
  }

  // Rate-Limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return res.status(429).json({
      error: "Zu viele Test-Anfragen — bitte versuche es in einer Stunde erneut.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { systemPrompt, history } = body;

    if (!systemPrompt || typeof systemPrompt !== "string") {
      return res.status(400).json({ error: "System-Prompt fehlt" });
    }
    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: "Conversation History fehlt" });
    }
    if (history.length > 24) {
      return res.status(400).json({ error: "Conversation zu lang" });
    }

    // Sanitize history
    const cleanHistory = history
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({
        role: m.role,
        content: String(m.content).slice(0, 1000),
      }));

    if (cleanHistory.length === 0) {
      return res.status(400).json({ error: "Keine gültigen Nachrichten" });
    }

    // Letzte Nachricht muss user sein (sonst antworten wir auf nichts)
    if (cleanHistory[cleanHistory.length - 1].role !== "user") {
      return res.status(400).json({ error: "Letzte Nachricht muss vom Nutzer sein" });
    }

    const anthropic = new Anthropic({ apiKey });

    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt.slice(0, 8000), // Hard cap auf System-Prompt-Länge
      messages: cleanHistory,
    });

    let reply = "";
    for (const block of completion.content) {
      if (block.type === "text") reply += block.text;
    }
    reply = reply.trim();

    // Sicherheits-Sanitize: Markdown-Sterne raus (Bot soll WhatsApp-Style schreiben)
    reply = reply.replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1");
    // Auf 500 Zeichen kappen
    if (reply.length > 500) reply = reply.slice(0, 497) + "...";

    return res.status(200).json({
      reply: reply || "Entschuldigung, ich habe gerade keine Antwort.",
      remaining: rl.remaining,
    });
  } catch (err: any) {
    console.error("test-chat error:", err);
    return res.status(500).json({
      error: "Bot konnte nicht antworten. Bitte erneut versuchen.",
    });
  }
}
