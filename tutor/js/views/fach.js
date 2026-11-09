// Fach-Seite: alles für eine Prüfung an einem Ort – Countdown, Prüfungsreife, Lernplan fürs ganze Fach,
// Lernwerkzeuge über alle Skripte des Fachs und die Skripte selbst. Der Plan wird lokal berechnet (keine KI-Kosten);
// nur fehlende Lernpfade (Kapitel) kosten einmalig Einheiten.
import { h, ico, toast, modal, ls, uid } from '../util.js';
import { L, LOCALE } from '../i18n.js';
import { S, save } from '../state.js';
import * as M from '../me.js';
import { reife } from '../reife.js';
import { dueCards } from './cards.js';
import { buildPlan, planSummary, dkey } from './plan.js';
import { generatePath } from './path.js';
import { loading, apiError } from '../ui.js';
import { PAL, editFach } from './me.js';

const DAY = 864e5;
const pad = n => String(n).padStart(2, '0');
const dparse = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = dparse(k); d.setDate(d.getDate() + n); return dkey(d); };
const between = (a, b) => Math.round((dparse(b) - dparse(a)) / DAY);
const fmt = (k, o) => dparse(k).toLocaleDateString(LOCALE, o);
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const wdName = i => new Date(2024, 0, i === 0 ? 7 : i).toLocaleDateString(LOCALE, { weekday: 'short' }).replace('.', '');
const minFmt = m => m >= 60 ? L(`${Math.floor(m / 60)} Std.${m % 60 ? ' ' + (m % 60) + ' Min.' : ''}`, `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`) : L(`${m} Min.`, `${m} min`);
const studyDays = (from, exam, wd) => { let n = 0; for (let k = from; k < exam; k = addDays(k, 1)) if (wd.includes(dparse(k).getDay())) n++; return n; };
const docById = id => S.list.find(d => d.id === id);
// Plan-Aufgabe → Werkzeug des Skripts
const KIND = {
  lesson: { ico: 'board', go: t => 'pfad/' + t.chapter }, explain: { ico: 'bulb', go: t => 'pfad/' + t.chapter },
  quiz: { ico: 'quiz', go: t => 'quiz/k' + t.chapter }, cards: { ico: 'cards', go: () => 'karten' },
  mock: { ico: 'exam', go: () => 'quiz/exam' }, mistakes: { ico: 'refresh', go: () => 'quiz/fehler' }, sheet: { ico: 'brain', go: () => 'zettel' },
};

// Klausurtermin des Fachs setzen (wie im Fach-Fenster: alter Haupttermin raus, neuer rein)
function setExam(f, iso) {
  const old = f.klausur ? { art: f.klausurArt || 'klausur', datum: f.klausur } : null;
  f.termine = M.termineOf(f).filter(t => !(old && t.datum === old.datum && t.art === old.art)).map(t => (t.id === 'k' ? Object.assign({}, t, { id: uid() }) : t));
  f.klausur = ''; f.klausurArt = '';
  if (iso) M.addTerminTo(f, { art: old ? old.art : 'klausur', datum: iso }); else M.syncKlausur(f);
}

// Lernplan fürs ganze Fach: jedes Skript bekommt seinen Teil der Tageszeit (nach offenen Kapiteln), alle auf dasselbe Datum
function planDocs(f, ds, opts) {
  const w = ds.map(d => Math.max(1, (d.path?.chapters || []).filter(c => !c.done).length));
  const tot = w.reduce((a, b) => a + b, 0);
  ds.forEach((d, i) => {
    const m = Math.max(15, Math.round(opts.minutes * w[i] / tot / 5) * 5);
    const old = d.plan && d.plan.fach === f.id ? d.plan : null;
    d.plan = buildPlan(d, { exam: opts.exam, weekdays: opts.weekdays, minutes: m, goal: null }, old);
    d.plan.fach = f.id;
    save(d);
  });
  f.plan = { exam: opts.exam, weekdays: [...opts.weekdays], minutes: opts.minutes, docs: ds.map(d => d.id), created: f.plan?.created || Date.now(), updated: Date.now() };
}

