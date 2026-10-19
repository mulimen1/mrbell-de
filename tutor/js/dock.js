// Immer da, neben Max: Taschenrechner und BWL-Lexikon. Öffnen sich als kleines Fenster (Handy: von unten),
// man bleibt genau da, wo man ist. Rechnen mit expr-eval (MIT), eigene Vorverarbeitung für %, Grad, ×/÷, Komma.
import { h, ico, ls } from './util.js';
import { L } from './i18n.js';

let mounted = false, dock, panel = null, which = '';
const CSS_V = 2;

const ICON = {
  calc: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.8" width="14" height="18.4" rx="2.6"/><rect x="8" y="5.8" width="8" height="3.6" rx=".8"/><path d="M8.6 13h.01M12 13h.01M15.4 13h.01M8.6 16.6h.01M12 16.6h.01M15.4 16.6h.01"/></svg>',
  lex: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9.2 12.6 11 7.4h.1l1.8 5.2M9.8 11h2.6"/><path d="M14.6 9.2h2"/></svg>'
};

// Kurzes Antippen spürbar machen: Android vibriert, iPhone (iOS 18+) über den unsichtbaren Schalter-Trick
let hapEl = null;
export function haptic() {
  try {
    if (navigator.vibrate && navigator.vibrate(7)) return;
    if (!hapEl) { const id = 'bm-hap'; hapEl = h('label', { for: id, 'aria-hidden': 'true', style: { position: 'fixed', left: '-99px', top: '0', width: '1px', height: '1px', overflow: 'hidden', opacity: '0' } }, h('input', { type: 'checkbox', id, switch: '', tabindex: '-1' })); document.body.appendChild(hapEl); }
    hapEl.click();
  } catch (e) {}
}

export function mountDock() {
  if (mounted) return; mounted = true;
  if (!document.querySelector('link[data-dock]')) document.head.appendChild(h('link', { rel: 'stylesheet', href: '/tutor/css/dock.css?v=' + CSS_V, 'data-dock': '1' }));
  const b = (k, label) => h('button', { type: 'button', class: 'dk-b', 'data-k': k, 'aria-label': label, title: label, 'aria-expanded': 'false', html: ICON[k], onclick: () => toggle(k) });
  dock = h('div', { class: 'dk', role: 'toolbar', 'aria-label': L('Werkzeuge', 'Tools') }, b('calc', L('Taschenrechner', 'Calculator')), b('lex', L('BWL-Lexikon', 'Business glossary')));
  document.body.appendChild(dock);
  place(); setInterval(place, 350); addEventListener('resize', place);
  // Vorladen, damit sich beides sofort und flüssig öffnet: Code im Leerlauf, Lexikon-Daten beim Drüberfahren/Antippen
  const idle = window.requestIdleCallback || (f => setTimeout(f, 1500));
  idle(() => { import('./calc.js').catch(() => {}); import('./lexikon.js').then(m => setTimeout(() => m.preload(), 4000)).catch(() => {}); });
  const lexB = dock.querySelector('[data-k="lex"]');
  ['pointerenter', 'pointerdown', 'focus'].forEach(t => lexB.addEventListener(t, () => import('./lexikon.js').then(m => m.preload()).catch(() => {}), { once: true }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel) close(); });
}

// Dock folgt Max’ Kopf (der lässt sich verschieben); ist Max weg, sitzt es unten rechts
function place() {
  if (!dock) return;
  const bub = document.querySelector('.asst-bub');
  let r = null;
  if (bub) { const cs = getComputedStyle(bub); const rr = bub.getBoundingClientRect(); if (rr.width > 20 && cs.opacity !== '0' && cs.visibility !== 'hidden' && cs.display !== 'none' && !bub.closest('.off')) r = rr; }
  const dw = dock.offsetWidth || 44, dh = dock.offsetHeight || 96;
  let right, bottom;
  if (r) {
    right = Math.max(6, innerWidth - r.right + (r.width - dw) / 2);
    bottom = innerHeight - r.top + 10;
    if (r.top - dh - 10 < 70) bottom = innerHeight - r.bottom - dh - 10 < 0 ? 16 : innerHeight - r.bottom - dh - 10;   // Max ganz oben: Dock darunter
  } else { right = 16; bottom = 18; }
  dock.style.right = Math.round(right) + 'px'; dock.style.bottom = Math.round(bottom) + 'px';
  if (panel) { panel.style.setProperty('--dr', Math.round(right) + 'px'); panel.style.setProperty('--db', Math.round(bottom) + 'px'); }
}

function toggle(k) { haptic(); if (which === k) { close(); return; } open(k); }
function close() {
  if (!panel) return; const p = panel; panel = null; which = '';
  p.classList.remove('in'); p.classList.add('out'); setTimeout(() => p.remove(), 260);
  dock.querySelectorAll('.dk-b').forEach(x => x.setAttribute('aria-expanded', 'false'));
}
async function open(k) {
  if (panel) { panel.remove(); panel = null; }
  which = k;
  dock.querySelectorAll('.dk-b').forEach(x => x.setAttribute('aria-expanded', String(x.dataset.k === k)));
  const head = h('div', { class: 'dkp-h' }, h('span', { class: 'dkp-i', html: ICON[k] }), h('b', {}, k === 'calc' ? L('Rechner', 'Calculator') : L('BWL-Lexikon', 'Business glossary')),
    h('button', { type: 'button', class: 'dkp-x', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => { haptic(); close(); } }));
  const body = h('div', { class: 'dkp-b' });
  const p = h('div', { class: 'dkp dkp-' + k + ' pre', role: 'dialog', 'aria-label': k === 'calc' ? L('Taschenrechner', 'Calculator') : L('BWL-Lexikon', 'Business glossary') }, h('i', { class: 'dkp-grab', 'aria-hidden': 'true' }), head, body);
  panel = p;
  // Erst fertig bauen (unsichtbar), dann in einem Rutsch einblenden – kein Ruckeln, kein Nachladen im Bild
  document.body.appendChild(p); place();
  const build = (async () => {
    if (k === 'calc') (await import('./calc.js')).calculator(body);
    else await (await import('./lexikon.js')).lexikon(body, { close });
  })().catch(e => console.warn(e));
  await Promise.race([build, new Promise(r => setTimeout(r, 650))]);   // langsames Netz: trotzdem zügig zeigen
  if (panel !== p) return;
  requestAnimationFrame(() => requestAnimationFrame(() => { p.classList.remove('pre'); p.classList.add('in'); }));
}
