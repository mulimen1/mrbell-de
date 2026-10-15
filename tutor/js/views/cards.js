// Karteikarten mit Spaced Repetition (vereinfachtes SM-2). Wiederholen kostet keine KI.
import { h, ico, uid, toast, modal, shuffle } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save } from '../state.js';
import { forWhole, forChapter } from '../retrieve.js';
import { loading, apiError, costBtn } from '../ui.js';
import { richText } from '../sanitize.js';

const DAY = 864e5;
export function dueCards(doc, now = Date.now()) { return doc.decks.flatMap(d => d.cards.map(c => ({ c, d }))).filter(x => (x.c.due || 0) <= now); }

function schedule(c, r) {
  const now = Date.now();
  c.ease = c.ease || 2.5; c.reps = c.reps || 0; c.ivl = c.ivl || 0;
  if (r === 1) { c.lapses = (c.lapses || 0) + 1; c.ease = Math.max(1.3, c.ease - .2); c.ivl = 0; c.due = now + 60e3; c.reps = 0; return 'in 1 Min.'; }
  if (r === 2) { c.ease = Math.max(1.3, c.ease - .15); c.ivl = c.ivl ? Math.max(1, c.ivl * 1.2) : 0; c.due = c.ivl ? now + c.ivl * DAY : now + 6e5; }
  if (r === 3) { c.ivl = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.ivl * c.ease); c.due = now + c.ivl * DAY; }
  if (r === 4) { c.ease += .15; c.ivl = c.reps === 0 ? 4 : Math.round(c.ivl * c.ease * 1.3); c.due = now + c.ivl * DAY; }
  c.reps++;
  return label(c.ivl, c.due);
}
function preview(c, r) { const x = JSON.parse(JSON.stringify(c)); return schedule(x, r); }
function label(ivl, due) { if (!ivl) { const m = Math.round((due - Date.now()) / 6e4); return m < 60 ? `in ${Math.max(1, m)} Min.` : 'heute'; } return ivl === 1 ? 'morgen' : ivl < 30 ? `in ${Math.round(ivl)} T.` : `in ${Math.round(ivl / 30)} Mon.`; }

export async function render(root, ctx) {
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  const chIdx = ctx.arg && ctx.arg.startsWith('k') ? parseInt(ctx.arg.slice(1)) : null;
  if (chIdx != null && ctx.doc.path?.chapters[chIdx]) {
    const exists = ctx.doc.decks.find(d => d.chapter === chIdx);
    if (exists) return study(wrap, ctx, exists.cards.map(c => ({ c, d: exists })), exists.title);
    return generate(wrap, ctx, chIdx);
  }
  overview(wrap, ctx);
}

