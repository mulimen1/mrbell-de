// Tutor-Raum – die Startseite. Max groß in der Mitte, rechts (aufklappbar) deine Skripte, unten das Eingabefeld.
// Erst begrüßt er dich und sagt, was jetzt dran ist (Fortschritt diese Woche, was offen ist, sein Tipp).
// Sobald ihr loslegt, rutscht er nach oben, das Gespräch und die Tafel übernehmen die Bühne. Mit Pausen und Session-Bilanz.
import { wantsLibrary, libraryMaterial } from '../library-search.js';
import { h, ico, ls, toast } from '../util.js';
import { L, LOCALE } from '../i18n.js';
import { face, isAsleep } from '../face.js';
import { S, mastery, onChange, saveNow } from '../state.js';
import { getAccount, onAccount, currentQuota } from '../api.js';
import { getNick, gruss, halloText, nextSpruch } from '../nick.js';
import { getSpice, thinkLines } from '../max.js';
import { dueCards } from './cards.js';
import { planSummary } from './plan.js';
import { forChat, fullText, topPages } from '../retrieve.js';
import * as M from '../me.js';
import * as MC from '../maxcfg.js';
import { recommend, exams, weekMinutes, syncAsk, startChecklist } from './me.js';
import { fly, setRoomHead } from '../flight.js';
import { thoughtFor } from '../thoughts.js';
import { homeBeta } from '../beta.js';
import { entryTools } from '../entrycards.js';
import { vertrauenBtn } from '../vertrauen.js';

// Skript, das bei leerem Kontingent kam: Begrüßung bleibt für diese Sitzung stehen, auch wenn der Raum neu zeichnet
let waitGreet = null;

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOB = matchMedia('(max-width: 900px)');
const docById = id => S.list.find(d => d.id === id);
const tage = n => n === 1 ? L('1 Tag', '1 day') : L(`${n} Tagen`, `${n} days`);
const pick = a => a[Math.floor(Math.random() * a.length)];
const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const hm = t => new Date(t).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });

// Laufende Lernsession – bleibt erhalten, wenn man kurz woanders hinschaut
const SES = { on: false, t0: 0, asks: 0, boards: 0, pausedMs: 0, nextPause: 0, pauseAt: 0 };
const elapsed = () => SES.on ? Date.now() - SES.t0 - SES.pausedMs : 0;
// Länger als 30 Minuten weg (oder Tab zu)? Dann beginnt beim nächsten Mal eine neue Session.
function staleCheck() { if (SES.on && SES.seen && Date.now() - SES.seen > 30 * 60e3) SES.on = false; }
const PAUSE_LEN = { 25: 5, 50: 10, 90: 15 };
function planPause() { const p = MC.pauseMin(); SES.nextPause = SES.on && p ? Date.now() + p * 60e3 : 0; }
function startSession() { if (SES.on) return; Object.assign(SES, { on: true, t0: Date.now(), asks: 0, boards: 0, pausedMs: 0 }); planPause(); }

// Woran wir gerade arbeiten (Skripte im Fokus)
const getFocus = () => (ls.get('tutor.room.focus', []) || []).filter(id => docById(id));
const setFocus = ids => { ls.set('tutor.room.focus', [...new Set(ids)].filter(id => docById(id)).slice(0, 4)); ls.set('tutor.room.focusAt', Date.now()); };

