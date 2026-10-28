// Mein Bereich: Fächer, Favoriten, Stundenplan, Lernzeit.
// Liegt immer lokal. Wenn die Person es will („auf allen Geräten“), zusätzlich im Konto auf unserem Server.
import { ls, uid, h, ico, toast } from './util.js';
import { L } from './i18n.js';
import { ask, getAccount, onAccount } from './api.js';

const KEY = 'tutor.me', SKEY = 'tutor.sync';
const blank = () => ({ v: 1, faecher: [], favs: [], kurse: [], ics: { url: '', at: 0, events: [] }, icsMap: {}, akt: {}, stand: 0 });
let me = Object.assign(blank(), ls.get(KEY, null) || {});
me.icsMap ||= {};
const subs = new Set();
export const getMe = () => me;
export function onMe(fn) { subs.add(fn); return () => subs.delete(fn); }
const emit = () => subs.forEach(f => { try { f(me); } catch (e) { console.warn(e); } });
function persist() { ls.set(KEY, me); }
export function updateMe(fn, { quiet = false } = {}) {
  fn(me); me.stand = Date.now(); persist(); if (!quiet) emit(); schedulePush();
}

// ---------- Synchronisierung (freiwillig, pro Konto) ----------
const syncAll = () => ls.get(SKEY, {}) || {};
export function syncState(a = getAccount()) { if (!a) return null; const s = syncAll()[a.email]; return s == null ? null : !!s.on; }  // null = noch nicht gefragt
export function syncInfo(a = getAccount()) { return (a && syncAll()[a.email]) || {}; }
function setSyncInfo(patch, a = getAccount()) { if (!a) return; const all = syncAll(); all[a.email] = Object.assign({}, all[a.email] || {}, patch); ls.set(SKEY, all); }

export async function setSync(on) {
  setSyncInfo({ on: !!on });
  if (on) { await pull(true); await pushNow(); }
  else { try { await ask('konto', { opts: { op: 'del' } }); } catch (e) {} setSyncInfo({ at: 0 }); }
  emit();
}

let pushT = null, pushing = false;
function schedulePush() { if (!syncState()) return; clearTimeout(pushT); pushT = setTimeout(pushNow, 1800); }
export async function pushNow() {
  if (!syncState() || pushing) return;
  pushing = true;
  try { const r = await ask('konto', { opts: { op: 'put', daten: JSON.stringify(me) } }); setSyncInfo({ at: Date.now(), err: '' }); if (r.stand) me.serverStand = r.stand; }
  catch (e) { setSyncInfo({ err: e.message || 'Fehler' }); }
  finally { pushing = false; emit(); }
}
// Vom Server holen: Neuerer Stand gewinnt. Lokale Lernzeit wird zusammengeführt.
export async function pull(merge = false) {
  if (!syncState() && !merge) return;
  try {
    const r = await ask('konto', { opts: { op: 'get' } });
    if (!r.daten) return;
    const srv = Object.assign(blank(), JSON.parse(r.daten)); srv.icsMap ||= {};
    const akt = Object.assign({}, srv.akt); for (const [d, m] of Object.entries(me.akt || {})) akt[d] = Math.max(akt[d] || 0, m);
    if ((srv.stand || 0) > (me.stand || 0) || (merge && !me.faecher.length && !me.favs.length && !me.kurse.length)) { me = srv; }
    me.akt = akt; persist(); setSyncInfo({ at: Date.now(), err: '' }); emit();
  } catch (e) { setSyncInfo({ err: e.message || 'Fehler' }); }
}
// Beim Start und beim Zurückkommen in den Tab einmal abgleichen
let lastPull = 0;
function maybePull() { if (syncState() && Date.now() - lastPull > 60e3) { lastPull = Date.now(); pull(); } }
onAccount(a => { if (a) maybePull(); });
addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') maybePull(); });

