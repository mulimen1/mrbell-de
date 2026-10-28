// Rückmeldung bei jeder Berührung (Testdesign, nur mit data-nv = Bens Konto): Klick-Welle, Funken bei richtigen
// Antworten, Wackeln bei falschen, kleiner Erfolgsmoment beim Ablegen einer Datei. Dezent, kurz, nie im Weg.
const H = document.documentElement;
const on = () => !!H.dataset.nv && !matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAP = '.btn, .ai-talk, .tn, .tc-btn, .rm-tc, .rm-tlt, .rm-tile, .ln-tile, .tr-card, .chip, .rm-tdb, .rm-mat, .rm-tdrop, .vt-btn, .vt-more, .m-mc-o, .opts > button, .side-new, .iconbtn';
const buzz = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} };

function layer() {
  let l = document.getElementById('fx-layer');
  if (!l) { l = document.createElement('div'); l.id = 'fx-layer'; l.setAttribute('aria-hidden', 'true'); document.body.appendChild(l); }
  return l;
}
// Welle an der Klickstelle
function ripple(x, y, big) {
  const r = document.createElement('i'); r.className = 'fx-rip' + (big ? ' big' : '');
  r.style.left = x + 'px'; r.style.top = y + 'px';
  layer().appendChild(r); setTimeout(() => r.remove(), 700);
}
// Funken: ein paar Punkte fliegen sternförmig raus
function burst(x, y, { n = 10, colors, dist = 46 } = {}) {
  const l = layer();
  if (!colors) { const cs = getComputedStyle(H); colors = [cs.getPropertyValue('--nb').trim() || '#2a7fe8', cs.getPropertyValue('--nb3').trim() || '#5fb4ff', '#8fd0ff', '#21b46b']; }
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.className = 'fx-sp';
    const a = (Math.PI * 2 * i) / n + Math.random() * .5, d = dist * (.65 + Math.random() * .6);
    p.style.left = x + 'px'; p.style.top = y + 'px';
    p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px');
    p.style.background = colors[i % colors.length];
    l.appendChild(p); setTimeout(() => p.remove(), 800);
  }
}
const mid = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
const pulse = (el, cls, ms) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); };

addEventListener('pointerdown', e => {
  if (!on() || e.button > 0) return;
  const t = e.target.closest && e.target.closest(TAP);
  if (!t || t.disabled) return;
  ripple(e.clientX, e.clientY, t.matches('.btn.primary, .ai-talk, .tn-tutor, .tc-btn, .side-new'));
}, { passive: true, capture: true });

// Richtig/falsch in Quiz und Mini-Check: auf die Klassen hören, die die Auswertung setzt
const RIGHT = el => el.matches('.opts > .right, .tf .right') || (el.matches('.m-mc-o.ok') && !!el.closest('.open'));
const WRONG = el => el.matches('.opts > .wrong, .tf .wrong, .m-mc-o.no');
let burstBudget = 0;
new MutationObserver(ms => {
  if (!on()) return;
  const now = Date.now();
  for (const m of ms) {
    const el = m.target; if (!(el instanceof HTMLElement) || el.tagName !== 'BUTTON') continue;
    const old = ' ' + (m.oldValue || '') + ' ';
    if (RIGHT(el) && !/ (right|ok) /.test(old)) {
      pulse(el, 'fx-pop', 600);
      if (now > burstBudget) { const [x, y] = mid(el); burst(x, y); burstBudget = now + 120; buzz(14); }
    } else if (WRONG(el) && !/ (wrong|no) /.test(old)) { pulse(el, 'fx-shake', 500); buzz([20, 40, 20]); }
    else if (el.classList.contains('chip') && el.classList.contains('on') && !/ on /.test(old)) pulse(el, 'fx-pop', 450);
  }
}).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });

// Datei abgelegt: kleiner Funkenregen an der Stelle
addEventListener('drop', e => {
  if (!on() || !e.dataTransfer || !(e.dataTransfer.files && e.dataTransfer.files.length || [...(e.dataTransfer.types || [])].includes('text/x-bwlmax-doc'))) return;
  burst(e.clientX, e.clientY, { n: 14, dist: 64 }); ripple(e.clientX, e.clientY, true); buzz(18);
}, true);

// Test (nur Bens Konto, data-ben): Punkte-Hintergrund mit Tiefe – Lichtkegel folgt der Maus, Punkte darin blau und
// leicht größer, zwei Ebenen verschieben sich minimal gegeneinander (Parallaxe). Ruhig, nichts blinkt.
if (H.dataset.ben && H.dataset.nv && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const mk = c => { const d = document.createElement('div'); d.className = c; d.setAttribute('aria-hidden', 'true'); return d; };
  const bg = mk('bg3d'); bg.append(mk('bg3d-far'), mk('bg3d-near'), mk('bg3d-glow'));
  const put = () => { if (!document.body) return setTimeout(put, 50); document.body.prepend(bg); };
  put();
  let tx = innerWidth / 2, ty = innerHeight * .3, x = tx, y = ty, raf = 0;
  const tick = () => { x += (tx - x) * .08; y += (ty - y) * .08;
    const nx = x / innerWidth - .5, ny = y / innerHeight - .5;
    bg.style.setProperty('--mx', x + 'px'); bg.style.setProperty('--my', y + 'px');
    bg.style.setProperty('--px', (nx * -10) + 'px'); bg.style.setProperty('--py', (ny * -10) + 'px');
    raf = Math.abs(tx - x) + Math.abs(ty - y) > .5 ? requestAnimationFrame(tick) : 0; };
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  tick();
}


// Punkte laufen sichtbar unter der Tafel weiter: Raster so verschieben, dass eine Punktreihe genau an der
// linken Tafelkante liegt (nur waagerecht, damit beim Scrollen nichts springt) – die Tafel schneidet sie an, statt dass die Punkte vorher „aufhören“.
if (H.dataset.nv) {
  let last = '';
  const align = () => {
    const main = document.querySelector('.app > .main');
    const bd = document.querySelector('.ai-board');
    let v = '';
    if (main && bd && bd.getClientRects().length) {
      const r = bd.getBoundingClientRect(), m = main.getBoundingClientRect();
      const ox = (((r.left - m.left - 11) % 22) + 22) % 22;
      v = ox.toFixed(1) + 'px 0px';
    }
    if (v !== last) { last = v; if (main) { if (v) main.style.setProperty('--dotpos', v); else main.style.removeProperty('--dotpos'); } }
  };
  addEventListener('resize', align, { passive: true });
  setInterval(align, 700);
}

