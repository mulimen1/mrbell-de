// Gemeinsame UI-Bausteine: Ladeanzeige mit Gesicht, Fehler/Limit-Dialog
import { h, ico, modal, toast, ls } from './util.js';
import { face } from './face.js';
import { COST, currentQuota, getAccount } from './api.js';
import { say, thinkLines } from './max.js';
import { L } from './i18n.js';
import { richText } from './sanitize.js';

// Gedankenblase neben Max' Kopf (die drei Denk-Punkte führen hinein)
export function thought(faceEl, kind = 'generic', fallback = []) {
  const bub = h('div', { class: 'thought', 'aria-live': 'polite' });
  const wrap = h('div', { class: 'thinkwrap' });
  faceEl.replaceWith(wrap); wrap.append(faceEl, bub);
  const lines = thinkLines(kind, fallback);
  let i = 0;
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
const EST = { quiz: 28, exam: 45, path: 35, lesson: 26, podcast: 50, cards: 22, summary: 34, topic: 22, ingest: 15, generic: 25 };
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
  const tick = () => {
    if (!el.isConnected || done) return clearInterval(iv);
    const s = (Date.now() - t0) / 1000;
    const p = s < est ? (s / est) * .94 : .94 + .055 * (1 - Math.exp(-(s - est) / 12));
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
    stop() {
      if (done) return; done = true;
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
    h('li', {}, h('span', { html: ico('check') }), L('Nur E-Mail bestätigen – Code kommt evtl. im Spam an', 'Just confirm your email – the code may land in spam')));
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
  if (e && e.code === 'cap') {
    const acc = getAccount();
    const upsell = acc && !acc.pro && (await import('./abo.js')).aboReady();
    const r = await modal({ title: L('Für heute ist Schluss damit', 'That’s it for today'), text: e.message, actions: upsell ? [{ label: L('Morgen weiter', 'Tomorrow'), value: false }, { label: L('Inner Circle 7 Tage gratis', 'Inner Circle: 7 days free'), value: 'abo', primary: true }] : acc ? [{ label: L('Alles klar', 'Got it'), value: false, primary: true }] : [{ label: L('Später', 'Later'), value: false }, { label: L('Kostenloses Konto', 'Free account'), value: true, primary: true }] });
    if (r === 'abo') return (await import('./abo.js')).openAbo();
    if (r) { const { openLogin } = await import('./account.js'); if (await openLogin({ title: L('Mehr mit kostenlosem Konto', 'More with a free account') }) && retry) retry(); }
    return;
  }
  if (e && e.code === 'limit') {
    const acc = getAccount();
    const r = await modal({
      title: L('Ich mach Feierabend', 'I’m clocking off'),
      text: say('limit') + (acc ? (acc.pro ? L(' Selbst im Inner Circle ist heute Schluss – morgen geht’s weiter.', ' Even in the Inner Circle, that’s it for today – we’ll carry on tomorrow.') : L(' Ab 0:00 Uhr gibt’s neue Einheiten. Der Inner Circle ohne Limit kommt bald.', ' New credits arrive at midnight. The Inner Circle without limits is coming soon.')) : L(' Ab 0:00 Uhr gibt’s neue Einheiten – oder du holst dir ein kostenloses Konto, dann hast du jeden Tag 40 Einheiten.', ' New credits arrive at midnight – or get a free account for 40 credits every day.')),
      actions: acc && !acc.pro && (await import('./abo.js')).aboReady() ? [{ label: L('Morgen weiter', 'Tomorrow'), value: false }, { label: L('Inner Circle 7 Tage gratis', 'Inner Circle: 7 days free'), value: 'abo', primary: true }] : acc ? [{ label: L('Alles klar', 'Got it'), value: false, primary: true }] : [{ label: L('Später', 'Later'), value: false }, { label: L('Kostenloses Konto', 'Free account'), value: true, primary: true }]
    });
    if (r === 'abo') return (await import('./abo.js')).openAbo();
    if (r) { const { openLogin } = await import('./account.js'); if (await openLogin({ title: L('Weiterlernen mit kostenlosem Konto', 'Keep learning with a free account') }) && retry) retry(); }
    return;
  }
  const r = await modal({ title: L('Das hat nicht geklappt', 'That didn’t work'), text: (e && e.message) || L('Unbekannter Fehler.', 'Unknown error.'), actions: retry ? [{ label: L('Schließen', 'Close'), value: false }, { label: L('Nochmal versuchen', 'Try again'), value: true, primary: true }] : [{ label: 'OK', value: false, primary: true }] });
  if (r && retry) retry();
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
export async function typeOut(el, text, { scroll = () => {}, alive = () => true } = {}) {
  const parts = String(text || '').split(/(\s+)/);
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
  const busy = () => !!inp.value;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async () => {
    await wait(2200);
    while (inp.isConnected) {
      if (busy()) { inp.placeholder = base; await wait(800); continue; }
      const t = pre + examples[k++ % examples.length];
      for (let i = pre.length; i <= t.length; i++) { if (busy() || !inp.isConnected) break; inp.placeholder = t.slice(0, i); await wait(42); }
      await wait(2000);
      if (!busy()) inp.placeholder = base;
      await wait(2600);
    }
  })();
}

// Text erscheint im Takt der Stimme (läuft mit der Wiedergabe, Stopp zeigt sofort alles)
export function syncOut(el, text, audio, { scroll = () => {}, spoken = 640 } = {}) {
  const parts = String(text || '').split(/(\s+)/), total = String(text || '').length, span = Math.min(total, spoken);
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
      back ? h('button', { class: 'btn sm ghost', type: 'button', onclick: back, style: { marginTop: '6px' } }, h('span', { html: ico('left') }), L('Zurück', 'Back')) : null)));
  face(f);
}
// Mitten im Lernen: Rest gesperrt (Karten, Quiz) – was schon da ist, bleibt erhalten
export function lockedRest(stage, { left, what, onUnlock }) {
  const f = h('div', { class: 'face', style: { width: '64px', height: '64px' } });
  stage.replaceChildren(h('div', { class: 'lockrest' }, f,
    h('h3', {}, L(`Noch ${left} ${what} warten auf dich`, `${left} more ${what} are waiting`)),
    h('p', {}, L('Sind schon fertig – mit kostenlosem Konto geht’s direkt hier weiter. Dein Fortschritt bleibt erhalten.', 'They’re ready – with a free account you continue right here. Your progress stays.')),
    h('div', { class: 'lp-b' },
      h('button', { class: 'btn primary', type: 'button', onclick: async () => { const { openLogin } = await import('./account.js'); if (await openLogin({ mode: 'register' }) && onUnlock) onUnlock(); } }, L('Kostenlos weitermachen', 'Continue for free')),
      h('button', { class: 'btn', type: 'button', onclick: async () => { const { openLogin } = await import('./account.js'); if (await openLogin() && onUnlock) onUnlock(); } }, L('Anmelden', 'Sign in')))));
  face(f).set?.('happy');
}

