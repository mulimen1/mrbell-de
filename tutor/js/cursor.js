// Max-Cursor: Max zeigt dir Dinge direkt auf der Seite. Pfeil mit Namensschild „Max“, daran hängt eine Erklärblase.
// Er gleitet von Stelle zu Stelle, hebt sie hervor und sagt, warum das so ist. Pause, Weiter, Stopp – und jederzeit fragen.
import { h, ico } from './util.js';
import { L } from './i18n.js';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const PTR = '<svg class="mx-ptr" viewBox="0 0 24 26" aria-hidden="true"><path d="M3 2.5 20.5 12.2 12.6 13.9 9.2 21.4z"/></svg>';
let active = null;
export const tourActive = () => !!active;
export function stopTour() { if (active) active.stop(); }
export function pauseTour() { if (active) active.pause(); }

// steps: [{ el, say }] – el darf null sein (dann zeigt Max oben in die Mitte des Inhalts)
export function tour(steps, { onAsk, onEnd, startAt, label = 'Max' } = {}) {
  steps = (steps || []).filter(s => s && s.say);
  if (!steps.length) return null;
  if (active) active.stop(true);
  const txt = h('div', { class: 'mx-txt' });
  const num = h('span', { class: 'mx-n' });
  const bPause = h('button', { type: 'button', class: 'mx-b mx-pp', 'aria-label': L('Pause', 'Pause'), title: L('Pause (Leertaste)', 'Pause (space)') });
  const bNext = h('button', { type: 'button', class: 'mx-b', 'aria-label': L('Weiter', 'Next'), title: L('Weiter (→)', 'Next (→)'), html: ico('right') });
  const bStop = h('button', { type: 'button', class: 'mx-b', 'aria-label': L('Stopp', 'Stop'), title: L('Stopp (Esc)', 'Stop (Esc)'), html: ico('x') });
  const bAsk = onAsk ? h('button', { type: 'button', class: 'mx-ask' }, h('span', { html: ico('chat') }), L('Frage', 'Ask')) : null;
  const say = h('div', { class: 'mx-say' }, txt, h('div', { class: 'mx-ctl' }, num, h('span', { style: { flex: 1 } }), bAsk, bPause, bNext, bStop));
  const cur = h('div', { class: 'mx-cur', role: 'status', 'aria-live': 'polite' }, h('span', { class: 'mx-p', html: PTR }), h('span', { class: 'mx-tag' }, label), say);
  document.body.appendChild(cur);
  document.documentElement.classList.add('mx-touring');
  let i = -1, paused = false, dead = false, hold = 0, typed = 0, typing = 0, hl = null;
  // Position: weich hinterher (folgt auch, wenn gescrollt wird)
  const start = startAt || { x: innerWidth - 90, y: innerHeight - 110 };
  let x = start.x, y = start.y, tx = x, ty = y, raf = 0;
  const target = () => {
    const s = steps[i]; if (!s) return;
    if (!s.el || !s.el.isConnected) { const v = document.getElementById('view') || document.body, r = v.getBoundingClientRect(); tx = r.left + r.width / 2 - 40; ty = Math.max(r.top + 70, 90); return; }
    const r = s.el.getBoundingClientRect();
    tx = r.left + Math.min(Math.max(r.width * .12, 10), 46); ty = r.top + Math.min(Math.max(r.height * .5, 8), 26);
  };
  const place = () => {
    target();
    if (reduce()) { x = tx; y = ty; } else { x += (tx - x) * .16; y += (ty - y) * .16; }
    cur.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    // Blase: rechts unten vom Cursor, am Rand gespiegelt
    const sw = say.offsetWidth || 300, sh = say.offsetHeight || 90;
    // waagerecht immer ganz im Bild: notfalls nach links geschoben (Handy)
    let lx = 18; if (x + lx + sw > innerWidth - 10) lx = Math.max(10 - x, innerWidth - 10 - sw - x);
    say.style.left = lx.toFixed(0) + 'px';
    cur.classList.toggle('flip-x', lx < 0);
    cur.classList.toggle('flip-y', y + 46 + sh > innerHeight - 10);
    if (!dead) raf = requestAnimationFrame(place);
  };
  const setHL = el => { if (hl) hl.classList.remove('mx-hl'); hl = el || null; if (hl) hl.classList.add('mx-hl'); };
  const typeOut = text => {
    clearInterval(typing); txt.textContent = ''; typed = 0;
    if (reduce()) { txt.textContent = text; return Promise.resolve(); }
    return new Promise(res => { typing = setInterval(() => { if (paused) return; typed = Math.min(text.length, typed + 2); txt.textContent = text.slice(0, typed); if (typed >= text.length) { clearInterval(typing); res(); } }, 22); });
  };
  const drawCtl = () => { bPause.innerHTML = ico(paused ? 'play' : 'pause'); bPause.setAttribute('aria-label', paused ? L('Weiter abspielen', 'Resume') : L('Pause', 'Pause')); num.textContent = `${i + 1} / ${steps.length}`; cur.classList.toggle('paused', paused); };
  async function go(n) {
    clearTimeout(hold);
    if (n >= steps.length) return finish();
    i = n; drawCtl();
    const s = steps[i];
    if (s.el && s.el.isConnected) {
      const r = s.el.getBoundingClientRect();
      const out = r.top < 70 || r.bottom > innerHeight - 140;
      if (out) { s.el.scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' }); await new Promise(r2 => setTimeout(r2, 420)); }
    }
    if (dead || i !== n) return;
    setHL(s.el);
    say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
    await typeOut(s.say);
    if (dead || i !== n) return;
    schedule();
  }
  const readMs = () => Math.max(2600, (steps[i]?.say || '').split(/\s+/).length * 330 + 900);
  function schedule() { clearTimeout(hold); if (!paused) hold = setTimeout(() => go(i + 1), readMs()); }
  function finish() {
    setHL(null); clearTimeout(hold);
    txt.textContent = L('Das war’s. Frag mich, wenn was hakt.', 'That’s it. Ask me if anything’s unclear.');
    num.textContent = ''; cur.classList.add('done');
    hold = setTimeout(() => stop(), 3400);
  }
  function pause() { if (dead) return; paused = true; clearTimeout(hold); drawCtl(); }
  function resume() { if (dead) return; paused = false; drawCtl(); if (typed >= (steps[i]?.say || '').length) schedule(); }
  function stop(quick) {
    if (dead) return; dead = true;
    cancelAnimationFrame(raf); clearTimeout(hold); clearInterval(typing); setHL(null);
    removeEventListener('keydown', onKey, true);
    if (active === ctl) { active = null; document.documentElement.classList.remove('mx-touring'); }
    if (quick || reduce()) cur.remove(); else { cur.classList.add('out'); setTimeout(() => cur.remove(), 380); }
    onEnd && onEnd();
  }
  const onKey = e => {
    const a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); stop(); }
    else if (e.key === ' ') { e.preventDefault(); paused ? resume() : pause(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, i - 1)); }
  };
  addEventListener('keydown', onKey, true);
  bPause.onclick = () => (paused ? resume() : pause());
  bNext.onclick = () => go(i + 1);
  bStop.onclick = () => stop();
  if (bAsk) bAsk.onclick = () => { pause(); onAsk(); };
  const ctl = { pause, resume, stop, next: () => go(i + 1), el: cur };
  active = ctl;
  cur.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(() => cur.classList.add('in'));
  raf = requestAnimationFrame(place);
  go(0);
  return ctl;
}

