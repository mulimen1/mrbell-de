// Zustand der App: aktuelles Skript, Speichern, Hilfsfunktionen
import { docs, kv } from './db.js';
import { uid } from './util.js';
import { EN } from './i18n.js';

export const S = { doc: null, list: [] };
const subs = new Set();
export const onChange = fn => { subs.add(fn); return () => subs.delete(fn); };
export const emit = () => subs.forEach(f => { try { f(S); } catch (e) { console.error(e); } });

// Wer mitlesen will, dass Skripte gespeichert/gelöscht wurden (Konto-Abgleich, werke.js)
export const docWrites = new Set();
const wrote = (o = {}) => docWrites.forEach(f => { try { f(o); } catch (e) {} });
let saveT = null;
export function save(doc = S.doc) {
  if (!doc) return;
  doc.used = Date.now();
  clearTimeout(saveT);
  saveT = setTimeout(() => docs.put(doc).then(() => wrote()).catch(e => console.warn('Speichern fehlgeschlagen', e)), 250);
}
export async function saveNow(doc = S.doc) { if (doc) { clearTimeout(saveT); doc.used = Date.now(); await docs.put(doc); wrote(); } }

export async function refreshList() { S.list = await docs.all(); emit(); return S.list; }
export async function openDoc(id) {
  const d = await docs.get(id);
  if (!d) return null;
  S.doc = migrate(d); kv.set('last', id); emit(); return S.doc;
}
export async function createDoc({ name, pages, chars, sample = false, generated = false, topic = '', extra = null }) {
  const d = migrate(Object.assign({ id: uid(), name, pages, chars, created: Date.now(), used: Date.now(), sample, generated, topic }, extra || {}));
  await docs.put(d); S.doc = d; kv.set('last', d.id); await refreshList(); wrote(); return d;
}
export async function removeDoc(id) { await docs.del(id); if (S.doc && S.doc.id === id) S.doc = null; await refreshList(); wrote({ del: id }); }
export async function lastDocId() { return kv.get('last'); }

export function migrate(d) {
  d.quizzes ||= []; d.decks ||= []; d.podcasts ||= []; d.chat ||= []; d.boards ||= []; d.mistakes ||= [];
  d.stats ||= { answered: 0, correct: 0, days: {} };
  d.lessons ||= {};
  return d;
}

export function track(correct) {
  const d = S.doc; if (!d) return;
  d.stats.answered++; if (correct) d.stats.correct++;
  const k = new Date().toISOString().slice(0, 10);
  d.stats.days[k] = (d.stats.days[k] || 0) + 1;
  save();
}

// Lernstand 0–100: Kapitel (Lektion + Kontrollfragen), Quiz-Ergebnisse, Karteikarten
export function mastery(d = S.doc) {
  if (!d) return 0;
  const parts = [];
  if (d.path && d.path.chapters?.length) {
    const ch = d.path.chapters;
    const w = ch.reduce((a, c) => a + (c.weight || 2), 0);
    parts.push([ch.reduce((a, c) => a + (c.weight || 2) * (c.done ? Math.max(.6, c.score ?? .8) : (c.started ? .2 : 0)), 0) / w, 2]);
  }
  const qs = d.quizzes.filter(q => q.results?.length);
  if (qs.length) parts.push([qs.slice(-5).reduce((a, q) => a + Math.max(...q.results.map(r => r.score)), 0) / Math.min(5, qs.length), 1.5]);
  const cards = d.decks.flatMap(x => x.cards);
  if (cards.length) parts.push([cards.filter(c => (c.reps || 0) > 0 && (c.ivl || 0) >= 3).length / cards.length, 1]);
  if (!parts.length) return 0;
  const tw = parts.reduce((a, p) => a + p[1], 0);
  return Math.round(100 * parts.reduce((a, p) => a + p[0] * p[1], 0) / tw);
}

