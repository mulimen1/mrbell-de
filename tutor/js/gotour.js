// „Los geht’s“: Begrüßung im Großbild, Max fliegt in den Tutor, und auf Wunsch führt er mit dem Cursor durch alle vier Bereiche.
// Ohne Konto. Gesperrt wird erst, wenn man selbst woanders hinklickt.
import { h } from './util.js';
import { L } from './i18n.js';
import { face } from './face.js';
import { getAccount } from './api.js';

const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } };
export const goMode = () => !getAccount() && ss('bm.go') === '1';
export function startGo() { ss('bm.go', '1'); ss('bm.goWel', null); }

export const goWelcomeText = () => L(
  'Moin. Du bist also der Neue. Ich bin Max – BWL-Lernplattform, Sylt, Papa hat eine Holding. Hier findest du alles, was du bis zur Klausur brauchst. Soll ich dich rumführen, oder klickst du lieber planlos rum wie im ersten Semester?',
  'Moin. So you’re the new one. I’m Max – business learning platform, Sylt, Dad owns a holding. Everything you need until the exam is here. Shall I show you around, or do you prefer clicking around aimlessly like in your first semester?');

// Großbild-Begrüßung, dann fliegt Max an seinen Platz im Tutor
export function goSplash() {
  if (ss('bm.goWel') || document.querySelector('.ngreet')) return;
  ss('bm.goWel', '1');
  const fEl = h('div', { class: 'ng-face' });
  const el = h('div', { class: 'ngreet', role: 'dialog', 'aria-label': L('Willkommen', 'Welcome') },
    h('div', { class: 'ng-in' }, fEl, h('h2', { class: 'ng-hey' }, L('Willkommen bei BWL Max.', 'Welcome to BWL Max.')),
      h('p', { class: 'ng-line' }, L('Die beste Lernplattform für BWLer. Sag ich nicht. Sagt Papa.', 'The best learning platform for business students. Not my words. Dad’s.')),
      h('div', { class: 'ng-skip' }, L('Antippen, um direkt loszulegen', 'Tap to jump right in'))));
  document.body.appendChild(el);
  import('./flight.js').then(F => F.hideDock()).catch(() => {});
  const fc = face(fEl, {});
  setTimeout(() => fc.pulse && fc.pulse('smug', 1400), 800);
  let done = false;
  const close = () => {
    if (done) return; done = true; clearTimeout(auto);
    const r = fEl.getBoundingClientRect();
    el.classList.add('out');
    import('./flight.js').then(F => { fEl.style.visibility = 'hidden'; return F.dockTo(r, { dur: 1100, arc: .16 }); }).catch(() => {});
    setTimeout(() => el.remove(), 560);
  };
  const auto = setTimeout(close, 4250);
  el.addEventListener('click', close);
  requestAnimationFrame(() => el.classList.add('in'));
}

// Rundgang durch die vier Bereiche
const pick = (...sels) => { for (const s of sels) { const e = document.querySelector(s); if (e && e.getClientRects().length) return e; } return null; };
const wait = ms => new Promise(r => setTimeout(r, ms));

export async function goTour() {
  if (live) return;
  try { const c = await import('./cursor.js'); c.stopTour(); } catch (e) {}
  const S = [
    { at: '#/app/tutor', sel: ['.topnav'], say: L('Vier Bereiche, alles für dein Studium. Ich zeig dir kurz, was wo ist. Kurz, weil meine Zeit teuer ist.', 'Four areas, everything for your degree. I’ll quickly show you what’s where. Quickly, because my time is expensive.') },
    { at: '#/app/tutor', sel: ['.ai-isl'], say: L('Hier fragst du mich alles zu BWL. Ich erklär’s an der Tafel, mit Rechenweg.', 'Ask me anything about business here. I explain it on the whiteboard, with workings.') },
    { at: '#/app/tutor', sel: ['.rm-tl', '.rm-tools2'], say: L('Skript rein, und ich bau dir Lernzettel, Karteikarten, Quiz, Podcast und Klausurplan. In Sekunden.', 'Drop in your slides and I build study sheets, flashcards, quizzes, podcasts and an exam plan. In seconds.') },
    { at: '#/app/bibliothek', sel: ['#view h1', '#view'], say: L('Fächer & Bibliothek: alles, was du hochlädst und ich dir baue – sauber nach Fach sortiert.', 'Subjects & library: everything you upload and I build – neatly sorted by subject.') },
    { at: '#/app/ueben', sel: ['.ub-lt', '.ub-hs'], say: L('Lernen: Tafel, Lernzettel, Karteikarten, Podcast, Lernpfad. Ein Klick, ich bau’s.', 'Learn: whiteboard, study sheet, flashcards, podcast, study path. One click, I build it.') },
    { at: '#/app/ueben', sel: ['.ub-simrow', '.ub-h'], say: L('Klausur-Simulator und Quiz. Wie die echte Prüfung – nur fairer bewertet.', 'Exam simulator and quiz. Like the real exam – just graded fairer.') },
    { at: '#/app/excel', sel: ['.xl-head', '#view h1'], say: L('Klausur-Tools: 60 geprüfte Excel-Vorlagen mit echten Formeln. Hat sonst keiner.', 'Exam tools: 60 checked Excel templates with real formulas. Nobody else has that.') },
    { at: '#/app/excel', sel: ['.xl-card'], say: L('Blaue Zellen ausfüllen, der Rest rechnet sich. Wie mein Depot. Nur ohne Verluste.', 'Fill the blue cells, the rest calculates itself. Like my portfolio. Minus the losses.') },
    { at: '#/app/tutor', sel: ['.ai-isl'], say: getAccount() ? L('Das war’s. Jetzt du – frag mich was. Ich merk mir alles, was wir machen.', 'That’s it. Your turn – ask me anything. I remember everything we do.') : L('Das war’s. Jetzt du – frag mich was. Mit kostenlosem Konto merk ich mir alles.', 'That’s it. Your turn – ask me something. With a free account I remember everything.') },
  ];
  return runTour(S);
}

