// Vertrauen: kurze Erklärung, warum Rechnungen bei BWL Max stimmen (Rechen-Algorithmus) – als Knopf + Fenster,
// mit Link auf die ausführliche Seite /ueber/rechen-algorithmus. Zwei Fassungen: 'max' (Tutor, Max' Antworten) und 'excel'.
import { h, ico, modal } from './util.js';
import { L, EN } from './i18n.js';

const SEITE = () => (EN ? '/ueber/calculation-algorithm' : '/ueber/rechen-algorithmus');
const SVG = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  rechnen: SVG('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01"/>'),
  haken: SVG('<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/>'),
  live: SVG('<path d="M13 3 5 13.5h6L10.5 21 19 10h-6z"/>'),
  warn: SVG('<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17h.01"/>'),
  buch: SVG('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>'),
  tabelle: SVG('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15"/>'),
  strich: SVG('<path d="M7 12h10"/>'),
  pfeil: SVG('<path d="m9 6 6 6-6 6"/>'),
};
const SCHILD = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12.2 2.2 2.2 4.3-4.6"/></svg>';

function punkte(kind) {
  if (kind === 'excel') return [
    ['tabelle', L('Jede Vorlage ist durchgerechnet', 'Every template is fully tested'), L('Unser Rechen-Algorithmus testet alle Vorlagen mit Tausenden zufälligen Eingaben – gegen mehrere unabhängige Rechenwerke, auch mit der echten .xlsx-Datei, so wie Excel sie öffnet.', 'Our calculation algorithm tests every template with thousands of random inputs – against several independent calculation engines, including the real .xlsx file as Excel opens it.')],
    ['buch', L('Fachlich nachgerechnet', 'Checked against the textbook'), L('Zu jeder Vorlage gibt es eine eigene Referenzrechnung nach Lehrbuch. Online geht sie erst, wenn alles übereinstimmt.', 'Every template has its own textbook reference calculation. It only goes live once everything matches.')],
    ['strich', L('Ehrliche Ergebnisse', 'Honest results'), L('Wo eine Kennzahl nicht definiert ist (z. B. Division durch 0), steht „–“ statt einer erfundenen Zahl.', 'Where a ratio isn’t defined (e.g. division by zero), you see “–” instead of a made-up number.')],
  ];
  return [
    ['rechnen', L('Unser eigener Rechen-Algorithmus', 'Our own calculation algorithm'), L('Das Herzstück: Wir haben einen Algorithmus entwickelt, der ohne KI rechnet – exakt, ohne Rundungsfehler, ohne Raten. Jede Rechnung, die Max dir zeigt (Formeln, Rechenwege, Buchungssätze, Summen, Quizlösungen), prüft er live, bevor du sie siehst. Findet er einen Fehler, wird er automatisch korrigiert.', 'The core: we built an algorithm that calculates without AI – exact, without rounding errors, without guessing. Every calculation Max shows you (formulas, workings, journal entries, totals, quiz solutions) is checked live before you see it. If it finds a mistake, it is corrected automatically.'), 'top c-blau'],
    ['buch', L('Neu: Faktencheck gegen feste Quellen', 'New: fact check against fixed sources'), L('Unsere Faktendatenbank enthält 4.543 belegte Aussagen zu 202 Themen – aus Gesetzen (HGB, EStG, UStG, AktG, GmbHG), dem Gabler Wirtschaftslexikon, Destatis, EZB und Bundesbank. Max bekommt den geprüften Rechtsstand zu jeder Frage mit, und jede Antwort wird danach Satz für Satz mit diesen Aussagen abgeglichen. Oben an der Antwort steht das Ergebnis: „✓ Gegengeprüft“ mit Quelle.', 'Our fact database holds 4,543 sourced statements on 202 topics – from statutes (HGB, EStG, UStG, AktG, GmbHG), the Gabler business encyclopedia, Destatis, the ECB and the Bundesbank. Max gets the verified legal status with every question, and every answer is then checked sentence by sentence against these statements. The result is shown at the top of the answer: “✓ Cross-checked” with the source.'), 'top c-lila'],
    ['haken', L('Alles auf der Seite ist vorab geprüft', 'Everything on the site is checked in advance'), L('Rechner, BWL-Trainer, Excel-Vorlagen, Lernseiten, Tafeln und Quizfragen sind fest programmiert oder vom Algorithmus mit Tausenden Aufgaben nachgerechnet – bevor sie online gehen.', 'Calculators, the BWL trainer, Excel templates, study pages, boards and quiz questions are either hard-coded or recalculated by the algorithm with thousands of tasks – before they go live.'), 'c-tuerkis'],
    ['live', L('2.549 geprüfte Antworten', '2,549 verified answers'), L('Auf typische Fragen antwortet Max direkt aus unserer Wissensbasis: Jede dieser Antworten besteht nur aus belegten Aussagen, jedes Rechenbeispiel ist nachgerechnet.', 'Max answers typical questions straight from our knowledge base: each of these answers consists only of sourced statements, and every worked example is recalculated.'), 'c-orange'],
    ['warn', L('Und wenn etwas nicht aufgeht?', 'And if something doesn’t add up?'), L('Dann steht genau an der Stelle ein Warnzeichen mit dem Hinweis, dass unser Rechen-Algorithmus es nicht bestätigen konnte. Eine ungeprüfte Zahl siehst du nie als bestätigt.', 'Then you’ll see a warning sign right at that spot, saying our calculation algorithm couldn’t verify it. You’ll never see an unchecked number presented as verified.'), 'c-gelb'],
  ];
}

