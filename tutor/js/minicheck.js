// Mini-Check auf den Themenseiten (Google-Ads-Einstieg): 3 Fragen direkt nach dem ersten Erklär-Block.
// Ergebnis („2 von 3 richtig“) gibt's sofort – welche falsch war und warum, sehen Gäste nach dem kostenlosen Konto.
import { h } from './util.js';
import { L } from './i18n.js';
import { getAccount } from './api.js';

// Je Frage: q, Antworten (die RICHTIGE steht immer zuerst – gemischt wird beim Anzeigen), why
const SETS = {
  bilanz: [
    ['Wo steht ein Bankdarlehen in der Bilanz?', ['Auf der Passivseite', 'Auf der Aktivseite', 'Gar nicht – nur in der GuV'], 'Ein Darlehen ist Fremdkapital, also Mittelherkunft – und die steht auf der Passivseite.'],
    ['Was gilt in jeder Bilanz?', ['Summe Aktiva = Summe Passiva', 'Aktiva sind immer größer als Passiva', 'Eigenkapital = Fremdkapital'], 'Jeder Euro Vermögen (Aktiva) ist irgendwoher finanziert (Passiva) – deshalb sind beide Seiten immer gleich groß.'],
    ['Eine Maschine wird bar bezahlt. Was passiert mit der Bilanzsumme?', ['Sie bleibt gleich', 'Sie steigt', 'Sie sinkt'], 'Aktivtausch: Die Maschinen steigen, die Kasse sinkt um denselben Betrag – die Bilanzsumme ändert sich nicht.']
  ],
  buchungssatz: [
    ['Du kaufst Waren bar. Auf welcher Seite bucht das Kassenkonto?', ['Im Haben', 'Im Soll', 'Auf beiden Seiten'], 'Die Kasse ist ein Aktivkonto und nimmt ab – Abgänge stehen bei Aktivkonten im Haben.'],
    ['Wie lautet der Buchungssatz für einen Barkauf von Waren (ohne Umsatzsteuer)?', ['Wareneinkauf an Kasse', 'Kasse an Wareneinkauf', 'Bank an Kasse'], 'Zuerst das Konto im Soll (Wareneinkauf nimmt zu), dann „an“ das Konto im Haben (Kasse nimmt ab).'],
    ['Ein Kunde überweist eine offene Rechnung. Welcher Buchungssatz stimmt?', ['Bank an Forderungen aus L+L', 'Forderungen aus L+L an Bank', 'Umsatzerlöse an Bank'], 'Das Bankkonto nimmt zu (Soll), die Forderung gegenüber dem Kunden nimmt ab (Haben). Ein Umsatz entsteht dabei nicht – der wurde schon beim Verkauf gebucht.']
  ],
  kapitalwert: [
    ['Der Kapitalwert einer Investition ist +5.000 €. Ist sie vorteilhaft?', ['Ja', 'Nein', 'Das hängt von der Nutzungsdauer ab'], 'Ein positiver Kapitalwert heißt: Die Investition bringt mehr als die Mindestverzinsung zum Kalkulationszins – sie lohnt sich.'],
    ['Der Kalkulationszins steigt von 10 % auf 12 %. Was passiert mit dem Kapitalwert einer normalen Investition?', ['Er sinkt', 'Er steigt', 'Er bleibt gleich'], 'Höherer Zins = stärkeres Abzinsen. Die späteren Rückflüsse sind heute weniger wert, also sinkt der Kapitalwert.'],
    ['In einem Jahr bekommst du 110 €. Kalkulationszins 10 %. Was ist das heute wert?', ['100 €', '110 €', '121 €'], 'Barwert = 110 € ÷ 1,10 = 100 €. Abzinsen heißt durch (1 + i) teilen, nicht mal nehmen.']
  ],
  deckungsbeitrag: [
    ['Preis 50 €, variable Kosten 30 € pro Stück. Wie hoch ist der Deckungsbeitrag pro Stück?', ['20 €', '80 €', '30 €'], 'Stück-DB = Preis − variable Stückkosten = 50 € − 30 € = 20 €.'],
    ['Werden Fixkosten beim Stück-Deckungsbeitrag abgezogen?', ['Nein, nur die variablen Kosten', 'Ja, immer', 'Nur zur Hälfte'], 'Der Deckungsbeitrag zeigt, was jedes Stück zur Deckung der Fixkosten beiträgt – die Fixkosten selbst kommen erst danach.'],
    ['DB 20 € pro Stück, 1.000 Stück verkauft, Fixkosten 15.000 €. Wie hoch ist das Betriebsergebnis?', ['5.000 € Gewinn', '20.000 € Gewinn', '15.000 € Verlust'], 'Gesamt-DB = 20 € × 1.000 = 20.000 €. Minus Fixkosten 15.000 € = 5.000 € Gewinn.']
  ],
  'break-even': [
    ['Fixkosten 10.000 €, Deckungsbeitrag 20 € pro Stück. Wo liegt die Break-even-Menge?', ['500 Stück', '200 Stück', '2.000 Stück'], 'Fixkosten ÷ Stück-DB = 10.000 € ÷ 20 € = 500 Stück. Ab dem 501. Stück machst du Gewinn.'],
    ['Was gilt genau im Break-even-Punkt?', ['Umsatz = Gesamtkosten', 'Umsatz = Fixkosten', 'Der Gewinn ist am höchsten'], 'Im Break-even-Punkt ist der Gewinn genau null: Erlöse und Gesamtkosten sind gleich hoch.'],
    ['Die Fixkosten steigen, alles andere bleibt gleich. Was passiert mit der Break-even-Menge?', ['Sie steigt', 'Sie sinkt', 'Sie bleibt gleich'], 'Mehr Fixkosten müssen gedeckt werden – bei gleichem DB pro Stück brauchst du also mehr Stück.']
  ],
  guv: [
    ['Die Miete fürs Büro – was ist das in der GuV?', ['Aufwand', 'Ertrag', 'Gar nichts – erfolgsneutral'], 'Miete verbraucht Werte und mindert den Gewinn – sie steht in der GuV als Aufwand.'],
    ['Das Unternehmen nimmt einen Kredit auf. Wie wirkt das in der GuV?', ['Gar nicht – das ist erfolgsneutral', 'Als Ertrag', 'Als Aufwand'], 'Ein Kredit ändert nur die Bilanz (mehr Bank, mehr Verbindlichkeiten). Erst die Zinsen darauf sind Aufwand.'],
    ['Erträge 800.000 €, Aufwendungen 650.000 €. Was steht unter dem Strich?', ['150.000 € Jahresüberschuss', '150.000 € Jahresfehlbetrag', '1.450.000 € Jahresüberschuss'], 'Erträge − Aufwendungen = 800.000 € − 650.000 € = 150.000 € Jahresüberschuss.']
  ],
  kostenrechnung: [
    ['Die monatliche Miete für die Fertigungshalle – was für Kosten sind das?', ['Fixkosten', 'Variable Kosten', 'Einzelkosten'], 'Die Miete fällt an, egal wie viel produziert wird – also Fixkosten.'],
    ['Der Rohstoff, der direkt in ein Produkt eingeht – wie ordnest du ihn diesem Produkt zu?', ['Als Einzelkosten', 'Als Gemeinkosten', 'Als Fixkosten'], 'Er lässt sich dem einzelnen Produkt direkt zurechnen – das sind Einzelkosten.'],
    ['Fixkosten 6.000 €, variable Kosten 4 € pro Stück, 1.000 Stück. Wie hoch sind die Gesamtkosten?', ['10.000 €', '6.004 €', '4.000 €'], 'Gesamtkosten = Fixkosten + variable Kosten × Menge = 6.000 € + 4 € × 1.000 = 10.000 €.']
  ],
  swot: [
    ['Ein starkes Markenimage ist in der SWOT-Analyse …', ['eine Stärke', 'eine Chance', 'ein Risiko'], 'Das Image gehört zum Unternehmen selbst (intern) und hilft ihm – also eine Stärke. Chancen kommen von außen.'],
    ['Ein neuer Konkurrent drängt auf den Markt. Wohin gehört das?', ['Risiko (Threat)', 'Schwäche (Weakness)', 'Stärke (Strength)'], 'Das passiert außerhalb des Unternehmens und kann ihm schaden – ein externes Risiko, keine interne Schwäche.'],
    ['Stärken und Schwächen beschreiben …', ['das Unternehmen selbst (intern)', 'den Markt (extern)', 'nur die Konkurrenz'], 'S und W sind intern, O und T kommen von außen – das ist die wichtigste Trennung der SWOT.']
  ],
  'marketing-mix': [
    ['Die 4 P des Marketing-Mix: Product, Price, Place und …', ['Promotion', 'People', 'Profit'], 'Promotion = Kommunikationspolitik, also Werbung, PR und Verkaufsförderung.'],
    ['Eine Rabattaktion gehört zu welchem Bereich?', ['Preispolitik', 'Produktpolitik', 'Distributionspolitik'], 'Rabatte verändern den Preis, den der Kunde zahlt – das ist Preis- bzw. Konditionenpolitik.'],
    ['Ein eigener Online-Shop als Vertriebsweg gehört zu …', ['Distributionspolitik (Place)', 'Kommunikationspolitik (Promotion)', 'Produktpolitik (Product)'], 'Es geht darum, wie das Produkt zum Kunden kommt – also Distribution.']
  ],
  zuschlagskalkulation: [
    ['Fertigungsmaterial 100 €, Materialgemeinkosten-Zuschlag 10 %. Wie hoch sind die Materialkosten?', ['110 €', '100 €', '10 €'], 'Materialkosten = Fertigungsmaterial + 10 % MGK = 100 € + 10 € = 110 €.'],
    ['Woraus bestehen die Herstellkosten?', ['Materialkosten + Fertigungskosten', 'Materialkosten + Verwaltungsgemeinkosten', 'Selbstkosten + Gewinn'], 'Herstellkosten = Materialkosten + Fertigungskosten. Verwaltung und Vertrieb kommen erst danach dazu.'],
    ['Herstellkosten 200 €, Verwaltungs-GK 10 %, Vertriebs-GK 5 % (beide auf die Herstellkosten). Selbstkosten?', ['230 €', '215 €', '210 €'], '200 € + 10 % (20 €) + 5 % (10 €) = 230 € Selbstkosten.']
  ],
  bilanzanalyse: [
    ['Wie berechnet man die Eigenkapitalquote?', ['Eigenkapital ÷ Gesamtkapital', 'Eigenkapital ÷ Fremdkapital', 'Gewinn ÷ Eigenkapital'], 'EK-Quote = Eigenkapital ÷ Gesamtkapital (Bilanzsumme). Gewinn ÷ EK wäre die Eigenkapitalrentabilität.'],
    ['Eigenkapital 400.000 €, Bilanzsumme 1.000.000 €. Wie hoch ist die EK-Quote?', ['40 %', '60 %', '25 %'], '400.000 € ÷ 1.000.000 € = 0,4 = 40 %.'],
    ['Anlagendeckungsgrad I liegt über 100 %. Was heißt das?', ['Das Anlagevermögen ist komplett durch Eigenkapital finanziert', 'Das Unternehmen ist überschuldet', 'Der Umsatz deckt alle Kosten'], 'Anlagendeckungsgrad I = EK ÷ Anlagevermögen. Über 100 % heißt: Das langfristige Vermögen ist voll mit Eigenkapital finanziert.']
  ]
};
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
    h('div', { class: 'm-mc-h' }, h('b', {}, L('Mini-Check: Hast du’s verstanden?', 'Mini check: did it click?')), h('small', {}, L('3 Fragen · 30 Sekunden', '3 questions · 30 seconds'))),
    ...items.map(x => x.el), h('div', { class: 'm-mc-f' }, go), sum);
  const reveal = () => {
    box.classList.add('open');
    qs.forEach((q, i) => { items[i].btns[q.r].classList.add('ok'); items[i].why.hidden = false; items[i].why.classList.remove('blur'); });
    sum.querySelector('.m-mc-lock')?.remove();
  };
  go.onclick = async () => {
    if (box.classList.contains('done')) return;
    box.classList.add('done');
    const score = qs.filter(q => q.pick === q.r).length, n = qs.length, all = score === n;
    tr('Mini-Check geprüft', `${score}/${n} ${topic}`);
    qs.forEach((q, i) => {
      const ok = q.pick === q.r;
      items[i].el.classList.add(ok ? 'right' : 'wrong');
      items[i].btns.forEach(b => { b.disabled = true; });
      items[i].btns[q.pick].classList.add(ok ? 'ok' : 'no');
      if (!ok) { items[i].why.hidden = false; items[i].why.classList.add('blur'); }
    });
    go.hidden = true;
    const head = h('p', { class: 'm-mc-score' }, h('b', {}, L(`${score} von ${n} richtig.`, `${score} of ${n} correct.`)), ' ',
      all ? L('Sauber – das sitzt.', 'Clean – that sticks.') : n - score === 1 ? L('Fast. Eine hat dich erwischt.', 'Close. One got you.') : score ? L('Zwei haben dich erwischt.', 'Two got you.') : L('Gut, dass das jetzt passiert und nicht in der Klausur.', 'Better now than in the exam.'));
    sum.replaceChildren(head); sum.hidden = false;
    try { c.note(`[Mini-Check auf der Themenseite: ${score} von ${n} richtig]`); } catch (x) {}
    if (all) {
      reveal();
      sum.append(h('button', { class: 'm-mc-cta', type: 'button', onclick: () => onExam && onExam() }, L('Jetzt die echten Klausuraufgaben →', 'Now the real exam tasks →')));
    } else if (getAccount()) {
      reveal();
    } else {
      const lock = h('button', { class: 'm-mc-cta m-mc-lock', type: 'button', onclick: async () => {
        const { openAuth } = await import('./account.js');
        const ok = await openAuth({ registerTitle: L('Sieh, was richtig gewesen wäre – und warum', 'See the right answer – and why'),
          registerSub: L('Kostenlos, mit Google in zwei Klicks. Danach erklärt dir Max genau deinen Fehler – und auf Wunsch deine eigenen Vorlesungsfolien.', 'Free, two clicks with Google. Then Max explains exactly your mistake – and your own lecture slides if you like.'), why: 'Mini-Check' });
        if (ok && getAccount()) reveal();
      } }, L('Auflösung kostenlos freischalten', 'Unlock the answers for free'));
      sum.append(h('p', { class: 'm-mc-hint' }, L('Was richtig gewesen wäre und warum, siehst du mit kostenlosem Konto.', 'The right answer and why – with a free account.')), lock);
    }
    requestAnimationFrame(() => { try { sum.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (x) {} });
  };
  return box;
}
