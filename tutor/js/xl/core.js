// Excel bei BWL Max: ein Tabellenmodell für Vorlagen und Generator.
// Dasselbe Modell wird im Browser gerechnet (Vorschau), als .xlsx mit echten Formeln geschrieben und auf Deutsch angezeigt.
// Zellen: { v } = fester Wert, { f } = Formel (englische Excel-Namen, Komma als Trenner – so speichert Excel intern).
// s = Stil: title | sub | sec | lab | in | out | res | th | tot | note | txt ; fmt = Zahlenformat (siehe FMT)

export const colL = c => { let s = ''; while (c > 0) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
export const colN = s => { let c = 0; for (const ch of s) c = c * 26 + ch.charCodeAt(0) - 64; return c; };
export const split = ref => { const m = /^([A-Z]+)(\d+)$/.exec(ref); return m ? { c: colN(m[1]), r: +m[2] } : null; };

// Zahlenformate: Excel-Code + Anzeige in der Vorschau
const nf = (d, min = d) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: min, maximumFractionDigits: d });
export const FMT = {
  eur: { x: '#,##0.00 "€";[Red]-#,##0.00 "€"', d: v => nf(2).format(v) + ' €', neg: true },
  eur0: { x: '#,##0 "€";[Red]-#,##0 "€"', d: v => nf(0).format(v) + ' €', neg: true },
  pct: { x: '0.00%', d: v => nf(2).format(v * 100) + ' %' },
  pct1: { x: '0.0%', d: v => nf(1).format(v * 100) + ' %' },
  num: { x: '#,##0.00', d: v => nf(2).format(v) },
  int: { x: '#,##0', d: v => nf(0).format(v) },
  f4: { x: '0.0000', d: v => nf(4).format(v) },
  x2: { x: '0.00', d: v => nf(2).format(v) },
  yrs: { x: '0.00 "Jahre"', d: v => nf(2).format(v) + ' Jahre' },
  stk: { x: '#,##0 "Stück"', d: v => nf(0).format(v) + ' Stück' },
  txt: { x: '@', d: v => String(v) }
};
const DEC = { eur: 2, eur0: 0, pct: 2, pct1: 1, num: 2, int: 0, f4: 4, x2: 2, yrs: 2, stk: 0 };
export function show(v, fmt) {
  if (v == null || v === '') return '';
  if (typeof v === 'object' && v.error) return v.error === '#DIV/0!' ? '#DIV/0!' : v.error === '#NAME?' ? '#NAME?' : '#WERT!';
  if (typeof v === 'boolean') return v ? 'WAHR' : 'FALSCH';
  if (typeof v === 'number') {
    if (!isFinite(v)) return '#ZAHL!';
    const key = FMT[fmt] ? fmt : (Number.isInteger(v) ? 'int' : 'num'), f = FMT[key];
    const tiny = 0.5 * 10 ** -(DEC[key] ?? 2) / (key === 'pct' || key === 'pct1' ? 100 : 1);   // auf null gerundet -> ohne Minus („−0,00“ vermeiden)
    return f.d(Math.abs(v) < tiny ? 0 : v);
  }
  return String(v);
}

