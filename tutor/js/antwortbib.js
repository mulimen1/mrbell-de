// Antwort-Bibliothek: geprüfte Antworten auf typische Fragen (aus der Faktendatenbank, Feld „fragen“).
// Passt eine Frage sicher zu einer gespeicherten Frage, antwortet Max direkt daraus – ohne KI-Aufruf, mit Siegel und Quellen.
// Lieber kein Treffer als ein falscher: strenge Schwelle, keine eigenen Zahlen, keine Rückbezüge auf das Gespräch.
import { themaDaten } from './faktendb.js';
let FR = null;   // Fragen-Index (tutor/data/fakten/_fragen.json), einmal geladen und vorbereitet
async function fragenIndex() {
  if (FR) return FR;
  FR = fetch('/tutor/data/fakten/_fragen.json').then(r => (r.ok ? r.json() : [])).then(a => a.map(([t, i, f, v]) => ({ t, i, f, k: [f, ...(v || [])].map(toks), a: absicht(toks(f)), jn: JANEIN.test(f), z: ziffern(f) }))).catch(() => []);
  return FR;
}

const STOP = new Set('a ab aber alle als also am an auch auf aus bei beim bin bis bitte bzw da damit dann das dass dem den der des die dir doch du durch ein eine einem einen einer eines er erklär erkläre erklären erklärt es etwa für gibt habe hat hier ich ihr im in ist ja kann kannst kurz man mal mich mir mit muss nach noch nur ob oder sich sie sind so soll sollte über um und uns von vor was welche welcher welches wenn wer werden wie wird wo zu zum zur genau einfach eigentlich bedeutet heißt meint versteht definiert definition erklärung frage bwl max funktioniert funktionieren läuft ab'.split(' '));
const stem = w => w.length > 5 ? w.replace(/(ungen|ung|en|er|es|e|n|s)$/, '') : w;
const toks = s => new Set(String(s || '').toLowerCase().replace(/\\\(|\\\)|<[^>]+>/g, ' ').replace(/[^a-zäöüß0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP.has(w)).map(stem));
const RUECKBEZUG = /^(und|aber|also|ok|okay|nochmal|noch mal)\b|\b(das|dies|dazu|davon|oben|vorhin|eben|deine?r?|einfacher|anders|nochmal|genauer|weiter)\b.{0,12}$|^(warum|wieso) (das|so)\b/i;
const AKTION = /\b(tafel|zeig|mal mir|quiz|karte|karteikarten|übung|aufgabe|beispiel mit|rechne|berechne mir|mein|meine|unser|skript|folie|podcast|lernzettel|klausur am)\b/i;

// Frage-Absicht muss übereinstimmen: „Wie berechne ich X?“ ist nicht „Was ist X?“, „Unterschied X/Y“ nicht „Was ist X?“
// Synonyme zusammengefasst: „vs“/„Unterschied“, „berechnen“/„rechnen“/„Formel“, „warum“/„wieso“
const ABSICHT = [['berechn', 'R'], ['rechn', 'R'], ['formel', 'R'], ['unterschied', 'U'], ['vs', 'U'], ['abgrenz', 'U'], ['warum', 'W'], ['wieso', 'W'], ['weshalb', 'W'], ['wann', 'T'], ['vorteil', 'V'], ['nachteil', 'N'], ['beispiel', 'B'], ['schritt', 'S'], ['fehler', 'F'], ['grenz', 'G'], ['ziel', 'Z']];
const absicht = set => [...new Set(ABSICHT.filter(([a]) => [...set].some(w => w.startsWith(a))).map(([, k]) => k))].sort().join(',');
// Ja/Nein-Frage („Ist jedes …?“) beantwortet keine offene Frage („Was ist …?“) und umgekehrt
const JANEIN = /^\s*(ist|sind|gibt es|kann|können|muss|müssen|darf|dürfen|herrscht|hat|haben|wird|werden|zählt|zählen|gehört|gehören|lohnt|stimmt)\b/i;
const GENERISCH = ['definition', 'erklär', 'bedeut', 'interpret', 'arten', 'formen', 'ablauf', 'überblick', 'zusammenhang', 'einfach', 'kurz', 'genau', 'thema', 'begriff', 'merkmal', 'eigenschaft', 'funktion', 'bwl', 'vwl', 'klausur'];
// Ordnungszahlen und einzelne Ziffern („2. Gossensches Gesetz“, „Liquidität 1. Grades“) müssen übereinstimmen
const ziffern = s => (String(s).match(/\d+/g) || []).filter(z => !/^(19|20)\d\d$/.test(z)).sort().join(',');
function score(q, c) {
  if (!c.size || !q.size) return 0;
  if (absicht(q) !== absicht(c)) return 0;
  let n = 0; for (const w of c) if (q.has(w)) n++;
  const deckC = n / c.size, deckQ = n / q.size;
  return deckC >= 0.8 && deckQ >= 0.7 ? (deckC + deckQ) / 2 : 0;
}

// Ergebnis: { frage, antwort, belege:[{id, aussage, quelle}], thema } oder null
// Erst einschalten, wenn alle gespeicherten Antworten die Prüfmaschine bestanden haben und der Treffer-Test sauber ist
export const AKTIV = true;
export async function bibTreffer(text, { verlauf = 0 } = {}) {
  if (!AKTIV) return null;
  const t = String(text || '').trim();
  if (t.length < 8 || t.length > 220 || AKTION.test(t) || (verlauf > 0 && RUECKBEZUG.test(t))) return null;
  const q = toks(t); if (q.size < 1 || q.size > 12) return null;
  const zahlen = (t.match(/\d+(?:[.,]\d+)?/g) || []).filter(z => !/^(19|20)\d\d$/.test(z) && !/^\d$/.test(z));
  const qa = absicht(q), qjn = JANEIN.test(t), qz = ziffern(t);
  // Inhaltswörter der Frage (ohne Absichts- und Allerweltswörter): mindestens eins, und jedes muss in Frage oder Antwort vorkommen
  const inhalt = [...q].filter(w => w.length > 2 && !ABSICHT.some(([a]) => w.startsWith(a)) && !GENERISCH.some(g => w.startsWith(g)));
  if (!inhalt.length) return null;
  const kand = [];
  for (const e of await fragenIndex()) {
    // eigene Zahlen in der Frage? Dann nur, wenn die gespeicherte Frage genau diese Zahlen hat
    if (zahlen.length && !zahlen.every(z => e.f.includes(z))) continue;
    // Absicht der Hauptfrage, Fragetyp und Ziffern müssen passen (nicht nur die einer Variante)
    if (e.a !== qa || e.jn !== qjn || (qz && e.z !== qz)) continue;
    let s = 0; for (const c of e.k) s = Math.max(s, score(q, c));
    if (s >= 0.82) kand.push({ s, e });
  }
  kand.sort((a, b) => b.s - a.s);
  let best = null;
  for (const k of kand.slice(0, 5)) {
    const d = await themaDaten(k.e.t); const f = d && d.fragen && d.fragen[k.e.i];
    if (!f || f.frage !== k.e.f) continue;
    const text = (f.frage + ' ' + f.antwort).toLowerCase();
    if (!inhalt.every(w => text.includes(w))) continue;   // Antwort muss das Gefragte wirklich behandeln
    best = { s: k.s, f, d }; break;
  }
  if (!best) return null;
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
