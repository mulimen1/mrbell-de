import { $$, ico, ls } from './util.js';
import { L } from './i18n.js';
// ---------- Theme ----------
export function applyThemeButtons() {
  $$('[data-theme-toggle]').forEach(b => {
    // Farbpalette sitzt direkt neben Hell/Dunkel (überall, wo es den Knopf gibt)
    if (!(b.previousElementSibling && b.previousElementSibling.hasAttribute('data-accent-btn'))) b.before(accentButton());
    syncAccent();
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    b.innerHTML = ico(dark ? 'sun' : 'moon');
    b.onclick = () => {
      const now = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      const next = now ? 'light' : 'dark';
      const flip = () => { document.documentElement.dataset.theme = next; applyThemeButtons(); };
      // Hell/Dunkel: weicher Kreis aus dem Knopf, der langsam die ganze Seite umfärbt
      const r = b.getBoundingClientRect(), H = document.documentElement;
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        H.classList.add('theme-vt'); H.style.setProperty('--tx', x + 'px'); H.style.setProperty('--ty', y + 'px'); H.style.setProperty('--tr', rad + 'px');
        const vt = document.startViewTransition(flip);
        vt.finished.finally(() => H.classList.remove('theme-vt'));
      } else {
        H.classList.add('theme-fade'); flip(); setTimeout(() => H.classList.remove('theme-fade'), 900);
      }
      // Jeder Besuch startet hell; die Wahl gilt nur für diesen Besuch (auch nach dem Sprachwechsel).
      try { sessionStorage.setItem('tutor.theme', next); } catch (e) {}
    };
  });
}