function overview(wrap, ctx) {
  const { doc } = ctx;
  const due = dueCards(doc);
  const total = doc.decks.reduce((a, d) => a + d.cards.length, 0);
  const f = h('div', { class: 'face', style: { width: '74px', height: '74px', margin: '0 auto 10px' } });
  wrap.replaceChildren(
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Karteikarten'), h('h2', {}, total ? `${due.length} fällig` : 'Karteikarten'), h('p', {}, total ? `${total} Karten in ${doc.decks.length} Stapel(n). Wiederholen kostet keine Einheiten.` : 'Aus deinem Skript – mit Wiederholung genau dann, wenn du’s fast vergisst.')),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        due.length ? h('button', { class: 'btn primary', onclick: () => study(wrap, ctx, due, 'Fällige Karten') }, h('span', { html: ico('play') }), `${due.length} wiederholen`) : null,
        costBtn('Neue Karten erstellen', 'cards', () => generate(wrap, ctx, null), due.length ? 'btn' : 'btn primary'))),
    total ? null : h('div', { class: 'empty', style: { paddingTop: '30px' } }, f, h('p', {}, 'Noch keine Karten. Ich erstelle dir 16 Karten aus dem ganzen Skript – oder wähle im Lernpfad ein Kapitel.')),
    doc.decks.length ? h('div', { class: 'list' }, [...doc.decks].reverse().map(d => {
      const dd = d.cards.filter(c => (c.due || 0) <= Date.now()).length;
      const known = d.cards.filter(c => (c.ivl || 0) >= 3).length;
      return h('div', { class: 'li', onclick: () => study(wrap, ctx, d.cards.map(c => ({ c, d })), d.title) },
        h('span', { html: ico('cards') }),
        h('div', { class: 'gr' }, h('b', {}, d.title), h('span', {}, `${d.cards.length} Karten · ${known} sicher · ${dd} fällig`)),
        h('button', { class: 'iconbtn', title: 'Für Anki exportieren', html: ico('download'), onclick: e => { e.stopPropagation(); exportAnki(d); } }),
        h('button', { class: 'iconbtn', title: 'Löschen', html: ico('trash'), onclick: async e => { e.stopPropagation(); const ok = await modal({ title: 'Stapel löschen?', text: d.title, actions: [{ label: 'Abbrechen', value: false }, { label: 'Löschen', value: true, primary: true }] }); if (ok) { doc.decks = doc.decks.filter(x => x !== d); save(doc); overview(wrap, ctx); } } }));
    })) : null,
    h('div', { style: { marginTop: '18px' } }, h('button', { class: 'btn sm ghost', onclick: () => addOwn(wrap, ctx) }, h('span', { html: ico('plus') }), 'Eigene Karte')));
  if (!total) face(f);
}

async function generate(wrap, ctx, chIdx) {
  const { doc } = ctx;
  const ch = chIdx != null ? doc.path.chapters[chIdx] : null;
  const ld = loading(wrap, 'Ich schreibe deine Karteikarten …', ['Suche Begriffe und Formeln', 'Formuliere präzise Fragen', 'Halte die Antworten kurz']);
  try {
    const r = await ask('cards', { material: ch ? forChapter(doc, ch) : forWhole(doc), docName: doc.name, opts: { count: ch ? 12 : 16, focus: ch ? `Kapitel „${ch.title}“ (S. ${ch.pages[0]}–${ch.pages[1]})` : '' } });
    const cards = (r.data?.cards || []).filter(c => c && c.front && c.back).map(c => ({ id: uid(), front: String(c.front), back: String(c.back), page: c.page || null, due: 0 }));
    if (!cards.length) throw new Error('Es kamen keine Karten zurück. Versuch es nochmal.');
    const deck = { id: uid(), title: ch ? ch.title : (r.data.title || 'Ganzes Skript'), chapter: chIdx, cards, created: Date.now() };
    doc.decks.push(deck); save(doc);
    ld.stop();
    study(wrap, ctx, cards.map(c => ({ c, d: deck })), deck.title);
  } catch (e) { ld.stop(); overview(wrap, ctx); apiError(e, () => generate(wrap, ctx, chIdx)); }
}

