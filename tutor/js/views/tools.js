// Klausur-Tools: Übersicht über alle Werkzeuge für die Klausur. Excel-Helfer groß oben, darunter Klausurplan,
// Klausur-Simulator, Rechner und BWL-Lexikon als Karten.
import { h, ico, ls } from '../util.js';
import { L, getOutLang } from '../i18n.js';
import { S, save } from '../state.js';
const fromTools = () => { try { sessionStorage.setItem('tutor.backTo', 'tools'); } catch (e) {} };
export const toolsBack = () => h('a', { class: 'kt-back', href: '#/app/tools' }, h('span', { html: ico('left') }), L('Zurück zu Klausur-Tools', 'Back to exam tools'));

const XLS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 1.5h8.3l5.3 5.3v13.7a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#1D6F42"/><path d="M14.5 1.5v3.6a1.7 1.7 0 0 0 1.7 1.7h3.6z" fill="#8fd1ac"/><text x="12" y="17.6" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="6.6" font-weight="700" fill="#fff">XLS</text></svg>';

export function render(root, { sub = '' } = {}) {
  if (sub === 'simulator' || sub === 'plan') return docPick(root, sub);
  if (sub === 'lexikon') return lexikon(root);
  const wrap = h('div', { class: 'view-in kt' }); root.appendChild(wrap);
  wrap.addEventListener('click', e => { if (e.target.closest('a[href^="#/app/excel"], a[href^="#/app/rechner"]')) fromTools(); });
  // kleine Vorschau: Formel + Zellen, die richtige Zelle leuchtet grün
  const xlPrev = h('span', { class: 'rm-xlp big kt-xlp', 'aria-hidden': 'true' },
    h('span', { class: 'rm-xlf' }, h('i', {}, 'fx'), '=NBW(8%;B2:B6)+B1'),
    h('span', { class: 'rm-xlg' }, ...['', 'A', 'B', '1', L('Investition', 'Investment'), '-50.000 €', '2', L('Rückflüsse (5 J.)', 'Inflows (5 yrs)'), L('14.000 € p. a.', '€14,000 p.a.'), '3', L('Kapitalwert', 'NPV'), '5.312 €'].map((x, i) => h('i', { class: (i < 3 || i % 3 === 0 ? 'hd' : '') + (i === 11 ? ' hit' : '') }, x))));
  const hero = h('section', { class: 'kt-hero' },
    h('div', { class: 'kt-hl' },
      h('div', { class: 'kt-badges' }, h('span', { class: 'kt-xls', html: XLS }), h('span', { class: 'kt-new' }, L('Neu', 'New'))),
      h('h2', {}, L('Excel-Helfer', 'Excel helper')),
      h('p', {}, L('60 geprüfte Vorlagen mit echten Formeln – nur die blauen Felder ausfüllen. Oder Aufgabe beschreiben, und Max baut dir die Excel-Datei, doppelt nachgerechnet.', '60 checked templates with real formulas – just fill in the blue cells. Or describe your task and Max builds the Excel file, double-checked.')),
      h('div', { class: 'kt-btns' },
        h('a', { class: 'kt-go', href: '#/app/excel' }, h('span', { html: ico('sheet') }), L('Vorlagen öffnen', 'Open templates')),
        h('a', { class: 'kt-sec', href: '#/app/excel/generator' }, h('span', { html: ico('spark') }), L('Generator', 'Generator')),
        h('a', { class: 'kt-sec', href: '#/app/excel/trainer' }, h('span', { html: ico('play') }), L('Excel-Trainer', 'Excel trainer')))),
    h('a', { class: 'kt-hr', href: '#/app/excel', 'aria-label': L('Excel-Vorlagen öffnen', 'Open Excel templates') }, xlPrev));
  const card = (icon, t, s, cta, act, tone) => h(typeof act === 'string' ? 'a' : 'button', Object.assign({ class: 'kt-card kt-' + tone }, typeof act === 'string' ? { href: act } : { type: 'button', onclick: act }),
    h('span', { class: 'kt-ci', html: ico(icon) }), h('b', {}, t), h('small', {}, s), h('span', { class: 'kt-cg' }, cta, h('span', { html: ico('right') })));
  const grid = h('div', { class: 'kt-grid' },
    card('calendar', L('Klausurplan', 'Exam plan'), L('Skript rein, Klausurtermin wählen – Max plant dir jeden Tag bis zur Klausur.', 'Add your slides and exam date – Max plans every day until the exam.'), L('Plan erstellen', 'Create plan'), '#/app/tools/plan', 'plan'),
    card('exam', L('Klausur-Simulator', 'Exam simulator'), L('Eine echte Probeklausur mit Zeit, Punkten und Musterlösung – aus deinem Stoff.', 'A real mock exam with time limit, points and model answers – from your material.'), L('Probeklausur starten', 'Start mock exam'), '#/app/tools/simulator', 'sim'),
    card('calc', L('Rechner', 'Calculators'), L('Kapitalwert, Break-even, Abschreibung & Co. – mit Rechenweg zum Abschreiben.', 'NPV, break-even, depreciation & more – with the full working.'), L('Rechner öffnen', 'Open calculators'), '#/app/rechner', 'calc'),
    card('book', L('BWL-Lexikon', 'Glossary'), L('Über 1.000 Fachbegriffe, kurz und klausurtauglich erklärt.', 'Over 1,000 terms, explained briefly and exam-ready.'), L('Lexikon öffnen', 'Open glossary'), '#/app/tools/lexikon', 'lex'));
  wrap.append(
    h('div', { class: 'kt-head' }, h('div', { class: 'eyebrow' }, L('Klausur-Tools', 'Exam tools')), h('h1', {}, L('Alles für die Klausur. ', 'Everything for the exam. '), h('span', {}, L('An einem Ort.', 'In one place.')))),
    hero, grid);
}

