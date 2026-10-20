// Quiz, Probeklausur, Fehler wiederholen
import { starBtn } from '../me.js';
import { h, ico, uid, toast, fmt, shuffle, modal } from '../util.js';
import { richText } from '../sanitize.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save, track } from '../state.js';
import { forWhole, forChapter } from '../retrieve.js';
import { loading, apiError, costBtn, moreOpts, freshen, isGuest, lockedPreview, lockedRest, GUEST_CARDS, GUEST_QUIZ } from '../ui.js';
import { renderQuestion, normalize, TYPE_LABEL, explainPrompt } from '../quiz.js';
import { feedbackButton } from '../feedback.js';
import { ls as lsq } from '../util.js';
import { L, LOCALE } from '../i18n.js';
import { autoOpts, srcPicker, goSource } from '../create.js';
import { dlBtn, optsQuiz } from '../export.js';
import { savedToast } from '../lib.js';

const TYPES = ['mc', 'tf', 'match', 'order', 'cloze', 'num'];
const DIFF = [['leicht', L('Leicht', 'Easy')], ['mittel', L('Mittel', 'Medium')], ['schwer', L('Schwer', 'Hard')], ['klausur', L('Klausur', 'Exam level')]];
const diffLabel = d => (DIFF.find(x => x[0] === String(d || '').toLowerCase()) || [0, d || ''])[1];

// Notenschlüssel: Bestehensgrenze = 4,0, darüber zehn gleich breite Stufen bis 1,0 (bei 50 %: alle 5 % eine Stufe)
const STUFEN = ['4,0', '3,7', '3,3', '3,0', '2,7', '2,3', '2,0', '1,7', '1,3', '1,0'];
export const schluessel = (pm = .5) => STUFEN.map((n, k) => [n, pm + k * (1 - pm) / 10]).reverse();
export function noteFor(p, pm = .5) { for (const [n, g] of schluessel(pm)) if (p >= g - 1e-9) return n; return '5,0'; }
// Punkte je Aufgabentyp – Rechnen und Zuordnen wiegen mehr als Richtig/Falsch
export const PUNKTE = { mc: 2, tf: 1, match: 3, order: 3, cloze: 2, num: 4 };
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
  const go = ctx.arg === 'exam' || ctx.arg === 'fehler'; if (go) history.replaceState(null, '', location.hash.replace(/\/(exam|fehler)$/, ''));
  if (auto) {
    const o = await autoOpts('quiz', ctx.doc); if (!wrap.isConnected) return;
    if (!o) { wrap.remove(); return render(root, Object.assign({}, ctx, { arg: null })); }
    const types = (o.types || TYPES).filter(t => TYPES.includes(t));
    generate(wrap, ctx, { count: o.count || 8, diff: o.diff || 'mittel', types: new Set(types.length ? types : TYPES), focus: o.focus >= 0 && ctx.doc.path?.chapters[o.focus] ? o.focus : -1 });
  }
  else if (ctx.arg === 'exam') { overview(wrap, ctx, pre); exam(wrap, ctx); }
  else if (ctx.arg && ctx.arg.startsWith('q-') && ctx.doc.quizzes.some(q => q.id === ctx.arg.slice(2))) { history.replaceState(null, '', location.hash.replace(/\/q-[^/]*$/, '')); run(wrap, ctx, ctx.doc.quizzes.find(q => q.id === ctx.arg.slice(2))); }
  else if (ctx.arg === 'fehler' && ctx.doc.mistakes.length) run(wrap, ctx, { id: 'mistakes', title: L('Deine Fehler', 'Your mistakes'), questions: shuffle(ctx.doc.mistakes).slice(0, 12), mistakes: true });
  else overview(wrap, ctx, pre);
  return () => { wrap._timer && clearInterval(wrap._timer); };
}

