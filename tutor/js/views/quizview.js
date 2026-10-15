// Quiz, Probeklausur, Fehler wiederholen
import { h, ico, uid, toast, fmt, shuffle } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save, track } from '../state.js';
import { forWhole, forChapter } from '../retrieve.js';
import { loading, apiError, costBtn, moreOpts } from '../ui.js';
import { renderQuestion, normalize, TYPE_LABEL, explainPrompt } from '../quiz.js';
import { feedbackButton } from '../feedback.js';
import { ls as lsq } from '../util.js';
import { L, LOCALE } from '../i18n.js';

const TYPES = ['mc', 'tf', 'match', 'order', 'cloze', 'num'];
const DIFF = [['leicht', L('Leicht', 'Easy')], ['mittel', L('Mittel', 'Medium')], ['schwer', L('Schwer', 'Hard')], ['klausur', L('Klausur', 'Exam level')]];
const diffLabel = d => (DIFF.find(x => x[0] === String(d || '').toLowerCase()) || [0, d || ''])[1];

export function note(p) {
  const t = [[.95, '1,0'], [.9, '1,3'], [.85, '1,7'], [.8, '2,0'], [.75, '2,3'], [.7, '2,7'], [.65, '3,0'], [.6, '3,3'], [.55, '3,7'], [.5, '4,0']];
  for (const [g, n] of t) if (p >= g) return n;
  return '5,0';
}
const noteShow = n => L(n, n.replace(',', '.'));

export async function render(root, ctx) {
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  const pre = ctx.arg && ctx.arg.startsWith('k') ? parseInt(ctx.arg.slice(1)) : null;
  const auto = ctx.arg === 'auto'; if (auto) history.replaceState(null, '', location.hash.replace(/\/auto$/, ''));
  if (auto) generate(wrap, ctx, { count: 8, diff: 'mittel', types: new Set(TYPES), focus: -1 });
  else overview(wrap, ctx, pre);
  return () => { wrap._timer && clearInterval(wrap._timer); };
}

