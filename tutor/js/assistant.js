// Schwebender Max – ohne Chatbox. Kopf unten rechts → Antippen: schwebende Leiste, Max hört sofort zu.
// Antworten kommen als Stimme + mitlaufender Untertitel, Erklärungen als Tafel direkt über der Seite,
// Befehle (Quiz bauen, Tab öffnen …) führt er selbst aus. Tippen geht mit einem Klick oder einfach lostippen.
import { h, ico, ls, sleep, toast } from './util.js';
import { face } from './face.js';
import { ask } from './api.js';
import { S, save } from './state.js';
import { forChat } from './retrieve.js';
import { apiError, typeOut as typeIt, typePlaceholder, syncOut } from './ui.js';
import { liveWave } from './wave.js';
import { startLive } from './livestt.js';
import { sanitize, richText } from './sanitize.js';
import { getSpice, thinkLines } from './max.js';
import { VOICES, getVoice } from './voice.js';
import { L, setOutLang } from './i18n.js';
import { applyThemeButtons } from './theme.js';

const KEY = 'tutor.assistant', CHAT = 'tutor.assistant.chat';
const M = 12;                       // Mindestabstand zum Rand
const BUB = 56;                     // Größe des Kopfs
const MOB = matchMedia('(max-width: 600px)');
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
const TAB = { hub: L('Übersicht', 'Overview'), plan: L('Klausurplan', 'Exam plan'), tutor: L('Max-Chat & Tafel', 'Max chat & whiteboard'), pfad: L('Lernpfad', 'Study path'), quiz: 'Quiz', karten: L('Karteikarten', 'Flashcards'), podcast: 'Podcast', zettel: L('Lernzettel', 'Study sheet') };
const ACTS = {
  quiz: [L('Quiz dazu', 'Quiz on this'), d => d && `#/app/${d.id}/quiz`],
  karten: [L('Karteikarten', 'Flashcards'), d => d && `#/app/${d.id}/karten`],
};
// Steuerbefehle, die Max ans Ende seiner Antwort schreiben darf (opts.assistant)
const TRAINERS = { buchung: L('Buchungssatz-Trainer', 'Booking entry trainer'), tkonten: L('T-Konten-Trainer', 'T-account trainer'), breakeven: L('Break-even-Trainer', 'Break-even trainer'), kapitalwert: L('Kapitalwert-Trainer', 'NPV trainer'), markt: L('Angebot & Nachfrage', 'Supply & demand'), bilanz: L('Bilanz-Trainer', 'Balance sheet trainer') };
const MAKE = { quiz: ['quiz', L('Quiz wird erstellt', 'Building the quiz')], exam: ['quiz', L('Probeklausur wird erstellt', 'Building the mock exam')], karten: ['karten', L('Karteikarten werden erstellt', 'Making flashcards')], podcast: ['podcast', L('Podcast wird aufgenommen', 'Recording the podcast')], zettel: ['zettel', L('Lernzettel wird geschrieben', 'Writing the study sheet')], pfad: ['pfad', L('Lernpfad wird gebaut', 'Building the study path')] };
const CMD = /\[\[(go|make|topic|trainer|upload|voice|lang|theme)(?::([^\]\n]{1,120}))?\]\]/g;
function cmdOf(k, v) {
  v = (v || '').trim();
  if (k === 'go') return TAB[v] ? { k, v, label: L('Geöffnet: ', 'Opened: ') + TAB[v], doc: true } : null;
  if (k === 'make') return MAKE[v] ? { k, v, label: MAKE[v][1], doc: true } : null;
  if (k === 'topic') return v.length > 1 ? { k, v, label: L(`Kurzskript zu „${v}“`, `Short script on “${v}”`) } : null;
  if (k === 'trainer') return TRAINERS[v] ? { k, v, label: TRAINERS[v] } : null;
  if (k === 'upload') return { k, label: L('Skript hochladen', 'Upload slides') };
  if (k === 'voice') return { k, label: L('Sprachmodus', 'Voice mode') };
  if (k === 'lang') return v === 'de' || v === 'en' ? { k, v, label: v === 'en' ? L('Antworten auf Englisch', 'Answers in English') : L('Antworten auf Deutsch', 'Answers in German') } : null;
  if (k === 'theme') return v === 'dark' || v === 'light' ? { k, v, label: v === 'dark' ? L('Dunkles Design', 'Dark mode') : L('Helles Design', 'Light mode') } : null;
  return null;
}
const SVG = {
  min: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>',
  more: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/></svg>',
  spkOn: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  spkOff: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
  stop: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/></svg>',
};

// ---------- Zustand (persistiert) ----------
const cfg = Object.assign({ on: true, spk: true, bub: null }, ls.get(KEY, {}) || {});
if (cfg.v !== 2) { cfg.v = 2; cfg.spk = true; }
const saveCfg = () => ls.set(KEY, cfg);
export const isAssistantEnabled = () => cfg.on !== false;
let api = null;                    // gesetzt, sobald gemountet
export function setAssistantEnabled(on) {
  cfg.on = !!on; saveCfg();
  if (api) api.applyEnabled(true);
  dispatchEvent(new CustomEvent('asst:change', { detail: cfg.on }));
}

