// „Kurz personalisieren“: bevor Max etwas Neues baut, ein kleines Pop-up mit den wichtigsten Wünschen.
// Erst „Erstellen“ startet – die Auswahl wird an die Ansicht übergeben (einmalig, 5 Min. gültig) und fürs nächste Mal gemerkt.
import { h, ico, ls, modal } from './util.js';
import { L } from './i18n.js';
import { COST } from './api.js';
import { SPICE } from './max.js';

export function setCreate(tool, docId, opts) { ls.set('tutor.create', { tool, doc: docId, opts: opts || {}, at: Date.now() }); }
export function takeCreate(tool, docId) {
  const c = ls.get('tutor.create', null);
  if (!c || c.tool !== tool || c.doc !== docId || Date.now() - (c.at || 0) > 5 * 60e3) return null;
  ls.set('tutor.create', null);
  return c.opts || {};
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

// Liefert die gewählten Optionen – oder null, wenn abgebrochen
export async function personalise(tab, doc) {
  if (!TOOL[tab]) return {};
  const chapters = doc.path?.chapters || [];
  const DEF = {
    karten: { focus: -1, count: 16, art: 'mix' },
    quiz: { focus: -1, count: 8, diff: 'mittel', types: ['mc', 'tf', 'match', 'order', 'cloze', 'num'] },
    zettel: { len: 'kurz', art: 'mix' },
    podcast: { focus: -1, len: 'kurz', lang: document.documentElement.lang === 'en' ? 'en' : 'de', tone: 2, voice: ls.get('tutor.podVoice', 'max') },
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
    return row(L('Umfang', 'Scope'), sel);
  };

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
  const r = await modal({
    cls: 'ik-modal ik-pers', eyebrow: L('Kurz personalisieren · ', 'Quick setup · ') + eyebrow, title,
    body: h('div', { class: 'ik-place' }, body.filter(Boolean), h('p', { class: 'ik-for' }, h('span', { html: ico('file') }), doc.name)),
    actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: [L('Erstellen', 'Create'), cost ? h('span', { class: 'k', title: L('KI-Einheiten', 'AI credits') }, cost) : null], value: 'ok', primary: true }],
  });
  if (r !== 'ok') return null;
  const keep = Object.assign({}, st); delete keep.focus;
  ls.set('tutor.pers.' + tab, keep);
  if (tab === 'podcast') ls.set('tutor.podVoice', st.voice);
  return st;
}
