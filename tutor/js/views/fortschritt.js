// Fortschritt: oben die großen Zahlen, darunter dein Lernkalender, dann dein Plan. Alles anpassbar, alles lebt.
import { h, ico, modal, ls, toast } from '../util.js';
import { L, LOCALE } from '../i18n.js';
import { S, mastery } from '../state.js';
import * as M from '../me.js';
import { reife } from '../reife.js';

const DAY = 864e5;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const docById = id => S.list.find(d => d.id === id);
const dayStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const WD = L(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
// Stufen nach Minuten – für alle verständlich statt „weniger/mehr“
const LV = [[0, L('nichts', 'nothing')], [1, L('unter 15 Min.', 'under 15 min')], [15, L('15–45 Min.', '15–45 min')], [45, L('45–90 Min.', '45–90 min')], [90, L('90+ Min.', '90+ min')]];
const level = m => m >= 90 ? 4 : m >= 45 ? 3 : m >= 15 ? 2 : m > 0 ? 1 : 0;
// Große Zahl kompakt: „45 Min.“ / „4,3 Std.“ – passt in eine Zeile
const fmtBig = m => m < 60 ? L(`${m} Min.`, `${m} min`) : (Math.round(m / 6) / 10).toLocaleString(LOCALE) + L(' Std.', ' h');

// ---------- Einstellungen (synchronisiert über „Mein Bereich“) ----------
const DEF = { kpis: ['serie', 'woche', 'karten', 'quote'], tage: 5, karten: 20, view: 'monat', range: '7' };
const cfg = () => Object.assign({}, DEF, M.getMe().fortschritt || {});
const setCfg = patch => M.updateMe(m => { m.fortschritt = Object.assign({}, DEF, m.fortschritt || {}, patch); });

// ---------- Zahlen ----------
function data() {
  const me = M.getMe(), now = Date.now(), t0 = dayStart().getTime();
  const own = S.list.filter(d => !d.sample);
  const days = M.activityDays(S.list);
  const st = M.streak(days);
  const keys = Object.keys(days).filter(k => days[k]).sort();
  let best = 0, run = 0, prev = null; for (const k of keys) { const d = new Date(k + 'T12:00'); run = prev && Math.round((d - prev) / DAY) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  const mon = dayStart(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  const weekKeys = [...Array(7)].map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return M.dayKey(d); });
  const wMin = weekKeys.reduce((a, k) => a + (me.akt?.[k] || 0), 0);
  const wDays = weekKeys.filter(k => days[k]).length;
  const totMin = Object.values(me.akt || {}).reduce((a, x) => a + x, 0);
  const cards = own.flatMap(d => d.decks.flatMap(k => k.cards));
  const learned = cards.filter(c => (c.reps || 0) > 0).length;
  const learnedW = cards.filter(c => (c.reps || 0) > 0 && (c.last || 0) > now - 7 * DAY).length;
  const cardsToday = cards.filter(c => (c.last || 0) >= t0 && (c.reps || 0) > 0).length;
  const ans = own.reduce((x, d) => x + (d.stats?.answered || 0), 0), cor = own.reduce((x, d) => x + (d.stats?.correct || 0), 0);
  let fest = 0, themen = 0, rs = [];
  for (const f of me.faecher) { const ds = (f.docs || []).map(docById).filter(Boolean); if (!ds.length) continue; const r = reife(ds, f.klausur ? new Date(f.klausur + 'T08:00').getTime() : 0); fest += r.fest; themen += r.themen; if (r.hasData) rs.push(r.score); }
  const ch = own.flatMap(d => d.path?.chapters || []);
  return { days, st, best, wMin, wDays, totMin, learned, learnedW, cardsToday, ans, cor, quote: ans ? Math.round(100 * cor / ans) : 0, fest, themen, reife: rs.length ? Math.round(rs.reduce((a, x) => a + x, 0) / rs.length) : 0, hasReife: !!rs.length, chDone: ch.filter(c => c.done).length, chTot: ch.length, lernTage: keys.length, goal: me.wochenziel || 600 };
}
const KPI = {
  serie: { t: L('Tage Serie', 'day streak'), v: p => p.st, s: p => p.best > p.st ? L(`Rekord: ${p.best}`, `Record: ${p.best}`) : p.st ? L('Das ist dein Rekord.', 'That’s your record.') : L('Heute anfangen?', 'Start today?'), ic: 'spark' },
  woche: { t: L('Lernzeit diese Woche', 'Study time this week'), v: p => p.wMin, f: fmtBig, s: p => L(`Ziel: ${M.fmtMin(p.goal)}`, `Goal: ${M.fmtMin(p.goal)}`), bar: p => p.wMin / p.goal, ic: 'clock' },
  gesamt: { t: L('Lernzeit insgesamt', 'Study time in total'), v: p => p.totMin, f: fmtBig, s: () => L('seit du dabei bist', 'since you joined'), ic: 'clock' },
  karten: { t: L('Karten gelernt', 'Cards learned'), v: p => p.learned, s: p => p.learnedW ? L(`+${p.learnedW} in 7 Tagen`, `+${p.learnedW} in 7 days`) : L('mit Wiederholung', 'with spaced repetition'), ic: 'cards' },
  quote: { t: L('Trefferquote', 'Accuracy'), v: p => p.quote, f: n => n + ' %', s: p => p.ans ? L(`${p.ans} Fragen beantwortet`, `${p.ans} questions answered`) : L('noch kein Quiz', 'no quiz yet'), ic: 'quiz' },
  fragen: { t: L('Fragen beantwortet', 'Questions answered'), v: p => p.ans, s: p => p.ans ? L(`${p.cor} davon richtig`, `${p.cor} correct`) : '', ic: 'quiz' },
  themen: { t: L('Themen sicher', 'Topics secure'), v: p => p.fest, f: (n, p) => p.themen ? `${n}/${p.themen}` : String(n), s: () => L('bis zum Klausurtag', 'for exam day'), ic: 'brain' },
  reife: { t: L('Prüfungsreife', 'Exam readiness'), v: p => p.reife, f: n => n + ' %', s: p => p.hasReife ? L('Schnitt deiner Fächer', 'average of your subjects') : L('noch keine Daten', 'no data yet'), ic: 'trophy' },
  tage: { t: L('Lerntage', 'Study days'), v: p => p.lernTage, s: () => L('insgesamt', 'in total'), ic: 'calendar' },
  kapitel: { t: L('Kapitel geschafft', 'Chapters done'), v: p => p.chDone, f: (n, p) => p.chTot ? `${n}/${p.chTot}` : String(n), s: () => L('im Lernpfad', 'in study paths'), ic: 'path' }
};

let lastAnim = 0;
export function render(body) {
  const animate = !reduce() && Date.now() - lastAnim > 4000;
  if (animate) lastAnim = Date.now();
  body.classList.add('fx-root');
  const p = data(), c = cfg();
  const seen = ls.get('tutor.progSeen', null);
  body.append(...(c.setup ? [] : [goalNudge()]), trend(p, c, animate), kpiRow(p, c, seen, animate), planCard(p, c, animate));
  // Zurück zum Tutor (ganz oben)
  const back = h('a', { class: 'fx-back', href: '#/app/tutor' }, h('span', { html: ico('left') }), L('Zurück zum Tutor', 'Back to the tutor'));
  requestAnimationFrame(() => { const top = body.parentElement || body; top.prepend(back); });
  // Schnappschuss für „+X seit letztem Mal“
  const snap = { at: Date.now(), today: M.dayKey(), todayMin: p.days[M.dayKey()] || 0 };
  for (const k of Object.keys(KPI)) snap[k] = KPI[k].v(p);
  setTimeout(() => ls.set('tutor.progSeen', snap), 1500);
}
export async function openCustomize() {
  const c = cfg(), me = M.getMe();
  const sel = new Set(c.kpis);
  const chips = h('div', { class: 'fx-pick' }, Object.entries(KPI).map(([k, d]) => {
    const b = h('button', { type: 'button', class: 'chip' + (sel.has(k) ? ' on' : ''), onclick: () => { if (sel.has(k)) { if (sel.size > 1) sel.delete(k); } else { if (sel.size >= 4) { toast(L('Höchstens 4 – nimm erst eine raus.', 'At most 4 – remove one first.')); return; } sel.add(k); } b.classList.toggle('on', sel.has(k)); } }, h('span', { html: ico(d.ic) }), d.t);
    return b;
  }));
  const st = { goal: me.wochenziel || 600, tage: c.tage, karten: c.karten, view: c.view };
  const seg = (opts, key, f = x => x) => { const w = h('div', { class: 'ik-seg' }); const paint = () => w.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(st[key]) === b.dataset.v)); opts.forEach(v => w.append(h('button', { type: 'button', 'data-v': String(v), onclick: () => { st[key] = v; paint(); } }, f(v)))); paint(); return w; };
  const body = h('div', { class: 'ik-place' },
    h('div', { class: 'me-lab' }, L('Deine Zahlen oben (bis zu 4)', 'Your numbers on top (up to 4)')), chips,
    h('div', { class: 'me-lab', style: { marginTop: '6px' } }, L('Dein Plan', 'Your plan')),
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Lernzeit pro Woche', 'Study time per week')), seg([300, 420, 600, 900, 1200, 1800], 'goal', M.fmtMin)),
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Lerntage pro Woche', 'Study days per week')), seg([3, 4, 5, 6, 7], 'tage')),
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Karten pro Tag', 'Cards per day')), seg([10, 20, 30, 50, 80], 'karten')),
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Kalender', 'Calendar')), seg(['monat', 'wochen'], 'view', v => v === 'monat' ? L('Monat', 'Month') : L('18 Wochen', '18 weeks'))),
    h('p', { class: 'me-muted', style: { margin: 0 } }, L('Faustregel: 1 ECTS ≈ 25–30 Stunden. Lieber realistisch starten und steigern.', 'Rule of thumb: 1 ECTS ≈ 25–30 hours. Start realistic, then raise it.')));
  const r = await modal({ cls: 'ik-modal', eyebrow: L('Fortschritt', 'Progress'), title: L('So, wie du lernst', 'The way you study'), body, actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Speichern', 'Save'), value: 'ok', primary: true }] });
  if (r !== 'ok') return;
  lastAnim = 0;
  M.updateMe(m => { m.wochenziel = st.goal; m.fortschritt = Object.assign({}, DEF, m.fortschritt || {}, { kpis: Object.keys(KPI).filter(k => sel.has(k)), tage: st.tage, karten: st.karten, view: st.view }); });
  rerenderFx(); toast(L('Gespeichert – dein Fortschritt, dein Plan.', 'Saved – your progress, your plan.'));
}

// ---------- 1) Große Zahlen, zählen hoch ----------
function kpiRow(p, c, seen, animate) {
  const ks = c.kpis.filter(k => KPI[k]).slice(0, 4);
  return h('div', { class: 'fx-kpis n' + ks.length }, ks.map((k, i) => {
    const d = KPI[k], v = d.v(p), fmt = n => d.f ? d.f(n, p) : String(n);
    const prev = seen && typeof seen[k] === 'number' ? seen[k] : null;
    const delta = prev != null && v > prev ? v - prev : 0;
    const b = h('b', {}, fmt(animate ? (prev != null && prev <= v ? prev : 0) : v));
    const bar = d.bar ? h('div', { class: 'fx-kbar' }, h('i', { style: { width: animate ? '0%' : Math.min(100, 100 * d.bar(p)) + '%' } })) : null;
    const el = h('div', { class: 'fx-kpi' + (delta ? ' up' : ''), style: { '--d': i * 70 + 'ms' } },
      h('div', { class: 'fx-kh' }, h('span', { class: 'fx-ki', html: ico(d.ic) }), h('span', {}, d.t)),
      h('div', { class: 'fx-kv' }, b, delta ? h('span', { class: 'fx-delta' }, '+' + (d.f && k !== 'quote' && k !== 'reife' ? d.f(delta, p) : delta)) : null),
      h('small', {}, d.s(p)), bar);
    if (animate) {
      const from = prev != null && prev <= v ? prev : 0, t0 = performance.now() + i * 70, dur = 900;
      const step = t => { if (!b.isConnected) return; const x = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - x, 3); b.textContent = fmt(Math.round(from + (v - from) * e)); if (x < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      if (bar) setTimeout(() => { bar.firstChild.style.width = Math.min(100, 100 * d.bar(p)) + '%'; }, 200 + i * 70);
    }
    return el;
  }), h('button', { class: 'fx-adj', type: 'button', onclick: openCustomize, title: L('Zahlen und Plan anpassen', 'Customise numbers and plan') }, h('span', { html: ico('tune') }), L('Anpassen', 'Customise')));
}

// ---------- 2) Lernkalender: Monat oder 18 Wochen ----------
let monthOff = 0;
function calendar(p, c, animate, seen) {
  const wrap = h('section', { class: 'me-card fx-cal' });
  const draw = (anim) => {
    const view = cfg().view;
    const seg = h('div', { class: 'fx-seg' }, [['monat', L('Monat', 'Month')], ['wochen', L('18 Wochen', '18 weeks')]].map(([v, t]) => h('button', { type: 'button', class: v === view ? 'on' : '', onclick: () => { if (v !== view) { setCfgQuiet({ view: v }); draw(true); } } }, t)));
    const todayKey = M.dayKey(), newToday = seen && seen.today === todayKey && (p.days[todayKey] || 0) > (seen.todayMin || 0);
    let head, grid, foot;
    if (view === 'monat') {
      const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + monthOff); base.setHours(0, 0, 0, 0);
      const y = base.getFullYear(), mo = base.getMonth(), nDays = new Date(y, mo + 1, 0).getDate(), lead = (base.getDay() + 6) % 7;
      let sum = 0, act = 0;
      const cells = [];
      for (let i = 0; i < lead; i++) cells.push(h('i', { class: 'fx-c blank' }));
      for (let dd = 1; dd <= nDays; dd++) {
        const d = new Date(y, mo, dd), k = M.dayKey(d), m = p.days[k] || 0, fut = d > new Date();
        if (m) { sum += m; act++; }
        const idx = cells.length;
        cells.push(h('i', { class: `fx-c l${fut ? 'f' : level(m)}` + (k === todayKey ? ' today' : '') + (k === todayKey && newToday ? ' new' : ''), style: { '--d': (anim ? (Math.floor(idx / 7) + idx % 7) * 28 : 0) + 'ms' }, title: `${d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })}: ${m ? M.fmtMin(m) : L('nichts gelernt', 'nothing studied')}` },
          h('span', { class: 'fx-dn' }, String(dd)), m ? h('span', { class: 'fx-dm' }, m >= 60 ? (Math.round(m / 6) / 10).toLocaleString(LOCALE) + ' h' : m + '′') : null));
      }
      head = h('div', { class: 'fx-ch' }, h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Vorheriger Monat', 'Previous month'), html: ico('left'), onclick: () => { monthOff--; draw(true); } }),
        h('b', {}, base.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })),
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Nächster Monat', 'Next month'), html: ico('right'), disabled: monthOff >= 0 || null, onclick: () => { monthOff++; draw(true); } }));
      grid = h('div', { class: 'fx-month' + (anim ? ' anim' : '') }, WD.map(w => h('span', { class: 'fx-wd' }, w)), cells);
      foot = h('p', { class: 'fx-sum' }, act ? L(`${act} ${act === 1 ? 'Lerntag' : 'Lerntage'} · ${M.fmtMin(sum)} in diesem Monat`, `${act} study day${act === 1 ? '' : 's'} · ${M.fmtMin(sum)} this month`) : L('In diesem Monat noch nichts – heute ist ein guter Tag dafür.', 'Nothing this month yet – today’s a good day for it.'));
    } else {
      const W = 18, end = dayStart(); const start = new Date(end); start.setDate(end.getDate() - ((end.getDay() + 6) % 7) - (W - 1) * 7);
      const cells = [], months = [];
      for (let i = 0; i < W * 7; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i); const k = M.dayKey(d), m = p.days[k] || 0, fut = d > end, col = Math.floor(i / 7);
        if (d.getDate() <= 7 && i % 7 === 0) months.push([col, d.toLocaleDateString(LOCALE, { month: 'short' })]);
        cells.push(h('i', { class: `fx-c l${fut ? 'f' : level(m)}` + (k === todayKey ? ' today' : '') + (k === todayKey && newToday ? ' new' : ''), style: { gridColumn: col + 2, gridRow: (i % 7) + 2, '--d': (anim ? (col + (i % 7)) * 18 : 0) + 'ms' }, title: `${d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })}: ${m ? M.fmtMin(m) : L('nichts gelernt', 'nothing studied')}` }));
      }
      head = h('div', { class: 'fx-ch' }, h('b', {}, L('Deine letzten 18 Wochen', 'Your last 18 weeks')));
      grid = h('div', { class: 'fx-weeks' + (anim ? ' anim' : '') }, months.map(([col, t]) => h('span', { class: 'fx-mo', style: { gridColumn: col + 2, gridRow: 1 } }, t)), ['Mo', '', 'Mi', '', 'Fr', '', ''].map((t, i) => h('span', { class: 'fx-wl', style: { gridColumn: 1, gridRow: i + 2 } }, i === 0 ? WD[0] : i === 2 ? WD[2] : i === 4 ? WD[4] : '')), cells);
      foot = h('p', { class: 'fx-sum' }, L(`Serien-Joker: Ein verpasster Tag pro Woche wird automatisch überbrückt.`, `Streak joker: one missed day per week is bridged automatically.`));
    }
    const legend = h('div', { class: 'fx-leg' }, LV.map(([, t], i) => h('span', {}, h('i', { class: 'fx-c l' + i }), t)));
    wrap.replaceChildren(h('div', { class: 'fx-top' }, head, seg), grid, h('div', { class: 'fx-bot' }, legend, foot));
  };
  draw(animate);
  return wrap;
}
// Ansicht wechseln, ohne die ganze Seite neu zu zeichnen
function setCfgQuiet(patch) { M.updateMe(m => { m.fortschritt = Object.assign({}, DEF, m.fortschritt || {}, patch); }, { quiet: true }); }

