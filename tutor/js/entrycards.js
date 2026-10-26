// Werkzeug-Karten zum Themen-Einstieg (Google-Anzeige): Laptop links neben der Tafel, Handy unter der Tafel
import { h, ico, ls } from './util.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';
// Werkzeug-Karten neben der Themen-Tafel – wie im „Du willst schon gehen?“-Fenster (das konvertiert):
// Excel-Helfer · Klausurfragen · Karteikarten & Podcast · Video → Lernzettel. Darunter Lexikon/Rechner, Ablage und das Schreibfeld.
const XLS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 1.5h8.3l5.3 5.3v13.7a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#1D6F42"/><path d="M14.5 1.5v3.6a1.7 1.7 0 0 0 1.7 1.7h3.6z" fill="#8fd1ac"/><text x="12" y="17.6" text-anchor="middle" font-size="7.4" font-weight="800" fill="#fff" font-family="Arial,Helvetica,sans-serif">XLS</text></svg>';
export function entryTools(topic, { mobile = false, ask = null } = {}) {
  const tool = (target, label) => async () => {
    if (!getAccount()) {
      const { openAuth } = await import('./account.js');
      const ok = await openAuth({ title: label, registerTitle: label, sub: L('Kostenlos mit Google in zwei Klicks – danach baut Max es dir sofort.', 'Free with Google in two clicks – then Max builds it right away.') }).catch(() => false);
      if (!ok || !getAccount()) return;
    }
    ls.set('tutor.target', target);
    import('./app.js').then(m => m.startTopic(topic));
  };
  const short = topic.length > 30 ? topic.slice(0, 29) + '…' : topic;
  const card = (icon, t, sub, fn, cls = '', extra = null) => h('button', { class: 'rm-tc ' + cls, type: 'button', onclick: fn },
    h('span', { class: 'rm-tci', html: icon }), h('b', {}, t), h('small', {}, sub), extra, h('span', { class: 'rm-tcg', html: ico('right') }));
  // kleine Vorschau: so sieht der Excel-Helfer aus (Formel + Zellen)
  const xlPrev = h('span', { class: 'rm-xlp', 'aria-hidden': 'true' },
    h('span', { class: 'rm-xlf' }, h('i', {}, 'fx'), '=NBW(8%;B2:B6)+B1'),
    h('span', { class: 'rm-xlg' }, ...['1', 'Invest', '-50.000', '2', 'Kapitalwert', '5.312 €'].map((x, i) => h('i', { class: (i % 3 === 0 ? 'hd' : '') + (i === 5 ? ' hit' : '') }, x))));
  // Vorschau: Video läuft durch → zack, fertiger Lernzettel (Endlosschleife)
  const vidPrev = h('span', { class: 'rm-vdp', 'aria-hidden': 'true' },
    h('span', { class: 'rm-vdv' }, h('span', { class: 'rm-vdpl' }), h('span', { class: 'rm-vdbar' }, h('i'))),
    h('span', { class: 'rm-vda', html: ico('right') }),
    h('span', { class: 'rm-vds' }, h('b', {}, L('Lernzettel', 'Study sheet')), h('i'), h('i'), h('i', { class: 'hl' }), h('i')));
  const dk = k => () => document.querySelector(`.dk .dk-b[data-k="${k}"]`)?.click();
  const strip = h('label', { class: 'rm-tdrop', for: 'fileApp' },
    h('span', { class: 'rm-tdi', html: ico('upload') }),
    h('span', { class: 'rm-tdt' }, h('b', {}, mobile ? L('Deine Unterlagen hochladen', 'Upload your material') : [h('span', { class: 'rm-tdl' }, L('Deine Unterlagen hier reinziehen', 'Drop your material here')), h('span', { class: 'rm-tds' }, L('Unterlagen reinziehen', 'Drop material'))]), h('small', {}, L('Skript, Altklausur, Mitschrift, Video – Max macht alles daraus', 'Slides, past exams, notes, video – Max makes it all'))),
    h('span', { class: 'btn sm' }, h('span', { html: ico('plus') }), L('Datei', 'File')));
  // Handy: eigenes Schreibfeld unter den Karten (schickt die Frage an Max)
  const askForm = () => { const inp = h('input', { class: 'rm-mask', type: 'text', enterkeyhint: 'send', maxlength: 400, placeholder: L(`Frag Max zu „${short}“ …`, `Ask Max about “${short}” …`), 'aria-label': L('Frage an Max', 'Question for Max') });
    return h('form', { class: 'rm-maskf', onsubmit: e => { e.preventDefault(); const q = inp.value.trim(); if (!q || !ask) return; inp.value = ''; inp.blur(); ask(q); } }, inp, h('button', { class: 'btn primary', type: 'submit', 'aria-label': L('Senden', 'Send'), html: ico('send') })); };
  return h('div', { class: 'rm-tools' + (mobile ? ' rm-tools-m' : '') },
    h('div', { class: 'rm-tbub' }, h('b', {}, L('Die Tafel ist erst der Anfang.', 'The board is just the start.')), h('span', {}, L('Mach aus jedem Thema alles, was du für die Klausur brauchst – mit deinen Unterlagen oder ohne.', 'Turn any topic into everything you need for the exam – with your material or without.'))),
    h('div', { class: 'rm-tgrid' },
      card(XLS_SVG, L('Excel-Helfer', 'Excel helper'), L('60 Vorlagen + Trainer', '60 templates + trainer'), () => { location.hash = '#/app/excel'; }, 'rm-tcx', xlPrev),
      card('<img src="/tutor/img/brands/youtube.svg" alt="" width="26" height="26">', L('Video → Lernzettel', 'Video → study sheet'), L('YouTube-Link rein, fertig', 'Paste a YouTube link, done'), () => { location.hash = '#/app/video'; }, 'rm-tcy', vidPrev),
      card(ico('exam'), L('Klausurfragen', 'Exam questions'), L(`Zu „${short}“ – mit Musterlösung`, `On “${short}” – with model answers`), tool('quiz', L('Deine Klausurfragen – kostenlos', 'Your exam questions – free'))),
      card(ico('cards'), L('Karteikarten & Podcast', 'Flashcards & podcast'), L('Aus dem Thema oder deinen Folien', 'From the topic or your slides'), tool('karten', L('Deine Karteikarten – kostenlos', 'Your flashcards – free')))),
    h('div', { class: 'rm-tbot' },
      h('div', { class: 'rm-tdk' },
        h('button', { class: 'rm-tdb', type: 'button', onclick: dk('lex') }, h('span', { class: 'rm-tdbi', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9.2 12.6 11 7.4h.1l1.8 5.2M9.8 11h2.6"/><path d="M14.6 9.2h2"/></svg>' }), L('BWL-Lexikon', 'Glossary')),
        h('button', { class: 'rm-tdb', type: 'button', onclick: dk('calc') }, h('span', { class: 'rm-tdbi', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.8" width="14" height="18.4" rx="2.6"/><rect x="8" y="5.8" width="8" height="3.6" rx=".8"/><path d="M8.6 13h.01M12 13h.01M15.4 13h.01M8.6 16.6h.01M12 16.6h.01M15.4 16.6h.01"/></svg>' }), L('Rechner', 'Calculator'))),
      strip,
      mobile ? askForm() : h('div', { class: 'rm-tslot' })));
}
