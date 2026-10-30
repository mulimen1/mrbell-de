// Rechen-Gate: Jede Antwort von Max läuft durch den Rechenprüfer (ohne KI), bevor sie angezeigt wird.
//  1. Prüfen + eindeutige Fehler sofort richtig einsetzen (exakt gerechnet, kein Raten).
//  2. Bleibt etwas falsch: Max bessert genau diese Stellen nach (bis zu 3 Runden, zusammen max. 45 s), Anzeige „Max rechnet nach …“.
//  3. Notbremse: Was dann immer noch nicht stimmt, wird nicht als Zahl gezeigt – an der Stelle steht WARNUNG
//     (auch bei Folgeschritten, die damit weiterrechnen); Quizfragen/Karten mit falscher Rechnung fallen raus.
// Gezählt wird nur anonym (Anzahl, Art) – kein Inhalt.
import { pruefe, korrigiere, pruefeQuiz, BLOCKIEREND, zahlWerte } from './rechenpruefer.js';
import { getOutLang } from './i18n.js';
import { faktenTreffer } from './faktenregeln.js';
import { belegeFuer, dbPruefung } from './faktendb.js';
// Faktenregister (Gesetze, Grenzwerte, Sätze, bekannte Fehlermuster): Treffer je Textfeld der Antwort
// Nicht ersetzte Platzhalter im Rechenweg („= gewinn €“, „= cashflow_direkt €“): kleingeschriebenes Wort statt Zahl vor €/%
const PLATZ = /=\s*(?:\\text\{\s*)?([a-z][a-z_]{2,})\s*\}?\s*(?:\\[,;! ]\s*)?(?:€|%|\\text\{\s*€|\\%|Euro)/g;
// Jahreszahlen nie mit Tausenderpunkt („Ende 2.034“ → „Ende 2034“)
export const jahrFix = s => String(s).replace(/\b(Ende|Anfang|Mitte|bis|ab|seit|Jahr|Jahres|aus|vor|nach|im|zum|Stand|Geschäftsjahr|Wirtschaftsjahr|Kalenderjahr)(\s+)([12])\.(\d{3})\b/g, (m, a, b, c, d) => (+(c + d) >= 1900 && +(c + d) <= 2100 ? a + b + c + d : m));
function fakt(data, thema = '') { const out = []; const walk = (o, p) => { if (typeof o === 'string') { PLATZ.lastIndex = 0; for (const m of o.matchAll(PLATZ)) out.push({ art: 'fakt-falsch', path: p, text: m[0], richtig: 'Im Rechenweg steht ein Platzhalter („' + m[1] + '“) statt einer Zahl – den Wert ausrechnen und einsetzen.', quelle: 'Rechen-Algorithmus', id: 'platzhalter' }); for (const h of faktenTreffer(o, thema)) out.push({ art: 'fakt-falsch', path: p, text: h.text, richtig: h.richtig, quelle: h.quelle, id: h.id }); } else if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k === '__rechenweg') continue; walk(o[k], p.concat(Array.isArray(o) ? +k : k)); } }; walk(data, []); return out; }
// Hinweise in der Sprache der Inhalte (Max’ Antwort), nicht der Oberfläche
let SPRACHE = null;
const L = (de, en) => ((SPRACHE || (typeof getOutLang === 'function' ? getOutLang() : 'de')) === 'en' && en != null ? en : de);

// Antworten mit Erklärungen/Rechnungen von Max. Nicht: Foto-Abschrift, Upload-Analyse, Transkription, Sprache, Konto …
export const GEPRUEFT = new Set(['chat', 'topic', 'quiz', 'exam', 'cards', 'summary', 'lesson', 'path', 'podcast', 'grade', 'mitschrift']);
const KI_RUNDEN = 3, KI_TIMEOUT = 25000, KI_BUDGET = 45000;   // höchstens 3 Nachbesserungen, zusammen höchstens 45 s

