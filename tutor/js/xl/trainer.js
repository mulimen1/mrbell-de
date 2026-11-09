// Excel-Trainer: ein Excel-Nachbau im Browser, 3 Stufen, 16 Lektionen; jeder Schritt wird am echten Zustand der Tabelle geprüft.
// Läuft an zwei Stellen mit demselben Code:
//   App (tutor/js/views/excel.js, #/app/excel/trainer): Max begleitet als Coach (Gesicht, freche Sprüche, Varianten „m“ in lessons.js).
//   Werkzeugseite (tutor/tools/excel-trainer.html, Einstieg tutor/tools/xl/trainer-seite.js): neutral, ohne Max, ohne App-JS.
// Alles, was nur die App hat (Gesicht, Toast, Zählung), kommt über die Optionen herein – diese Datei importiert kein App-JS.
import { h, ico, store } from './dom.js';
import { engine } from './core.js';
import { Grid } from './grid.js';
import { LESSONS, LEVELS } from './lessons.js';
import { keyset, isMac, CHEAT, CHEAT_NOTE_MAC, CHEAT_NOTE_WIN } from './keys.js';

const TM = 'Der Excel-Trainer ist ein eigener Nachbau von BWL Max – keine Microsoft-Software und kein Microsoft-Produkt. Er dient ausschließlich dem Lernen. BWL Max steht in keiner Verbindung zu Microsoft und wird von Microsoft weder unterstützt noch gesponsert. Microsoft und Excel sind Marken der Microsoft Corporation.';
const QUIPS_APP = ['Sauber. Dein Prof wäre fast beeindruckt.', 'Läuft. Excel hat jetzt Respekt vor dir.', 'Schneller als die Mensa-Schlange.', 'So arbeitet man im Investmentbanking. Nur ohne 90-Stunden-Woche.', 'Zack. Genau so.', 'Das hätte ich nicht besser gemacht. Okay, minimal.', 'Sitzt. Weiter.', 'Elegant. Fast schon arrogant.'];
const PRAISE_TOOL = ['Richtig.', 'Stimmt genau.', 'Passt – weiter geht’s.', 'Gut gemacht.', 'Genau so.', 'Richtig gelöst.'];
const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const starsOf = (L, hints, wrong, secs) => L.challenge ? (hints === 0 && secs <= 180 ? 3 : secs <= 300 && hints <= 1 ? 2 : 1) : (hints === 0 && wrong <= 1 ? 3 : hints <= 2 ? 2 : 1);
const starRow = (n, big) => h('span', { class: 'xt-stars' + (big ? ' big' : ''), role: 'img', 'aria-label': n + ' von 3 Sternen' }, [1, 2, 3].map(k => h('i', { class: k <= n ? 'on' : '', style: { '--k': k }, 'aria-hidden': 'true' }, '★')));
const CLOCK = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>';

