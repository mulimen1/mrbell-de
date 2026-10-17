// Max fliegt: EIN Kopf, der zwischen Begrüßung, Tutor-Raum und seinem Platz unten rechts hin- und herwandert.
// Bogenflug (leicht nach oben gewölbt), Blick in Flugrichtung, sanftes Neigen, Nachzieh-Schatten, weiche Landung.
import { face } from './face.js';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// schneller Start, lange weiche Landung
const ease = u => { const a = 1 - u; return 1 - a * a * a * (1 + 1.6 * u); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function fly(from, to, { dur = 880, arc = .28, state = 'happy', z = 160 } = {}) {
  if (!from || !to || !from.width || !to.width || reduce()) return Promise.resolve(false);
  const size = Math.round(Math.max(from.width, to.width));
  const mk = cls => { const el = document.createElement('div'); el.className = 'flyer' + (cls ? ' ' + cls : ''); el.style.cssText = `position:fixed;left:0;top:0;width:${size}px;height:${size}px;z-index:${z};pointer-events:none;will-change:transform,opacity;`; return el; };
  const el = mk('');
  const fc = face(el, { follow: false }); fc.set(state);
  const sx = from.left + from.width / 2, sy = from.top + from.height / 2, ex = to.left + to.width / 2, ey = to.top + to.height / 2;
  const dx = ex - sx, dy = ey - sy, dist = Math.hypot(dx, dy) || 1;
  // Kontrollpunkt senkrecht zur Strecke, immer nach oben gewölbt
  let nx = -dy / dist, ny = dx / dist; if (ny > 0) { nx = -nx; ny = -ny; }
  const bow = Math.min(dist * arc, 240);
  const cx = (sx + ex) / 2 + nx * bow, cy = (sy + ey) / 2 + ny * bow;
  const s0 = from.width / size, s1 = to.width / size;
  const N = 40, kf = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, t = ease(u), m = 1 - t;
    const x = m * m * sx + 2 * m * t * cx + t * t * ex, y = m * m * sy + 2 * m * t * cy + t * t * ey;
    const tx = 2 * m * (cx - sx) + 2 * t * (ex - cx);
    const rot = clamp(tx / (Math.abs(tx) + 60) * 11, -11, 11) * Math.sin(Math.PI * u);
    const sc = s0 + (s1 - s0) * t + Math.sin(Math.PI * u) * .07 * Math.max(s0, s1);
    kf.push({ transform: `translate(${(x - size / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`, offset: u });
  }
  document.body.appendChild(el);
  fc.lookAt(dx / dist * 42, dy / dist * 24, dur + 200);
  // Nachzieh-Schatten: zwei blasse Kopien kurz dahinter (wirkt wie Bewegungsunschärfe)
  const ghosts = [1, 2].map(k => {
    const g = mk('ghost face'); g.dataset.state = state; const svg = el.querySelector('svg'); if (svg) g.appendChild(svg.cloneNode(true));
    g.style.opacity = String(k === 1 ? .2 : .09); document.body.insertBefore(g, el);
    g.animate(kf, { duration: dur, delay: 26 * k, easing: 'linear', fill: 'both' });
    return g;
  });
  const a = el.animate(kf, { duration: dur, easing: 'linear', fill: 'forwards' });
  return a.finished.catch(() => {}).then(() => { el.remove(); setTimeout(() => ghosts.forEach(g => g.remove()), 70); return true; });
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
    const r = roomHead.el.getBoundingClientRect();
    const flew = await fly(fromRect, r, opts);
    roomHead.show(flew);
    return 'room';
  }
  try {
    const m = await import('./assistant.js');
    const api = m.mountAssistant();
    if (!api || !m.isAssistantEnabled()) return null;
    api.holdBub(true);
    const r = api.bubFaceRect();
    const flew = await fly(fromRect, r, opts);
    api.holdBub(false, flew);
    return 'bub';
  } catch (e) { return null; }
}
