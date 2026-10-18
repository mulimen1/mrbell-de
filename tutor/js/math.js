// Formeln: LaTeX zwischen \( … \) (im Satz) oder \[ … \] (eigene Zeile) wird mit KaTeX gesetzt.
// KaTeX liegt lokal (vendor) und wird erst geladen, wenn wirklich eine Formel auf der Seite steht.
const BASE = new URL('../vendor/katex@0.16.47/', import.meta.url).href;
const RX = /\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;
const SKIP = new Set(['script', 'style', 'code', 'textarea', 'input', 'svg', 'text', 'tspan']);
let loading = null, queued = false, mo = null;

export const hasMath = s => /\\\(|\\\[/.test(String(s || ''));

function load() {
  if (window.katex) return Promise.resolve(window.katex);
  if (loading) return loading;
  loading = new Promise((res, rej) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = BASE + 'katex.min.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = BASE + 'katex.min.js'; s.async = true;
    s.onload = () => (window.katex ? res(window.katex) : rej(new Error('katex')));
    s.onerror = () => { loading = null; s.remove(); rej(new Error('katex')); };
    document.head.appendChild(s);
  });
  return loading;
}

// Häufige Ausrutscher glätten: Dezimalkomma ohne Abstand, Prozent (sonst Kommentar), Leerzeilen
export function prepTex(t) {
  return String(t || '').trim()
    .replace(/(\d),(?=\d)/g, '$1{,}')
    .replace(/(^|[^\\])%/g, '$1\\%')
    .replace(/\n{2,}/g, '\n');
}

// Lesbare Ersatzform (solange KaTeX lädt, offline oder zum Vorlesen)
export function texPlain(t) {
  let s = String(t || '');
  for (let i = 0; i < 4; i++) s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)');
  return s.replace(/\\q?quad\b/g, ' ').replace(/\\left|\\right|\\big[lr]?|\\Big[lr]?/g, '').replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)').replace(/\\(?:text|mathrm|textbf|operatorname)\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\pm/g, '±').replace(/\\leq?/g, '≤').replace(/\\geq?/g, '≥').replace(/\\neq/g, '≠').replace(/\\approx/g, '≈')
    .replace(/\\sum/g, 'Σ').replace(/\\Delta/g, 'Δ').replace(/\\delta/g, 'δ').replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β').replace(/\\sigma/g, 'σ').replace(/\\mu/g, 'μ').replace(/\\infty/g, '∞').replace(/\\to|\\rightarrow/g, '→')
    .replace(/\\[,;: !]/g, ' ').replace(/\\%/g, '%').replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/([_^])\{([^{}]*)\}/g, (m, k, x) => (k === '_' ? x : '^' + x)).replace(/_/g, '').replace(/\{,\}/g, ',').replace(/[{}]/g, '').replace(/\s{2,}/g, ' ').trim();
}
// Ganzer Text: Formeln durch die lesbare Form ersetzen (z. B. fürs Vorlesen oder Vorschauen)
export const plainMath = s => String(s || '').replace(RX, (m, d, i) => texPlain(d != null ? d : i));

