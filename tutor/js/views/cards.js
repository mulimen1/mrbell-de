// Karteikarten mit Spaced Repetition (FSRS-5). Wiederholen kostet keine KI.
import { starBtn, fachOf } from '../me.js';
import { h, ico, uid, toast, modal, shuffle, haptic } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save, S } from '../state.js';
import { forWhole, forChapter } from '../retrieve.js';
import { loading, apiError, costBtn, freshen, isGuest, lockedPreview, lockedRest, GUEST_CARDS, GUEST_QUIZ } from '../ui.js';
import { richText, cardBack } from '../sanitize.js';
import { L } from '../i18n.js';
import { review } from '../fsrs.js';
import { autoOpts, personalise } from '../create.js';
import { dlBtn, optsDeck } from '../export.js';
import { savedToast } from '../lib.js';

const DAY = 864e5;
export function dueCards(doc, now = Date.now()) { return doc.decks.flatMap(d => d.cards.map(c => ({ c, d }))).filter(x => (x.c.due || 0) <= now); }

// FSRS-5: Abstände nach Stabilität und Schwierigkeit, vor der Klausur verdichtet
let examAt = 0;
function schedule(c, r) {
  review(c, r, Date.now(), examAt);
  return label(c.ivl, c.due);
}
function label(ivl, due) { if (!ivl) { const m = Math.round((due - Date.now()) / 6e4); return m < 60 ? L(`in ${Math.max(1, m)} Min.`, `in ${Math.max(1, m)} min`) : L('heute', 'today'); } return ivl === 1 ? L('morgen', 'tomorrow') : ivl < 30 ? L(`in ${Math.round(ivl)} T.`, `in ${Math.round(ivl)} d`) : L(`in ${Math.round(ivl / 30)} Mon.`, `in ${Math.round(ivl / 30)} mo`); }

export async function render(root, ctx) {
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  const chIdx = ctx.arg && ctx.arg.startsWith('k') ? parseInt(ctx.arg.slice(1)) : null;
  if (ctx.arg === 'max') { history.replaceState(null, '', location.hash.replace(/\/max$/, '')); return generate(wrap, ctx, null, { count: 12, max: true }); }
  const auto = ctx.arg === 'auto'; if (auto) history.replaceState(null, '', location.hash.replace(/\/auto$/, ''));
  if (auto) { const o = await autoOpts('karten', ctx.doc); if (!wrap.isConnected) return; if (!o) { wrap.remove(); return render(root, Object.assign({}, ctx, { arg: null })); } return generate(wrap, ctx, o && o.focus >= 0 && ctx.doc.path?.chapters[o.focus] ? o.focus : null, o); }
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
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, L('Karteikarten', 'Flashcards')), h('h2', {}, total ? L(`${due.length} fällig`, `${due.length} due`) : L('Karteikarten', 'Flashcards')), h('p', {}, total ? L(`${total} Karten in ${doc.decks.length} Stapel(n). Wiederholen kostet keine Einheiten.`, `${total} cards in ${doc.decks.length} deck(s). Reviewing costs no credits.`) : L('Aus deinem Skript – mit Wiederholung genau dann, wenn du’s fast vergisst.', 'From your slides – reviewed right when you’re about to forget them.'))),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        due.length ? h('button', { class: 'btn primary', onclick: () => study(wrap, ctx, due, L('Fällige Karten', 'Due cards')) }, h('span', { html: ico('play') }), L(`${due.length} wiederholen`, `Review ${due.length}`)) : null,
        costBtn(L('Neue Karten erstellen', 'Create new cards'), 'cards', async () => { const o = await personalise('karten', doc); if (o) generate(wrap, ctx, o.focus >= 0 && doc.path?.chapters[o.focus] ? o.focus : null, o); }, due.length ? 'btn' : 'btn primary'),
        total ? dlBtn(() => optsDeck(doc.decks, doc), { cls: 'btn' }) : null)),
    total ? null : h('div', { class: 'empty', style: { paddingTop: '30px' } }, f, h('p', {}, L('Noch keine Karten. Ich erstelle dir 16 Karten aus dem ganzen Skript – oder wähle im Lernpfad ein Kapitel.', 'No cards yet. I’ll create 16 cards from the whole script – or pick a chapter in the study path.'))),
    doc.decks.length ? h('div', { class: 'list' }, [...doc.decks].reverse().map(d => {
      const dd = d.cards.filter(c => (c.due || 0) <= Date.now()).length;
      const known = d.cards.filter(c => (c.ivl || 0) >= 3).length;
      return h('div', { class: 'li', onclick: () => study(wrap, ctx, d.cards.map(c => ({ c, d })), d.title) },
        h('span', { html: ico('cards') }),
        h('div', { class: 'gr' }, h('b', {}, d.title), h('span', {}, L(`${d.cards.length} Karten · ${known} sicher · ${dd} fällig`, `${d.cards.length} cards · ${known} known · ${dd} due`))),
        starBtn(() => ({ typ: 'karten', titel: d.title, doc: doc.id, docName: doc.name, ref: d.id || d.title, inhalt: d.cards.slice(0, 40).map(c => `${c.front} → ${c.back}`).join('\n') }), { cls: 'sm bare' }),
        dlBtn(() => optsDeck([d], doc), { cls: 'iconbtn', text: false }),
        h('button', { class: 'iconbtn', title: L('Löschen', 'Delete'), html: ico('trash'), onclick: async e => { e.stopPropagation(); const ok = await modal({ title: L('Stapel löschen?', 'Delete deck?'), text: d.title, actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] }); if (ok) { doc.decks = doc.decks.filter(x => x !== d); save(doc); overview(wrap, ctx); } } }));
    })) : null,
    h('div', { style: { marginTop: '18px' } }, h('button', { class: 'btn sm ghost', onclick: () => addOwn(wrap, ctx) }, h('span', { html: ico('plus') }), L('Eigene Karte', 'Own card'))));
  if (!total) face(f);
}

