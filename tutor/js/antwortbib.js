// Antwort-Bibliothek: geprüfte Antworten auf typische Fragen (aus der Faktendatenbank, Feld „fragen“).
// Passt eine Frage sicher zu einer gespeicherten Frage, antwortet Max direkt daraus – ohne KI-Aufruf, mit Siegel und Quellen.
// Lieber kein Treffer als ein falscher: strenge Schwelle, keine eigenen Zahlen, keine Rückbezüge auf das Gespräch.
import { themaDaten } from './faktendb.js';
let FR = null;   // Fragen-Index (tutor/data/fakten/_fragen.json), einmal geladen und vorbereitet
async function fragenIndex() {
  if (FR) return FR;
  FR = fetch('/tutor/data/fakten/_fragen.json').then(r => (r.ok ? r.json() : [])).then(a => a.map(([t, i, f, v]) => ({ t, i, f, k: [f, ...(v || [])].map(toks) }))).catch(() => []);
  return FR;
}

const STOP = new Set('a ab aber alle als also am an auch auf aus bei beim bin bis bitte bzw da damit dann das dass dem den der des die dir doch du durch ein eine einem einen einer eines er erklär erkläre erklären erklärt es etwa für gibt habe hat hier ich ihr im in ist ja kann kannst kurz man mal mich mir mit muss nach noch nur ob oder sich sie sind so soll sollte über um und uns von vor was welche welcher welches wenn wer werden wie wird wo zu zum zur genau einfach eigentlich bedeutet heißt meint versteht definiert definition erklärung frage bwl max funktioniert funktionieren läuft ab'.split(' '));
const stem = w => w.length > 5 ? w.replace(/(ungen|ung|en|er|es|e|n|s)$/, '') : w;
const toks = s => new Set(String(s || '').toLowerCase().replace(/\\\(|\\\)|<[^>]+>/g, ' ').replace(/[^a-zäöüß0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP.has(w)).map(stem));
const RUECKBEZUG = /^(und|aber|also|ok|okay|nochmal|noch mal)\b|\b(das|dies|dazu|davon|oben|vorhin|eben|deine?r?|einfacher|anders|nochmal|genauer|weiter)\b.{0,12}$|^(warum|wieso) (das|so)\b/i;
const AKTION = /\b(tafel|zeig|mal mir|quiz|karte|karteikarten|übung|aufgabe|beispiel mit|rechne|berechne mir|mein|meine|unser|skript|folie|podcast|lernzettel|klausur am)\b/i;

// Frage-Absicht muss übereinstimmen: „Wie berechne ich X?“ ist nicht „Was ist X?“, „Unterschied X/Y“ nicht „Was ist X?“
const ABSICHT = ['berechn', 'rechn', 'unterschied', 'vs', 'warum', 'wieso', 'wann', 'vorteil', 'nachteil', 'beispiel', 'formel', 'schritt', 'fehler', 'grenz', 'ziel'];
const absicht = set => ABSICHT.filter(a => [...set].some(w => w.startsWith(a))).join(',');
function score(q, c) {
  if (!c.size || !q.size) return 0;
  if (absicht(q) !== absicht(c)) return 0;
  let n = 0; for (const w of c) if (q.has(w)) n++;
  const deckC = n / c.size, deckQ = n / q.size;
  return deckC >= 0.8 && deckQ >= 0.7 ? (deckC + deckQ) / 2 : 0;
}

// Ergebnis: { frage, antwort, belege:[{id, aussage, quelle}], thema } oder null
// Erst einschalten, wenn alle gespeicherten Antworten die Prüfmaschine bestanden haben und der Treffer-Test sauber ist
export const AKTIV = false;
export async function bibTreffer(text, { verlauf = 0 } = {}) {
  if (!AKTIV) return null;
  const t = String(text || '').trim();
  if (t.length < 8 || t.length > 220 || AKTION.test(t) || (verlauf > 0 && RUECKBEZUG.test(t))) return null;
  const q = toks(t); if (q.size < 1 || q.size > 12) return null;
  const zahlen = (t.match(/\d+(?:[.,]\d+)?/g) || []).filter(z => !/^(19|20)\d\d$/.test(z) && !/^\d$/.test(z));
  let best = null;
  for (const e of await fragenIndex()) {
    // eigene Zahlen in der Frage? Dann nur, wenn die gespeicherte Frage genau diese Zahlen hat
    if (zahlen.length && !zahlen.every(z => e.f.includes(z))) continue;
    for (const c of e.k) { const sc = score(q, c); if (sc && (!best || sc > best.s)) best = { s: sc, e }; }
  }
  if (!best || best.s < 0.82) return null;
  const d = await themaDaten(best.e.t); const f = d && d.fragen && d.fragen[best.e.i];
  if (!f || f.frage !== best.e.f) return null;
  best = { s: best.s, f, d };
  const ids = new Set(best.f.belege || []);
  const belege = (best.d.aussagen || []).filter(a => ids.has(a.id)).map(a => ({ id: a.id, thema: best.d.name, aussage: a.aussage, quelle: a.quelle || {} }));
  if (!belege.length) return null;
  return { frage: best.f.frage, antwort: best.f.antwort, belege, thema: best.d.name, slug: best.d.thema, score: best.s };
}

// Fertige Max-Antwort (gleiches Format wie vom Server) – kurz im Chat, die Antwort an der Tafel
export async function bibAntwort(text, opt = {}) {
  let b = null; try { b = await Promise.race([bibTreffer(text, opt), new Promise(r => setTimeout(() => r(null), 1500))]); } catch (e) {}
  if (!b) return null;
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const html = String(b.antwort).split(/\n{2,}/).map(p => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');
  const quellen = [...new Set(b.belege.map(x => x.quelle && x.quelle.name).filter(Boolean))].slice(0, 3).join(' · ');
  const raw = 'Hier die geprüfte Antwort aus unserer Wissensbasis – steht an der Tafel. Frag gern nach, wenn du es anders erklärt haben willst.\n```tafel ' + b.frage.replace(/\n/g, ' ').slice(0, 90) + '\n' + html + (quellen ? '<div class="source">Quellen: ' + esc(quellen) + '</div>' : '') + '\n```';
  try { if (window.BM) window.BM.track('Antwort-Bibliothek', b.slug); } catch (e) {}
  return { ok: true, text: raw, model: 'bibliothek', tools: [], bibliothek: true,
    rechenpruefung: { rechnungen: 0, korrigiert: 0, offen: 0, fakten: [], belege: b.belege, db: { ok: true, geprueft: b.belege.length, widersprueche: [] }, bibliothek: true } };
}
