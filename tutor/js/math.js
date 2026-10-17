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
  return s.replace(/\\left|\\right|\\big[lr]?|\\Big[lr]?/g, '').replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)').replace(/\\(?:text|mathrm|textbf|operatorname)\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\pm/g, '±').replace(/\\leq?/g, '≤').replace(/\\geq?/g, '≥').replace(/\\neq/g, '≠').replace(/\\approx/g, '≈')
    .replace(/\\sum/g, 'Σ').replace(/\\Delta/g, 'Δ').replace(/\\delta/g, 'δ').replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β').replace(/\\sigma/g, 'σ').replace(/\\mu/g, 'μ').replace(/\\infty/g, '∞').replace(/\\to|\\rightarrow/g, '→')
    .replace(/\\[,;: !]/g, ' ').replace(/\\%/g, '%').replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/([_^])\{([^{}]*)\}/g, (m, k, x) => (k === '_' ? x : '^' + x)).replace(/_/g, '').replace(/\{,\}/g, ',').replace(/[{}]/g, '').replace(/\s{2,}/g, ' ').trim();
}
// Ganzer Text: Formeln durch die lesbare Form ersetzen (z. B. fürs Vorlesen oder Vorschauen)
export const plainMath = s => String(s || '').replace(RX, (m, d, i) => texPlain(d != null ? d : i));

function mark(tex, display) {
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
      if (!/\\[([]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      for (let p = n.parentNode; p && p !== root; p = p.parentNode) { if (p.nodeType === 1 && (SKIP.has(p.localName) || p.classList.contains('tex'))) return NodeFilter.FILTER_REJECT; }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  let n = 0;
  for (const t of nodes) {
    const s = t.nodeValue; RX.lastIndex = 0;
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
  }
}
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
const TEXQ = /\\[([]/;
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
