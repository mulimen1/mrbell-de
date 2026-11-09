// Excel-Vorlagen als eigenständige Werkzeugseiten (tutor/tools/excel-vorlage-<id>.html).
// Quelle des Seitenskripts – gebündelt von tutor/tools/xl-build.mjs nach tutor/tools/xl/xl-<hash>.js.
// Nutzt dieselben Vorlagen und dieselbe Rechen-/Export-Logik wie die App (tutor/js/xl/*), aber KEIN App-JS:
// kein Konto, kein Limit, keine Weiterleitung. Rechenmodul (/tutor/vendor/xlcalc@2.mjs) und ExcelJS (/tutor/vendor/exceljs@4.4.0) laden lokal nach.
import { calc, engine, toXlsx, download, show, deFormula, colL, split, bounds, labelOf, sortRefs, FMT } from '../../js/xl/core.js';
import { byId } from '../../js/xl/templates.js';

const BMW = window.BMW || { meldung: t => console.log(t) };
const meldung = t => BMW.meldung(t);

function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k === 'text') e.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : String(c));
  return e;
}
const IC = {
  dl: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>',
  reset: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 1.5h8.3l5.3 5.3v13.7a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#1D6F42"/><path d="M14.5 1.5v3.6a1.7 1.7 0 0 0 1.7 1.7h3.6z" fill="#8fd1ac"/><path d="M8 11.5h8M8 14.5h8M8 17.5h8M11 10v9" stroke="#fff" stroke-width="1.3" fill="none"/></svg>'
};

// Zahl für das Eingabefeld (ohne Tausenderpunkte, Prozent als Prozentwert) – wie in der App
function rawOf(v, fmt) {
  if (typeof v !== 'number') return v == null ? '' : String(v);
  if (fmt && fmt.startsWith('pct')) return String(+(v * 100).toFixed(6)).replace('.', ',') + ' %';
  return String(+v.toFixed(6)).replace('.', ',');
}
// Eingabe lesen: 50.000 | 50000,5 | 8 % | 0,08 | 1.200,50 € → Zahl ; Text bleibt Text ; leer → null bei leeren Feldern, sonst 0
function parseIn(s, fmt, old, wasNull) {
  s = String(s || '').trim();
  if (fmt === 'txt' || typeof old === 'string') return s;
  if (!s) return wasNull ? '' : 0;
  const pct = /%/.test(s);
  let t = s.replace(/[€\s ]|Stück|Jahre|EUR/gi, '').replace(/%/g, '').replace(/[−–]/g, '-');
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d+(,\d+)?$/.test(t)) t = t.replace(',', '.');
  else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '');
  if (!/^-?\d*\.?\d+(e-?\d+)?$/i.test(t)) return null;
  let n = parseFloat(t); if (!isFinite(n)) return null;
  if (fmt && fmt.startsWith('pct') && (pct || Math.abs(n) > 1)) n = n / 100;
  return n;
}
// Grenzen wie in der Datei (Datenüberprüfung): ganze Zahlen runden, min/max einhalten
function clampVal(x, n) {
  let nv = n, msg = '';
  if (typeof nv !== 'number') return { nv, msg };
  if (x.fmt === 'int' || x.fmt === 'stk' || x.int) nv = Math.round(nv);
  if (x.min != null && nv < x.min) { nv = x.min; msg = 'Mindestens ' + show(x.min, x.fmt) + ' – Wert angepasst.'; }
  if (x.max != null && nv > x.max) { nv = x.max; msg = 'Höchstens ' + show(x.max, x.fmt) + ' – Wert angepasst.'; }
  return { nv, msg };
}

