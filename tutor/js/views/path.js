// Lernpfad: Kapitel → Lektion (Erklärung + Kontrollfrage) → Anwendungsaufgabe
import { h, ico, toast, esc, modal } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save, track, mastery } from '../state.js';
import { forWhole, outline, forChapter, fullText } from '../retrieve.js';
import { loading, apiError, costBtn } from '../ui.js';
import { sanitize } from '../sanitize.js';
import { renderQuestion, normalize, explainPrompt } from '../quiz.js';

let pathJob = null;
export function generatePath(doc) {
  if (pathJob && pathJob.id === doc.id) return pathJob.p;
  const all = fullText(doc);
  const material = all.length <= 60000 ? all : outline(doc);
  const p = ask('path', { material, docName: doc.name }).then(r => {
    const d = r.data || {};
    const chapters = (d.chapters || []).filter(c => c && c.title).map((c, i) => ({
      title: String(c.title), goal: String(c.goal || ''), terms: (c.terms || []).slice(0, 6).map(String),
      pages: Array.isArray(c.pages) ? c.pages.map(n => parseInt(n) || 1) : [1, doc.pages.length], weight: Math.min(3, Math.max(1, parseInt(c.weight) || 2)),
      done: false, score: null, started: false
    }));
    if (!chapters.length) throw new Error('Ich konnte keine Kapitel erkennen. Versuch es nochmal.');
    doc.path = { title: d.title || doc.name, subject: d.subject || '', summary: d.summary || '', chapters, created: Date.now() };
    save(doc);
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
    wrap.appendChild(h('div', { class: 'empty' }, f, h('h2', {}, 'Dein Lernpfad'),
      h('p', {}, 'Ich teile dein Skript in sinnvolle Kapitel – mit kurzen Lektionen, Kontrollfragen und einer Aufgabe auf Klausurniveau.'),
      costBtn('Lernpfad erstellen', 'path', () => waitPath(wrap, ctx, true), 'btn primary lg')));
    face(f);
  }
}

async function waitPath(wrap, ctx, start) {
  const ld = loading(wrap, 'Ich baue deinen Lernpfad …', ['Lese das Skript', 'Finde die Kapitel', 'Sortiere nach Lernreihenfolge', 'Gewichte für die Klausur']);
  try { await generatePath(ctx.doc); ld.stop(); wrap.replaceChildren(); listView(wrap, ctx); }
  catch (e) { ld.stop(); intro(wrap, ctx); apiError(e, () => waitPath(wrap, ctx, true)); }
}

function listView(wrap, ctx) {
  const { doc } = ctx;
  const P = doc.path;
  const nextIdx = P.chapters.findIndex(c => !c.done);
  const doneN = P.chapters.filter(c => c.done).length;
  wrap.replaceChildren(
    h('div', { class: 'vh' },
      h('div', {}, h('div', { class: 'eyebrow' }, (P.subject || 'Lernpfad') + ` · ${doneN} / ${P.chapters.length} Kapitel`), h('h2', {}, P.title), P.summary ? h('p', {}, P.summary) : null),
      nextIdx >= 0 ? h('button', { class: 'btn primary', onclick: () => ctx.go('pfad', String(nextIdx)) }, doneN ? 'Weiterlernen' : 'Mit Kapitel 1 starten', h('span', { html: ico('right') })) : h('span', { class: 'tag' }, 'Alles geschafft')),
    h('div', { class: 'path' }, P.chapters.map((c, i) => h('div', { class: 'chap' + (c.done ? ' done' : '') + (i === nextIdx ? ' cur' : '') },
      h('div', { class: 'node' }, c.done ? h('span', { html: ico('check') }) : String(i + 1).padStart(2, '0')),
      h('div', { class: 'body', role: 'button', tabindex: 0, onclick: () => ctx.go('pfad', String(i)), onkeydown: e => { if (e.key === 'Enter') ctx.go('pfad', String(i)); } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' } }, h('h3', {}, c.title),
          h('span', { class: 'weight', title: 'Klausurrelevanz' }, [1, 2, 3].map(k => h('i', { class: k <= c.weight ? 'on' : '' })))),
        c.goal ? h('p', {}, c.goal) : null,
        h('div', { class: 'terms' }, h('span', { class: 'eyebrow', style: { alignSelf: 'center' } }, `S. ${c.pages[0]}–${c.pages[1] || c.pages[0]}`), c.terms.slice(0, 4).map(t => h('span', { class: 'tag' }, t)), c.done && c.score != null ? h('span', { class: 'tag', style: { marginLeft: 'auto' } }, Math.round(c.score * 100) + ' %') : null))))),
    h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
      h('button', { class: 'btn sm ghost', onclick: async () => { const ok = await modal({ title: 'Lernpfad neu erstellen?', text: 'Dein Fortschritt im Lernpfad wird zurückgesetzt. Quizze und Karten bleiben.', actions: [{ label: 'Abbrechen', value: false }, { label: 'Neu erstellen', value: true, primary: true }] }); if (!ok) return; ctx.doc.path = null; ctx.doc.lessons = {}; save(ctx.doc); waitPath(wrap, ctx, true); } }, h('span', { html: ico('refresh') }), 'Neu erstellen')));
}

