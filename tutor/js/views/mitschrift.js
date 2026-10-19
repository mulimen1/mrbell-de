// Mitschrift: in der Vorlesung einfach drauflos tippen – Max macht daraus eine saubere,
// handschriftliche Mitschrift (Füller oder Druckschrift) mit Skizzen. Wird als Unterlage im Fach gespeichert,
// damit Karteikarten, Quiz & Co. direkt daraus entstehen können.
import { h, ico, ls, toast, ago, uid } from '../util.js';
import { L } from '../i18n.js';
import { S, createDoc, openDoc, save } from '../state.js';
import { ask } from '../api.js';
import * as M from '../me.js';
import { formula, rich, flat, sketch, canDraw, underline, box } from '../msdraw.js';

const DKEY = 'tutor.ms.draft';
let cssOn = false;
function css() { if (cssOn || document.querySelector('link[data-ms]')) return; cssOn = true; document.head.appendChild(h('link', { rel: 'stylesheet', href: '/tutor/css/mitschrift.css?v=1', 'data-ms': '1' })); }

export async function render(root, { id = '' } = {}) {
  css();
  const wrap = h('div', { class: 'view-in ms' }); root.appendChild(wrap);
  if (id) {
    const d = await openDoc(id);
    if (!d || !d.ms) { toast(L('Diese Mitschrift gibt es auf diesem Gerät nicht mehr.', 'This note is no longer on this device.')); location.replace('#/app/mitschrift'); return; }
    return sheetView(wrap, d);
  }
  return editor(wrap);
}

