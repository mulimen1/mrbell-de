// Max-Cursor: Max zeigt dir Dinge direkt auf der Seite. Pfeil mit Namensschild „Max“, daran hängt eine Erklärblase.
// Er gleitet von Stelle zu Stelle, hebt sie hervor und sagt, warum das so ist. Pause, Weiter, Stopp – und jederzeit fragen.
// Die Blase sucht sich selbst den Platz, an dem sie am wenigsten Text verdeckt (gemessen an den echten Textzeilen).
import { h, ico } from './util.js';
import { L } from './i18n.js';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const PTR = '<svg class="mx-ptr" viewBox="0 0 24 26" aria-hidden="true"><path d="M3 2.5 20.5 12.2 12.6 13.9 9.2 21.4z"/></svg>';
const TAG = 27;          // Höhe des „Max“-Schilds über der Blase
const M = 8;             // Abstand zum Bildschirmrand
let active = null;
export const tourActive = () => !!active;
export function stopTour() { if (active) active.stop(); }
export function pauseTour() { if (active) active.pause(); }

// ---------- Was liegt wo? Echte Textzeilen und Bedienelemente im Bild ----------
const ov = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
function contentRects(hl, scope) {
  const W = innerWidth, H = innerHeight, out = [], lines = [];
  const vis = (r, el) => {
    const x = Math.min(W - 1, Math.max(0, r.left + Math.min(r.width / 2, 12))), y = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
    const e = document.elementFromPoint(x, y);
    return !!e && (e === el || el.contains(e) || e.contains(el));
  };
  const wOf = el => (hl && hl.contains(el) ? 8 : scope && scope.contains(el) ? 1.5 : .6);
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.nodeValue.trim() && n.parentElement && !n.parentElement.closest('.mx-cur, .mx-dock, script, style, noscript, .sr') ? 1 : 3),
  });
  const rg = document.createRange();
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const el = n.parentElement;
    rg.selectNodeContents(n);
    for (const r of rg.getClientRects()) {
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
      if (!vis(r, el)) continue;
      const q = { l: r.left, t: r.top, r: r.right, b: r.bottom, w: wOf(el) };
      out.push(q);
      if (hl && hl.contains(el)) lines.push(q);
    }
  }
  // Felder, Bilder, Diagramme zählen auch als Inhalt
  document.querySelectorAll('input:not([type=hidden]), textarea, select, img, canvas, svg:not(.ico):not(.mx-ptr)').forEach(el => {
    if (el.closest('.mx-cur')) return;
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 12 || r.bottom < 0 || r.top > H || !vis(r, el)) return;
    out.push({ l: r.left, t: r.top, r: r.right, b: r.bottom, w: wOf(el) * .7 });
  });
  // Steuerleiste der Führung und Eingabeleiste von Max nie zudecken
  document.querySelectorAll('.mx-dock').forEach(el => { const r = el.getBoundingClientRect(); if (r.width) out.push({ l: r.left - 8, t: r.top - 8, r: r.right + 8, b: r.bottom + 8, w: 3 }); });
  document.querySelectorAll('.asst .ai-isl').forEach(el => { const r = el.getBoundingClientRect(); if (r.width) out.push({ l: r.left, t: r.top, r: r.right, b: r.bottom, w: .5 }); });
  return { rects: out, lines };
}

