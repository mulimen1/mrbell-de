// Fragetypen: Multiple Choice (auch mehrere richtig), Richtig/Falsch, Zuordnen, Reihenfolge, Lückentext, Rechenaufgabe.
import { h, shuffle, parseNum, fmt, ico, esc } from './util.js';
import { richText } from './sanitize.js';

export const TYPE_LABEL = { mc: 'Multiple Choice', tf: 'Richtig oder falsch', match: 'Zuordnen', order: 'Reihenfolge', cloze: 'Lückentext', num: 'Rechenaufgabe' };
const KEYS = 'ABCDEFGH';

export function normalize(q) {
  if (!q || typeof q !== 'object') return null;
  const t = q.type;
  try {
    if (t === 'mc') {
      const options = (q.options || []).map(String).filter(Boolean);
      let correct = (Array.isArray(q.correct) ? q.correct : [q.correct]).map(Number).filter(i => i >= 0 && i < options.length);
      if (options.length < 2 || !correct.length) return null;
      return { ...q, options, correct, why: Array.isArray(q.why) ? q.why : [] };
    }
    if (t === 'tf') return { ...q, correct: q.correct === true || q.correct === 'true' };
    if (t === 'match') { const pairs = (q.pairs || []).filter(p => Array.isArray(p) && p[0] && p[1]); return pairs.length >= 2 ? { ...q, pairs } : null; }
    if (t === 'order') { const items = (q.items || []).map(String).filter(Boolean); return items.length >= 3 ? { ...q, items } : null; }
    if (t === 'cloze') {
      const blanks = (q.blanks || []).map(String);
      const n = (String(q.q).match(/___+/g) || []).length;
      if (!n || !blanks.length) return null;
      return { ...q, blanks: blanks.slice(0, n), distractors: (q.distractors || []).map(String) };
    }
    if (t === 'num') { const a = typeof q.answer === 'number' ? q.answer : parseNum(q.answer); return isFinite(a) ? { ...q, answer: a } : null; }
  } catch (e) {}
  return null;
}

