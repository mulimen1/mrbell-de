// Themen-Einstieg (Google-Anzeige /?thema=…): aus der Tafel wird eine Lernseite, die zum Mitmachen zwingt.
// Mini-Check nach dem ersten Absatz, Quiz und Übung live auf der Seite (ohne Konto), Max kommentiert beim Scrollen,
// danach eine ehrliche Speichern-Karte. Alles läuft auf der Seite – nichts springt auf, kein Raumwechsel.
import { h, ls, ico } from './util.js';
import { watchJob } from './ui.js';
import { L } from './i18n.js';
import { ask, getAccount } from './api.js';
import { mathify, polishBoard, queueMath } from './math.js';
import { sanitize, richText } from './sanitize.js';
import { getSpice } from './max.js';
import { mode as maxMode } from './maxcfg.js';

// ---------- Mini-Check: eine Frage pro Sofort-Tafel (fachlich geprüft, bewusst einfach und eindeutig) ----------
export const CHECKS = {
  bilanz: { q: 'Kurzer Check: Wo steht ein Bankdarlehen?', a: ['Aktiva', 'Passiva'], r: 1, why: 'Das Darlehen ist Fremdkapital – also Mittelherkunft auf der Passivseite. Das Guthaben auf dem Bankkonto stünde dagegen auf der Aktivseite.' },
  buchungssatz: { q: 'Kurzer Check: Du kaufst Waren bar. Auf welcher Seite bucht das Kassenkonto?', a: ['Soll', 'Haben'], r: 1, why: 'Die Kasse ist ein Aktivkonto und nimmt ab – Abgänge stehen bei Aktivkonten im Haben.' },
  kapitalwert: { q: 'Kurzer Check: Der Kapitalwert einer Investition ist +5.000 €. Ist sie vorteilhaft?', a: ['Ja', 'Nein'], r: 0, why: 'Ein positiver Kapitalwert heißt: Die Investition bringt mehr als die Verzinsung zum Kalkulationszins – sie ist vorteilhaft.' },
  deckungsbeitrag: { q: 'Kurzer Check: Preis 50 €, variable Kosten 30 € pro Stück. Wie hoch ist der Deckungsbeitrag pro Stück?', a: ['20 €', '80 €', '30 €'], r: 0, why: 'Stück-DB = Preis − variable Stückkosten = 50 € − 30 € = 20 €. Fixkosten spielen dabei keine Rolle.' },
  'break-even': { q: 'Kurzer Check: Fixkosten 10.000 €, Deckungsbeitrag 20 € pro Stück. Wo liegt die Break-even-Menge?', a: ['500 Stück', '200 Stück', '2.000 Stück'], r: 0, why: 'Fixkosten ÷ Stück-DB = 10.000 € ÷ 20 € = 500 Stück. Ab dem 501. Stück machst du Gewinn.' },
  guv: { q: 'Kurzer Check: Die Miete fürs Büro – Aufwand oder Ertrag?', a: ['Aufwand', 'Ertrag'], r: 0, why: 'Miete mindert den Gewinn – sie steht in der GuV als Aufwand.' },
  swot: { q: 'Kurzer Check: Ein neuer Konkurrent eröffnet direkt nebenan. Was ist das in der SWOT-Analyse?', a: ['Schwäche', 'Risiko'], r: 1, why: 'Eine Entwicklung von außen, die du nicht steuerst, ist ein Risiko. Schwächen liegen immer im Unternehmen selbst.' },
  abschreibung: { q: 'Kurzer Check: Maschine für 50.000 €, Nutzungsdauer 5 Jahre, lineare Abschreibung. Wie hoch ist die Abschreibung pro Jahr?', a: ['10.000 €', '5.000 €', '50.000 €'], r: 0, why: 'Linear heißt: Anschaffungskosten ÷ Nutzungsdauer = 50.000 € ÷ 5 = 10.000 € – jedes Jahr gleich viel.' },
  'marketing-mix': { q: 'Kurzer Check: Du verkaufst ab jetzt auch über einen eigenen Onlineshop. Welches P ist das?', a: ['Product', 'Place', 'Promotion'], r: 1, why: 'Der Vertriebsweg gehört zur Distributionspolitik – also Place.' },
  zuschlagskalkulation: { q: 'Kurzer Check: Fertigungsmaterial 100 €, Materialgemeinkostenzuschlag 20 %. Wie hoch sind die Materialkosten?', a: ['120 €', '20 €', '80 €'], r: 0, why: 'Materialkosten = Materialeinzelkosten + Materialgemeinkosten = 100 € + 20 % (20 €) = 120 €.' },
  bwl: { q: 'Kurzer Check: Gehört die Bilanz zum internen oder zum externen Rechnungswesen?', a: ['Intern', 'Extern'], r: 1, why: 'Die Bilanz richtet sich an Außenstehende wie Gläubiger und Finanzamt – externes Rechnungswesen. Die Kostenrechnung ist intern.' }
};
const YAY = ['Sauber. Du bist gefährlich gut.', 'Stark – das sitzt.', 'Richtig. Ich bin fast ein bisschen stolz.', 'Treffer. So sieht das in der Klausur auch aus.'];
const NAY = ['Autsch. Gut, dass das jetzt passiert und nicht in der Klausur.', 'Knapp daneben ist auch vorbei – genau dafür bin ich da.', 'Nope. Aber ab jetzt nie wieder, versprochen.'];
const pick = a => a[Math.floor(Math.random() * a.length)];

// ---------- Max kommentiert beim Scrollen (2–3 je Thema) ----------
const SAY = {
  bilanz: [['.m-tk, table', 'Links wofür, rechts woher – mehr Magie ist das nicht.'], ['.calc, .formel', 'Aktiva = Passiva. Immer. Sonst hat jemand geschummelt.'], ['.warn', 'Hier fallen viele in der Klausur durch.']],
  buchungssatz: [['.bs', 'Soll an Haben – wer das einmal kapiert, bucht alles.'], ['.calc', 'Vorsteuer nie vergessen. Das Finanzamt vergisst auch nichts.'], ['.warn', 'Genau hier verliert man in der Klausur die Punkte.']],
  kapitalwert: [['.formel', 'Diese Formel kommt dran. Ich wette meine Frisur drauf.'], ['table, .m-tw', 'Abzinsen ist das ganze Geheimnis. Echt jetzt.'], ['.warn', 'Hier fallen viele in der Klausur durch.']],
  deckungsbeitrag: [['.formel, .calc', 'Preis minus variable Kosten. Klingt banal, killt trotzdem Klausuren.'], ['.warn', 'Fixkosten hier mit reinrechnen? Nope. Klassiker.']],
  'break-even': [['.formel, .calc', 'Fixkosten durch Stück-DB – das reicht oft schon für die volle Punktzahl.'], ['svg', 'Wo sich die Linien kreuzen, fängt das Geldverdienen an.'], ['.warn', 'Hier fallen viele in der Klausur durch.']],
  guv: [['table, .m-tk', 'Aufwand links, Ertrag rechts. Dein Gewinn steht unten.'], ['.warn', 'Bilanz und GuV verwechseln – passiert öfter, als du denkst.']],
  swot: [['.m-swot, table', 'Intern vs. extern – genau an der Grenze scheitern die meisten.'], ['.warn', 'Hier fallen viele in der Klausur durch.']],
  abschreibung: [['.calc, .formel', 'Linear heißt: jedes Jahr gleich. Mehr Geheimnis gibt’s nicht.'], ['.bs', 'Abschreibung an Bank? Nie. Da fließt kein Geld.'], ['.warn', 'Hier fallen viele in der Klausur durch.']],
  'marketing-mix': [['table, .m-tw, ul', 'Vier P – und jedes kommt in der Klausur mal dran.'], ['.warn', 'Hier fallen viele in der Klausur durch.']],
  zuschlagskalkulation: [['table, .m-tw', 'Schema einmal drin – dann rechnet sich das fast von selbst.'], ['.calc', 'Zuschlag immer auf die richtige Basis. Da patzen viele.'], ['.warn', 'Hier fallen viele in der Klausur durch.']],
  bwl: [['ul, table', 'Such dir den Bereich, der dir Angst macht. Den nehmen wir zuerst.'], ['.m-next', 'Tipp an – ich bau dir die Seite live.']]
};
const SAY0 = [['.formel, .calc', 'Das hier kommt in Klausuren gern dran.'], ['.warn', 'Hier fallen viele in der Klausur durch.'], ['.result', 'Das ist der Satz, den du in der Klausur hinschreibst.']];

