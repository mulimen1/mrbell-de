import { $$, ico, ls } from './util.js';
// ---------- Theme ----------
export function applyThemeButtons() {
  $$('[data-theme-toggle]').forEach(b => {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    b.innerHTML = ico(dark ? 'sun' : 'moon');
    b.onclick = () => {
      const now = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = now ? 'light' : 'dark';
      // Jeder Besuch startet dunkel; die Wahl gilt nur für diesen Besuch.
      try { sessionStorage.setItem('tutor.theme', document.documentElement.dataset.theme); } catch (e) {}
      applyThemeButtons();
    };
  });
}

