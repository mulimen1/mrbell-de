// Upload-Intelligenz: Was auch immer reinkommt (PDF, PowerPoint, Word, Foto, Screenshot, Scan) – Max erkennt, was es ist,
// und sortiert es ein: Stundenplan → Kurse, Prüfungsplan → Termine, Lernstoff → Skript im richtigen Fach mit Ziel und Datum.
import { h, ico, toast, modal, ls, sleep, uid } from './util.js';
import { L, LOCALE } from './i18n.js';
import { face } from './face.js';
import { thought, apiError } from './ui.js';
import { ask, getAccount, currentQuota } from './api.js';
import { readFile, isImage, imageToJpeg, pdfPages } from './ingest.js';
import { isMedia } from './transcribe.js';
import { createDoc, save, S } from './state.js';
import * as M from './me.js';

const TYP = { stundenplan: L('Stundenplan', 'Timetable'), pruefungsplan: L('Prüfungsplan', 'Exam schedule'), vorlesung: L('Vorlesung', 'Lecture'), uebung: L('Übungsblatt', 'Problem set'), altklausur: L('Altklausur', 'Past exam'), mitschrift: L('Mitschrift', 'Notes'), zusammenfassung: L('Zusammenfassung', 'Summary'), sonstiges: L('Unterlagen', 'Material'), thema: L('Kurzskript', 'Short script') };
const ARTS = ['Vorlesung', 'Übung', 'Tutorium', 'Seminar', 'Praktikum', 'Sonstiges'];
const DAYS = L(['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
const today = () => new Date().toLocaleDateString('sv-SE');
const fmtD = iso => new Date(iso + 'T12:00').toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short', year: iso.slice(0, 4) !== today().slice(0, 4) ? 'numeric' : undefined });
const daysTo = iso => Math.round((new Date(iso + 'T12:00') - new Date(today() + 'T12:00')) / 864e5);
const clean = (s, n = 80) => String(s == null ? '' : s).replace(/[<>]/g, '').trim().slice(0, n);
const hhmm = s => /^\d{1,2}:\d{2}$/.test(String(s || '')) ? String(s).padStart(5, '0') : '';
const isoOk = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) ? s : '';

// ---------- Einstieg ----------
// ui: { view, setTitle, afterCreate(doc) → hash | null, target }
export async function intake(fileList, ui) {
  const files = [...fileList].filter(Boolean);
  if (!files.length) return;
  const imgs = files.filter(isImage), docs = files.filter(f => !isImage(f));
  const src = docs.length ? { kind: 'file', file: docs[0], name: docs[0].name } : { kind: 'bild', files: imgs.slice(0, 40), name: imgs[0].name };
  if (docs.length > 1 || (docs.length && imgs.length)) toast(L('Eins nach dem anderen – ich nehm zuerst „' + docs[0].name + '“.', 'One at a time – I’ll take “' + docs[0].name + '” first.'), 3600);
  if (!docs.length && imgs.length > 40) toast(L('Höchstens 40 Fotos auf einmal – ich nehm die ersten 40.', 'At most 40 photos at once – I’ll take the first 40.'), 3600);

  ui.setTitle(L('Neuer Stoff', 'New material'));
  const prep = prepare(src);                       // liest im Hintergrund, während man die Notiz tippt
  // Kommt man von einem Werkzeug (Karteikarten, Quiz, Podcast …): keine Fragen vorher – genau das wird gebaut
  const tool = TOOLS.includes(ui.target) ? ui.target : null;
  const note = tool ? await readStep(ui.view, prep, tool) : await noteStep(ui.view, src, prep);
  if (!note) return;
  let P;
  try { P = await prep.done; }
  catch (e) { if (e && ['need_account', 'limit', 'cap'].includes(e.code)) { await apiError(e, () => intake(fileList, ui)); } return fail(ui, e.message || L('Die Datei konnte nicht gelesen werden.', 'The file couldn’t be read.')); }

  // Analyse: Was ist das?
  const scr = busy(ui.view, L('Max schaut sich das an …', 'Max is taking a look …'), [L('Ich schau mir das an …', 'Taking a look …'), L('Ist das ein Stundenplan?', 'Is this a timetable?'), L('Ich such das passende Fach …', 'Finding the right subject …'), L('Termine? Hab ich im Blick.', 'Dates? Got them.')]);
  let res = null, err = null;
  try { res = await analyse(P, note); } catch (e) { err = e; }
  scr.stop();
  if (!res) {
    if (err && err.name === 'AbortError') return;
    // Ohne KI: Text-Dateien gehen trotzdem (einordnen per Hand), Fotos und Scans nicht
    if (P.text) { res = localGuess(P, note); if (err && ['cap', 'limit'].includes(err.code)) res.noQuota = true; }
    else { if (err && ['need_account', 'cap', 'limit'].includes(err.code)) { await apiError(err, () => intake(fileList, ui)); return fail(ui, err.message, () => intake(fileList, ui)); } return fail(ui, (err && err.message) || L('Das hat nicht geklappt.', 'That didn’t work.'), () => intake(fileList, ui)); }
  }
  res.note = note;
  if (tool) return materialStep(ui, res, P, tool);
  if (res.typ === 'stundenplan') { if ((res.kurse || []).length) return timetableStep(ui, res, P); P.close && P.close(); return fail(ui, L('Das sieht nach einem Stundenplan aus, aber ich konnte keine Kurse sicher lesen. Probier einen schärferen Screenshot oder den Export aus deinem Uni-Portal.', 'That looks like a timetable, but I couldn’t read the classes reliably. Try a sharper screenshot or your uni portal’s export.'), () => intake(fileList, ui)); }
  if (res.typ === 'pruefungsplan' && (res.termine || []).length) return examStep(ui, res);
  return materialStep(ui, res, P);
}

// ---------- 1) Datei lesen / Bilder vorbereiten ----------
function prepare(src) {
  const st = { p: 0, label: '', onp: null };
  const set = (p, label) => { st.p = p; if (label) st.label = label; st.onp && st.onp(st); };
  st.done = (async () => {
    if (src.kind === 'bild') {
      const out = [];
      for (let i = 0; i < src.files.length; i++) { out.push(await imageToJpeg(src.files[i])); set((i + 1) / src.files.length, L(`Foto ${i + 1} von ${src.files.length}`, `Photo ${i + 1} of ${src.files.length}`)); }
      return { kind: 'bild', name: src.name.replace(/\.[^.]+$/, ''), n: out.length, img: i => out[i], thumbs: out.slice(0, 6) };
    }
    // Video/Audio: Ton herauslösen und abschreiben – danach ist es ein ganz normales Skript (für alle Werkzeuge)
    if (isMedia(src.file)) {
      if (!getAccount()) throw Object.assign(new Error(L('Videos und Aufnahmen schreibe ich mit kostenlosem Konto ab.', 'I transcribe videos and recordings with a free account.')), { code: 'need_account' });
      const { transcribe } = await import('./transcribe.js');
      const t = await transcribe(src.file, (p, label) => set(Math.min(0.99, p), label));
      set(1);
      return { kind: 'text', name: t.name, n: t.pages.length, text: { name: t.name, pages: t.pages, chars: t.chars, scan: false, pdf: false }, layout: 0, media: true };
    }
    const r = await readFile(src.file, p => set(p * 0.9, L('Lese …', 'Reading …')), { soft: true });
    const maxP = 1000;
    if (!r.scan && r.pages.length > maxP) throw new Error(L(`Das Skript hat ${r.pages.length} Seiten – es gehen bis zu ${maxP}. Teil es in kleinere Dateien auf.`, `These slides have ${r.pages.length} pages – the limit is ${maxP}. Split them into smaller files.`));
    if (r.pdf && (r.scan || r.pages.length <= 3)) {
      // Scan: alle Seiten als Bild für die Abschrift; kurze PDFs: erste Seiten fürs Layout (Stundenplan, Tabellen)
      const pp = await pdfPages(src.file), maxP = r.scan ? (getAccount()?.pro ? 90 : 30) : 2;
      const n = Math.min(pp.n, maxP), cache = [];
      const img = async i => (cache[i] ||= pp.render(i + 1));
      await img(0); set(1);
      return { kind: r.scan ? 'scan' : 'text', name: r.name, n, total: pp.n, img, text: r.scan ? null : r, layout: r.scan ? 0 : Math.min(2, n), close: () => pp.close() };
    }
    set(1);
    return { kind: 'text', name: r.name, n: r.pages.length, text: r, layout: 0 };
  })();
  st.done.catch(() => {});
  return st;
}

// ---------- 2a) Vom Werkzeug aus: nur lesen (mit Fortschritt), keine Fragen ----------
const TOOLS = ['karten', 'quiz', 'podcast', 'zettel', 'pfad'];
const TOOLNAME = { karten: L('Karteikarten', 'flashcards'), quiz: L('das Quiz', 'quiz'), podcast: L('den Podcast', 'podcast'), zettel: L('den Lernzettel', 'study sheet'), pfad: L('den Lernpfad', 'study path') };
async function readStep(view, prep, tool) {
  const scr = busy(view, L(`Ich lese dein Skript für ${tool === 'karten' ? 'die ' : ''}${TOOLNAME[tool]} …`, `Reading your slides for the ${TOOLNAME[tool]} …`), [L('Ich lese jede Seite …', 'Reading every page …'), L('Gleich geht’s los …', 'Almost there …')]);
  const upd = st => scr.sub(st.p >= 1 ? L('Gelesen', 'Read') : (st.label || L('Lese …', 'Reading …')) + (st.p ? ` ${Math.round(st.p * 100)} %` : ''), st.p);
  prep.onp = upd; upd(prep);
  try { await prep.done; } catch (e) {}
  scr.stop(); prep.onp = null;
  return { text: '', termin: null, tags: [], art: '' };
}

// ---------- 2) Notiz vor dem Absenden (optional) ----------
function noteStep(view, src, prep) {
  return new Promise(resolve => {
    const f = h('div', { class: 'ik-face' });
    const inp = h('input', { class: 'ik-in', maxlength: 300, placeholder: L('z. B. „für die Klausur am 12.02.“ oder „Test am Freitag“', 'e.g. “for the exam on 12 Feb” or “test on Friday”'), enterkeyhint: 'go', 'aria-label': L('Notiz an Max (optional)', 'Note to Max (optional)') });
    let art = '';
    const date = h('input', { class: 'field ik-date', type: 'date', min: today() });
    const dateRow = h('div', { class: 'ik-dr', hidden: true }, h('span', { class: 'ik-dl' }), date);
    const chip = (k, label) => h('button', { class: 'chip ik-chip', type: 'button', 'data-k': k, onclick: e => pick(k, e.currentTarget) }, label);
    const chips = h('div', { class: 'ik-chips' }, chip('klausur', L('Klausur am …', 'Exam on …')), chip('test', L('Test am …', 'Test on …')), chip('stundenplan', L('Stundenplan', 'Timetable')), chip('altklausur', L('Altklausur', 'Past exam')), chip('uebung', L('Übungsblatt', 'Problem set')));
    const tags = new Set();
    function pick(k, el) {
      if (k === 'klausur' || k === 'test') {
        art = art === k ? '' : k;
        chips.querySelectorAll('[data-k=klausur],[data-k=test]').forEach(c => c.classList.toggle('on', c.dataset.k === art));
        dateRow.hidden = !art; dateRow.firstChild.textContent = art === 'test' ? L('Test am', 'Test on') : L('Klausur am', 'Exam on');
        if (art) setTimeout(() => { try { date.showPicker ? date.showPicker() : date.focus(); } catch (e) { date.focus(); } }, 30);
        return;
      }
      if (tags.has(k)) tags.delete(k); else tags.add(k);
      el.classList.toggle('on', tags.has(k));
    }
    const prog = h('i'), progTx = h('small', { class: 'ik-pt' });
    const go = h('button', { class: 'btn primary lg ik-go', type: 'submit' }, L('Einordnen', 'Sort it'), h('span', { html: ico('right') }));
    const form = h('form', { class: 'ik-form' }, h('div', { class: 'ik-row' }, inp), chips, dateRow,
      h('div', { class: 'ik-act' }, h('div', { class: 'ik-prog' }, h('div', { class: 'ik-bar' }, prog), progTx), go));
    const fileBox = h('div', { class: 'ik-files' });
    if (src.kind === 'bild') fileBox.append(...src.files.slice(0, 6).map(() => h('div', { class: 'ik-th sk' })), src.files.length > 6 ? h('div', { class: 'ik-more' }, '+' + (src.files.length - 6)) : null);
    else fileBox.append(h('div', { class: 'ik-file' }, h('span', { html: ico('file') }), h('b', {}, src.file.name), h('small', { class: 'ik-fs' }, Math.max(1, Math.round(src.file.size / 1024)) + ' KB')));
    view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'intake' },
      h('div', { class: 'ik-head' }, f, h('div', {}, h('h2', {}, L('Noch was dazu?', 'Anything to add?')), h('p', {}, L('Optional. Ich erkenne selbst, was es ist – ein Satz hilft beim Einordnen.', 'Optional. I’ll recognise what it is – one sentence helps me sort it.')))),
      fileBox, form)));
    face(f, {});
    const upd = st => { prog.style.width = Math.round(st.p * 100) + '%'; progTx.textContent = st.p >= 1 ? L('Gelesen', 'Read') : (st.label || L('Lese …', 'Reading …')); };
    prep.onp = upd; upd(prep);
    prep.done.then(P => {
      if (P.thumbs && fileBox.isConnected) P.thumbs.forEach((t, i) => { const el = fileBox.children[i]; if (el) { el.classList.remove('sk'); el.replaceChildren(h('img', { src: 'data:image/jpeg;base64,' + t.data, alt: '' })); } });
      if (P.kind !== 'bild' && fileBox.isConnected) { const fs = fileBox.querySelector('.ik-fs'); if (fs) fs.textContent = P.kind === 'scan' ? L(`${P.total} Seiten · Scan – ich lese die Seiten`, `${P.total} pages · scan – I’ll read the pages`) : L(`${P.n} Seiten`, `${P.n} pages`); }
    }).catch(e => { progTx.textContent = e.message || ''; progTx.classList.add('bad'); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const words = [...tags].map(k => ({ stundenplan: 'Das ist mein Stundenplan.', altklausur: 'Das ist eine Altklausur.', uebung: 'Das ist ein Übungsblatt.' })[k]);
      const termin = art && date.value ? { art, datum: date.value } : null;
      const text = [inp.value.trim(), ...words, termin ? `${art === 'test' ? 'Test' : 'Klausur'} am ${date.value}.` : ''].filter(Boolean).join(' ').slice(0, 380);
      resolve({ text, termin, tags: [...tags], art });
    });
    setTimeout(() => { if (matchMedia('(pointer: fine)').matches) inp.focus(); }, 60);
  });
}

