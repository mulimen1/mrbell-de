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
  matcher: ['/', '/index.html', '/tutor', '/tutor/', '/tutor/index.html', '/bm', '/gs', '/impressum', '/impressum.html', '/datenschutz', '/datenschutz.html',
    '/agb', '/agb.html', '/avv', '/avv.html', '/widerruf', '/widerruf.html', '/kuendigen', '/kuendigen.html', '/widerrufen', '/widerrufen.html', '/bewertung', '/bewertung.html', '/go/:ziel*', '/p', '/wa', '/zahlen', '/lernen', '/lernen/:slug*', '/ueben', '/ueben/:slug*', '/internet-und-ki', '/internet-fuehrerschein', '/ratgeber', '/ratgeber/:slug*', '/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt']
};

const ZIEL = 'https://hub.mrbell.de/n8n/webhook/mb-ping';
// WhatsApp-Webhook (360dialog) -> n8n. Status-Meldungen (gesendet/zugestellt/gelesen) werden hier schon beantwortet,
// nur echte Nachrichten gehen weiter - spart rund drei von vier n8n-Ausfuehrungen.
const WA_ZIEL = 'https://hub.mrbell.de/n8n/webhook/075763a0-940e-44fe-8215-71f6a5974beb-gs-v3';

const GO = {
  'whatsapp-demo': 'https://wa.me/4915142886513?text=Test%20DEMO',
  'whatsapp-anruf': 'https://wa.me/4915142886513?text=Ich%20m%C3%B6chte%20mit%20der%20Rezeption%20von%20Mr.%20Bell%20telefonieren',
  'whatsapp-ben': 'https://wa.me/4917620690319?text=Hallo%20Herr%20Deschler%2C%20ich%20interessiere%20mich%20f%C3%BCr%20Mr.%20Bell%20f%C3%BCr%20unser%20Haus.',
  'termin': 'https://zeeg.me/kontakt6231/gespraech-ueber-mr-bell',
  'mail': 'mailto:kontakt@mrbell.de',
  'mail-termin': 'mailto:kontakt@mrbell.de?subject=Terminwunsch%20Mr.%20Bell',
  'mail-frage': 'mailto:kontakt@mrbell.de?subject=Frage%20zu%20Mr.%20Bell'
};
const GO_EREIGNIS = {
  'whatsapp-demo': ['WhatsApp geklickt', 'Demo testen'],
  'whatsapp-anruf': ['WhatsApp geklickt', 'Anruf testen'],
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
  // Ben: Rechner mit Standort Amsterdam (VPN) ist er selbst -> gar nicht erst erfassen
  if (daten.geraet === 'Rechner' && /^amsterdam$/i.test(dek(req.headers.get('x-vercel-ip-city')).trim())) return null;
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

// ---------- Grundschulmax: eigene Messung (n8n-Tabelle gsm_ev) ----------
// Ohne Einwilligung: nur das Ereignis und der Gerätetyp, keine Kennung, kein Ort, keine Herkunft.
// Mit Einwilligung (Cookie gsm_analyse = Zufallskennung): zusätzlich Kennung, ungefährer Ort und Herkunft (Anzeige, Link).
const GS_ZIEL = 'https://hub.mrbell.de/n8n/webhook/gsm-mess-84d470';
const GS_EV = ['Seite geöffnet', 'Rechtstext geöffnet', 'Analyse erlaubt', 'Analyse abgelehnt', 'Ausprobieren geklickt', 'Einloggen geklickt', 'Klasse gewählt',
  'Tutorial', 'Lektion gestartet', 'Lektion fertig', 'Lektion abgebrochen', 'Erste Lektion gestartet', 'Erste Lektion fertig', 'Erste Lektion abgebrochen',
  'Spiel gestartet', 'Spiel fertig', 'Spiel abgebrochen', 'Erstes Spiel gestartet', 'Erstes Spiel fertig', 'Erstes Spiel abgebrochen',
  'Probe zu Ende', 'Abo-Fenster geöffnet', 'Abo-Fenster geschlossen', 'Tarif gewählt', 'Zur Zahlung geklickt', 'Abo abgeschlossen',
  'Anmeldefenster geöffnet', 'Code angefordert', 'Angemeldet', 'Konto erstellt', 'Fach geöffnet', 'Bereich geöffnet', 'Hausaufgabe hochgeladen', 'Hausaufgabe Ergebnis',
  'Profil gespeichert', 'Hilfe geöffnet', 'Klick', 'Seite verlassen', 'Lernpfad Level', 'Klasse gewechselt', 'Startseite gescrollt', 'Zurückgekommen',
  'Lobby geöffnet', 'Lobby verlassen', 'Lobby Tour', 'Lobby Spielen', 'Lobby Name gesetzt', 'Lobby Figur gewählt', 'Lobby Haustier gewählt', 'Lobby Beruf gewechselt', 'Lobby Bereich',
  'Lobby Aufgabe abgeholt', 'Lobby Einrichten geklickt', 'Lobby Fehler', 'Level erreicht', 'Zahlung abgebrochen', 'Tarif angetippt', 'Infoseite geöffnet', 'Probetest fertig',
  'Hausaufgaben-Spiel fertig', 'Fortschritt zurückgesetzt', 'Bildschirm', 'Abgesprungen', 'Eltern-Hinweis gezeigt', 'Eltern-Hinweis geklickt',
  'Übungsseite geöffnet', 'Übung gestartet', 'Übung gelöst', 'Übung zur App', 'Arbeitsblatt gedruckt'];
function gsKennung(req) { const m = /(?:^|;\s*)gsm_analyse=(a[0-9a-f]{12})(?:;|$)/.exec(req.headers.get('cookie') || ''); return m ? m[1] : ''; }
function gsIntern(req) { return /(?:^|;\s*)gsm_intern=1(?:;|$)/.test(req.headers.get('cookie') || '') || /^amsterdam$/i.test(dek(req.headers.get('x-vercel-ip-city')).trim()); }
function gsQuelle(url, ref) {
  const p = url.searchParams, utm = kurz(p.get('utm_source') || '', 20).toLowerCase();
  if (p.get('fbclid') || /^(facebook|fb|instagram|ig|meta)$/.test(utm)) return 'Facebook/Instagram Ads';
  if (p.get('gclid') || p.get('gbraid') || p.get('wbraid')) return 'Google Ads';
  if (utm) return 'Kampagne: ' + utm;
  if (p.get('ref')) return 'Link: ' + kurz(p.get('ref'), 24);
  const h = herkunft(ref || '', url); return h === 'mrbell.de' || /grundschulmax/.test(h) ? '' : h;
}
function gsMelden(d, req, ctx) {
  if (gsIntern(req)) return null;
  const id = gsKennung(req);
  d.sitzung = id;
  if (id) { d.stadt = kurz(dek(req.headers.get('x-vercel-ip-city')), 40); d.region = kurz(req.headers.get('x-vercel-ip-country-region'), 10); d.land = kurz(req.headers.get('x-vercel-ip-country'), 4); }
  else { d.quelle = d.quelle === 'Facebook/Instagram Ads' ? d.quelle : ''; d.stadt = ''; d.region = ''; d.land = ''; }
  const p = fetch(GS_ZIEL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-gsm': 'mw1' }, body: JSON.stringify(d) }).catch(function () {});
  if (ctx && typeof ctx.waitUntil === 'function') { ctx.waitUntil(p); return null; }
  return p;
}
function gsSeite(req, ctx, url, recht) {
  const ua = req.headers.get('user-agent') || '';
  if (req.method !== 'GET' || BOT.test(ua) || !/text\/html/.test(req.headers.get('accept') || '')) return;
  if (/prefetch|prerender/i.test((req.headers.get('sec-purpose') || '') + (req.headers.get('purpose') || ''))) return;
  gsMelden({ ereignis: recht ? 'Rechtstext geöffnet' : 'Seite geöffnet', detail: recht || '', seite: url.pathname.slice(0, 40), quelle: gsQuelle(url, req.headers.get('referer')), geraet: geraet(ua) }, req, ctx);
}
/* Übungsseiten: Aufruf zählt jetzt die Seite selbst (u.js), erst wenn sie 1 s sichtbar war. Funktion bleibt als Reserve. */
function gsUeben(req, ctx, url, slug) {
  const ua = req.headers.get('user-agent') || '';
  if (req.method !== 'GET' || BOT.test(ua) || !/text\/html/.test(req.headers.get('accept') || '')) return;
  if (/prefetch|prerender/i.test((req.headers.get('sec-purpose') || '') + (req.headers.get('purpose') || ''))) return;
  gsMelden({ ereignis: 'Übungsseite geöffnet', detail: slug || 'Übersicht', seite: url.pathname.slice(0, 40), quelle: gsQuelle(url, req.headers.get('referer')), geraet: geraet(ua) }, req, ctx);
}
async function gsEreignis(req, ctx) {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  const ua = req.headers.get('user-agent') || '';
  if (BOT.test(ua)) return new Response(null, { status: 204 });
  let d; try { d = JSON.parse((await req.text()).slice(0, 2000)); } catch (e) { return new Response(null, { status: 400 }); }
  const e = kurz(d && d.e, 40); if (GS_EV.indexOf(e) < 0) return new Response(null, { status: 204 });
  // Freitext absichern: keine E-Mail-Adressen, keine langen Zahlen
  const det = kurz(d.d, 60).replace(/\S+@\S+/g, '…').replace(/\d{5,}/g, '…');
  const offen = gsMelden({ ereignis: e, detail: det, seite: kurz(d.s, 40), quelle: kurz(d.q, 40), geraet: geraet(ua) }, req, ctx);
  if (offen) await Promise.race([offen, new Promise(function (r) { setTimeout(r, 1500); })]);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

// ---------- BWL Max: Seitenaufruf ohne Kennung, Ereignisse nur mit Einwilligung (Cookie bm_analyse) ----------
const BM_ZIEL = 'https://hub.mrbell.de/n8n/webhook/bm-ping';
const BM_EREIGNISSE = ['Google-Knopf fehlt', 'Mini-Check BWL Max erkunden', 'Mini-Check Auflösung geklickt', 'Mini-Check Klausuraufgaben', 'Anmeldefenster gesehen', 'Anmeldung begonnen', 'Analyse erlaubt', 'Gescrollt', 'Länger als 30 Sekunden', 'Max geöffnet', 'Max gefragt', 'Sprechen gestartet', 'Skript hochgeladen',
  'Beispiel geöffnet', 'Thema erklärt', 'Erstellt', 'Bereich geöffnet', 'Trainer geöffnet', 'Angemeldet', 'Spaßfrage beantwortet', 'Konto erstellt', 'Klausurpfad geklickt', 'Anmeldepflicht', 'Tafel 30 s offen', 'Tafel zu Ende gelesen', 'Verlassen-Hinweis', 'Mini-Check geprüft', 'Mini-Check angeklickt'];
// Ohne Einwilligung zählbar (ohne Kennung, ohne Ort): nur die reine Anzahl neuer Konten
const BM_OHNE = ['Google-Knopf fehlt', 'Mini-Check BWL Max erkunden', 'Mini-Check Auflösung geklickt', 'Mini-Check Klausuraufgaben', 'Konto erstellt', 'Max gefragt', 'Anmeldefenster gesehen', 'Anmeldung begonnen', 'Klausurpfad geklickt', 'Anmeldepflicht', 'Tafel 30 s offen', 'Tafel zu Ende gelesen', 'Verlassen-Hinweis', 'Mini-Check geprüft', 'Mini-Check angeklickt', 'Länger als 30 Sekunden'];   // Trichter: reine Anzahl ohne Kennung und Ort
function bmKennung(req) { const m = /(?:^|;\s*)bm_analyse=(a[0-9a-f]{12})(?:;|$)/.exec(req.headers.get('cookie') || ''); return m ? m[1] : ''; }
function bmMelden(daten, req, ctx, bwlmax) {
  if (intern(req)) return null;
  // Amsterdam = Bens VPN: auf jedem Gerät gar nicht erst zählen (auch ohne Cookie, wo kein Ort gespeichert wird)
  if (/^amsterdam$/i.test(dek(req.headers.get('x-vercel-ip-city')).trim())) return null;
  daten.domain = bwlmax ? 'bwlmax.de' : 'mrbell.de/tutor';
  const id = bmKennung(req);
  daten.sitzung = id;
  if (id) { daten.stadt = kurz(dek(req.headers.get('x-vercel-ip-city')), 40); daten.region = kurz(req.headers.get('x-vercel-ip-country-region'), 10); daten.land = kurz(req.headers.get('x-vercel-ip-country'), 4); daten.sprache = kurz((req.headers.get('accept-language') || '').split(',')[0], 10); }
  const p = fetch(BM_ZIEL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) }).catch(function () {});
  if (ctx && typeof ctx.waitUntil === 'function') { ctx.waitUntil(p); return null; }
  return p;
}
function bmSeite(req, ctx, url, bwlmax, recht) {
  const ua = req.headers.get('user-agent') || '';
  if (req.method !== 'GET' || BOT.test(ua) || !/text\/html/.test(req.headers.get('accept') || '')) return;
  if (/prefetch|prerender/i.test((req.headers.get('sec-purpose') || '') + (req.headers.get('purpose') || '') + (req.headers.get('x-purpose') || ''))) return;
  // Herkunft: Kampagnen-Kennung schlägt Referrer (Google Ads ?gclid, ?utm_source=…, eigene Links ?ref=lmu1), Thema-Einstieg ins Detail
  const p = url.searchParams, ref = kurz(p.get('ref') || '', 30), utm = kurz(p.get('utm_source') || '', 20), thema = kurz(p.get('thema') || p.get('q') || '', 30);
  const quelle = p.get('gclid') || p.get('gbraid') || p.get('wbraid') || /^(google|gads)$/i.test(utm) && /cpc|paid|ads/i.test(p.get('utm_medium') || '') ? 'Google Ads' : utm ? 'Kampagne: ' + utm : ref ? 'Link: ' + ref : '';
  bmMelden({ ereignis: recht ? 'Rechtstext geöffnet' : 'Seite geöffnet', detail: recht ? (recht === 'impressum' ? 'Impressum' : 'Datenschutz') : (thema ? 'Thema: ' + thema : ''), seite: recht ? '/' + recht : (/^\/lernen/.test(url.pathname) ? kurz(url.pathname, 60) : '/'),
    herkunft: quelle || herkunft(req.headers.get('referer') || '', url), geraet: geraet(ua) }, req, ctx, bwlmax);
}
async function bmEreignis(req, ctx, bwlmax) {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  const ua = req.headers.get('user-agent') || '';
  if (BOT.test(ua)) return new Response(null, { status: 204 });
  let d; try { d = JSON.parse((await req.text()).slice(0, 2000)); } catch (e) { return new Response(null, { status: 400 }); }
  const ereignis = kurz(d && d.ereignis, 40);
  // „Quelle · Schritt“ (Ads/SEO/Start): reine Anzahl, auch ohne Einwilligung – feste Namen aus consent.js, nichts Freies
  const quellSchritt = /^(Ads|SEO|Start) · [A-Za-zÄÖÜäöüß0-9 .:/()\-–]{1,34}$/.test(ereignis);
  if (!quellSchritt && BM_EREIGNISSE.indexOf(ereignis) < 0) return new Response(null, { status: 204 });
  if (!quellSchritt && !bmKennung(req) && BM_OHNE.indexOf(ereignis) < 0) return new Response(null, { status: 204 });
  const offen = bmMelden({ ereignis: ereignis, detail: kurz(d.detail, 60), seite: kurz(d.seite, 60), herkunft: d && d.ads ? 'Google Ads' : d && d.src === 'SEO' ? 'Google SEO' : d && d.src === 'Start' ? 'Startseite' : '', geraet: geraet(ua) }, req, ctx, bwlmax);
  if (offen) await Promise.race([offen, new Promise(function (r) { setTimeout(r, 1500); })]);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

export default async function middleware(req, ctx) {
  let url;
  try { url = new URL(req.url); } catch (e) { return weiter(); }
  // ---------- Grundschulmax (grundschulmax.de) — eigene Seite unter /grundschulmax, keine Messung ----------
  if (/^(www\.)?grundschulmax\.de$/i.test(url.hostname)) {
    const pfad = url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
    if (url.pathname === '/gs') return gsEreignis(req, ctx);
    let ziel = '';
    if (pfad === '/') { ziel = '/grundschulmax/index.html'; /* Besuch zählt die Seite selbst, erst wenn sie 1 s sichtbar war (gt.js) */ }
    else if (pfad === '/zahlen') ziel = '/grundschulmax/zahlen.html';
    else if (/^\/(impressum|datenschutz|agb|widerruf|kuendigen|widerrufen)$/.test(pfad)) { ziel = '/grundschulmax/legal' + pfad + '.html'; gsSeite(req, ctx, url, { impressum: 'Impressum', datenschutz: 'Datenschutz', agb: 'AGB', widerruf: 'Widerruf', kuendigen: 'Kündigen', widerrufen: 'Widerrufen' }[pfad.slice(1)]); }
    else if (pfad === '/ueben') { ziel = '/grundschulmax/ueben/index.html'; }
    else if (pfad === '/internet-und-ki') { ziel = '/grundschulmax/ueben/internet-und-ki.html'; }
    else if (pfad === '/internet-fuehrerschein') { ziel = '/grundschulmax/ueben/internet-fuehrerschein.html'; }
    else if (pfad === '/ratgeber') { ziel = '/grundschulmax/ueben/rg-index.html'; }
    else if (/^\/ratgeber\/[a-z0-9-]{3,40}$/.test(pfad)) { const sl = pfad.slice(10); ziel = '/grundschulmax/ueben/rg-' + sl + '.html'; }
    else if (/^\/ueben\/(einmaleins|plus-minus|uhr-lesen|silben|sicher-im-internet)$/.test(pfad)) { const sl = pfad.slice(7); ziel = '/grundschulmax/ueben/' + sl + '.html'; }
    else if (pfad === '/robots.txt' || pfad === '/sitemap.xml') ziel = '/grundschulmax' + pfad;
    else if (pfad === '/favicon.ico') ziel = '/grundschulmax/max-96.png';
    if (ziel) return new Response(null, { headers: { 'x-middleware-rewrite': new URL(ziel, url).toString() } });
    return weiter();
  }
  // ---------- BWL Max (bwlmax.de und mrbell.de/tutor) — eigene Messung, getrennt von Mr. Bell ----------
  const bwlmax = /^(www\.)?bwlmax\.de$/i.test(url.hostname);
  if (url.pathname === '/bm') return bmEreignis(req, ctx, bwlmax);
  // Zahlen-Dashboard (nur bwlmax.de, wird selbst nicht gezählt)
  // Zahlen leben jetzt in der App (gleiche Anmeldung) – alte Adresse und Handy-Lesezeichen landen dort
  if (url.pathname === '/zahlen') return bwlmax ? Response.redirect(new URL('/#/app/zahlen', url).toString(), 307) : weiter();
  // bwlmax.de hat eigene robots.txt und Sitemap (die Dateien im Hauptordner gehören zu mrbell.de)
  if (bwlmax && (url.pathname === '/robots.txt' || url.pathname === '/sitemap.xml' || url.pathname === '/llms.txt' || url.pathname === '/llms-full.txt')) return new Response(null, { headers: { 'x-middleware-rewrite': new URL('/tutor' + url.pathname, url).toString() } });
  if (bwlmax || url.pathname.startsWith('/tutor')) {
    const start = url.pathname === '/' || url.pathname === '/index.html' || /^\/tutor\/?(index\.html)?$/.test(url.pathname);
    const recht = bwlmax && /^\/(impressum|datenschutz|agb|widerruf|kuendigen|widerrufen)$/.test(url.pathname.replace(/\.html$/, '')) ? url.pathname.replace(/^\/|\.html$/g, '') : '';
    // Lernseiten (bwlmax.de/lernen/…) zählen wie die Startseite, mit Seitenpfad
    const lern = bwlmax && /^\/lernen(\/[a-z0-9-]+)?\/?$/.test(url.pathname);
    if (start || recht || lern) bmSeite(req, ctx, url, bwlmax, recht);
    if (bwlmax && start) return new Response(null, { headers: { 'x-middleware-rewrite': new URL('/tutor/index.html', url).toString() } });
    if (recht) return new Response(null, { headers: { 'x-middleware-rewrite': new URL('/tutor/legal/' + recht + '.html', url).toString() } });
    return weiter();
  }
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
