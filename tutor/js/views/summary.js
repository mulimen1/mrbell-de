// Lernzettel: Kernaussagen, strukturierte Zusammenfassung, Mindmap, Begriffe
import { h, ico, esc, toast } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save } from '../state.js';
import { forWhole } from '../retrieve.js';
import { loading, apiError, costBtn, freshen } from '../ui.js';
import { sanitize } from '../sanitize.js';
import { L } from '../i18n.js';

export async function render(root, ctx) {
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  const auto = ctx.arg === 'auto'; if (auto) history.replaceState(null, '', location.hash.replace(/\/auto$/, ''));
  if (auto) generate(wrap, ctx); else if (ctx.doc.summary) show(wrap, ctx); else intro(wrap, ctx);
}

function intro(wrap, ctx) {
  const f = h('div', { class: 'face' });
  wrap.replaceChildren(h('div', { class: 'empty' }, f, h('h2', {}, L('Dein Lernzettel', 'Your study sheet')),
    h('p', {}, L('Die wichtigsten Aussagen, Formeln und Begriffe auf einer Seite – plus Mindmap zum Überblick.', 'The key statements, formulas and terms on one page – plus a mind map for the big picture.')),
    costBtn(L('Lernzettel erstellen', 'Create study sheet'), 'summary', () => generate(wrap, ctx), 'btn primary lg')));
  face(f);
}

async function generate(wrap, ctx) {
  const { doc } = ctx;
  const ld = loading(wrap, L('Ich schreibe deinen Lernzettel …', 'Writing your study sheet …'), L(['Finde die Kernaussagen', 'Sortiere die Formeln', 'Zeichne die Mindmap', 'Definiere die Begriffe'], ['Finding the key statements', 'Sorting the formulas', 'Drawing the mind map', 'Defining the key terms']), 'summary');
  try {
    const r = await ask('summary', { material: forWhole(doc), docName: doc.name }, { signal: ld.signal });
    const d = r.data || {};
    if (!d.html && !d.tldr) throw new Error(L('Der Lernzettel ist leer angekommen. Versuch es nochmal.', 'The study sheet came back empty. Please try again.'));
    doc.summary = { title: d.title || doc.name, tldr: (d.tldr || []).map(String), html: String(d.html || ''), mindmap: d.mindmap || null, terms: (d.terms || []).filter(t => t && t.t), created: Date.now() };
    save(doc); ld.stop(); show(wrap, ctx); freshen(wrap);
  } catch (e) { ld.stop(); intro(wrap, ctx); apiError(e, () => generate(wrap, ctx)); }
}

