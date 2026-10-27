// BWL Max Excel-Engine: rechnet Excel-Formeln im Browser (fast-formula-parser + formulajs, beide MIT).
// Rechnet in Abhängigkeits-Reihenfolge (der Parser ist nicht wiedereintrittsfähig), erkennt Kreisbezüge und unbekannte Funktionen.
import FormulaParser from 'fast-formula-parser';
import * as F from '@formulajs/formulajs';
const FIN = ['NPV', 'IRR', 'MIRR', 'PMT', 'IPMT', 'PPMT', 'SLN', 'DDB', 'DB', 'SYD', 'VDB', 'NPER', 'RATE', 'FV', 'PV', 'CUMIPMT', 'CUMPRINC', 'EFFECT', 'NOMINAL', 'MAX', 'MIN', 'MATCH', 'AVERAGE', 'MEDIAN', 'COUNT', 'COUNTA', 'ROUNDUP', 'ROUNDDOWN', 'POWER', 'SQRT', 'LN', 'EXP', 'LOG', 'LOG10', 'STDEV', 'VAR', 'LARGE', 'SMALL', 'CEILING', 'FLOOR', 'MOD', 'INT', 'SIGN', 'PRODUCT', 'SUMIF', 'SUMIFS', 'COUNTIFS', 'AVERAGEIF', 'SLOPE', 'INTERCEPT', 'FORECAST', 'CORREL'];
const functions = {};
const FE = FormulaParser.FormulaError;
for (const n of FIN) if (typeof F[n] === 'function') functions[n] = (...args) => { const r = F[n](...args.map(a => (a && typeof a === 'object' && 'value' in a) ? a.value : a)); if (r instanceof Error) throw (FE.VALUE || new FE('#VALUE!')); return r; };
// IRR wird im Bundle (xlcalc@2.mjs) durch eine robuste Variante ersetzt: alle Lösungen −99,9999 % … 10.000 %, keine -> #ZAHL!, kein Endlos-Newton.
export const SUPPORTED = new Set(['SUM', 'IF', 'IFERROR', 'AND', 'OR', 'NOT', 'ROUND', 'ABS', 'INDEX', 'SUMPRODUCT', 'COUNTIF', 'CONCATENATE', ...Object.keys(functions)]);
export const colL = c => { let s = ''; while (c > 0) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
export const colN = s => { let c = 0; for (const ch of s) c = c * 26 + ch.charCodeAt(0) - 64; return c; };
const strip = f => String(f).replace(/"[^"]*"/g, '""');
// Alle Zellen, auf die eine Formel zeigt (Bereiche ausgeklappt)
export function refsOf(f) {
  const s = strip(f).replace(/\$/g, ''), out = new Set();
  const re = /\b([A-Z]{1,3})(\d{1,5})(?::([A-Z]{1,3})(\d{1,5}))?\b/g; let m;
  while ((m = re.exec(s))) {
    if (/[A-Za-z0-9_.]$/.test(s.slice(0, m.index)) || s[re.lastIndex] === '(') continue;
    if (m[3]) { const c1 = colN(m[1]), c2 = colN(m[3]), r1 = +m[2], r2 = +m[4]; if ((c2 - c1 + 1) * (r2 - r1 + 1) > 5000) continue; for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) out.add(colL(c) + r); }
    else out.add(m[1] + m[2]);
  }
  return [...out];
}
export const funcsOf = f => [...strip(f).matchAll(/\b([A-Z][A-Z0-9.]*)\s*\(/g)].map(m => m[1]);
// cells: { A1: {v}|{f} } → { values: {ref: wert|{error}}, errors: [{ref, msg}] }
export function evaluate(cells) {
  const values = {}, errors = [], state = {}, circ = new Set();
  for (const [k, c] of Object.entries(cells)) if (!c || c.f == null) values[k] = c && c.v !== undefined ? c.v : null;
  const order = [];
  const visit = (k, path) => {
    if (state[k] === 2) return; if (state[k] === 1) { const cyc = path.slice(path.indexOf(k)); cyc.forEach(x => circ.add(x)); errors.push({ ref: k, msg: 'Kreisbezug: ' + cyc.concat(k).join(' → ') }); return; }
    const c = cells[k]; if (!c || c.f == null) { state[k] = 2; return; }
    state[k] = 1; for (const r of refsOf(c.f)) if (cells[r] && cells[r].f != null) visit(r, path.concat(k)); state[k] = 2; order.push(k);
  };
  for (const k of Object.keys(cells)) visit(k, []);
  const ERR = { '#DIV/0!': FE.DIV0, '#VALUE!': FE.VALUE, '#N/A': FE.NA, '#NAME?': FE.NAME, '#REF!': FE.REF, '#NUM!': FE.NUM, '#NULL!': FE.NULL };
  const get = ref => { const v = values[ref]; if (v && typeof v === 'object' && 'error' in v) return ERR[v.error] || FE.VALUE; return v === undefined ? null : v; };
  const pos = ref => { const m = /^([A-Z]+)(\d+)$/.exec(ref); return { row: +m[2], col: colN(m[1]) }; };
  const parser = new FormulaParser({ functions,
    onCell: ({ row, col }) => get(colL(col) + row),
    onRange: r => { const out = []; for (let i = r.from.row; i <= r.to.row; i++) { const row = []; for (let j = r.from.col; j <= r.to.col; j++) { let v = values[colL(j) + i]; if (v && typeof v === 'object') v = null; row.push(v === '' || v === undefined ? null : v); } out.push(row); } return out; } });
  for (const k of order) {
    if (circ.has(k)) { values[k] = { error: '#REF!' }; continue; }
    const f = String(cells[k].f).replace(/^=/, '');
    const bad = funcsOf(f).filter(n => !SUPPORTED.has(n));
    if (bad.length) { values[k] = { error: '#NAME?' }; errors.push({ ref: k, msg: 'Unbekannte Funktion: ' + bad.join(', ') }); continue; }
    let out; try { out = parser.parse(f, pos(k)); } catch (e) { out = { error: (e && e.error) || '#FEHLER' }; }
    if (out instanceof FE || (out && typeof out === 'object' && out._error)) out = { error: out._error || String(out) };
    if (Array.isArray(out)) out = out.flat(Infinity)[0];
    values[k] = out === undefined ? null : out;
  }
  return { values, errors, order };
}
