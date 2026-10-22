// Max findet auf Wunsch ALLES Eigene wieder: Skripte, Mitschriften, Karteikarten, Lernzettel, Podcasts, Tafeln.
// Läuft im Browser (Stichwort-Suche), schickt nur die passendsten Ausschnitte mit.
import { S } from './state.js';
import { looseBoards } from './lib.js';

const STOP = new Set('der die das und oder ein eine einer eines einem einen ist sind war wird werden mit von zu im in am an auf für bei aus als auch nicht nur noch wie was wer wo es sie er ich du wir ihr mir mich dir dich mein meine meinen meinem meiner dein deine kann kannst soll sollte bitte mal noch schon dazu davon darin hier dort the and for with that this what from your have'.split(' '));
const tok = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 2 && !STOP.has(w));
const plain = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Will der Nutzer an seine eigenen Sachen ran?
const OWN = /\b(mein(e|en|em|er)?|unser(e|en)?|my|our)\b[^.?!]{0,40}\b(skript|skripte|folien|vorlesung|mitschrift|mitschriften|notizen|aufschrieb|karteikarten|karten|lernzettel|zusammenfassung|podcast|podcasts|tafel|tafeln|unterlagen|dokument|datei|pdf|quiz|übersicht|uebersicht|slides|notes|flashcards|summary|lecture|board)/i;
const LIB = /\b(in|aus|laut|nach)\s+(meine[mnr]?|dem|der|den)\s+(skript|mitschrift|notizen|unterlagen|vorlesung|folien|karteikarten|lernzettel|podcast|tafel)|hab(e)?\s+ich\s+(hochgeladen|aufgeschrieben|mitgeschrieben)|alle\s+(meine\s+)?(skripte|unterlagen|mitschriften)|in meiner bibliothek/i;

export function wantsLibrary(text) {
  const t = String(text || '');
  if (OWN.test(t) || LIB.test(t)) return true;
  // Name eines eigenen Skripts/einer Mitschrift genannt
  const low = t.toLowerCase();
  return (S.list || []).some(d => d && d.name && d.name.length >= 5 && low.includes(d.name.toLowerCase().slice(0, 40)));
}

function chunks() {
  const out = [];
  const add = (src, text) => { const t = String(text || '').trim(); if (t.length > 20) out.push({ src, text: t }); };
  for (const d0 of S.list || []) {
    const d = S.doc && S.doc.id === d0.id ? S.doc : d0;
    const kind = d.kind === 'mitschrift' ? 'Mitschrift' : d.generated ? 'Kurzskript' : 'Skript';
    (d.pages || []).forEach((p, i) => add(`${kind} „${d.name}“, S. ${i + 1}`, String(p).slice(0, 3000)));
    const cards = (d.decks || []).flatMap(k => k.cards || []);
    for (let i = 0; i < cards.length; i += 12) add(`Karteikarten zu „${d.name}“`, cards.slice(i, i + 12).map(c => `• ${c.front} → ${c.back || ''}${c.formula ? ' (' + c.formula + ')' : ''}`).join('\n'));
    if (d.summary) add(`Lernzettel „${d.summary.title || d.name}“`, [(d.summary.tldr || []).join(' · '), plain(d.summary.html).slice(0, 4000), (d.summary.terms || []).map(t => (t.term || t.t || '') + ': ' + (t.def || t.d || '')).join(' · ')].join('\n'));
    (d.podcasts || []).forEach(p => add(`Podcast „${p.title || 'Folge'}“ (${d.name})`, (p.lines || []).map(l => `${l.s}: ${l.t}`).join('\n').slice(0, 5000)));
    (d.boards || []).forEach(b => add(`Tafel „${b.title || 'Tafel'}“ (${d.name})`, plain(b.html).slice(0, 3000)));
    if (d.ms && d.ms.data) add(`Mitschrift „${d.name}“ (Fragen/Korrekturen)`, [...(d.ms.data.korrekturen || []), ...(d.ms.data.fragen || [])].map(String).join(' · '));
  }
  try { looseBoards().forEach(b => add(`Tafel „${b.title || 'Tafel'}“`, plain(b.html).slice(0, 3000))); } catch (e) {}
  return out;
}

// Die passendsten Stellen aus allem Eigenen; leer, wenn nichts wirklich passt
export function libraryMaterial(query, limit = 26000) {
  const q = [...new Set(tok(query))];
  if (!q.length) return null;
  const cs = chunks(); if (!cs.length) return null;
  const toks = cs.map(c => tok(c.src + ' ' + c.text));
  const N = cs.length, df = new Map();
  toks.forEach(ts => new Set(ts).forEach(w => df.set(w, (df.get(w) || 0) + 1)));
  const scored = toks.map((ts, i) => {
    const tf = new Map(); ts.forEach(w => tf.set(w, (tf.get(w) || 0) + 1));
    let s = 0;
    for (const w of q) {
      let f = tf.get(w) || 0;
      if (!f && w.length > 5) for (const [k, v] of tf) if (k.length > 5 && (k.includes(w) || w.includes(k))) f += v * .6;
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(w) || 1) + .5) / ((df.get(w) || 1) + .5));
      s += idf * (f * 2.2) / (f + 1.2 * (.25 + .75 * ts.length / 300));
    }
    // genannter Name zählt extra
    if (String(query).toLowerCase().includes(cs[i].src.toLowerCase().replace(/^.*„|“.*$/g, '').slice(0, 30))) s += 3;
    return { i, s };
  }).filter(x => x.s > 0.8).sort((a, b) => b.s - a.s);
  if (!scored.length) return null;
  let out = '', names = new Set();
  for (const { i } of scored) {
    const c = cs[i], piece = `### ${c.src}\n${c.text}\n\n`;
    if (out.length + piece.length > limit) { if (out) break; out = piece.slice(0, limit); names.add(c.src); break; }
    out += piece; names.add(c.src.replace(/,\s*S\.\s*\d+$/, ''));
  }
  return { material: '[Ausschnitte aus den eigenen Unterlagen des Studierenden – Quelle jeweils in der Überschrift. Nenne die Quelle, wenn du daraus zitierst.]\n\n' + out, docName: [...names].slice(0, 4).join(' + ') + (names.size > 4 ? ' …' : '') };
}
