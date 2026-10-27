// Rechen-Gate: Jede Antwort von Max läuft durch den Rechenprüfer (ohne KI), bevor sie angezeigt wird.
//  1. Prüfen + eindeutige Fehler sofort richtig einsetzen (exakt gerechnet, kein Raten).
//  2. Bleibt etwas falsch: Max bessert genau diese Stellen nach (höchstens 2 Runden), danach wird wieder geprüft.
//  3. Notbremse: Was dann immer noch nicht stimmt, wird nicht als Zahl gezeigt, sondern als „nicht bestätigt“ markiert
//     (Quizfragen/Karten mit falscher Rechnung fallen raus).
// Gezählt wird nur anonym (Anzahl, Art) – kein Inhalt.
import { pruefe, korrigiere, pruefeQuiz, BLOCKIEREND } from './rechenpruefer.js';
import { L } from './i18n.js';

// Antworten mit Erklärungen/Rechnungen von Max. Nicht: Foto-Abschrift, Upload-Analyse, Transkription, Sprache, Konto …
export const GEPRUEFT = new Set(['chat', 'topic', 'quiz', 'exam', 'cards', 'summary', 'lesson', 'path', 'podcast', 'grade', 'mitschrift']);
const KI_RUNDEN = 2, KI_TIMEOUT = 30000;

// Welche Felder der Antwort sind Max-Text?
function teil(action, j) {
  if (action === 'chat') return { get: () => ({ text: String(j.text || '') }), set: d => ({ ...j, text: d.text }) };
  return { get: () => j.data || {}, set: d => ({ ...j, data: d }) };
}
// Text, der vom Nutzer stammt: Zahlen daraus gelten als gegeben; Rechnungen daraus sind Zitate (z. B. die Lösung, die bewertet wird)
function nutzerText(action, payload) {
  const o = payload.opts || {};
  const msgs = (payload.messages || []).filter(m => m && m.role === 'user').slice(-2).map(m => String(m.content || ''));
  return { zitat: [...msgs, o.answer, o.notes, o.question, o.topic].filter(Boolean).map(String).join('\n'), kontext: [...msgs, o.answer, o.notes, o.question, o.topic, payload.material].filter(Boolean).map(String).join('\n').slice(0, 60000) };
}
const norm = s => String(s).replace(/\\[,;!: ]|\{,\}|\\text\{[^{}]*\}|\\cdot|\\times|[·×*\s]/g, '').replace(/−/g, '-');
function istZitat(f, zitat) {
  if (!zitat || !f.text) return false;
  const z = norm(zitat), t = norm(f.text);
  return t.length >= 3 && z.includes(t);
}

// Alle Befunde (Formeln/Text/Buchungen/Tabellen + Quiz) nach Korrektur
function lauf(action, data, kontext, zitat, opts = {}) {
  const r = korrigiere(data, { kontext, ...opts });
  let d = r.data, quizFix = 0;
  let rest = r.rest.filter(f => !istZitat(f, zitat));
  const fragen = (action === 'quiz' || action === 'exam') && Array.isArray(d.questions) ? d.questions : null;
  if (fragen) {
    for (const q of pruefeQuiz(fragen)) {
      // eindeutige Quizkorrektur: Lösung = Endergebnis des (geprüften) Rechenwegs / die einzige Option mit dem Ergebnis
      const ohneRechenfehler = !rest.some(f => f.path && f.path[0] === 'questions' && f.path[1] === q.i);
      if (q.fixQuiz && ohneRechenfehler) { d = { ...d, questions: d.questions.map((x, k) => k === q.i ? { ...x, ...q.fixQuiz } : x) }; quizFix++; }
      else rest.push({ ...q, path: ['questions', q.i] });
    }
  }
  return { data: d, rest, geaendert: r.geaendert.length + quizFix, alle: r.alle };
}

