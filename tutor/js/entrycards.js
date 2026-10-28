// Werkzeug-Karten zum Themen-Einstieg (Google-Anzeige): Laptop links neben der Tafel, Handy unter der Tafel
import { h, ico, ls } from './util.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';
import { landingTopic } from './themen.js';
import { ET } from './entrytext.js';
// Werkzeug-Karten neben der Themen-Tafel – wie im „Du willst schon gehen?“-Fenster (das konvertiert):
// Excel-Helfer · Klausurfragen · Karteikarten & Podcast · Video → Lernzettel. Darunter Lexikon/Rechner, Ablage und das Schreibfeld.
const XLS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 1.5h8.3l5.3 5.3v13.7a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#1D6F42"/><path d="M14.5 1.5v3.6a1.7 1.7 0 0 0 1.7 1.7h3.6z" fill="#8fd1ac"/><text x="12" y="17.6" text-anchor="middle" font-size="7.4" font-weight="800" fill="#fff" font-family="Arial,Helvetica,sans-serif">XLS</text></svg>';
// Klausurfragen/Karteikarten zum Thema: ohne Konto erst kostenlos anmelden, dann baut Max es sofort (auch von den Lernseiten: ?ziel=quiz|karten)
export async function runTool(target, topic, label) {
  if (!getAccount()) {
    const { openAuth } = await import('./account.js');
    const ok = await openAuth({ title: label, registerTitle: label, sub: L('Kostenlos mit Google in zwei Klicks – danach baut Max es dir sofort.', 'Free with Google in two clicks – then Max builds it right away.') }).catch(() => false);
    if (!ok || !getAccount()) return;
  }
  ls.set('tutor.target', target);
  import('./app.js').then(m => m.startTopic(topic));
}
// Excel-Helfer / Video: Gäste melden sich erst an (persönlicher Titel), dann geht's direkt dorthin
async function gateGo(hash, label) {
  if (!getAccount()) {
    const { openAuth } = await import('./account.js');
    const ok = await openAuth({ title: label, registerTitle: label, sub: L('Kostenlos mit Google in zwei Klicks – danach geht’s sofort los.', 'Free with Google in two clicks – then you’re straight in.') }).catch(() => false);
    if (!ok || !getAccount()) return;
  }
  location.hash = hash;
}
export function entryTools(topic, { mobile = false, ask = null } = {}) {
  const tool = (target, label) => () => runTool(target, topic, label);
  const short = topic.length > 30 ? topic.slice(0, 29) + '…' : topic;
  // Pro Thema eigene Texte (Google-Anzeigen-Seiten), sonst allgemein mit Themenname
  let et = null; try { const T = landingTopic(); et = T && ET[T.slug] || null; } catch (e) {}
  const kurz = et ? et[0] : short;
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
  // Vorschau Klausurfragen: Aufgabe mit drei Antworten – die richtige wird grün abgehakt, Punkte zählen hoch
  const qzPrev = h('span', { class: 'rm-qzp', 'aria-hidden': 'true' },
    h('span', { class: 'rm-qzh' }, h('b', {}, L('Aufgabe 1', 'Task 1')), h('i', {}, kurz), h('em', {}, '6/6 P.')),
    ...['A', 'B', 'C'].map((x, i) => h('span', { class: 'rm-qzo' + (i === 1 ? ' ok' : '') }, h('b', {}, x), h('i'))));
  // Vorschau Karteikarten & Podcast: Karte dreht sich um, daneben läuft die Folge
  const kaPrev = h('span', { class: 'rm-kap', 'aria-hidden': 'true' },
    h('span', { class: 'rm-kac' }, h('span', { class: 'rm-kas' }), h('span', { class: 'rm-kas' }), h('span', { class: 'rm-kaf' }, h('em', {}, L('Karteikarte', 'Flashcard')), h('b', {}, kurz), h('small', {}, '?')), h('span', { class: 'rm-kab' }, h('em', {}, L('Antwort', 'Answer')), h('i'), h('i'), h('i'))),
    h('span', { class: 'rm-kapo' }, h('span', { class: 'rm-kapl' }), h('span', { class: 'rm-kaw' }, ...Array.from({ length: 9 }, () => h('i')))));
  const dk = k => () => document.querySelector(`.dk .dk-b[data-k="${k}"]`)?.click();
  const strip = h('label', { class: 'rm-tdrop', for: 'fileApp' },
    h('span', { class: 'rm-tdi', html: ico('upload') }),
    h('span', { class: 'rm-tdt' }, h('b', {}, mobile ? L('Deine Unterlagen hochladen', 'Upload your material') : [h('span', { class: 'rm-tdl' }, L('Deine Unterlagen hier reinziehen', 'Drop your material here')), h('span', { class: 'rm-tds' }, L('Unterlagen reinziehen', 'Drop material'))]), h('small', {}, L('Skript, Altklausur, Mitschrift, Video – Max macht alles daraus', 'Slides, past exams, notes, video – Max makes it all'))),
    h('span', { class: 'btn sm' }, h('span', { html: ico('plus') }), L('Datei', 'File')));
  // Handy: eigenes Schreibfeld unter den Karten (schickt die Frage an Max)
  const askForm = () => { const inp = h('input', { class: 'rm-mask', type: 'text', enterkeyhint: 'send', maxlength: 400, placeholder: L(`Frag Max zu „${short}“ …`, `Ask Max about “${short}” …`), 'aria-label': L('Frage an Max', 'Question for Max') });
    return h('form', { class: 'rm-maskf', onsubmit: e => { e.preventDefault(); const q = inp.value.trim(); if (!q || !ask) return; inp.value = ''; inp.blur(); ask(q); } }, inp, h('button', { class: 'btn primary', type: 'submit', 'aria-label': L('Senden', 'Send'), html: ico('send') })); };
  return h('div', { class: 'rm-tools' + (mobile ? ' rm-tools-m' : '') },
    h('div', { class: 'rm-tbub' }, h('b', {}, L('Moin, ich bin Max aus Sylt. Die Tafel ist erst der Anfang.', 'Moin, I’m Max from Sylt. The board is just the start.')), h('span', {}, L('Mit mir wird dein Studium entspannter – mach dir keinen Stress. Den hab ich nur, wenn die Yacht nicht anspringt.', 'With me, uni gets a lot more relaxed – no stress. I only stress when the yacht won’t start.'))),
    h('div', { class: 'rm-tgrid' },
      card(ico('exam'), L(`Klausurfragen zu ${kurz}`, `Exam questions on ${kurz}`), et ? et[1] : L(`Typische Aufgaben zu „${short}“ – mit Musterlösung`, `Typical tasks on “${short}” – with model answers`), tool('quiz', L(`Deine Klausurfragen zu ${kurz} – kostenlos`, `Your exam questions on ${kurz} – free`)), 'rm-tcq', qzPrev),
      card(ico('cards'), L(`${kurz}: Karteikarten & Podcast`, `${kurz}: flashcards & podcast`), et ? et[2] : L(`Alles Wichtige zu „${short}“ zum Wiederholen und Anhören`, `Everything on “${short}” to review and listen to`), tool('karten', L(`Deine Karteikarten zu ${kurz} – kostenlos`, `Your flashcards on ${kurz} – free`)), 'rm-tck', kaPrev)),
    h('div', { class: 'rm-tbot' },
      h('div', { class: 'rm-tdk' },
        h('button', { class: 'rm-tdb', type: 'button', onclick: dk('lex'), title: L('BWL-Lexikon', 'Glossary'), 'aria-label': L('BWL-Lexikon', 'Glossary') }, h('span', { class: 'rm-tdbi', 'data-icc': 'book', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9.2 12.6 11 7.4h.1l1.8 5.2M9.8 11h2.6"/><path d="M14.6 9.2h2"/></svg>' })),
        h('button', { class: 'rm-tdb', type: 'button', onclick: dk('calc'), title: L('Rechner', 'Calculator'), 'aria-label': L('Rechner', 'Calculator') }, h('span', { class: 'rm-tdbi', 'data-icc': 'calc', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.8" width="14" height="18.4" rx="2.6"/><rect x="8" y="5.8" width="8" height="3.6" rx=".8"/><path d="M8.6 13h.01M12 13h.01M15.4 13h.01M8.6 16.6h.01M12 16.6h.01M15.4 16.6h.01"/></svg>' }))),
      mobile ? strip : null,
      mobile ? askForm() : h('div', { class: 'rm-tslot' })));
}