// Beschriftung der Ergebnis-Kacheln: Zeilenbeschriftung, bei Mehrdeutigkeit mit Spaltenkopf
// (z. B. „Rentabilität – Anlage A“, „EBIT – Marge (vom Umsatz)“); gleich in tools/xl-build.mjs (statische Seite)
function keyLabels(cells, values, keys) {
  const txt = ref => { const x = cells[ref]; if (!x) return ''; const v = x.f != null ? values[ref] : x.v; return v == null || typeof v === 'object' ? '' : String(v).trim(); };
  const info = keys.map(k => {
    const p = split(k), a = cells['A' + p.r], av = a && a.s !== 'sec' ? txt('A' + p.r) : '';
    let base = String(labelOf(cells, k) || k), fb = /\(Zeile \d+\)$/.test(base);
    if (av && (fb || base !== av)) { fb = true; base = av; }
    let hd = '', n = 0;
    for (let r = p.r - 1; r >= 1; r--) { const x = cells[colL(p.c) + r]; if (x && x.s === 'th') { hd = txt(colL(p.c) + r); break; } }
    for (let c = 2; c <= 40; c++) { const x = cells[colL(c) + p.r]; if (x && (x.f != null || typeof x.v === 'number')) n++; }
    return { p, base: base.replace(/^[=+−\-–]\s+/, ''), hd, fb, tab: n >= 2 };
  });
  return info.map(o => {
    const dup = info.filter(q => q.base === o.base).length > 1;
    return o.hd && !/^(Betrag|Wert)$/.test(o.hd) && o.hd !== o.base && (dup || o.fb || (o.p.c > 2 && o.tab)) ? o.base + ' – ' + o.hd : o.base;
  });
}

