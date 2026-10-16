// BWL Max: runder Kopf (schwarz im hellen, weiß im dunklen Modus) mit blondem Mittelscheitel.
// Blinzelt, schaut dem Cursor nach. Zustände: idle, think, happy, sad, talk, smug.
const NS = 'http://www.w3.org/2000/svg';
const faces = new Set();
// Haare einmal vorladen und dekodieren, damit jeder Kopf sofort mit Frisur erscheint
const HAIR_IMG = new Image(); HAIR_IMG.src = '/tutor/img/max-hair-sm.png';
let HAIR_READY = false;
let pointer = null;
addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });

export function face(el, opts = {}) {
  const f = new Face(el, opts);
  faces.add(f);
  return f;
}

class Face {
  constructor(el, { follow = true } = {}) {
    this.el = el; this.follow = follow; this.state = 'idle';
    el.classList.add('face');
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '140 100 750 680');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'width:100%;height:100%;overflow:visible;display:block';
    svg.innerHTML = `
      <g class="fz-body">
        <ellipse class="fz-head" cx="512" cy="492" rx="262" ry="257"/>
        <g class="fz-look">
          <g class="fz-brows"><path class="fz-brow l" d="M378 452 Q414 432 452 444"/><path class="fz-brow r" d="M574 444 Q612 432 648 452"/></g>
          <g class="fz-eyes">
            <rect class="fz-eye" x="388" y="474" width="55" height="89" rx="27.5"/>
            <rect class="fz-eye" x="583" y="474" width="55" height="89" rx="27.5"/>
            <path class="fz-happy" d="M388 528 Q415.5 482 443 528 M583 528 Q610.5 482 638 528"/>
          </g>
          <circle class="fz-cheek" cx="360" cy="600" r="24"/><circle class="fz-cheek" cx="666" cy="600" r="24"/>
          <path class="fz-mouth m-idle" d="M456 613 Q512 650 568 613"/>
          <path class="fz-mouth m-happy" d="M450 604 Q512 680 574 604 Z"/>
          <path class="fz-mouth m-sad" d="M466 632 Q512 606 558 632"/>
          <path class="fz-mouth m-think" d="M470 624 Q512 624 556 618"/>
          <ellipse class="fz-talk" cx="512" cy="622" rx="30" ry="18"/>
        </g>
        <image class="fz-hair" href="/tutor/img/max-hair-sm.png" x="162" y="131" width="709" height="399" preserveAspectRatio="none"/>
        <g class="fz-dots"><circle cx="812" cy="158" r="22"/><circle cx="858" cy="112" r="16"/><circle cx="894" cy="74" r="11"/></g>
      </g>`;
    el.replaceChildren(svg);
    this.look = svg.querySelector('.fz-look');
    this.eyes = svg.querySelector('.fz-eyes');
    this.body = svg.querySelector('.fz-body');
    this.hair = svg.querySelector('.fz-hair');
    // Kopf erst zeigen, wenn die Haare da sind – nie ein kahler Max
    {
      svg.style.opacity = '0'; const t0 = performance.now();
      let shown = false;
      const show = () => { if (shown) return; shown = true; HAIR_READY = true; if (performance.now() - t0 > 60) svg.style.transition = 'opacity .18s ease'; svg.style.opacity = ''; };
      this.hair.addEventListener('load', show, { once: true });
      HAIR_IMG.decode().then(() => requestAnimationFrame(() => requestAnimationFrame(show))).catch(() => {});
      setTimeout(show, 1800);
    }
    el.dataset.state = 'idle';
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
    if (state === 'happy') this.body.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-26px)' }, { transform: 'translateY(0)' }], { duration: 440, easing: 'cubic-bezier(.16,1,.3,1)' });
    if (state === 'sad') this.body.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 800, easing: 'ease-in-out' });
    if (state === 'smug') this.hair.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 520, easing: 'ease-in-out' });
  }
  pulse(state, ms = 1600) { this.set(state); clearTimeout(this._pt); this._pt = setTimeout(() => this.set('idle'), ms); }
  blink(double) {
    if (!this.eyes?.isConnected) return;
    const kf = [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.08)' }, { transform: 'scaleY(1)' }];
    const a = this.eyes.animate(kf, { duration: 150, easing: 'ease-in-out' });
    if (double) a.onfinish = () => setTimeout(() => this.eyes?.isConnected && this.eyes.animate(kf, { duration: 140 }), 120);
  }
  scheduleBlink() {
    clearTimeout(this._bt);
    this._bt = setTimeout(() => {
      if (!this.el.isConnected) { faces.delete(this); return; }
      if (this.state !== 'happy') this.blink(Math.random() < .22);
      if (this.state === 'idle' && Math.random() < .12) this.pulse('smug', 1400);
      this.scheduleBlink();
    }, 2600 + Math.random() * 3600);
  }
  loop(t) {
    if (!this.el.isConnected) { faces.delete(this); clearTimeout(this._bt); return; }
    const r = this.el.getBoundingClientRect();
    if (this.state === 'think') { this.tx = 22; this.ty = -22; }
    else if (this.follow && pointer && t - pointer.t < 4000 && r.width) {
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = pointer.x - cx, dy = pointer.y - cy, d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 400);
      this.tx = dx / d * 30 * k; this.ty = dy / d * 22 * k;
    } else {
      if (t > this.idleLook.until) {
        this.idleLook = Math.random() < .55 ? { x: 0, y: 0, until: t + 2000 + Math.random() * 3000 } : { x: (Math.random() - .5) * 46, y: (Math.random() - .5) * 20, until: t + 900 + Math.random() * 1500 };
      }
      this.tx = this.idleLook.x; this.ty = this.idleLook.y;
    }
    this.lx += (this.tx - this.lx) * .12; this.ly += (this.ty - this.ly) * .12;
    this.look.setAttribute('transform', `translate(${this.lx.toFixed(1)} ${this.ly.toFixed(1)})`);
    this.hair.setAttribute('transform', `translate(${(this.lx * .25).toFixed(1)} ${(this.ly * .15).toFixed(1)})`);
    requestAnimationFrame(this.loop);
  }
}

