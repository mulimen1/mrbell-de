// Taschenrechner: klein, aber mit allem. Grundrechnen, Klammern, %, Potenzen, Wurzeln, Fakultät,
// Trigonometrie (Grad/Bogenmaß), Logarithmen, π/e, Ans, Verlauf. Rechenkern: expr-eval (MIT).
import { h, ico, ls, toast } from './util.js';
import { L } from './i18n.js';
import { Parser } from './lib/expr-eval.mjs';
import { haptic } from './dock.js';

const DE = L(true, false);
const DEC = DE ? ',' : '.';
const HKEY = 'tutor.calc.hist', MKEY = 'tutor.calc.mode';
const parser = new Parser({ operators: { logical: false, comparison: false, conditional: false, in: false, assignment: false, concatenate: false } });
const R = Math.PI / 180;
Object.assign(parser.functions, {
  sind: x => Math.sin(x * R), cosd: x => Math.cos(x * R), tand: x => { const m = ((x % 180) + 180) % 180; if (Math.abs(m - 90) < 1e-12) return NaN; return Math.tan(x * R); },
  asind: x => Math.asin(x) / R, acosd: x => Math.acos(x) / R, atand: x => Math.atan(x) / R,
  ln: x => Math.log(x), lg: x => Math.log10(x), root: (x, n) => (x < 0 && n % 2 === 1) ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n)
});

// Anzeige → Ausdruck für den Rechenkern
export function toExpr(s, { deg = true, ans = 0 } = {}) {
  let t = String(s || '').trim();
  if (!t) return '';
  t = t.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '');
  if (DE) t = t.replace(/\.(?=\d{3}(\D|$))/g, '').replace(/,/g, '.'); else t = t.replace(/,(?=\d{3}(\D|$))/g, '');
  t = t.replace(/;/g, ',');
  t = t.replace(/Ans/g, '(' + ans + ')');
  // Prozent: „200 + 10 %“ → 220 (wie am Handy-Rechner), sonst „10 %“ → 0,1
  const m = t.match(/^(.*[^+\-*/^(])([+-])(\d+(?:\.\d+)?)%$/);
  if (m && balanced(m[1])) t = `(${m[1]})*(1${m[2]}${m[3]}/100)`;
  t = t.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)').replace(/\)%/g, ')/100');
  t = t.replace(/π/g, '(PI)').replace(/(^|[^a-zA-Z])e(?![a-zA-Z])/g, '$1(E)');
  t = t.replace(/√\(/g, 'sqrt(').replace(/∛\(/g, 'cbrt(').replace(/√(\d+(?:\.\d+)?)/g, 'sqrt($1)');
  t = t.replace(/²/g, '^2').replace(/³/g, '^3');
  t = t.replace(/log\(/g, 'lg(');
  if (deg) t = t.replace(/\b(a?)(sin|cos|tan)\(/g, (x, a, f) => a + f + 'd(');
  // Implizites Mal: 2(…), )(, 2π, 2sin(…)
  t = t.replace(/(\d|\))(?=\(|[a-zA-Z])/g, '$1*').replace(/\)(?=\d)/g, ')*');
  t = t.replace(/(\d)\*(e)(?=[+-]?\d)/gi, '$1$2');   // 1e5 nicht zerlegen
  // offene Klammern schließen
  let open = 0; for (const c of t) { if (c === '(') open++; else if (c === ')') open--; }
  if (open > 0) t += ')'.repeat(open);
  return t;
}
const balanced = s => { let n = 0; for (const c of s) { if (c === '(') n++; else if (c === ')') { n--; if (n < 0) return false; } } return n === 0; };

export function evaluate(s, opts) {
  const ex = toExpr(s, opts); if (!ex) return null;
  let v; try { v = parser.evaluate(ex); } catch (e) { return { err: true }; }
  if (typeof v !== 'number' || !isFinite(v)) return { err: true, nan: Number.isNaN(v) };
  if (Math.abs(v) < 1e-13) v = 0;
  return { v: Number(v.toPrecision(13)) };
}
export function fmt(v, group = true) {
  if (v == null) return '';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e15 || a < 1e-9)) return v.toExponential(8).replace(/\.?0+e/, 'e').replace('.', DEC);
  return v.toLocaleString(L('de-DE', 'en-US'), { maximumFractionDigits: 10, useGrouping: group }).replace(/^-/, '−');
}