// Beispiel-Skript, damit man ohne eigene Datei sofort loslegen kann (eigener Text)
const SAMPLE_DE = {
  name: 'Beispiel · Deckungsbeitragsrechnung',
  pages: [
    `Kosten- und Leistungsrechnung\nKapitel 4: Teilkostenrechnung und Deckungsbeitragsrechnung\nLernziele: Sie können variable und fixe Kosten trennen, den Deckungsbeitrag berechnen, die Gewinnschwelle bestimmen und kurzfristige Entscheidungen (Preisuntergrenze, Zusatzauftrag, Engpass) mit Deckungsbeiträgen treffen.`,
    `Warum Teilkostenrechnung?\nDie Vollkostenrechnung verteilt alle Kosten – auch die Fixkosten – auf die Produkte. Für kurzfristige Entscheidungen führt das oft zu Fehlern: Fixkosten fallen kurzfristig ohnehin an, egal ob ein Produkt hergestellt wird oder nicht. Die Teilkostenrechnung rechnet den Produkten deshalb nur die variablen Kosten zu. Die Fixkosten werden als Block behandelt.`,
    `Variable und fixe Kosten\nVariable Kosten ändern sich mit der Ausbringungsmenge (z. B. Material, Fertigungslöhne im Akkord, Verpackung). Fixe Kosten bleiben innerhalb einer Periode bei schwankender Menge gleich (z. B. Miete, Gehälter, Abschreibungen, Versicherungen).\nKostenfunktion: \\(K(x) = K_f + k_v \\cdot x\\)\n\\(K_f\\) = Fixkosten, \\(k_v\\) = variable Stückkosten, \\(x\\) = Menge.`,
    `Der Deckungsbeitrag\nDer Deckungsbeitrag (DB) ist die Differenz zwischen Umsatzerlösen und variablen Kosten: \\(DB = U - K_v\\).\nStückdeckungsbeitrag: \\(db = p - k_v\\) (Preis minus variable Stückkosten).\nDer Deckungsbeitrag zeigt, wie viel ein Produkt zur Deckung der Fixkosten beiträgt. Erst wenn die Summe der Deckungsbeiträge die Fixkosten übersteigt, entsteht Gewinn: Betriebsergebnis \\(= DB - K_f\\).\nBeispiel: Preis 50 €, variable Stückkosten 30 €, db = 20 €.`,
    `Break-even-Analyse (Gewinnschwelle)\nDie Gewinnschwelle (Break-even-Menge) ist die Menge, bei der Erlöse und Gesamtkosten gleich sind. Gewinn = 0.\n\\(x^{*} = \\frac{K_f}{db} = \\frac{K_f}{p - k_v}\\)\nBeispiel: Fixkosten 60.000 €, Preis 50 €, kv 30 € → db = 20 € → \\(x^{*} = \\frac{60.000}{20} = 3.000\\) Stück.\nBreak-even-Umsatz \\(= x^{*} \\cdot p = 150.000\\) €.\nSicherheitsstrecke (Sicherheitsabstand) \\(= \\frac{\\text{Ist-Menge} - x^{*}}{\\text{Ist-Menge}}\\). Bei 4.000 verkauften Stück: \\(\\frac{4.000 - 3.000}{4.000} = 25\\,\\%\\).`,
    `Preisuntergrenzen\nKurzfristige Preisuntergrenze: Der Preis muss mindestens die variablen Stückkosten decken (\\(p \\geq k_v\\)), denn die Fixkosten fallen kurzfristig ohnehin an. Jeder positive Deckungsbeitrag verbessert das Ergebnis.\nLangfristige Preisuntergrenze: Der Preis muss die vollen Stückkosten (Selbstkosten) decken: \\(p \\geq k_v + \\frac{K_f}{x}\\).\nBeispiel: \\(k_v\\) = 30 €, \\(K_f\\) = 60.000 €, \\(x\\) = 3.000 → langfristige Preisuntergrenze 50 €.`,
    `Zusatzauftrag\nEin Zusatzauftrag lohnt sich kurzfristig, wenn (1) freie Kapazität vorhanden ist und (2) der angebotene Preis über den variablen Stückkosten liegt, also ein positiver Deckungsbeitrag entsteht. Zusätzliche auftragsfixe Kosten (z. B. Sonderwerkzeug) müssen vom Deckungsbeitrag des Auftrags gedeckt werden.\nBeispiel: Anfrage über 500 Stück zu 38 €, \\(k_v\\) = 30 € → \\(DB = 500 \\cdot 8 = 4.000\\) € → annehmen, wenn Kapazität frei ist.`,
    `Engpassplanung\nGibt es keinen Engpass, werden alle Produkte mit positivem Stückdeckungsbeitrag hergestellt.\nGibt es einen Engpass (z. B. begrenzte Maschinenstunden), entscheidet der relative Deckungsbeitrag: \\(\\text{db je Engpasseinheit} = \\frac{db}{\\text{Beanspruchung des Engpasses}}\\).\nBeispiel: Produkt A: db 20 €, 2 Std. → 10 €/Std. Produkt B: db 30 €, 5 Std. → 6 €/Std. Rangfolge: zuerst A, dann B – obwohl B den höheren absoluten db hat.`,
    `Mehrstufige Deckungsbeitragsrechnung\nDie Fixkosten werden schrittweise den Bereichen zugeordnet, die sie verursachen:\nUmsatzerlöse − variable Kosten = DB I\nDB I − Erzeugnisfixkosten = DB II\nDB II − Erzeugnisgruppenfixkosten = DB III\nDB III − Bereichsfixkosten = DB IV\nSumme DB IV − Unternehmensfixkosten = Betriebsergebnis\nVorteil: Man sieht, welches Produkt und welche Gruppe welche Fixkosten tatsächlich deckt.`,
    `Zusammenfassung\n– Teilkostenrechnung: nur variable Kosten werden den Produkten zugerechnet.\n– \\(db = p - k_v\\); Betriebsergebnis \\(= \\sum DB - K_f\\).\n– Break-even-Menge \\(x^{*} = \\frac{K_f}{db}\\).\n– Kurzfristige Preisuntergrenze = \\(k_v\\), langfristige = Selbstkosten je Stück.\n– Zusatzauftrag: annehmen, wenn Kapazität frei und \\(db \\gt 0\\).\n– Engpass: Rangfolge nach relativem Deckungsbeitrag.`
  ]
};
// English version of the sample lecture (same content, same numbers)
const SAMPLE_EN = {
  name: 'Example · Contribution margin accounting',
  pages: [
    `Cost and Management Accounting\nChapter 4: Marginal costing and contribution margin accounting\nLearning objectives: You can separate variable and fixed costs, calculate the contribution margin, determine the break-even point and make short-term decisions (price floor, special order, bottleneck) using contribution margins.`,
    `Why marginal costing?\nFull costing allocates all costs – including fixed costs – to the products. For short-term decisions this often leads to mistakes: in the short term, fixed costs are incurred anyway, whether a product is made or not. Marginal costing therefore assigns only the variable costs to the products. Fixed costs are treated as a single block.`,
    `Variable and fixed costs\nVariable costs change with the output volume (e.g. materials, piece-rate production wages, packaging). Fixed costs stay the same within a period even when volume fluctuates (e.g. rent, salaries, depreciation, insurance).\nCost function: \\(C(x) = C_f + c_v \\cdot x\\)\n\\(C_f\\) = fixed costs, \\(c_v\\) = variable cost per unit, \\(x\\) = quantity.`,
    `The contribution margin\nThe contribution margin (CM) is the difference between sales revenue and variable costs: \\(CM = R - C_v\\).\nUnit contribution margin: \\(cm = p - c_v\\) (price minus variable cost per unit).\nThe contribution margin shows how much a product contributes to covering fixed costs. Only once the total of all contribution margins exceeds fixed costs is there a profit: operating result \\(= CM - C_f\\).\nExample: price €50, variable cost per unit €30, cm = €20.`,
    `Break-even analysis\nThe break-even point (break-even quantity) is the quantity at which revenue and total costs are equal. Profit = 0.\n\\(x^{*} = \\frac{C_f}{cm} = \\frac{C_f}{p - c_v}\\)\nExample: fixed costs €60,000, price €50, cv €30 → cm = €20 → \\(x^{*} = \\frac{60{,}000}{20} = 3{,}000\\) units.\nBreak-even revenue \\(= x^{*} \\cdot p\\) = €150,000.\nMargin of safety \\(= \\frac{\\text{actual quantity} - x^{*}}{\\text{actual quantity}}\\). With 4,000 units sold: \\(\\frac{4{,}000 - 3{,}000}{4{,}000} = 25\\,\\%\\).`,
    `Price floors\nShort-term price floor: the price must at least cover the variable cost per unit (\\(p \\geq c_v\\)), because fixed costs are incurred anyway in the short term. Every positive contribution margin improves the result.\nLong-term price floor: the price must cover the full cost per unit (total unit cost): \\(p \\geq c_v + \\frac{C_f}{x}\\).\nExample: \\(c_v\\) = €30, \\(C_f\\) = €60,000, \\(x\\) = 3,000 → long-term price floor €50.`,
    `Special order\nA special order pays off in the short term if (1) there is spare capacity and (2) the price offered is above the variable cost per unit, i.e. it generates a positive contribution margin. Additional order-specific fixed costs (e.g. special tooling) must be covered by the order's contribution margin.\nExample: request for 500 units at €38, \\(c_v\\) = €30 → CM = \\(500 \\cdot 8\\) = €4,000 → accept if capacity is available.`,
    `Bottleneck planning\nIf there is no bottleneck, all products with a positive unit contribution margin are produced.\nIf there is a bottleneck (e.g. limited machine hours), the relative contribution margin decides: \\(\\text{cm per bottleneck unit} = \\frac{cm}{\\text{use of the bottleneck}}\\).\nExample: product A: cm €20, 2 hrs → €10/hr. Product B: cm €30, 5 hrs → €6/hr. Ranking: A first, then B – even though B has the higher absolute cm.`,
    `Multi-level contribution margin accounting\nFixed costs are assigned step by step to the areas that cause them:\nSales revenue − variable costs = CM I\nCM I − product fixed costs = CM II\nCM II − product group fixed costs = CM III\nCM III − division fixed costs = CM IV\nTotal CM IV − company-wide fixed costs = operating result\nAdvantage: you can see which product and which group actually covers which fixed costs.`,
    `Summary\n– Marginal costing: only variable costs are assigned to the products.\n– \\(cm = p - c_v\\); operating result \\(= \\sum CM - C_f\\).\n– Break-even quantity \\(x^{*} = \\frac{C_f}{cm}\\).\n– Short-term price floor = \\(c_v\\), long-term = total cost per unit.\n– Special order: accept if capacity is free and \\(cm \\gt 0\\).\n– Bottleneck: rank by relative contribution margin.`
  ]
};
export const SAMPLE = EN ? SAMPLE_EN : SAMPLE_DE;
