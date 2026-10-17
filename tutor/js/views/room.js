// Tutor-Raum – die Startseite. Max groß in der Mitte, links deine Fächer, rechts deine Skripte, unten das Eingabefeld.
// Erst begrüßt er dich und sagt, was jetzt dran ist (Fortschritt diese Woche, was offen ist, sein Tipp).
// Sobald ihr loslegt, rutscht er nach oben, das Gespräch und die Tafel übernehmen die Bühne. Mit Pausen und Session-Bilanz.
import { h, ico, ls, toast } from '../util.js';
import { L, LOCALE } from '../i18n.js';
import { face } from '../face.js';
import { S, mastery, onChange } from '../state.js';
import { getAccount, onAccount } from '../api.js';
import { getNick, gruss, nextSpruch } from '../nick.js';
import { getSpice } from '../max.js';
import { dueCards } from './cards.js';
import { planSummary } from './plan.js';
import { forChat, fullText, topPages } from '../retrieve.js';
import * as M from '../me.js';
import * as MC from '../maxcfg.js';
import { recommend, exams, weekMinutes, syncAsk, startChecklist } from './me.js';
import { fly, land, setRoomHead } from '../flight.js';

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
const setFocus = ids => ls.set('tutor.room.focus', [...new Set(ids)].filter(id => docById(id)).slice(0, 4));

