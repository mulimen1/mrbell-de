// Meine Klausuren: alle Prüfungen des Semesters an einem Ort.
// Ganz oben die nächste Klausur groß (Countdown, Prüfungsreife, was jetzt dran ist), darunter der Zeitstrahl
// der Klausurphase und alle weiteren Klausuren als Karten. „Klausur anlegen“ ist ein geführtes Fenster:
// Fach, Art, Datum, Wunschnote, Unterlagen – danach geht's direkt auf die Fach-Seite zum Lernplan.
// Ohne Konto: Beispiel-Klausuren zum Ansehen, Anlegen öffnet das Konto-Fenster.
import { h, ico, toast, modal, uid } from '../util.js';
import { L, LOCALE } from '../i18n.js';
import { S } from '../state.js';
import * as M from '../me.js';
import { reife } from '../reife.js';
import { planSummary, dkey } from './plan.js';
import { PAL } from './me.js';
import { getAccount, onAccount } from '../api.js';
import { klSwitch } from '../msswitch.js';

const DAY = 864e5;
const dparse = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const between = (a, b) => Math.round((dparse(b) - dparse(a)) / DAY);
const addDays = (k, n) => { const d = dparse(k); d.setDate(d.getDate() + n); return dkey(d); };
const fmt = (k, o) => dparse(k).toLocaleDateString(LOCALE, o);
const docById = id => S.list.find(d => d.id === id);
const EXAM = ['klausur', 'test'];
const NOTEN = ['1,0', '1,3', '1,7', '2,0', '2,3', '2,7', '3,0'];
const VORSCHLAG = ['Kostenrechnung', 'Buchführung', 'Investition & Finanzierung', 'Mikroökonomik', 'Makroökonomik', 'Statistik', 'Wirtschaftsmathematik', 'Marketing', 'Bilanzierung', 'Controlling'];
const AUTO = ['blau', 'lila', 'orange', 'petrol', 'pink', 'indigo', 'gruen', 'rot'];

// Semester-Name: Oktober–März Wintersemester, April–September Sommersemester
export function semester(d = new Date()) {
  const y = d.getFullYear(), m = d.getMonth() + 1;
  if (m >= 4 && m <= 9) return L(`Sommersemester ${y}`, `Summer term ${y}`);
  const a = m >= 10 ? y : y - 1;
  return L(`Wintersemester ${a}/${String(a + 1).slice(2)}`, `Winter term ${a}/${String(a + 1).slice(2)}`);
}

// Nächste Klausur/Test je Fach (nur kommende). Für den Countdown oben in der Leiste.
export function nextExam() {
  const today = dkey();
  let best = null;
  for (const f of M.getMe().faecher || []) for (const t of M.termineOf(f)) if (EXAM.includes(t.art || 'klausur') && t.datum >= today && (!best || t.datum < best.t.datum)) best = { f, t };
  return best ? Object.assign(best, { days: between(today, best.t.datum) }) : null;
}

// Alles, was eine Klausur-Karte braucht
function examOf(f, t, today) {
  const ds = (f.docs || []).map(docById).filter(Boolean);
  const days = between(today, t.datum);
  const rf = reife(ds, new Date(t.datum + 'T08:00').getTime());
  const planned = f.plan ? ds.filter(d => d.plan && d.plan.fach === f.id) : [];
  let done = 0, total = 0, expected = 0;
  for (const d of planned) { const p = planSummary(d); if (p) { done += p.done; total += p.total; expected += p.expected; } }
  const behind = Math.max(0, expected - done);
  const st = !ds.length ? { k: 'stoff', t: L('Unterlagen fehlen', 'Material missing'), go: L('Skripte hinzufügen', 'Add slides') }
    : !planned.length || !total ? { k: 'plan', t: L('Noch kein Lernplan', 'No study plan yet'), go: L('Lernplan erstellen', 'Create study plan') }
    : behind ? { k: 'hinten', t: L(`${behind} ${behind === 1 ? 'Einheit' : 'Einheiten'} im Rückstand`, `${behind} ${behind === 1 ? 'unit' : 'units'} behind`), go: L('Aufholen', 'Catch up') }
    : done >= total ? { k: 'fertig', t: L('Plan erledigt', 'Plan done'), go: L('Wiederholen', 'Review') }
    : { k: 'kurs', t: L('Auf Kurs', 'On track'), go: L('Jetzt lernen', 'Study now') };
  return { f, t, ds, days, rf, done, total, st, href: '#/app/faecher/' + f.id };
}

