// /api/_resend.ts
// Helper zum Versenden von Emails über Resend.
// 3 Email-Typen:
//   1. sendVerificationCode  → 6-stelliger Code für Email-Verify im Onboarding
//   2. sendOrderConfirmation → Bestellbestätigung an Kunde nach Kauf
//   3. sendInternalNotification → Notification an dich (kontakt@mrbell.de)

const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = "Mr. Bell <kontakt@mrbell.de>";
const NOTIFY_TO = "kontakt@mrbell.de";

async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<{ ok: boolean; error?: string; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[resend] RESEND_API_KEY missing");
    return { ok: false, error: "no_api_key" };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ""),
      }),
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[resend] Send failed:", res.status, data);
      return { ok: false, error: data?.message || `status_${res.status}` };
    }
    console.log("[resend] Sent OK, id:", data?.id);
    return { ok: true, id: data?.id };
  } catch (err: any) {
    console.error("[resend] Exception:", err?.message);
    return { ok: false, error: err?.message || "unknown" };
  }
}

// ═══════════════════════════════════════════════════════════
// 1. Verification-Code Email
// ═══════════════════════════════════════════════════════════
export async function sendVerificationCode(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Inter',Helvetica,Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 8px 24px rgba(26,26,46,0.06);">
        <tr><td>
          <h1 style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:28px;color:#1a1a2e;font-weight:600;">Mr. Bell</h1>
          <p style="margin:0 0 32px;color:#1a1a2e;opacity:0.55;font-size:13px;">Service, der auffällt</p>

          <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a2e;">Ihr Bestätigungscode</h2>
          <p style="margin:0 0 24px;color:#1a1a2e;opacity:0.7;font-size:15px;line-height:1.6;">
            Bitte geben Sie den folgenden Code im Onboarding ein, um Ihre Email-Adresse zu bestätigen:
          </p>

          <div style="background:#fef3ec;border:2px solid #C2410C;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:700;color:#C2410C;letter-spacing:8px;">${code}</span>
          </div>

          <p style="margin:0 0 8px;color:#1a1a2e;opacity:0.55;font-size:13px;">
            Der Code ist 15 Minuten gültig.
          </p>
          <p style="margin:0;color:#1a1a2e;opacity:0.55;font-size:13px;">
            Falls Sie das Onboarding nicht gestartet haben, ignorieren Sie diese Email.
          </p>

          <hr style="border:0;border-top:1px solid #e5e5e0;margin:32px 0;">
          <p style="margin:0;color:#1a1a2e;opacity:0.45;font-size:12px;">
            Mr. Bell · kontakt@mrbell.de · <a href="https://mrbell.de" style="color:#C2410C;text-decoration:none;">mrbell.de</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `Mr. Bell — Ihr Bestätigungscode\n\n${code}\n\nDer Code ist 15 Minuten gültig.\nFalls Sie das Onboarding nicht gestartet haben, ignorieren Sie diese Email.\n\nMr. Bell · kontakt@mrbell.de · mrbell.de`;

  return sendEmail(email, `Ihr Mr. Bell Bestätigungscode: ${code}`, html, text);
}