// Welche Felder der Antwort sind Max-Text?
// Versteckter Rechenweg: Max kann der Maschine zu jeder Zahl ohne sichtbare Rechnung den Rechenweg mitgeben
// (Chat: Block ```rechenweg … ```, JSON: Feld „rechenweg“). Er wird mitgeprüft (zuerst, damit Korrekturen auf die
// sichtbaren Folgestellen durchschlagen) und vor der Anzeige entfernt.
const RW = /```rechenweg[^\n]*\n([\s\S]*?)(?:```|$)/g;
// Rechenweg-Blöcke, die in einer Nachbesserung im Text stehen, in den versteckten Teil verschieben
function rwHolen(d) {
  let rw = String(d.__rechenweg || ''); const x = { ...d };
  for (const k of Object.keys(x)) if (k !== '__rechenweg' && typeof x[k] === 'string' && /```rechenweg/.test(x[k])) { rw += '\n' + [...x[k].matchAll(RW)].map(m => m[1].trim()).join('\n'); x[k] = x[k].replace(RW, '').replace(/\n{3,}/g, '\n\n').trim(); }
  if (typeof x.rechenweg === 'string' || Array.isArray(x.rechenweg)) { rw += '\n' + [].concat(x.rechenweg).join('\n'); delete x.rechenweg; }
  return { ...x, __rechenweg: rw.trim() };
}
function teil(action, j) {
  if (action === 'chat') return {
    get: () => { const t = String(j.text || ''); if (!/```rechenweg/.test(t)) return { __rechenweg: '', text: t }; const rw = [...t.matchAll(RW)].map(m => m[1].trim()).join('\n'); return { __rechenweg: rw, text: t.replace(RW, '').replace(/\n{3,}/g, '\n\n').trim() }; },
    set: d => ({ ...j, text: d.text })
  };
  return {
    get: () => { const d = { ...(j.data || {}) }; const rw = d.rechenweg; delete d.rechenweg; return { __rechenweg: Array.isArray(rw) ? rw.join('\n') : String(rw || ''), ...d }; },
    set: d => { const x = { ...d }; delete x.__rechenweg; return { ...j, data: x }; }
  };
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
  if (opts.rw) rest.push(...abdeckung(d, kontext, opts.belege));   // nur wenn der Server die Rechenweg-Regel meldet
  return { data: d, rest, geaendert: r.geaendert.length + quizFix, alle: r.alle };
}

