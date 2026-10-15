/* Tutor · Trainer — interaktive Übungsmodule (Rechnungswesen, Kostenrechnung, Investition, VWL)
   API: TRAINERS, renderTrainer(root, { kind, onAsk })
   Alle Lösungen werden im Code berechnet. Keine externen Abhängigkeiten. */

const LS_KEY = 'tutor.trainer.v1';
const SVGNS = 'http://www.w3.org/2000/svg';
const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/* ================= Grundbausteine ================= */
const _nf = new Map();
function fmt(v, d = 2, min = d) {
  if (!Number.isFinite(v)) return '–';
  const k = d + ':' + min;
  if (!_nf.has(k)) _nf.set(k, new Intl.NumberFormat('de-DE', { minimumFractionDigits: min, maximumFractionDigits: d }));
  return _nf.get(k).format(Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).replace('-', '−');
}
const eur = (v, d = 2) => fmt(v, d) + ' €';
const eur0 = v => fmt(v, 0) + ' €';
const fmtK = v => Math.abs(v) >= 10000 ? fmt(v / 1000, 0) + ' Tsd.' : fmt(v, 0);
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const r2 = v => Math.round(v * 100) / 100;
const near = (a, b, tol = 0.005) => Math.abs(a - b) <= tol + 1e-9;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sum = a => a.reduce((s, v) => s + v, 0);
const step = (max, s) => (max >= s ? ri(1, Math.floor(max / s)) * s : 0);
let _uid = 0;
const uid = p => `tr-${p}-${++_uid}`;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;

/** Zahl aus deutscher oder englischer Schreibweise lesen ("1.234,56", "1234.5", "−12"). */
export function parseNum(s) {
  if (typeof s === 'number') return s;
  s = String(s ?? '').trim().replace(/[\s €%]/g, '').replace(/^\+/, '').replace(/[−–]/g, '-');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : NaN;
}

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const k in props) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'value') el.value = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  addKids(el, kids);
  return el;
}
function addKids(el, kids) {
  for (const c of kids) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) addKids(el, c); else el.append(c instanceof Node ? c : String(c));
  }
}
function svgIcon(d, cls = 'ico') {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true');
  if (d.trim().startsWith('<')) s.innerHTML = d; // statisches Icon-Markup aus TRAINERS
  else { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); s.append(p); }
  return s;
}
const I = {
  back: 'M15 18l-6-6 6-6', next: 'M5 12h14M13 6l6 6-6 6', check: 'M5 12.5l4.5 4.5L19 7', x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14', bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.6.9.6 1.2v1h6v-1c0-.3.1-.8.6-1.2A6 6 0 0 0 12 3z',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z', refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  info: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', left: 'M19 12H5M11 6l-6 6 6 6', right: 'M5 12h14M13 6l6 6-6 6',
};

/* ================= Statistik (localStorage) ================= */
const ERR = {
  vertauscht: 'Soll/Haben vertauscht', betrag: 'Betrag falsch', konto: 'falsches Konto', steuer: 'Steuer vergessen',
  fehlt: 'Buchung unvollständig', extra: 'überflüssige Zeile', summe: 'Soll ≠ Haben', folge: 'Folgefehler', sb: 'Schlussbestand falsch',
  db: 'Deckungsbeitrag nicht genutzt', fix: 'Fixkosten vergessen', kv: 'variable Kosten vergessen', vorzeichen: 'Vorzeichen',
  pug: 'kurz-/langfristig verwechselt', bezug: 'falsche Bezugsgröße', einheit: 'falsche Größe/Einheit', engpass: 'absoluter statt relativer DB',
  abzins: 'nicht abgezinst', i0: 'Anschaffungsauszahlung vergessen', expo: 'Exponent verschoben', aufzins: 'auf- statt abgezinst',
  einfach: 'einfache statt Zinseszins', anf: 'Annuitätenfaktor fehlt', statisch: 'statisch statt dynamisch',
  kurve: 'falsche Kurve', richtung: 'falsche Richtung', preis: 'Preiseffekt', menge: 'Mengeneffekt',
  seite: 'falsche Bilanzseite', gruppe: 'falsche Bilanzgruppe', rang: 'Rangfolge', rechen: 'Rechenfehler',
};
function loadAll() {
  try { const o = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch { return {}; }
}
function getStats(id) {
  const s = loadAll()[id] || {};
  return { attempts: s.attempts | 0, correct: s.correct | 0, streak: s.streak | 0, best: s.best | 0, errors: s.errors && typeof s.errors === 'object' ? s.errors : {} };
}
function saveStats(id, s) {
  try { const all = loadAll(); all[id] = s; localStorage.setItem(LS_KEY, JSON.stringify(all)); } catch { /* Speicher nicht verfügbar */ }
}
function record(id, ok, errs) {
  const s = getStats(id);
  s.attempts++;
  if (ok) { s.correct++; s.streak++; s.best = Math.max(s.best, s.streak); } else {
    s.streak = 0;
    for (const e of new Set(errs || [])) s.errors[e] = (s.errors[e] | 0) + 1;
  }
  saveStats(id, s);
}
function breakStreak(id) { const s = getStats(id); s.streak = 0; saveStats(id, s); }
function statParts(id) {
  const s = getStats(id);
  if (!s.attempts) return ['Noch keine Versuche'];
  const top = Object.entries(s.errors).sort((a, b) => b[1] - a[1])[0];
  return [`Serie ${s.streak}`, `Bestwert ${s.best}`, `${s.correct}/${s.attempts} richtig`, top && `Häufigster Fehler: ${ERR[top[0]] || top[0]}`].filter(Boolean);
}

/* ================= UI-Bausteine ================= */
function fbBox(kind, title, msgs = [], extra) {
  const icon = kind === 'ok' ? I.check : kind === 'bad' ? I.x : I.info;
  return h('div', { class: 'feedback tr-feedback' + (kind === 'bad' ? ' bad' : kind === 'info' ? ' tr-info' : ''), 'data-result': kind },
    h('div', { class: 'verdict' }, h('span', { class: 'badge' }, svgIcon(icon, 'ico tr-bi')), h('span', null, title)),
    msgs.length > 1 ? h('ul', { class: 'tr-msgs' }, msgs.map(m => h('li', null, m))) : msgs.length ? h('p', null, msgs[0]) : null,
    extra || null);
}
function solBlock(lines) { return h('div', { class: 'sol tr-sol' }, lines.join('\n')); }
function chips(opts, onPick, label) {
  let val = null;
  const btns = opts.map(([k, t]) => h('button', { type: 'button', class: 'chip tr-chip', 'aria-pressed': 'false', 'data-k': k }, t));
  const el = h('div', { class: 'tr-chips', role: 'group', 'aria-label': label }, btns);
  const set = k => { val = k; btns.forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); };
  btns.forEach(b => b.addEventListener('click', () => { if (el.dataset.locked) return; set(b.dataset.k); onPick?.(b.dataset.k); }));
  return { el, get value() { return val; }, set, lock() { el.dataset.locked = '1'; btns.forEach(b => (b.disabled = true)); } };
}
function range({ label, min, max, step: st, value, out, onInput }) {
  const id = uid('r');
  const o = h('output', { class: 'tr-rv', for: id });
  const inp = h('input', { class: 'tr-range', type: 'range', id, min, max, step: st, value });
  const upd = () => { const v = +inp.value; o.textContent = out(v); inp.setAttribute('aria-valuetext', out(v)); inp.style.setProperty('--p', ((v - min) / (max - min)) * 100 + '%'); };
  inp.addEventListener('input', () => { upd(); onInput(+inp.value); });
  upd();
  const el = h('div', { class: 'tr-slider' }, h('label', { for: id, class: 'tr-sl-l' }, h('span', null, label), o), inp);
  return { el, inp, set(v) { inp.value = v; upd(); }, setRange(a, b, s) { inp.min = a; inp.max = b; inp.step = s; min = a; max = b; upd(); }, upd };
}
function kpi(label, value, sub) { return h('div', { class: 'tr-kpi' }, h('small', null, label), h('b', null, value), sub ? h('span', null, sub) : null); }
function tkonto(name, L, R, cls = '') {
  const col = rows => h('div', { class: 'tr-tk-c' }, rows.map(([l, v, c]) => h('div', { class: 'tr-tk-r' + (c ? ' ' + c : '') }, h('span', null, l), h('span', null, v))));
  return h('div', { class: 'tr-tk ' + cls }, h('div', { class: 'tr-tk-h' }, h('span', null, 'S'), h('b', null, name), h('span', null, 'H')), h('div', { class: 'tr-tk-b' }, col(L), col(R)));
}
function chartHost(el, render) {
  let W = 0;
  const draw = () => { W = clamp(Math.round(el.clientWidth) || 640, 280, 920); el.innerHTML = render(W); };
  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      if (!el.isConnected) { ro.disconnect(); return; }
      const w = clamp(Math.round(el.clientWidth), 280, 920);
      if (el.clientWidth && Math.abs(w - W) > 2) draw();
    });
    ro.observe(el);
  }
  draw();
  return { draw, get W() { return W; } };
}

/* ---- SVG-Diagramm-Helfer ---- */
function niceStep(span, n = 5) {
  const raw = Math.max(span, 1e-9) / n, e = 10 ** Math.floor(Math.log10(raw)), f = raw / e;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * e;
}
function scale(W, H, m, x0, x1, y0, y1) {
  return { W, H, m, x0, x1, y0, y1,
    X: v => +(m.l + ((v - x0) / (x1 - x0)) * (W - m.l - m.r)).toFixed(2),
    Y: v => +(H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b)).toFixed(2) };
}
function axesSvg(S, o = {}) {
  const xs = o.xs || niceStep(S.x1 - S.x0, S.W < 460 ? 4 : 6), ys = o.ys || niceStep(S.y1 - S.y0, S.H < 280 ? 4 : 5);
  const xf = o.xf || (v => fmt(v, 0)), yf = o.yf || fmtK;
  let s = '';
  for (let k = Math.ceil(S.y0 / ys - 1e-9); k * ys <= S.y1 + 1e-9; k++) {
    const v = k * ys, y = S.Y(v);
    s += `<line class="tr-gr${k === 0 ? ' tr-zero' : ''}" x1="${S.m.l}" x2="${S.W - S.m.r}" y1="${y}" y2="${y}"/><text class="tr-tl" x="${S.m.l - 7}" y="${y + 3.5}" text-anchor="end">${yf(v)}</text>`;
  }
  for (let k = Math.ceil(S.x0 / xs - 1e-9); k * xs <= S.x1 + 1e-9; k++) {
    const v = k * xs, x = S.X(v);
    s += `<line class="tr-gr" x1="${x}" x2="${x}" y1="${S.m.t}" y2="${S.H - S.m.b}"/><text class="tr-tl" x="${x}" y="${S.H - S.m.b + 16}" text-anchor="middle">${xf(v)}</text>`;
  }
  s += `<line class="tr-ax" x1="${S.m.l}" y1="${S.m.t - 6}" x2="${S.m.l}" y2="${S.H - S.m.b}"/><line class="tr-ax" x1="${S.m.l}" y1="${S.H - S.m.b}" x2="${S.W - S.m.r + 4}" y2="${S.H - S.m.b}"/>`;
  if (o.xl) s += `<text class="tr-axl" x="${S.W - S.m.r}" y="${S.H - 5}" text-anchor="end">${o.xl}</text>`;
  if (o.yl) s += `<text class="tr-axl" x="${S.m.l - 4}" y="${S.m.t - 12}">${o.yl}</text>`;
  return s;
}
function yMargin(y0, y1, ys, yf, min = 40) {
  let w = 0;
  for (let k = Math.ceil(y0 / ys - 1e-9); k * ys <= y1 + 1e-9; k++) w = Math.max(w, yf(k * ys).length);
  return Math.max(min, Math.ceil(w * 6.4 + 14));
}
const pts = (S, arr) => arr.map(([x, y]) => `${S.X(x)},${S.Y(y)}`).join(' ');
function patternDefs(id) {
  return `<defs><pattern id="${id}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="tr-hl" x1="0" y1="0" x2="0" y2="7"/></pattern></defs>`;
}
const svgOpen = (W, H, label) => `<svg class="tr-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">`;

/* ================= Übungs-Rahmen ================= */
function practice(stage, ctx, T, cfg) {
  const st = { n: 0, task: null, hint: 0, solved: false, last: null, view: null };
  const num = h('span', { class: 'tr-tasknum' });
  const prompt = h('div', { class: 'tr-prompt' });
  const body = h('div', { class: 'tr-body' });
  const hintsEl = h('div', { class: 'tr-hints' });
  const fb = h('div', { class: 'tr-fb', 'aria-live': 'polite' });
  const bCheck = h('button', { class: 'btn primary tr-check', type: 'button' });
  const bHint = h('button', { class: 'btn tr-hintbtn', type: 'button' });
  const bNew = h('button', { class: 'btn ghost tr-new', type: 'button' }, svgIcon(I.refresh), 'Neue Aufgabe');
  const bAsk = ctx.onAsk ? h('button', { class: 'btn ghost tr-ask', type: 'button' }, svgIcon(I.chat), 'Max fragen') : null;
  const stat = h('div', { class: 'tr-stat' });
  const card = h('section', { class: 'tr-task', 'aria-label': 'Übungsaufgabe' },
    h('div', { class: 'tr-task-top' }, h('span', { class: 'eyebrow' }, 'Übung'), num), prompt, body, hintsEl, fb,
    h('div', { class: 'tr-actions' }, bCheck, bHint, h('span', { class: 'tr-sp' }), bNew, bAsk), stat);
  stage.append(card);

  bCheck.addEventListener('click', () => (st.solved ? next() : check()));
  bHint.addEventListener('click', hint);
  bNew.addEventListener('click', next);
  bAsk?.addEventListener('click', ask);
  card.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.isComposing || e.defaultPrevented || e.shiftKey || e.altKey) return;
    if (e.target.closest('button, a, summary, textarea, select, [role="option"], [data-noenter]')) return;
    e.preventDefault();
    st.solved ? next() : check();
  });

  function labels() {
    bCheck.replaceChildren(...(st.solved ? ['Nächste Aufgabe', svgIcon(I.next)] : ['Prüfen', h('span', { class: 'k' }, '↵')]));
    const hs = st.task.hints || [];
    bHint.disabled = st.solved;
    bHint.replaceChildren(svgIcon(I.bulb), st.hint < hs.length ? `Hinweis ${st.hint + 1}` : 'Lösung zeigen');
    stat.replaceChildren(...statParts(T.id).map(p => h('span', null, p)));
  }
  function next() {
    st.task = cfg.gen(); st.n++; st.hint = 0; st.solved = false; st.last = null;
    num.textContent = 'Aufgabe ' + st.n;
    const p = (st.task.prompt || cfg.prompt)?.(st.task) ?? st.task.q;
    prompt.replaceChildren(...[].concat(p));
    body.replaceChildren(); hintsEl.replaceChildren(); fb.replaceChildren();
    st.view = (st.task.view || cfg.view)(body, st.task);
    labels();
    card.classList.remove('tr-in'); void card.offsetWidth; card.classList.add('tr-in');
  }
  function check() {
    const ans = st.view.read();
    const res = (st.task.check || cfg.check)(st.task, ans);
    if (res.incomplete) { fb.replaceChildren(fbBox('info', 'Noch nicht vollständig', [res.incomplete])); return; }
    st.last = { ans, res };
    record(T.id, res.ok, res.errs);
    st.view.mark?.(res);
    if (res.ok) {
      st.solved = true;
      st.view.lock?.();
      const after = (st.task.after || cfg.after)?.(st.task);
      fb.replaceChildren(fbBox('ok', res.title || 'Richtig!', res.msgs || [], after));
      st.view.done?.();
    } else {
      fb.replaceChildren(fbBox('bad', res.title || 'Noch nicht richtig', res.msgs || []));
    }
    labels();
  }
  function hint() {
    const hs = st.task.hints || [];
    if (st.solved) return;
    if (st.hint < hs.length) {
      hintsEl.append(h('div', { class: 'tr-hint' }, h('span', { class: 'tr-hint-n' }, 'Hinweis ' + (st.hint + 1)), h('p', null, hs[st.hint])));
      st.hint++;
    } else {
      st.solved = true;
      breakStreak(T.id);
      st.view.reveal?.(); st.view.lock?.();
      fb.replaceChildren(fbBox('info', 'Lösung', [], (st.task.solution || cfg.solution)(st.task)));
      st.view.done?.();
    }
    labels();
  }
  function ask() {
    const t = st.task;
    let q = `Ich übe im Trainer „${T.title}“.\n\nAufgabe: ${(t.askText || cfg.askText)?.(t) ?? t.q}`;
    if (st.last) {
      q += `\n\nMein Lösungsversuch: ${(t.attempt || cfg.attempt)(st.last.ans, t)}`;
      q += st.last.res.ok
        ? '\n\nDer Trainer sagt, das ist richtig. Kannst du mir kurz erklären, warum – damit ich es wirklich verstehe?'
        : `\n\nRückmeldung des Trainers: ${(st.last.res.msgs || []).join(' ')}\n\nKannst du mir erklären, wo mein Denkfehler liegt und wie ich richtig vorgehe – Schritt für Schritt?`;
    } else q += '\n\nKannst du mir helfen, die Aufgabe zu lösen? Bitte erst mit einem Denkanstoß, nicht gleich mit der kompletten Lösung.';
    ctx.onAsk(q);
  }
  next();
}

