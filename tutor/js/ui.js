// Gemeinsame UI-Bausteine: Ladeanzeige mit Gesicht, Fehler/Limit-Dialog
import { h, ico, modal, toast } from './util.js';
import { face } from './face.js';
import { COST, currentQuota } from './api.js';

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
    await modal({
      title: 'Für heute ist dein KI-Limit voll',
      text: 'Um 0:00 Uhr bekommst du neue Einheiten. Bis dahin kannst du weiter mit deinen gespeicherten Quizzen, Karteikarten, Fehlern und dem BWL-Trainer üben – das kostet nichts.',
      actions: [{ label: 'Alles klar', value: true, primary: true }]
    });
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