// Excel-Funktionsnamen auf Deutsch (so zeigt sie das deutsche Excel an)
export const DE = { SUM: 'SUMME', IF: 'WENN', IFERROR: 'WENNFEHLER', AND: 'UND', OR: 'ODER', NOT: 'NICHT', ROUND: 'RUNDEN', ROUNDUP: 'AUFRUNDEN', ROUNDDOWN: 'ABRUNDEN',
  NPV: 'NBW', IRR: 'IKV', MIRR: 'QIKV', PMT: 'RMZ', IPMT: 'ZINSZ', PPMT: 'KAPZ', SLN: 'LIA', DDB: 'GDA', DB: 'GDA2', SYD: 'DIA', VDB: 'VDB', NPER: 'ZZR', RATE: 'ZINS', FV: 'ZW', PV: 'BW',
  MAX: 'MAX', MIN: 'MIN', AVERAGE: 'MITTELWERT', MEDIAN: 'MEDIAN', COUNT: 'ANZAHL', COUNTA: 'ANZAHL2', COUNTIF: 'ZÄHLENWENN', COUNTIFS: 'ZÄHLENWENNS', SUMIF: 'SUMMEWENN', SUMIFS: 'SUMMEWENNS', AVERAGEIF: 'MITTELWERTWENN',
  INDEX: 'INDEX', MATCH: 'VERGLEICH', SUMPRODUCT: 'SUMMENPRODUKT', ABS: 'ABS', POWER: 'POTENZ', SQRT: 'WURZEL', LN: 'LN', EXP: 'EXP', LOG: 'LOG', LOG10: 'LOG10', MOD: 'REST', INT: 'GANZZAHL', SIGN: 'VORZEICHEN',
  PRODUCT: 'PRODUKT', CEILING: 'OBERGRENZE', FLOOR: 'UNTERGRENZE', LARGE: 'KGRÖSSTE', SMALL: 'KKLEINSTE', STDEV: 'STABW', VAR: 'VARIANZ', EFFECT: 'EFFEKTIV', NOMINAL: 'NOMINAL', CUMIPMT: 'KUMZINSZ', CUMPRINC: 'KUMKAPITAL',
  SLOPE: 'STEIGUNG', INTERCEPT: 'ACHSENABSCHNITT', FORECAST: 'PROGNOSE', CORREL: 'KORREL', CONCATENATE: 'VERKETTEN' };
