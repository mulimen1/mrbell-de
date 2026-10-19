// App-Rahmen: Seitenleiste mit Skripten, Tabs, Upload, Kontingent
import { $, $$, h, ico, toast, modal, ago, ls } from './util.js';
import { face } from './face.js';
import { S, refreshList, openDoc, createDoc, removeDoc, lastDocId, save, onChange, SAMPLE, mastery } from './state.js';
import { ACCEPT } from './ingest.js';
import { onQuota, currentQuota, ask, getAccount, onAccount } from './api.js';
import { accountChip, refreshAccount, openLogin, openAccount, openAuth } from './account.js';
import { getOutLang, setOutLang, L, LOCALE, lang, setLang } from './i18n.js';
import { lines as maxLines, getSpice } from './max.js';
import { apiError, thought, isPhone, overlayBusy, LAPTOP_LINE } from './ui.js';
import { exportAll, importAll, wipe } from './db.js';
import { applyThemeButtons } from './theme.js';
import { feedbackButton, openFeedback } from './feedback.js';
import { fly } from './flight.js';

const TABS = [
  ['hub', L('Übersicht', 'Overview'), 'home'],
  ['plan', L('Klausurplan', 'Exam plan'), 'calendar'],
  ['tutor', 'Max', 'chat'],
  ['pfad', L('Lernpfad', 'Study path'), 'path'],
  ['quiz', 'Quiz', 'quiz'],
  ['karten', L('Karten', 'Flashcards'), 'cards'],
  ['podcast', 'Podcast', 'pod'],
  ['zettel', L('Lernzettel', 'Study sheet'), 'brain'],
];
const VIEWS = {
  hub: () => import('./views/hub.js'),
  plan: () => import('./views/plan.js'),
  tutor: () => import('./views/tutor.js'),
  pfad: () => import('./views/path.js'),
  quiz: () => import('./views/quizview.js'),
  karten: () => import('./views/cards.js'),
  podcast: () => import('./views/podcast.js'),
  zettel: () => import('./views/summary.js'),
};

let shell = null;
let current = { key: '', cleanup: null };
let asstMod = null;   // schwebender Max (für den Kopf-Flug zwischen Tutor-Raum und unten rechts)

// Alles, was „mit Max reden“ heißt, läuft über den schwebenden Max (wenn er nicht ausgeblendet ist)
export async function viaMax(fn) {
  try {
    const m = await import('./assistant.js');
    if (!m.isAssistantEnabled()) return false;
    const a = m.mountAssistant(); if (!a || !a.ask) return false;
    document.querySelector('#app .app.sideopen')?.classList.remove('sideopen');
    fn(a); return true;
  } catch (e) { console.warn(e); return false; }
}
export const talkToMax = async () => { if (!(await viaMax(a => a.talk()))) { const { openVoice } = await import('./voice.js'); openVoice({}); } };
export function go(path) { location.hash = '#/app' + (path ? '/' + path : ''); }

function buildShell() {
  const root = $('#app');
  const fileIn = h('input', { type: 'file', class: 'sr', accept: ACCEPT, id: 'fileApp', multiple: true });
  fileIn.addEventListener('change', () => { if (fileIn.files.length) startUpload([...fileIn.files]); fileIn.value = ''; });
  // Screenshot einfügen (⌘V / Strg+V) – landet direkt in der Einordnung
  document.addEventListener('paste', e => {
    if (!location.hash.startsWith('#/app') || current.key === 'ingest') return;
    const a = document.activeElement; if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return;
    const fs = [...(e.clipboardData?.files || [])].filter(f => /^image\/|pdf/.test(f.type));
    if (!fs.length) return;
    e.preventDefault(); startUpload(fs.map((f, i) => f.name && f.name !== 'image.png' ? f : new File([f], `Screenshot ${new Date().toLocaleDateString(LOCALE)}${fs.length > 1 ? ' ' + (i + 1) : ''}.png`, { type: f.type })));
  });
  const quotaEl = h('div', { class: 'quota', hidden: true });
  const faceEl = h('span', { class: 'mini', style: { width: '28px', height: '28px' } });
  const isMob = () => matchMedia('(max-width: 760px)').matches;
  const tool = (tag, attrs, ic, label, extra) => h(tag, Object.assign({ class: 'doc-item' }, tag === 'button' ? { type: 'button' } : {}, attrs), h('span', { html: ico(ic) }), h('span', { class: 'nm' }, label), extra || null);
  // Links: nur noch Neuer Stoff + Werkzeuge (offen, nicht versteckt)
  const side = h('aside', { class: 'side' },
    h('div', { class: 'top' },
      h('a', { class: 'brand', href: '#/' }, faceEl, 'BWL Max', h('small', {}, 'Beta')),
      h('span', { style: { flex: 1 } }),
      // Sprache + Hell/Dunkel stehen oben neben der Suche; am Handy hier
      h('span', { class: 'side-mobset' }, langSwitch(), h('button', { class: 'iconbtn', 'data-theme-toggle': '', 'aria-label': L('Hell/Dunkel', 'Light/Dark') })),
      h('button', { class: 'iconbtn side-col', type: 'button', 'aria-label': L('Seitenleiste einklappen', 'Collapse sidebar'), title: L('Einklappen (Strg/⌘ + \\)', 'Collapse (Ctrl/⌘ + \\)'), html: ico('sidebar'), onclick: () => setSide(false) })),
    h('div', { class: 'scroll' },
      h('label', { class: 'btn primary side-new', for: 'fileApp' }, h('span', { html: ico('plus') }), L('Neuer Stoff', 'Add material')), fileIn,
      h('div', { class: 'grp' }, 'Tools'),
      h('div', { class: 'side-tools' },
        tool('button', { onclick: () => talkToMax() }, 'mic', L('Sprich mit mir', 'Talk to me')),
        tool('button', { onclick: () => topicPrompt() }, 'bulb', L('Ich erklär dir ein Thema', 'I’ll explain a topic')),
        tool('button', { onclick: () => examTool(), 'data-nav': 'exam' }, 'exam', L('Klausur-Simulator', 'Exam simulator')),
        tool('a', { href: '#/app/trainer', 'data-nav': 'trainer' }, 'whistle', L('BWL-Trainer', 'Business trainer')),
        tool('a', { href: '#/app/trainer/buchung', 'data-nav': 'foto', onclick: () => setTimeout(() => toast(L('Löse die Aufgabe auf Papier und tipp unten auf „Foto deiner Lösung“ – ich trag sie ein und du prüfst.', 'Solve it on paper and tap “Photo of your solution” below – I’ll fill it in and you check.'), 5200), 400) }, 'camera', L('Fotocheck Buchungssätze', 'Photo check: entries')),
        tool('a', { href: '#/app/rechner', 'data-nav': 'rechner' }, 'calc', L('Rechner', 'Calculators')),
        tool('a', { href: '#/app/challenge', 'data-nav': 'challenge' }, 'trophy', L('Wochen-Challenge', 'Weekly challenge'), h('span', { class: 'lockb', 'data-lockb': '', html: ico('lock') })),
        tool('a', { href: '#/app/duell', 'data-nav': 'duell' }, 'spark', L('BWL-Duell', 'Business duel'), h('span', { class: 'newb' }, L('Neu', 'New'))))),
    // Unten: klein und ruhig – Sprache, Konto, Menü; Kündigen bleibt sichtbar (§ 312k BGB)
    h('div', { class: 'bottom' }, quotaEl,
      h('button', { class: 'side-fb', type: 'button', onclick: () => openFeedback() }, h('span', { class: 'side-fb-i', html: ico('chat') }), h('span', {}, h('b', {}, L('Feedback geben', 'Give feedback')), h('small', {}, L('Was fehlt? Was nervt? Wir lesen alles.', 'Missing something? Annoyed? We read it all.')))),
      outLangSwitch(),
      h('div', { class: 'side-acc' }, accountChip(), sideMenuBtn()),
      h('div', { class: 'side-fine' }, h('button', { type: 'button', onclick: e => openSideMenu(e.currentTarget, 'recht') }, L('Rechtliches', 'Legal')), h('span', {}, '·'), h('a', { href: legalHref('kuendigen') }, L('Verträge kündigen', 'Cancel contracts')))));
  // Oben: die festen Bereiche – immer da, auch mit eingeklappter Seitenleiste
  const navA = (key, href, ic, label) => h('a', { class: 'tn', href, 'data-tn': key }, h('span', { html: ico(ic) }), h('span', { class: 'tn-l' }, label));
  const tnFace = h('span', { class: 'tn-face' });
  const topnav = h('nav', { class: 'topnav', 'aria-label': L('Bereiche', 'Sections') },
    h('a', { class: 'tn tn-tutor', href: '#/app/tutor', 'data-tn': 'tutor' }, tnFace, h('span', { class: 'tn-l' }, 'Tutor')), h('span', { class: 'tn-sep', 'aria-hidden': 'true' }),
    navA('lernen', '#/app/lernen', 'spark', L('Lernen', 'Learn')),
    navA('faecher', '#/app/faecher', 'brain', L('Fächer', 'Subjects')),
    navA('bibliothek', '#/app/bibliothek', 'library', L('Bibliothek', 'Library')),
    navA('fortschritt', '#/app/fortschritt', 'trophy', L('Fortschritt', 'Progress')),
    Object.assign(navA('zahlen', '#/app/zahlen', 'chart', L('Zahlen', 'Numbers')), { hidden: true }));
  const title = h('button', { class: 'db-title', type: 'button', onclick: e => openDocSwitch(e.currentTarget) });
  const tabs = h('nav', { class: 'tabs', role: 'tablist' });
  const backEl = h('a', { class: 'db-back', href: '#/app/lernen', hidden: true, title: L('Zurück zu Lernen', 'Back to Learn') }, h('span', { html: ico('left') }), h('span', {}, L('Lernen', 'Learn')));
  const docbar = h('div', { class: 'docbar', hidden: true }, backEl, title, tabs);
  const sideBtn = h('button', { class: 'iconbtn side-tog', type: 'button', 'aria-label': L('Seitenleiste', 'Sidebar'), title: L('Tools ein-/ausblenden (Strg/⌘ + \\)', 'Show/hide tools (Ctrl/⌘ + \\)'), html: ico('sidebar'), onclick: () => { if (isMob()) app.classList.toggle('sideopen'); else setSide(app.classList.contains('side-closed')); } });
  const view = h('main', { class: 'view', id: 'view' });
  const palBtn = h('button', { class: 'pal-btn', type: 'button', 'aria-label': L('Suchen', 'Search'), title: L('Suchen und Befehle (⌘K)', 'Search and commands (⌘K)'), onclick: () => import('./palette.js').then(m => m.openPalette()) }, h('span', { html: ico('search') }), h('span', { class: 'pal-btx' }, L('Suchen', 'Search')), h('kbd', {}, /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Strg K'));
  // Feedback ist immer einen Klick entfernt (oben rechts, in der Seitenleiste und im Menü)
  const fbTop = h('button', { class: 'fb-top', type: 'button', title: L('Was fehlt, was nervt, deine Idee – wir lesen alles', 'What’s missing, what’s annoying, your idea – we read everything'), 'aria-label': 'Feedback', onclick: () => openFeedback() }, h('span', { html: ico('chat') }));
  const topset = h('div', { class: 'topset' }, fbTop, langSwitch(), h('button', { class: 'iconbtn', 'data-theme-toggle': '', 'aria-label': L('Hell/Dunkel', 'Light/Dark') }));
  // Handy: statt Leiste unten kleine Knöpfe rechts oben – Tools, (Suche = palBtn), Konto
  const accBtn = h('button', { class: 'm-act m-acc', type: 'button', 'aria-label': L('Konto', 'Account'), html: ico('lock'), onclick: () => getAccount() ? openAccount() : openAuth() });
  const mActs = h('div', { class: 'm-acts' }, h('button', { class: 'm-act m-tools', type: 'button', 'aria-label': 'Tools', html: ico('sidebar'), onclick: () => app.classList.toggle('sideopen') }), accBtn);
  const main = h('div', { class: 'main' }, h('div', { class: 'topbar' }, sideBtn, topnav, palBtn, mActs, topset), docbar, view);
  const bbar = bottomBar(() => app);
  const app = h('div', { class: 'app' + (ls.get('tutor.sideClosed', false) ? ' side-closed' : '') }, side, main, bbar);
  function setSide(open) { app.classList.toggle('side-closed', !open); ls.set('tutor.sideClosed', !open); sideBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === '\\' && location.hash.startsWith('#/app')) { e.preventDefault(); if (isMob()) app.classList.toggle('sideopen'); else setSide(app.classList.contains('side-closed')); } });
  app.addEventListener('click', e => { if (app.classList.contains('sideopen') && !e.target.closest('.side') && !e.target.closest('.side-tog') && !e.target.closest('.bb-side') && !e.target.closest('.m-tools')) app.classList.remove('sideopen'); });
  root.replaceChildren(app);
  face(faceEl, {}); face(tnFace, { follow: false });
  shell = { root, app, side, title, tabs, docbar, topnav, view, quotaEl, backEl };
  onQuota(renderQuota);
  onAccount(a => { accBtn.classList.toggle('in', !!a); accBtn.setAttribute('aria-label', a ? L('Dein Konto', 'Your account') : L('Anmelden oder Konto erstellen', 'Sign in or create account')); renderQuota(currentQuota()); import('./views/zahlen.js').then(m => { const z = topnav.querySelector('[data-tn="zahlen"]'); if (z) z.hidden = !m.isAdmin(a); }); });
  refreshAccount();
  phoneShell(topnav, app);
  mobileTip();
  onChange(renderList);
  applyThemeButtons();
  // Schwebender Max-Assistent (überall in der App)
  import('./assistant.js').then(m => { asstMod = m; m.mountAssistant && m.mountAssistant(); }).catch(e => console.warn(e));
}

