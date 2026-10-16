// Spitzname + Begrüßung nach dem Login: großer Max, „Guten Abend, Lea.“ und jedes Mal ein neuer Spruch.
import { h, ls } from './util.js';
import { face } from './face.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';

const KEY = 'tutor.nick';
const all = () => ls.get(KEY, {}) || {};
export function getNick(a = getAccount()) { if (!a) return ''; return all()[a.email] || ''; }
export function setNick(nick, a = getAccount()) { if (!a) return; const m = all(); if (nick) m[a.email] = nick; else delete m[a.email]; ls.set(KEY, m); }

// ---------- Prüfung: fiktive/witzige Namen ja – beleidigend, sexuell, rassistisch nein ----------
const BAD = ['fick', 'fuck', 'fotze', 'votze', 'muschi', 'pussy', 'schwanz', 'penis', 'pimmel', 'dick', 'cock', 'vagina', 'titte', 'titt', 'boob', 'tits', 'sex', 'sexy', 'porn', 'porno', 'nackt', 'nude', 'anal', 'blowjob', 'bj', 'cum', 'sperma', 'wichs', 'wank', 'orgas', 'horny', 'geil', 'milf', 'dildo', 'hure', 'nutte', 'whore', 'slut', 'schlampe', 'bitch', 'hoe',
  'arsch', 'arschloch', 'asshole', 'ass', 'wixer', 'wichser', 'missgeburt', 'spast', 'spasti', 'behindert', 'retard', 'mongo', 'idiot', 'hurensohn', 'motherfucker', 'bastard', 'cunt', 'twat', 'kacke', 'scheiss', 'scheis', 'shit', 'piss', 'opfer', 'loser', 'depp', 'trottel', 'vollpfosten',
  'nigg', 'neger', 'negro', 'kanake', 'kanacke', 'kanak', 'zigeuner', 'gypsy', 'chink', 'kike', 'paki', 'spic', 'wetback', 'schlitzauge', 'kameltreiber', 'polacke', 'tunte', 'schwuchtel', 'faggot', 'fag', 'dyke', 'tranny', 'transe',
  'hitler', 'nazi', 'adolf', 'heil', 'sieg', 'ss', 'kkk', 'judensau', 'holocaust', 'auschwitz', '1488', '88', 'isis', 'taliban', 'terror', 'kill', 'tot', 'mord', 'rape', 'vergewalt', 'pedo', 'pädo', 'kinderf'];
