// Mr. Bell — Messung auf dem Server (Vercel Routing Middleware).
//
// OHNE Einwilligung (kein Skript, keine Kennung, kein Ort):
//   - Seitenaufruf: Seite, Gerätetyp und Herkunft aus den Kopfzeilen, die der Browser
//     bei jedem Abruf ohnehin sendet. Jeder Aufruf steht für sich, nichts wird verknüpft.
//   - Klick auf WhatsApp / Termin / E-Mail: über die Weiterleitungen /go/...
//   - Frage im Demo-Chat: der Besucher schickt sie selbst ab (POST /p).
//
// MIT Einwilligung (Cookie mb_analyse = Zufallskennung, gesetzt erst nach "Analyse erlauben"):
//   zusätzlich Besucherkennung, ungefährer Ort (Stadt, Bundesland, Land) und die
//   Ereignisse aus mb-mess.js (Scrollen, Verweildauer, Video, FAQ, Demo-Chat geöffnet).
//
// Die IP-Adresse wird nie weitergegeben oder gespeichert.

export const config = {
  matcher: ['/', '/index.html', '/impressum', '/impressum.html', '/datenschutz', '/datenschutz.html',
    '/agb', '/agb.html', '/avv', '/avv.html', '/widerruf', '/widerruf.html', '/bewertung', '/bewertung.html', '/go/:ziel*', '/p', '/wa']
};

const ZIEL = 'https://mrbell.app.n8n.cloud/webhook/mb-ping';
// WhatsApp-Webhook (360dialog) -> n8n. Status-Meldungen (gesendet/zugestellt/gelesen) werden hier schon beantwortet,
// nur echte Nachrichten gehen weiter - spart rund drei von vier n8n-Ausfuehrungen.
const WA_ZIEL = 'https://mrbell.app.n8n.cloud/webhook/075763a0-940e-44fe-8215-71f6a5974beb-gs-v3';

const GO = {
  'whatsapp-demo': 'https://wa.me/4915142886513?text=Test%20DEMO',
  'whatsapp-ben': 'https://wa.me/4917620690319?text=Hallo%20Herr%20Deschler%2C%20ich%20interessiere%20mich%20f%C3%BCr%20Mr.%20Bell%20f%C3%BCr%20unser%20Haus.',
  'termin': 'https://zeeg.me/kontakt6231/gespraech-ueber-mr-bell',
  'mail': 'mailto:kontakt@mrbell.de',
  'mail-termin': 'mailto:kontakt@mrbell.de?subject=Terminwunsch%20Mr.%20Bell',
  'mail-frage': 'mailto:kontakt@mrbell.de?subject=Frage%20zu%20Mr.%20Bell'
};
const GO_EREIGNIS = {
  'whatsapp-demo': ['WhatsApp geklickt', 'Demo testen'],
  'whatsapp-ben': ['WhatsApp geklickt', 'an Ben'],
  'termin': ['Termin geklickt', ''],
  'mail': ['E-Mail geklickt', ''],
  'mail-termin': ['E-Mail geklickt', 'Terminwunsch'],
  'mail-frage': ['E-Mail geklickt', 'Frage']
};
const RECHT = { impressum: 'Impressum', datenschutz: 'Datenschutz', agb: 'AGB', avv: 'AVV', widerruf: 'Widerruf' };
const MIT_EINWILLIGUNG = ['Analyse erlaubt', 'Gescrollt', 'Ganz unten angekommen', 'Länger als 30 Sekunden', 'Verweildauer',
  'Video gestartet', 'Video angesehen', 'FAQ aufgeklappt', 'Demo-Chat geöffnet'];
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|whatsapp\/|curl|wget|python|java\/|go-http|monitor|uptime|vercel/i;

function weiter() { return new Response(null, { headers: { 'x-middleware-next': '1' } }); }
function kurz(v, n) { return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, n); }
function dek(v) { if (!v) return ''; try { return decodeURIComponent(v); } catch (e) { return v; } }

function geraet(ua) {
  if (!ua) return '';
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'Tablet';
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'Handy';
  return 'Rechner';
}
function herkunft(ref, url) {
  if (!ref) return 'Direkt';
  try {
    const h = new URL(ref).hostname.replace(/^www\./, '');
    if (h === url.hostname.replace(/^www\./, '')) return 'mrbell.de';
    if (/google\./.test(h)) return 'Google';
    if (/bing\./.test(h)) return 'Bing';
    if (/duckduckgo\./.test(h)) return 'DuckDuckGo';
    if (/ecosia\./.test(h)) return 'Ecosia';
    if (/linkedin\./.test(h)) return 'LinkedIn';
    if (/(facebook|fb)\./.test(h)) return 'Facebook';
    if (/instagram\./.test(h)) return 'Instagram';
    if (/claude\.ai$/.test(h)) return 'claude.ai';
    return h.slice(0, 40);
  } catch (e) { return 'Direkt'; }
}
// Einwilligung: Cookie mb_analyse = "a" + 12 Hexzeichen. "nein" oder fehlend = keine Einwilligung.
function kennung(req) {
  const c = req.headers.get('cookie') || '';
  const m = /(?:^|;\s*)mb_analyse=(a[0-9a-f]{12})(?:;|$)/.exec(c);
  return m ? m[1] : '';
}
function intern(req) { return /(?:^|;\s*)mb_intern=1(?:;|$)/.test(req.headers.get('cookie') || ''); }