// ---------- 3) Analyse ----------
function excerpt(r) {
  let out = '', i = 0;
  for (; i < r.pages.length && out.length < 7000; i++) out += `[S. ${i + 1}]\n${r.pages[i].slice(0, 1800)}\n`;
  if (i < r.pages.length) { out += '…\nWeitere Seitenanfänge:\n'; for (; i < r.pages.length && out.length < 9000; i += Math.max(1, Math.floor(r.pages.length / 40))) out += `[S. ${i + 1}] ${r.pages[i].split('\n')[0].slice(0, 80)}\n`; }
  return out;
}
async function analyse(P, note) {
  const nImg = P.kind === 'bild' ? Math.min(4, P.n) : P.kind === 'scan' ? Math.min(3, P.n) : (P.layout || 0);
  const images = []; for (let i = 0; i < nImg; i++) images.push(await P.img(i));
  const faecher = M.getMe().faecher.map(f => ({ name: f.name, kurz: f.kurz || '' }));
  const r = await ask('analyse', { material: P.text ? excerpt(P.text) : '', opts: { kind: P.kind, imgs: images.length, pages: P.total || P.n, files: P.name, note: note.text, faecher } }, { images });
  const d = r.data || {};
  if (!d.typ) throw Object.assign(new Error(L('Das hab ich nicht verstanden. Versuch es nochmal.', 'I didn’t get that. Try again.')), { code: 'format' });
  // Termin aus der Auswahl (Datum fest gewählt) hat Vorrang vor dem, was die KI liest
  if (note.termin) { d.termine = (d.termine || []).filter(t => t.quelle !== 'notiz'); d.termine.unshift(Object.assign({ fach: d.fach || '', quelle: 'notiz' }, note.termin)); if (!d.ziel) d.ziel = note.termin.art; }
  if (note.tags.includes('stundenplan') && d.typ !== 'stundenplan' && (d.kurse || []).length) d.typ = 'stundenplan';
  return d;
}
// Ohne KI (kein Konto, Limit, offline): so gut es geht selbst einordnen
function localGuess(P, note) {
  const t = note.termin || parseNote(note.text);
  const typ = note.tags.includes('altklausur') ? 'altklausur' : note.tags.includes('uebung') ? 'uebung' : 'vorlesung';
  const g = M.guessFach(P.name);
  return { typ, titel: P.name, fach: g ? g.name : '', fach_vorhanden: g ? g.name : '', termine: t ? [Object.assign({ quelle: 'notiz' }, t)] : [], ziel: t ? t.art : '', offline: true };
}
function parseNote(s) {
  const m = /(klausur|prüfung|test)\D{0,24}?(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?/i.exec(s || ''); if (!m) return null;
  const now = new Date(); let y = m[4] ? +m[4] : now.getFullYear(); if (y < 100) y += 2000;
  let d = new Date(y, +m[3] - 1, +m[2]); if (!m[4] && d < now) d = new Date(y + 1, +m[3] - 1, +m[2]);
  if (isNaN(d)) return null;
  return { art: /test/i.test(m[1]) ? 'test' : 'klausur', datum: d.toLocaleDateString('sv-SE') };
}

// ---------- 4a) Stundenplan ----------
async function timetableStep(ui, res, P) {
  P.close && P.close();
  const me = M.getMe();
  const rows = res.kurse.map(k => ({ k: normKurs(k, res), on: true })).filter(x => x.k.von && x.k.bis && (x.k.tag || x.k.datum));
  rows.sort((a, b) => (a.k.tag - b.k.tag) || (a.k.von < b.k.von ? -1 : 1));
  const list = h('div', { class: 'ik-kl' });
  const count = h('b');
  const draw = () => {
    list.replaceChildren(...rows.map(r => {
      const k = r.k;
      const cb = h('input', { type: 'checkbox', checked: r.on || null, 'aria-label': L('Übernehmen', 'Include') }); cb.addEventListener('change', () => { r.on = cb.checked; row.classList.toggle('off', !r.on); upd(); });
      const ti = h('input', { class: 'field ik-kt', value: k.titel, maxlength: 80 }); ti.addEventListener('input', () => { k.titel = ti.value; });
      const day = h('select', { class: 'field' }, [1, 2, 3, 4, 5, 6, 7].map(i => h('option', { value: i, selected: +k.tag === i || null }, DAYS[i]))); day.addEventListener('change', () => { k.tag = +day.value; });
      const von = h('input', { class: 'field', type: 'time', value: k.von }); von.addEventListener('change', () => { k.von = von.value; });
      const bis = h('input', { class: 'field', type: 'time', value: k.bis }); bis.addEventListener('change', () => { k.bis = bis.value; });
      const art = h('select', { class: 'field' }, ARTS.map(a => h('option', { selected: a === k.art || null }, a))); art.addEventListener('change', () => { k.art = art.value; });
      const raum = h('input', { class: 'field', value: k.raum, maxlength: 40, placeholder: L('Raum', 'Room') }); raum.addEventListener('input', () => { k.raum = raum.value; });
      const extra = [k.rhythmus === '14taegig' ? L('alle 2 Wochen', 'every 2 weeks') + (k.woche ? L(` (${k.woche} KW)`, ` (${k.woche === 'gerade' ? 'even' : 'odd'} weeks)`) : '') : '', k.rhythmus === 'einmalig' && k.datum ? L('einmalig am ', 'once on ') + fmtD(k.datum) : '', k.dozent].filter(Boolean).join(' · ');
      const row = h('div', { class: 'ik-k' + (r.on ? '' : ' off') }, cb, h('div', { class: 'ik-kf' }, h('div', { class: 'ik-k1' }, ti, art), h('div', { class: 'ik-k2' }, day, von, h('span', { class: 'ik-dash' }, '–'), bis, raum), extra ? h('small', { class: 'ik-kx' }, extra) : null));
      return row;
    }));
    upd();
  };
  // Fächer, die es noch nicht gibt
  const fnames = [...new Set(rows.map(r => r.k.fach).filter(Boolean))];
  const fRows = fnames.map(n => ({ n, ex: M.findFach(n), on: true }));
  const newF = fRows.filter(x => !x.ex);
  const fBox = newF.length ? h('div', { class: 'ik-fb' }, h('div', { class: 'me-lab' }, L('Diese Fächer leg ich gleich mit an', 'I’ll also create these subjects')),
    h('div', { class: 'ik-fchips' }, newF.map(x => { const b = h('button', { class: 'chip on', type: 'button' }, h('span', { html: ico('check') }), x.n); b.addEventListener('click', () => { x.on = !x.on; b.classList.toggle('on', x.on); b.firstChild.hidden = !x.on; }); return b; }))) : null;
  const mode = me.kurse.length ? h('div', { class: 'ik-mode' },
    h('label', {}, h('input', { type: 'radio', name: 'ikm', value: 'add', checked: true }), L(' Zu meinem Stundenplan hinzufügen', ' Add to my timetable')),
    h('label', {}, h('input', { type: 'radio', name: 'ikm', value: 'replace' }), L(` Bisherige ${me.kurse.length} Kurse ersetzen`, ` Replace my ${me.kurse.length} current classes`))) : null;
  const uns = (res.unsicher || []).filter(Boolean).slice(0, 4);
  const body = h('div', { class: 'ik-tt' }, list, uns.length ? h('div', { class: 'ik-uns' }, h('b', {}, L('Nicht ganz sicher: ', 'Not quite sure: ')), uns.join(' · ')) : null, fBox, mode);
  function upd() { const n = rows.filter(r => r.on).length; count.textContent = String(n); const b = document.querySelector('.modal.ik-modal .row .btn.primary'); if (b) b.textContent = L(`${n} ${n === 1 ? 'Kurs' : 'Kurse'} eintragen`, `Add ${n} ${n === 1 ? 'class' : 'classes'}`); }
  ui.view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, h('h2', {}, L('Stundenplan erkannt', 'Timetable recognised')))));
  setTimeout(draw, 0);
  const r = await modal({ cls: 'ik-modal wide', eyebrow: L('Stundenplan erkannt', 'Timetable recognised'), title: clean(res.titel, 60) || L('Dein Stundenplan', 'Your timetable'), text: L(`${rows.length} Veranstaltungen gefunden. Kurz prüfen – du kannst alles ändern.`, `Found ${rows.length} classes. Quick check – you can change anything.`), body,
    actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L(`${rows.length} Kurse eintragen`, `Add ${rows.length} classes`), value: 'ok', primary: true }],
    onAction: v => { if (v === 'ok' && !rows.some(x => x.on)) return false; } });
  if (r !== 'ok') { location.hash = '#/app/stundenplan'; return; }
  const replace = mode && mode.querySelector('input:checked')?.value === 'replace';
  let nNew = 0, nF = 0;
  M.updateMe(m => {
    const ids = {};
    for (const x of fRows) {
      if (x.ex) { ids[x.n] = x.ex.id; continue; }
      if (!x.on) continue;
      const f = { id: uid(), created: Date.now(), name: clean(x.n, 60), kurz: '', klausur: '', ects: '', docs: [], termine: [] };
      m.faecher.push(f); ids[x.n] = f.id; nF++;
    }
    if (replace) m.kurse = [];
    for (const x of rows) {
      if (!x.on) continue; const k = x.k;
      if (!k.titel.trim() || !(k.bis > k.von)) continue;
      if (m.kurse.some(o => o.titel === k.titel && +o.tag === +k.tag && o.von === k.von && (o.datum || '') === (k.datum || ''))) continue;
      m.kurse.push(Object.assign({ id: uid(), fach: ids[k.fachName] || '' }, strip(k)));
      nNew++;
    }
    for (const t of res.termine || []) { const f = m.faecher.find(x => x.id === ids[t.fach]) || null; if (f && isoOk(t.datum)) M.addTerminTo(f, { art: t.art === 'test' ? 'test' : t.art === 'abgabe' ? 'abgabe' : 'klausur', datum: t.datum, uhrzeit: hhmm(t.uhrzeit), raum: clean(t.raum, 40) }); }
  });
  toast(L(`${nNew} ${nNew === 1 ? 'Kurs' : 'Kurse'} eingetragen${nF ? ` · ${nF} ${nF === 1 ? 'Fach' : 'Fächer'} angelegt` : ''}.`, `${nNew} ${nNew === 1 ? 'class' : 'classes'} added${nF ? ` · ${nF} subject${nF === 1 ? '' : 's'} created` : ''}.`), 3200);
  if (!getAccount()) { const { openLogin } = await import('./account.js'); openLogin({ title: L('Dein Stundenplan wartet', 'Your timetable is waiting'), text: L('Mit kostenlosem Konto siehst du ihn in „Mein Bereich“ – und ich sag dir jeden Morgen, was ansteht.', 'With a free account you’ll see it in “My space” – and I’ll tell you every morning what’s on.') }); }
  location.hash = '#/app/stundenplan';
}
function normKurs(k, res) {
  const art = ARTS.find(a => a.toLowerCase() === String(k.art || '').toLowerCase()) || (/übung|uebung/i.test(k.art) ? 'Übung' : /tut/i.test(k.art) ? 'Tutorium' : /semin/i.test(k.art) ? 'Seminar' : 'Vorlesung');
  return { titel: clean(k.titel, 80), fachName: clean(k.fach, 60), fach: clean(k.fach, 60), art, tag: Math.max(1, Math.min(7, parseInt(k.tag) || 0)) || (isoOk(k.datum) ? (new Date(k.datum + 'T12:00').getDay() || 7) : 0), von: hhmm(k.von), bis: hhmm(k.bis), raum: clean(k.raum, 40), dozent: clean(k.dozent, 60),
    rhythmus: ['14taegig', 'einmalig'].includes(k.rhythmus) ? k.rhythmus : 'woechentlich', woche: ['gerade', 'ungerade'].includes(k.woche) ? k.woche : '', datum: isoOk(k.datum), ab: isoOk(k.ab) || isoOk(res.semester?.von), bis_datum: isoOk(k.bis_datum) || isoOk(res.semester?.bis) };
}
const strip = k => { const o = { titel: k.titel.trim().slice(0, 80), tag: +k.tag, von: k.von, bis: k.bis, raum: k.raum.trim(), art: k.art }; for (const x of ['dozent', 'datum', 'ab', 'bis_datum', 'woche']) if (k[x]) o[x] = k[x]; if (k.rhythmus !== 'woechentlich') o.rhythmus = k.rhythmus; return o; };

