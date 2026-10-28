// Klausur-Tools: Übersicht über alle Werkzeuge für die Klausur. Excel-Helfer groß oben, darunter Klausurplan,
// Klausur-Simulator, Rechner und BWL-Lexikon als Karten.
import { h, ico, ls } from '../util.js';
import { L } from '../i18n.js';
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
  const upload = h('label', { class: 'kt-doc kt-up', for: 'fileApp', onclick: () => ls.set('tutor.target', K.target) },
    h('span', { class: 'kt-di', html: ico('upload') }), h('span', {}, h('b', {}, L('Skript hochladen', 'Upload slides')), h('small', {}, L('PDF, PowerPoint, Word oder Foto – danach geht’s direkt los', 'PDF, PowerPoint, Word or photo – then it starts right away'))));
  wrap.append(toolsBack(),
    h('div', { class: 'kt-subhead kt-' + K.tone }, h('span', { class: 'kt-ci', html: ico(K.icon) }), h('div', {}, h('div', { class: 'eyebrow' }, K.eyebrow), h('h1', {}, K.h[0], h('span', {}, K.h[1])))),
    h('p', { class: 'kt-lead' }, K.lead),
    h('div', { class: 'kt-facts' }, K.facts.map(([i, t]) => h('span', { class: 'kt-fact' }, h('span', { html: ico(i) }), t))),
    h('h2', { class: 'kt-h2' }, list.length ? L('Für welches Skript?', 'Which slides?') : L('Zuerst dein Skript', 'Your slides first')),
    h('div', { class: 'kt-docs' }, ...list.map(d => h('a', { class: 'kt-doc', href: K.go(d) }, h('span', { class: 'kt-di', html: ico('file') }), h('span', {}, h('b', {}, d.name || L('Skript', 'Slides')), h('small', {}, K.cta)), h('span', { class: 'kt-dg', html: ico('right') }))), upload));
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
