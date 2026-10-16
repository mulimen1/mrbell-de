// App-Rahmen: Seitenleiste mit Skripten, Tabs, Upload, Kontingent
import { $, $$, h, ico, toast, modal, ago, ls } from './util.js';
import { face } from './face.js';
import { S, refreshList, openDoc, createDoc, removeDoc, lastDocId, save, onChange, SAMPLE, mastery } from './state.js';
import { ACCEPT } from './ingest.js';
import { onQuota, currentQuota, ask, getAccount, onAccount } from './api.js';
import { accountChip, refreshAccount, openLogin, openAccount } from './account.js';
import { getOutLang, setOutLang, L, LOCALE, lang, setLang } from './i18n.js';
import { lines as maxLines, getSpice } from './max.js';
import { apiError, thought } from './ui.js';
import { exportAll, importAll, wipe } from './db.js';
import { applyThemeButtons } from './theme.js';
import { feedbackButton, openFeedback } from './feedback.js';

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
  const list = h('div', { class: 'doclist' });
  const quotaEl = h('div', { class: 'quota' });
  const faceEl = h('span', { class: 'mini', style: { width: '28px', height: '28px' } });
  const side = h('aside', { class: 'side' },
    h('div', { class: 'top' },
      h('a', { class: 'brand', href: '#/' }, faceEl, 'BWL Max', h('small', {}, 'Beta')),
      h('span', { style: { flex: 1 } }),
      langSwitch(),
      h('button', { class: 'iconbtn', 'data-theme-toggle': '', 'aria-label': L('Hell/Dunkel', 'Light/Dark') })),
    h('div', { class: 'scroll' },
      // Oben: wo du bist und was dir gehört
      h('a', { class: 'doc-item me-link', href: '#/app/me', 'data-nav': 'me' }, h('span', { html: ico('home') }), h('span', { class: 'nm' }, L('Mein Bereich', 'My space')), h('span', { class: 'lockb', 'data-lockb': '', html: ico('lock') })),
      h('a', { class: 'doc-item', href: '#/app/me/favs', 'data-nav': 'favs' }, h('span', { html: ico('star') }), h('span', { class: 'nm' }, L('Gemerkt', 'Saved')), h('span', { class: 'pg', 'data-favn': '' })),
      h('label', { class: 'btn primary side-new', for: 'fileApp' }, h('span', { html: ico('plus') }), L('Neuer Stoff', 'Add material')), fileIn,
      h('div', { class: 'grp' }, L('Deine Skripte', 'Your slides')), list,
      // Darunter ruhig: die Werkzeuge
      h('div', { class: 'grp' }, L('Werkzeuge', 'Tools')),
      h('div', { class: 'side-tools' },
        h('button', { class: 'doc-item', type: 'button', onclick: () => talkToMax() }, h('span', { html: ico('mic') }), h('span', { class: 'nm' }, L('Sprich mit mir', 'Talk to me'))),
        h('button', { class: 'doc-item', type: 'button', onclick: () => topicPrompt() }, h('span', { html: ico('bulb') }), h('span', { class: 'nm' }, L('Ich erklär dir ein Thema', 'I’ll explain a topic'))),
        h('a', { class: 'doc-item', href: '#/app/trainer', 'data-nav': 'trainer' }, h('span', { html: ico('whistle') }), h('span', { class: 'nm' }, L('BWL-Trainer', 'Business trainer'))),
        h('a', { class: 'doc-item', href: '#/app/rechner', 'data-nav': 'rechner' }, h('span', { html: ico('calc') }), h('span', { class: 'nm' }, L('Rechner', 'Calculators'))),
        h('a', { class: 'doc-item', href: '#/app/challenge', 'data-nav': 'challenge' }, h('span', { html: ico('trophy') }), h('span', { class: 'nm' }, L('Wochen-Challenge', 'Weekly challenge')), h('span', { class: 'lockb', 'data-lockb': '', html: ico('lock') })),
        h('button', { class: 'doc-item soon', type: 'button', onclick: () => toast(L('Kommt bald: Jeden Tag ein BWL-Duell, 1 gegen 1. Einmal am Tag kostenlos, mehr im Inner Circle.', 'Coming soon: a daily 1-on-1 business duel. Once a day for free, more in the Inner Circle.'), 4200) }, h('span', { html: ico('spark') }), h('span', { class: 'nm' }, L('1-gegen-1-Duell', '1-on-1 duel')), h('span', { class: 'soonb' }, L('Bald', 'Soon'))))),
    // Unten: klein und ruhig – Sprache, Konto, Menü; Kündigen bleibt sichtbar (§ 312k BGB)
    h('div', { class: 'bottom' }, quotaEl, outLangSwitch(),
      h('div', { class: 'side-acc' }, accountChip(), sideMenuBtn()),
      h('div', { class: 'side-fine' }, h('button', { type: 'button', onclick: e => openSideMenu(e.currentTarget, 'recht') }, L('Rechtliches', 'Legal')), h('span', {}, '·'), h('a', { href: legalHref('kuendigen') }, L('Verträge kündigen', 'Cancel contracts')))));
  const title = h('h1', {});
  const tabs = h('nav', { class: 'tabs', role: 'tablist' });
  const menuBtn = h('button', { class: 'iconbtn mob-menu', 'aria-label': L('Menü', 'Menu'), html: ico('menu'), onclick: () => root.querySelector('.app').classList.toggle('sideopen') });
  const view = h('main', { class: 'view', id: 'view' });
  const palBtn = h('button', { class: 'pal-btn', type: 'button', 'aria-label': L('Suchen', 'Search'), title: L('Suchen und Befehle (⌘K)', 'Search and commands (⌘K)'), onclick: () => import('./palette.js').then(m => m.openPalette()) }, h('span', { html: ico('search') }), h('span', { class: 'pal-btx' }, L('Suchen', 'Search')), h('kbd', {}, /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Strg K'));
  const main = h('div', { class: 'main' }, h('div', { class: 'topbar' }, menuBtn, title, tabs, palBtn), view);
  const bbar = bottomBar(() => app);
  const app = h('div', { class: 'app' }, side, main, bbar);
  app.addEventListener('click', e => { if (app.classList.contains('sideopen') && !e.target.closest('.side') && !e.target.closest('.mob-menu') && !e.target.closest('.bb-side')) app.classList.remove('sideopen'); });
  root.replaceChildren(app);
  face(faceEl, {});
  shell = { root, app, side, list, title, tabs, view, quotaEl };
  onQuota(renderQuota);
  onAccount(() => renderQuota(currentQuota()));
  refreshAccount();
  mobileTip();
  onChange(renderList);
  applyThemeButtons();
  // Schwebender Max-Assistent (überall in der App)
  import('./assistant.js').then(m => m.mountAssistant && m.mountAssistant()).catch(e => console.warn(e));
}

function renderQuota(q) {
  q = currentQuota() || q;
  const acc = getAccount();
  const limit = q?.limit || (acc?.pro ? 200 : 40), used = q?.used || 0, left = Math.max(0, limit - used);
  // Kontingent ist Systemstatus, kein Ziel: erst ab 70 % Verbrauch sichtbar
  shell.quotaEl.hidden = used < 0.7 * limit;
  shell.quotaEl.replaceChildren(
    h('div', { class: 'row' }, h('span', {}, L('KI heute', 'AI today')), h('span', {}, L(`${left} / ${limit} frei`, `${left} / ${limit} left`))),
    h('div', { class: 'bar' }, h('i', { style: { width: (100 * left / limit) + '%' } })),
    h('div', { class: 'row', style: { fontSize: '11px' } }, h('span', {}, L('Neu ab 0:00 Uhr', 'Resets at midnight')), acc?.pro ? h('span', { class: 'ic-name' }, 'Inner Circle') : h('span', {}, acc ? 'Free' : L('Inner Circle: bald', 'Inner Circle: soon'))));
}

function renderList() {
  if (!shell) return;
  const items = S.list.map(d => {
    const del = h('button', { class: 'iconbtn del', 'aria-label': L('Löschen', 'Delete'), html: ico('trash'), style: { width: '28px', height: '28px' } });
    del.addEventListener('click', async e => {
      e.preventDefault(); e.stopPropagation();
      const ok = await modal({ title: L('Skript löschen?', 'Delete these slides?'), text: L(`„${d.name}“ und alles dazu (Quizze, Karten, Chat) wird von diesem Gerät gelöscht.`, `“${d.name}” and everything that goes with it (quizzes, flashcards, chat) will be deleted from this device.`), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] });
      if (!ok) return;
      await removeDoc(d.id);
      if (location.hash.includes(d.id)) go('');
    });
    const on = S.doc && S.doc.id === d.id && !location.hash.includes('/trainer') && !location.hash.startsWith('#/app/me');
    return h('a', { class: 'doc-item' + (on ? ' on' : ''), href: `#/app/${d.id}/hub` },
      h('span', { html: ico('file') }), h('span', { class: 'nm', title: d.name }, d.name), h('span', { class: 'pg' }, d.pages.length + L(' S.', ' p.')), del);
  });
  shell.list.replaceChildren(...(items.length ? items : [h('div', { class: 'doc-item', style: { color: 'var(--faint)', cursor: 'default' } }, L('Noch nichts hochgeladen', 'Nothing uploaded yet'))]));
  $$('[data-nav="trainer"]', shell.side).forEach(a => a.classList.toggle('on', location.hash.includes('/trainer')));
  $$('[data-nav="challenge"]', shell.side).forEach(a => a.classList.toggle('on', location.hash.includes('/challenge')));
  $$('[data-nav="me"]', shell.side).forEach(a => a.classList.toggle('on', location.hash.startsWith('#/app/me') && !location.hash.startsWith('#/app/me/favs')));
  $$('[data-nav="favs"]', shell.side).forEach(a => a.classList.toggle('on', location.hash.startsWith('#/app/me/favs')));
  $$('[data-nav="rechner"]', shell.side).forEach(a => a.classList.toggle('on', location.hash.startsWith('#/app/rechner')));
  import('./me.js').then(M => { const n = (M.getMe().favs || []).length; $$('[data-favn]', shell.side).forEach(x => { x.textContent = n ? String(n) : ''; }); }).catch(() => {});
  $$('[data-lockb]', shell.side).forEach(x => { x.hidden = !!getAccount(); });
}

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
  // Trainer (ohne Skript)
  if (a === 'trainer') {
    shell.title.textContent = L('BWL-Trainer', 'Business trainer');
    shell.tabs.replaceChildren(); shell.tabs.classList.add('hidden');
    renderList();
    return show('trainer:' + (b || ''), async root => {
      const { renderTrainer } = await import('./trainer.js');
      const wrap = h('div', { class: 'view-in' }); root.appendChild(wrap);
      renderTrainer(wrap, { kind: b, onAsk: S.list.length ? text => askTutorAbout(text) : null });
    });
  }
  if (a === 'rechner') {
    shell.title.textContent = L('Rechner', 'Calculators');
    document.title = L('Rechner · BWL Max', 'Calculators · BWL Max');
    shell.tabs.replaceChildren(); shell.tabs.classList.add('hidden');
    renderList();
    return show('rechner:' + (b || ''), async root => { const { render } = await import('./views/rechner.js'); return render(root, { arg: b || '', onAsk: t => viaMax(m => m.ask(t)).then(ok => { if (!ok) askTutorAbout(t, { confirm: false }); }) }); });
  }
  if (a === 'challenge') {
    shell.title.textContent = L('Wochen-Challenge', 'Weekly challenge');
    shell.tabs.replaceChildren(); shell.tabs.classList.add('hidden');
    renderList();
    return show('challenge', async root => { const { renderChallenge } = await import('./challenge.js'); renderChallenge(root, { onLogin: () => openLogin({ title: L('Anmelden für die Challenge', 'Sign in for the challenge') }) }); });
  }
  if (a === 'me') {
    shell.title.textContent = L('Mein Bereich', 'My space');
    document.title = L('Mein Bereich · BWL Max', 'My space · BWL Max');
    shell.tabs.replaceChildren(); shell.tabs.classList.add('hidden');
    renderList();
    return show('me:' + (b || ''), async root => { const { render } = await import('./views/me.js'); return render(root, { sub: b || '', onLogin: () => openLogin({ title: L('Anmelden für deinen Bereich', 'Sign in for your space') }) }); });
  }
  if (a === 'neu') return; // Upload läuft
  if (!a) {
    const last = await lastDocId();
    const id = (last && S.list.find(d => d.id === last)) ? last : S.list[0]?.id;
    if (id) { location.replace(`#/app/${id}/hub`); return; }
    shell.title.textContent = L('Willkommen', 'Welcome');
    shell.tabs.replaceChildren(); shell.tabs.classList.add('hidden');
    renderList();
    return show('empty', root => emptyState(root));
  }
  if (!S.doc || S.doc.id !== a) {
    const d = await openDoc(a);
    if (!d) { toast(L('Dieses Skript gibt es auf diesem Gerät nicht mehr.', 'These slides are no longer on this device.')); go(''); return; }
  }
  const tab = VIEWS[b] ? b : 'hub';
  shell.title.textContent = S.doc.name;
  document.title = `${S.doc.name} · BWL Max`;
  renderTabs(a, tab);
  renderList();
  return show(`${a}:${tab}:${c || ''}`, async root => {
    const mod = await VIEWS[tab]();
    return mod.render(root, { doc: S.doc, arg: c ? decodeURIComponent(c) : null, go: (t, x) => go(`${S.doc.id}/${t}${x ? '/' + encodeURIComponent(x) : ''}`), ask: askTutorAbout });
  });
}

