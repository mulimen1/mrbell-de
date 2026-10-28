// Klausur-Tools: Übersicht über alle Werkzeuge für die Klausur. Excel-Helfer groß oben, darunter Klausurplan,
// Klausur-Simulator, Rechner und BWL-Lexikon als Karten.
import { h, ico, ls } from '../util.js';
import { L } from '../i18n.js';

const XLS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 1.5h8.3l5.3 5.3v13.7a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#1D6F42"/><path d="M14.5 1.5v3.6a1.7 1.7 0 0 0 1.7 1.7h3.6z" fill="#8fd1ac"/><text x="12" y="17.6" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="6.6" font-weight="700" fill="#fff">XLS</text></svg>';

export function render(root) {
  const wrap = h('div', { class: 'view-in kt' }); root.appendChild(wrap);
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
  const plan = () => { ls.set('tutor.target', 'plan'); document.getElementById('fileApp')?.click(); };
  const exam = () => import('../app.js').then(m => m.examTool());
  const lex = () => { const b = document.querySelector('.dk .dk-b[data-k="lex"]'); if (b) b.click(); };
  const card = (icon, t, s, cta, act, tone) => h(typeof act === 'string' ? 'a' : 'button', Object.assign({ class: 'kt-card kt-' + tone }, typeof act === 'string' ? { href: act } : { type: 'button', onclick: act }),
    h('span', { class: 'kt-ci', html: ico(icon) }), h('b', {}, t), h('small', {}, s), h('span', { class: 'kt-cg' }, cta, h('span', { html: ico('right') })));
  const grid = h('div', { class: 'kt-grid' },
    card('calendar', L('Klausurplan', 'Exam plan'), L('Skript rein, Klausurtermin wählen – Max plant dir jeden Tag bis zur Klausur.', 'Add your slides and exam date – Max plans every day until the exam.'), L('Plan erstellen', 'Create plan'), plan, 'plan'),
    card('exam', L('Klausur-Simulator', 'Exam simulator'), L('Eine echte Probeklausur mit Zeit, Punkten und Musterlösung – aus deinem Stoff.', 'A real mock exam with time limit, points and model answers – from your material.'), L('Probeklausur starten', 'Start mock exam'), exam, 'sim'),
    card('calc', L('Rechner', 'Calculators'), L('Kapitalwert, Break-even, Abschreibung & Co. – mit Rechenweg zum Abschreiben.', 'NPV, break-even, depreciation & more – with the full working.'), L('Rechner öffnen', 'Open calculators'), '#/app/rechner', 'calc'),
    card('book', L('BWL-Lexikon', 'Glossary'), L('Über 1.000 Fachbegriffe, kurz und klausurtauglich erklärt.', 'Over 1,000 terms, explained briefly and exam-ready.'), L('Lexikon öffnen', 'Open glossary'), lex, 'lex'));
  wrap.append(
    h('div', { class: 'kt-head' }, h('div', { class: 'eyebrow' }, L('Klausur-Tools', 'Exam tools')), h('h1', {}, L('Alles für die Klausur. ', 'Everything for the exam. '), h('span', {}, L('An einem Ort.', 'In one place.')))),
    hero, grid);
}