// Nur senkrecht scrollen (scrollIntoView schiebt sonst manchmal ganze Bereiche seitlich weg)
function vScroll(el, where) {
  let sc = el.parentElement;
  while (sc && sc !== document.body) { const cs = getComputedStyle(sc); if (/(auto|scroll)/.test(cs.overflowY) && sc.scrollHeight > sc.clientHeight + 2) break; sc = sc.parentElement; }
  const r = el.getBoundingClientRect();
  if (!sc || sc === document.body) { const top = scrollY + r.top - (where === 'start' ? 16 : (innerHeight - r.height) / 2); scrollTo({ top: Math.max(0, top), behavior: reduce() ? 'auto' : 'smooth' }); return; }
  const R = sc.getBoundingClientRect();
  const top = sc.scrollTop + (r.top - R.top) - (where === 'start' ? 14 : Math.max(14, (R.height - r.height) / 2));
  sc.scrollTo({ top: Math.max(0, top), behavior: reduce() ? 'auto' : 'smooth' });
}
// steps: [{ el, say }] – el darf null sein (dann zeigt Max oben in die Mitte des Inhalts)
// voice: (text) => Promise – Max spricht den Schritt selbst; die Blase zeigt dann nur „Max“, kein Text
export function tour(steps, { onAsk, onEnd, startAt, label = 'Max', dockAt, voice, onStep, keepOnNav = false } = {}) {
  steps = (steps || []).filter(s => s && s.say);
  if (!steps.length) return null;
  if (active) active.stop(true);
  const sz = h('span', { class: 'mx-sz', 'aria-hidden': 'true' }), ty = h('span', { class: 'mx-ty' });
  const txt = h('div', { class: 'mx-txt' }, sz, ty);
  // Steuerung sitzt groß unten rechts bei Max – die Blase am Cursor bleibt reine Erklärung
  const num = h('span', { class: 'mx-n' });
  const bPause = h('button', { type: 'button', class: 'mx-b mx-pp', 'aria-label': L('Pause', 'Pause'), title: L('Pause (Leertaste)', 'Pause (space)') });
  const nextLbl = h('span', {}, L('Weiter', 'Next'));
  const bNext = h('button', { type: 'button', class: 'mx-next', 'aria-label': L('Weiter', 'Next'), title: L('Weiter (→)', 'Next (→)') }, nextLbl, h('span', { html: ico('right') }));
  const bStop = h('button', { type: 'button', class: 'mx-b', 'aria-label': L('Führung beenden', 'End walkthrough'), title: L('Beenden (Esc)', 'End (Esc)'), html: ico('x') });
  const bAsk = onAsk ? h('button', { type: 'button', class: 'mx-ask', title: L('Frage genau zu dieser Stelle', 'Ask about exactly this spot') }, h('span', { html: ico('chat') }), L('Frage', 'Ask')) : null;
  const tag = h('span', { class: 'mx-tag' }, label);
  const say = h('div', { class: 'mx-say' }, tag, txt);
  const cur = h('div', { class: 'mx-cur' + (voice ? ' mx-voice' : ''), role: 'status', 'aria-live': 'polite' }, h('span', { class: 'mx-p', html: PTR }), say);
  const dock = h('div', { class: 'mx-dock', role: 'toolbar', 'aria-label': L('Max-Führung', 'Max walkthrough') },
    h('span', { class: 'mx-dl' }, h('i', { class: 'mx-live' }), h('b', {}, L('Max zeigt’s dir', 'Max shows you')), num), bAsk, bPause, bNext, bStop);
  document.body.append(cur, dock);
  const mob = () => innerWidth <= 600;
  const placeDock = () => {
    if (mob()) {
      dock.style.left = '8px'; dock.style.right = '8px';
      const r = dock.classList.contains('paused') && dockAt ? dockAt() : null;
      dock.style.bottom = r && r.width && r.top > 0 ? Math.max(10, Math.round(innerHeight - r.top + 8)) + 'px' : 'calc(10px + env(safe-area-inset-bottom, 0px))';
      return;
    }
    const r = dockAt ? dockAt() : null;
    if (r && r.width && r.top > 0) { dock.style.right = Math.max(10, Math.round(innerWidth - r.right)) + 'px'; dock.style.bottom = Math.max(10, Math.round(innerHeight - r.top + 12)) + 'px'; }
    else { dock.style.right = '18px'; dock.style.bottom = '18px'; }
  };
  placeDock();
  document.documentElement.classList.add('mx-touring');
  let i = -1, paused = false, dead = false, hold = 0, typed = 0, typing = 0, hl = null, relT = 0;
  // Ziel: Spitze relativ zur Stelle (folgt beim Scrollen), Blase relativ zur Spitze
  let pos = { dx: 12, dy: 12, ox: 18, oy: 50, flip: false };
  const start = startAt || { x: innerWidth - 90, y: innerHeight - 110 };
  let x = start.x, y = start.y, tx = x, ty2 = y, raf = 0;
  const cur$ = () => steps[i];
  const viewRect = () => (document.getElementById('view') || document.body).getBoundingClientRect();

  // ---------- Platz für die Blase finden ----------
  function layout() {
    const s = cur$(); if (!s) return;
    const sw = say.offsetWidth || 320, sh = (say.offsetHeight || 100) + TAG, W = innerWidth, H = innerHeight;
    if (!s.el || !s.el.isConnected) {
      const r = viewRect();
      pos = { ax: r.left + r.width / 2 - 40, ay: Math.max(r.top + 70, 90), dx: null, ox: 18, oy: 34 + TAG, flip: false };
      if (mob()) { const D = dock.getBoundingClientRect(); pos.cy = (D.top || H - 70) - 10 - (say.offsetHeight || 90); pos.k = 'mob'; }
      applyPos(); return;
    }
    const E = s.el.getBoundingClientRect();
    if (mob()) {
      const D = dock.getBoundingClientRect(), sayH = say.offsetHeight || 90;
      const tx0 = Math.min(W - 30, Math.max(10, E.left + Math.min(14, E.width / 4))), ty0 = Math.min(H - 6, Math.max(6, E.top + Math.min(E.height / 2, 18)));
      const cy = (D.top || H - 70) - 10 - sayH;
      pos = { dx: tx0 - E.left, dy: ty0 - E.top, ox: M - tx0, oy: cy - ty0, cy, flip: false, k: 'mob' };
      applyPos(); return;
    }
    const scope = s.el.closest('.tafel') || document.getElementById('view');
    const keep = cur.style.display; cur.style.display = 'none';
    const { rects, lines } = contentRects(s.el, scope);
    cur.style.display = keep;
    // erste und letzte Textzeile der gezeigten Stelle
    let fl, ll;
    if (lines.length) {
      fl = lines.reduce((a, b) => (b.t < a.t - 2 || (Math.abs(b.t - a.t) <= 2 && b.l < a.l) ? b : a));
      ll = lines.reduce((a, b) => (b.b > a.b + 2 || (Math.abs(b.b - a.b) <= 2 && b.r > a.r) ? b : a));
    } else {
      const l = E.left + Math.min(14, E.width / 4), r = E.left + Math.min(E.width - 8, Math.max(40, E.width * .35));
      fl = ll = { l, r, t: E.top + E.height * .2, b: E.top + E.height * .8 };
    }
    const llm = (ll.t + ll.b) / 2, my = Math.min(E.height / 2, 18);
    const C = [
      // rechts neben dem Textende – meistens leerer Platz im selben Kasten
      ['after', ll.r + 8, llm - 5, t => [t.x + 26, t.y - 8], false, 0],
      ['after-up', ll.r + 8, llm - 5, t => [t.x + 26, t.y + 22 - sh], false, 300],
      // rechts neben der ganzen Stelle
      ['right', E.right - 8, E.top + my, t => [E.right + 20, t.y - 8], false, 700],
      ['right-up', E.right - 8, E.top + my, t => [E.right + 20, t.y + 22 - sh], false, 900],
      // darunter
      ['below', fl.l + 10, E.bottom - 6, t => [t.x + 20, E.bottom + 12], false, 1400],
      // links daneben (Pfeil gespiegelt)
      ['left', E.left + 6, E.top + my, t => [t.x - 28 - sw, t.y - 8], true, 1700],
      ['left-up', E.left + 6, E.top + my, t => [t.x - 28 - sw, t.y + 22 - sh], true, 2000],
      // darüber
      ['above', fl.l + 10, E.top + 6, t => [t.x + 20, E.top - 12 - sh], false, 2300],
    ];
    let best = null;
    for (const [k, px, py, fn, flip, bias] of C) {
      const t = { x: Math.min(W - 6, Math.max(6, px)), y: Math.min(H - 6, Math.max(6, py)) };
      const [ux, uy] = fn(t);
      const cx = Math.min(W - M - sw, Math.max(M, ux)), cy = Math.min(H - M - sh, Math.max(M, uy));
      const U = { l: cx, t: cy, r: cx + sw, b: cy + sh };
      const A = flip ? { l: t.x - 24, t: t.y - 3, r: t.x + 4, b: t.y + 27 } : { l: t.x - 4, t: t.y - 3, r: t.x + 24, b: t.y + 27 };
      let cost = bias + Math.hypot(cx - ux, cy - uy) * 120 + ov(U, A) * 14;
      for (const q of rects) { const o = ov(U, q); if (o) cost += o * q.w; }
      if (!best || cost < best.cost) best = { cost, k, t, cx, cy, flip };
    }
    pos = { dx: best.t.x - E.left, dy: best.t.y - E.top, ox: best.cx - best.t.x, oy: best.cy + TAG - best.t.y, flip: best.flip, k: best.k };
    applyPos();
  }
  function applyPos() {
    say.style.left = pos.ox.toFixed(0) + 'px'; say.style.top = pos.oy.toFixed(0) + 'px';
    cur.classList.toggle('flip-x', !!pos.flip);
    cur.dataset.at = pos.k || '';
  }
  const relayout = () => { clearTimeout(relT); relT = setTimeout(() => { if (!dead) layout(); }, 140); };

  // ---------- Bewegung: weich hinterher, folgt beim Scrollen ----------
  const place = () => {
    if (dead) return;
    const s = cur$();
    if (s && s.el) {
      // Stelle weg (Seite gewechselt, Tafel zu/eingeklappt) → Führung sofort beenden, nicht irgendwo rumhängen
      if (!s.el.isConnected || !s.el.getClientRects().length) { stop(true); return; }
      const r = s.el.getBoundingClientRect();
      tx = r.left + pos.dx; ty2 = r.top + pos.dy;
    } else if (s) { tx = pos.ax ?? tx; ty2 = pos.ay ?? ty2; }
    if (reduce()) { x = tx; y = ty2; } else { x += (tx - x) * .16; y += (ty2 - y) * .16; }
    cur.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    if (pos.k === 'mob') { say.style.left = (M - x).toFixed(1) + 'px'; say.style.top = (pos.cy - y).toFixed(1) + 'px'; }
    placeDock();
    raf = requestAnimationFrame(place);
  };
  const setHL = el => { if (hl) hl.classList.remove('mx-hl'); hl = el || null; if (hl) hl.classList.add('mx-hl'); };
  const typeOut = text => {
    clearInterval(typing); ty.textContent = ''; typed = 0;
    if (reduce()) { ty.textContent = text; typed = text.length; return Promise.resolve(); }
    return new Promise(res => { typing = setInterval(() => { if (paused) return; typed = Math.min(text.length, typed + 2); ty.textContent = text.slice(0, typed); if (typed >= text.length) { clearInterval(typing); res(); } }, 22); });
  };
  const drawCtl = () => {
    bPause.innerHTML = ico(paused ? 'play' : 'pause'); bPause.setAttribute('aria-label', paused ? L('Weiter abspielen', 'Resume') : L('Pause', 'Pause'));
    num.textContent = `${i + 1} / ${steps.length}`; nextLbl.textContent = i >= steps.length - 1 ? L('Fertig', 'Done') : L('Weiter', 'Next');
    cur.classList.toggle('paused', paused); dock.classList.toggle('paused', paused); document.documentElement.classList.toggle('mx-tpaused', paused);
  };
  async function go(n) {
    clearTimeout(hold);
    if (n >= steps.length) return finish();
    i = n; drawCtl();
    const s = steps[i];
    if (s.el && s.el.isConnected) {
      const r = s.el.getBoundingClientRect();
      const low = mob() ? Math.max(260, innerHeight - (dock.getBoundingClientRect().top || innerHeight - 70) + (say.offsetHeight || 110) + 40) : 160;
      const out = r.top < 70 || r.bottom > innerHeight - low;
      if (out) { vScroll(s.el, mob() ? 'start' : 'center'); await new Promise(r2 => setTimeout(r2, 460)); }
    }
    if (dead || i !== n) return;
    if (onStep) { try { const w = onStep(s, i); if (w && w.then) await w; } catch (e) {} if (dead || i !== n) return; }   // z. B. Max-Modus: Mindmap-Ast fliegt erst jetzt rein
    setHL(s.el);
    // Blasengröße steht vorher fest (unsichtbarer Volltext) – so springt nichts, während der Text reinläuft
    if (voice) {   // gesprochen: Cursor zeigt, Max sagt es – kein Text in der Blase
      sz.textContent = ''; ty.textContent = ''; layout();
      say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
      try { await voice(s.say); } catch (e) {}
      typed = s.say.length;
    } else {
    sz.textContent = s.say; ty.textContent = '';
    layout();
    say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
    await typeOut(s.say);
    }
    if (dead || i !== n) return;
    schedule();
  }
  const readMs = () => voice ? 350 : Math.max(2600, (steps[i]?.say || '').split(/\s+/).length * 330 + 900);
  function schedule() { clearTimeout(hold); if (!paused) hold = setTimeout(() => go(i + 1), readMs()); }
  function finish() {
    setHL(null); clearTimeout(hold);
    const t = voice ? '' : L('Das war’s. Frag mich, wenn was hakt.', 'That’s it. Ask me if anything’s unclear.');
    sz.textContent = t; ty.textContent = t;
    num.textContent = ''; cur.classList.add('done'); dock.classList.add('done');
    hold = setTimeout(() => stop(), voice ? 900 : 3400);
  }
  function pause() { if (dead) return; paused = true; clearTimeout(hold); drawCtl(); }
  function resume() { if (dead) return; paused = false; drawCtl(); if (typed >= (steps[i]?.say || '').length) schedule(); }
  function stop(quick) {
    if (dead) return; dead = true;
    cancelAnimationFrame(raf); clearTimeout(hold); clearTimeout(relT); clearInterval(typing); setHL(null);
    removeEventListener('keydown', onKey, true);
    removeEventListener('hashchange', onHash);
    removeEventListener('scroll', relayout, true);
    removeEventListener('resize', relayout);
    if (active === ctl) { active = null; document.documentElement.classList.remove('mx-touring', 'mx-tpaused'); }
    if (quick || reduce()) { cur.remove(); dock.remove(); } else { cur.classList.add('out'); dock.classList.add('out'); setTimeout(() => { cur.remove(); dock.remove(); }, 380); }
    onEnd && onEnd();
  }
  const onKey = e => {
    const a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); stop(); }
    else if (e.key === ' ') { e.preventDefault(); paused ? resume() : pause(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, i - 1)); }
  };
  const onHash = () => { if (!keepOnNav) stop(true); };   // Bereichs-Tour wechselt selbst die Seiten
  addEventListener('keydown', onKey, true);
  addEventListener('hashchange', onHash);
  addEventListener('scroll', relayout, { capture: true, passive: true });
  addEventListener('resize', relayout);
  bPause.onclick = () => (paused ? resume() : pause());
  bNext.onclick = () => go(i + 1);
  bStop.onclick = () => stop();
  if (bAsk) bAsk.onclick = () => { pause(); const s = steps[i]; onAsk({ i: i + 1, n: steps.length, say: s.say, el: s.el }); };
  const ctl = { pause, resume, stop, next: () => go(i + 1), el: cur };
  active = ctl;
  cur.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(() => { cur.classList.add('in'); dock.classList.add('in'); });
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

