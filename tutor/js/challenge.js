// BWL-Wochen-Challenge: jede Woche 24 Fragen für alle gleich, ein Versuch, Ergebnis je Fach und Verlauf der eigenen Wochen. Nur mit Konto.
import { h, ico, ls } from './util.js';
import { L, EN } from './i18n.js';
import { getAccount, onAccount } from './api.js';
import { face } from './face.js';
import { BANK as B1, FACH } from './challenge-bank.js';
import { BANK2 } from './challenge-bank2.js';
const BANK = [...B1, ...BANK2];

const N = 24, PER = 3, KEY = 'tutor.challenge';
const T = p => (EN ? p[1] : p[0]);
// ---------- Woche & Zufall (für alle gleich) ----------
function isoWeek(d = new Date()) { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(); const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7); return { y, w, id: y * 100 + w }; }
function weekStart(d = new Date()) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - day); return x; }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuf = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function weekTest(wk) {
  const r = rng(wk.id * 7919);
  const byF = {}; shuf(BANK.map((q, i) => ({ q, i })), r).forEach(x => (byF[x.q.f] = byF[x.q.f] || []).push(x));
  const pick = []; Object.keys(FACH).forEach(f => { for (let k = 0; k < PER && byF[f] && byF[f].length; k++) pick.push(byF[f].shift()); });
  const rest = shuf(Object.values(byF).flat(), r); while (pick.length < N && rest.length) pick.push(rest.shift());
  return shuf(pick, r).slice(0, N).map(({ q, i }) => { const ord = shuf([0, 1, 2, 3], rng(wk.id * 31 + i)); return { ...q, id: i, opts: ord.map(k => q.o[k]), right: ord.indexOf(q.a) }; });
}
// ---------- Teilnehmer der Woche ----------
const pointsOf = (c, secs) => Math.round(c / N * 1000 + Math.max(0, 1 - secs / 1200) * 120);
const mine = wk => (ls.get(KEY, {}) || {})[wk.id] || null;
function saveMine(wk, res) { const all = ls.get(KEY, {}) || {}; all[wk.id] = res; const ks = Object.keys(all).sort().slice(-12); const o = {}; ks.forEach(k => o[k] = all[k]); ls.set(KEY, o); }
// Eigene Wochen (lokal): Verlauf und Rekord
const history = () => { const all = ls.get(KEY, {}) || {}; return Object.keys(all).sort().map(k => ({ id: +k, ...all[k] })); };
function verdict(pct) {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  if (pct >= 90) return pick(L(['Main-Character-Energie. Ich bin fast ein bisschen neidisch.', 'Elite. Papa würde dich direkt in die Holding holen.'], ['Main character energy. I’m almost a little jealous.', 'Elite. Dad would hire you into the holding straight away.']));
  if (pct >= 75) return pick(L(['Stark. Bild dir nix drauf ein – aber ein bisschen darfst du.', 'Sitzt. Ein blindes Huhn war das nicht.'], ['Strong. Don’t let it go to your head – well, a little.', 'Solid. That was no fluke.']));
  if (pct >= 50) return pick(L(['Solide. Mit zwei Abenden Trainer wird das nächste Woche richtig gut.', 'Ordentlich. Da geht noch was – und ich weiß auch, wo.'], ['Solid. Two evenings in the trainer and next week looks great.', 'Decent. There’s more in you – and I know where.']));
  return pick(L(['Ausbaufähig. Ab in den Trainer, nächste Woche zeigst du’s.', 'Passiert den Besten. Revanche am Montag.'], ['Room to grow. Hit the trainer – next week you show it.', 'Happens to the best. Rematch on Monday.']));
}
const countdown = () => { const nx = weekStart(); nx.setDate(nx.getDate() + 7); const ms = nx - Date.now(), d = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5); return d ? L(`${d} ${d === 1 ? 'Tag' : 'Tagen'} ${hh} Std.`, `${d}d ${hh}h`) : L(`${hh} Std.`, `${hh}h`); };

