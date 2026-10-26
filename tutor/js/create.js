// „Kurz personalisieren“: bevor Max etwas Neues baut, ein kleines Pop-up mit den wichtigsten Wünschen.
// Erst „Erstellen“ startet – die Auswahl wird an die Ansicht übergeben (einmalig, 5 Min. gültig) und fürs nächste Mal gemerkt.
import { h, ico, ls, modal } from './util.js';
import { L, getOutLang } from './i18n.js';
import { COST } from './api.js';
import { SPICE } from './max.js';
import { S, save } from './state.js';
import { langPicker } from './srclang.js';
import { ACCEPT } from './ingest.js';

export function setCreate(tool, docId, opts) { ls.set('tutor.create', { tool, doc: docId, opts: opts || {}, at: Date.now() }); }
export function takeCreate(tool, docId) {
  const c = ls.get('tutor.create', null);
  // '*' = Wahl gilt für den Stoff, der gleich erst entsteht (Thema oder Upload) – dafür länger gültig
  if (!c || c.tool !== tool || (c.doc !== docId && c.doc !== '*') || Date.now() - (c.at || 0) > (c.doc === '*' ? 90 : 5) * 60e3) return null;
  ls.set('tutor.create', null);
  return c.opts || {};
}

// /auto ohne vorherige Auswahl (nach Thema/Upload, von Max oder einem Werkzeug-Knopf): erst kurz personalisieren, dann direkt erstellen
export async function autoOpts(tab, doc) {
  const o = takeCreate(tab, doc.id);
  if (o) return o;
  // Kein Zwischenfenster mehr: sofort mit deinen letzten bzw. den Standard-Einstellungen loslegen – anpassen geht im Werkzeug selbst
  const q = quickOpts(tab);
  if (q && Object.keys(q).length) return q;
  return personalise(tab, doc);
}

// Für den Lernzettel: Wünsche als klare Anweisung vor das Material
export function zettelHint(o) {
  if (!o) return '';
  const len = o.len === 'lang'
    ? L('ausführlich – jedes Thema mit kurzer Erklärung, Beispiel und Formel, darf 2–3 Seiten lang sein', 'detailed – every topic with a short explanation, example and formula, may run to 2–3 pages')
    : L('kurz – höchstens eine Seite, nur Kernaussagen, knappe Stichpunkte', 'short – one page at most, key statements only, terse bullet points');
  const art = { begriffe: L('Schwerpunkt auf Begriffen und Definitionen', 'focus on terms and definitions'), formeln: L('Schwerpunkt auf Formeln und Rechenwegen, mit je einem Mini-Beispiel', 'focus on formulas and workings, each with a mini example'), klausur: L('Schwerpunkt auf dem, was typischerweise in der Klausur drankommt, inkl. typischer Fehler', 'focus on what typically comes up in the exam, incl. classic mistakes') }[o.art];
  return L(`[Wunsch für diesen Lernzettel: ${len}${art ? '; ' + art : ''}.]\n\n`, `[Request for this study sheet: ${len}${art ? '; ' + art : ''}.]\n\n`);
}

const TOOL = {
  karten: 'cards', quiz: 'quiz', zettel: 'summary', podcast: 'podcast',
};
const TITLE = {
  karten: [L('Karteikarten', 'Flashcards'), L('Wie sollen deine Karten sein?', 'What should your cards be like?')],
  quiz: ['Quiz', L('Wie soll dein Quiz sein?', 'What should your quiz be like?')],
  zettel: [L('Lernzettel', 'Study sheet'), L('Wie soll dein Lernzettel sein?', 'What should your study sheet be like?')],
  podcast: ['Podcast', L('Wie soll deine Folge klingen?', 'How should your episode sound?')],
};

