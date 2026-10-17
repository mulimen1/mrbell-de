// Lernen: alles, womit man bei BWL Max lernen kann, an einem Ort.
// Oben das Skript, mit dem gelernt wird – darunter drei ruhige Gruppen mit großen Kacheln.
import { h, ico, ls, toast } from '../util.js';
import { L } from '../i18n.js';
import { S, onChange } from '../state.js';
import { dueCards } from './cards.js';

const byUse = () => S.list.slice().sort((a, b) => (b.used || 0) - (a.used || 0));
function pickDoc() {
  const want = ls.get('tutor.learn.doc') || (ls.get('tutor.room.focus', []) || [])[0];
  return S.list.find(d => d.id === want) || byUse()[0] || null;
}

// Max im Tutor-Raum etwas machen lassen (wartet, bis der Raum steht)
async function inRoom(fn) {
  location.hash = '#/app/tutor';
  for (let k = 0; k < 40; k++) { await new Promise(r => setTimeout(r, 100)); if (document.querySelector('.asst.stage')) break; }
  try { const m = await import('../assistant.js'); const api = m.mountAssistant(); if (api) fn(api); } catch (e) {}
}

export function render(root) {
  const wrap = h('div', { class: 'view-in ln' });
  root.appendChild(wrap);
  let menu = null;
  const closeMenu = () => { if (menu) { menu.remove(); menu = null; } };

  function draw() {
    closeMenu();
    const d = pickDoc();
    const need = (tab) => () => {
      const doc = pickDoc();
      if (!doc) { toast(L('Dafür brauch ich ein Skript – lad eins hoch oder nenn mir ein Thema.', 'I need slides for that – upload some or name a topic.'), 4200); document.getElementById('fileApp')?.click(); return; }
      location.hash = `#/app/${doc.id}/${tab}`;
    };
    const due = d ? dueCards(d).length : 0;
    const tile = ([ic, t, s2, fn, badge], i) => h('button', { class: 'ln-tile', type: 'button', onclick: fn, style: { '--i': String(i) } },
      h('span', { class: 'ln-ti', html: ico(ic) }), badge ? h('span', { class: 'ln-badge' }, badge) : null,
      h('b', {}, t), h('small', {}, s2), h('span', { class: 'ln-go', html: ico('right') }));
    const group = (title, sub, items, off = 0) => h('section', { class: 'ln-grp' },
      h('div', { class: 'ln-gh' }, h('h2', {}, title), h('span', { class: 'eyebrow' }, sub)),
      h('div', { class: 'ln-grid' }, items.map((it, i) => tile(it, i + off))));

    // Skript-Wahl
    const docBtn = h('button', { class: 'ln-doc', type: 'button', 'aria-haspopup': 'menu', onclick: e => {
      e.stopPropagation();
      if (menu) return closeMenu();
      const list = byUse().slice(0, 30);
      menu = h('div', { class: 'ln-menu', role: 'menu' },
        list.map(x => h('button', { class: 'ln-mi' + (d && x.id === d.id ? ' on' : ''), type: 'button', role: 'menuitem', onclick: () => { ls.set('tutor.learn.doc', x.id); draw(); } },
          h('span', { html: ico('file') }), h('span', { class: 'ln-mt' }, x.name), d && x.id === d.id ? h('span', { html: ico('check') }) : null)),
        h('label', { class: 'ln-mi add', for: 'fileApp', onclick: () => setTimeout(closeMenu, 50) }, h('span', { html: ico('plus') }), L('Neues Skript hochladen', 'Upload new slides')));
      docRow.appendChild(menu);
    } }, h('span', { class: 'ln-dl' }, L('Ich lerne mit', 'Studying with')), h('b', {}, d ? d.name : L('noch keinem Skript', 'no slides yet')), h('span', { html: ico('down') }));
    const docRow = h('div', { class: 'ln-docrow' }, docBtn);

    wrap.replaceChildren(
      h('header', { class: 'ln-head' },
        h('div', { class: 'eyebrow' }, L('Lernen', 'Learn')),
        h('h1', {}, L('Wie willst du heute lernen?', 'How do you want to study today?')),
        h('p', { class: 'ln-sub' }, L('Alles an einem Ort – Max baut’s dir aus deinem Skript.', 'Everything in one place – Max builds it from your slides.')),
        docRow),
      group(L('Aus deinem Skript', 'From your slides'), L('Stoff aufbauen', 'Build it up'), [
        ['cards', L('Karteikarten', 'Flashcards'), L('Fällige Karten wiederholen, neue aus dem Skript', 'Review due cards, new ones from your slides'), need('karten'), due ? String(due) : ''],
        ['quiz', 'Quiz', L('Fragen mit Erklärung – zeigt dir, wo’s hakt', 'Questions with explanations – shows where it’s stuck'), need('quiz')],
        ['note', L('Lernzettel', 'Study sheet'), L('Das Wichtigste auf einer Seite', 'The essentials on one page'), need('zettel')],
        ['headphones', 'Podcast', L('Zum Anhören – unterwegs, beim Sport', 'To listen to – on the go, at the gym'), need('podcast')],
        ['path', L('Lernpfad', 'Study path'), L('Kapitel für Kapitel, mit Mini-Checks', 'Chapter by chapter, with mini checks'), need('pfad')],
        ['calendar', L('Lernplan', 'Study plan'), L('Tag für Tag bis zur Klausur', 'Day by day until the exam'), need('plan')],
      ]),
      group(L('Üben & Prüfen', 'Practise & test'), L('Bis es sitzt', 'Until it sticks'), [
        ['exam', L('Klausur-Simulator', 'Exam simulator'), L('Mit Zeit, Punkten und Notenschlüssel', 'With time, points and grading'), () => import('../app.js').then(m => m.examTool())],
        ['whistle', L('BWL-Trainer', 'Business trainer'), L('Aufgaben ohne Ende, sofort korrigiert', 'Endless exercises, corrected instantly'), () => { location.hash = '#/app/trainer'; }],
        ['camera', L('Fotocheck Buchungssätze', 'Photo check: entries'), L('Auf Papier lösen, Foto machen, fertig', 'Solve on paper, take a photo, done'), () => { location.hash = '#/app/trainer/buchung'; }],
        ['calc', L('Rechner', 'Calculators'), L('Exakt gerechnet, mit Rechenweg', 'Exact, with the workings'), () => { location.hash = '#/app/rechner'; }],
        ['trophy', L('Wochen-Challenge', 'Weekly challenge'), L('Jede Woche neu – mit Rangliste', 'New every week – with a leaderboard'), () => { location.hash = '#/app/challenge'; }],
      ], 6),
      group(L('Mit Max', 'With Max'), L('Erklären lassen', 'Get it explained'), [
        ['board', L('An der Tafel erklären', 'Explain on the board'), L('Schritt für Schritt, mit Cursor und Warum', 'Step by step, with cursor and the why'), () => inRoom(api => api.prefill(L('Erklär mir an der Tafel: ', 'Explain on the board: ')))],
        ['chat', L('Abfragen', 'Quiz me'), L('Eine Frage nach der anderen', 'One question at a time'), () => inRoom(api => api.ask(L('Frag mich ab – eine Frage nach der anderen, warte jeweils auf meine Antwort und sag mir dann, ob’s sitzt.', 'Quiz me – one question at a time, wait for my answer each time and tell me if it’s right.')))],
        ['mic', L('Sprich mit mir', 'Talk to me'), L('Einfach reden – wie mit einem Tutor', 'Just talk – like with a tutor'), () => import('../app.js').then(m => m.talkToMax())],
        ['bulb', L('Ich erklär dir ein Thema', 'I’ll explain a topic'), L('Kein Skript? Nenn mir einfach das Thema', 'No slides? Just name the topic'), () => import('../app.js').then(m => m.topicPrompt())],
      ], 11));
  }
  draw();
  const offDoc = e => { if (menu && !menu.contains(e.target)) closeMenu(); };
  document.addEventListener('pointerdown', offDoc);
  const off = onChange ? onChange(() => { if (wrap.isConnected) draw(); }) : null;
  return () => { document.removeEventListener('pointerdown', offDoc); closeMenu(); if (typeof off === 'function') off(); };
}
