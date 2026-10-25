// Excel-Vorlagen Kosten- & Leistungsrechnung / Controlling (Gruppe „kosten“).
// Blaue Felder = Eingaben, alles andere echte Excel-Formeln. Geprüft gegen unabhängige Referenzrechnung und LibreOffice.
import { builder } from './core.js';

const SUB = 'Blaue Felder ausfüllen – alles andere rechnet Excel automatisch.';
const range = (a, b) => { const o = []; for (let k = a; k <= b; k++) o.push(k); return o; };

export default [
  {
    id: 'divisionskalkulation', cat: 'kosten', title: 'Divisionskalkulation (einstufig & zweistufig)', file: 'Divisionskalkulation.xlsx',
    desc: 'Selbstkosten je Stück ein- und zweistufig, Lagerbestandsveränderung zu Herstellkosten und Betriebsergebnis.', key: ['B13', 'B19', 'B23', 'B27'],
    build() {
      const b = builder(3).title('Divisionskalkulation (einstufig & zweistufig)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Herstellkosten der Periode').inp('B5', 480000, 'eur', { min: 0 });
      b.lab('A6', 'Verwaltungs- und Vertriebskosten der Periode').inp('B6', 120000, 'eur', { min: 0 });
      b.lab('A7', 'Produktionsmenge (Stück)').inp('B7', 12000, 'int', { min: 0 });
      b.lab('A8', 'Absatzmenge (Stück)').inp('B8', 10000, 'int', { min: 0 });
      b.lab('A9', 'Verkaufspreis je Stück').inp('B9', 60, 'eur', { min: 0 });
      b.sec(11, 'Einstufige Divisionskalkulation');
      b.lab('A12', 'Gesamtkosten der Periode').fx('B12', 'B5+B6', 'eur');
      b.lab('A13', 'Selbstkosten je Stück (Gesamtkosten / Produktionsmenge)').res('B13', 'IF(B7=0,"–",B12/B7)', 'eur');
      b.lab('A14', 'Einstufig zulässig?').fx('B14', 'IF(B7=B8,"✓ ja – Produktion = Absatz","✗ nein – Lagerbestand ändert sich, zweistufig rechnen")', 'txt').merge('B14:C14');
      b.sec(16, 'Zweistufige Divisionskalkulation');
      b.lab('A17', 'Herstellkosten je Stück (HK / Produktionsmenge)').fx('B17', 'IF(B7=0,"–",B5/B7)', 'eur');
      b.lab('A18', 'Verwaltungs- und Vertriebskosten je Stück (/ Absatzmenge)').fx('B18', 'IF(B8=0,"–",B6/B8)', 'eur');
      b.lab('A19', 'Selbstkosten je verkauftem Stück').res('B19', 'IF(OR(B7=0,B8=0),"–",B17+B18)', 'eur');
      b.sec(21, 'Lagerbestandsveränderung und Betriebsergebnis');
      b.lab('A22', 'Bestandsveränderung in Stück (+ Mehrung / − Minderung)').fx('B22', 'B7-B8', 'int');
      b.lab('A23', 'Bestandsveränderung zu Herstellkosten').res('B23', 'IF(B7=0,"–",B22*B5/B7)', 'eur');
      b.lab('A24', 'Herstellkosten des Umsatzes').fx('B24', 'IF(B7=0,"–",B5-B23)', 'eur');
      b.lab('A25', 'Selbstkosten des Umsatzes').fx('B25', 'IF(B7=0,"–",B24+B6)', 'eur');
      b.lab('A26', 'Umsatzerlöse').fx('B26', 'B8*B9', 'eur');
      b.lab('A27', 'Betriebsergebnis').res('B27', 'IF(B7=0,"–",B26-B25)', 'eur');
      b.note('A29', 'Zweistufig: Herstellkosten auf die produzierte, Verwaltungs- und Vertriebskosten auf die abgesetzte Menge. Lagerbestand wird zu Herstellkosten je Stück der Periode bewertet (bei Minderung: gleiche HK je Stück unterstellt).');
      return { name: 'Divisionskalkulation', cols: [54, 20, 30], cells: b.cells, merges: b.merges,
        explain: { B13: 'Einstufig: Gesamtkosten / Produktionsmenge – nur richtig, wenn alles Produzierte auch verkauft wird.', B19: 'Zweistufig: HK / Produktionsmenge + VwVtK / Absatzmenge.', B23: 'Bestandsveränderung = (Produktion − Absatz) × Herstellkosten je Stück.' } };
    }
  },
  {
    id: 'aequivalenzziffern', cat: 'kosten', title: 'Äquivalenzziffernkalkulation', file: 'Aequivalenzziffernkalkulation.xlsx',
    desc: 'Bis 6 Sorten: Recheneinheiten, Kosten je Recheneinheit, Stückkosten und Sortenkosten je Sorte.', key: ['B17', 'E8', 'E9', 'E10'],
    build() {
      const b = builder(6).title('Äquivalenzziffernkalkulation', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Gesamtkosten der Periode').inp('B5', 280000, 'eur', { min: 0 });
      b.th(7, ['Sorte', 'Äquivalenzziffer', 'Menge (Stück)', 'Recheneinheiten (RE)', 'Stückkosten', 'Sortenkosten']);
      const S = [['Sorte A', 1, 10000], ['Sorte B', 1.2, 5000], ['Sorte C', 0.8, 7500], ['Sorte D', 1.5, 4000], ['', 0, 0], ['', 0, 0]];
      S.forEach(([n, z, m], k) => { const r = 8 + k, e = `A${r}=""`;
        b.inp('A' + r, n, 'txt').inp('B' + r, z, 'num', { min: 0 }).inp('C' + r, m, 'int', { min: 0 })
          .fx('D' + r, `IF(${e},"",B${r}*C${r})`, 'num').res('E' + r, `IF(${e},"",B${r}*$B$17)`, 'eur').fx('F' + r, `IF(${e},"",E${r}*C${r})`, 'eur'); });
      b.lab('A14', 'Summe').tot('C14', 'SUM(C8:C13)', 'int').tot('D14', 'SUM(D8:D13)', 'num').tot('F14', 'SUM(F8:F13)', 'eur');
      b.sec(16, 'Ergebnis');
      b.lab('A17', 'Kosten je Recheneinheit').res('B17', 'IF(D14=0,0,B5/D14)', 'eur');
      b.lab('A18', 'Probe: Summe Sortenkosten = Gesamtkosten?').fx('B18', 'IF(D14=0,"–",IF(ROUND(F14-B5,2)=0,"✓ stimmt","✗ weicht ab"))', 'txt').merge('B18:C18');
      b.note('A20', 'Die Bezugssorte bekommt die Äquivalenzziffer 1. Zeilen ohne Sortenname werden nicht mitgerechnet.');
      return { name: 'Aequivalenzziffern', cols: [26, 16, 15, 20, 16, 18], cells: b.cells, merges: b.merges,
        explain: { D8: 'Recheneinheiten = Äquivalenzziffer × Menge.', B17: 'Kosten je Recheneinheit = Gesamtkosten / Summe der Recheneinheiten.', E8: 'Stückkosten der Sorte = Äquivalenzziffer × Kosten je Recheneinheit.' } };
    }
  },
  {
    id: 'maschinenstundensatz', cat: 'kosten', title: 'Maschinenstundensatzrechnung', file: 'Maschinenstundensatz.xlsx',
    desc: 'Maschinenstundensatz aus kalk. AfA, Zinsen, Raum, Energie und Instandhaltung – fix/variabel getrennt.', key: ['B29', 'B32'],
    build() {
      const b = builder(4).title('Maschinenstundensatzrechnung', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Anschaffungskosten').inp('B5', 240000, 'eur', { min: 0 });
      b.lab('A6', 'Wiederbeschaffungswert').inp('B6', 300000, 'eur', { min: 0 });
      b.lab('A7', 'Nutzungsdauer (Jahre)').inp('B7', 10, 'int', { min: 1, max: 100 });
      b.lab('A8', 'Kalkulationszinssatz').inp('B8', 0.08, 'pct', { min: 0, max: 1 });
      b.lab('A9', 'Raumbedarf (m²)').inp('B9', 20, 'num', { min: 0 });
      b.lab('A10', 'Raumkosten je m² und Monat').inp('B10', 12, 'eur', { min: 0 });
      b.lab('A11', 'Energieverbrauch je Laufstunde (kWh)').inp('B11', 25, 'num', { min: 0 });
      b.lab('A12', 'Energiepreis je kWh').inp('B12', 0.2, 'eur', { min: 0 });
      b.lab('A13', 'Energie-Grundgebühr p. a. (fix)').inp('B13', 1200, 'eur', { min: 0 });
      b.lab('A14', 'Instandhaltung fix p. a.').inp('B14', 3000, 'eur', { min: 0 });
      b.lab('A15', 'Instandhaltung variabel je Laufstunde').inp('B15', 2.5, 'eur', { min: 0 });
      b.lab('A16', 'Planlaufzeit (Maschinenstunden p. a.)').inp('B16', 2000, 'int', { min: 1 });
      b.lab('A17', 'Ist-Laufzeit zum Vergleich (Maschinenstunden p. a.)').inp('B17', 1600, 'int', { min: 1 });
      b.sec(19, 'Maschinenabhängige Kosten pro Jahr (bei Planlaufzeit)');
      b.th(20, ['Kostenart', 'Gesamt', 'Fix', 'Variabel']);
      const K = [['Kalkulatorische Abschreibung (WBW / ND)', 'IF(B7=0,0,B6/B7)', '0'], ['Kalkulatorische Zinsen (AK / 2 × Zinssatz)', 'B5/2*B8', '0'],
        ['Raumkosten (m² × €/m² × 12 Monate)', 'B9*B10*12', '0'], ['Energiekosten', 'B13', 'B11*B12*B16'], ['Instandhaltung', 'B14', 'B15*B16']];
      K.forEach(([t, f, v], k) => { const r = 21 + k; b.lab('A' + r, t).fx('B' + r, `C${r}+D${r}`, 'eur').fx('C' + r, f, 'eur').fx('D' + r, v, 'eur'); });
      b.lab('A26', '= Maschinenabhängige Kosten').tot('B26', 'SUM(B21:B25)', 'eur').tot('C26', 'SUM(C21:C25)', 'eur').tot('D26', 'SUM(D21:D25)', 'eur');
      b.sec(28, 'Ergebnis');
      b.lab('A29', 'Maschinenstundensatz (bei Planlaufzeit)').res('B29', 'IF(B16=0,0,B26/B16)', 'eur');
      b.lab('A30', 'davon fixer Anteil je Stunde').fx('B30', 'IF(B16=0,0,C26/B16)', 'eur');
      b.lab('A31', 'davon variabler Anteil je Stunde').fx('B31', 'IF(B16=0,0,D26/B16)', 'eur');
      b.lab('A32', 'Maschinenstundensatz bei Ist-Laufzeit').res('B32', 'IF(OR(B16=0,B17=0),0,C26/B17+B31)', 'eur');
      b.note('A34', 'Fixe Kosten verteilen sich bei weniger Laufstunden auf weniger Stunden – der Satz steigt. Kalk. AfA vom Wiederbeschaffungswert, kalk. Zinsen vom halben Anschaffungswert.');
      return { name: 'Maschinenstundensatz', cols: [48, 17, 17, 17], cells: b.cells, merges: b.merges,
        explain: { C21: 'Kalkulatorische AfA = Wiederbeschaffungswert / Nutzungsdauer.', C22: 'Kalkulatorische Zinsen = Anschaffungskosten / 2 × Kalkulationszinssatz.', B29: 'Maschinenstundensatz = maschinenabhängige Kosten / Laufzeit in Stunden.' } };
    }
  },
  {
    id: 'kuppelkalkulation', cat: 'kosten', title: 'Kuppelkalkulation (Restwert- & Verteilungsmethode)', file: 'Kuppelkalkulation.xlsx',
    desc: 'Herstellkosten des Hauptprodukts per Restwertmethode und Kostenverteilung nach Marktwerten.', key: ['D20', 'E24', 'E25', 'E26'],
    build() {
      const b = builder(5).title('Kuppelkalkulation (Restwert- & Verteilungsmethode)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Gesamtkosten des Kuppelprozesses').inp('B5', 400000, 'eur', { min: 0 });
      b.th(7, ['Kuppelprodukt', 'Menge', 'Marktpreis je Einheit', 'Weiterverarb.-/Vertriebskosten je Einheit']);
      b.inp('A8', 'Hauptprodukt H', 'txt').inp('B8', 8000, 'num', { min: 0 }).inp('C8', 60, 'eur', { min: 0 }).txt('D8', '– (nur Nebenprodukte)');
      [['Nebenprodukt N1', 2000, 30, 5], ['Nebenprodukt N2', 1000, 60, 10], ['', 0, 0, 0]].forEach(([n, m, p, w], k) => { const r = 9 + k;
        b.inp('A' + r, n, 'txt').inp('B' + r, m, 'num', { min: 0 }).inp('C' + r, p, 'eur', { min: 0 }).inp('D' + r, w, 'eur', { min: 0 }); });
      b.sec(13, 'Restwertmethode (Subtraktionsmethode)');
      b.th(14, ['Nebenprodukt', 'Erlöse', '− Weiterverarb.-/Vertriebskosten', '= Nettoerlös']);
      range(0, 2).forEach(k => { const r = 15 + k, s = 9 + k, e = `A${s}=""`;
        b.fx('A' + r, `IF(${e},"",A${s})`, 'txt').fx('B' + r, `IF(${e},"",B${s}*C${s})`, 'eur').fx('C' + r, `IF(${e},"",B${s}*D${s})`, 'eur').fx('D' + r, `IF(${e},"",B${r}-C${r})`, 'eur'); });
      b.lab('A18', 'Summe Nettoerlöse der Nebenprodukte').tot('D18', 'SUM(D15:D17)', 'eur');
      b.lab('A19', 'Restkosten des Hauptprodukts (Kuppelkosten − Nettoerlöse)').tot('D19', 'B5-D18', 'eur');
      b.lab('A20', 'Herstellkosten je Einheit Hauptprodukt').res('D20', 'IF(B8=0,"–",D19/B8)', 'eur');
      b.sec(22, 'Verteilungsmethode (Marktwertmethode)');
      b.th(23, ['Kuppelprodukt', 'Marktwert (Menge × Preis)', 'Anteil', 'Kostenanteil', 'Kosten je Einheit']);
      range(0, 3).forEach(k => { const r = 24 + k, s = 8 + k, e = `A${s}=""`;
        b.fx('A' + r, `IF(${e},"",A${s})`, 'txt').fx('B' + r, `IF(${e},"",B${s}*C${s})`, 'eur').fx('C' + r, `IF(${e},"",IF($B$28=0,0,B${r}/$B$28))`, 'pct')
          .fx('D' + r, `IF(${e},"",C${r}*$B$5)`, 'eur').res('E' + r, `IF(${e},"",IF(B${s}=0,"–",D${r}/B${s}))`, 'eur'); });
      b.lab('A28', 'Summe').tot('B28', 'SUM(B24:B27)', 'eur').tot('C28', 'SUM(C24:C27)', 'pct').tot('D28', 'SUM(D24:D27)', 'eur');
      b.note('A30', 'Restwertmethode: Nebenprodukte werden mit ihrem Nettoerlös bewertet, der Rest der Kuppelkosten trägt das Hauptprodukt. Verteilungsmethode: Kuppelkosten im Verhältnis der Marktwerte (Menge × Marktpreis) auf alle Produkte.');
      return { name: 'Kuppelkalkulation', cols: [44, 20, 20, 24, 18], cells: b.cells, merges: b.merges,
        explain: { D19: 'Restkosten = Kuppelkosten − Σ (Erlöse − Weiterverarbeitungs-/Vertriebskosten) der Nebenprodukte.', D20: 'Herstellkosten je Einheit des Hauptprodukts = Restkosten / Menge des Hauptprodukts.', D24: 'Kostenanteil = Kuppelkosten × Marktwert des Produkts / Summe der Marktwerte.' } };
    }
  },
  {
    id: 'handelvorwaerts', cat: 'kosten', title: 'Handelskalkulation (Vorwärtskalkulation)', file: 'Handelskalkulation_vorwaerts.xlsx',
    desc: 'Vom Listeneinkaufspreis zum Listenverkaufspreis – mit Kalkulationszuschlag, -faktor und Handelsspanne.', key: ['C20', 'C23', 'C24', 'C25'],
    build() {
      const b = builder(3).title('Handelskalkulation (Vorwärtskalkulation)', SUB);
      b.th(4, ['Position', 'Satz', 'Betrag']);
      const L = (r, t) => b.lab('A' + r, t);
      L(5, 'Listeneinkaufspreis (netto)'); b.inp('C5', 1000, 'eur', { min: 0 });
      L(6, '− Liefererrabatt'); b.inp('B6', 0.2, 'pct', { min: 0, max: 1 }).fx('C6', 'C5*B6', 'eur');
      L(7, '= Zieleinkaufspreis'); b.tot('C7', 'C5-C6', 'eur');
      L(8, '− Liefererskonto'); b.inp('B8', 0.02, 'pct', { min: 0, max: 1 }).fx('C8', 'C7*B8', 'eur');
      L(9, '= Bareinkaufspreis'); b.tot('C9', 'C7-C8', 'eur');
      L(10, '+ Bezugskosten'); b.inp('C10', 36, 'eur', { min: 0 });
      L(11, '= Bezugspreis (Einstandspreis)'); b.tot('C11', 'C9+C10', 'eur');
      L(12, '+ Handlungskosten (auf Bezugspreis)'); b.inp('B12', 0.25, 'pct', { min: 0 }).fx('C12', 'C11*B12', 'eur');
      L(13, '= Selbstkosten'); b.tot('C13', 'C11+C12', 'eur');
      L(14, '+ Gewinn (auf Selbstkosten)'); b.inp('B14', 0.1, 'pct', { min: 0 }).fx('C14', 'C13*B14', 'eur');
      L(15, '= Barverkaufspreis'); b.tot('C15', 'C13+C14', 'eur');
      L(16, '+ Kundenskonto (im Hundert)'); b.inp('B16', 0.02, 'pct', { min: 0, max: 0.45 }).fx('C16', 'C18*B16', 'eur');
      L(17, '+ Vertreterprovision (im Hundert)'); b.inp('B17', 0, 'pct', { min: 0, max: 0.45 }).fx('C17', 'C18*B17', 'eur');
      L(18, '= Zielverkaufspreis'); b.tot('C18', 'C15/(1-B16-B17)', 'eur');
      L(19, '+ Kundenrabatt (im Hundert)'); b.inp('B19', 0.1, 'pct', { min: 0, max: 0.9 }).fx('C19', 'C20-C18', 'eur');
      L(20, '= Listenverkaufspreis (netto)'); b.res('C20', 'C18/(1-B19)', 'eur');
      b.sec(22, 'Kennzahlen');
      L(23, 'Kalkulationszuschlag ((LVP − Bezugspreis) / Bezugspreis)'); b.res('C23', 'IF(C11=0,0,(C20-C11)/C11)', 'pct');
      L(24, 'Kalkulationsfaktor (LVP / Bezugspreis)'); b.res('C24', 'IF(C11=0,0,C20/C11)', 'f4');
      L(25, 'Handelsspanne ((LVP − Bezugspreis) / LVP)'); b.res('C25', 'IF(C20=0,0,(C20-C11)/C20)', 'pct');
      b.note('A27', 'Rabatt und Skonto des Lieferers vom Hundert, Kundenskonto und Provision im Hundert vom Zielverkaufspreis, Kundenrabatt im Hundert vom Listenverkaufspreis.');
      return { name: 'Vorwaertskalkulation', cols: [52, 12, 18], cells: b.cells, merges: b.merges,
        explain: { C11: 'Bezugspreis = Bareinkaufspreis + Bezugskosten.', C18: 'Zielverkaufspreis = Barverkaufspreis / (1 − Skonto − Provision).', C24: 'Kalkulationsfaktor = Listenverkaufspreis / Bezugspreis = 1 + Kalkulationszuschlag.' } };
    }
  },
  {
    id: 'handelrueckwaerts', cat: 'kosten', title: 'Handelskalkulation (Rückwärtskalkulation)', file: 'Handelskalkulation_rueckwaerts.xlsx',
    desc: 'Vom erzielbaren Listenverkaufspreis zurück zum höchstens zahlbaren Listeneinkaufspreis.', key: ['C20', 'C14'],
    build() {
      const b = builder(3).title('Handelskalkulation (Rückwärtskalkulation)', SUB);
      b.th(4, ['Position', 'Satz', 'Betrag']);
      const L = (r, t) => b.lab('A' + r, t);
      L(5, 'Listenverkaufspreis (netto, am Markt erzielbar)'); b.inp('C5', 1500, 'eur', { min: 0 });
      L(6, '− Kundenrabatt'); b.inp('B6', 0.1, 'pct', { min: 0, max: 1 }).fx('C6', 'C5*B6', 'eur');
      L(7, '= Zielverkaufspreis'); b.tot('C7', 'C5-C6', 'eur');
      L(8, '− Kundenskonto'); b.inp('B8', 0.02, 'pct', { min: 0, max: 0.45 }).fx('C8', 'C7*B8', 'eur');
      L(9, '− Vertreterprovision'); b.inp('B9', 0, 'pct', { min: 0, max: 0.45 }).fx('C9', 'C7*B9', 'eur');
      L(10, '= Barverkaufspreis'); b.tot('C10', 'C7-C8-C9', 'eur');
      L(11, '− Gewinn (auf Selbstkosten)'); b.inp('B11', 0.1, 'pct', { min: 0 }).fx('C11', 'C10-C12', 'eur');
      L(12, '= Selbstkosten'); b.tot('C12', 'C10/(1+B11)', 'eur');
      L(13, '− Handlungskosten (auf Bezugspreis)'); b.inp('B13', 0.25, 'pct', { min: 0 }).fx('C13', 'C12-C14', 'eur');
      L(14, '= Bezugspreis (Einstandspreis)'); b.res('C14', 'C12/(1+B13)', 'eur');
      L(15, '− Bezugskosten'); b.inp('C15', 36, 'eur', { min: 0 });
      L(16, '= Bareinkaufspreis'); b.tot('C16', 'C14-C15', 'eur');
      L(17, '+ Liefererskonto (im Hundert)'); b.inp('B17', 0.02, 'pct', { min: 0, max: 0.9 }).fx('C17', 'IF(C16<0,"–",C18-C16)', 'eur');
      L(18, '= Zieleinkaufspreis'); b.tot('C18', 'IF(C16<0,"–",C16/(1-B17))', 'eur');
      L(19, '+ Liefererrabatt (im Hundert)'); b.inp('B19', 0.2, 'pct', { min: 0, max: 0.9 }).fx('C19', 'IF(C16<0,"–",C20-C18)', 'eur');
      L(20, '= Höchster Listeneinkaufspreis'); b.res('C20', 'IF(C16<0,"nicht möglich – Bezugskosten zu hoch",C18/(1-B19))', 'eur');
      b.sec(22, 'Kennzahlen');
      L(23, 'Kalkulationszuschlag ((LVP − Bezugspreis) / Bezugspreis)'); b.fx('C23', 'IF(C14=0,0,(C5-C14)/C14)', 'pct');
      L(24, 'Kalkulationsfaktor (LVP / Bezugspreis)'); b.fx('C24', 'IF(C14=0,0,C5/C14)', 'f4');
      L(25, 'Handelsspanne ((LVP − Bezugspreis) / LVP)'); b.fx('C25', 'IF(C5=0,0,(C5-C14)/C5)', 'pct');
      b.note('A27', 'Rückwärts kehren sich die Rechenwege um: Zuschläge „auf“ einen Wert werden jetzt im Hundert herausgerechnet (÷ (1 + Satz)), Abzüge „vom“ Wert werden auf Hundert hochgerechnet (÷ (1 − Satz)).');
      return { name: 'Rueckwaertskalkulation', cols: [52, 12, 18], cells: b.cells, merges: b.merges,
        explain: { C12: 'Selbstkosten = Barverkaufspreis / (1 + Gewinnzuschlag).', C14: 'Bezugspreis = Selbstkosten / (1 + Handlungskostenzuschlag).', C20: 'Listeneinkaufspreis = Bareinkaufspreis / (1 − Skonto) / (1 − Rabatt).' } };
    }
  },
  {
    id: 'plankosten', cat: 'controlling', title: 'Flexible Plankostenrechnung (Vollkosten)', file: 'Flexible_Plankostenrechnung.xlsx',
    desc: 'Sollkosten, verrechnete Plankosten sowie Preis-, Verbrauchs- und Beschäftigungsabweichung einer Kostenstelle.', key: ['B19', 'B24', 'B25', 'B26'],
    build() {
      const b = builder(4).title('Flexible Plankostenrechnung auf Vollkostenbasis', SUB);
      b.sec(4, 'Eingaben (Kostenstelle)');
      b.lab('A5', 'Planbeschäftigung (z. B. Fertigungsstunden)').inp('B5', 1000, 'num', { min: 0 });
      b.lab('A6', 'Plankosten gesamt (bei Planbeschäftigung)').inp('B6', 50000, 'eur', { min: 0 });
      b.lab('A7', 'davon fixe Plankosten').inp('B7', 20000, 'eur', { min: 0 });
      b.lab('A8', 'Istbeschäftigung').inp('B8', 800, 'num', { min: 0 });
      b.lab('A9', 'Istkosten zu Planpreisen').inp('B9', 45000, 'eur', { min: 0 });
      b.lab('A10', 'Istkosten zu Istpreisen (0 = nicht gegeben)').inp('B10', 47000, 'eur', { min: 0 });
      b.sec(12, 'Plankostenverrechnungssatz und Sollkosten');
      b.lab('A13', 'Variable Plankosten').fx('B13', 'B6-B7', 'eur');
      b.lab('A14', 'Plankostenverrechnungssatz (Plankosten / Planbeschäftigung)').fx('B14', 'IF(B5=0,0,B6/B5)', 'eur');
      b.lab('A15', 'Variabler Plankostensatz').fx('B15', 'IF(B5=0,0,B13/B5)', 'eur');
      b.lab('A16', 'Beschäftigungsgrad').fx('B16', 'IF(B5=0,0,B8/B5)', 'pct');
      b.lab('A17', 'Verrechnete Plankosten (Satz × Istbeschäftigung)').fx('B17', 'B14*B8', 'eur');
      b.lab('A18', 'Istkosten (zu Istpreisen, sonst zu Planpreisen)').fx('B18', 'IF(B10=0,B9,B10)', 'eur');
      b.lab('A19', 'Sollkosten (fixe Plankosten + var. Satz × Istbeschäftigung)').res('B19', 'B7+B15*B8', 'eur');
      b.sec(21, 'Abweichungsanalyse');
      b.th(22, ['Abweichung', 'Betrag', 'Berechnung', 'Bewertung']);
      const ev = r => `IF(ROUND(B${r},2)>0,"ungünstig (Kosten über Plan)",IF(ROUND(B${r},2)<0,"günstig (Kosten unter Plan)","keine Abweichung"))`;
      b.lab('A23', 'Preisabweichung').res('B23', 'IF(B10=0,0,B10-B9)', 'eur').txt('C23', 'Istkosten (Istpreise) − Istkosten (Planpreise)').fx('D23', ev(23), 'txt');
      b.lab('A24', 'Verbrauchsabweichung').res('B24', 'B9-B19', 'eur').txt('C24', 'Istkosten (Planpreise) − Sollkosten').fx('D24', ev(24), 'txt');
      b.lab('A25', 'Beschäftigungsabweichung').res('B25', 'B19-B17', 'eur').txt('C25', 'Sollkosten − verrechnete Plankosten')
        .fx('D25', 'IF(ROUND(B25,2)>0,"Unterbeschäftigung – Fixkosten nicht voll verrechnet",IF(ROUND(B25,2)<0,"Überbeschäftigung – Fixkosten überdeckt","keine Abweichung"))', 'txt');
      b.lab('A26', 'Gesamtabweichung').res('B26', 'B23+B24+B25', 'eur').txt('C26', 'Istkosten − verrechnete Plankosten').fx('D26', ev(26), 'txt');
      b.lab('A27', 'Probe').fx('B27', 'IF(ROUND(B26-(B18-B17),2)=0,"✓ stimmt","✗")', 'txt');
      b.note('A29', 'Die Beschäftigungsabweichung ist kein Kostenstellen-Verschulden: Sie zeigt nur, dass die fixen Kosten bei abweichender Beschäftigung zu viel oder zu wenig verrechnet wurden (= fixe Plankosten × (1 − Beschäftigungsgrad)).');
      return { name: 'Plankosten', cols: [56, 17, 42, 46], cells: b.cells, merges: b.merges,
        explain: { B19: 'Sollkosten = fixe Plankosten + variabler Plankostensatz × Istbeschäftigung.', B24: 'Verbrauchsabweichung = Istkosten zu Planpreisen − Sollkosten.', B25: 'Beschäftigungsabweichung = Sollkosten − verrechnete Plankosten.' } };
    }
  },
  {
    id: 'makeorbuy', cat: 'kosten', title: 'Make-or-Buy (kurzfristig)', file: 'Make_or_Buy.xlsx',
    desc: 'Eigenfertigung oder Fremdbezug? Relevante Kosten, kritische Menge und Preisobergrenze für den Zukauf.', key: ['B21', 'B23', 'B24'],
    build() {
      const b = builder(3).title('Make-or-Buy-Entscheidung (kurzfristig)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Benötigte Menge pro Periode (Stück)').inp('B5', 5000, 'int', { min: 0 });
      b.lab('A6', 'Einstandspreis Fremdbezug je Stück (inkl. Bezugskosten)').inp('B6', 38, 'eur', { min: 0 });
      b.lab('A7', 'Variable Herstellkosten je Stück (Eigenfertigung)').inp('B7', 30, 'eur', { min: 0 });
      b.lab('A8', 'Abbaubare Fixkosten der Eigenfertigung (entfallen bei Fremdbezug)').inp('B8', 30000, 'eur', { min: 0 });
      b.lab('A9', 'Nicht abbaubare Fixkosten (fallen in jedem Fall an)').inp('B9', 50000, 'eur', { min: 0 });
      b.lab('A10', 'Opportunitätskosten je Stück (nur bei Engpass, sonst 0)').inp('B10', 0, 'eur', { min: 0 });
      b.sec(12, 'Vergleich der entscheidungsrelevanten Kosten');
      b.th(13, ['', 'Eigenfertigung', 'Fremdbezug']);
      b.lab('A14', 'Variable Kosten bzw. Einkaufskosten').fx('B14', 'B7*B5', 'eur').fx('C14', 'B6*B5', 'eur');
      b.lab('A15', 'Abbaubare Fixkosten').fx('B15', 'B8', 'eur').fx('C15', '0', 'eur');
      b.lab('A16', 'Opportunitätskosten').fx('B16', 'B10*B5', 'eur').fx('C16', '0', 'eur');
      b.lab('A17', '= Relevante Kosten').tot('B17', 'B14+B15+B16', 'eur').tot('C17', 'C14+C15+C16', 'eur');
      b.lab('A18', 'Relevante Kosten je Stück').fx('B18', 'IF(B5=0,"–",B17/B5)', 'eur').fx('C18', 'IF(B5=0,"–",C17/B5)', 'eur');
      b.sec(20, 'Ergebnis');
      b.lab('A21', 'Entscheidung').res('B21', 'IF(ROUND(B17,2)<ROUND(C17,2),"Eigenfertigung",IF(ROUND(B17,2)>ROUND(C17,2),"Fremdbezug","Indifferent – beide gleich teuer"))', 'txt').merge('B21:C21');
      b.lab('A22', 'Kostenvorteil pro Periode').fx('B22', 'ABS(B17-C17)', 'eur');
      b.lab('A23', 'Kritische Menge (ab hier lohnt Eigenfertigung)').res('B23', 'IF(B6-B7-B10<=0,"keine – Fremdbezug je Stück nicht teurer",B8/(B6-B7-B10))', 'num');
      b.lab('A24', 'Preisobergrenze für den Fremdbezug je Stück').res('B24', 'IF(B5=0,"–",B18)', 'eur');
      b.lab('A25', 'Zum Vergleich: Vollkosten je Stück Eigenfertigung').fx('B25', 'IF(B5=0,"–",(B14+B8+B9)/B5)', 'eur');
      b.note('A27', 'Nicht abbaubare Fixkosten sind nicht entscheidungsrelevant – ein Vergleich mit Vollkosten führt kurzfristig zur falschen Entscheidung. Opportunitätskosten nur ansetzen, wenn die Eigenfertigung einen Engpass belegt.');
      return { name: 'Make-or-Buy', cols: [60, 20, 20], cells: b.cells, merges: b.merges,
        explain: { B17: 'Relevante Kosten der Eigenfertigung = variable Kosten + abbaubare Fixkosten + Opportunitätskosten.', B23: 'Kritische Menge = abbaubare Fixkosten / (Einstandspreis − variable Kosten − Opportunitätskosten je Stück).', B24: 'Teurer als die relevanten Stückkosten der Eigenfertigung darf der Zukauf nicht sein.' } };
    }
  },
  {
    id: 'preisuntergrenze', cat: 'kosten', title: 'Preisuntergrenze & Zusatzauftrag', file: 'Preisuntergrenze_Zusatzauftrag.xlsx',
    desc: 'Kurz- und langfristige Preisuntergrenze und ob sich ein Zusatzauftrag lohnt – auch bei knapper Kapazität.', key: ['B17', 'B18', 'B26', 'B27'],
    build() {
      const b = builder(3).title('Preisuntergrenze & Zusatzauftrag', SUB);
      b.sec(4, 'Eingaben: Normalgeschäft');
      b.lab('A5', 'Kapazität (Stück pro Periode)').inp('B5', 10000, 'int', { min: 0 });
      b.lab('A6', 'Aktuelle Absatzmenge (Stück)').inp('B6', 7000, 'int', { min: 0 });
      b.lab('A7', 'Verkaufspreis je Stück (Normalgeschäft)').inp('B7', 70, 'eur', { min: 0 });
      b.lab('A8', 'Variable Kosten je Stück').inp('B8', 40, 'eur', { min: 0 });
      b.lab('A9', 'Fixkosten pro Periode').inp('B9', 150000, 'eur', { min: 0 });
      b.sec(11, 'Eingaben: Zusatzauftrag');
      b.lab('A12', 'Menge des Zusatzauftrags (Stück)').inp('B12', 2000, 'int', { min: 0 });
      b.lab('A13', 'Angebotener Preis je Stück').inp('B13', 48, 'eur', { min: 0 });
      b.lab('A14', 'Zusätzliche auftragsfixe Kosten (z. B. Werkzeug)').inp('B14', 4000, 'eur', { min: 0 });
      b.sec(16, 'Preisuntergrenzen');
      b.lab('A17', 'Kurzfristige Preisuntergrenze (= variable Stückkosten)').res('B17', 'B8', 'eur');
      b.lab('A18', 'Langfristige Preisuntergrenze (= Selbstkosten je Stück bei aktueller Menge)').res('B18', 'IF(B6=0,"–",B8+B9/B6)', 'eur');
      b.sec(20, 'Entscheidung über den Zusatzauftrag');
      b.lab('A21', 'Freie Kapazität (Stück)').fx('B21', 'MAX(0,B5-B6)', 'int');
      b.lab('A22', 'Verdrängte Menge des Normalgeschäfts (Stück)').fx('B22', 'MIN(B6,MAX(0,B12-B21))', 'int');
      b.lab('A23', 'Entgangener Deckungsbeitrag (Opportunitätskosten)').fx('B23', 'B22*(B7-B8)', 'eur');
      b.lab('A24', 'Deckungsbeitrag des Zusatzauftrags').fx('B24', 'B12*(B13-B8)', 'eur');
      b.lab('A25', 'Ergebnisänderung durch den Zusatzauftrag').tot('B25', 'B24-B14-B23', 'eur');
      b.lab('A26', 'Preisuntergrenze des Zusatzauftrags je Stück').res('B26', 'IF(B12=0,"–",B8+(B14+B23)/B12)', 'eur');
      b.lab('A27', 'Entscheidung').res('B27', 'IF(B12>B5,"Ablehnen – Auftrag übersteigt die Gesamtkapazität",IF(ROUND(B25,2)>0,"Annehmen",IF(ROUND(B25,2)<0,"Ablehnen","Indifferent")))', 'txt').merge('B27:C27');
      b.note('A29', 'Bei freier Kapazität reicht ein Preis über den variablen Kosten (+ auftragsfixe Kosten je Stück). Reicht die Kapazität nicht, kommt der entgangene DB der verdrängten Normalaufträge dazu. Annahme: Das Normalgeschäft hat keine Preisnachlässe zur Folge.');
      return { name: 'Preisuntergrenze', cols: [66, 20, 26], cells: b.cells, merges: b.merges,
        explain: { B18: 'Langfristig müssen alle Kosten gedeckt sein: variable Stückkosten + Fixkosten / Menge.', B23: 'Verdrängte Stück × DB je Stück des Normalgeschäfts.', B26: 'Variable Kosten + (auftragsfixe Kosten + entgangener DB) / Auftragsmenge.' } };
    }
  },
  {
    id: 'produktionsprogramm', cat: 'controlling', title: 'Optimales Produktionsprogramm (ein Engpass)', file: 'Optimales_Produktionsprogramm.xlsx',
    desc: 'Bis 5 Produkte: relativer DB je Engpasseinheit, Rangfolge, Mengen bis zur Kapazitätsgrenze und Gesamt-DB.', key: ['B23', 'B24'],
    build() {
      const b = builder(8).title('Optimales Produktionsprogramm bei einem Engpass', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Kapazität des Engpasses (z. B. Maschinenstunden)').inp('B5', 4000, 'num', { min: 0 }).merge('B5:C5');
      b.lab('A6', 'Fixkosten der Periode').inp('B6', 50000, 'eur', { min: 0 }).merge('B6:C6');
      b.th(8, ['Produkt', 'Preis je Stück', 'Variable Kosten je Stück', 'Höchstabsatz (Stück)', 'Engpassbedarf je Stück', 'DB je Stück', 'Relativer DB je Engpasseinheit', 'Rang']);
      const P = [['Produkt A', 100, 60, 500, 4], ['Produkt B', 80, 50, 800, 2], ['Produkt C', 130, 70, 300, 5], ['Produkt D', 60, 45, 600, 1], ['Produkt E', 50, 52, 400, 1]];
      P.forEach(([n, p, kv, m, a], k) => { const r = 9 + k, e = `A${r}=""`, h = 30 + k;
        b.inp('A' + r, n, 'txt').inp('B' + r, p, 'eur', { min: 0 }).inp('C' + r, kv, 'eur', { min: 0 }).inp('D' + r, m, 'num', { min: 0 }).inp('E' + r, a, 'num', { min: 0 })
          .fx('F' + r, `IF(${e},"",B${r}-C${r})`, 'eur')
          .fx('G' + r, `IF(${e},"",IF(F${r}<=0,"kein positiver DB",IF(E${r}=0,"kein Engpassbedarf",F${r}/E${r})))`, 'eur')
          .fx('H' + r, `IF(${e},"",COUNTIF($B$30:$B$34,">"&B${h})+COUNTIF($B$30:B${h},B${h}))`, 'int'); });
      b.sec(15, 'Produktionsprogramm in der Rangfolge');
      b.th(16, ['Rang', 'Produkt', 'Relativer DB', 'Engpassbedarf je Stück', 'Menge im Programm', 'Engpass belegt', 'Restkapazität', 'Deckungsbeitrag']);
      range(1, 5).forEach(k => { const r = 16 + k, e = `A${r}=""`, m = `MATCH(A${r},$H$9:$H$13,0)`, prev = k === 1 ? '$B$5' : `G${r - 1}`;
        b.fx('A' + r, `IF(${k}<=COUNT($H$9:$H$13),${k},"")`, 'int').fx('B' + r, `IF(${e},"",INDEX($A$9:$A$13,${m}))`, 'txt')
          .fx('C' + r, `IF(${e},"",INDEX($G$9:$G$13,${m}))`, 'eur').fx('D' + r, `IF(${e},"",INDEX($E$9:$E$13,${m}))`, 'num')
          .fx('E' + r, `IF(${e},"",IF(INDEX($B$30:$B$34,${m})<0,0,IF(D${r}=0,INDEX($D$9:$D$13,${m}),MAX(0,MIN(INDEX($D$9:$D$13,${m}),${prev}/D${r})))))`, 'num')
          .fx('F' + r, `IF(${e},"",E${r}*D${r})`, 'num').fx('G' + r, `IF(${e},"",MAX(0,ROUND(${prev}-F${r},9)))`, 'num')
          .fx('H' + r, `IF(${e},"",E${r}*INDEX($F$9:$F$13,${m}))`, 'eur'); });
      b.lab('A22', 'Summe').tot('F22', 'SUM(F17:F21)', 'num').tot('H22', 'SUM(H17:H21)', 'eur');
      b.lab('A23', 'Gesamtdeckungsbeitrag').res('B23', 'H22', 'eur').merge('B23:C23');
      b.lab('A24', 'Betriebsergebnis (Gesamt-DB − Fixkosten)').res('B24', 'H22-B6', 'eur').merge('B24:C24');
      b.lab('A25', 'Engpassbedarf bei Höchstabsatz (nur Produkte mit DB > 0)').fx('B25', 'SUM(C30:C34)', 'num').merge('B25:C25');
      b.lab('A26', 'Liegt ein Engpass vor?').fx('B26', 'IF(B25>B5,"Ja – Rangfolge nach relativem DB","Nein – alle Produkte mit positivem DB voll produzieren")', 'txt').merge('B26:H26');
      b.note('A27', 'Bei gleichem relativem DB ist die Reihenfolge egal – der Gesamt-DB bleibt gleich. Mengen können Bruchteile sein, wenn die Restkapazität nicht aufgeht. Zeilen ohne Produktname werden ignoriert.');
      b.sec(29, 'Hilfswerte für die Rangfolge (nicht ändern)');
      P.forEach((_, k) => { const r = 30 + k, s = 9 + k, e = `A${s}=""`;
        b.fx('A' + r, `IF(${e},"(leer)",A${s})`, 'txt')
          .fx('B' + r, `IF(${e},-2,IF(F${s}<=0,-1,IF(E${s}=0,1000000000,ROUND(F${s}/E${s},6))))`, 'num')
          .fx('C' + r, `IF(B${r}<0,0,D${s}*E${s})`, 'num'); });
      return { name: 'Produktionsprogramm', cols: [30, 14, 16, 16, 16, 15, 18, 16], cells: b.cells, merges: b.merges,
        explain: { G9: 'Relativer DB = DB je Stück / Engpassbedarf je Stück.', H9: 'Rang ohne RANG-Funktion: Anzahl größerer Schlüssel + 1; bei Gleichstand entscheidet die Zeilenreihenfolge.', E17: 'Menge = Höchstabsatz, solange die Restkapazität reicht – sonst Restkapazität / Engpassbedarf.' } };
    }
  },
  {
    id: 'kostenaufloesung', cat: 'kosten', title: 'Kostenauflösung & Kostenfunktion', file: 'Kostenaufloesung.xlsx',
    desc: 'Fixe und variable Kosten per Hoch-Tief-Punkt-Methode (und Regression) – Kostenfunktion K = Kf + kv · x.', key: ['B23', 'B24', 'B30'],
    build() {
      const b = builder(7).title('Kostenauflösung & Kostenfunktion', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Beschäftigung für die Prognose').inp('B5', 1500, 'num', { min: 0 });
      b.th(7, ['Periode', 'Beschäftigung x', 'Gesamtkosten K', 'x (gültig)', 'K (gültig)', 'x · K', 'x²']);
      const D = [['Januar', 1000, 26000], ['Februar', 1400, 31000], ['März', 1200, 28500], ['April', 1800, 37000], ['Mai', 1600, 34000], ['Juni', 800, 24000], ['', 0, 0], ['', 0, 0]];
      D.forEach(([n, x, k], i) => { const r = 8 + i, e = `A${r}=""`;
        b.inp('A' + r, n, 'txt').inp('B' + r, x, 'num', { min: 0 }).inp('C' + r, k, 'eur', { min: 0 })
          .fx('D' + r, `IF(${e},"",B${r})`, 'num').fx('E' + r, `IF(${e},"",C${r})`, 'eur').fx('F' + r, `IF(${e},"",B${r}*C${r})`, 'num').fx('G' + r, `IF(${e},"",B${r}^2)`, 'num'); });
      b.lab('A16', 'Anzahl / Summen').fx('B16', 'COUNT(D8:D15)', 'int').fx('D16', 'SUM(D8:D15)', 'num').fx('E16', 'SUM(E8:E15)', 'eur').fx('F16', 'SUM(F8:F15)', 'num').fx('G16', 'SUM(G8:G15)', 'num');
      b.sec(18, 'Hoch-Tief-Punkt-Methode (mathematische Kostenauflösung)');
      b.th(19, ['', 'Beschäftigung x', 'Gesamtkosten K']);
      b.lab('A20', 'Höchste Beschäftigung').fx('B20', 'IF(B16=0,"–",MAX(D8:D15))', 'num').fx('C20', 'IF(B16=0,"–",INDEX(E8:E15,MATCH(B20,D8:D15,0)))', 'eur');
      b.lab('A21', 'Niedrigste Beschäftigung').fx('B21', 'IF(B16=0,"–",MIN(D8:D15))', 'num').fx('C21', 'IF(B16=0,"–",INDEX(E8:E15,MATCH(B21,D8:D15,0)))', 'eur');
      b.lab('A22', 'Differenz').fx('B22', 'IF(B16=0,"–",B20-B21)', 'num').fx('C22', 'IF(B16=0,"–",C20-C21)', 'eur');
      b.lab('A23', 'Variable Kosten je Einheit kv = ΔK / Δx').res('B23', 'IF(B16=0,"–",IF(B22=0,"–",C22/B22))', 'eur');
      b.lab('A24', 'Fixkosten Kf = K(hoch) − kv · x(hoch)').res('B24', 'IF(B16=0,"–",IF(B22=0,"–",C20-B23*B20))', 'eur');
      b.sec(26, 'Kostenfunktion K = Kf + kv · x');
      b.th(27, ['', 'Hoch-Tief-Punkt', 'Regression (kleinste Quadrate)']);
      b.lab('A28', 'Fixkosten Kf').fx('B28', 'B24', 'eur').fx('C28', 'IF(OR(B16<2,B16*G16-D16^2=0),"–",(E16-C29*D16)/B16)', 'eur');
      b.lab('A29', 'Variable Kosten je Einheit kv').fx('B29', 'B23', 'eur').fx('C29', 'IF(OR(B16<2,B16*G16-D16^2=0),"–",(B16*F16-D16*E16)/(B16*G16-D16^2))', 'eur');
      b.lab('A30', 'Prognose Gesamtkosten bei der Beschäftigung aus B5').res('B30', 'IF(B23="–","–",B24+B23*B5)', 'eur').fx('C30', 'IF(C29="–","–",C28+C29*B5)', 'eur');
      b.lab('A31', 'Prognose Stückkosten').fx('B31', 'IF(OR(B30="–",B5=0),"–",B30/B5)', 'eur').fx('C31', 'IF(OR(C30="–",B5=0),"–",C30/B5)', 'eur');
      b.note('A33', 'Hoch-Tief-Punkt: nur die Perioden mit höchster und niedrigster Beschäftigung zählen. Die Regression nutzt alle Perioden und gleicht Ausreißer aus. Zeilen ohne Periodenname werden ignoriert.');
      return { name: 'Kostenaufloesung', cols: [50, 16, 22, 14, 14, 16, 14], cells: b.cells, merges: b.merges,
        explain: { B23: 'kv = (K hoch − K tief) / (x hoch − x tief).', B24: 'Kf = K hoch − kv × x hoch.', C29: 'Steigung der Regressionsgeraden: (n·Σxy − Σx·ΣK) / (n·Σx² − (Σx)²).' } };
    }
  },
  {
    id: 'prozesskosten', cat: 'kosten', title: 'Prozesskostenrechnung', file: 'Prozesskostenrechnung.xlsx',
    desc: 'Bis 4 Teilprozesse: Prozesskostensätze lmi, Umlage lmn, Gesamtsätze und Prozesskosten je Produkt.', key: ['H6', 'D22', 'F22'],
    build() {
      const b = builder(8).title('Prozesskostenrechnung', SUB);
      b.sec(4, '1. Teilprozesse und Prozesskostensätze');
      b.th(5, ['Teilprozess', 'Art (lmi / lmn)', 'Kostentreiber', 'Prozessmenge', 'Prozesskosten', 'Prozesskostensatz (lmi)', 'Umlagesatz (lmn)', 'Gesamtprozesskostensatz']);
      const T = [['Material bestellen', 'lmi', 'Anzahl Bestellungen', 500, 50000], ['Material annehmen', 'lmi', 'Anzahl Lieferungen', 400, 30000], ['Lieferanten betreuen', 'lmi', 'Anzahl Lieferanten', 50, 20000], ['Abteilung leiten', 'lmn', '–', 0, 10000]];
      const isLmi = r => `IFERROR(MATCH("lmi",B${r},0),0)=1`, isLmn = r => `IFERROR(MATCH("lmn",B${r},0),0)=1`;
      T.forEach(([n, a, d, m, c], k) => { const r = 6 + k;
        b.inp('A' + r, n, 'txt').inp('B' + r, a, 'txt').inp('C' + r, d, 'txt').inp('D' + r, m, 'num', { min: 0 }).inp('E' + r, c, 'eur', { min: 0 })
          .fx('F' + r, `IF(${isLmi(r)},IF(D${r}=0,0,E${r}/D${r}),"")`, 'eur').fx('G' + r, `IF(${isLmi(r)},F${r}*$B$12,"")`, 'eur')
          [k === 0 ? 'res' : 'fx']('H' + r, `IF(${isLmi(r)},F${r}+G${r},"")`, 'eur'); });
      b.lab('A10', 'Summe Prozesskosten').tot('E10', 'SUM(E6:E9)', 'eur');
      b.lab('A11', 'davon leistungsmengeninduziert (lmi) / -neutral (lmn)')
        .fx('B11', `IF(${isLmi(6)},E6,0)+IF(${isLmi(7)},E7,0)+IF(${isLmi(8)},E8,0)+IF(${isLmi(9)},E9,0)`, 'eur')
        .fx('C11', `IF(${isLmn(6)},E6,0)+IF(${isLmn(7)},E7,0)+IF(${isLmn(8)},E8,0)+IF(${isLmn(9)},E9,0)`, 'eur');
      b.lab('A12', 'Umlagefaktor (lmn-Kosten / lmi-Kosten)').fx('B12', 'IF(B11=0,0,C11/B11)', 'pct');
      b.sec(14, '2. Prozesskosten je Produkt');
      b.th(15, ['Teilprozess (lmi)', 'Gesamtprozesskostensatz', 'Prozessmenge Produkt A', 'Prozesskosten A', 'Prozessmenge Produkt B', 'Prozesskosten B']);
      const Q = [[200, 300], [150, 250], [10, 40], [0, 0]];
      Q.forEach(([qa, qb], k) => { const r = 16 + k, s = 6 + k;
        b.fx('A' + r, `IF(${isLmi(s)},A${s},"")`, 'txt').fx('B' + r, `IF(${isLmi(s)},H${s},"")`, 'eur')
          .inp('C' + r, qa, 'num', { min: 0 }).fx('D' + r, `IF(${isLmi(s)},C${r}*B${r},"")`, 'eur')
          .inp('E' + r, qb, 'num', { min: 0 }).fx('F' + r, `IF(${isLmi(s)},E${r}*B${r},"")`, 'eur'); });
      b.lab('A20', 'Summe Prozesskosten je Produkt').tot('D20', 'SUM(D16:D19)', 'eur').tot('F20', 'SUM(F16:F19)', 'eur');
      b.lab('A21', 'Produktionsmenge (Stück)').inp('D21', 10000, 'int', { min: 0 }).inp('F21', 5000, 'int', { min: 0 });
      b.lab('A22', 'Prozesskosten je Stück').res('D22', 'IF(D21=0,"–",D20/D21)', 'eur').res('F22', 'IF(F21=0,"–",F20/F21)', 'eur');
      b.lab('A23', 'Nicht auf A oder B verrechnete Prozesskosten').fx('D23', 'E10-D20-F20', 'eur');
      b.note('A25', 'Art genau „lmi“ oder „lmn“ eintragen. lmn-Kosten werden im Verhältnis der lmi-Prozesskosten umgelegt. Prozessmengen in Teil 2 gelten nur für lmi-Prozesse; nutzen A und B alle Prozessmengen, ist Zeile 23 = 0.');
      return { name: 'Prozesskosten', cols: [30, 16, 22, 16, 16, 18, 16, 18], cells: b.cells, merges: b.merges,
        explain: { F6: 'Prozesskostensatz (lmi) = Prozesskosten / Prozessmenge.', G6: 'Umlagesatz = lmi-Satz × lmn-Kosten / lmi-Kosten.', D22: 'Prozesskosten je Stück = Σ (Prozessmenge × Gesamtprozesskostensatz) / Stückzahl.' } };
    }
  }
];
