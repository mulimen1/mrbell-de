// Lernpfad: Kapitel → Lektion (Erklärung + Kontrollfrage) → Anwendungsaufgabe
import { h, ico, toast, esc, modal } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save, track, mastery } from '../state.js';
import { forWhole, outline, forChapter, fullText } from '../retrieve.js';
import { loading, apiError, costBtn, freshen, isGuest, lockedPreview, lockedRest, GUEST_CARDS, GUEST_QUIZ, merkePruefung, siegelOben } from '../ui.js';
import { sanitize } from '../sanitize.js';
import { dlBtn, pathPdf } from '../export.js';
import { renderQuestion, normalize, explainPrompt } from '../quiz.js';
import { L } from '../i18n.js';
import { homeBeta } from '../beta.js';
import { nextUp } from '../nextup.js';
import { pathMaterial, pathPages, pageLabel, carryProgress, srcEditor, busySrc, hasSrc } from '../pathsrc.js';

let pathJob = null;
export function generatePath(doc) {
  if (isGuest()) return Promise.reject(Object.assign(new Error(L('Der Lernpfad gibt’s mit kostenlosem Konto.', 'The study path comes with a free account.')), { code: 'need_account' }));
  if (pathJob && pathJob.id === doc.id) return pathJob.p;
  const all = fullText(doc);
  const material = pathMaterial(doc) || (all.length <= 60000 ? all : outline(doc));
  const NP = pathPages(doc).length, old = doc.path, oldL = doc.lessons;
  const p = ask('path', { material, docName: doc.name }).then(r => {
    const d = r.data || {};
    const chapters = (d.chapters || []).filter(c => c && c.title).map((c, i) => ({
      title: String(c.title), goal: String(c.goal || ''), terms: (c.terms || []).slice(0, 6).map(String),
      pages: Array.isArray(c.pages) ? c.pages.map(n => Math.min(NP, parseInt(n) || 1)) : [1, NP], weight: Math.min(3, Math.max(1, parseInt(c.weight) || 2)),
      done: false, score: null, started: false
    }));
    if (!chapters.length) throw new Error(L('Ich konnte keine Kapitel erkennen. Versuch es nochmal.', 'I couldn’t find any chapters. Please try again.'));
    if (old) doc.lessons = carryProgress(old, oldL, chapters);   // neu eingearbeitet: Fortschritt bleibt
    doc.path = { title: d.title || doc.name, subject: d.subject || '', summary: d.summary || '', chapters, created: Date.now() };
    save(doc);
    import('../lib.js').then(m => m.markMade('pfad', { href: `#/app/${doc.id}/pfad`, name: doc.name })).catch(() => {});
    return doc.path;
  }).finally(() => { pathJob = null; });
  pathJob = { id: doc.id, p };
  return p;
}
export const pathPending = doc => !!(pathJob && pathJob.id === doc.id);

export async function render(root, ctx) {
  const { doc, arg } = ctx;
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  if (arg === 'auto') { history.replaceState(null, '', location.hash.replace(/\/auto$/, '')); if (!doc.path) return waitPath(wrap, ctx, true); }
  if (arg != null && doc.path && doc.path.chapters[+arg]) return chapterView(wrap, ctx, +arg);
  if (!doc.path) {
    if (pathPending(doc)) return waitPath(wrap, ctx);
    return intro(wrap, ctx);
  }
  listView(wrap, ctx);
}

function intro(wrap, ctx) {
  {
    const f = h('div', { class: 'face' });
    wrap.replaceChildren();
    wrap.appendChild(h('div', { class: 'empty' }, f, h('h2', {}, L('Dein Lernpfad', 'Your study path')),
      h('p', {}, L('Ich teile dein Skript in sinnvolle Kapitel – mit kurzen Lektionen, Kontrollfragen und einer Aufgabe auf Klausurniveau.', 'I split your slides into sensible chapters – with short lessons, check questions and an exam-level exercise.')),
      costBtn(L('Lernpfad erstellen', 'Create study path'), 'path', async () => { if (homeBeta()) { const C = await import('../create.js'); if (!(await C.personalise('pfad', ctx.doc))) return; } waitPath(wrap, ctx, true); }, 'btn primary lg')));
    face(f);
  }
}

