// Übersicht eines Skripts: Pinnwand mit allen Lernwegen
import { h, ico, ago, ls, modal } from '../util.js';
import { face } from '../face.js';
import { mastery, save } from '../state.js';
import { generatePath, pathPending } from './path.js';
import { apiError } from '../ui.js';
import { dueCards } from './cards.js';
import { L } from '../i18n.js';

export async function render(root, ctx) {
  const { doc, arg } = ctx;
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  const m = mastery(doc);
  const P = doc.path;
  const nextIdx = P ? P.chapters.findIndex(c => !c.done) : -1;
  const due = dueCards(doc).length;
  const lastQuiz = doc.quizzes[doc.quizzes.length - 1];
  const best = lastQuiz && lastQuiz.results?.length ? Math.round(100 * Math.max(...lastQuiz.results.map(r => r.score))) : null;

  // Schnellfrage an den Tutor
  const f = h('div', { class: 'face', style: { width: '64px', height: '64px' } });
  const inp = h('input', { class: 'field', placeholder: L('Frag Max etwas zu deinem Skript …', 'Ask Max anything about your slides …'), style: { background: 'transparent', color: 'inherit', borderColor: 'color-mix(in srgb, var(--onInv) 30%, transparent)' } });
  const quick = h('form', { style: { display: 'flex', gap: '8px', marginTop: 'auto' }, onsubmit: e => { e.preventDefault(); const t = inp.value.trim(); if (t) ctx.ask(t); else ctx.go('tutor'); } },
    inp, h('button', { class: 'send', style: { background: 'var(--onInv)', color: 'var(--inv)' }, 'aria-label': L('Fragen', 'Ask'), html: ico('send') }));
  quick.addEventListener('click', e => e.stopPropagation());

  const pathTile = h('button', { class: 'tile half', onclick: () => ctx.go('pfad', nextIdx >= 0 ? String(nextIdx) : null) });
  const fillPath = () => {
    const P = doc.path;
    pathTile.replaceChildren(h('div', { class: 'ti', html: ico('path') }),
      h('h3', {}, P ? (nextIdx >= 0 ? L(`Weiter: ${P.chapters[nextIdx].title}`, `Next: ${P.chapters[nextIdx].title}`) : L('Lernpfad geschafft', 'Study path completed')) : L('Lernpfad', 'Study path')),
      h('p', {}, P ? L(`${P.chapters.filter(c => c.done).length} von ${P.chapters.length} Kapiteln`, `${P.chapters.filter(c => c.done).length} of ${P.chapters.length} chapters`) : pathPending(doc) ? L('Wird gerade erstellt …', 'Being built right now …') : L('Kapitel, Lektionen und Aufgaben aus deinem Skript.', 'Chapters, lessons and exercises from your slides.')),
      h('div', { class: 'foot' }, P ? h('span', { class: 'weight' }, P.chapters.map(c => h('i', { class: c.done ? 'on' : '' }))) : pathPending(doc) ? h('span', { class: 'spinner' }) : L('Erstellen · 2 Einheiten', 'Create · 2 credits')));
  };
  fillPath();

  wrap.append(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, L(`${doc.pages.length} Seiten · hinzugefügt ${ago(doc.created)}`, `${doc.pages.length} pages · added ${ago(doc.created)}`)), h('h2', {}, doc.path?.title || doc.name), doc.path?.summary ? h('p', {}, doc.path.summary) : null)),
    h('div', { class: 'hub' },
      h('div', { class: 'tile big dark', role: 'button', tabindex: 0, onclick: () => ctx.go('tutor') },
        h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center' } }, f, h('div', {}, h('h3', { style: { fontSize: '22px' } }, L('Frag deinen BWL Max', 'Ask your BWL Max')), h('p', {}, L('Kennt dein Skript, erklärt an der Tafel. Ein bisschen arrogant. Aber er hat recht.', 'Knows your slides, explains on the whiteboard. A little arrogant. But he’s right.')))),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '14px 0' } },
          (L(['Fass das Skript in 5 Punkten zusammen', 'Was ist am wichtigsten für die Klausur?', 'Erklär mir das schwierigste Thema'], ['Summarise the slides in 5 points', 'What matters most for the exam?', 'Explain the hardest topic to me'])).map(t => h('button', { class: 'chip', style: { background: 'transparent', color: 'inherit', borderColor: 'color-mix(in srgb, var(--onInv) 30%, transparent)' }, onclick: e => { e.stopPropagation(); ctx.ask(t); } }, t))),
        quick),
      h('div', { class: 'tile', role: 'button', tabindex: 0, onclick: () => ctx.go('pfad') },
        h('div', { class: 'ring', style: { '--p': m } }, h('div', {}, m + '%')),
        h('h3', { style: { marginTop: '8px' } }, L('Lernstand', 'Progress')), h('p', {}, m >= 80 ? L('Klausurbereit – halte es frisch.', 'Exam-ready – keep it fresh.') : m >= 40 ? L('Auf gutem Weg.', 'Well on your way.') : L('Gerade erst angefangen.', 'Just getting started.'))),
      h('button', { class: 'tile', onclick: () => ctx.go('karten') }, h('div', { class: 'ti', html: ico('cards') }), h('h3', {}, L('Karteikarten', 'Flashcards')),
        h('p', {}, due ? L(`${due} Karten fällig`, `${due} cards due`) : doc.decks.length ? L('Heute alles wiederholt.', 'All reviewed for today.') : L('Automatisch aus dem Skript.', 'Generated from your slides.')), h('div', { class: 'foot' }, due ? L('Jetzt wiederholen', 'Review now') : L('Kostenlos wiederholen', 'Review for free'))),
      pathTile,
      h('button', { class: 'tile half', onclick: () => ctx.go('quiz') }, h('div', { class: 'ti', html: ico('quiz') }), h('h3', {}, L('Quiz & Probeklausur', 'Quiz & mock exam')),
        h('p', {}, best != null ? L(`Letztes Quiz: ${best} %`, `Last quiz: ${best}%`) : L('6 Fragetypen – wie in der Klausur.', '6 question types – just like the exam.')), h('div', { class: 'foot' }, doc.mistakes.length ? L(`${doc.mistakes.length} Fehler zum Wiederholen`, `${doc.mistakes.length} mistakes to review`) : L('Neues Quiz · 2 Einheiten', 'New quiz · 2 credits'))),
      h('button', { class: 'tile', onclick: () => ctx.go('podcast') }, h('div', { class: 'ti', html: ico('pod') }), h('h3', {}, 'Podcast'), h('p', {}, doc.podcasts.length ? L(`${doc.podcasts.length} Folge(n)`, `${doc.podcasts.length} episode(s)`) : L('Dein Skript zum Anhören.', 'Your slides as audio.'))),
      h('button', { class: 'tile', onclick: () => ctx.go('zettel') }, h('div', { class: 'ti', html: ico('brain') }), h('h3', {}, L('Lernzettel', 'Study sheet')), h('p', {}, doc.summary ? L('Zusammenfassung + Mindmap', 'Summary + mind map') : L('Alles Wichtige auf einer Seite.', 'Everything important on one page.'))),
      h('a', { class: 'tile', href: '#/app/trainer' }, h('div', { class: 'ti', html: ico('calc') }), h('h3', {}, L('BWL-Trainer', 'Business trainer')), h('p', {}, L('Buchungssätze, Break-even, Kapitalwert & mehr – unbegrenzt.', 'Booking entries, break-even, NPV & more – unlimited.')))));
  face(f, {});

  // Direkt nach dem Upload: Lernpfad im Hintergrund bauen
  if (arg === 'neu' && !doc.path && !pathPending(doc) && !doc.autoPathTried) {
    doc.autoPathTried = true; save(doc);
    history.replaceState(null, '', `#/app/${doc.id}/hub`);
    const p = generatePath(doc); fillPath();
    p.then(() => { if (pathTile.isConnected) { ctx.go('hub'); } }).catch(e => { fillPath(); if (e.code === 'limit') apiError(e); });
  }
}
