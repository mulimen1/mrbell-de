// Lernen: alles, womit man bei BWL Max lernen kann, an einem Ort – mit Struktur.
// 1) Deine Skripte als Karten (Stand auf einen Blick, eins ist ausgewählt)
// 2) Was du mit DIESEM Skript machen kannst – jedes Tool zeigt, was schon da ist; was fehlt, wird nach kurzem Personalisieren erstellt
// 3) Üben & Prüfen, 4) Mit Max
import { h, ico, ls, toast } from '../util.js';
import { L } from '../i18n.js';
import { S, onChange, mastery } from '../state.js';
import { dueCards } from './cards.js';
import { planSummary } from './plan.js';
import { fachOf } from '../me.js';

const live = d => (S.doc && S.doc.id === d.id ? S.doc : d);
const byUse = () => S.list.map(live).sort((a, b) => Math.max(b.used || 0, b.created || 0) - Math.max(a.used || 0, a.created || 0));
function pickDoc() {
  const want = ls.get('tutor.learn.doc') || (ls.get('tutor.room.focus', []) || [])[0];
  const d = S.list.find(x => x.id === want) || byUse()[0] || null;
  return d ? live(d) : null;
}
// Aus Lernen heraus geöffnet: oben gibt’s „← Lernen“ zurück
const fromHere = () => { try { sessionStorage.setItem('tutor.backTo', 'lernen'); } catch (e) {} };
const go = hash => { fromHere(); location.hash = hash; };

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