// ---------- Editor ----------
function editor(wrap) {
  const draft = Object.assign({ fach: '', text: '', stil: 'fueller', at: 0 }, ls.get(DKEY, {}) || {});
  const keep = () => { draft.at = Date.now(); ls.set(DKEY, draft); st.textContent = draft.text.trim() ? L('Automatisch gespeichert', 'Saved automatically') : ''; };

  const head = h('div', { class: 'ms-head' },
    h('div', {}, h('div', { class: 'eyebrow' }, L('Live-Mitschrift', 'Live notes')), h('h2', {}, L('Schreib einfach mit.', 'Just take notes.')),
      h('p', {}, L('Tipp in der Vorlesung drauflos – Stichworte, Abkürzungen, Pfeile. Max macht daraus eine saubere Mitschrift in Handschrift, mit Skizzen.', 'Type away during the lecture – keywords, abbreviations, arrows. Max turns it into clean handwritten notes with sketches.'))));

  // Fach: vorhandene Fächer als Chips, sonst frei eintippen
  const faecher = M.getMe().faecher || [];
  const fachIn = h('input', { type: 'text', placeholder: faecher.length ? L('anderes Fach …', 'other subject …') : L('Fach, z. B. Kostenrechnung', 'Subject, e.g. Cost accounting'), value: faecher.some(f => f.name === draft.fach) ? '' : draft.fach, 'aria-label': L('Fach', 'Subject'),
    oninput: e => { draft.fach = e.target.value.trim(); drawFach(); keep(); } });
  const fachEl = h('div', { class: 'ms-fach' });
  const drawFach = () => fachEl.replaceChildren(h('small', {}, L('Fach', 'Subject')),
    ...faecher.map(f => h('button', { type: 'button', class: 'chip' + (draft.fach === f.name ? ' on' : ''), onclick: () => { draft.fach = draft.fach === f.name ? '' : f.name; fachIn.value = ''; drawFach(); keep(); } }, f.name)), fachIn);
  drawFach();

  const ta = h('textarea', { class: 'ms-ta', spellcheck: 'false', autocapitalize: 'off', 'aria-label': L('Deine Notizen', 'Your notes'),
    placeholder: L('z. B.\nDB = Umsatz - var Kosten\nbreak even -> Fixkosten / db pro stk\n!! kurzfr. PUG = kv\n\nEinfach so schnell wie möglich – sauber macht’s Max.', 'e.g.\nCM = revenue - var costs\nbreak even -> fixed costs / cm per unit\n!! short-term price floor = vc\n\nAs fast as you like – Max makes it neat.') });
  ta.value = draft.text;
  // Pfeile beim Tippen direkt schön machen
  ta.addEventListener('input', () => {
    const p = ta.selectionStart, v = ta.value, nv = v.replace(/->/g, '→').replace(/=>/g, '⇒').replace(/<-/g, '←');
    if (nv !== v) { ta.value = nv; const d = v.length - nv.length; ta.selectionStart = ta.selectionEnd = Math.max(0, p - d); }
    draft.text = ta.value; keep(); go.disabled = draft.text.trim().length < 25;
  });
  const ins = s => { ta.focus(); const a = ta.selectionStart, b = ta.selectionEnd; ta.setRangeText(s, a, b, 'end'); ta.dispatchEvent(new Event('input')); };
  const tools = h('div', { class: 'ms-tools', role: 'toolbar', 'aria-label': L('Zeichen', 'Symbols') },
    [['→', '→ '], ['⇒', '⇒ '], ['≠', '≠'], ['≈', '≈'], ['Δ', 'Δ'], ['Σ', 'Σ'], ['%', '%'], ['€', '€'], ['⭐ ' + L('wichtig', 'key'), '⭐ '], ['❓ ' + L('unklar', 'unclear'), '❓ ']].map(([t, s]) =>
      h('button', { type: 'button', onmousedown: e => e.preventDefault(), onclick: () => ins(s) }, t)));

  let stil = draft.stil === 'druck' ? 'druck' : 'fueller';
  const seg = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': L('Schrift', 'Handwriting') });
  const drawSeg = () => seg.replaceChildren(...[['fueller', L('Füller', 'Fountain pen')], ['druck', L('Druckschrift', 'Print')]].map(([k, n]) => h('button', { type: 'button', class: k === stil ? 'on' : '', role: 'radio', 'aria-checked': String(k === stil), onclick: () => { stil = draft.stil = k; drawSeg(); keep(); } }, n)));
  drawSeg();
  const st = h('span', { class: 'ms-st' });
  const go = h('button', { type: 'button', class: 'btn primary ms-go', disabled: draft.text.trim().length < 25, onclick: () => make() }, h('span', { html: ico('pen') }), L('Saubere Mitschrift machen', 'Make clean notes'));
  const foot = h('div', { class: 'ms-foot' }, st, seg, go);
  const ed = h('div', { class: 'ms-ed' }, fachEl, tools, ta, foot);
  wrap.append(head, ed, list());
  keep();

  async function make() {
    const notes = ta.value.trim(); if (notes.length < 25) return;
    const busy = h('div', { class: 'ms-busy', role: 'status' },
      h('span', { html: '<svg class="ms-penani" viewBox="0 0 54 40" aria-hidden="true"><path class="w" d="M3 26c5-9 9-9 11 0s6 9 9 0 6-9 9 0 6 9 9 0 6-8 10-2"/></svg>' }),
      h('div', {}, h('b', {}, L('Max schreibt sauber ab …', 'Max is writing it up …')), h('small', {}, L('ordnet, korrigiert, zeichnet Skizzen – dauert ca. 15 Sekunden', 'sorting, correcting, sketching – takes about 15 seconds'))));
    foot.replaceWith(busy); ta.readOnly = true;
    try {
      const r = await ask('mitschrift', { opts: { notes, fach: draft.fach, stil } });
      const data = clean(r.data);
      if (!data.abschnitte.length) throw new Error(L('Die Mitschrift kam leer an. Versuch es nochmal.', 'The notes came back empty. Please try again.'));
      const text = asText(data);
      const doc = await createDoc({ name: data.titel || L('Mitschrift', 'Notes'), pages: [text], chars: text.length, extra: { kind: 'mitschrift', ms: { data, raw: notes, stil, fach: draft.fach, at: Date.now() } } });
      if (draft.fach) intoFach(doc, draft.fach);
      ls.set(DKEY, { fach: draft.fach, text: '', stil, at: 0 });
      try { window.BM && window.BM.track('Mitschrift', stil); } catch (e) {}
      location.hash = '#/app/mitschrift/' + doc.id;
    } catch (e) {
      busy.replaceWith(foot); ta.readOnly = false;
      import('../ui.js').then(m => m.apiError(e, make)).catch(() => toast(e.message));
    }
  }
}

