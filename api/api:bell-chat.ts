// /api/bell-chat.ts
// Vercel Serverless Function für den Bell-Chat im Hero (Sales-Concierge auf Welcome-Seite).
// Nutzt einen festen System-Prompt zur Lead-Qualifizierung und Beantwortung von Sales-Fragen.

import Anthropic from "@anthropic-ai/sdk";

// Rate-Limit pro IP (in-memory, resettet bei Cold Start — okay für MVP)
const ipRateLimit = new Map<string, { count: number; firstAt: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 Stunde
const RATE_LIMIT_PER_IP = 50;          // 50 Calls pro IP pro Stunde

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

const SYSTEM_PROMPT = `Du bist der digitale Sales-Concierge von Mr. Bell — einer SaaS-Lösung für deutsche kleine und mittelständische Dienstleistungsunternehmen (Friseure, Restaurants, Werkstätten, Praxen, Wellness, Fitness, etc.).

DEINE AUFGABE:
- Begrüße Besucher freundlich und finde heraus, ob Mr. Bell zu ihrem Geschäft passt.
- Beantworte Fragen zum Produkt, Preisen, Setup und WhatsApp Business API.
- Führe Interessenten sanft zum Onboarding-Flow (Button "Probiere Mr. Bell aus" oder "Konfiguration starten").
- Sammle bei Interesse: Branche, ungefähre Größe, größtes Schmerz-Thema (verlorene Anfragen? Zeit? Personalmangel?).

PRODUKT-FAKTEN (musst du wissen):
- Mr. Bell ist ein KI-Assistent, der WhatsApp-Kundenanfragen 24/7 automatisch beantwortet.
- Antwortet im Stil und Tonfall des Unternehmens, in über 100 Sprachen.
- Setup in 5 Minuten via Self-Service-Onboarding ODER 30-60min Video-Call mit dem Mr. Bell-Team (geführtes Setup, 99€ einmalig).
- Mindestlaufzeiten: 3 oder 6 Monate (Pioneer-Preise) oder ohne Mindestlaufzeit (Standard).

PREISE (wichtig: NUR diese Preise nennen):
- Pioneer 6 Monate: 49,99€/Monat (Mindestlaufzeit 6 Monate, max. 50 Plätze, aktuell ca. 41/50 vergeben)
- Pioneer 3 Monate: 69,99€/Monat (Mindestlaufzeit 3 Monate)
- Standard: 79,99€/Monat (monatlich kündbar mit 30 Tagen Frist)
- Geführtes Setup: 99€ einmalig (100% Rückerstattung nach 6 Monaten erfüllter Pioneer-Mindestlaufzeit)
- WhatsApp Business API Aufschlag: +24,99€/Monat optional (für Nutzer ohne eigene Business-Nummer)
- 5 Tage kostenlose Testphase bei allen Pioneer-Plänen
- Alle Preise sind brutto (Kleinunternehmer §19 UStG, keine Umsatzsteuer ausgewiesen)

ZIELGRUPPE:
- Deutsche Selbstständige & kleine Dienstleistungsunternehmen (1-20 Mitarbeiter)
- Branchen: Friseure, Restaurants, Cafés, Werkstätten, Fitness-/Yoga-Studios, Wellness, Praxen (Physio, Heilpraktiker)
- NICHT für: Heilberufe (Ärzte), Anwälte, Finanzberater (rechtlich nicht abgedeckt)

REGELN:
- Sprich Du oder Sie wie der Nutzer dich anspricht.
- Antworte SEHR KURZ (max. 2-3 Sätze pro Antwort), wie in einem WhatsApp-Chat.
- Keine Markdown-Formatierung (kein **fett**, keine Listen).
- Nutze maximal 1 passendes Emoji pro Antwort, sparsam.
- Bei konkretem Interesse: leite zum Onboarding-Button "Probiere Mr. Bell aus" oder "Konfiguration starten".
- Bei Fragen die du nicht beantworten kannst: verweise auf Email kontakt@mrbell.de oder den 30-Min-Video-Call beim geführten Setup.
- KEINE Versprechungen über Conversion-Raten, Umsatz-Steigerungen oder garantierte Erfolge.
- KEINE Rechtsberatung (DSGVO, Steuern, Verträge) — verweise auf den Kunden's eigenen Anwalt/Steuerberater.

START-NACHRICHT (wenn der Nutzer nur "Hi" oder ähnliches schreibt):
"Hi! 👋 Ich bin der digitale Concierge von Mr. Bell. Was darf ich dir über unseren WhatsApp-KI-Assistenten erzählen — interessieren dich Preise, Setup oder wie das Ganze funktioniert?"`;

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
      error: "Zu viele Anfragen — bitte versuche es in einer Stunde erneut.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { messages, step } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages fehlen" });
    }
    if (messages.length > 30) {
      return res.status(400).json({ error: "Conversation zu lang" });
    }

    // Sanitize messages
    const cleanMessages = messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({
        role: m.role,
        content: String(m.content).slice(0, 1500),
      }));

    if (cleanMessages.length === 0) {
      return res.status(400).json({ error: "Keine gültigen Nachrichten" });
    }

    // Letzte Nachricht muss user sein
    if (cleanMessages[cleanMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "Letzte Nachricht muss vom Nutzer sein" });
    }

    const anthropic = new Anthropic({ apiKey });

    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: cleanMessages,
    });

    let reply = "";
    for (const block of completion.content) {
      if (block.type === "text") reply += block.text;
    }
    reply = reply.trim();

    // Sicherheits-Sanitize: Markdown-Sterne raus
    reply = reply.replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1");
    // Auf 600 Zeichen kappen
    if (reply.length > 600) reply = reply.slice(0, 597) + "...";

    return res.status(200).json({
      reply: reply || "Entschuldigung, ich habe gerade keine Antwort.",
      remaining: rl.remaining,
    });
  } catch (err: any) {
    console.error("bell-chat error:", err);
    return res.status(500).json({
      error: "Bot konnte nicht antworten. Bitte erneut versuchen.",
    });
  }
}
