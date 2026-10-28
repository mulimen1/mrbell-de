// Üben: alle Trainer an einem Ort – Max führt Station für Station durch die BWL (wie beim Excel-Trainer),
// dazu Excel-Trainer, alle Themen einzeln und Prüfen & Wettkampf.
import { h, ico, ls } from '../util.js';
import { L } from '../i18n.js';
import { face } from '../face.js';

// Reihenfolge des geführten Wegs: von den Grundlagen des Rechnungswesens bis zur VWL
const PATH = ['buchung', 'tkonten', 'bilanz', 'abschreibung', 'kennzahlen', 'kalkulation', 'breakeven', 'kapitalwert', 'finanzierung', 'lager', 'produktion', 'marketing', 'markt', 'makro'];
const GOAL = 5;   // so viele richtige Aufgaben pro Station
const KEY = 'tutor.ueben.path';
const stats = () => { try { return JSON.parse(localStorage.getItem('tutor.trainer.v1') || '{}') || {}; } catch (e) { return {}; } };
const solved = id => (stats()[id] || {}).correct | 0;
const state = () => { const s = ls.get(KEY, null); return s && typeof s.i === 'number' ? s : { i: 0, base: solved(PATH[0]), done: [] }; };
const setState = s => ls.set(KEY, s);
// Test (nur Bens Konto): jede Trainer-Karte bekommt ihre eigene Icon-Farbe nach Fachgebiet
const TONE = { buchung: 'blue', tkonten: 'blue', bilanz: 'blue', abschreibung: 'blue', kennzahlen: 'cyan', lager: 'cyan', kalkulation: 'orange', breakeven: 'orange', kapitalwert: 'yellow', finanzierung: 'yellow', produktion: 'pink', marketing: 'red', markt: 'purple', makro: 'indigo' };
const fromHere = () => { try { sessionStorage.setItem('tutor.backTo', 'ueben'); } catch (e) {} };

async function trainers() { const m = await import('../trainer.js'); return m.TRAINERS; }

