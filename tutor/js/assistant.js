// Schwebender Max – ohne Chatbox. Kopf unten rechts → Antippen: schwebende Leiste, Max hört sofort zu.
// Antworten kommen als Stimme + mitlaufender Untertitel, Erklärungen als Tafel direkt über der Seite,
// Befehle (Quiz bauen, Tab öffnen …) führt er selbst aus. Tippen geht mit einem Klick oder einfach lostippen.
import { starBtn as favStar, textKey as favKey, plain as plainT } from './me.js';
import { h, ico, ls, sleep, toast, learningNow } from './util.js';
import { face } from './face.js';
import { ask, onQuota, currentQuota, getAccount } from './api.js';
import { S, save } from './state.js';
import { forChat } from './retrieve.js';
import { apiError, typeOut as typeIt, typePlaceholder, syncOut, aiTag } from './ui.js';
import { liveWave } from './wave.js';
import { startLive } from './livestt.js';
import { sanitize, richText } from './sanitize.js';
import { getSpice, thinkLines } from './max.js';
import { VOICES, getVoice, voiceChip } from './voice.js';
import { L, setOutLang, getOutLang } from './i18n.js';
import { speakMath, polishBoard, tableHints } from './math.js';
import { THEMEN } from './themen.js';
import { applyThemeButtons } from './theme.js';
import { getMic, releaseMic as freeMic } from './mic.js';
import { prompt as maxPrompt, mode as maxMode } from './maxcfg.js';
import { knowledge } from './know.js';
import { keepBoards } from './lib.js';
import { tour, tourActive, pauseTour, stopTour, boardSteps, pageMap, byMxId, spotText } from './cursor.js';
import { hasInstant, instantReply } from './boards.js';
import * as Entry from './entry.js';   // Themen-Einstieg: Mini-Check, Live-Quiz, Live-Übung   // Sofort-Tafeln für Themen-Einstiege

const KEY = 'tutor.assistant', CHAT = 'tutor.assistant.chat';
const M = 12;                       // Mindestabstand zum Rand
const BUB = () => document.querySelector('.asst-bub')?.offsetWidth || 96;   // Größe des Kopfs
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
  if (k === 'upload') return { k, label: L('Stoff hochladen', 'Upload material') };
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
if (cfg.v !== 3) { cfg.v = 3; cfg.spk = true; try { localStorage.setItem('tutor.voice', JSON.stringify('max')); } catch (e) {} ls.set(KEY, cfg); }
const saveCfg = () => ls.set(KEY, cfg);
export const isAssistantEnabled = () => cfg.on !== false;
let api = null;                    // gesetzt, sobald gemountet
// Tutor-Raum: Max wohnt dann mitten auf der Seite (Eingabe, Gespräch, Tafel in den Plätzen des Raums)
let STAGE = null;
export function setAssistantEnabled(on) {
  cfg.on = !!on; saveCfg();
  if (api) api.applyEnabled(true);
  dispatchEvent(new CustomEvent('asst:change', { detail: cfg.on }));
}

