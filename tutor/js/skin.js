// Neues Design (Testphase): Standard für alle. Wer schon vorher da war, bekommt einmal einen kurzen Hinweis
// mit Wahl (neu behalten / altes zurück) und Feedback. Umschalten jederzeit im Menü oben rechts.
import { h, modal } from './util.js';
import { L } from './i18n.js';
const H = document.documentElement;
let had = false; try { had = !!(localStorage.getItem('tutor.greetDay') || localStorage.getItem('tutor.account')); } catch (e) {}
const track = (e, d) => { try { if (window.BM) window.BM.track(e, d); } catch (x) {} };
export const isNew = () => !!H.dataset.nv;
// „Zurück zum alten Design“ nur für Konten, die das alte Design noch kennen (vor dem Umstieg am 28.10.2026 angelegt).
// Wer gerade im alten Design ist, kommt immer zurück zum neuen.
const CUT = Date.parse('2026-10-28T00:00:00+01:00');
export function canSwitch() {
  if (!isNew()) return true;
  try { const a = JSON.parse(localStorage.getItem('tutor.account') || 'null'); const t = a && a.since ? Date.parse(a.since) : NaN; return !!a && t < CUT; } catch (e) { return false; }
}
export function switchDesign(toNew = !isNew(), why = 'Menü') {
  try { localStorage.setItem('bm.skin', toNew ? 'neu' : 'alt'); localStorage.setItem('bm.skinNote', '1'); } catch (e) {}
  track('Design gewechselt', (toNew ? 'neu' : 'alt') + ' · ' + why);
  location.reload();
}
function note() {
  let seen = '1'; try { seen = localStorage.getItem('bm.skinNote'); } catch (e) {}
  if (!had || seen || !isNew()) return;
  if (document.querySelector('.ngreet, .modal-bg')) return setTimeout(note, 1500);
  try { localStorage.setItem('bm.skinNote', '1'); } catch (e) {}
  const fb = () => import('./feedback.js').then(m => m.openFeedback()).catch(() => {});
  // Vorschau: neu und alt nebeneinander – man soll sehen, was sich ändert, bevor man wählt
  const shot = (src, tag, t, on) => h('figure', { class: 'sk-shot' + (on ? ' on' : '') }, h('img', { src, alt: t, loading: 'eager' }), h('figcaption', {}, h('b', {}, tag), h('span', {}, t)));
  const body = h('div', { class: 'sk-note' },
    h('div', { class: 'sk-cmp' },
      shot('/tutor/img/design-neu.webp', L('Neu', 'New'), L('Das siehst du gerade', 'What you see now'), true),
      shot('/tutor/img/design-alt.webp', L('Alt', 'Old'), L('So sah es vorher aus', 'How it looked before'), false)),
    h('p', {}, L('Vier Bereiche oben (Tutor, Fächer & Bibliothek, Lernen, Klausur-Tools), mehr Farbe, Fortschritt mit Lernkurve und Max im neuen Look. Deine Skripte und alles, was du erstellt hast, bleiben gleich.', 'Four areas at the top (Tutor, Subjects & library, Learn, Exam tools), more colour, progress with a learning curve and Max in a new look. Your slides and everything you created stay the same.')),
    h('p', { class: 'sk-sub' }, L('Umschalten geht jederzeit im Menü oben rechts.', 'You can switch any time in the menu top right.')),
    h('button', { class: 'sk-fb', type: 'button', onclick: () => { track('Design-Feedback', 'Text'); fb(); } }, L('Feedback geben', 'Give feedback')));
  modal({ cls: 'sk-modal sk-cmpm', eyebrow: L('Neues Design', 'New design'), title: L('BWL Max sieht neu aus', 'BWL Max has a new look'), body,
    actions: [{ label: L('Lieber das alte', 'I prefer the old one'), value: 'alt' }, { label: L('Neues behalten', 'Keep the new one'), value: 'neu', primary: true }] })
    .then(v => { if (v === 'alt') { track('Design-Feedback', 'alt'); switchDesign(false, 'Hinweis'); } else if (v === 'neu') track('Design-Feedback', 'neu'); });
}
setTimeout(note, 4000);
