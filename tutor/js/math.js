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
    const d = el.dataset.d === '1', t = prepTex(el.dataset.tex), tex = !d && (/\\(frac|sum|prod|int|lim)\b/.test(t) || el.classList.contains('tex-dl')) ? '\\displaystyle ' + t : t;
    try { k.render(tex, el, { displayMode: d, throwOnError: false, strict: 'ignore', trust: false, maxExpand: 400, maxSize: 20 }); } catch (e) {}
    el.dataset.ok = '1';
    // auch Formeln im Satz eines Rechenblocks dürfen nicht über den Rand laufen
    if (d || el.closest('.calc, .formel, .result')) fitLater(el);
  }
}
// Große Formel breiter als ihr Platz (Handy)? Schrift so weit verkleinern, dass sie ganz zu sehen ist (höchstens auf 60 %)
const fitQ = new Set(); let fitT = 0;
function fitLater(el) { fitQ.add(el); clearTimeout(fitT); fitT = setTimeout(fitAll, 60); }
function fitAll() {
  for (const el of fitQ) {
    fitQ.delete(el); if (!el.isConnected) continue;
    const k = el.querySelector('.katex-display > .katex') || el.querySelector('.katex'); if (!k) continue;
    if (el.classList.contains('tex-wrap')) continue;
    k.style.fontSize = '';
    // Formel im Satz (z. B. im Rechenblock): gegen die Breite der Zeile messen, nicht gegen den eigenen (abgeschnittenen) Kasten
    const inl = !el.querySelector('.katex-display'), par = el.parentElement;
    const inner = e => { if (!e) return 0; const cs = getComputedStyle(e); return e.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0); };
    const box = inl ? inner(par) : (el.clientWidth || inner(par)), wOf = () => inl ? k.getBoundingClientRect().width : k.scrollWidth, w = wOf();
    if (!(box > 40 && w > box + 1)) continue;
    const r = (box - 4) / w;
    if (r >= .78) { const fs = parseFloat(getComputedStyle(k).fontSize) || 16; k.style.fontSize = (fs * r).toFixed(2) + 'px'; if (wOf() <= box + 1) continue; k.style.fontSize = ''; }
    // viel zu breit: als umbrechende Formel setzen (bricht nach =, + und − um), statt winzig oder abgeschnitten
    if (window.katex && el.dataset.tex) { try { window.katex.render('\\displaystyle ' + prepTex(el.dataset.tex), el, { displayMode: false, throwOnError: false, strict: 'ignore', trust: false, maxExpand: 400, maxSize: 20 }); el.classList.add('tex-wrap'); } catch (e) {} }
  }
}
// Neu messen bei Größenänderung und sobald die Formel-Schriften geladen sind (vorher sind die Breiten zu klein)
const refit = () => document.querySelectorAll('span.tex[data-d="1"][data-ok], .calc span.tex[data-ok], .formel span.tex[data-ok], .result span.tex[data-ok]').forEach(fitLater);
if (typeof window !== 'undefined') { window.addEventListener('resize', refit); try { document.fonts.addEventListener('loadingdone', refit); } catch (e) {} }
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

