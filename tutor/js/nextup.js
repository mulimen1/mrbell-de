// „Als Nächstes“: am Ende jedes Werkzeugs die sinnvollsten nächsten Schritte zum selben Stoff – so wird aus einzelnen Tools ein Lernweg.
import { h, ico } from './util.js';
import { L } from './i18n.js';

const C = { karten: ['#1aa39a', '#0e7a88'], quiz: ['#9b7cf0', '#5b3fc4'], zettel: ['#f7c948', '#d99a1c'], podcast: ['#f06a9b', '#c8336f'], pfad: ['#6f8cff', '#4840b5'], tafel: ['#4f9cf5', '#1a5fc4'], plan: ['#f39b52', '#d9601c'] };

export function nextUp(ctx, current, { title = L('Als Nächstes', 'Up next'), max = 3, extra = [] } = {}) {
  const d = ctx && ctx.doc; if (!d) return null;
  const due = (d.decks || []).reduce((a, k) => a + k.cards.filter(c => (c.due || 0) <= Date.now()).length, 0);
  const nCards = (d.decks || []).reduce((a, k) => a + k.cards.length, 0);
  const open = d.path ? d.path.chapters.findIndex(c => !c.done) : -1;
  const items = [
    ...extra,
    { k: 'karten', ic: 'cards', t: nCards ? (due ? L(`${due} Karten fällig`, `${due} cards due`) : L('Karteikarten', 'Flashcards')) : L('Karteikarten dazu', 'Flashcards on this'), s: nCards ? L('Wiederholen, bevor du’s vergisst', 'Review before you forget') : L('Begriffe & Formeln zum Abfragen', 'Terms & formulas to drill'), go: () => ctx.go('karten'), w: due ? 5 : nCards ? 1 : 3 },
    { k: 'quiz', ic: 'quiz', t: (d.mistakes || []).length ? L(`Fehler wiederholen · ${d.mistakes.length}`, `Review mistakes · ${d.mistakes.length}`) : L('Quiz machen', 'Take a quiz'), s: (d.mistakes || []).length ? L('Was du falsch hattest – bis es sitzt', 'What you got wrong – until it sticks') : L('Sechs Fragetypen, wie in der Klausur', 'Six question types, like the exam'), go: () => ctx.go('quiz', (d.mistakes || []).length ? 'fehler' : undefined), w: (d.mistakes || []).length ? 4 : 3 },
    { k: 'zettel', ic: 'note', t: d.summary ? L('Lernzettel lesen', 'Read study sheet') : L('Lernzettel erstellen', 'Create study sheet'), s: L('Alles Wichtige auf einer Seite', 'Everything key on one page'), go: () => ctx.go('zettel'), w: d.summary ? 1 : 2 },
    { k: 'podcast', ic: 'headphones', t: (d.podcasts || []).length ? L('Folge anhören', 'Listen to episode') : L('Als Podcast anhören', 'Listen as a podcast'), s: L('Marie & Max – für Bahn und Gym', 'Marie & Max – for the train and gym'), go: () => ctx.go('podcast'), w: 1.5 },
    { k: 'pfad', ic: 'path', t: d.path ? (open >= 0 ? L(`Lernpfad · Kapitel ${open + 1}`, `Study path · chapter ${open + 1}`) : L('Lernpfad geschafft', 'Study path done')) : L('Lernpfad bauen', 'Build study path'), s: d.path && open >= 0 ? d.path.chapters[open].title : L('Kapitel für Kapitel mit Checks', 'Chapter by chapter with checks'), go: () => ctx.go('pfad', d.path && open >= 0 ? String(open) : undefined), w: d.path && open >= 0 ? 2.5 : 1.2 },
    { k: 'tafel', ic: 'board', t: L('Max erklärt an der Tafel', 'Max explains on the board'), s: L('Was noch wackelt – Schritt für Schritt', 'What’s still shaky – step by step'), go: () => ctx.ask(L(`Erklär mir das Schwierigste aus „${d.name}“ an der Tafel – kurz, mit Beispiel.`, `Explain the hardest part of “${d.name}” on the board – briefly, with an example.`)), w: 2 },
  ].filter(x => x.k !== current).sort((a, b) => b.w - a.w).slice(0, max);
  if (!items.length) return null;
  return h('section', { class: 'nx' }, h('div', { class: 'nx-h' }, h('i'), h('b', {}, title)),
    h('div', { class: 'nx-g' }, items.map(x => h('button', { type: 'button', class: 'nx-it', style: { '--c1': (C[x.k] || C.tafel)[0], '--c2': (C[x.k] || C.tafel)[1] }, onclick: x.go },
      h('span', { class: 'nx-ic', html: ico(x.ic) }), h('span', { class: 'nx-t' }, h('b', {}, x.t), h('small', {}, x.s)), h('span', { class: 'nx-ar', html: ico('right') })))));
}
