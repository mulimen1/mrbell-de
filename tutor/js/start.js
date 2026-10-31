// bwlmax.de/start – Landingpage für Besucher aus der YouTube-Werbung: Sofort-Demo ohne Konto.
// Ablauf: Max begrüßt → Demo-Skript wählen → Lernzettel / Karteikarten / Quiz / Podcast wählen →
// Ergebnis sofort (kurze Erstell-Animation, die echten Ansichten aus views/) → herunterladen →
// „Mit meinem Skript loslegen“ öffnet die normale Anmeldung (openAuth) → danach Tutor/Upload.
// Kostet pro Besucher nichts: Inhalte liegen fertig in /tutor/data/demo/start.json (gebaut und geprüft mit
// /home/claude/seo/demo_start.py). Solange die Demo offen ist (html.bm-demo) sperrt api.js alle KI-Aufrufe für Gäste.
import { h, ico, modal, sleep } from './util.js';
import { face } from './face.js';
import { S, migrate } from './state.js';
import { getAccount, onAccount } from './api.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const qs = new URLSearchParams(location.search);
const SRC = (qs.get('utm_source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
const SRC_NAME = { youtube: 'YouTube', reddit: 'Reddit' }[SRC] || SRC || 'direkt';   // Quelle der Anzeige (utm_source), geht als Detail an „Anmeldefenster gesehen“
const track = (e, d) => { try { window.BM && window.BM.track(e, d || ''); } catch (x) {} };

// Bereichsfarben wie in „Als Nächstes“ (nextup.js)
const F = {
  zettel: { t: 'Lernzettel', s: 'mit Mindmap', ic: 'note', c: ['#f7c948', '#d99a1c'], view: () => import('./views/summary.js'), make: ['Lese die Folien', 'Ziehe die Kernaussagen raus', 'Zeichne die Mindmap'], h: 'Ich schreibe deinen Lernzettel' },
  karten: { t: 'Karteikarten', s: 'mit Wiederholung', ic: 'cards', c: ['#1aa39a', '#0e7a88'], view: () => import('./views/cards.js'), make: ['Suche Begriffe und Formeln', 'Formuliere die Fragen', 'Plane die Wiederholung'], h: 'Ich schreibe deine Karteikarten' },
  quiz: { t: 'Quiz', s: 'wie in der Klausur', ic: 'quiz', c: ['#9b7cf0', '#5b3fc4'], view: () => import('./views/quizview.js'), make: ['Denke mir fiese Fragen aus', 'Baue typische Fehler als Antworten ein', 'Rechne alles zweimal nach'], h: 'Ich baue dein Quiz' },
  podcast: { t: 'Podcast', s: 'Marie & Max', ic: 'headphones', c: ['#f06a9b', '#c8336f'], view: () => import('./views/podcast.js'), make: ['Schreibe das Skript', 'Marie bereitet sich vor', 'Ich such mir eine Frage aus'], h: 'Marie und ich nehmen auf' },
};
// Lange Fachwörter auf kleinen Kärtchen sauber trennen (weiches Trennzeichen)
const shy = t => String(t).replace('Deckungsbeitragsrechnung', 'Deckungs\u00adbeitrags\u00adrechnung').replace('Kapitalwertmethode', 'Kapital\u00adwert\u00admethode');
const ORDER = ['zettel', 'karten', 'quiz', 'podcast'];
const FACH = { db: ['#f7c948', '#d99a1c'], kw: ['#4f9cf5', '#1a5fc4'], swot: ['#f39b52', '#d9601c'] };

let root = null, data = null, cur = null, fmt = null, made = new Set(), viewClean = null, offAcc = null, busy = 0;

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
  try { window.speechSynthesis && speechSynthesis.getVoices(); } catch (e) {}
  track('Demo geöffnet', SRC_NAME);
  try { data = await (await fetch('/tutor/data/demo/start.json?v=1')).json(); } catch (e) { data = null; }
  pickScript();
}

export function unmountStart() {
  const H = document.documentElement;
  H.classList.remove('bm-start', 'bm-demo');
  try { viewClean && viewClean(); } catch (e) {}
  try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
  if (S.doc && S.doc.demo) S.doc = null;
  if (offAcc) { try { offAcc(); } catch (e) {} offAcc = null; }
  root && root.remove(); root = null;
}

// Angemeldet (über den großen Knopf oder irgendwo in der Demo): raus aus der Demo, rein in den Tutor zum Hochladen
function finish() {
  unmountStart();
  try { sessionStorage.setItem('tutor.stay', String(Date.now())); } catch (e) {}
  if (location.hash !== '#/app/tutor') location.hash = '#/app/tutor';
}

// ---------- Kopf + Begrüßung ----------
let bubbleEl = null, heroFace = null;
function hello() {
  const mini = h('span', { class: 'bms-mini' });
  const top = h('header', { class: 'bms-top' },
    h('a', { class: 'bms-brand', href: '/', 'aria-label': 'BWL Max' }, mini, h('b', {}, 'BWL Max')),
    h('span', { class: 'bms-demo-pill' }, h('i'), 'Demo · ohne Konto'),
    h('span', { class: 'bms-sp' }),
    h('button', { class: 'bms-login', type: 'button', onclick: () => cta('Oben: Anmelden', true) }, 'Anmelden'),
    h('button', { class: 'go-btn bms-topgo', type: 'button', onclick: () => cta('Oben: Kostenlos starten') }, 'Kostenlos starten'));
  face(mini);
  const fEl = h('div', { class: 'bms-face' });
  bubbleEl = h('p', { class: 'bms-say', 'aria-live': 'polite' });
  const hero = h('section', { class: 'bms-hero' },
    h('div', { class: 'bms-maxrow' }, fEl, h('div', { class: 'bms-bub' }, bubbleEl)),
    h('h1', {}, 'Gute Entscheidung.', h('span', {}, ' Ab hier lernst du mit mir.')));
  root.append(h('div', { class: 'bms-bg', 'aria-hidden': 'true' }), top, h('main', { class: 'bms-main' }, hero, h('div', { class: 'bms-stage' })));
  heroFace = face(fEl, {});
  setTimeout(() => heroFace.pulse && heroFace.pulse('smug', 1500), 700);
  say({ youtube: 'Direkt von YouTube zu mir? Gute Entscheidung. Hier lernst du schneller als mit 2×-Wiedergabe.',
    reddit: 'Von Reddit zu mir? Gute Entscheidung. Hier gibt’s Antworten, die geprüft sind – nicht nur hochgevotet.' }[SRC]
    || 'Gute Entscheidung, dass du hier bist. Die anderen sitzen noch an Folie 3.', 500);
}
let sayTok = 0;
async function say(t, delay = 0) {
  const my = ++sayTok;
  if (delay) await sleep(delay);
  if (!bubbleEl || my !== sayTok) return;
  bubbleEl.parentElement.classList.remove('pop'); void bubbleEl.offsetWidth; bubbleEl.parentElement.classList.add('pop');
  if (RM) { bubbleEl.textContent = t; return; }
  heroFace && heroFace.set('talk');
  for (let i = 0; i <= t.length; i += 2) { if (my !== sayTok) return; bubbleEl.textContent = t.slice(0, i); await sleep(16); }
  bubbleEl.textContent = t;
  heroFace && heroFace.set('idle');
}
const stage = () => root.querySelector('.bms-stage');
const step = (n, title, sub) => h('div', { class: 'bms-sh' }, h('span', { class: 'bms-n' }, String(n)), h('div', {}, h('h2', {}, title), sub ? h('p', {}, sub) : null));

// ---------- 1. Skript wählen ----------
function pickScript() {
  root.classList.remove('bms-working');
  const st = stage(); if (!st) return;
  cleanupView();
  if (!data) { st.replaceChildren(h('p', { class: 'bms-err' }, 'Die Demo lädt gerade nicht. ', h('button', { class: 'go-btn', onclick: () => location.reload() }, 'Neu laden'))); return; }
  const cards = data.skripte.map((s, k) => {
    const [c1, c2] = FACH[s.key] || FACH.db;
    const b = h('button', { class: 'bms-doc' + (cur && cur.key === s.key ? ' on' : ''), type: 'button', style: { '--c1': c1, '--c2': c2, '--k': k }, onclick: () => choose(s) },
      h('span', { class: 'bms-slide' },
        h('span', { class: 'bms-fach' }, s.fach),
        h('b', {}, shy(s.titel)),
        h('span', { class: 'bms-lines' }, h('i'), h('i'), h('i')),
        h('span', { class: 'bms-pdf' }, 'PDF')),
      h('span', { class: 'bms-dmeta' }, h('small', {}, 'Drin: ' + s.untertitel), h('span', { class: 'bms-dfoot' }, `${s.folien} Folien`, h('span', { class: 'bms-pick' }, 'Auswählen'))));
    return b;
  });
  st.replaceChildren(h('section', { class: 'bms-s1' },
    step(1, 'Such dir ein Skript aus.', 'Echte Vorlesungsfolien, Klausurstoff. Ich mach den Rest.'),
    h('div', { class: 'bms-docs' }, cards),
    h('p', { class: 'bms-note' }, h('span', { html: ico('check') }), 'Kein Konto, keine Wartezeit. Später nimmst du einfach dein eigenes Skript.')));
}

function choose(s) {
  cur = s; made = new Set(); fmt = null;
  S.doc = migrate(JSON.parse(JSON.stringify(s.doc)));   // frische Kopie: Fortschritt in der Demo bleibt nur im Speicher
  S.doc.mistakes = [];
  track('Demo Skript gewählt', s.key);
  pickFormat();
}

// ---------- 2. Format wählen ----------
function pickFormat() {
  const st = stage();
  const [c1, c2] = FACH[cur.key] || FACH.db;
  const tiles = ORDER.map((k, i) => { const f = F[k]; return h('button', { class: 'bms-fmt', type: 'button', style: { '--c1': f.c[0], '--c2': f.c[1], '--k': i }, onclick: () => work(k) },
    h('span', { class: 'bms-fi', html: ico(f.ic) }), h('span', { class: 'bms-ft' }, h('b', {}, f.t), h('small', {}, f.s)), h('span', { class: 'bms-fgo', html: ico('right') })); });
  st.replaceChildren(h('section', { class: 'bms-s2' },
    h('div', { class: 'bms-chosen', style: { '--c1': c1, '--c2': c2 } }, h('span', { class: 'bms-ci', html: ico('file') }), h('span', {}, h('small', {}, 'Dein Skript'), h('b', {}, cur.doc.name)), h('button', { class: 'bms-change', type: 'button', onclick: () => { pickScript(); stage().scrollIntoView({ block: 'start', behavior: RM ? 'auto' : 'smooth' }); } }, 'Ändern')),
    step(2, 'Was soll ich dir draus bauen?', 'Such aus. Dauert bei mir zwei Sekunden – bei deiner Lerngruppe zwei Wochen.'),
    h('div', { class: 'bms-fmts' }, tiles)));
  say('Gutes Skript. Jetzt sag mir, was du brauchst.');
  requestAnimationFrame(() => { const r = st.getBoundingClientRect(); if (r.top > innerHeight * .55 || r.top < 0) st.scrollIntoView({ block: 'start', behavior: RM ? 'auto' : 'smooth' }); });
}

// ---------- 3. Arbeitsfläche: Ergebnis in der echten Ansicht ----------
let ws = null;
function work(k) {
  root.classList.add('bms-working');
  const st = stage();
  const tabs = h('div', { class: 'bms-tabs', role: 'tablist' });
  const body = h('div', { class: 'bms-view' });
  const dl = h('button', { class: 'bms-dl', type: 'button', title: 'Herunterladen', 'aria-label': 'Herunterladen', onclick: () => download() }, h('span', { html: ico('download') }), h('span', {}, 'Herunterladen'));
  const [c1, c2] = FACH[cur.key] || FACH.db;
  ws = { tabs, body, dl };
  st.replaceChildren(h('section', { class: 'bms-work' },
    h('div', { class: 'bms-win' },
      h('div', { class: 'bms-wbar' },
        h('button', { class: 'bms-wdoc', type: 'button', style: { '--c1': c1, '--c2': c2 }, title: 'Anderes Skript wählen', onclick: () => { pickScript(); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); } },
          h('span', { class: 'bms-ci', html: ico('file') }), h('span', { class: 'bms-wt' }, h('b', {}, cur.titel), h('small', {}, cur.fach + ' · Skript wechseln'))),
        tabs, dl),
      body),
    band()));
  drawTabs();
  open(k);
  window.scrollTo({ top: 0, behavior: 'auto' });
}
function drawTabs() {
  ws.tabs.replaceChildren(...ORDER.map(k => { const f = F[k]; return h('button', { class: 'bms-tab' + (k === fmt ? ' on' : '') + (made.has(k) ? ' made' : ''), type: 'button', role: 'tab', 'aria-selected': k === fmt ? 'true' : 'false', style: { '--c1': f.c[0], '--c2': f.c[1] }, onclick: () => open(k) },
    h('span', { class: 'bms-ti', html: ico(f.ic) }), h('span', {}, f.t), made.has(k) ? null : h('span', { class: 'bms-plus', 'aria-label': 'erstellen' }, '+')); }));
  const on = ws.tabs.querySelector('.on'); if (on && ws.tabs.scrollWidth > ws.tabs.clientWidth) ws.tabs.scrollTo({ left: on.offsetLeft - 20, behavior: RM ? 'auto' : 'smooth' });
}
function cleanupView() { try { viewClean && viewClean(); } catch (e) {} viewClean = null; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} }