// ---------- Hilfen ----------
function parse(raw) {
  const boards = [];
  let text = String(raw || '').replace(/```tafel[ \t]*([^\n]*)\n([\s\S]*?)(```|$)/g, (_, t, html) => { boards.push({ title: t.trim() || L('Tafel', 'Whiteboard'), html: html.trim() }); return '\n'; });
  const acts = [], cmds = [];
  text = text.replace(CMD, (_, k, v) => { const c = cmdOf(k, v); if (c) cmds.push(c); return ''; });
  text = text.replace(/\[\[([a-z:]+)\]\]/g, (_, a) => { if (ACTS[a]) acts.push(a); return ''; });
  text = text.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return { text, boards, acts, cmds };
}
const forHistory = raw => String(raw).replace(/```tafel[ \t]*([^\n]*)\n[\s\S]*?```/g, (_, t) => L(`[An die Tafel geschrieben: ${t.trim() || 'Tafel'}]`, `[Written on the whiteboard: ${t.trim() || 'Whiteboard'}]`)).slice(0, 2400);
const b64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function route() {
  const p = location.hash.replace(/^#\/?/, '').split('/');
  if (p[0] !== 'app') return { tab: null };
  if (p[1] === 'trainer') return { trainer: p[2] || '', tab: 'trainer' };
  if (!p[1] || p[1] === 'neu') return { tab: p[1] ? 'neu' : 'start' };
  return { docId: p[1], tab: TAB[p[2]] ? p[2] : 'hub', arg: p[3] ? decodeURIComponent(p[3]) : '' };
}
const curDoc = () => { const r = route(); return r.docId && S.doc && S.doc.id === r.docId ? S.doc : null; };
function placeLabel() {
  const r = route(), d = curDoc();
  if (r.tab === 'trainer') return L('BWL-Trainer', 'Business trainer') + (r.trainer ? ' · ' + r.trainer : '');
  if (r.tab === 'start') return L('Start', 'Start');
  if (r.tab === 'neu') return L('Neues Skript', 'New slides');
  return (TAB[r.tab] || '') + (d ? ' · ' + d.name : '');
}
// Was gerade im Hauptbereich zu sehen ist (nur sichtbare Textknoten, gekürzt)
function visibleText(max = 1200) {
  const view = document.getElementById('view');
  if (!view) return '';
  const vr = view.getBoundingClientRect();
  const top = Math.max(0, vr.top), bot = Math.min(innerHeight, vr.bottom);
  const out = []; let len = 0, last = null;
  const tw = document.createTreeWalker(view, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.trim() ? 1 : 3 });
  const seen = new Map();
  for (let n = tw.nextNode(); n && len < max; n = tw.nextNode()) {
    const el = n.parentElement;
    if (!el || el.closest('script,style,.sr,[aria-hidden="true"],textarea,select,.face')) continue;
    let ok = seen.get(el);
    if (ok === undefined) {
      const r = el.getBoundingClientRect();
      ok = r.width > 0 && r.height > 0 && r.bottom > top && r.top < bot && r.right > 0 && r.left < innerWidth;
      if (ok) { const cs = getComputedStyle(el); ok = cs.visibility !== 'hidden' && +cs.opacity !== 0; }
      seen.set(el, ok);
    }
    if (!ok) continue;
    const t = n.nodeValue.replace(/\s+/g, ' ').trim();
    if (t === last) continue;
    last = t; out.push(t); len += t.length + 1;
  }
  // Eingaben (z. B. eigene Antwort im Quiz)
  let s = out.join(' ').replace(/\s+([.,:;!?])/g, '$1');
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
function pageContext() {
  const r = route(), d = curDoc();
  if (!r.tab) return document.getElementById('landing')?.classList.contains('hidden') ? '' : L('[Seite: Startseite von BWL Max – noch kein Skript offen]', '[Page: BWL Max home page – no slides open yet]');
  const parts = [L('Seite: ', 'Page: ') + ((TAB[r.tab] || (r.tab === 'trainer' ? L('BWL-Trainer', 'Business trainer') + (r.trainer ? ' ' + r.trainer : '') : r.tab)))];
  if (d) parts.push(L('Skript „', 'Slides “') + d.name + L('“', '”'));
  const vis = visibleText();
  if (vis) parts.push(L('sichtbar: ', 'visible: ') + vis);
  return '[' + parts.join(' · ') + ']';
}

const KB = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/></svg>';
const CHECK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const SIDE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6l6 6-6 6"/><path d="M4 12h15"/></svg>';

// ---------- Aufbau ----------
export function mountAssistant() {
  if (api) return api;
  const host = document.getElementById('app');
  if (!host) return null;

  let hist = (ls.get(CHAT, []) || []).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-20);
  let open = false, typing = false, state = 'idle', ctrl = null, gen = 0, viaVoice = false;
  let rec = null, stream = null, chunks = [], actx = null, raf = 0, lsess = null;
  let boards = [], bIdx = 0, boardOpen = false, boardMin = false, capTimer = 0;
  const audio = new Audio(); audio.preload = 'auto';

  // ----- Kopf -----
  const bubFace = h('span', { class: 'asst-bf' });
  const bub = h('button', { class: 'asst-bub', type: 'button', 'aria-label': L('Mit Max reden', 'Talk to Max'), title: L('Antippen und lossprechen', 'Tap and start talking') },
    bubFace, h('i', { class: 'asst-dot' }), h('span', { class: 'asst-tip' }, L('Frag mich', 'Ask me')),
    h('span', { class: 'asst-x', title: L('Max ausblenden', 'Hide Max'), html: ico('x') }),
    h('span', { class: 'asst-bs', title: L('Stopp', 'Stop'), html: SVG.stop }));

  // ----- Leiste („Insel“) -----
  const fEl = h('span', { class: 'ai-f' });
  const wave = liveWave(24);
  const stTx = h('span', { class: 'ai-st' });
  const inp = h('input', { class: 'ai-in', type: 'text', enterkeyhint: 'send', autocomplete: 'off', maxlength: 1500, 'aria-label': L('Nachricht an Max', 'Message to Max') });
  typePlaceholder(inp, L('Frag mich was …', 'Ask me anything …'),
    L(['Erklär mir den Kapitalwert', 'Bau mir ein Quiz', 'Was ist der Break-even?', 'Mach mir Karteikarten', 'Was soll ich heute lernen?', 'Erklär mir latente Steuern'], ['Explain net present value', 'Build me a quiz', 'What is break-even?', 'Make me flashcards', 'What should I study today?', 'Explain deferred taxes']), L('z. B. ', 'e.g. '));
  const mid = h('div', { class: 'ai-mid' }, stTx, wave.el, inp);
  const B = (cls, label, html) => h('button', { class: 'ai-b ' + cls, type: 'button', 'aria-label': label, title: label, html });
  const kbBtn = B('ai-kb', L('Tippen', 'Type'), KB);
  const micBtn = B('ai-mic primary', L('Sprechen', 'Speak'), ico('mic'));
  const sendBtn = B('ai-send primary', L('Senden', 'Send'), ico('send'));
  const doneBtn = B('ai-done primary', L('Fertig', 'Done'), CHECK);
  const stopBtn = B('ai-stop primary', L('Stopp', 'Stop'), SVG.stop);
  const muteBtn = B('ai-mute', '', SVG.spkOn);
  const moreBtn = B('ai-more', L('Mehr', 'More'), SVG.more);
  const closeBtn = B('ai-close', L('Einklappen', 'Collapse'), ico('x'));
  const isl = h('div', { class: 'ai-isl', role: 'group', 'aria-label': L('Max', 'Max') },
    h('span', { class: 'ai-fw' }, fEl), mid, kbBtn, muteBtn, moreBtn, micBtn, sendBtn, doneBtn, stopBtn, closeBtn);
  const voiceChips = VOICES.map(([k, l, d]) => h('button', { class: 'chip', type: 'button', title: d, 'data-v': k, onclick: () => { ls.set('tutor.voice', k); drawMenu(); } }, l));
  const menu = h('div', { class: 'ai-menu', role: 'menu', hidden: true },
    h('div', { class: 'eyebrow' }, L('Stimme', 'Voice')), h('div', { class: 'asst-vch' }, voiceChips),
    h('button', { class: 'asst-mi ai-mi-mute', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); muteBtn.click(); } }),
    h('button', { class: 'asst-mi', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); newTalk(); } }, h('span', { html: ico('refresh') }), L('Neues Gespräch', 'New conversation')),
    h('button', { class: 'asst-mi', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); setAssistantEnabled(false); } }, h('span', { html: ico('x') }), L('Max ausblenden', 'Hide Max')));

  // ----- Untertitel-Karte (schwebt über der Leiste, wegwischbar) -----
  // Gespräch als einzelne Blasen, die über der Seite schweben (kein Kasten)
  let capQ = null, capA = null, capX = null, curEx = null;
  const feedList = h('div', { class: 'ai-fl' });
  const feedTog = h('button', { class: 'ai-ft', type: 'button' });
  const srLive = h('div', { class: 'sr', 'aria-live': 'polite' });
  const cap = h('div', { class: 'ai-feed' }, feedTog, feedList, srLive);
  let feedOpen = !MOB.matches;

  // ----- Tafel direkt über der Seite -----
  const bTitle = h('b', {});
  const bCount = h('span', { class: 'cnt' });
  const bPrev = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Vorherige Tafel', 'Previous board'), html: ico('left'), onclick: () => goBoard(-1) });
  const bNext = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Nächste Tafel', 'Next board'), html: ico('right'), onclick: () => goBoard(1) });
  const bMin = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Tafel einklappen', 'Collapse board'), title: L('Einklappen', 'Collapse'), html: SIDE, onclick: () => minBoard(true) });
  const bClose = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Tafel schließen', 'Close board'), html: ico('x'), onclick: () => closeBoard() });
  const bArea = h('div', { class: 'ai-ba dots' });
  const bGrab = h('div', { class: 'ai-grab', 'aria-hidden': 'true' }, h('i'));
  const board = h('section', { class: 'ai-board', role: 'region', 'aria-label': L('Max’ Tafel', 'Max’s board') },
    bGrab, h('div', { class: 'ai-bh' }, h('span', { html: ico('board') }), bTitle, bCount, bPrev, bNext, bMin, bClose), bArea);
  const bTab = h('button', { class: 'ai-btab', type: 'button', 'aria-label': L('Tafel aufklappen', 'Open board') }, h('span', { html: ico('board') }), h('span', {}, L('Tafel', 'Board')));

  const chip = h('button', { class: 'asst-back', type: 'button' }, h('span', { class: 'asst-cf' }), L('Max zurückholen', 'Bring Max back'));
  const root = h('div', { class: 'asst', 'data-state': 'idle' }, board, bTab, cap, isl, menu, bub);
  document.body.appendChild(root);
  const bf = face(bubFace, {}), fc = face(fEl, { follow: false });

  // ---------- Sichtbarkeit ----------
  function applyEnabled(announce) {
    const on = isAssistantEnabled();
    root.classList.toggle('off', !on);
    if (!on) { stopAll(true); setOpen(false); closeBoard(); }
    if (announce && !on) {
      document.querySelector('.asst-back')?.remove();
      document.body.appendChild(chip);
      face(chip.querySelector('.asst-cf'), { follow: false });
      clearTimeout(chip._t); chip._t = setTimeout(() => { chip.classList.add('out'); setTimeout(() => chip.remove(), 300); }, 8000);
    } else if (on) chip.remove();
  }
  chip.addEventListener('click', () => { chip.remove(); setAssistantEnabled(true); toast(L('Bin wieder da.', 'I’m back.')); });

  const coverCheck = () => {
    const covered = !!document.querySelector('body > .voice, body > .modal-bg, .mindmap.mm-full');
    const r = route();
    const mobTutor = r.tab === 'tutor' && matchMedia('(max-width: 980px)').matches;
    const side = document.querySelector('#app .app.sideopen');
    const land = !r.tab && !document.getElementById('landing')?.classList.contains('hidden');
    root.classList.toggle('land', land);
    root.classList.toggle('landtop', land && scrollY < 140);
    root.classList.toggle('covered', covered);
    root.classList.toggle('nobub', mobTutor || !!side);
    // Insel & Untertitel mittig über dem Inhalt (ohne Seitenleiste)
    const sb = document.querySelector('#app:not(.hidden) .side');
    const sr = sb ? sb.getBoundingClientRect() : null;
    root.style.setProperty('--sl', sr && sr.left >= 0 && sr.width > 0 && innerWidth > 760 ? Math.round(sr.right) + 'px' : '0px');
  };
  let ccRaf = 0;
  const coverSoon = () => { if (!ccRaf) ccRaf = requestAnimationFrame(() => { ccRaf = 0; coverCheck(); }); };
  new MutationObserver(coverSoon).observe(document.body, { childList: true });
  new MutationObserver(coverSoon).observe(host, { attributes: true, attributeFilter: ['class'], subtree: true });
  addEventListener('scroll', coverSoon, { passive: true });
  addEventListener('hashchange', coverSoon);

  // ---------- Kopf verschieben ----------
  const vw = () => document.documentElement.clientWidth, vh = () => innerHeight;
  function placeBub() {
    const p = cfg.bub || { r: 18, b: 18 };
    const r = clamp(p.r, 6, vw() - BUB - 6), b = clamp(p.b, 6, vh() - BUB - 6);
    bub.style.right = r + 'px'; bub.style.bottom = `calc(${b}px + env(safe-area-inset-bottom, 0px))`;
    return { r, b };
  }
  addEventListener('resize', () => { placeBub(); coverCheck(); });
  function dragger(el, { start, move, end, threshold = 4 }) {
    el.addEventListener('pointerdown', e => {
      const t = e.target.closest('button, textarea, input, a, .ai-menu');
      if (e.button !== 0 || (t && t !== el)) return;
      if (start && start(e) === false) return;
      const sx = e.clientX, sy = e.clientY; let moved = false;
      const mv = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < threshold) return;
        if (!moved) { moved = true; root.classList.add('dragging'); try { getSelection().removeAllRanges(); } catch (x) {} }
        ev.preventDefault(); move(dx, dy, ev);
      };
      const up = ev => {
        removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        root.classList.remove('dragging'); end && end(moved, ev, ev.clientX - sx, ev.clientY - sy);
      };
      addEventListener('pointermove', mv, { passive: false }); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
  }
  let bubStart = null, justDragged = false;
  dragger(bub, {
    start: () => { bubStart = placeBub(); },
    move: (dx, dy) => {
      const r = clamp(bubStart.r - dx, 6, vw() - BUB - 6), b = clamp(bubStart.b - dy, 6, vh() - BUB - 6);
      bub.style.right = r + 'px'; bub.style.bottom = b + 'px'; cfg.bub = { r, b };
    },
    end: moved => { if (moved) { justDragged = true; setTimeout(() => { justDragged = false; }, 50); saveCfg(); placeBub(); } },
  });
  bub.addEventListener('click', e => {
    if (justDragged) return;
    if (e.target.closest('.asst-x')) { e.stopPropagation(); setAssistantEnabled(false); return; }
    if (e.target.closest('.asst-bs') && state !== 'idle') { e.stopPropagation(); stopAll(); return; }
    setOpen(true, { listen: true });
  });

  // Blasen zur Seite wischen = ausblenden (kommen mit der nächsten Frage wieder)
  dragger(feedList, {
    threshold: 10,
    start: e => { if (e.target.closest('.ai-x button, .ai-x a') || !e.target.closest('.ai-bub')) return false; feedList.style.transition = 'none'; },
    move: (dx, dy) => { if (Math.abs(dy) > Math.abs(dx)) return; feedList.style.transform = `translateX(${dx}px)`; feedList.style.opacity = String(1 - Math.min(.85, Math.abs(dx) / 220)); },
    end: (moved, ev, dx) => {
      feedList.style.transition = ''; feedList.style.transform = ''; feedList.style.opacity = '';
      if (moved) { feedList._sw = Date.now(); }
      if (moved && Math.abs(dx) > 110) dismissCap();
    },
  });
  feedTog.addEventListener('click', () => setFeedOpen(!feedOpen));
  // Tafel am Handy nach unten wegwischen = einklappen
  dragger(bGrab, {
    threshold: 4,
    start: () => { board.style.transition = 'none'; },
    move: (dx, dy) => { board.style.transform = `translateY(${Math.max(0, dy)}px)`; },
    end: (moved, ev, dx, dy) => { board.style.transition = ''; board.style.transform = ''; if (moved && dy > 80) minBoard(true); },
  });
  bTab.addEventListener('click', () => minBoard(false));

  // ---------- Öffnen / Einklappen ----------
  function setOpen(v, { listen = false } = {}) {
    if (v && !isAssistantEnabled()) return;
    if (v === open) { if (v && listen && state === 'idle') startListen(); return; }
    open = !!v;
    root.classList.toggle('open', open);
    closeMenu();
    if (open) {
      unread(false);
      isl.animate([{ opacity: 0, transform: 'translate(-50%, 14px) scale(.92)' }, { opacity: 1, transform: 'translateX(-50%)' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
      if (feedList.children.length) showCap();
      capScroll();
      if (listen) startListen(); else setState(state);
    } else {
      setTyping(false);
      if (state === 'listen') stopListen('stop');
      if (document.activeElement && isl.contains(document.activeElement)) document.activeElement.blur();
    }
  }
  closeBtn.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => {
    if (!open || root.classList.contains('off')) return;
    if (e.key === 'Escape') {
      if (document.querySelector('body > .modal-bg, body > .voice, .mindmap.mm-full')) return;
      if (!menu.hidden) { closeMenu(); return; }
      e.preventDefault();
      if (state === 'listen') { stopListen('stop'); return; }
      setOpen(false); return;
    }
    // Laptop: einfach lostippen
    const a = document.activeElement;
    if (!typing && e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey && (!a || a === document.body || root.contains(a)) && !document.querySelector('body > .modal-bg')) {
      if (state === 'listen') stopListen('stop');
      setTyping(true);
    }
  });

  // ---------- Tippen ----------
  function setTyping(v) {
    typing = !!v;
    root.classList.toggle('typing', typing);
    if (typing) { listenTok++; if (state === 'listen') stopListen('stop'); inp.focus({ preventScroll: true }); }
    else inp.blur();
    drawButtons();
  }
  kbBtn.addEventListener('click', () => setTyping(true));
  inp.addEventListener('input', drawButtons);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendTyped(); } if (e.key === 'Escape') { e.preventDefault(); setTyping(false); } });
  sendBtn.addEventListener('click', () => sendTyped());
  function sendTyped() { const t = inp.value.trim(); if (!t) { inp.focus(); return; } inp.value = ''; viaVoice = false; setTyping(false); submit(t); }

  // ---------- Knöpfe je nach Zustand ----------
  function drawButtons() {
    const s = state;
    const show = (b, v) => { b.hidden = !v; };
    show(kbBtn, s === 'idle' && !typing && !MOB.matches);
    show(moreBtn, s === 'idle' && !typing);
    show(muteBtn, s === 'speak' || s === 'think' || (s === 'idle' && !typing && !MOB.matches));
    show(micBtn, s === 'idle' && !(typing && inp.value.trim()));
    show(sendBtn, s === 'idle' && typing && !!inp.value.trim());
    show(doneBtn, s === 'listen');
    show(stopBtn, s === 'think' || s === 'speak');
    show(closeBtn, true);
    muteBtn.innerHTML = cfg.spk ? SVG.spkOn : SVG.spkOff;
    muteBtn.classList.toggle('off', !cfg.spk);
    const ml = cfg.spk ? L('Max stumm schalten', 'Mute Max') : L('Max laut schalten', 'Unmute Max');
    muteBtn.setAttribute('aria-label', ml); muteBtn.title = ml;
  }
  muteBtn.addEventListener('click', () => {
    cfg.spk = !cfg.spk; saveCfg();
    audio.muted = !cfg.spk;
    if (cfg.spk) unlockAudio();
    drawButtons();
    toast(cfg.spk ? L('Max redet wieder.', 'Max talks again.') : L('Max ist stumm – er schreibt nur noch.', 'Max is muted – text only.'));
  });
  micBtn.addEventListener('click', () => { setTyping(false); startListen(); });
  doneBtn.addEventListener('click', () => stopListen());
  stopBtn.addEventListener('click', () => stopAll());

  // ---------- Menü ----------
  function drawMenu() {
    const v = getVoice(); voiceChips.forEach(c => c.classList.toggle('on', c.dataset.v === v));
    menu.querySelector('.ai-mi-mute').replaceChildren(h('span', { html: cfg.spk ? SVG.spkOff : SVG.spkOn }), cfg.spk ? L('Max stumm schalten', 'Mute Max') : L('Max wieder laut', 'Unmute Max'));
  }
  function closeMenu() { menu.hidden = true; moreBtn.setAttribute('aria-expanded', 'false'); }
  moreBtn.addEventListener('click', e => { e.stopPropagation(); if (menu.hidden) { drawMenu(); menu.hidden = false; moreBtn.setAttribute('aria-expanded', 'true'); } else closeMenu(); });
  document.addEventListener('pointerdown', e => { if (!menu.hidden && !menu.contains(e.target) && !moreBtn.contains(e.target)) closeMenu(); });
  function newTalk() { stopAll(true); hist = []; ls.set(CHAT, []); feedList.replaceChildren(); curEx = null; markLast(); dismissCap(); closeBoard(); toast(L('Neues Gespräch.', 'New conversation.')); }

  // ---------- Zustand ----------
  function setState(s, msg) {
    state = s; root.dataset.state = s;
    fc.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
    bf.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
    stTx.textContent = msg ?? ({ idle: L('Tippen oder sprechen', 'Type or talk'), listen: L('Max hört zu …', 'Max is listening …'), think: L('Max überlegt …', 'Max is thinking …'), speak: L('Max redet …', 'Max is talking …') })[s];
    if (s === 'speak') wave.talk(); else if (s !== 'listen') wave.stop();
    drawButtons();
  }
  stTx.addEventListener('click', () => { if (state === 'idle') setTyping(true); });
  function unread(v) { root.classList.toggle('unread', !!v); }

  // ---------- Untertitel ----------
  function showCap() { const was = root.classList.contains('has-cap'); root.classList.add('has-cap'); if (!was) capScroll(); }
  function dismissCap() { root.classList.remove('has-cap'); }
  function setFeedOpen(v) { feedOpen = !!v; root.classList.toggle('feed-open', feedOpen); drawTog(); capScroll(); }
  function drawTog() {
    const n = feedList.querySelectorAll('.ai-bub').length, older = n - feedList.querySelectorAll('.ai-bub.last').length;
    feedTog.hidden = older < 1;
    feedTog.replaceChildren(h('span', { html: ico(feedOpen ? 'down' : 'up') }), feedOpen ? L('Einklappen', 'Collapse') : L('Verlauf', 'History'));
  }
  function markLast() {
    feedList.querySelectorAll('.ai-bub.last').forEach(b => b.classList.remove('last'));
    if (curEx) { curEx.q.classList.add('last'); curEx.a.classList.add('last'); }
    const all = [...feedList.children]; while (all.length > 40) all.shift().remove();
    drawTog();
  }
  function bubPair(qText, live) {
    const q = h('div', { class: 'ai-bub me' + (live ? ' live' : '') }, qText);
    const aTx = h('div', { class: 'ai-a' }), aX = h('div', { class: 'ai-x' });
    const a = h('div', { class: 'ai-bub max', hidden: true }, aTx, aX);
    feedList.append(q, a);
    return { q, a, aTx, aX, done: false };
  }
  function newEx(t, live) { curEx = bubPair(t, live); capQ = curEx.q; capA = curEx.aTx; capX = curEx.aX; markLast(); }
  function endEx() { if (curEx) curEx.done = true; }
  function dropEx() { if (curEx && !curEx.done) { curEx.q.remove(); curEx.a.remove(); curEx = null; capQ = capA = capX = null; markLast(); } }
  function capQuestion(t, live = false) {
    showCap();
    if (!curEx || curEx.done) newEx(t, live);
    capQ.textContent = t; capQ.classList.toggle('live', live);
    capScroll();
  }
  function capScroll() { requestAnimationFrame(() => { cap.scrollTop = cap.scrollHeight; }); }
  function capThinking() { if (!curEx) return; curEx.a.hidden = false; capA.replaceChildren(h('span', { class: 'typing' }, h('i'), h('i'), h('i'))); capScroll(); }
  // Verlauf beim Start (zum Nachlesen)
  hist.slice(-12).forEach((m, i, arr) => {
    if (m.role === 'user') { const nx = arr[i + 1]; const pr = bubPair(m.content.replace(/^\[[^\]]*\]\n/, '')); if (nx?.role === 'assistant') { pr.a.hidden = false; pr.aTx.appendChild(richText(parse(nx.content).text || '…')); } pr.done = true; }
  });
  setFeedOpen(feedOpen);
  function capIdleLater() {}
  // Handy: Tippen auf eine Blase klappt den Verlauf auf
  feedList.addEventListener('click', e => { if (Date.now() - (feedList._sw || 0) < 400) return; if (!feedOpen && e.target.closest('.ai-bub') && !e.target.closest('button,a')) setFeedOpen(true); });

  // ---------- Tafel ----------
  function goBoard(d) { if (!boards.length) return; bIdx = clamp(bIdx + d, 0, boards.length - 1); drawBoard(false); }
  function drawBoard(write) {
    const b = boards[bIdx]; if (!b) return;
    bTitle.textContent = b.title; bCount.textContent = boards.length > 1 ? `${bIdx + 1} / ${boards.length}` : '';
    bPrev.hidden = bNext.hidden = boards.length < 2;
    const t = h('div', { class: 'tafel' }, h('h2', { class: 'tt' }, b.title));
    t.appendChild(sanitize(b.html));
    bArea.replaceChildren(t); bArea.scrollTop = 0;
    if (write) t.classList.add('ai-write');
    return t;
  }
  function openBoard() { boardOpen = true; root.classList.add('has-board'); minBoard(false, true); }
  function minBoard(v, quiet) {
    boardMin = !!v; root.classList.toggle('board-min', boardMin);
    if (!quiet && !v) board.animate([{ opacity: 0, transform: 'translateX(30px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function closeBoard() { boardOpen = false; boardMin = false; root.classList.remove('has-board', 'board-min'); }
  // Tafel „schreibt mit“: Abschnitte erscheinen im Takt der Stimme
  function writeAlong(t, progress) {
    const kids = [...t.children].filter(k => !k.classList.contains('tt'));
    kids.forEach(k => k.classList.add('ai-hide'));
    return new Promise(res => {
      const tick = () => {
        if (!t.isConnected) return res();
        const f = progress();
        const n = Math.ceil(clamp(f * 1.15, 0, 1) * kids.length);
        kids.forEach((k, i) => { if (i < n && k.classList.contains('ai-hide')) { k.classList.remove('ai-hide'); k.classList.add('ai-shown'); } });
        if (f >= 1 || n >= kids.length) { kids.forEach(k => k.classList.remove('ai-hide')); return res(); }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // ---------- Befehle ausführen ----------
  const sleepUntil = async (fn, ms = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const x = fn(); if (x) return x; await sleep(120); } return null; };
  async function nav(hash, force) {
    if (force) { try { (await import('./app.js')).forceRerender(); } catch (e) {} }
    if (location.hash === hash) dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = hash;
  }
  function cmdChip(c) {
    if (c.k === 'upload' || c.k === 'voice') {
      const b = h('button', { class: 'ai-cmd tap', type: 'button', onclick: () => runCmd(c, b) }, h('span', { class: 'ck', html: ico(c.k === 'upload' ? 'upload' : 'mic') }), c.label);
      return b;
    }
    const el = h('span', { class: 'ai-cmd run' }, h('span', { class: 'ck', html: CHECK }), c.label);
    setTimeout(() => runCmd(c, el), 0);
    return el;
  }
  async function runCmd(c, chipEl) {
    const fail = msg => { chipEl.classList.remove('run'); chipEl.classList.add('no'); chipEl.replaceChildren(h('span', { class: 'ck', html: ico('x') }), msg); };
    const ok = () => { chipEl.classList.remove('run'); chipEl.classList.add('ok'); if (['go', 'make', 'trainer', 'topic'].includes(c.k) && feedOpen) setFeedOpen(false); };   // Seite frei machen
    const d = curDoc() || S.doc;
    if (c.doc && !d) return fail(L('Dafür brauch ich ein Skript – lad eins hoch.', 'I need slides for that – upload some.'));
    try {
      if (c.k === 'go') await nav(`#/app/${d.id}/${c.v}`);
      else if (c.k === 'make') {
        if (c.v === 'exam') {
          await nav(`#/app/${d.id}/quiz`, true);
          const btn = await sleepUntil(() => [...document.querySelectorAll('#view .tile h3')].find(x => /Probeklausur|Mock exam/.test(x.textContent))?.closest('button'));
          if (!btn) return fail(L('Probeklausur nicht gefunden.', 'Mock exam not found.'));
          btn.click();
        } else await nav(`#/app/${d.id}/${MAKE[c.v][0]}/auto`, true);
      }
      else if (c.k === 'topic') { ls.set('tutor.target', null); const m = await import('./app.js'); m.startTopic(c.v); }
      else if (c.k === 'trainer') await nav('#/app/trainer/' + c.v);
      else if (c.k === 'upload') { const f = document.getElementById('fileApp'); if (!f) { await nav('#/app'); } const f2 = await sleepUntil(() => document.getElementById('fileApp'), 2000); if (!f2) return fail(L('Upload gerade nicht möglich.', 'Upload not available right now.')); f2.click(); }
      else if (c.k === 'voice') {
        stopAll(true);
        const { openVoice } = await import('./voice.js');
        openVoice({ doc: curDoc(), onClose: async () => { try { (await import('./app.js')).forceRerender(); } catch (e) {} dispatchEvent(new HashChangeEvent('hashchange')); } });
      }
      else if (c.k === 'lang') setOutLang(c.v);
      else if (c.k === 'theme') { document.documentElement.dataset.theme = c.v; try { sessionStorage.setItem('tutor.theme', c.v); } catch (e) {} applyThemeButtons(); }
      ok();
    } catch (e) { console.warn(e); fail(L('Das hat nicht geklappt.', 'That didn’t work.')); }
  }

  // ---------- Fragen & Antworten ----------
  async function submit(text) {
    text = String(text || '').trim();
    if (!text || state === 'think') return;
    if (state === 'speak') { try { audio.pause(); } catch (e) {} }
    unlockAudio();
    capQuestion(text); capQ.classList.remove('live'); capThinking();
    const ex = curEx;
    const ctxLine = pageContext();
    hist.push({ role: 'user', content: text });
    setState('think');
    const my = ++gen, spoken = !!cfg.spk;
    ctrl = new AbortController();
    try {
      const messages = hist.slice(-12).map(m => ({ role: m.role, content: m.role === 'assistant' ? forHistory(m.content) : m.content }));
      if (ctxLine) messages[messages.length - 1].content = ctxLine + '\n' + text;
      const payload = { messages, opts: { mode: 'erklaeren', spice: getSpice(), voice: spoken, assistant: true } };
      const d = curDoc();
      if (d) Object.assign(payload, { material: forChat(d, text + ' ' + visibleText(400)), docName: d.name });
      const r = await ask('chat', payload, { signal: ctrl.signal });
      if (my !== gen) return;
      const raw = String(r.text || '').slice(0, 12000);
      hist.push({ role: 'assistant', content: raw });
      hist = hist.slice(-20); ls.set(CHAT, hist);
      await answer(raw, my, spoken, ex);
    } catch (e) {
      if (hist[hist.length - 1]?.role === 'user' && hist[hist.length - 1].content === text) hist.pop();
      if (ex) { ex.aTx.replaceChildren(); ex.a.hidden = true; ex.done = true; }
      if (my !== gen) return;
      setState('idle', e?.name === 'AbortError' ? L('Gestoppt.', 'Stopped.') : undefined);
      if (e?.name !== 'AbortError') { fc.pulse('sad', 1400); apiError(e, () => submit(text)); }
    } finally { if (my === gen) ctrl = null; }
  }

  async function answer(raw, my, spoken, ex) {
    const p = parse(raw);
    const txt = p.text || (p.boards.length ? L('Schau an die Tafel.', 'Look at the board.') : p.cmds.length ? L('Mach ich.', 'On it.') : '…');
    const aEl = ex.aTx;
    // Tafel(n) auf die Seite – und ins Skript, damit sie auch im Tafel-Tab liegen
    let t = null;
    if (p.boards.length) {
      const d = curDoc();
      if (d) { p.boards.forEach(b => d.boards.push({ ...b, at: Date.now() })); save(d); }
      boards = boards.concat(p.boards).slice(-12); bIdx = boards.length - p.boards.length;
      t = drawBoard(true); openBoard();
    }
    else if (boardOpen && !boardMin) minBoard(true, true);   // neue Antwort ohne Tafel: alte Tafel zur Seite, Seite frei
    // Befehle sofort ausführen, als kleine Häkchen unter der Antwort
    const acts = p.acts.map(a => ({ a, href: ACTS[a][1](curDoc() || S.doc) })).filter(x => x.href);
    const extras = [...p.cmds.map(c => cmdChip(c)), ...acts.map(({ a, href }) => h('a', { class: 'ai-cmd link', href }, ACTS[a][0]))];
    if (p.boards.length) extras.push(h('button', { class: 'ai-cmd link bshow', type: 'button', onclick: () => { openBoard(); } }, h('span', { class: 'ck', html: ico('board') }), L('Tafel zeigen', 'Show board')));
    ex.aX.replaceChildren(...extras);
    srLive.textContent = txt.replace(/[*_#`]/g, '').slice(0, 600);
    if (!open) unread(true);
    const willSpeak = spoken && cfg.spk && !!p.text;
    if (willSpeak) {
      await speak(p.text, my, txt, t, ex);
    } else {
      setState('idle'); fc.pulse('happy', 900);
      const pr = typeIt(aEl, txt, { scroll: capScroll });
      if (t) { const t0 = performance.now(), dur = Math.max(1200, txt.split(/\s+/).length * 30); writeAlong(t, () => (performance.now() - t0) / dur); }
      ex.done = true;
      await pr;
      if (my === gen) afterAnswer(p);
    }
  }
  function afterAnswer() {
    // Sprachgespräch: Max hört danach direkt weiter zu
    if (viaVoice && open && state === 'idle' && !typing && !document.hidden) setTimeout(() => { if (viaVoice && open && state === 'idle' && !typing && !document.hidden) startListen({ followup: true }); }, 450);
  }

  // ---------- Vorlesen (Text + Tafel laufen mit der Stimme) ----------
  function unlockAudio() { if (state === 'speak') return; try { audio.src = SILENT; audio.play().catch(() => {}); } catch (e) {} }
  async function speak(text, my, txt, t, ex) {
    const aEl = ex.aTx;
    let shown = false;
    // Ohne Ton: ganzen Text in SEINE Blase (nie in eine neuere)
    const showNow = (instant) => { if (shown) return; shown = true; ex.done = true; if (instant) aEl.replaceChildren(richText(txt)); else typeIt(aEl, txt, { scroll: capScroll }); if (t) writeAlong(t, () => 1); capScroll(); };
    capThinking();
    try {
      const r = await ask('tts', { text: text.slice(0, 2500), opts: { voice: getVoice() } }, { signal: ctrl?.signal });
      if (my !== gen) { showNow(true); return; }
      if (!cfg.spk) { showNow(); setState('idle'); afterAnswer(); return; }
      const bin = atob(r.audio || ''); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: r.mime || 'audio/mpeg' }));
      audio.src = url;
      audio.volume = clamp(+ls.get('tutor.vol', 1), 0, 1); audio.muted = !cfg.spk;
      setState('speak');
      let ok = true;
      const finished = new Promise(res => { audio.onended = res; audio.onpause = () => { if (!audio.ended) res(); }; audio.onerror = res; });
      await audio.play().catch(() => { ok = false; });
      if (my !== gen) { URL.revokeObjectURL(url); showNow(true); return; }
      if (!ok) { URL.revokeObjectURL(url); showNow(); setState('idle', L('Ton war blockiert – die Antwort steht oben.', 'Sound was blocked – the answer is above.')); return; }
      shown = true; ex.done = true;
      const sync = syncOut(aEl, txt, audio, { scroll: capScroll });
      if (t) writeAlong(t, () => { const d = audio.duration; return audio.ended || (audio.paused && audio.currentTime > 0) ? 1 : isFinite(d) && d > 0 ? audio.currentTime / d : 0; });
      await finished; await sync;
      URL.revokeObjectURL(url);
      if (my === gen && state === 'speak') { setState('idle'); fc.pulse('happy', 900); afterAnswer(); }
    } catch (e) {
      showNow(my !== gen);
      if (my !== gen) return;
      setState('idle', e?.name === 'AbortError' ? L('Gestoppt.', 'Stopped.') : (e?.code === 'voice_busy' || e?.code === 'cap') ? e.message : L('Vorlesen hat nicht geklappt.', 'Reading aloud didn’t work.'));
    }
  }

  // ---------- Zuhören (mit Live-Mitschrift) ----------
  let listenTok = 0, anSrc = null, capTimer2 = 0;
  async function startListen({ followup = false } = {}) {
    if (!open || typing) return;
    if (!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)) { setTyping(true); setState('idle', L('Hier kann ich nicht zuhören – tipp einfach.', 'I can’t listen here – just type.')); return; }
    if (state === 'speak' || state === 'think') stopAll(true);
    if (state === 'listen' || rec) return;
    const tok = ++listenTok;
    unlockAudio();
    // Audio-Kontext noch im Klick anwerfen (iPhone)
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume?.(); } catch (e) {}
    viaVoice = true;
    setState('listen', L('Mikro startet …', 'Starting mic …'));
    let s;
    try { s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch (e) { if (tok !== listenTok) return; viaVoice = false; setState('idle', L('Mikro nicht erlaubt – tipp einfach.', 'Mic not allowed – just type.')); setTyping(true); fc.pulse('sad'); return; }
    // inzwischen gestoppt, eingeklappt oder ins Tippen gewechselt? → Mikro sofort wieder aus
    if (tok !== listenTok || !open || typing || rec) { s.getTracks().forEach(x => x.stop()); if (tok === listenTok && state === 'listen') setState('idle'); return; }
    stream = s;
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(m => MediaRecorder.isTypeSupported?.(m)) || '';
    const r = rec = new MediaRecorder(s, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
    chunks = [];
    r.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    r.onstop = () => { try { s.getTracks().forEach(x => x.stop()); } catch (e) {} if (stream === s) releaseMic(); onRecorded(r, r.mimeType || mime || 'audio/webm'); };
    r.start(250);
    setState('listen');
    let running = false;
    try { await actx.resume(); running = actx.state === 'running'; } catch (x) {}
    if (rec !== r) return;
    wave.mic(actx, s);
    lsess = startLive(actx, s, { onText: t => { if (t && state === 'listen' && rec === r) capQuestion(t, true); } });
    clearTimeout(capTimer2); capTimer2 = setTimeout(() => { if (rec === r) stopListen(); }, 45000);
    if (!running) return;   // ohne laufendes Audio keine Stille-Erkennung – „Fertig“ drücken oder 45-s-Grenze
    try {
      const an = actx.createAnalyser(); an.fftSize = 1024;
      anSrc = actx.createMediaStreamSource(s); anSrc.connect(an);
      const buf = new Float32Array(an.fftSize);
      const t0 = performance.now(); let floor = .008, spoke = false, lastLoud = t0;
      const quiet = followup ? 6000 : 9000;
      const tick = () => {
        if (state !== 'listen' || rec !== r) return;
        an.getFloatTimeDomainData(buf);
        let q = 0; for (const v of buf) q += v * v; const rms = Math.sqrt(q / buf.length);
        const t = performance.now();
        if (t - t0 < 350) floor = Math.max(floor, rms * .9);
        if (rms > Math.max(.018, floor * 2.6)) { spoke = true; lastLoud = t; }
        if (spoke && t - lastLoud > 1300) return stopListen();
        if (!spoke && t - t0 > quiet) return stopListen(true);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch (e) {}
  }
  function releaseMic() {
    try { stream && stream.getTracks().forEach(t => t.stop()); } catch (e) {}
    try { anSrc && anSrc.disconnect(); } catch (e) {}
    anSrc = null; stream = null; wave.stop();
  }
  function stopListen(cancel = false) {
    cancelAnimationFrame(raf); clearTimeout(capTimer2);
    if (!rec || rec.state === 'inactive') { if (state === 'listen' && !rec) { listenTok++; setState('idle'); } return; }
    rec._cancel = cancel; rec.stop();
  }
  // Tab im Hintergrund: Aufnahme beenden
  document.addEventListener('visibilitychange', () => { if (document.hidden && rec) stopListen('stop'); });
  async function onRecorded(r, mime) {
    if (r !== rec) return;
    rec = null;
    const lv = lsess; lsess = null;
    if (r._cancel) {
      lv && lv.cancel();
      viaVoice = false;
      if (curEx && !curEx.done) { if (curEx.q.textContent) { curEx.q.classList.remove('live'); } dropEx(); }
      if (state === 'listen') setState('idle', r._cancel === 'stop' ? undefined : L('Ich hab nichts gehört – tipp aufs Mikro.', 'I didn’t hear anything – tap the mic.'));
      return;
    }
    const blob = new Blob(chunks, { type: mime });
    setState('think', L('Max hört genau hin …', 'Max is listening closely …'));
    const my0 = ++gen;
    if (lv) {
      const lt = await lv.finish();
      if (my0 !== gen) return;
      if (lt && lt.length > 1) { state = 'idle'; await submit(lt); return; }
    }
    if (blob.size < 1500) { dropEx(); setState('idle', L('Das war zu kurz.', 'That was too short.')); return; }
    ctrl = new AbortController();
    try {
      const res = await ask('stt', { audio: await b64(blob), mime }, { signal: ctrl.signal });
      if (my0 !== gen) return;
      ctrl = null;
      const t = String(res.text || '').trim();
      if (!t) { dropEx(); setState('idle', L('Ich hab nichts verstanden.', 'I didn’t catch that.')); return; }
      state = 'idle'; await submit(t);
    } catch (e) {
      if (my0 !== gen) return;
      ctrl = null; dropEx();
      setState('idle', e?.name === 'AbortError' ? L('Gestoppt.', 'Stopped.') : undefined);
      if (e?.name !== 'AbortError') apiError(e);
    }
  }

  // ---------- Stopp ----------
  function stopAll(quiet) {
    listenTok++;
    if (state === 'idle' && !ctrl && !rec) return;
    gen++;
    viaVoice = false;
    if (rec) stopListen('stop');
    if (ctrl) { try { ctrl.abort(); } catch (e) {} ctrl = null; }
    try { audio.pause(); } catch (e) {}
    setState('idle', quiet ? undefined : L('Gestoppt.', 'Stopped.'));
  }

  // Wenn eine Tafel offen ist und man woanders hin navigiert: Tafel einklappen statt im Weg zu sein
  addEventListener('hashchange', () => { if (boardOpen && !boardMin && MOB.matches) minBoard(true, true); });

  // Handy-Tastatur: Leiste bleibt über der Tastatur
  const vv = window.visualViewport;
  if (vv) { const kb = () => root.style.setProperty('--kb', Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)) + 'px'); vv.addEventListener('resize', kb); vv.addEventListener('scroll', kb); }

  setState('idle');
  placeBub(); coverCheck();
  applyEnabled(false);
  api = { applyEnabled, open: () => setOpen(true, { listen: true }), close: () => setOpen(false) };
  return api;
}
