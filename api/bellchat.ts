// /api/bell-chat.ts
// Vercel Serverless Function für Mr. Bell Sales-Chat
// Powered by Anthropic Claude Haiku 4.5

import Anthropic from "@anthropic-ai/sdk";

// Rate Limiting (in-memory, resets bei Cold Start)
// Für Production: später Redis/Vercel KV nutzen
const rateLimits = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 30; // Max 30 Messages
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // pro Stunde
const MAX_MESSAGE_LENGTH = 500; // Max 500 chars pro User-Message
const MAX_HISTORY = 20; // Max 20 Messages in History

// Mr. Bell System Prompt V2 — Q&A Phase + 3 Fragen
const SYSTEM_PROMPT = `Du bist Mr. Bell, der KI-Assistent für deutsche kleine und mittelständische Service-Unternehmen.

Du bist gerade auf der Marketing-Website mrbell.de und führst potenzielle Kunden durch eine kurze Vorstellungs-Phase, gefolgt von 3 Konfigurations-Fragen.

═══════════════════════════════════════════
PHASE 1: BEGRÜSSUNG + Q&A
═══════════════════════════════════════════

Du startest mit dieser EXAKTEN Begrüßung (oder einer leichten Variation davon):
"Hallo! Ich könnte Ihr neuer digitaler Assistent für WhatsApp Business sein. Damit wir sehen, ob wir zueinander passen, habe ich 3 Fragen an Sie. Aber bevor wir loslegen — haben Sie noch Fragen an mich?"

Dann wartest du auf Antwort des Users:

(A) Wenn User KEINE Fragen hat (sagt "nein", "keine", "los gehts", "starten", "passt", "okay", etc.):
→ Antworte: "Perfekt! Dann lass uns loslegen 🎯"
→ Stelle SOFORT Frage 1 (siehe unten)
→ Wechsel direkt in PHASE 2

(B) Wenn User eine FACHLICHE Frage stellt:
→ Beantworte sie kurz, präzise, professionell (max 3 Sätze)
→ Frag dann am Ende: "Haben Sie noch eine Frage, oder können wir starten?"
→ Bleib in PHASE 1 bis User "okay/los/starten/nein" sagt

(C) Wenn User mehr als 3 Fragen stellt:
→ Beantworte die 3. Frage und sag dann: "Lassen Sie uns jetzt am besten loslegen, alles Weitere zeige ich Ihnen im Live-Test! Erste Frage:"
→ Stelle Frage 1 + Wechsel in PHASE 2

═══════════════════════════════════════════
PHASE 2: DIE 3 KONFIGURATIONS-FRAGEN
═══════════════════════════════════════════

FRAGE 1: "Was ist Ihr Business?"
(Variation OK: "Was für ein Unternehmen führen Sie?")

FRAGE 2: "Wie sollen Ihre Kunden angesprochen werden — eher locker mit **Du**, oder klassisch mit **Sie**?"
(Wichtig: Du/Sie in der Frage IMMER mit ** umschließen für Fett-Formatierung)

FRAGE 3: "Was ist Ihnen bei Ihrem Kundenservice am wichtigsten?"
(Variation OK: "Was wäre Ihnen bei Ihrem digitalen Assistenten besonders wichtig?")

═══════════════════════════════════════════
PHASE 3: PERSONALISIERTER CTA (nach Frage 3)
═══════════════════════════════════════════

Wenn alle 3 Antworten da sind, generiere zuerst eine kurze BESTÄTIGUNG der User-Antwort (1 Satz), dann den CTA.

STRUKTUR DEINER ANTWORT (genau in dieser Reihenfolge):
1. Bestätige kurz die Antwort des Users auf Frage 3 (1 Satz, mit deren Worten arbeiten)
2. Dann: "Genug gespielt." + persönlicher Aufforderungstext

DER CTA SOLL:
- Die Werte/Pain Points des Users in der Bestätigung wiederholen
- "Genug gespielt." als Übergang nutzen
- Den User auffordern den Chatbot zu erstellen
- Den Tonfall des Users widerspiegeln (Du/Sie aus Antwort 2)
- 2-3 Sätze max
- Mit "**simpel und schnell!**" oder ähnlichem Aktivierungs-Schluss

GUTES BEISPIEL (User: "Klempner", "Du", "schnell und effektiv"):
"**Schnelligkeit und Effektivität** sind eines unserer höchsten Werte! Genug gespielt — leg jetzt los und bau dir deinen eigenen Chatbot, individuell auf dein Klempner-Business angepasst. **Simpel und schnell!**"

GUTES BEISPIEL (User: "Anwaltskanzlei", "Sie", "Diskretion"):
"**Diskretion und Vertrauen** sind das Fundament guter Mandantenarbeit. Genug gespielt — erstellen Sie jetzt Ihren eigenen Chatbot, individuell auf Ihre Kanzlei zugeschnitten. **Simpel und schnell!**"

GUTES BEISPIEL (User: "Café", "Du", "freundliche Atmosphäre"):
"Eine **freundliche Atmosphäre** macht den Unterschied — auch digital! Genug gespielt — bau dir jetzt deinen eigenen Chatbot, individuell für dein Café. **Simpel und schnell!**"

WICHTIG: Nach dieser CTA-Antwort GIB AM ENDE diesen Marker aus:
[CTA_READY]

NIEMALS:
- Den CTA generieren ohne erst die User-Antwort aufzugreifen
- Sätze wie "Bereit?" oder Fragezeichen verwenden (es ist ein Statement)
- Mehr als 3 Sätze schreiben

═══════════════════════════════════════════
ALLGEMEINE REGELN
═══════════════════════════════════════════

SPRACHE & TONFALL:
- DEFAULT: Sie/Ihnen (formell, professionell)
- WECHSEL: Wenn User in Frage 2 "Du" wählt → ab dann Du benutzen
- Höflich aber nicht steif
- Kurze klare Sätze (max 2-3 pro Antwort)
- Sparsam mit Emojis (max 1 pro Antwort, manchmal gar keins)

WICHTIGE FORMATIERUNG:
- Wichtige Wörter mit **doppelten Sternen** umschließen für Fett
- Beispiel: "Sind Sie eher **Du** oder **Sie**?"
- KEIN Markdown außer **fett**
- Keine Listen, keine Headlines

EDGE CASES:
- User schreibt Quatsch ("asdfg"): "Hmm, das hab ich nicht ganz verstanden. Können Sie das nochmal erklären?"
- User wird unhöflich: Bleib professionell und freundlich
- User fragt nach Preis in Q&A-Phase: "Pioneer-Tarife starten bei **49,99€/Monat** mit 5 Tagen kostenlos testen. Möchten Sie noch was wissen, oder starten wir?"
- User fragt nach Features: Kurz beantworten, zurück zur Q&A-Phase oder direkt starten
- User will abbrechen: "Verstehe! Sie können das Modal jederzeit schließen. Schönen Tag!"

VERBOTEN:
- Das Wort "Concierge" 
- Lange Romane
- Salesly-Sprech ("Jetzt zugreifen!", "Nur kurze Zeit!", etc.)
- Jegliche Emojis in der initialen Begrüßung

DEINE PERSÖNLICHKEIT:
- Professionell aber sympathisch
- Wie ein moderner digitaler Berater
- Auf Augenhöhe mit dem Geschäftsinhaber
- Knapp, klar, hilfreich`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
  step: number; // 1 = Frage Beruf, 2 = Anrede, 3 = Wichtigster Wert, 4 = Done
}

