// Klausurplan: Klausurdatum + Lernzeit → konkreter Tag-für-Tag-Plan bis zur Prüfung.
// Wird komplett lokal berechnet (keine KI-Kosten). Nur der Lernpfad kostet, falls er noch fehlt.
import { h, ico, toast, modal, ls, uid } from '../util.js';
import { face } from '../face.js';
import { save, mastery } from '../state.js';
import { generatePath, pathPending } from './path.js';
import { dueCards } from './cards.js';
import { loading, apiError, costBtn, freshen } from '../ui.js';
import { moodLine, getSpice } from '../max.js';
import { L, EN, LOCALE } from '../i18n.js';

// ---------- Datum (lokal, nicht UTC) ----------
const DAY = 864e5;
const pad = n => String(n).padStart(2, '0');
export const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dparse = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = dparse(k); d.setDate(d.getDate() + n); return dkey(d); };
const between = (a, b) => Math.round((dparse(b) - dparse(a)) / DAY);
const fmt = (k, o) => dparse(k).toLocaleDateString(LOCALE, o);
const fmtLong = k => fmt(k, { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = k => fmt(k, { weekday: 'short', day: 'numeric', month: 'short' });
const wdName = i => new Date(2024, 0, i === 0 ? 7 : i).toLocaleDateString(LOCALE, { weekday: 'short' }).replace('.', '');
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const minFmt = m => m >= 60 ? L(`${Math.floor(m / 60)} Std.${m % 60 ? ' ' + (m % 60) + ' Min.' : ''}`, `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`) : L(`${m} Min.`, `${m} min`);

// ---------- Ziele / Noten ----------
const GRADES = [[.95, '1,0'], [.9, '1,3'], [.85, '1,7'], [.8, '2,0'], [.75, '2,3'], [.7, '2,7'], [.65, '3,0'], [.6, '3,3'], [.55, '3,7'], [.5, '4,0']];
const gradeOf = p => { for (const [g, n] of GRADES) if (p >= g - 1e-9) return n; return '5,0'; };
export const GOALS = EN ? [[.9, 'Top grade'], [.75, 'Good grade'], [.5, 'Pass']] : [[.95, '1,0'], [.9, '1,3'], [.85, '1,7'], [.8, '2,0'], [.75, '2,3'], [.7, '2,7'], [.65, '3,0'], [.5, 'Bestanden']];
export const goalLabel = p => EN ? (p >= .9 ? 'top grade' : p >= .75 ? 'good grade' : 'pass') : (p <= .5 ? 'bestanden' : gradeOf(p));
const estLabel = p => EN ? (p >= .9 ? 'a top grade' : p >= .75 ? 'a good grade' : p >= .5 ? 'a pass' : 'not a pass yet') : (p >= .5 ? gradeOf(p) : L('noch nicht bestanden'));
const nearestGoal = p => GOALS.reduce((a, g) => Math.abs(g[0] - p) < Math.abs(a[0] - p) ? g : a, GOALS[0])[0];

// ---------- Aufgaben ----------
const MIN = { quiz: 12, explain: 10, cards: 10, mock: 50, mistakes: 15, sheet: 15 };
const span = c => Math.max(1, (c.pages?.[1] || c.pages?.[0] || 1) - (c.pages?.[0] || 1) + 1);
const lessonMin = c => Math.round(Math.min(45, Math.max(15, 10 + span(c) * 3 + (c.weight || 2) * 4)) / 5) * 5;
const KIND = {
  lesson: { ico: 'board', tab: 'pfad', arg: t => String(t.chapter) },
  quiz: { ico: 'quiz', tab: 'quiz', arg: t => 'k' + t.chapter },
  explain: { ico: 'bulb', tab: 'pfad', arg: t => String(t.chapter) },
  cards: { ico: 'cards', tab: 'karten' },
  mock: { ico: 'exam', tab: 'quiz' },
  mistakes: { ico: 'refresh', tab: 'quiz' },
  sheet: { ico: 'brain', tab: 'zettel' },
};
function taskLabel(t, doc) {
  const c = doc.path?.chapters?.[t.chapter];
  const n = c ? c.title : L(`Kapitel ${(t.chapter ?? 0) + 1}`, `Chapter ${(t.chapter ?? 0) + 1}`);
  switch (t.kind) {
    case 'lesson': return L(`Lektion: ${n}`, `Lesson: ${n}`);
    case 'quiz': return t.rep ? L(`Wiederholungs-Quiz: ${n}`, `Review quiz: ${n}`) : L(`Quiz zu ${n}`, `Quiz on ${n}`);
    case 'explain': return L(`Erklär’s selbst: ${n}`, `Explain it yourself: ${n}`);
    case 'cards': return doc.decks.length ? L('Karteikarten wiederholen', 'Review flashcards') : L('Karteikarten erstellen & lernen', 'Create & study flashcards');
    case 'mock': return L('Probeklausur unter Zeitdruck', 'Timed mock exam');
    case 'mistakes': return L('Fehler wiederholen', 'Review your mistakes');
    case 'sheet': return L('Lernzettel durchgehen', 'Go through your study sheet');
  }
  return t.label || '';
}
function taskHint(t, doc) {
  switch (t.kind) {
    case 'lesson': return L('Tafel + Kontrollfragen', 'Whiteboard + check questions');
    case 'quiz': return t.rep ? L('Altes Quiz wiederholen ist kostenlos', 'Retaking an old quiz is free') : L('Gleich festigen, was du gelernt hast', 'Lock in what you just learned');
    case 'explain': return L('Wer’s erklären kann, kann’s', 'If you can explain it, you know it');
    case 'cards': return doc.decks.length ? L(`${dueCards(doc).length} fällig · kostenlos`, `${dueCards(doc).length} due · free`) : L('einmalig 2 Einheiten', 'one-off 2 credits');
    case 'mock': return L('45 Min., mit Notenschätzung', '45 min, with estimated grade');
    case 'mistakes': return doc.mistakes.length ? L(`${doc.mistakes.length} offene Fehler · kostenlos`, `${doc.mistakes.length} open mistakes · free`) : L('kostenlos', 'free');
    case 'sheet': return L('Alles Wichtige auf einer Seite', 'Everything on one page');
  }
  return '';
}

// ---------- Plan berechnen ----------
function studyDays(from, exam, weekdays) { const out = []; for (let k = from; k < exam; k = addDays(k, 1)) if (weekdays.includes(dparse(k).getDay())) out.push(k); return out; }
const doneKeys = old => { const s = new Set(); (old?.days || []).forEach(d => d.tasks.forEach(t => { if (!t.done) return; if (t.kind === 'lesson' || t.kind === 'explain') s.add(t.kind + ':' + t.chapter); if (t.kind === 'quiz') s.add(`quiz:${t.chapter}:${t.rep ? 1 : 0}`); if (t.kind === 'mock') s.add('mock'); })); return s; };

export function buildPlan(doc, opts, old = null) {
  const today = dkey();
  const chs = doc.path?.chapters || [];
  const cap = Math.max(15, opts.minutes | 0);
  let days = studyDays(today, opts.exam, opts.weekdays);
  const emergency = !days.length;
  if (emergency) days = [today];
  const N = days.length;
  const doneSet = doneKeys(old);
  const light = N >= 3 ? N - 1 : -1;
  const mockI = doneSet.has('mock') ? -1 : N >= 6 ? N - 3 : N === 5 ? N - 2 : -1;
  const post = N >= 6 ? N - 2 : -1;
  const learnEnd = mockI >= 0 ? mockI : post >= 0 ? post : light >= 0 ? light : N;
  const mk = (kind, chapter, minutes, extra = {}) => ({ id: uid(), kind, chapter, minutes, done: false, ...extra });

  const attempt = level => {
    const slots = days.slice(0, Math.max(1, learnEnd)).map(date => ({ date, tasks: [], used: 0 }));
    const S = slots.length;
    const lessons = chs.map((c, i) => i).filter(i => !chs[i].done && !doneSet.has('lesson:' + i));
    if (level >= 4) lessons.sort((a, b) => (chs[b].weight || 2) - (chs[a].weight || 2) || a - b);
    const n = lessons.length;
    const gap = n ? Math.min(2, Math.max(.01, (S * .85) / n)) : 0;
    const defer = [];
    const follow = (i, d) => {
      const w = chs[i].weight || 2;
      if (!doneSet.has(`quiz:${i}:0`) && (w >= 2 || level <= 2)) defer.push({ t: mk('quiz', i, MIN.quiz), avail: d + 1, core: w >= 2 });
      if (level <= 1 && w >= 2 && !doneSet.has('explain:' + i)) defer.push({ t: mk('explain', i, MIN.explain), avail: d + 2 });
      if (level <= 1 && w === 3 && !doneSet.has(`quiz:${i}:1`)) defer.push({ t: mk('quiz', i, MIN.quiz, { rep: 1 }), avail: d + 5 });
    };
    chs.forEach((c, i) => { if (!lessons.includes(i) && (c.done || doneSet.has('lesson:' + i))) follow(i, -1); });
    let qi = 0;
    for (let d = 0; d < S; d++) {
      const s = slots[d];
      const add = t => { s.tasks.push(t); s.used += t.minutes; };
      if ((d > 0 || doc.decks.length) && level < 4 && (cap >= 40 && level < 3 || d % 2 === 1)) add(mk('cards', null, MIN.cards));
      const followUps = () => {
        defer.sort((a, b) => a.avail - b.avail);
        for (let k = 0; k < defer.length; k++) { const x = defer[k]; if (x.avail > d) continue; if (s.used + x.t.minutes <= cap) { add(x.t); defer.splice(k--, 1); } }
      };
      if (level < 4) followUps();
      let today = 0;
      while (qi < n && Math.floor(qi * gap + 1e-9) <= d) {
        const i = lessons[qi], m = lessonMin(chs[i]);
        if (s.used + m <= cap * 1.1 || (!today && s.used < cap * .6)) { add(mk('lesson', i, m)); follow(i, d); qi++; today++; } else break;
      }
      if (level >= 4) followUps();
      if (!s.tasks.some(t => t.kind !== 'cards') && qi >= n) s.buffer = true;
    }
    // Lange Vorlaufzeit: Puffertage (bis auf die letzten zwei) für verteilte Wiederholung nutzen
    const free = slots.map((s, d) => d).filter(d => slots[d].buffer && d < S - 2);
    if (free.length && n + chs.length) {
      const rot = chs.flatMap((c, i) => (c.weight || 2) >= 3 ? [i, i] : [i]).filter(i => !lessons.slice(qi).includes(i));
      let r = 0;
      free.forEach((d, j) => {
        const s = slots[d];
        if ((j % 3 === 2 || !rot.length) && s.used + MIN.mistakes <= cap) { s.tasks.push(mk('mistakes', null, MIN.mistakes)); s.used += MIN.mistakes; }
        else if (rot.length && s.used + MIN.quiz <= cap) { s.tasks.push(mk('quiz', rot[r++ % rot.length], MIN.quiz, { rep: 1 })); s.used += MIN.quiz; }
        s.buffer = false;
      });
    }
    const tail = [];
    if (mockI >= 0) tail.push({ date: days[mockI], tasks: [mk('mock', null, MIN.mock)], used: MIN.mock, mock: true });
    const restCore = defer.filter(x => x.core);
    if (post >= 0) {
      const s = { date: days[post], tasks: [mk('mistakes', null, MIN.mistakes), mk('cards', null, MIN.cards)], used: MIN.mistakes + MIN.cards, post: true };
      while (restCore.length && s.used + restCore[0].t.minutes <= cap * 1.1) { const t = restCore.shift().t; s.tasks.push(t); s.used += t.minutes; }
      tail.push(s);
    }
    // Übrige Pflicht-Quizze auf den leichtesten Lerntag
    restCore.forEach(x => { const ok = slots.filter((s, d) => d >= x.avail - 1); if (!ok.length) return; const s = ok.reduce((a, b) => b.used < a.used ? b : a, ok[0]); s.tasks.push(x.t); s.used += x.t.minutes; s.buffer = false; });
    if (light >= 0) {
      const tasks = [mk('cards', null, MIN.cards), mk('sheet', null, MIN.sheet)];
      if (post < 0 || cap >= 45) tasks.splice(1, 0, mk('mistakes', null, MIN.mistakes));
      tail.push({ date: days[light], tasks, used: tasks.reduce((a, t) => a + t.minutes, 0), light: true });
    }
    const all = [...slots, ...tail].filter(s => s.tasks.length || s.buffer);
    return { days: all, left: lessons.slice(qi), level, slots: S };
  };

  let r = null;
  for (let lv = 1; lv <= 4; lv++) { r = attempt(lv); if (!r.left.length) break; }
  r.days.forEach(d => { d.tasks.forEach(t => { t.orig = d.date; t.label = taskLabel(t, doc); }); delete d.used; });
  const need = r.days.reduce((a, d) => a + d.tasks.reduce((b, t) => b + t.minutes, 0), 0);
  return {
    v: 1, exam: opts.exam, weekdays: [...opts.weekdays], minutes: cap, goal: opts.goal ?? null,
    created: old?.created || Date.now(), updated: Date.now(), pathCreated: doc.path?.created || null,
    days: r.days.sort((a, b) => a.date < b.date ? -1 : 1), skipped: r.left, level: r.level, emergency,
    capacity: N * cap, need, studyDays: N
  };
}

// Plan neu berechnen, Erledigtes bleibt erhalten
function rebuild(doc, opts) {
  const old = doc.plan, today = dkey();
  const fresh = buildPlan(doc, opts, old);
  const hist = old.days.filter(d => d.date < today).map(d => ({ ...d, tasks: d.tasks.filter(t => t.done || t.missed) })).filter(d => d.tasks.length || d.moved);
  const doneNow = old.days.filter(d => d.date >= today).flatMap(d => d.tasks.filter(t => t.done));
  if (doneNow.length) {
    let td = fresh.days.find(d => d.date === today);
    if (!td) { td = { date: today, tasks: [] }; fresh.days.push(td); }
    td.tasks.unshift(...doneNow);
  }
  fresh.days = [...hist, ...fresh.days.filter(d => d.date >= today)].sort((a, b) => a.date < b.date ? -1 : 1);
  return fresh;
}

// ---------- Laufender Plan: automatisch abhaken, Verpasstes nachholen ----------
const allTasks = plan => plan.days.flatMap(d => d.tasks);
const RANK = { lesson: 0, mock: 0, quiz: 1, explain: 2, mistakes: 3, cards: 4, sheet: 5 };
const ordered = ts => [...ts].sort((a, b) => (!!a.missed - !!b.missed) || (!!b.rolled - !!a.rolled) || (RANK[a.kind] ?? 9) - (RANK[b.kind] ?? 9));
function markDone(t, when) { t.done = true; t.auto = true; t.doneAt = when || dkey(); }

function autoComplete(doc, plan) {
  let ch = false;
  const today = dkey();
  const chs = doc.path?.chapters || [];
  for (const d of plan.days) for (const t of d.tasks) {
    if (t.done || t.missed) continue;
    if (t.kind === 'lesson' && chs[t.chapter]?.done) { markDone(t); ch = true; }
  }
  // Quiz-Ergebnisse seit Planstart „verbrauchen“ passende Aufgaben (Kapitel-Quiz bzw. Probeklausur)
  const res = [];
  doc.quizzes.forEach(q => (q.results || []).forEach(r => { if (r.at >= plan.created - 6e4) res.push({ q, at: r.at }); }));
  const consume = (match, kind, chapter) => {
    const hits = res.filter(x => match(x.q)).sort((a, b) => a.at - b.at);
    const ts = allTasks(plan).filter(t => t.kind === kind && (chapter == null || t.chapter === chapter) && !t.missed);
    const doneN = ts.filter(t => t.done).length;
    const open = ts.filter(t => !t.done).sort((a, b) => (a.orig < b.orig ? -1 : 1));
    for (let k = doneN; k < hits.length && open.length; k++) { markDone(open.shift(), dkey(new Date(hits[k].at))); ch = true; }
  };
  chs.forEach((c, i) => consume(q => !q.exam && q.title === c.title, 'quiz', i));
  consume(q => !!q.exam, 'mock', null);
  // Heute: Karten/Fehler, wenn nichts mehr offen ist
  const td = plan.days.find(d => d.date === today);
  if (td) for (const t of td.tasks) {
    if (t.done) continue;
    if (t.kind === 'cards' && doc.decks.length && !dueCards(doc).length) { markDone(t); ch = true; }
    if (t.kind === 'mistakes' && !doc.mistakes.length && doc.quizzes.some(q => q.results?.length)) { markDone(t); ch = true; }
  }
  return ch;
}

function ensureDay(plan, date) {
  let d = plan.days.find(x => x.date === date);
  if (!d) { d = { date, tasks: [] }; plan.days.push(d); plan.days.sort((a, b) => a.date < b.date ? -1 : 1); }
  return d;
}
const load = d => d.tasks.filter(t => !t.done).reduce((a, t) => a + t.minutes, 0);

export function rollover(plan) {
  const today = dkey();
  if (today >= plan.exam) return false;
  let ch = false; const moved = [];
  for (const d of plan.days) {
    if (d.date >= today) continue;
    for (const t of d.tasks) {
      if (t.done || t.missed) continue;
      if (t.kind === 'cards' || t.kind === 'sheet') { t.missed = true; ch = true; continue; }
      moved.push(t); d.moved = (d.moved || 0) + 1;
    }
    d.tasks = d.tasks.filter(t => !moved.includes(t));
  }
  if (!moved.length) return ch;
  if (plan.weekdays.includes(dparse(today).getDay())) ensureDay(plan, today);
  let targets = plan.days.filter(d => d.date >= today && !d.light);
  if (!targets.length) targets = plan.days.filter(d => d.date >= today);
  if (!targets.length) targets = [ensureDay(plan, today)];
  const cap = plan.minutes * 1.15;
  // Reihenfolge wahren: Lektion vor ihrem Quiz, Quiz nach seiner Lektion
  const dayOf = pred => { for (const d of plan.days) if (d.date >= today && d.tasks.some(x => !x.done && pred(x))) return d.date; return null; };
  moved.sort((a, b) => (RANK[a.kind] ?? 9) - (RANK[b.kind] ?? 9) || (a.orig < b.orig ? -1 : 1));
  const place = (t, lo) => {
    const ok = targets.filter(x => !lo || x.date >= lo);
    const pool = ok.length ? ok : targets;
    const d = pool.find(x => load(x) + t.minutes <= cap) || pool.reduce((a, b) => load(b) < load(a) ? b : a, pool[0]);
    d.tasks.push(t); d.buffer = false;
    return d.date;
  };
  for (const t of moved) {
    t.rolled = true;
    const ch = t.chapter;
    const lo = (t.kind === 'quiz' || t.kind === 'explain') ? dayOf(x => x.chapter === ch && x.kind === 'lesson') : null;
    const at = place(t, lo);
    if (t.kind === 'lesson') {
      // Quiz/Erklären zu diesem Kapitel, die jetzt vor der Lektion lägen, wandern dahinter
      for (const d of plan.days) {
        if (d.date < today || d.date >= at) continue;
        const dep = d.tasks.filter(x => !x.done && x.chapter === ch && (x.kind === 'quiz' || x.kind === 'explain'));
        if (!dep.length) continue;
        d.tasks = d.tasks.filter(x => !dep.includes(x));
        dep.forEach(x => place(x, at));
      }
    }
  }
  plan.days = plan.days.filter(d => d.tasks.length || d.moved || d.buffer);
  return true;
}

export function progress(plan) {
  const today = dkey();
  const all = allTasks(plan).filter(t => !t.missed);
  const done = all.filter(t => t.done).length, total = all.length;
  const expected = all.filter(t => t.orig < today).length;
  const td = plan.days.find(d => d.date === today);
  const todayT = ordered((td?.tasks || []).filter(t => !t.missed));
  const expectedEnd = all.filter(t => t.orig <= today).length;
  return { total, done, expected, expectedEnd, frac: total ? done / total : 0, expFrac: total ? expected / total : 0, todayT, todayOpen: todayT.filter(t => !t.done), daysLeft: between(today, plan.exam), day: td };
}
function moodState(plan, p) {
  const today = dkey();
  if (today === plan.exam) return 'exam_day';
  const behind = p.expected - p.done, f = p.total ? behind / p.total : 0;
  if (behind >= 4 && f >= .2) return 'way_behind';
  if (behind >= 2 || (behind >= 1 && f >= .1)) return 'behind';
  if (p.done - p.expectedEnd >= Math.max(2, p.total * .08)) return 'ahead';
  if (p.todayT.length && !p.todayOpen.length) return 'done_today';
  return 'ontrack';
}
const FACE = { ahead: 'happy', ontrack: 'idle', behind: 'sad', way_behind: 'sad', done_today: 'happy', exam_day: 'smug' };
const moodCache = {};
const mood = s => (moodCache[s + getSpice()] ||= moodLine(s));

function streak(doc, plan) {
  const act = new Set();
  allTasks(plan).forEach(t => t.done && t.doneAt && act.add(t.doneAt));
  Object.entries(doc.stats?.days || {}).forEach(([k, v]) => v > 0 && act.add(k));
  const today = dkey();
  let k = act.has(today) ? today : addDays(today, -1), n = 0;
  for (let i = 0; i < 400; i++, k = addDays(k, -1)) {
    if (act.has(k)) { n++; continue; }
    if (!plan.weekdays.includes(dparse(k).getDay())) continue;
    break;
  }
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = addDays(today, i - 6); return { d, on: act.has(d), rest: !plan.weekdays.includes(dparse(d).getDay()), today: d === today }; });
  return { n, todayDone: act.has(today), last7 };
}