// ---------- Farbpalette ----------
// 10 gedeckte Akzentfarben. Hintergrund und Text bleiben schwarz/weiß – die Farbe ersetzt das „Schwarz“
// der Akzente (Knöpfe, aktive Tabs, Chips, Häkchen, Fortschritt). Jede Farbe hat einen Ton für Hell und einen
// helleren für Dunkel, damit weiße Schrift darauf immer lesbar bleibt. Die Werte stehen in app.css.
export const ACCENTS = [
  ['', 'Standard', 'Default', '#0a0a0a', '#f5f5f5'],
  ['navy', 'Navy', 'Navy', '#1f3a5f', '#3d6299'],
  ['kobalt', 'Kobalt', 'Cobalt', '#1f4fbf', '#3f6bd0'],
  ['petrol', 'Petrol', 'Teal', '#0e5a63', '#1d7a85'],
  ['gruen', 'Grün', 'Forest', '#1f5137', '#2f7a55'],
  ['oliv', 'Oliv', 'Olive', '#4f5b23', '#6b7833'],
  ['cognac', 'Cognac', 'Cognac', '#7a4523', '#9c5c2c'],
  ['bordeaux', 'Bordeaux', 'Burgundy', '#7b1e2e', '#a83346'],
  ['aubergine', 'Aubergine', 'Plum', '#4e2a5f', '#7a4a91'],
  ['graphit', 'Graphit', 'Graphite', '#3f4650', '#646d79']
];
const ACC_KEY = 'tutor.accent';
export const getAccent = () => document.documentElement.dataset.accent || '';
function showAccent(id) { const H = document.documentElement; if (id) H.dataset.accent = id; else delete H.dataset.accent; }
const remember = id => { try { if (id) localStorage.setItem(ACC_KEY, id); else localStorage.removeItem(ACC_KEY); } catch (e) {} };
// Farbe wechseln – mit Animation: Kreis aus dem angeklickten Farbtupfer färbt die Seite um (wie Hell/Dunkel).
// Gespeichert auf dem Gerät (bleibt nach Ab-/Anmelden) und in „Mein Bereich“ (mit Sync auch auf anderen Geräten).
export function setAccent(id, from) {
  if (!ACCENTS.some(a => a[0] === id)) id = '';
  remember(id);
  import('./me.js').then(M => { if (M.getMe().accent !== id) M.updateMe(m => { m.accent = id; }, { quiet: true }); }).catch(() => {});
  if (id === getAccent()) return;
  const H = document.documentElement;
  if (from && document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const r = from.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    H.classList.add('theme-vt'); H.style.setProperty('--tx', x + 'px'); H.style.setProperty('--ty', y + 'px');
    H.style.setProperty('--tr', Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 'px');
    document.startViewTransition(() => showAccent(id)).finished.finally(() => H.classList.remove('theme-vt'));
  } else { H.classList.add('theme-fade'); showAccent(id); setTimeout(() => H.classList.remove('theme-fade'), 900); }
}
// Aus „Mein Bereich“ übernehmen (z. B. nach dem Anmelden auf einem anderen Gerät)
let accSynced = false;
function syncAccent() {
  if (accSynced) return; accSynced = true;
  import('./me.js').then(M => {
    const take = m => { if (m && typeof m.accent === 'string' && ACCENTS.some(a => a[0] === m.accent) && m.accent !== getAccent()) { remember(m.accent); const H = document.documentElement; H.classList.add('theme-fade'); showAccent(m.accent); setTimeout(() => H.classList.remove('theme-fade'), 900); } };
    take(M.getMe()); M.onMe(take);
  }).catch(() => {});
}
function accentButton() {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'iconbtn acc-btn'; b.setAttribute('data-accent-btn', '');
  b.setAttribute('aria-label', L('Farbe wählen', 'Choose colour')); b.title = L('Farbe', 'Colour');
  b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', 'false');
  b.innerHTML = '<i class="acc-dot" aria-hidden="true"></i>';
  b.onclick = e => { e.stopPropagation(); document.querySelector('.acc-pop') ? closeAccent() : openAccent(b); };
  return b;
}
let accClose = null;
function closeAccent() { if (accClose) accClose(); }
function openAccent(btn) {
  closeAccent();
  const saved = getAccent();
  const pop = document.createElement('div');
  pop.className = 'acc-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', L('Farbe', 'Colour'));
  const head = document.createElement('div'); head.className = 'acc-h';
  head.innerHTML = `<b>${L('Farbe anpassen', 'Choose your colour')}</b><small>${L('Knöpfe, Tabs & Fortschritt', 'Buttons, tabs & progress')}</small>`;
  const grid = document.createElement('div'); grid.className = 'acc-grid'; grid.setAttribute('role', 'radiogroup');
  let chosen = saved;
  const sws = ACCENTS.map(([id, de, en, c, cd]) => {
    const s = document.createElement('button');
    s.type = 'button'; s.className = 'acc-sw' + (id ? '' : ' std'); s.setAttribute('role', 'radio');
    s.style.setProperty('--c', c); s.style.setProperty('--cd', cd);
    s.setAttribute('aria-checked', String(id === saved)); s.setAttribute('aria-label', L(de, en));
    s.innerHTML = `<i>${ico('check')}</i><span>${L(de, en)}</span>`;
    // Klick = sofort übernehmen (mit Animation); das Fenster bleibt offen zum Weiterprobieren
    s.onclick = () => { chosen = id; sws.forEach(x => x.setAttribute('aria-checked', String(x === s))); setAccent(id, s); };
    return s;
  });
  grid.append(...sws);
  pop.append(head, grid);
  document.body.appendChild(pop);
  const place = () => {
    const r = btn.getBoundingClientRect(), w = pop.offsetWidth;
    pop.style.top = Math.round(r.bottom + 8) + 'px';
    pop.style.left = Math.round(Math.max(8, Math.min(innerWidth - w - 8, r.right - w))) + 'px';
  };
  place();
  btn.setAttribute('aria-expanded', 'true');
  const onDown = e => { if (!pop.contains(e.target) && !btn.contains(e.target)) closeAccent(); };
  const onKey = e => { if (e.key === 'Escape') { closeAccent(); btn.focus(); } };
  setTimeout(() => { addEventListener('pointerdown', onDown, true); }, 0);
  addEventListener('keydown', onKey); addEventListener('resize', closeAccent);
  accClose = () => {
    accClose = null; btn.setAttribute('aria-expanded', 'false');
    removeEventListener('pointerdown', onDown, true); removeEventListener('keydown', onKey); removeEventListener('resize', closeAccent);
    pop.classList.add('out'); setTimeout(() => pop.remove(), 160);
  };
  setTimeout(() => (sws.find(x => x.getAttribute('aria-checked') === 'true') || sws[0]).focus({ preventScroll: true }), 30);
}

