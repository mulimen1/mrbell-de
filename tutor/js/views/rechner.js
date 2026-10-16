// Rechner: exakt gerechnet, mit Rechenweg und Faustregeln. Dieselben Formeln, mit denen Max auf dem Server rechnet.
import { h, ico, toast, parseNum, ls } from '../util.js';
import { L, LOCALE } from '../i18n.js';
import { TOOLS_IMPL as T } from '../rechner-core.js';
import * as M from '../me.js';

const nf = (d = 2) => new Intl.NumberFormat(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = x => x == null ? '–' : nf(2).format(x) + ' €';
const pct = (x, d = 2) => x == null ? '–' : nf(d).format(x * 100) + ' %';
const num = (x, d = 2) => x == null ? '–' : new Intl.NumberFormat(LOCALE, { maximumFractionDigits: d }).format(x);
const list = s => String(s || '').split(/[;\n]+|\s{2,}|(?<=\d)\s+(?=-?\d)/).map(x => x.trim()).filter(Boolean).map(parseNum);

// Felder: [key, label, typ, extra]; typ: n (Zahl), l (Liste), s (Auswahl), b (ja/nein)
const CALC = [
  { k: 'bilanz', ic: 'board', t: L('Bilanzkennzahlen', 'Balance sheet ratios'), s: L('Eigenkapitalquote, Anlagendeckung, Liquiditätsgrade, Rentabilität – mit Faustregeln.', 'Equity ratio, asset coverage, liquidity, returns – with rules of thumb.'),
    groups: [[L('Aktiva', 'Assets'), [['anlagevermoegen', L('Anlagevermögen', 'Fixed assets'), 'n', '€'], ['vorraete', L('Vorräte', 'Inventories'), 'n', '€'], ['forderungen', L('Forderungen (kurzfristig)', 'Receivables (short-term)'), 'n', '€'], ['liquide_mittel', L('Liquide Mittel', 'Cash'), 'n', '€']]],
      [L('Passiva', 'Equity & liabilities'), [['eigenkapital', L('Eigenkapital', 'Equity'), 'n', '€'], ['langfristiges_fk', L('Langfristiges Fremdkapital', 'Long-term liabilities'), 'n', '€'], ['kurzfristiges_fk', L('Kurzfristiges Fremdkapital', 'Short-term liabilities'), 'n', '€']]],
      [L('GuV (optional)', 'P&L (optional)'), [['umsatz', L('Umsatzerlöse', 'Revenue'), 'n', '€'], ['jahresueberschuss', L('Jahresüberschuss', 'Net income'), 'n', '€'], ['zinsaufwand', L('Zinsaufwand', 'Interest expense'), 'n', '€']]]],
    ex: { anlagevermoegen: '600.000', vorraete: '150.000', forderungen: '120.000', liquide_mittel: '30.000', eigenkapital: '300.000', langfristiges_fk: '280.000', kurzfristiges_fk: '320.000', umsatz: '1.200.000', jahresueberschuss: '45.000', zinsaufwand: '18.000' },
    run: v => T.bilanz(v), show: showBilanz },
  { k: 'kapitalwert', ic: 'calc', t: L('Kapitalwert & interner Zinsfuß', 'NPV & IRR'), s: L('Barwerte je Jahr, Kapitalwert, IRR exakt und per Interpolation.', 'Present values per year, NPV, IRR exact and interpolated.'),
    groups: [['', [['anschaffungsauszahlung', L('Anschaffungsauszahlung I₀', 'Initial investment I₀'), 'n', '€'], ['zinssatz_prozent', L('Kalkulationszins', 'Discount rate'), 'n', '%'], ['zahlungen', L('Rückflüsse ab Jahr 1 (mit ; trennen)', 'Cash flows from year 1 (separate with ;)'), 'l', '€'], ['restwert', L('Restwert (optional)', 'Salvage value (optional)'), 'n', '€']]]],
    ex: { anschaffungsauszahlung: '100.000', zinssatz_prozent: '8', zahlungen: '30.000; 35.000; 40.000; 25.000', restwert: '' },
    run: v => { const a = T.kapitalwert(v), b = T.interner_zinsfuss(v); return Object.assign(a, { irr: b.interner_zinsfuss_prozent }); }, show: showKW },
  { k: 'annuitaet', ic: 'calendar', t: L('Annuität & Tilgungsplan', 'Annuity & repayment plan'), s: L('Rate, Kapitalwiedergewinnungsfaktor, Zins und Tilgung je Jahr.', 'Payment, capital recovery factor, interest and principal per year.'),
    groups: [['', [['kapital', L('Darlehen / Barwert', 'Loan / present value'), 'n', '€'], ['zinssatz_prozent', L('Zinssatz', 'Interest rate'), 'n', '%'], ['laufzeit_jahre', L('Laufzeit in Jahren', 'Term in years'), 'n', '']]]],
    ex: { kapital: '50.000', zinssatz_prozent: '5', laufzeit_jahre: '5' }, run: v => T.annuitaet(Object.assign({ tilgungsplan: true }, v)), show: showAnn },
  { k: 'breakeven', ic: 'quiz', t: L('Break-even', 'Break-even'), s: L('Gewinnschwelle, Sicherheitsabstand, Menge für einen Zielgewinn.', 'Break-even point, margin of safety, volume for a target profit.'),
    groups: [['', [['fixkosten', L('Fixkosten', 'Fixed costs'), 'n', '€'], ['preis', L('Preis je Stück', 'Price per unit'), 'n', '€'], ['variable_stueckkosten', L('Variable Stückkosten', 'Variable cost per unit'), 'n', '€'], ['menge', L('Geplante Menge (optional)', 'Planned volume (optional)'), 'n', L('Stk.', 'pcs')], ['zielgewinn', L('Zielgewinn (optional)', 'Target profit (optional)'), 'n', '€']]]],
    ex: { fixkosten: '50.000', preis: '120', variable_stueckkosten: '70', menge: '1.500', zielgewinn: '' }, run: v => T.break_even(v), show: showBE },
  { k: 'abschreibung', ic: 'down', t: L('Abschreibung', 'Depreciation'), s: L('Linear, geometrisch-degressiv mit Wechsel, digital, leistungsabhängig.', 'Straight-line, declining balance with switch, sum-of-years, units.'),
    groups: [['', [['anschaffungskosten', L('Anschaffungskosten', 'Cost'), 'n', '€'], ['nutzungsdauer_jahre', L('Nutzungsdauer (Jahre)', 'Useful life (years)'), 'n', ''], ['methode', L('Methode', 'Method'), 's', [['linear', L('linear', 'straight-line')], ['geometrisch_degressiv', L('geometrisch-degressiv', 'declining balance')], ['arithmetisch_degressiv', L('arithmetisch-degressiv (digital)', 'sum-of-years')]]], ['satz_prozent', L('Satz (nur degressiv)', 'Rate (declining only)'), 'n', '%'], ['restwert', L('Restwert (optional)', 'Residual value (optional)'), 'n', '€'], ['monate_erstes_jahr', L('Monate im 1. Jahr (optional)', 'Months in year 1 (optional)'), 'n', '']]]],
    ex: { anschaffungskosten: '60.000', nutzungsdauer_jahre: '6', methode: 'geometrisch_degressiv', satz_prozent: '25', restwert: '', monate_erstes_jahr: '' }, run: v => T.abschreibung(v), show: showAfA },
  { k: 'zuschlag', ic: 'note', t: L('Zuschlagskalkulation', 'Job order costing'), s: L('Vom Material bis zum Listenverkaufspreis – Schema wie in der Klausur.', 'From materials to list price – exam-style scheme.'),
    groups: [[L('Kosten', 'Costs'), [['materialeinzelkosten', 'MEK', 'n', '€'], ['mgk_prozent', L('MGK-Zuschlag', 'Material overhead'), 'n', '%'], ['fertigungseinzelkosten', L('FEK (Fertigungslöhne)', 'Direct labour'), 'n', '€'], ['fgk_prozent', L('FGK-Zuschlag', 'Production overhead'), 'n', '%'], ['vwgk_prozent', L('VwGK-Zuschlag', 'Admin overhead'), 'n', '%'], ['vtgk_prozent', L('VtGK-Zuschlag', 'Sales overhead'), 'n', '%']]],
      [L('Verkauf (optional)', 'Sales (optional)'), [['gewinn_prozent', L('Gewinnzuschlag', 'Profit mark-up'), 'n', '%'], ['kundenskonto_prozent', L('Kundenskonto', 'Cash discount'), 'n', '%'], ['vertreterprovision_prozent', L('Vertreterprovision', 'Commission'), 'n', '%'], ['kundenrabatt_prozent', L('Kundenrabatt', 'Customer discount'), 'n', '%']]]],
    ex: { materialeinzelkosten: '100', mgk_prozent: '20', fertigungseinzelkosten: '80', fgk_prozent: '150', vwgk_prozent: '10', vtgk_prozent: '5', gewinn_prozent: '10', kundenskonto_prozent: '2', vertreterprovision_prozent: '', kundenrabatt_prozent: '10' }, run: v => T.zuschlagskalkulation(v), show: showZK },
  { k: 'zinsen', ic: 'spark', t: L('Zinsen & Renten', 'Interest & annuities'), s: L('Auf- und Abzinsen, Rentenbarwert und -endwert, ewige Rente, Effektivzins.', 'Compounding, discounting, annuity values, perpetuity, effective rate.'),
    groups: [['', [['art', L('Was rechnen?', 'What to calculate?'), 's', [['endwert', L('Endwert (aufzinsen)', 'Future value')], ['barwert', L('Barwert (abzinsen)', 'Present value')], ['rentenbarwert', L('Rentenbarwert', 'PV of annuity')], ['rentenendwert', L('Rentenendwert', 'FV of annuity')], ['ewige_rente', L('Ewige Rente', 'Perpetuity')], ['effektivzins', L('Effektivzins', 'Effective rate')]]], ['betrag', L('Betrag bzw. Rate', 'Amount or payment'), 'n', '€'], ['zinssatz_prozent', L('Nominalzins p. a.', 'Nominal rate p.a.'), 'n', '%'], ['jahre', L('Jahre', 'Years'), 'n', ''], ['perioden_pro_jahr', L('Zinsperioden pro Jahr (optional)', 'Periods per year (optional)'), 'n', ''], ['vorschuessig', L('vorschüssig', 'payments in advance'), 'b']]]],
    ex: { art: 'rentenbarwert', betrag: '1.000', zinssatz_prozent: '5', jahre: '10', perioden_pro_jahr: '', vorschuessig: false }, run: v => T.finanzmathe(v), show: showFM },
  { k: 'steuer', ic: 'file', t: L('Einkommensteuer', 'Income tax'), s: L('§ 32a EStG für 2024–2026: Steuer, Durchschnitts- und Grenzsteuersatz.', '§ 32a EStG 2024–2026: tax, average and marginal rate.'),
    groups: [['', [['zve', L('Zu versteuerndes Einkommen', 'Taxable income'), 'n', '€'], ['jahr', L('Jahr', 'Year'), 's', [['2026', '2026'], ['2025', '2025'], ['2024', '2024']]], ['splitting', L('Splittingtarif (zusammen veranlagt)', 'Joint filing (splitting)'), 'b']]]],
    ex: { zve: '45.000', jahr: '2026', splitting: false }, run: v => T.einkommensteuer(v), show: showESt },
  { k: 'statistik', ic: 'path', t: L('Statistik', 'Statistics'), s: L('Mittelwert, Median, Varianz, Standardabweichung, Korrelation, Regression.', 'Mean, median, variance, standard deviation, correlation, regression.'),
    groups: [['', [['werte', L('Werte x (mit ; trennen)', 'Values x (separate with ;)'), 'l', ''], ['y_werte', L('Werte y für Korrelation (optional)', 'Values y for correlation (optional)'), 'l', '']]]],
    ex: { werte: '2; 4; 4; 4; 5; 5; 7; 9', y_werte: '' }, run: v => T.statistik(v), show: showStat },
  { k: 'workload', ic: 'brain', t: L('Workload nach ECTS', 'Workload by ECTS'), s: L('Wie viele Stunden ein Modul wirklich kostet – und was das pro Woche heißt.', 'How many hours a module really takes – and what that means per week.'),
    groups: [['', [['ects', 'ECTS', 'n', ''], ['stunden_je_ects', L('Stunden je ECTS', 'Hours per ECTS'), 's', [['30', L('30 (häufig)', '30 (common)')], ['25', '25'], ['28', '28']]], ['sws', L('Präsenz in SWS (optional)', 'Contact hours/week (optional)'), 'n', ''], ['vorlesungswochen', L('Vorlesungswochen', 'Teaching weeks'), 'n', ''], ['wochen_bis_klausur', L('Wochen bis zur Klausur (optional)', 'Weeks until exam (optional)'), 'n', '']]]],
    ex: { ects: '6', stunden_je_ects: '30', sws: '4', vorlesungswochen: '14', wochen_bis_klausur: '8' }, run: v => T.workload(v), show: showWL }
];

export function render(root, { arg = '', onAsk } = {}) {
  const wrap = h('div', { class: 'view-in rc' }); root.appendChild(wrap);
  const c = CALC.find(x => x.k === arg);
  if (c) return calcView(wrap, c, onAsk);
  const q = h('input', { class: 'field rc-q', type: 'search', placeholder: L('Rechner suchen … z. B. Liquidität, Kapitalwert, AfA', 'Search calculators … e.g. liquidity, NPV, depreciation'), 'aria-label': L('Rechner suchen', 'Search calculators') });
  const grid = h('div', { class: 'rc-grid' });
  const KEYS = { bilanz: 'liquidität eigenkapitalquote anlagendeckung goldene bilanzregel roi rentabilität quick ratio current ratio working capital verschuldungsgrad du pont kennzahlen jahresabschluss', kapitalwert: 'npv irr barwert investition dynamisch interpolation abzinsung', annuitaet: 'kredit darlehen tilgung rate kwf', breakeven: 'gewinnschwelle deckungsbeitrag fixkosten sicherheitsabstand', abschreibung: 'afa degressiv linear digital buchwert', zuschlag: 'kalkulation selbstkosten herstellkosten listenverkaufspreis gemeinkosten mek fek', zinsen: 'zinseszins rente effektivzins endwert barwert ewige', steuer: 'est steuer grenzsteuersatz splitting 32a', statistik: 'mittelwert varianz standardabweichung median regression korrelation', workload: 'ects stunden aufwand semester zeit' };
  const draw = () => {
    const t = q.value.trim().toLowerCase();
    const hits = CALC.filter(x => !t || (x.t + ' ' + x.s + ' ' + (KEYS[x.k] || '')).toLowerCase().includes(t));
    grid.replaceChildren(...(hits.length ? hits.map(x => h('a', { class: 'rc-card', href: '#/app/rechner/' + x.k }, h('span', { class: 'rc-ci', html: ico(x.ic) }), h('b', {}, x.t), h('small', {}, x.s))) : [h('div', { class: 'me-empty' }, h('p', {}, L('Kein Rechner dafür. Frag Max – er rechnet alles exakt nach.', 'No calculator for that. Ask Max – he calculates everything exactly.')))]));
  };
  q.addEventListener('input', draw); draw();
  wrap.append(h('div', { class: 'vh rc-h' }, h('div', {}, h('div', { class: 'eyebrow' }, L('Werkzeuge', 'Tools')), h('h2', {}, L('Rechner', 'Calculators')), h('p', {}, L('Exakt gerechnet, mit Rechenweg und Faustregeln – dieselben Formeln, mit denen Max rechnet.', 'Calculated exactly, with working and rules of thumb – the same formulas Max uses.'))), q), grid);
  setTimeout(() => { if (matchMedia('(pointer: fine)').matches) q.focus(); }, 50);
}

function calcView(wrap, c, onAsk) {
  const saved = ls.get('tutor.rc.' + c.k, null);
  const vals = Object.assign({}, c.ex, saved || {});
  const out = h('div', { class: 'rc-out', 'aria-live': 'polite' });
  const inputs = {};
  const form = h('form', { class: 'rc-form', onsubmit: e => e.preventDefault() }, c.groups.map(([g, fields]) => h('fieldset', {}, g ? h('legend', {}, g) : null, fields.map(([k, label, typ, extra]) => {
    let el;
    if (typ === 's') el = h('select', { class: 'field' }, extra.map(([v, t]) => h('option', { value: v, selected: String(vals[k]) === v || null }, t)));
    else if (typ === 'b') el = h('input', { type: 'checkbox', checked: vals[k] ? true : null });
    else el = h('input', { class: 'field', inputmode: typ === 'l' ? 'text' : 'decimal', value: vals[k] ?? '', autocomplete: 'off', placeholder: typ === 'l' ? '400; 400; 400' : '' });
    inputs[k] = { el, typ };
    el.addEventListener(typ === 's' || typ === 'b' ? 'change' : 'input', () => { clearTimeout(form.t); form.t = setTimeout(calc, 120); });
    return typ === 'b' ? h('label', { class: 'rc-b' }, el, h('span', {}, label)) : h('label', { class: 'rc-f' }, h('span', {}, label), h('div', { class: 'rc-in' }, el, extra && typeof extra === 'string' ? h('i', {}, extra) : null));
  }))));
  const read = () => { const v = {}; for (const [k, { el, typ }] of Object.entries(inputs)) { if (typ === 'b') v[k] = el.checked; else if (typ === 's') v[k] = el.value; else if (typ === 'l') { if (el.value.trim()) v[k] = list(el.value); } else if (el.value.trim()) v[k] = parseNum(el.value); } return v; };
  const raw = () => { const v = {}; for (const [k, { el, typ }] of Object.entries(inputs)) v[k] = typ === 'b' ? el.checked : el.value; return v; };
  let last = null;
  function calc() {
    const v = read();
    try { if (Object.values(v).some(x => typeof x === 'number' && isNaN(x))) throw new Error(L('Eine Eingabe ist keine Zahl.', 'One input isn’t a number.')); last = c.run(v); out.replaceChildren(...[].concat(c.show(last, v))); ls.set('tutor.rc.' + c.k, raw()); }
    catch (e) { last = null; out.replaceChildren(h('div', { class: 'rc-err' }, String(e.message || e).replace(/^„([^“]+)“ fehlt$/, (m, k) => L('Bitte noch ausfüllen: ', 'Please fill in: ') + (labelOf(c, k) || k)))); }
  }
  const askBtn = h('button', { class: 'btn sm', type: 'button', onclick: () => { if (!last) return; const txt = L(`Erklär mir dieses Ergebnis aus dem ${c.t}-Rechner Schritt für Schritt an der Tafel. Eingaben: ${JSON.stringify(read())}. Ergebnis: ${JSON.stringify(last).slice(0, 1600)}`, `Explain this result from the ${c.t} calculator step by step on the whiteboard. Inputs: ${JSON.stringify(read())}. Result: ${JSON.stringify(last).slice(0, 1600)}`); onAsk ? onAsk(txt) : toast(L('Max ist gerade ausgeblendet.', 'Max is hidden right now.')); } }, h('span', { html: ico('chat') }), L('Max erklären lassen', 'Have Max explain'));
  const exBtn = h('button', { class: 'linkbtn', type: 'button', onclick: () => { for (const [k, { el, typ }] of Object.entries(inputs)) { const v = c.ex[k]; if (typ === 'b') el.checked = !!v; else el.value = v ?? ''; } calc(); } }, L('Beispiel einsetzen', 'Use example'));
  const clr = h('button', { class: 'linkbtn', type: 'button', onclick: () => { for (const { el, typ } of Object.values(inputs)) { if (typ === 'b') el.checked = false; else if (typ !== 's') el.value = ''; } calc(); } }, L('Leeren', 'Clear'));
  wrap.append(h('div', { class: 'rc-top' }, h('a', { class: 'btn sm ghost', href: '#/app/rechner' }, h('span', { html: ico('left') }), L('Alle Rechner', 'All calculators'))),
    h('div', { class: 'vh' }, h('div', {}, h('div', { class: 'eyebrow' }, L('Rechner', 'Calculator')), h('h2', {}, c.t), h('p', {}, c.s))),
    h('div', { class: 'rc-body' }, h('div', { class: 'rc-left' }, form, h('div', { class: 'rc-fa' }, exBtn, clr)), h('div', { class: 'rc-right' }, out, h('div', { class: 'rc-act' }, askBtn))));
  if (c.k === 'workload') wrap.append(semester());
  calc();
}
const labelOf = (c, k) => { for (const [, f] of c.groups) for (const x of f) if (x[0] === k) return x[1]; return ''; };

// ---------- Ergebnisdarstellung ----------
const big = (label, val, sub) => h('div', { class: 'rc-big' }, h('small', {}, label), h('b', {}, val), sub ? h('span', {}, sub) : null);
const formula = f => f ? h('div', { class: 'rc-fx' }, f) : null;
function table(cols, rows) {
  return h('div', { class: 'rc-tw' }, h('table', { class: 'rc-t' }, h('thead', {}, h('tr', {}, cols.map(c => h('th', { class: c[2] ? 'n' : '' }, c[1])))),
    h('tbody', {}, rows.map(r => h('tr', { class: r._cls || '' }, cols.map(c => h('td', { class: c[2] ? 'n' : '' }, c[2] ? c[2](r[c[0]]) : r[c[0]])))))));
}
function showBilanz(r) {
  const groups = {}; r.kennzahlen.forEach(k => { (groups[k.gruppe] ||= []).push(k); });
  const val = k => k.euro ? eur(k.wert) : k.prozent ? pct(k.wert, 1) : num(k.wert, 2) + (k.faktor ? ' : 1' : '');
  return [
    r.ausgeglichen ? null : h('div', { class: 'rc-warn' }, L(`Aktiva (${eur(r.bilanzsumme_aktiva)}) und Passiva (${eur(r.bilanzsumme_passiva)}) sind nicht gleich – prüf die Zahlen. Gerechnet wird mit dem Gesamtkapital.`, `Assets (${eur(r.bilanzsumme_aktiva)}) and liabilities (${eur(r.bilanzsumme_passiva)}) don’t match – check the numbers.`)),
    h('div', { class: 'rc-bigs' }, big(L('Bilanzsumme', 'Total assets'), eur(r.bilanzsumme_aktiva)), big(L('Umlaufvermögen', 'Current assets'), eur(r.umlaufvermoegen)), big(L('Fremdkapital', 'Liabilities'), eur(r.fremdkapital))),
    ...Object.entries(groups).map(([g, ks]) => h('div', { class: 'rc-kg' }, h('div', { class: 'rc-kgh' }, g), ks.map(k => h('div', { class: 'rc-k' + (k.ok === true ? ' ok' : k.ok === false ? ' bad' : '') },
      h('div', { class: 'rc-kn' }, h('b', {}, k.name), h('small', {}, k.formel)), h('div', { class: 'rc-kv' }, h('b', {}, val(k)), k.regel ? h('small', {}, (k.ok ? '✓ ' : k.ok === false ? '⚠ ' : '') + k.regel) : null))))),
    h('p', { class: 'rc-note' }, L('Faustregeln sind Orientierung, keine Gesetze – Branche und Geschäftsmodell zählen mit.', 'Rules of thumb are guidance, not laws – industry and business model matter.'))];
}
function showKW(r) {
  return [h('div', { class: 'rc-bigs' }, big(L('Kapitalwert C₀', 'NPV C₀'), eur(r.kapitalwert), r.urteil), big(L('Interner Zinsfuß', 'IRR'), r.irr == null ? '–' : num(r.irr, 2) + ' %'), big(L('Summe der Barwerte', 'Sum of present values'), eur(r.summe_barwerte))),
    table([['jahr', L('Jahr', 'Year')], ['zahlung', L('Rückfluss', 'Cash flow'), eur], ['abzinsungsfaktor', L('Abzinsungsfaktor', 'Discount factor'), x => num(x, 6)], ['barwert', L('Barwert', 'Present value'), eur]], r.jahre), formula(r.formel)];
}
function showAnn(r) {
  return [h('div', { class: 'rc-bigs' }, big(L('Annuität pro Jahr', 'Annual payment'), eur(r.annuitaet)), big('KWF', num(r.kapitalwiedergewinnungsfaktor, 6))),
    r.tilgungsplan ? table([['jahr', L('Jahr', 'Year')], ['restschuld_anfang', L('Restschuld Anfang', 'Opening balance'), eur], ['zinsen', L('Zinsen', 'Interest'), eur], ['tilgung', L('Tilgung', 'Principal'), eur], ['restschuld_ende', L('Restschuld Ende', 'Closing balance'), eur]], r.tilgungsplan) : null, formula(r.formel)];
}
function showBE(r) {
  if (r.hinweis) return h('div', { class: 'rc-warn' }, r.hinweis);
  return [h('div', { class: 'rc-bigs' }, big(L('Break-even-Menge', 'Break-even volume'), num(r.break_even_menge, 2) + L(' Stk.', ' pcs'), L(`aufgerundet ${r.break_even_menge_aufgerundet} Stück`, `rounded up ${r.break_even_menge_aufgerundet} units`)), big(L('Break-even-Umsatz', 'Break-even revenue'), eur(r.break_even_umsatz)), big(L('DB je Stück', 'CM per unit'), eur(r.db_stueck), L(`DB-Quote ${num(r.db_quote_prozent, 2)} %`, `CM ratio ${num(r.db_quote_prozent, 2)}%`))),
    r.menge != null ? table([['k', ''], ['v', '', x => x]], [{ k: L('Umsatz', 'Revenue'), v: eur(r.umsatz) }, { k: L('Variable Kosten', 'Variable costs'), v: eur(r.variable_kosten) }, { k: L('Deckungsbeitrag', 'Contribution margin'), v: eur(r.deckungsbeitrag_gesamt) }, { k: L('Gewinn', 'Profit'), v: eur(r.gewinn), _cls: 'sum' }, { k: L('Sicherheitsabstand', 'Margin of safety'), v: num(r.sicherheitsabstand_prozent, 2) + ' %' }]) : null,
    r.menge_fuer_zielgewinn != null ? h('p', { class: 'rc-note' }, L(`Für den Zielgewinn brauchst du ${num(r.menge_fuer_zielgewinn, 2)} Stück.`, `For the target profit you need ${num(r.menge_fuer_zielgewinn, 2)} units.`)) : null, formula(r.formel)];
}
function showAfA(r) {
  return [r.jaehrliche_abschreibung != null ? h('div', { class: 'rc-bigs' }, big(L('Jährliche AfA', 'Annual depreciation'), eur(r.jaehrliche_abschreibung))) : r.wechseljahr ? h('div', { class: 'rc-bigs' }, big(L('Wechsel zur linearen AfA', 'Switch to straight-line'), L(`im Jahr ${r.wechseljahr}`, `in year ${r.wechseljahr}`))) : null,
    table([['jahr', L('Jahr', 'Year')], ['buchwert_anfang', L('Buchwert Anfang', 'Opening book value'), eur], ['abschreibung', L('Abschreibung', 'Depreciation'), eur], ['buchwert_ende', L('Buchwert Ende', 'Closing book value'), eur]].concat(r.plan.some(x => x.methode) ? [['methode', L('Methode', 'Method')]] : []), r.plan), formula(r.formel)];
}
function showZK(r) {
  return [table([['k', L('Position', 'Item')], ['v', L('Betrag', 'Amount'), eur]], r.schema.map(([k, v]) => ({ k, v, _cls: /^=/.test(k) ? 'sum' : '' }))), h('p', { class: 'rc-note' }, r.hinweis)];
}
function showFM(r) {
  if (r.effektiver_jahreszins_prozent != null) return [h('div', { class: 'rc-bigs' }, big(L('Effektiver Jahreszins', 'Effective annual rate'), num(r.effektiver_jahreszins_prozent, 4) + ' %')), formula(r.formel)];
  return [h('div', { class: 'rc-bigs' }, big(L('Ergebnis', 'Result'), eur(r.ergebnis)), big(r.faktor_name, num(r.faktor, 6))), formula(r.formel)];
}
function showESt(r) {
  return [h('div', { class: 'rc-bigs' }, big(L('Einkommensteuer', 'Income tax'), eur(r.einkommensteuer), r.tarif), big(L('Durchschnittssteuersatz', 'Average rate'), num(r.durchschnittssteuersatz_prozent, 2) + ' %'), big(L('Grenzsteuersatz', 'Marginal rate'), num(r.grenzsteuersatz_prozent, 2) + ' %')),
    h('p', { class: 'rc-note' }, `${r.quelle} · ${L('Tarifzone', 'zone')} ${r.tarifzone} · ${L('Grundfreibetrag', 'basic allowance')} ${eur(r.grundfreibetrag)} · ${r.hinweis}`)];
}
function showStat(r) {
  const rows = [[L('n', 'n'), r.n], [L('Mittelwert', 'Mean'), r.mittelwert], [L('Median', 'Median'), r.median], [L('Modus', 'Mode'), r.modus ? r.modus.join('; ') : '–'], [L('Spannweite', 'Range'), r.spannweite], [L('Varianz (Grundgesamtheit)', 'Variance (population)'), r.varianz_grundgesamtheit], [L('Standardabweichung (GG)', 'Std. dev. (population)'), r.std_grundgesamtheit], [L('Varianz (Stichprobe)', 'Variance (sample)'), r.varianz_stichprobe], [L('Standardabweichung (Stichprobe)', 'Std. dev. (sample)'), r.std_stichprobe], [L('Variationskoeffizient', 'Coefficient of variation'), r.variationskoeffizient]];
  if (r.regression) rows.push([L('Korrelation r', 'Correlation r'), r.korrelation_r], [L('Regression ŷ = a + b·x', 'Regression ŷ = a + b·x'), `a = ${num(r.regression.achsenabschnitt_a, 4)} · b = ${num(r.regression.steigung_b, 4)}`], ['R²', r.regression.bestimmtheitsmass_r2]);
  return table([['k', ''], ['v', '', x => typeof x === 'number' ? num(x, 4) : (x ?? '–')]], rows.map(([k, v]) => ({ k, v })));
}
function showWL(r) {
  return [h('div', { class: 'rc-bigs' }, big(L('Gesamtaufwand', 'Total workload'), num(r.gesamt_stunden, 0) + ' h'), big(L('Selbststudium', 'Self-study'), num(r.selbststudium_stunden, 0) + ' h', L(`Präsenz ${num(r.praesenz_stunden, 0)} h`, `contact ${num(r.praesenz_stunden, 0)} h`)), r.pro_woche_bis_klausur != null ? big(L('Pro Woche bis zur Klausur', 'Per week until the exam'), num(r.pro_woche_bis_klausur, 1) + ' h') : null), formula(r.formel)];
}
// Dein Semester: alle Fächer mit ECTS – was das pro Woche bedeutet
function semester() {
  const me = M.getMe(), fs = me.faecher.filter(f => +f.ects > 0);
  if (!fs.length) return h('section', { class: 'me-card rc-sem' }, h('div', { class: 'me-ct' }, L('Dein Semester', 'Your semester')), h('div', { class: 'me-empty' }, h('p', {}, L('Trag bei deinen Fächern die ECTS ein – dann rechne ich dir aus, wie viele Stunden pro Woche dein Semester wirklich braucht.', 'Add ECTS to your subjects – I’ll work out how many hours per week your semester really takes.')), h('a', { class: 'btn sm', href: '#/app/me/faecher' }, L('Zu den Fächern', 'Go to subjects'))));
  const today = M.dayKey();
  const rows = fs.map(f => { const tot = +f.ects * 30, wk = f.klausur && f.klausur > today ? Math.max(1, Math.round((new Date(f.klausur + 'T12:00') - Date.now()) / (7 * 864e5))) : null; return { name: f.name, ects: +f.ects, h: tot, wk, pw: wk ? tot * 0.55 / wk : null }; });
  const sumPw = rows.reduce((a, r) => a + (r.pw || 0), 0), goal = (me.wochenziel || 150) / 60;
  return h('section', { class: 'me-card rc-sem' }, h('div', { class: 'me-ct' }, L('Dein Semester', 'Your semester')),
    table([['name', L('Fach', 'Subject')], ['ects', 'ECTS'], ['h', L('Aufwand', 'Workload'), x => num(x, 0) + ' h'], ['wk', L('Wochen bis Klausur', 'Weeks to exam'), x => x == null ? '–' : String(x)], ['pw', L('Selbststudium/Woche', 'Self-study/week'), x => x == null ? '–' : num(x, 1) + ' h']], rows),
    h('p', { class: 'rc-note' }, L(`Grob gerechnet ${num(sumPw, 1)} Stunden Selbststudium pro Woche (55 % des Aufwands, Rest ist Präsenz). Dein Wochenziel in „Mein Bereich“ liegt bei ${num(goal, 1)} h.`, `Roughly ${num(sumPw, 1)} hours of self-study per week (55% of the workload, the rest is contact time). Your weekly goal in “My space” is ${num(goal, 1)} h.`)));
}
