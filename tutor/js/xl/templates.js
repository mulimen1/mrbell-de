// Die Excel-Vorlagen von BWL Max (Grundstock hier, weitere Bereiche in tpl-*.js). Blaue Felder = Eingaben, alles andere sind echte Excel-Formeln.
// Rechenwege wie in Max' geprüften Rechnern (rechner-core.js) – Ergebnisse werden in den Tests dagegen geprüft.
import { builder } from './core.js';
import INVEST, { izfHilfe, izfText } from './tpl-invest.js';
import KOSTEN from './tpl-kosten.js';
import REWE from './tpl-rewe.js';
import OPS from './tpl-ops.js';

const SUB = 'Blaue Felder ausfüllen – alles andere rechnet Excel automatisch.';
const range = (a, b) => { const o = []; for (let k = a; k <= b; k++) o.push(k); return o; };

export const CATS = [['invest', 'Investition'], ['finanz', 'Finanzierung & Finanzmathematik'], ['kosten', 'Kosten- & Leistungsrechnung'], ['controlling', 'Controlling & Planung'], ['rewe', 'Buchführung & Jahresabschluss'], ['logistik', 'Beschaffung, Produktion & Logistik'], ['marketing', 'Marketing & Absatz']];

const BASE = [
  {
    id: 'kapitalwert', cat: 'invest', title: 'Kapitalwert & interner Zinsfuß', file: 'Kapitalwert_Interner_Zinsfuss.xlsx',
    desc: 'Lohnt sich die Investition? Barwerte, Kapitalwert, IZF und Entscheidung – bis 8 Jahre.', key: ['B22', 'B23'],
    build() {
      const b = builder(5).title('Kapitalwert & interner Zinsfuß', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Anschaffungsauszahlung (t = 0)').inp('B5', 50000, 'eur', { min: 0 });
      b.lab('A6', 'Kalkulationszinssatz').inp('B6', 0.08, 'pct', { min: -0.5, max: 1 });
      b.sec(8, 'Zahlungsreihe');
      b.th(9, ['Jahr', 'Zahlung', 'Abzinsungsfaktor', 'Barwert', 'Kumulierter Barwert']);
      b.txt('A10', 0, { fmt: 'int' }).fx('B10', '-B5', 'eur').fx('C10', '1/(1+$B$6)^A10', 'f4').fx('D10', 'B10*C10', 'eur').fx('E10', 'D10', 'eur');
      const cf = [15000, 15000, 15000, 15000, 15000, 0, 0, 0];
      range(1, 8).forEach(t => { const r = 10 + t; b.txt('A' + r, t, { fmt: 'int' }).inp('B' + r, cf[t - 1], 'eur').fx('C' + r, `1/(1+$B$6)^A${r}`, 'f4').fx('D' + r, `B${r}*C${r}`, 'eur').fx('E' + r, `E${r - 1}+D${r}`, 'eur'); });
      // Hilfsrechnung IZF (Spalten G–I, Hilfswerte K–L), siehe izfHilfe in tpl-invest.js
      b.th(9, ['Vorzeichen (ohne Nullen)', 'Vorzeichen C₀ bei 1 + i = 10^k (k = −6; −5,5; … 6)', 'Skalierte Zahlung', '', 'Hilfswert IZF', 'Wert'], 7);
      const iz = izfHilfe(b, { Z: 'B', r0: 10, V: 'G', G: 'H', S: 'I', lab: 'K', out: 'L', top: 10 });
      b.sec(20, 'Ergebnis');
      b.lab('A21', 'Summe der Barwerte (Jahr 1 – 8)').fx('B21', 'SUM(D11:D18)', 'eur');
      b.lab('A22', 'Kapitalwert C₀').res('B22', 'NPV(B6,B11:B18)+B10', 'eur');
      b.lab('A23', 'Interner Zinsfuß').res('B23', izfText(iz), 'pct');
      b.lab('A24', 'Entscheidung').res('B24', 'IF(B22>0,"Vorteilhaft (C₀ > 0)",IF(B22<0,"Nicht vorteilhaft (C₀ < 0)","Indifferent (C₀ = 0)"))', 'txt').merge('B24:E24');
      b.note('A26', 'Jahre ohne Rückfluss einfach auf 0 lassen. Ein Restwert gehört in die Zahlung des letzten Jahres.');
      b.note('A27', 'IZF nur bei Normalinvestition (genau ein Vorzeichenwechsel). Bei mehreren Vorzeichenwechseln kann es keinen, einen oder mehrere Zinsfüße geben – solche Reihen untersucht die Vorlage nicht. Hilfsrechnung rechts (Spalten G–L): Vorzeichenwechsel zählen, IZF per Kapitalwert bei 1 + i = 10^k auf eine halbe Zehnerpotenz eingrenzen (Untergrenze q) und Reihe mit q skalieren, damit Excel auch extreme IZF findet (IZF = q · (1 + IKV der skalierten Reihe) − 1).');
      return { name: 'Kapitalwert', cols: [34, 18, 18, 18, 22, 3, 14, 24, 16, 3, 28, 16], cells: b.cells, merges: b.merges,
        explain: { B22: 'NBW zinst ab Jahr 1 ab – deshalb wird die Zahlung aus t = 0 (negativ) separat addiert. C₀ > 0: Investition lohnt sich.', B23: 'Der Zinssatz, bei dem der Kapitalwert genau 0 ist. Bei einer Normalinvestition (erst Auszahlung, danach nur Rückflüsse) gilt: Liegt er über dem Kalkulationszins, ist der Kapitalwert positiv und die Investition vorteilhaft.', C10: 'Abzinsungsfaktor (1 + i)^−t' } };
    }
  },
  {
    id: 'annuitaet', cat: 'finanz', title: 'Annuitätendarlehen & Tilgungsplan', file: 'Annuitaetendarlehen_Tilgungsplan.xlsx',
    desc: 'Rate, Zinsen und Tilgung Jahr für Jahr – Restschuld bis auf 0, bis 20 Jahre.', key: ['B10', 'B11'],
    build() {
      const b = builder(6).title('Annuitätendarlehen & Tilgungsplan', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Darlehensbetrag').inp('B5', 100000, 'eur', { min: 0 });
      b.lab('A6', 'Zinssatz p. a.').inp('B6', 0.05, 'pct', { min: 0, max: 1 });
      b.lab('A7', 'Laufzeit in Jahren (1 – 20)').inp('B7', 10, 'int', { min: 1, max: 20 });
      b.sec(9, 'Ergebnis');
      b.lab('A10', 'Annuität (jährliche Rate)').res('B10', 'PMT(B6,B7,-B5)', 'eur');
      b.lab('A11', 'Summe der Zinsen').res('B11', 'SUM(C16:C35)', 'eur');
      b.lab('A12', 'Summe der Tilgung').fx('B12', 'SUM(D16:D35)', 'eur');
      b.lab('A13', 'Gesamtauszahlung (Zinsen + Tilgung)').fx('B13', 'B11+B12', 'eur');
      b.th(15, ['Jahr', 'Restschuld Anfang', 'Zinsen', 'Tilgung', 'Annuität', 'Restschuld Ende']);
      range(1, 20).forEach(k => { const r = 15 + k, e = `A${r}=""`;
        b.fx('A' + r, `IF(${k}<=$B$7,${k},"")`, 'int').fx('B' + r, k === 1 ? `IF(${e},"",$B$5)` : `IF(${e},"",F${r - 1})`, 'eur').fx('C' + r, `IF(${e},"",B${r}*$B$6)`, 'eur')
          .fx('D' + r, `IF(${e},"",E${r}-C${r})`, 'eur').fx('E' + r, `IF(${e},"",$B$10)`, 'eur').fx('F' + r, `IF(${e},"",IF(ABS(B${r}-D${r})<0.005,0,B${r}-D${r}))`, 'eur'); });
      return { name: 'Tilgungsplan', cols: [30, 19, 17, 17, 17, 19], cells: b.cells, merges: b.merges,
        explain: { B10: 'RMZ rechnet die gleichbleibende Rate: A = K · (q^n · i) / (q^n − 1).', C16: 'Zinsen = Restschuld am Jahresanfang × Zinssatz.', D16: 'Tilgung = Annuität − Zinsen. Sie steigt jedes Jahr, weil die Zinsen sinken.' } };
    }
  },
  {
    id: 'amortisation', cat: 'invest', title: 'Amortisationsrechnung (statisch & dynamisch)', file: 'Amortisationsrechnung.xlsx',
    desc: 'Nach wie vielen Jahren ist das Geld zurück – mit und ohne Abzinsung, auf zwei Nachkommastellen.', key: ['B9', 'B10'],
    build() {
      const b = builder(7).title('Amortisationsrechnung (statisch & dynamisch)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Anschaffungsauszahlung').inp('B5', 80000, 'eur', { min: 0 });
      b.lab('A6', 'Kalkulationszinssatz').inp('B6', 0.06, 'pct', { min: -0.5, max: 1 });
      b.sec(8, 'Ergebnis');
      b.lab('A9', 'Statische Amortisationszeit').res('B9', 'IF(B5=0,0,IF(COUNT(F14:F23)=0,"keine Amortisation",MIN(F14:F23)))', 'yrs');
      b.lab('A10', 'Dynamische Amortisationszeit').res('B10', 'IF(B5=0,0,IF(COUNT(G14:G23)=0,"keine Amortisation",MIN(G14:G23)))', 'yrs');
      b.th(13, ['Jahr', 'Rückfluss', 'Kumuliert', 'Barwert', 'Barwert kumuliert', 'Amortisiert (statisch)', 'Amortisiert (dynamisch)']);
      const cf = [20000, 22000, 24000, 24000, 20000, 0, 0, 0, 0, 0];
      range(1, 10).forEach(t => { const r = 13 + t, p = r - 1;
        b.txt('A' + r, t, { fmt: 'int' }).inp('B' + r, cf[t - 1], 'eur').fx('C' + r, t === 1 ? `B${r}` : `C${p}+B${r}`, 'eur').fx('D' + r, `B${r}/(1+$B$6)^A${r}`, 'eur').fx('E' + r, t === 1 ? `D${r}` : `E${p}+D${r}`, 'eur')
          .fx('F' + r, t === 1 ? `IF(AND($B$5>0,C${r}>=$B$5),A${r}-1+$B$5/B${r},"")` : `IF(AND(C${p}<$B$5,C${r}>=$B$5,COUNT(F$14:F${p})=0),A${r}-1+($B$5-C${p})/B${r},"")`, 'yrs')
          .fx('G' + r, t === 1 ? `IF(AND($B$5>0,E${r}>=$B$5),A${r}-1+$B$5/D${r},"")` : `IF(AND(E${p}<$B$5,E${r}>=$B$5,COUNT(G$14:G${p})=0),A${r}-1+($B$5-E${p})/D${r},"")`, 'yrs'); });
      b.note('A25', 'Unterjährig wird linear interpoliert: Jahr − 1 + fehlender Betrag / Rückfluss des Jahres.');
      return { name: 'Amortisation', cols: [30, 16, 16, 16, 18, 20, 21], cells: b.cells, merges: b.merges,
        explain: { B9: 'Erstes Jahr, in dem die kumulierten Rückflüsse die Anschaffung erreichen (interpoliert).', B10: 'Wie statisch, aber mit abgezinsten Rückflüssen. Bei positivem Zins dauert sie mindestens so lange wie die statische.' } };
    }
  },
  {
    id: 'kostenvergleich', cat: 'invest', title: 'Kostenvergleichsrechnung', file: 'Kostenvergleichsrechnung.xlsx',
    desc: 'Zwei Anlagen im Vergleich: kalkulatorische AfA, Zinsen, Stückkosten und kritische Menge.', key: ['B24', 'B26'],
    build() {
      const b = builder(3).title('Kostenvergleichsrechnung', SUB);
      b.sec(4, 'Eingaben');
      b.th(5, ['', 'Anlage A', 'Anlage B']);
      const rows = [['Anschaffungskosten', 120000, 90000, 'eur'], ['Restwert (höchstens Anschaffungskosten)', 10000, 5000, 'eur'], ['Nutzungsdauer (Jahre)', 8, 6, 'int'], ['Kalkulationszinssatz', 0.06, 0.06, 'pct'], ['Sonstige Fixkosten p. a.', 8000, 6000, 'eur'], ['Variable Kosten je Stück', 2.5, 3.2, 'eur'], ['Leistungsmenge p. a. (Stück)', 20000, 20000, 'int']];
      rows.forEach(([t, a, c, f], k) => { const r = 6 + k; b.lab('A' + r, t).inp('B' + r, a, f, { min: 0, max: f === 'int' && k === 2 ? 100 : undefined }).inp('C' + r, c, f, { min: 0 }); });
      b.cells.B8.min = 1; b.cells.C8.min = 1;
      b.sec(14, 'Kosten pro Jahr');
      const out = [['Kalkulatorische Abschreibung', X => `(${X}6-${X}7)/${X}8`], ['Kalkulatorische Zinsen', X => `(${X}6+${X}7)/2*${X}9`], ['Sonstige Fixkosten', X => `${X}10`]];
      out.forEach(([t, f], k) => { const r = 15 + k; b.lab('A' + r, t).fx('B' + r, f('B'), 'eur').fx('C' + r, f('C'), 'eur'); });
      b.lab('A18', '= Fixkosten gesamt').tot('B18', 'B15+B16+B17', 'eur').tot('C18', 'C15+C16+C17', 'eur');
      b.lab('A19', 'Variable Kosten').fx('B19', 'B11*B12', 'eur').fx('C19', 'C11*C12', 'eur');
      b.lab('A20', '= Gesamtkosten').res('B20', 'B18+B19', 'eur').res('C20', 'C18+C19', 'eur');
      b.lab('A21', 'Kosten je Stück').fx('B21', 'IFERROR(B20/B12,"–")', 'eur').fx('C21', 'IFERROR(C20/C12,"–")', 'eur');
      b.sec(23, 'Ergebnis');
      b.lab('A24', 'Günstigere Anlage').res('B24', 'IF(OR(B7>B6,C7>C6),"Eingaben prüfen – Restwert über Anschaffungskosten",IF(B20<C20,"Anlage A",IF(C20<B20,"Anlage B","Beide gleich teuer")))', 'txt').merge('B24:C24');
      b.lab('A25', 'Kostenvorteil pro Jahr').fx('B25', 'ABS(B20-C20)', 'eur');
      b.lab('A26', 'Kritische Menge (Stück)').res('B26', 'IF(B11=C11,"keine – gleiche variable Kosten",IF((C18-B18)/(B11-C11)<0,"keine – eine Anlage ist immer günstiger",(C18-B18)/(B11-C11)))', 'num');
      b.note('A28', 'Kritische Menge: Ab hier kippt der Kostenvorteil (bei ganzen Stück: aufrunden). Der Vergleich setzt gleiche Leistungsmenge und Qualität voraus. Kalkulatorische Zinsen auf das durchschnittlich gebundene Kapital (AK + Restwert) / 2.');
      return { name: 'Kostenvergleich', cols: [36, 19, 19], cells: b.cells, merges: b.merges,
        explain: { B15: 'Kalkulatorische AfA = (Anschaffungskosten − Restwert) / Nutzungsdauer.', B16: 'Kalkulatorische Zinsen = (AK + Restwert) / 2 × Zinssatz.', B26: 'Menge, bei der beide Anlagen gleich viel kosten: (Fix_B − Fix_A) / (kv_A − kv_B).' } };
    }
  },
  {
    id: 'breakeven', cat: 'kosten', title: 'Break-even-Analyse', file: 'Break-even-Analyse.xlsx',
    desc: 'Gewinnschwelle in Stück und Euro, Sicherheitsabstand und Gewinn-Tabelle.', key: ['B14', 'B16'],
    build() {
      const b = builder(6).title('Break-even-Analyse', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Fixkosten pro Periode').inp('B5', 60000, 'eur', { min: 0 });
      b.lab('A6', 'Verkaufspreis je Stück').inp('B6', 50, 'eur', { min: 0 });
      b.lab('A7', 'Variable Kosten je Stück').inp('B7', 30, 'eur', { min: 0 });
      b.lab('A8', 'Geplante Absatzmenge (Stück)').inp('B8', 4000, 'int', { min: 0 });
      b.sec(10, 'Ergebnis');
      b.lab('A11', 'Deckungsbeitrag je Stück').fx('B11', 'ROUND(B6-B7,10)', 'eur');
      b.lab('A12', 'Deckungsbeitragsquote').fx('B12', 'IFERROR(B11/B6,"–")', 'pct');
      b.lab('A13', 'Break-even-Menge (exakt)').fx('B13', 'IF(B11<=0,"kein Break-even",B5/B11)', 'num');
      b.lab('A14', 'Break-even-Menge (aufgerundet)').res('B14', 'IF(B11<=0,"kein Break-even",ROUNDUP(ROUND(B5/B11,6),0))', 'stk');
      b.lab('A15', 'Break-even-Umsatz').fx('B15', 'IF(B11<=0,"–",B5/B11*B6)', 'eur');
      b.lab('A16', 'Gewinn bei geplanter Menge').res('B16', 'B8*B11-B5', 'eur');
      b.lab('A17', 'Sicherheitsabstand').fx('B17', 'IF(OR(B11<=0,B8=0),"–",(B8-B5/B11)/B8)', 'pct');
      b.sec(19, 'Gewinnschwellen-Tabelle');
      b.th(20, ['Menge', 'Umsatz', 'Fixkosten', 'Variable Kosten', 'Gesamtkosten', 'Gewinn']);
      range(0, 12).forEach(k => { const r = 21 + k; b.fx('A' + r, `ROUND($B$8/10*${k},0)`, 'int').fx('B' + r, `A${r}*$B$6`, 'eur').fx('C' + r, '$B$5', 'eur').fx('D' + r, `A${r}*$B$7`, 'eur').fx('E' + r, `C${r}+D${r}`, 'eur').fx('F' + r, `B${r}-E${r}`, 'eur'); });
      return { name: 'Break-even', cols: [34, 17, 17, 17, 17, 17], cells: b.cells, merges: b.merges, chart: { x: 'A21:A33', series: [['Umsatz', 'B21:B33'], ['Gesamtkosten', 'E21:E33']] },
        explain: { B13: 'Break-even-Menge = Fixkosten / Deckungsbeitrag je Stück.', B17: 'Um wie viel Prozent die Menge sinken darf, bis Verlust entsteht.' } };
    }
  },
  {
    id: 'deckungsbeitrag', cat: 'kosten', title: 'Mehrstufige Deckungsbeitragsrechnung', file: 'Mehrstufige_Deckungsbeitragsrechnung.xlsx',
    desc: '3 Produkte, 2 Erzeugnisgruppen: DB I, II, III bis zum Betriebsergebnis.', key: ['E18'],
    build() {
      const b = builder(5).title('Mehrstufige Deckungsbeitragsrechnung', SUB);
      b.th(4, ['Position', 'Produkt A', 'Produkt B', 'Produkt C', 'Gesamt']);
      b.lab('A5', 'Erzeugnisgruppe').txt('B5', 'Gruppe 1', { s: 'th' }).merge('B5:C5').txt('D5', 'Gruppe 2', { s: 'th' });
      const inp = [['Absatzmenge (Stück)', [1000, 2000, 1500], 'int'], ['Verkaufspreis je Stück', [80, 50, 40], 'eur'], ['Variable Kosten je Stück', [45, 30, 22], 'eur']];
      inp.forEach(([t, vs, f], k) => { const r = 6 + k; b.lab('A' + r, t); ['B', 'C', 'D'].forEach((X, j) => b.inp(X + r, vs[j], f, { min: 0 })); });
      b.fx('E6', 'SUM(B6:D6)', 'int');
      const P = ['B', 'C', 'D'];
      b.lab('A9', 'Umsatzerlöse'); P.forEach(X => b.fx(X + 9, `${X}6*${X}7`, 'eur')); b.fx('E9', 'SUM(B9:D9)', 'eur');
      b.lab('A10', '− Variable Kosten'); P.forEach(X => b.fx(X + 10, `${X}6*${X}8`, 'eur')); b.fx('E10', 'SUM(B10:D10)', 'eur');
      b.lab('A11', '= Deckungsbeitrag I'); P.forEach(X => b.tot(X + 11, `${X}9-${X}10`, 'eur')); b.tot('E11', 'SUM(B11:D11)', 'eur');
      b.lab('A12', '− Erzeugnisfixkosten'); [10000, 12000, 8000].forEach((v, j) => b.inp(P[j] + 12, v, 'eur', { min: 0 })); b.fx('E12', 'SUM(B12:D12)', 'eur');
      b.lab('A13', '= Deckungsbeitrag II'); P.forEach(X => b.tot(X + 13, `${X}11-${X}12`, 'eur')); b.tot('E13', 'SUM(B13:D13)', 'eur');
      b.lab('A14', '− Erzeugnisgruppenfixkosten').inp('B14', 15000, 'eur', { min: 0 }).merge('B14:C14').inp('D14', 5000, 'eur', { min: 0 }).fx('E14', 'B14+D14', 'eur');
      b.lab('A15', '= Deckungsbeitrag III').tot('B15', 'B13+C13-B14', 'eur').merge('B15:C15').tot('D15', 'D13-D14', 'eur').tot('E15', 'B15+D15', 'eur');
      b.lab('A16', '− Unternehmensfixkosten').inp('E16', 20000, 'eur', { min: 0 });
      b.lab('A18', '= Betriebsergebnis').res('E18', 'E15-E16', 'eur');
      b.note('A20', 'Gruppe 1 = Produkt A + B, Gruppe 2 = Produkt C. DB III der Gruppe 1 = DB II von A und B minus Gruppenfixkosten.');
      return { name: 'DB-Rechnung', cols: [34, 17, 17, 17, 18], cells: b.cells, merges: b.merges,
        explain: { B11: 'DB I = Umsatz − variable Kosten.', B13: 'DB II = DB I − Fixkosten, die nur dieses Produkt verursacht.', E18: 'Betriebsergebnis = Summe DB III − Unternehmensfixkosten.' } };
    }
  },
  {
    id: 'zuschlag', cat: 'kosten', title: 'Zuschlagskalkulation (Industrie)', file: 'Zuschlagskalkulation.xlsx',
    desc: 'Vom Material bis zum Listenverkaufspreis – mit Skonto, Provision und Rabatt im Hundert.', key: ['C16', 'C23'],
    build() {
      const b = builder(3).title('Zuschlagskalkulation (Industrie)', SUB);
      b.th(4, ['Position', 'Zuschlag', 'Betrag']);
      const L = (r, t) => b.lab('A' + r, t);
      L(5, 'Materialeinzelkosten (MEK)'); b.inp('C5', 200, 'eur', { min: 0 });
      L(6, '+ Materialgemeinkosten (MGK)'); b.inp('B6', 0.10, 'pct', { min: 0 }).fx('C6', 'C5*B6', 'eur');
      L(7, '= Materialkosten'); b.tot('C7', 'C5+C6', 'eur');
      L(8, 'Fertigungseinzelkosten (Fertigungslöhne)'); b.inp('C8', 150, 'eur', { min: 0 });
      L(9, '+ Fertigungsgemeinkosten (FGK)'); b.inp('B9', 1.2, 'pct', { min: 0 }).fx('C9', 'C8*B9', 'eur');
      L(10, '+ Sondereinzelkosten der Fertigung'); b.inp('C10', 20, 'eur', { min: 0 });
      L(11, '= Fertigungskosten'); b.tot('C11', 'C8+C9+C10', 'eur');
      L(12, '= Herstellkosten'); b.tot('C12', 'C7+C11', 'eur');
      L(13, '+ Verwaltungsgemeinkosten (auf HK)'); b.inp('B13', 0.15, 'pct', { min: 0 }).fx('C13', 'C12*B13', 'eur');
      L(14, '+ Vertriebsgemeinkosten (auf HK)'); b.inp('B14', 0.10, 'pct', { min: 0 }).fx('C14', 'C12*B14', 'eur');
      L(15, '+ Sondereinzelkosten des Vertriebs'); b.inp('C15', 0, 'eur', { min: 0 });
      L(16, '= Selbstkosten'); b.tot('C16', 'C12+C13+C14+C15', 'eur');
      L(17, '+ Gewinnzuschlag'); b.inp('B17', 0.12, 'pct', { min: 0 }).fx('C17', 'C16*B17', 'eur');
      L(18, '= Barverkaufspreis'); b.tot('C18', 'C16+C17', 'eur');
      L(19, '+ Kundenskonto (im Hundert)'); b.inp('B19', 0.02, 'pct', { min: 0, max: 0.5 }).fx('C19', 'IFERROR(C21*B19,"–")', 'eur');
      L(20, '+ Vertreterprovision (im Hundert)'); b.inp('B20', 0, 'pct', { min: 0, max: 0.5 }).fx('C20', 'IFERROR(C21*B20,"–")', 'eur');
      L(21, '= Zielverkaufspreis'); b.tot('C21', 'IF(B19+B20>=1,"–",C18/(1-B19-B20))', 'eur');
      L(22, '+ Kundenrabatt (im Hundert)'); b.inp('B22', 0.10, 'pct', { min: 0, max: 0.9 }).fx('C22', 'IFERROR(C23-C21,"–")', 'eur');
      L(23, '= Listenverkaufspreis (netto)'); b.res('C23', 'IFERROR(C21/(1-B22),"–")', 'eur');
      b.note('A25', 'VwGK und VtGK auf Basis der Herstellkosten. Skonto und Provision im Hundert vom Zielverkaufspreis, Rabatt im Hundert vom Listenverkaufspreis.');
      return { name: 'Kalkulation', cols: [42, 14, 18], cells: b.cells, merges: b.merges,
        explain: { C21: 'Skonto und Provision werden vom Zielverkaufspreis gerechnet (im Hundert): Barverkaufspreis / (1 − Skonto − Provision).', C23: 'Rabatt im Hundert: Zielverkaufspreis / (1 − Rabatt).' } };
    }
  },
  {
    id: 'bab', cat: 'kosten', title: 'Betriebsabrechnungsbogen (BAB)', file: 'Betriebsabrechnungsbogen_BAB.xlsx',
    desc: 'Gemeinkosten per Schlüssel auf 4 Kostenstellen verteilen und Zuschlagssätze ermitteln.', key: ['B29', 'B30', 'B31', 'B32'],
    build() {
      const b = builder(8).title('Betriebsabrechnungsbogen (BAB)', SUB);
      b.sec(4, '1. Gemeinkosten und Verteilungsschlüssel (in %)');
      b.th(5, ['Gemeinkostenart', 'Betrag gesamt', 'Material', 'Fertigung', 'Verwaltung', 'Vertrieb', 'Summe %', 'Prüfung']);
      const G = [['Hilfslöhne', 40000, [0.10, 0.70, 0.10, 0.10]], ['Gehälter', 60000, [0.10, 0.20, 0.50, 0.20]], ['Energie', 30000, [0.10, 0.75, 0.05, 0.10]], ['Miete', 24000, [0.15, 0.50, 0.20, 0.15]], ['Abschreibungen', 36000, [0.10, 0.70, 0.10, 0.10]], ['Sonstige Gemeinkosten', 10000, [0.20, 0.30, 0.30, 0.20]]];
      const S = ['C', 'D', 'E', 'F'];
      G.forEach(([t, v, p], k) => { const r = 6 + k; b.inp('A' + r, t, 'txt').inp('B' + r, v, 'eur', { min: 0 }); S.forEach((X, j) => b.inp(X + r, p[j], 'pct1', { min: 0, max: 1 })); b.fx('G' + r, `SUM(C${r}:F${r})`, 'pct1').fx('H' + r, `IF(ROUND(G${r},4)=1,"✓","≠ 100 %")`, 'txt'); });
      b.sec(13, '2. Verteilte Gemeinkosten (in €)');
      b.th(14, ['Gemeinkostenart', '', 'Material', 'Fertigung', 'Verwaltung', 'Vertrieb', 'Summe']);
      G.forEach((_, k) => { const r = 15 + k, s = 6 + k; b.fx('A' + r, `A${s}`, 'txt'); S.forEach(X => b.fx(X + r, `$B${s}*${X}${s}`, 'eur')); b.fx('G' + r, `SUM(C${r}:F${r})`, 'eur'); });
      b.lab('A21', 'Summe Gemeinkosten'); S.forEach(X => b.tot(X + 21, `SUM(${X}15:${X}20)`, 'eur')); b.tot('G21', 'SUM(C21:F21)', 'eur');
      b.sec(23, '3. Zuschlagsgrundlagen und Zuschlagssätze');
      b.lab('A24', 'Materialeinzelkosten (MEK)').inp('B24', 200000, 'eur', { min: 0 });
      b.lab('A25', 'Fertigungslöhne (Fertigungseinzelkosten)').inp('B25', 120000, 'eur', { min: 0 });
      b.lab('A26', 'Herstellkosten (MEK + MGK + FL + FGK)').fx('B26', 'B24+C21+B25+D21', 'eur');
      b.th(28, ['Zuschlagssatz', 'Wert', 'Basis']);
      b.lab('A29', 'Materialgemeinkosten-Zuschlag').res('B29', 'IFERROR(C21/B24,"–")', 'pct').txt('C29', 'MGK / Materialeinzelkosten');
      b.lab('A30', 'Fertigungsgemeinkosten-Zuschlag').res('B30', 'IFERROR(D21/B25,"–")', 'pct').txt('C30', 'FGK / Fertigungslöhne');
      b.lab('A31', 'Verwaltungsgemeinkosten-Zuschlag').res('B31', 'IFERROR(E21/B26,"–")', 'pct').txt('C31', 'VwGK / Herstellkosten');
      b.lab('A32', 'Vertriebsgemeinkosten-Zuschlag').res('B32', 'IFERROR(F21/B26,"–")', 'pct').txt('C32', 'VtGK / Herstellkosten');
      [29, 30, 31, 32].forEach(r => b.merge(`C${r}:E${r}`));
      b.note('A34', 'Herstellkosten ohne Bestandsveränderungen (Herstellkosten der Erzeugung = des Umsatzes). Jede Zeile im Schlüssel muss 100 % ergeben.');
      return { name: 'BAB', cols: [38, 16, 13, 13, 13, 13, 12, 11], cells: b.cells, merges: b.merges,
        explain: { C15: 'Betrag der Gemeinkostenart × Schlüssel der Kostenstelle.', B29: 'MGK-Zuschlag = Materialgemeinkosten / Materialeinzelkosten.', B31: 'VwGK-Zuschlag = Verwaltungsgemeinkosten / Herstellkosten.' } };
    }
  },
  {
    id: 'abschreibung', cat: 'rewe', title: 'Abschreibung: linear vs. degressiv', file: 'Abschreibung_linear_degressiv.xlsx',
    desc: 'Abschreibungsplan mit Buchwerten und automatischem Wechsel zur linearen AfA – bis 15 Jahre.', key: ['B12', 'B13'],
    build() {
      const b = builder(7).title('Abschreibung: linear vs. geometrisch-degressiv', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Anschaffungskosten').inp('B5', 50000, 'eur', { min: 0 });
      b.lab('A6', 'Nutzungsdauer (1 – 15 Jahre)').inp('B6', 10, 'int', { min: 1, max: 15 });
      b.lab('A7', 'Restwert am Ende (höchstens Anschaffungskosten)').inp('B7', 0, 'eur', { min: 0 });
      b.lab('A8', 'Degressiver Satz').inp('B8', 0.2, 'pct', { min: 0, max: 1 });
      b.note('A9', 'Steuerlich ist die degressive AfA für bewegliche Wirtschaftsgüter mit Anschaffung vom 01.07.2025 bis 31.12.2027 erlaubt (höchstens das Dreifache des linearen Satzes, maximal 30 %; die Vorlage rechnet volle Jahre ohne Monatsanteil im Anschaffungsjahr) – für Klausuren gilt der Satz aus der Aufgabe.');
      b.sec(11, 'Ergebnis');
      b.lab('A12', 'Lineare AfA pro Jahr').res('B12', '(B5-B7)/B6', 'eur');
      b.lab('A13', 'Wechsel zur linearen AfA ab Jahr').res('B13', 'IFERROR(INDEX(A17:A31,MATCH("linear",G17:G31,0)),"kein Wechsel")', 'int');
      b.th(16, ['Jahr', 'AfA linear', 'Buchwert linear', 'Buchwert Anfang', 'AfA degressiv', 'Buchwert Ende', 'Methode']);
      range(1, 15).forEach(k => { const r = 16 + k, e = `A${r}=""`, D = `D${r}`, rest = `($B$6-A${r}+1)`;
        b.fx('A' + r, `IF(${k}<=$B$6,${k},"")`, 'int').fx('B' + r, `IF(${e},"",$B$12)`, 'eur').fx('C' + r, k === 1 ? `IF(${e},"",$B$5-B${r})` : `IF(${e},"",C${r - 1}-B${r})`, 'eur')
          .fx('D' + r, k === 1 ? `IF(${e},"",$B$5)` : `IF(${e},"",F${r - 1})`, 'eur')
          .fx('E' + r, `IF(${e},"",MIN(MAX(${D}*$B$8,(${D}-$B$7)/${rest}),${D}-$B$7))`, 'eur')
          .fx('F' + r, `IF(${e},"",${D}-E${r})`, 'eur')
          .fx('G' + r, `IF(${e},"",IF(ROUND((${D}-$B$7)/${rest}-${D}*$B$8,6)>=0,"linear","degressiv"))`, 'txt'); });
      return { name: 'Abschreibung', cols: [34, 16, 17, 17, 16, 17, 13], cells: b.cells, merges: b.merges,
        explain: { E17: 'Degressiv: Restbuchwert × Satz. Sobald (Restbuchwert − Restwert) / Restnutzungsdauer mindestens so groß ist wie die degressive Abschreibung, wird linear weiter abgeschrieben.', B12: 'Lineare AfA = (Anschaffungskosten − Restwert) / Nutzungsdauer.' } };
    }
  },
  {
    id: 'kennzahlen', cat: 'rewe', title: 'Bilanzkennzahlen & Rentabilität', file: 'Bilanzkennzahlen_Rentabilitaet.xlsx',
    desc: 'Bilanz eintragen – 13 Kennzahlen von EK-Quote bis ROI mit Einschätzung.', key: ['B20', 'B28'],
    build() {
      const b = builder(4).title('Bilanzkennzahlen & Rentabilität', SUB);
      b.sec(4, 'Bilanz');
      b.th(5, ['Aktiva', 'Betrag', 'Passiva', 'Betrag']);
      const A = [['Anlagevermögen', 400000], ['Vorräte', 120000], ['Forderungen', 80000], ['Liquide Mittel', 40000]], P = [['Eigenkapital', 250000], ['Langfristiges Fremdkapital', 200000], ['Kurzfristiges Fremdkapital', 190000]];
      A.forEach(([t, v], k) => b.lab('A' + (6 + k), t).inp('B' + (6 + k), v, 'eur', { min: 0 }));
      P.forEach(([t, v], k) => b.lab('C' + (6 + k), t).inp('D' + (6 + k), v, 'eur', { min: 0 }));
      b.lab('A10', 'Summe Aktiva').tot('B10', 'SUM(B6:B9)', 'eur').lab('C10', 'Summe Passiva').tot('D10', 'SUM(D6:D8)', 'eur');
      b.lab('A11', 'Bilanz ausgeglichen?').fx('B11', 'IF(ROUND(B10-D10,2)=0,"✓ Aktiva = Passiva","✗ Aktiva und Passiva weichen ab")', 'txt').merge('B11:D11');
      b.sec(13, 'Werte aus der GuV');
      b.lab('A14', 'Umsatzerlöse').inp('B14', 900000, 'eur', { min: 0 });
      b.lab('A15', 'Jahresüberschuss').inp('B15', 45000, 'eur');
      b.lab('A16', 'Zinsaufwand').inp('B16', 12000, 'eur', { min: 0 });
      b.sec(18, 'Kennzahlen');
      b.th(19, ['Kennzahl', 'Wert', 'Formel', 'Einschätzung']);
      // Gesamtkapital = Summe Passiva (EK + FK, D10). Nicht definierte Kennzahlen (Division durch 0) zeigen „–“ statt 0.
      const K = [
        ['Eigenkapitalquote', 'IFERROR(D6/D10,"–")', 'pct', 'Eigenkapital / Gesamtkapital', 'IF(D10=0,"nicht bestimmbar (kein Kapital)",IF(B20>=0.3,"solide (≥ 30 %)","eher niedrig (< 30 %)"))'],
        ['Fremdkapitalquote', 'IFERROR((D7+D8)/D10,"–")', 'pct', 'Fremdkapital / Gesamtkapital', ''],
        ['Verschuldungsgrad', 'IFERROR((D7+D8)/D6,"–")', 'x2', 'Fremdkapital / Eigenkapital', 'IF(D6=0,IF(D7+D8=0,"nicht bestimmbar (kein Kapital)","nicht definiert – kein Eigenkapital"),IF(B22<=2,"vertretbar (≤ 2)","hoch (> 2)"))'],
        ['Anlagendeckungsgrad I', 'IFERROR(D6/B6,"–")', 'pct', 'Eigenkapital / Anlagevermögen', 'IF(B6=0,"nicht bestimmbar (kein Anlagevermögen)",IF(B23>=1,"AV voll durch EK gedeckt","unter 100 %"))'],
        ['Anlagendeckungsgrad II', 'IFERROR((D6+D7)/B6,"–")', 'pct', '(EK + langfr. FK) / Anlagevermögen', 'IF(B6=0,"nicht bestimmbar (kein Anlagevermögen)",IF(B24>=1,"goldene Bilanzregel erfüllt","goldene Bilanzregel verletzt"))'],
        ['Liquidität 1. Grades', 'IFERROR(B9/D8,"–")', 'pct', 'Liquide Mittel / kurzfr. FK', 'IF(D8=0,"nicht bestimmbar (kein kurzfr. FK)",IF(B25>=0.2,"ok (≥ 20 %)","knapp (< 20 %)"))'],
        ['Liquidität 2. Grades', 'IFERROR((B9+B8)/D8,"–")', 'pct', '(Liquide Mittel + Forderungen) / kurzfr. FK', 'IF(D8=0,"nicht bestimmbar (kein kurzfr. FK)",IF(B26>=1,"ok (≥ 100 %)","kritisch (< 100 %)"))'],
        ['Liquidität 3. Grades', 'IFERROR((B7+B8+B9)/D8,"–")', 'pct', 'Umlaufvermögen / kurzfr. FK', 'IF(D8=0,"nicht bestimmbar (kein kurzfr. FK)",IF(B27>=1.2,"ok (≥ 120 %)","knapp (< 120 %)"))'],
        ['Eigenkapitalrentabilität', 'IFERROR(B15/D6,"–")', 'pct', 'Jahresüberschuss / Eigenkapital', ''],
        ['Gesamtkapitalrentabilität', 'IFERROR((B15+B16)/D10,"–")', 'pct', '(Jahresüberschuss + Zinsaufwand) / Gesamtkapital', ''],
        ['Umsatzrentabilität', 'IFERROR(B15/B14,"–")', 'pct', 'Jahresüberschuss / Umsatzerlöse', ''],
        ['Kapitalumschlag', 'IFERROR(B14/D10,"–")', 'x2', 'Umsatzerlöse / Gesamtkapital', ''],
        ['Return on Investment (ROI)', 'IFERROR(B30*B31,IFERROR(B15/D10,"–"))', 'pct', 'Umsatzrentabilität × Kapitalumschlag (= JÜ / Gesamtkapital)', '']];
      K.forEach(([t, f, fm, txt, ev], k) => { const r = 20 + k; b.lab('A' + r, t).res('B' + r, f, fm).txt('C' + r, txt); if (ev) b.fx('D' + r, ev, 'txt'); });
      b.note('A34', 'Richtwerte sind Faustregeln aus der Literatur – je nach Branche weichen sie ab.');
      b.note('A35', 'Gesamtkapital = Summe Passiva (EK + FK). Weichen Aktiva und Passiva ab (Zeile 11 ✗), erst die Bilanz korrigieren – sonst sind die Kennzahlen nicht aussagekräftig. „–“ = nicht definiert (Division durch 0).');
      return { name: 'Kennzahlen', cols: [32, 17, 40, 30], cells: b.cells, merges: b.merges,
        explain: { B20: 'Anteil des Eigenkapitals am Gesamtkapital.', B24: 'Goldene Bilanzregel: langfristiges Vermögen langfristig finanziert.', B32: 'ROI nach DuPont: Umsatzrentabilität × Kapitalumschlag = Jahresüberschuss / Gesamtkapital.' } };
    }
  }
];

// Reihenfolge in der Galerie: nach Bereich (wie CATS), innerhalb des Bereichs Grundstock zuerst
const ALL = [...BASE, ...INVEST, ...KOSTEN, ...REWE, ...OPS];
export const TEMPLATES = CATS.flatMap(([c]) => ALL.filter(t => t.cat === c));
export const byId = id => TEMPLATES.find(t => t.id === id);
