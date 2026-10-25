// Herunterladen: alles, was Max baut – als PDF (Druckfenster → „Als PDF sichern“), für Anki, als MP3 oder Text.
// Ein Knopf überall gleich: dlBtn(). Mehrere Formate → kleine Auswahl, ein Format → sofort.
import { h, ico, ls, toast, fmt } from './util.js';
import { L, LOCALE } from './i18n.js';
import { sanitize, richText, cardBack, cardLegend } from './sanitize.js';
import { mathReady, fixStray, bareTex } from './math.js';
import { ask } from './api.js';
import { save } from './state.js';

const safe = s => String(s || 'BWL Max').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'BWL Max';
export function saveBlob(blob, name) {
  const a = h('a', { href: URL.createObjectURL(blob), download: name, style: { display: 'none' } });
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 8000);
}

// ---------- Knopf ----------
// opts: [{ label, ic, fn }] oder Funktion, die das liefert (wird erst beim Tippen gebaut)
export function dlBtn(opts, { cls = 'btn sm ghost', text = true, title = L('Herunterladen', 'Download') } = {}) {
  const b = h('button', { class: cls + ' dl-btn', type: 'button', title, 'aria-label': title }, h('span', { html: ico('download') }), text ? h('span', {}, L('Herunterladen', 'Download')) : null);
  b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); pick(typeof opts === 'function' ? opts() : opts); });
  return b;
}
export function pick(list) {
  list = (list || []).filter(Boolean);
  if (!list.length) return toast(L('Hier gibt’s noch nichts zum Herunterladen.', 'Nothing to download here yet.'));
  if (list.length === 1) return list[0].fn();
  const close = () => bg.remove();
  const bg = h('div', { class: 'modal-bg', onclick: e => { if (e.target === bg) close(); } },
    h('div', { class: 'modal dl-modal', role: 'dialog', 'aria-modal': 'true' },
      h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: close }),
      h('div', { class: 'eyebrow' }, L('Herunterladen', 'Download')), h('h3', {}, L('In welchem Format?', 'Which format?')),
      h('div', { class: 'dl-list' }, list.map(o => h('button', { class: 'dl-opt', type: 'button', onclick: () => { close(); o.fn(); } },
        h('span', { class: 'dl-oi', html: ico(o.ic || 'download') }), h('span', { class: 'dl-ot' }, h('b', {}, o.label), o.sub ? h('small', {}, o.sub) : null))))));
  document.body.appendChild(bg);
  const onKey = e => { if (e.key === 'Escape') { close(); removeEventListener('keydown', onKey); } };
  addEventListener('keydown', onKey);
}
const PDF = (fn, sub) => ({ label: 'PDF', sub: sub || L('Zum Ausdrucken oder Speichern', 'To print or keep'), ic: 'file', fn });