// Abdeckung: Jede Ergebniszahl (mit €, %, Stück …) im sichtbaren Text muss belegt sein – als geprüftes Rechenergebnis
// (sichtbar oder im versteckten Rechenweg), als Wert aus dem Rechner des Servers (j.belege) oder als Angabe aus der Frage.
const ZAHL_EINHEIT = /(?<![\d.,}])([−-]?\d+(?:[.,]\d+)*)(\s*(?:€|%|Euro|Stück|Stk\.?|Prozent|Prozentpunkte|Tage|Jahre|Monate|Mio\.?|Mrd\.?|units?|pieces?|years?|days?|months?|percent|million|billion))|(?:€|\$|EUR\s?)\s?([−-]?\d+(?:[.,]\d+)*)/g;
const deZahl = x => zahlWerte(String(x).replace(/\{,\}/g, ',').replace(/\s/g, ''), SPRACHE);
function abdeckung(data, kontext, belege) {
  const werte = [];
  const add = x => { for (const v of (typeof x === 'number' ? [x] : deZahl(x))) if (isFinite(v)) werte.push(v); };
  (belege || []).forEach(add);
  const trace = []; pruefe(data, { kontext, trace, sprache: SPRACHE });
  for (const t of trace) { const s = get(data, t.path); if (typeof s === 'string') add(s.slice(t.start, t.end)); }
  const alle = []; (function walk(o, p) { if (typeof o === 'string') alle.push([p, o]); else if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p.concat(Array.isArray(o) ? +k : k)); })(data, []);
  // Operanden in Formeln und alle Zahlen der Frage/des Materials gelten als gegeben
  for (const [, s] of alle) for (const m of (s.match(/\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/g) || []).join(' ').replace(/\{,\}/g, ',').matchAll(/\d+(?:[.,]\d+)*/g)) add(m[0]);
  for (const m of String(kontext || '').matchAll(/\d+(?:[.,]\d+)*/g)) add(m[0]);
  const out = [];
  for (const [p, s] of alle) {
    if (p[0] === '__rechenweg') continue;
    const sicht = s.replace(/\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/g, x => ' '.repeat(x.length)).replace(/<[^>]*>/g, x => ' '.repeat(x.length));
    for (const m of sicht.matchAll(ZAHL_EINHEIT)) {
      const tok = m[1] || m[3]; const vs = deZahl(tok); if (!vs.length) continue;
      const lst = tok.match(/[.,](\d+)$/), dez = lst && !(lst[1].length === 3 && vs.length > 1) ? lst[1].length : 0, ulp = 0.5 * 10 ** -dez + 1e-9;
      const vor = sicht.slice(Math.max(0, m.index - 25), m.index);
      const ca = /(rund|etwa|ca\.|circa|knapp|gut|fast|über|unter|ungefähr|about|around|roughly|approximately|almost|nearly|over|under|≈|~)\s*$/i.test(vor);
      const ok = vs.some(v => werte.some(b => Math.abs(b - v) <= ulp + Math.abs(v) * (ca ? 0.05 : 0) || Math.abs(b * 100 - v) <= ulp + Math.abs(v) * (ca ? 0.05 : 0) || Math.abs(b / 1e6 - v) <= ulp + Math.abs(v) * (ca ? 0.05 : 0) || Math.abs(b / 1e9 - v) <= ulp + Math.abs(v) * (ca ? 0.05 : 0)));
      if (!ok) out.push({ art: 'zahl-ohne-rechenweg', path: p, text: s.slice(Math.max(0, m.index - 40), m.index + m[0].length + 10).replace(/\s+/g, ' ').trim(), bspan: { start: m.index, end: m.index + m[0].length, alt: m[0] } });
    }
  }
  return out;
}