// Klausur-Simulator aus den Werkzeugen: welches Skript?
export async function examTool() {
  const own = S.list.filter(d => !d.sample);
  const docs = own.length ? own : S.list;
  if (docs.length === 1) { location.hash = `#/app/${docs[0].id}/quiz/exam`; return; }
  if (!docs.length) {
    await modal({ eyebrow: L('Klausur-Simulator', 'Exam simulator'), title: L('Erst den Stoff, dann die Klausur', 'Material first, then the exam'), text: L('Lad dein Skript hoch – oder lass mich ein Kurzskript zu deinem Thema schreiben. Daraus baue ich dir eine Probeklausur mit Zeit, Punkten und Notenschlüssel.', 'Upload your slides – or let me write a short script on your topic. I’ll turn it into a mock exam with time, points and a grading key.'),
      body: h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, h('label', { class: 'btn primary', for: 'fileApp', onclick: () => document.querySelector('.modal-bg')?.remove() }, h('span', { html: ico('upload') }), L('Stoff hochladen', 'Upload material')), h('button', { class: 'btn', type: 'button', onclick: () => { document.querySelector('.modal-bg')?.remove(); ls.set('tutor.target', 'quiz'); topicPrompt(); } }, L('Thema nennen', 'Name a topic'))), actions: [] });
    return;
  }
  const sorted = docs.slice().sort((a, b) => (b.used || 0) - (a.used || 0));
  await modal({ eyebrow: L('Klausur-Simulator', 'Exam simulator'), title: L('Für welches Skript?', 'Which slides?'), body: h('div', { class: 'ds-list' }, sorted.slice(0, 12).map(d => h('a', { class: 'ds-i', href: `#/app/${d.id}/quiz/exam`, onclick: () => document.querySelector('.modal-bg')?.remove() }, h('span', { html: ico('file') }), h('span', { class: 'nm' }, d.name), h('small', {}, d.pages.length + L(' S.', ' p.'))))), actions: [] });
}
// Skript wechseln: Klick auf den Namen in der Skript-Leiste
function openDocSwitch(anchor) {
  document.querySelector('.sidemenu')?.remove();
  const docs = S.list.slice().sort((a, b) => (b.used || 0) - (a.used || 0));
  const menu = h('div', { class: 'sidemenu ds-menu', role: 'menu' },
    h('div', { class: 'sm-h' }, L('Skript wechseln', 'Switch slides')),
    docs.slice(0, 10).map(d => h('a', { class: 'sm-it' + (S.doc && S.doc.id === d.id ? ' on' : ''), href: `#/app/${d.id}/hub` }, h('span', { html: ico('file') }), h('span', { class: 'nm' }, d.name))),
    h('div', { class: 'sm-sep' }),
    h('a', { class: 'sm-it', href: '#/app/bibliothek' }, h('span', { html: ico('right') }), L('Bibliothek öffnen', 'Open library')),
    h('label', { class: 'sm-it', for: 'fileApp' }, h('span', { html: ico('plus') }), L('Neuer Stoff', 'Add material')));
  document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect();
  menu.style.left = Math.max(8, Math.min(innerWidth - menu.offsetWidth - 8, r.left)) + 'px';
  menu.style.top = (r.bottom + 6) + 'px';
  const close = () => { menu.classList.add('out'); setTimeout(() => menu.remove(), 150); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc); };
  const outside = e => { if (!menu.contains(e.target) && !anchor.contains(e.target)) close(); };
  const esc = e => { if (e.key === 'Escape') close(); };
  setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc); }, 0);
  menu.querySelectorAll('a, label').forEach(a => a.addEventListener('click', () => close()));
}