function sheetView(t, mount) {
  const spec = t.build();
  const base = JSON.parse(JSON.stringify(spec.cells));
  let cells = JSON.parse(JSON.stringify(spec.cells)), values = {}, sel = null, seq = 0;
  const { rows, cols } = bounds(cells);
  const nameBox = h('span', { class: 'xl-nb', 'aria-label': 'Zelle' }, 'A1'), fxBox = h('span', { class: 'xl-fx' });
  const keyRow = h('div', { class: 'xl-keys', 'aria-live': 'polite' });
  const tableWrap = h('div', { class: 'xl-scroll', tabindex: '0', 'aria-label': 'Tabellenblatt ' + (spec.name || 'Rechnung') });
  const exWrap = h('div', { class: 'xl-scroll xl-exs', hidden: true, tabindex: '0', 'aria-label': 'So rechnet die Datei' });
  const chartBox = spec.chart ? h('div', { class: 'xl-chart' }) : null;
  const tdOf = {};
  const span = {}, covered = new Set();
  (spec.merges || []).forEach(m => { const [a, b] = m.split(':'); const A = split(a), B = split(b); if (!A || !B) return; span[a] = { cs: B.c - A.c + 1, rs: B.r - A.r + 1 }; for (let r = A.r; r <= B.r; r++) for (let c = A.c; c <= B.c; c++) if (r !== A.r || c !== A.c) covered.add(colL(c) + r); });
  const widths = (spec.cols || []).map(w => Math.max(54, Math.round(w * 7.4)));
  const table = h('table', { class: 'xl-t' });
  const cg = h('colgroup', {}, h('col', { style: { width: '42px' } }), [...Array(cols)].map((_, k) => h('col', { style: { width: (widths[k] || 110) + 'px' } })));
  const thead = h('tr', {}, h('th', { class: 'xl-corner', scope: 'col' }, h('span', { class: 'xlw-sr' }, 'Zeile')), [...Array(cols)].map((_, k) => h('th', { class: 'xl-ch', scope: 'col', 'data-c': k + 1 }, colL(k + 1))));
  const tb = h('tbody');
  const isNullIn = {};
  for (let r = 1; r <= rows; r++) {
    const tr = h('tr', {}, h('th', { class: 'xl-rh', scope: 'row', 'data-r': r }, String(r)));
    for (let c = 1; c <= cols; c++) {
      const ref = colL(c) + r; if (covered.has(ref)) continue;
      const x = cells[ref] || {}, sp = span[ref] || {};
      const td = h('td', { class: 'xs-' + (x.s || 'empty') + (x.fmt && x.fmt !== 'txt' && ['in', 'out', 'res', 'tot'].includes(x.s) ? ' num' : ''), colspan: sp.cs > 1 ? sp.cs : null, rowspan: sp.rs > 1 ? sp.rs : null, 'data-ref': ref });
      if (x.s === 'in') {
        isNullIn[ref] = x.v == null;
        const inp = h('input', { class: 'xl-in', type: 'text', inputmode: x.fmt === 'txt' || typeof x.v === 'string' ? 'text' : 'decimal', 'aria-label': (labelOf(cells, ref) || ref) + ' (Zelle ' + ref + ')', spellcheck: 'false', autocomplete: 'off', 'data-bmw-nicht': '1' });
        inp.addEventListener('focus', () => { select(ref); inp.value = rawOf(cells[ref].v, x.fmt); inp.select(); });
        inp.addEventListener('input', () => live(ref, inp));
        inp.addEventListener('blur', () => commit(ref, inp));
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); moveNext(ref); } else if (e.key === 'Escape') { inp.value = rawOf(cells[ref].v, x.fmt); inp.blur(); } });
        td.append(inp);
      }
      td.addEventListener('mousedown', () => select(ref));
      tdOf[ref] = td; tr.append(td);
    }
    tb.append(tr);
  }
  table.append(cg, h('thead', {}, thead), tb);
  tableWrap.append(table);
  const inputs = sortRefs(Object.keys(cells).filter(k => cells[k].s === 'in'));
  function moveNext(ref) { const i = inputs.indexOf(ref); const n = inputs[i + 1]; if (n) { const el = tdOf[n] && tdOf[n].querySelector('input'); if (el) el.focus(); } }
  function select(ref) {
    if (sel && tdOf[sel]) tdOf[sel].classList.remove('sel'); sel = ref; if (tdOf[ref]) tdOf[ref].classList.add('sel');
    const p = split(ref); table.querySelectorAll('.xl-ch.on, .xl-rh.on').forEach(e => e.classList.remove('on'));
    const ch = table.querySelector('.xl-ch[data-c="' + p.c + '"]'), rh = table.querySelector('.xl-rh[data-r="' + p.r + '"]'); if (ch) ch.classList.add('on'); if (rh) rh.classList.add('on');
    nameBox.textContent = ref; const x = cells[ref];
    fxBox.textContent = !x ? '' : x.f != null ? deFormula(x.f) : x.v == null ? '' : typeof x.v === 'number' ? rawOf(x.v, x.fmt) : String(x.v);
    fxBox.classList.toggle('isf', !!(x && x.f != null));
  }
  function setVal(ref, v) { const x = cells[ref]; if (v === '' && isNullIn[ref]) v = null; if (v === x.v) return false; x.v = v; return true; }
  // beim Tippen sofort rechnen (ohne das Feld umzuformatieren)
  let tLive = 0;
  function live(ref, inp) {
    const x = cells[ref]; const v = parseIn(inp.value, x.fmt, x.v, isNullIn[ref]);
    inp.classList.toggle('bad', v === null); inp.setAttribute('aria-invalid', v === null ? 'true' : 'false');
    if (v === null) return;
    const { nv } = clampVal(x, v);
    clearTimeout(tLive); tLive = setTimeout(() => { if (setVal(ref, nv)) recalc(true); }, 220);
  }
  function commit(ref, inp) {
    clearTimeout(tLive);
    const x = cells[ref], v = parseIn(inp.value, x.fmt, x.v, isNullIn[ref]);
    if (v === null) { inp.classList.add('bad'); meldung('Das ist keine Zahl – bitte z. B. 50.000 oder 8 % eingeben. Der vorige Wert bleibt stehen.'); setTimeout(() => inp.classList.remove('bad'), 1400); }
    else { const { nv, msg } = clampVal(x, v); if (msg) meldung(msg); if (setVal(ref, nv)) recalc(true); }
    inp.removeAttribute('aria-invalid');
    inp.value = show(x.v, x.fmt);
    if (sel === ref) select(ref);
  }
  const keys = (t.key || []).filter(k => cells[k]);
  async function recalc(flash) {
    const my = ++seq;
    const r = await calc(cells); if (my !== seq) return r;
    const old = values; values = r.values;
    for (const [ref, td] of Object.entries(tdOf)) {
      const x = cells[ref]; if (!x) continue;
      if (x.s === 'in') { const el = td.querySelector('input'); if (el && document.activeElement !== el) el.value = show(x.v, x.fmt); continue; }
      const v = x.f != null ? values[ref] : x.v, txt = show(v, x.fmt);
      if (td.textContent !== txt) { td.textContent = txt; if (flash && x.f != null && old[ref] !== undefined) { td.classList.remove('flash'); void td.offsetWidth; td.classList.add('flash'); } }
      td.classList.toggle('neg', typeof v === 'number' && v < -5e-10 && !!(FMT[x.fmt] && FMT[x.fmt].neg));
      td.classList.toggle('err', !!(v && typeof v === 'object' && v.error));
    }
    const kl = keyLabels(cells, values, keys);
    keyRow.replaceChildren(...keys.map((k, i) => h('div', { class: 'xl-key' }, h('small', {}, kl[i]), h('b', { 'data-key': k }, show(values[k], cells[k].fmt)))));
    // statische Tabellen der Seite (Eingaben, Ergebnisse) mitziehen
    document.querySelectorAll('[data-xv]').forEach(el => { const k = el.getAttribute('data-xv'); if (cells[k]) el.textContent = show(values[k], cells[k].fmt); });
    document.querySelectorAll('[data-xi]').forEach(el => { const k = el.getAttribute('data-xi'); if (cells[k]) el.textContent = cells[k].v == null ? '(leer)' : show(cells[k].v, cells[k].fmt); });
    if (chartBox) drawChart();
    if (!exWrap.hidden) drawExplain();
    return r;
  }
  function drawChart() {
    const ch = spec.chart, vals = rg => { const [a, b] = rg.split(':'); const A = split(a), B = split(b), out = []; for (let r = A.r; r <= B.r; r++) out.push(+values[colL(A.c) + r] || 0); return out; };
    const X = vals(ch.x), S = ch.series.map(([n, rg]) => [n, vals(rg)]); const all = S.flatMap(s => s[1]).concat([0]);
    const mx = Math.max(...all, 1), mn = Math.min(...all), W = 640, H = 220, P = 48, xs = i => P + (W - 2 * P) * i / Math.max(1, X.length - 1), ys = v => H - P + 8 - (H - 2 * P) * (v - mn) / Math.max(1e-9, mx - mn);
    const cols2 = ['var(--xg)', 'var(--xb)', 'var(--xo)'];
    const fmtK = v => Math.abs(mx - mn) >= 3000 ? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(v / 1000) + ' Tsd.' : new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(v);
    const lab = labelOf(cells, ch.x.split(':')[0]) || 'Menge';
    chartBox.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Diagramm: ' + ch.series.map(s => s[0]).join(', ') + ' in Abhängigkeit von ' + lab.replace(/ \(Zeile.*$/, '') + '">' + [0, .25, .5, .75, 1].map(f => { const v = mn + (mx - mn) * f; return '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + ys(v) + '" y2="' + ys(v) + '" stroke="var(--line)"/><text x="' + (P - 6) + '" y="' + (ys(v) + 4) + '" text-anchor="end" font-size="10" fill="var(--muted)">' + fmtK(v) + '</text>'; }).join('')
      + X.map((x, i) => i % 2 ? '' : '<text x="' + xs(i) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="var(--muted)">' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(x) + '</text>').join('')
      + S.map(([n, v], k) => '<polyline fill="none" stroke="' + cols2[k % 3] + '" stroke-width="2.6" stroke-linejoin="round" points="' + v.map((y, i) => xs(i) + ',' + ys(y)).join(' ') + '"/>').join('')
      + '</svg><div class="xl-leg">' + S.map(([n], k) => '<span><i style="background:' + cols2[k % 3] + '"></i>' + n + '</span>').join('') + '<span class="xl-legn">x-Achse: ' + lab.replace(/ \(Zeile.*$/, '') + '</span></div>';
  }
  function drawExplain() {
    const list = sortRefs(Object.keys(cells).filter(k => cells[k].f != null));
    exWrap.replaceChildren(h('table', { class: 'xl-ex' }, h('caption', { class: 'xlw-sr' }, 'Alle Formeln mit aktuellem Ergebnis'), h('thead', {}, h('tr', {}, ['Zelle', 'Was', 'Formel', 'Ergebnis'].map(x => h('th', { scope: 'col' }, x)))),
      h('tbody', {}, list.map(k => h('tr', {}, h('td', { class: 'r' }, k), h('td', {}, labelOf(cells, k), (spec.explain && spec.explain[k]) ? h('small', {}, spec.explain[k]) : null), h('td', { class: 'f' }, deFormula(cells[k].f)), h('td', { class: 'v' }, show(values[k], cells[k].fmt)))))));
  }
  const tabSheet = h('button', { type: 'button', class: 'xl-st on', 'aria-pressed': 'true', onclick: () => setPage('sheet') }, spec.name || 'Rechnung');
  const tabEx = h('button', { type: 'button', class: 'xl-st', 'aria-pressed': 'false', onclick: () => setPage('ex') }, 'So rechnet die Datei');
  function setPage(p) { tabSheet.classList.toggle('on', p === 'sheet'); tabEx.classList.toggle('on', p === 'ex'); tabSheet.setAttribute('aria-pressed', String(p === 'sheet')); tabEx.setAttribute('aria-pressed', String(p === 'ex')); tableWrap.hidden = p !== 'sheet'; exWrap.hidden = p !== 'ex'; if (p === 'ex') drawExplain(); }
  const dlLabel = h('span', {}, 'Excel-Datei herunterladen (.xlsx)');
  const dlBtn = h('button', { type: 'button', class: 'xlw-dl', onclick: () => doDownload() }, h('span', { class: 'xlw-ico', html: IC.dl }), dlLabel);
  // ExcelJS (lokal, ~1 MB) erst vorladen, wenn jemand zum Knopf geht
  let pre = false; const prefetch = () => { if (pre) return; pre = true; const l = document.createElement('link'); l.rel = 'prefetch'; l.href = '/tutor/vendor/exceljs@4.4.0/exceljs.min.js'; document.head.appendChild(l); };
  dlBtn.addEventListener('pointerenter', prefetch); dlBtn.addEventListener('focus', prefetch);
  const resetBtn = h('button', { type: 'button', class: 'xlw-reset', onclick: () => reset() }, h('span', { class: 'xlw-ico', html: IC.reset }), 'Zurücksetzen');
  function reset() { cells = JSON.parse(JSON.stringify(base)); syncInputs(); recalc(true); try { if (/^#b=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); } catch (e) {} meldung('Beispielwerte wiederhergestellt.'); }
  function syncInputs() { for (const ref of inputs) { const el = tdOf[ref] && tdOf[ref].querySelector('input'); if (el) el.value = show(cells[ref].v, cells[ref].fmt); } }
  async function doDownload() {
    dlBtn.disabled = true; const t0 = dlLabel.textContent; dlLabel.textContent = 'Datei wird erstellt …';
    try {
      const r = await recalc(false);
      const blob = await toXlsx({ title: t.title, file: t.file, sheet: Object.assign({}, spec, { cells }), values: r.values, explain: spec.explain });
      download(blob, t.file); meldung('Heruntergeladen: ' + t.file + ' – mit deinen aktuellen Werten.');
    } catch (e) { meldung('Die Datei konnte nicht erstellt werden. Bitte Seite neu laden und nochmal versuchen.'); }
    dlBtn.disabled = false; dlLabel.textContent = t0;
  }
  const win = h('div', { class: 'xl-win' },
    h('div', { class: 'xl-wbar' }, h('span', { class: 'xlw-fi', html: IC.file }), h('b', { class: 'xl-fn' }, t.file), h('span', { class: 'xlw-sp' }), resetBtn, dlBtn),
    h('div', { class: 'xl-fbar' }, nameBox, h('i', { 'aria-hidden': 'true' }, 'fx'), fxBox),
    tableWrap, exWrap,
    h('div', { class: 'xl-tabsb' }, tabSheet, tabEx, h('span', { class: 'xl-hint' }, h('i', { class: 'xl-sw' }), 'Blau = Eingabe · tippen, alles rechnet sofort')));
  mount.replaceChildren(keyRow, win, chartBox || '');
  mount.classList.add('xlw-live');
  // Link teilen: nur geänderte Eingaben stecken im Link (#b=…), nichts wird übertragen
  let api = null;
  if (BMW.teilen) {
    const get = () => { const o = {}; for (const k of inputs) if (JSON.stringify(cells[k].v) !== JSON.stringify(base[k].v)) o[k] = cells[k].v; return o; };
    const set = o => { for (const [k, v] of Object.entries(o || {})) if (cells[k] && cells[k].s === 'in' && (v === null || typeof v === 'number' || typeof v === 'string')) { const x = cells[k]; x.v = typeof v === 'number' ? clampVal(x, v).nv : v; } syncInputs(); recalc(false); };
    api = BMW.teilen({ key: 'xl', root: mount, get, set, run: () => {} });
  }
  engine().then(() => recalc(false)).then(() => select(inputs[0] || 'A1')).catch(() => meldung('Das Rechenmodul konnte nicht geladen werden – bitte Seite neu laden.'));
  return { teilen: api };
}

const root = document.getElementById('xl-app');
const t = root && byId(root.getAttribute('data-id'));
if (t) {
  const v = sheetView(t, root);
  const bar = document.getElementById('xl-leiste');
  if (bar && BMW.leiste) BMW.leiste(bar, { teilen: v.teilen, teilenText: 'Eingaben als Link teilen', drucken: true, druckText: 'Drucken / als PDF' });
}