// ---------- PDF über das Druckfenster ----------
let cleanup = null;
export async function printPdf({ title, kind = '', sub = '', body }) {
  if (cleanup) cleanup();
  const root = h('div', { id: 'printroot', class: 'printroot' },
    h('header', { class: 'pr-head' }, h('span', { class: 'pr-brand' }, 'BWL Max'), h('span', {}, [kind, new Date().toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' })].filter(Boolean).join(' · '))),
    h('h1', { class: 'pr-title' }, title || 'BWL Max'), sub ? h('p', { class: 'pr-sub' }, sub) : null,
    h('div', { class: 'pr-body' }, body),
    h('footer', { class: 'pr-foot' }, L('Erstellt mit BWL Max · bwlmax.de', 'Made with BWL Max · bwlmax.de')));
  document.body.appendChild(root);
  const prevTitle = document.title;
  const done = () => { if (cleanup !== done) return; cleanup = null; document.documentElement.classList.remove('printing'); document.title = prevTitle; root.remove(); };
  cleanup = done;
  document.documentElement.classList.add('printing');
  await mathReady(root);
  try { await Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  document.title = safe(title);   // wird beim Speichern als PDF zum Dateinamen
  if (!ls.get('tutor.pdfTip')) { ls.set('tutor.pdfTip', 1); toast(L('Im Druckfenster „Als PDF sichern“ wählen – dann landet es als Datei bei dir.', 'In the print dialog choose “Save as PDF” to keep it as a file.'), 6000); }
  addEventListener('afterprint', () => setTimeout(done, 300), { once: true });
  setTimeout(done, 10 * 60e3);
  window.print();
}

// ---------- Inhalte ----------
const sec = (...k) => h('section', { class: 'pr-sec' }, ...k);
const tafelOf = (title, html) => h('div', { class: 'tafel pr-tafel' }, title ? h('h2', { class: 'tt' }, title) : null, sanitize(html));
const KEYS = 'ABCDEFGH';
function seeded(arr, seed) {   // gleiche Mischung bei jedem Export
  const a = arr.slice(); let s = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function boardsPdf(boards, title) {
  const list = (boards || []).filter(b => b && b.html);
  return printPdf({ title: title || (list.length === 1 ? list[0].title : L('Tafelbilder', 'Boards')), kind: list.length === 1 ? L('Tafel', 'Board') : L(`${list.length} Tafeln`, `${list.length} boards`),
    body: list.map((b, i) => h('div', { class: 'pr-board' + (i ? ' pr-break' : '') }, tafelOf(list.length === 1 ? '' : b.title, b.html), b.q ? h('p', { class: 'pr-note' }, L('Deine Frage: ', 'Your question: '), b.q) : null)) });
}

export async function summaryPdf(doc) {
  const S = doc.summary; if (!S) return;
  const tree = n => h('li', {}, n.t, (n.c || []).length ? h('ul', {}, n.c.map(tree)) : null);
  // Mindmap als Grafik (wie in der App); falls das nicht klappt, als Gliederung
  let mm = null; try { const m = await import('./views/summary.js'); mm = S.mindmap ? m.mindmap(S.mindmap, S.title)?.querySelector('svg.mm') : null; } catch (e) {}
  return printPdf({ title: S.title || doc.name, kind: L('Lernzettel', 'Study sheet'), sub: doc.name,
    body: [
      (S.tldr || []).length ? sec(h('h2', {}, L('Das Wichtigste', 'Key points')), h('ul', { class: 'pr-tldr' }, S.tldr.map(t => h('li', {}, richText(t))))) : null,
      S.html ? sec(tafelOf('', S.html)) : null,
      S.mindmap ? sec(h('h2', {}, L('Mindmap', 'Mind map')), mm ? h('div', { class: 'pr-mm' }, mm) : h('ul', { class: 'pr-tree' }, tree(S.mindmap))) : null,
      (S.terms || []).length ? sec(h('h2', {}, L('Begriffe', 'Key terms')), h('dl', { class: 'pr-terms' }, S.terms.flatMap(t => [h('dt', {}, t.t), h('dd', {}, richText(t.d), t.page ? h('span', { class: 'pr-pg' }, L(' · S. ', ' · p. ') + t.page) : null)]))) : null
    ] });
}

export async function quizPdf(quiz, doc) {
  const { TYPE_LABEL } = await import('./quiz.js');
  const qs = quiz.questions || [];
  const ask$ = (q, i) => {
    const head = h('div', { class: 'pr-qh' }, h('b', {}, `${i + 1}.`), h('span', { class: 'pr-qt' }, TYPE_LABEL[q.type] || ''), q.page ? h('span', { class: 'pr-pg' }, L('S. ', 'p. ') + q.page) : null);
    let body = null;
    if (q.type === 'mc') body = h('ol', { class: 'pr-opts', type: 'A' }, (q.options || []).map(o => h('li', {}, richText(o))));
    else if (q.type === 'tf') body = h('p', { class: 'pr-tf' }, L('☐ richtig    ☐ falsch', '☐ true    ☐ false'));
    else if (q.type === 'match') { const right = seeded((q.pairs || []).map(p => p[1]), i + 3); body = h('div', { class: 'pr-match' }, h('ol', {}, q.pairs.map(p => h('li', {}, richText(p[0])))), h('ol', { type: 'a' }, right.map(r => h('li', {}, richText(r))))); }
    else if (q.type === 'order') body = h('ul', { class: 'pr-order' }, seeded(q.items || [], i + 7).map(t => h('li', {}, '☐ ', richText(t))));
    else if (q.type === 'cloze') body = (q.blanks || []).length ? h('p', { class: 'pr-bank' }, L('Wörter: ', 'Words: '), seeded([...(q.blanks || []), ...(q.distractors || [])], i + 11).join(' · ')) : null;
    else if (q.type === 'num') body = h('p', { class: 'pr-line' }, L('Ergebnis: ', 'Result: '), '_______________', q.unit ? ' ' + q.unit : '');
    const qtext = q.type === 'cloze' ? String(q.q).replace(/___+/g, '________') : q.q;
    return h('div', { class: 'pr-q' }, head, h('div', { class: 'pr-qq' }, richText(qtext)), body);
  };
  const sol$ = (q, i) => {
    let a = '';
    if (q.type === 'mc') a = (q.correct || []).map(k => KEYS[k] + ') ' + (q.options || [])[k]).join(' · ');
    else if (q.type === 'tf') a = q.correct ? L('richtig', 'true') : L('falsch', 'false');
    else if (q.type === 'match') a = (q.pairs || []).map(p => `${p[0]} → ${p[1]}`).join('\n');
    else if (q.type === 'order') a = (q.items || []).map((t, k) => `${k + 1}. ${t}`).join('\n');
    else if (q.type === 'cloze') a = (q.blanks || []).join(' · ');
    else if (q.type === 'num') a = fmt(q.answer) + (q.unit ? ' ' + q.unit : '') + (q.solution ? '\n' + String(q.solution).replace(/<br\s*\/?>/g, '\n') : '');
    return h('div', { class: 'pr-s' }, h('b', {}, `${i + 1}.`), h('div', {}, h('div', { class: 'pr-sa' }, richText(a)), q.explain ? h('div', { class: 'pr-se' }, richText(q.explain)) : null));
  };
  return printPdf({ title: quiz.title || 'Quiz', kind: quiz.exam ? L('Probeklausur', 'Mock exam') : 'Quiz', sub: [doc?.name, L(`${qs.length} Fragen`, `${qs.length} questions`)].filter(Boolean).join(' · '),
    body: [h('div', { class: 'pr-qs' }, qs.map(ask$)), h('div', { class: 'pr-break' }, h('h2', {}, L('Lösungen', 'Answers')), h('div', { class: 'pr-sol' }, qs.map(sol$)))] });
}

export function cardsPdf(decks, doc) {
  decks = (decks || []).filter(d => (d.cards || []).length);
  const n = decks.reduce((a, d) => a + d.cards.length, 0);
  return printPdf({ title: decks.length === 1 ? decks[0].title : L('Karteikarten', 'Flashcards'), kind: L(`${n} Karteikarten`, `${n} flashcards`), sub: doc?.name,
    body: decks.map((d, i) => h('div', { class: i ? 'pr-break' : '' }, decks.length > 1 ? h('h2', {}, d.title) : null,
      h('div', { class: 'pr-cards' }, h('div', { class: 'pr-ch' }, h('span', {}, L('Frage', 'Question')), h('span', {}, L('Antwort', 'Answer'))),
        d.cards.map(c => h('div', { class: 'pr-card' }, h('div', {}, richText(c.front)), h('div', { class: 'pr-cb' }, cardBack(c), c.page ? h('span', { class: 'pr-pg' }, L('S. ', 'p. ') + c.page) : null)))))) });
}

export function ankiFile(decks, doc) {
  // Anki versteht \( … \) direkt (MathJax). HTML-Zeichen maskieren, Zeilenumbrüche als <br>.
  const clean = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\t/g, ' ').replace(/\n/g, '<br>');
  decks = (decks || []).filter(d => (d.cards || []).length);
  const lines = ['#separator:tab', '#html:true', '#tags column:3', '#columns:' + L('Vorderseite', 'Front') + '\t' + L('Rückseite', 'Back') + '\tTags'];
  if (decks.length === 1) lines.splice(2, 0, '#deck:' + ('BWL Max::' + (doc?.name || L('Skript', 'Slides')) + '::' + decks[0].title).replace(/[\t\n]/g, ' '));
  else lines.splice(2, 0, '#deck:' + ('BWL Max::' + (doc?.name || L('Skript', 'Slides'))).replace(/[\t\n]/g, ' '));
  const tag = s => 'bwl-max ' + String(s || '').replace(/[^\wäöüÄÖÜß-]+/g, '_').slice(0, 40);
  // Rückseite: Formel als eigene Zeile, Legende, dann Text – Formel-Reste ohne \( \) werden vorher gesetzt
  const back = c => [c.formula ? '\\[' + clean(bareTex(c.formula)) + '\\]' : '', cardLegend(c).map(([s, t]) => '\\(' + clean(bareTex(s)) + '\\) ' + clean(t)).join(' · '), c.back ? clean(fixStray(c.back)) : ''].filter(Boolean).join('<br>');
  for (const d of decks) for (const c of d.cards) lines.push(clean(fixStray(c.front)) + '\t' + back(c) + '\t' + tag(d.title));
  saveBlob(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }), safe(decks.length === 1 ? decks[0].title : doc?.name || 'Karteikarten') + ' (Anki).txt');
  toast(L('In Anki: Datei → Importieren → diese Datei wählen. Stapel und Felder sind schon eingestellt.', 'In Anki: File → Import → pick this file. Deck and fields are already set.'), 5000);
}

export function scriptPdf(doc) {
  const pages = doc.pages || [];
  return printPdf({ title: doc.name, kind: doc.generated ? L('Kurzskript', 'Short script') : L('Skript (Text)', 'Slides (text)'),
    body: pages.map((p, i) => { const [first, ...rest] = String(p).split('\n'); return h('div', { class: 'pr-page' }, h('div', { class: 'pr-pn' }, L('Seite ', 'Page ') + (i + 1)), h('h2', {}, first), h('div', {}, richText(rest.join('\n')))); }) });
}

export function pathPdf(doc) {
  const P = doc.path; if (!P) return;
  const lessons = doc.lessons || {};
  return printPdf({ title: P.title || doc.name, kind: L('Lernpfad', 'Study path'), sub: P.summary || '',
    body: (P.chapters || []).map((c, i) => h('div', { class: 'pr-ch1' + (lessons[i] && i ? ' pr-break' : '') },
      h('h2', {}, `${i + 1}. ${c.title}`), c.goal ? h('p', {}, h('b', {}, L('Ziel: ', 'Goal: ')), c.goal) : null,
      (c.terms || []).length ? h('p', { class: 'pr-note' }, L('Begriffe: ', 'Terms: '), c.terms.join(' · ')) : null,
      c.pages ? h('p', { class: 'pr-note' }, L(`Seiten ${c.pages[0]}–${c.pages[1] || c.pages[0]}`, `Pages ${c.pages[0]}–${c.pages[1] || c.pages[0]}`)) : null,
      lessons[i] ? (lessons[i].slides || []).map(s => tafelOf(s.title, s.html)) : null)) });
}

// ---------- Podcast ----------
export function podcastText(p) {
  const fixT = x => String(x || '').replace(/\bLisas\b/g, 'Maries').replace(/\bLisa\b/g, 'Marie');
  const t = p.lines.map(l => `${l.s === 'Max' ? 'Max' : 'Marie'}: ${fixT(l.t)}`).join('\n\n');
  saveBlob(new Blob([p.title + '\n\n' + t], { type: 'text/plain;charset=utf-8' }), safe(p.title) + '.txt');
}
// MP3-Stücke sauber aneinanderhängen: ID3-Kopf und Xing/Info-Rahmen (Länge nur eines Stücks) weg
function frameLen(u8, o) {
  const b1 = u8[o + 1], b2 = u8[o + 2], ver = (b1 >> 3) & 3, layer = (b1 >> 1) & 3;
  if (layer !== 1) return 0;
  const bri = (b2 >> 4) & 15, sri = (b2 >> 2) & 3, pad = (b2 >> 1) & 1;
  const BR = ver === 3 ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320] : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] }[ver];
  if (!SR || sri === 3 || !bri || bri === 15) return 0;
  return Math.floor((ver === 3 ? 144 : 72) * BR[bri] * 1000 / SR[sri]) + pad;
}
export function mp3Body(u8) {
  let o = 0;
  if (u8[0] === 0x49 && u8[1] === 0x44 && u8[2] === 0x33) o = 10 + (((u8[6] & 127) << 21) | ((u8[7] & 127) << 14) | ((u8[8] & 127) << 7) | (u8[9] & 127)) + ((u8[5] & 16) ? 10 : 0);
  while (o < u8.length - 4 && !(u8[o] === 0xff && (u8[o + 1] & 0xe0) === 0xe0)) o++;
  const len = frameLen(u8, o);
  if (len > 0 && o + len <= u8.length) {
    let s = ''; for (let i = o + 4; i < Math.min(o + len, o + 200); i++) s += String.fromCharCode(u8[i]);
    if (s.includes('Xing') || s.includes('Info')) o += len;
  }
  return u8.subarray(o);
}
const b64u8 = b64 => { const bin = atob(b64); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8; };

