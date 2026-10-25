// Podcast-Studio: Lisa und Max sitzen sich gegenüber. Wer spricht, leuchtet auf und bewegt den Mund im Takt der echten Stimme,
// der andere schaut zu ihm. Dazwischen eine Live-Wellenform, darunter der aktuelle Satz groß als Untertitel.
// Steuerung: Satz zurück/vor, Abspielen, Tempo; Fortschritt als Satz-Segmente (Farbe = Sprecher). Leertaste/Pfeiltasten, Sperrbildschirm.
import { h, ico } from '../util.js';
import { L } from '../i18n.js';
import { face } from '../face.js';
const fixT = t => String(t || '').replace(/\bLisas\b/g, 'Maries').replace(/\bLisa\b/g, 'Marie');

const PREV = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14"/><path d="M18 5.5v13L9 12z"/></svg>';
const NEXT = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14"/><path d="M6 5.5v13L15 12z"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z" fill="currentColor"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.3" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.3" fill="currentColor"/></svg>';

export function studio(p, api) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = p.lines.map(l => Math.max(3, l.t.split(/\s+/).length));
  const total = words.reduce((a, b) => a + b, 0);

  const lisaAv = h('div', { class: 'pst-av pst-marie' });
  const lf = face(lisaAv, { follow: false, who: 'marie' });
  const maxAv = h('div', { class: 'pst-av pst-max' });
  const mf = face(maxAv, { follow: false });
  const seatL = h('div', { class: 'pst-seat' }, h('div', { class: 'pst-ring' }, lisaAv), h('b', {}, 'Marie'), h('small', {}, L('erklärt', 'explains')));
  const seatM = h('div', { class: 'pst-seat' }, h('div', { class: 'pst-ring' }, maxAv), h('b', {}, 'Max'), h('small', {}, L('fragt nach', 'asks')));
  const cv = h('canvas', { class: 'pst-viz', width: 360, height: 90, 'aria-hidden': 'true' });
  const who = h('b', { class: 'pst-who' });
  const txt = h('p', { class: 'pst-txt' });
  const cap = h('div', { class: 'pst-cap', 'aria-live': 'polite' }, who, txt);
  const playB = h('button', { class: 'pst-play', type: 'button', 'aria-label': L('Abspielen', 'Play'), html: PLAY, onclick: () => api.toggle() });
  const prevB = h('button', { class: 'pst-b', type: 'button', 'aria-label': L('Satz zurück', 'Previous line'), title: L('Satz zurück (←)', 'Previous line (←)'), html: PREV, onclick: () => api.seek(api.idx() - 1) });
  const nextB = h('button', { class: 'pst-b', type: 'button', 'aria-label': L('Nächster Satz', 'Next line'), title: L('Nächster Satz (→)', 'Next line (→)'), html: NEXT, onclick: () => api.seek(api.idx() + 1) });
  const RATES = [1, 1.25, 1.5, 0.9];
  const rateB = h('button', { class: 'pst-rate', type: 'button', title: L('Tempo', 'Speed'), onclick: () => { const i = (RATES.indexOf(api.rate()) + 1) % RATES.length; api.setRate(RATES[i]); sync(); } });
  const time = h('span', { class: 'pst-time' });
  const segs = p.lines.map((l, k) => h('i', { class: 'pst-seg ' + (l.s === 'Max' ? 'm' : 'l'), style: { flexGrow: words[k] }, title: `${l.s === 'Max' ? 'Max' : 'Marie'}: ${fixT(l.t).slice(0, 60)}`, onclick: () => api.seek(k) }));
  const prog = h('div', { class: 'pst-prog', role: 'slider', 'aria-label': L('Fortschritt', 'Progress'), tabindex: 0 }, segs);
  const el = h('section', { class: 'pst' + (reduce ? ' still' : '') },
    h('div', { class: 'pst-top' }, h('span', { class: 'pst-ey' }, h('span', { class: 'pst-live' }), L('BWL Max · Podcast', 'BWL Max · Podcast')), h('h3', {}, p.title)),
    h('div', { class: 'pst-seats' }, seatL, cv, seatM),
    cap,
    prog,
    h('div', { class: 'pst-ctl' }, rateB, prevB, playB, nextB, time));

  // ---- Pegel: echte Stimme über WebAudio, Browser-Stimme simuliert ----
  let ac = null, an = null, buf = null, raf = 0, lvl = 0, phase = 0;
  const hook = audio => {
    if (an || !audio || !(window.AudioContext || window.webkitAudioContext)) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); const src = ac.createMediaElementSource(audio); an = ac.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .72; src.connect(an); an.connect(ac.destination); buf = new Uint8Array(an.frequencyBinCount); } catch (e) { an = null; }
  };
  const g = cv.getContext('2d');
  const BARS = 36;
  const draw = () => {
    raf = requestAnimationFrame(draw);
    const playing = api.playing();
    let target = 0;
    if (playing && an && api.real()) { an.getByteFrequencyData(buf); let s = 0; for (let i = 2; i < 48; i++) s += buf[i]; target = Math.min(1, s / (46 * 170)); }
    else if (playing) { phase += .18; target = .35 + .3 * Math.abs(Math.sin(phase)) * Math.abs(Math.sin(phase * .37 + 1)); }
    lvl += (target - lvl) * .35;
    const W = cv.width, H = cv.height, bw = W / BARS;
    g.clearRect(0, 0, W, H);
    const spk = (p.lines[api.idx()] || {}).s;
    g.fillStyle = spk === 'Max' ? 'rgba(242,196,107,.95)' : 'rgba(156,190,255,.95)';
    for (let i = 0; i < BARS; i++) {
      const c = Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2);
      let v = an && playing && api.real() ? (buf[3 + Math.round((1 - c) * 40)] || 0) / 255 : lvl * (0.5 + 0.5 * Math.sin(phase * 1.3 + i * .55));
      v = Math.max(.06, Math.min(1, v * (1.15 - c * .55)));
      const bh = Math.max(4, v * H * .9);
      const x = i * bw + bw * .22, y = (H - bh) / 2;
      g.globalAlpha = playing ? .55 + .45 * (1 - c) : .25;
      g.beginPath(); g.roundRect ? g.roundRect(x, y, bw * .56, bh, 3) : g.rect(x, y, bw * .56, bh); g.fill();
    }
    g.globalAlpha = 1;
    // Münder im Takt
    const open = playing ? Math.max(.25, Math.min(1.25, .3 + lvl * 1.4)) : 0;
    const m = maxAv.querySelector('.fz-talk'); if (m) m.style.transform = spk === 'Max' && playing ? `scaleY(${open})` : '';
    const lm = lisaAv.querySelector('.fz-talk'); if (lm) lm.style.transform = spk !== 'Max' && playing ? `scaleY(${open})` : '';
    el.style.setProperty('--lvl', playing ? lvl.toFixed(3) : 0);
  };

  let lastSpk = '', lastIdx = -1;
  function sync() {
    const i = api.idx(), l = p.lines[i] || p.lines[0], playing = api.playing();
    const spk = l.s === 'Max' ? 'Max' : 'Lisa';
    el.classList.toggle('on', playing);
    el.dataset.spk = playing || i > 0 ? spk : '';
    playB.innerHTML = playing ? PAUSE : PLAY; playB.setAttribute('aria-label', playing ? L('Pause', 'Pause') : L('Abspielen', 'Play'));
    rateB.textContent = String(api.rate()).replace('.', L(',', '.')) + '×';
    segs.forEach((s, k) => { s.classList.toggle('done', k < i); s.classList.toggle('now', k === i && (playing || i > 0)); });
    const doneW = words.slice(0, i).reduce((a, b) => a + b, 0);
    const left = Math.max(0, Math.round((total - doneW) / 150 * 60 / api.rate()));
    time.textContent = L(`Satz ${i + 1}/${p.lines.length} · noch ${left >= 60 ? Math.round(left / 60) + ' Min.' : left + ' s'}`, `Line ${i + 1}/${p.lines.length} · ${left >= 60 ? Math.round(left / 60) + ' min' : left + ' s'} left`);
    if (i !== lastIdx) {
      lastIdx = i; who.textContent = spk === 'Max' ? 'Max' : 'Marie'; txt.textContent = fixT(l.t);
      if (!reduce) cap.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    // Max: spricht → Mund; hört zu → schaut zu Lisa
    if (playing && spk === 'Max') { mf.set('talk'); maxAv.classList.add('drive'); lf.set('idle'); lisaAv.classList.remove('drive'); lf.lookAt(40, 4, 1400); }
    else if (playing) { lf.set('talk'); lisaAv.classList.add('drive'); mf.set('idle'); maxAv.classList.remove('drive'); mf.lookAt(-40, 4, 1400); }
    else { mf.set('idle'); lf.set('idle'); maxAv.classList.remove('drive'); lisaAv.classList.remove('drive'); }
    if (spk !== lastSpk && playing && !reduce) { const a = spk === 'Max' ? maxAv : lisaAv; a.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' }); }
    lastSpk = playing ? spk : '';
    if ('mediaSession' in navigator) { try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (e) {} }
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: p.title, artist: 'BWL Max · Marie & Max', album: 'BWL Max Podcast', artwork: [{ src: '/tutor/img/max-fav-512.png', sizes: '512x512', type: 'image/png' }] });
      navigator.mediaSession.setActionHandler('play', () => { if (!api.playing()) api.toggle(); });
      navigator.mediaSession.setActionHandler('pause', () => { if (api.playing()) api.toggle(); });
      navigator.mediaSession.setActionHandler('previoustrack', () => api.seek(api.idx() - 1));
      navigator.mediaSession.setActionHandler('nexttrack', () => api.seek(api.idx() + 1));
    } catch (e) {}
  }
  const onKey = e => {
    if (!el.isConnected) { removeEventListener('keydown', onKey); return; }
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); api.toggle(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); api.seek(api.idx() + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); api.seek(api.idx() - 1); }
  };
  addEventListener('keydown', onKey);
  prog.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') e.stopPropagation(); });
  const stopLoop = setInterval(() => { if (!el.isConnected) { cancelAnimationFrame(raf); clearInterval(stopLoop); try { ac && ac.close(); } catch (e) {} removeEventListener('keydown', onKey); } }, 1500);
  // Canvas scharf auf Retina
  requestAnimationFrame(() => { const r = cv.getBoundingClientRect(); if (r.width) { const d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); } });
  draw();
  return { el, sync, hook, resume: () => { try { ac && ac.state === 'suspended' && ac.resume(); } catch (e) {} } };
}