// ═══════════════════════════════════════════════════════════
// 2. Bestellbestätigung an Kunde
// ═══════════════════════════════════════════════════════════
export async function sendOrderConfirmation(email: string, data: {
  firma: string;
  plan: string;
  total: string;
  setupIncluded: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const planLabels: { [key: string]: string } = {
    "pioneer_6": "Pioneer 6 Monate (49,99€/Monat)",
    "pioneer_3": "Pioneer 3 Monate (69,99€/Monat)",
    "standard": "Standard (79,99€/Monat)",
  };
  const planLabel = planLabels[data.plan] || data.plan;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Inter',Helvetica,Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 8px 24px rgba(26,26,46,0.06);">
        <tr><td>
          <h1 style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:28px;color:#1a1a2e;font-weight:600;">Mr. Bell</h1>
          <p style="margin:0 0 32px;color:#1a1a2e;opacity:0.55;font-size:13px;">Service, der auffällt</p>

          <h2 style="margin:0 0 12px;font-size:22px;color:#1a1a2e;">Willkommen an Bord, ${escapeHtml(data.firma)}! 🛎️</h2>
          <p style="margin:0 0 24px;color:#1a1a2e;opacity:0.75;font-size:15px;line-height:1.6;">
            Vielen Dank für Ihre Bestellung. Wir freuen uns sehr, dass Sie zu unseren Pioneer-Partnern gehören.
          </p>

          <div style="background:#f5f5f0;border-radius:12px;padding:20px;margin:0 0 24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#1a1a2e;opacity:0.55;text-transform:uppercase;letter-spacing:0.5px;">Ihre Bestellung</p>
            <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#1a1a2e;">${escapeHtml(planLabel)}</p>
            ${data.setupIncluded ? '<p style="margin:0 0 4px;font-size:14px;color:#1a1a2e;opacity:0.7;">+ Geführtes Setup (99€ einmalig, 100% Rückerstattung nach 6 Monaten)</p>' : ''}
            <p style="margin:8px 0 0;font-size:18px;font-weight:600;color:#C2410C;">Heute gezahlt: ${escapeHtml(data.total)}</p>
          </div>

          <h3 style="margin:0 0 12px;font-size:17px;color:#1a1a2e;">So geht's weiter:</h3>
          <ol style="margin:0 0 24px;padding-left:20px;color:#1a1a2e;opacity:0.8;font-size:14px;line-height:1.8;">
            <li>Wir prüfen Ihre Daten und richten Ihren Bot ein.</li>
            ${data.setupIncluded ? '<li>Wir melden uns innerhalb von 24h für die Terminbuchung des Setup-Calls.</li>' : '<li>Innerhalb von 24h erhalten Sie Zugang zu Ihrem Bot-Dashboard.</li>'}
            <li>Sobald Ihr Bot live ist, beginnen Ihre 5 Tage kostenlose Testphase.</li>
          </ol>

          <p style="margin:0 0 8px;color:#1a1a2e;opacity:0.7;font-size:14px;">
            Bei Fragen erreichen Sie uns jederzeit unter <a href="mailto:kontakt@mrbell.de" style="color:#C2410C;text-decoration:none;">kontakt@mrbell.de</a>.
          </p>

          <hr style="border:0;border-top:1px solid #e5e5e0;margin:32px 0;">
          <p style="margin:0;color:#1a1a2e;opacity:0.45;font-size:12px;line-height:1.6;">
            Mr. Bell · Ben Deschler · Scheibenstr. 2, 76530 Baden-Baden<br>
            <a href="https://mrbell.de" style="color:#C2410C;text-decoration:none;">mrbell.de</a> · <a href="https://mrbell.de/agb.html" style="color:#1a1a2e;opacity:0.6;text-decoration:none;">AGB</a> · <a href="https://mrbell.de/widerruf.html" style="color:#1a1a2e;opacity:0.6;text-decoration:none;">Widerruf</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return sendEmail(email, `Willkommen bei Mr. Bell — Bestellung bestätigt 🛎️`, html);
}

// ═══════════════════════════════════════════════════════════
// 3. Notification an dich (intern)
// ═══════════════════════════════════════════════════════════
export async function sendInternalNotification(data: {
  firma: string;
  email: string;
  plan: string;
  total: string;
  branche?: string;
  telefon?: string;
  whatsapp?: string;
  sessionId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#fff;font-family:'Inter',Helvetica,Arial,sans-serif;color:#1a1a2e;">
  <h2 style="margin:0 0 16px;font-size:20px;color:#C2410C;">🎉 Neuer Mr. Bell Kauf!</h2>

  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px;width:100%;max-width:560px;">
    <tr><td style="border-bottom:1px solid #eee;font-weight:600;width:140px;">Firma</td><td style="border-bottom:1px solid #eee;">${escapeHtml(data.firma)}</td></tr>
    <tr><td style="border-bottom:1px solid #eee;font-weight:600;">Email</td><td style="border-bottom:1px solid #eee;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
    <tr><td style="border-bottom:1px solid #eee;font-weight:600;">Plan</td><td style="border-bottom:1px solid #eee;">${escapeHtml(data.plan)}</td></tr>
    <tr><td style="border-bottom:1px solid #eee;font-weight:600;">Total</td><td style="border-bottom:1px solid #eee;color:#C2410C;font-weight:600;">${escapeHtml(data.total)}</td></tr>
    ${data.branche ? `<tr><td style="border-bottom:1px solid #eee;font-weight:600;">Branche</td><td style="border-bottom:1px solid #eee;">${escapeHtml(data.branche)}</td></tr>` : ''}
    ${data.telefon ? `<tr><td style="border-bottom:1px solid #eee;font-weight:600;">Telefon</td><td style="border-bottom:1px solid #eee;">${escapeHtml(data.telefon)}</td></tr>` : ''}
    ${data.whatsapp ? `<tr><td style="border-bottom:1px solid #eee;font-weight:600;">WhatsApp</td><td style="border-bottom:1px solid #eee;">${escapeHtml(data.whatsapp)}</td></tr>` : ''}
    ${data.sessionId ? `<tr><td style="border-bottom:1px solid #eee;font-weight:600;">Stripe-ID</td><td style="border-bottom:1px solid #eee;font-family:monospace;font-size:11px;">${escapeHtml(data.sessionId)}</td></tr>` : ''}
  </table>

  <p style="margin:24px 0 0;font-size:13px;color:#666;">
    Vollständige Daten im <a href="https://docs.google.com/spreadsheets/" style="color:#C2410C;">Master-Sheet</a>.
  </p>
</body></html>`;

  return sendEmail(NOTIFY_TO, `🛎️ Neuer Kauf: ${data.firma} — ${data.plan}`, html);
}

// Util
function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
