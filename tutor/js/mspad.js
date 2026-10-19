// Mitschrift: Zeichenblatt – mit Maus, Finger oder Apple Pencil (Druckstärke) zeichnen.
// Striche werden als Vektoren gespeichert (Rückgängig, scharf in jeder Größe), Koordinaten in 1000er-Breite.
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { TINTE, inkOf } from './mspal.js';

const W = 1000;
const SIZES = [2.2, 4, 8];

// Striche auf einen Canvas zeichnen (auch für das fertige Blatt)
export function paint(ctx, strokes, scale, ink) {
  for (const s of strokes) {
    const pts = s.p; if (!pts || !pts.length) continue;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (s.t === 'erase') ctx.globalCompositeOperation = 'destination-out';
    if (s.t === 'mark') { ctx.globalAlpha = 0.32; ctx.globalCompositeOperation = 'multiply'; }
    ctx.strokeStyle = ctx.fillStyle = s.t === 'erase' ? '#000' : (s.c === 'ink' ? ink : s.c);
    const base = (s.t === 'mark' ? 22 : s.t === 'erase' ? 26 : s.w) * scale;
    if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0] * scale, pts[0][1] * scale, base * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); continue; }
    if (s.t !== 'pen') {
      ctx.lineWidth = base; ctx.beginPath(); ctx.moveTo(pts[0][0] * scale, pts[0][1] * scale);
      for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0] * scale, pts[i][1] * scale, mx * scale, my * scale); }
      const l = pts[pts.length - 1]; ctx.lineTo(l[0] * scale, l[1] * scale); ctx.stroke(); ctx.restore(); continue;
    }
    // Stift: Strichstärke folgt dem Druck – Stück für Stück, weich verbunden
    let px = pts[0][0], py = pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [x, y, pr] = pts[i], nx = i < pts.length - 1 ? (x + pts[i + 1][0]) / 2 : x, ny = i < pts.length - 1 ? (y + pts[i + 1][1]) / 2 : y;
      ctx.lineWidth = base * (0.45 + (pr == null ? 0.5 : pr) * 1.1);
      ctx.beginPath(); ctx.moveTo(px * scale, py * scale); ctx.quadraticCurveTo(x * scale, y * scale, nx * scale, ny * scale); ctx.stroke();
      px = nx; py = ny;
    }
    ctx.restore();
  }
}
// Bereich, in dem wirklich gezeichnet wurde (zum Zuschneiden auf dem fertigen Blatt)
export function bounds(strokes) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const s of strokes) if (s.t !== 'erase') for (const [x, y] of s.p) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return isFinite(a) ? [Math.max(0, a - 24), Math.max(0, b - 24), Math.min(W, c + 24), d + 24] : null;
}
// Fertiges Blatt: Zeichnung zugeschnitten als scharfer Canvas
export function drawingEl(z, inkHex) {
  const bb = bounds(z.strokes || []); if (!bb) return null;
  const [x0, y0, x1, y1] = bb, w = x1 - x0, hh = y1 - y0, dpr = Math.min(2, window.devicePixelRatio || 1), out = 900;
  const sc = out / W;
  const cv = h('canvas', { class: 'ms-draw', width: Math.round(w * sc * dpr), height: Math.round(hh * sc * dpr) });
  cv.style.aspectRatio = `${w} / ${hh}`;
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr); ctx.translate(-x0 * sc, -y0 * sc);
  paint(ctx, z.strokes, sc, inkHex);
  return cv;
}
// Bild für die KI (Handschrift lesen): weißer Hintergrund, JPEG
export function drawingJpeg(z) {
  const bb = bounds(z.strokes || []); if (!bb) return null;
  const [x0, y0, x1, y1] = bb, sc = 1.4, cv = document.createElement('canvas');
  cv.width = Math.round((x1 - x0) * sc); cv.height = Math.round((y1 - y0) * sc);
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.translate(-x0 * sc, -y0 * sc);
  paint(ctx, z.strokes.filter(s => s.t !== 'mark'), sc, '#111');
  return { mime: 'image/jpeg', data: cv.toDataURL('image/jpeg', 0.85).split(',')[1] };
}

