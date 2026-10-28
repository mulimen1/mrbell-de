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
  const auto = setTimeout(close, 3400);
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
    { at: '#/app/tutor', sel: ['.topnav'], say: L('BWL Max hat vier Bereiche: Tutor, Fächer & Bibliothek, Lernen und Klausur-Tools. Ich zeig dir alle. Zwei Minuten – normalerweise kostet meine Zeit mehr.', 'BWL Max has four areas: tutor, subjects & library, learn and exam tools. I’ll show you all of them. Two minutes – my time is usually more expensive.') },
    { at: '#/app/tutor', sel: ['.ai-isl'], say: L('Hier fragst du mich alles zu BWL – tippen oder einfach reinsprechen. Ich erkläre es dir an der Tafel, mit Rechenweg und Beispiel.', 'Ask me anything about business here – type or just talk. I explain it on the whiteboard, with workings and an example.') },
    { at: '#/app/tutor', sel: ['.rm-mat', '.rm-tools2'], say: L('Skript, Folien, Altklausur oder YouTube-Video reinziehen – ich lese mit und weiß danach, was dein Prof sehen will.', 'Drop in slides, notes, past exams or a YouTube video – I read along and know what your professor wants to see.') },
    { at: '#/app/tutor', sel: ['.rm-tl', '.rm-tools2'], say: L('Daraus bau ich dir Tafel-Erklärung, Lernzettel, Karteikarten, Quiz, Podcast, Lernpfad und Klausurplan. In Sekunden, nicht in Nächten.', 'From that I build whiteboard explanations, study sheets, flashcards, quizzes, podcasts, study paths and an exam plan. In seconds, not nights.') },
    { at: '#/app/tutor', sel: ['[data-tn="faecher"]'], say: L('Fächer & Bibliothek: deine Skripte, Mitschriften und alles, was ich dir gebaut hab – sauber nach Fach sortiert.', 'Subjects & library: your slides, notes and everything I built for you – neatly sorted by subject.') },
    { at: '#/app/bibliothek', sel: ['#view h1', '#view'], say: L('Hier landet alles automatisch. Ordnung hab ich von Papa. Den Rest auch.', 'Everything lands here automatically. I got the tidiness from Dad. Everything else too.') },
    { at: '#/app/bibliothek', sel: ['[data-tn="ueben"]'], say: L('Lernen: hier wird aus Verstehen Können.', 'Learn: this is where understanding turns into skill.') },
    { at: '#/app/ueben', sel: ['.ub-lt', '.ub-hs'], say: L('Aus deinem Stoff lernen: Tafel, Lernzettel, Karteikarten, Podcast mit Marie und mir, Lernpfad. Ein Klick, ich bau’s.', 'Learn from your material: whiteboard, study sheet, flashcards, a podcast with Marie and me, study path. One click, I build it.') },
    { at: '#/app/ueben', sel: ['.ub-hero'], say: L('Der geführte Lernweg: 14 Stationen, ich sag dir, wann es sitzt. Abkürzungen gibt’s nicht. Nur mich.', 'The guided path: 14 stations, I tell you when it sticks. No shortcuts. Just me.') },
    { at: '#/app/ueben', sel: ['.ub-simrow', '.ub-h'], say: L('Klausur-Simulator und Quiz: Prüfung wie echt – nur dass ich fairer bewerte als dein Prof.', 'Exam simulator and quiz: real exam conditions – except I grade fairer than your professor.') },
    { at: '#/app/ueben', sel: ['[data-tn="excel"]'], say: L('Und jetzt das, worum dich die anderen beneiden werden: die Klausur-Tools.', 'And now the part the others will envy you for: the exam tools.') },
    { at: '#/app/tools', sel: ['.kt-hero', '#view h1'], say: L('Das Herzstück: der Excel-Helfer. Schau genau hin, das hat sonst keiner.', 'The centrepiece: the Excel helper. Look closely – nobody else has this.') },
    { at: '#/app/excel', sel: ['.xl-head', '#view h1'], say: L('60 geprüfte Excel-Vorlagen mit echten Formeln. Kapitalwert, Break-even, Abschreibung, Kennzahlen – alles drin. Keine Makros, kein Hokuspokus.', '60 checked Excel templates with real formulas. NPV, break-even, depreciation, ratios – all in. No macros, no hocus-pocus.') },
    { at: '#/app/excel', sel: ['.xl-card'], say: L('Datei auf, blaue Zellen ausfüllen, der Rest rechnet sich – mit Rechenweg. Wie mein Depot. Nur ohne Verluste.', 'Open the file, fill the blue cells, the rest calculates itself – with workings. Like my portfolio. Minus the losses.') },
    { at: '#/app/excel', sel: ['.xl-tab:nth-child(2)', '.xl-tabs'], say: L('Nichts Passendes dabei? Generator: Aufgabe beschreiben, ich bau dir die Excel-Datei. Doppelt nachgerechnet.', 'Nothing fitting? Generator: describe your task and I build the Excel file. Double-checked.') },
    { at: '#/app/tools', sel: ['.kt-grid', '.kt-card'], say: L('Dazu Klausurplan, Simulator, Rechner und Lexikon. Ich plane bis zur Prüfung und frag dich vorher ab wie der Prof. Nur charmanter.', 'Plus exam plan, simulator, calculators and glossary. I plan until the exam and quiz you like the professor. Just more charming.') },
    { at: '#/app/tutor', sel: ['.ai-isl'], say: L('Das war’s. Jetzt du: frag mich irgendwas zu BWL. Mit kostenlosem Konto merk ich mir alles – sonst vergess ich dich. Wäre schade. Für dich.', 'That’s it. Your turn: ask me anything about business. With a free account I remember everything – otherwise I forget you. Would be a shame. For you.') },
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
  const box = h('div', { class: 'gt-max' }, fEl, bub);
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
      const M = box.getBoundingClientRect(), mw = M.width, mh = M.height, H0 = innerHeight;
      const ov = (l, rr) => Math.max(0, Math.min(r.right, rr) - Math.max(r.left, l)) * Math.max(0, Math.min(r.bottom, H0 - 22) - Math.max(r.top, H0 - 22 - mh));
      const oL = ov(22, 22 + mw), oR = ov(innerWidth - 22 - mw, innerWidth - 22);
      if (oL > oR * 1.15) box.classList.add('right'); else if (oR > oL * 1.15) box.classList.remove('right');
    } else { Object.assign(sp.style, { transform: `translate(${innerWidth / 2}px, ${innerHeight / 2}px)`, width: '0px', height: '0px' }); sp.classList.add('on'); }   // beim Wechsel bleibt alles dunkel
    if (done && !paused) bar.firstChild.style.transform = `scaleX(${Math.min(1, (performance.now() - t0) / dur)})`;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const drawCtl = () => { bPlay.textContent = paused ? '▶' : '❚❚'; box.classList.toggle('paused', paused); num.textContent = `${i + 1} / ${S.length}`; bBack.disabled = i <= 0; bNext.textContent = i >= S.length - 1 ? L('Fertig', 'Done') : L('Weiter', 'Next'); };
  const readMs = () => Math.max(1700, (S[i]?.say || '').split(/\s+/).length * 170 + 400) / speed;
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
    if (n >= S.length) return end();
    i = n; drawCtl();
    const s = S[i];
    el = null; txt.textContent = ''; txt.dataset.full = '';
    if (location.hash.split('?')[0] !== s.at) { location.hash = s.at; await wait(1100); if (dead || i !== n) return; }
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
  function end(quick) {
    if (dead) return; dead = true;
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
  setTimeout(() => go(0), 350);
  return live;
}