// ---------- Tafel fürs Handy nachbessern (vor dem Setzen der Formeln) ----------
// Einheiten an die Zahl, Klammern/Häkchen an die Formel, fehlende Leerzeichen, Buchungssätze als Raster,
// Tabellen in scrollbaren Rahmen, „Typische Fehler“ mit „·“ als echte Liste.
const UNIT = /^([ \t ]*)(€[  ]?(?:pro|je)[  ](?:Jahr|Stück|Monat|Stunde|Einheit|Tag)|€\/(?:Stück|Jahr|Monat|ME)|€|EUR|%|Stück|ME|GE)(?=$|[\s.,;:!?)\]–—-])/;
const NBSP = ' ';
const isBlock = n => n.nodeType === 1 && /^(br|div|p|ul|ol|table|h[1-6]|li)$/.test(n.localName);
function sameLine(el, dir) {
  for (let n = dir > 0 ? el.nextSibling : el.previousSibling; n; n = dir > 0 ? n.nextSibling : n.previousSibling) {
    if (n.nodeType === 3) { if (n.nodeValue.trim()) return true; continue; }
    if (n.nodeType !== 1) continue;
    if (isBlock(n)) return false;
    if (n.textContent.trim()) return true;
  }
  return false;
}
function glueUnits(root) {
  for (const el of root.querySelectorAll('span.tex:not([data-ok])')) {
    const nx = el.nextSibling; if (!nx || nx.nodeType !== 3) continue;
    const m = nx.nodeValue.match(UNIT); if (!m) continue;
    const tex = String(el.dataset.tex || '').trim(); if (!/[\d})]$/.test(tex)) continue;
    const u = m[2].replace(/[  ]+/g, ' ');
    if (u === '%' && /\\%$/.test(tex)) continue;
    el.dataset.tex = tex + (u === '%' ? '\\,\\%' : '\\,\\text{' + u + '}');
    el.textContent = texPlain(el.dataset.tex);
    nx.nodeValue = nx.nodeValue.slice(m[0].length);
  }
  // Große Formel mit Text in derselben Zeile („= 80.000 € Anlagevermögen“): im Satz setzen, damit der Text normal weiterläuft
  for (const el of root.querySelectorAll('span.tex[data-d="1"]:not([data-ok])')) {
    if (sameLine(el, 1) || sameLine(el, -1)) { delete el.dataset.d; el.classList.add('tex-dl'); }
  }
  // Rechenblock einheitlich: steht eine Zeile im Satz, dann alle Zeilen (linksbündig untereinander statt mal links, mal mittig)
  for (const c of root.querySelectorAll('.calc')) if (c.querySelector('.tex-dl')) c.querySelectorAll('span.tex[data-d="1"]:not([data-ok])').forEach(el => { delete el.dataset.d; el.classList.add('tex-dl'); });
}
// Legende („C₀ Kapitalwert · I₀ …“): Formelzeichen bleibt bei seinem ersten Wort
function glueLegend(root) {
  for (const el of root.querySelectorAll('.legend span.tex')) {
    const nx = el.nextSibling; if (!nx || nx.nodeType !== 3) continue;
    const m = nx.nodeValue.match(/^[ \u00a0]+([^\s·]+)/); if (!m || (el.parentElement && el.parentElement.classList.contains('m-nw'))) continue;
    const w = document.createElement('span'); w.className = 'm-nw'; el.replaceWith(w);
    w.append(el, NBSP + m[1]); nx.nodeValue = nx.nodeValue.slice(m[0].length);
  }
}
function glueBrackets(root) {
  for (const el of root.querySelectorAll('span.tex:not([data-d]), span.tex-w')) {
    if (el.parentElement && el.parentElement.classList.contains('m-nw')) continue;
    const pv = el.previousSibling, nx = el.nextSibling;
    const a = pv && pv.nodeType === 3 ? (pv.nodeValue.match(/[(\[„"]$/) || [''])[0] : '';
    const b = nx && nx.nodeType === 3 ? (nx.nodeValue.match(/^[)\]“".,;:!?]*(?:[ \t ]*[✔✓☑✅])?[)\]“".,;:!?]*/) || [''])[0] : '';
    if (!a && !b) continue;
    const w = document.createElement('span'); w.className = 'm-nw';
    el.replaceWith(w);
    if (a) { pv.nodeValue = pv.nodeValue.slice(0, -1); w.append(a); }
    w.append(el);
    if (b) { nx.nodeValue = nx.nodeValue.slice(b.length); w.append(b.replace(/[ \t]+/g, NBSP)); }
  }
}
function fixText(root) {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(n) { const p = n.parentElement; return p && !p.closest('.tex, .tex-w, .katex, svg, code') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
  const ns = []; while (tw.nextNode()) ns.push(tw.currentNode);
  for (const n of ns) {
    const o = n.nodeValue;
    const s = o.replace(/[ \t\n]+([✔✓☑✅])/g, NBSP + '$1').replace(/ · /g, NBSP + '· ')
      .replace(/(\d) (€|%|EUR\b)/g, '$1' + NBSP + '$2')
      // „finanziert?Eigenkapital“ → Leerzeichen rein (nicht bei 1.000, z.B., Web-Adressen)
      .replace(/([a-zäöüß]{2,}[?!.])(?=[A-ZÄÖÜ][a-zäöüß])/g, (m, w, off, str) => { const tok = str.slice(Math.max(str.lastIndexOf(' ', off), str.lastIndexOf(NBSP, off)) + 1).split(/\s/)[0]; return /:\/\/|^www\.|@/i.test(tok) ? m : w + ' '; });
    if (s !== o) n.nodeValue = s;
  }
}
// ---------- Buchungssätze: Soll-Konto | Betrag, darunter „an“ Haben-Konto | Betrag ----------
const AMT_RX = /[-−]?\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?[  ]?(?:€|EUR)|[-−]?\d+(?:,\d{1,2})?[  ]?(?:€|EUR)/g;
const SEPW = /^(an|und|\+|und an|sowie an|sowie)$/i;
const isAn = t => /\ban\b/i.test(t);
const rows0 = toks => toks.some(t => t.k === 'an');
const num = s => parseFloat(String(s).replace(/−/g, '-').replace(/[^\d,-]/g, '').replace(',', '.'));
function bsParse(bs) {
  if (bs.querySelector('.tex, table, div, ul, ol')) return null;
  const marked = [...bs.querySelectorAll('span')].some(s => SEPW.test(s.textContent.trim()));
  const toks = [];
  const words = (s, plain) => {
    if (!plain) { if (s.trim()) toks.push({ k: 'txt', v: s }); return; }
    s.split(/(?:^|\s+)(an|AN|und|\+)(?:\s+|$)/).forEach((p, i) => { if (i % 2) toks.push({ k: /^an$/i.test(p) ? 'an' : 'und' }); else if (p && p.trim()) toks.push({ k: 'txt', v: p }); });
  };
  const text = (s, plain) => { let last = 0; s.replace(AMT_RX, (m, off) => { if (off > last) words(s.slice(last, off), plain); toks.push({ k: 'amt', v: m }); last = off + m.length; return m; }); if (last < s.length) words(s.slice(last), plain); };
  for (const n of bs.childNodes) {
    if (n.nodeType === 3) { text(n.nodeValue, !marked); continue; }
    if (n.nodeType !== 1) continue;
    const t = n.localName, tx = n.textContent;
    if (t === 'br') toks.push({ k: 'br' });
    else if (t === 'span' && SEPW.test(tx.trim())) toks.push({ k: isAn(tx) ? 'an' : 'und' });
    else if ((t === 'em' || t === 'i' || t === 'small') && /\d/.test(tx)) {
      if (/soll|haben/i.test(tx) || (/=/.test(tx) && !rows0(toks))) { toks.push({ k: 'sum', v: tx.trim() }); continue; }
      // „1.000 € + 190 € = 1.190 €“: links Soll-, rechts Haben-Beträge
      const g = []; tx.split(/\s+(an|AN|=)\s+/).forEach((p, i) => { if (i % 2) g.push('an'); else (p.match(AMT_RX) || []).forEach(a => g.push(a)); });
      if (g.some(x => x !== 'an')) toks.push({ k: 'grp', v: g }); else text(tx, !marked);
    } else text(tx, !marked);
  }
  let side = 'S', fresh = true; const rows = [], foot = [];
  const cur = () => rows[rows.length - 1];
  const lacking = sd => rows.filter(r => !r.amt && (!sd || r.side === sd));
  for (const t of toks) {
    if (t.k === 'an') { side = 'H'; fresh = true; }
    else if (t.k === 'und' || t.k === 'br') fresh = true;
    else if (t.k === 'txt') {
      const v = t.v.replace(/^[\s,;:+=]+|[\s,;:+=]+$/g, ''); if (!v) continue;
      if (fresh || !cur() || cur().amt || cur().side !== side) rows.push({ side, acc: v, amt: '' }); else cur().acc += ' ' + v;
      fresh = false;
    } else if (t.k === 'amt') { const r = cur() && !cur().amt ? cur() : lacking()[0]; if (r) r.amt = t.v; }
    else if (t.k === 'grp') {
      if (t.v.includes('an')) { let sd = 'S'; for (const a of t.v) { if (a === 'an') { sd = 'H'; continue; } const r = lacking(sd)[0]; if (r) r.amt = a; } }
      else if (t.v.length === 1) { const r = cur() && !cur().amt ? cur() : lacking()[0]; if (r) r.amt = t.v[0]; }
      else for (const a of t.v) { const r = lacking()[0]; if (r) r.amt = a; }
    } else if (t.k === 'sum') foot.push(t.v);
  }
  const S = rows.filter(r => r.side === 'S'), H = rows.filter(r => r.side === 'H');
  if (!S.length || !H.length || rows.some(r => !/[A-Za-zÄÖÜäöü]/.test(r.acc))) return null;
  // Fehlt genau ein Betrag, ergibt er sich aus Soll = Haben
  const dec = rows.some(r => /,\d/.test(r.amt)) ? 2 : 0;
  for (const [A, B] of [[S, H], [H, S]]) {
    const miss = A.filter(r => !r.amt);
    if (miss.length === 1 && B.every(r => r.amt)) { const v = B.reduce((x, r) => x + num(r.amt), 0) - A.filter(r => r.amt).reduce((x, r) => x + num(r.amt), 0); if (v > 0) miss[0].amt = v.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + ' €'; }
  }
  return { rows, foot };
}
function bsRender(bs) {
  const p = bsParse(bs); if (!p) { bs.classList.add('m-bsx'); return; }
  const g = document.createElement('div'); g.className = 'm-bsg';
  const sp = (c, t) => { const e = document.createElement('span'); e.className = c; e.textContent = t; return e; };
  for (const r of p.rows) {
    const row = document.createElement('div'); row.className = 'm-bsr ' + (r.side === 'S' ? 'm-s' : 'm-h');
    if (r.side === 'H') row.append(sp('m-an', 'an'));
    row.append(sp('m-acc', r.acc.replace(/\s+/g, ' ')), sp('m-amt', r.amt.replace(/ /g, NBSP)));
    g.append(row);
  }
  bs.replaceChildren(g, ...p.foot.map(f => sp('m-bsf', f.replace(/(\d) €/g, '$1' + NBSP + '€'))));
  bs.classList.add('m-bs');
}
// „Typische Fehler: a · b · c“ → kurze Einleitung + echte Liste
function warnList(w) {
  if (w.querySelector('ul, ol, table, div, p')) return;
  const SEP = /[ \t ]+·[ \t ]+/;
  const kids = [...w.childNodes];
  if (!kids.some(n => n.nodeType === 3 && SEP.test(n.nodeValue))) return;
  const items = [[]];
  for (const n of kids) {
    if (n.nodeType === 3 && SEP.test(n.nodeValue)) n.nodeValue.split(SEP).forEach((s, i) => { if (i) items.push([]); if (s) items[items.length - 1].push(document.createTextNode(s)); });
    else items[items.length - 1].push(n);
  }
  let intro = null; const f = items[0][0];
  if (f && f.nodeType === 3) { const m = f.nodeValue.match(/^\s*([^:·]{3,60}:)\s*/); if (m) { intro = document.createTextNode(m[1]); f.nodeValue = f.nodeValue.slice(m[0].length); } }
  else if (f && f.nodeType === 1 && /^(b|strong)$/.test(f.localName) && /:\s*$/.test(f.textContent)) intro = items[0].shift();
  const ul = document.createElement('ul'); ul.className = 'm-fl';
  for (const it of items) {
    if (!it.some(n => (n.textContent || '').trim())) continue;
    const t0 = it[0]; if (t0 && t0.nodeType === 3) t0.nodeValue = t0.nodeValue.replace(/^\s+/, '').replace(/^[a-zäöü]/, c => c.toUpperCase());
    const tl = it[it.length - 1]; if (tl && tl.nodeType === 3) tl.nodeValue = tl.nodeValue.replace(/\s+$/, '');
    const li = document.createElement('li'); li.append(...it); ul.append(li);
  }
  const head = []; if (intro) { const pi = document.createElement('p'); pi.className = 'm-fi'; pi.append(intro); head.push(pi); }
  w.replaceChildren(...head, ul);
}
// Zahl in einer Zelle? (leer zählt nicht)
const NUMC = /^[-−+]?[\s ]*\(?[\d.,\s ]+\)?[\s ]*(€|%|EUR|Stück|ME)?$/;
const isNum = c => !!c && /\d/.test(c.textContent) && NUMC.test(c.textContent.trim());
const mk = (tag, cls, kids = []) => { const e = document.createElement(tag); if (cls) e.className = cls; e.append(...kids); return e; };
const moveKids = c => [...c.childNodes];
// Bilanz/GuV als T-Konto: „Aktiva | € | Passiva | €“ → zwei Seiten, Beträge rechtsbündig, Summen auf einer Linie (passt auf 375 px)
function tAccount(tb) {
  const rows = [...tb.rows]; if (rows.length < 3) return false;
  if (rows.some(r => r.cells.length !== 4 || [...r.cells].some(c => c.colSpan > 1))) return false;
  const head = rows[0]; if (![...head.cells].every(c => c.localName === 'th')) return false;
  const body = rows.slice(1);
  for (const k of [1, 3]) { const fill = body.map(r => r.cells[k]).filter(c => c.textContent.trim()); if (fill.length < 2 || fill.filter(isNum).length < fill.length * .8) return false; }
  if (!body.some(r => r.cells[0].textContent.trim() && !isNum(r.cells[0])) || !body.some(r => r.cells[2].textContent.trim() && !isNum(r.cells[2]))) return false;
  const SUM = /summe|gesamt|total/i;
  const side = k => {
    const s = mk('div', 'm-tks');
    const unit = head.cells[k + 1].textContent.trim();
    s.append(mk('div', 'm-tkh', [mk('b', '', moveKids(head.cells[k])), mk('span', 'm-tku', [/^[€%]|EUR/.test(unit) ? unit : ''])]));
    let sum = null;
    for (const r of body) {
      const a = r.cells[k], n = r.cells[k + 1];
      if (!a.textContent.trim() && !n.textContent.trim()) continue;
      const isSum = SUM.test(a.textContent) && r === body[body.length - 1];
      const row = mk('div', 'm-tkr' + (!n.textContent.trim() ? ' m-tkg' : ''), [mk('span', 'm-tkl', moveKids(a)), mk('span', 'm-tka', moveKids(n))]);
      if (isSum) { row.classList.add('m-tksum'); sum = row; } else s.append(row);
    }
    if (sum) s.append(sum);
    return s;
  };
  const t = mk('div', 'm-tk', [side(0), side(2)]);
  if (tb.hasAttribute('data-say')) t.setAttribute('data-say', tb.getAttribute('data-say'));
  tb.replaceWith(t);
  return true;
}
// SWOT als 2×2-Karten statt Tabelle (am ganz schmalen Handy untereinander)
const SWOTW = /st[äa]rke|schw[äa]che|chance|risik|bedrohung|strength|weakness|opportunit|threat/i;
function swotGrid(tb) {
  const rows = [...tb.rows]; if (!rows.length || rows.some(r => r.cells.length !== 2)) return false;
  const cards = [];
  const allTh = r => [...r.cells].every(c => c.localName === 'th');
  if (rows.length === 4 && allTh(rows[0]) && allTh(rows[2]) && !allTh(rows[1]) && !allTh(rows[3])) {
    for (const [hr, br] of [[0, 1], [2, 3]]) for (const k of [0, 1]) cards.push([moveKids(rows[hr].cells[k]), rows[br].cells[k]]);
  } else if (rows.length === 2 && !rows.some(allTh)) {
    for (const r of rows) for (const c of r.cells) { const b = c.firstElementChild; if (!b || !/^(b|strong)$/.test(b.localName) || c.firstChild !== b && c.firstChild.textContent.trim()) return false; b.remove(); cards.push([moveKids(b), c]); }
  } else return false;
  if (cards.filter(([t]) => SWOTW.test(t.map(n => n.textContent).join(''))).length < 3) return false;
  const g = mk('div', 'm-swot');
  cards.forEach(([title, cell], i) => {
    // Zeilen (<br>) als kleine Liste
    const parts = [[]]; for (const n of moveKids(cell)) { if (n.nodeType === 1 && n.localName === 'br') parts.push([]); else parts[parts.length - 1].push(n); }
    const items = parts.filter(p => p.some(n => (n.textContent || '').trim()));
    const bodyEl = items.length > 1 ? mk('ul', '', items.map(p => mk('li', '', p))) : mk('p', '', items[0] || []);
    g.append(mk('div', 'm-sw m-sw' + i, [mk('b', 'm-swt', title), bodyEl]));
  });
  if (tb.hasAttribute('data-say')) g.setAttribute('data-say', tb.getAttribute('data-say'));
  tb.replaceWith(g);
  return true;
}
export function polishBoard(root) {
  if (!root) return root;
  try {
    for (const tb of [...root.querySelectorAll('table')]) { try { tAccount(tb) || swotGrid(tb); } catch (e) { console.warn(e); } }
    glueUnits(root);
    root.querySelectorAll('.bs').forEach(bsRender);
    root.querySelectorAll('.warn').forEach(warnList);
    fixText(root);
    glueBrackets(root);
    glueLegend(root);
    for (const tb of root.querySelectorAll('table')) {
      if (!tb.parentElement || !tb.parentElement.classList.contains('m-tw')) { const w = document.createElement('div'); w.className = 'm-tw'; tb.replaceWith(w); w.append(tb); }
      const cols = Math.max(0, ...[...tb.rows].map(r => r.cells.length)); if (cols >= 4) tb.classList.add('m-t4');
      for (const c of tb.querySelectorAll('td, th')) if (isNum(c)) c.classList.add('m-num');
    }
  } catch (e) { console.warn(e); }
  return root;
}
// Tabelle breiter als die Tafel? Rechts ein Schatten als Hinweis „hier geht's weiter“
export function tableHints(root) {
  for (const w of (root || document).querySelectorAll('.m-tw')) {
    const upd = () => w.classList.toggle('m-more', w.scrollWidth > w.clientWidth + 2 && w.scrollLeft + w.clientWidth < w.scrollWidth - 2);
    if (!w._mh) { w._mh = 1; w.addEventListener('scroll', upd, { passive: true }); }
    upd();
  }
}
