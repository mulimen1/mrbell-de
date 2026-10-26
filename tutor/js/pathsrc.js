// Lernpfad aus mehreren Quellen: Hauptskript + weitere Dateien, Skripte aus der Bibliothek und Themen – jeweils mit Gewichtung.
// Max baut daraus EINEN Pfad; beim Nachträglich-Hinzufügen wird neu eingearbeitet, Fortschritt bleibt (über die Kapiteltitel).
import { h, ico, toast, uid } from './util.js';
import { L } from './i18n.js';
import { S } from './state.js';
import { langName } from './srclang.js';

const W = () => [[1, L('Niedrig', 'Low')], [2, L('Normal', 'Normal')], [3, L('Hoch', 'High')]];
const WN = w => ({ 1: L('niedrig', 'low'), 2: L('normal', 'normal'), 3: L('hoch', 'high') })[w] || L('normal', 'normal');
const MAX_SRC_CHARS = 80000;

// Seiten aller Quellen hintereinander – Kapitel verweisen auf diese durchgehende Nummerierung
export function pathPages(doc) {
  const out = (doc.pages || []).slice();
  for (const s of doc.pathSrc || []) out.push(...(s.kind === 'topic' ? [L(`Thema: ${s.name}\n(Kein Material – aus Fachwissen erklären, auf BWL-Klausurniveau.)`, `Topic: ${s.name}\n(No material – explain from expert knowledge, at exam level.)`)] : (s.pages || [])));
  return out;
}
export const hasSrc = doc => !!(doc.pathSrc && doc.pathSrc.length);
// Für Lektion/Bewertung: virtuelles Skript mit allen Seiten
export const pathDoc = doc => hasSrc(doc) ? Object.assign({}, doc, { pages: pathPages(doc) }) : doc;

// Woher stammt Seite n (1-basiert)? → Name + Seite innerhalb der Quelle
export function pageLabel(doc, a, b) {
  const base = (doc.pages || []).length;
  if (!hasSrc(doc) || a <= base) return L(`S. ${a}–${b || a}`, `p. ${a}–${b || a}`);
  let off = base;
  for (const s of doc.pathSrc) {
    const n = s.kind === 'topic' ? 1 : (s.pages || []).length;
    if (a <= off + n) return s.kind === 'topic' ? L('Thema', 'Topic') + ' · ' + s.name : `${s.name} · ` + L(`S. ${a - off}–${Math.min(b || a, off + n) - off}`, `p. ${a - off}–${Math.min(b || a, off + n) - off}`);
    off += n;
  }
  return L(`S. ${a}–${b || a}`, `p. ${a}–${b || a}`);
}

