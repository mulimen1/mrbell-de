// Gemeinsame UI-Bausteine: Ladeanzeige mit Gesicht, Fehler/Limit-Dialog
import { h, ico, modal, toast } from './util.js';
import { face } from './face.js';
import { COST, currentQuota, getAccount } from './api.js';
import { say, thinkLines } from './max.js';
import { L } from './i18n.js';
import { richText } from './sanitize.js';

// Gedankenblase neben Max' Kopf (die drei Denk-Punkte führen hinein)
export function thought(faceEl, kind = 'generic', fallback = []) {
  const bub = h('div', { class: 'thought', 'aria-live': 'polite' });
  const wrap = h('div', { class: 'thinkwrap' });
  faceEl.replaceWith(wrap); wrap.append(faceEl, bub);
  const lines = thinkLines(kind, fallback);
  let i = 0;
  const show = () => {
    if (!bub.isConnected) return clearInterval(iv);
    bub.textContent = lines[i++ % lines.length];
    bub.animate([{ opacity: 0, transform: 'scale(.85) translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  };
  show();
  const iv = setInterval(show, 3200);
  return { el: bub, stop() { clearInterval(iv); } };
}

export function loading(root, title, lines = [], kind = 'generic') {
  const f = h('div', { class: 'face' });
  const sub = h('div', { class: 'sub' });
  const el = h('div', { class: 'loading' }, f, h('b', {}, title), sub);
  root.replaceChildren(el);
  const fc = face(f); fc.set('think');
  const tb = thought(f, kind, lines);
  const t0 = Date.now();
  const tick = () => { if (!el.isConnected) return clearInterval(iv); const s = Math.round((Date.now() - t0) / 1000); sub.textContent = s > 4 ? `${s} s` : ''; };
  tick();
  const iv = setInterval(tick, 1000);
  return { el, face: fc, stop() { clearInterval(iv); tb.stop(); } };
}

export async function apiError(e, retry) {
  if (e && e.name === 'AbortError') return;
  if (e && e.code === 'cap') {
    const acc = getAccount();
    const r = await modal({ title: L('Für heute ist Schluss damit', 'That’s it for today'), text: e.message, actions: acc ? [{ label: L('Alles klar', 'Got it'), value: false, primary: true }] : [{ label: L('Später', 'Later'), value: false }, { label: L('Log in · 7 Tage Inner Circle', 'Log in · 7 days Inner Circle'), value: true, primary: true }] });
    if (r) { const { openLogin } = await import('./account.js'); if (await openLogin({ title: L('Mehr mit 7 Tagen Inner Circle', 'More with 7 days in the Inner Circle') }) && retry) retry(); }
    return;
  }
  if (e && e.code === 'limit') {
    const acc = getAccount();
    const r = await modal({
      title: L('Ich mach Feierabend', 'I’m clocking off'),
      text: say('limit') + (acc ? (acc.pro ? L(' Selbst im Inner Circle ist heute Schluss – morgen geht’s weiter.', ' Even in the Inner Circle, that’s it for today – we’ll carry on tomorrow.') : L(' Ab 0:00 Uhr gibt’s neue Einheiten. Der Inner Circle ohne Limit kommt bald.', ' New credits arrive at midnight. The Inner Circle without limits is coming soon.')) : L(' Ab 0:00 Uhr gibt’s neue Einheiten – oder du meldest dich kostenlos an und bekommst 7 Tage Inner Circle ohne Tageslimit.', ' New credits arrive at midnight – or sign in for free and get 7 days of Pro with no daily limit.')),
      actions: acc ? [{ label: L('Alles klar', 'Got it'), value: false, primary: true }] : [{ label: L('Später', 'Later'), value: false }, { label: L('Log in · 7 Tage Inner Circle', 'Log in · 7 days Inner Circle'), value: true, primary: true }]
    });
    if (r) { const { openLogin } = await import('./account.js'); if (await openLogin({ title: L('Weiterlernen mit 7 Tagen Inner Circle', 'Keep learning with 7 days in the Inner Circle') }) && retry) retry(); }
    return;
  }
  const r = await modal({ title: L('Das hat nicht geklappt', 'That didn’t work'), text: (e && e.message) || L('Unbekannter Fehler.', 'Unknown error.'), actions: retry ? [{ label: L('Schließen', 'Close'), value: false }, { label: L('Nochmal versuchen', 'Try again'), value: true, primary: true }] : [{ label: 'OK', value: false, primary: true }] });
  if (r && retry) retry();
}

// Knopf mit Kostenangabe
export function costBtn(label, action, onclick, cls = 'btn primary') {
  const c = COST[action] || 0;
  return h('button', { class: cls, onclick }, label, c ? h('span', { class: 'k', title: L('KI-Einheiten', 'AI credits') }, c) : null);
}

export function hasQuota(action) {
  const q = currentQuota();
  if (!q) return true;
  return (q.limit - q.used) >= (COST[action] || 0);
}

export function errorBox(msg, retry) {
  return h('div', { class: 'empty' }, h('h2', { style: { fontSize: '22px' } }, L('Das hat nicht geklappt', 'That didn’t work')), h('p', {}, msg), retry ? h('button', { class: 'btn primary', onclick: retry }, L('Nochmal versuchen', 'Try again')) : null);
}

// Zusatz-Einstellungen: am Handy hinter „Anpassen“, am Laptop immer offen
export function moreOpts(...kids) {
  const d = h('details', { class: 'more-opts' },
    h('summary', {}, h('span', { html: ico('tune') }), L('Anpassen', 'Customise'), h('span', { class: 'mo-chev', html: ico('right') })),
    h('div', { class: 'mo-body' }, ...kids));
  if (!matchMedia('(max-width: 760px)').matches) d.open = true;
  return d;
}

// Antwort tippt sich Wort für Wort auf (mit Cursor)
export async function typeOut(el, text, { scroll = () => {}, alive = () => true } = {}) {
  const parts = String(text || '').split(/(\s+)/);
  const words = parts.filter(p => p.trim()).length;
  const step = words > 260 ? 3 : words > 120 ? 2 : 1;
  const delay = words > 260 ? 22 : 28;
  let out = '', n = 0;
  el.classList.add('typing-on');
  for (let k = 0; k < parts.length; k++) {
    out += parts[k];
    if (!parts[k].trim()) continue;
    if (++n % step && k < parts.length - 1) continue;
    el.replaceChildren(richText(out));
    scroll();
    await new Promise(r => setTimeout(r, delay));
    if (!el.isConnected || !alive()) break;
  }
  el.classList.remove('typing-on');
  el.replaceChildren(richText(text));
  scroll();
}

// Platzhalter tippt Beispiele durch (pausiert, solange man im Feld ist)
export function typePlaceholder(inp, base, examples, pre = '') {
  inp.placeholder = base;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !examples?.length) return;
  let k = Math.floor(Math.random() * examples.length);
  const busy = () => !!inp.value;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async () => {
    await wait(2200);
    while (inp.isConnected) {
      if (busy()) { inp.placeholder = base; await wait(800); continue; }
      const t = pre + examples[k++ % examples.length];
      for (let i = pre.length; i <= t.length; i++) { if (busy() || !inp.isConnected) break; inp.placeholder = t.slice(0, i); await wait(42); }
      await wait(2000);
      if (!busy()) inp.placeholder = base;
      await wait(2600);
    }
  })();
}
