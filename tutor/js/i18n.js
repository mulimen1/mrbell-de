// Sprache: Deutsch (Standard) oder Englisch. L('deutsch', 'english') gibt den Text in der aktiven Sprache.
import { ls } from './util.js';

export const lang = (() => {
  try { const q = new URLSearchParams(location.search).get('lang'); if (q === 'de' || q === 'en') { ls.set('tutor.lang', q); return q; } } catch (e) {}
  const v = ls.get('tutor.lang', null);
  if (v === 'de' || v === 'en') return v;
  // Suchmaschinen (Googlebot crawlt mit Englisch) bekommen immer die deutsche Seite – sonst landet der englische Titel bei Google
  if (/bot|crawl|spider|slurp|google-inspectiontool|lighthouse/i.test(navigator.userAgent || '')) return 'de';
  return /^de\b|^de-/i.test(navigator.language || 'de') ? 'de' : 'en';
})();
export const EN = lang === 'en';
export const L = (de, en) => (EN && en != null ? en : de);
export const LOCALE = EN ? 'en-GB' : 'de-DE';
export function setLang(v) { ls.set('tutor.lang', v); location.reload(); }
document.documentElement.lang = lang;

// Sprache der Inhalte (Max' Antworten, Quiz, Podcast …) – unabhängig von der Oberfläche einstellbar
export const getOutLang = () => { const v = ls.get('tutor.outLang', null); return v === 'de' || v === 'en' ? v : lang; };
export const setOutLang = v => { ls.set('tutor.outLang', v); document.documentElement.dataset.out = getOutLang(); };
document.documentElement.dataset.out = getOutLang();   // Tafel-Beschriftungen (Beispiel, Achtung …) in der Sprache der Inhalte