function overview(wrap, ctx, pre) {
  const { doc } = ctx;
  const st = { count: 8, diff: 'mittel', types: new Set(TYPES), focus: pre != null && doc.path?.chapters[pre] ? pre : -1 };
  const chips = (arr, get, set) => h('div', { class: 'chips' }, arr.map(([v, l]) => { const c = h('button', { class: 'chip' + (get(v) ? ' on' : '') }, l); c.addEventListener('click', () => { set(v); c.parentNode.querySelectorAll('.chip').forEach((x, i) => x.classList.toggle('on', get(arr[i][0]))); }); return c; }));
  const sel = h('select', { class: 'field' }, h('option', { value: -1 }, L('Ganzes Skript', 'Whole script')), (doc.path?.chapters || []).map((c, i) => h('option', { value: i, selected: i === st.focus }, `${i + 1}. ${c.title}`)));
  sel.addEventListener('change', () => st.focus = +sel.value);
  // Stoff frei wählen: dieses oder ein anderes Skript, ein Thema oder eine eigene Datei
  const pick = srcPicker(doc, { onChange: () => { scopeBox.hidden = !pick.here(); } });
  const scopeBox = h('div', {}, h('label', { class: 'l' }, L('Umfang', 'Scope')), sel);
  const create = () => { if (pick.here()) return generate(wrap, ctx, st); if (pick.check()) return; goSource('quiz', pick.get(), { count: st.count, diff: st.diff, types: [...st.types], focus: -1 }); };
  const past = [...doc.quizzes].reverse();
  wrap.replaceChildren(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Quiz'), h('h2', {}, L('Teste dich – wie in der Klausur', 'Test yourself – just like the exam')), h('p', {}, L('Multiple Choice, Richtig/Falsch, Zuordnen, Reihenfolge, Lückentext und Rechenaufgaben.', 'Multiple choice, true/false, matching, ordering, fill-in-the-blank and calculations.')))),
    h('div', { class: 'setup' },
      h('div', { class: 'sp-row' }, h('label', { class: 'l' }, L('Stoff', 'Material')), pick.el),
      h('div', { class: 'grid' },
        scopeBox,
        h('div', {}, h('label', { class: 'l' }, L('Schwierigkeit', 'Difficulty')), chips(DIFF, v => st.diff === v, v => st.diff = v))),
      moreOpts(
        h('div', { class: 'grid' }, h('div', {}, h('label', { class: 'l' }, L('Anzahl', 'Number of questions')), chips([[5, '5'], [8, '8'], [12, '12']], v => st.count === v, v => st.count = v))),
        h('div', { style: { marginTop: '18px' } }, h('label', { class: 'l' }, L('Fragetypen', 'Question types')),
          chips(TYPES.map(t => [t, TYPE_LABEL[t]]), v => st.types.has(v), v => { if (st.types.has(v) && st.types.size > 1) st.types.delete(v); else st.types.add(v); }))),
      h('div', { class: 'qactions' }, h('span', { class: 'sp' }), costBtn(L('Quiz erstellen', 'Create quiz'), 'quiz', create, 'btn primary lg'))),
    h('div', { class: 'hub', style: { marginTop: '16px' } },
      h('button', { class: 'tile half dark', onclick: () => exam(wrap, ctx) }, h('div', { class: 'ti', html: ico('exam') }), h('h3', {}, L('Klausur-Simulator', 'Exam simulator')), h('p', {}, L('Wie in der echten Klausur: Zeitlimit, Punkte je Aufgabe, Notenschlüssel – Auswertung erst am Ende.', 'Like the real exam: time limit, points per task, grading key – results only at the end.')), h('div', { class: 'foot' }, L('3 Einheiten · Dauer wählbar', '3 credits · choose duration'))),
      h('button', { class: 'tile half', disabled: !doc.mistakes.length, style: doc.mistakes.length ? null : { opacity: .55, cursor: 'default' }, onclick: () => doc.mistakes.length && run(wrap, ctx, { id: 'mistakes', title: L('Deine Fehler', 'Your mistakes'), questions: shuffle(doc.mistakes).slice(0, 12), mistakes: true }) },
        h('div', { class: 'ti', html: ico('refresh') }), h('h3', {}, L('Fehler wiederholen', 'Review mistakes')), h('p', {}, doc.mistakes.length ? L(`${doc.mistakes.length} Fragen, die du falsch hattest. Richtig beantwortet fliegen sie raus.`, `${doc.mistakes.length} questions you got wrong. Answer them correctly and they’re gone.`) : L('Hier landen Fragen, die du falsch beantwortest.', 'Questions you get wrong end up here.')), h('div', { class: 'foot' }, L('Kostenlos', 'Free')))),
    past.length ? h('div', { style: { marginTop: '26px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, L('Deine Quizze – kostenlos wiederholen', 'Your quizzes – retake for free')),
      h('div', { class: 'list' }, past.map(q => {
        const best = q.results?.length ? Math.round(100 * Math.max(...q.results.map(r => r.score))) : null;
        return h('div', { class: 'li', onclick: () => run(wrap, ctx, q) }, h('span', { html: ico(q.exam ? 'exam' : 'quiz') }),
          h('div', { class: 'gr' }, h('b', {}, q.title), h('span', {}, L(`${q.questions.length} Fragen · ${q.diff || ''}${q.results?.length ? ` · ${q.results.length}× gemacht` : ''}`, `${q.questions.length} questions · ${diffLabel(q.diff)}${q.results?.length ? ` · taken ${q.results.length}×` : ''}`))),
          best != null ? h('span', { class: 'sc' }, best + ' %') : h('span', { class: 'tag' }, L('neu', 'new')),
          starBtn(() => ({ typ: 'quiz', titel: q.title, doc: doc.id, docName: doc.name, ref: q.id || q.title }), { cls: 'sm bare' }),
          dlBtn(() => optsQuiz(q, doc), { cls: 'iconbtn', text: false }));
      }))) : null);
}

async function generate(wrap, ctx, st) {
  const { doc } = ctx;
  const ch = st.focus >= 0 ? doc.path.chapters[st.focus] : null;
  const ld = loading(wrap, L('Ich schreibe dein Quiz …', 'Writing your quiz …'), L(['Lese das Skript', 'Denke mir knifflige Fragen aus', 'Baue typische Fehler als Antworten ein', 'Rechne die Aufgaben zweimal nach'], ['Reading the slides', 'Thinking up tricky questions', 'Building in typical mistakes as answers', 'Double-checking the calculations']), 'quiz');
  try {
    const r = await ask('quiz', { material: ch ? forChapter(doc, ch) : forWhole(doc), docName: doc.name, opts: { count: st.count, difficulty: st.diff, types: [...st.types], focus: ch ? L(`Kapitel „${ch.title}“ (S. ${ch.pages[0]}–${ch.pages[1]})`, `Chapter “${ch.title}” (p. ${ch.pages[0]}–${ch.pages[1]})`) : '' } }, { signal: ld.signal });
    const qs = (r.data?.questions || []).map(normalize).filter(Boolean);
    if (qs.length < 2) throw new Error(L('Das Quiz ist nicht vollständig angekommen. Versuch es nochmal.', 'The quiz didn’t arrive completely. Please try again.'));
    const quiz = { id: uid(), title: ch ? ch.title : (r.data.title || 'Quiz'), questions: qs, diff: st.diff, created: Date.now(), results: [] };
    doc.quizzes.push(quiz); save(doc);
    ld.stop(); run(wrap, ctx, quiz); freshen(wrap); savedToast('quiz');
  } catch (e) { ld.stop(false); overview(wrap, ctx, st.focus); apiError(e, () => generate(wrap, ctx, st)); }
}

// Klausur-Simulator: Dauer, Umfang, Bestehensgrenze und echte Klausurbedingungen einstellen
async function examSetup() {
  const pre = lsq.get('tutor.examCfg', null) || { minutes: 60, count: 12, pass: .5, silent: true };
  const st = Object.assign({}, pre);
  const seg = (opts, key) => { const w = h('div', { class: 'ik-seg' }); const paint = () => w.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(st[key]) === b.dataset.v)); opts.forEach(([v, t]) => w.append(h('button', { type: 'button', 'data-v': String(v), onclick: () => { st[key] = v; paint(); } }, t))); paint(); return w; };
  const silent = h('input', { type: 'checkbox', checked: st.silent || null });
  const body = h('div', { class: 'ik-place' },
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Dauer', 'Duration')), seg([[30, '30 Min.'], [45, '45 Min.'], [60, '60 Min.'], [90, '90 Min.'], [120, '120 Min.']], 'minutes')),
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Aufgaben', 'Tasks')), seg([[8, '8'], [12, '12'], [14, '14']], 'count')),
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Bestanden ab', 'Pass mark')), seg([[.4, '40 %'], [.45, '45 %'], [.5, '50 %'], [.6, '60 %']], 'pass')),
    h('label', { class: 'rc-b' }, silent, h('span', {}, L('Klausurbedingungen: keine Hilfe, Auswertung erst am Ende', 'Exam conditions: no help, results only at the end'))),
    h('p', { class: 'me-muted', style: { margin: 0 } }, L('Punkte je Aufgabe wie in der Klausur: Rechnen 4, Zuordnen/Reihenfolge 3, Multiple Choice/Lücken 2, Richtig/Falsch 1. Notenschlüssel: ab der Bestehensgrenze 4,0, darüber zehn gleiche Stufen bis 1,0.', 'Points per task like a real exam: calculations 4, matching/ordering 3, multiple choice/gaps 2, true/false 1. Grading key: 4.0 at the pass mark, then ten equal steps up to 1.0.')));
  const r = await modal({ cls: 'ik-modal', eyebrow: L('Klausur-Simulator', 'Exam simulator'), title: L('Wie in der echten Klausur', 'Just like the real exam'), body, actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Klausur erstellen · 3 Einheiten', 'Create exam · 3 credits'), value: 'ok', primary: true }] });
  if (r !== 'ok') return null;
  st.silent = silent.checked; lsq.set('tutor.examCfg', st);
  return st;
}
async function exam(wrap, ctx) {
  if (isGuest()) return lockedPreview(wrap, { kind: 'exam', title: L('Probeklausur – mit kostenlosem Konto', 'Mock exam – with a free account'), onUnlock: () => exam(wrap, ctx), back: () => overview(wrap, ctx) });
  const { doc } = ctx;
  const cfg = await examSetup(); if (!cfg) return;
  const ld = loading(wrap, L('Ich stelle deine Probeklausur zusammen …', 'Putting your mock exam together …'), L(['Wähle die wichtigsten Themen', 'Schreibe Rechenaufgaben', 'Baue Transferfragen', 'Prüfe alle Lösungen', 'Gleich geschafft'], ['Picking the key topics', 'Writing calculations', 'Building transfer questions', 'Checking all solutions', 'Almost done']), 'exam');
  try {
    const r = await ask('exam', { material: forWhole(doc), docName: doc.name, opts: { count: cfg.count, difficulty: 'klausur' } }, { signal: ld.signal });
    const qs = (r.data?.questions || []).map(normalize).filter(Boolean);
    if (qs.length < 4) throw new Error(L('Die Probeklausur ist nicht vollständig angekommen. Versuch es nochmal.', 'The mock exam didn’t arrive completely. Please try again.'));
    const quiz = { id: uid(), title: L('Probeklausur · ', 'Mock exam · ') + new Date().toLocaleDateString(LOCALE), questions: qs, diff: 'Klausur', exam: true, minutes: cfg.minutes, pass: cfg.pass, silent: cfg.silent, created: Date.now(), results: [] };
    doc.quizzes.push(quiz); save(doc);
    ld.stop(); run(wrap, ctx, quiz); freshen(wrap); savedToast('quiz');
  } catch (e) { ld.stop(false); overview(wrap, ctx); apiError(e, () => exam(wrap, ctx)); }
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
    if (isGuest() && !quiz.mistakes && i >= GUEST_QUIZ) { count.textContent = `${i} / ${qs.length}`; return lockedRest(stage, { left: qs.length - i, what: L('Fragen', 'questions'), onUnlock: step }); }
    prog.style.width = (100 * i / qs.length) + '%';
    count.textContent = `${i + 1} / ${qs.length}`;
    const q = qs[i], idx = i;
    const r = renderQuestion(stage, q, { face: fc, silent: !!(quiz.exam && quiz.silent), onNext: () => { i++; step(); }, nextLabel: i + 1 < qs.length ? L('Weiter', 'Next') : L('Ergebnis', 'Result'), onAsk: (q, rr) => ctx.ask(explainPrompt(q, rr)) });
    r.result.then(x => {
      res[idx] = x; track(x.correct);
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
    // Klausur: nach Punkten wie im Bewertungsschema
    const pts = qs.map((q, k) => ({ q, max: PUNKTE[q.type] || 2, got: Math.round(2 * (PUNKTE[q.type] || 2) * (res[k] ? res[k].score : 0)) / 2, r: res[k] }));
    const pMax = pts.reduce((a, x) => a + x.max, 0), pGot = pts.reduce((a, x) => a + x.got, 0), pm = quiz.pass || .5;
    const pScore = quiz.exam && pMax ? pGot / pMax : score, grade = noteFor(pScore, pm);
    stage.replaceChildren(h('div', { class: 'result-hero' }, f,
      h('div', { class: 'score' }, quiz.exam ? `${String(pGot).replace('.', ',')} / ${pMax}` : Math.round(score * 100) + ' %'),
      quiz.exam ? h('p', { style: { fontSize: '18px', margin: '8px 0 0' } }, L(`${Math.round(pScore * 100)} % der Punkte · Note `, `${Math.round(pScore * 100)}% of points · grade `), h('b', {}, noteShow(grade)), grade === '5,0' ? L(' – nicht bestanden', ' – fail') : '') : null,
      quiz.exam ? examSheet(pts, pScore, pm, grade) : null,
      h('p', { style: { color: 'var(--mute)' } }, L(`${answered.filter(r => r.correct).length} von ${qs.length} richtig.`, `${answered.filter(r => r.correct).length} of ${qs.length} correct.`) + (doc.mistakes.length ? L(` ${doc.mistakes.length} Fragen liegen in deinen Fehlern.`, ` ${doc.mistakes.length} questions are in your mistakes.`) : '')),
      h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' } },
        h('button', { class: 'btn primary', onclick: () => overview(wrap, ctx) }, L('Fertig', 'Done')),
        h('button', { class: 'btn', onclick: () => run(wrap, ctx, quiz) }, L('Nochmal', 'Again')),
        quiz.id !== 'mistakes' ? dlBtn(() => optsQuiz(quiz, doc), { cls: 'btn' }) : null,
        doc.mistakes.length ? h('button', { class: 'btn', onclick: () => run(wrap, ctx, { id: 'mistakes', title: L('Deine Fehler', 'Your mistakes'), questions: shuffle(doc.mistakes).slice(0, 12), mistakes: true }) }, L('Fehler wiederholen', 'Review mistakes')) : null),
      !lsq.get('tutor.feedbackGiven', 0) && score >= .5 ? h('div', { style: { marginTop: '14px' } }, feedbackButton('btn sm')) : null,
      h('div', { class: 'qlist' }, qs.map((q, k) => h('div', {}, h('span', { class: 'm' }, res[k]?.correct ? '✓' : '✗'), h('span', {}, q.type === 'cloze' ? q.q.replace(/___+/g, '…') : q.q))))));
    const fcc = face(f); setTimeout(() => fcc.set(score >= .6 ? 'happy' : 'sad'), 200);
  };
  step();
}


// Bewertungsschema: Punkte je Aufgabe + Notenschlüssel mit deiner Note markiert
function examSheet(pts, pScore, pm, grade) {
  const pMax = pts.reduce((a, x) => a + x.max, 0);
  const fmtP = x => String(x).replace('.', ',');
  const keyRows = schluessel(pm).concat([['5,0', 0]]);
  return h('div', { class: 'xs' },
    h('details', { class: 'xs-d', open: true }, h('summary', {}, L('Bewertungsschema', 'Grading scheme')),
      h('div', { class: 'xs-grid' },
        h('table', { class: 'rc-t xs-t' }, h('thead', {}, h('tr', {}, h('th', {}, '#'), h('th', {}, L('Aufgabe', 'Task')), h('th', { class: 'n' }, L('Punkte', 'Points')))),
          h('tbody', {}, pts.map((x, k) => h('tr', { class: x.got >= x.max ? 'ok' : x.got > 0 ? 'part' : 'bad' }, h('td', {}, String(k + 1)), h('td', {}, String(x.q.type === 'cloze' ? x.q.q.replace(/___+/g, '…') : x.q.q).slice(0, 90)), h('td', { class: 'n' }, `${fmtP(x.got)} / ${x.max}`)))),
          h('tfoot', {}, h('tr', { class: 'sum' }, h('td', {}), h('td', {}, L('Gesamt', 'Total')), h('td', { class: 'n' }, `${fmtP(pts.reduce((a, x) => a + x.got, 0))} / ${pMax}`)))),
        h('table', { class: 'rc-t xs-k' }, h('thead', {}, h('tr', {}, h('th', {}, L('Note', 'Grade')), h('th', { class: 'n' }, L('ab Punkten', 'from points')))),
          h('tbody', {}, keyRows.map(([n, g]) => h('tr', { class: n === grade ? 'me' : '' }, h('td', {}, noteShow(n)), h('td', { class: 'n' }, n === '5,0' ? L(`unter ${fmtP(Math.ceil(2 * pm * pMax) / 2)}`, `below ${Math.ceil(2 * pm * pMax) / 2}`) : fmtP(Math.ceil(2 * g * pMax - 1e-9) / 2)))))))),
    h('details', { class: 'xs-d' }, h('summary', {}, L('Lösungen ansehen', 'See solutions')),
      h('div', { class: 'xs-sol' }, pts.map((x, k) => h('div', { class: 'xs-s' }, h('b', {}, `${k + 1}. `, String(x.q.type === 'cloze' ? x.q.q.replace(/___+/g, '…') : x.q.q).slice(0, 160)),
        x.q.type === 'num' ? h('p', {}, L('Lösung: ', 'Solution: '), h('b', {}, fmt(x.q.answer) + (x.q.unit ? ' ' + x.q.unit : ''))) : x.q.type === 'mc' ? h('p', {}, L('Richtig: ', 'Correct: '), (x.q.correct || []).map(i => x.q.options[i]).join(' · ')) : x.q.type === 'tf' ? h('p', {}, L('Richtig: ', 'Correct: '), x.q.correct ? L('wahr', 'true') : L('falsch', 'false')) : x.q.type === 'cloze' ? h('p', {}, L('Lücken: ', 'Gaps: '), (x.q.blanks || []).join(' · ')) : null,
        x.q.solution ? h('div', { class: 'sol' }, String(x.q.solution).replace(/<br\s*\/?>/g, '\n')) : null, x.q.explain ? h('p', { class: 'xs-e' }, richText(x.q.explain)) : null)))));
}