const SHORT = new Set(['ss', 'bj', 'cum', 'ass', 'hoe', 'fag', 'tot', 'sex', 'kkk', '88', 'dick', 'heil', 'sieg', 'anal', 'piss', 'opfer', 'adolf', 'kill', 'mord', 'paki', 'spic', 'kike', 'chink', 'gypsy', 'mongo', 'tits', 'boob', 'nude', 'geil', 'idiot', 'depp', 'loser', 'terror']); // nur als ganzes Wort
function norm(s) { return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/@/g, 'a').replace(/\$/g, 's').replace(/€/g, 'e'); }
export function checkNick(raw) {
  const s = String(raw || '').replace(/\s+/g, ' ').trim();
  if (s.length < 2) return { ok: false, msg: L('Mindestens 2 Zeichen, bitte.', 'At least 2 characters, please.') };
  if (s.length > 20) return { ok: false, msg: L('Maximal 20 Zeichen – kurz und knackig.', '20 characters max – short and sweet.') };
  if (!/^[\p{L}\p{N} ._'’-]+$/u.test(s)) return { ok: false, msg: L('Nur Buchstaben, Zahlen, Leerzeichen, Punkt und Bindestrich.', 'Only letters, numbers, spaces, dots and hyphens.') };
  const n = norm(s), glued = n.replace(/[^a-z0-9]/g, ''), words = n.split(/[^a-z0-9]+/).filter(Boolean);
  for (const b of BAD) { if (SHORT.has(b) ? words.includes(b) : glued.includes(b)) return { ok: false, msg: L('Netter Versuch. Such dir was ohne Beleidigung oder Schweinkram aus.', 'Nice try. Pick something without insults or anything dirty.') }; }
  return { ok: true, nick: s };
}

// Eingabefeld (fürs Login-Fenster und die Kontoeinstellungen)
export function nickField(initial = '') {
  const inp = h('input', { class: 'field', maxlength: 20, autocomplete: 'nickname', placeholder: L('z. B. Lea, Ben oder Captain Bilanz', 'e.g. Lea, Ben or Captain Balance'), value: initial, 'aria-label': L('Spitzname', 'Nickname') });
  const err = h('div', { class: 'lerr', role: 'alert' });
  inp.addEventListener('input', () => { err.textContent = ''; inp.classList.remove('bad'); });
  const el = h('label', { class: 'nickf' }, h('b', {}, L('Wie soll Max dich nennen?', 'What should Max call you?')), inp, err);
  return { el, inp, value() { const v = inp.value.trim(); if (!v) return { ok: true, nick: '' }; const r = checkNick(v); if (!r.ok) { err.textContent = r.msg; inp.classList.add('bad'); inp.focus(); } return r; } };
}

// ---------- Begrüßung ----------
function gruss(d = new Date()) {
  const hr = d.getHours();
  if (hr >= 5 && hr < 11) return L('Guten Morgen', 'Good morning');
  if (hr >= 11 && hr < 14) return L('Guten Mittag', 'Good afternoon');
  if (hr >= 14 && hr < 18) return L('Guten Tag', 'Good afternoon');
  if (hr >= 18 && hr < 23) return L('Guten Abend', 'Good evening');
  return L('Na, Nachteule', 'Hey, night owl');
}
const SPRUCH = L([
  'Schön, dich zu sehen. Fast so schön wie mein Spiegelbild.',
  'Dein Lernstand hat dich vermisst. Ich ein bisschen auch.',
  'Heute wird gelernt. Danach gönnen wir uns einen Aperol.',
  'Kaffee steht, Tafel ist geputzt, Mittelscheitel sitzt. Los geht’s.',
  'Du bist pünktlich. Papa wäre stolz – auf dich, nicht auf mich.',
  'Die Klausur weiß noch nicht, was auf sie zukommt.',
  'Ich hab extra den Porsche stehen lassen. Für dich.',
  'Heute machen wir aus Stoff Wissen. Und aus Wissen eine 1,0.',
  'Main-Character-Energie erkannt. Weiter so.',
  'Wieder da? Du hast offensichtlich Geschmack.',
  'Lass uns kurz die Welt der BWL erobern. Danach Mittagspause.',
  'Deine Karteikarten haben schon nach dir gefragt.',
  'Ich hab heute gute Laune. Liegt bestimmt an dir.',
  'Sylt kann warten. Erst die Bilanz, dann der Strand.',
], [
  'Good to see you. Almost as good as my reflection.',
  'Your progress missed you. I did a little too.',
  'Studying first. Aperol afterwards.',
  'Coffee’s ready, board’s clean, middle part is perfect. Let’s go.',
  'Right on time. Dad would be proud – of you, not me.',
  'The exam has no idea what’s coming.',
  'I left the Porsche at home. For you.',
  'Today we turn notes into knowledge. And knowledge into an A.',
  'Main character energy detected. Keep it up.',
  'Back again? You clearly have taste.',
  'Let’s conquer business studies real quick. Then lunch.',
  'Your flashcards were asking about you.',
  'I’m in a great mood today. Probably because of you.',
  'Sylt can wait. Balance sheet first, beach later.',
]);
function nextSpruch() { const last = ls.get('tutor.greetLast', -1); let i; do i = Math.floor(Math.random() * SPRUCH.length); while (i === last && SPRUCH.length > 1); ls.set('tutor.greetLast', i); return SPRUCH[i]; }

let showing = false;
export function greetSplash(nick = getNick()) {
  if (!nick || showing || document.querySelector('.ngreet')) return;
  showing = true;
  const fEl = h('div', { class: 'ng-face' });
  const line = h('p', { class: 'ng-line' }, nextSpruch());
  const el = h('div', { class: 'ngreet', role: 'dialog', 'aria-label': L('Begrüßung', 'Welcome') },
    h('div', { class: 'ng-in' }, fEl, h('h2', { class: 'ng-hey' }, gruss() + ', ', h('span', { class: 'ng-nick' }, nick), '.'), line,
      h('button', { class: 'btn primary ng-go', type: 'button' }, L('Los geht’s', 'Let’s go'))));
  document.body.appendChild(el);
  const fc = face(fEl, {}); fc.set('happy');
  setTimeout(() => fc.pulse && fc.pulse('smug', 1400), 900);
  let done = false;
  const close = () => { if (done) return; done = true; el.classList.add('out'); setTimeout(() => { el.remove(); showing = false; }, 520); };
  el.addEventListener('click', close);
  addEventListener('keydown', function k(e) { if (e.key === 'Escape' || e.key === 'Enter') { removeEventListener('keydown', k); close(); } });
  setTimeout(close, 5200);
  requestAnimationFrame(() => el.classList.add('in'));
}
// Beim Laden der Seite: angemeldet + Spitzname → begrüßen (nicht öfter als alle 2 Minuten)
export function greetOnLoad() {
  const a = getAccount(), n = getNick(a); if (!a || !n) return;
  let t = 0; try { t = +sessionStorage.getItem('tutor.greetAt') || 0; } catch (e) {}
  if (Date.now() - t < 120000) return;
  try { sessionStorage.setItem('tutor.greetAt', String(Date.now())); } catch (e) {}
  setTimeout(() => greetSplash(n), 700);
}