// Material für die Pfad-Erstellung: jede Quelle mit Überschrift + Gewichtung; Platz nach Gewichtung verteilt
export function pathMaterial(doc, limit = 60000) {
  const depth = { kompakt: L('kompakt – wenige, große Kapitel (ca. 3–5)', 'compact – few, large chapters (about 3–5)'), gruendlich: L('gründlich – feiner aufgeteilt, mehr Kapitel (ca. 8–12)', 'thorough – finer split, more chapters (about 8–12)') }[doc.pathDepth] || '';
  const lang = doc.outLang && doc.outLang !== 'de' ? L(`Schreib alle Titel, Ziele und Begriffe auf ${langName(doc.outLang)}.`, `Write all titles, goals and terms in ${langName(doc.outLang)}.`) : '';
  const srcs = [{ name: doc.name, kind: 'main', w: doc.pathW || 2, pages: doc.pages || [] }, ...(doc.pathSrc || []).map(s => ({ name: s.name, kind: s.kind, w: s.weight || 2, pages: s.kind === 'topic' ? null : (s.pages || []) }))];
  if (srcs.length === 1 && !depth && !lang) return null;   // klassisch: Standard-Material
  const head = [];
  if (srcs.length > 1) head.push(L('[Mehrere Quellen. Bau daraus EINEN gemeinsamen Lernpfad in sinnvoller Lernreihenfolge: Überschneidungen zusammenführen, nichts doppelt. Jede Quelle hat eine Gewichtung (hoch/normal/niedrig) – sie bestimmt, wie viel Raum und welche Klausurrelevanz (weight) ihre Inhalte bekommen. Themen ohne Material bekommen ein eigenes Kapitel aus Fachwissen. Seitenangaben beziehen sich auf die durchgehenden [S. n]-Nummern.]', '[Several sources. Build ONE combined study path in a sensible learning order: merge overlaps, nothing twice. Each source has a weight (high/normal/low) – it decides how much room and exam relevance (weight) its content gets. Topics without material get their own chapter from expert knowledge. Page numbers refer to the continuous [p. n] tags.]'));
  if (depth) head.push(L(`[Tiefe: ${depth}.]`, `[Depth: ${depth}.]`));
  if (lang) head.push(`[${lang}]`);
  const tot = srcs.reduce((a, s) => a + (s.pages ? s.w : 0), 0) || 1;
  let n = 0, out = head.join('\n') + '\n\n';
  for (const s of srcs) {
    out += `=== ${L('Quelle', 'Source')}: ${s.name} · ${L('Gewichtung', 'Weight')}: ${WN(s.w)} ===\n`;
    if (!s.pages) { n += 1; out += `[S. ${n}]\n${L('Thema ohne Material', 'Topic without material')}: ${s.name}\n\n`; continue; }
    const budget = Math.floor((limit - head.join('').length) * s.w / tot), per = Math.max(160, Math.floor(budget / Math.max(1, s.pages.length)));
    const all = s.pages.map((p, i) => `[S. ${n + i + 1}]\n${p}`).join('\n');
    out += (all.length <= budget ? all : s.pages.map((p, i) => `[S. ${n + i + 1}] ${String(p).replace(/\s+/g, ' ').slice(0, per)}`).join('\n')) + '\n\n';
    n += s.pages.length;
  }
  return out.slice(0, limit + 4000);
}

// Neu erstellter Pfad: Fortschritt von gleichnamigen Kapiteln übernehmen (beim Neu-Einarbeiten)
export function carryProgress(oldPath, oldLessons, chapters) {
  if (!oldPath || !oldPath.chapters) return {};
  const key = t => String(t || '').toLowerCase().replace(/[^a-z0-9äöüß]+/g, '');
  const lessons = {};
  chapters.forEach((c, i) => {
    const j = oldPath.chapters.findIndex(o => key(o.title) === key(c.title));
    if (j < 0) return;
    const o = oldPath.chapters[j]; c.done = o.done; c.score = o.score; c.started = o.started;
    if (oldLessons && oldLessons[j]) lessons[i] = oldLessons[j];
  });
  return lessons;
}