function intoFach(doc, name) {
  M.updateMe(m => {
    let f = m.faecher.find(x => x.name.toLowerCase() === name.toLowerCase()) || M.findFach(name);
    if (!f) { f = { id: uid(), created: Date.now(), name, kurz: '', klausur: '', ects: '', docs: [], termine: [] }; m.faecher.push(f); }
    else f = m.faecher.find(x => x.id === f.id);
    f.docs = [...new Set([...(f.docs || []), doc.id])];
  });
}

function list() {
  const items = S.list.filter(d => d.kind === 'mitschrift' && d.ms).sort((a, b) => (b.created || 0) - (a.created || 0));
  if (!items.length) return h('div');
  return h('div', { class: 'ms-list' }, h('h3', {}, L('Deine Mitschriften', 'Your notes')),
    items.slice(0, 30).map(d => h('a', { class: 'ms-card', href: '#/app/mitschrift/' + d.id }, h('b', {}, d.name), h('small', {}, [d.ms.fach, ago(d.created)].filter(Boolean).join(' · ')))));
}

// KI-Antwort absichern (fehlende Felder, falsche Typen)
const str = (v, n = 400) => (v == null ? '' : String(v)).slice(0, n);
function clean(d) {
  d = d && typeof d === 'object' ? d : {};
  const arr = v => Array.isArray(v) ? v : [];
  return {
    titel: str(d.titel, 120), kern: str(d.kern, 300),
    abschnitte: arr(d.abschnitte).slice(0, 14).map(a => ({ h: str(a && a.h, 120), punkte: arr(a && a.punkte).map(p => str(p, 300)).filter(Boolean).slice(0, 14), formel: str(a && a.formel, 200), legende: str(a && a.legende, 300), merke: str(a && a.merke, 300), bild: a && a.bild && typeof a.bild === 'object' && canDraw(a.bild) ? a.bild : null })).filter(a => a.h || a.punkte.length),
    korrekturen: arr(d.korrekturen).map(x => str(x, 300)).filter(Boolean).slice(0, 6),
    fragen: arr(d.fragen).map(x => str(x, 200)).filter(Boolean).slice(0, 4)
  };
}
function asText(d) {
  const out = [flat(d.titel), flat(d.kern), ''];
  d.abschnitte.forEach(a => { out.push(flat(a.h)); a.punkte.forEach(p => out.push('– ' + flat(p))); if (a.formel) out.push('Formel: ' + flat('\\(' + a.formel.replace(/\\[()[\]]/g, '') + '\\)')); if (a.legende) out.push(flat(a.legende)); if (a.merke) out.push('Merke: ' + flat(a.merke)); out.push(''); });
  if (d.korrekturen.length) out.push('Korrekturen:', ...d.korrekturen.map(x => '– ' + flat(x)));
  return out.join('\n').trim();
}

// ---------- Blatt ----------
function sheetView(wrap, d) {
  const ms = d.ms;
  let showRaw = false;
  const paperHost = h('div');
  const draw = (anim) => { paperHost.replaceChildren(paper(d, anim)); };
  const seg = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': L('Schrift', 'Handwriting') });
  const drawSeg = () => seg.replaceChildren(...[['fueller', L('Füller', 'Fountain pen')], ['druck', L('Druckschrift', 'Print')]].map(([k, n]) => h('button', { type: 'button', class: k === (ms.stil || 'fueller') ? 'on' : '', role: 'radio', 'aria-checked': String(k === ms.stil), onclick: () => { ms.stil = k; save(d); drawSeg(); draw(false); } }, n)));
  drawSeg();
  const raw = h('div', { class: 'ms-raw', hidden: true }, ms.raw || '');
  const bar = h('div', { class: 'ms-bar' },
    h('a', { class: 'btn ghost sm grow', href: '#/app/mitschrift' }, h('span', { html: ico('left') }), L('Mitschriften', 'Notes')),
    seg,
    h('button', { type: 'button', class: 'btn sm', onclick: () => printIt() }, h('span', { html: ico('download') }), 'PDF'),
    h('a', { class: 'btn sm', href: `#/app/${d.id}/karten` }, h('span', { html: ico('cards') }), L('Karteikarten', 'Flashcards')),
    h('a', { class: 'btn sm', href: `#/app/${d.id}/quiz` }, h('span', { html: ico('quiz') }), 'Quiz'),
    h('button', { type: 'button', class: 'btn ghost sm', onclick: e => { showRaw = !showRaw; raw.hidden = !showRaw; e.currentTarget.lastChild.textContent = showRaw ? L('Notizen ausblenden', 'Hide notes') : L('Meine Notizen', 'My notes'); } }, h('span', { html: ico('note') }), h('span', {}, L('Meine Notizen', 'My notes'))));
  wrap.append(bar, paperHost, raw);
  draw(!ms.seen); if (!ms.seen) { ms.seen = 1; save(d); }
  const onR = () => paperHost.querySelectorAll('.ms-f, .ms-merke').forEach(el => el._box && el._box());
  addEventListener('resize', onR);
  return () => removeEventListener('resize', onR);
}

