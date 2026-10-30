// Tafel ansehen (z. B. aus der Bibliothek): direkt als Tafel, groß und ruhig – nicht im Chat.
// Blättern durch die Tafeln desselben Skripts, Herunterladen, „Mit Max besprechen“ öffnet sie im Tutor-Raum.
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { sanitize } from './sanitize.js';

export function openBoardView(list, start = 0, { docName = '' } = {}) {
  const boards = (list || []).filter(b => b && b.html);
  if (!boards.length) return;
  let i = Math.max(0, Math.min(boards.length - 1, start));
  document.querySelector('.bv-bg')?.remove();
  const title = h('b', {}), cnt = h('span', { class: 'cnt' });
  const area = h('div', { class: 'bv-ba dots' });
  const q = h('p', { class: 'bv-q' });
  const prev = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Vorherige Tafel', 'Previous board'), html: ico('left'), onclick: () => go(-1) });
  const next = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Nächste Tafel', 'Next board'), html: ico('right'), onclick: () => go(1) });
  const dl = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Herunterladen (PDF)', 'Download (PDF)'), title: L('Herunterladen (PDF)', 'Download (PDF)'), html: ico('download'), onclick: () => import('./export.js').then(E => {
    E.pick(boards.length > 1 ? [{ label: L('Diese Tafel', 'This board'), sub: 'PDF', ic: 'board', fn: () => E.boardsPdf([boards[i]]) }, { label: L(`Alle ${boards.length} Tafeln`, `All ${boards.length} boards`), sub: 'PDF', ic: 'board', fn: () => E.boardsPdf(boards, docName) }] : [{ label: 'PDF', ic: 'file', fn: () => E.boardsPdf([boards[i]]) }]);
  }) });
  const talk = h('button', { class: 'btn sm bv-talk', type: 'button', onclick: async () => {
    const b = boards[i]; close();
    location.hash = '#/app/tutor';
    for (let k = 0; k < 40; k++) { await new Promise(r => setTimeout(r, 100)); if (document.querySelector('.asst.stage')) break; }
    try { const m = await import('./assistant.js'); const api = m.mountAssistant(); api && api.showBoard && api.showBoard(b); } catch (e) {}
  } }, h('span', { html: ico('chat') }), L('Mit Max besprechen', 'Discuss with Max'));
  const x = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close() });
  const panel = h('section', { class: 'bv', role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Tafel', 'Board') },
    h('div', { class: 'ai-bh bv-h' }, h('span', { html: ico('board') }), title, cnt, prev, next, dl, x), area, h('div', { class: 'bv-f' }, q, talk));
  const bg = h('div', { class: 'bv-bg', onclick: e => { if (e.target === bg) close(); } }, panel);
  function draw() {
    const b = boards[i];
    title.textContent = b.title || L('Tafel', 'Board');
    cnt.textContent = boards.length > 1 ? `${i + 1} / ${boards.length}` : '';
    prev.hidden = next.hidden = boards.length < 2; prev.disabled = i === 0; next.disabled = i === boards.length - 1;
    const t = h('div', { class: 'tafel' }); t.appendChild(sanitize(b.html));
    area.replaceChildren(t); area.scrollTop = 0;
    if (t.querySelector('.mindmap')) import('./maxmode.js').then(m => { m.enhance(t, true); m.revealAll(t); }).catch(() => {});   // Mindmap wie an der Tafel, nicht als Textliste
    q.textContent = b.q ? L('Deine Frage: ', 'Your question: ') + b.q : (docName || '');
  }
  function go(d) { const n = i + d; if (n < 0 || n >= boards.length) return; i = n; draw(); }
  const onKey = e => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); };
  function close() { bg.remove(); removeEventListener('keydown', onKey); document.documentElement.classList.remove('bv-open'); }
  addEventListener('keydown', onKey);
  draw();
  document.body.appendChild(bg); document.documentElement.classList.add('bv-open');
  setTimeout(() => x.focus({ preventScroll: true }), 60);
  return { close };
}
