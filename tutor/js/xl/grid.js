// Excel-Nachbau für den Excel-Trainer: Zellen, Formeln (deutsch wie im deutschen Excel), echte Tastenkürzel,
// Zeigen mit Maus/Pfeilen beim Formel-Tippen, F4, Ausfüllen (Strg+D/R, Ausfüllkästchen, Doppelklick), Kopieren/Einfügen,
// AutoSumme, Formate, Rückgängig. Gerechnet wird mit derselben Engine wie bei den Vorlagen.
import { h } from '../util.js';
import { DE, colL, colN, split, deFormula } from './core.js';

export const MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
const EN = Object.fromEntries(Object.entries(DE).map(([e, d]) => [d, e]));
const NOT_EN = new Set(Object.keys(DE).filter(k => DE[k] !== k));   // englische Namen, die es im deutschen Excel anders heißt
const nf = d => new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const nfg = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 });

// ---------- Formeln: Eingabe (deutsch oder englisch) → interne englische Schreibweise ----------
const REF_RE = /^\$?[A-Za-z]{1,2}\$?\d{1,4}(?![A-Za-z0-9(])/;
export function toEN(src) {
  const s = String(src).replace(/^[=+]/, '');
  let eng = false; for (const m of s.matchAll(/[A-Za-z]+(?=\s*\()/g)) if (NOT_EN.has(m[0].toUpperCase())) eng = true;
  const commaSep = !s.includes(';') && eng;   // „=SUM(A1,A2)“ englisch – sonst ist das Komma ein Dezimalkomma
  let out = '', i = 0;
  while (i < s.length) {
    const ch = s[i], rest = s.slice(i), prev = s[i - 1] || '';
    if (ch === '"') { const j = s.indexOf('"', i + 1); const k = j < 0 ? s.length : j + 1; out += s.slice(i, k); i = k; continue; }
    if (ch === ' ') { i++; continue; }
    const fm = /^[A-Za-zÄÖÜäöüß][A-Za-z0-9ÄÖÜäöüß.]*(?=\s*\()/.exec(rest);
    if (fm && !/[A-Za-z0-9$]/.test(prev)) { const n = fm[0].toUpperCase(); out += EN[n] || n; i += fm[0].length; continue; }
    const rm = REF_RE.exec(rest);
    if (rm && !/[A-Za-z0-9_]/.test(prev)) { out += rm[0].toUpperCase(); i += rm[0].length; continue; }
    const wm = /^[A-Za-zÄÖÜäöüß_]+/.exec(rest);
    if (wm && !/[A-Za-z0-9]/.test(prev)) { const w = wm[0].toUpperCase(); out += w === 'WAHR' ? 'TRUE' : w === 'FALSCH' ? 'FALSE' : w; i += wm[0].length; continue; }
    const nm = /^\d+(?:[.,]\d+)?/.exec(rest);
    if (nm) { let t = nm[0]; if (commaSep && t.includes(',')) t = t.split(',')[0]; const adv = t.length; out += t.replace(',', '.'); i += adv; continue; }
    if (ch === ';') { out += ','; i++; continue; }
    if (ch === ',') { out += commaSep ? ',' : '.'; i++; continue; }
    out += ch; i++;
  }
  return out;
}
export const toDE = f => deFormula('=' + f);
// Bezüge beim Kopieren/Ausfüllen verschieben ($ bleibt fest)
export function shiftF(f, dr, dc) {
  let out = '', i = 0;
  while (i < f.length) {
    if (f[i] === '"') { const j = f.indexOf('"', i + 1); const k = j < 0 ? f.length : j + 1; out += f.slice(i, k); i = k; continue; }
    const rest = f.slice(i), fm = /^[A-Z][A-Z0-9.]*(?=\()/.exec(rest);
    if (fm && !/[A-Z0-9$]/.test(f[i - 1] || '')) { out += fm[0]; i += fm[0].length; continue; }
    const m = /^(\$?)([A-Z]{1,2})(\$?)(\d+)/.exec(rest);
    if (m && !/[A-Z0-9_]/.test(f[i - 1] || '')) { let c = colN(m[2]), r = +m[4]; if (!m[1]) c += dc; if (!m[3]) r += dr; out += c < 1 || r < 1 ? '#REF!' : m[1] + colL(c) + m[3] + r; i += m[0].length; continue; }
    out += f[i]; i++;
  }
  return out;
}
// Bezüge im (deutschen) Eingabetext finden – für farbige Rahmen und F4
export function refsIn(text) {
  const out = []; if (!/^\s*[=+]/.test(text)) return out;
  const re = /(\$?[A-Za-z]{1,2}\$?\d{1,4})(?::(\$?[A-Za-z]{1,2}\$?\d{1,4}))?/g; let inStr = false, m;
  const q = []; for (let i = 0; i < text.length; i++) if (text[i] === '"') q.push(i);
  const quoted = i => { let n = 0; for (const p of q) if (p < i) n++; return n % 2 === 1; };
  while ((m = re.exec(text))) {
    const s = m.index, e = s + m[0].length, pv = text[s - 1] || '', nx = text[e] || '';
    if (/[A-Za-z0-9_]/.test(pv) || /[A-Za-z0-9(]/.test(nx) || quoted(s)) continue;
    out.push({ s, e, a: m[1].replace(/\$/g, '').toUpperCase(), b: (m[2] || m[1]).replace(/\$/g, '').toUpperCase(), txt: m[0] });
  }
  inStr = inStr; return out;
}
// F4: A1 → $A$1 → A$1 → $A1 → A1 (für den Bezug am Cursor)
export function toggleAbs(text, caret) {
  const list = refsIn(text); const hit = list.find(x => caret >= x.s && caret <= x.e) || list.filter(x => x.e <= caret).pop();
  if (!hit) return null;
  const cyc = p => { const m = /^(\$?)([A-Za-z]{1,2})(\$?)(\d+)$/.exec(p); const st = (m[1] ? 1 : 0) + (m[3] ? 2 : 0); const nx = { 0: 3, 3: 2, 2: 1, 1: 0 }[st]; return (nx & 1 ? '$' : '') + m[2].toUpperCase() + (nx & 2 ? '$' : '') + m[4]; };
  const parts = hit.txt.split(':'); const first = cyc(parts[0]); const st = (first[0] === '$' ? 1 : 0) + (/\$\d/.test(first) ? 2 : 0);
  const apply = p => { const m = /^\$?([A-Za-z]{1,2})\$?(\d+)$/.exec(p); return (st & 1 ? '$' : '') + m[1].toUpperCase() + (st & 2 ? '$' : '') + m[2]; };
  const rep = parts.map(apply).join(':');
  return { text: text.slice(0, hit.s) + rep + text.slice(hit.e), caret: hit.s + rep.length };
}
// Eingabe ohne = : Zahl (deutsch), Prozent, Euro – sonst Text
export function parseRaw(raw) {
  const t = String(raw).trim(); if (!t) return null;
  let s = t.replace(/\s/g, ''), fmt; if (/€$/.test(s)) { fmt = 'eur'; s = s.replace(/€$/, ''); } let pct = false; if (/%$/.test(s)) { pct = true; s = s.replace(/%$/, ''); }
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '');
  s = s.replace(',', '.');
  if (/^-?\d+(\.\d+)?$/.test(s)) { const n = +s; return pct ? { v: n / 100, fmt: 'pct' } : { v: n, fmt }; }
  return { v: t };
}
const ERR = { '#DIV/0!': '#DIV/0!', '#NAME?': '#NAME?', '#VALUE!': '#WERT!', '#REF!': '#BEZUG!', '#NUM!': '#ZAHL!', '#N/A': '#NV', '#ERROR!': '#FEHLER!', '#NULL!': '#NULL!' };
export function display(v, fmt) {
  if (v == null || v === '') return '';
  if (typeof v === 'object' && v.error) return ERR[v.error] || v.error;
  if (typeof v === 'boolean') return v ? 'WAHR' : 'FALSCH';
  if (typeof v === 'number') {
    if (!isFinite(v)) return '#ZAHL!'; const x = Math.abs(v) < 5e-10 ? 0 : v;
    if (fmt === 'eur') return nf(2).format(x) + ' €';
    if (fmt === 'pct') return nf(2).format(x * 100) + ' %';
    if (fmt === 'num') return nf(2).format(x);
    return nfg.format(x);
  }
  return String(v);
}

// ---------- Tabelle ----------
export class Grid {
  constructor({ E, cols, rows, widths, cells = {}, onEvent }) {
    this.E = E; this.cols = cols; this.rows = rows; this.onEvent = onEvent || (() => {});
    this.cells = {}; this.values = {}; this.log = []; this.undoS = []; this.clip = null; this.edit = null;
    this.act = 'A1'; this.anc = 'A1'; this.target = null;
    for (const [ref, x] of Object.entries(cells)) this.put(ref, x);
    this.build(widths || []); this.recalc();
  }
  // Zelle aus der Lektion: 'Text' | 120 | { r: '=B2*C2', fmt, b }
  put(ref, x) {
    const o = typeof x === 'object' && x ? x : { r: x }; const raw = String(o.r == null ? '' : o.r);
    const c = this.cells[ref] = {}; if (o.fmt) c.fmt = o.fmt; if (o.b) c.b = true;
    this.setRawIn(ref, raw);
  }
  setRawIn(ref, raw) {
    const c = this.cells[ref] || (this.cells[ref] = {}); delete c.f; delete c.v; c.raw = raw;
    if (!raw.trim()) { c.raw = ''; if (!c.fmt && !c.b) delete this.cells[ref]; return; }
    if (/^[=+]/.test(raw) && raw.length > 1) { c.f = toEN(raw); c.raw = toDE(c.f); }
    else { const p = parseRaw(raw); c.v = p.v; if (p.fmt && !c.fmt) c.fmt = p.fmt; }
  }
  // Für „Zeig’s mir“: Zelle setzen wie getippt
  setRaw(ref, raw) { if (this.edit) this.endEdit(); this.snap(); this.setRawIn(ref, String(raw)); this.recalc(); this.emit({ t: 'commit', ref, raw: String(raw), how: 'solve', f: this.fx(ref) }); }
  // ---- Abfragen für die Lektionen ----
  v(ref) { const x = this.values[ref]; return x === undefined ? (this.cells[ref] ? this.cells[ref].v : undefined) : x; }
  raw(ref) { return this.cells[ref] ? this.cells[ref].raw || '' : ''; }
  fx(ref) { return this.cells[ref] && this.cells[ref].f || ''; }
  fmt(ref) { return this.cells[ref] && this.cells[ref].fmt || ''; }
  bold(ref) { return !!(this.cells[ref] && this.cells[ref].b); }
  filled(c, r) { const x = this.cells[colL(c) + r]; return !!(x && x.raw && x.raw.trim()); }
  get rect() { const a = split(this.anc), b = split(this.act); return { c1: Math.min(a.c, b.c), r1: Math.min(a.r, b.r), c2: Math.max(a.c, b.c), r2: Math.max(a.r, b.r) }; }
  get range() { const R = this.rect; const a = colL(R.c1) + R.r1, b = colL(R.c2) + R.r2; return a === b ? a : a + ':' + b; }
  get editing() { return !!this.edit; }
  emit(ev) { this.log.push(ev); this.onEvent(ev); }
  recalc() {
    const ec = {}; for (const [k, c] of Object.entries(this.cells)) { if (c.f != null) ec[k] = { f: c.f }; else if (c.v != null && c.v !== '') ec[k] = { v: c.v }; }
    let r; try { r = this.E.evaluate(ec); } catch (e) { r = { values: {}, errors: [] }; }
    this.values = r.values; this.render();
    return r;
  }
  snap() { this.undoS.push(JSON.stringify(this.cells)); if (this.undoS.length > 60) this.undoS.shift(); }
  undo() { const s = this.undoS.pop(); if (!s) return; this.cells = JSON.parse(s); this.recalc(); this.emit({ t: 'undo' }); }

  // ---- DOM ----
  build(widths) {
    const t = h('table', { class: 'xt-t' }), cg = h('colgroup', {}, h('col', { style: { width: '40px' } }), [...Array(this.cols)].map((_, k) => h('col', { style: { width: (widths[k] || 96) + 'px' } })));
    const hr = h('tr', {}, h('th', { class: 'xt-co' }), [...Array(this.cols)].map((_, k) => h('th', { class: 'xt-ch', 'data-c': k + 1 }, colL(k + 1))));
    const tb = h('tbody'); this.td = {};
    for (let r = 1; r <= this.rows; r++) { const tr = h('tr', {}, h('th', { class: 'xt-rh', 'data-r': r }, String(r))); for (let c = 1; c <= this.cols; c++) { const ref = colL(c) + r; const td = h('td', { 'data-ref': ref }); this.td[ref] = td; tr.append(td); } tb.append(tr); }
    t.append(cg, h('thead', {}, hr), tb);
    this.selBox = h('div', { class: 'xt-sel' }, this.fh = h('div', { class: 'xt-fh', title: 'Ausfüllkästchen – ziehen oder doppelklicken' }));
    this.ants = h('div', { class: 'xt-ants', hidden: true }); this.tgt = h('div', { class: 'xt-tgt', hidden: true }); this.prev = h('div', { class: 'xt-prev', hidden: true }); this.refLayer = h('div', { class: 'xt-refs' });
    this.inner = h('div', { class: 'xt-inner' }, t, this.refLayer, this.tgt, this.ants, this.prev, this.selBox);
    this.scroll = h('div', { class: 'xt-scroll' }, this.inner);
    this.nameBox = h('span', { class: 'xt-nb' }, 'A1'); this.fxBox = h('div', { class: 'xt-fx' });
    this.msg = h('div', { class: 'xt-msg', hidden: true });
    this.el = h('div', { class: 'xt-grid', tabindex: 0, 'aria-label': 'Tabelle – Pfeiltasten zum Bewegen, tippen zum Eingeben' },
      h('div', { class: 'xt-fbar' }, this.nameBox, h('i', {}, 'fx'), this.fxBox), this.scroll, this.msg);
    this.table = t; this.bind();
  }
  render() {
    for (const [ref, td] of Object.entries(this.td)) {
      const c = this.cells[ref]; const v = c ? (c.f != null ? this.values[ref] : c.v) : undefined;
      const txt = this.edit && this.edit.ref === ref ? null : display(v, c && c.fmt);
      if (txt !== null && td.textContent !== txt) td.textContent = txt;
      td.className = (typeof v === 'number' ? 'n' : '') + (c && c.b ? ' b' : '') + (v && typeof v === 'object' && v.error ? ' err' : '') + (typeof v === 'number' && v < -5e-10 && c && c.fmt === 'eur' ? ' neg' : '');
    }
    this.paintSel();
  }
  box(r1, c1, r2, c2) {
    const a = this.td[colL(c1) + r1], b = this.td[colL(c2) + r2]; if (!a || !b) return null; const o = this.inner.getBoundingClientRect(), A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
    return { left: A.left - o.left, top: A.top - o.top, width: B.right - A.left, height: B.bottom - A.top };
  }
  place(el, b) { if (!b) { el.hidden = true; return; } el.hidden = false; Object.assign(el.style, { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' }); }
  paintSel() {
    const R = this.rect; this.place(this.selBox, this.box(R.r1, R.c1, R.r2, R.c2));
    this.selBox.classList.toggle('multi', R.r1 !== R.r2 || R.c1 !== R.c2); this.fh.hidden = !!this.edit;
    for (const [ref, td] of Object.entries(this.td)) { const p = split(ref); td.classList.toggle('rg', p.c >= R.c1 && p.c <= R.c2 && p.r >= R.r1 && p.r <= R.r2 && ref !== this.act); }
    this.table.querySelectorAll('.xt-ch.on, .xt-rh.on').forEach(e => e.classList.remove('on'));
    for (let c = R.c1; c <= R.c2; c++) { const e = this.table.querySelector('.xt-ch[data-c="' + c + '"]'); if (e) e.classList.add('on'); }
    for (let r = R.r1; r <= R.r2; r++) { const e = this.table.querySelector('.xt-rh[data-r="' + r + '"]'); if (e) e.classList.add('on'); }
    this.nameBox.textContent = this.act;
    if (!this.edit) { const c = this.cells[this.act]; this.fxBox.textContent = c ? c.raw || '' : ''; this.fxBox.classList.toggle('f', !!(c && c.f)); }
    if (this.clip) { const s = this.clip.rect; this.place(this.ants, this.box(s.r1, s.c1, s.r2, s.c2)); } else this.ants.hidden = true;
    if (this.target) { const [a, b] = this.target.split(':'); const A = split(a), B = split(b || a); this.place(this.tgt, A && B ? this.box(A.r, A.c, B.r, B.c) : null); } else this.tgt.hidden = true;
    this.paintRefs();
  }
  paintRefs() {
    this.refLayer.replaceChildren();
    if (!this.edit) return;
    const COL = ['#2563eb', '#dc2626', '#7c3aed', '#059669', '#d97706', '#db2777'];
    refsIn(this.edit.input.value).forEach((x, i) => { const A = split(x.a), B = split(x.b); if (!A || !B) return; const b = this.box(Math.min(A.r, B.r), Math.min(A.c, B.c), Math.max(A.r, B.r), Math.max(A.c, B.c)); if (!b) return; const d = h('div', { class: 'xt-ref' }); d.style.setProperty('--rc', COL[i % COL.length]); this.place(d, b); this.refLayer.append(d); });
  }
  setTarget(t) { this.target = t || null; this.paintSel(); }
  showMsg(t, kind) { this.msg.textContent = t || ''; this.msg.hidden = !t; this.msg.className = 'xt-msg' + (kind ? ' ' + kind : ''); clearTimeout(this._mt); if (t) this._mt = setTimeout(() => { this.msg.hidden = true; }, 4200); }
  focus() { if (this.edit) this.edit.input.focus(); else this.el.focus({ preventScroll: true }); }
  select(ref, anc, how = 'set') {
    this.act = ref; this.anc = anc || ref; this.paintSel();
    const td = this.td[ref]; if (td) { const s = this.scroll, o = s.getBoundingClientRect(), r = td.getBoundingClientRect(); if (r.bottom > o.bottom) s.scrollTop += r.bottom - o.bottom + 4; else if (r.top < o.top + 26) s.scrollTop -= o.top + 26 - r.top; if (r.right > o.right) s.scrollLeft += r.right - o.right + 4; else if (r.left < o.left + 40) s.scrollLeft -= o.left + 40 - r.left; }
    this.emit({ t: 'select', act: this.act, range: this.range, how });
  }
  move(ref, dc, dr) { const p = split(ref); return colL(Math.min(this.cols, Math.max(1, p.c + dc))) + Math.min(this.rows, Math.max(1, p.r + dr)); }
  jump(ref, dc, dr) {
    let { c, r } = split(ref); const ok = (cc, rr) => cc >= 1 && cc <= this.cols && rr >= 1 && rr <= this.rows;
    if (!ok(c + dc, r + dr)) return ref;
    if (this.filled(c, r) && this.filled(c + dc, r + dr)) { while (ok(c + dc, r + dr) && this.filled(c + dc, r + dr)) { c += dc; r += dr; } }
    else { c += dc; r += dr; while (ok(c + dc, r + dr) && !this.filled(c, r)) { c += dc; r += dr; } }
    return colL(c) + r;
  }

  // ---- Bearbeiten ----
  startEdit(initial, mode) {
    if (this.edit) return; const ref = this.act, td = this.td[ref]; const c = this.cells[ref];
    const input = h('input', { class: 'xt-ed', type: 'text', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off' });
    input.value = initial != null ? initial : (c ? c.raw || '' : '');
    this.edit = { ref, input, mode, pt: null };
    td.textContent = ''; td.append(input); td.classList.add('editing');
    input.addEventListener('keydown', e => this.editKey(e));
    input.addEventListener('input', () => { this.edit && (this.edit.pt = null); this.syncEdit(); });
    input.addEventListener('click', () => { if (this.edit) this.edit.pt = null; });
    input.focus(); const n = input.value.length; input.setSelectionRange(n, n);
    this.syncEdit(); this.paintSel(); this.emit({ t: 'edit', ref, mode });
  }
  syncEdit() { if (!this.edit) return; this.fxBox.textContent = this.edit.input.value; this.fxBox.classList.toggle('f', /^[=+]/.test(this.edit.input.value)); this.paintRefs(); }
  endEdit() { const e = this.edit; if (!e) return; this.edit = null; e.input.remove(); this.td[e.ref].classList.remove('editing'); this.render(); this.el.focus({ preventScroll: true }); }
  cancelEdit() { this.endEdit(); this.emit({ t: 'cancel' }); }
  commit(how) {
    const e = this.edit; if (!e) return true; const raw = e.input.value, ref = e.ref;
    if (/^[=+]/.test(raw) && raw.trim().length > 1) {
      const f = toEN(raw); const test = Object.assign({}, this.cells, { [ref]: Object.assign({}, this.cells[ref], { f }) });
      const ec = {}; for (const [k, c] of Object.entries(test)) { if (c.f != null) ec[k] = { f: c.f }; else if (c.v != null && c.v !== '') ec[k] = { v: c.v }; }
      let r; try { r = this.E.evaluate(ec); } catch (er) { r = { values: { [ref]: { error: '#ERROR!' } }, errors: [] }; }
      const v = r.values[ref], unk = (r.errors || []).find(x => x.ref === ref);
      if (unk || (v && v.error === '#ERROR!') || (v && v.error === '#NAME?')) {
        const name = unk && /: (.+)$/.exec(unk.msg); const n = name ? name[1] : '';
        this.showMsg(unk ? (/^(VLOOKUP|SVERWEIS|XLOOKUP|XVERWEIS)$/i.test(n) ? 'SVERWEIS gibt’s im echten Excel – hier im Trainer nimmst du INDEX & VERGLEICH (kommt in Stufe 3).' : `„${n}“ kennt Excel nicht – vertippt?`) : 'Die Formel kann Excel so nicht lesen – fehlt eine Klammer, ein Semikolon oder ein Rechenzeichen?', 'bad');
        this.emit({ t: 'badformula', ref, raw }); return false;
      }
    }
    this.snap();
    const before = this.cells[ref] && this.cells[ref].fmt;
    this.setRawIn(ref, raw);
    const c = this.cells[ref];
    if (c && c.f && !before) { const first = (c.f.match(/\$?[A-Z]{1,2}\$?\d+/) || [])[0]; const fc = first && this.cells[first.replace(/\$/g, '')]; if (fc && fc.fmt === 'eur') c.fmt = 'eur'; }
    this.endEdit(); this.recalc();
    this.emit({ t: 'commit', ref, raw, how, f: this.fx(ref) });
    return true;
  }
  canPoint() { const e = this.edit; if (!e) return false; const v = e.input.value; if (!/^[=+]/.test(v)) return false; if (e.pt) return true; const i = e.input.selectionStart; if (i !== e.input.selectionEnd) return false; return /[=+\-*/^(;:<>&,]$/.test(v.slice(0, i)); }
  pointTo(ref, extend) {
    const e = this.edit, inp = e.input; let s, en;
    if (e.pt) { s = e.pt.s; en = e.pt.e; } else { s = en = inp.selectionStart; e.pt = { a: ref, c: ref }; }
    if (!extend) e.pt.a = ref; e.pt.c = ref;
    const txt = e.pt.a === ref ? ref : (() => { const A = split(e.pt.a), B = split(ref); return colL(Math.min(A.c, B.c)) + Math.min(A.r, B.r) + ':' + colL(Math.max(A.c, B.c)) + Math.max(A.r, B.r); })();
    inp.value = inp.value.slice(0, s) + txt + inp.value.slice(en); e.pt.s = s; e.pt.e = s + txt.length; inp.setSelectionRange(e.pt.e, e.pt.e); inp.focus();
    this.syncEdit(); this.emit({ t: 'point', ref: e.ref, to: txt });
  }
  editKey(e) {
    const ed = this.edit; if (!ed) return; const k = e.key;
    if (k === 'Enter') { e.preventDefault(); if (this.commit('enter')) this.select(this.move(ed.ref, 0, e.shiftKey ? -1 : 1), null, 'key'); return; }
    if (k === 'Tab') { e.preventDefault(); if (this.commit('tab')) this.select(this.move(ed.ref, e.shiftKey ? -1 : 1, 0), null, 'key'); return; }
    if (k === 'Escape') { e.preventDefault(); this.cancelEdit(); return; }
    if (k === 'F4' || (MAC && e.metaKey && k.toLowerCase() === 't' && false)) { e.preventDefault(); const r = toggleAbs(ed.input.value, ed.input.selectionStart); if (r) { ed.input.value = r.text; ed.input.setSelectionRange(r.caret, r.caret); ed.pt = null; this.syncEdit(); this.emit({ t: 'f4', ref: ed.ref }); } return; }
    const D = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[k];
    if (D) {
      if (this.canPoint()) { e.preventDefault(); const from = ed.pt ? ed.pt.c : ed.ref; this.pointTo(this.move(from, D[0], D[1]), e.shiftKey); return; }
      if (ed.mode === 'enter') { e.preventDefault(); if (this.commit('arrow')) this.select(this.move(ed.ref, D[0], D[1]), null, 'key'); return; }
    }
  }

  // ---- Aktionen ----
  cellsIn(R) { const out = []; for (let r = R.r1; r <= R.r2; r++) for (let c = R.c1; c <= R.c2; c++) out.push(colL(c) + r); return out; }
  copyCell(src, dst) {
    const s = this.cells[src], S = split(src), D = split(dst); if (!D || D.c > this.cols || D.r > this.rows) return;
    if (!s) { const d = this.cells[dst]; if (d) { delete d.f; delete d.v; d.raw = ''; if (!d.fmt && !d.b) delete this.cells[dst]; } return; }
    const n = JSON.parse(JSON.stringify(s)); if (n.f != null) { n.f = shiftF(n.f, D.r - S.r, D.c - S.c); n.raw = toDE(n.f); }
    this.cells[dst] = n;
  }
  fillDown() {
    const R = this.rect; this.snap();
    if (R.r1 === R.r2) { if (R.r1 === 1) return; for (let c = R.c1; c <= R.c2; c++) this.copyCell(colL(c) + (R.r1 - 1), colL(c) + R.r1); }
    else for (let c = R.c1; c <= R.c2; c++) for (let r = R.r1 + 1; r <= R.r2; r++) this.copyCell(colL(c) + R.r1, colL(c) + r);
    this.recalc(); this.emit({ t: 'filldown', range: this.range });
  }
  fillRight() {
    const R = this.rect; this.snap();
    if (R.c1 === R.c2) { if (R.c1 === 1) return; for (let r = R.r1; r <= R.r2; r++) this.copyCell(colL(R.c1 - 1) + r, colL(R.c1) + r); }
    else for (let r = R.r1; r <= R.r2; r++) for (let c = R.c1 + 1; c <= R.c2; c++) this.copyCell(colL(R.c1) + r, colL(c) + r);
    this.recalc(); this.emit({ t: 'fillright', range: this.range });
  }
  // Ausfüllkästchen: Muster wiederholen, bei reinen Zahlen ab 2 Zellen eine Reihe fortsetzen
  fillTo(R, dir, to, how) {
    this.snap();
    if (dir === 'down') for (let c = R.c1; c <= R.c2; c++) {
      const hgt = R.r2 - R.r1 + 1, src = []; for (let r = R.r1; r <= R.r2; r++) src.push(this.cells[colL(c) + r]);
      const series = hgt >= 2 && src.every(x => x && x.f == null && typeof x.v === 'number');
      for (let r = R.r2 + 1; r <= to; r++) { if (series) { const st = (src[hgt - 1].v - src[0].v) / (hgt - 1); const v = src[hgt - 1].v + st * (r - R.r2); this.cells[colL(c) + r] = Object.assign({}, src[hgt - 1], { v: +v.toFixed(10), raw: String(+v.toFixed(10)).replace('.', ',') }); } else this.copyCell(colL(c) + (R.r1 + ((r - R.r1) % hgt)), colL(c) + r); }
    }
    else for (let r = R.r1; r <= R.r2; r++) {
      const wd = R.c2 - R.c1 + 1, src = []; for (let c = R.c1; c <= R.c2; c++) src.push(this.cells[colL(c) + r]);
      const series = wd >= 2 && src.every(x => x && x.f == null && typeof x.v === 'number');
      for (let c = R.c2 + 1; c <= to; c++) { if (series) { const st = (src[wd - 1].v - src[0].v) / (wd - 1); const v = src[wd - 1].v + st * (c - R.c2); this.cells[colL(c) + r] = Object.assign({}, src[wd - 1], { v: +v.toFixed(10), raw: String(+v.toFixed(10)).replace('.', ',') }); } else this.copyCell(colL(R.c1 + ((c - R.c1) % wd)) + r, colL(c) + r); }
    }
    const a = colL(R.c1) + R.r1, b = dir === 'down' ? colL(R.c2) + to : colL(to) + R.r2;
    this.anc = a; this.act = b; this.recalc(); this.emit({ t: how, range: this.range });
  }
  fillDbl() {
    const R = this.rect; let side = R.c1 > 1 && this.filled(R.c1 - 1, R.r2 + 1) ? R.c1 - 1 : R.c2 < this.cols && this.filled(R.c2 + 1, R.r2 + 1) ? R.c2 + 1 : 0;
    if (!side) { this.showMsg('Doppelklick füllt bis zum Ende der Daten in der Spalte daneben – da ist gerade keine.', ''); return; }
    let end = R.r2; while (end + 1 <= this.rows && this.filled(side, end + 1)) end++;
    const keepA = colL(R.c1) + R.r1; this.fillTo(R, 'down', end, 'filldbl'); this.anc = keepA; this.select(colL(R.c2) + end, keepA, 'fill');
  }
  copy(cut) { const R = this.rect; this.clip = { rect: R, cut: !!cut, data: this.cellsIn(R).map(ref => [ref, this.cells[ref] ? JSON.parse(JSON.stringify(this.cells[ref])) : null]) }; this.paintSel(); this.emit({ t: cut ? 'cut' : 'copy', range: this.range }); }
  paste() {
    const C = this.clip; if (!C) { this.showMsg('Erst kopieren (' + (MAC ? '⌘' : 'Strg') + ' + C), dann einfügen.', ''); return; }
    const R = this.rect, h0 = C.rect.r2 - C.rect.r1 + 1, w0 = C.rect.c2 - C.rect.c1 + 1;
    const th = (R.r2 - R.r1 + 1) % h0 === 0 ? R.r2 - R.r1 + 1 : h0, tw = (R.c2 - R.c1 + 1) % w0 === 0 ? R.c2 - R.c1 + 1 : w0;
    this.snap(); const map = Object.fromEntries(C.data);
    for (let i = 0; i < th; i++) for (let j = 0; j < tw; j++) {
      const sr = C.rect.r1 + (i % h0), sc = C.rect.c1 + (j % w0), src = colL(sc) + sr, dst = colL(R.c1 + j) + (R.r1 + i); if (R.c1 + j > this.cols || R.r1 + i > this.rows) continue;
      const s = map[src]; if (!s) { delete this.cells[dst]; continue; }
      const n = JSON.parse(JSON.stringify(s)); if (n.f != null && !C.cut) { n.f = shiftF(n.f, R.r1 + i - sr, R.c1 + j - sc); n.raw = toDE(n.f); } this.cells[dst] = n;
    }
    if (C.cut) { for (const [ref] of C.data) { const p = split(ref); if (p.r < R.r1 || p.r >= R.r1 + th || p.c < R.c1 || p.c >= R.c1 + tw) delete this.cells[ref]; } this.clip = null; }
    this.anc = colL(R.c1) + R.r1; this.act = colL(Math.min(this.cols, R.c1 + tw - 1)) + Math.min(this.rows, R.r1 + th - 1);
    this.recalc(); this.emit({ t: 'paste', range: this.range });
  }
  clear() { const R = this.rect; this.snap(); const refs = this.cellsIn(R); refs.forEach(ref => { const c = this.cells[ref]; if (!c) return; delete c.f; delete c.v; c.raw = ''; if (!c.fmt && !c.b) delete this.cells[ref]; }); this.recalc(); this.emit({ t: 'clear', refs }); }
  format(fmt) { this.snap(); this.cellsIn(this.rect).forEach(ref => { const c = this.cells[ref] || (this.cells[ref] = { raw: '' }); c.fmt = fmt; }); this.recalc(); this.emit({ t: 'fmt', fmt, range: this.range }); }
  toggleBold() { this.snap(); const on = !this.bold(this.act); this.cellsIn(this.rect).forEach(ref => { const c = this.cells[ref] || (this.cells[ref] = { raw: '' }); c.b = on; }); this.recalc(); this.emit({ t: 'bold', on, range: this.range }); }
  autosum() {
    const p = split(this.act); let r = p.r - 1; const num = (c, rr) => { const x = this.cells[colL(c) + rr]; const v = x ? (x.f != null ? this.values[colL(c) + rr] : x.v) : undefined; return typeof v === 'number'; };
    let txt = '=SUMME()', a = null, b = null;
    if (r >= 1 && num(p.c, r)) { const end = r; while (r - 1 >= 1 && num(p.c, r - 1)) r--; a = colL(p.c) + r; b = colL(p.c) + end; }
    else { let c = p.c - 1; if (c >= 1 && num(c, p.r)) { const end = c; while (c - 1 >= 1 && num(c - 1, p.r)) c--; a = colL(c) + p.r; b = colL(end) + p.r; } }
    this.emit({ t: 'autosum', ref: this.act });
    if (a) { txt = '=SUMME(' + a + ':' + b + ')'; this.startEdit(txt, 'enter'); const s = 7, e = 7 + (a + ':' + b).length; this.edit.pt = { a, c: b, s, e }; this.edit.input.setSelectionRange(e, e); this.paintRefs(); }
    else { this.startEdit(txt, 'enter'); this.edit.input.setSelectionRange(7, 7); }
  }

  // ---- Eingaben ----
  bind() {
    const el = this.el;
    el.addEventListener('keydown', e => { if (this.edit || e.target !== el) return; this.navKey(e); });
    // Maus/Touch: markieren, Bereich ziehen, beim Formel-Tippen zeigen
    let drag = null;
    const cellAt = (x, y) => { const t = document.elementFromPoint(x, y); const td = t && t.closest && t.closest('td[data-ref]'); return td && this.inner.contains(td) ? td.dataset.ref : null; };
    this.inner.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      if (e.target === this.fh) { e.preventDefault(); drag = { fill: true, R: this.rect, id: e.pointerId }; return; }
      const td = e.target.closest('td[data-ref]'); if (!td) return; const ref = td.dataset.ref;
      if (this.edit) {
        if (ref === this.edit.ref) return;
        if (this.canPoint() || (this.edit.pt)) { e.preventDefault(); this.pointTo(ref, e.shiftKey && !!this.edit.pt); drag = { point: true, id: e.pointerId }; this.emit({ t: 'pointclick', ref: this.edit.ref }); return; }
        if (!this.commit('click')) { e.preventDefault(); return; }
      }
      e.preventDefault();
      if (e.pointerType === 'touch' && ref === this.act && !e.shiftKey) { this.startEdit(null, 'edit'); return; }
      this.select(ref, e.shiftKey ? this.anc : ref, 'mouse'); drag = { sel: true, id: e.pointerId }; el.focus({ preventScroll: true });
    });
    addEventListener('pointermove', e => {
      if (!drag || !this.el.isConnected) return; const ref = cellAt(e.clientX, e.clientY); if (!ref) return;
      if (drag.sel && ref !== this.act) { this.act = ref; this.paintSel(); }
      else if (drag.point && this.edit && this.edit.pt && this.edit.pt.c !== ref) this.pointTo(ref, true);
      else if (drag.fill) { const P = split(ref), R = drag.R; const dn = P.r - R.r2, rt = P.c - R.c2; if (dn > 0 && dn >= rt) { drag.to = { dir: 'down', to: P.r }; this.place(this.prev, this.box(R.r1, R.c1, P.r, R.c2)); } else if (rt > 0) { drag.to = { dir: 'right', to: P.c }; this.place(this.prev, this.box(R.r1, R.c1, R.r2, P.c)); } else { drag.to = null; this.prev.hidden = true; } }
    });
    addEventListener('pointerup', () => {
      if (!drag) return; const d = drag; drag = null; this.prev.hidden = true;
      if (d.sel) this.emit({ t: 'select', act: this.act, range: this.range, how: 'mouse' });
      if (d.fill && d.to) { this.fillTo(d.R, d.to.dir, d.to.to, 'fillhandle'); this.el.focus({ preventScroll: true }); }
    });
    this.fh.addEventListener('dblclick', e => { e.preventDefault(); this.fillDbl(); this.el.focus({ preventScroll: true }); });
    this.inner.addEventListener('dblclick', e => { if (e.target === this.fh) return; const td = e.target.closest('td[data-ref]'); if (!td || this.edit) return; this.select(td.dataset.ref, null, 'mouse'); this.startEdit(null, 'edit'); });
    this.fxBox.addEventListener('click', () => { if (!this.edit) this.startEdit(null, 'edit'); });
  }
  navKey(e) {
    const k = e.key, mod = e.ctrlKey || e.metaKey, lk = k.length === 1 ? k.toLowerCase() : k;
    const D = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[k];
    const stop = () => { e.preventDefault(); e.stopPropagation(); };
    if (D) { stop(); const to = mod ? this.jump(this.act, D[0], D[1]) : this.move(this.act, D[0], D[1]); this.select(to, e.shiftKey ? this.anc : to, mod ? 'jump' : 'key'); return; }
    if (mod && e.shiftKey && (e.code === 'Digit4' || e.code === 'Digit5' || e.code === 'Digit1')) { stop(); this.format(e.code === 'Digit4' ? 'eur' : e.code === 'Digit5' ? 'pct' : 'num'); return; }
    if ((e.altKey && (e.code === 'Equal' || k === '=' || k === '≠')) || (mod && e.shiftKey && lk === 't')) { stop(); this.autosum(); return; }
    if (mod && !e.altKey && !e.shiftKey) {
      if (lk === 'c') { stop(); this.copy(false); return; } if (lk === 'x') { stop(); this.copy(true); return; } if (lk === 'v') { stop(); this.paste(); return; }
      if (lk === 'z') { stop(); this.undo(); return; } if (lk === 'd') { stop(); this.fillDown(); return; } if (lk === 'r') { stop(); this.fillRight(); return; }
      if (lk === 'b') { stop(); this.toggleBold(); return; } if (k === 'Home') { stop(); this.select('A1', null, 'jump'); return; }
      if (MAC && e.ctrlKey && lk === 'u') { stop(); this.startEdit(null, 'edit'); return; }
      return;
    }
    if (k === 'F2') { stop(); this.startEdit(null, 'edit'); return; }
    if (k === 'Enter') { stop(); this.select(this.move(this.act, 0, e.shiftKey ? -1 : 1), null, 'key'); return; }
    if (k === 'Tab') { stop(); this.select(this.move(this.act, e.shiftKey ? -1 : 1, 0), null, 'key'); return; }
    if (k === 'Delete' || k === 'Backspace') { stop(); this.clear(); return; }
    if (k === 'Escape') { stop(); if (this.clip) { this.clip = null; this.paintSel(); } return; }
    if (k === 'Home') { stop(); this.select('A' + split(this.act).r, null, 'key'); return; }
    if (k.length === 1 && !e.altKey) { stop(); this.startEdit(k, 'enter'); return; }
  }
}
