// Lernen: alles, womit man bei BWL Max lernen kann, an einem Ort – mit Struktur.
// 1) Deine Skripte als Karten (Stand auf einen Blick, eins ist ausgewählt)
// 2) Was du mit DIESEM Skript machen kannst – jedes Tool zeigt, was schon da ist; was fehlt, wird nach kurzem Personalisieren erstellt
// 3) Üben & Prüfen, 4) Mit Max
import { h, ico, ls, toast } from '../util.js';
import { L } from '../i18n.js';
import { S, onChange, mastery } from '../state.js';
import { dueCards } from './cards.js';
import { planSummary } from './plan.js';
import { fachOf, getMe } from '../me.js';
import { face } from '../face.js';
import { getAccount } from '../api.js';

const live = d => (S.doc && S.doc.id === d.id ? S.doc : d);
const byUse = () => S.list.map(live).sort((a, b) => Math.max(b.used || 0, b.created || 0) - Math.max(a.used || 0, a.created || 0));
// Standard: kein Skript gewählt. Nur direkt nach dem Hochladen ist das neue Skript einmal vorausgewählt.
let selId = null;
function pickDoc() {
  const d = selId ? S.list.find(x => x.id === selId) : null;
  return d ? live(d) : null;
}
// Aus Lernen heraus geöffnet: oben gibt’s „← Lernen“ zurück
const fromHere = () => { try { sessionStorage.setItem('tutor.backTo', 'lernen'); } catch (e) {} };
const go = hash => { fromHere(); location.hash = hash; };
// Ohne Konto (Handy und Laptop): Lernen bleibt offen – erst beim Werkzeug kommt (passend dazu) das kostenlose Konto
const GATE = {
  karten: [L('Deine Karteikarten – kostenlos', 'Your flashcards – free'), L('Lad Stoff hoch oder nenn ein Thema – Max baut dir daneben deine Karteikarten und fragt dich ab, bis es sitzt.', 'Upload material or name a topic – Max builds your flashcards and quizzes you until it sticks.')],
  quiz: [L('Dein Quiz – kostenlos', 'Your quiz – free'), L('Lad Stoff hoch oder nenn ein Thema – Max baut dir daneben ein Quiz mit Erklärung zu jeder Antwort.', 'Upload material or name a topic – Max builds you a quiz with an explanation for every answer.')],
  zettel: [L('Dein Lernzettel – kostenlos', 'Your study sheet – free'), L('Lad Stoff hoch oder nenn ein Thema – Max fasst dir das Wichtigste auf einer Seite zusammen.', 'Upload material or name a topic – Max puts the essentials on one page.')],
  podcast: [L('Dein Podcast – kostenlos', 'Your podcast – free'), L('Lad Stoff hoch oder nenn ein Thema – Max macht dir daraus eine Folge zum Anhören, unterwegs oder beim Sport.', 'Upload material or name a topic – Max turns it into an episode to listen to on the go.')],
  pfad: [L('Dein Lernpfad – kostenlos', 'Your study path – free'), L('Lad Stoff hoch oder nenn ein Thema – Max führt dich Kapitel für Kapitel durch, mit Mini-Checks.', 'Upload material or name a topic – Max takes you chapter by chapter, with mini-checks.')],
  plan: [L('Dein Lernplan – kostenlos', 'Your study plan – free'), L('Sag Max, wann deine Klausur ist – er plant dir jeden Tag bis dahin.', 'Tell Max when your exam is – he plans every day until then.')],
  exam: [L('Deine Probeklausur – kostenlos', 'Your mock exam – free'), L('Max baut dir eine Probeklausur mit Zeit, Punkten und Notenschlüssel – wie in echt.', 'Max builds you a mock exam with time, points and grading – like the real thing.')]
};
const isPhone = () => matchMedia('(max-width: 600px)').matches;
async function gated(tab) {
  const { getAccount } = await import('../api.js'); if (getAccount()) return false;
  const g = GATE[tab]; if (!g) return false;
  const { openAuth } = await import('../account.js');
  openAuth({ title: g[0], registerTitle: g[0], sub: g[1] });
  return true;
}

