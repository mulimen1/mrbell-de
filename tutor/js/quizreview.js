// Auswertung nach dem Quiz: jede Frage aufklappbar – ganze Frage, alle Antwortmöglichkeiten, was du gewählt hast, was richtig ist, Erklärung.
import { h, ico, fmt } from './util.js';
import { richText } from './sanitize.js';
import { L } from './i18n.js';

const KEYS = 'ABCDEFGH';
const st = r => !r ? 'skip' : r.skipped ? 'skip' : r.correct ? 'ok' : r.score > 0 ? 'part' : 'bad';
const LBL = { ok: L('Richtig', 'Correct'), bad: L('Falsch', 'Wrong'), part: L('Teilweise', 'Partly'), skip: L('Übersprungen', 'Skipped') };
const clean = q => q.type === 'cloze' ? String(q.q).replace(/___+/g, '…') : String(q.q);
const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

function answerView(q, r) {
  const p = r && !r.skipped ? r.pick : undefined;
  if (q.type === 'mc') {
    const sel = new Set(Array.isArray(p) ? p : []);
    return h('div', { class: 'qr-opts' }, q.options.map((o, i) => {
      const right = q.correct.includes(i), mine = sel.has(i);
      const cls = right ? 'right' : mine ? 'wrong' : '';
      const why = Array.isArray(q.why) && q.why[i] && (right || mine) ? h('small', { class: 'qr-why' }, q.why[i]) : null;
      return h('div', { class: 'qr-o ' + cls }, h('span', { class: 'qr-k' }, right ? h('span', { html: ico('check') }) : mine ? h('span', { html: ico('x') }) : KEYS[i]),
        h('div', { class: 'qr-ot' }, h('span', {}, o), why), mine ? h('span', { class: 'qr-me' }, L('Deine Wahl', 'Your pick')) : right ? h('span', { class: 'qr-me ok' }, L('Richtig', 'Correct')) : null);
    }));
  }
  if (q.type === 'tf') {
    return h('div', { class: 'qr-opts qr-tf' }, [[true, L('Richtig', 'True')], [false, L('Falsch', 'False')]].map(([v, t]) => {
      const right = q.correct === v, mine = p === v;
      return h('div', { class: 'qr-o ' + (right ? 'right' : mine ? 'wrong' : '') }, h('span', { class: 'qr-k' }, right ? h('span', { html: ico('check') }) : mine ? h('span', { html: ico('x') }) : ''), h('div', { class: 'qr-ot' }, t), mine ? h('span', { class: 'qr-me' }, L('Deine Wahl', 'Your pick')) : null);
    }));
  }
  if (q.type === 'match') {
    const mine = new Map(Array.isArray(p) ? p : []);
    return h('div', { class: 'qr-match' }, q.pairs.map(([a, b], i) => {
      const got = mine.has(i) ? q.pairs[mine.get(i)]?.[1] : null, ok = mine.get(i) === i;
      return h('div', { class: 'qr-mr ' + (ok ? 'right' : mine.size ? 'wrong' : '') }, h('b', {}, a), h('span', { class: 'qr-ar', html: ico('right') }), h('div', {}, h('span', {}, b), !ok && got ? h('small', { class: 'qr-was' }, L('Du: ', 'You: '), h('s', {}, got)) : null));
    }));
  }
  if (q.type === 'order') {
    const mine = Array.isArray(p) ? p : null;
    return h('div', { class: 'qr-ord' },
      h('div', {}, h('div', { class: 'qr-cap' }, L('Richtige Reihenfolge', 'Correct order')), h('ol', {}, q.items.map(t => h('li', {}, t)))),
      mine ? h('div', {}, h('div', { class: 'qr-cap' }, L('Deine Reihenfolge', 'Your order')), h('ol', {}, mine.map((ix, k) => h('li', { class: ix === k ? 'right' : 'wrong' }, q.items[ix])))) : null);
  }
  if (q.type === 'cloze') {
    const parts = String(q.q).split(/___+/), mine = Array.isArray(p) ? p : [];
    const box = h('div', { class: 'qr-cloze' });
    parts.forEach((t, i) => {
      box.append(document.createTextNode(t));
      if (i < parts.length - 1 && i < q.blanks.length) {
        const ok = same(mine[i], q.blanks[i]);
        box.append(h('span', { class: 'qr-gap ' + (ok ? 'right' : 'wrong') }, q.blanks[i]));
        if (!ok && mine[i]) box.append(h('s', { class: 'qr-gx' }, mine[i]));
      }
    });
    return box;
  }
  if (q.type === 'num') {
    return h('div', { class: 'qr-num' },
      h('div', { class: 'qr-nb ' + (r && r.correct ? 'right' : 'wrong') }, h('small', {}, L('Deine Antwort', 'Your answer')), h('b', {}, p ? String(p) + (q.unit ? ' ' + q.unit : '') : '–')),
      h('div', { class: 'qr-nb right' }, h('small', {}, L('Lösung', 'Solution')), h('b', {}, fmt(q.answer) + (q.unit ? ' ' + q.unit : ''))),
      q.solution ? h('div', { class: 'sol qr-sol' }, richText(String(q.solution).replace(/<br\s*\/?>/g, '\n'))) : null);
  }
  return null;
}

