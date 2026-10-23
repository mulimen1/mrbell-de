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
