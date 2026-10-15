// Übersicht eines Skripts: Pinnwand mit allen Lernwegen
import { h, ico, ago, ls, modal } from '../util.js';
import { face } from '../face.js';
import { mastery, save } from '../state.js';
import { generatePath, pathPending } from './path.js';
import { apiError } from '../ui.js';
import { dueCards } from './cards.js';

export async function render(root, ctx) {
  const { doc, arg } = ctx;
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  const m = mastery(doc);
  const P = doc.path;
  const nextIdx = P ? P.chapters.findIndex(c => !c.done) : -1;
  const due = dueCards(doc).length;
  const lastQuiz = doc.quizzes[doc.quizzes.length - 1];
  const best = lastQuiz && lastQuiz.results?.length ? Math.round(100 * Math.max(...lastQuiz.results.map(r => r.score))) : null;

  // Schnellfrage an den Tutor
  const f = h('div', { class: 'face', style: { width: '64px', height: '64px' } });
  const inp = h('input', { class: 'field', placeholder: 'Frag Max etwas zu deinem Skript …', style: { background: 'transparent', color: 'inherit', borderColor: 'color-mix(in srgb, var(--onInv) 30%, transparent)' } });
  const quick = h('form', { style: { display: 'flex', gap: '8px', marginTop: 'auto' }, onsubmit: e => { e.preventDefault(); const t = inp.value.trim(); if (t) ctx.ask(t); else ctx.go('tutor'); } },
    inp, h('button', { class: 'send', style: { background: 'var(--onInv)', color: 'var(--inv)' }, 'aria-label': 'Fragen', html: ico('send') }));
  quick.addEventListener('click', e => e.stopPropagation());

  const pathTile = h('button', { class: 'tile half', onclick: () => ctx.go('pfad', nextIdx >= 0 ? String(nextIdx) : null) });
  const fillPath = () => {
    const P = doc.path;
    pathTile.replaceChildren(h('div', { class: 'ti', html: ico('path') }),
      h('h3', {}, P ? (nextIdx >= 0 ? `Weiter: ${P.chapters[nextIdx].title}` : 'Lernpfad geschafft') : 'Lernpfad'),
      h('p', {}, P ? `${P.chapters.filter(c => c.done).length} von ${P.chapters.length} Kapiteln` : pathPending(doc) ? 'Wird gerade erstellt …' : 'Kapitel, Lektionen und Aufgaben aus deinem Skript.'),
      h('div', { class: 'foot' }, P ? h('span', { class: 'weight' }, P.chapters.map(c => h('i', { class: c.done ? 'on' : '' }))) : pathPending(doc) ? h('span', { class: 'spinner' }) : 'Erstellen · 2 Einheiten'));
  };
  fillPath();

  wrap.append(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, `${doc.pages.length} Seiten · hinzugefügt ${ago(doc.created)}`), h('h2', {}, doc.path?.title || doc.name), doc.path?.summary ? h('p', {}, doc.path.summary) : null)),
    h('div', { class: 'hub' },
      h('div', { class: 'tile big dark', role: 'button', tabindex: 0, onclick: () => ctx.go('tutor') },
        h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center' } }, f, h('div', {}, h('h3', { style: { fontSize: '22px' } }, 'Frag deinen BWL Max'), h('p', {}, 'Kennt dein Skript, erklärt an der Tafel. Ein bisschen arrogant. Aber er hat recht.'))),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '14px 0' } },
          ['Fass das Skript in 5 Punkten zusammen', 'Was ist am wichtigsten für die Klausur?', 'Erklär mir das schwierigste Thema'].map(t => h('button', { class: 'chip', style: { background: 'transparent', color: 'inherit', borderColor: 'color-mix(in srgb, var(--onInv) 30%, transparent)' }, onclick: e => { e.stopPropagation(); ctx.ask(t); } }, t))),
        quick),
      h('div', { class: 'tile', role: 'button', tabindex: 0, onclick: () => ctx.go('pfad') },
        h('div', { class: 'ring', style: { '--p': m } }, h('div', {}, m + '%')),
        h('h3', { style: { marginTop: '8px' } }, 'Lernstand'), h('p', {}, m >= 80 ? 'Klausurbereit – halte es frisch.' : m >= 40 ? 'Auf gutem Weg.' : 'Gerade erst angefangen.')),
      h('button', { class: 'tile', onclick: () => ctx.go('karten') }, h('div', { class: 'ti', html: ico('cards') }), h('h3', {}, 'Karteikarten'),
        h('p', {}, due ? `${due} Karten fällig` : doc.decks.length ? 'Heute alles wiederholt.' : 'Automatisch aus dem Skript.'), h('div', { class: 'foot' }, due ? 'Jetzt wiederholen' : 'Kostenlos wiederholen')),
      pathTile,
      h('button', { class: 'tile half', onclick: () => ctx.go('quiz') }, h('div', { class: 'ti', html: ico('quiz') }), h('h3', {}, 'Quiz & Probeklausur'),
        h('p', {}, best != null ? `Letztes Quiz: ${best} %` : '6 Fragetypen – wie in der Klausur.'), h('div', { class: 'foot' }, doc.mistakes.length ? `${doc.mistakes.length} Fehler zum Wiederholen` : 'Neues Quiz · 2 Einheiten')),
      h('button', { class: 'tile', onclick: () => ctx.go('podcast') }, h('div', { class: 'ti', html: ico('pod') }), h('h3', {}, 'Podcast'), h('p', {}, doc.podcasts.length ? `${doc.podcasts.length} Folge(n)` : 'Dein Skript zum Anhören.')),
      h('button', { class: 'tile', onclick: () => ctx.go('zettel') }, h('div', { class: 'ti', html: ico('note') }), h('h3', {}, 'Lernzettel'), h('p', {}, doc.summary ? 'Zusammenfassung + Mindmap' : 'Alles Wichtige auf einer Seite.')),
      h('a', { class: 'tile', href: '#/app/trainer' }, h('div', { class: 'ti', html: ico('calc') }), h('h3', {}, 'BWL-Trainer'), h('p', {}, 'Buchungssätze, Break-even, Kapitalwert & mehr – unbegrenzt.'))));
  face(f, {});

  // Direkt nach dem Upload: Lernpfad im Hintergrund bauen
  if (arg === 'neu' && !doc.path && !pathPending(doc) && !doc.autoPathTried) {
    doc.autoPathTried = true; save(doc);
    history.replaceState(null, '', `#/app/${doc.id}/hub`);
    const p = generatePath(doc); fillPath();
    p.then(() => { if (pathTile.isConnected) { ctx.go('hub'); } }).catch(e => { fillPath(); if (e.code === 'limit') apiError(e); });
  }
}