// Tafel: jeder Block mit data-say wird ein Schritt
export function boardSteps(t) {
  if (!t) return [];
  const els = [...t.querySelectorAll('[data-say]')].filter(el => !el.parentElement.closest('[data-say]'));
  return els.map(el => ({ el, say: String(el.getAttribute('data-say') || '').trim().slice(0, 240) })).filter(s => s.say);
}

// Seite: sichtbare, sinnvolle Stellen bekommen eine Kennung, Max bekommt eine kurze Liste davon
export function pageMap(max = 70) {
  const view = document.getElementById('view'); if (!view) return { text: '', count: 0 };
  view.querySelectorAll('[data-mxid]').forEach(el => el.removeAttribute('data-mxid'));
  const sel = 'h1,h2,h3,h4,label,a[href],button,input,select,textarea,[role=tab],.tab,th,td,li,p,.calc,.result,.step,.kpi,.chip,a.btn,svg text,.tafel > *,summary,.rc-card,.tr-card';
  const vr = view.getBoundingClientRect();
  const seen = new Set(), out = [];
  let n = 0;
  const label = el => {
    const t = el.tagName.toLowerCase();
    if (t === 'input' && el.type === 'range') { const lab = el.closest('label')?.innerText || el.getAttribute('aria-label') || el.parentElement?.innerText || ''; return ['Regler', (lab.replace(/\s+/g, ' ').trim() + ' = ' + el.value).slice(0, 90)]; }
    if (t === 'input' || t === 'textarea' || t === 'select') return ['Feld', ((el.getAttribute('aria-label') || el.placeholder || el.closest('label')?.innerText || '') + (el.value ? ' = ' + el.value : '')).replace(/\s+/g, ' ').trim().slice(0, 90)];
    if (t === 'a' && !el.classList.contains('btn')) return ['Karte', (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 110)];
    if (t === 'button' || el.classList.contains('btn')) return ['Knopf', (el.innerText || el.getAttribute('aria-label') || el.title || '').replace(/\s+/g, ' ').trim().slice(0, 70)];
    if (t === 'text') return ['Diagramm', (el.textContent || '').trim().slice(0, 50)];
    return [/^h\d$/.test(t) ? 'Überschrift' : t === 'li' ? 'Punkt' : t === 'td' || t === 'th' ? 'Tabelle' : 'Text', (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 110)];
  };
  for (const el of view.querySelectorAll(sel)) {
    if (n >= max) break;
    if (el.closest('.asst, .mx-cur, [aria-hidden="true"]')) continue;
    // Kinder einer schon markierten Karte nicht doppelt – außer Bedienelemente
    if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName) && el.parentElement && el.parentElement.closest('[data-mxid]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6 || r.bottom < vr.top - 40 || r.top > vr.bottom + 600) continue;
    const [kind, text] = label(el);
    if (!text || text.length < 2 || seen.has(kind + text)) continue;
    // keine Container, die nur Kinder wiederholen
    if (kind === 'Text' && el.querySelector('h1,h2,h3,button,input,li')) continue;
    seen.add(kind + text);
    const id = 'm' + (++n);
    el.setAttribute('data-mxid', id);
    out.push(`${id} [${kind}] ${text}`);
  }
  return { text: out.join('\n'), count: n };
}
export const byMxId = id => document.querySelector(`[data-mxid="${String(id).replace(/[^\w-]/g, '')}"]`);

