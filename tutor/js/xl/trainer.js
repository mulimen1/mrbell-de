// Excel-Trainer im Excel-Helfer: Max bringt Excel Schritt für Schritt bei – im echten Nachbau mit echten Tastenkürzeln.
// 3 Stufen × 5 Lektionen; jeder Schritt wird am echten Zustand der Tabelle geprüft. Fortschritt bleibt im Browser.
import { h, ico, toast, ls } from '../util.js';
import { face } from '../face.js';
import { engine } from './core.js';
import { Grid, MAC } from './grid.js';
import { LESSONS, LEVELS } from './lessons.js';

const STORE = 'tutor.xltrain';
const DISCL = () => h('p', { class: 'xt-disc' }, h('b', {}, 'Nur zum Lernen. '), 'Hinweis: Der Excel-Trainer ist ein eigener Nachbau von BWL Max – keine Microsoft-Software und kein Microsoft-Produkt. Er dient ausschließlich dem Lernen und soll dir nur helfen. BWL Max steht in keiner Verbindung zu Microsoft und wird von Microsoft weder unterstützt noch gesponsert. Microsoft und Excel sind Marken der Microsoft Corporation.');
const prog = () => { const p = ls.get(STORE, null); return p && p.done ? p : { done: {} }; };
const saveProg = p => ls.set(STORE, p);

// ---------- Tasten anzeigen (Mac/Windows) ----------
const KEY = { mod: MAC ? '⌘' : 'Strg', shift: '⇧', alt: MAC ? '⌥' : 'Alt', ctrl: MAC ? '⌃' : 'Strg', enter: '↵ Enter', tab: '⇥ Tab', esc: 'Esc', del: MAC ? '⌫' : 'Entf', up: '↑', down: '↓', left: '←', right: '→' };
const COMBO = { autosum: 'alt+=', f4: MAC ? 'fn+F4' : 'F4', f2: MAC ? 'fn+F2' : 'F2', fmt4: MAC ? 'ctrl+shift+4' : 'mod+shift+4', fmt5: MAC ? 'ctrl+shift+5' : 'mod+shift+5', bold: 'mod+B' };
const NOTES = {
  autosumNote: MAC ? 'Hier im Trainer: ⌥ + =. Im echten Excel am Mac heißt das Kürzel ⌘ + ⇧ + T – das schnappt sich im Browser aber Chrome bzw. Safari für sich.' : 'Alt gedrückt halten und = tippen. Excel nimmt die Zahlen direkt darüber.',
  fmt4Note: MAC ? 'Am Mac mit Control (⌃), nicht mit ⌘ – ⌘ + ⇧ + 4 macht einen Screenshot.' : 'Strg + Shift + 4 – auf der 4 liegt das $-Zeichen, Excel macht daraus Währung.',
  f4Note: MAC ? 'Am Mac: fn + F4 (im echten Mac-Excel ⌘ + T). Klappt die Taste nicht, tipp die $-Zeichen selbst: $G$1.' : 'F4 setzt die $-Zeichen. Nochmal F4: G$1 – nochmal: $G1 – nochmal: wieder G1.'
};
const kbd = spec => { const s = COMBO[spec] || spec; return h('span', { class: 'xt-kc' }, ...s.split('+').flatMap((p, i) => [i ? h('i', {}, '+') : null, h('kbd', {}, KEY[p.toLowerCase()] || (p.length === 1 ? p.toUpperCase() : p))]).filter(Boolean)); };
const note = t => String(t || '').replace(/\{(\w+)\}/g, (_, k) => NOTES[k] || '');
function rich(text) {
  const out = []; const re = /(\*\*.+?\*\*(?!\*)|\[\[[^\]]+\]\])/g; let last = 0, m; const s = note(text);
  while ((m = re.exec(s))) { if (m.index > last) out.push(s.slice(last, m.index)); const t = m[0]; out.push(t[0] === '*' ? h('b', {}, t.slice(2, -2)) : kbd(t.slice(2, -2))); last = m.index + t.length; }
  if (last < s.length) out.push(s.slice(last)); return out;
}
const QUIPS = ['Sauber. Dein Prof wäre fast beeindruckt.', 'Läuft. Excel hat jetzt Respekt vor dir.', 'Schneller als die Mensa-Schlange.', 'So arbeitet man im Investmentbanking. Nur ohne 90-Stunden-Woche.', 'Zack. Genau so.', 'Das hätte ich nicht besser gemacht. Okay, minimal.', 'Sitzt. Weiter.', 'Elegant. Fast schon arrogant.'];
const quip = () => QUIPS[Math.floor(Math.random() * QUIPS.length)];
const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const starsOf = (L, hints, wrong, secs) => L.challenge ? (hints === 0 && secs <= 180 ? 3 : secs <= 300 && hints <= 1 ? 2 : 1) : (hints === 0 && wrong <= 1 ? 3 : hints <= 2 ? 2 : 1);
const starRow = (n, big) => h('span', { class: 'xt-stars' + (big ? ' big' : '') }, [1, 2, 3].map(k => h('i', { class: k <= n ? 'on' : '', style: { '--k': k } }, '★')));

