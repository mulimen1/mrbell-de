import { $$, ico, ls } from './util.js';
// ---------- Theme ----------
export function applyThemeButtons() {
  $$('[data-theme-toggle]').forEach(b => {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    b.innerHTML = ico(dark ? 'sun' : 'moon');
    b.onclick = () => {
      const now = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = now ? 'light' : 'dark';
      ls.set('tutor.theme', document.documentElement.dataset.theme);
      applyThemeButtons();
    };
  });
}