export function render(root, ctx = {}) {
  staleCheck();
  // Lädt Max (Netz wackelt kurz)? Einmal sauber neu laden – die offene Frage bleibt gespeichert und wird danach gestellt
  const asstP = import('../assistant.js').then(m => m.mountAssistant()).catch(e => {
    let t = 0; try { t = +sessionStorage.getItem('tutor.reloadOnce') || 0; } catch (x) {}
    if (Date.now() - t > 60000) { try { sessionStorage.setItem('tutor.reloadOnce', String(Date.now())); } catch (x) {} location.reload(); }
    else toast(L('Verbindung wackelt – lad die Seite bitte kurz neu.', 'Connection is shaky – please reload the page.'), 8000);
    return null;
  });
  let api = null, mode = 'home', fc = null, stopped = false;
  const cfg = () => MC.getCfg();

  // ---------- Gerüst ----------
  const faceEl = h('div', { class: 'rm-face' });
  const heroSlot = h('div', { class: 'rm-fs big' });
  const talkSlot = h('div', { class: 'rm-fs talk' });
  const say = h('p', { class: 'rm-say', 'aria-live': 'polite' });
  const cfgBtn = () => h('button', { class: 'rm-gear', type: 'button', onclick: () => MC.openMaxCfg(), title: L('Max konfigurieren – Ton, Methode, Fokus, Pausen', 'Configure Max – tone, method, focus, breaks'), 'aria-label': L('Max konfigurieren', 'Configure Max'), html: ico('tune') });
  const skills = h('div', { class: 'rm-skills' });
  const askSlot = h('div', { class: 'rm-ask' });
  const hero = h('div', { class: 'rm-hero' }, heroSlot, h('div', { class: 'rm-bubble' }, say), skills, askSlot);
  const scroll = h('div', { class: 'rm-scroll' }, hero);
  const status = h('small', { class: 'rm-st' });
  const timer = h('span', { class: 'rm-timer', hidden: true });
  const oldBtn = h('button', { class: 'iconbtn rm-old', type: 'button', title: L('Früheres Gespräch zeigen', 'Show earlier conversation'), html: ico('clock'), hidden: true, onclick: () => { const on = !oldBtn.classList.contains('on'); oldBtn.classList.toggle('on', on); api && api.showOld(on); } });
  // Skripte: rechts aufklappbar (am Handy als Leiste von unten) – beim Öffnen des Raums immer zu
  const skBtn = () => h('button', { class: 'rm-skb', type: 'button', 'aria-expanded': 'false', onclick: () => toggleRail(), title: L('Deine Skripte – antippen oder in den Chat ziehen', 'Your slides – tap or drag into the chat') },
    h('span', { html: ico('file') }), h('span', { class: 'rm-skl' }, L('Skripte', 'Slides')), h('b', { class: 'rm-skn' }), h('span', { class: 'rm-skc', html: ico('left') }));
  const skBtnHome = skBtn(), skBtnBar = skBtn();
  // Lernserie: kleine grüne Flamme neben den Einstellungen – grau, solange heute noch nicht gelernt wurde
  const FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/></svg>';
  // zweimal: oben in der Leiste (Gespräch) und oben rechts in der Ecke (Startansicht)
  const mkStk = () => h('span', { class: 'rm-streak', role: 'img' }, h('span', { class: 'rm-fl', html: FLAME }), h('b', { class: 'rm-stn' }, '0'));
  const stk = mkStk(), stkHome = mkStk();
  // Fortschritt: eigener Knopf im Tutor (nicht mehr oben in der Leiste)
  const progBtn = () => h('a', { class: 'rm-prog', href: '#/app/fortschritt', title: L('Dein Fortschritt', 'Your progress') }, h('span', { html: ico('trophy') }), h('span', { class: 'rm-progl' }, L('Fortschritt', 'Progress')));
  const drawStreak = () => {
    let days = {}; try { days = M.activityDays(S.list || []); } catch (e) {}
    const today = !!days[M.dayKey()], n = M.streak(days);
    for (const x of [stk, stkHome]) { x.querySelector('b').textContent = String(n); x.classList.toggle('on', today); x.classList.toggle('zero', !n); }
    const t = !n ? L('Lernserie: Heute anfangen – jeder Tag zählt.', 'Streak: start today – every day counts.')
      : today ? L(`${n} ${n === 1 ? 'Tag' : 'Tage'} Lernserie. Heute schon dabei.`, `${n}-day streak. Done for today.`)
      : L(`${n} ${n === 1 ? 'Tag' : 'Tage'} Lernserie – heute noch lernen, sonst ist sie weg.`, `${n}-day streak – study today to keep it.`);
    for (const x of [stk, stkHome]) { x.title = t; x.setAttribute('aria-label', t); }
  };
  drawStreak(); const stkIv = setInterval(drawStreak, 30000); const offStk = onChange(drawStreak);
  const bar = h('div', { class: 'rm-bar' },
    timer, h('span', { style: { flex: 1 } }), oldBtn, stk, progBtn(), cfgBtn(), skBtnBar,
    h('button', { class: 'btn sm rm-end-b', type: 'button', onclick: () => endSession() }, L('Session beenden', 'End session')));
  const chatSlot = h('div', { class: 'rm-chat' });
  const boardSlot = h('div', { class: 'rm-board' });
  // Gespräch: Max' Kopf bleibt groß oben, darunter das Gespräch; rechts daneben die Tafel
  let topicHead = ''; try { topicHead = sessionStorage.getItem('tutor.topicHead') || ''; sessionStorage.removeItem('tutor.topicHead'); } catch (e) {}
  const topicEl = topicHead ? h('h1', { class: 'rm-topic' }, L('Für BWL- & Wiwi-', 'For business & economics '), h('span', {}, L('Studenten.', 'students.'))) : null;
  // Themen-Einstieg ohne Chat (Beta): links statt Gespräch die stärksten Werkzeuge – „Was du daraus machen kannst“
  const toolsMode = !!topicHead && homeBeta() && innerWidth > 900;
  const toolsEl = toolsMode ? entryTools(topicHead) : null; let toolsAsks = 0;
  if (toolsMode) document.body.classList.add('bm-tools-mode');
  const talkCol = h('div', { class: 'rm-col' }, topicEl, h('div', { class: 'rm-th-wrap' }, talkSlot, toolsMode ? null : status), toolsEl, chatSlot);
  const talk = h('div', { class: 'rm-talk' }, talkCol, boardSlot);
  const focusRow = h('div', { class: 'rm-focus' });
  const sugg = h('div', { class: 'rm-sugg' });
  const comp = h('div', { class: 'rm-comp' });
  const dock = h('div', { class: 'rm-dock' }, focusRow, sugg, comp);
  const pickers = h('div', { class: 'rm-pickers uv-pick' });
  const corner = h('div', { class: 'rm-corner' }, homeBeta() ? pickers : null, stkHome, progBtn(), cfgBtn(), homeBeta() ? null : skBtnHome);
  // Oben rechts: „Bereits erstellt“ und „Deine Unterlagen“ (gewählte Unterlage = mit Max verbunden)
  function drawPickers() {
    if (!homeBeta()) return;
    import('./lernen.js').then(m => {
      const docs = S.list.map(x => (S.doc && S.doc.id === x.id ? S.doc : x)).sort((a, b) => Math.max(b.used || 0, b.created || 0) - Math.max(a.used || 0, a.created || 0));
      const d = focusDocs()[0] || null;
      pickers.replaceChildren(m.madePicker(docs));
    }).catch(() => {});
  }
  const drop = h('div', { class: 'rm-drop', hidden: true }, h('div', {}, h('span', { html: ico('file') }), h('b', {}, L('Loslassen – dann arbeiten wir damit.', 'Drop it – and we’ll work with it.'))));
  const stage = h('section', { class: 'rm-stage' }, corner, bar, scroll, talk, dock, drop);
  const right = h('aside', { class: 'rm-right', 'aria-label': L('Skripte', 'Slides') });
  const room = h('div', { class: 'room home' + (toolsMode ? ' rm-tools-mode' : '') }, stage, right);
  // Laptop mit Tafel: Eingabe nur unter dem Gespräch (links) – die Tafel reicht rechts bis ganz nach unten
  const placeDock = () => {
    // Themen-Einstieg: Eingabe sitzt links unter den Karten (über ihr: Lexikon, Rechner, Ablage)
    const tslot = toolsEl && room.classList.contains('rm-tools-mode') ? toolsEl.querySelector('.rm-tslot') : null;
    if (tslot) { if (dock.parentNode !== tslot) tslot.appendChild(dock); return; }
    const side = room.classList.contains('talk') && room.classList.contains('has-board') && innerWidth > 900;
    if (side && dock.parentNode !== talkCol) talkCol.appendChild(dock);
    else if (!side && dock.parentNode !== stage) stage.insertBefore(dock, drop);
    room.classList.toggle('dock-side', side);
  };
  new MutationObserver(placeDock).observe(room, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', placeDock);
  const thoughtHome = h('div', { class: 'rm-th', hidden: true }), thoughtBar = h('div', { class: 'rm-th', hidden: true });
  heroSlot.appendChild(thoughtHome); talkSlot.appendChild(thoughtBar);
  root.appendChild(room);
  heroSlot.appendChild(faceEl);
  fc = face(faceEl, { sleepy: true });

  // Der große Kopf ist Max' Zuhause, solange der Raum offen ist (Begrüßung und Seitenwechsel fliegen hierher)
  const bubbleEl = () => say.parentElement;
  const headApi = { el: faceEl, hide: () => { faceEl.style.visibility = 'hidden'; if (document.querySelector('.ngreet') && bubbleEl()) bubbleEl().style.opacity = '0'; }, show: flew => { faceEl.style.visibility = ''; if (bubbleEl() && bubbleEl().style.opacity === '0') { bubbleEl().style.opacity = ''; if (!reduce()) bubbleEl().animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' }); } let g = 0; try { g = +sessionStorage.getItem('tutor.justGreeted') || 0; } catch (e) {} if (mode === 'home' && Date.now() - g < 20000) setTimeout(() => speak(speechText()), 120); if (!flew && !reduce()) faceEl.animate([{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,1.3,.4,1)' }); } };
  setRoomHead(headApi);
  if (document.querySelector('.ngreet') || ctx.arrive) headApi.hide();

  // ---------- Daten ----------
  // Standard: ohne Skript. Nur ein gerade bewusst gewähltes/hochgeladenes Skript (letzte 2 Min.) bleibt verbunden
  if (Date.now() - (+ls.get('tutor.room.focusAt', 0) || 0) > 120000) ls.set('tutor.room.focus', []);
  function focusDocs() { return getFocus().map(docById).filter(Boolean); }
  function nextExam() { return exams()[0] || null; }
  function context() {
    const ds = focusDocs(), f = ds.length ? M.fachOf(ds[0].id) : null, ex = nextExam();
    const parts = [L('Seite: Tutor-Raum – Lernsession mit Max (Gespräch + große Tafel)', 'Page: tutor room – study session with Max (chat + big whiteboard)')];
    if (ds.length) parts.push(L('Skripte im Fokus: ', 'Slides in focus: ') + ds.map(d => `„${d.name}“`).join(', '));
    else parts.push(L('kein Skript gewählt – antworte aus deinem BWL-Wissen', 'no slides selected – answer from your business knowledge'));
    if (f) parts.push(L('Fach: ', 'Subject: ') + f.name + (f.klausur ? L(` (${M.artName(f.klausurArt)} am ${f.klausur})`, ` (${M.artName(f.klausurArt)} on ${f.klausur})`) : ''));
    else if (ex && ex.days <= 30) parts.push(L(`nächste Prüfung: ${ex.name} in ${tage(ex.days)}`, `next exam: ${ex.name} in ${tage(ex.days)}`));
    if (SES.on) parts.push(L(`Session läuft seit ${Math.round(elapsed() / 60e3)} Min.`, `session running for ${Math.round(elapsed() / 60e3)} min`));
    return '[' + parts.join(' · ') + ']';
  }
  function material(text) {
    const ds = focusDocs();
    if (!ds.length) return wantsLibrary(text) ? libraryMaterial(text) : null;   // auf Wunsch: alles Eigene durchsuchen
    if (ds.length === 1) return { material: forChat(ds[0], text), docName: ds[0].name };
    const per = Math.floor(48000 / ds.length);
    return { material: ds.map(d => { const all = fullText(d); return `### ${d.name}\n` + (all.length <= per ? all : topPages(d, text, per)); }).join('\n\n'), docName: ds.map(d => d.name).join(' + ') };
  }

  // ---------- Max spricht (Begrüßung, Lage, Tipp, Spruch) ----------
  function speechText() {
    const c = cfg(), a = getAccount(), nick = getNick(a);
    let fresh = 0; try { fresh = +sessionStorage.getItem('tutor.justGreeted') || 0; } catch (e) {}
    const justGreeted = Date.now() - fresh < 20000;
    const lets = ({ locker: L('So. Lass uns direkt loslegen.', 'Right. Let’s get going.'), freundlich: L('Schön, dass du da bist. Lass uns loslegen.', 'Good to have you here. Let’s get started.'), sachlich: L('Los geht’s.', 'Let’s go.'), streng: L('Keine Ausreden. Wir legen los.', 'No excuses. We start now.') })[c.ton] || L('Lass uns loslegen.', 'Let’s get started.');
    const out = [justGreeted ? lets : halloText(nick)];
    // Skript kam bei leerem Kontingent rein? Dann ist es das Erste, worum Max sich kümmert
    if (waitGreet && Date.now() - waitGreet.at < 15 * 60e3) { out.push(waitGreet.text); return out.join(' '); }
    const waitDoc = S.list.filter(d => d.waiting).sort((a, b) => b.waiting - a.waiting)[0];
    if (waitDoc) {
      const q = currentQuota(), left = q && q.limit ? q.limit - (q.used || 0) : 1;
      const nm = waitDoc.name.length > 52 ? waitDoc.name.slice(0, 51) + '…' : waitDoc.name;
      if (left <= 0) { out.push(L(`„${nm}“ ist sicher abgelegt. Für heute bin ich durch – morgen leg ich direkt damit los.`, `“${nm}” is safely stored. I’m done for today – tomorrow I’ll start right there.`)); return out.join(' '); }
      const d = S.doc && S.doc.id === waitDoc.id ? S.doc : waitDoc;
      d.waiting = null; waitDoc.waiting = null; saveNow(d).catch(() => {});
      ls.set('tutor.room.focus', [d.id]); ls.set('tutor.room.focusAt', Date.now());
      waitGreet = { at: Date.now(), text: L(`„${nm}“ hat auf uns gewartet – jetzt hab ich wieder Zeit. Womit fangen wir an: erklären, Karteikarten oder Quiz?`, `“${nm}” has been waiting for us – now I’ve got time again. Where do we start: explain it, flashcards or a quiz?`) };
      out.push(waitGreet.text);
      return out.join(' ');
    }
    // Lage in einem Satz – frisch hochgeladenes Skript zuerst: Max kennt es schon
    const ex = nextExam(), due = S.list.reduce((x, d) => x + dueCards(d).length, 0);
    const fresh1 = S.list.filter(d => !d.sample && Date.now() - (d.created || 0) < 3 * 3600e3).sort((a, b) => b.created - a.created)[0];
    if (fresh1 && !(homeBeta() && !getFocus().includes(fresh1.id))) {   // Beta: Max verbindet nie heimlich – nur was sichtbar verbunden ist
      const nm = fresh1.name.length > 52 ? fresh1.name.slice(0, 51) + '…' : fresh1.name;
      const nc = (fresh1.decks || []).reduce((x, k) => x + (k.cards || []).length, 0);
      if (!getFocus().length) { ls.set('tutor.room.focus', [fresh1.id]); ls.set('tutor.room.focusAt', Date.now()); setTimeout(() => { try { drawFocus(); } catch (e) {} }, 0); }   // Max sagt „hab ich gelesen“ → dann ist es auch verbunden (kein „Kein Skript verbunden“ darunter)
      out.push(nc ? L(`„${nm}“ hab ich gelesen – und deine ${nc} Karteikarten dazu liegen bereit.`, `I’ve read “${nm}” – and your ${nc} flashcards for it are ready.`) : L(`„${nm}“ hab ich schon gelesen.`, `I’ve already read “${nm}”.`));
      if (!justGreeted && getSpice() >= 2 && c.ton !== 'sachlich') out.push(nextSpruch());
      out.push(L('Was willst du daraus wissen?', 'What do you want to know from it?'));
      return out.join(' ');
    }
    if (ex && ex.days <= 21) out.push(ex.days === 0 ? L(`Heute ist ${ex.name}. Du packst das – kurz aufwärmen?`, `${ex.name} is today. You’ve got this – quick warm-up?`) : L(`${ex.name} in ${tage(ex.days)}${ex.m != null ? `, Prüfungsreife ${ex.m} %` : ''}. Da setzen wir an.`, `${ex.name} in ${tage(ex.days)}${ex.m != null ? `, readiness ${ex.m}%` : ''}. That’s where we start.`));
    else if (due) out.push(L(`${due} ${due === 1 ? 'Karte ist' : 'Karten sind'} fällig – ${Math.max(2, Math.round(due * .4))} Minuten, dann sitzt das.`, `${due} ${due === 1 ? 'card is' : 'cards are'} due – ${Math.max(2, Math.round(due * .4))} minutes and it sticks.`));
    else if (!S.list.filter(d => !d.sample).length) out.push(L('Zieh mir dein erstes Skript rein – oder sag mir einfach, was du lernen willst.', 'Drop in your first slides – or just tell me what you want to learn.'));
    else out.push(L('Nichts brennt. Perfekt, um vorzuarbeiten.', 'Nothing’s on fire. Perfect for getting ahead.'));
    // flotter Spruch (nicht direkt nach der Begrüßung, die hatte schon einen)
    if (!justGreeted && getSpice() >= 2 && c.ton !== 'sachlich') out.push(nextSpruch());
    out.push(({ streng: L('Also: Was nehmen wir uns vor?', 'So: what are we tackling?'), sachlich: L('Womit fangen wir an?', 'Where do we start?') })[c.ton] || L('Was soll ich dir beibringen?', 'What should I teach you?'));
    return out.join(' ');
  }
  function speak(text) {
    say.replaceChildren();
    if (reduce()) { say.textContent = text; return; }
    text.split(/(\s+)/).forEach((w, i) => { if (!w) return; if (!w.trim()) { say.append(w); return; } say.append(h('span', { class: 'rm-w', style: { '--i': String(i >> 1) } }, w)); });
    fc.set('talk'); clearTimeout(speak.t); speak.t = setTimeout(() => { if (fc.state === 'talk') fc.set('idle'); }, Math.min(5000, 300 + text.split(/\s+/).length * 42));
  }
  const react = text => { if (mode === 'home') speak(text); else api && api.note(text); };

  // ---------- Gedankenblasen: Max denkt laut (ab und zu, nicht bei jeder Antwort) ----------
  let lastThought = Date.now() - 20000, thT = 0;
  function think(force) {
    if (stopped || isAsleep() || document.hidden || room.querySelector('.rm-ov') || document.documentElement.classList.contains('mx-touring')) return;
    if (!force && Date.now() - lastThought < 45000) return;
    lastThought = Date.now();
    const el = mode === 'home' ? thoughtHome : thoughtBar, other = el === thoughtHome ? thoughtBar : thoughtHome;
    other.hidden = true;
    el.replaceChildren(h('span', {}, thoughtFor()), h('i', { class: 'd1' }), h('i', { class: 'd2' }));
    el.classList.remove('out'); el.hidden = false; void el.offsetWidth; el.classList.add('in');
    clearTimeout(thT); thT = setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.hidden = true; el.classList.remove('in', 'out'); }, 450); }, 5600);
  }
  // Während Max arbeitet: echte Gedanken statt Pünktchen – erst zur Frage, dann wechselnd, bis die Antwort da ist
  let workT = 0, workOn = false, lastQ = '';
  const STOPW = new Set('erklär erkläre erklären mir mich bitte kannst du was wie warum wieso welche welcher nochmal einmal einfach genau eigentlich zwischen unterschied diese dieser dieses einen einem einer eine über unter tafel schritt frage fragen nicht'.split(' '));
  function keyword(t) {
    const ws = String(t || '').replace(/[„“"'?!.,:;()]/g, ' ').split(/\s+/).filter(w => w.length > 4 && !STOPW.has(w.toLowerCase()));
    return ws.sort((a, b) => (/^[A-ZÄÖÜ]/.test(b) - /^[A-ZÄÖÜ]/.test(a)) || b.length - a.length)[0] || '';
  }
  function workLines() {
    const kw = keyword(lastQ), d = focusDocs()[0];
    const first = kw ? [
      L(`„${kw}“ – gute Wahl. Moment …`, `“${kw}” – good choice. One sec …`),
      d ? L(`${kw} … wo stand das nochmal im Skript?`, `${kw} … where was that in the slides?`) : L(`${kw}. Ich bau dir das sauber auf.`, `${kw}. Let me set this up properly.`),
      L(`Okay, ${kw}. Erst das Prinzip, dann ein Beispiel.`, `Okay, ${kw}. Principle first, then an example.`),
    ] : [L('Gute Frage. Moment …', 'Good question. One sec …')];
    return [first[Math.floor(Math.random() * first.length)], ...thinkLines('voice', [L('Ich sortier das kurz …', 'Sorting this out …'), L('Gleich hab ich’s …', 'Almost there …')])];
  }
  function showThought(text, { stay = false } = {}) {
    const el = mode === 'home' ? thoughtHome : thoughtBar, other = el === thoughtHome ? thoughtBar : thoughtHome;
    other.hidden = true;
    const fresh = el.hidden || el.classList.contains('out');
    el.replaceChildren(h('span', { class: 'rm-thx' }, text), h('i', { class: 'd1' }), h('i', { class: 'd2' }));
    el.classList.remove('out'); el.hidden = false;
    if (fresh) { el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); }
    else el.firstChild.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
    clearTimeout(thT);
    if (!stay) thT = setTimeout(() => { el.classList.add('out'); setTimeout(() => { if (el.classList.contains('out')) { el.hidden = true; el.classList.remove('in', 'out'); } }, 450); }, 1500);
  }
  function working(on) {
    if (on === workOn) return;
    workOn = on; clearInterval(workT);
    if (on) {
      if (stopped || document.hidden) return;
      const lines = workLines(); let k = 0;
      lastThought = Date.now();
      showThought(lines[k++], { stay: true });
      workT = setInterval(() => { if (!workOn) return clearInterval(workT); showThought(lines[k++ % lines.length], { stay: true }); }, 2600);
    } else {
      showThought(pick([L('Hab’s.', 'Got it.'), L('So, pass auf.', 'Right, listen up.'), L('Fertig. Wie immer.', 'Done. As always.')]));
    }
  }
  // Im Ruhezustand ab und zu von selbst (nicht, solange jemand tippt)
  const thIv = setInterval(() => {
    if (!api || api.state() !== 'idle' || Math.random() > .35) return;
    const inp = document.querySelector('.asst.stage .ai-in'); if (inp && inp.value) return;
    think();
  }, 15000);

  // ---------- Skills: was Max mit dir machen kann – vier große Kacheln, der Rest unter „Mehr“ ----------
  let moreOpen = false;
  const workDoc = () => focusDocs()[0] || S.list.slice().sort((a, b) => (b.used || 0) - (a.used || 0))[0] || null;
  // Werkzeug-Knopf: gibt’s das schon → öffnen; sonst kurz personalisieren und direkt erstellen.
  // Ohne Skript: hochladen oder Thema nennen – danach entsteht genau dieses Werkzeug (keine Übersicht, keine Tafel).
  const HAS = { karten: d => (d.decks || []).some(x => x.cards?.length), podcast: d => (d.podcasts || []).length > 0, zettel: d => !!d.summary };
  const tool = tab => () => { const d = workDoc(); if (!d) return import('../app.js').then(m => m.tryFeature(tab)); location.hash = `#/app/${d.id}/${tab}${HAS[tab] && !HAS[tab](d) ? '/auto' : ''}`; };
  function drawTeaser() {
    const ds = focusDocs();
    const SK = [
      ['board', L('An der Tafel erklären', 'Explain on the board'), L('Schritt für Schritt – ich zeig dir mit dem Cursor, warum', 'Step by step – I point out the why with my cursor'),
        () => ds.length ? ask(L('Erklär mir das wichtigste Thema aus meinem Skript an der Tafel – Schritt für Schritt, mit Beispiel.', 'Explain the most important topic from my slides on the board – step by step, with an example.')) : api && api.prefill(L('Erklär mir an der Tafel: ', 'Explain on the board: '))],
      ['quiz', L('Abfragen', 'Quiz me'), L('Eine Frage nach der anderen – ich sag dir, ob’s sitzt', 'One question at a time – I tell you if it sticks'),
        () => ask(L('Frag mich ab – eine Frage nach der anderen, warte jeweils auf meine Antwort und sag mir dann, ob’s sitzt.', 'Quiz me – one question at a time, wait for my answer each time and tell me if it’s right.'))],
      ['calc', L('Rechnen mit Rechenweg', 'Calculate with workings'), L('Typische Klausuraufgabe, danach eine Zwillingsaufgabe', 'A typical exam task, then a twin exercise'),
        () => ask(L('Rechne mir eine typische Klausuraufgabe Schritt für Schritt an der Tafel vor – danach gibst du mir eine Zwillingsaufgabe.', 'Walk me through a typical exam task step by step on the board – then give me a twin exercise.'))],
      ['exam', L('Probeklausur', 'Mock exam'), L('Mit Zeit, Punkten und Note', 'With time, points and a grade'), () => import('../app.js').then(m => m.examTool())]
    ];
    const MORE = [
      ['cards', L('Karteikarten', 'Flashcards'), tool('karten')],
      ['calendar', L('Lernplan', 'Study plan'), tool('plan')],
      ['pod', L('Podcast', 'Podcast'), tool('podcast')],
      ['brain', L('Lernzettel', 'Study sheet'), tool('zettel')],
      ['whistle', L('BWL-Trainer', 'Business trainer'), () => { location.hash = '#/app/trainer'; }],
      ['calc', L('Rechner', 'Calculators'), () => { location.hash = '#/app/rechner'; }],
      ['mic', L('Sprechen', 'Talk'), () => api && api.talk()]
    ];
    // Alles sofort sichtbar: vier große Kacheln, darunter eine ruhige Zeile mit dem Rest – kein Aufklappen
    const more = h('div', { class: 'rm-more2 on' }, h('span', { class: 'rm-mlab' }, L('Außerdem', 'Also')), MORE.map(([ic, t, fn]) => h('button', { class: 'chip rm-mc', type: 'button', onclick: fn }, h('span', { html: ico(ic) }), t)));
    // Ruhig: nur ein Knopf „Lernskills“ – Kacheln, Extras und die Sync-Frage erst nach dem Aufklappen
    const body = h('div', { class: 'rm-skb2' },
      h('div', { class: 'rm-sk' }, SK.map(([ic, t, s2, fn], i) => h('button', { class: 'rm-tile', type: 'button', onclick: fn, style: { '--i': String(i) } },
        h('span', { class: 'rm-ti', html: ico(ic) }), h('b', {}, t), h('small', {}, s2)))),
      more, ...[getAccount() ? syncAsk() : null].filter(Boolean));
    let isOpen = false;   // startet immer eingeklappt
    const tog = h('button', { class: 'rm-skt', type: 'button', 'aria-expanded': String(isOpen) }, h('span', { html: ico('brain') }), h('b', {}, L('Lernskills', 'Study skills')), h('span', { class: 'rm-sktc', 'aria-hidden': 'true' }, '▾'));
    const set = v => { isOpen = v; skills.classList.toggle('rm-skopen', v); tog.setAttribute('aria-expanded', String(v)); };
    tog.onclick = () => set(!isOpen);
    // Leerer Chat wie bei ChatGPT: drei antippbare Startfragen – passend zum verbundenen Skript, sonst typische Klausurthemen
    const d0 = focusDocs()[0];
    const POOL = [['Erklär mir den Kapitalwert an einem Beispiel', 'Explain net present value with an example'], ['Wie bilde ich einen Buchungssatz?', 'How do I write a journal entry?'], ['Rechne mit mir einen Break-even durch', 'Work through a break-even with me'], ['Was ist der Unterschied zwischen Aufwand und Kosten?', 'What is the difference between expenses and costs?'], ['Erklär mir die Zuschlagskalkulation', 'Explain job-order costing'], ['Wie funktioniert die Bilanz?', 'How does the balance sheet work?']];
    const day = new Date().getDate(), pick = [0, 1, 2].map(k => POOL[(day + k * 2) % POOL.length]);
    const st = d0 ? [[`Erklär mir das Wichtigste aus „${d0.name}“`, `Explain the key points of “${d0.name}”`], [`Frag mich zu „${d0.name}“ ab`, `Quiz me on “${d0.name}”`], pick[0]] : pick;
    const starters = h('div', { class: 'rm-start' }, st.map(([de, en]) => h('button', { class: 'chip rm-stc', type: 'button', onclick: () => ask(L(de, en)) }, L(de, en))));
    if (homeBeta()) {
      // Werkzeuge arbeiten NUR mit der Unterlage, die oben sichtbar verbunden ist – sonst fragt Max kurz, womit
      const cur = focusDocs()[0] || null;
      const docsAll = () => S.list.map(x => (S.doc && S.doc.id === x.id ? S.doc : x)).sort((a, b) => Math.max(b.used || 0, b.created || 0) - Math.max(a.used || 0, a.created || 0));
      const connect = id => { setFocus(id ? [id] : []); drawFocus(); drawRails(); drawTeaser(); drawSugg(); };
      const pickFor = (anchor, then) => import('./lernen.js').then(m => m.popMenu(anchor, {
        search: S.list.length > 6, rows: docsAll().map(x => ({ ic: x.kind === 'video' ? 'captions' : x.generated ? 'bulb' : 'file', t: x.name, sub: (x.pages || []).length ? L(`${x.pages.length} Seiten`, `${x.pages.length} pages`) : '', on: cur && cur.id === x.id, fn: () => { connect(x.id); then && then(x); } })),
        empty: L('Noch keine Unterlagen – lad etwas hoch.', 'No material yet – upload something.'),
        footer: close => [h('span', { class: 'uv-mfl' }, L('Woraus soll Max das bauen?', 'What should Max build it from?')), h('label', { class: 'btn sm primary', for: 'fileApp', onclick: () => setTimeout(close, 0) }, h('span', { html: ico('plus') }), L('Neu hochladen', 'Upload new'))] }));
      // Erst Einstellungen (Popup), dann bauen – gibt's das schon, öffnet es direkt
      const run2 = async tab => {
        const d = focusDocs()[0]; if (!d) return;
        const exists = HAS[tab] ? HAS[tab](d) : tab === 'pfad' ? !!d.path : tab === 'plan' ? !!d.plan : tab === 'quiz' ? (d.quizzes || []).length > 0 : false;
        if (exists) return tool(tab)();
        const C = await import('../create.js');
        const o = await C.personalise(tab, d, { fresh: true }); if (!o) return;
        if (tab === 'plan') { try { sessionStorage.setItem('tutor.planPre', JSON.stringify({ o: C.specPlan(o), at: Date.now() })); } catch (e) {} location.hash = `#/app/${d.id}/plan`; return; }
        if (tab !== 'pfad') C.setCreate(tab, d.id, o);
        location.hash = `#/app/${d.id}/${tab}/auto`;
      };
      const run = (tab, el) => { if (cur) return run2(tab); pickFor(el, () => setTimeout(() => run2(tab), 60)); };
      const board = async el => {
        if (!cur) return pickFor(el, () => setTimeout(() => board(el), 60));
        const d = focusDocs()[0]; if (!d) return;
        const C = await import('../create.js');
        const o = await C.personalise('tutor', d, { fresh: true }); if (!o) return;
        const pr = C.specPrompt(o, d.name); ask(pr.t, { show: pr.show });
      };
      // Leiste: verbunden (groß, deutlich) – oder Ablage zum Reinziehen
      const thumbOf = d => d.thumb ? h('img', { src: d.thumb, alt: '' }) : h('span', { html: ico(d.kind === 'video' ? 'captions' : d.generated ? 'bulb' : 'file') });
      const mat = cur
        ? h('div', { class: 'rm-mat on' },
          h('span', { class: 'rm-mi' }, thumbOf(cur)),
          h('span', { class: 'rm-mt' }, h('small', {}, L('Max arbeitet gerade mit', 'Max is working with')), h('b', {}, cur.name), h('small', { class: 'rm-mm' }, [(cur.pages || []).length ? L(`${cur.pages.length} Seiten`, `${cur.pages.length} pages`) : null, L('Werkzeuge unten bauen daraus', 'The tools below build from it')].filter(Boolean).join(' · '))),
          h('button', { class: 'btn sm', type: 'button', onclick: e => { e.stopPropagation(); pickFor(e.currentTarget); } }, L('Wechseln', 'Switch'), h('span', { html: ico('down') })),
          h('button', { class: 'iconbtn rm-mx', type: 'button', title: L('Trennen', 'Disconnect'), 'aria-label': L('Trennen', 'Disconnect'), html: ico('x'), onclick: () => connect(null) }))
        : h('div', { class: 'rm-mat empty' },
          h('span', { class: 'rm-mi', html: ico('upload') }),
          h('span', { class: 'rm-mt' }, h('b', {}, L('Alles, was du lernst, einfach hier reinziehen', 'Drop anything you study right here')), h('small', {}, L('Skript, Folien, Mitschrift, Altklausur, Buch, Screenshot oder Video – oder eine vorhandene Unterlage wählen.', 'Slides, notes, past exams, books, screenshots or video – or pick existing material.'))),
          h('label', { class: 'btn sm primary', for: 'fileApp' }, h('span', { html: ico('plus') }), L('Datei wählen', 'Choose file')),
          S.list.length ? h('button', { class: 'btn sm', type: 'button', onclick: e => { e.stopPropagation(); pickFor(e.currentTarget); } }, L('Vorhandene', 'Existing'), h('span', { html: ico('down') })) : null);
      const T2 = [
        ['board', L('An der Tafel erklären', 'Explain on the board'), L('Schritt für Schritt, mit Beispiel', 'Step by step, with an example'), e => board(e.currentTarget)],
        ['note', L('Lernzettel', 'Study sheet'), L('Alles auf einer Seite', 'All on one page'), 'zettel'],
        ['cards', L('Karteikarten', 'Flashcards'), L('Wiederholen, bis es sitzt', 'Review until it sticks'), 'karten'],
        ['quiz', 'Quiz', L('Klausurfragen mit Erklärung', 'Exam questions, explained'), 'quiz'],
        ['headphones', 'Podcast', L('Marie & Max zum Anhören', 'Marie & Max to listen to'), 'podcast'],
        ['path', L('Lernpfad', 'Study path'), L('Kapitel für Kapitel', 'Chapter by chapter'), 'pfad'],
        ['calendar', L('Klausurplan', 'Exam plan'), L('Tag für Tag zur Klausur', 'Day by day to the exam'), 'plan'],
        ['spark', L('Ich erklär dir ein Thema', 'Explain a topic'), L('Ohne Skript – nur das Thema', 'No slides – just the topic'), () => import('../app.js').then(m => m.topicPrompt())]];
      const grid = h('div', { class: 'rm-tl' }, T2.map(([ic, t, sub, act], i) => h('button', { class: 'rm-tlt' + (i === 0 ? ' main' : ''), type: 'button', style: { '--i': String(i) }, onclick: e => (typeof act === 'string' ? run(act, e.currentTarget) : act(e)) }, h('span', { class: 'rm-tli', html: ico(ic) }), h('b', {}, t), h('small', {}, sub))));
      skills.replaceChildren(h('div', { class: 'rm-tools2' }, h('div', { class: 'vt-row' }, vertrauenBtn('max')), mat, grid));
      drawPickers();
    } else { skills.replaceChildren(tog, body); set(isOpen); }
    askSlot.replaceChildren();
  }


  // ---------- Skripte (rechts, aufklappbar) ----------
  function skriptList(onPick) {
    const foc = new Set(getFocus());
    const docs = S.list.map(x => (S.doc && S.doc.id === x.id ? S.doc : x)).sort((a, b) => (b.used || 0) - (a.used || 0)).slice(0, 60);
    if (!docs.length) return h('div', { class: 'rm-empty' }, h('label', { class: 'rm-dropz', for: 'fileApp' }, h('span', { html: ico('upload') }), h('b', {}, L('Erstes Skript hochladen', 'Upload your first slides')), h('small', {}, L('PDF, PowerPoint, Word, Foto', 'PDF, PowerPoint, Word, photo'))),
      h('button', { class: 'btn sm ghost', type: 'button', onclick: () => import('../app.js').then(m => m.startSample()) }, L('Erst mal das Beispiel', 'Try the example first')));
    return h('div', { class: 'rm-sl' }, docs.map(d => {
      const f = M.fachOf(d.id), due = dueCards(d).length, on = foc.has(d.id);
      const row = h('div', { class: 'rm-s' + (on ? ' on' : ''), draggable: 'true', role: 'button', tabindex: '0', title: L('Antippen = Max arbeitet damit · Ziehen = in den Chat legen', 'Tap = Max works with it · Drag = drop into the chat'),
        onclick: e => { if (e.target.closest('a')) return; onPick && onPick(); toggleDoc(d); },
        onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDoc(d); } },
        ondragstart: e => { e.dataTransfer.setData('text/x-bwlmax-doc', d.id); e.dataTransfer.setData('text/plain', d.name); e.dataTransfer.effectAllowed = 'copy'; row.classList.add('drag'); room.classList.add('dragging'); },
        ondragend: () => { row.classList.remove('drag'); room.classList.remove('dragging'); drop.hidden = true; } },
        h('span', { class: 'rm-si', html: ico(d.generated ? 'bulb' : 'file') }),
        h('span', { class: 'rm-st2' }, h('b', {}, d.name), h('small', {}, [f ? f.name : '', due ? L(`${due} fällig`, `${due} due`) : '', d.sample ? L('Beispiel', 'Example') : ''].filter(Boolean).join(' · ') || L(`${d.pages.length} Seiten`, `${d.pages.length} pages`))),
        h('a', { class: 'rm-so', href: `#/app/${d.id}/hub`, title: L('Skript öffnen', 'Open slides'), html: ico('right') }),
        h('span', { class: 'rm-sc', html: ico('check') }));
      return row;
    }));
  }
  function toggleDoc(d) {
    const f = getFocus();
    if (f.includes(d.id)) { setFocus(f.filter(x => x !== d.id)); drawFocus(); drawRails(); return; }
    addDoc(d);
  }
  function addDoc(d, dropped) {
    const f = getFocus().filter(x => x !== d.id);
    if (f.length >= 4) { toast(L('Höchstens 4 Skripte gleichzeitig – nimm erst eins raus.', 'At most 4 sets of slides at once – remove one first.')); return; }
    setFocus([...f, d.id]); drawFocus(); drawRails(); drawSugg();
    react(dropped ? pick([L(`„${d.name}“ ist drin. Erklären, abfragen oder durchrechnen?`, `“${d.name}” is in. Explain, quiz or calculate?`), L(`Hab „${d.name}“. Womit fangen wir an?`, `Got “${d.name}”. Where do we start?`)]) : L(`Okay, wir arbeiten mit „${d.name}“.`, `Okay, we’re working with “${d.name}”.`));
  }
  function drawRails() {
    const n = S.list.length;
    right.replaceChildren(h('div', { class: 'rm-rh' }, h('b', {}, L('Skripte', 'Slides')), h('span', { style: { flex: 1 } }),
      h('label', { class: 'rm-add', for: 'fileApp', title: L('Neuer Stoff', 'Add material'), html: ico('plus') }),
      h('button', { class: 'rm-add', type: 'button', title: L('Einklappen', 'Collapse'), 'aria-label': L('Skripte einklappen', 'Collapse slides'), html: ico('right'), onclick: () => toggleRail(false) })),
      skriptList(), n ? h('p', { class: 'rm-hint' }, L('Antippen oder in den Chat ziehen – dann arbeitet Max genau damit.', 'Tap or drag into the chat – Max then works with exactly that.')) : null);
    // Knopf: Anzahl der Skripte, und wie viele gerade im Fokus sind
    const f = getFocus().length;
    [skBtnHome, skBtnBar].forEach(b => { b.querySelector('.rm-skn').textContent = f ? `${f}/${n}` : String(n); b.classList.toggle('has', !!f); });
  }
  // Leiste rechts auf/zu (am Handy: von unten)
  let railOpen = false;
  function toggleRail(v = !railOpen) {
    if (MOB.matches) { if (v) sheet(); return; }
    railOpen = !!v;
    room.classList.toggle('rail', railOpen);
    [skBtnHome, skBtnBar].forEach(b => b.setAttribute('aria-expanded', railOpen ? 'true' : 'false'));
    api && api.relayout(600);
  }
  function drawFocus() {
    const ds = focusDocs();
    focusRow.replaceChildren(...(ds.length
      ? [h('span', { class: 'rm-fl2' }, L('Verbunden mit', 'Linked to')), ...ds.map(d => h('span', { class: 'rm-chip' }, h('span', { html: ico(d.generated ? 'bulb' : 'file') }), h('span', { class: 'rm-cn' }, d.name), h('button', { type: 'button', 'aria-label': L('Entfernen', 'Remove'), html: ico('x'), onclick: () => { setFocus(getFocus().filter(x => x !== d.id)); drawFocus(); drawRails(); drawSugg(); } })))]
      : [h('span', { class: 'rm-fl2 soft' }, matchMedia('(max-width: 600px)').matches ? L('Ohne Skript – mit BWL-Wissen. ', 'No slides – general knowledge. ') : L('Kein Skript verbunden – ich nehm mein BWL-Wissen (und finde deine Unterlagen, wenn du danach fragst). ', 'No slides linked – I use my business knowledge (and find your material when you ask). '), h('button', { class: 'linkbtn rm-fl3', type: 'button', onclick: () => toggleRail(true) }, matchMedia('(max-width: 600px)').matches ? L('Skript verbinden', 'Link slides') : L('Mit vorhandenem Skript verbinden', 'Link existing slides')))]));
  }
  // Nur noch „Weiter, wo wir waren“ – die Skills stehen oben als Kacheln
  // Links über der Eingabe: „Verlauf“ – klappt das bisherige Gespräch auf und wieder zu
  function drawSugg() {
    if (!api || !api.hasHistory()) { sugg.replaceChildren(); return; }
    const open = mode === 'talk';
    sugg.replaceChildren(h('button', { class: 'rm-hist' + (open ? ' on' : ''), type: 'button', 'aria-expanded': String(open), onclick: () => { if (mode === 'talk') goHome(); else goTalk({ mark: false, show: true }); drawSugg(); } },
      h('span', { html: ico('clock') }), L('Verlauf', 'History'), h('span', { class: 'rm-hc', html: ico(open ? 'up' : 'down') })));
  }

  // ---------- Gespräch ----------
  const ask = (text, o) => { if (!api) return; api.ask(text, o); };
  function moveFace(slot) {
    if (faceEl.parentElement === slot) return;
    const a = faceEl.getBoundingClientRect();
    slot.appendChild(faceEl);
    const b = faceEl.getBoundingClientRect();
    if (!a.width || !b.width || reduce() || faceEl.style.visibility === 'hidden') return;
    faceEl.style.transformOrigin = '0 0';
    faceEl.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})` }, { transform: 'none' }], { duration: 640, easing: 'cubic-bezier(.2,.9,.2,1)' }).finished.finally(() => { faceEl.style.transformOrigin = ''; });
  }
  function goTalk({ mark = true, show = false } = {}) {
    if (mode === 'talk') return;
    mode = 'talk';
    if (api) { if (mark) api.markOld(); api.showOld(show); }
    oldBtn.hidden = !(api && api.hasOld()); oldBtn.classList.toggle('on', !!show);
    room.classList.remove('home'); room.classList.add('talk');
    moveFace(talkSlot);
    api && api.talk2(true);
    if (api && !mark) api.restoreBoard();
    room.classList.toggle('has-board', !!(api && api.boardShown()));
    startSession(); tick(); drawSugg();
    if (!reduce()) talk.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function goHome(line) {
    mode = 'home';
    room.classList.remove('talk', 'has-board'); room.classList.add('home');
    api && (api.talk2(false), api.showOld(false));
    moveFace(heroSlot);
    drawTeaser(); drawSugg();
    speak(line || speechText());
  }

  // ---------- Session: Uhr, Pausen, Bilanz ----------
  function tick() {
    if (stopped) return;
    if (!document.hidden) { staleCheck(); SES.seen = Date.now(); }
    const on = SES.on && mode === 'talk';
    timer.hidden = !on;
    if (on) {
      const p = MC.pauseMin();
      timer.replaceChildren(h('span', { html: ico('clock') }), h('b', {}, mmss(elapsed())), SES.nextPause ? h('small', {}, L(` · Pause in ${Math.max(1, Math.ceil((SES.nextPause - Date.now()) / 60e3))} Min.`, ` · break in ${Math.max(1, Math.ceil((SES.nextPause - Date.now()) / 60e3))} min`)) : p ? null : h('small', {}, L(' · ohne Pausen', ' · no breaks')));
      if (SES.nextPause && Date.now() >= SES.nextPause && api && api.state() === 'idle' && !room.querySelector('.rm-ov')) showPause();
    }
  }
  const iv = setInterval(tick, 1000);
  function overlay(kids) {
    room.querySelector('.rm-ov')?.remove();
    const ov = h('div', { class: 'rm-ov', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'rm-ovin' }, kids));
    stage.appendChild(ov); api && api.hold(true);
    return ov;
  }
  function closeOverlay(ov) { if (!ov.isConnected) return; ov.classList.add('out'); setTimeout(() => ov.remove(), 320); api && api.hold(false); api && api.relayout(500); }
  function showPause() {
    const c = cfg(), p = MC.pauseMin() || 25, len = (PAUSE_LEN[p] || 5) * 60e3, t0 = Date.now();
    SES.pauseAt = t0;
    const f = h('div', { class: 'rm-ovface' });
    const left = h('b', { class: 'rm-cd' }, mmss(len));
    const C = 2 * Math.PI * 54;
    const ring = h('div', { class: 'rm-cdr', html: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" class="tr"/><circle cx="60" cy="60" r="54" class="fg" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:0"/></svg>` }, left);
    const title = ({ locker: L(`Pause! ${p} Minuten durchgezogen – stark.`, `Break! ${p} minutes straight – strong.`), freundlich: L(`Super gemacht – ${p} Minuten am Stück. Zeit für eine Pause.`, `Well done – ${p} minutes in a row. Time for a break.`), sachlich: L(`${p} Minuten. Pause.`, `${p} minutes. Break.`), streng: L(`${p} Minuten. Gut. Jetzt Pause – das ist Pflicht.`, `${p} minutes. Good. Now a break – that’s mandatory.`) })[c.ton];
    const tips = h('div', { class: 'rm-tips' }, [['coffee', L('Trink was', 'Have a drink')], ['up', L('Steh auf, streck dich', 'Stand up, stretch')], ['sun', L('Fenster auf, Luft rein', 'Open a window')], ['spark', L('Augen 20 Sek. in die Ferne', 'Look far away for 20 s')]].map(([ic, t]) => h('span', {}, h('span', { html: ico(ic) }), t)));
    const skip = h('button', { class: 'btn', type: 'button' }, L('Pause überspringen', 'Skip break'));
    const ov = overlay([f, h('div', { class: 'eyebrow' }, L('Pause', 'Break')), h('h2', {}, title), h('p', {}, L('Dein Kopf sortiert gerade, was wir gemacht haben. Kurz weg vom Bildschirm – ich warte hier.', 'Your brain is sorting what we just did. Step away from the screen – I’ll wait here.')), tips, ring, h('div', { class: 'rm-ova' }, skip)]);
    ov.classList.add('pause');
    const pf = face(f, {}); pf.set('happy');
    const prevTitle = document.title; document.title = L('Pause · BWL Max', 'Break · BWL Max');
    const done = () => {
      clearInterval(cd); document.title = prevTitle;
      SES.pausedMs += Date.now() - t0;
      pf.set('happy');
      const c2 = cfg();
      ov.querySelector('.rm-ovin').replaceChildren(f, h('div', { class: 'eyebrow' }, L('Weiter geht’s', 'Back to it')),
        h('h2', {}, ({ streng: L('Pause vorbei. Zurück an die Arbeit.', 'Break’s over. Back to work.'), sachlich: L('Weiter.', 'Continue.') })[c2.ton] || L('Erholt? Dann weiter.', 'Refreshed? Let’s go on.')),
        h('p', {}, L('Zum Warmwerden zwei schnelle Fragen zu dem, was wir vor der Pause gemacht haben – so bleibt es richtig hängen.', 'To warm up: two quick questions on what we did before the break – that’s what makes it stick.')),
        h('div', { class: 'rm-ova' },
          h('button', { class: 'btn primary lg', type: 'button', onclick: () => { closeOverlay(ov); planPause(); setTimeout(() => ask(L('Wir hatten gerade Pause. Stell mir zwei kurze Wiederholungsfragen zu dem, was wir vor der Pause gemacht haben – eine nach der anderen, und warte jeweils auf meine Antwort.', 'We just had a break. Ask me two short review questions on what we did before the break – one at a time, and wait for my answer each time.')), 350); } }, L('Los, frag mich', 'Go on, quiz me')),
          h('button', { class: 'btn lg', type: 'button', onclick: () => { closeOverlay(ov); planPause(); api && api.note(L('Weiter geht’s. Wo waren wir?', 'Back to it. Where were we?')); } }, L('Einfach weiter', 'Just continue'))));
    };
    skip.addEventListener('click', done);
    const cd = setInterval(() => {
      if (!ov.isConnected) { clearInterval(cd); document.title = prevTitle; return; }
      const rest = len - (Date.now() - t0);
      left.textContent = mmss(rest);
      const fg = ring.querySelector('.fg'); if (fg) fg.style.strokeDashoffset = String(C * (1 - Math.max(0, rest) / len));
      if (rest <= 0) done();
    }, 500);
  }
  function endSession() { import('../memory.js').then(m => m.flush()).catch(() => {});
    if (!SES.on) { goHome(); return; }
    const min = Math.max(1, Math.round(elapsed() / 60e3)), c = cfg();
    const goal = M.getMe().wochenziel || 150, wk = weekMinutes(0);
    const f = h('div', { class: 'rm-ovface' });
    const big = (n, t) => h('div', { class: 'rm-big' }, h('b', {}, String(n)), h('span', {}, t));
    const head = min >= 20 ? (({ streng: L(`${min} Minuten. Ordentlich.`, `${min} minutes. Solid.`), sachlich: L(`${min} Minuten gelernt.`, `${min} minutes studied.`) })[c.ton] || L(`Stark. ${min} Minuten im Kasten.`, `Strong. ${min} minutes in the bag.`)) : L(`${min} ${min === 1 ? 'Minute' : 'Minuten'} – zählt alles.`, `${min} minute${min === 1 ? '' : 's'} – it all counts.`);
    const ov = overlay([f, h('div', { class: 'eyebrow' }, L('Deine Session', 'Your session')), h('h2', {}, head),
      h('div', { class: 'rm-bigs' }, big(min, L('Minuten', 'minutes')), big(SES.asks, SES.asks === 1 ? L('Frage', 'question') : L('Fragen', 'questions')), big(SES.boards, SES.boards === 1 ? L('Tafel', 'board') : L('Tafeln', 'boards'))),
      h('div', { class: 'rm-wkp' }, h('span', {}, L(`Diese Woche: ${M.fmtMin(wk)} von ${M.fmtMin(goal)}`, `This week: ${M.fmtMin(wk)} of ${M.fmtMin(goal)}`)), h('div', { class: 'rm-wkb' }, h('i', { style: { width: Math.min(100, Math.round(100 * wk / goal)) + '%' } }))),
      h('div', { class: 'rm-ova' },
        h('button', { class: 'btn primary lg', type: 'button', onclick: () => { SES.on = false; closeOverlay(ov); goHome(L(`Gute Session – ${min} ${min === 1 ? 'Minute' : 'Minuten'}. Bis gleich, oder?`, `Good session – ${min} minute${min === 1 ? '' : 's'}. See you soon?`)); } }, L('Fertig für jetzt', 'Done for now')),
        SES.asks ? h('button', { class: 'btn lg', type: 'button', onclick: () => { closeOverlay(ov); setTimeout(() => ask(L('Wir machen gleich Schluss. Gib mir ein kurzes Fazit der Session: Was haben wir gemacht, was sitzt, was wackelt noch – und was ist der nächste Schritt? Kurz und knackig.', 'We’re wrapping up. Give me a short recap of this session: what we did, what sticks, what’s still shaky – and the next step. Short and sharp.')), 300); } }, L('Fazit von Max', 'Recap from Max')) : null,
        h('button', { class: 'btn lg ghost', type: 'button', onclick: () => closeOverlay(ov) }, L('Weiterlernen', 'Keep going')))]);
    ov.classList.add('end');
    face(f, {}).set('happy');
  }

  // ---------- Reinziehen (Skripte und Dateien) ----------
  const inStage = e => { const r = stage.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
  const isOurs = e => [...(e.dataTransfer?.types || [])].some(t => t === 'text/x-bwlmax-doc' || t === 'Files');
  const onOver = e => { if (!isOurs(e)) return; const ok = inStage(e); drop.hidden = !ok; if (ok) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } };
  const onLeave = e => { if (!e.relatedTarget) drop.hidden = true; };
  const onDrop = e => {
    if (!isOurs(e) || !inStage(e)) { drop.hidden = true; return; }
    e.preventDefault(); drop.hidden = true; room.classList.remove('dragging');
    const id = e.dataTransfer.getData('text/x-bwlmax-doc');
    if (id) { const d = docById(id); if (d) addDoc(d, true); return; }
    const fs = [...(e.dataTransfer.files || [])]; if (fs.length) { if (homeBeta()) stageRoom(fs); else { ls.set('tutor.attach.room', 1); import('../app.js').then(m => m.startUpload(fs)); } }
  };
  document.addEventListener('dragover', onOver); document.addEventListener('dragleave', onLeave); document.addEventListener('drop', onDrop);

  // ---------- Handy: Skripte als Leiste von unten ----------
  function sheet() {
    document.querySelector('.rm-sheet')?.remove();
    const close = () => { bg.classList.add('out'); setTimeout(() => bg.remove(), 260); api && api.hold(false); };
    const bg = h('div', { class: 'rm-sheet', onclick: e => { if (e.target === bg) close(); } },
      h('div', { class: 'rm-shin' }, h('div', { class: 'rm-grab' }, h('i')), h('div', { class: 'rm-rh' }, h('b', {}, L('Skripte', 'Slides')), h('button', { class: 'iconbtn', type: 'button', html: ico('x'), 'aria-label': L('Schließen', 'Close'), onclick: close })),
        skriptList(close), h('label', { class: 'btn sm', for: 'fileApp', onclick: close }, h('span', { html: ico('plus') }), L('Neuer Stoff', 'Add material'))));
    document.body.appendChild(bg); api && api.hold(true);
  }

  // ---------- Max zieht ein ----------
  let staged = false;
  function stageNow() {
    if (!api || staged) return;
    staged = true;
    api.stage({
      slots: { composer: comp, chat: chatSlot, board: boardSlot },
      doc: () => focusDocs()[0] || null,
      context, material,
      onAsk: q => {
        lastQ = q || ''; if (mode !== 'talk') goTalk(); startSession(); SES.asks++;
        // Themen-Einstieg: die erste Frage ist die Tafel selbst – sobald man selbst schreibt, wird links das Gespräch
        if (toolsEl && room.classList.contains('rm-tools-mode') && ++toolsAsks > 1 && getAccount()) { room.classList.remove('rm-tools-mode'); document.body.classList.remove('bm-tools-mode'); toolsEl.remove(); placeDock(); }
      },
      onAnswer: p => { if (p && p.boards) SES.boards += p.boards.length; },
      // Tafel von außen geöffnet (z. B. aus der Bibliothek): erst in den Gesprächsmodus, sonst bleibt sie unsichtbar
      onBoard: v => { if (v && mode !== 'talk') goTalk(); room.classList.toggle('has-board', !!v && mode === 'talk'); },
      onState: s => {
        working(s === 'think');
        fc.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
        faceEl.classList.toggle('listening', s === 'listen'); faceEl.classList.toggle('talking', s === 'speak'); room.classList.toggle('mm-active', s !== 'idle');
        status.textContent = ({ listen: L('hört zu …', 'listening …'), think: L('überlegt …', 'thinking …'), speak: L('redet …', 'talking …') })[s] || (document.documentElement.dataset.creatorLabel || focusDocs()[0]?.name || L('dein Tutor', 'your tutor'));
      },
      onIsl: hh => { if (hh > 20) room.style.setProperty('--islh', Math.round(hh) + 'px'); },
    });
    if (mode === 'talk') api.talk2(true);
  }
  // Zur Startseite (Landing) und zurück: Max zieht aus und wieder ein
  const onHash = () => {
    if (!api || stopped) return;
    const here = location.hash.startsWith('#/app/tutor');
    if (!location.hash.startsWith('#/app') && staged) { staged = false; api.unstage(); }
    else if (here && !staged) stageNow();
  };
  addEventListener('hashchange', onHash);
  asstP.then(a => {
    if (stopped || !a) return;
    api = a;
    stageNow();
    status.textContent = document.documentElement.dataset.creatorLabel || focusDocs()[0]?.name || L('dein Tutor', 'your tutor');
    // Woher kommen wir? Unten rechts „Im Tutor weitermachen“, eine Frage aus Quiz/Trainer – oder ganz normal
    const cont = ls.get('tutor.room.continue', 0); if (cont) ls.set('tutor.room.continue', 0);
    const pending = ls.get('tutor.pendingAsk', null); if (pending) ls.set('tutor.pendingAsk', null);
    if (SES.on || cont) goTalk({ mark: false });
    if (pending) { goTalk(); setTimeout(() => (typeof pending === 'object' ? ask(pending.t, pending) : ask(pending)), ctx.arrive ? 900 : 350); }
    drawSugg();
    if (!MOB.matches) setTimeout(() => { if (!document.querySelector('.ngreet')) api.focusInput(); }, 700);
  });

  // ---------- Erstes Bild ----------
  drawRails(); drawFocus(); drawTeaser(); drawSugg();
  // Kommt man über ein Thema (Anzeige, Lernseite …) rein: keine Begrüßung („Zieh mir dein Skript rein …“), Max legt sofort los
  const pend0 = ls.get('tutor.pendingAsk', null);
  if (!SES.on) speak(pend0 && typeof pend0 === 'object' && pend0.wait ? pend0.wait : speechText());
  if (ctx.arrive) requestAnimationFrame(() => requestAnimationFrame(async () => {
    if (stopped) return;
    const flew = await fly(ctx.arrive, () => faceEl.getBoundingClientRect(), { dur: 900 });
    headApi.show(flew);
  }));
  else if (!document.querySelector('.ngreet') && !reduce()) faceEl.animate([{ opacity: 0, transform: 'scale(.6) translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,1.3,.4,1)' });

  // Hochgeladen (Ziehen, Einfügen, „+“): im Tutor bleiben, Datei zeigen und wählen lassen, was Max daraus macht
  function stageRoom(fs) {
    import('./lernen.js').then(m => { const p = m.stagedPanel(fs, { chat: true, onClose: () => { askSlot.replaceChildren(); room.classList.remove('rm-staging'); } }); if (!p) return; if (mode !== 'home') goHome(); room.classList.add('rm-staging'); askSlot.replaceChildren(p); p.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  }
  if (homeBeta()) window.__bmStage = fs => { if (!room.isConnected) return false; stageRoom(fs); return true; };
  const off1 = M.onMe(() => { drawRails(); if (mode === 'home') { drawTeaser(); drawSugg(); } drawFocus(); });
  const off2 = onChange(() => { drawRails(); drawFocus(); drawPickers(); });
  const off3 = onAccount(() => { if (mode === 'home') speak(speechText()); });
  const onCfg = () => { if (SES.on) planPause(); tick(); };
  addEventListener('maxcfg:change', onCfg);
  const onMq = () => { drawFocus(); api && api.relayout(400); };
  MOB.addEventListener?.('change', onMq);

  return () => {
    stopped = true; document.body.classList.remove('bm-tools-mode'); if (window.__bmStage) window.__bmStage = null; clearInterval(iv); clearInterval(thIv); clearInterval(workT); clearTimeout(thT); removeEventListener('hashchange', onHash);
    off1(); off2(); off3(); offStk(); clearInterval(stkIv); removeEventListener('maxcfg:change', onCfg); MOB.removeEventListener?.('change', onMq);
    document.removeEventListener('dragover', onOver); document.removeEventListener('dragleave', onLeave); document.removeEventListener('drop', onDrop);
    document.querySelector('.rm-sheet')?.remove();
    setRoomHead(null);
    if (api && staged) api.unstage();
  };
}