// ---------- BWL-Lexikon: eigene Seite mit Suche, Fachgebieten und A–Z ----------
async function lexikon(root) {
  const wrap = h('div', { class: 'view-in kt kt-sub kt-lx' }); root.appendChild(wrap);
  const norm = x => String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const q = h('input', { class: 'kt-lxq', type: 'search', placeholder: L('Begriff suchen – z. B. Skonto, Cashflow, Deckungsbeitrag …', 'Search a term – e.g. discount, cash flow …'), 'aria-label': L('Begriff suchen', 'Search term') });
  const cats = h('div', { class: 'kt-lxc' }), out = h('div', { class: 'kt-lxl' }), more = h('button', { class: 'kt-more', type: 'button', hidden: true }, L('Mehr anzeigen', 'Show more'));
  const count = h('small', { class: 'kt-lxn' });
  wrap.append(toolsBack(),
    h('div', { class: 'kt-subhead kt-lex' }, h('span', { class: 'kt-ci', html: ico('book') }), h('div', {}, h('div', { class: 'eyebrow' }, L('BWL-Lexikon', 'Glossary')), h('h1', {}, L('Jeder Begriff. ', 'Every term. '), h('span', {}, L('Klausurtauglich erklärt.', 'Explained for the exam.'))))),
    h('div', { class: 'kt-lxbar' }, h('span', { html: ico('search') }), q, count), cats, out, more);
  let D = [];
  try { D = await (await fetch('/tutor/data/lexikon.json')).json(); } catch (e) { out.append(h('p', { class: 'kt-lead' }, L('Das Lexikon konnte gerade nicht geladen werden.', 'The glossary could not be loaded.'))); return; }
  if (!wrap.isConnected) return;
  D.sort((a, b) => a.t.localeCompare(b.t, 'de'));
  const C = [...new Set(D.map(x => x.c).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'));
  let cat = '', lim = 40;
  const chip = (k, t) => h('button', { type: 'button', class: 'chip' + (k === cat ? ' on' : ''), onclick: () => { cat = k; lim = 40; cats.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.k === k)); draw(); }, 'data-k': k }, t);
  cats.append(chip('', L('Alle', 'All')), ...C.map(c => chip(c, c)));
  const draw = () => {
    const n = norm(q.value.trim());
    const hit = D.filter(x => (!cat || x.c === cat) && (!n || norm(x.t + ' ' + (x.a || []).join(' ')).includes(n) || (n.length > 3 && norm(x.d).includes(n))));
    hit.sort((a, b) => n ? (norm(b.t).startsWith(n) - norm(a.t).startsWith(n)) : 0);
    count.textContent = hit.length + ' ' + L('Begriffe', 'terms');
    out.replaceChildren(...hit.slice(0, lim).map(x => h('article', { class: 'kt-term' },
      h('div', { class: 'kt-tt' }, h('b', {}, x.t), x.c ? h('span', { class: 'kt-tc' }, x.c) : null),
      h('p', {}, x.d),
      (x.a && x.a.length) ? h('small', { class: 'kt-ta' }, L('Auch: ', 'Also: ') + x.a.join(', ')) : null,
      (x.s && x.s.length) ? h('div', { class: 'kt-ts' }, h('small', {}, L('Siehe auch:', 'See also:')), ...x.s.map(t => h('button', { type: 'button', class: 'kt-tl', onclick: () => { q.value = t; cat = ''; cats.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.k === '')); lim = 40; draw(); wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, t))) : null)));
    if (!hit.length) out.append(h('p', { class: 'kt-lead' }, L('Kein Begriff gefunden. Frag Max einfach direkt – er erklärt dir jeden Begriff.', 'No term found. Just ask Max – he explains any term.')));
    more.hidden = hit.length <= lim;
  };
  more.onclick = () => { lim += 60; draw(); };
  q.addEventListener('input', () => { lim = 40; draw(); });
  draw();
}