const ART = { begriffe: L('Schwerpunkt: Fachbegriffe und Definitionen', 'Focus: key terms and definitions'), formeln: L('Schwerpunkt: Formeln und Rechenwege – Vorderseite fragt nach Formel oder Rechenschritt', 'Focus: formulas and workings – the front asks for a formula or calculation step'), klausur: L('Schwerpunkt: typische Klausurfragen mit knappen Musterantworten', 'Focus: typical exam questions with short model answers') };
async function generate(wrap, ctx, chIdx, o) {
  const { doc } = ctx;
  const ch = chIdx != null ? doc.path.chapters[chIdx] : null;
  const count = o?.count || (ch ? 12 : 16);
  const focus = [ch ? L(`Kapitel „${ch.title}“ (S. ${ch.pages[0]}–${ch.pages[1]})`, `Chapter “${ch.title}” (p. ${ch.pages[0]}–${ch.pages[1]})`) : '', ART[o?.art] || ''].filter(Boolean).join('. ');
  const ld = loading(wrap, L('Ich schreibe deine Karteikarten …', 'Writing your flashcards …'), L(['Suche Begriffe und Formeln', 'Formuliere präzise Fragen', 'Halte die Antworten kurz'], ['Finding key terms and formulas', 'Phrasing precise questions', 'Keeping the answers short']), 'cards');
  // Aus Max' Tafel (Anzeigen-Einstieg), ohne Konto: während Max schreibt, kommt die Anmeldung – danach sind alle Karten da
  const gate = o?.max && isGuest();
  // Ohne Anmeldefenster: Max schreibt die Karten, die erste steht da – beim ersten Antippen kommt die Anmeldung (study)
  try {
    const r = await ask('cards', { material: ch ? forChapter(doc, ch) : forWhole(doc), docName: doc.name, opts: gate ? { count, focus, entry: true } : { count, focus } }, { signal: ld.signal });
    const cards = (r.data?.cards || []).filter(c => c && c.front && (c.back || c.formula)).map(c => ({ id: uid(), front: String(c.front), back: String(c.back || ''), formula: c.formula ? String(c.formula).slice(0, 400) : '', legend: (Array.isArray(c.legend) ? c.legend : []).filter(x => Array.isArray(x) && x[0] && x[1]).slice(0, 8).map(x => [String(x[0]).slice(0, 40), String(x[1]).slice(0, 80)]), page: c.page || null, due: 0 }));
    if (!cards.length) throw new Error(L('Es kamen keine Karten zurück. Versuch es nochmal.', 'No cards came back. Please try again.'));
    const deck = { id: uid(), title: ch ? ch.title : (r.data.title || L('Ganzes Skript', 'Whole script')), chapter: chIdx, cards, created: Date.now() };
    if (gate) deck.guestGate = true;   // ohne Konto: erste Karte sehen, beim ersten Antippen anmelden
    doc.decks.push(deck); save(doc);
    ld.stop(); savedToast('karten');
    study(wrap, ctx, cards.map(c => ({ c, d: deck })), deck.title); freshen(wrap);
  } catch (e) {
    ld.stop(false);
    // Gast-Kontingent schon verbraucht: kein zweites Fenster – die Karten warten hinter der Anmeldung
    if (gate && e?.code === 'need_account') return lockedPreview(wrap, { kind: 'zettel', title: L('Deine Karten warten auf dich', 'Your cards are waiting'), text: L('Mit kostenlosem Konto schreibt Max sie dir sofort – und fragt dich ab, bevor du sie vergisst.', 'With a free account Max writes them right away – and quizzes you before you forget.'), onUnlock: () => generate(wrap, ctx, chIdx, { count: 12 }) });
    overview(wrap, ctx); apiError(e, () => generate(wrap, ctx, chIdx, o));
  }
}

