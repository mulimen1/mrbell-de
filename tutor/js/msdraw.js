// Mitschrift: handgezeichnete Skizzen (Rough.js) und das Papier-Blatt.
// Alles wird lokal aus dem JSON der KI gezeichnet – keine Bilder, kein HTML von der KI.
import rough from './lib/rough.esm.js';
import { L } from './i18n.js';

const NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = v => { const n = Number(String(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return isFinite(n) ? n : null; };
const fmt = v => { const n = typeof v === 'number' ? v : num(v); return n == null ? String(v ?? '') : n.toLocaleString('de-DE', { maximumFractionDigits: 2 }); };

// Formeln: Rohcode der KI (LaTeX-Reste) → lesbare Handschrift mit Hoch-/Tiefstellung
export function formula(s) {
  let t = String(s || '').trim().replace(/^\\[([]|\\[\])]$/g, '').replace(/\\\(|\\\)|\\\[|\\\]|\$/g, '');
  for (let i = 0; i < 4; i++) t = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a, b) => `${/[+−-]/.test(a) ? '(' + a + ')' : a} / ${/[+−-]/.test(b) ? '(' + b + ')' : b}`);
  const SYM = { cdot: '·', times: '×', Delta: 'Δ', delta: 'δ', sum: 'Σ', leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', approx: '≈', rightarrow: '→', Rightarrow: '⇒', to: '→', infty: '∞', alpha: 'α', beta: 'β', varepsilon: 'ε', epsilon: 'ε', mu: 'μ', sigma: 'σ', pi: 'π', lambda: 'λ', rho: 'ρ', sqrt: '√', pm: '±', '%': '%', ',': ' ', ';': ' ', quad: '  ', text: '', mathrm: '', left: '', right: '' };
  t = t.replace(/\\([A-Za-z]+|[%,;])/g, (_, w) => w in SYM ? SYM[w] : w);
  let h = esc(t).replace(/\s-\s/g, ' − ');
  h = h.replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>').replace(/\^\{([^{}]*)\}/g, '<sup>$1</sup>').replace(/_([A-Za-z0-9ÄÖÜäöü]+)/g, '<sub>$1</sub>').replace(/\^([A-Za-z0-9]+)/g, '<sup>$1</sup>');
  return h.replace(/[{}]/g, '');
}
// **fett** → Textmarker
export const marked = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<mark>$1</mark>').replace(/\*/g, '');
// Fließtext mit eingestreuten Formeln (\( … \), K_f) → Handschrift mit Tiefstellung, ohne Formel-Satz
export function rich(s) {
  const parts = [];
  const t = String(s || '').replace(/\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$([^$]+)\$/g, (m, a, b, c) => { parts.push(formula(a || b || c)); return '\u0000' + (parts.length - 1) + '\u0001'; })
    .replace(/\\[A-Za-z]+(?:\{[^{}]*\}){0,2}/g, m => { parts.push(formula(m)); return '\u0000' + (parts.length - 1) + '\u0001'; });
  return marked(t).replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>').replace(/(\b[A-Za-zÄÖÜäöü])_([A-Za-z0-9]{1,4})\b/g, '$1<sub>$2</sub>').replace(/\u0000(\d+)\u0001/g, (m, i) => parts[i]);
}
// Für Skizzen-Beschriftungen und Lernmaterial: reiner Text
export const flat = s => rich(s).replace(/<sub>/g, '_').replace(/<sup>/g, '^').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

// ---------- Skizzen ----------
// Text in einer SVG umbrechen (Handschrift, ca. Zeichen pro Zeile)
function label(svg, x, y, text, { size = 17, anchor = 'middle', max = 18, color, weight } = {}) {
  size *= 1.18;
  const words = flat(text).split(/\s+/); const lines = [''];
  // Ein einzelnes langes Wort (z. B. „Produktgruppen-DB“) passt nicht → Schrift etwas kleiner
  const longest = Math.max(...words.map(w => w.length)); if (longest > max) size *= Math.max(0.62, max / longest);
  for (const w of words) { const cur = lines[lines.length - 1]; if ((cur + ' ' + w).trim().length > max && cur) lines.push(w); else lines[lines.length - 1] = (cur + ' ' + w).trim(); }
  const el = document.createElementNS(NS, 'text');
  el.setAttribute('x', x); el.setAttribute('y', y - (lines.length - 1) * size * 0.55); el.setAttribute('text-anchor', anchor);
  el.setAttribute('font-size', size); el.setAttribute('class', 'ms-svgt'); if (color) el.setAttribute('fill', color); if (weight) el.setAttribute('font-weight', weight);
  lines.forEach((l, i) => { const ts = document.createElementNS(NS, 'tspan'); ts.setAttribute('x', x); ts.setAttribute('dy', i ? size * 1.1 : 0); ts.textContent = l; el.appendChild(ts); });
  svg.appendChild(el); return lines.length;
}
const FORMS = {
  steigend: t => 0.12 + 0.72 * t, fallend: t => 0.84 - 0.72 * t, linear: t => 0.04 + 0.86 * t, linear_fix: t => 0.3 + 0.4 * t,
  konstant: () => 0.5, u: t => 0.18 + 2.6 * (t - 0.5) ** 2, glocke: t => 0.1 + 0.75 * Math.exp(-(((t - 0.5) / 0.17) ** 2)),
  saettigung: t => 0.85 * (1 - Math.exp(-3.2 * t)), exponentiell: t => 0.04 + 0.82 * (Math.exp(3 * t) - 1) / (Math.exp(3) - 1),
  s: t => 0.08 + 0.8 / (1 + Math.exp(-11 * (t - 0.5)))
};
const INK = ['#1f3c88', '#c0392b', '#1e7a4c'];

function kurve(svg, rc, b, ink) {
  const W = 400, H = 260, x0 = 46, y0 = 222, x1 = 372, y1 = 26;
  let ls = (b.linien || []).slice(0, 3).map(l => ({ name: l.name || '', f: FORMS[String(l.form || '').toLowerCase()] ? String(l.form).toLowerCase() : 'steigend' }));
  // Zwei Geraden durch 0 (z. B. Umsatz/Kosten): die Kostenlinie bekommt einen Startwert, damit sie sich schneiden
  if (ls.filter(l => l.f === 'linear').length > 1) { let done = false; ls.forEach(l => { if (!done && l.f === 'linear' && /kost|cost|ausgab/i.test(l.name)) { l.f = 'linear_fix'; done = true; } }); if (!done) ls[1].f = 'linear_fix'; }
  if (!ls.length) ls = [{ name: '', f: 'steigend' }];
  const opt = { stroke: ink, strokeWidth: 1.7, roughness: 1.1, seed: 7 };
  svg.appendChild(rc.line(x0, y0, x1 + 8, y0, opt)); svg.appendChild(rc.line(x0, y0, x0, y1 - 8, opt));
  svg.appendChild(rc.linearPath([[x1, y0 - 6], [x1 + 9, y0], [x1, y0 + 6]], opt)); svg.appendChild(rc.linearPath([[x0 - 6, y1], [x0, y1 - 9], [x0 + 6, y1]], opt));
  label(svg, x1 + 2, y0 + 26, b.x || '', { anchor: 'end', size: 16, max: 26 });
  label(svg, x0 + 8, y1 - 4, b.y || '', { anchor: 'start', size: 16, max: 26 });
  const P = (f, t) => [x0 + 8 + t * (x1 - x0 - 24), y0 - FORMS[f](t) * (y0 - y1 - 6)];
  const tags = [];
  ls.forEach((l, i) => {
    const pts = []; for (let k = 0; k <= 24; k++) pts.push(P(l.f, k / 24));
    svg.appendChild(rc.curve(pts, { stroke: INK[i] || ink, strokeWidth: 2.2, roughness: 0.9, seed: 11 + i }));
    const end = pts[pts.length - 1]; tags.push({ i, name: l.name, x: Math.min(end[0], 360), y: end[1] + (end[1] < 60 ? 22 : -12) });
  });
  // Beschriftungen am Linienende dürfen sich nicht überlappen
  tags.sort((a, b) => a.y - b.y).forEach((t, k, arr) => { if (k && t.y - arr[k - 1].y < 24) t.y = arr[k - 1].y + 24; label(svg, t.x, t.y, t.name, { size: 16, anchor: 'end', color: INK[t.i] || ink, max: 16 }); });
  // Schnittpunkt der ersten beiden Linien
  if (ls.length > 1) {
    const d = t => FORMS[ls[0].f](t) - FORMS[ls[1].f](t); let hit = null;
    for (let k = 1; k <= 200 && hit == null; k++) { const a = (k - 1) / 200, c = k / 200; if (d(a) === 0 || d(a) * d(c) < 0) hit = (a + c) / 2; }
    if (hit != null && hit > 0.03 && hit < 0.97) {
      const [px, py] = P(ls[0].f, hit);
      svg.appendChild(rc.circle(px, py, 11, { stroke: ink, fill: ink, fillStyle: 'solid', roughness: 0.6, seed: 5 }));
      const dash = { stroke: ink, strokeWidth: 1, roughness: 0.6, strokeLineDash: [5, 6], seed: 3 };
      svg.appendChild(rc.line(px, py, px, y0, dash)); svg.appendChild(rc.line(px, py, x0, py, dash));
      if (b.punkt) label(svg, px + 10, py + 26, b.punkt, { anchor: 'start', size: 16, max: 18 });
    }
  }
  return [W, H];
}

function konto(svg, rc, b, ink, bil) {
  const L1 = bil ? (b.aktiva || []) : (b.soll || []), R1 = bil ? (b.passiva || []) : (b.haben || []);
  const rows = Math.max(L1.length, R1.length, 1), W = 400, rh = 30, top = 70, H = top + rows * rh + (bil ? 56 : 24);
  const opt = { stroke: ink, strokeWidth: 1.8, roughness: 1, seed: 9 };
  label(svg, 200, 24, bil ? L('Bilanz', 'Balance sheet') : (b.konto || L('Konto', 'Account')), { size: 21, max: 30, weight: 700 });
  svg.appendChild(rc.line(14, 50, 386, 50, opt)); svg.appendChild(rc.line(200, 50, 200, H - 12, opt));
  label(svg, 20, 44, bil ? 'Aktiva' : 'Soll', { anchor: 'start', size: 15 }); label(svg, 380, 44, bil ? 'Passiva' : 'Haben', { anchor: 'end', size: 15 });
  const side = (arr, xl, xr) => arr.slice(0, 9).forEach((r, i) => { const y = top + 8 + i * rh; const [t, v] = Array.isArray(r) ? r : [r, '']; label(svg, xl, y, t, { anchor: 'start', size: 16, max: 15 }); if (v !== '' && v != null) label(svg, xr, y, fmt(v), { anchor: 'end', size: 16 }); });
  side(L1, 22, 192); side(R1, 210, 380);
  if (bil) {
    const sum = a => a.reduce((s, r) => s + (num(Array.isArray(r) ? r[1] : 0) || 0), 0);
    const y = top + rows * rh + 10;
    svg.appendChild(rc.line(110, y, 192, y, opt)); svg.appendChild(rc.line(298, y, 380, y, opt));
    label(svg, 22, y + 24, 'Σ', { anchor: 'start', size: 17 }); label(svg, 192, y + 24, fmt(sum(L1)), { anchor: 'end', size: 17 });
    label(svg, 210, y + 24, 'Σ', { anchor: 'start', size: 17 }); label(svg, 380, y + 24, fmt(sum(R1)), { anchor: 'end', size: 17 });
    svg.appendChild(rc.line(110, y + 32, 192, y + 32, opt)); svg.appendChild(rc.line(110, y + 36, 192, y + 36, opt));
    svg.appendChild(rc.line(298, y + 32, 380, y + 32, opt)); svg.appendChild(rc.line(298, y + 36, 380, y + 36, opt));
  }
  return [W, H];
}

function arrow(svg, rc, xa, ya, xb, yb, ink, seed) {
  const o = { stroke: ink, strokeWidth: 1.8, roughness: 1, seed };
  svg.appendChild(rc.line(xa, ya, xb, yb, o));
  const a = Math.atan2(yb - ya, xb - xa), s = 10;
  svg.appendChild(rc.linearPath([[xb - s * Math.cos(a - 0.45), yb - s * Math.sin(a - 0.45)], [xb, yb], [xb - s * Math.cos(a + 0.45), yb - s * Math.sin(a + 0.45)]], o));
}

function fluss(svg, rc, b, ink) {
  const st = (b.schritte || []).slice(0, 6).map(String); const n = Math.max(1, st.length);
  if (n <= 3) {
    const W = 400, bw = (W - 20 - (n - 1) * 34) / n, H = 110;
    st.forEach((t, i) => { const x = 10 + i * (bw + 34); svg.appendChild(rc.rectangle(x, 22, bw, 66, { stroke: ink, strokeWidth: 1.7, roughness: 1.2, seed: 20 + i, fill: i === n - 1 ? 'rgba(255,214,64,.35)' : undefined, fillStyle: 'solid' })); label(svg, x + bw / 2, 61, t, { size: 16, max: Math.max(8, Math.round(bw / 9)) }); if (i < n - 1) arrow(svg, rc, x + bw + 5, 55, x + bw + 29, 55, ink, 30 + i); });
    return [W, H];
  }
  const W = 400, bh = 46, gap = 28, H = 16 + n * bh + (n - 1) * gap;
  st.forEach((t, i) => { const y = 8 + i * (bh + gap); svg.appendChild(rc.rectangle(70, y, 260, bh, { stroke: ink, strokeWidth: 1.7, roughness: 1.2, seed: 20 + i, fill: i === n - 1 ? 'rgba(255,214,64,.35)' : undefined, fillStyle: 'solid' })); label(svg, 200, y + bh / 2 + 6, t, { size: 16, max: 28 }); if (i < n - 1) arrow(svg, rc, 200, y + bh + 4, 200, y + bh + gap - 4, ink, 30 + i); });
  return [W, H];
}

function vergleich(svg, rc, b, ink) {
  const z = (b.zeilen || []).slice(0, 6), W = 400, rh = 46, H = 64 + z.length * rh;
  const o = { stroke: ink, strokeWidth: 1.6, roughness: 1, seed: 40 };
  label(svg, 105, 32, b.links || '', { size: 18, max: 18, weight: 700 }); label(svg, 295, 32, b.rechts || '', { size: 18, max: 18, weight: 700 });
  svg.appendChild(rc.line(12, 48, 388, 48, o)); svg.appendChild(rc.line(200, 14, 200, H - 6, o));
  z.forEach((r, i) => { const y = 48 + i * rh + rh / 2 + 6; label(svg, 105, y, Array.isArray(r) ? r[0] : r, { size: 15, max: 22 }); label(svg, 295, y, Array.isArray(r) ? r[1] : '', { size: 15, max: 22 }); });
  return [W, H];
}

function kreis(svg, rc, b, ink) {
  let parts = (b.teile || []).slice(0, 6).map(p => Array.isArray(p) ? [String(p[0]), Math.max(0, num(p[1]) || 0)] : [String(p), 1]);
  const tot = parts.reduce((s, p) => s + p[1], 0) || 1; const W = 400, H = 250, cx = 130, cy = 125, r = 100;
  const fills = ['rgba(31,60,136,.55)', 'rgba(192,57,43,.55)', 'rgba(30,122,76,.55)', 'rgba(230,160,20,.65)', 'rgba(120,70,160,.55)', 'rgba(90,90,90,.45)'];
  let a = -Math.PI / 2;
  parts.forEach(([t, v], i) => {
    const s = a, e = a + (v / tot) * Math.PI * 2; a = e; if (e - s < 0.01) return;
    svg.appendChild(rc.arc(cx, cy, r * 2, r * 2, s, e, true, { stroke: ink, strokeWidth: 1.5, roughness: 0.9, fill: fills[i], fillStyle: 'hachure', hachureGap: 6, seed: 50 + i }));
    const y = 40 + i * 32; svg.appendChild(rc.rectangle(256, y - 14, 16, 16, { stroke: ink, fill: fills[i], fillStyle: 'solid', roughness: 0.6, seed: 60 + i }));
    label(svg, 280, y, `${t} (${Math.round(v / tot * 100)} %)`, { anchor: 'start', size: 15, max: 16 });
  });
  return [W, H];
}

function matrix(svg, rc, b, ink) {
  const W = 400, H = 300, f = (b.felder || []).slice(0, 4), o = { stroke: ink, strokeWidth: 1.7, roughness: 1, seed: 70 };
  svg.appendChild(rc.rectangle(60, 20, 320, 240, o)); svg.appendChild(rc.line(220, 20, 220, 260, o)); svg.appendChild(rc.line(60, 140, 380, 140, o));
  [[140, 84], [300, 84], [140, 204], [300, 204]].forEach(([x, y], i) => label(svg, x, y, f[i] || '', { size: 17, max: 14 }));
  arrow(svg, rc, 60, 284, 380, 284, ink, 71); label(svg, 380, 278, b.x || '', { anchor: 'end', size: 15, max: 30 });
  arrow(svg, rc, 30, 260, 30, 20, ink, 72);
  const t = document.createElementNS(NS, 'text'); t.setAttribute('transform', 'translate(22 140) rotate(-90)'); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', 15); t.setAttribute('class', 'ms-svgt'); t.textContent = b.y || ''; svg.appendChild(t);
  return [W, H];
}

function pyramide(svg, rc, b, ink) {
  const st = (b.stufen || []).slice(0, 5).map(String), n = Math.max(1, st.length), W = 400, H = 30 + n * 50, top = 14, base = H - 10;
  const half = y => 34 + (y - top) / (base - top) * 160;
  st.forEach((t, i) => {
    const ya = top + i * (base - top) / n, yb = top + (i + 1) * (base - top) / n;
    svg.appendChild(rc.polygon([[200 - half(ya), ya], [200 + half(ya), ya], [200 + half(yb), yb], [200 - half(yb), yb]], { stroke: ink, strokeWidth: 1.6, roughness: 1, seed: 80 + i, fill: i === 0 ? 'rgba(255,214,64,.45)' : undefined, fillStyle: 'solid' }));
    label(svg, 200, (ya + yb) / 2 + 7, t, { size: 15, max: i === 0 ? 14 : 14 + i * 5 });
  });
  return [W, H];
}

const DRAW = { kurve, tkonto: (s, r, b, i) => konto(s, r, b, i, false), bilanz: (s, r, b, i) => konto(s, r, b, i, true), fluss, vergleich, kreis, matrix, pyramide };
export const canDraw = b => !!(b && DRAW[b.typ]);
export function sketch(b, ink = '#1f3c88') {
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'ms-sk'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', b.titel || b.typ);
  const rc = rough.svg(svg);
  let wh = [400, 200];
  try { wh = DRAW[b.typ](svg, rc, b, ink); } catch (e) { console.error(e); }
  svg.setAttribute('viewBox', `0 0 ${wh[0]} ${wh[1]}`);
  return svg;
}
// Handgezogene Linie/Kasten als Deko (Unterstreichen, Formel-Kasten)
export function underline(w = 300, seed = 3, color = '#1f3c88') {
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${w} 12`); svg.setAttribute('class', 'ms-ul'); svg.setAttribute('preserveAspectRatio', 'none');
  svg.appendChild(rough.svg(svg).curve([[2, 7], [w * 0.3, 4], [w * 0.65, 8], [w - 2, 5]], { stroke: color, strokeWidth: 2, roughness: 1.4, seed })); return svg;
}
export function box(el, seed = 4, color = '#1f3c88') {
  // Kasten nachträglich um ein Element zeichnen (Größe erst nach dem Einhängen bekannt)
  const draw = () => {
    const r = el.getBoundingClientRect(); if (!r.width) return;
    el.querySelector(':scope > svg.ms-box')?.remove();
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'ms-box'); svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`); svg.setAttribute('preserveAspectRatio', 'none');
    svg.appendChild(rough.svg(svg).rectangle(3, 3, r.width - 6, r.height - 6, { stroke: color, strokeWidth: 1.8, roughness: 1.3, seed }));
    el.prepend(svg);
  };
  requestAnimationFrame(draw);
  // Größe ändert sich (Schrift geladen, Drehen, Fenster): Kasten neu zeichnen
  if (window.ResizeObserver) { let w = 0; new ResizeObserver(e => { const nw = Math.round(e[0].contentRect.width); if (nw && nw !== w) { w = nw; draw(); } }).observe(el); }
  return draw;
}
