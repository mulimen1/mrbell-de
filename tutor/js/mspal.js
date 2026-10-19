// Mitschrift: Zeichen-Legende – Pfeile, Mathe, Brüche, Griechisch, Währungen, BWL-Kürzel, Markierungen.
// Mit Suche („pfeil“, „summe“, „dollar“, „bruch“ …) und „Zuletzt benutzt“. Laptop: rechts daneben. Handy: ausklappbar.
// Einfügen: „¦“ markiert, wo der Cursor danach steht.
import { h, ico, ls } from './util.js';
import { L } from './i18n.js';

const T = '︎'; // Textdarstellung erzwingen (kein Emoji)
// [Anzeige, Einfügen, Suchbegriffe]
const CATS = () => [
  [L('Pfeile', 'Arrows'), [
    ['→', '→ ', 'pfeil rechts folgt daraus führt zu arrow right'], ['←', '← ', 'pfeil links kommt von arrow left'], ['↔', '↔ ', 'pfeil beidseitig wechselwirkung both'],
    ['↑', '↑', 'pfeil hoch steigt steigend zunahme up increase'], ['↓', '↓', 'pfeil runter sinkt fallend abnahme down decrease'], ['↕', '↕', 'pfeil hoch runter schwankt'],
    ['⇒', '⇒ ', 'folgt implikation daraus folgt implies'], ['⇐', '⇐ ', 'folgt aus'], ['⇔', '⇔ ', 'genau dann äquivalent iff'],
    ['↗', '↗', 'pfeil schräg hoch wächst'], ['↘', '↘', 'pfeil schräg runter'], ['↳', '↳ ', 'unterpunkt daraus einrückung'], ['⟶', ' ⟶ ', 'langer pfeil'], ['↻', '↻', 'kreislauf wiederholung zyklus']
  ]],
  [L('Aufzählung', 'Bullets'), [
    ['•', '\n• ', 'bullet punkt aufzählung liste'], ['◦', '\n  ◦ ', 'unterpunkt bullet hohl eingerückt'], ['▪', '\n▪ ', 'bullet quadrat'], ['▸', '\n▸ ', 'bullet dreieck'], ['‣', '\n‣ ', 'bullet pfeil'],
    ['–', '\n– ', 'strich gedankenstrich aufzählung'], ['1.', '\n1. ', 'nummer nummeriert liste'], ['a)', '\na) ', 'buchstabe liste'], ['i.', '\ni. ', 'römisch liste'],
    ['①', '①', 'kreis eins nummer'], ['②', '②', 'kreis zwei'], ['③', '③', 'kreis drei'], ['④', '④', 'kreis vier'], ['⑤', '⑤', 'kreis fünf'],
    ['☐', '\n☐ ', 'checkbox kästchen aufgabe todo'], ['☑' + T, '\n☑' + T + ' ', 'erledigt abgehakt done'], ['○', '○ ', 'kreis leer'], ['■', '■ ', 'quadrat voll']
  ]],
  [L('Zeichen', 'Characters'), [
    ['&', ' & ', 'und zeichen kaufmännisches und ampersand'], ['+', ' + ', 'plus und'], ['@', '@', 'at bei'], ['#', '#', 'nummer raute hashtag anzahl'], ['~', '~', 'tilde ungefähr circa'],
    ['/', ' / ', 'schrägstrich oder pro'], ['|', ' | ', 'senkrecht strich trennung'], ['…', '…', 'auslassung punkte usw'], ['„“', '„¦“', 'anführungszeichen zitat'], ['«»', '«¦»', 'guillemets zitat'],
    ['( )', '(¦)', 'klammer rund'], ['[ ]', '[¦]', 'klammer eckig'], ['{ }', '{¦}', 'klammer geschweift menge'], ['§', '§ ', 'paragraph'], ['©', '©', 'copyright'], ['®', '®', 'marke registered'], ['™', '™', 'trademark'],
    ['′', '′', 'strich minute'], ['″', '″', 'doppelstrich sekunde'], ['¹', '¹', 'fußnote hoch eins'], ['*', '*', 'stern fußnote']
  ]],
  [L('Logik & Mengen', 'Logic & sets'), [
    ['∧', ' ∧ ', 'und logisch and'], ['∨', ' ∨ ', 'oder logisch or'], ['¬', '¬', 'nicht negation'], ['∀', '∀', 'für alle'], ['∃', '∃', 'es gibt existiert'],
    ['⊂', ' ⊂ ', 'teilmenge'], ['∩', ' ∩ ', 'schnittmenge'], ['∪', ' ∪ ', 'vereinigung'], ['∉', ' ∉ ', 'nicht element'], ['ℝ', 'ℝ', 'reelle zahlen'], ['ℕ', 'ℕ', 'natürliche zahlen']
  ]],
  [L('Formen', 'Shapes'), [
    ['□', '□', 'kasten quadrat leer'], ['△', '△', 'dreieck'], ['▽', '▽', 'dreieck unten'], ['◇', '◇', 'raute'], ['◆', '◆', 'raute voll'], ['●', '●', 'punkt kreis voll'], ['◐', '◐', 'halb kreis'],
    ['─', '────────', 'linie trennlinie horizontal'], ['═', '════════', 'doppellinie'], ['│', '│', 'linie senkrecht'], ['┌┐', '┌──────┐\n│ ¦ │\n└──────┘', 'box kasten rahmen'], ['├', '├─ ', 'baum verzweigung'], ['└', '└─ ', 'baum ende']
  ]],
  [L('Rechnen', 'Math'), [
    ['−', ' − ', 'minus'], ['×', ' × ', 'mal multiplizieren times'], ['·', ' · ', 'mal punkt multiplikation'], ['÷', ' ÷ ', 'geteilt division'], ['±', '±', 'plus minus'],
    ['≠', ' ≠ ', 'ungleich not equal'], ['≈', ' ≈ ', 'ungefähr circa approx'], ['≡', ' ≡ ', 'identisch definiert'], ['≤', ' ≤ ', 'kleiner gleich'], ['≥', ' ≥ ', 'größer gleich'],
    ['<', ' < ', 'kleiner'], ['>', ' > ', 'größer'], ['∞', '∞', 'unendlich infinity'], ['√', '√(¦)', 'wurzel root'], ['∑', '∑ ', 'summe sigma sum'], ['∏', '∏ ', 'produkt'],
    ['∫', '∫ ', 'integral'], ['∂', '∂', 'partielle ableitung'], ['Δ', 'Δ', 'delta änderung differenz'], ['Ø', 'Ø ', 'durchschnitt mittelwert average'], ['%', '%', 'prozent percent'], ['‰', '‰', 'promille'],
    ['°', '°', 'grad'], ['∝', ' ∝ ', 'proportional'], ['∴', '∴ ', 'also folglich'], ['∈', ' ∈ ', 'element von'], ['∅', '∅', 'leere menge']
  ]],
  [L('Brüche & Formeln', 'Fractions & formulas'), [
    ['a⁄b', '(¦) / ()', 'bruch geteilt durch fraction'], ['½', '½', 'halb bruch'], ['⅓', '⅓', 'drittel bruch'], ['¼', '¼', 'viertel bruch'], ['¾', '¾', 'dreiviertel bruch'],
    ['x²', '²', 'hoch zwei quadrat squared'], ['x³', '³', 'hoch drei'], ['xⁿ', '^(¦)', 'hoch n potenz exponent'], ['x₁', '₁', 'index tiefgestellt eins'], ['x₂', '₂', 'index tiefgestellt zwei'], ['xᵢ', '_i', 'index i'], ['xₜ', '_t', 'index t zeit periode'],
    ['x̄', 'x̄', 'mittelwert quer'], ['f(x)', 'f(¦)', 'funktion'], ['Σᵢ', '∑(i=1..n) ', 'summe von i bis n'], ['(1+i)ⁿ', '(1 + i)^n', 'aufzinsen zins zinseszins'], ['1/(1+i)ⁿ', '1 / (1 + i)^n', 'abzinsen barwert diskont'],
    ['ln', 'ln(¦)', 'logarithmus'], ['lim', 'lim ', 'grenzwert'], ['dy/dx', 'dy/dx', 'ableitung differenzieren']
  ]],
  [L('Griechisch', 'Greek'), [
    ['α', 'α', 'alpha'], ['β', 'β', 'beta risiko'], ['γ', 'γ', 'gamma'], ['δ', 'δ', 'delta klein'], ['ε', 'ε', 'epsilon elastizität'], ['η', 'η', 'eta'], ['θ', 'θ', 'theta'],
    ['λ', 'λ', 'lambda'], ['μ', 'μ', 'mu erwartungswert'], ['π', 'π', 'pi gewinn'], ['ρ', 'ρ', 'rho korrelation'], ['σ', 'σ', 'sigma standardabweichung'], ['τ', 'τ', 'tau'], ['φ', 'φ', 'phi'], ['ω', 'ω', 'omega'], ['Ω', 'Ω', 'omega groß']
  ]],
  [L('Geld & Einheiten', 'Money & units'), [
    ['€', '€', 'euro währung'], ['$', '$', 'dollar usd währung'], ['£', '£', 'pfund gbp'], ['¥', '¥', 'yen yuan'], ['₣', 'CHF', 'franken chf'], ['₿', '₿', 'bitcoin krypto'], ['¢', '¢', 'cent'],
    ['T€', 'T€', 'tausend euro'], ['Mio.', 'Mio. ', 'millionen'], ['Mrd.', 'Mrd. ', 'milliarden'], ['p. a.', ' p. a.', 'pro jahr per annum'], ['Stk.', ' Stk.', 'stück'], ['h', ' h', 'stunde'], ['GE', ' GE', 'geldeinheiten'], ['ME', ' ME', 'mengeneinheiten']
  ]],
  [L('BWL-Bausteine', 'Business shorthand'), [
    ['Soll | Haben', 'Soll: ¦ | Haben: ', 'buchung t konto soll haben'], ['an', ' an ', 'buchungssatz an'], ['DB', 'DB', 'deckungsbeitrag'], ['K_f', 'K_f', 'fixkosten'], ['k_v', 'k_v', 'variable stückkosten'],
    ['p · x', 'p · x', 'umsatz erlös preis menge'], ['G = E − K', 'G = E − K', 'gewinn erlös kosten'], ['ROI', 'ROI', 'return on investment rendite'], ['EBIT', 'EBIT', 'ebit gewinn vor zinsen steuern'],
    ['EK | FK', 'EK | FK', 'eigenkapital fremdkapital'], ['AV | UV', 'AV | UV', 'anlagevermögen umlaufvermögen'], ['GuV', 'GuV', 'gewinn und verlust'], ['HGB', 'HGB', 'handelsgesetzbuch'], ['IFRS', 'IFRS', 'ifrs'],
    ['§', '§ ', 'paragraph gesetz recht'], ['vs.', ' vs. ', 'versus gegenüber vergleich'], ['ggü.', ' ggü. ', 'gegenüber'], ['i. d. R.', ' i. d. R. ', 'in der regel'], ['bzgl.', ' bzgl. ', 'bezüglich'], ['z. B.', ' z. B. ', 'zum beispiel'], ['d. h.', ' d. h. ', 'das heißt'], ['vgl.', ' vgl. ', 'vergleiche']
  ]],
  [L('Markieren', 'Mark up'), [
    ['★' + T, '★' + T + ' ', 'wichtig stern important'], ['(?)', ' (?) ', 'unklar frage nachfragen unclear'], ['!', '! ', 'achtung wichtig'], ['✓', '✓ ', 'richtig verstanden haken check'], ['✗', '✗ ', 'falsch kreuz'],
    ['[K]', '[Klausur] ', 'klausurrelevant prüfung exam'], ['Def.', '\nDef.: ', 'definition'], ['Bsp.', '\nBsp.: ', 'beispiel example'], ['Merke', '\nMerke: ', 'merke merksatz'], ['Formel', '\nFormel: ', 'formel'],
    ['+ / −', '\n+ ¦\n− ', 'vorteile nachteile pro contra'], ['•', '\n• ', 'aufzählung punkt bullet'], ['–', '\n– ', 'strich aufzählung'], ['1.', '\n1. ', 'nummer liste'], ['S. ', ' (S. ¦)', 'seite folie skript']
  ]]
];
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const RKEY = 'tutor.ms.recent';

