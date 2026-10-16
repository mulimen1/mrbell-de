// Übersicht eines Skripts: Pinnwand mit allen Lernwegen
import { h, ico, ago, ls, modal } from '../util.js';
import { face } from '../face.js';
import { mastery, save } from '../state.js';
import { generatePath, pathPending } from './path.js';
import { apiError, typePlaceholder, isGuest, lockedPreview, lockedRest, GUEST_CARDS, GUEST_QUIZ } from '../ui.js';
import { dueCards } from './cards.js';
import { L, LOCALE } from '../i18n.js';
import { planSummary } from './plan.js';
import * as M from '../me.js';
import { reife } from '../reife.js';

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
  const inp = h('input', { class: 'field', placeholder: L('Frag mich etwas zu deinem Skript …', 'Ask me anything about your slides …'), style: { background: 'transparent', color: 'inherit', borderColor: 'color-mix(in srgb, var(--onInv) 30%, transparent)' } });
  const quick = h('form', { style: { display: 'flex', gap: '8px', marginTop: 'auto' }, onsubmit: e => { e.preventDefault(); const t = inp.value.trim(); if (t) ctx.ask(t); else ctx.go('tutor'); } },
    inp, h('button', { class: 'send', style: { background: 'var(--onInv)', color: 'var(--inv)' }, 'aria-label': L('Fragen', 'Ask'), html: ico('send') }));
  quick.addEventListener('click', e => e.stopPropagation());
  typePlaceholder(inp, L('Frag mich etwas zu deinem Skript …', 'Ask me anything about your slides …'), (doc.path?.chapters?.length ? doc.path.chapters.map(c => L('Erklär mir „' + c.title + '“', 'Explain “' + c.title + '”')) : []).concat(L(['Fass das Skript in 5 Punkten zusammen', 'Was ist am wichtigsten für die Klausur?', 'Erklär mir das schwierigste Thema'], ['Summarise the slides in 5 points', 'What matters most for the exam?', 'Explain the hardest topic'])), L('z. B. ', 'e.g. '));

  const pathTile = h('button', { class: 'tile half hub-tool', onclick: () => ctx.go('pfad', nextIdx >= 0 ? String(nextIdx) : null) });
  let fillPath = () => {
    const P = doc.path;
    pathTile.replaceChildren(h('div', { class: 'ti', html: ico('path') }),
      h('h3', {}, P ? (nextIdx >= 0 ? L(`Weiter: ${P.chapters[nextIdx].title}`, `Next: ${P.chapters[nextIdx].title}`) : L('Lernpfad geschafft', 'Study path completed')) : L('Lernpfad', 'Study path')),
      h('p', {}, P ? L(`${P.chapters.filter(c => c.done).length} von ${P.chapters.length} Kapiteln`, `${P.chapters.filter(c => c.done).length} of ${P.chapters.length} chapters`) : pathPending(doc) ? L('Wird gerade erstellt …', 'Being built right now …') : L('Kapitel, Lektionen und Aufgaben aus deinem Skript.', 'Chapters, lessons and exercises from your slides.')),
      h('div', { class: 'foot' }, P ? h('span', { class: 'weight' }, P.chapters.map(c => h('i', { class: c.done ? 'on' : '' }))) : pathPending(doc) ? h('span', { class: 'spinner' }) : (isGuest() ? L('Mit kostenlosem Konto', 'With a free account') : L('Erstellen · 2 Einheiten', 'Create · 2 credits'))));
  };
  fillPath();

  // Klausurvorbereitung: Countdown + Fortschritt, sonst Einstieg in den Plan
  const ps = planSummary(doc);
  const pct = ps ? Math.round(ps.frac * 100) : 0, exp = ps ? Math.round(ps.expFrac * 100) : 0;
  const planTile = h('button', { class: 'tile wide dark pl-tile', onclick: () => ctx.go('plan') },
    h('div', { class: 'pt-l' }, h('div', { class: 'ti', html: ico('calendar') }),
      h('div', {}, h('h3', {}, L('Klausurvorbereitung', 'Exam prep')),
        h('p', {}, !ps ? L('Gib mir dein Klausurdatum – ich mach dir einen Tag-für-Tag-Plan mit Fortschritt und Ziel-Check.', 'Give me your exam date – I’ll build you a day-by-day plan with progress tracking and a goal check.')
          : ps.daysLeft < 0 ? L('Klausur vorbei. Nächste Runde?', 'Exam’s over. Next round?')
          : ps.daysLeft === 0 ? L('Heute ist Klausur. Viel Erfolg!', 'Exam day. Good luck!')
          : (ps.todayOpen.length ? L(`Heute: ${ps.todayOpen.length} ${ps.todayOpen.length === 1 ? 'Aufgabe' : 'Aufgaben'} · ~${ps.todayMin} Min.`, `Today: ${ps.todayOpen.length} ${ps.todayOpen.length === 1 ? 'task' : 'tasks'} · ~${ps.todayMin} min`) : ps.todayT.length ? L('Heute alles erledigt.', 'All done for today.') : L('Heute frei.', 'Day off today.'))
            + (ps.mood === 'behind' || ps.mood === 'way_behind' ? L(' · etwas Rückstand', ' · a bit behind') : ps.mood === 'ahead' ? L(' · vor dem Plan', ' · ahead of plan') : '')))),
    ps && ps.daysLeft >= 0 ? h('div', { class: 'pt-r' },
      h('div', { class: 'pt-n' }, h('b', {}, ps.daysLeft), h('span', {}, ps.daysLeft === 1 ? L('Tag', 'day') : L('Tage', 'days'))),
      h('div', { class: 'pt-p' }, h('div', { class: 'pt-bar' }, h('i', { style: { width: pct + '%' } }), exp > 0 && exp < 100 ? h('s', { style: { left: exp + '%' } }) : null),
        h('span', {}, L(`${pct} % erledigt · Klausur ${new Date(ps.exam + 'T12:00').toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}`, `${pct}% done · exam ${new Date(ps.exam + 'T12:00').toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}`))))
      : h('div', { class: 'foot' }, ps ? L('Neuen Plan erstellen', 'Create a new plan') : L('Plan erstellen · kostenlos', 'Create plan · free'), h('span', { html: ico('right') })));

  // Drei Bereiche statt Kachel-Wand: Verstehen · Üben · Prüfen
  const ex = M.fachOf(doc.id)?.klausur || doc.plan?.exam || '';
  const rf = reife([doc], ex ? new Date(ex + 'T08:00').getTime() : 0);
  const row = (ic, title, sub, onclick, extra) => h('button', { class: 'zrow', type: 'button', onclick }, h('span', { class: 'zi', html: ico(ic) }), h('span', { class: 'zt' }, h('b', {}, title), h('small', {}, sub)), extra || h('span', { class: 'za', html: ico('right') }));
  const pathRow = h('div', { class: 'zslot' });
  const fillPathRow = () => {
    const P = doc.path, n = P ? P.chapters.filter(c => c.done).length : 0;
    pathRow.replaceChildren(row('path', P ? (nextIdx >= 0 ? L('Lernpfad: ', 'Study path: ') + P.chapters[nextIdx].title : L('Lernpfad geschafft', 'Study path completed')) : L('Lernpfad', 'Study path'),
      P ? L(`${n} von ${P.chapters.length} Kapiteln`, `${n} of ${P.chapters.length} chapters`) : pathPending(doc) ? L('Wird gerade erstellt …', 'Being built right now …') : (isGuest() ? L('Mit kostenlosem Konto', 'With a free account') : L('Kapitel mit Lektionen · 2 Einheiten', 'Chapters with lessons · 2 credits')),
      () => ctx.go('pfad', nextIdx >= 0 ? String(nextIdx) : null), pathPending(doc) ? h('span', { class: 'spinner' }) : null));
  };
  fillPathRow();
  const fillPath0 = fillPath; fillPath = () => { fillPath0(); fillPathRow(); };
  const zone = (cls, title, sub, rows) => h('section', { class: 'zone ' + cls }, h('div', { class: 'zh' }, h('b', {}, title), h('small', {}, sub)), rows);
  wrap.append(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, L(`${doc.pages.length} Seiten · hinzugefügt ${ago(doc.created)}`, `${doc.pages.length} pages · added ${ago(doc.created)}`)), h('h2', {}, doc.path?.title || doc.name), doc.path?.summary ? h('p', {}, doc.path.summary) : null)),
    h('div', { class: 'hub hub3' },
      planTile,
      h('div', { class: 'tile big dark hub-max', role: 'button', tabindex: 0, onclick: () => ctx.go('tutor') },
        h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center' } }, f, h('div', {}, h('h3', { style: { fontSize: '22px' } }, L('Frag mich', 'Ask me')), h('p', {}, L('Ich kenne dein Skript und erklär’s dir an der Tafel. Ein bisschen arrogant. Aber ich hab recht.', 'I know your slides and explain it on the whiteboard. A little arrogant. But I’m right.')))),
        h('div', { class: 'hub-chips', style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '14px 0' } },
          (L(['Fass das Skript in 5 Punkten zusammen', 'Was ist am wichtigsten für die Klausur?', 'Erklär mir das schwierigste Thema'], ['Summarise the slides in 5 points', 'What matters most for the exam?', 'Explain the hardest topic to me'])).map(t => h('button', { class: 'chip', style: { background: 'transparent', color: 'inherit', borderColor: 'color-mix(in srgb, var(--onInv) 30%, transparent)' }, onclick: e => { e.stopPropagation(); ctx.ask(t); } }, t))),
        quick),
      h('div', { class: 'tile hub-prog', role: 'button', tabindex: 0, onclick: () => ctx.go('pfad') },
        h('div', { class: 'ring', style: { '--p': m } }, h('div', {}, m + '%')),
        h('h3', { style: { marginTop: '8px' } }, L('Lernstand', 'Progress')), h('p', {}, m >= 80 ? L('Klausurbereit – halte es frisch.', 'Exam-ready – keep it fresh.') : m >= 40 ? L('Auf gutem Weg.', 'Well on your way.') : L('Gerade erst angefangen.', 'Just getting started.'))),
      h('div', { class: 'zones' },
        zone('z1', L('Verstehen', 'Understand'), L('Stoff aufbauen', 'Build it up'), [pathRow,
          row('brain', L('Lernzettel & Mindmap', 'Study sheet & mind map'), doc.summary ? L('Fertig – zum Nachlesen', 'Ready to read') : L('Alles Wichtige auf einer Seite', 'Everything on one page'), () => ctx.go('zettel')),
          row('pod', 'Podcast', doc.podcasts.length ? L(`${doc.podcasts.length} Folge(n)`, `${doc.podcasts.length} episode(s)`) : L('Dein Skript zum Anhören', 'Your slides as audio'), () => ctx.go('podcast'))]),
        zone('z2', L('Üben', 'Practise'), L('bis es sitzt', 'until it sticks'), [
          row('cards', L('Karteikarten', 'Flashcards'), due ? L(`${due} fällig – kostenlos wiederholen`, `${due} due – review for free`) : doc.decks.length ? L('Heute alles wiederholt', 'All reviewed today') : L('Automatisch aus dem Skript', 'Generated from your slides'), () => ctx.go('karten'), due ? h('span', { class: 'zb' }, String(due)) : null),
          row('quiz', 'Quiz', best != null ? L(`Letztes Quiz: ${best} %`, `Last quiz: ${best}%`) : L('6 Fragetypen wie in der Klausur', '6 question types like the exam'), () => ctx.go('quiz')),
          row('whistle', L('BWL-Trainer', 'Business trainer'), L('Unbegrenzt rechnen und buchen', 'Unlimited calculating and booking'), () => { location.hash = '#/app/trainer'; })]),
        zone('z3', L('Prüfen', 'Test yourself'), ex ? L(`Klausur ${new Date(ex + 'T12:00').toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}`, `Exam ${new Date(ex + 'T12:00').toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}`) : L('wie in der Klausur', 'like the real exam'), [
          row('exam', L('Klausur-Simulator', 'Exam simulator'), L('Zeit, Punkte, Notenschlüssel · 3 Einheiten', 'Time, points, grading key · 3 credits'), () => ctx.go('quiz', 'exam')),
          doc.mistakes.length ? row('refresh', L('Fehler ausbügeln', 'Fix mistakes'), L(`${doc.mistakes.length} Fragen, die noch nicht sitzen`, `${doc.mistakes.length} questions that don’t stick yet`), () => ctx.go('quiz', 'fehler'), h('span', { class: 'zb' }, String(doc.mistakes.length))) : null,
          row('trophy', L('Prüfungsreife', 'Exam readiness'), rf.hasData ? L(`${rf.score} % · ${rf.fest} von ${rf.themen || '–'} Themen sicher`, `${rf.score}% · ${rf.fest} of ${rf.themen || '–'} topics secure`) : L('Lern Karten oder mach ein Quiz', 'Study cards or take a quiz'), () => { location.hash = '#/app/faecher'; }, rf.hasData ? h('span', { class: 'zr' }, h('i', { style: { width: rf.score + '%' } })) : null)]))));
  face(f, {});

  // Direkt nach dem Upload: Lernpfad im Hintergrund bauen
  if (arg === 'neu' && !doc.path && !pathPending(doc) && !doc.autoPathTried && !isGuest()) {
    doc.autoPathTried = true; save(doc);
    history.replaceState(null, '', `#/app/${doc.id}/hub`);
    const p = generatePath(doc); fillPath();
    p.then(() => { if (pathRow.isConnected) { ctx.go('hub'); } }).catch(e => { fillPath(); if (e.code === 'limit') apiError(e); });
  }
}