// Lektion = ganzes Feld: Seitenkopf und Reiter treten zurück
const full = (el, on) => { const w = el.closest('.xl'); if (w) w.classList.toggle('xt-full', on); if (on) scrollTo({ top: 0, behavior: 'smooth' }); };
export function trainer(body, { start } = {}) {
  const el = h('div', { class: 'xt' }); body.replaceChildren(el);
  start ? play(el, start) : overview(el);
}

// ---------- Übersicht: 3 Stufen ----------
function overview(el) {
  full(el, false);
  const p = prog(), done = id => p.done[id], total = LESSONS.length, stars = LESSONS.reduce((a, l) => a + (done(l.id)?.stars || 0), 0);
  const next = LESSONS.find(l => !done(l.id)) || LESSONS[0];
  const fEl = h('div', { class: 'xt-hface' }); setTimeout(() => { try { face(fEl, { follow: true }); } catch (e) {} }, 0);
  el.replaceChildren(
    h('div', { class: 'xt-hero' }, fEl,
      h('div', { class: 'xt-htx' }, h('b', {}, 'Excel lernen – mit Max.'), h('p', {}, 'Ein echter Excel-Nachbau, echte Tastenkürzel, echte BWL-Aufgaben. Max führt dich Schritt für Schritt – vom ersten =B2*C2 bis zum Tilgungsplan. Du machst es selbst, er sagt dir sofort, ob’s sitzt.'),
        h('div', { class: 'xt-hst' }, h('span', {}, h('b', {}, String(LESSONS.filter(l => done(l.id)).length)), ' / ' + total + ' Lektionen'), h('span', {}, h('b', {}, String(stars)), ' / ' + total * 3 + ' ★'),
          h('button', { class: 'btn primary xt-go', type: 'button', onclick: () => stars ? play(el, next.id) : pickLevel(el) }, h('span', { html: ico('right') }), stars ? 'Weiter: ' + next.title : 'Los geht’s'), stars ? h('button', { class: 'btn ghost sm', type: 'button', onclick: () => pickLevel(el) }, 'Stufe wählen') : null))),
    DISCL(),
    matchMedia('(pointer: coarse)').matches ? h('p', { class: 'xt-phone' }, 'Tipp: Am Laptop macht’s am meisten Sinn – dort funktionieren die Tastenkürzel wie im echten Excel.') : null,
    h('div', { class: 'xt-levels' }, LEVELS.map(lv => {
      const ls2 = LESSONS.filter(l => l.lvl === lv.n), got = ls2.filter(l => done(l.id)).length;
      return h('section', { class: 'xt-lv', style: { '--lc': lv.col } },
        h('header', {}, h('span', { class: 'xt-lvn' }, 'Stufe ' + lv.n), h('b', {}, lv.title), h('small', {}, lv.sub), h('div', { class: 'xt-bar' }, h('i', { style: { width: (got / ls2.length * 100) + '%' } }))),
        h('ol', {}, ls2.map((l, i) => { const d = done(l.id); return h('li', {}, h('button', { type: 'button', class: 'xt-ls' + (d ? ' done' : ''), onclick: () => play(el, l.id) }, h('span', { class: 'xt-lsn' }, d ? '✓' : String(i + 1)), h('span', { class: 'xt-lst' }, h('b', {}, l.title, l.challenge ? h('em', {}, 'Challenge') : null), h('small', {}, l.desc)), d ? starRow(d.stars) : h('span', { class: 'xt-lsgo', html: ico('right') }))); })));
    })),
    cheat());
}
// Einstieg: Wie viel Excel kannst du schon? – dann direkt in der passenden Stufe loslegen
function pickLevel(el) {
  const OPTS = [[1, 'Noch nicht viel', 'Ich will die Basics: Eingeben, erste Formeln, Summe, Ausfüllen.'], [2, 'Formeln und SUMME kann ich', 'Zeig mir $-Bezüge, WENN, Prozente und schnelles Navigieren.'], [3, 'Ich bin schon fit', 'Direkt zu Kapitalwert, Tilgungsplan, INDEX/VERGLEICH und SUMMEWENNS.']];
  const close = () => ov.remove();
  const ov = h('div', { class: 'xt-pick', role: 'dialog', 'aria-label': 'Wie viel Excel kannst du schon?', onclick: e => { if (e.target === ov) close(); } },
    h('div', { class: 'xt-pcard' }, h('b', {}, 'Wie viel Excel kannst du schon?'), h('p', {}, 'Ehrlich sein lohnt sich – du kannst jederzeit eine Stufe wechseln.'),
      OPTS.map(([n, t, sub]) => { const lv = LEVELS.find(x => x.n === n); return h('button', { type: 'button', class: 'xt-popt', style: { '--lc': lv.col }, onclick: () => { close(); ls.set('tutor.xltrain.lvl', n); play(el, LESSONS.find(l => l.lvl === n).id); } }, h('span', { class: 'xt-lvn' }, 'Stufe ' + n + ' · ' + lv.title), h('strong', {}, t), h('small', {}, sub)); }),
      h('button', { type: 'button', class: 'btn ghost sm', onclick: close }, 'Abbrechen')));
  document.body.append(ov); setTimeout(() => ov.querySelector('.xt-popt')?.focus(), 30);
}
function cheat() {
  const R = [['Eingabe speichern, nach unten / rechts', 'enter', 'tab'], ['Zelle bearbeiten', 'f2', MAC ? 'ctrl+U' : null], ['Abbrechen', 'esc'], ['Rückgängig', 'mod+Z'], ['Kopieren / Einfügen', 'mod+C', 'mod+V'], ['Nach unten / rechts ausfüllen', 'mod+D', 'mod+R'], ['AutoSumme', 'autosum'], ['Bezug fixieren ($)', 'f4'], ['Euro / Prozent', 'fmt4', 'fmt5'], ['Fett', 'bold'], ['Ans Ende der Daten springen', 'mod+down', 'mod+right'], ['Bis zum Ende markieren', 'mod+shift+down']];
  return h('details', { class: 'xt-cheat' }, h('summary', {}, h('span', { html: ico('library') }), 'Spickzettel: alle Kürzel aus dem Trainer', h('small', {}, MAC ? 'für Mac' : 'für Windows')),
    h('table', {}, h('tbody', {}, R.map(([t, a, b]) => h('tr', {}, h('td', {}, t), h('td', {}, kbd(a), b ? [' ', kbd(b)] : null))))),
    MAC ? h('p', {}, 'Im echten Mac-Excel heißen zwei Kürzel anders: AutoSumme ⌘ ⇧ T und Bezug fixieren ⌘ T. Im Browser sind die für Tabs reserviert – deshalb hier ⌥ = und fn F4.') : null);
}