export async function render(root, { sub = '' } = {}) {
  if (sub === 'pfad') return guided(root);
  if (['tafel', 'zettel', 'karten', 'podcast', 'lernpfad', 'quiz', 'simulator'].includes(sub)) { const m = await import('./tools.js'); return m.learnPick(root, sub); }
  const wrap = h('div', { class: 'view-in ub' }); root.appendChild(wrap);
  if (document.documentElement.dataset.nv) root.insertBefore(h('div', { class: 'view-in kt-headrow' }, h('div', { class: 'kt-head' }, h('div', { class: 'eyebrow' }, L('Lernen', 'Learn')), h('h1', {}, L('Üben, prüfen, gewinnen. ', 'Practise, check, win. '), h('span', {}, L('Bis es sitzt.', 'Until it sticks.'))))), wrap);   // Test: klare Überschrift
  const T = await trainers(); if (!wrap.isConnected) return;
  const BEN = !!document.documentElement.dataset.nv;
  if (BEN) wrap.classList.add('nvp-ub');
  const byId = id => T.find(t => t.id === id);
  const st = state(), cur = byId(PATH[Math.min(st.i, PATH.length - 1)]);
  const all = stats(), total = Object.values(all).reduce((a, s) => a + (s.correct | 0), 0);
  const doneN = Math.min(st.i, PATH.length);
  const fEl = h('span', { class: 'ub-face' });
  const finished = st.i >= PATH.length;
  let xl = { n: 0, of: 0 };
  try { const x = ls.get('tutor.xltrain', null); const m = await import('../xl/lessons.js'); xl = { n: Object.keys((x && x.done) || {}).length, of: m.LESSONS.length }; } catch (e) {}
  if (!wrap.isConnected) return;

  const svg = d => `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  // Trainer-Karten im Stil des Trainer-Bereichs: Symbol, Fach, Titel, Beschreibung, Stand
  const tcard = (x, i) => { const s = all[x.id] || {}, k = PATH.indexOf(x.id);
    return h('a', Object.assign({ class: 'tr-card ub-tc', href: '#/app/trainer/' + x.id, onclick: fromHere, style: `animation-delay:${i * 25}ms` }, BEN ? { 'data-tone': TONE[x.id] || 'blue' } : {}),
      h('div', { class: 'tr-ico', html: svg(x.icon || '') }), h('div', { class: 'eyebrow' }, x.area), h('h3', null, x.title), h('p', null, x.desc),
      h('div', { class: 'tr-card-f' }, s.attempts ? [h('span', null, L(`${s.correct | 0} gelöst`, `${s.correct | 0} solved`)), h('span', null, L(`Serie ${s.streak | 0}`, `Streak ${s.streak | 0}`))] : h('span', null, L('Noch nicht geübt', 'Not practised yet')), k >= 0 && k < doneN ? h('span', { class: 'ub-ok' }, '✓') : null)); };
  // Prüfen & Wettkampf: rechte Spalte
  const pcard = (ic, t, sub2, go, tone) => h(typeof go === 'string' ? 'a' : 'button', Object.assign({ class: 'ub-pc' + (tone ? ' ' + tone : '') }, typeof go === 'string' ? { href: go, onclick: fromHere } : { type: 'button', onclick: go }),
    h('span', { class: 'ub-pci', html: ico(ic) }), h('span', { class: 'ub-pct' }, h('b', {}, t), h('small', {}, sub2)), h('span', { class: 'ub-pcg', html: ico('right') }));

  const { XL_ICON: XL } = await import('./excel.js');
  // Prüfungssimulation: Klausur-Simulator und Quiz – wie in der echten Prüfung
  const big = (ic, t, sub, go, hot) => h('button', { class: 'ub-sim' + (hot ? ' hot' : ''), type: 'button', onclick: () => { fromHere(); go(); } }, h('span', { class: 'ub-pci', html: ic }), h('span', { class: 'ub-pct' }, h('b', {}, t), h('small', {}, sub)), h('span', { class: 'ub-pcg', html: ico('right') }));
  const quizGo = () => { let id = null; try { const f = JSON.parse(localStorage.getItem('tutor.room.focus') || '[]'); id = f[0]; } catch (e) {} import('../state.js').then(st => { const d = id && st.S.list.find(x => x.id === id); if (d) location.hash = `#/app/${d.id}/quiz`; else import('../app.js').then(m => m.tryFeature('quiz')); }); };
  const sim = h('div', { class: 'ub-simrow' },
    big(ico('exam'), L('Klausur-Simulator', 'Exam simulator'), L('Mit Zeit, Punkten und Notenschlüssel – wie in echt', 'With time, points and grading – like the real thing'), () => { location.hash = '#/app/ueben/simulator'; }, true),
    big(ico('quiz'), 'Quiz', L('Klausurfragen mit Erklärung zu jeder Antwort', 'Exam questions with every answer explained'), () => { location.hash = '#/app/ueben/quiz'; }));
  // Excel-Trainer als eigene Trainer-Karte
  const xlCard = h('a', { class: 'tr-card ub-tc ub-xlc', href: '#/app/excel/trainer', onclick: fromHere },
    h('div', { class: 'tr-ico', html: XL }), h('div', { class: 'eyebrow' }, 'Excel'), h('h3', null, L('Excel-Trainer', 'Excel trainer')), h('p', null, L('Echter Excel-Nachbau, echte Tastenkürzel, echte BWL-Aufgaben – Max führt dich Schritt für Schritt.', 'A real Excel replica, real shortcuts, real business tasks – Max guides you step by step.')),
    h('div', { class: 'tr-card-f' }, h('span', null, xl.of ? L(`${xl.n} von ${xl.of} Lektionen`, `${xl.n} of ${xl.of} lessons`) : L('Noch nicht geübt', 'Not practised yet'))));
  // Trainer: bei Ben als eigener, voll breiter Bereich unter Lernweg und Seitenspalte (drei Spalten statt zwei)
  const trSec = [h('div', { class: 'ln-gh ub-h ub-h2' + (BEN ? ' nvp-trh' : '') }, h('h2', {}, 'Trainer'), h('span', { class: 'eyebrow' }, L(`${T.length + 1} Themen`, `${T.length + 1} topics`))),
    h('div', { class: 'tr-grid ub-tgrid' }, PATH.map(byId).filter(Boolean).concat(T.filter(x => !PATH.includes(x.id))).map(tcard), xlCard)];
  const left = h('div', { class: 'ub-left' },
    h('header', { class: 'ub-hero' },
      h('div', { class: 'ub-greet' }, fEl, h('div', { class: 'uv-bub' },
        BEN ? h('div', { class: 'nvp-ubtag' }, h('span', { class: 'nvp-ubtagi', html: ico('path') }), finished ? L('Geführter Lernweg · geschafft', 'Guided path · done') : L(`Geführter Lernweg · Station ${doneN + 1} von ${PATH.length}`, `Guided path · station ${doneN + 1} of ${PATH.length}`)) : null,
        h('b', {}, finished ? L('Alle Stationen geschafft. Respekt – jetzt kommt die Klausur.', 'All stations done. Respect – bring on the exam.') : doneN ? L(`Weiter geht’s: Station ${doneN + 1} von ${PATH.length} – ${cur.title}.`, `Let’s go on: station ${doneN + 1} of ${PATH.length} – ${cur.title}.`) : L('Ich führ dich durch die BWL – Station für Station, bis es sitzt.', 'I’ll guide you through business – station by station, until it sticks.')),
        h('small', {}, total ? L(`${total} Aufgaben gelöst · ${GOAL} richtige pro Station`, `${total} tasks solved · ${GOAL} correct per station`) : L(`${PATH.length} Stationen · je ${GOAL} richtige Aufgaben · sofort korrigiert`, `${PATH.length} stations · ${GOAL} correct tasks each · instant feedback`)))),
      h('div', { class: 'ub-path' }, PATH.map((id, k) => h('span', { class: 'ub-dot' + (k < doneN ? ' ok' : k === doneN ? ' cur' : ''), title: byId(id)?.title || id }))),
      h('div', { class: 'ub-cta' },
        h('a', { class: 'btn primary lg', href: '#/app/ueben/pfad', onclick: fromHere }, h('span', { html: ico('play') }), finished ? L('Nochmal von vorn', 'Start over') : doneN ? L(`Weiter: ${cur.title}`, `Continue: ${cur.title}`) : L('Geführt starten', 'Start guided')),
        h('a', { class: 'btn lg', href: '#/app/excel/trainer', onclick: fromHere }, h('span', { class: 'ub-xl', html: XL }), L('Excel-Trainer', 'Excel trainer'), xl.of ? h('small', { class: 'ub-xln' }, `${xl.n}/${xl.of}`) : null))),
    h('div', { class: 'ln-gh ub-h ub-hs' }, h('h2', {}, L('Aus deinem Stoff lernen', 'Learn from your material')), h('span', { class: 'eyebrow' }, L('Max baut es dir in Sekunden', 'Max builds it in seconds'))),
    h('div', { class: 'ub-lt' }, [
      ['board', L('An der Tafel erklären', 'Explain on the board'), L('Schritt für Schritt', 'Step by step')],
      ['note', L('Lernzettel', 'Study sheet'), L('Alles auf einer Seite', 'All on one page')],
      ['cards', L('Karteikarten', 'Flashcards'), L('Bis es sitzt', 'Until it sticks')],
      ['headphones', 'Podcast', L('Marie & Max', 'Marie & Max')],
      ['path', L('Lernpfad', 'Study path'), L('Kapitel für Kapitel', 'Chapter by chapter')],
    ].map(([ic, t, sub]) => h('button', { class: 'ub-ltc', type: 'button', 'data-lt': ic, onclick: () => { location.hash = '#/app/ueben/' + ({ board: 'tafel', note: 'zettel', cards: 'karten', headphones: 'podcast', path: 'lernpfad' })[ic]; } }, h('span', { class: 'ub-lti', html: ico(ic) }), h('b', {}, t), h('small', {}, sub)))),
    h('div', { class: 'ln-gh ub-h' }, h('h2', {}, L('Prüfungssimulation', 'Exam simulation')), h('span', { class: 'eyebrow' }, L('Wie in der echten Klausur', 'Like the real exam'))),
    sim,
    ...(BEN ? [] : trSec));
  // Prüfen: irgendwas aus der BWL hochladen (Foto, Screenshot, PDF deiner Lösung) – Max korrigiert
  const upIn = h('input', { type: 'file', class: 'sr', accept: 'image/*,application/pdf,.pdf,.doc,.docx,.ppt,.pptx,.txt', multiple: true });
  const check = fs => { fs = [...(fs || [])]; if (!fs.length) return; fromHere(); ls.set('tutor.target', 'check'); import('../app.js').then(m => m.startUpload(fs)); };
  upIn.addEventListener('change', () => { check(upIn.files); upIn.value = ''; });
  const upCard = h('button', { class: 'ub-up', type: 'button', onclick: () => upIn.click() },
    h('span', { class: 'ub-pci', html: ico('upload') }), h('span', { class: 'ub-pct' }, h('b', {}, L('Lösung prüfen lassen', 'Get your answer checked')), h('small', {}, L('Foto, Screenshot oder PDF – egal welches BWL-Thema. Max korrigiert Schritt für Schritt.', 'Photo, screenshot or PDF – any business topic. Max corrects it step by step.'))), upIn);
  { let n = 0; upCard.addEventListener('dragenter', e => { if (!e.dataTransfer?.types?.includes('Files')) return; e.preventDefault(); n++; upCard.classList.add('over'); }); upCard.addEventListener('dragover', e => e.preventDefault()); upCard.addEventListener('dragleave', () => { if (--n <= 0) { n = 0; upCard.classList.remove('over'); } }); upCard.addEventListener('drop', e => { e.preventDefault(); n = 0; upCard.classList.remove('over'); check(e.dataTransfer?.files); }); }
  const wk = [h('div', { class: 'ln-gh ub-h ub-h2' + (BEN ? ' nvp-wkh' : '') }, h('h2', {}, L('Wettkampf', 'Compete'))),
    pcard('spark', L('BWL-Duell', 'Business duel'), L('1 gegen 1 – wer weiß mehr?', '1 vs 1 – who knows more?'), '#/app/duell', 'hot'),
    pcard('trophy', L('Wochen-Challenge', 'Weekly challenge'), L('Jede Woche neu – mit Rangliste', 'New every week – with a leaderboard'), '#/app/challenge')];
  const right = h('aside', { class: 'ub-right' },
    h('div', { class: 'ln-gh ub-h' }, h('h2', {}, L('Prüfen', 'Check'))),
    upCard,
    pcard('camera', L('Buchungssätze fotografieren', 'Photograph booking entries'), L('Auf Papier lösen, Foto machen – Max prüft', 'Solve on paper, snap it – Max checks'), '#/app/trainer/buchung'),
    pcard('calc', L('Rechner', 'Calculators'), L('Exakt gerechnet, mit Rechenweg', 'Exact, with the workings'), '#/app/rechner'),
    ...(BEN ? [] : wk));
  // Test Ben: Wettkampf links unter der Prüfungssimulation (zwei Karten nebeneinander) – beide Spalten etwa gleich hoch
  if (BEN) left.append(wk[0], h('div', { class: 'ub-simrow nvp-wkrow' }, wk[1], wk[2]));
  if (BEN) {
    // Lernen neu: Unter-Bereiche oben (wie die Bereiche im Header), wichtigstes zuerst
    const hero = left.querySelector('.ub-hero'), grid = left.querySelector('.ub-lt');
    grid.classList.add('ub-big');
    const DESC = { board: L('Max erklärt jedes Thema Schritt für Schritt – mit Beispiel und Rechenweg.', 'Max explains any topic step by step – with example and workings.'), note: L('Alles Wichtige auf einer Seite, plus Mindmap.', 'Everything important on one page, plus a mind map.'), cards: L('Wiederholen mit System, bis es sitzt.', 'Systematic review until it sticks.'), headphones: L('Marie & Max zum Anhören – für Bahn und Gym.', 'Marie & Max to listen to – for train and gym.'), path: L('Kapitel für Kapitel mit Lektionen und Checks.', 'Chapter by chapter with lessons and checks.') };
    grid.querySelectorAll('.ub-ltc').forEach(c => { const sm = c.querySelector('small'); if (sm && DESC[c.dataset.lt]) sm.textContent = DESC[c.dataset.lt]; });
    const guide = h('aside', { class: 'ub-guide' }, hero);
    const SECS = [
      ['stoff', 'brain', L('Aus deinem Stoff lernen', 'Learn from your material'), ['#9b7cf0', '#5b3fc4'], () => [h('div', { class: 'ub-stoff' }, h('div', { class: 'ub-sl' }, grid), guide)]],
      ['sim', 'exam', L('Prüfungssimulation', 'Exam simulation'), ['#f47ba0', '#c8336f'], () => [sim]],
      ['check', 'check', L('Prüfen', 'Check'), ['#3fc1c9', '#0e7f8e'], () => [h('div', { class: 'ub-grid2' }, ...[...right.children].filter(e => !e.classList.contains('ub-h') && !e.classList.contains('ln-gh')))]],
      ['wk', 'trophy', L('Wettkampf', 'Compete'), ['#f7c948', '#d18e06'], () => [h('div', { class: 'ub-simrow' }, wk[1], wk[2])]],
      ['tr', 'path', 'Trainer', ['#5aa2f7', '#1a5fc4'], () => trSec.slice(1)],
    ];
    let cur = 'stoff'; try { cur = sessionStorage.getItem('tutor.ubTab') || 'stoff'; } catch (e) {}
    if (!SECS.some(x => x[0] === cur)) cur = 'stoff';
    const body = h('div', { class: 'ub-body' });
    const tabs = h('nav', { class: 'ub-tabs', 'aria-label': L('Bereiche in Lernen', 'Sections in Learn') }, ...SECS.map(([k, ic, t, c]) => h('button', { type: 'button', class: 'ub-tab', 'data-k': k, style: { '--t1': c[0], '--t2': c[1] }, onclick: () => show(k) }, h('span', { class: 'ub-ti', html: ico(ic) }), h('span', {}, t))));
    const show = k => { cur = k; try { sessionStorage.setItem('tutor.ubTab', k); } catch (e) {} tabs.querySelectorAll('.ub-tab').forEach(b => b.classList.toggle('on', b.dataset.k === k)); const S2 = SECS.find(x => x[0] === k); body.replaceChildren(h('div', { class: 'ub-sec', style: { '--t1': S2[3][0], '--t2': S2[3][1] } }, h('h2', { class: 'ub-sh' }, S2[2]), ...S2[4]())); };
    wrap.replaceChildren(tabs, body);
    show(cur);
  } else wrap.replaceChildren(h('div', { class: 'ub-cols' }, left, right));
  face(fEl, {});
}

