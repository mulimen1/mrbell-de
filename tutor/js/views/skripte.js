// Skripte: alles, was du hochgeladen hast – nach Fach sortiert, mit Stand und Klausurtermin.
import { h, ico, ago, modal } from '../util.js';
import { L, LOCALE } from '../i18n.js';
import { S, removeDoc, mastery } from '../state.js';
import { dueCards } from './cards.js';
import * as M from '../me.js';

const KIND = { vorlesung: L('Vorlesung', 'Lecture'), uebung: L('Übung', 'Exercise'), altklausur: L('Altklausur', 'Past exam'), mitschrift: L('Mitschrift', 'Notes'), zusammenfassung: L('Zusammenfassung', 'Summary'), sonstiges: '' };

export function render(root) {
  const wrap = h('div', { class: 'view-in sk' }); root.appendChild(wrap);
  const draw = () => {
    if (!wrap.isConnected) return;
    const me = M.getMe();
    const docs = S.list.slice().sort((a, b) => (b.used || 0) - (a.used || 0));
    const head = h('div', { class: 'vh sk-h' }, h('div', {}, h('h2', {}, L('Skripte', 'Slides')), h('p', {}, docs.length ? L(`${docs.length} ${docs.length === 1 ? 'Skript' : 'Skripte'} auf diesem Gerät – nach Fach sortiert.`, `${docs.length} on this device – sorted by subject.`) : L('Lad deinen Stoff hoch – PDF, PowerPoint, Word, Foto oder Screenshot. Ich sortier es ein.', 'Upload your material – PDF, PowerPoint, Word, photo or screenshot. I’ll sort it.'))),
      h('label', { class: 'btn primary', for: 'fileApp' }, h('span', { html: ico('plus') }), L('Neuer Stoff', 'Add material')));
    if (!docs.length) {
      wrap.replaceChildren(head, h('div', { class: 'sk-empty' }, h('label', { class: 'sk-drop', for: 'fileApp' }, h('span', { html: ico('upload') }), h('b', {}, L('Datei, Foto oder Screenshot hier rein', 'Drop a file, photo or screenshot here')), h('small', {}, L('oder in der App einfach ⌘V / Strg+V', 'or just ⌘V / Ctrl+V in the app'))),
        h('button', { class: 'btn', type: 'button', onclick: () => import('../app.js').then(m => m.topicPrompt()) }, h('span', { html: ico('bulb') }), L('Kein Skript? Nenn mir ein Thema', 'No slides? Give me a topic'))));
      return;
    }
    // nach Fach gruppieren; Fächer mit nächster Klausur zuerst
    const groups = me.faecher.map(f => ({ f, ds: docs.filter(d => (f.docs || []).includes(d.id)) })).filter(g => g.ds.length)
      .sort((a, b) => (a.f.klausur || '9999') < (b.f.klausur || '9999') ? -1 : 1);
    const loose = docs.filter(d => !M.fachOf(d.id));
    const row = d => {
      const due = dueCards(d).length, m = mastery(d);
      const del = h('button', { class: 'iconbtn sk-del', type: 'button', 'aria-label': L('Löschen', 'Delete'), html: ico('trash'), onclick: async e => { e.preventDefault(); e.stopPropagation(); const ok = await modal({ title: L('Skript löschen?', 'Delete these slides?'), text: L(`„${d.name}“ und alles dazu (Quizze, Karten, Chat) wird von diesem Gerät gelöscht.`, `“${d.name}” and everything with it (quizzes, flashcards, chat) will be deleted from this device.`), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] }); if (ok) { await removeDoc(d.id); draw(); } } });
      return h('a', { class: 'sk-r', href: `#/app/${d.id}/hub` },
        h('span', { class: 'sk-i', html: ico(d.generated ? 'bulb' : 'file') }),
        h('span', { class: 'sk-t' }, h('b', {}, d.name), h('small', {}, [KIND[d.kind] || (d.generated ? L('Kurzskript', 'Short script') : d.sample ? L('Beispiel', 'Example') : ''), d.pages.length + L(' Seiten', ' pages'), L('geöffnet ', 'opened ') + ago(d.used || d.created)].filter(Boolean).join(' · '))),
        due ? h('span', { class: 'zb', title: L('fällige Karten', 'cards due') }, String(due)) : h('span'),
        h('span', { class: 'sk-m', title: L('Lernstand', 'Progress') }, h('span', { class: 'zr' }, h('i', { style: { width: m + '%' } })), h('small', {}, m + ' %')),
        del);
    };
    const grp = (title, sub, ds) => h('section', { class: 'sk-g' }, h('div', { class: 'zh' }, h('b', {}, title), sub ? h('small', {}, sub) : null), ds.map(row));
    const exSub = f => { if (!f.klausur) return ''; const n = Math.round((new Date(f.klausur + 'T12:00') - new Date(M.dayKey() + 'T12:00')) / 864e5); return n < 0 ? M.artName(f.klausurArt) + L(' vorbei', ' over') : `${M.artName(f.klausurArt)} ${n === 0 ? L('heute', 'today') : L(`in ${n} ${n === 1 ? 'Tag' : 'Tagen'}`, `in ${n} day${n === 1 ? '' : 's'}`)}`; };
    wrap.replaceChildren(head, h('div', { class: 'sk-list' },
      groups.map(g => grp(g.f.name, exSub(g.f), g.ds)),
      loose.length ? grp(groups.length ? L('Ohne Fach', 'No subject') : L('Alle Skripte', 'All slides'), groups.length ? L('in „Fächer“ zuordnen', 'assign under “Subjects”') : '', loose) : null));
  };
  draw();
  const off = M.onMe(() => draw());
  return () => off();
}