// ---------- Lektion ----------
async function play(el, id) {
  const Ls = LESSONS.find(l => l.id === id); if (!Ls) return overview(el);
  const lv = LEVELS.find(x => x.n === Ls.lvl);
  full(el, true); el.replaceChildren(h('div', { class: 'xt-load' }, 'Excel startet …'));
  let E; try { E = await engine(); } catch (e) { el.replaceChildren(h('p', {}, 'Das Rechenmodul konnte nicht geladen werden. Bitte Seite neu laden.')); return; }
  let i = 0, stepStart = 0, hints = 0, wrong = 0, t0 = 0, xp = 0, lock = false, finished = false, timer = 0, autoHint = 0;
  const G = new Grid({ E, cols: Ls.cols.length, rows: Ls.rows, widths: Ls.cols, cells: Ls.cells, onEvent: ev => onEvent(ev) });
  // Kopf
  const clock = h('span', { class: 'xt-clock' }, '0:00'), xpEl = h('span', { class: 'xt-xp' }, '0 XP');
  const dots = h('div', { class: 'xt-dots' }, Ls.steps.map(() => h('i')));
  const top = h('div', { class: 'xt-top', style: { '--lc': lv.col } },
    h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { clearInterval(timer); overview(el); } }, h('span', { html: ico('left') }), 'Übersicht'),
    h('span', { class: 'xt-lvb' }, 'Stufe ' + lv.n + ' · ' + lv.title), h('b', { class: 'xt-tt' }, Ls.title), dots, h('span', { style: { flex: 1 } }), Ls.challenge ? h('span', { class: 'xt-chal' }, '⏱ Challenge') : null, clock, xpEl);
  // Excel-Fenster mit kleiner Menüleiste (Klick-Alternative zu den Kürzeln)
  const rb = (label, title, fn, cls) => h('button', { type: 'button', class: 'xt-rb' + (cls ? ' ' + cls : ''), title, onmousedown: e => e.preventDefault(), onclick: () => { fn(); G.focus(); } }, label);
  const ribbon = h('div', { class: 'xt-ribbon' },
    h('span', { class: 'xt-rtab' }, 'Start'),
    rb(h('b', {}, 'F'), 'Fett (' + (MAC ? '⌘' : 'Strg') + ' + B)', () => G.toggleBold()),
    rb('€', 'Währung (' + (MAC ? '⌃' : 'Strg') + ' + ⇧ + 4)', () => G.format('eur')),
    rb('%', 'Prozent (' + (MAC ? '⌃' : 'Strg') + ' + ⇧ + 5)', () => G.format('pct')),
    h('i', { class: 'xt-rsep' }),
    rb('Σ AutoSumme', 'AutoSumme (' + (MAC ? '⌥' : 'Alt') + ' + =)', () => { if (!G.editing) G.autosum(); }, 'w'),
    rb('↓ Ausfüllen', 'Nach unten ausfüllen (' + (MAC ? '⌘' : 'Strg') + ' + D)', () => { if (!G.editing) G.fillDown(); }, 'w'),
    rb('↶', 'Rückgängig (' + (MAC ? '⌘' : 'Strg') + ' + Z)', () => { if (!G.editing) G.undo(); }));
  const win = h('div', { class: 'xt-win' }, h('div', { class: 'xt-wt' }, h('i'), h('i'), h('i'), h('span', {}, 'Mappe1 – Excel-Trainer'), h('small', {}, 'Nachbau · keine Microsoft-Software')), ribbon, G.el, h('div', { class: 'xt-sheets' }, h('span', { class: 'on' }, Ls.title.split(':')[0].slice(0, 22)), h('span', {}, '+')));
  // Coach
  const fEl = h('div', { class: 'xt-face' }); let fc = null; setTimeout(() => { try { fc = face(fEl, { follow: false }); } catch (e) {} }, 0);
  const bubble = h('div', { class: 'xt-say', 'aria-live': 'polite' }), hintBox = h('div', { class: 'xt-hint', hidden: true }), cnt = h('small', { class: 'xt-cnt' });
  const hintBtn = h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { hints++; showHint(); G.focus(); } }, h('span', { html: ico('bulb') }), 'Tipp');
  const solveBtn = h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { const st = Ls.steps[i]; if (!st || lock) return; hints += 2; try { st.solve && st.solve(G); } catch (e) {} if (!lock) success(true); G.focus(); } }, h('span', { html: ico('play') }), 'Zeig’s mir');
  const list = h('ol', { class: 'xt-steps' }, Ls.steps.map((s, k) => h('li', {}, h('i', {}, String(k + 1)), h('span', {}, rich(s.say.split(/[.:!?](\s|$)/)[0].replace(/\*\*/g, '').slice(0, 64))))));
  const coach = h('aside', { class: 'xt-coach' }, h('div', { class: 'xt-chd' }, fEl, h('div', {}, h('b', {}, 'Max'), cnt)), bubble, hintBox, h('div', { class: 'xt-cbtn' }, hintBtn, solveBtn), list);
  const stage = h('div', { class: 'xt-stage' }, win, coach);
  const playEl = h('div', { class: 'xt-play' }, top, stage, DISCL());
  el.replaceChildren(playEl);
  function showHint() { const st = Ls.steps[i]; hintBox.hidden = false; hintBox.replaceChildren(h('span', { html: ico('bulb') }), h('span', {}, rich(st.hint || 'Lies die Aufgabe nochmal Wort für Wort – jede Taste steht drin.'))); }
  function setStep(k) {
    i = k; stepStart = G.log.length; autoHint = 0; hintBox.hidden = true; lock = false;
    const st = Ls.steps[i]; bubble.classList.remove('ok', 'no'); bubble.replaceChildren(...rich(st.say)); cnt.textContent = 'Schritt ' + (i + 1) + ' von ' + Ls.steps.length;
    [...dots.children].forEach((d, j) => { d.className = j < i ? 'ok' : j === i ? 'now' : ''; }); [...list.children].forEach((li, j) => { li.className = j < i ? 'ok' : j === i ? 'now' : ''; });
    G.setTarget(st.target || null); try { fc && fc.pulse('smug', 900); } catch (e) {}
    // Schon erfüllt (z. B. durch einen vorigen Schritt)? Dann nicht hängen bleiben.
    setTimeout(() => { if (!lock && i === k && Ls.steps[i].ok(G, S())) success(); }, 60);
  }
  const S = () => ({ used: (t, pred) => G.log.slice(stepStart).some(e => e.t === t && (!pred || pred(e))) });
  function onEvent(ev) {
    if (finished || lock) return;
    if (!t0 && ev.t !== 'select') { t0 = Date.now(); timer = setInterval(() => { if (!clock.isConnected) return clearInterval(timer); clock.textContent = mmss((Date.now() - t0) / 1000); }, 500); }
    if (['edit', 'point', 'pointclick', 'cancel'].includes(ev.t)) return;
    const st = Ls.steps[i]; if (!st) return; const s = S();
    if (st.ok(G, s)) { success(); return; }
    let msg = st.wrong ? st.wrong(G, s, ev) : null;
    if (!msg && ev.t === 'commit' && ev.how !== 'solve' && st.target && !st.target.includes(':') && ev.ref === st.target) msg = 'Noch nicht ganz. Schau dir die Aufgabe nochmal genau an – oder hol dir einen Tipp.';
    if (msg) { wrong++; autoHint++; bubble.classList.remove('no'); void bubble.offsetWidth; bubble.classList.add('no'); G.showMsg(msg, 'bad'); try { fc && fc.pulse('sad', 1200); } catch (e) {} if (autoHint >= 2 && hintBox.hidden) showHint(); }
  }
  function success(solved) {
    if (lock) return; lock = true; const st = Ls.steps[i];
    xp += solved ? 2 : 10; xpEl.textContent = xp + ' XP';
    bubble.classList.remove('no'); bubble.classList.add('ok'); bubble.replaceChildren(h('span', { class: 'xt-okc', html: ico('check') }), ...rich(solved ? 'So geht’s – schau dir an, was passiert ist. Weiter geht’s.' : (st.praise ? st.praise(G, S()) : quip())));
    try { fc && fc.pulse('happy', 1400); } catch (e) {}
    G.setTarget(null);
    setTimeout(() => { if (!playEl.isConnected) return; if (i + 1 < Ls.steps.length) { setStep(i + 1); G.focus(); } else finish(); }, solved ? 1600 : (st.praise ? 2200 : 1200));
  }
  function finish() {
    finished = true; clearInterval(timer); const secs = t0 ? (Date.now() - t0) / 1000 : 0; const n = starsOf(Ls, hints, wrong, secs);
    const p = prog(); const old = p.done[Ls.id]; if (!old || n > old.stars || (n === old.stars && secs < old.secs)) p.done[Ls.id] = { stars: n, secs: Math.round(secs), at: Date.now() }; saveProg(p);
    try { if (window.BM) window.BM.track('Excel-Trainer Lektion', Ls.id + ' · ' + n + '★'); } catch (e) {}
    const nx = LESSONS[LESSONS.indexOf(Ls) + 1];
    const conf = h('div', { class: 'xt-conf' }); for (let k = 0; k < 60; k++) conf.append(h('i', { style: { left: Math.random() * 100 + '%', background: ['#1D6F42', '#1F3A5F', '#9db7da', '#f5c542', '#2fd27a'][k % 5], animationDelay: Math.random() * .5 + 's', '--dx': (Math.random() * 160 - 80) + 'px' } }));
    const card = h('div', { class: 'xt-done' }, conf, h('small', {}, 'Lektion geschafft'), h('b', {}, Ls.title), starRow(n, true),
      h('div', { class: 'xt-dst' }, h('span', {}, h('b', {}, mmss(secs)), 'Zeit'), h('span', {}, h('b', {}, String(xp)), 'XP'), h('span', {}, h('b', {}, String(hints)), 'Tipps')),
      h('p', {}, Ls.done), n < 3 ? h('small', { class: 'xt-d3' }, Ls.challenge ? 'Für 3 ★: unter 3 Minuten und ohne Tipp.' : 'Für 3 ★: ohne Tipp und höchstens ein Fehlversuch.') : null,
      h('div', { class: 'xt-dbtn' }, h('button', { class: 'btn ghost', type: 'button', onclick: () => play2(Ls.id) }, h('span', { html: ico('refresh') }), 'Nochmal'),
        nx ? h('button', { class: 'btn primary', type: 'button', onclick: () => play2(nx.id) }, 'Nächste Lektion: ' + nx.title, h('span', { html: ico('right') })) : h('button', { class: 'btn primary', type: 'button', onclick: () => overview(el) }, 'Alles geschafft – zur Übersicht')));
    playEl.append(h('div', { class: 'xt-ov' }, card)); try { fc && fc.pulse('happy', 3000); } catch (e) {}
  }
  const play2 = id2 => trainer(el.parentNode || el, { start: id2 });
  setStep(0); setTimeout(() => G.focus(), 50);
}