// Max im Tutor-Raum etwas machen lassen (wartet, bis der Raum steht)
async function inRoom(fn) {
  location.hash = '#/app/tutor';
  for (let k = 0; k < 40; k++) { await new Promise(r => setTimeout(r, 100)); if (document.querySelector('.asst.stage')) break; }
  try { const m = await import('../assistant.js'); const api = m.mountAssistant(); if (api) fn(api); } catch (e) {}
}

function stats(d) {
  const cards = (d.decks || []).flatMap(x => x.cards || []), due = cards.length ? dueCards(d).length : 0;
  const qs = d.quizzes || [], last = qs.filter(q => q.results?.length).at(-1)?.results?.at(-1);
  const ch = d.path?.chapters || [];
  let plan = null; try { plan = d.plan ? planSummary(d) : null; } catch (e) {}
  return { cards: cards.length, due, quizzes: qs.length, lastScore: last ? Math.round((last.score || 0) * 100) : null, summary: !!d.summary, pods: (d.podcasts || []).length, chDone: ch.filter(c => c.done).length, chAll: ch.length, plan, m: mastery(d) };
}
const tage = n => (n === 1 ? L('1 Tag', '1 day') : L(`${n} Tagen`, `${n} days`));

// Datei direkt auf die Karte ziehen: deutlich sichtbar, dann geht's wie beim Hochladen weiter
function dropable(el) {
  let n = 0;
  el.addEventListener('dragenter', e => { if (!e.dataTransfer?.types?.includes('Files')) return; e.preventDefault(); n++; el.classList.add('ln-over'); });
  el.addEventListener('dragover', e => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
  el.addEventListener('dragleave', () => { if (--n <= 0) { n = 0; el.classList.remove('ln-over'); } });
  el.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); n = 0; el.classList.remove('ln-over'); const f = e.dataTransfer?.files; if (f && f.length) import('../app.js').then(m => m.startUpload([...f])); });
  return el;
}
// Übersicht (Startseite ohne Chat): Max begrüßt, darunter Hochladen und alle Werkzeuge
const PASTE = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '') ? '⌘V' : L('Strg+V', 'Ctrl+V');
function greeting() {
  const a = getAccount() || {}, nick = String(a.nick || '').trim(), hr = new Date().getHours(), n = nick ? ' ' + nick : '';
  const pick = arr => arr[Math.floor(Date.now() / 36e5) % arr.length];
  const head = hr < 5 ? pick([L(`Noch wach${n}? Respekt. Dann lass es wenigstens zählen.`, `Still up${n}? Respect. Make it count.`)])
    : hr < 11 ? pick([L(`Moin${n}. Kaffee steht? Dann lass uns was wegarbeiten.`, `Morning${n}. Coffee ready? Let’s get stuff done.`), L(`Moin${n}. Früh dran – das machen nur die, die später entspannt sind.`, `Morning${n}. Early bird – the ones who relax later.`)])
    : hr < 14 ? pick([L(`Mahlzeit${n}. Kurz was Sinnvolles vor der Pause?`, `Hey${n}. Something useful before the break?`)])
    : hr < 18 ? pick([L(`Da bist du ja${n}. Nachmittagstief? Nicht mit mir.`, `There you are${n}. Afternoon slump? Not on my watch.`), L(`Hey${n}. Lass uns die Klausur schon mal nervös machen.`, `Hey${n}. Let’s make the exam nervous.`)])
    : pick([L(`Guten Abend${n}. Eine Runde noch – dann hast du’s dir verdient.`, `Evening${n}. One more round – then you’ve earned it.`)]);
  // Was heute ansteht: fällige Karten, nächste Klausur
  let due = 0; try { due = S.list.map(live).reduce((s2, d) => s2 + ((d.decks || []).some(x => (x.cards || []).length) ? dueCards(d).length : 0), 0); } catch (e) {}
  let exam = null; try { const t0 = new Date().toLocaleDateString('sv-SE'); (getMe().faecher || []).forEach(f => { if (f.klausur && f.klausur >= t0 && (!exam || f.klausur < exam.d)) exam = { d: f.klausur, n: f.kurz || f.name }; }); } catch (e) {}
  const days = exam ? Math.round((new Date(exam.d) - new Date(new Date().toLocaleDateString('sv-SE'))) / 864e5) : null;
  const bits = [exam ? (days === 0 ? L(`${exam.n}: Klausur ist heute`, `${exam.n}: exam is today`) : L(`${exam.n}: Klausur in ${tage(days)}`, `${exam.n}: exam in ${tage(days)}`)) : null, due ? L(`${due} Karten fällig`, `${due} cards due`) : null].filter(Boolean);
  return { head, sub: bits.join(' · ') };
}
function explainTopic(topic) {
  const t = String(topic || '').trim(); if (!t) return;
  import('../app.js').then(m => m.viaMax(a => a.ask(L(`Erklär mir „${t}“ von Grund auf – mit Beispiel an der Tafel.`, `Explain “${t}” to me from scratch – with an example on the board.`), { show: t, fs: true })));
}
function explainDoc(d) {
  fromHere();
  location.hash = `#/app/${d.id}/hub`;
  setTimeout(() => import('../app.js').then(m => m.viaMax(a => a.ask(L('Erklär mir das Wichtigste aus dem Skript an der Tafel – Schritt für Schritt, mit Beispiel.', 'Explain the key points of the slides on the board – step by step, with an example.'), { show: L(`Erklär mir „${d.name}“ an der Tafel.`, `Explain “${d.name}” on the board.`), fs: true }))), 700);
}
// Startseite: Unterlagen als Auswahl oben rechts (statt großer Karten)
function docPicker(docs, d, onPick) {
  const lab = d ? (d.name.length > 30 ? d.name.slice(0, 29) + '…' : d.name) : L('Unterlage wählen', 'Pick material');
  const btn = h('button', { class: 'uv-pbtn' + (d ? ' on' : ''), type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' },
    h('span', { class: 'uv-pi', html: ico('file') }), h('span', { class: 'uv-pt' }, h('small', {}, L('Deine Unterlagen', 'Your material') + (docs.length ? ` · ${docs.length}` : '')), h('b', {}, lab)), h('span', { class: 'uv-pc', html: ico('down') }));
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (document.querySelector('.uv-menu')) { document.querySelector('.uv-menu').remove(); btn.setAttribute('aria-expanded', 'false'); return; }
    const q = h('input', { class: 'uv-ms', type: 'search', placeholder: L('Suchen …', 'Search …'), 'aria-label': L('Unterlagen suchen', 'Search material') });
    const list = h('div', { class: 'uv-ml', role: 'listbox' });
    const item = x => { const f = fachOf(x.id), on = d && x.id === d.id; return h('button', { class: 'uv-mi' + (on ? ' on' : ''), type: 'button', role: 'option', 'aria-selected': on ? 'true' : 'false', onclick: () => { close(); onPick(x.id); } }, h('span', { class: 'uv-pi', html: ico(x.kind === 'video' ? 'captions' : x.generated ? 'bulb' : 'file') }), h('span', { class: 'uv-mt' }, h('b', {}, x.name), h('small', {}, [f ? (f.kurz || f.name) : null, mastery(x) + ' %'].filter(Boolean).join(' · '))), on ? h('span', { class: 'uv-mck', html: ico('check') }) : null); };
    const fill = () => { const t = q.value.trim().toLowerCase(); const xs = docs.filter(x => !t || x.name.toLowerCase().includes(t)); list.replaceChildren(...(xs.length ? xs.slice(0, 60).map(item) : [h('small', { class: 'uv-mno' }, L('Nichts gefunden.', 'Nothing found.'))])); };
    q.addEventListener('input', fill); fill();
    const menu = h('div', { class: 'uv-menu' },
      docs.length > 6 ? q : null, list,
      h('div', { class: 'uv-mf' },
        d ? h('button', { class: 'linkbtn', type: 'button', onclick: () => { close(); onPick(null); } }, L('Ohne Unterlage', 'No material')) : h('span'),
        h('label', { class: 'btn sm primary', for: 'fileApp', onclick: () => setTimeout(close, 0) }, h('span', { html: ico('plus') }), L('Neu hochladen', 'Upload new'))));
    const close = () => { menu._off && menu._off(); menu.remove(); btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', out); document.removeEventListener('keydown', esc); };
    const out = ev => { if (!menu.contains(ev.target)) close(); };
    const esc = ev => { if (ev.key === 'Escape') close(); };
    // Als eigene Ebene über der Seite (nicht im Seitenfluss) – sonst schieben sich die Kacheln darüber
    const place = () => { const r = btn.getBoundingClientRect(), phone = innerWidth <= 760; Object.assign(menu.style, phone ? { left: '16px', right: '16px', top: (r.bottom + 8) + 'px' } : { right: Math.max(12, innerWidth - r.right) + 'px', top: (r.bottom + 8) + 'px' }); menu.style.maxHeight = Math.max(220, innerHeight - r.bottom - 24) + 'px'; };
    document.body.appendChild(menu); place(); btn.setAttribute('aria-expanded', 'true');
    const onScroll = ev => { if (!menu.contains(ev.target)) close(); };
    addEventListener('scroll', onScroll, true); addEventListener('resize', place);
    menu._off = () => { removeEventListener('scroll', onScroll, true); removeEventListener('resize', place); };
    setTimeout(() => { document.addEventListener('click', out); document.addEventListener('keydown', esc); if (docs.length > 6) q.focus(); }, 0);
  });
  return btn;
}
export function render(root, o = {}) {
  const home = !!o.home;
  const wrap = h('div', { class: 'view-in ln' + (home ? ' uv' : '') });
  root.appendChild(wrap);

  selId = ls.get('tutor.learn.doc') || null; ls.set('tutor.learn.doc', null);
  // Übersicht: wer schon Unterlagen hat, lernt direkt mit der zuletzt genutzten weiter (abwählbar)
  if (home && !selId && S.list.length) selId = byUse()[0].id;
  let hero = null; const pickSlot = h('div', { class: 'uv-pick' });
  if (home) {
    const g = greeting(), fEl = h('span', { class: 'uv-face' });
    const topic = h('input', { class: 'uv-tin', type: 'text', maxlength: 120, placeholder: L('Oder Thema eingeben, z. B. Kapitalwertmethode', 'Or type a topic, e.g. net present value'), enterkeyhint: 'go', 'aria-label': L('Thema', 'Topic') });
    const tForm = h('form', { class: 'uv-topic', onsubmit: e => { e.preventDefault(); explainTopic(topic.value); topic.value = ''; } }, h('span', { html: ico('board') }), topic, h('button', { class: 'btn sm', type: 'submit' }, L('An der Tafel erklären', 'Explain on the board')));
    const drop = dropable(h('label', { class: 'uv-drop', for: 'fileApp' },
      h('span', { class: 'uv-di', html: ico('upload') }),
      h('b', {}, L('Lad hoch, womit du lernst', 'Upload what you study with')),
      h('small', {}, L('Skript, Folien, Mitschrift, Übungsblatt, Altklausur, Buch, Screenshot oder Video – Max arbeitet mit allem.', 'Slides, notes, problem sets, past exams, books, screenshots or videos – Max works with all of it.'), h('span', { class: 'uv-hint' }, L(` Hierher ziehen oder Screenshot mit ${PASTE} einfügen.`, ` Drop here or paste a screenshot with ${PASTE}.`))),
      h('span', { class: 'btn primary uv-dbtn' }, h('span', { html: ico('plus') }), L('Datei wählen', 'Choose file'))));
    hero = h('header', { class: 'uv-hero' },
      h('div', { class: 'uv-top' }, h('div', { class: 'uv-greet' }, fEl, h('div', { class: 'uv-bub' }, h('b', {}, g.head), g.sub ? h('small', {}, g.sub) : null)), pickSlot),
      drop, tForm);
    face(fEl, {});
  }
  function draw() {
    const docs = byUse(), d = pickDoc();
    const need = (tab, hasIt) => async () => {
      if (await gated(tab)) return;
      const doc = pickDoc();
      fromHere();   // was hier entsteht, gehört zu „Lernen“ (oben markiert, „← Lernen“ zurück)
      // Noch kein Skript: hochladen oder Thema nennen – danach entsteht direkt dieses Werkzeug
      if (!doc && ['podcast', 'quiz', 'zettel'].includes(tab)) return import('../create.js').then(m => m.personalise(tab, null));   // Optionen wählen + Datei/Thema → danach direkt genau das
      if (!doc) return import('../app.js').then(m => m.tryFeature(tab));
      if (hasIt) return go(`#/app/${doc.id}/${tab}`);
      // Gibt’s noch nicht? Kurz personalisieren – erst „Erstellen“ legt los
      if (['karten', 'quiz', 'podcast', 'zettel'].includes(tab)) {
        return import('../create.js').then(async m => {
          const o = await m.personalise(tab, doc); if (!o) return;
          m.setCreate(tab, doc.id, o); go(`#/app/${doc.id}/${tab}/auto`);
        });
      }
      go(`#/app/${doc.id}/${tab}${tab === 'pfad' ? '/auto' : ''}`);
    };

    // ---------- 1) Skripte ----------
    const docCard = x => {
      const st = stats(x), on = d && x.id === d.id, f = fachOf(x.id);
      const bits = [st.due ? L(`${st.due} fällig`, `${st.due} due`) : st.cards ? L(`${st.cards} Karten`, `${st.cards} cards`) : null, st.lastScore != null ? L(`Quiz ${st.lastScore} %`, `Quiz ${st.lastScore}%`) : null, st.summary ? L('Zettel ✓', 'Sheet ✓') : null].filter(Boolean);
      return h('button', { class: 'ln-dc' + (on ? ' on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false', onclick: () => { selId = on ? null : x.id; draw(); } },
        h('span', { class: 'ln-dct' }, h('span', { class: 'ln-dci', html: ico(x.generated ? 'bulb' : 'file') }), f ? h('span', { class: 'ln-dcf' }, f.kurz || f.name) : null, on ? h('span', { class: 'ln-dcon', html: ico('check') }) : null),
        h('b', {}, x.name),
        h('span', { class: 'ln-dcm' }, h('span', { class: 'ln-bar' }, h('i', { style: { width: st.m + '%' } })), h('small', {}, st.m + ' %')),
        h('small', { class: 'ln-dcs' }, bits.length ? bits.join(' · ') : L('Noch nichts gelernt', 'Nothing studied yet')));
    };
    const docs$ = docs.length
      ? h('div', { class: 'ln-docs' }, docs.slice(0, 12).map(docCard),
        dropable(h('label', { class: 'ln-dc add', for: 'fileApp' }, h('span', { class: 'ln-dci', html: ico('plus') }), h('b', {}, L('Neues Skript', 'New slides')), h('small', { class: 'ln-dcs' }, L('Vorlesung, Buch, Video – oder hierher ziehen', 'Lecture, book, video – or drop here')))))
      : dropable(h('div', { class: 'ln-empty' }, h('span', { class: 'ln-dci', html: ico('upload') }),
        h('div', {}, h('b', {}, L('Lad dein erstes Skript hoch (Vorlesung, Buch, Video)', 'Upload your first material (lecture, book, video)')), h('small', {}, L('Einfach hierher ziehen oder hochladen – Vorlesungsvideos schreib ich dir ab. Dann bau ich dir Karteikarten, Quiz, Lernzettel und Podcast daraus.', 'Lecture videos and recordings too – I transcribe them and build flashcards, quizzes, study sheets and podcasts from it.'))),
        h('label', { class: 'btn primary sm', for: 'fileApp' }, L('Hochladen', 'Upload')),
        h('button', { class: 'btn sm', type: 'button', onclick: () => import('../app.js').then(m => m.topicPrompt()) }, L('Oder: Thema nennen', 'Or: name a topic'))));

    // ---------- 2) Tools fürs gewählte Skript ----------
    const st = d ? stats(d) : null;
    const T = (ic, t, status, action, fn, live2) => h('button', { class: 'ln-tile' + (live2 ? ' has' : ''), type: 'button', onclick: fn },
      h('span', { class: 'ln-ti', html: ico(ic) }), h('b', {}, t), h('small', { class: 'ln-st' }, status), h('span', { class: 'ln-act' }, action, h('span', { html: ico('right') })));
    const board = home ? T('board', L('An der Tafel erklären', 'Explain on the board'), d ? L('Max erklärt dir dein Skript Schritt für Schritt', 'Max explains your slides step by step') : L('Thema oder Skript – Max baut dir die Erklärseite', 'Topic or slides – Max builds the explainer'), L('Erklären', 'Explain'), () => { const doc = pickDoc(); if (doc) explainDoc(doc); else wrap.querySelector('.uv-tin')?.focus(); }) : null;
    if (board) board.classList.add('uv-board');
    const tools = d ? [
      T('cards', L('Karteikarten', 'Flashcards'), st.cards ? L(`${st.cards} Karten · ${st.due} fällig`, `${st.cards} cards · ${st.due} due`) : L('Noch keine – ich erstell sie dir', 'None yet – I’ll make them'), st.due ? L('Jetzt wiederholen', 'Review now') : st.cards ? L('Öffnen', 'Open') : L('Erstellen', 'Create'), need('karten', st.cards > 0), st.cards > 0),
      T('quiz', 'Quiz', st.quizzes ? L(`${st.quizzes} Quiz` + (st.lastScore != null ? ` · zuletzt ${st.lastScore} %` : ''), `${st.quizzes} quizzes` + (st.lastScore != null ? ` · last ${st.lastScore}%` : '')) : L('Fragen mit Erklärung – zeigt, wo’s hakt', 'Questions with explanations'), st.quizzes ? L('Öffnen', 'Open') : L('Erstellen', 'Create'), need('quiz', st.quizzes > 0), st.quizzes > 0),
      T('note', L('Lernzettel', 'Study sheet'), st.summary ? L('Fertig – alles auf einer Seite', 'Ready – everything on one page') : L('Das Wichtigste auf einer Seite', 'The essentials on one page'), st.summary ? L('Lesen', 'Read') : L('Erstellen', 'Create'), need('zettel', st.summary), st.summary),
      T('headphones', 'Podcast', st.pods ? L(`${st.pods} ${st.pods === 1 ? 'Folge' : 'Folgen'}`, `${st.pods} episode${st.pods === 1 ? '' : 's'}`) : L('Zum Anhören – unterwegs, beim Sport', 'To listen to on the go'), st.pods ? L('Anhören', 'Listen') : L('Erstellen', 'Create'), need('podcast', st.pods > 0), st.pods > 0),
      T('path', L('Lernpfad', 'Study path'), st.chAll ? L(`${st.chDone} von ${st.chAll} Kapiteln`, `${st.chDone} of ${st.chAll} chapters`) : L('Kapitel für Kapitel, mit Mini-Checks', 'Chapter by chapter'), st.chAll ? L('Weiter', 'Continue') : L('Erstellen', 'Create'), need('pfad', st.chAll > 0), st.chAll > 0),
      T('calendar', L('Klausurplan', 'Exam plan'), st.plan ? (st.plan.daysLeft >= 0 ? L(`Klausur in ${tage(st.plan.daysLeft)}`, `Exam in ${tage(st.plan.daysLeft)}`) + (st.plan.todayOpen?.length ? L(` · heute ${st.plan.todayOpen.length} offen`, ` · ${st.plan.todayOpen.length} open today`) : '') : L('Klausur vorbei', 'Exam over')) : L('Tag für Tag bis zur Klausur', 'Day by day to the exam'), st.plan ? L('Öffnen', 'Open') : L('Plan machen', 'Make a plan'), need('plan', !!st.plan), !!st.plan),
    ] : [
      // Ohne Skript trotzdem alle Werkzeuge zeigen – erst Stoff (Upload oder Thema), dann direkt das Werkzeug
      // Pro Werkzeug der Nutzen statt sechsmal derselbe Upload-Satz (der steht einmal oben)
      ...[['cards', L('Karteikarten', 'Flashcards'), 'karten', L('Wiederholen, kurz bevor du’s vergisst', 'Review right before you forget')], ['quiz', 'Quiz', 'quiz', L('Klausurfragen mit Erklärung', 'Exam questions with explanations')], ['note', L('Lernzettel', 'Study sheet'), 'zettel', L('Alles Wichtige auf einer Seite', 'Everything important on one page')], ['headphones', 'Podcast', 'podcast', L('Marie & Max erklären’s dir zum Anhören', 'Marie & Max explain it for listening')], ['path', L('Lernpfad', 'Study path'), 'pfad', L('Kapitel für Kapitel, mit Mini-Checks', 'Chapter by chapter, with mini checks')], ['calendar', L('Klausurplan', 'Exam plan'), 'plan', L('Tag für Tag bis zur Klausur', 'Day by day to the exam')]]
        .map(([ic, t, tab, sub]) => T(ic, t, sub, L('Erstellen', 'Create'), need(tab, false)))
    ];
    const trimmed = d ? (d.name.length > 46 ? d.name.slice(0, 45) + '…' : d.name) : '';
    if (home) pickSlot.replaceChildren(docPicker(docs, d, id => { selId = id; draw(); }));

    wrap.replaceChildren(
      hero || h('header', { class: 'ln-head' },
        h('div', { class: 'eyebrow' }, L('Lernen', 'Learn')),
        h('h1', {}, L('Wie willst du heute lernen?', 'How do you want to study today?')),
        h('p', { class: 'ln-sub' }, d ? L(`Du lernst gerade mit „${trimmed}“ – unten findest du alles dazu. Anderes Skript? Einfach oben antippen.`, `You’re studying “${trimmed}” – everything for it is below. Other slides? Just tap one above.`) : L('Kein Skript gewählt. Wähl oben ein vorhandenes Skript – oder lad dein eigenes direkt beim Lerntool hoch (Karteikarten, Quiz, Lernzettel …). Ohne Skript geht’s auch mit einem Thema.', 'No slides selected. Pick existing slides above – or upload your own right in the study tool (flashcards, quiz, study sheet …). Without slides, a topic works too.'))),
      home ? null : h('section', { class: 'ln-grp first' }, h('div', { class: 'ln-gh' }, h('h2', {}, home ? L('Deine Unterlagen', 'Your material') : L('Deine Skripte', 'Your slides')), h('span', { class: 'eyebrow' }, docs.length ? L(`${docs.length} ${docs.length === 1 ? 'Skript' : 'Skripte'}`, `${docs.length} slides`) : '')), docs$),
      h('section', { class: 'ln-grp' }, h('div', { class: 'ln-gh' }, d ? h('h2', {}, L('Mit ', 'With '), h('span', { class: 'ln-q' }, `„${trimmed}“`), L(' lernen', '')) : h('h2', {}, L('Lerntools', 'Study tools'), h('small', { class: 'ln-h2s' }, L(' · mit deinem Skript oder einem Thema', ' · with your slides or a topic'))), h('span', { class: 'eyebrow' }, L('Stoff aufbauen', 'Build it up'))),
        h('div', { class: 'ln-grid' }, board, tools)),
      h('section', { class: 'ln-grp' }, h('div', { class: 'ln-gh' }, h('h2', {}, L('Üben & Prüfen', 'Practise & test')), h('span', { class: 'eyebrow' }, L('Bis es sitzt', 'Until it sticks'))),
        h('div', { class: 'ln-grid' },
          T('exam', L('Klausur-Simulator', 'Exam simulator'), L('Mit Zeit, Punkten und Notenschlüssel', 'With time, points and grading'), L('Starten', 'Start'), async () => { if (await gated('exam')) return; fromHere(); import('../app.js').then(m => m.examTool()); }),
          T('whistle', L('BWL-Trainer', 'Business trainer'), L('Aufgaben ohne Ende, sofort korrigiert', 'Endless exercises, corrected instantly'), L('Trainieren', 'Train'), () => go('#/app/trainer')),
          T('camera', L('Fotocheck Buchungssätze', 'Photo check: entries'), L('Auf Papier lösen, Foto machen, fertig', 'Solve on paper, snap a photo'), L('Starten', 'Start'), () => go('#/app/trainer/buchung')),
          T('calc', L('Rechner', 'Calculators'), L('Exakt gerechnet, mit Rechenweg', 'Exact, with the workings'), L('Öffnen', 'Open'), () => go('#/app/rechner')),
          T('trophy', L('Wochen-Challenge', 'Weekly challenge'), L('Jede Woche neu – mit Rangliste', 'New every week – with a leaderboard'), L('Mitmachen', 'Join'), () => go('#/app/challenge')))),
      home ? null : h('section', { class: 'ln-grp' }, h('div', { class: 'ln-gh' }, h('h2', {}, L('Mit Max', 'With Max')), h('span', { class: 'eyebrow' }, L('Erklären lassen', 'Get it explained'))),
        h('div', { class: 'ln-grid' },
          T('board', L('An der Tafel erklären', 'Explain on the board'), L('Schritt für Schritt, mit Cursor und Warum', 'Step by step, with the why'), L('Loslegen', 'Start'), () => inRoom(api => api.prefill(L('Erklär mir an der Tafel: ', 'Explain on the board: ')))),
          T('chat', L('Abfragen', 'Quiz me'), L('Eine Frage nach der anderen', 'One question at a time'), L('Loslegen', 'Start'), () => inRoom(api => api.ask(L('Frag mich ab – eine Frage nach der anderen, warte jeweils auf meine Antwort und sag mir dann, ob’s sitzt.', 'Quiz me – one question at a time, wait for my answer each time and tell me if it’s right.')))),
          T('mic', L('Sprich mit mir', 'Talk to me'), L('Einfach reden – wie mit einem Tutor', 'Just talk – like with a tutor'), L('Loslegen', 'Start'), () => import('../app.js').then(m => m.talkToMax())),
          T('bulb', L('Ich erklär dir ein Thema', 'I’ll explain a topic'), L('Kein Skript? Nenn mir einfach das Thema', 'No slides? Just name the topic'), L('Thema nennen', 'Name a topic'), () => import('../app.js').then(m => m.topicPrompt())))));
    wrap.querySelectorAll('.ln-tile, .ln-dc').forEach((el, i) => el.style.setProperty('--i', String(Math.min(i, 14))));
  }
  draw();
  let redrawT = 0;
  const off = onChange(() => { clearTimeout(redrawT); redrawT = setTimeout(() => { if (wrap.isConnected) draw(); }, 80); });
  // Übersicht: Screenshot einfügen (⌘V) = hochladen
  const onPaste = e => { if (!home || e.target.closest?.('input, textarea, [contenteditable]')) return; const fs = [...(e.clipboardData?.files || [])]; if (fs.length) { e.preventDefault(); import('../app.js').then(m => m.startUpload(fs)); } };
  document.addEventListener('paste', onPaste);
  return () => { clearTimeout(redrawT); document.removeEventListener('paste', onPaste); if (typeof off === 'function') off(); };
}
