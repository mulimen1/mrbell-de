// Mini-Check auf den Themenseiten (Google-Ads-Einstieg): 3 Fragen direkt nach dem ersten Erklär-Block.
// Ergebnis („2 von 3 richtig“) gibt's sofort – welche falsch war und warum, sehen Gäste nach dem kostenlosen Konto.
import { h } from './util.js';
import { L } from './i18n.js';
import { getAccount, onAccount } from './api.js';

// Je Frage: q, Antworten (die RICHTIGE steht immer zuerst – gemischt wird beim Anzeigen), why
const SETS = {
  bilanz: [
    ['Wo steht ein Bankdarlehen in der Bilanz?', ['Auf der Passivseite', 'Auf der Aktivseite', 'Gar nicht – nur in der GuV'], 'Ein Darlehen ist Fremdkapital, also Mittelherkunft – und die steht auf der Passivseite.'],
    ['Was gilt in jeder Bilanz?', ['Summe Aktiva = Summe Passiva', 'Aktiva sind immer größer als Passiva', 'Eigenkapital = Fremdkapital'], 'Jeder Euro Vermögen (Aktiva) ist irgendwoher finanziert (Passiva) – deshalb sind beide Seiten immer gleich groß.'],
    ['Du bezahlst eine offene Lieferantenrechnung per Banküberweisung. Was passiert mit der Bilanzsumme?', ['Sie sinkt', 'Sie bleibt gleich', 'Sie steigt'], 'Die Falle: Das ist kein Tausch. Bank (Aktiva) und Verbindlichkeiten (Passiva) sinken beide – eine Aktiv-Passiv-Minderung, die Bilanzsumme wird kleiner.']
  ],
  buchungssatz: [
    ['Du kaufst Waren bar. Auf welcher Seite bucht das Kassenkonto?', ['Im Haben', 'Im Soll', 'Auf beiden Seiten'], 'Die Kasse ist ein Aktivkonto und nimmt ab – Abgänge stehen bei Aktivkonten im Haben.'],
    ['Wie lautet der Buchungssatz für einen Barkauf von Waren (ohne Umsatzsteuer)?', ['Wareneinkauf an Kasse', 'Kasse an Wareneinkauf', 'Bank an Kasse'], 'Zuerst das Konto im Soll (Wareneinkauf nimmt zu), dann „an“ das Konto im Haben (Kasse nimmt ab).'],
    ['Ein Kunde zahlt dir eine Anzahlung aufs Bankkonto, bevor du lieferst (ohne Umsatzsteuer). Was buchst du?', ['Bank an erhaltene Anzahlungen', 'Bank an Umsatzerlöse', 'Forderungen an Umsatzerlöse'], 'Die Falle: Ohne Lieferung gibt es noch keinen Umsatz. Du schuldest dem Kunden die Ware – die Anzahlung ist eine Verbindlichkeit („erhaltene Anzahlungen“). Umsatz wird erst bei Lieferung gebucht.']
  ],
  kapitalwert: [
    ['Der Kapitalwert einer Investition ist +5.000 €. Ist sie vorteilhaft?', ['Ja', 'Nein', 'Das hängt von der Nutzungsdauer ab'], 'Ein positiver Kapitalwert heißt: Die Investition bringt mehr als die Mindestverzinsung zum Kalkulationszins – sie lohnt sich.'],
    ['Der Kalkulationszins steigt von 10 % auf 12 %. Was passiert mit dem Kapitalwert einer normalen Investition?', ['Er sinkt', 'Er steigt', 'Er bleibt gleich'], 'Höherer Zins = stärkeres Abzinsen. Die späteren Rückflüsse sind heute weniger wert, also sinkt der Kapitalwert.'],
    ['Eine Investition hat einen Kapitalwert von genau 0 €. Was heißt das?', ['Sie verzinst sich genau zum Kalkulationszins', 'Sie bringt nichts – also lohnt sie sich nicht', 'Sie macht Verlust'], 'Die Falle: 0 € heißt nicht „bringt nichts“. Das eingesetzte Kapital wird genau zur Mindestverzinsung verzinst – der interne Zinsfuß entspricht dem Kalkulationszins. Die Investition ist gerade noch vorteilhaft.']
  ],
  deckungsbeitrag: [
    ['Preis 50 €, variable Kosten 30 € pro Stück. Wie hoch ist der Deckungsbeitrag pro Stück?', ['20 €', '80 €', '30 €'], 'Stück-DB = Preis − variable Stückkosten = 50 € − 30 € = 20 €.'],
    ['Werden Fixkosten beim Stück-Deckungsbeitrag abgezogen?', ['Nein, nur die variablen Kosten', 'Ja, immer', 'Nur zur Hälfte'], 'Der Deckungsbeitrag zeigt, was jedes Stück zur Deckung der Fixkosten beiträgt – die Fixkosten selbst kommen erst danach.'],
    ['Ein Produkt hat einen positiven Stück-Deckungsbeitrag, das Unternehmen macht insgesamt aber Verlust. Sollte das Produkt kurzfristig raus?', ['Nein – es deckt einen Teil der Fixkosten', 'Ja – es verursacht den Verlust', 'Ja – nur Produkte mit Gewinn lohnen sich'], 'Die Falle: Die Fixkosten bleiben kurzfristig auch ohne das Produkt. Solange der DB positiv ist, trägt jedes Stück etwas zu ihrer Deckung bei – rausnehmen würde den Verlust sogar vergrößern.']
  ],
  'break-even': [
    ['Fixkosten 10.000 €, Deckungsbeitrag 20 € pro Stück. Wo liegt die Break-even-Menge?', ['500 Stück', '200 Stück', '2.000 Stück'], 'Fixkosten ÷ Stück-DB = 10.000 € ÷ 20 € = 500 Stück. Ab dem 501. Stück machst du Gewinn.'],
    ['Was gilt genau im Break-even-Punkt?', ['Umsatz = Gesamtkosten', 'Umsatz = Fixkosten', 'Der Gewinn ist am höchsten'], 'Im Break-even-Punkt ist der Gewinn genau null: Erlöse und Gesamtkosten sind gleich hoch.'],
    ['Preis 50 €, variable Kosten 30 € pro Stück, Fixkosten 10.000 €. Der Preis sinkt um 10 % auf 45 €. Wo liegt die neue Break-even-Menge?', ['Bei rund 667 Stück', 'Bei 550 Stück', 'Bei 450 Stück'], 'Die Falle: 10 % weniger Preis sind nicht 10 % mehr Menge. Der DB fällt von 20 € auf 15 € (also um 25 %). 10.000 € ÷ 15 € = 666,7 – du brauchst rund 667 statt 500 Stück, ein Drittel mehr.']
  ],
  guv: [
    ['Die Miete fürs Büro – was ist das in der GuV?', ['Aufwand', 'Ertrag', 'Gar nichts – erfolgsneutral'], 'Miete verbraucht Werte und mindert den Gewinn – sie steht in der GuV als Aufwand.'],
    ['Das Unternehmen nimmt einen Kredit auf. Wie wirkt das in der GuV?', ['Gar nicht – das ist erfolgsneutral', 'Als Ertrag', 'Als Aufwand'], 'Ein Kredit ändert nur die Bilanz (mehr Bank, mehr Verbindlichkeiten). Erst die Zinsen darauf sind Aufwand.'],
    ['Du kaufst eine Maschine für 50.000 € bar. Wie viel Aufwand entsteht dadurch im Kaufjahr in der GuV?', ['Nur die Abschreibung für dieses Jahr', 'Die vollen 50.000 €', 'Gar keiner'], 'Die Falle: Der Kauf selbst ist erfolgsneutral – Kasse runter, Maschine rauf. Aufwand wird nur der Wertverlust: die Abschreibung, verteilt über die Nutzungsdauer.']
  ],
  kostenrechnung: [
    ['Die monatliche Miete für die Fertigungshalle – was für Kosten sind das?', ['Fixkosten', 'Variable Kosten', 'Einzelkosten'], 'Die Miete fällt an, egal wie viel produziert wird – also Fixkosten.'],
    ['Der Rohstoff, der direkt in ein Produkt eingeht – wie ordnest du ihn diesem Produkt zu?', ['Als Einzelkosten', 'Als Gemeinkosten', 'Als Fixkosten'], 'Er lässt sich dem einzelnen Produkt direkt zurechnen – das sind Einzelkosten.'],
    ['Die Produktion steigt von 1.000 auf 2.000 Stück. Was passiert mit den Fixkosten pro Stück?', ['Sie halbieren sich', 'Sie bleiben gleich – es sind ja Fixkosten', 'Sie verdoppeln sich'], 'Die Falle: Fix sind nur die Gesamtfixkosten. Pro Stück verteilen sie sich auf doppelt so viele Einheiten – sie halbieren sich (Fixkostendegression).']
  ],
  swot: [
    ['Ein starkes Markenimage ist in der SWOT-Analyse …', ['eine Stärke', 'eine Chance', 'ein Risiko'], 'Das Image gehört zum Unternehmen selbst (intern) und hilft ihm – also eine Stärke. Chancen kommen von außen.'],
    ['Ein neuer Konkurrent drängt auf den Markt. Wohin gehört das?', ['Risiko (Threat)', 'Schwäche (Weakness)', 'Stärke (Strength)'], 'Das passiert außerhalb des Unternehmens und kann ihm schaden – ein externes Risiko, keine interne Schwäche.'],
    ['Ein Gesetz verbietet bald neue Verbrennerautos. Für einen Hersteller von Ladesäulen ist das in der SWOT …', ['eine Chance (Opportunity)', 'eine Stärke (Strength)', 'ein Risiko (Threat)'], 'Die Falle: Gut fürs Unternehmen heißt nicht automatisch Stärke. Das Gesetz kommt von außen – also eine Chance. Stärken sind nur Dinge im Unternehmen selbst.']
  ],
  'marketing-mix': [
    ['Die 4 P des Marketing-Mix: Product, Price, Place und …', ['Promotion', 'People', 'Profit'], 'Promotion = Kommunikationspolitik, also Werbung, PR und Verkaufsförderung.'],
    ['Eine Rabattaktion gehört zu welchem Bereich?', ['Preispolitik', 'Produktpolitik', 'Distributionspolitik'], 'Rabatte verändern den Preis, den der Kunde zahlt – das ist Preis- bzw. Konditionenpolitik.'],
    ['Ein Hersteller bringt sein Produkt in einer neuen, edleren Verpackung heraus. Zu welchem P gehört das?', ['Product (Produktpolitik)', 'Promotion (Kommunikationspolitik)', 'Place (Distributionspolitik)'], 'Die Falle: Verpackung wirkt wie Werbung, gehört aber zum Produkt selbst – Verpackungsgestaltung ist Teil der Produktpolitik.']
  ],
  zuschlagskalkulation: [
    ['Fertigungsmaterial 100 €, Materialgemeinkosten-Zuschlag 10 %. Wie hoch sind die Materialkosten?', ['110 €', '100 €', '10 €'], 'Materialkosten = Fertigungsmaterial + 10 % MGK = 100 € + 10 € = 110 €.'],
    ['Woraus bestehen die Herstellkosten?', ['Materialkosten + Fertigungskosten', 'Materialkosten + Verwaltungsgemeinkosten', 'Selbstkosten + Gewinn'], 'Herstellkosten = Materialkosten + Fertigungskosten. Verwaltung und Vertrieb kommen erst danach dazu.'],
    ['Barverkaufspreis 220 €. Der Kunde bekommt 2 % Skonto. Wie hoch ist der Zielverkaufspreis?', ['224,49 €', '224,40 €', '215,60 €'], 'Die Falle: Skonto wird vom Zielverkaufspreis abgezogen, nicht vom Barverkaufspreis. Also rückwärts im Hundert rechnen: 220 € ÷ 0,98 = 224,49 € – nicht 220 € × 1,02.']
  ],
  preiselastizitaet: [
    ['Der Preis steigt um 10 %, die Absatzmenge sinkt um 20 %. Wie hoch ist die Preiselastizität (Betrag)?', ['2 – elastisch', '0,5 – unelastisch', '10'], 'Elastizität = Mengenänderung in % ÷ Preisänderung in % = 20 % ÷ 10 % = 2. Über 1 heißt elastisch.'],
    ['Die Nachfrage ist unelastisch (Betrag unter 1). Was passiert bei einer Preiserhöhung mit dem Umsatz?', ['Er steigt', 'Er sinkt', 'Er bleibt gleich'], 'Die Menge sinkt prozentual weniger, als der Preis steigt – unterm Strich bleibt mehr Umsatz.'],
    ['Der Preis sinkt um 5 %, die Absatzmenge steigt um genau 5 %. Was passiert mit dem Umsatz?', ['Er sinkt leicht', 'Er bleibt gleich', 'Er steigt leicht'], 'Die Falle: Prozente heben sich nicht einfach auf. 0,95 × 1,05 = 0,9975 – der Umsatz sinkt um 0,25 %.']
  ],
  leverage: [
    ['Mehr Fremdkapital erhöht die Eigenkapitalrentabilität, wenn …', ['die Gesamtkapitalrentabilität über dem Fremdkapitalzins liegt', 'der Fremdkapitalzins über der Gesamtkapitalrentabilität liegt', 'das Fremdkapital zinslos ist – sonst nie'], 'Solange jeder geliehene Euro mehr erwirtschaftet, als er an Zinsen kostet, bleibt die Differenz beim Eigenkapital hängen.'],
    ['Was ist das Leverage-Risiko?', ['Fällt die Gesamtkapitalrendite unter den FK-Zins, sinkt die EK-Rendite überproportional', 'Fremdkapitalzinsen steigen automatisch mit dem Gewinn', 'Eigenkapital wird zu Fremdkapital'], 'Der Hebel wirkt in beide Richtungen: Liegt die Rendite unter dem Zins, frisst der Zins einen Teil der EK-Rendite auf – je mehr FK, desto stärker.'],
    ['Gesamtkapitalrentabilität 8 %, FK-Zins 5 %, Eigenkapital 100.000 €, Fremdkapital 100.000 €. Wie hoch ist die EK-Rentabilität?', ['11 %', '8 %', '3 %'], 'Die Falle: Es sind nicht einfach 8 %. EK-Rendite = 8 % + (8 % − 5 %) × FK/EK = 8 % + 3 % × 1 = 11 % (ohne Steuern).']
  ],
  amortisation: [
    ['Wie berechnet man die Amortisationsdauer (Durchschnittsmethode)?', ['Anschaffungskosten ÷ jährlicher Rückfluss', 'Jährlicher Rückfluss ÷ Anschaffungskosten', 'Anschaffungskosten × Nutzungsdauer'], 'Du teilst, was du reinsteckst, durch das, was pro Jahr zurückkommt – dann weißt du, nach wie vielen Jahren das Geld wieder da ist.'],
    ['Anschaffung 60.000 €, Rückfluss 15.000 € pro Jahr. Amortisationsdauer?', ['4 Jahre', '5 Jahre', '9 Jahre'], '60.000 € ÷ 15.000 € = 4 Jahre.'],
    ['Investition A amortisiert sich in 2 Jahren, B in 4 Jahren. Welche ist wirtschaftlich besser?', ['Das lässt sich damit allein nicht sagen', 'A', 'B'], 'Die Falle: Die Amortisationsrechnung ignoriert alles nach der Amortisation. B kann danach noch viel mehr abwerfen. Sie misst vor allem das Risiko, nicht die Wirtschaftlichkeit.']
  ],
  zinsfuss: [
    ['Der interne Zinsfuß ist der Zins, bei dem …', ['der Kapitalwert genau 0 ist', 'der Kapitalwert am höchsten ist', 'sich die Investition amortisiert hat'], 'Beim internen Zinsfuß sind Barwert der Rückflüsse und Anschaffung genau gleich – Kapitalwert 0.'],
    ['Interner Zinsfuß 9 %, Kalkulationszins 6 %. Ist die Investition vorteilhaft?', ['Ja', 'Nein', 'Das lässt sich nicht sagen'], 'Die Investition verzinst sich mit 9 % – mehr als die geforderten 6 %. Also vorteilhaft.'],
    ['Du investierst heute 100 € und bekommst in 2 Jahren 121 € zurück. Wie hoch ist der interne Zinsfuß?', ['10 %', '10,5 %', '21 %'], 'Die Falle: 21 % durch 2 Jahre sind nicht 10,5 %, weil Zinsen sich verzinsen. 100 € × 1,10 × 1,10 = 121 € – also 10 %.']
  ],
  annuitaet: [
    ['Nach der Annuitätenmethode ist eine Investition vorteilhaft, wenn …', ['ihre Annuität größer als 0 ist', 'ihre Annuität kleiner als 0 ist', 'die Annuität den Anschaffungskosten entspricht'], 'Eine positive Annuität heißt: Jedes Jahr bleibt nach Verzinsung und Rückgewinnung des Kapitals ein Überschuss.'],
    ['Was verteilt die Annuität gleichmäßig auf die Nutzungsdauer?', ['Den Kapitalwert', 'Die Anschaffungskosten ohne Zinsen', 'Den Umsatz'], 'Annuität = Kapitalwert × Wiedergewinnungsfaktor – der Kapitalwert als gleich hoher Jahresbetrag.'],
    ['Eine Investition hat einen Kapitalwert von +10.000 €. Kann ihre Annuität negativ sein?', ['Nein, nie', 'Ja – bei sehr langer Nutzungsdauer', 'Ja – wenn der Zins hoch ist'], 'Die Falle: Die Annuität ist nur der Kapitalwert, umgerechnet in Jahresbeträge (× Wiedergewinnungsfaktor, der immer positiv ist). Gleiches Vorzeichen – immer.']
  ],
  abschreibung: [
    ['Maschine 50.000 €, Nutzungsdauer 5 Jahre, linear. Wie hoch ist die jährliche Abschreibung?', ['10.000 €', '5.000 €', '50.000 €'], '50.000 € ÷ 5 Jahre = 10.000 € pro Jahr.'],
    ['Was bildet die Abschreibung ab?', ['Den Wertverlust über die Nutzungsdauer', 'Die Rückzahlung eines Kredits', 'Eine Gewinnausschüttung'], 'Abschreibungen verteilen die Anschaffungskosten als Aufwand auf die Jahre, in denen das Gut genutzt wird.'],
    ['Eine Maschine für 12.000 € wird am 1. Oktober gekauft, Nutzungsdauer 4 Jahre, linear. Abschreibung im Kaufjahr?', ['750 €', '3.000 €', '1.000 €'], 'Die Falle: Im Kaufjahr wird monatsgenau abgeschrieben. 3.000 € pro Jahr × 3/12 (Oktober bis Dezember) = 750 €.']
  ],
  bab: [
    ['Was verteilt der Betriebsabrechnungsbogen?', ['Gemeinkosten auf die Kostenstellen', 'Einzelkosten auf die Kunden', 'Gewinne auf die Gesellschafter'], 'Der BAB verteilt die Gemeinkosten auf die Kostenstellen und liefert so die Zuschlagssätze.'],
    ['Strom für die ganze Fabrik, ohne eigenen Zähler je Abteilung – was für Kosten sind das?', ['Gemeinkosten', 'Einzelkosten', 'Sondereinzelkosten'], 'Sie lassen sich keinem Produkt direkt zurechnen – Gemeinkosten, die per Schlüssel verteilt werden.'],
    ['Materialgemeinkosten 20.000 €, Fertigungsmaterial 100.000 €. Wie hoch ist der MGK-Zuschlagssatz?', ['20 %', '16,7 %', '120 %'], 'Die Falle: Basis ist nur das Fertigungsmaterial, nicht Material plus Gemeinkosten. 20.000 € ÷ 100.000 € = 20 %.']
  ],
  rueckstellungen: [
    ['Wo stehen Rückstellungen in der Bilanz?', ['Auf der Passivseite', 'Auf der Aktivseite', 'Gar nicht – nur in der GuV'], 'Rückstellungen sind Verpflichtungen, also Fremdkapital – Passivseite.'],
    ['Wofür bildet man Rückstellungen?', ['Für Verpflichtungen, deren Höhe oder Fälligkeit unsicher ist', 'Für sicher bekannte Rechnungen', 'Für geplante Gewinne'], 'Steht die Schuld nach Höhe und Zeitpunkt fest, ist es eine Verbindlichkeit. Ist etwas davon unsicher, eine Rückstellung.'],
    ['Ein Prozess droht, Schaden voraussichtlich 30.000 €, gezahlt wird erst nächstes Jahr. Wann entsteht der Aufwand in der GuV?', ['Jetzt – bei Bildung der Rückstellung', 'Erst bei der Zahlung', 'Gar nicht'], 'Die Falle: Nicht die Zahlung zählt. Der Aufwand gehört in das Jahr, in dem er verursacht wurde – deshalb bucht man jetzt die Rückstellung als Aufwand.']
  ],
  eigenkapitalrentabilitaet: [
    ['Wie berechnet man die Eigenkapitalrentabilität?', ['Gewinn ÷ Eigenkapital', 'Eigenkapital ÷ Gewinn', 'Gewinn ÷ Umsatz'], 'EK-Rentabilität = Gewinn ÷ Eigenkapital × 100. Gewinn ÷ Umsatz wäre die Umsatzrentabilität.'],
    ['Gewinn 20.000 €, Eigenkapital 200.000 €. EK-Rentabilität?', ['10 %', '20 %', '1 %'], '20.000 € ÷ 200.000 € = 0,1 = 10 %.'],
    ['Das Unternehmen schüttet Geld aus und hat danach weniger Eigenkapital. Der Gewinn bleibt gleich. Was passiert mit der EK-Rentabilität?', ['Sie steigt', 'Sie sinkt', 'Sie bleibt gleich'], 'Die Falle: Weniger Eigenkapital klingt schlecht – aber gleicher Gewinn geteilt durch weniger EK ergibt eine höhere Rentabilität.']
  ],
  grenzkosten: [
    ['Was sind Grenzkosten?', ['Die Kosten der nächsten zusätzlichen Einheit', 'Die Kosten aller Einheiten zusammen', 'Die Durchschnittskosten pro Stück'], 'Grenzkosten zeigen, um wie viel die Gesamtkosten steigen, wenn du eine Einheit mehr produzierst.'],
    ['Kosten bei 100 Stück: 5.000 €, bei 101 Stück: 5.030 €. Grenzkosten der 101. Einheit?', ['30 €', '50 €', '49,80 €'], '5.030 € − 5.000 € = 30 €. Die 50 € wären die Durchschnittskosten.'],
    ['Kostenfunktion K = 2.000 € + 10 € × Menge. Wie hoch sind die Grenzkosten bei 500 Stück?', ['10 €', '14 €', '4 €'], 'Die Falle: 14 € sind die Stückkosten (2.000 € ÷ 500 + 10 €). Die Fixkosten ändern sich bei einem Stück mehr aber nicht – die Grenzkosten sind immer 10 €.']
  ],
  porter: [
    ['Was gehört zu Porters Five Forces?', ['Verhandlungsmacht der Lieferanten', 'Höhe der Unternehmenssteuern', 'Die Unternehmenskultur'], 'Die fünf Kräfte: Rivalität, neue Anbieter, Ersatzprodukte, Macht der Lieferanten und Macht der Kunden.'],
    ['Viele kleine Kunden, wenige große Anbieter. Wie groß ist die Verhandlungsmacht der Kunden?', ['Eher gering', 'Eher hoch', 'Spielt keine Rolle'], 'Ein einzelner kleiner Kunde kann kaum Druck machen – die Macht liegt bei den wenigen Anbietern.'],
    ['Für Kinobetreiber ist Netflix in Porters Modell …', ['eine Bedrohung durch Ersatzprodukte', 'Rivalität unter bestehenden Wettbewerbern', 'eine Bedrohung durch neue Anbieter'], 'Die Falle: Netflix betreibt keine Kinos – es ist kein direkter Konkurrent, sondern ein anderes Produkt, das dasselbe Bedürfnis erfüllt. Also ein Substitut.']
  ],
  'abc-analyse': [
    ['Was kennzeichnet typischerweise A-Güter in der ABC-Analyse?', ['Geringer Mengenanteil, hoher Wertanteil', 'Hoher Mengenanteil, geringer Wertanteil', 'Hoher Mengen- und hoher Wertanteil'], 'A-Güter sind wenige Artikel, die aber den Großteil des Verbrauchswerts ausmachen – deshalb verdienen sie die meiste Aufmerksamkeit.'],
    ['Gesamter Verbrauchswert 200.000 €, ein Artikel kommt auf 50.000 €. Wie hoch ist sein Wertanteil?', ['25 %', '50 %', '4 %'], 'Wertanteil = Artikelwert ÷ Gesamtwert = 50.000 € ÷ 200.000 € = 25 %.'],
    ['Ein Schraubentyp macht 40 % aller verbrauchten Stück aus, aber nur 2 % des Verbrauchswerts. Welche Klasse?', ['C-Gut', 'A-Gut', 'B-Gut'], 'Die Falle: Die ABC-Analyse sortiert nach Wert, nicht nach Menge. Große Menge bei winzigem Wertanteil ist ein klassisches C-Gut.']
  ],
  'angebot-und-nachfrage': [
    ['Der Marktpreis liegt über dem Gleichgewichtspreis. Was entsteht?', ['Ein Angebotsüberschuss', 'Ein Nachfrageüberschuss', 'Ein Marktgleichgewicht'], 'Bei zu hohem Preis wollen Anbieter mehr verkaufen, als Nachfrager kaufen wollen – es bleibt Ware übrig.'],
    ['Nachfrage: Q = 100 − 2p, Angebot: Q = 20 + 2p. Wie hoch ist der Gleichgewichtspreis?', ['20 €', '40 €', '30 €'], 'Gleichsetzen: 100 − 2p = 20 + 2p, also 80 = 4p und p = 20 €. Die Menge ist dann 60.'],
    ['Der Preis eines Gutes steigt. Was passiert mit seiner Nachfragekurve?', ['Nichts – man bewegt sich entlang der Kurve', 'Sie verschiebt sich nach links', 'Sie verschiebt sich nach rechts'], 'Die Falle: Eine Preisänderung des Gutes selbst führt nur zu einer Bewegung auf der Kurve. Verschiebungen lösen andere Faktoren aus, z. B. Einkommen oder Preise anderer Güter.']
  ],
  'ansoff-matrix': [
    ['Ein Unternehmen verkauft sein bestehendes Produkt erstmals im Ausland. Welche Strategie ist das?', ['Marktentwicklung', 'Marktdurchdringung', 'Diversifikation'], 'Altes Produkt, neuer Markt – das ist Marktentwicklung.'],
    ['Ein Kaffeeröster bietet seinen bisherigen Kunden zusätzlich eigene Kaffeemaschinen an. Welche Strategie?', ['Produktentwicklung', 'Marktentwicklung', 'Diversifikation'], 'Neues Produkt für den bestehenden Markt (die bisherigen Kunden) – das ist Produktentwicklung.'],
    ['Ein Safthersteller bewirbt seinen bisherigen Orangensaft gezielt bei Senioren – im selben Land. Welche Strategie?', ['Marktentwicklung', 'Marktdurchdringung', 'Produktentwicklung'], 'Die Falle: Ein neuer Markt muss nicht im Ausland liegen. Eine neue Zielgruppe ist ebenfalls ein neuer Markt – also Marktentwicklung.']
  ],
  'balanced-scorecard': [
    ['Welche gehört zu den vier klassischen Perspektiven der Balanced Scorecard?', ['Kundenperspektive', 'Wettbewerbsperspektive', 'Lieferantenperspektive'], 'Die vier Perspektiven sind Finanzen, Kunden, interne Prozesse sowie Lernen und Entwicklung.'],
    ['Zielwert Kundenzufriedenheit 90 %, erreicht wurden 72 %. Wie hoch ist der Zielerreichungsgrad?', ['80 %', '72 %', '18 %'], 'Zielerreichungsgrad = Ist ÷ Ziel = 72 % ÷ 90 % = 0,8, also 80 %.'],
    ['Warum heißt die Balanced Scorecard „balanced“?', ['Sie balanciert finanzielle und nicht-finanzielle Ziele', 'Sie muss wie eine Bilanz ausgeglichen sein', 'Jede Perspektive hat gleich viele Kennzahlen'], 'Die Falle: Mit einer Bilanz hat das nichts zu tun. „Balanced“ meint die Ausgewogenheit zwischen finanziellen und nicht-finanziellen sowie kurz- und langfristigen Zielen.']
  ],
  'barwert-abzinsen': [
    ['Was bedeutet Abzinsen?', ['Eine künftige Zahlung auf ihren heutigen Wert umrechnen', 'Einen heutigen Betrag in die Zukunft aufzinsen', 'Zinsen von einem Kredit abziehen'], 'Beim Abzinsen rechnet man eine Zahlung aus der Zukunft auf heute zurück – das Ergebnis ist der Barwert.'],
    ['In 2 Jahren erhältst du 1.210 €. Zinssatz 10 %. Wie hoch ist der Barwert?', ['1.000 €', '1.010 €', '968 €'], 'Barwert = 1.210 € ÷ 1,1² = 1.210 € ÷ 1,21 = 1.000 €.'],
    ['Der Zinssatz steigt. Was passiert mit dem Barwert einer festen Zahlung in 5 Jahren?', ['Er sinkt', 'Er steigt', 'Er bleibt gleich'], 'Die Falle: Höhere Zinsen klingen nach „mehr wert“. Beim Abzinsen teilt man aber durch einen größeren Faktor – der Barwert wird kleiner.']
  ],
  'bcg-matrix': [
    ['Hohes Marktwachstum und hoher relativer Marktanteil – welches Feld der BCG-Matrix?', ['Star', 'Cash Cow', 'Question Mark'], 'Stars sind Marktführer in wachsenden Märkten. Cash Cows haben zwar auch hohe Anteile, aber in langsam wachsenden Märkten.'],
    ['Dein Marktanteil ist 30 %, der des größten Konkurrenten 20 %. Wie hoch ist der relative Marktanteil?', ['1,5', '0,67', '10 %'], 'Relativer Marktanteil = eigener Anteil ÷ Anteil des größten Konkurrenten = 30 % ÷ 20 % = 1,5.'],
    ['Produkt mit 25 % Marktanteil, größter Konkurrent hat 50 %, der Markt wächst stark. Welches Feld?', ['Question Mark', 'Star', 'Cash Cow'], 'Die Falle: 25 % wirkt viel, zählt aber nicht absolut. Relativ sind es 25 % ÷ 50 % = 0,5, also unter 1 – bei hohem Wachstum ein Question Mark.']
  ],
  'bestandskonten-erfolgskonten': [
    ['Welches dieser Konten ist ein Erfolgskonto?', ['Umsatzerlöse', 'Bank', 'Forderungen aus Lieferungen und Leistungen'], 'Erfolgskonten erfassen Aufwände und Erträge. Bank und Forderungen sind Bestandskonten der Aktivseite.'],
    ['Bankkonto: Anfangsbestand 5.000 €, Zugänge 3.000 €, Abgänge 2.000 €. Wie hoch ist der Schlussbestand?', ['6.000 €', '10.000 €', '4.000 €'], 'Schlussbestand = Anfangsbestand + Zugänge − Abgänge = 5.000 € + 3.000 € − 2.000 € = 6.000 €.'],
    ['Worüber wird das Konto „Mietaufwand“ am Jahresende abgeschlossen?', ['Über das GuV-Konto', 'Über das Schlussbilanzkonto', 'Direkt über das Bankkonto'], 'Die Falle: Nur Bestandskonten gehen ins Schlussbilanzkonto. Erfolgskonten werden über das GuV-Konto abgeschlossen, dessen Saldo dann ins Eigenkapital fließt.']
  ],
  'bruttoinlandsprodukt': [
    ['Was misst das Bruttoinlandsprodukt?', ['Den Wert aller im Inland produzierten Endprodukte', 'Das Vermögen aller Inländer', 'Die Summe aller Umsätze im Inland'], 'Das BIP erfasst den Marktwert aller im Inland in einer Periode hergestellten Endprodukte – Waren und Dienstleistungen.'],
    ['Konsum 600, Investitionen 200, Staat 150, Exporte 250, Importe 200 (Mrd. €). Wie hoch ist das BIP?', ['1.000 Mrd. €', '1.400 Mrd. €', '950 Mrd. €'], 'BIP = C + I + G + (Ex − Im) = 600 + 200 + 150 + (250 − 200) = 1.000 Mrd. €.'],
    ['Das nominale BIP steigt um 5 %, das Preisniveau ebenfalls um 5 %. Wie verändert sich das reale BIP?', ['Es bleibt gleich', 'Es steigt um 5 %', 'Es steigt um 10 %'], 'Die Falle: Das nominale Wachstum ist hier reine Preissteigerung. Real wurde nicht mehr produziert: 1,05 ÷ 1,05 = 1, also 0 % Wachstum.']
  ],
  cashflow: [
    ['Was beschreibt der Cashflow?', ['Den Zahlungsmittelüberschuss einer Periode', 'Den Gewinn laut GuV', 'Den Kontostand am Jahresende'], 'Der Cashflow zeigt, wie viel Geld in einer Periode mehr hereingekommen als hinausgegangen ist – unabhängig vom buchhalterischen Gewinn.'],
    ['Jahresüberschuss 50.000 €, Abschreibungen 20.000 €, Zuführung zu Rückstellungen 10.000 €. Cashflow (indirekt)?', ['80.000 €', '20.000 €', '50.000 €'], 'Nicht zahlungswirksame Aufwendungen werden zurückaddiert: 50.000 € + 20.000 € + 10.000 € = 80.000 €.'],
    ['Indirekte Methode: Die Forderungen aus Lieferungen und Leistungen steigen um 10.000 €. Wirkung auf den Cashflow?', ['Minus 10.000 €', 'Plus 10.000 €', 'Keine Wirkung'], 'Die Falle: Mehr Forderungen klingt nach mehr Vermögen. Aber der Umsatz steckt schon im Gewinn, das Geld ist noch nicht da – also ziehen wir 10.000 € ab.']
  ],
  divisionskalkulation: [
    ['Für welche Fertigung eignet sich die einstufige Divisionskalkulation?', ['Massenfertigung eines einheitlichen Produkts', 'Einzelfertigung nach Kundenwunsch', 'Fertigung vieler verschiedener Produkte'], 'Sie teilt einfach die Gesamtkosten durch die Menge – das geht nur, wenn alle Stücke gleich sind und keine Lagerbestandsveränderungen auftreten.'],
    ['Gesamtkosten 50.000 €, produziert und verkauft werden 10.000 Stück. Selbstkosten pro Stück?', ['5,00 €', '0,20 €', '50,00 €'], 'Selbstkosten pro Stück = Gesamtkosten ÷ Menge = 50.000 € ÷ 10.000 = 5,00 €.'],
    ['Äquivalenzziffern: Sorte A = 1, Sorte B = 1,5. Je 10.000 Stück, Gesamtkosten 25.000 €. Was kostet ein Stück B?', ['1,50 €', '1,25 €', '1,875 €'], 'Die Falle: Einfach 25.000 € ÷ 20.000 Stück ignoriert die Ziffern. Richtig: 10.000 + 15.000 = 25.000 Recheneinheiten, also 1 € je Einheit – B kostet 1,5 × 1 € = 1,50 €.']
  ],
  'doppelte-buchfuehrung': [
    ['Was ist das Grundprinzip der doppelten Buchführung?', ['Jeder Vorfall wird im Soll und im Haben gebucht', 'Jeder Beleg wird zweimal abgelegt', 'Jede Buchung wird von zwei Personen geprüft'], 'Jeder Geschäftsvorfall berührt mindestens zwei Konten – einmal im Soll, einmal im Haben, mit gleichem Betrag.'],
    ['Bilanzsumme 100.000 €. Es werden Waren für 5.000 € auf Ziel gekauft. Wie hoch ist die Bilanzsumme danach?', ['105.000 €', '100.000 €', '95.000 €'], 'Waren (Aktiva) und Verbindlichkeiten (Passiva) steigen um je 5.000 € – eine Aktiv-Passiv-Mehrung auf 105.000 €.'],
    ['Ein Kredit über 10.000 € wird per Banküberweisung getilgt. Was passiert mit dem Eigenkapital?', ['Es bleibt gleich', 'Es sinkt um 10.000 €', 'Es steigt um 10.000 €'], 'Die Falle: Geld fließt ab, aber die Schulden sinken genauso. Bank und Verbindlichkeiten nehmen je um 10.000 € ab – erfolgsneutral, das Eigenkapital bleibt unverändert.']
  ],
  eigenkapitalquote: [
    ['Wie berechnet man die Eigenkapitalquote?', ['Eigenkapital ÷ Gesamtkapital', 'Eigenkapital ÷ Fremdkapital', 'Fremdkapital ÷ Gesamtkapital'], 'Die Eigenkapitalquote zeigt, welcher Anteil des gesamten Kapitals aus eigenen Mitteln stammt.'],
    ['Eigenkapital 300.000 €, Fremdkapital 700.000 €. Wie hoch ist die Eigenkapitalquote?', ['30 %', '42,9 %', '70 %'], 'Gesamtkapital = 300.000 € + 700.000 € = 1.000.000 €. Eigenkapitalquote = 300.000 € ÷ 1.000.000 € = 30 %.'],
    ['Eigenkapital 200.000 €, Fremdkapital 800.000 €. Wie hoch ist der Verschuldungsgrad?', ['400 %', '80 %', '25 %'], 'Die Falle: 80 % ist die Fremdkapitalquote. Der Verschuldungsgrad setzt Fremd- ins Verhältnis zum Eigenkapital: 800.000 € ÷ 200.000 € = 4, also 400 %.']
  ],
  'einzelkosten-gemeinkosten': [
    ['Eine Tischlerei verbraucht Holz für einen bestimmten Kundentisch. Was für Kosten sind das?', ['Einzelkosten', 'Gemeinkosten', 'Kalkulatorische Kosten'], 'Das Holz lässt sich direkt diesem einen Tisch zurechnen – also Einzelkosten.'],
    ['Materialeinzelkosten 200 €, Materialgemeinkostenzuschlag 10 %. Wie hoch sind die Materialkosten?', ['220 €', '210 €', '200 €'], 'Materialkosten = 200 € + 10 % von 200 € = 200 € + 20 € = 220 €.'],
    ['Der Maschinenstrom steigt mit der Menge, wird aber nicht pro Stück gemessen. Einzel- oder Gemeinkosten?', ['Gemeinkosten – obwohl sie variabel sind', 'Einzelkosten – Strom steigt ja mit der Menge', 'Fixkosten'], 'Die Falle: Variabel heißt nicht automatisch Einzelkosten. Weil der Strom keinem Stück direkt zugerechnet wird, sind es (unechte) Gemeinkosten.']
  ],
  'finanzierungsarten': [
    ['Ein Unternehmen nimmt einen Bankkredit auf. Welche Finanzierungsart ist das?', ['Außen- und Fremdfinanzierung', 'Innen- und Eigenfinanzierung', 'Außen- und Eigenfinanzierung'], 'Das Geld kommt von außen (Bank) und ist geliehenes Kapital – also Außen- und Fremdfinanzierung.'],
    ['Gewinn nach Steuern 100.000 €, davon werden 40 % ausgeschüttet. Wie hoch ist die Selbstfinanzierung?', ['60.000 €', '40.000 €', '100.000 €'], 'Selbstfinanzierung ist der einbehaltene Gewinn: 100.000 € − 40 % Ausschüttung (40.000 €) = 60.000 €.'],
    ['Ein Unternehmen bildet Pensionsrückstellungen. Welche Finanzierungsart ist das?', ['Innen- und Fremdfinanzierung', 'Innen- und Eigenfinanzierung', 'Außen- und Fremdfinanzierung'], 'Die Falle: Innenfinanzierung ist nicht automatisch Eigenfinanzierung. Die Mittel entstehen intern, Rückstellungen sind aber Fremdkapital.']
  ],
  'fixe-und-variable-kosten': [
    ['Die jährliche Versicherung für die Lagerhalle – was für Kosten sind das?', ['Fixkosten', 'Variable Kosten', 'Einzelkosten'], 'Die Versicherung kostet gleich viel, egal wie viel produziert wird – also Fixkosten.'],
    ['Kostenfunktion K = 2.000 € + 5 € × Menge. Wie hoch sind die Stückkosten bei 400 Stück?', ['10 €', '5 €', '4.000 €'], 'Gesamtkosten = 2.000 € + 5 € × 400 = 4.000 €. Stückkosten = 4.000 € ÷ 400 = 10 €.'],
    ['Die Produktion steigt von 100 auf 200 Stück. Was passiert mit den variablen Kosten pro Stück (linearer Verlauf)?', ['Sie bleiben gleich', 'Sie verdoppeln sich', 'Sie halbieren sich'], 'Die Falle: Variabel sind die Gesamtkosten – sie verdoppeln sich. Pro Stück bleiben die variablen Kosten bei linearem Verlauf konstant.']
  ],
  'fuehrungsstile': [
    ['Die Chefin entscheidet allein und gibt Anweisungen ohne Mitsprache. Welcher Stil nach Lewin?', ['Autoritär', 'Demokratisch (kooperativ)', 'Laissez-faire'], 'Alleinige Entscheidung, keine Beteiligung des Teams – das ist der autoritäre Führungsstil.'],
    ['Der Chef stellt das Problem vor, das Team macht Vorschläge, er wählt einen aus. Welcher Stil (Tannenbaum/Schmidt)?', ['Kooperativ', 'Autoritär', 'Delegativ'], 'Das Team entwickelt Lösungen, die Entscheidung trifft aber noch der Chef – das ist die kooperative Stufe im Kontinuum.'],
    ['Welcher Führungsstil ist laut situativer Führung (Hersey/Blanchard) der beste?', ['Der, der zum Reifegrad des Mitarbeiters passt', 'Immer der kooperative Stil', 'Immer der autoritäre Stil'], 'Die Falle: Kooperativ klingt immer richtig. Die situative Führung sagt aber: Es gibt keinen besten Stil – er richtet sich nach dem Reifegrad des Mitarbeiters.']
  ],
  'gewinnvergleichsrechnung': [
    ['Nach welchem Kriterium wählt die Gewinnvergleichsrechnung zwischen zwei Anlagen?', ['Höchster durchschnittlicher Gewinn pro Jahr', 'Niedrigste Kosten pro Jahr', 'Kürzeste Amortisationszeit'], 'Gewählt wird die Anlage mit dem höchsten durchschnittlichen Gewinn pro Periode.'],
    ['Anlage A: Erlöse 50.000 €, Kosten 38.000 €. Anlage B: Erlöse 60.000 €, Kosten 50.000 €. Welche ist besser?', ['A, um 2.000 € pro Jahr', 'B, um 10.000 € pro Jahr', 'B, um 2.000 € pro Jahr'], 'Gewinn A = 50.000 € − 38.000 € = 12.000 €, Gewinn B = 60.000 € − 50.000 € = 10.000 €. A liegt 2.000 € vorn.'],
    ['Anlage A ist 5.000 € pro Jahr günstiger als B, B bringt aber 15.000 € mehr Erlös. Was sagt der Gewinnvergleich?', ['B, um 10.000 € pro Jahr', 'A – die günstigere Anlage gewinnt', 'B, um 15.000 € pro Jahr'], 'Die Falle: Das ist kein Kostenvergleich. B bringt 15.000 € mehr Erlös, kostet aber 5.000 € mehr – macht 10.000 € mehr Gewinn.']
  ],
  'inflation': [
    ['Was versteht man unter Inflation?', ['Anhaltender Anstieg des allgemeinen Preisniveaus', 'Preisanstieg bei einem einzelnen Produkt', 'Dauerhaft sinkendes Preisniveau'], 'Inflation heißt: Das allgemeine Preisniveau steigt über längere Zeit – nicht nur ein einzelner Preis.'],
    ['Ein Warenkorb kostete letztes Jahr 200 €, heute 210 €. Wie hoch ist die Inflationsrate?', ['5 %', '10 %', '2,1 %'], 'Inflationsrate = (210 € − 200 €) ÷ 200 € = 10 € ÷ 200 € = 5 %.'],
    ['Die Preise steigen um 25 %. Um wie viel Prozent sinkt die Kaufkraft deines Geldes?', ['20 %', '25 %', '75 %'], 'Die Falle: Es sind nicht 25 %. Für 100 € bekommst du nur noch 100 ÷ 1,25 = 80 € an Waren – die Kaufkraft sinkt um 20 %.']
  ],
  'inventur-inventar': [
    ['Wie nennt man das Zählen, Messen und Wiegen aller Bestände?', ['Inventur', 'Inventar', 'Bilanz'], 'Die Inventur ist die Tätigkeit der Bestandsaufnahme, das Inventar ist das Verzeichnis, das dabei entsteht.'],
    ['Anlagevermögen 300.000 €, Umlaufvermögen 200.000 €, Schulden 320.000 €. Wie hoch ist das Reinvermögen?', ['180.000 €', '820.000 €', '500.000 €'], 'Reinvermögen = Vermögen − Schulden = (300.000 € + 200.000 €) − 320.000 € = 180.000 €.'],
    ['Was steht im Inventar beim Vermögen ganz oben?', ['Grundstücke und Gebäude', 'Kasse und Bankguthaben', 'Forderungen'], 'Die Falle: Das Geld steht nicht oben. Das Vermögen wird nach zunehmender Liquidität geordnet – zuerst das am wenigsten liquide, also Grundstücke und Gebäude.']
  ],
  'kalkulatorische-kosten': [
    ['Warum setzt ein Einzelunternehmer einen kalkulatorischen Unternehmerlohn an?', ['Seine Arbeit taucht sonst nicht in den Kosten auf', 'Das Finanzamt schreibt es vor', 'Um damit Steuern zu sparen'], 'Er zahlt sich kein Gehalt als Aufwand. Damit seine Arbeitsleistung trotzdem in der Kalkulation steckt, wird ein Unternehmerlohn angesetzt.'],
    ['Anschaffung 100.000 €, Wiederbeschaffungswert 120.000 €, Nutzungsdauer 10 Jahre. Kalk. Abschreibung pro Jahr (linear)?', ['12.000 €', '10.000 €', '120.000 €'], 'Kalkulatorisch wird vom Wiederbeschaffungswert abgeschrieben: 120.000 € ÷ 10 Jahre = 12.000 € pro Jahr.'],
    ['Die kalkulatorische Abschreibung – sind das Anderskosten oder Zusatzkosten?', ['Anderskosten', 'Zusatzkosten – sie ist ja kalkulatorisch', 'Grundkosten'], 'Die Falle: Kalkulatorisch heißt nicht automatisch Zusatzkosten. Es gibt ja eine bilanzielle Abschreibung als Aufwand – nur in anderer Höhe. Also Anderskosten.']
  ],
  'konsumentenrente-produzentenrente': [
    ['Was ist die Konsumentenrente?', ['Zahlungsbereitschaft minus tatsächlicher Preis', 'Der Gewinn der Verkäufer', 'Die Summe aller Ausgaben der Käufer'], 'Die Konsumentenrente ist der Vorteil der Käufer: Sie hätten mehr gezahlt, als der Marktpreis verlangt.'],
    ['Lineare Nachfrage: Höchstpreis 100 €, Gleichgewichtspreis 60 €, Menge 40 Stück. Wie hoch ist die Konsumentenrente?', ['800 €', '1.600 €', '2.400 €'], 'Die Konsumentenrente ist ein Dreieck: ½ × 40 Stück × (100 € − 60 €) = ½ × 40 × 40 = 800 €.'],
    ['Der Staat setzt einen Höchstpreis unter dem Gleichgewichtspreis. Was passiert mit der Gesamtwohlfahrt?', ['Sie sinkt – es entsteht ein Wohlfahrtsverlust', 'Sie steigt, weil Käufer weniger zahlen', 'Sie bleibt gleich, es wird nur umverteilt'], 'Die Falle: Es wird nicht nur umverteilt. Weil zum niedrigen Preis weniger angeboten wird, finden Geschäfte nicht mehr statt – die Gesamtwohlfahrt sinkt.']
  ],
  'kostenvergleichsrechnung': [
    ['Was vergleicht die Kostenvergleichsrechnung zwischen zwei Investitionsalternativen?', ['Die durchschnittlichen Kosten pro Periode', 'Die Kapitalwerte der Alternativen', 'Die Gewinne pro Periode'], 'Die Kostenvergleichsrechnung unterstellt gleiche Erlöse und vergleicht deshalb nur die Kosten pro Periode (oder pro Stück).'],
    ['Anlage A: Fixkosten 10.000 €, variabel 5 € pro Stück. Anlage B: Fixkosten 16.000 €, variabel 3 € pro Stück. Kritische Menge?', ['3.000 Stück', '2.000 Stück', '6.000 Stück'], 'Bei der kritischen Menge sind beide gleich teuer: 10.000 + 5x = 16.000 + 3x, also 2x = 6.000 und x = 3.000 Stück.'],
    ['Maschine für 100.000 €, kein Restwert, kalkulatorischer Zins 10 %. Wie hoch sind die kalkulatorischen Zinsen pro Jahr?', ['5.000 €', '10.000 €', '2.000 €'], 'Die Falle: Verzinst wird nicht der volle Anschaffungswert, sondern das durchschnittlich gebundene Kapital. Das ist (100.000 € + 0 €) / 2 = 50.000 €, davon 10 % = 5.000 €.']
  ],
  'liquiditaetsgrade': [
    ['Was steht bei der Liquidität 1. Grades im Zähler?', ['Nur die liquiden Mittel', 'Liquide Mittel plus kurzfristige Forderungen', 'Das gesamte Umlaufvermögen'], 'Liquidität 1. Grades = liquide Mittel / kurzfristige Verbindlichkeiten. Forderungen kommen erst beim 2. Grad dazu.'],
    ['Liquide Mittel 20.000 €, kurzfr. Forderungen 30.000 €, Vorräte 50.000 €, kurzfr. Verbindlichkeiten 50.000 €. Liquidität 2. Grades?', ['100 %', '40 %', '200 %'], 'Liquidität 2. Grades = (liquide Mittel + kurzfristige Forderungen) / kurzfristige Verbindlichkeiten = 50.000 € / 50.000 € = 100 %. Vorräte zählen erst beim 3. Grad.'],
    ['Liquide Mittel 50.000 €, kurzfr. Verbindlichkeiten 100.000 €. 25.000 € davon werden per Bank getilgt. Liquidität 1. Grades?', ['Sie sinkt von 50 % auf rund 33 %', 'Sie steigt, weil die Schulden sinken', 'Sie bleibt gleich bei 50 %'], 'Die Falle: Zähler und Nenner sinken um denselben Betrag. Danach gilt 25.000 € / 75.000 € = rund 33 %. Liegt der Grad unter 100 %, verschlechtert eine Tilgung aus Bankguthaben die Kennzahl.']
  ],
  'make-or-buy': [
    ['Was bedeutet „Buy“ bei der Make-or-Buy-Entscheidung?', ['Fremdbezug von einem Lieferanten', 'Eigenfertigung im eigenen Betrieb', 'Kauf einer neuen Maschine'], '„Make“ heißt selbst herstellen, „Buy“ heißt das Teil von außen zukaufen, also Fremdbezug.'],
    ['Eigenfertigung: Fixkosten 20.000 €, variabel 6 € pro Stück. Fremdbezug: 10 € pro Stück. Ab welcher Menge lohnt sich Make?', ['Ab 5.000 Stück', 'Ab 2.000 Stück', 'Ab 3.333 Stück'], 'Kritische Menge: 20.000 + 6x = 10x, also 4x = 20.000 und x = 5.000 Stück. Darüber ist Eigenfertigung günstiger.'],
    ['Freie Kapazität vorhanden. Eigenfertigung kostet 12 € pro Stück (davon 4 € fixe Kosten), Fremdbezug 10 €. Was ist kurzfristig günstiger?', ['Eigenfertigung', 'Fremdbezug, weil 10 € unter 12 € liegen', 'Beide sind gleich teuer'], 'Die Falle: Kurzfristig fallen die Fixkosten ohnehin an und sind nicht entscheidungsrelevant. Verglichen werden nur die variablen Kosten: 8 € Eigenfertigung gegen 10 € Fremdbezug.']
  ],
  'maschinenstundensatz': [
    ['Wie berechnet man den Maschinenstundensatz?', ['Maschinenabhängige Kosten / Maschinenlaufzeit', 'Fertigungslöhne / Arbeitsstunden', 'Anschaffungskosten / Nutzungsdauer'], 'Man teilt die maschinenabhängigen Gemeinkosten einer Periode durch die Laufstunden der Maschine in dieser Periode.'],
    ['Maschinenabhängige Kosten 120.000 € pro Jahr, Laufzeit 1.500 Stunden. Wie hoch ist der Maschinenstundensatz?', ['80 € pro Stunde', '125 € pro Stunde', '12,50 € pro Stunde'], 'Maschinenstundensatz = 120.000 € / 1.500 h = 80 € pro Stunde.'],
    ['Alle Kosten einer Maschine sind fix. Sie läuft nur noch 1.000 statt 2.000 Stunden. Was passiert mit dem Maschinenstundensatz?', ['Er verdoppelt sich', 'Er halbiert sich, weil sie weniger läuft', 'Er bleibt gleich'], 'Die Falle: Weniger Laufzeit heißt nicht weniger Kosten. Die gleichen Fixkosten verteilen sich auf halb so viele Stunden, also verdoppelt sich der Satz.']
  ],
  'opportunitaetskosten': [
    ['Was sind Opportunitätskosten?', ['Der entgangene Nutzen der besten nicht gewählten Alternative', 'Die tatsächlich gezahlten Kosten', 'Die Summe aller möglichen Alternativen'], 'Opportunitätskosten messen, worauf man verzichtet: den Nutzen der besten Alternative, die man nicht gewählt hat.'],
    ['Ein Land produziert pro Stunde entweder 10 Brote oder 5 Hemden. Wie hoch sind die Opportunitätskosten eines Hemdes?', ['2 Brote', '0,5 Brote', '5 Brote'], 'Für 5 Hemden verzichtet man auf 10 Brote, also kostet ein Hemd 10 / 5 = 2 Brote.'],
    ['A schafft pro Stunde 12 Brote oder 6 Hemden, B nur 2 Brote oder 3 Hemden. Worauf sollte sich B spezialisieren?', ['Auf Hemden', 'Auf gar nichts – A ist überall besser', 'Auf Brote'], 'Die Falle: Entscheidend ist der komparative, nicht der absolute Vorteil. Ein Hemd kostet B nur 2/3 Brot, A dagegen 2 Brote. B hat also bei Hemden den komparativen Vorteil.']
  ],
  'optimale-bestellmenge': [
    ['Was minimiert die optimale Bestellmenge nach Andler?', ['Die Summe aus Bestell- und Lagerhaltungskosten', 'Nur die Lagerhaltungskosten', 'Den Einkaufspreis pro Stück'], 'Große Bestellungen senken die Bestellkosten, erhöhen aber die Lagerkosten. Andler sucht die Menge, bei der die Summe am kleinsten ist.'],
    ['Jahresbedarf 5.000 Stück, Kosten je Bestellung 50 €, Lagerkosten 2 € pro Stück und Jahr. Optimale Bestellmenge?', ['500 Stück', '250 Stück', '1.000 Stück'], 'Andler: Wurzel aus (2 × 5.000 × 50 € / 2 €) = Wurzel aus 250.000 = 500 Stück.'],
    ['Die Kosten je Bestellung verdoppeln sich, sonst bleibt alles gleich. Was passiert mit der optimalen Bestellmenge?', ['Sie steigt um rund 41 %', 'Sie verdoppelt sich', 'Sie halbiert sich'], 'Die Falle: Die Bestellkosten stehen unter der Wurzel. Verdoppeln sie sich, steigt die Menge nur um den Faktor Wurzel aus 2, also rund 1,41.']
  ],
  'optimales-produktionsprogramm': [
    ['Ohne Engpass: Welche Produkte gehören kurzfristig ins Produktionsprogramm?', ['Alle mit positivem Deckungsbeitrag pro Stück', 'Nur das mit dem höchsten Deckungsbeitrag', 'Nur die mit Gewinn nach Vollkosten'], 'Ohne Engpass trägt jedes Produkt mit positivem Deckungsbeitrag zur Deckung der Fixkosten bei, also werden alle produziert.'],
    ['Preis 50 €, variable Kosten 30 €, Bearbeitungszeit an der Engpassmaschine 4 Minuten. Relativer Deckungsbeitrag?', ['5 € pro Minute', '20 € pro Minute', '12,50 € pro Minute'], 'Deckungsbeitrag = 50 € − 30 € = 20 €. Relativer DB = 20 € / 4 Minuten = 5 € pro Minute.'],
    ['Engpass Maschinenzeit. A: DB 30 € je Stück, 6 Minuten. B: DB 20 € je Stück, 2 Minuten. Was wird zuerst produziert?', ['Produkt B', 'Produkt A, wegen des höheren DB', 'Beide gleichrangig'], 'Die Falle: Bei Engpass zählt der relative DB pro Engpasseinheit. A bringt 30 € / 6 = 5 € pro Minute, B 20 € / 2 = 10 € pro Minute, also hat B Vorrang.']
  ],
  'organisationsformen': [
    ['Was kennzeichnet die Einlinienorganisation?', ['Jeder hat genau einen Vorgesetzten', 'Jeder hat mehrere Vorgesetzte', 'Es gibt keine festen Vorgesetzten'], 'Bei der Einlinienorganisation erhält jede Stelle nur von genau einer übergeordneten Stelle Anweisungen (Einheit der Auftragserteilung).'],
    ['Mitarbeiter berichten an einen Funktions- und an einen Produktmanager. Welche Organisationsform ist das?', ['Matrixorganisation', 'Stablinienorganisation', 'Einlinienorganisation'], 'Die Matrixorganisation überlagert zwei Dimensionen, etwa Funktionen und Produkte. Dadurch hat ein Mitarbeiter zwei Vorgesetzte.'],
    ['Die Stabsstelle Controlling ist direkt der Geschäftsführung zugeordnet. Darf sie den Abteilungen Anweisungen erteilen?', ['Nein, Stäbe beraten nur', 'Ja, weil sie direkt an der Geschäftsführung hängt', 'Ja, gegenüber allen Mitarbeitern'], 'Die Falle: Die Nähe zur Spitze bringt keine Weisungsbefugnis. Stabsstellen bereiten Entscheidungen vor und beraten, entscheiden und anweisen tun die Linieninstanzen.']
  ],
  'pestel-analyse': [
    ['Wofür steht das „L“ in PESTEL?', ['Legal – rechtliche Faktoren', 'Logistical – logistische Faktoren', 'Leadership – Führungsfaktoren'], 'PESTEL steht für Political, Economic, Social, Technological, Environmental und Legal. L sind also rechtliche Rahmenbedingungen.'],
    ['Die Inflationsrate im Land steigt auf 6 %. In welche PESTEL-Kategorie gehört das?', ['Economic', 'Social', 'Legal'], 'Inflation, Zinsen, Konjunktur und Wechselkurse sind gesamtwirtschaftliche Faktoren, also Economic.'],
    ['Die eigene IT eines Unternehmens ist veraltet. Wo gehört das in der PESTEL-Analyse hin?', ['Gar nicht – das ist ein interner Faktor', 'Unter T wie Technological', 'Unter E wie Economic'], 'Die Falle: PESTEL betrachtet nur die externe Makroumwelt. Die eigene veraltete IT ist eine interne Schwäche und gehört in die SWOT-Analyse.']
  ],
  'produktlebenszyklus': [
    ['In welcher Phase des Produktlebenszyklus wächst der Umsatz typischerweise am stärksten?', ['Wachstumsphase', 'Reifephase', 'Einführungsphase'], 'In der Wachstumsphase setzt sich das Produkt am Markt durch – der Umsatz steigt hier am schnellsten.'],
    ['Ein Produkt macht im Jahr 1 200.000 € Umsatz, im Jahr 2 300.000 €. Wie hoch ist das Umsatzwachstum?', ['50 %', '33 %', '100 %'], 'Wachstum = Zuwachs ÷ Vorjahr = 100.000 € ÷ 200.000 € = 50 %. Die 33 % entstehen, wenn man fälschlich durch 300.000 € teilt.'],
    ['Erreicht im klassischen Modell der Gewinn sein Maximum zur gleichen Zeit wie der Umsatz?', ['Nein, meist schon vorher', 'Ja, maximaler Umsatz heißt maximaler Gewinn', 'Nein, erst in der Degenerationsphase'], 'Die Falle: Umsatz und Gewinn laufen nicht gleich. Der Gewinn hat sein Maximum typischerweise schon am Ende der Wachstumsphase, der Umsatz erst in der Reife-/Sättigungsphase – steigender Wettbewerb drückt vorher die Margen.']
  ],
  'rechnungsabgrenzungsposten': [
    ['Im Dezember wird die Miete für Januar des Folgejahres im Voraus bezahlt. Welcher Posten entsteht?', ['Aktiver Rechnungsabgrenzungsposten', 'Passiver Rechnungsabgrenzungsposten', 'Rückstellung'], 'Ausgabe jetzt, Aufwand erst nächstes Jahr – das wird über einen aktiven RAP (ARAP) abgegrenzt.'],
    ['Am 1.10. zahlt ein Unternehmen 1.200 € Versicherung für 12 Monate im Voraus. Wie hoch ist der ARAP am 31.12.?', ['900 €', '300 €', '1.200 €'], '1.200 € ÷ 12 = 100 € pro Monat. Oktober bis Dezember (3 Monate) sind Aufwand dieses Jahres, die restlichen 9 Monate = 900 € gehören ins nächste Jahr.'],
    ['Die Miete für Dezember wird erst im Januar bezahlt. Muss man zum 31.12. einen Rechnungsabgrenzungsposten bilden?', ['Nein, eine sonstige Verbindlichkeit', 'Ja, einen passiven RAP', 'Ja, einen aktiven RAP'], 'Die Falle: RAP gibt es nach § 250 HGB nur, wenn die Zahlung vor dem Stichtag liegt (transitorisch). Wird erst nachher gezahlt (antizipativ), bucht man eine sonstige Verbindlichkeit.']
  ],
  'rechtsformen': [
    ['Womit haftet eine GmbH gegenüber ihren Gläubigern?', ['Nur mit dem Gesellschaftsvermögen', 'Mit dem Privatvermögen der Gesellschafter', 'Mit dem Privatvermögen des Geschäftsführers'], 'Bei der GmbH haftet nach § 13 GmbHG nur das Gesellschaftsvermögen – genau das macht sie so beliebt.'],
    ['Eine GmbH wird mit dem Mindeststammkapital gegründet. Wie viel muss bei der Anmeldung mindestens eingezahlt sein?', ['12.500 €', '25.000 €', '6.250 €'], 'Das Mindeststammkapital beträgt 25.000 €, davon muss bei Anmeldung mindestens die Hälfte eingezahlt sein: 25.000 € ÷ 2 = 12.500 €.'],
    ['Kann eine GmbH von nur einer einzigen Person gegründet werden?', ['Ja, die Ein-Personen-GmbH ist erlaubt', 'Nein, eine Gesellschaft braucht mindestens zwei', 'Nur als UG (haftungsbeschränkt)'], 'Die Falle: „Gesellschaft“ klingt nach mehreren Personen. Nach § 1 GmbHG kann eine GmbH aber auch durch eine einzige Person gegründet werden.']
  ],
  'rentabilitaet': [
    ['Wie berechnet man die Umsatzrendite?', ['Gewinn ÷ Umsatz', 'Umsatz ÷ Gewinn', 'Gewinn ÷ Eigenkapital'], 'Die Umsatzrendite zeigt, wie viel Gewinn von jedem Euro Umsatz übrig bleibt: Gewinn ÷ Umsatz.'],
    ['Gewinn 50.000 €, Umsatz 1.000.000 €, Gesamtkapital 500.000 €. Wie hoch ist der ROI nach DuPont?', ['10 %', '5 %', '2,5 %'], 'Umsatzrendite 50.000 € ÷ 1.000.000 € = 5 %, Kapitalumschlag 1.000.000 € ÷ 500.000 € = 2. ROI = 5 % × 2 = 10 %.'],
    ['GKR 8 %, Fremdkapitalzins 5 %. Das Unternehmen ersetzt Eigenkapital durch Fremdkapital. Was passiert mit der EKR?', ['Sie steigt (Leverage-Effekt)', 'Sie sinkt wegen der höheren Zinsen', 'Sie bleibt gleich'], 'Die Falle: Mehr Zinsen klingt nach weniger Rendite. Solange das Kapital 8 % erwirtschaftet, aber nur 5 % kostet, bleibt die Differenz beim Eigenkapital – die EKR steigt.']
  ],
  'skonto-buchen': [
    ['Was ist Skonto?', ['Preisnachlass für Zahlung innerhalb einer Frist', 'Rabatt für große Abnahmemengen', 'Zuschlag bei verspäteter Zahlung'], 'Skonto belohnt schnelles Zahlen, z. B. „2 % Skonto bei Zahlung innerhalb von 10 Tagen“.'],
    ['Eine Rechnung über 1.190 € brutto wird mit 2 % Skonto bezahlt. Wie hoch ist der Überweisungsbetrag?', ['1.166,20 €', '1.170,00 €', '1.188,00 €'], '2 % von 1.190 € = 23,80 € Skonto. Überweisung = 1.190 € − 23,80 € = 1.166,20 €.'],
    ['Du ziehst 23,80 € Skonto von einer Rechnung über 1.190 € brutto (19 % USt) ab. Um wie viel sinkt die Vorsteuer?', ['3,80 €', 'Gar nicht – es gilt die Rechnung', '23,80 €'], 'Die Falle: Skonto mindert auch die Steuer. Die 23,80 € sind brutto: 23,80 € ÷ 1,19 = 20 € netto, darin stecken 3,80 € Vorsteuer, die korrigiert werden müssen.']
  ],
  'smart-ziele': [
    ['Wofür steht das „M“ in SMART?', ['Messbar', 'Maximal', 'Modern'], 'Ein SMART-Ziel muss messbar sein – man muss am Ende eindeutig prüfen können, ob es erreicht wurde.'],
    ['Ziel: Den Jahresumsatz von 200.000 € innerhalb von 12 Monaten um 15 % steigern. Welcher Zielumsatz ist das?', ['230.000 €', '215.000 €', '300.000 €'], '15 % von 200.000 € = 30.000 €. Zielumsatz = 200.000 € + 30.000 € = 230.000 €.'],
    ['Welches dieser Ziele ist SMART formuliert?', ['Bis 30.06. die Retourenquote von 8 % auf 6 % senken', 'Ab sofort 20 % mehr Neukunden gewinnen', 'Die Kundenzufriedenheit deutlich verbessern'], 'Die Falle: „Ab sofort“ klingt terminiert, nennt aber nur einen Start und kein Enddatum – bis wann und in welchem Zeitraum die 20 % gelten, bleibt offen.']
  ],
  'tilgungsplan': [
    ['Was bleibt beim Annuitätendarlehen über die Laufzeit gleich?', ['Die jährliche Rate (Annuität)', 'Der Tilgungsanteil', 'Der Zinsanteil'], 'Die Annuität aus Zins und Tilgung ist konstant. Der Zinsanteil sinkt, der Tilgungsanteil steigt entsprechend.'],
    ['Ratendarlehen über 100.000 €, 10 Jahre Laufzeit, 5 % Zinsen. Wie hoch ist die Rate im ersten Jahr?', ['15.000 €', '10.000 €', '10.500 €'], 'Tilgung = 100.000 € ÷ 10 = 10.000 € pro Jahr, Zinsen im ersten Jahr = 5 % von 100.000 € = 5.000 €. Rate = 15.000 €.'],
    ['Raten- und Annuitätendarlehen mit gleichem Betrag, Zins und Laufzeit: Bei welchem zahlst du insgesamt weniger Zinsen?', ['Beim Ratendarlehen', 'Bei beiden gleich viel', 'Beim Annuitätendarlehen'], 'Die Falle: Gleicher Zins und gleiche Laufzeit heißt nicht gleiche Zinskosten. Das Ratendarlehen tilgt am Anfang mehr, die Restschuld sinkt schneller – also fallen weniger Zinsen an.']
  ],
  'umsatzsteuer-vorsteuer-buchen': [
    ['Die beim Einkauf gezahlte Umsatzsteuer bucht ein Unternehmen als …?', ['Vorsteuer', 'Umsatzsteuer', 'Aufwand'], 'Die beim Einkauf gezahlte Steuer holt sich das Unternehmen vom Finanzamt zurück – sie wird als Vorsteuer gebucht.'],
    ['Verkäufe 10.000 € netto (19 %), Einkäufe 6.000 € netto (7 %). Wie hoch ist die Zahllast?', ['1.480 €', '760 €', '1.900 €'], 'Umsatzsteuer = 19 % von 10.000 € = 1.900 €, Vorsteuer = 7 % von 6.000 € = 420 €. Zahllast = 1.900 € − 420 € = 1.480 €.'],
    ['Ein Unternehmen verkauft Ware für 1.000 € netto plus 190 € USt. Wie hoch ist der Umsatzerlös in der GuV?', ['1.000 €', '1.190 €', '810 €'], 'Die Falle: Der Kunde zahlt zwar 1.190 €, aber die 190 € Umsatzsteuer gehören dem Finanzamt. Sie sind eine Verbindlichkeit, kein Erlös – der Umsatzerlös beträgt 1.000 €.']
  ],
  'zinseszins': [
    ['Was bedeutet Zinseszins?', ['Auch bereits gutgeschriebene Zinsen werden verzinst', 'Zinsen gibt es nur auf das Anfangskapital', 'Der Zinssatz verdoppelt sich jedes Jahr'], 'Beim Zinseszins bleiben die Zinsen angelegt und werden in den Folgejahren mitverzinst.'],
    ['Du legst 1.000 € zu 10 % pro Jahr mit Zinseszins an. Wie viel hast du nach 2 Jahren?', ['1.210 €', '1.200 €', '1.100 €'], 'Jahr 1: 1.000 € × 1,1 = 1.100 €. Jahr 2: 1.100 € × 1,1 = 1.210 €. Die extra 10 € sind die Zinsen auf die Zinsen.'],
    ['Eine Bank zahlt 12 % pro Jahr, verzinst aber monatlich mit 1 %. Wie hoch ist der effektive Jahreszins?', ['Mehr als 12 %', 'Genau 12 %', 'Weniger als 12 %'], 'Die Falle: 12 × 1 % sind nicht einfach 12 %, weil die Monatszinsen mitverzinst werden. 1,01 hoch 12 ≈ 1,1268, also rund 12,68 % effektiv.']
  ],
  'bwl': [
    ['Was zeigt die Bilanz eines Unternehmens?', ['Vermögen und Kapital zu einem Stichtag', 'Erträge und Aufwendungen eines Jahres', 'Alle Zahlungen eines Monats'], 'Die Bilanz ist eine Momentaufnahme: links das Vermögen (Aktiva), rechts dessen Finanzierung (Passiva) zum Stichtag.'],
    ['Erträge 500.000 €, Aufwendungen 420.000 €. Wie hoch ist der Jahresüberschuss laut GuV?', ['80.000 €', '920.000 €', '420.000 €'], 'Jahresüberschuss = Erträge − Aufwendungen = 500.000 € − 420.000 € = 80.000 €.'],
    ['Ein Unternehmen weist 80.000 € Gewinn aus. Hat es damit automatisch 80.000 € mehr auf dem Konto?', ['Nein – Gewinn ist nicht gleich Zahlungsmittel', 'Ja, der Gewinn ist das zusätzliche Geld', 'Ja, aber erst nach Steuern'], 'Die Falle: Gewinn ist keine Kontostand-Größe. Offene Kundenrechnungen, Abschreibungen oder Investitionen sorgen dafür, dass Gewinn und Geldzufluss auseinanderlaufen.']
  ],
  bilanzanalyse: [
    ['Wie berechnet man die Eigenkapitalquote?', ['Eigenkapital ÷ Gesamtkapital', 'Eigenkapital ÷ Fremdkapital', 'Gewinn ÷ Eigenkapital'], 'EK-Quote = Eigenkapital ÷ Gesamtkapital (Bilanzsumme). Gewinn ÷ EK wäre die Eigenkapitalrentabilität.'],
    ['Eigenkapital 400.000 €, Bilanzsumme 1.000.000 €. Wie hoch ist die EK-Quote?', ['40 %', '60 %', '25 %'], '400.000 € ÷ 1.000.000 € = 0,4 = 40 %.'],
    ['Ein Unternehmen nimmt einen Kredit auf und lässt das Geld auf dem Bankkonto liegen. Was passiert mit der Eigenkapitalquote?', ['Sie sinkt', 'Sie bleibt gleich', 'Sie steigt'], 'Die Falle: Das Eigenkapital ändert sich nicht – aber die Bilanzsumme wächst durch den Kredit. Gleiches EK geteilt durch mehr Gesamtkapital = niedrigere Quote.']
  ]
};
const PRAISE = ['Stark – genau so.', 'Sitzt.', 'Respekt – die erwischt fast jeden.'];
const ALIAS = { 'aktiva-passiva': 'bilanz', eroeffnungsbilanz: 'bilanz', 'swot-beispiel': 'swot', 'swot-matrix': 'swot', 'swot-vorlage': 'swot' };
export const hasMiniCheck = slug => !!SETS[ALIAS[slug] || slug];