// ---------- Werkzeug-Studio: Stoff + alle Einstellungen in EINER Karte ----------
// Gilt für Klausur-Simulator, Klausurplan (Klausur-Tools) und Tafel, Lernzettel, Karteikarten, Podcast, Lernpfad (Lernen)
const DIFF = [['leicht', L('Einsteiger', 'Beginner')], ['mittel', L('Mittel', 'Medium')], ['schwer', L('Fortgeschritten', 'Advanced')], ['klausur', L('Klausurniveau', 'Exam level')]];
const LANGS = [['de', 'Deutsch'], ['en', 'English']];
// Jede Einstellung hat ihre eigene Farbe – sonst sieht man nicht, was wozu gehört
const SC = { lang: ['#5aa2f7', '#1a5fc4'], diff: ['#9b7cf0', '#5b3fc4'], len: ['#f39b52', '#d9601c'], art: ['#3fc1c9', '#0e7f8e'], count: ['#f47ba0', '#c8336f'], tone: ['#ff7b7b', '#d63031'], voice: ['#7a8cf7', '#3f4fd6'], style: ['#3fc1c9', '#0e7f8e'], depth: ['#4cc38a', '#1c7a47'],
  minutes: ['#f39b52', '#d9601c'], pass: ['#4cc38a', '#1c7a47'], weekdays: ['#3fc1c9', '#0e7f8e'], goal: ['#f47ba0', '#c8336f'], types: ['#3fc1c9', '#0e7f8e'], qmix: ['#f7c948', '#d18e06'], mix: ['#3fc1c9', '#0e7f8e'], aids: ['#7a8cf7', '#3f4fd6'], exstyle: ['#ff7b7b', '#d63031'] };