// Kurzer Text einer Stelle (für „Frage zu …“)
export function spotText(el, max = 60) {
  if (!el) return '';
  const t = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? ((el.getAttribute('aria-label') || el.closest('label')?.innerText || el.placeholder || '') + (el.value ? ' = ' + el.value : '')) : (el.innerText || el.textContent || '');
  const s = t.replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
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
.mx-p { position: absolute; left: -3px; top: -2px; width: 26px; height: 28px; display: block; filter: drop-shadow(0 4px 10px rgba(0,0,0,.45)); transition: transform .3s cubic-bezier(.3,1.4,.5,1); }
.mx-cur.flip-x .mx-p { left: -23px; transform: scaleX(-1); }
.mx-ptr { width: 100%; height: 100%; display: block; }
.mx-ptr path { fill: var(--inv); stroke: var(--bg); stroke-width: 1.6; stroke-linejoin: round; }
.mx-say { position: absolute; left: 18px; top: 50px; width: max-content; max-width: min(330px, calc(100vw - 20px)); padding: 11px 14px 12px; border-radius: 6px 18px 18px 18px; background: var(--panel); color: var(--ink); border: 1px solid var(--line2); box-shadow: 0 24px 60px -24px rgba(0,0,0,.75), 0 0 0 1px color-mix(in srgb, var(--ink) 6%, transparent); pointer-events: auto; transform-origin: 0 0; transition: left .42s cubic-bezier(.16,1,.3,1), top .42s cubic-bezier(.16,1,.3,1), border-radius .3s; }
.mx-cur.flip-x .mx-say { border-radius: 18px 6px 18px 18px; transform-origin: 100% 0; }
.mx-cur[data-at$="-up"] .mx-say { border-radius: 18px 18px 18px 6px; transform-origin: 0 100%; }
.mx-cur.flip-x[data-at$="-up"] .mx-say { border-radius: 18px 18px 6px 18px; transform-origin: 100% 100%; }
.mx-cur.mx-voice .mx-txt { display: none; }
.mx-say.pop { animation: mxpop .38s cubic-bezier(.3,1.4,.5,1) both; }
@keyframes mxpop { from { opacity: .3; transform: scale(.92) translateY(-3px); } }
.mx-tag { position: absolute; left: -1px; bottom: calc(100% + 5px); padding: 3px 10px 4px; border-radius: 999px; background: var(--inv); color: var(--onInv); font: 700 12px/1.2 var(--sans); letter-spacing: .01em; white-space: nowrap; box-shadow: 0 6px 18px -6px rgba(0,0,0,.5); }
.mx-cur.flip-x .mx-tag { left: auto; right: -1px; }
.mx-txt { display: grid; font: 500 15px/1.48 var(--sans); min-height: 1.5em; text-wrap: pretty; }
.mx-txt > span { grid-area: 1 / 1; } .mx-sz { visibility: hidden; }
.mx-dock { position: fixed; z-index: 131; right: 18px; bottom: 18px; display: flex; align-items: center; gap: 6px; max-width: calc(100vw - 20px); padding: 7px 7px 7px 16px; border-radius: 999px; background: var(--panel); border: 1px solid var(--line2); box-shadow: 0 24px 60px -22px rgba(0,0,0,.75), 0 0 0 1px color-mix(in srgb, var(--ink) 6%, transparent); opacity: 0; transform: translateY(10px); transition: opacity .3s ease, transform .35s cubic-bezier(.16,1,.3,1); }
.mx-dock.in { opacity: 1; transform: none; } .mx-dock.out { opacity: 0; transform: translateY(8px); }
.mx-dl { display: inline-flex; align-items: center; gap: 8px; margin-right: 6px; white-space: nowrap; font: 600 13.5px var(--sans); color: var(--ink); }
.mx-dl b { font-weight: 650; }
.mx-live { width: 8px; height: 8px; border-radius: 50%; background: var(--ink); animation: mxlive 1.6s ease-in-out infinite; } .mx-dock.paused .mx-live { animation: none; opacity: .35; }
@keyframes mxlive { 50% { opacity: .25; transform: scale(.8); } }
.mx-n { font: 600 12px var(--mono); color: var(--mute); }
.mx-b { width: 40px; height: 40px; flex: none; display: grid; place-items: center; border: 1px solid var(--line2); border-radius: 50%; background: transparent; color: var(--ink); cursor: pointer; transition: border-color .15s, background .15s; } .mx-b:hover { border-color: var(--ink); background: var(--panel2); } .mx-b .ico { width: 16px; height: 16px; } .mx-pp .ico { fill: currentColor; stroke: none; width: 14px; height: 14px; }
.mx-next { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px 0 22px; border: 0; border-radius: 999px; background: var(--inv); color: var(--onInv); font: 700 15px var(--sans); cursor: pointer; flex: none; transition: transform .15s ease, opacity .15s; } .mx-next:hover { transform: translateX(2px); } .mx-next:active { transform: scale(.97); } .mx-next .ico { width: 17px; height: 17px; stroke-width: 2.4; }
.mx-ask { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px; flex: none; border-radius: 999px; border: 1px solid var(--line2); background: transparent; color: var(--ink); font: 600 13.5px var(--sans); cursor: pointer; } .mx-ask:hover { border-color: var(--ink); background: var(--panel2); } .mx-ask .ico { width: 15px; height: 15px; }
.mx-dock.done .mx-ask, .mx-dock.done .mx-pp, .mx-dock.done .mx-next, .mx-dock.done .mx-n { display: none; }
.mx-cur.paused .mx-tag::after { content: " · Pause"; font-weight: 500; opacity: .75; }
@media (max-width: 600px) { .mx-dock { padding: 6px 6px 6px 12px; gap: 5px; justify-content: flex-end; } .mx-dl { margin-right: auto; } .mx-dl b { display: none; } .mx-ask { padding: 0 11px; } .mx-next { padding: 0 14px 0 16px; }
  .mx-say { width: calc(100vw - 16px); max-width: none; border-radius: 18px !important; }
  .mx-cur[data-at="mob"] .mx-tag { left: 12px; }
  .mx-cur.paused .mx-say { opacity: 0; pointer-events: none; } }
.mx-hl { outline: 2px solid var(--ink) !important; outline-offset: 4px; box-shadow: 0 0 0 8px color-mix(in srgb, var(--ink) 9%, transparent) !important; transition: outline-offset .25s ease, box-shadow .25s ease; }
svg text.mx-hl { outline: none !important; fill: var(--ink); font-weight: 800; }
@media (prefers-reduced-motion: reduce) { .mx-say.pop { animation: none; } .mx-say, .mx-p { transition: none; } }
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
