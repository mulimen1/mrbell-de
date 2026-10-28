// Max konfigurieren: wie er mit dir redet, wie er dir etwas beibringt, worauf er achtet, wie tief er geht – und wann Pause ist.
// Gespeichert in „Mein Bereich“ (synchronisiert). Jede Frage an Max bekommt die Einstellungen als kurze Anweisung mit.
import { h, ico, modal, toast } from './util.js';
import { L, getOutLang, setOutLang } from './i18n.js';
import { face } from './face.js';
import * as M from './me.js';
import { getSpice, setSpice } from './max.js';
import * as Mem from './memory.js';
import { getAccount } from './api.js';

const DEF = { ton: 'locker', methode: 'erklaeren', fokus: ['klausur', 'verstehen'], niveau: 'normal', pause: 25 };
export const getCfg = () => Object.assign({}, DEF, M.getMe().maxcfg || {});
export const pauseMin = () => +getCfg().pause || 0;
export const mode = () => getCfg().methode === 'sokratisch' ? 'sokratisch' : 'erklaeren';

export const TON = {
  locker: [L('Locker & frech', 'Laid-back & cheeky'), L('Humor, kurze Sprüche, trotzdem auf den Punkt', 'Humour, quick jokes, still on point')],
  freundlich: [L('Freundlich & geduldig', 'Kind & patient'), L('Ermutigt dich, kein Druck, Schritt für Schritt', 'Encouraging, no pressure, step by step')],
  sachlich: [L('Sachlich & knapp', 'Factual & brief'), L('Kein Smalltalk, nur der Stoff', 'No small talk, just the material')],
  streng: [L('Streng wie ein Coach', 'Strict like a coach'), L('Fordert dich, keine Ausreden – aber fair', 'Pushes you, no excuses – but fair')]
};
export const METHODE = {
  erklaeren: [L('Direkt erklären', 'Explain directly'), L('Klar erklärt, dann eine Kontrollfrage', 'Clear explanation, then a check question')],
  sokratisch: [L('Sokratisch', 'Socratic'), L('Er fragt, du kommst selbst drauf', 'He asks, you figure it out yourself')],
  beispiel: [L('Erst Beispiel, dann Theorie', 'Example first, then theory'), L('Immer mit einem konkreten Fall starten', 'Always start with a concrete case')],
  pruefer: [L('Wie ein Prüfer', 'Like an examiner'), L('Fragt ab, gibt Punkte, erklärt nur Fehler', 'Quizzes you, gives points, only explains mistakes')]
};
export const FOKUS = {
  klausur: L('Klausurpunkte', 'Exam points'), verstehen: L('Echtes Verständnis', 'Real understanding'), rechnen: L('Rechnen & Formeln', 'Maths & formulas'),
  praxis: L('Praxisbeispiele', 'Real-world examples'), kurz: L('Kurz & knapp', 'Short & sweet')
};
export const NIVEAU = { basis: L('Von null an', 'From scratch'), normal: L('Normal', 'Normal'), profi: L('Profi', 'Pro') };
const PAUSEN = [[25, L('alle 25 Min.', 'every 25 min')], [50, L('alle 50 Min.', 'every 50 min')], [90, L('alle 90 Min.', 'every 90 min')], [0, L('keine', 'none')]];
const SPRUECHE = [[1, L('Seriös', 'Serious')], [2, L('Ein bisschen', 'A little')], [3, L('Voll Sylt', 'Full Sylt')]];

// So klingt Max mit diesen Einstellungen (Vorschau im Dialog)
const SAY_TON = {
  locker: L('Kapitalwert? Easy. Stell dir vor, Papa leiht dir 1.000 € fürs Boot …', 'NPV? Easy. Picture Dad lending you €1,000 for the boat …'),
  freundlich: L('Kein Stress – wir gehen den Kapitalwert ganz in Ruhe zusammen durch.', 'No stress – we’ll go through NPV together, nice and calm.'),
  sachlich: L('Kapitalwert = Summe aller abgezinsten Zahlungen minus Investition.', 'NPV = sum of all discounted cash flows minus the investment.'),
  streng: L('Keine Ausreden heute. Kapitalwert, drei Aufgaben, dann reden wir weiter.', 'No excuses today. NPV, three exercises, then we talk.')
};
const SAY_METH = {
  erklaeren: L('Ich erklär’s dir an der Tafel – danach eine kurze Kontrollfrage.', 'I’ll explain it on the board – then a quick check question.'),
  sokratisch: L('Was glaubst du: Was passiert mit dem Wert, wenn der Zins steigt?', 'What do you think: what happens to the value when the rate goes up?'),
  beispiel: L('Erst ein Fall: Ein Café investiert 20.000 € in eine Siebträger-Maschine …', 'A case first: a café invests €20,000 in an espresso machine …'),
  pruefer: L('Aufgabe 1, 6 Punkte: Berechne den Kapitalwert bei 8 % Zins.', 'Task 1, 6 points: calculate the NPV at 8 %.')
};
export const previewLine = c => SAY_TON[c.ton] + ' ' + SAY_METH[c.methode];