// Was Max denkt, während er live baut
const THINK_Q = ['Ich such dir die fiesesten Klausurfragen raus …', 'Nicht zu leicht. Du sollst ja was lernen.', 'Ein paar Fallen bau ich ein. Hehe.', 'Antworten doppelt geprüft. Ehrensache.', 'Gleich fertig – Stift ist schon warm.'];
export const CHAT_THINK = ['Moment, ich denk kurz nach …', 'Gute Frage. Ehrlich.', 'Ich sortier das für dich …', 'Gleich hab ich’s …'];
const qTitle = (c, when) => (c.stem ? `Dein ${c.stem}-Quiz` : `Dein Quiz: ${c.topic}`) + (whenLabel(when) ? ` – Klausur ${whenLabel(when)}` : '');
const xTitle = (c, when) => (c.stem ? `Deine ${c.stem}-Übung` : `Deine Übung: ${c.topic}`) + (whenLabel(when) ? ` – Klausur ${whenLabel(when)}` : '');
const THINK_X = ['Ich denk mir einen Fall aus, der wirklich drankommt …', 'Zahlen so wählen, dass es nicht zu einfach wird …', 'Die Lösung rechne ich zweimal nach.', 'Gleich darfst du ran. Keine Panik.'];

// ---------- Tageslimit pro Browser (ohne Konto): 2 Quiz + 2 Übungen ----------
const CAP = 2;
function capGet() { try { const c = ls.get('tutor.entryCap', null); const d = new Date().toDateString(); return c && c.d === d ? c : { d, q: 0, x: 0 }; } catch (e) { return { d: '', q: 0, x: 0 }; } }
function capUse(k) { const c = capGet(); c[k] = (c[k] || 0) + 1; try { ls.set('tutor.entryCap', c); } catch (e) {} }
const capOk = k => capGet()[k] < CAP;

// Klausurtermin (einmal pro Besuch gefragt)
const WHEN = [['soon', 'Klausur in < 2 Wochen', 'in unter 2 Wochen'], ['month', 'in ca. 1 Monat', 'in ca. 1 Monat'], ['later', 'später', 'später'], ['unk', 'weiß ich nicht', '']];
const whenGet = () => { try { return sessionStorage.getItem('tutor.entryWhen'); } catch (e) { return null; } };
const whenSet = v => { try { sessionStorage.setItem('tutor.entryWhen', v); } catch (e) {} };
const whenLabel = v => (WHEN.find(w => w[0] === v) || [])[2] || '';
const whenHint = v => ({ soon: 'Die Klausur ist in unter 2 Wochen: klausurnah, typische Fallen, nichts Exotisches.', month: 'Die Klausur ist in ca. 1 Monat: solide Grundlagen plus typische Klausurfallen.', later: 'Die Klausur ist noch länger hin: Verständnis vor Tempo, mit einer etwas kniffligeren Frage.' })[v] || 'Uni-BWL-Klausurniveau.';

// ---------- Kontext einer Seite ----------
// c = { t: .tafel, b: board, slug, topic, trainer, scroller, say(text, ms), think(lines|null), note(text), busy() }
const plain = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1800);