// Kein Dauer-Zähler „KI heute x / 40“ – das wirkt billig. Knapp: leiser Hinweis am Eingabefeld.
// Aufgebraucht: unten links eine schwarze Inner-Circle-Karte – nur dann.
function renderQuota() {
  if (!shell?.quotaEl) return;
  const q = currentQuota(), acc = getAccount();
  const left = q && q.limit ? Math.max(0, q.limit - (q.used || 0)) : null;
  const show = left === 0 && !(acc && acc.pro);
  const el = shell.quotaEl;
  el.hidden = !show;
  if (!show) { el.replaceChildren(); return; }
  el.className = 'quota qx';
  el.replaceChildren(
    h('div', { class: 'qx-top' }, h('b', { class: 'ic-lt' }, 'Max’s Inner Circle'), h('span', { class: 'qx-dot', 'aria-hidden': 'true' })),
    h('div', { class: 'qx-h' }, L('Für heute aufgebraucht', 'Used up for today')),
    h('div', { class: 'qx-s' }, L('Neue Antworten ab 0:00 Uhr. Hochladen und speichern geht immer.', 'New answers from midnight. Uploading and saving always works.')),
    h('button', { class: 'qx-go', type: 'button', onclick: () => (acc ? import('./ic.js').then(m => m.innerCircle({ reason: L('Für heute sind deine Antworten aufgebraucht.', 'You’ve used up today’s answers.') })) : openAuth({ title: L('Mehr mit kostenlosem Konto', 'More with a free account'), registerTitle: L('Mehr mit kostenlosem Konto', 'More with a free account') })) },
      h('span', {}, acc ? L('Ohne Limit weiterlernen', 'Keep learning without limits') : L('Kostenloses Konto holen', 'Get a free account')), h('span', { class: 'qx-ar', html: ico('right') })),
    acc ? null : h('div', { class: 'm-laptop' }, LAPTOP_LINE()));
}

// Woher kam man? „Lernen“ oder „Bibliothek“ – dann gibt’s oben einen Weg zurück
const LERN_TOOLS = ['karten', 'quiz', 'zettel', 'podcast', 'pfad', 'plan', 'exam'];
export function lernLast() {
  try { const h = sessionStorage.getItem('tutor.lernLast'); if (!h || h === '#/app/lernen') return null; const id = h.split('/')[2]; return S.list.some(d => d.id === id) ? h : null; } catch (e) { return null; }
}
const BACK = { lernen: ['#/app/lernen', L('Lernen', 'Learn')], bibliothek: ['#/app/bibliothek', L('Bibliothek', 'Library')] };
function backTarget() { try { const k = sessionStorage.getItem('tutor.backTo'); return BACK[k] ? { key: k, href: k === 'bibliothek' ? '#/app/bibliothek/' + (ls.get('tutor.bib.tab', 'alles') || 'alles') : BACK[k][0], label: BACK[k][1] } : null; } catch (e) { return null; } }
function backToLearn() { return backTarget()?.key === 'lernen'; }
function renderList() {
  if (!shell) return;
  const hs = location.hash;
  const inDoc = !!(S.doc && hs.includes(S.doc.id));
  const tn = { tutor: hs.startsWith('#/app/tutor'), lernen: hs.startsWith('#/app/lernen') || backToLearn(), faecher: hs.startsWith('#/app/faecher') || hs.startsWith('#/app/stundenplan'), bibliothek: hs.startsWith('#/app/bibliothek') || (inDoc && !backToLearn()), gemerkt: hs.startsWith('#/app/gemerkt'), fortschritt: hs.startsWith('#/app/fortschritt'), zahlen: hs.startsWith('#/app/zahlen') };
  $$('[data-tn]', shell.topnav).forEach(a => { const on = !!tn[a.dataset.tn]; a.classList.toggle('on', on); a.setAttribute('aria-current', on ? 'page' : 'false'); });
  requestAnimationFrame(navIntoView);
  $$('[data-nav="trainer"]', shell.side).forEach(a => a.classList.toggle('on', hs.startsWith('#/app/trainer') && !hs.startsWith('#/app/trainer/buchung')));
  $$('[data-nav="foto"]', shell.side).forEach(a => a.classList.toggle('on', hs.startsWith('#/app/trainer/buchung')));
  $$('[data-nav="challenge"]', shell.side).forEach(a => a.classList.toggle('on', hs.includes('/challenge')));
  $$('[data-nav="duell"]', shell.side).forEach(a => a.classList.toggle('on', hs.startsWith('#/app/duell')));
  $$('[data-nav="rechner"]', shell.side).forEach(a => a.classList.toggle('on', hs.startsWith('#/app/rechner')));
  $$('[data-nav="exam"]', shell.side).forEach(a => a.classList.toggle('on', inDoc && hs.includes('/quiz')));
  $$('[data-lockb]', shell.side).forEach(x => { x.hidden = !!getAccount(); });
}
// Skript-Leiste (Name + Reiter) nur im Skript
function docbar(on) { shell.docbar.hidden = !on; shell.app.classList.toggle('in-doc', !!on); }

function renderTabs(docId, tab) {
  shell.tabs.replaceChildren(...TABS.map(([k, label, ic]) =>
    h('a', { class: 'tab' + (k === tab ? ' on' : ''), href: `#/app/${docId}/${k}`, role: 'tab', 'aria-selected': k === tab ? 'true' : 'false' }, h('span', { html: ico(ic), style: { display: 'contents' } }), h('span', {}, label))));
  // aktiven Reiter nur dann ins Bild holen, wenn er nicht schon ganz sichtbar ist
  requestAnimationFrame(() => {
    const t = shell.tabs, on = t.querySelector('.on');
    if (!on || t.scrollWidth <= t.clientWidth + 2) { t.scrollLeft = 0; return; }
    const l = on.offsetLeft - t.offsetLeft, r = l + on.offsetWidth;
    if (l < t.scrollLeft || r > t.scrollLeft + t.clientWidth) t.scrollLeft = Math.max(0, l - (t.clientWidth - on.offsetWidth) / 2);
  });
  shell.tabs.classList.remove('hidden');
}

