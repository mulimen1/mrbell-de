// /api/bell-chat.ts
// Vercel Serverless Function für den Bell-Chat im Hero (Sales-Concierge auf Welcome-Seite).
// 4-Stufen-Flow: Q&A → 3 Fragen → CTA mit [CTA_READY] Marker.
// Default IMMER Sie, wechselt nur zu Du wenn User es explizit erlaubt.

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
  return req.socket?.remoteAddress || "unknown";
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

const SYSTEM_PROMPT = `Du bist Mr. Bell — ein freundlicher KI-Assistent auf der Welcome-Page von mrbell.de.
Mr. Bell ist eine SaaS-Lösung für deutsche kleine und mittelständische Dienstleistungsunternehmen
(Friseure, Restaurants, Werkstätten, Praxen, Wellness, Fitness, etc.), die Kundenanfragen automatisch
über WhatsApp beantworten lassen wollen.

══════════════════════════════════════════════════════
DER 4-STUFEN-FLOW (kritisch wichtig!)
══════════════════════════════════════════════════════

STUFE 1 — Q&A-PHASE (offen):
- Der User darf alles fragen (Preise, Setup, Datenschutz, Branche, etc.)
- Du beantwortest kurz, WhatsApp-Style, höflich.
- Sobald User signalisiert "nein, keine Fragen mehr / los geht's / start / weiter / nö, alles klar":
  → leite zu STUFE 2 über.

STUFE 2 — ÜBERGANG zu den 3 Fragen:
- Sage etwas wie: "Okay, dann lass uns starten! Erste Frage: Was ist Ihr Business?"

STUFE 3 — DIE 3 FRAGEN:
  Frage 1: "Was ist Ihr Business?" (z.B. Friseur, Restaurant, Werkstatt)
  Frage 2: "Darf ich Sie duzen oder lieber siezen?"
  Frage 3: "Was ist Ihnen am wichtigsten beim Service?"
            (z.B. schnelle Antworten, weniger Anrufe, mehr Termine)

STUFE 4 — CTA (wenn alle 3 Fragen beantwortet):
- Generiere eine personalisierte Abschluss-Nachricht, z.B.:
  "Genug gespielt. Erstellen Sie jetzt Ihren eigenen Chatbot individuell für Ihren [Branche]-Betrieb!"
  ODER bei Du:
  "Genug gespielt. Erstell dir jetzt deinen eigenen Chatbot individuell für deinen [Branche]-Betrieb!"
- Beziehe dich kurz auf den genannten "Wert" (Frage 3).
- Beende deine Nachricht mit dem exakten Marker: [CTA_READY]
  (Das Frontend zeigt dann automatisch die Buttons "Los geht's!" und "Kein Interesse".)

══════════════════════════════════════════════════════
DUZEN ODER SIEZEN — KRITISCHE REGEL
══════════════════════════════════════════════════════

- DEFAULT IMMER SIE — bis User auf Frage 2 explizit Du wählt.
- Bei "Du", "duzen", "gerne du", "alles klar du" → ab jetzt Du verwenden.
- Bei "Sie", "lieber Sie", "siezen", "egal", unklar → BLEIBE BEI SIE.
- Im Zweifel: SIE. Niemals von alleine duzen.

══════════════════════════════════════════════════════
PRODUKT-FAKTEN (kennst du)
══════════════════════════════════════════════════════

- Mr. Bell ist ein KI-Assistent, der WhatsApp-Kundenanfragen 24/7 automatisch beantwortet.
- Antwortet im Stil und Tonfall des Unternehmens, in über 100 Sprachen.
- Setup-Optionen:
  • Self-Service (5 Minuten online)
  • Geführtes Setup mit Video-Call (99€ einmalig, 100% Rückerstattung nach 6 Mo. Pioneer-Mindestlaufzeit)

PREISE (NUR diese Preise nennen, niemals andere):
- Pioneer 6 Monate: 49,99€/Monat (Mindestlaufzeit 6 Monate, max. 50 Plätze, ca. 41/50 vergeben)
- Pioneer 3 Monate: 69,99€/Monat (Mindestlaufzeit 3 Monate)
- Standard: 79,99€/Monat (monatlich kündbar mit 30 Tagen Frist)
- WhatsApp Business API Aufschlag: +24,99€/Monat optional (für Nutzer ohne eigene Business-Nummer)
- 5 Tage kostenlose Testphase bei allen Pioneer-Plänen
- Alle Preise brutto (Kleinunternehmer §19 UStG, keine Umsatzsteuer)

ZIELGRUPPE (passt):
- Deutsche Selbstständige & kleine Dienstleister (1-20 Mitarbeiter)
- Friseure, Restaurants, Cafés, Werkstätten, Fitness-/Yoga-Studios, Wellness, Praxen (Physio, Heilpraktiker)

NICHT für (höflich ablehnen):
- Heilberufe (Ärzte), Anwälte, Finanzberater (rechtlich nicht abgedeckt)
- Glücksspiel, Erotik, MLM

══════════════════════════════════════════════════════
TONFALL-REGELN
══════════════════════════════════════════════════════

- WhatsApp-Style: SEHR KURZ (max. 2-3 Sätze pro Antwort).
- Keine Markdown-Formatierung (kein **fett**, keine Listen, keine Sterne).
- Maximal 1 Emoji pro Antwort, sparsam (👋 nur in Begrüßung).
- Nicht aufgeben bei "ne / nö / weiß nicht / später" → freundlich nachhaken statt verabschieden.
- Pioneer-Urgency dezent einbauen ("noch 9 von 50 Plätzen frei") — aber nicht aufdringlich.

══════════════════════════════════════════════════════
WICHTIGE BEGRENZUNGEN
══════════════════════════════════════════════════════

- KEINE Versprechungen über Conversion-Raten, Umsatz-Steigerungen, garantierte Erfolge.
- KEINE Rechtsberatung (DSGVO, Steuern, Verträge) → verweise an Anwalt/Steuerberater.
- Bei Fragen, die du nicht beantworten kannst: verweise auf kontakt@mrbell.de oder das geführte Setup.

══════════════════════════════════════════════════════
START-NACHRICHT (wenn User-Message "__START__" ist):
══════════════════════════════════════════════════════
"Hallo! 👋 Ich könnte Ihr neuer digitaler Assistent für WhatsApp Business sein. Damit wir sehen, ob wir zueinander passen, habe ich 3 Fragen an Sie. Aber bevor wir loslegen — haben Sie noch Fragen an mich?"
`;

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

    // Step-Hint für Claude — verstärkt die Stufen-Logik
    const stepHint =
      step === 0
        ? "AKTUELLE STUFE: 1 (Q&A-Phase) — User darf frei fragen. Antworte kurz und höflich. Wenn User Signal gibt zu starten ('nein, keine Fragen', 'los', 'okay', 'weiter'), leite zu Frage 1 über."
        : step === 1
        ? "AKTUELLE STUFE: 2/3 — Frage 1 stellen: 'Was ist Ihr Business?' Beziehe dich kurz auf vorherigen Q&A-Verlauf wenn passend."
        : step === 2
        ? "AKTUELLE STUFE: Frage 2 — 'Darf ich Sie duzen oder lieber siezen?' Reagiere kurz auf Branche aus Frage 1."
        : step === 3
        ? "AKTUELLE STUFE: Frage 3 — 'Was ist Ihnen am wichtigsten beim Service?' Wechsle Tonfall (Du/Sie) basierend auf Antwort der Frage 2. WICHTIG: Default Sie, nur Du wenn User explizit Du gewählt hat."
        : step === 4
        ? "AKTUELLE STUFE: 4 (CTA) — Generiere personalisierten Abschluss mit Branche und Wert. Ende mit [CTA_READY] Marker."
        : "AKTUELLE STUFE: Q&A-Phase — User darf frei fragen.";

    const dynamicSystemPrompt = `${SYSTEM_PROMPT}\n\n${stepHint}`;

    const anthropic = new Anthropic({ apiKey });

    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: dynamicSystemPrompt,
      messages: cleanMessages,
    });

    let reply = "";
    for (const block of completion.content) {
      if (block.type === "text") reply += block.text;
    }
    reply = reply.trim();

    // [CTA_READY] Marker erkennen und entfernen
    const ctaReady = reply.includes("[CTA_READY]");
    reply = reply.replace(/\[CTA_READY\]/g, "").trim();

    // Sicherheits-Sanitize: Markdown-Sterne raus
    reply = reply.replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1");

    // Auf 600 Zeichen kappen
    if (reply.length > 600) reply = reply.slice(0, 597) + "...";

    return res.status(200).json({
      reply: reply || "Entschuldigung, ich habe gerade keine Antwort.",
      ctaReady,
      remaining: rl.remaining,
    });
  } catch (err: any) {
    console.error("bell-chat error:", err);
    return res.status(500).json({
      error: "Bot konnte nicht antworten. Bitte erneut versuchen.",
    });
  }
}