// Eine Frage rendern. Gibt Promise<{correct, score}> zurück, sobald geprüft wurde.
export function renderQuestion(root, q, { compact = false, onAsk, nextLabel = 'Weiter', onNext, showType = true, face } = {}) {
  root.replaceChildren();
  const card = h('div', { class: 'qcard' + (compact ? ' compact' : '') });
  if (showType) card.appendChild(h('div', { class: 'qtype' }, h('span', { class: 'tag' }, TYPE_LABEL[q.type] || 'Frage'), q.page ? h('span', { class: 'eyebrow' }, 'Seite ' + q.page) : null));
  const qtext = q.type === 'cloze' ? null : h('div', { class: 'q' }, richText(q.q));
  if (qtext) card.appendChild(qtext);
  const area = h('div', { class: 'qarea' });
  card.appendChild(area);
  const fb = h('div');
  const actions = h('div', { class: 'qactions' });
  card.append(fb, actions);
  root.appendChild(card);

  let done = false, resolve, nexted = false, lastR = null;
  const goNext = r => { if (nexted || !onNext) return; nexted = true; onNext(r || lastR); };
  const result = new Promise(r => { resolve = r; });
  const checkBtn = h('button', { class: 'btn primary', disabled: true }, 'Prüfen ', h('span', { class: 'k' }, '↵'));
  const skipBtn = h('button', { class: 'btn ghost' }, 'Weiß ich nicht');
  actions.append(skipBtn, h('span', { class: 'sp' }), checkBtn);

  let api; // { ready(), check() -> {correct, score} }
  const setReady = v => { checkBtn.disabled = !v; };

  // ---------- Typen ----------
  if (q.type === 'mc') {
    const multi = q.correct.length > 1 || /mehrere richtig/i.test(q.q);
    const order = shuffle(q.options.map((o, i) => i));
    const sel = new Set();
    const btns = order.map((oi, k) => {
      const b = h('button', { class: 'opt', type: 'button' }, h('span', { class: 'key' }, KEYS[k]), h('span', { class: 'tx' }, q.options[oi]));
      b.addEventListener('click', () => {
        if (done) return;
        if (multi) { sel.has(oi) ? sel.delete(oi) : sel.add(oi); }
        else { sel.clear(); sel.add(oi); }
        btns.forEach((x, j) => x.classList.toggle('sel', sel.has(order[j])));
        setReady(sel.size > 0);
        if (!multi && !compact) { /* Einzelauswahl: direkt prüfen per Doppelklick */ }
      });
      b.addEventListener('dblclick', () => { if (!multi && !done) doCheck(); });
      return b;
    });
    if (multi) area.appendChild(h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Mehrere Antworten möglich'));
    area.appendChild(h('div', { class: 'opts' }, btns));
    api = {
      key(e) { const i = KEYS.indexOf(e.key.toUpperCase()); if (i >= 0 && i < btns.length) { btns[i].click(); return true; } },
      check() {
        const ok = q.correct.length === sel.size && q.correct.every(i => sel.has(i));
        const hit = [...sel].filter(i => q.correct.includes(i)).length, miss = [...sel].filter(i => !q.correct.includes(i)).length;
        btns.forEach((b, j) => {
          const oi = order[j]; b.classList.add('locked');
          if (q.correct.includes(oi)) b.classList.add('right'); else if (sel.has(oi)) b.classList.add('wrong');
          b.classList.remove('sel');
          const w = q.why[oi];
          if (w && (sel.has(oi) || q.correct.includes(oi))) b.querySelector('.tx').appendChild(h('span', { class: 'why' }, w));
        });
        return { correct: ok, score: ok ? 1 : Math.max(0, (hit - miss) / q.correct.length) * .5 };
      }
    };
  }

  if (q.type === 'tf') {
    let v = null;
    const mk = (val, label) => {
      const b = h('button', { class: 'opt', type: 'button' }, label);
      b.addEventListener('click', () => { if (done) return; v = val; bt.classList.toggle('sel', v === true); bf.classList.toggle('sel', v === false); setReady(true); });
      return b;
    };
    const bt = mk(true, 'Richtig'), bf = mk(false, 'Falsch');
    area.appendChild(h('div', { class: 'tf' }, bt, bf));
    api = {
      key(e) { if (e.key.toLowerCase() === 'r' || e.key === '1') { bt.click(); return true; } if (e.key.toLowerCase() === 'f' || e.key === '2') { bf.click(); return true; } },
      check() {
        const ok = v === q.correct;
        [bt, bf].forEach(b => b.classList.add('locked'));
        (q.correct ? bt : bf).classList.add('right'); if (!ok) (q.correct ? bf : bt).classList.add('wrong');
        bt.classList.remove('sel'); bf.classList.remove('sel');
        return { correct: ok, score: ok ? 1 : 0 };
      }
    };
  }

  if (q.type === 'match') {
    const left = q.pairs.map((p, i) => ({ i, t: p[0] }));
    const right = shuffle(q.pairs.map((p, i) => ({ i, t: p[1] })));
    const link = new Map(); // leftIndex -> rightIndex
    let pickL = null;
    const lEls = left.map(l => h('div', { class: 'mi', tabindex: 0 }, l.t));
    const rEls = right.map(r => h('div', { class: 'mi', tabindex: 0 }, r.t));
    const nums = () => {
      lEls.forEach((e, k) => { e.querySelector('.badge')?.remove(); e.classList.toggle('pick', pickL === k); });
      rEls.forEach(e => e.querySelector('.badge')?.remove());
      let n = 1;
      for (const [lk, rk] of link) { lEls[lk].appendChild(h('span', { class: 'badge' }, n)); rEls[rk].appendChild(h('span', { class: 'badge' }, n)); n++; }
      lEls.forEach((e, k) => e.classList.toggle('done', link.has(k) && pickL !== k));
      rEls.forEach((e, k) => e.classList.toggle('done', [...link.values()].includes(k)));
      setReady(link.size === left.length);
    };
    lEls.forEach((e, k) => e.addEventListener('click', () => { if (done) return; if (link.has(k)) link.delete(k); pickL = k; nums(); }));
    rEls.forEach((e, k) => e.addEventListener('click', () => {
      if (done) return;
      for (const [a, b] of link) if (b === k) link.delete(a);
      if (pickL == null) { const free = lEls.findIndex((_, i) => !link.has(i)); if (free < 0) return; pickL = free; }
      link.set(pickL, k);
      const free = lEls.findIndex((_, i) => !link.has(i));
      pickL = free >= 0 ? free : null; nums();
    }));
    pickL = 0;
    area.appendChild(h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Links antippen, dann das passende Gegenstück rechts'));
    area.appendChild(h('div', { class: 'match' }, h('div', { class: 'col' }, lEls), h('div', { class: 'col' }, rEls)));
    nums();
    api = {
      check() {
        let good = 0;
        for (const [lk, rk] of link) {
          const ok = left[lk].i === right[rk].i; if (ok) good++;
          lEls[lk].classList.add(ok ? 'right' : 'wrong'); rEls[rk].classList.add(ok ? 'right' : 'wrong');
        }
        lEls.forEach((e, k) => { if (!lEls[k].classList.contains('right')) { const r = q.pairs[left[k].i][1]; e.appendChild(h('span', { class: 'why', style: { display: 'block', fontSize: '12.5px', marginTop: '6px', opacity: .8 } }, '→ ' + r)); } });
        return { correct: good === left.length, score: good / left.length };
      }
    };
  }

  if (q.type === 'order') {
    let cur = shuffle(q.items.map((t, i) => ({ i, t })));
    if (cur.every((c, k) => c.i === k)) cur.reverse();
    const list = h('div', { class: 'order' });
    const draw = () => {
      list.replaceChildren(...cur.map((c, k) => {
        const up = h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'nach oben', html: ico('left').replace('M15 6l-6 6 6 6', 'M6 15l6-6 6 6') });
        const dn = h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'nach unten', html: ico('left').replace('M15 6l-6 6 6 6', 'M6 9l6 6 6-6') });
        up.addEventListener('click', e => { e.stopPropagation(); if (done || k === 0) return; [cur[k - 1], cur[k]] = [cur[k], cur[k - 1]]; draw(); });
        dn.addEventListener('click', e => { e.stopPropagation(); if (done || k === cur.length - 1) return; [cur[k + 1], cur[k]] = [cur[k], cur[k + 1]]; draw(); });
        const el = h('div', { class: 'oi', 'data-k': k }, h('span', { class: 'grip' }, String(k + 1).padStart(2, '0')), h('span', {}, c.t), h('span', { class: 'mv' }, up, dn));
        el.addEventListener('pointerdown', e => startDrag(e, k, el));
        return el;
      }));
    };
    let drag = null;
    const startDrag = (e, k, el) => {
      if (done || e.target.closest('button')) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      drag = { k, el, y0: e.clientY, h: r.height + 8 };
      el.classList.add('dragging'); el.setPointerCapture(e.pointerId);
      const move = ev => {
        const dy = ev.clientY - drag.y0; el.style.transform = `translateY(${dy}px)`;
        const steps = Math.round(dy / drag.h); const target = Math.max(0, Math.min(cur.length - 1, drag.k + steps));
        [...list.children].forEach((c, j) => { if (c === el) return; let off = 0; if (drag.k < target && j > drag.k && j <= target) off = -drag.h; if (drag.k > target && j < drag.k && j >= target) off = drag.h; c.style.transform = off ? `translateY(${off}px)` : ''; });
        drag.target = target;
      };
      const up = () => {
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        const t = drag.target ?? drag.k; const [it] = cur.splice(drag.k, 1); cur.splice(t, 0, it); drag = null; draw();
      };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    };
    draw(); setReady(true);
    area.appendChild(h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Ziehen oder mit den Pfeilen sortieren'));
    area.appendChild(list);
    api = {
      check() {
        let good = 0;
        [...list.children].forEach((el, k) => { const ok = cur[k].i === k; if (ok) good++; el.classList.add(ok ? 'right' : 'wrong'); el.querySelector('.mv').remove(); });
        if (good < cur.length) list.appendChild(h('div', { class: 'feedback', style: { marginTop: '6px' } }, h('b', {}, 'Richtige Reihenfolge'), h('ol', { style: { margin: '8px 0 0', paddingLeft: '20px' } }, q.items.map(t => h('li', {}, t)))));
        return { correct: good === cur.length, score: good / cur.length };
      }
    };
  }

  if (q.type === 'cloze') {
    const parts = String(q.q).split(/___+/);
    const fills = new Array(q.blanks.length).fill(null);
    let active = 0;
    const gaps = [];
    const text = h('div', { class: 'cloze' });
    parts.forEach((p, i) => {
      text.appendChild(document.createTextNode(p));
      if (i < parts.length - 1 && i < q.blanks.length) {
        const g = h('span', { class: 'gap', tabindex: 0, role: 'button' }, '…');
        g.addEventListener('click', () => { if (done) return; if (fills[i] != null) { fills[i] = null; } active = i; drawGaps(); });
        gaps.push(g); text.appendChild(g);
      }
    });
    const words = shuffle([...q.blanks.map((w, i) => ({ w, i })), ...q.distractors.map(w => ({ w, i: -1 }))]);
    const chips = words.map((x, k) => {
      const c = h('button', { class: 'chip', type: 'button' }, x.w);
      c.addEventListener('click', () => {
        if (done) return;
        let slot = fills[active] == null ? active : fills.findIndex(f => f == null);
        if (slot < 0) slot = active;
        fills[slot] = k; const nxt = fills.findIndex(f => f == null); active = nxt >= 0 ? nxt : slot; drawGaps();
      });
      return c;
    });
    const drawGaps = () => {
      gaps.forEach((g, i) => { g.textContent = fills[i] == null ? '…' : words[fills[i]].w; g.classList.toggle('active', i === active && !done); });
      chips.forEach((c, k) => c.classList.toggle('used', fills.includes(k)));
      setReady(fills.every(f => f != null));
    };
    card.insertBefore(h('div', { class: 'q', style: { marginBottom: '6px' } }, 'Füll die Lücken'), area);
    area.append(text, h('div', { class: 'bank' }, chips));
    drawGaps();
    api = {
      check() {
        let good = 0;
        gaps.forEach((g, i) => {
          const w = fills[i] != null ? words[fills[i]].w : '';
          const ok = w.trim().toLowerCase() === q.blanks[i].trim().toLowerCase(); if (ok) good++;
          g.classList.add(ok ? 'right' : 'wrong'); g.classList.remove('active');
          if (!ok) g.after(h('b', { style: { margin: '0 4px', fontSize: '15px' } }, '→ ' + q.blanks[i]));
        });
        chips.forEach(c => c.classList.add('used'));
        return { correct: good === gaps.length, score: good / gaps.length };
      }
    };
  }

  if (q.type === 'num') {
    const inp = h('input', { class: 'field', inputmode: 'decimal', placeholder: 'Dein Ergebnis', 'aria-label': 'Ergebnis' });
    inp.addEventListener('input', () => setReady(isFinite(parseNum(inp.value))));
    area.appendChild(h('div', { class: 'numrow' }, inp, q.unit ? h('span', { class: 'unit' }, q.unit) : null));
    area.appendChild(h('div', { class: 'eyebrow', style: { marginTop: '10px' } }, 'Komma oder Punkt – beides geht. Runde auf 2 Nachkommastellen.'));
    setTimeout(() => inp.focus({ preventScroll: true }), 60);
    api = {
      check() {
        const v = parseNum(inp.value), a = q.answer;
        const tol = Math.max(Math.abs(a) * Math.min(Number(q.tolerance) > 0 && Number(q.tolerance) < .05 ? Number(q.tolerance) : .01, .02), .011);
        let ok = Math.abs(v - a) <= tol;
        // Prozent als Dezimalzahl eingegeben (0,25 statt 25 %)?
        let note = '';
        if (!ok && q.unit && /%/.test(q.unit) && Math.abs(v * 100 - a) <= tol) { ok = true; note = 'Stimmt – in Prozent wären das ' + fmt(a) + ' %.'; }
        inp.disabled = true; inp.style.borderColor = 'var(--ink)'; if (!ok) inp.style.borderStyle = 'dashed';
        return { correct: ok, score: ok ? 1 : 0, note };
      }
    };
  }

  if (!api) { area.appendChild(h('p', {}, 'Diese Frage konnte nicht angezeigt werden.')); setReady(false); }

  function doCheck(skipped = false) {
    if (done || (!skipped && checkBtn.disabled)) return;
    done = true;
    const r = skipped ? { correct: false, score: 0 } : api.check();
    if (skipped && api) try { api.check(); } catch (e) {}
    lastR = { ...r, skipped };
    showFeedback(r, skipped);
    face && face.pulse(r.correct ? 'happy' : 'sad', 1400);
    resolve({ ...r, skipped });
  }
  function showFeedback(r, skipped) {
    const f = h('div', { class: 'feedback' + (r.correct ? '' : ' bad') },
      h('div', { class: 'verdict' }, h('span', { class: 'badge', html: r.correct ? ico('check') : ico('x') }), r.correct ? pick(['Richtig.', 'Genau so.', 'Sitzt.', 'Stark.']) : skipped ? 'Kein Problem – so geht’s:' : (r.score > 0 ? 'Teilweise richtig.' : 'Noch nicht ganz.')),
      r.note ? h('p', {}, r.note) : null,
      q.type === 'num' && !r.correct ? h('p', {}, h('b', {}, 'Lösung: ' + fmt(q.answer) + (q.unit ? ' ' + q.unit : ''))) : null,
      q.explain ? h('p', {}, richText(q.explain)) : null,
      q.type === 'num' && q.solution ? h('div', { class: 'sol' }, String(q.solution).replace(/<br\s*\/?>/g, '\n')) : null,
      q.page ? h('div', { class: 'src' }, 'Quelle: Vorlesung, S. ' + q.page) : null);
    fb.replaceChildren(f);
    actions.replaceChildren();
    if (onAsk && !r.correct) actions.appendChild(h('button', { class: 'btn', onclick: () => onAsk(q, r) }, h('span', { html: ico('chat') }), 'Tutor erklärt’s mir'));
    actions.appendChild(h('span', { class: 'sp' }));
    if (onNext) { const nb = h('button', { class: 'btn primary', onclick: () => goNext(r) }, nextLabel, ' ', h('span', { class: 'k' }, '↵')); actions.appendChild(nb); setTimeout(() => nb.focus({ preventScroll: true }), 50); }
  }
  checkBtn.addEventListener('click', () => doCheck(false));
  skipBtn.addEventListener('click', () => doCheck(true));

  const onKey = e => {
    if (!card.isConnected) { document.removeEventListener('keydown', onKey); return; }
    if (e.defaultPrevented) return;
    if (e.target && (e.target.tagName === 'TEXTAREA' || (e.target.tagName === 'INPUT' && e.key !== 'Enter'))) return;
    if (e.key === 'Enter') { if (!done) { e.preventDefault(); doCheck(false); } else if (onNext && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); goNext(); } return; }
    if (!done && api?.key && !e.metaKey && !e.ctrlKey && api.key(e)) e.preventDefault();
  };
  document.addEventListener('keydown', onKey);
  result.then(() => {});
  return { result, destroy: () => document.removeEventListener('keydown', onKey) };
}
const pick = a => a[Math.floor(Math.random() * a.length)];