export async function mountApp(parts) {
  if (!shell) { buildShell(); await refreshList(); }
  shell.app.classList.remove('sideopen');
  let [a, b, c] = parts;
  // Alte Adressen (Mein Bereich mit Unterseiten) auf die neuen Bereiche umleiten
  const OLD = { faecher: 'faecher', stats: 'fortschritt', favs: 'bibliothek/gemerkt', plan: 'stundenplan' };
  // Gemerkt wohnt jetzt in der Bibliothek
  if (a === 'gemerkt') { location.replace('#/app/bibliothek/gemerkt'); return; }
  if (a === 'me' && b && OLD[b]) { location.replace('#/app/' + OLD[b]); return; }
  // Aus „Lernen“ gekommen? Dann gibt’s oben „← Lernen“ – bis man woanders hin wechselt
  if (!a || ['tutor', 'faecher', 'skripte', 'bibliothek', 'gemerkt', 'fortschritt', 'me', 'stundenplan', 'lernen', 'zahlen'].includes(a)) { try { sessionStorage.removeItem('tutor.backTo'); } catch (e) {} }
  const back = backTarget(), fromLearn = !!back;
  // Wo man in „Lernen“ zuletzt war (Übersicht oder ein Werkzeug wie Karteikarten) – „Lernen“ oben bringt einen genau dorthin zurück
  try { if (a === 'lernen') sessionStorage.setItem('tutor.lernLast', '#/app/lernen'); else if (a && LERN_TOOLS.includes(b) && S.list.some(d => d.id === a)) sessionStorage.setItem('tutor.lernLast', `#/app/${a}/${b}`); } catch (e) {}
  shell.backEl.hidden = !back;
  if (back) { shell.backEl.href = back.href; shell.backEl.title = L('Zurück zu ', 'Back to ') + back.label; shell.backEl.lastChild.textContent = back.label; }
  const backLink = () => h('a', { class: 'view-back', href: back ? back.href : '#/app/lernen' }, h('span', { html: ico('left') }), L('Zurück zu ', 'Back to ') + (back ? back.label : L('Lernen', 'Learn')));
  const page = (key, ttl, fn) => { docbar(false); shell.title.textContent = ttl; document.title = ttl + ' · BWL Max'; renderList(); return show(key, fromLearn && !(a === 'rechner' && b) ? async root => { const c2 = await fn(root); if (backTarget() && root.isConnected && !root.querySelector('.view-back')) root.prepend(backLink()); return c2; } : fn); };
  if (a === 'trainer') return page('trainer:' + (b || ''), L('BWL-Trainer', 'Business trainer'), async root => {
    const { renderTrainer } = await import('./trainer.js');
    const wrap = h('div', { class: 'view-in' }); root.appendChild(wrap);
    renderTrainer(wrap, { kind: b, onAsk: S.list.length ? text => askTutorAbout(text) : null });
  });
  if (a === 'rechner') return page('rechner:' + (b || ''), L('Rechner', 'Calculators'), async root => { const { render } = await import('./views/rechner.js'); return render(root, { arg: b || '', onAsk: t => viaMax(m => m.ask(t)).then(ok => { if (!ok) askTutorAbout(t, { confirm: false }); }) }); });
  if (a === 'challenge') return page('challenge', L('Wochen-Challenge', 'Weekly challenge'), async root => { const { renderChallenge } = await import('./challenge.js'); renderChallenge(root, { onLogin: () => openAuth({ title: L('Anmelden für die Challenge', 'Sign in for the challenge'), registerTitle: L('Kostenloses Konto für die Challenge', 'Free account for the challenge') }) }); });
  if (a === 'duell') return page('duell:' + (b || ''), L('BWL-Duell', 'Business duel'), async root => { const { renderDuell } = await import('./duell.js'); return renderDuell(root, { code: b || '' }); });
  // Zahlen ist Bens internes Dashboard – alle anderen landen im Tutor
  if (a === 'zahlen') { const z = await import('./views/zahlen.js'); if (!z.isAdmin(getAccount())) { location.replace('#/app/tutor'); return; } }
  if (a === 'zahlen') return page('zahlen', L('Zahlen', 'Numbers'), async root => { const { render } = await import('./views/zahlen.js'); return render(root); });
  if (a === 'lernen') return page('lernen', L('Lernen', 'Learn'), async root => { const { render } = await import('./views/lernen.js'); return render(root); });
  if (a === 'skripte') { location.replace('#/app/bibliothek/unterlagen'); return; }
  if (a === 'bibliothek') return page('bibliothek', L('Bibliothek', 'Library'), async root => { const { render } = await import('./views/bibliothek.js'); return render(root, { tab: b || '' }); });
  // Tutor-Raum: die Startseite. Wer von woanders kommt, dem fliegt Max von unten rechts entgegen.
  if (!a || (a === 'me' && !b)) { location.replace('#/app/tutor'); return; }
  if (a === 'tutor') {
    let arrive = null;
    if (current.key && current.key !== 'room' && asstMod && asstMod.isAssistantEnabled() && !document.querySelector('.ngreet, .asst.covered, .asst.off, .asst.nobub')) {
      try { const ap = asstMod.mountAssistant(); const r = ap && ap.bubFaceRect(); if (r && r.width && r.top < innerHeight && r.left < innerWidth) arrive = r; } catch (e) {}
    }
    if (current.key !== 'room') shell.app.classList.add('side-closed');   // im Raum ist links Platz für die Fächer
    // Handy ohne Konto: der große Tutor-Raum ist der Konto-Moment (Themenseiten und Max unten rechts bleiben frei)
    if (!ls.get('tutor.pendingAsk', null) && !/(^|\s)(m-boardpage|m-eboot)(\s|$)/.test(document.documentElement.className)) import('./roomlock.js').then(m => m.lockRoom()).catch(() => {});
    return page('room', 'Tutor', async root => { const { render } = await import('./views/room.js'); return render(root, { arrive }); });
  }
  // Mein Bereich (nur Heute) und die festen Bereiche oben
  const SUBS = { me: ['', L('Mein Bereich', 'My space')], faecher: ['faecher', L('Fächer & Noten', 'Subjects & grades')], fortschritt: ['stats', L('Fortschritt', 'Progress')], stundenplan: ['plan', L('Stundenplan', 'Timetable')] };
  if (SUBS[a]) { const [sub, ttl] = SUBS[a]; return page('me:' + sub, ttl, async root => { const { render } = await import('./views/me.js'); return render(root, { sub, onLogin: () => openLogin({ title: L('Anmelden für deinen Bereich', 'Sign in for your space') }) }); }); }
  // Neuer Stoff: läuft gerade Upload/Kurzskript, zeigt das die Seite schon; direkt geöffnet (Neuladen, Link) → Upload-Seite
  if (a === 'neu') { docbar(false); if (current.key === 'ingest' || current.key === 'topic') return; return page('neu', L('Neuer Stoff', 'Add material'), async root => { emptyState(root); }); }
  // „Max“ im Skript = Tutor-Raum mit genau diesem Skript
  if (b === 'tutor' && S.list.some(d => d.id === a)) { ls.set('tutor.room.focus', [a]); location.replace('#/app/tutor'); return; }
  if (!S.doc || S.doc.id !== a) {
    const d = await openDoc(a);
    if (!d) { toast(L('Dieses Skript gibt es auf diesem Gerät nicht mehr.', 'These slides are no longer on this device.')); go(''); return; }
  }
  const tab = VIEWS[b] ? b : 'hub';
  docbar(true);
  shell.title.replaceChildren(h('span', { html: ico('file') }), h('b', {}, S.doc.name), h('span', { class: 'db-ch', html: ico('down') }));
  document.title = `${S.doc.name} · BWL Max`;
  renderTabs(a, tab);
  renderList();
  return show(`${a}:${tab}:${c || ''}`, async root => {
    const mod = await VIEWS[tab]();
    return mod.render(root, { doc: S.doc, arg: c ? decodeURIComponent(c) : null, go: (t, x) => go(`${S.doc.id}/${t}${x ? '/' + encodeURIComponent(x) : ''}`), ask: askTutorAbout });
  });
}

// Aktuelle Seite verlassen. Kommt man aus dem Tutor-Raum, fliegt Max' Kopf danach nach unten rechts.
function leaveView(key) {
  let headRect = null, ap = null;
  if (current.key === 'room' && key !== 'room') {
    const fe = document.querySelector('.room .rm-face');
    if (fe && fe.style.visibility !== 'hidden') { const r = fe.getBoundingClientRect(); if (r.width) headRect = r; }
    try { if (asstMod && asstMod.isAssistantEnabled()) { ap = asstMod.mountAssistant(); if (ap && headRect) ap.holdBub(true); } } catch (e) {}
    shell.app.classList.toggle('side-closed', !!ls.get('tutor.sideClosed', false));
  }
  try { current.cleanup && current.cleanup(); } catch (e) {}
  current = { key, cleanup: null };
  return () => { if (headRect && ap) requestAnimationFrame(() => requestAnimationFrame(async () => { const flew = await fly(headRect, () => ap.bubFaceRect(), { dur: 900 }); ap.holdBub(false, flew); })); };
}
async function show(key, fn) {
  if (current.key === key && !current.force) return;
  const after = leaveView(key);
  const root = shell.view;
  root.replaceChildren();
  root.scrollTop = 0;
  after();
  try { const c = await fn(root); if (current.key === key) current.cleanup = typeof c === 'function' ? c : null; }
  catch (e) { console.error(e); root.replaceChildren(h('div', { class: 'empty' }, h('h2', {}, L('Da ist was schiefgelaufen.', 'Something went wrong.')), h('p', {}, String(e.message || e)), h('button', { class: 'btn', onclick: () => location.reload() }, L('Neu laden', 'Reload')))); }
}
export function forceRerender() { current.force = true; }