// ---------- 4b) Prüfungsplan ----------
async function examStep(ui, res) {
  const me = M.getMe();
  const rows = (res.termine || []).filter(t => isoOk(t.datum)).map(t => ({ t: { art: ['test', 'abgabe', 'referat'].includes(t.art) ? t.art : 'klausur', datum: t.datum, uhrzeit: hhmm(t.uhrzeit), raum: clean(t.raum, 40), fach: clean(t.fach, 60) }, on: t.datum >= today() }));
  const list = h('div', { class: 'ik-kl' }, rows.map(r => {
    const ex = M.findFach(r.t.fach);
    const cb = h('input', { type: 'checkbox', checked: r.on || null }); cb.addEventListener('change', () => { r.on = cb.checked; row.classList.toggle('off', !r.on); });
    const sel = h('select', { class: 'field' }, me.faecher.map(f => h('option', { value: f.id, selected: ex && ex.id === f.id || null }, f.name)), h('option', { value: 'new:' + r.t.fach, selected: !ex || null }, L(`Neu: ${r.t.fach || 'Fach'}`, `New: ${r.t.fach || 'subject'}`)));
    sel.addEventListener('change', () => { r.sel = sel.value; }); r.sel = sel.value;
    const art = h('select', { class: 'field' }, Object.entries(M.ART).map(([k, v]) => h('option', { value: k, selected: k === r.t.art || null }, v))); art.addEventListener('change', () => { r.t.art = art.value; });
    const d = h('input', { class: 'field', type: 'date', value: r.t.datum }); d.addEventListener('change', () => { r.t.datum = d.value; });
    const row = h('div', { class: 'ik-k' + (r.on ? '' : ' off') }, cb, h('div', { class: 'ik-kf' }, h('div', { class: 'ik-k1' }, sel, art), h('div', { class: 'ik-k2' }, d, r.t.uhrzeit ? h('small', {}, r.t.uhrzeit + L(' Uhr', '')) : null, r.t.raum ? h('small', {}, r.t.raum) : null)));
    return row;
  }));
  const r = await modal({ cls: 'ik-modal wide', eyebrow: L('Prüfungsplan erkannt', 'Exam schedule recognised'), title: clean(res.titel, 60) || L('Deine Prüfungen', 'Your exams'), text: L('Ich trag die Termine bei deinen Fächern ein – dann zähl ich runter und plane mit.', 'I’ll add the dates to your subjects – then I’ll count down and plan along.'), body: list,
    actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Termine eintragen', 'Add dates'), value: 'ok', primary: true }] });
  if (r !== 'ok') { location.hash = '#/app/faecher'; return; }
  let n = 0;
  M.updateMe(m => {
    for (const x of rows) {
      if (!x.on || !isoOk(x.t.datum)) continue;
      let f = x.sel && !x.sel.startsWith('new:') ? m.faecher.find(y => y.id === x.sel) : null;
      if (!f) { const nm = clean((x.sel || '').slice(4) || x.t.fach, 60) || L('Neues Fach', 'New subject'); f = m.faecher.find(y => y.name === nm); if (!f) { f = { id: uid(), created: Date.now(), name: nm, kurz: '', klausur: '', ects: '', docs: [], termine: [] }; m.faecher.push(f); } }
      M.addTerminTo(f, { art: x.t.art, datum: x.t.datum, uhrzeit: x.t.uhrzeit, raum: x.t.raum }); n++;
    }
  });
  toast(L(`${n} ${n === 1 ? 'Termin' : 'Termine'} eingetragen.`, `${n} date${n === 1 ? '' : 's'} added.`));
  location.hash = '#/app/faecher';
}

// ---------- 4c) Lernstoff: Skript anlegen + 3–4 optionale Fragen ----------
async function materialStep(ui, res, P, tool = null) {
  // Fotos und Scans werden schon abgeschrieben, während man die Fragen beantwortet
  let ocr = null;
  const prog = { done: 0, n: 0, el: null };
  if ((P.kind === 'bild' || P.kind === 'scan') && !getAccount()) {
    const { openLogin } = await import('./account.js');
    await openLogin({ title: L('Fotos lese ich mit Konto', 'I read photos with an account'), text: L('Fotos und Scans schreib ich dir mit kostenlosem Konto ab. Dauert 30 Sekunden – danach geht’s direkt weiter.', 'With a free account I’ll transcribe photos and scans for you. Takes 30 seconds – then we carry on.') });
    if (!getAccount()) { P.close && P.close(); return fail(ui, L('Ohne Konto kann ich Fotos und Scans leider nicht lesen. PDFs mit Text, PowerPoint und Word gehen auch so.', 'Without an account I can’t read photos and scans. Text PDFs, PowerPoint and Word work anyway.')); }
  }
  if (P.kind === 'bild' || P.kind === 'scan') { prog.n = P.n; ocr = ocrAll(P, (d, n) => { prog.done = d; if (prog.el) prog.el.textContent = L(`Ich lese mit … Seite ${d} von ${n}`, `Reading along … page ${d} of ${n}`); }); ocr.catch(() => {}); }
  ui.view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, h('h2', {}, (TYP[res.typ] || TYP.sonstiges) + L(' erkannt', ' recognised')))));
  // Werkzeug gewählt: nicht fragen, nur passend ins Fach legen (falls es das Fach schon gibt) und direkt bauen
  const exF = tool ? (M.findFach(res.fach_vorhanden) || M.findFach(res.fach)) : null;
  const ans = tool ? (exF ? { name: clean(res.titel, 80), fach: exF.id, start: tool } : { skip: true, name: clean(res.titel, 80), start: tool }) : await placeModal(res, { prog, target: ui.target });
  let pages = P.text ? P.text.pages : null;
  if (ocr) {
    const scr = busy(ui.view, L('Ich schreib die Seiten ab …', 'Transcribing the pages …'), [L('Ich lese jede Seite …', 'Reading every page …'), L('Formeln und Tabellen auch …', 'Formulas and tables too …')]);
    const tick = setInterval(() => scr.sub(L(`Seite ${prog.done} von ${prog.n}`, `Page ${prog.done} of ${prog.n}`), prog.n ? prog.done / prog.n : 0), 300);
    try { const o = await ocr; pages = o.pages; if (o.partial) toast(L(`Ein paar Seiten konnte ich nicht lesen (${o.err?.message || 'Fehler'}). Der Rest ist drin.`, `I couldn’t read a few pages. The rest is in.`), 4200); }
    catch (e) { clearInterval(tick); scr.stop(); P.close && P.close(); if (['need_account', 'cap', 'limit'].includes(e.code)) await apiError(e); return fail(ui, e.message || L('Ich konnte die Seiten nicht lesen.', 'I couldn’t read the pages.'), () => location.reload()); }
    clearInterval(tick); scr.stop();
    if (P.total > P.n) toast(L(`Die ersten ${P.n} von ${P.total} Seiten sind drin.`, `The first ${P.n} of ${P.total} pages are in.`), 4200);
  }
  P.close && P.close();
  pages = (pages || []).map(x => String(x || '').trim());
  if (pages.join('').length < 40) return fail(ui, L('Darauf konnte ich keinen Text erkennen. Probier ein schärferes Foto oder eine andere Datei.', 'I couldn’t find any text on it. Try a sharper photo or another file.'));
  if (!pages.some(Boolean)) pages = [''];
  const name = clean(ans.name || res.titel || P.name, 80) || L('Unterlagen', 'Material');
  // Kontingent leer? Speichern geht trotzdem – Max nimmt sich das Skript vor, sobald wieder Antworten da sind
  const q = currentQuota(), empty = res.noQuota || (q && q.limit && (q.limit - (q.used || 0)) <= 0);
  const d = await createDoc({ name, pages, chars: pages.join('').length, extra: Object.assign({ kind: res.typ }, ocr ? { ocr: true } : {}, P.media ? { media: true } : {}, res.thema ? { thema: clean(res.thema, 80) } : {}, empty ? { waiting: Date.now() } : {}) });
  applyPlace(d, ans);
  ls.set('tutor.learn.doc', d.id);   // In „Lernen“ ist danach genau dieses Skript ausgewählt
  if (empty) {
    ls.set('tutor.room.focus', [d.id]); ls.set('tutor.attach.room', null);
    location.hash = '#/app/tutor';
    setTimeout(() => import('./ic.js').then(m => m.quotaWait(d.name)), 700);
    return;
  }
  if (tool) ls.set('tutor.addon', { doc: d.id, tool, at: Date.now() });   // nach dem Werkzeug: Lernplan als Extra anbieten
  location.hash = route(d, ans);
}

