// Excel-Vorlagen Buchführung & Jahresabschluss (rewe) sowie Controlling-Kennzahlen. Blaue Felder = Eingaben, alles andere echte Excel-Formeln.
import { builder } from './core.js';

const SUB = 'Blaue Felder ausfüllen – alles andere rechnet Excel automatisch.';
const range = (a, b) => { const o = []; for (let k = a; k <= b; k++) o.push(k); return o; };

export default [
  {
    id: 'umsatzsteuer', cat: 'rewe', title: 'Umsatzsteuer-Zahllast', file: 'Umsatzsteuer_Zahllast.xlsx',
    desc: 'Umsatzsteuer minus Vorsteuer: Zahllast an das Finanzamt oder Vorsteuerüberhang – mit 19 % und 7 %.', key: ['B24', 'B25'],
    build() {
      const b = builder(4).title('Umsatzsteuer-Zahllast', SUB);
      b.sec(4, 'Steuersätze');
      b.lab('A5', 'Regelsteuersatz').inp('B5', 0.19, 'pct', { min: 0, max: 1 });
      b.lab('A6', 'Ermäßigter Steuersatz').inp('B6', 0.07, 'pct', { min: 0, max: 1 });
      b.sec(8, 'Ausgangsumsätze (Umsatzsteuer)');
      b.th(9, ['Position', 'Netto', 'Umsatzsteuer', 'Brutto']);
      b.lab('A10', 'Umsätze zum Regelsteuersatz').inp('B10', 120000, 'eur', { min: 0 }).fx('C10', 'B10*$B$5', 'eur').fx('D10', 'B10+C10', 'eur');
      b.lab('A11', 'Umsätze zum ermäßigten Steuersatz').inp('B11', 30000, 'eur', { min: 0 }).fx('C11', 'B11*$B$6', 'eur').fx('D11', 'B11+C11', 'eur');
      b.lab('A12', '= Summe Ausgangsumsätze').tot('B12', 'SUM(B10:B11)', 'eur').tot('C12', 'SUM(C10:C11)', 'eur').tot('D12', 'SUM(D10:D11)', 'eur');
      b.sec(14, 'Eingangsleistungen (Vorsteuer)');
      b.th(15, ['Position', 'Netto', 'Vorsteuer', 'Brutto']);
      b.lab('A16', 'Einkäufe zum Regelsteuersatz').inp('B16', 70000, 'eur', { min: 0 }).fx('C16', 'B16*$B$5', 'eur').fx('D16', 'B16+C16', 'eur');
      b.lab('A17', 'Einkäufe zum ermäßigten Steuersatz').inp('B17', 10000, 'eur', { min: 0 }).fx('C17', 'B17*$B$6', 'eur').fx('D17', 'B17+C17', 'eur');
      b.lab('A18', 'Weitere abziehbare Vorsteuer (z. B. Einfuhrumsatzsteuer)').inp('C18', 0, 'eur', { min: 0 });
      b.lab('A19', '= Summe Vorsteuer').tot('B19', 'SUM(B16:B17)', 'eur').tot('C19', 'SUM(C16:C18)', 'eur');
      b.sec(21, 'Ergebnis');
      b.lab('A22', 'Umsatzsteuer').fx('B22', 'C12', 'eur');
      b.lab('A23', '− Vorsteuer').fx('B23', 'C19', 'eur');
      b.lab('A24', '= Zahllast (+) / Vorsteuerüberhang (−)').res('B24', 'B22-B23', 'eur');
      b.lab('A25', 'Ergebnis').res('B25', 'IF(ROUND(B24,2)>0,"Zahllast: an das Finanzamt zu zahlen (sonstige Verbindlichkeit)",IF(ROUND(B24,2)<0,"Vorsteuerüberhang: Erstattung vom Finanzamt (sonstige Forderung)","Weder Zahllast noch Erstattung"))', 'txt').merge('B25:D25');
      b.note('A27', 'Vorsteuer nur aus ordnungsgemäßen Rechnungen (§ 15 UStG). Kleinunternehmer (§ 19 UStG) weisen keine Umsatzsteuer aus und ziehen keine Vorsteuer ab. Steuersätze bei Bedarf anpassen.');
      return { name: 'Umsatzsteuer', cols: [44, 17, 17, 17], cells: b.cells, merges: b.merges,
        explain: { C10: 'Umsatzsteuer = Nettoumsatz × Steuersatz.', B24: 'Zahllast = Umsatzsteuer − Vorsteuer. Ist das Ergebnis negativ, erstattet das Finanzamt den Vorsteuerüberhang.' } };
    }
  },
  {
    id: 'guvverfahren', cat: 'rewe', title: 'GuV: Gesamtkosten- und Umsatzkostenverfahren', file: 'GuV_Gesamtkosten_Umsatzkostenverfahren.xlsx',
    desc: 'GuV nach § 275 HGB in beiden Verfahren – mit Prüfzeile, dass der Jahresüberschuss gleich ist.', key: ['B37', 'B53', 'B57'],
    build() {
      const b = builder(8).title('GuV: Gesamtkosten- und Umsatzkostenverfahren', SUB);
      b.sec(4, '1. Erträge, Finanzergebnis und Steuern');
      const E = [['Umsatzerlöse', 1200000, 0], ['Erhöhung (+) / Verminderung (−) des Bestands an fertigen und unfertigen Erzeugnissen', 40000, null], ['Andere aktivierte Eigenleistungen', 10000, 0],
        ['Sonstige betriebliche Erträge', 20000, 0], ['Sonstige Zinsen und ähnliche Erträge', 5000, 0], ['Zinsen und ähnliche Aufwendungen', 25000, 0], ['Steuern vom Einkommen und vom Ertrag', 30000, null], ['Sonstige Steuern', 5000, 0]];
      E.forEach(([t, v, mn], k) => b.lab('A' + (5 + k), t).inp('B' + (5 + k), v, 'eur', mn == null ? {} : { min: mn }));
      b.sec(14, '2. Aufwendungen nach Arten und ihre Verteilung auf die Funktionsbereiche');
      b.th(15, ['Aufwandsart', 'Betrag', 'Herstellung', 'Vertrieb', 'Verwaltung', 'Sonstige betr. Aufw.', 'Summe %', 'Prüfung']);
      const A = [['Materialaufwand', 500000, [0.95, 0.03, 0.02, 0]], ['Personalaufwand', 350000, [0.6, 0.2, 0.2, 0]], ['Abschreibungen', 80000, [0.7, 0.1, 0.2, 0]], ['Sonstige betriebliche Aufwendungen', 120000, [0.3, 0.3, 0.25, 0.15]]];
      const S = ['C', 'D', 'E', 'F'];
      A.forEach(([t, v, p], k) => { const r = 16 + k; b.lab('A' + r, t).inp('B' + r, v, 'eur', { min: 0 }); S.forEach((X, j) => b.inp(X + r, p[j], 'pct1', { min: 0, max: 1 })); b.fx('G' + r, `SUM(C${r}:F${r})`, 'pct1').fx('H' + r, `IF(ROUND(G${r},4)=1,"✓","≠ 100 %")`, 'txt'); });
      b.lab('A20', 'Aufwand je Funktionsbereich').tot('B20', 'SUM(B16:B19)', 'eur'); S.forEach(X => b.tot(X + 20, `SUMPRODUCT($B$16:$B$19,${X}16:${X}19)`, 'eur')); b.tot('G20', 'SUM(C20:F20)', 'eur');
      b.sec(22, '3. GuV nach dem Gesamtkostenverfahren (§ 275 Abs. 2 HGB)');
      const G = [['1. Umsatzerlöse', 'B5'], ['2. Erhöhung / Verminderung des Bestands an fertigen und unfertigen Erzeugnissen', 'B6'], ['3. Andere aktivierte Eigenleistungen', 'B7'], ['4. Sonstige betriebliche Erträge', 'B8'],
        ['5. Materialaufwand', '-B16'], ['6. Personalaufwand', '-B17'], ['7. Abschreibungen', '-B18'], ['8. Sonstige betriebliche Aufwendungen', '-B19']];
      G.forEach(([t, f], k) => b.lab('A' + (23 + k), t).fx('B' + (23 + k), f, 'eur'));
      b.lab('A31', '= Zwischensumme: betriebliches Ergebnis (Nr. 1 – 8)').tot('B31', 'SUM(B23:B30)', 'eur');
      b.lab('A32', '11. Sonstige Zinsen und ähnliche Erträge').fx('B32', 'B9', 'eur');
      b.lab('A33', '13. Zinsen und ähnliche Aufwendungen').fx('B33', '-B10', 'eur');
      b.lab('A34', '14. Steuern vom Einkommen und vom Ertrag').fx('B34', '-B11', 'eur');
      b.lab('A35', '15. Ergebnis nach Steuern').tot('B35', 'SUM(B31:B34)', 'eur');
      b.lab('A36', '16. Sonstige Steuern').fx('B36', '-B12', 'eur');
      b.lab('A37', '17. Jahresüberschuss / Jahresfehlbetrag').res('B37', 'B35+B36', 'eur');
      b.sec(39, '4. GuV nach dem Umsatzkostenverfahren (§ 275 Abs. 3 HGB)');
      b.lab('A40', '1. Umsatzerlöse').fx('B40', 'B5', 'eur');
      b.lab('A41', '2. Herstellungskosten der zur Erzielung der Umsatzerlöse erbrachten Leistungen').fx('B41', '-(C20-B6-B7)', 'eur');
      b.lab('A42', '3. Bruttoergebnis vom Umsatz').tot('B42', 'B40+B41', 'eur');
      b.lab('A43', '4. Vertriebskosten').fx('B43', '-D20', 'eur');
      b.lab('A44', '5. Allgemeine Verwaltungskosten').fx('B44', '-E20', 'eur');
      b.lab('A45', '6. Sonstige betriebliche Erträge').fx('B45', 'B8', 'eur');
      b.lab('A46', '7. Sonstige betriebliche Aufwendungen').fx('B46', '-F20', 'eur');
      b.lab('A47', '= Zwischensumme: betriebliches Ergebnis').tot('B47', 'SUM(B42:B46)', 'eur');
      b.lab('A48', '10. Sonstige Zinsen und ähnliche Erträge').fx('B48', 'B9', 'eur');
      b.lab('A49', '12. Zinsen und ähnliche Aufwendungen').fx('B49', '-B10', 'eur');
      b.lab('A50', '13. Steuern vom Einkommen und vom Ertrag').fx('B50', '-B11', 'eur');
      b.lab('A51', '14. Ergebnis nach Steuern').tot('B51', 'SUM(B47:B50)', 'eur');
      b.lab('A52', '15. Sonstige Steuern').fx('B52', '-B12', 'eur');
      b.lab('A53', '16. Jahresüberschuss / Jahresfehlbetrag').res('B53', 'B51+B52', 'eur');
      b.sec(55, 'Prüfung');
      b.lab('A56', 'Differenz Jahresüberschuss GKV − UKV').fx('B56', 'B37-B53', 'eur');
      b.lab('A57', 'Ergebnis der Prüfung').res('B57', 'IF(AND(ROUND(B56,2)=0,ROUND(G16,4)=1,ROUND(G17,4)=1,ROUND(G18,4)=1,ROUND(G19,4)=1),"✓ Beide Verfahren liefern denselben Jahresüberschuss","✗ Verteilung prüfen – jede Zeile muss 100 % ergeben")', 'txt').merge('B57:F57');
      b.note('A59', 'Vereinfacht: Bestandserhöhungen und aktivierte Eigenleistungen sind voll zu Herstellungskosten bewertet und werden im UKV von den Herstellungskosten abgezogen (Bestandsminderung erhöht sie). Nicht benötigte Posten (z. B. Beteiligungserträge) sind weggelassen.');
      return { name: 'GuV', cols: [52, 16, 13, 12, 12, 14, 10, 10], cells: b.cells, merges: b.merges,
        explain: { C20: 'Aufwand des Funktionsbereichs = Summe aus Aufwandsart × Verteilungsschlüssel.', B41: 'Herstellungskosten des Umsatzes = Herstellungsaufwand der Periode − Bestandserhöhung − aktivierte Eigenleistungen.', B57: 'GKV und UKV gliedern nur anders – der Jahresüberschuss muss identisch sein.' } };
    }
  },
  {
    id: 'cashflow', cat: 'rewe', title: 'Kapitalflussrechnung (Cashflow indirekt)', file: 'Kapitalflussrechnung_Cashflow_indirekt.xlsx',
    desc: 'Cashflow aus laufender Geschäfts-, Investitions- und Finanzierungstätigkeit und Veränderung der Finanzmittel.', key: ['B27', 'B42', 'B44'],
    build() {
      const b = builder(5).title('Kapitalflussrechnung (Cashflow, indirekte Methode)', SUB);
      b.sec(4, 'Ergebnis und zahlungsunwirksame Posten');
      b.lab('A5', 'Jahresüberschuss / Jahresfehlbetrag (−)').inp('B5', 80000, 'eur');
      b.lab('A6', 'Abschreibungen auf Gegenstände des Anlagevermögens').inp('B6', 40000, 'eur', { min: 0 });
      b.lab('A7', 'Zuschreibungen auf Gegenstände des Anlagevermögens').inp('B7', 0, 'eur', { min: 0 });
      b.lab('A8', 'Gewinn (+) / Verlust (−) aus dem Abgang von Anlagevermögen').inp('B8', 2000, 'eur');
      b.sec(10, 'Bilanzposten (Working Capital und Rückstellungen)');
      b.th(11, ['Bilanzposten', 'Vorjahr', 'Geschäftsjahr', 'Veränderung', 'Wirkung auf Cashflow']);
      const P = [['Vorräte', 100000, 110000, -1], ['Forderungen aus Lieferungen und Leistungen', 60000, 55000, -1], ['Sonstige Aktiva (z. B. aktive RAP)', 8000, 6000, -1],
        ['Rückstellungen', 30000, 35000, 1], ['Verbindlichkeiten aus Lieferungen und Leistungen', 40000, 46000, 1], ['Sonstige Passiva ohne Finanzschulden (z. B. passive RAP)', 12000, 11000, 1]];
      P.forEach(([t, v0, v1, s], k) => { const r = 12 + k; b.lab('A' + r, t).inp('B' + r, v0, 'eur', { min: 0 }).inp('C' + r, v1, 'eur', { min: 0 }).fx('D' + r, `C${r}-B${r}`, 'eur').fx('E' + r, s < 0 ? `-D${r}` : `D${r}`, 'eur'); });
      b.sec(19, '1. Cashflow aus der laufenden Geschäftstätigkeit');
      b.lab('A20', 'Jahresüberschuss / Jahresfehlbetrag').fx('B20', 'B5', 'eur');
      b.lab('A21', '+ Abschreibungen auf Gegenstände des Anlagevermögens').fx('B21', 'B6', 'eur');
      b.lab('A22', '− Zuschreibungen auf Gegenstände des Anlagevermögens').fx('B22', '-B7', 'eur');
      b.lab('A23', '+/− Zunahme / Abnahme der Rückstellungen').fx('B23', 'E15', 'eur');
      b.lab('A24', '−/+ Gewinn / Verlust aus dem Abgang von Anlagevermögen').fx('B24', '-B8', 'eur');
      b.lab('A25', '−/+ Zunahme / Abnahme der Vorräte, Forderungen LuL und sonstigen Aktiva').fx('B25', 'E12+E13+E14', 'eur');
      b.lab('A26', '+/− Zunahme / Abnahme der Verbindlichkeiten LuL und sonstigen Passiva').fx('B26', 'E16+E17', 'eur');
      b.lab('A27', '= Cashflow aus der laufenden Geschäftstätigkeit').res('B27', 'SUM(B20:B26)', 'eur');
      b.sec(29, '2. Cashflow aus der Investitionstätigkeit');
      b.lab('A30', '+ Einzahlungen aus Abgängen von Anlagevermögen').inp('B30', 12000, 'eur', { min: 0 });
      b.lab('A31', '− Auszahlungen für Investitionen in das Anlagevermögen').inp('B31', 90000, 'eur', { min: 0 });
      b.lab('A32', '= Cashflow aus der Investitionstätigkeit').tot('B32', 'B30-B31', 'eur');
      b.sec(34, '3. Cashflow aus der Finanzierungstätigkeit');
      b.lab('A35', '+ Einzahlungen aus Eigenkapitalzuführungen').inp('B35', 0, 'eur', { min: 0 });
      b.lab('A36', '− Auszahlungen an Gesellschafter (Dividenden, Entnahmen)').inp('B36', 30000, 'eur', { min: 0 });
      b.lab('A37', '+ Einzahlungen aus der Aufnahme von (Finanz-)Krediten').inp('B37', 20000, 'eur', { min: 0 });
      b.lab('A38', '− Auszahlungen für die Tilgung von (Finanz-)Krediten').inp('B38', 25000, 'eur', { min: 0 });
      b.lab('A39', '= Cashflow aus der Finanzierungstätigkeit').tot('B39', 'B35-B36+B37-B38', 'eur');
      b.sec(41, 'Finanzmittelfonds');
      b.lab('A42', 'Zahlungswirksame Veränderung des Finanzmittelfonds (1 + 2 + 3)').res('B42', 'B27+B32+B39', 'eur');
      b.lab('A43', '+ Finanzmittelfonds am Anfang der Periode').inp('B43', 15000, 'eur');
      b.lab('A44', '= Finanzmittelfonds am Ende der Periode').res('B44', 'B42+B43', 'eur');
      b.lab('A45', 'Zur Kontrolle: liquide Mittel laut Schlussbilanz').inp('B45', 27000, 'eur');
      b.lab('A46', 'Abstimmung').fx('B46', 'IF(ROUND(B44-B45,2)=0,"✓ stimmt mit der Bilanz überein",CONCATENATE("✗ Abweichung: ",ROUND(B44-B45,2)," €"))', 'txt').merge('B46:E46');
      b.note('A48', 'Vereinfacht nach DRS 21: Zinsen und Steuern bleiben im Cashflow aus laufender Geschäftstätigkeit. Mehr Aktiva binden Geld (−), mehr Passiva setzen Geld frei (+). Beträge in den Abschnitten 2 und 3 positiv eintragen.');
      return { name: 'Cashflow', cols: [62, 16, 16, 16, 18], cells: b.cells, merges: b.merges,
        explain: { B27: 'Indirekt: Jahresüberschuss + nicht zahlungswirksame Aufwendungen − nicht zahlungswirksame Erträge ± Veränderungen von Working Capital und Rückstellungen.', E12: 'Steigt ein Aktivposten, ist Geld gebunden worden – das mindert den Cashflow.', B42: 'Summe der drei Cashflows = Veränderung der liquiden Mittel.' } };
    }
  },
  {
    id: 'leistungsafa', cat: 'rewe', title: 'Leistungsabschreibung', file: 'Leistungsabschreibung.xlsx',
    desc: 'Abschreibung nach Inanspruchnahme (km, Stunden, Stück) – AfA je Einheit und Buchwerte bis 10 Jahre.', key: ['B10', 'B12'],
    build() {
      const b = builder(6).title('Abschreibung nach Leistung (Leistungs-AfA)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Anschaffungskosten').inp('B5', 120000, 'eur', { min: 0 });
      b.lab('A6', 'Restwert am Ende').inp('B6', 0, 'eur', { min: 0 });
      b.lab('A7', 'Gesamtleistung (z. B. km, Maschinenstunden)').inp('B7', 200000, 'int', { min: 1 });
      b.sec(9, 'Ergebnis');
      b.lab('A10', 'AfA je Leistungseinheit').res('B10', 'IFERROR((B5-B6)/B7,0)', 'f4');
      b.lab('A11', 'Summe der Abschreibungen').fx('B11', 'SUM(D16:D25)', 'eur');
      b.lab('A12', 'Buchwert nach dem letzten Jahr').res('B12', 'B5-B11', 'eur');
      b.lab('A13', 'Summe der eingetragenen Leistung').fx('B13', 'SUM(B16:B25)', 'int').fx('C13', 'IF(ROUND(B13-B7,4)=0,"✓ Gesamtleistung voll genutzt",IF(B13<B7,"Restleistung offen – Buchwert über Restwert","Mehr Leistung als geplant – AfA endet beim Restwert"))', 'txt').merge('C13:F13');
      b.th(15, ['Jahr', 'Leistung (Einheiten)', 'Buchwert Anfang', 'Abschreibung', 'Buchwert Ende', 'Anteil an Gesamtleistung']);
      const L = [30000, 45000, 50000, 40000, 35000, 0, 0, 0, 0, 0];
      range(1, 10).forEach(k => { const r = 15 + k;
        b.txt('A' + r, k, { fmt: 'int' }).inp('B' + r, L[k - 1], 'int', { min: 0 }).fx('C' + r, k === 1 ? '$B$5' : `E${r - 1}`, 'eur')
          .fx('D' + r, `MAX(0,MIN(B${r}*$B$10,C${r}-$B$6))`, 'eur').fx('E' + r, `C${r}-D${r}`, 'eur').fx('F' + r, `IFERROR(B${r}/$B$7,0)`, 'pct1'); });
      b.note('A27', 'AfA = Leistung des Jahres × (Anschaffungskosten − Restwert) / Gesamtleistung; nie unter den Restwert. Steuerlich bei beweglichen Wirtschaftsgütern zulässig, wenn wirtschaftlich begründet und die Leistung nachgewiesen wird (§ 7 Abs. 1 Satz 6 EStG). Jahre ohne Nutzung auf 0 lassen.');
      return { name: 'Leistungs-AfA', cols: [42, 20, 17, 17, 17, 20], cells: b.cells, merges: b.merges,
        explain: { B10: 'AfA-Satz je Einheit = (Anschaffungskosten − Restwert) / Gesamtleistung.', D16: 'Leistung des Jahres × AfA je Einheit, höchstens bis zum Restwert.' } };
    }
  },
  {
    id: 'vorratsbewertung', cat: 'rewe', title: 'Vorratsbewertung: Durchschnitt, FIFO & Niederstwertprinzip', file: 'Vorratsbewertung_Durchschnitt_FIFO.xlsx',
    desc: 'Endbestand nach gewogenem Durchschnitt und FIFO bewerten – Bilanzansatz nach strengem Niederstwertprinzip.', key: ['E21', 'E22'],
    build() {
      const b = builder(7).title('Vorratsbewertung: Durchschnitt, FIFO & Niederstwertprinzip', SUB);
      b.sec(4, 'Lagerbewegungen des Geschäftsjahres');
      b.th(5, ['Bewegung', 'Menge (Stück)', 'Preis je Stück', 'Wert', 'FIFO: Menge im Endbestand', 'FIFO: Wert im Endbestand']);
      const Z = [['Anfangsbestand', 1000, 10], ['Zugang 1', 2000, 11], ['Zugang 2', 1500, 12], ['Zugang 3', 500, 13], ['Zugang 4', 0, 0], ['Zugang 5', 0, 0], ['Zugang 6', 0, 0]];
      Z.forEach(([t, m, p], k) => { const r = 6 + k;
        b.lab('A' + r, t).inp('B' + r, m, 'int', { min: 0 }).inp('C' + r, p, 'eur', { min: 0 }).fx('D' + r, `B${r}*C${r}`, 'eur')
          .fx('E' + r, r === 12 ? `MIN(B${r},MAX(0,$B$16))` : `MIN(B${r},MAX(0,$B$16-SUM(B${r + 1}:B$12)))`, 'int').fx('F' + r, `E${r}*C${r}`, 'eur'); });
      b.lab('A13', '= Summe Anfangsbestand + Zugänge').tot('B13', 'SUM(B6:B12)', 'int').tot('D13', 'SUM(D6:D12)', 'eur').tot('E13', 'SUM(E6:E12)', 'int').tot('F13', 'SUM(F6:F12)', 'eur');
      b.sec(14, 'Abgänge und Stichtag');
      b.lab('A15', 'Abgänge (Verbrauch) gesamt').inp('B15', 3800, 'int', { min: 0 });
      b.lab('A16', 'Endbestand (Menge)').fx('B16', 'B13-B15', 'int').fx('C16', 'IF(B16<0,"✗ Abgänge größer als Anfangsbestand + Zugänge","")', 'txt').merge('C16:F16');
      b.lab('A17', 'Tageswert je Stück am Bilanzstichtag (z. B. Wiederbeschaffungskosten)').inp('B17', 11.5, 'eur', { min: 0 });
      b.sec(19, 'Bewertung des Endbestands');
      b.th(20, ['Verfahren', 'Preis je Stück', 'Wert zu AK', 'Wert zum Tageswert', 'Bilanzansatz (strenges NWP)', 'Abschreibung auf Tageswert', 'Verbrauch zu AK']);
      b.lab('A21', 'Gewogener Durchschnitt (periodisch)').fx('B21', 'IFERROR(D13/B13,0)', 'f4').fx('C21', 'IF($B$16<0,"–",$B$16*B21)', 'eur').fx('D21', 'IF($B$16<0,"–",$B$16*$B$17)', 'eur')
        .res('E21', 'IF($B$16<0,"–",MIN(C21,D21))', 'eur').fx('F21', 'IF($B$16<0,"–",C21-E21)', 'eur').fx('G21', 'IF($B$16<0,"–",$D$13-C21)', 'eur');
      b.lab('A22', 'FIFO (first in – first out)').fx('B22', 'IFERROR(F13/E13,0)', 'f4').fx('C22', 'IF($B$16<0,"–",F13)', 'eur').fx('D22', 'IF($B$16<0,"–",$B$16*$B$17)', 'eur')
        .res('E22', 'IF($B$16<0,"–",MIN(C22,D22))', 'eur').fx('F22', 'IF($B$16<0,"–",C22-E22)', 'eur').fx('G22', 'IF($B$16<0,"–",$D$13-C22)', 'eur');
      b.note('A24', 'Durchschnitt: Gesamtwert / Gesamtmenge aus Anfangsbestand und allen Zugängen (§ 240 Abs. 4 HGB). FIFO: Der Endbestand stammt aus den letzten Zugängen (§ 256 HGB). Strenges Niederstwertprinzip im Umlaufvermögen (§ 253 Abs. 4 HGB): Liegt der Tageswert darunter, muss auf ihn abgeschrieben werden.');
      b.note('A25', 'Preis je Stück bei FIFO = Durchschnittspreis der Endbestandsmenge. Zugänge in zeitlicher Reihenfolge eintragen, leere Zugänge auf 0 lassen.');
      return { name: 'Vorratsbewertung', cols: [44, 16, 16, 16, 19, 19, 16], cells: b.cells, merges: b.merges,
        explain: { E6: 'FIFO-Restmenge: Was nicht durch spätere Zugänge im Endbestand abgedeckt ist, kommt aus diesem Posten – höchstens seine Menge.', B21: 'Gewogener Durchschnittspreis = Wert (AB + Zugänge) / Menge (AB + Zugänge).', E21: 'Bilanzansatz = niedrigerer Wert aus Anschaffungskosten und Tageswert.' } };
    }
  },
  {
    id: 'gewinnverteilung', cat: 'rewe', title: 'Gewinnverteilung OHG & KG', file: 'Gewinnverteilung_OHG_KG.xlsx',
    desc: 'Jahresgewinn nach Gesellschaftsvertrag verteilen: Kapitalverzinsung, Tätigkeitsvergütung, Rest nach Quoten.', key: ['F22', 'B22', 'B26'],
    build() {
      const b = builder(6).title('Gewinnverteilung OHG & KG (vertragliche Regelung)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Jahresgewinn der Gesellschaft').inp('B5', 180000, 'eur');
      b.lab('A6', 'Verzinsung des Kapitalanteils (laut Vertrag)').inp('B6', 0.05, 'pct', { min: 0, max: 1 });
      b.sec(8, 'Gesellschafter (laut Gesellschaftsvertrag)');
      b.th(9, ['', 'Gesellschafter 1', 'Gesellschafter 2', 'Gesellschafter 3', 'Gesellschafter 4', 'Summe']);
      const G = ['B', 'C', 'D', 'E'];
      const D = { 10: ['A', 'B', 'C', 'D'], 11: ['Komplementär', 'Komplementär', 'Kommanditist', '–'], 12: [200000, 150000, 50000, 0], 13: [36000, 24000, 0, 0], 14: [2, 2, 1, 0] };
      b.lab('A10', 'Name'); G.forEach((X, j) => b.inp(X + 10, D[10][j], 'txt'));
      b.lab('A11', 'Stellung (OHG-Gesellschafter / Komplementär / Kommanditist)'); G.forEach((X, j) => b.inp(X + 11, D[11][j], 'txt'));
      b.lab('A12', 'Kapitalanteil (zu Beginn des Jahres)'); G.forEach((X, j) => b.inp(X + 12, D[12][j], 'eur', { min: 0 })); b.fx('F12', 'SUM(B12:E12)', 'eur');
      b.lab('A13', 'Tätigkeitsvergütung (Gewinnvorab)'); G.forEach((X, j) => b.inp(X + 13, D[13][j], 'eur', { min: 0 })); b.fx('F13', 'SUM(B13:E13)', 'eur');
      b.lab('A14', 'Quote für den Restgewinn (Anteile)'); G.forEach((X, j) => b.inp(X + 14, D[14][j], 'x2', { min: 0 })); b.fx('F14', 'SUM(B14:E14)', 'x2');
      b.sec(16, 'Gewinnverteilung');
      b.txt('A17', 'Position', { s: 'th' }); G.forEach(X => b.fx(X + 17, `${X}10`, 'txt', { s: 'th' })); b.txt('F17', 'Summe', { s: 'th' });
      b.lab('A18', 'Verzinsung des Kapitalanteils'); G.forEach(X => b.fx(X + 18, `${X}12*$B$6`, 'eur')); b.fx('F18', 'SUM(B18:E18)', 'eur');
      b.lab('A19', '+ Tätigkeitsvergütung'); G.forEach(X => b.fx(X + 19, `${X}13`, 'eur')); b.fx('F19', 'SUM(B19:E19)', 'eur');
      b.lab('A20', '= Vorabgewinn'); G.forEach(X => b.tot(X + 20, `${X}18+${X}19`, 'eur')); b.tot('F20', 'SUM(B20:E20)', 'eur');
      b.lab('A21', '+ Anteil am Restgewinn (nach Quoten)'); G.forEach(X => b.fx(X + 21, `IF($F$14=0,0,($B$5-$F$20)*${X}14/$F$14)`, 'eur')); b.fx('F21', 'SUM(B21:E21)', 'eur');
      b.lab('A22', '= Gewinnanteil gesamt'); G.forEach(X => b.res(X + 22, `${X}20+${X}21`, 'eur')); b.res('F22', 'SUM(B22:E22)', 'eur');
      b.lab('A23', 'Anteil am Jahresgewinn'); G.forEach(X => b.fx(X + 23, `IF($B$5=0,0,${X}22/$B$5)`, 'pct1')); b.fx('F23', 'IF($B$5=0,0,F22/$B$5)', 'pct1');
      b.sec(25, 'Prüfung');
      b.lab('A26', 'Restgewinn nach Vorabgewinn').res('B26', 'B5-F20', 'eur');
      b.lab('A27', 'Prüfung').fx('B27', 'IF(ROUND(F22-B5,2)=0,"✓ Verteilt = Jahresgewinn","✗ Nicht voll verteilt – Summe der Quoten ist 0")', 'txt').merge('B27:F27');
      b.note('A29', 'Rechtslage seit 01.01.2024 (MoPeG): Die frühere gesetzliche Regel des § 121 HGB a. F. (4 % auf den Kapitalanteil, Rest nach Köpfen) gilt nicht mehr. Fehlt eine vertragliche Regelung, richtet sich der Anteil nach § 120 Abs. 1 HGB i. V. m. § 709 Abs. 3 BGB: nach den vereinbarten Beteiligungsverhältnissen, sonst nach dem Verhältnis der vereinbarten Werte der Beiträge, sonst zu gleichen Teilen.');
      b.note('A30', 'Diese Vorlage rechnet die vertragliche Regelung aus der Aufgabe: Kapitalverzinsung und Tätigkeitsvergütung vorab, Rest nach Quoten (nach Köpfen: überall 1; nach Kapital: Kapitalanteile als Quote). Ein negativer Rest wird ebenfalls nach Quoten verteilt. Verzinsung ohne zeitanteilige Einlagen/Entnahmen.');
      return { name: 'Gewinnverteilung', cols: [46, 17, 17, 17, 17, 17], cells: b.cells, merges: b.merges,
        explain: { B18: 'Kapitalverzinsung = Kapitalanteil zu Jahresbeginn × vereinbarter Zinssatz.', B21: 'Restgewinn = Jahresgewinn − alle Vorabgewinne, verteilt im Verhältnis der Quoten.', F22: 'Summe aller Gewinnanteile – muss den Jahresgewinn ergeben.' } };
    }
  },
  {
    id: 'rechnungsabgrenzung', cat: 'rewe', title: 'Rechnungsabgrenzung (ARAP & PRAP)', file: 'Rechnungsabgrenzung_ARAP_PRAP.xlsx',
    desc: 'Monatsgenau: Aufwand bzw. Ertrag des Geschäftsjahres, Rechnungsabgrenzungsposten und Abschlussbuchung.', key: ['B17', 'B18', 'B19'],
    build() {
      const b = builder(5).title('Rechnungsabgrenzung (ARAP & PRAP)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Art: 1 = Ausgabe vorab (Aufwand) · 2 = Einnahme vorab (Ertrag)').inp('B5', 1, 'int', { min: 1, max: 2 });
      b.lab('A6', 'Gezahlter bzw. erhaltener Betrag').inp('B6', 1200, 'eur', { min: 0 });
      b.lab('A7', 'Leistungszeitraum: erster Monat (1 – 12)').inp('B7', 10, 'int', { min: 1, max: 12 });
      b.lab('A8', 'Jahr des ersten Monats: 0 = Jahr des Stichtags, −1 = Vorjahr, 1 = Folgejahr').inp('B8', 0, 'int', { min: -10, max: 10 });
      b.lab('A9', 'Laufzeit der Leistung in Monaten').inp('B9', 12, 'int', { min: 1, max: 120 });
      b.lab('A10', 'Bilanzstichtag: Monat (Ende des Geschäftsjahres)').inp('B10', 12, 'int', { min: 1, max: 12 });
      b.sec(13, 'Ergebnis');
      const S = '$B$10', BG = '($B$8*12+$B$7)';
      b.lab('A14', 'Monate im abgelaufenen Geschäftsjahr').fx('B14', 'B9-B15-B16', 'int');
      b.lab('A15', 'Monate nach dem Bilanzstichtag').fx('B15', `MAX(0,MIN(B9,${BG}+B9-1-${S}))`, 'int');
      b.lab('A16', 'Monate vor Beginn des Geschäftsjahres').fx('B16', `MAX(0,MIN(B9,${S}-11-${BG}))`, 'int');
      b.lab('A17', 'Aufwand bzw. Ertrag des abgelaufenen Geschäftsjahres').res('B17', 'B6*B14/B9', 'eur');
      b.lab('A18', 'Rechnungsabgrenzungsposten zum Bilanzstichtag').res('B18', 'B6*B15/B9', 'eur');
      b.lab('A19', 'Bilanzposten').res('B19', 'IF(ROUND(B18,2)=0,"kein RAP nötig",IF(B5=1,"Aktiver RAP (Aktivseite)","Passiver RAP (Passivseite)"))', 'txt').merge('B19:E19');
      b.lab('A20', 'Abschlussbuchung (Zahlung zuvor voll erfolgswirksam gebucht)').fx('B20', 'IF(ROUND(B18,2)=0,"–",IF(B5=1,"Aktive Rechnungsabgrenzung an Aufwandskonto","Ertragskonto an Passive Rechnungsabgrenzung"))', 'txt').merge('B20:E20');
      b.lab('A21', 'Auflösung im folgenden Geschäftsjahr').fx('B21', 'B6*MIN(12,B15)/B9', 'eur');
      b.lab('A22', 'Rest für spätere Geschäftsjahre').fx('B22', 'B18-B21', 'eur');
      b.note('A24', 'RAP nach § 250 HGB: Zahlung vor dem Stichtag für Aufwand bzw. Ertrag einer bestimmten Zeit danach. Monatsgenau – der erste Monat zählt voll. Monate vor dem Geschäftsjahr gehören in frühere Jahre.');
      return { name: 'Rechnungsabgrenzung', cols: [56, 18, 16, 16, 16], cells: b.cells, merges: b.merges,
        explain: { B15: 'Monate der Leistung, die nach dem Bilanzstichtag liegen (Ende der Leistung − Stichtag, höchstens die Laufzeit).', B18: 'RAP = Betrag × Monate nach dem Stichtag / Laufzeit in Monaten.', B17: 'Aufwand bzw. Ertrag = Betrag × Monate im Geschäftsjahr / Laufzeit.' } };
    }
  },
  {
    id: 'cashcycle', cat: 'controlling', title: 'Working Capital & Cash Conversion Cycle', file: 'Working_Capital_Cash_Conversion_Cycle.xlsx',
    desc: 'Working Capital, DSO, DIO, DPO und Cash Conversion Cycle in Tagen aus Bilanz und GuV.', key: ['B21', 'B16', 'B17'],
    build() {
      const b = builder(3).title('Working Capital & Cash Conversion Cycle', SUB);
      b.sec(4, 'Werte aus Bilanz und GuV');
      const I = [['Umsatzerlöse', 3650000], ['Umsatzkosten bzw. Material-/Wareneinsatz', 2190000], ['Vorräte', 300000], ['Forderungen aus Lieferungen und Leistungen', 400000], ['Liquide Mittel', 120000], ['Sonstiges Umlaufvermögen', 30000],
        ['Verbindlichkeiten aus Lieferungen und Leistungen', 180000], ['Sonstige kurzfristige Verbindlichkeiten', 170000]];
      I.forEach(([t, v], k) => b.lab('A' + (5 + k), t).inp('B' + (5 + k), v, 'eur', { min: 0 }));
      b.lab('A13', 'Tage pro Jahr (365 oder 360)').inp('B13', 365, 'int', { min: 1, max: 366 });
      b.sec(14, 'Ergebnis');
      b.th(15, ['Kennzahl', 'Wert', 'Formel']);
      b.lab('A16', 'Working Capital').res('B16', 'B7+B8+B9+B10-B11-B12', 'eur').txt('C16', 'Umlaufvermögen − kurzfristige Verbindlichkeiten');
      b.lab('A17', 'Net Working Capital (operativ)').res('B17', 'B7+B8-B11', 'eur').txt('C17', 'Vorräte + Forderungen LuL − Verbindlichkeiten LuL');
      b.lab('A18', 'DSO – Kundenziel (Tage)').fx('B18', 'IF(B5=0,0,B8/B5*B13)', 'num').txt('C18', 'Forderungen LuL / Umsatzerlöse × Tage');
      b.lab('A19', 'DIO – Lagerdauer (Tage)').fx('B19', 'IF(B6=0,0,B7/B6*B13)', 'num').txt('C19', 'Vorräte / Umsatzkosten × Tage');
      b.lab('A20', 'DPO – Lieferantenziel (Tage)').fx('B20', 'IF(B6=0,0,B11/B6*B13)', 'num').txt('C20', 'Verbindlichkeiten LuL / Umsatzkosten × Tage');
      b.lab('A21', 'Cash Conversion Cycle (Tage)').res('B21', 'B18+B19-B20', 'num').txt('C21', 'DSO + DIO − DPO');
      b.lab('A22', 'Einschätzung').fx('B22', 'IF(B21<0,"Negativ: Lieferanten finanzieren das Umlaufvermögen mit",CONCATENATE("Kapital ist rund ",ROUND(B21,0)," Tage im Umsatzprozess gebunden"))', 'txt').merge('B22:C22');
      b.note('A24', 'Für Durchschnittswerte (Anfangs- + Schlussbestand) / 2 eintragen. Forderungen enthalten Umsatzsteuer – manche Lehrbücher nehmen deshalb den Bruttoumsatz, und das DPO teils auf Basis des Wareneinkaufs. In der Klausur die Vorgabe der Aufgabe nutzen.');
      return { name: 'Cash Conversion Cycle', cols: [46, 18, 50], cells: b.cells, merges: b.merges,
        explain: { B18: 'Days Sales Outstanding: Wie lange Kunden im Schnitt bis zur Zahlung brauchen.', B21: 'Cash Conversion Cycle = DSO + DIO − DPO: Tage zwischen Bezahlen der Lieferanten und Geldeingang vom Kunden.' } };
    }
  },
  {
    id: 'ebitda', cat: 'controlling', title: 'EBITDA, EBIT, EBT & Margen', file: 'EBITDA_EBIT_EBT_Margen.xlsx',
    desc: 'Aus der GuV: Gesamtleistung, EBITDA, EBIT, EBT, Jahresüberschuss und die Margen in % vom Umsatz.', key: ['B21', 'B22', 'B24', 'C22'],
    build() {
      const b = builder(4).title('EBITDA, EBIT, EBT & Margen', SUB);
      b.sec(4, 'Werte aus der GuV (Gesamtkostenverfahren)');
      const I = [['Umsatzerlöse', 2000000, 0], ['Bestandsveränderungen (Erhöhung + / Verminderung −)', 50000, null], ['Andere aktivierte Eigenleistungen', 0, 0], ['Sonstige betriebliche Erträge', 30000, 0], ['Materialaufwand', 900000, 0], ['Personalaufwand', 600000, 0],
        ['Abschreibungen', 120000, 0], ['Sonstige betriebliche Aufwendungen', 180000, 0], ['Sonstige Steuern (z. B. Kfz-, Grundsteuer)', 10000, 0], ['Zinserträge und ähnliche Erträge', 5000, 0], ['Zinsaufwendungen', 40000, 0], ['Steuern vom Einkommen und vom Ertrag', 70000, null]];
      I.forEach(([t, v, mn], k) => b.lab('A' + (5 + k), t).inp('B' + (5 + k), v, 'eur', mn == null ? {} : { min: mn }));
      b.sec(18, 'Ergebnis');
      b.th(19, ['Kennzahl', 'Wert', 'Marge (vom Umsatz)', 'Rechnung']);
      b.lab('A20', 'Gesamtleistung').fx('B20', 'B5+B6+B7', 'eur').txt('D20', 'Umsatz ± Bestandsveränderung + aktivierte Eigenleistungen');
      b.lab('A21', 'EBITDA').res('B21', 'B20+B8-B9-B10-B12-B13', 'eur').res('C21', 'IF(B5=0,0,B21/B5)', 'pct').txt('D21', 'Gesamtleistung + sonst. Erträge − Material − Personal − sonst. Aufwand − sonst. Steuern');
      b.lab('A22', 'EBIT').res('B22', 'B21-B11', 'eur').res('C22', 'IF(B5=0,0,B22/B5)', 'pct').txt('D22', 'EBITDA − Abschreibungen');
      b.lab('A23', 'Finanzergebnis').fx('B23', 'B14-B15', 'eur').txt('D23', 'Zinserträge − Zinsaufwendungen');
      b.lab('A24', 'EBT').res('B24', 'B22+B23', 'eur').res('C24', 'IF(B5=0,0,B24/B5)', 'pct').txt('D24', 'EBIT + Finanzergebnis');
      b.lab('A25', 'Jahresüberschuss / Jahresfehlbetrag').tot('B25', 'B24-B16', 'eur').tot('C25', 'IF(B5=0,0,B25/B5)', 'pct').txt('D25', 'EBT − Ertragsteuern');
      b.note('A27', 'EBIT, EBITDA und EBT sind nicht gesetzlich definiert. Hier: sonstige Steuern zählen zum operativen Ergebnis, nur Ertragsteuern und Zinsen werden herausgerechnet. In der Klausur die Definition der Aufgabe nutzen.');
      return { name: 'EBITDA-EBIT', cols: [48, 17, 17, 70], cells: b.cells, merges: b.merges,
        explain: { B21: 'EBITDA = Ergebnis vor Zinsen, Ertragsteuern und Abschreibungen.', B22: 'EBIT = EBITDA − Abschreibungen = operatives Ergebnis vor Zinsen und Ertragsteuern.', C22: 'EBIT-Marge = EBIT / Umsatzerlöse.' } };
    }
  },
  {
    id: 'bewegungsbilanz', cat: 'rewe', title: 'Strukturbilanz & Bewegungsbilanz', file: 'Strukturbilanz_Bewegungsbilanz.xlsx',
    desc: 'Zwei Bilanzen vergleichen: Struktur in %, Veränderungen und Mittelherkunft / Mittelverwendung.', key: ['B34', 'C34', 'B35'],
    build() {
      const b = builder(7).title('Strukturbilanz & Bewegungsbilanz', SUB);
      b.sec(4, 'Strukturbilanz (zwei Bilanzstichtage)');
      b.th(5, ['Position', 'Vorjahr', 'Geschäftsjahr', 'Veränderung', 'Veränderung in %', 'Anteil Vorjahr', 'Anteil Geschäftsjahr']);
      const IN = { 6: ['Immaterielle Vermögensgegenstände und Sachanlagen', 500000, 560000], 7: ['Finanzanlagen', 50000, 40000], 9: ['Vorräte', 150000, 170000], 10: ['Forderungen und sonstige Vermögensgegenstände', 120000, 110000], 11: ['Liquide Mittel', 30000, 45000],
        14: ['Eigenkapital', 300000, 340000], 15: ['Langfristige Rückstellungen (z. B. Pensionen)', 80000, 90000], 16: ['Langfristige Verbindlichkeiten', 270000, 250000], 18: ['Kurzfristiges Fremdkapital (kurzfr. Rückstellungen und Verbindlichkeiten)', 200000, 245000]};
      const SUMS = { 8: ['= Anlagevermögen', 'X6+X7'], 12: ['= Umlaufvermögen', 'X9+X10+X11'], 13: ['= Bilanzsumme (Aktiva)', 'X8+X12'], 17: ['= Langfristiges Fremdkapital', 'X15+X16'], 19: ['= Bilanzsumme (Passiva)', 'X14+X17+X18'] };
      range(6, 19).forEach(r => { const tot = r >= 14 ? 19 : 13;
        if (IN[r]) { b.lab('A' + r, IN[r][0]).inp('B' + r, IN[r][1], 'eur', { min: 0 }).inp('C' + r, IN[r][2], 'eur', { min: 0 }); }
        else { b.lab('A' + r, SUMS[r][0]).tot('B' + r, SUMS[r][1].replace(/X/g, 'B'), 'eur').tot('C' + r, SUMS[r][1].replace(/X/g, 'C'), 'eur'); }
        b.fx('D' + r, `C${r}-B${r}`, 'eur').fx('E' + r, `IF(B${r}=0,"–",D${r}/B${r})`, 'pct1').fx('F' + r, `IF(B$${tot}=0,0,B${r}/B$${tot})`, 'pct1').fx('G' + r, `IF(C$${tot}=0,0,C${r}/C$${tot})`, 'pct1'); });
      b.lab('A20', 'Bilanz ausgeglichen?').fx('B20', 'IF(ROUND(B13-B19,2)=0,"✓","✗ Aktiva ≠ Passiva")', 'txt').fx('C20', 'IF(ROUND(C13-C19,2)=0,"✓","✗ Aktiva ≠ Passiva")', 'txt');
      b.sec(22, 'Bewegungsbilanz');
      b.th(23, ['Position', 'Mittelverwendung', 'Mittelherkunft', 'Art der Veränderung']);
      const BW = [[6, 1], [7, 1], [9, 1], [10, 1], [11, 1], [14, -1], [15, -1], [16, -1], [18, -1]];
      BW.forEach(([s, akt], k) => { const r = 24 + k, d = `D${s}`;
        b.lab('A' + r, IN[s][0]).fx('B' + r, akt > 0 ? `MAX(${d},0)` : `MAX(-${d},0)`, 'eur').fx('C' + r, akt > 0 ? `MAX(-${d},0)` : `MAX(${d},0)`, 'eur')
          .fx('D' + r, akt > 0 ? `IF(${d}>0,"Aktivmehrung",IF(${d}<0,"Aktivminderung","–"))` : `IF(${d}>0,"Passivmehrung",IF(${d}<0,"Passivminderung","–"))`, 'txt'); });
      b.lab('A34', '= Summe').res('B34', 'SUM(B24:B32)', 'eur').res('C34', 'SUM(C24:C32)', 'eur');
      b.lab('A35', 'Prüfung').res('B35', 'IF(ROUND(B34-C34,2)=0,"✓ Mittelherkunft = Mittelverwendung","✗ Bilanzen sind nicht ausgeglichen")', 'txt').merge('B35:D35');
      b.note('A37', 'Mittelverwendung = Aktivmehrung + Passivminderung, Mittelherkunft = Aktivminderung + Passivmehrung. Anteile der Aktiva beziehen sich auf die Bilanzsumme Aktiva, die der Passiva auf die Bilanzsumme Passiva.');
      return { name: 'Bewegungsbilanz', cols: [58, 16, 16, 18, 14, 13, 14], cells: b.cells, merges: b.merges,
        explain: { D6: 'Veränderung = Geschäftsjahr − Vorjahr.', F6: 'Strukturanteil = Position / Bilanzsumme (vertikale Analyse).', B34: 'Bei ausgeglichenen Bilanzen sind Mittelverwendung und Mittelherkunft immer gleich groß.' } };
    }
  },
  {
    id: 'anlagenspiegel', cat: 'rewe', title: 'Anlagenspiegel (Anlagengitter)', file: 'Anlagenspiegel_Anlagengitter.xlsx',
    desc: 'Bis zu 5 Anlagen: AK/HK, Zugänge, Abgänge, Umbuchungen, kumulierte AfA und Buchwerte – Bruttomethode.', key: ['G21'],
    build() {
      const b = builder(7).title('Anlagenspiegel (Anlagengitter, Bruttomethode)', SUB);
      const C = ['B', 'C', 'D', 'E', 'F'];
      const hdr = ['Position', 'Anlage 1', 'Anlage 2', 'Anlage 3', 'Anlage 4', 'Anlage 5', 'Summe'];
      b.sec(4, 'Eingaben je Anlage bzw. Bilanzposten');
      b.th(5, hdr);
      const names = ['Grundstücke und Bauten', 'Technische Anlagen und Maschinen', 'Betriebs- und Geschäftsausstattung', 'Anlagen im Bau', 'Software (entgeltlich erworben)'];
      b.lab('A6', 'Bezeichnung'); C.forEach((X, j) => b.inp(X + 6, names[j], 'txt'));
      const IN = [['AK/HK zu Beginn des Geschäftsjahres', [500000, 300000, 80000, 25000, 20000], { min: 0 }], ['+ Zugänge', [0, 60000, 12000, 15000, 5000], { min: 0 }], ['− Abgänge (zu AK/HK)', [0, 40000, 0, 0, 0], { min: 0 }],
        ['± Umbuchungen', [0, 40000, 0, -40000, 0], {}], ['Kumulierte Abschreibungen zu Beginn des Geschäftsjahres', [120000, 180000, 50000, 0, 12000], { min: 0 }], ['+ Abschreibungen des Geschäftsjahres', [15000, 36000, 9000, 0, 4000], { min: 0 }],
        ['− Zuschreibungen des Geschäftsjahres', [0, 0, 0, 0, 0], { min: 0 }], ['− Kumulierte Abschreibungen auf Abgänge', [0, 38000, 0, 0, 0], { min: 0 }]];
      IN.forEach(([t, vs, o], k) => { const r = 7 + k; b.lab('A' + r, t); C.forEach((X, j) => b.inp(X + r, vs[j], 'eur', o)); b.fx('G' + r, `SUM(B${r}:F${r})`, 'eur'); });
      b.sec(16, 'Anlagenspiegel');
      b.txt('A17', 'Position', { s: 'th' }); C.forEach(X => b.fx(X + 17, `${X}6`, 'txt', { s: 'th' })); b.txt('G17', 'Summe', { s: 'th' });
      const OUT = [['AK/HK zum Ende des Geschäftsjahres', X => `${X}7+${X}8-${X}9+${X}10`, 'fx'], ['Kumulierte Abschreibungen zum Ende des Geschäftsjahres', X => `${X}11+${X}12-${X}13-${X}14`, 'fx'],
        ['Buchwert zu Beginn des Geschäftsjahres (Vorjahr)', X => `${X}7-${X}11`, 'fx'], ['Buchwert zum Ende des Geschäftsjahres', X => `${X}18-${X}19`, 'res'], ['Restbuchwert der Abgänge', X => `${X}9-${X}14`, 'fx'],
        ['Kontrolle: BW Anfang + Zugänge ± Umbuchungen − RBW Abgänge − AfA + Zuschreibungen', X => `${X}20+${X}8+${X}10-${X}22-${X}12+${X}13`, 'fx']];
      OUT.forEach(([t, f, st], k) => { const r = 18 + k; b.lab('A' + r, t); [...C, 'G'].forEach(X => b[st](X + r, X === 'G' ? `SUM(B${r}:F${r})` : f(X), 'eur')); });
      b.lab('A24', 'Plausibilität'); C.forEach(X => b.fx(X + 24, `IF(${X}21<0,"✗ Buchwert < 0",IF(${X}19<0,"✗ kum. AfA < 0",IF(ROUND(${X}23-${X}21,2)=0,"✓","✗")))`, 'txt'));
      b.fx('G24', 'IF(ROUND(G10,2)=0,"✓ Umbuchungen = 0","✗ Umbuchungen ≠ 0")', 'txt');
      b.note('A26', 'Anlagenspiegel nach § 284 Abs. 3 HGB (Anhang): historische AK/HK und kumulierte Abschreibungen (Bruttomethode). Umbuchungen gleichen sich über alle Posten aus. Vereinfacht ohne Umbuchungen bei den Abschreibungen.');
      return { name: 'Anlagenspiegel', cols: [52, 17, 17, 17, 17, 17, 18], cells: b.cells, merges: b.merges,
        explain: { B18: 'AK/HK Ende = AK/HK Anfang + Zugänge − Abgänge ± Umbuchungen.', B19: 'Kumulierte AfA Ende = kumulierte AfA Anfang + AfA des Jahres − Zuschreibungen − kumulierte AfA der Abgänge.', B21: 'Buchwert = AK/HK Ende − kumulierte Abschreibungen Ende.' } };
    }
  },
  {
    id: 'inventar', cat: 'rewe', title: 'Inventar, Reinvermögen & Betriebsvermögensvergleich', file: 'Inventar_Reinvermoegen_Betriebsvermoegensvergleich.xlsx',
    desc: 'Vom Inventar zum Eigenkapital an zwei Stichtagen – Gewinn per Betriebsvermögensvergleich.', key: ['C25', 'B33'],
    build() {
      const b = builder(3).title('Inventar, Reinvermögen & Betriebsvermögensvergleich', SUB);
      b.sec(4, 'Inventar');
      b.th(5, ['Position', 'Anfang (Vorjahresstichtag)', 'Ende (Stichtag)']);
      b.lab('A6', 'A. Vermögen').lab('A7', 'I. Anlagevermögen');
      const IN = { 8: ['Grundstücke und Gebäude', 250000, 245000], 9: ['Maschinen und technische Anlagen', 120000, 110000], 10: ['Betriebs- und Geschäftsausstattung', 30000, 28000], 11: ['Fuhrpark', 40000, 45000],
        14: ['Vorräte', 60000, 70000], 15: ['Forderungen aus Lieferungen und Leistungen', 35000, 40000], 16: ['Kassenbestand', 2000, 1500], 17: ['Bankguthaben', 23000, 30500],
        21: ['Langfristige Schulden (z. B. Darlehen)', 200000, 180000], 22: ['Verbindlichkeiten aus Lieferungen und Leistungen', 50000, 45000], 23: ['Sonstige kurzfristige Schulden', 10000, 8000] };
      for (const [r, [t, v0, v1]] of Object.entries(IN)) b.lab('A' + r, t).inp('B' + r, v0, 'eur', { min: 0 }).inp('C' + r, v1, 'eur', { min: 0 });
      b.lab('A13', 'II. Umlaufvermögen').lab('A20', 'B. Schulden');
      const T = [[12, '= Summe Anlagevermögen', 'SUM(X8:X11)'], [18, '= Summe Umlaufvermögen', 'SUM(X14:X17)'], [19, '= Summe des Vermögens', 'X12+X18'], [24, '= Summe der Schulden', 'SUM(X21:X23)']];
      T.forEach(([r, t, f]) => b.lab('A' + r, t).tot('B' + r, f.replace(/X/g, 'B'), 'eur').tot('C' + r, f.replace(/X/g, 'C'), 'eur'));
      b.lab('A25', 'C. Reinvermögen (Eigenkapital) = Vermögen − Schulden').res('B25', 'B19-B24', 'eur').res('C25', 'C19-C24', 'eur');
      b.sec(27, 'Betriebsvermögensvergleich (§ 4 Abs. 1 EStG)');
      b.lab('A28', 'Eigenkapital am Ende').fx('B28', 'C25', 'eur');
      b.lab('A29', '− Eigenkapital am Anfang').fx('B29', 'B25', 'eur');
      b.lab('A30', '= Veränderung des Eigenkapitals').tot('B30', 'B28-B29', 'eur');
      b.lab('A31', '+ Privatentnahmen').inp('B31', 48000, 'eur', { min: 0 });
      b.lab('A32', '− Privateinlagen').inp('B32', 10000, 'eur', { min: 0 });
      b.lab('A33', '= Gewinn (+) / Verlust (−)').res('B33', 'B30+B31-B32', 'eur');
      b.note('A35', 'Das Inventar listet Vermögen und Schulden nach Art, Menge und Wert (§ 240 HGB). Reinvermögen = Eigenkapital. Gewinn = EK Ende − EK Anfang + Entnahmen − Einlagen.');
      return { name: 'Inventar', cols: [56, 24, 20], cells: b.cells, merges: b.merges,
        explain: { B25: 'Reinvermögen = Summe des Vermögens − Summe der Schulden.', B33: 'Betriebsvermögensvergleich: Entnahmen werden hinzugerechnet, Einlagen abgezogen, weil sie das Eigenkapital ohne betrieblichen Gewinn verändern.' } };
    }
  }
];
