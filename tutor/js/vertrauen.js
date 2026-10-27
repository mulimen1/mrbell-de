// Vertrauen: kurze Erklärung, warum Rechnungen bei BWL Max stimmen (Rechen-Algorithmus) – als Knopf + Fenster,
// mit Link auf die ausführliche Seite /ueber/rechen-algorithmus. Zwei Fassungen: 'max' (Tutor, Max' Antworten) und 'excel'.
import { h, ico, modal } from './util.js';
import { L, EN } from './i18n.js';

const SEITE = () => (EN ? '/ueber/calculation-algorithm' : '/ueber/rechen-algorithmus');
const SCHILD = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12.2 2.2 2.2 4.3-4.6"/></svg>';

function punkte(kind) {
  if (kind === 'excel') return [
    ['🧮', L('Jede Vorlage ist durchgerechnet', 'Every template is fully tested'), L('Unser Rechen-Algorithmus testet alle Vorlagen mit Tausenden zufälligen Eingaben – gegen mehrere unabhängige Rechenwerke, auch mit der echten .xlsx-Datei, so wie Excel sie öffnet.', 'Our calculation algorithm tests every template with thousands of random inputs – against several independent calculation engines, including the real .xlsx file as Excel opens it.')],
    ['📘', L('Fachlich nachgerechnet', 'Checked against the textbook'), L('Zu jeder Vorlage gibt es eine eigene Referenzrechnung nach Lehrbuch. Online geht sie erst, wenn alles übereinstimmt.', 'Every template has its own textbook reference calculation. It only goes live once everything matches.')],
    ['✅', L('Generator: doppelt geprüft', 'Generator: checked twice'), L('Baut Max dir eine Datei, rechnet der Browser jede Formel nach – und ein zweiter, unabhängiger Durchgang prüft die Ergebnisse.', 'When Max builds a file for you, your browser recalculates every formula – and a second, independent pass checks the results.')],
    ['–', L('Ehrliche Ergebnisse', 'Honest results'), L('Wo eine Kennzahl nicht definiert ist (z. B. Division durch 0), steht „–“ statt einer erfundenen Zahl.', 'Where a ratio isn’t defined (e.g. division by zero), you see “–” instead of a made-up number.')],
  ];
  return [
    ['🧮', L('Unser eigener Rechen-Algorithmus', 'Our own calculation algorithm'), L('Wir haben einen Algorithmus entwickelt, der ohne KI rechnet: exakt, ohne Rundungsfehler, ohne Raten.', 'We built an algorithm that calculates without AI: exact, without rounding errors, without guessing.')],
    ['✅', L('Alles auf der Seite ist vorab geprüft', 'Everything on the site is checked in advance'), L('Rechner, BWL-Trainer, Excel-Vorlagen, Lernseiten, Tafeln und Quizfragen sind fest programmiert oder vom Algorithmus mit Tausenden Aufgaben nachgerechnet – bevor sie online gehen.', 'Calculators, the BWL trainer, Excel templates, study pages, boards and quiz questions are either hard-coded or recalculated by the algorithm with thousands of tasks – before they go live.')],
    ['⚡', L('Max’ Antworten laufen live durch', 'Max’s answers are checked live'), L('Jede Rechnung, die Max dir zeigt – Formeln, Rechenwege, Buchungssätze, Summen, Quizlösungen –, prüft der Algorithmus, bevor du sie siehst. Findet er einen Fehler, wird er automatisch korrigiert.', 'Every calculation Max shows you – formulas, workings, journal entries, totals, quiz solutions – is checked by the algorithm before you see it. If it finds a mistake, it’s corrected automatically.')],
    ['⚠', L('Und wenn etwas nicht aufgeht?', 'And if something doesn’t add up?'), L('Dann steht genau an der Stelle ein ⚠ mit dem Hinweis, dass unser Rechen-Algorithmus es nicht bestätigen konnte. Eine ungeprüfte Zahl siehst du nie als bestätigt.', 'Then you’ll see a ⚠ right at that spot, saying our calculation algorithm couldn’t verify it. You’ll never see an unchecked number presented as verified.')],
  ];
}

export function openVertrauen(kind = 'max') {
  const body = h('div', { class: 'vt-body' },
    h('p', { class: 'vt-lead' }, kind === 'excel'
      ? L('Ja. Nicht, weil wir es hoffen – sondern weil wir jede Formel nachrechnen.', 'Yes. Not because we hope so – because we recalculate every formula.')
      : L('Ja. Nicht, weil wir es hoffen – sondern weil wir nachrechnen.', 'Yes. Not because we hope so – because we recalculate.')),
    h('ul', { class: 'vt-list' }, punkte(kind).map(([i, t, x]) => h('li', {}, h('span', { class: 'vt-i', 'aria-hidden': 'true' }, i), h('span', {}, h('b', {}, t), h('span', {}, x))))),
    kind === 'excel' ? null : h('p', { class: 'vt-note' }, L('Der Algorithmus prüft die Mathematik. Fachliche Aussagen prüft er nicht – wie wir Inhalte prüfen, steht in unseren ', 'The algorithm checks the maths. It doesn’t check subject-matter statements – how we review content is explained in our '), h('a', { href: '/ueber/redaktion', target: '_blank', rel: 'noopener' }, L('Redaktionsgrundsätzen', 'editorial principles')), '.'),
    h('a', { class: 'btn primary vt-more', href: SEITE(), target: '_blank', rel: 'noopener' }, L('So funktioniert unser Rechen-Algorithmus', 'How our calculation algorithm works'), h('span', { html: ico('right') })));
  try { if (window.BM) window.BM.track('Vertrauen geöffnet', kind); } catch (e) {}
  return modal({ cls: 'vt-modal', eyebrow: L('Rechen-Algorithmus', 'Calculation algorithm'), title: kind === 'excel' ? L('Kannst du unseren Excel-Formeln vertrauen?', 'Can you trust our Excel formulas?') : L('Kannst du Max’ Rechnungen vertrauen?', 'Can you trust Max’s calculations?'), body });
}

// Knopf (dezent): öffnet das Fenster
export function vertrauenBtn(kind = 'max', { klein = false } = {}) {
  const txt = kind === 'excel' ? L('Warum unsere Formeln stimmen', 'Why our formulas are right') : L('Warum du Max’ Rechnungen vertrauen kannst', 'Why you can trust Max’s maths');
  return h('button', { class: 'vt-btn' + (klein ? ' sm' : ''), type: 'button', onclick: e => { e.stopPropagation(); openVertrauen(kind); } }, h('span', { class: 'vt-s', html: SCHILD }), h('span', {}, txt));
}