export function calculator(root) {
  let deg = (ls.get(MKEY, 'deg') || 'deg') === 'deg', sci = !!ls.get('tutor.calc.sci', false), ans = 0, justDone = false;
  const touch = matchMedia('(pointer: coarse)').matches;
  const inp = h('input', { class: 'cx-in', type: 'text', inputmode: touch ? 'none' : 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': L('Rechnung', 'Expression'), placeholder: '0' });
  const pre = h('button', { type: 'button', class: 'cx-pre', title: L('Ergebnis kopieren', 'Copy result'), onclick: () => { const r = evaluate(inp.value, { deg, ans }); if (r && !r.err) { navigator.clipboard?.writeText(fmt(r.v, false)); toast(L('Ergebnis kopiert', 'Result copied')); } } });
  const histEl = h('div', { class: 'cx-hist', hidden: true });
  const update = () => {
    const v = inp.value; const r = evaluate(v, { deg, ans });
    pre.textContent = !v.trim() ? '' : r == null ? '' : r.err ? (/[\d)]$/.test(v.replace(/\s/g, '')) ? L('Rechnung prüfen', 'Check expression') : '') : '= ' + fmt(r.v);
    pre.classList.toggle('bad', !!(r && r.err));
    inp.style.fontSize = v.length > 26 ? '18px' : v.length > 18 ? '22px' : '';
  };
  // Tippen auf der Tastatur: *, /, -, . als schöne Zeichen
  inp.addEventListener('input', () => {
    const p = inp.selectionStart, map = { '*': '×', '/': '÷', '-': '−' }; if (DE) map['.'] = ',';
    const nv = inp.value.replace(/[*\/\-.]/g, c => map[c] || c);
    if (nv !== inp.value) { inp.value = nv; inp.setSelectionRange(p, p); }
    justDone = false; update();
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); } });
  const put = (s, back = 0) => {
    haptic();
    if (justDone && /^[\d(π√∛e,.]/.test(s) && !s.startsWith('Ans')) inp.value = '';
    justDone = false;
    const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a;
    inp.setRangeText(s, a, b, 'end'); if (back) inp.setSelectionRange(inp.selectionStart - back, inp.selectionStart - back);
    if (!touch) inp.focus(); update();
  };
  function equals() {
    haptic();
    const r = evaluate(inp.value, { deg, ans });
    if (!r) return;
    if (r.err) { pre.textContent = r.nan ? L('Nicht definiert', 'Undefined') : L('Rechnung prüfen', 'Check expression'); pre.classList.add('bad'); root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake'); return; }
    const hist = (ls.get(HKEY, []) || []).filter(x => x.e !== inp.value); hist.unshift({ e: inp.value, v: r.v }); ls.set(HKEY, hist.slice(0, 15));
    ans = r.v; pre.textContent = inp.value + ' ='; inp.value = fmt(r.v, false); justDone = true; pre.classList.remove('bad'); drawHist();
    inp.style.fontSize = inp.value.length > 18 ? '22px' : '';
  }
  const back = () => { haptic(); const a = inp.selectionStart, b = inp.selectionEnd; if (a !== b) inp.setRangeText('', a, b, 'end'); else if (a > 0) { const fn = inp.value.slice(0, a).match(/(sin⁻¹\(|cos⁻¹\(|tan⁻¹\(|asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|ln\(|log\(|Ans|.)$/u); inp.setRangeText('', a - fn[0].length, a, 'end'); } justDone = false; update(); };
  const clear = () => { haptic(); inp.value = ''; justDone = false; update(); };
  const sign = () => {
    haptic(); const v = inp.value, m = v.match(/(\(−)?(\d+(?:[.,]\d+)?)(\))?$/);
    if (!m) { put('−'); return; }
    inp.value = m[1] && m[3] ? v.slice(0, v.length - m[0].length) + m[2] : v.slice(0, v.length - m[0].length) + (m[1] ? m[0] : '(−' + m[2] + ')');
    justDone = false; update();
  };
  const inv = () => { const v = inp.value, m = v.match(/(\d+(?:[.,]\d+)?|\([^()]*\))$/); if (m) { inp.value = v.slice(0, v.length - m[0].length) + '1÷' + m[0]; haptic(); update(); } else put('1÷'); };
  const K = (label, fn, cls = '', aria) => h('button', { type: 'button', class: 'cx-k ' + cls, 'aria-label': aria || label, onmousedown: e => e.preventDefault(), onclick: fn, html: '<span>' + label + '</span>' });
  const basic = h('div', { class: 'cx-g' },
    K('AC', clear, 'fn'), K('<svg viewBox="0 0 24 24"><path d="M21 5H9l-6 7 6 7h12z"/><path d="m17 9-6 6M11 9l6 6"/></svg>', back, 'fn', L('Löschen', 'Delete')), K('%', () => put('%'), 'fn'), K('÷', () => put('÷'), 'op'),
    K('7', () => put('7')), K('8', () => put('8')), K('9', () => put('9')), K('×', () => put('×'), 'op'),
    K('4', () => put('4')), K('5', () => put('5')), K('6', () => put('6')), K('−', () => put('−'), 'op'),
    K('1', () => put('1')), K('2', () => put('2')), K('3', () => put('3')), K('+', () => put('+'), 'op'),
    K('±', sign, 'fn', L('Vorzeichen', 'Sign')), K('0', () => put('0')), K(DEC, () => put(DEC)), K('=', equals, 'eq'));
  const S = (label, ins, aria, back) => K(label, typeof ins === 'function' ? ins : () => put(ins, back), 'sc', aria);
  const sciEl = h('div', { class: 'cx-g sci', hidden: !sci },
    S('(', '('), S(')', ')'), S('x²', '²', L('Quadrat', 'Square')), S('x<sup>y</sup>', '^', L('Potenz', 'Power')), S('√', '√(', L('Wurzel', 'Square root')),
    S('sin', 'sin('), S('cos', 'cos('), S('tan', 'tan('), S('ln', 'ln('), S('log', 'log(', L('Zehnerlogarithmus', 'Log base 10')),
    S('sin<sup>−1</sup>', 'asin(', 'arcsin'), S('cos<sup>−1</sup>', 'acos(', 'arccos'), S('tan<sup>−1</sup>', 'atan(', 'arctan'), S('e<sup>x</sup>', 'e^('), S('10<sup>x</sup>', '10^('),
    S('π', 'π'), S('e', 'e'), S('x!', '!', L('Fakultät', 'Factorial')), S('1/x', inv, L('Kehrwert', 'Reciprocal')), S('∛', '∛(', L('Kubikwurzel', 'Cube root')),
    S('|x|', 'abs(', L('Betrag', 'Absolute value')), S('x³', '³'), S('<sup>y</sup>√x', 'root(', L('n-te Wurzel: root(x; n)', 'nth root: root(x, n)')), S(DE ? ';' : ',', DE ? ';' : ','), S('Ans', 'Ans', L('letztes Ergebnis', 'last answer')));
  const degB = h('button', { type: 'button', class: 'cx-t', onclick: () => { haptic(); deg = !deg; ls.set(MKEY, deg ? 'deg' : 'rad'); degB.textContent = deg ? 'DEG' : 'RAD'; update(); }, title: L('Grad / Bogenmaß', 'Degrees / radians') }, deg ? 'DEG' : 'RAD');
  const sciB = h('button', { type: 'button', class: 'cx-t' + (sci ? ' on' : ''), onclick: () => { haptic(); sci = !sci; ls.set('tutor.calc.sci', sci); sciEl.hidden = !sci; sciB.classList.toggle('on', sci); root.closest('.dkp')?.classList.toggle('wide', sci); }, title: L('Wissenschaftlich', 'Scientific') }, 'f(x)');
  const histB = h('button', { type: 'button', class: 'cx-t', 'aria-label': L('Verlauf', 'History'), html: ico('clock'), onclick: () => { haptic(); histEl.hidden = !histEl.hidden; drawHist(); } });
  function drawHist() {
    if (histEl.hidden) return;
    const hs = ls.get(HKEY, []) || [];
    histEl.replaceChildren(...(hs.length ? hs.map(x => h('button', { type: 'button', class: 'cx-hi', onclick: () => { put(fmt(x.v, false)); histEl.hidden = true; } }, h('span', {}, x.e), h('b', {}, '= ' + fmt(x.v)))) : [h('p', {}, L('Noch nichts gerechnet.', 'Nothing calculated yet.'))]),
      hs.length ? h('button', { type: 'button', class: 'cx-hclr', onclick: () => { ls.set(HKEY, []); drawHist(); } }, L('Verlauf löschen', 'Clear history')) : null);
  }
  root.append(h('div', { class: 'cx' }, h('div', { class: 'cx-top' }, histB, h('span', { class: 'grow' }), degB, sciB), h('div', { class: 'cx-d' }, inp, pre), histEl, sciEl, basic));
  root.closest('.dkp')?.classList.toggle('wide', sci);
  if (!touch) setTimeout(() => inp.focus(), 60);
  update();
}