// Zellen eines Bereichs („B8:E8“ → B8, C8, D8, E8)
const cellsOf = t => { const m = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/.exec(t || ''); if (!m) return []; const c0 = m[1].charCodeAt(0), c1 = (m[3] || m[1]).charCodeAt(0), r0 = +m[2], r1 = +(m[4] || m[2]); const out = []; for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) out.push(String.fromCharCode(c) + r); return out; };
// Funktionen, die eine Aufgabe in **=…** vorgibt (deutsch → englisch wie in der Engine)
const FN_EN = { SUMME: 'SUM', MITTELWERT: 'AVERAGE', MAX: 'MAX', MIN: 'MIN', WENN: 'IF', 'ZÄHLENWENN': 'COUNTIF', SVERWEIS: 'VLOOKUP', XVERWEIS: 'XLOOKUP', RUNDEN: 'ROUND', NBW: 'NPV', IKV: 'IRR', RMZ: 'PMT', INDEX: 'INDEX', VERGLEICH: 'MATCH', SUMMEWENN: 'SUMIF', SUMMEWENNS: 'SUMIFS' };
const fnsIn = say => { const out = new Set(); for (const m of String(say || '').matchAll(/\*\*(=[^*]+)\*\*/g)) for (const f of m[1].matchAll(/([A-ZÄÖÜ]+)\(/g)) if (FN_EN[f[1]]) out.add(FN_EN[f[1]]); return [...out]; };

/**
 * trainer(body, opts)
 *   opts.app      true = in der App (Max als Coach, Varianten „m“)
 *   opts.key      Speicherschlüssel für den Fortschritt (nur im Browser)
 *   opts.face     (el, {follow}) → Gesicht mit .pulse(state, ms)   (nur App)
 *   opts.toast    (text) → kurze Meldung
 *   opts.track    (name, detail) → Zählung (nur App)
 *   opts.tplHref  (id) → Link zur passenden Excel-Vorlage
 *   opts.full     (el, on) → Lektion als ganzes Feld (App blendet Kopf und Reiter aus)
 *   opts.cheatHref  Link zum druckbaren Spickzettel (Werkzeugseite)
 *   opts.start    Lektion direkt öffnen
 */
export function trainer(body, opts = {}) {
  const C = Object.assign({ app: false, key: 'tutor.xltrain', toast: () => {}, track: () => {}, tplHref: null, full: () => {}, face: null }, opts);
  C.mac = isMac(); C.K = keyset(C.mac);
  const el = h('div', { class: 'xt' + (C.app ? ' xt-app' : ' xt-tool') }); body.replaceChildren(el);
  C.root = el; C.body = body;
  C.start ? play(C, C.start) : overview(C);
  return { open: id => play(C, id), overview: () => overview(C) };
}

// ---------- Hilfen ----------
const T = (C, o, k) => (C.app && o.m && o.m[k] !== undefined ? o.m[k] : o[k]);
const prog = C => { const p = store.get(C.key, null); return p && p.done ? p : { done: {} }; };
const saveProg = (C, p) => store.set(C.key, p);
const kbd = (C, spec) => { const parts = C.K.keys(spec); return h('span', { class: 'xt-kc', 'aria-label': parts.join(' + ') }, ...parts.flatMap((p, i) => [i ? h('i', { 'aria-hidden': 'true' }, '+') : null, h('kbd', { 'aria-hidden': 'true' }, p)]).filter(Boolean)); };
const note = (C, t) => String(t || '').replace(/\{(\w+)\}/g, (_, k) => C.K.NOTES[k] || '');
function rich(C, text) {
  const out = []; const re = /(\*\*.+?\*\*(?!\*)|\[\[[^\]]+\]\])/g; let last = 0, m; const s = note(C, text);
  while ((m = re.exec(s))) { if (m.index > last) out.push(s.slice(last, m.index)); const t = m[0]; out.push(t[0] === '*' ? h('b', {}, t.slice(2, -2)) : kbd(C, t.slice(2, -2))); last = m.index + t.length; }
  if (last < s.length) out.push(s.slice(last)); return out;
}
const plain = (C, text) => note(C, text).replace(/\*\*/g, '').replace(/\[\[([^\]]+)\]\]/g, (_, k) => C.K.text(k));
const disc = () => h('p', { class: 'xt-disc' }, h('b', {}, 'Hinweis: '), TM);
const btn = (cls, label, onclick, icon) => h('button', { class: 'btn xt-btn ' + cls, type: 'button', onclick }, icon ? h('span', { class: 'xt-bi', html: ico(icon) }) : null, label);
const lessonById = id => LESSONS.find(l => l.id === id);
const levelDone = (p, n) => LESSONS.filter(l => l.lvl === n).every(l => p.done[l.id]);

