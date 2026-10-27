// Excel-Vorlagen Investition, Finanzierung & Finanzmathematik (Gruppe invest).
// Blaue Felder = Eingaben, alles andere echte Excel-Formeln. Geprüft gegen unabhängige Referenzrechnung und LibreOffice.
import { builder } from './core.js';

const SUB = 'Blaue Felder ausfüllen – alles andere rechnet Excel automatisch.';
const range = (a, b) => { const o = []; for (let k = a; k <= b; k++) o.push(k); return o; };

// Hilfsrechnung interner Zinsfuß (für Kapitalwert & Kapitalwertvergleich). Jahr steht in Spalte A, Zahlungen t = 0 … 8 in Spalte Z ab Zeile r0.
// V: Vorzeichen ohne Nullen (fortgeschrieben) → Anzahl Vorzeichenwechsel. G: Vorzeichen des Kapitalwerts bei 1 + i = 10^k (k = −6; −5,5; … 6) → grenzt
// 1 + IZF auf eine halbe Zehnerpotenz ein, q = Untergrenze. S: Reihe skaliert mit q (Z_t / q^t) – ihr Zins liegt nahe 0, sodass Excels Newton-Verfahren sicher konvergiert:
// IZF = q · (1 + IKV(S)) − 1. Ergebnis nur bei genau einem Vorzeichenwechsel (Normalinvestition).
export function izfHilfe(b, { Z, r0, V, G, S, lab, out, top }) {
  const R = range(0, 8).map(t => r0 + t), last = R[8], rg = c => `${c}${r0}:${c}${last}`, K = range(0, 24), gl = r0 + 24;
  const [N, KK, Q, IZF] = range(0, 3).map(k => out + (top + k));
  if (lab) ['Anzahl Vorzeichenwechsel', 'Rasterpunkte unter 1 + IZF', 'Skalierungsfaktor q (Untergrenze 1 + IZF)', 'IZF (Hilfswert)'].forEach((t, k) => b.lab(lab + (top + k), t));
  const qa = '$' + Q.replace(/(\d+)$/, '$$$1');
  R.forEach((r, t) => b.fx(V + r, t === 0 ? `SIGN(${Z}${r})` : `IF(${Z}${r}=0,${V}${r - 1},SIGN(${Z}${r}))`, 'int').fx(S + r, `IFERROR(${Z}${r}/${qa}^A${r},"–")`, 'num'));
  K.forEach(j => b.fx(G + (r0 + j), `SIGN(${Z}${r0}+NPV(POWER(10,${j / 2 - 6})-1,${Z}${r0 + 1}:${Z}${last}))`, 'int'));
  b.fx(N, `(SUMPRODUCT(${V}${r0}:${V}${last - 1},${V}${r0}:${V}${last - 1})-SUMPRODUCT(${V}${r0}:${V}${last - 1},${V}${r0 + 1}:${V}${last}))/2`, 'int');
  b.fx(KK, `IF(${V}${last}>0,COUNTIF(${G}${r0}:${G}${gl},">0"),COUNTIF(${G}${r0}:${G}${gl},"<0"))`, 'int');
  b.fx(Q, `POWER(10,(${KK}-1)/2-6)`, 'f4');
  // Skaliert liegt der Zins zwischen 0 und 216 %. Startwert −1 % (links davon, nicht genau 0 – sonst bricht LibreOffice beim Startwert ab), Ersatz 50 %. Gültig nur Lösungen > −100 %.
  const x = g => `${Q}*(1+IRR(${rg(S)},${g}))-1`, ok = g => `IF(${x(g)}>-1,${x(g)},1/0)`;
  b.fx(IZF, `IF(${N}<>1,"–",IFERROR(${ok(-0.01)},IFERROR(${ok(0.5)},"nicht bestimmbar")))`, 'pct');
  return { N, IZF };
}
export const izfText = ({ N, IZF }) => `IF(${N}=0,"kein IZF (kein Vorzeichenwechsel)",IF(${N}>1,"nicht eindeutig (mehrere Vorzeichenwechsel)",${IZF}))`;

