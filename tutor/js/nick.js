// Spitzname + Begrüßung nach dem Login: großer Max, „Guten Abend, Lea.“ und jedes Mal ein neuer Spruch.
import { h, ls } from './util.js';
import { face } from './face.js';
import { L } from './i18n.js';
import { getAccount, ask } from './api.js';

const KEY = 'tutor.nick';
const all = () => ls.get(KEY, {}) || {};
// Spitzname hängt am Konto (Server) – damit Max ihn auf jedem Gerät und im privaten Fenster kennt.
// Lokal nur als schneller Zwischenspeicher.
export function getNick(a = getAccount()) { if (!a) return ''; return all()[a.email] || a.nick || ''; }
export function setNick(nick, a = getAccount()) {
  if (!a) return; const m = all(); if (nick) m[a.email] = nick; else delete m[a.email]; ls.set(KEY, m);
  ask('setnick', { opts: { nick: nick || '' } }).catch(() => {});
}

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
// Feiertage (bundesweit + ein paar Klassiker). Ostern nach Gauß/Meeus.
function ostern(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
function feiertag(d = new Date()) {
  const y = d.getFullYear(), md = (d.getMonth() + 1) * 100 + d.getDate();
  const o = ostern(y), rel = n => { const x = new Date(o); x.setDate(o.getDate() + n); return (x.getMonth() + 1) * 100 + x.getDate(); };
  const F = { 101: 'neujahr', 214: 'valentin', 501: 'mai', 1003: 'einheit', 1031: 'halloween', 1224: 'heiligabend', 1225: 'weihnachten', 1226: 'weihnachten', 1231: 'silvester' };
  F[rel(-2)] = 'karfreitag'; F[rel(0)] = 'ostern'; F[rel(1)] = 'ostern'; F[rel(39)] = 'himmelfahrt'; F[rel(49)] = 'pfingsten'; F[rel(50)] = 'pfingsten';
  return F[md] || null;
}
// Kopfzeile: Tageszeit, an Feiertagen der Feiertag
export function gruss(d = new Date()) {
  const ft = feiertag(d);
  const FG = { neujahr: L('Frohes neues Jahr', 'Happy New Year'), ostern: L('Frohe Ostern', 'Happy Easter'), heiligabend: L('Frohe Weihnachten', 'Merry Christmas'), weihnachten: L('Frohe Weihnachten', 'Merry Christmas'), silvester: L('Guten Rutsch', 'Happy New Year’s Eve'), halloween: L('Happy Halloween', 'Happy Halloween') };
  if (ft && FG[ft]) return FG[ft];
  const hr = d.getHours();
  if (hr >= 5 && hr < 11) return L('Guten Morgen', 'Good morning');
  if (hr >= 11 && hr < 14) return L('Guten Mittag', 'Good afternoon');
  if (hr >= 14 && hr < 18) return L('Guten Tag', 'Good afternoon');
  if (hr >= 18 && hr < 23) return L('Guten Abend', 'Good evening');
  return L('Na, Nachteule', 'Hey, night owl');
}
// Begrüßung als natürlicher Satz – Name eingebaut statt „Na, Nachteule, Ben.“ (höchstens ein Komma)
// Gibt [davor, danach] zurück, damit die Begrüßung den Namen hervorheben kann; ohne Namen ein ganzer Satz.
export function hallo(nick, d = new Date()) {
  const ft = feiertag(d), hr = d.getHours();
  const FG = { neujahr: L('Frohes neues Jahr', 'Happy New Year'), ostern: L('Frohe Ostern', 'Happy Easter'), heiligabend: L('Frohe Weihnachten', 'Merry Christmas'), weihnachten: L('Frohe Weihnachten', 'Merry Christmas'), silvester: L('Guten Rutsch', 'Happy New Year’s Eve'), halloween: L('Happy Halloween', 'Happy Halloween') };
  const V = ft && FG[ft] ? [[FG[ft] + ', ', '!', FG[ft] + '!']]
    : hr >= 5 && hr < 11 ? [[L('Guten Morgen, ', 'Good morning, '), '.', L('Guten Morgen.', 'Good morning.')], [L('Moin ', 'Morning '), '!', L('Moin!', 'Morning!')], [L('Früh dran, ', '. Respekt.'), L('. Respekt.', '. Respect.'), L('Früh dran. Respekt.', 'Early start. Respect.')]]
    : hr >= 11 && hr < 14 ? [[L('Mahlzeit, ', 'Hey '), L('.', '.'), L('Mahlzeit.', 'Hey there.')], [L('Hey ', 'Hey '), '!', L('Hey!', 'Hey!')]]
    : hr >= 14 && hr < 18 ? [[L('Hey ', 'Hey '), '!', L('Hey!', 'Hey!')], [L('Da bist du ja, ', 'There you are, '), '.', L('Da bist du ja.', 'There you are.')]]
    : hr >= 18 && hr < 23 ? [[L('Guten Abend, ', 'Good evening, '), '.', L('Guten Abend.', 'Good evening.')], [L('N’Abend, ', 'Evening, '), '.', L('N’Abend.', 'Evening.')], [L('Feierabend-Lernen, ', 'After-hours studying, '), L('? Stark.', '? Strong.'), L('Feierabend-Lernen? Stark.', 'After-hours studying? Strong.')]]
    : [[L('Noch wach, ', 'Still up, '), '?', L('Noch wach?', 'Still up?')], [L('Hey ', 'Hey '), L(', du Nachteule.', ', you night owl.'), L('Hey, du Nachteule.', 'Hey, night owl.')], [L('Nachtschicht, ', 'Night shift, '), '?', L('Nachtschicht?', 'Night shift?')]];
  const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  const v = V[(doy + hr) % V.length];
  return nick ? [v[0], v[1]] : [v[2], ''];
}
export const halloText = (nick, d) => { const [a, b] = hallo(nick, d); return nick ? a + nick + b : a; };

// Sprüche: frech, aber entspannt. Erst Anlass (Feiertag, Wochentag, Tageszeit), sonst allgemein.
const S = (de, en) => L(de, en);
const POOL = {
  allg: () => [
    S('Schön, dich zu sehen. Fast so schön wie mein Spiegelbild.', 'Good to see you. Almost as good as my reflection.'),
    S('Dein Lernstand hat dich vermisst. Ich ein bisschen auch.', 'Your progress missed you. I did a little too.'),
    S('Kaffee steht, Tafel ist geputzt, Mittelscheitel sitzt.', 'Coffee’s ready, board’s clean, middle part is perfect.'),
    S('Die Klausur weiß noch nicht, was auf sie zukommt.', 'The exam has no idea what’s coming.'),
    S('Ich hab extra den Porsche stehen lassen. Für dich.', 'I left the Porsche at home. For you.'),
    S('Main-Character-Energie erkannt. Weiter so.', 'Main character energy detected. Keep it up.'),
    S('Wieder da? Du hast offensichtlich Geschmack.', 'Back again? You clearly have taste.'),
    S('Deine Karteikarten haben schon nach dir gefragt.', 'Your flashcards were asking about you.'),
    S('Sylt kann warten. Erst die Bilanz, dann der Strand.', 'Sylt can wait. Balance sheet first, beach later.'),
    S('Du bist auf einem guten Weg. Ich sag das nicht zu jedem.', 'You’re on a good path. I don’t say that to everyone.'),
    S('Kurz reinschauen zählt auch. Sagt die Statistik. Meine.', 'Just popping in counts too. Says the data. Mine.'),
    S('Einmal tief durchatmen. Dann Soll an Haben.', 'Deep breath. Then debit to credit.'),
    S('Ich hab dir einen Platz an der Tafel freigehalten.', 'I saved you a spot at the whiteboard.'),
    S('Kleine Schritte. Große Noten.', 'Small steps. Big grades.'),
  ],
  morgen: () => [
    S('Früh dran. Die Konkurrenz schläft noch.', 'Early bird. The competition’s still asleep.'),
    S('Erst Kaffee, dann Kostenrechnung. In der Reihenfolge.', 'Coffee first, then cost accounting. In that order.'),
    S('Morgens lernen ist wie Zinseszins. Zahlt sich später aus.', 'Studying in the morning is like compound interest. Pays off later.'),
  ],
  mittag: () => [
    S('Mittagspause mit Lernen? Ambitioniert. Gefällt mir.', 'Studying over lunch? Ambitious. I like it.'),
    S('Kurz was mitnehmen, dann ab in die Mensa.', 'Grab something quick, then off to the canteen.'),
  ],
  nachmittag: () => [
    S('Nachmittagstief? Nicht mit mir.', 'Afternoon slump? Not on my watch.'),
    S('Perfekte Zeit für ein paar Karten zwischendurch.', 'Perfect time for a few flashcards.'),
  ],
  abend: () => [
    S('Feierabend für die anderen. Lernabend für uns.', 'Evening off for everyone else. Study evening for us.'),
    S('Ein Kapitel noch, dann Netflix. Abgemacht?', 'One more chapter, then Netflix. Deal?'),
    S('Abends lernen, morgens klüger aufwachen. So der Plan.', 'Study tonight, wake up smarter. That’s the plan.'),
  ],
  nacht: () => [
    S('Es ist spät. Aber gut, ich bin auch noch wach.', 'It’s late. But fine, I’m up too.'),
    S('Nachtschicht? Nicht zu lang, ja? Schlaf ist auch Lernen.', 'Night shift? Not too long, okay? Sleep is studying too.'),
  ],
  montag: () => [
    S('Neue Woche, neues Glück. Und neue Karteikarten.', 'New week, new luck. And new flashcards.'),
    S('Guter Start in die Woche. Ich glaub an dich – meistens.', 'Have a good start to the week. I believe in you – mostly.'),
    S('Montag. Wir machen das Beste draus.', 'Monday. Let’s make the best of it.'),
  ],
  freitag: () => [
    S('Fast Wochenende. Erst noch kurz klug werden.', 'Almost the weekend. Just get a bit smarter first.'),
    S('Freitag und du lernst? Respekt. Ehrlich.', 'Friday and you’re studying? Respect. Honestly.'),
  ],
  wochenende: () => [
    S('Lernen am Wochenende? Ich sag’s keinem.', 'Studying on the weekend? I won’t tell anyone.'),
    S('Wochenende. Kurz was schaffen, dann frei. Klingt fair.', 'Weekend. Get a bit done, then off. Sounds fair.'),
  ],
  neujahr: () => [S('Neues Jahr, neue Vorsätze. Fangen wir mit einem an.', 'New year, new resolutions. Let’s start with one.')],
  valentin: () => [S('Valentinstag. Ich bring keine Blumen, aber Karteikarten.', 'Valentine’s Day. No flowers, but flashcards.')],
  mai: () => [S('Tag der Arbeit. Heute ganz entspannt.', 'Labour Day. Nice and easy today.')],
  einheit: () => [S('Tag der Deutschen Einheit. Soll und Haben vereint.', 'German Unity Day. Debit and credit, united.')],
  halloween: () => [S('Das Gruseligste heute? Deine Klausurtermine. Keine Sorge, wir machen das.', 'The scariest thing today? Your exam dates. Don’t worry, we’ve got this.')],
  heiligabend: () => [S('Heiligabend. Ich hoffe, du lernst nur zwischen Bescherung und Essen.', 'Christmas Eve. Hopefully only between presents and dinner.')],
  weihnachten: () => [S('Frohe Weihnachten! Die Bilanz kann heute auch mal warten.', 'Merry Christmas! The balance sheet can wait today.')],
  silvester: () => [S('Letzter Tag im Jahr. Wenigstens die Karteikarten sind fällig – sonst nichts.', 'Last day of the year. Only the flashcards are due – nothing else.')],
  karfreitag: () => [S('Feiertag. Ruhig angehen lassen.', 'Public holiday. Take it easy.')],
  ostern: () => [S('Frohe Ostern! Die Klausurtermine sind besser versteckt als jedes Ei.', 'Happy Easter! Your exam dates are hidden better than any egg.')],
  himmelfahrt: () => [S('Feiertag. Wer lernt, hat heute schon gewonnen.', 'Public holiday. Studying today already counts as winning.')],
  pfingsten: () => [S('Pfingsten. Langes Wochenende – ein bisschen was geht trotzdem.', 'Whitsun. Long weekend – a little something still works.')],
};
export function nextSpruch(d = new Date()) {
  const hist = ls.get('tutor.greetHist', []) || [];
  const hr = d.getHours(), wd = d.getDay(), ft = feiertag(d);
  const zeit = hr >= 5 && hr < 11 ? 'morgen' : hr < 14 && hr >= 11 ? 'mittag' : hr >= 14 && hr < 18 ? 'nachmittag' : hr >= 18 && hr < 23 ? 'abend' : 'nacht';
  const tag = wd === 1 && hr < 18 ? 'montag' : wd === 5 && hr >= 12 ? 'freitag' : wd === 0 || wd === 6 ? 'wochenende' : null;
  // Feiertag zuerst, dann meist (60 %) der Anlass, sonst allgemein
  const order = ft ? [ft, tag, zeit, 'allg'] : Math.random() < .6 ? [tag, zeit, 'allg'] : ['allg', tag, zeit];
  for (const key of order.filter(Boolean)) {
    const fresh = POOL[key]().filter(x => !hist.includes(x));
    if (fresh.length) { const x = fresh[Math.floor(Math.random() * fresh.length)]; ls.set('tutor.greetHist', [x, ...hist].slice(0, 12)); return x; }
  }
  const all = POOL.allg(); return all[Math.floor(Math.random() * all.length)];
}

let showing = false;
// Große Begrüßung – danach fliegt Max an seinen Platz: in den Tutor-Raum (großer Kopf) oder nach unten rechts
export function greetSplash(nick = getNick(), force = false) {
  if (showing || document.querySelector('.ngreet')) return;
  // Begrüßung mit Lernserie höchstens einmal am Tag – egal ob neuer Tab, Neuanmeldung oder Login
  const today = new Date().toLocaleDateString('sv-SE');
  if (ls.get('tutor.greetDay', '') === today && !force) return;
  ls.set('tutor.greetDay', today);
  showing = true;
  ls.set('tutor.greetLast', Date.now());
  try { sessionStorage.setItem('tutor.justGreeted', String(Date.now())); } catch (e) {}
  const fEl = h('div', { class: 'ng-face' });
  const line = h('p', { class: 'ng-line' }, nextSpruch());
  // Lernserie: zählt ab dem ersten Tag, heute zählt mit (wer in der App ist, lernt)
  const sk = h('div', { class: 'ng-streak', hidden: true });
  Promise.all([import('./me.js'), import('./state.js')]).then(([M, St]) => {
    const days = M.activityDays(St.S.list || []); days[M.dayKey()] = days[M.dayKey()] || 1;
    const n = Math.max(1, M.streak(days));
    const num = h('b', { class: 'ng-sn' }, String(Math.max(0, n - 1)));
    const txt = n === 1 ? L('Tag 1. Ab heute zählt jeder Tag.', 'Day 1. From today, every day counts.')
      : n >= 30 ? L(`${n} Tage am Stück. Langsam wirst du mir unheimlich.`, `${n} days in a row. You’re starting to scare me.`)
        : n >= 7 ? L(`${n} Tage am Stück. Langsam wirst du mir ähnlich.`, `${n} days in a row. You’re becoming more like me.`)
          : L(`${n} Tage am Stück. Nicht nachlassen.`, `${n} days in a row. Don’t slack now.`);
    sk.replaceChildren(h('div', { class: 'ng-sk' }, num, h('span', {}, n === 1 ? L('Tag', 'day') : L('Tage Serie', 'day streak'))), h('small', {}, txt));
    sk.hidden = false;
    setTimeout(() => { num.textContent = String(n); num.classList.add('pop'); }, 1150);
  }).catch(() => {});
  const el = h('div', { class: 'ngreet', role: 'dialog', 'aria-label': L('Begrüßung', 'Welcome') },
    h('div', { class: 'ng-in' }, fEl, h('h2', { class: 'ng-hey' }, ...(() => { const [a, b] = hallo(nick); return nick ? [a, h('span', { class: 'ng-nick' }, nick), b] : [a]; })()), sk, line,
      h('div', { class: 'ng-skip' }, L('Antippen, um direkt loszulegen', 'Tap to jump right in'))));
  document.body.appendChild(el);
  import('./flight.js').then(F => F.hideDock()).catch(() => {});
  const fc = face(fEl, {});
  setTimeout(() => fc.pulse && fc.pulse('smug', 1400), 900);
  let done = false;
  const close = () => {
    if (done) return; done = true; clearTimeout(auto);
    const r = fEl.getBoundingClientRect();
    el.classList.add('out');
    import('./flight.js').then(F => { fEl.style.visibility = 'hidden'; return F.dockTo(r, { dur: 1100, arc: .16 }); }).catch(() => {});
    setTimeout(() => { el.remove(); showing = false; }, 560);
  };
  const auto = setTimeout(close, 4200);
  el.addEventListener('click', close);
  addEventListener('keydown', function k(e) { if (e.key === 'Escape' || e.key === 'Enter') { removeEventListener('keydown', k); close(); } });
  requestAnimationFrame(() => el.classList.add('in'));
}
// Jedes Mal, wenn BWL Max richtig startet (neuer Tab / App geöffnet) – nicht beim Neuladen im selben Tab
// und nicht beim Wechseln innerhalb der App. sessionStorage gilt genau pro Tab.
export function greetOnLoad() {
  const a = getAccount(); if (!a) return;
  let t = 0; try { t = +sessionStorage.getItem('tutor.greetAt') || 0; } catch (e) {}
  if (t) return;
  // Begrüßung mit Lernserie nur beim ersten Öffnen am Tag – danach steht die Serie nur noch klein oben im Tutor
  if (ls.get('tutor.greetDay', '') === new Date().toLocaleDateString('sv-SE')) return;
  try { sessionStorage.setItem('tutor.greetAt', String(Date.now())); } catch (e) {}
  setTimeout(() => greetSplash(getNick(a)), 500);
}