/* ---- Numerische Aufgaben (Break-even, Investition) ---- */
function numTask(o) { return { tol: 0.5, dec: 2, unit: '', label: 'Deine Antwort', traps: [], ...o }; }
const fmtAns = t => (t.unit === '€' ? eur(t.ans, t.dec) : fmt(t.ans, t.dec) + (t.unit ? ' ' + t.unit : ''));
function numView(body, task) {
  const id = uid('n');
  const inp = h('input', { class: 'field tr-numin', id, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', placeholder: '0' });
  body.append(h('div', { class: 'tr-numrow' }, h('label', { for: id, class: 'tr-lbl' }, task.label), h('div', { class: 'tr-numwrap' }, inp, task.unit ? h('span', { class: 'tr-unit' }, task.unit) : null)));
  inp.addEventListener('input', () => inp.classList.remove('tr-in-bad', 'tr-in-ok'));
  if (finePointer()) setTimeout(() => inp.isConnected && inp.focus({ preventScroll: true }), 30);
  return {
    read: () => inp.value,
    mark: r => { inp.classList.toggle('tr-in-bad', !r.ok); inp.classList.toggle('tr-in-ok', r.ok); },
    lock: () => { inp.readOnly = true; },
    reveal: () => { inp.value = fmt(task.ans, task.dec); inp.classList.add('tr-in-ok'); },
  };
}
function numCheck(task, raw) {
  const v = parseNum(raw);
  if (!Number.isFinite(v)) return { incomplete: 'Gib eine Zahl ein, z. B. 1.234,56.' };
  // Toleranz: ±0,5 % (bzw. die absolute Aufgaben-Toleranz, falls größer)
  const tol = Math.max(task.tol, Math.abs(task.ans) * 0.005) + 1e-9;
  const d = Math.abs(v - task.ans);
  if (d <= tol) return { ok: true, msgs: [d <= Math.max(task.tol, 0.5 * 10 ** -task.dec) + 1e-9 ? `${fmtAns(task)} – genau so.` : `Im Toleranzbereich (±0,5 %) – exakt sind es ${fmtAns(task)}. Achte darauf, Zwischenergebnisse nicht zu früh zu runden.`] };
  for (const [tv, msg, err] of task.traps) {
    if (!Number.isFinite(tv) || Math.abs(tv - task.ans) <= tol) continue;
    if (Math.abs(v - tv) <= Math.max(task.tol, Math.abs(tv) * 0.005)) return { ok: false, msgs: [msg], errs: [err] };
  }
  const rel = task.ans ? Math.abs((v - task.ans) / task.ans) : 1;
  const dir = v > task.ans ? 'zu hoch' : 'zu niedrig';
  return { ok: false, msgs: [rel < 0.02 ? `Knapp daneben – dein Ergebnis ist etwas ${dir}. Prüfe Rundung und Zwischenschritte.` : `Dein Ergebnis ist ${dir}. Geh den Rechenweg noch einmal Schritt für Schritt durch.`], errs: ['rechen'] };
}
const numCfg = gen => ({
  gen, view: numView, check: numCheck,
  solution: t => h('div', null, solBlock(t.steps), t.note ? h('p', null, t.note) : null),
  after: t => solBlock(t.steps),
  attempt: (a, t) => `${a || '(leer)'} ${t.unit || ''}`.trim(),
});

/* ================= 1 · Buchungssätze ================= */
const ACCS = [
  ['Aktivkonten', [['masch', 'Maschinen'], ['fuhr', 'Fuhrpark'], ['bga', 'Betriebs- und Geschäftsausstattung'], ['ganz', 'Geleistete Anzahlungen'], ['ford', 'Forderungen aus L+L'], ['zwf', 'Zweifelhafte Forderungen'], ['vst', 'Vorsteuer'], ['kasse', 'Kasse'], ['bank', 'Bank'], ['arap', 'Aktive Rechnungsabgrenzung']]],
  ['Passivkonten', [['ek', 'Eigenkapital'], ['rst', 'Sonstige Rückstellungen'], ['dar', 'Verbindlichkeiten ggü. Kreditinstituten'], ['vll', 'Verbindlichkeiten aus L+L'], ['eanz', 'Erhaltene Anzahlungen'], ['ust', 'Umsatzsteuer'], ['vfa', 'Verbindlichkeiten ggü. Finanzamt'], ['vsv', 'Verbindlichkeiten soziale Sicherheit'], ['prap', 'Passive Rechnungsabgrenzung']]],
  ['Privatkonten', [['pent', 'Privatentnahmen'], ['pein', 'Privateinlagen']]],
  ['Aufwandskonten', [['we', 'Wareneingang'], ['esk', 'Erhaltene Skonti'], ['geh', 'Gehälter'], ['sozA', 'Gesetzliche soziale Aufwendungen'], ['afa', 'Abschreibungen auf Sachanlagen'], ['miete', 'Miete'], ['vers', 'Versicherungen'], ['buero', 'Bürobedarf'], ['werb', 'Werbekosten'], ['kfz', 'Kfz-Kosten'], ['tel', 'Telefon und Internet'], ['zinsA', 'Zinsaufwendungen'], ['fverl', 'Forderungsverluste'], ['rbk', 'Rechts- und Beratungskosten']]],
  ['Ertragskonten', [['erl', 'Umsatzerlöse'], ['gsk', 'Gewährte Skonti'], ['mert', 'Mieterträge'], ['zinsE', 'Zinserträge']]],
];
const ACC = Object.fromEntries(ACCS.flatMap(([, l]) => l));
const AN = k => ACC[k] || k;
const tx = n => r2(n * 0.19), gr = n => r2(n * 1.19);

const BT = [
  () => { const n = ri(10, 90) * 100; return { t: `Wareneinkauf auf Ziel: Die Eingangsrechnung lautet über ${eur(n)} netto zzgl. 19 % USt.`, L: [['S', 'we', n], ['S', 'vst', tx(n)], ['H', 'vll', gr(n)]], tip: 'Wir kaufen auf Rechnung – es entsteht eine Schuld beim Lieferer und ein Vorsteueranspruch gegenüber dem Finanzamt.' }; },
  () => { const n = ri(5, 60) * 100; return { t: `Wir kaufen Waren für ${eur(n)} netto zzgl. 19 % USt und bezahlen sofort per Banküberweisung.`, L: [['S', 'we', n], ['S', 'vst', tx(n)], ['H', 'bank', gr(n)]], tip: 'Sofort bezahlt – es entsteht keine Verbindlichkeit, aber Vorsteuer.' }; },
  () => { const n = ri(10, 120) * 100; return { t: `Warenverkauf auf Ziel: Ausgangsrechnung über ${eur(n)} netto zzgl. 19 % USt.`, L: [['S', 'ford', gr(n)], ['H', 'erl', n], ['H', 'ust', tx(n)]], tip: 'Beim Verkauf entsteht ein Anspruch gegen den Kunden – und eine Steuerschuld gegenüber dem Finanzamt.' }; },
  () => { const n = ri(10, 200) * 10; return { t: `Barverkauf von Waren für ${eur(gr(n))} brutto (inkl. 19 % USt).`, L: [['S', 'kasse', gr(n)], ['H', 'erl', n], ['H', 'ust', tx(n)]], tip: 'Rechne aus dem Bruttobetrag den Nettobetrag heraus: brutto ÷ 1,19.' }; },
  () => { const b = gr(ri(10, 80) * 100); return { t: `Wir begleichen eine Lieferantenrechnung über ${eur(b)} per Banküberweisung.`, L: [['S', 'vll', b], ['H', 'bank', b]], tip: 'Die Schuld erlischt, das Bankguthaben sinkt. Die Steuer wurde schon beim Einkauf gebucht.' }; },
  () => { const b = gr(ri(10, 90) * 100); return { t: `Ein Kunde überweist den offenen Rechnungsbetrag von ${eur(b)} auf unser Bankkonto.`, L: [['S', 'bank', b], ['H', 'ford', b]], tip: 'Aktivtausch: Aus der Forderung wird Bankguthaben.' }; },
  () => { const n = ri(10, 100) * 100, s = pick([2, 3]), b = gr(n), sn = n * s / 100, su = tx(sn); return { t: `Ein Kunde begleicht unsere Rechnung über ${eur(b)} (brutto) unter Abzug von ${s} % Skonto per Banküberweisung.`, L: [['S', 'bank', r2(b - sn - su)], ['S', 'gsk', sn], ['S', 'ust', su], ['H', 'ford', b]], tip: 'Skonto mindert nachträglich das Entgelt – und damit auch die Umsatzsteuer.' }; },
  () => { const n = ri(10, 100) * 100, s = pick([2, 3]), b = gr(n), sn = n * s / 100, su = tx(sn); return { t: `Wir begleichen eine Eingangsrechnung über ${eur(b)} (brutto) innerhalb der Skontofrist mit ${s} % Skonto per Banküberweisung.`, L: [['S', 'vll', b], ['H', 'bank', r2(b - sn - su)], ['H', 'esk', sn], ['H', 'vst', su]], tip: 'Der Skontoabzug mindert nachträglich den Einkaufspreis – und damit auch die Vorsteuer.' }; },
  () => { const n = ri(4, 10), a = ri(2, 15) * 1000; return { t: `Jahresabschluss: Lineare Abschreibung einer Maschine (angeschafft im Januar, Anschaffungskosten ${eur(a * n)}, Nutzungsdauer ${n} Jahre).`, L: [['S', 'afa', a], ['H', 'masch', a]], tip: 'Lineare AfA = Anschaffungskosten ÷ Nutzungsdauer. Gebucht wird direkt gegen das Anlagekonto.' }; },
  () => { const m = ri(2, 11), mo = ri(3, 10) * 50, a = mo * (13 - m); return { t: `Ein Firmen-Pkw wurde im ${MON[m - 1]} angeschafft (Anschaffungskosten ${eur(mo * 72)}, Nutzungsdauer 6 Jahre). Buche die lineare Abschreibung zum 31.12. – monatsgenau (pro rata temporis).`, L: [['S', 'afa', a], ['H', 'fuhr', a]], tip: 'Im Anschaffungsjahr wird nur zeitanteilig abgeschrieben – der Anschaffungsmonat zählt voll mit.' }; },
  () => { const v = ri(10, 100) * 1000; return { t: `Wir nehmen bei unserer Hausbank ein Darlehen über ${eur(v)} auf; der Betrag wird dem Geschäftskonto gutgeschrieben.`, L: [['S', 'bank', v], ['H', 'dar', v]], tip: 'Aktiv-Passiv-Mehrung: Bankguthaben und Schulden steigen gleichermaßen.' }; },
  () => { const d = ri(20, 90) * 1000, z = ri(3, 7), T = ri(2, 10) * 1000, zi = d * z / 100; return { t: `Wir überweisen die Jahresrate für ein Bankdarlehen: Tilgung ${eur(T)} sowie ${z} % Zinsen auf die Restschuld von ${eur(d)}.`, L: [['S', 'dar', T], ['S', 'zinsA', zi], ['H', 'bank', T + zi]], tip: 'Nur die Tilgung mindert die Schuld – die Zinsen sind Aufwand.' }; },
  () => { const g = ri(30, 150) * 100, l = Math.round(g * ri(10, 18) / 1000) * 10, s = Math.round(g * 0.02) * 10; return { t: `Gehaltsabrechnung: Bruttogehälter ${eur(g)}, einbehaltene Lohn- und Kirchensteuer ${eur(l)}, Arbeitnehmeranteil zur Sozialversicherung ${eur(s)}. Die Nettogehälter werden überwiesen, die Abzüge erst im Folgemonat abgeführt.`, L: [['S', 'geh', g], ['H', 'bank', g - l - s], ['H', 'vfa', l], ['H', 'vsv', s]], tip: 'Aufwand ist das Bruttogehalt. Die Abzüge schuldest du noch Finanzamt und Sozialversicherung.' }; },
  () => { const v = ri(40, 300) * 10; return { t: `Der Arbeitgeberanteil zur Sozialversicherung beträgt in diesem Monat ${eur(v)}. Er wird erst im Folgemonat abgeführt.`, L: [['S', 'sozA', v], ['H', 'vsv', v]], tip: 'Der Arbeitgeberanteil ist zusätzlicher Personalaufwand, der noch nicht bezahlt ist.' }; },
  () => { const v = ri(2, 30) * 50, k = pick(['kasse', 'bank']); return { t: k === 'kasse' ? `Die Inhaberin entnimmt ${eur(v)} bar aus der Geschäftskasse für private Zwecke.` : `Der Inhaber überweist ${eur(v)} vom Geschäftskonto auf sein privates Girokonto.`, L: [['S', 'pent', v, ['ek']], ['H', k, v]], tip: 'Privatentnahmen mindern das Eigenkapital – gebucht wird über ein Privatkonto.' }; },
  () => { const v = ri(2, 40) * 250; return { t: `Der Inhaber zahlt ${eur(v)} aus seinem Privatvermögen auf das Geschäftskonto ein.`, L: [['S', 'bank', v], ['H', 'pein', v, ['ek']]], tip: 'Einlagen erhöhen das Eigenkapital – gebucht wird über ein Privatkonto.' }; },
  () => { const v = ri(10, 80) * 1000; return { t: `Gründung eines Einzelunternehmens: Die Gründerin zahlt ${eur(v)} als Eigenkapital auf das neue Geschäftskonto ein.`, L: [['S', 'bank', v], ['H', 'ek', v]], tip: 'Mit der Gründungseinlage entsteht das Eigenkapital des Unternehmens.' }; },
  () => { const n = ri(4, 40) * 500; return { t: `Ein Kunde leistet eine Anzahlung von ${eur(gr(n))} (inkl. 19 % USt) auf unser Bankkonto; geliefert wird erst nächsten Monat.`, L: [['S', 'bank', gr(n)], ['H', 'eanz', n], ['H', 'ust', tx(n)]], tip: 'Noch kein Umsatz – wir schulden die Lieferung. Aber: Auch Anzahlungen sind schon umsatzsteuerpflichtig.' }; },
  () => { const n = ri(4, 40) * 500; return { t: `Wir leisten eine Anzahlung auf bestellte Waren über ${eur(n)} netto zzgl. 19 % USt per Banküberweisung (Anzahlungsrechnung liegt vor).`, L: [['S', 'ganz', n], ['S', 'vst', tx(n)], ['H', 'bank', gr(n)]], tip: 'Die Ware ist noch nicht da – wir haben einen Anspruch auf Lieferung. Die Vorsteuer ist schon abziehbar.' }; },
  () => { const n = ri(2, 30) * 100; return { t: `Wir senden mangelhafte Ware im Wert von ${eur(n)} netto zzgl. 19 % USt an den Lieferer zurück (der Einkauf war auf Ziel).`, L: [['S', 'vll', gr(n)], ['H', 'we', n], ['H', 'vst', tx(n)]], tip: 'Die Rücksendung kehrt die Einkaufsbuchung anteilig um – inklusive Steuer.' }; },
  () => { const n = ri(2, 30) * 100; return { t: `Ein Kunde sendet Ware im Wert von ${eur(n)} netto zzgl. 19 % USt zurück (der Verkauf war auf Ziel).`, L: [['S', 'erl', n], ['S', 'ust', tx(n)], ['H', 'ford', gr(n)]], tip: 'Umsatz und Steuer werden korrigiert, die Forderung sinkt.' }; },
  () => { const n = ri(15, 60) * 1000; return { t: `Kauf eines Firmen-Pkw auf Ziel für ${eur(n)} netto zzgl. 19 % USt.`, L: [['S', 'fuhr', n], ['S', 'vst', tx(n)], ['H', 'vll', gr(n)]], tip: 'Der Pkw bleibt mehrere Jahre im Betrieb – er wird aktiviert, nicht als Aufwand gebucht.' }; },
  () => { const n = ri(12, 80) * 100; return { t: `Wir kaufen neue Büromöbel für ${eur(n)} netto zzgl. 19 % USt und zahlen per Banküberweisung.`, L: [['S', 'bga', n], ['S', 'vst', tx(n)], ['H', 'bank', gr(n)]], tip: 'Büromöbel werden langfristig genutzt – sie gehören ins Anlagevermögen.' }; },
  () => { const v = ri(8, 40) * 100; return { t: `Wir überweisen die Monatsmiete für unsere Lagerhalle über ${eur(v)} (umsatzsteuerfrei vermietet).`, L: [['S', 'miete', v], ['H', 'bank', v]], tip: 'Ohne Umsatzsteuer auf der Rechnung gibt es auch keine Vorsteuer.' }; },
  () => { const m = ri(3, 11), x = 12 * ri(10, 60) * 10, v = x * (m - 1) / 12; return { t: `Am 1. ${MON[m - 1]} haben wir die Betriebshaftpflicht für 12 Monate im Voraus überwiesen (${eur(x)}, als Aufwand gebucht). Buche die zeitliche Abgrenzung zum 31.12.`, L: [['S', 'arap', v], ['H', 'vers', v]], tip: 'Zahlung im alten Jahr, Aufwand teilweise erst im neuen Jahr. Wie viele Monate betreffen das Folgejahr?' }; },
  () => { const m = ri(8, 12), x = 6 * ri(3, 20) * 100, v = x * (m - 7) / 6; return { t: `Ein Mieter hat uns am 1. ${MON[m - 1]} die Miete für 6 Monate im Voraus überwiesen (${eur(x)}, als Mietertrag gebucht). Buche die zeitliche Abgrenzung zum 31.12.`, L: [['S', 'mert', v], ['H', 'prap', v]], tip: 'Geld im alten Jahr erhalten, Ertrag teilweise erst im neuen Jahr verdient. Wie viele Monate betreffen das Folgejahr?' }; },
  () => { const v = ri(4, 60) * 500; return { t: `Zum Bilanzstichtag läuft ein Rechtsstreit. Die voraussichtlichen Prozesskosten werden auf ${eur(v)} geschätzt.`, L: [['S', 'rbk', v], ['H', 'rst', v]], tip: 'Die Verpflichtung ist wahrscheinlich, ihre Höhe aber noch ungewiss – der Aufwand gehört ins alte Jahr.' }; },
  () => { const n = ri(5, 60) * 100; return { t: `Das Insolvenzverfahren über das Vermögen eines Kunden wurde mangels Masse abgelehnt. Unsere Forderung über ${eur(gr(n))} (brutto) ist endgültig uneinbringlich.`, L: [['S', 'fverl', n], ['S', 'ust', tx(n)], ['H', 'ford', gr(n)]], tip: 'Fällt die Forderung endgültig aus, wird auch die Umsatzsteuer berichtigt (§ 17 UStG).' }; },
  () => { const v = ri(5, 90) * 10; return { t: `Die Bank schreibt uns ${eur(v)} Zinsen auf dem Geschäftskonto gut.`, L: [['S', 'bank', v], ['H', 'zinsE', v]], tip: 'Zinsen auf Guthaben sind Ertrag – und umsatzsteuerfrei.' }; },
  () => { const n = ri(2, 40) * 10; return { t: `Kauf von Büromaterial für ${eur(n)} netto zzgl. 19 % USt, bar bezahlt.`, L: [['S', 'buero', n], ['S', 'vst', tx(n)], ['H', 'kasse', gr(n)]], tip: 'Verbrauchsmaterial ist sofort Aufwand.' }; },
  () => { const n = ri(3, 30) * 100; return { t: `Wir bezahlen eine Werbeanzeige über ${eur(n)} netto zzgl. 19 % USt per Banküberweisung.`, L: [['S', 'werb', n], ['S', 'vst', tx(n)], ['H', 'bank', gr(n)]], tip: 'Werbung ist Aufwand; die Rechnung enthält Vorsteuer.' }; },
  () => { const n = ri(4, 30) * 5; return { t: `Die Telefon- und Internetrechnung über ${eur(n)} netto zzgl. 19 % USt wird per Lastschrift vom Bankkonto abgebucht.`, L: [['S', 'tel', n], ['S', 'vst', tx(n)], ['H', 'bank', gr(n)]], tip: 'Kommunikationskosten sind Aufwand; die Rechnung enthält Vorsteuer.' }; },
  () => { const n = ri(4, 15) * 10; return { t: `Tankquittung für den Firmenwagen über ${eur(gr(n))} brutto (inkl. 19 % USt), bar bezahlt.`, L: [['S', 'kfz', n], ['S', 'vst', tx(n)], ['H', 'kasse', gr(n)]], tip: 'Rechne den Nettobetrag aus dem Brutto heraus: brutto ÷ 1,19.' }; },
];

function combo(onPick) {
  const lid = uid('cb');
  const inp = h('input', { class: 'field tr-cb-in', type: 'text', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': lid, 'aria-autocomplete': 'list', 'aria-label': 'Konto suchen und wählen', placeholder: 'Konto wählen…', autocomplete: 'off', spellcheck: 'false' });
  const lb = h('div', { class: 'tr-cb-list', id: lid, role: 'listbox' });
  const el = h('div', { class: 'tr-cb' }, inp, lb);
  let val = null, opts = [], act = -1, open = false;
  const norm = s => s.toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
  lb.addEventListener('mousedown', e => e.preventDefault());
  function render(q) {
    lb.replaceChildren(); opts = [];
    const words = norm(q.trim()).split(/\s+/).filter(Boolean);
    for (const [g, list] of ACCS) {
      const m = list.filter(([, n]) => words.every(w => norm(n).includes(w)));
      if (!m.length) continue;
      lb.append(h('div', { class: 'tr-cb-g', role: 'presentation' }, g));
      for (const [k, n] of m) {
        const o = h('div', { class: 'tr-cb-o', role: 'option', id: uid('o'), 'aria-selected': 'false', 'data-k': k }, n);
        o.addEventListener('click', () => { choose(k); close(); });
        lb.append(o); opts.push(o);
      }
    }
    if (!opts.length) lb.append(h('div', { class: 'tr-cb-empty' }, 'Kein Konto gefunden'));
    setAct(words.length && opts.length ? 0 : opts.findIndex(o => o.dataset.k === val));
  }
  function setAct(i) {
    act = i;
    opts.forEach((o, j) => { o.classList.toggle('on', j === i); o.setAttribute('aria-selected', j === i); });
    if (i >= 0) { inp.setAttribute('aria-activedescendant', opts[i].id); opts[i].scrollIntoView?.({ block: 'nearest' }); } else inp.removeAttribute('aria-activedescendant');
  }
  function openList() { if (open || inp.disabled) return; open = true; el.classList.add('open'); inp.setAttribute('aria-expanded', 'true'); }
  function close() { open = false; el.classList.remove('open'); inp.setAttribute('aria-expanded', 'false'); }
  function choose(k) { val = k; inp.value = k ? AN(k) : ''; onPick(k); }
  inp.addEventListener('focus', () => { render(''); openList(); requestAnimationFrame(() => inp.select()); });
  inp.addEventListener('input', () => { render(inp.value); openList(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!open) { render(''); openList(); }
      if (opts.length) setAct(e.key === 'ArrowDown' ? Math.min(act + 1, opts.length - 1) : Math.max(act - 1, 0));
    } else if (e.key === 'Enter' && open) {
      const k = act >= 0 ? opts[act].dataset.k : opts.length === 1 ? opts[0].dataset.k : null;
      if (k) { e.preventDefault(); choose(k); close(); }
    } else if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'Tab' && open && act >= 0 && inp.value.trim()) { choose(opts[act].dataset.k); close(); }
  });
  inp.addEventListener('blur', () => {
    close();
    const q = norm(inp.value.trim());
    if (!q) { if (val) choose(null); return; }
    const hit = ACCS.flatMap(([, l]) => l).find(([, n]) => norm(n) === q);
    if (hit) { if (hit[0] !== val) choose(hit[0]); else inp.value = AN(val); } else inp.value = val ? AN(val) : '';
  });
  return { el, get value() { return val; }, set: k => choose(k), disable(b) { inp.disabled = b; }, focus: () => inp.focus() };
}

function buchView(body, task) {
  const rows = [];
  let locked = false;
  const list = h('div', { class: 'tr-lines' });
  const sumEl = h('div', { class: 'tr-sum', 'aria-live': 'polite' });
  const addBtn = h('button', { class: 'btn sm', type: 'button' }, svgIcon(I.plus), 'Zeile');
  addBtn.addEventListener('click', () => { const r = addRow(rows.filter(x => x.side === 'S').length > rows.filter(x => x.side === 'H').length ? 'H' : 'S'); r.combo.focus(); });
  body.append(h('div', { class: 'tr-lines-head', 'aria-hidden': 'true' }, h('span', null, 'Seite'), h('span', null, 'Konto'), h('span', null, 'Betrag'), h('span')), list, h('div', { class: 'tr-lines-foot' }, addBtn, sumEl));
  function clearMarks() { rows.forEach(r => { r.el.classList.remove('tr-ok', 'tr-bad'); r.note.textContent = ''; }); }
  function addRow(side, acc, amt) {
    const r = { side };
    const bS = h('button', { type: 'button', class: 'tr-sh', title: 'Soll' }, 'S');
    const bH = h('button', { type: 'button', class: 'tr-sh', title: 'Haben' }, 'H');
    const setSide = s => { r.side = s; bS.setAttribute('aria-pressed', s === 'S'); bH.setAttribute('aria-pressed', s === 'H'); r.el?.setAttribute('data-side', s); clearMarks(); upd(); };
    bS.addEventListener('click', () => !locked && setSide('S'));
    bH.addEventListener('click', () => !locked && setSide('H'));
    r.combo = combo(() => clearMarks());
    r.amt = h('input', { class: 'field tr-amt', type: 'text', inputmode: 'decimal', placeholder: '0,00', 'aria-label': 'Betrag in Euro', autocomplete: 'off' });
    r.amt.addEventListener('input', () => { clearMarks(); upd(); });
    r.amt.addEventListener('blur', () => { const v = parseNum(r.amt.value); if (r.amt.value.trim() && Number.isFinite(v)) r.amt.value = fmt(v); });
    r.del = h('button', { type: 'button', class: 'iconbtn tr-del', 'aria-label': 'Zeile entfernen' }, svgIcon(I.x));
    r.del.addEventListener('click', () => { if (locked || rows.length <= 1) return; rows.splice(rows.indexOf(r), 1); r.el.remove(); clearMarks(); upd(); });
    r.note = h('div', { class: 'tr-note' });
    r.el = h('div', { class: 'tr-row' }, h('div', { class: 'tr-seg2', role: 'group', 'aria-label': 'Soll oder Haben' }, bS, bH), r.combo.el, h('div', { class: 'tr-amtw' }, r.amt, h('span', null, '€')), r.del, r.note);
    rows.push(r); list.append(r.el); setSide(side);
    if (acc) r.combo.set(acc);
    if (amt != null) { r.amt.value = fmt(amt); upd(); }
    return r;
  }
  function upd() {
    const s = { S: 0, H: 0 };
    rows.forEach(r => { const v = parseNum(r.amt.value); if (Number.isFinite(v)) s[r.side] += v; });
    const d = r2(s.S - s.H);
    sumEl.replaceChildren(h('span', null, 'Soll ', h('b', null, eur(s.S))), h('span', null, 'Haben ', h('b', null, eur(s.H))),
      h('span', { class: 'tr-bal' + (d === 0 && s.S ? ' on' : '') }, s.S || s.H ? (d === 0 ? 'ausgeglichen' : 'Differenz ' + eur(Math.abs(d))) : '–'));
  }
  addRow('S'); addRow('H');
  return {
    read: () => rows.map(r => ({ side: r.side, acc: r.combo.value, raw: r.amt.value, amt: parseNum(r.amt.value), row: r })),
    mark: res => { clearMarks(); for (const [r, note] of res.marks || []) { r.el.classList.add(note ? 'tr-bad' : 'tr-ok'); r.note.textContent = note || ''; } },
    lock: () => { locked = true; addBtn.disabled = true; rows.forEach(r => { r.combo.disable(true); r.amt.readOnly = true; r.del.disabled = true; r.el.querySelectorAll('.tr-sh').forEach(b => (b.disabled = true)); }); },
    reveal: () => { rows.splice(0).forEach(r => r.el.remove()); task.L.forEach(([s, a, v]) => addRow(s, a, v).el.classList.add('tr-ok')); },
  };
}

function buchCheck(task, input) {
  const used = input.filter(r => r.acc || r.raw.trim());
  if (!used.some(r => r.side === 'S') || !used.some(r => r.side === 'H')) return { incomplete: 'Ein Buchungssatz braucht mindestens eine Soll- und eine Haben-Zeile.' };
  for (const r of used) {
    if (!r.acc) return { incomplete: 'In einer Zeile fehlt noch das Konto.' };
    if (!(r.amt > 0)) return { incomplete: `Gib für „${AN(r.acc)}“ einen positiven Betrag ein.` };
  }
  const opp = s => (s === 'S' ? 'H' : 'S'), sideN = s => (s === 'S' ? 'Soll' : 'Haben');
  const alt = {};
  for (const [s, a, , al] of task.L) for (const x of al || []) alt[s + '|' + x] = a;
  const U = new Map(), Sol = new Map(), rowsBy = new Map();
  for (const r of used) {
    let acc = r.acc;
    const ak = alt[r.side + '|' + acc];
    if (ak && !used.some(o => o.side === r.side && o.acc === ak)) acc = ak;
    const k = r.side + '|' + acc;
    U.set(k, r2((U.get(k) || 0) + r.amt));
    if (!rowsBy.has(k)) rowsBy.set(k, []);
    rowsBy.get(k).push(r.row);
  }
  for (const [s, a, v] of task.L) Sol.set(s + '|' + a, r2((Sol.get(s + '|' + a) || 0) + v));
  const msgs = [], errs = [], bad = new Map();
  const flag = (k, note, err) => { bad.set(k, note); errs.push(err); };
  const sp = k => k.split('|');
  for (const k of [...Sol.keys()]) if (U.has(k) && near(U.get(k), Sol.get(k))) { U.delete(k); Sol.delete(k); }
  for (const k of [...Sol.keys()]) {
    const [s, a] = sp(k), o = opp(s) + '|' + a;
    if (U.has(o) && near(U.get(o), Sol.get(k))) { msgs.push(`${AN(a)}: Soll und Haben vertauscht.`); flag(o, 'Soll und Haben vertauscht', 'vertauscht'); U.delete(o); Sol.delete(k); }
  }
  for (const k of [...Sol.keys()]) {
    if (!U.has(k)) continue;
    const a = sp(k)[1], u = U.get(k), w = Sol.get(k);
    const det = near(u, w * 1.19, 0.02) ? ' – das ist der Bruttobetrag, hier gehört der Nettobetrag hin' : near(u * 1.19, w, 0.02) ? ' – das ist der Nettobetrag, hier gehört der Bruttobetrag hin' : '';
    msgs.push(`${AN(a)}: Konto stimmt, Betrag falsch${det}.`); flag(k, 'Konto stimmt, Betrag falsch', 'betrag'); U.delete(k); Sol.delete(k);
  }
  for (const k of [...Sol.keys()]) {
    const s = sp(k)[0];
    for (const [uk, uv] of U) {
      const [us, ua] = sp(uk);
      if (us === s && near(uv, Sol.get(k))) { msgs.push(`${AN(ua)} (${sideN(s)}): Betrag stimmt, aber falsches Konto.`); flag(uk, 'Betrag stimmt, falsches Konto', 'konto'); U.delete(uk); Sol.delete(k); break; }
    }
  }
  for (const k of [...Sol.keys()]) {
    const [s, a] = sp(k), o = opp(s) + '|' + a;
    if (U.has(o)) { msgs.push(`${AN(a)}: falsche Seite und falscher Betrag.`); flag(o, 'Seite und Betrag falsch', 'vertauscht'); U.delete(o); Sol.delete(k); }
  }
  for (const k of Sol.keys()) {
    const [s, a] = sp(k);
    if (a === 'vst' || a === 'ust') { msgs.push(`Steuer vergessen: Die ${AN(a)} fehlt in deinem Buchungssatz.`); errs.push('steuer'); }
    else { msgs.push(`Buchung unvollständig: Im ${sideN(s)} fehlt noch ein Konto.`); errs.push('fehlt'); }
  }
  for (const k of U.keys()) { const [s, a] = sp(k); msgs.push(`${AN(a)} im ${sideN(s)}: überflüssige Zeile.`); flag(k, 'überflüssige Zeile', 'extra'); }
  const tS = r2(sum(used.filter(r => r.side === 'S').map(r => r.amt))), tH = r2(sum(used.filter(r => r.side === 'H').map(r => r.amt)));
  if (!near(tS, tH)) { msgs.push(`Soll (${eur(tS)}) und Haben (${eur(tH)}) sind nicht ausgeglichen.`); errs.push('summe'); }
  const marks = [];
  for (const [k, rs] of rowsBy) for (const r of rs) marks.push([r, bad.get(k) || null]);
  if (!msgs.length) return { ok: true, msgs: [pick(['Sauber gebucht.', 'Genau so steht es im Grundbuch.', 'Soll und Haben stimmen exakt.'])], marks };
  return { ok: false, title: msgs.length === 1 ? 'Fast – ein Fehler' : `Noch ${msgs.length} Punkte offen`, msgs, errs, marks };
}

function buchSolution(task) {
  const S = task.L.filter(l => l[0] === 'S'), H = task.L.filter(l => l[0] === 'H');
  const bs = h('div', { class: 'tr-bs' },
    S.map(l => h('div', { class: 'tr-bs-r' }, h('span', null, AN(l[1])), h('b', null, eur(l[2])))),
    H.map((l, i) => h('div', { class: 'tr-bs-r tr-bs-h' }, h('span', null, i === 0 ? h('i', null, 'an ') : null, AN(l[1])), h('b', null, eur(l[2])))));
  const ctr = side => { const o = task.L.filter(l => l[0] !== side); return o.length === 1 ? AN(o[0][1]) : 'Diverse'; };
  const tks = h('div', { class: 'tr-tks tr-tks-mini' }, task.L.map(([s, a, v]) => tkonto(AN(a), s === 'S' ? [[ctr('S'), fmt(v)]] : [], s === 'H' ? [[ctr('H'), fmt(v)]] : [])));
  return h('div', { class: 'tr-after' }, h('div', { class: 'tr-sub' }, 'Buchungssatz'), bs, h('div', { class: 'tr-sub' }, 'T-Konten'), tks, h('p', { class: 'tr-why' }, task.tip));
}

let _lastBT = -1;
function buchGen() {
  let i; do i = ri(0, BT.length - 1); while (i === _lastBT); _lastBT = i;
  const t = BT[i]();
  const nS = t.L.filter(l => l[0] === 'S'), nH = t.L.length - nS.length;
  t.hints = [`${t.tip} Es sind ${t.L.length} Konten betroffen – ${nS.length} im Soll, ${nH} im Haben.`,
    `Im Soll stehen: ${nS.map(l => AN(l[1])).join(', ')}. Überleg jetzt, was im Haben gegengebucht wird – und achte auf netto/brutto.`];
  return t;
}
const BUCH = {
  explain: `<p>Jeder Geschäftsvorfall verändert mindestens zwei Konten. Der <b>Buchungssatz</b> nennt zuerst das Soll-Konto, dann – nach „an“ – das Haben-Konto: <code>Soll an Haben Betrag</code>.</p>
  <ul><li><b>Aktivkonten</b> (Vermögen): Zugang im Soll, Abgang im Haben.</li><li><b>Passivkonten</b> (Kapital, Schulden): Zugang im Haben, Abgang im Soll.</li><li><b>Aufwand</b> steht im Soll, <b>Ertrag</b> im Haben.</li><li>Vorsteuer (Einkauf) ist eine Forderung ans Finanzamt, Umsatzsteuer (Verkauf) eine Schuld. Steuersatz hier: 19 %.</li></ul>
  <p class="tr-mute">Waren werden aufwandsorientiert über „Wareneingang“ erfasst. Summe Soll muss immer gleich Summe Haben sein.</p>`,
  practice: (stage, ctx, T) => practice(stage, ctx, T, {
    gen: buchGen, prompt: t => h('p', null, t.t), view: buchView, check: buchCheck,
    solution: buchSolution, after: buchSolution, askText: t => t.t,
    attempt: a => a.filter(r => r.acc || r.raw.trim()).map(r => `${r.side === 'S' ? 'Soll' : 'Haben'} ${r.acc ? AN(r.acc) : '?'} ${r.raw || '?'} €`).join('; ') || '(noch nichts eingetragen)',
  }),
};

/* ================= 2 · T-Konten & Abschluss ================= */
const TKA = { masch: ['Maschinen', 'A'], bga: ['BGA', 'A'], ford: ['Forderungen aus L+L', 'A'], kasse: ['Kasse', 'A'], bank: ['Bank', 'A'], ek: ['Eigenkapital', 'P'], dar: ['Darlehen', 'P'], vll: ['Verbindlichkeiten aus L+L', 'P'] };
const TKV = [
  ['bank', 'ford', 'Ein Kunde begleicht eine offene Rechnung per Banküberweisung.', b => step(b.ford * 0.6, 500)],
  ['bank', 'kasse', 'Bareinzahlung aus der Kasse auf das Bankkonto.', b => step(b.kasse * 0.7, 100)],
  ['kasse', 'bank', 'Barabhebung vom Bankkonto für die Kasse.', b => step(Math.min(b.bank * 0.3, 3000), 100)],
  ['bga', 'vll', 'Kauf von Büromöbeln auf Ziel.', () => ri(2, 16) * 500],
  ['masch', 'bank', 'Kauf einer Maschine gegen Banküberweisung.', b => step(b.bank * 0.5, 1000)],
  ['masch', 'vll', 'Kauf einer Maschine auf Ziel.', () => ri(5, 25) * 1000],
  ['dar', 'bank', 'Tilgung eines Darlehens per Banküberweisung.', b => step(Math.min(b.dar, b.bank) * 0.5, 1000)],
  ['vll', 'bank', 'Wir begleichen eine Lieferantenrechnung per Banküberweisung.', b => step(Math.min(b.vll, b.bank) * 0.6, 500)],
  ['vll', 'dar', 'Eine Lieferantenverbindlichkeit wird in ein langfristiges Darlehen umgewandelt.', b => step(b.vll * 0.6, 1000)],
  ['bank', 'dar', 'Aufnahme eines Darlehens; die Bank schreibt den Betrag gut.', () => ri(5, 30) * 1000],
  ['kasse', 'ford', 'Ein Kunde bezahlt eine Rechnung bar.', b => step(Math.min(b.ford * 0.3, 3000), 100)],
];
const tkKind = (s, hb) => (TKA[s][1] === 'A' ? (TKA[hb][1] === 'A' ? 'Aktivtausch' : 'Aktiv-Passiv-Mehrung') : TKA[hb][1] === 'P' ? 'Passivtausch' : 'Aktiv-Passiv-Minderung');
function tkPost(bal, s, hb, v) { bal[s] += TKA[s][1] === 'A' ? v : -v; bal[hb] += TKA[hb][1] === 'A' ? -v : v; }
function tkGen() {
  for (let tries = 0; tries < 400; tries++) {
    const extra = shuffle(['masch', 'bga', 'ford', 'kasse', 'dar', 'vll']).slice(0, ri(3, 4));
    const accs = ['masch', 'bga', 'ford', 'kasse', 'bank', 'ek', 'dar', 'vll'].filter(k => k === 'bank' || k === 'ek' || extra.includes(k));
    const init = { masch: ri(20, 90) * 1000, bga: ri(5, 30) * 1000, ford: ri(6, 30) * 1000, kasse: ri(2, 10) * 500, bank: ri(10, 50) * 1000, dar: ri(10, 60) * 1000, vll: ri(4, 20) * 1000 };
    const ab = {};
    accs.forEach(k => k !== 'ek' && (ab[k] = init[k]));
    const A = sum(accs.filter(k => TKA[k][1] === 'A').map(k => ab[k])), FK = sum(accs.filter(k => k === 'dar' || k === 'vll').map(k => ab[k]));
    if (A - FK < 0.25 * A) continue;
    ab.ek = A - FK;
    const bal = { ...ab }, V = [];
    const n = ri(4, 5);
    for (const [s, hb, t, f] of shuffle(TKV)) {
      if (V.length >= n) break;
      if (!accs.includes(s) || !accs.includes(hb)) continue;
      const v = f(bal);
      if (!(v > 0)) continue;
      tkPost(bal, s, hb, v); V.push({ s, h: hb, t, v });
    }
    if (V.length < 4 || Object.values(bal).some(x => x < 0)) continue;
    return { accs, ab, V, sb: bal };
  }
  return tkGen();
}
function ebTable(task, vals, title) {
  const side = t => task.accs.filter(k => TKA[k][1] === t);
  const col = (t, lab) => h('div', { class: 'tr-eb-c' }, h('div', { class: 'tr-eb-h' }, lab), side(t).map(k => h('div', { class: 'tr-eb-r' }, h('span', null, TKA[k][0]), h('span', null, fmt(vals[k], 0)))),
    h('div', { class: 'tr-eb-r tr-eb-s' }, h('span', null, 'Summe'), h('span', null, fmt(sum(side(t).map(k => vals[k])), 0))));
  return h('div', { class: 'tr-eb' }, h('div', { class: 'tr-sub' }, title), h('div', { class: 'tr-eb-g' }, col('A', 'Aktiva'), col('P', 'Passiva')));
}
function tkView(body, task) {
  const sel = task.V.map((v, i) => {
    const mk = lab => {
      const s = h('select', { class: 'field tr-sel', 'aria-label': `Vorfall ${i + 1}: ${lab}-Konto` }, h('option', { value: '' }, lab + '…'), task.accs.map(k => h('option', { value: k }, TKA[k][0])));
      s.addEventListener('change', () => { clear(); draw(); });
      return s;
    };
    const sS = mk('Soll'), sH = mk('Haben'), note = h('div', { class: 'tr-note' });
    const li = h('li', { class: 'tr-vf-i' }, h('div', { class: 'tr-vf-t' }, h('span', { class: 'tr-vf-n' }, `(${i + 1})`), h('span', null, v.t), h('b', null, eur0(v.v))), h('div', { class: 'tr-vf-sel' }, sS, h('span', { class: 'tr-an' }, 'an'), sH), note);
    return { sS, sH, li, note };
  });
  const tk = {};
  const grid = h('div', { class: 'tr-tks' });
  for (const k of task.accs) {
    const L = h('div', { class: 'tr-tk-c' }), R = h('div', { class: 'tr-tk-c' }), note = h('div', { class: 'tr-note' });
    const sb = h('input', { class: 'field tr-sb', type: 'text', inputmode: 'decimal', placeholder: 'Betrag', autocomplete: 'off', 'aria-label': `Schlussbestand ${TKA[k][0]}` });
    sb.addEventListener('input', clear);
    const el = h('div', { class: 'tr-tk tr-tk-live' }, h('div', { class: 'tr-tk-h' }, h('span', null, 'S'), h('b', { title: TKA[k][0] }, TKA[k][0]), h('span', null, 'H')), h('div', { class: 'tr-tk-b' }, L, R), h('label', { class: 'tr-tk-sb' }, h('span', null, 'SB'), sb, h('span', { class: 'tr-mute' }, '€')), note);
    tk[k] = { L, R, sb, el, note };
    grid.append(el);
  }
  let seen = new Set();
  function draw() {
    const now = new Set();
    for (const k of task.accs) {
      const isA = TKA[k][1] === 'A', L = [], R = [];
      (isA ? L : R).push(['AB', fmt(task.ab[k], 0), 'tr-ab']);
      sel.forEach((s, i) => {
        if (s.sS.value === k) { const key = i + 'S' + k; now.add(key); L.push([`(${i + 1})`, fmt(task.V[i].v, 0), seen.has(key) ? '' : 'tr-new']); }
        if (s.sH.value === k) { const key = i + 'H' + k; now.add(key); R.push([`(${i + 1})`, fmt(task.V[i].v, 0), seen.has(key) ? '' : 'tr-new']); }
      });
      const row = ([l, v, c]) => h('div', { class: 'tr-tk-r' + (c ? ' ' + c : '') }, h('span', null, l), h('span', null, v));
      tk[k].L.replaceChildren(...L.map(row)); tk[k].R.replaceChildren(...R.map(row));
    }
    seen = now;
  }
  function clear() { sel.forEach(s => { s.li.classList.remove('tr-ok', 'tr-bad'); s.note.textContent = ''; }); Object.values(tk).forEach(t => { t.el.classList.remove('tr-ok', 'tr-bad'); t.note.textContent = ''; }); }
  body.append(ebTable(task, task.ab, 'Eröffnungsbilanz (€)'), h('div', { class: 'tr-sub' }, 'Geschäftsvorfälle – wähle Soll- und Haben-Konto'), h('ol', { class: 'tr-vf' }, sel.map(s => s.li)),
    h('div', { class: 'tr-sub' }, 'T-Konten – trag die Schlussbestände (SB) ein'), grid);
  draw();
  return {
    read: () => ({ sel: sel.map(s => [s.sS.value, s.sH.value]), sb: Object.fromEntries(task.accs.map(k => [k, tk[k].sb.value])) }),
    mark: res => {
      clear();
      (res.vf || []).forEach((m, i) => { sel[i].li.classList.add(m ? 'tr-bad' : 'tr-ok'); sel[i].note.textContent = m || ''; });
      for (const [k, m] of Object.entries(res.acc || {})) { tk[k].el.classList.add(m ? 'tr-bad' : 'tr-ok'); tk[k].note.textContent = m || ''; }
    },
    lock: () => { sel.forEach(s => { s.sS.disabled = s.sH.disabled = true; }); Object.values(tk).forEach(t => (t.sb.readOnly = true)); },
    reveal: () => { sel.forEach((s, i) => { s.sS.value = task.V[i].s; s.sH.value = task.V[i].h; }); task.accs.forEach(k => (tk[k].sb.value = fmt(task.sb[k], 0))); draw(); clear(); },
  };
}
function tkCheck(task, a) {
  if (a.sel.some(([s, x]) => !s || !x)) return { incomplete: 'Wähle für jeden Geschäftsvorfall ein Soll- und ein Haben-Konto.' };
  if (task.accs.some(k => !Number.isFinite(parseNum(a.sb[k])))) return { incomplete: 'Trage für jedes T-Konto den Schlussbestand ein.' };
  const msgs = [], errs = [], vf = [], acc = {};
  const ub = { ...task.ab };
  a.sel.forEach(([s, x], i) => {
    const v = task.V[i];
    if (s !== x) tkPost(ub, s, x, v.v);
    let m = null;
    if (s === v.s && x === v.h) m = null;
    else if (s === v.h && x === v.s) { m = 'Soll und Haben vertauscht'; errs.push('vertauscht'); }
    else if (s === v.s) { m = 'Haben-Konto falsch'; errs.push('konto'); }
    else if (x === v.h) { m = 'Soll-Konto falsch'; errs.push('konto'); }
    else { m = 'Beide Konten falsch'; errs.push('konto'); }
    vf.push(m); if (m) msgs.push(`Vorfall (${i + 1}): ${m}.`);
  });
  for (const k of task.accs) {
    const v = parseNum(a.sb[k]), want = task.sb[k], isA = TKA[k][1] === 'A';
    if (near(v, want, 0.5)) { acc[k] = null; continue; }
    if (near(v, ub[k], 0.5)) { acc[k] = 'Folgefehler'; msgs.push(`SB ${TKA[k][0]}: passt zu deinen Buchungen, ist wegen einer Fehlbuchung aber nicht korrekt (Folgefehler).`); errs.push('folge'); continue; }
    acc[k] = 'SB falsch';
    msgs.push(near(v, 2 * task.ab[k] - want, 0.5) ? `SB ${TKA[k][0]}: Zu- und Abgänge vertauscht – bei ${isA ? 'Aktivkonten stehen Zugänge im Soll' : 'Passivkonten stehen Zugänge im Haben'}.` : `SB ${TKA[k][0]}: falsch berechnet (SB = AB + Zugänge − Abgänge).`);
    errs.push('sb');
  }
  return msgs.length ? { ok: false, title: `Noch ${msgs.length} Fehler`, msgs, errs, vf, acc } : { ok: true, msgs: ['Alle Vorfälle korrekt gebucht und alle Konten richtig abgeschlossen.'], vf, acc };
}
const tkSolLines = task => [...task.V.map((v, i) => `(${i + 1}) ${TKA[v.s][0]} an ${TKA[v.h][0]}  ${eur0(v.v)}  · ${tkKind(v.s, v.h)}`), '', ...task.accs.map(k => `SB ${TKA[k][0]}: ${eur0(task.sb[k])}`)];
const TKON = {
  explain: `<p>Zu Jahresbeginn werden die Bestände aus der <b>Eröffnungsbilanz</b> als Anfangsbestand (AB) in die T-Konten übernommen: Aktivkonten im Soll, Passivkonten im Haben.</p>
  <ul><li>Jeder Vorfall wird doppelt gebucht: einmal im Soll, einmal im Haben.</li><li><b>Schlussbestand</b> (SB) = AB + Zugänge − Abgänge. Er steht auf der wertmäßig kleineren Seite und gleicht das Konto aus.</li><li>Die Schlussbestände ergeben die Schlussbilanz – Aktiva = Passiva.</li></ul>`,
  practice: (stage, ctx, T) => practice(stage, ctx, T, {
    gen: () => { const t = tkGen(); t.hints = ['Aktivkonten: Zugang im Soll, Abgang im Haben. Passivkonten: umgekehrt. Frag dich bei jedem Vorfall: Welche zwei Bestände ändern sich – und nehmen sie zu oder ab?', 'Art der Vorfälle: ' + t.V.map((v, i) => `(${i + 1}) ${tkKind(v.s, v.h)}`).join(', ') + '.']; return t; },
    prompt: () => h('p', null, 'Buche die Geschäftsvorfälle in die T-Konten und schließe die Konten ab. Umsatzsteuer bleibt hier unberücksichtigt.'),
    view: tkView, check: tkCheck,
    solution: t => h('div', null, solBlock(tkSolLines(t)), ebTable(t, t.sb, 'Schlussbilanz (€)')),
    after: t => ebTable(t, t.sb, 'Schlussbilanz (€)'),
    askText: t => `Eröffnungsbilanz: ${t.accs.map(k => `${TKA[k][0]} ${eur0(t.ab[k])}`).join(', ')}. Vorfälle: ${t.V.map((v, i) => `(${i + 1}) ${v.t} ${eur0(v.v)}`).join(' ')} Gesucht: Buchungssätze und Schlussbestände.`,
    attempt: a => a.sel.map(([s, x], i) => `(${i + 1}) ${TKA[s]?.[0] || '?'} an ${TKA[x]?.[0] || '?'}`).join(', ') + '; SB: ' + Object.entries(a.sb).map(([k, v]) => `${TKA[k][0]} ${v || '?'}`).join(', '),
  }),
};

/* ================= 3 · Break-even & Deckungsbeitrag ================= */
export const be = {
  db: (p, kv) => p - kv,
  bep: (kf, p, kv) => (p - kv > 0 ? kf / (p - kv) : Infinity),
  profit: (kf, p, kv, x) => (p - kv) * x - kf,
  safety: (x, xs) => (x > 0 ? (x - xs) / x : NaN),
};
const BE_XMAX = 5000;
function beSvg(W, P) {
  const H = Math.round(clamp(W * 0.56, 240, 380));
  const K = x => P.kf + P.kv * x, E = x => P.p * x;
  const top = Math.max(K(BE_XMAX), E(BE_XMAX), 1), ys = niceStep(top, H < 300 ? 4 : 5), y1 = Math.ceil((top * 1.02) / ys) * ys;
  const m = { l: yMargin(0, y1, ys, fmtK), r: 16, t: 30, b: 38 };
  const S = scale(W, H, m, 0, BE_XMAX, 0, y1);
  const pid = uid('p'), xs = be.bep(P.kf, P.p, P.kv);
  let s = svgOpen(W, H, 'Break-even-Diagramm: Erlös- und Kostengerade') + patternDefs(pid) + axesSvg(S, { ys, xl: 'Menge x (Stück)', yl: '€' });
  if (xs < BE_XMAX) {
    s += `<polygon class="tr-hatch" fill="url(#${pid})" points="${pts(S, [[0, K(0)], [xs, K(xs)], [0, 0]])}"/>`;
    s += `<polygon class="tr-a1" points="${pts(S, [[xs, E(xs)], [BE_XMAX, E(BE_XMAX)], [BE_XMAX, K(BE_XMAX)]])}"/>`;
    const gx = (xs + 2 * BE_XMAX) / 3, gy = (E(xs) + E(BE_XMAX) + K(BE_XMAX)) / 3;
    if (BE_XMAX - xs > 900) s += `<text class="tr-zl" x="${S.X(gx) + 6}" y="${S.Y(gy) + 4}" text-anchor="middle">Gewinn</text>`;
    if (S.X(xs) - S.X(0) > 110 && S.Y(0) - S.Y(K(0)) > 54) s += `<text class="tr-zl" x="${S.X(xs / 3)}" y="${S.Y((2 * K(0) + K(xs)) / 3) + 4}" text-anchor="middle">Verlust</text>`;
  } else s += `<polygon class="tr-hatch" fill="url(#${pid})" points="${pts(S, [[0, K(0)], [BE_XMAX, K(BE_XMAX)], [BE_XMAX, E(BE_XMAX)], [0, 0]])}"/>`;
  s += `<line class="tr-l3" x1="${S.X(0)}" y1="${S.Y(P.kf)}" x2="${S.X(BE_XMAX)}" y2="${S.Y(P.kf)}"/>`;
  s += `<line class="tr-l2" x1="${S.X(0)}" y1="${S.Y(K(0))}" x2="${S.X(BE_XMAX)}" y2="${S.Y(K(BE_XMAX))}"/>`;
  s += `<line class="tr-l1" x1="${S.X(0)}" y1="${S.Y(0)}" x2="${S.X(BE_XMAX)}" y2="${S.Y(E(BE_XMAX))}"/>`;
  const yE = S.Y(E(BE_XMAX)), yK = S.Y(K(BE_XMAX)), sep = Math.abs(yE - yK) < 16 ? (yE < yK ? -8 : 8) : 0;
  s += `<text class="tr-ll" x="${S.X(BE_XMAX) - 4}" y="${yE - 7 + sep}" text-anchor="end">E(x)</text><text class="tr-ll" x="${S.X(BE_XMAX) - 4}" y="${yK + (yK > yE ? 15 : -7) - sep}" text-anchor="end">K(x)</text>`;
  s += `<text class="tr-tl tr-halo" x="${S.X(BE_XMAX) - 4}" y="${S.Y(P.kf) - 6}" text-anchor="end">Kf</text>`;
  const xc = S.X(P.x);
  s += `<line class="tr-l4" x1="${xc}" y1="${S.Y(0)}" x2="${xc}" y2="${S.Y(Math.max(E(P.x), K(P.x)))}"/><circle class="tr-dot2" cx="${xc}" cy="${S.Y(E(P.x))}" r="3.5"/><circle class="tr-dot2" cx="${xc}" cy="${S.Y(K(P.x))}" r="3.5"/>`;
  if (xs < BE_XMAX) {
    const bx = S.X(xs), by = S.Y(E(xs));
    s += `<line class="tr-l4" x1="${bx}" y1="${by}" x2="${bx}" y2="${S.Y(0)}"/><circle class="tr-dot" cx="${bx}" cy="${by}" r="5"/>`;
    s += `<text class="tr-ll tr-halo" x="${bx + (bx > W * 0.7 ? -10 : 10)}" y="${by + 19}" text-anchor="${bx > W * 0.7 ? 'end' : 'start'}">BEP</text>`;
  }
  return s + '</svg>';
}
function beExplore(stage) {
  const P = { kf: 40000, p: 80, kv: 48, x: 3000 };
  const box = h('div', { class: 'tr-chart' }), kp = h('div', { class: 'tr-kpis' }), note = h('p', { class: 'tr-mute tr-chartnote' });
  const chart = chartHost(box, W => beSvg(W, P));
  const sl = [
    ['kf', 'Fixkosten Kf', 0, 150000, 1000, eur0], ['p', 'Preis p je Stück', 1, 200, 1, v => eur(v)],
    ['kv', 'Variable Stückkosten kv', 0, 200, 1, v => eur(v)], ['x', 'Absatzmenge x', 0, BE_XMAX, 50, v => fmt(v, 0) + ' Stück'],
  ].map(([k, label, min, max, st, out]) => range({ label, min, max, step: st, value: P[k], out, onInput: v => { P[k] = v; upd(); } }));
  function upd() {
    chart.draw();
    const db = be.db(P.p, P.kv), xs = be.bep(P.kf, P.p, P.kv), g = be.profit(P.kf, P.p, P.kv, P.x), ss = be.safety(P.x, xs);
    kp.replaceChildren(kpi('Stück-DB', eur(db), 'p − kv'), kpi('Break-even-Menge', Number.isFinite(xs) ? fmt(xs, 0) + ' Stück' : '–', Number.isFinite(xs) ? fmt(xs, 2) + ' exakt' : 'DB ≤ 0'),
      kpi('Break-even-Umsatz', Number.isFinite(xs) ? eur0(xs * P.p) : '–', 'p · x*'), kpi(g >= 0 ? 'Gewinn' : 'Verlust', eur0(Math.abs(g)), `bei ${fmt(P.x, 0)} Stück`),
      kpi('Sicherheitsstrecke', Number.isFinite(ss) && Number.isFinite(xs) ? fmt(ss * 100, 1) + ' %' : '–', Number.isFinite(xs) ? `${fmt(P.x - xs, 0)} Stück Puffer` : ''));
    note.textContent = db <= 0 ? 'Der Preis deckt nicht einmal die variablen Stückkosten – es gibt keinen Break-even-Punkt.' : xs > BE_XMAX ? `Der Break-even liegt bei ${fmt(xs, 0)} Stück – außerhalb des Diagramms.` : '';
  }
  stage.append(h('div', { class: 'tr-explore' }, h('div', { class: 'tr-panel' }, sl.map(s => s.el)), h('div', { class: 'tr-chartwrap' }, box, note)), kp);
  upd();
}
function beGen() {
  const type = pick(['bep', 'bep', 'umsatz', 'pugk', 'pugl', 'gewinn', 'gewinn', 'sicher', 'engpass']);
  if (type === 'bep' || type === 'umsatz') {
    const db = ri(4, 60), kv = ri(5, 120), p = kv + db, xs = ri(4, 80) * 50, kf = db * xs, data = `Fixkosten ${eur0(kf)} pro Periode, Verkaufspreis ${eur(p)} je Stück, variable Stückkosten ${eur(kv)}.`;
    const base = [`db = p − kv = ${eur(p)} − ${eur(kv)} = ${eur(db)}`, `x* = Kf ÷ db = ${eur0(kf)} ÷ ${eur(db)} = ${fmt(xs, 0)} Stück`];
    if (type === 'bep') return numTask({ q: `${data} Berechne die Break-even-Menge.`, label: 'Break-even-Menge x*', unit: 'Stück', ans: xs, dec: 0,
      traps: [[kf / p, 'Du hast die Fixkosten durch den Preis geteilt. Im Nenner steht der Stückdeckungsbeitrag (p − kv).', 'db'], [kf / kv, 'Du hast durch die variablen Stückkosten geteilt – im Nenner steht der Stückdeckungsbeitrag (p − kv).', 'db']],
      hints: ['Im Break-even deckt der gesamte Deckungsbeitrag genau die Fixkosten: (p − kv) · x = Kf.', `Der Stückdeckungsbeitrag beträgt ${eur(db)}. Wie oft passt er in die Fixkosten?`], steps: base });
    return numTask({ q: `${data} Wie hoch ist der Break-even-Umsatz?`, label: 'Break-even-Umsatz', unit: '€', ans: xs * p, dec: 2,
      traps: [[xs, 'Das ist die Break-even-Menge in Stück – gefragt ist der Umsatz (p · x*).', 'einheit'], [kf, 'Das sind nur die Fixkosten. Im Break-even müssen Erlöse auch die variablen Kosten decken.', 'kv']],
      hints: ['Bestimme zuerst die Break-even-Menge x* = Kf ÷ (p − kv).', 'Multipliziere die Break-even-Menge mit dem Preis.'], steps: [...base, `Umsatz = p · x* = ${eur(p)} · ${fmt(xs, 0)} = ${eur(xs * p)}`] });
  }
  if (type === 'pugk' || type === 'pugl') {
    const x = ri(5, 60) * 100, kfS = ri(2, 40), kf = x * kfS, kv = ri(800, 9000) / 100;
    const data = `Ein Hersteller produziert ${fmt(x, 0)} Stück pro Monat. Die Fixkosten betragen ${eur0(kf)} pro Monat, die variablen Stückkosten ${eur(kv)}.`;
    if (type === 'pugk') return numTask({ q: `${data} Ein Kunde fragt einen Zusatzauftrag an; es ist freie Kapazität vorhanden. Wie hoch ist die kurzfristige Preisuntergrenze je Stück?`, label: 'Kurzfristige Preisuntergrenze', unit: '€', ans: kv, tol: 0.005,
      traps: [[kv + kfS, 'Das ist die langfristige Preisuntergrenze. Kurzfristig fallen die Fixkosten ohnehin an – es reicht, die variablen Stückkosten zu decken.', 'pug'], [kfS, 'Das sind die fixen Stückkosten. Kurzfristig zählen nur die variablen Stückkosten.', 'pug']],
      hints: ['Kurzfristig sind die Fixkosten nicht beeinflussbar – sie entstehen mit oder ohne Auftrag.', 'Jeder Preis über den zusätzlichen (variablen) Kosten bringt einen positiven Deckungsbeitrag.'], steps: [`Kurzfristige PUG = kv = ${eur(kv)}`, 'Die Fixkosten fallen ohnehin an und sind für die Entscheidung irrelevant.'] });
    return numTask({ q: `${data} Wie hoch ist die langfristige Preisuntergrenze je Stück?`, label: 'Langfristige Preisuntergrenze', unit: '€', ans: kv + kfS, tol: 0.005,
      traps: [[kv, 'Das ist die kurzfristige Preisuntergrenze. Langfristig müssen auch die Fixkosten gedeckt sein.', 'pug'], [kfS, 'Du hast nur die fixen Stückkosten – die variablen Stückkosten fehlen.', 'kv']],
      hints: ['Langfristig müssen alle Kosten gedeckt sein – auch die Fixkosten.', 'Verteile die Fixkosten auf die Produktionsmenge und addiere die variablen Stückkosten.'], steps: [`Fixe Stückkosten = ${eur0(kf)} ÷ ${fmt(x, 0)} = ${eur(kfS)}`, `Langfristige PUG = kv + kf = ${eur(kv)} + ${eur(kfS)} = ${eur(kv + kfS)}`] });
  }
  if (type === 'gewinn') {
    const db = ri(5, 50), kv = ri(5, 80), p = kv + db, xs = ri(5, 60) * 50, kf = db * xs;
    let X; do X = xs + ri(-20, 30) * 50; while (X <= 0 || X === xs);
    const g = db * X - kf;
    return numTask({ q: `Fixkosten ${eur0(kf)}, Preis ${eur(p)} je Stück, variable Stückkosten ${eur(kv)}. Wie hoch ist das Betriebsergebnis bei einer Absatzmenge von ${fmt(X, 0)} Stück? (Verlust als negative Zahl)`, label: 'Gewinn bzw. Verlust', unit: '€', ans: g, dec: 2,
      traps: [[db * X, 'Du hast die Fixkosten vergessen: G = (p − kv) · x − Kf.', 'fix'], [p * X - kf, 'Die variablen Kosten fehlen: Zieh kv · x ebenfalls ab.', 'kv'], [-g, 'Der Betrag stimmt, aber das Vorzeichen nicht. Liegt die Menge über oder unter dem Break-even?', 'vorzeichen']],
      hints: ['Gewinn = Deckungsbeitrag gesamt − Fixkosten.', `Der Stückdeckungsbeitrag ist ${eur(db)}. Multipliziere mit der Menge und zieh die Fixkosten ab.`],
      steps: [`DB gesamt = (${eur(p)} − ${eur(kv)}) · ${fmt(X, 0)} = ${eur(db * X)}`, `G = ${eur(db * X)} − ${eur0(kf)} = ${eur(g)}`] });
  }
  if (type === 'sicher') {
    const db = ri(5, 40), kv = ri(10, 80), p = kv + db, xs = ri(4, 40) * 50, kf = db * xs, x = xs + ri(2, 40) * 25, ans = ((x - xs) / x) * 100;
    return numTask({ q: `Fixkosten ${eur0(kf)}, Preis ${eur(p)}, variable Stückkosten ${eur(kv)}. Geplant ist ein Absatz von ${fmt(x, 0)} Stück. Um wie viel Prozent darf der Absatz sinken, bis kein Gewinn mehr entsteht (Sicherheitskoeffizient)? Auf eine Nachkommastelle.`, label: 'Sicherheitskoeffizient', unit: '%', ans, dec: 1, tol: 0.051,
      traps: [[((x - xs) / xs) * 100, 'Falsche Bezugsgröße: Der Sicherheitskoeffizient bezieht sich auf die Plan-/Ist-Menge, nicht auf die Break-even-Menge.', 'bezug'], [x - xs, 'Das ist die absolute Sicherheitsstrecke in Stück – gefragt ist der prozentuale Wert.', 'einheit'], [(x - xs) / x, 'Fast: Gib das Ergebnis in Prozent an (mal 100).', 'einheit']],
      hints: ['Berechne zuerst die Break-even-Menge x* = Kf ÷ (p − kv).', 'Sicherheitskoeffizient = (Planmenge − x*) ÷ Planmenge · 100.'],
      steps: [`x* = ${eur0(kf)} ÷ ${eur(db)} = ${fmt(xs, 0)} Stück`, `Sicherheitsstrecke = ${fmt(x, 0)} − ${fmt(xs, 0)} = ${fmt(x - xs, 0)} Stück`, `Koeffizient = ${fmt(x - xs, 0)} ÷ ${fmt(x, 0)} · 100 = ${fmt(ans, 1)} %`] });
  }
  let P;
  for (;;) {
    P = ['A', 'B', 'C'].map(n => { const kv = ri(10, 80), db = ri(4, 40), t = pick([2, 3, 4, 5, 6, 8, 10, 12]); return { n, p: kv + db, kv, db, t, rel: db / t }; });
    const rel = P.map(x => x.rel).sort((a, b) => a - b), abs = P.map(x => x.db).sort((a, b) => a - b);
    const oR = [...P].sort((a, b) => b.rel - a.rel).map(x => x.n).join(''), oA = [...P].sort((a, b) => b.db - a.db).map(x => x.n).join('');
    if (rel[1] - rel[0] > 0.15 && rel[2] - rel[1] > 0.15 && abs[0] !== abs[1] && abs[1] !== abs[2] && oR !== oA) break;
  }
  const order = [...P].sort((a, b) => b.rel - a.rel).map(x => x.n), absOrder = [...P].sort((a, b) => b.db - a.db).map(x => x.n);
  return {
    kind: 'engpass', P, order, absOrder,
    q: 'Die Maschine M ist der Engpass – ihre Kapazität reicht nicht für alle Aufträge. Lege die Produktionsrangfolge fest, die den Gesamtdeckungsbeitrag maximiert.',
    prompt: t => [h('p', null, t.q), h('div', { class: 'tr-tablew' }, h('table', { class: 'tr-table' }, h('thead', null, h('tr', null, ['Produkt', 'Preis', 'kv', 'Zeit auf M'].map((x, i) => h('th', { class: i ? 'n' : null }, x)))),
      h('tbody', null, t.P.map(x => h('tr', null, h('td', null, x.n), h('td', { class: 'n' }, eur(x.p)), h('td', { class: 'n' }, eur(x.kv)), h('td', { class: 'n' }, fmt(x.t, 0) + ' min/Stk.'))))))],
    view: (body, t) => {
      const sels = [1, 2, 3].map(r => { const s = h('select', { class: 'field tr-sel', 'aria-label': `Rang ${r}` }, h('option', { value: '' }, '–'), t.P.map(x => h('option', { value: x.n }, 'Produkt ' + x.n))); return s; });
      body.append(h('div', { class: 'tr-rank' }, sels.map((s, i) => h('label', { class: 'tr-rank-i' }, h('span', { class: 'tr-lbl' }, `Rang ${i + 1}`), s))));
      return { read: () => sels.map(s => s.value), mark: r => sels.forEach((s, i) => { s.classList.toggle('tr-in-ok', r.ok || (r.rankOk || [])[i]); s.classList.toggle('tr-in-bad', !r.ok && !(r.rankOk || [])[i]); }), lock: () => sels.forEach(s => (s.disabled = true)), reveal: () => sels.forEach((s, i) => (s.value = t.order[i])) };
    },
    check: (t, a) => {
      if (a.some(x => !x)) return { incomplete: 'Vergib alle drei Ränge.' };
      if (new Set(a).size < 3) return { incomplete: 'Jedes Produkt darf nur einmal vorkommen.' };
      const rankOk = a.map((x, i) => x === t.order[i]);
      if (rankOk.every(Boolean)) return { ok: true, msgs: ['Richtig priorisiert – entscheidend ist der Deckungsbeitrag je Engpassminute.'] };
      if (a.join('') === t.absOrder.join('')) return { ok: false, msgs: ['Du hast nach dem absoluten Stückdeckungsbeitrag sortiert. Bei einem Engpass zählt der relative DB = db ÷ Engpasszeit.'], errs: ['engpass'], rankOk };
      return { ok: false, msgs: [rankOk.map((o, i) => (o ? null : `Rang ${i + 1}`)).filter(Boolean).join(', ') + ' stimmt nicht. Berechne für jedes Produkt den DB je Minute auf Maschine M.'], errs: ['rang'], rankOk };
    },
    hints: ['Bei einem Engpass ist nicht der Stückdeckungsbeitrag entscheidend, sondern was jede knappe Minute einbringt.', 'Relativer DB = (p − kv) ÷ Bearbeitungszeit auf dem Engpass. Sortiere absteigend.'],
    steps: [...P.map(x => `${x.n}: db = ${eur(x.p)} − ${eur(x.kv)} = ${eur(x.db)}  → ${eur(x.db)} ÷ ${x.t} min = ${eur(x.rel)}/min`), `Rangfolge: ${order.join(' → ')}`],
    askText: t => `${t.q} Daten: ${t.P.map(x => `${x.n}: Preis ${eur(x.p)}, kv ${eur(x.kv)}, ${x.t} min auf M`).join('; ')}.`,
    attempt: a => 'Rangfolge ' + a.map(x => x || '?').join(' → '),
  };
}
const BEVEN = {
  explain: `<p>Der <b>Deckungsbeitrag</b> je Stück (db = p − kv) zeigt, was jedes verkaufte Stück zur Deckung der Fixkosten beiträgt. Im <b>Break-even-Punkt</b> sind alle Kosten gedeckt: Erlöse = Gesamtkosten.</p>
  <ul><li>Break-even-Menge: <code>x* = Kf ÷ (p − kv)</code></li><li>Gewinn: <code>G = (p − kv) · x − Kf</code></li><li>Preisuntergrenze kurzfristig: <code>kv</code> · langfristig: <code>kv + Kf ÷ x</code></li><li>Sicherheitskoeffizient: <code>(x − x*) ÷ x</code></li><li>Engpass: Rangfolge nach relativem DB = db ÷ Engpasszeit.</li></ul>`,
  explore: beExplore,
  practice: (stage, ctx, T) => practice(stage, ctx, T, numCfg(beGen)),
};

/* ================= 4 · Investitionsrechnung ================= */
export const inv = {
  npv: (cf, i) => cf.reduce((s, c, t) => s + c / (1 + i) ** t, 0),
  annuity(kw, i, n) { if (n <= 0) return NaN; if (Math.abs(i) < 1e-12) return kw / n; const q = (1 + i) ** n; return (kw * (i * q)) / (q - 1); },
  irr(cf) {
    const f = r => inv.npv(cf, r), roots = [];
    let a = -0.95, fa = f(a);
    for (let k = 1; k <= 1580; k++) {
      const b = -0.95 + k * 0.0025, fb = f(b);
      if (fb === 0) roots.push(b);
      else if (fa * fb < 0) {
        let lo = a, hi = b, flo = fa;
        for (let j = 0; j < 80; j++) { const mid = (lo + hi) / 2, fm = f(mid); if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; } }
        roots.push((lo + hi) / 2);
      }
      a = b; fa = fb;
    }
    return roots;
  },
  payback(cf, i = 0) {
    if (cf[0] >= 0) return 0;
    let cum = 0;
    for (let t = 0; t < cf.length; t++) {
      const pv = cf[t] / (1 + i) ** t, prev = cum;
      cum += pv;
      if (t > 0 && prev < 0 && cum >= 0) return t - 1 + -prev / pv;
    }
    return null;
  },
};
function kwSvg(W, cf, i) {
  const H = Math.round(clamp(W * 0.5, 220, 340));
  const N = 61, data = Array.from({ length: N }, (_, k) => [k * 0.5, inv.npv(cf, k * 0.005)]);
  let lo = Math.min(0, ...data.map(d => d[1])), hi = Math.max(0, ...data.map(d => d[1]));
  if (hi - lo < 1) { hi += 1; lo -= 1; }
  const ys = niceStep(hi - lo, H < 280 ? 4 : 5), y0 = Math.floor(lo / ys) * ys, y1 = Math.ceil(hi / ys) * ys;
  const m = { l: yMargin(y0, y1, ys, fmtK), r: 18, t: 30, b: 38 };
  const S = scale(W, H, m, 0, 30, y0, y1);
  let s = svgOpen(W, H, 'Kapitalwertkurve in Abhängigkeit vom Kalkulationszins') + axesSvg(S, { ys, xs: W < 460 ? 10 : 5, xf: v => fmt(v, 0) + ' %', xl: 'Kalkulationszins i', yl: 'Kapitalwert (€)' });
  const pos = data.filter(d => d[1] >= 0);
  if (pos.length > 1) s += `<polygon class="tr-a2" points="${pts(S, [[pos[0][0], 0], ...pos, [pos.at(-1)[0], 0]])}"/>`;
  s += `<polyline class="tr-l1" points="${pts(S, data)}"/>`;
  for (const r of inv.irr(cf).filter(r => r >= 0 && r <= 0.3)) {
    const x = S.X(r * 100), y = S.Y(0), right = x > W * 0.72;
    s += `<circle class="tr-dot" cx="${x}" cy="${y}" r="5"/><text class="tr-ll" x="${x + (right ? -8 : 8)}" y="${y - 9}" text-anchor="${right ? 'end' : 'start'}">IZF ${fmt(r * 100, 2)} %</text>`;
  }
  const kw = inv.npv(cf, i), xc = S.X(i * 100), yc = S.Y(kw), right = xc > W * 0.6;
  s += `<line class="tr-l4" x1="${xc}" y1="${S.Y(S.y0)}" x2="${xc}" y2="${S.m.t}"/><circle class="tr-dot2" cx="${xc}" cy="${yc}" r="4.5"/>`;
  s += `<text class="tr-ll tr-halo" x="${xc + (right ? -8 : 8)}" y="${yc + (kw >= 0 ? -10 : 18)}" text-anchor="${right ? 'end' : 'start'}">KW ${eur0(kw)}</text>`;
  return s + '</svg>';
}
function kwExplore(stage) {
  const S = { cf: [-100000, 30000, 35000, 40000, 30000], i: 0.08 };
  const box = h('div', { class: 'tr-chart' }), kp = h('div', { class: 'tr-kpis' });
  const chart = chartHost(box, W => kwSvg(W, S.cf, S.i));
  const tbody = h('tbody');
  const tfoot = h('tfoot');
  const zins = range({ label: 'Kalkulationszins i', min: 0, max: 30, step: 0.5, value: S.i * 100, out: v => fmt(v, 1) + ' %', onInput: v => { S.i = v / 100; upd(); } });
  const bAdd = h('button', { class: 'btn sm', type: 'button' }, svgIcon(I.plus), 'Jahr');
  const bDel = h('button', { class: 'btn sm', type: 'button' }, '− Jahr');
  bAdd.addEventListener('click', () => { if (S.cf.length < 11) { S.cf.push(S.cf.at(-1) > 0 ? S.cf.at(-1) : 20000); rows(); upd(); } });
  bDel.addEventListener('click', () => { if (S.cf.length > 2) { S.cf.pop(); rows(); upd(); } });
  let cells = [];
  function rows() {
    tbody.replaceChildren();
    cells = S.cf.map((c, t) => {
      const inp = h('input', { class: 'field tr-cfin', type: 'text', inputmode: 'decimal', value: fmt(c, 0), 'aria-label': `Zahlung in t = ${t}` });
      inp.addEventListener('input', () => { const v = parseNum(inp.value); inp.classList.toggle('tr-in-bad', !Number.isFinite(v)); S.cf[t] = Number.isFinite(v) ? v : 0; upd(); });
      inp.addEventListener('blur', () => { if (Number.isFinite(parseNum(inp.value))) inp.value = fmt(S.cf[t], 0); });
      const f = h('td', { class: 'n' }), bw = h('td', { class: 'n' }), cum = h('td', { class: 'n' });
      tbody.append(h('tr', null, h('td', { class: 'tr-t' }, t), h('td', null, inp), f, bw, cum));
      return { f, bw, cum };
    });
    bAdd.disabled = S.cf.length >= 11; bDel.disabled = S.cf.length <= 2;
  }
  function upd() {
    chart.draw();
    let cum = 0;
    S.cf.forEach((c, t) => { const q = (1 + S.i) ** -t, pv = c * q; cum += pv; cells[t].f.textContent = fmt(q, 4); cells[t].bw.textContent = fmt(pv, 2); cells[t].cum.textContent = fmt(cum, 2); cells[t].cum.classList.toggle('tr-neg', cum < 0); });
    tfoot.replaceChildren(h('tr', null, h('td', { colspan: 3 }, 'Kapitalwert'), h('td', { class: 'n', colspan: 2 }, h('b', null, eur(cum)))));
    const n = S.cf.length - 1, ann = inv.annuity(cum, S.i, n), roots = inv.irr(S.cf), ps = inv.payback(S.cf, 0), pd = inv.payback(S.cf, S.i);
    const yr = v => (v == null ? 'nicht in der Laufzeit' : fmt(v, 2) + ' Jahre');
    kp.replaceChildren(kpi('Kapitalwert', eur0(cum), cum >= 0 ? 'vorteilhaft (KW ≥ 0)' : 'nicht vorteilhaft'), kpi('Annuität', eur0(ann), `pro Jahr über ${n} Jahre`),
      kpi('Interner Zinsfuß', roots.length ? fmt(roots[0] * 100, 2) + ' %' : 'keiner', roots.length > 1 ? `mehrere Lösungen (${roots.length})` : roots.length ? (roots[0] > S.i ? 'liegt über i' : 'liegt unter i') : 'kein Vorzeichenwechsel'),
      kpi('Amortisation statisch', yr(ps), 'kumuliert, unverzinst'), kpi('Amortisation dynamisch', yr(pd), 'kumulierte Barwerte'));
  }
  const table = h('table', { class: 'tr-table tr-cft' }, h('thead', null, h('tr', null, h('th', null, 't'), h('th', null, 'Zahlung (€)'), h('th', { class: 'n' }, 'Abzinsungsfaktor'), h('th', { class: 'n' }, 'Barwert'), h('th', { class: 'n' }, 'kumuliert'))), tbody, tfoot);
  stage.append(h('div', { class: 'tr-explore' }, h('div', { class: 'tr-panel' }, zins.el, h('p', { class: 'tr-mute tr-small' }, 'Trag die Zahlungen unten in die Tabelle ein (Auszahlungen negativ).'), h('div', { class: 'tr-row-btns' }, bAdd, bDel)), h('div', { class: 'tr-chartwrap' }, box)), kp,
    h('div', { class: 'tr-sub tr-sub-gap' }, 'Zahlungsreihe & Abzinsungstabelle'), h('div', { class: 'tr-tablew' }, table));
  rows(); upd();
}
function kwGen() {
  const type = pick(['kw', 'kw', 'bw', 'ann', 'irr', 'amort']);
  const pctS = i => fmt(i * 100, 0) + ' %';
  const discLines = (cf, i) => cf.map((c, t) => `t=${t}: ${fmt(c, 0)} · ${fmt(1 + i, 2)}^−${t} = ${fmt(c / (1 + i) ** t, 2)}`);
  const flows = n => { const I0 = ri(5, 20) * 10000, avg = (I0 / n) * (1 + ri(5, 30) / 100); return [-I0, ...Array.from({ length: n }, () => Math.round((avg * (0.75 + Math.random() * 0.5)) / 1000) * 1000)]; };
  const cfText = cf => cf.map((c, t) => `t${t}: ${fmt(c, 0)} €`).join(' · ');
  if (type === 'kw') {
    const n = ri(3, 4), i = pick([4, 5, 6, 8, 10, 12]) / 100, cf = flows(n), ans = inv.npv(cf, i);
    return numTask({ q: `Eine Investition hat folgende Zahlungen: ${cfText(cf)}. Berechne den Kapitalwert bei einem Kalkulationszins von ${pctS(i)}.`, label: 'Kapitalwert', unit: '€', ans, tol: Math.max(2, -cf[0] * 0.0001),
      traps: [[sum(cf), 'Du hast die Rückflüsse nicht abgezinst. Jede Zahlung muss mit (1 + i)^−t auf t = 0 bezogen werden.', 'abzins'], [ans - cf[0], 'Die Anschaffungsauszahlung in t = 0 fehlt – zieh sie vom Barwert der Rückflüsse ab.', 'i0'],
        [cf[0] + sum(cf.slice(1).map((c, t) => c / (1 + i) ** (t + 2))), 'Dein Abzinsungsexponent ist um ein Jahr verschoben: Die Zahlung in t wird mit (1 + i)^−t abgezinst.', 'expo'], [cf[0] + sum(cf.slice(1).map((c, t) => c * (1 + i) ** (t + 1))), 'Du hast aufgezinst statt abgezinst. Teile durch (1 + i)^t.', 'aufzins']],
      hints: ['Kapitalwert = Summe aller Barwerte: C₀ = Σ Zₜ · (1 + i)^−t, inklusive der Auszahlung in t = 0.', `Der Abzinsungsfaktor für t = 1 ist 1 ÷ ${fmt(1 + i, 2)} = ${fmt(1 / (1 + i), 4)}.`], steps: [...discLines(cf, i), `Kapitalwert = ${eur(ans)}`],
      note: ans >= 0 ? 'KW ≥ 0: Die Investition ist bei diesem Zins vorteilhaft.' : 'KW < 0: Die Investition ist bei diesem Zins nicht vorteilhaft.' });
  }
  if (type === 'bw') {
    const C = ri(5, 50) * 1000, t = ri(2, 8), i = pick([3, 4, 5, 6, 8]) / 100, ans = C / (1 + i) ** t;
    return numTask({ q: `Welchen Barwert hat eine Zahlung von ${eur0(C)}, die in ${t} Jahren anfällt, bei einem Zinssatz von ${pctS(i)}?`, label: 'Barwert', unit: '€', ans, tol: 0.5,
      traps: [[C * (1 + i) ** t, 'Du hast aufgezinst (Endwert). Für den Barwert musst du durch (1 + i)^t teilen.', 'aufzins'], [C / (1 + i * t), 'Das ist einfache Verzinsung. Beim Barwert wird mit Zinseszins abgezinst: (1 + i)^t.', 'einfach'], [C / (1 + i) ** (t - 1), 'Der Exponent ist um ein Jahr verschoben.', 'expo']],
      hints: ['Barwert = Zahlung · (1 + i)^−t.', `Rechne ${fmt(1 + i, 2)}^${t} und teile die Zahlung dadurch.`], steps: [`Abzinsungsfaktor = ${fmt(1 + i, 2)}^−${t} = ${fmt((1 + i) ** -t, 6)}`, `Barwert = ${eur0(C)} · ${fmt((1 + i) ** -t, 6)} = ${eur(ans)}`] });
  }
  if (type === 'ann') {
    const n = ri(3, 8), i = pick([4, 5, 6, 8, 10]) / 100, kw = ri(5, 80) * 500, q = (1 + i) ** n, anf = (i * q) / (q - 1), ans = kw * anf;
    return numTask({ q: `Eine Investition hat bei ${pctS(i)} Kalkulationszins einen Kapitalwert von ${eur0(kw)}. Die Nutzungsdauer beträgt ${n} Jahre. Wie hoch ist die Annuität?`, label: 'Annuität', unit: '€', ans, tol: 0.5,
      traps: [[kw / n, 'Du hast den Kapitalwert einfach durch die Laufzeit geteilt. Die Zinsen fehlen – nutze den Annuitätenfaktor.', 'anf'], [kw * (q - 1) / (i * q), 'Du hast mit dem Rentenbarwertfaktor multipliziert – richtig ist der Kehrwert (Annuitätenfaktor).', 'anf']],
      hints: ['Annuität = Kapitalwert · Annuitätenfaktor (Wiedergewinnungsfaktor).', 'ANF = i · (1 + i)^n ÷ ((1 + i)^n − 1).'], steps: [`(1 + i)^n = ${fmt(1 + i, 2)}^${n} = ${fmt(q, 6)}`, `ANF = ${fmt(i, 2)} · ${fmt(q, 6)} ÷ (${fmt(q, 6)} − 1) = ${fmt(anf, 6)}`, `Annuität = ${eur0(kw)} · ${fmt(anf, 6)} = ${eur(ans)}`] });
  }
  if (type === 'irr') {
    const I0 = ri(5, 30) * 1000, r = ri(4, 20) / 100, c1 = Math.round((I0 * ri(30, 60)) / 100 / 100) * 100, c2 = Math.round(I0 * (1 + r) ** 2 - c1 * (1 + r)), cf = [-I0, c1, c2], ans = inv.irr(cf)[0] * 100;
    return numTask({ q: `Eine Investition kostet ${eur0(I0)} und bringt nach einem Jahr ${eur0(c1)} sowie nach zwei Jahren ${eur0(c2)} ein. Berechne den internen Zinsfuß in % (eine Nachkommastelle).`, label: 'Interner Zinsfuß', unit: '%', ans, dec: 1, tol: 0.06,
      traps: [[ans / 100, 'Gib den Zinssatz in Prozent an, z. B. 8,5 statt 0,085.', 'einheit'], [((c1 + c2 - I0) / I0) * 100, 'Das ist die Gesamtrendite ohne Zeitwert. Gesucht ist der Zins, bei dem der Kapitalwert genau 0 ist.', 'abzins']],
      hints: ['Der interne Zinsfuß ist der Zins, bei dem der Kapitalwert genau 0 wird.', `Setze q = 1 + r: −${fmt(I0, 0)} · q² + ${fmt(c1, 0)} · q + ${fmt(c2, 0)} = 0 und löse die quadratische Gleichung.`],
      steps: [`0 = −${fmt(I0, 0)} + ${fmt(c1, 0)} ÷ q + ${fmt(c2, 0)} ÷ q²`, `⇔ ${fmt(I0, 0)} q² − ${fmt(c1, 0)} q − ${fmt(c2, 0)} = 0`, `q = (${fmt(c1, 0)} + √(${fmt(c1, 0)}² + 4 · ${fmt(I0, 0)} · ${fmt(c2, 0)})) ÷ (2 · ${fmt(I0, 0)}) = ${fmt(1 + ans / 100, 5)}`, `IZF = ${fmt(ans, 2)} %`] });
  }
  let cf, i, pd, ps;
  do { i = pick([5, 6, 8, 10]) / 100; cf = flows(5); pd = inv.payback(cf, i); ps = inv.payback(cf, 0); } while (pd == null || Math.ceil(pd) === Math.ceil(ps));
  const ans = Math.ceil(pd - 1e-9);
  let cum = 0;
  return numTask({ q: `Zahlungen: ${cfText(cf)}. In welchem Jahr amortisiert sich die Investition dynamisch (Kalkulationszins ${pctS(i)})? Gib das Jahr t an, in dem die kumulierten Barwerte erstmals ≥ 0 sind.`, label: 'Amortisationsjahr t', unit: '', ans, dec: 0, tol: 0,
    traps: [[Math.ceil(ps - 1e-9), 'Das ist die statische Amortisation (ohne Abzinsung). Dynamisch werden die Rückflüsse erst abgezinst – das dauert länger.', 'statisch']],
    hints: ['Zinse jeden Rückfluss auf t = 0 ab und addiere die Barwerte Jahr für Jahr zur Anschaffungsauszahlung.', 'Gesucht ist das erste Jahr, in dem die kumulierte Summe nicht mehr negativ ist.'],
    steps: cf.map((c, t) => { cum += c / (1 + i) ** t; return `t=${t}: Barwert ${fmt(c / (1 + i) ** t, 2)} → kumuliert ${fmt(cum, 2)}`; }).concat(`Erstmals ≥ 0 in t = ${ans}`) });
}
const KWERT = {
  explain: `<p>Die <b>Kapitalwertmethode</b> zinst alle Zahlungen auf den Zeitpunkt t = 0 ab. Ist der Kapitalwert ≥ 0, verzinst sich die Investition mindestens zum Kalkulationszins.</p>
  <ul><li>Kapitalwert: <code>C₀ = Σ Zₜ · (1 + i)^−t</code></li><li>Annuität: <code>C₀ · i(1+i)ⁿ ÷ ((1+i)ⁿ − 1)</code></li><li>Interner Zinsfuß: der Zins, bei dem C₀ = 0 (Schnittpunkt der Kurve mit der x-Achse).</li><li>Amortisation: Zeitpunkt, ab dem die kumulierten (Bar-)Rückflüsse die Anschaffung decken.</li></ul>`,
  explore: kwExplore,
  practice: (stage, ctx, T) => practice(stage, ctx, T, numCfg(kwGen)),
};

/* ================= 5 · Angebot & Nachfrage ================= */
export function market(S) {
  const { a, b, c, d } = S, xe = Math.max(0, (a - c) / (b + d)), pe = a - b * xe;
  const r = { xe, pe, x: xe, pc: pe, pp: pe, kr: 0.5 * (a - pe) * xe, pr: 0.5 * (pe - c) * xe, st: 0, wv: 0, gap: 0, binding: false };
  if (S.pol === 'tax' && S.pv > 0) {
    const t = S.pv, x = Math.max(0, (a - c - t) / (b + d)), pc = a - b * x, pp = pc - t;
    Object.assign(r, { x, pc, pp, kr: 0.5 * (a - pc) * x, pr: 0.5 * (pp - c) * x, st: t * x, wv: 0.5 * t * (xe - x), binding: true });
  } else if (S.pol === 'max' && S.pv < pe) {
    const x = Math.max(0, (S.pv - c) / d), D = a - b * x;
    Object.assign(r, { x, pc: S.pv, pp: S.pv, kr: (a - S.pv) * x - 0.5 * b * x * x, pr: 0.5 * (S.pv - c) * x, wv: 0.5 * (D - S.pv) * (xe - x), gap: Math.max(0, (a - S.pv) / b - x), binding: true });
  } else if (S.pol === 'min' && S.pv > pe) {
    const x = Math.max(0, (a - S.pv) / b), Sx = c + d * x;
    Object.assign(r, { x, pc: S.pv, pp: S.pv, kr: 0.5 * (a - S.pv) * x, pr: (S.pv - c) * x - 0.5 * d * x * x, wv: 0.5 * (S.pv - Sx) * (xe - x), gap: Math.max(0, (S.pv - c) / d - x), binding: true });
  }
  return r;
}
const MX = 100, MP = 140;
function mSvg(W, st, opt = {}) {
  const H = Math.round(clamp(W * 0.62, 250, 400)), m = { l: 46, r: 18, t: 28, b: 38 };
  const S = scale(W, H, m, 0, MX, 0, MP), cid = uid('c'), pid = uid('p');
  const R = market(st), { a, b, c, d } = st;
  const D = x => a - b * x, Sp = x => c + d * x;
  let s = svgOpen(W, H, 'Marktdiagramm mit Angebots- und Nachfragekurve') + patternDefs(pid) + `<defs><clipPath id="${cid}"><rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}"/></clipPath></defs>`;
  s += axesSvg(S, { xs: W < 460 ? 25 : 10, ys: 20, yf: v => fmt(v, 0), xl: 'Menge x', yl: 'Preis p (€)' });
  s += `<g clip-path="url(#${cid})">`;
  if (opt.areas) {
    const x = R.x;
    if (st.pol === 'max' && R.binding) {
      s += `<polygon class="tr-a1" points="${pts(S, [[0, a], [x, D(x)], [x, R.pc], [0, R.pc]])}"/><polygon class="tr-a2" points="${pts(S, [[0, R.pc], [0, c], [x, R.pc]])}"/>`;
      s += `<polygon class="tr-hatch" fill="url(#${pid})" points="${pts(S, [[x, D(x)], [R.xe, R.pe], [x, Sp(x)]])}"/>`;
    } else if (st.pol === 'min' && R.binding) {
      s += `<polygon class="tr-a1" points="${pts(S, [[0, a], [0, R.pc], [x, R.pc]])}"/><polygon class="tr-a2" points="${pts(S, [[0, R.pc], [x, R.pc], [x, Sp(x)], [0, c]])}"/>`;
      s += `<polygon class="tr-hatch" fill="url(#${pid})" points="${pts(S, [[x, R.pc], [R.xe, R.pe], [x, Sp(x)]])}"/>`;
    } else {
      s += `<polygon class="tr-a1" points="${pts(S, [[0, a], [0, R.pc], [x, R.pc]])}"/><polygon class="tr-a2" points="${pts(S, [[0, R.pp], [0, c], [x, R.pp]])}"/>`;
      if (R.st > 0) s += `<rect class="tr-a3" x="${S.X(0)}" y="${S.Y(R.pc)}" width="${S.X(x) - S.X(0)}" height="${S.Y(R.pp) - S.Y(R.pc)}"/><polygon class="tr-hatch" fill="url(#${pid})" points="${pts(S, [[x, R.pc], [R.xe, R.pe], [x, R.pp]])}"/>`;
    }
    const lab = (t, X, Y, min = 26) => (Math.abs(S.X(X) - S.X(0)) > min ? `<text class="tr-zl" x="${S.X(X)}" y="${S.Y(Y) + 4}" text-anchor="middle">${t}</text>` : '');
    if (x > 6) {
      s += lab('KR', x / 3, (Math.min(a, MP) + 2 * R.pc) / 3 + (st.pol === 'max' && R.binding ? 3 : 0));
      s += lab('PR', x / 3, (2 * R.pp + Math.max(c, 0)) / 3 + (st.pol === 'min' && R.binding ? 4 : 0));
      if (R.st > 0 && S.Y(R.pp) - S.Y(R.pc) > 14) s += lab('Staat', x / 2, (R.pc + R.pp) / 2);
    }
    if (R.wv > 0 && R.xe - x > 4) s += `<text class="tr-zl tr-halo" x="${S.X(R.xe) + 8}" y="${S.Y(R.pe) - 8}">WV</text>`;
  }
  if (opt.ghost) {
    const g = opt.ghost;
    s += `<line class="tr-l5" x1="${S.X(0)}" y1="${S.Y(g.a)}" x2="${S.X(MX)}" y2="${S.Y(g.a - g.b * MX)}"/><line class="tr-l5" x1="${S.X(0)}" y1="${S.Y(g.c)}" x2="${S.X(MX)}" y2="${S.Y(g.c + g.d * MX)}"/>`;
    const g0 = market({ ...g, pol: 'none' });
    s += `<circle class="tr-dot3" cx="${S.X(g0.xe)}" cy="${S.Y(g0.pe)}" r="4"/>`;
  }
  s += `<line class="tr-l1" x1="${S.X(0)}" y1="${S.Y(a)}" x2="${S.X(MX)}" y2="${S.Y(D(MX))}"/>`;
  s += `<line class="tr-l2" x1="${S.X(0)}" y1="${S.Y(c)}" x2="${S.X(MX)}" y2="${S.Y(Sp(MX))}"/>`;
  if (st.pol === 'tax' && R.binding) s += `<line class="tr-l5" x1="${S.X(0)}" y1="${S.Y(c + st.pv)}" x2="${S.X(MX)}" y2="${S.Y(c + st.pv + d * MX)}"/>`;
  if ((st.pol === 'max' || st.pol === 'min') && st.pv > 0) s += `<line class="tr-l4" x1="${S.X(0)}" y1="${S.Y(st.pv)}" x2="${S.X(MX)}" y2="${S.Y(st.pv)}"/>`;
  if (opt.drag) s += `<line class="tr-hit" data-drag="N" x1="${S.X(0)}" y1="${S.Y(a)}" x2="${S.X(MX)}" y2="${S.Y(D(MX))}"/><line class="tr-hit" data-drag="A" x1="${S.X(0)}" y1="${S.Y(c)}" x2="${S.X(MX)}" y2="${S.Y(Sp(MX))}"/>`;
  s += '</g>';
  const xN = clamp((a - MP * 0.94) / b, 2, MX), xA = clamp((MP * 0.94 - c) / d, 0, MX - 4);
  s += `<text class="tr-ll" x="${S.X(xN) + 10}" y="${S.Y(D(xN)) + 4}">N</text><text class="tr-ll" x="${S.X(xA) - 10}" y="${S.Y(Sp(xA)) + 4}" text-anchor="end">A</text>`;
  const ex = S.X(R.xe), ey = S.Y(R.pe);
  const bind = opt.areas && R.binding;
  if (!bind) s += `<line class="tr-l4" x1="${ex}" y1="${ey}" x2="${ex}" y2="${S.Y(0)}"/><line class="tr-l4" x1="${S.X(0)}" y1="${ey}" x2="${ex}" y2="${ey}"/>`;
  s += `<circle class="${bind ? 'tr-dot2' : 'tr-dot'}" cx="${ex}" cy="${ey}" r="${bind ? 4 : 5}"/>`;
  if (bind && R.x > 0) s += `<circle class="tr-dot" cx="${S.X(R.x)}" cy="${S.Y(R.pc)}" r="4.5"/>` + (R.pp !== R.pc ? `<circle class="tr-dot" cx="${S.X(R.x)}" cy="${S.Y(R.pp)}" r="4.5"/>` : '');
  const right = ex > W * 0.62;
  if (!bind) s += `<text class="tr-ll tr-halo" x="${ex + (right ? -10 : 10)}" y="${ey - 15}" text-anchor="${right ? 'end' : 'start'}">p* ${fmt(R.pe, 1)} · x* ${fmt(R.xe, 1)}</text>`;
  return { svg: s + '</svg>', S };
}
function marktExplore(stage) {
  const B = { a: 110, b: 1, c: 20, d: 1 };
  const st = { ...B, pol: 'none', pv: 15 };
  const box = h('div', { class: 'tr-chart tr-dragbox' }), kp = h('div', { class: 'tr-kpis' }), note = h('p', { class: 'tr-mute tr-chartnote' });
  let lastS = null;
  const chart = chartHost(box, W => { const r = mSvg(W, st, { areas: true, drag: true }); lastS = r.S; return r.svg; });
  const clampSt = () => { st.a = clamp(st.a, 40, 180); st.c = clamp(st.c, -40, 90); };
  const pv = range({ label: 'Mengensteuer je Stück', min: 0, max: 40, step: 1, value: 15, out: v => eur(v, 0), onInput: v => { st.pv = v; upd(); } });
  const pol = chips([['none', 'Kein Eingriff'], ['tax', 'Mengensteuer'], ['max', 'Höchstpreis'], ['min', 'Mindestpreis']], k => {
    st.pol = k; const pe = market({ ...st, pol: 'none' }).pe;
    if (k === 'tax') { pv.setRange(0, 40, 1); st.pv = 15; } else if (k === 'max') { pv.setRange(0, MP, 1); st.pv = Math.max(0, Math.round(pe - 15)); } else if (k === 'min') { pv.setRange(0, MP, 1); st.pv = Math.min(MP, Math.round(pe + 15)); }
    pv.set(st.pv); pv.el.querySelector('.tr-sl-l span').textContent = k === 'tax' ? 'Mengensteuer je Stück' : k === 'max' ? 'Höchstpreis' : 'Mindestpreis';
    pv.el.classList.toggle('hidden', k === 'none'); upd();
  }, 'Staatlicher Eingriff');
  pol.set('none'); pv.el.classList.add('hidden');
  const shift = (cv, dir) => { if (cv === 'N') st.a += dir * 10 * st.b; else st.c -= dir * 10 * st.d; clampSt(); upd(); };
  const sb = (lab, cv) => h('div', { class: 'tr-shift' }, h('span', null, lab), h('button', { class: 'btn sm', type: 'button', 'aria-label': lab + ' nach links', onclick: () => shift(cv, -1) }, svgIcon(I.left)), h('button', { class: 'btn sm', type: 'button', 'aria-label': lab + ' nach rechts', onclick: () => shift(cv, 1) }, svgIcon(I.right)));
  const reset = h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { Object.assign(st, B); upd(); } }, svgIcon(I.refresh), 'Zurücksetzen');
  box.addEventListener('pointerdown', e => {
    const hit = e.target.closest?.('[data-drag]'); if (!hit || !lastS) return;
    e.preventDefault();
    const which = hit.dataset.drag, svg = box.querySelector('svg'), rect = svg.getBoundingClientRect(), k = lastS.W / rect.width, S0 = lastS;
    const toD = ev => ({ x: (((ev.clientX - rect.left) * k - S0.m.l) / (S0.W - S0.m.l - S0.m.r)) * MX, y: ((S0.H - S0.m.b - (ev.clientY - rect.top) * k) / (S0.H - S0.m.t - S0.m.b)) * MP });
    const p0 = toD(e), a0 = st.a, c0 = st.c;
    box.classList.add('dragging');
    try { box.setPointerCapture(e.pointerId); } catch { /* */ }
    const mv = ev => { const p = toD(ev), dx = p.x - p0.x, dy = p.y - p0.y; if (which === 'N') st.a = a0 + dy + st.b * dx; else st.c = c0 + dy - st.d * dx; clampSt(); upd(); };
    const up = () => { box.classList.remove('dragging'); box.removeEventListener('pointermove', mv); box.removeEventListener('pointerup', up); box.removeEventListener('pointercancel', up); };
    box.addEventListener('pointermove', mv); box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  });
  function upd() {
    chart.draw();
    const R = market(st);
    const list = [kpi('Gleichgewicht', `p* ${eur(R.pe, 1)}`, `x* = ${fmt(R.xe, 1)}`)];
    if (R.binding) list.push(kpi('Gehandelte Menge', fmt(R.x, 1), st.pol === 'tax' ? `Käufer zahlen ${eur(R.pc, 1)}, Anbieter erhalten ${eur(R.pp, 1)}` : st.pol === 'max' ? `Nachfrageüberhang ${fmt(R.gap, 1)}` : `Angebotsüberhang ${fmt(R.gap, 1)}`));
    list.push(kpi('Konsumentenrente', eur0(R.kr)), kpi('Produzentenrente', eur0(R.pr)));
    if (st.pol === 'tax') list.push(kpi('Steueraufkommen', eur0(R.st)));
    list.push(kpi('Wohlfahrtsverlust', eur0(R.wv), R.wv > 0 ? 'schraffierte Fläche' : 'kein Verlust'));
    kp.replaceChildren(...list);
    note.textContent = (st.pol === 'max' || st.pol === 'min') && !R.binding ? `Der ${st.pol === 'max' ? 'Höchstpreis liegt über' : 'Mindestpreis liegt unter'} dem Gleichgewichtspreis – er ist nicht bindend.` : 'Tipp: Zieh eine Kurve direkt im Diagramm, um sie zu verschieben.';
  }
  stage.append(h('div', { class: 'tr-explore' }, h('div', { class: 'tr-panel' }, h('div', { class: 'tr-sub' }, 'Kurven verschieben'), sb('Nachfrage', 'N'), sb('Angebot', 'A'), reset, h('div', { class: 'tr-sub' }, 'Staatlicher Eingriff'), pol.el, pv.el), h('div', { class: 'tr-chartwrap' }, box, note)), kp);
  upd();
}
const MS = [
  ['Der Preis für Kakao, den wichtigsten Rohstoff, steigt stark.', 'Schokolade', { A: -1 }, 'Höhere Rohstoffkosten: Zu jedem Preis bieten die Hersteller weniger an – das Angebot verschiebt sich nach links. Der Preis steigt, die Menge sinkt.'],
  ['Eine neue Produktionstechnik senkt die Stückkosten deutlich.', 'Solarmodule', { A: 1 }, 'Niedrigere Kosten: Zu jedem Preis wird mehr angeboten – das Angebot verschiebt sich nach rechts. Der Preis sinkt, die Menge steigt.'],
  ['Die Einkommen der Haushalte steigen (normales Gut).', 'Restaurantbesuche', { N: 1 }, 'Bei normalen Gütern steigt mit dem Einkommen die Nachfrage – Verschiebung nach rechts. Preis und Menge steigen.'],
  ['Die Einkommen steigen – das Gut gilt als inferior.', 'Billig-Nudeln', { N: -1 }, 'Inferiore Güter werden bei steigendem Einkommen durch bessere ersetzt – die Nachfrage sinkt. Preis und Menge sinken.'],
  ['Tee wird deutlich teurer.', 'Kaffee', { N: 1 }, 'Tee ist ein Substitut für Kaffee. Wird Tee teurer, weichen Käufer auf Kaffee aus – die Kaffee-Nachfrage steigt.'],
  ['Benzin wird deutlich teurer.', 'große Verbrenner-Pkw', { N: -1 }, 'Benzin ist ein Komplementärgut. Steigt sein Preis, wird die Nutzung teurer – die Nachfrage nach großen Pkw sinkt.'],
  ['Mehrere neue Anbieter treten in den Markt ein.', 'Lieferdienste', { A: 1 }, 'Mehr Anbieter bedeuten zu jedem Preis mehr Angebot – Verschiebung nach rechts. Preis sinkt, Menge steigt.'],
  ['Eine Missernte vernichtet einen großen Teil der Ernte.', 'Äpfel', { A: -1 }, 'Weniger Ware verfügbar: Das Angebot verschiebt sich nach links. Preis steigt, Menge sinkt.'],
  ['Ein viraler Social-Media-Trend macht das Produkt beliebt.', 'Matcha', { N: 1 }, 'Geänderte Präferenzen erhöhen die Zahlungsbereitschaft – die Nachfrage verschiebt sich nach rechts.'],
  ['Eine Studie warnt vor Gesundheitsrisiken des Produkts.', 'Energydrinks', { N: -1 }, 'Präferenzen verschlechtern sich – die Nachfrage verschiebt sich nach links. Preis und Menge sinken.'],
  ['Der Staat zahlt Herstellern eine Subvention je Stück.', 'E-Bikes', { A: 1 }, 'Eine Subvention wirkt wie eine Kostensenkung für Anbieter – das Angebot verschiebt sich nach rechts.'],
  ['Die Tariflöhne in der Branche steigen deutlich.', 'Handwerksleistungen', { A: -1 }, 'Höhere Lohnkosten verteuern die Produktion – das Angebot verschiebt sich nach links.'],
  ['Der Staat erhebt eine Mengensteuer bei den Anbietern.', 'Zigaretten', { A: -1 }, 'Die Steuer erhöht die Kosten je Stück – die Angebotskurve verschiebt sich um den Steuerbetrag nach oben (links). Preis steigt, Menge sinkt.'],
  ['Die Bevölkerung in der Region wächst stark.', 'Mietwohnungen', { N: 1 }, 'Mehr Haushalte fragen Wohnungen nach – die Nachfrage verschiebt sich nach rechts.'],
  ['Käufer erwarten, dass der Preis nächsten Monat stark steigt.', 'Grafikkarten', { N: 1 }, 'Wer Preissteigerungen erwartet, kauft lieber jetzt – die heutige Nachfrage steigt.'],
  ['Die Einkommen steigen (normales Gut) und gleichzeitig steigen die Rohstoffpreise.', 'Fahrräder', { N: 1, A: -1 }, 'Nachfrage nach rechts und Angebot nach links: Beide Effekte erhöhen den Preis. Die Menge steigt durch die Nachfrage und sinkt durch das Angebot – der Gesamteffekt ist unbestimmt.'],
  ['Eine neue Technik senkt die Kosten, gleichzeitig verliert das Produkt an Beliebtheit.', 'DVD-Player', { N: -1, A: 1 }, 'Angebot nach rechts und Nachfrage nach links: Beide senken den Preis. Die Menge steigt durch das Angebot und sinkt durch die Nachfrage – unbestimmt.'],
  ['Die Bevölkerung wächst und gleichzeitig treten neue Anbieter in den Markt ein.', 'Kitaplätze', { N: 1, A: 1 }, 'Beide Kurven verschieben sich nach rechts: Die Menge steigt eindeutig. Der Preis steigt durch die Nachfrage und sinkt durch das Angebot – unbestimmt.'],
];
function mEffect(s) {
  let p = 0, x = 0;
  if (s.N) { p += s.N; x += s.N; }
  if (s.A) { p -= s.A; x += s.A; }
  const f = v => (v > 0 ? 'up' : v < 0 ? 'down' : '?');
  return { p: f(p), x: f(x) };
}
const ARW = { up: '↑', down: '↓', '?': '?' };
const DIRN = d => (d > 0 ? 'rechts' : 'links');
let _lastMS = -1;
function mGen() {
  let i; do i = ri(0, MS.length - 1); while (i === _lastMS); _lastMS = i;
  const [t, good, s, why] = MS[i], curve = s.N && s.A ? 'B' : s.N ? 'N' : 'A';
  return { t, good, s, why, curve, eff: mEffect(s), q: `Markt für ${good}: ${t}`,
    hints: ['Frag dich zuerst: Betrifft der Auslöser die Käufer (Wunsch, Einkommen, andere Güter) oder die Verkäufer (Kosten, Technik, Zahl der Anbieter)?', `${curve === 'B' ? 'Hier sind beide Marktseiten betroffen.' : curve === 'N' ? 'Hier ist die Nachfrageseite betroffen.' : 'Hier ist die Angebotsseite betroffen.'} Rechts heißt: Zu jedem Preis wird mehr nachgefragt bzw. angeboten. Wo schneiden sich die Kurven danach?`] };
}
function mView(body, task) {
  const B = { a: 110, b: 1, c: 20, d: 1 }, st = { ...B, pol: 'none' };
  let ghost = null;
  const box = h('div', { class: 'tr-chart tr-chart-sm' });
  const chart = chartHost(box, W => mSvg(W, st, { ghost }).svg);
  const choice = {};
  const groups = h('div', { class: 'tr-qgrid' });
  const dirRow = {};
  const grp = (k, lab, opts, onPick) => { const c = chips(opts, v => { choice[k] = v; onPick?.(v); clear(); }, lab); const row = h('div', { class: 'tr-q' }, h('span', { class: 'tr-lbl' }, lab), c.el); groups.append(row); return { c, row }; };
  const cv = grp('curve', 'Welche Kurve verschiebt sich?', [['N', 'Nachfrage'], ['A', 'Angebot'], ['B', 'Beide']], v => { dirRow.N.row.classList.toggle('hidden', v === 'A'); dirRow.A.row.classList.toggle('hidden', v === 'N'); });
  dirRow.N = grp('N', 'Richtung Nachfrage', [['-1', '← links'], ['1', 'rechts →']]);
  dirRow.A = grp('A', 'Richtung Angebot', [['-1', '← links'], ['1', 'rechts →']]);
  dirRow.N.row.classList.add('hidden'); dirRow.A.row.classList.add('hidden');
  const gp = grp('p', 'Gleichgewichtspreis', [['up', '↑ steigt'], ['down', '↓ sinkt'], ['?', '? unbestimmt']]);
  const gx = grp('x', 'Gleichgewichtsmenge', [['up', '↑ steigt'], ['down', '↓ sinkt'], ['?', '? unbestimmt']]);
  const rows = { curve: cv, N: dirRow.N, A: dirRow.A, p: gp, x: gx };
  function clear() { Object.values(rows).forEach(r => r.row.classList.remove('tr-ok', 'tr-bad')); }
  body.append(h('div', { class: 'tr-mgrid' }, box, groups));
  function animate() {
    ghost = { ...B };
    const tA = B.a + (task.s.N || 0) * 18 * B.b, tC = B.c - (task.s.A || 0) * 18 * B.d, t0 = performance.now(), dur = reduced() ? 1 : 900;
    const tick = now => {
      if (!box.isConnected) return;
      const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) ** 3;
      st.a = B.a + (tA - B.a) * e; st.c = B.c + (tC - B.c) * e; chart.draw();
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  return {
    read: () => ({ ...choice }),
    mark: res => { clear(); for (const [k, ok] of Object.entries(res.rows || {})) rows[k].row.classList.add(ok ? 'tr-ok' : 'tr-bad'); },
    lock: () => Object.values(rows).forEach(r => r.c.lock()),
    reveal: () => { cv.c.set(task.curve); choice.curve = task.curve; dirRow.N.row.classList.toggle('hidden', !task.s.N); dirRow.A.row.classList.toggle('hidden', !task.s.A); if (task.s.N) dirRow.N.c.set(String(task.s.N)); if (task.s.A) dirRow.A.c.set(String(task.s.A)); gp.c.set(task.eff.p); gx.c.set(task.eff.x); },
    done: animate,
  };
}
function mCheck(task, a) {
  if (!a.curve) return { incomplete: 'Wähle zuerst, welche Kurve sich verschiebt.' };
  if ((a.curve !== 'A' && !a.N) || (a.curve !== 'N' && !a.A)) return { incomplete: 'Wähle die Richtung der Verschiebung.' };
  if (!a.p || !a.x) return { incomplete: 'Gib an, wie sich Preis und Menge verändern.' };
  const msgs = [], errs = [], rows = {};
  const curveOk = a.curve === task.curve;
  rows.curve = curveOk;
  if (!curveOk) {
    errs.push('kurve');
    msgs.push(task.curve === 'B' ? 'Hier passieren zwei Dinge gleichzeitig – überleg, ob beide Marktseiten betroffen sind.' : task.curve === 'N' ? 'Der Auslöser betrifft die Käufer (Zahlungsbereitschaft, Einkommen, andere Güter) – nicht die Kosten der Anbieter.' : 'Der Auslöser betrifft die Kosten bzw. Produktionsmöglichkeiten der Anbieter – also das Angebot, nicht die Nachfrage.');
  }
  let dirOk = true;
  for (const k of ['N', 'A']) {
    if (a.curve === 'B' || a.curve === k) {
      const ok = !!task.s[k] && +a[k] === task.s[k];
      rows[k] = ok;
      if (!ok && task.s[k]) { dirOk = false; errs.push('richtung'); msgs.push(k === 'N' ? 'Die Nachfragekurve verschiebt sich in die andere Richtung. Steigt der Kaufwunsch zu jedem Preis → rechts.' : 'Die Angebotskurve verschiebt sich in die andere Richtung. Sinken die Kosten oder gibt es mehr Anbieter → rechts.'); }
      if (!task.s[k]) dirOk = false;
    }
  }
  for (const [k, lab, err] of [['p', 'Preis', 'preis'], ['x', 'Menge', 'menge']]) {
    const ok = a[k] === task.eff[k];
    rows[k] = ok;
    if (ok) continue;
    errs.push(err);
    if (!curveOk || !dirOk) msgs.push(`${lab}-Effekt stimmt nicht.`);
    else if (task.eff[k] === '?') msgs.push(`${lab}: Die beiden Verschiebungen wirken hier gegeneinander – ohne ihre Stärke zu kennen, ist der Effekt unbestimmt.`);
    else if (a[k] === '?') msgs.push(`${lab}: Der Effekt ist eindeutig – ${task.curve === 'B' ? 'beide Verschiebungen wirken in dieselbe Richtung' : 'bei nur einer Verschiebung ist die Richtung klar'}.`);
    else msgs.push(`${lab}-Effekt falsch: Verfolge, wo sich die verschobene Kurve mit der anderen schneidet.`);
  }
  return msgs.length ? { ok: false, msgs, errs, rows } : { ok: true, msgs: [task.why], rows };
}
const MARKT = {
  explain: `<p>Auf einem Wettbewerbsmarkt bildet sich der Preis dort, wo <b>Angebot</b> und <b>Nachfrage</b> sich schneiden. Ändert sich ein anderer Faktor als der eigene Preis, <b>verschiebt</b> sich die ganze Kurve.</p>
  <ul><li>Nachfrage: Einkommen, Präferenzen, Preise von Substituten/Komplementen, Erwartungen, Zahl der Käufer.</li><li>Angebot: Faktorpreise, Technik, Zahl der Anbieter, Steuern/Subventionen.</li><li><b>Konsumentenrente</b>: Fläche zwischen Nachfragekurve und Preis. <b>Produzentenrente</b>: zwischen Preis und Angebotskurve.</li><li>Steuern und bindende Preisgrenzen verkleinern die gehandelte Menge – es entsteht ein <b>Wohlfahrtsverlust</b> (schraffiert).</li></ul>`,
  explore: marktExplore,
  practice: (stage, ctx, T) => practice(stage, ctx, T, {
    gen: mGen, prompt: t => [h('div', { class: 'tr-scen' }, h('span', { class: 'tag' }, 'Markt für ' + t.good), h('p', null, t.t))], view: mView, check: mCheck,
    solution: t => h('div', null, h('p', null, `${t.curve === 'B' ? 'Beide Kurven' : t.curve === 'N' ? 'Nachfrage' : 'Angebot'}: ${Object.entries(t.s).map(([k, v]) => `${k === 'N' ? 'Nachfrage' : 'Angebot'} nach ${DIRN(v)}`).join(', ')} · Preis ${ARW[t.eff.p]} · Menge ${ARW[t.eff.x]}`), h('p', null, t.why)),
    askText: t => `Markt für ${t.good}: ${t.t} Welche Kurve verschiebt sich, in welche Richtung, und was passiert mit Gleichgewichtspreis und -menge?`,
    attempt: a => `Kurve: ${({ N: 'Nachfrage', A: 'Angebot', B: 'beide' })[a.curve] || '?'}${a.N ? ', Nachfrage nach ' + DIRN(+a.N) : ''}${a.A ? ', Angebot nach ' + DIRN(+a.A) : ''}; Preis ${ARW[a.p] || '?'}, Menge ${ARW[a.x] || '?'}`,
  }),
};

/* ================= 6 · Bilanz sortieren (§ 266 HGB) ================= */
const BCAT = { AV: ['Aktiva', 'A. Anlagevermögen'], UV: ['Aktiva', 'B. Umlaufvermögen'], ARAP: ['Aktiva', 'C. Rechnungsabgrenzung'], EK: ['Passiva', 'A. Eigenkapital'], RST: ['Passiva', 'B. Rückstellungen'], VB: ['Passiva', 'C. Verbindlichkeiten'], PRAP: ['Passiva', 'D. Rechnungsabgrenzung'] };
const BIL = [
  ['Grundstücke und Gebäude', 'AV', 'Dient dem Betrieb dauerhaft als Standort.'],
  ['Technische Anlagen und Maschinen', 'AV', 'Wird über viele Jahre in der Produktion genutzt.'],
  ['Betriebs- und Geschäftsausstattung', 'AV', 'Büromöbel, IT, Werkzeuge – langfristig genutzt.'],
  ['Firmen-Lkw', 'AV', 'Ein Betriebsfahrzeug wird mehrere Jahre genutzt.'],
  ['Erworbene Software-Lizenzen', 'AV', 'Immaterieller Vermögensgegenstand, dauerhaft genutzt.'],
  ['Geschäfts- oder Firmenwert', 'AV', 'Entsteht beim Unternehmenskauf und wirkt langfristig (§ 246 Abs. 1 HGB).'],
  ['Beteiligungen', 'AV', 'Anteile, die eine dauerhafte Verbindung zu einem anderen Unternehmen schaffen sollen.'],
  ['Wertpapiere des Anlagevermögens', 'AV', 'Werden langfristig gehalten – eine Finanzanlage.'],
  ['Anlagen im Bau', 'AV', 'Wird nach Fertigstellung dauerhaft genutzt – zählt schon jetzt zu den Sachanlagen.'],
  ['Roh-, Hilfs- und Betriebsstoffe', 'UV', 'Werden in der Produktion verbraucht – kurzfristiger Umschlag.'],
  ['Unfertige Erzeugnisse', 'UV', 'Vorräte, die noch in Arbeit sind und bald verkauft werden.'],
  ['Fertige Erzeugnisse und Waren', 'UV', 'Zum baldigen Verkauf bestimmt – Teil der Vorräte.'],
  ['Forderungen aus Lieferungen und Leistungen', 'UV', 'Offene Kundenrechnungen, meist in wenigen Wochen bezahlt.'],
  ['Sonstige Vermögensgegenstände', 'UV', 'Kurzfristige Ansprüche, z. B. Steuererstattungen.'],
  ['Kassenbestand', 'UV', 'Flüssige Mittel – sofort verfügbar.'],
  ['Guthaben bei Kreditinstituten', 'UV', 'Bankguthaben sind flüssige Mittel.'],
  ['Wertpapiere zur kurzfristigen Anlage', 'UV', 'Nur vorübergehend gehalten – also nicht dauerhaft.'],
  ['Im Voraus bezahlte Versicherung für das Folgejahr', 'ARAP', 'Ausgabe vor dem Stichtag, Aufwand erst danach (§ 250 Abs. 1 HGB).'],
  ['Im Dezember bezahlte Miete für Januar', 'ARAP', 'Zahlung im alten Jahr, Aufwand im neuen Jahr.'],
  ['Gezeichnetes Kapital', 'EK', 'Das von den Gesellschaftern übernommene Haftungskapital.'],
  ['Kapitalrücklage', 'EK', 'Von außen zugeführtes Kapital, z. B. Agio bei einer Kapitalerhöhung.'],
  ['Gewinnrücklagen', 'EK', 'Einbehaltene Gewinne früherer Jahre gehören den Eigentümern.'],
  ['Jahresüberschuss', 'EK', 'Der Gewinn des Geschäftsjahres steht den Eigentümern zu.'],
  ['Pensionsrückstellungen', 'RST', 'Künftige Betriebsrenten – Höhe und Zeitpunkt sind ungewiss.'],
  ['Steuerrückstellungen', 'RST', 'Steuerschuld für das abgelaufene Jahr, die Höhe ist noch nicht festgesetzt.'],
  ['Rückstellung für Prozesskosten', 'RST', 'Ungewisse Verpflichtung aus einem laufenden Rechtsstreit.'],
  ['Rückstellung für unterlassene Instandhaltung', 'RST', 'Aufwandsrückstellung, Nachholung innerhalb von 3 Monaten (§ 249 Abs. 1 HGB).'],
  ['Verbindlichkeiten gegenüber Kreditinstituten', 'VB', 'Bankdarlehen – Höhe und Fälligkeit stehen fest.'],
  ['Verbindlichkeiten aus Lieferungen und Leistungen', 'VB', 'Offene Lieferantenrechnungen – sicher in Höhe und Fälligkeit.'],
  ['Erhaltene Anzahlungen auf Bestellungen', 'VB', 'Wir schulden dem Kunden noch die Lieferung.'],
  ['Anleihen', 'VB', 'Am Kapitalmarkt aufgenommenes Fremdkapital mit festem Rückzahlungsbetrag.'],
  ['Sonstige Verbindlichkeiten', 'VB', 'Z. B. noch abzuführende Lohnsteuer – feststehende Schuld.'],
  ['Im Voraus erhaltene Miete für Januar', 'PRAP', 'Einnahme vor dem Stichtag, Ertrag erst danach (§ 250 Abs. 2 HGB).'],
  ['Vorab vereinnahmte Lizenzgebühr für das Folgejahr', 'PRAP', 'Geld erhalten, die Leistung folgt aber erst im neuen Jahr.'],
];
function bilGen() {
  let items;
  do items = shuffle(BIL).slice(0, 10); while (new Set(items.map(i => i[1])).size < 5 || !items.some(i => BCAT[i[1]][0] === 'Passiva') || !items.some(i => BCAT[i[1]][0] === 'Aktiva'));
  return { items, hints: ['Aktiva zeigen, wo das Kapital steckt (Mittelverwendung). Passiva zeigen, woher es kommt (Mittelherkunft): Eigen- oder Fremdkapital.', 'Anlagevermögen dient dauerhaft, Umlaufvermögen kurzfristig. Rückstellungen sind ungewiss in Höhe oder Fälligkeit, Verbindlichkeiten sicher. RAP: Zahlung vor dem Stichtag, Aufwand bzw. Ertrag danach.'] };
}
function bilView(body, task) {
  const place = new Map(), els = [];
  let sel = null, locked = false, dragged = false;
  const pool = h('div', { class: 'tr-pool tr-bin', 'data-cat': '', tabindex: '0', 'data-noenter': '', 'aria-label': 'Ablage: noch nicht zugeordnete Posten' });
  const bins = {};
  const col = side => h('div', { class: 'tr-bcol' }, h('div', { class: 'tr-bcol-h' }, side), Object.entries(BCAT).filter(([, v]) => v[0] === side).map(([k, v]) => {
    const items = h('div', { class: 'tr-bin-items' });
    const b = h('div', { class: 'tr-bin', 'data-cat': k, tabindex: '0', 'data-noenter': '', 'aria-label': `${side} ${v[1]}` }, h('div', { class: 'tr-bin-h' }, v[1]), items);
    bins[k] = { el: b, items };
    return b;
  }));
  const board = h('div', { class: 'tr-bboard' }, col('Aktiva'), col('Passiva'));
  const target = cat => (cat ? bins[cat].items : pool);
  function clearMarks() { els.forEach(e => e.classList.remove('tr-ok', 'tr-bad')); }
  function select(i) { sel = sel === i ? null : i; els.forEach((e, j) => { e.classList.toggle('pick', j === sel); e.setAttribute('aria-pressed', j === sel); }); body.classList.toggle('tr-selecting', sel != null); }
  function move(i, cat) {
    place.set(i, cat || null); target(cat).append(els[i]); els[i].classList.remove('tr-ok', 'tr-bad');
    els[i].animate?.([{ transform: 'scale(.94)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  task.items.forEach((it, i) => {
    const e = h('button', { type: 'button', class: 'tr-item', 'aria-pressed': 'false' }, it[0]);
    els.push(e); place.set(i, null); pool.append(e);
    e.addEventListener('click', ev => { ev.stopPropagation(); if (dragged) { dragged = false; return; } if (!locked) select(i); });
    e.addEventListener('pointerdown', ev => {
      if (locked || ev.button > 0) return;
      const sx = ev.clientX, sy = ev.clientY;
      let ghost = null, over = null, ox = 0, oy = 0;
      const mv = m => {
        if (!ghost) {
          if (Math.hypot(m.clientX - sx, m.clientY - sy) < 6) return;
          const r = e.getBoundingClientRect(); ox = sx - r.left; oy = sy - r.top;
          ghost = e.cloneNode(true); ghost.className = 'tr-item tr-ghost'; ghost.style.width = r.width + 'px';
          document.body.append(ghost); e.classList.add('tr-dragging'); dragged = true;
        }
        ghost.style.transform = `translate(${m.clientX - ox}px, ${m.clientY - oy}px)`;
        const t = document.elementFromPoint(m.clientX, m.clientY)?.closest('.tr-bin');
        const nt = t && body.contains(t) ? t : null;
        if (nt !== over) { over?.classList.remove('tr-over'); nt?.classList.add('tr-over'); over = nt; }
      };
      const up = () => {
        e.removeEventListener('pointermove', mv); e.removeEventListener('pointerup', up); e.removeEventListener('pointercancel', up);
        if (!ghost) return;
        ghost.remove(); e.classList.remove('tr-dragging'); over?.classList.remove('tr-over');
        if (over) { move(i, over.dataset.cat); if (sel != null) select(sel); }
        setTimeout(() => { dragged = false; }, 0);
      };
      try { e.setPointerCapture(ev.pointerId); } catch { /* */ }
      e.addEventListener('pointermove', mv); e.addEventListener('pointerup', up); e.addEventListener('pointercancel', up);
    });
  });
  const drop = b => { if (locked || sel == null) return; move(sel, b.dataset.cat); select(sel); };
  [pool, ...Object.values(bins).map(b => b.el)].forEach(b => {
    b.addEventListener('click', ev => { if (!ev.target.closest('.tr-item')) drop(b); });
    b.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target === b) { ev.preventDefault(); drop(b); } });
  });
  body.append(h('p', { class: 'tr-mute tr-small' }, 'Ziehe die Posten in die richtige Gruppe – oder tippe erst einen Posten und dann die Gruppe an.'), pool, board);
  return {
    read: () => task.items.map((_, i) => place.get(i)),
    mark: res => { clearMarks(); (res.per || []).forEach((ok, i) => els[i].classList.add(ok ? 'tr-ok' : 'tr-bad')); },
    lock: () => { locked = true; if (sel != null) select(sel); els.forEach(e => e.setAttribute('aria-disabled', 'true')); body.classList.add('tr-locked'); },
    reveal: () => task.items.forEach((it, i) => { move(i, it[1]); els[i].classList.add('tr-ok'); }),
  };
}
function bilCheck(task, a) {
  const open = a.filter(x => !x).length;
  if (open) return { incomplete: `Ordne zuerst alle Posten zu – noch ${open} offen.` };
  const msgs = [], errs = [], per = [];
  task.items.forEach(([n, cat, why], i) => {
    const ok = a[i] === cat; per.push(ok);
    if (ok) return;
    const side = BCAT[a[i]][0] !== BCAT[cat][0];
    errs.push(side ? 'seite' : 'gruppe');
    msgs.push(`„${n}“: ${side ? 'falsche Bilanzseite' : 'richtige Seite, falsche Gruppe'} – ${why}`);
  });
  const k = per.filter(Boolean).length;
  return msgs.length ? { ok: false, title: `${k} von ${per.length} richtig`, msgs, errs, per } : { ok: true, msgs: [`Alle ${per.length} Posten stehen an der richtigen Stelle der Bilanz.`], per };
}
const BILANZ = {
  explain: `<p>Die Bilanz nach <b>§ 266 HGB</b> stellt das Vermögen (<b>Aktiva</b>, Mittelverwendung) dem Kapital (<b>Passiva</b>, Mittelherkunft) gegenüber. Beide Seiten sind immer gleich groß.</p>
  <ul><li>Aktiva: A. Anlagevermögen (dauerhaft) · B. Umlaufvermögen (kurzfristig) · C. Rechnungsabgrenzungsposten</li><li>Passiva: A. Eigenkapital · B. Rückstellungen (ungewiss) · C. Verbindlichkeiten (sicher) · D. Rechnungsabgrenzungsposten</li></ul>`,
  practice: (stage, ctx, T) => practice(stage, ctx, T, {
    gen: bilGen, prompt: () => h('p', null, 'Sortiere die 10 Posten in die Bilanzgliederung nach § 266 HGB.'), view: bilView, check: bilCheck,
    solution: t => solBlock(t.items.map(([n, c]) => `${n} → ${BCAT[c][0]}, ${BCAT[c][1]}`)),
    askText: t => `Ordne diese Bilanzposten nach § 266 HGB zu: ${t.items.map(i => i[0]).join('; ')}.`,
    attempt: (a, t) => t.items.map(([n], i) => `${n} → ${a[i] ? BCAT[a[i]][1] : '?'}`).join('; '),
  }),
};

