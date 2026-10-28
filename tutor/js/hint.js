// Dezenter Hinweis oben links, ~25 s nach dem Start (einmal pro Besuch): Laptop ohne Konto → „Bleib gern hier – kostenloses Konto“.
// Handy/Tablet mit Touch: hier nichts – am Handy gibt’s stattdessen einmalig den kleinen Tipp aus app.js (mobileTip).
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';
import { face } from './face.js';

const KEY = 'tutor.hintShown';
const mob = () => matchMedia('(max-width: 820px) and (pointer: coarse), (max-width: 600px)').matches;

export function scheduleHint(delay = 25000) {
  if (mob()) return;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { return; }
  const t0 = Date.now();
  const tryShow = () => {
    // nicht über Begrüßung, Dialoge oder Anmeldung legen – dann kurz später nochmal
    // Handy: nicht über eine offene Tafel legen (deckt sonst Titel und Knöpfe ab) – kommt, sobald die Tafel zu oder eingeklappt ist
    const boardUp = mob() && document.querySelector('.asst.has-board:not(.board-min)');
    if (document.hidden || boardUp || document.documentElement.classList.contains('mx-touring') || [...document.querySelectorAll('.ngreet, .modal-bg, .acc-modal')].some(e => e.getClientRects().length) || Date.now() - t0 < delay) return setTimeout(tryShow, 4000);
    show();
  };
  setTimeout(tryShow, delay);
}

function show() {
  const acc = getAccount(), phone = mob();
  if (phone || acc) return;
  if (document.querySelector('.m-lad')) return;   // Themen-Einstieg: der Klausurpfad an der Tafel übernimmt das   // Handy: kein Laptop-Hinweis · Laptop mit Konto: nichts zu sagen
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  const title = phone ? L('Am Laptop oder iPad kann ich noch mehr', 'On a laptop or iPad I can do even more') : L('Noch mehr Fragen? Bleib gern hier.', 'More questions? Stick around.');
  const text = phone
    ? L('Folien hochladen, Klausur-Simulator, Lernplan – öffne bwlmax.de am großen Bildschirm, dann begleite ich dich durchs ganze BWL-Studium.', 'Upload slides, exam simulator, study plan – open bwlmax.de on a bigger screen and I’ll guide you through your whole degree.')
    : L('Mit einem kostenlosen Konto hast du jeden Tag Fragen frei, ich merke mir deinen Stand und begleite dich durch alle BWL-Themen.', 'With a free account you get free questions every day, I remember where you are and guide you through every topic.');
  const fEl = h('span', { class: 'hn-face' });
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 320); };
  const cta = !acc ? h('button', { class: 'hn-cta', type: 'button', onclick: async () => { close(); try { const m = await import('./account.js'); m.openLogin({ mode: 'register' }); } catch (e) {} } }, L('Kostenloses Konto', 'Free account')) : null;
  const el = h('div', { class: 'hn', role: 'status' },
    fEl,
    h('div', { class: 'hn-b' }, h('b', {}, title), h('p', {}, text), cta),
    h('button', { class: 'hn-x', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: close }));
  document.body.appendChild(el);
  face(fEl, { follow: false }).set('smug');
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { if (el.isConnected && !el.matches(':hover')) close(); }, 22000);
  try { window.BM && window.BM.track('Hinweis gezeigt', phone ? 'Handy → Laptop' : 'Konto'); } catch (e) {}
}

const css = `
.hn { position: fixed; z-index: 150; left: 16px; top: 76px; width: min(340px, calc(100vw - 24px)); display: flex; gap: 10px; align-items: flex-start; padding: 12px 12px 12px 12px; border-radius: 18px; background: var(--panel); color: var(--ink); border: 1px solid var(--line2); box-shadow: 0 22px 50px -24px rgba(0,0,0,.55); opacity: 0; transform: translateY(-8px) scale(.98); transition: opacity .35s ease, transform .45s cubic-bezier(.16,1,.3,1); }
.hn.in { opacity: 1; transform: none; } .hn.out { opacity: 0; transform: translateY(-6px); transition: opacity .3s ease, transform .3s ease; }
.hn-face { flex: none; width: 38px; height: 38px; }
.hn-b { flex: 1; min-width: 0; }
.hn-b b { display: block; font: 650 14px/1.3 var(--sans); letter-spacing: -.01em; }
.hn-b p { margin: 4px 0 0; font: 400 13px/1.45 var(--sans); color: var(--ink2); }
.hn-cta { margin-top: 8px; height: 30px; padding: 0 12px; border: 0; border-radius: 999px; background: var(--inv); color: var(--onInv); font: 600 12.5px var(--sans); cursor: pointer; }
.hn-x { flex: none; width: 26px; height: 26px; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: var(--mute); cursor: pointer; margin: -2px -2px 0 0; }
.hn-x:hover { background: var(--panel2); color: var(--ink); } .hn-x .ico { width: 15px; height: 15px; }
@media (max-width: 600px) { .hn { left: 10px; top: calc(10px + env(safe-area-inset-top, 0px)); width: calc(100vw - 20px); } }
@media (prefers-reduced-motion: reduce) { .hn { transition: none; } }
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