// Aus Quiz/Trainer heraus: Frage an den Tutor schicken
export async function askTutorAbout(text, { confirm = true } = {}) {
  if (confirm) {
    const short = text.split('\n')[0].replace(/^(Ich habe diese .*?falsch (beantwortet|gelöst)) \(.*?\): /, '$1: ').replace(/^(I got this .*? wrong) \(.*?\): /, '$1: ');
    const ok = await modal({ title: L('Soll Max dir das erklären?', 'Want Max to explain this?'), text: (short.length > 160 ? short.slice(0, 157) + '…' : short), actions: [{ label: L('Nein', 'No'), value: false }, { label: L('Ja, erklär’s mir · 1 Einheit', 'Yes, explain it · 1 credit'), value: true, primary: true }] });
    if (!ok) return;
  }
  if (!S.doc) { const id = S.list[0]?.id; if (!id) { toast(L('Lade zuerst ein Skript hoch.', 'Upload your slides first.')); return; } openDoc(id); }
  ls.set('tutor.pendingAsk', text);
  forceRerender();
  go(`${S.doc ? S.doc.id : S.list[0].id}/tutor`);
}

function emptyState(root) {
  const f = h('div', { class: 'face' });
  const lab = h('label', { class: 'btn primary lg', for: 'fileApp' }, h('span', { html: ico('upload') }), L('Stoff hochladen', 'Upload material'));
  root.appendChild(h('div', { class: 'view-in' }, h('div', { class: 'empty' }, f,
    h('h2', {}, L('Was lernen wir heute?', 'What are we learning today?')),
    h('p', {}, L('Zieh deinen Unistoff hier rein – Vorlesung, Skript, Übungsblatt oder Altklausur, als PDF, PowerPoint oder Word. Die Datei bleibt auf deinem Gerät.', 'Drop your course material here – slides, notes, problem sets or past exams, as PDF, PowerPoint or Word. The file stays on your device.')),
    h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' } }, lab,
      h('button', { class: 'btn lg', onclick: () => startSample() }, L('Beispiel ansehen', 'See an example')),
      h('a', { class: 'btn lg ghost', href: '#/app/trainer' }, 'Trainer')),
    topicForm({ cls: 'askbar inapp' }),
    h('button', { class: 'talklink', type: 'button', onclick: () => talkToMax() }, h('span', { html: ico('mic') }), L('oder quatsch einfach mit mir', 'or just chat with me')))));
  face(f);
  dropAnywhere(root);
}

function dropAnywhere(el) {
  el.addEventListener('dragover', e => { e.preventDefault(); });
  el.addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer?.files; if (f && f.length) startUpload([...f]); });
}

// ---------- Upload: alles läuft über die Einordnung (intake.js) ----------
export async function startUpload(files) {
  files = files instanceof File ? [files] : [...(files || [])];
  if (!files.length) return;
  if (location.hash !== '#/app/neu') location.hash = '#/app/neu';
  if (!shell) { buildShell(); await refreshList(); }
  shell.tabs.replaceChildren(); docbar(false);
  const after = leaveView('ingest'); after();
  const target = ls.get('tutor.target', null); ls.set('tutor.target', null);
  try {
    const { intake } = await import('./intake.js');
    await intake(files, { view: shell.view, setTitle: t => { shell.title.textContent = t; }, target });
  } catch (e) {
    console.error(e);
    const f = h('div', { class: 'face' });
    shell.view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, f, h('h2', { style: { margin: 0 } }, L('Da hakt was.', 'Something’s off.')), h('div', { class: 'sub' }, e.message || L('Die Datei konnte nicht gelesen werden.', 'The file couldn’t be read.')),
      h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'center' } }, h('label', { class: 'btn primary', for: 'fileApp', onclick: () => { if (target) ls.set('tutor.target', target); } }, L('Andere Datei', 'Different file')), h('button', { class: 'btn', onclick: () => startSample() }, L('Beispiel nehmen', 'Use the example'))))));
    face(f).set('sad');
  }
}

export async function startSample() {
  try { window.BM && window.BM.track('Beispiel geöffnet'); } catch (e) {}
  if (!shell) { buildShell(); await refreshList(); }
  const ex = S.list.find(d => d.sample);
  if (ex) { const t = ls.get('tutor.target', null); location.hash = t ? afterCreate(ex) : `#/app/${ex.id}/hub`; return; }
  const d = await createDoc({ name: SAMPLE.name, pages: SAMPLE.pages, chars: SAMPLE.pages.join('').length, sample: true });
  forceRerender();
  location.hash = afterCreate(d);
}