/* ================= Registry & Einstieg ================= */
export const TRAINERS = [
  { id: 'buchung', title: 'Buchungssätze', area: 'Rechnungswesen', desc: 'Geschäftsvorfälle nach HGB buchen – mit Umsatzsteuer, Skonto, Abschreibung und Abgrenzung.', icon: '<path d="M12 3v18M7 21h10M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>' },
  { id: 'tkonten', title: 'T-Konten & Abschluss', area: 'Rechnungswesen', desc: 'Von der Eröffnungsbilanz über die Buchungen bis zum Schlussbestand.', icon: '<path d="M3 5h18M12 5v15M6 9h3M6 12h3M15 9h3M15 15h3"/>' },
  { id: 'breakeven', title: 'Break-even & Deckungsbeitrag', area: 'Kostenrechnung', desc: 'Gewinnschwelle, Preisuntergrenzen und Engpassplanung – live im Diagramm.', icon: '<path d="M3 3v18h18M6 17L20 6M6 11l14 5"/>' },
  { id: 'kapitalwert', title: 'Investitionsrechnung', area: 'Investition & Finanzierung', desc: 'Kapitalwert, Annuität, interner Zinsfuß und Amortisation Schritt für Schritt.', icon: '<path d="M3 3v18h18M7 15l4-4 3 3 6-6M16 8h4v4"/>' },
  { id: 'markt', title: 'Angebot & Nachfrage', area: 'VWL · Mikroökonomie', desc: 'Marktgleichgewicht, Renten, Steuern und Preisgrenzen – Kurven einfach verschieben.', icon: '<path d="M4 3v17h17M7 6l12 12M7 18L19 6"/>' },
  { id: 'bilanz', title: 'Bilanz sortieren', area: 'Rechnungswesen', desc: 'Bilanzposten per Drag & Drop in die Gliederung nach § 266 HGB einordnen.', icon: '<path d="M3 5h18v14H3zM12 5v14M6 9h3M6 12h3M15 9h3M15 12h3"/>' },
];
const BUILD = { buchung: BUCH, tkonten: TKON, breakeven: BEVEN, kapitalwert: KWERT, markt: MARKT, bilanz: BILANZ };