// Fragen: Fach · Wofür · Wann · Womit starten – alles vorausgefüllt und optional
export async function placeModal(res, { prog = null, target = null, topic = false } = {}) {
  const me = M.getMe();
  const ex = M.findFach(res.fach_vorhanden) || M.findFach(res.fach) || (res.titel ? M.guessFach(res.titel) : null);
  const term = (res.termine || []).find(t => (t.art === 'klausur' || t.art === 'test' || t.art === 'abgabe') && isoOk(t.datum) && t.datum >= today() && (!t.fach || !ex || M.findFach(t.fach)?.id === ex.id || t.quelle === 'notiz')) || null;
  const exTerm = ex && ex.klausur && ex.klausur >= today() ? { art: ex.klausurArt || 'klausur', datum: ex.klausur } : null;
  const st = {
    fach: ex ? ex.id : res.fach ? 'new' : '',
    ziel: res.ziel || term?.art || (exTerm ? exTerm.art : ''),
    datum: term?.datum || exTerm?.datum || '',
    start: ''
  };
  if (st.ziel === 'verstehen') st.datum = '';
  const soon = st.datum && daysTo(st.datum) <= 28;
  st.start = target && ['tutor', 'plan', 'quiz', 'karten', 'podcast', 'zettel', 'pfad'].includes(target) ? target : topic ? 'tutor' : res.typ === 'altklausur' ? 'quiz' : res.typ === 'uebung' ? 'tutor' : soon ? 'plan' : 'hub';

  const name = h('input', { class: 'ik-name', value: clean(res.titel, 80), maxlength: 80, spellcheck: 'false', 'aria-label': L('Name', 'Name') });
  const sug = res.fach && !ex ? clean(res.fach, 60) : '';
  const newName = h('input', { class: 'field', value: '', maxlength: 60, placeholder: L('Name des neuen Fachs', 'New subject name') });
  const fach = h('select', { class: 'field' }, h('option', { value: '' }, L('– keinem Fach –', '– no subject –')), me.faecher.map(f => h('option', { value: f.id, selected: st.fach === f.id || null }, f.name)),
    sug ? h('option', { value: 'new', selected: st.fach === 'new' || null }, L(`+ Neu: ${sug}`, `+ New: ${sug}`)) : null, h('option', { value: 'new2' }, L('+ Anderes neues Fach …', '+ Other new subject …')));
  const newRow = h('label', { class: 'ik-nr', hidden: true }, newName);
  fach.addEventListener('change', () => { st.fach = fach.value; newRow.hidden = st.fach !== 'new2'; if (!newRow.hidden) newName.focus(); });
  const seg = (opts, key, onch) => { const w = h('div', { class: 'ik-seg', role: 'radiogroup' }); const paint = () => w.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === st[key]); b.setAttribute('aria-checked', b.dataset.v === st[key] ? 'true' : 'false'); }); opts.forEach(([v, t, ic]) => w.append(h('button', { type: 'button', role: 'radio', 'data-v': v, onclick: () => { st[key] = st[key] === v && key === 'ziel' ? '' : v; paint(); onch && onch(); } }, ic ? h('span', { html: ico(ic) }) : null, t))); paint(); return w; };
  const date = h('input', { class: 'field', type: 'date', value: st.datum, min: today() });
  date.addEventListener('change', () => { st.datum = date.value; dHint.textContent = hint(); });
  const hint = () => st.datum ? (daysTo(st.datum) === 0 ? L('heute', 'today') : daysTo(st.datum) > 0 ? L(`in ${daysTo(st.datum)} Tagen`, `in ${daysTo(st.datum)} days`) : '') + (term && term.datum === st.datum && term.quelle === 'notiz' ? L(' · aus deiner Notiz', ' · from your note') : term && term.datum === st.datum ? L(' · stand im Dokument', ' · found in the document') : exTerm && exTerm.datum === st.datum ? L(' · schon eingetragen', ' · already saved') : '') : '';
  const dHint = h('small', { class: 'ik-dh' }, hint());
  const dRow = h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Wann?', 'When?')), h('div', { class: 'ik-dw' }, date, dHint));
  const syncDate = () => { dRow.hidden = !['klausur', 'test', 'abgabe'].includes(st.ziel); };
  const ziel = seg([['klausur', L('Klausur', 'Exam')], ['test', L('Test', 'Test')], ['abgabe', L('Abgabe', 'Deadline')], ['verstehen', L('Nur verstehen', 'Just understand')]], 'ziel', syncDate);
  syncDate();
  const start = seg([['hub', L('Übersicht', 'Overview'), 'home'], ['tutor', L('Erklären', 'Explain'), 'chat'], ['plan', L('Lernplan', 'Study plan'), 'calendar'], ['karten', L('Karten', 'Cards'), 'cards'], ['quiz', 'Quiz', 'quiz']].filter(x => !topic || x[0] !== 'hub'), 'start');
  const progEl = prog && prog.n ? h('small', { class: 'ik-ocr' }, L(`Ich lese mit … Seite ${prog.done} von ${prog.n}`, `Reading along … page ${prog.done} of ${prog.n}`)) : null;
  if (prog) prog.el = progEl;
  const body = h('div', { class: 'ik-place' },
    h('div', { class: 'ik-nw' }, name),
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Fach', 'Subject')), h('div', {}, fach, newRow)),
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Wofür?', 'What for?')), ziel),
    dRow,
    h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, L('Womit starten?', 'Start with?')), start),
    progEl);
  const uns = !res.offline && res.typ !== 'thema' ? (TYP[res.typ] || TYP.sonstiges) + L(' erkannt', ' recognised') + (ex ? ' · ' + ex.name : res.fach ? ' · ' + clean(res.fach, 40) : '') : topic ? L('Kurzskript fertig', 'Short script ready') : L('Neuer Stoff', 'New material');
  const r = await modal({ cls: 'ik-modal', eyebrow: uns, title: L('Wo gehört das hin?', 'Where does this go?'), text: L('Alles optional – du kannst das später jederzeit ändern.', 'All optional – you can change it any time.'), body,
    actions: [{ label: L('Überspringen', 'Skip'), value: 'skip' }, { label: L('Los geht’s', 'Let’s go'), value: 'ok', primary: true }] });
  if (prog) prog.el = null;
  if (r !== 'ok') return { skip: true, name: name.value.trim(), start: target || (topic ? 'tutor' : 'hub') };
  return { name: name.value.trim(), fach: st.fach === 'new2' ? (newName.value.trim() ? 'new' : '') : st.fach, newFach: st.fach === 'new' ? sug : st.fach === 'new2' ? clean(newName.value, 60) : '', kurz: clean(res.kuerzel, 12), ziel: st.ziel, datum: ['klausur', 'test', 'abgabe'].includes(st.ziel) ? isoOk(st.datum) : '', start: st.start };
}