export function render(root, ctx = {}) {
  staleCheck();
  const asstP = import('../assistant.js').then(m => m.mountAssistant());
  let api = null, mode = 'home', fc = null, stopped = false;
  const cfg = () => MC.getCfg();

  // ---------- Gerüst ----------
  const faceEl = h('div', { class: 'rm-face' });
  const heroSlot = h('div', { class: 'rm-fs big' });
  const barSlot = h('div', { class: 'rm-fs small' });
  const say = h('p', { class: 'rm-say', 'aria-live': 'polite' });
  const cfgBtn = () => h('button', { class: 'rm-cfg', type: 'button', onclick: () => MC.openMaxCfg(), title: L('Wie Max mit dir redet, unterrichtet und wann Pause ist', 'How Max talks, teaches and when to take a break') }, h('span', { html: ico('tune') }), h('span', {}, L('Max einstellen', 'Set up Max')));
  const teaser = h('div', { class: 'rm-teaser' });
  const askSlot = h('div', { class: 'rm-ask' });
  const hero = h('div', { class: 'rm-hero' }, heroSlot,
    h('div', { class: 'rm-name' }, h('b', {}, 'Max'), h('span', {}, L('dein Tutor', 'your tutor')), cfgBtn()),
    h('div', { class: 'rm-bubble' }, say), teaser, askSlot);
  const scroll = h('div', { class: 'rm-scroll' }, hero);
  const status = h('small', { class: 'rm-st' });
  const timer = h('span', { class: 'rm-timer', hidden: true });
  const oldBtn = h('button', { class: 'iconbtn rm-old', type: 'button', title: L('Früheres Gespräch zeigen', 'Show earlier conversation'), html: ico('clock'), hidden: true, onclick: () => { const on = !oldBtn.classList.contains('on'); oldBtn.classList.toggle('on', on); api && api.showOld(on); } });
  const mobFach = h('button', { class: 'rm-pill', type: 'button', onclick: () => sheet('faecher') }, h('span', { html: ico('brain') }), L('Fächer', 'Subjects'));
  const mobSkript = h('button', { class: 'rm-pill', type: 'button', onclick: () => sheet('skripte') }, h('span', { html: ico('file') }), h('span', { class: 'rm-pl' }, L('Skripte', 'Slides')));
  const bar = h('div', { class: 'rm-bar' }, barSlot,
    h('div', { class: 'rm-bt' }, h('b', {}, 'Max'), status),
    timer, h('span', { style: { flex: 1 } }), oldBtn,
    h('button', { class: 'iconbtn', type: 'button', title: L('Max einstellen', 'Set up Max'), html: ico('tune'), onclick: () => MC.openMaxCfg() }),
    h('button', { class: 'btn sm rm-end-b', type: 'button', onclick: () => endSession() }, L('Session beenden', 'End session')));
  const chatSlot = h('div', { class: 'rm-chat' });
  const boardSlot = h('div', { class: 'rm-board' });
  const talk = h('div', { class: 'rm-talk' }, chatSlot, boardSlot);
  const focusRow = h('div', { class: 'rm-focus' });
  const sugg = h('div', { class: 'rm-sugg' });
  const comp = h('div', { class: 'rm-comp' });
  const dock = h('div', { class: 'rm-dock' }, focusRow, sugg, comp);
  const mob = h('div', { class: 'rm-mob' }, mobFach, mobSkript);
  const drop = h('div', { class: 'rm-drop', hidden: true }, h('div', {}, h('span', { html: ico('file') }), h('b', {}, L('Loslassen – dann arbeiten wir damit.', 'Drop it – and we’ll work with it.'))));
  const stage = h('section', { class: 'rm-stage' }, mob, bar, scroll, talk, dock, drop);
  const left = h('aside', { class: 'rm-left', 'aria-label': L('Fächer', 'Subjects') });
  const right = h('aside', { class: 'rm-right', 'aria-label': L('Skripte', 'Slides') });
  const room = h('div', { class: 'room home' }, left, stage, right);
  root.appendChild(room);
  heroSlot.appendChild(faceEl);
  fc = face(faceEl, {});

  // Der große Kopf ist Max' Zuhause, solange der Raum offen ist (Begrüßung und Seitenwechsel fliegen hierher)
  const bubbleEl = () => say.parentElement;
  const headApi = { el: faceEl, hide: () => { faceEl.style.visibility = 'hidden'; if (document.querySelector('.ngreet') && bubbleEl()) bubbleEl().style.opacity = '0'; }, show: flew => { faceEl.style.visibility = ''; if (bubbleEl() && bubbleEl().style.opacity === '0') { bubbleEl().style.opacity = ''; if (!reduce()) bubbleEl().animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' }); } let g = 0; try { g = +sessionStorage.getItem('tutor.justGreeted') || 0; } catch (e) {} if (mode === 'home' && Date.now() - g < 20000) setTimeout(() => speak(speechText()), 120); if (flew) land(faceEl); else if (!reduce()) faceEl.animate([{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,1.3,.4,1)' }); } };
  setRoomHead(headApi);
  if (document.querySelector('.ngreet') || ctx.arrive) headApi.hide();

  // ---------- Daten ----------
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
    const ds = focusDocs(); if (!ds.length) return null;
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
    const out = [justGreeted ? lets : `${gruss()}${nick ? ', ' + nick : ''}.`];
    // Lage in einem Satz
    const ex = nextExam(), due = S.list.reduce((x, d) => x + dueCards(d).length, 0);
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

  // ---------- Teaser: diese Woche · offen · Max' Tipp ----------
  function drawTeaser() {
    const goal = M.getMe().wochenziel || 150, wk = weekMinutes(0), pct = Math.min(1, wk / goal);
    const st = M.streak(M.activityDays(S.list));
    const C = 2 * Math.PI * 22;
    const ring = h('div', { class: 'rm-ring', html: `<svg viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="22" class="tr"/><circle cx="27" cy="27" r="22" class="fg" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - pct)).toFixed(1)}"/></svg><b>${Math.round(pct * 100)}%</b>` });
    const fmtH = m => m < 60 ? L(`${m} Min.`, `${m} min`) : (Math.round(m / 6) / 10).toLocaleString(LOCALE) + L(' Std.', ' h');
    const week = h('a', { class: 'rm-tc rm-week', href: '#/app/fortschritt' }, h('div', { class: 'eyebrow' }, L('Diese Woche', 'This week')),
      h('div', { class: 'rm-wk' }, ring, h('div', {}, h('b', {}, fmtH(wk), h('span', {}, ' / ' + fmtH(goal))), h('small', {}, st ? L(`${st} ${st === 1 ? 'Tag' : 'Tage'} Serie`, `${st}-day streak`) : L('Heute die Serie starten', 'Start your streak today')))));
    // Offen
    const open = [];
    const byDue = S.list.map(d => ({ d, n: dueCards(d).length })).filter(x => x.n).sort((a, b) => b.n - a.n);
    if (byDue.length) open.push({ ic: 'cards', t: L(`${byDue.reduce((a, x) => a + x.n, 0)} Karten fällig`, `${byDue.reduce((a, x) => a + x.n, 0)} cards due`), href: `#/app/${byDue[0].d.id}/karten` });
    for (const e of exams().filter(e => e.days <= 60).slice(0, 2)) open.push({ ic: 'calendar', t: L(`${e.name}: ${M.artName(e.art)} in ${tage(e.days)}`, `${e.name}: ${M.artName(e.art).toLowerCase()} in ${tage(e.days)}`), href: e.doc ? `#/app/${e.doc.id}/plan` : '#/app/faecher' });
    for (const d of S.list) { const p = d.plan ? planSummary(d) : null; if (p && p.daysLeft >= 0 && p.todayOpen?.length) { open.push({ ic: 'exam', t: L(`Plan heute: ${p.todayOpen.length} ${p.todayOpen.length === 1 ? 'Aufgabe' : 'Aufgaben'}`, `Plan today: ${p.todayOpen.length} ${p.todayOpen.length === 1 ? 'task' : 'tasks'}`), href: `#/app/${d.id}/plan` }); break; } }
    const mis = S.list.filter(d => d.mistakes?.length).sort((a, b) => b.mistakes.length - a.mistakes.length)[0];
    if (mis) open.push({ ic: 'quiz', t: L(`${mis.mistakes.length} Fehler zum Ausbügeln`, `${mis.mistakes.length} mistakes to fix`), href: `#/app/${mis.id}/quiz` });
    const openC = h('div', { class: 'rm-tc rm-open' }, h('div', { class: 'eyebrow' }, L('Noch offen', 'Still open')),
      open.length ? h('div', { class: 'rm-ol' }, open.slice(0, 3).map(o => h('a', { class: 'rm-oi', href: o.href }, h('span', { html: ico(o.ic) }), h('span', {}, o.t), h('span', { class: 'rm-oa', html: ico('right') }))))
        : h('p', { class: 'rm-none' }, L('Nichts offen. Stark.', 'Nothing open. Strong.')));
    // Max' Tipp
    const rec = recommend()[0];
    let tipC = null;
    if (rec) {
      const m = String(rec.href || '').match(/^#\/app\/([^/]+)\/(\w+)/), d = m && docById(m[1]);
      tipC = h('div', { class: 'rm-tc rm-tip' }, h('div', { class: 'eyebrow' }, L('Mein Tipp für jetzt', 'My tip for now')),
        h('b', { class: 'rm-tt' }, rec.t), h('small', {}, rec.s),
        h('div', { class: 'rm-ta' },
          d ? h('button', { class: 'btn sm primary', type: 'button', onclick: () => withMax(d, m[2], rec) }, L('Mit mir angehen', 'Do it with me')) : null,
          h('a', { class: 'btn sm' + (d ? ' ghost' : ' primary'), href: rec.href, onclick: rec.onclick || null }, d ? L('Öffnen', 'Open') : L('Los geht’s', 'Let’s go'), h('span', { html: ico('right') }))));
    }
    teaser.replaceChildren(week, openC, tipC);
    // Einmalige Fragen (Synchronisierung, erste Schritte) – nur solange sie offen sind
    askSlot.replaceChildren(...[getAccount() ? syncAsk() : null, startChecklist()].filter(Boolean).slice(0, 1));
  }
  function withMax(d, kind, rec) {
    setFocus([d.id]); drawFocus(); drawRails();
    const n = d.name;
    const P = {
      karten: L(`Frag mich die wichtigsten Themen aus „${n}“ ab – eine Frage nach der anderen, warte jeweils auf meine Antwort.`, `Quiz me on the key topics of “${n}” – one question at a time, wait for my answer each time.`),
      plan: L(`Was steht heute im Klausurplan für „${n}“? Lass uns das zusammen durchgehen.`, `What’s on today’s exam plan for “${n}”? Let’s go through it together.`),
      quiz: L(`Lass uns meine Fehler aus „${n}“ durchgehen – erklär kurz, dann frag mich nochmal ab.`, `Let’s go through my mistakes from “${n}” – explain briefly, then quiz me again.`),
      pfad: L(`Weiter im Lernpfad von „${n}“: Erklär mir das nächste Kapitel an der Tafel.`, `Next in the study path of “${n}”: explain the next chapter on the board.`)
    };
    ask(P[kind] || L(`Bring meine Prüfungsreife in „${n}“ hoch: Frag mich zuerst ab, wo ich stehe, dann erklär mir, was fehlt.`, `Raise my exam readiness in “${n}”: first quiz me to see where I stand, then explain what’s missing.`));
  }

  // ---------- Fächer (links) & Skripte (rechts) ----------
  function fachList(onPick) {
    const me = M.getMe(), foc = new Set(getFocus());
    if (!me.faecher.length) return h('div', { class: 'rm-empty' }, h('p', {}, L('Noch keine Fächer. Leg sie an – oder schick mir ein Foto von deinem Stundenplan.', 'No subjects yet. Add them – or send me a photo of your timetable.')), h('a', { class: 'btn sm', href: '#/app/faecher' }, L('Fächer anlegen', 'Add subjects')));
    const list = me.faecher.slice().sort((a, b) => (a.klausur || '9999') < (b.klausur || '9999') ? -1 : 1);
    return h('div', { class: 'rm-fl' }, list.map(f => {
      const ds = (f.docs || []).map(docById).filter(Boolean);
      const m = ds.length ? Math.round(ds.reduce((x, d) => x + mastery(d), 0) / ds.length) : 0;
      const n = f.klausur ? Math.round((new Date(f.klausur + 'T12:00') - new Date(M.dayKey() + 'T12:00')) / 864e5) : null;
      const on = ds.length && ds.every(d => foc.has(d.id));
      return h('button', { class: 'rm-f' + (on ? ' on' : ''), type: 'button', onclick: () => { onPick && onPick(); pickFach(f, ds, on); } },
        h('span', { class: 'rm-fk' }, (f.kurz || f.name).slice(0, 4)),
        h('span', { class: 'rm-ft' }, h('b', {}, f.name), h('small', {}, n != null && n >= 0 ? (n === 0 ? L(`${M.artName(f.klausurArt)} heute`, `${M.artName(f.klausurArt)} today`) : L(`${M.artName(f.klausurArt)} in ${n} T.`, `${M.artName(f.klausurArt)} in ${n} d`)) : ds.length ? L(`${ds.length} ${ds.length === 1 ? 'Skript' : 'Skripte'}`, `${ds.length} set${ds.length === 1 ? '' : 's'}`) : L('noch kein Skript', 'no slides yet')),
          h('span', { class: 'rm-fb' }, h('i', { style: { width: m + '%' } }))));
    }));
  }
  function pickFach(f, ds, on) {
    if (!ds.length) { toast(L(`In „${f.name}“ liegt noch kein Skript. Lad eins hoch – ich sortier es ein.`, `No slides in “${f.name}” yet. Upload some – I’ll file them.`), 4200); return; }
    if (on) { setFocus(getFocus().filter(id => !ds.some(d => d.id === id))); drawFocus(); drawRails(); return; }
    setFocus(ds.map(d => d.id)); drawFocus(); drawRails();
    const n = f.klausur ? Math.round((new Date(f.klausur + 'T12:00') - new Date(M.dayKey() + 'T12:00')) / 864e5) : null;
    react(n != null && n >= 0 ? L(`${f.name}. ${M.artName(f.klausurArt)} in ${tage(n)} – womit fangen wir an?`, `${f.name}. ${M.artName(f.klausurArt)} in ${tage(n)} – where do we start?`) : L(`${f.name}, alles klar. Erklären, abfragen oder rechnen?`, `${f.name}, got it. Explain, quiz or calculate?`));
    drawSugg();
  }
  function todayBox() {
    const now = Date.now(), ses = M.sessionsOn(new Date()).filter(s => s.e > now);
    return h('div', { class: 'rm-today' }, h('div', { class: 'rm-rh' }, h('b', {}, L('Heute', 'Today')), h('a', { class: 'rm-more', href: '#/app/stundenplan' }, L('Woche', 'Week'))),
      ses.length ? ses.slice(0, 4).map(s => h('div', { class: 'rm-ses' + (s.s <= now ? ' live' : '') }, h('b', {}, hm(s.s)), h('span', {}, s.t))) : h('p', { class: 'rm-none' }, M.getMe().kurse.length || M.getMe().ics.events?.length ? L('Keine Vorlesung mehr heute.', 'No more lectures today.') : L('Stundenplan noch nicht drin.', 'No timetable yet.')));
  }
  function skriptList(onPick) {
    const foc = new Set(getFocus());
    const docs = S.list.slice().sort((a, b) => (b.used || 0) - (a.used || 0)).slice(0, 60);
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
    left.replaceChildren(h('div', { class: 'rm-rh' }, h('b', {}, L('Fächer', 'Subjects')), h('a', { class: 'rm-more', href: '#/app/faecher' }, L('Verwalten', 'Manage'))), fachList(), todayBox());
    const n = S.list.length;
    right.replaceChildren(h('div', { class: 'rm-rh' }, h('b', {}, L('Skripte', 'Slides')), h('label', { class: 'rm-add', for: 'fileApp', title: L('Neuer Stoff', 'Add material'), html: ico('plus') })),
      skriptList(), n ? h('p', { class: 'rm-hint' }, L('Antippen oder in den Chat ziehen – dann arbeitet Max genau damit.', 'Tap or drag into the chat – Max then works with exactly that.')) : null);
    const fc2 = getFocus().length; mobSkript.querySelector('.rm-pl').textContent = fc2 ? L(`Skripte · ${fc2}`, `Slides · ${fc2}`) : L('Skripte', 'Slides');
  }
  function drawFocus() {
    const ds = focusDocs();
    focusRow.replaceChildren(...(ds.length
      ? [h('span', { class: 'rm-fl2' }, L('Wir arbeiten mit', 'Working with')), ...ds.map(d => h('span', { class: 'rm-chip' }, h('span', { html: ico(d.generated ? 'bulb' : 'file') }), h('span', { class: 'rm-cn' }, d.name), h('button', { type: 'button', 'aria-label': L('Entfernen', 'Remove'), html: ico('x'), onclick: () => { setFocus(getFocus().filter(x => x !== d.id)); drawFocus(); drawRails(); drawSugg(); } })))]
      : [h('span', { class: 'rm-fl2 soft' }, MOB.matches ? L('Ohne Skript – ich nehm mein BWL-Wissen. Tipp oben auf „Skripte“.', 'No slides – I’ll use my business knowledge. Tap “Slides” above.') : L('Ohne Skript – ich nehm mein BWL-Wissen. Wähl rechts ein Skript oder zieh es hier rein.', 'No slides – I’ll use my business knowledge. Pick slides on the right or drag them in here.'))]));
  }
  // Schnellstarts (nur im Begrüßungs-Zustand)
  function drawSugg() {
    if (mode !== 'home') { sugg.replaceChildren(); return; }
    const ds = focusDocs(), ex = nextExam();
    const chips = [];
    if (api && api.hasHistory()) { const q = api.lastQuestion(); if (q) chips.push([L('Weiter: ', 'Continue: ') + (q.length > 34 ? q.slice(0, 33) + '…' : q), () => goTalk({ mark: false, show: true }), 'refresh']); }
    chips.push([ds.length ? L('Erklär mir das Wichtigste', 'Explain the key topic') : L('Erklär mir …', 'Explain …'), () => ds.length ? ask(L('Erklär mir das wichtigste Thema aus meinem Skript an der Tafel – mit Beispiel.', 'Explain the most important topic from my slides on the whiteboard – with an example.')) : api && api.prefill(L('Erklär mir ', 'Explain ')), 'board']);
    chips.push([L('Frag mich ab', 'Quiz me'), () => ask(L('Frag mich ab – eine Frage nach der anderen, warte jeweils auf meine Antwort und sag mir dann, ob’s sitzt.', 'Quiz me – one question at a time, wait for my answer each time and tell me if it’s right.')), 'quiz']);
    chips.push([L('Rechne mir was vor', 'Walk me through a calculation'), () => ask(L('Rechne mir eine typische Klausuraufgabe Schritt für Schritt an der Tafel vor – danach gibst du mir eine Zwillingsaufgabe.', 'Walk me through a typical exam task step by step on the whiteboard – then give me a twin exercise.')), 'calc']);
    if (ex && ex.days <= 45) chips.push([L(`Lernplan bis ${ex.name}`, `Plan until ${ex.name}`), () => ask(L(`Meine ${M.artName(ex.art)} in ${ex.name} ist in ${tage(ex.days)}. Mach mir einen realistischen Plan bis dahin – was wann, und womit fangen wir heute an?`, `My ${ex.name} ${M.artName(ex.art).toLowerCase()} is in ${tage(ex.days)}. Make me a realistic plan until then – what when, and what do we start with today?`)), 'calendar']);
    sugg.replaceChildren(...chips.map(([t, fn, ic]) => h('button', { class: 'chip rm-q', type: 'button', onclick: fn }, h('span', { html: ico(ic) }), t)));
  }

  // ---------- Gespräch ----------
  const ask = text => { if (!api) return; api.ask(text); };
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
    moveFace(barSlot);
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
  function endSession() {
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
    const fs = [...(e.dataTransfer.files || [])]; if (fs.length) import('../app.js').then(m => m.startUpload(fs));
  };
  document.addEventListener('dragover', onOver); document.addEventListener('dragleave', onLeave); document.addEventListener('drop', onDrop);

  // ---------- Handy: Fächer / Skripte als Leiste von unten ----------
  function sheet(kind) {
    document.querySelector('.rm-sheet')?.remove();
    const close = () => { bg.classList.add('out'); setTimeout(() => bg.remove(), 260); api && api.hold(false); };
    const body = kind === 'faecher' ? [fachList(close), todayBox(), h('a', { class: 'btn sm', href: '#/app/faecher', onclick: close }, L('Fächer verwalten', 'Manage subjects'))]
      : [skriptList(close), h('label', { class: 'btn sm', for: 'fileApp', onclick: close }, h('span', { html: ico('plus') }), L('Neuer Stoff', 'Add material'))];
    const bg = h('div', { class: 'rm-sheet', onclick: e => { if (e.target === bg) close(); } },
      h('div', { class: 'rm-shin' }, h('div', { class: 'rm-grab' }, h('i')), h('div', { class: 'rm-rh' }, h('b', {}, kind === 'faecher' ? L('Fächer', 'Subjects') : L('Skripte', 'Slides')), h('button', { class: 'iconbtn', type: 'button', html: ico('x'), 'aria-label': L('Schließen', 'Close'), onclick: close })), ...body));
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
      onAsk: () => { if (mode !== 'talk') goTalk(); startSession(); SES.asks++; },
      onAnswer: p => { if (p && p.boards) SES.boards += p.boards.length; },
      onBoard: v => { room.classList.toggle('has-board', !!v && mode === 'talk'); },
      onState: s => {
        fc.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
        faceEl.classList.toggle('listening', s === 'listen');
        status.textContent = ({ listen: L('hört zu …', 'listening …'), think: L('überlegt …', 'thinking …'), speak: L('redet …', 'talking …') })[s] || (focusDocs()[0]?.name || L('dein Tutor', 'your tutor'));
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
    status.textContent = focusDocs()[0]?.name || L('dein Tutor', 'your tutor');
    // Woher kommen wir? Unten rechts „Im Tutor weitermachen“, eine Frage aus Quiz/Trainer – oder ganz normal
    const cont = ls.get('tutor.room.continue', 0); if (cont) ls.set('tutor.room.continue', 0);
    const pending = ls.get('tutor.pendingAsk', null); if (pending) ls.set('tutor.pendingAsk', null);
    if (SES.on || cont) goTalk({ mark: false });
    if (pending) { goTalk(); setTimeout(() => ask(pending), ctx.arrive ? 900 : 350); }
    drawSugg();
    if (!MOB.matches) setTimeout(() => { if (!document.querySelector('.ngreet')) api.focusInput(); }, 700);
  });

  // ---------- Erstes Bild ----------
  drawRails(); drawFocus(); drawTeaser(); drawSugg();
  if (!SES.on) speak(speechText());
  if (ctx.arrive) requestAnimationFrame(() => requestAnimationFrame(async () => {
    if (stopped) return;
    const flew = await fly(ctx.arrive, faceEl.getBoundingClientRect(), { dur: 820 });
    headApi.show(flew);
  }));
  else if (!document.querySelector('.ngreet') && !reduce()) faceEl.animate([{ opacity: 0, transform: 'scale(.6) translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,1.3,.4,1)' });

  const off1 = M.onMe(() => { drawRails(); if (mode === 'home') { drawTeaser(); drawSugg(); } drawFocus(); });
  const off2 = onChange(() => { drawRails(); drawFocus(); });
  const off3 = onAccount(() => { if (mode === 'home') speak(speechText()); });
  const onCfg = () => { if (SES.on) planPause(); tick(); };
  addEventListener('maxcfg:change', onCfg);
  const onMq = () => { drawFocus(); api && api.relayout(400); };
  MOB.addEventListener?.('change', onMq);

  return () => {
    stopped = true; clearInterval(iv); removeEventListener('hashchange', onHash);
    off1(); off2(); off3(); removeEventListener('maxcfg:change', onCfg); MOB.removeEventListener?.('change', onMq);
    document.removeEventListener('dragover', onOver); document.removeEventListener('dragleave', onLeave); document.removeEventListener('drop', onDrop);
    document.querySelector('.rm-sheet')?.remove();
    setRoomHead(null);
    if (api && staged) api.unstage();
  };
}