async function show(key, fn) {
  if (current.key === key) return;
  try { current.cleanup && current.cleanup(); } catch (e) {}
  current = { key, cleanup: null };
  const root = shell.view;
  root.replaceChildren();
  root.scrollTop = 0;
  try { const c = await fn(root); if (current.key === key) current.cleanup = typeof c === 'function' ? c : null; }
  catch (e) { console.error(e); root.replaceChildren(h('div', { class: 'empty' }, h('h2', {}, L('Da ist was schiefgelaufen.', 'Something went wrong.')), h('p', {}, String(e.message || e)), h('button', { class: 'btn', onclick: () => location.reload() }, L('Neu laden', 'Reload')))); }
}
export function forceRerender() { current.key = ''; }

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
  shell.tabs.replaceChildren();
  current.key = 'ingest';
  const target = ls.get('tutor.target', null); ls.set('tutor.target', null);
  try {
    const { intake } = await import('./intake.js');
    await intake(files, { view: shell.view, setTitle: t => { shell.title.textContent = t; }, target });
  } catch (e) {
    console.error(e);
    const f = h('div', { class: 'face' });
    shell.view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, f, h('h2', { style: { margin: 0 } }, L('Da hakt was.', 'Something’s off.')), h('div', { class: 'sub' }, e.message || L('Die Datei konnte nicht gelesen werden.', 'The file couldn’t be read.')),
      h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'center' } }, h('label', { class: 'btn primary', for: 'fileApp' }, L('Andere Datei', 'Different file')), h('button', { class: 'btn', onclick: () => startSample() }, L('Beispiel nehmen', 'Use the example'))))));
    face(f).set('sad');
  }
}

