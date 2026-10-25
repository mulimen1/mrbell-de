// Excel-Vorlagen & Generator: 10 geprüfte Vorlagen mit echten Formeln (nur blaue Felder ausfüllen)
// und ein Generator, der aus der Aufgabe eine Tabelle baut – jede Formel wird vor dem Download im Browser nachgerechnet.
import { h, ico, toast, ls } from '../util.js';
import { L } from '../i18n.js';
import { getAccount, ask } from '../api.js';
import { TEMPLATES, CATS, byId } from '../xl/templates.js';
import { calc, engine, toXlsx, download, show, deFormula, colL, colN, split, bounds, labelOf, sortRefs, FMT, DE } from '../xl/core.js';

// Eigenes Tabellen-Symbol (kein Microsoft-Logo): grünes Quadrat mit Raster
export const XL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 1.5h8.3l5.3 5.3v13.7a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#1D6F42"/><path d="M14.5 1.5v3.6a1.7 1.7 0 0 0 1.7 1.7h3.6z" fill="#8fd1ac"/><text x="12" y="17.6" text-anchor="middle" font-size="7.4" font-weight="800" fill="#fff" font-family="Arial,Helvetica,sans-serif" letter-spacing="-.2">XLS</text></svg>';
const icoXL = (cls = '') => h('span', { class: 'xl-ic ' + cls, html: XL_ICON });
const DOWNLOAD_NEEDS_ACCOUNT = true;            // Vorschau für alle, Download mit kostenlosem Konto
const GEN_FREE = 3, GEN_PRO = 25;               // Generator: so viele Dateien pro Tag

export function render(root, { arg = '' } = {}) {
  const wrap = h('div', { class: 'view-in xl nomath' }); root.appendChild(wrap);
  const tpl = arg && arg !== 'generator' ? byId(arg) : null;
  const tab = arg === 'generator' ? 'gen' : 'tpl';
  const head = h('header', { class: 'xl-head' },
    h('div', { class: 'eyebrow' }, L('Excel-Helfer · Vorlagen & Generator', 'Excel helper · templates & generator')),
    h('h1', {}, icoXL('big'), L('Fertige Excel-Dateien. Echte Formeln.', 'Ready-made Excel files. Real formulas.')),
    h('p', { class: 'xl-sub' }, L(`Nimm eine der ${TEMPLATES.length} geprüften Vorlagen und trag nur die blauen Felder ein – Excel rechnet den Rest. Oder beschreib deine Aufgabe, und Max baut dir die Datei. Jede Formel wird vorher nachgerechnet.`, `Pick one of ${TEMPLATES.length} checked templates and fill in the blue cells – Excel does the rest. Or describe your task and Max builds the file. Every formula is checked first.`)));
  const tabs = h('div', { class: 'xl-tabs', role: 'tablist' },
    h('a', { class: 'xl-tab' + (tab === 'tpl' ? ' on' : ''), href: '#/app/excel', role: 'tab' }, h('span', { html: ico('library') }), L('Vorlagen', 'Templates'), h('b', {}, String(TEMPLATES.length))),
    h('a', { class: 'xl-tab' + (tab === 'gen' ? ' on' : ''), href: '#/app/excel/generator', role: 'tab' }, h('span', { html: ico('spark') }), L('Generator', 'Generator'), h('b', { class: 'xl-new' }, 'KI')));
  const body = h('div', { class: 'xl-body' });
  wrap.append(head, tabs, body);
  if (tpl) openTemplate(body, tpl);
  else if (tab === 'gen') generator(body);
  else gallery(body);
}

// ---------- Galerie ----------
function gallery(body) {
  let cat = '', q = '';
  const grid = h('div', { class: 'xl-grid' });
  const n = k => TEMPLATES.filter(t => !k || t.cat === k).length;
  const chips = h('div', { class: 'xl-cats' }, [['', L('Alle', 'All')], ...CATS.filter(([k]) => n(k))].map(([k, t]) => h('button', { type: 'button', class: 'chip' + (k === cat ? ' on' : ''), onclick: e => { cat = k; chips.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.currentTarget)); draw(); } }, t, h('small', { class: 'xl-cn' }, String(n(k))))));
  const norm = x => String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const search = h('input', { class: 'xl-search', type: 'search', placeholder: L('Vorlage suchen – z. B. Kapitalwert, BAB, Skonto …', 'Search templates – e.g. NPV, cost centre …'), 'aria-label': L('Vorlage suchen', 'Search templates'), oninput: () => { q = norm(search.value.trim()); draw(); } });
  const empty = h('p', { class: 'xl-empty', hidden: true }, L('Keine Vorlage gefunden – beschreib die Aufgabe einfach dem Generator.', 'No template found – just describe the task to the generator.'));
  const draw = () => {
    const list = TEMPLATES.filter(t => (!cat || t.cat === cat) && (!q || norm(t.title + ' ' + t.desc + ' ' + t.id).includes(q)));
    empty.hidden = !!list.length;
    grid.replaceChildren(...list.map((t, i) => h('a', { class: 'xl-card', href: '#/app/excel/' + t.id, style: { '--d': (Math.min(i, 12) * 40) + 'ms' } },
      thumb(t), h('div', { class: 'xl-cmeta' }, h('span', { class: 'xl-ccat' }, (CATS.find(c => c[0] === t.cat) || [, ''])[1]), h('b', {}, t.title), h('p', {}, t.desc),
        h('span', { class: 'xl-cgo' }, icoXL(), L('Öffnen & ausfüllen', 'Open & fill in'), h('span', { html: ico('right') }))))));
  };
  draw();
  body.append(h('div', { class: 'xl-filter' }, search, chips), grid, empty, h('div', { class: 'xl-genad' }, h('div', {}, h('b', {}, L('Deine Aufgabe ist nicht dabei?', 'Your task isn’t here?')), h('p', {}, L('Beschreib sie dem Generator – Max baut dir eine eigene Excel-Datei mit echten Formeln.', 'Describe it to the generator – Max builds your own Excel file with real formulas.'))), h('a', { class: 'btn xl-btn', href: '#/app/excel/generator' }, h('span', { html: ico('spark') }), L('Zum Generator', 'Open generator'))));
}
// Mini-Tabellenbild für die Karte (aus der echten Vorlage)
function thumb(t) {
  const s = t.build(), { rows, cols } = bounds(s.cells), R = Math.min(rows, 14), C = Math.min(cols, 6);
  const g = h('div', { class: 'xl-thumb', style: { gridTemplateColumns: `repeat(${C}, 1fr)` } });
  for (let r = 3; r <= R; r++) for (let c = 1; c <= C; c++) { const x = s.cells[colL(c) + r]; g.append(h('i', { class: x ? 'k-' + (x.s || 'txt') : '' })); }
  return h('div', { class: 'xl-thw' }, h('div', { class: 'xl-thbar' }, icoXL(), h('span', {}, t.file)), g);
}

