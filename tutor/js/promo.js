// „Komm in die Gruppe“ – Max’ Inner-Circle-Teaser unten links, angelehnt an das Porsche-Cayman-S-Meme
// (die Parodie auf dubiose Trading-Gruppen-Werbung). Nur Text, kein Logo, kein Auto.
// Kommt selten: frühestens nach 3 Min. aktiver Nutzung, höchstens alle 3 Tage, nach 3× Wegklicken nur noch alle 14 Tage.
// Nie während Führung, Dialog, Sprechen oder Klausur. Zum Ansehen: Adresse mit ?komm aufrufen.
import { h, ico, ls, learningNow } from './util.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';

const KEY = 'tutor.icPromo';
// Gleiche Karte, wechselnder Spruch. Der erste ist immer der Porsche – weitere kommen nach Bens Freigabe dazu.
// night: nur zwischen 23 und 4 Uhr.
const VARIANTS = [
  { id: 'porsche', h: () => L('Komm in die Gruppe. 🤝', 'Join the group. 🤝'),
    t: () => L('Einen Porsche Cayman S gibt’s bei uns leider nicht. Dafür Max ohne Tageslimit, Probeklausuren und Podcasts – das garantiert bessere BWL-Erlebnis.', 'Sadly, there’s no Porsche Cayman S here. Instead: Max without a daily limit, mock exams and podcasts – a guaranteed better business-studies experience.'),
    f: () => L('*Keine WhatsApp-Gruppe. Kein Trading-Kurs. Versprochen.', '*No WhatsApp group. No trading course. Promise.') },
];
function pick(s) {
  const seen = s.seen || [];
  if (!seen.includes('porsche')) return VARIANTS[0];
  const hr = new Date().getHours(), night = hr >= 23 || hr < 4;
  const ok = VARIANTS.filter(v => !v.night || night);
  const fresh = ok.filter(v => !seen.includes(v.id));
  const pool = fresh.length ? fresh : ok.filter(v => v.id !== s.lastId);
  return pool[Math.floor(Math.random() * pool.length)] || VARIANTS[0];
}
const DAY = 864e5;
let shown = false, active = 0, timer = 0;

function due() {
  const s = ls.get(KEY, null) || { last: 0, n: 0 };
  const gap = (s.n >= 3 ? 14 : 3) * DAY;
  return Date.now() - (s.last || 0) > gap;
}
function busy() {
  const d = document;
  return d.hidden || !location.hash.startsWith('#/app')
    || d.documentElement.classList.contains('mx-touring')
    || learningNow()
    || d.querySelector('.modal-bg, .vmode, .asst.think, .asst.speak, .asst.listen, .qz-exam, .exam-run, .ai-drop:not([hidden])');
}

export function initPromo() {
  if (timer) return;
  const force = /[?&]komm\b/.test(location.search);
  if (force) { setTimeout(() => show(true), 1600); return; }
  timer = setInterval(() => {
    if (shown || document.hidden) return;
    active += 15;
    const acc = getAccount();
    if (acc?.pro) return;
    if (active < 180 || !due() || busy()) return;
    show(false);
  }, 15e3);
}

// Max mit Sonnenbrille – ganz cool, ganz Gruppe
function coolFace() {
  const wrap = h('span', { class: 'kg-face' });
  import('./face.js').then(({ face }) => {
    face(wrap, { follow: false });
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'svg');
    g.setAttribute('viewBox', '140 100 750 680'); g.setAttribute('aria-hidden', 'true'); g.setAttribute('class', 'kg-shades');
    g.innerHTML = '<path d="M352 472h132c8 0 14 6 13 14l-6 44c-4 26-26 44-52 44h-38c-26 0-48-18-52-44l-6-44c-1-8 5-14 9-14Z"/>'
      + '<path d="M540 472h132c4 0 10 6 9 14l-6 44c-4 26-26 44-52 44h-38c-26 0-48-18-52-44l-6-44c-1-8 5-14 13-14Z"/>'
      + '<path d="M484 492c18-10 38-10 56 0" fill="none" stroke="#0b0b0d" stroke-width="14" stroke-linecap="round"/>'
      + '<path d="M380 490l34 0M568 490l34 0" stroke="rgba(255,255,255,.35)" stroke-width="10" stroke-linecap="round"/>';
    wrap.appendChild(g);
  }).catch(() => {});
  return wrap;
}

function show(force) {
  if (shown) return;
  shown = true;
  const s = ls.get(KEY, null) || { last: 0, n: 0, seen: [] };
  const v = pick(s);
  const seen = [...new Set([...(s.seen || []), v.id])].slice(-20);
  if (!force) ls.set(KEY, { last: Date.now(), n: s.n || 0, seen, lastId: v.id });
  let closed = false;
  const close = (why) => {
    if (closed) return; closed = true;
    card.classList.add('out'); setTimeout(() => card.remove(), 420);
    if (why === 'x' && !force) ls.set(KEY, { last: Date.now(), n: (s.n || 0) + 1, seen, lastId: v.id });
  };
  const join = async () => {
    close('join');
    const { innerCircle } = await import('./ic.js');
    innerCircle({ reason: L('Willkommen in der Gruppe. Ohne Cayman, mit Plan.', 'Welcome to the group. No Cayman, but a plan.'), later: L('Vielleicht später', 'Maybe later') });
  };
  const card = h('aside', { class: 'kg', role: 'dialog', 'aria-label': 'Max’s Inner Circle', 'data-v': v.id },
    h('button', { class: 'kg-x', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close('x') }),
    h('div', { class: 'kg-top' }, coolFace(), h('div', {}, h('b', { class: 'ic-lt' }, 'Max’s Inner Circle'), h('small', {}, v.f ? L('Anzeige*', 'Ad*') : L('Anzeige', 'Ad')))),
    h('p', { class: 'kg-h' }, v.h()),
    v.t ? h('p', { class: 'kg-t' }, v.t()) : null,
    h('div', { class: 'kg-row' },
      h('button', { class: 'btn ic-btn kg-go', type: 'button', onclick: join }, L('Rein da', 'I’m in'), h('span', { html: ico('right') })),
      v.f ? h('small', { class: 'kg-f' }, v.f()) : null));
  document.body.appendChild(card);
  // Bleibt nicht ewig: nach 20 Sek. ohne Berührung leise weg
  let idle = setTimeout(() => close('idle'), 20e3);
  card.addEventListener('pointerenter', () => clearTimeout(idle));
  card.addEventListener('pointerleave', () => { clearTimeout(idle); idle = setTimeout(() => close('idle'), 8e3); });
}
