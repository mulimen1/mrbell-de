// Rechenprüfer (ohne KI): Jede Rechnung, die Max ausgibt, wird hier exakt nachgerechnet, bevor sie jemand sieht.
// Geprüft: Formelketten (\( a · b = c \)), Rechnungen im Fließtext („5 · 3 = 15“, „15 % von 200 = 30“), Buchungssätze
// (Soll = Haben in Text, Tabellen, Tafeln) und Summenzeilen in Tabellen. Gerechnet wird mit exakten Brüchen (BigInt).
// Falsche Ergebnisse werden – wo eindeutig – sofort richtig eingesetzt (korrigiere), sonst als Befund gemeldet.

/* ================= Exakte Brüche ================= */
const bgcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) { if (d < 0n) { n = -n; d = -d; } const g = bgcd(n, d) || 1n; this.n = n / g; this.d = d / g; }
  static of(x) { return x instanceof Q ? x : Q.dec(String(x)); }
  static dec(s) {   // „1234.567“, „-3“, „1e-7“ (aus Gleitkomma)
    s = String(s).trim();
    const e = /^(-?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(s); if (!e) throw new Error('zahl');
    const frac = e[3] || '', ex = +(e[4] || 0);
    let n = BigInt((e[2] || '0') + frac), d = 10n ** BigInt(frac.length);
    if (ex > 0) n *= 10n ** BigInt(ex); else if (ex < 0) d *= 10n ** BigInt(-ex);
    return new Q(e[1] ? -n : n, d);
  }
  static float(x) { if (!isFinite(x)) throw new Error('nan'); return Q.dec(x.toPrecision(17)); }
  add(b) { return new Q(this.n * b.d + b.n * this.d, this.d * b.d); }
  sub(b) { return new Q(this.n * b.d - b.n * this.d, this.d * b.d); }
  mul(b) { return new Q(this.n * b.n, this.d * b.d); }
  div(b) { if (b.n === 0n) throw DIV0; return new Q(this.n * b.d, this.d * b.n); }
  neg() { return new Q(-this.n, this.d); }
  abs() { return this.n < 0n ? this.neg() : this; }
  cmp(b) { const x = this.n * b.d - b.n * this.d; return x < 0n ? -1 : x > 0n ? 1 : 0; }
  isZero() { return this.n === 0n; }
  toNumber() { return Number(this.n) / Number(this.d) || (Number(this.n * 10n ** 30n / this.d) / 1e30); }
  pow(b) {
    if (b.d === 1n && (b.n < 0n ? -b.n : b.n) <= 400n) {
      let e = b.n < 0n ? -b.n : b.n, r = new Q(1n), x = this;
      while (e) { if (e & 1n) r = r.mul(x); x = x.mul(x); e >>= 1n; }
      return b.n < 0n ? new Q(1n).div(r) : r;
    }
    const v = Math.pow(this.toNumber(), b.toNumber()); if (!isFinite(v)) throw NN; return Q.float(v);
  }
}
const DIV0 = new Error('DIV0'), NN = new Error('nicht-numerisch');
const ZERO = new Q(0n), ONE = new Q(1n), HUNDRED = new Q(100n);
const half = d => new Q(1n, 2n * 10n ** BigInt(d));
const pow10 = k => k >= 0 ? new Q(10n ** BigInt(k)) : new Q(1n, 10n ** BigInt(-k));

/* ================= Zahlen deutsch lesen/schreiben ================= */
// „1.234,56“ / „1234,5“ / „12“ → Q; Anzahl Nachkommastellen
function parseDe(s) {
  s = s.replace(/[\s\u00a0\u202f]/g, '').replace(/\{,\}/g, ',');
  const m = /^([−-]?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?$/.exec(s); if (!m) return null;
  return { q: Q.dec((m[1] ? '-' : '') + m[2].replace(/\./g, '') + (m[3] ? '.' + m[3] : '')), d: (m[3] || '').length };
}
// kaufmännisch runden auf d Stellen (exakt)
function roundQ(q, d) {
  const s = pow10(d), x = q.mul(s), neg = x.n < 0n, a = neg ? -x.n : x.n;
  let r = a / x.d; if ((a % x.d) * 2n >= x.d) r += 1n;
  return new Q(neg ? -r : r).div(s);
}
function fmtDe(q, d, tex) {   // tex: Dezimalkomma als {,}
  const r = roundQ(q, d), neg = r.n < 0n && !r.isZero();
  const s = pow10(d), a = r.abs().mul(s); const n = a.n / a.d;
  let str = n.toString().padStart(d + 1, '0');
  let ip = d ? str.slice(0, -d) : str, fp = d ? str.slice(-d) : '';
  ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '-' : '') + ip + (d ? (tex ? '{,}' : ',') + fp : '');
}

/* ================= Zahlformate Deutsch/Englisch ================= */
// Max mischt in englischen Antworten oft beide Formate („30.000“, „1{,}08“, „27{,}777.78“). Jede Zahl bekommt ihre möglichen
// Lesarten; gerechnet wird mit der wahrscheinlichsten, bei Widerspruch werden die anderen Lesarten probiert.
let SPR = 'de';
function lesarten(x) {
  x = x.replace(/\{,\}/g, ',').replace(/\{\.\}/g, '.');
  const mk = (ip, fp) => ({ q: Q.dec((ip || '0') + (fp ? '.' + fp : '')), d: fp ? fp.length : 0 });
  const hasC = x.includes(','), hasD = x.includes('.');
  if (!hasC && !hasD) return [mk(x)];
  if (hasC && hasD) {
    const lc = x.lastIndexOf(','), ld = x.lastIndexOf('.');
    const [tz, dz] = ld > lc ? [',', '.'] : ['.', ','], k = Math.max(lc, ld), ip = x.slice(0, k), fp = x.slice(k + 1);
    if (ip.includes(dz) || !ip.split(tz).slice(1).every(g => g.length === 3)) throw NN;
    return [mk(ip.split(tz).join(''), fp)];
  }
  const sep = hasC ? ',' : '.', g = x.split(sep);
  const tausend = g.slice(1).every(y => y.length === 3) && g[0].length <= 3 && g[0] !== '0' && g[0] !== '';
  if (g.length > 2) { if (tausend) return [mk(g.join(''))]; throw NN; }
  const dez = mk(g[0], g[1]);
  if (!tausend) return [dez];
  const th = mk(g.join(''));
  // Deutsch: eindeutig („1.250“ = Tausender, „1,250“ = Dezimal). Englisch (Max mischt dort beide Formate): beide Lesarten,
  // „1,250“ = Tausender zuerst; „1.250“ = Tausender zuerst (Max schreibt auch in englischen Antworten oft 30.000)
  if (SPR !== 'en') return sep === '.' ? [th] : [dez];
  // Dezimal-Lesart nur, wo sie plausibel ist (1,025 / 12.375 – nicht 2,000 oder 30.000): sonst würden Fehler um Faktor 1000 durchrutschen
  return g[0].length <= 2 && !g[1].endsWith('0') ? [th, dez] : [th];
}
const NUMMIX = /\d+(?:(?:\{,\}|\{\.\}|[.,])\d+)*/g;
// Englischer Stil einer Zahl? (Dezimalpunkt, Komma als Tausender) – damit Korrekturen im selben Format geschrieben werden
function enStil(tok) {
  const x = tok.replace(/\{,\}/g, ',');
  if (/\d,\d{3}\.\d|\d\.\d{1,2}$|\d\.\d{4,}$|^\d{1,3}(,\d{3})+$/.test(x) && !/\d\.\d{3}(?!\d)/.test(x.replace(/\.\d{1,2}$/, ''))) return SPR === 'en' || /\d,\d{3}\.\d/.test(x) || /\d\.\d{1,2}$/.test(x);
  return false;
}
// Stil einer vorhandenen Zahl beibehalten (Max mischt): 'de' | 'en' | null (unbestimmt → Sprache der Antwort)
function stilVon(tok) {
  const x = tok.replace(/^[−-]\s*/, '');
  if (/\d,\d{3}\.\d|\d\{,\}\d{3}\.\d|^\d+\.\d{1,2}$|^\d+\.\d{4,}$/.test(x)) return 'en';
  if (/\d\.\d{3},\d|(?:\{,\}|,)\d{1,2}$|(?:\{,\}|,)\d{4,}$|^\d{1,3}(?:\.\d{3})+$/.test(x)) return 'de';
  return null;
}
const enFuer = tok => { const st = stilVon(tok); return st ? st === 'en' : SPR === 'en'; };
function fmtNum(q, d, tex, en) {
  if (!en) return fmtDe(q, d, tex);
  const de = fmtDe(q, d, false);   // 1.234,56 → 1,234.56 (TeX: 1{,}234.56)
  return de.replace(/[.,]/g, c => (c === '.' ? '\u0001' : '.')).replace(/\u0001/g, tex ? '{,}' : ',');
}

/* ================= TeX → Rechenausdruck ================= */
const UNITS = new Set(['€', 'EUR', 'Mio', 'Mrd', 'Tsd', 'Stück', 'Stk', 'h', 'Tage', 'Jahre', 'Jahr', '%', 'm', 'kg', 't', 'Std', 'ME', 'GE', 'Mio. €', 'Mrd. €', 'Tsd. €', '€/Stück', '€/Stk', 'Punkte', 'Prozentpunkte', 'Monate', 'Minuten', 'min', 'km', 'l', 'Liter', 'Euro', 'Stück/Jahr', 'Stunden', 'Pkt', '€/h', 'qm', 'm²', 'm³', 'Tage/Jahr', 'Wochen', 'Personen', 'Mitarbeiter', 'Kunden']);
function brace(s, i) {
  if (s[i] !== '{') throw NN;
  let dpt = 0;
  for (let j = i; j < s.length; j++) { if (s[j] === '{') dpt++; else if (s[j] === '}') { dpt--; if (!dpt) return [s.slice(i + 1, j), j + 1]; } }
  throw NN;
}
function texToExpr(t) {
  t = t.replace(/^\s*\\(?:text|mathrm)\{[^{}]*:\s*\}/, '');
  t = t.replace(/\\text\{\s*Mio\.?\s*(?:€|Euro)?\s*\}/g, '\\cdot 1000000').replace(/\\text\{\s*Mrd\.?\s*(?:€|Euro)?\s*\}/g, '\\cdot 1000000000');
  t = t.replace(/\\text\{\s*(?:Prozentpunkte|Prozent|Pp\.?|PP)\s*\}/g, '\\%');
  t = t.replace(/\\(?:text|mathrm)\{\s*[A-Za-zÄÖÜäöüß./€ ]+\}\s*$/, '').trimEnd();
  t = t.replace(/−/g, '-').replace(/–/g, '-').replace(/\\left|\\right/g, '').replace(/\\[!,;: ]|~|\\q?quad/g, '').replace(/\\displaystyle|\\tfrac/g, m => m === '\\tfrac' ? '\\frac' : '');
  t = t.replace(/\\(?:mathrm|text|textrm|operatorname|textbf|mathbf)\{([^{}]*)\}(\s*\^\s*(?:\{[^{}]*\}|\d))?/g, (m, x) => (UNITS.has(x.trim().replace(/\.$/, '')) || !x.trim()) ? '' : 'X');
  t = t.replace(/\\euro|€|\\EUR/g, '').replace(/\{,\}/g, ',');
  let out = '', i = 0;
  while (i < t.length) {
    const c = t[i];
    if (t.startsWith('\\frac', i) || t.startsWith('\\dfrac', i)) {
      i = t.indexOf('{', i); let a, b; [a, i] = brace(t, i); while (t[i] === ' ') i++; [b, i] = brace(t, i);
      out += `((${texToExpr(a)})/(${texToExpr(b)}))`; continue;
    }
    if (t.startsWith('\\sqrt', i)) {
      i += 5; let n = '2'; if (t[i] === '[') { const j = t.indexOf(']', i); n = t.slice(i + 1, j); i = j + 1; }
      let a; [a, i] = brace(t, i); out += `R((${texToExpr(a)}),(${texToExpr(n)}))`; continue;
    }
    if (t.startsWith('\\cdot', i)) { out += '*'; i += 5; continue; }
    if (t.startsWith('\\times', i)) { out += '*'; i += 6; continue; }
    if (t.startsWith('\\div', i)) { out += '/'; i += 4; continue; }
    if (t.startsWith('\\%', i)) { out += '%'; i += 2; continue; }
    if (c === '^') { i++; let a; if (t[i] === '{') [a, i] = brace(t, i); else { a = t[i]; i++; } out += `^(${texToExpr(a)})`; continue; }
    if (c === '{') { let a; [a, i] = brace(t, i); out += `(${texToExpr(a)})`; continue; }
    if (c === '\\') throw NN;
    out += c; i++;
  }
  return out;
}

