// Mein Bereich: Heute · Fächer · Stundenplan · Favoriten · Statistik. Denkt mit: Max sagt, was jetzt dran ist.
import { h, ico, ls, modal, toast, ago, uid } from '../util.js';
import { L, LOCALE, EN } from '../i18n.js';
import { face } from '../face.js';
import { S, mastery } from '../state.js';
import { getAccount, onAccount } from '../api.js';
import { getNick } from '../nick.js';
import { gruss } from '../nick.js';
import { dueCards } from './cards.js';
import { planSummary } from './plan.js';
import * as M from '../me.js';

const TABS = [['', L('Heute', 'Today'), 'home'], ['faecher', L('Fächer', 'Subjects'), 'brain'], ['plan', L('Stundenplan', 'Timetable'), 'calendar'], ['favs', L('Favoriten', 'Favourites'), 'spark'], ['stats', L('Statistik', 'Stats'), 'trophy']];
const DAYS = L(['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
const DAYS_LONG = L(['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'], ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
const hm = t => new Date(t).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
const dayStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const daysUntil = iso => Math.round((new Date(iso + 'T12:00') - dayStart().getTime() - 12 * 3600e3) / 864e5);
const tage = n => n === 1 ? L('1 Tag', '1 day') : L(`${n} Tagen`, `${n} days`);
const docById = id => S.list.find(d => d.id === id);

export function render(root, { sub = '', onLogin } = {}) {
  const wrap = h('div', { class: 'view-in me' });
  root.appendChild(wrap);
  let weekOff = 0, favFilter = 'all';
  const draw = () => {
    if (!wrap.isConnected) return;
    const a = getAccount();
    if (!a) return locked(wrap, onLogin);
    const tab = TABS.some(t => t[0] === sub) ? sub : '';
    const body = h('div', { class: 'me-body' });
    wrap.replaceChildren(hero(a, tab !== ''), syncAsk(), nav(tab), body, syncCard());
    if (tab === '') today(body);
    if (tab === 'faecher') subjects(body);
    if (tab === 'plan') timetable(body, () => weekOff, v => { weekOff = v; draw(); });
    if (tab === 'favs') favourites(body, () => favFilter, v => { favFilter = v; draw(); });
    if (tab === 'stats') stats(body);
  };
  const off1 = M.onMe(() => { const y = scrollY; draw(); scrollTo(0, y); });
  const off2 = onAccount(() => draw());
  draw();
  M.refreshIcsIfOld();
  return () => { off1(); off2(); };
}

// ---------- Ohne Konto ----------
function locked(wrap, onLogin) {
  const f = h('div', { class: 'me-face' });
  wrap.replaceChildren(h('section', { class: 'me-hero me-lockhero' }, h('div', { class: 'me-glow' }),
    h('div', { class: 'me-hl' },
      h('div', { class: 'eyebrow' }, L('Mein Bereich', 'My space')),
      h('h1', {}, L('Dein Studium. An einem Ort.', 'Your degree. In one place.')),
      h('p', {}, L('Fächer mit Klausur-Countdown, dein Stundenplan, alles Gemerkte und deine Lernserie – und Max sagt dir jeden Tag, was gerade dran ist.', 'Subjects with exam countdowns, your timetable, everything you saved and your streak – and Max tells you every day what to do next.')),
      h('div', { class: 'me-cta' }, h('button', { class: 'btn primary lg', type: 'button', onclick: () => onLogin && onLogin() }, h('span', { html: ico('lock') }), L('Kostenlos anmelden', 'Sign in for free')),
        h('small', {}, L('20 Sekunden · ohne Passwort · 7 Tage Inner Circle geschenkt', '20 seconds · no password · 7 days Inner Circle free')))),
    f),
    h('div', { class: 'me-preview', 'aria-hidden': 'true' },
      ['Kostenrechnung', 'Marketing', 'Investition & Finanzierung'].map((n, i) => h('div', { class: 'me-pcard' }, h('b', {}, n), h('span', {}, L(`Klausur in ${[12, 19, 33][i]} Tagen`, `Exam in ${[12, 19, 33][i]} days`)), h('div', { class: 'me-bar' }, h('i', { style: { width: [64, 41, 22][i] + '%' } })))),
      h('div', { class: 'me-plock' }, h('span', { html: ico('lock') }), L('Mit Konto freigeschaltet', 'Unlocked with an account'))));
  const fc = face(f, {}); fc.set && fc.set('happy');
}

// ---------- Kopf: Begrüßung + Lage ----------
function hero(a, compact = false) {
  const nick = getNick(a);
  const now = new Date();
  const brief = briefing();
  const days = M.activityDays(S.list), st = M.streak(days);
  const wk = weekMinutes(0), ans = S.list.reduce((x, d) => x + (d.stats?.answered || 0), 0), cor = S.list.reduce((x, d) => x + (d.stats?.correct || 0), 0);
  const f = h('div', { class: 'me-face' });
  const el = h('section', { class: 'me-hero' + (compact ? ' sm' : '') }, h('div', { class: 'me-glow' }),
    h('div', { class: 'me-hl' },
      h('div', { class: 'eyebrow' }, now.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })),
      h('h1', {}, gruss(now) + (nick ? ', ' : ''), nick ? h('span', { class: 'me-nick' }, nick) : null, '.'),
      compact ? null : h('p', { class: 'me-brief' }, brief),
      h('div', { class: 'me-meta' },
        stat(st, st === 1 ? L('Tag Serie', 'day streak') : L('Tage Serie', 'day streak')),
        stat(M.fmtMin(wk), L('diese Woche', 'this week')),
        stat(ans ? Math.round(100 * cor / ans) + ' %' : '–', L('richtig', 'correct')),
        stat(M.getMe().faecher.length, L('Fächer', 'subjects')))),
    f);
  const fc = face(f, {}); fc.set && fc.set(st >= 3 ? 'happy' : 'idle');
  return el;
}
const stat = (b, s) => h('span', {}, h('b', {}, String(b)), s);
function weekMinutes(off) {
  const days = M.getMe().akt || {}; const d = dayStart(); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd + off * 7);
  let m = 0; for (let i = 0; i < 7; i++) { const x = new Date(d); x.setDate(d.getDate() + i); m += days[M.dayKey(x)] || 0; } return m;
}
// Max' Lage in einem Satz – aus Stundenplan, Karten, Klausuren
function briefing() {
  const parts = [];
  const now = Date.now();
  const ses = M.sessionsOn(new Date()).filter(s => s.e > now);
  if (ses.length) { const s = ses[0]; parts.push(s.s <= now ? L(`Gerade läuft ${s.t}${s.o ? ' in ' + s.o : ''}.`, `${s.t} is on right now${s.o ? ' in ' + s.o : ''}.`) : L(`Um ${hm(s.s)} hast du ${s.t}${s.o ? ' in ' + s.o : ''}.`, `At ${hm(s.s)} you have ${s.t}${s.o ? ' in ' + s.o : ''}.`)); }
  const due = S.list.reduce((x, d) => x + dueCards(d).length, 0);
  if (due) parts.push(L(`${due} ${due === 1 ? 'Karte ist' : 'Karten sind'} fällig – ${Math.max(2, Math.round(due * 0.4))} Minuten, dann sitzt das.`, `${due} ${due === 1 ? 'card is' : 'cards are'} due – ${Math.max(2, Math.round(due * 0.4))} minutes and it sticks.`));
  const ex = exams()[0];
  if (ex && ex.days >= 0 && ex.days <= 45) parts.push(ex.days === 0 ? L(`Heute ist ${ex.name}-Klausur. Du packst das.`, `${ex.name} exam today. You’ve got this.`) : L(`${ex.name}-Klausur in ${tage(ex.days)}${ex.m != null ? ` – du stehst bei ${ex.m} %` : ''}.`, `${ex.name} exam in ${tage(ex.days)}${ex.m != null ? ` – you’re at ${ex.m}%` : ''}.`));
  if (!parts.length) parts.push(S.list.length ? L('Nichts Dringendes. Perfekter Tag, um vorzuarbeiten.', 'Nothing urgent. Perfect day to get ahead.') : L('Leg deine Fächer an und lad dein erstes Skript hoch – dann plane ich mit.', 'Add your subjects and upload your first slides – then I’ll plan along.'));
  return parts.join(' ');
}
// Alle Klausuren: aus Fächern, sonst aus Klausurplänen der Skripte
function exams() {
  const me = M.getMe(), out = [], seen = new Set();
  for (const f of me.faecher) {
    const ds = (f.docs || []).map(docById).filter(Boolean);
    const planEx = ds.map(d => d.plan?.exam).filter(Boolean).sort()[0];
    const iso = f.klausur || planEx; if (!iso) continue;
    ds.forEach(d => seen.add(d.id));
    out.push({ name: f.name, iso, days: daysUntil(iso), m: ds.length ? Math.round(ds.reduce((x, d) => x + mastery(d), 0) / ds.length) : null, fach: f, doc: ds[0] });
  }
  for (const d of S.list) if (!seen.has(d.id) && d.plan?.exam) out.push({ name: d.name, iso: d.plan.exam, days: daysUntil(d.plan.exam), m: mastery(d), doc: d });
  return out.filter(x => x.days >= 0).sort((a, b) => a.days - b.days);
}

