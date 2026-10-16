// Prüfungsreife: Wie sicher sitzt der Stoff am Klausurtag? Aus FSRS-Stabilität, Quiz-Treffern und Abdeckung.
// Bewusst ohne Notenprognose (die demotiviert schwächere Studis nachweislich) – stattdessen der nächste Schritt.
import { retrievability } from './fsrs.js';

const DAY = 864e5;
const R = (c, at) => {
  if (c.s == null && !c.reps) return 0;
  const s = c.s != null ? c.s : Math.max(0.5, c.ivl || 0.5);
  const last = c.last || (c.due && c.ivl ? c.due - c.ivl * DAY : Date.now());
  return retrievability(Math.max(0, (at - last) / DAY), s);
};

// Themen eines Skripts: Kapitel des Lernpfads (Karten über Seiten zugeordnet), sonst Kartenstapel
function topics(d) {
  const cards = d.decks.flatMap(k => k.cards.map(c => ({ c, k })));
  const ch = d.path?.chapters || [];
  if (ch.length) {
    const t = ch.map((x, i) => ({ name: x.title, cards: [], done: !!x.done, i }));
    for (const { c, k } of cards) {
      let i = k.chapter != null && t[k.chapter] ? k.chapter : -1;
      if (i < 0 && c.page) i = ch.findIndex(x => x.pages && c.page >= x.pages[0] && c.page <= (x.pages[1] || x.pages[0]));
      if (i >= 0) t[i].cards.push(c);
    }
    return t;
  }
  return d.decks.filter(k => k.cards.length).map(k => ({ name: k.title, cards: k.cards, done: false }));
}

// docs: Skripte des Fachs; examAt: Klausurtermin (ms) oder 0 → Blick eine Woche voraus
export function reife(docs, examAt = 0) {
  const now = Date.now(), at = examAt > now ? examAt : now + 7 * DAY;
  const all = docs.flatMap(d => d.decks.flatMap(k => k.cards));
  const rev = all.filter(c => c.s != null || c.reps);
  const M = rev.length ? rev.reduce((a, c) => a + R(c, at), 0) / rev.length : null;
  const ans = docs.reduce((a, d) => a + (d.stats?.answered || 0), 0), cor = docs.reduce((a, d) => a + (d.stats?.correct || 0), 0);
  const A = ans ? (cor + 1) / (ans + 2) : null;
  const chap = docs.flatMap(d => d.path?.chapters || []);
  const cov = all.length ? rev.length / all.length : chap.length ? chap.filter(c => c.done).length / chap.length : ans ? Math.min(1, ans / 20) : 0;
  const q = M != null && A != null ? 0.5 * M + 0.5 * A : M != null ? M : A != null ? A : 0;
  const score = Math.round(100 * cov * q);
  // Themen: gefestigt, wenn die mittlere Abrufwahrscheinlichkeit am Klausurtag ≥ 0,85 (ungeübte Karten zählen als 0)
  const th = docs.flatMap(d => topics(d)).filter(t => t.cards.length);
  const fest = th.filter(t => t.cards.reduce((a, c) => a + R(c, at), 0) / t.cards.length >= 0.85).length;
  // Nächster Schritt: Karten, die am Klausurtag unter 85 % lägen
  const weak = rev.filter(c => R(c, at) < 0.85).length, neu = all.length - rev.length;
  const due = all.filter(c => (c.due || 0) <= now).length;
  return { score, cov, M, A, ans, cards: all.length, rev: rev.length, themen: th.length, fest, weak, neu, due, hasData: !!(all.length || ans || chap.length) };
}