// ---------- Lernzeit: zählt Minuten, in denen wirklich etwas passiert ----------
let lastAct = Date.now();
for (const ev of ['pointerdown', 'keydown', 'scroll', 'touchstart']) addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true, capture: true });
export const dayKey = (d = new Date()) => d.toLocaleDateString('sv-SE');
setInterval(() => {
  if (document.visibilityState !== 'visible' || Date.now() - lastAct > 120e3 || !location.hash.startsWith('#/app')) return;
  const k = dayKey();
  updateMe(m => { m.akt[k] = (m.akt[k] || 0) + 1; const keys = Object.keys(m.akt).sort(); while (keys.length > 400) delete m.akt[keys.shift()]; }, { quiet: true });
}, 60e3);

// ---------- Fächer ----------
export function saveFach(f) {
  updateMe(m => { const i = m.faecher.findIndex(x => x.id === f.id); if (i >= 0) m.faecher[i] = f; else m.faecher.push(Object.assign({ id: uid(), created: Date.now() }, f)); });
}
export function delFach(id) { updateMe(m => { m.faecher = m.faecher.filter(x => x.id !== id); m.kurse.forEach(k => { if (k.fach === id) k.fach = ''; }); }); }
export const fachOf = docId => me.faecher.find(f => (f.docs || []).includes(docId)) || null;
// ---------- Termine je Fach: Klausur, Test, Abgabe, Referat ----------
// f.klausur bleibt der nächste prüfungsartige Termin (Countdown, Prüfungsreife, Karten-Verdichtung), f.klausurArt sagt, ob Klausur oder Test
export const ART = { klausur: L('Klausur', 'Exam'), test: L('Test', 'Test'), abgabe: L('Abgabe', 'Deadline'), referat: L('Referat', 'Presentation') };
export const artName = a => ART[a] || ART.klausur;
export function termineOf(f) {
  const t = (f.termine || []).slice();
  if (f.klausur && !t.some(x => x.datum === f.klausur)) t.push({ id: 'k', art: f.klausurArt || 'klausur', datum: f.klausur });
  return t.sort((a, b) => (a.datum < b.datum ? -1 : 1));
}
export function syncKlausur(f) {
  const today = dayKey(), ex = (f.termine || []).filter(x => x.datum && (x.art === 'klausur' || x.art === 'test'));
  const nx = ex.filter(x => x.datum >= today).sort((a, b) => (a.datum < b.datum ? -1 : 1))[0] || ex.sort((a, b) => (a.datum < b.datum ? 1 : -1))[0];
  f.klausur = nx ? nx.datum : ''; f.klausurArt = nx ? nx.art : '';
}
// Termin eintragen. Eine Klausur je Fach (eine neue ersetzt die alte, solange die noch nicht vorbei ist), Tests und Abgaben dürfen mehrere sein.
export function addTerminTo(f, t) {
  f.termine = termineOf(f).map(x => (x.id === 'k' ? Object.assign({}, x, { id: uid() }) : x));
  if (t.art === 'klausur') f.termine = f.termine.filter(x => x.art !== 'klausur' || x.datum < dayKey());
  f.termine = f.termine.filter(x => !(x.art === t.art && x.datum === t.datum));
  f.termine.push(Object.assign({ id: uid() }, t));
  syncKlausur(f);
}
// Fach über Namen/Kürzel finden – auch „Kosten- und Leistungsrechnung (KLR)“ oder nur „KLR“
export function findFach(name) {
  if (!name) return null;
  const n = norm(String(name).replace(/\s*\([^)]*\)\s*$/, '')), k = (/\(([^)]+)\)\s*$/.exec(name) || [])[1];
  return me.faecher.find(f => norm(f.name) === n) || me.faecher.find(f => f.kurz && (norm(f.kurz) === n || (k && norm(f.kurz) === norm(k)))) || me.faecher.find(f => n.length >= 4 && (norm(f.name).includes(n) || n.includes(norm(f.name)))) || null;
}
// Termin/Kurs einem Fach zuordnen: per Hand, sonst über den Namen
const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
export function guessFach(title) {
  const t = ' ' + norm(title) + ' ';
  let best = null, bl = 0;
  for (const f of me.faecher) for (const n of [f.name, f.kurz].filter(Boolean)) { const x = norm(n); if (x.length >= 3 && t.includes(' ' + x) && x.length > bl) { best = f; bl = x.length; } }
  return best;
}

