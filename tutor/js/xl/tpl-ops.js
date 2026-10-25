// Excel-Vorlagen von BWL Max – Beschaffung/Produktion/Logistik, Marketing & Absatz, Controlling & Planung.
// Blaue Felder = Eingaben, alles andere echte Excel-Formeln. Jede Vorlage ist gegen eine unabhängige Referenzrechnung und LibreOffice geprüft.
import { builder } from './core.js';

const SUB = 'Blaue Felder ausfüllen – alles andere rechnet Excel automatisch.';
const range = (a, b) => { const o = []; for (let k = a; k <= b; k++) o.push(k); return o; };
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export default [
  {
    id: 'bestellmenge', cat: 'logistik', title: 'Optimale Bestellmenge (Andler)', file: 'Optimale_Bestellmenge_Andler.xlsx',
    desc: 'Andler-Formel: optimale Bestellmenge, Anzahl Bestellungen, Bestellrhythmus und Kostenverlauf als Tabelle.', key: ['B13', 'B20'],
    build() {
      const b = builder(7).title('Optimale Bestellmenge (Andler)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Jahresbedarf (Stück)').inp('B5', 12000, 'int', { min: 0 });
      b.lab('A6', 'Bestellfixe Kosten je Bestellung').inp('B6', 150, 'eur', { min: 0 });
      b.lab('A7', 'Einstandspreis je Stück').inp('B7', 20, 'eur', { min: 0 });
      b.lab('A8', 'Lagerhaltungskostensatz p. a. (Zins + Lagerkosten)').inp('B8', 0.15, 'pct', { min: 0, max: 1 });
      b.lab('A9', 'Tage pro Jahr').inp('B9', 360, 'int', { min: 1, max: 366 });
      const ok = 'AND(B5>0,B6>0,B12>0)';
      b.sec(11, 'Ergebnis');
      b.lab('A12', 'Lagerhaltungskosten je Stück und Jahr').fx('B12', 'B7*B8', 'eur');
      b.lab('A13', 'Optimale Bestellmenge x_opt').res('B13', `IF(${ok},SQRT(2*B5*B6/B12),"nicht bestimmbar")`, 'num');
      b.lab('A14', 'Optimale Bestellmenge (gerundet)').fx('B14', `IF(${ok},ROUND(B13,0),"–")`, 'stk');
      b.lab('A15', 'Anzahl Bestellungen pro Jahr').fx('B15', `IF(${ok},B5/B13,"–")`, 'num');
      b.lab('A16', 'Bestellrhythmus (Tage)').fx('B16', `IF(${ok},B9*B13/B5,"–")`, 'num');
      b.lab('A17', 'Ø Lagerbestand (Stück)').fx('B17', `IF(${ok},B13/2,"–")`, 'num');
      b.lab('A18', 'Bestellkosten p. a.').fx('B18', `IF(${ok},B5/B13*B6,"–")`, 'eur');
      b.lab('A19', 'Lagerhaltungskosten p. a.').fx('B19', `IF(${ok},B13/2*B12,"–")`, 'eur');
      b.lab('A20', 'Minimale Gesamtkosten (Bestell- + Lagerkosten)').res('B20', `IF(${ok},B18+B19,"–")`, 'eur');
      b.sec(22, 'Kostenverlauf für verschiedene Bestellmengen');
      b.lab('A23', 'Schrittweite der Tabelle (Stück)').inp('B23', 200, 'int', { min: 1 });
      b.th(25, ['Bestellmenge', 'Anzahl Bestellungen', 'Ø Lagerbestand', 'Bestellkosten', 'Lagerhaltungskosten', 'Gesamtkosten', 'Hinweis']);
      range(1, 14).forEach(k => { const r = 25 + k;
        b.fx('A' + r, `${k}*$B$23`, 'int').fx('B' + r, `$B$5/A${r}`, 'num').fx('C' + r, `A${r}/2`, 'num').fx('D' + r, `B${r}*$B$6`, 'eur')
          .fx('E' + r, `C${r}*$B$12`, 'eur').fx('F' + r, `D${r}+E${r}`, 'eur').fx('G' + r, `IF(F${r}=MIN($F$26:$F$39),"← günstigste Zeile","")`, 'txt'); });
      b.note('A41', 'Andler: x_opt = √(2 · Jahresbedarf · bestellfixe Kosten / (Einstandspreis · Lagerhaltungskostensatz)). Im Optimum sind Bestell- und Lagerkosten gleich hoch. Ø Lagerbestand = x / 2 (ohne Sicherheitsbestand).');
      return { name: 'Bestellmenge', cols: [44, 18, 16, 16, 19, 16, 22], cells: b.cells, merges: b.merges, chart: { x: 'A26:A39', series: [['Bestellkosten', 'D26:D39'], ['Lagerhaltungskosten', 'E26:E39'], ['Gesamtkosten', 'F26:F39']] },
        explain: { B13: 'Andler-Formel: √(2 · M · K_B / (p · l)) – Bestellmenge, bei der Bestell- plus Lagerkosten minimal sind.', B18: 'Bestellkosten = Anzahl Bestellungen (M / x) × bestellfixe Kosten.', B19: 'Lagerhaltungskosten = Ø Lagerbestand (x / 2) × Einstandspreis × Lagerhaltungskostensatz.' } };
    }
  },
  {
    id: 'abcanalyse', cat: 'logistik', title: 'ABC-Analyse', file: 'ABC-Analyse.xlsx',
    desc: 'Bis 15 Artikel nach Verbrauchswert sortieren, kumulierte Anteile bilden und in A-, B-, C-Güter einteilen.', key: ['B46', 'E46', 'F46'],
    build() {
      const b = builder(8).title('ABC-Analyse', SUB);
      b.sec(4, '1. Artikeldaten (bis 15 Artikel, freie Zeilen leer lassen)');
      b.th(5, ['Artikel', 'Jahresverbrauch (Menge)', 'Preis je Einheit', 'Verbrauchswert', 'Rang', 'Sortierwert (Hilfsspalte)']);
      const D = [['Getriebe', 200, 210], ['Schrauben M6', 20000, 0.1], ['Gehäuse', 1000, 5], ['Elektromotor', 150, 220], ['Dichtungen', 2000, 1.5], ['Steuerung', 40, 125], ['Kabelsatz', 800, 5], ['Unterlegscheiben', 25000, 0.04], ['Kugellager', 500, 6], ['Etiketten', 10000, 0.2]];
      range(6, 20).forEach((r, k) => { const d = D[k];
        if (d) b.inp('A' + r, d[0], 'txt').inp('B' + r, d[1], 'num', { min: 0 }).inp('C' + r, d[2], 'eur', { min: 0 });
        else b.inp('A' + r, null, 'txt').inp('B' + r, null, 'num').inp('C' + r, null, 'eur');
        b.fx('D' + r, `IF(OR(COUNTA(A${r})=0,COUNT(B${r}:C${r})<2),"",ROUND(B${r}*C${r},2))`, 'eur')
          .fx('E' + r, `IF(D${r}="","",COUNTIF($F$6:$F$20,">"&F${r})+COUNTIF($F$6:F${r},F${r}))`, 'int')
          .fx('F' + r, `IF(D${r}="",-1,D${r})`, 'num'); });
      b.lab('A21', 'Summe').tot('D21', 'SUM(D6:D20)', 'eur');
      b.sec(22, '2. Klassengrenzen (kumulierter Wertanteil)');
      b.lab('A23', 'A-Güter bis kumuliert').inp('B23', 0.8, 'pct', { min: 0, max: 1 });
      b.lab('A24', 'B-Güter bis kumuliert').inp('B24', 0.95, 'pct', { min: 0, max: 1 }).fx('C24', 'IF(B24<B23,"Grenze B muss ≥ Grenze A sein","✓")', 'txt').merge('C24:F24');
      b.lab('A25', 'Anzahl erfasster Artikel').fx('B25', 'COUNT(D6:D20)', 'int');
      b.sec(26, '3. ABC-Tabelle (absteigend nach Verbrauchswert)');
      b.th(27, ['Rang', 'Artikel', 'Menge', 'Verbrauchswert', 'Wertanteil', 'Wertanteil kumuliert', 'Mengenanteil', 'Klasse']);
      range(1, 15).forEach(k => { const r = 27 + k, e = `A${r}=""`, m = `MATCH(A${r},$E$6:$E$20,0)`;
        b.fx('A' + r, `IF(${k}<=$B$25,${k},"")`, 'int').fx('B' + r, `IF(${e},"",INDEX($A$6:$A$20,${m}))`, 'txt').fx('C' + r, `IF(${e},"",INDEX($B$6:$B$20,${m}))`, 'num')
          .fx('D' + r, `IF(${e},"",LARGE($D$6:$D$20,${k}))`, 'eur').fx('E' + r, `IF(${e},"",IF($D$21=0,0,D${r}/$D$21))`, 'pct')
          .fx('F' + r, `IF(${e},"",IF($D$21=0,0,SUM($D$28:D${r})/$D$21))`, 'pct').fx('G' + r, `IF(${e},"",IF($C$43=0,0,C${r}/$C$43))`, 'pct')
          .fx('H' + r, `IF(${e},"",IF(OR(A${r}=1,ROUND(F${r},8)<=ROUND($B$23,8)),"A",IF(ROUND(F${r},8)<=ROUND($B$24,8),"B","C")))`, 'txt'); });
      b.lab('A43', 'Summe').tot('C43', 'SUM(C28:C42)', 'num').tot('D43', 'SUM(D28:D42)', 'eur').tot('E43', 'SUM(E28:E42)', 'pct').tot('G43', 'SUM(G28:G42)', 'pct');
      b.sec(44, '4. Ergebnis je Klasse');
      b.th(45, ['Klasse', 'Anzahl Artikel', 'Anteil an Artikeln', 'Verbrauchswert', 'Wertanteil', 'Mengenanteil']);
      ['A', 'B', 'C'].forEach((K, j) => { const r = 46 + j, S = j === 0 ? 'res' : 'fx';
        b.txt('A' + r, K + '-Güter').fx('B' + r, `COUNTIF($H$28:$H$42,"${K}")`, 'int').fx('C' + r, `IF($B$25=0,0,B${r}/$B$25)`, 'pct')
          .fx('D' + r, `SUMIFS($D$28:$D$42,$H$28:$H$42,"${K}")`, 'eur')[S]('E' + r, `IF($D$21=0,0,D${r}/$D$21)`, 'pct')[S]('F' + r, `IF($C$43=0,0,SUMIFS($C$28:$C$42,$H$28:$H$42,"${K}")/$C$43)`, 'pct'); });
      b.cells.B46.s = 'res';
      b.lab('A49', 'Gesamt').tot('B49', 'SUM(B46:B48)', 'int').tot('C49', 'SUM(C46:C48)', 'pct').tot('D49', 'SUM(D46:D48)', 'eur').tot('E49', 'SUM(E46:E48)', 'pct').tot('F49', 'SUM(F46:F48)', 'pct');
      b.note('A51', 'Einteilung: Ein Artikel ist A-Gut, solange der kumulierte Wertanteil die A-Grenze nicht überschreitet (der wertvollste Artikel ist immer A), danach B bis zur B-Grenze, der Rest C. Gleiche Verbrauchswerte behalten die Reihenfolge der Eingabe.');
      return { name: 'ABC-Analyse', cols: [24, 22, 14, 17, 13, 17, 15, 10], cells: b.cells, merges: b.merges,
        explain: { D6: 'Verbrauchswert = Jahresverbrauch × Preis je Einheit (auf Cent gerundet).', E6: 'Rang = Anzahl größerer Verbrauchswerte + 1; bei Gleichstand zählt die Reihenfolge der Eingabe (zweites ZÄHLENWENN).', D28: 'KGRÖSSTE holt den k-größten Verbrauchswert, INDEX/VERGLEICH den Artikel mit Rang k – so wird ohne SORTIEREN absteigend sortiert.', H28: 'Klasse nach kumuliertem Wertanteil und den Grenzen aus Abschnitt 2.' } };
    }
  },
  {
    id: 'lagerkennzahlen', cat: 'logistik', title: 'Lagerkennzahlen', file: 'Lagerkennzahlen.xlsx',
    desc: 'Ø Lagerbestand aus 13 Beständen, Umschlagshäufigkeit, Ø Lagerdauer, Lagerzinssatz und Lagerzinsen.', key: ['B26', 'B28', 'B29', 'B31'],
    build() {
      const b = builder(4).title('Lagerkennzahlen', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Jahresverbrauch zu Einstandspreisen (Wareneinsatz)').inp('B5', 600000, 'eur', { min: 0 });
      b.lab('A6', 'Marktzinssatz p. a.').inp('B6', 0.09, 'pct', { min: 0, max: 1 });
      b.lab('A7', 'Tage pro Jahr').inp('B7', 360, 'int', { min: 1, max: 366 });
      b.sec(9, 'Lagerbestände (zu Einstandspreisen)');
      b.th(10, ['Zeitpunkt', 'Bestand']);
      b.lab('A11', 'Anfangsbestand (1. Januar)').inp('B11', 46000, 'eur', { min: 0 });
      const E = [52000, 48000, 55000, 50000, 47000, 53000, 51000, 49000, 54000, 46000, 50000, 49000];
      MONATE.forEach((m, k) => b.lab('A' + (12 + k), 'Endbestand ' + m).inp('B' + (12 + k), E[k], 'eur', { min: 0 }));
      b.sec(25, 'Ergebnis');
      b.lab('A26', 'Ø Lagerbestand (AB + 12 Monatsendbestände) / 13').res('B26', 'SUM(B11:B23)/13', 'eur');
      b.lab('A27', 'Ø Lagerbestand vereinfacht (AB + EB) / 2').fx('B27', '(B11+B23)/2', 'eur');
      b.lab('A28', 'Umschlagshäufigkeit').res('B28', 'IF(OR(B26=0,B5=0),"–",B5/B26)', 'x2').txt('C28', 'Wareneinsatz / Ø Lagerbestand');
      b.lab('A29', 'Ø Lagerdauer (Tage)').res('B29', 'IF(B28="–","–",B7/B28)', 'num').txt('C29', 'Tage pro Jahr / Umschlagshäufigkeit');
      b.lab('A30', 'Lagerzinssatz').fx('B30', 'IF(B29="–","–",B6*B29/B7)', 'pct').txt('C30', 'Marktzins × Ø Lagerdauer / Tage pro Jahr');
      b.lab('A31', 'Lagerzinsen').res('B31', 'IF(B30="–","–",B26*B30)', 'eur').txt('C31', 'Ø Lagerbestand × Lagerzinssatz');
      [28, 29, 30, 31].forEach(r => b.merge(`C${r}:D${r}`));
      b.note('A33', 'Bestände und Verbrauch in Euro zu Einstandspreisen eintragen. Die genauere Formel mit 13 Beständen ist der Standard in Klausuren; (AB + EB) / 2 nur zum Vergleich.');
      return { name: 'Lagerkennzahlen', cols: [46, 18, 24, 20], cells: b.cells, merges: b.merges,
        explain: { B26: 'Ø Lagerbestand = (Jahresanfangsbestand + 12 Monatsendbestände) / 13.', B28: 'Wie oft der Ø Lagerbestand im Jahr umgeschlagen (verbraucht und ersetzt) wird.', B31: 'Lagerzinsen = Ø Lagerbestand × Marktzins × Ø Lagerdauer / 360 – Zinskosten des im Lager gebundenen Kapitals.' } };
    }
  },
  {
    id: 'meldebestand', cat: 'logistik', title: 'Melde-, Sicherheits- und Höchstbestand', file: 'Meldebestand_Sicherheitsbestand_Hoechstbestand.xlsx',
    desc: 'Wann muss bestellt werden? Tagesverbrauch, Sicherheitsbestand, Meldebestand, Höchstbestand und Reichweite.', key: ['B19', 'B20'],
    build() {
      const b = builder(4).title('Melde-, Sicherheits- und Höchstbestand', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Jahresbedarf (Stück)').inp('B5', 9600, 'num', { min: 0 });
      b.lab('A6', 'Arbeitstage pro Jahr').inp('B6', 240, 'int', { min: 1, max: 366 });
      b.lab('A7', 'Beschaffungszeit (Tage)').inp('B7', 12, 'num', { min: 0 });
      b.lab('A8', 'Sicherheitszeit (Tage Reserve)').inp('B8', 5, 'num', { min: 0 });
      b.lab('A9', 'oder Sicherheitsbestand direkt (Stück, leer = aus Sicherheitszeit)').inp('B9', null, 'num', { min: 0 });
      b.lab('A10', 'Bestellmenge (Stück)').inp('B10', 1500, 'num', { min: 0 });
      b.sec(12, 'Ergebnis');
      b.lab('A13', 'Tagesverbrauch (Stück)').fx('B13', 'B5/B6', 'num').txt('C13', 'Jahresbedarf / Arbeitstage');
      b.lab('A14', 'Sicherheitsbestand (Mindestbestand)').res('B14', 'IF(COUNT(B9)=0,B13*B8,B9)', 'num').txt('C14', 'Tagesverbrauch × Sicherheitszeit');
      b.lab('A15', 'Verbrauch während der Beschaffungszeit').fx('B15', 'B13*B7', 'num').txt('C15', 'Tagesverbrauch × Beschaffungszeit');
      b.lab('A16', 'Ø Lagerbestand').fx('B16', 'B14+B10/2', 'num').txt('C16', 'Sicherheitsbestand + Bestellmenge / 2');
      b.lab('A17', 'Reichweite einer Bestellung (Tage)').fx('B17', 'IF(B13=0,"–",B10/B13)', 'num').txt('C17', 'Bestellmenge / Tagesverbrauch');
      b.lab('A19', 'Meldebestand').res('B19', 'B15+B14', 'num').txt('C19', 'Tagesverbrauch × Beschaffungszeit + Sicherheitsbestand');
      b.lab('A20', 'Höchstbestand').res('B20', 'B14+B10', 'num').txt('C20', 'Sicherheitsbestand + Bestellmenge');
      b.lab('A21', 'Prüfung').fx('B21', 'IF(B19>B20,"Meldebestand über Höchstbestand – die Bestellmenge reicht nicht über die Beschaffungszeit","✓ Meldebestand liegt unter dem Höchstbestand")', 'txt');
      [13, 14, 15, 16, 17, 19, 20].forEach(r => b.merge(`C${r}:D${r}`)); b.merge('B21:D21');
      b.note('A23', 'Bestellt wird, sobald der Lagerbestand den Meldebestand erreicht. Bis die Lieferung eintrifft, sinkt er auf den Sicherheitsbestand; mit der Lieferung steigt er auf den Höchstbestand.');
      return { name: 'Meldebestand', cols: [52, 17, 30, 22], cells: b.cells, merges: b.merges,
        explain: { B14: 'Sicherheitsbestand (eiserne Reserve) = Tagesverbrauch × Sicherheitszeit – oder direkt vorgegeben.', B19: 'Meldebestand = Tagesverbrauch × Beschaffungszeit + Sicherheitsbestand.', B20: 'Höchstbestand = Sicherheitsbestand + Bestellmenge (Bestand direkt nach der Lieferung).' } };
    }
  },
  {
    id: 'losgroesse', cat: 'logistik', title: 'Optimale Losgröße (Andler)', file: 'Optimale_Losgroesse_Andler.xlsx',
    desc: 'Kostenminimale Losgröße aus Rüstkosten und Lagerkostensatz, Anzahl Lose, Produktionszyklus und Kostentabelle.', key: ['B13', 'B20'],
    build() {
      const b = builder(7).title('Optimale Losgröße (Andler)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Jahresbedarf / Produktionsmenge p. a. (Stück)').inp('B5', 36000, 'int', { min: 0 });
      b.lab('A6', 'Rüstkosten je Los (auflagefixe Kosten)').inp('B6', 120, 'eur', { min: 0 });
      b.lab('A7', 'Herstellkosten je Stück').inp('B7', 40, 'eur', { min: 0 });
      b.lab('A8', 'Lagerhaltungskostensatz p. a. (Zins + Lagerkosten)').inp('B8', 0.15, 'pct', { min: 0, max: 1 });
      b.lab('A9', 'Tage pro Jahr').inp('B9', 360, 'int', { min: 1, max: 366 });
      const ok = 'AND(B5>0,B6>0,B12>0)';
      b.sec(11, 'Ergebnis');
      b.lab('A12', 'Lagerhaltungskosten je Stück und Jahr').fx('B12', 'B7*B8', 'eur');
      b.lab('A13', 'Optimale Losgröße x_opt').res('B13', `IF(${ok},SQRT(2*B5*B6/B12),"nicht bestimmbar")`, 'num');
      b.lab('A14', 'Optimale Losgröße (gerundet)').fx('B14', `IF(${ok},ROUND(B13,0),"–")`, 'stk');
      b.lab('A15', 'Anzahl Lose pro Jahr').fx('B15', `IF(${ok},B5/B13,"–")`, 'num');
      b.lab('A16', 'Produktionszyklus (Tage)').fx('B16', `IF(${ok},B9*B13/B5,"–")`, 'num');
      b.lab('A17', 'Ø Lagerbestand (Stück)').fx('B17', `IF(${ok},B13/2,"–")`, 'num');
      b.lab('A18', 'Rüstkosten p. a.').fx('B18', `IF(${ok},B5/B13*B6,"–")`, 'eur');
      b.lab('A19', 'Lagerhaltungskosten p. a.').fx('B19', `IF(${ok},B13/2*B12,"–")`, 'eur');
      b.lab('A20', 'Minimale losgrößenabhängige Kosten').res('B20', `IF(${ok},B18+B19,"–")`, 'eur');
      b.sec(22, 'Kostenverlauf für verschiedene Losgrößen');
      b.lab('A23', 'Schrittweite der Tabelle (Stück)').inp('B23', 200, 'int', { min: 1 });
      b.th(25, ['Losgröße', 'Anzahl Lose', 'Ø Lagerbestand', 'Rüstkosten', 'Lagerhaltungskosten', 'Gesamtkosten', 'Hinweis']);
      range(1, 14).forEach(k => { const r = 25 + k;
        b.fx('A' + r, `${k}*$B$23`, 'int').fx('B' + r, `$B$5/A${r}`, 'num').fx('C' + r, `A${r}/2`, 'num').fx('D' + r, `B${r}*$B$6`, 'eur')
          .fx('E' + r, `C${r}*$B$12`, 'eur').fx('F' + r, `D${r}+E${r}`, 'eur').fx('G' + r, `IF(F${r}=MIN($F$26:$F$39),"← günstigste Zeile","")`, 'txt'); });
      b.note('A41', 'Klassisches Losgrößenmodell: Lagerzugang des ganzen Loses auf einmal, Ø Lagerbestand = x / 2. Lagerkosten auf Basis der Herstellkosten. Im Optimum sind Rüst- und Lagerkosten gleich hoch.');
      return { name: 'Losgröße', cols: [46, 16, 16, 16, 19, 16, 22], cells: b.cells, merges: b.merges, chart: { x: 'A26:A39', series: [['Rüstkosten', 'D26:D39'], ['Lagerhaltungskosten', 'E26:E39'], ['Gesamtkosten', 'F26:F39']] },
        explain: { B13: 'Andler-Losgröße: √(2 · Jahresbedarf · Rüstkosten / (Herstellkosten · Lagerhaltungskostensatz)).', B18: 'Rüstkosten = Anzahl Lose × Rüstkosten je Los – sinken mit größeren Losen.', B19: 'Lagerkosten = Ø Lagerbestand (x / 2) × Herstellkosten × Lagerhaltungskostensatz – steigen mit größeren Losen.' } };
    }
  },
  {
    id: 'produktivitaet', cat: 'controlling', title: 'Produktivität, Wirtschaftlichkeit & Rentabilität', file: 'Produktivitaet_Wirtschaftlichkeit_Rentabilitaet.xlsx',
    desc: 'Kennzahlenblatt: Arbeits-, Maschinen- und Materialproduktivität, Wirtschaftlichkeit, Rentabilitäten, Auslastung.', key: ['B20', 'B25', 'B27', 'B23'],
    build() {
      const b = builder(4).title('Produktivität, Wirtschaftlichkeit & Rentabilität', SUB);
      b.sec(4, 'Mengen (Produktivität und Kapazität)');
      b.lab('A5', 'Ausbringungsmenge (Stück)').inp('B5', 48000, 'num', { min: 0 });
      b.lab('A6', 'Arbeitsstunden').inp('B6', 6000, 'num', { min: 0 });
      b.lab('A7', 'Maschinenstunden').inp('B7', 3200, 'num', { min: 0 });
      b.lab('A8', 'Materialeinsatz (kg)').inp('B8', 24000, 'num', { min: 0 });
      b.lab('A9', 'Kapazität (maximale Ausbringung, Stück)').inp('B9', 60000, 'num', { min: 0 });
      b.sec(11, 'Werte (Wirtschaftlichkeit und Rentabilität)');
      b.lab('A12', 'Leistung / Ertrag (Umsatzerlöse)').inp('B12', 2400000, 'eur', { min: 0 });
      b.lab('A13', 'Kosten / Aufwand').inp('B13', 2000000, 'eur', { min: 0 });
      b.lab('A14', 'darin enthaltene Fremdkapitalzinsen').inp('B14', 75000, 'eur', { min: 0 });
      b.lab('A15', 'Eigenkapital').inp('B15', 1000000, 'eur', { min: 0 });
      b.lab('A16', 'Fremdkapital').inp('B16', 1500000, 'eur', { min: 0 });
      b.sec(18, 'Kennzahlen');
      b.th(19, ['Kennzahl', 'Wert', 'Formel', 'Einschätzung']);
      const K = [
        ['Arbeitsproduktivität (Stück je Arbeitsstunde)', 'IFERROR(B5/B6,"–")', 'x2', 'Ausbringung / Arbeitsstunden', ''],
        ['Maschinenproduktivität (Stück je Maschinenstunde)', 'IFERROR(B5/B7,"–")', 'x2', 'Ausbringung / Maschinenstunden', ''],
        ['Materialproduktivität (Stück je kg)', 'IFERROR(B5/B8,"–")', 'x2', 'Ausbringung / Materialeinsatz', ''],
        ['Kapazitätsauslastung (Beschäftigungsgrad)', 'IFERROR(B5/B9,"–")', 'pct', 'Ist-Ausbringung / Kapazität', 'IF(B23="–","",IF(B23>1,"über 100 % – Eingaben prüfen",IF(B23=1,"Vollauslastung","freie Kapazität vorhanden")))'],
        ['Freie Kapazität (Stück)', 'B9-B5', 'num', 'Kapazität − Ist-Ausbringung', ''],
        ['Wirtschaftlichkeit', 'IFERROR(B12/B13,"–")', 'x2', 'Leistung / Kosten (Ertrag / Aufwand)', 'IF(B25="–","",IF(B25>1,"wirtschaftlich (> 1)",IF(B25=1,"gerade kostendeckend (= 1)","unwirtschaftlich (< 1)")))'],
        ['Gewinn', 'B12-B13', 'eur', 'Leistung − Kosten', ''],
        ['Eigenkapitalrentabilität', 'IFERROR(B26/B15,"–")', 'pct', 'Gewinn / Eigenkapital', ''],
        ['Gesamtkapitalrentabilität', 'IFERROR((B26+B14)/(B15+B16),"–")', 'pct', '(Gewinn + FK-Zinsen) / (EK + FK)', ''],
        ['Umsatzrentabilität', 'IFERROR(B26/B12,"–")', 'pct', 'Gewinn / Umsatzerlöse', '']];
      K.forEach(([t, f, fm, txt, ev], k) => { const r = 20 + k; b.lab('A' + r, t).res('B' + r, f, fm).txt('C' + r, txt); if (ev) b.fx('D' + r, ev, 'txt'); });
      ['B24', 'B26'].forEach(r => { b.cells[r].s = 'out'; });
      b.note('A31', 'Produktivität = mengenmäßiges Verhältnis (Output / Input), Wirtschaftlichkeit = wertmäßiges Verhältnis, Rentabilität = Gewinn im Verhältnis zum eingesetzten Kapital bzw. Umsatz.');
      return { name: 'Kennzahlen', cols: [46, 16, 36, 30], cells: b.cells, merges: b.merges,
        explain: { B20: 'Produktivität = Ausbringungsmenge / Einsatzmenge eines Faktors (hier Arbeitsstunden).', B25: 'Wirtschaftlichkeit = Leistung / Kosten. Über 1 heißt: Es wird mehr erwirtschaftet als verbraucht.', B28: 'Gesamtkapitalrentabilität: Gewinn plus FK-Zinsen, weil die Zinsen das Entgelt der Fremdkapitalgeber sind.' } };
    }
  },
  {
    id: 'preisabsatz', cat: 'marketing', title: 'Preis-Absatz-Funktion, Cournot-Punkt & Preiselastizität', file: 'Preis-Absatz-Funktion_Cournot_Elastizitaet.xlsx',
    desc: 'Lineare PAF im Monopol: Erlösmaximum, Cournot-Punkt, Gewinnschwellen und Preiselastizität (Punkt/Bogen).', key: ['B17', 'B18', 'B21'],
    build() {
      const b = builder(6).title('Preis-Absatz-Funktion, Cournot-Punkt & Preiselastizität', SUB);
      b.sec(4, 'Eingaben: p(x) = a − b · x und K(x) = Kf + kv · x');
      b.lab('A5', 'Höchstpreis a (Prohibitivpreis)').inp('B5', 100, 'eur', { min: 0 });
      b.lab('A6', 'Steigung b (Preissenkung je Stück)').inp('B6', 0.5, 'f4', { min: 0.0001 });
      b.lab('A7', 'Fixkosten Kf').inp('B7', 1000, 'eur', { min: 0 });
      b.lab('A8', 'Variable Stückkosten kv').inp('B8', 20, 'eur', { min: 0 });
      b.sec(10, 'Erlösmaximum');
      b.lab('A11', 'Sättigungsmenge (p = 0)').fx('B11', 'B5/B6', 'num').txt('C11', 'x = a / b').merge('C11:F11');
      b.lab('A12', 'Erlösmaximale Menge').fx('B12', 'B5/(2*B6)', 'num').txt('C12', 'E\'(x) = a − 2bx = 0  →  x = a / 2b').merge('C12:F12');
      b.lab('A13', 'Erlösmaximaler Preis').fx('B13', 'B5-B6*B12', 'eur').txt('C13', 'p = a / 2').merge('C13:F13');
      b.lab('A14', 'Maximaler Umsatzerlös').fx('B14', 'B13*B12', 'eur').txt('C14', 'E = p · x').merge('C14:F14');
      const ok = 'B5>B8';
      b.sec(16, 'Gewinnmaximum (Cournot-Punkt)');
      b.lab('A17', 'Gewinnmaximale Menge x_C').res('B17', `IF(${ok},(B5-B8)/(2*B6),"keine – kv ≥ Höchstpreis")`, 'num').txt('C17', 'Grenzerlös = Grenzkosten: a − 2bx = kv').merge('C17:F17');
      b.lab('A18', 'Cournot-Preis p_C').res('B18', `IF(${ok},B5-B6*B17,"–")`, 'eur').txt('C18', 'p_C = a − b · x_C').merge('C18:F18');
      b.lab('A19', 'Umsatzerlös im Cournot-Punkt').fx('B19', `IF(${ok},B18*B17,"–")`, 'eur');
      b.lab('A20', 'Gesamtkosten im Cournot-Punkt').fx('B20', `IF(${ok},B7+B8*B17,"–")`, 'eur');
      b.lab('A21', 'Maximaler Gewinn').res('B21', `IF(${ok},B19-B20,"–")`, 'eur');
      const D = '(B5-B8)^2-4*B6*B7', okD = `AND(${ok},${D}>=0)`;
      b.lab('A22', 'Gewinnschwelle (untere Menge)').fx('B22', `IF(${okD},((B5-B8)-SQRT(${D}))/(2*B6),"keine")`, 'num').txt('C22', 'G(x) = 0: x = [(a − kv) ∓ √((a − kv)² − 4b·Kf)] / 2b').merge('C22:F22');
      b.lab('A23', 'Gewinngrenze (obere Menge)').fx('B23', `IF(${okD},((B5-B8)+SQRT(${D}))/(2*B6),"keine")`, 'num');
      b.sec(25, 'Preiselastizität der Nachfrage');
      b.lab('A26', 'Preis für die Punktelastizität').inp('B26', 60, 'eur', { min: 0 });
      b.lab('A27', 'Menge bei diesem Preis (aus der PAF)').fx('B27', 'IF(B26>=B5,0,(B5-B26)/B6)', 'num');
      const ev = c => `IF(${c}="–","",IF(ROUND(ABS(${c}),10)>1,"elastisch (|ε| > 1)",IF(ROUND(ABS(${c}),10)<1,"unelastisch (|ε| < 1)","proportional elastisch (|ε| = 1)")))`;
      b.lab('A28', 'Punktelastizität ε = −p / (a − p)').res('B28', 'IF(B26>=B5,"–",-B26/(B5-B26))', 'x2').fx('C28', ev('B28'), 'txt').merge('C28:F28');
      b.lab('A29', 'Punktelastizität im Cournot-Punkt').fx('B29', `IF(${ok},-B18/(B5-B18),"–")`, 'x2').fx('C29', ev('B29'), 'txt').merge('C29:F29');
      b.th(31, ['Bogenelastizität (Marktbeobachtung)', 'Preis', 'Menge']);
      b.lab('A32', 'Ausgangssituation (1)').inp('B32', 10, 'eur', { min: 0 }).inp('C32', 1000, 'num', { min: 0 });
      b.lab('A33', 'Neue Situation (2)').inp('B33', 12, 'eur', { min: 0 }).inp('C33', 900, 'num', { min: 0 });
      b.lab('A34', 'Elastizität (Basis Ausgangswerte)').fx('B34', 'IFERROR(((C33-C32)/C32)/((B33-B32)/B32),"–")', 'x2').fx('C34', ev('B34'), 'txt').merge('C34:F34');
      b.lab('A35', 'Bogenelastizität (Mittelwertformel)').res('B35', 'IFERROR(((C33-C32)/((C32+C33)/2))/((B33-B32)/((B32+B33)/2)),"–")', 'x2').fx('C35', ev('B35'), 'txt').merge('C35:F35');
      b.sec(37, 'Wertetabelle');
      b.th(38, ['Menge x', 'Preis p', 'Umsatzerlös', 'Gesamtkosten', 'Gewinn', 'Grenzerlös']);
      range(0, 10).forEach(k => { const r = 39 + k;
        b.fx('A' + r, `$B$11/10*${k}`, 'num').fx('B' + r, `$B$5-$B$6*A${r}`, 'eur').fx('C' + r, `A${r}*B${r}`, 'eur').fx('D' + r, `$B$7+$B$8*A${r}`, 'eur').fx('E' + r, `C${r}-D${r}`, 'eur').fx('F' + r, `$B$5-2*$B$6*A${r}`, 'eur'); });
      b.note('A51', 'Im Monopol setzt der Anbieter den Preis entlang der Preis-Absatz-Funktion. Gewinnmaximum, wo Grenzerlös = Grenzkosten. Elastizitäten sind negativ (Preis rauf → Menge runter); bewertet wird der Betrag.');
      return { name: 'Preis-Absatz', cols: [42, 16, 16, 16, 16, 16], cells: b.cells, merges: b.merges, chart: { x: 'A39:A49', series: [['Umsatzerlös', 'C39:C49'], ['Gesamtkosten', 'D39:D49']] },
        explain: { B17: 'Gewinn G = (a − bx)·x − Kf − kv·x; G\'(x) = a − 2bx − kv = 0 → x = (a − kv) / 2b.', B28: 'Punktelastizität = (dx/dp) · (p/x) = −(1/b) · p / x; bei linearer PAF −p / (a − p).', B35: 'Bogenelastizität mit Mittelwerten: relative Mengenänderung / relative Preisänderung, jeweils bezogen auf den Durchschnitt.' } };
    }
  },
  {
    id: 'marketingkennzahlen', cat: 'marketing', title: 'Marketing-Kennzahlen & Customer Lifetime Value', file: 'Marketing-Kennzahlen_CLV.xlsx',
    desc: 'Marktanteil, relativer Marktanteil, Sättigungsgrad, CAC, ROAS und Customer Lifetime Value mit Abzinsung.', key: ['B11', 'B12', 'B21', 'B43'],
    build() {
      const b = builder(6).title('Marketing-Kennzahlen & Customer Lifetime Value', SUB);
      b.sec(4, '1. Markt');
      b.lab('A5', 'Eigener Umsatz (bzw. Absatz)').inp('B5', 12000000, 'eur', { min: 0 });
      b.lab('A6', 'Umsatz des stärksten Konkurrenten').inp('B6', 18000000, 'eur', { min: 0 });
      b.lab('A7', 'Marktvolumen (Umsatz aller Anbieter)').inp('B7', 60000000, 'eur', { min: 0 });
      b.lab('A8', 'Marktpotenzial (maximal mögliches Volumen)').inp('B8', 80000000, 'eur', { min: 0 });
      b.note('A9', 'Ist das eigene Unternehmen Marktführer, beim Konkurrenten den zweitgrößten Anbieter eintragen.');
      b.lab('A11', 'Marktanteil').res('B11', 'IFERROR(B5/B7,"–")', 'pct').txt('C11', 'Eigener Umsatz / Marktvolumen');
      b.lab('A12', 'Relativer Marktanteil').res('B12', 'IFERROR(B5/B6,"–")', 'x2').txt('C12', 'Eigener Umsatz / Umsatz stärkster Konkurrent');
      b.lab('A13', 'Sättigungsgrad').fx('B13', 'IFERROR(B7/B8,"–")', 'pct').txt('C13', 'Marktvolumen / Marktpotenzial');
      b.lab('A14', 'Noch nicht ausgeschöpftes Potenzial').fx('B14', 'B8-B7', 'eur').txt('C14', 'Marktpotenzial − Marktvolumen');
      b.sec(16, '2. Kundengewinnung und Werbung');
      b.lab('A17', 'Kosten der Neukundengewinnung (Marketing + Vertrieb)').inp('B17', 50000, 'eur', { min: 0 });
      b.lab('A18', 'Anzahl gewonnener Neukunden').inp('B18', 250, 'int', { min: 0 });
      b.lab('A19', 'Werbeausgaben (Ad Spend)').inp('B19', 20000, 'eur', { min: 0 });
      b.lab('A20', 'Durch die Werbung erzielter Umsatz').inp('B20', 90000, 'eur', { min: 0 });
      b.lab('A21', 'Customer Acquisition Cost (CAC)').fx('B21', 'IFERROR(B17/B18,"–")', 'eur').txt('C21', 'Akquisitionskosten / Neukunden');
      b.lab('A22', 'Return on Advertising Spend (ROAS)').fx('B22', 'IFERROR(B20/B19,"–")', 'x2').txt('C22', 'Werbeumsatz / Werbeausgaben (€ Umsatz je 1 € Werbung)');
      b.lab('A23', 'ROAS in Prozent').fx('B23', 'B22', 'pct');
      [11, 12, 13, 14, 21, 22].forEach(r => b.merge(`C${r}:F${r}`));
      b.sec(24, '3. Customer Lifetime Value (CLV)');
      b.lab('A25', 'Deckungsbeitrag je Kunde und Jahr').inp('B25', 200, 'eur');
      b.lab('A26', 'Kundenbindungsrate (Wiederkaufrate)').inp('B26', 0.8, 'pct', { min: 0, max: 1 });
      b.lab('A27', 'Kalkulationszinssatz').inp('B27', 0.1, 'pct', { min: 0, max: 1 });
      b.lab('A28', 'Betrachtungszeitraum (1 – 10 Jahre)').inp('B28', 5, 'int', { min: 1, max: 10 });
      b.th(30, ['Jahr', 'Bindungs-wahrscheinlichkeit', 'Erwarteter DB', 'Abzinsungsfaktor', 'Barwert']);
      range(1, 10).forEach(k => { const r = 30 + k, e = `A${r}=""`;
        b.fx('A' + r, `IF(${k}<=$B$28,${k},"")`, 'int').fx('B' + r, `IF(${e},"",$B$26^(A${r}-1))`, 'pct').fx('C' + r, `IF(${e},"",$B$25*B${r})`, 'eur')
          .fx('D' + r, `IF(${e},"",1/(1+$B$27)^A${r})`, 'f4').fx('E' + r, `IF(${e},"",C${r}*D${r})`, 'eur'); });
      b.lab('A41', 'CLV brutto (Summe der Barwerte)').fx('B41', 'SUM(E31:E40)', 'eur');
      b.lab('A42', '− Akquisitionskosten je Kunde (CAC)').fx('B42', 'IF(B21="–",0,B21)', 'eur');
      b.lab('A43', 'Customer Lifetime Value (netto)').res('B43', 'B41-B42', 'eur');
      b.lab('A44', 'Verhältnis CLV brutto / CAC').fx('B44', 'IF(B42=0,"–",B41/B42)', 'x2');
      b.note('A46', 'Im ersten Jahr ist der Neukunde sicher Kunde; danach bleibt er jedes Jahr mit der Bindungsrate. Der DB fällt jeweils am Jahresende an: Barwert = DB · r^(t−1) / (1 + i)^t.');
      return { name: 'Marketing-KPIs', cols: [50, 18, 17, 17, 17, 14], cells: b.cells, merges: b.merges,
        explain: { B11: 'Marktanteil = eigener Umsatz / Marktvolumen.', B12: 'Relativer Marktanteil = eigener Marktanteil / Marktanteil des stärksten Konkurrenten (über 1 = Marktführer).', B43: 'CLV = Σ DB · r^(t−1) / (1 + i)^t − Akquisitionskosten: abgezinster Wert aller künftigen Deckungsbeiträge eines Kunden.' } };
    }
  },
  {
    id: 'nutzwertanalyse', cat: 'controlling', title: 'Nutzwertanalyse', file: 'Nutzwertanalyse.xlsx',
    desc: 'Bis 8 Kriterien gewichten, 3 Alternativen bepunkten – gewichtete Nutzwerte, Rangfolge und Gewinner.', key: ['B24', 'B20', 'B21', 'B22'],
    build() {
      const b = builder(8).title('Nutzwertanalyse', SUB);
      b.sec(4, '1. Kriterien, Gewichte und Punkte (Skala 0 – 10)');
      b.th(5, ['Kriterium', 'Gewicht', 'Punkte', 'Punkte', 'Punkte', 'Gewichtet', 'Gewichtet', 'Gewichtet']);
      b.lab('A6', 'Alternative →').inp('C6', 'Lieferant A', 'txt').inp('D6', 'Lieferant B', 'txt').inp('E6', 'Lieferant C', 'txt').fx('F6', 'C6', 'txt').fx('G6', 'D6', 'txt').fx('H6', 'E6', 'txt');
      const K = [['Preis', 0.3, 6, 9, 7], ['Qualität', 0.25, 9, 6, 7], ['Service', 0.15, 7, 5, 8], ['Lieferzeit', 0.1, 5, 8, 7], ['Umweltverträglichkeit', 0.1, 8, 6, 7], ['Zahlungsbedingungen', 0.1, 6, 7, 5]];
      range(7, 14).forEach((r, k) => { const d = K[k];
        if (d) { b.inp('A' + r, d[0], 'txt').inp('B' + r, d[1], 'pct1', { min: 0, max: 1 }); ['C', 'D', 'E'].forEach((X, j) => b.inp(X + r, d[2 + j], 'num', { min: 0, max: 10 })); }
        else { b.inp('A' + r, null, 'txt').inp('B' + r, null, 'pct1', { min: 0, max: 1 }); ['C', 'D', 'E'].forEach(X => b.inp(X + r, null, 'num', { min: 0, max: 10 })); }
        [['F', 'C'], ['G', 'D'], ['H', 'E']].forEach(([Y, X]) => b.fx(Y + r, `IF(COUNT(B${r})=0,"",B${r}*${X}${r})`, 'x2')); });
      b.lab('A15', 'Summe / Nutzwert').tot('B15', 'SUM(B7:B14)', 'pct1').tot('F15', 'ROUND(SUM(F7:F14),6)', 'x2').tot('G15', 'ROUND(SUM(G7:G14),6)', 'x2').tot('H15', 'ROUND(SUM(H7:H14),6)', 'x2');
      b.lab('A16', 'Prüfung Gewichte').fx('B16', 'IF(ROUND(B15,6)=1,"✓ 100 %","≠ 100 % – Gewichte anpassen")', 'txt').merge('B16:E16');
      b.sec(18, '2. Ergebnis');
      b.th(19, ['Alternative', 'Nutzwert', 'Rang']);
      [['C6', 'F15'], ['D6', 'G15'], ['E6', 'H15']].forEach(([n, s], k) => { const r = 20 + k;
        b.fx('A' + r, n, 'txt').res('B' + r, s, 'x2').fx('C' + r, `1+COUNTIF($B$20:$B$22,">"&B${r})`, 'int'); });
      b.cells.B20.s = 'res';
      b.lab('A24', 'Beste Alternative').res('B24', 'IF(ROUND(B15,6)<>1,"Gewichte ergeben nicht 100 % – bitte prüfen",IF(COUNTIF(B20:B22,MAX(B20:B22))>1,"Gleichstand – keine eindeutige Entscheidung",INDEX(A20:A22,MATCH(MAX(B20:B22),B20:B22,0))))', 'txt').merge('B24:E24');
      b.note('A26', 'Nutzwert = Σ (Gewicht × Punkte). Die Gewichte müssen zusammen 100 % ergeben. Gleiche Nutzwerte bekommen denselben Rang. Freie Kriterienzeilen einfach leer lassen.');
      return { name: 'Nutzwertanalyse', cols: [30, 12, 13, 13, 13, 13, 13, 13], cells: b.cells, merges: b.merges,
        explain: { F7: 'Teilnutzwert = Gewicht des Kriteriums × vergebene Punkte.', F15: 'Nutzwert der Alternative = Summe der Teilnutzwerte.', C20: 'Rang = 1 + Anzahl Alternativen mit höherem Nutzwert.', B24: 'Die Alternative mit dem höchsten Nutzwert – nur wenn die Gewichte 100 % ergeben und kein Gleichstand vorliegt.' } };
    }
  },
  {
    id: 'liquiditaetsplan', cat: 'controlling', title: 'Liquiditätsplan (12 Monate)', file: 'Liquiditaetsplan_12_Monate.xlsx',
    desc: 'Ein- und Auszahlungen je Monat, Endbestände, Unterdeckungen und Inanspruchnahme der Kreditlinie.', key: ['B41', 'B43', 'B44'],
    build() {
      const b = builder(8).title('Liquiditätsplan (12 Monate)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Zahlungsmittelbestand am Jahresanfang').inp('B5', 20000, 'eur');
      b.lab('A6', 'Kreditlinie (Kontokorrent)').inp('B6', 30000, 'eur', { min: 0 });
      b.sec(8, '1. Einzahlungen und Auszahlungen je Monat');
      b.th(9, ['Monat', 'Einzahlungen aus Umsätzen', 'Sonstige Einzahlungen', 'Auszahlungen Material / Waren', 'Auszahlungen Personal', 'Sonstige Auszahlungen (Miete, Zinsen, Steuern)', 'Investitionen / Tilgung']);
      const D = [[40000, 0, 15000, 20000, 8000, 0], [35000, 0, 14000, 20000, 8000, 0], [42000, 0, 16000, 20000, 8000, 25000], [50000, 2000, 18000, 20000, 8000, 0],
        [55000, 0, 19000, 20000, 8000, 0], [60000, 0, 20000, 22000, 8000, 0], [58000, 0, 20000, 20000, 8000, 5000], [45000, 0, 17000, 20000, 8000, 0],
        [52000, 0, 18000, 20000, 8000, 0], [56000, 0, 19000, 20000, 8000, 0], [62000, 0, 21000, 32000, 8000, 0], [48000, 3000, 17000, 20000, 8000, 10000]];
      const C = ['B', 'C', 'D', 'E', 'F', 'G'];
      MONATE.forEach((m, k) => { const r = 10 + k; b.lab('A' + r, m); C.forEach((X, j) => b.inp(X + r, D[k][j], 'eur', { min: 0 })); });
      b.lab('A22', 'Summe'); C.forEach(X => b.tot(X + 22, `SUM(${X}10:${X}21)`, 'eur'));
      b.sec(24, '2. Liquiditätsplan');
      b.th(25, ['Monat', 'Anfangsbestand', 'Einzahlungen', 'Auszahlungen', 'Überschuss / Fehlbetrag', 'Endbestand', 'Inanspruchnahme Kreditlinie', 'Status']);
      MONATE.forEach((m, k) => { const r = 26 + k, s = 10 + k;
        b.lab('A' + r, m).fx('B' + r, k === 0 ? '$B$5' : `F${r - 1}`, 'eur').fx('C' + r, `B${s}+C${s}`, 'eur').fx('D' + r, `SUM(D${s}:G${s})`, 'eur')
          .fx('E' + r, `C${r}-D${r}`, 'eur').fx('F' + r, `B${r}+E${r}`, 'eur').fx('G' + r, `MAX(0,-F${r})`, 'eur')
          .fx('H' + r, `IF(F${r}>=0,"gedeckt",IF(G${r}<=$B$6,"⚠ Unterdeckung – Kreditlinie","⚠ Unterdeckung über Kreditlinie!"))`, 'txt'); });
      b.lab('A38', 'Summe').tot('C38', 'SUM(C26:C37)', 'eur').tot('D38', 'SUM(D26:D37)', 'eur').tot('E38', 'SUM(E26:E37)', 'eur');
      b.sec(40, 'Ergebnis');
      b.lab('A41', 'Endbestand Dezember').res('B41', 'F37', 'eur');
      b.lab('A42', 'Niedrigster Endbestand').fx('B42', 'MIN(F26:F37)', 'eur').fx('C42', 'INDEX(A26:A37,MATCH(B42,F26:F37,0))', 'txt');
      b.lab('A43', 'Maximaler Kreditbedarf').res('B43', 'MAX(G26:G37)', 'eur');
      b.lab('A44', 'Monate mit Unterdeckung').res('B44', 'COUNTIF(F26:F37,"<0")', 'int');
      b.lab('A45', 'Monate über der Kreditlinie').fx('B45', 'COUNTIF(G26:G37,">"&B6)', 'int');
      b.lab('A46', 'Einschätzung').fx('B46', 'IF(B45>0,"Kreditlinie reicht nicht – Zahlungen verschieben oder Linie erhöhen",IF(B44>0,"Kreditlinie deckt alle Unterdeckungen","Liquidität in allen Monaten gesichert"))', 'txt').merge('B46:H46');
      b.note('A48', 'Endbestand = Anfangsbestand + Einzahlungen − Auszahlungen; der Endbestand ist der Anfangsbestand des Folgemonats. Ein negativer Endbestand wird über die Kreditlinie finanziert (Zinsen darauf nicht eingerechnet).');
      return { name: 'Liquiditätsplan', cols: [30, 17, 15, 17, 17, 18, 17, 30], cells: b.cells, merges: b.merges,
        explain: { F26: 'Endbestand = Anfangsbestand + Einzahlungen − Auszahlungen.', G26: 'Negativer Endbestand = benötigter Kontokorrentkredit.', B43: 'Höchste Inanspruchnahme der Kreditlinie im Jahr.' } };
    }
  },
  {
    id: 'sollist', cat: 'controlling', title: 'Soll-Ist-Vergleich (Budgetabweichung)', file: 'Soll-Ist-Vergleich_Budgetabweichung.xlsx',
    desc: 'Bis 10 Positionen: absolute und relative Abweichung, günstig/ungünstig und Ampel nach Toleranzgrenzen.', key: ['D25', 'E25', 'B27'],
    build() {
      const b = builder(8).title('Soll-Ist-Vergleich (Budgetabweichung)', SUB);
      b.sec(4, 'Toleranzgrenzen für ungünstige Abweichungen');
      b.lab('A5', 'Grün bis (relative Abweichung)').inp('B5', 0.05, 'pct', { min: 0, max: 10 });
      b.lab('A6', 'Gelb bis (darüber Rot)').inp('B6', 0.1, 'pct', { min: 0, max: 10 });
      b.sec(8, 'Positionen (Art: 1 = Kosten, 2 = Erlös)');
      b.th(9, ['Position', 'Art (1 / 2)', 'Soll (Plan)', 'Ist', 'Abweichung absolut', 'Abweichung relativ', 'Bewertung', 'Ampel']);
      const P = [['Umsatzerlöse Produkt A', 2, 500000, 520000], ['Umsatzerlöse Produkt B', 2, 300000, 270000], ['Materialkosten', 1, 200000, 215000], ['Personalkosten', 1, 250000, 248000],
        ['Energiekosten', 1, 30000, 36000], ['Miete', 1, 48000, 48000], ['Abschreibungen', 1, 40000, 40000], ['Marketing', 1, 25000, 22000], ['Sonstige Kosten', 1, 15000, 15600]];
      range(10, 19).forEach((r, k) => { const d = P[k], act = `COUNT(C${r}:D${r})=0`;
        if (d) b.inp('A' + r, d[0], 'txt').inp('B' + r, d[1], 'int', { min: 1, max: 2 }).inp('C' + r, d[2], 'eur', { min: 0 }).inp('D' + r, d[3], 'eur', { min: 0 });
        else b.inp('A' + r, null, 'txt').inp('B' + r, null, 'int', { min: 1, max: 2 }).inp('C' + r, null, 'eur', { min: 0 }).inp('D' + r, null, 'eur', { min: 0 });
        b.fx('E' + r, `IF(${act},"",D${r}-C${r})`, 'eur').fx('F' + r, `IF(${act},"",IF(C${r}=0,"–",(D${r}-C${r})/C${r}))`, 'pct1')
          .fx('G' + r, `IF(${act},"",IF(E${r}=0,"planmäßig",IF(B${r}=2,IF(E${r}>0,"günstig","ungünstig"),IF(E${r}<0,"günstig","ungünstig"))))`, 'txt')
          .fx('H' + r, `IF(${act},"",IF(G${r}<>"ungünstig","Grün",IF(F${r}="–","Rot",IF(ROUND(ABS(F${r}),10)<=$B$5,"Grün",IF(ROUND(ABS(F${r}),10)<=$B$6,"Gelb","Rot")))))`, 'txt'); });
      b.sec(21, 'Zusammenfassung');
      b.th(22, ['', '', 'Soll', 'Ist', 'Abweichung absolut', 'Abweichung relativ']);
      b.lab('A23', 'Erlöse').fx('C23', 'SUMIFS(C10:C19,B10:B19,2)', 'eur').fx('D23', 'SUMIFS(D10:D19,B10:B19,2)', 'eur').fx('E23', 'D23-C23', 'eur').fx('F23', 'IF(C23=0,"–",E23/C23)', 'pct1');
      b.lab('A24', 'Kosten').fx('C24', 'SUM(C10:C19)-C23', 'eur').fx('D24', 'SUM(D10:D19)-D23', 'eur').fx('E24', 'D24-C24', 'eur').fx('F24', 'IF(C24=0,"–",E24/C24)', 'pct1');
      b.lab('A25', 'Ergebnis (Erlöse − Kosten)').tot('C25', 'C23-C24', 'eur').res('D25', 'D23-D24', 'eur').res('E25', 'D25-C25', 'eur').fx('F25', 'IF(C25=0,"–",E25/ABS(C25))', 'pct1');
      b.lab('A27', 'Positionen mit Ampel Rot').res('B27', 'COUNTIF(H10:H19,"Rot")', 'int');
      b.lab('A28', 'Positionen mit Ampel Gelb').fx('B28', 'COUNTIF(H10:H19,"Gelb")', 'int');
      b.note('A30', 'Abweichung = Ist − Soll. Bei Kosten ist eine Überschreitung ungünstig, bei Erlösen eine Unterschreitung. Die Ampel bewertet nur ungünstige Abweichungen: bis Grün-Grenze Grün, bis Gelb-Grenze Gelb, darüber Rot. Art leer = Kosten.');
      return { name: 'Soll-Ist', cols: [30, 11, 15, 15, 17, 15, 14, 10], cells: b.cells, merges: b.merges,
        explain: { E10: 'Absolute Abweichung = Ist − Soll.', F10: 'Relative Abweichung = (Ist − Soll) / Soll.', H10: 'Ampel nach Toleranzgrenzen – günstige Abweichungen sind immer Grün.', E25: 'Ergebnisabweichung = Ist-Ergebnis − Soll-Ergebnis.' } };
    }
  },
  {
    id: 'personalbedarf', cat: 'controlling', title: 'Personalbedarfsplanung', file: 'Personalbedarfsplanung.xlsx',
    desc: 'Vom Einsatzbedarf über Reserve- und Bruttobedarf zum Nettopersonalbedarf – mit Abgängen und Zugängen.', key: ['B27', 'B28'],
    build() {
      const b = builder(4).title('Personalbedarfsplanung', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Gesamter Arbeitszeitbedarf (Stunden pro Jahr)').inp('B5', 198000, 'num', { min: 0 });
      b.lab('A6', 'Soll-Arbeitszeit je Mitarbeiter (Stunden pro Jahr)').inp('B6', 1650, 'num', { min: 1 });
      b.lab('A7', 'oder Einsatzbedarf direkt (Mitarbeiter, leer = aus Arbeitszeit)').inp('B7', null, 'num', { min: 0 });
      b.lab('A8', 'Ausfallquote (Urlaub, Krankheit, Fortbildung)').inp('B8', 0.1, 'pct', { min: 0, max: 1 });
      b.lab('A9', 'Personalbestand zu Beginn der Planperiode').inp('B9', 125, 'num', { min: 0 });
      b.th(11, ['Feststehende Abgänge', 'Anzahl', 'Feststehende Zugänge', 'Anzahl']);
      b.lab('A12', 'Ruhestand').inp('B12', 4, 'num', { min: 0 }).lab('C12', 'Übernahme Auszubildender').inp('D12', 3, 'num', { min: 0 });
      b.lab('A13', 'Kündigungen / Fluktuation').inp('B13', 3, 'num', { min: 0 }).lab('C13', 'Rückkehr (Elternzeit u. a.)').inp('D13', 1, 'num', { min: 0 });
      b.lab('A14', 'Sonstige (Elternzeit, Versetzung, Vertragsende)').inp('B14', 2, 'num', { min: 0 }).lab('C14', 'Sonstige (bereits eingestellt, Versetzung)').inp('D14', 0, 'num', { min: 0 });
      b.lab('A15', 'Summe Abgänge').tot('B15', 'SUM(B12:B14)', 'num').lab('C15', 'Summe Zugänge').tot('D15', 'SUM(D12:D14)', 'num');
      b.sec(17, 'Berechnung');
      b.lab('A18', 'Einsatzbedarf').fx('B18', 'IF(COUNT(B7)=0,B5/B6,B7)', 'num').txt('C18', 'Arbeitszeitbedarf / Soll-Arbeitszeit je Mitarbeiter');
      b.lab('A19', '+ Reservebedarf').fx('B19', 'B18*B8', 'num').txt('C19', 'Einsatzbedarf × Ausfallquote');
      b.lab('A20', '= Bruttopersonalbedarf').tot('B20', 'B18+B19', 'num');
      b.lab('A21', '− Personalbestand').fx('B21', 'B9', 'num');
      b.lab('A22', '+ Abgänge').fx('B22', 'B15', 'num');
      b.lab('A23', '− Zugänge').fx('B23', 'D15', 'num');
      b.lab('A24', '= Fortgeschriebener Personalbestand').fx('B24', 'B21-B22+B23', 'num').txt('C24', 'Bestand − Abgänge + Zugänge');
      b.lab('A26', 'Nettopersonalbedarf').fx('B26', 'ROUND(B20-B24,6)', 'num').txt('C26', 'Bruttobedarf − fortgeschriebener Bestand');
      b.lab('A27', 'Einstellungsbedarf (Personen, aufgerundet)').res('B27', 'IF(B26>0,ROUNDUP(B26,0),0)', 'int');
      b.lab('A28', 'Personalüberdeckung (Freisetzungsbedarf)').res('B28', 'IF(B26<0,-B26,0)', 'num');
      b.lab('A29', 'Ergebnis').fx('B29', 'IF(B26>0,"Unterdeckung – Personal beschaffen",IF(B26<0,"Überdeckung – Personal abbauen oder umsetzen","Bedarf und Bestand stimmen überein"))', 'txt');
      [18, 19, 24, 26].forEach(r => b.merge(`C${r}:D${r}`)); b.merge('B29:D29');
      b.note('A31', 'Bruttopersonalbedarf = Einsatzbedarf + Reservebedarf. Nettopersonalbedarf = Bruttobedarf − (Bestand − Abgänge + Zugänge). Positiv = Neueinstellungen nötig, negativ = Personalüberhang.');
      return { name: 'Personalbedarf', cols: [50, 14, 36, 12], cells: b.cells, merges: b.merges,
        explain: { B20: 'Bruttopersonalbedarf = Einsatzbedarf + Reservebedarf (Einsatzbedarf × Ausfallquote).', B26: 'Nettopersonalbedarf = Bruttopersonalbedarf − Personalbestand + Abgänge − Zugänge.', B27: 'Ganze Personen: positiver Nettobedarf wird aufgerundet.' } };
    }
  },
  {
    id: 'mehrproduktbe', cat: 'controlling', title: 'Break-even im Mehrproduktunternehmen', file: 'Break-even_Mehrproduktunternehmen.xlsx',
    desc: 'Bis 5 Produkte: Ø DB-Quote aus dem Sortimentsmix, Break-even-Umsatz gesamt und je Produkt.', key: ['B17', 'B18'],
    build() {
      const b = builder(7).title('Break-even im Mehrproduktunternehmen', SUB);
      b.sec(4, '1. Sortiment (bis 5 Produkte, freie Zeilen leer lassen)');
      b.lab('A5', 'Fixkosten des Unternehmens').inp('B5', 60000, 'eur', { min: 0 });
      b.th(7, ['Produkt', 'Preis je Stück', 'Variable Kosten je Stück', 'Absatzmenge (Plan)', 'Umsatzerlöse', 'Deckungsbeitrag', 'DB-Quote']);
      const P = [['Produkt A', 40, 24, 3000], ['Produkt B', 25, 15, 4000], ['Produkt C', 60, 42, 1000]];
      range(8, 12).forEach((r, k) => { const d = P[k], e = `E${r}=""`;
        if (d) b.inp('A' + r, d[0], 'txt').inp('B' + r, d[1], 'eur', { min: 0 }).inp('C' + r, d[2], 'eur', { min: 0 }).inp('D' + r, d[3], 'num', { min: 0 });
        else b.inp('A' + r, null, 'txt').inp('B' + r, null, 'eur', { min: 0 }).inp('C' + r, null, 'eur', { min: 0 }).inp('D' + r, null, 'num', { min: 0 });
        b.fx('E' + r, `IF(COUNT(B${r}:D${r})<3,"",B${r}*D${r})`, 'eur').fx('F' + r, `IF(${e},"",(B${r}-C${r})*D${r})`, 'eur').fx('G' + r, `IF(${e},"",IF(B${r}=0,"–",(B${r}-C${r})/B${r}))`, 'pct'); });
      b.lab('A13', 'Summe').tot('D13', 'SUM(D8:D12)', 'num').tot('E13', 'SUM(E8:E12)', 'eur').tot('F13', 'SUM(F8:F12)', 'eur').tot('G13', 'IF(E13=0,"–",F13/E13)', 'pct');
      const ok = 'AND(E13>0,F13>0)';
      b.sec(15, '2. Ergebnis');
      b.lab('A16', 'Ø Deckungsbeitragsquote').fx('B16', 'G13', 'pct').txt('C16', 'Σ Deckungsbeiträge / Σ Umsatzerlöse').merge('C16:G16');
      b.lab('A17', 'Break-even-Umsatz').res('B17', `IF(${ok},B5/G13,"kein Break-even (DB ≤ 0)")`, 'eur').txt('C17', 'Fixkosten / Ø DB-Quote').merge('C17:G17');
      b.lab('A18', 'Gewinn bei Planabsatz').res('B18', 'F13-B5', 'eur').txt('C18', 'Σ Deckungsbeiträge − Fixkosten').merge('C18:G18');
      b.lab('A19', 'Sicherheitsabstand (Umsatz)').fx('B19', `IF(${ok},(E13-B17)/E13,"–")`, 'pct').txt('C19', '(Planumsatz − Break-even-Umsatz) / Planumsatz').merge('C19:G19');
      b.sec(21, '3. Break-even je Produkt (bei gleichem Sortimentsmix)');
      b.th(22, ['Produkt', 'Umsatzanteil', 'Break-even-Umsatz', 'Break-even-Menge', 'Planmenge']);
      range(8, 12).forEach((s, k) => { const r = 23 + k, e = `E${s}=""`;
        b.fx('A' + r, `IF(${e},"",A${s})`, 'txt').fx('B' + r, `IF(${e},"",IF($E$13=0,0,E${s}/$E$13))`, 'pct').fx('C' + r, `IF(OR(${e},NOT(${ok})),"",$B$17*B${r})`, 'eur')
          .fx('D' + r, `IF(C${r}="","",IF(B${s}=0,"–",C${r}/B${s}))`, 'num').fx('E' + r, `IF(${e},"",D${s})`, 'num'); });
      b.lab('A28', 'Summe').tot('B28', 'SUM(B23:B27)', 'pct').tot('C28', 'SUM(C23:C27)', 'eur');
      b.note('A30', 'Der Break-even-Umsatz gilt nur, solange der Sortimentsmix (Umsatzanteile) wie geplant bleibt. Break-even-Menge je Produkt = Break-even-Umsatz × Umsatzanteil / Preis.');
      return { name: 'Break-even Mehrprodukt', cols: [34, 16, 19, 18, 16, 17, 12], cells: b.cells, merges: b.merges,
        explain: { G13: 'Ø DB-Quote = Summe der Deckungsbeiträge / Summe der Umsatzerlöse (gewichtet mit dem Sortimentsmix).', B17: 'Break-even-Umsatz = Fixkosten / Ø DB-Quote.', C23: 'Anteil des Produkts am Break-even-Umsatz entsprechend seinem Umsatzanteil im Plan.' } };
    }
  }
];