// ---------- Übersicht: Lernpfad ----------
function overview(C) {
  const el = C.root; C.full(el, false);
  const p = prog(C), done = id => p.done[id], total = LESSONS.length;
  const nDone = LESSONS.filter(l => done(l.id)).length, stars = LESSONS.reduce((a, l) => a + ((done(l.id) && done(l.id).stars) || 0), 0);
  const last = p.last && lessonById(p.last) && !done(p.last) ? lessonById(p.last) : null;
  const next = last || LESSONS.find(l => !done(l.id)) || null;
  const lead = C.app
    ? 'Ein echter Excel-Nachbau, echte Tastenkürzel, echte BWL-Aufgaben. Max führt dich Schritt für Schritt – vom ersten =B2*C2 bis zum Tilgungsplan. Du machst es selbst, er sagt dir sofort, ob’s sitzt.'
    : 'Ein Excel-Nachbau im Browser: Du tippst selbst, nutzt echte Tastenkürzel und bekommst zu jedem Schritt sofort Rückmeldung. Jede Lektion endet mit einer kleinen BWL-Aufgabe.';
  const goBtn = next
    ? btn('primary xt-go', last ? 'Weiter, wo du warst: ' + next.title : nDone ? 'Weiter: ' + next.title : 'Mit Lektion 1 starten', () => (nDone || last) ? play(C, next.id) : play(C, LESSONS[0].id), 'right')
    : btn('primary xt-go', 'Alles geschafft – Lektion wiederholen', () => pickLevel(C), 'refresh');
  if (C.app) { goBtn.classList.remove('btn', 'primary', 'xt-btn'); goBtn.classList.add('go-btn', 'go-lg'); const ic = goBtn.querySelector('.xt-bi'); if (ic) ic.remove(); }   // App: großer Lila-Knopf wie bisher
  const fEl = C.app && C.face ? h('div', { class: 'xt-hface', 'aria-hidden': 'true' }) : null;
  if (fEl) setTimeout(() => { try { C.face(fEl, { follow: true }); } catch (e) {} }, 0);
  const hero = h('div', { class: 'xt-hero' }, C.app ? cheatDrop(C) : null, fEl,
    h('div', { class: 'xt-htx' }, h('b', { class: 'xt-h' }, C.app ? 'Excel lernen – mit Max.' : 'Dein Lernpfad'), h('p', {}, lead),
      h('div', { class: 'xt-hst' },
        h('span', {}, h('b', {}, String(nDone)), ' / ' + total + ' Lektionen'), h('span', {}, h('b', {}, String(stars)), ' / ' + total * 3 + ' Sterne'),
        h('div', { class: 'xt-hbtn' }, goBtn, btn('ghost', 'Stufe wählen', () => pickLevel(C))))));
  const tail = [];
  if (!C.app) {
    tail.push(h('p', { class: 'xt-local' }, 'Dein Fortschritt wird nur in diesem Browser gespeichert (lokaler Speicher) – nicht bei uns, ohne Konto. ',
      C.cheatHref ? [h('a', { href: C.cheatHref }, 'Kürzel-Spickzettel für Windows und Mac'), ' · '] : null,
      nDone || p.last ? h('button', { type: 'button', class: 'xt-link', onclick: () => { if (confirm('Fortschritt in diesem Browser löschen?')) { store.set(C.key, { done: {} }); overview(C); } } }, 'Fortschritt löschen') : null));
  }
  const coarse = (() => { try { return matchMedia('(pointer: coarse)').matches || innerWidth < 760; } catch (e) { return false; } })();
  el.replaceChildren(...[hero,
    coarse ? h('p', { class: 'xt-phone', role: 'note' }, C.app ? 'Tipp: Am Laptop macht’s am meisten Sinn – dort funktionieren die Tastenkürzel wie im echten Excel.' : 'Am besten am Laptop oder PC: Viele Schritte üben Tastenkürzel und brauchen eine echte Tastatur. Auf dem Handy kannst du die Lektionen ansehen und antippen; für Kürzel-Schritte hilft „Lösung zeigen“.') : null,
    ...tail,
    h('div', { class: 'xt-levels' }, LEVELS.map(lv => {
      const ls2 = LESSONS.filter(l => l.lvl === lv.n), got = ls2.filter(l => done(l.id)).length;
      return h('section', { class: 'xt-lv' + (got === ls2.length ? ' complete' : ''), style: { '--lc': lv.col }, 'aria-label': 'Stufe ' + lv.n + ': ' + lv.title },
        h('header', {}, h('span', { class: 'xt-lvn' }, 'Stufe ' + lv.n + (got === ls2.length ? ' · abgeschlossen' : '')), h('b', {}, lv.title), h('small', {}, lv.sub),
          h('div', { class: 'xt-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': ls2.length, 'aria-valuenow': got, 'aria-label': got + ' von ' + ls2.length + ' Lektionen geschafft' }, h('i', { style: { width: (got / ls2.length * 100) + '%' } }))),
        h('ol', {}, ls2.map((l, i) => { const d = done(l.id); return h('li', {}, h('button', { type: 'button', class: 'xt-ls' + (d ? ' done' : '') + (next && next.id === l.id ? ' next' : ''), onclick: () => play(C, l.id), 'aria-label': 'Lektion ' + (i + 1) + ': ' + l.title + (d ? ', geschafft, ' + d.stars + ' von 3 Sternen' : '') },
          h('span', { class: 'xt-lsn', 'aria-hidden': 'true' }, d ? '✓' : String(i + 1)), h('span', { class: 'xt-lst' }, h('b', {}, l.title, l.challenge ? h('em', {}, 'Challenge') : null), h('small', {}, l.desc)), d ? starRow(d.stars) : h('span', { class: 'xt-lsgo', html: ico('right') }))); })));
    })),
    disc()].filter(Boolean));
}
// Einstieg: Wie viel Excel kannst du schon?
function pickLevel(C) {
  const OPTS = [[1, 'Noch nicht viel', 'Die Basics: eingeben, erste Formeln, SUMME, ausfüllen, formatieren.'], [2, 'Formeln und SUMME kann ich', '$-Bezüge, WENN, SVERWEIS, Prozente und schnelles Navigieren.'], [3, 'Ich bin schon fit', 'Kapitalwert, Tilgungsplan, INDEX/VERGLEICH und SUMMEWENN(S).']];
  const prev = document.activeElement;
  const close = () => { ov.remove(); document.removeEventListener('keydown', onKey, true); try { prev && prev.focus(); } catch (e) {} };
  const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } if (e.key === 'Tab') { const f = [...ov.querySelectorAll('button')]; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } } };
  const ov = h('div', { class: 'xt-pick' + (C.app ? ' xt-app' : ' xt-tool'), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'xt-pick-t', onclick: e => { if (e.target === ov) close(); } },
    h('div', { class: 'xt-pcard' }, h('b', { id: 'xt-pick-t' }, 'Wie viel Excel kannst du schon?'), h('p', {}, 'Du kannst jederzeit die Stufe wechseln.'),
      OPTS.map(([n, t, sub]) => { const lv = LEVELS.find(x => x.n === n); return h('button', { type: 'button', class: 'xt-popt', style: { '--lc': lv.col }, onclick: () => { close(); play(C, LESSONS.find(l => l.lvl === n).id); } }, h('span', { class: 'xt-lvn' }, 'Stufe ' + n + ' · ' + lv.title), h('strong', {}, t), h('small', {}, sub)); }),
      btn('ghost', 'Abbrechen', close)));
  document.body.append(ov); document.addEventListener('keydown', onKey, true); setTimeout(() => { const b = ov.querySelector('.xt-popt'); if (b) b.focus(); }, 30);
}
// Spickzettel (App: aufklappbar oben rechts, nur für das eigene Gerät)
function cheatDrop(C) {
  const col = C.mac ? 2 : 1;
  return h('details', { class: 'xt-cheat' }, h('summary', {}, h('span', { html: ico('keys') }), 'Spickzettel', h('small', {}, C.mac ? 'Mac' : 'Windows'), h('span', { class: 'xt-chv', html: ico('down') })),
    h('div', { class: 'xt-chp' }, h('table', {}, h('tbody', {}, CHEAT.map(r => h('tr', {}, h('td', {}, r[0]), h('td', {}, r[col].map((s, i) => [i ? ' ' : null, kbd(C, s)])))))),
      h('p', {}, C.mac ? CHEAT_NOTE_MAC : CHEAT_NOTE_WIN)));
}