function chapterView(wrap, ctx, idx) {
  const { doc } = ctx;
  const c = doc.path.chapters[idx];
  const feyn = h('div');
  wrap.replaceChildren(
    h('a', { class: 'btn sm ghost', href: `#/app/${doc.id}/pfad`, style: { marginBottom: '10px' } }, h('span', { html: ico('left') }), 'Lernpfad'),
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, `Kapitel ${idx + 1} · S. ${c.pages[0]}–${c.pages[1] || c.pages[0]}`), h('h2', {}, c.title), c.goal ? h('p', {}, c.goal) : null)),
    h('div', { class: 'hub' },
      h('button', { class: 'tile big dark', onclick: () => lesson(wrap, ctx, idx) },
        h('div', { class: 'ti', html: ico('board') }), h('h3', {}, doc.lessons[idx] ? (c.done ? 'Lektion wiederholen' : 'Lektion fortsetzen') : 'Lektion starten'),
        h('p', {}, 'Kurze Erklärungen an der Tafel, nach jedem Schritt eine Kontrollfrage, zum Schluss eine Aufgabe auf Klausurniveau.'),
        h('div', { class: 'foot' }, c.done ? `Abgeschlossen · ${Math.round((c.score ?? 0) * 100)} %` : (doc.lessons[idx] ? 'Bereit' : 'ca. 5–8 Minuten'))),
      h('button', { class: 'tile', onclick: () => ctx.go('quiz', 'k' + idx) }, h('div', { class: 'ti', html: ico('quiz') }), h('h3', {}, 'Quiz zum Kapitel'), h('p', {}, 'Gemischte Fragetypen nur zu diesem Thema.')),
      h('button', { class: 'tile', onclick: () => ctx.go('karten', 'k' + idx) }, h('div', { class: 'ti', html: ico('cards') }), h('h3', {}, 'Karteikarten'), h('p', {}, 'Begriffe und Formeln dieses Kapitels.')),
      h('button', { class: 'tile', onclick: () => ctx.ask(`Erklär mir das Kapitel „${c.title}“ an der Tafel – kurz und mit einem Beispiel.`) }, h('div', { class: 'ti', html: ico('chat') }), h('h3', {}, 'Max fragen'), h('p', {}, 'Erklärung an der Tafel, Rückfragen erlaubt.')),
      h('button', { class: 'tile', onclick: () => feynman(feyn, ctx, idx) }, h('div', { class: 'ti', html: ico('bulb') }), h('h3', {}, 'Erklär’s selbst'), h('p', {}, 'Feynman-Methode: Du erklärst, Max bewertet.'))),
    feyn,
    c.terms.length ? h('div', { style: { marginTop: '24px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Schlüsselbegriffe'), h('div', { class: 'terms' }, c.terms.map(t => h('span', { class: 'chip', onclick: () => ctx.ask(`Was bedeutet „${t}“? Kurz, mit Beispiel.`) }, t)))) : null);
}

