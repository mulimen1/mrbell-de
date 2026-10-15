// Tutor: Chat links, Tafel rechts. Die KI schreibt Erklärungen als ```tafel-Blöcke an die Tafel.
import { h, ico, ls, sleep, toast } from '../util.js';
import { face } from '../face.js';
import { ask } from '../api.js';
import { save } from '../state.js';
import { forChat } from '../retrieve.js';
import { apiError } from '../ui.js';
import { sanitize, richText } from '../sanitize.js';
import { say, SPICE, getSpice, setSpice, NAME } from '../max.js';
import { openVoice } from '../voice.js';

const ACTIONS = {
  quiz: ['Quiz dazu starten', d => `#/app/${d.id}/quiz`],
  karten: ['Karteikarten dazu', d => `#/app/${d.id}/karten`],
  'trainer:buchung': ['Buchungssatz-Trainer', () => '#/app/trainer/buchung'],
  'trainer:breakeven': ['Break-even-Trainer', () => '#/app/trainer/breakeven'],
  'trainer:kapitalwert': ['Kapitalwert-Trainer', () => '#/app/trainer/kapitalwert'],
  'trainer:markt': ['Angebot & Nachfrage', () => '#/app/trainer/markt'],
  'trainer:tkonten': ['T-Konten-Trainer', () => '#/app/trainer/tkonten'],
  'trainer:bilanz': ['Bilanz-Trainer', () => '#/app/trainer/bilanz'],
};

export function parse(raw) {
  const boards = [];
  let text = String(raw || '').replace(/```tafel[ \t]*([^\n]*)\n([\s\S]*?)(```|$)/g, (_, title, html) => { boards.push({ title: title.trim() || 'Tafel', html: html.trim() }); return '\n'; });
  const acts = [];
  text = text.replace(/\[\[([a-z:]+)\]\]/g, (_, a) => { if (ACTIONS[a]) acts.push(a); return ''; });
  text = text.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return { text, boards, acts };
}
const forHistory = raw => String(raw).replace(/```tafel[ \t]*([^\n]*)\n[\s\S]*?```/g, (_, t) => `[An die Tafel geschrieben: ${t.trim() || 'Tafel'}]`).slice(0, 3000);