/* ================= Ausdruck exakt auswerten ================= */
// expr: Zahlen deutsch (1.234,5), + - * / : ^ ( ) % R(a,n); Modus: 'pct' (% = /100) | 'weg' (% ignorieren) | 'rel' (a − p % = a·(1−p))
// derived: Set von Zahlwerten (String), die als gerundete Zwischenwerte gelten → liefert Toleranz
const NUMRE = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?|\d+\.\d+/g;
function evaluate(expr, mode, derived, wahl) {
  let e = expr.replace(/\s+/g, '');
  // Zahlen in eine eindeutige Form bringen (Lesart je Zahl: wahl[i] oder die wahrscheinlichste)
  let amb = 0; const klassen = new Set();
  e = e.replace(NUMMIX, tok => { const l = lesarten(tok); let k = 0; if (l.length > 1) { const kl = /[.]|\{\.\}/.test(tok) ? 0 : 1; klassen.add(kl); k = wahl ? (wahl[kl] || 0) % l.length : 0; } const r = l[k]; const str = r.q.n.toString().replace('-', ''); const ab = r.q.abs(); const z = ab.mul(pow10(r.d)); const ganz = (z.n / z.d).toString().padStart(r.d + 1, '0'); return r.d ? ganz.slice(0, -r.d) + ',' + ganz.slice(-r.d) : ganz; });
  if (mode === 'rel') { const e2 = e.replace(/(\d[\d.,]*)([+-])(\d[\d.,]*)%/g, '($1*(1$2$3/100))'); if (e2 === e) throw NN; e = e2; }
  if (!e || /[A-Za-zÄÖÜäöüß_]/.test(e.replace(/R\(/g, '('))) throw NN;
  if (/[<>!=?&|]/.test(e)) throw NN;
  e = e.replace(/:/g, '/');
  e = mode === 'weg' ? e.replace(/%/g, '') : e.replace(/%/g, '/100');
  e = e.replace(/(\d|\))\(/g, '$1*(');
  // Tokenize
  const toks = []; let lits = []; let i = 0;
  while (i < e.length) {
    const c = e[i];
    if (/\d/.test(c)) {
      NUMRE.lastIndex = i; const m = NUMRE.exec(e); if (!m || m.index !== i) throw NN;
      let x = m[0], d = 0;
      if (x.includes(',') || /^\d{1,3}(?:\.\d{3})+$/.test(x)) { d = (x.split(',')[1] || '').length; x = x.replace(/\./g, '').replace(',', '.'); }
      else if (x.includes('.')) d = x.split('.')[1].length;
      const q = Q.dec(x); toks.push({ t: 'n', q, d }); lits.push({ q, d, k: toks.length - 1 });
      i += m[0].length; if (/\d/.test(e[i] || '')) throw NN; continue;
    }
    if (c === 'R' && e[i + 1] === '(') { toks.push({ t: 'R' }); i++; continue; }
    if ('+-*/^(),'.includes(c)) { toks.push({ t: c }); i++; continue; }
    throw NN;
  }
  for (let k = 1; k < toks.length; k++) if (toks[k].t === 'n' && toks[k - 1].t === 'n') throw NN;
  const run = (over) => {
    let p = 0;
    const peek = () => toks[p], take = () => toks[p++];
    const num = k => (over && over.k === k ? over.q : toks[k].q);
    function expr() { let v = term(); while (peek() && (peek().t === '+' || peek().t === '-')) { const o = take().t; const r = term(); v = o === '+' ? v.add(r) : v.sub(r); } return v; }
    function term() { let v = unary(); while (peek() && (peek().t === '*' || peek().t === '/')) { const o = take().t; const r = unary(); v = o === '*' ? v.mul(r) : v.div(r); } return v; }
    function unary() { if (peek() && peek().t === '-') { take(); return unary().neg(); } if (peek() && peek().t === '+') { take(); return unary(); } return power(); }
    function power() { const b = atom(); if (peek() && peek().t === '^') { take(); const ex = unary(); return b.pow(ex); } return b; }
    function atom() {
      const t = take(); if (!t) throw NN;
      if (t.t === 'n') return num(p - 1);
      if (t.t === '(') { const v = expr(); if (!take() || toks[p - 1].t !== ')') throw NN; return v; }
      if (t.t === 'R') { if (take().t !== '(') throw NN; const a = expr(); if (take().t !== ',') throw NN; const n = expr(); if (take().t !== ')') throw NN; if (a.n < 0n) throw NN; return Q.float(Math.pow(a.toNumber(), 1 / n.toNumber())); }
      throw NN;
    }
    const v = expr(); if (p !== toks.length) throw NN; return v;
  };
  let v;
  try { v = run(null); } catch (err) { if (err === DIV0) return { div0: true }; throw NN; }
  // Toleranz durch gerundete Zwischenwerte (nur solche aus derived)
  let tol = ZERO;
  if (derived && derived.size) for (const L of lits) {
    if (!L.d || !derived.has(L.q.n + '/' + L.q.d)) continue;
    let dv = ZERO;
    for (const s of [1, -1]) { try { const w = run({ k: L.k, q: s > 0 ? L.q.add(half(L.d)) : L.q.sub(half(L.d)) }); const x = w.sub(v).abs(); if (x.cmp(dv) > 0) dv = x; } catch (e) {} }
    tol = tol.add(dv);
  }
  amb = klassen.size ? 2 : 0;
  return { v, tol, lits, amb };
}
// Gibt es eine Lesart-Kombination, unter der A = B gilt? (Toleranz: Rundung der Zahl rechts)
function kombiOk(exA, exB) {
  let ra, rb; try { ra = evaluate(exA, 'pct'); rb = evaluate(exB, 'pct'); } catch (e) { return false; }
  if (!ra.amb && !rb.amb) return false;
  const nums = exB.match(NUMMIX) || [];
  for (const ka of kombis(ra.amb)) for (const kb of kombis(rb.amb)) for (const ma of ['pct', 'weg']) for (const mb of ['pct', 'weg']) {
    let a, b; try { a = evaluate(exA, ma, null, ka); b = evaluate(exB, mb, null, kb); } catch (e) { continue; }
    if (a.div0 || b.div0) continue;
    let d = null; if (nums.length === 1) { const l = lesarten(nums[0]); d = l[(l.length > 1 ? kb[/[.]|\{\.\}/.test(nums[0]) ? 0 : 1] || 0 : 0) % l.length].d; }
    const u = mb === 'pct' && /%/.test(exB) ? new Q(1n, 100n) : ONE;
    const dd = a.v.sub(b.v).abs();
    if (d != null && (dd.cmp(half(d).mul(u)) < 0 || roundQ(a.v.div(u), d).mul(u).cmp(b.v) === 0)) return true;
    if (dd.cmp(b.v.abs().mul(new Q(1n, 10n ** 9n)).add(new Q(1n, 10n ** 12n))) <= 0) return true;
  }
  return false;
}
// Werte von A (pct, weg, rel) in der Lesart, die dem gezeigten Ergebnis am nächsten kommt (für die Korrektur)
function besteLesart(exA, bVal) {
  let ra; try { ra = evaluate(exA, 'pct'); } catch (e) { return null; }
  if (!ra.amb || !bVal) return null;
  let best = null, bd = Infinity; const y = Math.abs(bVal.toNumber()) + 1e-12;
  for (const k of kombis(ra.amb)) {
    const vs = ['pct', 'weg', 'rel'].map(md => { try { const r = evaluate(exA, md, null, k); return r.div0 ? null : r.v; } catch (e) { return null; } });
    for (const v of vs) if (v) { const dist = Math.abs(Math.log10(Math.abs(v.toNumber()) + 1e-12) - Math.log10(y)); if (dist < bd) { bd = dist; best = vs; } }
  }
  return best;
}
// alle Lesart-Kombinationen eines Ausdrucks (höchstens 32)
function kombis(n) { return n ? [[0, 0], [1, 0], [0, 1], [1, 1]] : [[0, 0]]; }   // [Punkt-Zahlen, Komma-Zahlen]
const qkey = q => q.n + '/' + q.d;
let TRACE = null, EXAKT = new Set(), ERGEBNISSE = new Set();   // TRACE: geprüfte Ergebnisstellen (für Tests); EXAKT: Werte, die exakt aus einer Rechnung folgen
const numKeys = x => { const out = []; for (const m of String(x).matchAll(/(?<![\d.,}])\d+(?:(?:\{,\}|[.,])\d+)*(?![\d]|[.,]\d)/g)) { try { for (const l of lesarten(m[0])) out.push(qkey(l.q)); } catch (e) {} } return out; };