export function quizReview(qs, res, { onAsk } = {}) {
  const items = qs.map((q, k) => ({ q, r: res[k], s: st(res[k]), k }));
  const n = { all: items.length, bad: items.filter(x => x.s !== 'ok').length, ok: items.filter(x => x.s === 'ok').length };
  let filter = 'all';
  const list = h('div', { class: 'qr-list' });
  const cards = items.map(x => {
    const body = h('div', { class: 'qr-b' });
    let built = false;
    const d = h('details', { class: 'qr-it ' + x.s, 'data-s': x.s, id: 'qr-' + x.k },
      h('summary', {}, h('span', { class: 'qr-n' }, String(x.k + 1)), h('span', { class: 'qr-q' }, clean(x.q)), h('span', { class: 'qr-st' }, LBL[x.s]), h('span', { class: 'qr-chev', html: ico('right') })),
      body);
    d.addEventListener('toggle', () => {
      if (!d.open || built) return; built = true;
      body.append(
        x.s === 'skip' ? h('div', { class: 'qr-skipn' }, L('Nicht beantwortet – so wäre es richtig gewesen:', 'Not answered – this would have been right:')) : null,
        answerView(x.q, x.r),
        x.q.explain ? h('div', { class: 'qr-ex' }, h('span', { class: 'qr-exi', html: ico('spark') }), h('div', {}, h('b', {}, L('Erklärung', 'Explanation')), h('p', {}, richText(x.q.explain)))) : null,
        onAsk && x.s !== 'ok' ? h('div', { class: 'qr-act' }, h('button', { class: 'btn', type: 'button', onclick: () => onAsk(x.q, x.r || { correct: false, skipped: true }) }, h('span', { html: ico('chat') }), L('Max erklärt’s dir', 'Max explains it'))) : null);
    });
    return d;
  });
  list.append(...cards);
  const dots = h('div', { class: 'qr-dots' }, items.map(x => h('button', { type: 'button', class: 'qr-dot ' + x.s, title: `${x.k + 1}: ${LBL[x.s]}`, onclick: () => { if (filter !== 'all') setF('all'); const c = cards[x.k]; c.open = true; c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); } }, String(x.k + 1))));
  const seg = h('div', { class: 'qr-seg' });
  const setF = f => { filter = f; seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.f === f)); cards.forEach((c, i) => { c.hidden = f === 'bad' ? items[i].s === 'ok' : f === 'ok' ? items[i].s !== 'ok' : false; }); };
  [['all', L('Alle', 'All'), n.all], ['bad', L('Zum Nacharbeiten', 'To review'), n.bad], ['ok', L('Richtig', 'Correct'), n.ok]].forEach(([f, t, c]) => seg.append(h('button', { type: 'button', 'data-f': f, disabled: !c || null, onclick: () => setF(f) }, t, h('span', {}, String(c)))));
  setF('all');
  const firstBad = cards[items.findIndex(x => x.s !== 'ok')]; if (firstBad) firstBad.open = true;
  return h('section', { class: 'qr' },
    h('div', { class: 'qr-h' }, h('div', {}, h('h3', {}, L('Deine Antworten', 'Your answers')), h('p', {}, L('Tipp auf eine Frage: alle Antworten, deine Wahl und die Erklärung.', 'Tap a question: all options, your pick and the explanation.'))), seg),
    dots, list);
}
