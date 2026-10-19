// BWL-Lexikon: über 800 Begriffe aus allen BWL-/VWL-Fächern, sofort durchsuchbar (auch Abkürzungen,
// englische Begriffe, Tippfehler-tolerant). Nicht dabei? Max erklärt es.
import { h, ico, ls } from './util.js';
import { L } from './i18n.js';
// Kleiner Formel-Satz ohne Zeichen-Bibliothek: K_f → K<sub>f</sub>, x^2 → x<sup>2</sup>
const esc = t => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = t => esc(t).replace(/\^\(([^()]{1,24})\)/g, '<sup>$1</sup>').replace(/\^([A-Za-z0-9*]{1,6})/g, '<sup>$1</sup>').replace(/_\{([^{}]{1,16})\}/g, '<sub>$1</sub>').replace(/(\b[A-Za-zÄÖÜäöüΔσμρβε])_([A-Za-z0-9ÄÖÜäöü]{1,6})/g, '$1<sub>$2</sub>');
import { haptic } from './dock.js';

let DATA = null;
const RKEY = 'tutor.lex.recent';
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
let LOADING = null;
export function preload() { return load().catch(() => null); }
async function load() {
  if (DATA) return DATA;
  if (LOADING) return LOADING;
  LOADING = (async () => {
  const r = await fetch('/tutor/data/lexikon.json?v=1');
  const arr = await r.json();
  DATA = arr.map((x, i) => Object.assign(x, { i, _t: norm(x.t), _a: (x.a || []).map(norm), _d: norm(x.d) }));
  return DATA;
  })();
  try { return await LOADING; } finally { if (!DATA) LOADING = null; }
}
// Ähnlichkeit für Tippfehler (Levenshtein, früh abbrechen)
function lev(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); best = Math.min(best, cur[j]); }
    if (best > max) return max + 1; prev = cur;
  }
  return prev[b.length];
}
export function search(q, data) {
  const n = norm(q); if (!n) return [];
  const out = [];
  for (const x of data) {
    let s = 0;
    if (x._t === n || x._a.includes(n)) s = 100;
    else if (x._t.startsWith(n)) s = 80 - Math.min(20, x._t.length - n.length);
    else if (x._a.some(a => a.startsWith(n))) s = 70;
    else if (x._t.includes(n)) s = 60;
    else if (x._a.some(a => a.includes(n))) s = 50;
    else if (n.length >= 4 && (lev(n, x._t.slice(0, n.length + 1)) <= (n.length > 7 ? 2 : 1) || lev(n, x._t) <= 2)) s = 40;
    else if (n.length >= 3 && x._d.includes(n)) s = 20;
    if (s) out.push([s, x]);
  }
  return out.sort((a, b) => b[0] - a[0] || a[1].t.length - b[1].t.length).slice(0, 40).map(x => x[1]);
}

// Einziger Filter beim Vorschlagen: Beleidigungen und Anstößiges
const BAD = ['arschloch', 'arsch', 'fick', 'fotze', 'hurensohn', 'hure', 'wichser', 'wixxer', 'schlampe', 'nutte', 'bastard', 'spast', 'missgeburt', 'schwuchtel', 'neger', 'nigger', 'nigga', 'kanake', 'hitler', 'nazi', 'sieg heil', 'penis', 'vagina', 'porno', 'porn', 'titten', 'schwanz', 'muschi', 'pimmel', 'kacke', 'scheiss', 'scheiß', 'scheiße', 'pisse', 'idiot', 'vollidiot', 'depp', 'fuck', 'shit', 'bitch', 'cunt', 'dick', 'slut', 'whore', 'retard', 'faggot', 'sex', 'kys', 'töte', 'umbringen'];
function bad(t) {
  const n = String(t).toLowerCase().replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/@/g, 'a').replace(/\$/g, 's');
  const flat = n.replace(/[^a-zäöüß]+/g, '');
  if (/https?:|www\.|\.(com|de|net|ru)\b/.test(n)) return true;
  return BAD.some(w => { const f = w.replace(/\s+/g, ''); return f.length <= 5 ? new RegExp('(^|[^a-zäöü])' + f + '([^a-zäöü]|$)').test(n) : flat.includes(f); });
}