export function palette(insert, { mobile } = {}) {
  const all = CATS();
  let q = '';
  const recent = () => (ls.get(RKEY, []) || []).slice(0, 10);
  const use = it => { insert(it[1]); const r = recent().filter(x => x[0] !== it[0]); r.unshift(it); ls.set(RKEY, r.slice(0, 10)); if (!q) draw(); };
  const btn = it => h('button', { type: 'button', class: 'mp-k' + (it[0].length > 2 && !/^[x(]/.test(it[0]) || /\s/.test(it[0]) || it[0].length > 4 ? ' w' : ''), html: it[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/_(\w+)/, '<sub>$1</sub>'), title: it[2].split(' ').slice(0, 3).join(', '), onmousedown: e => e.preventDefault(), onclick: () => use(it) });
  const search = h('input', { type: 'search', class: 'mp-q', placeholder: L('Suchen: Pfeil, Summe, Dollar, Bruch …', 'Search: arrow, sum, dollar, fraction …'), 'aria-label': L('Zeichen suchen', 'Search symbols'),
    oninput: e => { q = norm(e.target.value.trim()); draw(); } });
  const body = h('div', { class: 'mp-b' });
  function draw() {
    if (q) {
      const hits = all.flatMap(([, items]) => items).filter(it => norm(it[2] + ' ' + it[0]).includes(q));
      body.replaceChildren(hits.length ? h('div', { class: 'mp-g' }, hits.map(btn)) : h('p', { class: 'mp-none' }, L('Nichts gefunden – probier „Pfeil“, „Summe“ oder „Euro“.', 'Nothing found – try “arrow”, “sum” or “euro”.')));
      return;
    }
    const r = recent();
    body.replaceChildren(
      r.length ? h('section', {}, h('h4', {}, L('Zuletzt', 'Recent')), h('div', { class: 'mp-g' }, r.map(btn))) : null,
      ...all.map(([t, items]) => h('section', {}, h('h4', {}, t), h('div', { class: 'mp-g' }, items.map(btn)))));
  }
  draw();
  const el = h('aside', { class: 'mp' + (mobile ? ' mob' : ''), 'aria-label': L('Zeichen & Formen', 'Symbols & shapes') }, h('div', { class: 'mp-h' }, h('span', { html: ico('search') }), search), body);
  return el;
}

// ---------- Blatt: Papierart, Papierfarbe, Tinte ----------
export const PAPIER = () => [['lin', L('Liniert', 'Lined')], ['kar', L('Kariert', 'Grid')], ['leer', L('Blanko', 'Blank')]];
export const FARBE = () => [['weiss', L('Weiß', 'White'), '#ffffff', '#d9e2f0'], ['creme', L('Gelblich', 'Cream'), '#fff8e1', '#e6dcc0'], ['orange', L('Orange', 'Orange'), '#ffeedd', '#efd2b5'], ['gruen', L('Grün', 'Green'), '#e9f5ea', '#c7dfc9'], ['blau', L('Hellblau', 'Light blue'), '#e7f1fb', '#c4d6ea']];
export const TINTE = () => [['blau', L('Blau', 'Blue'), '#1f3c88'], ['schwarz', L('Schwarz', 'Black'), '#1d1d1f'], ['gruen', L('Grün', 'Green'), '#1e6b45'], ['rot', L('Rot', 'Red'), '#b3261e'], ['lila', L('Lila', 'Purple'), '#5b3a9a']];
const BKEY = 'tutor.ms.blatt3';   // v3: Standard ist kariert + weiß
export const blattDefault = () => Object.assign({ art: 'kar', farbe: 'weiss', tinte: 'blau' }, ls.get(BKEY, {}) || {});
export const inkOf = b => (TINTE().find(x => x[0] === b.tinte) || TINTE()[0])[2];
export function applyBlatt(el, b) {
  const f = FARBE().find(x => x[0] === b.farbe) || FARBE()[0];
  el.classList.remove('p-lin', 'p-kar', 'p-leer'); el.classList.add('p-' + (PAPIER().some(x => x[0] === b.art) ? b.art : 'lin'));
  el.style.setProperty('--pc', f[2]); el.style.setProperty('--ln', f[3]); el.style.setProperty('--ink', inkOf(b));
}
// Kompakte Auswahl: drei Papierarten, fünf Papierfarben, fünf Tinten
export function blattPicker(b, onChange) {
  const el = h('div', { class: 'mb' });
  const set = (k, v) => { b[k] = v; b.v = 3; ls.set(BKEY, { art: b.art, farbe: b.farbe, tinte: b.tinte }); draw(); onChange(b); };
  function draw() {
    el.replaceChildren(
      h('div', { class: 'mb-r' }, h('small', {}, L('Papier', 'Paper')), h('div', { class: 'mb-o' }, PAPIER().map(([k, n]) => h('button', { type: 'button', class: 'mb-p p-' + k + (b.art === k ? ' on' : ''), 'aria-pressed': String(b.art === k), onclick: () => set('art', k) }, h('i'), n)))),
      h('div', { class: 'mb-r' }, h('small', {}, L('Farbe', 'Colour')), h('div', { class: 'mb-o' }, FARBE().map(([k, n, c]) => h('button', { type: 'button', class: 'mb-s' + (b.farbe === k ? ' on' : ''), title: n, 'aria-label': n, 'aria-pressed': String(b.farbe === k), style: { background: c }, onclick: () => set('farbe', k) })))),
      h('div', { class: 'mb-r' }, h('small', {}, L('Tinte', 'Ink')), h('div', { class: 'mb-o' }, TINTE().map(([k, n, c]) => h('button', { type: 'button', class: 'mb-s ink' + (b.tinte === k ? ' on' : ''), title: n, 'aria-label': n, 'aria-pressed': String(b.tinte === k), style: { background: c }, onclick: () => set('tinte', k) })))));
  }
  draw(); return el;
}

// ---------- Schreiben: Aufzählungen fortsetzen, in jede Zeile klicken ----------
const BUL = /^(\s*)(•|◦|▪|▸|‣|–|-|☐|☑︎?|\d+\.|[a-z]\)|[ivx]+\.)\s/;
export function smartTextarea(ta, onChange) {
  ta.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    const v = ta.value, p = ta.selectionStart; if (p !== ta.selectionEnd) return;
    const ls0 = v.lastIndexOf('\n', p - 1) + 1, line = v.slice(ls0, p), m = line.match(BUL); if (!m) return;
    e.preventDefault();
    if (!line.slice(m[0].length).trim()) { ta.setRangeText('', ls0, p, 'end'); onChange(); return; }   // leerer Punkt → Liste beenden
    let mk = m[2];
    if (/^\d+\.$/.test(mk)) mk = (parseInt(mk) + 1) + '.';
    else if (/^[a-z]\)$/.test(mk)) mk = String.fromCharCode(mk.charCodeAt(0) + 1) + ')';
    else if (/^☑/.test(mk)) mk = '☐';
    ta.setRangeText('\n' + m[1] + mk + ' ', p, p, 'end'); onChange();
  });
  // Unterhalb des Textes klicken: Zeilen auffüllen, damit man genau dort weiterschreibt
  const mirror = h('div', { 'aria-hidden': 'true', style: { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre-wrap', wordWrap: 'break-word', left: '-9999px', top: '0' } });
  document.body.appendChild(mirror);
  ta.addEventListener('mouseup', e => fill(e.clientY));
  ta.addEventListener('touchend', e => { const t = e.changedTouches && e.changedTouches[0]; if (t) setTimeout(() => fill(t.clientY), 30); });
  function fill(y) {
    if (ta.selectionStart !== ta.value.length || ta.selectionEnd !== ta.value.length) return;
    const cs = getComputedStyle(ta), lh = parseFloat(cs.lineHeight) || 32;
    Object.assign(mirror.style, { width: ta.clientWidth + 'px', font: cs.font, padding: cs.padding, boxSizing: 'border-box', letterSpacing: cs.letterSpacing });
    mirror.textContent = ta.value + '​';
    const textBottom = ta.getBoundingClientRect().top + mirror.scrollHeight - parseFloat(cs.paddingBottom) - ta.scrollTop;
    const n = Math.floor((y - textBottom) / lh) + 1;
    if (n > 0 && n < 60) { ta.setRangeText('\n'.repeat(n), ta.value.length, ta.value.length, 'end'); onChange(); }
  }
  return () => mirror.remove();
}
// Aktuelle Zeile als Aufzählungspunkt (oder wieder normal)
export function toggleBullet(ta, onChange) {
  const v = ta.value, p = ta.selectionStart, ls0 = v.lastIndexOf('\n', p - 1) + 1, m = v.slice(ls0).match(BUL);
  let np;
  if (m) { ta.setRangeText('', ls0 + m[1].length, ls0 + m[0].length, 'preserve'); np = Math.max(ls0, p - (m[0].length - m[1].length)); }
  else { ta.setRangeText('• ', ls0, ls0, 'preserve'); np = p + 2; }
  ta.focus(); ta.selectionStart = ta.selectionEnd = np; onChange();
}
