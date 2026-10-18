// BWL-Duell: 1 gegen 1 per Link, drei Runden wie beim Quizduell. Fragen kommen aus dem festen BWL-Pool (keine KI-Kosten).
// Ablauf: Du wählst ein Thema und spielst 3 Fragen → Link schicken → Gegner spielt deine Runde, wählt die nächste … → nach 3 Runden steht der Sieger fest.
import { h, ico, ls, toast, haptic } from './util.js';
import { L, EN } from './i18n.js';
import { getNick } from './nick.js';
import { face } from './face.js';
import { BANK as B1, FACH } from './challenge-bank.js';
import { BANK2 } from './challenge-bank2.js';

const BANK = [...B1, ...BANK2];
const URL_ = window.TUTOR_DUELL || 'https://hub.mrbell.de/n8n/webhook/tutor-duell-3f9a1c';
const KEY = 'tutor.duelle', NAME = 'tutor.duellName', SECS = 20;
const T = p => (EN ? p[1] : p[0]);
const pick = a => a[Math.floor(Math.random() * a.length)];
const track = (e, d) => { try { window.BM && window.BM.track(e, d || ''); } catch (x) {} };

// ---------- Server ----------
async function call(op, b = {}) {
  let r, j = null;
  try { r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op, ...b }) }); }
  catch (e) { throw new Error(L('Keine Verbindung. Prüf dein Internet und versuch es nochmal.', 'No connection. Check your internet and try again.')); }
  try { j = await r.json(); } catch (e) {}
  if (!j) throw new Error(L('Das Duell ist gerade nicht erreichbar. Versuch es gleich nochmal.', 'The duel is unavailable right now. Try again shortly.'));
  if (!j.ok) throw Object.assign(new Error(j.message || L('Das hat nicht geklappt.', 'That didn’t work.')), { code: j.error });
  return j;
}
// ---------- Eigene Duelle (nur in diesem Browser) ----------
const store = () => ls.get(KEY, {}) || {};
function remember(code, patch) { const all = store(); all[code] = Object.assign({ t: Date.now() }, all[code] || {}, patch, { u: Date.now() }); const ks = Object.keys(all).sort((a, b) => (all[b].u || 0) - (all[a].u || 0)).slice(0, 30); const o = {}; ks.forEach(k => o[k] = all[k]); ls.set(KEY, o); }
const myName = () => getNick() || ls.get(NAME, '') || '';
const link = code => location.origin + location.pathname + '#/app/duell/' + code;

