// Tutor oben rechts: „≡“ öffnet die Einstellungen darunter – Sprache, Antwortsprache, Hell/Dunkel, Farbe, Suchen, Feedback, Zahlen (Admin).
// Immer nur ein Menü offen: „Bereits erstellt“ und dieses schließen sich gegenseitig.
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { onAccount } from './api.js';
import { ACCENTS, getAccent, setAccent } from './theme.js';

const H = document.documentElement;
const dark = () => H.dataset.theme ? H.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
let admin = false;
onAccount(a => import('./views/zahlen.js').then(m => { admin = !!m.isAdmin(a); }).catch(() => {}));

export function cfgButton() {
  const b = h('button', { class: 'cfg-btn', type: 'button', 'aria-label': L('Einstellungen', 'Settings'), title: L('Einstellungen', 'Settings'), 'aria-haspopup': 'menu', 'aria-expanded': 'false' }, h('span', { class: 'cfg-bars' }, h('i'), h('i'), h('i')));
  b.addEventListener('click', e => { e.stopPropagation(); open(b); });
  return b;
}

async function open(btn) {
  const ex = document.querySelector('.uv-menu');
  if (ex) { const same = ex._btn === btn; ex._close ? ex._close() : ex.remove(); if (same) return; }
  const A = await import('./app.js');
  const row = (ic, label, ctl, onclick) => h(onclick ? 'button' : 'div', Object.assign({ class: 'cfg-row' + (onclick ? ' cfg-act' : '') }, onclick ? { type: 'button', onclick } : {}), h('span', { class: 'cfg-ri', 'data-c': ic, html: ico(ic) }), h('span', { class: 'cfg-rl' }, label), ctl || h('span', { class: 'cfg-chev', html: ico('right') }));
  const thTxt = h('span', {}, dark() ? L('An', 'On') : L('Aus', 'Off'));
  const sw = h('span', { class: 'cfg-sw' + (dark() ? ' on' : '') }, h('i'));
  const themeRow = row(dark() ? 'sun' : 'moon', L('Dunkler Modus', 'Dark mode'), sw, () => {
    const next = dark() ? 'light' : 'dark'; H.classList.add('theme-fade'); H.dataset.theme = next;
    try { sessionStorage.setItem('tutor.theme', next); } catch (e) {} setTimeout(() => H.classList.remove('theme-fade'), 900);
    sw.classList.toggle('on', next === 'dark'); thTxt.textContent = next === 'dark' ? L('An', 'On') : L('Aus', 'Off');
  });
  const accs = h('div', { class: 'cfg-acc' }, ...ACCENTS.map(([id, de, en, c1, c2]) => h('button', { type: 'button', class: 'cfg-dot' + (getAccent() === id ? ' on' : ''), title: L(de, en), 'aria-label': L(de, en), style: { background: `linear-gradient(135deg, ${c2}, ${c1})` }, onclick: e => { setAccent(id, e.currentTarget); accs.querySelectorAll('.cfg-dot').forEach(x => x.classList.toggle('on', x === e.currentTarget)); } })));
  const menu = h('div', { class: 'uv-menu cfg-menu', role: 'menu' },
    h('div', { class: 'cfg-h' }, L('Einstellungen', 'Settings')),
    row('globe', L('Sprache der Seite', 'Site language'), A.langSwitch()),
    row('chat', L('Max antwortet auf', 'Max answers in'), (() => { const o = A.outLangSwitch(); return o.querySelector('.seg') || o; })()),
    themeRow,
    h('div', { class: 'cfg-row cfg-col' }, h('span', { class: 'cfg-ri', 'data-c': 'spark', html: ico('spark') }), h('span', { class: 'cfg-rl' }, L('Farbe', 'Colour')), accs),
    h('div', { class: 'cfg-sep' }),
    row('search', L('Suchen', 'Search'), h('kbd', {}, navigator.platform.includes('Mac') ? '⌘K' : 'Strg K'), () => { close(); import('./palette.js').then(m => m.openPalette()); }),
    row('chat', L('Feedback geben', 'Give feedback'), null, () => { close(); import('./feedback.js').then(m => m.openFeedback()); }),
    admin ? row('chart', L('Zahlen', 'Numbers'), null, () => { close(); location.hash = '#/app/zahlen'; }) : null);
  menu._btn = btn;
  const close = () => { menu.remove(); btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('on'); document.removeEventListener('click', out); document.removeEventListener('keydown', esc); removeEventListener('resize', place); removeEventListener('hashchange', close); };
  menu._close = close;
  const out = e => { if (!menu.contains(e.target) && !document.querySelector('.acc-pop')?.contains(e.target)) close(); };
  const esc = e => { if (e.key === 'Escape') close(); };
  const place = () => { const r = btn.closest('.rm-corner, .rm-bar')?.getBoundingClientRect() || btn.getBoundingClientRect(), phone = innerWidth <= 760; Object.assign(menu.style, phone ? { left: '12px', right: '12px', top: (r.bottom + 8) + 'px' } : { right: Math.max(12, innerWidth - r.right) + 'px', top: (r.bottom + 10) + 'px' }); };
  document.body.appendChild(menu); place();
  btn.setAttribute('aria-expanded', 'true'); btn.classList.add('on');
  setTimeout(() => { document.addEventListener('click', out); document.addEventListener('keydown', esc); addEventListener('resize', place); addEventListener('hashchange', close); }, 0);
}