// ---------- Oberfläche ----------
export function renderChallenge(root, { onLogin } = {}) {
  const wk = isoWeek();
  const wrap = h('div', { class: 'ch view-in' }); root.replaceChildren(wrap);
  const draw = () => { const a = getAccount(); if (!a) return locked(wrap, wk, onLogin); const m = mine(wk); if (m) return result(wrap, wk, m, false); intro(wrap, wk); };
  draw();
  const off = onAccount(() => { if (!wrap.isConnected) { off(); return; } if (!wrap.querySelector('.ch-run')) draw(); });
}
function hero(wk, action) {
  const hist = history().filter(x => x.id !== wk.id).slice(-6);
  const best = hist.reduce((m, x) => Math.max(m, x.pts || 0), 0);
  return h('section', { class: 'ch-hero' }, h('div', { class: 'ch-glow' }), h('div', { class: 'ch-dots' }),
    h('div', { class: 'ch-hl' },
      h('div', { class: 'ch-trophy', html: ico('trophy') }),
      h('div', { class: 'eyebrow' }, L(`Wochen-Challenge · KW ${wk.w}`, `Weekly challenge · week ${wk.w}`)),
      h('h1', {}, L('Wie gut bist du wirklich?', 'How good are you really?')),
      h('p', {}, L('Jede Woche 24 neue Fragen quer durch alle Fächer. Ein Versuch, schnell und richtig gibt die meisten Punkte – und du siehst sofort, in welchem Fach du stark bist.', 'Every week 24 new questions across all subjects. One attempt, fast and right scores most – and you see straight away where you’re strong.')),
      h('div', { class: 'ch-meta' }, h('span', {}, h('b', {}, String(N)), L('Fragen', 'questions')), h('span', {}, h('b', {}, String(Object.keys(FACH).length)), L('Fächer', 'subjects')), h('span', {}, h('b', {}, countdown()), L('bis zur neuen Runde', 'until next round'))),
      action),
    h('div', { class: 'ch-side' }, hist.length
      ? [h('div', { class: 'eyebrow' }, L('Deine letzten Wochen', 'Your last weeks')),
        h('div', { class: 'ch-hist' }, hist.map(x => h('div', { class: 'ch-hb' + (x.pts === best ? ' best' : '') }, h('i', { style: { height: Math.max(8, Math.round((x.pts || 0) / 1120 * 100)) + '%' } }), h('span', {}, 'KW ' + (x.id % 100))))),
        h('small', {}, L(`Rekord: ${best.toLocaleString('de')} Punkte`, `Record: ${best.toLocaleString('en')} points`))]
      : h('div', { class: 'ch-fachs' }, Object.values(FACH).map(f => h('span', { class: 'chip' }, T(f))))));
}
function locked(wrap, wk, onLogin) {
  wrap.replaceChildren(hero(wk, h('div', { class: 'ch-cta' }, h('button', { class: 'btn primary lg', type: 'button', onclick: () => onLogin && onLogin() }, h('span', { html: ico('lock') }), L('Anmelden & mitmachen', 'Sign in & compete')), h('small', {}, L('Kostenlos · dauert 30 Sekunden', 'Free · takes 30 seconds')))));
}
function intro(wrap, wk) {
  wrap.replaceChildren(hero(wk, h('div', { class: 'ch-cta' }, h('button', { class: 'btn primary lg', type: 'button', onclick: () => run(wrap, wk) }, h('span', { html: ico('trophy') }), L('Challenge starten', 'Start challenge')), h('small', {}, L('24 Fragen · ca. 10 Minuten · ein Versuch · schnell und richtig = mehr Punkte', '24 questions · about 10 minutes · one attempt · fast and right = more points')))));
}
function run(wrap, wk) {
  const qs = weekTest(wk), t0 = Date.now(); let i = 0; const ans = [];
  try { window.BM && window.BM.track('Bereich geöffnet', 'challenge-start'); } catch (e) {}
  const bar = h('i'), num = h('span', { class: 'ch-num' }), clock = h('span', { class: 'ch-clock' });
  const box = h('div', { class: 'ch-q' });
  const fEl = h('div', { class: 'ch-face' });
  wrap.replaceChildren(h('div', { class: 'ch-run' }, h('div', { class: 'ch-top' }, num, h('div', { class: 'ch-bar' }, bar), clock), h('div', { class: 'ch-stage' }, fEl, box)));
  const fc = face(fEl, {});
  const tick = setInterval(() => { if (!wrap.isConnected) { clearInterval(tick); return; } const s = Math.floor((Date.now() - t0) / 1000); clock.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 500);
  const show = () => {
    const q = qs[i]; num.textContent = `${i + 1} / ${N}`; bar.style.width = (i / N * 100) + '%'; fc.set('idle');
    const opts = q.opts.map((o, k) => h('button', { class: 'ch-opt', type: 'button', onclick: () => pickIt(k) }, h('span', { class: 'ch-k' }, 'ABCD'[k]), h('span', {}, T(o))));
    const expl = h('div', { class: 'ch-ex' });
    const next = h('button', { class: 'btn primary ch-next', type: 'button', hidden: true, onclick: () => { i++; if (i < N) show(); else finish(); } }, i < N - 1 ? L('Weiter', 'Next') : L('Ergebnis', 'Result'));
    box.replaceChildren(h('div', { class: 'eyebrow' }, T(FACH[q.f])), h('h3', {}, T(q.q)), h('div', { class: 'ch-opts' }, opts), expl, next);
    box.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    let done = false;
    function pickIt(k) {
      if (done) return; done = true; const ok = k === q.right; ans.push({ f: q.f, ok });
      opts.forEach((b, j) => { b.disabled = true; if (j === q.right) b.classList.add('ok'); else if (j === k) b.classList.add('bad'); });
      fc.pulse(ok ? 'happy' : 'sad', 1200);
      expl.replaceChildren(h('b', {}, ok ? L('Richtig. ', 'Correct. ') : L('Leider nein. ', 'Nope. ')), T(q.e)); expl.classList.add('on');
      next.hidden = false; next.focus({ preventScroll: true });
    }
  };
  const finish = () => {
    clearInterval(tick); const secs = Math.round((Date.now() - t0) / 1000), c = ans.filter(a => a.ok).length;
    const fachR = {}; ans.forEach(a => { const x = fachR[a.f] = fachR[a.f] || [0, 0]; x[1]++; if (a.ok) x[0]++; });
    const fachPct = {}; Object.keys(FACH).forEach(f => { fachPct[f] = fachR[f] ? Math.round(fachR[f][0] / fachR[f][1] * 100) : 0; });
    const res = { c, secs, pts: pointsOf(c, secs), fachR, fachPct, at: Date.now() };
    saveMine(wk, res);
    try { window.BM && window.BM.track('Erstellt', 'Wochen-Challenge'); } catch (e) {}
    result(wrap, wk, res, true);
  };
  show();
}
function result(wrap, wk, me, fresh) {
  const pct = Math.round(me.c / N * 100);
  const prev = history().filter(x => x.id !== wk.id);
  const best = prev.reduce((m, x) => Math.max(m, x.pts || 0), 0);
  const rec = prev.length && me.pts > best;
  const fEl = h('div', { class: 'ch-face big' });
  const fr = Object.entries(me.fachR || {}).map(([f, [r, n]]) => ({ f, p: Math.round(r / n * 100) })).sort((a, b) => b.p - a.p);
  const weak = fr.length ? fr[fr.length - 1] : null;
  const fachRows = fr.map(({ f, p }) => h('div', { class: 'ch-frow' }, h('span', {}, T(FACH[f])), h('span', { class: 'ch-fbar' }, h('i', { style: { width: p + '%' } })), h('b', {}, p + ' %')));
  wrap.replaceChildren(
    h('section', { class: 'ch-card ch-res ch-wide' }, fEl,
      h('div', { class: 'eyebrow' }, L(`Wochen-Challenge · KW ${wk.w}`, `Weekly challenge · week ${wk.w}`)),
      h('div', { class: 'ch-big' }, h('b', {}, `${me.c}/${N}`), h('span', {}, L(' richtig', ' correct'))),
      h('div', { class: 'ch-top' + (rec ? ' hot' : '') }, rec ? L('Neuer Rekord', 'New record') : L(`${me.pts.toLocaleString('de')} Punkte`, `${me.pts.toLocaleString('en')} points`)),
      h('p', { class: 'ch-verd' }, verdict(pct)),
      h('div', { class: 'ch-stats' }, h('span', {}, h('b', {}, me.pts.toLocaleString(EN ? 'en' : 'de')), L(' Punkte', ' points')), h('span', {}, h('b', {}, `${Math.floor(me.secs / 60)}:${String(me.secs % 60).padStart(2, '0')}`), L(' Minuten', ' minutes')), prev.length ? h('span', {}, h('b', {}, best.toLocaleString(EN ? 'en' : 'de')), L(' bisheriger Rekord', ' previous record')) : null),
      fachRows.length ? h('div', { class: 'ch-fach' }, h('div', { class: 'eyebrow' }, L('Deine Fächer', 'Your subjects')), fachRows) : null,
      h('div', { class: 'ch-acts' }, h('a', { class: 'btn primary', href: '#/app/trainer' }, weak && weak.p < 100 ? L(`${T(FACH[weak.f])} im Trainer üben`, `Practise ${T(FACH[weak.f])} in the trainer`) : L('Im Trainer nachlegen', 'Level up in the trainer')),
        h('small', {}, L(`Neue Runde in ${countdown()}.`, `New round in ${countdown()}.`)))));
  const fc = face(fEl, {}); fc.set(pct >= 75 ? 'happy' : pct >= 50 ? 'smug' : 'sad');
  if (fresh) wrap.querySelector('.ch-res')?.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
}
