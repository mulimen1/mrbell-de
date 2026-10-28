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
    S('Kaffee steht, Tafel ist geputzt, Mittelscheitel sitzt. Fehlst nur noch du – mit Konzentration.', 'Coffee’s ready, board’s clean, middle part is perfect. Only thing missing is you – focused.'),
    S('Die Klausur weiß noch nicht, was auf sie zukommt. Du übrigens auch nicht.', 'The exam has no idea what’s coming. Neither do you, by the way.'),
    S('Ich hab extra den Porsche stehen lassen. Enttäusch mich nicht.', 'I left the Porsche at home for this. Don’t disappoint me.'),
    S('Wieder da? Gut. Durchfallen steht dir nämlich nicht.', 'Back again? Good. Failing really isn’t your look.'),
    S('Deine Karteikarten haben nach dir gefragt. Ich hab gesagt, du chillst lieber.', 'Your flashcards asked about you. I told them you’d rather chill.'),
    S('Sylt kann warten. Erst die Bilanz, dann der Strand. Bei dir eher: erst die Bilanz, dann noch mal die Bilanz.', 'Sylt can wait. Balance sheet first, beach later. For you: balance sheet, then the balance sheet again.'),
    S('Lock in. Ich erklär’s nur einmal. Okay, zweimal. Aber dann ist Schluss.', 'Lock in. I’ll explain it once. Fine, twice. Then that’s it.'),
    S('Ausreden nehm ich keine an. Karteikarten schon.', 'I don’t accept excuses. Flashcards, yes.'),
    S('Kleine Schritte. Große Noten. Kein Gejammer.', 'Small steps. Big grades. No whining.'),
    S('Ich hab dir einen Platz an der Tafel freigehalten. Erste Reihe – damit ich dich im Blick hab.', 'I saved you a spot at the board. Front row – so I can keep an eye on you.'),
  ],
  morgen: () => [
    S('Früh dran. Die Konkurrenz schläft noch – nutz das aus.', 'Early bird. The competition’s still asleep – use it.'),
    S('Erst Kaffee, dann Kostenrechnung. Und nicht umgekehrt, ich kenn dich.', 'Coffee first, then cost accounting. Not the other way round, I know you.'),
    S('Morgens lernen ist wie Zinseszins. Ausschlafen ist wie Dispo.', 'Studying in the morning is like compound interest. Sleeping in is like an overdraft.'),
  ],
  mittag: () => [
    S('Mittagspause mit Lernen? Ambitioniert. Ich bin fast stolz.', 'Studying over lunch? Ambitious. I’m almost proud.'),
    S('Kurz was mitnehmen, dann ab in die Mensa. Die Bilanz läuft dir nicht weg – deine Note schon.', 'Grab something quick, then off to the canteen. The balance sheet won’t run – your grade will.'),
  ],
  nachmittag: () => [
    S('Nachmittagstief? Nicht mit mir. Hinsetzen.', 'Afternoon slump? Not on my watch. Sit down.'),
    S('Perfekte Zeit für ein paar Karten. TikTok kann warten, ehrlich.', 'Perfect time for a few flashcards. TikTok can wait, seriously.'),
  ],
  abend: () => [
    S('Feierabend für die anderen. Lernabend für uns. Die anderen fallen durch.', 'Evening off for everyone else. Study evening for us. The others fail.'),
    S('Ein Kapitel noch, dann Netflix. Abgemacht? Ich kontrollier das.', 'One more chapter, then Netflix. Deal? I’ll check.'),
    S('Abends lernen, morgens klüger aufwachen. Oder dumm bleiben. Deine Wahl.', 'Study tonight, wake up smarter. Or stay clueless. Your call.'),
  ],
  nacht: () => [
    S('Es ist spät. Aber gut, ich bin auch noch wach. Panik oder Disziplin?', 'It’s late. Fine, I’m up too. Panic or discipline?'),
    S('Nachtschicht? Respekt. Morgen aber bitte früher anfangen, Champion.', 'Night shift? Respect. Start earlier tomorrow though, champ.'),
  ],
  montag: () => [
    S('Neue Woche. Letzte Woche war nichts, also jetzt richtig.', 'New week. Last week was nothing, so now for real.'),
    S('Guter Start in die Woche. Ich glaub an dich – meistens.', 'Good start to the week. I believe in you – mostly.'),
    S('Montag. Jammern bringt keine Punkte.', 'Monday. Whining doesn’t earn points.'),
  ],
  freitag: () => [
    S('Fast Wochenende. Erst noch kurz klug werden, dann darfst du feiern.', 'Almost the weekend. Get smart first, then you can party.'),
    S('Freitag und du lernst? Respekt. Ehrlich. Ich bin schockiert.', 'Friday and you’re studying? Respect. Honestly. I’m shocked.'),
  ],
  wochenende: () => [
    S('Lernen am Wochenende? Ich sag’s keinem. Deinen Freunden schon gar nicht.', 'Studying on the weekend? I won’t tell anyone. Especially not your friends.'),
    S('Wochenende. Kurz was schaffen, dann frei. Kurz heißt nicht fünf Minuten.', 'Weekend. Get a bit done, then off. A bit doesn’t mean five minutes.'),
  ],
  neujahr: () => [S('Neues Jahr, neue Vorsätze. Diesmal hältst du einen. Ich pass auf.', 'New year, new resolutions. This time you keep one. I’m watching.')],
  valentin: () => [S('Valentinstag. Ich bring keine Blumen, aber Karteikarten. Romantischer wird’s für dich heute eh nicht.', 'Valentine’s Day. No flowers, but flashcards. It won’t get more romantic for you today anyway.')],
  mai: () => [S('Tag der Arbeit. Heißt: Du arbeitest. Ich schau zu.', 'Labour Day. Meaning: you work. I watch.')],
  einheit: () => [S('Tag der Deutschen Einheit. Soll und Haben vereint. Deine Noten noch nicht.', 'German Unity Day. Debit and credit, united. Your grades, not yet.')],
  halloween: () => [S('Das Gruseligste heute? Deine Klausurtermine. Und dein Lernstand.', 'The scariest thing today? Your exam dates. And your progress.')],
  heiligabend: () => [S('Heiligabend. Lern zwischen Bescherung und Essen – die Klausur bringt dir kein Geschenk.', 'Christmas Eve. Study between presents and dinner – the exam won’t bring you a gift.')],
  weihnachten: () => [S('Frohe Weihnachten! Die Bilanz kann heute warten. Morgen nicht.', 'Merry Christmas! The balance sheet can wait today. Not tomorrow.')],
  silvester: () => [S('Letzter Tag im Jahr. Wenigstens die Karteikarten sind fällig – im Gegensatz zu deinen Vorsätzen.', 'Last day of the year. At least the flashcards are due – unlike your resolutions.')],
  karfreitag: () => [S('Feiertag. Ruhig angehen lassen. Aber angehen.', 'Public holiday. Take it easy. But take it.')],
  ostern: () => [S('Frohe Ostern! Deine Klausurtermine sind besser versteckt als jedes Ei. Such sie lieber jetzt.', 'Happy Easter! Your exam dates are hidden better than any egg. Find them now.')],
  himmelfahrt: () => [S('Feiertag. Wer heute lernt, lacht in der Klausur. Die anderen nicht.', 'Public holiday. Study today, laugh in the exam. The others won’t.')],
  pfingsten: () => [S('Pfingsten. Langes Wochenende – ein bisschen was geht trotzdem. Keine Diskussion.', 'Whitsun. Long weekend – a little something still works. No discussion.')],
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
    const num = h('b', { class: 'ng-sn' }, String(n === 1 ? 1 : n - 1));   // Tag 1: gleich die 1, kein „0 Tage“
    const txt = n === 1 ? L('Tag 1. Ab heute zählt jeder Tag.', 'Day 1. From today, every day counts.')
      : n >= 30 ? L(`${n} Tage am Stück. Langsam wirst du mir unheimlich.`, `${n} days in a row. You’re starting to scare me.`)
        : n >= 7 ? L(`${n} Tage am Stück. Langsam wirst du mir ähnlich.`, `${n} days in a row. You’re becoming more like me.`)
          : L(`${n} Tage am Stück. Nicht nachlassen.`, `${n} days in a row. Don’t slack now.`);
    sk.replaceChildren(h('div', { class: 'ng-sk' }, num, h('span', {}, n === 1 ? L('Tag', 'day') : L('Tage Serie', 'day streak'))), h('small', {}, txt));
    sk.hidden = false;
    if (n > 1) setTimeout(() => { num.textContent = String(n); num.classList.add('pop'); }, 1150);
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
