// Test (nur Bens Konto): Transkript steckt in der Mitschrift – oben ein Umschalter „Live mitschreiben | Aus Video“
import { h, ico } from './util.js';
import { L } from './i18n.js';
export const mergedNotes = () => !!document.documentElement.dataset.ben;
export function msSwitch(active) {
  if (!mergedNotes()) return null;
  const it = (key, href, icon, label, extra) => h('a', { class: 'ms-sw-i' + (key === active ? ' on' : ''), href, 'aria-current': key === active ? 'page' : 'false' }, h('span', { html: ico(icon) }), h('span', {}, label), extra || null);
  return h('nav', { class: 'ms-sw', 'aria-label': L('Mitschrift', 'Notes') },
    it('live', '#/app/mitschrift', 'pen', L('Live mitschreiben', 'Live notes')),
    it('video', '#/app/video', 'captions', L('Aus Video (YouTube)', 'From video (YouTube)'), h('img', { src: '/tutor/img/brands/youtube.svg', alt: '', width: 18, height: 18 })));
}
// Test (nur Bens Konto): „Fächer & Bibliothek“ ist ein Bereich – oben ein Umschalter
export function libSwitch(active) {
  if (!mergedNotes()) return null;
  const it = (key, href, icon, label) => h('a', { class: 'ms-sw-i' + (key === active ? ' on' : ''), href, 'aria-current': key === active ? 'page' : 'false' }, h('span', { html: ico(icon) }), h('span', {}, label));
  return h('div', { class: 'view-in ms-swrow' }, h('nav', { class: 'ms-sw', 'aria-label': L('Fächer & Bibliothek', 'Subjects & library') },
    it('bibliothek', '#/app/bibliothek', 'library', L('Bibliothek', 'Library')),
    it('faecher', '#/app/faecher', 'brain', L('Fächer', 'Subjects'))));
}