function printIt() {
  document.documentElement.classList.add('ms-printing');
  const off = () => { document.documentElement.classList.remove('ms-printing'); removeEventListener('afterprint', off); };
  addEventListener('afterprint', off);
  setTimeout(() => { window.print(); setTimeout(off, 1500); }, 60);
}

function paper(d, anim) {
  const ms = d.ms, x = ms.data, stil = ms.stil === 'druck' ? 'druck' : 'fueller';
  const ink = stil === 'druck' ? '#23324f' : '#1f3c88';
  let i = 0; const A = el => { el.classList.add('ms-a'); el.style.setProperty('--i', i++); return el; };
  const p = h('article', { class: 'ms-paper ' + stil + (anim ? ' ms-in' : '') });
  const date = new Date(ms.at || d.created || Date.now()).toLocaleDateString(L('de-DE', 'en-GB'), { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  p.append(A(h('div', { class: 'ms-meta' }, h('span', {}, ms.fach || ''), h('span', {}, date))));
  p.append(A(h('h1', { class: 'ms-t', html: rich(x.titel || d.name) })), A(h('div', {}, underline(420, 3, ink))));
  if (x.kern) p.append(A(h('p', { class: 'ms-kern', html: rich(x.kern) })));
  x.abschnitte.forEach((a, n) => {
    const sec = h('section', { class: 'ms-sec' });
    if (a.h) sec.append(A(h('h2', { class: 'ms-h', html: `${n + 1}. ` + rich(a.h) })));
    if (a.punkte.length) sec.append(h('ul', {}, a.punkte.map(t => A(h('li', { html: rich(t) })))));
    if (a.formel) { const f = A(h('div', { class: 'ms-f', html: formula(a.formel) })); f._box = box(f, 4 + n, ink); sec.append(h('div', {}, f)); }
    if (a.legende) sec.append(A(h('p', { class: 'ms-leg', html: rich(a.legende) })));
    if (a.merke) { const m = A(h('div', { class: 'ms-merke' }, h('b', {}, L('Merke: ', 'Remember: ')), h('span', { html: rich(a.merke) }))); m._box = box(m, 40 + n, '#c0392b'); sec.append(m); }
    if (a.bild) sec.append(A(h('figure', { class: 'ms-fig' }, sketch(a.bild, ink), a.bild.titel ? h('figcaption', {}, flat(a.bild.titel)) : null)));
    p.append(sec);
  });
  if (x.korrekturen.length) p.append(A(h('div', { class: 'ms-kor' }, x.korrekturen.map(k => h('p', { html: '✎ ' + rich(k) })))));
  if (x.fragen.length) p.append(A(h('div', { class: 'ms-fr' }, h('h2', { class: 'ms-h' }, L('Check dich selbst', 'Test yourself')), h('ol', {}, x.fragen.map(q => h('li', { html: rich(q) }))))));
  p.append(A(h('div', { class: 'ms-sign' }, 'BWL Max · ' + L('Mitschrift', 'Notes'))));
  // Kästen erst zeichnen, wenn die Schrift geladen ist (sonst passen die Maße nicht)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => p.querySelectorAll('.ms-f, .ms-merke').forEach(el => el._box && el._box()));
  return p;
}
