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
import * as N from '../noten.js';
import { reife } from '../reife.js';

// Drei Ziele statt fünf: Stundenplan und Gemerktes stecken in „Heute“ (Vollansicht per Link)
const TABS = [['', L('Heute', 'Today'), 'home'], ['faecher', L('Fächer & Noten', 'Subjects & grades'), 'brain'], ['stats', L('Fortschritt', 'Progress'), 'trophy']];
const SUBS = { plan: L('Stundenplan', 'Timetable'), favs: L('Gemerkt', 'Saved') };
const DAYS = L(['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
const DAYS_LONG = L(['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'], ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
const hm = t => new Date(t).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
const dayStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const daysUntil = iso => Math.round((new Date(iso + 'T12:00') - dayStart().getTime() - 12 * 3600e3) / 864e5);
const tage = n => n === 1 ? L('1 Tag', '1 day') : L(`${n} Tagen`, `${n} days`);
const docById = id => S.list.find(d => d.id === id);
// Fach-Zeile im Stundenplan nur, wenn der Kurs nicht ohnehin schon so heißt
const nrm = x => String(x || '').toLowerCase().replace(/[^a-zäöüß0-9]+/g, ' ').trim();
const sameName = (t, f) => { const a = nrm(t), b = nrm(f.name), k = nrm(f.kurz); return (b && (a.includes(b) || b.includes(a.split(' ').slice(0, 3).join(' ')))) || (k && a.split(' ').includes(k)); };
const bisZu = a => a === 'test' ? L('zum Test', 'the test') : a === 'abgabe' ? L('zur Abgabe', 'the deadline') : a === 'referat' ? L('zum Referat', 'the presentation') : L('zur Klausur', 'the exam');

export function render(root, { sub = '', onLogin } = {}) {
  const wrap = h('div', { class: 'view-in me' });
  root.appendChild(wrap);
  // Am Wochenende zeigt der Stundenplan gleich die kommende Woche
  let weekOff = [0, 6].includes(new Date().getDay()) ? 1 : 0, favFilter = 'all';
  const draw = () => {
    if (!wrap.isConnected) return;
    const a = getAccount();
    if (!a) return locked(wrap, onLogin);
    const tab = TABS.some(t => t[0] === sub) || SUBS[sub] ? sub : '';
    const body = h('div', { class: 'me-body' });
    wrap.replaceChildren(hero(a, tab !== ''), syncAsk(), SUBS[tab] ? subbar(tab) : nav(tab), body, syncCard());
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
      h('div', { class: 'me-cta' }, h('button', { class: 'btn primary lg', type: 'button', onclick: () => import('../account.js').then(m => m.openLogin({ mode: 'register' })) }, L('Konto erstellen', 'Create account')),
        h('button', { class: 'btn lg', type: 'button', onclick: () => onLogin && onLogin() }, L('Anmelden', 'Sign in')),
        h('small', {}, L('Kostenlos · dauert 30 Sekunden', 'Free · takes 30 seconds')))),
    f),
    h('div', { class: 'me-preview', 'aria-hidden': 'true' },
      ['Kostenrechnung', 'Marketing', 'Investition & Finanzierung'].map((n, i) => h('div', { class: 'me-pcard' }, h('b', {}, n), h('span', {}, L(`Klausur in ${[12, 19, 33][i]} Tagen`, `Exam in ${[12, 19, 33][i]} days`)), h('div', { class: 'me-bar' }, h('i', { style: { width: [64, 41, 22][i] + '%' } })))),
      h('div', { class: 'me-plock' }, h('span', { html: ico('lock') }), L('Mit Konto freigeschaltet', 'Unlocked with an account'))));
  const fc = face(f, {}); fc.set && fc.set('happy');
}

// ---------- Kopf: Begrüßung + Lage ----------
// Kopf: eine schmale Zeile – Gruß, Lage in einem Satz, Serie + Wochenziel. Kein Platzfresser.
function hero(a, compact = false) {
  const nick = getNick(a);
  const now = new Date();
  const days = M.activityDays(S.list), st = M.streak(days);
  const wk = weekMinutes(0);
  const f = h('div', { class: 'me-face' });
  const el = h('section', { class: 'me-hero mini' },
    f,
    h('div', { class: 'me-hl' },
      h('h1', {}, gruss(now) + (nick ? ', ' : ''), nick ? h('span', { class: 'me-nick' }, nick) : null, '.'),
      compact ? h('p', { class: 'me-brief' }, now.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })) : h('p', { class: 'me-brief' }, briefing())),
    h('div', { class: 'me-meta two' },
      h('span', { class: 'me-streak', title: L('Lerntage am Stück (ein verpasster Tag pro Woche wird überbrückt)', 'Study days in a row (one missed day per week is bridged)') }, h('b', {}, String(st)), st === 1 ? L('Tag Serie', 'day streak') : L('Tage Serie', 'day streak')),
      weekGoal(wk)));
  const fc = face(f, {}); fc.set && fc.set(st >= 3 ? 'happy' : 'idle');
  return el;
}
const stat = (b, s) => h('span', {}, h('b', {}, String(b)), s);
// Wochenziel als Balken (Länge statt Zahlenwand); antippen = Ziel ändern
function weekGoal(wk) {
  const goal = M.getMe().wochenziel || 150, pct = Math.min(100, Math.round(100 * wk / goal));
  return h('button', { class: 'me-wkgoal' + (wk >= goal ? ' done' : ''), type: 'button', title: L('Wochenziel ändern', 'Change weekly goal'), onclick: editGoal },
    h('span', { class: 'me-wkt' }, h('b', {}, M.fmtMin(wk)), L(` von ${M.fmtMin(goal)} diese Woche`, ` of ${M.fmtMin(goal)} this week`)),
    h('span', { class: 'me-wkbar' }, h('i', { style: { width: pct + '%' } })));
}
async function editGoal() {
  const cur = M.getMe().wochenziel || 150;
  const opts = [60, 90, 120, 150, 210, 300, 420, 600];
  const sel = h('div', { class: 'me-goals' }, opts.map(m => h('button', { class: 'chip' + (m === cur ? ' on' : ''), type: 'button', onclick: e => { sel.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); sel.dataset.v = m; } }, M.fmtMin(m))));
  sel.dataset.v = cur;
  const r = await modal({ title: L('Wie viel willst du pro Woche lernen?', 'How much do you want to study per week?'), text: L('Faustregel: 1 ECTS ≈ 25–30 Stunden Arbeit. Lieber realistisch starten und steigern.', 'Rule of thumb: 1 ECTS ≈ 25–30 hours of work. Start realistic, then raise it.'), body: sel, actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Speichern', 'Save'), value: 'ok', primary: true }] });
  if (r === 'ok') M.updateMe(m => { m.wochenziel = +sel.dataset.v; });
}
function subbar(tab) {
  return h('div', { class: 'me-subbar' }, h('a', { class: 'btn sm ghost', href: '#/app/me' }, h('span', { html: ico('left') }), L('Heute', 'Today')), h('b', {}, SUBS[tab]));
}
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
  if (ex && ex.days >= 0 && ex.days <= 45) { const an = M.artName(ex.art); parts.push(ex.days === 0 ? L(`Heute ist ${ex.name}-${an}. Du packst das.`, `${ex.name} ${an.toLowerCase()} today. You’ve got this.`) : L(`${ex.name}-${an} in ${tage(ex.days)}${ex.m != null ? ` – Prüfungsreife ${ex.m} %` : ''}.`, `${ex.name} ${an.toLowerCase()} in ${tage(ex.days)}${ex.m != null ? ` – readiness ${ex.m}%` : ''}.`)); }
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
    const rf = ds.length ? reife(ds, new Date(iso + 'T08:00').getTime()) : null;
    out.push({ name: f.name, iso, days: daysUntil(iso), m: rf && rf.hasData ? rf.score : null, fach: f, doc: ds[0], art: f.klausur ? (f.klausurArt || 'klausur') : 'klausur' });
  }
  for (const d of S.list) if (!seen.has(d.id) && d.plan?.exam) { const rf = reife([d], new Date(d.plan.exam + 'T08:00').getTime()); out.push({ name: d.name, iso: d.plan.exam, days: daysUntil(d.plan.exam), m: rf.hasData ? rf.score : null, doc: d, art: 'klausur' }); }
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
  const me = M.getMe();
  const now = Date.now();
  const recs = recommend(), top = recs[0], alts = recs.slice(1, 4);
  // 1) Startcheckliste (startet nicht bei null – das Konto ist schon erledigt)
  const check = startChecklist();
  if (check) body.append(check);
  // 2) Jetzt dran: ein Knopf, mit Grund und Dauer; „Etwas anderes“ zeigt höchstens drei Alternativen
  if (top) {
    const alt = h('div', { class: 'me-alts', hidden: true }, alts.map(r => h('a', { class: 'me-rec', href: r.href, onclick: r.onclick || null },
      h('span', { class: 'me-ri', html: ico(r.ic) }), h('span', { class: 'me-rt' }, h('b', {}, r.t), h('small', {}, r.s + (r.min ? L(` · ca. ${r.min} Min.`, ` · ~${r.min} min`) : ''))), h('span', { class: 'me-ra', html: ico('right') }))));
    const other = alts.length ? h('button', { class: 'me-next-o', type: 'button', onclick: e => { alt.hidden = !alt.hidden; e.currentTarget.textContent = alt.hidden ? L('Etwas anderes', 'Something else') : L('Weniger', 'Less'); } }, L('Etwas anderes', 'Something else')) : null;
    body.append(h('section', { class: 'me-next' },
      h('div', { class: 'me-next-i', html: ico(top.ic) }),
      h('div', { class: 'me-next-t' }, h('div', { class: 'eyebrow' }, L('Jetzt dran', 'Up next') + (top.min ? L(` · ca. ${top.min} Min.`, ` · ~${top.min} min`) : '')), h('h2', {}, top.t), h('p', {}, top.s)),
      h('div', { class: 'me-next-a' }, h('a', { class: 'btn primary lg me-next-b', href: top.href, onclick: top.onclick || null }, L('Los geht’s', 'Let’s go'), h('span', { html: ico('right') })), other)), alt);
  }
  // 2b) Fortschritt auf einen Blick – was du schon geschafft hast
  body.append(progressStrip());
  // 3) Heute im Stundenplan (Streifen) + Demnächst | Gemerkt + Zuletzt geöffnet
  const ses = M.sessionsOn(new Date()), up = ses.filter(s => s.e > now);
  const tm = new Date(); tm.setDate(tm.getDate() + 1);
  const ses2 = up.length ? [] : M.sessionsOn(tm);
  const hasPlan = me.kurse.length || me.ics.events?.length;
  const showToday = up.length || !ses2.length;
  const strip = !hasPlan
    ? h('div', { class: 'me-empty' }, h('p', {}, L('Verbinde deinen Stundenplan – dann sag ich dir jeden Morgen, was ansteht, und plane Lernzeit in die Lücken.', 'Connect your timetable – I’ll tell you every morning what’s on and plan study time into the gaps.')), h('a', { class: 'btn sm', href: '#/app/me/plan' }, L('Stundenplan verbinden', 'Connect timetable')))
    : up.length ? h('div', { class: 'me-sessions' }, ses.map(s => session(s, now)))
    : ses2.length ? h('div', { class: 'me-sessions' }, h('div', { class: 'me-note' }, ses.length ? L('Für heute bist du durch. Morgen steht an:', 'You’re done for today. Tomorrow:') : L('Heute frei. Morgen steht an:', 'Free today. Tomorrow:')), ses2.map(s => session(s, now)))
    : h('div', { class: 'me-empty' }, h('p', {}, ses.length ? L('Für heute bist du durch. Morgen ist frei.', 'You’re done for today. Tomorrow is free.') : L('Heute keine Vorlesungen. Zeit für dich – oder für Karteikarten.', 'No lectures today. Time for you – or for flashcards.')));
  const ex = exams().filter(e => e.days <= 60).slice(0, 4);
  const soon = ex.length ? h('div', { class: 'me-exams' }, ex.map(e => {
    const rf = e.fach ? reife((e.fach.docs || []).map(docById).filter(Boolean), new Date(e.iso + 'T08:00').getTime()) : e.doc ? reife([e.doc], new Date(e.iso + 'T08:00').getTime()) : null;
    return h('a', { class: 'me-exam', href: e.doc ? `#/app/${e.doc.id}/plan` : '#/app/me/faecher' },
      h('div', { class: 'me-exn' }, h('b', {}, String(e.days)), h('span', {}, e.days === 1 ? L('Tag', 'day') : L('Tage', 'days'))),
      h('div', { class: 'me-ext' }, h('b', {}, e.name), h('small', {}, new Date(e.iso + 'T12:00').toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' }) + (rf && rf.hasData ? L(` · Prüfungsreife ${rf.score} %`, ` · readiness ${rf.score}%`) : '')),
        rf && rf.hasData ? h('div', { class: 'me-bar' }, h('i', { style: { width: rf.score + '%' } })) : null));
  })) : h('div', { class: 'me-empty' }, h('p', {}, L('Keine Klausur in den nächsten 60 Tagen eingetragen. Trag deine Termine bei den Fächern ein – dann zähl ich runter und plan mit.', 'No exam in the next 60 days. Add your dates to your subjects – I’ll count down and plan along.')), h('a', { class: 'btn sm', href: '#/app/me/faecher' }, L('Klausurtermine eintragen', 'Add exam dates')));
  const favs = me.favs.slice(0, 3);
  const recent = S.list.filter(d => !d.sample).sort((a, b) => (b.used || 0) - (a.used || 0)).slice(0, 3);
  body.append(h('div', { class: 'me-grid two' },
    h('div', { class: 'me-col2' },
      card(showToday ? L('Heute', 'Today') : L('Morgen', 'Tomorrow'), strip, hasPlan ? h('a', { class: 'me-more', href: '#/app/me/plan' }, L('Ganze Woche', 'Full week'), h('span', { html: ico('right') })) : null),
      card(L('Demnächst', 'Coming up'), soon)),
    h('div', { class: 'me-col2' },
      recent.length ? card(L('Zuletzt geöffnet', 'Recently opened'), h('div', { class: 'me-mini' }, recent.map(d => h('a', { class: 'me-mi', href: `#/app/${d.id}/hub` }, h('span', { class: 'me-fi', html: ico('file') }), h('span', {}, h('b', {}, d.name), h('small', {}, ago(d.used || d.created))))))) : null,
      card(L('Gemerkt', 'Saved'), favs.length ? h('div', { class: 'me-mini' }, favs.map(x => { const d = x.doc && docById(x.doc); const tab = (FT[x.typ] || [])[2] || 'hub'; return h('a', { class: 'me-mi', href: d ? `#/app/${d.id}/${tab}` : '#/app/me/favs' }, h('span', { class: 'me-fi', html: ico((FT[x.typ] || [])[1] || 'spark') }), h('span', {}, h('b', {}, x.titel || L('Ohne Titel', 'Untitled')), h('small', {}, [FT[x.typ]?.[0], x.docName].filter(Boolean).join(' · ')))); }))
        : h('div', { class: 'me-empty' }, h('p', {}, L('Tipp auf den Stern bei einer Erklärung, einem Quiz oder Kartenstapel – dann liegt es hier griffbereit.', 'Tap the star on an explanation, quiz or deck – it’ll be right here.'))),
        me.favs.length > 3 ? h('a', { class: 'me-more', href: '#/app/me/favs' }, L(`Alle ${me.favs.length} ansehen`, `See all ${me.favs.length}`), h('span', { html: ico('right') })) : null))));
}
// Start in vier Schritten – verschwindet, sobald erledigt oder ausgeblendet
function startChecklist() {
  const me = M.getMe();
  if (me.startOk) return null;
  const own = S.list.filter(d => !d.sample);
  const steps = [
    { ok: true, t: L('Konto erstellt', 'Account created') },
    { ok: own.length > 0, t: L('Erstes Skript hochladen', 'Upload your first slides'), go: () => document.getElementById('fileApp')?.click() },
    { ok: me.faecher.some(f => f.klausur) || own.some(d => d.plan?.exam), t: L('Klausurtermin eintragen', 'Add an exam date'), go: () => { location.hash = '#/app/me/faecher'; } },
    { ok: !!(me.kurse.length || me.ics.events?.length), t: L('Stundenplan verbinden', 'Connect your timetable'), go: () => { location.hash = '#/app/me/plan'; } },
    { ok: own.some(d => d.decks.some(k => k.cards.some(c => c.reps))), t: L('Erste Karteikarten lernen', 'Study your first flashcards'), go: () => { location.hash = own[0] ? `#/app/${own[0].id}/karten` : '#/app'; if (!own[0]) document.getElementById('fileApp')?.click(); } }
  ];
  const done = steps.filter(x => x.ok).length;
  if (done === steps.length) { M.updateMe(m => { m.startOk = Date.now(); }, { quiet: true }); return null; }
  const next = steps.find(x => !x.ok);
  return h('section', { class: 'me-start' },
    h('div', { class: 'me-st-h' }, h('b', {}, L('Dein Start', 'Getting started')), h('span', {}, L(`${done} von ${steps.length}`, `${done} of ${steps.length}`)),
      h('button', { class: 'linkbtn', type: 'button', onclick: () => M.updateMe(m => { m.startOk = Date.now(); }) }, L('Ausblenden', 'Hide'))),
    h('div', { class: 'me-bar' }, h('i', { style: { width: Math.round(100 * done / steps.length) + '%' } })),
    h('ol', { class: 'me-steps' }, steps.map(x => h('li', { class: x.ok ? 'ok' : x === next ? 'next' : '' },
      h('span', { class: 'me-sti', html: x.ok ? ico('check') : '' }),
      x.ok || !x.go ? h('span', {}, x.t) : h('button', { class: 'linkbtn', type: 'button', onclick: x.go }, x.t)))));
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
  if (urgent) { const hasCards = urgent.doc.decks.some(k => k.cards.length); out.push({ min: 25, ic: hasCards ? 'cards' : 'calendar', t: L(`${urgent.name}: Reife hochziehen`, `${urgent.name}: boost readiness`), s: L(`${M.artName(urgent.art)} in ${tage(urgent.days)} · Prüfungsreife ${urgent.m} %. 25 Minuten heute bringen dich spürbar nach vorn.`, `Exam in ${tage(urgent.days)} · readiness ${urgent.m}%. 25 minutes today move you forward noticeably.`), href: `#/app/${urgent.doc.id}/${hasCards ? 'karten' : 'plan'}` }); }
  for (const d of S.list) { const p = d.plan ? planSummary(d) : null; if (p && p.daysLeft >= 0 && p.todayOpen?.length) { out.push({ min: p.todayMin || 20, ic: 'exam', t: L(`Heute im Plan: ${d.name}`, `Today’s plan: ${d.name}`), s: L(`${p.todayOpen.length} ${p.todayOpen.length === 1 ? 'Aufgabe' : 'Aufgaben'} · ~${p.todayMin} Min.`, `${p.todayOpen.length} ${p.todayOpen.length === 1 ? 'task' : 'tasks'} · ~${p.todayMin} min`), href: `#/app/${d.id}/plan` }); break; } }
  if (byDue.length) { const n = byDue.reduce((x, y) => x + y.n, 0); out.push({ min: Math.max(2, Math.round(n * 0.4)), ic: 'cards', t: L(`${n} Karten wiederholen`, `Review ${n} cards`), s: L(`Am meisten in „${byDue[0].d.name}“. Wiederholen ist kostenlos.`, `Most in “${byDue[0].d.name}”. Reviewing is free.`), href: `#/app/${byDue[0].d.id}/karten` }); }
  for (const e of ex.filter(e => e.days <= 60 && e.fach)) {
    const ds = (e.fach.docs || []).map(docById).filter(Boolean);
    if (!ds.length) { out.push({ ic: 'upload', t: L(`${e.name}: Stoff hochladen`, `${e.name}: upload material`), s: L(`Klausur in ${tage(e.days)}, aber noch kein Skript drin. Lad es hoch, dann plan ich mit.`, `Exam in ${tage(e.days)}, but no slides yet. Upload them and I’ll plan along.`), href: '#/app', onclick: ev => { ev.preventDefault(); document.getElementById('fileApp')?.click(); } }); continue; }
    const np = ds.find(d => !d.plan);
    if (np) out.push({ ic: 'calendar', t: L(`Klausurplan für ${e.name}`, `Exam plan for ${e.name}`), s: L(`${tage(e.days)} bis zur Klausur – ich teil dir den Stoff Tag für Tag auf. Kostenlos.`, `${tage(e.days)} to go – I’ll split the material day by day. Free.`), href: `#/app/${np.id}/plan` });
    const nk = ds.find(d => !d.decks.length);
    if (nk) out.push({ ic: 'cards', t: L(`Karteikarten für ${e.name}`, `Flashcards for ${e.name}`), s: L('Einmal erstellen, dann jeden Tag ein paar Minuten wiederholen – kostenlos.', 'Create once, then review a few minutes a day – free.'), href: `#/app/${nk.id}/karten` });
  }
  const mis = S.list.filter(d => d.mistakes?.length).sort((a, b) => b.mistakes.length - a.mistakes.length)[0];
  if (mis) out.push({ min: Math.max(3, Math.round(mis.mistakes.length * 0.7)), ic: 'quiz', t: L(`${mis.mistakes.length} Fehler ausbügeln`, `Fix ${mis.mistakes.length} mistakes`), s: L(`Aus „${mis.name}“. Genau da holt man in der Klausur Punkte.`, `From “${mis.name}”. That’s where exam points are.`), href: `#/app/${mis.id}/quiz` });
  const nxt = S.list.find(d => d.path?.chapters?.some(c => !c.done));
  if (nxt) { const i = nxt.path.chapters.findIndex(c => !c.done); out.push({ min: 15, ic: 'path', t: L(`Weiter: ${nxt.path.chapters[i].title}`, `Next: ${nxt.path.chapters[i].title}`), s: L(`Lernpfad „${nxt.name}“ · Kapitel ${i + 1} von ${nxt.path.chapters.length}`, `Study path “${nxt.name}” · chapter ${i + 1} of ${nxt.path.chapters.length}`), href: `#/app/${nxt.id}/pfad/${i}` }); }
  if (!S.list.length) out.push({ ic: 'upload', t: L('Erstes Skript hochladen', 'Upload your first slides'), s: L('PDF, PowerPoint oder Word – ich mach Quiz, Karten und Lernpfad draus.', 'PDF, PowerPoint or Word – I’ll turn it into quizzes, cards and a study path.'), href: '#/app', onclick: e => { e.preventDefault(); document.getElementById('fileApp')?.click(); } });
  if (!me.faecher.length) out.push({ ic: 'brain', t: L('Fächer anlegen', 'Add your subjects'), s: L('Mit Klausurdatum – dann zähl ich runter und weiß, was Vorrang hat.', 'With exam dates – so I can count down and prioritise.'), href: '#/app/me/faecher' });
  if (!me.kurse.length && !me.ics.events?.length) out.push({ ic: 'calendar', t: L('Stundenplan verbinden', 'Connect your timetable'), s: L('Link aus dem Uni-Portal einfügen – dauert 30 Sekunden.', 'Paste the link from your uni portal – takes 30 seconds.'), href: '#/app/me/plan' });
  out.push({ min: 10, ic: 'whistle', t: L('10 Minuten BWL-Trainer', '10 minutes of the trainer'), s: L('Buchungssätze, Break-even, Kapitalwert – unbegrenzt.', 'Entries, break-even, NPV – unlimited.'), href: '#/app/trainer' });
  return out.slice(0, 5);
}