// Mini-Check + Haken direkt nach dem ersten Absatz
export function enhance(c) {
  const t = c.t; if (!t || t.querySelector('.m-chk, .m-hook, .m-lad')) return;
  if (c.speak && c.practice) {   // Lern-Stufen: verstanden → Klausurfragen → echter Praxisfall (mit kostenlosem Konto)
    // erst nach Definition + erstem Beispiel/Karten (Ende erstes Drittel), sonst ergibt der Pfad keinen Sinn
    const kids = [...t.children].filter(e => !e.matches('.tt, .m-bsw, .m-next, .m-lad, .source'));
    let at = kids.findIndex((e, i) => i >= 1 && e.matches('.vs, table, .example, .kpis, .formel, .calc, .grid, ul, ol'));
    if (at >= 0 && kids[at].matches('.example') && kids[at + 1] && !/^h\d$/.test(kids[at + 1].localName)) at++;   // Beispiel samt erster Rechnung
    if (at < 0 || at > Math.max(2, Math.round(kids.length * .45))) at = Math.max(1, Math.round(kids.length / 3) - 1);
    const lad = ladder(c); if (kids[at]) kids[at].after(lad); else t.append(lad);
    // dieselbe Karte am Ende der Tafel (statt „Karteikarten machen“)
    const nx = t.querySelector('.m-next'), lad2 = ladder(c); if (nx) nx.before(lad2); else t.append(lad2);
    watchScroll(c); return;
  }
  const first = [...t.children].find(e => !e.classList.contains('tt') && !/^h\d$/.test(e.localName));   // erster Inhaltsblock (meist der erste Absatz)
  const hook = hookCard(c);
  const chk = CHECKS[c.slug];
  let box;
  if (chk) {
    const res = h('div', { class: 'm-chkr', hidden: true });
    const btns = chk.a.map((a, i) => h('button', { class: 'm-chkb', type: 'button', onclick: () => {
      if (box.classList.contains('done')) return;
      box.classList.add('done');
      btns.forEach((b, j) => { b.disabled = true; b.classList.toggle('ok', j === chk.r); b.classList.toggle('no', j === i && i !== chk.r); });
      const ok = i === chk.r;
      res.replaceChildren(h('b', {}, ok ? pick(YAY) : pick(NAY)), ' ', chk.why);
      res.hidden = false; hook.hidden = false;
      res.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
      hook.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 250, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      c.say(ok ? 'Na also. Jetzt das Quiz – da trennt sich die Spreu vom Weizen.' : 'Kein Drama. Genau dafür bauen wir gleich das Quiz.', 3500);
      c.note(`[Mini-Check auf der Themenseite: „${chk.q}“ – ${ok ? 'richtig' : 'falsch'} beantwortet]`);
    } }, a));
    box = h('div', { class: 'm-chk' }, h('p', { class: 'm-chkq' }, chk.q), h('div', { class: 'm-chka' }, btns), res);
    hook.hidden = true;
  }
  const els = [box, hook].filter(Boolean);
  if (first) first.after(...els); else t.append(...els);
  watchScroll(c);
}
// ---------- Lern-Stufen „Thema klausurfest machen“ ----------
const LAD_K = c => 'tutor.lad.' + (c.slug || c.topic);
const ladGet = c => { try { return JSON.parse(sessionStorage.getItem(LAD_K(c)) || '{}'); } catch (e) { return {}; } };
const ladSet = (c, v) => { try { sessionStorage.setItem(LAD_K(c), JSON.stringify(Object.assign(ladGet(c), v))); } catch (e) {} dispatchEvent(new CustomEvent('bm:lad')); };
// von außen (Klausurfragen-Tafel freigeschaltet): Schritt abhaken
export function markLad(slug, v) { if (slug) ladSet({ slug }, v); }
function ladder(c) {
  const topic = c.topic || 'BWL';
  const box = h('div', { class: 'm-lad' });
  let prev = null;
  addEventListener('bm:lad', () => { if (box.isConnected) draw(); });
  const fx = n => h('span', { class: 'm-ladfx' }, ...Array.from({ length: n }, () => h('i')));
  const draw = () => {
    const st = ladGet(c), acc = !!getAccount();
    // Start und „Verstanden“ sind schon erledigt – man steigt nicht bei null ein
    // letzter Punkt „Klausurfest“ = Praxisfall an einem echten Unternehmen (mit kostenlosem Konto)
    const ok = [true, true, !!st.q, !!(st.q && st.p)], done = ok[3];
    const cur = ok.indexOf(false);
    // erstes Bild: „Verstanden“ läuft sichtbar voll (Strahl von Start → Verstanden), danach nur neu Geschafftes
    const fresh = prev ? ok.map((v, i) => v && !prev[i]) : ok.map((v, i) => i === 1);
    prev = ok.slice();
    const pct = Math.round(ok.filter(Boolean).length / 4 * 100);
    const N = [
      [L('Start', 'Start'), null, '0%'],
      [L('Verstanden', 'Understood'), null],
      [L('Klausurfragen', 'Exam questions'), () => go2()],
      [L('Klausurfest', 'Exam-ready'), () => go3(), '★']
    ];
    const path = h('div', { class: 'm-ladp' });
    N.forEach(([lab, fn, face], i) => {
      if (i) path.append(h('span', { class: 'm-ladl' + (ok[i] ? ' on' : '') + (fresh[i] ? ' fresh' : '') + (i === cur ? ' next' : '') }, h('i')));
      const isCur = i === cur, lock = !ok[i] && !isCur;
      const sym = i === 0 ? face : h('span', { class: 'm-ladico', html: ico(['', 'brain', 'exam', 'trophy'][i]) });
      const btn = h(fn && isCur ? 'button' : 'div', Object.assign({ class: 'm-ladn' + (ok[i] ? ' ok' : '') + (isCur ? ' cur' : '') + (lock ? ' lock' : '') + (fresh[i] ? ' fresh' : '') + (i === 3 ? ' m-ladz' : '') + (i === 0 ? ' m-lad0' : '') }, fn && isCur ? { type: 'button', 'aria-label': lab, onclick: () => fn() } : {}),
        sym, isCur && fn ? h('em', { class: 'm-ladt' }, L('Los', 'Go')) : null, fresh[i] ? fx(i === 3 ? 12 : 8) : null);
      path.append(h('div', { class: 'm-ladc' }, btn, h('small', {}, lab)));
    });
    const sub = done ? L(`Sitzt. ${topic} kann in der Klausur kommen.`, `Done. Bring on the ${topic} exam question.`)
      : cur === 2 ? L('Nächster Schritt: echte Klausuraufgaben mit Musterlösung.', 'Next: real exam tasks with model solutions.')
      : L(`Letzter Schritt: ${topic} an einem echten Unternehmen – so wie es in der Klausur kommt. Dann sitzt es.`, `Last step: ${topic} at a real company – exam style.`);
    box.classList.toggle('done', done);
    box.replaceChildren(
      h('div', { class: 'm-ladh' }, h('b', {}, done ? L(`${topic}: klausurfest`, `${topic}: exam-ready`) : L(`${topic} klausurfest machen`, `Make ${topic} exam-ready`)), h('span', {}, `${pct} %`)),
      path, h('p', { class: 'm-ladsub' }, sub),
      done ? null : h('button', { class: 'm-ladcta', type: 'button', onclick: () => (cur === 2 ? go2() : go3()) },
        cur === 2 ? L('Zu den Klausurfragen', 'Go to exam questions') : L('Zum Praxisfall', 'Go to the real case'), h('span', { 'aria-hidden': 'true' }, '→')));
  };
  const go2 = () => c.exam ? c.exam(topic) : liveQuiz(c, { speak: c.speak, practice: () => go3(), onDone: () => { ladSet(c, { q: 1 }); draw(); box.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  const go3 = async () => {
    if (!getAccount()) {
      c.say(L('Praxisfall gibt’s mit kostenlosem Konto. Dauert 20 Sekunden – deine Tafel bleibt, wo sie ist.', 'The real case comes with a free account. 20 seconds – your board stays right here.'), 4200);
      const { openAuth } = await import('./account.js');
      const ok = await openAuth({ registerTitle: L('Praxisfall freischalten', 'Unlock the real case'), registerSub: L('Kostenlos. Deine Tafel und dein Fortschritt bleiben gespeichert.', 'Free. Your board and progress stay saved.') });
      if (!ok && !getAccount()) return;
    }
    ladSet(c, { p: 1 }); draw();
    c.practice(topic);
  };
  draw();
  // Animation erst, wenn die Karte wirklich im Blick ist
  box.classList.add('wait');
  try { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); setTimeout(() => box.classList.remove('wait'), 250); } }, { threshold: .6 }); io.observe(box); } catch (e) { box.classList.remove('wait'); }
  return box;
}
function hookCard(c) {
  return h('div', { class: 'm-hook' },
    h('p', {}, L('Willst du sehen, ob du’s wirklich kannst? Max baut dir jetzt ein Quiz.', 'Want to see if you really get it? Max builds you a quiz right now.')),
    h('div', { class: 'm-hookr' },
      h('button', { class: 'm-hookb', type: 'button', onclick: () => quiz(c) }, L('Quiz bauen', 'Build the quiz')),
      h('button', { class: 'm-hookl', type: 'button', onclick: () => exercise(c) }, `${c.topic} ${L('üben', 'practice')} · BWL-Trainer →`)));
}

// Beim Scrollen: ein Spruch pro Besuch – der stärkste (Klausurfalle zuerst), nur wenn nichts anderes im Weg ist
function watchScroll(c) {
  if (!('IntersectionObserver' in window) || c.t._mObs) return;
  let n = 0; const seen = new Set();
  const all = (SAY[c.slug] || SAY0).map(([sel, text]) => [c.t.querySelector(sel), text, /\.warn/.test(sel)]).filter(([el]) => el);
  const list = [...all.filter(x => x[2]), ...all.filter(x => !x[2])].slice(0, 1);
  const io = new IntersectionObserver(es => {
    for (const e of es) {
      if (!e.isIntersecting || seen.has(e.target) || n >= 1) continue;
      if (c.busy()) continue;
      const it = list.find(([el]) => el === e.target); if (!it) continue;
      seen.add(e.target); n++; c.say(it[1], 4200);
      if (n >= 1) io.disconnect();
    }
  }, { root: c.scroller || null, threshold: .45 });
  list.forEach(([el]) => io.observe(el));
  c.t._mObs = io;
}