// ---------- 3) Dein Plan: was du dir vornimmst ----------
function planCard(p, c, animate) {
  const rows = [
    { t: L('Lernzeit diese Woche', 'Study time this week'), have: p.wMin, want: p.goal, f: fmtBig, ic: 'clock' },
    { t: L('Lerntage diese Woche', 'Study days this week'), have: p.wDays, want: c.tage, f: n => String(n), ic: 'calendar' },
    { t: L('Karten heute', 'Cards today'), have: p.cardsToday, want: c.karten, f: n => String(n), ic: 'cards' }
  ];
  const done = rows.filter(r => r.have >= r.want).length;
  return h('section', { class: 'me-card fx-plan' },
    h('div', { class: 'fx-top' }, h('div', { class: 'fx-ch' }, h('b', {}, L('Dein Plan', 'Your plan')), h('small', { class: 'me-muted' }, done === rows.length ? L('Alles geschafft – stark.', 'All done – strong.') : L(`${done} von ${rows.length} erreicht`, `${done} of ${rows.length} reached`))),
      h('button', { class: 'btn sm', type: 'button', onclick: openCustomize }, h('span', { html: ico('tune') }), L('Plan anpassen', 'Adjust plan'))),
    h('div', { class: 'fx-goals' }, rows.map((r, i) => {
      const pct = Math.min(100, Math.round(100 * r.have / Math.max(1, r.want))), ok = r.have >= r.want;
      const fill = h('i', { style: { width: animate ? '0%' : pct + '%' } });
      if (animate) setTimeout(() => { fill.style.width = pct + '%'; }, 350 + i * 120);
      return h('div', { class: 'fx-g' + (ok ? ' ok' : ''), style: { '--d': (350 + i * 120) + 'ms' } },
        h('span', { class: 'fx-gi', html: ico(ok ? 'check' : r.ic) }),
        h('div', { class: 'fx-gt' }, h('div', { class: 'fx-gl' }, h('b', {}, r.t), h('span', {}, `${r.f(r.have)} / ${r.f(r.want)}`)), h('div', { class: 'fx-gb' }, fill)));
    })));
}