export async function lexikon(root, { close } = {}) {
  const q = h('input', { type: 'search', class: 'lx-q', placeholder: L('Begriff suchen – z. B. Deckungsbeitrag, EBIT, WACC', 'Search a term – e.g. contribution margin, EBIT, WACC'), 'aria-label': L('Begriff suchen', 'Search term'), autocomplete: 'off', enterkeyhint: 'search' });
  const cats = h('div', { class: 'lx-cats' });
  const list = h('div', { class: 'lx-l', role: 'list' });
  const det = h('div', { class: 'lx-det', hidden: true });
  root.append(h('div', { class: 'lx' }, h('div', { class: 'lx-qw' }, h('span', { html: ico('search') }), q), cats, list, det));
  list.append(h('p', { class: 'lx-none' }, L('Lädt …', 'Loading …')));
  const data = await load().catch(() => null);
  if (!data) { list.replaceChildren(h('p', { class: 'lx-none' }, L('Das Lexikon konnte nicht geladen werden.', 'The glossary could not be loaded.'))); return; }
  let cat = '';
  const ORD = ['Buchführung', 'KLR & Controlling', 'Investition & Finanzierung', 'Marketing', 'Management & Organisation', 'VWL', 'Statistik & Mathe', 'Recht & Steuern', 'IFRS & Analyse', 'Kapitalmarkt & Banking', 'Produktion & Logistik', 'Digital & Start-up'];
  const C = [...new Set(data.map(x => x.c).filter(Boolean))].sort((a, b) => (ORD.indexOf(a) + 1 || 99) - (ORD.indexOf(b) + 1 || 99));
  const drawCats = () => cats.replaceChildren(...['', ...C].map(c => h('button', { type: 'button', class: 'lx-c' + (cat === c ? ' on' : ''), onclick: () => { haptic(); cat = cat === c ? '' : c; drawCats(); draw(); } }, c || L('Alle', 'All') + ' · ' + data.length)));
  const row = x => h('button', { type: 'button', class: 'lx-r', role: 'listitem', onclick: () => show(x) }, h('b', {}, x.t), h('span', {}, x.d.length > 92 ? x.d.slice(0, 90) + '…' : x.d));
  function draw() {
    det.hidden = true; list.hidden = false;
    const v = q.value.trim();
    let res = v ? search(v, data) : null;
    if (res && cat) res = res.filter(x => x.c === cat);
    if (!res) {
      const rec = (ls.get(RKEY, []) || []).map(t => data.find(x => x.t === t)).filter(Boolean);
      const pool = cat ? data.filter(x => x.c === cat).sort((a, b) => a.t.localeCompare(b.t, 'de')) : null;
      list.replaceChildren(...(pool ? pool.map(row) : [rec.length ? h('h4', {}, L('Zuletzt nachgeschlagen', 'Recently looked up')) : null, ...rec.map(row), h('h4', {}, L('Oft gesucht', 'Popular')),
        ...['Deckungsbeitrag', 'Break-even-Point', 'Kapitalwert', 'EBIT', 'Bilanz', 'Abschreibung', 'Preiselastizität der Nachfrage', 'WACC', 'Leverage-Effekt', 'Rückstellungen'].map(t => data.find(x => x.t === t) || data.find(x => x._t.startsWith(norm(t)))).filter(Boolean).map(row)]).filter(Boolean), suggest(''));
      return;
    }
    list.replaceChildren(...res.map(row), askMax(v, !res.length), suggest(v));
  }
  const askMax = (term, empty) => h('div', { class: 'lx-ask' }, empty ? h('p', {}, L(`„${term}“ steht noch nicht im Lexikon.`, `“${term}” isn’t in the glossary yet.`)) : null,
    h('button', { type: 'button', class: 'btn sm primary', onclick: () => ask(term) }, h('span', { html: ico('chat') }), L(`Max erklärt „${term}“`, `Max explains “${term}”`)));
  async function ask(term) {
    haptic();
    try { const m = await import('./assistant.js'); const a = m.isAssistantEnabled() && m.mountAssistant(); if (a && a.ask) { close && close(); a.ask(L(`Erklär mir kurz und klausurtauglich: ${term}`, `Explain briefly, exam-ready: ${term}`)); return; } } catch (e) {}
    location.hash = '#/app/tutor';
  }
  // „Fachbegriff nicht gefunden?“ – Nutzer schlagen Begriffe vor (landet im Feedback), danach freut sich Max
  function suggest(pre) {
    const box = h('div', { class: 'lx-sg' });
    const closed = () => box.replaceChildren(h('button', { type: 'button', class: 'lx-sgb', onclick: () => { haptic(); openF(); } },
      h('span', { class: 'lx-sgx' }, h('b', {}, L('BWL-Fachbegriff nicht gefunden?', 'Business term not found?')), h('small', {}, L('Schreib ihn uns und hilf mit, BWL Max besser zu machen.', 'Send it to us and help make BWL Max better.'))),
      h('span', { class: 'lx-sgp', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' })));
    function openF() {
      const inp = h('input', { type: 'text', class: 'lx-sgi', maxlength: 80, value: pre || '', placeholder: L('Welcher Begriff fehlt?', 'Which term is missing?'), 'aria-label': L('Fehlender Begriff', 'Missing term') });
      const msg = h('small', { class: 'lx-sgm' });
      const send = h('button', { type: 'button', class: 'btn primary sm' }, L('Senden', 'Send'));
      const go = async () => {
        const t = inp.value.replace(/\s+/g, ' ').trim();
        if (t.length < 2) { msg.textContent = L('Schreib den Begriff kurz rein.', 'Type the term first.'); return; }
        if (bad(t)) { msg.textContent = L('Bitte nur Fachbegriffe – ohne Beleidigungen oder Anstößiges.', 'Business terms only – no insults or offensive content.'); msg.classList.add('err'); return; }
        send.disabled = true; send.textContent = L('Sende …', 'Sending …'); msg.textContent = ''; msg.classList.remove('err');
        try { const { ask: a } = await import('./api.js'); await a('feedback', { opts: { kind: 'fehlt', stars: 0, text: 'Lexikon – Begriff fehlt: ' + t, name: '', info: '', consent: false } }); } catch (e) {}
        haptic(); thanks(t);
      };
      send.addEventListener('click', go);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      box.replaceChildren(h('div', { class: 'lx-sgf' }, h('b', {}, L('Welcher BWL-Begriff fehlt?', 'Which business term is missing?')), h('div', { class: 'lx-sgr' }, inp, send), msg));
      setTimeout(() => inp.focus(), 30);
    }
    function thanks(t) {
      const fc = h('div', { class: 'lx-sgface' });
      box.replaceChildren(h('div', { class: 'lx-sgt' }, fc, h('div', {}, h('b', {}, L('Danke dir!', 'Thank you!')), h('small', {}, L(`„${t}“ kommt auf meine Liste. Mit Leuten wie dir werd ich jeden Tag schlauer.`, `“${t}” is on my list. People like you make me smarter every day.`)))));
      import('./face.js').then(m => { const f = m.face(fc, { follow: false }); setTimeout(() => f.pulse('happy', 2600), 120); }).catch(() => {});
    }
    closed(); return box;
  }

  function show(x) {
    haptic();
    const r = (ls.get(RKEY, []) || []).filter(t => t !== x.t); r.unshift(x.t); ls.set(RKEY, r.slice(0, 8));
    const rel = (x.s || []).map(t => data.find(y => y.t === t) || data.find(y => y._t === norm(t)) || data.find(y => y._a.includes(norm(t)))).filter(Boolean);
    det.replaceChildren(
      h('button', { type: 'button', class: 'lx-back', onclick: () => { haptic(); draw(); q.focus(); } }, h('span', { html: ico('left') }), L('Zurück', 'Back')),
      h('div', { class: 'lx-cat' }, x.c || ''),
      h('h3', {}, x.t), x.a && x.a.length ? h('div', { class: 'lx-al' }, x.a.join(' · ')) : null,
      h('p', { class: 'lx-d', html: rich(x.d) }),
      x.f ? h('div', { class: 'lx-f', html: rich(x.f) }) : null,
      x.b ? h('p', { class: 'lx-b' }, h('b', {}, L('Beispiel: ', 'Example: ')), h('span', { html: rich(x.b) })) : null,
      rel.length ? h('div', { class: 'lx-rel' }, h('small', {}, L('Verwandt', 'Related')), h('div', {}, rel.map(y => h('button', { type: 'button', class: 'lx-c', onclick: () => show(y) }, y.t)))) : null,
      askMax(x.t, false));
    list.hidden = true; det.hidden = false; det.scrollTop = 0;
  }
  let t = 0;
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 90); });
  q.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = list.querySelector('.lx-r'); if (f) f.click(); } });
  drawCats(); draw();
  if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => q.focus(), 60);
}