// ---------- Lektion ----------
async function play(C, id) {
  const el = C.root;
  const Ls = lessonById(id); if (!Ls) return overview(C);
  const lv = LEVELS.find(x => x.n === Ls.lvl);
  { const p = prog(C); p.last = Ls.id; saveProg(C, p); }
  C.full(el, true); el.replaceChildren(h('div', { class: 'xt-load', role: 'status' }, 'Tabelle wird geladen …'));
  let E; try { E = await engine(); } catch (e) { el.replaceChildren(h('p', { class: 'xt-load' }, 'Das Rechenmodul konnte nicht geladen werden. Bitte die Seite neu laden.')); return; }
  if (!el.isConnected) return;
  let i = 0, stepStart = 0, hints = 0, wrong = 0, t0 = 0, xp = 0, lock = false, finished = false, timer = 0, autoHint = 0;
  const G = new Grid({ E, cols: Ls.cols.length, rows: Ls.rows, widths: Ls.cols, cells: Ls.cells, onEvent: ev => onEvent(ev) });
  const K = C.K;
  // Kopf
  const clock = h('span', { class: 'xt-clock', 'aria-label': 'Zeit' }, '0:00'), xpEl = h('span', { class: 'xt-xp' }, '0 XP');
  const dots = h('div', { class: 'xt-dots', 'aria-hidden': 'true' }, Ls.steps.map(() => h('i')));
  const top = h('div', { class: 'xt-top', style: { '--lc': lv.col } },
    btn('ghost sm', 'Übersicht', () => { clearInterval(timer); overview(C); }, 'left'),
    h('span', { class: 'xt-lvb' }, 'Stufe ' + lv.n + ' · ' + lv.title), h('h3', { class: 'xt-tt', tabindex: '-1' }, Ls.title), dots, h('span', { class: 'xt-sp' }),
    Ls.challenge ? h('span', { class: 'xt-chal' }, h('span', { html: CLOCK }), 'Challenge') : null, clock, xpEl);
  // Excel-Fenster mit kleiner Menüleiste (Klick-Alternative zu den Kürzeln)
  const rb = (label, title, fn, cls) => h('button', { type: 'button', class: 'xt-rb' + (cls ? ' ' + cls : ''), title, 'aria-label': title, onmousedown: e => e.preventDefault(), onclick: () => { fn(); G.focus(); } }, label);
  const ribbon = h('div', { class: 'xt-ribbon', role: 'toolbar', 'aria-label': 'Menüleiste' },
    h('span', { class: 'xt-rtab' }, 'Start'),
    rb(h('b', {}, 'F'), 'Fett (' + K.text('bold') + ')', () => G.toggleBold()),
    rb('€', 'Währung (' + K.text('fmt4') + ')', () => G.format('eur')),
    rb('%', 'Prozent (' + K.text('fmt5') + ')', () => G.format('pct')),
    h('i', { class: 'xt-rsep' }),
    rb('Σ AutoSumme', 'AutoSumme (' + K.text('autosum') + ')', () => { if (!G.editing) G.autosum(); }, 'w'),
    rb('↓ Ausfüllen', 'Nach unten ausfüllen (' + K.text('filldown') + ')', () => { if (!G.editing) G.fillDown(); }, 'w'),
    rb('↶', 'Rückgängig (' + K.text('mod+Z') + ')', () => { if (!G.editing) G.undo(); }));
  const win = h('div', { class: 'xt-win' }, h('div', { class: 'xt-wt' }, h('i'), h('i'), h('i'), h('span', {}, 'Mappe1 – Excel-Trainer'), h('small', {}, 'Nachbau · keine Microsoft-Software')), ribbon, G.el, h('div', { class: 'xt-sheets' }, h('span', { class: 'on' }, Ls.title.split(':')[0].slice(0, 22)), h('span', { 'aria-hidden': 'true' }, '+')));
  // Coach (App: Max; Werkzeugseite: neutrale Aufgabenkarte)
  const fEl = C.app && C.face ? h('div', { class: 'xt-face', 'aria-hidden': 'true' }) : h('div', { class: 'xt-cic', html: ico('target') }); let fc = null;
  if (C.app && C.face) setTimeout(() => { try { fc = C.face(fEl, { follow: false }); } catch (e) {} }, 0);
  const pulse = (s, ms) => { try { fc && fc.pulse(s, ms); } catch (e) {} };
  const bubble = h('div', { class: 'xt-say', 'aria-live': 'polite' }), hintBox = h('div', { class: 'xt-hint', hidden: true, 'aria-live': 'polite' }), cnt = h('small', { class: 'xt-cnt' });
  const goal = h('div', { class: 'xt-goal' });
  const hintBtn = btn('ghost sm', 'Tipp', () => { if (lock) return; hints++; showHint(); G.focus(); }, 'bulb');
  const solveBtn = btn('ghost sm', 'Lösung zeigen', () => { const st = Ls.steps[i]; if (!st || lock) return; hints += 2; try { st.solve && st.solve(G); } catch (e) {} if (!lock) success(true); G.focus(); }, 'eye');
  const list = h('ol', { class: 'xt-steps', 'aria-label': 'Schritte dieser Lektion' }, Ls.steps.map((s, k) => h('li', {}, h('i', { 'aria-hidden': 'true' }, String(k + 1)), h('span', {}, plain(C, T(C, s, 'say')).split(/[.:!?](\s|$)/)[0].slice(0, 64)))));
  const coach = h('aside', { class: 'xt-coach', 'aria-label': C.app ? 'Max' : 'Aufgabe' }, h('div', { class: 'xt-chd' }, fEl, h('div', {}, h('b', {}, C.app ? 'Max' : 'Aufgabe'), cnt)), bubble, goal, hintBox, h('div', { class: 'xt-cbtn' }, hintBtn, solveBtn), list);
  const stage = h('div', { class: 'xt-stage' }, win, coach);
  const playEl = h('div', { class: 'xt-play' }, top, stage, disc());
  el.replaceChildren(playEl);
  if (!C.app && playEl.scrollIntoView) { try { const r = playEl.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * .5) playEl.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) {} }

  function showHint() { const st = Ls.steps[i]; hintBox.hidden = false; hintBox.replaceChildren(h('span', { html: ico('bulb') }), h('span', {}, rich(C, T(C, st, 'hint') || 'Lies die Aufgabe nochmal Wort für Wort – jede Taste steht drin.'))); }
  function setStep(k) {
    i = k; stepStart = G.log.length; autoHint = 0; hintBox.hidden = true; lock = false;
    const st = Ls.steps[i]; bubble.classList.remove('ok', 'no'); bubble.replaceChildren(...(st.mini ? [h('span', { class: 'xt-mini' }, 'BWL-Aufgabe')] : []), ...rich(C, T(C, st, 'say'))); cnt.textContent = 'Schritt ' + (i + 1) + ' von ' + Ls.steps.length;
    goal.replaceChildren(...(st.target ? [h('span', {}, st.target.includes(':') ? 'Zielbereich' : 'Zielzelle'), h('b', {}, st.target.replace(':', ' bis '))] : [])); goal.hidden = !st.target;
    [...dots.children].forEach((d, j) => { d.className = j < i ? 'ok' : j === i ? 'now' : ''; }); [...list.children].forEach((li, j) => { li.className = j < i ? 'ok' : j === i ? 'now' : ''; if (j === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    G.setTarget(st.target || null); pulse('smug', 900);
    // Schon erfüllt (z. B. durch einen vorigen Schritt)? Dann nicht hängen bleiben.
    setTimeout(() => { if (!lock && !finished && i === k && Ls.steps[i].ok(G, S()) && fxOK(Ls.steps[i])) success(); }, 60);
  }
  // Formel-Pflicht: needF oder eine vorgegebene Formel (**=…**) → in allen Zielzellen eine echte Formel mit Zellbezug,
  // und die vorgegebenen Funktionen (z. B. SVERWEIS) müssen darin vorkommen
  const fxOK = st => {
    const say = st.say || '', fns = fnsIn(say), need = st.needF || /\*\*=/.test(say);
    if (!need) return true;
    return cellsOf(st.target).every(r => { const f = G.fx(r); return !!f && /\$?[A-Z]{1,2}\$?\d/.test(f.replace(/"[^"]*"/g, '')) && fns.every(n => new RegExp('(^|[^A-Z.])' + n + '\\(').test(f)); });
  };
  const fxWhy = st => { const fns = fnsIn(st.say); const miss = cellsOf(st.target).find(r => !G.fx(r)); if (miss) return 'Ergebnis stimmt – aber bitte als Formel mit = eingeben' + (cellsOf(st.target).length > 1 ? ' (' + miss + ')' : '') + ', damit Excel neu rechnet, wenn sich etwas ändert.'; if (fns.length) return 'Ergebnis stimmt – nimm aber die Funktion aus der Aufgabe: ' + fns.map(n => Object.keys(FN_EN).find(k => FN_EN[k] === n)).join(', ') + '.'; return 'Ergebnis stimmt – aber die Formel soll auf die Zellen zeigen, nicht auf getippte Zahlen.'; };
  const inTarget = (st, ref) => !st.target || cellsOf(st.target).includes(ref) || (st.also || []).includes(ref);
  const S = () => ({ used: (t, pred) => G.log.slice(stepStart).some(e => e.t === t && (!pred || pred(e))), last: (t, pred) => G.log.slice(stepStart).reverse().find(e => e.t === t && (!pred || pred(e))) });
  function bad(msg) { wrong++; autoHint++; bubble.classList.remove('no'); void bubble.offsetWidth; bubble.classList.add('no'); G.showMsg(msg, 'bad'); pulse('sad', 1200); if (autoHint >= 2 && hintBox.hidden) showHint(); }
  function onEvent(ev) {
    if (finished || lock) return;
    if (!t0 && ev.t !== 'select') { t0 = Date.now(); timer = setInterval(() => { if (!clock.isConnected) return clearInterval(timer); clock.textContent = mmss((Date.now() - t0) / 1000); }, 500); }
    if (['edit', 'point', 'pointclick', 'cancel'].includes(ev.t)) return;
    if (ev.t === 'badformula') { wrong++; autoHint++; if (autoHint >= 2 && hintBox.hidden) showHint(); return; }
    const st = Ls.steps[i]; if (!st) return; const s = S();
    if (st.ok(G, s)) { if (fxOK(st)) { success(); return; } if (ev.t === 'commit' && ev.how !== 'solve') { bad(fxWhy(st)); return; } }
    const wr = T(C, st, 'wrong');
    let msg = wr ? wr(G, s, ev) : null;
    if (msg) msg = plain(C, msg);
    if (!msg && ev.t === 'commit' && ev.how !== 'solve' && st.target && !inTarget(st, ev.ref)) msg = 'Das war Zelle ' + ev.ref + ' – die Aufgabe gehört in ' + st.target.replace(':', ' bis ') + '. Mit ' + K.text('mod+Z') + ' machst du es rückgängig.';
    if (!msg && ev.t === 'commit' && ev.how !== 'solve' && st.target && !st.target.includes(':') && ev.ref === st.target) msg = 'Noch nicht ganz. Schau dir die Aufgabe nochmal genau an – oder hol dir einen Tipp.';
    if (msg) bad(msg);
  }
  function success(solved) {
    if (lock) return; lock = true; const st = Ls.steps[i];
    xp += solved ? 2 : 10; xpEl.textContent = xp + ' XP';
    const pr = T(C, st, 'praise');
    const say = solved ? 'So geht’s – schau dir an, was passiert ist. Weiter geht’s.' : pr ? pr(G, S()) : (C.app ? QUIPS_APP : PRAISE_TOOL)[Math.floor(Math.random() * (C.app ? QUIPS_APP : PRAISE_TOOL).length)];
    bubble.classList.remove('no'); bubble.classList.add('ok'); bubble.replaceChildren(h('span', { class: 'xt-okc', html: ico('check') }), ...rich(C, say));
    pulse('happy', 1400); G.setTarget(null); goal.hidden = true; hintBox.hidden = true;
    setTimeout(() => { if (!playEl.isConnected) return; if (i + 1 < Ls.steps.length) { setStep(i + 1); G.focus(); } else finish(); }, solved ? 1600 : (pr ? 2600 : 1200));
  }
  function finish() {
    finished = true; clearInterval(timer); const secs = t0 ? (Date.now() - t0) / 1000 : 0; const n = starsOf(Ls, hints, wrong, secs);
    const p = prog(C); const before = levelDone(p, Ls.lvl); const old = p.done[Ls.id];
    if (!old || n > old.stars || (n === old.stars && secs < old.secs)) p.done[Ls.id] = { stars: n, secs: Math.round(secs), at: Date.now() };
    if (p.last === Ls.id) delete p.last; saveProg(C, p);
    const lvlNow = !before && levelDone(p, Ls.lvl);
    try { C.track('Excel-Trainer Lektion', Ls.id + ' · ' + n + ' Sterne'); } catch (e) {}
    const nx = LESSONS[LESSONS.indexOf(Ls) + 1];
    const conf = h('div', { class: 'xt-conf', 'aria-hidden': 'true' }); for (let k = 0; k < 60; k++) conf.append(h('i', { style: { left: Math.random() * 100 + '%', background: ['#1D6F42', '#1F3A5F', '#9db7da', '#f5c542', '#2fd27a'][k % 5], animationDelay: Math.random() * .5 + 's', '--dx': (Math.random() * 160 - 80) + 'px' } }));
    const tpl = Ls.tpl && C.tplHref ? h('p', { class: 'xt-tpl' }, h('span', { html: ico('file') }), h('span', {}, 'Diese Rechnung als fertige Vorlage: ', h('a', { href: C.tplHref(Ls.tpl[0]) }, Ls.tpl[1]))) : null;
    const lvBox = lvlNow ? h('div', { class: 'xt-lvdone', style: { '--lc': lv.col } }, h('b', {}, h('span', { html: ico('trophy') }), 'Stufe ' + lv.n + ' abgeschlossen: ' + lv.title), h('p', {}, 'Das kannst du jetzt:'), h('ul', {}, (lv.can || []).map(c => h('li', {}, c)))) : null;
    const nextBtn = nx ? btn('primary', (nx.lvl !== Ls.lvl ? 'Weiter mit Stufe ' + nx.lvl + ': ' : 'Nächste Lektion: ') + nx.title, () => play(C, nx.id), 'right') : btn('primary', 'Alles geschafft – zur Übersicht', () => overview(C), 'right');
    const card = h('div', { class: 'xt-done', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'xt-done-t' }, conf, h('small', {}, lvlNow ? 'Lektion und Stufe geschafft' : 'Lektion geschafft'), h('b', { id: 'xt-done-t' }, Ls.title), starRow(n, true),
      h('div', { class: 'xt-dst' }, h('span', {}, h('b', {}, mmss(secs)), 'Zeit'), h('span', {}, h('b', {}, String(xp)), 'XP'), h('span', {}, h('b', {}, String(hints)), 'Tipps')),
      h('p', {}, T(C, Ls, 'done')), lvBox, tpl, n < 3 ? h('small', { class: 'xt-d3' }, Ls.challenge ? 'Für 3 Sterne: unter 3 Minuten und ohne Tipp.' : 'Für 3 Sterne: ohne Tipp und höchstens ein Fehlversuch.') : null,
      h('div', { class: 'xt-dbtn' }, btn('ghost', 'Nochmal', () => play(C, Ls.id), 'refresh'), btn('ghost', 'Übersicht', () => overview(C)), nextBtn));
    playEl.append(h('div', { class: 'xt-ov' }, card)); pulse('happy', 3000);
    setTimeout(() => { try { card.querySelector('.xt-btn.primary').focus({ preventScroll: true }); } catch (e) {} }, 60);
  }
  setStep(0); setTimeout(() => G.focus(), 50);
}
