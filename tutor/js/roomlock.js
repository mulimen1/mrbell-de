// Tutor-Raum ohne Konto (Handy und Laptop): kurz sehen, was einen erwartet – nach einer Sekunde wird der Raum unscharf,
// darüber das kostenlose Konto (Google zuerst, falls eingerichtet). Oben rechts ein deutliches X: zurück dahin, wo man war.
// Max unten rechts auf Themenseiten bleibt frei – gesperrt wird nur der große Tutor-Raum.
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';
import { legalNote } from './legalnote.js';

const isPhone = () => matchMedia('(max-width: 600px)').matches;
let el = null, timer = 0;

let area = null;   // { t, s, re } – Sneak Peek eines anderen Bereichs (Bibliothek, Lernen, Klausur-Tools …)
export function lockRoom({ delay = 1000 } = {}) {
  clearTimeout(timer);
  if (getAccount()) return;
  area = null;
  timer = setTimeout(show, delay);
}
// Bereich kurz zeigen (nicht klickbar), dann unscharf + passendes Anmeldefenster – man bleibt im Bereich
export function lockArea(texts, { delay = 1400 } = {}) {
  clearTimeout(timer);
  if (getAccount()) return;
  if (el) { el.remove(); el = null; }
  area = Object.assign({ re: new RegExp('^' + location.hash.split('/').slice(0, 3).join('/').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }, texts);
  document.documentElement.classList.add('m-peek');
  timer = setTimeout(show, delay);
}
export function unlockRoom() {
  clearTimeout(timer);
  document.documentElement.classList.remove('m-rlock', 'm-peek');
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
  if (ok || getAccount()) { const wasArea = !!area; unlockRoom(); if (wasArea) dispatchEvent(new HashChangeEvent('hashchange')); }
}

function backLabel() {
  let th = ''; try { th = sessionStorage.getItem('tutor.lastTopic') || ''; } catch (e) {}
  return th && th !== 'BWL' ? L(`Zurück zu ${th}`, `Back to ${th}`) : L('Zurück', 'Back');
}
function tutorTitle() {
  let th = ''; try { th = sessionStorage.getItem('tutor.lastTopic') || ''; } catch (e) {}
  return th && th !== 'BWL' ? L(`Dein Tutor für ${th} wartet.`, `Your ${th} tutor is waiting.`) : L('Dein persönlicher Tutor wartet.', 'Your personal tutor is waiting.');
}
function show() {
  if (getAccount() || el) return;
  if (area) { if (!area.re.test(location.hash)) { area = null; document.documentElement.classList.remove('m-peek'); return; } }
  else {
  if (!/^#\/app\/tutor/.test(location.hash)) return;
  if (document.documentElement.classList.contains('m-boardpage')) return;   // Themenseite liegt oben – nicht sperren
  if (!isPhone() && document.querySelector('.asst.has-board:not(.board-min)')) return;   // Laptop: Themen-Einstieg mit Tafel bleibt frei
  if (!isPhone() && JSON.parse(localStorage.getItem('tutor.pendingAsk') || 'null')) return;
  }
  document.documentElement.classList.add('m-rlock');
  const g = h('div', { class: 'm-rl-gw' });
  import('./google.js').then(m => m.googleButton(g, r => { unlockRoom(); if (r.fresh) import('./welcome.js').then(w => w.welcomeFirst({ nr: +r.nr || 0 })).catch(() => {}); else import('./util.js').then(u => u.toast(L('Da bist du ja wieder.', 'There you are again.'), 3000)); })).catch(() => { g.hidden = true; });
  el = h('div', { class: 'm-rl', role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Kostenloses Konto', 'Free account') },
    h('button', { class: 'm-rl-x', type: 'button', 'aria-label': L('Schließen und zurück', 'Close and go back'), onclick: back }, h('span', { html: ico('x') })),
    h('div', { class: 'm-rl-card' },
      h('img', { class: 'm-rl-face', src: '/tutor/img/bm-fav-192.png?v=20', alt: '' }),
      h('h2', {}, area ? area.t : tutorTitle()),
      h('p', {}, area ? area.s : L('Mit kostenlosem Konto chattest du mit Max, lädst dein Skript hoch und er baut dir Karteikarten, Quiz und Lernplan.', 'With a free account you chat with Max, upload your slides and he builds flashcards, quizzes and a study plan.')),
      g,
      h('button', { class: 'm-rl-b', type: 'button', onclick: () => auth('register') }, L('Kostenloses Konto erstellen', 'Create a free account')),
      h('button', { class: 'm-rl-l', type: 'button', onclick: () => auth('login') }, L('Ich hab schon ein Konto', 'I already have an account')),
      h('a', { class: 'm-rl-bk', href: area && area.back ? area.back.href : '#', onclick: e => { e.preventDefault(); const bk = area && area.back; unlockRoom(); if (bk && bk.href) location.hash = bk.href; else back(); } }, h('span', { html: ico('left') }), area && area.back ? area.back.label : backLabel()),
      h('small', {}, isPhone() ? L('Tipp: Am Laptop meldest du dich genauso an – dort hast du Tafel und Chat nebeneinander.', 'Tip: sign in the same way on your laptop – board and chat side by side.') : L('Am Handy meldest du dich genauso an – Max ist überall dabei.', 'Sign in the same way on your phone – Max comes along everywhere.')), legalNote(true)));
  document.body.append(el);
}

const GOOGLE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

// Route weg vom Tutor-Raum → Sperre weg; Konto da → Sperre weg
addEventListener('hashchange', () => { if (area ? !area.re.test(location.hash) : !/^#\/app\/tutor/.test(location.hash)) unlockRoom(); });
import('./api.js').then(m => m.onAccount && m.onAccount(a => { if (a) unlockRoom(); })).catch(() => {});
