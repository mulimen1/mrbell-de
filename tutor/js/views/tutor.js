// Tutor: Chat links, Tafel rechts. Die KI schreibt Erklärungen als ```tafel-Blöcke an die Tafel.
import { starBtn, textKey, plain } from '../me.js';
import { h, ico, ls, sleep, toast } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save } from '../state.js';
import { forChat } from '../retrieve.js';
import { apiError, typeOut as typeIt, typePlaceholder, aiTag } from '../ui.js';
import { sanitize, richText } from '../sanitize.js';
import { say, SPICE, getSpice, setSpice, NAME } from '../max.js';
import { openVoice } from '../voice.js';
import { L } from '../i18n.js';

const ACTIONS = {
  quiz: [L('Quiz dazu starten', 'Start a quiz on this'), d => `#/app/${d.id}/quiz`],
  karten: [L('Karteikarten dazu', 'Flashcards on this'), d => `#/app/${d.id}/karten`],
  'trainer:buchung': [L('Buchungssatz-Trainer', 'Booking entry trainer'), () => '#/app/trainer/buchung'],
  'trainer:breakeven': [L('Break-even-Trainer', 'Break-even trainer'), () => '#/app/trainer/breakeven'],
  'trainer:kapitalwert': [L('Kapitalwert-Trainer', 'NPV trainer'), () => '#/app/trainer/kapitalwert'],
  'trainer:markt': [L('Angebot & Nachfrage', 'Supply & demand'), () => '#/app/trainer/markt'],
  'trainer:tkonten': [L('T-Konten-Trainer', 'T-account trainer'), () => '#/app/trainer/tkonten'],
  'trainer:bilanz': [L('Bilanz-Trainer', 'Balance sheet trainer'), () => '#/app/trainer/bilanz'],
};

export function parse(raw) {
  const boards = [];
  let text = String(raw || '').replace(/```tafel[ \t]*([^\n]*)\n([\s\S]*?)(```|$)/g, (_, title, html) => { boards.push({ title: title.trim() || L('Tafel', 'Whiteboard'), html: html.trim() }); return '\n'; });
  const acts = [];
  text = text.replace(/\[\[([a-z:]+)\]\]/g, (_, a) => { if (ACTIONS[a]) acts.push(a); return ''; });
  text = text.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return { text, boards, acts };
}
const forHistory = raw => String(raw).replace(/```tafel[ \t]*([^\n]*)\n[\s\S]*?```/g, (_, t) => L(`[An die Tafel geschrieben: ${t.trim() || 'Tafel'}]`, `[Written on the whiteboard: ${t.trim() || 'Whiteboard'}]`)).slice(0, 3000);