// ---------- Fächer & Noten ----------
function subjects(body) {
  const me = M.getMe();
  body.append(notenCard());
  const grid = h('div', { class: 'me-subj' });
  for (const f of me.faecher) {
    const ds = (f.docs || []).map(docById).filter(Boolean);
    const iso = f.klausur || ds.map(d => d.plan?.exam).filter(Boolean).sort()[0];
    const dl = iso ? daysUntil(iso) : null;
    const rf = reife(ds, iso ? new Date(iso + 'T08:00').getTime() : 0);
    const graded = (me.noten?.module || []).find(m => m.fach === f.id);
    // Nächster Schritt fürs Fach: schwache oder fällige Karten → Karten, sonst Quiz, sonst Skript zuordnen
    const d0 = ds[0];
    const step = !ds.length ? null
      : rf.weak || rf.due ? { t: L(`${Math.max(rf.weak, rf.due)} Karten festigen`, `Strengthen ${Math.max(rf.weak, rf.due)} cards`), href: `#/app/${d0.id}/karten` }
      : rf.neu ? { t: L(`${rf.neu} neue Karten lernen`, `Learn ${rf.neu} new cards`), href: `#/app/${d0.id}/karten` }
      : !rf.cards ? { t: L('Karteikarten erstellen', 'Create flashcards'), href: `#/app/${d0.id}/karten` }
      : { t: L('Quiz zur Kontrolle', 'Check yourself with a quiz'), href: `#/app/${d0.id}/quiz` };
    grid.append(h('article', { class: 'me-sc' },
      h('div', { class: 'me-sch' }, h('span', { class: 'me-badge' }, (f.kurz || f.name).slice(0, 3).toUpperCase()), h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Bearbeiten', 'Edit'), html: ico('tune'), onclick: () => editFach(f) })),
      h('h3', {}, f.name),
      h('div', { class: 'me-scd' }, graded ? h('span', {}, L('Note ', 'Grade '), h('b', {}, N.fmt(+graded.note))) : dl == null ? h('span', { class: 'me-muted' }, L('Kein Klausurtermin', 'No exam date')) : dl < 0 ? h('span', { class: 'me-muted' }, L(`${M.artName(f.klausurArt)} vorbei`, `${M.artName(f.klausurArt)} over`)) : h('span', {}, h('b', {}, String(dl)), (dl === 1 ? L(' Tag bis ', ' day to ') : L(' Tage bis ', ' days to ')) + bisZu(f.klausurArt))),
      rf.hasData ? h('div', { class: 'me-rf' },
        h('div', { class: 'me-rft' }, h('span', {}, L('Prüfungsreife', 'Exam readiness')), h('b', {}, rf.score + ' %')),
        h('div', { class: 'me-bar big' }, h('i', { style: { width: rf.score + '%' } })),
        h('small', { class: 'me-muted' }, rf.themen ? L(`${rf.fest} von ${rf.themen} Themen sitzen am Klausurtag sicher`, `${rf.fest} of ${rf.themen} topics will be secure on exam day`) : L('Lern Karten oder mach ein Quiz – dann sehe ich, was sitzt.', 'Study cards or take a quiz – then I can see what sticks.'))) : null,
      h('div', { class: 'me-scm' }, rf.due ? h('span', {}, L(`${rf.due} Karten fällig`, `${rf.due} cards due`)) : null, f.ects ? h('span', {}, f.ects + ' ECTS') : null,
        ...M.termineOf(f).filter(t => t.datum >= M.dayKey() && t.datum !== f.klausur).slice(0, 2).map(t => h('span', {}, M.artName(t.art) + ' ' + new Date(t.datum + 'T12:00').toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })))),
      step ? h('a', { class: 'btn sm primary me-scstep', href: step.href }, step.t, h('span', { html: ico('right') })) : null,
      dl != null && dl < 0 && !graded ? h('button', { class: 'btn sm', type: 'button', onclick: () => editNote({ name: f.name, ects: f.ects || '', fach: f.id }) }, L('Note eintragen', 'Add grade')) : null,
      h('div', { class: 'me-scdocs' }, ds.length ? ds.map(d => h('a', { class: 'chip', href: `#/app/${d.id}/hub` }, h('span', { html: ico('file') }), d.name.length > 26 ? d.name.slice(0, 25) + '…' : d.name))
        : h('button', { class: 'chip', type: 'button', onclick: () => editFach(f) }, h('span', { html: ico('plus') }), L('Skripte zuordnen', 'Assign slides')))));
  }
  grid.append(h('button', { class: 'me-sc me-scadd', type: 'button', onclick: () => editFach(null) }, h('span', { html: ico('plus') }), h('b', {}, L('Fach anlegen', 'Add subject')), h('small', {}, L('z. B. Kostenrechnung, Klausur am 12.02.', 'e.g. Cost accounting, exam on 12 Feb'))));
  const loose = S.list.filter(d => !d.sample && !M.fachOf(d.id));
  body.append(grid, loose.length && me.faecher.length ? h('div', { class: 'me-note' }, L(`${loose.length} ${loose.length === 1 ? 'Skript ist' : 'Skripte sind'} noch keinem Fach zugeordnet.`, `${loose.length} ${loose.length === 1 ? 'set of slides isn’t' : 'sets of slides aren’t'} assigned to a subject yet.`)) : null);
}