function study(wrap, ctx, items, title) {
  const { doc } = ctx;
  { const f = fachOf(doc.id); const iso = (f && f.klausur) || doc.plan?.exam; examAt = iso ? new Date(iso + 'T08:00').getTime() || 0 : 0; }
  let queue = shuffle(items).sort((a, b) => (a.c.due || 0) - (b.c.due || 0)).slice(0, 40);
  // Ohne Konto: die ersten Karten jedes Stapels zuerst, der Rest danach (gesperrt)
  const lim = d => (d.guestFree != null ? d.guestFree : GUEST_CARDS);
  if (isGuest()) { const free = x => x.d.cards.indexOf(x.c) < lim(x.d); queue = [...items.filter(free), ...items.filter(x => !free(x))].slice(0, 40); }
  let i = 0, flipped = false, done = 0, again = 0;
  const stage = h('div', { class: 'fc-stage' });
  wrap.replaceChildren(h('button', { class: 'btn sm ghost', onclick: () => { cleanup(); overview(wrap, ctx); }, style: { marginBottom: '10px' } }, h('span', { html: ico('left') }), L('Karteikarten', 'Flashcards')),
    h('div', { class: 'vh', style: { marginBottom: '6px' } }, h('div', {}, h('div', { class: 'eyebrow' }, matchMedia('(pointer: coarse)').matches ? L('Tippen = umdrehen · wischen = bewerten', 'Tap = flip · swipe = rate') : L('Leertaste = umdrehen · 1–3 = bewerten', 'Space = flip · 1–3 = rate')), h('h2', { style: { fontSize: '24px' } }, title))), stage);
  const draw = () => {
    if (i >= queue.length) {
      const f = h('div', { class: 'face' });
      stage.replaceChildren(h('div', { class: 'result-hero' }, f, h('div', { class: 'score' }, done), h('p', { style: { color: 'var(--mute)' } }, L(`Karten wiederholt${again ? ` · ${again}× nochmal` : ''}. Die nächsten kommen, wenn du sie fast vergessen hast.`, `cards reviewed${again ? ` · ${again}× again` : ''}. The next ones show up when you’ve almost forgotten them.`)),
        h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' } }, h('button', { class: 'btn primary', onclick: () => { cleanup(); overview(wrap, ctx); } }, L('Fertig', 'Done')), h('button', { class: 'btn', onclick: () => ctx.go('quiz') }, L('Quiz machen', 'Take a quiz')))));
      const fc = face(f); setTimeout(() => fc.set('happy'), 150);
      if (done >= 5) import('../util.js').then(u => u.confetti({ n: 50 })).catch(() => {});   // Runde geschafft
      return;
    }
    if (isGuest() && queue[i].d.cards.indexOf(queue[i].c) >= lim(queue[i].d)) return lockedRest(stage, { left: queue.length - i, what: L('Karten', 'cards'), onUnlock: draw });
    const { c } = queue[i];
    flipped = false;
    const card = h('div', { class: 'fc', tabindex: 0, role: 'button', 'aria-label': L('Karte umdrehen', 'Flip card') },
      h('div', { class: 'in' },
        h('div', { class: 'f' }, richText(c.front), h('span', { class: 'hint' }, L('Tippen zum Umdrehen', 'Tap to flip')), c.page ? h('span', { class: 'pg' }, L('S. ', 'p. ') + c.page) : null),
        h('div', { class: 'b' }, cardBack(c))));
    // Drei klare Knöpfe, keine Abstände – den Rest plant die Wiederholung im Hintergrund
    const rate = h('div', { class: 'rate r3', style: { visibility: 'hidden' } }, [[1, L('Nochmal', 'Again'), 'k1'], [2, L('Unsicher', 'Not sure'), 'k2'], [3, L('Gewusst', 'Got it'), 'k3']].map(([r, l, k]) =>
      h('button', { class: 'btn ' + k + (r === 3 ? ' primary' : ''), type: 'button', onclick: () => grade(r) }, l)));
    // Aus Max' Tafel ohne Konto: Karte steht da, aber üben (umdrehen) gibt's mit kostenlosem Konto
    if (isGuest() && queue[i].d.guestGate) {
      const lock = () => { if (!isGuest()) return draw(); lockedRest(stage, { left: queue.length, what: L('Karten', 'cards'), title: L('Deine Karten sind fertig', 'Your cards are ready'), text: L('Damit du üben kannst und alles gespeichert bleibt: kostenlos anmelden. Dauert 30 Sekunden – danach fragt Max dich ab, bevor du’s vergisst.', 'To practise and keep everything saved: sign up for free. Takes 30 seconds – then Max quizzes you before you forget.'), onUnlock: draw }); };
      card.addEventListener('click', lock);
      stage.replaceChildren(card, h('div', { class: 'deckstats' }, h('span', {}, L(`${queue.length} Karten fertig`, `${queue.length} cards ready`))));
      return;
    }
    const flip = () => { if (card._dragged) { card._dragged = false; return; } flipped = !flipped; card.classList.toggle('flipped', flipped); if (flipped) rate.style.visibility = 'visible'; };
    card.addEventListener('click', flip);
    // Wischen (nach dem Umdrehen): rechts = gewusst, links = nochmal – wie bei Tinder/Quizlet
    let sx = 0, sy = 0, dx = 0, drag = false;
    card.addEventListener('pointerdown', e => { if (!flipped || e.button) return; sx = e.clientX; sy = e.clientY; dx = 0; drag = true; card.setPointerCapture?.(e.pointerId); card.style.transition = 'none'; });
    card.addEventListener('pointermove', e => { if (!drag) return; dx = e.clientX - sx; if (Math.abs(e.clientY - sy) > 60 && Math.abs(dx) < 30) { drag = false; card.style.transform = ''; return; } card.style.transform = `translateX(${dx}px) rotate(${dx / 24}deg)`; card.classList.toggle('sw-ok', dx > 50); card.classList.toggle('sw-no', dx < -50); });
    const end = () => { if (!drag) return; drag = false; card.style.transition = ''; if (Math.abs(dx) > 90) { card._dragged = true; const ok = dx > 0; card.style.transform = `translateX(${ok ? 140 : -140}%) rotate(${ok ? 18 : -18}deg)`; card.style.opacity = '0'; setTimeout(() => grade(ok ? 3 : 1), 220); } else { if (Math.abs(dx) > 6) card._dragged = true; card.style.transform = ''; card.classList.remove('sw-ok', 'sw-no'); } };
    card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
    stage.replaceChildren(h('div', { class: 'fc-prog', 'aria-hidden': 'true' }, h('i', { style: { width: (100 * i / queue.length) + '%' } })), card, rate, h('div', { class: 'deckstats' }, h('span', {}, `${i + 1} / ${queue.length}`), h('span', {}, '·'), h('span', {}, L(`${done} erledigt`, `${done} done`))), i === 0 && !flipped ? h('div', { class: 'fc-swhint' }, L('Nach dem Umdrehen: nach rechts wischen = gewusst, nach links = nochmal', 'After flipping: swipe right = got it, left = again')) : null);
  };
  const grade = r => {
    const it = queue[i];
    schedule(it.c, r); haptic(r === 1 ? 'bad' : 'ok');
    if (r === 1) { again++; queue.splice(Math.min(queue.length, i + 4), 0, it); }
    else { done++; if (done % 5 === 0) { const df = document.querySelector('.asst-bub .face, .asst .face'); try { df && df.__face && df.__face.pulse('happy', 1300); } catch (e) {} toast(L(`${done} Karten sitzen. Weiter so.`, `${done} cards nailed. Keep going.`), 1800); } }
    i++; save(doc); draw();
  };
  const onKey = e => {
    if (!stage.isConnected) return cleanup();
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') { e.preventDefault(); stage.querySelector('.fc')?.click(); }
    else if (flipped && ['1', '2', '3'].includes(e.key)) grade(+e.key);
  };
  const cleanup = () => document.removeEventListener('keydown', onKey);
  document.addEventListener('keydown', onKey);
  draw();
}

async function addOwn(wrap, ctx) {
  const f = h('input', { class: 'field', placeholder: L('Vorderseite (Frage oder Begriff)', 'Front (question or term)') });
  const b = h('textarea', { class: 'field', rows: 3, placeholder: L('Rückseite (Antwort)', 'Back (answer)'), style: { marginTop: '8px' } });
  const ok = await modal({ title: L('Eigene Karte', 'Own card'), body: h('div', {}, f, b), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Hinzufügen', 'Add'), value: true, primary: true }] });
  if (!ok || !f.value.trim() || !b.value.trim()) return;
  let deck = ctx.doc.decks.find(d => d.own);
  if (!deck) { deck = { id: uid(), title: L('Eigene Karten', 'Own cards'), own: true, cards: [], created: Date.now() }; ctx.doc.decks.push(deck); }
  deck.cards.push({ id: uid(), front: f.value.trim(), back: b.value.trim(), due: 0 });
  save(ctx.doc); toast(L('Karte hinzugefügt.', 'Card added.')); overview(wrap, ctx);
}