/* ================= Literal (reine Zahl, ggf. mit %) ================= */
function literal(part) {
  let p = part.replace(/^\s*\\(?:text|mathrm)\{[^{}]*:\s*\}/, '').replace(/\\text\{\s*(?:Prozentpunkte|Prozent|Pp\.?|PP)\s*\}/g, '\\%');
  p = p.replace(/\\(?:text|mathrm)\{\s*[A-Za-zÄÖÜäöüß./ ]+\}\s*$/, '').trimEnd();
  p = p.trim().replace(/−/g, '-').replace(/\\[,;!: ]|~/g, '').replace(/\{,\}/g, ',');
  p = p.replace(/\\(?:text|mathrm)\{\s*[^{}\d]*\}/g, '').replace(/\\%/g, '%').replace(/€/g, '').replace(/\s+/g, ' ').trim().replace(/^\+/, '').trim();
  const m = /^(-?)(\d+(?:[.,]\d+)*)\s*(%)?$/.exec(p); if (!m) return null;
  let l; try { l = lesarten(m[2])[0]; } catch (e) { return null; }
  return { q: m[1] ? l.q.neg() : l.q, d: l.d, pct: !!m[3] };
}
const fein = (q, d) => !q.isZero() && half(d).cmp(q.abs().mul(new Q(25n, 10000n))) <= 0;

/* ================= Werte, die als Ergebnis dastehen (gerundete Zwischenwerte) ================= */
function strings(o, path = [], out = []) {
  if (typeof o === 'string') out.push([path, o]);
  else if (Array.isArray(o)) o.forEach((v, i) => strings(v, path.concat(i), out));
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) strings(o[k], path.concat(k), out);
  return out;
}
function derivedValues(strs) {
  const out = new Set();
  for (const [, s] of strs) {
    const t = s.replace(/\{,\}/g, ',').replace(/\\approx/g, '≈').replace(/\\[,;]/g, '');
    const re = /(?:=|≈)\s*[−-]?\s*(\d{1,3}(?:\.\d{3})+|\d+),(\d+)(?!\d|\s*(?:\^|\\cdot|\\times|[+*/·:−]|-\s*\d|\\frac|\\right|\)))/g; let m;
    while ((m = re.exec(t))) {
      const left = t.slice(Math.max(0, m.index - 160), m.index).split(/=|≈|\\\(|\\\[|\n|</).pop();
      if (!/\d/.test(left) || !/\\cdot|\\times|\\frac|[+*/:^·−]|\d\s*-\s*\d|\\sqrt/.test(left)) continue;
      const val = Q.dec(m[1].replace(/\./g, '') + '.' + m[2]);
      try { const r = evaluate(texToExpr(left.replace(/,/g, '{,}')), 'pct'); if (r.v && (r.v.cmp(val) === 0 || r.v.cmp(val.div(HUNDRED)) === 0 || r.v.cmp(val.neg()) === 0)) continue; } catch (e) {}
      if (fein(val, m[2].length)) out.add(qkey(val));
    }
  }
  return out;
}

/* ================= Formelketten prüfen ================= */
const CHAIN_SPLIT = /\\\\|&|\\q?quad|,\\;|;\s|\\;\s*\\Rightarrow\\;|(?<=\d):\s/;
const REL = /(=|\\approx|≈|\\Rightarrow|\\to|\\geq|\\leq|\\neq|≠|<|>)/;
function litsOf(x) { const s = new Set(); for (const m of x.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+)\{?,\}?(\d+)/g)) s.add(qkey(Q.dec(m[1].replace(/\./g, '') + '.' + m[2]))); return s; }
function ltolA(l, mode) { return l && l.d > 0 && (ERGEBNISSE.has(qkey(l.q)) || ERGEBNISSE.has(qkey(l.q.div(HUNDRED)))) ? ltol(l, mode) : ZERO; }   // Zahl links: nur gerundet, wenn sie irgendwo als Ergebnis steht
function ltol(l, mode) { if (!l || EXAKT.has(qkey(l.pct && mode === 'pct' ? l.q.div(HUNDRED) : l.q)) || EXAKT.has(qkey(l.q))) return ZERO; const t = half(l.d); return l.pct && mode === 'pct' ? t.div(HUNDRED) : t; }

function eingabeAlternative(expr, b, tol, kand) {
  const pos = [...expr.matchAll(NUMMIX)];
  for (const m of pos) {
    let alt; try { alt = lesarten(m[0])[0].q; } catch (e) { continue; }
    for (const c of kand) {
      if (alt.cmp(c) === 0) continue;
      const z = c.n * 10n ** 12n / c.d; if (c.n * 10n ** 12n % c.d) continue;   // nur endliche Dezimalzahlen
      const str = (z < 0n ? '-' : '') + ((z < 0n ? -z : z) / 10n ** 12n).toString() + ',' + ((z < 0n ? -z : z) % 10n ** 12n).toString().padStart(12, '0');
      const e2 = expr.slice(0, m.index) + str + expr.slice(m.index + m[0].length);
      try { const r = evaluate(e2, 'pct'); if (!r.div0 && r.v.sub(b).abs().cmp(tol.add(b.abs().mul(new Q(1n, 10n ** 9n)))) <= 0) return true; } catch (e) {}
    }
  }
  return false;
}

// Richtiger Wert für ein falsches Ergebnis: alle Lesarten (mit/ohne %, Skala Mio./Mrd.) – nur wenn eine klar am nächsten liegt.
function korrWert(vals, lit, scales, umfeld) {
  // natürliche Lesarten: % als /100 auf beiden Seiten (pct, rel) oder % auf beiden Seiten weglassen (weg)
  const [vp, vw, vr] = vals.map(v => (!v || v === 'DIV0') ? null : v);
  const natur = [], alle = [];
  for (const sc of scales) {
    for (const v of [vp, vr]) if (v) { natur.push([v.div(sc).mul(lit.pct ? HUNDRED : ONE), sc]); }
    if (vw) natur.push([vw.div(sc), sc]);
    for (const v of [vp, vw, vr]) if (v) { alle.push([v.div(sc), sc]); if (lit.pct) alle.push([v.div(sc).mul(HUNDRED), sc]); }
  }
  const y = Math.abs(lit.q.toNumber()) + 1e-12, dist = c => Math.abs(Math.log10(Math.abs(c.toNumber()) + 1e-12) - Math.log10(y));
  const wahl = list => {
    const uniq = []; for (const [c] of list) if (!uniq.some(u => u.cmp(c) === 0)) uniq.push(c);
    if (!uniq.length) return null;
    uniq.sort((a, b) => dist(a) - dist(b));
    if (uniq.length > 1 && dist(uniq[1]) - dist(uniq[0]) < 0.3) return null;   // zwei Lesarten gleich plausibel → nicht raten
    return uniq[0];
  };
  // ohne Skalenwechsel sind sich alle natürlichen Lesarten einig → eindeutig
  const n1 = natur.filter(([, sc]) => sc === ONE).map(([c]) => c);
  let c = n1.length && n1.every(x => x.cmp(n1[0]) === 0) && scales.length === 1 ? n1[0] : (wahl(natur) || wahl(alle));
  if (!c) return null;
  const s = pow10(lit.d), x = c.mul(s);
  if (/aufgerundet|aufrunden|aufzurunden|mindestens/.test(umfeld) && x.d !== 1n) c = new Q(x.n / x.d + (x.n > 0n ? 1n : 0n)).div(s);
  else if (/abgerundet|abrunden|abzurunden|ganze[n]? (?:Stück|Einheiten|Zahl)|höchstens/.test(umfeld) && x.d !== 1n) c = new Q(x.n / x.d - (x.n < 0n ? 1n : 0n)).div(s);
  return c;
}

