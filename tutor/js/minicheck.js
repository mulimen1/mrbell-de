// Mini-Check auf den Themenseiten (Google-Ads-Einstieg): 3 Fragen direkt nach dem ersten Erklär-Block.
// Ergebnis („2 von 3 richtig“) gibt's sofort – welche falsch war und warum, sehen Gäste nach dem kostenlosen Konto.
import { h, ico } from './util.js';
import { L } from './i18n.js';
import { getAccount, onAccount } from './api.js';

// Je Frage: q, Antworten (die RICHTIGE steht immer zuerst – gemischt wird beim Anzeigen), why
// Fragen je Thema liegen als kleine Dateien unter /tutor/data/mc/<thema>.json (nur das eine Set wird geladen)
const KEYS = new Set(["bilanz","buchungssatz","kapitalwert","deckungsbeitrag","break-even","guv","kostenrechnung","swot","marketing-mix","zuschlagskalkulation","preiselastizitaet","leverage","amortisation","zinsfuss","annuitaet","abschreibung","bab","rueckstellungen","eigenkapitalrentabilitaet","grenzkosten","porter","abc-analyse","angebot-und-nachfrage","ansoff-matrix","balanced-scorecard","barwert-abzinsen","bcg-matrix","bestandskonten-erfolgskonten","bruttoinlandsprodukt","cashflow","divisionskalkulation","doppelte-buchfuehrung","eigenkapitalquote","einzelkosten-gemeinkosten","finanzierungsarten","fixe-und-variable-kosten","fuehrungsstile","gewinnvergleichsrechnung","inflation","inventur-inventar","kalkulatorische-kosten","konsumentenrente-produzentenrente","kostenvergleichsrechnung","liquiditaetsgrade","make-or-buy","maschinenstundensatz","opportunitaetskosten","optimale-bestellmenge","optimales-produktionsprogramm","organisationsformen","pestel-analyse","produktlebenszyklus","rechnungsabgrenzungsposten","rechtsformen","rentabilitaet","skonto-buchen","smart-ziele","tilgungsplan","umsatzsteuer-vorsteuer-buchen","zinseszins","bwl","bilanzanalyse","latente-steuern","buchungssaetze-uebungen","aufwand-und-kosten","wacc","plankostenrechnung","jahresabschluss","gesamtkostenverfahren-umsatzkostenverfahren","eroeffnungsbilanz-schlussbilanz","degressive-abschreibung","geringwertige-wirtschaftsgueter","niederstwertprinzip","imparitaetsprinzip-realisationsprinzip","grundsaetze-ordnungsmaessiger-buchfuehrung","anschaffungskosten","herstellungskosten","bestandsveraenderungen-buchen","privatentnahme-buchen","anzahlungen-buchen","ruecklagen","konzernabschluss","goldene-bilanzregel","working-capital","cash-conversion-cycle","ebit-ebitda","lagerkennzahlen","vollkostenrechnung-teilkostenrechnung","kostenartenrechnung","kostenstellenrechnung","kostentraegerrechnung","handelskalkulation","rueckwaertskalkulation-differenzkalkulation","handelsspanne-kalkulationsfaktor","aequivalenzziffernkalkulation","prozesskostenrechnung","target-costing","preisuntergrenze","kostenfunktion","sprungfixe-kosten","betriebsergebnis","statische-dynamische-investitionsrechnung","nutzwertanalyse","sensitivitaetsanalyse","free-cashflow","dcf-verfahren","capm","rentenbarwertfaktor","effektivzins","factoring","lieferantenkredit","kontokorrentkredit","kapitalerhoehung","liquiditaetsplanung","leasing","portfoliotheorie","aida-modell","kano-modell","customer-journey","customer-lifetime-value","marktsegmentierung","marktforschung","usp","preisdifferenzierung","preisstrategien","distributionspolitik","kommunikationspolitik","produktpolitik","marktvolumen-marktpotenzial","wertkette-porter","wettbewerbsstrategien-porter","kernkompetenzen","stakeholder-analyse","unternehmensziele","controlling","budgetierung","benchmarking","okr","netzplantechnik","lean-management","six-sigma","kaizen","supply-chain-management","just-in-time","xyz-analyse","bestellpunktverfahren","produktionsfaktoren","oekonomisches-prinzip","personalbedarfsplanung","maslow-beduerfnispyramide","herzberg-zwei-faktoren-theorie","change-management","unternehmenskultur","aufbauorganisation-ablauforganisation","businessplan","aktiengesellschaft","produktionsfunktion","einkommenselastizitaet","indifferenzkurve","budgetgerade","grenznutzen","grenzrate-der-substitution","haushaltsoptimum","monopol","oligopol","marktformen","vollkommener-wettbewerb","spieltheorie","nash-gleichgewicht","gefangenendilemma","externe-effekte","oeffentliche-gueter","marktversagen","mindestpreis-hoechstpreis","produktionsmoeglichkeitenkurve","komparativer-kostenvorteil","wirtschaftskreislauf","volkswirtschaftliche-gesamtrechnung","konjunkturzyklus","arbeitslosigkeit","geldpolitik","fiskalpolitik","multiplikator","is-lm-modell","phillips-kurve","quantitaetstheorie","wechselkurs","zahlungsbilanz","magisches-viereck","deflation","stagflation","verbraucherpreisindex","lorenzkurve-gini-koeffizient","varianz-standardabweichung","erwartungswert","normalverteilung","binomialverteilung","regression","korrelation","hypothesentest","konfidenzintervall","lagrange","zinsrechnung"]);
const SETS = {};
const PRAISE = ['Stark – genau so.', 'Sitzt.', 'Respekt – die erwischt fast jeden.'];
const ALIAS = { 'aktiva-passiva': 'bilanz', eroeffnungsbilanz: 'bilanz', 'swot-beispiel': 'swot', 'swot-matrix': 'swot', 'swot-vorlage': 'swot' };
export const hasMiniCheck = slug => KEYS.has(ALIAS[slug] || slug);
const LOADING = {};
export function loadSet(slug) {
  const k = ALIAS[slug] || slug; if (!KEYS.has(k)) return Promise.resolve(null);
  if (SETS[k]) return Promise.resolve(SETS[k]);
  return LOADING[k] || (LOADING[k] = fetch(`/tutor/data/mc/${k}.json`).then(r => r.ok ? r.json() : null).then(x => { if (x) SETS[k] = x; else delete LOADING[k]; return x; }).catch(() => { delete LOADING[k]; return null; }));
}