function melden(daten, req, ctx) {
  const id = kennung(req);
  if (id) {
    daten.sitzung = id;
    daten.stadt = kurz(dek(req.headers.get('x-vercel-ip-city')), 40);
    daten.region = kurz(req.headers.get('x-vercel-ip-country-region'), 10);
    daten.land = kurz(req.headers.get('x-vercel-ip-country'), 4);
  } else {
    daten.sitzung = '';
  }
  const p = fetch(ZIEL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(daten) })
    .catch(function () {});
  if (ctx && typeof ctx.waitUntil === 'function') { ctx.waitUntil(p); return null; }
  return p;
}

export default async function middleware(req, ctx) {
  let url;
  try { url = new URL(req.url); } catch (e) { return weiter(); }
  // 0) WhatsApp-Webhook: nur Nachrichten an n8n, Status-Meldungen sofort mit 200 beantworten
  if (url.pathname === '/wa') {
    if (req.method !== 'POST') return new Response('ok', { status: 200, headers: { 'Cache-Control': 'no-store' } });
    try {
      const roh = await req.text();
      let nurStatus = false;
      try { const v = JSON.parse(roh).entry[0].changes[0].value; nurStatus = !!(v && v.statuses && !v.messages); } catch (e) { nurStatus = false; }
      if (nurStatus) return new Response(null, { status: 200 });
      const r = await fetch(WA_ZIEL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: roh });
      return new Response(null, { status: r.ok ? 200 : 502 });
    } catch (e) {
      return new Response(null, { status: 502 });
    }
  }
  const ua = req.headers.get('user-agent') || '';
  const bot = BOT.test(ua);

  try {
    // 1) Weiterleitungen für Kontakt-Klicks
    if (url.pathname.indexOf('/go/') === 0) {
      const ziel = url.pathname.slice(4).replace(/\/+$/, '');
      const nach = GO[ziel];
      if (!nach) return weiter();
      if (!bot && !intern(req)) {
        const e = GO_EREIGNIS[ziel];
        const wo = kurz(url.searchParams.get('wo'), 30);
        const offen = melden({ ereignis: e[0], detail: e[1] + (wo ? (e[1] ? ' · ' : '') + wo : ''), seite: kurz(url.searchParams.get('von') || '', 60),
          herkunft: '', geraet: geraet(ua), sprache: '' }, req, ctx);
        if (offen) await Promise.race([offen, new Promise(function (r) { setTimeout(r, 1500); })]);
      }
      return new Response(null, { status: 302, headers: { Location: nach, 'Cache-Control': 'no-store' } });
    }

    // 2) Ereignisse aus dem Browser (Demo-Chat-Frage immer, alles andere nur mit Einwilligung)
    if (url.pathname === '/p') {
      if (req.method !== 'POST') return new Response(null, { status: 405 });
      if (bot || intern(req)) return new Response(null, { status: 204 });
      let d;
      try { d = JSON.parse((await req.text()).slice(0, 6000)); } catch (e) { return new Response(null, { status: 400 }); }
      if (!d || typeof d !== 'object') return new Response(null, { status: 400 });
      const ereignis = kurz(d.ereignis, 40);
      const chat = ereignis === 'Demo-Chat-Frage';
      if (!chat && (MIT_EINWILLIGUNG.indexOf(ereignis) < 0 || !kennung(req))) return new Response(null, { status: 204 });
      const daten = { ereignis: ereignis, detail: kurz(d.detail, 60), seite: kurz(d.seite, 60), herkunft: '', geraet: geraet(ua),
        sprache: kennung(req) ? kurz((req.headers.get('accept-language') || '').split(',')[0], 10) : '' };
      if (chat) { daten.frage = kurz(d.frage, 600); daten.antwort = kurz(d.antwort, 2000); }
      const offen = melden(daten, req, ctx);
      if (offen) await Promise.race([offen, new Promise(function (r) { setTimeout(r, 1500); })]);
      return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    }

    // 3) Seitenaufruf (nur echte Seitenabrufe, keine Vorab-Ladevorgänge)
    if (req.method === 'GET' && !bot && !intern(req)) {
      const vorab = /prefetch|prerender/i.test((req.headers.get('sec-purpose') || '') + (req.headers.get('purpose') || '') + (req.headers.get('x-purpose') || ''));
      const html = /text\/html/.test(req.headers.get('accept') || '');
      if (!vorab && html) {
        const name = url.pathname.replace(/^\/|\.html$/g, '');
        const recht = RECHT[name];
        const daten = { ereignis: recht ? 'Rechtstext geöffnet' : 'Seite geöffnet', detail: recht || '', seite: url.pathname,
          herkunft: herkunft(req.headers.get('referer') || '', url), geraet: geraet(ua), sprache: '' };
        if (kennung(req)) daten.sprache = kurz((req.headers.get('accept-language') || '').split(',')[0], 10);
        const offen = melden(daten, req, ctx);
        if (offen) await Promise.race([offen, new Promise(function (r) { setTimeout(r, 800); })]);
      }
    }
  } catch (e) {}
  return weiter();
}