// Antworten umsetzen: Skript ins Fach, Termin eintragen
export function applyPlace(d, ans) {
  if (!ans || ans.skip) { if (ans && ans.name && ans.name !== d.name) { d.name = ans.name; save(d); } return; }
  if (ans.name && ans.name !== d.name) { d.name = ans.name; save(d); }
  if (!ans.fach) { if (ans.datum) ls.set('tutor.goal', Object.assign({}, ls.get('tutor.goal', {}) || {}, { examDate: ans.datum })); return; }
  M.updateMe(m => {
    let f = ans.fach === 'new' ? null : m.faecher.find(x => x.id === ans.fach);
    if (!f) {
      const nm = ans.newFach || L('Neues Fach', 'New subject');
      f = m.faecher.find(x => x.name.toLowerCase() === nm.toLowerCase());
      if (!f) { f = { id: uid(), created: Date.now(), name: nm, kurz: ans.kurz || '', klausur: '', ects: '', docs: [], termine: [] }; m.faecher.push(f); }
    }
    m.faecher.forEach(x => { if (x !== f) x.docs = (x.docs || []).filter(id => id !== d.id); });
    f.docs = [...new Set([...(f.docs || []), d.id])];
    if (ans.datum && ['klausur', 'test', 'abgabe'].includes(ans.ziel)) M.addTerminTo(f, { art: ans.ziel, datum: ans.datum });
  });
}
export function route(d, ans) {
  const s = ans && ans.start || 'hub';
  // Aus dem Chat reingezogen/eingefügt: zurück in den Tutor-Raum, mit genau diesem Skript (außer man wählt aktiv etwas anderes)
  if (ls.get('tutor.attach.room')) { ls.set('tutor.attach.room', null); if (['hub', 'tutor', ''].includes(s)) { ls.set('tutor.room.focus', [d.id]); return '#/app/tutor'; } }
  if (s === 'tutor') { ls.set('tutor.pendingAsk', d.kind === 'uebung' ? L('Geh mit mir die erste Aufgabe durch – erst den Ansatz, dann den Lösungsweg Schritt für Schritt.', 'Walk me through the first exercise – approach first, then the solution step by step.') : d.kind === 'altklausur' ? L('Welche Aufgabentypen kommen in dieser Klausur vor, und wie gehe ich sie an?', 'Which kinds of tasks are in this exam, and how do I tackle them?') : L('Erklär mir das wichtigste Thema aus dem Skript an der Tafel – mit Beispiel.', 'Explain the most important topic from the slides on the whiteboard – with an example.')); return `#/app/${d.id}/tutor`; }
  if (s === 'plan') return `#/app/${d.id}/plan`;
  if (s === 'karten') return `#/app/${d.id}/karten/auto`;
  if (s === 'quiz') return `#/app/${d.id}/quiz/auto`;
  if (['podcast', 'zettel', 'pfad'].includes(s)) return `#/app/${d.id}/${s}/auto`;
  return `#/app/${d.id}/hub/neu`;
}