export async function render(root, ctx) {
  const { doc } = ctx;
  let mode = ls.get('tutor.mode', 'erklaeren');
  let busy = false, ctrl = null;
  let bIdx = doc.boards.length - 1;

  // ---------- Layout ----------
  const fEl = h('div', { class: 'face' });
  const msgs = h('div', { class: 'msgs', 'aria-live': 'polite' });
  const sugg = h('div', { class: 'suggest' });
  const ta = h('textarea', { rows: 1, placeholder: L('Frag mich etwas zu deinem Skript …', 'Ask me anything about your slides …'), 'aria-label': L('Nachricht', 'Message') });
  typePlaceholder(ta, L('Frag mich etwas zu deinem Skript …', 'Ask me anything about your slides …'), (doc.path?.chapters?.length ? doc.path.chapters.map(c => L('Erklär mir „' + c.title + '“', 'Explain “' + c.title + '”')) : []).concat(L(['Rechne mir ein Beispiel vor', 'Was kommt in der Klausur dran?', 'Frag mich ab', 'Erklär mir das schwierigste Thema'], ['Walk me through an example', 'What’s likely on the exam?', 'Quiz me', 'Explain the hardest topic'])), L('z. B. ', 'e.g. '));
  const send = h('button', { class: 'send', 'aria-label': L('Senden', 'Send'), html: ico('send'), disabled: true });
  const talk = () => openVoice({ doc, onClose: async () => { const m = await import('../app.js'); m.forceRerender(); dispatchEvent(new HashChangeEvent('hashchange')); } });
  const micBtn = h('button', { class: 'micbtn', type: 'button', 'aria-label': L('Sprich mit mir', 'Talk to me'), title: L('Sprich mit mir', 'Talk to me'), html: ico('mic'), onclick: talk });
  const modeBtns = [['erklaeren', L('Erklären', 'Explain')], ['sokratisch', L('Sokratisch', 'Socratic')]].map(([k, l]) => {
    const b = h('button', { class: 'chip' + (mode === k ? ' on' : ''), title: k === 'sokratisch' ? L('Führt dich mit Fragen zur Lösung, statt sie zu verraten', 'Guides you to the answer with questions instead of giving it away') : L('Erklärt direkt', 'Explains directly') }, l);
    b.addEventListener('click', () => { mode = k; ls.set('tutor.mode', k); modeBtns.forEach(x => x.classList.toggle('on', x === b)); });
    return b;
  });
  const spiceSel = h('select', { class: 'field spice', title: L('Arroganz-Level', 'Arrogance level'), 'aria-label': L('Arroganz-Level', 'Arrogance level') }, SPICE.map(([v, l]) => h('option', { value: v, selected: v === getSpice() }, (matchMedia('(max-width: 760px)').matches ? '' : L('Arroganz: ', 'Arrogance: ')) + l)));
  spiceSel.addEventListener('change', () => { setSpice(+spiceSel.value); fc.pulse(+spiceSel.value === 3 ? 'smug' : 'happy', 1200); });
  const chatcol = h('section', { class: 'chatcol' },
    h('div', { class: 'chathead' }, fEl, h('div', { style: { flex: 1, minWidth: 0 } }, h('b', {}, NAME), h('span', {}, L('KI-Tutor · kennt „' + doc.name + '“', 'AI tutor · knows “' + doc.name + '”'))), spiceSel,
      h('button', { class: 'btn sm talkbtn', type: 'button', onclick: talk }, h('span', { html: ico('mic') }), h('span', { class: 'lbl' }, L('Sprechen', 'Talk'))),
      h('button', { class: 'iconbtn mob-only', 'aria-label': L('Tafel zeigen', 'Show whiteboard'), html: ico('board'), onclick: () => showBoard(true) })),
    msgs, sugg,
    h('div', { class: 'composer' }, h('div', { class: 'box' }, ta, micBtn, send), h('div', { class: 'opts' }, h('span', {}, L('Modus', 'Mode')), ...modeBtns, h('span', { style: { marginLeft: 'auto' } }, L('1 Einheit', '1 credit')))));
  const btitle = h('div', { class: 'tt' });
  const bcount = h('span', { class: 'cnt' });
  const prev = h('button', { class: 'iconbtn', 'aria-label': L('Vorherige Tafel', 'Previous whiteboard'), html: ico('left'), onclick: () => go(-1) });
  const next = h('button', { class: 'iconbtn', 'aria-label': L('Nächste Tafel', 'Next whiteboard'), html: ico('right'), onclick: () => go(1) });
  const area = h('div', { class: 'boardarea dots' });
  const boardcol = h('section', { class: 'boardcol' },
    h('div', { class: 'boardbar' }, h('span', { html: ico('board') }), btitle, bcount, prev, next,
      h('button', { class: 'iconbtn mob-only', 'aria-label': L('Tafel schließen', 'Close whiteboard'), html: ico('x'), onclick: () => showBoard(false) })),
    area);
  const tutor = h('div', { class: 'tutor' }, chatcol, boardcol);
  root.appendChild(tutor);
  const fc = face(fEl);
  const showBoard = v => tutor.classList.toggle('showboard', v);

  // ---------- Tafel ----------
  function drawBoard() {
    const b = doc.boards[bIdx];
    bcount.textContent = doc.boards.length ? `${bIdx + 1} / ${doc.boards.length}` : '';
    prev.disabled = bIdx <= 0; next.disabled = bIdx >= doc.boards.length - 1;
    if (!b) {
      btitle.textContent = L('Tafel', 'Whiteboard');
      const ef = h('div', { class: 'face' });
      area.replaceChildren(h('div', { class: 'tafel' }, h('div', { class: 'empty-board' }, ef, h('b', {}, L('Hier schreibe ich hin.', 'This is where I write.')), h('p', {}, L('Rechnungen, Skizzen, T-Konten und Beispiele erscheinen live an der Tafel.', 'Calculations, sketches, T-accounts and examples appear live on the whiteboard.')))));
      face(ef);
      return;
    }
    btitle.textContent = b.title;
    const t = h('div', { class: 'tafel' }, h('h2', { class: 'tt' }, b.title));
    t.appendChild(sanitize(b.html));
    area.replaceChildren(t);
    area.scrollTop = 0;
  }
  function go(d) { bIdx = Math.max(0, Math.min(doc.boards.length - 1, bIdx + d)); drawBoard(); }
  drawBoard();

  // ---------- Nachrichten ----------
  function addMsg(role, raw, { animate = false, boardRefs = [], nofav = false, model, tools } = {}) {
    const el = h('div', { class: 'msg ' + (role === 'user' ? 'me' : 'ai') });
    if (role === 'user') { el.textContent = raw; msgs.appendChild(el); scroll(); return el; }
    const p = parse(raw);
    const body = h('div');
    el.appendChild(body);
    const extras = h('div');
    boardRefs.forEach(({ idx, title }) => extras.appendChild(h('button', { class: 'boardlink', onclick: () => { bIdx = idx; drawBoard(); showBoard(true); } }, h('span', { html: ico('board') }), title)));
    if (model !== undefined) extras.appendChild(aiTag(tools, raw, doc.generated ? 'max' : 'doc'));
    if (!nofav && (p.text || '').length > 60) extras.appendChild(h('div', { class: 'favrow' }, starBtn(() => ({ typ: 'erklaerung', titel: plain(p.text).slice(0, 90), doc: doc.id, docName: doc.name, ref: textKey(p.text), inhalt: plain(p.text) }), { label: true, cls: 'sm' })));
    if (p.acts.length) extras.appendChild(h('div', { class: 'acts' }, p.acts.map(a => h('a', { class: 'btn sm', href: ACTIONS[a][1](doc) }, ACTIONS[a][0], h('span', { html: ico('right') })))));
    msgs.appendChild(el);
    if (animate) typeOut(body, p.text || (p.boards.length ? L('Schau an die Tafel.', 'Look at the whiteboard.') : '…')).then(() => { el.appendChild(extras); scroll(); });
    else { body.appendChild(richText(p.text || (p.boards.length ? L('Schau an die Tafel.', 'Look at the whiteboard.') : ''))); el.appendChild(extras); }
    scroll();
    return el;
  }
  async function typeOut(el, text) {
    fc.set('talk');
    await typeIt(el, text, { scroll });
    fc.set('idle');
  }
  const scroll = () => { msgs.scrollTop = msgs.scrollHeight; };

  // Verlauf wiederherstellen
  let boardCursor = 0;
  const boardOwners = doc.chat.map(m => m.role === 'assistant' ? parse(m.content).boards.length : 0);
  if (!doc.chat.length) {
    addMsg('assistant', say('welcome', doc.name), { nofav: true });
  } else {
    doc.chat.forEach((m, k) => {
      const refs = [];
      for (let j = 0; j < boardOwners[k]; j++) { if (doc.boards[boardCursor]) refs.push({ idx: boardCursor, title: doc.boards[boardCursor].title }); boardCursor++; }
      addMsg(m.role, m.content, { boardRefs: refs, model: m.role === 'assistant' ? m.model : undefined, tools: m.tools });
    });
  }
  const sug = L(['Erklär mir das wichtigste Thema an der Tafel', 'Rechne mir ein Beispiel vor', 'Frag mich ab', 'Was kommt wahrscheinlich in der Klausur dran?'], ['Explain the most important topic on the whiteboard', 'Walk me through a worked example', 'Quiz me', 'What’s likely to come up in the exam?']);
  const drawSugg = () => sugg.replaceChildren(...(doc.chat.length > 2 ? [] : sug.map(s => h('button', { class: 'chip', onclick: () => submit(s) }, s))));
  drawSugg();

  // ---------- Senden ----------
  async function submit(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true; send.disabled = true; ta.value = ''; autosize();
    addMsg('user', text);
    doc.chat.push({ role: 'user', content: text });
    sugg.replaceChildren();
    const typing = h('div', { class: 'msg ai' }, h('span', { class: 'typing' }, h('i'), h('i'), h('i')));
    msgs.appendChild(typing); scroll();
    fc.set('think');
    ctrl = new AbortController();
    try {
      const history = doc.chat.slice(-12).map(m => ({ role: m.role, content: m.role === 'assistant' ? forHistory(m.content) : m.content }));
      const r = await ask('chat', { material: forChat(doc, text + ' ' + doc.chat.slice(-3).map(m => m.content).join(' ')), docName: doc.name, messages: history, opts: { mode, spice: getSpice() } }, { signal: ctrl.signal });
      typing.remove();
      const raw = r.text || '';
      doc.chat.push({ role: 'assistant', content: raw, model: r.model || '', tools: r.tools || [] });
      const p = parse(raw);
      const refs = [];
      p.boards.forEach(b => { doc.boards.push({ ...b, at: Date.now() }); refs.push({ idx: doc.boards.length - 1, title: b.title }); });
      if (doc.chat.length > 80) doc.chat = doc.chat.slice(-80);
      if (doc.boards.length > 60) { const cut = doc.boards.length - 60; doc.boards = doc.boards.slice(cut); refs.forEach(x => x.idx -= cut); }
      save(doc);
      if (p.boards.length) { bIdx = refs[0].idx; drawBoard(); if (matchMedia('(max-width: 980px)').matches) setTimeout(() => showBoard(true), 600); }
      addMsg('assistant', raw, { animate: true, boardRefs: refs, model: r.model || '', tools: r.tools || [] });
    } catch (e) {
      typing.remove(); fc.set('sad'); setTimeout(() => fc.set('idle'), 1500);
      doc.chat.pop(); save(doc);
      ta.value = text; autosize();
      msgs.lastElementChild?.classList.contains('me') && msgs.lastElementChild.remove();
      apiError(e, () => submit(text));
    } finally { busy = false; send.disabled = !ta.value.trim(); ctrl = null; }
  }
  const autosize = () => { ta.style.height = 'auto'; ta.style.height = Math.min(160, ta.scrollHeight) + 'px'; send.disabled = busy || !ta.value.trim(); };
  ta.addEventListener('input', autosize);
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(ta.value); } });
  send.addEventListener('click', () => submit(ta.value));

  // Frage aus anderem Bereich (Quiz, Trainer, Übersicht)?
  const pending = ls.get('tutor.pendingAsk', null);
  if (pending) { ls.set('tutor.pendingAsk', null); setTimeout(() => submit(pending), 250); }
  else setTimeout(() => ta.focus({ preventScroll: true }), 100);

  return () => { ctrl && ctrl.abort(); };
}