export function render(root) {
  const wrap = h('div', { class: 'view-in ln' });
  root.appendChild(wrap);

  function draw() {
    const docs = byUse(), d = pickDoc();
    const need = (tab, hasIt) => () => {
      const doc = pickDoc();
      // Noch kein Skript: hochladen oder Thema nennen – danach entsteht direkt dieses Werkzeug
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
      return h('button', { class: 'ln-dc' + (on ? ' on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false', onclick: () => { ls.set('tutor.learn.doc', x.id); draw(); } },
        h('span', { class: 'ln-dct' }, h('span', { class: 'ln-dci', html: ico(x.generated ? 'bulb' : 'file') }), f ? h('span', { class: 'ln-dcf' }, f.kurz || f.name) : null, on ? h('span', { class: 'ln-dcon', html: ico('check') }) : null),
        h('b', {}, x.name),
        h('span', { class: 'ln-dcm' }, h('span', { class: 'ln-bar' }, h('i', { style: { width: st.m + '%' } })), h('small', {}, st.m + ' %')),
        h('small', { class: 'ln-dcs' }, bits.length ? bits.join(' · ') : L('Noch nichts gelernt', 'Nothing studied yet')));
    };
    const docs$ = docs.length
      ? h('div', { class: 'ln-docs' }, docs.slice(0, 12).map(docCard),
        h('label', { class: 'ln-dc add', for: 'fileApp' }, h('span', { class: 'ln-dci', html: ico('plus') }), h('b', {}, L('Neues Skript', 'New slides')), h('small', { class: 'ln-dcs' }, L('PDF, PowerPoint, Word, Foto', 'PDF, PowerPoint, Word, photo'))))
      : h('div', { class: 'ln-empty' }, h('span', { class: 'ln-dci', html: ico('upload') }),
        h('div', {}, h('b', {}, L('Lad dein erstes Skript hoch', 'Upload your first slides')), h('small', {}, L('Dann bau ich dir Karteikarten, Quiz, Lernzettel und Podcast daraus.', 'Then I’ll build flashcards, quizzes, study sheets and podcasts from it.'))),
        h('label', { class: 'btn primary sm', for: 'fileApp' }, L('Hochladen', 'Upload')),
        h('button', { class: 'btn sm', type: 'button', onclick: () => import('../app.js').then(m => m.topicPrompt()) }, L('Oder: Thema nennen', 'Or: name a topic')));

    // ---------- 2) Tools fürs gewählte Skript ----------
    const st = d ? stats(d) : null;
    const T = (ic, t, status, action, fn, live2) => h('button', { class: 'ln-tile' + (live2 ? ' has' : ''), type: 'button', onclick: fn },
      h('span', { class: 'ln-ti', html: ico(ic) }), h('b', {}, t), h('small', { class: 'ln-st' }, status), h('span', { class: 'ln-act' }, action, h('span', { html: ico('right') })));
    const tools = d ? [
      T('cards', L('Karteikarten', 'Flashcards'), st.cards ? L(`${st.cards} Karten · ${st.due} fällig`, `${st.cards} cards · ${st.due} due`) : L('Noch keine – ich erstell sie dir', 'None yet – I’ll make them'), st.due ? L('Jetzt wiederholen', 'Review now') : st.cards ? L('Öffnen', 'Open') : L('Erstellen', 'Create'), need('karten', st.cards > 0), st.cards > 0),
      T('quiz', 'Quiz', st.quizzes ? L(`${st.quizzes} Quiz` + (st.lastScore != null ? ` · zuletzt ${st.lastScore} %` : ''), `${st.quizzes} quizzes` + (st.lastScore != null ? ` · last ${st.lastScore}%` : '')) : L('Fragen mit Erklärung – zeigt, wo’s hakt', 'Questions with explanations'), st.quizzes ? L('Öffnen', 'Open') : L('Erstellen', 'Create'), need('quiz', st.quizzes > 0), st.quizzes > 0),
      T('note', L('Lernzettel', 'Study sheet'), st.summary ? L('Fertig – alles auf einer Seite', 'Ready – everything on one page') : L('Das Wichtigste auf einer Seite', 'The essentials on one page'), st.summary ? L('Lesen', 'Read') : L('Erstellen', 'Create'), need('zettel', st.summary), st.summary),
      T('headphones', 'Podcast', st.pods ? L(`${st.pods} ${st.pods === 1 ? 'Folge' : 'Folgen'}`, `${st.pods} episode${st.pods === 1 ? '' : 's'}`) : L('Zum Anhören – unterwegs, beim Sport', 'To listen to on the go'), st.pods ? L('Anhören', 'Listen') : L('Erstellen', 'Create'), need('podcast', st.pods > 0), st.pods > 0),
      T('path', L('Lernpfad', 'Study path'), st.chAll ? L(`${st.chDone} von ${st.chAll} Kapiteln`, `${st.chDone} of ${st.chAll} chapters`) : L('Kapitel für Kapitel, mit Mini-Checks', 'Chapter by chapter'), st.chAll ? L('Weiter', 'Continue') : L('Erstellen', 'Create'), need('pfad', st.chAll > 0), st.chAll > 0),
      T('calendar', L('Lernplan', 'Study plan'), st.plan ? (st.plan.daysLeft >= 0 ? L(`Klausur in ${tage(st.plan.daysLeft)}`, `Exam in ${tage(st.plan.daysLeft)}`) + (st.plan.todayOpen?.length ? L(` · heute ${st.plan.todayOpen.length} offen`, ` · ${st.plan.todayOpen.length} open today`) : '') : L('Klausur vorbei', 'Exam over')) : L('Tag für Tag bis zur Klausur', 'Day by day to the exam'), st.plan ? L('Öffnen', 'Open') : L('Plan machen', 'Make a plan'), need('plan', !!st.plan), !!st.plan),
    ] : [
      // Ohne Skript trotzdem alle Werkzeuge zeigen – erst Stoff (Upload oder Thema), dann direkt das Werkzeug
      ...[['cards', L('Karteikarten', 'Flashcards'), 'karten'], ['quiz', 'Quiz', 'quiz'], ['note', L('Lernzettel', 'Study sheet'), 'zettel'], ['headphones', 'Podcast', 'podcast'], ['path', L('Lernpfad', 'Study path'), 'pfad'], ['calendar', L('Lernplan', 'Study plan'), 'plan']]
        .map(([ic, t, tab]) => T(ic, t, L('Skript hochladen oder Thema nennen', 'Upload slides or name a topic'), L('Erstellen', 'Create'), need(tab, false)))
    ];
    const trimmed = d ? (d.name.length > 46 ? d.name.slice(0, 45) + '…' : d.name) : '';

    wrap.replaceChildren(
      h('header', { class: 'ln-head' },
        h('div', { class: 'eyebrow' }, L('Lernen', 'Learn')),
        h('h1', {}, L('Wie willst du heute lernen?', 'How do you want to study today?')),
        h('p', { class: 'ln-sub' }, L('Wähl ein Skript – darunter siehst du, was schon fertig ist und was ich dir noch baue.', 'Pick your slides – below you’ll see what’s ready and what I can still build.'))),
      h('section', { class: 'ln-grp first' }, h('div', { class: 'ln-gh' }, h('h2', {}, L('Deine Skripte', 'Your slides')), h('span', { class: 'eyebrow' }, docs.length ? L(`${docs.length} ${docs.length === 1 ? 'Skript' : 'Skripte'}`, `${docs.length} slides`) : '')), docs$),
      h('section', { class: 'ln-grp' }, h('div', { class: 'ln-gh' }, d ? h('h2', {}, L('Mit ', 'With '), h('span', { class: 'ln-q' }, `„${trimmed}“`), L(' lernen', '')) : h('h2', {}, L('Lernstoff aufbauen', 'Build your study material')), h('span', { class: 'eyebrow' }, L('Stoff aufbauen', 'Build it up'))),
        h('div', { class: 'ln-grid' }, tools)),
      h('section', { class: 'ln-grp' }, h('div', { class: 'ln-gh' }, h('h2', {}, L('Üben & Prüfen', 'Practise & test')), h('span', { class: 'eyebrow' }, L('Bis es sitzt', 'Until it sticks'))),
        h('div', { class: 'ln-grid' },
          T('exam', L('Klausur-Simulator', 'Exam simulator'), L('Mit Zeit, Punkten und Notenschlüssel', 'With time, points and grading'), L('Starten', 'Start'), () => { fromHere(); import('../app.js').then(m => m.examTool()); }),
          T('whistle', L('BWL-Trainer', 'Business trainer'), L('Aufgaben ohne Ende, sofort korrigiert', 'Endless exercises, corrected instantly'), L('Trainieren', 'Train'), () => go('#/app/trainer')),
          T('camera', L('Fotocheck Buchungssätze', 'Photo check: entries'), L('Auf Papier lösen, Foto machen, fertig', 'Solve on paper, snap a photo'), L('Starten', 'Start'), () => go('#/app/trainer/buchung')),
          T('calc', L('Rechner', 'Calculators'), L('Exakt gerechnet, mit Rechenweg', 'Exact, with the workings'), L('Öffnen', 'Open'), () => go('#/app/rechner')),
          T('trophy', L('Wochen-Challenge', 'Weekly challenge'), L('Jede Woche neu – mit Rangliste', 'New every week – with a leaderboard'), L('Mitmachen', 'Join'), () => go('#/app/challenge')))),
      h('section', { class: 'ln-grp' }, h('div', { class: 'ln-gh' }, h('h2', {}, L('Mit Max', 'With Max')), h('span', { class: 'eyebrow' }, L('Erklären lassen', 'Get it explained'))),
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
  return () => { clearTimeout(redrawT); if (typeof off === 'function') off(); };
}