const QT = [['mc', 'Multiple Choice'], ['tf', L('Richtig/Falsch', 'True/False')], ['match', L('Zuordnen', 'Matching')], ['order', L('Reihenfolge', 'Ordering')], ['cloze', L('Lückentext', 'Fill in')], ['num', L('Rechenaufgabe', 'Calculation')]];
const T = {
  simulator: { area: 'tools', tab: 'quiz', target: 'quiz', icon: 'exam', c: ['#9b7cf0', '#5b3fc4'], eyebrow: L('Klausur-Simulator', 'Exam simulator'), h: [L('Probeklausur. ', 'Mock exam. '), L('Wie in echt.', 'Like the real thing.')],
    lead: L('Echte Klausur aus deinem Stoff – mit Zeitlimit, Punkten, Note und Musterlösung.', 'A real exam from your material – time limit, points, grade and model answers.'),
    key: 'tutor.examCfg', def: { diff: 'klausur', minutes: 60, count: 12, pass: .5, silent: true, lang: getOutLang(), mix: 'gemischt', aids: 'rechner', exstyle: 'uni', wish: '' }, cta: L('Klausur starten', 'Start exam'), wish: true, chapters: true },
  plan: { area: 'tools', tab: 'plan', target: 'plan', icon: 'calendar', c: ['#f39b52', '#d9601c'], eyebrow: L('Klausurplan', 'Exam plan'), h: [L('Tag für Tag ', 'Day by day '), L('bis zur Klausur.', 'to the exam.')],
    lead: L('Max verteilt deinen Stoff auf die Tage bis zur Klausur – mit Wiederholungen und Probeklausur am Ende.', 'Max spreads your material over the days until the exam – with reviews and a mock exam at the end.'),
    key: 'tutor.planPrefs', def: { exam: new Date(Date.now() + 21 * 864e5).toLocaleDateString('sv-SE'), minutes: 60, weekdays: [0, 1, 2, 3, 4], goal: null, lang: getOutLang() }, cta: L('Plan erstellen', 'Create plan') },
  quiz: { area: 'ueben', tab: 'quiz', target: 'quiz', icon: 'quiz', c: ['#9b7cf0', '#5b3fc4'], eyebrow: 'Quiz', h: [L('Klausurfragen ', 'Exam questions '), L('mit Erklärung.', 'with explanations.')],
    lead: L('Max stellt dir Fragen aus deinem Stoff – in sechs Formaten, jede Antwort erklärt.', 'Max quizzes you on your material – six formats, every answer explained.'),
    key: 'tutor.pers.quiz', def: { count: 8, diff: 'mittel', types: ['mc', 'tf', 'match', 'order', 'cloze', 'num'], qmix: 'gemischt', lang: getOutLang(), wish: '' }, cta: L('Quiz starten', 'Start quiz'), wish: true, chapters: true },
  tafel: { area: 'ueben', tab: 'tutor', target: 'tutor', icon: 'board', c: ['#5aa2f7', '#1a5fc4'], eyebrow: L('An der Tafel erklären', 'Explain on the board'), h: [L('Max erklärt’s ', 'Max explains it '), L('an der Tafel.', 'on the board.')],
    lead: L('Max erklärt dir das Thema an der Tafel – Schritt für Schritt, mit Beispiel. Nachfragen jederzeit.', 'Max explains the topic on the board – step by step, with an example. Ask follow-ups any time.'),
    key: 'tutor.spec.tutor', def: { style: 'schritt', diff: 'mittel', lang: getOutLang(), topic: '', wish: '' }, cta: L('Erklärung starten', 'Start explanation'), wish: true },
  zettel: { area: 'ueben', tab: 'zettel', target: 'zettel', icon: 'note', c: ['#f7c948', '#d18e06'], eyebrow: L('Lernzettel', 'Study sheet'), h: [L('Alles Wichtige ', 'Everything important '), L('auf einer Seite.', 'on one page.')],
    lead: L('Definitionen, Formeln, Rechenwege und typische Klausurfallen – kompakt auf einem Zettel, plus Mindmap.', 'Definitions, formulas, workings and typical exam traps – compact on one sheet, plus a mind map.'),
    key: 'tutor.pers.zettel', def: { len: 'kurz', art: 'mix', diff: 'mittel', lang: getOutLang(), wish: '' }, cta: L('Lernzettel erstellen', 'Create study sheet'), wish: true },
  karten: { area: 'ueben', tab: 'karten', target: 'karten', icon: 'cards', c: ['#3fc1c9', '#0e7f8e'], eyebrow: L('Karteikarten', 'Flashcards'), h: [L('Wiederholen, ', 'Review '), L('bis es sitzt.', 'until it sticks.')],
    lead: L('Karteikarten aus deinem Stoff – mit Wiederholung im richtigen Abstand, damit es bis zur Klausur hängen bleibt.', 'Flashcards from your material – with spaced repetition so it sticks until the exam.'),
    key: 'tutor.pers.karten', def: { count: 16, art: 'mix', diff: 'mittel', lang: getOutLang(), wish: '' }, cta: L('Karteikarten erstellen', 'Create flashcards'), wish: true, chapters: true },
  podcast: { area: 'ueben', tab: 'podcast', target: 'podcast', icon: 'headphones', c: ['#f47ba0', '#c8336f'], eyebrow: 'Podcast', h: [L('Marie & Max ', 'Marie & Max '), L('zum Anhören.', 'to listen to.')],
    lead: L('Marie fragt, Max erklärt. Dein Stoff als Folge für Bahn, Gym oder die Schlange beim Bäcker.', 'Marie asks, Max explains. Your material as an episode for the train, the gym or the bakery queue.'),
    key: 'tutor.pers.podcast', def: { len: 'kurz', lang: getOutLang(), tone: 2, voice: 'max', diff: 'mittel', wish: '' }, cta: L('Podcast erstellen', 'Create podcast'), wish: true, chapters: true },
  lernpfad: { area: 'ueben', tab: 'pfad', target: 'pfad', icon: 'path', c: ['#7a8cf7', '#3f4fd6'], eyebrow: L('Lernpfad', 'Study path'), h: [L('Kapitel für Kapitel ', 'Chapter by chapter '), L('zum Ziel.', 'to the goal.')],
    lead: L('Max teilt deinen Stoff in Kapitel mit kurzen Lektionen und Checks auf – du arbeitest dich Schritt für Schritt durch.', 'Max splits your material into chapters with short lessons and checks – you work through step by step.'),
    key: 'tutor.spec.pfad', def: { depth: 'normal', diff: 'mittel', lang: getOutLang() }, cta: L('Lernpfad erstellen', 'Create study path') },
};
export const docPick = (root, sub) => studio(root, sub);
export const learnPick = (root, kind) => studio(root, kind);
function studio(root, kind) {
  const K = T[kind]; if (!K) { location.replace('#/app/ueben'); return; }
  const wrap = h('div', { class: 'view-in kt kt-sub kt-studio', style: { '--c1': K.c[0], '--c2': K.c[1] } }); root.appendChild(wrap);
  const st = Object.assign({}, K.def, ls.get(K.key, {}) || {}); st.focus = -1; st.topic = ''; st.wish = st.wish || '';
  if (!LANGS.some(x => x[0] === st.lang)) st.lang = 'de';
  let doc = null, files = null;
  const docs = S.list.filter(d => !d.sample); const list = (docs.length ? docs : S.list).slice(0, 40);
  // ---- Bausteine ----
  const seg = (opts, k, multi) => { const w = h('div', { class: 'ks-seg', style: SC[k] ? { '--s1': SC[k][0], '--s2': SC[k][1] } : null }); const on = v => multi ? st[k].includes(v) : String(st[k]) === String(v);
    const paint = () => w.querySelectorAll('button').forEach(b => b.classList.toggle('on', on(JSON.parse(b.dataset.v))));
    opts.forEach(([v, t]) => w.append(h('button', { type: 'button', 'data-v': JSON.stringify(v), onclick: () => { if (multi) st[k] = st[k].includes(v) ? (st[k].length > 1 ? st[k].filter(x => x !== v) : st[k]) : [...st[k], v].sort(); else st[k] = v; paint(); check(); } }, t)));
    paint(); return w; };
  const row = (label, el, cls) => h('div', { class: 'ks-row' + (cls ? ' ' + cls : ''), style: el && el.style && el.style.getPropertyValue('--s1') ? { '--rs1': el.style.getPropertyValue('--s1'), '--rs2': el.style.getPropertyValue('--s2') } : null }, h('label', { class: 'ks-l' }, label), el);
  // ---- Stoff: Drag & Drop, eigene Skripte, Thema ----
  const fin = h('input', { type: 'file', class: 'sr', multiple: true, accept: '.pdf,.ppt,.pptx,.doc,.docx,.txt,.md,image/*' });
  const dzT = h('b', {}, L('Datei hier reinziehen', 'Drop a file here')), dzS = h('small', {}, L('oder klicken – PDF, PowerPoint, Word, Foto', 'or click – PDF, PowerPoint, Word, photo'));
  const dz = h('button', { type: 'button', class: 'ks-drop', onclick: () => fin.click() }, h('span', { class: 'ks-di', html: ico('upload') }), h('span', { class: 'ks-dt' }, dzT, dzS));
  const setFiles = fs => { fs = [...(fs || [])]; if (!fs.length) return; files = fs; doc = null; st.topic = ''; topic.value = ''; paintDocs(); dz.classList.add('on'); dzT.textContent = fs.length === 1 ? fs[0].name : L(`${fs.length} Dateien`, `${fs.length} files`); dzS.textContent = L('Bereit – wird beim Start hochgeladen', 'Ready – uploads when you start'); drawScope(); check(); };
  fin.addEventListener('change', () => { setFiles(fin.files); fin.value = ''; });
  { let n = 0; dz.addEventListener('dragenter', e => { e.preventDefault(); n++; dz.classList.add('over'); }); dz.addEventListener('dragover', e => e.preventDefault()); dz.addEventListener('dragleave', () => { if (--n <= 0) { n = 0; dz.classList.remove('over'); } }); dz.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); n = 0; dz.classList.remove('over'); setFiles(e.dataTransfer.files); }); }
  const docBox = h('div', { class: 'ks-docs' });
  const paintDocs = () => docBox.querySelectorAll('.ks-doc').forEach(b => b.classList.toggle('on', !!doc && b.dataset.id === doc.id));
  list.forEach(d => docBox.append(h('button', { type: 'button', class: 'ks-doc', 'data-id': d.id, onclick: () => { doc = doc && doc.id === d.id ? null : d; files = null; dz.classList.remove('on'); dzT.textContent = L('Datei hier reinziehen', 'Drop a file here'); dzS.textContent = L('oder klicken – PDF, PowerPoint, Word, Foto', 'or click – PDF, PowerPoint, Word, photo'); st.topic = ''; topic.value = ''; if (doc && (doc.outLang || doc.srcLang) && LANGS.some(x => x[0] === (doc.outLang || doc.srcLang))) { st.lang = doc.outLang || doc.srcLang; langSeg.replaceWith(langSeg = seg(LANGS, 'lang')); } paintDocs(); drawScope(); check(); } },
    h('span', { class: 'ks-dic', html: ico(d.kind === 'video' ? 'captions' : 'file') }), h('span', { class: 'ks-dn' }, d.name || L('Skript', 'Slides')), h('span', { class: 'ks-ok', html: ico('check') }))));
  const topic = h('input', { class: 'ks-in', type: 'text', maxlength: 120, placeholder: L('Oder ein Thema – z. B. Kapitalwertmethode', 'Or a topic – e.g. net present value'), oninput: () => { st.topic = topic.value.trim(); if (st.topic) { doc = null; files = null; dz.classList.remove('on'); paintDocs(); drawScope(); } check(); } });
  // ---- Einstellungen ----
  let langSeg = seg(LANGS, 'lang');
  const scopeSel = h('select', { class: 'ks-in', onchange: () => { st.focus = +scopeSel.value; } });
  const scopeRow = row(L('Umfang', 'Scope'), scopeSel); scopeRow.hidden = true;
  const drawScope = () => { const chs = (K.chapters && doc && doc.path && doc.path.chapters) || []; st.focus = -1; scopeRow.hidden = !chs.length; scopeSel.replaceChildren(h('option', { value: -1 }, L('Ganzes Skript', 'Whole script')), ...chs.map((c, i) => h('option', { value: i }, `${i + 1}. ${c.title || L('Kapitel', 'Chapter')}`))); };
  const wishIn = h('textarea', { class: 'ks-in ks-wish', rows: 2, maxlength: 300, placeholder: L('Extra-Wunsch an Max (optional) – z. B. „mehr Rechenbeispiele“, „Fokus auf Kapitel 3“', 'Extra request for Max (optional) – e.g. “more worked examples”'), oninput: () => { st.wish = wishIn.value; } });
  wishIn.value = st.wish || '';
  const date = h('input', { type: 'date', class: 'ks-in', value: st.exam, min: new Date(Date.now() + 864e5).toLocaleDateString('sv-SE'), oninput: () => { st.exam = date.value; check(); } });
  const silent = h('input', { type: 'checkbox', checked: st.silent || null, onchange: () => { st.silent = silent.checked; } });
  const own = {
    quiz: () => [row(L('Schwierigkeit', 'Difficulty'), seg(DIFF, 'diff')), row(L('Fragen', 'Questions'), seg([[5, '5'], [8, '8'], [12, '12'], [16, '16'], [20, '20']], 'count')),
      row(L('Fragetypen', 'Question types'), seg(QT, 'types', true)), row(L('Art der Fragen', 'Question style'), seg([['gemischt', L('Gemischt', 'Mixed')], ['anwendung', L('Anwendung', 'Applied')], ['definition', L('Begriffe', 'Terms')], ['rechnen', L('Rechnen', 'Calculation')]], 'qmix'))],
    simulator: () => [row(L('Schwierigkeit', 'Difficulty'), seg(DIFF, 'diff')),
      row(L('Aufgabenart', 'Task type'), seg([['gemischt', L('Gemischt', 'Mixed')], ['rechnen', L('Rechenaufgaben', 'Calculations')], ['theorie', L('Theorie', 'Theory')], ['mc', 'Multiple Choice'], ['fall', L('Fallstudie', 'Case study')]], 'mix')),
      row(L('Prüfungsstil', 'Exam style'), seg([['uni', L('Uni', 'University')], ['fh', L('FH / Hochschule', 'Applied sciences')], ['ihk', 'IHK']], 'exstyle')),
      row(L('Hilfsmittel', 'Aids'), seg([['keine', L('Keine', 'None')], ['rechner', L('Taschenrechner', 'Calculator')], ['formel', L('+ Formelsammlung', '+ Formula sheet')]], 'aids')), row(L('Dauer', 'Duration'), seg([[30, '30'], [45, '45'], [60, '60'], [90, '90'], [120, '120 Min.']], 'minutes')), row(L('Aufgaben', 'Tasks'), seg([[8, '8'], [12, '12'], [14, '14']], 'count')), row(L('Bestanden ab', 'Pass mark'), seg([[.4, '40 %'], [.5, '50 %'], [.6, '60 %']], 'pass')),
      row('', h('label', { class: 'ks-chk' }, silent, h('span', {}, L('Klausurbedingungen: keine Hilfe, Auswertung erst am Ende', 'Exam conditions: no help, results at the end'))))],
    plan: () => [row(L('Klausurdatum', 'Exam date'), date), row(L('Pro Tag', 'Per day'), seg([[30, '30 Min.'], [60, '1 Std.'], [90, '1,5 Std.'], [120, '2 Std.'], [180, '3 Std.']], 'minutes')), row(L('Lerntage', 'Study days'), seg([[0, 'Mo'], [1, 'Di'], [2, 'Mi'], [3, 'Do'], [4, 'Fr'], [5, 'Sa'], [6, 'So']], 'weekdays', true)), row(L('Zielnote', 'Target grade'), seg([[null, L('Egal', 'Any')], [.95, '1,0'], [.85, '1,7'], [.75, '2,3'], [.65, '3,0'], [.5, L('Bestehen', 'Pass')]], 'goal'))],
    tafel: () => [row(L('Schwierigkeit', 'Difficulty'), seg(DIFF, 'diff')), row(L('Wie', 'How'), seg([['schritt', L('Schritt für Schritt', 'Step by step')], ['kurz', L('Kurzer Überblick', 'Quick overview')], ['rechnen', L('Mit Rechenaufgabe', 'With a worked task')]], 'style'))],
    zettel: () => [row(L('Schwierigkeit', 'Difficulty'), seg(DIFF, 'diff')), row(L('Länge', 'Length'), seg([['kurz', L('Kurz · 1 Seite', 'Short · 1 page')], ['lang', L('Ausführlich', 'Detailed')]], 'len')), row(L('Schwerpunkt', 'Focus'), seg([['mix', L('Ausgewogen', 'Balanced')], ['begriffe', L('Begriffe', 'Terms')], ['formeln', L('Formeln', 'Formulas')], ['klausur', L('Klausurfokus', 'Exam focus')]], 'art'))],
    karten: () => [row(L('Schwierigkeit', 'Difficulty'), seg(DIFF, 'diff')), row(L('Anzahl', 'Number'), seg([[10, '10'], [16, '16'], [24, '24'], [32, '32']], 'count')), row(L('Schwerpunkt', 'Focus'), seg([['mix', L('Gemischt', 'Mixed')], ['begriffe', L('Begriffe', 'Terms')], ['formeln', L('Formeln', 'Formulas')], ['klausur', L('Klausurfragen', 'Exam questions')]], 'art'))],
    podcast: () => [row(L('Schwierigkeit', 'Difficulty'), seg(DIFF, 'diff')), row(L('Länge', 'Length'), seg([['kurz', L('~5 Min.', '~5 min')], ['lang', L('~10 Min.', '~10 min')]], 'len')), row(L('Ton', 'Tone'), seg([[1, L('Sachlich', 'Factual')], [2, L('Locker', 'Relaxed')], [3, L('Max dreht auf', 'Max goes wild')]], 'tone')), row(L('Max’ Stimme', 'Max’s voice'), seg([['max', L('Beim Aperol', 'Over Aperol')], ['feiern', L('Nach dem Feiern', 'After the party')]], 'voice'))],
    lernpfad: () => [row(L('Schwierigkeit', 'Difficulty'), seg(DIFF, 'diff')), row(L('Tiefe', 'Depth'), seg([['kompakt', L('Kompakt', 'Compact')], ['normal', L('Normal', 'Normal')], ['gruendlich', L('Gründlich', 'Thorough')]], 'depth'))],
  }[kind]();
  const go = h('button', { class: 'ks-go', type: 'button', disabled: true, onclick: () => start() }, h('span', { html: ico(K.icon) }), K.cta);
  const hint = h('small', { class: 'ks-hint' });
  function check() {
    const has = !!(doc || files || st.topic);
    const ok = has && (kind !== 'plan' || (st.exam && st.weekdays.length));
    go.disabled = !ok;
    hint.textContent = !has ? L('Wähl ein Skript, zieh eine Datei rein oder nenn ein Thema.', 'Pick slides, drop a file or name a topic.') : doc ? L('Mit „', 'With “') + doc.name + L('“', '”') : files ? L('Mit deiner Datei', 'With your file') : L('Zum Thema „', 'On “') + st.topic + L('“', '”');
  }
  const saveSt = () => { const keep = Object.assign({}, st); delete keep.focus; delete keep.topic; ls.set(K.key, keep); if (kind === 'podcast') ls.set('tutor.podVoice', st.voice); };
  async function start() {
    saveSt();
    try { sessionStorage.setItem('tutor.backTo', K.area === 'tools' && !location.hash.startsWith('#/app/ueben') ? 'tools' : 'ueben'); } catch (e) {}
    const C = await import('../create.js');
    const o = Object.assign({}, st);
    const prime = id => {
      if (kind === 'simulator') ls.set('tutor.examGo', Date.now());
      else if (kind === 'plan') { try { sessionStorage.setItem('tutor.planPre', JSON.stringify({ at: Date.now(), o: { exam: st.exam, weekdays: st.weekdays, minutes: st.minutes, goal: st.goal } })); } catch (e) {} }
      else if (kind === 'tafel') { const pr = C.specPrompt(o, (doc && doc.name) || st.topic || ''); ls.set('tutor.pendingAsk', { t: pr.t + C.wishHint(o, true), show: pr.show }); }
      else if (kind !== 'lernpfad') C.setCreate(K.tab, id, o);
    };
    if (doc) {
      if (st.lang && doc.outLang !== st.lang) { doc.outLang = st.lang; save(doc); }
      if (kind === 'lernpfad') C.applySpec('pfad', doc, { depth: st.depth });
      prime(doc.id);
      location.hash = kind === 'simulator' ? `#/app/${doc.id}/quiz/exam` : kind === 'plan' ? `#/app/${doc.id}/plan` : kind === 'tafel' ? `#/app/${doc.id}/tutor` : `#/app/${doc.id}/${K.tab}/auto`;
      return;
    }
    prime('*'); ls.set('tutor.target', K.target);
    const A = await import('../app.js');
    if (files) A.startUpload(files); else A.startTopic(st.topic);
  }
  const inLearn = location.hash.startsWith('#/app/ueben');
  const back = K.area === 'tools' && !inLearn ? toolsBack() : h('a', { class: 'kt-back kt-backl', href: '#/app/ueben' }, h('span', { html: ico('left') }), L('Zurück zu Lernen', 'Back to Learn'));
  const wishRow = K.wish ? row(L('Extra-Wunsch', 'Extra request'), wishIn, 'ks-full') : null;
  wrap.append(back,
    h('section', { class: 'ks-card' },
      h('header', { class: 'ks-head' }, h('span', { class: 'ks-ic', html: ico(K.icon) }), h('div', {}, h('div', { class: 'eyebrow' }, K.eyebrow), h('h1', {}, K.h[0], h('span', {}, K.h[1])), h('p', {}, K.lead))),
      h('div', { class: 'ks-cols' },
        h('div', { class: 'ks-col' }, h('h2', { class: 'ks-h' }, L('Dein Stoff', 'Your material')), dz, fin, list.length ? h('div', { class: 'ks-or' }, L('oder aus deinen Skripten', 'or from your slides')) : null, list.length ? docBox : null, topic),
        h('div', { class: 'ks-col' }, h('h2', { class: 'ks-h' }, L('Einstellungen', 'Settings')), h('div', { class: 'ks-rows' }, row(L('Sprache', 'Language'), langSeg), scopeRow, ...own, wishRow))),
      h('footer', { class: 'ks-foot' }, hint, go)));
  check();
}