// ---------- Vorlage öffnen ----------
function openTemplate(body, t) {
  document.title = t.title + ' · Excel · BWL Max';
  const back = h('a', { class: 'xl-back', href: '#/app/excel' }, h('span', { html: ico('left') }), L('Alle Vorlagen', 'All templates'));
  body.append(back, sheetView(t.build(), { title: t.title, file: t.file, keys: t.key, src: 'Vorlage' }));
}

// ---------- Tabellen-Vorschau (wie Excel, live gerechnet) ----------
export function sheetView(spec, { title, file, keys = [], src = '' }) {
  const base = JSON.parse(JSON.stringify(spec.cells));
  let cells = JSON.parse(JSON.stringify(spec.cells)), values = {}, sel = null, page = 'sheet';
  const { rows, cols } = bounds(cells);
  const nameBox = h('span', { class: 'xl-nb' }, 'A1'), fxBox = h('span', { class: 'xl-fx' });
  const keyRow = h('div', { class: 'xl-keys' });
  const tableWrap = h('div', { class: 'xl-scroll' }), exWrap = h('div', { class: 'xl-scroll xl-exs', hidden: true });
  const chartBox = spec.chart ? h('div', { class: 'xl-chart' }) : null;
  const tdOf = {};
  // Zusammengeführte Zellen
  const span = {}, covered = new Set();
  (spec.merges || []).forEach(m => { const [a, b] = m.split(':'); const A = split(a), B = split(b); if (!A || !B) return; span[a] = { cs: B.c - A.c + 1, rs: B.r - A.r + 1 }; for (let r = A.r; r <= B.r; r++) for (let c = A.c; c <= B.c; c++) if (r !== A.r || c !== A.c) covered.add(colL(c) + r); });
  const widths = (spec.cols || []).map(w => Math.max(54, Math.round(w * 7.4)));
  const table = h('table', { class: 'xl-t' });
  const cg = h('colgroup', {}, h('col', { style: { width: '42px' } }), [...Array(cols)].map((_, k) => h('col', { style: { width: (widths[k] || 110) + 'px' } })));
  const thead = h('tr', {}, h('th', { class: 'xl-corner' }), [...Array(cols)].map((_, k) => h('th', { class: 'xl-ch', 'data-c': k + 1 }, colL(k + 1))));
  const tb = h('tbody');
  for (let r = 1; r <= rows; r++) {
    const tr = h('tr', {}, h('th', { class: 'xl-rh', 'data-r': r }, String(r)));
    for (let c = 1; c <= cols; c++) {
      const ref = colL(c) + r; if (covered.has(ref)) continue;
      const x = cells[ref] || {}, sp = span[ref] || {};
      const td = h('td', { class: 'xs-' + (x.s || 'empty') + (x.fmt && x.fmt !== 'txt' && ['in', 'out', 'res', 'tot'].includes(x.s) ? ' num' : ''), colspan: sp.cs > 1 ? sp.cs : null, rowspan: sp.rs > 1 ? sp.rs : null, 'data-ref': ref });
      if (x.s === 'in') {
        const inp = h('input', { class: 'xl-in', type: 'text', inputmode: x.fmt === 'txt' ? 'text' : 'decimal', 'aria-label': (labelOf(cells, ref) || ref) + ' (' + ref + ')', spellcheck: 'false' });
        inp.addEventListener('focus', () => { select(ref); inp.value = rawOf(cells[ref].v, x.fmt); inp.select(); });
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
  function commit(ref, inp) {
    const x = cells[ref], v = parseIn(inp.value, x.fmt, x.v);
    if (v === null) { inp.classList.add('bad'); setTimeout(() => inp.classList.remove('bad'), 900); toast(L('Das ist keine Zahl – bitte z. B. 50.000 oder 8 % eingeben.', 'That’s not a number – try e.g. 50,000 or 8 %.')); }
    else {
      let nv = v;
      if (typeof nv === 'number') { if (x.fmt === 'int' || x.fmt === 'stk') nv = Math.round(nv); if (x.min != null && nv < x.min) { nv = x.min; toast(L('Mindestens ', 'At least ') + show(x.min, x.fmt)); } if (x.max != null && nv > x.max) { nv = x.max; toast(L('Höchstens ', 'At most ') + show(x.max, x.fmt)); } }
      if (nv !== x.v) { x.v = nv; recalc(true); }
    }
    inp.value = show(x.v, x.fmt);
    if (sel === ref) select(ref);
  }
  async function recalc(flash) {
    const r = await calc(cells); const old = values; values = r.values;
    for (const [ref, td] of Object.entries(tdOf)) {
      const x = cells[ref]; if (!x) continue;
      if (x.s === 'in') { const el = td.querySelector('input'); if (el && document.activeElement !== el) el.value = show(x.v, x.fmt); continue; }
      const v = x.f != null ? values[ref] : x.v, txt = show(v, x.fmt);
      if (td.textContent !== txt) { td.textContent = txt; if (flash && x.f != null && old[ref] !== undefined) { td.classList.remove('flash'); void td.offsetWidth; td.classList.add('flash'); } }
      td.classList.toggle('neg', typeof v === 'number' && v < -5e-10 && FMT[x.fmt] && FMT[x.fmt].neg);
      td.classList.toggle('err', !!(v && typeof v === 'object' && v.error));
    }
    keyRow.replaceChildren(...keys.filter(k => cells[k]).map(k => h('div', { class: 'xl-key' }, h('small', {}, labelOf(cells, k) || k), h('b', {}, show(values[k], cells[k].fmt)))));
    if (chartBox) drawChart();
    return r;
  }
  function drawChart() {
    const ch = spec.chart, vals = rg => { const [a, b] = rg.split(':'); const A = split(a), B = split(b), out = []; for (let r = A.r; r <= B.r; r++) out.push(+values[colL(A.c) + r] || 0); return out; };
    const X = vals(ch.x), S = ch.series.map(([n, rg]) => [n, vals(rg)]); const all = S.flatMap(s => s[1]).concat([0]);
    const mx = Math.max(...all, 1), mn = Math.min(...all), W = 640, H = 220, P = 34, xs = i => P + (W - 2 * P) * i / Math.max(1, X.length - 1), ys = v => H - P - (H - 2 * P) * (v - mn) / Math.max(1e-9, mx - mn);
    const cols2 = ['#1D6F42', '#1F3A5F'];
    chartBox.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Diagramm">' + [0, .25, .5, .75, 1].map(f => { const v = mn + (mx - mn) * f; return '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + ys(v) + '" y2="' + ys(v) + '" stroke="var(--line)"/><text x="' + (P - 6) + '" y="' + (ys(v) + 4) + '" text-anchor="end" font-size="10" fill="var(--mute)">' + Math.round(v / 1000) + 'k</text>'; }).join('')
      + S.map(([n, v], k) => '<polyline fill="none" stroke="' + cols2[k % 2] + '" stroke-width="2.6" stroke-linejoin="round" points="' + v.map((y, i) => xs(i) + ',' + ys(y)).join(' ') + '"/>').join('')
      + '</svg><div class="xl-leg">' + S.map(([n], k) => '<span><i style="background:' + cols2[k % 2] + '"></i>' + n + '</span>').join('') + '<span class="xl-legn">' + L('Schnittpunkt = Break-even', 'Crossing = break-even') + '</span></div>';
  }
  // Zweites Blatt: So rechnet die Datei
  function drawExplain() {
    const list = sortRefs(Object.keys(cells).filter(k => cells[k].f != null));
    exWrap.replaceChildren(h('table', { class: 'xl-ex' }, h('thead', {}, h('tr', {}, ['Zelle', 'Was', 'Formel', 'Ergebnis'].map(t => h('th', {}, t)))),
      h('tbody', {}, list.map(k => h('tr', {}, h('td', { class: 'r' }, k), h('td', {}, labelOf(cells, k), (spec.explain && spec.explain[k]) ? h('small', {}, spec.explain[k]) : null), h('td', { class: 'f' }, deFormula(cells[k].f)), h('td', { class: 'v' }, show(values[k], cells[k].fmt)))))));
  }
  const tabSheet = h('button', { type: 'button', class: 'xl-st on', onclick: () => setPage('sheet') }, spec.name || 'Rechnung');
  const tabEx = h('button', { type: 'button', class: 'xl-st', onclick: () => setPage('ex') }, L('So rechnet die Datei', 'How the file calculates'));
  function setPage(p) { page = p; tabSheet.classList.toggle('on', p === 'sheet'); tabEx.classList.toggle('on', p === 'ex'); tableWrap.hidden = p !== 'sheet'; exWrap.hidden = p !== 'ex'; if (p === 'ex') drawExplain(); }
  const dlBtn = h('button', { type: 'button', class: 'btn xl-dl', onclick: () => doDownload() }, h('span', { html: ico('download') }), L('Herunterladen (.xlsx)', 'Download (.xlsx)'));
  const resetBtn = h('button', { type: 'button', class: 'btn ghost', onclick: () => { cells = JSON.parse(JSON.stringify(base)); recalcInputs(); recalc(true); toast(L('Beispielwerte wiederhergestellt', 'Example values restored')); } }, h('span', { html: ico('refresh') }), L('Zurücksetzen', 'Reset'));
  function recalcInputs() { for (const ref of inputs) { const el = tdOf[ref] && tdOf[ref].querySelector('input'); if (el) el.value = show(cells[ref].v, cells[ref].fmt); } }
  async function doDownload() {
    if (DOWNLOAD_NEEDS_ACCOUNT && !getAccount()) {
      const { openAuth } = await import('../account.js');
      await openAuth({ registerTitle: L('Excel-Datei kostenlos herunterladen', 'Download the Excel file for free'), registerSub: L('Mit kostenlosem Konto lädst du alle Vorlagen herunter – dauert 20 Sekunden.', 'With a free account you can download every template – takes 20 seconds.'), title: L('Anmelden zum Herunterladen', 'Sign in to download') });
      if (!getAccount()) return;
    }
    dlBtn.disabled = true; const t0 = dlBtn.lastChild.textContent; dlBtn.lastChild.textContent = L('Datei wird gebaut …', 'Building file …');
    try {
      const r = await recalc(false);
      const blob = await toXlsx({ title, file, sheet: Object.assign({}, spec, { cells }), values: r.values, explain: spec.explain });
      download(blob, file); toast(L('Excel-Datei ist heruntergeladen ✓', 'Excel file downloaded ✓'));
      try { if (window.BM) window.BM.track('Excel heruntergeladen', src || 'Vorlage'); } catch (e) {}
    } catch (e) { toast(L('Das Herunterladen hat nicht geklappt. Bitte nochmal versuchen.', 'Download failed. Please try again.')); }
    dlBtn.disabled = false; dlBtn.lastChild.textContent = t0;
  }
  const win = h('div', { class: 'xl-win' },
    h('div', { class: 'xl-wbar' }, icoXL(), h('b', {}, file), src ? h('span', { class: 'xl-src' }, src) : null, h('span', { style: { flex: 1 } }), resetBtn, dlBtn),
    h('div', { class: 'xl-fbar' }, nameBox, h('i', {}, 'fx'), fxBox),
    tableWrap, exWrap,
    h('div', { class: 'xl-tabsb' }, tabSheet, tabEx, h('span', { class: 'xl-hint' }, h('i', { class: 'xl-sw' }), L('Blau = deine Eingabe · tipp rein, alles rechnet live', 'Blue = your input · type and everything recalculates'))));
  const el = h('div', { class: 'xl-view' }, keyRow, win, chartBox);
  engine().then(() => recalc(false)).then(() => select(inputs[0] || 'A1')).catch(() => toast(L('Rechenmodul konnte nicht geladen werden.', 'Could not load the calculation module.')));
  return el;
}
// Zahl für das Eingabefeld (ohne Tausenderpunkte, Prozent als Prozentwert)
function rawOf(v, fmt) {
  if (typeof v !== 'number') return v == null ? '' : String(v);
  if (fmt && fmt.startsWith('pct')) return String(+(v * 100).toFixed(6)).replace('.', ',') + ' %';
  return String(+v.toFixed(6)).replace('.', ',');
}
// Eingabe lesen: 50.000 | 50000,5 | 8 % | 0,08 | 1.200,50 € → Zahl ; Text bleibt Text
function parseIn(s, fmt, old) {
  s = String(s || '').trim();
  if (fmt === 'txt' || typeof old === 'string') return s;
  if (!s) return 0;
  const pct = /%/.test(s);
  let t = s.replace(/[€\s]|Stück|Jahre|EUR/gi, '').replace(/%/g, '');
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d+(,\d+)?$/.test(t)) t = t.replace(',', '.');
  else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '');
  if (!/^-?\d*\.?\d+(e-?\d+)?$/i.test(t)) return null;
  let n = parseFloat(t); if (!isFinite(n)) return null;
  if (fmt && fmt.startsWith('pct') && (pct || Math.abs(n) > 1)) n = n / 100;
  return n;
}

// ---------- Generator ----------
const EXAMPLES = [
  L('Investition: Anschaffung 120.000 €, Laufzeit 6 Jahre, Rückflüsse 25.000 € pro Jahr, Restwert 10.000 €, Kalkulationszins 7 %. Kapitalwert, interner Zinsfuß und Annuität.', 'Investment: 120,000 € cost, 6 years, 25,000 € inflows per year, 10,000 € salvage value, 7 % rate. NPV, IRR and annuity.'),
  L('Kredit über 25.000 € mit 6,5 % Zinsen und 60 Monatsraten – Tilgungsplan pro Monat, Gesamtzinsen.', 'Loan of 25,000 € at 6.5 % with 60 monthly payments – monthly schedule, total interest.'),
  L('Plankostenrechnung: Plankosten 80.000 €, davon fix 30.000 €, Planbeschäftigung 2.000 Stunden, Istbeschäftigung 1.800 Stunden, Istkosten 76.000 € – Soll-Ist-Vergleich mit Verbrauchs- und Beschäftigungsabweichung.', 'Flexible budget: planned cost 80,000 €, 30,000 € fixed, planned 2,000 hours, actual 1,800 hours, actual cost 76,000 € – variance analysis.'),
  L('Optimale Bestellmenge: Jahresbedarf 12.000 Stück, bestellfixe Kosten 120 €, Einstandspreis 8 €, Lagerhaltungskostensatz 15 %. Andler-Formel und Kostenvergleich für 5 Bestellmengen.', 'EOQ: annual demand 12,000 units, order cost 120 €, unit price 8 €, holding rate 15 %. Andler formula and cost table for 5 order sizes.')
];
function genCap() { const d = new Date().toDateString(); const s = ls.get('tutor.xlgen', null); const used = s && s.d === d ? s.n : 0; const acc = getAccount(); const max = acc && /pro/i.test(acc.plan || '') ? GEN_PRO : GEN_FREE; return { used, max, left: Math.max(0, max - used), use: () => ls.set('tutor.xlgen', { d, n: used + 1 }) }; }

function generator(body) {
  const ta = h('textarea', { class: 'xl-ta', rows: 5, maxlength: 1500, placeholder: L('Beschreib deine Aufgabe mit allen Zahlen – z. B. „Kapitalwert einer Maschine: Anschaffung 50.000 €, 5 Jahre, Rückflüsse 14.000 € pro Jahr, Zins 6 %“', 'Describe your task with all numbers – e.g. “NPV of a machine: 50,000 € cost, 5 years, 14,000 € inflows per year, 6 % rate”') });
  const KINDS = [['', L('Automatisch', 'Automatic')], ['Investition & Finanzierung', L('Investition & Finanzierung', 'Investment & finance')], ['Kosten- & Leistungsrechnung', L('Kostenrechnung', 'Cost accounting')], ['Rechnungswesen & Bilanz', L('Bilanz & GuV', 'Balance sheet & P&L')], ['Statistik & Mathe', L('Statistik & Mathe', 'Statistics & maths')], ['Controlling & Planung', L('Controlling & Planung', 'Controlling & planning')]];
  let kind = '';
  const kinds = h('div', { class: 'xl-cats' }, KINDS.map(([k, t]) => h('button', { type: 'button', class: 'chip' + (k === kind ? ' on' : ''), onclick: e => { kind = k; kinds.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.currentTarget)); } }, t)));
  const ex = h('div', { class: 'xl-exm' }, h('small', {}, L('Beispiele:', 'Examples:')), EXAMPLES.map((t, i) => h('button', { type: 'button', class: 'linkbtn', onclick: () => { ta.value = t; ta.focus(); } }, [L('Investition', 'Investment'), L('Tilgungsplan', 'Loan schedule'), L('Soll-Ist-Vergleich', 'Variance analysis'), L('Bestellmenge', 'Order quantity')][i])));
  const capEl = h('small', { class: 'xl-cap' });
  const go = h('button', { type: 'button', class: 'btn xl-dl xl-go', onclick: () => run() }, h('span', { html: ico('spark') }), L('Excel generieren', 'Generate Excel'));
  const status = h('div', { class: 'xl-status', hidden: true, role: 'status' });
  const out = h('div', { class: 'xl-out' });
  const drawCap = () => { const c = genCap(); capEl.textContent = c.left ? L(`Heute noch ${c.left} von ${c.max} kostenlos`, `${c.left} of ${c.max} free today`) : L('Für heute aufgebraucht – morgen geht’s weiter', 'Used up for today – back tomorrow'); go.disabled = !c.left; };
  drawCap();
  body.append(h('div', { class: 'xl-gen' },
    h('label', { class: 'xl-lab' }, L('1 · Was soll die Datei rechnen?', '1 · What should the file calculate?')), ta, ex,
    h('label', { class: 'xl-lab' }, L('2 · Bereich (optional)', '2 · Area (optional)')), kinds,
    h('div', { class: 'xl-gorow' }, go, capEl)), status, out);
  // Zuletzt generierte Dateien
  const recent = ls.get('tutor.xlgen.list', []) || [];
  if (recent.length) out.append(h('div', { class: 'xl-recent' }, h('b', {}, L('Deine letzten Dateien', 'Your recent files')), recent.map((r, i) => h('button', { type: 'button', class: 'chip', onclick: () => showResult(r.spec, r.title, r.file) }, icoXL(), r.title))));

  const STEPS = [L('Max liest deine Aufgabe …', 'Max reads your task …'), L('Baut die Tabelle mit Eingaben und Formeln …', 'Builds the sheet with inputs and formulas …'), L('Rechnet jede Formel nach …', 'Checks every formula …'), L('Zweite Prüfung: rechnet die Ergebnisse unabhängig nach …', 'Second check: recalculates the results independently …')];
  function step(i, extra) { status.hidden = false; status.replaceChildren(...STEPS.map((t, k) => h('div', { class: 'xl-step' + (k < i ? ' done' : k === i ? ' now' : '') }, h('i'), k === i && extra ? extra : t))); }
  async function run() {
    const text = ta.value.trim();
    if (text.length < 15) { toast(L('Beschreib die Aufgabe etwas genauer – am besten mit allen Zahlen.', 'Describe the task in a bit more detail – ideally with all numbers.')); ta.focus(); return; }
    const c = genCap(); if (!c.left) { drawCap(); return; }
    go.disabled = true; out.replaceChildren(); step(0);
    try {
      const E = await engine();
      let spec = null, errs = [], raw = '';
      let checked = false, verifies = 0;
      for (let attempt = 0; attempt < 4 && !(spec && checked); attempt++) {
        step(attempt ? 2 : 1, attempt ? L('Max korrigiert die Tabelle …', 'Max is fixing the sheet …') : null);
        raw = await aiText(attempt ? repairPrompt(text, kind, raw, errs) : genPrompt(text, kind, E));
        step(2);
        const res = await toSpec(raw, E);
        if (!res.ok) { spec = null; errs = res.errors; continue; }
        spec = res.spec;
        // Doppelte Prüfung: zweiter, unabhängiger Durchgang rechnet die Ergebnisse ohne die Tabelle nach und prüft die Fachlogik
        if (verifies >= 2) { checked = true; break; }
        step(3); verifies++;
        const v = await verify(text, spec, E).catch(() => null);
        if (!v) { checked = true; spec.check = 'formeln'; break; }   // Prüfer nicht erreichbar: Formeln sind trotzdem nachgerechnet
        if (v.ok) { checked = true; spec.check = 'doppelt'; break; }
        errs = v.problems; console.debug('[xlgen] Prüfung:', errs);
        if (attempt === 3) { spec = null; break; }
      }
      if (!spec) throw new Error(L('Die Tabelle hat die Prüfung nicht bestanden: ', 'The sheet did not pass the check: ') + errs.slice(0, 2).join(' · '));
      c.use(); drawCap(); status.hidden = true;
      const list = [{ spec, title: spec.title, file: spec.file, at: Date.now() }].concat((ls.get('tutor.xlgen.list', []) || []).filter(x => x.title !== spec.title)).slice(0, 10);
      ls.set('tutor.xlgen.list', list);
      showResult(spec, spec.title, spec.file);
      try { if (window.BM) window.BM.track('Excel generiert', kind || 'Automatisch'); } catch (e) {}
    } catch (e) {
      status.hidden = false; status.replaceChildren(h('div', { class: 'xl-err' }, h('b', {}, L('Das hat nicht geklappt.', 'That didn’t work.')), h('span', {}, e.message || ''), h('button', { type: 'button', class: 'btn sm', onclick: () => run() }, L('Nochmal versuchen', 'Try again'))));
    }
    go.disabled = !genCap().left;
  }
  function showResult(spec, title, file) {
    out.replaceChildren(h('div', { class: 'xl-gnote' }, h('span', { html: ico('check') }), spec.check === 'doppelt' ? L('Doppelt geprüft: alle Formeln nachgerechnet und die Ergebnisse unabhängig ein zweites Mal gerechnet ✓', 'Double-checked: every formula recalculated and the results computed a second time independently ✓') : L('Alle Formeln nachgerechnet · Rechenweg bitte einmal kurz prüfen', 'Every formula recalculated · please double-check the method')), sheetView(spec, { title, file, keys: spec.keys, src: 'Generator' }));
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
// Zweite Prüfung: unabhängige Nachrechnung der Ergebnisse + Fachlogik
async function verify(task, spec, E) {
  const { values } = E.evaluate(spec.cells);
  const inputs = Object.keys(spec.cells).filter(k => spec.cells[k].s === 'in').map(k => `${k} ${labelOf(spec.cells, k) || ''} = ${spec.cells[k].v}`).slice(0, 60);
  const forms = sortRefs(Object.keys(spec.cells).filter(k => spec.cells[k].f != null)).map(k => `${k} [${labelOf(spec.cells, k) || ''}] = ${spec.cells[k].f}`).slice(0, 90);
  const res = spec.keys.map(k => ({ k, l: labelOf(spec.cells, k) || k, v: values[k] }));
  const prompt = `[Excel-Prüfung. Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, ohne Text, ohne Markdown, ohne Tafel.
Aufgabe des Studenten: „${task.slice(0, 1200).replace(/[\u0000-\u001f]/g, ' ')}“
Eingaben der Tabelle:\n${inputs.join('\n')}
Formeln der Tabelle:\n${forms.join('\n')}
Rechne die folgenden Ergebnisse SELBST und unabhängig von den Formeln nach – so, wie es in einer deutschen BWL-Klausur richtig wäre, Schritt für Schritt im Kopf, mit den Zahlen der Aufgabe: ${res.map(r => `${r.k} („${r.l}“)`).join(', ')}.
Prüfe außerdem: Setzt die Tabelle die Aufgabe fachlich richtig um (richtige Methode, richtige Basis, Vorzeichen, Perioden, Prozent als Dezimalzahl)? Fehlt etwas Wichtiges, das die Aufgabe verlangt?
Format: {"werte":{"B9":8973.09},"fachlich_ok":true,"probleme":["konkreter Fehler mit Zelle und richtiger Formel"]}
Bei Text-Ergebnissen (z. B. „vorteilhaft“) gib den Text an. Nur echte Fehler melden – keine Stilfragen.]`;
  const t = String(await aiText(prompt) || '').replace(/```(json)?/gi, '');
  const j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
  const problems = (Array.isArray(j.probleme) ? j.probleme : []).map(x => String(x).slice(0, 300)).filter(Boolean);
  const w = j.werte || {};
  for (const r of res) {
    const a = r.v, b = typeof w[r.k] === 'string' ? parseFloat(String(w[r.k]).replace(/\./g, '').replace(',', '.').replace(/[^\d.\-e]/gi, '')) : w[r.k];
    if (typeof a === 'number' && typeof b === 'number' && isFinite(b)) {
      const tol = Math.max(0.05, Math.abs(a) * 0.005);
      // Prozent vs. Dezimal nicht als Fehler werten
      if (Math.abs(a - b) > tol && Math.abs(a * 100 - b) > tol * 100) problems.push(`${r.k} („${r.l}“): Tabelle ergibt ${a}, unabhängige Nachrechnung ergibt ${b} – Formel prüfen und korrigieren`);
    }
  }
  return { ok: j.fachlich_ok !== false && !problems.length, problems: problems.length ? problems : ['Fachliche Umsetzung passt nicht zur Aufgabe'] };
}
async function aiText(prompt) {
  const r = await ask('chat', { messages: [{ role: 'user', content: prompt }], opts: { voice: false, assistant: true, entry: true } });
  return String(r.text || '');
}
// SUMMEWENN (3 Argumente) und Vergleiche in SUMMENPRODUKT rechnet die Vorschau-Engine nicht wie Excel – der Generator nutzt SUMMEWENNS
const BANNED = /^(SUMIF|AVERAGEIF)$/;
function genPrompt(task, kind, E) {
  const fns = [...E.SUPPORTED].filter(f => !BANNED.test(f)).sort().join(', ');
  return `[Excel-Auftrag. Antworte AUSSCHLIESSLICH mit einem einzigen JSON-Objekt – kein Text davor oder danach, kein Markdown, keine Codeblöcke, keine Tafel.
Baue eine saubere, klausurtaugliche Excel-Tabelle für diese Aufgabe eines BWL- oder Wiwi-Studenten${kind ? ` (Bereich: ${kind})` : ''}:
„${task.replace(/[\u0000-\u001f]/g, ' ')}“
Format:
{"titel":"Kurzer Titel","datei":"Kurzer_Dateiname.xlsx","blatt":"Blattname","spalten":[34,16,16,16],"zellen":[["A1","t","Titel"],["A2","u","Blaue Felder ausfüllen – alles andere rechnet Excel."],["A4","a","Eingaben"],["A5","l","Anschaffungsauszahlung"],["B5","e",50000,"eur"],["A6","l","Zinssatz"],["B6","e",0.06,"pct"],["A8","a","Ergebnis"],["A9","l","Kapitalwert"],["B9","r","NPV(B6,B12:B16)-B5","eur"]],"verbinden":["A1:D1"],"erklaerung":{"B9":"Kurzer Satz, was die Formel macht"}}
Zelltypen: t Titel, u Untertitel, a Abschnittsüberschrift, k Tabellenkopf, l Beschriftung, x Text, e Eingabe (Zahl aus der Aufgabe), f Formel, r wichtigstes Ergebnis (1–4 Stück, Formel), s Summenformel, h Hinweis.
Zahlenformate (4. Wert): eur, eur0, pct (0.08 = 8 %), pct1, num, int, f4, x2, yrs, stk, txt.
Regeln:
- Formeln in englischer Excel-Schreibweise, Komma als Trenner, ohne „=“: z. B. NPV(B6,C10:C14)+B9, IF(B5>0,"ja","nein"), PMT(B6/12,B7,-B5).
- Nur diese Funktionen: ${fns}.
- Nur Bezüge auf dieses Blatt, Spalten A bis H, Zeilen 1 bis 80. Keine Kreisbezüge, keine leeren Bezüge in Rechnungen.
- Jede Zahl aus der Aufgabe wird eine Eingabe (e). Alles andere wird mit Formeln berechnet, nichts von Hand ausrechnen. Prozente als Dezimalzahl.
- Aufbau: Titel (A1), Untertitel (A2), Abschnitt „Eingaben“, dann die Rechnung (Zeitreihen als Tabelle mit Kopfzeile k, eine Zeile pro Periode, höchstens 60 Perioden), dann Abschnitt „Ergebnis“ mit r-Zellen. Beschriftungen in Spalte A, Werte ab Spalte B.
- Fachlich korrekt nach deutschem Uni-Standard (Investitionsrechnung, Kosten- und Leistungsrechnung, HGB). Fehlen Angaben, setz sinnvolle Beispielwerte als Eingabe und schreib einen Hinweis (h), dass man sie ersetzen soll.
- Bedingte Summen nur mit SUMIFS(Summenbereich,Kriterienbereich,Kriterium), keine Vergleiche innerhalb von SUMPRODUCT.
- Anzahlen (Jahre, Perioden, Stück) als Eingabe im Format int, Geldbeträge eur, Sätze pct.
- Bevor du antwortest: Rechne jedes Ergebnis einmal im Kopf nach und prüfe jeden Zellbezug (zeigt er wirklich auf die gemeinte Zeile/Spalte?).
- Höchstens 220 Zellen.]`;
}
function repairPrompt(task, kind, raw, errs) {
  return `[Excel-Auftrag – Korrektur. Deine letzte Tabelle für „${task.slice(0, 600)}“ hatte diese Fehler:
${errs.slice(0, 8).map(e => '- ' + e).join('\n')}
Hier ist sie: ${String(raw).slice(0, 9000)}
Gib die KOMPLETTE korrigierte Tabelle zurück – AUSSCHLIESSLICH als ein JSON-Objekt im gleichen Format, ohne Text, ohne Markdown. Englische Funktionsnamen, Komma als Trenner, ohne „=“.]`;
}
// KI-Antwort → geprüftes Tabellenmodell
const TYPE = { t: 'title', u: 'sub', a: 'sec', k: 'th', l: 'lab', x: 'txt', e: 'in', f: 'out', r: 'res', s: 'tot', h: 'note' };
const EN = Object.fromEntries(Object.entries(DE).map(([e, d]) => [d, e]));
function normFormula(f) {
  let s = String(f || '').trim().replace(/^=/, ''), out = '', i = 0;
  while (i < s.length) {
    if (s[i] === '"') { const j = s.indexOf('"', i + 1); const k = j < 0 ? s.length : j + 1; out += s.slice(i, k); i = k; continue; }
    const m = /^[A-ZÄÖÜ][A-ZÄÖÜ0-9.]*(?=\s*\()/.exec(s.slice(i)); if (m) { out += EN[m[0]] || m[0]; i += m[0].length; continue; }
    const n = /^\d+,\d+/.exec(s.slice(i)); if (n && s.includes(';')) { out += n[0].replace(',', '.'); i += n[0].length; continue; }
    out += s[i] === ';' ? ',' : s[i]; i++;
  }
  return out;
}
async function toSpec(raw, E) {
  const errors = [];
  let j = null; const txt = String(raw || '').replace(/```(json)?/gi, '');
  const a = txt.indexOf('{'), b = txt.lastIndexOf('}');
  try { j = JSON.parse(txt.slice(a, b + 1)); } catch (e) { return { ok: false, errors: ['Antwort war kein gültiges JSON'] }; }
  if (!j || !Array.isArray(j.zellen) || !j.zellen.length) return { ok: false, errors: ['„zellen“ fehlt'] };
  const cells = {}; let maxC = 1;
  for (const z of j.zellen.slice(0, 400)) {
    if (!Array.isArray(z) || z.length < 3) continue;
    const ref = String(z[0] || '').toUpperCase().replace(/\$/g, ''), p = split(ref), s = TYPE[String(z[1] || '').toLowerCase()];
    if (!p || p.c > 8 || p.r > 80 || !s) { errors.push('Ungültige Zelle ' + ref); continue; }
    const fmt = FMT[z[3]] ? z[3] : undefined; maxC = Math.max(maxC, p.c);
    if (s === 'out' || s === 'res' || s === 'tot') {
      const f = normFormula(z[2]);
      if (!f || /[!\[\]{}]|https?:|INDIRECT|OFFSET/i.test(f)) { errors.push(ref + ': unzulässige Formel'); continue; }
      if (/\b(SUMIF|AVERAGEIF)\s*\(/i.test(f)) { errors.push(ref + ': SUMIF/AVERAGEIF nicht erlaubt – nutze SUMIFS(Summenbereich,Kriterienbereich,Kriterium)'); continue; }
      if (/SUMPRODUCT\s*\([^)]*[<>=]/i.test(f)) { errors.push(ref + ': keine Vergleiche in SUMPRODUCT – nutze SUMIFS oder COUNTIFS'); continue; }
      cells[ref] = { f, s, fmt };
    } else if (s === 'in') {
      let v = z[2]; if (typeof v === 'string') { const n = parseFloat(v.replace(/\./g, '').replace(',', '.').replace(/[^\d.\-e]/gi, '')); v = isFinite(n) ? n : v; }
      cells[ref] = { v, s, fmt: fmt || (typeof v === 'number' ? 'num' : 'txt') };
    } else cells[ref] = { v: z[2] == null ? '' : String(z[2]).slice(0, 240), s };
  }
  if (!Object.values(cells).some(c => c.s === 'in')) errors.push('Keine Eingabezelle (e)');
  if (!Object.values(cells).some(c => c.s === 'res')) errors.push('Kein Ergebnis (r)');
  // Rechnen + prüfen
  const r = E.evaluate(cells);
  r.errors.forEach(e => errors.push(e.ref + ': ' + e.msg));
  for (const [k, c] of Object.entries(cells)) if (c.f != null) {
    const v = r.values[k];
    if (v && typeof v === 'object' && v.error) errors.push(`${k} (${c.f}) ergibt ${v.error}`);
    for (const ref of E.refsOf(c.f)) { const p = split(ref); if (p && (p.c > 8 || p.r > 80)) errors.push(`${k} verweist auf ${ref} außerhalb der Tabelle`); }
  }
  if (errors.length) return { ok: false, errors: [...new Set(errors)] };
  const { cols } = bounds(cells), ncol = Math.max(cols, maxC);
  const merges = (Array.isArray(j.verbinden) ? j.verbinden : []).map(String).filter(m => /^[A-H]\d{1,2}:[A-H]\d{1,2}$/i.test(m)).map(m => m.toUpperCase());
  // Titel, Untertitel und Abschnitte über die ganze Breite
  for (const [k, c] of Object.entries(cells)) if (['title', 'sub', 'sec', 'note'].includes(c.s) && split(k).c === 1 && !merges.some(m => m.startsWith(k + ':'))) { const p = split(k); let free = true; for (let cc = 2; cc <= ncol; cc++) if (cells[colL(cc) + p.r] && cells[colL(cc) + p.r].s !== 'sec') free = false; if (free && ncol > 1) { merges.push(k + ':' + colL(ncol) + p.r); if (c.s === 'sec') for (let cc = 2; cc <= ncol; cc++) cells[colL(cc) + p.r] = { v: null, s: 'sec' }; } }
  const colsW = (Array.isArray(j.spalten) ? j.spalten : []).slice(0, 8).map(n => Math.min(60, Math.max(8, +n || 14)));
  while (colsW.length < ncol) colsW.push(colsW.length ? 16 : 34);
  const title = String(j.titel || 'Excel-Rechnung').slice(0, 80);
  const file = (String(j.datei || title).replace(/\.xlsx$/i, '').replace(/[^\wäöüÄÖÜß-]+/g, '_').replace(/_+/g, '_').slice(0, 60) || 'BWL_Max') + '.xlsx';
  const explain = {}; if (j.erklaerung && typeof j.erklaerung === 'object') for (const [k, v] of Object.entries(j.erklaerung)) if (cells[String(k).toUpperCase()]) explain[String(k).toUpperCase()] = String(v).slice(0, 300);
  const keys = sortRefs(Object.keys(cells).filter(k => cells[k].s === 'res')).slice(0, 4);
  return { ok: true, spec: { name: String(j.blatt || 'Rechnung').replace(/[\\/?*[\]:]/g, '').slice(0, 28) || 'Rechnung', cols: colsW, cells, merges, explain, keys, title, file } };
}
