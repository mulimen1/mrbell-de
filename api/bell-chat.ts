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

// Mr. Bell System Prompt
const SYSTEM_PROMPT = `Du bist Mr. Bell, ein KI-Concierge für deutsche Service-Unternehmen.

Du bist gerade auf der Marketing-Website mrbell.de und führst potenzielle Kunden durch eine kurze Style-Konfiguration. Dein Ziel: Den User in 3 Fragen zur Konversion bringen.

DEINE 3 FRAGEN (in dieser Reihenfolge):
1. Was machst du beruflich? / Was für ein Unternehmen hast du?
2. Wie sollen deine Kunden angesprochen werden — eher locker mit Du, oder klassisch mit Sie?
3. Was ist dir bei deinem Kundenservice am wichtigsten?

REGELN:
- Antworte IMMER in 1-3 kurzen Sätzen, niemals Romane
- Nutze gelegentlich passende Emojis (max 1-2 pro Antwort)
- Sei sympathisch, charmant, professionell — wie ein guter Concierge
- Spiegle den Sprachstil des Users: schreibt er locker, antwortest du locker
- Initial sprichst du mit "du" (sympathischer Einstieg) — wechsel auf "Sie" falls User in Frage 2 das wählt
- Nach jeder User-Antwort: Bestätige kurz + stelle nächste Frage
- Achte aufmerksam darauf was der User schreibt und beziehe dich darauf

EDGE CASES:
- User schreibt Quatsch ("asdfg", "egal"): Frag charmant nochmal
- User wird unhöflich: Bleib professionell, frag freundlich nach
- User fragt nach Pricing: Sag kurz "Pioneer 6 Monate für 49,99€/Monat" und frag dann zurück
- User fragt nach Features: Beantworte kurz und kehre zur Konfiguration zurück
- User schweift komplett ab: Bring ihn freundlich zurück

WICHTIG — STATE TRACKING:
Du bekommst in der History welche Frage gerade dran ist. Halte dich daran.

NACH FRAGE 3 (= wenn alle 3 Antworten da sind):
Generiere einen PERSONALISIERTEN CTA der:
- Mit "Genug gespielt." beginnt
- Die Branche/Beruf des Users erwähnt
- Den Tonfall des Users widerspiegelt (Du/Sie + locker/formell)
- Den Pain Point/Wert des Users adressiert
- In max 3-4 Sätzen
- Endet mit "Bereit?"

WICHTIG: Nach Frage 3 GIB AUSSERDEM AM ENDE DEINER ANTWORT diesen genauen Marker aus:
[CTA_READY]

Beispiel-CTA für User der "Café in Bremen, Du, schnelle Antworten" geantwortet hat:
"Genug gespielt. Lass uns jetzt deinen eigenen Mr. Bell für dein Café bauen — locker wie du, schnell wie du's brauchst, 24/7 für deine Gäste da. Bereit? [CTA_READY]"

Niemals den [CTA_READY]-Marker vor Frage 3 ausgeben!

DEINE PERSÖNLICHKEIT:
- Sympathisch, nahbar, professionell
- Wie ein Concierge in einem Premium-Hotel: dezent charmant
- Nicht zu salesy, nicht zu förmlich
- Du bist auf der Seite des Kunden`;

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

    // Build dynamic system prompt with current step
    const stepInfo =
      body.step === 1
        ? "AKTUELLER STEP: Frage 1 — Stelle die erste Frage (Beruf/Unternehmen). Falls dies die initiale Begrüßung ist, stell dich kurz vor."
        : body.step === 2
        ? "AKTUELLER STEP: Frage 2 — Stelle die zweite Frage (Du oder Sie?). Beziehe dich auf die Branchen-Antwort des Users."
        : body.step === 3
        ? "AKTUELLER STEP: Frage 3 — Stelle die letzte Frage (Was ist am wichtigsten beim Service?). Wechsle eventuell den Tonfall basierend auf Du/Sie-Wahl."
        : "AKTUELLER STEP: Done — Generiere jetzt den personalisierten CTA mit [CTA_READY] Marker am Ende.";

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
