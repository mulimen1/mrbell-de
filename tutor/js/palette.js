import * as MMP from './maxmode.js';
// ⌘K: eine Eingabe für alles – Skripte, Fächer, Karten, Gemerktes, Trainer, Befehle. Was nichts findet, geht an Max.
// Öffnen/Schließen bewusst ohne Animation (Tastatur-Aktionen sollen sich sofort anfühlen).
import uFuzzy from '../vendor/ufuzzy@1.0.19/uFuzzy.mjs';
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { S } from './state.js';
import { getAccount } from './api.js';

// BWL-Kürzel → ausgeschrieben (werden mitdurchsucht und als „Titel (Kürzel)“ angezeigt)
const SYN = { klr: 'Kosten- und Leistungsrechnung', rewe: 'Rechnungswesen', guv: 'Gewinn- und Verlustrechnung', db: 'Deckungsbeitrag', bep: 'Break-even', izf: 'Interner Zinsfuß', irr: 'Interner Zinsfuß', npv: 'Kapitalwert', kw: 'Kapitalwert', afa: 'Abschreibung', bab: 'Betriebsabrechnungsbogen', ek: 'Eigenkapital', fk: 'Fremdkapital', roi: 'Return on Investment', vwl: 'Volkswirtschaftslehre', bwl: 'Betriebswirtschaftslehre', hgb: 'Handelsgesetzbuch', ifrs: 'IFRS Rechnungslegung', ust: 'Umsatzsteuer', wacc: 'Kapitalkosten', est: 'Einkommensteuer', ects: 'Noten ECTS Schnitt' };
const uf = new uFuzzy({ intraMode: 1, intraIns: 1 });
const norm = s => uFuzzy.latinize ? uFuzzy.latinize(String(s).toLowerCase()) : String(s).toLowerCase();

let dlg = null, input = null, list = null, items = [], shown = [], sel = 0, lastFocus = null;

