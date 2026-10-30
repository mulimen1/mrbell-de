// AUTOMATISCH ERZEUGT aus /home/claude/pruefmaschine/fakten/register.py (export_js.py) – nicht von Hand ändern.
// Faktenregister: falsche/veraltete Aussagen (Gesetze, Grenzwerte, Sätze, Fristen, bekannte Fehlermuster) mit richtiger Aussage und Quelle.
export const FAKTEN = [
 {
  "id": "selbst-geschaffene-marke",
  "muster": "(?:dürfen|darf|können|kann)[^.]{0,30}selbst (?:geschaffen|erstellt)\\w*[^.]{0,60}Marken[^.]{0,60}aktiviert|selbst (?:geschaffen|erstellt)\\w*[^.]{0,80}Marken[^.]{0,80}(?:aktiviert werden (?:dürfen|können)|aktivierbar|ausgewiesen werden (?:dürfen|können)|dürfen[^.]{0,30}aktiviert)",
  "kontext": null,
  "ausser": "\\bnicht\\b|\\bkein|Verbot|verboten|ausgenommen|IFRS|IAS",
  "richtig": "Selbst geschaffene Marken, Drucktitel, Verlagsrechte, Kundenlisten u. Ä. des Anlagevermögens dürfen nach HGB nicht aktiviert werden (§ 248 Abs. 2 S. 2 HGB).",
  "quelle": "https://www.gesetze-im-internet.de/hgb/__248.html"
 },
 {
  "id": "kleinunternehmer-grenze",
  "muster": "(?:22\\.000|22 000|22\\.000,00)\\s*(?:€|Euro)|(?<![\\d.])50\\.000\\s*(?:€|Euro)[^.]{0,80}(?:laufend|voraussichtlich)",
  "kontext": "Kleinunternehmer|§\\s*19 UStG",
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona",
  "richtig": "Kleinunternehmer (§ 19 UStG, seit 1.1.2025): Vorjahresumsatz höchstens 25.000 €, im laufenden Jahr höchstens 100.000 €.",
  "quelle": "https://www.gesetze-im-internet.de/ustg_1980/__19.html"
 },
 {
  "id": "degressive-afa",
  "muster": "(?:2,5-fache|zweieinhalbfache|höchstens 25\\s*%|maximal 25\\s*%)(?:[^.]|\\.(?=\\s*\\d)|(?:Abs|Nr|S|bzw|ggf|vgl)\\.|\\.\\s+(?:Der|Die|Das) (?:Satz|AfA|Höchstsatz|Prozentsatz)){0,160}degressiv|degressiv(?:[^.]|\\.(?=\\s*\\d)|(?:Abs|Nr|S|bzw|ggf|vgl)\\.|\\.\\s+(?:Der|Die|Das) (?:Satz|AfA|Höchstsatz|Prozentsatz)){0,200}(?:2,5-fache|zweieinhalbfache|höchstens 25\\s*%|maximal 25\\s*%)",
  "kontext": null,
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona",
  "richtig": "Degressive AfA (§ 7 Abs. 2 EStG): für bewegliche Wirtschaftsgüter mit Anschaffung 1.7.2025–31.12.2027 höchstens das Dreifache des linearen Satzes, maximal 30 %.",
  "quelle": "https://www.gesetze-im-internet.de/estg/__7.html"
 },
 {
  "id": "offenlegung-dirug",
  "muster": "(?:beim|an den|dem|den) Betreiber des (?:elektronischen )?Bundesanzeigers|im (?:elektronischen )?Bundesanzeiger (?:offenleg|veröffentlich|einreich)\\w*",
  "kontext": "Offenleg|offenleg|§\\s*325|Jahresabschluss",
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona|2021|DiRUG|Unternehmensregister",
  "richtig": "Offenlegung (§ 325 HGB, seit Geschäftsjahren ab 1.1.2022 / DiRUG): Der Jahresabschluss wird an die das Unternehmensregister führende Stelle übermittelt und dort öffentlich zugänglich – nicht mehr im Bundesanzeiger.",
  "quelle": "https://www.gesetze-im-internet.de/hgb/__325.html"
 },
 {
  "id": "gwg-1000",
  "muster": "(?:GWG|geringwertig\\w*|Sofortabschreibung|Grenze|Wertgrenze)[^.]{0,40}?(?:bei|von|auf|bis(?: zu)?)\\s*\\**\\s*1\\.000\\s*(?:€|Euro)",
  "kontext": "GWG|geringwertig|Sofortabschreib|§\\s*6\\s*Abs\\.\\s*2(?!a)",
  "ausser": "Sammelposten|Pool|250|1\\.000\\s*(?:€|Euro)[^.]{0,40}(?:Sammel|Pool)",
  "richtig": "GWG (§ 6 Abs. 2 EStG): Sofortabschreibung bis 800 € netto; 1.000 € ist nur die Obergrenze des Sammelpostens (§ 6 Abs. 2a EStG, 250,01–1.000 €, 5 Jahre).",
  "quelle": "https://www.gesetze-im-internet.de/estg/__6.html"
 },
 {
  "id": "kleinunternehmer-voraussichtlich",
  "muster": "voraussichtlich\\w*[^.]{0,80}100\\.000\\s*(?:€|Euro)|100\\.000\\s*(?:€|Euro)[^.]{0,40}voraussichtlich",
  "kontext": "Kleinunternehmer|§\\s*19 UStG",
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona",
  "richtig": "Kleinunternehmer (§ 19 UStG, seit 1.1.2025): Vorjahresumsatz höchstens 25.000 € und der tatsächliche Umsatz im laufenden Jahr höchstens 100.000 € – beim Überschreiten endet die Regelung sofort (keine Prognose mehr).",
  "quelle": "https://www.gesetze-im-internet.de/ustg_1980/__19.html"
 },
 {
  "id": "gwg-alt",
  "muster": "(?:410|150)\\s*(?:€|Euro)[^.]{0,80}(?:GWG|geringwertig|Sofortabschreibung)|(?:GWG|geringwertig)[^.]{0,80}(?:410|150)\\s*(?:€|Euro)",
  "kontext": null,
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona|Sammelposten|250",
  "richtig": "GWG (§ 6 Abs. 2 EStG): Sofortabschreibung bis 800 € netto; Sammelposten (§ 6 Abs. 2a EStG) für 250,01–1.000 € über 5 Jahre.",
  "quelle": "https://www.gesetze-im-internet.de/estg/__6.html"
 },
 {
  "id": "aufbewahrung-belege",
  "muster": "(?:Buchungsbeleg|Belege|Rechnungen)[^.]{0,80}10 Jahre|10 Jahre[^.]{0,60}(?:Buchungsbeleg|Belege)",
  "kontext": null,
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona|Bücher|Jahresabschl|Inventar|Bilanz",
  "richtig": "Aufbewahrung (§ 257 HGB, § 147 AO, seit 1.1.2025): Buchungsbelege 8 Jahre; Handelsbücher, Inventare, Jahresabschlüsse 10 Jahre; Handels- und Geschäftsbriefe 6 Jahre.",
  "quelle": "https://www.gesetze-im-internet.de/hgb/__257.html"
 },
 {
  "id": "kst-satz",
  "muster": "Körperschaftsteuer(?:satz)?[^.]{0,60}(?:25|30)\\s*%",
  "kontext": null,
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona|Gesamt|inkl|einschließlich|Gewerbe|zusammen|rund 30|ca\\. 30|etwa 30",
  "richtig": "Körperschaftsteuer 15 % (§ 23 KStG) bis 2027, ab 2028 jährlich 1 Prozentpunkt weniger bis 10 % ab 2032; zzgl. 5,5 % Soli. Mit Gewerbesteuer ca. 30 % Gesamtbelastung.",
  "quelle": "https://www.gesetze-im-internet.de/kstg_1977/__23.html"
 },
 {
  "id": "e-rechnung",
  "muster": "E-Rechnung[^.]{0,120}(?:ab 2026 Pflicht für alle|freiwillig bis 2030)",
  "kontext": null,
  "ausser": null,
  "richtig": "E-Rechnung im Inland B2B: Empfang seit 1.1.2025 Pflicht; Ausstellung ab 2027 (Vorjahresumsatz > 800.000 €) bzw. ab 2028 für alle.",
  "quelle": "https://www.gesetze-im-internet.de/ustg_1980/__14.html"
 },
 {
  "id": "groessenklassen-alt",
  "muster": "(?:6\\.000\\.000|6 Mio\\.?|12\\.000\\.000|12 Mio\\.?|20\\.000\\.000|20 Mio\\.?|40\\.000\\.000|40 Mio\\.?|350\\.000|700\\.000)\\s*(?:€|Euro)?",
  "kontext": "§\\s*267|Größenklasse|kleine Kapitalgesellschaft|mittelgroße|Kleinstkapitalgesellschaft",
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona|Umsatzerlöse von 40|Arbeitnehmer",
  "richtig": "§ 267/267a HGB (seit GJ 2024): Kleinst ≤ 450.000 € Bilanzsumme, ≤ 900.000 € Umsatz, ≤ 10 AN; klein ≤ 7,5 Mio. €, ≤ 15 Mio. €, ≤ 50 AN; mittel ≤ 25 Mio. €, ≤ 50 Mio. €, ≤ 250 AN (je 2 von 3 Merkmalen).",
  "quelle": "https://www.gesetze-im-internet.de/hgb/__267.html"
 },
 {
  "id": "stueckaktie-nennwert",
  "muster": "Stückaktie[^.]{0,80}Nennwert|Nennwert[^.]{0,40}Stückaktie",
  "kontext": null,
  "ausser": "kein(?:en)? Nennwert|ohne Nennwert|nennwertlos|statt",
  "richtig": "Stückaktien haben keinen Nennwert, sondern einen rechnerischen Anteil am Grundkapital (mind. 1 €, § 8 Abs. 3 AktG).",
  "quelle": "https://www.gesetze-im-internet.de/aktg/__8.html"
 },
 {
  "id": "gmbh-stammkapital",
  "muster": "Stammkapital[^.]{0,60}(?:50\\.000|12\\.500\\s*€ Mindest)",
  "kontext": "GmbH",
  "ausser": "AG|Aktien",
  "richtig": "GmbH: Stammkapital mindestens 25.000 € (§ 5 GmbHG), bei Anmeldung mind. 12.500 € eingezahlt; AG: Grundkapital mindestens 50.000 € (§ 7 AktG).",
  "quelle": "https://www.gesetze-im-internet.de/gmbhg/__5.html"
 },
 {
  "id": "rap-zahlung",
  "muster": "(?:aktiver RAP|ARAP|aktive Rechnungsabgrenzung)[^.]{0,60}Auszahlung liegt",
  "kontext": null,
  "ausser": null,
  "richtig": "RAP knüpfen an Ausgaben/Einnahmen vor dem Stichtag an (§ 250 HGB), nicht zwingend an Zahlungen.",
  "quelle": "https://www.gesetze-im-internet.de/hgb/__250.html"
 },
 {
  "id": "nwp-immer",
  "muster": "Niederstwertprinzip[^.]{0,80}immer den niedrigeren",
  "kontext": null,
  "ausser": "Umlaufvermögen",
  "richtig": "Strenges NWP nur im Umlaufvermögen; im Anlagevermögen außerplanmäßige Abschreibung nur bei voraussichtlich dauernder Wertminderung (§ 253 Abs. 3, 4 HGB).",
  "quelle": "https://www.gesetze-im-internet.de/hgb/__253.html"
 },
 {
  "id": "wertaufholung-ak",
  "muster": "Wertaufholung[^.]{0,80}endet bei den Anschaffungskosten",
  "kontext": null,
  "ausser": "fortgeführt",
  "richtig": "Wertaufholung höchstens bis zu den fortgeführten Anschaffungs-/Herstellungskosten (§ 253 Abs. 5 HGB).",
  "quelle": "https://www.gesetze-im-internet.de/hgb/__253.html"
 },
 {
  "id": "kfr-drs21",
  "muster": "nach DRS 21[^.]{0,80}Zinsen[^.]{0,40}(?:laufende|operativ)",
  "kontext": null,
  "ausser": "abweichend|Vereinfachung",
  "richtig": "DRS 21: gezahlte Zinsen im Finanzierungs-, erhaltene Zinsen im Investitions-Cashflow (Industrie/Handel); Ertragsteuern operativ.",
  "quelle": "https://www.drsc.de/verlautbarungen/drs-21/"
 },
 {
  "id": "vst-ueberhang-buchung",
  "muster": "Vorsteuer\\s*(?:<span>)?\\s*an\\s*(?:</span>)?\\s*Umsatzsteuer",
  "kontext": "Überhang|Erstattung|Forderung gegen(?:über)? (?:das|dem) Finanzamt",
  "ausser": null,
  "richtig": "Abschluss der Steuerkonten: immer „Umsatzsteuer an Vorsteuer“ in Höhe des kleineren Betrags; Saldo = Zahllast oder Vorsteuerüberhang.",
  "quelle": "https://www.gesetze-im-internet.de/ustg_1980/__15.html"
 },
 {
  "id": "ezb-vpi",
  "muster": "EZB[^.]{0,80}\\bVPI\\b|\\bVPI\\b[^.]{0,80}EZB",
  "kontext": null,
  "ausser": "HVPI",
  "richtig": "Das EZB-Ziel (2 % mittelfristig) bezieht sich auf den HVPI des Euroraums, nicht auf den nationalen VPI.",
  "quelle": "EZB, geldpolitische Strategie (Inflationsziel 2 %, HVPI)"
 },
 {
  "id": "mindestlohn",
  "muster": "Mindestlohn[^.]{0,60}(?:12,41|12,82|12,00|10,45|9,82)\\s*€",
  "kontext": null,
  "ausser": "\\bvorher\\b|\\bzuvor\\b|bis (?:Ende )?20(?:1\\d|2[0-4])|vor 202[45]|\\bfrüher\\b|alt(?:e|en)? (?:Grenze|Regel|Fassung)|bisher|ehemals|damals|von 20\\d\\d bis|20(?:20|21|22) (?:bis|und)|Corona",
  "richtig": "Gesetzlicher Mindestlohn: 13,90 € je Stunde ab 1.1.2026, 14,60 € ab 1.1.2027.",
  "quelle": "Mindestlohngesetz, Anpassung auf Vorschlag der Mindestlohnkommission (BMAS)"
 },
 {
  "id": "mietpreisbremse",
  "muster": "Mietpreisbremse[^.]{0,80}(?:bis (?:Ende )?2025|läuft 2025 aus)",
  "kontext": null,
  "ausser": null,
  "richtig": "Mietpreisbremse verlängert bis 31.12.2029; gilt nur in Gebieten mit Landesverordnung, mit Ausnahmen (u. a. Neubau).",
  "quelle": "https://www.gesetze-im-internet.de/bgb/__556d.html"
 },
 {
  "id": "haavelmo-senkung",
  "muster": "senkt die Pauschalsteuer[^.]{0,60}erhöht[^.]{0,40}Ausgaben",
  "kontext": "Haavelmo|nicht von der|Multiplikator",
  "ausser": null,
  "richtig": "Haavelmo-Theorem: Staat ERHÖHT Ausgaben und Pauschalsteuern um denselben Betrag → ΔY = ΔG (Multiplikator 1).",
  "quelle": "Gabler Wirtschaftslexikon, Stichwort „Haavelmo Theorem“"
 },
 {
  "id": "little-bedarf-statt-engpass",
  "muster": "\\\\frac\\{1\\.800[^}]*\\}\\{180",
  "kontext": "Schweiß|Engpass|150 Stück",
  "ausser": "Typischer Fehler|Fehler:|\\bfalsch|Falle|nicht mit dem (?:Kunden)?[Bb]edarf",
  "richtig": "Little's Law: Durchlaufzeit = Bestand / tatsächlicher Durchsatz; bei einem Engpass ist das dessen Kapazität (hier 150 Stück/Tag), nicht der Kundenbedarf.",
  "quelle": "Gabler Wirtschaftslexikon, Stichwort „Durchlaufzeit“"
 },
 {
  "id": "grundkosten-zweckaufwand",
  "muster": "Grundkosten\\s*\\(?\\s*=\\s*Zweckaufwand",
  "kontext": null,
  "ausser": null,
  "richtig": "Grundkosten sind aufwandsgleiche Kosten; Zweckaufwand ist der betriebliche Aufwand, der zugleich Kosten ist – keine Synonyme in jeder Abgrenzung.",
  "quelle": "Gabler Wirtschaftslexikon, Stichwort „Grundkosten“"
 },
 {
  "id": "leasing-hgb-4090",
  "muster": "HGB[^.]{0,30}40[-–]90",
  "kontext": null,
  "ausser": "Leasingerlass|steuerlich",
  "richtig": "Die 40–90-%-Regel stammt aus den steuerlichen Leasingerlassen; HGB folgt dem wirtschaftlichen Eigentum (§ 246 Abs. 1 HGB).",
  "quelle": "https://www.gesetze-im-internet.de/hgb/__246.html"
 },
 {
  "id": "cobb-douglas-anteil",
  "muster": "Cobb-Douglas[^.]{0,80}Budgetanteil entspricht dem Exponenten",
  "kontext": null,
  "ausser": "Summe der Exponenten",
  "richtig": "Cobb-Douglas: optimaler Budgetanteil = Exponent / Summe der Exponenten (gleich dem Exponenten nur, wenn die Summe 1 ist).",
  "quelle": "Gabler Wirtschaftslexikon, Stichwort „Cobb Douglas Produktionsfunktion“"
 }
];
const C = FAKTEN.map(r => ({ ...r, re: new RegExp(r.muster, 'gi'), ko: r.kontext ? new RegExp(r.kontext, 'i') : null, au: r.ausser ? new RegExp(r.ausser, 'i') : null }));
const plain = s => String(s).replace(/<\s*br\s*\/?>|<\/(p|li|div|tr|h\d)>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
// Liefert Treffer [{id, text, richtig, quelle}] für einen Text; thema = Frage/Thema (zählt nur für den Kontext-Test)
export function faktenTreffer(s, thema = '') {
  const t = plain(s), out = [];
  for (const r of C) { r.re.lastIndex = 0; let m; while ((m = r.re.exec(t))) { const w = t.slice(Math.max(0, m.index - 200), m.index + m[0].length + 200); if (r.ko && !r.ko.test(w) && !(thema && r.ko.test(String(thema)))) continue; if (r.au && r.au.test(w)) continue; out.push({ id: r.id, text: t.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60).trim(), richtig: r.richtig, quelle: r.quelle }); if (!m[0].length) r.re.lastIndex++; } }
  return out;
}