// Beispiel-Klausuren für Gäste (nur Anzeige)
function demo(today) {
  const mk = (name, farbe, icon, d, score, done, total, k) => ({
    demo: true, f: { id: 'demo-' + name, name, farbe, icon, zielnote: k === 'kurs' ? '1,7' : '' }, t: { art: 'klausur', datum: addDays(today, d), zeit: '10:00' }, ds: [1, 2], days: d,
    rf: { hasData: true, score, themen: 12, fest: Math.round(12 * score / 100) }, done, total, href: '',
    st: k === 'kurs' ? { k, t: L('Auf Kurs', 'On track'), go: L('Jetzt lernen', 'Study now') } : { k, t: L('Noch kein Lernplan', 'No study plan yet'), go: L('Lernplan erstellen', 'Create study plan') } });
  return [mk(L('Kostenrechnung', 'Cost accounting'), 'orange', 'calc', 12, 64, 11, 20, 'kurs'), mk(L('Statistik', 'Statistics'), 'lila', 'chart', 26, 18, 0, 0, 'plan'), mk(L('Marketing', 'Marketing'), 'petrol', 'spark', 41, 5, 0, 0, 'plan')];
}

const tone = d => (d <= 7 ? 'hot' : d <= 21 ? 'warm' : 'cool');
const cdLabel = d => (d === 0 ? L('Heute', 'Today') : d === 1 ? L('Morgen', 'Tomorrow') : L(`${d} Tage`, `${d} days`));
const colors = f => PAL[f.farbe] || PAL.blau;
const badge = (f, cls = 'kl-badge') => h('span', { class: cls, style: { '--c1': colors(f)[0], '--c2': colors(f)[1] }, html: f.icon ? ico(f.icon) : '' }, f.icon ? null : (f.kurz || f.name).slice(0, 3).toUpperCase());
const when = x => fmt(x.t.datum, { weekday: 'long', day: 'numeric', month: 'long' }) + (x.t.zeit ? L(` · ${x.t.zeit} Uhr`, ` · ${x.t.zeit}`) : '');

export function render(root) {
  const wrap = h('div', { class: 'view-in kl' });
  root.appendChild(wrap);
  { const sw = klSwitch('klausuren'); if (sw) root.insertBefore(sw, wrap); }
  const draw = () => {
    if (!wrap.isConnected) return;
    const today = dkey(), acc = getAccount();
    const me = M.getMe(), fs = me.faecher || [];
    const up = [], past = [], noDate = [];
    for (const f of fs) {
      const ts = M.termineOf(f).filter(t => EXAM.includes(t.art || 'klausur'));
      const next = ts.find(t => t.datum >= today);
      if (next) up.push(examOf(f, next, today));
      else if (ts.length && between(ts[ts.length - 1].datum, today) <= 60) past.push({ f, t: ts[ts.length - 1] });
      else noDate.push(f);
    }
    up.sort((a, b) => a.days - b.days);
    const isDemo = !up.length && !fs.length && !acc;
    const list = isDemo ? demo(today) : up;
    wrap.classList.toggle('kl-demo', isDemo);
    wrap.replaceChildren(
      head(list, isDemo),
      list.length ? hero(list[0], isDemo) : empty(),
      list.length > 1 || (list.length && list[0].days > 0) ? line(list, today) : null,
      list.length > 1 ? h('section', { class: 'kl-sec' }, h('h2', { class: 'kl-h2' }, L('Danach', 'After that')), h('div', { class: 'kl-grid' }, ...list.slice(1).map(x => card(x, isDemo)), addCard())) : list.length ? h('div', { class: 'kl-grid kl-grid1' }, addCard()) : null,
      noDate.length ? h('section', { class: 'kl-sec' }, h('h2', { class: 'kl-h2' }, L('Ohne Termin', 'No date yet')), h('div', { class: 'kl-chips' }, ...noDate.map(f => h('button', { class: 'kl-chip', type: 'button', onclick: () => anlegen({ fach: f }) }, badge(f, 'kl-cbadge'), h('span', {}, f.name), h('em', {}, L('Datum eintragen', 'Add date')))))) : null,
      past.length ? h('section', { class: 'kl-sec kl-past' }, h('h2', { class: 'kl-h2' }, L('Geschafft', 'Done')), h('div', { class: 'kl-chips' }, ...past.map(p => h('a', { class: 'kl-chip done', href: '#/app/faecher/' + p.f.id }, h('span', { class: 'kl-ck', html: ico('check') }), h('span', {}, p.f.name), h('em', {}, fmt(p.t.datum, { day: 'numeric', month: 'short' })))))) : null);
  };
  const off1 = M.onMe(() => draw()), off2 = onAccount(() => draw());
  draw();
  return () => { off1(); off2(); };
}