// ---------- Hilfen ----------
function parse(raw) {
  const boards = [];
  let text = String(raw || '').replace(/```tafel[ \t]*([^\n]*)\n([\s\S]*?)(```|$)/g, (_, t, html) => { boards.push({ title: t.trim() || L('Tafel', 'Whiteboard'), html: html.trim() }); return '\n'; });
  // Seitenführung: ```zeigen [{"id":"m3","say":"…"}] – Max zeigt mit dem Cursor auf echte Stellen der Seite
  let tourSteps = null;
  text = text.replace(/```zeigen[ \t]*\n?([\s\S]*?)(```|$)/g, (_, j) => { try { const a = JSON.parse(String(j).trim()); if (Array.isArray(a)) tourSteps = a.filter(x => x && x.id && x.say).slice(0, 10).map(x => ({ id: String(x.id), say: String(x.say).slice(0, 260) })); } catch (e) {} return '\n'; });
  const acts = [], cmds = [];
  text = text.replace(CMD, (_, k, v) => { const c = cmdOf(k, v); if (c) cmds.push(c); return ''; });
  // Kein Skript, aber „mach mir einen Podcast zu X“: erst Kurzskript, danach direkt genau dieses Werkzeug
  const tp = cmds.find(c => c.k === 'topic'), mk = cmds.find(c => c.k === 'make');
  if (tp && mk) { tp.target = mk.v === 'exam' ? 'quiz' : MAKE[mk.v][0]; cmds.splice(cmds.indexOf(mk), 1); }
  text = text.replace(/\[\[([a-z:]+)\]\]/g, (_, a) => { if (ACTS[a]) acts.push(a); return ''; });
  text = text.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return { text, boards, acts, cmds, tour: tourSteps };
}
const forHistory = raw => String(raw).replace(/```tafel[ \t]*([^\n]*)\n[\s\S]*?```/g, (_, t) => L(`[An die Tafel geschrieben: ${t.trim() || 'Tafel'}]`, `[Written on the whiteboard: ${t.trim() || 'Whiteboard'}]`)).replace(/```zeigen[\s\S]*?```/g, L('[Auf der Seite mit dem Cursor gezeigt]', '[Shown on the page with the cursor]')).slice(0, 2400);
const b64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const TOURQ = /^\s*(führ|fuehr) mich (durch|rum|herum)|^\s*walk me through/i;
const PAGES = { faecher: L('Fächer & Noten', 'Subjects & grades'), skripte: L('Bibliothek', 'Library'), bibliothek: L('Bibliothek', 'Library'), gemerkt: L('Gemerkt', 'Saved'), fortschritt: L('Fortschritt', 'Progress'), stundenplan: L('Stundenplan', 'Timetable'), rechner: L('Rechner', 'Calculators'), challenge: L('Wochen-Challenge', 'Weekly challenge'), lernen: L('Lernen', 'Learn'), me: L('Mein Bereich', 'My space') };
function route() {
  const p = location.hash.replace(/^#\/?/, '').split('/');
  if (p[0] !== 'app') return { tab: null };
  if (p[1] === 'trainer') return { trainer: p[2] || '', tab: 'trainer' };
  if (!p[1] || p[1] === 'neu') return { tab: p[1] ? 'neu' : 'start' };
  if (p[1] === 'tutor') return { tab: 'room' };
  if (PAGES[p[1]]) return { tab: 'page', page: p[1], arg: p[2] || '' };
  return { docId: p[1], tab: TAB[p[2]] ? p[2] : 'hub', arg: p[3] ? decodeURIComponent(p[3]) : '' };
}
const curDoc = () => { if (STAGE) return STAGE.doc ? STAGE.doc() : null; const r = route(); return r.docId && S.doc && S.doc.id === r.docId ? S.doc : null; };
function placeLabel() {
  const r = route(), d = curDoc();
  if (r.tab === 'trainer') return L('BWL-Trainer', 'Business trainer') + (r.trainer ? ' · ' + r.trainer : '');
  if (r.tab === 'start') return L('Start', 'Start');
  if (r.tab === 'neu') return L('Neues Skript', 'New slides');
  if (r.tab === 'room') return L('Tutor-Raum', 'Tutor room');
  if (r.tab === 'page') { const sub = r.arg ? (document.querySelector('#view h1, #view h2')?.innerText || '').trim() : ''; return PAGES[r.page] + (sub && sub !== PAGES[r.page] ? ' · ' + sub.slice(0, 50) : ''); }
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
  if (STAGE) return STAGE.context ? STAGE.context() : '';
  const r = route(), d = curDoc();
  if (!r.tab) return document.getElementById('landing')?.classList.contains('hidden') ? '' : L('[Seite: Startseite von BWL Max – noch kein Skript offen]', '[Page: BWL Max home page – no slides open yet]');
  const parts = [L('Seite: ', 'Page: ') + (r.tab === 'page' ? placeLabel() : (TAB[r.tab] || (r.tab === 'trainer' ? L('BWL-Trainer', 'Business trainer') + (r.trainer ? ' ' + r.trainer : '') : r.tab)))];
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
  const bub = h('button', { class: 'asst-bub', type: 'button', 'aria-label': L('Mit Max reden', 'Talk to Max'), title: L('Frag Max', 'Ask Max') },
    bubFace, h('i', { class: 'asst-dot' }), h('span', { class: 'asst-tip' }, h('span', {}, L('Klick mich – ich helf dir', 'Tap me – I’ll help you')), h('span', { class: 'tip-x', role: 'button', tabindex: 0, 'aria-label': L('Hinweis schließen', 'Dismiss hint'), html: ico('x') })),
    h('span', { class: 'asst-x', title: L('Max ausblenden', 'Hide Max'), html: ico('x') }),
    h('span', { class: 'asst-bs', title: L('Stopp', 'Stop'), html: SVG.stop }));

  // ----- Leiste („Insel“) -----
  const fEl = h('span', { class: 'ai-f' });
  const dotsBtn = h('button', { class: 'ai-dots', type: 'button', 'aria-label': L('Einstellungen', 'Settings'), title: L('Stimme, laut/stumm, neues Gespräch', 'Voice, mute, new conversation'), html: SVG.more });
  const moreBtn = h('button', { class: 'ai-fw', type: 'button', 'aria-label': L('Einstellungen: Stimme, neues Gespräch', 'Settings: voice, new conversation'), title: L('Stimme & Einstellungen', 'Voice & settings'), 'aria-haspopup': 'menu' }, fEl);
  const wave = liveWave(24);
  const stTx = h('span', { class: 'ai-st' });
  const inp = h('input', { class: 'ai-in', type: 'text', enterkeyhint: 'send', autocomplete: 'off', maxlength: 1500, 'aria-label': L('Nachricht an Max', 'Message to Max') });
  // Handy/Touch: kurzer Platzhalter, der ganz reinpasst (kein „Dokument reinziehen“)
  if (matchMedia('(pointer: coarse), (max-width: 600px)').matches) typePlaceholder(inp, L('Frag Max was …', 'Ask Max anything …'), []);
  else typePlaceholder(inp, L('Frag mich was …', 'Ask me anything …'),
    L(['Erklär mir den Kapitalwert', 'Dokument reinziehen oder mit ⌘V einfügen', 'Bau mir ein Quiz', 'Was ist der Break-even?', 'Mach mir Karteikarten', 'Was soll ich heute lernen?', 'Erklär mir latente Steuern'], ['Explain net present value', 'Drag in a document or paste with ⌘V', 'Build me a quiz', 'What is break-even?', 'Make me flashcards', 'What should I study today?', 'Explain deferred taxes']), L('z. B. ', 'e.g. '));
  const mid = h('div', { class: 'ai-mid' }, stTx, wave.el, inp);
  const B = (cls, label, html) => h('button', { class: 'ai-b ' + cls, type: 'button', 'aria-label': label, title: label, html });
  const micBtn = h('button', { class: 'ai-talk', type: 'button', 'aria-label': L('Sprich mit Max', 'Talk to Max') }, h('span', { html: ico('mic') }), h('span', { class: 'lbl' }, L('Sprich mit Max', 'Talk to Max')));
  const sendBtn = B('ai-send primary', L('Senden', 'Send'), ico('send'));
  const doneBtn = B('ai-done primary', L('Fertig', 'Done'), CHECK);
  const stopBtn = B('ai-stop primary', L('Stopp', 'Stop'), SVG.stop);
  const muteBtn = B('ai-mute', '', SVG.spkOn);
  const closeBtn = B('ai-close', L('Einklappen', 'Collapse'), ico('x'));
  // Dokumente rein: Knopf, Reinziehen oder ⌘V ins Eingabefeld
  const attIn = h('input', { type: 'file', multiple: true, hidden: true, accept: '.pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.rtf,.odt,.odp,image/*', onchange: e => { const fs = [...(e.target.files || [])]; e.target.value = ''; addFiles(fs); } });
  const attBtn = h('button', { class: 'ai-att', type: 'button', 'aria-label': L('Dokument hinzufügen', 'Add a document'), title: L('Dokument hinzufügen – oder einfach reinziehen bzw. mit ⌘V einfügen', 'Add a document – or just drag it in or paste with ⌘V'), 'aria-haspopup': 'dialog', onclick: e => { e.stopPropagation(); toggleDrop(); } },
    h('span', { html: ico('plus') }), h('span', { class: 'lbl' }, L('Dokument', 'Document')));
  const tourBtn = h('button', { class: 'ai-tourb', type: 'button', title: L('Max zeigt dir mit seinem Cursor, was auf dieser Seite wichtig ist', 'Max shows you with his cursor what matters on this page'), onclick: () => pageTour() },
    h('span', { html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5 18.5 11 12.4 12.4 9.6 18.6z"/></svg>' }), h('span', { class: 'lbl' }, L('Führ mich durch', 'Walk me through')));
  const isl = h('div', { class: 'ai-isl', role: 'group', 'aria-label': L('Max', 'Max') },
    moreBtn, dotsBtn, attBtn, mid, muteBtn, micBtn, tourBtn, sendBtn, doneBtn, stopBtn, closeBtn, attIn);
  const vDesc = h('div', { class: 'ai-vdesc' });
  const voiceChips = VOICES.map(([k, l, d]) => voiceChip(k, l, d, () => { ls.set('tutor.voice', k); drawMenu(); }));
  const menu = h('div', { class: 'ai-menu', role: 'menu', hidden: true },
    h('button', { class: 'ai-mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => closeMenu() }),
    h('div', { class: 'eyebrow ai-me' }, L('Stimme', 'Voice')), h('div', { class: 'asst-vch' }, voiceChips), vDesc,
    h('button', { class: 'asst-mi ai-mi-mute', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); muteBtn.click(); } }),
    h('button', { class: 'asst-mi', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); newTalk(); } }, h('span', { html: ico('refresh') }), L('Neues Gespräch', 'New conversation')),
    h('button', { class: 'asst-mi ai-mi-quip', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); toggleQuips(); } }),
    h('button', { class: 'asst-mi', type: 'button', role: 'menuitem', onclick: () => { closeMenu(); setAssistantEnabled(false); } }, h('span', { html: ico('x') }), L('Max ausblenden', 'Hide Max')));

  // ----- Untertitel-Karte (schwebt über der Leiste, wegwischbar) -----
  // Gespräch als einzelne Blasen, die über der Seite schweben (kein Kasten)
  let capQ = null, capA = null, capX = null, curEx = null;
  const feedList = h('div', { class: 'ai-fl' });
  const feedTog = h('button', { class: 'ai-ft', type: 'button' });
  const srLive = h('div', { class: 'sr', 'aria-live': 'polite' });
  // Handy: Verlauf/Antwortkarte standardmäßig zu – nur ein schlanker Knopf direkt über der Eingabe.
  // Auf geht sie von selbst nur, wenn du selbst gefragt hast (getippt, gesprochen, Knopf); beim Themen-Einstieg bleibt sie zu.
  const mHist = h('button', { class: 'm-hist', type: 'button', hidden: true, onclick: () => { fold(false); setFeedOpen(!feedOpen, { user: true }); } });
  function fold(v) { root.classList.toggle('m-fold', !!v); drawHist(); }
  function drawHist() {
    const f = root.classList.contains('m-fold') || !feedOpen, n = feedList.querySelectorAll('.ai-bub').length;
    mHist.hidden = !MOB.matches || !n;
    mHist.replaceChildren(h('span', { html: ico(f ? 'up' : 'down') }), f ? L('Verlauf ansehen', 'Show history') : L('Verlauf schließen', 'Close history'));
    placeHist();
  }
  function placeHist() {
    if (mHist.hidden && !(MOB.matches && boardMin)) return;
    const put = () => { const tops = [isl, STAGE?.slots?.composer].filter(e => e && e.isConnected).map(e => e.getBoundingClientRect()).filter(r => r.height).map(r => r.top); if (tops.length) { const bt = Math.max(8, Math.round(innerHeight - Math.min(...tops) + 8)) + 'px'; mHist.style.bottom = bt; root.style.setProperty('--m-hb', bt); } };
    requestAnimationFrame(put); setTimeout(put, 450);
  }
  addEventListener('resize', placeHist);
  try { new ResizeObserver(() => placeHist()).observe(isl); } catch (e) {}
  const cap = h('div', { class: 'ai-feed' }, feedList, srLive);
  const seenBefore = !!ls.get('tutor.asst.seen');   // wer Max schon kennt, bekommt keine Begrüßung mehr
  let feedOpen = MOB.matches;   // Handy: Verlauf ist offen und geht nur zu, wenn man selbst auf „Verlauf schließen“ tippt

  const bd = h('div', { class: 'ai-bd', 'aria-hidden': 'true' });
  const bSay = h('div', { class: 'ai-bsay', 'aria-hidden': 'true' });
  // ----- Tafel direkt über der Seite -----
  const bTitle = h('b', {});
  const bCount = h('span', { class: 'cnt' });
  const bPrev = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Vorherige Tafel', 'Previous board'), html: ico('left'), onclick: () => goBoard(-1) });
  const bNext = h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Nächste Tafel', 'Next board'), html: ico('right'), onclick: () => goBoard(1) });
  const bTour = h('button', { class: 'iconbtn ai-btour', type: 'button', hidden: true, 'aria-label': L('Mit dem Cursor erklären', 'Explain with the cursor'), title: L('Zeig’s mir – Schritt für Schritt mit dem Cursor', 'Show me – step by step with the cursor'), html: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5 18.5 11 12.4 12.4 9.6 18.6z"/></svg>', onclick: () => { const st = boardSteps(bArea.querySelector('.tafel')); if (st.length) startTour(st); } });
  const bMin = h('button', { class: 'iconbtn ai-bmin', type: 'button', 'aria-label': L('Tafel minimieren', 'Minimise board'), title: L('Minimieren – liegt dann griffbereit am Rand', 'Minimise – stays at the edge'), html: SVG.min, onclick: () => minBoard(true) });
  const bAsk = h('div', { class: 'ai-bask', hidden: true, role: 'alertdialog', 'aria-label': L('Tafel löschen?', 'Delete board?') },
    h('b', {}, L('Tafel löschen?', 'Delete this board?')),
    h('p', {}, L('Sie verschwindet dann auch aus deiner Bibliothek. Nur zumachen? Tipp auf ×.', 'It will also disappear from your library. Just want to close it? Tap ×.')),
    h('div', { class: 'ai-bask-r' },
      h('button', { class: 'btn sm ai-del', type: 'button', onclick: () => { askBoard(false); deleteBoard(); } }, L('Löschen', 'Delete')),
      h('button', { class: 'btn sm ai-delall', type: 'button', onclick: () => { askBoard(false); deleteAllBoards(); } }, h('span', { html: ico('trash') }), h('span', { class: 'ai-dan' })),
      h('button', { class: 'btn sm', type: 'button', onclick: () => { askBoard(false); minBoard(true); } }, h('span', { html: SVG.min }), L('Zur Seite legen', 'Put aside')),
      h('button', { class: 'btn sm ghost', type: 'button', onclick: () => askBoard(false) }, L('Abbrechen', 'Cancel'))));
  // × schließt nur – jede Tafel liegt ohnehin in der Bibliothek. Löschen gibt’s separat (Papierkorb).
  const bClose = h('button', { class: 'iconbtn ai-bclose', type: 'button', 'aria-label': L('Tafel schließen', 'Close board'), title: L('Schließen – bleibt in deiner Bibliothek', 'Close – it stays in your library'), html: ico('x'), onclick: () => { askBoard(false); stopTour(); closeBoard(); } });
  const bDl = h('button', { class: 'iconbtn ai-bdl', type: 'button', 'aria-label': L('Tafel herunterladen', 'Download board'), title: L('Herunterladen (PDF)', 'Download (PDF)'), html: ico('download'), onclick: () => import('./export.js').then(E => {
    const b = boards[bIdx]; if (!b) return;
    E.pick(boards.length > 1 ? [{ label: L('Diese Tafel', 'This board'), sub: 'PDF', ic: 'board', fn: () => E.boardsPdf([b]) }, { label: L(`Alle ${boards.length} Tafeln`, `All ${boards.length} boards`), sub: 'PDF', ic: 'board', fn: () => E.boardsPdf(boards, (curDoc() || S.doc)?.name) }] : [{ label: 'PDF', ic: 'file', fn: () => E.boardsPdf([b]) }]);
  }) });
  const bDel = h('button', { class: 'iconbtn ai-bdel', type: 'button', 'aria-label': L('Tafel löschen', 'Delete board'), title: L('Löschen', 'Delete'), html: ico('trash'), onclick: () => askBoard(bAsk.hidden) });
  // Handy: Zeiger, Herunterladen und Löschen wandern in ein „…“-Menü, damit der Titel Platz hat
  const bMenu = h('div', { class: 'm-bmenu', role: 'menu', hidden: true });
  const bMore = h('button', { class: 'iconbtn m-bmore', type: 'button', 'aria-label': L('Mehr', 'More'), title: L('Mehr', 'More'), 'aria-haspopup': 'menu', 'aria-expanded': 'false', html: SVG.more, onclick: e => { e.stopPropagation(); bMenuOpen(bMenu.hidden); } });
  function bMenuOpen(v) {
    bMenu.hidden = !v; bMore.setAttribute('aria-expanded', v ? 'true' : 'false');
    if (!v) return;
    const it = (ic, label, btn) => h('button', { class: 'm-bmi', type: 'button', role: 'menuitem', onclick: () => { bMenuOpen(false); btn.click(); } }, h('span', { html: ic }), label);
    bMenu.replaceChildren(...[
      bTour.hidden ? null : it('<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5 18.5 11 12.4 12.4 9.6 18.6z"/></svg>', L('Mit dem Cursor erklären', 'Explain with the cursor'), bTour),
      it(ico('download'), L('Herunterladen (PDF)', 'Download (PDF)'), bDl),
      it(ico('trash'), L('Tafel löschen', 'Delete board'), bDel)].filter(Boolean));
  }
  document.addEventListener('click', e => { if (!bMenu.hidden && !e.target.closest('.m-bmenu, .m-bmore')) bMenuOpen(false); });
  function drawBMore() { bMenuOpen(false); }
  // Vollbild: Tafel über den ganzen Bildschirm (Fullscreen-API, sonst – z. B. iPhone – per CSS)
  const FS_IN = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  const FS_OUT = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  const bFs = h('button', { class: 'iconbtn m-bfs', type: 'button', 'aria-label': L('Vollbild', 'Fullscreen'), title: L('Vollbild', 'Fullscreen'), html: FS_IN, onclick: () => setFs(!board.classList.contains('m-fs')) });
  function setFs(v) {
    v = !!v; const was = board.classList.contains('m-fs');
    if (v === was) return;
    board.classList.toggle('m-fs', v); root.classList.toggle('m-fsr', v); document.documentElement.classList.toggle('m-fsdoc', v);
    bFs.innerHTML = v ? FS_OUT : FS_IN;
    const lb = v ? L('Vollbild beenden', 'Exit fullscreen') : L('Vollbild', 'Fullscreen'); bFs.setAttribute('aria-label', lb); bFs.title = lb;
    try {
      if (v && board.requestFullscreen && !document.fullscreenElement) board.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      else if (!v && document.fullscreenElement === board) document.exitFullscreen().catch(() => {});
    } catch (e) {}
    // Formeln und Tabellen an die neue Breite anpassen
    const refit = () => { try { window.dispatchEvent(new Event('resize')); } catch (e) {} const t = bArea.querySelector('.tafel'); if (t) tableHints(t); };
    requestAnimationFrame(refit); setTimeout(refit, 350);
  }
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && board.classList.contains('m-fs')) setFs(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && board.classList.contains('m-fs') && !document.fullscreenElement) setFs(false); });
  const bArea = h('div', { class: 'ai-ba dots' });
  const bGrab = h('div', { class: 'ai-grab', 'aria-hidden': 'true' }, h('i'));
  const board = h('section', { class: 'ai-board', role: 'region', 'aria-label': L('Max’ Tafel', 'Max’s board') },
    bGrab, h('div', { class: 'ai-bh' }, h('span', { html: ico('board') }), bTitle, bCount, bPrev, bNext, bTour, bDl, bDel, bFs, bMore, bMin, bClose), bMenu, bAsk, bArea, bSay);
  const bTab = h('button', { class: 'ai-btab', type: 'button', 'aria-label': L('Tafel aufklappen', 'Open board') }, h('span', { html: ico('board') }), h('span', { class: 'm-btl' }, L('Tafel', 'Board')), h('span', { class: 'm-btm' }, L('Zurück zur Tafel', 'Back to the board')));
  // ---------- Handy: die Tafel ist die Seite ----------
  // Rechts unten Max (öffnet den Chat), daneben drei grüne Knöpfe: Quiz, Beispiel, passender Trainer
  const pFace = h('span', { class: 'm-pmf' });
  const pMax = h('button', { class: 'm-pmax', type: 'button', 'aria-label': L('Mit Max chatten', 'Chat with Max'), title: L('Frag Max', 'Ask Max'), onclick: () => pChat(!root.classList.contains('m-pchat')) }, pFace, h('span', { class: 'm-pmx', html: ico('x') }));
  const pQuiz = h('button', { class: 'm-pb', type: 'button', onclick: () => { const c = entryCtx(); if (c) Entry.quiz(c); } }, h('span', { class: 'm-pbi', html: ico('quiz') }), h('span', { class: 'm-pbl' }, L('Quiz mich dazu', 'Quiz me on this')), h('span', { class: 'm-pbs' }, L('Quiz', 'Quiz')));
  const pTr = h('button', { class: 'm-pb', type: 'button', onclick: () => { const c = entryCtx(); if (c) Entry.exercise(c); } }, h('span', { class: 'm-pbi', html: ico('whistle') }), h('span', { class: 'm-pbl' }), h('span', { class: 'm-pbs' }, L('Üben', 'Practise')));
  const pBtns = h('div', { class: 'm-pbtns' }, pQuiz, pTr);
  // Gedankenblase neben dem kleinen Max (Kommentare beim Scrollen, Gedanken beim Bauen)
  const pBub = h('div', { class: 'm-pbub', role: 'status', 'aria-live': 'polite', hidden: true });
  const pDim = h('div', { class: 'm-pdim', 'aria-hidden': 'true', onclick: () => pChat(false) });
  let pBubT = 0, pThinkT = 0;
  function pSay(text, ms = 4000) {
    if (!pageOn || !text) return;
    clearTimeout(pBubT); pBub.textContent = text; pBub.hidden = false;
    pBub.classList.remove('in'); void pBub.offsetWidth; pBub.classList.add('in');
    if (ms) pBubT = setTimeout(() => { if (!pThinkT) pBub.hidden = true; }, ms);
  }
  function pThink(lines) {
    clearInterval(pThinkT); pThinkT = 0;
    if (!lines) { pBub.hidden = true; return; }
    let k = 0; pSay(lines[k++], 0);
    pThinkT = setInterval(() => pSay(lines[k++ % lines.length], 0), 2800);
  }
  const pBusy = () => root.classList.contains('m-pchat') || !!pThinkT || [...document.querySelectorAll('.bmc:not(.out), .mtip2:not(.out)')].some(e => e.getClientRects().length);
  // Kurzer Themenname (für „Bilanz üben“) und Wortstamm (für „Dein Bilanz-Quiz“)
  const NAME = { bilanz: ['Bilanz', 'Bilanz'], buchungssatz: ['Buchungssätze', 'Buchungssatz'], kapitalwert: ['Kapitalwert', 'Kapitalwert'], deckungsbeitrag: ['Deckungsbeitrag', 'Deckungsbeitrags'], 'break-even': ['Break-even', 'Break-even'], guv: ['GuV', 'GuV'], swot: ['SWOT', 'SWOT'], abschreibung: ['Abschreibung', 'Abschreibungs'], 'marketing-mix': ['Marketing-Mix', 'Marketing-Mix'], zuschlagskalkulation: ['Zuschlagskalkulation', 'Kalkulations'], bwl: ['BWL', 'BWL'] };
  function topicOf(b, tr) {
    if (b.slug && NAME[b.slug]) return NAME[b.slug];
    if (b.slug && THEMEN[b.slug]) { const n = THEMEN[b.slug][0]; return [n, /\s/.test(n) ? '' : n]; }
    if (tr) { const n = tr[1].replace(/\s+üben$/, '').replace(/^Practi[cs]e\s+/, ''); return [n, /\s/.test(n) ? '' : n.replace(/sätze$/, 'satz')]; }
    const n = String(b.title || '').split(/\s[–—-]\s|:/)[0].trim().slice(0, 32); return [n, ''];
  }
  const entryNotes = [];
  function entryCtx() {
    const b = boards[bIdx], t = bArea.querySelector('.tafel'); if (!b || !t || building) return null;
    const tr = trainerFor(b.title + ' ' + (b.slug || '') + ' ' + buildTitle), [topic, stem] = topicOf(b, tr);
    return { t, b, slug: b.slug || '', topic, stem, trainer: tr ? tr[0] : '', scroller: bArea, say: pSay, think: pThink, note: n => { entryNotes.push(n); if (entryNotes.length > 6) entryNotes.shift(); }, busy: pBusy };
  }
  function drawPage(b) {
    const c = b ? entryCtx() : null;
    pTr.querySelector('.m-pbl').textContent = c ? `${c.topic} ${L('üben', 'practise')} · BWL-Trainer` : L('Üben · BWL-Trainer', 'Practise · trainer');
    pBtns.classList.remove('m-small');
  }
  // Kleiner Max-Chat über der Seite – man bleibt auf der Seite
  function pChat(v) {
    v = !!v && pageOn;
    root.classList.toggle('m-pchat', v);
    if (v) { pThink(null); fold(false); if (feedOpen) setFeedOpen(false, { instant: true }); capScroll(); setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 60); }
    else { try { inp.blur(); } catch (e) {} }
  }
  // Chat öffnen (Tafel bleibt griffbereit: „Zurück zur Tafel“)
  function toChat(quietly) { if (boardOpen && !boardMin) minBoard(true, true); fold(false); if (!quietly) setFeedOpen(true); }
  function bootDone() { document.documentElement.classList.remove('m-eboot'); }
  let pageOn = false;
  function syncPage() {
    const v = MOB.matches && boardOpen && !boardMin;
    if (v) { const tb = document.querySelector('.topbar'); const r = tb && tb.getClientRects().length ? tb.getBoundingClientRect() : null; root.style.setProperty('--m-top', Math.max(0, Math.round(r ? r.bottom : 0)) + 'px'); }
    root.classList.toggle('m-page', v); document.documentElement.classList.toggle('m-boardpage', v);
    if (!v) { root.classList.remove('m-pchat'); pThink(null); }
    if (v !== pageOn) { pageOn = v; setTimeout(syncRet, 0); const t = bArea.querySelector('.tafel'); requestAnimationFrame(() => { try { window.dispatchEvent(new Event('resize')); } catch (e) {} if (t) tableHints(t); }); }
  }
  // ---------- Zurück zur Themenseite (Handy) ----------
  // Wer die Seite verlässt (Tutor, Lernen, Fächer …), sieht oben rechts „Zurück zu Bilanz ✕“ – ein Tipp und man ist genau dort, wo man war.
  const mRet = h('button', { class: 'm-ret', type: 'button', hidden: true, onclick: () => backToPage() }, h('span', { class: 'm-retl' }), h('span', { class: 'm-retx', html: ico('x') }));
  document.body.appendChild(mRet);
  let retIdx = -1;
  function retLabel() { const b = boards[retIdx]; if (!b) return ''; const tr = trainerFor(b.title + ' ' + (b.slug || '')); return topicOf(b, tr)[0] || L('Tafel', 'board'); }
  function syncRet() {
    if (pageOn) retIdx = bIdx;
    const show = MOB.matches && !pageOn && !/^#\/app\/tutor/.test(location.hash) && retIdx >= 0 && !!boards[retIdx] && !document.documentElement.classList.contains('m-rlock') && !root.classList.contains('m-pchat');
    mRet.hidden = !show;
    if (show) { mRet.querySelector('.m-retl').textContent = L('Zurück zu ', 'Back to ') + retLabel(); const tb = document.querySelector('.topbar'); const r = tb && tb.getClientRects().length ? tb.getBoundingClientRect() : null; mRet.style.top = Math.max(8, Math.round((r ? r.bottom : 0) + 8)) + 'px'; }
  }
  function backToPage() {
    if (retIdx < 0 || !boards[retIdx]) return false;
    const open1 = () => { if (bIdx !== retIdx) { bIdx = retIdx; try { drawBoard(false); } catch (e) {} } openBoard(); syncPage(); syncRet(); };
    if (!/^#\/app\/tutor/.test(location.hash)) { location.hash = '#/app/tutor'; setTimeout(open1, 260); } else open1();
    return true;
  }
  addEventListener('bm:back-to-page', e => { if (MOB.matches && backToPage()) e.preventDefault(); });
  addEventListener('hashchange', () => setTimeout(syncRet, 30));
  // „Tutor“ oben links auf der Themenseite: Seite zur Seite legen, Tutor-Raum zeigen (für Gäste mit Anmeldung) – X bringt zurück
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-tn="tutor"]'); if (!a || !MOB.matches || !pageOn) return;
    e.preventDefault(); retIdx = bIdx; minBoard(true, true); syncPage(); syncRet();
    import('./roomlock.js').then(m => m.lockRoom()).catch(() => {});
  }, true);

  // Beim Runterscrollen werden die Knöpfe klein, beim Hochscrollen und am Ende wieder groß
  let pLast = 0;
  bArea.addEventListener('scroll', () => {
    if (!pageOn) return;
    const y = bArea.scrollTop, end = bArea.scrollHeight - bArea.clientHeight - y < 80;
    if (end || y < 60) pBtns.classList.remove('m-small');
    else if (y > pLast + 6) pBtns.classList.add('m-small');
    else if (y < pLast - 6) pBtns.classList.remove('m-small');
    pLast = y;
  }, { passive: true });

  const chip = h('button', { class: 'asst-back', type: 'button' }, h('span', { class: 'asst-cf' }), L('Max zurückholen', 'Bring Max back'));
  const quip = h('div', { class: 'asst-quip', role: 'status', hidden: true });
  const ctxm = h('div', { class: 'asst-ctx', role: 'menu', hidden: true });
  const root = h('div', { class: 'asst' + (ls.get('tutor.asst.seen') ? ' seen' : '') + '', 'data-state': 'idle' }, bd, board, bTab, cap, feedTog, mHist, isl, menu, quip, ctxm, bub, pDim, pBtns, pBub, pMax);
  document.body.appendChild(root);
  const bf = face(bubFace, { sleepy: true }), fc = face(fEl, { follow: false }); face(pFace, { sleepy: true });
  MOB.addEventListener?.('change', () => syncPage());
  addEventListener('resize', () => { if (pageOn) { const tb = document.querySelector('.topbar'); if (tb) root.style.setProperty('--m-top', Math.round(tb.getBoundingClientRect().bottom) + 'px'); } });

  // ---------- Sichtbarkeit ----------
  function applyEnabled(announce) {
    const on = isAssistantEnabled() || !!STAGE;
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
    const side = document.querySelector('#app .app.sideopen');
    const land = !r.tab && !document.getElementById('landing')?.classList.contains('hidden');
    root.classList.toggle('land', land);
    root.classList.toggle('landtop', land && scrollY < 140);
    root.classList.toggle('covered', covered);
    root.classList.toggle('nobub', !!side);
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
  addEventListener('hashchange', () => setTimeout(placeBub, 0));

  // ---------- Kopf verschieben ----------
  const vw = () => document.documentElement.clientWidth, vh = () => innerHeight;
  function placeBub() {
    const p = cfg.bub || { r: 18, b: 18 };
    // Auf dem Handy liegt unten die Navigationsleiste – der Kopf sitzt darüber
    const bb = document.documentElement.classList.contains('has-bbar') && !document.getElementById('app')?.classList.contains('hidden') && matchMedia('(max-width: 720px)').matches ? 64 : 0;
    const r = clamp(p.r, 6, vw() - BUB() - 6), b = clamp(p.b, 6, vh() - BUB() - 6 - bb) + bb;
    bub.style.right = r + 'px'; bub.style.bottom = `calc(${b}px + env(safe-area-inset-bottom, 0px))`;
    root.style.setProperty('--qr', r + 'px'); root.style.setProperty('--qb', b + 'px');
    return { r, b };
  }
  addEventListener('resize', () => { placeBub(); coverCheck(); });
  function dragger(el, { start, move, end, threshold = 4 }) {
    el.addEventListener('pointerdown', e => {
      const t = e.target.closest('button, textarea, input, a, .ai-menu');
      if (e.button !== 0 || (t && t !== el)) return;
      if (start && start(e) === false) return;
      const sx = e.clientX, sy = e.clientY; let moved = false, lx = sx, ly = sy;
      const mv = ev => {
        lx = ev.clientX; ly = ev.clientY;
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < threshold) return;
        if (!moved) { moved = true; root.classList.add('dragging'); try { getSelection().removeAllRanges(); } catch (x) {} }
        ev.preventDefault(); move(dx, dy, ev);
      };
      const up = ev => {
        removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        root.classList.remove('dragging');
        if (ev.type === 'pointercancel') { end && end(false, ev, 0, 0); return; }
        end && end(moved, ev, lx - sx, ly - sy);
      };
      addEventListener('pointermove', mv, { passive: false }); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
  }
  let bubStart = null, justDragged = false;
  dragger(bub, {
    start: () => { bubStart = placeBub(); },
    move: (dx, dy) => {
      const r = clamp(bubStart.r - dx, 6, vw() - BUB() - 6), b = clamp(bubStart.b - dy, 6, vh() - BUB() - 6);
      bub.style.right = r + 'px'; bub.style.bottom = b + 'px'; cfg.bub = { r, b };
    },
    end: moved => { if (moved) { justDragged = true; setTimeout(() => { justDragged = false; }, 50); saveCfg(); placeBub(); } },
  });
  let closedAt = 0;
  bub.addEventListener('click', e => {
    if (justDragged || Date.now() - closedAt < 500) return;
    if (e.target.closest('.asst-x')) { e.stopPropagation(); setAssistantEnabled(false); return; }
    if (e.target.closest('.asst-bs') && state !== 'idle') { e.stopPropagation(); stopAll(); return; }
    setOpen(true);
  });

  // Blasen zur Seite wischen = ausblenden (kommen mit der nächsten Frage wieder)
  dragger(feedList, {
    threshold: 10,
    start: e => { if (feedOpen || e.target.closest('.ai-x button, .ai-x a') || !e.target.closest('.ai-bub')) return false; feedList.style.transition = 'none'; },
    move: (dx, dy) => { if (Math.abs(dy) > Math.abs(dx) / 2) return; feedList.style.transform = `translateX(${dx}px)`; feedList.style.opacity = String(1 - Math.min(.85, Math.abs(dx) / 220)); },
    end: (moved, ev, dx, dy) => {
      feedList.style.transition = ''; feedList.style.transform = ''; feedList.style.opacity = '';
      if (moved) { feedList._sw = Date.now(); }
      if (moved && !feedOpen && Math.abs(dx) > 110 && Math.abs(dx) > Math.abs(dy) * 2) dismissCap();
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
  // Schließen: Insel, Verlauf und Tafel ziehen sich sauber in den Kopf rechts zurück (ohne Überschwingen)
  let closing = null;
  // „Klick mich“-Hinweis: kommt zügig, bleibt ein paar Sekunden, lässt sich wegklicken,
  // und kommt wieder, solange Max noch nie benutzt wurde
  let tipOff = false, tipVisSince = 0, tipNext = 0, tipHideT = 0, tipN = 0;
  const tipX = bub.querySelector('.tip-x');
  const hideTip = () => { clearTimeout(tipHideT); root.classList.remove('tip-on'); };
  tipX.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); tipOff = true; hideTip(); });
  tipX.addEventListener('pointerdown', e => e.stopPropagation());
  const tipTx = bub.querySelector('.asst-tip > span');
  const inApp = () => { const r = route(); return !!r.tab && r.tab !== 'room'; };
  // „Klick mich – ich führ dich durch“ nur beim ersten Besuch einer Seite (danach steht der Knopf im Chat)
  let tipKey = null;
  const tourKey = () => { const r = route(); if (r.tab === 'page') return r.page + (r.arg ? ':' + r.arg : ''); if (r.tab === 'trainer') return 'trainer:' + (r.trainer || ''); if (r.docId) return 'doc:' + r.tab; return r.tab || ''; };
  addEventListener('hashchange', () => { tipOff = false; tipKey = null; drawButtons(); setTimeout(drawButtons, 120); });
  bub.querySelector('.asst-tip').addEventListener('click', e => { if (e.target.closest('.tip-x') || !inApp()) return; e.preventDefault(); e.stopPropagation(); hideTip(); pageTour(); });
  setInterval(() => {
    const app = inApp();
    if (tipOff || (!app && ls.get('tutor.asst.seen'))) { if (root.classList.contains('tip-on')) hideTip(); return; }
    const vis = !open && !document.hidden && isAssistantEnabled() && !STAGE && !tourActive() && !['landtop', 'covered', 'nobub', 'quipping', 'dragging', 'off'].some(c => root.classList.contains(c));
    if (!vis) { tipVisSince = 0; if (root.classList.contains('tip-on')) hideTip(); return; }
    const now = Date.now();
    if (!tipVisSince) tipVisSince = now;
    // In der App: dauerhaft „Klick mich – ich führ dich durch“
    if (app && learningNow()) { if (root.classList.contains('tip-on')) hideTip(); return; }   // mitten im Lernen: keine Führung
    if (app) {
      const k = tourKey(), seen = ls.get('tutor.tour.seen', {}) || {};
      if (location.hash.startsWith('#/app/zahlen')) { if (root.classList.contains('tip-on')) hideTip(); return; }   // Bens Zahlen: keine Führung
      if (tipKey !== k) {
        if (seen[k]) { if (root.classList.contains('tip-on')) hideTip(); return; }
        if (now - tipVisSince < 900) return;
        tipKey = k; seen[k] = 1; ls.set('tutor.tour.seen', seen);
      }
      root.classList.add('tip-tour');
      tipTx.textContent = L('Klick mich – ich führ dich durch', 'Tap me – I’ll walk you through');
      if (!root.classList.contains('tip-on') && now - tipVisSince >= 900) root.classList.add('tip-on');
      return;
    }
    root.classList.remove('tip-tour'); tipTx.textContent = L('Klick mich – ich helf dir', 'Tap me – I’ll help you');
    if (!root.classList.contains('tip-on') && now - tipVisSince >= 1500 && now >= tipNext) {
      root.classList.add('tip-on'); tipN++; tipNext = tipN >= 3 ? Infinity : now + 9000 + 45000;   // höchstens 3× pro Besuch
      clearTimeout(tipHideT); tipHideT = setTimeout(hideTip, 9000);
    }
  }, 400);
  function closeAnimated() {
    if (closing || STAGE) return;
    // Handy mit offener Tastatur: erst Tastatur weg, dann sauber einziehen (sonst springt alles mitten in der Animation)
    if (MOB.matches && document.activeElement === inp) {
      document.activeElement.blur(); closing = []; setTimeout(() => { closing = null; if (open) closeAnimated(); }, 320); return;
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setOpen(false); return; }
    // Spiegelbild vom Öffnen: Inhalte der Leiste gehen nacheinander raus, dann sinkt die Leiste weich weg,
    // Blasen und Tafel gleiten nach unten und blenden aus. Nur Transform + Deckkraft, keine Effekte umschalten.
    const ease = 'cubic-bezier(.4,0,.2,1)';
    const anims = [];
    const items = [closeBtn, micBtn, doneBtn, stopBtn, sendBtn, muteBtn, mid, dotsBtn, moreBtn].filter(e => !e.hidden && e.getClientRects().length);
    items.forEach((e, i) => anims.push(e.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px) scale(.96)' }], { duration: 180, delay: Math.min(i, 5) * 16, easing: ease, fill: 'forwards' })));
    const t0 = 70;   // Leiste geht fast gleichzeitig mit ihrem Inhalt – keine leere Hülle, die stehen bleibt
    anims.push(isl.animate([{ opacity: 1, transform: 'translateX(-50%)' }, { opacity: 0, transform: 'translate(-50%, 14px) scale(.94)' }], { duration: 260, delay: t0, easing: ease, fill: 'forwards' }));
    [cap, feedTog].filter(e => e.getClientRects().length).forEach(e => anims.push(e.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 16px' }], { duration: 280, delay: 20, easing: ease, fill: 'forwards' })));
    if (boardOpen && !boardMin && board.getClientRects().length) anims.push(board.animate([{ opacity: 1, translate: '0 0', scale: '1' }, { opacity: 0, translate: '0 18px', scale: '.97' }], { duration: 300, easing: ease, fill: 'forwards' }));
    anims.push(bd.animate([{ opacity: getComputedStyle(bd).opacity }, { opacity: 0 }], { duration: 300, easing: 'ease', fill: 'forwards' }));
    closing = anims;
    Promise.all(anims.map(a => a.finished.catch(() => {}))).then(() => {
      if (closing !== anims) return;
      closing = null; setOpen(false);
      requestAnimationFrame(() => anims.forEach(a => a.cancel()));
    });
  }
  function setOpen(v, { listen = false } = {}) {
    if (v && !isAssistantEnabled() && !STAGE) return;
    if (closing) { const a = closing; closing = null; a.forEach(x => x.cancel()); if (!v) return; }
    if (v === open) { if (v && listen && state === 'idle') startListen(); return; }
    open = !!v;
    root.classList.toggle('open', open);
    syncLock();
    closeMenu();
    if (open) {
      unread(false); try { window.BM && window.BM.track('Max geöffnet'); } catch (e) {}
      if (!STAGE) isl.animate([{ opacity: 0, transform: 'translate(-50%, 14px) scale(.92)' }, { opacity: 1, transform: 'translateX(-50%)' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
      if (!ls.get('tutor.asst.seen')) { ls.set('tutor.asst.seen', 1); root.classList.add('seen'); }
      if (!quip.hidden) hideQuip(); ctxm.hidden = true;
      if (STAGE) ls.set('tutor.asst.greeted', 1); else greet(listen);
      if (feedList.children.length) showCap();
      capScroll();
      if (listen) startListen(); else setState(state);
      if (!MOB.matches && !listen) setTimeout(() => { if (open && state === 'idle') inp.focus({ preventScroll: true }); }, 60);
    } else {
      setTyping(false); closedAt = Date.now();
      if (feedOpen) setFeedOpen(false, { instant: true });   // nächstes Öffnen: Verlauf wieder zu
      if (state === 'listen') stopListen('stop');
      if (document.activeElement && isl.contains(document.activeElement)) document.activeElement.blur();
    }
  }
  closeBtn.addEventListener('click', () => closeAnimated());
  document.addEventListener('keydown', e => {
    if (!open || root.classList.contains('off')) return;
    if (e.key === 'Escape') {
      if (document.querySelector('body > .modal-bg, body > .voice, .mindmap.mm-full')) return;
      if (!menu.hidden) { closeMenu(); return; }
      e.preventDefault();
      if (state === 'listen') { stopListen('stop'); return; }
      if (STAGE) { if (document.activeElement === inp) inp.blur(); return; }
      closeAnimated(); return;
    }
    // Laptop: einfach lostippen
    const a = document.activeElement;
    if (!typing && state === 'idle' && e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey && (!a || a === document.body || root.contains(a)) && !document.querySelector('body > .modal-bg')) {
      if (state === 'listen') stopListen('stop');
      setTyping(true);
    }
  });

  // ---------- Tippen ----------
  function setTyping(v) {
    if (v) { listenTok++; if (state === 'listen') stopListen('stop'); inp.focus({ preventScroll: true }); }
    else inp.blur();
  }
  inp.addEventListener('focus', () => { typing = true; if (state === 'listen') stopListen('stop'); });
  inp.addEventListener('blur', () => { typing = false; });
  inp.addEventListener('input', drawButtons);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendTyped(); } if (e.key === 'Escape') { e.preventDefault(); setTyping(false); } });
  sendBtn.addEventListener('click', () => sendTyped());
  function sendTyped() { const t = inp.value.trim(); if (!t) { inp.focus(); return; } inp.value = ''; viaVoice = false; setTyping(false); submit(t); }

  // ---------- Knöpfe je nach Zustand ----------
  function drawButtons() {
    const s = state;
    const show = (b, v) => { b.hidden = !v; };
    const hasTx = !!inp.value.trim();
    show(muteBtn, s === 'speak' || s === 'think');
    show(dotsBtn, s === 'idle');
    show(attBtn, s === 'idle');
    show(micBtn, s === 'idle');   // „Sprich mit Max“ steht immer unter dem Textfeld
    show(tourBtn, s === 'idle' && !STAGE && !!route().tab && route().tab !== 'room');
    show(sendBtn, s === 'idle' && hasTx);
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
  micBtn.addEventListener('click', () => { inp.blur(); typing = false; startListen(); });
  doneBtn.addEventListener('click', () => stopListen());
  stopBtn.addEventListener('click', () => stopAll());

  // ---------- Menü ----------
  function drawMenu() {
    const v = getVoice(); voiceChips.forEach(c => c.classList.toggle('on', c.dataset.v === v)); vDesc.textContent = (VOICES.find(x => x[0] === v) || [])[2] || '';
    menu.querySelector('.ai-mi-quip').replaceChildren(h('span', { html: ico('bulb') }), cfg.quips === false ? L('Sprüche & Fragen an', 'Turn jokes & questions on') : L('Sprüche & Fragen aus', 'Turn jokes & questions off'));
    menu.querySelector('.ai-mi-mute').replaceChildren(h('span', { html: cfg.spk ? SVG.spkOff : SVG.spkOn }), cfg.spk ? L('Max stumm schalten', 'Mute Max') : L('Max wieder laut', 'Unmute Max'));
  }
  function closeMenu() { menu.hidden = true; moreBtn.setAttribute('aria-expanded', 'false'); }
  dotsBtn.addEventListener('click', e => { e.stopPropagation(); moreBtn.click(); });
  moreBtn.addEventListener('click', e => { e.stopPropagation(); if (menu.hidden) { drawMenu(); menu.hidden = false; moreBtn.setAttribute('aria-expanded', 'true'); } else closeMenu(); });
  document.addEventListener('pointerdown', e => { if (!menu.hidden && !menu.contains(e.target) && !moreBtn.contains(e.target) && !dotsBtn.contains(e.target)) closeMenu(); });
  function newTalk() { stopAll(true); hist = []; ls.set(CHAT, []); feedList.replaceChildren(); curEx = null; markLast(); dismissCap(); closeBoard(); toast(L('Neues Gespräch.', 'New conversation.')); }

  // ---------- Zustand ----------
  function setState(s, msg) {
    state = s; root.dataset.state = s;
    if (pageOn && root.classList.contains('m-pchat')) { if (s === 'think') pThink(Entry.CHAT_THINK); else if (pThinkT) pThink(null); }
    try { STAGE?.onState?.(s); } catch (e) {}
    fc.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
    bf.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
    stTx.textContent = msg ?? ({ idle: L('Tippen oder sprechen', 'Type or talk'), listen: L('Max hört zu …', 'Max is listening …'), think: L('Max überlegt …', 'Max is thinking …'), speak: L('Max redet …', 'Max is talking …') })[s];
    if (s === 'speak') wave.talk(); else if (s !== 'listen') wave.stop();
    drawButtons();
  }
  function unread(v) { root.classList.toggle('unread', !!v); }

  // ---------- Untertitel ----------
  document.addEventListener('touchmove', e => {
    if (!(MOB.matches && open) || STAGE) return;
    const ok = e.target.closest && e.target.closest('.ai-board, .ai-menu, .asst-ctx, .modal-bg, .voice' + (feedOpen ? ', .ai-feed' : ''));
    if (!ok && e.cancelable) e.preventDefault();
  }, { passive: false });
  function syncLock() {
    placeTog();
    const lock = !STAGE && MOB.matches && open && ((feedOpen && root.classList.contains('has-cap')) || (boardOpen && !boardMin));
    root.classList.toggle('lock', lock);
    // Handy: solange Max offen ist, scrollt die Seite dahinter nie mit
    document.documentElement.classList.toggle('asst-lock', !STAGE && MOB.matches && open);
  }
  bd.addEventListener('click', () => { if (boardOpen && !boardMin) minBoard(true); else setFeedOpen(false); });
  // Was Max gerade sagt, steht am Handy unten in der Tafel mit
  new MutationObserver(() => {
    if (!boardOpen) return;
    const last = [...feedList.querySelectorAll('.ai-bub.max:not([hidden]) .ai-a')].pop();
    bSay.innerHTML = last ? last.innerHTML : '';
    bSay.scrollTop = bSay.scrollHeight;
  }).observe(feedList, { childList: true, subtree: true, characterData: true });
  function showCap() { const was = root.classList.contains('has-cap'); root.classList.add('has-cap'); if (!was) capScroll(); syncLock(); }
  function dismissCap() { root.classList.remove('has-cap'); syncLock(); }
  // Verlauf auf-/zuklappen – mit Animation: ältere Blasen gleiten gestaffelt rein/raus, die letzte wächst weich mit
  let feedAnim = 0;
  function setFeedOpen(v, { instant = false, user = false, force = false } = {}) {
    v = !!v;
    if (!v && MOB.matches && !user && !force) return;   // Handy: nie von selbst zuklappen – die letzte Nachricht bleibt auch zu immer sichtbar if (v === feedOpen && root.classList.contains('feed-open') === v) return;
    const tok = ++feedAnim;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const apply = () => { feedOpen = v; root.classList.toggle('feed-open', feedOpen); drawTog(); capScroll(); syncLock(); };
    // Während der Animation: keine CSS-Einblend-Animation obendrauf, Blasen auf eigene Ebene (flüssig statt ruckelig)
    root.classList.add('feed-anim'); clearTimeout(setFeedOpen.t); setFeedOpen.t = setTimeout(() => { if (tok === feedAnim) root.classList.remove('feed-anim'); }, 1300);
    const others = () => [...feedList.querySelectorAll('.ai-bub:not(.last)'), ...feedList.querySelectorAll('.ai-bub.me.last')];
    const lastA = feedList.querySelector('.ai-bub.max.last .ai-a');
    const grow = (h0) => { if (!lastA || reduce) return; const h1 = lastA.getBoundingClientRect().height; if (Math.abs(h1 - h0) > 2) lastA.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' }); };
    if (reduce || instant) { apply(); root.classList.remove('feed-anim'); return; }
    const h0 = lastA ? lastA.getBoundingClientRect().height : 0;
    if (v) {
      apply(); grow(h0); cap.scrollTop = cap.scrollHeight;
      const list = others().filter(b => b.offsetParent).reverse();   // von unten (neu) nach oben (alt)
      // nur, was man wirklich sieht – der Rest liegt oben außerhalb und braucht keine Animation
      const fr = cap.getBoundingClientRect(), vis = list.filter(b => { const r = b.getBoundingClientRect(); return r.bottom > fr.top - 40 && r.top < fr.bottom + 40; }).slice(0, 10);
      vis.forEach((b, i) => b.animate([{ opacity: 0, transform: 'translate3d(0,12px,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }], { duration: 420, delay: i * 35, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
      feedTog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: Math.max(34, (vis.length - 1) * 35), easing: 'ease-out', fill: 'backwards' });   // zusammen mit der obersten Blase
    } else {
      const fr = cap.getBoundingClientRect();
      const list = others().filter(b => { if (!b.offsetParent) return false; const r = b.getBoundingClientRect(); return r.bottom > fr.top - 40 && r.top < fr.bottom + 40; });
      const outs = list.slice(-10).reverse().map((b, i) => b.animate([{ opacity: 1, transform: 'translate3d(0,0,0)' }, { opacity: 0, transform: 'translate3d(0,10px,0)' }], { duration: 240, delay: i * 18, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }));
      if (outs.length) outs.push(feedTog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' }));
      const done = () => { if (tok !== feedAnim) { outs.forEach(a => a.cancel()); return; } const h = lastA ? lastA.getBoundingClientRect().height : 0; apply(); outs.forEach(a => a.cancel()); grow(h); feedTog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 100, easing: 'ease-out', fill: 'backwards' }); };
      if (!outs.length) done(); else Promise.all(outs.map(a => a.finished.catch(() => {}))).then(done);
    }
  }
  // „Verlauf“-Knopf sitzt immer direkt über der obersten sichtbaren Blase
  function placeTog() {
    requestAnimationFrame(() => {
      const r = cap.getBoundingClientRect();
      const vis = open && root.classList.contains('has-cap') && getComputedStyle(cap).display !== 'none' && !feedTog.hidden;
      root.classList.toggle('tog-on', vis);
      if (!vis) return;
      const first = [...feedList.querySelectorAll('.ai-bub')].find(b => b.offsetParent);
      const top = feedOpen ? r.top : Math.max(r.top, first ? Math.min(r.bottom, first.getBoundingClientRect().top) : r.bottom);
      feedTog.style.top = Math.max(8, Math.round(top - 42)) + 'px';
      feedTog.style.left = Math.round(r.left + r.width / 2) + 'px';
    });
  }
  addEventListener('resize', placeTog);
  cap.addEventListener('scroll', () => { if (feedOpen) placeTog(); }, { passive: true });
  function drawTog() {
    const n = feedList.querySelectorAll('.ai-bub').length, older = n - feedList.querySelectorAll('.ai-bub.last').length;
    feedTog.hidden = older < 1 && n < 2;
    drawHist();
    feedTog.replaceChildren(h('span', { html: ico(feedOpen ? 'down' : 'up') }), feedOpen ? L('Verlauf einklappen', 'Collapse history') : L('Verlauf ansehen', 'Show history'));
    placeTog();
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
  // Begrüßung genau einmal – beim allerersten Öffnen, danach nie wieder
  function greet(voice) {
    if (ls.get('tutor.asst.greeted') || seenBefore || hist.length) { ls.set('tutor.asst.greeted', 1); return; } ls.set('tutor.asst.greeted', 1);
    const gTx = h('div', { class: 'ai-a' });
    let gText = (L(
      'Moin, ich bin Max – dein KI-Tutor hier. Ich seh, was du auf der Seite gerade machst, und führ dich durch: Frag mich alles, ich erklär’s dir an der Tafel, öffne Sachen für dich und bau dir Quiz, Karteikarten oder einen Klausurplan. Schreib einfach los – oder tipp auf **Sprich mit Max**.',
      'Hey, I’m Max – your AI tutor here. I can see what you’re doing on the page and I’ll guide you: ask me anything, I’ll explain it on the whiteboard, open things for you and build quizzes, flashcards or an exam plan. Just type – or tap **Talk to Max**.'));
    // Spracheingabe startet schon: kein „tipp auf Sprich mit Max“
    if (voice) gText = gText.replace(/ Schreib einfach los[\s\S]*$/, ' Leg los, ich hör zu.').replace(/ Just type[\s\S]*$/, ' Go ahead, I’m listening.');
    const g = h('div', { class: 'ai-bub max last greet' }, gTx);
    revealWords(gTx, gText);
    feedList.querySelectorAll('.ai-bub.last').forEach(b => b.classList.remove('last'));
    feedList.appendChild(g); showCap(); drawTog(); capScroll();
  }
  // Text steht sofort in voller Größe (kein Springen), die Wörter blenden weich nacheinander ein
  function revealWords(el, text) {
    el.replaceChildren(richText(text));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const nodes = []; let n, i = 0;
    while ((n = tw.nextNode())) nodes.push(n);
    nodes.forEach(t => {
      const frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(w => {
        if (!w) return;
        if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
        const sp = document.createElement('span'); sp.className = 'rw'; sp.style.setProperty('--i', i++); sp.textContent = w; frag.appendChild(sp);
      });
      t.parentNode.replaceChild(frag, t);
    });
  }
  function endEx() { if (curEx) curEx.done = true; }
  function dropEx() { if (curEx && !curEx.done) { curEx.q.remove(); curEx.a.remove(); curEx = null; capQ = capA = capX = null; markLast(); } }
  function capQuestion(t, live = false) {
    showCap();
    if (!curEx || curEx.done) newEx(t, live);
    capQ.textContent = t; capQ.classList.toggle('live', live);
    capScroll();
  }
  function capScroll() { requestAnimationFrame(() => {
    // Handy im Tutor-Raum: lange Antwort von oben lesbar lassen (nicht ans Ende springen, solange sie höher als der Platz ist)
    const la = STAGE && MOB.matches ? feedList.querySelector('.ai-bub.max.last:not([hidden])') : null;
    if (la && la.offsetHeight > cap.clientHeight - 24) { const q = la.previousElementSibling; const top = (q && q.classList.contains('me') && q.offsetHeight < 90 ? q.offsetTop : la.offsetTop) - 8; cap.scrollTop = Math.max(0, top); }
    else cap.scrollTop = cap.scrollHeight;
    placeTog(); }); }
  // Nachdenken: Pünktchen plus echte Gedanken, die wechseln (im Tutor-Raum denkt Max in der Blase über dem Kopf)
  let thkT = 0;
  function capThinking() {
    if (!curEx) return;
    // Im Tutor-Raum denkt Max in seiner Gedankenblase – keine zweite, leere „…“-Blase im Verlauf
    if (STAGE && waitTx) { curEx.a.hidden = false; clearInterval(thkT); capA.replaceChildren(h('span', { class: 'ai-wait' }, waitTx)); waitTx = ''; capScroll(); return; }
    if (STAGE) { curEx.a.hidden = true; clearInterval(thkT); return; }
    curEx.a.hidden = false;
    const th = h('span', { class: 'ai-thk' });
    capA.replaceChildren(h('span', { class: 'typing' }, h('i'), h('i'), h('i')), ...(STAGE ? [] : [th])); capScroll();
    clearInterval(thkT); if (STAGE) return;
    const lines = thinkLines('voice', [L('Ich sortier das kurz …', 'Sorting this out …'), L('Gleich hab ich’s …', 'Almost there …')]); let k = 0;
    const nx = () => { if (!th.isConnected) return clearInterval(thkT); th.textContent = lines[k++ % lines.length]; th.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); capScroll(); };
    setTimeout(() => { if (th.isConnected) { nx(); thkT = setInterval(nx, 2600); } }, 700);
  }
  // Verlauf beim Start (zum Nachlesen)
  hist.slice(-12).forEach((m, i, arr) => {
    if (m.role === 'user') { const nx = arr[i + 1]; const pr = bubPair(m.content.replace(/^\[[^\]]*\]\n/, '')); if (nx?.role === 'assistant') { const px = parse(nx.content); pr.a.hidden = false; pr.aTx.appendChild(richText(px.text || (px.boards.length ? L('Schau an die Tafel.', 'Look at the board.') : '…'))); px.boards.forEach(b => pr.aX.appendChild(boardBtn(b))); } pr.done = true; }
  });
  setFeedOpen(feedOpen);
  function capIdleLater() {}
  // Handy: Tippen auf eine Blase klappt den Verlauf auf
  feedList.addEventListener('click', e => { if (Date.now() - (feedList._sw || 0) < 400) return; if (!feedOpen && e.target.closest('.ai-bub') && !e.target.closest('button,a')) setFeedOpen(true); });

  // ---------- Tafel ----------
  // Knopf in der Nachricht: holt genau diese Tafel zurück – auch wenn sie gelöscht oder eingeklappt wurde
  function boardBtn(b) {
    return h('button', { class: 'ai-cmd link bshow', type: 'button', title: b.title, onclick: () => {
      let i = boards.findIndex(x => x.title === b.title && x.html === b.html);
      if (i < 0) { boards.push(b); i = boards.length - 1; }
      bIdx = i; drawBoard(false); openBoard();
    } }, h('span', { class: 'ck', html: ico('board') }), L('Tafel: ', 'Board: ') + (b.title.length > 34 ? b.title.slice(0, 33) + '…' : b.title));
  }
  // Seite erscheint: Überschrift Buchstabe für Buchstabe, danach gleiten die Abschnitte nacheinander rein
  function appear(t) {
    const tt = t.querySelector('.tt'); if (!tt) return;
    let i = 0; const n = tt.textContent.replace(/\s/g, '').length, step = Math.max(10, Math.min(22, 640 / Math.max(1, n)));
    const words = tt.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) ? document.createTextNode(w)
      : h('span', { class: 'tf-w' }, ...[...w].map(c => h('span', { class: 'tf-c', style: { animationDelay: Math.round(40 + i++ * step) + 'ms' } }, c))));
    tt.setAttribute('aria-label', tt.textContent); tt.replaceChildren(...words);
    t.style.setProperty('--tf-d', Math.round(40 + i * step * .7) + 'ms');
    t.classList.add('tf-in');
  }
  function goBoard(d) { if (!boards.length) return; bIdx = clamp(bIdx + d, 0, boards.length - 1); drawBoard(false); }
  function drawBoard(write) {
    const b = boards[bIdx]; if (!b) return;
    bTitle.textContent = b.title; bCount.textContent = boards.length > 1 ? `${bIdx + 1} / ${boards.length}` : '';
    bPrev.hidden = bNext.hidden = boards.length < 2;
    const t = h('div', { class: 'tafel' }, h('h2', { class: 'tt' }, b.title));
    t.appendChild(polishBoard(sanitize(b.html)));
    t.appendChild(nextChips(b));
    bArea.replaceChildren(t); bArea.scrollTop = 0;
    if (write) t.classList.add('ai-write');
    else if (!matchMedia('(prefers-reduced-motion: reduce)').matches) appear(t);
    stopTour(); drawTourBtn(); drawBMore(); root.classList.remove('m-bld');
    root.classList.toggle('m-entryb', !!b.entry);
    drawPage(b);
    if (b.entry) { const c = entryCtx(); if (c) Entry.enhance(c); }
    bootDone();
    requestAnimationFrame(() => tableHints(t)); setTimeout(() => tableHints(t), 900);
    return t;
  }
  function openBoard() {
    const was = boardOpen && !boardMin;
    boardOpen = true; root.classList.add('has-board'); minBoard(false, true);
    if (MOB.matches && feedOpen) setFeedOpen(false);
    if (!was && !MOB.matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(() => {
      const fr = (open ? fEl : bubFace).getBoundingClientRect(), br = board.getBoundingClientRect();
      board.style.setProperty('--ox', (fr.left + fr.width / 2 - br.left) + 'px');
      board.style.setProperty('--oy', (fr.top + fr.height / 2 - br.top) + 'px');
      board.classList.remove('ai-reveal'); void board.offsetWidth; board.classList.add('ai-reveal');
    });
  }
  function minBoard(v, quiet) {
    // Zur Seite legen: Tafel gleitet nach rechts raus, am Rand bleibt ein „Tafel“-Griff zum Zurückholen
    if (v && !quiet && !boardMin && boardOpen && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const an = board.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(70px) scale(.97)' }], { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      an.finished.then(() => { minBoard(true, true); an.cancel(); bTab.animate([{ opacity: 0, transform: 'translate(20px, -50%)' }, { opacity: 1, transform: 'translate(0, -50%)' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' }); }).catch(() => {});
      return;
    }
    if (v) setFs(false);
    boardMin = !!v; root.classList.toggle('board-min', boardMin); askBoard(false); syncLock(); boardHook();
    if (!quiet && !v) board.animate([{ opacity: 0, transform: 'translateX(30px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function askBoard(v) {
    bAsk.hidden = !v;
    if (v) { const n = boards.length, all = bAsk.querySelector('.ai-delall'); all.hidden = n < 2; all.querySelector('.ai-dan').textContent = L(`Alle ${n} löschen`, `Delete all ${n}`); bAsk.querySelector('.ai-del').focus({ preventScroll: true }); }
  }
  // Alle Tafeln auf einmal weg (auch aus den Skripten) – mit Rückgängig
  function deleteAllBoards() {
    const gone = boards.slice(), touched = [];
    for (const d of S.list.concat(S.doc ? [S.doc] : [])) {
      if (!d || !Array.isArray(d.boards) || touched.some(x => x.d === d)) continue;
      const before = d.boards.slice();
      d.boards = d.boards.filter(x => !gone.some(b => b.title === x.title && b.html === x.html));
      if (d.boards.length !== before.length) { touched.push({ d, before }); save(d); }
    }
    stopTour(); boards = []; bIdx = 0; closeBoard();
    const undo = h('button', { class: 'toast-undo', type: 'button', onclick: () => {
      boards = gone; bIdx = Math.max(0, gone.length - 1); touched.forEach(({ d, before }) => { d.boards = before; save(d); });
      drawBoard(false); openBoard(); undo.closest('.toast')?.remove();
    } }, L('Rückgängig', 'Undo'));
    toast(h('span', { class: 'toast-row' }, L(`${gone.length} Tafeln gelöscht.`, `${gone.length} boards deleted.`), undo), 6000);
  }
  // Löschen: aktuelle Tafel raus (auch aus dem Skript), sonst nächste zeigen
  function deleteBoard() {
    const b = boards[bIdx]; if (!b) return closeBoard();
    const d = curDoc() || S.doc;
    if (d && Array.isArray(d.boards)) { const i = d.boards.findIndex(x => x.title === b.title && x.html === b.html); if (i >= 0) { d.boards.splice(i, 1); save(d); } }
    boards.splice(bIdx, 1);
    if (!boards.length) { closeBoard(); toast(L('Tafel gelöscht.', 'Board deleted.')); return; }
    bIdx = clamp(bIdx, 0, boards.length - 1); drawBoard(false); toast(L('Tafel gelöscht.', 'Board deleted.'));
  }
  // Am Ende jeder fertigen Tafel: wie geht's weiter? Antippen = nächste Nachricht an Max
  const OVERVIEW = ['buchungssatz', 'bilanz', 'kapitalwert', 'break-even', 'swot', 'deckungsbeitrag', 'guv', 'kostenrechnung'];
  const overviewB = new WeakSet();
  function nextChips(b) {
    const title = String(b.title || '').trim();
    const chip = (label, fn) => h('button', { class: 'ai-cmd m-nc', type: 'button', onclick: fn }, label);
    const overview = overviewB.has(b) || (/Überblick|overview/i.test(title) && /BWL|business/i.test(title));
    const kids = overview
      ? OVERVIEW.filter(k => THEMEN[k]).map(k => { const [name, what] = THEMEN[k]; return chip(name, () => submit(L(`Erklär mir ${what} von Grund auf, an der Tafel. Bleib dafür hier im Tutor-Raum.`, `Explain ${name} to me from scratch, on the whiteboard. Stay here in the tutor room.`), { board: name, show: L(`Erklär mir „${name}“.`, `Explain “${name}”.`) })); })
      : [chip(L('Quiz mich dazu', 'Quiz me on this'), () => askQuiz(title)),
        chip(L('Rechne mir ein Beispiel', 'Work me an example'), () => askExample(title)),
        chip(L('Erklär’s einfacher', 'Explain it simpler'), () => submit(L(`Erklär mir „${title}“ nochmal einfacher – kurz, mit einem Alltagsbeispiel.`, `Explain “${title}” again more simply – short, with an everyday example.`), { show: L('Erklär’s einfacher', 'Explain it simpler') }))];
    const tr = overview ? null : trainerFor(title + ' ' + buildTitle);
    const trEl = tr ? h('a', { class: 'm-trn', href: '#/app/trainer/' + tr[0] }, h('span', { class: 'm-trl' }, tr[1]), h('span', { class: 'm-trs' }, ' · ' + L('BWL-Trainer', 'Business trainer')), h('span', { class: 'm-tra', 'aria-hidden': 'true' }, '→')) : null;
    return h('div', { class: 'm-next' + (overview ? ' m-ov' : '') }, h('p', { class: 'm-nt' }, overview ? L('Wo hakt’s? Tipp an:', 'Where are you stuck? Tap:') : L('Und jetzt?', 'What next?')), h('div', { class: 'm-nr' }, ...kids), trEl);
  }
  function askQuiz(title) { submit(L(`Quiz mich zu „${title}“ – eine Frage nach der anderen, warte jeweils auf meine Antwort und sag mir dann, ob’s sitzt.`, `Quiz me on “${title}” – one question at a time, wait for my answer each time and tell me if it’s right.`), { show: L('Quiz mich dazu', 'Quiz me on this') }); }
  function askExample(title) { submit(L(`Rechne mir ein neues Beispiel zu „${title}“ Schritt für Schritt an der Tafel vor – mit anderen Zahlen.`, `Work through a new example on “${title}” step by step on the whiteboard – with different numbers.`), { show: L('Rechne mir ein Beispiel', 'Work me an example'), board: title }); }
  // Passendes Trainer-Modul zum Thema der Tafel (ruhiger Link am Ende)
  const TRN = [
    [/buchungss|buchungssatz|skonto|vorsteuer|umsatzsteuer|jahresabschluss|\bguv\b|gewinn- und verlust|booking entr/i, 'buchung', L('Buchungssätze üben', 'Practise booking entries')],
    [/t-kont|tkont|t-account/i, 'tkonten', L('T-Konten üben', 'Practise T-accounts')],
    [/abschreibung|depreciation/i, 'abschreibung', L('Abschreibungen üben', 'Practise depreciation')],
    [/bilanzkennzahl|eigenkapitalquote|rentabilit|liquidit|kennzahl/i, 'kennzahlen', L('Kennzahlen üben', 'Practise ratios')],
    [/bilanz|balance sheet/i, 'bilanz', L('Bilanz üben', 'Practise the balance sheet')],
    [/break-even|break even|deckungsbeitrag|gewinnschwelle|contribution margin/i, 'breakeven', L('Break-even üben', 'Practise break-even')],
    [/kapitalwert|investition|annuit|zinsfu|amortisation|net present value|npv/i, 'kapitalwert', L('Investitionsrechnung üben', 'Practise investment appraisal')],
    [/zuschlag|kalkulation|kostenrechnung|cost accounting/i, 'kalkulation', L('Kalkulation üben', 'Practise costing')]];
  function trainerFor(t) { const m = TRN.find(([re]) => re.test(t)); return m ? [m[1], m[2]] : null; }
  // Tafel fertig (oder Fehler): einmal Bescheid geben – z. B. wartet das Cookie-Banner darauf
  let doneTok = 0;
  function boardDone() { const k = ++doneTok; setTimeout(() => { if (k === doneTok) { try { window.dispatchEvent(new Event('bm:board-done')); } catch (e) {} } }, 0); }
  function whenWritten(t) {
    if (!t) return boardDone();
    const t0 = Date.now(); let sent = false;
    const go = () => { if (sent) return; if (!t.isConnected || !t.querySelector(':scope > .ai-hide') || Date.now() - t0 > 20000) { sent = true; boardDone(); return; } setTimeout(go, 250); };
    setTimeout(go, 300);
  }
  // Platzhalter, solange Max die Tafel baut (Thema-Einstieg): man sieht sofort, dass gerade die Tafel entsteht
  let building = false, buildTitle = '', bldT = 0, ovNext = false;
  const BLD = () => [L('Ich such die besten Beispiele raus …', 'Picking the best examples …'), L('Ich rechne das einmal sauber durch …', 'Running the numbers properly …'), L('Formeln in Schönschrift – dauert kurz …', 'Writing the formulas neatly …'), L('Erst das Prinzip, dann die Zahlen …', 'Principle first, then the numbers …'), L('Gleich steht’s an der Tafel …', 'Almost on the board …'), L('Klausurfallen markier ich dir extra …', 'Marking the exam traps for you …')];
  const keepEnd = t => t.replace(/ (\S+) …$/, '\u00a0$1\u00a0…');
  function showBuilding(title) {
    building = true; buildTitle = String(title || ''); root.classList.add('m-bld'); root.classList.remove('m-entryb'); bootDone();
    bTitle.textContent = title; bCount.textContent = ''; bPrev.hidden = bNext.hidden = true;
    const lines = [88, 64, 76, 52, 70].map((w, i) => h('i', { style: `width:${w}%;animation-delay:${i * .12}s` }));
    const st = h('span', { class: 'm-bst', 'aria-live': 'polite' }, keepEnd(L('Max baut deine Tafel – live, nur für dich …', 'Max is building your board – live, just for you …')));
    bArea.replaceChildren(h('div', { class: 'tafel' }, h('h2', { class: 'tt' }, title),
      h('div', { class: 'ai-building' }, h('p', { class: 'ai-bld-t' }, h('span', { class: 'ai-bld-pen', 'aria-hidden': 'true' }, '✎'), st), h('div', { class: 'ai-bld-l' }, ...lines))));
    // Wartezeit lebendig: alle ~3 s ein neuer Satz von Max
    clearInterval(bldT); const said = BLD(); let k = 0;
    bldT = setInterval(() => {
      if (!building || !st.isConnected) return clearInterval(bldT);
      st.textContent = keepEnd(said[k++ % said.length]);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) st.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
    }, 3000);
    openBoard();
  }
  function endBuilding() { bootDone(); if (!building) return; building = false; clearInterval(bldT); boardDone(); if (boards.length) drawBoard(false); else { bArea.replaceChildren(); closeBoard(); } }
  function closeBoard() { setFs(false); boardOpen = false; boardMin = false; root.classList.remove('has-board', 'board-min'); syncLock(); boardHook(); }
  function boardHook() { try { STAGE?.onBoard?.(boardOpen && !boardMin); } catch (e) {} syncPage(); placeHist(); setTimeout(placeHist, 700); }
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
  // Max „teleportiert“ dich: neue Seite öffnet sich als Kreis aus seinem Gesicht (View Transitions), sonst Lichtwelle
  function warpOrigin() {
    const fr = (open ? fEl : bubFace).getBoundingClientRect();
    const x = fr.left + fr.width / 2, y = fr.top + fr.height / 2;
    document.documentElement.style.setProperty('--vx', x + 'px');
    document.documentElement.style.setProperty('--vy', y + 'px');
    return { x, y };
  }
  function waitRender(ms = 900) {
    const v = document.getElementById('view') || document.body;
    return new Promise(res => {
      let done = false; const fin = () => { if (done) return; done = true; mo.disconnect(); setTimeout(res, 60); };
      const mo = new MutationObserver(fin); mo.observe(v, { childList: true, subtree: true });
      setTimeout(fin, ms);
    });
  }
  async function nav(hash, force) {
    if (force) { try { (await import('./app.js')).forceRerender(); } catch (e) {} }
    const go = async () => {
      if (location.hash === hash) dispatchEvent(new HashChangeEvent('hashchange'));
      else location.hash = hash;
      await waitRender();
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { x, y } = warpOrigin();
    if (!reduce && document.startViewTransition) {
      document.documentElement.classList.add('ai-vt');
      try { const vt = document.startViewTransition(go); await vt.updateCallbackDone; vt.finished.finally(() => document.documentElement.classList.remove('ai-vt')); }
      catch (e) { document.documentElement.classList.remove('ai-vt'); }
      return;
    }
    if (!reduce) {
      const w = h('div', { class: 'ai-warp', style: { '--wx': x + 'px', '--wy': y + 'px' } });
      document.body.appendChild(w); setTimeout(() => w.remove(), 1100);
    }
    await go();
  }
  function cmdChip(c) {
    // Themen-Einstieg aus der Anzeige: Max bleibt im Raum – Werkzeuge nur als Angebot zum Antippen
    let stay = 0; try { stay = +sessionStorage.getItem('tutor.stay') || 0; } catch (e) {}
    const hold = stay && Date.now() - stay < 6e5 && ['go', 'trainer', 'make'].includes(c.k);
    if (c.k === 'upload' || c.k === 'voice' || hold) {
      if (hold) { const b = h('button', { class: 'ai-cmd tap', type: 'button', onclick: () => { try { sessionStorage.removeItem('tutor.stay'); } catch (e) {} b.classList.remove('tap'); b.classList.add('run'); runCmd(c, b); } }, h('span', { class: 'ck', html: ico('right') }), c.label); return b; }
      const b = h('button', { class: 'ai-cmd tap', type: 'button', onclick: () => runCmd(c, b) }, h('span', { class: 'ck', html: ico(c.k === 'upload' ? 'upload' : 'mic') }), c.label);
      return b;
    }
    const el = h('span', { class: 'ai-cmd run' }, h('span', { class: 'ck', html: CHECK }), c.label);
    setTimeout(() => runCmd(c, el), 0);
    return el;
  }
  async function runCmd(c, chipEl) {
    const fail = msg => { chipEl.classList.remove('run'); chipEl.classList.add('no'); chipEl.replaceChildren(h('span', { class: 'ck', html: ico('x') }), msg); };
    const ok = () => { chipEl.classList.remove('run'); chipEl.classList.add('ok'); if (['go', 'make', 'trainer', 'topic'].includes(c.k) && feedOpen) setFeedOpen(false, { force: true }); };   // Seite frei machen
    const d = curDoc() || S.doc;
    if (c.doc && !d) {
      // Werkzeug ohne Skript: Stoff hochladen oder Thema nennen – danach entsteht direkt das Werkzeug
      if (c.k === 'make') { const m = await import('./app.js'); m.tryFeature(c.v === 'exam' ? 'quiz' : MAKE[c.v][0]); ok(); return; }
      return fail(L('Dafür brauch ich ein Skript – lad eins hoch.', 'I need slides for that – upload some.'));
    }
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
      else if (c.k === 'topic') { ls.set('tutor.target', c.target || null); if (!STAGE && open) closeAnimated(); const m = await import('./app.js'); m.startTopic(c.v); }
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
  let pendingMap = null;
  const LAZY_MAP = {};
  let waitTx = '';
  async function submit(text, o = {}) {
    text = String(text || '').trim();
    const shown = String(o.show || text);
    if (!text || state === 'think') return;
    if (!pendingMap && TOURQ.test(text) && route().tab) { pageTour(); return; }
    if (tourActive()) pauseTour();   // Frage mitten in der Führung: Max hält an, antwortet, dann geht's per ▶ weiter
    if (state === 'speak') { try { audio.pause(); } catch (e) {} }
    unlockAudio();
    if (MOB.matches) fold(!!o.entry);
    waitTx = o.wait || ''; capQuestion(shown); capQ.classList.remove('live'); capThinking();
    ovNext = o.slug === 'bwl' || /Überblick|overview/i.test(String(o.board || ''));   // BWL-Überblick: Themen-Knöpfe am Ende
    const inst = !!(o.entry && hasInstant(o.slug));   // Sofort-Tafel (boards.js): kein Platzhalter, die Tafel ist gleich da
    if (o.board && !inst) showBuilding(String(o.board));
    const pasted = attachTx; if (pasted) { capQ.prepend(h('span', { class: 'ai-refq' }, L('Eingefügter Text · ', 'Pasted text · ') + pasted.length.toLocaleString('de-DE') + L(' Zeichen', ' chars'))); clearAttach(); }
    if (askRef) capQ.prepend(h('span', { class: 'ai-refq' }, L(`Zu ${askRef.i}/${askRef.n} · `, `Re ${askRef.i}/${askRef.n} · `) + (askRef.spot.length > 60 ? askRef.spot.slice(0, 59) + '…' : askRef.spot)));
    const ex = curEx;
    if (ex) { ex.entry = !!o.entry; ex.slug = o.slug || ''; }
    const ctxLine = pageContext() + (entryNotes.length ? '\n' + entryNotes.splice(0).join('\n') : '');
    hist.push({ role: 'user', content: text });
    try { STAGE?.onAsk?.(shown); } catch (e) {}
    if (pendingMap === LAZY_MAP) { await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const m = pageMap(); pendingMap = m.count ? m.text : null; }
    setState('think');
    const my = ++gen, spoken = !!cfg.spk && viaVoice;
    ctrl = new AbortController();
    try {
      const messages = hist.slice(-12).map(m => ({ role: m.role, content: m.role === 'assistant' ? forHistory(m.content) : m.content }));
      const TAFEL = L('[Tafel: Gib jedem Block an der Tafel (h3, p, ul, div.calc, div.step, div.result, table, svg) ein Attribut data-say mit genau einem kurzen Satz (höchstens 18 Wörter), warum dieser Schritt so ist – Max zeigt ihn dann mit seinem Cursor.]',
        '[Board: give every block on the board (h3, p, ul, div.calc, div.step, div.result, table, svg) a data-say attribute with exactly one short sentence (max 18 words) on why this step is the way it is – Max then points to it with his cursor.]');
      const here = STAGE ? L('Tutor-Raum', 'Tutor room') : placeLabel(), before = ls.get('tutor.asst.lastPage');
      ls.set('tutor.asst.lastPage', here);
      const WECHSEL = before && here && before !== here ? L(`[Seitenwechsel: Der Nutzer ist jetzt auf „${here}“ (vorher „${before}“). Was davor im Verlauf steht, bezog sich auf die alte Seite – das war kein Fehler, also nichts korrigieren oder entschuldigen.]`, `[Page change: the user is now on “${here}” (before: “${before}”). Earlier messages referred to the old page – that was not a mistake, so don't correct or apologise.]`) : '';
      const REF = askRef ? L(`[Bezug: Die Frage gehört zu Schritt ${askRef.i}/${askRef.n} deiner Cursor-Erklärung. Stelle: „${askRef.spot}“. Deine Erklärung dort: „${askRef.say}“. Antworte genau darauf.]`, `[Reference: the question is about step ${askRef.i}/${askRef.n} of your cursor walkthrough. Spot: “${askRef.spot}”. Your explanation there: “${askRef.say}”. Answer exactly that.]`) : '';
      if (askRef && ex) ex.ref = true;
      clearRef();
      const SEITE = pendingMap ? L(`[Seitenführung für die Seite „${here}“: Beziehe dich nur auf diese Seite und diese Elementliste. Antworte mit 1–2 kurzen Sätzen Einleitung und danach genau einem Block \`\`\`zeigen mit einer JSON-Liste von 4–7 Schritten, z. B. [{"id":"m3","say":"…"}]. Nutze nur Kennungen aus dieser Liste, in sinnvoller Reihenfolge. say = 1–2 kurze Sätze: was das ist und warum es wichtig ist – konkret, mit den Zahlen auf der Seite.\nElemente der Seite:\n${pendingMap}]`,
        `[Page tour for the page “${here}”: only refer to this page and this element list. Answer with a 1–2 sentence intro, then exactly one \`\`\`zeigen block with a JSON list of 4–7 steps, e.g. [{"id":"m3","say":"…"}]. Only use ids from this list, in a sensible order. say = 1–2 short sentences: what it is and why it matters – concrete, with the numbers on the page.\nPage elements:\n${pendingMap}]`) : '';
      pendingMap = null;
      let KNOW = ''; try { KNOW = knowledge(); } catch (e) {}
      const KURZ = spoken ? L('[Gesprochenes Gespräch: Antworte wie im echten Gespräch – höchstens 2–3 kurze Sätze, direkt auf den Punkt. Ausführliches gehört an die Tafel.]', '[Spoken conversation: answer like a real conversation – 2–3 short sentences max, straight to the point. Anything detailed goes on the board.]') : '';
      const pre = [ctxLine, KNOW, WECHSEL, REF, KURZ, maxPrompt(), TAFEL, SEITE].filter(Boolean).join('\n');
      if (pre) messages[messages.length - 1].content = pre + '\n' + text;
      const payload = { messages, opts: Object.assign({ mode: maxMode(), spice: getSpice(), voice: spoken, assistant: true }, o.entry ? { entry: true } : {}) };
      const d = curDoc();
      const mat = STAGE && STAGE.material ? STAGE.material(text) : null;
      if (mat) Object.assign(payload, mat);
      else if (d) Object.assign(payload, { material: forChat(d, text + ' ' + visibleText(400)), docName: d.name });
      if (pasted) { payload.material = (payload.material ? payload.material + '\n\n' : '') + L('### Vom Nutzer eingefügter Text\n', '### Text pasted by the user\n') + pasted; payload.docName = payload.docName ? payload.docName + L(' + eingefügter Text', ' + pasted text') : L('Eingefügter Text', 'Pasted text'); }
      // >>> Sofort-Tafel (boards.js): Themen-Einstieg mit gespeicherter Tafel → kein KI-Aufruf, sonst live
      let r = inst ? await instantReply(o) : null;
      if (!r) { if (inst && o.board) showBuilding(String(o.board)); r = await ask('chat', payload, { signal: ctrl.signal }); }
      // <<< Sofort-Tafel
      if (my !== gen) return;
      const raw = String(r.text || '').slice(0, 12000);
      hist.push({ role: 'assistant', content: raw });
      hist = hist.slice(-20); ls.set(CHAT, hist);
      ex.model = r.model || ''; ex.tools = r.tools || []; ex.src = d ? (d.generated ? 'max' : 'doc') : '';
      await answer(raw, my, spoken, ex);
      try { STAGE?.onAnswer?.(parse(raw)); } catch (e) {}
    } catch (e) {
      if (hist[hist.length - 1]?.role === 'user' && hist[hist.length - 1].content === text) hist.pop();
      // Konto nötig beim Einstieg oder in den ersten 90 Sekunden: kein Fenster, das alles blockiert – Max sagt es ruhig im Chat
      const acc = e?.code === 'need_account' && (o.entry || performance.now() < 90000);
      const other = !acc && o.entry && e?.name !== 'AbortError' && !['cap', 'limit', 'need_account'].includes(e?.code);
      if ((acc || other) && ex && my === gen) {
        endBuilding(); setState('idle'); fc.pulse(acc ? 'happy' : 'sad', 900);
        ex.a.hidden = false; ex.done = true;
        ex.aTx.replaceChildren(h('span', {}, acc ? L('Für die nächste Erklärung brauchst du ein kostenloses Konto – dauert 30 Sekunden, und alles, was du hier schon gemacht hast, bleibt erhalten.', 'For the next explanation you need a free account – takes 30 seconds, and everything you’ve done here stays.')
          : L('Da hat gerade die Verbindung gehakt. Tipp kurz auf „Nochmal“, dann bau ich dir die Tafel.', 'The connection just hiccuped. Tap “Try again” and I’ll build your board.')));
        ex.aX.replaceChildren(acc
          ? h('button', { class: 'ai-cmd', type: 'button', onclick: async () => { const { openLogin } = await import('./account.js'); if (await openLogin({ mode: 'register' })) submit(text, o); } }, L('Kostenloses Konto erstellen', 'Create free account'))
          : h('button', { class: 'ai-cmd', type: 'button', onclick: () => { ex.aX.replaceChildren(); submit(text, o); } }, L('Nochmal', 'Try again')));
        capScroll();
        return;
      }
      if (ex) { ex.aTx.replaceChildren(); ex.a.hidden = true; ex.done = true; }
      endBuilding();
      if (my !== gen) return;
      setState('idle', e?.name === 'AbortError' ? L('Gestoppt.', 'Stopped.') : undefined);
      if (e?.name !== 'AbortError') { fc.pulse('sad', 1400); apiError(e, () => submit(text, o)); }
    } finally { if (my === gen) ctrl = null; }
  }

  async function answer(raw, my, spoken, ex) {
    if (ex && ex.a) ex.a.hidden = false;
    const p = parse(raw);
    const txt = p.text || (p.boards.length ? L('Schau an die Tafel.', 'Look at the board.') : p.cmds.length ? L('Mach ich.', 'On it.') : '…');
    const aEl = ex.aTx;
    // Tafel(n) auf die Seite – und ins Skript, damit sie auch im Tafel-Tab liegen
    let t = null;
    const wasBuilding = building;
    if (p.boards.length) { building = false; clearInterval(bldT); } else endBuilding();
    if (p.boards.length) {
      if (ovNext || (wasBuilding && /Überblick|overview/i.test(buildTitle))) p.boards.forEach(b => overviewB.add(b));
      ovNext = false;
      if (ex && ex.entry) p.boards.forEach(b => { b.entry = true; b.slug = ex.slug; });
      root.classList.remove('m-pchat');
      // Jede Tafel landet automatisch in der Bibliothek – mit Überschrift und Beschreibung
      const lastQ = [...hist].reverse().find(m => m.role === 'user')?.content || '';
      const asPage = MOB.matches && !!(ex && ex.entry);   // Themenseite am Handy: steht sofort da, ohne Einblenden und ohne Hinweis
      keepBoards(p.boards, { doc: curDoc(), question: lastQ, answer: p.text, quiet: asPage });
      boards = boards.concat(p.boards).slice(-12); bIdx = boards.length - p.boards.length;
      t = drawBoard(!asPage); openBoard(); whenWritten(t);
    }
    else if (boardOpen && !boardMin && !ex.ref && !tourActive() && !root.classList.contains('m-pchat')) minBoard(true, true);   // neue Antwort ohne Tafel: alte Tafel zur Seite – außer die Frage galt genau dieser Tafel
    // Befehle sofort ausführen, als kleine Häkchen unter der Antwort
    const acts = p.acts.map(a => ({ a, href: ACTS[a][1](curDoc() || S.doc) })).filter(x => x.href);
    const extras = [...p.cmds.map(c => cmdChip(c)), ...acts.map(({ a, href }) => h('a', { class: 'ai-cmd link', href }, ACTS[a][0]))];
    p.boards.forEach(b => extras.push(boardBtn(b)));
    if (!(spoken && cfg.spk) && p.text && cfg.spk) extras.push(listenBtn(p.text, txt, ex));
    if (p.text && p.text.length > 60) { const q = [...hist].reverse().find(m => m.role === 'user')?.content || ''; const d = curDoc(); extras.push(favChip({ typ: 'erklaerung', titel: (q || plainT(p.text)).slice(0, 90), doc: d?.id || '', docName: d?.name || '', ref: favKey(p.text), inhalt: plainT(p.text) })); }
    // Vorgerechnete Lösung → Zwillingsaufgabe zum Selbstrechnen
    if ((ex.tools && ex.tools.length) || p.boards.some(b => /class="(calc|step|result|bs|tkonto)"/.test(b.html))) extras.push(h('button', { class: 'ai-cmd link', type: 'button', onclick: () => submit(L('Gib mir eine Zwillingsaufgabe dazu: gleiche Struktur, neue Zahlen. Erst nur die Aufgabe – die Lösung zeigst du erst, wenn ich meine Antwort geschickt oder „Lösung“ geschrieben habe.', 'Give me a twin exercise: same structure, new numbers. Only the task first – show the solution only once I’ve sent my answer or typed “solution”.')) }, L('Zwillingsaufgabe', 'Twin exercise')));
    if (!STAGE && route().tab && route().tab !== 'room' && (p.boards.length || (p.text || '').length > 280)) extras.push(h('a', { class: 'ai-cmd link ai-room', href: '#/app/tutor', onclick: () => ls.set('tutor.room.continue', 1) }, h('span', { class: 'ck', html: ico('right') }), L('Im Tutor weitermachen', 'Continue in the tutor')));
    if (ex.model !== undefined) extras.push(aiTag(ex.tools, raw, ex.src));
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
    if (my === gen) runTours(p, t);
  }
  // ---------- Max-Cursor: Tafel Block für Block erklären, oder echte Stellen der Seite zeigen ----------
  function curStart() { const rf = STAGE ? [...document.querySelectorAll('.room .rm-fs')].find(e => e.getBoundingClientRect().width > 0) : null; const r = (rf || (open ? fEl : bubFace)).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .4 }; }
  function startTour(steps) {
    hideQuip();
    const dockAt = () => (STAGE || open ? isl : bub).getBoundingClientRect();
    return tour(steps, { startAt: curStart(), dockAt, onAsk: ref => { if (!open) setOpen(true); setRef(ref); setTyping(true); } });
  }
  // „Frage“ in der Cursor-Blase: Max weiß, welche Stelle gemeint ist
  let askRef = null;
  const refTx = h('span', { class: 'ai-ref-t' });
  const refChip = h('div', { class: 'ai-ref', hidden: true }, h('span', { class: 'ai-ref-i', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5 18.5 11 12.4 12.4 9.6 18.6z"/></svg>' }), refTx,
    h('button', { class: 'ai-ref-x', type: 'button', 'aria-label': L('Bezug entfernen', 'Remove reference'), html: ico('x'), onclick: e => { e.stopPropagation(); clearRef(); inp.focus({ preventScroll: true }); } }));
  // eingefügter langer Text hängt als Kontext an der nächsten Frage
  let attachTx = '';
  const attTx = h('span', { class: 'ai-ref-t' });
  const attChip = h('div', { class: 'ai-ref att', hidden: true }, h('span', { class: 'ai-ref-i', html: ico('file') }), attTx,
    h('button', { class: 'ai-ref-x', type: 'button', 'aria-label': L('Text entfernen', 'Remove text'), html: ico('x'), onclick: e => { e.stopPropagation(); clearAttach(); inp.focus({ preventScroll: true }); } }));
  function setAttach(t) {
    attachTx = String(t).slice(0, 60000);
    attTx.replaceChildren(h('b', {}, L('Eingefügter Text', 'Pasted text')), ' · ' + attachTx.length.toLocaleString('de-DE') + L(' Zeichen', ' chars'));
    attChip.hidden = false; root.classList.add('has-att');
    inp.dataset.phLock = L('Was soll ich damit machen?', 'What should I do with it?'); inp.placeholder = inp.dataset.phLock;
  }
  function clearAttach() { attachTx = ''; attChip.hidden = true; root.classList.remove('has-att'); if (!askRef) delete inp.dataset.phLock; }
  function addFiles(fs) {
    fs = (fs || []).filter(f => f && f.size);
    if (!fs.length) return;
    ls.set('tutor.attach.room', 1);   // nach dem Einlesen zurück in den Tutor-Raum, mit genau diesem Skript
    import('./app.js').then(m => m.startUpload(fs));
  }
  inp.addEventListener('paste', e => {
    const fs = [...(e.clipboardData?.files || [])];
    if (fs.length) { e.preventDefault(); addFiles(fs); return; }
    const tx = e.clipboardData?.getData('text/plain') || '';
    if (tx.length > 600) { e.preventDefault(); setAttach(tx); }
  });
  // Reinziehen auf Max (außerhalb des Raums – dort fängt der Raum es selbst)
  const hasFiles = e => [...(e.dataTransfer?.types || [])].includes('Files');
  document.addEventListener('dragover', e => { if (STAGE || !open || !hasFiles(e)) return; const on = !!e.target.closest?.('.asst'); root.classList.toggle('dropping', on); if (on) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
  document.addEventListener('dragleave', e => { if (!e.relatedTarget) root.classList.remove('dropping'); });
  document.addEventListener('drop', e => { root.classList.remove('dropping'); if (STAGE || !open || !hasFiles(e) || !e.target.closest?.('.asst')) return; e.preventDefault(); addFiles([...(e.dataTransfer.files || [])]); });
  // Kontingent: nur wenn’s knapp wird, ein leiser Hinweis – nie ein Zähler „x / 40“
  const lowChip = h('button', { class: 'ai-low', type: 'button', hidden: true, onclick: () => (getAccount() ? import('./ic.js').then(m => m.innerCircle({ reason: lowChip.textContent })) : import('./account.js').then(m => m.openLogin({ title: L('Mehr mit kostenlosem Konto', 'More with a free account') }))) });
  const paintLow = () => {
    const q = currentQuota(); const acc = getAccount();
    const left = q && q.limit ? Math.max(0, (q.limit - (q.used || 0))) : null;
    const show = left != null && left <= 8 && !(acc && acc.pro && left > 0);
    lowChip.hidden = !show;
    if (show) lowChip.textContent = left === 0 ? L('Für heute aufgebraucht', 'Used up for today') : left === 1 ? L('Noch 1 Antwort heute', '1 answer left today') : L(`Noch ${left} Antworten heute`, `${left} answers left today`);
    lowChip.classList.toggle('zero', left === 0);
    lowChip.disabled = !!(acc && acc.pro);
  };
  onQuota(paintLow);
  isl.appendChild(h('div', { class: 'ai-chips' }, refChip, attChip, lowChip));
  // „+ Dokument“: Feld zum Reinziehen – oder Datei auswählen, oder ⌘V
  const MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const dropZone = h('div', { class: 'ai-dz' },
    h('span', { class: 'ai-dzi', html: ico('upload') }),
    h('b', {}, L('Dokument hierher ziehen', 'Drag your document here')),
    h('small', {}, L('PDF, PowerPoint, Word oder Foto', 'PDF, PowerPoint, Word or photo')),
    h('button', { class: 'btn sm primary', type: 'button', onclick: e => { e.stopPropagation(); attIn.click(); } }, L('Datei auswählen', 'Choose a file')),
    h('small', { class: 'ai-dzk' }, L(`oder kopieren und mit ${MAC ? '⌘' : 'Strg'} + V ins Eingabefeld einfügen`, `or copy it and paste into the input with ${MAC ? '⌘' : 'Ctrl'} + V`)));
  const dropPop = h('div', { class: 'ai-drop', hidden: true, role: 'dialog', 'aria-label': L('Dokument hinzufügen', 'Add a document') },
    h('button', { class: 'ai-dropx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: e => { e.stopPropagation(); toggleDrop(false); } }), dropZone);
  isl.appendChild(dropPop);
  function toggleDrop(v) {
    const on = v === undefined ? dropPop.hidden : !!v;
    dropPop.hidden = !on; attBtn.classList.toggle('on', on); attBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  ['dragenter', 'dragover'].forEach(ev => dropPop.addEventListener(ev, e => { if (!hasFiles(e)) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; dropZone.classList.add('over'); }));
  dropPop.addEventListener('dragleave', e => { if (!dropPop.contains(e.relatedTarget)) dropZone.classList.remove('over'); });
  dropPop.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('over'); const fs = [...(e.dataTransfer.files || [])]; if (fs.length) { toggleDrop(false); addFiles(fs); } });
  document.addEventListener('pointerdown', e => { if (!dropPop.hidden && !dropPop.contains(e.target) && !attBtn.contains(e.target)) toggleDrop(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !dropPop.hidden) toggleDrop(false); });
  attIn.addEventListener('change', () => toggleDrop(false));
  function setRef(r) {
    const spot = spotText(r.el, 64) || r.say.slice(0, 64);
    askRef = { i: r.i, n: r.n, say: r.say, spot: spotText(r.el, 160) || r.say };
    refTx.replaceChildren(h('b', {}, L(`Frage zu ${r.i}/${r.n}`, `About ${r.i}/${r.n}`)), ' · ' + spot);
    refChip.hidden = false; root.classList.add('has-ref');
    inp.dataset.phLock = L('Deine Frage zu dieser Stelle …', 'Your question about this spot …'); inp.placeholder = inp.dataset.phLock;
  }
  function clearRef() { askRef = null; refChip.hidden = true; root.classList.remove('has-ref'); if (!attachTx) delete inp.dataset.phLock; }
  addEventListener('hashchange', () => { if (askRef) clearRef(); });
  async function runTours(p, t) {
    if (p.tour && p.tour.length) {
      const steps = p.tour.map(x => ({ el: byMxId(x.id), say: x.say })).filter(x => x.el);
      if (!steps.length) return;
      if (!STAGE && open) closeAnimated();   // Seite frei machen – Max zeigt direkt auf ihr
      setTimeout(() => startTour(steps), STAGE ? 200 : 520);
      return;
    }
    if (!t || !t.isConnected) return;
    // warten, bis die Tafel fertig geschrieben ist
    for (let k = 0; k < 40 && t.isConnected && t.querySelector('.ai-hide'); k++) await sleep(120);
    const steps = boardSteps(t);
    drawTourBtn();
    if (steps.length >= 2 && t.isConnected && !MOB.matches) setTimeout(() => { if (t.isConnected && state !== 'think') startTour(steps); }, 450);
  }
  function drawTourBtn() { const st = boardSteps(bArea.querySelector('.tafel')); bTour.hidden = st.length < 2; }
  // „Klick mich – ich führ dich durch“: Max liest die Seite und zeigt dir mit dem Cursor, worauf es ankommt
  function pageTour() {
    stopTour();
    // Im Tutor-Raum wechselt die Ansicht beim Fragen ins Gespräch – die Seitenkarte entsteht erst danach
    if (STAGE) { pendingMap = LAZY_MAP; submit(L('Führ mich durch den Tutor-Raum – zeig mir mit deinem Cursor, was hier wichtig ist und wie ich es nutze.', 'Walk me through the tutor room – show me with your cursor what matters here and how to use it.')); return; }
    const m = pageMap();
    setOpen(true);
    if (!m.count) { submit(L('Wobei kann ich dir auf dieser Seite helfen?', 'How can I help you on this page?')); return; }
    pendingMap = m.text;
    const pl = placeLabel();
    submit(L(`Führ mich durch die Seite „${pl}“ – zeig mir mit deinem Cursor, was hier wichtig ist und wie ich es nutze.`, `Walk me through the page “${pl}” – show me with your cursor what matters here and how to use it.`));
  }
  function favChip(it) { return favStar(() => it, { label: true, cls: 'ai-cmd ai-fav' }); }
  // Getippte Antwort nachträglich anhören
  function listenBtn(text, txt, ex) {
    const b = h('button', { class: 'ai-cmd ai-hear', type: 'button', html: SVG.spkOn + '<span>' + L('Anhören', 'Listen') + '</span>' });
    b.onclick = async () => {
      if (state === 'think') return;
      if (state === 'speak') { stopAll(true); return; }
      unlockAudio();
      const my = ++gen; ctrl = new AbortController(); b.classList.add('on');
      try { await speak(text, my, txt, null, ex); } finally { b.classList.remove('on'); if (my === gen) ctrl = null; ex.aTx.replaceChildren(richText(txt)); }
    };
    return b;
  }
  function afterAnswer() {
    // Sprachgespräch: Max hört danach direkt weiter zu
    if (viaVoice && open && state === 'idle' && !typing && !document.hidden) setTimeout(() => { if (viaVoice && open && state === 'idle' && !typing && !document.hidden) startListen({ followup: true }); }, 450);
  }

  // ---------- Vorlesen (Text + Tafel laufen mit der Stimme) ----------
  function unlockAudio() { if (state === 'speak') return; try { audio.src = SILENT; audio.play().catch(() => {}); } catch (e) {} }
  // Vorlesen in Stücken: der erste Satz geht sofort los, der Rest wird geholt, während Max schon spricht
  function speechChunks(text) {
    const sents = String(text).replace(/\s+/g, ' ').trim().match(/[^.!?…:;]+[.!?…:;]+["“”»«)]*\s*|[^.!?…:;]+$/g) || [text];
    const out = []; let cur = '';
    for (const s0 of sents) {
      const s1 = s0.trim(); if (!s1) continue;
      const lim = out.length === 0 ? 170 : 2500;   // höchstens zwei Stücke: jedes Vorlesen kostet eine Einheit
      if (cur && (cur.length + s1.length + 1 > lim || (out.length === 0 && cur.length >= 60))) { out.push(cur); cur = s1; }
      else cur = cur ? cur + ' ' + s1 : s1;
    }
    if (cur) out.push(cur);
    return out.length ? out : [text];
  }
  async function speak(text, my, txt, t, ex) {
    text = speakMath(text, getOutLang() === 'en');
    const aEl = ex.aTx;
    let shown = false;
    // Ohne Ton: ganzen Text in SEINE Blase (nie in eine neuere)
    const showNow = (instant) => { if (shown) return; shown = true; ex.done = true; if (instant) aEl.replaceChildren(richText(txt)); else typeIt(aEl, txt, { scroll: capScroll }); if (t) writeAlong(t, () => 1); capScroll(); };
    capThinking();
    const chunks = speechChunks(text.slice(0, 2500)), total = chunks.reduce((a, c) => a + c.length, 0) || 1;
    const fetchTTS = s => ask('tts', { text: s, opts: { voice: getVoice() } }, { signal: ctrl?.signal }).then(r => {
      const bin = atob(r.audio || ''); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return URL.createObjectURL(new Blob([u8], { type: r.mime || 'audio/mpeg' }));
    });
    const urls = [];
    let doneChars = 0, ci = 0, stopped = false;
    const prog = () => { const d = audio.duration, f = isFinite(d) && d > 0 ? Math.min(1, audio.currentTime / d) : 0; return Math.min(1, (doneChars + f * (chunks[ci]?.length || 0)) / total); };
    // Text läuft mit der Stimme mit – über alle Stücke hinweg
    const parts = String(txt || '').split(/(\s+)/), tlen = String(txt || '').length;
    let syncing = false, shownLen = -1;
    const syncLoop = () => {
      if (!syncing || !aEl.isConnected) return;
      const target = Math.ceil(Math.min(1, prog() * 1.03) * tlen);
      let acc = 0, out = '';
      for (const p of parts) { if (acc >= target && p.trim()) break; out += p; acc += p.length; }
      if (out.length !== shownLen) { shownLen = out.length; aEl.replaceChildren(richText(out || '…')); capScroll(); }
      requestAnimationFrame(syncLoop);
    };
    try {
      let next = fetchTTS(chunks[0]);
      for (ci = 0; ci < chunks.length; ci++) {
        const url = await next; urls.push(url);
        if (my !== gen) { stopped = true; break; }
        if (!cfg.spk) { showNow(); setState('idle'); afterAnswer(); urls.forEach(u => URL.revokeObjectURL(u)); return; }
        if (ci + 1 < chunks.length) { next = fetchTTS(chunks[ci + 1]); next.catch(() => {}); }
        audio.src = url;
        audio.volume = clamp(+ls.get('tutor.vol', 1), 0, 1); audio.muted = !cfg.spk;
        if (ci === 0) setState('speak');
        let ok = true;
        const finished = new Promise(res => { audio.onended = () => res('end'); audio.onpause = () => { if (!audio.ended) res('pause'); }; audio.onerror = () => res('err'); });
        await audio.play().catch(() => { ok = false; });
        if (my !== gen) { stopped = true; break; }
        if (!ok) { syncing = false; urls.forEach(u => URL.revokeObjectURL(u)); showNow(); setState('idle', L('Ton war blockiert – die Antwort steht oben.', 'Sound was blocked – the answer is above.')); return; }
        if (ci === 0) {
          shown = true; ex.done = true; aEl.classList.add('typing-on');
          syncing = true; requestAnimationFrame(syncLoop);
          if (t) writeAlong(t, () => (stopped ? 1 : prog()));
        }
        const how = await finished;
        doneChars += chunks[ci].length;
        if (how !== 'end' || my !== gen) { stopped = true; break; }
      }
      syncing = false; aEl.classList.remove('typing-on'); aEl.replaceChildren(richText(txt)); capScroll();
      urls.forEach(u => URL.revokeObjectURL(u));
      if (!stopped && my === gen && state === 'speak') { setState('idle'); fc.pulse('happy', 900); afterAnswer(); }
      else if (!shown) showNow(true);
    } catch (e) {
      syncing = false; aEl.classList.remove('typing-on');
      urls.forEach(u => URL.revokeObjectURL(u));
      if (shown) { aEl.replaceChildren(richText(txt)); capScroll(); } else showNow(my !== gen);
      if (my !== gen) return;
      setState('idle', e?.name === 'AbortError' ? L('Gestoppt.', 'Stopped.') : (e?.code === 'voice_busy' || e?.code === 'cap') ? e.message : L('Vorlesen hat nicht geklappt.', 'Reading aloud didn’t work.'));
    }
  }

  // ---------- Zuhören (mit Live-Mitschrift) ----------
  let listenTok = 0, anSrc = null, capTimer2 = 0, held = false;
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
    try { s = await getMic(); }
    catch (e) { if (tok !== listenTok) return; viaVoice = false; setState('idle', L('Mikro nicht erlaubt – tipp einfach.', 'Mic not allowed – just type.')); setTyping(true); fc.pulse('sad'); return; }
    // inzwischen gestoppt, eingeklappt oder ins Tippen gewechselt? → Mikro sofort wieder aus
    if (tok !== listenTok || !open || typing || rec) { freeMic(); if (tok === listenTok && state === 'listen') setState('idle'); return; }
    stream = s; held = true;
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(m => MediaRecorder.isTypeSupported?.(m)) || '';
    const r = rec = new MediaRecorder(s, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
    chunks = [];
    r.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    r.onstop = () => { if (stream === s) releaseMic(); onRecorded(r, r.mimeType || mime || 'audio/webm'); };
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
        if (spoke && t - lastLoud > 1050) return stopListen();
        if (!spoke && t - t0 > quiet) return stopListen(true);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch (e) {}
  }
  function releaseMic() {
    if (held) { held = false; freeMic(); }   // Mikro bleibt kurz erlaubt (stumm) – keine neue Nachfrage bei der nächsten Frage
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

  const QUIPS = L([
    ['Daytona, Batman-GMT oder Submariner – welche Rolex steht mir besser?', ['Daytona', 'Batman', 'Submariner'], ['Klassiker. Wie mein Kapitalwert: immer positiv.', 'Mutig. Papa sagt, Blau-Schwarz ist das neue Beige.', 'Zeitlos. Wie die doppelte Buchführung.'], [46, 22, 32]],
    ['Saint-Tropez, Monaco oder Sylt – wo verbring ich das nächste Semester?', ['Saint-Tropez', 'Monaco', 'Sylt'], ['Gute Wahl. Club 55 statt Hörsaal 3.', 'Steuerlich clever. Du lernst schnell.', 'Heimvorteil. Ich reservier schon mal in Kampen.'], [34, 24, 42]],
    ['Privatjet chartern, kaufen – oder doch Airline?', ['Chartern', 'Kaufen', 'Airline'], ['Asset-light. Du hast BWL verstanden.', 'Bilanzverlängerung deluxe. Respekt.', 'First Class, hoffe ich. Sonst reden wir nicht mehr.'], [33, 52, 15]],
    ['Aperol oder Hugo – was trinkt man beim Lernen?', ['Aperol', 'Hugo'], ['Orange ist das neue Gold. Weiterlernen!', 'Sylt-Klassiker. Aber erst nach dem Quiz.'], [74, 26]],
    ['Polo oder Golf – womit netzwerk ich am Wochenende?', ['Polo', 'Golf'], ['Pferde sind auch nur Anlagevermögen.', 'Handicap runter, Kontakte rauf.'], [31, 69]],
    ['Kampen oder Keitum – wo steht mein nächstes Ferienhaus?', ['Kampen', 'Keitum'], ['Natürlich. Die Whiskeystraße ruft.', 'Understatement. Gefällt mir.'], [71, 29]],
  ], [
    ['Daytona, Batman GMT or Submariner – which Rolex suits me best?', ['Daytona', 'Batman', 'Submariner'], ['A classic. Like my NPV: always positive.', 'Bold. Dad says blue-black is the new beige.', 'Timeless. Like double-entry bookkeeping.'], [46, 22, 32]],
    ['Saint-Tropez or Monaco – where do I spend next semester?', ['Saint-Tropez', 'Monaco'], ['Good call. Club 55 instead of lecture hall 3.', 'Tax-smart. You learn fast.'], [58, 42]],
    ['Charter a jet, buy one – or fly commercial?', ['Charter', 'Buy', 'Airline'], ['Asset-light. You get business.', 'Balance sheet extension deluxe. Respect.', 'First class, I hope. Otherwise we’re done.'], [33, 52, 15]],
    ['Aperol or Hugo – what do you drink while studying?', ['Aperol', 'Hugo'], ['Orange is the new gold. Keep going!', 'A classic. But only after the quiz.'], [74, 26]],
    ['Polo or golf – where do I network this weekend?', ['Polo', 'Golf'], ['Horses are just fixed assets.', 'Handicap down, contacts up.'], [31, 69]],
  ]);
  const VERDICT = L({
    npc: ['Du NPC.', 'Mainstream-Move. NPC-Energie.', 'Mit der Herde. Sicher ist sicher.', 'Basic, aber solide. NPC.', 'Wie alle. Ich sag nix.'],
    mid: ['Solide Mitte. Weder NPC noch Legende.', 'Ausgeglichen – wie eine gute Bilanz.', 'Halb Herde, halb Main Character.'],
    rare: ['Du bist was Besonderes. Bild dir nix drauf ein.', 'Auch ein blindes Huhn findet mal ein Korn.', 'Minderheit. Mutig – oder einfach verpeilt.', 'Main-Character-Energie. Übertreib’s nicht.'],
  }, {
    npc: ['You NPC.', 'Mainstream move. NPC energy.', 'With the herd. Safe choice.', 'Basic but solid. NPC.'],
    mid: ['Solid middle. Not NPC, not legend.', 'Balanced – like a good balance sheet.'],
    rare: ['You’re special. Don’t let it go to your head.', 'Even a blind squirrel finds a nut.', 'Minority. Brave – or just lost.'],
  });
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let quipT = 0, quipHide = 0, qi = Math.floor(Math.random() * QUIPS.length);
  function hideQuip() { clearTimeout(quipHide); if (quip.hidden) return; quip.classList.add('out'); setTimeout(() => { quip.hidden = true; quip.classList.remove('out'); root.classList.remove('quipping'); }, 900); }
  function showQuip() {
    if (cfg.quips !== false && root.classList.contains('landtop')) { clearTimeout(quipT); quipT = setTimeout(showQuip, 3000); return; }
    if (cfg.quips === false || learningNow() || open || tourActive() || !isAssistantEnabled() || document.hidden || root.classList.contains('covered') || root.classList.contains('nobub') || document.querySelector('body > .modal-bg, body > .voice')) return planQuip();
    const [q, opts, ans, pct] = QUIPS[qi++ % QUIPS.length];
    const reply = i => {
      try { window.BM && window.BM.track('Spaßfrage beantwortet', opts[i]); } catch (e) {}
      const t = ans[i], v = pct?.[i] ? Math.max(3, Math.min(97, pct[i] + Math.round(Math.random() * 4 - 2))) : 0;
      const kids = [h('p', { class: 'q-a' }, t)];
      if (v) {
        const tier = v >= 60 ? 'npc' : v <= 30 ? 'rare' : 'mid';
        kids.push(h('div', { class: 'q-st' },
          h('div', { class: 'q-bar' }, h('i', { style: `--w:${v}%` })),
          h('small', {}, L(`${v} % haben das auch gewählt.`, `${v} % picked that too.`) + ' ' + pick(VERDICT[tier]))));
      }
      quip.replaceChildren(...kids); bf.pulse('happy', 1200); clearTimeout(quipHide); quipHide = setTimeout(hideQuip, pct ? 6500 : 4500); };
    quip.replaceChildren(h('p', {}, q), h('div', { class: 'q-r' }, opts.map((o, i) => h('button', { class: 'chip', type: 'button', onclick: e => { e.stopPropagation(); reply(i); } }, o))),
      h('button', { class: 'q-x', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: e => { e.stopPropagation(); hideQuip(); } }));
    quip.hidden = false; quipN++; root.classList.add('quipping'); bf.pulse('smug', 1400);
    clearTimeout(quipHide); quipHide = setTimeout(hideQuip, root.classList.contains('land') ? 11000 : 14000);
    planQuip();
  }
  // Startseite: etwa alle 30–40 s (fängt Blicke). In der App beim Lernen nur selten (alle 6–9 Min.), nie mitten im Tun.
  let quipN = 0; const quipStart = performance.now();   // erste Minute nach dem Öffnen: keine Frage
  function planQuip(first) {
    clearTimeout(quipT); if (cfg.quips === false) return;
    const land = !route().tab && !document.getElementById('landing')?.classList.contains('hidden');
    const ms = land ? (first ? Math.max(8000, 60000 - (performance.now() - quipStart)) : 20000 + Math.random() * 6000) : (first ? 60000 : 180000 + Math.random() * 60000);
    quipT = setTimeout(() => { if (land && quipN >= 14) return; showQuip(); }, ms);
  }
  addEventListener('hashchange', () => planQuip(true));
  function toggleQuips() { cfg.quips = cfg.quips === false; saveCfg(); if (cfg.quips === false) { hideQuip(); clearTimeout(quipT); toast(L('Keine Sprüche mehr. Langweilig, aber okay.', 'No more jokes. Boring, but fine.')); } else { planQuip(true); toast(L('Sprüche sind wieder an.', 'Jokes are back on.')); } }
  planQuip(true);

  // Rechtsklick bzw. lange drücken auf den Kopf: kleines Menü (Sprüche aus, ausblenden)
  function openCtx(x, y) {
    ctxm.replaceChildren(
      h('button', { class: 'asst-mi', type: 'button', onclick: () => { ctxm.hidden = true; setOpen(true); } }, h('span', { html: ico('chat') }), L('Max öffnen', 'Open Max')),
      h('button', { class: 'asst-mi', type: 'button', onclick: () => { ctxm.hidden = true; toggleQuips(); } }, h('span', { html: ico('bulb') }), cfg.quips === false ? L('Sprüche & Fragen an', 'Jokes & questions on') : L('Sprüche & Fragen aus', 'Jokes & questions off')),
      h('button', { class: 'asst-mi', type: 'button', onclick: () => { ctxm.hidden = true; setAssistantEnabled(false); } }, h('span', { html: ico('x') }), L('Max ausblenden', 'Hide Max')),
      h('small', {}, L('Zurückholen: unten in der Seitenleiste „Max einblenden“.', 'Bring back: “Show Max” at the bottom of the sidebar.')));
    ctxm.hidden = false;
    const r = ctxm.getBoundingClientRect();
    ctxm.style.left = Math.max(8, Math.min(innerWidth - r.width - 8, x - r.width)) + 'px';
    ctxm.style.top = Math.max(8, Math.min(innerHeight - r.height - 8, y - r.height - 8)) + 'px';
  }
  bub.addEventListener('contextmenu', e => { e.preventDefault(); openCtx(e.clientX, e.clientY); });
  let lpT = 0;
  bub.addEventListener('touchstart', e => { const t = e.touches[0]; lpT = setTimeout(() => { justDragged = true; setTimeout(() => { justDragged = false; }, 400); openCtx(t.clientX, t.clientY); }, 550); }, { passive: true });
  ['touchend', 'touchmove', 'touchcancel'].forEach(ev => bub.addEventListener(ev, () => clearTimeout(lpT), { passive: true }));
  document.addEventListener('pointerdown', e => { if (!ctxm.hidden && !ctxm.contains(e.target)) ctxm.hidden = true; });
  quip.addEventListener('click', e => { if (!e.target.closest('button')) { hideQuip(); setOpen(true); } });

  // Handy-Tastatur: Leiste bleibt über der Tastatur
  const vv = window.visualViewport;
  if (vv) { const kb = () => root.style.setProperty('--kb', Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)) + 'px'); vv.addEventListener('resize', kb); vv.addEventListener('scroll', kb); }


  // ---------- Tutor-Raum: Max zieht auf die Seite ----------
  // Eingabe, Gespräch und Tafel liegen dann genau über den Plätzen, die der Raum dafür freihält.
  let stageRO = null, islRO = null, stageTick = 0, keepBoard = false;
  function placeStage() {
    if (!STAGE || !STAGE.slots) return;
    const put = (k, el) => {
      if (!el || !el.isConnected) return;
      const r = el.getBoundingClientRect();
      root.style.setProperty(`--${k}l`, r.left + 'px'); root.style.setProperty(`--${k}t`, r.top + 'px');
      root.style.setProperty(`--${k}w`, r.width + 'px'); root.style.setProperty(`--${k}h`, r.height + 'px');
      root.style.setProperty(`--${k}b`, (innerHeight - r.bottom) + 'px');
    };
    put('sc', STAGE.slots.composer); put('sf', STAGE.slots.chat); put('sb', STAGE.slots.board);
  }
  function burst(ms = 700) { cancelAnimationFrame(stageTick); const t0 = performance.now(); const f = () => { placeStage(); if (STAGE && performance.now() - t0 < ms) stageTick = requestAnimationFrame(f); }; f(); }
  addEventListener('resize', () => { if (STAGE) burst(300); });
  function stage(o) {
    STAGE = o;
    root.classList.add('stage'); root.classList.remove('off', 'lock', 'tip-on');
    hideQuip(); closeMenu(); ctxm.hidden = true; chip.remove();
    if (!open) setOpen(true); else syncLock();
    applyEnabled(false);
    stageRO?.disconnect(); islRO?.disconnect();
    stageRO = new ResizeObserver(() => placeStage());
    [o.slots.composer, o.slots.chat, o.slots.board, document.getElementById('view')].forEach(el => el && stageRO.observe(el));
    islRO = new ResizeObserver(() => { try { STAGE?.onIsl?.(isl.getBoundingClientRect().height); } catch (e) {} });
    islRO.observe(isl);
    burst(900); drawButtons();
  }
  function unstage() {
    if (!STAGE) return;
    STAGE = null; stageRO?.disconnect(); islRO?.disconnect(); cancelAnimationFrame(stageTick);
    root.classList.remove('stage', 'stage-talk', 'stage-hold', 'show-old');
    keepBoard = boardOpen && !boardMin;
    if (boardOpen) closeBoard();
    if (feedOpen) setFeedOpen(false, { instant: true, force: true });
    if (open) { closing = null; setOpen(false); }
    applyEnabled(false); syncLock(); drawButtons();
  }
  function stageTalk(v) {
    root.classList.toggle('stage-talk', !!v);
    if (!v && boardOpen) closeBoard();
    setFeedOpen(!!v, { instant: true });
    if (v && feedList.children.length) { showCap(); capScroll(); }
    burst(700);
  }
  // Kleine Nachricht von Max ins Gespräch (ohne KI, z. B. „Pause vorbei“)
  function note(text) {
    const aTx = h('div', { class: 'ai-a' });
    const b = h('div', { class: 'ai-bub max note' }, aTx);
    revealWords(aTx, text);
    feedList.querySelectorAll('.ai-bub.last').forEach(x => x.classList.remove('last'));
    b.classList.add('last'); curEx = null;
    feedList.appendChild(b); showCap(); drawTog(); capScroll();
  }
  function holdBub(v, pop) {
    root.classList.toggle('bub-hold', !!v);
    // Kreis blendet weich ein, das Gesicht liegt schon genau da, wo der fliegende Kopf gelandet ist
    if (!v && pop && !matchMedia('(prefers-reduced-motion: reduce)').matches) bub.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
  }
  function bubFaceRect() {
    if (open && !STAGE) return fEl.getBoundingClientRect();
    placeBub();
    return bubFace.getBoundingClientRect();
  }

  setState('idle');
  placeBub(); coverCheck();
  applyEnabled(false);
  api = {
    applyEnabled, open: () => setOpen(true), close: () => setOpen(false),
    // Von außen: Text direkt an Max geben (z. B. „Erklär's mir“-Feld) bzw. Sprechen starten
    ask: (t, o) => { setOpen(true); if (MOB.matches && feedOpen) setFeedOpen(false); submit(t, o || {}); },
    talk: () => { if (!open) setOpen(true, { listen: true }); else startListen(); },
    stage, unstage, talk2: stageTalk, note, holdBub, bubFaceRect, relayout: burst,
    hold: v => root.classList.toggle('stage-hold', !!v),
    markOld: () => feedList.querySelectorAll('.ai-bub:not(.last)').forEach(b => b.classList.add('old')),
    prefill: t => { if (state !== 'idle') return; inp.value = t; inp.focus({ preventScroll: true }); try { inp.setSelectionRange(t.length, t.length); } catch (e) {} drawButtons(); },
    hasOld: () => !!feedList.querySelector('.ai-bub.old'),
    showOld: v => { root.classList.toggle('show-old', !!v); capScroll(); },
    hasHistory: () => hist.length > 0,
    // „Weiter: …“ – nie eine Seitenführung (die gehört zu einer anderen Seite und lässt sich nicht „fortsetzen“)
    lastQuestion: () => { const m = [...hist].reverse().find(x => x.role === 'user' && !TOURQ.test(x.content.replace(/^\[[^\]]*\]\n/, ''))); return m ? m.content.replace(/^\[[^\]]*\]\n/, '') : ''; },
    state: () => state, stopAll: () => stopAll(),
    focusInput: () => { if (state === 'idle') inp.focus({ preventScroll: true }); },
    newTalk: () => newTalk(),
    boardShown: () => boardOpen && !boardMin,
    // Von außen (Bibliothek): eine gespeicherte Tafel groß zeigen
    showBoard: b => { if (!b || !b.html) return; let i = boards.findIndex(x => x.title === b.title && x.html === b.html); if (i < 0) { boards.push({ title: b.title, html: b.html }); i = boards.length - 1; } bIdx = i; drawBoard(false); openBoard(); },
    restoreBoard: () => { if (keepBoard && boards.length && !boardOpen) { keepBoard = false; drawBoard(false); openBoard(); } },
  };
  return api;
}