// ---------- Abschnitt am Ende der Seite ----------
function section(c, kind, title) {
  const s = h('section', { class: 'm-live m-live-' + kind });
  const head = h('h2', { class: 'm-lvh' }, title);
  s.append(h('div', { class: 'm-lvk' }, kind === 'quiz' ? L('Live gebaut · nur für dich', 'Built live · just for you') : L('Übung · live gebaut', 'Exercise · built live')), head);
  const next = c.t.querySelector(':scope > .m-next');
  if (next) next.before(s); else c.t.append(s);
  requestAnimationFrame(() => scrollToEl(c, s));
  return { s, head };
}
function scrollToEl(c, el) {
  const sc = c.scroller; if (!sc) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 12;
  sc.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
// Erst kurz fragen, wann die Klausur ist (einmal pro Besuch, überspringbar)
function askWhen(c, s) {
  const known = whenGet(); if (known) return Promise.resolve(known);
  return new Promise(res => {
    const done = v => { whenSet(v); card.remove(); res(v); };
    const card = h('div', { class: 'm-when' }, h('p', {}, L('Kurz vorab: Wann ist deine Klausur?', 'Quick one: when is your exam?')),
      h('div', { class: 'm-whenr' }, WHEN.map(([k, l]) => h('button', { class: 'm-whenb', type: 'button', onclick: () => done(k) }, l))),
      h('button', { class: 'm-whens', type: 'button', onclick: () => done('unk') }, L('Überspringen', 'Skip')));
    s.append(card);
  });
}
function skeleton(s, text) {
  const k = h('div', { class: 'm-skel' }, h('p', { class: 'm-skt' }, h('span', { class: 'ai-bld-pen', 'aria-hidden': 'true' }, '✎'), text), h('div', { class: 'ai-bld-l' }, [88, 64, 76, 52].map((w, i) => h('i', { style: `width:${w}%;animation-delay:${i * .12}s` }))));
  s.append(k); return k;
}
// Blöcke nacheinander „an die Tafel schreiben“
function writeIn(c, s, blocks) {
  blocks.forEach((b, i) => { b.classList.add('m-wr'); b.style.animationDelay = (i * .22) + 's'; s.append(b); });
  mathify(s); queueMath();
}
async function aiCall(prompt) {
  const payload = { messages: [{ role: 'user', content: prompt }], opts: { mode: maxMode(), spice: getSpice(), voice: false, assistant: true, entry: true } };
  const r = await ask('chat', payload);
  return String(r.text || '');
}

// ---------- Speichern-Karte (inline, ehrlich) ----------
function saveCard(c, s, capped) {
  if (s.querySelector('.m-save')) return;
  const isQ = s.classList.contains('m-live-quiz');
  const card = h('div', { class: 'm-save' },
    h('b', {}, capped ? L('Für heute hab ich dir genug Gratis-Runden gebaut.', 'That’s enough free rounds for today.') : (isQ ? L('Dieses Quiz gibt’s nur in diesem Tab – schließt du ihn, ist es weg.', 'This quiz only lives in this tab – close it and it’s gone.') : L('Diese Übung gibt’s nur in diesem Tab – schließt du ihn, ist sie weg.', 'This exercise only lives in this tab – close it and it’s gone.'))),
    h('p', {}, capped ? L('Mit kostenlosem Konto baut dir Max direkt weiter – mehr Quiz und Übungen am Tag.', 'With a free account Max keeps building – more quizzes and exercises per day.') : L('Mit kostenlosem Konto baut dir Max mehr Quiz und Übungen am Tag – und am Laptop meldest du dich einfach an und lernst weiter.', 'With a free account Max builds you more quizzes and exercises per day – and on your laptop you just sign in and keep going.')),
    h('button', { class: 'm-saveb', type: 'button', onclick: async () => { try { const { openAuth } = await import('./account.js'); openAuth({ registerTitle: L('Kostenloses Konto erstellen', 'Create a free account') }); } catch (e) {} } }, L('Kostenloses Konto erstellen', 'Create a free account')),
    h('small', {}, L('Am Laptop oder iPad noch stärker: Tafel und Chat nebeneinander, Skript hochladen, Probeklausur.', 'Even better on a laptop or iPad: board and chat side by side, upload your slides, mock exam.')));
  s.append(card);
}

// ---------- Quiz ----------
export function parseQuiz(text) {
  const src = String(text || '').replace(/```[a-z]*\n?/gi, '');
  const i0 = src.search(/#QUIZ/i); const body = i0 >= 0 ? src.slice(i0 + 5) : src;
  const qs = [];
  for (const chunk of body.split(/\n\s*-{3,}\s*\n|\n(?=\s*F:)/)) {
    const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
    const q = { q: '', opts: [], r: -1, why: '', err: '', tag: '' };
    for (const l of lines) {
      let m;
      if ((m = l.match(/^F(?:rage)?\s*\d*\s*[:.]\s*(.+)/i))) q.q = m[1];
      else if ((m = l.match(/^([A-E])\s*[).:]\s*(.+)/))) q.opts.push([m[1], m[2]]);
      else if ((m = l.match(/^RICHTIG\s*:\s*([A-E])/i))) q.r = m[1].toUpperCase();
      else if ((m = l.match(/^WARUM\s*:\s*(.+)/i))) q.why = m[1];
      else if ((m = l.match(/^FEHLER\s*:\s*(.+)/i))) q.err = m[1];
      else if ((m = l.match(/^THEMA\s*:\s*(.+)/i))) q.tag = m[1];
    }
    const ri = q.opts.findIndex(o => o[0] === q.r);
    if (q.q && q.opts.length >= 2 && ri >= 0) qs.push({ q: q.q, opts: q.opts.map(o => o[1]), r: ri, why: q.why, err: q.err, tag: q.tag });
  }
  return qs.length >= 3 ? qs.slice(0, 5) : null;
}
export async function quiz(c) {
  if (c.t.querySelector('.m-live-quiz.m-busy')) return;
  const when0 = whenGet();
  const { s, head } = section(c, 'quiz', qTitle(c, when0));
  if (!capOk('q')) { s.append(h('p', {}, L('Heute sind deine zwei Gratis-Quiz schon weg.', 'Your two free quizzes for today are used up.'))); saveCard(c, s, true); return; }
  s.classList.add('m-busy');
  const when = when0 || await askWhen(c, s);
  head.textContent = qTitle(c, when);
  const sk = skeleton(s, L('Max baut dein Quiz – live …', 'Max is building your quiz – live …'));
  c.think(THINK_Q);
  const job = watchJob('quiz', s, { back: () => { c.back(); setTimeout(() => scrollToEl(c, s), 450); }, est: 25 });
  capUse('q');
  const prompt = `[Quiz-Auftrag von der Themenseite „${c.topic}“. Antworte AUSSCHLIESSLICH in genau diesem Textformat – keine Tafel, keine Einleitung, kein Markdown, keine Codeblöcke:
#QUIZ
F: Frage
A) Antwort
B) Antwort
C) Antwort
D) Antwort
RICHTIG: B
WARUM: ein kurzer Satz, warum das richtig ist
FEHLER: ein kurzer Satz in Du-Form, was jemand falsch verstanden hat, der hier danebenliegt (z. B. „Du verwechselst Rückstellungen und Rücklagen.“)
THEMA: Teilthema in 2–4 Wörtern
---
Genau 5 Fragen, getrennt durch eine Zeile mit ---. Je 3–4 Antworten, genau eine richtig, die richtige Antwort an wechselnden Stellen. Fachlich 100 % korrekt, eindeutig, deutsches Uni-BWL. ${whenHint(when)} Formeln nur als LaTeX in \\( … \\), Zahlen deutsch (1.000,50 €).
Grundlage ist diese Seite: ${plain(c.b.html)}]`;
  let text = '', err = null;
  try { text = await aiCall(prompt); } catch (e) { err = e; }
  job.stop(!err); c.think(null); sk.remove(); s.classList.remove('m-busy');
  if (err) { s.append(h('p', { class: 'm-err' }, err.message || L('Das hat nicht geklappt.', 'That didn’t work.')), h('button', { class: 'm-retry', type: 'button', onclick: () => { s.remove(); quiz(c); } }, L('Nochmal', 'Try again'))); if (err.code === 'need_account' || err.code === 'limit' || err.code === 'cap') saveCard(c, s, true); return; }
  const qs = parseQuiz(text);
  if (!qs) { fallback(c, s, text); saveCard(c, s); return; }
  let score = 0, done = 0; const wrong = [];
  const result = h('div', { class: 'm-qres', hidden: true });
  const cards = qs.map((q, qi) => {
    const why = h('p', { class: 'm-qwhy', hidden: true });
    const opts = q.opts.map((o, oi) => h('button', { class: 'm-qo', type: 'button', onclick: () => {
      if (card.classList.contains('done')) return;
      card.classList.add('done'); done++;
      const ok = oi === q.r; if (ok) score++; else wrong.push(q);
      opts.forEach((b, j) => { b.disabled = true; b.classList.toggle('ok', j === q.r); b.classList.toggle('no', j === oi && !ok); });
      why.replaceChildren(h('b', {}, ok ? L('Richtig. ', 'Right. ') : L('Leider nein. ', 'Not quite. ')), q.why || ''); why.hidden = false; mathify(why); queueMath();
      if (done === qs.length) finish();
    } }, h('span', { class: 'm-qol' }, String.fromCharCode(65 + oi)), h('span', { class: 'm-qot' }, o)));
    const card = h('div', { class: 'm-q' }, h('div', { class: 'm-qn' }, `${L('Frage', 'Question')} ${qi + 1}/${qs.length}`), h('p', { class: 'm-qq' }, q.q), h('div', { class: 'm-qos' }, opts), why);
    return card;
  });
  writeIn(c, s, [...cards, result]);
  c.say(L('Fertig. Fünf Fragen, keine Gnade. Los.', 'Done. Five questions, no mercy. Go.'), 3500);
  function finish() {
    const n = qs.length, tags = [...new Set(wrong.map(q => q.tag).filter(Boolean))];
    const line = !wrong.length ? L(`${n}/${n} – du bist gefährlich gut. Jetzt die Übung, dann sitzt es wirklich.`, `${n}/${n} – dangerously good.`)
      : (wrong[0].err ? wrong[0].err.replace(/[.!]?$/, '.') + ' ' + L('Klassischer Klausur-Killer.', 'Classic exam killer.') : L(`Bei „${tags[0] || c.topic}“ hakt’s noch – klassischer Klausur-Killer.`, 'Still shaky here – a classic exam killer.'));
    result.replaceChildren(
      h('div', { class: 'm-qsc' }, h('b', {}, `${score}/${n}`), h('span', {}, L(' richtig', ' correct'))),
      h('p', { class: 'm-qdg' }, line),
      h('button', { class: 'm-qx', type: 'button', onclick: () => exercise(c, tags.length ? tags : null) }, wrong.length ? L('Übung genau dazu', 'Exercise on exactly that') : L(`${c.topic} üben`, `Practice ${c.topic}`)));
    result.hidden = false; mathify(result); queueMath();
    result.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    c.say(score === n ? L('Volle Punktzahl. Ich hab nichts anderes erwartet.', 'Full marks. As expected.') : score >= n - 1 ? L('Fast perfekt. Den einen holen wir uns noch.', 'Almost perfect.') : L('Okay, da ist Luft nach oben. Genau dafür gibt’s die Übung.', 'Room to grow – that’s what the exercise is for.'), 4000);
    c.note(`[Quiz auf der Themenseite „${c.topic}“: ${score}/${n} richtig${tags.length ? `, Schwächen: ${tags.join(', ')}` : ''}]`);
    saveCard(c, s);
  }
  saveCard(c, s);
}

// ---------- Übung ----------
const prefType = c => { const t = (c.slug + ' ' + c.topic + ' ' + c.b.title).toLowerCase();
  if (/buchungs|skonto|vorsteuer|umsatzsteuer|rückstellung|t-kont/.test(t)) return 'buchen';
  if (/kapitalwert|deckungsbeitrag|break|zuschlag|abschreibung|annuit|zinsfu|amortis|leverage|elastiz|rentabil|kalkulation|kosten|zins|tilgung/.test(t)) return 'rechnen';
  return 'zuordnen'; };
const deNum = s => {
  let m = String(s || '').replace(/[\s\u00a0€%]/g, '').replace(/−/g, '-').replace(/[^\d,.\-]/g, '');
  if (!m) return NaN;
  if (m.includes(',')) m = m.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(m)) m = m.replace(/\./g, '');
  return parseFloat(m);
};
// Quiz Frage für Frage an der Tafel: Max liest jede Frage vor, erst nach der Auflösung kommt die nächste.
// Normal: du tippst deine Antwort, Max sagt, ob's sitzt, und erklärt. auto (Creator Mode/TikTok): Countdown 3…0,
// dann löst Max selbst auf und fragt am Ende, wie viele du richtig hattest.
export async function fixedQuiz(c, data, { speak = async () => {}, built = false, practice = null } = {}) {
  const qs = (data.questions || []).filter(q => q && q.q && Array.isArray(q.a));
  if (!qs.length) return;
  const auto = !!data.auto;
  let s = built;
  if (!s) {
    c.t.querySelectorAll('.m-live-quiz').forEach(x => x.remove());
    s = section(c, 'quiz', data.title || L('Quiz', 'Quiz')).s;
    s.classList.add('m-busy');
    const sk = skeleton(s, L('Max baut dein Quiz – live …', 'Max is building your quiz – live …'));
    await new Promise(r => setTimeout(r, 1700));
    sk.remove(); s.classList.remove('m-busy');
  }
  let score = 0; const gaps = [];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  for (let qi = 0; qi < qs.length; qi++) {
    const q = qs[qi];
    if (!s.isConnected) return;
    const why = h('p', { class: 'm-qwhy', hidden: true });
    let pick;
    const picked = new Promise(r => { pick = r; });
    const opts = q.a.map((o, oi) => h('button', { class: 'm-qo', type: 'button', disabled: auto, onclick: () => pick(oi) }, h('span', { class: 'm-qol' }, String.fromCharCode(65 + oi)), h('span', { class: 'm-qot' }, o)));
    const cd = auto ? h('span', { class: 'm-qcd', hidden: true }) : null;
    const card = h('div', { class: 'm-q' }, h('div', { class: 'm-qn' }, `${L('Frage', 'Question')} ${qi + 1}/${qs.length}${q.cat ? ' · ' + q.cat : ''}`, cd), h('p', { class: 'm-qq' }, q.q), h('div', { class: 'm-qos' }, opts), why);
    writeIn(c, s, [card]);
    requestAnimationFrame(() => scrollToEl(c, card));
    await speak(q.q);
    let oi = -1;
    if (auto) {   // Countdown erst, wenn Max fertig gelesen hat und alle Antworten stehen
      await wait(500);
      cd.hidden = false;
      for (let n = 3; n >= 0; n--) { cd.textContent = n; cd.classList.remove('tick'); void cd.offsetWidth; cd.classList.add('tick'); await wait(n ? 1000 : 400); }
      cd.hidden = true;
    } else oi = await picked;
    card.classList.add('done');
    const ok = oi === q.right; if (ok) score++; else if (!auto && q.cat) gaps.push(q.cat);
    opts.forEach((b, j) => { b.disabled = true; b.classList.toggle('ok', j === q.right); b.classList.toggle('no', j === oi && !ok); });
    why.replaceChildren(...(auto ? [] : [h('b', {}, ok ? L('Richtig. ', 'Right. ') : L('Leider nein. ', 'Not quite. '))]), ...(q.calc || []).flatMap(x => [h('b', { class: 'm-qcalc' }, x), ' ']), q.say || '');
    why.hidden = false; mathify(why); queueMath();
    why.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    requestAnimationFrame(() => scrollToEl(c, card));
    await wait(auto ? 450 : 150);
    await speak(q.say || '');
    await wait(500);
  }
  if (!s.isConnected) return;
  const n = qs.length;
  const result = auto
    ? h('div', { class: 'm-qres' }, h('p', { class: 'm-qdg' }, data.outro || L('Wie viele hattest du richtig?', 'How many did you get right?')))
    : h('div', { class: 'm-qres' }, h('div', { class: 'm-qsc' }, h('b', {}, `${score}/${n}`), h('span', {}, L(' richtig', ' correct'))), h('p', { class: 'm-qdg' }, data.outro || (score === n ? L('Volle Punktzahl. Ich hab nichts anderes erwartet.', 'Full marks. As expected.') : score >= n - 1 ? L('Fast perfekt. Den einen holen wir uns noch.', 'Almost perfect.') : L('Okay, da ist Luft nach oben. Frag mich einfach, was unklar war.', 'Okay, room to improve. Just ask me what was unclear.'))));
  // Persönliche Lücke → praktisches Beispiel an einem echten Unternehmen (genau ein Angebot, kein Overload)
  if (!auto && practice) {
    const focus = gaps[0] || c.topic || '';
    result.append(h('p', { class: 'm-qdg' }, gaps.length ? L(`Bei „${focus}“ hakt’s noch. Lass uns das an einem echten Unternehmen durchgehen – dann sitzt es.`, `“${focus}” still needs work. Let’s go through it with a real company.`) : L(`Sitzt. Jetzt der Praxistest: ${focus} an einem echten Unternehmen.`, `Nailed it. Now the real-world test: ${focus} at a real company.`)),
      h('button', { class: 'm-qx', type: 'button', onclick: () => practice(focus) }, L('An einem echten Unternehmen üben', 'Practise with a real company')));
  }
  writeIn(c, s, [result]);
  requestAnimationFrame(() => scrollToEl(c, result));
  const end = data.outroSay || (auto ? '' : (score === n ? L('Alle richtig. Stark.', 'All correct. Strong.') : L(`${score} von ${n} richtig.`, `${score} out of ${n} correct.`)));
  if (end) await speak(end);
}
// Für alle: „Quiz mich dazu“ unter der Tafel – Max baut 3 Fragen zur Tafel und fragt dich Frage für Frage ab (mit Stimme)
export async function liveQuiz(c, { speak, practice, onDone } = {}) {
  if (c.t.querySelector('.m-live-quiz.m-busy')) return;
  c.t.querySelectorAll('.m-live-quiz').forEach(x => x.remove());
  const { s } = section(c, 'quiz', L(`Quiz: ${c.topic || 'diese Tafel'}`, `Quiz: ${c.topic || 'this board'}`));
  if (!capOk('q')) { s.append(h('p', {}, L('Heute sind deine Gratis-Quiz schon weg.', 'Your free quizzes for today are used up.'))); saveCard(c, s, true); return; }
  s.classList.add('m-busy');
  const sk = skeleton(s, L('Max baut dein Quiz – live …', 'Max is building your quiz – live …'));
  c.think(THINK_Q);
  capUse('q');
  const prompt = `[Quiz-Auftrag zur aktuellen Tafel „${c.topic}“. Antworte AUSSCHLIESSLICH in genau diesem Textformat – keine Tafel, keine Einleitung, kein Markdown, keine Codeblöcke:
#QUIZ
F: Frage
A) Antwort
B) Antwort
C) Antwort
D) Antwort
RICHTIG: B
WARUM: zwei kurze, gesprochene Sätze, warum das richtig ist – mit der Rechnung in Worten, falls gerechnet wird
THEMA: Teilthema in 2–4 Wörtern
---
Genau 3 Fragen, getrennt durch eine Zeile mit ---, von leicht nach anspruchsvoll. Genau 4 Antworten, genau eine richtig, die richtige an wechselnden Stellen. Fachlich 100 % korrekt, eindeutig, deutsches Uni-BWL, Zahlen deutsch geschrieben (1.000), keine Formeln in LaTeX.
Grundlage ist diese Tafel: ${plain(c.b.html)}]`;
  let text = '', err = null;
  try { text = await aiCall(prompt); } catch (e) { err = e; }
  c.think(null); sk.remove(); s.classList.remove('m-busy');
  const qs = err ? null : parseQuiz(text);
  if (!qs) { s.append(h('p', { class: 'm-err' }, (err && err.message) || L('Das hat nicht geklappt.', 'That didn’t work.')), h('button', { class: 'm-retry', type: 'button', onclick: () => { s.remove(); liveQuiz(c, { speak, practice, onDone }); } }, L('Nochmal', 'Try again'))); return; }
  const questions = qs.slice(0, 3).map(q => ({ q: q.q, a: q.opts, right: q.r, cat: q.tag, say: L(`Richtig ist ${'ABCD'[q.r]}. `, `The answer is ${'ABCD'[q.r]}. `) + (q.why || '') }));
  await fixedQuiz(c, { questions }, { speak, built: s, practice });
  if (onDone) onDone();
}
export { deNum };
export function parseExercise(text) {
  const src = String(text || '').replace(/```[a-z]*\n?/gi, '');
  const i0 = src.search(/#(UEBUNG|ÜBUNG)/i); if (i0 < 0) return null;
  const parts = src.slice(i0).split(/\n\s*-{3,}\s*\n/);
  const ex = { typ: '', titel: '', aufgabe: '', gruppen: [], items: [], konten: [], faelle: [], fragen: [], erkl: '' };
  const take = (l, k) => { const m = l.match(new RegExp('^' + k + '\\s*:\\s*(.+)', 'i')); return m ? m[1].trim() : null; };
  parts.forEach(p => {
    const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
    let fall = null, frage = null, v;
    for (const l of lines) {
      if ((v = take(l, 'TYP')) != null) ex.typ = v.toLowerCase().replace(/[^a-zäöü]/g, '');
      else if ((v = take(l, 'TITEL')) != null) ex.titel = v;
      else if ((v = take(l, 'AUFGABE')) != null) ex.aufgabe = v;
      else if ((v = take(l, 'GRUPPEN')) != null) ex.gruppen = v.split('|').map(x => x.trim()).filter(Boolean);
      else if ((v = take(l, 'ELEMENT')) != null) { const m = v.split(/\s*=>\s*|\s*→\s*/); if (m.length === 2) ex.items.push({ t: m[0].trim(), g: m[1].trim() }); }
      else if ((v = take(l, 'KONTEN')) != null) ex.konten = v.split('|').map(x => x.trim()).filter(Boolean);
      else if ((v = take(l, 'FALL')) != null) { fall = { t: v, s: [], hb: [] }; ex.faelle.push(fall); }
      else if ((v = take(l, 'SOLL')) != null || (v = take(l, 'HABEN')) != null) {
        const isS = /^SOLL/i.test(l), m = v.split(/\s*=\s*/); if (!fall || m.length < 2) continue;
        (isS ? fall.s : fall.hb).push({ k: m[0].trim(), n: deNum(m.slice(1).join('=')) });
      }
      else if ((v = take(l, 'FRAGE')) != null) { frage = { t: v, r: NaN, e: '', steps: [] }; ex.fragen.push(frage); }
      else if ((v = take(l, 'ERGEBNIS')) != null && frage) frage.r = deNum(v);
      else if ((v = take(l, 'EINHEIT')) != null && frage) frage.e = v;
      else if ((v = take(l, 'SCHRITT')) != null && frage) frage.steps.push(v);
      else if ((v = take(l, 'ERKLAERUNG')) != null || (v = take(l, 'ERKLÄRUNG')) != null) ex.erkl = v;
    }
  });
  if (ex.typ.startsWith('zuord')) {
    // Lösung nie im Begriff verraten: Klammern wie „(aktiver RAP)“ oder „(Passiva)“ fliegen raus
    const stems = ex.gruppen.map(g => g.toLowerCase().replace(/[^a-zäöü]/g, '').slice(0, 5)).filter(x => x.length >= 4);
    ex.items.forEach(i => { i.t = i.t.replace(/\s*\(([^)]*)\)/g, (m, inner) => stems.some(st => inner.toLowerCase().replace(/[^a-zäöü]/g, '').includes(st.slice(0, 5)) || inner.toLowerCase().includes(st.slice(0, 4))) ? '' : m).trim(); });
    ex.items = ex.items.filter(i => ex.gruppen.includes(i.g)); return ex.gruppen.length >= 2 && ex.items.length >= 3 ? ex : null; }
  if (ex.typ.startsWith('buch')) { ex.faelle = ex.faelle.filter(f => f.s.length && f.hb.length && [...f.s, ...f.hb].every(x => isFinite(x.n))); ex.faelle.forEach(f => [...f.s, ...f.hb].forEach(x => { if (!ex.konten.includes(x.k)) ex.konten.push(x.k); })); return ex.faelle.length ? ex : null; }
  if (ex.typ.startsWith('rech')) { ex.fragen = ex.fragen.filter(f => isFinite(f.r)); return ex.fragen.length ? ex : null; }
  return null;
}
const money = n => n.toLocaleString('de-DE', { minimumFractionDigits: Math.abs(n % 1) > 1e-9 ? 2 : 0, maximumFractionDigits: 2 });
export async function exercise(c, focus) {
  if (c.t.querySelector('.m-live-ex.m-busy')) return;
  const when0 = whenGet();
  const { s, head } = section(c, 'ex', xTitle(c, when0));
  const trn = h('a', { class: 'm-trlink', href: '#/app/trainer' + (c.trainer ? '/' + c.trainer : '') }, L('Zum kompletten BWL-Trainer →', 'Open the full business trainer →'));
  if (!capOk('x')) { s.append(h('p', {}, L('Heute sind deine zwei Gratis-Übungen schon weg.', 'Your two free exercises for today are used up.')), trn); saveCard(c, s, true); return; }
  s.classList.add('m-busy');
  const when = when0 || await askWhen(c, s);
  head.textContent = xTitle(c, when);
  const sk = skeleton(s, L('Max baut deine Übung – live …', 'Max is building your exercise – live …'));
  c.think(THINK_X);
  const job = watchJob('ex', s, { back: () => { c.back(); setTimeout(() => scrollToEl(c, s), 450); }, est: 30 });
  capUse('x');
  const typ = prefType(c);
  const FMT = {
    zuordnen: `TYP: zuordnen
TITEL: kurzer Titel
AUFGABE: 1–2 Sätze, was zu tun ist
GRUPPEN: Gruppe 1 | Gruppe 2 (2 bis 4 Gruppen, z. B. Aktiva | Passiva)
ELEMENT: Begriff => Gruppe
(6 bis 8 ELEMENT-Zeilen, jede Gruppe kommt vor, Gruppenname exakt wie bei GRUPPEN, keine Hinweise auf die Lösung im Begriff)
ERKLAERUNG: 1–2 Sätze zur Logik`,
    buchen: `TYP: buchen
TITEL: kurzer Titel
AUFGABE: 1 Satz, was zu tun ist
KONTEN: Konto | Konto | … (7 bis 9 Konten, alle richtigen und ein paar falsche, übliche deutsche Kontennamen)
---
FALL: Geschäftsvorfall mit allen Beträgen
SOLL: Kontoname = 1.000,00
HABEN: Kontoname = 1.000,00
(2 oder 3 Fälle, getrennt durch eine Zeile mit ---; je Fall eine oder mehrere SOLL- und HABEN-Zeilen, Summe Soll = Summe Haben, Kontonamen exakt wie bei KONTEN)
ERKLAERUNG: 1–2 Sätze zur Logik`,
    rechnen: `TYP: rechnen
TITEL: kurzer Titel
AUFGABE: Sachverhalt mit allen nötigen Zahlen
---
FRAGE: Teilfrage
ERGEBNIS: 1.234,56 (nur die Zahl)
EINHEIT: € (oder %, Stück …)
SCHRITT: Rechenschritt, Formeln als LaTeX in \\( … \\)
SCHRITT: …
(1 bis 3 Teilfragen, getrennt durch eine Zeile mit ---)`
  }[typ];
  const prompt = `[Übungs-Auftrag von der Themenseite „${c.topic}“. Antworte AUSSCHLIESSLICH in genau diesem Textformat – keine Tafel, keine Einleitung, kein Markdown, keine Codeblöcke:
#UEBUNG
${FMT}
Fachlich 100 % korrekt und eindeutig, deutsches Uni-BWL, nachgerechnet. ${whenHint(when)}${focus ? ` Schwerpunkt genau hierauf (da lag der Nutzer im Quiz daneben): ${focus.join(', ')}.` : ''} Zahlen deutsch (1.000,50).
Grundlage ist diese Seite: ${plain(c.b.html)}]`;
  let text = '', err = null;
  try { text = await aiCall(prompt); } catch (e) { err = e; }
  job.stop(!err); c.think(null); sk.remove(); s.classList.remove('m-busy');
  if (err) { s.append(h('p', { class: 'm-err' }, err.message || L('Das hat nicht geklappt.', 'That didn’t work.')), h('button', { class: 'm-retry', type: 'button', onclick: () => { s.remove(); exercise(c, focus); } }, L('Nochmal', 'Try again')), trn); if (err.code === 'need_account' || err.code === 'limit' || err.code === 'cap') saveCard(c, s, true); return; }
  const ex = parseExercise(text);
  if (!ex) { fallback(c, s, text); s.append(trn); saveCard(c, s); return; }
  const blocks = [];
  if (ex.titel) blocks.push(h('p', { class: 'm-xt' }, ex.titel));
  if (ex.aufgabe) blocks.push(h('p', { class: 'm-xa' }, ex.aufgabe));
  const fb = h('div', { class: 'm-xres', hidden: true });
  const check = h('button', { class: 'm-xcheck', type: 'button' }, L('Prüfen', 'Check'));
  if (ex.typ.startsWith('zuord')) {
    const rows = ex.items.map(it => {
      let pickd = null;
      const bs = ex.gruppen.map(g => h('button', { class: 'm-xg', type: 'button', onclick: () => { if (row.classList.contains('done')) return; pickd = g; bs.forEach(b => b.classList.toggle('on', b.textContent === g)); } }, g));
      const row = h('div', { class: 'm-xi' }, h('span', { class: 'm-xil' }, it.t), h('div', { class: 'm-xgs' + (ex.gruppen.length > 2 ? ' m-x4' : '') }, bs));
      row._chk = () => { row.classList.add('done'); const ok = pickd === it.g; row.classList.add(ok ? 'ok' : 'no'); bs.forEach(b => { b.disabled = true; b.classList.toggle('right', b.textContent === it.g); }); return ok; };
      return row;
    });
    blocks.push(h('div', { class: 'm-xlist' }, rows));
    check.onclick = () => { if (check.disabled) return; check.disabled = true; const n = rows.filter(r => r._chk()).length; result(n, rows.length); };
  } else if (ex.typ.startsWith('buch')) {
    const fs = ex.faelle.map((f, fi) => {
      const sel = () => h('select', { class: 'm-xsel' }, h('option', { value: '' }, L('Konto wählen …', 'Pick an account …')), ex.konten.map(k => h('option', { value: k }, k)));
      const line = side => { const s1 = sel(), a1 = h('input', { class: 'm-xamt', type: 'text', inputmode: 'decimal', placeholder: '0,00 €', 'aria-label': L('Betrag', 'Amount') }); return { el: h('div', { class: 'm-xbl' }, side === 'H' ? h('span', { class: 'm-xan' }, 'an') : null, s1, a1), s1, a1 }; };
      const S = f.s.map(() => line('S')), H = f.hb.map(() => line('H'));
      const sol = h('div', { class: 'm-xsol', hidden: true });
      const card = h('div', { class: 'm-xf' }, h('div', { class: 'm-qn' }, `${L('Fall', 'Case')} ${fi + 1}/${ex.faelle.length}`), h('p', { class: 'm-xft' }, f.t), h('div', { class: 'm-xbk' }, h('small', {}, 'Soll'), ...S.map(x => x.el), h('small', {}, 'Haben'), ...H.map(x => x.el)), sol);
      card._chk = () => {
        const same = (want, got) => { const left = got.map(g => ({ k: g.s1.value, n: deNum(g.a1.value) })); return want.every(w => { const i = left.findIndex(g => g.k === w.k && Math.abs(g.n - w.n) < .011); if (i < 0) return false; left.splice(i, 1); return true; }); };
        const ok = same(f.s, S) && same(f.hb, H);
        card.classList.add('done', ok ? 'ok' : 'no'); [...S, ...H].forEach(x => { x.s1.disabled = x.a1.disabled = true; });
        const html = `<div class="bs">${f.s.map(x => `${x.k} <em>${money(x.n)} €</em>`).join('<br>')}<br>${f.hb.map(x => `<span>an</span> ${x.k} <em>${money(x.n)} €</em>`).join('<br>')}</div>`;
        sol.replaceChildren(h('b', {}, ok ? L('Richtig gebucht. ', 'Booked correctly. ') : L('So wär’s richtig:', 'Correct entry:')), polishBoard(sanitize(html))); sol.hidden = false;
        return ok;
      };
      return card;
    });
    blocks.push(...fs);
    check.onclick = () => { if (check.disabled) return; check.disabled = true; const n = fs.filter(f => f._chk()).length; result(n, fs.length); };
  } else {
    const qs = ex.fragen.map((f, fi) => {
      const inp = h('input', { class: 'm-xnum', type: 'text', inputmode: 'decimal', placeholder: L('Dein Ergebnis', 'Your result'), 'aria-label': L('Ergebnis', 'Result') });
      const steps = h('ol', { class: 'm-xsteps', hidden: true }, f.steps.map(st => h('li', {}, st)));
      const show = h('button', { class: 'm-xshow', type: 'button', hidden: true, onclick: () => { steps.hidden = false; show.hidden = true; mathify(steps); queueMath(); } }, L('Lösungsweg anzeigen', 'Show the solution'));
      const verdict = h('p', { class: 'm-xv', hidden: true });
      const card = h('div', { class: 'm-xf' }, h('div', { class: 'm-qn' }, `${L('Aufgabe', 'Task')} ${fi + 1}/${ex.fragen.length}`), h('p', { class: 'm-xft' }, f.t), h('div', { class: 'm-xin' }, inp, f.e ? h('span', { class: 'm-xu' }, f.e) : null), verdict, show, steps);
      card._chk = () => {
        const v = deNum(inp.value), tol = Math.max(Math.abs(f.r) * .005, Math.abs(f.r) >= 10 ? .5 : .011), ok = isFinite(v) && Math.abs(v - f.r) <= tol;
        card.classList.add('done', ok ? 'ok' : 'no'); inp.disabled = true;
        verdict.replaceChildren(h('b', {}, ok ? L('Stimmt! ', 'Correct! ') : L('Nicht ganz. ', 'Not quite. ')), L('Ergebnis: ', 'Result: ') + money(f.r) + (f.e ? ' ' + f.e : '')); verdict.hidden = false;
        if (f.steps.length) { if (ok) show.hidden = false; else { steps.hidden = false; mathify(steps); queueMath(); } }
        return ok;
      };
      return card;
    });
    blocks.push(...qs);
    check.onclick = () => { if (check.disabled) return; check.disabled = true; const n = qs.filter(q => q._chk()).length; result(n, qs.length); };
  }
  blocks.push(h('div', { class: 'm-xact' }, check), fb, trn);
  writeIn(c, s, blocks);
  c.say(L('Deine Übung steht. Zeig mal, was du drauf hast.', 'Your exercise is ready. Show me what you’ve got.'), 3500);
  function result(n, of) {
    fb.replaceChildren(h('div', { class: 'm-qsc' }, h('b', {}, `${n}/${of}`), h('span', {}, L(' richtig', ' correct'))), ex.erkl ? h('p', { class: 'm-qdg' }, ex.erkl) : null,
      n < of ? h('button', { class: 'm-qx', type: 'button', onclick: () => exercise(c, focus) }, L('Neue Übung', 'New exercise')) : null);
    fb.hidden = false; mathify(fb); queueMath();
    c.say(n === of ? L('Alles richtig. Die Klausur kann kommen.', 'All correct.') : L('Gut, dass wir das jetzt sehen. Nochmal eine Runde?', 'Good that we see it now.'), 4000);
    c.note(`[Übung auf der Themenseite „${c.topic}“: ${n}/${of} richtig]`);
    saveCard(c, s);
  }
  saveCard(c, s);
}
// Antwort im falschen Format: einfach als normale Tafel zeigen
function fallback(c, s, text) {
  const m = String(text).match(/```tafel[^\n]*\n([\s\S]*?)(```|$)/);
  const el = h('div', { class: 'm-fb' });
  if (m) el.append(polishBoard(sanitize(m[1])));
  else el.append(richText(String(text).replace(/```[\s\S]*?```/g, '').trim() || L('Da kam nichts Brauchbares zurück. Versuch’s gleich nochmal.', 'Nothing usable came back. Try again.')));
  writeIn(c, s, [el]);
}