async function lesson(wrap, ctx, idx) {
  const { doc } = ctx;
  const c = doc.path.chapters[idx];
  if (!doc.lessons[idx]) {
    const ld = loading(wrap, 'Ich bereite die Lektion vor …', ['Lese die Kapitelseiten', 'Zeichne die Tafel', 'Überlege mir Kontrollfragen', 'Baue eine Klausuraufgabe']);
    try {
      const r = await ask('lesson', { material: forChapter(doc, c), docName: doc.name, opts: { chapter: `${c.title} (Seiten ${c.pages[0]}–${c.pages[1] || c.pages[0]})`, goal: c.goal } });
      const L = r.data || {};
      const slides = (L.slides || []).filter(s => s && s.html).map(s => ({ title: String(s.title || ''), html: String(s.html), check: normalize(s.check) }));
      if (!slides.length) throw new Error('Die Lektion war leer. Versuch es nochmal.');
      doc.lessons[idx] = { title: L.title || c.title, slides, task: normalize(L.task), pos: 0, score: [] };
      c.started = true; save(doc);
    } catch (e) { ld.stop(); chapterView(wrap, ctx, idx); apiError(e, () => lesson(wrap, ctx, idx)); return; }
    ld.stop();
  }
  const L = doc.lessons[idx];
  if (L.pos >= L.slides.length + (L.task ? 1 : 0)) { L.pos = 0; L.score = []; }
  const steps = L.slides.length + (L.task ? 1 : 0);
  const stage = h('div', { class: 'lesson' });
  wrap.replaceChildren(h('a', { class: 'btn sm ghost', href: `#/app/${doc.id}/pfad/${idx}`, onclick: e => { e.preventDefault(); chapterView(wrap, ctx, idx); }, style: { marginBottom: '10px' } }, h('span', { html: ico('left') }), c.title), stage);

  const step = () => {
    const pos = L.pos;
    const bar = h('div', { class: 'lsteps' }, Array.from({ length: steps }, (_, k) => h('i', { class: k <= pos ? 'on' : '' })));
    if (pos < L.slides.length) {
      const s = L.slides[pos];
      const t = h('div', { class: 'tafel' }, s.title ? h('h2', { class: 'tt' }, s.title) : null); t.appendChild(sanitize(s.html));
      const chk = h('div', { class: 'lcheck' });
      const slide = h('div', { class: 'lslide' }, t, chk);
      stage.replaceChildren(bar, slide);
      const next = () => { L.pos++; save(doc); step(); stage.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
      if (s.check) {
        chk.appendChild(h('div', { class: 'eyebrow', style: { marginBottom: '12px' } }, 'Kurz geprüft'));
        const qr = h('div'); chk.appendChild(qr);
        const r = renderQuestion(qr, s.check, { compact: true, showType: false, onNext: next, nextLabel: pos + 1 < steps ? 'Weiter' : 'Abschließen', onAsk: (q, rr) => ctx.ask(explainPrompt(q, rr, 'Ich habe diese Kontrollfrage falsch beantwortet')) });
        r.result.then(x => { L.score[pos] = x.score; track(x.correct); save(doc); });
      } else {
        chk.appendChild(h('div', { class: 'qactions' }, h('span', { class: 'sp' }), h('button', { class: 'btn primary', onclick: next }, 'Weiter', h('span', { html: ico('right') }))));
      }
    } else if (L.task && pos === L.slides.length) {
      const qr = h('div');
      stage.replaceChildren(bar, h('div', { class: 'eyebrow', style: { margin: '0 0 12px' } }, 'Anwendungsaufgabe · Klausurniveau'), qr);
      const r = renderQuestion(qr, L.task, { onNext: () => { L.pos++; step(); }, nextLabel: 'Abschließen', onAsk: (q, rr) => ctx.ask(explainPrompt(q, rr, 'Ich habe diese Anwendungsaufgabe falsch gelöst')) });
      r.result.then(x => { L.score[pos] = x.score * 2; track(x.correct); save(doc); });
    } else {
      // Ende
      const vals = L.score.filter(v => v != null);
      const max = L.slides.filter(s => s.check).length + (L.task ? 2 : 0);
      const sc = max ? Math.min(1, vals.reduce((a, b) => a + b, 0) / max) : 1;
      c.done = true; c.score = Math.max(c.score || 0, sc); save(doc);
      const f = h('div', { class: 'face' });
      const nextIdx = doc.path.chapters.findIndex(x => !x.done);
      stage.replaceChildren(h('div', { class: 'result-hero' }, f, h('div', { class: 'score' }, Math.round(sc * 100) + ' %'), h('p', { style: { color: 'var(--mute)' } }, sc >= .8 ? 'Stark – das Kapitel sitzt.' : sc >= .5 ? 'Gut! Wiederhol die Fehler mit Karteikarten.' : 'Noch wackelig – lass dir die Stellen von Max erklären.'),
        h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '18px' } },
          nextIdx >= 0 ? h('button', { class: 'btn primary', onclick: () => ctx.go('pfad', String(nextIdx)) }, 'Nächstes Kapitel', h('span', { html: ico('right') })) : h('a', { class: 'btn primary', href: `#/app/${doc.id}/quiz` }, 'Probeklausur schreiben'),
          h('button', { class: 'btn', onclick: () => ctx.go('karten', 'k' + idx) }, 'Karteikarten dazu'),
          h('button', { class: 'btn ghost', onclick: () => { L.pos = 0; L.score = []; step(); } }, 'Nochmal'))));
      const fc = face(f); setTimeout(() => fc.set(sc >= .5 ? 'happy' : 'idle'), 200);
    }
  };
  step();
}

