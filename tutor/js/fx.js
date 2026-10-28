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