// Antworten gemischt, aber bei jedem Laden gleich (sonst springt die richtige Antwort)
function order(q, n) { let x = 0; for (const ch of q) x = (x * 31 + ch.charCodeAt(0)) >>> 0; const idx = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { x = (x * 1103515245 + 12345) >>> 0; const j = x % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx; }

export function miniCheck(c, o = {}) {
  if (!hasMiniCheck(c.slug)) return null;
  const box = h('section', { class: 'm-mc' }), set = SETS[ALIAS[c.slug] || c.slug];
  const fill = x => { if (x && x.length) { build(c, x, o, box); box.hidden = false; } else box.remove(); };
  if (set) fill(set); else { box.hidden = true; loadSet(c.slug).then(fill); }
  return box;
}
function build(c, set, { onExam } = {}, box) {
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
  box.append(
    h('div', { class: 'm-mc-h' }, h('b', {}, L('Mini-Check: Hast du’s verstanden?', 'Mini check: did it click?')), h('small', {}, getAccount() ? L('3 Fragen · 30 Sekunden', '3 questions · 30 seconds') : L('3 Fragen · Ergebnis sofort', '3 questions · score instantly'))),
    ...items.map(x => x.el), h('div', { class: 'm-mc-f' }, go), sum);
  // Auflösung: welche richtig/falsch war, die richtige Antwort und warum
  const reveal = () => {
    box.classList.add('open');
    qs.forEach((q, i) => {
      const ok = q.pick === q.r;
      items[i].btns.forEach(x => x.classList.remove('ok', 'no'));
      items[i].el.classList.add(ok ? 'right' : 'wrong');
      items[i].btns[q.pick].classList.add(ok ? 'ok' : 'no');
      items[i].btns[q.r].classList.add('ok');
      items[i].why.textContent = (ok ? PRAISE[i % PRAISE.length] + ' ' : '') + q.why;
      items[i].why.hidden = false; items[i].why.classList.remove('blur');
    });
    sum.querySelectorAll('.m-mc-lock, .m-mc-hint').forEach(x => x.remove());
  };
  let afterUnlock = () => reveal();
  // Gast meldet sich irgendwo an (auch über Klausurfragen) → Auflösung sofort da
  const off = onAccount(a => { if (a && box.dataset.g === '1' && box.classList.contains('done') && !box.classList.contains('open') && box.isConnected) { afterUnlock(); try { off && off(); } catch (x) {} } });
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
    try { sessionStorage.setItem('tutor.mcScore', JSON.stringify({ t: topic, s: score, n })); } catch (x) {}
    items.forEach(x => x.btns.forEach(b => { b.disabled = true; }));
    box.dataset.g = getAccount() ? '' : '1';
    go.hidden = true;
    const head = h('p', { class: 'm-mc-score' }, h('b', {}, L(`${score} von ${n} richtig.`, `${score} of ${n} correct.`)), ' ',
      all ? L('Stark – das sitzt.', 'Strong – that sticks.') : n - score === 1 ? L('Fast. Eine hat dich erwischt.', 'Close. One got you.') : score ? L('Zwei haben dich erwischt.', 'Two got you.') : L('Gut, dass das jetzt passiert und nicht in der Klausur.', 'Better now than in the exam.'));
    sum.replaceChildren(head); sum.hidden = false;
    try { c.note(`[Mini-Check auf der Themenseite: ${score} von ${n} richtig]`); } catch (x) {}
    const wrong = n - score;
    const heroFor = () => h('div', { class: 'm-mc-hero' },
      h('span', { class: 'm-mc-heroi', html: ico('exam') }),
      h('span', { class: 'm-mc-herot' }, h('b', {}, all ? L('Sitzt. Jetzt wie in der Klausur.', 'Nailed it. Now exam-style.') : wrong === 1 ? L('Eine hat dich erwischt – genau so fragen sie in der Klausur.', 'One got you – that’s exactly how exams ask.') : L(`Genau so kommt ${topic} in der Klausur dran.`, `That’s how ${topic} shows up in the exam.`)),
        h('small', {}, L(`4 echte Klausuraufgaben zu ${topic} – mit Musterlösung Schritt für Schritt.`, `4 real exam tasks on ${topic} – with step-by-step solutions.`))),
      h('button', { class: 'm-mc-cta m-mc-herob', type: 'button', onclick: () => { tr('Mini-Check Klausuraufgaben', `${score}/${n} ${getAccount() ? 'Konto' : 'Gast'}`); if (onExam) onExam(); } }, L('Klausuraufgaben starten', 'Start exam tasks'), h('span', { 'aria-hidden': 'true' }, ' →')));
    // Nach der Anmeldung: Auflösung da + „Das hast du gerade freigeschaltet“ + direkt weiter zu den Klausuraufgaben
    afterUnlock = () => {
      if (box.dataset.unl) return; box.dataset.unl = '1';
      reveal();
      sum.querySelectorAll('.m-mc-lock, .m-mc-hint, .m-mc-tease, .m-mc-hero, .m-mc-cta').forEach(x => x.remove());
      const it = (t, s2) => h('li', {}, h('span', { class: 'm-mc-uk' }, '✓'), h('span', {}, h('b', {}, t), s2 ? h('small', {}, s2) : null));
      sum.append(h('div', { class: 'm-mc-unl' },
        h('p', { class: 'm-mc-unlh' }, h('b', {}, L('Freigeschaltet.', 'Unlocked.')), ' ', L('Das gehört jetzt alles dir – kostenlos:', 'All of this is yours now – free:')),
        h('ul', {}, it(L('Deine Auflösung', 'Your answers'), L('oben – mit Erklärung zu jeder Frage', 'above – every question explained')),
          it(L(`Klausuraufgaben zu ${topic}`, `Exam tasks on ${topic}`), L('mit Musterlösung Schritt für Schritt', 'step-by-step solutions')),
          it(L('Karteikarten & Podcast', 'Flashcards & podcast'), L('aus deinen eigenen Folien', 'from your own slides')),
          it(L('Excel-Helfer', 'Excel helper'), L('60 geprüfte Vorlagen + Trainer', '60 checked templates + trainer')),
          it(L('Deine Bibliothek', 'Your library'), L('alles, was Max dir baut, bleibt gespeichert', 'everything Max builds stays saved'))),
        h('button', { class: 'm-mc-tour', type: 'button', onclick: () => { tr('Mini-Check BWL Max erkunden', ''); import('./gotour.js').then(m => m.goTour()).catch(() => {}); } }, h('span', { html: ico('spark') }), L('BWL Max erkunden', 'Explore BWL Max'), h('small', {}, L('kurze Führung, 1 Minute', 'quick tour, 1 minute')))), heroFor());
      setTimeout(() => { try { box.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (x) {} }, 350);
    };
    // Angemeldet oder alles richtig: Auflösung sofort, dann die Klausuraufgaben
    if (all) { box.classList.add('all'); head.prepend(h('span', { class: 'm-mc-all' }, '✓')); }
    if (getAccount() || all) {
      reveal(); sum.querySelectorAll('.m-mc-cta').forEach(x => x.remove()); sum.append(heroFor());
      requestAnimationFrame(() => { try { sum.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (x) {} });
      return;
    }
    // Gast mit Fehlern: Ergebnis ja, Auflösung + Klausuraufgaben erst mit kostenlosem Konto (ein Klick auf Google)
    items.forEach((x, i) => { x.btns[qs[i].pick].classList.add('ok'); x.why.textContent = qs[i].why; x.why.hidden = false; x.why.classList.add('blur'); });
    sum.append(h('p', { class: 'm-mc-hint' }, L('Welche falsch war – und warum – siehst du mit kostenlosem Konto.', 'Which one was wrong – and why – with a free account.')));
    const open = async () => { tr('Mini-Check Auflösung geklickt', `${score}/${n}`); if (getAccount() || await unlock(L('Sieh deine Auflösung', 'See your answers'), L(`Kostenlos mit Google. Danach siehst du, welche falsch war und warum – plus 4 Klausuraufgaben zu ${topic}.`, `Free with Google. Then see which was wrong and why – plus 4 exam tasks on ${topic}.`), 'Mini-Check')) afterUnlock(); };
    sum.append(h('button', { class: 'm-mc-cta m-mc-lock', type: 'button', onclick: open }, L('Auflösung ansehen', 'See the answers')),
      h('button', { class: 'm-mc-tease', type: 'button', onclick: open },
        h('span', { class: 'm-mc-teasei', html: ico('lock') }),
        h('span', { class: 'm-mc-teaset' }, h('b', {}, L(`+ 4 Klausuraufgaben zu ${topic}`, `+ 4 exam tasks on ${topic}`)), h('small', {}, L('mit Musterlösung – gibt’s mit demselben Klick dazu', 'with solutions – included with the same click'))),
        h('span', { class: 'm-mc-teasel', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'))));
    requestAnimationFrame(() => { try { sum.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (x) {} });
  };
  return box;
}

// Kleiner Knopf direkt nach der ersten Erklärung: wer nur die Definition liest, sieht trotzdem den Mini-Check und springt per Klick hin
export function miniTeaser(mc) {
  return h('button', { class: 'm-mc-tz', type: 'button', onclick: () => { try { window.BM && window.BM.track('Mini-Check angeklickt', ''); } catch (x) {} mc.scrollIntoView({ behavior: 'smooth', block: 'start' }); mc.animate([{ boxShadow: '0 0 0 0 color-mix(in srgb, var(--bmA) 55%, transparent)' }, { boxShadow: '0 0 0 14px color-mix(in srgb, var(--bmA) 0%, transparent)' }], { duration: 900, delay: 450 }); } },
    h('span', { class: 'm-mc-tzi' }, '✓'), h('span', { class: 'm-mc-tzt' }, h('b', {}, L('Mini-Check: Hast du’s verstanden?', 'Mini check: did it click?')), h('small', {}, L('3 Fragen · 30 Sekunden', '3 questions · 30 seconds'))), h('span', { class: 'm-mc-tza' }, '↓'));
}