function feynman(box, ctx, idx) {
  const { doc } = ctx; const c = doc.path.chapters[idx];
  const ta = h('textarea', { class: 'field', rows: 6, placeholder: `Erklär „${c.title}“ so, als würdest du es einem Erstsemester beibringen …` });
  const out = h('div');
  const btn = costBtn('Bewerten lassen', 'grade', async () => {
    if (ta.value.trim().length < 40) { toast('Schreib ein paar Sätze mehr – mindestens 2–3.'); return; }
    btn.disabled = true; out.replaceChildren(h('div', { class: 'loading', style: { padding: '30px' } }, h('span', { class: 'spinner' }), 'Ich lese deine Erklärung …'));
    try {
      const r = await ask('grade', { material: forChapter(doc, c), docName: doc.name, opts: { question: c.title + (c.goal ? ' – ' + c.goal : ''), answer: ta.value } });
      const g = r.data || {};
      const list = (t, arr) => arr && arr.length ? h('div', { style: { marginTop: '12px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '6px' } }, t), h('ul', { style: { margin: 0, paddingLeft: '20px' } }, arr.map(x => h('li', {}, x)))) : null;
      out.replaceChildren(h('div', { class: 'feedback' + ((g.score || 0) >= 60 ? '' : ' bad') }, h('div', { class: 'verdict' }, h('span', { class: 'badge' }, String(Math.round(g.score || 0))), 'von 100 Punkten'),
        list('Gut', g.good), list('Fehlt noch', g.missing), list('Korrigieren', g.wrong), g.tip ? h('p', {}, h('b', {}, 'Nächster Schritt: '), g.tip) : null));
    } catch (e) { out.replaceChildren(); apiError(e); }
    btn.disabled = false;
  });
  box.replaceChildren(h('div', { class: 'setup', style: { marginTop: '18px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Erklär’s in eigenen Worten'), ta, h('div', { class: 'qactions' }, h('span', { class: 'sp' }), btn), out));
  ta.focus();
}