// Max bessert nur die betroffenen Felder nach (Antwort als JSON {id: neuer Text})
async function kiNachbesserung(raw, data, rest, signal, timeout = KI_TIMEOUT) {
  const felder = new Map();
  for (const f of rest) {
    if (!f.path || !f.path.length) continue;
    // Quizfrage: ganze Frage als JSON nachbessern lassen; sonst das Textfeld
    const q = f.art === 'quiz-falsche-option' ? f.path.slice(0, 2) : f.path.slice();
    const k = JSON.stringify(q);
    if (![...felder.values()].some(x => x.k === k)) { const v = get(data, q); felder.set('f' + felder.size, { k, path: q, json: typeof v !== 'string', text: typeof v === 'string' ? v : JSON.stringify(v), fehler: [] }); }
    const e = [...felder.values()].find(x => x.k === k);
    const soll = f.fixUnsicher ? ` – richtig wäre ${f.fixUnsicher.neu}` : '';
    if (f.art === 'fakt-falsch') { e.fehler.push(`Fachlich falsch oder veraltet: „${String(f.text).slice(0, 200)}“ – richtig ist: ${f.richtig} (Quelle: ${f.quelle}). Formuliere genau diese Stelle korrekt, alles andere bleibt.`); continue; }
    if (f.art === 'zahl-ohne-rechenweg') { e.fehler.push(`Zahl ohne Rechenweg: „${f.text}“ – zeig die Rechnung dazu (sichtbar oder im versteckten Block \`\`\`rechenweg … \`\`\`) oder korrigiere die Zahl`); continue; }
    e.fehler.push(`${f.art === 'buchung-soll-ungleich-haben' ? 'Buchungssatz: Soll ≠ Haben' : f.art === 'summenzeile-falsch' ? 'Summenzeile stimmt nicht' : f.art === 'quiz-falsche-option' ? 'Lösung passt nicht zum Rechenweg' : 'Rechnung falsch'}: „${String(f.text).slice(0, 200)}“${soll}${f.weiterverwendet ? ' (das falsche Ergebnis wird danach weiterverwendet – alle Folgeschritte neu rechnen)' : ''}`);
  }
  if (!felder.size) return null;
  const teile = [...felder.entries()].map(([id, x]) => `### ${id}${x.json ? ' (JSON-Objekt – gib es als JSON-Objekt zurück, gleiche Felder)' : ''}\nFEHLER:\n- ${x.fehler.join('\n- ')}\nTEXT:\n${x.text}`).join('\n\n');
  const prompt = `RECHENKORREKTUR (interne Prüfung, keine Erklärung an den Nutzer). Eine Prüfung hat in deinem Text Fehler gefunden (Rechnungen oder fachlich falsche/veraltete Aussagen). Korrigiere NUR die genannten Stellen: rechne jede genannte Rechnung neu und passe alle Folgeschritte und Ergebnisse an, die davon abhängen; formuliere genannte Fachaussagen so, wie die angegebene richtige Aussage es verlangt. Format, Formeln (\\( … \\)), HTML, Sprache und Wortlaut sonst unverändert lassen; auf Englisch Zahlen im englischen Format (1,234.56); Jahreszahlen immer ohne Tausenderpunkt (2034). Antworte AUSSCHLIESSLICH mit JSON: {"f0": "vollständiger korrigierter Text", …} für jede ID.\n\n${teile}`;
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), timeout);
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  try {
    const r = await raw('chat', { messages: [{ role: 'user', content: prompt }], opts: { voice: false, assistant: true, entry: true, rechenkorrektur: true } }, { signal: ctrl.signal });
    const t = String(r.text || ''); const m = /\{[\s\S]*\}/.exec(t); if (!m) return null;
    const obj = JSON.parse(m[0]); let d = data;
    for (const [id, x] of felder) {
      if (x.json) { if (obj[id] && typeof obj[id] === 'object') d = set(d, x.path, { ...get(d, x.path), ...obj[id] }); }
      else if (typeof obj[id] === 'string' && obj[id].trim()) d = set(d, x.path, jahrFix(obj[id]));
    }
    return d;
  } catch (e) { return null; } finally { clearTimeout(to); }
}