// Max bessert nur die betroffenen Felder nach (Antwort als JSON {id: neuer Text})
async function kiNachbesserung(raw, data, rest, signal) {
  const felder = new Map();
  for (const f of rest) {
    if (!f.path || !f.path.length) continue;
    // Quizfrage: ganze Frage als JSON nachbessern lassen; sonst das Textfeld
    const q = f.art === 'quiz-falsche-option' ? f.path.slice(0, 2) : f.path.slice();
    const k = JSON.stringify(q);
    if (![...felder.values()].some(x => x.k === k)) { const v = get(data, q); felder.set('f' + felder.size, { k, path: q, json: typeof v !== 'string', text: typeof v === 'string' ? v : JSON.stringify(v), fehler: [] }); }
    const e = [...felder.values()].find(x => x.k === k);
    const soll = f.fixUnsicher ? ` – richtig wäre ${f.fixUnsicher.neu}` : '';
    e.fehler.push(`${f.art === 'buchung-soll-ungleich-haben' ? 'Buchungssatz: Soll ≠ Haben' : f.art === 'summenzeile-falsch' ? 'Summenzeile stimmt nicht' : f.art === 'quiz-falsche-option' ? 'Lösung passt nicht zum Rechenweg' : 'Rechnung falsch'}: „${String(f.text).slice(0, 200)}“${soll}${f.weiterverwendet ? ' (das falsche Ergebnis wird danach weiterverwendet – alle Folgeschritte neu rechnen)' : ''}`);
  }
  if (!felder.size) return null;
  const teile = [...felder.entries()].map(([id, x]) => `### ${id}${x.json ? ' (JSON-Objekt – gib es als JSON-Objekt zurück, gleiche Felder)' : ''}\nFEHLER:\n- ${x.fehler.join('\n- ')}\nTEXT:\n${x.text}`).join('\n\n');
  const prompt = `RECHENKORREKTUR (interne Prüfung, keine Erklärung an den Nutzer). Ein Rechenprüfer hat in deinem Text Fehler gefunden. Korrigiere NUR die Rechnungen: rechne jede genannte Stelle neu und passe alle Folgeschritte und Ergebnisse an, die davon abhängen. Format, Formeln (\\( … \\)), HTML und Wortlaut sonst unverändert lassen. Antworte AUSSCHLIESSLICH mit JSON: {"f0": "vollständiger korrigierter Text", …} für jede ID.\n\n${teile}`;
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), KI_TIMEOUT);
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  try {
    const r = await raw('chat', { messages: [{ role: 'user', content: prompt }], opts: { voice: false, assistant: true, entry: true, rechenkorrektur: true } }, { signal: ctrl.signal });
    const t = String(r.text || ''); const m = /\{[\s\S]*\}/.exec(t); if (!m) return null;
    const obj = JSON.parse(m[0]); let d = data;
    for (const [id, x] of felder) {
      if (x.json) { if (obj[id] && typeof obj[id] === 'object') d = set(d, x.path, { ...get(d, x.path), ...obj[id] }); }
      else if (typeof obj[id] === 'string' && obj[id].trim()) d = set(d, x.path, obj[id]);
    }
    return d;
  } catch (e) { return null; } finally { clearTimeout(to); }
}

// Notbremse: falsche Werte nicht zeigen
const MARKE = () => L('nicht bestätigt', 'not verified');
function notbremse(action, data, rest) {
  let d = data; const weg = new Set();
  for (const f of rest) {
    if (!f.path) continue;
    // Quizfragen, Karten mit falscher Rechnung: ganz weglassen
    if ((action === 'quiz' || action === 'exam') && f.path[0] === 'questions') { weg.add('q' + f.path[1]); continue; }
    if (action === 'cards' && f.path[0] === 'cards') { weg.add('c' + f.path[1]); continue; }
  }
  // falsche Ergebnisse markieren (von hinten nach vorn je Feld)
  const byPath = new Map();
  for (const f of rest) { if (!f.path || typeof get(d, f.path) !== 'string') continue; const k = JSON.stringify(f.path); if (!byPath.has(k)) byPath.set(k, []); byPath.get(k).push(f); }
  for (const [k, fs] of byPath) {
    const path = JSON.parse(k); let s = get(d, path);
    fs.sort((a, b) => (b.start ?? -1) - (a.start ?? -1));
    let last = Infinity;
    for (const f of fs) {
      const sp = f.fixUnsicher || f.fix || f.bspan;
      if (sp && sp.end <= last && s.slice(sp.start, sp.end) === sp.alt) {
        const inTex = f.ort === 'formel';
        s = s.slice(0, sp.start) + (inTex ? `\\text{[${MARKE()}]}` : `[${MARKE()}]`) + s.slice(sp.end); last = sp.start;
      } else if (!sp && f.bvon != null && f.end <= last && f.end > f.bvon) {   // Ergebnis ist ein Ausdruck: ganz ersetzen
        const inTex = f.ort === 'formel'; const lead = s.slice(f.bvon, f.end).match(/^\s*/)[0];
        s = s.slice(0, f.bvon) + lead + (inTex ? `\\text{[${MARKE()}]}` : `[${MARKE()}]`) + ' ' + s.slice(f.end); last = f.bvon;
      } else if (f.ort === 'buchung' || f.art === 'summenzeile-falsch' || !sp) {
        if (!s.includes('⚠')) s = s + (/<\/?[a-z][^>]*>/i.test(s) ? `<p class="rechen-hinweis">⚠ ${L('Eine Rechnung hier konnte nicht bestätigt werden – bitte nachrechnen.', 'A calculation here could not be verified – please double-check.')}</p>` : `\n\n⚠ ${L('Eine Rechnung hier konnte nicht bestätigt werden – bitte nachrechnen.', 'A calculation here could not be verified – please double-check.')}`);
      }
    }
    d = set(d, path, s);
  }
  if (weg.size) {
    if (Array.isArray(d.questions)) { const qs = d.questions.filter((_, i) => !weg.has('q' + i)); if (qs.length >= 2) d = { ...d, questions: qs }; }
    if (Array.isArray(d.cards)) { const cs = d.cards.filter((_, i) => !weg.has('c' + i)); if (cs.length >= 1) d = { ...d, cards: cs }; }
  }
  return d;
}

