// Was Max über dich weiß: Skripte, was du damit schon gemacht hast, Fächer, Klausuren, letzte Aktivität.
// Wird jeder Nachricht kompakt vorangestellt – Max soll nie sagen „kann ich nicht sehen“, wenn es hier steht.
import { S, mastery } from './state.js';
import { L } from './i18n.js';
import { getMe, fachOf } from './me.js';
import { dueCards } from './views/cards.js';

const ago = t => {
  if (!t) return '';
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return L('gerade eben', 'just now');
  if (m < 60) return L(`vor ${m} Min.`, `${m} min ago`);
  const h = Math.round(m / 60);
  if (h < 24) return L(`vor ${h} Std.`, `${h} h ago`);
  const d = Math.round(h / 24);
  return d === 1 ? L('gestern', 'yesterday') : L(`vor ${d} Tagen`, `${d} days ago`);
};
const q = s => L(`„${s}“`, `“${s}”`);

export function knowledge(max = 8) {
  const live = id => (S.doc && S.doc.id === id ? S.doc : null);
  const docs = (S.list || []).map(d => live(d.id) || d)
    .sort((a, b) => Math.max(b.used || 0, b.created || 0) - Math.max(a.used || 0, a.created || 0)).slice(0, max);
  const events = [];
  const parts = docs.map((d, i) => {
    const bits = [];
    const f = fachOf(d.id);
    bits.push((d.generated ? L('Kurzskript zum Thema, erstellt ', 'short script on a topic, made ') : L('hochgeladen ', 'uploaded ')) + ago(d.created) + (d.pages?.length ? `, ${d.pages.length} ${L('S.', 'p.')}` : '') + (f ? L(`, Fach ${f.name}`, `, subject ${f.name}`) : ''));
    events.push([d.created, (d.generated ? L('Kurzskript erstellt: ', 'Short script made: ') : L('Skript hochgeladen: ', 'Slides uploaded: ')) + q(d.name)]);
    const cards = (d.decks || []).flatMap(x => x.cards || []);
    if (cards.length) {
      const due = dueCards(d).length, learned = cards.filter(c => (c.reps || 0) > 0).length;
      bits.push(L(`Karteikarten: ${(d.decks || []).length} Stapel, ${cards.length} Karten (${due} fällig, ${learned} schon wiederholt)`, `flashcards: ${(d.decks || []).length} decks, ${cards.length} cards (${due} due, ${learned} reviewed)`));
      (d.decks || []).forEach(x => x.created && events.push([x.created, L('Karteikarten erstellt zu ', 'Flashcards made for ') + q(d.name)]));
    } else bits.push(L('noch keine Karteikarten', 'no flashcards yet'));
    const qs = (d.quizzes || []);
    if (qs.length) {
      const done = qs.filter(x => x.results?.length);
      const last = done.at(-1)?.results?.at(-1);
      bits.push(L(`Quiz: ${qs.length} erstellt`, `quizzes: ${qs.length} made`) + (last ? L(`, zuletzt ${Math.round((last.score || 0) * 100)} %`, `, last ${Math.round((last.score || 0) * 100)} %`) : L(', noch keins gemacht', ', none taken yet')));
      qs.forEach(x => x.created && events.push([x.created, L('Quiz erstellt zu ', 'Quiz made for ') + q(d.name)]));
    }
    if (d.path?.chapters?.length) bits.push(L(`Lernpfad ${d.path.chapters.filter(c => c.done).length}/${d.path.chapters.length} Kapitel`, `study path ${d.path.chapters.filter(c => c.done).length}/${d.path.chapters.length} chapters`));
    if (d.summary) { bits.push(L('Lernzettel fertig', 'study sheet ready')); if (d.summary.created) events.push([d.summary.created, L('Lernzettel erstellt zu ', 'Study sheet made for ') + q(d.name)]); }
    if ((d.podcasts || []).length) { bits.push(L(`Podcast: ${d.podcasts.length}`, `podcasts: ${d.podcasts.length}`)); d.podcasts.forEach(x => x.created && events.push([x.created, L('Podcast erstellt zu ', 'Podcast made for ') + q(d.name)])); }
    if ((d.boards || []).length) bits.push(L(`${d.boards.length} Tafeln`, `${d.boards.length} boards`));
    if (d.plan?.exam) bits.push(L(`Klausurplan bis ${d.plan.exam}`, `exam plan until ${d.plan.exam}`));
    const m = mastery(d); if (m) bits.push(L(`Lernstand ${m} %`, `progress ${m} %`));
    return `${i + 1}) ${q(d.name)} – ${bits.join('; ')}`;
  });
  const me = getMe() || {};
  const fa = (me.faecher || []).slice(0, 10).map(f => f.name + (f.klausur ? L(` (Klausur ${f.klausur})`, ` (exam ${f.klausur})`) : ''));
  const last = events.filter(e => e[0]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(e => `${e[1]} (${ago(e[0])})`);
  if (!parts.length && !fa.length) return L('[Was du über den Nutzer weißt: Noch kein Skript hochgeladen, keine Fächer angelegt.]', '[What you know about the user: no slides uploaded yet, no subjects set up.]');
  return L('[Was du über den Nutzer weißt – aktuell und verlässlich, nutze es aktiv, frag nicht danach und sag nie, du könntest es nicht sehen: ', '[What you know about the user – current and reliable; use it actively, don’t ask for it and never say you can’t see it: ')
    + (parts.length ? L('Skripte: ', 'Slides: ') + parts.join(' · ') : L('Noch kein Skript.', 'No slides yet.'))
    + (fa.length ? L(' | Fächer: ', ' | Subjects: ') + fa.join(', ') : '')
    + (last.length ? L(' | Zuletzt: ', ' | Recently: ') + last.join('; ') : '') + ']';
}