function head(list, isDemo) {
  const n = list.length;
  const sub = isDemo ? L('So sieht dein Semester aus, sobald deine Klausuren drin sind.', 'This is how your term looks once your exams are in.')
    : n ? L(`${n} ${n === 1 ? 'Klausur' : 'Klausuren'} · die nächste ${list[0].days === 0 ? 'heute' : list[0].days === 1 ? 'morgen' : 'in ' + list[0].days + ' Tagen'}`, `${n} ${n === 1 ? 'exam' : 'exams'} · next one ${list[0].days === 0 ? 'today' : list[0].days === 1 ? 'tomorrow' : 'in ' + list[0].days + ' days'}`)
    : L('Leg deine Klausuren an – Max plant rückwärts bis zum Termin.', 'Add your exams – Max plans backwards to the date.');
  return h('header', { class: 'kl-head' },
    h('div', { class: 'kl-ht' }, h('div', { class: 'kl-eyebrow' }, semester()), h('h1', {}, L('Meine Klausuren', 'My exams')), h('p', {}, sub)),
    h('button', { class: 'kl-new', type: 'button', onclick: () => anlegen() }, h('span', { html: ico('plus') }), L('Klausur anlegen', 'Add exam')));
}

function ring(rf, big) {
  const p = rf && rf.hasData ? rf.score : 0;
  return h('div', { class: 'kl-ring' + (big ? ' big' : ''), style: { '--p': String(p) }, title: L('Prüfungsreife', 'Exam readiness') },
    h('div', {}, h('b', {}, rf && rf.hasData ? p + ' %' : '–'), h('small', {}, L('Prüfungsreife', 'Readiness'))));
}

function go(x, isDemo) {
  if (isDemo) return anlegen();
  location.hash = x.href;
}

function hero(x, isDemo) {
  const sub = [x.ds.length ? L(`${x.ds.length} ${x.ds.length === 1 ? 'Skript' : 'Skripte'}`, `${x.ds.length} ${x.ds.length === 1 ? 'set of slides' : 'sets of slides'}`) : null,
    x.rf.themen ? L(`${x.rf.fest} von ${x.rf.themen} Themen sitzen`, `${x.rf.fest} of ${x.rf.themen} topics stick`) : null,
    x.f.zielnote ? L(`Ziel ${x.f.zielnote}`, `Goal ${x.f.zielnote}`) : null].filter(Boolean);
  return h('section', { class: 'kl-hero', 'data-tone': tone(x.days), style: { '--c1': colors(x.f)[0], '--c2': colors(x.f)[1] }, onclick: e => { if (!e.target.closest('button, a')) go(x, isDemo); } },
    isDemo ? h('span', { class: 'kl-demob' }, L('Beispiel', 'Example')) : null,
    h('div', { class: 'kl-hcd' },
      h('div', { class: 'kl-num' }, h('b', {}, String(x.days)), h('span', {}, x.days === 1 ? L('Tag', 'day') : L('Tage', 'days'))),
      h('div', { class: 'kl-hcl' }, h('small', {}, x.days === 0 ? L('Heute ist es so weit', 'It’s today') : x.t.art === 'test' ? L('bis zum Test', 'until the test') : L('bis zur Klausur', 'until the exam')), h('h2', {}, x.f.name), h('p', {}, when(x)))),
    h('div', { class: 'kl-hmid' },
      h('span', { class: 'kl-pill', 'data-k': x.st.k }, h('i'), x.st.t),
      x.total ? h('div', { class: 'kl-prog' }, h('div', { class: 'kl-bar' }, h('i', { style: { width: Math.round(100 * x.done / x.total) + '%' } })), h('small', {}, L(`${x.done} von ${x.total} Einheiten`, `${x.done} of ${x.total} units`))) : null,
      sub.length ? h('p', { class: 'kl-meta' }, sub.join(' · ')) : null,
      h('button', { class: 'kl-go', type: 'button', onclick: () => go(x, isDemo) }, x.st.go, h('span', { html: ico('right') }))),
    ring(x.rf, true));
}