// ---------- Max groß links, Sprechblasen, Rest dunkel, gezeigte Stelle hell ----------
let live = null;
function runTour(S) {
  if (live) live.end(true);
  const H = document.documentElement;
  const sp = h('div', { class: 'gt-spot', 'aria-hidden': 'true' });
  const fEl = h('div', { class: 'gt-face' });
  const txt = h('p', { class: 'gt-txt' }), num = h('span', { class: 'gt-n' });
  const bar = h('div', { class: 'gt-bar' }, h('i', {}));
  const B = (cls, label, fn, title) => h('button', { class: 'gt-b ' + cls, type: 'button', title: title || label, 'aria-label': title || label, onclick: fn }, label);
  const SPEEDS = [1, 1.5, 2];
  let speed = +(ss('bm.tourSpeed') || 1); if (!SPEEDS.includes(speed)) speed = 1;
  const bBack = B('gt-back', '‹', () => go(i - 1), L('Zurück', 'Back'));
  const bPlay = B('gt-pp', '', () => (paused ? resume() : pause()), L('Pause / Weiter', 'Pause / play'));
  const bNext = B('gt-next', L('Weiter', 'Next'), () => go(i + 1));
  const bSpd = B('gt-spd', speed + '×', () => { speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; ss('bm.tourSpeed', String(speed)); bSpd.textContent = speed + '×'; if (!paused && done) schedule(); }, L('Tempo', 'Speed'));
  const bEnd = B('gt-end', L('Beenden', 'End'), () => end());
  const bub = h('div', { class: 'gt-bub', role: 'status', 'aria-live': 'polite' }, h('div', { class: 'gt-top' }, h('b', {}, 'Max'), num), txt, bar, h('div', { class: 'gt-ctl' }, bBack, bPlay, bNext, bSpd, bEnd));
  const box = h('div', { class: 'gt-max', 'data-pos': 'bl' }, fEl, bub);
  document.body.append(sp, box);
  H.classList.add('bm-gotour', 'gt-on');
  const fc = face(fEl, { follow: false });
  requestAnimationFrame(() => box.classList.add('in'));
  let i = -1, paused = false, dead = false, hold = 0, typing = 0, done = false, el = null, raf = 0, t0 = 0, dur = 1;

  const loop = () => {
    if (dead) return;
    if (el && el.isConnected && el.getClientRects().length) {
      const r = el.getBoundingClientRect(), pad = 10;
      const rad = Math.min(30, Math.max(14, (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0) + pad));
      Object.assign(sp.style, { transform: `translate(${Math.round(r.left - pad)}px, ${Math.round(r.top - pad)}px)`, width: Math.round(r.width + 2 * pad) + 'px', height: Math.round(r.height + 2 * pad) + 'px', borderRadius: Math.round(rad) + 'px' });
      sp.classList.add('on');
      // Max weicht aus: liegt die Stelle unten links, wandert er nach rechts
      place(r);
    } else { Object.assign(sp.style, { transform: `translate(${innerWidth / 2}px, ${innerHeight / 2}px)`, width: '0px', height: '0px' }); sp.classList.add('on'); }   // beim Wechsel bleibt alles dunkel
    if (done && !paused) bar.firstChild.style.transform = `scaleX(${Math.min(1, (performance.now() - t0) / dur)})`;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  // Platz für Max + Blase: nie über der hellen Stelle. Reihenfolge: unten links, unten rechts, oben links, oben rechts
  const POS = ['bl', 'br', 'tl', 'tr'];
  let posK = 'bl';
  function place(r) {
    const mob = innerWidth <= 700, W = innerWidth, H0 = innerHeight;
    const bw = box.offsetWidth, bh = box.offsetHeight, m = mob ? 10 : 22, top = mob ? 64 : 84;
    const rect = k => { const x = mob || k[1] === 'l' ? m : W - m - bw, y = k[0] === 'b' ? H0 - m - bh : top; return { l: x, t: y, r: x + bw, b: y + bh }; };
    const pad = 14, R = { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad };
    const ov = q => Math.max(0, Math.min(q.r, R.r) - Math.max(q.l, R.l)) * Math.max(0, Math.min(q.b, R.b) - Math.max(q.t, R.t));
    const keys = mob ? ['bl', 'tl'] : POS;
    if (ov(rect(posK)) === 0 && keys.includes(posK)) return;
    let best = keys[0], bo = Infinity;
    for (const k of keys) { const o = ov(rect(k)); if (o < bo) { bo = o; best = k; } if (o === 0) break; }
    if (best !== posK) { posK = best; box.dataset.pos = best; }
  }
  const drawCtl = () => { bPlay.textContent = paused ? '▶' : '❚❚'; box.classList.toggle('paused', paused); num.textContent = `${i + 1} / ${S.length}`; bBack.disabled = i <= 0; bNext.textContent = i >= S.length - 1 ? L('Fertig', 'Done') : L('Weiter', 'Next'); };
  const readMs = () => 1.25 * Math.max(1950, (S[i]?.say || '').split(/\s+/).length * 182 + 390) / speed;   // Okt 2026: 25 % mehr Lesezeit
  function schedule() { clearTimeout(hold); t0 = performance.now(); dur = readMs(); hold = setTimeout(() => go(i + 1), dur); }
  function type(text) {
    clearInterval(typing); done = false; bar.firstChild.style.transform = 'scaleX(0)';
    txt.dataset.full = text; txt.textContent = '';
    fc.set('talk');
    let n = 0;
    return new Promise(res => { typing = setInterval(() => { if (paused) return; n = Math.min(text.length, n + Math.ceil(3 * speed)); txt.textContent = text.slice(0, n); if (n >= text.length) { clearInterval(typing); fc.set('idle'); done = true; res(); } }, 16); });
  }
  async function go(n) {
    if (dead) return;
    clearTimeout(hold); clearInterval(typing);
    if (n < 0) n = 0;
    if (n >= S.length) { finished = true; return end(); }
    i = n; drawCtl();
    const s = S[i];
    el = null; txt.textContent = ''; txt.dataset.full = '';
    if (location.hash.split('?')[0] !== s.at) { location.hash = s.at; await wait(850); if (dead || i !== n) return; }
    if (s.sel.includes('.rm-tl')) { const b = document.querySelector('.rm-tkb:not(.open)'); if (b) { b.click(); await wait(450); if (dead || i !== n) return; } }
    el = pick(...s.sel);
    if (el) {
      // Stelle soll oben frei stehen – unten links sitzt Max mit seiner Blase
      const r = el.getBoundingClientRect(), mh = box.getBoundingClientRect().height || 300;
      if (r.top < 70 || (r.bottom > innerHeight - mh - 30 && r.height < innerHeight - mh - 140)) {
        const keep = el.style.scrollMarginTop; el.style.scrollMarginTop = '110px';
        el.scrollIntoView({ block: 'start', behavior: 'smooth' }); await wait(480); el.style.scrollMarginTop = keep;
        if (dead || i !== n) return;
      }
    }
    bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
    await type(s.say);
    if (dead || i !== n) return;
    if (!paused) schedule();
  }
  function pause() { paused = true; clearTimeout(hold); drawCtl(); }
  function resume() { paused = false; drawCtl(); if (done) schedule(); }
  let finished = false;
  const track = (a, b) => { try { window.BM && window.BM.track(a, b); } catch (e) {} };
  function end(quick) {
    if (dead) return; dead = true;
    track(finished ? 'Führung abgeschlossen' : 'Führung abgebrochen', finished ? 'Alle Schritte' : `Schritt ${i + 1} von ${S.length}`);
    // Durchgespielt und ohne Konto: Hintergrund unscharf, kostenlos anmelden
    if (finished && !getAccount()) setTimeout(() => import('./roomlock.js').then(m => m.lockArea({ t: L('Gefällt dir, was du siehst? Dann leg los.', 'Like what you see? Then get started.'), s: L('Kostenloses Konto in zwei Klicks – dann merkt sich Max alles und du kannst sofort mit deinem Stoff loslegen.', 'Free account in two clicks – Max remembers everything and you can start with your material right away.') }, { delay: 600 })).catch(() => {}), 500);
    clearTimeout(hold); clearInterval(typing); cancelAnimationFrame(raf);
    removeEventListener('keydown', onKey, true);
    H.classList.remove('bm-gotour', 'gt-on');
    sp.classList.remove('on'); box.classList.remove('in');
    setTimeout(() => { sp.remove(); box.remove(); }, quick ? 0 : 380);
    live = null;
    if (!/^#\/app\/tutor/.test(location.hash)) location.hash = '#/app/tutor';
  }
  const onKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); end(); return; }
    const a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    if (false) {}
    else if (e.key === ' ') { e.preventDefault(); paused ? resume() : pause(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  };
  addEventListener('keydown', onKey, true);
  live = { end };
  track('Führung gestartet', 'Zeig mir BWL Max');
  setTimeout(() => go(0), 350);
  return live;
}