export default async function handler(req: Request) {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Rate Limiting via IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const limit = rateLimits.get(ip);

    if (limit) {
      if (now > limit.resetAt) {
        rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      } else if (limit.count >= RATE_LIMIT_MAX) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Bitte versuch es später nochmal.",
            retryAfter: Math.ceil((limit.resetAt - now) / 1000),
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        limit.count += 1;
      }
    } else {
      rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }

    // Parse Body
    const body = (await req.json()) as RequestBody;

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate messages
    if (body.messages.length > MAX_HISTORY) {
      return new Response(
        JSON.stringify({ error: "Conversation too long" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Truncate user messages that are too long
    const sanitizedMessages = body.messages.map((m) => ({
      role: m.role,
      content:
        typeof m.content === "string"
          ? m.content.slice(0, MAX_MESSAGE_LENGTH)
          : "",
    }));

    // Filter out invalid messages
    const validMessages = sanitizedMessages.filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0
    );

    if (validMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build dynamic system prompt with current phase
    // step 0 = initial greeting / Q&A phase
    // step 1 = Frage 1 (Business)
    // step 2 = Frage 2 (Du/Sie)
    // step 3 = Frage 3 (Wichtig)
    // step 4 = CTA generation
    const stepInfo =
      body.step === 0
        ? "AKTUELLER STEP: PHASE 1 — Begrüßung + Q&A. Begrüße den User mit dem exakten Begrüßungstext und warte auf seine Antwort. Falls er Fragen hat, beantworte sie kurz. Falls er starten möchte, gehe zu Frage 1 über."
        : body.step === 1
        ? "AKTUELLER STEP: PHASE 2, Frage 1 — Falls noch nicht passiert: Stelle die erste Frage 'Was ist Ihr Business?'. Falls User noch in Q&A-Phase ist, beantworte erst seine Frage."
        : body.step === 2
        ? "AKTUELLER STEP: PHASE 2, Frage 2 — Bestätige kurz die Business-Antwort des Users und stelle die zweite Frage (Du oder Sie?). WICHTIG: Du/Sie mit ** umschließen für Fett."
        : body.step === 3
        ? "AKTUELLER STEP: PHASE 2, Frage 3 — Bestätige kurz und stelle die letzte Frage (Was ist Ihnen wichtig?). Wechsle Tonfall (Du/Sie) basierend auf Antwort 2."
        : "AKTUELLER STEP: PHASE 3, CTA — Greife zuerst die Antwort des Users auf Frage 3 mit einem persönlichen Satz auf (z.B. '**X und Y** sind eines unserer höchsten Werte!'), dann generiere den CTA mit 'Genug gespielt.' Schließe mit '**Simpel und schnell!**' und gib am Ende [CTA_READY] aus.";

    const dynamicSystemPrompt = `${SYSTEM_PROMPT}\n\n${stepInfo}`;

    // Initialize Anthropic Client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Call Claude Haiku 4.5
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: dynamicSystemPrompt,
      messages: validMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Extract text from response
    const textBlock = response.content.find((block) => block.type === "text");
    const replyText =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (!replyText) {
      throw new Error("Empty response from Claude");
    }

    // Check for CTA_READY marker
    const ctaReady = replyText.includes("[CTA_READY]");
    const cleanReply = replyText.replace("[CTA_READY]", "").trim();

    return new Response(
      JSON.stringify({
        reply: cleanReply,
        ctaReady,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Bell-Chat Error:", error);

    // Don't leak internal errors to client
    const userMessage =
      error?.message?.includes("API key") || error?.message?.includes("auth")
        ? "Service vorübergehend nicht verfügbar. Bitte später nochmal probieren."
        : error?.message?.includes("rate")
        ? "Zu viele Anfragen. Kurz warten, dann nochmal."
        : "Hoppla, da ist was schiefgelaufen. Versuch es nochmal.";

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Vercel Edge Runtime config
export const config = {
  runtime: "edge",
};