const css = `
.mx-cur { position: fixed; left: 0; top: 0; z-index: 130; pointer-events: none; opacity: 0; transition: opacity .3s ease; will-change: transform; }
.mx-cur.in { opacity: 1; } .mx-cur.out { opacity: 0; transition: opacity .35s ease; }
.mx-p { position: absolute; left: -3px; top: -2px; width: 26px; height: 28px; display: block; filter: drop-shadow(0 4px 10px rgba(0,0,0,.45)); }
.mx-ptr { width: 100%; height: 100%; display: block; }
.mx-ptr path { fill: var(--inv); stroke: var(--bg); stroke-width: 1.6; stroke-linejoin: round; }
.mx-tag { position: absolute; left: 18px; top: 22px; padding: 3px 10px 4px; border-radius: 999px 999px 999px 4px; background: var(--inv); color: var(--onInv); font: 700 12px/1.2 var(--sans); letter-spacing: .01em; white-space: nowrap; box-shadow: 0 6px 18px -6px rgba(0,0,0,.5); }
.mx-say { position: absolute; left: 18px; top: 50px; width: max-content; max-width: min(340px, calc(100vw - 20px)); padding: 12px 14px 9px; border-radius: 6px 18px 18px 18px; background: var(--panel); color: var(--ink); border: 1px solid var(--line2); box-shadow: 0 24px 60px -24px rgba(0,0,0,.75), 0 0 0 1px color-mix(in srgb, var(--ink) 6%, transparent); pointer-events: auto; transform-origin: 0 0; }
.mx-say.pop { animation: mxpop .38s cubic-bezier(.3,1.4,.5,1) both; }
@keyframes mxpop { from { opacity: .3; transform: scale(.9) translateY(-4px); } }
.mx-txt { font: 500 15px/1.48 var(--sans); min-height: 1.5em; text-wrap: pretty; }
.mx-ctl { display: flex; align-items: center; gap: 2px; margin-top: 8px; padding-top: 7px; border-top: 1px solid var(--line); }
.mx-n { font: 600 11px var(--mono); color: var(--mute); }
.mx-b { width: 28px; height: 28px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--ink2); cursor: pointer; } .mx-b:hover { background: var(--panel2); color: var(--ink); } .mx-b .ico { width: 15px; height: 15px; } .mx-pp .ico { fill: currentColor; stroke: none; width: 13px; height: 13px; }
.mx-ask { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; margin-right: 4px; border-radius: 999px; border: 1px solid var(--line2); background: transparent; color: var(--ink); font: 600 12px var(--sans); cursor: pointer; } .mx-ask:hover { border-color: var(--ink); } .mx-ask .ico { width: 13px; height: 13px; }
.mx-cur.paused .mx-tag::after { content: " · Pause"; font-weight: 500; opacity: .75; }
.mx-cur.done .mx-ctl { display: none; }
.mx-cur.flip-x .mx-say { border-radius: 18px 6px 18px 18px; transform-origin: 100% 0; }
.mx-cur.flip-x .mx-tag { left: auto; right: 4px; border-radius: 999px 999px 4px 999px; }
.mx-cur.flip-y .mx-say { top: auto; bottom: 10px; }
.mx-hl { outline: 2px solid var(--ink) !important; outline-offset: 4px; box-shadow: 0 0 0 8px color-mix(in srgb, var(--ink) 9%, transparent) !important; transition: outline-offset .25s ease, box-shadow .25s ease; }
svg text.mx-hl { outline: none !important; fill: var(--ink); font-weight: 800; }
@media (prefers-reduced-motion: reduce) { .mx-say.pop { animation: none; } }
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
