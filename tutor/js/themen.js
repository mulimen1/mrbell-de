// Themen-Einstiege für Google-Anzeigen und Links: bwlmax.de/?thema=kapitalwert
// → Überschrift passt zur Suche („Kapitalwertmethode – einfach erklärt.“) und Max erklärt das Thema sofort an der Tafel.
// Freitext geht auch: ?q=kapitalwert+berechnen (nur Buchstaben, Zahlen, Leerzeichen, Bindestrich).
export const THEMEN = {
  kapitalwert: ['Kapitalwertmethode', 'die Kapitalwertmethode (Net Present Value) – mit einem durchgerechneten Investitionsbeispiel'],
  deckungsbeitrag: ['Deckungsbeitrag', 'den Deckungsbeitrag – pro Stück und gesamt, mit einem Beispiel'],
  buchungssatz: ['Buchungssätze', 'wie man Buchungssätze bildet – mit typischen Beispielen wie Skonto und Abschreibung'],
  kostenrechnung: ['Kostenrechnung', 'die Kostenrechnung – Kostenarten, Kostenstellen, Kostenträger, mit Beispiel'],
  'break-even': ['Break-even-Point', 'den Break-even-Point – mit Formel, Beispiel und Grafik'],
  swot: ['SWOT-Analyse', 'die SWOT-Analyse – mit einem Unternehmensbeispiel'],
  'marketing-mix': ['Marketing-Mix', 'den Marketing-Mix (4P) – mit einem Beispiel'],
  preiselastizitaet: ['Preiselastizität', 'die Preiselastizität der Nachfrage – mit Formel und Beispiel'],
  leverage: ['Leverage-Effekt', 'den Leverage-Effekt – mit Zahlenbeispiel'],
  amortisation: ['Amortisationsrechnung', 'die Amortisationsrechnung – statisch und dynamisch, mit Beispiel'],
  zuschlagskalkulation: ['Zuschlagskalkulation', 'die Zuschlagskalkulation – Schema und durchgerechnetes Beispiel'],
  zinsfuss: ['Interner Zinsfuß', 'die Methode des internen Zinsfußes – mit Beispiel'],
  annuitaet: ['Annuitätenmethode', 'die Annuitätenmethode – mit Beispiel'],
  abschreibung: ['Abschreibung', 'Abschreibungen – linear und degressiv, mit Buchungssatz'],
  bilanz: ['Bilanz', 'die Bilanz – Aktiva, Passiva und wie sie zusammenhängt'],
  guv: ['Gewinn- und Verlustrechnung', 'die Gewinn- und Verlustrechnung – Gesamt- und Umsatzkostenverfahren'],
  bab: ['Betriebsabrechnungsbogen', 'den Betriebsabrechnungsbogen (BAB) – Schritt für Schritt mit Beispiel'],
  rueckstellungen: ['Rückstellungen', 'Rückstellungen – wann, warum und wie man sie bucht'],
  eigenkapitalrentabilitaet: ['Eigenkapitalrentabilität', 'die Eigenkapitalrentabilität – Formel, Beispiel und Zusammenhang zum Leverage-Effekt'],
  grenzkosten: ['Grenzkosten', 'Grenzkosten – mit Kostenfunktion und Beispiel'],
  porter: ['Porters Five Forces', 'Porters Five Forces – mit einem Branchenbeispiel']
};
const clean = s => String(s || '').replace(/[^\p{L}\p{N} \-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
export function landingTopic(search = location.search) {
  let p; try { p = new URLSearchParams(search); } catch (e) { return null; }
  const slug = String(p.get('thema') || '').toLowerCase().trim();
  // Allgemeiner Einstieg (Suchen wie „bwl hilfe“, „bwl lernen“): Überblick an der Tafel, dann fragt Max, wo's hakt
  if (slug === 'bwl') return { slug, name: 'BWL', show: 'Hilf mir mit BWL.', wait: 'Klar, dafür bin ich da. Ich bau dir jetzt live an der Tafel den Überblick übers BWL-Studium – danach sagst du mir, wo’s hakt, und wir gehen genau da rein.', ask: 'Gib mir an der Tafel einen kompakten Überblick über die großen Bereiche im BWL-Studium (Rechnungswesen, Kostenrechnung, Investition und Finanzierung, Marketing, Management) – je mit den zwei, drei typischen Klausurthemen und einem Satz, worum es geht. Frag mich am Ende, bei welchem Thema ich gerade Hilfe brauche. Bleib dafür hier im Tutor-Raum.' };
  if (THEMEN[slug]) { const [name, what] = THEMEN[slug]; return { slug, name, ask: `Erklär mir ${what} von Grund auf, an der Tafel. Bleib dafür hier im Tutor-Raum.` }; }
  const q = clean(p.get('q'));
  if (q.length >= 3) { const name = q.charAt(0).toUpperCase() + q.slice(1); return { slug: 'q:' + q.toLowerCase(), name, ask: `Erklär mir „${name}“ von Grund auf – mit Beispiel an der Tafel. Bleib dafür hier im Tutor-Raum.` }; }
  return null;
}