function get(o, p) { for (const k of p) { if (o == null) return undefined; o = o[k]; } return o; }
function set(o, p, v) { if (!p.length) return v; const c = Array.isArray(o) ? o.slice() : { ...(o || {}) }; c[p[0]] = set(o ? o[p[0]] : undefined, p.slice(1), v); return c; }
function track(art, detail) { try { if (window.BM) window.BM.track('Rechenprüfung', art + (detail ? ' · ' + detail : '')); } catch (e) {} }

// Hauptfunktion: raw = Server-Aufruf ohne Gate (für die Nachbesserung)
export async function rechenGate(action, payload, j, raw, { signal } = {}) {
  if (!GEPRUEFT.has(action) || !j || !j.ok || (payload.opts && payload.opts.rechenkorrektur)) return j;
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
  const T = teil(action, j); const { zitat, kontext } = nutzerText(action, payload);
  let data, r;
  try { data = T.get(); r = lauf(action, data, kontext, zitat); }
  catch (e) { track('Fehler', String(e && e.message || e).slice(0, 60)); return { ...j, rechenpruefung: { status: 'fehler' } }; }
  const info = { rechnungen: 0, korrigiert: r.geaendert, ki: 0, offen: 0, ms: 0 };
  data = r.data;
  if (r.rest.length) {   // weiterverwendete falsche Ergebnisse: an den Folgestellen mitkorrigieren (danach wird alles neu geprüft)
    const r3 = lauf(action, data, kontext, zitat, { folge: true });
    if (r3.rest.length < r.rest.length) { data = r3.data; info.korrigiert += r3.geaendert; r = r3; }
  }
  for (let k = 0; k < KI_RUNDEN && r.rest.length; k++) {   // Rest: Max bessert genau diese Stellen nach
    info.ki++;
    const d2 = await kiNachbesserung(raw, data, r.rest, signal);
    if (!d2) break;
    let r2 = lauf(action, d2, kontext, zitat);
    if (r2.rest.length) { const r4 = lauf(action, r2.data, kontext, zitat, { folge: true }); if (r4.rest.length < r2.rest.length) r2 = { ...r4, geaendert: r2.geaendert + r4.geaendert }; }
    if (r2.rest.length <= r.rest.length) { data = r2.data; info.korrigiert += r2.geaendert; r = r2; }
  }
  if (r.rest.length) { info.offen = r.rest.length; data = notbremse(action, data, r.rest); track('Notbremse', r.rest.map(f => f.art).join(',')); }
  else if (info.korrigiert) track('korrigiert', String(info.korrigiert));
  try { const trace = []; pruefe(data, { kontext, trace }); info.rechnungen = trace.length; } catch (e) {}
  info.ms = Math.round((typeof performance !== 'undefined' ? performance : Date).now() - t0);
  return { ...T.set(data), rechenpruefung: info };
}
