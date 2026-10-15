// Lebendige Welle: hört dein Mikro (echte Lautstärke) oder zeigt, dass Max spricht.
import { h } from './util.js';

export function liveWave(n = 26) {
  const bars = Array.from({ length: n }, () => h('i'));
  const el = h('div', { class: 'lwave', 'aria-hidden': 'true' }, ...bars);
  let raf = 0, src = null;
  const setBars = arr => { for (let i = 0; i < n; i++) bars[i].style.transform = `scaleY(${arr[i].toFixed(3)})`; };
  function stop() {
    cancelAnimationFrame(raf); raf = 0;
    if (src) { try { src.disconnect(); } catch (e) {} src = null; }
    setBars(bars.map(() => .12)); el.dataset.mode = '';
  }
  // Mikro: echte Frequenzen deiner Stimme, gespiegelt von der Mitte aus
  function mic(actx, stream) {
    stop();
    if (!actx || !stream) return;
    try { actx.resume?.(); } catch (e) {}
    try {
      src = actx.createMediaStreamSource(stream);
      const an = actx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .55; src.connect(an);
      const d = new Uint8Array(an.frequencyBinCount), half = Math.ceil(n / 2);
      el.dataset.mode = 'mic';
      const tick = () => {
        an.getByteFrequencyData(d);
        const v = [];
        for (let i = 0; i < half; i++) { const k = 1 + Math.floor(i * 20 / half); v.push(Math.min(1, .1 + Math.pow(d[k] / 255, 1.4) * 1.5)); }
        setBars([...v.slice().reverse(), ...v].slice(n % 2 ? 1 : 0));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch (e) { fake(.5); el.dataset.mode = 'mic'; }
  }
  // Max spricht: Silben-Rhythmus, in der Mitte am stärksten
  function fake(amp = 1) {
    const ph = bars.map(() => Math.random() * 6.283), t0 = performance.now(), mid = (n - 1) / 2;
    const tick = t => {
      const s = (t - t0) / 1000;
      const env = .35 + .65 * Math.abs(Math.sin(s * 4.7) * Math.sin(s * 1.9 + 1.3));
      setBars(bars.map((_, i) => { const c = 1 - Math.abs(i - mid) / mid * .5; return Math.max(.1, Math.min(1, (.22 + .78 * Math.abs(Math.sin(s * 8 + ph[i]))) * env * c * amp)); }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function talk() { stop(); el.dataset.mode = 'talk'; fake(1); }
  stop();
  return { el, mic, talk, stop };
}