// KI-Kennzeichnung: welches Modell geantwortet hat (dezent unter der Antwort)
export function modelName(id) {
  const m = /claude-([a-z]+)-(\d+)-(\d+)/.exec(String(id || ''));
  return m ? `Claude ${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}.${m[3]}` : '';
}
const TOOLNAME = { rechne: 'Rechner', kapitalwert: 'Kapitalwert', interner_zinsfuss: 'Interner Zinsfuß', annuitaet: 'Annuität', finanzmathe: 'Zinsrechnung', abschreibung: 'Abschreibung', break_even: 'Break-even', deckungsbeitrag: 'Deckungsbeitrag', zuschlagskalkulation: 'Zuschlagskalkulation', einkommensteuer: 'Einkommensteuer (§ 32a EStG)', statistik: 'Statistik' };
// Herkunft: src = 'doc' (Skript mitgeschickt) / 'max' (Max' eigenes Kurzskript) / '' (ohne Skript). Seiten kommen aus den (S. x)-Belegen.
export function aiTag(tools, raw = '', src = '') {
  const t = Array.isArray(tools) ? tools.filter(x => TOOLNAME[x]) : [];
  const ok = t.length ? h('span', { class: 'aiok', title: L('Die Zahlen hat ein festes Rechenprogramm ausgerechnet, nicht die KI: ', 'The numbers were computed by a fixed calculator, not by the AI: ') + t.map(x => TOOLNAME[x]).join(', ') }, '✓ ' + L('Zahlen exakt nachgerechnet', 'Numbers verified by calculator')) : null;
  let from = null;
  if (src) {
    const pages = [...new Set([...String(raw).matchAll(/\((?:S|p|pp)\. ?(\d+)(?:[–-](\d+))?\)/g)].map(m => +m[1]))].sort((a, b) => a - b).slice(0, 5);
    from = pages.length
      ? h('span', { class: 'aisrc', title: L('Die Aussagen sind mit diesen Seiten belegt – zum Nachlesen.', 'Backed by these pages – check them yourself.') }, (src === 'max' ? L('Aus dem Kurzskript', 'From the short script') : L('Aus deinem Skript', 'From your slides')) + ' · ' + L('S. ', 'p. ') + pages.join(', '))
      : h('span', { class: 'aisrc gen', title: L('Dazu steht nichts Passendes im Skript – Max erklärt aus allgemeinem Fachwissen.', 'Nothing matching in the slides – Max explains from general knowledge.') }, L('Allgemeinwissen, nicht aus dem Skript', 'General knowledge, not from the slides'));
  }
  const lead = [from, ok].filter(Boolean);
  return h('div', { class: 'aitag', title: L('Max ist eine KI (Sprachmodell von Anthropic). Antworten können Fehler enthalten – prüf Wichtiges mit deinem Skript.', 'Max is an AI (language model by Anthropic). Answers can contain mistakes – check important things against your slides.') },
    ...lead.flatMap(x => [x, h('span', { class: 'ai-sep' }, '·')]), lead.length ? null : h('span', { class: 'ai-dot' }), h('span', { class: 'aikI' }, L('KI von Anthropic · kann Fehler machen', 'AI by Anthropic · can make mistakes')));
}