function study(wrap, ctx, items, title) {
  const { doc } = ctx;
  let queue = shuffle(items).sort((a, b) => (a.c.due || 0) - (b.c.due || 0)).slice(0, 40);
  let i = 0, flipped = false, done = 0, again = 0;
  const stage = h('div', { class: 'fc-stage' });
  wrap.replaceChildren(h('button', { class: 'btn sm ghost', onclick: () => { cleanup(); overview(wrap, ctx); }, style: { marginBottom: '10px' } }, h('span', { html: ico('left') }), 'Karteikarten'),
    h('div', { class: 'vh', style: { marginBottom: '6px' } }, h('div', {}, h('div', { class: 'eyebrow' }, 'Leertaste = umdrehen · 1–4 = bewerten'), h('h2', { style: { fontSize: '24px' } }, title))), stage);
  const draw = () => {
    if (i >= queue.length) {
      const f = h('div', { class: 'face' });
      stage.replaceChildren(h('div', { class: 'result-hero' }, f, h('div', { class: 'score' }, done), h('p', { style: { color: 'var(--mute)' } }, `Karten wiederholt${again ? ` · ${again}× nochmal` : ''}. Die nächsten kommen, wenn du sie fast vergessen hast.`),
        h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' } }, h('button', { class: 'btn primary', onclick: () => { cleanup(); overview(wrap, ctx); } }, 'Fertig'), h('button', { class: 'btn', onclick: () => ctx.go('quiz') }, 'Quiz machen'))));
      const fc = face(f); setTimeout(() => fc.set('happy'), 150);
      return;
    }
    const { c } = queue[i];
    flipped = false;
    const card = h('div', { class: 'fc', tabindex: 0, role: 'button', 'aria-label': 'Karte umdrehen' },
      h('div', { class: 'in' },
        h('div', { class: 'f' }, richText(c.front), h('span', { class: 'hint' }, 'Tippen zum Umdrehen'), c.page ? h('span', { class: 'pg' }, 'S. ' + c.page) : null),
        h('div', { class: 'b' }, richText(c.back))));
    const rate = h('div', { class: 'rate', style: { visibility: 'hidden' } }, [[1, 'Nochmal'], [2, 'Schwer'], [3, 'Gut'], [4, 'Leicht']].map(([r, l]) =>
      h('button', { class: 'btn' + (r === 3 ? ' primary' : ''), onclick: () => grade(r) }, l, h('small', {}, preview(c, r)))));
    const flip = () => { flipped = !flipped; card.classList.toggle('flipped', flipped); if (flipped) rate.style.visibility = 'visible'; };
    card.addEventListener('click', flip);
    stage.replaceChildren(card, rate, h('div', { class: 'deckstats' }, h('span', {}, `${i + 1} / ${queue.length}`), h('span', {}, '·'), h('span', {}, `${done} erledigt`)));
  };
  const grade = r => {
    const it = queue[i];
    schedule(it.c, r);
    if (r === 1) { again++; queue.splice(Math.min(queue.length, i + 4), 0, it); }
    else done++;
    i++; save(doc); draw();
  };
  const onKey = e => {
    if (!stage.isConnected) return cleanup();
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') { e.preventDefault(); stage.querySelector('.fc')?.click(); }
    else if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade(+e.key);
  };
  const cleanup = () => document.removeEventListener('keydown', onKey);
  document.addEventListener('keydown', onKey);
  draw();
}

async function addOwn(wrap, ctx) {
  const f = h('input', { class: 'field', placeholder: 'Vorderseite (Frage oder Begriff)' });
  const b = h('textarea', { class: 'field', rows: 3, placeholder: 'Rückseite (Antwort)', style: { marginTop: '8px' } });
  const ok = await modal({ title: 'Eigene Karte', body: h('div', {}, f, b), actions: [{ label: 'Abbrechen', value: false }, { label: 'Hinzufügen', value: true, primary: true }] });
  if (!ok || !f.value.trim() || !b.value.trim()) return;
  let deck = ctx.doc.decks.find(d => d.own);
  if (!deck) { deck = { id: uid(), title: 'Eigene Karten', own: true, cards: [], created: Date.now() }; ctx.doc.decks.push(deck); }
  deck.cards.push({ id: uid(), front: f.value.trim(), back: b.value.trim(), due: 0 });
  save(ctx.doc); toast('Karte hinzugefügt.'); overview(wrap, ctx);
}

function exportAnki(d) {
  const clean = s => String(s).replace(/\t/g, ' ').replace(/\n/g, '<br>');
  const txt = d.cards.map(c => clean(c.front) + '\t' + clean(c.back)).join('\n');
  const a = h('a', { href: URL.createObjectURL(new Blob([txt], { type: 'text/plain' })), download: d.title.replace(/[^\wäöüÄÖÜß -]/g, '') + ' (Anki).txt' });
  document.body.appendChild(a); a.click(); a.remove();
  toast('In Anki: Datei → Importieren → Felder durch Tab getrennt.');
}
