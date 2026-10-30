// Gemeinsame UI-Bausteine: Ladeanzeige mit Gesicht, Fehler/Limit-Dialog
import { h, ico, modal, toast, ls } from './util.js';
import { face } from './face.js';
import { COST, currentQuota, getAccount } from './api.js';
import { say, thinkLines } from './max.js';
import { L } from './i18n.js';
import { richText } from './sanitize.js';

// Google-Anzeigen-Landung (?thema=, gclid …): dort denkt Max nie laut – keine Gedankenblasen
export const adsLanding = () => /[?&](thema|gclid|gbraid|wbraid)=|[?&]utm_source=google/.test(location.search);
// Gedankenblase neben Max' Kopf (die drei Denk-Punkte führen hinein)
export function thought(faceEl, kind = 'generic', fallback = []) {
  const bub = h('div', { class: 'thought', 'aria-live': 'polite' });
  const wrap = h('div', { class: 'thinkwrap' });
  faceEl.replaceWith(wrap); wrap.append(faceEl, bub);
  const lines = thinkLines(kind, fallback);
  let i = 0;
  if (adsLanding()) bub.style.display = 'none';
  const show = () => {
    if (!bub.isConnected) return clearInterval(iv);
    bub.textContent = lines[i++ % lines.length];
    bub.animate([{ opacity: 0, transform: 'scale(.85) translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  };
  show();
  const iv = setInterval(show, 3200);
  return { el: bub, stop() { clearInterval(iv); } };
}

// Ladeanzeige: Gesicht + Gedankenblase + Fortschrittsbalken mit Countdown + Abbrechen.
// Die Dauer lernt sie mit (Mittelwert der letzten Male pro Art), damit der Countdown stimmt.
const EST = { ex: 30, quiz: 28, exam: 45, path: 35, lesson: 26, podcast: 50, cards: 22, summary: 34, topic: 22, ingest: 15, generic: 25 };
// ---------- Läuft im Hintergrund (oben rechts) ----------
// Wer während des Erstellens woanders hinklickt, sieht oben rechts: „Karteikarten werden erstellt · 42 %“ – antippen führt zurück.
// Fertig: der Knopf wird grün („Karteikarten fertig · Ansehen“).
const JOB = { cards: ['Karteikarten', 'Flashcards'], quiz: ['Quiz', 'Quiz'], ex: ['Übung', 'Exercise'], exam: ['Probeklausur', 'Mock exam'], path: ['Lernpfad', 'Study path'], lesson: ['Lektion', 'Lesson'], podcast: ['Podcast', 'Podcast'], summary: ['Lernzettel', 'Study sheet'] };
let jobBox = null;
function jobsEl() {
  if (jobBox && jobBox.isConnected) return jobBox;
  jobBox = h('div', { class: 'bgjobs', 'aria-live': 'polite' }); document.body.appendChild(jobBox); return jobBox;
}
function goBack(hash) {
  const t = hash.replace(/^#\/?/, '').split('/'), target = '#/' + (t[0] === 'app' ? t.slice(0, 3) : t).join('/');
  if (location.hash === target) dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = target;
}
// Zurück genau auf die Erstellung: die Seite, auf der es entsteht, wird wieder eingesetzt – läuft es noch, sieht man den Ladebalken,
// ist es fertig, ist man direkt in den Karten/im Quiz/im Lernzettel (kein Umweg über eine Übersicht)
function restorePage(hash, pageEl) {
  const view = document.getElementById('view');
  if (!pageEl || !view) return goBack(hash);
  if (pageEl.isConnected) { pageEl.scrollIntoView({ block: 'start' }); return; }
  const t = hash.replace(/^#\/?/, '').split('/'), target = '#/' + (t[0] === 'app' ? t.slice(0, 3) : t).join('/');
  const put = () => { if (view.childNodes.length !== 1 || view.firstChild !== pageEl) { view.replaceChildren(pageEl); view.scrollTop = 0; } };
  if (location.hash !== target) location.hash = target;
  put(); let n = 0; const iv = setInterval(() => { put(); if (++n > 12) clearInterval(iv); }, 120);   // nach dem Neuaufbau der Ansicht nochmal einsetzen
}
function bgJob(kind, back) {
  const nm = JOB[kind] ? L(JOB[kind][0], JOB[kind][1]) : L('Max', 'Max');
  const pct = h('b', { class: 'bj-p' }, '0 %');
  const txt = h('span', { class: 'bj-t' }, nm, ' ', kind === 'cards' ? L('werden erstellt', 'in progress') : L('wird erstellt', 'in progress'));
  const x = h('button', { class: 'bj-x', type: 'button', 'aria-label': L('Ausblenden', 'Hide'), html: ico('x'), onclick: e => { e.stopPropagation(); gone = true; el.remove(); } });
  const el = h('div', { class: 'bj run', role: 'button', tabindex: 0, title: L('Zurück dorthin', 'Go back there'), onclick: () => { if (typeof back === 'function') back(); else goBack(back); if (el.classList.contains('ok')) el.remove(); } },
    h('span', { class: 'bj-i' }, h('i', { class: 'bj-spin' })), txt, pct, x);
  el.addEventListener('keydown', e => { if (e.key === 'Enter') el.click(); });
  let shown = false, gone = false;
  return {
    show() { if (gone || (shown && el.isConnected)) return; shown = true; jobsEl().appendChild(el); },
    hide() { if (shown && el.classList.contains('run')) { el.remove(); shown = false; } },
    set(p) { pct.textContent = Math.round(p * 100) + ' %'; },
    done(ok) {
      if (!shown) return;
      if (!ok) { el.remove(); return; }
      el.classList.remove('run'); el.classList.add('ok');
      el.querySelector('.bj-i').innerHTML = ico('check');
      txt.replaceChildren(nm, ' ', L('fertig', 'ready')); pct.textContent = L('Ansehen', 'View');
    },
  };
}

// Für Erstellungen ohne Ladeanzeige (z. B. Quiz/Übung live auf der Tafel): el = Bereich, in dem es entsteht
export function watchJob(kind, el, { back = location.hash, est } = {}) {
  const e = Math.max(6, Math.min(120, +ls.get('tutor.est.' + kind, est || EST[kind] || EST.generic) || 25));
  const job = bgJob(kind, back), t0 = Date.now(); let done = false;
  const iv = setInterval(() => {
    if (done) return clearInterval(iv);
    const s = (Date.now() - t0) / 1000, p = s < e ? (s / e) * .94 : .94 + .055 * (1 - Math.exp(-(s - e) / 12));
    if (!el.isConnected || !el.getClientRects().length) { job.show(); job.set(p); } else job.hide();
  }, 250);
  return { stop(ok = true) { if (done) return; done = true; clearInterval(iv); job.done(ok); const s = (Date.now() - t0) / 1000; if (ok && s > 2) ls.set('tutor.est.' + kind, Math.round(e * .6 + s * .4)); } };
}
export function loading(root, title, lines = [], kind = 'generic') {
  const ctrl = new AbortController();
  let rejectCancel;
  const cancelled = new Promise((_, rej) => { rejectCancel = rej; }); cancelled.catch(() => {});
  const key = 'tutor.est.' + kind;
  const est = Math.max(6, Math.min(120, +ls.get(key, EST[kind] || EST.generic) || 25));
  const f = h('div', { class: 'face' });
  const fill = h('i');
  const num = h('span', { class: 'ld-n' });
  const cancel = h('button', { class: 'btn sm ghost ld-x', type: 'button' }, L('Abbrechen', 'Cancel'));
  const el = h('div', { class: 'loading' }, f, h('b', {}, title),
    h('div', { class: 'ld-bar', role: 'progressbar', 'aria-label': L('Fortschritt', 'Progress') }, fill),
    h('div', { class: 'ld-meta' }, num, cancel));
  root.replaceChildren(el);
  const fc = face(f); fc.set('think');
  const tb = thought(f, kind, lines);
  const t0 = Date.now(); let done = false;
  const startHash = location.hash, vw = document.getElementById('view');
  let pageEl = root; while (pageEl && pageEl.parentElement && pageEl.parentElement !== vw) pageEl = pageEl.parentElement;
  if (!pageEl || pageEl.parentElement !== vw) pageEl = null;
  const job = bgJob(kind, () => restorePage(startHash, pageEl));
  const tick = () => {
    if (done) return clearInterval(iv);
    const s = (Date.now() - t0) / 1000;
    const p = s < est ? (s / est) * .94 : .94 + .055 * (1 - Math.exp(-(s - est) / 12));
    // woanders hingeklickt (Seite weg oder nur versteckt, z. B. anderer Reiter): läuft oben rechts weiter
    if (!el.isConnected || !el.getClientRects().length) { job.show(); job.set(p); return; }
    job.hide();
    fill.style.width = (p * 100).toFixed(1) + '%';
    const left = Math.ceil(est - s);
    num.textContent = left > 0 ? L(`noch ca. ${left} s`, `about ${left} s left`) : L('gleich fertig …', 'almost done …');
  };
  cancel.addEventListener('click', () => {
    if (done) return;
    ctrl.abort();
    const e = new Error('abgebrochen'); e.name = 'AbortError'; rejectCancel(e);
    toast(L('Abgebrochen.', 'Cancelled.'));
  });
  tick();
  const iv = setInterval(tick, 200);
  return {
    el, face: fc, signal: ctrl.signal, cancelled,
    // für Aufgaben ohne eigenes Abbrechen (z. B. Lernpfad im Hintergrund): Warten beenden
    race: p => Promise.race([p, cancelled]),
    stop(ok = true) {
      if (done) return; done = true;
      job.done(ok && !ctrl.signal.aborted);
      clearInterval(iv); tb.stop();
      const s = (Date.now() - t0) / 1000;
      if (!ctrl.signal.aborted && s > 2) ls.set(key, Math.round(est * .6 + s * .4));
      fill.style.width = '100%';
    },
  };
}

// Ohne Konto: freundlich zum kostenlosen Konto schicken – danach geht's genau da weiter
export async function accountGate({ title, text, retry } = {}) {
  const pts = h('ul', { class: 'gate-pts' },
    h('li', {}, h('span', { html: ico('check') }), L('Kostenlos – keine Kreditkarte, kein Abo', 'Free – no credit card, no subscription')),
    h('li', {}, h('span', { html: ico('check') }), L('Alles, was du schon gemacht hast, bleibt erhalten', 'Everything you’ve done so far stays')),
    h('li', {}, h('span', { html: ico('check') }), L('Nur E-Mail bestätigen – Code kommt evtl. im Spam an', 'Just confirm your email – the code may land in spam')),
    h('li', { class: 'm-laptop' }, LAPTOP_LINE()));
  const r = await modal({ title: title || L('Weiter geht’s mit kostenlosem Konto', 'Keep going with a free account'), text: text || L('Ohne Konto kannst du alles einmal ausprobieren. Für mehr brauchst du nur ein kostenloses Konto.', 'Without an account you can try everything once. For more, all you need is a free account.'), body: pts,
    actions: [{ label: L('Ich hab schon eins', 'I already have one'), value: 'login' }, { label: L('Konto erstellen', 'Create account'), value: 'reg', primary: true }] });
  if (!r) return false;
  const { openLogin } = await import('./account.js');
  const ok = await openLogin({ mode: r === 'reg' ? 'register' : 'login' });
  if (ok && retry) retry();
  return !!ok;
}

export async function apiError(e, retry) {
  if (e && e.name === 'AbortError') return;
  if (e && e.code === 'need_account') return accountGate({ text: e.message, retry });
  // Kontingent aufgebraucht: mit Konto (ohne Abo) kommt das Inner-Circle-Blatt mit allen Vorteilen
  if (e && (e.code === 'cap' || e.code === 'limit')) {
    const acc = getAccount();
    if (acc && !acc.pro) { const { innerCircle } = await import('./ic.js'); await innerCircle({ reason: e.code === 'cap' ? (e.message || '') : L('Für heute sind deine Antworten aufgebraucht.', 'You’ve used up today’s answers.') }); return; }
  }
  if (e && e.code === 'cap') {
    const acc = getAccount();
    const upsell = acc && !acc.pro && (await import('./abo.js')).aboReady();
    const r = await modal({ title: L('Für heute ist Schluss damit', 'That’s it for today'), text: e.message, actions: upsell ? [{ label: L('Morgen weiter', 'Tomorrow'), value: false }, { label: L('Inner Circle 7 Tage gratis', 'Inner Circle: 7 days free'), value: 'abo', primary: true, cls: 'ic-btn' }] : acc ? [{ label: L('Alles klar', 'Got it'), value: false, primary: true }] : [{ label: L('Später', 'Later'), value: false }, { label: L('Kostenloses Konto', 'Free account'), value: true, primary: true }] });
    if (r === 'abo') return (await import('./abo.js')).openAbo();
    if (r) { const { openLogin } = await import('./account.js'); if (await openLogin({ title: L('Mehr mit kostenlosem Konto', 'More with a free account') }) && retry) retry(); }
    return;
  }
  if (e && e.code === 'limit') {
    const acc = getAccount();
    const r = await modal({
      title: L('Ich mach Feierabend', 'I’m clocking off'),
      text: say('limit') + (acc ? (acc.pro ? L(' Selbst im Inner Circle ist heute Schluss – morgen geht’s weiter.', ' Even in the Inner Circle, that’s it for today – we’ll carry on tomorrow.') : L(' Ab 0:00 Uhr gibt’s neue Einheiten. Der Inner Circle ohne Limit kommt bald.', ' New credits arrive at midnight. The Inner Circle without limits is coming soon.')) : L(' Ab 0:00 Uhr gibt’s neue Einheiten – oder du holst dir ein kostenloses Konto, dann hast du jeden Tag 40 Einheiten.', ' New credits arrive at midnight – or get a free account for 40 credits every day.')),
      actions: acc && !acc.pro && (await import('./abo.js')).aboReady() ? [{ label: L('Morgen weiter', 'Tomorrow'), value: false }, { label: L('Inner Circle 7 Tage gratis', 'Inner Circle: 7 days free'), value: 'abo', primary: true, cls: 'ic-btn' }] : acc ? [{ label: L('Alles klar', 'Got it'), value: false, primary: true }] : [{ label: L('Später', 'Later'), value: false }, { label: L('Kostenloses Konto', 'Free account'), value: true, primary: true }]
    });
    if (r === 'abo') return (await import('./abo.js')).openAbo();
    if (r) { const { openLogin } = await import('./account.js'); if (await openLogin({ title: L('Weiterlernen mit kostenlosem Konto', 'Keep learning with a free account') }) && retry) retry(); }
    return;
  }
  const r = await modal({ title: L('Das hat nicht geklappt', 'That didn’t work'), text: (e && e.message) || L('Unbekannter Fehler.', 'Unknown error.'), actions: retry ? [{ label: L('Schließen', 'Close'), value: false }, { label: L('Nochmal versuchen', 'Try again'), value: true, primary: true }] : [{ label: 'OK', value: false, primary: true }] });
  // Nochmal: nach dem Schließen des Fensters starten (sonst geht der Klick im Schließen unter) – Fehler beim Neustart sichtbar machen
  if (r && retry) setTimeout(() => { try { const p = retry(); if (p && p.catch) p.catch(err => apiError(err, retry)); } catch (err) { apiError(err, retry); } }, 60);
}

// Knopf mit Kostenangabe
export function costBtn(label, action, onclick, cls = 'btn primary') {
  const c = COST[action] || 0;
  return h('button', { class: cls, onclick }, label, c ? h('span', { class: 'k', title: L('KI-Einheiten', 'AI credits') }, c) : null);
}

export function hasQuota(action) {
  const q = currentQuota();
  if (!q) return true;
  return (q.limit - q.used) >= (COST[action] || 0);
}

export function errorBox(msg, retry) {
  return h('div', { class: 'empty' }, h('h2', { style: { fontSize: '22px' } }, L('Das hat nicht geklappt', 'That didn’t work')), h('p', {}, msg), retry ? h('button', { class: 'btn primary', onclick: retry }, L('Nochmal versuchen', 'Try again')) : null);
}

// Zusatz-Einstellungen: am Handy hinter „Anpassen“, am Laptop immer offen
export function moreOpts(...kids) {
  const d = h('details', { class: 'more-opts' },
    h('summary', {}, h('span', { html: ico('tune') }), L('Anpassen', 'Customise'), h('span', { class: 'mo-chev', html: ico('right') })),
    h('div', { class: 'mo-body' }, ...kids));
  if (!matchMedia('(max-width: 760px)').matches) d.open = true;
  return d;
}

// Antwort tippt sich Wort für Wort auf (mit Cursor)
// Formeln bleiben ein Stück (sonst stünde halber LaTeX-Code kurz sichtbar da)
const tokens = t => String(t || '').split(/(\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\s+)/).filter(Boolean);
export async function typeOut(el, text, { scroll = () => {}, alive = () => true } = {}) {
  const parts = tokens(text);
  const words = parts.filter(p => p.trim()).length;
  const step = words > 260 ? 3 : words > 120 ? 2 : 1;
  const delay = words > 260 ? 22 : 28;
  let out = '', n = 0;
  el.classList.add('typing-on');
  for (let k = 0; k < parts.length; k++) {
    out += parts[k];
    if (!parts[k].trim()) continue;
    if (++n % step && k < parts.length - 1) continue;
    el.replaceChildren(richText(out));
    scroll();
    await new Promise(r => setTimeout(r, delay));
    if (!el.isConnected || !alive()) break;
  }
  el.classList.remove('typing-on');
  el.replaceChildren(richText(text));
  scroll();
}

// Platzhalter tippt Beispiele durch (pausiert, solange man im Feld ist)
export function typePlaceholder(inp, base, examples, pre = '') {
  inp.placeholder = base;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !examples?.length) return;
  let k = Math.floor(Math.random() * examples.length);
  const busy = () => !!inp.value || !!inp.dataset.phLock;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async () => {
    await wait(2200);
    while (inp.isConnected) {
      if (busy()) { inp.placeholder = inp.dataset.phLock || base; await wait(800); continue; }
      const t = pre + examples[k++ % examples.length];
      for (let i = pre.length; i <= t.length; i++) { if (busy() || !inp.isConnected) break; inp.placeholder = t.slice(0, i); await wait(42); }
      await wait(2000);
      if (!busy()) inp.placeholder = base; else if (inp.dataset.phLock) inp.placeholder = inp.dataset.phLock;
      await wait(2600);
    }
  })();
}

// Text erscheint im Takt der Stimme (läuft mit der Wiedergabe, Stopp zeigt sofort alles)
export function syncOut(el, text, audio, { scroll = () => {}, spoken = 640 } = {}) {
  const parts = tokens(text), total = String(text || '').length, span = Math.min(total, spoken);
  let shown = -1;
  el.classList.add('typing-on');
  return new Promise(res => {
    const done = () => { el.classList.remove('typing-on'); el.replaceChildren(richText(text)); scroll(); res(); };
    const tick = () => {
      if (!el.isConnected) return res();
      const d = audio.duration;
      const over = audio.ended || audio.error || (audio.paused && audio.currentTime > 0);
      if (over) return done();
      const frac = isFinite(d) && d > 0 ? audio.currentTime / d : 0;
      const target = Math.ceil(Math.min(1, frac * 1.04) * span);
      let acc = 0, out = '';
      for (const p of parts) { if (acc >= target && p.trim()) break; out += p; acc += p.length; }
      if (out.length !== shown) { shown = out.length; el.replaceChildren(richText(out || '…')); scroll(); }
      if (frac >= 1) return done();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// Frisch erstellte Inhalte erscheinen einmal mit Auftritt (gestaffelt, Mindmap zeichnet sich)
export function freshen(el) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [...el.children].forEach((c, i) => { c.classList.add('fx'); c.style.setProperty('--fx', i); });
}

// ---------- Gast-Modus: was nur mit (kostenlosem) Konto geht ----------
// Handy (nicht Tablet): schmal oder Querformat mit wenig Höhe
export const isPhone = () => matchMedia('(max-width: 600px), (pointer: coarse) and (max-height: 500px)').matches;
// Am Handy nie mehr als ein Overlay gleichzeitig: Cookie-Banner, Dialoge, Hinweise, „Klick mich“, Tipp
export function overlayBusy() {
  const c = document.documentElement.classList;
  if (c.contains('bmc-open') || c.contains('m-pill') || c.contains('m-tip')) return true;
  return [...document.querySelectorAll('.modal-bg, .ngreet, .hn, .sidemenu, .acc-pop, .app.sideopen, .pal[open], body > .voice')].some(e => e.getClientRects().length);
}
// Handy: Zeile unter Konto-Aufrufen (nur am Handy sichtbar, CSS .m-laptop)
export const LAPTOP_LINE = () => L('Erstell dein Konto jetzt – am Laptop meldest du dich einfach an und lernst weiter.', 'Create your account now – on your laptop just sign in and keep learning.');
export const isGuest = () => !getAccount();
export const GUEST_CARDS = 10, GUEST_QUIZ = 3;
const PREV = {
  podcast: () => h('div', { class: 'lp-pod' }, h('div', { class: 'lp-cover' }, h('b', {}, L('Folge 1', 'Episode 1')), h('i')), h('div', { class: 'lp-wave' }, [...Array(42)].map((_, i) => h('i', { style: { height: (18 + Math.abs(Math.sin(i * 1.7)) * 70) + '%' } })))),
  zettel: () => h('div', { class: 'lp-lines' }, [92, 78, 85, 60, 88, 72, 40, 81, 66].map(w => h('i', { style: { width: w + '%' } }))),
  pfad: () => h('div', { class: 'lp-path' }, [1, 2, 3, 4, 5].map(n => h('div', {}, h('b', {}, String(n)), h('i', { style: { width: (50 + (n * 37) % 40) + '%' } })))),
  exam: () => h('div', { class: 'lp-lines' }, [70, 95, 88, 0, 64, 90, 82, 0, 58, 86].map(w => w ? h('i', { style: { width: w + '%' } }) : h('br'))),
};
export function lockedPreview(wrap, { kind = 'zettel', title, text, onUnlock, back } = {}) {
  const f = h('div', { class: 'face' });
  wrap.replaceChildren(h('div', { class: 'lockprev' },
    h('div', { class: 'lp-blur', 'aria-hidden': 'true' }, (PREV[kind] || PREV.zettel)()),
    h('div', { class: 'lp-over' }, f,
      h('h2', {}, title || L('Mit kostenlosem Konto freischalten', 'Unlock with a free account')),
      h('p', {}, text || L('Ohne Konto kannst du Max einmal ausprobieren. Das hier gibt’s mit kostenlosem Konto – dauert 30 Sekunden, alles bleibt erhalten.', 'Without an account you can try Max once. This comes with a free account – takes 30 seconds, everything stays.')),
      h('div', { class: 'lp-b' },
        h('button', { class: 'btn primary lg', type: 'button', onclick: async () => { const { openLogin } = await import('./account.js'); if (await openLogin({ mode: 'register' }) && onUnlock) onUnlock(); } }, L('Kostenlos freischalten', 'Unlock for free')),
        h('button', { class: 'btn lg', type: 'button', onclick: async () => { const { openLogin } = await import('./account.js'); if (await openLogin() && onUnlock) onUnlock(); } }, L('Anmelden', 'Sign in'))),
      h('small', {}, L('Kostenlos · keine Kreditkarte · Code kommt evtl. im Spam an', 'Free · no credit card · code may land in spam')),
      h('p', { class: 'm-laptop' }, LAPTOP_LINE()),
      back ? h('button', { class: 'btn sm ghost', type: 'button', onclick: back, style: { marginTop: '6px' } }, h('span', { html: ico('left') }), L('Zurück', 'Back')) : null)));
  face(f);
}
// Mitten im Lernen: Rest gesperrt (Karten, Quiz) – was schon da ist, bleibt erhalten
export function lockedRest(stage, { left, what, onUnlock, title, text }) {
  const f = h('div', { class: 'face', style: { width: '64px', height: '64px' } });
  stage.replaceChildren(h('div', { class: 'lockrest' }, f,
    h('h3', {}, title || L(`Noch ${left} ${what} warten auf dich`, `${left} more ${what} are waiting`)),
    h('p', {}, text || L('Sind schon fertig – mit kostenlosem Konto geht’s direkt hier weiter. Dein Fortschritt bleibt erhalten.', 'They’re ready – with a free account you continue right here. Your progress stays.')),
    h('div', { class: 'lp-b' },
      h('button', { class: 'btn primary', type: 'button', onclick: async () => { const { openLogin } = await import('./account.js'); if (await openLogin({ mode: 'register' }) && onUnlock) onUnlock(); } }, L('Kostenlos weitermachen', 'Continue for free')),
      h('button', { class: 'btn', type: 'button', onclick: async () => { const { openLogin } = await import('./account.js'); if (await openLogin() && onUnlock) onUnlock(); } }, L('Anmelden', 'Sign in'))),
    h('p', { class: 'm-laptop' }, LAPTOP_LINE())));
  face(f).set?.('happy');
}

// KI-Kennzeichnung: welches Modell geantwortet hat (dezent unter der Antwort)
export function modelName(id) {
  const m = /claude-([a-z]+)-(\d+)-(\d+)/.exec(String(id || ''));
  return m ? `Claude ${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}.${m[3]}` : '';
}
const TOOLNAME = { rechne: 'Rechner', kapitalwert: 'Kapitalwert', interner_zinsfuss: 'Interner Zinsfuß', annuitaet: 'Annuität', finanzmathe: 'Zinsrechnung', abschreibung: 'Abschreibung', break_even: 'Break-even', deckungsbeitrag: 'Deckungsbeitrag', zuschlagskalkulation: 'Zuschlagskalkulation', einkommensteuer: 'Einkommensteuer (§ 32a EStG)', statistik: 'Statistik' };
// Herkunft: src = 'doc' (Skript mitgeschickt) / 'max' (Max' eigenes Kurzskript) / '' (ohne Skript). Seiten kommen aus den (S. x)-Belegen.
export function aiTag(tools, raw = '', src = '', rp = null) {
  const t = Array.isArray(tools) ? tools.filter(x => TOOLNAME[x]) : [];
  // Rechen-Algorithmus: geprüfte Rechnungen dieser Antwort (Klick → Erklärung)
  const rk = rp && rp.rechnungen > 0 ? h('button', { class: 'aiok vt-tag' + (rp.offen ? ' warn' : ''), type: 'button', title: L('Was heißt das?', 'What does this mean?'), onclick: e => { e.stopPropagation(); import('./vertrauen.js').then(m => m.openVertrauen('max', L('Zurück zu Max', 'Back to Max'))); } }, rp.offen ? L('Nicht alles bestätigt', 'Not everything verified') : (rp.rechnungen === 1 ? L('Rechnung geprüft', 'Calculation verified') : L(`${rp.rechnungen} Rechnungen geprüft`, `${rp.rechnungen} calculations verified`))) : null;
  const ok = rk ? rk : t.length ? h('span', { class: 'aiok', title: L('Die Zahlen hat ein festes Rechenprogramm ausgerechnet, nicht die KI: ', 'The numbers were computed by a fixed calculator, not by the AI: ') + t.map(x => TOOLNAME[x]).join(', ') }, '✓ ' + L('Zahlen exakt nachgerechnet', 'Numbers verified by calculator')) : null;
  let from = null;
  if (src) {
    const pages = [...new Set([...String(raw).matchAll(/\((?:S|p|pp)\. ?(\d+)(?:[–-](\d+))?\)/g)].map(m => +m[1]))].sort((a, b) => a - b).slice(0, 5);
    from = src === 'video' ? h('span', { class: 'aisrc', title: L('Die Antwort stützt sich auf das Transkript dieses Videos.', 'Based on this video’s transcript.') }, L('Aus dem Video', 'From the video'))
      : pages.length
      ? h('span', { class: 'aisrc', title: L('Die Aussagen sind mit diesen Seiten belegt – zum Nachlesen.', 'Backed by these pages – check them yourself.') }, (src === 'max' ? L('Aus dem Kurzskript', 'From the short script') : L('Aus deinem Skript', 'From your slides')) + ' · ' + L('S. ', 'p. ') + pages.join(', '))
      : h('span', { class: 'aisrc gen', title: L('Dazu steht nichts Passendes im Skript – Max erklärt aus allgemeinem Fachwissen.', 'Nothing matching in the slides – Max explains from general knowledge.') }, L('Allgemeinwissen, nicht aus dem Skript', 'General knowledge, not from the slides'));
  }
  // Faktencheck (Register): offene Treffer gut sichtbar mit richtiger Aussage und Quelle
  const fk = rp && Array.isArray(rp.fakten) && rp.fakten.length ? h('button', { class: 'aiok vt-tag warn', type: 'button', title: L('Faktencheck: diese Aussage weicht von der geprüften Quelle ab', 'Fact check: this statement differs from the verified source'),
    onclick: e => { e.stopPropagation(); import('./util.js').then(u => u.modal({ title: L('Faktencheck', 'Fact check'), body: h('div', { class: 'fk-list', html: rp.fakten.map(x => '<p><b>' + L('Richtig ist', 'Correct') + ':</b> ' + String(x.richtig).replace(/</g, '&lt;') + '<br><small>' + L('Quelle', 'Source') + ': ' + (/^https?:/.test(x.quelle) ? '<a href="' + x.quelle + '" target="_blank" rel="noopener">' + x.quelle + '</a>' : String(x.quelle).replace(/</g, '&lt;')) + '</small></p>').join('') }) })).catch(() => {}); } }, '⚠ ' + L('Faktencheck: bitte prüfen', 'Fact check: please verify'))
    : rp && rp.faktenKorrigiert ? h('span', { class: 'aiok', title: L('Eine fachliche Aussage wurde anhand geprüfter Quellen korrigiert.', 'A statement was corrected using verified sources.') }, '✓ ' + L('Faktencheck: korrigiert', 'Fact check: corrected')) : null;
  const lead = [from, ok, fk].filter(Boolean);
  return h('div', { class: 'aitag', title: L('Max ist eine KI (Sprachmodell von Anthropic). Antworten können Fehler enthalten – prüf Wichtiges mit deinem Skript.', 'Max is an AI (language model by Anthropic). Answers can contain mistakes – check important things against your slides.') },
    ...lead.flatMap(x => [x, h('span', { class: 'ai-sep' }, '·')]), lead.length ? null : h('span', { class: 'ai-dot' }), h('span', { class: 'aikI' }, L('KI von Anthropic · kann Fehler machen', 'AI by Anthropic · can make mistakes')));
}

// Gegenprüf-Siegel OBEN an jeder Max-Antwort: was geprüft wurde und gegen welche Quelle.
// Zustände: läuft (KI-Abgleich mit der Faktendatenbank) → ✓ gegengeprüft | ⚠ Abweichung (mit richtiger Aussage + Quelle, gut sichtbar).
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const qLink = q => q && q.url ? `<a href="${esc(q.url)}" target="_blank" rel="noopener">${esc(q.name || q.url)}</a>` : esc((q && q.name) || q || '');
export function siegelDetails(rp, src, pages) {
  const z = [];
  if (pages && pages.length) z.push(`<p><b>${L('Aus deinem Material', 'From your material')}</b> · ${L('Seite', 'page')} ${pages.join(', ')}</p>`);
  if (rp && rp.rechnungen > 0) z.push(`<p><b>✓ ${L('Rechnungen nachgerechnet', 'Calculations re-checked')}:</b> ${rp.rechnungen}${rp.korrigiert ? ' · ' + L('korrigiert', 'corrected') + ': ' + rp.korrigiert : ''}${rp.offen ? ' · <b class="w">' + L('nicht bestätigt', 'not verified') + ': ' + rp.offen + '</b>' : ''}</p>`);
  const fk = rp && Array.isArray(rp.fakten) ? rp.fakten : [];
  fk.forEach(x => z.push(`<p class="w"><b>⚠ ${L('Richtig ist', 'Correct')}:</b> ${esc(x.richtig)}<br><small>${L('Quelle', 'Source')}: ${/^https?:/.test(x.quelle) ? `<a href="${esc(x.quelle)}" target="_blank" rel="noopener">${esc(x.quelle)}</a>` : esc(x.quelle)}</small></p>`));
  if (rp && !fk.length) z.push(`<p><b>✓ ${L('Faktenregeln (Gesetzesstand, bekannte Fehlaussagen)', 'Fact rules (legal status, known false statements)')}:</b> ${L('ohne Befund', 'no findings')}</p>`);
  if (rp && !(rp.belege && rp.belege.length)) z.push(`<p><small>${L('Zu diesem Thema gibt es in unserer Faktendatenbank noch keine belegten Aussagen – geprüft wurden Rechnungen und Faktenregeln.', 'Our fact database has no sourced statements on this topic yet – calculations and fact rules were checked.')}</small></p>`);
  const db = rp && rp.db; const wd = db ? db.widersprueche : [];
  wd.forEach(w => z.push(`<p class="w"><b>⚠ ${L('Abweichung', 'Mismatch')}:</b> „${esc(w.zitat)}“<br><b>${L('Richtig ist', 'Correct')}:</b> ${esc(w.richtig)}<br><small>${L('Quelle', 'Source')}: ${qLink(w.quelle)}</small></p>`));
  if (rp && rp.belege && rp.belege.length) {
    z.push(`<p><b>${db && db.ok ? '✓ ' + L('Abgeglichen mit geprüften Aussagen', 'Matched against verified statements') : db && db.ok === false ? L('Abgeglichen mit geprüften Aussagen', 'Matched against verified statements') : L('Geprüfte Aussagen zum Thema', 'Verified statements on this topic')}:</b></p><ul>` +
      rp.belege.map(b => `<li>${esc(b.aussage)} <small>– ${qLink(b.quelle)}</small></li>`).join('') + '</ul>');
  }
  z.push(`<p><small>${L('Max ist eine KI und kann Fehler machen. Geprüft wird automatisch: jede Rechnung, bekannte Fehlaussagen und – wo das Thema in unserer Faktendatenbank steht – der Abgleich mit Gesetzen, Gabler, Destatis, EZB und weiteren festen Quellen.', 'Max is an AI and can make mistakes. Checked automatically: every calculation, known false statements and – where the topic is in our fact database – a match against laws, Gabler, Destatis, the ECB and other fixed sources.')} <a href="#" data-vt="1">${L('So prüfen wir', 'How we check')}</a> · <a href="mailto:kontakt@bwlmax.de?subject=${encodeURIComponent(L('Fehler in einer Antwort von Max', 'Mistake in an answer from Max'))}">${L('Fehler melden', 'Report a mistake')}</a></small></p>`);
  return z.join('');
}
export function siegel(rp, raw = '', src = '') {
  const pages = src ? [...new Set([...String(raw).matchAll(/\((?:S|p|pp)\. ?(\d+)(?:[–-](\d+))?\)/g)].map(m => +m[1]))].sort((a, b) => a - b).slice(0, 5) : [];
  const bl = rp && rp.belege || []; const fk = rp && rp.fakten && rp.fakten.length;
  if (!rp && !pages.length) return null;
  const nurRegeln = !pages.length && !bl.length && !(rp && rp.rechnungen > 0) && !fk && !(rp && rp.faktenKorrigiert);
  if (nurRegeln && String(raw).replace(/<[^>]+>|```[\s\S]*?```/g, '').length < 250) return null;   // kurze Rückfragen/Smalltalk: kein Siegel
  const qk = (() => { const s = []; bl.forEach(b => { const n = b.quelle && b.quelle.name && String(b.quelle.name).replace(/\s*Wirtschaftslexikon/i, '').replace(/^Lehrbuchstandard.*$/i, ''); if (n && !s.includes(n)) s.push(n); }); return s.slice(0, 1).join('') + (s.length > 1 ? ` +${s.length - 1}` : ''); })();
  const el = h('button', { class: 'vt-siegel', type: 'button' });
  const open = e => { e.stopPropagation(); import('./util.js').then(u => { const m = u.modal({ title: L('Gegengeprüft', 'Cross-checked'), body: h('div', { class: 'fk-list', html: siegelDetails(rp, src, pages) }) }); setTimeout(() => document.querySelectorAll('.fk-list [data-vt]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); try { m && m.close && m.close(); } catch (x) {} import('./vertrauen.js').then(v => v.openVertrauen('max', L('Zurück zu Max', 'Back to Max'))); })), 50); }).catch(() => {}); };
  el.onclick = open;
  const set = () => {
    const db = rp && rp.db; const wd = db && db.widersprueche && db.widersprueche.length;
    const bad = fk || wd || (rp && rp.offen);
    el.className = 'vt-siegel' + (bad ? ' warn' : '') + (rp && rp.dbcheck && !db ? ' run' : '');
    const quelle = pages.length ? L('aus deinem Material, S. ', 'from your material, p. ') + pages.join(', ') + (qk ? ' · ' + qk : '') : qk;
    const txt = bad
      ? '⚠ ' + (wd ? L('Abweichung von der Quelle gefunden – antippen für die richtige Aussage', 'Differs from the source – tap for the correct statement') : fk ? L('Faktencheck: bitte prüfen – antippen für die richtige Aussage', 'Fact check: please verify – tap for the correct statement') : L('Nicht alle Rechnungen bestätigt – bitte nachrechnen', 'Not all calculations verified – please double-check'))
      : rp && rp.dbcheck && !db ? L('Wird gegengeprüft …', 'Cross-checking …') + (quelle ? ' · ' + quelle : '')
      : '✓ ' + (bl.length && db && db.ok ? L('Gegengeprüft', 'Cross-checked') : rp && rp.rechnungen > 0 && !bl.length ? (rp.rechnungen === 1 ? L('Rechnung nachgerechnet', 'Calculation re-checked') : L(`${rp.rechnungen} Rechnungen nachgerechnet`, `${rp.rechnungen} calculations re-checked`)) : nurRegeln ? L('Geprüft · keine bekannte Fehlaussage gefunden', 'Checked · no known false statement found') : L('Geprüft', 'Checked')) + (quelle ? ' · ' + L('Quelle: ', 'Source: ') + quelle : '');
    el.replaceChildren(h('span', {}, txt));
    if (wd && !el._auf) { el._auf = 1; const box = h('div', { class: 'vt-siegel-box', html: siegelDetails({ db, belege: [] }, '', []).replace(/<p><small>[\s\S]*$/, '') }); const put = (n = 0) => el.parentNode ? el.after(box) : n < 40 && setTimeout(() => put(n + 1), 50); put(); }
  };
  set();
  if (rp && rp.dbcheck && !rp.db) rp.dbcheck.then(set, set);
  return el;
}

// Siegel auch für gespeicherte Inhalte (Lernzettel, Karteikarten, Quiz/Probeklausur, Lektionen):
// merkePruefung speichert den Prüfstand am Objekt; der laufende KI-Abgleich wird nachgetragen und gespeichert.
const LIVE = new WeakMap();
export function merkePruefung(obj, rp) {
  if (!obj || !rp) return;
  const { rechnungen, korrigiert, offen, fakten, faktenKorrigiert, belege, db } = rp;
  obj.pruef = { rechnungen, korrigiert, offen, fakten, faktenKorrigiert, belege, db };
  if (rp.dbcheck) LIVE.set(obj, rp.dbcheck);
}
export function siegelGespeichert(obj, onSave, src = 'doc') {
  const st = obj && obj.pruef; if (!st) return null;
  const rp = { ...st }; const live = LIVE.get(obj);
  if (live && !st.db) Object.defineProperty(rp, 'dbcheck', { value: live.then(res => { st.db = res; rp.db = res; LIVE.delete(obj); try { onSave && onSave(); } catch (e) {} return res; }), enumerable: false });
  let raw = ''; try { raw = JSON.stringify(obj).slice(0, 60000); } catch (e) {}
  return siegel(rp, raw, src);
}
// Nach dem Rendern oben in den Bereich setzen (einmal je Bereich)
export function siegelOben(wrap, obj, onSave) {
  queueMicrotask(() => { try { if (!wrap || wrap.querySelector(':scope > .vt-siegel-top')) return; const sg = siegelGespeichert(obj, onSave); if (sg) wrap.prepend(h('div', { class: 'vt-siegel-top' }, sg)); } catch (e) {} });
}
