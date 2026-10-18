// Tutor-Raum am Handy ohne Konto: kurz sehen, was einen erwartet – nach einer Sekunde wird der Raum unscharf,
// darüber das kostenlose Konto (Google zuerst, falls eingerichtet). Oben rechts ein deutliches X: zurück dahin, wo man war.
// Max unten rechts auf Themenseiten bleibt frei – gesperrt wird nur der große Tutor-Raum.
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';

const isPhone = () => matchMedia('(max-width: 600px)').matches;
let el = null, timer = 0;

export function lockRoom({ delay = 1000 } = {}) {
  clearTimeout(timer);
  if (!isPhone() || getAccount()) return;
  timer = setTimeout(show, delay);
}
export function unlockRoom() {
  clearTimeout(timer);
  document.documentElement.classList.remove('m-rlock');
  if (el) { const e = el; el = null; e.classList.add('out'); setTimeout(() => e.remove(), 260); }
}

function back() {
  unlockRoom();
  // Gibt's eine Themenseite? Dann genau dorthin zurück (gleiche Stelle). Sonst einen Schritt zurück.
  const ev = new CustomEvent('bm:back-to-page', { cancelable: true });
  if (!dispatchEvent(ev)) return;
  if (history.length > 1) history.back(); else location.hash = '#/app/lernen';
}

async function auth(mode) {
  const { openAuth, openLogin } = await import('./account.js');
  const sub = L('Kostenlos und in 30 Sekunden – dann chattest du mit Max, lädst dein Skript hoch und er baut dir Karteikarten, Quiz und Lernplan.', 'Free and done in 30 seconds – then chat with Max, upload your slides and he builds flashcards, quizzes and a study plan.');
  const ok = mode === 'login' ? await openLogin({ mode: 'login' }) : await openAuth({ title: L('Anmelden', 'Sign in'), registerTitle: L('Kostenloses Konto erstellen', 'Create your free account'), sub });
  if (ok || getAccount()) unlockRoom();
}

function show() {
  if (!isPhone() || getAccount() || el) return;
  if (!/^#\/app\/tutor/.test(location.hash)) return;
  if (document.documentElement.classList.contains('m-boardpage')) return;   // Themenseite liegt oben – nicht sperren
  document.documentElement.classList.add('m-rlock');
  const g = window.BM_GOOGLE_CLIENT_ID ? h('button', { class: 'm-rl-g', type: 'button', onclick: async () => { try { const m = await import('./google.js'); if (await m.googleSignIn()) unlockRoom(); } catch (e) {} } }, h('span', { class: 'm-rl-gi', html: GOOGLE }), L('Mit Google anmelden', 'Continue with Google')) : null;
  el = h('div', { class: 'm-rl', role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Kostenloses Konto', 'Free account') },
    h('button', { class: 'm-rl-x', type: 'button', 'aria-label': L('Schließen und zurück', 'Close and go back'), onclick: back }, h('span', { html: ico('x') })),
    h('div', { class: 'm-rl-card' },
      h('img', { class: 'm-rl-face', src: '/tutor/img/max-fav-192.png', alt: '' }),
      h('h2', {}, L('Dein persönlicher Tutor wartet.', 'Your personal tutor is waiting.')),
      h('p', {}, L('Mit kostenlosem Konto chattest du mit Max, lädst dein Skript hoch und er baut dir Karteikarten, Quiz und Lernplan.', 'With a free account you chat with Max, upload your slides and he builds flashcards, quizzes and a study plan.')),
      g,
      h('button', { class: 'm-rl-b', type: 'button', onclick: () => auth('register') }, L('Kostenloses Konto erstellen', 'Create a free account')),
      h('button', { class: 'm-rl-l', type: 'button', onclick: () => auth('login') }, L('Ich hab schon ein Konto', 'I already have an account')),
      h('small', {}, L('Tipp: Am Laptop meldest du dich genauso an – dort hast du Tafel und Chat nebeneinander.', 'Tip: sign in the same way on your laptop – board and chat side by side.'))));
  document.body.append(el);
}

const GOOGLE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

// Route weg vom Tutor-Raum → Sperre weg; Konto da → Sperre weg
addEventListener('hashchange', () => { if (!/^#\/app\/tutor/.test(location.hash)) unlockRoom(); });
import('./api.js').then(m => m.onAccount && m.onAccount(a => { if (a) unlockRoom(); })).catch(() => {});