// Zeitstrahl: heute bis zur letzten Klausur, jede Klausur ein Punkt
function line(list, today) {
  const last = Math.max(14, list[list.length - 1].days);
  const span = last + Math.max(2, Math.round(last * 0.06));
  const pos = d => (100 * d / span).toFixed(2) + '%';
  // Wochen-Striche
  const ticks = [];
  for (let d = 7; d < span; d += 7) ticks.push(h('i', { class: 'kl-tick', style: { left: pos(d) } }));
  return h('section', { class: 'kl-line', 'aria-label': L('Zeitstrahl Klausurphase', 'Exam timeline') },
    h('div', { class: 'kl-lhead' }, h('h2', { class: 'kl-h2' }, L('Deine Klausurphase', 'Your exam phase')), h('small', {}, L(`${last} Tage bis zur letzten Klausur`, `${last} days to the last exam`))),
    h('div', { class: 'kl-track' },
      h('div', { class: 'kl-rail' }, ...ticks, h('i', { class: 'kl-fill', style: { width: pos(list[0].days) } })),
      h('span', { class: 'kl-today', style: { left: '0%' } }, h('b', {}, L('Heute', 'Today'))),
      ...list.map((x, i) => h('span', { class: 'kl-dot' + (i % 2 ? ' low' : ''), 'data-tone': tone(x.days), style: { left: pos(x.days), '--c1': colors(x.f)[0], '--c2': colors(x.f)[1] }, title: x.f.name },
        h('i'), h('b', {}, x.f.kurz || (x.f.name.length > 16 ? x.f.name.slice(0, 15) + '…' : x.f.name)), h('small', {}, fmt(x.t.datum, { day: 'numeric', month: 'short' }))))));
}

function card(x, isDemo) {
  return h('article', { class: 'kl-card', 'data-tone': tone(x.days), style: { '--c1': colors(x.f)[0], '--c2': colors(x.f)[1] }, onclick: e => { if (!e.target.closest('button, a')) go(x, isDemo); } },
    h('div', { class: 'kl-ct' }, badge(x.f), h('span', { class: 'kl-cd' }, cdLabel(x.days))),
    h('h3', {}, x.f.name),
    h('p', { class: 'kl-when' }, M.artName(x.t.art) + ' · ' + fmt(x.t.datum, { weekday: 'short', day: 'numeric', month: 'short' }) + (x.t.zeit ? ' · ' + x.t.zeit : '') + (x.f.zielnote ? L(` · Ziel ${x.f.zielnote}`, ` · goal ${x.f.zielnote}`) : '')),
    h('div', { class: 'kl-rf' }, h('div', { class: 'kl-rft' }, h('span', {}, L('Prüfungsreife', 'Readiness')), h('b', {}, x.rf.hasData ? x.rf.score + ' %' : '–')), h('div', { class: 'kl-bar' }, h('i', { style: { width: (x.rf.hasData ? x.rf.score : 0) + '%' } }))),
    h('div', { class: 'kl-cf' }, h('span', { class: 'kl-pill', 'data-k': x.st.k }, h('i'), x.st.t), h('button', { class: 'kl-cgo', type: 'button', onclick: () => go(x, isDemo) }, x.st.go, h('span', { html: ico('right') }))));
}

function addCard() {
  return h('button', { class: 'kl-card kl-add', type: 'button', onclick: () => anlegen() }, h('span', { class: 'kl-addi', html: ico('plus') }), h('b', {}, L('Klausur anlegen', 'Add exam')), h('small', {}, L('Fach, Datum, Wunschnote – fertig', 'Subject, date, target grade – done')));
}