// Notbremse: Was nach allen Versuchen nicht stimmt, wird nie als Zahl gezeigt. Statt des Ergebnisses steht direkt an der Stelle
// der Hinweis WARNUNG (im Chat-Text als Klartext – richText macht daraus das Abzeichen; in HTML/Tafeln als <span class="rechen-warn">).
export const WARNUNG = () => L('⚠ Unser Rechen-Algorithmus konnte das nicht bestätigen – bitte nachrechnen.', '⚠ Our calculation algorithm couldn’t verify this – please double-check.');
const ESC = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Steht pos in HTML (Tafel im Chat, HTML-Feld)? Dann Abzeichen als <span>, sonst Klartext.
function inHtml(s, pos) {
  const vor = s.slice(0, pos), t0 = vor.lastIndexOf('```tafel'), t1 = vor.lastIndexOf('```', vor.length - 1);
  if (t0 >= 0 && t0 === t1) return true;                       // innerhalb einer Tafel im Chat
  if (/```tafel/.test(s)) return false;                         // Chat-Text außerhalb der Tafel
  return /<\/?(?:div|p|span|li|td|th|table|h[2-4]|b|strong|em|br)\b/i.test(s);
}
// An der Stelle selbst nur ein kleines ⚠; der Satz kommt genau EINMAL je Antwort bzw. je Tafel (bannerSetzen)
const abzeichen = (s, pos) => inHtml(s, pos) ? `<span class="rechen-warn-mini" title="${WARNUNG().slice(2)}">⚠</span>` : ' ⚠';
function bannerSetzen(s) {
  if (!/⚠/.test(s) || s.includes(WARNUNG())) return s;
  const div = `<div class="rechen-warn">${WARNUNG().replace(/^⚠\s*/, '')}</div>`;
  if (/```tafel/.test(s)) {   // Chat: in jede Tafel mit ⚠ ein Banner (vor das schließende ```), im Text außerhalb eins am Ende
    let aussenHat = false;
    const t = s.replace(/(```tafel[^\n]*\n)([\s\S]*?)(```|$)/g, (m, a, body, c) => /rechen-warn-mini/.test(body) ? a + body.replace(/\s*$/, '\n') + div + '\n' + c : m);
    aussenHat = /⚠/.test(t.replace(/```tafel[\s\S]*?(```|$)/g, ''));
    return aussenHat ? t.replace(/\s*$/, '') + '\n\n' + WARNUNG() : t;
  }
  return inHtml(s, s.length) ? s + div : s.replace(/\s*$/, '') + '\n\n' + WARNUNG();
}
// Formel ab „cut“ (Beginn des Ergebnisses) abschneiden, Formel schließen, Hinweis dahinter; direkt folgende Einheit fällt weg
function formelKappen(s, cut) {
  const vor = s.slice(0, cut);
  const o = Math.max(vor.lastIndexOf('\\('), vor.lastIndexOf('\\['), vor.lastIndexOf('$$'));
  if (o < 0) return null;
  const typ = s.startsWith('\\(', o) ? '\\)' : s.startsWith('\\[', o) ? '\\]' : '$$';
  const c = s.indexOf(typ, cut); if (c < 0) return null;
  let nach = s.slice(c + typ.length); const einheit = /^\s*(?:€|%|Euro|Stück|Std\.?|Tage|Jahre|Prozent|Mio\.?\s*€?|Mrd\.?\s*€?)(?![\wäöü])/.exec(nach); if (einheit) nach = nach.slice(einheit[0].length);
  nach = nach.replace(/^\s*\((?:auf|ab)?gerundet\)|^\s*\([^()]{0,30}\)(?=\s*(?:<|$))/, '');   // „(aufgerundet)“ gehört zum entfernten Ergebnis
  return s.slice(0, cut).replace(/\s+$/, ' ') + typ + abzeichen(s, cut) + nach;
}
function notbremse(action, data, rest) {
  let d = data; const weg = new Set(), falsch = new Set(), sichtbar = new Set();
  for (const f of rest) {
    if (!f.path) continue;
    // Quizfragen, Karten mit falscher Rechnung: ganz weglassen
    if ((action === 'quiz' || action === 'exam') && f.path[0] === 'questions') { weg.add('q' + f.path[1]); continue; }
    if (action === 'cards' && f.path[0] === 'cards') { weg.add('c' + f.path[1]); continue; }
  }
  const byPath = new Map();
  for (const f of rest) { if (!f.path || typeof get(d, f.path) !== 'string') continue; const k = JSON.stringify(f.path); if (!byPath.has(k)) byPath.set(k, []); byPath.get(k).push(f); }
  for (const [k, fs] of byPath) {
    const path = JSON.parse(k); let s = get(d, path);
    // von hinten nach vorn, damit Positionen gültig bleiben
    const stelle = f => { const sp = f.fixUnsicher || f.fix || f.bspan; return sp ? sp.start : f.bvon != null ? f.bvon : f.pos != null ? f.pos : -1; };
    fs.sort((a, b) => stelle(b) - stelle(a));
    let last = Infinity;
    for (const f of fs) {
      const sp = f.fixUnsicher || f.fix || f.bspan;
      const cut = sp && s.slice(sp.start, sp.end) === sp.alt ? sp.start : f.bvon != null ? f.bvon + (s.slice(f.bvon).match(/^\s*/)[0].length) : null;
      if (path[0] === '__rechenweg') { if (sp && sp.alt) { const v = sp.alt.replace(/^[−-]\s*/, ''); falsch.add(v); sichtbar.add(v); } continue; }
      if (f.art === 'zahl-ohne-rechenweg' && sp) { s = s.slice(0, sp.end) + abzeichen(s, sp.end) + s.slice(sp.end); continue; }
      if (cut != null && cut < last && (f.ort === 'formel' || f.ort === 'text')) {
        if (sp && sp.alt) falsch.add(sp.alt.replace(/^[−-]\s*/, ''));
        if (f.ort === 'formel') { const n = formelKappen(s, cut); if (n != null) { s = n; last = cut; continue; } }
        // Fließtext: Ergebnis (bis Satzende/Einheit) durch Hinweis ersetzen
        const m = /^[−-]?\s*[\d.,{}]+\s*(?:€|%|Euro|Stück|Prozent(?:punkte)?|Std\.?|Tage|Jahre)?/.exec(s.slice(cut));
        s = s.slice(0, cut).replace(/\s+$/, '') + abzeichen(s, cut) + s.slice(cut + (m ? m[0].length : 0)); last = cut; continue;
      }
      if (f.pos != null && f.pos <= last) {   // Buchung, Summenzeile: Hinweis direkt hinter das Element
        const html = inHtml(s, f.pos);
        s = s.slice(0, f.pos) + (html ? `<span class="rechen-warn-mini" title="${WARNUNG().slice(2)}">⚠</span>` : ' ⚠') + s.slice(f.pos); last = f.pos; continue;
      }
      if (!/⚠/.test(s)) s = s + ' ⚠';
    }
    d = set(d, path, s);
  }
  // Folgeschritte: Formeln, die mit einem nicht bestätigten Wert weiterrechnen, bekommen ebenfalls kein Ergebnis
  if (falsch.size) {
    const pfade = []; (function walk(o, p) { if (typeof o === 'string') pfade.push(p); else if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p.concat(Array.isArray(o) ? +k : k)); })(d, []);
    for (const p of pfade) {
      let s = get(d, p);
      for (let runde = 0; runde < 20; runde++) {
        let treffer = null;
        for (const m of s.matchAll(/\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g)) {
          const tex = m[1] ?? m[2], t0 = m.index + 2;
          for (const v of falsch) {
            const vs = [v, v.replace(/\{,\}/g, ','), v.replace(/(\d),(\d)/g, '$1{,}$2')];
            const hit = vs.map(x => new RegExp('(?<![\\d.,}])' + ESC(x) + '(?![\\d]|[.,{]\\d)').exec(tex)).find(Boolean);
            if (!hit) continue;
            const eq = tex.indexOf('=', hit.index + hit[0].length); if (eq < 0 || !tex.slice(eq + 1).trim()) continue;   // schon gekappt
            treffer = t0 + eq + 1; break;
          }
          if (treffer != null) break;
        }
        if (treffer == null) break;
        const n = formelKappen(s, treffer); if (n == null || n === s) break; s = n;
      }
      // Werte, deren (versteckter) Rechenweg nicht stimmt: auch im Fließtext nicht als Zahl zeigen
      if (p[0] !== '__rechenweg') for (const v of sichtbar) for (const x of new Set([v, v.replace(/\{,\}/g, ','), v.replace(/(\d),(\d)/g, '$1{,}$2')])) {
        s = s.replace(new RegExp('(?<![\\d.,}])' + ESC(x) + '(?![\\d]|[.,{]\\d)(\\s*(?:€|%|Euro|Stück|Prozent))?\\.?', 'g'), (m0, u, off) => abzeichen(s, off).trim());
      }
      d = set(d, p, s);
    }
  }
  // genau ein Hinweis-Satz je Feld/Tafel
  { const pfade = []; (function walk(o, p) { if (typeof o === 'string') pfade.push(p); else if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p.concat(Array.isArray(o) ? +k : k)); })(d, []);
    for (const p of pfade) if (p[0] !== '__rechenweg') { const s0 = get(d, p); const s1 = bannerSetzen(s0); if (s1 !== s0) d = set(d, p, s1); } }
  if (weg.size) {
    if (Array.isArray(d.questions)) { const qs = d.questions.filter((_, i) => !weg.has('q' + i)); if (qs.length >= 2) d = { ...d, questions: qs }; }
    if (Array.isArray(d.cards)) { const cs = d.cards.filter((_, i) => !weg.has('c' + i)); if (cs.length >= 1) d = { ...d, cards: cs }; }
  }
  return d;
}

