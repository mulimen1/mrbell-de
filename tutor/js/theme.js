import { $$, ico, ls } from './util.js';
// ---------- Theme ----------
export function applyThemeButtons() {
  $$('[data-theme-toggle]').forEach(b => {
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
      // Jeder Besuch startet dunkel; die Wahl gilt nur für diesen Besuch.
      try { sessionStorage.setItem('tutor.theme', next); } catch (e) {}
    };
  });
}