async function waitPath(wrap, ctx, start) {
  if (isGuest()) return lockedPreview(wrap, { kind: 'pfad', title: L('Dein Lernpfad – mit kostenlosem Konto', 'Your study path – with a free account'), onUnlock: () => waitPath(wrap, ctx, true) });
  const ld = loading(wrap, L('Ich baue deinen Lernpfad …', 'Building your study path …'), L(['Lese das Skript', 'Finde die Kapitel', 'Sortiere nach Lernreihenfolge', 'Gewichte für die Klausur'], ['Reading the slides', 'Finding the chapters', 'Sorting into learning order', 'Weighting for the exam']), 'path');
  try { await ld.race(generatePath(ctx.doc)); ld.stop(); wrap.replaceChildren(); listView(wrap, ctx); freshen(wrap); }
  catch (e) { ld.stop(false); intro(wrap, ctx); apiError(e, () => waitPath(wrap, ctx, true)); }
}

function listView(wrap, ctx) {
  const { doc } = ctx;
  const P = doc.path;
  const nextIdx = P.chapters.findIndex(c => !c.done);
  const doneN = P.chapters.filter(c => c.done).length;
  const pct = Math.round(100 * doneN / Math.max(1, P.chapters.length));
  const sc = P.chapters.filter(c => c.done && c.score != null);
  const avg = sc.length ? Math.round(100 * sc.reduce((a, c) => a + c.score, 0) / sc.length) : null;
  const hot = P.chapters.filter(c => c.weight >= 3).length;
  const nx = nextIdx >= 0 ? P.chapters[nextIdx] : null;
  wrap.replaceChildren(
    h('div', { class: 'vh' },
      h('div', {}, h('div', { class: 'eyebrow' }, P.subject || L('Lernpfad', 'Study path')), h('h2', {}, P.title), P.summary ? h('p', {}, P.summary) : null)),
    h('section', { class: 'lp-hero' },
      h('div', { class: 'lp-hl' },
        h('div', { class: 'lp-big' }, h('b', {}, pct + ' %'), h('small', {}, L('geschafft', 'done'))),
        h('div', { class: 'lp-bar' }, P.chapters.map(c => h('i', { class: c.done ? 'on' : c.started ? 'mid' : '' }))),
        h('div', { class: 'lp-st' }, h('span', {}, h('b', {}, `${doneN}/${P.chapters.length}`), L('Kapitel', 'chapters')), avg != null ? h('span', {}, h('b', {}, avg + ' %'), L('Ø in den Checks', 'avg in checks')) : null, hot ? h('span', {}, h('b', {}, String(hot)), L('klausurrelevant', 'exam-critical')) : null)),
      nx ? h('button', { type: 'button', class: 'lp-go', onclick: () => ctx.go('pfad', String(nextIdx)) }, h('small', {}, doneN ? L('Weiterlernen', 'Keep learning') : L('Los geht’s', 'Let’s go')), h('b', {}, L(`Kapitel ${nextIdx + 1} · `, `Chapter ${nextIdx + 1} · `) + nx.title), h('span', { class: 'lp-goi', html: ico('right') }))
        : h('a', { class: 'lp-go done', href: `#/app/${doc.id}/quiz/exam` }, h('small', {}, L('Alles geschafft', 'All done')), h('b', {}, L('Jetzt Probeklausur schreiben', 'Now take a mock exam')), h('span', { class: 'lp-goi', html: ico('right') }))),
    h('div', { class: 'path' }, P.chapters.map((c, i) => h('div', { class: 'chap' + (c.done ? ' done' : '') + (i === nextIdx ? ' cur' : '') + ' w' + c.weight },
      h('div', { class: 'node' }, c.done ? h('span', { html: ico('check') }) : String(i + 1).padStart(2, '0')),
      h('div', { class: 'body', role: 'button', tabindex: 0, onclick: () => ctx.go('pfad', String(i)), onkeydown: e => { if (e.key === 'Enter') ctx.go('pfad', String(i)); } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' } }, h('h3', {}, c.title),
          h('span', { class: 'weight', title: L('Klausurrelevanz', 'Exam relevance') }, h('small', { class: 'wlab' }, L('Klausur', 'Exam')), [1, 2, 3].map(k => h('i', { class: k <= c.weight ? 'on' : '' })))),
        c.goal ? h('p', {}, c.goal) : null,
        h('div', { class: 'terms' }, h('span', { class: 'eyebrow', style: { alignSelf: 'center' } }, pageLabel(doc, c.pages[0], c.pages[1])), c.terms.slice(0, 4).map(t => h('span', { class: 'tag' }, t)), c.done && c.score != null ? h('span', { class: 'tag', style: { marginLeft: 'auto' } }, Math.round(c.score * 100) + ' %') : null))))),
    homeBeta() ? srcPanel(wrap, ctx) : null,
    h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
      dlBtn(() => [{ label: 'PDF', sub: L('Kapitel, Ziele und deine Lektionen', 'Chapters, goals and your lessons'), ic: 'file', fn: () => pathPdf(ctx.doc) }], { cls: 'btn sm ghost' }),
      h('button', { class: 'btn sm ghost', onclick: async () => { const ok = await modal({ title: L('Lernpfad neu erstellen?', 'Rebuild study path?'), text: L('Dein Fortschritt im Lernpfad wird zurückgesetzt. Quizzes und Karten bleiben.', 'Your study path progress will be reset. Quizzes and flashcards stay.'), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Neu erstellen', 'Rebuild'), value: true, primary: true }] }); if (!ok) return; ctx.doc.path = null; ctx.doc.lessons = {}; save(ctx.doc); waitPath(wrap, ctx, true); } }, h('span', { html: ico('refresh') }), L('Neu erstellen', 'Rebuild'))));
}

// Quellen des Lernpfads: weitere Dateien, Skripte und Themen hinzufügen, Gewichtung ändern – Max arbeitet sie neu ein
function srcPanel(wrap, ctx) {
  const { doc } = ctx;
  const sig = () => JSON.stringify([doc.pathW || 2, (doc.pathSrc || []).map(s => [s.id, s.weight])]);
  const st = { mainName: doc.name, mainW: doc.pathW || 2, src: (doc.pathSrc || []).map(s => Object.assign({}, s)) };
  const base = sig();
  const now = () => JSON.stringify([st.mainW || 2, st.src.map(s => [s.id, s.weight])]);
  const btn = h('button', { class: 'btn primary', type: 'button', hidden: true, onclick: async () => {
    if (busySrc(st)) return toast(L('Moment – die Datei wird noch gelesen.', 'One moment – still reading the file.'));
    const prev = { w: doc.pathW, src: doc.pathSrc };
    doc.pathW = st.mainW; doc.pathSrc = st.src.map(s => { const o = Object.assign({}, s); delete o.loading; return o; }); save(doc);
    const ld = loading(wrap, L('Ich arbeite die neuen Quellen ein …', 'Working in the new sources …'), L(['Lese alle Quellen', 'Führe Überschneidungen zusammen', 'Gewichte nach deinen Vorgaben', 'Dein Fortschritt bleibt'], ['Reading all sources', 'Merging overlaps', 'Weighting as you set it', 'Your progress stays']), 'path');
    try { await ld.race(generatePath(doc)); ld.stop(); wrap.replaceChildren(); listView(wrap, ctx); freshen(wrap); toast(L('Lernpfad aktualisiert.', 'Study path updated.')); }
    catch (e) { ld.stop(false); doc.pathW = prev.w; doc.pathSrc = prev.src; save(doc); listView(wrap, ctx); apiError(e); }
  } }, h('span', { html: ico('refresh') }), L('In den Lernpfad einarbeiten', 'Work into the study path'));
  const ed = srcEditor(st, { exclude: doc.id, onChange: () => { btn.hidden = now() === base; } });
  return h('section', { class: 'ps-panel' },
    h('div', { class: 'ps-head' }, h('div', {}, h('h3', {}, L('Quellen & Gewichtung', 'Sources & weighting')), h('small', {}, L('Weitere Dateien, Skripte oder Themen hinzufügen – Max baut sie sinnvoll in deinen Pfad ein. Dein Fortschritt bleibt.', 'Add more files, slides or topics – Max works them into your path. Your progress stays.'))), btn),
    ed);
}

function chapterView(wrap, ctx, idx) {
  const { doc } = ctx;
  const c = doc.path.chapters[idx];
  const feyn = h('div');
  wrap.replaceChildren(
    h('a', { class: 'btn sm ghost', href: `#/app/${doc.id}/pfad`, style: { marginBottom: '10px' } }, h('span', { html: ico('left') }), L('Lernpfad', 'Study path')),
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, L(`Kapitel ${idx + 1} · `, `Chapter ${idx + 1} · `) + pageLabel(doc, c.pages[0], c.pages[1])), h('h2', {}, c.title), c.goal ? h('p', {}, c.goal) : null)),
    h('div', { class: 'hub' },
      h('button', { class: 'tile big dark', onclick: () => lesson(wrap, ctx, idx) },
        h('div', { class: 'ti', html: ico('board') }), h('h3', {}, doc.lessons[idx] ? (c.done ? L('Lektion wiederholen', 'Repeat lesson') : L('Lektion fortsetzen', 'Continue lesson')) : L('Lektion starten', 'Start lesson')),
        h('p', {}, L('Kurze Erklärungen an der Tafel, nach jedem Schritt eine Kontrollfrage, zum Schluss eine Aufgabe auf Klausurniveau.', 'Short explanations on the whiteboard, a check question after every step and an exam-level exercise at the end.')),
        h('div', { class: 'foot' }, c.done ? L(`Abgeschlossen · ${Math.round((c.score ?? 0) * 100)} %`, `Completed · ${Math.round((c.score ?? 0) * 100)}%`) : (doc.lessons[idx] ? L('Bereit', 'Ready') : L('ca. 5–8 Minuten', 'approx. 5–8 minutes')))),
      h('button', { class: 'tile', onclick: () => ctx.go('quiz', 'k' + idx) }, h('div', { class: 'ti', html: ico('quiz') }), h('h3', {}, L('Quiz zum Kapitel', 'Chapter quiz')), h('p', {}, L('Gemischte Fragetypen nur zu diesem Thema.', 'Mixed question types on just this topic.'))),
      h('button', { class: 'tile', onclick: () => ctx.go('karten', 'k' + idx) }, h('div', { class: 'ti', html: ico('cards') }), h('h3', {}, L('Karteikarten', 'Flashcards')), h('p', {}, L('Begriffe und Formeln dieses Kapitels.', 'Key terms and formulas from this chapter.'))),
      h('button', { class: 'tile', onclick: () => ctx.ask(L(`Erklär mir das Kapitel „${c.title}“ an der Tafel – kurz und mit einem Beispiel.`, `Explain the chapter “${c.title}” on the whiteboard – briefly and with an example.`)) }, h('div', { class: 'ti', html: ico('chat') }), h('h3', {}, L('Frag mich', 'Ask me')), h('p', {}, L('Erklärung an der Tafel, Rückfragen erlaubt.', 'Explained on the whiteboard, follow-up questions welcome.'))),
      h('button', { class: 'tile', onclick: () => feynman(feyn, ctx, idx) }, h('div', { class: 'ti', html: ico('bulb') }), h('h3', {}, L('Erklär’s selbst', 'Explain it yourself')), h('p', {}, L('Feynman-Methode: Du erklärst, Max bewertet.', 'Feynman method: you explain, Max grades.')))),
    feyn,
    c.terms.length ? h('div', { style: { marginTop: '24px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, L('Schlüsselbegriffe', 'Key terms')), h('div', { class: 'terms' }, c.terms.map(t => h('span', { class: 'chip', onclick: () => ctx.ask(L(`Was bedeutet „${t}“? Kurz, mit Beispiel.`, `What does “${t}” mean? Briefly, with an example.`)) }, t)))) : null);
}

async function lesson(wrap, ctx, idx) {
  const { doc } = ctx;
  const c = doc.path.chapters[idx];
  if (!doc.lessons[idx]) {
    const ld = loading(wrap, L('Ich bereite die Lektion vor …', 'Preparing your lesson …'), L(['Lese die Kapitelseiten', 'Zeichne die Tafel', 'Überlege mir Kontrollfragen', 'Baue eine Klausuraufgabe'], ['Reading the chapter pages', 'Drawing the whiteboard', 'Thinking up check questions', 'Building an exam exercise']), 'lesson');
    try {
      const r = await ask('lesson', { material: forChapter(doc, c), docName: doc.name, opts: { chapter: `${c.title} (${hasSrc(doc) ? pageLabel(doc, c.pages[0], c.pages[1]) : L(`Seiten ${c.pages[0]}–${c.pages[1] || c.pages[0]}`, `pages ${c.pages[0]}–${c.pages[1] || c.pages[0]}`)})`, goal: c.goal } }, { signal: ld.signal });
      const les = r.data || {};
      const slides = (les.slides || []).filter(s => s && s.html).map(s => ({ title: String(s.title || ''), html: String(s.html), check: normalize(s.check) }));
      if (!slides.length) throw new Error(L('Die Lektion war leer. Versuch es nochmal.', 'The lesson came back empty. Please try again.'));
      doc.lessons[idx] = { title: les.title || c.title, slides, task: normalize(les.task), pos: 0, score: [] };
      merkePruefung(doc.lessons[idx], r.rechenpruefung);
      c.started = true; save(doc);
    } catch (e) { ld.stop(false); chapterView(wrap, ctx, idx); apiError(e, () => lesson(wrap, ctx, idx)); return; }
    ld.stop();
  }
  const les = doc.lessons[idx];
  siegelOben(wrap, les, () => save(doc));
  if (les.pos >= les.slides.length + (les.task ? 1 : 0)) { les.pos = 0; les.score = []; }
  const steps = les.slides.length + (les.task ? 1 : 0);
  const stage = h('div', { class: 'lesson' });
  wrap.replaceChildren(h('a', { class: 'btn sm ghost', href: `#/app/${doc.id}/pfad/${idx}`, onclick: e => { e.preventDefault(); chapterView(wrap, ctx, idx); }, style: { marginBottom: '10px' } }, h('span', { html: ico('left') }), c.title), stage);

  const step = () => {
    const pos = les.pos;
    const bar = h('div', { class: 'lsteps' }, Array.from({ length: steps }, (_, k) => h('i', { class: k <= pos ? 'on' : '' })));
    if (pos < les.slides.length) {
      const s = les.slides[pos];
      const t = h('div', { class: 'tafel' }, s.title ? h('h2', { class: 'tt' }, s.title) : null); t.appendChild(sanitize(s.html));
      // Überschrift nicht doppelt: steht der Folientitel nochmal als erste Überschrift im Inhalt, fliegt die raus
      { const n = (x => String(x || '').replace(/\s+/g, ' ').trim().toLowerCase()); const fh = t.querySelector(':is(h1,h2,h3,h4):not(.tt)'); if (s.title && fh && n(fh.textContent) === n(s.title)) fh.remove(); }
      const chk = h('div', { class: 'lcheck' });
      const slide = h('div', { class: 'lslide' }, t, chk);
      stage.replaceChildren(bar, slide);
      const next = () => { les.pos++; save(doc); step(); stage.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
      if (s.check) {
        chk.appendChild(h('div', { class: 'eyebrow', style: { marginBottom: '12px' } }, L('Kurz geprüft', 'Quick check')));
        const qr = h('div'); chk.appendChild(qr);
        const r = renderQuestion(qr, s.check, { compact: true, showType: false, onNext: next, nextLabel: pos + 1 < steps ? L('Weiter', 'Next') : L('Abschließen', 'Finish'), onAsk: (q, rr) => ctx.ask(explainPrompt(q, rr, L('Ich habe diese Kontrollfrage falsch beantwortet', 'I got this check question wrong'))) });
        r.result.then(x => { les.score[pos] = x.score; track(x.correct); save(doc); });
      } else {
        chk.appendChild(h('div', { class: 'qactions' }, h('span', { class: 'sp' }), h('button', { class: 'btn primary', onclick: next }, L('Weiter', 'Next'), h('span', { html: ico('right') }))));
      }
    } else if (les.task && pos === les.slides.length) {
      const qr = h('div');
      stage.replaceChildren(bar, h('div', { class: 'eyebrow', style: { margin: '0 0 12px' } }, L('Anwendungsaufgabe · Klausurniveau', 'Applied exercise · exam level')), qr);
      const r = renderQuestion(qr, les.task, { onNext: () => { les.pos++; step(); }, nextLabel: L('Abschließen', 'Finish'), onAsk: (q, rr) => ctx.ask(explainPrompt(q, rr, L('Ich habe diese Anwendungsaufgabe falsch gelöst', 'I got this applied exercise wrong'))) });
      r.result.then(x => { les.score[pos] = x.score * 2; track(x.correct); save(doc); });
    } else {
      // Ende
      const vals = les.score.filter(v => v != null);
      const max = les.slides.filter(s => s.check).length + (les.task ? 2 : 0);
      const sc = max ? Math.min(1, vals.reduce((a, b) => a + b, 0) / max) : 1;
      c.done = true; c.score = Math.max(c.score || 0, sc); save(doc);
      const f = h('div', { class: 'face' });
      const nextIdx = doc.path.chapters.findIndex(x => !x.done);
      const pctL = Math.round(sc * 100), R = 54, CC = 2 * Math.PI * R;
      const ring = h('div', { class: 'qres-ring ' + (pctL >= 80 ? 'top' : pctL >= 50 ? 'mid' : 'low'), html: `<svg viewBox="0 0 128 128" aria-hidden="true"><defs><linearGradient id="qrg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="s1"/><stop offset="1" class="s2"/></linearGradient></defs><circle cx="64" cy="64" r="${R}" fill="none" stroke="#efeae2" stroke-width="12"/><circle class="qres-arc" cx="64" cy="64" r="${R}" fill="none" stroke="url(#qrg)" stroke-width="12" stroke-linecap="round" stroke-dasharray="0 ${CC}" transform="rotate(-90 64 64)"/></svg>` }, h('div', { class: 'qres-v' }, h('b', {}, pctL + ' %'), h('small', {}, L('Kapitel', 'chapter'))));
      setTimeout(() => { const a = ring.querySelector('.qres-arc'); if (a) a.setAttribute('stroke-dasharray', `${CC * pctL / 100} ${CC}`); }, 120);
      const doneN2 = doc.path.chapters.filter(x => x.done).length;
      stage.replaceChildren(h('div', { class: 'qres' }, h('div', { class: 'qres-card' },
        h('div', { class: 'qres-l' }, ring, h('div', { class: 'qres-face' }, f)),
        h('div', { class: 'qres-r' },
          h('div', { class: 'eyebrow' }, L(`Kapitel geschafft · ${doneN2} von ${doc.path.chapters.length}`, `Chapter done · ${doneN2} of ${doc.path.chapters.length}`)),
          h('h2', {}, sc >= .8 ? L('Stark – das Kapitel sitzt.', 'Strong – you’ve nailed this chapter.') : sc >= .5 ? L('Gut! Die Lücken holst du dir mit Karten.', 'Good! Close the gaps with flashcards.') : L('Noch wackelig – Max erklärt dir die Stellen.', 'Still shaky – let Max explain the tricky bits.')),
          h('div', { class: 'qres-act' },
            nextIdx >= 0 ? h('button', { class: 'btn primary qres-main', onclick: () => ctx.go('pfad', String(nextIdx)) }, L(`Weiter: Kapitel ${nextIdx + 1}`, `Next: chapter ${nextIdx + 1}`), h('span', { html: ico('right') })) : h('a', { class: 'btn primary qres-main', href: `#/app/${doc.id}/quiz/exam` }, L('Probeklausur schreiben', 'Take a mock exam')),
            h('button', { class: 'btn', onclick: () => ctx.go('karten', 'k' + idx) }, L('Karteikarten dazu', 'Flashcards on this')),
            sc < .8 ? h('button', { class: 'btn', onclick: () => ctx.ask(L(`Erklär mir die schwierigsten Stellen aus „${c.title}“ an der Tafel – kurz, mit Beispiel.`, `Explain the hardest parts of “${c.title}” on the board – briefly, with an example.`)) }, L('Max erklärt’s', 'Max explains')) : null,
            h('button', { class: 'btn ghost', onclick: () => { les.pos = 0; les.score = []; step(); } }, L('Nochmal', 'Again'))))),
        nextUp(ctx, 'pfad', { max: 3 })));
      const fc = face(f); setTimeout(() => fc.set(sc >= .5 ? 'happy' : 'idle'), 200);
    }
  };
  step();
}

function feynman(box, ctx, idx) {
  const { doc } = ctx; const c = doc.path.chapters[idx];
  const ta = h('textarea', { class: 'field', rows: 6, placeholder: L(`Erklär „${c.title}“ so, als würdest du es einem Erstsemester beibringen …`, `Explain “${c.title}” as if you were teaching it to a first-year student …`) });
  const out = h('div');
  const btn = costBtn(L('Bewerten lassen', 'Get it graded'), 'grade', async () => {
    if (ta.value.trim().length < 40) { toast(L('Schreib ein paar Sätze mehr – mindestens 2–3.', 'Write a few more sentences – at least 2–3.')); return; }
    btn.disabled = true; out.replaceChildren(h('div', { class: 'loading', style: { padding: '30px' } }, h('span', { class: 'spinner' }), L('Ich lese deine Erklärung …', 'Reading your explanation …')));
    try {
      const r = await ask('grade', { material: forChapter(doc, c), docName: doc.name, opts: { question: c.title + (c.goal ? ' – ' + c.goal : ''), answer: ta.value } });
      const g = r.data || {};
      const list = (t, arr) => arr && arr.length ? h('div', { style: { marginTop: '12px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '6px' } }, t), h('ul', { style: { margin: 0, paddingLeft: '20px' } }, arr.map(x => h('li', {}, x)))) : null;
      out.replaceChildren(h('div', { class: 'feedback' + ((g.score || 0) >= 60 ? '' : ' bad') }, h('div', { class: 'verdict' }, h('span', { class: 'badge' }, String(Math.round(g.score || 0))), L('von 100 Punkten', 'out of 100 points')),
        list(L('Gut', 'Good'), g.good), list(L('Fehlt noch', 'Still missing'), g.missing), list(L('Korrigieren', 'Fix this'), g.wrong), g.tip ? h('p', {}, h('b', {}, L('Nächster Schritt: ', 'Next step: ')), g.tip) : null));
    } catch (e) { out.replaceChildren(); apiError(e); }
    btn.disabled = false;
  });
  box.replaceChildren(h('div', { class: 'setup', style: { marginTop: '18px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, L('Erklär’s in eigenen Worten', 'Explain it in your own words')), ta, h('div', { class: 'qactions' }, h('span', { class: 'sp' }), btn), out));
  ta.focus();
}
