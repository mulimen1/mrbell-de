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

// Scheinwerfer: alles andere wird leicht abgedunkelt, die gezeigte Stelle bekommt einen wandernden Farbring
function spotlight() {
  const sp = h('div', { class: 'gt-spot', 'aria-hidden': 'true' });
  document.body.appendChild(sp);
  let raf = 0, on = true, last = '';
  const loop = () => {
    if (!on) return;
    const el = document.querySelector('.mx-hl');
    if (el && el.getClientRects().length) {
      const r = el.getBoundingClientRect(), pad = 10;
      const rad = Math.min(30, Math.max(14, (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0) + pad));
      const k = [r.left - pad, r.top - pad, r.width + 2 * pad, r.height + 2 * pad, rad].map(Math.round).join(',');
      if (k !== last) { last = k; const [x, y, w, hh, rr] = k.split(',').map(Number); Object.assign(sp.style, { transform: `translate(${x}px, ${y}px)`, width: w + 'px', height: hh + 'px', borderRadius: rr + 'px' }); }
      sp.classList.add('on');
    } else sp.classList.remove('on');
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => { on = false; cancelAnimationFrame(raf); sp.classList.remove('on'); sp.classList.add('out'); setTimeout(() => sp.remove(), 400); };
}

export async function goTour() {
  const { tour, tourActive } = await import('./cursor.js');
  if (tourActive()) return;
  const H = document.documentElement;
  H.classList.add('bm-gotour');
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
  const offSpot = spotlight();
  return tour(S, {
    keepOnNav: true,
    onStep: async s => {
      if (location.hash.split('?')[0] !== s.at) { location.hash = s.at; await wait(1200); }
      s.el = pick(...s.sel);
      [450, 1000].forEach(t => setTimeout(() => dispatchEvent(new Event('resize')), t));   // Elemente, die noch reinfahren: Blase neu ausrichten
      if (s.el) { const r = s.el.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight - 140) { s.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); await wait(500); } }
    },
    onEnd: () => {
      offSpot();
      H.classList.remove('bm-gotour');
      if (!/^#\/app\/tutor/.test(location.hash)) location.hash = '#/app/tutor';
    },
  });
}
