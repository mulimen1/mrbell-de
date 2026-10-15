// Schwebender Max: kleiner Kopf unten rechts, Klick → kompaktes Chatfenster.
// Sieht die aktuelle Seite (Tab, Skript, sichtbarer Text), kann tippen & sprechen, schreibt kleine Tafeln.
// Verschiebbar, größenveränderbar, Vollbild (Overlay – die Seite darunter bleibt unverändert), ausblendbar.
import { h, ico, ls, sleep, toast } from './util.js';
import { face } from './face.js';
import { ask } from './api.js';
import { S } from './state.js';
import { forChat } from './retrieve.js';
import { apiError } from './ui.js';
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
const cfg = Object.assign({ on: true, spk: false, bub: null, pan: null, sh: 0.78 }, ls.get(KEY, {}) || {});
const saveCfg = () => ls.set(KEY, cfg);
export const isAssistantEnabled = () => cfg.on !== false;
let api = null;                    // gesetzt, sobald gemountet
export function setAssistantEnabled(on) {
  cfg.on = !!on; saveCfg();
  if (api) api.applyEnabled(true);
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
  if (!r.tab) return '';
  const parts = [L('Seite: ', 'Page: ') + ((TAB[r.tab] || (r.tab === 'trainer' ? L('BWL-Trainer', 'Business trainer') + (r.trainer ? ' ' + r.trainer : '') : r.tab)))];
  if (d) parts.push(L('Skript „', 'Slides “') + d.name + L('“', '”'));
  const vis = visibleText();
  if (vis) parts.push(L('sichtbar: ', 'visible: ') + vis);
  return '[' + parts.join(' · ') + ']';
}