// Prüft eine Formel (TeX-Inhalt). Liefert Befunde mit Position (relativ zum TeX-String) und – wo eindeutig – Korrektur.
function checkTex(tex, ctx, after, derived) {
  const out = [];
  const scales = [ONE];
  if (/Mio/.test(tex)) scales.push(new Q(1n, 1000000n), new Q(1000000n));
  if (/Mrd/.test(tex)) scales.push(new Q(1n, 1000000000n), new Q(1000000000n));
  if (/^\s*Mio/.test(after)) scales.push(new Q(1000000n));
  if (/^\s*Mrd/.test(after)) scales.push(new Q(1000000000n));
  if (/^\s*(Tsd|Tausend)/.test(after)) scales.push(new Q(1000n));
  const umf = after.slice(0, 80) + ' ' + ctx;
  const auf = /aufgerundet|aufrunden|aufzurunden/.test(umf), ab = /abgerundet|abrunden|abzurunden|ganze[n]? (?:Stück|Einheiten|Zahl)|volle[n]? (?:Stück|Jahre|Monate)/.test(umf);
  // Ketten mit Startposition
  let pos = 0; const chains = [];
  const sp = new RegExp(CHAIN_SPLIT.source, 'g'); let mm, last = 0;
  while ((mm = sp.exec(tex))) { chains.push([tex.slice(last, mm.index), last]); last = mm.index + mm[0].length; if (mm[0] === '') sp.lastIndex++; }
  chains.push([tex.slice(last), last]);
  for (const [chain, cpos] of chains) {
    const segs = chain.split(REL); if (segs.length < 3) continue;
    const base = new Set(derived);
    const items = []; let op = null, off = cpos;
    segs.forEach((s, k) => { if (k % 2) { op = s; } else items.push({ s, op, start: off }); off += s.length; });
    let prev = '';
    for (const it of items) {
      it.lit = literal(it.s);
      const neu = prev && !it.lit ? [...litsOf(it.s)].filter(x => !litsOf(prev).has(x)) : [];
      neu.forEach(x => derived.add(x));
      let ex = null; try { ex = texToExpr(it.s); } catch (e) { ex = null; }
      it.v = {}; it.tol = {}; it.tn = {};
      for (const md of ['pct', 'weg', 'rel']) { try { const r = ex == null ? null : evaluate(ex, md, derived); it.v[md] = r ? (r.div0 ? 'DIV0' : r.v) : null; it.tol[md] = r && !r.div0 ? r.tol : ZERO; } catch (e) { it.v[md] = null; it.tol[md] = ZERO; } }
      neu.forEach(x => { if (!base.has(x)) derived.delete(x); });
      for (const md of ['pct', 'weg', 'rel']) { try { const r = ex == null || it.v[md] == null || it.v[md] === 'DIV0' ? null : evaluate(ex, md, derived); it.tn[md] = r ? r.tol : ZERO; } catch (e) { it.tn[md] = ZERO; } }
      it.ex = ex;
      if (it.v.pct != null || it.v.weg != null) prev = it.s;
    }
    for (let k = 0; k + 1 < items.length; k++) {
      const A = items[k], B = items[k + 1], s1 = A.s, s2 = B.s, opB = B.op;
      if (/^\s*(\+|\\cdot|\\times|\{\}\s*[-+])/.test(s1)) continue;
      if (/^\s*[-−+]/.test(s1) && /\\(?:text|mathrm)\{\s*[A-Za-zÄÖÜäöüß]/.test(s1)) continue;   // Kalkulationsschema: „− 10 % Rabatt = …“
      const u1 = /\\text\{\s*([^{}\d]+?)\s*\}\s*$/.exec(s1.trim()), u2 = /\\text\{\s*([^{}\d]+?)\s*\}\s*$/.exec(s2.trim());
      if (u1 && A.lit && !['€', 'Euro'].includes(u1[1].split(/\s/)[0]) && (!u2 || u2[1].split(/\s/)[0] !== u1[1].split(/\s/)[0])) continue;
      if (['\\Rightarrow', '\\to', '\\geq', '\\leq', '<', '>'].includes(opB)) continue;
      if (A.v.pct == null && A.v.weg == null) continue;
      if (B.v.pct == null && B.v.weg == null) continue;
      const neg = opB === '\\neq' || opB === '≠';
      if (A.v.pct === 'DIV0' || B.v.pct === 'DIV0') { out.push({ art: 'division-durch-null', text: `${s1.trim()} ${opB} ${s2.trim()}`, start: A.start, end: B.start + s2.length }); continue; }
      let ok = false;
      for (const m1 of ['pct', 'weg', 'rel']) for (const m2 of ['pct', 'weg']) {
        const a = A.v[m1], b = B.v[m2];
        if (a == null || b == null || a === 'DIV0' || b === 'DIV0') continue;
        for (const sc of scales) {
          const t = A.tn[m1].add(B.tol[m2].mul(sc)).add(ltolA(A.lit, m1)).add(ltol(B.lit, m2).mul(sc));
          const dd = a.sub(b.mul(sc)).abs();
          if (dd.cmp(t) < 0 || dd.cmp(b.mul(sc).abs().mul(new Q(1n, 10n ** 12n)).add(new Q(1n, 10n ** 12n))) <= 0) ok = true;
          if (dd.isZero() && sc === ONE) { const l1 = litsOf(s1); for (const x of litsOf(s2)) if (!l1.has(x)) EXAKT.add(x); }
        }
        if (B.lit && A.tol[m1].isZero() && (!A.lit || ltolA(A.lit, m1).isZero())) {   // exakter Wert genau auf der Rundungsgrenze: kaufmännisch
          const u = B.lit.pct && m2 === 'pct' ? new Q(1n, 100n) : ONE;
          if (roundQ(a.div(u), B.lit.d).mul(u).cmp(b) === 0) ok = true;
        }
        if (/ungerundet/.test(ctx + after.slice(0, 120)) && a.sub(b).abs().cmp(b.abs().div(HUNDRED)) <= 0) ok = true;
        if ((auf || ab) && b.d === 1n && a.d !== 1n) { const fl = a.n / a.d - (a.n < 0n && a.n % a.d ? 1n : 0n); if ((ab && b.n === fl) || (auf && b.n === fl + 1n)) ok = true; }
      }
      if (!ok && A.ex && B.ex && kombiOk(A.ex, B.ex)) ok = true;   // andere Lesart der Zahlen (deutsch/englisch gemischt)
      if (TRACE && B.lit) { const lead = s2.match(/^\s*/)[0].length; const nm = /[−-]?\s*\d+(?:(?:\{,\}|[.,])\d+)*/.exec(s2.slice(lead)); if (nm) TRACE.push({ start: B.start + lead + nm.index, end: B.start + lead + nm.index + nm[0].length, tex: true }); }
      if (neg) { if (ok) out.push({ art: 'ungleich-aber-gleich', text: `${s1.trim()} ≠ ${s2.trim()}`, start: A.start, end: B.start + s2.length }); continue; }
      if (ok) continue;
      // Gegenprobe: alle gezeigten Dezimalwerte als gerundet → nur Rundungs-Inkonsistenz?
      let art = 'rechnung-falsch';
      const saved = new Set(derived);
      for (const src of [s1, s2]) for (const m of src.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+)\{,\}(\d+)/g)) { const x = Q.dec(m[1].replace(/\./g, '') + '.' + m[2]); if (fein(x, m[2].length) && !EXAKT.has(qkey(x)) && ERGEBNISSE.has(qkey(x))) derived.add(qkey(x)); }
      try {
        const t1 = evaluate(texToExpr(s1), 'pct', derived), t2 = evaluate(texToExpr(s2), 'pct', derived);
        if (!t1.div0 && !t2.div0) { const ll = ltolA(A.lit, 'pct').add(ltol(B.lit, 'pct')).add(t1.tol).add(t2.tol); const dd = t1.v.sub(t2.v).abs(), ulp = B.lit ? half(B.lit.d).mul(new Q(2n)).mul(B.lit.pct ? new Q(1n, 100n) : ONE) : t2.v.abs().mul(new Q(1n, 10000n)); if (dd.cmp(ll.mul(new Q(1000001n, 1000000n)).add(new Q(1n, 10n ** 9n))) <= 0 && dd.cmp(ulp.mul(new Q(1000001n, 1000000n))) <= 0) art = 'rundung-inkonsistent'; }
      } catch (e) {}
      derived.clear(); saved.forEach(x => derived.add(x));
      // Korrektur: rechte Seite ist eine reine Zahl, links eindeutig gerechnet (Modus pct) → richtigen Wert einsetzen
      const f = { art, text: `${s1.trim()} ${opB} ${s2.trim()}`, start: A.start, end: B.start + s2.length, bvon: B.start, inputs: numKeys(s1), aExpr: A.ex, bWert: B.v.pct && B.v.pct !== 'DIV0' ? B.v.pct : null, bTol: ltol(B.lit, 'pct') };
      if (B.lit) { const lead = s2.match(/^\s*/)[0].length; const nm = /[−-]?\s*\d+(?:(?:\{,\}|[.,])\d+)*/.exec(s2.trimEnd().slice(lead)); if (nm) f.bspan = { start: B.start + lead + nm.index, end: B.start + lead + nm.index + nm[0].length, alt: nm[0] }; }
      const val = art === 'rechnung-falsch' && B.lit ? korrWert([A.v.pct, A.v.weg, A.v.rel], B.lit, scales, after.slice(0, 80) + ' ' + ctx.slice(-60)) : null;
      if (val) {
        const lead = s2.match(/^\s*/)[0].length, body = s2.trimEnd();
        const numM = /[−-]?\s*\d+(?:(?:\{,\}|[.,])\d+)*/.exec(body.slice(lead));
        if (numM) {
          const tokB = numM[0].replace(/^[−-]?\s*/, ''), en = enFuer(tokB);
          const useTex = /\{,\}/.test(numM[0]) || !/,/.test(numM[0]);
          const sg = (numM[0].trim().match(/^[−-]/) || [])[0] || (/^\s*-/.test(s2) ? '-' : '-'); const rep = fmtNum(val, B.lit.d, useTex, en).replace(/^-/, sg);
          f.fix = { start: B.start + lead + numM.index, end: B.start + lead + numM.index + numM[0].length, alt: numM[0], neu: rep };
        }
      }
      out.push(f);
    }
  }
  return out;
}