function overview(wrap, ctx, pre) {
  const { doc } = ctx;
  const st = { count: 8, diff: 'mittel', types: new Set(TYPES), focus: pre != null && doc.path?.chapters[pre] ? pre : -1 };
  const chips = (arr, get, set) => h('div', { class: 'chips' }, arr.map(([v, l]) => { const c = h('button', { class: 'chip' + (get(v) ? ' on' : '') }, l); c.addEventListener('click', () => { set(v); c.parentNode.querySelectorAll('.chip').forEach((x, i) => x.classList.toggle('on', get(arr[i][0]))); }); return c; }));
  const sel = h('select', { class: 'field' }, h('option', { value: -1 }, L('Ganzes Skript', 'Whole script')), (doc.path?.chapters || []).map((c, i) => h('option', { value: i, selected: i === st.focus }, `${i + 1}. ${c.title}`)));
  sel.addEventListener('change', () => st.focus = +sel.value);
  const past = [...doc.quizzes].reverse();
  wrap.replaceChildren(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Quiz'), h('h2', {}, L('Teste dich – wie in der Klausur', 'Test yourself – just like the exam')), h('p', {}, L('Multiple Choice, Richtig/Falsch, Zuordnen, Reihenfolge, Lückentext und Rechenaufgaben.', 'Multiple choice, true/false, matching, ordering, fill-in-the-blank and calculations.')))),
    h('div', { class: 'setup' },
      h('div', { class: 'grid' },
        h('div', {}, h('label', { class: 'l' }, L('Thema', 'Topic')), sel),
        h('div', {}, h('label', { class: 'l' }, L('Schwierigkeit', 'Difficulty')), chips(DIFF, v => st.diff === v, v => st.diff = v))),
      moreOpts(
        h('div', { class: 'grid' }, h('div', {}, h('label', { class: 'l' }, L('Anzahl', 'Number of questions')), chips([[5, '5'], [8, '8'], [12, '12']], v => st.count === v, v => st.count = v))),
        h('div', { style: { marginTop: '18px' } }, h('label', { class: 'l' }, L('Fragetypen', 'Question types')),
          chips(TYPES.map(t => [t, TYPE_LABEL[t]]), v => st.types.has(v), v => { if (st.types.has(v) && st.types.size > 1) st.types.delete(v); else st.types.add(v); }))),
      h('div', { class: 'qactions' }, h('span', { class: 'sp' }), costBtn(L('Quiz erstellen', 'Create quiz'), 'quiz', () => generate(wrap, ctx, st), 'btn primary lg'))),
    h('div', { class: 'hub', style: { marginTop: '16px' } },
      h('button', { class: 'tile half dark', onclick: () => exam(wrap, ctx) }, h('div', { class: 'ti', html: ico('exam') }), h('h3', {}, L('Probeklausur', 'Mock exam')), h('p', {}, L('12 Aufgaben auf Klausurniveau, mit Zeit und Notenschätzung.', '12 exam-level tasks, timed, with an estimated grade.')), h('div', { class: 'foot' }, L('3 Einheiten · 45 Minuten', '3 credits · 45 minutes'))),
      h('button', { class: 'tile half', disabled: !doc.mistakes.length, style: doc.mistakes.length ? null : { opacity: .55, cursor: 'default' }, onclick: () => doc.mistakes.length && run(wrap, ctx, { id: 'mistakes', title: L('Deine Fehler', 'Your mistakes'), questions: shuffle(doc.mistakes).slice(0, 12), mistakes: true }) },
        h('div', { class: 'ti', html: ico('refresh') }), h('h3', {}, L('Fehler wiederholen', 'Review mistakes')), h('p', {}, doc.mistakes.length ? L(`${doc.mistakes.length} Fragen, die du falsch hattest. Richtig beantwortet fliegen sie raus.`, `${doc.mistakes.length} questions you got wrong. Answer them correctly and they’re gone.`) : L('Hier landen Fragen, die du falsch beantwortest.', 'Questions you get wrong end up here.')), h('div', { class: 'foot' }, L('Kostenlos', 'Free')))),
    past.length ? h('div', { style: { marginTop: '26px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, L('Deine Quizze – kostenlos wiederholen', 'Your quizzes – retake for free')),
      h('div', { class: 'list' }, past.map(q => {
        const best = q.results?.length ? Math.round(100 * Math.max(...q.results.map(r => r.score))) : null;
        return h('div', { class: 'li', onclick: () => run(wrap, ctx, q) }, h('span', { html: ico(q.exam ? 'exam' : 'quiz') }),
          h('div', { class: 'gr' }, h('b', {}, q.title), h('span', {}, L(`${q.questions.length} Fragen · ${q.diff || ''}${q.results?.length ? ` · ${q.results.length}× gemacht` : ''}`, `${q.questions.length} questions · ${diffLabel(q.diff)}${q.results?.length ? ` · taken ${q.results.length}×` : ''}`))),
          best != null ? h('span', { class: 'sc' }, best + ' %') : h('span', { class: 'tag' }, L('neu', 'new')));
      }))) : null);
}

async function generate(wrap, ctx, st) {
  const { doc } = ctx;
  const ch = st.focus >= 0 ? doc.path.chapters[st.focus] : null;
  const ld = loading(wrap, L('Ich schreibe dein Quiz …', 'Writing your quiz …'), L(['Lese das Skript', 'Denke mir knifflige Fragen aus', 'Baue typische Fehler als Antworten ein', 'Rechne die Aufgaben zweimal nach'], ['Reading the slides', 'Thinking up tricky questions', 'Building in typical mistakes as answers', 'Double-checking the calculations']), 'quiz');
  try {
    const r = await ask('quiz', { material: ch ? forChapter(doc, ch) : forWhole(doc), docName: doc.name, opts: { count: st.count, difficulty: st.diff, types: [...st.types], focus: ch ? L(`Kapitel „${ch.title}“ (S. ${ch.pages[0]}–${ch.pages[1]})`, `Chapter “${ch.title}” (p. ${ch.pages[0]}–${ch.pages[1]})`) : '' } });
    const qs = (r.data?.questions || []).map(normalize).filter(Boolean);
    if (qs.length < 2) throw new Error(L('Das Quiz ist nicht vollständig angekommen. Versuch es nochmal.', 'The quiz didn’t arrive completely. Please try again.'));
    const quiz = { id: uid(), title: ch ? ch.title : (r.data.title || 'Quiz'), questions: qs, diff: st.diff, created: Date.now(), results: [] };
    doc.quizzes.push(quiz); save(doc);
    ld.stop(); run(wrap, ctx, quiz);
  } catch (e) { ld.stop(); overview(wrap, ctx, st.focus); apiError(e, () => generate(wrap, ctx, st)); }
}

async function exam(wrap, ctx) {
  const { doc } = ctx;
  const ld = loading(wrap, L('Ich stelle deine Probeklausur zusammen …', 'Putting your mock exam together …'), L(['Wähle die wichtigsten Themen', 'Schreibe Rechenaufgaben', 'Baue Transferfragen', 'Prüfe alle Lösungen', 'Gleich geschafft'], ['Picking the key topics', 'Writing calculations', 'Building transfer questions', 'Checking all solutions', 'Almost done']), 'exam');
  try {
    const r = await ask('exam', { material: forWhole(doc), docName: doc.name, opts: { count: 12, difficulty: 'klausur' } });
    const qs = (r.data?.questions || []).map(normalize).filter(Boolean);
    if (qs.length < 4) throw new Error(L('Die Probeklausur ist nicht vollständig angekommen. Versuch es nochmal.', 'The mock exam didn’t arrive completely. Please try again.'));
    const quiz = { id: uid(), title: L('Probeklausur · ', 'Mock exam · ') + new Date().toLocaleDateString(LOCALE), questions: qs, diff: 'Klausur', exam: true, minutes: 45, created: Date.now(), results: [] };
    doc.quizzes.push(quiz); save(doc);
    ld.stop(); run(wrap, ctx, quiz);
  } catch (e) { ld.stop(); overview(wrap, ctx); apiError(e, () => exam(wrap, ctx)); }
}

function run(wrap, ctx, quiz) {
  const { doc } = ctx;
  const qs = quiz.questions;
  let i = 0;
  const res = [];
  const prog = h('i', { style: { width: '0%' } });
  const count = h('span', { class: 'qcount' });
  const timer = h('span', { class: 'qcount' });
  const stage = h('div');
  const fwrap = h('div', { class: 'face', style: { width: '36px', height: '36px' } });
  const fc = face(fwrap);
  wrap.replaceChildren(h('div', { class: 'qwrap' },
    h('div', { class: 'qtop' }, h('button', { class: 'iconbtn', 'aria-label': L('Beenden', 'Quit'), html: ico('x'), onclick: () => { clearInterval(wrap._timer); overview(wrap, ctx); } }), h('div', { class: 'qprog' }, prog), count, timer, fwrap),
    stage));
  if (quiz.exam) {
    const end = Date.now() + (quiz.minutes || 45) * 60e3;
    clearInterval(wrap._timer);
    wrap._timer = setInterval(() => {
      if (!wrap.isConnected) return clearInterval(wrap._timer);
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      timer.replaceChildren(h('span', { html: ico('clock'), style: { display: 'inline-flex', verticalAlign: '-4px', marginRight: '4px' } }), `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
      if (!s) { clearInterval(wrap._timer); toast(L('Zeit ist um – hier ist dein Ergebnis.', 'Time’s up – here’s your result.')); finish(); }
    }, 1000);
  }
  const step = () => {
    if (i >= qs.length) return finish();
    prog.style.width = (100 * i / qs.length) + '%';
    count.textContent = `${i + 1} / ${qs.length}`;
    const q = qs[i];
    const r = renderQuestion(stage, q, { face: fc, onNext: () => { i++; step(); }, nextLabel: i + 1 < qs.length ? L('Weiter', 'Next') : L('Ergebnis', 'Result'), onAsk: (q, rr) => ctx.ask(explainPrompt(q, rr)) });
    r.result.then(x => {
      res[i] = x; track(x.correct);
      const key = q.q;
      if (!x.correct && !doc.mistakes.some(m => m.q === key)) doc.mistakes.push(q);
      if (x.correct && quiz.mistakes) doc.mistakes = doc.mistakes.filter(m => m.q !== key);
      save(doc);
    });
  };
  let finished = false;
  const finish = () => {
    if (finished) return; finished = true;
    clearInterval(wrap._timer);
    prog.style.width = '100%';
    const answered = res.filter(Boolean);
    const score = qs.length ? res.reduce((a, r) => a + (r ? r.score : 0), 0) / qs.length : 0;
    if (!quiz.mistakes) { quiz.results = quiz.results || []; quiz.results.push({ score, at: Date.now() }); }
    save(doc);
    const f = h('div', { class: 'face' });
    stage.replaceChildren(h('div', { class: 'result-hero' }, f,
      h('div', { class: 'score' }, Math.round(score * 100) + ' %'),
      quiz.exam ? h('p', { style: { fontSize: '18px', margin: '8px 0 0' } }, L('Geschätzte Note: ', 'Estimated grade (German scale): '), h('b', {}, noteShow(note(score)))) : null,
      h('p', { style: { color: 'var(--mute)' } }, L(`${answered.filter(r => r.correct).length} von ${qs.length} richtig.`, `${answered.filter(r => r.correct).length} of ${qs.length} correct.`) + (doc.mistakes.length ? L(` ${doc.mistakes.length} Fragen liegen in deinen Fehlern.`, ` ${doc.mistakes.length} questions are in your mistakes.`) : '')),
      h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' } },
        h('button', { class: 'btn primary', onclick: () => overview(wrap, ctx) }, L('Fertig', 'Done')),
        h('button', { class: 'btn', onclick: () => run(wrap, ctx, quiz) }, L('Nochmal', 'Again')),
        doc.mistakes.length ? h('button', { class: 'btn', onclick: () => run(wrap, ctx, { id: 'mistakes', title: L('Deine Fehler', 'Your mistakes'), questions: shuffle(doc.mistakes).slice(0, 12), mistakes: true }) }, L('Fehler wiederholen', 'Review mistakes')) : null),
      !lsq.get('tutor.feedbackGiven', 0) && score >= .5 ? h('div', { style: { marginTop: '14px' } }, feedbackButton('btn sm')) : null,
      h('div', { class: 'qlist' }, qs.map((q, k) => h('div', {}, h('span', { class: 'm' }, res[k]?.correct ? '✓' : '✗'), h('span', {}, q.type === 'cloze' ? q.q.replace(/___+/g, '…') : q.q))))));
    const fcc = face(f); setTimeout(() => fcc.set(score >= .6 ? 'happy' : 'sad'), 200);
  };
  step();
}