// ---------- Einstellungen ----------
async function settings() {
  const imp = h('input', { type: 'file', accept: '.bwlmax,.json', class: 'sr' });
  const body = h('div', { style: { display: 'grid', gap: '10px' } },
    h('button', { class: 'btn', onclick: async () => { const b = await exportAll(); const a = h('a', { href: URL.createObjectURL(b), download: `${L('BWL-Max-Sicherung', 'BWL-Max-Backup')}-${new Date().toISOString().slice(0, 10)}.bwlmax` }); document.body.appendChild(a); a.click(); a.remove(); toast(L('Sicherung gespeichert – liegt in deinen Downloads.', 'Backup saved – it’s in your downloads.')); } }, h('span', { html: ico('download') }), L('Lernstand als Datei sichern', 'Back up your progress as a file')),
    h('label', { class: 'btn' }, imp, h('span', { html: ico('upload') }), L('Gesicherten Lernstand wiederherstellen', 'Restore a backup')),
    h('button', { class: 'btn', onclick: async () => {
      const ok = await modal({ title: L('Wirklich alles löschen?', 'Really delete everything?'), text: L('Alle Skripte, Quizze, Karten und Chats werden von diesem Gerät gelöscht. Das lässt sich nicht rückgängig machen.', 'All slides, quizzes, flashcards and chats will be deleted from this device. This can’t be undone.'), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Alles löschen', 'Delete everything'), value: true, primary: true }] });
      if (ok) { await wipe(); location.hash = '#/'; location.reload(); }
    } }, h('span', { html: ico('trash') }), L('Alles auf diesem Gerät löschen', 'Delete everything on this device')));
  imp.addEventListener('change', async () => {
    try { const n = await importAll(imp.files[0]); await refreshList(); toast(L(`${n} Skript(e) wiederhergestellt.`, `${n} set(s) of slides restored.`)); } catch (e) { toast(L('Das ist keine gültige BWL-Max-Sicherung.', 'That’s not a valid BWL Max backup.')); }
  });
  await modal({ title: L('Daten & Sicherung', 'Data & backup'), text: L('Dein Lernstand liegt nur auf diesem Gerät. Mit „Sichern“ bekommst du eine .bwlmax-Datei in deine Downloads – die musst du nicht öffnen. Auf einem anderen Gerät (oder nach dem Löschen) wählst du sie bei „Wiederherstellen“ aus, und alles ist wieder da.', 'Your progress only lives on this device. “Back up” puts a .bwlmax file in your downloads – you don’t need to open it. On another device (or after deleting), pick it under “Restore” and everything’s back.'), body, actions: [{ label: L('Fertig', 'Done'), value: true, primary: true }] });
}

// ---------- Thema ohne Skript: Max schreibt ein Kurzskript ----------
const TOPIC_EXAMPLES = L(['Kapitalwertmethode', 'Latente Steuern', 'Preiselastizität', 'Break-even-Analyse', 'Abschreibungen nach HGB', 'Cournot-Oligopol', 'Leverage-Effekt', 'IFRS 16 Leasing', 'Deckungsbeitrag', 'Opportunitätskosten'], ['Net present value', 'Deferred taxes', 'Price elasticity', 'Break-even analysis', 'Depreciation', 'Cournot oligopoly', 'Leverage effect', 'IFRS 16 leases', 'Contribution margin', 'Opportunity cost']);
export function topicForm({ cls = 'askbar', target = null } = {}) {
  const inp = h('input', { class: 'tin', maxlength: 160, 'aria-label': L('Was soll ich dir erklären?', 'What should I explain?'), placeholder: L('Sag mir, was ich dir erklären soll …', 'Tell me what to explain …'), enterkeyhint: 'go' });
  const fEl = h('span', { class: 'af' });
  const BTN = L({ plan: 'Plan bauen', quiz: 'Quiz bauen', karten: 'Karten machen', podcast: 'Folge aufnehmen', zettel: 'Lernzettel schreiben', pfad: 'Lernpfad bauen' }, { plan: 'Build plan', quiz: 'Build quiz', karten: 'Make flashcards', podcast: 'Record episode', zettel: 'Write study sheet', pfad: 'Build study path' });
  const btn = h('button', { class: 'btn primary', type: 'submit' }, BTN[target] || L('Erklär’s mir', 'Explain it'));
  const form = h('form', { class: cls }, fEl, inp, btn);
  face(fEl, {});
  const hint = h('div', { class: 'askhint', role: 'alert' });
  form.addEventListener('submit', e => {
    e.preventDefault(); const t = inp.value.trim();
    if (t.length < 2) {
      form.classList.remove('bad'); void form.offsetWidth; form.classList.add('bad');
      hint.textContent = L('Schreib erst ein Thema rein – z. B. „Kapitalwert“. Ohne Thema kann ich nichts erklären.', 'Type a topic first – e.g. “Net present value”. Without a topic there’s nothing to explain.');
      if (!hint.isConnected) form.insertAdjacentElement('afterend', hint);
      inp.focus(); return;
    }
    hint.remove(); form.classList.remove('bad');
    form.dispatchEvent(new CustomEvent('topicok'));
    if (!target) { inp.value = ''; inp.blur(); inp.dispatchEvent(new Event('input')); viaMax(a => a.ask(t)).then(ok => { if (!ok) { ls.set('tutor.target', null); startTopic(t); } }); return; }
    ls.set('tutor.target', target); startTopic(t);
  });
  inp.addEventListener('input', () => { if (inp.value.trim().length >= 2) { hint.remove(); form.classList.remove('bad'); } });
  // Beispiele im Platzhalter durchtippen
  let k = Math.floor(Math.random() * TOPIC_EXAMPLES.length), stop = false;
  inp.addEventListener('focus', () => { stop = true; inp.placeholder = L('z. B. ', 'e.g. ') + TOPIC_EXAMPLES[k % TOPIC_EXAMPLES.length]; });
  (async () => {
    await new Promise(r => setTimeout(r, 2600));
    while (form.isConnected && !stop) {
      const pre = L('Erklär mir … ', 'Explain … '), t = pre + TOPIC_EXAMPLES[k++ % TOPIC_EXAMPLES.length];
      for (let i = pre.length; i <= t.length && !stop; i++) { inp.placeholder = t.slice(0, i); await new Promise(r => setTimeout(r, 45)); }
      await new Promise(r => setTimeout(r, 2200));
      if (!stop) inp.placeholder = L('Sag mir, was ich dir erklären soll …', 'Tell me what to explain …');
      await new Promise(r => setTimeout(r, 2600));
    }
  })();
  return form;
}

export async function topicPrompt() {
  const form = topicForm({ cls: 'askbar inmodal' });
  const p = modal({ title: L('Was soll ich dir erklären?', 'What should I explain?'), text: L('Kein Skript nötig: Ich schreib dir ein Kurzskript zum Thema – mit Beispiel, Formeln und typischen Klausurfehlern. Danach gehen Quiz, Karten, Lernpfad und Podcast wie gewohnt. 2 Einheiten.', 'No slides needed: I’ll write you a short script on the topic – with an example, formulas and typical exam mistakes. After that, quiz, flashcards, study path and podcast work as usual. 2 credits.'), body: form, actions: [] });
  form.addEventListener('topicok', () => document.querySelector('.modal-bg')?.remove());
  setTimeout(() => form.querySelector('input')?.focus(), 80);
  return p;
}

export async function startTopic(topic) {
  if (!shell) { buildShell(); await refreshList(); }
  if (location.hash !== '#/app/neu') location.hash = '#/app/neu';
  shell.title.textContent = L('Ich schreibe …', 'Writing …');
  shell.tabs.replaceChildren(); docbar(false);
  const after = leaveView('topic'); after();
  const f = h('div', { class: 'face' }), sub = h('div', { class: 'sub' }), bar = h('i');
  shell.view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, f,
    h('h2', { style: { margin: 0, letterSpacing: '-.03em' } }, L(`Ich schreib dir ein Kurzskript zu „${topic}“`, `I’m writing you a short script on “${topic}”`)),
    h('div', { class: 'bar' }, bar), sub)));
  const fc = face(f); fc.set('think');
  const tb = thought(f, 'topic', [L('Ich schreibe das Kurzskript …', 'Writing the short script …'), L('Beispiel wird durchgerechnet …', 'Working through the example …'), L('Ich prüfe die Zahlen …', 'Checking the numbers …')]);
  const t0 = Date.now();
  const iv = setInterval(() => {
    if (!sub.isConnected) { tb.stop(); return clearInterval(iv); }
    const s = (Date.now() - t0) / 1000;
    bar.style.width = Math.min(92, 100 * (1 - Math.exp(-s / 22))) + '%';
    sub.textContent = s > 4 ? `${Math.round(s)} s` : '';
  }, 250);
  try {
    const r = await ask('topic', { opts: { topic, spice: getSpice() } });
    const pages = (r.data?.pages || []).map(String).filter(x => x.trim().length > 20);
    if (pages.length < 2) throw Object.assign(new Error(L('Ich hab mich verhaspelt. Versuch es nochmal.', 'I got tongue-tied. Try again.')), { code: 'format' });
    clearInterval(iv); tb.stop(); bar.style.width = '100%'; fc.set('happy');
    const name = String(r.data.title || topic).slice(0, 80);
    const d = await createDoc({ name, pages, chars: pages.join('').length, generated: true, topic });
    const tgt = ls.get('tutor.target', null); ls.set('tutor.target', null);
    // Einordnen wie beim Upload: Fach, Ziel, Datum, womit starten – alles optional
    const { placeTopic, route } = await import('./intake.js');
    const ans = await placeTopic(d, r.data, tgt).catch(() => null);
    forceRerender();
    if (!ans || ans.start === 'tutor') { ls.set('tutor.pendingAsk', L(`Erklär mir „${topic}“ von Grund auf – mit Beispiel an der Tafel.`, `Explain “${topic}” to me from scratch – with an example on the whiteboard.`)); location.hash = `#/app/${d.id}/tutor`; }
    else location.hash = route(d, ans);
  } catch (e) {
    clearInterval(iv); tb.stop(); tb.el.remove(); fc.set('sad');
    if (e.code === 'limit') { await apiError(e); go(''); return; }
    sub.textContent = e.message || L('Das hat nicht geklappt.', 'That didn’t work.');
    // Thema unklar: Max fragt nach – mit seinem besten Vorschlag
    if (e.code === 'unklar') {
      fc.set('think');
      sub.after(h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' } },
        e.suggest ? h('button', { class: 'btn primary', onclick: () => startTopic(e.suggest) }, L(`Ja, „${e.suggest}“`, `Yes, “${e.suggest}”`)) : null,
        h('button', { class: e.suggest ? 'btn' : 'btn primary', onclick: () => topicPrompt() }, L('Anders formulieren', 'Rephrase'))));
      return;
    }
    sub.after(h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'center' } },
      h('button', { class: 'btn primary', onclick: () => startTopic(topic) }, L('Nochmal versuchen', 'Try again')), h('button', { class: 'btn', onclick: () => topicPrompt() }, L('Anderes Thema', 'Different topic'))));
  }
}

// Am Handy genau einmal (pro Browser) ein kleiner Tipp oben links: am Laptop/iPad ist die Tafel neben dem Chat
function mobileTip() {
  if (!isPhone() || ls.get('tutor.mobileTip2', 0)) return;
  const t0 = Date.now();
  const tryShow = () => {
    if (ls.get('tutor.mobileTip2', 0) || !isPhone()) return;
    if (document.hidden || overlayBusy()) { if (Date.now() - t0 < 60000) setTimeout(tryShow, 1500); return; }
    ls.set('tutor.mobileTip2', 1);
    const f = h('span', { class: 'mt2f' });
    let gone = false;
    const close = () => { if (gone) return; gone = true; document.documentElement.classList.remove('m-tip'); tip.classList.add('out'); setTimeout(() => tip.remove(), 300); };
    const tip = h('div', { class: 'mtip2', role: 'status' }, f,
      h('p', {}, h('b', {}, L('Tipp: ', 'Tip: ')), L('Am Laptop oder iPad ist BWL Max noch stärker – große Tafel direkt neben dem Chat.', 'On a laptop or iPad BWL Max is even better – a big whiteboard right next to the chat.')),
      h('button', { class: 'mt2x', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: close }));
    document.body.appendChild(tip);
    document.documentElement.classList.add('m-tip');
    face(f, { follow: false });
    setTimeout(close, 6000);
    // Cookie-Banner oder Dialog kommt dazu → Tipp geht sofort, nie zwei Overlays auf einmal
    const iv = setInterval(() => { if (gone) return clearInterval(iv); if (document.documentElement.classList.contains('bmc-open') || document.querySelector('.modal-bg')) { close(); clearInterval(iv); } }, 300);
  };
  setTimeout(tryShow, 3000);
}