// Antworten gemischt, aber bei jedem Laden gleich (sonst springt die richtige Antwort)
function order(q, n) { let x = 0; for (const ch of q) x = (x * 31 + ch.charCodeAt(0)) >>> 0; const idx = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { x = (x * 1103515245 + 12345) >>> 0; const j = x % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx; }

export function miniCheck(c, { onExam } = {}) {
  const set = SETS[ALIAS[c.slug] || c.slug]; if (!set) return null;
  const topic = String(c.topic || c.slug || '').slice(0, 22);
  const tr = (e, d) => { try { window.BM && window.BM.track(e, d); } catch (x) {} };
  const qs = set.map(([q, a, why]) => { const o = order(q, a.length); return { q, why, opts: o.map(i => a[i]), r: o.indexOf(0), pick: -1 }; });
  const go = h('button', { class: 'm-mc-go', type: 'button', disabled: true }, L('Prüfen', 'Check'));
  const sum = h('div', { class: 'm-mc-sum', hidden: true });
  const items = qs.map((q, qi) => {
    const btns = q.opts.map((t, i) => h('button', { class: 'm-mc-o', type: 'button', onclick: () => {
      if (box.classList.contains('done')) return;
      q.pick = i; btns.forEach((b, j) => b.classList.toggle('on', j === i));
      go.disabled = qs.some(x => x.pick < 0);
    } }, h('span', { class: 'm-mc-k' }, 'ABC'[i]), h('span', {}, t)));
    const why = h('p', { class: 'm-mc-why', hidden: true }, q.why);
    const el = h('div', { class: 'm-mc-q' }, h('p', { class: 'm-mc-t' }, h('b', {}, `${qi + 1}.`), ' ', q.q), h('div', { class: 'm-mc-os' }, btns), why);
    return { el, btns, why };
  });
  const box = h('section', { class: 'm-mc' },
    h('div', { class: 'm-mc-h' }, h('b', {}, L('Mini-Check: Hast du’s verstanden?', 'Mini check: did it click?')), h('small', {}, getAccount() ? L('3 Fragen · 30 Sekunden', '3 questions · 30 seconds') : L('3 Fragen · Ergebnis sofort · Auflösung mit kostenlosem Konto', '3 questions · score instantly · answers with a free account'))),
    ...items.map(x => x.el), h('div', { class: 'm-mc-f' }, go), sum);
  // Auflösung: welche richtig/falsch war, die richtige Antwort und warum
  const reveal = () => {
    box.classList.add('open');
    qs.forEach((q, i) => {
      const ok = q.pick === q.r;
      items[i].el.classList.add(ok ? 'right' : 'wrong');
      items[i].btns[q.pick].classList.add(ok ? 'ok' : 'no');
      items[i].btns[q.r].classList.add('ok');
      items[i].why.textContent = (ok ? PRAISE[i % PRAISE.length] + ' ' : '') + q.why;
      items[i].why.hidden = false; items[i].why.classList.remove('blur');
    });
    sum.querySelectorAll('.m-mc-lock, .m-mc-hint').forEach(x => x.remove());
  };
  // Gast meldet sich irgendwo an (auch über Klausurfragen) → Auflösung sofort da
  const off = onAccount(a => { if (a && box.classList.contains('done') && !box.classList.contains('open') && box.isConnected) { reveal(); try { off && off(); } catch (x) {} } });
  const unlock = async (title, sub, why) => {
    const { openAuth } = await import('./account.js');
    const ok = await openAuth({ registerTitle: title, registerSub: sub, why });
    return !!(ok && getAccount());
  };
  go.onclick = async () => {
    if (box.classList.contains('done')) return;
    box.classList.add('done');
    const score = qs.filter(q => q.pick === q.r).length, n = qs.length, all = score === n;
    tr('Mini-Check geprüft', `${score}/${n} ${topic}`);
    items.forEach(x => x.btns.forEach(b => { b.disabled = true; }));
    if (!getAccount()) items.forEach((x, i) => { x.why.textContent = (qs[i].pick === qs[i].r ? PRAISE[i % PRAISE.length] + ' ' : '') + qs[i].why; x.why.hidden = false; x.why.classList.add('blur'); });
    go.hidden = true;
    const head = h('p', { class: 'm-mc-score' }, h('b', {}, L(`${score} von ${n} richtig.`, `${score} of ${n} correct.`)), ' ',
      all ? L('Stark – das sitzt.', 'Strong – that sticks.') : n - score === 1 ? L('Fast. Eine hat dich erwischt.', 'Close. One got you.') : score ? L('Zwei haben dich erwischt.', 'Two got you.') : L('Gut, dass das jetzt passiert und nicht in der Klausur.', 'Better now than in the exam.'));
    sum.replaceChildren(head); sum.hidden = false;
    try { c.note(`[Mini-Check auf der Themenseite: ${score} von ${n} richtig]`); } catch (x) {}
    if (getAccount()) {   // mit Konto: sofort alles
      reveal();
      if (all) sum.append(h('button', { class: 'm-mc-cta', type: 'button', onclick: () => onExam && onExam() }, L('Jetzt die echten Klausuraufgaben →', 'Now the real exam tasks →')));
    } else if (all) {     // Gast, alles richtig: nichts verraten, sondern das nächste Level anbieten
      sum.append(h('p', { class: 'm-mc-hint' }, L('Das war die Aufwärmrunde. Jetzt das echte Klausurniveau: 4 Aufgaben mit Musterlösung.', 'That was the warm-up. Now real exam level: 4 tasks with model answers.')),
        h('button', { class: 'm-mc-cta m-mc-lock', type: 'button', onclick: () => onExam && onExam() }, L('Klausuraufgaben kostenlos freischalten →', 'Unlock exam tasks for free →')));
    } else {              // Gast mit Fehler: weder welche falsch war noch die Lösung – erst mit Konto
      sum.append(h('p', { class: 'm-mc-hint' }, L('Welche falsch war, was richtig gewesen wäre und warum, siehst du mit kostenlosem Konto.', 'Which one was wrong, the right answer and why – with a free account.')),
        h('button', { class: 'm-mc-cta m-mc-lock', type: 'button', onclick: async () => {
          if (await unlock(L('Sieh, welche falsch war – und warum', 'See which one was wrong – and why'), L('Kostenlos, mit Google in zwei Klicks. Danach erklärt dir Max genau deinen Fehler – und auf Wunsch deine eigenen Vorlesungsfolien.', 'Free, two clicks with Google. Then Max explains exactly your mistake – and your own lecture slides if you like.'), 'Mini-Check')) reveal();
        } }, L('Auflösung kostenlos freischalten', 'Unlock the answers for free')));
    }
    requestAnimationFrame(() => { try { sum.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (x) {} });
  };
  return box;
}

// Kleiner Knopf direkt nach der ersten Erklärung: wer nur die Definition liest, sieht trotzdem den Mini-Check und springt per Klick hin
export function miniTeaser(mc) {
  return h('button', { class: 'm-mc-tz', type: 'button', onclick: () => { try { window.BM && window.BM.track('Mini-Check angeklickt', ''); } catch (x) {} mc.scrollIntoView({ behavior: 'smooth', block: 'start' }); mc.animate([{ boxShadow: '0 0 0 0 rgba(53,110,82,.55)' }, { boxShadow: '0 0 0 14px rgba(53,110,82,0)' }], { duration: 900, delay: 450 }); } },
    h('span', { class: 'm-mc-tzi' }, '✓'), h('span', { class: 'm-mc-tzt' }, h('b', {}, L('Mini-Check: Hast du’s verstanden?', 'Mini check: did it click?')), h('small', {}, L('3 Fragen · 30 Sekunden', '3 questions · 30 seconds'))), h('span', { class: 'm-mc-tza' }, '↓'));
}