function pickerView(ctx) {
  const grid = h('div', { class: 'tr-grid' }, TRAINERS.map((T, i) => {
    const s = getStats(T.id);
    const card = h('button', { type: 'button', class: 'tr-card', style: `animation-delay:${i * 40}ms` },
      h('div', { class: 'tr-ico' }, svgIcon(T.icon)), h('div', { class: 'eyebrow' }, T.area), h('h3', null, T.title), h('p', null, T.desc),
      h('div', { class: 'tr-card-f' }, s.attempts ? [h('span', null, `${s.correct} gelöst`), h('span', null, `Serie ${s.streak}`)] : h('span', null, 'Noch nicht geübt'), svgIcon(I.next, 'ico tr-go')));
    card.addEventListener('click', () => openTrainer(ctx, T.id, true));
    return card;
  }));
  ctx.root.replaceChildren(h('div', { class: 'tr tr-picker' }, h('header', { class: 'tr-phead' }, h('div', { class: 'eyebrow' }, 'Trainer'), h('h2', null, 'Üben, bis es sitzt'), h('p', null, 'Unendlich viele Aufgaben, sofort geprüft. Jede Lösung wird berechnet – und bei Fehlern sagt dir der Trainer genau, wo es hakt.')), grid));
}
function openTrainer(ctx, id, fromPicker) {
  const T = TRAINERS.find(t => t.id === id), B = BUILD[id];
  const wrap = h('div', { class: 'tr tr-page' });
  if (fromPicker) wrap.append(h('button', { class: 'btn ghost sm tr-back', type: 'button', onclick: () => pickerView(ctx) }, svgIcon(I.back), 'Alle Trainer'));
  wrap.append(h('header', { class: 'tr-head' }, h('div', { class: 'tr-ico' }, svgIcon(T.icon)), h('div', { class: 'tr-head-t' }, h('div', { class: 'eyebrow' }, 'Trainer · ' + T.area), h('h2', null, T.title), h('p', null, T.desc))));
  const ex = h('details', { class: 'tr-explain' }, h('summary', null, 'Kurz erklärt'));
  const exb = h('div', { class: 'tr-explain-b' }); exb.innerHTML = B.explain; ex.append(exb);
  if (typeof matchMedia !== 'function' || matchMedia('(min-width: 760px)').matches) ex.open = true;
  wrap.append(ex);
  const stage = h('div', { class: 'tr-stage' });
  if (B.explore) {
    const modes = [['explore', 'Entdecken'], ['practice', 'Übung']];
    const btns = modes.map(([k, l]) => h('button', { type: 'button', class: 'tr-mode', role: 'tab', 'data-k': k }, l));
    const show = k => { btns.forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); stage.replaceChildren(); (k === 'explore' ? B.explore(stage, ctx, T) : B.practice(stage, ctx, T)); };
    btns.forEach(b => b.addEventListener('click', () => show(b.dataset.k)));
    wrap.append(h('div', { class: 'tr-modes', role: 'tablist', 'aria-label': 'Modus' }, btns), stage);
    ctx.root.replaceChildren(wrap);
    show('explore');
  } else {
    wrap.append(stage);
    ctx.root.replaceChildren(wrap);
    B.practice(stage, ctx, T);
  }
  if (fromPicker) wrap.scrollIntoView?.({ block: 'start', behavior: 'instant' });
}

export function renderTrainer(root, { kind, onAsk } = {}) {
  if (!root || !(root instanceof Element)) return;
  const ctx = { root, onAsk: typeof onAsk === 'function' ? onAsk : null };
  root.replaceChildren();
  if (kind && BUILD[kind]) openTrainer(ctx, kind, false); else pickerView(ctx);
}