// Handy: „Klick mich“ höchstens einmal kurz, Max-Knopf weicht beim Runterscrollen und Tippen aus,
// obere Leiste mit Verlauf am Rand, Seitenleiste über allem, Dialoge schließen beim Zurück
function phoneShell(topnav, app) {
  const root = document.documentElement;
  // „Klick mich – …“: einmal pro Browser, ~4 s, weg beim ersten Scrollen/Tippen
  let pillT = 0;
  const pillOff = () => { clearTimeout(pillT); root.classList.remove('m-pill'); };
  const watchPill = asst => {
    const check = () => {
      if (!isPhone() || root.classList.contains('m-pill') || ls.get('tutor.m.pill', 0)) return;
      if (!asst.classList.contains('tip-on') || overlayBusy()) return;
      ls.set('tutor.m.pill', 1); root.classList.add('m-pill');
      pillT = setTimeout(pillOff, 4000);
    };
    new MutationObserver(check).observe(asst, { attributes: true, attributeFilter: ['class'] });
    check();
  };
  const findAsst = (n = 0) => { const a = document.querySelector('.asst'); if (a) watchPill(a); else if (n < 60) setTimeout(() => findAsst(n + 1), 500); };
  findAsst();
  document.addEventListener('pointerdown', e => { if (!root.classList.contains('m-pill')) return; if (e.target.closest && e.target.closest('.asst-bub')) setTimeout(pillOff, 500); else pillOff(); }, true);
  // Max-Knopf: beim Runterscrollen weg, beim Hochscrollen wieder da; weg, solange ein Eingabefeld aktiv ist
  const last = new WeakMap();
  document.addEventListener('scroll', e => {
    const el = e.target === document ? document.scrollingElement : e.target;
    if (!el || el.nodeType !== 1 || el.closest?.('.asst, .side, .topnav, .tabs')) return;
    const y = el.scrollTop, p = last.get(el); last.set(el, y);
    if (root.classList.contains('m-pill')) pillOff();
    if (p == null) return;
    if (y < 24 || y - p < -6) root.classList.remove('m-bubhide');
    else if (y - p > 6) root.classList.add('m-bubhide');
  }, { capture: true, passive: true });
  const field = el => el && el.matches && el.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), textarea, select, [contenteditable="true"]') && !el.closest('.asst');
  document.addEventListener('focusin', e => { if (field(e.target)) root.classList.add('m-bubfocus'); });
  document.addEventListener('focusout', () => setTimeout(() => { if (!field(document.activeElement)) root.classList.remove('m-bubfocus'); }, 60));
  addEventListener('hashchange', () => root.classList.remove('m-bubhide'));
  // Obere Leiste: Verlauf rechts/links, solange es dort weitergeht
  const edge = () => { const max = topnav.scrollWidth - topnav.clientWidth; topnav.classList.toggle('m-fl', topnav.scrollLeft > 4); topnav.classList.toggle('m-fr', max > 4 && topnav.scrollLeft < max - 4); };
  topnav.addEventListener('scroll', edge, { passive: true }); addEventListener('resize', edge); setTimeout(edge, 300);
  shell.navEdge = edge;
  // Seitenleiste offen → Eingabeleiste von Max weg (sonst liegt sie über Sprache, Konto und Rechtlichem)
  new MutationObserver(() => root.classList.toggle('m-side', app.classList.contains('sideopen'))).observe(app, { attributes: true, attributeFilter: ['class'] });
  // Dialoge merken sich die Adresse, unter der sie aufgingen; ändert sie sich (Zurück am Handy), gehen sie zu
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('modal-bg') && !n.dataset.hash) n.dataset.hash = location.hash; }))).observe(document.body, { childList: true });
  addEventListener('hashchange', () => {
    document.querySelectorAll('body > .modal-bg').forEach(bg => {
      if (!bg.dataset.hash || bg.dataset.hash === location.hash) return;
      const x = bg.querySelector('.modal > .mx, .modal > .lx, .modal .mx, .modal .lx, [aria-label="Schließen"], [aria-label="Close"]');
      if (x) x.click();
      setTimeout(() => { if (bg.isConnected && !bg.classList.contains('out')) bg.remove(); }, 400);
    });
  });
}
function navIntoView() {
  const t = shell?.topnav, on = t && t.querySelector('.tn.on');
  if (!on || !on.offsetWidth || t.scrollWidth <= t.clientWidth + 2) { shell?.navEdge?.(); return; }
  const l = on.getBoundingClientRect().left - t.getBoundingClientRect().left + t.scrollLeft;
  const want = Math.max(0, l - (t.clientWidth - on.offsetWidth) / 2);
  if (Math.abs(want - t.scrollLeft) > 4) t.scrollTo({ left: want, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  setTimeout(() => shell?.navEdge?.(), 400);
}

// Nach Upload/Thema: direkt zur gewählten Funktion (vom „Ausprobieren“ auf der Startseite)
const AUTO_TABS = { quiz: 'quiz', karten: 'karten', podcast: 'podcast', zettel: 'zettel', pfad: 'pfad' };
function afterCreate(d) {
  const t = ls.get('tutor.target', null); ls.set('tutor.target', null);
  if (t === 'tutor') { ls.set('tutor.pendingAsk', L('Erklär mir das wichtigste Thema aus dem Skript an der Tafel – mit Beispiel.', 'Explain the most important topic from the slides on the whiteboard – with an example.')); return `#/app/${d.id}/tutor`; }
  if (t === 'plan') return `#/app/${d.id}/plan`;
  if (AUTO_TABS[t]) return `#/app/${d.id}/${AUTO_TABS[t]}/auto`;
  return `#/app/${d.id}/hub/neu`;
}

// „Ausprobieren“: Skript hochladen oder Thema nennen, danach direkt in die Funktion
export const TRY = L({
  tutor: ['Erklärt an der Tafel', 'Lade dein Skript hoch oder nenn mir ein Thema – ich erklär’s dir direkt an der Tafel.'],
  plan: ['Klausurplan', 'Lade dein Skript hoch oder nenn mir ein Thema – ich bau dir einen Plan bis zur Klausur, Tag für Tag.'],
  quiz: ['Quiz in 6 Formaten', 'Lade dein Skript hoch oder nenn mir ein Thema – ich bau dir sofort ein Quiz daraus.'],
  karten: ['Karteikarten', 'Lade dein Skript hoch oder nenn mir ein Thema – ich mach dir direkt 16 Karteikarten.'],
  pfad: ['Lernpfad', 'Lade dein Skript hoch oder nenn mir ein Thema – ich teil’s dir in Kapitel mit Lektionen auf.'],
  podcast: ['Podcast', 'Lade dein Skript hoch oder nenn mir ein Thema – Lena und ich nehmen direkt eine Folge auf.'],
  zettel: ['Lernzettel & Mindmap', 'Lade dein Skript hoch oder nenn mir ein Thema – ich schreib dir Lernzettel und Mindmap.'],
}, {
  tutor: ['Explained on the whiteboard', 'Upload your slides or give me a topic – I’ll explain it to you right on the whiteboard.'],
  plan: ['Exam plan', 'Upload your slides or give me a topic – I’ll build you a day-by-day plan up to your exam.'],
  quiz: ['Quizzes in 6 formats', 'Upload your slides or give me a topic – I’ll build you a quiz from it straight away.'],
  karten: ['Flashcards', 'Upload your slides or give me a topic – I’ll make you 16 flashcards right away.'],
  pfad: ['Study path', 'Upload your slides or give me a topic – I’ll split it into chapters with lessons.'],
  podcast: ['Podcast', 'Upload your slides or give me a topic – Lena and I will record an episode right away.'],
  zettel: ['Study sheet & mind map', 'Upload your slides or give me a topic – I’ll write you a study sheet and a mind map.'],
});
export async function tryFeature(key) {
  if (key === 'voice') return talkToMax();
  if (key === 'trainer') { location.hash = '#/app/trainer'; return; }
  if (key === 'challenge') { location.hash = '#/app/challenge'; return; }
  const [title, text] = TRY[key] || TRY.tutor;
  // Karteikarten: nach Upload/Thema direkt bauen, ohne Fragen (Podcast, Quiz, Lernzettel fragen kurz nach Länge, Stimme …)
  if (key === 'karten') import('./create.js').then(m => m.setCreate(key, '*', ls.get('tutor.pers.' + key, null) || {})).catch(() => {});
  const fin = h('input', { type: 'file', class: 'sr', accept: ACCEPT, multiple: true });
  const close = () => document.querySelector('.modal-bg.trybg')?.remove();
  fin.addEventListener('change', () => { if (fin.files.length) { ls.set('tutor.target', key); close(); startUpload([...fin.files]); } });
  const form = topicForm({ cls: 'askbar inmodal', target: key });
  form.addEventListener('topicok', () => close());
  const body = h('div', { class: 'trybody' },
    h('label', { class: 'btn primary lg trybtn' }, fin, h('span', { html: ico('upload') }), L('Stoff hochladen', 'Upload material')),
    h('div', { class: 'or' }, h('span', {}, L('oder Thema nennen', 'or name a topic'))),
    form,
    h('button', { class: 'talklink', type: 'button', onclick: () => { ls.set('tutor.target', key); close(); startSample(); } }, L('Erstmal mit dem Beispiel-Skript testen', 'Try it with the example slides first')));
  const p = modal({ title, text, body, actions: [] });
  document.querySelector('.modal-bg:last-of-type')?.classList.add('trybg');
  return p;
}

// „Max antwortet auf …“ – Sprache der Inhalte
function outLangSwitch() {
  const cur = getOutLang();
  const btns = [['de', 'Deutsch'], ['en', 'English']].map(([k, l]) => {
    const b = h('button', { type: 'button', class: k === cur ? 'on' : '' }, l);
    b.addEventListener('click', () => { setOutLang(k); btns.forEach(x => x.classList.toggle('on', x === b)); toast(k === 'en' ? 'I’ll answer in English now.' : 'Ich antworte jetzt auf Deutsch.'); });
    return b;
  });
  return h('div', { class: 'olang', title: L('Sprache meiner Antworten, Quiz, Karten und Podcast', 'Language of my answers, quizzes, flashcards and podcast') }, h('span', {}, L('Ich antworte auf', 'I answer in')), h('div', { class: 'seg' }, btns));
}

// Sprache der Oberfläche: DE | EN
function langSwitch() {
  return h('div', { class: 'langsw', role: 'group', 'aria-label': L('Sprache', 'Language') },
    [['de', 'DE'], ['en', 'EN']].map(([k, l]) => h('button', { type: 'button', class: k === lang ? 'on' : '', 'data-setlang': k, 'aria-pressed': k === lang ? 'true' : 'false', onclick: () => {
      if (k === lang) return;
      // ?lang=… in der Adresse würde die Wahl nach dem Neuladen überschreiben
      try { const u = new URL(location.href); if (u.searchParams.has('lang')) { u.searchParams.delete('lang'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); } } catch (e) {}
      setLang(k);
    } }, l)));
}

// Rechtliches: auf bwlmax.de kurze Pfade, sonst /tutor/legal/
function legalHref(name) { return /(^|\.)bwlmax\.de$/.test(location.hostname) ? '/' + name : '/tutor/legal/' + name + '.html'; }

// Handy: sichtbare Navigation unten statt verstecktem Menü (NN/g: 89 % statt 44 % Nutzung)
function bottomBar(getApp) {
  const item = (key, ic, label, act) => h(typeof act === 'string' ? 'a' : 'button', Object.assign({ class: 'bb-i', 'data-bb': key }, typeof act === 'string' ? { href: act } : { type: 'button', onclick: act }), h('span', { class: 'bb-ic', html: ico(ic) }), h('span', { class: 'bb-t' }, label));
  const bar = h('nav', { class: 'bbar', 'aria-label': L('Hauptnavigation', 'Main navigation') },
    (() => { const f = h('span', { class: 'bb-ic bb-face' }); const el = h('a', { class: 'bb-i bb-tutor', 'data-bb': 'tutor', href: '#/app/tutor' }, f, h('span', { class: 'bb-t' }, 'Tutor')); face(f, { follow: false }); return el; })(),
    item('bibliothek', 'library', L('Bibliothek', 'Library'), '#/app/bibliothek'),
    Object.assign(item('side', 'sidebar', 'Tools', () => getApp().classList.toggle('sideopen')), { className: 'bb-i bb-side' }),
    item('search', 'search', L('Suche', 'Search'), () => import('./palette.js').then(m => m.openPalette())),
    item('ich', 'lock', L('Ich', 'Me'), () => getAccount() ? openAccount() : openAuth()));
  const mark = () => { const h0 = location.hash; bar.querySelectorAll('.bb-i').forEach(x => x.classList.toggle('on', (x.dataset.bb === 'tutor' && h0.startsWith('#/app/tutor')) || (x.dataset.bb === 'bibliothek' && (h0.startsWith('#/app/bibliothek') || !!(S.doc && h0.includes(S.doc.id)))))); };
  addEventListener('hashchange', mark); mark();
  // Handy: keine Leiste unten (mehr Platz) – alles steckt oben; Tablet behält sie
  const mq = matchMedia('(max-width: 600px), (pointer: coarse) and (max-height: 500px)');
  const apply = () => { document.documentElement.classList.toggle('has-bbar', !mq.matches); document.documentElement.classList.toggle('m-nobb', mq.matches); };
  apply(); try { mq.addEventListener('change', apply); } catch (e) { mq.addListener && mq.addListener(apply); }
  return bar;
}

// ---------- Kleines Menü unten links: Einstellungen & Rechtliches ----------
function sideMenuBtn() {
  return h('button', { class: 'iconbtn side-gear', type: 'button', 'aria-label': L('Einstellungen', 'Settings'), title: L('Einstellungen', 'Settings'), html: ico('tune'), onclick: e => openSideMenu(e.currentTarget) });
}
function openSideMenu(anchor, focus = '') {
  document.querySelector('.sidemenu')?.remove();
  const it = (label, fn, ic) => h('button', { type: 'button', class: 'sm-it', onclick: () => { close(); fn(); } }, ic ? h('span', { html: ico(ic) }) : null, label);
  const ln = (label, name) => h('a', { class: 'sm-it sm-l', href: legalHref(name), target: name === 'kuendigen' || name === 'widerrufen' ? null : '_blank', rel: 'noopener' }, label);
  const asst = h('button', { type: 'button', class: 'sm-it' }, h('span', { html: ico('chat') }), L('Max ausblenden', 'Hide Max'));
  import('./assistant.js').then(m => { asst.lastChild.textContent = m.isAssistantEnabled() ? L('Max ausblenden', 'Hide Max') : L('Max einblenden', 'Show Max'); });
  asst.addEventListener('click', () => { close(); import('./assistant.js').then(m => m.setAssistantEnabled(!m.isAssistantEnabled())); });
  const menu = h('div', { class: 'sidemenu', role: 'menu' },
    h('div', { class: 'sm-g' },
      it(L('Feedback geben', 'Give feedback'), openFeedback, 'star'),
      it(L('Daten & Sicherung', 'Data & backup'), settings, 'download'),
      asst),
    h('div', { class: 'sm-sep' }),
    h('div', { class: 'sm-g sm-legal' + (focus === 'recht' ? ' focus' : '') },
      h('div', { class: 'sm-h' }, L('Rechtliches', 'Legal')),
      ln(L('Impressum', 'Legal notice'), 'impressum'), ln(L('Datenschutz', 'Privacy'), 'datenschutz'), ln(L('AGB', 'Terms'), 'agb'), ln(L('Widerrufsbelehrung', 'Right of withdrawal'), 'widerruf'),
      ln(L('Vertrag widerrufen', 'Withdraw from contract'), 'widerrufen'), ln(L('Verträge kündigen', 'Cancel contracts'), 'kuendigen')));
  document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect(), mh = menu.offsetHeight, mw = menu.offsetWidth;
  menu.style.left = Math.max(8, Math.min(innerWidth - mw - 8, r.right - mw)) + 'px';
  menu.style.top = Math.max(8, r.top - mh - 8) + 'px';
  const close = () => { menu.classList.add('out'); setTimeout(() => menu.remove(), 160); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc); };
  const outside = e => { if (!menu.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) close(); };
  const esc = e => { if (e.key === 'Escape') close(); };
  setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc); }, 0);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close()));
}

// „Lernen“ oben: zurück dahin, wo man in Lernen zuletzt war (z. B. die gerade gebauten Karteikarten) – nicht jedes Mal von vorn
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[data-tn="lernen"]'); if (!a || e.metaKey || e.ctrlKey) return;
  const last = lernLast(), cur = location.hash.replace(/\/auto$/, '');
  if (!last || cur === last || cur.startsWith('#/app/lernen')) return;
  e.preventDefault();
  try { sessionStorage.setItem('tutor.backTo', 'lernen'); } catch (x) {}
  location.hash = last;
}, true);
