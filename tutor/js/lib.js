// Bibliothek-Speicher: jede Tafel wird automatisch abgelegt – mit Skript im Skript, sonst unter „Ohne Skript“.
// Jede Tafel bekommt eine Überschrift und eine kurze Beschreibung, worum es ging (aus Frage und Tafelinhalt – ohne extra KI-Aufruf).
// Nach dem Speichern kommt eine kleine Meldung „In der Bibliothek gespeichert · Ansehen“.
import { h, ico, ls, toast } from './util.js';
import { L } from './i18n.js';
import { save, S } from './state.js';

const LOOSE = 'tutor.lib.boards', MAX_LOOSE = 60;
const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + ' …' : s);
const GENERIC = /^(tafel|whiteboard|board)$/i;

// Frage ohne vorangestellten Kontext („[…]\n“)
export function plainQ(q) { return clean(String(q || '').replace(/^(\[[^\]]*\]\s*)+/, '')); }

// Überschrift + Beschreibung aus dem Tafelinhalt
// Erste Sätze von Max’ Antwort – das ist die beste Zusammenfassung dessen, worüber gesprochen wurde
function gist(answer) {
  const t = clean(String(answer || '').replace(/```[\s\S]*?(```|$)/g, ' ').replace(/[*_#>`]+/g, '').replace(/\[(.*?)\]\([^)]*\)/g, '$1'));
  if (t.length < 25) return '';
  const ss = t.match(/[^.!?]+[.!?]+/g) || [t];
  let out = '';
  for (const x of ss) { if ((out + x).length > 150 && out) break; out += x; if (out.length > 60) break; }
  return cut(clean(out), 150);
}
export function boardMeta(b, question = '', answer = '') {
  // DOMParser: inert – nichts wird geladen oder ausgeführt
  let box; try { box = new DOMParser().parseFromString(String(b.html || ''), 'text/html').body; } catch (e) { box = document.createElement('div'); }
  box.querySelectorAll('script,style,svg').forEach(x => x.remove());
  const heads = [...box.querySelectorAll('h1,h2,h3,h4,strong.k,b.k')].map(x => clean(x.textContent)).filter(t => t && t.length < 70);
  const firstP = clean([...box.querySelectorAll('p,li,div.result')].map(x => x.textContent).find(t => clean(t).length > 20) || '');
  const q = plainQ(question);
  let title = clean(b.title);
  if (!title || GENERIC.test(title)) title = heads[0] || (q ? cut(q.replace(/[?!.]+$/, ''), 60) : L('Tafel', 'Board'));
  const parts = [...new Set(heads.filter(t => t.toLowerCase() !== title.toLowerCase()))].slice(0, 4);
  let sum = gist(answer) || (parts.length >= 2 ? L('Behandelt: ', 'Covers: ') + parts.join(' · ') : firstP ? cut(firstP, 120) : '');
  if (!sum && parts.length) sum = parts[0];
  return { title: cut(title, 80), sum: cut(sum, 150), topics: parts.slice(0, 4), q: q ? cut(q, 120) : '' };
}

export function looseBoards() { return ls.get(LOOSE, []) || []; }
export function setLooseBoards(a) { ls.set(LOOSE, a.slice(-MAX_LOOSE)); }

// Tafeln ablegen. Gibt die angereicherten Tafeln zurück (für Verweise im Chat).
export function keepBoards(boards, { doc = null, question = '', answer = '', quiet = false } = {}) {
  const list = (boards || []).filter(b => b && b.html);
  if (!list.length) return [];
  const at = Date.now();
  const rich = list.map(b => ({ ...b, ...boardMeta(b, question, answer), at }));
  if (doc) {
    doc.boards ||= [];
    rich.forEach(b => doc.boards.push(b));
    if (doc.boards.length > 60) doc.boards = doc.boards.slice(-60);
    save(doc);
  } else {
    const a = looseBoards();
    rich.forEach(b => { if (!a.some(x => x.html === b.html)) a.push(b); });
    setLooseBoards(a);
  }
  if (!quiet) savedToast('tafeln', rich.length);
  return rich;
}

// „In der Bibliothek gespeichert · Ansehen“
const WHAT = {
  tafeln: n => (n > 1 ? L(`${n} Tafeln in der Bibliothek gespeichert`, `${n} boards saved to your library`) : L('Tafel in der Bibliothek gespeichert', 'Board saved to your library')),
  karten: () => L('Karteikarten in der Bibliothek gespeichert', 'Flashcards saved to your library'),
  quiz: () => L('Quiz in der Bibliothek gespeichert', 'Quiz saved to your library'),
  zettel: () => L('Lernzettel in der Bibliothek gespeichert', 'Study sheet saved to your library'),
  podcasts: () => L('Podcast in der Bibliothek gespeichert', 'Podcast saved to your library'),
};
let lastToast = 0;
// „Gerade erstellt“ merken – egal was, egal wo: oben rechts bleibt 5 Minuten ein Weg dorthin, danach ein Punkt an der Bibliothek, bis man's geöffnet hat
export function markMade(kind, o = {}) {
  const base = (o.base || o.href || location.hash.split('?')[0]).replace(/\/(auto|exam|fehler)$/, '');
  ls.set('tutor.justMade', { kind, at: Date.now(), href: o.href || base, base, name: o.name != null ? o.name : ((S.doc && S.doc.name) || ''), seen: false });
  try { window.dispatchEvent(new Event('bm:justmade')); } catch (e) {}
}
export function savedToast(kind, n = 1, o = {}) {
  if (kind !== 'tafeln') markMade(kind, o);
  if (Date.now() - lastToast < 1500) return;   // nicht doppelt
  try { if (sessionStorage.getItem('bm.adEntry')) return; } catch (e) {}   // Einstieg über Google-Anzeige: nicht überfordern
  // Tafeln entstehen ständig: der Hinweis kommt nur die ersten 2 Male – danach weiß man's, und er verdeckt sonst die Knöpfe unter der Tafel
  if (kind === 'tafeln') { const n0 = +(ls.get('tutor.libToastN', 0) || 0); if (n0 >= 2) return; ls.set('tutor.libToastN', n0 + 1); }
  lastToast = Date.now();
  const go = h('a', { class: 'toast-undo', href: '#/app/bibliothek/' + kind }, L('Ansehen', 'View'));
  toast(h('span', { class: 'toast-row lib-toast' }, h('span', { class: 'lib-ok', 'aria-hidden': 'true', html: ico('check') }), (WHAT[kind] || WHAT.quiz)(n), go), 3600);
  // Gerade aus „Werkzeug + Upload“ gebaut? Danach – als Extra – den Lernplan anbieten
  const ad = ls.get('tutor.addon', null);
  if (ad && Date.now() - (ad.at || 0) < 90 * 60e3 && location.hash.includes(ad.doc)) {
    ls.set('tutor.addon', null);
    setTimeout(() => toast(h('span', { class: 'toast-row lib-toast' }, L('Willst du noch einen Lernplan bis zur Klausur?', 'Want a study plan up to your exam too?'), h('a', { class: 'toast-undo', href: `#/app/${ad.doc}/plan` }, L('Lernplan', 'Study plan'))), 7000), 3800);
  }
}