export async function podcastMp3(p, doc) {
  if (p.real === false || !p.voice) { toast(L('Diese Folge läuft mit der Gratis-Stimme deines Browsers – davon gibt’s keine Audiodatei. Ich lade dir den Text.', 'This episode uses your browser’s free voice – there’s no audio file for that. Downloading the text instead.'), 5200); return podcastText(p); }
  p.audio ||= [];
  const n = p.lines.length, miss = p.lines.map((_, k) => k).filter(k => !p.audio[k]);
  const t = h('span', {}, L('Audio wird vorbereitet …', 'Preparing audio …'));
  let done = n - miss.length;
  const prog = () => { t.textContent = L(`Audio wird vorbereitet … ${done} / ${n}`, `Preparing audio … ${done} / ${n}`); };
  if (miss.length) { toast(t, 120000); prog(); }
  let err = null, idx = 0;
  const worker = async () => {
    while (idx < miss.length && !err) {
      const k = miss[idx++], l = p.lines[k];
      try { const r = await ask('podtts', { text: String(l.t || '').replace(/\bLisas\b/g, 'Maries').replace(/\bLisa\b/g, 'Marie'), lang: p.lang || 'de', opts: { pod: p.id, voice: l.s === 'Max' ? p.voice : 'lisa' } }); p.audio[k] = r.audio; done++; prog(); }
      catch (e) { err = e; }
    }
  };
  await Promise.all([worker(), worker()]);
  if (doc) save(doc);
  t.closest('.toast')?.remove();
  if (err) { toast(err.message || L('Das Audio konnte gerade nicht vollständig erstellt werden. Versuch es später nochmal.', 'The audio couldn’t be fully created right now. Try again later.'), 6000); return; }
  const parts = p.audio.slice(0, n).map(b64 => mp3Body(b64u8(b64)));
  saveBlob(new Blob(parts, { type: 'audio/mpeg' }), safe(p.title) + '.mp3');
  toast(L('Folge gespeichert – liegt in deinen Downloads und läuft auch offline.', 'Episode saved – it’s in your downloads and plays offline.'), 4200);
}

