// Kleine Helfer: DOM, Formatierung, Toasts, Dialoge, Icons
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Leere Bausteine (null/false) nie als Text „null“ einfügen
for (const P of [Element.prototype, DocumentFragment.prototype]) for (const m of ['replaceChildren', 'append', 'prepend']) {
  const orig = P[m]; P[m] = function (...k) { return orig.apply(this, k.filter(x => x != null && x !== false)); };
}

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sv == null) continue; if (sk.startsWith('--')) el.style.setProperty(sk, String(sv)); else el.style[sk] = sv; } }
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}

export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const nf = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });
export const fmt = n => nf.format(n);
export function parseNum(s) {
  s = String(s || '').trim().replace(/\s|€|%/g, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return parseFloat(s);
}
export function ago(ts) {
  const d = (Date.now() - ts) / 1000;
  // Sprache direkt vom <html lang> (i18n.js setzt es) – kein Import, sonst Zirkelbezug
  if (document.documentElement.lang === 'en') {
    if (d < 60) return 'just now';
    if (d < 3600) return `${Math.floor(d / 60)} min ago`;
    if (d < 86400) return `${Math.floor(d / 3600)} hr ago`;
    const t = Math.floor(d / 86400); return t === 1 ? 'yesterday' : `${t} days ago`;
  }
  if (d < 60) return 'gerade eben';
  if (d < 3600) return `vor ${Math.floor(d / 60)} Min.`;
  if (d < 86400) return `vor ${Math.floor(d / 3600)} Std.`;
  const t = Math.floor(d / 86400); return t === 1 ? 'gestern' : `vor ${t} Tagen`;
}

// LocalStorage sicher
export const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

// Toasts
export function toast(msg, ms = 2600) {
  let box = $('.toasts');
  if (!box) { box = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(box); }
  const t = h('div', { class: 'toast' }, msg);
  box.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, ms);
}

