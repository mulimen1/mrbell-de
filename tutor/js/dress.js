// Farbe gewechselt → Max zieht sich um: „Ich zieh mich kurz um“, fliegt rechts raus, kommt im neuen Pulli
// von rechts zurück und lästert über deinen Geschmack. Gilt für den Max, der gerade am größten zu sehen ist
// (Kopf unten rechts, großer Max auf der Tutor-Seite, Startseite). Ist keiner zu sehen oder „weniger Bewegung“ an: sofort umziehen.
import { setOutfit } from './face.js';
import { L } from './i18n.js';

const LINES = {
  gruen: ['Zurück zum Original. Endlich mal eine gute Entscheidung.', 'Back to the original. Finally a good decision.'],
  std: ['Schwarz. Ich seh aus wie ein Unternehmensberater um 2 Uhr nachts.', 'Black. I look like a consultant at 2 a.m.'],
  navy: ['Navy. Ich seh jetzt aus wie ein Sparkassen-Azubi. Danke dafür.', 'Navy. Now I look like a bank trainee. Thanks.'],
  kobalt: ['Kobalt? Geschmack hast du ja nicht – aber Mut, das muss man dir lassen.', 'Cobalt? No taste, but you’ve got guts.'],
  petrol: ['Petrol. Klingt nach Tankstelle, steht mir aber leider gut.', 'Teal. Sounds like a gas station, but sadly it suits me.'],
  oliv: ['Oliv. Ich seh aus wie ein BWLer beim Bund. Na gut.', 'Olive. I look like a business student in the army. Fine.'],
  cognac: ['Cognac. Fehlt nur noch der Porsche vom Papa.', 'Cognac. All that’s missing is daddy’s Porsche.'],
  bordeaux: ['Bordeaux. Sehr Investmentbanker. Ich will jetzt Bonus.', 'Burgundy. Very investment banker. I want a bonus now.'],
  aubergine: ['Aubergine. Geschmack hast du ja nicht – aber ich trag’s mit Würde.', 'Plum. No taste at all – but I wear it with dignity.'],
  graphit: ['Graphit. Grau wie dein Konto am Monatsende. Steht mir trotzdem.', 'Graphite. Grey like your bank account at month’s end. Still suits me.']
};
const OUT = [['Ich zieh mich kurz um – warte eine Sekunde.', 'Let me change real quick – one sec.'], ['Moment, ich zieh mich schnell um.', 'Hold on, quick outfit change.'], ['Sekunde – so kann ich nicht rumlaufen.', 'One sec – I can’t walk around like this.']];

const CSS = `
.mx-say { position: fixed; z-index: 2147483000; max-width: min(290px, calc(100vw - 32px)); padding: 12px 15px; border-radius: 18px; background: var(--panel, #fff); color: var(--ink, #111); border: 1px solid var(--line2, rgba(0,0,0,.12)); box-shadow: 0 18px 44px -16px rgba(0,0,0,.55); font: 600 14.5px/1.4 var(--sans, system-ui); pointer-events: none; animation: mxsayin .45s cubic-bezier(.34,1.56,.64,1) both; }
.mx-say.out { animation: mxsayout .3s ease both; }
@keyframes mxsayin { from { opacity: 0; transform: translateY(6px) scale(.85); } }
@keyframes mxsayout { to { opacity: 0; transform: translateY(4px) scale(.92); } }
.mx-out { animation: mxout .55s cubic-bezier(.55,0,.85,.25) forwards !important; pointer-events: none !important; }
.mx-in { animation: mxin .7s cubic-bezier(.2,.9,.3,1.22) both !important; pointer-events: none !important; }
.mx-gone { visibility: hidden !important; }
@keyframes mxout { 0% { translate: 0 0; rotate: 0deg; } 18% { translate: -10px 0; rotate: -6deg; } 100% { translate: var(--mxd, 100vw) -18px; rotate: 24deg; } }
@keyframes mxin { 0% { translate: var(--mxd, 100vw) -14px; rotate: -20deg; } 100% { translate: 0 0; rotate: 0deg; } }
.asst.mx-busy .asst-tip, .asst.mx-busy .asst-x, .asst.mx-busy .asst-quip { display: none !important; }
`;
const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

// Welcher Max ist gerade zu sehen? Der größte sichtbare Kopf (mind. 36 px), komplett im Bild
function target() {
  let best = null, area = 0;
  document.querySelectorAll('.face').forEach(f => {
    const el = f.closest('.asst-bub') || f;
    const r = el.getBoundingClientRect();
    if (r.width < 36 || r.height < 36 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.2) return; }
    if (r.width * r.height > area) { area = r.width * r.height; best = el; }
  });
  return best;
}

let busy = false, to = null;
function say(el, text, ms) {
  const b = document.createElement('div'); b.className = 'mx-say'; b.setAttribute('role', 'status'); b.textContent = text;
  document.body.appendChild(b);
  const r = el.getBoundingClientRect(), w = b.offsetWidth, hh = b.offsetHeight;
  if (r.left - w - 12 > 8) { b.style.left = Math.round(r.left - w - 12) + 'px'; b.style.top = Math.round(Math.min(innerHeight - hh - 8, Math.max(8, r.top + r.height / 2 - hh / 2))) + 'px'; }
  else { b.style.left = Math.round(Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2))) + 'px'; b.style.top = Math.round(r.top - hh - 12 > 64 ? r.top - hh - 12 : Math.min(innerHeight - hh - 8, r.bottom + 12)) + 'px'; }
  const off = () => { b.classList.add('out'); setTimeout(() => b.remove(), 320); };
  if (ms) setTimeout(off, ms);
  return off;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const pulse = (el, s, ms) => { try { (el.classList.contains('face') ? el : el.querySelector('.face'))?.__face?.pulse?.(s, ms); } catch (e) {} };

addEventListener('bm:accent', e => {
  const id = e.detail.id || 'std';
  if (busy) { e.preventDefault(); to = id; return; }   // läuft schon: die zuletzt gewählte Farbe wird angezogen
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
  const el = target(); if (!el) return;
  e.preventDefault(); to = id; busy = true;
  run(el).catch(() => setOutfit(to)).finally(() => { busy = false; });
});

async function run(el) {
  const H = document.documentElement, asst = el.closest('.asst');
  // Erst die Farb-Animation der Seite abwarten (die legt sonst ein Standbild über alles)
  for (let i = 0; i < 30 && H.classList.contains('theme-vt'); i++) await wait(60);
  H.classList.add('mx-dress'); asst && asst.classList.add('mx-busy');
  const [de, en] = OUT[Math.floor(Math.random() * OUT.length)];
  const off = say(el, L(de, en)); pulse(el, 'talk', 1200);
  await wait(1300);
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mxd', Math.round(innerWidth - r.left + 40) + 'px');
  el.classList.add('mx-out');
  await wait(300); off();
  await wait(300);
  el.classList.add('mx-gone');
  await wait(450);
  setOutfit(to);
  el.classList.remove('mx-out', 'mx-gone'); el.classList.add('mx-in');
  await wait(720);
  el.classList.remove('mx-in'); el.style.removeProperty('--mxd');
  H.classList.remove('mx-dress'); asst && asst.classList.remove('mx-busy');
  const q = LINES[to] || LINES.aubergine;
  say(el, L(q[0], q[1]), 5200); pulse(el, 'smug', 1800);
}