// ---------- Was gibt’s zu einem Ding? (für Knöpfe und Bibliothek) ----------
export const optsDeck = (decks, doc) => [PDF(() => cardsPdf(decks, doc), L('Fragen und Antworten zum Ausdrucken', 'Questions and answers to print')), { label: 'Anki', sub: L('Zum Import in Anki (inkl. Formeln)', 'To import into Anki (formulas included)'), ic: 'cards', fn: () => ankiFile(decks, doc) }];
export const optsQuiz = (q, doc) => [PDF(() => quizPdf(q, doc), L('Fragen, danach die Lösungen', 'Questions, then the answers'))];
export const optsSummary = doc => [PDF(() => summaryPdf(doc))];
export const optsPodcast = (p, doc) => [{ label: 'MP3', sub: L('Zum Anhören – auch offline', 'To listen to – offline too'), ic: 'pod', fn: () => podcastMp3(p, doc) }, { label: L('Text', 'Text'), sub: L('Das Skript der Folge', 'The episode’s script'), ic: 'note', fn: () => podcastText(p) }];
export const optsBoards = (boards, title) => [PDF(() => boardsPdf(boards, title))];
// Alles zu einem Skript
export function optsDoc(doc) {
  const o = [];
  if (doc.generated && (doc.pages || []).length) o.push({ label: L('Kurzskript (PDF)', 'Short script (PDF)'), ic: 'bulb', fn: () => scriptPdf(doc) });
  const decks = (doc.decks || []).filter(d => (d.cards || []).length);
  if (decks.length) { o.push({ label: L('Alle Karteikarten (PDF)', 'All flashcards (PDF)'), ic: 'cards', fn: () => cardsPdf(decks, doc) }, { label: L('Alle Karteikarten (Anki)', 'All flashcards (Anki)'), ic: 'cards', fn: () => ankiFile(decks, doc) }); }
  (doc.quizzes || []).forEach(q => o.push({ label: L('Quiz: ', 'Quiz: ') + q.title, sub: 'PDF', ic: q.exam ? 'exam' : 'quiz', fn: () => quizPdf(q, doc) }));
  if (doc.summary) o.push({ label: L('Lernzettel (PDF)', 'Study sheet (PDF)'), ic: 'note', fn: () => summaryPdf(doc) });
  if (doc.path) o.push({ label: L('Lernpfad (PDF)', 'Study path (PDF)'), ic: 'path', fn: () => pathPdf(doc) });
  (doc.podcasts || []).forEach(p => o.push({ label: L('Podcast: ', 'Podcast: ') + p.title, sub: 'MP3', ic: 'pod', fn: () => podcastMp3(p, doc) }));
  const boards = (doc.boards || []).filter(b => b && b.html);
  if (boards.length) o.push({ label: L(`Alle ${boards.length} Tafeln (PDF)`, `All ${boards.length} boards (PDF)`), ic: 'board', fn: () => boardsPdf(boards, doc.name) });
  return o;
}