// Dialog
export function modal({ title, text, body, actions = [], onAction, cls = '', eyebrow = '' }) {
  return new Promise(resolve => {
    const close = v => { bg.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    const bg = h('div', { class: 'modal-bg', onclick: e => { if (e.target === bg) close(null); } },
      h('div', { class: 'modal' + (cls ? ' ' + cls : ''), role: 'dialog', 'aria-modal': 'true' },
        h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': document.documentElement.lang === 'en' ? 'Close' : 'Schließen', html: ico('x'), onclick: () => close(null) }),
        eyebrow && h('div', { class: 'eyebrow' }, eyebrow), title && h('h3', {}, title), text && h('p', {}, text), body,
        h('div', { class: 'row' }, actions.map(a => h('button', { class: 'btn ' + (a.primary ? 'primary' : '') + (a.cls ? ' ' + a.cls : ''), onclick: () => { if (onAction && onAction(a.value) === false) return; close(a.value); } }, a.label)))));
    document.body.appendChild(bg);
    document.addEventListener('keydown', onKey);
    const f = bg.querySelector('input,textarea,button.primary'); if (f) setTimeout(() => f.focus(), 50);
  });
}

// Icons (Linien, 24er Raster)
const I = {
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z"/>',
  board: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  path: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5v.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  cards: '<rect x="3" y="7" width="14" height="12" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/>',
  pod: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16" y="14" width="4.5" height="6.5" rx="1.6"/>',
  note: '<path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  pen: '<path d="M4 20l4.5-1L19 8.5a2.1 2.1 0 0 0-3-3L5.5 16z"/><path d="m14.5 7 2.5 2.5"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h4"/>',
  home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3.5c0 1 1 1.5 1 2.5M12 3.5c0 1 1 1.5 1 2.5"/>',
  send: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sidebar: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  tune: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  cmd: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
  chart: '<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>',
  library: '<path d="M5 4h3v16H5zM10 4h3v16h-3z"/><path d="m15.2 5.2 2.9-.8 3.6 15.3-2.9.8z"/>',
  spark: '<path d="M12 4.5l1.9 5.6 5.6 1.9-5.6 1.9-1.9 5.6-1.9-5.6L4.5 12l5.6-1.9z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  refresh: '<path d="M20.5 12a8.5 8.5 0 1 1-8.5-8.5c2.4 0 4.66.95 6.37 2.6L20.5 8"/><path d="M20.5 3.5V8H16"/>',
  exam: '<path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 12l2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  map: '<circle cx="12" cy="12" r="3"/><circle cx="4.5" cy="6" r="2"/><circle cx="19.5" cy="6" r="2"/><circle cx="4.5" cy="18" r="2"/><circle cx="19.5" cy="18" r="2"/><path d="M6.3 7l3.2 3M17.7 7l-3.2 3M6.3 17l3.2-3M17.7 17l-3.2-3"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  // Gehirn seitlich: Hugeicons „brain-01“ (MIT-Lizenz) im eigenen Kopf-Umriss
  brain: '<path d="M15.5 21.5v-3.4c2.7-1.4 4.6-4.2 4.6-7.4A8.1 8.1 0 0 0 12 2.6a7.6 7.6 0 0 0-7.5 6.5l-1.3 3.4c-.2.5.2 1 .7 1H5v2.7c0 1.2 1 2.2 2.2 2.2H9v3.1"/><g transform="translate(7.20 3.10) scale(0.4500)" stroke-width="2.7"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"  d="M15.145 5.208a3.5 3.5 0 0 0-5.92 1.053A3 3 0 0 0 5 9.051m10.145-3.843a4.5 4.5 0 0 1 5.492 6.065m-5.492-6.065A4.51 4.51 0 0 0 12.028 9M9.05 14a2.5 2.5 0 0 0 2.45 2c.255 0 .382 0 .5.014a2 2 0 0 1 1.435.887c.065.099.122.213.236.44L15 20m-5.95-6a2.5 2.5 0 0 1 .95-2.5M9.05 14H4.5A2.5 2.5 0 1 1 5 9.05m15.637 2.223A2.5 2.5 0 0 0 17.05 13m3.587-1.727A2.5 2.5 0 0 1 19.5 16a1.733 1.733 0 0 0-1.622 2.34L18.5 20M5 9.05c.013.749.3 1.43.764 1.95"/></g>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16" y="14" width="4.5" height="6.5" rx="1.6"/>',
    shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2"/>',
  // Pfeife: Lucide „whistle“ (ISC-Lizenz)
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
  whistle: '<path d="M10 6v4"/><path d="M21 6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.675A7 7 0 1 1 9 6z"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
};
export const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;
export const icoEl = (n, cls) => { const s = document.createElement('span'); s.style.display = 'contents'; s.innerHTML = ico(n, cls); return s.firstChild; };

// Haptik (Android über navigator.vibrate; iPhone-Safari kann es nicht). Abschaltbar, respektiert „Bewegung reduzieren“.
export function haptic(kind = 'tap') {
  try {
    if (localStorage.getItem('tutor.haptics') === '0' || !navigator.vibrate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    navigator.vibrate(kind === 'ok' ? 12 : kind === 'bad' ? [16, 70, 16] : kind === 'done' ? [10, 50, 10, 50, 22] : 8);
  } catch (e) {}
}

// Gerade mitten im Lernen? Dann keine Werbung, keine Spaßfragen und kein „Klick mich – ich führ dich durch“.
const LEARN_TABS = ['tutor', 'pfad', 'quiz', 'karten', 'podcast', 'zettel'];
export function learningNow() {
  const p = location.hash.replace(/^#\/?/, '').split('/');
  if (p[0] !== 'app') return false;
  if (['tutor', 'trainer', 'challenge', 'rechner'].includes(p[1])) return true;   // Tutor-Raum, BWL-Trainer, Challenge, Rechner
  if (p[1] && LEARN_TABS.includes(p[2])) return true;                              // Karten, Quiz, Podcast, Lernzettel, Lernpfad, Max zum Skript
  return !!document.querySelector('.vmode, .qz-exam, .exam-run, .rm-timer:not([hidden])');
}