function collect() {
  const out = [], acc = getAccount();
  const cmd = (t, ic, run, kw = '', sub = '') => out.push({ g: L('Aktionen', 'Actions'), t, ic, run, kw, sub });
  const nav = h => () => { location.hash = h; };
  // Inhalte
  for (const d of S.list) {
    out.push({ g: L('Skripte', 'Slides'), t: d.name, ic: 'file', run: nav(`#/app/${d.id}/hub`), sub: d.sample ? L('Beispiel', 'Example') : L(`${d.pages?.length || 0} Seiten`, `${d.pages?.length || 0} pages`), recent: d.used || 0 });
    for (const k of d.decks || []) out.push({ g: L('Karteikarten', 'Flashcards'), t: k.title, ic: 'cards', run: nav(`#/app/${d.id}/karten`), sub: `${k.cards.length} ${L('Karten', 'cards')} · ${d.name}` });
    (d.path?.chapters || []).forEach((c, i) => out.push({ g: L('Kapitel', 'Chapters'), t: c.title, ic: 'path', run: nav(`#/app/${d.id}/pfad/${i}`), sub: d.name, kw: (c.terms || []).join(' ') }));
    for (const t of d.summary?.terms || []) out.push({ g: L('Begriffe', 'Terms'), t: t.t, ic: 'note', run: nav(`#/app/${d.id}/zettel`), sub: String(t.d || '').slice(0, 90) });
  }
  try {
    const me = JSON.parse(localStorage.getItem('tutor.me') || 'null') || {};
    for (const f of me.faecher || []) out.push({ g: L('Fächer', 'Subjects'), t: f.name + (f.kurz ? ` (${f.kurz})` : ''), ic: 'brain', run: nav('#/app/faecher'), sub: f.klausur ? L(`Klausur am ${new Date(f.klausur + 'T12:00').toLocaleDateString('de-DE')}`, `Exam on ${f.klausur}`) : '', kw: f.kurz || '' });
    for (const x of me.favs || []) out.push({ g: L('Gemerkt', 'Saved'), t: x.titel || L('Ohne Titel', 'Untitled'), ic: 'spark', run: nav('#/app/gemerkt'), sub: x.docName || '', kw: String(x.inhalt || '').slice(0, 300) });
  } catch (e) {}
  // Trainer
  const TR = [['buchung', L('Buchungssätze', 'Booking entries'), 'Soll Haben Buchung'], ['tkonten', L('T-Konten & Abschluss', 'T-accounts'), 'Konto Abschluss GuV'], ['breakeven', L('Break-even & Deckungsbeitrag', 'Break-even'), 'DB BEP Gewinnschwelle'], ['kapitalwert', L('Investitionsrechnung', 'Investment appraisal'), 'Kapitalwert KW NPV IZF Annuität'], ['markt', L('Angebot & Nachfrage', 'Supply & demand'), 'Markt Gleichgewicht VWL'], ['bilanz', L('Bilanz sortieren', 'Balance sheet'), 'Aktiva Passiva'], ['kennzahlen', L('Bilanzkennzahlen', 'Ratios'), 'EK-Quote Liquidität ROI'], ['abschreibung', L('Abschreibungen', 'Depreciation'), 'AfA linear degressiv'], ['kalkulation', L('Handelskalkulation', 'Pricing'), 'Kalkulation Zuschlag'], ['finanzierung', L('Finanzierung & Zinsen', 'Finance & interest'), 'Zins Kredit'], ['marketing', L('Marketing-Kennzahlen', 'Marketing metrics'), ''], ['lager', L('Beschaffung & Lager', 'Procurement'), 'Bestellmenge'], ['produktion', L('Produktion & Personal', 'Production'), ''], ['makro', L('Makroökonomie', 'Macroeconomics'), 'BIP Inflation VWL']];
  for (const [id, t, kw] of TR) out.push({ g: 'Trainer', t, ic: 'whistle', run: nav('#/app/trainer/' + id), sub: L('BWL-Trainer · unbegrenzt', 'Business trainer · unlimited'), kw });
  // Rechner (exakt, mit Rechenweg)
  const RC = [['bilanz', L('Bilanzkennzahlen-Rechner', 'Balance sheet ratios'), 'liquidität eigenkapitalquote anlagendeckung goldene bilanzregel roi rentabilität quick ratio verschuldungsgrad'], ['kapitalwert', L('Kapitalwert & IRR berechnen', 'NPV & IRR calculator'), 'npv barwert investition interner zinsfuß'], ['annuitaet', L('Annuität & Tilgungsplan', 'Annuity & repayment plan'), 'kredit darlehen rate tilgung'], ['breakeven', L('Break-even berechnen', 'Break-even calculator'), 'gewinnschwelle deckungsbeitrag'], ['abschreibung', L('Abschreibung berechnen', 'Depreciation calculator'), 'afa degressiv linear'], ['zuschlag', L('Zuschlagskalkulation', 'Job order costing'), 'selbstkosten herstellkosten listenverkaufspreis'], ['zinsen', L('Zinsen & Renten', 'Interest & annuities'), 'zinseszins effektivzins rentenbarwert'], ['steuer', L('Einkommensteuer berechnen', 'Income tax calculator'), 'est grenzsteuersatz splitting'], ['statistik', L('Statistik-Rechner', 'Statistics calculator'), 'mittelwert varianz standardabweichung regression'], ['workload', L('Workload nach ECTS', 'Workload by ECTS'), 'stunden aufwand semester']];
  for (const [id, t, kw] of RC) out.push({ g: L('Rechner', 'Calculators'), t, ic: 'calc', run: nav('#/app/rechner/' + id), sub: L('exakt, mit Rechenweg', 'exact, with working'), kw });
  // Befehle
  const due = S.list.map(d => ({ d, n: (d.decks || []).flatMap(k => k.cards).filter(c => (c.due || 0) <= Date.now()).length })).filter(x => x.n).sort((a, b) => b.n - a.n)[0];
  if (due) cmd(L(`Fällige Karten lernen (${due.n})`, `Review due cards (${due.n})`), 'cards', nav(`#/app/${due.d.id}/karten`), 'wiederholen lernen karteikarten');
  cmd(L('Skript hochladen', 'Upload slides'), 'upload', () => document.getElementById('fileApp')?.click(), 'datei pdf neu vorlesung');
  cmd('Tutor', 'chat', nav('#/app/tutor'), 'max tutor raum start heute mein bereich lernen session');
  cmd(L('Notenziel – welche Note brauche ich noch?', 'Grade goal – what do I still need?'), 'calc', nav('#/app/faecher'), 'noten schnitt ects durchschnitt rechner');
  cmd(L('Stundenplan', 'Timetable'), 'calendar', nav('#/app/stundenplan'), 'kalender vorlesung ical woche');
  cmd(L('Fortschritt', 'Progress'), 'trophy', nav('#/app/fortschritt'), 'statistik lernzeit serie streak meilensteine');
  cmd(L('Lernen – alle Lern-Tools', 'Learn – all study tools'), 'spark', nav('#/app/lernen'), 'tools karteikarten podcast lernzettel quiz lernplan trainer rechner üben');
  cmd(L('Wochen-Challenge', 'Weekly challenge'), 'trophy', nav('#/app/challenge'), 'quiz wettbewerb');
  cmd(L('Thema erklären lassen (ohne Skript)', 'Explain a topic (no slides)'), 'bulb', () => import('./app.js').then(m => m.topicPrompt()), 'kurzskript thema');
  if (MMP.voiceOn()) cmd(L('Mit Max sprechen', 'Talk to Max'), 'mic', () => import('./app.js').then(m => m.talkToMax()), 'stimme sprechen voice');
  if (S.doc) {
    const d = S.doc, go = t => nav(`#/app/${d.id}/${t}`);
    cmd(L(`Quiz starten · ${d.name}`, `Start quiz · ${d.name}`), 'quiz', go('quiz'), 'abfragen test');
    cmd(L(`Klausurplan · ${d.name}`, `Exam plan · ${d.name}`), 'exam', go('plan'), 'lernplan prüfung');
    cmd(L(`Lernzettel · ${d.name}`, `Study sheet · ${d.name}`), 'note', go('zettel'), 'zusammenfassung mindmap');
    cmd(L(`Podcast · ${d.name}`, `Podcast · ${d.name}`), 'pod', go('podcast'), 'hören audio');
  }
  cmd(L('Hell / Dunkel umschalten', 'Toggle light / dark'), document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon', () => document.querySelector('[data-theme-toggle]')?.click(), 'theme farbe modus');
  if (acc) cmd(L('Konto', 'Account'), 'lock', () => import('./account.js').then(m => m.openAccount()), 'passwort abmelden e-mail');
  return out;
}

function render(q) {
  q = q.trim();
  if (!q) {
    const recent = items.filter(x => x.recent).sort((a, b) => b.recent - a.recent).slice(0, 4);
    const acts = items.filter(x => x.g === L('Aktionen', 'Actions')).slice(0, 5);
    shown = [...recent.map(x => Object.assign({}, x, { g: L('Zuletzt', 'Recent') })), ...acts];
  } else {
    const hay = items.map(x => norm(x.t + ' ' + (x.sub || '') + ' ' + (x.kw || '')));
    const search = needle => { const r = uf.filter(hay, needle); if (!r || !r.length) return []; try { const info = uf.info(r, hay, needle); return uf.sort(info, hay, needle).map(i => info.idx[i]); } catch (e) { return r; } };
    // Eingabe so wie getippt, dazu ausgeschriebene BWL-Kürzel als eigene Suche
    const nq = norm(q).replace(/[?!.,;:„“"()]/g, ' ').trim();
    let idx = search(nq);
    for (const w of nq.split(/\s+/)) if (SYN[w]) idx = idx.concat(search(norm(SYN[w])));
    if (!idx.length) { // einzelne aussagekräftige Wörter probieren
      const STOP = new Set(['und', 'oder', 'der', 'die', 'das', 'ist', 'was', 'wie', 'ein', 'eine', 'mit', 'für', 'fur', 'von', 'den', 'dem', 'des', 'im', 'in', 'zu', 'the', 'and', 'what', 'how']);
      for (const w of nq.split(/\s+/).filter(w => w.length >= 4 && !STOP.has(w))) idx = idx.concat(search(w));
    }
    idx = [...new Set(idx)];
    // Titel-Treffer vor Inhalts-Treffern
    const t = norm(q);
    idx.sort((a, b) => (norm(items[b].t).includes(t) ? 1 : 0) - (norm(items[a].t).includes(t) ? 1 : 0));
    // nach Gruppen bündeln (Reihenfolge der Gruppen nach bestem Treffer), damit jede Überschrift nur einmal kommt
    const top = idx.slice(0, 30).map(i => items[i]), order = [...new Set(top.map(x => x.g))];
    shown = order.flatMap(g => top.filter(x => x.g === g));
    shown.push({ g: 'Max', t: L(`Max fragen: „${q}“`, `Ask Max: “${q}”`), ic: 'chat', ask: q, run: () => askMax(q) });
  }
  sel = 0;
  let g = null;
  list.replaceChildren(...shown.flatMap((x, i) => {
    const head = x.g !== g ? h('div', { class: 'pal-g', role: 'presentation' }, (g = x.g)) : null;
    const row = h('button', { class: 'pal-i' + (x.ask ? ' ask' : ''), type: 'button', role: 'option', id: 'pal-' + i, 'aria-selected': i === sel ? 'true' : 'false', onmousemove: () => setSel(i), onclick: () => runItem(i) },
      h('span', { class: 'pal-ic', html: ico(x.ic || 'spark') }), h('span', { class: 'pal-t' }, h('b', {}, x.t), x.sub ? h('small', {}, x.sub) : null), i === sel && !touch() ? h('kbd', {}, '↵') : null);
    return [head, row];
  }));
  if (!shown.length) list.append(h('div', { class: 'pal-empty' }, L('Nichts gefunden.', 'Nothing found.')));
  setSel(0);
}
function setSel(i) {
  if (!shown.length) return;
  sel = (i + shown.length) % shown.length;
  list.querySelectorAll('.pal-i').forEach((el, k) => { el.setAttribute('aria-selected', k === sel ? 'true' : 'false'); const kb = el.querySelector('kbd'); if (k === sel && !kb && !touch()) el.append(h('kbd', {}, '↵')); if (k !== sel && kb) kb.remove(); });
  const cur = list.querySelector('#pal-' + sel); if (cur) { cur.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', cur.id); }
}
function runItem(i) { const x = shown[i]; if (!x) return; close(); setTimeout(() => x.run(), 0); }
async function askMax(q) {
  const { viaMax } = await import('./app.js');
  if (await viaMax(a => a.ask(q))) return;
  const { askTutorAbout } = await import('./app.js');
  if (S.doc) askTutorAbout(q, { confirm: false });
}

// Touch/Handy: keine Tastenkürzel zeigen (Esc, ↑↓, ↵, Strg K)
const touch = () => matchMedia('(pointer: coarse), (max-width: 600px)').matches;
function build() {
  input = h('input', { class: 'pal-in', type: 'search', placeholder: L('Suchen oder Max fragen …', 'Search or ask Max …'), autocomplete: 'off', spellcheck: 'false', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'pal-list', 'aria-label': L('Suche', 'Search') });
  list = h('div', { class: 'pal-list', id: 'pal-list', role: 'listbox' });
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  dlg = h('dialog', { class: 'pal', 'aria-label': L('Suche und Befehle', 'Search and commands') },
    h('div', { class: 'pal-top' }, h('span', { class: 'pal-si', html: ico('search') }), input, touch() ? h('button', { class: 'pal-x pal-xt', type: 'button', 'aria-label': L('Schließen', 'Close'), onclick: close, html: ico('x') }) : h('button', { class: 'pal-x', type: 'button', onclick: close }, 'Esc')),
    list,
    touch() ? null : h('div', { class: 'pal-foot' }, h('span', {}, h('kbd', {}, '↑'), h('kbd', {}, '↓'), L(' auswählen', ' select')), h('span', {}, h('kbd', {}, '↵'), L(' öffnen', ' open')), h('span', {}, h('kbd', {}, mac ? '⌘K' : 'Strg K'), L(' überall', ' anywhere'))));
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(sel + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(sel - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); runItem(sel); }
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  dlg.addEventListener('close', () => { document.documentElement.classList.remove('pal-open'); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  document.body.appendChild(dlg);
}
export function openPalette(q = '') {
  if (!dlg) build();
  if (dlg.open) return;
  lastFocus = document.activeElement;
  items = collect();
  input.value = q;
  render(q);
  dlg.showModal();
  document.documentElement.classList.add('pal-open');
  input.focus();
}
export function close() { if (dlg && dlg.open) dlg.close(); }

// Tastenkürzel: ⌘K / Strg+K überall, „/“ wenn man nicht gerade tippt
export function bindPalette() {
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg && dlg.open ? close() : openPalette(); return; }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (!document.querySelector('#app .app')) return;
      e.preventDefault(); openPalette();
    }
  });
}