// Zeichenblatt im Editor
export function pad(z, blatt, onChange) {
  z.strokes = z.strokes || []; z.h = z.h || 1250;
  let tool = 'pen', color = 'ink', size = 1, penSeen = false, cur = null, redo = [];
  const cv = h('canvas', { class: 'mz-cv' });
  const host = h('div', { class: 'mz-host' }, cv);
  const ctx = cv.getContext('2d');
  let scale = 1;
  function fit() {
    const wpx = host.clientWidth || 600, dpr = Math.min(2.5, window.devicePixelRatio || 1);
    scale = wpx / W; const hpx = z.h * scale;
    cv.style.width = wpx + 'px'; cv.style.height = hpx + 'px';
    cv.width = Math.round(wpx * dpr); cv.height = Math.round(hpx * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); redraw();
  }
  function redraw() { ctx.clearRect(0, 0, cv.width, cv.height); paint(ctx, cur ? [...z.strokes, cur] : z.strokes, scale, inkOf(blatt)); }
  const pos = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / scale * 10) / 10, Math.round((e.clientY - r.top) / scale * 10) / 10, e.pointerType === 'pen' ? Math.round((e.pressure || 0.5) * 100) / 100 : 0.5]; };
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'pen') penSeen = true;
    if (penSeen && e.pointerType === 'touch') return;   // Handballen ignorieren, sobald ein Stift benutzt wird
    if (e.button > 0) return;
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    cur = { t: tool, c: tool === 'mark' ? '#ffd23f' : color, w: SIZES[size], p: [pos(e)] }; redraw();
  });
  cv.addEventListener('pointermove', e => {
    if (!cur) return; e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) { const p = pos(ev), l = cur.p[cur.p.length - 1]; if (Math.abs(p[0] - l[0]) + Math.abs(p[1] - l[1]) > 0.8) cur.p.push(p); }
    redraw();
  });
  const end = () => { if (!cur) return; z.strokes.push(cur); cur = null; redo = []; redraw(); onChange(); bar(); };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);

  const tb = h('div', { class: 'mz-bar', role: 'toolbar', 'aria-label': L('Zeichnen', 'Drawing') });
  const B = (on, label, icon, fn, extra = '') => h('button', { type: 'button', class: 'mz-b' + (on ? ' on' : '') + extra, 'aria-pressed': String(!!on), title: label, 'aria-label': label, onclick: fn, html: icon });
  const PEN = '<svg viewBox="0 0 24 24"><path d="M4 20l4.5-1L19 8.5a2.1 2.1 0 0 0-3-3L5.5 16z"/></svg>';
  const MARK = '<svg viewBox="0 0 24 24"><path d="m9 15 7-7 3 3-7 7z"/><path d="M9 15 6 18h4M4 21h16"/></svg>';
  const ERASE = '<svg viewBox="0 0 24 24"><path d="M8 19h11M5.5 15.5 14 7a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L12 19H8.5z"/></svg>';
  const UNDO = '<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>';
  const REDO = '<svg viewBox="0 0 24 24"><path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg>';
  function bar() {
    tb.replaceChildren(
      h('div', { class: 'mz-g' }, B(tool === 'pen', L('Stift', 'Pen'), PEN, () => { tool = 'pen'; bar(); }), B(tool === 'mark', L('Textmarker', 'Highlighter'), MARK, () => { tool = 'mark'; bar(); }), B(tool === 'erase', L('Radierer', 'Eraser'), ERASE, () => { tool = 'erase'; bar(); })),
      h('div', { class: 'mz-g' }, [['ink', inkOf(blatt), L('Tinte', 'Ink')], ...TINTE().filter(t => t[2] !== inkOf(blatt)).map(t => [t[2], t[2], t[1]])].slice(0, 5).map(([v, hex, n]) =>
        h('button', { type: 'button', class: 'mz-c' + (color === v && tool === 'pen' ? ' on' : ''), title: n, 'aria-label': n, style: { background: hex }, onclick: () => { color = v; tool = 'pen'; bar(); } }))),
      h('div', { class: 'mz-g' }, SIZES.map((s, i) => h('button', { type: 'button', class: 'mz-sz' + (size === i ? ' on' : ''), title: [L('Fein', 'Fine'), L('Mittel', 'Medium'), L('Dick', 'Thick')][i], onclick: () => { size = i; bar(); } }, h('i', { style: { width: 4 + i * 4 + 'px', height: 4 + i * 4 + 'px' } })))),
      h('div', { class: 'mz-g' }, B(false, L('Rückgängig', 'Undo'), UNDO, () => { if (z.strokes.length) { redo.push(z.strokes.pop()); redraw(); onChange(); bar(); } }, z.strokes.length ? '' : ' off'),
        B(false, L('Wiederholen', 'Redo'), REDO, () => { if (redo.length) { z.strokes.push(redo.pop()); redraw(); onChange(); bar(); } }, redo.length ? '' : ' off'),
        h('button', { type: 'button', class: 'mz-t', onclick: () => { if (!z.strokes.length) return; redo = z.strokes.splice(0).reverse(); redraw(); onChange(); bar(); } }, L('Leeren', 'Clear'))));
  }
  bar();
  const more = h('button', { type: 'button', class: 'mz-more', onclick: () => { z.h += 600; fit(); onChange(); } }, h('span', { html: ico('plus') }), L('Mehr Platz', 'More space'));
  const el = h('div', { class: 'mz' }, tb, host, more);
  const ro = window.ResizeObserver ? new ResizeObserver(() => fit()) : null;
  if (ro) ro.observe(host); else requestAnimationFrame(fit);
  return { el, fit, recolor: () => { redraw(); bar(); }, stop: () => ro && ro.disconnect() };
}