// ---------- kleine Bausteine ----------
const avatar = (n, me) => h('span', { class: 'du-av' + (me ? ' me' : '') }, (n || '?').trim().charAt(0).toUpperCase() || '?');
const fachName = f => (FACH[f] ? T(FACH[f]) : f);
const ordOf = (code, id) => { let s = 0; for (const c of code + ':' + id) s = (s * 31 + c.charCodeAt(0)) >>> 0; const a = [0, 1, 2, 3]; for (let i = 3; i > 0; i--) { s = (s * 1103515245 + 12345) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function nameInput(onEnter) {
  const inp = h('input', { class: 'du-name', type: 'text', maxlength: '20', autocomplete: 'nickname', placeholder: L('Dein Name', 'Your name'), value: myName() });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') onEnter(); });
  return inp;
}
const btnBusy = (b, on) => { b.disabled = on; b.classList.toggle('busy', on); };

// Teilen: System-Teilen, sonst WhatsApp + Link kopieren
function shareRow(code, myN, big) {
  const url = link(code), text = L(`${myN || 'Ich'} fordert dich zum BWL-Duell heraus. Drei Runden – wer weiß mehr?`, `${myN || 'I'} challenge you to a business duel. Three rounds – who knows more?`);
  const CLIP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
  const OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const lbl = h('span', {}, L('Kopieren', 'Copy')), icn = h('span', { class: 'du-ci', html: CLIP });
  const cbtn = h('button', { class: 'du-cbtn', type: 'button', onclick: () => copy() }, icn, lbl);
  const urlEl = h('span', { class: 'du-url', title: url }, url.replace(/^https?:\/\/(www\.)?/, ''));
  const box = h('div', { class: 'du-link', onclick: e => { if (e.target !== cbtn && !cbtn.contains(e.target)) copy(); } }, h('span', { class: 'du-li-ic', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>' }), urlEl, cbtn);
  let rt = 0;
  async function copy() {
    let ok = true; try { await navigator.clipboard.writeText(text + ' ' + url); } catch (e) { ok = false; }
    if (!ok) { try { const r = document.createRange(); r.selectNodeContents(urlEl); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); ok = document.execCommand('copy'); } catch (e) {} }
    if (!ok) { prompt(L('Link kopieren:', 'Copy link:'), url); return; }
    haptic('ok'); track('Duell', 'Link kopiert');
    box.classList.remove('done'); void box.offsetWidth; box.classList.add('done'); icn.innerHTML = OK; lbl.textContent = L('Kopiert', 'Copied');
    toast(L('Link kopiert. Ab in die Lerngruppe damit.', 'Link copied. Drop it in your study group.'));
    clearTimeout(rt); rt = setTimeout(() => { box.classList.remove('done'); icn.innerHTML = CLIP; lbl.textContent = L('Kopieren', 'Copy'); }, 2200);
  }
  const sys = async () => { try { await navigator.share({ title: 'BWL-Duell', text, url }); track('Duell', 'Geteilt'); } catch (e) {} };
  return h('div', { class: 'du-share' + (big ? ' big' : '') },
    navigator.share ? h('button', { class: 'btn primary', type: 'button', onclick: sys }, h('span', { html: ico('send') }), L('Herausforderung schicken', 'Send challenge')) : null,
    h('a', { class: 'btn' + (navigator.share ? '' : ' primary'), href: 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), target: '_blank', rel: 'noopener', onclick: () => track('Duell', 'WhatsApp') }, 'WhatsApp'),
    box);
}

// ---------- Einstieg ----------
export function renderDuell(root, { code = '' } = {}) {
  const wrap = h('div', { class: 'du view-in' }); root.replaceChildren(wrap);
  const ctx = { wrap, timers: new Set(), alive: true };
  const cleanup = () => { ctx.alive = false; ctx.timers.forEach(t => clearInterval(t)); ctx.timers.clear(); };
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  if (code) openDuel(ctx, code); else lobby(ctx);
  return cleanup;
}

// ---------- Lobby: neues Duell + meine Duelle ----------
function lobby(ctx) {
  const { wrap } = ctx;
  const fEl = h('div', { class: 'du-face' });
  const err = h('p', { class: 'du-err' });
  let inp;
  const go = h('button', { class: 'btn primary lg', type: 'button', onclick: () => start() }, L('Duell starten', 'Start duel'));
  inp = nameInput(() => start());
  async function start() {
    const name = inp.value.trim(); err.textContent = '';
    if (!name) { err.textContent = L('Erst einen Namen – dein Gegner will wissen, wen er gleich schlägt.', 'Name first – your opponent wants to know who they’re about to beat.'); inp.focus(); return; }
    ls.set(NAME, name); btnBusy(go, true);
    try { const v = await call('neu', { name }); remember(v.code, { tok: v.tok, me: name }); track('Duell', 'Gestartet'); location.hash = '#/app/duell/' + v.code; }
    catch (e) { err.textContent = e.message; btnBusy(go, false); }
  }
  const list = h('div', { class: 'du-list' });
  wrap.replaceChildren(
    h('section', { class: 'du-hero' }, h('div', { class: 'du-glow' }),
      fEl,
      h('div', { class: 'eyebrow' }, L('BWL-Duell · 1 gegen 1', 'Business duel · 1 vs 1')),
      h('h1', {}, L('Wer weiß mehr – du oder deine Kommilitonen?', 'Who knows more – you or your classmates?')),
      h('p', {}, L('Drei Runden, je drei Fragen, 20 Sekunden pro Frage. Du spielst deine Runde und schickst den Link – dein Gegner spielt, wann er will. Ohne Anmeldung.', 'Three rounds, three questions each, 20 seconds per question. Play your round and send the link – your opponent plays whenever they like. No sign-up.')),
      h('div', { class: 'du-start' }, inp, go), err),
    list);
  const fc = face(fEl, {}); fc.set('smug');
  const mine = Object.entries(store()).filter(([, x]) => x.tok).slice(0, 8);
  if (!mine.length) return;
  list.append(h('div', { class: 'eyebrow' }, L('Deine Duelle', 'Your duels')));
  mine.forEach(([c, x]) => {
    const st = h('span', { class: 'du-li-st' }, '…'), sc = h('b', { class: 'du-li-sc' });
    list.append(h('a', { class: 'du-li', href: '#/app/duell/' + c }, avatar(x.gegen || '?'), h('span', { class: 'du-li-n' }, x.gegen ? L('gegen ', 'vs ') + x.gegen : L('Wartet auf Gegner', 'Waiting for opponent')), st, sc, h('span', { html: ico('right') })));
    call('sehen', { code: c, tok: x.tok }).then(v => {
      const opp = v.spieler[1 - v.ich]; if (opp) remember(c, { gegen: opp.n });
      const w = v.dran.was; st.textContent = v.fertig ? L('Beendet', 'Finished') : w === 'spielen' || w === 'waehlen' ? L('Du bist dran', 'Your turn') : L('Gegner ist dran', 'Their turn');
      st.classList.toggle('hot', !v.fertig && (w === 'spielen' || w === 'waehlen'));
      if (v.stand && v.stand[0] != null) sc.textContent = `${v.stand[v.ich]} : ${v.stand[1 - v.ich]}`;
      if (opp) st.parentElement.querySelector('.du-li-n').textContent = L('gegen ', 'vs ') + opp.n;
    }).catch(() => { st.textContent = L('Nicht verfügbar', 'Unavailable'); });
  });
}

// ---------- Ein Duell öffnen ----------
async function openDuel(ctx, code) {
  const { wrap } = ctx;
  wrap.replaceChildren(h('div', { class: 'du-load' }, h('span', { class: 'du-spin' }), L('Duell wird geladen …', 'Loading duel …')));
  const mine = store()[code];
  let v;
  try { v = await call('sehen', { code, tok: mine && mine.tok }); }
  catch (e) { return wrap.replaceChildren(h('section', { class: 'du-card du-center' }, h('h2', {}, L('Duell nicht gefunden', 'Duel not found')), h('p', {}, e.message), h('a', { class: 'btn primary', href: '#/app/duell' }, L('Eigenes Duell starten', 'Start your own duel')))); }
  if (!ctx.alive) return;
  if (v.ich < 0) return v.frei ? join(ctx, v) : full(ctx);
  board(ctx, v);
}
function full(ctx) {
  ctx.wrap.replaceChildren(h('section', { class: 'du-card du-center' }, h('h2', {}, L('Hier spielen schon zwei', 'Two are already playing')), h('p', {}, L('Dieses Duell ist voll. Starte dein eigenes und fordere jemanden heraus.', 'This duel is full. Start your own and challenge someone.')), h('a', { class: 'btn primary', href: '#/app/duell' }, L('Eigenes Duell starten', 'Start your own duel'))));
}
// Herausgefordert: Namen eingeben, annehmen
function join(ctx, v) {
  const host = v.spieler[0] ? v.spieler[0].n : L('Jemand', 'Someone');
  const fEl = h('div', { class: 'du-face big' }), err = h('p', { class: 'du-err' });
  const inp = nameInput(() => go());
  const btn = h('button', { class: 'btn primary lg', type: 'button', onclick: () => go() }, L('Herausforderung annehmen', 'Accept challenge'));
  async function go() {
    const name = inp.value.trim(); err.textContent = '';
    if (!name) { err.textContent = L('Wie heißt du? Sonst weiß keiner, wer gewonnen hat.', 'What’s your name? Otherwise nobody knows who won.'); inp.focus(); return; }
    ls.set(NAME, name); btnBusy(btn, true);
    try { const r = await call('beitreten', { code: v.code, name }); remember(v.code, { tok: r.tok, me: name, gegen: host }); track('Duell', 'Angenommen'); board(ctx, r); }
    catch (e) { err.textContent = e.message; btnBusy(btn, false); if (e.code === 'voll') full(ctx); }
  }
  const played = v.runden.filter(x => x.er).length;
  ctx.wrap.replaceChildren(h('section', { class: 'du-card du-center du-invite' }, h('div', { class: 'du-glow' }), fEl,
    h('div', { class: 'eyebrow' }, 'BWL-Duell'),
    h('h1', {}, h('span', { class: 'du-hl' }, host), L(' fordert dich heraus.', ' challenges you.')),
    h('p', {}, played ? L(`${host} hat Runde 1 schon gespielt. Jetzt du – drei Fragen, 20 Sekunden pro Frage.`, `${host} has already played round 1. Your turn – three questions, 20 seconds each.`) : L('Drei Runden, je drei BWL-Fragen. Wer am Ende mehr richtig hat, gewinnt.', 'Three rounds, three business questions each. Most correct answers wins.')),
    h('div', { class: 'du-start' }, inp, btn), err,
    h('small', { class: 'du-fine' }, L('Ohne Anmeldung. Max schaut zu und kommentiert.', 'No sign-up. Max watches and comments.'))));
  face(fEl, {}).set('smug');
}

// ---------- Spielbrett ----------
function board(ctx, v) {
  const { wrap } = ctx;
  ctx.timers.forEach(t => clearInterval(t)); ctx.timers.clear();
  const me = v.ich, op = 1 - me, P = v.spieler, opp = P[op];
  if (opp) remember(v.code, { gegen: opp.n });
  const fEl = h('div', { class: 'du-face' });
  const dots = (side, k) => {
    const x = v.runden[k]; const d = x && x[side];
    return h('span', { class: 'du-dots' }, [0, 1, 2].map(i => {
      let c = 'du-dot';
      if (d && d.a) { const q = x.q[i]; const right = BANK[q] ? BANK[q].a : -9; c += d.a[i] === right ? ' ok' : ' bad'; }
      else if (d && d.gespielt) c += ' hid';
      return h('i', { class: c, style: { '--d': (k * 3 + i) * 60 + 'ms' } });
    }));
  };
  const rows = Array.from({ length: v.R }, (_, k) => {
    const x = v.runden[k];
    return h('div', { class: 'du-row' + (x ? '' : ' empty') }, dots('ich', k), h('span', { class: 'du-rl' }, x ? fachName(x.f) : L(`Runde ${k + 1}`, `Round ${k + 1}`)), dots('er', k));
  });
  const sMe = v.stand[me] || 0, sOp = v.stand[op] || 0;
  const score = h('div', { class: 'du-score' }, h('b', { class: 'du-n' }, '0'), h('span', {}, ':'), h('b', { class: 'du-n' }, '0'));
  const act = h('div', { class: 'du-act' });
  const say = h('p', { class: 'du-say' });
  wrap.replaceChildren(
    h('section', { class: 'du-card du-board' },
      h('div', { class: 'du-vs' },
        h('div', { class: 'du-pl' }, avatar(P[me] && P[me].n, true), h('span', {}, L('Du', 'You'))),
        score,
        h('div', { class: 'du-pl' }, avatar(opp ? opp.n : '?'), h('span', {}, opp ? opp.n : L('Noch offen', 'Open')))),
      h('div', { class: 'du-rows' }, rows),
      h('div', { class: 'du-max' }, fEl, say),
      act),
    h('a', { class: 'du-back', href: '#/app/duell' }, h('span', { html: ico('left') }), L('Alle Duelle', 'All duels')));
  countUp(score.children[0], sMe); countUp(score.children[2], sOp);
  const fc = face(fEl, {});
  const w = v.dran.was;
  if (v.fertig) {
    const win = sMe > sOp, draw = sMe === sOp;
    fc.set(win ? 'happy' : draw ? 'smug' : 'sad');
    wrap.querySelector('.du-board').classList.add(win ? 'won' : draw ? 'draw' : 'lost');
    say.textContent = win ? pick(L(['Sieg. War klar. Ich hab ja auch zugeschaut.', 'Gewonnen. Ich würde sagen: verdient. Ich sag sowas nicht oft.', `${opp.n} hat gerade gelernt, wer hier BWL kann.`], ['Win. Obviously. I was watching, after all.', 'Won. I’d say deserved. I don’t say that often.', `${opp.n} just learned who knows business here.`]))
      : draw ? pick(L(['Unentschieden. Langweilig. Revanche.', 'Gleichstand. Ich hasse Gleichstand. Nochmal.'], ['A draw. Boring. Rematch.', 'Tied. I hate ties. Again.']))
        : pick(L([`Verloren gegen ${opp.n}. Ich tu so, als hätte ich das nicht gesehen.`, 'Niederlage. Passiert. Mir nicht, aber dir.', 'Autsch. Ab in den Trainer, dann Revanche.'], [`Lost to ${opp.n}. I’ll pretend I didn’t see that.`, 'A loss. Happens. Not to me, but to you.', 'Ouch. Hit the trainer, then rematch.']));
    act.append(h('div', { class: 'du-res' }, h('b', {}, win ? L('Gewonnen', 'You won') : draw ? L('Unentschieden', 'Draw') : L('Verloren', 'You lost'))),
      h('div', { class: 'du-btns' }, h('button', { class: 'btn primary', type: 'button', onclick: () => rematch(opp.n) }, L('Revanche', 'Rematch')), h('a', { class: 'btn', href: '#/app/trainer' }, L('Im Trainer üben', 'Practise in the trainer'))));
    if (win) burst(wrap.querySelector('.du-board'));
    track('Duell', win ? 'Gewonnen' : draw ? 'Unentschieden' : 'Verloren');
    return;
  }
  if (w === 'waehlen') {
    fc.set('smug');
    say.textContent = v.runden.length ? pick(L(['Deine Wahl. Nimm was, wo du nicht blank bist.', 'Thema wählen. Ich hätte ja eine Meinung – aber du machst das schon.'], ['Your pick. Choose something you’re not clueless at.', 'Pick a topic. I have opinions – but you’ve got this.'])) : pick(L(['Runde 1. Such dir ein Thema aus, in dem du glänzt. Falls es eins gibt.', 'Los geht’s. Wähl klug, ich schau zu.'], ['Round 1. Pick a topic you shine in. If there is one.', 'Let’s go. Choose wisely, I’m watching.']));
    act.append(h('button', { class: 'btn primary lg du-go', type: 'button', onclick: () => choose(ctx, v) }, L(`Runde ${v.dran.r + 1}: Thema wählen`, `Round ${v.dran.r + 1}: pick a topic`)));
  } else if (w === 'spielen') {
    const x = v.runden[v.dran.r]; fc.set('idle');
    say.textContent = x.ch === me ? L('Du hast gewählt, jetzt liefern.', 'You picked it, now deliver.') : L(`${opp ? opp.n : 'Dein Gegner'} hat ${fachName(x.f)} gewählt. Mal sehen, ob das Absicht war.`, `${opp ? opp.n : 'Your opponent'} picked ${fachName(x.f)}. Let’s see if that was on purpose.`);
    act.append(h('button', { class: 'btn primary lg du-go', type: 'button', onclick: () => play(ctx, v, v.dran.r) }, L(`Runde ${v.dran.r + 1} spielen`, `Play round ${v.dran.r + 1}`)));
  } else {
    fc.set('sleep');
    if (!opp) {
      say.textContent = L('Jetzt brauchst du ein Opfer. Ich meine: einen Gegner.', 'Now you need a victim. I mean: an opponent.');
      act.append(h('p', { class: 'du-hint' }, L('Schick den Link an einen Kommilitonen. Er spielt deine Runde nach und ist dann dran.', 'Send the link to a classmate. They replay your round and then it’s their turn.')), shareRow(v.code, P[me] && P[me].n, true));
    } else {
      say.textContent = pick(L([`${opp.n} ist dran. Angst ist auch eine Strategie.`, `Warten auf ${opp.n}. Ich nutze die Zeit zum Gutaussehen.`, `${opp.n} überlegt noch. Gut so.`], [`${opp.n}’s turn. Fear is a strategy too.`, `Waiting for ${opp.n}. I’ll use the time to look good.`, `${opp.n} is still thinking. Good.`]));
      act.append(h('p', { class: 'du-hint' }, L(`${opp.n} ist dran. Du bekommst es hier mit, sobald gespielt wurde.`, `It’s ${opp.n}’s turn. You’ll see it here once they’ve played.`)), shareRow(v.code, P[me] && P[me].n, false));
    }
    // Neuigkeiten abholen, solange die Seite offen ist
    const t = setInterval(async () => {
      if (!ctx.alive || !wrap.isConnected) { clearInterval(t); return; }
      if (document.visibilityState !== 'visible') return;
      try { const nv = await call('sehen', { code: v.code, tok: store()[v.code]?.tok }); if (nv.dran.was !== 'warten' || (nv.spieler[op] && !opp) || nv.fertig) { haptic('ok'); board(ctx, nv); } } catch (e) {}
    }, 12000);
    ctx.timers.add(t);
  }
}
async function rematch(oppName) {
  const name = myName() || ls.get(NAME, '');
  try { const v = await call('neu', { name: name || L('Ich', 'Me') }); remember(v.code, { tok: v.tok, me: name, revFor: oppName }); track('Duell', 'Revanche'); location.hash = '#/app/duell/' + v.code; }
  catch (e) { toast(e.message); }
}
function countUp(el, to) {
  if (!to) { el.textContent = '0'; return; }
  const t0 = performance.now(), dur = 700;
  const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); else el.animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' }); };
  requestAnimationFrame(step);
}
function burst(host) {
  if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = h('div', { class: 'du-burst', 'aria-hidden': 'true' }); host.appendChild(box);
  for (let i = 0; i < 28; i++) { const p = h('i', { style: { '--x': (Math.random() * 2 - 1) * 180 + 'px', '--y': -(Math.random() * 160 + 60) + 'px', '--r': Math.random() * 540 + 'deg', '--d': Math.random() * 180 + 'ms', '--h': Math.floor(Math.random() * 3) } }); box.appendChild(p); }
  setTimeout(() => box.remove(), 2200);
}

// ---------- Thema wählen ----------
function choose(ctx, v) {
  const { wrap } = ctx;
  const fEl = h('div', { class: 'du-face' });
  const cards = v.dran.angebot.map((f, i) => h('button', { class: 'du-topic', type: 'button', style: { '--i': i }, onclick: e => go(f, e.currentTarget) }, h('span', { class: 'du-tk' }, String(i + 1)), h('b', {}, fachName(f)), h('small', {}, L('3 Fragen', '3 questions'))));
  let busy = false;
  async function go(f, el) {
    if (busy) return; busy = true; el.classList.add('on'); cards.forEach(c => c !== el && c.classList.add('off')); haptic('tap');
    try { const nv = await call('waehlen', { code: v.code, tok: store()[v.code]?.tok, fach: f }); track('Duell', 'Thema ' + f); setTimeout(() => nv.dran.was === 'spielen' ? play(ctx, nv, nv.dran.r) : board(ctx, nv), 380); }
    catch (e) { toast(e.message); busy = false; el.classList.remove('on'); cards.forEach(c => c.classList.remove('off')); }
  }
  wrap.replaceChildren(h('section', { class: 'du-card du-pick' }, h('div', { class: 'du-max' }, fEl, h('p', { class: 'du-say' }, L('Vier Themen, eins davon nimmst du. Dein Gegner muss es auch spielen.', 'Four topics, you take one. Your opponent has to play it too.'))),
    h('div', { class: 'eyebrow' }, L(`Runde ${v.dran.r + 1} von ${v.R}`, `Round ${v.dran.r + 1} of ${v.R}`)),
    h('h2', {}, L('Wähl dein Thema', 'Pick your topic')),
    h('div', { class: 'du-topics' }, cards)));
  face(fEl, {}).set('smug');
}

// ---------- Eine Runde spielen: 3 Fragen, je 20 Sekunden ----------
function play(ctx, v, r) {
  const { wrap } = ctx;
  const x = v.runden[r], PK = 'tutor.duellLauf';
  const saved = ls.get(PK, null);
  const ans = saved && saved.c === v.code && saved.r === r ? saved.a.slice(0, 3) : [];
  const fEl = h('div', { class: 'du-face sm' });
  const prog = h('div', { class: 'du-prog' }, [0, 1, 2].map(() => h('i')));
  const timer = h('div', { class: 'du-timer' }, h('i'));
  const box = h('div', { class: 'du-q' });
  wrap.replaceChildren(h('section', { class: 'du-card du-play' },
    h('div', { class: 'du-ph' }, fEl, h('div', {}, h('div', { class: 'eyebrow' }, L(`Runde ${r + 1} · `, `Round ${r + 1} · `) + fachName(x.f)), prog)),
    timer, box));
  const fc = face(fEl, {});
  const paint = () => [...prog.children].forEach((d, i) => { d.className = i < ans.length ? (ans[i] === BANK[x.q[i]].a ? 'ok' : 'bad') : i === ans.length ? 'cur' : ''; });
  let tm = null;
  const next = () => {
    paint();
    if (ans.length >= 3) return submit();
    const qi = ans.length, id = x.q[qi], q = BANK[id], ord = ordOf(v.code, id);
    let done = false;
    const opts = ord.map((orig, k) => h('button', { class: 'du-opt', type: 'button', style: { '--i': k }, onclick: () => answer(orig, k) }, h('span', { class: 'du-k' }, 'ABCD'[k]), h('span', {}, T(q.o[orig]))));
    box.replaceChildren(h('h3', {}, T(q.q)), h('div', { class: 'du-opts' }, opts));
    box.animate([{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' });
    fc.set('idle');
    // Timer: Balken läuft runter, in den letzten 5 Sekunden wird es eng
    const bar = timer.firstChild; const t0 = performance.now();
    bar.style.transition = 'none'; bar.style.width = '100%'; timer.classList.remove('hot');
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = `width ${SECS}s linear`; bar.style.width = '0%'; }));
    clearInterval(tm);
    tm = setInterval(() => { if (!wrap.isConnected) { clearInterval(tm); return; } const left = SECS - (performance.now() - t0) / 1000; if (left <= 5) timer.classList.add('hot'); if (left <= 0) answer(-1, -1); }, 200);
    ctx.timers.add(tm);
    function answer(orig, k) {
      if (done) return; done = true; clearInterval(tm);
      const cs = getComputedStyle(bar).width; bar.style.transition = 'none'; bar.style.width = cs;
      const ok = orig === q.a;
      opts.forEach((b, j) => { b.disabled = true; if (ord[j] === q.a) b.classList.add('ok'); else if (j === k) b.classList.add('bad'); else b.classList.add('dim'); });
      if (k < 0) box.prepend(h('div', { class: 'du-timeup' }, L('Zeit um!', 'Time’s up!')));
      haptic(ok ? 'ok' : 'bad'); fc.pulse(ok ? 'happy' : 'sad', 1100);
      ans.push(orig); ls.set(PK, { c: v.code, r, a: ans });
      paint(); [...prog.children].forEach((d, i) => d.classList.toggle('cur', false));
      setTimeout(next, ok ? 1100 : 1700);
    }
  };
  async function submit() {
    box.replaceChildren(h('div', { class: 'du-load' }, h('span', { class: 'du-spin' }), L('Wird gewertet …', 'Scoring …')));
    try { const nv = await call('antwort', { code: v.code, tok: store()[v.code]?.tok, r, a: ans }); ls.set(PK, null); remember(v.code, {}); track('Duell', 'Runde gespielt'); summary(ctx, nv, r); }
    catch (e) { box.replaceChildren(h('p', { class: 'du-err' }, e.message), h('button', { class: 'btn primary', type: 'button', onclick: submit }, L('Nochmal senden', 'Send again'))); }
  }
  next();
}

// ---------- Rundenergebnis ----------
function summary(ctx, v, r) {
  const { wrap } = ctx; const me = v.ich, op = 1 - me, x = v.runden[r], opp = v.spieler[op];
  const mine = x.ich ? x.ich.p : 0, his = x.er && x.er.a ? x.er.p : null;
  const fEl = h('div', { class: 'du-face big' });
  const line = (who, a) => h('div', { class: 'du-sumrow' }, h('span', {}, who), h('span', { class: 'du-dots big' }, [0, 1, 2].map(i => h('i', { class: 'du-dot ' + (a ? (a[i] === BANK[x.q[i]].a ? 'ok' : 'bad') : 'hid'), style: { '--d': i * 160 + 'ms' } }))));
  const qs = x.q.map((id, i) => { const q = BANK[id]; const a = x.ich.a[i]; return h('details', { class: 'du-rev' + (a === q.a ? ' ok' : ' bad') }, h('summary', {}, T(q.q)), h('p', {}, h('b', {}, L('Richtig: ', 'Correct: ') + T(q.o[q.a])), ' ', T(q.e))); });
  const msg = mine === 3 ? pick(L(['Drei von drei. Ich bin fast ein bisschen stolz.', 'Perfekte Runde. So sieht das bei mir jeden Tag aus.'], ['Three out of three. I’m almost a little proud.', 'Perfect round. That’s my every day.']))
    : mine === 0 ? pick(L(['Null. Mutig, das so durchzuziehen.', 'Keine richtig. Wir reden später darüber.'], ['Zero. Bold to commit to that.', 'None right. We’ll talk later.']))
      : pick(L(['Geht so. Da ist noch Luft nach oben – viel Luft.', 'Solide. Nicht beeindruckend, aber solide.'], ['Okay-ish. Room to improve – lots of room.', 'Solid. Not impressive, but solid.']));
  wrap.replaceChildren(h('section', { class: 'du-card du-center du-sum' }, fEl,
    h('div', { class: 'eyebrow' }, L(`Runde ${r + 1} · `, `Round ${r + 1} · `) + fachName(x.f)),
    h('div', { class: 'du-big' }, h('b', {}, `${mine}/3`)),
    h('p', { class: 'du-say' }, msg),
    h('div', { class: 'du-sum' }, line(L('Du', 'You'), x.ich.a), line(opp ? opp.n : L('Gegner', 'Opponent'), x.er && x.er.a ? x.er.a : null)),
    his == null ? h('p', { class: 'du-hint' }, opp ? L(`${opp.n} spielt diese Runde noch.`, `${opp.n} hasn’t played this round yet.`) : L('Dein Gegner spielt diese Runde nach, sobald er den Link hat.', 'Your opponent replays this round once they have the link.')) : null,
    h('div', { class: 'du-revs' }, qs),
    h('button', { class: 'btn primary lg', type: 'button', onclick: () => board(ctx, v) }, v.dran.was === 'waehlen' ? L('Weiter: nächstes Thema wählen', 'Next: pick the next topic') : v.fertig ? L('Zum Ergebnis', 'See result') : L('Weiter', 'Continue'))));
  face(fEl, {}).set(mine >= 2 ? 'happy' : mine === 1 ? 'smug' : 'sad');
}