function show(wrap, ctx) {
  const S = ctx.doc.summary;
  const body = h('div', { class: 'tafel', style: { padding: 0, maxWidth: 'none' } }); body.appendChild(sanitize(S.html));
  wrap.replaceChildren(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, L('Lernzettel', 'Study sheet')), h('h2', {}, S.title)),
      h('div', { style: { display: 'flex', gap: '6px' } },
        h('button', { class: 'btn sm', onclick: () => window.print() }, h('span', { html: ico('download') }), L('Drucken / PDF', 'Print / PDF')),
        costBtn(L('Neu', 'New'), 'summary', () => generate(wrap, ctx), 'btn sm ghost'))),
    S.tldr.length ? h('div', { class: 'card', style: { background: 'var(--inv)', color: 'var(--onInv)', borderColor: 'var(--inv)' } },
      h('div', { class: 'eyebrow', style: { color: 'inherit', opacity: .6, marginBottom: '10px' } }, L('Das Wichtigste in Kürze', 'Key points at a glance')),
      h('ol', { style: { margin: 0, paddingLeft: '20px', display: 'grid', gap: '6px', fontSize: '16px' } }, S.tldr.map(t => h('li', {}, t)))) : null,
    S.mindmap ? h('div', { style: { marginTop: '22px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, L('Mindmap', 'Mind map')), mindmap(S.mindmap, S.title)) : null,
    h('div', { class: 'card', style: { marginTop: '22px', padding: '26px' } }, body),
    S.terms.length ? h('div', { style: { marginTop: '22px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, L('Begriffe', 'Key terms')),
      h('div', { class: 'terms' }, S.terms.map(t => h('div', { class: 'term', role: 'button', tabindex: 0, style: { cursor: 'pointer' }, onclick: () => ctx.ask(L(`Erklär mir „${t.t}“ genauer – mit Beispiel an der Tafel.`, `Explain “${t.t}” to me in more detail – with an example on the whiteboard.`)) }, h('b', {}, t.t), h('span', {}, t.d), t.page ? h('div', { class: 'eyebrow', style: { marginTop: '8px' } }, L('S. ', 'p. ') + t.page) : null)))) : null);
}

// Mindmap: links/rechts aufgefächert (keine Überlappung), Knoten ziehbar, Äste auf-/zuklappbar,
// baut sich animiert auf, Vollbild und Download als Bild.
function mindmap(m, name = 'Mindmap') {
  const NS = 'http://www.w3.org/2000/svg';
  const branches = (m.c || []).slice(0, 8).map(b => ({ t: String(b?.t ?? b), c: (b?.c || []).slice(0, 5).map(x => String(x?.t ?? x)) }));
  const cv = document.createElement('canvas').getContext('2d');
  const FONT = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
  const meas = (t, size, w) => { cv.font = `${w} ${size}px ${FONT}`; return cv.measureText(t).width; };
  const wrapT = (s, size, w, maxW, maxL = 3) => {
    const words = String(s).split(/\s+/); const out = []; let cur = '';
    for (const x of words) { const tryS = cur ? cur + ' ' + x : x; if (cur && meas(tryS, size, w) > maxW) { out.push(cur); cur = x; } else cur = tryS; }
    if (cur) out.push(cur);
    if (out.length > maxL) { out.length = maxL; out[maxL - 1] = out[maxL - 1].replace(/\s*\S*$/, '') + ' …'; }
    return out;
  };
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  // ---------- Layout ----------
  const LEAF = { size: 13.5, w: 450, maxW: 190, lh: 17 };
  const BR = { size: 14.5, w: 650, maxW: 170, lh: 18 };
  const RT = { size: 18, w: 700, maxW: 230, lh: 22 };
  const nodes = [];
  const rootLines = wrapT(m.t || name, RT.size, RT.w, RT.maxW);
  const rootW = Math.max(...rootLines.map(l => meas(l, RT.size, RT.w))) + 56, rootH = rootLines.length * RT.lh + 34;
  const root = { kind: 'root', lines: rootLines, w: rootW, h: rootH, x: 0, y: 0 };
  nodes.push(root);
  const nR = Math.ceil(branches.length / 2);
  const sides = [branches.slice(0, nR).map(b => [b, 1]), branches.slice(nR).map(b => [b, -1])];
  const BX = Math.max(250, rootW / 2 + 130), GAP = 26;
  for (const list of sides) {
    const blocks = list.map(([b, side]) => {
      const lines = wrapT(b.t, BR.size, BR.w, BR.maxW, 2);
      const w = Math.max(...lines.map(l => meas(l, BR.size, BR.w))) + 34, hh = lines.length * BR.lh + 22;
      const leaves = b.c.map(t => { const ls = wrapT(t, LEAF.size, LEAF.w, LEAF.maxW); return { lines: ls, h: ls.length * LEAF.lh + 10, w: Math.max(...ls.map(l => meas(l, LEAF.size, LEAF.w))) }; });
      const leavesH = leaves.reduce((a, l) => a + l.h, 0);
      return { b, side, lines, w, h: hh, leaves, block: Math.max(hh, leavesH) };
    });
    const total = blocks.reduce((a, b) => a + b.block, 0) + GAP * Math.max(0, blocks.length - 1);
    let y = -total / 2;
    for (const bl of blocks) {
      const by = y + bl.block / 2;
      const bn = { kind: 'branch', lines: bl.lines, w: bl.w, h: bl.h, x: bl.side * BX, y: by, side: bl.side, parent: root, kids: [], open: true };
      nodes.push(bn);
      const leavesH = bl.leaves.reduce((a, l) => a + l.h, 0);
      let ly = by - leavesH / 2;
      const lx = bn.x + bl.side * (bl.w / 2 + 64);
      for (const lf of bl.leaves) {
        const ln = { kind: 'leaf', lines: lf.lines, w: lf.w + 14, h: lf.h, x: lx, y: ly + lf.h / 2, side: bl.side, parent: bn };
        nodes.push(ln); bn.kids.push(ln); ly += lf.h;
      }
      y += bl.block + GAP;
    }
  }
  const home = nodes.map(n => [n.x, n.y]);

  // ---------- Zeichnen ----------
  const svg = el('svg', { class: 'mm', role: 'img', 'aria-label': L('Mindmap: ', 'Mind map: ') + (m.t || name) });
  const gl = el('g', { class: 'mm-links' }, svg), gn = el('g', { class: 'mm-nodes' }, svg);
  const bounds = () => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const n of nodes) {
      const l = n.kind === 'leaf' ? (n.side > 0 ? n.x - 8 : n.x - n.w) : n.x - n.w / 2;
      const r = n.kind === 'leaf' ? (n.side > 0 ? n.x + n.w : n.x + 8) : n.x + n.w / 2;
      x0 = Math.min(x0, l); x1 = Math.max(x1, r); y0 = Math.min(y0, n.y - n.h / 2); y1 = Math.max(y1, n.y + n.h / 2);
    }
    return { x: x0 - 36, y: y0 - 30, w: x1 - x0 + 72, h: y1 - y0 + 60 };
  };
  const fit = () => { const b = bounds(); svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`); svg.style.aspectRatio = `${b.w} / ${b.h}`; };
  for (const n of nodes) {
    n.g = el('g', { class: 'mm-n mm-' + n.kind }, gn);
    if (n.parent) n.path = el('path', { class: 'mm-l mm-l-' + n.kind }, gl);
    if (n.kind === 'leaf') {
      el('circle', { r: 3.6, cx: 0, cy: 0, class: 'mm-dot' }, n.g);
      const anchor = n.side > 0 ? 'start' : 'end', dx = n.side > 0 ? 10 : -10;
      n.lines.forEach((l, i) => { const t = el('text', { x: dx, y: (i - (n.lines.length - 1) / 2) * LEAF.lh, 'text-anchor': anchor, 'dominant-baseline': 'central', 'font-size': LEAF.size, 'font-weight': LEAF.w }, n.g); t.textContent = l; });
    } else {
      const S = n.kind === 'root' ? RT : BR;
      el('rect', { x: -n.w / 2, y: -n.h / 2, width: n.w, height: n.h, rx: Math.min(n.h / 2, 26), class: 'mm-box' }, n.g);
      n.lines.forEach((l, i) => { const t = el('text', { x: 0, y: (i - (n.lines.length - 1) / 2) * S.lh, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': S.size, 'font-weight': S.w }, n.g); t.textContent = l; });
      if (n.kind === 'branch' && n.kids.length) { n.badge = el('text', { class: 'mm-badge', x: n.side * (n.w / 2 + 12), y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 12 }, n.g); }
    }
  }
  const edge = (n, toward) => {
    if (n.kind === 'leaf') return [n.x, n.y];
    return [n.x + Math.sign(toward - n.x || 1) * n.w / 2, n.y];
  };
  const draw = () => {
    for (const n of nodes) {
      n.g.setAttribute('transform', `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
      if (n.path) {
        const [ax, ay] = edge(n.parent, n.x), [bx, by] = edge(n, n.parent.x);
        const mx = (ax + bx) / 2;
        n.path.setAttribute('d', `M${ax.toFixed(1)} ${ay.toFixed(1)} C${mx.toFixed(1)} ${ay.toFixed(1)} ${mx.toFixed(1)} ${by.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
      }
      if (n.badge) n.badge.textContent = n.open ? '−' : '+' + n.kids.length;
    }
  };
  draw(); fit();

  // ---------- Ziehen & Aufklappen ----------
  const toSvg = (cx, cy) => { const p = svg.createSVGPoint(); p.x = cx; p.y = cy; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const subtree = n => n.kind === 'root' ? nodes : n.kind === 'branch' ? [n, ...n.kids] : [n];
  const toggle = n => {
    n.open = !n.open;
    n.kids.forEach((k, i) => {
      const show = n.open;
      [k.g, k.path].forEach(e => {
        e.style.pointerEvents = show ? '' : 'none';
        e.getAnimations().forEach(x => { if (x.effect?.getKeyframes?.()[0]?.opacity != null && !x.effect.getKeyframes()[0].transform) x.cancel(); });
        e.animate([{ opacity: show ? 0 : 1 }, { opacity: show ? 1 : 0 }], { duration: 240, delay: i * 35, easing: 'ease-out', fill: 'forwards' });
      });
    });
    draw();
  };
  svg.addEventListener('pointerdown', e => {
    const g = e.target.closest('.mm-n'); if (!g) return;
    const n = nodes.find(x => x.g === g); if (!n) return;
    e.preventDefault();
    const p0 = toSvg(e.clientX, e.clientY), set = subtree(n).map(x => [x, x.x, x.y]);
    let moved = false;
    g.setPointerCapture(e.pointerId); g.classList.add('drag');
    const mv = ev => {
      const p = toSvg(ev.clientX, ev.clientY), dx = p.x - p0.x, dy = p.y - p0.y;
      if (!moved && Math.hypot(dx, dy) < 4) return; moved = true;
      for (const [x, ox, oy] of set) { x.x = ox + dx; x.y = oy + dy; }
      draw();
    };
    const up = () => {
      g.removeEventListener('pointermove', mv); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up);
      g.classList.remove('drag');
      if (!moved && n.kind === 'branch' && n.kids.length) toggle(n);
      else if (moved) { const b = bounds(), vb = svg.viewBox.baseVal; if (b.x < vb.x || b.y < vb.y || b.x + b.w > vb.x + vb.width || b.y + b.h > vb.y + vb.height) fit(); }
    };
    g.addEventListener('pointermove', mv); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
  });

  // ---------- Aufbau-Animation (sobald sichtbar) ----------
  const intro = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let k = 0;
    for (const n of nodes) {
      const d = n.kind === 'root' ? 0 : n.kind === 'branch' ? 180 + nodes.filter(x => x.kind === 'branch').indexOf(n) * 110 : 520 + (k++) * 28;
      n.g.animate([{ opacity: 0, transform: `translate(${n.x}px, ${n.y}px) scale(.4)` }, { opacity: 1, transform: `translate(${n.x}px, ${n.y}px) scale(1)` }], { duration: 520, delay: d, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
      if (n.path) { const len = n.path.getTotalLength(); n.path.animate([{ strokeDasharray: `${len} ${len}`, strokeDashoffset: len }, { strokeDasharray: `${len} ${len}`, strokeDashoffset: 0 }], { duration: 520, delay: Math.max(0, d - 120), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }); }
    }
  };

  // ---------- Werkzeuge ----------
  const box = h('div', { class: 'mindmap' }, h('div', { class: 'mm-scroll' }, svg));
  const reset = () => { nodes.forEach((n, i) => { n.x = home[i][0]; n.y = home[i][1]; }); nodes.filter(n => n.kind === 'branch' && !n.open).forEach(toggle); draw(); fit(); intro(); };
  const isFull = () => document.fullscreenElement === box || box.classList.contains('mm-full');
  const fullBtn = h('button', { class: 'btn sm', type: 'button' });
  const setFullBtn = () => { const f = isFull(); fullBtn.replaceChildren(h('span', { html: ico(f ? 'shrink' : 'expand') }), f ? L('Vollbild beenden', 'Exit full screen') : L('Vollbild', 'Full screen')); };
  const full = () => {
    if (document.fullscreenElement === box) { document.exitFullscreen(); return; }
    if (box.classList.contains('mm-full')) { box.classList.remove('mm-full'); setFullBtn(); return; }
    if (box.requestFullscreen) box.requestFullscreen().catch(() => { box.classList.add('mm-full'); setFullBtn(); });
    else { box.classList.add('mm-full'); setFullBtn(); }
  };
  fullBtn.addEventListener('click', full); setFullBtn();
  document.addEventListener('fullscreenchange', function fc() { if (!box.isConnected) return document.removeEventListener('fullscreenchange', fc); setFullBtn(); });
  const tools = h('div', { class: 'mm-tools' },
    h('span', { class: 'mm-hint' }, L('Knoten ziehen · Ast antippen zum Auf-/Zuklappen', 'Drag nodes · tap a branch to expand/collapse')),
    h('span', { style: { flex: 1 } }),
    h('button', { class: 'btn sm ghost', type: 'button', onclick: reset }, h('span', { html: ico('refresh') }), L('Neu anordnen', 'Rearrange')),
    h('button', { class: 'btn sm ghost', type: 'button', onclick: () => exportPng(svg, box, name) }, h('span', { html: ico('download') }), L('Als Bild', 'Save image')),
    fullBtn);
  box.prepend(tools);
  document.addEventListener('keydown', function esc(e) { if (!box.isConnected) return document.removeEventListener('keydown', esc); if (e.key === 'Escape' && box.classList.contains('mm-full')) { box.classList.remove('mm-full'); setFullBtn(); } });
  const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); intro(); } }, { threshold: .25 });
  requestAnimationFrame(() => io.observe(box));
  return box;
}

async function exportPng(svg, box, name) {
  try {
    const clone = svg.cloneNode(true);
    const src = [svg, ...svg.querySelectorAll('*')], dst = [clone, ...clone.querySelectorAll('*')];
    src.forEach((e, i) => { const cs = getComputedStyle(e), d = dst[i]; ['fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity', 'font-family', 'font-size', 'font-weight'].forEach(p => d.style.setProperty(p, cs.getPropertyValue(p))); d.style.opacity = '1'; d.removeAttribute('class'); });
    const vb = svg.viewBox.baseVal, scale = 2;
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ['x', 'y', 'width', 'height'].forEach((k, i) => bg.setAttribute(k, [vb.x, vb.y, vb.width, vb.height][i]));
    bg.setAttribute('fill', getComputedStyle(box).backgroundColor || '#fff');
    clone.insertBefore(bg, clone.firstChild);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', vb.width * scale); clone.setAttribute('height', vb.height * scale);
    clone.style.removeProperty('aspect-ratio');
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    await img.decode();
    const c = document.createElement('canvas'); c.width = vb.width * scale; c.height = vb.height * scale;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const a = h('a', { href: URL.createObjectURL(blob), download: `${L('Mindmap', 'Mind map')} - ${String(name).replace(/[\\/:*?"<>|]/g, '').slice(0, 60)}.png` });
    document.body.appendChild(a); a.click(); a.remove();
    toast(L('Mindmap gespeichert – liegt in deinen Downloads.', 'Mind map saved – it’s in your downloads.'));
  } catch (e) { console.error(e); toast(L('Das Bild konnte nicht erstellt werden.', 'The image couldn’t be created.')); }
}
