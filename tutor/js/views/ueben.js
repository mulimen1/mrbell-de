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
const fromHere = () => { try { sessionStorage.setItem('tutor.backTo', 'ueben'); } catch (e) {} };

async function trainers() { const m = await import('../trainer.js'); return m.TRAINERS; }

export async function render(root, { sub = '' } = {}) {
  if (sub === 'pfad') return guided(root);
  const wrap = h('div', { class: 'view-in ub' }); root.appendChild(wrap);
  const T = await trainers(); if (!wrap.isConnected) return;
  const byId = id => T.find(t => t.id === id);
  const st = state(), cur = byId(PATH[Math.min(st.i, PATH.length - 1)]);
  const all = stats(), total = Object.values(all).reduce((a, s) => a + (s.correct | 0), 0);
  const doneN = Math.min(st.i, PATH.length);
  const fEl = h('span', { class: 'ub-face' });
  const finished = st.i >= PATH.length;
  let xl = { n: 0, of: 0 };
  try { const x = ls.get('tutor.xltrain', null); const m = await import('../xl/lessons.js'); xl = { n: Object.keys((x && x.done) || {}).length, of: m.LESSONS.length }; } catch (e) {}
  if (!wrap.isConnected) return;

  const card = (ic, t, sub2, href, extra) => h('a', { class: 'ln-tile', href, onclick: fromHere }, h('span', { class: 'ln-ti', html: ico(ic) }), h('b', {}, t), h('small', { class: 'ln-st' }, sub2), extra || null);
  const tcard = x => { const s = all[x.id] || {}; return h('a', { class: 'ub-t', href: '#/app/trainer/' + x.id, onclick: fromHere }, h('small', { class: 'ub-ta' }, x.area), h('b', {}, x.title), h('span', { class: 'ub-ts' }, s.correct ? L(`${s.correct} gelöst`, `${s.correct} solved`) : L('Noch nicht geübt', 'Not practised yet'))); };

  wrap.replaceChildren(
    h('header', { class: 'ub-hero' },
      h('div', { class: 'ub-greet' }, fEl, h('div', { class: 'uv-bub' },
        h('b', {}, finished ? L('Alle Stationen geschafft. Respekt – jetzt kommt die Klausur.', 'All stations done. Respect – bring on the exam.') : doneN ? L(`Weiter geht’s: Station ${doneN + 1} von ${PATH.length} – ${cur.title}.`, `Let’s go on: station ${doneN + 1} of ${PATH.length} – ${cur.title}.`) : L('Ich führ dich durch die BWL – Station für Station, bis es sitzt.', 'I’ll guide you through business – station by station, until it sticks.')),
        h('small', {}, total ? L(`${total} Aufgaben gelöst · ${GOAL} richtige pro Station`, `${total} tasks solved · ${GOAL} correct per station`) : L(`${PATH.length} Stationen · je ${GOAL} richtige Aufgaben · sofort korrigiert`, `${PATH.length} stations · ${GOAL} correct tasks each · instant feedback`)))),
      h('div', { class: 'ub-path' }, PATH.map((id, k) => h('span', { class: 'ub-dot' + (k < doneN ? ' ok' : k === doneN ? ' cur' : ''), title: byId(id)?.title || id }))),
      h('div', { class: 'ub-cta' },
        h('a', { class: 'btn primary lg', href: '#/app/ueben/pfad', onclick: fromHere }, h('span', { html: ico('play') }), finished ? L('Nochmal von vorn', 'Start over') : doneN ? L(`Weiter: ${cur.title}`, `Continue: ${cur.title}`) : L('Geführt starten', 'Start guided')),
        h('a', { class: 'btn lg', href: '#/app/excel/trainer', onclick: fromHere }, h('span', { class: 'ub-xl', html: ico('sheet') }), L('Excel-Trainer', 'Excel trainer'), xl.of ? h('small', { class: 'ub-xln' }, `${xl.n}/${xl.of}`) : null))),
    h('section', { class: 'ln-grp' }, h('div', { class: 'ln-gh' }, h('h2', {}, L('Alle Themen', 'All topics')), h('span', { class: 'eyebrow' }, L(`${T.length} Trainer`, `${T.length} trainers`))),
      h('div', { class: 'ub-grid' }, PATH.map(byId).filter(Boolean).concat(T.filter(x => !PATH.includes(x.id))).map(tcard))),
    h('section', { class: 'ln-grp' }, h('div', { class: 'ln-gh' }, h('h2', {}, L('Prüfen & Wettkampf', 'Test & compete')), h('span', { class: 'eyebrow' }, L('Wie in echt', 'Like the real thing'))),
      h('div', { class: 'ln-grid' },
        h('button', { class: 'ln-tile', type: 'button', onclick: () => { fromHere(); import('../app.js').then(m => m.examTool()); } }, h('span', { class: 'ln-ti', html: ico('exam') }), h('b', {}, L('Klausur-Simulator', 'Exam simulator')), h('small', { class: 'ln-st' }, L('Mit Zeit, Punkten und Notenschlüssel', 'With time, points and grading'))),
        card('camera', L('Fotocheck Buchungssätze', 'Photo check: entries'), L('Auf Papier lösen, Foto machen, fertig', 'Solve on paper, snap a photo'), '#/app/trainer/buchung'),
        card('trophy', L('Wochen-Challenge', 'Weekly challenge'), L('Jede Woche neu – mit Rangliste', 'New every week – with a leaderboard'), '#/app/challenge'),
        card('spark', L('BWL-Duell', 'Business duel'), L('1 gegen 1 – wer weiß mehr?', '1 vs 1 – who knows more?'), '#/app/duell'),
        card('calc', L('Rechner', 'Calculators'), L('Exakt gerechnet, mit Rechenweg', 'Exact, with the workings'), '#/app/rechner'))));
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
  wrap.append(h('a', { class: 'view-back', href: '#/app/ueben' }, h('span', { html: ico('left') }), L('Zurück zu Üben', 'Back to practice')), guide, body);
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