// Kurzskript zu einem Thema: dieselben Fragen, danach weiter wie gewünscht
export async function placeTopic(d, data, target) {
  const res = { typ: 'thema', titel: d.name, fach: clean(data && data.subject, 60), fach_vorhanden: '', termine: [], ziel: '' };
  const exF = TOOLS.includes(target) ? M.findFach(res.fach) : null;
  const ans = TOOLS.includes(target) ? (exF ? { name: d.name, fach: exF.id, start: target } : { skip: true, name: d.name, start: target }) : await placeModal(res, { target, topic: true });   // Werkzeug gewählt: keine Fragen
  applyPlace(d, ans);
  ls.set('tutor.learn.doc', d.id);   // In „Lernen“ ist danach genau dieses Skript ausgewählt
  return ans;
}

// ---------- Abschrift (Fotos, Scans) in Paketen zu 3 Seiten, zwei gleichzeitig ----------
async function ocrAll(P, onProg) {
  const n = P.n, out = new Array(n).fill(''), batches = [];
  for (let i = 0; i < n; i += 3) batches.push([i, Math.min(n, i + 3)]);
  let idx = 0, done = 0, err = null;
  const worker = async () => {
    while (idx < batches.length && !err) {
      const [a, b] = batches[idx++];
      const images = []; for (let i = a; i < b; i++) images.push(await P.img(i));
      for (let tries = 0; ; tries++) {
        try {
          const r = await ask('ocr', { opts: { imgs: images.length, from: a + 1 } }, { images });
          const s = (r.data && r.data.seiten) || [];
          for (let i = a; i < b; i++) out[i] = String(s[i - a] || '');
          break;
        } catch (e) {
          if (e.code === 'slow' && tries < 5) { await sleep(9000); continue; }
          if (['ai', 'format', 'server', 'bilder', 'offline'].includes(e.code) && tries < 1) { await sleep(1500); continue; }
          err = e; return;
        }
      }
      done += b - a; onProg(done, n);
    }
  };
  await Promise.all([worker(), worker()]);
  if (err && !out.some(x => x.trim())) throw err;
  return { pages: out, partial: !!err, err };
}