/* ================= Rechnungen im Fließtext ================= */
// Ketten wie „5 · 3 = 15“, „3.000 ÷ 60.000 · 100 = 5,0 %“, „15 % von 200 € = 30 €“, „100 / 0,40 = 250 € “, „√(800.000 / 2) = 632 Stück“
const P_UNIT_RE = /^\s?((?:units?|pieces?|years?|days?|months?|hours?|percent(?:age points)?|pp|USD|EUR|\$)(?![\wäöü])|€\/(?:Stück|Stk\.?|h|ME|Jahr|Monat|Kunde)|Stück\/(?:Jahr|Monat|Tag)|€|%|Euro|Prozentpunkte|Prozent|Stück|Stk\.?|Std\.?|h(?![\wäöü])|Tage[n]?(?![\wäöü])|Jahre[n]?(?![\wäöü])|Monate[n]?(?![\wäöü])|Punkte(?![\wäöü])|Pp\.?|ME(?![\wäöü])|GE(?![\wäöü])|Mio\.?(?:\s?€)?|Mrd\.?(?:\s?€)?|Tsd\.?(?:\s?€)?)/;
const WORD_OPS = [['geteilt durch', '/'], ['durch', '/'], ['mal', '*'], ['plus', '+'], ['minus', '-'], ['divided by', '/'], ['times', '*'], ['multiplied by', '*']];
function tokProse(t) {
  const toks = []; let i = 0;
  const isSp = c => c === ' ' || c === '\t' || c === ' ' || c === ' ';
  while (i < t.length) {
    const c = t[i];
    if (isSp(c)) { i++; continue; }
    const m = /^\d+(?:[.,]\d+)*/.exec(t.slice(i, i + 40));
    if (m && !/[\d\wÄÖÜäöüß]/.test(t[i - 1] || '')) {
      let j = i + m[0].length;
      if (/^[.,:]\d/.test(t.slice(j, j + 2)) && !(t[j] === ':' )) { toks.push({ t: 'x', s: i, e: j + 2 }); i = j + 2; continue; }   // Datum/Version
      if (/^[\wÄÖÜäöüß]/.test(t[j] || '') && !P_UNIT_RE.test(t.slice(j))) { toks.push({ t: 'x', s: i, e: j }); i = j; continue; }   // 3a, 2er
      const u = P_UNIT_RE.exec(t.slice(j, j + 20)); let unit = '';
      if (u) { unit = u[1]; j += u[0].length; }
      let sup = '';
      if (/[²³]/.test(t[j] || '')) { sup = t[j] === '²' ? '2' : '3'; j++; }
      toks.push({ t: 'n', s: i, e: j, num: m[0], unit, sup, ne: i + m[0].length }); i = j; continue;
    }
    if (c === '–' && isSp(t[i - 1] || '') && isSp(t[i + 1] || '')) { toks.push({ t: 'x', s: i, e: i + 1 }); i++; continue; }
    if ('·×*/÷+−-–^()√'.includes(c)) { toks.push({ t: c === '(' || c === ')' ? c : c === '√' ? 'sqrt' : 'op', op: { '·': '*', '×': '*', '*': '*', '/': '/', '÷': '/', '+': '+', '−': '-', '-': '-', '–': '-', '^': '^' }[c], s: i, e: i + 1 }); i++; continue; }
    if (c === ':') { // Division nur mit Leerzeichen davor („12 : 4“); „Jahr 2:“ ist eine Beschriftung
      if (isSp(t[i - 1] || '') && isSp(t[i + 1] || '')) toks.push({ t: 'op', op: '/', s: i, e: i + 1 }); else toks.push({ t: 'x', s: i, e: i + 1 });
      i++; continue;
    }
    if (c === '=' || c === '≈') { toks.push({ t: 'rel', rel: c, s: i, e: i + 1 }); i++; continue; }
    const w = /^[A-Za-zÄÖÜäöüß_]+/.exec(t.slice(i, i + 40));
    if (w) {
      const rest = t.slice(i, i + 20);
      const wo = WORD_OPS.find(([k]) => rest.startsWith(k) && !/[\wäöü]/.test(rest[k.length] || ''));
      if (wo) { toks.push({ t: 'op', op: wo[1], s: i, e: i + wo[0].length, word: true }); i += wo[0].length; continue; }
      if (w[0] === 'von' || w[0] === 'of') { toks.push({ t: 'von', s: i, e: i + w[0].length }); i += w[0].length; continue; }
      if (/^(ergibt|ergeben|macht|equals|gives|makes)$/.test(w[0])) { toks.push({ t: 'rel', rel: '=', s: i, e: i + w[0].length }); i += w[0].length; continue; }
      if (w[0] === 'x' && toks.length && toks[toks.length - 1].t === 'n') { toks.push({ t: 'op', op: '*', s: i, e: i + 1 }); i++; continue; }
      toks.push({ t: 'w', s: i, e: i + w[0].length }); i += w[0].length; continue;
    }
    toks.push({ t: 'x', s: i, e: i + 1 }); i++;
  }
  return toks;
}
// Ausdruck = Tokenfolge aus Zahlen/Operatoren/Klammern/√/„% von“; liefert [ende, exprString, info] oder null
function readExpr(toks, k) {
  let out = '', depth = 0, j = k, nums = 0, ops = 0, last = null, units = new Set(), pct = false, sqrtStack = [];
  const closeSq = [];
  while (j < toks.length) {
    const tk = toks[j];
    if (tk.t === 'n') {
      if (last && (last.t === 'n' || last.t === ')')) break;
      const isP = /^(%|Prozent|Prozentpunkte|Pp)/.test(tk.unit);
      out += tk.num + (isP ? '%' : '') + (tk.sup ? '^' + tk.sup : '');
      if (tk.unit && !isP) units.add(tk.unit.replace(/\.$/, '').split(/\s/)[0]);
      if (isP) pct = true;
      nums++; last = tk; j++;
      while (closeSq.length && closeSq[closeSq.length - 1] === depth && (!toks[j] || toks[j].t !== '^')) { closeSq.pop(); out += ',2)'; }
      continue;
    }
    if (tk.t === 'von') { if (last && last.t === 'n' && /^(%|Prozent)/.test(last.unit)) { out += '*'; ops++; last = tk; j++; continue; } return null; }
    if (tk.t === 'op') {
      if (last && last.t === 'op' && tk.op !== '-' && tk.op !== '+') break;
      if (!last && tk.op !== '-' && tk.op !== '+') break;
      if (tk.word && (!last || last.t !== 'n' && last.t !== ')')) break;
      out += tk.op; ops++; last = tk; j++; continue;
    }
    if (tk.t === 'sqrt') { out += 'R('; closeSq.push(depth); ops++; last = tk; j++; continue; }
    if (tk.t === '(') { if (last && (last.t === 'n' || last.t === ')')) { out += '*'; } out += '('; depth++; last = tk; j++; continue; }
    if (tk.t === ')') { if (!depth) break; out += ')'; depth--; last = tk; j++; while (closeSq.length && closeSq[closeSq.length - 1] === depth && (!toks[j] || toks[j].t !== '^')) { closeSq.pop(); out += ',2)'; } continue; }
    break;
  }
  // hinten offene Operatoren abschneiden
  while (j > k && (toks[j - 1].t === 'op' || toks[j - 1].t === '(' || toks[j - 1].t === 'sqrt' || toks[j - 1].t === 'von')) return null;
  if (depth || closeSq.length || !nums) return null;
  const neg1 = toks[k].t === 'op' && toks[k].op === '-' && j - k === 2 && toks[k + 1].t === 'n';
  const single = nums === 1 && (j - k === 1 || neg1);
  return { end: j, expr: out, nums, ops: single ? 0 : ops, units, pct, s: toks[k].s, e: toks[j - 1].e, single, neg: neg1, tok: neg1 ? toks[k + 1] : toks[k] };
}
function checkProse(text, derived) {
  const out = []; const toks = tokProse(text);
  const val = (x, md) => { try { const r = evaluate(x.expr, md, derived); return r.div0 ? 'DIV0' : r; } catch (e) { return null; } };
  for (let k = 0; k < toks.length; k++) {
    if (toks[k].t !== 'n' && toks[k].t !== '(' && toks[k].t !== 'sqrt' && !(toks[k].t === 'op' && toks[k].op === '-')) continue;
    if (k && (toks[k - 1].t === 'n' || toks[k - 1].t === ')' || toks[k - 1].t === 'op' || toks[k - 1].t === 'sqrt' || toks[k - 1].t === '(' || toks[k - 1].t === 'von')) continue;
    // Ausdruck abgeschnitten? (davor steht ein Operator, ggf. getrennt durch ein Wort wie „MEK“)
    let cut = false;
    { let p = k - 1; if (p >= 0 && toks[p].t === 'w') p--; if (p >= 0 && (toks[p].t === 'op' || toks[p].t === 'sqrt' || toks[p].t === '(')) cut = true; }
    const chain = []; let j = k; let x = readExpr(toks, j); if (!x) continue;
    chain.push(x); j = x.end;
    while (j < toks.length && toks[j].t === 'rel') { const y = readExpr(toks, j + 1); if (!y) break; y.rel = toks[j].rel; chain.push(y); j = y.end; }
    if (chain.length < 2) { k = Math.max(k, x.end - 1); continue; }
    // Kette endet mitten im Ausdruck (folgt Operator/Wort-Operator) → letzter Teil unvollständig
    const tail = toks[j]; const tailCut = tail && (tail.t === 'op' || tail.t === 'sqrt' || tail.t === 'von');
    for (let q = 0; q + 1 < chain.length; q++) {
      if (q === 0 && cut) continue;
      if (q + 1 === chain.length - 1 && tailCut) continue;
      const A = chain[q], B = chain[q + 1];
      if (!A.ops && !B.ops) continue;                 // „20 % = 0,2“ o. Ä.: Umrechnung, keine Rechnung
      if (A.ops === 0 && B.ops) continue;             // „x = 5 + 3“ rückwärts: nur Rechnung → Ergebnis prüfen
      const sc = u => [...u].some(z => /^(Mio|Mrd|Tsd)/.test(z));
      if (sc(A.units) !== sc(B.units)) continue;
      const au = [...A.units].filter(z => !/^€|Euro/.test(z)), bu = [...B.units].filter(z => !/^€|Euro/.test(z));
      if (au.length && bu.length && !bu.some(z => au.includes(z)) && !/\//.test(au.join() + bu.join())) continue;
      const res = {}; for (const md of ['pct', 'weg']) { res['A' + md] = val(A, md); res['B' + md] = val(B, md); }
      if (res.Apct === 'DIV0') { out.push({ art: 'division-durch-null', text: text.slice(A.s, B.e), start: A.s, end: B.e }); continue; }
      if (!res.Apct || !res.Bpct || res.Bpct === 'DIV0') continue;
      let bl = null; if (B.single) { try { const l = lesarten(B.tok.num)[0]; bl = { q: B.neg ? l.q.neg() : l.q, d: l.d }; } catch (e) { continue; } }
      if (TRACE && bl) TRACE.push({ start: B.neg ? B.s : B.tok.s, end: B.tok.ne });
      let ok = false;
      for (const ma of ['pct', 'weg']) for (const mb of ['pct', 'weg']) {
        const a = res['A' + ma], b = res['B' + mb]; if (!a || !b || a === 'DIV0' || b === 'DIV0') continue;
        const u = bl && B.pct && mb === 'pct' ? new Q(1n, 100n) : ONE;
        let tol = a.tol.add(b.tol); if (bl) tol = tol.add(half(bl.d).mul(u));
        const dd = a.v.sub(b.v).abs();
        if (dd.cmp(tol) < 0 || dd.cmp(b.v.abs().mul(new Q(1n, 10n ** 12n)).add(new Q(1n, 10n ** 12n))) <= 0) ok = true;
        if (bl && roundQ(a.v.div(u), bl.d).mul(u).cmp(b.v) === 0) ok = true;
        if (bl && bl.d === 0 && a.v.d !== 1n) { const umf = text.slice(B.e, B.e + 60) + ' ' + text.slice(Math.max(0, A.s - 60), A.s); const auf = /aufgerundet|aufrunden|aufzurunden/.test(umf), ab = /abgerundet|abrunden|abzurunden|ganze[n]? (?:Stück|Einheiten|Zahl)|volle[n]? (?:Stück|Jahre|Monate)/.test(umf); const fl = a.v.n / a.v.d - (a.v.n < 0n ? 1n : 0n); if ((ab && b.v.cmp(new Q(fl)) === 0) || (auf && b.v.cmp(new Q(fl + 1n)) === 0)) ok = true; }
      }
      if (!ok && kombiOk(A.expr, B.expr)) ok = true;   // andere Lesart der Zahlen (deutsch/englisch gemischt)
      if (ok) continue;
      let art = 'rechnung-falsch';
      {   // nur gerundete Zwischenwerte (z. B. 54,55 + 49,59) → Rundungsdifferenz, keine falsche Rechnung
        const d2 = new Set(derived);
        for (const m of (A.expr + ' ' + B.expr).matchAll(/(\d{1,3}(?:\.\d{3})+|\d+),(\d+)/g)) { const x = Q.dec(m[1].replace(/\./g, '') + '.' + m[2]); if (fein(x, m[2].length) && !EXAKT.has(qkey(x)) && ERGEBNISSE.has(qkey(x))) d2.add(qkey(x)); }
        for (const ma of ['pct', 'weg']) for (const mb of ['pct', 'weg']) {
          let a, b; try { a = evaluate(A.expr, ma, d2); b = evaluate(B.expr, mb, d2); } catch (e) { continue; }
          if (a.div0 || b.div0) continue;
          const u = bl && B.pct && mb === 'pct' ? new Q(1n, 100n) : ONE;
          const tol = a.tol.add(b.tol).add(bl ? half(bl.d).mul(u) : ZERO);
          const ulp = bl ? half(bl.d).mul(new Q(2n)).mul(u) : b.v.abs().mul(new Q(1n, 10000n)); if (a.v.sub(b.v).abs().cmp(tol.mul(new Q(1000001n, 1000000n))) <= 0 && a.v.sub(b.v).abs().cmp(ulp.mul(new Q(1000001n, 1000000n))) <= 0) art = 'rundung-inkonsistent';
        }
      }
      const f = { art, text: text.slice(A.s, B.e), start: A.s, end: B.e, bvon: B.s, inputs: numKeys(A.expr), aExpr: A.expr, bWert: res.Bpct && res.Bpct !== 'DIV0' ? res.Bpct.v : null, bTol: bl ? half(bl.d).mul(B.pct ? new Q(1n, 100n) : ONE) : ZERO };
      if (bl) { const st = B.neg ? B.s : B.tok.s; f.bspan = { start: st, end: B.tok.ne, alt: text.slice(st, B.tok.ne) }; }
      if (bl && art === 'rechnung-falsch') {   // Korrektur: Wert in der Darstellung von B (mit/ohne %), nur bei eindeutiger Lesart
        const c = korrWert(['pct', 'weg'].map(md => res['A' + md] && res['A' + md] !== 'DIV0' ? res['A' + md].v : null), { ...bl, pct: B.pct }, [ONE], text.slice(B.e, B.e + 80) + ' ' + text.slice(Math.max(0, A.s - 60), A.s));
        if (c) { const sg = B.neg ? text[B.s] : '−'; const rep = fmtNum(c, bl.d, false, enFuer(B.tok.num)).replace(/^-/, sg); const st = B.neg ? B.s : B.tok.s; f.fix = { start: st, end: B.tok.ne, alt: text.slice(st, B.tok.ne), neu: rep }; }
      }
      out.push(f);
    }
    k = j - 1;
  }
  return out;
}

/* ================= Buchungssätze ================= */
const AMT = /(?<![\d.,])(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?(?![\d.]|,\d)/g;
const unesc = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
function amounts(side) {
  side = side.replace(/\(\s*\d{3,5}\s*\)/g, '').replace(/\d+(?:,\d+)?\s*%/g, '').replace(/\b(?:19|7)\s*%?\s*(?:USt|VSt)/g, '').replace(/\b(?:aLuL|LuL|GuV|AfA|BGA|SBK|EBK)\b/g, '').replace(/\b\d{1,2}\.\s?\d{1,2}\.(?:\s?\d{2,4})?/g, '');
  const out = []; for (const m of side.matchAll(/(?<![\d.,])\d+(?:[.,]\d+)*(?![\d]|[.,]\d)/g)) { try { out.push(lesarten(m[0])[0].q); } catch (e) {} } return out;
}
const sumQ = a => a.reduce((s, x) => s.add(x), ZERO);
const STOP_EN = /\b(?:is|are|was|were|be|been|the|a|an|of|for|from|with|when|if|you|we|they|it|this|that|in|on|at|by|per|each|then|so|step|pays|paid|buys|bought|sells|sold|book|booked|goes|transfer|transfers|want|how|why|what)\b/i;
const STOP = /\b(?:wird|werden|ist|sind|bucht|gebucht|zahlt|überweist|kauft|verkauft|du|man|wenn|weil|dass|der|die|das|den|dem|des|ein|eine|einen|einem|einer|am|im|in|von|mit|bei|pro|je|auf|zu|für|nach|aus|Schritt)\b/;
function checkBuchung(seg, out) {
  const AN = SPR === 'en' ? ' to ' : ' an ', anRe = SPR === 'en' ? / to /g : / an /g;
  let t = unesc(seg.replace(/<[^>]+>/g, ' ')).replace(/\u00a0/g, ' ').replace(/−/g, '-').replace(/\s+/g, ' ').trim();
  if (!t.includes(AN) || /\\\(|\\frac|=/.test(t)) return;
  const s0 = t.split(AN)[0]; if (s0.includes(': ')) t = s0.split(': ').pop() + AN + t.split(AN).slice(1).join(AN);
  if ((t.match(anRe) || []).length > 1) {
    const parts = t.split(SPR === 'en' ? /\s(?:and|,)\s(?=[A-Z][^,]*?\d[^,]*? to )/ : /\s(?:und|sowie|,)\s(?=[A-ZÄÖÜ][^,]*?\d[^,]*? an )/);
    if (parts.length > 1 && parts.every(x => x.includes(AN))) { parts.forEach(x => checkBuchung(x, out)); return; }
  }
  const i = t.indexOf(AN), soll = t.slice(0, i), haben = t.slice(i + AN.length);
  if (!/^[A-ZÄÖÜ]/.test(soll) || !/^\s*[A-ZÄÖÜ]/.test(haben)) return;
  if ((SPR === 'en' ? STOP_EN : STOP).test(soll + ' ' + haben.split(',')[0])) return;
  const a = amounts(soll), b = amounts(haben); if (!a.length || !b.length) return;
  if (sumQ(a).cmp(sumQ(b))) out.push({ art: 'buchung-soll-ungleich-haben', text: t.slice(0, 220), soll: sumQ(a).toNumber(), haben: sumQ(b).toNumber() });
}
// Markdown-Tabellen (| a | b |) → HTML, damit dieselbe Tabellenprüfung greift
function mdTables(s) {
  const out = []; const lines = s.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\|.*\|\s*$/.test(lines[i]) || !/^\s*\|?\s*:?-{2,}/.test(lines[i + 1] || '')) continue;
    const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim().replace(/\*\*/g, ''));
    let html = '<table><tr>' + cells(lines[i]).map(c => '<th>' + c + '</th>').join('') + '</tr>';
    let k = i + 2; for (; k < lines.length && /^\s*\|.*\|\s*$/.test(lines[k]); k++) html += '<tr>' + cells(lines[k]).map(c => '<td>' + c + '</td>').join('') + '</tr>';
    out.push(html + '</table>'); i = k - 1;
  }
  return out.join('\n');
}
function checkTables(s, out) {
  for (const tb of s.match(/<table[\s\S]*?<\/table>/g) || []) {
    const heads = [...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(x => x[1].replace(/<[^>]+>/g, '').trim());
    const hl = heads.map(h => h.toLowerCase());
    const rows = [...tb.matchAll(/<tr[\s\S]*?<\/tr>/g)].map(r => [...r[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(c => unesc(c[1].replace(/<[^>]+>/g, '')).trim())).filter(r => r.length);
    const sw = hl.includes('soll') ? 'soll' : 'debit', hw = hl.includes('haben') ? 'haben' : 'credit';
    if (hl.includes(sw) && hl.includes(hw)) {
      const si = hl.indexOf(sw), hi = hl.indexOf(hw);
      for (const r of rows) { if (r.length <= Math.max(si, hi) || r.length !== heads.length) continue; const a = amounts(r[si]), b = amounts(r[hi]); if (a.length && b.length && sumQ(a).cmp(sumQ(b))) out.push({ art: 'buchung-soll-ungleich-haben', text: 'Tabellenzeile ' + r.join(' | ') }); }
    }
    checkSumRows(heads, rows, out);
  }
}
// Summenzeilen: Zeile „Summe/Gesamt/Σ/Bilanzsumme/insgesamt“ = Summe der Zahlen darüber (je Spalte, nur reine Zahlenspalten)
function cellNum(c) { const t = c.replace(/[€%\s]|\u00a0|Stück|Stk\.?/g, '').replace(/−/g, '-'); const p = parseDe(t); return p; }
function checkSumRows(heads, rows, out) {
  if (heads.some(h => /gewicht|punkte|bewertung|score|faktor/i.test(h))) return;   // Nutzwert-/Scoringtabellen: gewichtete Summen
  const isSum = r => /^\s*(Summe|Σ|Bilanzsumme|Summe Aktiva|Summe Passiva|Summe Soll|Summe Haben|Total|Sum|Total assets|Total liabilities|Total debit|Total credit)\s*:?\s*$/i.test(r[0] || '');
  const unitOf = c => (/€/.test(c) ? '€' : /%/.test(c) ? '%' : /Stück|Stk/.test(c) ? 'Stk' : '');
  for (let k = 0; k < rows.length; k++) {
    if (!isSum(rows[k])) continue;
    let st = k - 1; while (st >= 0 && !isSum(rows[st]) && !/^\s*[=−-]/.test(rows[st][0] || '')) st--;
    const all = rows.slice(st + 1, k);
    if (all.some(r => /…|\.\.\./.test(r.join(' ')))) continue;   // abgebrochene Reihe
    const rate = r => /\b(je|pro)\b|€\s*\/|Ø|durchschnitt/i.test(r[0] || '');
    const block = all.filter(r => !rate(r));
    if (block.length < 2) continue;
    for (let c = 1; c < rows[k].length; c++) {
      const tot = cellNum(rows[k][c]); if (!tot) continue;
      const u = unitOf(rows[k][c]);
      const cells = block.map(r => (r[c] ?? '').trim()); if (cells.some(x => x === '' || x === '–' || x === '-')) continue;
      if (cells.some(x => unitOf(x) !== u && unitOf(x) !== '')) continue;
      if (u === '%') continue;
      const nums = cells.map(cellNum); if (nums.some(x => !x)) continue;
      const s = sumQ(nums.map(x => x.q)), d = Math.max(tot.d, ...nums.map(x => x.d));
      const rt = nums.some(x => x.d > 0) ? half(Math.min(...nums.map(x => x.d))).mul(new Q(BigInt(nums.length))) : ZERO;
      if (s.sub(tot.q).abs().cmp(half(tot.d).add(rt)) > 0 && roundQ(s, tot.d).cmp(tot.q)) out.push({ art: 'summenzeile-falsch', text: `${heads[c] || 'Spalte ' + (c + 1)}: Summe ${fmtDe(s, d)} ≠ ${rows[k][c]}` });
    }
  }
}
function checkTafelBs(s, out) {
  const betr = t => amounts(unesc(t.replace(/<[^>]+>/g, ' ')));
  for (const grp of s.match(/(?:<div class="bs">[\s\S]*?<\/div>\s*)+/g) || []) {
    const zeilen = [...grp.matchAll(/<div class="bs">([\s\S]*?)<\/div>/g)].map(x => x[1]);
    const saetze = []; let offen = [];   // Soll-Zeilen ohne „an“ vor dem eigentlichen Buchungssatz (mehrzeilige Buchung)
    for (let z of zeilen) {
      z = z.trim().replace(/^\s*(?:[a-z]\)|[①-⑩]|\d+\.)\s*/, '');
      if (/^<span>\s*(?:und an|and to)\s*<\/span>/.test(z)) { if (saetze.length) saetze[saetze.length - 1][1].push(...betr([...z.matchAll(/<em>([\s\S]*?)<\/em>/g)].map(x => x[1]).join(' '))); continue; }
      if (!z.includes((SPR === 'en' ? '<span>to</span>' : '<span>an</span>'))) { const em = [...z.matchAll(/<em>([\s\S]*?)<\/em>/g)]; if (em.length === 1 && !/<span>/.test(z)) offen.push(...betr(em[0][1])); else offen = []; continue; }
      const [links, ...r] = z.split((SPR === 'en' ? '<span>to</span>' : '<span>an</span>')), rechts = r.join((SPR === 'en' ? '<span>to</span>' : '<span>an</span>'));
      const el = [...links.matchAll(/<em>([\s\S]*?)<\/em>/g)].map(x => x[1]), er = [...rechts.matchAll(/<em>([\s\S]*?)<\/em>/g)].map(x => x[1]);
      const nsoll = (links.match(/<span>\s*(?:und|and)\s*<\/span>/g) || []).length + 1, nhaben = (rechts.match(/<span>\s*(?:und|and)\s*<\/span>/g) || []).length + 1;
      if (el.length) { saetze.push([offen.concat(betr(el.join(' '))), betr(er.join(' ')), false]); offen = []; continue; }
      offen = [];
      if (er.length === 1) {
        const txt = er[0];
        if (txt.includes('=')) { const tot = betr(txt.split('=').pop()), parts = betr(txt.split('=')[0]); if (tot.length && parts.length && sumQ(parts).cmp(tot[0])) out.push({ art: 'buchung-soll-ungleich-haben', text: 'Tafel: ' + txt }); saetze.push([tot, tot, false]); continue; }
        if (txt.includes('/')) { const v = betr(txt); if (v.length === nsoll + nhaben) { saetze.push([v.slice(0, nsoll), v.slice(nsoll), false]); continue; } }
        const v = betr(txt); saetze.push([v.slice(0, 1), v.slice(0, 1), nsoll + nhaben > 2]);
      }
    }
    for (const [soll, haben, unb] of saetze) { if (unb || !soll.length || !haben.length) continue; if (sumQ(soll).cmp(sumQ(haben))) out.push({ art: 'buchung-soll-ungleich-haben', text: 'Tafel-Buchung: ' + unesc(grp.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').slice(0, 220), soll: sumQ(soll).toNumber(), haben: sumQ(haben).toNumber() }); }
  }
}

/* ================= Gesamtprüfung ================= */
const TEXRE = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$/g;
// Bewusst falsch gezeigte Rechnungen (Fehlerbeispiele, Lösungen von Studierenden): mit ≠ geschrieben, in <del>/<s> oder mit ✗/❌ markiert
const ABSICHT = /<(del|s)\b[\s\S]*?<\/\1>|[^.!?\n<>]*(?:✗|❌|✘)[^.!?\n<>]*/g;
function maskIntent(s) { return s.replace(ABSICHT, m => ' '.repeat(m.length)); }

// opts.kontext: weiterer Text (z. B. die Frage/Aufgabe des Nutzers) – Zahlen daraus gelten als gegeben.
// opts.trace: Array, in das alle geprüften Ergebnisstellen geschrieben werden (Tests).
export function pruefe(data, { skipKeys, kontext, trace, sprache } = {}) {
  SPR = sprache === 'en' ? 'en' : 'de';
  const grund = sprache === 'en' ? 'en' : sprache === 'de' ? 'de' : null;
  const sprOf = x => { const en = (x.match(/\b(?:the|and|of|is|are|with|you|for|to|this|that|per|year|cost|price)\b/gi) || []).length, de = (x.match(/\b(?:der|die|das|und|ist|mit|für|du|ein|eine|pro|Jahr|Kosten|Preis|wird)\b/g) || []).length; return en > de * 2 && en >= 2 ? 'en' : de > en * 2 && de >= 2 ? 'de' : null; };
  // je Text: Feld „…_en“, erkannte Sprache, Sprache der Antwort, Zahlformat
  const sprVon = (path, s0) => {
    const pfadEn = path.some(k => typeof k === 'string' && /(?:^|_)en$/.test(k));
    const formEn = /\d,\d{3}\.\d{1,2}(?!\d)|\d\{,\}\d{3}\.\d/.test(s0) && !/\d\.\d{3},\d|\d\{,\}\d{1,2}(?!\d)/.test(s0);
    return pfadEn ? 'en' : sprOf(s0) || grund || (formEn ? 'en' : 'de');;
  };
  const strs = strings(data).filter(([p]) => !(skipKeys && p.some(k => skipKeys.includes(k))));
  // Zahlen für die Erkennung gerundeter Zwischenergebnisse einheitlich deutsch schreiben (englische Antworten)
  const kanon = (x, spr) => { SPR = spr; return x.replace(NUMMIX, tok => { try { const l = lesarten(tok)[0]; const z = l.q.abs().mul(pow10(l.d)); const g = (z.n / z.d).toString().padStart(l.d + 1, '0'); return l.d ? g.slice(0, -l.d) + ',' + g.slice(-l.d) : g; } catch (e) { return tok; } }); };
  const strsDe = strs.map(([p, x]) => [p, kanon(x, sprVon(p, x))]);
  SPR = sprache === 'en' ? 'en' : 'de';
  const derived = derivedValues(strsDe);
  EXAKT = new Set(); ERGEBNISSE = new Set();
  for (const [, x] of strsDe) for (const m of x.replace(/\{,\}/g, ',').replace(/\\approx/g, '≈').replace(/\\[,;!]|\\quad/g, ' ').matchAll(/(?:=|≈)\s*[−-]?\s*(\d{1,3}(?:\.\d{3})+|\d+),(\d+)/g)) ERGEBNISSE.add(qkey(Q.dec(m[1].replace(/\./g, '') + '.' + m[2])));
  // Wie oft kommt jeder Zahlwert vor? (Eingaben einer Rechnung, die sonst nirgends stehen, könnten selbst der Fehler sein)
  const anz = new Map(); for (const [, x] of strs.concat([[[], String(kontext || '')]])) {
    for (const k of numKeys(x)) anz.set(k, (anz.get(k) || 0) + 1);
    // „3 %“ verankert auch 0,03 (und 1 − 0,03 = 0,97 im Nenner)
    for (const m of x.replace(/\{,\}/g, ',').replace(/\\,|\\;|\s/g, '').replace(/\\%/g, '%').matchAll(/(\d+(?:,\d+)?)%/g)) { const q = Q.dec(m[1].replace(',', '.')).div(HUNDRED); for (const k of [qkey(q), qkey(ONE.sub(q)), qkey(ONE.add(q))]) anz.set(k, (anz.get(k) || 0) + 2); }
  }
  const KONST = new Set(['0/1', '1/1', '2/1', '12/1', '100/1', '360/1', '365/1', '1/2']);
  const verankert = k => (anz.get(k) || 0) >= 2 || KONST.has(k);
  const befunde = []; const stats = { formeln: 0, fliesstext: 0, buchungen: 0 };
  for (const [path, s0] of strs) {
    if (!/\d/.test(s0)) continue;
    SPR = sprVon(path, s0);
    const s = maskIntent(s0);
    let m; TEXRE.lastIndex = 0;
    const texSpans = [];
    while ((m = TEXRE.exec(s))) {
      const g = m[1] != null ? 1 : m[2] != null ? 2 : 3, tex = m[g], tStart = m.index + m[0].indexOf(tex);
      texSpans.push([m.index, m.index + m[0].length]);
      stats.formeln++;
      const ctx = s.slice(Math.max(0, m.index - 90), m.index + m[0].length + 30).replace(/<[^>]+>/g, '');
      const after = s.slice(m.index + m[0].length, m.index + m[0].length + 120).replace(/<[^>]+>/g, '');
      const tr = trace ? [] : null; TRACE = tr;
      for (const f of checkTex(tex, ctx, after, derived)) {
        f.path = path; f.ort = 'formel';
        if (f.fix) f.fix = { ...f.fix, start: f.fix.start + tStart, end: f.fix.end + tStart };
        if (f.bspan) f.bspan = { ...f.bspan, start: f.bspan.start + tStart, end: f.bspan.end + tStart };
        if (f.start != null) { f.start += tStart; f.end += tStart; if (f.bvon != null) f.bvon += tStart; }
        befunde.push(f);
      }
      if (tr) for (const x of tr) trace.push({ path, start: x.start + tStart, end: x.end + tStart });
      TRACE = null;
    }
    // Fließtext (ohne Formeln, Tags durch Leerzeichen gleicher Länge ersetzen, damit Positionen stimmen)
    let plain = s.replace(/<[^>]*>/g, x => ' '.repeat(x.length));
    for (const [a, b] of texSpans) plain = plain.slice(0, a) + ' '.repeat(b - a) + plain.slice(b);
    plain = plain.replace(/&nbsp;/g, '\u00a0     ').replace(/\u00a0/g, ' ').replace(/\*\*|__|`/g, x => ' '.repeat(x.length)).replace(/^\s*\|.*\|\s*$/gm, x => ' '.repeat(x.length));   // Markdown-Fett, Code, Tabellenzeilen (Tabellen prüft checkTables)
    { const tr = trace ? [] : null; TRACE = tr;
      for (const f of checkProse(plain, derived)) { f.path = path; f.ort = 'text'; stats.fliesstext++; befunde.push(f); }
      if (tr) for (const x of tr) trace.push({ path, ...x }); TRACE = null; }
    // Buchungen
    const bq = [];
    // pos = Stelle direkt hinter dem betroffenen Element (dort setzt die Notbremse ihren Hinweis)
    const posAb = (n0, pos) => { for (let i = n0; i < bq.length; i++) if (bq[i].pos == null) bq[i].pos = pos; };
    const segs = [...s.matchAll(/<(em|li|p|td|strong|code)\b[^>]*>[\s\S]*?<\/\1>/g)];
    for (const seg of (segs.length ? segs : [Object.assign([s], { index: 0 })])) {
      const n0 = bq.length;
      for (const piece of seg[0].split(/;\s|\.\s(?=[A-ZÄÖÜ])|<br\s*\/?>/)) checkBuchung(piece, bq);
      // Hinweis hinter das umschließende Block-Element (li/p/td) bzw. die Tafel-Zeile
      let end = seg.index + seg[0].length; const blk = /<\/(li|p|td|div)>/.exec(s.slice(end)); if (/^(em|strong|code)$/.test(seg[1] || '') && blk && blk.index < 400) end += blk.index + blk[0].length;
      posAb(n0, end);
    }
    if (s.includes('<table')) for (const tb of s.matchAll(/<table[\s\S]*?<\/table>/g)) { const n0 = bq.length; checkTables(tb[0], bq); posAb(n0, tb.index + tb[0].length); }
    if (/^\s*\|.*\|\s*$/m.test(s)) for (const tb of s.matchAll(/(?:^[ \t]*\|.*\|[ \t]*(?:\n|$))+/gm)) { const n0 = bq.length; checkTables(mdTables(tb[0]), bq); posAb(n0, tb.index + tb[0].length); }
    if (s.includes('class="bs"')) for (const g of s.matchAll(/(?:<div class="bs">[\s\S]*?<\/div>\s*)+/g)) { const n0 = bq.length; checkTafelBs(g[0], bq); posAb(n0, g.index + g[0].trimEnd().length - '</div>'.length); }   // ⚠ in die letzte Buchungszeile
    if (!s.includes('<')) { const re = /[;:]\s|\.\s(?=[A-ZÄÖÜ])|\n|→/g; let a = 0, m; const stueck = []; while ((m = re.exec(s))) { stueck.push([a, m.index]); a = m.index + m[0].length; } stueck.push([a, s.length]); for (const [x, y] of stueck) { const n0 = bq.length; checkBuchung(s.slice(x, y), bq); posAb(n0, y); } }
    for (const f of bq) { f.path = path; f.ort = 'buchung'; stats.buchungen++; befunde.push(f); }
  }
  // Korrektur nur, wenn alle Eingaben der Rechnung verankert sind (stehen auch woanders / sind übliche Konstanten)
  // Abschreibfehler statt Rechenfehler? Wenn eine Eingabe durch eine Zahl aus der Aufgabe ersetzt die Gleichung stimmen lässt,
  // ist unklar, was falsch ist → nicht automatisch korrigieren (die Nachbesserung kennt die Aufgabe).
  {
    // Kandidaten: Zahlen aus der Frage/dem Material + alle Zahlen der Antwort (z. B. Angaben, frühere Ergebnisse)
    const kand = new Set(); const kt = String(kontext || '') + '\n' + strs.map(x => x[1]).join('\n');
    for (const k of numKeys(kt)) kand.add(k);
    for (const m of kt.replace(/\{,\}/g, ',').replace(/\\%/g, '%').replace(/\s/g, '').matchAll(/(\d+(?:,\d+)?)%/g)) { const q = Q.dec(m[1].replace(',', '.')).div(HUNDRED); kand.add(qkey(q)); kand.add(qkey(ONE.add(q))); kand.add(qkey(ONE.sub(q))); }
    const kq = [...kand].slice(0, 400).map(k => { const [n, d] = k.split('/'); return new Q(BigInt(n), BigInt(d)); });
    for (const f of befunde) if (f.fix && f.aExpr && f.bWert && eingabeAlternative(f.aExpr, f.bWert, f.bTol, kq.filter(c => { let ks = []; try { ks = lesarten(f.fix.alt.replace(/^[−-]\s*/, '')).map(l => qkey(l.q)); } catch (e) {} return !ks.includes(qkey(c.abs())); }))) { f.fixUnsicher = f.fix; f.eingabeVerdacht = true; delete f.fix; }
  }
  return { befunde, stats };
}

// Setzt eindeutige Korrekturen ein (Ergebnis einer Rechnung falsch → richtiger Wert), eine pro Runde in Textreihenfolge.
// Standard (folge: false): nur „isolierte“ Ergebnisse – der falsche Wert taucht danach nirgends mehr auf. Wird er weiterverwendet,
// bleibt der Befund offen (f.weiterverwendet) und geht an die KI-Nachbesserung, die alle Folgeschritte neu rechnet.
// folge: true (Notfall, wenn die KI-Nachbesserung scheitert): späteres Vorkommen des falschen Werts wird mitersetzt – nur wenn er
// vorher (auch in der Frage) nirgends stand.
export const BLOCKIEREND = new Set(['rechnung-falsch', 'division-durch-null', 'buchung-soll-ungleich-haben', 'summenzeile-falsch', 'ungleich-aber-gleich', 'quiz-falsche-option']);
export function korrigiere(data, opts = {}) {
  const esc = v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const variants = alt => [...new Set([alt, alt.replace(/\{,\}/g, ','), alt.replace(/(\d),(\d)/g, '$1{,}$2'), alt.replace(/^−/, '-'), alt.replace(/^-/, '−')].map(v => v.replace(/^[−-]\s*/, '')))];
  const reOf = v => new RegExp('(?<![\\d.,}])' + esc(v) + '(?![\\d]|[.,{]\\d)', 'g');
  const key = p => JSON.stringify(p);
  let cur = JSON.parse(JSON.stringify(data)); const geaendert = [];
  for (let runde = 0; runde < (opts.runden || 20); runde++) {
    const { befunde } = pruefe(cur, opts);
    const strs = strings(cur), idx = new Map(strs.map(([p], i) => [key(p), i]));
    const kand = befunde.filter(f => f.fix && f.art === 'rechnung-falsch').sort((x, y) => (idx.get(key(x.path)) - idx.get(key(y.path))) || x.fix.start - y.fix.start);
    let done = false;
    for (const f of kand) {
      const i = idx.get(key(f.path)), s = strs[i][1];
      if (s.slice(f.fix.start, f.fix.end) !== f.fix.alt) continue;
      const vs = variants(f.fix.alt.trim());
      const danach = s.slice(f.fix.end) + '\n' + strs.slice(i + 1).map(x => x[1]).join('\n');
      const spaeter = vs.some(v => reOf(v).test(danach));
      if (spaeter && !opts.folge) { f.weiterverwendet = true; continue; }
      let t = s.slice(0, f.fix.start) + f.fix.neu + s.slice(f.fix.end);
      cur = setAt(cur, f.path, t);
      geaendert.push({ path: f.path, alt: f.fix.alt, neu: f.fix.neu, rechnung: f.text, folgestellen: spaeter });
      if (spaeter) {
        const vorher = strs.slice(0, i).map(x => x[1]).join('\n') + '\n' + s.slice(0, f.fix.start) + '\n' + String(opts.kontext || '');
        if (!vs.some(v => reOf(v).test(vorher))) {
          const neuFor = v => v.includes('{,}') ? f.fix.neu.replace(/^[−-]/, '').replace(/(\d),(\d)/g, '$1{,}$2') : f.fix.neu.replace(/^[−-]/, '').replace(/\{,\}/g, ',');
          const sameSign = /^[−-]/.test(f.fix.alt.trim()) === /^[−-]/.test(f.fix.neu);
          if (sameSign) for (let j = i; j < strs.length; j++) {
            const p = strs[j][0], s2 = getAt(cur, p), from = j === i ? f.fix.start + f.fix.neu.length : 0;
            // kurze Werte (z. B. 16) nur dort ersetzen, wo sie sichtbar weitergerechnet werden (in Formeln / neben Rechenzeichen)
            const markant = vs[0].replace(/\D/g, '').replace(/^0+/, '').length >= 4 || /[,}]\d/.test(vs[0]) || f.path[0] === '__rechenweg';   // versteckter Rechenweg: der Wert steht genau dafür im Text
            const tex = []; for (const m of s2.matchAll(/\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g)) tex.push([m.index, m.index + m[0].length]);
            const inRechnung = (pos, len) => markant || tex.some(([x, y]) => pos >= x && pos < y) || /[·×*\/+\-−=:]\s*$/.test(s2.slice(Math.max(0, pos - 3), pos)) || /^\s*[·×*\/+\-−=:]/.test(s2.slice(pos + len, pos + len + 3));
            let u = s2.slice(from); for (const v of vs) u = u.replace(reOf(v), (m0, off) => inRechnung(from + off, m0.length) ? neuFor(v) : m0);
            if (u !== s2.slice(from)) cur = setAt(cur, p, s2.slice(0, from) + u);
          }
        }
      }
      done = true; break;
    }
    if (!done) break;
  }
  const { befunde } = pruefe(cur, opts);
  // offene Befunde: markieren, ob das falsche Ergebnis weiterverwendet wird (für die KI-Nachbesserung)
  const strs = strings(cur), idx = new Map(strs.map(([p], i) => [key(p), i]));
  for (const f of befunde) { const fx = f.fix || f.fixUnsicher; if (!fx || !f.path) continue; const i = idx.get(key(f.path)); if (i == null) continue; const danach = strs[i][1].slice(fx.end) + '\n' + strs.slice(i + 1).map(x => x[1]).join('\n'); if (variants(fx.alt.trim()).some(v => reOf(v).test(danach))) f.weiterverwendet = true; }
  return { data: cur, geaendert, rest: befunde.filter(f => BLOCKIEREND.has(f.art)), alle: befunde };
}
function getAt(o, p) { for (const k of p) o = o[k]; return o; }
function setAt(o, p, v) { if (!p.length) return v; const c = Array.isArray(o) ? o.slice() : { ...o }; c[p[0]] = setAt(o[p[0]], p.slice(1), v); return c; }

// Quizfragen: MC – rechnet die Erklärung ein Ergebnis aus, muss die als richtig markierte Option es enthalten.
// num – die hinterlegte Lösung muss das Endergebnis des Rechenwegs sein (Korrektur: Lösung = Endergebnis, wenn der Rechenweg stimmt).
export function pruefeQuiz(questions) {
  const out = [];
  (questions || []).forEach((q, i) => {
    if (!q || typeof q !== 'object') return;
    const expl = String(q.type === 'num' ? (q.solution || q.explain || '') : (q.explain || q.explanation || q.solution || ''));
    const res = lastResult(expl);
    if (Array.isArray(q.options) && q.options.length && res && (q.type === 'mc' || q.type == null)) {
      const hits = q.options.map((o, k) => optionHas(String(o), res) ? k : -1).filter(k => k >= 0);
      const corr = (Array.isArray(q.correct) ? q.correct : [q.correct]).map(Number);
      if (hits.length && corr.length === 1 && !hits.includes(corr[0])) out.push({ art: 'quiz-falsche-option', i, text: `Erklärung ergibt ${res.raw}, als richtig markiert ist „${q.options[corr[0]]}“`, fixQuiz: hits.length === 1 ? { correct: [hits[0]] } : null });
    }
    if (q.type === 'num' && res) {
      const a = typeof q.answer === 'number' ? q.answer : parseFloat(String(q.answer).replace(/\./g, '').replace(',', '.').replace('−', '-'));
      if (isFinite(a)) {
        const r = res.q.toNumber() * (res.pct && !/%/.test(String(q.unit || '')) ? 0.01 : 1), tol = Math.max(Math.abs(r) * 0.005, 0.5 * 10 ** -res.d + 1e-9);
        const r2 = res.q.toNumber() * (res.pct ? 0.01 : 1);
        if (Math.abs(a - r) > tol && Math.abs(a - res.q.toNumber()) > tol && Math.abs(a - r2) > Math.max(Math.abs(r2) * 0.005, 1e-9)) out.push({ art: 'quiz-falsche-option', i, text: `Rechenweg endet bei ${res.raw}, hinterlegte Lösung ist ${q.answer}`, fixQuiz: { answer: /%/.test(String(q.unit || '')) || !res.pct ? res.q.toNumber() : r } });
      }
    }
  });
  return out;
}
function lastResult(t) {
  const s = t.replace(/\{,\}/g, ',').replace(/\\[,;]/g, '').replace(/\\%/g, '%');
  const ms = [...s.matchAll(/(?:=|≈|\\approx)\s*([−-]?\d{1,3}(?:\.\d{3})+(?:,\d+)?|[−-]?\d+(?:,\d+)?)\s*(%|\\text\{\s*€\s*\}|€)?/g)];
  for (let i = ms.length - 1; i >= 0; i--) {   // letztes Ergebnis einer Rechnung (links davon steht eine Rechnung, nicht nur „t = 0“)
    const m = ms[i], links = s.slice(Math.max(0, m.index - 120), m.index).split(/=|≈|\\approx|\\\(|\n/).pop();
    if (!/\d/.test(links) || !/[+\-−*/:·×^]|\\cdot|\\frac|\\times/.test(links)) continue;
    const p = parseDe(m[1]); if (!p) continue; return { ...p, pct: m[2] === '%', raw: m[1] + (m[2] === '%' ? ' %' : '') };
  }
  return null;
}
function optionHas(o, r) {
  for (const m of o.replace(/\{,\}/g, ',').matchAll(/[−-]?\d{1,3}(?:\.\d{3})+(?:,\d+)?|[−-]?\d+(?:,\d+)?/g)) { const p = parseDe(m[0]); if (p && roundQ(p.q, r.d).cmp(r.q) === 0 && p.d >= r.d - 0) return true; }
  return false;
}

// alle möglichen Zahlwerte eines Tokens (für die Abdeckungsprüfung im Gate)
export function zahlWerte(tok, sprache) { const alt = SPR; SPR = sprache === 'en' ? 'en' : 'de'; try { return lesarten(String(tok).replace(/^[−-]\s*/, '')).map(l => (/^[−-]/.test(String(tok)) ? -1 : 1) * l.q.toNumber()); } catch (e) { return []; } finally { SPR = alt; } }
export const _intern = { tokProse, readExpr, Q, evaluate, texToExpr, literal, checkTex, checkProse, parseDe, fmtDe, roundQ, maskIntent };