// ---------- Favoriten ----------
export const favKey = it => `${it.typ}:${it.doc || ''}:${it.ref || ''}`;
export const isFav = it => me.favs.some(f => favKey(f) === favKey(it));
export function toggleFav(it) {
  const k = favKey(it); let on = false;
  updateMe(m => { const i = m.favs.findIndex(f => favKey(f) === k); if (i >= 0) m.favs.splice(i, 1); else { on = true; m.favs.unshift(Object.assign({ id: uid(), ts: Date.now() }, it, { inhalt: it.inhalt ? String(it.inhalt).slice(0, 8000) : undefined })); m.favs = m.favs.slice(0, 300); } });
  return on;
}
// Stern-Knopf. getItem() liefert {typ, titel, doc, docName, ref, inhalt?}
export function starBtn(getItem, { cls = '', label = false } = {}) {
  const b = h('button', { class: (label ? 'starchip ' : 'starbtn ') + cls, type: 'button' });
  const paint = () => { const it = getItem(); const on = !!it && isFav(it); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? L('Aus Favoriten entfernen', 'Remove from favourites') : L('Zu Favoriten', 'Add to favourites')); b.title = b.getAttribute('aria-label'); b.innerHTML = STAR + (label ? '<span>' + (on ? L('Gemerkt', 'Saved') : L('Merken', 'Save')) + '</span>' : ''); };
  b.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    if (!getAccount()) { import('./account.js').then(m => m.openLogin({ title: L('Favoriten gibt’s mit Konto', 'Favourites need an account') })); return; }
    const it = getItem(); if (!it) return;
    const on = toggleFav(it);
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    toast(on ? L('In deinen Favoriten. Findest du unter „Mein Bereich“.', 'Saved to your favourites in “My space”.') : L('Aus den Favoriten entfernt.', 'Removed from favourites.'));
  });
  paint(); onMe(() => b.isConnected && paint()); setTimeout(paint, 0);
  return b;
}
export const textKey = t => { let x = 0x811c9dc5; t = String(t || ''); for (let i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 0x01000193); } return (x >>> 0).toString(36); };
export const plain = t => String(t || '').replace(/\[\[[^\]]*\]\]/g, '').replace(/[*_#`>]+/g, '').replace(/\s+/g, ' ').trim();
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>';

// ---------- Stundenplan ----------
export function setIcsCol(title, col) { updateMe(m => { m.icsCol = Object.assign({}, m.icsCol); if (col) m.icsCol[title] = col; else delete m.icsCol[title]; }); }
export function saveKurs(k) { updateMe(m => { const i = m.kurse.findIndex(x => x.id === k.id); if (i >= 0) m.kurse[i] = k; else m.kurse.push(Object.assign({ id: uid() }, k)); }); }
export function delKurs(id) { updateMe(m => { m.kurse = m.kurse.filter(x => x.id !== id); }); }

// Kalender (iCal/ICS): Link über unseren Server holen (Browser dürfen fremde Kalender nicht direkt laden) oder Datei
export async function loadIcsUrl(url) {
  const r = await ask('ics', { opts: { url } });
  const ev = parseIcs(r.ics || '');
  if (!ev.length) throw new Error(L('Im Kalender stehen in den nächsten Wochen keine Termine.', 'No events in that calendar for the coming weeks.'));
  updateMe(m => { m.ics = { url, at: Date.now(), events: ev, name: icsName(r.ics) }; });
  icsFaecher(ev);
  return ev.length;
}
export async function loadIcsFile(file) {
  const t = await file.text();
  if (!/BEGIN:VCALENDAR/i.test(t)) throw new Error(L('Das ist keine Kalender-Datei (.ics).', 'That’s not a calendar file (.ics).'));
  const ev = parseIcs(t);
  if (!ev.length) throw new Error(L('In der Datei stehen in den nächsten Wochen keine Termine.', 'No events in that file for the coming weeks.'));
  updateMe(m => { m.ics = { url: '', at: Date.now(), events: ev, name: icsName(t) || file.name }; });
  icsFaecher(ev);
  return ev.length;
}
// ---------- Aus dem Stundenplan automatisch die Fächer ableiten ----------
// Wiederkehrende Lehrveranstaltungen (Vorlesung, Übung, Tutorium … oder ein Wirtschaftsfach im Titel) → ein Fach je Kurs.
// „VL Kostenrechnung“ und „Übung Kostenrechnung (Gr. 2)“ ergeben dasselbe Fach. Einmal gelöschte Fächer legt der Abgleich nicht wieder an.
const KIND = /(^|[\s\-–—:|/(])(vorlesung|vl|v|übung|uebung|ü|ue|ueb|tutorium|tut|seminar|sem|praktikum|kolloquium|lecture|tutorial|exercise|lab|grundkurs)(\.|\b)/gi;
const COURSE = /(^|[^\p{L}])(vorlesung|vl|übung|uebung|ü|ue|tutorium|tut|seminar|praktikum|kolloquium|lecture|tutorial|exercise)(?![\p{L}])/iu;
const ECON = /(bwl|vwl|rechnungswesen|buchf|buchhalt|kosten|leistungsrechnung|klr|controlling|finanz|invest|marketing|statistik|mathe|wirtschaft|recht|ifrs|hgb|bilanz|accounting|finance|economics|management|steuer|personal|organisation|logistik|produktion|unternehm|makro|mikro|ökonom|oekonom|informatik|englisch|english|business|ökonometrie)/i;
export function kursName(title) {
  return String(title || '').replace(/\([^)]*\)|\[[^\]]*\]/g, ' ').replace(/\b(gruppe|group|gr)\.?\s*[\w-]+/gi, ' ').replace(KIND, ' ')
    .replace(/\b[A-Z]{1,4}[-\s]?\d{2,}[A-Za-z0-9-]*\b/g, ' ').replace(/\s{2,}/g, ' ').replace(/^[\s\-–—:|,./]+|[\s\-–—:|,./]+$/g, '').trim().slice(0, 60);
}
export function deriveFaecher(events) {
  const by = new Map();
  for (const [t, s] of events || []) {
    const n = kursName(t); if (n.length < 3 || !/\p{L}{3}/u.test(n)) continue;
    const k = norm(n), g = by.get(k) || { name: n, days: new Set(), hint: false };
    g.days.add(new Date(s).toDateString()); if (COURSE.test(t) || ECON.test(t)) g.hint = true;
    if (n.length < g.name.length) g.name = n;
    by.set(k, g);
  }
  return [...by.values()].filter(g => g.hint && g.days.size >= 2).map(g => g.name);
}
let lastIcs = 0;
export const lastIcsFaecher = () => lastIcs;
function icsFaecher(ev) {
  const names = deriveFaecher(ev); lastIcs = 0;
  if (!names.length) return 0;
  updateMe(m => {
    m.icsFachDone ||= [];
    for (const nm of names) {
      const k = norm(nm);
      if (m.icsFachDone.includes(k)) continue;
      m.icsFachDone.push(k);
      if (findFach(nm)) continue;
      m.faecher.push({ id: uid(), created: Date.now(), name: nm, kurz: '', klausur: '', ects: '', docs: [], termine: [], ausKalender: true });
      lastIcs++;
    }
  });
  return lastIcs;
}
export function icsFach(title) { const id = (me.icsMap || {})[title]; if (id === '-') return null; return (id && me.faecher.find(f => f.id === id)) || guessFach(title); }
export function setIcsFach(title, id) { updateMe(m => { m.icsMap ||= {}; m.icsMap[title] = id || '-'; }); }
export function dropIcs() { updateMe(m => { m.ics = { url: '', at: 0, events: [] }; }); }
// Alle 12 Stunden still neu laden, wenn ein Link hinterlegt ist
export function refreshIcsIfOld() { if (me.ics.url && Date.now() - (me.ics.at || 0) > 12 * 3600e3 && getAccount()) loadIcsUrl(me.ics.url).catch(() => {}); }

function icsName(t) { const m = /X-WR-CALNAME:(.+)/i.exec(String(t)); return m ? m[1].trim().slice(0, 60) : ''; }
// Minimaler ICS-Leser: VEVENT, ganztägig/mit Uhrzeit, UTC oder lokal, Wiederholung wöchentlich/täglich (UNTIL/COUNT/INTERVAL/BYDAY), EXDATE.
export function parseIcs(text, from = Date.now() - 8 * 864e5, to = Date.now() + 150 * 864e5) {
  const lines = String(text).replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
  const out = []; let cur = null;
  const val = l => l.slice(l.indexOf(':') + 1);
  const unesc = s => s.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').trim();
  for (const l of lines) {
    if (/^BEGIN:VEVENT/i.test(l)) { cur = { ex: [] }; continue; }
    if (/^END:VEVENT/i.test(l)) { if (cur && cur.s) out.push(cur); cur = null; continue; }
    if (!cur) continue;
    const name = l.split(/[:;]/)[0].toUpperCase();
    if (name === 'DTSTART') { cur.s = icsDate(l); cur.allDay = /VALUE=DATE[:;]/i.test(l) || /:\d{8}$/.test(l); }
    else if (name === 'DTEND') cur.e = icsDate(l);
    else if (name === 'DURATION') cur.dur = icsDur(val(l));
    else if (name === 'SUMMARY') cur.t = unesc(val(l)).slice(0, 120);
    else if (name === 'LOCATION') cur.o = unesc(val(l)).slice(0, 80);
    else if (name === 'RRULE') cur.rr = val(l);
    else if (name === 'EXDATE') val(l).split(',').forEach(x => { const d = icsDate('X:' + x); if (d) cur.ex.push(d); });
    else if (name === 'STATUS' && /CANCELLED/i.test(val(l))) cur.cancel = true;
  }
  const res = [];
  for (const e of out) {
    if (e.cancel || e.allDay) continue;
    const len = e.e ? e.e - e.s : (e.dur || 3600e3);
    if (len <= 0 || len > 14 * 3600e3) continue;
    const push = s => { if (s + len >= from && s <= to && !e.ex.some(x => Math.abs(x - s) < 60e3)) res.push([e.t || L('Termin', 'Event'), s, s + len, e.o || '']); };
    if (!e.rr) { push(e.s); continue; }
    const R = Object.fromEntries(e.rr.split(';').map(p => p.split('=')).map(([a, b]) => [String(a).toUpperCase(), b]));
    const iv = Math.max(1, parseInt(R.INTERVAL) || 1), until = R.UNTIL ? icsDate('X:' + R.UNTIL) : Infinity, count = parseInt(R.COUNT) || Infinity;
    const days = R.BYDAY ? R.BYDAY.split(',').map(d => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].indexOf(d.replace(/[^A-Z]/g, ''))).filter(x => x >= 0) : null;
    const base = new Date(e.s); let n = 0;
    if (R.FREQ === 'WEEKLY' || R.FREQ === 'DAILY') {
      const step = R.FREQ === 'DAILY' ? 1 : 7;
      const wk0 = new Date(base); wk0.setHours(0, 0, 0, 0); if (step === 7) wk0.setDate(wk0.getDate() - wk0.getDay());
      const i0 = count === Infinity ? Math.max(0, Math.floor((from - wk0.getTime()) / (step * iv * 864e5)) - 1) : 0;
      for (let i = i0; i < i0 + 400 && n < count; i++) {
        const blockStart = new Date(wk0); blockStart.setDate(wk0.getDate() + i * step * iv);
        const ds = step === 7 ? (days || [base.getDay()]).slice().sort((a, b) => a - b).map(d => { const x = new Date(blockStart); x.setDate(blockStart.getDate() + d); return x; }) : [blockStart];
        let stop = false;
        for (const d of ds) {
          d.setHours(base.getHours(), base.getMinutes(), 0, 0);
          const s = d.getTime();
          if (s < e.s) continue;
          if (s > until || s > to) { stop = true; break; }
          n++; if (n > count) { stop = true; break; }
          push(s);
        }
        if (stop) break;
      }
    } else push(e.s);
  }
  res.sort((a, b) => a[1] - b[1]);
  return res.slice(0, 900);
}
function icsDate(l) {
  const v = l.slice(l.lastIndexOf(':') + 1).trim();
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(v); if (!m) return null;
  const [, y, mo, d, hh = '0', mi = '0', ss = '0', z] = m;
  return z ? Date.UTC(+y, +mo - 1, +d, +hh, +mi, +ss) : new Date(+y, +mo - 1, +d, +hh, +mi, +ss).getTime();
}
function icsDur(v) { const m = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/.exec(v || ''); return m ? (((+m[1] || 0) * 24 + (+m[2] || 0)) * 60 + (+m[3] || 0)) * 60e3 : 0; }