export async function startSample() {
  try { window.BM && window.BM.track('Beispiel geöffnet'); } catch (e) {}
  if (!shell) { buildShell(); await refreshList(); }
  const ex = S.list.find(d => d.sample);
  if (ex) { const t = ls.get('tutor.target', null); location.hash = t ? afterCreate(ex) : `#/app/${ex.id}/hub`; return; }
  const d = await createDoc({ name: SAMPLE.name, pages: SAMPLE.pages, chars: SAMPLE.pages.join('').length, sample: true });
  current.key = '';
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
  shell.tabs.replaceChildren();
  current.key = 'topic';
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
    current.key = '';
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

// Am Handy einmal freundlich auf Laptop/iPad hinweisen
function mobileTip() {
  if (!matchMedia('(max-width: 760px)').matches || ls.get('tutor.mobileTip')) return;
  const f = h('span', { class: 'mtf' });
  const close = () => { ls.set('tutor.mobileTip', 1); tip.classList.add('out'); setTimeout(() => tip.remove(), 300); };
  const tip = h('div', { class: 'mtip', role: 'status' }, f,
    h('p', { class: 'mtx' }, h('b', {}, L('Tipp: ', 'Tip: ')), L('Am Laptop oder iPad passt die Tafel neben den Chat.', 'On a laptop or iPad the whiteboard fits next to the chat.')),
    h('button', { class: 'iconbtn', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: close }));
  document.body.appendChild(tip);
  face(f, { follow: false });
  setTimeout(() => { if (tip.isConnected) close(); }, 9000);
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
    item('me', 'home', L('Heute', 'Today'), '#/app/me'),
    Object.assign(item('side', 'file', L('Skripte', 'Slides'), () => getApp().classList.toggle('sideopen')), { className: 'bb-i bb-side' }),
    item('trainer', 'whistle', 'Trainer', '#/app/trainer'),
    item('search', 'search', L('Suche', 'Search'), () => import('./palette.js').then(m => m.openPalette())),
    item('ich', 'lock', L('Ich', 'Me'), () => getAccount() ? openAccount() : openLogin()));
  const mark = () => { const h0 = location.hash; bar.querySelectorAll('.bb-i').forEach(x => x.classList.toggle('on', (x.dataset.bb === 'me' && h0.startsWith('#/app/me')) || (x.dataset.bb === 'trainer' && h0.startsWith('#/app/trainer')))); };
  addEventListener('hashchange', mark); mark();
  document.documentElement.classList.add('has-bbar');
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
