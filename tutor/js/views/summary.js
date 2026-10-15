// Lernzettel: Kernaussagen, strukturierte Zusammenfassung, Mindmap, Begriffe
import { h, ico, esc } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save } from '../state.js';
import { forWhole } from '../retrieve.js';
import { loading, apiError, costBtn } from '../ui.js';
import { sanitize } from '../sanitize.js';

export async function render(root, ctx) {
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  if (ctx.doc.summary) show(wrap, ctx); else intro(wrap, ctx);
}

function intro(wrap, ctx) {
  const f = h('div', { class: 'face' });
  wrap.replaceChildren(h('div', { class: 'empty' }, f, h('h2', {}, 'Dein Lernzettel'),
    h('p', {}, 'Die wichtigsten Aussagen, Formeln und Begriffe auf einer Seite – plus Mindmap zum Überblick.'),
    costBtn('Lernzettel erstellen', 'summary', () => generate(wrap, ctx), 'btn primary lg')));
  face(f);
}

async function generate(wrap, ctx) {
  const { doc } = ctx;
  const ld = loading(wrap, 'Ich schreibe deinen Lernzettel …', ['Finde die Kernaussagen', 'Sortiere die Formeln', 'Zeichne die Mindmap', 'Definiere die Begriffe']);
  try {
    const r = await ask('summary', { material: forWhole(doc), docName: doc.name });
    const d = r.data || {};
    if (!d.html && !d.tldr) throw new Error('Der Lernzettel ist leer angekommen. Versuch es nochmal.');
    doc.summary = { title: d.title || doc.name, tldr: (d.tldr || []).map(String), html: String(d.html || ''), mindmap: d.mindmap || null, terms: (d.terms || []).filter(t => t && t.t), created: Date.now() };
    save(doc); ld.stop(); show(wrap, ctx);
  } catch (e) { ld.stop(); intro(wrap, ctx); apiError(e, () => generate(wrap, ctx)); }
}

function show(wrap, ctx) {
  const S = ctx.doc.summary;
  const body = h('div', { class: 'tafel', style: { padding: 0, maxWidth: 'none' } }); body.appendChild(sanitize(S.html));
  wrap.replaceChildren(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Lernzettel'), h('h2', {}, S.title)),
      h('div', { style: { display: 'flex', gap: '6px' } },
        h('button', { class: 'btn sm', onclick: () => window.print() }, h('span', { html: ico('download') }), 'Drucken / PDF'),
        costBtn('Neu', 'summary', () => generate(wrap, ctx), 'btn sm ghost'))),
    S.tldr.length ? h('div', { class: 'card', style: { background: 'var(--inv)', color: 'var(--onInv)', borderColor: 'var(--inv)' } },
      h('div', { class: 'eyebrow', style: { color: 'inherit', opacity: .6, marginBottom: '10px' } }, 'Das Wichtigste in Kürze'),
      h('ol', { style: { margin: 0, paddingLeft: '20px', display: 'grid', gap: '6px', fontSize: '16px' } }, S.tldr.map(t => h('li', {}, t)))) : null,
    S.mindmap ? h('div', { style: { marginTop: '22px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Mindmap'), mindmap(S.mindmap)) : null,
    h('div', { class: 'card', style: { marginTop: '22px', padding: '26px' } }, body),
    S.terms.length ? h('div', { style: { marginTop: '22px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Begriffe'),
      h('div', { class: 'terms' }, S.terms.map(t => h('div', { class: 'term', role: 'button', tabindex: 0, style: { cursor: 'pointer' }, onclick: () => ctx.ask(`Erklär mir „${t.t}“ genauer – mit Beispiel an der Tafel.`) }, h('b', {}, t.t), h('span', {}, t.d), t.page ? h('div', { class: 'eyebrow', style: { marginTop: '8px' } }, 'S. ' + t.page) : null)))) : null);
}

// Radiale Mindmap als SVG
function mindmap(m) {
  const NS = 'http://www.w3.org/2000/svg';
  const kids = (m.c || []).slice(0, 7);
  const W = 1000, H = Math.max(520, 140 + kids.length * 70), cx = W / 2, cy = H / 2;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.width = '100%'; svg.style.minWidth = '640px'; svg.style.height = 'auto';
  const add = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; svg.appendChild(e); return e; };
  const wrapT = (s, n) => { const w = String(s).split(' '); const lines = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n && cur) { lines.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); } if (cur) lines.push(cur); return lines.slice(0, 3); };
  const label = (x, y, s, size, weight, anchor = 'middle', max = 18) => { const ls = wrapT(s, max); ls.forEach((l, i) => add('text', { x, y: y + (i - (ls.length - 1) / 2) * (size + 3), 'font-size': size, 'font-weight': weight, 'text-anchor': anchor, 'dominant-baseline': 'middle', fill: 'currentColor' }, l)); };
  const n = kids.length || 1;
  const pos = kids.map((k, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return { a, x: cx + Math.cos(a) * 270, y: cy + Math.sin(a) * (H / 2 - 95) }; });
  // Linien
  pos.forEach((p, i) => {
    add('path', { d: `M${cx} ${cy} Q${(cx + p.x) / 2} ${(cy + p.y) / 2 - 20} ${p.x} ${p.y}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, opacity: .45 });
    const sub = (kids[i].c || []).slice(0, 4);
    sub.forEach((s, j) => {
      const spread = (j - (sub.length - 1) / 2) * .34;
      const a = p.a + spread, r2 = 150;
      const sx = p.x + Math.cos(a) * r2 * 1.25, sy = p.y + Math.sin(a) * r2 * .62;
      add('line', { x1: p.x, y1: p.y, x2: sx, y2: sy, stroke: 'currentColor', 'stroke-width': 1.2, opacity: .3 });
      add('circle', { cx: sx, cy: sy, r: 3.5, fill: 'currentColor' });
      const right = Math.cos(a) >= 0;
      label(sx + (right ? 9 : -9), sy, s.t || s, 13, 450, right ? 'start' : 'end', 20);
    });
  });
  pos.forEach((p, i) => {
    const t = kids[i].t || kids[i];
    const w = Math.min(220, 26 + Math.min(String(t).length, 18) * 8.2);
    add('rect', { x: p.x - w / 2, y: p.y - 22, width: w, height: 44, rx: 22, style: 'fill:var(--panel)', stroke: 'currentColor', 'stroke-width': 1.5 });
    label(p.x, p.y, t, 14.5, 650, 'middle', 22);
  });
  add('rect', { x: cx - 120, y: cy - 34, width: 240, height: 68, rx: 34, fill: 'currentColor' });
  const root = add('text', { x: cx, y: cy, 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', 'dominant-baseline': 'middle', style: 'fill:var(--onInv)' }, String(m.t || '').slice(0, 28));
  requestAnimationFrame(function fit() {
    if (!svg.isConnected) return requestAnimationFrame(fit);
    try { const b = svg.getBBox(); svg.setAttribute('viewBox', `${b.x - 24} ${b.y - 24} ${b.width + 48} ${b.height + 48}`); } catch (e) {}
  });
  return h('div', { class: 'mindmap', style: { color: 'var(--ink)' } }, svg);
}