// Kurze Anweisung an Max – hängt an jeder Frage
const TON_P = L({ locker: 'locker und frech, mit Humor und gelegentlich einem kurzen Spruch', freundlich: 'freundlich, geduldig und ermutigend', sachlich: 'sachlich und präzise, ohne Smalltalk', streng: 'streng wie ein Coach – fordernd und direkt, keine Ausreden, aber fair' },
  { locker: 'laid-back and cheeky, with humour and the occasional quick joke', freundlich: 'kind, patient and encouraging', sachlich: 'factual and precise, no small talk', streng: 'strict like a coach – demanding and direct, no excuses, but fair' });
const METH_P = L({ erklaeren: 'erkläre direkt und klar, danach eine kurze Kontrollfrage', sokratisch: 'sokratisch – führe mich mit Leitfragen zur Lösung und verrate sie erst, wenn ich zweimal nicht weiterkomme', beispiel: 'starte immer mit einem konkreten Beispiel, dann die Theorie dahinter', pruefer: 'wie ein Prüfer – frag mich ab, bewerte meine Antworten mit Punkten und erklär nur, was falsch war' },
  { erklaeren: 'explain directly and clearly, then one short check question', sokratisch: 'Socratic – guide me to the answer with questions and only reveal it after I’m stuck twice', beispiel: 'always start with a concrete example, then the theory behind it', pruefer: 'like an examiner – quiz me, score my answers with points and only explain what was wrong' });
const FOK_P = L({ klausur: 'was in der Klausur Punkte bringt (typische Aufgaben und Fallen)', verstehen: 'echtes Verständnis statt Auswendiglernen', rechnen: 'Rechenwege und Formeln Schritt für Schritt', praxis: 'Praxisbeispiele aus echten Unternehmen', kurz: 'kurze, knappe Antworten' },
  { klausur: 'what earns points in the exam (typical tasks and traps)', verstehen: 'real understanding instead of memorising', rechnen: 'calculations and formulas step by step', praxis: 'real-world company examples', kurz: 'short, crisp answers' });
const NIV_P = L({ basis: 'von null an – jeden Fachbegriff kurz erklären', normal: 'Grundlagen aus der Vorlesung voraussetzen', profi: 'Profi-Niveau – keine Basics, direkt in die Tiefe' },
  { basis: 'from scratch – briefly explain every technical term', normal: 'assume the lecture basics', profi: 'pro level – skip the basics, go deep' });
export function prompt() {
  const c = getCfg();
  const f = (c.fokus || []).filter(k => FOK_P[k]).map(k => FOK_P[k]).join(', ');
  return L(`[Wie ich unterrichtet werden will – halte dich daran: Ton ${TON_P[c.ton] || TON_P.locker}; Methode: ${METH_P[c.methode] || METH_P.erklaeren}${f ? '; Fokus: ' + f : ''}; Niveau: ${NIV_P[c.niveau] || NIV_P.normal}]`,
    `[How I want to be taught – stick to it: tone ${TON_P[c.ton] || TON_P.locker}; method: ${METH_P[c.methode] || METH_P.erklaeren}${f ? '; focus: ' + f : ''}; level: ${NIV_P[c.niveau] || NIV_P.normal}]`);
}