// ---------- Sicherheitsnetz: Formel-Reste ohne \( \) erkennen und trotzdem setzen ----------
// z. B. „FK_{Z} = Fremdkapitalzinsen“, „r_EK = G / EK × 100“, „\frac{G}{EK}“ – nie mehr Rohcode auf Karten oder im Chat.
const STRONG = /\\[a-zA-Z]{2,}|\\[%,;!]|[A-Za-z0-9)\]}]_(?:\{[^{}\s]{1,24}\}|[A-Za-z0-9]{1,8})|[A-Za-z0-9)\]}]\^(?:\{[^{}\s]{1,24}\}|[A-Za-z0-9+\-]{1,6})|\{[^{}\s]*\}\{/;
const OP = /^(?:=|\+|-|−|–|·|×|\*|\/|<|>|≤|≥|≈|≠|±)$/;
const WEAK = /^(?:[A-Z]{1,4}[0-9]*|[a-zA-Z]|[a-zA-Z][0-9]|\d[\d.,]*%?|\(?[\dA-Za-z]*[+\-−*/^][\dA-Za-z+\-−*/^.,]*\)?)$/;
const NOMATH = /:\/\/|@|www\.|_{2,}/;
const PUNCT_R = /[.,;:!?*"“”„)]+$/, PUNCT_L = /^[*"“”„(]+/, END = /[.,;:!?]$/;
const TEXQ = /\\[a-zA-Z(\[%]|[A-Za-z0-9)\]}][_^][{A-Za-z0-9]/;
function core(tok) { return tok.replace(PUNCT_L, '').replace(PUNCT_R, ''); }
function kind(tok) {
  const c = core(tok);
  if (!c || NOMATH.test(c)) return 'x';
  if (STRONG.test(c) || STRONG.test(tok)) return 's';
  if (OP.test(c)) return 'o';
  if (c.length <= 14 && WEAK.test(c) && !/^(?:a|I|A)$/.test(c)) return 'w';
  return 'x';
}
const tidy = t => t.replace(/([_^])([A-Za-z0-9]{2,})/g, '$1{$2}').replace(/\s*×\s*/g, ' \\times ').replace(/\s*·\s*/g, ' \\cdot ').replace(/−/g, '-').trim();
function fixPlain(s) {
  if (!TEXQ.test(s)) return s;
  const parts = s.split(/(\s+)/), toks = [];
  for (let i = 0; i < parts.length; i += 2) toks.push({ t: parts[i], sp: parts[i + 1] || '', k: kind(parts[i]) });
  let out = '', i = 0;
  while (i < toks.length) {
    if (toks[i].k === 'x' || !toks[i].t) { out += toks[i].t + toks[i].sp; i++; continue; }
    // Satzzeichen am Wortende beendet die Formel (danach geht der Satz weiter)
    let j = i; while (j < toks.length && toks[j].k !== 'x' && toks[j].t) { j++; if (END.test(toks[j - 1].t)) break; }
    let a = i, b = j - 1;
    // Ränder: Rechenzeichen weg, kurze Symbole nur, wenn ein Rechenzeichen daneben steht
    for (let ch = true; ch && a <= b;) { ch = false;
      if (toks[a].k === 'o') { a++; ch = true; } else if (toks[a].k === 'w' && a < b && toks[a + 1].k !== 'o') { a++; ch = true; }
      if (a <= b && toks[b].k === 'o') { b--; ch = true; } else if (a <= b && toks[b].k === 'w' && b > a && toks[b - 1].k !== 'o') { b--; ch = true; } }
    const hasStrong = toks.slice(a, b + 1).some(x => x.k === 's');
    if (!hasStrong || a > b) { for (let k = i; k < j; k++) out += toks[k].t + toks[k].sp; i = j; continue; }
    for (let k = i; k < a; k++) out += toks[k].t + toks[k].sp;
    let expr = toks.slice(a, b + 1).map((x, k) => x.t + (k < b - a ? x.sp : '')).join('');
    // Satzzeichen/Sternchen außen lassen; Klammern nur, wenn sie nicht zur Formel gehören
    let lead = expr.match(/^[*"“”„]+/)?.[0] || '', trail = expr.match(/[.,;:!?*"“”„]+$/)?.[0] || '';
    expr = expr.slice(lead.length, expr.length - trail.length);
    const bal = () => (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
    while (expr.startsWith('(') && bal() > 0) { lead += '('; expr = expr.slice(1); }
    while (expr.endsWith(')') && bal() < 0) { trail = ')' + trail; expr = expr.slice(0, -1); }
    out += lead + '\\(' + tidy(expr) + '\\)' + trail + toks[b].sp;
    for (let k = b + 1; k < j; k++) out += toks[k].t + toks[k].sp;
    i = j;
  }
  return out;
}
// Text mit schon gesetzten Formeln: nur die Stücke dazwischen prüfen
// KI-Ausgaben reparieren, bevor irgendwo Rohcode sichtbar wird:
// – in JSON nur einfach escapte Befehle (\frac → Seitenvorschub + „rac“, \text → Tab + „ext“ …)
// – $…$ / $$…$$ statt \( … \) / \[ … \]
const CTL = [[/\f(?=rac\b|rac\{)/g, '\\f'], [/\t(?=ext\{|imes\b|heta\b|au\b)/g, '\\t'], [/\x08(?=eta\b|ar\{|egin\{|ig[lr]?\b)/g, '\\b'], [/\r(?=ight[)\]|.]|ho\b|ightarrow\b)/g, '\\r'], [/\v(?=arepsilon\b|ec\{)/g, '\\v']];
export function repairTex(s) {
  if (typeof s !== 'string' || !s) return s;
  for (const [re, to] of CTL) s = s.replace(re, to);
  if (s.indexOf('$') >= 0) s = s.replace(/\$\$([^$]{1,400}?)\$\$/g, (m, x) => /[\\^_{]/.test(x) ? '\\[' + x + '\\]' : m)
    .replace(/(^|[^\\$\w])\$(?!\s)([^$\n]{1,200}?[^\s$])\$(?![\w$])/g, (m, a, x) => /\\[a-zA-Z]|[\^_]\{?\w/.test(x) ? a + '\\(' + x + '\\)' : m);
  return s;
}
export function repairDeep(v, d = 0) {
  if (d > 8 || v == null) return v;
  if (typeof v === 'string') return repairTex(v);
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) v[i] = repairDeep(v[i], d + 1); return v; }
  if (typeof v === 'object') { for (const k of Object.keys(v)) v[k] = repairDeep(v[k], d + 1); return v; }
  return v;
}
export function fixStray(s) {
  s = repairTex(String(s || ''));
  if (!TEXQ.test(s)) return s;
  let out = '', last = 0, m; RX.lastIndex = 0;
  while ((m = RX.exec(s))) { out += fixPlain(s.slice(last, m.index)) + m[0]; last = m.index + m[0].length; }
  return out + fixPlain(s.slice(last));
}
// Formel aus einem eigenen Feld (ohne Begrenzer); falls die KI doch welche mitschickt, weg damit
export const bareTex = t => String(t || '').trim().replace(/^\$+|\$+$/g, '').replace(/^\\[([]\s*/, '').replace(/\s*\\[)\]]$/, '').trim();
export function texEl(tex, display) { const el = mark(bareTex(tex), display); watch(); queueMath(); return el; }

// Reine Wort-„Formeln“ (z. B. \text{Soll-Konto} \text{an} \text{Haben-Konto}) sind keine Mathematik – als normaler Text zeigen
function wordsOnly(tex) {
  const rest = String(tex).replace(/\\(?:text|mathrm|textbf)\s*\{[^{}]*\}/g, '').replace(/\\(?:quad|qquad|[,;:! ]|space)/g, '').replace(/[\s()\[\],.:;–-]/g, '');
  return /\\text\s*\{/.test(tex) && !rest;
}
function mark(tex, display) {
  if (wordsOnly(tex)) { const w = document.createElement('span'); w.className = 'tex-w'; w.textContent = texPlain(tex); return w; }
  const el = document.createElement('span');
  el.className = 'tex';
  el.dataset.tex = tex;
  if (display) el.dataset.d = '1';
  el.textContent = texPlain(tex);
  return el;
}

// Alle Textknoten unter root nach \( … \) / \[ … \] durchsuchen und durch Formel-Platzhalter ersetzen
export function mathify(root) {
  if (!root) return root;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!TEXQ.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      for (let p = n.parentNode; p && p !== root; p = p.parentNode) { if (p.nodeType === 1 && (SKIP.has(p.localName) || p.classList.contains('tex'))) return NodeFilter.FILTER_REJECT; }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  let n = 0;
  for (const t of nodes) {
    const s = fixStray(t.nodeValue); RX.lastIndex = 0;
    if (!RX.test(s)) continue;
    RX.lastIndex = 0;
    const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = RX.exec(s))) {
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      frag.appendChild(mark(m[1] != null ? m[1] : m[2], m[1] != null)); n++;
      last = m.index + m[0].length;
    }
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    t.replaceWith(frag);
  }
  if (n) { watch(); queueMath(); }
  return root;
}

function paint(k, root = document) {
  for (const el of root.querySelectorAll('span.tex:not([data-ok])')) {
    // Brüche/Summen im Satz in voller Größe (sonst winzig auf dem iPad)
    const d = el.dataset.d === '1', t = prepTex(el.dataset.tex), tex = !d && /\\(frac|sum|prod|int|lim)\b/.test(t) ? '\\displaystyle ' + t : t;
    try { k.render(tex, el, { displayMode: d, throwOnError: false, strict: 'ignore', trust: false, maxExpand: 400, maxSize: 20 }); } catch (e) {}
    el.dataset.ok = '1';
    if (d) fitLater(el);
  }
}
// Große Formel breiter als ihr Platz (Handy)? Schrift so weit verkleinern, dass sie ganz zu sehen ist (höchstens auf 60 %)
const fitQ = new Set(); let fitT = 0;
function fitLater(el) { fitQ.add(el); clearTimeout(fitT); fitT = setTimeout(fitAll, 60); }
function fitAll() {
  for (const el of fitQ) {
    fitQ.delete(el); if (!el.isConnected) continue;
    const k = el.querySelector('.katex-display > .katex') || el.querySelector('.katex'); if (!k) continue;
    k.style.fontSize = '';
    const box = el.clientWidth || (el.parentElement && el.parentElement.clientWidth) || 0, w = k.scrollWidth;
    if (!(box > 40 && w > box + 1)) continue;
    const r = (box - 4) / w;
    if (r >= .78) { const fs = parseFloat(getComputedStyle(k).fontSize) || 16; k.style.fontSize = (fs * r).toFixed(2) + 'px'; continue; }
    // viel zu breit: als umbrechende Formel setzen (bricht nach =, + und − um), statt winzig oder abgeschnitten
    if (window.katex && el.dataset.tex) { try { window.katex.render('\\displaystyle ' + prepTex(el.dataset.tex), el, { displayMode: false, throwOnError: false, strict: 'ignore', trust: false, maxExpand: 400, maxSize: 20 }); el.classList.add('tex-wrap'); } catch (e) {} }
  }
}
if (typeof window !== 'undefined') window.addEventListener('resize', () => { document.querySelectorAll('span.tex[data-d="1"][data-ok]').forEach(fitLater); });
function render() {
  queued = false;
  if (!document.querySelector('span.tex:not([data-ok])')) return;
  load().then(k => paint(k)).catch(() => {});
}
// Vor dem Drucken/PDF: alle Formeln unter root sicher fertig gesetzt
export async function mathReady(root = document) {
  mathify(root);
  if (!root.querySelector('span.tex:not([data-ok])')) return;
  try { paint(await load(), root); } catch (e) { return; }
  // Schriften der Formeln (große Summen-/Klammerzeichen) vor dem Drucken wirklich laden
  const FONTS = ['16px KaTeX_Main', 'italic 16px KaTeX_Math', '16px KaTeX_Size1', '16px KaTeX_Size2', '16px KaTeX_Size3', '16px KaTeX_Size4', '16px KaTeX_AMS'];
  root.getBoundingClientRect();
  try { await Promise.race([Promise.all(FONTS.map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
}
export function queueMath() {
  if (queued) return;
  queued = true;
  (window.requestAnimationFrame || setTimeout)(() => setTimeout(render, 0));
}
// Alles, was später ins Dokument kommt (Quiz-Optionen, Karten, Listen …), wird automatisch mitgesetzt
function watch() {
  if (mo || !window.MutationObserver || !document.body) return;
  mo = new MutationObserver(muts => {
    let any = false;
    for (const m of muts) for (const a of m.addedNodes) {
      const el = a.nodeType === 3 ? a.parentElement : a.nodeType === 1 ? a : null;
      if (!el || !el.isConnected || el.closest('.tex, textarea, [contenteditable]')) continue;
      if (a.nodeType === 1 && (a.matches('span.tex:not([data-ok])') || a.querySelector('span.tex:not([data-ok])'))) any = true;
      if (TEXQ.test(a.textContent || '')) mathify(el);
    }
    if (any) queueMath();
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch, { once: true });
// Zum Vorlesen: Formeln als Wörter („G durch EK mal 100 %“) statt Zeichensalat
export const speakMath = (s, en) => String(s || '').replace(RX, (m, d, i) => ' ' + texPlain(d != null ? d : i)
  .replace(/\s*=\s*/g, en ? ' equals ' : ' gleich ').replace(/\s*[·×]\s*/g, en ? ' times ' : ' mal ').replace(/\s*\/\s*/g, en ? ' over ' : ' durch ')
  .replace(/\^/g, en ? ' to the power of ' : ' hoch ').replace(/[()]/g, ' ').replace(/\s{2,}/g, ' ').trim() + ' ');