export default [
  {
    id: 'gewinnvergleich', cat: 'invest', title: 'Gewinnvergleichsrechnung', file: 'Gewinnvergleichsrechnung.xlsx',
    desc: 'Zwei Anlagen im Vergleich: Durchschnittsgewinn, Gewinnschwelle und kritische Menge.', key: ['B28', 'B30'],
    build() {
      const b = builder(3).title('Gewinnvergleichsrechnung', SUB);
      b.sec(4, 'Eingaben');
      b.th(5, ['', 'Anlage A', 'Anlage B']);
      const rows = [['Anschaffungskosten', 100000, 70000, 'eur'], ['Restwert', 10000, 0, 'eur'], ['Nutzungsdauer (Jahre)', 5, 5, 'int'], ['Kalkulationszinssatz', 0.08, 0.08, 'pct'],
        ['Sonstige Fixkosten p. a.', 15000, 12000, 'eur'], ['Variable Kosten je Stück', 6, 7, 'eur'], ['Verkaufspreis je Stück', 10, 10, 'eur'], ['Absatzmenge p. a. (Stück)', 12000, 12000, 'int']];
      rows.forEach(([t, a, c, f], k) => { const r = 6 + k, o = k === 2 ? { min: 1, max: 100 } : k === 3 ? { min: 0, max: 1 } : { min: 0 }; b.lab('A' + r, t).inp('B' + r, a, f, o).inp('C' + r, c, f, o); });
      b.sec(15, 'Kosten und Gewinn pro Jahr (Durchschnitt)');
      const P = ['B', 'C'];
      b.lab('A16', 'Kalkulatorische Abschreibung'); P.forEach(X => b.fx(X + 16, `(${X}6-${X}7)/${X}8`, 'eur'));
      b.lab('A17', 'Kalkulatorische Zinsen'); P.forEach(X => b.fx(X + 17, `(${X}6+${X}7)/2*${X}9`, 'eur'));
      b.lab('A18', 'Sonstige Fixkosten'); P.forEach(X => b.fx(X + 18, `${X}10`, 'eur'));
      b.lab('A19', '= Fixkosten gesamt'); P.forEach(X => b.tot(X + 19, `${X}16+${X}17+${X}18`, 'eur'));
      b.lab('A20', 'Variable Kosten'); P.forEach(X => b.fx(X + 20, `${X}11*${X}13`, 'eur'));
      b.lab('A21', '= Gesamtkosten'); P.forEach(X => b.tot(X + 21, `${X}19+${X}20`, 'eur'));
      b.lab('A22', 'Umsatzerlöse'); P.forEach(X => b.fx(X + 22, `${X}12*${X}13`, 'eur'));
      b.lab('A23', '= Durchschnittsgewinn p. a.'); P.forEach(X => b.res(X + 23, `${X}22-${X}21`, 'eur'));
      b.lab('A24', 'Gewinn je Stück'); P.forEach(X => b.fx(X + 24, `IFERROR(${X}23/${X}13,"–")`, 'eur'));
      b.lab('A25', 'Gewinnschwelle (Stück)'); P.forEach(X => b.fx(X + 25, `IF(${X}12-${X}11<=0,"keine",${X}19/(${X}12-${X}11))`, 'num'));
      b.sec(27, 'Ergebnis');
      b.lab('A28', 'Vorteilhafte Anlage (höherer Gewinn)').res('B28', 'IF(ROUND(B23-C23,2)>0,"Anlage A",IF(ROUND(B23-C23,2)<0,"Anlage B","Beide gleich gut"))', 'txt').merge('B28:C28');
      b.lab('A29', 'Gewinnvorteil pro Jahr').fx('B29', 'ABS(B23-C23)', 'eur');
      b.lab('A30', 'Kritische Menge (Stück)').res('B30', 'IF(ROUND((B12-B11)-(C12-C11),6)=0,"keine – gleicher Stück-DB",IF((B19-C19)/((B12-B11)-(C12-C11))<0,"keine – eine Anlage ist immer besser",(B19-C19)/((B12-B11)-(C12-C11))))', 'num').merge('B30:C30');
      b.lab('A31', 'Über der kritischen Menge besser').fx('B31', 'IF(B12-B11>C12-C11,"Anlage A",IF(C12-C11>B12-B11,"Anlage B","–"))', 'txt').merge('B31:C31');
      b.note('A33', 'Gewinn = Erlöse − (kalk. AfA + kalk. Zinsen auf (AK + Restwert) / 2 + sonstige Fixkosten + variable Kosten). Kritische Menge: gleiche Menge für beide Anlagen.');
      return { name: 'Gewinnvergleich', cols: [38, 19, 19], cells: b.cells, merges: b.merges,
        explain: { B23: 'Durchschnittsgewinn = Umsatzerlöse − Gesamtkosten (inkl. kalkulatorischer Abschreibung und Zinsen).', B25: 'Gewinnschwelle = Fixkosten / (Preis − variable Stückkosten).', B30: 'Menge, bei der beide Gewinne gleich sind: (Fix_A − Fix_B) / (DB_A − DB_B) je Stück.' } };
    }
  },
  {
    id: 'rentabilitaet', cat: 'invest', title: 'Rentabilitätsvergleichsrechnung', file: 'Rentabilitaetsvergleichsrechnung.xlsx',
    desc: 'Zwei Anlagen: Gewinn, Ø gebundenes Kapital und Rentabilität – mit Vergleich zur Mindestverzinsung.', key: ['B19', 'C19', 'B22'],
    build() {
      const b = builder(3).title('Rentabilitätsvergleichsrechnung', SUB);
      b.sec(4, 'Eingaben');
      b.th(5, ['', 'Anlage A', 'Anlage B']);
      const rows = [['Anschaffungskosten', 100000, 70000, 'eur', { min: 1 }], ['Restwert', 10000, 0, 'eur', { min: 0 }], ['Nutzungsdauer (Jahre)', 5, 5, 'int', { min: 1, max: 100 }], ['Kalkulationszinssatz (Mindestverzinsung)', 0.08, 0.08, 'pct', { min: 0, max: 1 }],
        ['Umsatzerlöse p. a.', 120000, 120000, 'eur', { min: 0 }], ['Laufende Kosten p. a. (ohne AfA und Zinsen)', 87000, 96000, 'eur', { min: 0 }]];
      rows.forEach(([t, a, c, f, o], k) => { const r = 6 + k; b.lab('A' + r, t).inp('B' + r, a, f, o).inp('C' + r, c, f, o); });
      b.sec(13, 'Gewinn und Kapitaleinsatz pro Jahr');
      const P = ['B', 'C'];
      b.lab('A14', 'Kalkulatorische Abschreibung'); P.forEach(X => b.fx(X + 14, `(${X}6-${X}7)/${X}8`, 'eur'));
      b.lab('A15', 'Kalkulatorische Zinsen'); P.forEach(X => b.fx(X + 15, `(${X}6+${X}7)/2*${X}9`, 'eur'));
      b.lab('A16', '= Gesamtkosten'); P.forEach(X => b.tot(X + 16, `${X}11+${X}14+${X}15`, 'eur'));
      b.lab('A17', '= Gewinn (nach kalk. Zinsen)'); P.forEach(X => b.tot(X + 17, `${X}10-${X}16`, 'eur'));
      b.lab('A18', 'Ø gebundenes Kapital (AK + RW) / 2'); P.forEach(X => b.fx(X + 18, `(${X}6+${X}7)/2`, 'eur'));
      b.lab('A19', 'Rentabilität'); P.forEach(X => b.res(X + 19, `(${X}17+${X}15)/${X}18`, 'pct'));
      b.lab('A20', 'Mindestverzinsung erreicht?'); P.forEach(X => b.fx(X + 20, `IF(ROUND(${X}19-${X}9,8)>=0,"ja (R ≥ i)","nein (R < i)")`, 'txt'));
      b.sec(21, 'Ergebnis');
      b.lab('A22', 'Vorteilhafte Anlage (höhere Rentabilität)').res('B22', 'IF(AND(B19<B9,C19<C9),"Keine – Mindestverzinsung verfehlt",IF(ROUND(B19-C19,8)>0,"Anlage A",IF(ROUND(B19-C19,8)<0,"Anlage B","Beide gleich")))', 'txt').merge('B22:C22');
      b.note('A24', 'Rentabilität = (Gewinn + kalkulatorische Zinsen) / Ø gebundenes Kapital. Die Zinsen werden addiert, weil die Rentabilität die gesamte Verzinsung des eingesetzten Kapitals zeigt.');
      return { name: 'Rentabilitaet', cols: [42, 19, 19], cells: b.cells, merges: b.merges,
        explain: { B18: 'Durchschnittlich gebundenes Kapital = (Anschaffungskosten + Restwert) / 2.', B19: 'Rentabilität = (Gewinn + kalkulatorische Zinsen) / Ø gebundenes Kapital.', B22: 'Vorteilhaft ist die Anlage mit der höheren Rentabilität – sofern sie die Mindestverzinsung erreicht.' } };
    }
  },
  {
    id: 'annuitaetenmethode', cat: 'invest', title: 'Annuitätenmethode', file: 'Annuitaetenmethode.xlsx',
    desc: 'Kapitalwert × Wiedergewinnungsfaktor: Annuität der Investition, Kapitaldienst und Entscheidung.', key: ['B26', 'B30'],
    build() {
      const b = builder(4).title('Annuitätenmethode', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Anschaffungsauszahlung (t = 0)').inp('B5', 100000, 'eur', { min: 0 });
      b.lab('A6', 'Kalkulationszinssatz').inp('B6', 0.1, 'pct', { min: 0, max: 1 });
      b.lab('A7', 'Nutzungsdauer n (1 – 10 Jahre)').inp('B7', 5, 'int', { min: 1, max: 10 });
      b.lab('A8', 'Liquidationserlös am Ende von Jahr n').inp('B8', 0, 'eur', { min: 0 });
      b.sec(10, 'Zahlungsreihe');
      b.th(11, ['Jahr', 'Einzahlungsüberschuss', 'Abzinsungsfaktor', 'Barwert']);
      const cf = [30000, 35000, 30000, 25000, 20000, 0, 0, 0, 0, 0];
      range(1, 10).forEach(k => { const r = 11 + k, e = `A${r}=""`;
        b.fx('A' + r, `IF(${k}<=$B$7,${k},"")`, 'int').inp('B' + r, cf[k - 1], 'eur').fx('C' + r, `IF(${e},"",1/(1+$B$6)^A${r})`, 'f4').fx('D' + r, `IF(${e},"",B${r}*C${r})`, 'eur'); });
      b.sec(23, 'Ergebnis');
      b.lab('A24', 'Barwert Liquidationserlös').fx('B24', 'B8/(1+B6)^B7', 'eur');
      b.lab('A25', 'Barwert aller Rückflüsse').fx('B25', 'SUM(D12:D21)+B24', 'eur');
      b.lab('A26', 'Kapitalwert C₀').res('B26', 'B25-B5', 'eur');
      b.lab('A27', 'Wiedergewinnungsfaktor (KWF)').fx('B27', 'IF(B6=0,1/B7,B6*(1+B6)^B7/((1+B6)^B7-1))', 'f4');
      b.lab('A28', 'Einzahlungsannuität (Barwert Rückflüsse × KWF)').fx('B28', 'B25*B27', 'eur');
      b.lab('A29', 'Kapitaldienst (Anschaffung × KWF)').fx('B29', 'B5*B27', 'eur');
      b.lab('A30', 'Annuität der Investition').res('B30', 'B26*B27', 'eur');
      b.lab('A31', 'Entscheidung').res('B31', 'IF(ROUND(B30,2)>0,"Vorteilhaft (Annuität > 0)",IF(ROUND(B30,2)<0,"Nicht vorteilhaft (Annuität < 0)","Indifferent (Annuität = 0)"))', 'txt').merge('B31:D31');
      b.note('A33', 'Nur Jahre bis n zählen – Einträge in späteren Zeilen werden ignoriert. KWF = i · (1 + i)^n / ((1 + i)^n − 1).');
      return { name: 'Annuitaetenmethode', cols: [44, 21, 18, 18], cells: b.cells, merges: b.merges,
        explain: { B27: 'Wiedergewinnungsfaktor (Kapitalwiedergewinnungs-/Annuitätenfaktor): i · (1 + i)^n / ((1 + i)^n − 1); bei i = 0: 1 / n.', B30: 'Annuität = Kapitalwert × Wiedergewinnungsfaktor = Einzahlungsannuität − Kapitaldienst. > 0: Investition lohnt sich.' } };
    }
  },
  {
    id: 'kapitalwertvergleich', cat: 'invest', title: 'Kapitalwertvergleich zweier Alternativen', file: 'Kapitalwertvergleich.xlsx',
    desc: 'Zwei Investitionen bis 8 Jahre: Kapitalwerte, IZF, Differenzinvestition und Entscheidung.', key: ['B23', 'C23', 'B26'],
    build() {
      const b = builder(7).title('Kapitalwertvergleich zweier Alternativen', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Kalkulationszinssatz').inp('B5', 0.08, 'pct', { min: 0, max: 1 });
      b.lab('A6', 'Anschaffungsauszahlung Alternative A').inp('B6', 100000, 'eur', { min: 0 });
      b.lab('A7', 'Anschaffungsauszahlung Alternative B').inp('B7', 60000, 'eur', { min: 0 });
      b.sec(9, 'Zahlungsreihen');
      b.th(10, ['Jahr', 'Zahlung A', 'Barwert A', 'Zahlung B', 'Barwert B', 'Differenz A − B', 'Barwert Differenz']);
      b.txt('A11', 0, { fmt: 'int' }).fx('B11', '-B6', 'eur').fx('C11', 'B11', 'eur').fx('D11', '-B7', 'eur').fx('E11', 'D11', 'eur').fx('F11', 'B11-D11', 'eur').fx('G11', 'F11', 'eur');
      const A = [30000, 30000, 30000, 30000, 30000, 0, 0, 0], B = [20000, 20000, 20000, 20000, 0, 0, 0, 0];
      range(1, 8).forEach(t => { const r = 11 + t, d = `/(1+$B$5)^A${r}`;
        b.txt('A' + r, t, { fmt: 'int' }).inp('B' + r, A[t - 1], 'eur').fx('C' + r, `B${r}${d}`, 'eur').inp('D' + r, B[t - 1], 'eur').fx('E' + r, `D${r}${d}`, 'eur').fx('F' + r, `B${r}-D${r}`, 'eur').fx('G' + r, `F${r}${d}`, 'eur'); });
      // Hilfsrechnung IZF je Reihe (Spalten I–Q, Hilfswerte S–V), siehe izfHilfe
      b.th(10, ['Vorz. A', 'Vorz. C₀ bei 1+i=10^k A (k=−6…6)', 'Skaliert A', 'Vorz. B', 'Vorz. C₀ bei 1+i=10^k B', 'Skaliert B', 'Vorz. A − B', 'Vorz. C₀ bei 1+i=10^k A − B', 'Skaliert A − B', '', 'Hilfswert IZF', 'A', 'B', 'A − B'], 9);
      const H = [['B', 'I', 'J', 'K', 'T', 'S'], ['D', 'L', 'M', 'N', 'U', null], ['F', 'O', 'P', 'Q', 'V', null]].map(([Z, V, G, S, out, lab]) => izfHilfe(b, { Z, r0: 11, V, G, S, lab, out, top: 11 }));
      b.sec(21, 'Ergebnis');
      b.th(22, ['', 'Alternative A', 'Alternative B', 'Differenz A − B']);
      b.lab('A23', 'Kapitalwert C₀').res('B23', 'NPV(B5,B12:B19)+B11', 'eur').res('C23', 'NPV(B5,D12:D19)+D11', 'eur').fx('D23', 'NPV(B5,F12:F19)+F11', 'eur');
      b.lab('A24', 'Interner Zinsfuß').fx('B24', izfText(H[0]), 'pct').fx('C24', izfText(H[1]), 'pct').fx('D24', izfText(H[2]), 'pct');
      b.lab('A26', 'Entscheidung').res('B26', 'IF(AND(ROUND(B23,2)<=0,ROUND(C23,2)<=0),"Keine Alternative vorteilhaft (beide C₀ ≤ 0)",IF(ROUND(B23-C23,2)>0,"Alternative A (höherer Kapitalwert)",IF(ROUND(B23-C23,2)<0,"Alternative B (höherer Kapitalwert)","Beide gleichwertig")))', 'txt').merge('B26:G26');
      b.lab('A27', 'Differenzinvestition (A − B)').fx('B27', 'IF(ROUND(D23,2)>0,"lohnt sich: Mehreinsatz von A bringt C₀ > 0",IF(ROUND(D23,2)<0,"lohnt sich nicht: B ist besser","neutral (C₀ = 0)"))', 'txt').merge('B27:G27');
      b.note('A29', 'Der Kapitalwert der Differenzinvestition = C₀(A) − C₀(B). Unterschiedliche Kapitaleinsätze und Laufzeiten gleicht der Kapitalwert aus: Die Differenz wird implizit zum Kalkulationszins angelegt (vollkommener Kapitalmarkt).');
      b.note('A30', 'Der Vergleich der internen Zinsfüße kann zu einer anderen (falschen) Rangfolge führen – maßgeblich ist der höhere Kapitalwert.');
      b.note('A31', 'IZF nur bei Normalinvestition (genau ein Vorzeichenwechsel) – sonst gibt es keinen oder mehrere Zinsfüße. Hilfsrechnung rechts (Spalten I–V): Vorzeichenwechsel zählen, IZF per Kapitalwert bei 1 + i = 10^k auf eine halbe Zehnerpotenz eingrenzen (Untergrenze q) und Reihe mit q skalieren, damit Excel auch extreme IZF findet (IZF = q · (1 + IKV der skalierten Reihe) − 1).');
      return { name: 'Kapitalwertvergleich', cols: [30, 16, 16, 16, 16, 17, 18, 3, 9, 16, 12, 9, 16, 12, 11, 18, 14, 3, 28, 13, 13, 13], cells: b.cells, merges: b.merges,
        explain: { B23: 'NBW zinst ab Jahr 1 ab – die Anschaffungsauszahlung aus t = 0 wird separat addiert.', D23: 'Kapitalwert der Differenzzahlungsreihe A − B; entspricht C₀(A) − C₀(B).', D24: 'IZF der Differenzinvestition (Fisher-Schnittpunkt): Bei diesem Kalkulationszins haben A und B denselben Kapitalwert.' } };
    }
  },
  {
    id: 'ratendarlehen', cat: 'finanz', title: 'Ratendarlehen (Tilgungsdarlehen) & Tilgungsplan', file: 'Ratendarlehen_Tilgungsplan.xlsx',
    desc: 'Gleiche Tilgung, sinkende Raten: Zinsen, Raten und Restschuld Jahr für Jahr – bis 20 Jahre.', key: ['B10', 'B11'],
    build() {
      const b = builder(6).title('Ratendarlehen (Tilgungsdarlehen) & Tilgungsplan', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Darlehensbetrag').inp('B5', 100000, 'eur', { min: 0 });
      b.lab('A6', 'Zinssatz p. a.').inp('B6', 0.05, 'pct', { min: 0, max: 1 });
      b.lab('A7', 'Laufzeit in Jahren (1 – 20)').inp('B7', 10, 'int', { min: 1, max: 20 });
      b.sec(9, 'Ergebnis');
      b.lab('A10', 'Tilgung pro Jahr (konstant)').res('B10', 'B5/B7', 'eur');
      b.lab('A11', 'Summe der Zinsen').res('B11', 'SUM(C17:C36)', 'eur');
      b.lab('A12', 'Rate im ersten Jahr').fx('B12', 'E17', 'eur');
      b.lab('A13', 'Rate im letzten Jahr').fx('B13', 'INDEX(E17:E36,B7)', 'eur');
      b.lab('A14', 'Summe aller Raten (Gesamtaufwand)').fx('B14', 'SUM(E17:E36)', 'eur');
      b.th(16, ['Jahr', 'Restschuld Anfang', 'Zinsen', 'Tilgung', 'Rate (Zins + Tilgung)', 'Restschuld Ende']);
      range(1, 20).forEach(k => { const r = 16 + k, e = `A${r}=""`;
        b.fx('A' + r, `IF(${k}<=$B$7,${k},"")`, 'int').fx('B' + r, k === 1 ? `IF(${e},"",$B$5)` : `IF(${e},"",F${r - 1})`, 'eur').fx('C' + r, `IF(${e},"",B${r}*$B$6)`, 'eur')
          .fx('D' + r, `IF(${e},"",$B$10)`, 'eur').fx('E' + r, `IF(${e},"",C${r}+D${r})`, 'eur').fx('F' + r, `IF(${e},"",IF(ABS(B${r}-D${r})<0.005,0,B${r}-D${r}))`, 'eur'); });
      b.note('A38', 'Beim Ratendarlehen ist die Tilgung konstant (Darlehen / Laufzeit). Weil die Restschuld sinkt, sinken auch Zinsen und Rate.');
      return { name: 'Tilgungsplan', cols: [34, 19, 17, 17, 20, 19], cells: b.cells, merges: b.merges,
        explain: { B10: 'Tilgung = Darlehensbetrag / Laufzeit.', C17: 'Zinsen = Restschuld am Jahresanfang × Zinssatz.', E17: 'Rate = Zinsen + konstante Tilgung – sie sinkt jedes Jahr.' } };
    }
  },
  {
    id: 'sparplan', cat: 'finanz', title: 'Zinseszins & Sparplan', file: 'Zinseszins_Sparplan.xlsx',
    desc: 'Endwert aus Einmalanlage und Sparrate – jährlich oder monatlich, vor- oder nachschüssig, bis 40 Jahre.', key: ['B15', 'B17'],
    build() {
      const b = builder(5).title('Zinseszins & Sparplan', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Einmalanlage zu Beginn (K₀)').inp('B5', 10000, 'eur', { min: 0 });
      b.lab('A6', 'Sparrate je Periode').inp('B6', 100, 'eur', { min: 0 });
      b.lab('A7', 'Zinssatz p. a. (nominal)').inp('B7', 0.03, 'pct', { min: 0, max: 1 });
      b.lab('A8', 'Laufzeit in Jahren (1 – 40)').inp('B8', 10, 'int', { min: 1, max: 40 });
      b.lab('A9', 'Perioden pro Jahr (1 = jährlich, 12 = monatlich)').inp('B9', 12, 'int', { min: 1, max: 12 });
      b.lab('A10', 'Sparrate vorschüssig? (1 = ja, 0 = nachschüssig)').inp('B10', 0, 'int', { min: 0, max: 1 });
      b.sec(12, 'Ergebnis');
      b.lab('A13', 'Zinssatz je Periode (i / m)').fx('B13', 'B7/B9', 'pct');
      b.lab('A14', 'Anzahl Perioden').fx('B14', 'B8*B9', 'int');
      b.lab('A15', 'Endwert').res('B15', 'FV(B13,B14,-B6,-B5,B10)', 'eur');
      b.lab('A16', 'Summe der Einzahlungen').fx('B16', 'B5+B6*B14', 'eur');
      b.lab('A17', 'Zinserträge gesamt').res('B17', 'B15-B16', 'eur');
      b.lab('A18', '  davon Endwert der Einmalanlage').fx('B18', 'B5*(1+B13)^B14', 'eur');
      b.lab('A19', '  davon Endwert des Sparplans').fx('B19', 'FV(B13,B14,-B6,0,B10)', 'eur');
      b.lab('A20', 'Effektiver Jahreszins').fx('B20', 'IF(B7=0,0,EFFECT(B7,B9))', 'pct');
      b.th(22, ['Jahr', 'Einzahlungen kumuliert', 'Kontostand Jahresende', 'Zinsen kumuliert', 'Zinsen im Jahr']);
      range(1, 40).forEach(k => { const r = 22 + k, e = `A${r}=""`;
        b.fx('A' + r, `IF(${k}<=$B$8,${k},"")`, 'int').fx('B' + r, `IF(${e},"",$B$5+$B$6*$B$9*A${r})`, 'eur').fx('C' + r, `IF(${e},"",FV($B$13,A${r}*$B$9,-$B$6,-$B$5,$B$10))`, 'eur')
          .fx('D' + r, `IF(${e},"",C${r}-B${r})`, 'eur').fx('E' + r, k === 1 ? `IF(${e},"",D${r})` : `IF(${e},"",D${r}-D${r - 1})`, 'eur'); });
      b.note('A64', 'Zinsen werden je Periode mit i / m gutgeschrieben (relativer Periodenzins) – daher liegt der effektive Jahreszins bei m > 1 über dem Nominalzins. Vorschüssig: Rate am Periodenanfang.');
      return { name: 'Sparplan', cols: [46, 21, 21, 19, 17], cells: b.cells, merges: b.merges,
        explain: { B15: 'ZW rechnet K₀ · q^N + r · (q^N − 1) / i_p (vorschüssig × q) mit q = 1 + i/m und N = Jahre × m.', B20: 'Effektiver Jahreszins = (1 + i/m)^m − 1.', C23: 'Kontostand nach k Jahren mit derselben Endwertformel.' } };
    }
  },
  {
    id: 'rentenrechnung', cat: 'finanz', title: 'Rentenrechnung: Barwert, Endwert, ewige Rente', file: 'Rentenrechnung.xlsx',
    desc: 'Rentenbarwert, Rentenendwert und ewige Rente mit Faktoren – vorschüssig oder nachschüssig.', key: ['C12', 'C13', 'C14'],
    build() {
      const b = builder(3).title('Rentenrechnung: Barwert, Endwert, ewige Rente', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Rentenrate r (je Periode)').inp('B5', 10000, 'eur', { min: 0 });
      b.lab('A6', 'Zinssatz je Periode i').inp('B6', 0.05, 'pct', { min: 0, max: 1 });
      b.lab('A7', 'Laufzeit n (Perioden)').inp('B7', 10, 'int', { min: 1, max: 100 });
      b.lab('A8', 'Vorschüssig? (1 = ja, 0 = nachschüssig)').inp('B8', 0, 'int', { min: 0, max: 1 });
      b.sec(10, 'Ergebnis');
      b.th(11, ['Größe', 'Faktor', 'Betrag']);
      b.lab('A12', 'Rentenbarwert').fx('B12', 'IF(B6=0,B7,((1+B6)^B7-1)/(B6*(1+B6)^B7))*IF(B8=1,1+B6,1)', 'f4').res('C12', 'B5*B12', 'eur');
      b.lab('A13', 'Rentenendwert').fx('B13', 'IF(B6=0,B7,((1+B6)^B7-1)/B6)*IF(B8=1,1+B6,1)', 'f4').res('C13', 'B5*B13', 'eur');
      b.lab('A14', 'Barwert der ewigen Rente').fx('B14', 'IF(B6=0,"–",IF(B8=1,(1+B6)/B6,1/B6))', 'f4').res('C14', 'IF(B6=0,"nicht definiert (i = 0)",B5*B14)', 'eur');
      b.lab('A15', 'Zum Vergleich: Summe der Raten (n × r)').fx('C15', 'B5*B7', 'eur');
      b.note('A17', 'Nachschüssig: RBF = (q^n − 1) / (i · q^n), REF = (q^n − 1) / i, ewige Rente r / i. Vorschüssig: jeweils × q (Zahlung am Periodenanfang), q = 1 + i.');
      return { name: 'Rentenrechnung', cols: [40, 16, 20], cells: b.cells, merges: b.merges,
        explain: { B12: 'Rentenbarwertfaktor (q^n − 1) / (i · q^n); vorschüssig zusätzlich × q.', B13: 'Rentenendwertfaktor (q^n − 1) / i; vorschüssig zusätzlich × q.', C14: 'Ewige Rente: r / i (nachschüssig) bzw. r · q / i (vorschüssig).' } };
    }
  },
  {
    id: 'effektivzins', cat: 'finanz', title: 'Effektivzins eines Kredits', file: 'Effektivzins_Kredit.xlsx',
    desc: 'Effektivzins eines Annuitätendarlehens mit Disagio und Gebühr – plus Nominal- vs. Effektivzins.', key: ['B15', 'B23'],
    build() {
      const b = builder(3).title('Effektivzins eines Kredits', SUB);
      b.sec(4, 'Annuitätendarlehen mit Disagio und Bearbeitungsgebühr');
      b.lab('A5', 'Darlehensbetrag (Nennbetrag)').inp('B5', 100000, 'eur', { min: 1 });
      b.lab('A6', 'Nominalzins p. a.').inp('B6', 0.05, 'pct', { min: 0, max: 1 });
      b.lab('A7', 'Laufzeit in Jahren (jährliche Raten)').inp('B7', 10, 'int', { min: 1, max: 50 });
      b.lab('A8', 'Disagio (in % vom Nennbetrag)').inp('B8', 0.04, 'pct', { min: 0, max: 0.5 });
      b.lab('A9', 'Bearbeitungsgebühr (€)').inp('B9', 1000, 'eur', { min: 0 });
      b.sec(11, 'Ergebnis');
      b.lab('A12', 'Disagio in €').fx('B12', 'B5*B8', 'eur');
      b.lab('A13', 'Auszahlungsbetrag').fx('B13', 'B5-B12-B9', 'eur');
      b.lab('A14', 'Annuität (auf den Nennbetrag)').fx('B14', 'PMT(B6,B7,-B5)', 'eur');
      b.lab('A15', 'Effektivzins p. a.').res('B15', 'IF(B13<=0,"nicht bestimmbar",IFERROR(RATE(B7,-B14,B13,0,0,B14/B13),"nicht bestimmbar"))', 'pct');
      b.lab('A16', 'Summe aller Raten').fx('B16', 'B14*B7', 'eur');
      b.lab('A17', 'Kreditkosten gesamt (Raten − Auszahlung)').fx('B17', 'B16-B13', 'eur');
      b.sec(19, 'Nominal- vs. Effektivzins bei unterjähriger Verzinsung');
      b.lab('A20', 'Nominalzins p. a.').inp('B20', 0.06, 'pct', { min: 0, max: 1 });
      b.lab('A21', 'Zinsperioden pro Jahr (12 = monatlich)').inp('B21', 12, 'int', { min: 1, max: 365 });
      b.lab('A22', 'Zinssatz je Periode (i / m)').fx('B22', 'B20/B21', 'pct');
      b.lab('A23', 'Effektiver Jahreszins').res('B23', 'IF(B20=0,0,EFFECT(B20,B21))', 'pct');
      b.note('A25', 'Effektivzins = interner Zinsfuß der Zahlungsreihe (Auszahlung heute, n gleiche Jahresraten). Der Effektivzins nach Preisangabenverordnung rechnet monats- bzw. taggenau und kann leicht abweichen.');
      return { name: 'Effektivzins', cols: [44, 20, 6], cells: b.cells, merges: b.merges,
        explain: { B13: 'Auszahlung = Nennbetrag − Disagio − Bearbeitungsgebühr.', B15: 'ZINS sucht den Zinssatz, bei dem der Barwert der Raten genau dem Auszahlungsbetrag entspricht.', B23: 'EFFEKTIV: (1 + i/m)^m − 1.' } };
    }
  },
  {
    id: 'skonto', cat: 'finanz', title: 'Lieferantenkredit vs. Skonto', file: 'Lieferantenkredit_Skonto.xlsx',
    desc: 'Effektiver Jahreszins des Lieferantenkredits und Entscheidung: Skonto ziehen oder Ziel ausnutzen?', key: ['B16', 'B19', 'B20'],
    build() {
      const b = builder(3).title('Lieferantenkredit vs. Skonto', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Rechnungsbetrag').inp('B5', 10000, 'eur', { min: 0 });
      b.lab('A6', 'Skontosatz').inp('B6', 0.02, 'pct', { min: 0, max: 0.5 });
      b.lab('A7', 'Skontofrist (Tage)').inp('B7', 10, 'int', { min: 0, max: 365 });
      b.lab('A8', 'Zahlungsziel (Tage)').inp('B8', 30, 'int', { min: 1, max: 365 });
      b.lab('A9', 'Kontokorrentzins p. a.').inp('B9', 0.12, 'pct', { min: 0, max: 1 });
      b.lab('A10', 'Zinstage pro Jahr').inp('B10', 360, 'int', { min: 360, max: 366 });
      b.sec(12, 'Ergebnis');
      b.lab('A13', 'Skontobetrag').fx('B13', 'B5*B6', 'eur');
      b.lab('A14', 'Überweisungsbetrag bei Skontoabzug').fx('B14', 'B5-B13', 'eur');
      b.lab('A15', 'Kreditdauer (Zahlungsziel − Skontofrist)').fx('B15', 'B8-B7', 'int');
      b.lab('A16', 'Effektiver Jahreszins des Lieferantenkredits').res('B16', 'IF(B15<=0,"Zahlungsziel muss länger als Skontofrist sein",B6/(1-B6)*B10/B15)', 'pct').merge('B16:C16');
      b.lab('A17', 'Faustformel (Skontosatz × 360 / Kreditdauer)').fx('B17', 'IF(B15<=0,"–",B6*B10/B15)', 'pct');
      b.lab('A18', 'Kontokorrentzinsen für die Kreditdauer').fx('B18', 'IF(B15<=0,"–",B14*B9*B15/B10)', 'eur');
      b.lab('A19', 'Finanzierungsvorteil durch Skontoabzug').res('B19', 'IF(B15<=0,"–",B13-B18)', 'eur');
      b.lab('A20', 'Entscheidung').res('B20', 'IF(B15<=0,"–",IF(ROUND(B16-B9,10)>0,"Skonto ziehen (Kontokorrentkredit ist billiger)",IF(ROUND(B16-B9,10)<0,"Zahlungsziel ausnutzen (Lieferantenkredit ist billiger)","Indifferent")))', 'txt').merge('B20:C20');
      b.lab('A21', 'Zusatz: Effektivzins mit Zinseszins').fx('B21', 'IF(B15<=0,"–",(1+B6/(1-B6))^(B10/B15)-1)', 'pct');
      b.note('A23', 'Lehrbuchformel: Skontosatz / (100 % − Skontosatz) × 360 / (Zahlungsziel − Skontofrist) – linear, ohne Zinseszins. Wer Skonto zieht, verzichtet auf den Lieferantenkredit für die Kreditdauer.');
      return { name: 'Skonto', cols: [44, 20, 34], cells: b.cells, merges: b.merges,
        explain: { B16: 'Effektiver Jahreszins = Skontosatz / (1 − Skontosatz) × 360 / (Zahlungsziel − Skontofrist).', B18: 'Zinsen = Überweisungsbetrag × Kontokorrentzins × Kreditdauer / 360.', B19: 'Ersparter Skonto − Zinsen für den Überbrückungskredit. > 0: Skonto ziehen lohnt sich.' } };
    }
  },
  {
    id: 'leverage', cat: 'finanz', title: 'Leverage-Effekt', file: 'Leverage-Effekt.xlsx',
    desc: 'EK-Rendite in Abhängigkeit vom Verschuldungsgrad – mit Chance und Risiko im Krisenfall.', key: ['B17', 'B20'],
    build() {
      const b = builder(7).title('Leverage-Effekt', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Gesamtkapital').inp('B5', 1000000, 'eur', { min: 1 });
      b.lab('A6', 'Gesamtkapitalrentabilität (vor Zinsen)').inp('B6', 0.1, 'pct', { min: -1, max: 1 });
      b.lab('A7', 'Fremdkapitalzinssatz').inp('B7', 0.06, 'pct', { min: 0, max: 1 });
      b.lab('A8', 'Verschuldungsgrad (FK / EK)').inp('B8', 1.5, 'x2', { min: 0, max: 100 });
      b.lab('A9', 'Gesamtkapitalrentabilität im Krisenfall').inp('B9', 0.04, 'pct', { min: -1, max: 1 });
      b.sec(11, 'Ergebnis beim gewählten Verschuldungsgrad');
      b.lab('A12', 'Gewinn vor Zinsen').fx('B12', 'B5*B6', 'eur');
      b.lab('A13', 'Eigenkapital').fx('B13', 'B5/(1+B8)', 'eur');
      b.lab('A14', 'Fremdkapital').fx('B14', 'B5-B13', 'eur');
      b.lab('A15', 'Fremdkapitalzinsen').fx('B15', 'B14*B7', 'eur');
      b.lab('A16', 'Gewinn nach Zinsen').fx('B16', 'B12-B15', 'eur');
      b.lab('A17', 'Eigenkapitalrentabilität').res('B17', 'B16/B13', 'pct');
      b.lab('A18', 'Kontrolle: r_GK + (r_GK − i) × FK / EK').fx('B18', 'B6+(B6-B7)*B8', 'pct');
      b.lab('A19', 'Wirkung').fx('B19', 'IF(B6>B7,"Positiver Leverage-Effekt: mehr FK erhöht die EK-Rendite",IF(B6<B7,"Negativer Leverage-Effekt: mehr FK senkt die EK-Rendite","Neutral (r_GK = FK-Zins)"))', 'txt').merge('B19:G19');
      b.lab('A20', 'EK-Rentabilität im Krisenfall').res('B20', 'B9+(B9-B7)*B8', 'pct');
      b.sec(22, 'EK-Rendite bei verschiedenen Verschuldungsgraden');
      b.th(23, ['Verschuldungsgrad (FK / EK)', 'Eigenkapital', 'Fremdkapital', 'FK-Zinsen', 'Gewinn nach Zinsen', 'EK-Rendite', 'EK-Rendite Krisenfall']);
      [0, 0.5, 1, 1.5, 2, 3, 4, 5, 8].forEach((v, k) => { const r = 24 + k;
        b.inp('A' + r, v, 'x2', { min: 0, max: 100 }).fx('B' + r, `$B$5/(1+A${r})`, 'eur').fx('C' + r, `$B$5-B${r}`, 'eur').fx('D' + r, `C${r}*$B$7`, 'eur')
          .fx('E' + r, `$B$12-D${r}`, 'eur').fx('F' + r, `E${r}/B${r}`, 'pct').fx('G' + r, `($B$5*$B$9-D${r})/B${r}`, 'pct'); });
      b.note('A34', 'Leverage-Formel ohne Steuern: r_EK = r_GK + (r_GK − i) × FK / EK. Solange r_GK > i, hebelt Fremdkapital die EK-Rendite nach oben – fällt r_GK unter i, wirkt der Hebel nach unten.');
      return { name: 'Leverage', cols: [40, 17, 17, 15, 18, 13, 16], cells: b.cells, merges: b.merges,
        explain: { B13: 'Eigenkapital = Gesamtkapital / (1 + Verschuldungsgrad).', B17: 'EK-Rentabilität = (Gewinn vor Zinsen − FK-Zinsen) / Eigenkapital.', G24: 'Wie EK-Rendite, aber mit der Gesamtkapitalrentabilität im Krisenfall.' } };
    }
  },
  {
    id: 'wacc', cat: 'finanz', title: 'WACC – gewichtete Kapitalkosten', file: 'WACC_Kapitalkosten.xlsx',
    desc: 'Gewichtete Kapitalkosten mit Tax Shield – Eigenkapitalkosten direkt oder per CAPM.', key: ['B18', 'B26'],
    build() {
      const b = builder(3).title('WACC – gewichtete Kapitalkosten', SUB);
      b.sec(4, 'Kapitalstruktur (Marktwerte)');
      b.lab('A5', 'Eigenkapital').inp('B5', 6000000, 'eur', { min: 0 });
      b.lab('A6', 'Fremdkapital').inp('B6', 4000000, 'eur', { min: 0 });
      b.lab('A7', 'Gesamtkapital').tot('B7', 'B5+B6', 'eur');
      b.lab('A8', 'Eigenkapitalanteil (EK / GK)').fx('B8', 'IF(B7=0,0,B5/B7)', 'pct');
      b.lab('A9', 'Fremdkapitalanteil (FK / GK)').fx('B9', 'IF(B7=0,0,B6/B7)', 'pct');
      b.sec(11, 'Eigenkapitalkosten');
      b.lab('A12', 'CAPM verwenden? (1 = ja, 0 = direkt eingeben)').inp('B12', 1, 'int', { min: 0, max: 1 });
      b.lab('A13', 'Risikoloser Zinssatz r_f').inp('B13', 0.025, 'pct', { min: -0.1, max: 1 });
      b.lab('A14', 'Betafaktor β').inp('B14', 1.2, 'x2', { min: -5, max: 10 });
      b.lab('A15', 'Erwartete Marktrendite r_M').inp('B15', 0.08, 'pct', { min: -1, max: 1 });
      b.lab('A16', 'Eigenkapitalkosten direkt (wenn ohne CAPM)').inp('B16', 0.09, 'pct', { min: -1, max: 1 });
      b.lab('A17', 'Marktrisikoprämie r_M − r_f').fx('B17', 'B15-B13', 'pct');
      b.lab('A18', 'Eigenkapitalkosten r_EK').res('B18', 'IF(B12=1,B13+B14*B17,B16)', 'pct');
      b.sec(20, 'Fremdkapitalkosten');
      b.lab('A21', 'Fremdkapitalzins vor Steuern r_FK').inp('B21', 0.05, 'pct', { min: 0, max: 1 });
      b.lab('A22', 'Ertragsteuersatz s').inp('B22', 0.3, 'pct', { min: 0, max: 1 });
      b.lab('A23', 'Fremdkapitalkosten nach Steuern r_FK × (1 − s)').fx('B23', 'B21*(1-B22)', 'pct');
      b.sec(25, 'Ergebnis');
      b.lab('A26', 'WACC').res('B26', 'B8*B18+B9*B23', 'pct');
      b.lab('A27', 'WACC ohne Tax Shield (zum Vergleich)').fx('B27', 'B8*B18+B9*B21', 'pct');
      b.lab('A28', 'Tax Shield p. a. (FK × r_FK × s)').fx('B28', 'B6*B21*B22', 'eur');
      b.note('A30', 'WACC = EK/GK × r_EK + FK/GK × r_FK × (1 − s). CAPM: r_EK = r_f + β × (r_M − r_f). Gewichtung mit Marktwerten, nicht Buchwerten.');
      return { name: 'WACC', cols: [46, 19, 6], cells: b.cells, merges: b.merges,
        explain: { B18: 'CAPM: r_EK = r_f + β × (r_M − r_f) – oder der direkt eingegebene Wert.', B26: 'WACC = EK-Anteil × r_EK + FK-Anteil × r_FK × (1 − s).', B28: 'Steuerersparnis, weil Fremdkapitalzinsen die Steuerbemessungsgrundlage mindern.' } };
    }
  },
  {
    id: 'kapitalbedarf', cat: 'finanz', title: 'Kapitalbedarfsplanung (Gründung)', file: 'Kapitalbedarfsplanung.xlsx',
    desc: 'Anlage- und Umlaufkapitalbedarf über die Kapitalbindungsdauer – Gesamtbedarf für die Gründung.', key: ['B33', 'B40'],
    build() {
      const b = builder(8).title('Kapitalbedarfsplanung (Gründung)', SUB);
      b.sec(4, '1. Anlagekapitalbedarf');
      const AV = [['Grundstücke und Gebäude', 300000], ['Maschinen und Anlagen', 250000], ['Betriebs- und Geschäftsausstattung', 50000], ['Fuhrpark', 40000], ['Gründungs- und Ingangsetzungskosten', 20000]];
      AV.forEach(([t, v], k) => { const r = 5 + k; b.inp('A' + r, t, 'txt').inp('B' + r, v, 'eur', { min: 0 }); });
      b.lab('A10', '= Anlagekapitalbedarf').tot('B10', 'SUM(B5:B9)', 'eur');
      b.sec(12, '2. Dauer der Prozessphasen (Tage)');
      const PH = [['Lagerdauer Roh-, Hilfs- und Betriebsstoffe', 20], ['Produktionsdauer', 10], ['Lagerdauer Fertigerzeugnisse', 15], ['Kundenziel', 30], ['Lieferantenziel', 25]];
      PH.forEach(([t, v], k) => { const r = 13 + k; b.lab('A' + r, t).inp('B' + r, v, 'int', { min: 0, max: 1000 }); });
      b.sec(19, '3. Kapitalbindungsdauer je Ausgabenart (1 = Phase zählt mit, 0 = nicht)');
      b.th(20, ['Ausgabenart', 'Ausgaben je Tag', 'RHB-Lager', 'Produktion', 'Fertiglager', 'Kundenziel', '− Lieferantenziel', 'Bindungsdauer (Tage)']);
      const UV = [['Materialausgaben', 4000, [1, 1, 1, 1, 1]], ['Fertigungslöhne', 3000, [0, 1, 1, 1, 0]], ['Material- und Fertigungsgemeinkosten', 1500, [0, 1, 1, 1, 0]], ['Verwaltungs- und Vertriebsgemeinkosten', 1000, [1, 1, 1, 1, 0]], ['Sonstige Ausgaben', 0, [1, 1, 1, 1, 0]]];
      const F = ['C', 'D', 'E', 'F', 'G'];
      UV.forEach(([t, v, fl], k) => { const r = 21 + k; b.inp('A' + r, t, 'txt').inp('B' + r, v, 'eur', { min: 0 }); F.forEach((X, j) => b.inp(X + r, fl[j], 'int', { min: 0, max: 1 }));
        b.fx('H' + r, `MAX(0,C${r}*$B$13+D${r}*$B$14+E${r}*$B$15+F${r}*$B$16-G${r}*$B$17)`, 'int'); });
      b.sec(27, '4. Umlaufkapitalbedarf (Ausgaben je Tag × Bindungsdauer)');
      UV.forEach((_, k) => { const r = 28 + k, s = 21 + k; b.fx('A' + r, `A${s}`, 'txt').fx('B' + r, `B${s}*H${s}`, 'eur'); });
      b.lab('A33', '= Umlaufkapitalbedarf').res('B33', 'SUM(B28:B32)', 'eur');
      b.sec(35, '5. Gesamtkapitalbedarf');
      b.lab('A36', 'Anlagekapitalbedarf').fx('B36', 'B10', 'eur');
      b.lab('A37', '+ Umlaufkapitalbedarf').fx('B37', 'B33', 'eur');
      b.lab('A38', 'Sicherheitszuschlag (auf Anlage + Umlauf)').inp('B38', 0.1, 'pct', { min: 0, max: 1 });
      b.lab('A39', '+ Sicherheitsreserve').fx('B39', '(B36+B37)*B38', 'eur');
      b.lab('A40', '= Gesamtkapitalbedarf').res('B40', 'B36+B37+B39', 'eur');
      b.note('A42', 'Übliche Lehrbuchregel: Material bindet Kapital vom Einkauf bis zum Zahlungseingang des Kunden, abzüglich Lieferantenziel; Löhne und Fertigungsgemeinkosten ab Produktionsbeginn; Verwaltung und Vertrieb über den ganzen Prozess.');
      b.note('A43', 'Gibt die Aufgabe andere Bindungsdauern vor, die 1/0-Felder anpassen. Bindungsdauer = Summe der markierten Phasen (nie unter 0).');
      return { name: 'Kapitalbedarf', cols: [40, 17, 11, 12, 12, 12, 15, 15], cells: b.cells, merges: b.merges,
        explain: { H21: 'Bindungsdauer = Summe der mit 1 markierten Phasen − Lieferantenziel (falls markiert), mindestens 0.', B28: 'Kapitalbedarf = Ausgaben je Tag × Kapitalbindungsdauer.', B40: 'Gesamtkapitalbedarf = (Anlage- + Umlaufkapitalbedarf) × (1 + Sicherheitszuschlag).' } };
    }
  },
  {
    id: 'dcf', cat: 'invest', title: 'Unternehmensbewertung (DCF, vereinfacht)', file: 'Unternehmensbewertung_DCF.xlsx',
    desc: 'Free Cashflows 5 Jahre + Terminal Value (Gordon Growth): Enterprise Value und Equity Value.', key: ['B23', 'B25'],
    build() {
      const b = builder(4).title('Unternehmensbewertung (DCF, vereinfacht)', SUB);
      b.sec(4, 'Eingaben');
      b.lab('A5', 'Kapitalkosten (WACC)').inp('B5', 0.08, 'pct', { min: 0, max: 1 });
      b.lab('A6', 'Wachstumsrate nach Jahr 5 (g)').inp('B6', 0.015, 'pct', { min: -0.5, max: 0.5 });
      b.lab('A7', 'Nettofinanzverbindlichkeiten (FK − liquide Mittel)').inp('B7', 2000000, 'eur');
      b.lab('A8', 'Anzahl Aktien (0 = ohne Angabe)').inp('B8', 1000000, 'int', { min: 0 });
      b.sec(10, 'Free Cashflows (Detailplanung)');
      b.th(11, ['Jahr', 'Free Cashflow', 'Abzinsungsfaktor', 'Barwert']);
      const fcf = [1000000, 1100000, 1200000, 1250000, 1300000];
      range(1, 5).forEach(t => { const r = 11 + t; b.txt('A' + r, t, { fmt: 'int' }).inp('B' + r, fcf[t - 1], 'eur').fx('C' + r, `1/(1+$B$5)^A${r}`, 'f4').fx('D' + r, `B${r}*C${r}`, 'eur'); });
      b.sec(17, 'Terminal Value (Gordon-Growth-Modell)');
      b.lab('A18', 'Terminal Value am Ende von Jahr 5').fx('B18', 'IF(B5<=B6,"WACC muss größer als g sein",B16*(1+B6)/(B5-B6))', 'eur').merge('B18:D18');
      b.lab('A19', 'Barwert des Terminal Value').fx('B19', 'IF(B5<=B6,"–",B18*C16)', 'eur');
      b.sec(21, 'Ergebnis');
      b.lab('A22', 'Summe Barwerte der Free Cashflows').fx('B22', 'SUM(D12:D16)', 'eur');
      b.lab('A23', 'Enterprise Value (Unternehmensgesamtwert)').res('B23', 'IF(B5<=B6,"–",B22+B19)', 'eur');
      b.lab('A24', '− Nettofinanzverbindlichkeiten').fx('B24', 'B7', 'eur');
      b.lab('A25', 'Equity Value (Wert des Eigenkapitals)').res('B25', 'IF(B5<=B6,"–",B23-B24)', 'eur');
      b.lab('A26', 'Wert je Aktie').fx('B26', 'IF(OR(B5<=B6,B8=0),"–",B25/B8)', 'eur');
      b.lab('A27', 'Anteil Terminal Value am Enterprise Value').fx('B27', 'IF(B5<=B6,"–",IFERROR(B19/B23,"–"))', 'pct');
      b.note('A29', 'TV = FCF₅ × (1 + g) / (WACC − g), abgezinst mit (1 + WACC)^5. Entity-Ansatz: Enterprise Value − Nettofinanzverbindlichkeiten = Equity Value.');
      return { name: 'DCF', cols: [46, 20, 18, 18], cells: b.cells, merges: b.merges,
        explain: { B18: 'Gordon-Growth: FCF des Jahres 5 × (1 + g) / (WACC − g) – Wert aller Cashflows ab Jahr 6.', B23: 'Enterprise Value = Barwerte der Free Cashflows + Barwert des Terminal Value.', B25: 'Equity Value = Enterprise Value − Nettofinanzverbindlichkeiten.' } };
    }
  }
];
