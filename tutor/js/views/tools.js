// Klausur-Tools: Übersicht über alle Werkzeuge für die Klausur. Excel-Helfer groß oben, darunter Klausurplan,
// Klausur-Simulator, Rechner und BWL-Lexikon als Karten.
import { h, ico, ls } from '../util.js';
import { L, getOutLang } from '../i18n.js';
import { S } from '../state.js';
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

// ---------- Klausur-Simulator / Klausurplan: eigene Seite – erklären, was passiert, dann Skript wählen und direkt starten ----------
const KIND = {
  simulator: { tone: 'sim', icon: 'exam', eyebrow: L('Klausur-Simulator', 'Exam simulator'), h: [L('Probeklausur. ', 'Mock exam. '), L('Wie in echt.', 'Like the real thing.')],
    lead: L('Max stellt dir aus deinem Skript eine echte Klausur zusammen – mit Zeitlimit, Punkten pro Aufgabe und Note. Danach siehst du die Musterlösung und genau, wo du Punkte verloren hast.', 'Max builds a real exam from your slides – with a time limit, points per task and a grade. Afterwards you see the model answers and exactly where you lost points.'),
    facts: [['clock', L('Zeit läuft wie in der Klausur', 'Timed like the real exam')], ['trophy', L('Punkte und Note', 'Points and grade')], ['check', L('Musterlösung mit Rechenweg', 'Model answers with working')]],
    go: d => `#/app/${d.id}/quiz/exam`, cta: L('Klausur starten', 'Start exam'), target: 'quiz' },
  plan: { tone: 'plan', icon: 'calendar', eyebrow: L('Klausurplan', 'Exam plan'), h: [L('Tag für Tag ', 'Day by day '), L('bis zur Klausur.', 'to the exam.')],
    lead: L('Wähl dein Skript und deinen Klausurtermin – Max teilt den Stoff auf die Tage bis zur Klausur auf, mit Wiederholungen und Probeklausur am Ende. Du siehst jeden Tag, was dran ist.', 'Pick your slides and exam date – Max spreads the material over the days until the exam, with reviews and a mock exam at the end. Every day you see what’s next.'),
    facts: [['calendar', L('Plan bis zum Klausurtag', 'Plan up to exam day')], ['cards', L('Wiederholung eingeplant', 'Reviews built in')], ['exam', L('Probeklausur am Ende', 'Mock exam at the end')]],
    go: d => `#/app/${d.id}/plan`, cta: L('Plan erstellen', 'Create plan'), target: 'plan' }
};
function docPick(root, sub) {
  const K = KIND[sub];
  const wrap = h('div', { class: 'view-in kt kt-sub' }); root.appendChild(wrap);
  const docs = S.list.filter(d => !d.sample);
  const list = (docs.length ? docs : S.list).slice(0, 30);
  // Einstellungen (gemerkt pro Gerät)
  const isSim = sub === 'simulator';
  const today = new Date(); const iso = d => d.toLocaleDateString('sv-SE');
  const st = Object.assign(isSim ? { minutes: 60, count: 12, pass: .5, silent: true, diff: 'klausur', lang: getOutLang(), focus: -1 } : { exam: iso(new Date(Date.now() + 21 * 864e5)), minutes: 60, weekdays: [0, 1, 2, 3, 4], goal: null },
    ls.get(isSim ? 'tutor.examCfg' : 'tutor.planPrefs', {}) || {}, isSim ? { focus: -1 } : {});
  let doc = null;
  const seg = (opts, key, multi) => { const w = h('div', { class: 'kt-seg' }); const paint = () => w.querySelectorAll('button').forEach(b => { const v = JSON.parse(b.dataset.v); b.classList.toggle('on', multi ? st[key].includes(v) : st[key] === v); });
    opts.forEach(([v, t]) => w.append(h('button', { type: 'button', 'data-v': JSON.stringify(v), onclick: () => { if (multi) { st[key] = st[key].includes(v) ? st[key].filter(x => x !== v) : [...st[key], v].sort(); } else st[key] = v; paint(); check(); } }, t))); paint(); return w; };
  const row = (label, el, hint) => h('div', { class: 'kt-opt' }, h('div', { class: 'kt-ol' }, h('b', {}, label), hint ? h('small', {}, hint) : null), el);
  const focusSel = h('select', { class: 'kt-sel', onchange: () => { st.focus = +focusSel.value; } });
  const drawFocus = () => { const chs = (doc && doc.path && doc.path.chapters) || []; focusSel.replaceChildren(h('option', { value: -1 }, L('Ganzes Skript', 'Whole script')), ...chs.map((c, i) => h('option', { value: i }, c.title || L('Kapitel ', 'Chapter ') + (i + 1)))); focusSel.disabled = !chs.length; };
  const silent = h('input', { type: 'checkbox', checked: st.silent || null, onchange: () => { st.silent = silent.checked; } });
  const date = h('input', { type: 'date', class: 'kt-sel', value: st.exam, min: iso(new Date(Date.now() + 864e5)), oninput: () => { st.exam = date.value; check(); } });
  const opts = isSim ? [
    row(L('Schwierigkeit', 'Difficulty'), seg([['leicht', L('Leicht', 'Easy')], ['mittel', L('Mittel', 'Medium')], ['schwer', L('Schwer', 'Hard')], ['klausur', L('Klausurniveau', 'Exam level')]], 'diff')),
    row(L('Dauer', 'Duration'), seg([[30, '30 Min.'], [45, '45 Min.'], [60, '60 Min.'], [90, '90 Min.'], [120, '120 Min.']], 'minutes')),
    row(L('Aufgaben', 'Tasks'), seg([[8, '8'], [12, '12'], [14, '14']], 'count')),
    row(L('Bestanden ab', 'Pass mark'), seg([[.4, '40 %'], [.45, '45 %'], [.5, '50 %'], [.6, '60 %']], 'pass')),
    row(L('Sprache der Klausur', 'Exam language'), seg([['de', 'Deutsch'], ['en', 'English']], 'lang')),
    row(L('Schwerpunkt', 'Focus'), focusSel, L('Erst nach Skript-Auswahl', 'After choosing slides')),
    h('label', { class: 'kt-chk' }, silent, h('span', {}, L('Klausurbedingungen: keine Hilfe, Auswertung erst am Ende', 'Exam conditions: no help, results only at the end')))
  ] : [
    row(L('Klausurdatum', 'Exam date'), date),
    row(L('Lernzeit pro Tag', 'Study time per day'), seg([[30, '30 Min.'], [60, '1 Std.'], [90, '1,5 Std.'], [120, '2 Std.'], [180, '3 Std.']], 'minutes')),
    row(L('Lerntage', 'Study days'), seg([[0, 'Mo'], [1, 'Di'], [2, 'Mi'], [3, 'Do'], [4, 'Fr'], [5, 'Sa'], [6, 'So']], 'weekdays', true)),
    row(L('Zielnote', 'Target grade'), seg([[null, L('Egal', 'Any')], [.95, '1,0'], [.85, '1,7'], [.75, '2,3'], [.65, '3,0'], [.5, L('Bestehen', 'Pass')]], 'goal'))
  ];
  const go = h('button', { class: 'kt-start', type: 'button', disabled: true, onclick: () => start() }, h('span', { html: ico(K.icon) }), K.cta);
  const hint = h('small', { class: 'kt-hint' });
  const check = () => { const ok = !!doc && (isSim || (st.exam && st.weekdays.length)); go.disabled = !ok; hint.textContent = !doc ? L('Wähl zuerst ein Skript oder lad eins hoch.', 'Choose or upload slides first.') : (!isSim && !st.weekdays.length) ? L('Mindestens ein Lerntag.', 'At least one study day.') : L('Alles bereit.', 'All set.'); };
  const saveSt = () => { if (isSim) ls.set('tutor.examCfg', { minutes: st.minutes, count: st.count, pass: st.pass, silent: st.silent, diff: st.diff, lang: st.lang, focus: st.focus }); else ls.set('tutor.planPrefs', { exam: st.exam, minutes: st.minutes, weekdays: st.weekdays, goal: st.goal }); };
  const prime = () => { saveSt(); if (isSim) ls.set('tutor.examGo', Date.now()); else try { sessionStorage.setItem('tutor.planPre', JSON.stringify({ at: Date.now(), o: { exam: st.exam, weekdays: st.weekdays, minutes: st.minutes, goal: st.goal } })); } catch (e) {} };
  const start = () => { if (!doc) return; prime(); location.hash = K.go(doc); };
  const docEls = list.map(d => h('button', { class: 'kt-doc', type: 'button', onclick: e => { doc = d; docBox.querySelectorAll('.kt-doc').forEach(x => x.classList.toggle('on', x === e.currentTarget)); if (isSim) { st.focus = -1; drawFocus(); } check(); } },
    h('span', { class: 'kt-di', html: ico('file') }), h('span', {}, h('b', {}, d.name || L('Skript', 'Slides')), h('small', {}, d.path && d.path.chapters ? d.path.chapters.length + L(' Kapitel', ' chapters') : L('Skript', 'Slides'))), h('span', { class: 'kt-dok', html: ico('check') })));
  const upload = h('label', { class: 'kt-doc kt-up', for: 'fileApp', onclick: () => { prime(); ls.set('tutor.target', K.target); } },
    h('span', { class: 'kt-di', html: ico('upload') }), h('span', {}, h('b', {}, L('Neues Skript hochladen', 'Upload new slides')), h('small', {}, L('PDF, PowerPoint, Word oder Foto – mit deinen Einstellungen geht’s direkt los', 'PDF, PowerPoint, Word or photo – starts right away with your settings'))));
  const docBox = h('div', { class: 'kt-docs' }, ...docEls, upload);
  wrap.append(toolsBack(),
    h('div', { class: 'kt-subhead kt-' + K.tone }, h('span', { class: 'kt-ci', html: ico(K.icon) }), h('div', {}, h('div', { class: 'eyebrow' }, K.eyebrow), h('h1', {}, K.h[0], h('span', {}, K.h[1])))),
    h('p', { class: 'kt-lead' }, K.lead),
    h('div', { class: 'kt-steps' },
      h('section', { class: 'kt-step' }, h('div', { class: 'kt-sn' }, '1'), h('div', { class: 'kt-sb' }, h('h2', { class: 'kt-h2' }, L('Skript wählen', 'Choose slides')), docBox)),
      h('section', { class: 'kt-step' }, h('div', { class: 'kt-sn' }, '2'), h('div', { class: 'kt-sb' }, h('h2', { class: 'kt-h2' }, L('Einstellungen', 'Settings')), h('div', { class: 'kt-opts' }, ...opts))),
      h('section', { class: 'kt-step kt-go3' }, h('div', { class: 'kt-sn' }, '3'), h('div', { class: 'kt-sb' }, go, hint))));
  if (isSim) drawFocus();
  check();
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

// ---------- Lernen: Tafel, Lernzettel, Karteikarten, Podcast, Lernpfad – eigene Seite statt Sprung in den Tutor ----------
// 1. Skript wählen oder hochladen · 2. Einstellungen · 3. Erstellen
const LK = {
  tafel: { tab: 'tutor', icon: 'board', tone: 'lt-board', eyebrow: L('An der Tafel erklären', 'Explain on the board'), h: [L('Max erklärt’s ', 'Max explains it '), L('an der Tafel.', 'on the board.')],
    lead: L('Wähl dein Skript – Max erklärt dir das Thema an der Tafel, Schritt für Schritt und mit Beispiel. Du kannst jederzeit nachfragen.', 'Pick your slides – Max explains the topic on the board, step by step with an example. Ask follow-ups any time.'),
    def: { style: 'schritt', topic: '' }, cta: L('Erklärung starten', 'Start explanation') },
  zettel: { tab: 'zettel', icon: 'note', tone: 'lt-note', eyebrow: L('Lernzettel', 'Study sheet'), h: [L('Alles Wichtige ', 'Everything important '), L('auf einer Seite.', 'on one page.')],
    lead: L('Max fasst dein Skript zu einem Lernzettel zusammen – Definitionen, Formeln, Rechenwege und typische Klausurfallen.', 'Max condenses your slides into a study sheet – definitions, formulas, workings and typical exam traps.'),
    def: { len: 'kurz', art: 'mix' }, cta: L('Lernzettel erstellen', 'Create study sheet') },
  karten: { tab: 'karten', icon: 'cards', tone: 'lt-cards', eyebrow: L('Karteikarten', 'Flashcards'), h: [L('Wiederholen, ', 'Review '), L('bis es sitzt.', 'until it sticks.')],
    lead: L('Max baut dir Karteikarten aus deinem Skript – mit Wiederholung im richtigen Abstand, damit es bis zur Klausur hängen bleibt.', 'Max builds flashcards from your slides – with spaced repetition so it sticks until the exam.'),
    def: { count: 16, art: 'mix' }, cta: L('Karteikarten erstellen', 'Create flashcards') },
  podcast: { tab: 'podcast', icon: 'headphones', tone: 'lt-pod', eyebrow: 'Podcast', h: [L('Marie & Max ', 'Marie & Max '), L('zum Anhören.', 'to listen to.')],
    lead: L('Aus deinem Skript wird ein Podcast: Marie fragt, Max erklärt. Perfekt für Bahn, Gym oder die Schlange beim Bäcker.', 'Your slides become a podcast: Marie asks, Max explains. Perfect for the train, the gym or the queue at the bakery.'),
    def: { len: 'kurz', lang: getOutLang(), tone: 2, voice: 'max' }, cta: L('Podcast erstellen', 'Create podcast') },
  lernpfad: { tab: 'pfad', icon: 'path', tone: 'lt-path', eyebrow: L('Lernpfad', 'Study path'), h: [L('Kapitel für Kapitel ', 'Chapter by chapter '), L('zum Ziel.', 'to the goal.')],
    lead: L('Max teilt dein Skript in Kapitel mit kurzen Lektionen und Checks auf. Du arbeitest dich Schritt für Schritt durch.', 'Max splits your slides into chapters with short lessons and checks. You work through step by step.'),
    def: { depth: 'normal' }, cta: L('Lernpfad erstellen', 'Create study path') },
};
export function learnPick(root, kind) {
  const K = LK[kind]; if (!K) { location.replace('#/app/ueben'); return; }
  const wrap = h('div', { class: 'view-in kt kt-sub kt-learn' }); root.appendChild(wrap);
  const docs = S.list.filter(d => !d.sample);
  const list = (docs.length ? docs : S.list).slice(0, 30);
  const key = K.tab === 'tutor' || K.tab === 'pfad' ? 'tutor.spec.' + K.tab : 'tutor.pers.' + K.tab;
  const st = Object.assign({}, K.def, ls.get(key, {}) || {}); st.focus = -1;
  if (kind === 'tafel') st.topic = '';
  let doc = null;
  const seg = (opts, k) => { const w = h('div', { class: 'kt-seg' }); const paint = () => w.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(st[k]) === b.dataset.v));
    opts.forEach(([v, t]) => w.append(h('button', { type: 'button', 'data-v': String(v), onclick: () => { st[k] = v; paint(); } }, t))); paint(); return w; };
  const row = (label, el, hint) => h('div', { class: 'kt-opt' }, h('div', { class: 'kt-ol' }, h('b', {}, label), hint ? h('small', {}, hint) : null), el);
  const opts = {
    tafel: [row(L('Thema', 'Topic'), h('input', { class: 'kt-sel kt-in', maxlength: 160, placeholder: L('Leer lassen = das Wichtigste aus dem Skript', 'Leave empty = the key points of the slides'), oninput: e => { st.topic = e.target.value; } })),
      row(L('Wie', 'How'), seg([['schritt', L('Schritt für Schritt', 'Step by step')], ['kurz', L('Kurzer Überblick', 'Quick overview')], ['rechnen', L('Mit Rechenaufgabe', 'With a worked task')]], 'style'))],
    zettel: [row(L('Länge', 'Length'), seg([['kurz', L('Kurz · 1 Seite', 'Short · 1 page')], ['lang', L('Ausführlich', 'Detailed')]], 'len')),
      row(L('Art', 'Style'), seg([['mix', L('Ausgewogen', 'Balanced')], ['begriffe', L('Begriffe', 'Terms')], ['formeln', L('Formeln & Rechenwege', 'Formulas & workings')], ['klausur', L('Klausurfokus', 'Exam focus')]], 'art'))],
    karten: [row(L('Anzahl', 'Number'), seg([[10, '10'], [16, '16'], [24, '24']], 'count')),
      row(L('Schwerpunkt', 'Focus'), seg([['mix', L('Gemischt', 'Mixed')], ['begriffe', L('Begriffe', 'Terms')], ['formeln', L('Formeln & Rechnen', 'Formulas & maths')], ['klausur', L('Klausurfragen', 'Exam questions')]], 'art'))],
    podcast: [row(L('Länge', 'Length'), seg([['kurz', L('Kurz · ~5 Min.', 'Short · ~5 min')], ['lang', L('Lang · ~10 Min.', 'Long · ~10 min')]], 'len')),
      row(L('Sprache', 'Language'), seg([['de', 'Deutsch'], ['en', 'English']], 'lang')),
      row(L('Ton', 'Tone'), seg([[1, L('Sachlich', 'Factual')], [2, L('Locker', 'Relaxed')], [3, L('Max dreht auf', 'Max goes wild')]], 'tone'))],
    lernpfad: [row(L('Tiefe', 'Depth'), seg([['kompakt', L('Kompakt', 'Compact')], ['normal', L('Normal', 'Normal')], ['gruendlich', L('Gründlich', 'Thorough')]], 'depth'))],
  }[kind];
  const go = h('button', { class: 'kt-start', type: 'button', disabled: true, onclick: () => start() }, h('span', { html: ico(K.icon) }), K.cta);
  const hint = h('small', { class: 'kt-hint' });
  const check = () => { go.disabled = !doc; hint.textContent = doc ? '' : L('Wähl zuerst ein Skript oder lad eins hoch.', 'Choose or upload slides first.'); };
  const saveSt = () => { const keep = Object.assign({}, st); delete keep.focus; delete keep.topic; ls.set(key, keep); if (kind === 'podcast' && st.voice) ls.set('tutor.podVoice', st.voice); };
  const start = async () => {
    if (!doc) return; saveSt();
    try { sessionStorage.setItem('tutor.backTo', 'ueben'); } catch (e) {}
    const C = await import('../create.js');
    if (kind === 'tafel') { const pr = C.specPrompt(st, doc.name); ls.set('tutor.pendingAsk', { t: pr.t, show: pr.show }); location.hash = `#/app/${doc.id}/tutor`; return; }
    if (kind === 'lernpfad') { C.applySpec('pfad', doc, { depth: st.depth }); location.hash = `#/app/${doc.id}/pfad/auto`; return; }
    C.setCreate(K.tab, doc.id, Object.assign({}, st, { focus: -1 }));
    location.hash = `#/app/${doc.id}/${K.tab}/auto`;
  };
  const docEls = list.map(d => h('button', { class: 'kt-doc', type: 'button', onclick: e => { doc = d; docBox.querySelectorAll('.kt-doc').forEach(x => x.classList.toggle('on', x === e.currentTarget)); check(); } },
    h('span', { class: 'kt-di', html: ico('file') }), h('span', {}, h('b', {}, d.name || L('Skript', 'Slides')), h('small', {}, d.path && d.path.chapters ? d.path.chapters.length + L(' Kapitel', ' chapters') : L('Skript', 'Slides'))), h('span', { class: 'kt-dok', html: ico('check') })));
  const upload = h('label', { class: 'kt-doc kt-up', for: 'fileApp', onclick: () => { saveSt(); ls.set('tutor.target', K.tab); try { sessionStorage.setItem('tutor.backTo', 'ueben'); } catch (e) {} } },
    h('span', { class: 'kt-di', html: ico('upload') }), h('span', {}, h('b', {}, L('Neues Skript hochladen', 'Upload new slides')), h('small', {}, L('PDF, PowerPoint, Word oder Foto – mit deinen Einstellungen geht’s direkt los', 'PDF, PowerPoint, Word or photo – starts right away with your settings'))));
  const docBox = h('div', { class: 'kt-docs' }, ...docEls, upload);
  wrap.append(h('a', { class: 'kt-back kt-backl', href: '#/app/ueben' }, h('span', { html: ico('left') }), L('Zurück zu Lernen', 'Back to Learn')),
    h('div', { class: 'kt-subhead kt-' + K.tone }, h('span', { class: 'kt-ci', html: ico(K.icon) }), h('div', {}, h('div', { class: 'eyebrow' }, K.eyebrow), h('h1', {}, K.h[0], h('span', {}, K.h[1])))),
    h('p', { class: 'kt-lead' }, K.lead),
    h('div', { class: 'kt-steps' },
      h('section', { class: 'kt-step' }, h('div', { class: 'kt-sn' }, '1'), h('div', { class: 'kt-sb' }, h('h2', { class: 'kt-h2' }, L('Skript wählen', 'Choose slides')), docBox)),
      h('section', { class: 'kt-step' }, h('div', { class: 'kt-sn' }, '2'), h('div', { class: 'kt-sb' }, h('h2', { class: 'kt-h2' }, L('Einstellungen', 'Settings')), h('div', { class: 'kt-opts' }, ...opts))),
      h('section', { class: 'kt-step kt-go3' }, h('div', { class: 'kt-sn' }, '3'), h('div', { class: 'kt-sb' }, go, hint))));
  check();
}