// ---------- Aufbau ----------
export function mountAssistant() {
  if (api) return api;
  const host = document.getElementById('app');
  if (!host) return null;

  let hist = (ls.get(CHAT, []) || []).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-20);
  let open = false, full = false, state = 'idle', ctrl = null, gen = 0, selBoard = null, unread = false;
  let rec = null, stream = null, chunks = [], actx = null, raf = 0;
  const audio = new Audio(); audio.preload = 'auto';

  // Kopf (Bubble)
  const bubFace = h('span', { class: 'asst-bf' });
  const bub = h('button', { class: 'asst-bub', type: 'button', 'aria-label': L('Max fragen', 'Ask Max'), title: L('Max fragen – ziehen zum Verschieben', 'Ask Max – drag to move') },
    bubFace, h('i', { class: 'asst-dot' }), h('span', { class: 'asst-tip' }, L('Frag Max', 'Ask Max')));
  // Panel
  const fEl = h('span', { class: 'asst-f' });
  const thinkEl = h('div', { class: 'asst-think', 'aria-live': 'polite' });
  const sees = h('span', { class: 'asst-sees' });
  const spkBtn = h('button', { class: 'iconbtn asst-ib asst-spk', type: 'button' });
  const fullBtn = h('button', { class: 'iconbtn asst-ib', type: 'button', html: ico('expand') });
  const moreBtn = h('button', { class: 'iconbtn asst-ib', type: 'button', 'aria-label': L('Mehr', 'More'), 'aria-haspopup': 'menu', html: SVG.more });
  const minBtn = h('button', { class: 'iconbtn asst-ib', type: 'button', 'aria-label': L('Minimieren', 'Minimise'), title: L('Minimieren', 'Minimise'), html: SVG.min });
  const head = h('header', { class: 'asst-h' },
    h('div', { class: 'asst-fw' }, fEl, thinkEl),
    h('div', { class: 'asst-tt' }, h('b', {}, 'Max'), sees),
    spkBtn, fullBtn, moreBtn, minBtn);
  const voiceChips = VOICES.map(([k, l, d]) => h('button', { class: 'chip', type: 'button', title: d, 'data-v': k, onclick: () => { ls.set('tutor.voice', k); drawMenu(); } }, l));
  const menu = h('div', { class: 'asst-menu', role: 'menu', hidden: true },
    h('div', { class: 'eyebrow' }, L('Stimme', 'Voice')), h('div', { class: 'asst-vch' }, voiceChips),
    h('button', { class: 'asst-mi', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); clearChat(); } }, h('span', { html: ico('refresh') }), L('Neuer Chat', 'New chat')),
    h('button', { class: 'asst-mi', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); disable(); } }, h('span', { html: ico('x') }), L('Max ausblenden', 'Hide Max')));
  const msgs = h('div', { class: 'asst-msgs', 'aria-live': 'polite' });
  const sugg = h('div', { class: 'asst-sugg' });
  const ta = h('textarea', { rows: 1, placeholder: L('Frag Max zu dieser Seite …', 'Ask Max about this page …'), 'aria-label': L('Nachricht an Max', 'Message to Max'), maxlength: 1500 });
  const mic = h('button', { class: 'asst-mic', type: 'button', 'aria-label': L('Sprechen', 'Speak'), title: L('Sprechen', 'Speak'), html: ico('mic') });
  const send = h('button', { class: 'asst-send', type: 'button', 'aria-label': L('Senden', 'Send'), html: ico('send') });
  const foot = h('div', { class: 'asst-foot' });
  const chat = h('div', { class: 'asst-chat' }, msgs, sugg,
    h('div', { class: 'asst-comp' }, h('div', { class: 'asst-box' }, ta, mic, send), foot));
  const bvTitle = h('b', {});
  const bvArea = h('div', { class: 'asst-bva' });
  const boardView = h('div', { class: 'asst-bv' },
    h('div', { class: 'asst-bvh' }, h('span', { html: ico('board') }), bvTitle,
      h('button', { class: 'iconbtn asst-ib', type: 'button', 'aria-label': L('Tafel schließen', 'Close whiteboard'), html: ico('x'), onclick: () => showBoard(null) })),
    bvArea);
  const rz = h('div', { class: 'asst-rz', title: L('Größe ändern', 'Resize'), 'aria-hidden': 'true' });
  const grab = h('div', { class: 'asst-grab', 'aria-hidden': 'true' }, h('i'));
  const panel = h('section', { class: 'asst-panel', tabindex: '-1', role: 'dialog', 'aria-label': L('Max – Assistent', 'Max – assistant') },
    rz, grab, head, menu, h('div', { class: 'asst-body' }, chat, boardView));
  const chip = h('button', { class: 'asst-back', type: 'button' }, h('span', { class: 'asst-cf' }), L('Max zurückholen', 'Bring Max back'));
  const root = h('div', { class: 'asst', 'data-state': 'idle' }, bub, panel);
  host.appendChild(root);
  const bf = face(bubFace, {}), fc = face(fEl, { follow: false });

  // ---------- Sichtbarkeit ----------
  function applyEnabled(announce) {
    const on = isAssistantEnabled();
    root.classList.toggle('off', !on);
    if (!on) { stopAll(true); setOpen(false, true); }
    if (announce && !on) {
      document.querySelector('.asst-back')?.remove();
      host.appendChild(chip);
      face(chip.querySelector('.asst-cf'), { follow: false });
      clearTimeout(chip._t); chip._t = setTimeout(() => { chip.classList.add('out'); setTimeout(() => chip.remove(), 300); }, 8000);
    } else if (on) chip.remove();
  }
  chip.addEventListener('click', () => { chip.remove(); setAssistantEnabled(true); toast(L('Max ist wieder da.', 'Max is back.')); });
  function disable() { setAssistantEnabled(false); }

  const coverCheck = () => {
    const covered = !!document.querySelector('body > .voice, body > .modal-bg, .mindmap.mm-full');
    const r = route();
    const mobTutor = r.tab === 'tutor' && matchMedia('(max-width: 980px)').matches;
    const side = document.querySelector('#app .app.sideopen');
    root.classList.toggle('covered', covered);
    root.classList.toggle('nobub', mobTutor || !!side);
  };
  let ccRaf = 0;
  const coverSoon = () => { if (!ccRaf) ccRaf = requestAnimationFrame(() => { ccRaf = 0; coverCheck(); }); };
  new MutationObserver(coverSoon).observe(document.body, { childList: true });
  const appEl = host.querySelector('.app');
  if (appEl) new MutationObserver(coverSoon).observe(appEl, { attributes: true, attributeFilter: ['class'], subtree: true });

  // ---------- Position ----------
  const vw = () => document.documentElement.clientWidth, vh = () => innerHeight;
  function placeBub() {
    const p = cfg.bub || { r: 18, b: 18 };
    const r = clamp(p.r, 6, vw() - BUB - 6), b = clamp(p.b, 6, vh() - BUB - 6);
    bub.style.right = r + 'px'; bub.style.bottom = `calc(${b}px + env(safe-area-inset-bottom, 0px))`;
    return { r, b };
  }
  function panSize() {
    const p = cfg.pan || {};
    const w = clamp(p.w || 384, 300, vw() - 2 * M), hh = clamp(p.h || 560, 340, vh() - 2 * M);
    const bp = cfg.bub || { r: 18, b: 18 };
    const r = clamp(p.r ?? bp.r, M, vw() - w - M), b = clamp(p.b ?? bp.b, M, vh() - hh - M);
    return { w, h: hh, r, b };
  }
  function placePanel() {
    if (MOB.matches) {
      panel.style.cssText = '';
      panel.style.height = Math.round(clamp(cfg.sh || .78, .4, .94) * vh()) + 'px';
      return;
    }
    const s = panSize();
    Object.assign(panel.style, { width: s.w + 'px', height: s.h + 'px', right: s.r + 'px', bottom: s.b + 'px' });
  }
  addEventListener('resize', () => { placeBub(); if (open) placePanel(); coverCheck(); });
  MOB.addEventListener?.('change', () => { placeBub(); placePanel(); });

  function dragger(el, { start, move, end, threshold = 4 }) {
    el.addEventListener('pointerdown', e => {
      const t = e.target.closest('button, textarea, input, a, .asst-menu');
      if (e.button !== 0 || (t && t !== el)) return;
      if (start && start(e) === false) return;
      const sx = e.clientX, sy = e.clientY; let moved = false;
      const mv = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < threshold) return;
        if (!moved) { moved = true; root.classList.add('dragging'); document.documentElement.classList.add('asst-drag'); try { getSelection().removeAllRanges(); } catch (x) {} }
        ev.preventDefault(); move(dx, dy, ev);
      };
      const up = ev => {
        removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        root.classList.remove('dragging'); document.documentElement.classList.remove('asst-drag'); end && end(moved, ev);
      };
      addEventListener('pointermove', mv, { passive: false }); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
  }
  // Kopf verschieben
  let bubStart = null, justDragged = false;
  dragger(bub, {
    start: () => { bubStart = placeBub(); },
    move: (dx, dy) => {
      const r = clamp(bubStart.r - dx, 6, vw() - BUB - 6), b = clamp(bubStart.b - dy, 6, vh() - BUB - 6);
      bub.style.right = r + 'px'; bub.style.bottom = b + 'px'; cfg.bub = { r, b };
    },
    end: moved => { if (moved) { justDragged = true; setTimeout(() => { justDragged = false; }, 50); saveCfg(); placeBub(); } },
  });
  bub.addEventListener('click', () => { if (!justDragged) setOpen(true); });
  // Panel verschieben (am Kopfbereich)
  let pStart = null;
  dragger(head, {
    start: () => { if (MOB.matches || full) return false; pStart = panSize(); },
    move: (dx, dy) => {
      const r = clamp(pStart.r - dx, M, vw() - pStart.w - M), b = clamp(pStart.b - dy, M, vh() - pStart.h - M);
      panel.style.right = r + 'px'; panel.style.bottom = b + 'px'; cfg.pan = { ...pStart, r, b };
    },
    end: moved => { if (moved) saveCfg(); },
  });
  // Größe ändern (Ecke oben links, Panel bleibt unten rechts verankert)
  dragger(rz, {
    threshold: 1,
    start: () => { if (MOB.matches || full) return false; pStart = panSize(); },
    move: (dx, dy) => {
      const w = clamp(pStart.w - dx, 300, vw() - pStart.r - M), hh = clamp(pStart.h - dy, 340, vh() - pStart.b - M);
      panel.style.width = w + 'px'; panel.style.height = hh + 'px'; cfg.pan = { ...pStart, w, h: hh };
    },
    end: moved => { if (moved) saveCfg(); },
  });
  // Handy: Griff oben zieht das Blatt hoch/runter, ganz runter = minimieren
  let shStart = 0;
  dragger(grab, {
    threshold: 2,
    start: () => { if (!MOB.matches || full) return false; shStart = panel.getBoundingClientRect().height; },
    move: (dx, dy) => { panel.style.height = clamp(shStart - dy, 160, vh() * .94) + 'px'; },
    end: moved => {
      if (!moved) return;
      const f = panel.getBoundingClientRect().height / vh();
      if (f < .34) { setOpen(false); return; }
      cfg.sh = clamp(f, .4, .94); saveCfg(); placePanel();
    },
  });

  // ---------- Öffnen / Schließen / Vollbild ----------
  function setOpen(v, silent) {
    if (v && !isAssistantEnabled()) return;
    open = !!v;
    root.classList.toggle('open', open);
    if (!open) { closeMenu(); setFull(false); }
    if (open) {
      placePanel(); updateSees(); drawSugg();
      unread = false; root.classList.remove('unread');
      panel.animate([{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
      scroll();
      if (!silent) setTimeout(() => (MOB.matches ? panel : ta).focus({ preventScroll: true }), 60);
    } else if (!silent && document.activeElement && panel.contains(document.activeElement)) bub.focus({ preventScroll: true });
  }
  function setFull(v) {
    full = !!v;
    root.classList.toggle('full', full);
    fullBtn.innerHTML = ico(full ? 'shrink' : 'expand');
    fullBtn.setAttribute('aria-label', full ? L('Vollbild verlassen', 'Exit full screen') : L('Vollbild', 'Full screen'));
    fullBtn.title = fullBtn.getAttribute('aria-label');
    if (!full) showBoard(null, true);
    if (open) placePanel();
    scroll();
  }
  minBtn.addEventListener('click', () => setOpen(false));
  fullBtn.addEventListener('click', () => setFull(!full));

  function showBoard(b, keep) {
    selBoard = b;
    root.classList.toggle('board', !!b);
    if (!b) { bvArea.replaceChildren(); return; }
    bvTitle.textContent = b.title;
    const t = h('div', { class: 'tafel' }, h('h2', { class: 'tt' }, b.title));
    t.appendChild(sanitize(b.html));
    bvArea.replaceChildren(t); bvArea.scrollTop = 0;
    if (!full && !keep) setFull(true);
  }

  // Menü
  function drawMenu() { const v = getVoice(); voiceChips.forEach(c => c.classList.toggle('on', c.dataset.v === v)); }
  function closeMenu() { menu.hidden = true; moreBtn.setAttribute('aria-expanded', 'false'); }
  moreBtn.addEventListener('click', e => { e.stopPropagation(); if (menu.hidden) { drawMenu(); menu.hidden = false; moreBtn.setAttribute('aria-expanded', 'true'); } else closeMenu(); });
  document.addEventListener('pointerdown', e => { if (!menu.hidden && !menu.contains(e.target) && !moreBtn.contains(e.target)) closeMenu(); });

  // Lautsprecher (gesprochene Antworten an/aus = auch Stummschalten)
  function drawSpk() {
    spkBtn.innerHTML = cfg.spk ? SVG.spkOn : SVG.spkOff;
    spkBtn.classList.toggle('on', !!cfg.spk);
    spkBtn.setAttribute('aria-pressed', cfg.spk ? 'true' : 'false');
    spkBtn.setAttribute('aria-label', cfg.spk ? L('Antworten vorlesen: an', 'Read answers aloud: on') : L('Antworten vorlesen: aus', 'Read answers aloud: off'));
    spkBtn.title = spkBtn.getAttribute('aria-label');
    drawFoot();
  }
  spkBtn.addEventListener('click', () => {
    cfg.spk = !cfg.spk; saveCfg();
    if (cfg.spk) unlockAudio();
    else if (state === 'speak') { try { audio.pause(); } catch (e) {} setState('idle'); }
    drawSpk();
  });
  function drawFoot(msg) {
    foot.replaceChildren(
      h('span', { class: 'asst-st' }, msg || ''),
      h('span', { class: 'asst-cost', title: L('KI-Einheiten pro Antwort', 'AI credits per answer') }, cfg.spk ? L('2 Einheiten · mit Stimme', '2 credits · spoken') : L('1 Einheit', '1 credit')));
  }
  drawSpk();

  // „Sieht gerade“ im Kopf
  function updateSees() { const p = placeLabel(); sees.textContent = p ? L('sieht: ', 'sees: ') + p : L('immer für dich da', 'always here for you'); sees.title = sees.textContent; }
  addEventListener('hashchange', () => { coverCheck(); if (open) { updateSees(); drawSugg(); } });

  // ---------- Status ----------
  let thinkIv = 0;
  function setState(s, msg) {
    state = s; root.dataset.state = s;
    fc.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
    bf.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
    clearInterval(thinkIv);
    if (s === 'think') {
      const lines = thinkLines('voice', [L('Einen Moment …', 'One moment …')]); let i = 0;
      const show = () => { thinkEl.textContent = lines[i++ % lines.length]; thinkEl.animate([{ opacity: 0, transform: 'scale(.88) translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.34,1.56,.64,1)' }); };
      thinkEl.classList.add('on'); show(); thinkIv = setInterval(show, 2800);
    } else thinkEl.classList.remove('on');
    const busy = s !== 'idle';
    send.innerHTML = busy ? SVG.stop : ico('send');
    send.classList.toggle('stop', busy);
    send.setAttribute('aria-label', busy ? L('Stopp', 'Stop') : L('Senden', 'Send'));
    send.disabled = !busy && !ta.value.trim();
    mic.setAttribute('aria-label', s === 'listen' ? L('Aufnahme beenden', 'Stop recording') : L('Sprechen', 'Speak'));
    mic.disabled = s === 'think';
    drawFoot(msg ?? ({ listen: L('Ich höre zu …', 'Listening …'), speak: L('Max spricht …', 'Max is talking …') })[s]);
  }

  // ---------- Nachrichten ----------
  function scroll() { msgs.scrollTop = msgs.scrollHeight; }
  function boardCard(b) {
    const t = h('div', { class: 'tafel' });
    t.appendChild(sanitize(b.html));
    return h('div', { class: 'asst-tafel' },
      h('div', { class: 'asst-th' }, h('span', { html: ico('board') }), h('b', {}, b.title),
        h('button', { class: 'asst-big', type: 'button', onclick: () => showBoard(b) }, h('span', { html: ico('expand') }), L('Groß', 'Enlarge'))),
      h('div', { class: 'asst-tb', onclick: () => showBoard(b) }, t));
  }
  function addMsg(role, raw, { animate = false, exec = false } = {}) {
    const el = h('div', { class: 'asst-m ' + (role === 'user' ? 'me' : 'ai') });
    if (role === 'user') { el.textContent = raw; msgs.appendChild(el); scroll(); return el; }
    const p = parse(raw);
    const body = h('div', { class: 'asst-tx' });
    el.appendChild(body);
    const extras = h('div', {});
    p.boards.forEach(b => extras.appendChild(boardCard(b)));
    const d = curDoc() || S.doc;
    const acts = p.acts.map(a => ({ a, href: ACTS[a][1](d) })).filter(x => x.href);
    if (acts.length) extras.appendChild(h('div', { class: 'asst-acts' }, acts.map(({ a, href }) => h('a', { class: 'chip', href }, ACTS[a][0]))));
    if (p.cmds.length) {
      const row = h('div', { class: 'asst-done' });
      p.cmds.forEach(c => row.appendChild(cmdChip(c, exec)));
      el.appendChild(row);
    }
    msgs.appendChild(el);
    const txt = p.text || (p.boards.length ? L('Schau an die Tafel.', 'Look at the whiteboard.') : p.cmds.length ? L('Mach ich.', 'On it.') : '…');
    if (animate) typeOut(body, txt).then(() => { el.appendChild(extras); scroll(); });
    else { body.appendChild(richText(txt)); el.appendChild(extras); }
    scroll();
    return el;
  }
  async function typeOut(el, text) {
    const words = text.split(/(\s+)/); let out = '';
    for (let k = 0; k < words.length; k++) {
      out += words[k];
      if (k % 4 === 0 || k === words.length - 1) { el.replaceChildren(richText(out)); scroll(); await sleep(14); }
      if (!el.isConnected) break;
    }
    el.replaceChildren(richText(text));
  }
  function welcome() {
    msgs.replaceChildren(h('div', { class: 'asst-m ai asst-hi' }, richText(L('Moin, ich bin Max. Ich sehe, was du gerade offen hast, und kann die App für dich steuern: Quiz bauen, Karten machen, Podcast aufnehmen, zum Lernplan springen, Themen erklären. Sag einfach, was du willst – tippen oder reden.', 'Hey, I’m Max. I can see what you have open and I can run the app for you: build quizzes, make flashcards, record a podcast, jump to your study plan, explain topics. Just tell me what you want – type or talk.'))));
  }
  function renderHist() { if (!hist.length) welcome(); else { msgs.replaceChildren(); hist.forEach(m => addMsg(m.role, m.content)); } }
  function clearChat() { stopAll(true); hist = []; ls.set(CHAT, []); showBoard(null, true); renderHist(); drawSugg(); }
  function drawSugg() {
    if (hist.length) { sugg.replaceChildren(); return; }
    const d = curDoc();
    const s = [
      d && [L('Quiz zu diesem Skript', 'Quiz on these slides'), L('Bau mir ein Quiz zu diesem Skript.', 'Build me a quiz on these slides.')],
      [L('Erklär mir die Seite', 'Explain this page'), L('Erklär mir kurz, was ich hier gerade sehe.', 'Briefly explain what I’m looking at right now.')],
      [L('Was soll ich heute lernen?', 'What should I study today?'), L('Was soll ich heute lernen? Mach mir einen konkreten Vorschlag.', 'What should I study today? Give me a concrete suggestion.')],
    ].filter(Boolean).map(([l, q]) => h('button', { class: 'chip', type: 'button', onclick: () => submit(q) }, l));
    s.push(h('button', { class: 'chip', type: 'button', onclick: () => { if (!cfg.spk) { cfg.spk = true; saveCfg(); drawSpk(); } startListen(); } }, h('span', { html: ico('mic') }), L('Mit mir reden', 'Talk to me')));
    sugg.replaceChildren(...s);
  }

  // ---------- App steuern ----------
  const sleepUntil = async (fn, ms = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const x = fn(); if (x) return x; await sleep(120); } return null; };
  async function nav(hash, force) {
    if (force) { try { (await import('./app.js')).forceRerender(); } catch (e) {} }
    if (location.hash === hash) dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = hash;
  }
  function cmdChip(c, exec) {
    const chip = h('span', { class: 'asst-cmd' + (exec ? ' run' : '') }, h('span', { class: 'ck', html: ico('check') }), c.label);
    if (c.k === 'upload' || c.k === 'voice') {
      const b = h('button', { class: 'asst-cmd', type: 'button', onclick: () => runCmd(c, b) }, h('span', { class: 'ck', html: ico(c.k === 'upload' ? 'upload' : 'mic') }), c.label);
      if (exec) setTimeout(() => runCmd(c, b), 0);
      return b;
    }
    if (exec) setTimeout(() => runCmd(c, chip), 0);
    return chip;
  }
  let navTimer = 0;
  async function runCmd(c, chip) {
    const fail = msg => { chip.classList.remove('run'); chip.classList.add('no'); chip.replaceChildren(h('span', { class: 'ck', html: ico('x') }), msg); scroll(); };
    const ok = () => { chip.classList.remove('run'); chip.classList.add('ok'); };
    const d = curDoc() || S.doc;
    if (c.doc && !d) return fail(L('Dafür brauch ich ein Skript – lad eins hoch oder öffne eins links.', 'I need slides for that – upload some or open one on the left.'));
    try {
      if (c.k === 'go') { await nav(`#/app/${d.id}/${c.v}`); afterNav(); }
      else if (c.k === 'make') {
        if (c.v === 'exam') {
          await nav(`#/app/${d.id}/quiz`, true); afterNav();
          const btn = await sleepUntil(() => [...document.querySelectorAll('#view .tile h3')].find(x => /Probeklausur|Mock exam/.test(x.textContent))?.closest('button'));
          if (!btn) return fail(L('Probeklausur nicht gefunden – starte sie im Quiz-Tab.', 'Couldn’t find the mock exam – start it in the Quiz tab.'));
          btn.click();
        } else { await nav(`#/app/${d.id}/${MAKE[c.v][0]}/auto`, true); afterNav(); }
      }
      else if (c.k === 'topic') { ls.set('tutor.target', null); const m = await import('./app.js'); afterNav(); m.startTopic(c.v); }
      else if (c.k === 'trainer') { await nav('#/app/trainer/' + c.v); afterNav(); }
      else if (c.k === 'upload') { const f = document.getElementById('fileApp'); if (!f) return fail(L('Upload gerade nicht möglich.', 'Upload not available right now.')); f.click(); }
      else if (c.k === 'voice') {
        if (state === 'speak' || state === 'listen') stopAll(true);
        const { openVoice } = await import('./voice.js');
        openVoice({ doc: curDoc(), onClose: async () => { try { (await import('./app.js')).forceRerender(); } catch (e) {} dispatchEvent(new HashChangeEvent('hashchange')); } });
      }
      else if (c.k === 'lang') setOutLang(c.v);
      else if (c.k === 'theme') { document.documentElement.dataset.theme = c.v; try { sessionStorage.setItem('tutor.theme', c.v); } catch (e) {} applyThemeButtons(); }
      ok();
    } catch (e) { console.warn(e); fail(L('Das hat nicht geklappt.', 'That didn’t work.')); }
  }
  // Nach einem Seitenwechsel: Ergebnis sichtbar machen (Handy: zurück zum Kopf, sonst kompakt offen)
  function afterNav() {
    if (full) setFull(false);
    if (MOB.matches && open) { clearTimeout(navTimer); navTimer = setTimeout(() => setOpen(false, true), 900); }
  }
  renderHist();

  // ---------- Senden ----------
  const autosize = () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; if (state === 'idle') send.disabled = !ta.value.trim(); };
  ta.addEventListener('input', autosize);
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(ta.value); } });
  send.addEventListener('click', () => { if (state !== 'idle') stopAll(); else submit(ta.value); });

  async function submit(text) {
    text = String(text || '').trim();
    if (!text || state === 'think') return;
    if (state === 'speak') { try { audio.pause(); } catch (e) {} }
    unlockAudio();
    ta.value = ''; autosize();
    sugg.replaceChildren();
    const ctxLine = pageContext();
    hist.push({ role: 'user', content: text });
    const userEl = addMsg('user', text);
    const typing = h('div', { class: 'asst-m ai' }, h('span', { class: 'typing' }, h('i'), h('i'), h('i')));
    msgs.appendChild(typing); scroll();
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
      typing.remove();
      const raw = String(r.text || '').slice(0, 12000);
      hist.push({ role: 'assistant', content: raw });
      hist = hist.slice(-20); ls.set(CHAT, hist);
      addMsg('assistant', raw, { animate: open, exec: true });
      if (!open) { unread = true; root.classList.add('unread'); bf.pulse('happy', 1200); }
      const p = parse(raw);
      if (spoken && cfg.spk && p.text) await speak(p.text, my);
      else { setState('idle'); fc.pulse('happy', 900); }
    } catch (e) {
      typing.remove();
      if (hist[hist.length - 1]?.role === 'user') hist.pop();
      userEl.remove();
      if (!ta.value) { ta.value = text; autosize(); }
      if (my !== gen && e?.name === 'AbortError') return;
      setState('idle', e?.name === 'AbortError' ? L('Gestoppt.', 'Stopped.') : '');
      if (e?.name !== 'AbortError') { fc.pulse('sad', 1400); apiError(e, () => { ta.value = ''; submit(text); }); }
    } finally { if (my === gen) ctrl = null; }
  }

  // ---------- Vorlesen ----------
  function unlockAudio() { if (state === 'speak') return; try { audio.src = SILENT; audio.play().catch(() => {}); } catch (e) {} }
  async function speak(text, my) {
    setState('think', L('Stimme wird geladen …', 'Loading voice …'));
    try {
      const r = await ask('tts', { text: text.slice(0, 2500), opts: { voice: getVoice() } }, { signal: ctrl?.signal });
      if (my !== gen || !cfg.spk) { if (my === gen) setState('idle'); return; }
      const bin = atob(r.audio || ''); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: r.mime || 'audio/mpeg' }));
      audio.src = url;
      audio.volume = clamp(+ls.get('tutor.vol', 1), 0, 1); audio.muted = !!ls.get('tutor.muted', false);
      setState('speak');
      audio.onended = () => { URL.revokeObjectURL(url); if (state === 'speak' && my === gen) setState('idle'); };
      await audio.play().catch(() => { if (my === gen) setState('idle', L('Ton war blockiert – tipp auf den Lautsprecher.', 'Sound was blocked – tap the speaker.')); });
    } catch (e) {
      if (my !== gen) return;
      setState('idle', e?.name === 'AbortError' ? L('Gestoppt.', 'Stopped.') : (e?.code === 'voice_busy' || e?.code === 'cap') ? e.message : L('Vorlesen hat nicht geklappt.', 'Reading aloud didn’t work.'));
    }
  }

  // ---------- Sprechen (Mikro) ----------
  async function startListen() {
    if (!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)) { drawFoot(L('Dein Browser kann hier nicht aufnehmen – tipp einfach.', 'Your browser can’t record here – just type.')); return; }
    stopAll(true); unlockAudio();
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch (e) { drawFoot(L('Mikro nicht erlaubt – oben in der Adressleiste freigeben.', 'Mic not allowed – allow it in the address bar.')); fc.pulse('sad'); return; }
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(m => MediaRecorder.isTypeSupported?.(m)) || '';
    const r = rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
    chunks = [];
    r.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    r.onstop = () => { releaseMic(); onRecorded(r, r.mimeType || mime || 'audio/webm'); };
    r.start(250);
    setState('listen');
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const src = actx.createMediaStreamSource(stream), an = actx.createAnalyser(); an.fftSize = 1024; src.connect(an);
      const buf = new Float32Array(an.fftSize);
      const t0 = performance.now(); let floor = .008, spoke = false, lastLoud = t0;
      const tick = () => {
        if (state !== 'listen' || rec !== r) { src.disconnect(); mic.style.removeProperty('--lvl'); return; }
        an.getFloatTimeDomainData(buf);
        let s = 0; for (const v of buf) s += v * v; const rms = Math.sqrt(s / buf.length);
        const t = performance.now();
        if (t - t0 < 350) floor = Math.max(floor, rms * .9);
        if (rms > Math.max(.018, floor * 2.6)) { spoke = true; lastLoud = t; }
        mic.style.setProperty('--lvl', Math.min(1, rms * 8).toFixed(2));
        if (spoke && t - lastLoud > 1300) return stopListen();
        if (!spoke && t - t0 > 9000) return stopListen(true);
        if (t - t0 > 45000) return stopListen();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch (e) {}
  }
  function releaseMic() { try { stream && stream.getTracks().forEach(t => t.stop()); } catch (e) {} stream = null; }
  function stopListen(cancel = false) {
    cancelAnimationFrame(raf);
    if (!rec || rec.state === 'inactive') return;
    rec._cancel = cancel; rec.stop();
  }
  async function onRecorded(r, mime) {
    if (r !== rec) return;
    rec = null;
    if (r._cancel) { if (state === 'listen') setState('idle', r._cancel === 'stop' ? L('Gestoppt.', 'Stopped.') : L('Ich hab nichts gehört.', 'I didn’t hear anything.')); return; }
    const blob = new Blob(chunks, { type: mime });
    if (blob.size < 1500) { setState('idle', L('Das war zu kurz.', 'That was too short.')); return; }
    setState('think', L('Ich hör mir das an …', 'Listening back …'));
    const my = ++gen;
    ctrl = new AbortController();
    try {
      const res = await ask('stt', { audio: await b64(blob), mime }, { signal: ctrl.signal });
      if (my !== gen) return;
      ctrl = null;
      const t = String(res.text || '').trim();
      if (!t) { setState('idle', L('Ich hab nichts verstanden.', 'I didn’t catch that.')); return; }
      state = 'idle'; await submit(t);
    } catch (e) {
      if (my !== gen) return;
      ctrl = null;
      setState('idle', e?.name === 'AbortError' ? L('Gestoppt.', 'Stopped.') : '');
      if (e?.name !== 'AbortError') apiError(e);
    }
  }
  mic.addEventListener('click', () => { if (state === 'listen') return stopListen(); if (state === 'think') return; startListen(); });

  // ---------- Stopp ----------
  function stopAll(quiet) {
    if (state === 'idle' && !ctrl && !rec) return;
    gen++;
    if (rec) stopListen('stop');
    if (ctrl) { try { ctrl.abort(); } catch (e) {} ctrl = null; }
    try { audio.pause(); } catch (e) {}
    setState('idle', quiet ? '' : L('Gestoppt.', 'Stopped.'));
  }

  // ---------- Tastatur ----------
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !open || host.classList.contains('hidden')) return;
    if (document.querySelector('body > .modal-bg, body > .voice, .mindmap.mm-full')) return;
    if (!menu.hidden) { closeMenu(); return; }
    const a = document.activeElement;
    const inside = panel.contains(a) || !a || !a.matches('input, textarea, select, [contenteditable], [contenteditable] *');
    if (full) { e.preventDefault(); setFull(false); return; }
    if (inside) { e.preventDefault(); setOpen(false); }
  });

  setFull(false);
  applyEnabled(false);
  placeBub(); coverCheck(); setState('idle');
  api = { applyEnabled, open: () => setOpen(true), close: () => setOpen(false) };
  return api;
}