// Findet ein Kurs an diesem Tag statt? Wöchentlich, alle zwei Wochen (gerade/ungerade KW) oder einmalig; optional mit Zeitraum
const isoWeek = d => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const wd = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - wd); const y0 = Date.UTC(t.getUTCFullYear(), 0, 1); return Math.ceil(((t - y0) / 864e5 + 1) / 7); };
export function kursOn(k, d0, wd = d0.getDay() || 7) {
  const key = dayKey(d0);
  if (k.rhythmus === 'einmalig') return !!k.datum && k.datum === key;
  if (+k.tag !== wd) return false;
  if (k.ab && key < k.ab) return false;
  if (k.bis_datum && key > k.bis_datum) return false;
  if (k.rhythmus === '14taegig') {
    if (k.woche === 'gerade') return isoWeek(d0) % 2 === 0;
    if (k.woche === 'ungerade') return isoWeek(d0) % 2 === 1;
    if (k.ab) return Math.round((d0 - new Date(k.ab + 'T00:00')) / (7 * 864e5)) % 2 === 0;
  }
  return true;
}
// Termine an einem Tag: eigene Kurse (wöchentlich) + Kalender
export function sessionsOn(date) {
  const d0 = new Date(date); d0.setHours(0, 0, 0, 0); const d1 = d0.getTime() + 864e5;
  const wd = d0.getDay() || 7;
  const own = me.kurse.filter(k => kursOn(k, d0, wd)).map(k => {
    const [h1, m1] = String(k.von || '08:00').split(':').map(Number), [h2, m2] = String(k.bis || '09:30').split(':').map(Number);
    const s = new Date(d0); s.setHours(h1, m1); const e = new Date(d0); e.setHours(h2, m2);
    const fa = me.faecher.find(f => f.id === k.fach) || guessFach(k.titel); return { t: k.titel, s: s.getTime(), e: e.getTime(), o: k.raum || '', art: k.art || '', fach: fa, own: true, id: k.id, col: k.farbe || (fa && fa.farbe) || '' };
  });
  const cal = (me.ics.events || []).filter(x => x[1] >= d0.getTime() && x[1] < d1).map(x => { const fa = icsFach(x[0]); return { t: x[0], s: x[1], e: x[2], o: x[3], fach: fa, col: (me.icsCol || {})[x[0]] || (fa && fa.farbe) || '' }; });
  return [...own, ...cal].sort((a, b) => a.s - b.s);
}

// ---------- Lernserie & Statistik ----------
export function activityDays(docsList = []) {
  const days = Object.assign({}, me.akt);
  for (const d of docsList) for (const [k, n] of Object.entries(d.stats?.days || {})) days[k] = (days[k] || 0) + Math.max(1, Math.round(n / 2));
  return days;
}
// Serie mit Joker: ein verpasster Tag pro Kalenderwoche wird überbrückt, wenn davor gelernt wurde
const weekKey = x => { const m = new Date(x); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return dayKey(m); };
export function streak(days) {
  let n = 0; const d = new Date(); const used = new Set();
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
  for (let g = 0; g < 3000; g++) {
    if (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); continue; }
    const prev = new Date(d); prev.setDate(prev.getDate() - 1);
    if (!used.has(weekKey(d)) && days[dayKey(prev)]) { used.add(weekKey(d)); d.setDate(d.getDate() - 1); continue; }
    break;
  }
  return n;
}
export const fmtMin = m => m >= 60 ? L(`${Math.floor(m / 60)} Std. ${m % 60 ? (m % 60) + ' Min.' : ''}`, `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}`).trim() : L(`${m} Min.`, `${m} min`);