export function deFormula(f) {
  let out = '', i = 0; const s = String(f).replace(/^=/, '');
  while (i < s.length) {
    if (s[i] === '"') { const j = s.indexOf('"', i + 1); const k = j < 0 ? s.length : j + 1; out += s.slice(i, k); i = k; continue; }
    const m = /^[A-Z][A-Z0-9.]*(?=\s*\()/.exec(s.slice(i)); if (m) { out += DE[m[0]] || m[0]; i += m[0].length; continue; }
    const n = /^\d+\.\d+/.exec(s.slice(i)); if (n && !/[A-Z$]/.test(s[i - 1] || '')) { out += n[0].replace('.', ','); i += n[0].length; continue; }
    out += s[i] === ',' ? ';' : s[i]; i++;
  }
  return '=' + out;
}

// ---------- Baukasten für Vorlagen ----------
export function builder(ncols) {
  const cells = {}, merges = [], last = colL(ncols);
  const put = (ref, o) => { cells[ref] = Object.assign(cells[ref] || {}, o); return api; };
  const api = {
    cells, merges, last,
    title: (t, sub) => { put('A1', { v: t, s: 'title' }); merges.push('A1:' + last + '1'); if (sub) { put('A2', { v: sub, s: 'sub' }); merges.push('A2:' + last + '2'); } return api; },
    sec: (row, t) => { put('A' + row, { v: t, s: 'sec' }); for (let c = 2; c <= ncols; c++) put(colL(c) + row, { v: null, s: 'sec' }); merges.push('A' + row + ':' + last + row); return api; },
    th: (row, list, from = 1) => { list.forEach((t, k) => put(colL(from + k) + row, { v: t, s: 'th' })); return api; },
    lab: (ref, t, o) => put(ref, Object.assign({ v: t, s: 'lab' }, o || {})),
    txt: (ref, t, o) => put(ref, Object.assign({ v: t, s: 'txt' }, o || {})),
    note: (ref, t, span = true) => { put(ref, { v: t, s: 'note' }); if (span) { const p = split(ref); merges.push(ref + ':' + last + p.r); } return api; },
    inp: (ref, v, fmt, o) => put(ref, Object.assign({ v, s: 'in', fmt }, o || {})),
    fx: (ref, f, fmt, o) => put(ref, Object.assign({ f, s: 'out', fmt }, o || {})),
    res: (ref, f, fmt, o) => put(ref, Object.assign({ f, s: 'res', fmt }, o || {})),
    tot: (ref, f, fmt, o) => put(ref, Object.assign({ f, s: 'tot', fmt }, o || {})),
    merge: r => { merges.push(r); return api; }
  };
  return api;
}

// Grenzen eines Blatts (für Vorschau und Datei)
export function bounds(cells) { let mr = 1, mc = 1; for (const k of Object.keys(cells)) { const p = split(k); if (p) { mr = Math.max(mr, p.r); mc = Math.max(mc, p.c); } } return { rows: mr, cols: mc }; }

// ---------- Rechnen ----------
let engP = null;
export const engine = () => engP || (engP = import('/tutor/vendor/xlcalc@2.mjs'));
export async function calc(cells) { const E = await engine(); return E.evaluate(cells); }

// ---------- .xlsx schreiben (ExcelJS, MIT) ----------
let xjP = null;
function exceljs() {
  if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
  return xjP || (xjP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/tutor/vendor/exceljs@4.4.0/exceljs.min.js'; s.onload = () => window.ExcelJS ? res(window.ExcelJS) : rej(new Error('ExcelJS fehlt')); s.onerror = () => { xjP = null; rej(new Error('Excel-Baustein konnte nicht geladen werden')); }; document.head.appendChild(s); }));
}
const NAVY = 'FF1F3A5F', INK = 'FF0B1220', BLUE_BG = 'FFE8F0FE', BLUE = 'FF1F4E99', LINE = 'FFC9D6EA', GREEN = 'FF1D6F42', RES_BG = 'FFE6F4EA', GREY = 'FF6B7280';
const thin = c => ({ style: 'thin', color: { argb: c } });
function styleCell(x, c) {
  const s = c.s || 'txt';
  x.alignment = { vertical: 'middle', wrapText: s === 'note' || s === 'lab' || s === 'sec' ? true : undefined };
  if (s === 'title') { x.font = { name: 'Calibri', size: 18, bold: true, color: { argb: NAVY } }; }
  else if (s === 'sub') { x.font = { name: 'Calibri', size: 11, italic: true, color: { argb: GREY } }; }
  else if (s === 'sec') { x.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }; }
  else if (s === 'th') { x.font = { name: 'Calibri', size: 11, bold: true, color: { argb: NAVY } }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F2' } }; x.border = { bottom: thin('FF9DB7DA') }; x.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; }
  else if (s === 'in') { x.font = { name: 'Calibri', size: 11, bold: true, color: { argb: BLUE } }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_BG } }; x.border = { top: thin('FF9DB7DA'), bottom: thin('FF9DB7DA'), left: thin('FF9DB7DA'), right: thin('FF9DB7DA') }; x.protection = { locked: false }; }
  else if (s === 'res') { x.font = { name: 'Calibri', size: 12, bold: true, color: { argb: GREEN } }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RES_BG } }; x.border = { top: thin('FF8CC9A3'), bottom: thin('FF8CC9A3'), left: thin('FF8CC9A3'), right: thin('FF8CC9A3') }; }
  else if (s === 'tot') { x.font = { name: 'Calibri', size: 11, bold: true, color: { argb: INK } }; x.border = { top: thin('FF1F3A5F') }; }
  else if (s === 'note') { x.font = { name: 'Calibri', size: 10, italic: true, color: { argb: GREY } }; }
  else if (s === 'lab') { x.font = { name: 'Calibri', size: 11, color: { argb: INK } }; }
  else { x.font = { name: 'Calibri', size: 11, color: { argb: INK } }; x.border = s === 'out' ? { bottom: thin(LINE) } : undefined; }
  if (c.fmt && FMT[c.fmt]) x.numFmt = FMT[c.fmt].x;
  if (['in', 'out', 'res', 'tot'].includes(s) && c.fmt && c.fmt !== 'txt') x.alignment = Object.assign({}, x.alignment, { horizontal: 'right' });
}
const plainRes = v => (v == null || v === '' ? '' : typeof v === 'object' ? undefined : v);

