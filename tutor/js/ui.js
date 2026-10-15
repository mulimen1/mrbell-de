// Gemeinsame UI-Bausteine: Ladeanzeige mit Gesicht, Fehler/Limit-Dialog
import { h, ico, modal, toast } from './util.js';
import { face } from './face.js';
import { COST, currentQuota, getAccount } from './api.js';
import { say } from './max.js';

export function loading(root, title, lines = []) {
  const f = h('div', { class: 'face' });
  const sub = h('div', { class: 'sub' });
  const el = h('div', { class: 'loading' }, f, h('b', {}, title), sub);
  root.replaceChildren(el);
  const fc = face(f); fc.set('think');
  let i = 0, t0 = Date.now();
  const tick = () => { if (!el.isConnected) return clearInterval(iv); const s = Math.round((Date.now() - t0) / 1000); sub.textContent = (lines.length ? lines[i++ % lines.length] : 'Einen Moment') + (s > 4 ? ` · ${s} s` : ''); };
  tick();
  const iv = setInterval(tick, 2600);
  return { el, face: fc, stop() { clearInterval(iv); } };
}

export async function apiError(e, retry) {
  if (e && e.name === 'AbortError') return;
  if (e && e.code === 'limit') {
    const acc = getAccount();
    const r = await modal({
      title: 'Max macht Feierabend',
      text: say('limit') + (acc ? (acc.pro ? ' Selbst mit Pro ist heute Schluss – morgen geht’s weiter.' : ' Ab 0:00 Uhr gibt’s neue Einheiten. Pro ohne Limit kommt bald.') : ' Ab 0:00 Uhr gibt’s neue Einheiten – oder du meldest dich kostenlos an und bekommst 7 Tage Pro ohne Tageslimit.'),
      actions: acc ? [{ label: 'Alles klar', value: false, primary: true }] : [{ label: 'Später', value: false }, { label: 'Anmelden · 7 Tage Pro', value: true, primary: true }]
    });
    if (r) { const { openLogin } = await import('./account.js'); if (await openLogin({ title: 'Weiterlernen mit 7 Tagen Pro' }) && retry) retry(); }
    return;
  }
  const r = await modal({ title: 'Das hat nicht geklappt', text: (e && e.message) || 'Unbekannter Fehler.', actions: retry ? [{ label: 'Schließen', value: false }, { label: 'Nochmal versuchen', value: true, primary: true }] : [{ label: 'OK', value: false, primary: true }] });
  if (r && retry) retry();
}

// Knopf mit Kostenangabe
export function costBtn(label, action, onclick, cls = 'btn primary') {
  const c = COST[action] || 0;
  return h('button', { class: cls, onclick }, label, c ? h('span', { class: 'k', title: 'KI-Einheiten' }, c) : null);
}

export function hasQuota(action) {
  const q = currentQuota();
  if (!q) return true;
  return (q.limit - q.used) >= (COST[action] || 0);
}

export function errorBox(msg, retry) {
  return h('div', { class: 'empty' }, h('h2', { style: { fontSize: '22px' } }, 'Das hat nicht geklappt'), h('p', {}, msg), retry ? h('button', { class: 'btn primary', onclick: retry }, 'Nochmal versuchen') : null);
}
