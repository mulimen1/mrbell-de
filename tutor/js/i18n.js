// Sprache: Deutsch (Standard) oder Englisch. L('deutsch', 'english') gibt den Text in der aktiven Sprache.
import { ls } from './util.js';

export const lang = (() => {
  try { const q = new URLSearchParams(location.search).get('lang'); if (q === 'de' || q === 'en') { ls.set('tutor.lang', q); return q; } } catch (e) {}
  const v = ls.get('tutor.lang', null);
  if (v === 'de' || v === 'en') return v;
  return /^de\b|^de-/i.test(navigator.language || 'de') ? 'de' : 'en';
})();
export const EN = lang === 'en';
export const L = (de, en) => (EN && en != null ? en : de);
export const LOCALE = EN ? 'en-GB' : 'de-DE';
export function setLang(v) { ls.set('tutor.lang', v); location.reload(); }
document.documentElement.lang = lang;