// Lesbarkeit: Text, der direkt auf dem Punkte-Hintergrund steht (keine Karte dahinter), bekommt eine weiche Fläche in
// Hintergrundfarbe – die Punkte verschwinden an dieser Stelle. Gilt automatisch für jede Seite (App, Startseite, Anzeigen).
if (H.dataset.nv) {
  const TXT = 'p, h1, h2, h3, h4, .eyebrow, small, li, label, span.lead, blockquote, figcaption, .vh > div > div, .lead, .sub, .mq-l';
  const opaque = el => { const c = getComputedStyle(el); return (c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent') || c.backgroundImage !== 'none'; };
  const isDots = el => el === document.body || el === H || /radial-gradient/.test(getComputedStyle(el).backgroundImage) && getComputedStyle(el).backgroundSize.includes('22px');
  const scan = () => {
    document.querySelectorAll(TXT).forEach(el => {
      if (el.classList.contains('on-dots') || el.dataset.dk === '1' || !el.textContent.trim() || !el.getClientRects().length) return;
      if (el.closest('.on-dots') && el.closest('.on-dots') !== el) { el.dataset.dk = '1'; return; }
      let e = el;
      while (e && e !== H) { if (opaque(e) && e !== el) break; if (e === el && opaque(e)) break; e = e.parentElement; }
      if (!e || e === H || (e !== el && isDots(e))) { el.classList.add('on-dots'); if (getComputedStyle(el).textAlign === 'center') el.classList.add('odc'); } else el.dataset.dk = '1';
    });
  };
  let t = 0; const later = () => { clearTimeout(t); t = setTimeout(scan, 250); };
  new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', later); addEventListener('load', later); later();
}

// Farbige Icons überall: jedes Icon-Kästchen (Span/Div mit genau einem Icon, eigener Hintergrund, 24–80 px) bekommt
// data-icc=<Icon-Name>; app.css färbt es nach Bedeutung (Quiz lila, Karteikarten türkis, Klausurplan orange …).
if (H.dataset.nv) {
  const opaqueBg = c => (c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent') || c.backgroundImage !== 'none';
  const tag = () => {
    document.querySelectorAll('svg.ico').forEach(svg => {
      const box = svg.parentElement; if (!box || box.dataset.icc !== undefined || box.dataset.icn === '1') return;
      if (!/^(SPAN|DIV|I)$/.test(box.tagName) || box.children.length !== 1 || box.textContent.trim()) { box.dataset.icn = '1'; return; }
      if (box.closest('.cfg-ri, .srk-ic, .srk-go, .made-ok, .made-open, .sn-i, .me-upzi, .me-upi, .side-ib, .ub-leci, .ub-lecg, .me-bico, .me-sym, .me-fprev, .rm-tkic, .ks-pic, .ks-di, .ks-ic, .ub-ti, .tn-tutor, .ai-talk, .lm-cta, .lm-tutor, .btn, .kt-start, .kt-go, .kt-sec, .rm-acc, .topbar .iconbtn, .side-col, .side-tog')) { box.dataset.icn = '1'; return; }
      const r = box.getBoundingClientRect(); if (!r.width) return;
      const c = getComputedStyle(box);
      if (r.width < 24 || r.width > 80 || !opaqueBg(c)) { box.dataset.icn = '1'; return; }
      const n = [...svg.classList].find(k => k.startsWith('i-')); const nm = n ? n.slice(2) : '';
      if (/^(right|left|up|down|x|plus|menu|send|check)$/.test(nm) || box.closest('[class*="chev"], [class*="-go"]')) { box.dataset.icn = '1'; return; }
      box.dataset.icc = nm;
    });
  };
  let t2 = 0; const later2 = () => { clearTimeout(t2); t2 = setTimeout(tag, 300); };
  new MutationObserver(later2).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', later2); later2();
}

// Popups ohne X: Klick daneben schließt (bei Fenstern mit Hintergrund macht das der Hintergrund selbst)
document.addEventListener('pointerdown', e => {
  document.querySelectorAll('.kg-x, .cb-x, .hn-x, .mt2x, .dkp-x').forEach(x => {
    const box = x.parentElement; if (box && !box.contains(e.target)) setTimeout(() => x.click(), 0);
  });
}, true);

// Seitenleiste: beim Drüberfahren füllt sich ein Eintrag mit der Farbe seines Icons (nur solange die Maus drauf ist)
document.addEventListener('pointerover', e => {
  const t = e.target.closest && e.target.closest('.side a, .side button, .side .side-row, .ub-ltc');
  if (!t || t.dataset.hf) return;
  const ic = t.querySelector('[data-icc]:not([data-icc=""])'); if (!ic || ic === t) return;
  const cs = getComputedStyle(ic), a = cs.getPropertyValue('--ic1').trim(), b = cs.getPropertyValue('--ic2').trim();
  if (!a || !b) return;
  t.dataset.hf = '1'; t.style.setProperty('--hf1', a); t.style.setProperty('--hf2', b);
}, { passive: true });
