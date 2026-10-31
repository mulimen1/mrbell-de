// bwlmax.de/start – Landingpage für Besucher aus der Werbung (YouTube, Reddit …): Sofort-Demo ohne Konto.
// Ablauf: Max begrüßt → Demo-Skript wählen → Lernzettel / Karteikarten / Quiz / Podcast wählen →
// das echte Ergebnis baut sich sichtbar auf (die echten Ansichten aus views/) → herunterladen →
// „Mit meinem Skript loslegen“ öffnet die normale Anmeldung (openAuth) → danach Tutor/Upload.
// Kostet pro Besucher nichts: Inhalte liegen fertig in /tutor/data/demo/start.json (gebaut und geprüft mit
// /home/claude/seo/demo_start.py), der Podcast als fertige Audiodateien in /tutor/audio/demo/<skript>/<zeile>.mp3
// (einmalig mit den echten Stimmen Marie & Max vertont). Solange die Demo offen ist (html.bm-demo) sperrt api.js alle KI-Aufrufe für Gäste.
import { h, ico, sleep } from './util.js';
import { face } from './face.js';
import { S, migrate } from './state.js';
import { getAccount, onAccount } from './api.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const qs = new URLSearchParams(location.search);
const SRC = (qs.get('utm_source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
const SRC_NAME = { youtube: 'YouTube', reddit: 'Reddit' }[SRC] || SRC || 'direkt';   // Quelle der Anzeige (utm_source), geht als Detail an „Anmeldefenster gesehen“
const track = (e, d) => { try { window.BM && window.BM.track(e, d || ''); } catch (x) {} };

// Bereichsfarben exakt wie die Lerntools-Kacheln im Tutor-Raum (.rm-tl [data-ic]) und die Topnav
const F = {
  zettel: { t: 'Lernzettel', s: 'mit Mindmap', ic: 'note', c: ['#f7c948', '#d18e06'], ink: 'dark', view: () => import('./views/summary.js'), h: 'Ich schreibe deinen Lernzettel …', ok: 'Fertig. Ein Lernzettel, für den andere ein Wochenende brauchen.' },
  karten: { t: 'Karteikarten', s: 'mit Wiederholung', ic: 'cards', c: ['#3fc1c9', '#0e7f8e'], view: () => import('./views/cards.js'), h: 'Ich schreibe deine Karteikarten …', ok: 'Karten umdrehen, ehrlich bewerten. Ich merk mir, was wackelt.' },
  quiz: { t: 'Quiz', s: 'wie in der Klausur', ic: 'quiz', c: ['#9b7cf0', '#5b3fc4'], view: () => import('./views/quizview.js'), h: 'Ich baue dein Quiz …', ok: 'Klausurniveau. Wer hier durchkommt, kommt auch durch die echte.' },
  podcast: { t: 'Podcast', s: 'Marie & Max', ic: 'headphones', c: ['#f47ba0', '#c8336f'], view: () => import('./views/podcast.js'), h: 'Marie und ich nehmen auf …', ok: 'Marie erklärt, ich frag dumm nach. Läuft im Gym, in der Bahn, überall.' },
};
// Lange Fachwörter auf kleinen Kärtchen sauber trennen (weiches Trennzeichen)
const shy = t => String(t).replace('Deckungsbeitragsrechnung', 'Deckungs­beitrags­rechnung').replace('Kapitalwertmethode', 'Kapital­wert­methode');
const ORDER = ['zettel', 'karten', 'quiz', 'podcast'];
// Skript-Farben wie die Bereichsfarben der App (gelb = Lernzettel/Notizen, blau = Tafel, orange = Fächer/Bibliothek)
const FACH = { db: { c: ['#f7c948', '#d18e06'], ink: 'dark' }, kw: { c: ['#5aa2f7', '#1a5fc4'] }, swot: { c: ['#f39b52', '#d9601c'], ink: 'dark' } };
const fach = k => FACH[k] || FACH.db;

let root = null, data = null, cur = null, fmt = null, made = new Set(), viewClean = null, offAcc = null, busy = 0, offPop = null;

export async function mountStart() {
  const H = document.documentElement;
  H.classList.add('bm-start', 'bm-demo');
  try { sessionStorage.setItem('tutor.hintShown', '1'); sessionStorage.setItem('bm.demoSrc', SRC_NAME); } catch (e) {}   // kein „Bleib hier“-Hinweis: die Demo hat ihren eigenen Knopf
  if (root && root.isConnected) return;
  document.title = 'BWL Max – Probier’s aus: Lernzettel, Karteikarten, Quiz & Podcast in Sekunden';
  document.body.style.overflow = '';
  root = h('div', { id: 'bmstart', class: 'bms' });
  document.body.prepend(root);
  offAcc = onAccount(a => { if (a && root) finish(); });
  hello();
  track('Demo geöffnet', SRC_NAME);
  try { data = await (await fetch('/tutor/data/demo/start.json?v=1')).json(); } catch (e) { data = null; }
  pickScript();
}

export function unmountStart() {
  const H = document.documentElement;
  H.classList.remove('bm-start', 'bm-demo');
  cleanupView();
  if (S.doc && S.doc.demo) S.doc = null;
  if (offAcc) { try { offAcc(); } catch (e) {} offAcc = null; }
  root && root.remove(); root = null; cur = null; fmt = null; made = new Set(); ws = null;
}

// Angemeldet (über den großen Knopf oder irgendwo in der Demo): raus aus der Demo, rein in den Tutor zum Hochladen
function finish() {
  unmountStart();
  try { sessionStorage.setItem('tutor.stay', String(Date.now())); } catch (e) {}
  if (location.hash !== '#/app/tutor') location.hash = '#/app/tutor';
}

// Demo verlassen: offenes Fenster (Anmeldung) schließen, Demo abbauen, normale Startseite bwlmax.de zeigen
function leave() {
  track('Demo verlassen', made.size ? 'nach Ergebnis' : 'vor Ergebnis');
  if (document.querySelector('.modal-bg')) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  document.querySelectorAll('.modal-bg').forEach(m => m.remove());
  unmountStart();
  history.pushState(null, '', '/#/');
  dispatchEvent(new HashChangeEvent('hashchange'));
  window.scrollTo(0, 0);
  // Zurück-Taste führt wieder auf /start: dann die Demo frisch laden
  if (!offPop) { offPop = () => { if (/^\/start\/?$/.test(location.pathname)) location.reload(); }; addEventListener('popstate', offPop); }
}

// ---------- Kopf + Begrüßung ----------
let bubbleEl = null, heroFace = null;
function hello() {
  const mini = h('span', { class: 'mini bms-mini' });
  const exit = h('button', { class: 'bms-exit', type: 'button', title: 'Demo beenden und zur Startseite', onclick: leave }, h('span', { 'data-icn': '1', html: ico('x') }), h('span', { class: 'bms-exl' }, 'Demo verlassen'));
  const top = h('header', { class: 'bms-top' },
    h('div', { class: 'bms-tl' },
      h('a', { class: 'brand bms-brand', href: '/', 'aria-label': 'BWL Max', onclick: e => { e.preventDefault(); leave(); } }, mini, h('span', { class: 'bn' }, 'BWL Max')),
      h('span', { class: 'bms-demo-pill' }, h('i'), 'Demo · ohne Konto')),
    h('div', { class: 'bms-tc' },
      h('button', { class: 'go-btn bms-topmade', type: 'button', onclick: () => cta('Oben: Mit meinem Skript') }, 'Mit meinem Skript loslegen')),
    h('div', { class: 'bms-tr' },
      exit,
      h('button', { class: 'navlogin bms-login', type: 'button', onclick: () => cta('Oben: Anmelden', true) }, 'Anmelden'),
      h('button', { class: 'go-btn bms-topgo', type: 'button', onclick: () => cta('Oben: Kostenlos starten') }, 'Kostenlos starten')));
  face(mini);
  const fEl = h('div', { class: 'bms-face' });
  bubbleEl = h('p', { class: 'bms-say', 'aria-live': 'polite' });
  const hero = h('section', { class: 'bms-hero' },
    h('div', { class: 'bms-maxrow' }, fEl, h('div', { class: 'bms-bub' }, bubbleEl)),
    h('h1', {}, 'Gute Entscheidung.', h('span', {}, ' Ab hier lernst du mit mir.')));
  root.append(h('div', { class: 'bms-bg', 'aria-hidden': 'true' }), top, h('main', { class: 'bms-main' }, hero, h('div', { class: 'bms-stage' })));
  heroFace = face(fEl, {});
  setTimeout(() => heroFace && heroFace.pulse && heroFace.pulse('smug', 1500), 700);
  say({ youtube: 'Direkt von YouTube zu mir? Gute Entscheidung. Hier lernst du schneller als mit 2×-Wiedergabe.',
    reddit: 'Von Reddit zu mir? Gute Entscheidung. Hier gibt’s Antworten, die geprüft sind – nicht nur hochgevotet.' }[SRC]
    || 'Gute Entscheidung, dass du hier bist. Die anderen sitzen noch an Folie 3.', 500);
}
let sayTok = 0;
async function say(t, delay = 0, mood = 'idle') {
  const my = ++sayTok;
  if (delay) await sleep(delay);
  if (!bubbleEl || my !== sayTok) return;
  bubbleEl.parentElement.classList.remove('pop'); void bubbleEl.offsetWidth; bubbleEl.parentElement.classList.add('pop');
  if (RM) { bubbleEl.textContent = t; heroFace && heroFace.set(mood); return; }
  heroFace && heroFace.set('talk');
  for (let i = 0; i <= t.length; i += 2) { if (my !== sayTok) return; bubbleEl.textContent = t.slice(0, i); await sleep(16); }
  bubbleEl.textContent = t;
  heroFace && heroFace.set(mood);
}
const stage = () => root.querySelector('.bms-stage');
const step = (n, title, sub) => h('div', { class: 'bms-sh' }, h('span', { class: 'bms-n' }, String(n)), h('div', {}, h('h2', {}, title), sub ? h('p', {}, sub) : null));
const tint = (c, ink) => ({ '--c1': c[0], '--c2': c[1] });

// ---------- 1. Skript wählen ----------
function pickScript() {
  root.classList.remove('bms-working');
  const st = stage(); if (!st) return;
  cleanupView();
  if (!data) { st.replaceChildren(h('p', { class: 'bms-err' }, 'Die Demo lädt gerade nicht. ', h('button', { class: 'go-btn', onclick: () => location.reload() }, 'Neu laden'))); return; }
  const cards = data.skripte.map((s, k) => {
    const fc = fach(s.key);
    return h('button', { class: 'bms-doc' + (fc.ink === 'dark' ? ' ink-d' : '') + (cur && cur.key === s.key ? ' on' : ''), type: 'button', style: { ...tint(fc.c), '--k': k }, onclick: () => choose(s) },
      h('span', { class: 'bms-dtop' }, h('span', { class: 'bms-fach' }, s.fach), h('span', { class: 'bms-pdf' }, 'PDF')),
      h('b', { class: 'bms-dt' }, shy(s.titel)),
      h('span', { class: 'bms-lines', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('small', { class: 'bms-din' }, 'Drin: ' + s.untertitel),
      h('span', { class: 'bms-dfoot' }, h('span', { class: 'bms-fol' }, h('span', { 'data-icn': '1', html: ico('file') }), `${s.folien} Folien`), h('span', { class: 'bms-pick' }, 'Auswählen', h('span', { 'data-icn': '1', html: ico('right') }))));
  });
  st.replaceChildren(h('section', { class: 'bms-s1' },
    step(1, 'Such dir ein Skript aus.', 'Echte Vorlesungsfolien, Klausurstoff. Ich mach den Rest.'),
    h('div', { class: 'bms-docs' }, cards),
    h('p', { class: 'bms-note' }, h('span', { html: ico('check') }), 'Kein Konto, keine Wartezeit. Später nimmst du einfach dein eigenes Skript.')));
}

function choose(s) {
  cur = s; made = new Set(); fmt = null;
  root.classList.remove('bms-made');
  S.doc = migrate(JSON.parse(JSON.stringify(s.doc)));   // frische Kopie: Fortschritt in der Demo bleibt nur im Speicher
  S.doc.mistakes = [];
  demoAudio(S.doc, s.key);
  track('Demo Skript gewählt', s.key);
  pickFormat();
}

// Podcast mit den echten Stimmen: fertige mp3-Dateien statt KI-Aufruf. Der Player (views/podcast.js) nimmt p.audio[k]
// per Promise.resolve – hier steht pro Zeile ein „Thenable“, das die Datei erst beim Abspielen lädt (und als Base64 liefert).
function demoAudio(doc, key) {
  const p = doc.podcasts && doc.podcasts[0]; if (!p) return;
  p.real = true; p.voice = 'max'; p.demoFile = `/tutor/audio/demo/${key}/folge.mp3?v=1`;
  const cache = [];
  p.audio = p.lines.map((_, k) => ({ then(ok, bad) {
    cache[k] ||= fetch(`/tutor/audio/demo/${key}/${String(k).padStart(2, '0')}.mp3?v=1`).then(r => { if (!r.ok) throw new Error('Audio fehlt'); return r.arrayBuffer(); })
      .then(b => { const u = new Uint8Array(b); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); })
      .catch(e => { cache[k] = null; throw e; });
    return cache[k].then(ok, bad);
  } }));
}

// ---------- 2. Format wählen ----------
function pickFormat() {
  const st = stage();
  const fc = fach(cur.key);
  const tiles = ORDER.map((k, i) => { const f = F[k]; return h('button', { class: 'bms-fmt' + (f.ink === 'dark' ? ' ink-d' : ''), type: 'button', 'data-k': k, style: { ...tint(f.c), '--k': i }, onclick: e => pressed(e.currentTarget, k) },
    h('span', { class: 'bms-fi', 'data-icn': '1', html: ico(f.ic) }), h('span', { class: 'bms-ft' }, h('b', {}, f.t), h('small', {}, f.s)), h('span', { class: 'bms-fgo', 'data-icn': '1', html: ico('right') })); });
  st.replaceChildren(h('section', { class: 'bms-s2' },
    h('div', { class: 'bms-chosen' }, h('span', { class: 'bms-ci', 'data-icn': '1', style: tint(fc.c), html: ico('file') }), h('span', {}, h('small', {}, 'Dein Skript'), h('b', {}, cur.doc.name)), h('button', { class: 'btn sm bms-change', type: 'button', onclick: () => { pickScript(); stage().scrollIntoView({ block: 'start', behavior: RM ? 'auto' : 'smooth' }); } }, 'Ändern')),
    step(2, 'Was soll ich dir draus bauen?', 'Such aus. Dauert bei mir zwei Sekunden – bei deiner Lerngruppe zwei Wochen.'),
    h('div', { class: 'bms-fmts' }, tiles)));
  say('Gutes Skript. Jetzt sag mir, was du brauchst.');
  requestAnimationFrame(() => { const r = st.getBoundingClientRect(); if (r.top > innerHeight * .55 || r.top < 0) st.scrollIntoView({ block: 'start', behavior: RM ? 'auto' : 'smooth' }); });
}
// Gewählte Kachel kurz „drücken“, dann geht’s in die Arbeitsfläche
async function pressed(el, k) {
  if (root.querySelector('.bms-fmt.go')) return;
  el.classList.add('go');
  await sleep(RM ? 0 : 260);
  work(k);
}

// ---------- 3. Arbeitsfläche: Ergebnis in der echten Ansicht ----------
let ws = null;
function work(k) {
  root.classList.add('bms-working');
  const st = stage();
  const tabs = h('div', { class: 'bms-tabs', role: 'tablist' });
  const body = h('div', { class: 'bms-view' });
  const dl = h('button', { class: 'btn bms-dl', type: 'button', title: 'Herunterladen', 'aria-label': 'Herunterladen', onclick: () => download() }, h('span', { html: ico('download') }), h('span', {}, 'Herunterladen'));
  const fc = fach(cur.key);
  ws = { tabs, body, dl };
  st.replaceChildren(h('section', { class: 'bms-work' },
    h('div', { class: 'bms-wbar' },
      h('button', { class: 'bms-wdoc', type: 'button', title: 'Anderes Skript wählen', onclick: () => { pickScript(); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); } },
        h('span', { class: 'bms-ci', 'data-icn': '1', style: tint(fc.c), html: ico('file') }), h('span', { class: 'bms-wt' }, h('b', {}, cur.titel), h('small', {}, cur.fach + ' · Skript wechseln'))),
      tabs, dl),
    body,
    band()));
  drawTabs();
  open(k);
  window.scrollTo({ top: 0, behavior: 'auto' });
}
function drawTabs() {
  ws.tabs.replaceChildren(...ORDER.map(k => { const f = F[k]; return h('button', { class: 'bms-tab' + (k === fmt ? ' on' : '') + (made.has(k) ? ' made' : '') + (f.ink === 'dark' ? ' ink-d' : ''), type: 'button', role: 'tab', 'data-k': k, 'aria-selected': k === fmt ? 'true' : 'false', style: tint(f.c), onclick: () => open(k) },
    h('span', { class: 'bms-ti', 'data-icn': '1', html: ico(f.ic) }), h('span', { class: 'bms-tl2' }, f.t), made.has(k) ? null : h('span', { class: 'bms-plus', 'aria-label': 'erstellen' }, '+')); }));
  const on = ws.tabs.querySelector('.on'); if (on && ws.tabs.scrollWidth > ws.tabs.clientWidth) { const T = ws.tabs.getBoundingClientRect(), O = on.getBoundingClientRect(); ws.tabs.scrollTo({ left: ws.tabs.scrollLeft + O.left - T.left - (T.width - O.width) / 2, behavior: RM ? 'auto' : 'smooth' }); }
}
function cleanupView() { try { viewClean && viewClean(); } catch (e) {} viewClean = null; }

async function open(k, arg) {
  if (!ws) return;
  const my = ++busy;
  cleanupView();
  fmt = k; drawTabs();
  const f = F[k], fresh = !made.has(k);
  const inner = h('div', { class: 'bms-vin' });
  const ctx = { doc: S.doc, arg: arg !== undefined ? arg : k === 'quiz' ? 'q-' + S.doc.quizzes[0].id : null, go: (t, x) => (F[t] ? open(t, x || null) : cta('Weiter: ' + t)), ask: () => cta('Max fragen') };
  if (fresh) { inner.classList.add('bms-pre'); track('Demo erstellt', `${cur.key} · ${k}`); say(f.h, 0, 'think'); }
  ws.body.replaceChildren(inner);
  if (fresh) { ws.body.style.minHeight = Math.max(560, innerHeight - 120) + 'px'; ws.tabs.querySelector('.on')?.classList.add('fill'); }
  try {
    const mod = await f.view();
    if (my !== busy) return;
    const out = await mod.render(inner, ctx);
    if (my !== busy) return;
    viewClean = typeof out === 'function' ? out : null;
    // Karteikarten: gleich lernen (Stapel öffnen) statt Übersicht
    if (k === 'karten' && arg == null) { const b = inner.querySelector('.list .li') || inner.querySelector('.vh .btn.primary'); if (b) b.click(); }
    if (k === 'zettel') polishZettel(inner);
  } catch (e) { console.error(e); }
  if (fresh) {
    await build(k, inner, my);
    if (my !== busy) return;
    made.add(k); drawTabs();
    ws.body.style.minHeight = '';
    root.classList.add('bms-made');
  } else inner.classList.add('bms-in');
  if (my === busy) say(f.ok, 0, 'happy');
}

// Lernzettel in der Demo: Kernaussagen als nummerierte Liste, Formeln dezent hervorgehoben (nur Anzeige, Text bleibt gleich)
function polishZettel(inner) {
  const FX = /(?<![\wäöüß])((?:[A-Za-z]{1,2}\d?\*?|\d+))((?:\s*[=−+/>·]\s*(?:[A-Za-z]{1,2}\d?\*?|\d+)(?![\wäöüß]))+)/g;
  inner.querySelectorAll('.zt-tl li > span:last-child').forEach(sp => {
    const t = sp.textContent; if (!FX.test(t)) return; FX.lastIndex = 0;
    const parts = []; let last = 0;
    t.replace(FX, (m, a, b, i) => { parts.push(t.slice(last, i), h('code', { class: 'bms-fx' }, m)); last = i + m.length; return m; });
    parts.push(t.slice(last));
    if (parts.map(x => typeof x === 'string' ? x : x.textContent).join('') === t) sp.replaceChildren(...parts.filter(x => x !== ''));
  });
  const tl = inner.querySelector('.zt-tlh b'); if (tl) tl.prepend(h('span', { class: 'bms-tli', 'data-icn': '1', html: ico('note') }));
}

// Erstell-Animation: das echte Ergebnis baut sich sichtbar auf (ca. 2 s). Überschrift tippt sich, Blöcke und Zeilen
// erscheinen nacheinander, die Mindmap wächst (ihre eigene Aufbau-Animation startet, sobald sie sichtbar wird).
async function build(k, inner, my) {
  const T0 = performance.now();
  const view = inner.querySelector('.view-in') || inner;
  const SUB = { zettel: '.zt-tl li', karten: '.fc-stage > *', quiz: '.qcard > *', podcast: '.script .line' };
  const steps = [];
  for (const c of view.children) {
    const subs = [...c.querySelectorAll(SUB[k])];
    const mm = c.querySelector('.mindmap');
    steps.push({ el: c, mm: !!mm, w: c.matches('.vh, .qwrap, .pod') || c.querySelector('h2') ? 2 : 1 });
    subs.forEach(s => steps.push({ el: s, sub: true, w: .7 }));
  }
  // Mindmap erst ins Layout, wenn sie dran ist (sonst wächst sie unsichtbar)
  steps.forEach(s => { s.el.classList.add('bms-u'); if (s.mm || (s.sub && k !== 'karten')) s.el.classList.add('bms-u-none'); });   // Zeilen erst ins Layout, wenn sie dran sind: die Karte wächst mit
  inner.classList.remove('bms-pre');
  if (RM) { steps.forEach(s => { s.el.style.animation = 'none'; s.el.classList.remove('bms-u', 'bms-u-none'); }); return; }
  const T = 1900, totalW = steps.reduce((a, s) => a + s.w, 0) || 1;
  let below = false;
  for (const s of steps) {
    if (my !== busy) return;
    s.el.classList.remove('bms-u-none'); s.el.classList.add('bms-u-on');
    const head = !s.sub && s.el.querySelector('.vh h2, :scope > h2, .pst-cap b, .q');
    if (head && !below) typeIn(head, 360);
    if (!below && s.el.getBoundingClientRect().top > innerHeight - 40) below = true;   // Rest liegt unter dem Rand: ohne Warten
    if (!below) await sleep(Math.min(320, T * s.w / totalW + (head ? 120 : 0)));
  }
  const rest = 2000 - (performance.now() - T0);
  if (rest > 0) await sleep(rest);
  // Aufräumen ohne Flackern: eigene Einblend-Animationen der Ansicht nicht noch einmal abspielen
  inner.querySelectorAll('.bms-u').forEach(e => { e.style.animation = 'none'; e.classList.remove('bms-u', 'bms-u-on', 'bms-u-none'); });
}
async function typeIn(el, ms) {
  if (el.children.length) return;
  const t = el.textContent; if (!t || t.length > 140) return;
  el.style.minHeight = el.offsetHeight + 'px';
  const n = t.length, st = performance.now();
  el.textContent = '';
  el.classList.add('bms-typing');
  while (true) {
    const p = Math.min(1, (performance.now() - st) / ms);
    el.textContent = t.slice(0, Math.ceil(n * p));
    if (p >= 1) break;
    await new Promise(r => requestAnimationFrame(r));
  }
  el.classList.remove('bms-typing'); el.style.minHeight = '';
}

// ---------- Herunterladen (ohne Konto, ohne KI) ----------
async function download() {
  const E = await import('./export.js');
  const d = S.doc;
  track('Demo heruntergeladen', `${cur.key} · ${fmt}`);
  const P = d.podcasts[0];
  const o = { zettel: () => E.optsSummary(d), karten: () => E.optsDeck(d.decks, d), quiz: () => E.optsQuiz(d.quizzes[0], d), podcast: () => E.optsPodcast(P, d) }[fmt];
  E.pick(o ? o() : []);
}

// ---------- Großer Knopf unter dem Ergebnis ----------
function band() {
  const fEl = h('div', { class: 'bms-bface' });
  const el = h('section', { class: 'bms-band' },
    h('div', { class: 'bms-bl' }, fEl,
      h('div', {}, h('div', { class: 'bms-eye' }, 'Und jetzt du'), h('h2', {}, 'Das war mein Skript. ', h('span', {}, 'Jetzt deins.')),
        h('p', {}, 'Lad deine Vorlesungsfolien hoch – ich bau dir daraus Lernzettel, Karteikarten, Quiz und Podcast. Genau dein Stoff, genau deine Klausur.'))),
    h('div', { class: 'bms-br' },
      h('button', { class: 'go-btn go-lg bms-hero-btn', type: 'button', onclick: () => cta('Hero-Knopf') }, 'Mit meinem Skript loslegen'),
      h('small', {}, h('span', { html: ico('check') }), 'Kostenloses Konto · mit Google oder E-Mail · keine Kreditkarte')));
  const fc = face(fEl, {}); setTimeout(() => fc.set('smug'), 300);
  return el;
}

// Anmeldung: die bestehende (Google + E-Mail-Code). Quelle wird mitgegeben (Ereignis „Anmeldefenster gesehen“ · Detail).
async function cta(where, login = false) {
  track('Demo Konto-Knopf', where);
  const { openAuth, openLogin } = await import('./account.js');
  const why = `Demo ${SRC_NAME}`.slice(0, 30);
  const ok = login ? await openLogin({ why }) : await openAuth({
    registerTitle: 'Jetzt mit deinem Skript – kostenlos',
    registerSub: 'Kostenloses Konto in 30 Sekunden. Danach lädst du dein Skript hoch und ich bau dir alles aus deinem Stoff.',
    loginTitle: 'Willkommen zurück', why });
  if (ok && getAccount()) finish();
}
