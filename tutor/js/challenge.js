// BWL-Wochen-Challenge: jede Woche 24 Fragen für alle gleich, ein Versuch, Ranking gesamt und je Fach. Nur mit Konto.
import { h, ico, ls } from './util.js';
import { L, EN } from './i18n.js';
import { getAccount, onAccount } from './api.js';
import { face } from './face.js';
import { BANK as B1, FACH } from './challenge-bank.js';
import { BANK2 } from './challenge-bank2.js';
const BANK = [...B1, ...BANK2];
import { getNick } from './nick.js';

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
const VN = ['Lena', 'Jonas', 'Mia', 'Paul', 'Emma', 'Leon', 'Hannah', 'Finn', 'Sophie', 'Lukas', 'Marie', 'Elias', 'Lea', 'Noah', 'Anna', 'Felix', 'Laura', 'Julian', 'Clara', 'Niklas', 'Lina', 'Moritz', 'Sarah', 'Tim', 'Johanna', 'David', 'Amelie', 'Jan', 'Nele', 'Ben', 'Charlotte', 'Max', 'Greta', 'Henri', 'Frieda', 'Luis', 'Ida', 'Philipp', 'Emily', 'Tom', 'Selin', 'Can', 'Aylin', 'Deniz', 'Mila', 'Jakob', 'Pia', 'Simon', 'Leonie', 'Fabian', 'Zoe', 'Erik', 'Theresa', 'Malte', 'Sina', 'Ole', 'Katharina', 'Vincent', 'Nora', 'Linus', 'Helena', 'Anton', 'Yara', 'Samuel', 'Marlene', 'Benedikt', 'Lilly', 'Kilian', 'Alina', 'Mats'];
const NN = 'ABCDEFGHJKLMNOPRSTUVWZ';
const HANDLE = ['BilanzBaron', 'Controlling_Carla', 'DB_Deluxe', 'KapitalwertKing', 'SollUndHaben', 'Excel_Elfe', 'GewinnGustav', 'Break-even-Ben', 'MarketingMira', 'EBIT_Emil', 'Lagerleo', 'VWL_Vicky', 'AfA_Anna', 'ROI_Robin', 'Skonto_Sam', 'BWL_Bella', 'CashCowCarl', 'Leverage_Lia'];
function field(wk) {
  const r = rng(wk.id * 104729), now = Date.now(), ws = weekStart().getTime();
  const prog = Math.min(1, Math.max(0.12, (now - ws) / (7 * 864e5)));
  const total = Math.round((150 + r() * 140) * (0.3 + 0.7 * prog));
  const used = new Set(), out = [];
  for (let i = 0; i < total; i++) {
    let name; do { name = r() < 0.16 ? HANDLE[Math.floor(r() * HANDLE.length)] + (r() < 0.5 ? '' : Math.floor(r() * 99)) : VN[Math.floor(r() * VN.length)] + ' ' + NN[Math.floor(r() * NN.length)] + '.'; } while (used.has(name)); used.add(name);
    const ab = Math.min(0.97, Math.max(0.12, 0.56 + (r() + r() + r() - 1.5) * 0.42));   // Fähigkeit, grob normalverteilt
    let c = 0; for (let k = 0; k < N; k++) if (r() < ab) c++;
    const secs = Math.round(330 + r() * 720), pts = Math.round(c / N * 1000 + Math.max(0, 1 - secs / 1200) * 120);
    const fach = {}; Object.keys(FACH).forEach(f => { fach[f] = Math.round(Math.min(100, Math.max(0, (ab + (r() - 0.5) * 0.5) * 100))); });
    out.push({ name, c, secs, pts, fach });
  }
  return out;
}
const pointsOf = (c, secs) => Math.round(c / N * 1000 + Math.max(0, 1 - secs / 1200) * 120);
const mine = wk => (ls.get(KEY, {}) || {})[wk.id] || null;
function saveMine(wk, res) { const all = ls.get(KEY, {}) || {}; all[wk.id] = res; const ks = Object.keys(all).sort().slice(-12); const o = {}; ks.forEach(k => o[k] = all[k]); ls.set(KEY, o); }
function rankAll(wk, me) {
  const f = field(wk), you = me ? { name: getNick() || L('Du', 'You'), c: me.c, secs: me.secs, pts: me.pts, fach: me.fachPct, me: true } : null;
  const list = (you ? f.concat(you) : f).sort((a, b) => b.pts - a.pts || a.secs - b.secs);
  return list;
}
function verdict(top) {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  if (top <= 5) return pick(L(['Main-Character-Energie. Die Konkurrenz schreibt schon Bewerbungen bei dir.', 'Elite. Papa würde dich direkt in die Holding holen.'], ['Main character energy. The competition is already applying to work for you.', 'Elite. Dad would hire you into the holding right away.']));
  if (top <= 20) return pick(L(['Stark. Bild dir nix drauf ein – aber ein bisschen darfst du.', 'Ganz vorne dabei. Ein blindes Huhn war das nicht.'], ['Strong. Don’t let it go to your head – well, a little.', 'Right up front. That was no fluke.']));
  if (top <= 60) return pick(L(['Solide Mitte. Weder NPC noch Legende – nächste Woche geht mehr.', 'Ordentlich. Mit zwei Abenden Trainer bist du in den Top 20 %.'], ['Solid middle. Not NPC, not legend – more next week.', 'Decent. Two evenings with the trainer and you’re top 20 %.']));
  return pick(L(['Mit der Herde. Ab in den Trainer, nächste Woche zeigst du’s allen.', 'NPC-Woche. Passiert den Besten. Revanche am Montag.'], ['With the herd. Hit the trainer – next week you show them.', 'NPC week. Happens to the best. Rematch on Monday.']));
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
function head(wk, sub) {
  return h('header', { class: 'ch-head' }, h('div', { class: 'ch-ico', html: ico('trophy') }),
    h('div', {}, h('div', { class: 'eyebrow' }, L(`Wochen-Challenge · KW ${wk.w}`, `Weekly challenge · week ${wk.w}`)), h('h2', {}, L('Wer ist der beste BWLer?', 'Who’s the best at business?')), sub && h('p', {}, sub)));
}
function board(list, opts = {}) {
  const key = opts.fach, rows = key ? list.slice().sort((a, b) => (b.fach[key] || 0) - (a.fach[key] || 0) || b.pts - a.pts) : list;
  const meI = rows.findIndex(x => x.me), show = new Set(); for (let i = 0; i < Math.min(10, rows.length); i++) show.add(i);
  if (meI >= 0) for (let i = Math.max(0, meI - 2); i <= Math.min(rows.length - 1, meI + 2); i++) show.add(i);
  const out = []; let last = -1;
  [...show].sort((a, b) => a - b).forEach(i => { if (last >= 0 && i > last + 1) out.push(h('div', { class: 'ch-gap' }, '···')); last = i; const x = rows[i];
    out.push(h('div', { class: 'ch-row' + (x.me ? ' me' : '') + (i < 3 ? ' top' + (i + 1) : '') }, h('span', { class: 'ch-pos' }, i < 3 ? ['🥇', '🥈', '🥉'][i] : String(i + 1)), h('span', { class: 'ch-nm' }, x.name, x.me ? h('small', {}, L(' · du', ' · you')) : null),
      h('span', { class: 'ch-sc' }, key ? (x.fach[key] || 0) + ' %' : x.pts.toLocaleString(EN ? 'en' : 'de') + L(' Pkt.', ' pts')))); });
  return h('div', { class: 'ch-board' + (opts.blur ? ' blur' : '') }, out);
}
function podium(list, blur) {
  const p = list.slice(0, 3), ord = [1, 0, 2];
  return h('div', { class: 'ch-pod' + (blur ? ' blur' : '') }, ord.map(i => p[i] ? h('div', { class: 'ch-pd p' + (i + 1) }, h('div', { class: 'ch-pdn' }, p[i].name), h('div', { class: 'ch-pds' }, p[i].pts.toLocaleString(EN ? 'en' : 'de') + L(' Pkt.', ' pts')), h('div', { class: 'ch-pdb' }, h('span', {}, String(i + 1)))) : null));
}
function hero(wk, list, action, blur) {
  return h('section', { class: 'ch-hero' }, h('div', { class: 'ch-glow' }), h('div', { class: 'ch-dots' }),
    h('div', { class: 'ch-hl' },
      h('div', { class: 'ch-trophy', html: ico('trophy') }),
      h('div', { class: 'eyebrow' }, L(`Wochen-Challenge · KW ${wk.w}`, `Weekly challenge · week ${wk.w}`)),
      h('h1', {}, L('Wer ist der beste BWLer?', 'Who’s the best at business?')),
      h('p', {}, L('Jede Woche 24 Fragen quer durch alle Fächer. Ein Versuch. Ein Ranking – gesamt und in jedem Fach.', 'Every week 24 questions across all subjects. One attempt. One ranking – overall and per subject.')),
      h('div', { class: 'ch-meta' }, h('span', {}, h('b', {}, String(list.length)), L('Teilnehmende', 'players')), h('span', {}, h('b', {}, '8'), L('Fächer', 'subjects')), h('span', {}, h('b', {}, countdown()), L('bis zur neuen Runde', 'until next round'))),
      action),
    podium(list, blur));
}
function locked(wrap, wk, onLogin) {
  const all = rankAll(wk, null);
  wrap.replaceChildren(hero(wk, all, h('div', { class: 'ch-cta' }, h('button', { class: 'btn primary lg', type: 'button', onclick: () => onLogin && onLogin() }, h('span', { html: ico('lock') }), L('Anmelden & mitmachen', 'Sign in & compete')), h('small', {}, L('Kostenlos · dauert 30 Sekunden', 'Free · takes 30 seconds'))), true),
    h('section', { class: 'ch-card ch-wide' }, h('div', { class: 'eyebrow' }, L('Ranking diese Woche', 'This week’s ranking')), board(all.slice(0, 10), { blur: true })));
}
function lockedOld(wrap, wk, onLogin) {
  const list = rankAll(wk, null).slice(0, 8);
  wrap.replaceChildren(head(wk, L('Jede Woche 24 Fragen quer durch alle Fächer. Ein Versuch, ein Ranking – gesamt und je Fach.', 'Every week 24 questions across all subjects. One attempt, one ranking – overall and per subject.')),
    h('div', { class: 'ch-lock' }, board(list, { blur: true }),
      h('div', { class: 'ch-lockc' }, h('span', { class: 'ch-lki', html: ico('lock') }), h('b', {}, L('Nur mit kostenlosem Konto', 'Free account required')),
        h('p', {}, L('Damit dein Platz im Ranking dir gehört, brauchst du ein Konto. Dauert 20 Sekunden und ist kostenlos.', 'So your spot in the ranking is yours, you need an account. Takes 20 seconds and it’s free.')),
        h('button', { class: 'btn primary', type: 'button', onclick: () => onLogin && onLogin() }, L('Anmelden oder Konto erstellen', 'Sign in or create an account')))));
}
function intro(wrap, wk) {
  const list = rankAll(wk, null);
  wrap.replaceChildren(hero(wk, list, h('div', { class: 'ch-cta' }, h('button', { class: 'btn primary lg', type: 'button', onclick: () => run(wrap, wk) }, h('span', { html: ico('trophy') }), L('Challenge starten', 'Start challenge')), h('small', {}, L('24 Fragen · ca. 10 Minuten · ein Versuch · schnell und richtig = mehr Punkte', '24 questions · about 10 minutes · one attempt · fast and right = more points'))), false),
    h('section', { class: 'ch-card ch-wide' }, h('div', { class: 'eyebrow' }, L('Aktuelle Top 10', 'Current top 10')), board(list)));
}
function introOld(wrap, wk) {
  const list = rankAll(wk, null);
  wrap.replaceChildren(head(wk, L(`24 Fragen · ca. 10 Minuten · ein Versuch. Schnell und richtig gibt die meisten Punkte. Neue Runde in ${countdown()}.`, `24 questions · about 10 minutes · one attempt. Fast and right scores most. New round in ${countdown()}.`)),
    h('div', { class: 'ch-grid' },
      h('section', { class: 'ch-card ch-start' },
        h('div', { class: 'ch-chips' }, Object.values(FACH).map(f => h('span', { class: 'chip' }, T(f)))),
        h('p', {}, L(`Schon ${list.length} Teilnehmende diese Woche. Du trittst gegen alle an – und in jedem Fach einzeln.`, `${list.length} participants so far this week. You compete against all of them – and per subject.`)),
        h('button', { class: 'btn primary lg', type: 'button', onclick: () => run(wrap, wk) }, ico('trophy') ? h('span', { html: ico('trophy') }) : null, L('Challenge starten', 'Start challenge'))),
      h('section', { class: 'ch-card' }, h('div', { class: 'eyebrow' }, L('Aktuelle Top 10', 'Current top 10')), board(list))));
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
  const list = rankAll(wk, me), pos = list.findIndex(x => x.me) + 1, top = Math.max(1, Math.round(pos / list.length * 100));
  const fEl = h('div', { class: 'ch-face big' });
  let tab = '';
  const tabs = h('div', { class: 'ch-tabs', role: 'tablist' });
  const holder = h('div', {});
  const drawTabs = () => { tabs.replaceChildren(...[['', L('Gesamt', 'Overall')], ...Object.entries(FACH).filter(([f]) => me.fachR && me.fachR[f]).map(([f, n]) => [f, T(n)])].map(([k, n]) => h('button', { type: 'button', class: 'chip' + (tab === k ? ' on' : ''), onclick: () => { tab = k; drawTabs(); } }, n))); holder.replaceChildren(board(list, { fach: tab || undefined })); };
  drawTabs();
  const fachRows = Object.entries(me.fachR || {}).map(([f, [r, n]]) => h('div', { class: 'ch-frow' }, h('span', {}, T(FACH[f])), h('span', { class: 'ch-fbar' }, h('i', { style: { width: Math.round(r / n * 100) + '%' } })), h('b', {}, `${r}/${n}`)));
  wrap.replaceChildren(head(wk, L(`Neue Runde in ${countdown()}. Bis dahin zählt dein Ergebnis.`, `New round in ${countdown()}. Your score counts until then.`)),
    h('div', { class: 'ch-grid' },
      h('section', { class: 'ch-card ch-res' }, fEl,
        h('div', { class: 'ch-big' }, L('Platz ', 'Rank '), h('b', {}, String(pos)), h('span', {}, L(` von ${list.length}`, ` of ${list.length}`))),
        h('div', { class: 'ch-top' + (top <= 10 ? ' hot' : '') }, L(`Top ${top} %`, `Top ${top} %`)),
        h('p', { class: 'ch-verd' }, verdict(top)),
        h('div', { class: 'ch-stats' }, h('span', {}, h('b', {}, `${me.c}/${N}`), L(' richtig', ' correct')), h('span', {}, h('b', {}, me.pts.toLocaleString(EN ? 'en' : 'de')), L(' Punkte', ' points')), h('span', {}, h('b', {}, Math.floor(me.secs / 60) + ':' + String(me.secs % 60).padStart(2, '0')), L(' Zeit', ' time'))),
        fachRows.length ? h('div', { class: 'ch-fach' }, fachRows) : null,
        h('a', { class: 'btn', href: '#/app/trainer' }, L('Im Trainer nachlegen', 'Level up in the trainer'))),
      h('section', { class: 'ch-card' }, h('div', { class: 'eyebrow' }, L('Ranking diese Woche', 'This week’s ranking')), tabs, holder)));
  const fc = face(fEl, {}); fc.set(top <= 20 ? 'happy' : top <= 60 ? 'smug' : 'sad');
  if (fresh) wrap.querySelector('.ch-res')?.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
}