// Datei → Text (PDF, PowerPoint, Word, Text). Fotos/Videos bitte als eigene Unterlage hochladen.
async function readSrc(file) {
  const I = await import('./ingest.js');
  if (I.isImage(file) || /^(video|audio)\//.test(file.type || '')) throw new Error(L('Fotos und Videos lad bitte erst als eigene Unterlage hoch – dann hier „Aus Bibliothek“ wählen.', 'Please upload photos and videos as their own material first – then pick them here via “From library”.'));
  const r = await I.readFile(file, () => {}, { soft: true });
  let pages = r.pages || [], tot = 0; pages = pages.filter(p => (tot += p.length) <= MAX_SRC_CHARS);
  if (!pages.join('').trim()) throw new Error(L('In der Datei steht kein lesbarer Text.', 'There’s no readable text in this file.'));
  return { id: uid(), kind: 'file', name: r.name || file.name, weight: 2, pages };
}

// Editor: Liste der Quellen mit Gewichtung, + Datei / + Aus Bibliothek / + Thema. state = { mainName, mainW, src: [] }
export function srcEditor(state, { exclude = null, onChange } = {}) {
  const el = h('div', { class: 'ps' });
  const fin = h('input', { type: 'file', class: 'sr', multiple: true, accept: '.pdf,.pptx,.docx,.txt,.md,application/pdf' });
  const changed = () => { draw(); onChange && onChange(state); };
  fin.addEventListener('change', async () => {
    const fs = [...(fin.files || [])]; fin.value = '';
    for (const f of fs) {
      const tmp = { id: uid(), kind: 'file', name: f.name, weight: 2, pages: [], loading: true };
      state.src.push(tmp); draw();
      try { const s = await readSrc(f); Object.assign(tmp, s, { id: tmp.id, weight: tmp.weight, loading: false }); }
      catch (e) { state.src = state.src.filter(x => x !== tmp); toast(e.message || L('Konnte die Datei nicht lesen.', 'Couldn’t read the file.'), 3800); }
      changed();
    }
  });
  const wseg = (cur, set) => h('div', { class: 'ik-seg ps-w', role: 'radiogroup', 'aria-label': L('Gewichtung', 'Weight') }, W().map(([v, t]) => h('button', { type: 'button', class: v === cur ? 'on' : '', 'aria-checked': String(v === cur), role: 'radio', onclick: () => { set(v); changed(); } }, t)));
  const fromLib = e => {
    const anchor = e.currentTarget;
    const used = new Set(state.src.map(s => s.docId).concat(exclude ? [exclude] : []));
    const docs = S.list.filter(d => !used.has(d.id) && (d.pages || []).join('').trim()).sort((a, b) => Math.max(b.used || 0, b.created || 0) - Math.max(a.used || 0, a.created || 0));
    import('./views/lernen.js').then(m => m.popMenu(anchor, {
      search: docs.length > 6, rows: docs.map(d => ({ ic: d.generated ? 'bulb' : 'file', t: d.name, sub: (d.pages || []).length ? L(`${d.pages.length} Seiten`, `${d.pages.length} pages`) : '', fn: () => { let tot = 0; state.src.push({ id: uid(), kind: 'doc', docId: d.id, name: d.name, weight: 2, pages: (d.pages || []).filter(p => (tot += p.length) <= MAX_SRC_CHARS) }); changed(); } })),
      empty: L('Keine weiteren Unterlagen in deiner Bibliothek.', 'No other material in your library.') }));
  };
  const topicIn = h('input', { class: 'field ps-tin', maxlength: 100, placeholder: L('Thema, z. B. Kapitalwertmethode', 'Topic, e.g. net present value'), onkeydown: e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } } });
  const addTopic = () => { const t = topicIn.value.trim(); if (t.length < 3) { topicIn.focus(); return; } state.src.push({ id: uid(), kind: 'topic', name: t.slice(0, 100), weight: 2 }); topicIn.value = ''; changed(); };
  const rowEl = (ic, name, sub, w, setW, onX) => h('div', { class: 'ps-row' },
    h('span', { class: 'ps-ic', html: ico(ic) }),
    h('span', { class: 'ps-t' }, h('b', {}, name), sub ? h('small', {}, sub) : null),
    wseg(w, setW),
    onX ? h('button', { class: 'iconbtn ps-x', type: 'button', 'aria-label': L('Entfernen', 'Remove'), title: L('Entfernen', 'Remove'), html: ico('x'), onclick: onX }) : h('span', { class: 'ps-x' }));
  function draw() {
    el.replaceChildren(
      h('div', { class: 'ps-list' },
        rowEl('file', state.mainName, L('Hauptunterlage', 'Main material'), state.mainW || 2, v => { state.mainW = v; }, null),
        state.src.map(s => rowEl(s.kind === 'topic' ? 'bulb' : s.kind === 'doc' ? 'library' : 'file', s.name, s.loading ? L('wird gelesen …', 'reading …') : s.kind === 'topic' ? L('Thema – Max erklärt es aus Fachwissen', 'Topic – Max explains it from expert knowledge') : ((s.pages || []).length === 1 ? L('1 Seite', '1 page') : L(`${(s.pages || []).length} Seiten`, `${(s.pages || []).length} pages`)), s.weight || 2, v => { s.weight = v; }, () => { state.src = state.src.filter(x => x !== s); changed(); }))),
      h('div', { class: 'ps-add' },
        h('label', { class: 'btn sm' }, fin, h('span', { html: ico('upload') }), L('Datei', 'File')),
        S.list.some(d => d.id !== exclude) ? h('button', { class: 'btn sm', type: 'button', onclick: fromLib }, h('span', { html: ico('library') }), L('Aus Bibliothek', 'From library')) : null,
        h('span', { class: 'ps-tw' }, topicIn, h('button', { class: 'btn sm', type: 'button', onclick: addTopic }, h('span', { html: ico('plus') }), L('Thema', 'Topic')))));
  }
  draw();
  return el;
}
export const busySrc = state => state.src.some(s => s.loading);