// ---------- Freiwillige Synchronisierung ----------
function syncAsk() {
  if (M.syncState() !== null) return null;
  return h('section', { class: 'me-ask' },
    h('div', { class: 'me-ask-i', html: ico('refresh') }),
    h('div', { class: 'me-ask-t' }, h('b', {}, L('Auf Laptop und Handy gleichzeitig?', 'On your laptop and phone at once?')),
      h('p', {}, L('Damit deine Fächer, Favoriten und dein Stundenplan auf allen Geräten da sind, müssen wir sie auf unserem Server speichern. Wenn nicht, bleibt alles nur auf diesem Gerät. Deine Skripte bleiben so oder so nur hier.', 'For your subjects, favourites and timetable to be on all your devices, we need to store them on our server. If not, everything stays on this device only. Your slides always stay here either way.'))),
    h('div', { class: 'me-ask-b' },
      h('button', { class: 'btn primary', type: 'button', onclick: async () => { await M.setSync(true); toast(L('Läuft. Dein Bereich ist jetzt auf allen Geräten.', 'Done. Your space is now on all your devices.')); } }, L('Ja, überall', 'Yes, everywhere')),
      h('button', { class: 'btn', type: 'button', onclick: () => M.setSync(false) }, L('Nur dieses Gerät', 'This device only'))));
}
function syncCard() {
  const on = M.syncState(); if (on === null) return null;
  const inf = M.syncInfo();
  const sw = h('button', { class: 'me-switch' + (on ? ' on' : ''), type: 'button', role: 'switch', 'aria-checked': on ? 'true' : 'false', 'aria-label': L('Auf allen Geräten', 'On all devices') }, h('i'));
  sw.addEventListener('click', async () => {
    if (on) {
      const ok = await modal({ title: L('Nur noch auf diesem Gerät?', 'This device only?'), text: L('Wir löschen deine Kopie auf unserem Server. Auf diesem Gerät bleibt alles, auf anderen Geräten wird nichts mehr abgeglichen.', 'We delete your copy on our server. Everything stays on this device; other devices stop syncing.'), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Ja, nur hier', 'Yes, only here'), value: true, primary: true }] });
      if (ok) M.setSync(false);
    } else M.setSync(true);
  });
  return h('section', { class: 'me-sync' },
    h('div', {}, h('b', {}, L('Auf allen Geräten', 'On all devices')),
      h('p', {}, on ? (inf.err ? L('Abgleich gerade nicht möglich – ich versuch’s gleich nochmal.', 'Can’t sync right now – I’ll try again shortly.') : inf.at ? L(`Synchronisiert ${ago(inf.at)}. Fächer, Favoriten und Stundenplan liegen in deinem Konto.`, `Synced ${ago(inf.at)}. Subjects, favourites and timetable are kept in your account.`) : L('Wird synchronisiert …', 'Syncing …'))
        : L('Aus: Alles liegt nur auf diesem Gerät.', 'Off: everything stays on this device only.'))),
    sw);
}

function nav(tab) {
  return h('nav', { class: 'me-nav', role: 'tablist' }, TABS.map(([k, label, ic]) => h('a', { class: 'me-tab' + (k === tab ? ' on' : ''), href: '#/app/me' + (k ? '/' + k : ''), role: 'tab', 'aria-selected': k === tab ? 'true' : 'false' }, h('span', { html: ico(ic) }), label)));
}
const card = (title, ...kids) => h('section', { class: 'me-card' }, title ? h('div', { class: 'me-ct' }, title) : null, ...kids);

// ---------- Heute ----------
function today(body) {
  const now = Date.now();
  const ses = M.sessionsOn(new Date()), up = ses.filter(s => s.e > now);
  const tm = new Date(); tm.setDate(tm.getDate() + 1);
  const ses2 = up.length ? [] : M.sessionsOn(tm);
  const hasPlan = M.getMe().kurse.length || M.getMe().ics.events?.length;
  const showToday = up.length || !ses2.length;
  const sesEl = up.length ? h('div', { class: 'me-sessions' }, ses.map(s => session(s, now)))
    : ses2.length ? h('div', { class: 'me-sessions' }, h('div', { class: 'me-note' }, ses.length ? L('Für heute bist du durch. Morgen steht an:', 'You’re done for today. Tomorrow:') : L('Heute frei. Morgen steht an:', 'Free today. Tomorrow:')), ses2.map(s => session(s, now)))
    : h('div', { class: 'me-empty' }, h('p', {}, hasPlan ? (ses.length ? L('Für heute bist du durch. Morgen ist frei.', 'You’re done for today. Tomorrow is free.') : L('Heute keine Vorlesungen. Zeit für dich – oder für Karteikarten.', 'No lectures today. Time for you – or for flashcards.')) : L('Verbinde deinen Stundenplan, dann sag ich dir jeden Morgen, was ansteht.', 'Connect your timetable and I’ll tell you every morning what’s on.')),
      hasPlan ? null : h('a', { class: 'btn sm', href: '#/app/me/plan' }, L('Stundenplan verbinden', 'Connect timetable')));
  const recs = recommend();
  const ex = exams().slice(0, 4);
  body.append(h('div', { class: 'me-grid' },
    card(L('Max empfiehlt', 'Max suggests'), h('div', { class: 'me-recs' }, recs.map((r, i) => h('a', { class: 'me-rec' + (i === 0 ? ' top' : ''), href: r.href, onclick: r.onclick || null },
      h('span', { class: 'me-ri', html: ico(r.ic) }), h('span', { class: 'me-rt' }, h('b', {}, r.t), h('small', {}, r.s)), h('span', { class: 'me-ra', html: ico('right') }))))),
    card(showToday ? L('Heute', 'Today') : L('Morgen', 'Tomorrow'), sesEl),
    card(L('Klausuren', 'Exams'), ex.length ? h('div', { class: 'me-exams' }, ex.map(e => h('a', { class: 'me-exam', href: e.doc ? `#/app/${e.doc.id}/plan` : '#/app/me/faecher' },
      h('div', { class: 'me-exn' }, h('b', {}, String(e.days)), h('span', {}, e.days === 1 ? L('Tag', 'day') : L('Tage', 'days'))),
      h('div', { class: 'me-ext' }, h('b', {}, e.name), h('small', {}, new Date(e.iso + 'T12:00').toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' }) + (e.m != null ? L(` · Lernstand ${e.m} %`, ` · progress ${e.m}%`) : '')),
        e.m != null ? h('div', { class: 'me-bar' }, h('i', { style: { width: e.m + '%' } }), h('s', { style: { left: expected(e.days) + '%' } })) : null))))
      : h('div', { class: 'me-empty' }, h('p', {}, L('Noch keine Klausurtermine. Trag sie bei deinen Fächern ein – dann zähl ich runter und plan mit.', 'No exam dates yet. Add them to your subjects – I’ll count down and plan along.')), h('a', { class: 'btn sm', href: '#/app/me/faecher' }, L('Fächer anlegen', 'Add subjects'))))));
}
// Wo man stehen sollte: grob linear über 6 Wochen vor der Klausur
const expected = d => Math.max(5, Math.min(95, Math.round(100 - d * (100 / 42))));
function session(s, now) {
  const live = s.s <= now && s.e > now, past = s.e <= now, soon = !live && !past && s.s - now < 3600e3;
  const ds = s.fach ? (s.fach.docs || []).map(docById).filter(Boolean) : [];
  const due = ds.reduce((x, d) => x + dueCards(d).length, 0);
  return h('div', { class: 'me-ses' + (live ? ' live' : '') + (past ? ' past' : '') },
    h('div', { class: 'me-st' }, h('b', {}, hm(s.s)), h('small', {}, hm(s.e))),
    h('div', { class: 'me-sx' }, h('b', {}, s.t), h('small', {}, [live ? L('läuft gerade', 'on now') : soon ? L(`in ${Math.max(1, Math.round((s.s - now) / 60e3))} Min.`, `in ${Math.max(1, Math.round((s.s - now) / 60e3))} min`) : '', s.o, s.fach ? s.fach.name : ''].filter(Boolean).join(' · ')),
      ds.length && !past ? h('a', { class: 'me-sact', href: due ? `#/app/${ds[0].id}/karten` : `#/app/${ds[0].id}/hub` }, due ? L(`${due} Karten davor wiederholen`, `Review ${due} cards first`) : L('Kurz vorbereiten', 'Quick prep')) : null));
}
// Die nächsten sinnvollen Schritte, nach Wichtigkeit
function recommend() {
  const me = M.getMe(), out = [];
  const byDue = S.list.map(d => ({ d, n: dueCards(d).length })).filter(x => x.n).sort((a, b) => b.n - a.n);
  const ex = exams();
  const urgent = ex.find(e => e.days <= 21 && e.doc && (e.m ?? 0) < expected(e.days));
  if (urgent) out.push({ ic: 'calendar', t: L(`${urgent.name}: aufholen`, `${urgent.name}: catch up`), s: L(`Klausur in ${tage(urgent.days)} – du bist bei ${urgent.m} %, Ziel wäre ~${expected(urgent.days)} %.`, `Exam in ${tage(urgent.days)} – you’re at ${urgent.m}%, aim for ~${expected(urgent.days)}%.`), href: `#/app/${urgent.doc.id}/plan` });
  for (const d of S.list) { const p = d.plan ? planSummary(d) : null; if (p && p.daysLeft >= 0 && p.todayOpen?.length) { out.push({ ic: 'exam', t: L(`Heute im Plan: ${d.name}`, `Today’s plan: ${d.name}`), s: L(`${p.todayOpen.length} ${p.todayOpen.length === 1 ? 'Aufgabe' : 'Aufgaben'} · ~${p.todayMin} Min.`, `${p.todayOpen.length} ${p.todayOpen.length === 1 ? 'task' : 'tasks'} · ~${p.todayMin} min`), href: `#/app/${d.id}/plan` }); break; } }
  if (byDue.length) { const n = byDue.reduce((x, y) => x + y.n, 0); out.push({ ic: 'cards', t: L(`${n} Karten wiederholen`, `Review ${n} cards`), s: L(`Am meisten in „${byDue[0].d.name}“. Wiederholen ist kostenlos.`, `Most in “${byDue[0].d.name}”. Reviewing is free.`), href: `#/app/${byDue[0].d.id}/karten` }); }
  for (const e of ex.filter(e => e.days <= 60 && e.fach)) {
    const ds = (e.fach.docs || []).map(docById).filter(Boolean);
    if (!ds.length) { out.push({ ic: 'upload', t: L(`${e.name}: Stoff hochladen`, `${e.name}: upload material`), s: L(`Klausur in ${tage(e.days)}, aber noch kein Skript drin. Lad es hoch, dann plan ich mit.`, `Exam in ${tage(e.days)}, but no slides yet. Upload them and I’ll plan along.`), href: '#/app', onclick: ev => { ev.preventDefault(); document.getElementById('fileApp')?.click(); } }); continue; }
    const np = ds.find(d => !d.plan);
    if (np) out.push({ ic: 'calendar', t: L(`Klausurplan für ${e.name}`, `Exam plan for ${e.name}`), s: L(`${tage(e.days)} bis zur Klausur – ich teil dir den Stoff Tag für Tag auf. Kostenlos.`, `${tage(e.days)} to go – I’ll split the material day by day. Free.`), href: `#/app/${np.id}/plan` });
    const nk = ds.find(d => !d.decks.length);
    if (nk) out.push({ ic: 'cards', t: L(`Karteikarten für ${e.name}`, `Flashcards for ${e.name}`), s: L('Einmal erstellen, dann jeden Tag ein paar Minuten wiederholen – kostenlos.', 'Create once, then review a few minutes a day – free.'), href: `#/app/${nk.id}/karten` });
  }
  const mis = S.list.filter(d => d.mistakes?.length).sort((a, b) => b.mistakes.length - a.mistakes.length)[0];
  if (mis) out.push({ ic: 'quiz', t: L(`${mis.mistakes.length} Fehler ausbügeln`, `Fix ${mis.mistakes.length} mistakes`), s: L(`Aus „${mis.name}“. Genau da holt man in der Klausur Punkte.`, `From “${mis.name}”. That’s where exam points are.`), href: `#/app/${mis.id}/quiz` });
  const nxt = S.list.find(d => d.path?.chapters?.some(c => !c.done));
  if (nxt) { const i = nxt.path.chapters.findIndex(c => !c.done); out.push({ ic: 'path', t: L(`Weiter: ${nxt.path.chapters[i].title}`, `Next: ${nxt.path.chapters[i].title}`), s: L(`Lernpfad „${nxt.name}“ · Kapitel ${i + 1} von ${nxt.path.chapters.length}`, `Study path “${nxt.name}” · chapter ${i + 1} of ${nxt.path.chapters.length}`), href: `#/app/${nxt.id}/pfad/${i}` }); }
  if (!S.list.length) out.push({ ic: 'upload', t: L('Erstes Skript hochladen', 'Upload your first slides'), s: L('PDF, PowerPoint oder Word – ich mach Quiz, Karten und Lernpfad draus.', 'PDF, PowerPoint or Word – I’ll turn it into quizzes, cards and a study path.'), href: '#/app', onclick: e => { e.preventDefault(); document.getElementById('fileApp')?.click(); } });
  if (!me.faecher.length) out.push({ ic: 'brain', t: L('Fächer anlegen', 'Add your subjects'), s: L('Mit Klausurdatum – dann zähl ich runter und weiß, was Vorrang hat.', 'With exam dates – so I can count down and prioritise.'), href: '#/app/me/faecher' });
  if (!me.kurse.length && !me.ics.events?.length) out.push({ ic: 'calendar', t: L('Stundenplan verbinden', 'Connect your timetable'), s: L('Link aus dem Uni-Portal einfügen – dauert 30 Sekunden.', 'Paste the link from your uni portal – takes 30 seconds.'), href: '#/app/me/plan' });
  out.push({ ic: 'whistle', t: L('10 Minuten BWL-Trainer', '10 minutes of the trainer'), s: L('Buchungssätze, Break-even, Kapitalwert – unbegrenzt.', 'Entries, break-even, NPV – unlimited.'), href: '#/app/trainer' });
  return out.slice(0, 5);
}

// ---------- Fächer ----------
function subjects(body) {
  const me = M.getMe();
  const grid = h('div', { class: 'me-subj' });
  for (const f of me.faecher) {
    const ds = (f.docs || []).map(docById).filter(Boolean);
    const m = ds.length ? Math.round(ds.reduce((x, d) => x + mastery(d), 0) / ds.length) : 0;
    const iso = f.klausur || ds.map(d => d.plan?.exam).filter(Boolean).sort()[0];
    const dl = iso ? daysUntil(iso) : null;
    const due = ds.reduce((x, d) => x + dueCards(d).length, 0);
    grid.append(h('article', { class: 'me-sc' },
      h('div', { class: 'me-sch' }, h('span', { class: 'me-badge' }, (f.kurz || f.name).slice(0, 3).toUpperCase()), h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Bearbeiten', 'Edit'), html: ico('tune'), onclick: () => editFach(f) })),
      h('h3', {}, f.name),
      h('div', { class: 'me-scd' }, dl == null ? h('span', { class: 'me-muted' }, L('Kein Klausurtermin', 'No exam date')) : dl < 0 ? h('span', { class: 'me-muted' }, L('Klausur vorbei', 'Exam over')) : h('span', {}, h('b', {}, String(dl)), dl === 1 ? L(' Tag bis zur Klausur', ' day to the exam') : L(' Tage bis zur Klausur', ' days to the exam'))),
      h('div', { class: 'me-bar big' }, h('i', { style: { width: m + '%' } }), dl != null && dl >= 0 ? h('s', { style: { left: expected(dl) + '%' } }) : null),
      h('div', { class: 'me-scm' }, h('span', {}, L(`Lernstand ${m} %`, `Progress ${m}%`)), due ? h('span', {}, L(`${due} Karten fällig`, `${due} cards due`)) : null, f.ects ? h('span', {}, f.ects + ' ECTS') : null),
      h('div', { class: 'me-scdocs' }, ds.length ? ds.map(d => h('a', { class: 'chip', href: `#/app/${d.id}/hub` }, h('span', { html: ico('file') }), d.name.length > 26 ? d.name.slice(0, 25) + '…' : d.name))
        : h('button', { class: 'chip', type: 'button', onclick: () => editFach(f) }, h('span', { html: ico('plus') }), L('Skripte zuordnen', 'Assign slides')))));
  }
  grid.append(h('button', { class: 'me-sc me-scadd', type: 'button', onclick: () => editFach(null) }, h('span', { html: ico('plus') }), h('b', {}, L('Fach anlegen', 'Add subject')), h('small', {}, L('z. B. Kostenrechnung, Klausur am 12.02.', 'e.g. Cost accounting, exam on 12 Feb'))));
  const loose = S.list.filter(d => !d.sample && !M.fachOf(d.id));
  body.append(grid, loose.length && me.faecher.length ? h('div', { class: 'me-note' }, L(`${loose.length} ${loose.length === 1 ? 'Skript ist' : 'Skripte sind'} noch keinem Fach zugeordnet.`, `${loose.length} ${loose.length === 1 ? 'set of slides isn’t' : 'sets of slides aren’t'} assigned to a subject yet.`)) : null);
}
async function editFach(f) {
  const isNew = !f; f = f ? JSON.parse(JSON.stringify(f)) : { name: '', kurz: '', klausur: '', ects: '', docs: [] };
  const name = h('input', { class: 'field', value: f.name, maxlength: 60, placeholder: L('Name, z. B. Kostenrechnung', 'Name, e.g. Cost accounting') });
  const kurz = h('input', { class: 'field', value: f.kurz || '', maxlength: 12, placeholder: L('Kürzel (optional), z. B. KLR', 'Short name (optional)') });
  const date = h('input', { class: 'field', type: 'date', value: f.klausur || '' });
  const ects = h('input', { class: 'field', type: 'number', min: 0, max: 30, value: f.ects || '', placeholder: 'ECTS' });
  const docs = S.list.filter(d => !d.sample);
  const checks = docs.map(d => { const other = M.getMe().faecher.find(x => x.id !== f.id && (x.docs || []).includes(d.id)); const c = h('input', { type: 'checkbox', checked: (f.docs || []).includes(d.id) || null }); return [d, c, h('label', { class: 'me-chk' }, c, h('span', {}, d.name), other ? h('small', {}, L(`bei ${other.name}`, `in ${other.name}`)) : null)]; });
  const body = h('div', { class: 'me-form' },
    h('label', {}, h('span', {}, L('Fach', 'Subject')), name),
    h('div', { class: 'me-row2' }, h('label', {}, h('span', {}, L('Kürzel', 'Short name')), kurz), h('label', {}, h('span', {}, 'ECTS'), ects)),
    h('label', {}, h('span', {}, L('Klausurtermin', 'Exam date')), date),
    docs.length ? h('div', {}, h('span', { class: 'me-lab' }, L('Skripte in diesem Fach', 'Slides in this subject')), h('div', { class: 'me-chks' }, checks.map(x => x[2]))) : h('p', { class: 'me-muted' }, L('Sobald du Skripte hochlädst, kannst du sie hier zuordnen.', 'Once you upload slides, you can assign them here.')));
  const actions = [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: isNew ? L('Anlegen', 'Add') : L('Speichern', 'Save'), value: 'save', primary: true }];
  if (!isNew) actions.unshift({ label: L('Löschen', 'Delete'), value: 'del' });
  const r = await modal({ title: isNew ? L('Neues Fach', 'New subject') : f.name, body, actions,
    onAction: v => { if (v === 'save' && name.value.trim().length < 2) { name.focus(); name.classList.add('bad'); return false; } } });
  if (r === 'del') { const ok = await modal({ title: L(`„${f.name}“ löschen?`, `Delete “${f.name}”?`), text: L('Deine Skripte bleiben, nur das Fach verschwindet.', 'Your slides stay – only the subject goes.'), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] }); if (ok) M.delFach(f.id); return; }
  if (r !== 'save') return;
  const chosen = checks.filter(x => x[1].checked).map(x => x[0].id);
  // ein Skript gehört zu genau einem Fach
  M.updateMe(m => { m.faecher.forEach(x => { if (x.id !== f.id) x.docs = (x.docs || []).filter(id => !chosen.includes(id)); }); });
  M.saveFach(Object.assign(f, { name: name.value.trim().slice(0, 60), kurz: kurz.value.trim().slice(0, 12), klausur: date.value || '', ects: ects.value ? Math.max(0, Math.min(30, +ects.value)) : '', docs: chosen }));
  toast(isNew ? L('Fach angelegt.', 'Subject added.') : L('Gespeichert.', 'Saved.'));
}

// ---------- Stundenplan ----------
function timetable(body, getOff, setOff) {
  const me = M.getMe();
  const off = getOff();
  const mon = dayStart(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7) + off * 7);
  const days = [...Array(7)].map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  const per = days.map(d => M.sessionsOn(d));
  const showWe = per[5].length || per[6].length;
  const cols = showWe ? days.map((d, i) => [d, per[i]]) : days.slice(0, 5).map((d, i) => [d, per[i]]);
  const all = cols.flatMap(c => c[1]);
  const hrs = all.length ? all.map(s => [new Date(s.s).getHours(), new Date(s.e).getHours() + (new Date(s.e).getMinutes() ? 1 : 0)]) : [[8, 18]];
  const h0 = Math.min(8, ...hrs.map(x => x[0])), h1 = Math.max(18, ...hrs.map(x => x[1]));
  const PX = 56;
  const today0 = dayStart().getTime();
  const grid = h('div', { class: 'me-week', style: { '--cols': cols.length, '--rows': h1 - h0 } },
    h('div', { class: 'me-wh' }, h('span'), cols.map(([d]) => h('span', { class: d.getTime() === today0 ? 'on' : '' }, h('b', {}, DAYS[d.getDay()]), d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'numeric' })))),
    h('div', { class: 'me-wb', style: { height: (h1 - h0) * PX + 'px' } },
      h('div', { class: 'me-hours' }, [...Array(h1 - h0)].map((_, i) => h('span', { style: { top: i * PX + 'px' } }, String(h0 + i).padStart(2, '0') + ':00'))),
      cols.map(([d, list]) => h('div', { class: 'me-col' + (d.getTime() === today0 ? ' on' : '') }, layout(list).map(({ s, lane, lanes }) => {
        const top = ((s.s - d.getTime()) / 3600e3 - h0) * PX, ht = Math.max(26, (s.e - s.s) / 3600e3 * PX - 3);
        return h('button', { class: 'me-blk' + (s.own ? ' own' : '') + (s.e < Date.now() ? ' past' : ''), type: 'button', style: { top: top + 'px', height: ht + 'px', left: `calc(${100 * lane / lanes}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }, title: `${s.t} · ${hm(s.s)}–${hm(s.e)}${s.o ? ' · ' + s.o : ''}`, onclick: () => s.own ? editKurs(me.kurse.find(k => k.id === s.id)) : assignIcs(s) },
          h('b', {}, s.t), h('small', {}, `${hm(s.s)}–${hm(s.e)}${s.o ? ' · ' + s.o : ''}`), s.fach ? h('i', {}, s.fach.kurz || s.fach.name) : null);
      })))));
  // Handy: Liste statt Raster
  const list = h('div', { class: 'me-wlist' }, cols.map(([d, l]) => h('div', { class: 'me-wday' + (d.getTime() === today0 ? ' on' : '') }, h('div', { class: 'me-wdh' }, DAYS_LONG[d.getDay()], h('small', {}, d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' }))),
    l.length ? l.map(s => h('button', { class: 'me-wli', type: 'button', onclick: () => s.own ? editKurs(me.kurse.find(k => k.id === s.id)) : assignIcs(s) }, h('b', {}, hm(s.s)), h('span', {}, s.t, h('small', {}, [s.o, s.fach?.name].filter(Boolean).join(' · '))))) : h('div', { class: 'me-muted' }, L('frei', 'free')))));
  const kw = isoWeek(mon);
  body.append(
    connectBox(),
    card(null,
      h('div', { class: 'me-wtop' },
        h('div', { class: 'me-wnav' }, h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Vorherige Woche', 'Previous week'), html: ico('left'), onclick: () => setOff(off - 1) }),
          h('b', {}, off === 0 ? L('Diese Woche', 'This week') : off === 1 ? L('Nächste Woche', 'Next week') : off === -1 ? L('Letzte Woche', 'Last week') : L(`KW ${kw}`, `Week ${kw}`)),
          h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Nächste Woche', 'Next week'), html: ico('right'), onclick: () => setOff(off + 1) }),
          off ? h('button', { class: 'btn sm ghost', type: 'button', onclick: () => setOff(0) }, L('Heute', 'Today')) : null),
        h('button', { class: 'btn sm', type: 'button', onclick: () => editKurs(null) }, h('span', { html: ico('plus') }), L('Kurs eintragen', 'Add class'))),
      all.length ? null : h('div', { class: 'me-note' }, L('Diese Woche steht nichts drin. Verbinde oben deinen Kalender oder trag deine Kurse ein.', 'Nothing this week. Connect your calendar above or add your classes.')),
      grid, list));
}
function isoWeek(d) { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(); return Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7); }
// Überlappende Termine nebeneinander
function layout(list) {
  const out = []; let group = [], end = 0;
  const flush = () => { const lanes = []; for (const s of group) { let l = lanes.findIndex(e => e <= s.s); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = s.e; out.push({ s, lane: l }); } const n = lanes.length; out.slice(-group.length).forEach(x => x.lanes = n); group = []; };
  for (const s of list) { if (group.length && s.s >= end) flush(); group.push(s); end = Math.max(end, s.e); }
  if (group.length) flush();
  return out;
}
function connectBox() {
  const me = M.getMe();
  const fin = h('input', { type: 'file', accept: '.ics,text/calendar', class: 'sr' });
  fin.addEventListener('change', async () => { const f = fin.files[0]; fin.value = ''; if (!f) return; try { const n = await M.loadIcsFile(f); toast(L(`${n} Termine übernommen.`, `${n} events imported.`)); } catch (e) { toast(e.message); } });
  if (me.ics.events?.length) {
    const n = me.ics.events.filter(x => x[1] > Date.now()).length;
    const btn = h('button', { class: 'btn sm', type: 'button' }, h('span', { html: ico('refresh') }), L('Aktualisieren', 'Refresh'));
    btn.addEventListener('click', async () => { btn.disabled = true; try { const k = await M.loadIcsUrl(me.ics.url); toast(L(`Aktualisiert · ${k} Termine.`, `Refreshed · ${k} events.`)); } catch (e) { toast(e.message); btn.disabled = false; } });
    return h('section', { class: 'me-conn on' }, h('span', { class: 'me-ci', html: ico('check') }),
      h('div', {}, h('b', {}, me.ics.name || L('Kalender verbunden', 'Calendar connected')), h('small', {}, L(`${n} kommende Termine · ${me.ics.url ? 'aktualisiert ' + ago(me.ics.at) + ', danach automatisch alle 12 Std.' : 'aus Datei, ' + ago(me.ics.at)}`, `${n} upcoming events · ${me.ics.url ? 'refreshed ' + ago(me.ics.at) + ', then automatically every 12 h' : 'from file, ' + ago(me.ics.at)}`))),
      h('div', { class: 'me-cb' }, me.ics.url ? btn : h('label', { class: 'btn sm' }, fin, L('Neue Datei', 'New file')), h('button', { class: 'btn sm ghost', type: 'button', onclick: async () => { const ok = await modal({ title: L('Kalender trennen?', 'Disconnect calendar?'), text: L('Die Termine verschwinden aus deinem Stundenplan. Eigene Kurse bleiben.', 'The events disappear from your timetable. Your own classes stay.'), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Trennen', 'Disconnect'), value: true, primary: true }] }); if (ok) M.dropIcs(); } }, L('Trennen', 'Disconnect'))));
  }
  const inp = h('input', { class: 'field', placeholder: L('Kalender-Link einfügen (https://… oder webcal://…)', 'Paste calendar link (https://… or webcal://…)'), inputmode: 'url', autocomplete: 'off', spellcheck: 'false' });
  const go = h('button', { class: 'btn primary', type: 'submit' }, L('Verbinden', 'Connect'));
  const err = h('div', { class: 'me-err', role: 'alert' });
  const form = h('form', { class: 'me-cform' }, inp, go);
  form.addEventListener('submit', async e => {
    e.preventDefault(); const u = inp.value.trim(); if (!u) { inp.focus(); return; }
    go.disabled = true; go.textContent = L('Lade …', 'Loading …'); err.textContent = '';
    try { const n = await M.loadIcsUrl(u); toast(L(`Verbunden · ${n} Termine. Ich ordne sie deinen Fächern zu.`, `Connected · ${n} events. I’ll match them to your subjects.`)); }
    catch (x) { err.textContent = x.message || L('Hat nicht geklappt.', 'That didn’t work.'); go.disabled = false; go.textContent = L('Verbinden', 'Connect'); }
  });
  const help = h('details', { class: 'me-help' }, h('summary', {}, L('Wo finde ich meinen Kalender-Link?', 'Where do I find my calendar link?')),
    h('ul', {},
      h('li', {}, h('b', {}, 'Stud.IP: '), L('Planer → Terminkalender → „Exportieren/Abonnieren“ → Link kopieren.', 'Planner → Calendar → “Export/Subscribe” → copy link.')),
      h('li', {}, h('b', {}, 'ILIAS / AULIS: '), L('Persönlicher Schreibtisch → Kalender → „Abonnieren“ → Link kopieren.', 'Dashboard → Calendar → “Subscribe” → copy link.')),
      h('li', {}, h('b', {}, 'HISinOne / Campus-Portal: '), L('Stundenplan → „iCalendar-Export“ oder „Abonnieren“.', 'Timetable → “iCalendar export” or “Subscribe”.')),
      h('li', {}, h('b', {}, 'Google Kalender: '), L('Einstellungen → Kalender auswählen → „Privatadresse im iCal-Format“.', 'Settings → pick calendar → “Secret address in iCal format”.')),
      h('li', {}, h('b', {}, 'Apple / iCloud: '), L('Kalender teilen → „Öffentlicher Kalender“ → Link kopieren.', 'Share calendar → “Public calendar” → copy link.'))),
    h('p', {}, L('Kein Link? Dann lad die .ics-Datei hoch oder trag deine Kurse per Hand ein.', 'No link? Upload the .ics file or add your classes by hand.')));
  return h('section', { class: 'me-conn' }, h('div', { class: 'me-cw' }, h('b', {}, L('Stundenplan verbinden', 'Connect your timetable')), h('small', {}, L('Einmal verbinden, dann aktualisiert er sich von selbst. Funktioniert mit fast jeder Uni.', 'Connect once and it updates itself. Works with almost every uni.'))),
    form, err, h('div', { class: 'me-cb' }, h('label', { class: 'btn sm ghost' }, fin, h('span', { html: ico('upload') }), L('.ics-Datei hochladen', 'Upload .ics file'))), help);
}
async function editKurs(k) {
  const me = M.getMe(), isNew = !k; k = k ? Object.assign({}, k) : { titel: '', fach: '', tag: ((new Date().getDay() + 6) % 7) + 1, von: '10:00', bis: '11:30', raum: '', art: 'Vorlesung' };
  const titel = h('input', { class: 'field', value: k.titel, maxlength: 80, placeholder: L('z. B. Kostenrechnung', 'e.g. Cost accounting') });
  const fach = h('select', { class: 'field' }, h('option', { value: '' }, L('– kein Fach –', '– no subject –')), me.faecher.map(f => h('option', { value: f.id, selected: f.id === k.fach || null }, f.name)));
  const tag = h('select', { class: 'field' }, [1, 2, 3, 4, 5, 6, 7].map(i => h('option', { value: i, selected: +k.tag === i || null }, DAYS_LONG[i % 7])));
  const von = h('input', { class: 'field', type: 'time', value: k.von }), bis = h('input', { class: 'field', type: 'time', value: k.bis });
  const raum = h('input', { class: 'field', value: k.raum || '', maxlength: 40, placeholder: L('Raum (optional)', 'Room (optional)') });
  const art = h('select', { class: 'field' }, L(['Vorlesung', 'Übung', 'Tutorium', 'Seminar', 'Lerngruppe'], ['Lecture', 'Exercise', 'Tutorial', 'Seminar', 'Study group']).map(x => h('option', { selected: x === k.art || null }, x)));
  titel.addEventListener('input', () => { if (!fach.value) { const g = M.guessFach(titel.value); if (g) fach.value = g.id; } });
  const body = h('div', { class: 'me-form' }, h('label', {}, h('span', {}, L('Kurs', 'Class')), titel), h('div', { class: 'me-row2' }, h('label', {}, h('span', {}, L('Fach', 'Subject')), fach), h('label', {}, h('span', {}, L('Art', 'Type')), art)),
    h('div', { class: 'me-row3' }, h('label', {}, h('span', {}, L('Tag', 'Day')), tag), h('label', {}, h('span', {}, L('von', 'from')), von), h('label', {}, h('span', {}, L('bis', 'to')), bis)), h('label', {}, h('span', {}, L('Raum', 'Room')), raum),
    h('p', { class: 'me-muted' }, L('Wiederholt sich jede Woche.', 'Repeats every week.')));
  const actions = [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: isNew ? L('Eintragen', 'Add') : L('Speichern', 'Save'), value: 'save', primary: true }];
  if (!isNew) actions.unshift({ label: L('Löschen', 'Delete'), value: 'del' });
  const r = await modal({ title: isNew ? L('Kurs eintragen', 'Add class') : k.titel, body, actions, onAction: v => { if (v === 'save' && (!titel.value.trim() || bis.value <= von.value)) { (titel.value.trim() ? bis : titel).focus(); return false; } } });
  if (r === 'del') return M.delKurs(k.id);
  if (r !== 'save') return;
  M.saveKurs(Object.assign(k, { titel: titel.value.trim(), fach: fach.value, tag: +tag.value, von: von.value, bis: bis.value, raum: raum.value.trim(), art: art.value }));
}
async function assignIcs(s) {
  const me = M.getMe();
  if (!me.faecher.length) { toast(L('Leg zuerst deine Fächer an – dann kann ich Termine zuordnen.', 'Add your subjects first – then I can match events.')); location.hash = '#/app/me/faecher'; return; }
  const sel = h('select', { class: 'field' }, h('option', { value: '-' }, L('– kein Fach –', '– no subject –')), me.faecher.map(f => h('option', { value: f.id, selected: s.fach?.id === f.id || null }, f.name)));
  const r = await modal({ title: s.t, text: `${DAYS_LONG[new Date(s.s).getDay()]}, ${hm(s.s)}–${hm(s.e)}${s.o ? ' · ' + s.o : ''}. ` + L('Zu welchem Fach gehört der Termin? Gilt für alle Termine mit diesem Namen.', 'Which subject is this? Applies to all events with this name.'), body: sel, actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Speichern', 'Save'), value: 'ok', primary: true }] });
  if (r === 'ok') M.setIcsFach(s.t, sel.value);
}

// ---------- Favoriten ----------
const FT = { erklaerung: [L('Erklärungen', 'Explanations'), 'chat', 'tutor'], karten: [L('Karten', 'Flashcards'), 'cards', 'karten'], quiz: ['Quiz', 'quiz', 'quiz'], zettel: [L('Lernzettel', 'Study sheets'), 'brain', 'zettel'], podcast: ['Podcast', 'pod', 'podcast'] };
function favourites(body, getF, setF) {
  const favs = M.getMe().favs, f = getF();
  const counts = {}; favs.forEach(x => counts[x.typ] = (counts[x.typ] || 0) + 1);
  const chips = h('div', { class: 'me-fchips' }, h('button', { class: 'chip' + (f === 'all' ? ' on' : ''), type: 'button', onclick: () => setF('all') }, L('Alle', 'All'), h('small', {}, String(favs.length))),
    Object.entries(FT).filter(([k]) => counts[k]).map(([k, [n]]) => h('button', { class: 'chip' + (f === k ? ' on' : ''), type: 'button', onclick: () => setF(k) }, n, h('small', {}, String(counts[k])))));
  const list = favs.filter(x => f === 'all' || x.typ === f);
  if (!favs.length) { body.append(card(null, h('div', { class: 'me-empty big' }, h('span', { class: 'me-starbig', html: '<svg viewBox="0 0 24 24"><path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>' }), h('b', {}, L('Noch nichts gemerkt', 'Nothing saved yet')), h('p', {}, L('Tipp auf den Stern bei einer Erklärung von Max, einem Kartenstapel, Quiz, Lernzettel oder Podcast – dann landet es hier.', 'Tap the star on an explanation from Max, a deck, quiz, study sheet or podcast – and it lands here.'))))); return; }
  body.append(chips, h('div', { class: 'me-favs' }, list.map(x => {
    const [, ic, tab] = FT[x.typ] || ['', 'spark', 'hub'];
    const d = x.doc && docById(x.doc);
    const open = d ? `#/app/${d.id}/${tab}` : null;
    const more = x.inhalt ? h('div', { class: 'me-fin' }, x.inhalt) : null;
    const el = h('article', { class: 'me-fav' + (more ? ' has' : '') },
      h('span', { class: 'me-fi', html: ico(ic) }),
      h('div', { class: 'me-ft' }, h('b', {}, x.titel || L('Ohne Titel', 'Untitled')), h('small', {}, [FT[x.typ]?.[0], x.docName, ago(x.ts)].filter(Boolean).join(' · ') + (!d && x.doc ? L(' · Skript auf anderem Gerät', ' · slides on another device') : '')), more),
      h('div', { class: 'me-fb' }, open ? h('a', { class: 'btn sm', href: open }, L('Öffnen', 'Open')) : null, M.starBtn(() => x)));
    if (more) el.addEventListener('click', e => { if (!e.target.closest('a,button')) el.classList.toggle('open'); });
    return el;
  })));
}

// ---------- Statistik ----------
function stats(body) {
  const days = M.activityDays(S.list);
  const st = M.streak(days);
  const keys = Object.keys(days).filter(k => days[k]).sort();
  let best = 0, run = 0, prev = null; for (const k of keys) { const d = new Date(k + 'T12:00'); run = prev && Math.round((d - prev) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  const w0 = weekMinutes(0), w1 = weekMinutes(-1);
  const ans = S.list.reduce((x, d) => x + (d.stats?.answered || 0), 0), cor = S.list.reduce((x, d) => x + (d.stats?.correct || 0), 0);
  const reps = S.list.reduce((x, d) => x + d.decks.flatMap(k => k.cards).filter(c => (c.reps || 0) > 0).length, 0);
  // Heatmap: 18 Wochen
  const W = 18, end = dayStart(); const start = new Date(end); start.setDate(end.getDate() - ((end.getDay() + 6) % 7) - (W - 1) * 7);
  const max = Math.max(1, ...Object.values(days));
  const cells = []; for (let i = 0; i < W * 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const v = days[M.dayKey(d)] || 0; const lv = d > end ? -1 : v ? Math.min(4, 1 + Math.floor(3 * v / max)) : 0; cells.push(h('i', { class: 'l' + lv, title: d > end ? '' : `${d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}: ${v ? M.fmtMin(v) : L('nichts', 'nothing')}` })); }
  const subj = M.getMe().faecher.map(f => { const ds = (f.docs || []).map(docById).filter(Boolean); return { n: f.name, m: ds.length ? Math.round(ds.reduce((x, d) => x + mastery(d), 0) / ds.length) : null }; }).filter(x => x.m != null);
  const rows = subj.length ? subj : S.list.filter(d => !d.sample).map(d => ({ n: d.name, m: mastery(d) }));
  rows.sort((a, b) => b.m - a.m);
  const trend = w1 ? Math.round(100 * (w0 - w1) / w1) : null;
  body.append(
    h('div', { class: 'me-kpis' },
      kpi(st, L('Tage Serie', 'day streak'), best > st ? L(`Rekord: ${best}`, `Record: ${best}`) : st ? L('Das ist dein Rekord.', 'That’s your record.') : L('Heute anfangen?', 'Start today?')),
      kpi(M.fmtMin(w0), L('Lernzeit diese Woche', 'Study time this week'), trend == null ? L(`Letzte Woche: ${M.fmtMin(w1)}`, `Last week: ${M.fmtMin(w1)}`) : trend >= 0 ? L(`+${trend} % zur Vorwoche`, `+${trend}% vs last week`) : L(`${trend} % zur Vorwoche`, `${trend}% vs last week`)),
      kpi(ans ? Math.round(100 * cor / ans) + ' %' : '–', L('Trefferquote', 'Accuracy'), L(`${ans} Fragen beantwortet`, `${ans} questions answered`)),
      kpi(reps, L('Karten gelernt', 'Cards learned'), L('mit Wiederholung', 'with spaced repetition'))),
    card(L('Deine letzten 18 Wochen', 'Your last 18 weeks'), h('div', { class: 'me-heat' }, cells), h('div', { class: 'me-heatl' }, h('span', {}, L('weniger', 'less')), [0, 1, 2, 3, 4].map(l => h('i', { class: 'l' + l })), h('span', {}, L('mehr', 'more')))),
    rows.length ? card(subj.length ? L('Lernstand pro Fach', 'Progress per subject') : L('Lernstand pro Skript', 'Progress per set of slides'), h('div', { class: 'me-bars' }, rows.map((r, i) => h('div', { class: 'me-br' }, h('span', {}, r.n), h('div', { class: 'me-bar big' }, h('i', { style: { width: r.m + '%' } })), h('b', {}, r.m + ' %')))),
      rows.length > 1 ? h('p', { class: 'me-muted' }, L(`Am stärksten: ${rows[0].n}. Hier lohnt sich jede Minute: ${rows[rows.length - 1].n}.`, `Strongest: ${rows[0].n}. Every minute pays off here: ${rows[rows.length - 1].n}.`)) : null) : null);
}
const kpi = (b, t, s) => h('div', { class: 'me-kpi' }, h('b', {}, String(b)), h('span', {}, t), h('small', {}, s));