// ---------- Lernkurve: Hochs und Tiefs, Zeitraum wählbar (Standard: 7 Tage) ----------
const RANGES = [['7', L('7 Tage', '7 days')], ['30', L('1 Monat', '1 month')], ['90', L('3 Monate', '3 months')], ['126', L('18 Wochen', '18 weeks')]];
const hFmt = m => { const x = m / 60; return x >= 10 ? Math.round(x).toLocaleString(LOCALE) : (Math.round(x * 10) / 10).toLocaleString(LOCALE); };
function trend(p, c, animate) {
  const wrap = h('section', { class: 'me-card fx-tr' });
  const draw = (anim) => {
    const range = cfg().range || '7', nD = +range, weekly = nD > 31;
    const end = dayStart(), days = [];
    for (let i = nD - 1; i >= 0; i--) { const d = new Date(end); d.setDate(end.getDate() - i); days.push({ d, k: M.dayKey(d), m: p.days[M.dayKey(d)] || 0 }); }
    let pts;
    if (weekly) { pts = []; for (let i = 0; i < days.length; i += 7) { const ch = days.slice(i, i + 7); pts.push({ m: ch.reduce((a, x) => a + x.m, 0), d: ch[0].d, lab: ch[0].d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' }) }); } }
    else pts = days.map(x => ({ m: x.m, d: x.d, lab: nD <= 7 ? x.d.toLocaleDateString(LOCALE, { weekday: 'short' }) : String(x.d.getDate()) }));
    const tot = days.reduce((a, x) => a + x.m, 0), act = days.filter(x => x.m > 0).length;
    const dayGoal = Math.round(p.goal / Math.max(1, c.tage || 5)), goal = weekly ? p.goal : dayGoal;
    const avg = weekly ? tot / Math.max(1, pts.length) : tot / nD;
    const W = 1000, H = 230, X0 = 46, T0 = 24, raw = Math.max(goal * 1.2, ...pts.map(x => x.m), 30) / 60;
    const stepH = [.25, .5, 1, 2, 2.5, 5, 10, 20].find(v => v * 4 >= raw) || 40, mx = stepH * 4 * 60;
    const xs = i => X0 + (W - X0 - 12) * (pts.length === 1 ? .5 : i / (pts.length - 1)), ys = m => T0 + H - H * Math.min(m, mx) / mx;
    const P = pts.map((x, i) => [xs(i), ys(x.m)]);
    const line = P.map((q, i) => { if (!i) return `M${q[0]},${q[1]}`; const o = P[i - 1], cx = (o[0] + q[0]) / 2; return `C${cx},${o[1]} ${cx},${q[1]} ${q[0]},${q[1]}`; }).join(' ');
    let grid = ''; for (let k = 0; k <= 4; k++) { const v = mx * k / 4, y = ys(v); grid += `<line x1="${X0}" x2="${W - 12}" y1="${y}" y2="${y}" stroke="#efe9df"/><text x="${X0 - 10}" y="${y + 4}" text-anchor="end" class="fx-ty">${hFmt(v)} h</text>`; }
    const gy = ys(goal), best = pts.reduce((b, x, i) => x.m > pts[b].m ? i : b, 0);
    const lStep = Math.max(1, Math.ceil(pts.length / (nD <= 7 ? 7 : 10)));
    const labs = pts.map((x, i) => (i % lStep === 0 && (pts.length - 1 - i >= lStep / 2 || i === pts.length - 1)) || i === pts.length - 1 ? `<text x="${xs(i)}" y="${T0 + H + 22}" text-anchor="middle" class="fx-tx">${x.lab}</text>` : '').join('');
    const dots = P.map((q, i) => { const last = i === P.length - 1, hit = pts[i].m >= goal && pts[i].m > 0; return `<circle cx="${q[0]}" cy="${q[1]}" r="${last ? 7 : hit ? 5.5 : 4}" class="fx-pt${last ? ' last' : hit ? ' hit' : ''}"><title>${pts[i].d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })}${weekly ? L(' (Woche)', ' (week)') : ''}: ${M.fmtMin(pts[i].m)}</title></circle>`; }).join('');
    const tag = pts[best].m > 0 ? (() => { const tx = L(weekly ? 'Bestwoche ' : 'Bester Tag ', weekly ? 'Best week ' : 'Best day ') + hFmt(pts[best].m) + L(' Std.', ' h'), w = tx.length * 7.4 + 28, x = Math.min(W - 12 - w / 2, Math.max(X0 + w / 2, P[best][0])); return `<g transform="translate(${x},${Math.max(T0 + 6, P[best][1] - 18)})"><rect x="${-w / 2}" y="-28" width="${w}" height="26" rx="13" fill="#17171c"/><text y="-10" text-anchor="middle" class="fx-tag">${tx}</text></g>`; })() : '';
    const svg = `<svg class="fx-chart${anim ? ' anim' : ''}" viewBox="0 0 ${W} ${T0 + H + 30}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fxf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6cf0" stop-opacity=".3"/><stop offset="1" stop-color="#5b6cf0" stop-opacity="0"/></linearGradient><linearGradient id="fxl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a7fe8"/><stop offset="1" stop-color="#7b4fe0"/></linearGradient></defs>${grid}
      <path class="fx-area" d="${line} L${P[P.length - 1][0]},${T0 + H} L${P[0][0]},${T0 + H} Z" fill="url(#fxf)"/>
      <line x1="${X0}" x2="${W - 12}" y1="${gy}" y2="${gy}" class="fx-goal"/><text x="${X0 + 8}" y="${gy - 8}" class="fx-gl">${L('Ziel ', 'Goal ')}${hFmt(goal)} h${weekly ? L(' / Woche', ' / week') : L(' / Tag', ' / day')}</text>
      <path class="fx-line" d="${line}" fill="none" stroke="url(#fxl)" stroke-width="3.5" stroke-linecap="round" pathLength="1"/>${dots}${tag}${labs}</svg>`;
    const strip = h('div', { class: 'fx-strip', style: { gridTemplateColumns: `repeat(${days.length}, 1fr)` } }, days.map(x => h('i', { class: 'l' + level(x.m), title: `${x.d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })}: ${x.m ? M.fmtMin(x.m) : L('nichts', 'nothing')}` })));
    const seg = h('div', { class: 'fx-seg fx-rng' }, RANGES.map(([v, t]) => h('button', { type: 'button', class: v === range ? 'on' : '', onclick: () => { if (v !== range) { setCfgQuiet({ range: v }); draw(true); } } }, t)));
    const title = { 7: L('Deine letzten 7 Tage', 'Your last 7 days'), 30: L('Dein letzter Monat', 'Your last month'), 90: L('Deine letzten 3 Monate', 'Your last 3 months'), 126: L('Deine letzten 18 Wochen', 'Your last 18 weeks') }[range];
    wrap.replaceChildren(
      h('div', { class: 'fx-trh' },
        h('div', {}, h('h3', {}, title), h('p', {}, weekly ? L('Lernstunden pro Woche – darunter jeder einzelne Tag', 'Study hours per week – each day below') : L('Lernstunden pro Tag – Hochs und Tiefs auf einen Blick', 'Study hours per day – highs and lows at a glance')), h('div', { class: 'fx-trc' }, seg, h('button', { type: 'button', class: 'fx-trset', onclick: openGoals }, h('span', { html: ico('tune') }), L('Ziele', 'Goals')))),
        h('div', { class: 'fx-trk' },
          h('div', { class: 'big' }, h('b', {}, hFmt(tot), h('span', {}, L(' Std.', ' h'))), h('small', {}, L('gelernt in diesem Zeitraum', 'studied in this period'))),
          h('div', {}, h('b', {}, String(p.st)), h('small', {}, p.st === 1 ? L('Tag Serie', 'day streak') : L('Tage Serie', 'day streak'))),
          h('div', {}, h('b', {}, hFmt(avg) + L(' Std.', ' h')), h('small', {}, weekly ? L('Ø pro Woche', 'avg per week') : L('Ø pro Tag', 'avg per day'))),
          h('div', {}, h('b', {}, `${act}/${nD}`), h('small', {}, L('Lerntage', 'study days'))))),
      h('div', { class: 'fx-chw', html: svg }), strip,
      h('div', { class: 'fx-trf' }, h('span', {}, L('Volle Punkte = Ziel geschafft · gestrichelt = dein Ziel', 'Filled dots = goal reached · dashed = your goal'))));
  };
  draw(animate);
  return wrap;
}

// ---------- Ziel stecken: 4 Fragen, nicht mehr – der Rest unter „Mehr anpassen“ ----------
function goalNudge() {
  return h('button', { type: 'button', class: 'fx-nudge', onclick: openGoals },
    h('span', { class: 'fx-ndi', html: ico('trophy') }),
    h('span', { class: 'fx-ndt' }, h('b', {}, L('Steck dir dein Lernziel', 'Set your study goal')), h('small', {}, L('4 kurze Fragen – danach zeigt dir Max jeden Tag, ob du auf Kurs bist.', '4 quick questions – then Max shows you every day whether you’re on track.'))),
    h('span', { class: 'fx-ndb' }, L('Los geht’s', 'Let’s go'), h('span', { html: ico('right') })));
}
export async function openGoals() {
  const me = M.getMe(), c = cfg();
  const st = { ziel: c.ziel || 'gut', tagMin: c.tagMin || Math.round((me.wochenziel || 600) / Math.max(1, c.tage || 5) / 15) * 15 || 120, tage: c.tage || 5, karten: c.karten || 20 };
  const sum = h('div', { class: 'fx-gsum' });
  const paintSum = () => sum.replaceChildren(h('span', {}, L('Dein Wochenziel', 'Your weekly goal')), h('b', {}, M.fmtMin(st.tagMin * st.tage)), h('small', {}, L(`${st.tage} Tage × ${M.fmtMin(st.tagMin)}`, `${st.tage} days × ${M.fmtMin(st.tagMin)}`)));
  const seg = (opts, key, f = x => x) => { const w = h('div', { class: 'ik-seg' }); const paint = () => w.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(st[key]) === b.dataset.v)); opts.forEach(v => { const [val, lab] = Array.isArray(v) ? v : [v, f(v)]; w.append(h('button', { type: 'button', 'data-v': String(val), onclick: () => { st[key] = val; paint(); paintSum(); } }, lab)); }); paint(); return w; };
  const q = (n, t, ctl, c2) => h('div', { class: 'fx-gq', style: { '--qc': c2 } }, h('span', { class: 'fx-gn' }, String(n)), h('div', {}, h('div', { class: 'fx-gt' }, t), ctl));
  paintSum();
  const body = h('div', { class: 'ik-place fx-goals-m' },
    q(1, L('Was ist dein Ziel?', 'What’s your goal?'), seg([['bestehen', L('Bestehen', 'Pass')], ['gut', L('Gute Note', 'Good grade')], ['top', L('1,0 – ganz oben', 'Top grade')]], 'ziel'), '#2a7fe8'),
    q(2, L('Wie lange willst du an einem Lerntag lernen?', 'How long per study day?'), seg([30, 60, 90, 120, 180, 240], 'tagMin', M.fmtMin), '#7b4fe0'),
    q(3, L('An wie vielen Tagen pro Woche?', 'How many days a week?'), seg([3, 4, 5, 6, 7], 'tage'), '#c8336f'),
    q(4, L('Wie viele Karteikarten pro Tag?', 'How many flashcards a day?'), seg([10, 20, 30, 50], 'karten'), '#1c7a47'),
    sum,
    h('button', { type: 'button', class: 'fx-more', onclick: () => { document.querySelector('.modal-bg .ik-modal')?.closest('.modal-bg')?.remove(); openCustomize(); } }, L('Mehr anpassen: Zahlen oben, Kalender …', 'More: numbers on top, calendar …'), h('span', { html: ico('right') })));
  const r = await modal({ cls: 'ik-modal fx-gmod', eyebrow: L('Fortschritt', 'Progress'), title: L('Steck dir dein Lernziel', 'Set your study goal'), body, actions: [{ label: L('Später', 'Later'), value: null }, { label: L('Ziel speichern', 'Save goal'), value: 'ok', primary: true }] });
  if (r !== 'ok') return;
  lastAnim = 0;
  M.updateMe(m => { m.wochenziel = st.tagMin * st.tage; m.fortschritt = Object.assign({}, DEF, m.fortschritt || {}, { tage: st.tage, karten: st.karten, tagMin: st.tagMin, ziel: st.ziel, setup: Date.now() }); });
  rerenderFx(); toast(L('Ziel steht. Max hält dich dran.', 'Goal set. Max keeps you on it.'));
}

function rerenderFx() { const b = document.querySelector('.fx-root'); if (b) { b.replaceChildren(); render(b); } }