// zurueck: Beschriftung des Hauptknopfs (zurück dorthin, wo man herkam)
export function openVertrauen(kind = 'max', zurueck = '') {
  const body = h('div', { class: 'vt-body' },
    h('p', { class: 'vt-lead' }, kind === 'excel'
      ? L('Ja. Nicht, weil wir es hoffen – sondern weil wir jede Formel nachrechnen.', 'Yes. Not because we hope so – because we recalculate every formula.')
      : L('Ja. Nicht, weil wir es hoffen – sondern weil wir nachrechnen und gegen feste Quellen prüfen.', 'Yes. Not because we hope so – because we recalculate and check against fixed sources.')),
    h('div', { class: 'vt-chips' }, ...(kind === 'excel' ? [L('Tausende Tests', 'Thousands of tests'), L('Referenz nach Lehrbuch', 'Textbook reference'), L('Doppelt geprüft', 'Checked twice')] : [L('Rechnet ohne KI', 'Calculates without AI'), L('Faktencheck', 'Fact check'), L('Live geprüft', 'Checked live')]).map((t, k) => h('span', { class: ['c-blau', 'c-lila', 'c-orange'][k] }, h('i', { html: IC.haken }), t))),
    h('ul', { class: 'vt-list' + (kind === 'excel' ? '' : ' vt-list2') }, punkte(kind).map(([i, t, x, c], k) => h('li', { class: c || ['c-blau', 'c-lila', 'c-tuerkis'][k % 3] }, h('span', { class: 'vt-i', 'aria-hidden': 'true', html: IC[i] }), h('span', {}, h('b', {}, t), h('span', {}, x))))),
    kind === 'excel' ? null : h('p', { class: 'vt-note' }, L('Weicht eine Aussage von der Quelle ab, siehst du oben an der Antwort sofort eine Warnung mit der richtigen Aussage und der Quelle. Wie wir unsere eigenen Inhalte prüfen, steht in unseren ', 'If a statement differs from the source, you immediately see a warning at the top of the answer with the correct statement and its source. How we review our own content is explained in our '), h('a', { href: '/ueber/redaktion', target: '_blank', rel: 'noopener' }, L('Redaktionsgrundsätzen', 'editorial principles')), '.'),
    h('p', { class: 'vt-note' }, L('Trotz aller Prüfung können Fehler nie ganz ausgeschlossen werden. Wir übernehmen keine Gewähr für die Richtigkeit, die Haftung richtet sich nach unseren ', 'Despite all checks, mistakes can never be ruled out entirely. We give no guarantee of correctness; liability is governed by our '), h('a', { href: '/agb', target: '_blank', rel: 'noopener' }, L('AGB', 'terms')), '.'));
  const more = h('a', { class: 'vt-more', href: SEITE(), target: '_blank', rel: 'noopener' }, L('So funktioniert unser Rechen-Algorithmus', 'How our calculation algorithm works'), h('span', { class: 'vt-moreg', html: IC.pfeil }));
  try { if (window.BM) window.BM.track('Vertrauen geöffnet', kind); } catch (e) {}
  const back = zurueck || (kind === 'excel' ? L('Zurück zum Excel-Helfer', 'Back to the Excel helper') : L('Zurück zum Tutor', 'Back to the tutor'));
  const p = modal({ cls: 'vt-modal', actions: [{ label: back, value: 1, primary: true, cls: 'vt-back' }], eyebrow: kind === 'excel' ? L('Rechen-Algorithmus', 'Calculation algorithm') : L('Rechen-Algorithmus & Faktencheck', 'Calculation algorithm & fact check'), title: kind === 'excel' ? L('Kannst du unseren Excel-Formeln vertrauen?', 'Can you trust our Excel formulas?') : L('Kannst du Max vertrauen?', 'Can you trust Max?'), body });
  // Link zur Erklärseite als zweiter Knopf unten in der festen Leiste – über „Zurück“
  const ms = document.querySelectorAll('.vt-modal'), row = ms.length && ms[ms.length - 1].querySelector('.row');
  if (row) row.prepend(more); else body.append(more);
  return p;
}

// Knopf (dezent): öffnet das Fenster
export function vertrauenBtn(kind = 'max', { klein = false, zurueck = '' } = {}) {
  const txt = kind === 'excel' ? L('Warum unsere Formeln stimmen', 'Why our formulas are right') : L('Warum du Max vertrauen kannst: Rechnungen und Fakten geprüft', 'Why you can trust Max: maths and facts checked');
  return h('button', { class: 'vt-btn' + (klein ? ' sm' : ''), type: 'button', onclick: e => { e.stopPropagation(); openVertrauen(kind, zurueck); } }, h('span', { class: 'vt-s', html: SCHILD }), h('span', {}, txt), h('span', { class: 'vt-go', html: IC.pfeil }));
}
