// Zustand der App: aktuelles Skript, Speichern, Hilfsfunktionen
import { docs, kv } from './db.js';
import { uid } from './util.js';

export const S = { doc: null, list: [] };
const subs = new Set();
export const onChange = fn => { subs.add(fn); return () => subs.delete(fn); };
export const emit = () => subs.forEach(f => { try { f(S); } catch (e) { console.error(e); } });

let saveT = null;
export function save(doc = S.doc) {
  if (!doc) return;
  doc.used = Date.now();
  clearTimeout(saveT);
  saveT = setTimeout(() => docs.put(doc).catch(e => console.warn('Speichern fehlgeschlagen', e)), 250);
}
export async function saveNow(doc = S.doc) { if (doc) { clearTimeout(saveT); doc.used = Date.now(); await docs.put(doc); } }

export async function refreshList() { S.list = await docs.all(); emit(); return S.list; }
export async function openDoc(id) {
  const d = await docs.get(id);
  if (!d) return null;
  S.doc = migrate(d); kv.set('last', id); emit(); return S.doc;
}
export async function createDoc({ name, pages, chars, sample = false, generated = false, topic = '' }) {
  const d = migrate({ id: uid(), name, pages, chars, created: Date.now(), used: Date.now(), sample, generated, topic });
  await docs.put(d); S.doc = d; kv.set('last', d.id); await refreshList(); return d;
}
export async function removeDoc(id) { await docs.del(id); if (S.doc && S.doc.id === id) S.doc = null; await refreshList(); }
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
export const SAMPLE = {
  name: 'Beispiel · Deckungsbeitragsrechnung',
  pages: [
    `Kosten- und Leistungsrechnung\nKapitel 4: Teilkostenrechnung und Deckungsbeitragsrechnung\nLernziele: Sie können variable und fixe Kosten trennen, den Deckungsbeitrag berechnen, die Gewinnschwelle bestimmen und kurzfristige Entscheidungen (Preisuntergrenze, Zusatzauftrag, Engpass) mit Deckungsbeiträgen treffen.`,
    `Warum Teilkostenrechnung?\nDie Vollkostenrechnung verteilt alle Kosten – auch die Fixkosten – auf die Produkte. Für kurzfristige Entscheidungen führt das oft zu Fehlern: Fixkosten fallen kurzfristig ohnehin an, egal ob ein Produkt hergestellt wird oder nicht. Die Teilkostenrechnung rechnet den Produkten deshalb nur die variablen Kosten zu. Die Fixkosten werden als Block behandelt.`,
    `Variable und fixe Kosten\nVariable Kosten ändern sich mit der Ausbringungsmenge (z. B. Material, Fertigungslöhne im Akkord, Verpackung). Fixe Kosten bleiben innerhalb einer Periode bei schwankender Menge gleich (z. B. Miete, Gehälter, Abschreibungen, Versicherungen).\nKostenfunktion: K(x) = Kf + kv · x\nKf = Fixkosten, kv = variable Stückkosten, x = Menge.`,
    `Der Deckungsbeitrag\nDer Deckungsbeitrag (DB) ist die Differenz zwischen Umsatzerlösen und variablen Kosten: DB = U − Kv.\nStückdeckungsbeitrag: db = p − kv (Preis minus variable Stückkosten).\nDer Deckungsbeitrag zeigt, wie viel ein Produkt zur Deckung der Fixkosten beiträgt. Erst wenn die Summe der Deckungsbeiträge die Fixkosten übersteigt, entsteht Gewinn: Betriebsergebnis = DB − Kf.\nBeispiel: Preis 50 €, variable Stückkosten 30 €, db = 20 €.`,
    `Break-even-Analyse (Gewinnschwelle)\nDie Gewinnschwelle (Break-even-Menge) ist die Menge, bei der Erlöse und Gesamtkosten gleich sind. Gewinn = 0.\nx* = Kf / db = Kf / (p − kv)\nBeispiel: Fixkosten 60.000 €, Preis 50 €, kv 30 € → db = 20 € → x* = 60.000 / 20 = 3.000 Stück.\nBreak-even-Umsatz = x* · p = 150.000 €.\nSicherheitsstrecke (Sicherheitsabstand) = (Ist-Menge − x*) / Ist-Menge. Bei 4.000 verkauften Stück: (4.000 − 3.000) / 4.000 = 25 %.`,
    `Preisuntergrenzen\nKurzfristige Preisuntergrenze: Der Preis muss mindestens die variablen Stückkosten decken (p ≥ kv), denn die Fixkosten fallen kurzfristig ohnehin an. Jeder positive Deckungsbeitrag verbessert das Ergebnis.\nLangfristige Preisuntergrenze: Der Preis muss die vollen Stückkosten (Selbstkosten) decken: p ≥ kv + Kf / x.\nBeispiel: kv = 30 €, Kf = 60.000 €, x = 3.000 → langfristige Preisuntergrenze 50 €.`,
    `Zusatzauftrag\nEin Zusatzauftrag lohnt sich kurzfristig, wenn (1) freie Kapazität vorhanden ist und (2) der angebotene Preis über den variablen Stückkosten liegt, also ein positiver Deckungsbeitrag entsteht. Zusätzliche auftragsfixe Kosten (z. B. Sonderwerkzeug) müssen vom Deckungsbeitrag des Auftrags gedeckt werden.\nBeispiel: Anfrage über 500 Stück zu 38 €, kv = 30 € → DB = 500 · 8 € = 4.000 € → annehmen, wenn Kapazität frei ist.`,
    `Engpassplanung\nGibt es keinen Engpass, werden alle Produkte mit positivem Stückdeckungsbeitrag hergestellt.\nGibt es einen Engpass (z. B. begrenzte Maschinenstunden), entscheidet der relative Deckungsbeitrag: db je Engpasseinheit = db / Beanspruchung des Engpasses.\nBeispiel: Produkt A: db 20 €, 2 Std. → 10 €/Std. Produkt B: db 30 €, 5 Std. → 6 €/Std. Rangfolge: zuerst A, dann B – obwohl B den höheren absoluten db hat.`,
    `Mehrstufige Deckungsbeitragsrechnung\nDie Fixkosten werden schrittweise den Bereichen zugeordnet, die sie verursachen:\nUmsatzerlöse − variable Kosten = DB I\nDB I − Erzeugnisfixkosten = DB II\nDB II − Erzeugnisgruppenfixkosten = DB III\nDB III − Bereichsfixkosten = DB IV\nSumme DB IV − Unternehmensfixkosten = Betriebsergebnis\nVorteil: Man sieht, welches Produkt und welche Gruppe welche Fixkosten tatsächlich deckt.`,
    `Zusammenfassung\n– Teilkostenrechnung: nur variable Kosten werden den Produkten zugerechnet.\n– db = p − kv; Betriebsergebnis = Σ DB − Kf.\n– Break-even-Menge x* = Kf / db.\n– Kurzfristige Preisuntergrenze = kv, langfristige = Selbstkosten je Stück.\n– Zusatzauftrag: annehmen, wenn Kapazität frei und db > 0.\n– Engpass: Rangfolge nach relativem Deckungsbeitrag.`
  ]
};