export async function render(root, ctx) {
  const { doc } = ctx;
  let mode = ls.get('tutor.mode', 'erklaeren');
  let busy = false, ctrl = null;
  let bIdx = doc.boards.length - 1;

  // ---------- Layout ----------
  const fEl = h('div', { class: 'face' });
  const msgs = h('div', { class: 'msgs', 'aria-live': 'polite' });
  const sugg = h('div', { class: 'suggest' });
  const ta = h('textarea', { rows: 1, placeholder: 'Frag Max etwas zu deinem Skript …', 'aria-label': 'Nachricht' });
  const send = h('button', { class: 'send', 'aria-label': 'Senden', html: ico('send'), disabled: true });
  const talk = () => openVoice({ doc, onClose: async () => { const m = await import('../app.js'); m.forceRerender(); dispatchEvent(new HashChangeEvent('hashchange')); } });
  const micBtn = h('button', { class: 'micbtn', type: 'button', 'aria-label': 'Mit Max sprechen', title: 'Mit Max sprechen', html: ico('mic'), onclick: talk });
  const modeBtns = [['erklaeren', 'Erklären'], ['sokratisch', 'Sokratisch']].map(([k, l]) => {
    const b = h('button', { class: 'chip' + (mode === k ? ' on' : ''), title: k === 'sokratisch' ? 'Führt dich mit Fragen zur Lösung, statt sie zu verraten' : 'Erklärt direkt' }, l);
    b.addEventListener('click', () => { mode = k; ls.set('tutor.mode', k); modeBtns.forEach(x => x.classList.toggle('on', x === b)); });
    return b;
  });
  const spiceSel = h('select', { class: 'field spice', title: 'Arroganz-Level', 'aria-label': 'Arroganz-Level' }, SPICE.map(([v, l]) => h('option', { value: v, selected: v === getSpice() }, 'Arroganz: ' + l)));
  spiceSel.addEventListener('change', () => { setSpice(+spiceSel.value); fc.pulse(+spiceSel.value === 3 ? 'smug' : 'happy', 1200); });
  const chatcol = h('section', { class: 'chatcol' },
    h('div', { class: 'chathead' }, fEl, h('div', { style: { flex: 1, minWidth: 0 } }, h('b', {}, NAME), h('span', {}, 'kennt „' + doc.name + '“')), spiceSel,
      h('button', { class: 'btn sm talkbtn', type: 'button', onclick: talk }, h('span', { html: ico('mic') }), h('span', { class: 'lbl' }, 'Sprechen')),
      h('button', { class: 'iconbtn mob-only', 'aria-label': 'Tafel zeigen', html: ico('board'), onclick: () => showBoard(true) })),
    msgs, sugg,
    h('div', { class: 'composer' }, h('div', { class: 'box' }, ta, micBtn, send), h('div', { class: 'opts' }, h('span', {}, 'Modus'), ...modeBtns, h('span', { style: { marginLeft: 'auto' } }, '1 Einheit'))));
  const btitle = h('div', { class: 'tt' });
  const bcount = h('span', { class: 'cnt' });
  const prev = h('button', { class: 'iconbtn', 'aria-label': 'Vorherige Tafel', html: ico('left'), onclick: () => go(-1) });
  const next = h('button', { class: 'iconbtn', 'aria-label': 'Nächste Tafel', html: ico('right'), onclick: () => go(1) });
  const area = h('div', { class: 'boardarea dots' });
  const boardcol = h('section', { class: 'boardcol' },
    h('div', { class: 'boardbar' }, h('span', { html: ico('board') }), btitle, bcount, prev, next,
      h('button', { class: 'iconbtn mob-only', 'aria-label': 'Tafel schließen', html: ico('x'), onclick: () => showBoard(false) })),
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
      btitle.textContent = 'Tafel';
      const ef = h('div', { class: 'face' });
      area.replaceChildren(h('div', { class: 'tafel' }, h('div', { class: 'empty-board' }, ef, h('b', {}, 'Hier schreibe ich hin.'), h('p', {}, 'Rechnungen, Skizzen, T-Konten und Beispiele erscheinen live an der Tafel.'))));
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
  function addMsg(role, raw, { animate = false, boardRefs = [] } = {}) {
    const el = h('div', { class: 'msg ' + (role === 'user' ? 'me' : 'ai') });
    if (role === 'user') { el.textContent = raw; msgs.appendChild(el); scroll(); return el; }
    const p = parse(raw);
    const body = h('div');
    el.appendChild(body);
    const extras = h('div');
    boardRefs.forEach(({ idx, title }) => extras.appendChild(h('button', { class: 'boardlink', onclick: () => { bIdx = idx; drawBoard(); showBoard(true); } }, h('span', { html: ico('board') }), title)));
    if (p.acts.length) extras.appendChild(h('div', { class: 'acts' }, p.acts.map(a => h('a', { class: 'btn sm', href: ACTIONS[a][1](doc) }, ACTIONS[a][0], h('span', { html: ico('right') })))));
    msgs.appendChild(el);
    if (animate) typeOut(body, p.text || (p.boards.length ? 'Schau an die Tafel.' : '…')).then(() => { el.appendChild(extras); scroll(); });
    else { body.appendChild(richText(p.text || (p.boards.length ? 'Schau an die Tafel.' : ''))); el.appendChild(extras); }
    scroll();
    return el;
  }
  async function typeOut(el, text) {
    fc.set('talk');
    const words = text.split(/(\s+)/);
    let out = '';
    for (let k = 0; k < words.length; k++) {
      out += words[k];
      if (k % 3 === 0 || k === words.length - 1) { el.replaceChildren(richText(out)); scroll(); await sleep(16); }
      if (!el.isConnected) break;
    }
    el.replaceChildren(richText(text));
    fc.set('idle');
  }
  const scroll = () => { msgs.scrollTop = msgs.scrollHeight; };

  // Verlauf wiederherstellen
  let boardCursor = 0;
  const boardOwners = doc.chat.map(m => m.role === 'assistant' ? parse(m.content).boards.length : 0);
  if (!doc.chat.length) {
    addMsg('assistant', say('welcome', doc.name));
  } else {
    doc.chat.forEach((m, k) => {
      const refs = [];
      for (let j = 0; j < boardOwners[k]; j++) { if (doc.boards[boardCursor]) refs.push({ idx: boardCursor, title: doc.boards[boardCursor].title }); boardCursor++; }
      addMsg(m.role, m.content, { boardRefs: refs });
    });
  }
  const sug = ['Erklär mir das wichtigste Thema an der Tafel', 'Rechne mir ein Beispiel vor', 'Frag mich ab', 'Was kommt wahrscheinlich in der Klausur dran?'];
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
      doc.chat.push({ role: 'assistant', content: raw });
      const p = parse(raw);
      const refs = [];
      p.boards.forEach(b => { doc.boards.push({ ...b, at: Date.now() }); refs.push({ idx: doc.boards.length - 1, title: b.title }); });
      if (doc.chat.length > 80) doc.chat = doc.chat.slice(-80);
      if (doc.boards.length > 60) { const cut = doc.boards.length - 60; doc.boards = doc.boards.slice(cut); refs.forEach(x => x.idx -= cut); }
      save(doc);
      if (p.boards.length) { bIdx = refs[0].idx; drawBoard(); if (matchMedia('(max-width: 980px)').matches) setTimeout(() => showBoard(true), 600); }
      addMsg('assistant', raw, { animate: true, boardRefs: refs });
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
