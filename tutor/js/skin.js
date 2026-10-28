// Neues Design (Testphase): Standard für alle. Wer schon vorher da war, bekommt einmal einen kurzen Hinweis
// mit Wahl (neu behalten / altes zurück) und Feedback. Umschalten jederzeit im Menü oben rechts.
import { h, modal } from './util.js';
import { L } from './i18n.js';
const H = document.documentElement;
let had = false; try { had = !!(localStorage.getItem('tutor.greetDay') || localStorage.getItem('tutor.account')); } catch (e) {}
const track = (e, d) => { try { if (window.BM) window.BM.track(e, d); } catch (x) {} };
export const isNew = () => !!H.dataset.nv;
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
  const body = h('div', { class: 'sk-note' },
    h('p', {}, L('Wir testen gerade ein neues Design: helleres Blau, mehr Rückmeldung beim Klicken – und Max im neuen Look. Alles andere bleibt, wie du es kennst.', 'We’re testing a new design: brighter blue, more feedback when you click – and Max in a new look. Everything else stays the same.')),
    h('p', {}, L('Sag uns ehrlich, wie du es findest. Zurück zum alten Design geht jederzeit über das Menü (oben rechts oder Einstellungen unten links).', 'Tell us honestly what you think. You can switch back to the old design any time via the menu (top right, or settings bottom left).')),
    h('button', { class: 'sk-fb', type: 'button', onclick: () => { track('Design-Feedback', 'Text'); fb(); } }, L('Feedback geben', 'Give feedback')));
  modal({ cls: 'sk-modal', eyebrow: L('Testphase', 'Test phase'), title: L('BWL Max sieht neu aus', 'BWL Max has a new look'), body,
    actions: [{ label: L('Lieber das alte', 'I prefer the old one'), value: 'alt' }, { label: L('Gefällt mir', 'I like it'), value: 'neu', primary: true }] })
    .then(v => { if (v === 'alt') { track('Design-Feedback', 'alt'); switchDesign(false, 'Hinweis'); } else if (v === 'neu') track('Design-Feedback', 'neu'); });
}
setTimeout(note, 4000);
