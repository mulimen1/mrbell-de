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
  const { tour, tourActive } = await import('./cursor.js');
  if (tourActive()) return;
  const H = document.documentElement;
  H.classList.add('bm-gotour');
  const S = [
    { at: '#/app/tutor', sel: ['.rm-face'], say: L('Das hier ist mein Büro. Du fragst, ich erkläre an der Tafel – jedes BWL-Thema, mit Rechenweg und Beispiel. Geduld hab ich. Meistens.', 'This is my office. You ask, I explain on the whiteboard – any business topic, with workings and examples. I’m patient. Mostly.') },
    { at: '#/app/tutor', sel: ['.rm-pyr', '.rm-tools', '.rm-skills', '.rm-hero'], say: L('Darunter meine Werkzeuge: Tafel, Mitschrift, Karteikarten, Quiz, Podcast, Lernpfad. Alles aus deinem Thema, in Sekunden.', 'Below that, my tools: whiteboard, notes, flashcards, quiz, podcast, study path. All from your topic, in seconds.') },
    { at: '#/app/tutor', sel: ['[data-tn="faecher"]'], say: L('Fächer & Bibliothek. Deine Skripte, Mitschriften und Fächer an einem Ort. Ordnung hab ich von Papa.', 'Subjects & library. Your slides, notes and subjects in one place. I got the tidiness from Dad.') },
    { at: '#/app/bibliothek', sel: ['#view h1', '#view .page-h', '#view'], say: L('Alles, was du hochlädst, landet hier. Ich les es einmal – danach weiß ich mehr darüber als dein Prof.', 'Everything you upload lands here. I read it once – after that I know more about it than your professor.') },
    { at: '#/app/bibliothek', sel: ['[data-tn="ueben"]'], say: L('Lernen. Hier wird aus Verstehen Können.', 'Learn. This is where understanding turns into skill.') },
    { at: '#/app/ueben', sel: ['.ub-hero', '#view h1'], say: L('Der geführte Pfad: 14 Stationen, ich sag dir, wann es sitzt. Abkürzungen gibt’s nicht. Nur mich.', 'The guided path: 14 stations, I tell you when it sticks. No shortcuts. Just me.') },
    { at: '#/app/ueben', sel: ['.ub-h', '.ln-gh', '#view h2'], say: L('Klausur-Simulator, Quiz, Duelle, Wochen-Challenge. Prüfung wie echt – nur dass ich fairer bewerte als dein Prof.', 'Exam simulator, quiz, duels, weekly challenge. Real exam conditions – except I grade fairer than your professor.') },
    { at: '#/app/ueben', sel: ['[data-tn="excel"]'], say: L('Und jetzt das, worum dich die anderen beneiden werden: die Klausur-Tools.', 'And now the part the others will envy you for: the exam tools.') },
    { at: '#/app/tools', sel: ['.kt-hero', '.kt-xl', '#view h1'], say: L('Excel-Helfer: 60 geprüfte Vorlagen mit echten Formeln. Du füllst die blauen Zellen, der Rest rechnet sich. Wie mein Depot.', 'Excel helper: 60 checked templates with real formulas. You fill the blue cells, the rest calculates itself. Like my portfolio.') },
    { at: '#/app/tools', sel: ['.kt-plan', '.kt-card', '#view h2'], say: L('Klausurplan, Simulator, Rechner, Lexikon. Ich plane bis zur Prüfung und frag dich vorher ab wie der Prof. Nur charmanter.', 'Exam plan, simulator, calculators, glossary. I plan until the exam and quiz you like the professor. Just more charming.') },
    { at: '#/app/tutor', sel: ['.rm-face'], say: L('Das war’s. Jetzt du: frag mich irgendwas zu BWL. Mit kostenlosem Konto merk ich mir alles – sonst vergess ich dich. Wäre schade. Für dich.', 'That’s it. Your turn: ask me anything about business. With a free account I remember everything – otherwise I forget you. Would be a shame. For you.') },
  ].map(s => ({ ...s, say: s.say }));
  return tour(S, {
    keepOnNav: true,
    onStep: async s => {
      if (location.hash.split('?')[0] !== s.at) { location.hash = s.at; await wait(1200); }
      s.el = pick(...s.sel);
    },
    onEnd: () => {
      H.classList.remove('bm-gotour');
      if (!/^#\/app\/tutor/.test(location.hash)) location.hash = '#/app/tutor';
    },
  });
}
