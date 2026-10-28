// Max fliegt: EIN Kopf, der zwischen Begrüßung, Tutor-Raum und seinem Platz unten rechts hin- und herwandert.
// Bogenflug (leicht nach oben gewölbt), Blick in Flugrichtung, sanftes Neigen, Nachzieh-Schatten, weiche Landung.
import { face } from './face.js';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// schneller Start, lange weiche Landung
const ease = u => { const a = 1 - u; return 1 - a * a * a * (1 + 1.6 * u); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// to darf eine Funktion sein: dann wird das Ziel in jedem Bild neu gemessen – wandert die Seite während des Flugs
// (z. B. weil die Seitenleiste einklappt), landet der Kopf trotzdem exakt da, wo er bleibt. Kein Nachruckeln.
export function fly(from, to, { dur = 900, arc = .26, state = 'idle', z = 160, linger = 200 } = {}) {
  const target = typeof to === 'function' ? to : () => to;
  const first = target();
  if (!from || !first || !from.width || !first.width || reduce()) return Promise.resolve(false);
  const size = Math.round(Math.max(from.width, first.width));
  const hs = Math.round(size * (first.height / first.width || 1));   // Seitenverhältnis wie das echte Gesicht – sonst ändert sich die Kopfform beim Landen
  const mk = cls => { const el = document.createElement('div'); el.className = 'flyer' + (cls ? ' ' + cls : ''); el.style.cssText = `position:fixed;left:0;top:0;width:${size}px;height:${hs}px;z-index:${z};pointer-events:none;will-change:transform;`; return el; };
  const el = mk('');
  const fc = face(el, { follow: false }); fc.set(state);
  document.body.appendChild(el);
  const sx = from.left + from.width / 2, sy = from.top + from.height / 2;
  { const dx = first.left + first.width / 2 - sx, dy = first.top + first.height / 2 - sy, d = Math.hypot(dx, dy) || 1; fc.lookAt(dx / d * 42, dy / d * 24, dur + 300); }
  // Nachzieh-Schatten: zwei blasse Kopien, die ein paar Bilder hinterherhängen
  const ghosts = [1, 2].map(k => { const g = mk('ghost face'); g.dataset.state = state; const svg = el.querySelector('svg'); if (svg) g.appendChild(svg.cloneNode(true)); g.style.opacity = String(k === 1 ? .18 : .08); g.style.visibility = 'hidden'; document.body.insertBefore(g, el); return g; });
  const trail = [];
  const at = (u, r) => {
    const t = ease(u), m = 1 - t;
    const ex = r.left + r.width / 2, ey = r.top + r.height / 2;
    const dx = ex - sx, dy = ey - sy, dist = Math.hypot(dx, dy) || 1;
    let nx = -dy / dist, ny = dx / dist; if (ny > 0) { nx = -nx; ny = -ny; }
    const bow = Math.min(dist * arc, 220);
    const cx = (sx + ex) / 2 + nx * bow, cy = (sy + ey) / 2 + ny * bow;
    const x = m * m * sx + 2 * m * t * cx + t * t * ex, y = m * m * sy + 2 * m * t * cy + t * t * ey;
    const tx = 2 * m * (cx - sx) + 2 * t * (ex - cx);
    const rot = clamp(tx / (Math.abs(tx) + 60) * 9, -9, 9) * Math.sin(Math.PI * u);
    const w = from.width + (r.width - from.width) * t;
    return `translate(${(x - size / 2).toFixed(2)}px, ${(y - hs / 2).toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${(w / size).toFixed(4)})`;
  };
  el.style.transform = at(0, first);
  return new Promise(res => {
    const t0 = performance.now(); let last = first;
    const frame = now => {
      const u = Math.min(1, (now - t0) / dur);
      const r = target(); if (r && r.width) last = r;
      const tf = at(u, last);
      el.style.transform = tf; trail.push(tf);
      ghosts.forEach((g, k) => { const tr = trail[trail.length - 1 - 2 * (k + 1)]; if (tr) { g.style.transform = tr; g.style.visibility = ''; } });
      if (u < 1) { requestAnimationFrame(frame); return; }
      // Gelandet: exakt auf dem Ziel. Das echte Gesicht erscheint darunter, die Kopie bleibt kurz drüber und geht dann.
      ghosts.forEach(g => g.remove());
      res(true);
      // Echtes Gesicht steht deckungsgleich darunter: Kopie nach zwei Bildern weg, kein Überblenden (sonst doppelte Kontur)
      requestAnimationFrame(() => requestAnimationFrame(() => el.remove()));
    };
    requestAnimationFrame(frame);
  });
}

// Landung: kurz zusammengedrückt, dann federnd auf Größe
export function land(el) {
  if (!el || reduce()) return;
  el.animate([{ transform: 'scale(.9, 1.08)' }, { transform: 'scale(1.07, .95)' }, { transform: 'scale(.98, 1.02)' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.3,1.4,.5,1)' });
}

// Wo ist Max gerade „zu Hause“? Im Tutor-Raum der große Kopf, sonst unten rechts.
let roomHead = null;
export function setRoomHead(o) { roomHead = o; }
export const roomHeadEl = () => (roomHead && roomHead.el.isConnected ? roomHead.el : null);
export function hideDock() { if (roomHeadEl()) roomHead.hide(); }
export async function dockTo(fromRect, opts = {}) {
  if (roomHeadEl()) {
    roomHead.hide();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const el = roomHead.el;
    const flew = await fly(fromRect, () => el.getBoundingClientRect(), opts);
    roomHead.show(flew);
    return 'room';
  }
  try {
    const m = await import('./assistant.js');
    const api = m.mountAssistant();
    if (!api || !m.isAssistantEnabled()) return null;
    api.holdBub(true);
    const flew = await fly(fromRect, () => api.bubFaceRect(), opts);
    api.holdBub(false, flew);
    return 'bub';
  } catch (e) { return null; }
}