// Geführter Weg: Max oben, darunter der Trainer der aktuellen Station im Übungsmodus
async function guided(root) {
  const T = await trainers(), trMod = await import('../trainer.js');
  let st = state();
  if (st.i >= PATH.length) { st = { i: 0, base: solved(PATH[0]), done: [] }; setState(st); }
  const wrap = h('div', { class: 'view-in ub-g' }); root.appendChild(wrap);
  const fEl = h('span', { class: 'ub-gface' }), txt = h('b'), sub = h('small'), bar = h('i'), next = h('button', { class: 'btn primary', type: 'button', hidden: true });
  const skip = h('button', { class: 'linkbtn', type: 'button' }, L('Station überspringen', 'Skip station'));
  const guide = h('div', { class: 'ub-guide' }, fEl, h('div', { class: 'ub-gt' }, txt, sub, h('div', { class: 'ub-gbar' }, bar)), next, skip);
  const body = h('div', { class: 'ub-gbody' });
  wrap.append(h('a', { class: 'view-back', href: '#/app/ueben' }, h('span', { html: ico('left') }), L('Zurück zum Training', 'Back to training')), guide, body);
  const fc = face(fEl, {});
  let iv = 0;
  const draw = () => {
    const id = PATH[st.i], t = T.find(x => x.id === id);
    trMod.renderTrainer(body, { kind: id });
    // Übungsmodus statt „Entdecken“ – geführt wird geübt
    setTimeout(() => body.querySelector('.tr-mode[data-k="practice"]')?.click(), 30);
    body.querySelector('.tr-back')?.remove();
    next.hidden = true; skip.hidden = false;
    const tick = () => {
      if (!wrap.isConnected) return clearInterval(iv);
      const n = Math.max(0, solved(id) - st.base), done = n >= GOAL;
      txt.textContent = done ? L(`Station ${st.i + 1} geschafft – ${t.title} sitzt.`, `Station ${st.i + 1} done – ${t.title} sticks.`) : L(`Station ${st.i + 1} von ${PATH.length}: ${t.title}`, `Station ${st.i + 1} of ${PATH.length}: ${t.title}`);
      sub.textContent = done ? (st.i + 1 < PATH.length ? L(`Als Nächstes: ${T.find(x => x.id === PATH[st.i + 1])?.title}`, `Next: ${T.find(x => x.id === PATH[st.i + 1])?.title}`) : L('Das war die letzte Station.', 'That was the last station.')) : L(`${n} von ${GOAL} richtig – lies kurz die Erklärung, dann los.`, `${n} of ${GOAL} correct – skim the explanation, then go.`);
      bar.style.width = Math.min(100, n / GOAL * 100) + '%';
      if (done && next.hidden) {
        next.hidden = false; skip.hidden = true;
        next.textContent = st.i + 1 < PATH.length ? L('Nächste Station', 'Next station') : L('Fertig', 'Done');
        try { fc.pulse && fc.pulse('happy', 1800); } catch (e) {}
        import('../util.js').then(m => m.confetti && m.confetti({ n: 60, ms: 1400 })).catch(() => {});
      }
    };
    clearInterval(iv); tick(); iv = setInterval(tick, 900);
  };
  const advance = () => {
    st.done = [...new Set([...(st.done || []), PATH[st.i]])]; st.i++;
    if (st.i >= PATH.length) { setState(st); location.hash = '#/app/ueben'; return; }
    st.base = solved(PATH[st.i]); setState(st); draw();
    wrap.closest('.view')?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };
  next.addEventListener('click', advance);
  skip.addEventListener('click', advance);
  draw();
  return () => clearInterval(iv);
}