// Max’ ehrliche Notenschätzung: Quiz-Ergebnisse + Lernstand + Tempo im Plan
function forecast(doc, plan, p) {
  const qs = doc.quizzes.filter(q => q.results?.length).slice(-3);
  const qa = qs.length ? qs.reduce((a, q) => a + q.results[q.results.length - 1].score, 0) / qs.length : null;
  const m = mastery(doc) / 100;
  if (qa == null && m < .05) return null;
  const base = qa != null ? .6 * qa + .4 * m : m;
  const pace = p.expected > 0 ? Math.min(1.2, p.done / p.expected) : 1;
  const projDone = Math.min(1, p.frac + (1 - p.frac) * Math.min(1, pace));
  const ceil = qa != null ? Math.min(.97, Math.max(qa + .15, .8)) : .85;
  const proj = Math.max(0, Math.min(.98, base + Math.max(0, ceil - base) * projDone * .8));
  return { proj, qa, m, sure: qs.length >= 2 };
}
function weakest(doc) {
  const chs = doc.path?.chapters || [];
  let best = null;
  chs.forEach((c, i) => {
    const qs = doc.quizzes.filter(q => !q.exam && q.title === c.title && q.results?.length);
    const sc = qs.length ? qs[qs.length - 1].results.slice(-1)[0].score : (c.done ? (c.score ?? .8) : 0);
    const val = sc - (c.weight || 2) * .05;
    if (!best || val < best.val) best = { i, c, sc, val };
  });
  return best;
}