// Direkt aus dem Chat mit Max („mach mir einen Podcast“): kein Zwischen-Fenster, Standard + zuletzt gewählte Einstellungen
export function quickOpts(tab) { const D = defOf(tab); return D ? Object.assign({}, D, ls.get('tutor.pers.' + tab, null) || {}, { focus: -1 }) : {}; }
function defOf(tab) {
  return {
    karten: { focus: -1, count: 16, art: 'mix' },
    quiz: { focus: -1, count: 8, diff: 'mittel', types: ['mc', 'tf', 'match', 'order', 'cloze', 'num'] },
    zettel: { len: 'kurz', art: 'mix' },
    podcast: { focus: -1, len: 'kurz', lang: getOutLang(), tone: 2, voice: ls.get('tutor.podVoice', 'max') },
  }[tab];
}
// Liefert die gewählten Optionen – oder null, wenn abgebrochen
export async function personalise(tab, doc, { fresh = false, langP = null } = {}) {
  if (!TOOL[tab]) return {};
  const chapters = doc?.path?.chapters || [];
  const DEF = {
    karten: { focus: -1, count: 16, art: 'mix' },
    quiz: { focus: -1, count: 8, diff: 'mittel', types: ['mc', 'tf', 'match', 'order', 'cloze', 'num'] },
    zettel: { len: 'kurz', art: 'mix' },
    podcast: { focus: -1, len: 'kurz', lang: getOutLang(), tone: 2, voice: ls.get('tutor.podVoice', 'max') },
  }[tab];
  const st = Object.assign({}, DEF, ls.get('tutor.pers.' + tab, null) || {});
  st.focus = -1; // Umfang immer frisch: ganzes Skript als Standard

  const row = (label, ctl, hint) => h('div', { class: 'ik-q' }, h('div', { class: 'ik-ql' }, label), h('div', { class: 'ik-qc' }, ctl, hint || null));
  const seg = (opts, key, onPick) => {
    const w = h('div', { class: 'ik-seg' });
    const paint = () => w.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(st[key]) === b.dataset.v));
    opts.forEach(([v, t]) => w.append(h('button', { type: 'button', 'data-v': String(v), onclick: () => { st[key] = v; paint(); onPick && onPick(v); } }, t)));
    paint(); return w;
  };
  // Mehrfachauswahl (mind. eins bleibt an)
  const multi = (opts, key) => {
    const w = h('div', { class: 'ik-seg multi' });
    const paint = () => w.querySelectorAll('button').forEach(b => { const on = st[key].includes(b.dataset.v); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    opts.forEach(([v, t]) => w.append(h('button', { type: 'button', 'data-v': v, onclick: () => {
      const has = st[key].includes(v);
      if (has && st[key].length === 1) { w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); return; }
      st[key] = has ? st[key].filter(x => x !== v) : [...st[key], v]; paint();
    } }, h('span', { class: 'ik-ck', html: ico('check') }), t)));
    paint(); return w;
  };
  const scope = () => {
    if (!chapters.length) return null;
    const sel = h('select', { class: 'field ik-sel', onchange: e => { st.focus = +e.target.value; } },
      h('option', { value: -1 }, L('Ganzes Skript', 'Whole script')),
      chapters.map((c, i) => h('option', { value: i }, `${i + 1}. ${c.title}`)));
    scopeRow = row(L('Umfang', 'Scope'), sel);
    return scopeRow;
  };
  let scopeRow = null;
  // Stoff frei wählen: anderes Skript, ein Thema oder eine eigene Datei – Umfang gilt nur fürs offene Skript
  const pick = srcPicker(doc, { onChange: () => { if (scopeRow) scopeRow.hidden = !pick.here(); } });

  let body;
  if (tab === 'karten') {
    body = [scope(),
      row(L('Anzahl', 'Number'), seg([[10, '10'], [16, '16'], [24, '24']], 'count')),
      row(L('Schwerpunkt', 'Focus'), seg([['mix', L('Gemischt', 'Mixed')], ['begriffe', L('Begriffe', 'Terms')], ['formeln', L('Formeln & Rechnen', 'Formulas & maths')], ['klausur', L('Klausurfragen', 'Exam questions')]], 'art'))];
  } else if (tab === 'quiz') {
    const { TYPE_LABEL } = await import('./quiz.js');
    body = [scope(),
      row(L('Fragen', 'Questions'), seg([[5, '5'], [8, '8'], [12, '12']], 'count')),
      row(L('Schwierigkeit', 'Difficulty'), seg([['leicht', L('Leicht', 'Easy')], ['mittel', L('Mittel', 'Medium')], ['schwer', L('Schwer', 'Hard')], ['klausur', L('Klausur', 'Exam level')]], 'diff')),
      row(L('Fragetypen', 'Question types'), multi(['mc', 'tf', 'match', 'order', 'cloze', 'num'].map(t => [t, TYPE_LABEL[t] || t]), 'types'),
        h('small', { class: 'ik-hint' }, L('Antippen zum An- und Abwählen', 'Tap to switch on or off')))];
  } else if (tab === 'zettel') {
    body = [
      row(L('Länge', 'Length'), seg([['kurz', L('Kurz · 1 Seite', 'Short · 1 page')], ['lang', L('Ausführlich', 'Detailed')]], 'len')),
      row(L('Art', 'Style'), seg([['mix', L('Ausgewogen', 'Balanced')], ['begriffe', L('Begriffe', 'Terms')], ['formeln', L('Formeln & Rechenwege', 'Formulas & workings')], ['klausur', L('Klausurfokus', 'Exam focus')]], 'art'))];
  } else {
    const TONE_HINT = { 1: L('Komplett sachlich – wie eine gute Vorlesung zum Anhören.', 'Strictly factual – like a good lecture to listen to.'), 2: L('Locker, mit ein paar Sprüchen von Max.', 'Relaxed, with a few quips from Max.'), 3: L('Max dreht auf: Sylt, Porsche, Papas Holding. Fachlich trotzdem exakt.', 'Max goes all out: Sylt, the Porsche, Daddy’s holding company. Still spot-on.') };
    const th = h('small', { class: 'ik-hint' }, TONE_HINT[st.tone] || '');
    body = [scope(),
      row(L('Länge', 'Length'), seg([['kurz', L('Kurz · ~5 Min.', 'Short · ~5 min')], ['lang', L('Lang · ~10 Min.', 'Long · ~10 min')]], 'len')),
      row(L('Sprache', 'Language'), seg([['de', 'Deutsch'], ['en', 'English']], 'lang')),
      row(L('So sprechen sie', 'How they talk'), seg(SPICE, 'tone', v => { th.textContent = TONE_HINT[v]; }), th),
      row(L('Max’ Stimme', 'Max’s voice'), seg([['max', L('Beim Aperol', 'Over Aperol')], ['feiern', L('Nach dem Feiern', 'After the party')]], 'voice'))];
  }
  const cost = COST[TOOL[tab]] || 0;
  const [eyebrow, title] = TITLE[tab];
  // Sprache: erkannte vorausgewählt; kommt die Erkennung erst nach dem Öffnen (Datei wird noch gelesen), wird nachgezogen – solange man nichts selbst gewählt hat
  let picked = false;
  const langRow = () => {
    const box = h('div', { class: 'ik-langbox' });
    const paint = src => box.replaceChildren(langPicker(src || 'de', st.outLang, c => { st.outLang = c; picked = true; }));
    st.outLang = doc.outLang || doc.srcLang || 'de'; paint(doc.srcLang);
    if (langP) langP.then(src => { if (!src || !box.isConnected) return; if (!picked) st.outLang = src; paint(src); }).catch(() => {});
    return row(L('Sprache', 'Language'), box);
  };
  const r = await modal({
    cls: 'ik-modal ik-pers', eyebrow: L('Kurz personalisieren · ', 'Quick setup · ') + eyebrow, title,
    // Gerade hochgeladen: Datei steht fest, dafür Sprache wählen (erkannte Sprache vorausgewählt)
    body: h('div', { class: 'ik-place' }, fresh ? row(L('Datei', 'File'), h('div', { class: 'ik-file1' }, h('span', { html: ico('file') }), h('b', {}, doc.name))) : row(L('Stoff', 'Material'), pick.el), fresh ? langRow() : null, body.filter(Boolean)),
    actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: [L('Erstellen', 'Create'), cost ? h('span', { class: 'k', title: L('KI-Einheiten', 'AI credits') }, cost) : null], value: 'ok', primary: true }],
    onAction: v => { if (v === 'ok' && !fresh && pick.check()) return false; }
  });
  if (r !== 'ok') return null;
  const keep = Object.assign({}, st); delete keep.focus;
  ls.set('tutor.pers.' + tab, keep);
  if (tab === 'podcast') ls.set('tutor.podVoice', st.voice);
  if (fresh) { if (doc.id && st.outLang && st.outLang !== doc.outLang) { doc.outLang = st.outLang; save(doc); } return st; }
  if (!pick.here()) { st.focus = -1; goSource(tab, pick.get(), st); return null; }
  return st;
}