function empty() {
  return h('section', { class: 'kl-empty' },
    h('span', { class: 'kl-emi', html: ico('klausur') }),
    h('h2', {}, L('Wann ist deine erste Klausur?', 'When is your first exam?')),
    h('p', {}, L('Fach und Datum reichen. Max zählt runter, zeigt dir die Prüfungsreife und baut den Lernplan rückwärts bis zum Termin.', 'Subject and date are enough. Max counts down, shows your readiness and builds the plan backwards to the date.')),
    h('button', { class: 'kl-new big', type: 'button', onclick: () => anlegen() }, h('span', { html: ico('plus') }), L('Erste Klausur anlegen', 'Add your first exam')));
}

// ---------- Klausur anlegen ----------
export async function anlegen({ fach = null } = {}) {
  if (!getAccount()) {
    const { openAuth } = await import('../account.js');
    const ok = await openAuth({ title: L('Deine Klausuren anlegen – kostenlos', 'Add your exams – free'), registerTitle: L('Deine Klausuren anlegen – kostenlos', 'Add your exams – free'), sub: L('Countdown, Prüfungsreife und Lernplan bis zum Termin. Mit Google in zwei Klicks.', 'Countdown, readiness and a study plan to the date. Two clicks with Google.'), why: 'Klausuren', strong: true });
    if (!ok || !getAccount()) return;
  }
  const today = dkey();
  const fsAll = M.getMe().faecher || [];
  let art = 'klausur', note = (fach && fach.zielnote) || '';
  const name = h('input', { class: 'field kl-fname', value: fach ? fach.name : '', maxlength: 60, placeholder: L('z. B. Kostenrechnung', 'e.g. Cost accounting'), autocomplete: 'off' });
  const pick = n => { name.value = n; name.dispatchEvent(new Event('input')); date.focus(); };
  const own = fsAll.filter(f => !nextOf(f)).map(f => f.name);
  const sugg = h('div', { class: 'kl-sugg' }, ...[...own, ...VORSCHLAG.filter(v => !fsAll.some(f => f.name.toLowerCase() === v.toLowerCase()))].slice(0, 8).map(v => h('button', { type: 'button', class: 'kl-s', onclick: () => pick(v) }, v)));
  const artSeg = h('div', { class: 'kl-seg' }, ...[['klausur', L('Klausur', 'Exam')], ['test', L('Test', 'Test')]].map(([v, t]) => h('button', { type: 'button', class: v === art ? 'on' : '', onclick: e => { art = v; artSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === e.currentTarget)); } }, t)));
  const date = h('input', { class: 'field', type: 'date', min: today, value: fach ? '' : '' });
  const zeit = h('input', { class: 'field kl-zeit', type: 'time', step: 900, 'aria-label': L('Uhrzeit (optional)', 'Time (optional)') });
  const quick = h('div', { class: 'kl-sugg' }, ...[[7, L('in 1 Woche', 'in 1 week')], [14, L('in 2 Wochen', 'in 2 weeks')], [28, L('in 4 Wochen', 'in 4 weeks')], [56, L('in 8 Wochen', 'in 8 weeks')]].map(([n, t]) => h('button', { type: 'button', class: 'kl-s', onclick: () => { date.value = addDays(today, n); date.dispatchEvent(new Event('input')); } }, t)));
  const live = h('div', { class: 'kl-live' });
  const drawLive = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.value) || date.value < today) { live.replaceChildren(); return; }
    const d = between(today, date.value);
    let wd = 0; for (let k = today; k < date.value; k = addDays(k, 1)) { const g = dparse(k).getDay(); if (g !== 0 && g !== 6) wd++; }
    live.replaceChildren(h('b', {}, cdLabel(d)), h('span', {}, d === 0 ? L('Heute – dann zählt jede Minute.', 'Today – every minute counts.') : L(`bis zur Klausur · ${wd} Lerntage (Mo–Fr)`, `to the exam · ${wd} study days (Mon–Fri)`)));
  };
  date.addEventListener('input', drawLive); date.addEventListener('change', drawLive);
  const noteRow = h('div', { class: 'kl-sugg kl-noten' }, ...[...NOTEN, L('Bestehen', 'Pass')].map(n => h('button', { type: 'button', class: 'kl-s' + (n === note ? ' on' : ''), onclick: e => { note = note === n ? '' : n; noteRow.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === e.currentTarget && !!note)); } }, n)));
  const docs = S.list.filter(d => !d.sample);
  const chosen = new Set(fach ? fach.docs || [] : []);
  const docRow = docs.length ? h('div', { class: 'kl-docs' }, ...docs.slice(0, 24).map(d => { const b = h('button', { type: 'button', class: 'kl-doc' + (chosen.has(d.id) ? ' on' : ''), onclick: () => { chosen.has(d.id) ? chosen.delete(d.id) : chosen.add(d.id); b.classList.toggle('on', chosen.has(d.id)); } }, h('span', { html: ico('file') }), d.name.length > 34 ? d.name.slice(0, 33) + '…' : d.name); return b; })) : null;
  const step = (n, t, ...kids) => h('div', { class: 'kl-step' }, h('div', { class: 'kl-sn' }, String(n)), h('div', { class: 'kl-sb' }, h('label', { class: 'kl-sl' }, t), ...kids));
  const body = h('div', { class: 'kl-form' },
    step(1, L('Welches Fach?', 'Which subject?'), name, sugg),
    step(2, L('Wann ist es so weit?', 'When is it?'), artSeg, h('div', { class: 'kl-dt' }, date, zeit), quick, live),
    step(3, L('Welche Note willst du?', 'What grade are you aiming for?'), noteRow, h('small', { class: 'kl-hint' }, L('Optional. Wer ein Ziel aufschreibt, zieht es eher durch.', 'Optional. Writing down a goal makes you more likely to hit it.'))),
    docRow ? step(4, L('Welche Unterlagen gehören dazu?', 'Which material belongs to it?'), docRow, h('small', { class: 'kl-hint' }, L('Neue Skripte kannst du gleich danach hochladen.', 'You can upload new slides right after.'))) : null);
  const r = await modal({ title: fach ? L(`Klausur: ${fach.name}`, `Exam: ${fach.name}`) : L('Klausur anlegen', 'Add exam'), body, cls: 'kl-modal',
    actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Klausur anlegen', 'Add exam'), value: 'ok', primary: true }],
    onAction: v => {
      if (v !== 'ok') return;
      if (name.value.trim().length < 2) { name.classList.add('bad'); name.focus(); return false; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date.value) || date.value < today) { date.classList.add('bad'); date.focus(); toast(L('Wann ist die Klausur? Datum fehlt noch.', 'When is the exam? Date is missing.')); return false; }
    } });
  if (r !== 'ok') return;
  const n = name.value.trim().slice(0, 60);
  let f = fach ? M.getMe().faecher.find(x => x.id === fach.id) : M.findFach(n);
  f = f ? JSON.parse(JSON.stringify(f)) : { id: uid(), created: Date.now(), name: n, kurz: '', ects: '', docs: [], farbe: AUTO[[...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0) % AUTO.length] };
  if (!fach && f.name.toLowerCase() !== n.toLowerCase() && !M.getMe().faecher.some(x => x.id === f.id)) f.name = n;
  M.addTerminTo(f, Object.assign({ art, datum: date.value }, zeit.value ? { zeit: zeit.value } : {}));
  if (note) f.zielnote = note;
  const ids = [...chosen];
  if (ids.length) {
    M.updateMe(m => { m.faecher.forEach(x => { if (x.id !== f.id) x.docs = (x.docs || []).filter(id => !ids.includes(id)); }); });
    f.docs = [...new Set([...(f.docs || []), ...ids])];
  }
  M.saveFach(f);
  const d = between(today, date.value);
  toast(d === 0 ? L(`${f.name} ist heute – viel Erfolg!`, `${f.name} is today – good luck!`) : L(`Drin. Noch ${d} ${d === 1 ? 'Tag' : 'Tage'} bis ${f.name} – jetzt den Lernplan bauen.`, `Added. ${d} ${d === 1 ? 'day' : 'days'} to ${f.name} – now build the plan.`), 4200);
  location.hash = '#/app/faecher/' + f.id;
}
function nextOf(f) { const today = dkey(); return M.termineOf(f).find(t => EXAM.includes(t.art || 'klausur') && t.datum >= today) || null; }