// Für die Übersicht (Kachel)
export function planSummary(doc) {
  const plan = doc.plan; if (!plan) return null;
  if (autoComplete(doc, plan) | rollover(plan)) save(doc);
  const p = progress(plan);
  return { ...p, mood: moodState(plan, p), exam: plan.exam, todayMin: p.todayOpen.reduce((a, t) => a + t.minutes, 0) };
}

// ---------- Ansicht ----------
export async function render(root, ctx) {
  const wrap = h('div', { class: 'view-in klplan' });
  root.appendChild(wrap);
  if (ctx.doc.plan) return planView(wrap, ctx);
  if (pathPending(ctx.doc)) {
    const ld = loading(wrap, L('Max baut gerade deinen Lernpfad …', 'Max is building your study path …'), [], 'path');
    try { await ld.race(generatePath(ctx.doc)); } catch (e) {}
    ld.stop();
  }
  wizard(wrap, ctx);
}

// Eingabe-Formular (Neu und Bearbeiten)
function planForm(doc, init, onChange) {
  const today = dkey();
  const st = { exam: init.exam, weekdays: new Set(init.weekdays), minutes: init.minutes, goal: init.goal ?? null };
  const emit = () => onChange && onChange(st);
  // 1 Datum
  const date = h('input', { type: 'date', class: 'field pl-date', value: st.exam, min: addDays(today, 1), max: addDays(today, 365), 'aria-label': L('Klausurdatum', 'Exam date') });
  const until = h('span', { class: 'pl-until' });
  const showUntil = () => { const n = between(today, st.exam); until.textContent = n > 0 ? L(`in ${n} ${n === 1 ? 'Tag' : 'Tagen'} · ${fmt(st.exam, { weekday: 'long' })}`, `in ${n} ${n === 1 ? 'day' : 'days'} · ${fmt(st.exam, { weekday: 'long' })}`) : L('Bitte ein Datum in der Zukunft', 'Please pick a future date'); };
  date.addEventListener('change', () => { if (/^\d{4}-\d{2}-\d{2}$/.test(date.value)) { st.exam = date.value; showUntil(); quick.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.k === st.exam)); emit(); } });
  const quick = h('div', { class: 'chips' }, [7, 14, 21, 28, 42].map(n => { const k = addDays(today, n); return h('button', { type: 'button', class: 'chip' + (k === st.exam ? ' on' : ''), 'data-k': k, onclick: e => { st.exam = k; date.value = k; showUntil(); e.currentTarget.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.currentTarget)); emit(); } }, n % 7 ? L(`${n} Tage`, `${n} days`) : L(`${n / 7} Wo.`, `${n / 7} wk`)); }));
  showUntil();
  // 2 Tage + Minuten
  const wd = h('div', { class: 'pl-wd', role: 'group', 'aria-label': L('Lerntage', 'Study days') }, WEEK.map(i => {
    const b = h('button', { type: 'button', class: 'chip' + (st.weekdays.has(i) ? ' on' : ''), 'aria-pressed': st.weekdays.has(i) ? 'true' : 'false' }, wdName(i));
    b.addEventListener('click', () => { if (st.weekdays.has(i)) { if (st.weekdays.size > 1) st.weekdays.delete(i); } else st.weekdays.add(i); b.classList.toggle('on', st.weekdays.has(i)); b.setAttribute('aria-pressed', st.weekdays.has(i) ? 'true' : 'false'); emit(); });
    return b;
  }));
  const PRE = [30, 45, 60, 90, 120];
  const custom = h('input', { type: 'number', class: 'field pl-min', min: 15, max: 300, step: 5, value: st.minutes, 'aria-label': L('Minuten pro Tag', 'Minutes per day') });
  const customWrap = h('span', { class: 'pl-custom' + (PRE.includes(st.minutes) ? ' hidden' : '') }, custom, h('span', {}, L('Min.', 'min')));
  custom.addEventListener('input', () => { const v = parseInt(custom.value); if (v >= 15 && v <= 300) { st.minutes = v; emit(); } });
  const minChips = h('div', { class: 'chips' }, PRE.map(m => h('button', { type: 'button', class: 'chip' + (m === st.minutes ? ' on' : ''), onclick: e => { st.minutes = m; customWrap.classList.add('hidden'); minChips.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.currentTarget)); emit(); } }, m < 60 ? L(`${m} Min`, `${m} min`) : m === 60 ? L('1 Std', '1 h') : L(`${m / 60} Std`.replace('.', ','), `${m / 60} h`))),
    h('button', { type: 'button', class: 'chip' + (PRE.includes(st.minutes) ? '' : ' on'), onclick: e => { customWrap.classList.remove('hidden'); minChips.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.currentTarget)); custom.focus(); const v = parseInt(custom.value); if (v >= 15) { st.minutes = v; emit(); } } }, L('Eigene', 'Custom')), customWrap);
  // 3 Ziel
  const goals = h('div', { class: 'chips' }, GOALS.map(([p, l]) => h('button', { type: 'button', class: 'chip' + (st.goal != null && Math.abs(st.goal - p) < .001 ? ' on' : ''), onclick: e => { const on = e.currentTarget.classList.contains('on'); st.goal = on ? null : p; goals.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', !on && c === e.currentTarget)); emit(); } }, l)));
  const step = (n, title, ...kids) => h('div', { class: 'pl-step' }, h('div', { class: 'pl-n' }, n), h('div', { class: 'pl-sb' }, h('label', { class: 'l' }, title), ...kids));
  const el = h('div', { class: 'pl-form' },
    step('1', L('Wann ist die Klausur?', 'When is the exam?'), h('div', { class: 'pl-daterow' }, date, until), quick),
    step('2', L('Wann und wie lange lernst du?', 'When and how long do you study?'), wd, minChips),
    step('3', L('Dein Ziel (optional)', 'Your goal (optional)'), goals));
  return { el, st };
}

function feasibility(doc, st) {
  const today = dkey();
  if (!(st.exam > today)) return { bad: true, text: L('Wähl ein Datum nach heute.', 'Pick a date after today.') };
  const wd = [...st.weekdays];
  const n = studyDays(today, st.exam, wd).length;
  const cap = n * st.minutes;
  let need, skipped = 0, level = 1;
  if (doc.path) { const p = buildPlan(doc, { exam: st.exam, weekdays: wd, minutes: st.minutes }); need = p.need; skipped = p.skipped.length; level = p.level; }
  else need = Math.round(doc.pages.length * 5 + 90);
  const head = L(`${n || 1} Lerntag${n === 1 ? '' : 'e'} · ${minFmt(cap || st.minutes)} Zeit`, `${n || 1} study day${n === 1 ? '' : 's'} · ${minFmt(cap || st.minutes)} of time`);
  let verdict, tone;
  if (!n) { verdict = L('Kein Lerntag mehr vor der Klausur – ich mache dir einen Notfallplan für heute.', 'No study day left before the exam – I’ll make you an emergency plan for today.'); tone = 'warn'; }
  else if (skipped) { verdict = L(`Zu knapp für alles: ${skipped} Kapitel passen nicht rein. Ich priorisiere die klausurrelevanten.`, `Too tight for everything: ${skipped} chapter(s) won’t fit. I’ll prioritise what matters most for the exam.`); tone = 'warn'; }
  else if (level > 1 || need > cap) { verdict = L('Knapp, aber machbar. Ich lasse Extras weg und konzentriere mich aufs Wesentliche.', 'Tight but doable. I’ll drop extras and focus on the essentials.'); tone = 'mid'; }
  else if (need < cap * .6) { verdict = L('Entspannt. Du hast Puffer für Wiederholung.', 'Relaxed. You’ll have buffer for review.'); tone = 'ok'; }
  else { verdict = L('Passt gut.', 'Fits well.'); tone = 'ok'; }
  return { text: head, verdict, tone };
}

function wizard(wrap, ctx) {
  const { doc } = ctx;
  wrap.classList.remove('still');
  const today = dkey();
  const prefs = ls.get('tutor.planPrefs', {}) || {};
  const g = ls.get('tutor.goal', null);
  const init = {
    exam: g?.examDate && g.examDate > today ? g.examDate : addDays(today, 21),
    weekdays: Array.isArray(prefs.weekdays) && prefs.weekdays.length ? prefs.weekdays : [1, 2, 3, 4, 5],
    minutes: prefs.minutes || 60,
    goal: typeof g?.grade === 'number' ? nearestGoal(g.grade) : null
  };
  const feas = h('div', { class: 'pl-feas' });
  const update = st => { const f = feasibility(doc, st); feas.dataset.tone = f.tone || 'warn'; feas.replaceChildren(h('b', {}, f.text), f.verdict ? h('span', {}, f.verdict) : null); btn.disabled = !!f.bad; };
  const form = planForm(doc, init, st => update(st));
  const create = () => {
    const st = form.st;
    const opts = { exam: st.exam, weekdays: [...st.weekdays].sort(), minutes: st.minutes, goal: st.goal };
    ls.set('tutor.planPrefs', { weekdays: opts.weekdays, minutes: opts.minutes });
    if (!doc.path) return withPath(wrap, ctx, opts);
    finishCreate(wrap, ctx, opts);
  };
  const btn = doc.path
    ? h('button', { class: 'btn primary lg', onclick: create }, L('Plan erstellen', 'Create plan'), h('span', { html: ico('right') }))
    : costBtn(L('Lernpfad + Plan erstellen', 'Create study path + plan'), 'path', create, 'btn primary lg');
  const f = h('div', { class: 'face' });
  wrap.replaceChildren(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, L('Klausurplan', 'Exam plan')), h('h2', {}, L('Bis zur Klausur. Mit Plan.', 'All the way to the exam. With a plan.')),
      h('p', {}, L('Drei Angaben – ich mach daraus einen Tag-für-Tag-Plan mit Lektionen, Quizzen, Karteikarten und Probeklausur. Kostenlos.', 'Three answers – I’ll turn them into a day-by-day plan with lessons, quizzes, flashcards and a mock exam. Free.')))),
    h('div', { class: 'pl-wiz' },
      h('div', { class: 'pl-maxrow' }, f, h('div', { class: 'pl-say' }, L(['Sag mir, wann’s ernst wird. Ich plane den Rest.', 'Drei Angaben, dann plane ich. So plant Papa seine Übernahmen.', 'Ich hab schon Yachtausflüge schlechter geplant. Los geht’s.'], ['Tell me when it gets serious. I’ll plan the rest.', 'Three answers and I’ll plan. That’s how Dad plans his takeovers.', 'I’ve planned yacht trips worse than this. Let’s go.'])[getSpice() - 1])),
      form.el,
      h('div', { class: 'pl-go' }, feas, btn),
      doc.path ? null : h('p', { class: 'pl-fine' }, L('Dein Skript hat noch keinen Lernpfad. Max teilt es zuerst in Kapitel (2 Einheiten) – der Plan selbst kostet nichts.', 'Your slides don’t have a study path yet. Max splits them into chapters first (2 credits) – the plan itself is free.'))));
  face(f);
  update(form.st);
}

async function withPath(wrap, ctx, opts) {
  const ld = loading(wrap, L('Ich teile dein Skript in Kapitel …', 'Splitting your slides into chapters …'), L(['Lese das Skript', 'Finde die Kapitel', 'Gewichte für die Klausur', 'Danach plane ich deine Tage'], ['Reading the slides', 'Finding the chapters', 'Weighting for the exam', 'Then I’ll plan your days']), 'path');
  try { await ld.race(generatePath(ctx.doc)); ld.stop(); finishCreate(wrap, ctx, opts); freshen(wrap); }
  catch (e) { ld.stop(); wizard(wrap, ctx); apiError(e, () => withPath(wrap, ctx, opts)); }
}

function finishCreate(wrap, ctx, opts) {
  const { doc } = ctx;
  doc.plan = buildPlan(doc, opts);
  save(doc);
  planView(wrap, ctx, { fresh: true });
}

function planView(wrap, ctx, { fresh = false } = {}) {
  const { doc } = ctx;
  const plan = doc.plan;
  const today = dkey();
  if (autoComplete(doc, plan) | rollover(plan)) save(doc);
  let sel = (plan.days.find(d => d.date > today && d.tasks.length) || {}).date || today, first = true;
  const rerender = (o = {}) => { const y = wrap.parentNode?.scrollTop; draw(o); if (wrap.parentNode && y != null) wrap.parentNode.scrollTop = y; };
  const toggle = (t, d) => {
    t.done = !t.done; t.auto = false; t.doneAt = t.done ? dkey() : null;
    save(doc);
    const p = progress(plan);
    if (t.done && d.date === today && p.todayT.length && !p.todayOpen.length) toast(L('Tagesziel erreicht. ', 'Daily goal reached. ') + mood('done_today'), 4200);
    rerender({ pulse: t.done ? 'happy' : null });
  };
  const open = t => { const k = KIND[t.kind]; if (k) ctx.go(k.tab, k.arg ? k.arg(t) : null); };
  const taskRow = (t, d) => {
    const k = KIND[t.kind] || {};
    return h('div', { class: 'pl-task' + (t.done ? ' done' : '') + (t.missed ? ' missed' : '') },
      h('button', { class: 'pl-check', type: 'button', role: 'checkbox', 'aria-checked': t.done ? 'true' : 'false', 'aria-label': L('Erledigt', 'Done'), disabled: t.missed || null, onclick: () => toggle(t, d), html: t.done ? ico('check') : '' }),
      h('div', { class: 'pl-tx' },
        h('b', {}, taskLabel(t, doc)),
        h('span', {}, t.missed ? L('verpasst', 'missed') : `~${t.minutes} ${L('Min.', 'min')}`, t.missed ? null : ' · ' + taskHint(t, doc), t.rolled && !t.done ? h('em', { class: 'pl-roll' }, L('Nachholen', 'Catch up')) : null, t.auto && t.done ? h('em', { class: 'pl-auto' }, L('automatisch', 'auto')) : null)),
      k.tab && !t.missed ? h('button', { class: 'iconbtn pl-open', type: 'button', 'aria-label': L('Öffnen', 'Open'), title: L('Öffnen', 'Open'), html: ico(k.ico || 'right'), onclick: () => open(t) }) : null);
  };

  function draw({ pulse = null } = {}) {
    const p = progress(plan);
    const st = moodState(plan, p);
    const sk = streak(doc, plan);
    const m = mastery(doc);
    const passed = today > plan.exam;
    // ----- Kopf: Countdown, Fortschritt, Max -----
    const f = h('div', { class: 'face' });
    const pct = Math.round(p.frac * 100), exp = Math.round(p.expFrac * 100);
    const nextOpen = p.todayOpen[0];
    const behindN = Math.max(0, p.expected - p.done);
    const hero = h('section', { class: 'pl-hero on-inv' },
      h('div', { class: 'pl-count' },
        h('div', { class: 'eyebrow' }, L('Klausurplan', 'Exam plan') + ' · ' + (doc.path?.title || doc.name)),
        passed ? h('div', { class: 'pl-big' }, L('Geschafft.', 'Done.')) : p.daysLeft === 0 ? h('div', { class: 'pl-big' }, L('Heute!', 'Today!')) : h('div', { class: 'pl-big' }, h('span', { class: 'n' }, p.daysLeft), h('span', {}, p.daysLeft === 1 ? L('Tag bis zur Klausur', 'day to the exam') : L('Tage bis zur Klausur', 'days to the exam'))),
        h('div', { class: 'pl-when' }, h('span', { html: ico('calendar') }), (passed ? L('Klausur war am ', 'Exam was on ') : L('Klausur am ', 'Exam on ')) + fmtLong(plan.exam)),
        h('div', { class: 'pl-prog' },
          h('div', { class: 'pl-pl' }, h('span', {}, L(`${p.done} von ${p.total} Aufgaben`, `${p.done} of ${p.total} tasks`)), h('b', {}, pct + ' %')),
          h('div', { class: 'pl-bar', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { width: pct + '%' } }), !passed && exp > 0 && exp < 100 ? h('s', { style: { left: exp + '%' }, title: L(`Soll heute: ${exp} %`, `Target today: ${exp}%`) }) : null),
          h('div', { class: 'pl-leg' }, !passed && exp > 0 ? h('span', {}, h('s'), L(`Soll bis heute ${exp} %`, `Target by today ${exp}%`)) : null, h('span', {}, L(`Lernstand ${m} %`, `Mastery ${m}%`))))),
      h('div', { class: 'pl-mood', 'data-mood': st },
        h('div', { class: 'pl-mf' }, f),
        h('div', { class: 'pl-bub' },
          h('p', {}, passed ? L('Klausur vorbei. Egal wie’s lief – du hast es durchgezogen. Papa wäre stolz. Ich bin’s auch.', 'Exam’s over. However it went – you saw it through. Dad would be proud. So am I.') : mood(st)),
          h('div', { class: 'pl-mtag' }, passed ? '' : st === 'ahead' ? L('Vor dem Plan', 'Ahead of plan') : st === 'behind' || st === 'way_behind' ? L(`${behindN} ${behindN === 1 ? 'Aufgabe' : 'Aufgaben'} Rückstand`, `${behindN} ${behindN === 1 ? 'task' : 'tasks'} behind`) : st === 'done_today' ? L('Heute erledigt', 'Done for today') : st === 'exam_day' ? L('Klausurtag', 'Exam day') : L('Im Plan', 'On track')),
          nextOpen && !passed ? h('button', { class: 'btn sm pl-next', onclick: () => open(nextOpen) }, h('span', { class: 'tx' }, L('Jetzt: ', 'Now: ') + taskLabel(nextOpen, doc)), h('span', { html: ico('right') })) : null,
          st === 'way_behind' && !passed ? h('button', { class: 'btn sm ghost pl-adj', onclick: edit }, L('Plan realistischer machen', 'Make the plan realistic')) : null)));

    // ----- Heute -----
    const todayCard = h('section', { class: 'pl-card pl-today' });
    const dayMin = p.todayT.reduce((a, t) => a + t.minutes, 0);
    const nextDay = plan.days.find(d => d.date > today && d.tasks.some(t => !t.done && !t.missed));
    const pull = () => {
      const t = nextDay.tasks.find(x => !x.done && x.kind !== 'cards') || nextDay.tasks.find(x => !x.done);
      nextDay.tasks = nextDay.tasks.filter(x => x !== t);
      ensureDay(plan, today).tasks.push(t);
      plan.days = plan.days.filter(d => d.tasks.length || d.moved || d.buffer || d.date === today);
      save(doc); rerender(); toast(L('Vorgezogen. Zukunfts-Du sagt danke.', 'Pulled forward. Future you says thanks.'));
    };
    if (passed) {
      todayCard.append(h('div', { class: 'pl-ch' }, h('h3', {}, L('Wie geht’s weiter?', 'What’s next?'))),
        h('p', { class: 'pl-empty' }, L('Nächste Klausur? Erstell einfach einen neuen Plan. Deine Karteikarten und Quizze bleiben.', 'Next exam? Just create a new plan. Your flashcards and quizzes stay.')),
        h('div', { class: 'pl-row' }, h('button', { class: 'btn primary', onclick: () => { doc.plan = null; save(doc); wizard(wrap, ctx); } }, L('Neuen Plan erstellen', 'Create a new plan'))));
    } else if (p.daysLeft === 0) {
      todayCard.append(h('div', { class: 'pl-ch' }, h('h3', {}, L('Heute: Klausur', 'Today: the exam')), h('span', { class: 'tag' }, fmtShort(today))),
        h('ul', { class: 'pl-list' }, (L(['Ausweis, Studienausweis, Taschenrechner, zwei Stifte', 'Frühstück. Wasser. Pünktlich da sein.', 'Erst die Aufgaben lösen, die du sicher kannst', 'Jede Aufgabe zweimal lesen – Prof-Fallen erkennen'], ['ID, student card, calculator, two pens', 'Breakfast. Water. Be on time.', 'Solve the tasks you’re sure about first', 'Read every question twice – spot the traps'])).map(x => h('li', {}, x))));
    } else {
      todayCard.append(h('div', { class: 'pl-ch' },
        h('div', {}, h('div', { class: 'eyebrow' }, L('Heute', 'Today') + ' · ' + fmtShort(today)), h('h3', {}, p.todayT.length ? (p.todayOpen.length ? L(`${p.todayOpen.length} ${p.todayOpen.length === 1 ? 'Aufgabe' : 'Aufgaben'} · ~${minFmt(p.todayOpen.reduce((a, t) => a + t.minutes, 0))}`, `${p.todayOpen.length} ${p.todayOpen.length === 1 ? 'task' : 'tasks'} · ~${minFmt(p.todayOpen.reduce((a, t) => a + t.minutes, 0))}`) : L('Alles erledigt', 'All done')) : L('Heute ist frei', 'Day off today'))),
        p.todayT.length ? h('div', { class: 'pl-ring', style: { '--p': Math.round(100 * (p.todayT.length - p.todayOpen.length) / p.todayT.length) } }, h('span', {}, `${p.todayT.length - p.todayOpen.length}/${p.todayT.length}`)) : null));
      if (p.day?.light) todayCard.append(h('p', { class: 'pl-note' }, L('Letzter Tag vor der Klausur: nur wiederholen, nichts Neues. Und früh schlafen – Schlaf sortiert das Gelernte.', 'Last day before the exam: review only, nothing new. And sleep early – sleep consolidates what you learned.')));
      if (p.todayT.length) todayCard.append(h('div', { class: 'pl-tasks' }, p.todayT.map(t => taskRow(t, p.day))));
      else todayCard.append(h('p', { class: 'pl-empty' }, nextDay ? (plan.weekdays.includes(dparse(today).getDay()) ? L(`Heute steht nichts an. Weiter geht’s ${fmtLong(nextDay.date)}.`, `Nothing planned today. Next up: ${fmtLong(nextDay.date)}.`) : L(`Kein Lerntag laut Plan. Weiter geht’s ${fmtLong(nextDay.date)}.`, `Not a study day in your plan. Next up: ${fmtLong(nextDay.date)}.`)) : L('Nichts mehr geplant.', 'Nothing left on the plan.')));
      if (p.todayT.length && !p.todayOpen.length && dayMin) todayCard.append(h('p', { class: 'pl-note' }, L(`~${minFmt(dayMin)} gelernt. Kleiner Sieg – genau die summieren sich.`, `~${minFmt(dayMin)} studied. A small win – those add up.`)));
      if (!p.todayOpen.length && nextDay) todayCard.append(h('div', { class: 'pl-row' }, h('button', { class: 'btn sm', onclick: pull }, h('span', { html: ico('plus') }), L('Eine Aufgabe von morgen vorziehen', 'Pull one task forward from tomorrow'))));
      if (sk.n > 0 && !sk.todayDone && p.todayOpen.length) todayCard.append(h('p', { class: 'pl-note strong' }, L(`Deine Serie: ${sk.n} ${sk.n === 1 ? 'Tag' : 'Tage'}. Eine Aufgabe heute hält sie am Leben.`, `Your streak: ${sk.n} ${sk.n === 1 ? 'day' : 'days'}. One task today keeps it alive.`)));
    }

    // ----- Serie + Ziel-Check -----
    const fc = forecast(doc, plan, p);
    const goal = plan.goal;
    let goalBody;
    if (!fc) goalBody = h('p', { class: 'pl-empty' }, L('Noch keine Daten. Mach die erste Lektion oder ein Quiz – dann schätze ich deine Note.', 'No data yet. Do your first lesson or a quiz – then I’ll estimate your grade.'));
    else {
      const ok = goal == null ? null : fc.proj >= goal - 1e-9 ? 'ok' : fc.proj >= goal - .05 ? 'close' : 'gap';
      const w = weakest(doc);
      goalBody = h('div', {},
        h('div', { class: 'pl-est' }, h('span', {}, L('Auf Kurs für', 'On course for')), h('b', {}, estLabel(fc.proj))),
        goal != null ? h('p', { class: 'pl-gv', 'data-ok': ok }, ok === 'ok' ? L(`Dein Ziel ${goalLabel(goal)} ist in Reichweite. Plan durchziehen.`, `Your goal (${goalLabel(goal)}) is within reach. Stick to the plan.`) : ok === 'close' ? L(`Knapp unter deinem Ziel ${goalLabel(goal)}. Quizze bringen hier am meisten.`, `Just below your goal (${goalLabel(goal)}). Quizzes help most here.`) : L(`Bis ${goalLabel(goal)} fehlt noch was. Für dein Ziel brauchst du in Quizzen um die ${Math.round(goal * 100)} %.`, `There’s still a gap to ${goalLabel(goal)}. For your goal you need around ${Math.round(goal * 100)}% in quizzes.`)) : null,
        w && w.sc < .85 ? h('button', { class: 'pl-lever', onclick: () => ctx.go('quiz', 'k' + w.i) }, h('span', {}, L('Größter Hebel', 'Biggest lever')), h('b', {}, w.c.title), h('span', { html: ico('right') })) : null,
        h('p', { class: 'pl-fine' }, fc.sure ? L('Max’ Schätzung aus Quiz-Ergebnissen, Lernstand und Tempo. Keine Garantie.', 'Max’s estimate from quiz scores, mastery and pace. No guarantee.') : L('Grobe Schätzung – nach zwei Quizzen wird sie genauer.', 'Rough estimate – it gets sharper after two quizzes.')));
    }
    const side = h('section', { class: 'pl-card pl-side' },
      h('div', { class: 'pl-streak' },
        h('div', {}, h('div', { class: 'eyebrow' }, L('Serie', 'Streak')), sk.n ? h('div', { class: 'pl-sn' }, h('b', {}, sk.n), h('span', {}, sk.n === 1 ? L('Lerntag am Stück', 'study day in a row') : L('Lerntage am Stück', 'study days in a row'))) : h('div', { class: 'pl-sn zero' }, h('span', {}, L('Hak heute eine Aufgabe ab – dann startet deine Serie.', 'Tick off one task today to start your streak.')))),
        h('div', { class: 'pl-7' }, sk.last7.map(x => h('i', { class: (x.on ? 'on' : x.rest ? 'rest' : '') + (x.today ? ' td' : ''), title: fmtShort(x.d) }, wdName(dparse(x.d).getDay()).slice(0, 2))))),
      h('div', { class: 'pl-goal' }, h('div', { class: 'eyebrow' }, L('Ziel-Check', 'Goal check') + (goal != null ? ' · ' + L('Ziel ', 'goal: ') + goalLabel(goal) : '')), goalBody));

    // ----- Notizen (ehrlich) -----
    const notes = [];
    if (plan.skipped?.length) notes.push(h('div', { class: 'pl-warn' }, h('b', {}, L('Ehrlich gesagt: Die Zeit reicht nicht für alles.', 'Honestly: there isn’t time for everything.')), h('span', {}, L(`Ich habe die klausurrelevantesten Kapitel priorisiert. Nicht im Plan: ${plan.skipped.map(i => doc.path?.chapters[i]?.title).filter(Boolean).join(', ')}. Mehr Zeit pro Tag oder mehr Lerntage holen sie zurück.`, `I prioritised the chapters that matter most for the exam. Not in the plan: ${plan.skipped.map(i => doc.path?.chapters[i]?.title).filter(Boolean).join(', ')}. More time per day or more study days bring them back.`)), h('button', { class: 'btn sm', onclick: edit }, L('Plan anpassen', 'Adjust plan'))));
    if (doc.path && plan.pathCreated && doc.path.created !== plan.pathCreated) notes.push(h('div', { class: 'pl-warn' }, h('b', {}, L('Dein Lernpfad ist neu.', 'Your study path is new.')), h('span', {}, L('Der Plan basiert noch auf den alten Kapiteln.', 'The plan is still based on the old chapters.')), h('button', { class: 'btn sm', onclick: () => { doc.plan = rebuild(doc, plan); save(doc); rerender(); toast(L('Plan aktualisiert.', 'Plan updated.')); } }, L('Plan aktualisieren', 'Update plan'))));

    // ----- Kalender -----
    const cal = calendar(p);
    wrap.replaceChildren(
      hero, ...notes,
      h('div', { class: 'pl-grid' }, todayCard, side),
      cal,
      h('div', { class: 'pl-foot' },
        h('button', { class: 'btn sm ghost', onclick: edit }, h('span', { html: ico('calendar') }), L('Plan bearbeiten', 'Edit plan')),
        h('button', { class: 'btn sm ghost', onclick: del }, h('span', { html: ico('trash') }), L('Plan löschen', 'Delete plan'))));
    wrap.classList.toggle('still', !first); first = false;
    if (fresh) { fresh = false; toast(L(`Dein Plan steht: ${plan.studyDays} Lerntage. Fang mit „Heute“ an.`, `Your plan is ready: ${plan.studyDays} study days. Start with “Today”.`), 4000); }
    const fcc = face(f, {});
    fcc.set(passed ? 'happy' : FACE[st] || 'idle');
    if (pulse) setTimeout(() => fcc.pulse(pulse, 1400), 60);
  }

  function calendar(p) {
    const byDate = new Map(plan.days.map(d => [d.date, d]));
    const first = plan.days.length ? (plan.days[0].date < today ? plan.days[0].date : today) : today;
    const startDow = (dparse(first).getDay() + 6) % 7;
    let k = addDays(first, -startDow);
    const endDow = (dparse(plan.exam).getDay() + 6) % 7;
    const end = addDays(plan.exam, 6 - endDow);
    const cells = [];
    while (k <= end) {
      const d = byDate.get(k), dt = dparse(k);
      const tasks = (d?.tasks || []).filter(t => !t.missed);
      const doneN = tasks.filter(t => t.done).length;
      const cls = ['pl-day'];
      if (k === today) cls.push('today');
      if (k === plan.exam) cls.push('exam');
      if (k < first || k > plan.exam) cls.push('out');
      if (!plan.weekdays.includes(dt.getDay())) cls.push('rest');
      if (tasks.length && doneN === tasks.length) cls.push('full');
      if (k < today && d?.moved) cls.push('moved');
      if (d?.mock) cls.push('mock');
      if (k === sel) cls.push('sel');
      const key = k;
      cells.push(h('button', { type: 'button', class: cls.join(' '), 'aria-label': fmtLong(k), onclick: () => { sel = key; const dd = calWrap.querySelector('.pl-dd'); calWrap.querySelectorAll('.pl-day.sel').forEach(x => x.classList.remove('sel')); cells[cellsIdx.get(key)].classList.add('sel'); dd.replaceWith(dayDetail(key)); } },
        h('span', { class: 'dn' }, dt.getDate() === 1 ? fmt(k, { day: 'numeric', month: 'short' }).replace('.', '') : dt.getDate()),
        d?.mock ? h('span', { class: 'lb' }, L('Probe', 'Mock')) : d?.light ? h('span', { class: 'lb' }, L('locker', 'light')) : null,
        k === plan.exam ? h('span', { class: 'ex' }, h('span', { html: ico('exam') }), h('b', {}, L('Klausur', 'Exam'))) : h('span', { class: 'dots' }, tasks.slice(0, 5).map(t => h('i', { class: t.done ? 'on' : '' })), tasks.length > 5 ? h('em', {}, '+') : null)));
      k = addDays(k, 1);
    }
    const cellsIdx = new Map(); { let c = addDays(first, -startDow); for (let i = 0; i < cells.length; i++, c = addDays(c, 1)) cellsIdx.set(c, i); }
    const dayDetail = key => {
      const d = byDate.get(key);
      const tasks = d?.tasks || [];
      const title = key === today ? L('Heute', 'Today') + ' · ' + fmtShort(key) : fmtLong(key);
      let body;
      if (key === plan.exam) body = h('p', { class: 'pl-empty' }, L('Klausurtag. Viel Erfolg – du bist vorbereitet.', 'Exam day. Good luck – you’re prepared.'));
      else if (!tasks.length) body = h('p', { class: 'pl-empty' }, d?.moved ? L(`${d.moved} offene ${d.moved === 1 ? 'Aufgabe wurde' : 'Aufgaben wurden'} auf die nächsten Lerntage verschoben.`, `${d.moved} open ${d.moved === 1 ? 'task was' : 'tasks were'} moved to the next study days.`) : d?.buffer ? L('Puffertag: Zeit für Nachholer oder Schwächen.', 'Buffer day: time to catch up or work on weak spots.') : key < today ? L('Kein Lerntag.', 'No study day.') : L('Frei. Erholung gehört zum Plan.', 'Free. Rest is part of the plan.'));
      else body = h('div', { class: 'pl-tasks' }, ordered(tasks).map(t => taskRow(t, d)), d.moved ? h('p', { class: 'pl-fine' }, L(`${d.moved} verschoben`, `${d.moved} moved`)) : null);
      const tag = d?.light ? L('Leichter Tag', 'Light day') : d?.mock ? L('Probeklausur', 'Mock exam') : d?.post ? L('Fehleranalyse', 'Error review') : d?.buffer ? L('Puffer', 'Buffer') : null;
      return h('div', { class: 'pl-dd' }, h('div', { class: 'pl-ch' }, h('h4', {}, title), tag ? h('span', { class: 'tag' }, tag) : null), body);
    };
    const calWrap = h('section', { class: 'pl-card pl-cal' },
      h('div', { class: 'pl-ch' }, h('div', {}, h('div', { class: 'eyebrow' }, L('Dein Plan', 'Your plan')), h('h3', {}, L(`${plan.studyDays || plan.days.length} Lerntage bis ${fmt(plan.exam, { day: 'numeric', month: 'long' })}`, `${plan.studyDays || plan.days.length} study days until ${fmt(plan.exam, { day: 'numeric', month: 'long' })}`))),
        h('div', { class: 'pl-key' }, h('span', {}, h('i', { class: 'on' }), L('erledigt', 'done')), h('span', {}, h('i'), L('offen', 'open')))),
      h('div', { class: 'pl-wk' }, WEEK.map(i => h('span', {}, wdName(i).slice(0, 2)))),
      h('div', { class: 'pl-month' }, cells),
      dayDetail(sel));
    return calWrap;
  }

  async function edit() {
    const box = h('div', { class: 'pl-feas' });
    const form = planForm(doc, { exam: plan.exam, weekdays: plan.weekdays, minutes: plan.minutes, goal: plan.goal }, st => { const f = feasibility(doc, st); box.dataset.tone = f.tone || 'warn'; box.replaceChildren(h('b', {}, f.text), f.verdict ? h('span', {}, f.verdict) : null); });
    { const f = feasibility(doc, form.st); box.dataset.tone = f.tone || 'warn'; box.replaceChildren(h('b', {}, f.text), f.verdict ? h('span', {}, f.verdict) : null); }
    const ok = await modal({ title: L('Plan bearbeiten', 'Edit plan'), text: L('Erledigtes bleibt erledigt. Alles Offene verteile ich neu.', 'Done stays done. I’ll redistribute everything that’s open.'), body: h('div', { class: 'pl-edit' }, form.el, box), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Plan aktualisieren', 'Update plan'), value: true, primary: true }] });
    if (!ok) return;
    if (!(form.st.exam > dkey())) { toast(L('Das Klausurdatum muss nach heute liegen.', 'The exam date has to be after today.')); return; }
    const opts = { exam: form.st.exam, weekdays: [...form.st.weekdays].sort(), minutes: form.st.minutes, goal: form.st.goal };
    ls.set('tutor.planPrefs', { weekdays: opts.weekdays, minutes: opts.minutes });
    doc.plan = rebuild(doc, opts);
    save(doc);
    toast(L('Plan aktualisiert.', 'Plan updated.'));
    planView(wrap, ctx);
  }
  async function del() {
    const ok = await modal({ title: L('Plan löschen?', 'Delete plan?'), text: L('Dein Klausurplan wird gelöscht. Lernpfad, Quizze und Karten bleiben.', 'Your exam plan will be deleted. Study path, quizzes and flashcards stay.'), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] });
    if (!ok) return;
    doc.plan = null; save(doc);
    wizard(wrap, ctx);
  }

  draw();
}