// sheet = { name, cols:[Breiten], cells, merges, explain:{ref:text} } ; values = Ergebnis von calc()
export async function toXlsx({ title, file, sheet, values, explain }) {
  const X = await exceljs();
  const wb = new X.Workbook(); wb.creator = 'BWL Max'; wb.created = new Date(); wb.title = title;
  wb.calcProperties.fullCalcOnLoad = true;
  const ws = wb.addWorksheet((sheet.name || 'Rechnung').slice(0, 31), { properties: { tabColor: { argb: GREEN } }, views: [{ showGridLines: false, zoomScale: 110 }] });
  (sheet.cols || []).forEach((w, k) => { ws.getColumn(k + 1).width = w; });
  for (const [ref, c] of Object.entries(sheet.cells)) {
    const x = ws.getCell(ref);
    if (c.f != null) { const r = plainRes(values[ref]); x.value = r === undefined ? { formula: String(c.f).replace(/^=/, '') } : { formula: String(c.f).replace(/^=/, ''), result: r }; }
    else x.value = c.v == null ? null : c.v;
    styleCell(x, c);
    if (c.s === 'in' && typeof c.v === 'number') {
      const whole = c.fmt === 'int' || c.fmt === 'stk' || c.int;
      x.dataValidation = { type: whole ? 'whole' : 'decimal', operator: 'between', allowBlank: true, showErrorMessage: true, errorStyle: 'stop', errorTitle: 'Ungültiger Wert',
        error: whole ? 'Bitte eine ganze Zahl eintragen' + (c.min != null || c.max != null ? ' (' + (c.min ?? '…') + ' bis ' + (c.max ?? '…') + ')' : '') + '.' : 'Bitte eine Zahl eintragen.',
        formulae: [c.min != null ? c.min : -1e12, c.max != null ? c.max : 1e12] };
    }
  }
  (sheet.merges || []).forEach(m => { try { ws.mergeCells(m); } catch (e) {} });
  ws.getRow(1).height = 30;
  const { rows } = bounds(sheet.cells);
  const foot = ws.getCell('A' + (rows + 2)); foot.value = 'Erstellt mit BWL Max · bwlmax.de · Blaue Felder ausfüllen, alles andere rechnet Excel.'; foot.font = { size: 9, italic: true, color: { argb: GREY } };
  await ws.protect('', { selectLockedCells: true, selectUnlockedCells: true, formatColumns: true, formatRows: true, formatCells: false });

  // Zweites Blatt: So rechnet die Datei
  const ex = wb.addWorksheet('So rechnet die Datei', { properties: { tabColor: { argb: NAVY } }, views: [{ showGridLines: false }] });
  [12, 40, 52, 60].forEach((w, k) => { ex.getColumn(k + 1).width = w; });
  ex.getCell('A1').value = 'So rechnet die Datei – ' + title; ex.getCell('A1').font = { size: 16, bold: true, color: { argb: NAVY } }; ex.mergeCells('A1:D1');
  ex.getCell('A2').value = 'Jede Formel aus dem Blatt „' + (sheet.name || 'Rechnung') + '“ – so wie sie im deutschen Excel erscheint.'; ex.getCell('A2').font = { italic: true, color: { argb: GREY } }; ex.mergeCells('A2:D2');
  ['Zelle', 'Was', 'Formel', 'Erklärung'].forEach((t, k) => { const x = ex.getCell(colL(k + 1) + '4'); x.value = t; styleCell(x, { s: 'th' }); });
  let r = 5;
  for (const ref of sortRefs(Object.keys(sheet.cells).filter(k => sheet.cells[k].f != null))) {
    const c = sheet.cells[ref]; const lab = labelOf(sheet.cells, ref);
    const row = [ref, lab, deFormula(c.f), (explain && explain[ref]) || c.hint || ''];
    row.forEach((t, k) => { const x = ex.getCell(colL(k + 1) + r); x.value = t; x.alignment = { vertical: 'top', wrapText: true }; x.font = { size: 10.5, color: { argb: k === 2 ? BLUE : INK }, name: k === 2 ? 'Consolas' : 'Calibri', bold: k === 0 }; x.border = { bottom: thin(LINE) }; });
    r++;
  }
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
export function sortRefs(list) { return list.slice().sort((a, b) => { const A = split(a), B = split(b); return A.r - B.r || A.c - B.c; }); }
// Beschriftung einer Zelle: Text links in derselben Zeile, sonst Spaltenkopf darüber
export function labelOf(cells, ref) {
  const p = split(ref); if (!p) return '';
  for (let c = p.c - 1; c >= 1; c--) { const x = cells[colL(c) + p.r]; if (x && x.f == null && typeof x.v === 'string' && x.v.trim()) return x.v; }
  for (let r = p.r - 1; r >= 1; r--) { const x = cells[colL(p.c) + r]; if (x && x.s === 'th') return x.v + ' (Zeile ' + p.r + ')'; }
  return '';
}
export function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}