// ---------- Stoff wählen: eins deiner Skripte, ein Thema (Max prüft es) oder eine eigene Datei ----------
// Überall gleich: im Personalisieren-Fenster, im Podcast- und Quiz-Formular und im Klausurplan.
const TABROUTE = { karten: 'karten', quiz: 'quiz', zettel: 'zettel', podcast: 'podcast', plan: 'plan', pfad: 'pfad' };
export function srcPicker(doc, { onChange } = {}) {
  const docs = S.list.slice().sort((a, b) => Math.max(b.used || 0, b.created || 0) - Math.max(a.used || 0, a.created || 0));
  if (doc && !docs.some(d => d.id === doc.id)) docs.unshift(doc);
  const st = { kind: docs.length ? 'doc' : 'file', id: doc ? doc.id : (docs[0] && docs[0].id), topic: '', files: [] };
  const sel = h('select', { class: 'field sp-doc', 'aria-label': L('Skript', 'Slides') }, docs.map(d => h('option', { value: d.id, selected: d.id === st.id || null }, (d.generated ? '💡 ' : '') + d.name)));
  sel.addEventListener('change', () => { st.id = sel.value; err.textContent = ''; onChange && onChange(get()); });
  const inp = h('input', { class: 'field sp-topic', maxlength: 160, placeholder: L('Thema, z. B. Kapitalwertmethode', 'Topic, e.g. net present value'), 'aria-label': L('Thema', 'Topic'), autocomplete: 'off' });
  inp.addEventListener('input', () => { st.topic = inp.value; err.textContent = ''; });
  const fin = h('input', { type: 'file', class: 'sr', accept: ACCEPT, multiple: true });
  const fname = h('small', { class: 'sp-fn' }, L('oder tippen zum Auswählen · PDF, PowerPoint, Word, Foto, Video', 'or tap to choose · PDF, PowerPoint, Word, photo, video'));
  const drop = h('label', { class: 'sp-drop' }, fin, h('span', { html: ico('upload') }), h('b', {}, L('Datei hier reinziehen', 'Drop a file here')), fname);
  const setFiles = f => { st.files = [...(f || [])].filter(Boolean); fname.textContent = st.files.length ? st.files.map(x => x.name).join(', ') : L('oder tippen zum Auswählen · PDF, PowerPoint, Word, Foto', 'or tap to choose · PDF, PowerPoint, Word, photo'); drop.classList.toggle('has', !!st.files.length); err.textContent = ''; };
  fin.addEventListener('change', () => setFiles(fin.files));
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('on'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('on'); }));
  drop.addEventListener('drop', e => setFiles(e.dataTransfer && e.dataTransfer.files));
  const hint = h('small', { class: 'ik-hint sp-hint' });
  const err = h('div', { class: 'sp-err', role: 'alert' });
  const panes = { doc: sel, topic: inp, file: drop };
  const HINT = { doc: '', topic: L('Ich prüfe, ob es das Fachthema gibt, und schreib dir dazu ein Kurzskript (2 Einheiten).', 'I check that the topic exists and write you a short script on it (2 credits).'), file: L('Ich lese die Datei, ordne sie ein und erstelle dann genau das hier.', 'I read the file, sort it in and then create exactly this.') };
  const seg = h('div', { class: 'ik-seg sp-seg', role: 'radiogroup' }, [['doc', L('Skript', 'Slides')], ['topic', L('Thema', 'Topic')], ['file', L('Eigene Datei', 'Own file')]].filter(([k]) => k !== 'doc' || docs.length).map(([k, t]) =>
    h('button', { type: 'button', role: 'radio', 'data-v': k, onclick: () => { st.kind = k; paint(); onChange && onChange(get()); if (k === 'topic') setTimeout(() => inp.focus(), 30); } }, t)));
  const box = h('div', { class: 'sp-box' });
  function paint() {
    seg.querySelectorAll('button').forEach(b => { const on = b.dataset.v === st.kind; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); });
    box.replaceChildren(panes[st.kind]); hint.textContent = HINT[st.kind]; hint.hidden = !HINT[st.kind]; err.textContent = '';
  }
  const get = () => ({ kind: st.kind, id: st.id, topic: st.topic.trim(), files: st.files });
  // Nur echte Eingaben durchlassen – ob es das Thema wirklich gibt, prüft Max danach (sonst fragt er nach)
  const check = () => {
    if (st.kind === 'topic') { const t = st.topic.trim(); if (t.length < 2 || !/\p{L}/u.test(t)) return L('Schreib ein Thema rein – z. B. „Kapitalwert“.', 'Type a topic – e.g. “net present value”.'); }
    if (st.kind === 'file' && !st.files.length) return L('Wähl eine Datei aus oder zieh sie rein.', 'Choose a file or drop it in.');
    if (st.kind === 'doc' && !st.id) return L('Wähl ein Skript.', 'Pick some slides.');
    return '';
  };
  const el = h('div', { class: 'sp' }, seg, box, hint, err);
  paint();
  return { el, get, check: () => { const m = check(); err.textContent = m; return m; }, here: () => st.kind === 'doc' && doc && st.id === doc.id };
}
// Anderer Stoff als das offene Skript: dorthin wechseln – oder erst Thema/Datei verarbeiten, danach direkt dieses Werkzeug
export async function goSource(tab, src, opts) {
  const route = TABROUTE[tab] || tab, auto = tab !== 'plan';
  if (src.kind === 'doc') { if (auto) setCreate(tab, src.id, opts || {}); location.hash = `#/app/${src.id}/${route}${auto ? '/auto' : ''}`; return; }
  if (auto) setCreate(tab, '*', opts || {});
  ls.set('tutor.target', tab);
  const m = await import('./app.js');
  if (src.kind === 'topic') return m.startTopic(src.topic);
  if (src.kind === 'file') return m.startUpload(src.files);
}
