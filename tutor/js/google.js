// „Mit Google anmelden“: offizieller Google-Knopf (Google Identity Services). Google bestätigt die E-Mail-Adresse,
// der Server prüft das Token bei Google und legt das Konto an oder meldet an. Passwörter gibt es dabei nicht.
import { ask, setAccount } from './api.js';
import { ls, toast } from './util.js';
import { L } from './i18n.js';

export const GOOGLE_CLIENT_ID = '992487886164-195m4i8j8dqqmnonfmi2kh6s3eur4vte.apps.googleusercontent.com';

let gisP = null;
function loadGis() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (gisP) return gisP;
  gisP = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
    s.onload = () => (window.google?.accounts?.id ? res(window.google) : rej(new Error('gis')));
    s.onerror = () => { gisP = null; rej(new Error('gis')); };
    document.head.appendChild(s);
  });
  return gisP;
}

let handler = null, inited = false;
// Google-Knopf sichtbar machen, sobald sein iframe geladen ist (spätestens nach 2,5 s; ohne iframe – Ersatzknopf – nach kurzer Pause)
function gReveal(el) {
  const show = () => { if (el._gT) clearTimeout(el._gT); el._gT = 0; requestAnimationFrame(() => el.classList.remove('g-wait')); };
  el._gT = setTimeout(show, 2500);
  const t0 = Date.now();
  const look = () => {
    if (!el.isConnected) return;
    const f = el.querySelector('iframe');
    if (f) { let done = false; const go = () => { if (!done) { done = true; setTimeout(show, 60); } }; f.addEventListener('load', go, { once: true }); setTimeout(() => { try { if (f.contentDocument === null && f.getBoundingClientRect().height > 20) go(); } catch (e) {} }, 900); return; }
    if (Date.now() - t0 > 700 && el.firstElementChild) return show();
    setTimeout(look, 50);
  };
  look();
}
// Ein Google-Knopf in `el`. onDone(r) bekommt die Server-Antwort (Konto + Sitzung sind dann schon gesetzt).
export async function googleButton(el, onDone, tries = 0) {
  if (!el) return;
  handler = onDone;
  try {
    const g = await loadGis();
    if (!inited) {
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID, ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, itp_support: true,
        callback: async resp => {
          try {
            const r = await ask('glogin', { opts: { credential: resp.credential } });
            if (r.account?.email) ls.set('tutor.lastEmail', r.account.email);
            setAccount(r.account, r.session);
            try { if (r.fresh && window.BM) window.BM.track('Konto erstellt', 'Google'); } catch (e) {}   // ohne Einwilligung: nur die Anzahl
            handler && handler(r);
          } catch (e) { toast(e.message || L('Die Anmeldung mit Google hat nicht geklappt.', 'Signing in with Google didn’t work.'), 5000); }
        }
      });
      inited = true;
    }
    const sc = parseFloat(getComputedStyle(el).getPropertyValue('--gscale')) || 1;   // größer dargestellt (z. B. Verlassen-Fenster): schmaler zeichnen, per CSS hochskalieren
    // Breite aus dem Layout (clientWidth), nicht aus getBoundingClientRect: das Fenster skaliert beim Öffnen noch (Pop-Animation) – sonst wird der Knopf zu schmal
    const w = Math.max(200, Math.min(400, Math.round((el.clientWidth || el.parentElement?.clientWidth || 320) / sc)));
    // Platz bleibt reserviert (CSS: feste Höhe + Platzhalter), der Knopf blendet erst ein, wenn Googles Rahmen geladen ist – kein Springen/Flackern
    el.classList.add('g-wait');
    el.replaceChildren();
    g.accounts.id.renderButton(el, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', logo_alignment: 'center', width: w, locale: document.documentElement.lang === 'en' ? 'en' : 'de' });
    gReveal(el);
  } catch (e) {
    // Google-Skript nicht geladen (Netz, Blocker): bis zu zweimal neu versuchen, erst dann ausblenden
    if (tries < 2 && el.isConnected) { setTimeout(() => googleButton(el, onDone, tries + 1), 1200 * (tries + 1)); return; }
    el.hidden = true;
    try { window.BM && window.BM.track('Google-Knopf fehlt', String(e && e.message || '').slice(0, 30)); } catch (x) {}
  }
  // Wächter: steht nach 4 s kein sichtbarer Knopf da, neu zeichnen
  if (tries === 0) setTimeout(() => { if (!el.isConnected || el.hidden) return; const f = el.querySelector('iframe'); if (!f || f.getBoundingClientRect().height < 20) googleButton(el, onDone, 1); }, 4000);
}