export function render(root, { id } = {}) {
  const wrap = h('div', { class: 'view-in fsx' });
  root.appendChild(wrap);
  let editPlan = false, showWeek = false;
  const draw = () => {
    if (!wrap.isConnected) return;
    const f = M.getMe().faecher.find(x => x.id === id);
    if (!f) { location.replace('#/app/faecher'); return; }
    document.title = f.name + ' · BWL Max';
    const c = PAL[f.farbe] || PAL.orange;
    wrap.style.setProperty('--c1', c[0]); wrap.style.setProperty('--c2', c[1]);
    const ds = (f.docs || []).map(docById).filter(Boolean);
    const today = dkey();
    const iso = f.klausur && f.klausur >= today ? f.klausur : null;
    const days = iso ? between(today, iso) : null;
    const rf = reife(ds, iso ? new Date(iso + 'T08:00').getTime() : 0);
    wrap.replaceChildren(hero(f, ds, rf, iso, days), planCard(f, ds, iso), tools(f, ds, rf), scripts(f, ds));
  };

  // ---------- Kopf: Name, Countdown, Prüfungsreife ----------
  function hero(f, ds, rf, iso, days) {
    const dateIn = h('input', { type: 'date', class: 'field fsx-date', value: iso || '', min: dkey(), 'aria-label': L('Klausurtermin', 'Exam date') });
    dateIn.addEventListener('change', () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIn.value)) return;
      setExam(f, dateIn.value);
      // Plan läuft schon: auf das neue Datum umrechnen (Erledigtes bleibt)
      if (f.plan) { const ds2 = (f.plan.docs || []).map(docById).filter(d => d && d.path); if (ds2.length) planDocs(f, ds2, Object.assign({}, f.plan, { exam: dateIn.value })); }
      M.saveFach(f); toast(L('Termin gespeichert.', 'Date saved.'));
    });
    const art = M.artName(f.klausurArt || 'klausur');
    const count = iso
      ? h('div', { class: 'fsx-cd' }, h('b', {}, String(days)), h('span', {}, h('small', {}, days === 1 ? L('Tag bis zur', 'day until the') : L('Tage bis zur', 'days until the')), h('em', {}, art + ' · ' + fmt(iso, { weekday: 'short', day: 'numeric', month: 'short' }))))
      : h('div', { class: 'fsx-cd none' }, h('span', { class: 'fsx-cdi', html: ico('calendar') }), h('span', {}, h('em', {}, L('Wann ist die Klausur?', 'When is the exam?')), h('small', {}, L('Datum eintragen – dann plant Max rückwärts.', 'Add the date – Max plans backwards from it.'))));
    const ring = h('div', { class: 'fsx-ring', style: { '--p': (rf.hasData ? rf.score : 0) + '' }, title: L('Prüfungsreife', 'Exam readiness') },
      h('div', {}, h('b', {}, rf.hasData ? rf.score + ' %' : '–'), h('small', {}, L('Prüfungsreife', 'Readiness'))));
    return h('section', { class: 'fsx-hero' },
      h('div', { class: 'fsx-top' },
        h('a', { class: 'fsx-back', href: '#/app/faecher' }, h('span', { html: ico('left') }), L('Alle Fächer', 'All subjects')),
        h('button', { class: 'fsx-edit', type: 'button', onclick: () => editFach(f) }, h('span', { html: ico('tune') }), L('Fach bearbeiten', 'Edit subject'))),
      h('div', { class: 'fsx-main' },
        f.icon ? h('span', { class: 'fsx-badge', html: ico(f.icon) }) : h('span', { class: 'fsx-badge' }, (f.kurz || f.name).slice(0, 3).toUpperCase()),
        h('div', { class: 'fsx-tt' }, h('h1', {}, f.name),
          h('p', {}, [ds.length ? L(`${ds.length} ${ds.length === 1 ? 'Skript' : 'Skripte'}`, `${ds.length} ${ds.length === 1 ? 'set of slides' : 'sets of slides'}`) : L('Noch keine Skripte', 'No slides yet'), f.ects ? f.ects + ' ECTS' : null, rf.themen ? L(`${rf.fest} von ${rf.themen} Themen sitzen`, `${rf.fest} of ${rf.themen} topics secure`) : null].filter(Boolean).join(' · '))),
        ring),
      h('div', { class: 'fsx-exam' }, count, h('label', { class: 'fsx-dl' }, h('span', {}, iso ? L('ändern', 'change') : L('Datum', 'Date')), dateIn)));
  }

  // ---------- Lernplan fürs Fach ----------
  function planCard(f, ds, iso) {
    const head = (t, s, extra) => h('div', { class: 'fsx-h' }, h('div', {}, h('h2', {}, t), s ? h('p', {}, s) : null), extra || null);
    if (!ds.length) return h('section', { class: 'fsx-card fsx-plan' }, head(L('Dein Lernplan', 'Your study plan'), L('Leg zuerst deine Unterlagen ab – Skripte, Folien, Fotos oder Screenshots. Daraus baut Max den Plan.', 'Add your material first – slides, PDFs, photos or screenshots. Max builds the plan from it.')),
      h('button', { class: 'btn primary lg fsx-cta', type: 'button', onclick: () => editFach(f) }, h('span', { html: ico('upload') }), L('Skripte hinzufügen', 'Add slides')));
    const planned = f.plan ? ds.filter(d => d.plan && d.plan.fach === f.id) : [];
    if (!f.plan || !planned.length || editPlan) return planForm(f, ds, iso, head);
    const today = dkey();
    if (today >= f.plan.exam) return h('section', { class: 'fsx-card fsx-plan' }, head(L('Klausur geschafft?', 'Exam done?'), L('Trag deine Note ein oder leg einen neuen Termin fest.', 'Add your grade or set a new date.')),
      h('div', { class: 'fsx-row' }, h('button', { class: 'btn', type: 'button', onclick: () => { editPlan = true; draw(); } }, L('Neuen Plan erstellen', 'Create a new plan'))));
    // Tagesaufgaben aller Skripte zusammenführen
    const byDate = {}; let total = 0, done = 0, expected = 0;
    for (const d of planned) {
      const p = planSummary(d); if (!p) continue;
      total += p.total; done += p.done; expected += p.expected;
      for (const day of d.plan.days) for (const t of day.tasks) { if (t.missed) continue; (byDate[day.date] ||= []).push({ t, d }); }
    }
    const behind = expected - done;
    const todayL = (byDate[today] || []).sort((a, b) => !!a.t.done - !!b.t.done);
    const openMin = todayL.filter(x => !x.t.done).reduce((a, x) => a + x.t.minutes, 0);
    const next = Object.keys(byDate).filter(k => k > today).sort().slice(0, showWeek ? 14 : 4);
    const status = behind >= 2 ? h('span', { class: 'fsx-st warn' }, L(`${behind} Aufgaben im Rückstand – Max hat sie auf die nächsten Tage verteilt`, `${behind} tasks behind – Max moved them to the next days`))
      : h('span', { class: 'fsx-st ok' }, L('Du liegst im Plan', 'You’re on track'));
    const missing = ds.filter(d => !planned.includes(d));
    return h('section', { class: 'fsx-card fsx-plan' },
      head(L('Heute für ' + f.name, 'Today for ' + f.name), todayL.length ? (openMin ? L(`Noch ${minFmt(openMin)} – dann ist der Tag erledigt.`, `${minFmt(openMin)} left – then today is done.`) : L('Alles erledigt für heute. Stark.', 'All done for today. Nice.')) : L('Heute ist kein Lerntag. Morgen geht’s weiter.', 'No study day today. Back at it tomorrow.'),
        h('button', { class: 'fsx-link', type: 'button', onclick: () => { editPlan = true; draw(); } }, h('span', { html: ico('tune') }), L('Plan anpassen', 'Adjust plan'))),
      h('div', { class: 'fsx-prog' }, h('div', { class: 'fsx-bar' }, h('i', { style: { width: (total ? Math.round(100 * done / total) : 0) + '%' } }), h('u', { style: { left: (total ? Math.min(100, Math.round(100 * expected / total)) : 0) + '%' }, title: L('Soll heute', 'Target today') })),
        h('div', { class: 'fsx-pl' }, h('span', {}, L(`${done} von ${total} Aufgaben`, `${done} of ${total} tasks`)), status)),
      todayL.length ? h('div', { class: 'fsx-tasks' }, todayL.map(x => taskRow(x, planned.length > 1))) : null,
      missing.length ? h('div', { class: 'fsx-note' }, h('span', {}, L(`${missing.length === 1 ? '„' + missing[0].name + '“ ist' : missing.length + ' Skripte sind'} noch nicht im Plan.`, `${missing.length === 1 ? '“' + missing[0].name + '” isn’t' : missing.length + ' sets of slides aren’t'} in the plan yet.`)),
        h('button', { class: 'btn sm', type: 'button', onclick: () => { editPlan = true; draw(); } }, L('Plan aktualisieren', 'Update plan'))) : null,
      next.length ? h('div', { class: 'fsx-next' }, h('div', { class: 'fsx-sub' }, L('Die nächsten Tage', 'Coming up')),
        next.map(k => { const l = byDate[k], m = l.reduce((a, x) => a + x.t.minutes, 0);
          return h('div', { class: 'fsx-day' }, h('b', {}, fmt(k, { weekday: 'short', day: 'numeric', month: 'short' })), h('span', {}, l.map(x => x.t.label).slice(0, 3).join(' · ') + (l.length > 3 ? ' …' : '')), h('em', {}, minFmt(m))); }),
        Object.keys(byDate).filter(k => k > today).length > 4 ? h('button', { class: 'fsx-link', type: 'button', onclick: () => { showWeek = !showWeek; draw(); } }, showWeek ? L('Weniger zeigen', 'Show less') : L('Mehr Tage zeigen', 'Show more days')) : null) : null);
  }

  function taskRow({ t, d }, multi) {
    const k = KIND[t.kind] || KIND.lesson;
    const tog = h('button', { class: 'fsx-chk' + (t.done ? ' on' : ''), type: 'button', 'aria-label': t.done ? L('Als offen markieren', 'Mark as open') : L('Als erledigt markieren', 'Mark as done'), 'aria-pressed': t.done ? 'true' : 'false', html: ico('check'),
      onclick: () => { t.done = !t.done; t.auto = false; t.doneAt = t.done ? dkey() : null; save(d); draw(); } });
    return h('div', { class: 'fsx-task' + (t.done ? ' done' : '') }, tog,
      h('a', { class: 'fsx-tl', href: `#/app/${d.id}/${k.go(t)}` }, h('span', { class: 'fsx-ti', html: ico(k.ico) }),
        h('span', { class: 'fsx-tx' }, h('b', {}, t.label || ''), multi || t.rolled ? h('small', {}, [multi ? d.name : null, t.rolled ? L('nachgeholt', 'carried over') : null].filter(Boolean).join(' · ')) : null),
        h('em', {}, minFmt(t.minutes)), h('span', { class: 'fsx-go', html: ico('right') })));
  }

  function planForm(f, ds, iso, head) {
    const today = dkey(), prefs = ls.get('tutor.planPrefs', {}) || {};
    const st = { exam: f.plan?.exam > today ? f.plan.exam : iso || addDays(today, 21), weekdays: new Set(f.plan?.weekdays || prefs.weekdays || [1, 2, 3, 4, 5]), minutes: f.plan?.minutes || prefs.minutes || 60 };
    const info = h('div', { class: 'fsx-feas' });
    const upd = () => {
      const n = studyDays(today, st.exam, [...st.weekdays]), need = ds.filter(d => !d.path).length;
      info.replaceChildren(h('b', {}, st.exam > today ? L(`${n} Lerntag${n === 1 ? '' : 'e'} · ${minFmt(n * st.minutes)} Lernzeit bis zur Klausur`, `${n} study day${n === 1 ? '' : 's'} · ${minFmt(n * st.minutes)} until the exam`) : L('Wähl ein Datum nach heute.', 'Pick a date after today.')),
        h('span', {}, need ? L(`Max teilt vorher ${need === 1 ? 'ein Skript' : need + ' Skripte'} in Kapitel (je 2 Einheiten). Der Plan selbst ist kostenlos.`, `Max first splits ${need === 1 ? 'one set of slides' : need + ' sets of slides'} into chapters (2 units each). The plan itself is free.`) : L('Lektionen, Quizze, Karteikarten, Probeklausur – Tag für Tag. Kostenlos.', 'Lessons, quizzes, flashcards, mock exam – day by day. Free.')));
      go.disabled = !(st.exam > today);
    };
    const date = h('input', { type: 'date', class: 'field', value: st.exam, min: addDays(today, 1), 'aria-label': L('Klausurtermin', 'Exam date') });
    date.addEventListener('change', () => { if (/^\d{4}-\d{2}-\d{2}$/.test(date.value)) { st.exam = date.value; upd(); } });
    const wd = h('div', { class: 'fsx-chips' }, WEEK.map(i => h('button', { type: 'button', class: 'chip' + (st.weekdays.has(i) ? ' on' : ''), onclick: e => { if (st.weekdays.has(i)) { if (st.weekdays.size > 1) st.weekdays.delete(i); } else st.weekdays.add(i); e.currentTarget.classList.toggle('on', st.weekdays.has(i)); upd(); } }, wdName(i))));
    const mins = h('div', { class: 'fsx-chips' }, [30, 45, 60, 90, 120].map(m => h('button', { type: 'button', class: 'chip' + (m === st.minutes ? ' on' : ''), onclick: e => { st.minutes = m; mins.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === e.currentTarget)); upd(); } }, minFmt(m))));
    const go = h('button', { class: 'btn primary lg fsx-cta', type: 'button', onclick: () => create() }, h('span', { html: ico('calendar') }), f.plan ? L('Plan aktualisieren', 'Update plan') : L('Lernplan erstellen', 'Create study plan'));
    const box = h('section', { class: 'fsx-card fsx-plan' },
      head(f.plan ? L('Plan anpassen', 'Adjust plan') : L('Dein Lernplan für ' + f.name, 'Your study plan for ' + f.name), L('Drei Angaben – Max verteilt alle Skripte des Fachs auf deine Tage bis zur Klausur.', 'Three answers – Max spreads all slides of this subject across your days until the exam.'),
        f.plan ? h('button', { class: 'fsx-link', type: 'button', onclick: () => { editPlan = false; draw(); } }, L('Abbrechen', 'Cancel')) : null),
      h('div', { class: 'fsx-form' },
        h('label', { class: 'fsx-f' }, h('span', {}, L('Klausur am', 'Exam on')), date),
        h('div', { class: 'fsx-f' }, h('span', {}, L('Lerntage', 'Study days')), wd),
        h('div', { class: 'fsx-f' }, h('span', {}, L('Zeit pro Tag', 'Time per day')), mins)),
      h('div', { class: 'fsx-go2' }, info, go));
    async function create() {
      const opts = { exam: st.exam, weekdays: [...st.weekdays].sort(), minutes: st.minutes };
      ls.set('tutor.planPrefs', { weekdays: opts.weekdays, minutes: opts.minutes });
      const need = ds.filter(d => !d.path);
      if (need.length) {
        const ld = loading(box, need.length === 1 ? L('Ich teile dein Skript in Kapitel …', 'Splitting your slides into chapters …') : L(`Ich teile ${need.length} Skripte in Kapitel …`, `Splitting ${need.length} sets of slides into chapters …`), L(['Lese die Skripte', 'Finde die Kapitel', 'Gewichte für die Klausur', 'Danach plane ich deine Tage'], ['Reading the slides', 'Finding the chapters', 'Weighting for the exam', 'Then I plan your days']), 'path');
        try { for (const d of need) await ld.race(generatePath(d)); ld.stop(); }
        catch (e) { ld.stop(false); draw(); apiError(e, () => create()); return; }
      }
      const ready = ds.filter(d => d.path);
      if (!ready.length) { toast(L('Ich konnte keine Kapitel erkennen.', 'I couldn’t find any chapters.')); draw(); return; }
      if (opts.exam !== f.klausur) setExam(f, opts.exam);
      planDocs(f, ready, opts);
      M.saveFach(f);
      try { window.BM && window.BM.track('Erstellt', 'Fach-Lernplan'); } catch (e) {}
      editPlan = false; draw();
      toast(L('Dein Lernplan steht. Heute geht’s los.', 'Your plan is ready. Let’s start today.'), 3600);
    }
    upd();
    return box;
  }

  // ---------- Lernen: Werkzeuge über alle Skripte des Fachs ----------
  function tools(f, ds, rf) {
    if (!ds.length) return h('span');
    const pick = async (title, path, cand = ds) => {
      if (cand.length === 1) { location.hash = `#/app/${cand[0].id}/${path}`; return; }
      const v = await modal({ title, text: L('Für welches Skript?', 'For which slides?'), actions: [...cand.map(d => ({ label: d.name.length > 40 ? d.name.slice(0, 39) + '…' : d.name, value: d.id, primary: false })), { label: L('Abbrechen', 'Cancel'), value: null }] });
      if (v) location.hash = `#/app/${v}/${path}`;
    };
    const due = ds.map(d => [d, dueCards(d).length]).sort((a, b) => b[1] - a[1]);
    const dueN = due.reduce((a, x) => a + x[1], 0), cards = ds.reduce((a, d) => a + d.decks.reduce((b, k) => b + k.cards.length, 0), 0);
    const mis = ds.filter(d => d.mistakes?.length), misN = mis.reduce((a, d) => a + d.mistakes.length, 0);
    const tile = (ic, tone, t, s, on) => h('button', { class: 'fsx-tool', type: 'button', 'data-tone': tone, onclick: on }, h('span', { class: 'fsx-toi', html: ico(ic) }), h('b', {}, t), h('small', {}, s));
    const askMax = () => { ls.set('tutor.room.focus', ds.map(d => d.id)); ls.set('tutor.room.focusAt', Date.now()); ls.set('tutor.attach.room', null); location.hash = '#/app/tutor'; };
    return h('section', { class: 'fsx-card' },
      h('div', { class: 'fsx-h' }, h('div', {}, h('h2', {}, L('Lernen', 'Study')), h('p', {}, L('Alles aus deinen Skripten zu ' + f.name + '.', 'Everything from your slides for ' + f.name + '.')))),
      h('div', { class: 'fsx-tools' },
        tile('cards', 'blue', L('Karteikarten', 'Flashcards'), dueN ? L(`${dueN} fällig`, `${dueN} due`) : cards ? L(`${cards} Karten`, `${cards} cards`) : L('Erstellen lassen', 'Have them made'), () => dueN ? (location.hash = `#/app/${due[0][0].id}/karten`) : pick(L('Karteikarten', 'Flashcards'), 'karten')),
        tile('quiz', 'purple', 'Quiz', L('Wissen prüfen', 'Test yourself'), () => pick('Quiz', 'quiz')),
        tile('exam', 'pink', L('Probeklausur', 'Mock exam'), L('Unter Zeitdruck', 'Timed'), () => pick(L('Probeklausur', 'Mock exam'), 'quiz/exam')),
        tile('brain', 'orange', L('Lernzettel', 'Study sheet'), L('Alles auf einer Seite', 'All on one page'), () => pick(L('Lernzettel', 'Study sheet'), 'zettel')),
        tile('pod', 'cyan', 'Podcast', L('Zum Hören unterwegs', 'Listen on the go'), () => pick('Podcast', 'podcast')),
        tile('chat', 'yellow', L('Max fragen', 'Ask Max'), ds.length > 1 ? L(`Kennt alle ${ds.length} Skripte`, `Knows all ${ds.length} sets`) : L('Kennt dein Skript', 'Knows your slides'), askMax),
        misN ? tile('refresh', 'red', L('Fehler wiederholen', 'Review mistakes'), L(`${misN} offen`, `${misN} open`), () => pick(L('Fehler wiederholen', 'Review mistakes'), 'quiz/fehler', mis)) : null));
  }

  // ---------- Skripte ----------
  function scripts(f, ds) {
    return h('section', { class: 'fsx-card' },
      h('div', { class: 'fsx-h' }, h('div', {}, h('h2', {}, L('Skripte', 'Slides')), h('p', {}, L('PDF, PowerPoint, Word, Fotos oder Screenshots.', 'PDF, PowerPoint, Word, photos or screenshots.'))),
        h('button', { class: 'btn sm', type: 'button', onclick: () => editFach(f) }, h('span', { html: ico('plus') }), L('Hinzufügen', 'Add'))),
      ds.length ? h('div', { class: 'fsx-docs' }, ds.map(d => {
        const ch = d.path?.chapters || [], dn = ch.filter(c => c.done).length, r = reife([d]);
        return h('a', { class: 'fsx-doc', href: `#/app/${d.id}/hub` }, h('span', { class: 'fsx-di', html: ico(d.src === 'bild' ? 'camera' : 'file') }),
          h('span', { class: 'fsx-dt' }, h('b', {}, d.name), h('small', {}, [L(`${d.pages.length} ${d.pages.length === 1 ? 'Seite' : 'Seiten'}`, `${d.pages.length} page${d.pages.length === 1 ? '' : 's'}`), ch.length ? L(`${dn}/${ch.length} Kapitel`, `${dn}/${ch.length} chapters`) : null, r.cards ? L(`${r.cards} Karten`, `${r.cards} cards`) : null].filter(Boolean).join(' · '))),
          ch.length ? h('span', { class: 'fsx-mini' }, h('i', { style: { width: Math.round(100 * dn / ch.length) + '%' } })) : null,
          h('span', { class: 'fsx-go', html: ico('right') }));
      })) : h('button', { class: 'fsx-drop', type: 'button', onclick: () => editFach(f) }, h('span', { html: ico('upload') }), h('b', {}, L('Erstes Skript hinzufügen', 'Add your first slides')), h('small', {}, L('Datei wählen oder Fotos & Screenshots', 'Choose a file or photos & screenshots'))));
  }

  const off = M.onMe(() => draw());
  const onVis = () => { if (document.visibilityState === 'visible') draw(); };
  document.addEventListener('visibilitychange', onVis);
  draw();
  return () => { off(); document.removeEventListener('visibilitychange', onVis); };
}