// „Max rechnet nach …“ – kleine Anzeige, solange die Nachbesserung läuft
function rechnetNach(an) {
  try {
    if (typeof document === 'undefined' || !document.body || !document.body.querySelector) return;
    let el = document.querySelector('.rechen-pill');
    if (!an) { if (el) el.remove(); return; }
    if (el) return;
    el = document.createElement('div'); el.className = 'rechen-pill'; el.setAttribute('role', 'status');
    el.textContent = L('Max rechnet nach …', 'Max is double-checking …');
    document.body.appendChild(el);
  } catch (e) {}
}

function get(o, p) { for (const k of p) { if (o == null) return undefined; o = o[k]; } return o; }
function set(o, p, v) { if (!p.length) return v; const c = Array.isArray(o) ? o.slice() : { ...(o || {}) }; c[p[0]] = set(o ? o[p[0]] : undefined, p.slice(1), v); return c; }
function track(art, detail) { try { if (window.BM) window.BM.track('Rechenprüfung', art + (detail ? ' · ' + detail : '')); } catch (e) {} }

// Hauptfunktion: raw = Server-Aufruf ohne Gate (für die Nachbesserung)
export async function rechenGate(action, payload, j, raw, { signal } = {}) {
  if (!GEPRUEFT.has(action) || !j || !j.ok || (payload.opts && payload.opts.rechenkorrektur)) return j;
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
  // Sprache der Antwort: ausdrücklich angefordert, sonst am Text erkannt, sonst Einstellung
  const txt = JSON.stringify(j.text != null ? j.text : j.data || '').replace(/<[^>]+>|\\\(.*?\\\)/g, ' ');
  const nEn = (txt.match(/\b(?:the|and|of|is|are|with|you|for|this|that|your|which)\b/gi) || []).length, nDe = (txt.match(/\b(?:der|die|das|und|ist|mit|für|du|ein|eine|nicht|wird|dein)\b/g) || []).length;
  try { SPRACHE = payload.lang === 'en' || payload.lang === 'de' ? payload.lang : nEn > nDe * 2 && nEn >= 3 ? 'en' : nDe > nEn * 2 && nDe >= 3 ? 'de' : getOutLang() === 'en' ? 'en' : 'de'; } catch (e) { SPRACHE = 'de'; }
  const T = teil(action, j); const { zitat, kontext } = nutzerText(action, payload);
  const ext = { rw: !!j.rw, belege: Array.isArray(j.belege) ? j.belege : [], sprache: SPRACHE };   // vom Server: Rechenweg-Regel aktiv, Werte aus dem Rechner
  let data, r;
  try { data = T.get(); r = lauf(action, data, kontext, zitat, ext); }
  catch (e) { track('Fehler', String(e && e.message || e).slice(0, 60)); return { ...j, rechenpruefung: { status: 'fehler' } }; }
  const info = { rechnungen: 0, korrigiert: r.geaendert, ki: 0, offen: 0, ms: 0 };
  data = r.data;
  if (r.rest.length) {   // weiterverwendete falsche Ergebnisse: an den Folgestellen mitkorrigieren (danach wird alles neu geprüft)
    const r3 = lauf(action, data, kontext, zitat, { ...ext, folge: true });
    if (r3.rest.length < r.rest.length) { data = r3.data; info.korrigiert += r3.geaendert; r = r3; }
  }
  const tKi = Date.now();
  if (r.rest.length) rechnetNach(true);
  try {
  for (let k = 0; k < KI_RUNDEN && r.rest.length; k++) {   // Rest: Max bessert genau diese Stellen nach
    const bleibt = KI_BUDGET - (Date.now() - tKi); if (bleibt < 4000) break;
    info.ki++;
    let d2 = await kiNachbesserung(raw, data, r.rest, signal, Math.min(KI_TIMEOUT, bleibt));
    if (!d2) continue;
    d2 = rwHolen(d2);
    let r2 = lauf(action, d2, kontext, zitat, ext);
    if (r2.rest.length) { const r4 = lauf(action, r2.data, kontext, zitat, { ...ext, folge: true }); if (r4.rest.length < r2.rest.length) r2 = { ...r4, geaendert: r2.geaendert + r4.geaendert }; }
    if (r2.rest.length <= r.rest.length) { data = r2.data; info.korrigiert += r2.geaendert; r = r2; }
  }
  } finally { rechnetNach(false); }
  // Faktencheck (Register): falsche/veraltete Fachaussagen von Max nachbessern lassen; was bleibt, wird sichtbar gewarnt
  let fk = []; try { fk = fakt(data, zitat); } catch (e) {}
  if (fk.length && KI_BUDGET - (Date.now() - tKi) > 6000) {
    rechnetNach(true);
    try {
      let d2 = await kiNachbesserung(raw, data, fk, signal, Math.min(KI_TIMEOUT, KI_BUDGET - (Date.now() - tKi)));
      if (d2) { d2 = rwHolen(d2); const r5 = lauf(action, d2, kontext, zitat, ext); if (r5.rest.length <= r.rest.length && fakt(r5.data, zitat).length < fk.length) { data = r5.data; info.korrigiert += r5.geaendert; r = r5; } }
    } catch (e) {} finally { rechnetNach(false); }
  }
  try { const fr = fakt(data, zitat); info.fakten = fr.map(({ id, richtig, quelle }) => ({ id, richtig, quelle })); info.faktenKorrigiert = Math.max(0, fk.length - fr.length); if (fk.length) track('Faktencheck', fk.map(f => f.id).join(',') + (fr.length ? ' · offen ' + fr.length : ' · korrigiert')); } catch (e) {}
  if (r.rest.length) { info.offen = r.rest.length; data = notbremse(action, data, r.rest); track('Notbremse', r.rest.map(f => f.art).join(',')); }
  else if (info.korrigiert) track('korrigiert', String(info.korrigiert));
  try { const trace = []; pruefe(data, { kontext, trace, sprache: SPRACHE }); info.rechnungen = trace.length; } catch (e) {}
  // Faktendatenbank: passende geprüfte Aussagen + Quellen (lokal, vor der Anzeige); der KI-Abgleich läuft danach weiter (info.dbcheck)
  try {
    const plain = String(JSON.stringify(data)).replace(/\\n/g, ' ').replace(/<[^>]+>/g, ' ');
    if (plain.length > 160 && !(payload.opts && payload.opts.voice && action === 'chat' && plain.length < 400)) {
      const bl = await Promise.race([belegeFuer(plain), new Promise(res => setTimeout(() => res([]), 1500))]);
      if (bl.length) {
        info.belege = bl.map(({ id, thema, aussage, quelle }) => ({ id, thema, aussage, quelle }));
        const p = dbPruefung(plain, bl, raw).then(res => { info.db = res; if (res.widersprueche.length) track('DB-Widerspruch', res.widersprueche.map(w => w.id).join(',')); return res; });
        Object.defineProperty(info, 'dbcheck', { value: p, enumerable: false });
      }
    }
  } catch (e) {}
  info.ms = Math.round((typeof performance !== 'undefined' ? performance : Date).now() - t0);
  return { ...T.set(data), rechenpruefung: info };
}
