// Rückkehrer (Gast, zweiter Besuch oder öfter): einmal pro Tag freundlich anbieten, den Fortschritt kostenlos zu sichern
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';
import { face } from './face.js';

const K = 'bm.visits';
export function countVisit() {
  let v = null; try { v = JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) {}
  const now = Date.now();
  if (!v) v = { n: 0, last: 0, shown: '' };
  if (now - (v.last || 0) > 30 * 60e3) v.n = (v.n || 0) + 1;   // neuer Besuch nach 30 Min. Pause
  v.last = now;
  try { localStorage.setItem(K, JSON.stringify(v)); } catch (e) {}
  return v;
}
export function maybeWelcomeBack() {
  if (getAccount()) return;
  const v = countVisit(), day = new Date().toDateString();
  if ((v.n || 0) < 2 || v.shown === day) return;
  setTimeout(() => {
    if (getAccount() || document.querySelector('.modal-bg, .cb-card')) return;
    try { v.shown = day; localStorage.setItem(K, JSON.stringify(v)); } catch (e) {}
    try { window.BM && window.BM.track('Rückkehrer-Hinweis', String(v.n)); } catch (e) {}
    const f = h('span', { class: 'cb-face' });
    const close = () => { card.classList.add('out'); setTimeout(() => card.remove(), 260); };
    const card = h('div', { class: 'cb-card', role: 'dialog', 'aria-label': L('Willkommen zurück', 'Welcome back') },
      f,
      h('div', { class: 'cb-t' }, h('b', {}, L('Schön, dass du wieder da bist!', 'Good to see you again!')), h('span', {}, L('Sicher dir deinen Fortschritt kostenlos – dann ist beim nächsten Mal alles noch da.', 'Save your progress for free – then everything is still there next time.'))),
      h('div', { class: 'cb-a' },
        h('button', { class: 'btn primary sm', type: 'button', onclick: async () => { close(); try { window.BM && window.BM.track('Rückkehrer-Hinweis geklickt', String(v.n)); } catch (e) {} const { openAuth } = await import('./account.js'); openAuth({ registerTitle: L('Willkommen zurück!', 'Welcome back!'), loginTitle: L('Willkommen zurück!', 'Welcome back!'), registerSub: L('Kostenlos, mit Google in zwei Klicks – dein Fortschritt bleibt gespeichert.', 'Free, two clicks with Google – your progress stays saved.'), why: 'Rückkehr' }); } }, L('Kostenlos sichern', 'Save for free')),
        h('button', { class: 'iconbtn cb-x', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: close })));
    document.body.appendChild(card); face(f, { follow: false });
  }, 7000);
}