// ---------- Dialog ----------
export async function openMaxCfg() {
  const c = getCfg(); c.fokus = [...(c.fokus || [])];
  let spice = getSpice(), outL = getOutLang(), mem = Mem.memOn() ? 1 : 0;
  const memOut = h('p', { class: 'mc-memt', hidden: true });
  const memBtn = h('button', { type: 'button', class: 'mc-memb', onclick: async () => { memBtn.disabled = true; const t = await Mem.memText(); memOut.textContent = t || L('Noch nichts – Max merkt sich etwas, sobald ihr ein Gespräch geführt habt.', 'Nothing yet – Max remembers something once you’ve had a conversation.'); memOut.hidden = false; memBtn.hidden = true; } }, L('Ansehen, was Max sich gemerkt hat', 'See what Max remembers'));
  const fEl = h('div', { class: 'mc-face' });
  const say = h('p', { class: 'mc-say' });
  const paint = () => { say.textContent = previewLine(c); };
  const cards = (map, key) => {
    const w = h('div', { class: 'mc-cards' });
    const draw = () => w.querySelectorAll('button').forEach(b => { const on = b.dataset.v === c[key]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    Object.entries(map).forEach(([k, [t, s]]) => w.append(h('button', { type: 'button', class: 'mc-card', 'data-v': k, onclick: () => { c[key] = k; draw(); paint(); fc.pulse(k === 'streng' || k === 'pruefer' ? 'smug' : 'happy', 900); } }, h('b', {}, t), h('small', {}, s))));
    draw(); return w;
  };
  const seg = (opts, get, set) => {
    const w = h('div', { class: 'ik-seg mc-seg' });
    const draw = () => w.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(get()) === b.dataset.v));
    opts.forEach(([v, t]) => w.append(h('button', { type: 'button', 'data-v': String(v), onclick: () => { set(v); draw(); } }, t)));
    draw(); return w;
  };
  const chips = h('div', { class: 'mc-chips' }, Object.entries(FOKUS).map(([k, t]) => {
    const b = h('button', { type: 'button', class: 'chip' + (c.fokus.includes(k) ? ' on' : ''), onclick: () => {
      if (c.fokus.includes(k)) c.fokus = c.fokus.filter(x => x !== k);
      else { if (c.fokus.length >= 3) { toast(L('Höchstens 3 – sonst ist alles Fokus.', 'At most 3 – otherwise everything is focus.')); return; } c.fokus.push(k); }
      b.classList.toggle('on', c.fokus.includes(k));
    } }, t);
    return b;
  }));
  const lab = (t, sub) => h('div', { class: 'mc-lab' }, h('b', {}, t), sub ? h('small', {}, sub) : null);
  const body = h('div', { class: 'mc' },
    h('div', { class: 'mc-prev' }, fEl, h('div', {}, h('div', { class: 'eyebrow' }, L('So klingt dein Max', 'This is how your Max sounds')), say)),
    lab(L('Wie redet er mit dir?', 'How does he talk to you?')), cards(TON, 'ton'),
    lab(L('Wie bringt er dir was bei?', 'How does he teach you?')), cards(METHODE, 'methode'),
    lab(L('Worauf achtet er?', 'What does he focus on?'), L('bis zu 3', 'up to 3')), chips,
    h('div', { class: 'mc-two' },
      h('div', {}, lab(L('Wie tief?', 'How deep?')), seg(Object.entries(NIVEAU), () => c.niveau, v => { c.niveau = v; })),
      h('div', {}, lab(L('Sprüche', 'Jokes')), seg(SPRUECHE, () => spice, v => { spice = v; fc.pulse(v === 3 ? 'smug' : 'happy', 900); }))),
    h('div', {}, lab(L('Sprache', 'Language'), L('In welcher Sprache Max antwortet und Inhalte erstellt', 'Which language Max answers and creates content in')), seg([['de', 'Deutsch'], ['en', 'English']], () => outL, v => { outL = v; })),
    h('div', {}, lab(L('Pausen', 'Breaks'), L('Max sagt dir, wann du kurz rausgehst', 'Max tells you when to step away')), seg(PAUSEN, () => c.pause, v => { c.pause = v; })),
    getAccount() ? h('div', {}, lab(L('Gedächtnis', 'Memory'), L('Max merkt sich, woran ihr gearbeitet habt und wo es hakt – nur für dich, auf all deinen Geräten. Aus = Notiz wird gelöscht.', 'Max remembers what you worked on and where you got stuck – only for you, on all your devices. Off = note is deleted.')), seg([[1, L('An', 'On')], [0, L('Aus', 'Off')]], () => mem, v => { mem = v; }), memBtn, memOut) : null);
  const fc = face(fEl, {}); paint();
  const r = await modal({ cls: 'mc-modal', eyebrow: L('Max konfigurieren', 'Configure Max'), title: L('Wie soll Max ticken?', 'How should your tutor tick?'), body,
    actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Speichern', 'Save'), value: 'ok', primary: true }] });
  if (r !== 'ok') return false;
  M.updateMe(m => { m.maxcfg = { ton: c.ton, methode: c.methode, fokus: c.fokus, niveau: c.niveau, pause: c.pause }; });
  setSpice(spice);
  if (outL !== getOutLang()) setOutLang(outL);
  if ((mem === 1) !== Mem.memOn()) Mem.setMemOn(mem === 1);
  toast(({ locker: L('Läuft. So mag ich das.', 'Done. That’s how I like it.'), freundlich: L('Alles klar – wir machen das ganz entspannt.', 'Got it – we’ll keep it relaxed.'), sachlich: L('Gespeichert.', 'Saved.'), streng: L('Gut. Ab jetzt wird gearbeitet.', 'Good. Now we work.') })[c.ton] || L('Gespeichert.', 'Saved.'));
  dispatchEvent(new CustomEvent('maxcfg:change'));
  return true;
}