// ---------- Anzeige ----------
function busy(view, title, lines) {
  const f = h('div', { class: 'face' }), bar = h('i'), sub = h('div', { class: 'sub' });
  view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, f, h('h2', { style: { margin: 0, letterSpacing: '-.03em' } }, title), h('div', { class: 'bar' }, bar), sub)));
  const fc = face(f); fc.set('think');
  const tb = thought(f, 'ingest', lines);
  const t0 = Date.now(); let fixed = null;
  const iv = setInterval(() => { if (!bar.isConnected) return clearInterval(iv); const s = (Date.now() - t0) / 1000; bar.style.width = (fixed != null ? Math.max(4, fixed * 100) : Math.min(92, 100 * (1 - Math.exp(-s / 14)))) + '%'; }, 200);
  return { stop() { clearInterval(iv); tb.stop(); try { fc.set('happy'); } catch (e) {} }, sub(t, p) { sub.textContent = t; fixed = p; } };
}
function fail(ui, msg, retry) {
  const f = h('div', { class: 'face' });
  const keep = () => { if (ui.target) ls.set('tutor.target', ui.target); };   // Andere Datei → bleibt beim gewählten Werkzeug
  const lab = h('label', { class: 'btn primary', for: 'fileApp', onclick: keep }, L('Andere Datei', 'Different file'));
  ui.view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, f, h('h2', { style: { margin: 0 } }, L('Da hakt was.', 'Something’s off.')), h('div', { class: 'sub' }, msg),
    h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' } }, retry ? h('button', { class: 'btn primary', type: 'button', onclick: retry }, L('Nochmal versuchen', 'Try again')) : null, retry ? h('label', { class: 'btn', for: 'fileApp', onclick: keep }, L('Andere Datei', 'Different file')) : lab))));
  const fc = face(f); fc.set('sad');
}