// ---------- Notenziel: „Welche Note brauche ich noch?“ ----------
const noten = () => { const n = M.getMe().noten || {}; return { profil: Object.assign(N.defaultProfil(), n.profil || {}), module: n.module || [], ziel: n.ziel || 2.0 }; };
function notenCard() {
  const { profil: p, module: mods, ziel } = noten();
  const st = N.stand(mods);
  const intro = h('p', { class: 'me-muted' }, L('Rechnet wie die meisten Prüfungsordnungen: nach ECTS gewichtet und nach der ersten Nachkommastelle abgeschnitten. Deine Noten bleiben bei dir – auf diesem Gerät bzw. in deinem Konto, wenn du synchronisierst.', 'Calculated like most exam regulations: ECTS-weighted and truncated after the first decimal. Your grades stay with you – on this device, or in your account if you sync.'));
  if (!st.n) return card(L('Notenziel', 'Grade goal'), h('div', { class: 'me-empty' },
    h('p', {}, L('Trag deine bisherigen Noten ein – dann rechne ich aus, was du für deine Wunschnote noch brauchst und welche Module am meisten bewegen.', 'Add your grades so far – I’ll work out what you still need for your target grade and which modules move it most.')),
    h('div', { class: 'me-row-b' }, h('button', { class: 'btn sm primary', type: 'button', onclick: () => editNote(null) }, h('span', { html: ico('plus') }), L('Erste Note eintragen', 'Add first grade')), h('button', { class: 'btn sm ghost', type: 'button', onclick: editProfil }, L('Prüfungsordnung', 'Exam regulations')))), intro);
  const cur = N.cut(st.exakt, p.stellen);
  const zielSel = h('select', { class: 'field me-zsel', 'aria-label': L('Wunschnote', 'Target grade') }, [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.3, 3.5, 4.0].map(z => h('option', { value: z, selected: Math.abs(z - ziel) < 1e-9 || null }, N.fmt(z))));
  zielSel.addEventListener('change', () => M.updateMe(m => { m.noten = Object.assign({}, m.noten, { ziel: +zielSel.value }); }));
  const b = N.benoetigt(p, mods, ziel);
  const open = M.getMe().faecher.filter(f => f.ects && !mods.some(m => m.fach === f.id));
  let verdict;
  if (b.fertig) verdict = L(`Alle ECTS sind drin – dein Schnitt ist ${N.fmt(cur)}.`, `All credits are in – your average is ${N.fmt(cur)}.`);
  else if (b.sicher) verdict = L(`Entspannt: Die ${N.fmt(ziel)} schaffst du sogar mit lauter 4,0.`, `Relax: you’ll get ${N.fmt(ziel)} even with straight 4.0s.`);
  else if (!b.machbar) verdict = L(`Die ${N.fmt(ziel)} ist leider nicht mehr drin. Mit lauter 1,0 kämst du auf ${N.fmt(b.bestMoeglich)}.`, `${N.fmt(ziel)} is out of reach. With straight 1.0s you’d get ${N.fmt(b.bestMoeglich)}.`);
  else {
    const k = Math.max(1, Math.min(6, Math.round(b.Erem / 6))), combo = N.kombi(b.r, k);
    verdict = h('span', {}, L(`Für eine ${N.fmt(ziel)} brauchst du in den offenen ${b.Erem} ECTS einen Schnitt besser als `, `For a ${N.fmt(ziel)} you need an average better than `), h('b', {}, N.fmt(b.r, 2)), L(b.Erem ? '' : '', ` in the remaining ${b.Erem} ECTS`), '.',
      combo ? h('small', { class: 'me-muted me-combo' }, L(`Zum Beispiel bei ${k} gleich großen Prüfungen: `, `For example across ${k} equally weighted exams: `) + combo.map(x => N.fmt(x)).join(' · ')) : null);
  }
  const lever = open.slice().sort((a, c) => (+c.ects) - (+a.ects)).slice(0, 3).map(f => h('li', {}, h('b', {}, f.name), L(` (${f.ects} ECTS): eine Notenstufe besser = `, ` (${f.ects} ECTS): one grade step better = `), h('b', {}, N.fmtHebel(N.hebel(p, +f.ects))), L(' besserer Endschnitt', ' better final grade')));
  if (p.thesis || p.aThesis) lever.push(h('li', {}, h('b', {}, L('Abschlussarbeit', 'Thesis')), L(': eine Notenstufe besser = ', ': one grade step better = '), h('b', {}, N.fmtHebel(N.hebelThesis(p))), L(' besserer Endschnitt', ' better final grade')));
  const list = h('details', { class: 'me-nlist' }, h('summary', {}, L(`${st.n} ${st.n === 1 ? 'Note' : 'Noten'} · ${st.E} ECTS`, `${st.n} ${st.n === 1 ? 'grade' : 'grades'} · ${st.E} ECTS`)),
    h('div', { class: 'me-nrows' }, mods.slice().sort((a, c) => (c.ts || 0) - (a.ts || 0)).map(m => h('button', { class: 'me-nrow', type: 'button', onclick: () => editNote(m) }, h('span', {}, m.name), h('small', {}, (m.ects || '–') + ' ECTS'), h('b', {}, +m.note > 4 ? L('n. b.', 'fail') : N.fmt(+m.note))))));
  return card(L('Notenziel', 'Grade goal'),
    h('div', { class: 'me-ng' },
      h('div', { class: 'me-nbig' }, h('small', {}, L('Dein Schnitt', 'Your average')), h('b', {}, N.fmt(cur)), h('span', { class: 'me-muted' }, L(`exakt ${N.fmt(st.exakt, 2)} · ${N.praedikat(cur)}`, `exact ${N.fmt(st.exakt, 2)} · ${N.praedikat(cur)}`)),
        h('div', { class: 'me-bar' }, h('i', { style: { width: Math.min(100, Math.round(100 * st.E / p.gesamt)) + '%' } })), h('small', { class: 'me-muted' }, L(`${st.E} von ${p.gesamt} ECTS benotet`, `${st.E} of ${p.gesamt} ECTS graded`))),
      h('div', { class: 'me-nz' }, h('label', { class: 'me-zl' }, L('Wunschnote', 'Target grade'), zielSel), h('p', { class: 'me-verdict' }, verdict),
        lever.length ? h('div', {}, h('div', { class: 'me-lab' }, L('Wo sich Aufwand lohnt', 'Where effort pays off')), h('ul', { class: 'me-lever' }, lever)) : null)),
    list,
    h('div', { class: 'me-row-b' }, h('button', { class: 'btn sm', type: 'button', onclick: () => editNote(null) }, h('span', { html: ico('plus') }), L('Note eintragen', 'Add grade')), h('button', { class: 'btn sm ghost', type: 'button', onclick: editProfil }, L('Prüfungsordnung: ', 'Regulations: ') + (p.mode === 'anteil' ? L('mit Anteilen', 'with shares') : L('ECTS-gewichtet', 'ECTS-weighted')) + ` · ${p.gesamt} ECTS`)),
    h('p', { class: 'me-muted me-fine' }, L('Orientierung, keine verbindliche Auskunft – maßgeblich ist deine Prüfungsordnung.', 'Guidance only – your exam regulations are binding.')));
}
async function editNote(m) {
  const isNew = !m || !m.id; m = Object.assign({ name: '', ects: '', note: '' }, m || {});
  const name = h('input', { class: 'field', value: m.name, maxlength: 80, placeholder: L('Modul, z. B. Kostenrechnung', 'Module, e.g. Cost accounting'), list: 'me-mods' });
  const dl = h('datalist', { id: 'me-mods' }, M.getMe().faecher.map(f => h('option', { value: f.name })));
  const ects = h('input', { class: 'field', type: 'number', min: 1, max: 30, step: 0.5, value: m.ects, placeholder: 'ECTS', inputmode: 'decimal' });
  const note = h('select', { class: 'field' }, h('option', { value: '' }, L('– Note –', '– grade –')), [...N.NOTEN.map(n => [n, N.fmt(n)]), [5.0, L('5,0 (nicht bestanden)', '5.0 (fail)')]].map(([v, t]) => h('option', { value: v, selected: +m.note === v || null }, t)));
  name.addEventListener('input', () => { const f = M.getMe().faecher.find(x => x.name === name.value); if (f && f.ects && !ects.value) ects.value = f.ects; });
  const body = h('div', { class: 'me-form' }, dl, h('label', {}, h('span', {}, L('Modul', 'Module')), name), h('div', { class: 'me-row2' }, h('label', {}, h('span', {}, 'ECTS'), ects), h('label', {}, h('span', {}, L('Note', 'Grade')), note)));
  const actions = [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Speichern', 'Save'), value: 'save', primary: true }];
  if (!isNew) actions.unshift({ label: L('Löschen', 'Delete'), value: 'del' });
  const r = await modal({ title: isNew ? L('Note eintragen', 'Add grade') : m.name, body, actions, onAction: v => { if (v !== 'save') return; if (!name.value.trim()) { name.focus(); return false; } if (!(+ects.value > 0)) { ects.focus(); return false; } if (!note.value) { note.focus(); return false; } } });
  if (!r) return;
  M.updateMe(me => {
    const n = me.noten = Object.assign({ module: [] }, me.noten); n.module = (n.module || []).slice();
    if (r === 'del') { n.module = n.module.filter(x => x.id !== m.id); return; }
    const fach = m.fach || (me.faecher.find(f => f.name === name.value.trim()) || {}).id || '';
    const rec = { id: m.id || uid(), name: name.value.trim().slice(0, 80), ects: +ects.value, note: +note.value, fach, ts: m.ts || Date.now() };
    const i = n.module.findIndex(x => x.id === rec.id); if (i >= 0) n.module[i] = rec; else n.module.push(rec);
  });
  if (r === 'save' && isNew) toast(L('Eingetragen.', 'Added.'));
}
async function editProfil() {
  const p = noten().profil;
  const mode = h('select', { class: 'field' }, h('option', { value: 'ects', selected: p.mode !== 'anteil' || null }, L('Alles nach ECTS gewichtet (Standard)', 'Everything ECTS-weighted (standard)')), h('option', { value: 'anteil', selected: p.mode === 'anteil' || null }, L('Module + Thesis + Kolloquium mit festen Anteilen', 'Modules + thesis + colloquium with fixed shares')));
  const ges = h('select', { class: 'field' }, [180, 210, 240, 90, 120].map(x => h('option', { value: x, selected: +p.gesamt === x || null }, x + ' ECTS')));
  const th = h('input', { class: 'field', type: 'number', min: 0, max: 30, value: p.thesis || 12 });
  const ko = h('input', { class: 'field', type: 'number', min: 0, max: 15, value: p.kolloq || 0 });
  const aT = h('input', { class: 'field', type: 'number', min: 0, max: 50, value: p.aThesis || 15 });
  const aK = h('input', { class: 'field', type: 'number', min: 0, max: 30, value: p.aKolloq || 5 });
  const shares = h('div', { class: 'me-row2' }, h('label', {}, h('span', {}, L('Anteil Thesis in %', 'Thesis share %')), aT), h('label', {}, h('span', {}, L('Anteil Kolloquium in %', 'Colloquium share %')), aK));
  const sync = () => { shares.hidden = mode.value !== 'anteil'; }; mode.addEventListener('change', sync); sync();
  const tpl = h('button', { class: 'linkbtn', type: 'button', onclick: () => { const t = N.PROFILE.hsb; mode.value = t.mode; ges.value = t.gesamt; th.value = t.thesis; ko.value = t.kolloq; aT.value = t.aThesis; aK.value = t.aKolloq; sync(); } }, L('Vorlage: 80 % Module · 15 % Thesis · 5 % Kolloquium', 'Template: 80% modules · 15% thesis · 5% colloquium'));
  const body = h('div', { class: 'me-form' }, h('label', {}, h('span', {}, L('Berechnung', 'Calculation')), mode), h('label', {}, h('span', {}, L('Studiengang gesamt', 'Programme total')), ges),
    h('div', { class: 'me-row2' }, h('label', {}, h('span', {}, L('ECTS Thesis', 'Thesis ECTS')), th), h('label', {}, h('span', {}, L('ECTS Kolloquium', 'Colloquium ECTS')), ko)), shares, tpl,
    h('p', { class: 'me-muted' }, L('Steht in deiner Prüfungsordnung meist unter „Bildung der Gesamtnote“. Die Endnote wird nach der ersten Nachkommastelle abgeschnitten.', 'Usually under “calculation of the final grade” in your regulations. The final grade is truncated after the first decimal.')));
  const r = await modal({ title: L('Deine Prüfungsordnung', 'Your exam regulations'), body, actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Speichern', 'Save'), value: 'ok', primary: true }] });
  if (r !== 'ok') return;
  M.updateMe(m => { m.noten = Object.assign({}, m.noten, { profil: { key: mode.value === 'anteil' ? 'eigen' : 'ects', mode: mode.value, gesamt: +ges.value, thesis: +th.value || 0, kolloq: +ko.value || 0, aThesis: +aT.value || 0, aKolloq: +aK.value || 0, stellen: 1 } }); });
}
async function editFach(f) {
  const isNew = !f; f = f ? JSON.parse(JSON.stringify(f)) : { name: '', kurz: '', klausur: '', ects: '', docs: [] };
  const name = h('input', { class: 'field', value: f.name, maxlength: 60, placeholder: L('Name, z. B. Kostenrechnung', 'Name, e.g. Cost accounting') });
  const kurz = h('input', { class: 'field', value: f.kurz || '', maxlength: 12, placeholder: L('Kürzel (optional), z. B. KLR', 'Short name (optional)') });
  const date = h('input', { class: 'field', type: 'date', value: f.klausur || '' });
  const artSel = h('select', { class: 'field me-artsel', 'aria-label': L('Art', 'Type') }, [['klausur', L('Klausur', 'Exam')], ['test', L('Test', 'Test')]].map(([v, t]) => h('option', { value: v, selected: (f.klausurArt || 'klausur') === v || null }, t)));
  const ects = h('input', { class: 'field', type: 'number', min: 0, max: 30, value: f.ects || '', placeholder: 'ECTS' });
  const docs = S.list.filter(d => !d.sample);
  const checks = docs.map(d => { const other = M.getMe().faecher.find(x => x.id !== f.id && (x.docs || []).includes(d.id)); const c = h('input', { type: 'checkbox', checked: (f.docs || []).includes(d.id) || null }); return [d, c, h('label', { class: 'me-chk' }, c, h('span', {}, d.name), other ? h('small', {}, L(`bei ${other.name}`, `in ${other.name}`)) : null)]; });
  const body = h('div', { class: 'me-form' },
    h('label', {}, h('span', {}, L('Fach', 'Subject')), name),
    h('div', { class: 'me-row2' }, h('label', {}, h('span', {}, L('Kürzel', 'Short name')), kurz), h('label', {}, h('span', {}, 'ECTS'), ects)),
    h('div', {}, h('span', { class: 'me-lab' }, L('Nächster Prüfungstermin', 'Next exam date')), h('div', { class: 'me-row2 me-artrow' }, artSel, date)),
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
  // Termin: alter Haupttermin raus, neuer rein (weitere Tests/Abgaben bleiben)
  const old = f.klausur ? { art: f.klausurArt || 'klausur', datum: f.klausur } : null;
  f.termine = M.termineOf(f).filter(t => !(old && t.datum === old.datum && t.art === old.art)).map(t => (t.id === 'k' ? Object.assign({}, t, { id: uid() }) : t));
  f.klausur = ''; f.klausurArt = '';
  if (date.value) M.addTerminTo(f, { art: artSel.value, datum: date.value }); else M.syncKlausur(f);
  M.saveFach(Object.assign(f, { name: name.value.trim().slice(0, 60), kurz: kurz.value.trim().slice(0, 12), ects: ects.value ? Math.max(0, Math.min(30, +ects.value)) : '', docs: chosen }));
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
          h('b', {}, s.t), h('small', {}, `${hm(s.s)}–${hm(s.e)}${s.o ? ' · ' + s.o : ''}`), s.fach ? (sameName(s.t, s.fach) ? null : h('i', {}, s.fach.kurz || s.fach.name)) : null);
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
    form, err, h('div', { class: 'me-cb' }, h('label', { class: 'btn sm', for: 'fileApp' }, h('span', { html: ico('upload') }), L('Foto oder Screenshot vom Stundenplan', 'Photo or screenshot of your timetable')), h('label', { class: 'btn sm ghost' }, fin, h('span', { html: ico('file') }), L('.ics-Datei', '.ics file'))), help);
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
  body.append(milestones(),
    h('div', { class: 'me-kpis' },
      kpi(st, L('Tage Serie', 'day streak'), best > st ? L(`Rekord: ${best}`, `Record: ${best}`) : st ? L('Das ist dein Rekord.', 'That’s your record.') : L('Heute anfangen?', 'Start today?')),
      kpi(M.fmtMin(w0), L('Lernzeit diese Woche', 'Study time this week'), trend == null ? L(`Letzte Woche: ${M.fmtMin(w1)}`, `Last week: ${M.fmtMin(w1)}`) : trend >= 0 ? L(`+${trend} % zur Vorwoche`, `+${trend}% vs last week`) : L(`${trend} % zur Vorwoche`, `${trend}% vs last week`)),
      kpi(ans ? Math.round(100 * cor / ans) + ' %' : '–', L('Trefferquote', 'Accuracy'), L(`${ans} Fragen beantwortet`, `${ans} questions answered`)),
      kpi(reps, L('Karten gelernt', 'Cards learned'), L('mit Wiederholung', 'with spaced repetition'))),
    weeksCard(),
    card(L('Deine letzten 18 Wochen', 'Your last 18 weeks'), h('div', { class: 'me-heat' }, cells), h('div', { class: 'me-heatl' }, h('span', {}, L('weniger', 'less')), [0, 1, 2, 3, 4].map(l => h('i', { class: 'l' + l })), h('span', {}, L('mehr', 'more'))),
      h('p', { class: 'me-muted me-fine' }, L('Serien-Joker: Ein verpasster Tag pro Woche wird automatisch überbrückt.', 'Streak joker: one missed day per week is bridged automatically.'))),
    rows.length ? card(subj.length ? L('Lernstand pro Fach', 'Progress per subject') : L('Lernstand pro Skript', 'Progress per set of slides'), h('div', { class: 'me-bars' }, rows.map((r, i) => h('div', { class: 'me-br' }, h('span', {}, r.n), h('div', { class: 'me-bar big' }, h('i', { style: { width: r.m + '%' } })), h('b', {}, r.m + ' %')))),
      rows.length > 1 ? h('p', { class: 'me-muted' }, L(`Am stärksten: ${rows[0].n}. Hier lohnt sich jede Minute: ${rows[rows.length - 1].n}.`, `Strongest: ${rows[0].n}. Every minute pays off here: ${rows[rows.length - 1].n}.`)) : null) : null);
}
const kpi = (b, t, s) => h('div', { class: 'me-kpi' }, h('b', {}, String(b)), h('span', {}, t), h('small', {}, s));
// Lernzeit pro Woche als Balken gegen das Wochenziel – Länge statt Graustufen
function weeksCard() {
  const goal = M.getMe().wochenziel || 150;
  const ws = [...Array(8)].map((_, i) => ({ off: i - 7, m: weekMinutes(i - 7) }));
  const top = Math.max(goal, ...ws.map(w => w.m), 1);
  const lbl = off => off === 0 ? L('diese', 'this') : off === -1 ? L('letzte', 'last') : L(`KW ${isoWeek(new Date(Date.now() + off * 7 * 864e5))}`, `W${isoWeek(new Date(Date.now() + off * 7 * 864e5))}`);
  return card(L('Lernzeit pro Woche', 'Study time per week'),
    h('p', { class: 'me-wsum' }, h('b', {}, M.fmtMin(ws[7].m)), L(` von ${M.fmtMin(goal)} diese Woche`, ` of ${M.fmtMin(goal)} this week`), ws[7].m >= goal ? L(' – Ziel geschafft.', ' – goal reached.') : ''),
    h('div', { class: 'me-wbars', style: { '--g': String(goal / top) } }, h('span', { class: 'me-wgoal', title: L('Wochenziel', 'Weekly goal') }),
      ws.map(w => h('div', { class: 'me-wbc' + (w.off === 0 ? ' now' : '') + (w.m >= goal ? ' hit' : ''), title: `${lbl(w.off)}: ${M.fmtMin(w.m)}` }, h('i', { style: { height: Math.max(2, 100 * w.m / top) + '%' } }), h('small', {}, lbl(w.off))))));
}

// ---------- Fortschritt: was schon geschafft ist ----------
function progressData() {
  const me = M.getMe(), now = Date.now(), wk = now - 7 * 864e5;
  const own = S.list.filter(d => !d.sample);
  const totMin = Object.values(me.akt || {}).reduce((a, x) => a + x, 0), wMin = weekMinutes(0);
  const cards = own.flatMap(d => d.decks.flatMap(k => k.cards));
  const learned = cards.filter(c => (c.reps || 0) > 0).length, learnedW = cards.filter(c => (c.reps || 0) > 0 && (c.last || 0) > wk).length;
  const ans = own.reduce((x, d) => x + (d.stats?.answered || 0), 0), cor = own.reduce((x, d) => x + (d.stats?.correct || 0), 0);
  const wkKeys = new Set([...Array(7)].map((_, i) => M.dayKey(new Date(now - i * 864e5))));
  const ansW = own.reduce((x, d) => x + Object.entries(d.stats?.days || {}).filter(([k]) => wkKeys.has(k)).reduce((a, [, n]) => a + n, 0), 0);
  let fest = 0, themen = 0;
  const fs = me.faecher.map(f => (f.docs || []).map(docById).filter(Boolean)).filter(x => x.length);
  for (const ds of fs) { const r = reife(ds); fest += r.fest; themen += r.themen; }
  if (!themen) { const loose = own.filter(d => !M.fachOf(d.id)); if (loose.length) { const r = reife(loose); fest += r.fest; themen += r.themen; } }
  const ch = own.flatMap(d => d.path?.chapters || []), chDone = ch.filter(c => c.done).length;
  const quizzes = own.reduce((x, d) => x + d.quizzes.filter(q => q.results?.length).length, 0);
  return { totMin, wMin, learned, learnedW, ans, cor, ansW, fest, themen, chDone, chTot: ch.length, quizzes, docs: own.length, st: M.streak(M.activityDays(S.list)) };
}
function progressStrip() {
  const p = progressData();
  if (!p.docs && !p.totMin) return null;
  const tile = (val, label, sub, href) => h('a', { class: 'me-pt', href }, h('b', {}, val), h('span', {}, label), sub ? h('small', {}, sub) : null);
  return h('section', { class: 'me-prog' },
    h('div', { class: 'me-pgh' }, h('b', {}, L('Dein Fortschritt', 'Your progress')), h('a', { class: 'me-more', href: '#/app/me/stats' }, L('Alles ansehen', 'See all'), h('span', { html: ico('right') }))),
    h('div', { class: 'me-pts' },
      tile(M.fmtMin(p.totMin), L('gelernt insgesamt', 'studied in total'), p.wMin ? L(`+${M.fmtMin(p.wMin)} diese Woche`, `+${M.fmtMin(p.wMin)} this week`) : L('diese Woche noch nichts', 'nothing yet this week'), '#/app/me/stats'),
      tile(String(p.learned), L('Karten gelernt', 'cards learned'), p.learnedW ? L(`+${p.learnedW} in 7 Tagen`, `+${p.learnedW} in 7 days`) : null, '#/app/me/stats'),
      p.themen ? tile(`${p.fest}/${p.themen}`, L('Themen sitzen', 'topics secure'), L('sicher bis zur Klausur', 'secure for the exam'), '#/app/me/faecher') : p.chTot ? tile(`${p.chDone}/${p.chTot}`, L('Kapitel geschafft', 'chapters done'), null, '#/app/me/stats') : tile(String(p.docs), L(p.docs === 1 ? 'Skript' : 'Skripte', p.docs === 1 ? 'set of slides' : 'sets of slides'), null, '#/app/me/stats'),
      tile(p.ans ? Math.round(100 * p.cor / p.ans) + ' %' : '–', L('richtig im Quiz', 'right in quizzes'), p.ans ? L(`${p.ans} Fragen${p.ansW ? `, +${p.ansW} diese Woche` : ''}`, `${p.ans} questions${p.ansW ? `, +${p.ansW} this week` : ''}`) : L('noch kein Quiz', 'no quiz yet'), '#/app/me/stats')));
}
// Meilensteine: geschafft + der nächste in Reichweite (ruhig, ohne Konfetti)
function milestones() {
  const p = progressData();
  const M_ = [
    ['docs', [1, 5, 15], n => L(`${n} ${n === 1 ? 'Skript' : 'Skripte'} hochgeladen`, `${n} upload${n === 1 ? '' : 's'}`)],
    ['learned', [10, 50, 100, 250, 500, 1000], n => L(`${n} Karten gelernt`, `${n} cards learned`)],
    ['ans', [20, 100, 250, 500, 1000], n => L(`${n} Quizfragen beantwortet`, `${n} quiz questions answered`)],
    ['chDone', [1, 5, 15, 30], n => L(`${n} ${n === 1 ? 'Kapitel' : 'Kapitel'} im Lernpfad geschafft`, `${n} chapter${n === 1 ? '' : 's'} completed`)],
    ['st', [3, 7, 14, 30, 60], n => L(`${n} Tage Serie`, `${n}-day streak`)],
    ['totH', [1, 5, 10, 25, 50, 100], n => L(`${n} ${n === 1 ? 'Stunde' : 'Stunden'} gelernt`, `${n} hour${n === 1 ? '' : 's'} studied`)],
    ['fest', [1, 5, 10, 25], n => L(`${n} ${n === 1 ? 'Thema sitzt' : 'Themen sitzen'} sicher`, `${n} topic${n === 1 ? '' : 's'} secure`)]
  ];
  const v = Object.assign({}, p, { totH: Math.floor(p.totMin / 60) });
  const got = [], next = [];
  for (const [k, steps, txt] of M_) {
    const x = v[k] || 0, done = steps.filter(s => x >= s), nx = steps.find(s => x < s);
    if (done.length) got.push({ t: txt(done[done.length - 1]), lvl: done.length });
    if (nx) next.push({ t: txt(nx), p: x / nx, rest: nx - x, k });
  }
  next.sort((a, b) => b.p - a.p);
  if (!got.length && !next.length) return null;
  const restTxt = n => n.k === 'totH' ? L(`noch ${n.rest} Std.`, `${n.rest} h to go`) : n.k === 'st' ? L(`noch ${n.rest} ${n.rest === 1 ? 'Tag' : 'Tage'}`, `${n.rest} day${n.rest === 1 ? '' : 's'} to go`) : L(`noch ${n.rest}`, `${n.rest} to go`);
  return card(L('Geschafft', 'Achieved'),
    got.length ? h('div', { class: 'me-ms' }, got.map(g => h('span', { class: 'me-m l' + Math.min(4, g.lvl) }, h('span', { html: ico('check') }), g.t))) : h('p', { class: 'me-muted' }, L('Dein erster Meilenstein ist ganz nah.', 'Your first milestone is close.')),
    next.length ? h('div', { class: 'me-mn' }, h('div', { class: 'me-lab' }, L('Als Nächstes', 'Up next')), next.slice(0, 3).map(n => h('div', { class: 'me-mnr' }, h('span', {}, n.t), h('div', { class: 'me-bar' }, h('i', { style: { width: Math.max(3, Math.round(100 * n.p)) + '%' } })), h('small', {}, restTxt(n))))) : null);
}