async function open(k, arg) {
  if (!ws) return;
  const my = ++busy;
  cleanupView();
  fmt = k; drawTabs();
  const f = F[k], fresh = !made.has(k);
  const inner = h('div', { class: 'bms-vin' });
  const ctx = { doc: S.doc, arg: arg !== undefined ? arg : k === 'quiz' ? 'q-' + S.doc.quizzes[0].id : null, go: (t, x) => (F[t] ? open(t, x || null) : cta('Weiter: ' + t)), ask: () => cta('Max fragen') };
  // Ansicht baut sich unter der Animation auf (z. B. wartet der Podcast kurz auf die Stimmen des Browsers)
  const ready = (async () => {
    const mod = await f.view();
    if (my !== busy) return;
    const out = await mod.render(inner, ctx);
    if (my !== busy) return;
    viewClean = typeof out === 'function' ? out : null;
    // Karteikarten: gleich lernen (Stapel öffnen) statt Übersicht
    if (k === 'karten' && arg == null) { const b = inner.querySelector('.list .li') || inner.querySelector('.vh .btn.primary'); if (b) b.click(); }
  })();
  if (fresh) {
    track('Demo erstellt', `${cur.key} · ${k}`);
    const mk = making(f);
    ws.body.replaceChildren(inner, mk.el); inner.classList.add('bms-hide');
    await Promise.all([mk.done, ready.catch(e => console.error(e))]);
    if (my !== busy) return;
    made.add(k); drawTabs();
    mk.el.remove(); inner.classList.remove('bms-hide');
  } else {
    ws.body.replaceChildren(inner);
    await ready.catch(e => console.error(e));
    if (my !== busy) return;
  }
  inner.classList.add('bms-in');
  say({ zettel: 'Fertig. Ein Lernzettel, für den andere ein Wochenende brauchen.', karten: 'Karten umdrehen, ehrlich bewerten. Ich merk mir, was wackelt.', quiz: 'Klausurniveau. Wer hier durchkommt, kommt auch durch die echte.', podcast: 'Marie erklärt, ich frag dumm nach. Läuft im Gym, in der Bahn, überall.' }[k]);
}

// Kurze Erstell-Animation – Inhalte sind fertig, das hier ist nur fürs Gefühl (1,6 s)
function making(f) {
  const fEl = h('div', { class: 'bms-mface' });
  const bar = h('i');
  const lines = f.make.map(t => h('li', {}, h('span', { class: 'bms-ck', html: ico('check') }), t));
  const el = h('div', { class: 'bms-make', style: { '--c1': f.c[0], '--c2': f.c[1] } },
    fEl, h('b', {}, f.h + ' …'), h('small', {}, `aus „${cur.titel}“ · ${cur.folien} Folien`), h('div', { class: 'bms-mbar' }, bar), h('ul', {}, lines));
  const fc = face(fEl, {}); fc.set('think');
  const T = RM ? 300 : 1600;
  const done = (async () => {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    bar.style.transition = `transform ${T}ms cubic-bezier(.4,.1,.2,1)`; bar.style.transform = 'scaleX(1)';
    for (let i = 0; i < lines.length; i++) { await sleep(T / (lines.length + .4)); lines[i].classList.add('on'); }
    fc.set('happy');
    await sleep(RM ? 50 : 320);
  })();
  return { el, done };
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