const css = `
.face svg .fz-head { fill: #f5f5f5; stroke: var(--fz-line, #0a0a0a); stroke-width: 15; }
:root[data-theme="dark"] .face svg .fz-head { stroke: none; }
.face svg .fz-eye { fill: #0a0a0a; transition: opacity .2s; }
.face svg .fz-eyes { transform-box: fill-box; transform-origin: center; }
.face svg .fz-brow { fill: none; stroke: #0a0a0a; stroke-width: 16; stroke-linecap: round; opacity: 0; transition: opacity .25s, transform .3s cubic-bezier(.16,1,.3,1); transform-box: fill-box; transform-origin: center; }
.face svg .fz-happy { fill: none; stroke: #0a0a0a; stroke-width: 22; stroke-linecap: round; opacity: 0; transition: opacity .2s; }
.face svg .fz-mouth { fill: none; stroke: #0a0a0a; stroke-width: 15; stroke-linecap: round; transition: opacity .2s; opacity: 0; }
.face svg .m-happy { fill: #0a0a0a; stroke-linejoin: round; }
.face svg .m-idle { opacity: 1; }
.face svg .fz-talk { fill: #0a0a0a; opacity: 0; transform-box: fill-box; transform-origin: center; }
.face svg .fz-cheek { fill: #0a0a0a; opacity: 0; transition: opacity .3s; }
.face svg .fz-dots circle { fill: var(--ink); opacity: 0; }
.face svg .fz-body { transform-box: fill-box; transform-origin: 50% 90%; }
.face[data-state="happy"] svg .fz-eye { opacity: 0; }
.face[data-state="happy"] svg .fz-happy { opacity: 1; }
.face[data-state="happy"] svg .fz-cheek { opacity: .2; }
.face[data-state="happy"] svg .m-idle, .face[data-state="sad"] svg .m-idle, .face[data-state="think"] svg .m-idle, .face[data-state="talk"] svg .m-idle { opacity: 0; }
.face[data-state="happy"] svg .m-happy, .face[data-state="sad"] svg .m-sad, .face[data-state="think"] svg .m-think { opacity: 1; }
.face[data-state="sad"] svg .fz-brow { opacity: 1; }
.face[data-state="sad"] svg .fz-brow.l { transform: rotate(-12deg) translateY(8px); }
.face[data-state="sad"] svg .fz-brow.r { transform: rotate(12deg) translateY(8px); }
.face[data-state="smug"] svg .fz-brow.r { opacity: 1; transform: translateY(-12px) rotate(-8deg); }
.face[data-state="think"] svg .fz-brow.r { opacity: 1; transform: translateY(-8px); }
.face[data-state="think"] svg .fz-dots circle { animation: fzdot 1.2s infinite; }
.face[data-state="think"] svg .fz-dots circle:nth-child(2) { animation-delay: .2s; }
.face[data-state="think"] svg .fz-dots circle:nth-child(3) { animation-delay: .4s; }
.face[data-state="talk"] svg .fz-talk { opacity: 1; animation: fztalk .32s ease-in-out infinite alternate; }
@keyframes fzdot { 0%, 100% { opacity: .15; } 50% { opacity: 1; } }
@keyframes fztalk { from { transform: scaleY(.35); } to { transform: scaleY(1.15); } }
`;
const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
