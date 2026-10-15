// Das Gesicht des Tutors: freundlich, minimal, lebendig.
// Runde Pillen-Augen (tief gesetzt), kleiner weicher Mund, Blinzeln, Blick folgt dem Cursor.
const NS = 'http://www.w3.org/2000/svg';
const faces = new Set();
let pointer = null;
addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });

export function face(el, opts = {}) {
  const f = new Face(el, opts);
  faces.add(f);
  return f;
}

class Face {
  constructor(el, { follow = true, size } = {}) {
    this.el = el; this.follow = follow; this.state = 'idle';
    el.classList.add('face');
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 120');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.width = '100%'; svg.style.height = '100%'; svg.style.overflow = 'visible'; svg.style.display = 'block';
    svg.innerHTML = `
      <g class="fz-body">
        <rect class="fz-head" x="8" y="10" width="104" height="100" rx="38" />
        <g class="fz-look">
          <g class="fz-eyes">
            <rect class="fz-eye l" x="35" y="47" width="13" height="20" rx="6.5" />
            <rect class="fz-eye r" x="72" y="47" width="13" height="20" rx="6.5" />
            <path class="fz-happy l" d="M35 59 Q41.5 49 48 59" />
            <path class="fz-happy r" d="M72 59 Q78.5 49 85 59" />
          </g>
          <circle class="fz-cheek l" cx="30" cy="74" r="5" />
          <circle class="fz-cheek r" cx="90" cy="74" r="5" />
          <path class="fz-mouth m-idle" d="M52 79 Q60 85 68 79" />
          <path class="fz-mouth m-happy" d="M50 77 Q60 89 70 77" />
          <path class="fz-mouth m-sad" d="M53 82 Q60 78 67 82" />
          <path class="fz-mouth m-think" d="M54 81 Q60 81 66 80" />
          <ellipse class="fz-talk" cx="60" cy="81" rx="6" ry="3.4" />
        </g>
        <g class="fz-dots"><circle cx="92" cy="22" r="3"/><circle cx="101" cy="14" r="2.3"/><circle cx="108" cy="7" r="1.7"/></g>
      </g>`;
    el.appendChild(svg);
    this.svg = svg;
    this.look = svg.querySelector('.fz-look');
    this.eyes = svg.querySelector('.fz-eyes');
    this.body = svg.querySelector('.fz-body');
    this.lx = 0; this.ly = 0; this.tx = 0; this.ty = 0;
    this.idleLook = { x: 0, y: 0, until: 0 };
    this.scheduleBlink();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }
  set(state) {
    if (this.state === state) return;
    this.state = state;
    this.el.dataset.state = state;
    if (state === 'happy') { this.body.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-5px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }); }
    if (state === 'sad') { this.body.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 700, easing: 'ease-in-out' }); }
  }
  pulse(state, ms = 1600) { this.set(state); clearTimeout(this._pt); this._pt = setTimeout(() => this.set('idle'), ms); }
  blink(double) {
    if (!this.eyes.isConnected) return;
    const a = this.eyes.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.08)' }, { transform: 'scaleY(1)' }], { duration: 150, easing: 'ease-in-out' });
    if (double) a.onfinish = () => setTimeout(() => this.eyes.isConnected && this.eyes.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.08)' }, { transform: 'scaleY(1)' }], { duration: 140 }), 120);
  }
  scheduleBlink() {
    clearTimeout(this._bt);
    this._bt = setTimeout(() => { if (!this.el.isConnected) { faces.delete(this); return; } if (this.state !== 'happy') this.blink(Math.random() < .22); this.scheduleBlink(); }, 2600 + Math.random() * 3600);
  }
  loop(t) {
    if (!this.el.isConnected) { faces.delete(this); clearTimeout(this._bt); return; }
    const r = this.el.getBoundingClientRect();
    if (this.state === 'think') { this.tx = 4; this.ty = -4; }
    else if (this.follow && pointer && t - pointer.t < 4000 && r.width) {
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = pointer.x - cx, dy = pointer.y - cy, d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 400);
      this.tx = dx / d * 5 * k; this.ty = dy / d * 4 * k;
    } else {
      if (t > this.idleLook.until) {
        const roll = Math.random();
        this.idleLook = roll < .55 ? { x: 0, y: 0, until: t + 2000 + Math.random() * 3000 } : { x: (Math.random() - .5) * 8, y: (Math.random() - .5) * 4, until: t + 900 + Math.random() * 1500 };
      }
      this.tx = this.idleLook.x; this.ty = this.idleLook.y;
    }
    this.lx += (this.tx - this.lx) * .12; this.ly += (this.ty - this.ly) * .12;
    this.look.setAttribute('transform', `translate(${this.lx.toFixed(2)} ${this.ly.toFixed(2)})`);
    requestAnimationFrame(this.loop);
  }
}

// Stile einmalig einhängen
const css = `
.face svg .fz-head { fill: var(--inv); }
.face svg .fz-eye { fill: var(--onInv); transition: opacity .2s; }
.face svg .fz-eyes { transform-box: fill-box; transform-origin: center; }
.face svg .fz-happy { fill: none; stroke: var(--onInv); stroke-width: 5; stroke-linecap: round; opacity: 0; transition: opacity .2s; }
.face svg .fz-mouth { fill: none; stroke: var(--onInv); stroke-width: 3.6; stroke-linecap: round; transition: opacity .2s; opacity: 0; }
.face svg .m-idle { opacity: 1; }
.face[data-state="happy"] svg .m-idle, .face[data-state="sad"] svg .m-idle, .face[data-state="think"] svg .m-idle { opacity: 0; }
.face[data-state="happy"] svg .m-happy, .face[data-state="sad"] svg .m-sad, .face[data-state="think"] svg .m-think { opacity: 1; }
.face svg .fz-talk { fill: var(--onInv); opacity: 0; }
.face svg .fz-cheek { fill: var(--onInv); opacity: 0; transition: opacity .3s; }
.face svg .fz-dots circle { fill: var(--ink); opacity: 0; }
.face svg .fz-body { transform-box: fill-box; transform-origin: 50% 90%; }
.face[data-state="happy"] svg .fz-eye { opacity: 0; }
.face[data-state="happy"] svg .fz-happy { opacity: 1; }
.face[data-state="happy"] svg .fz-cheek { opacity: .22; }
.face[data-state="sad"] svg .fz-eye { transform: scaleY(.8); transform-box: fill-box; transform-origin: center; }
.face[data-state="think"] svg .fz-dots circle { animation: fzdot 1.2s infinite; }
.face[data-state="think"] svg .fz-dots circle:nth-child(2) { animation-delay: .2s; }
.face[data-state="think"] svg .fz-dots circle:nth-child(3) { animation-delay: .4s; }
.face[data-state="talk"] svg .fz-mouth { opacity: 0 !important; }
.face[data-state="talk"] svg .fz-talk { opacity: 1; animation: fztalk .32s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
@keyframes fzdot { 0%, 100% { opacity: .15; } 50% { opacity: 1; } }
@keyframes fztalk { from { transform: scaleY(.35); } to { transform: scaleY(1.15); } }
`;
const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
