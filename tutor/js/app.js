// App-Rahmen: Seitenleiste mit Skripten, Tabs, Upload, Kontingent
import { $, $$, h, ico, toast, modal, ago, ls } from './util.js';
import { face } from './face.js';
import { S, refreshList, openDoc, createDoc, removeDoc, lastDocId, save, onChange, SAMPLE, mastery } from './state.js';
import { readFile, ACCEPT } from './ingest.js';
import { onQuota, currentQuota, ask, getAccount, onAccount } from './api.js';
import { accountChip, refreshAccount } from './account.js';
import { lines as maxLines, getSpice } from './max.js';
import { apiError } from './ui.js';
import { exportAll, importAll, wipe } from './db.js';
import { applyThemeButtons } from './theme.js';
import { feedbackButton } from './feedback.js';

const TABS = [
  ['hub', 'Übersicht', 'home'],
  ['tutor', 'Max', 'chat'],
  ['pfad', 'Lernpfad', 'path'],
  ['quiz', 'Quiz', 'quiz'],
  ['karten', 'Karten', 'cards'],
  ['podcast', 'Podcast', 'pod'],
  ['zettel', 'Lernzettel', 'note'],
];
const VIEWS = {
  hub: () => import('./views/hub.js'),
  tutor: () => import('./views/tutor.js'),
  pfad: () => import('./views/path.js'),
  quiz: () => import('./views/quizview.js'),
  karten: () => import('./views/cards.js'),
  podcast: () => import('./views/podcast.js'),
  zettel: () => import('./views/summary.js'),
};

let shell = null;
let current = { key: '', cleanup: null };

export function go(path) { location.hash = '#/app' + (path ? '/' + path : ''); }

function buildShell() {
  const root = $('#app');
  const fileIn = h('input', { type: 'file', class: 'sr', accept: ACCEPT, id: 'fileApp' });
  fileIn.addEventListener('change', () => { if (fileIn.files[0]) startUpload(fileIn.files[0]); fileIn.value = ''; });
  const list = h('div', { class: 'doclist' });
  const quotaEl = h('div', { class: 'quota' });
  const faceEl = h('span', { class: 'mini', style: { width: '28px', height: '28px' } });
  const side = h('aside', { class: 'side' },
    h('div', { class: 'top' },
      h('a', { class: 'brand', href: '#/' }, faceEl, 'BWL Max', h('small', {}, 'Beta')),
      h('span', { style: { flex: 1 } }),
      h('button', { class: 'iconbtn', 'data-theme-toggle': '', 'aria-label': 'Hell/Dunkel' })),
    h('div', { class: 'scroll' },
      h('label', { class: 'btn primary', for: 'fileApp', style: { width: '100%', margin: '6px 0 4px' } }, h('span', { html: ico('plus') }), 'Neue Vorlesung'), fileIn,
      h('div', { class: 'grp' }, 'Deine Skripte'), list,
      h('div', { class: 'grp' }, 'Ohne Skript'),
      h('button', { class: 'doc-item', type: 'button', onclick: async () => { const { openVoice } = await import('./voice.js'); openVoice({ doc: S.doc && location.hash.includes(S.doc.id) ? S.doc : null, onClose: () => { forceRerender(); dispatchEvent(new HashChangeEvent('hashchange')); } }); } }, h('span', { html: ico('mic') }), h('span', { class: 'nm' }, 'Mit Max sprechen')),
      h('button', { class: 'doc-item', type: 'button', onclick: () => topicPrompt() }, h('span', { html: ico('bulb') }), h('span', { class: 'nm' }, 'Max erklärt ein Thema')),
      h('a', { class: 'doc-item', href: '#/app/trainer', 'data-nav': 'trainer' }, h('span', { html: ico('calc') }), h('span', { class: 'nm' }, 'BWL-Trainer'))),
    h('div', { class: 'bottom' }, accountChip(), quotaEl,
      h('div', { style: { display: 'grid', gap: '2px' } },
        feedbackButton('btn sm ghost'),
        h('button', { class: 'btn sm ghost', onclick: settings }, 'Daten & Sicherung'))));
  const title = h('h1', {});
  const tabs = h('nav', { class: 'tabs', role: 'tablist' });
  const menuBtn = h('button', { class: 'iconbtn mob-menu', 'aria-label': 'Menü', html: ico('menu'), onclick: () => root.querySelector('.app').classList.toggle('sideopen') });
  const view = h('main', { class: 'view', id: 'view' });
  const main = h('div', { class: 'main' }, h('div', { class: 'topbar' }, menuBtn, title, tabs), view);
  const app = h('div', { class: 'app' }, side, main);
  app.addEventListener('click', e => { if (app.classList.contains('sideopen') && !e.target.closest('.side') && !e.target.closest('.mob-menu')) app.classList.remove('sideopen'); });
  root.replaceChildren(app);
  face(faceEl, {});
  shell = { root, app, side, list, title, tabs, view, quotaEl };
  onQuota(renderQuota);
  onAccount(() => renderQuota(currentQuota()));
  refreshAccount();
  mobileTip();
  onChange(renderList);
  applyThemeButtons();
}

function renderQuota(q) {
  q = currentQuota() || q;
  const acc = getAccount();
  const limit = q?.limit || (acc?.pro ? 200 : 40), used = q?.used || 0, left = Math.max(0, limit - used);
  shell.quotaEl.replaceChildren(
    h('div', { class: 'row' }, h('span', {}, 'KI heute'), h('span', {}, `${left} / ${limit} frei`)),
    h('div', { class: 'bar' }, h('i', { style: { width: (100 * left / limit) + '%' } })),
    h('div', { class: 'row', style: { fontSize: '11px' } }, h('span', {}, 'Neu ab 0:00 Uhr'), h('span', {}, acc?.pro ? 'Pro aktiv' : acc ? 'Free' : 'Pro: bald')));
}

function renderList() {
  if (!shell) return;
  const items = S.list.map(d => {
    const del = h('button', { class: 'iconbtn del', 'aria-label': 'Löschen', html: ico('trash'), style: { width: '28px', height: '28px' } });
    del.addEventListener('click', async e => {
      e.preventDefault(); e.stopPropagation();
      const ok = await modal({ title: 'Skript löschen?', text: `„${d.name}“ und alles dazu (Quizze, Karten, Chat) wird von diesem Gerät gelöscht.`, actions: [{ label: 'Abbrechen', value: false }, { label: 'Löschen', value: true, primary: true }] });
      if (!ok) return;
      await removeDoc(d.id);
      if (location.hash.includes(d.id)) go('');
    });
    const on = S.doc && S.doc.id === d.id && !location.hash.includes('/trainer');
    return h('a', { class: 'doc-item' + (on ? ' on' : ''), href: `#/app/${d.id}/hub` },
      h('span', { html: ico('file') }), h('span', { class: 'nm', title: d.name }, d.name), h('span', { class: 'pg' }, d.pages.length + ' S.'), del);
  });
  shell.list.replaceChildren(...(items.length ? items : [h('div', { class: 'doc-item', style: { color: 'var(--faint)', cursor: 'default' } }, 'Noch nichts hochgeladen')]));
  $$('[data-nav="trainer"]', shell.side).forEach(a => a.classList.toggle('on', location.hash.includes('/trainer')));
}

function renderTabs(docId, tab) {
  shell.tabs.replaceChildren(...TABS.map(([k, label, ic]) =>
    h('a', { class: 'tab' + (k === tab ? ' on' : ''), href: `#/app/${docId}/${k}`, role: 'tab', 'aria-selected': k === tab ? 'true' : 'false' }, h('span', { html: ico(ic), style: { display: 'contents' } }), h('span', {}, label))));
  shell.tabs.classList.remove('hidden');
}

export async function mountApp(parts) {
  if (!shell) { buildShell(); await refreshList(); }
  shell.app.classList.remove('sideopen');
  let [a, b, c] = parts;
  // Trainer (ohne Skript)
  if (a === 'trainer') {
    shell.title.textContent = 'BWL-Trainer';
    shell.tabs.replaceChildren(); shell.tabs.classList.add('hidden');
    renderList();
    return show('trainer:' + (b || ''), async root => {
      const { renderTrainer } = await import('./trainer.js');
      const wrap = h('div', { class: 'view-in' }); root.appendChild(wrap);
      renderTrainer(wrap, { kind: b, onAsk: S.list.length ? text => askTutorAbout(text) : null });
    });
  }
  if (a === 'neu') return; // Upload läuft
  if (!a) {
    const last = await lastDocId();
    const id = (last && S.list.find(d => d.id === last)) ? last : S.list[0]?.id;
    if (id) { location.replace(`#/app/${id}/hub`); return; }
    shell.title.textContent = 'Willkommen';
    shell.tabs.replaceChildren(); shell.tabs.classList.add('hidden');
    renderList();
    return show('empty', root => emptyState(root));
  }
  if (!S.doc || S.doc.id !== a) {
    const d = await openDoc(a);
    if (!d) { toast('Dieses Skript gibt es auf diesem Gerät nicht mehr.'); go(''); return; }
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
  catch (e) { console.error(e); root.replaceChildren(h('div', { class: 'empty' }, h('h2', {}, 'Da ist was schiefgelaufen.'), h('p', {}, String(e.message || e)), h('button', { class: 'btn', onclick: () => location.reload() }, 'Neu laden'))); }
}
export function forceRerender() { current.key = ''; }

// Aus Quiz/Trainer heraus: Frage an den Tutor schicken
export async function askTutorAbout(text, { confirm = true } = {}) {
  if (confirm) {
    const short = text.split('\n')[0].replace(/^(Ich habe diese .*?falsch (beantwortet|gelöst)) \(.*?\): /, '$1: ');
    const ok = await modal({ title: 'Soll Max dir das erklären?', text: (short.length > 160 ? short.slice(0, 157) + '…' : short), actions: [{ label: 'Nein', value: false }, { label: 'Ja, erklär’s mir · 1 Einheit', value: true, primary: true }] });
    if (!ok) return;
  }
  if (!S.doc) { const id = S.list[0]?.id; if (!id) { toast('Lade zuerst ein Skript hoch.'); return; } openDoc(id); }
  ls.set('tutor.pendingAsk', text);
  forceRerender();
  go(`${S.doc ? S.doc.id : S.list[0].id}/tutor`);
}

function emptyState(root) {
  const f = h('div', { class: 'face' });
  const lab = h('label', { class: 'btn primary lg', for: 'fileApp' }, h('span', { html: ico('upload') }), 'Skript hochladen');
  root.appendChild(h('div', { class: 'view-in' }, h('div', { class: 'empty' }, f,
    h('h2', {}, 'Was lernen wir heute?'),
    h('p', {}, 'Zieh dein Vorlesungsskript hier rein – PDF, PowerPoint oder Word. Die Datei bleibt auf deinem Gerät.'),
    h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' } }, lab,
      h('button', { class: 'btn lg', onclick: () => startSample() }, 'Beispiel ansehen'),
      h('a', { class: 'btn lg ghost', href: '#/app/trainer' }, 'Trainer')),
    topicForm({ cls: 'askbar inapp' }),
    h('button', { class: 'talklink', type: 'button', onclick: async () => { const { openVoice } = await import('./voice.js'); openVoice({}); } }, h('span', { html: ico('mic') }), 'oder einfach mit Max quatschen'))));
  face(f);
  dropAnywhere(root);
}

function dropAnywhere(el) {
  el.addEventListener('dragover', e => { e.preventDefault(); });
  el.addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) startUpload(f); });
}

// ---------- Upload ----------
export async function startUpload(file) {
  if (location.hash !== '#/app/neu') location.hash = '#/app/neu';
  if (!shell) { buildShell(); await refreshList(); }
  shell.title.textContent = 'Wird gelesen …';
  shell.tabs.replaceChildren();
  current.key = 'ingest';
  const f = h('div', { class: 'face' }), bar = h('i'), sub = h('div', { class: 'sub mono' }, file.name);
  shell.view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, f, h('h2', { style: { margin: 0, letterSpacing: '-.03em' } }, 'Max liest dein Skript …'), h('div', { class: 'bar' }, bar), sub)));
  const fc = face(f); fc.set('think');
  try {
    const r = await readFile(file, p => { bar.style.width = Math.round(p * 100) + '%'; sub.textContent = `${file.name} · ${Math.round(p * 100)} %`; });
    bar.style.width = '100%';
    fc.set('happy');
    const d = await createDoc(r);
    current.key = '';
    location.hash = `#/app/${d.id}/hub/neu`;
  } catch (e) {
    console.error(e);
    fc.set('sad');
    sub.textContent = e.message || 'Die Datei konnte nicht gelesen werden.';
    sub.after(h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'center' } },
      h('label', { class: 'btn primary', for: 'fileApp' }, 'Andere Datei'), h('button', { class: 'btn', onclick: () => startSample() }, 'Beispiel nehmen')));
  }
}

export async function startSample() {
  if (!shell) { buildShell(); await refreshList(); }
  const ex = S.list.find(d => d.sample);
  if (ex) { location.hash = `#/app/${ex.id}/hub`; return; }
  const d = await createDoc({ name: SAMPLE.name, pages: SAMPLE.pages, chars: SAMPLE.pages.join('').length, sample: true });
  current.key = '';
  location.hash = `#/app/${d.id}/hub/neu`;
}

// ---------- Einstellungen ----------
async function settings() {
  const imp = h('input', { type: 'file', accept: '.bwlmax,.json', class: 'sr' });
  const body = h('div', { style: { display: 'grid', gap: '10px' } },
    h('button', { class: 'btn', onclick: async () => { const b = await exportAll(); const a = h('a', { href: URL.createObjectURL(b), download: `BWL-Max-Sicherung-${new Date().toISOString().slice(0, 10)}.bwlmax` }); document.body.appendChild(a); a.click(); a.remove(); toast('Sicherung gespeichert – liegt in deinen Downloads.'); } }, h('span', { html: ico('download') }), 'Lernstand als Datei sichern'),
    h('label', { class: 'btn' }, imp, h('span', { html: ico('upload') }), 'Gesicherten Lernstand wiederherstellen'),
    h('button', { class: 'btn', onclick: async () => {
      const ok = await modal({ title: 'Wirklich alles löschen?', text: 'Alle Skripte, Quizze, Karten und Chats werden von diesem Gerät gelöscht. Das lässt sich nicht rückgängig machen.', actions: [{ label: 'Abbrechen', value: false }, { label: 'Alles löschen', value: true, primary: true }] });
      if (ok) { await wipe(); location.hash = '#/'; location.reload(); }
    } }, h('span', { html: ico('trash') }), 'Alles auf diesem Gerät löschen'));
  imp.addEventListener('change', async () => {
    try { const n = await importAll(imp.files[0]); await refreshList(); toast(`${n} Skript(e) wiederhergestellt.`); } catch (e) { toast('Das ist keine gültige BWL-Max-Sicherung.'); }
  });
  await modal({ title: 'Daten & Sicherung', text: 'Dein Lernstand liegt nur auf diesem Gerät. Mit „Sichern“ bekommst du eine .bwlmax-Datei in deine Downloads – die musst du nicht öffnen. Auf einem anderen Gerät (oder nach dem Löschen) wählst du sie bei „Wiederherstellen“ aus, und alles ist wieder da.', body, actions: [{ label: 'Fertig', value: true, primary: true }] });
}

// ---------- Thema ohne Skript: Max schreibt ein Kurzskript ----------
const TOPIC_EXAMPLES = ['Kapitalwertmethode', 'Latente Steuern', 'Preiselastizität', 'Break-even-Analyse', 'Abschreibungen nach HGB', 'Cournot-Oligopol', 'Leverage-Effekt', 'IFRS 16 Leasing', 'Deckungsbeitrag', 'Opportunitätskosten'];
export function topicForm({ cls = 'askbar' } = {}) {
  const inp = h('input', { class: 'tin', maxlength: 160, 'aria-label': 'Was soll Max dir erklären?', placeholder: 'Sag mir, was ich dir erklären soll …', enterkeyhint: 'go' });
  const fEl = h('span', { class: 'af' });
  const btn = h('button', { class: 'btn primary', type: 'submit' }, 'Erklär’s mir');
  const form = h('form', { class: cls }, fEl, inp, btn);
  face(fEl, {});
  form.addEventListener('submit', e => { e.preventDefault(); const t = inp.value.trim(); if (t.length < 2) { inp.focus(); return; } startTopic(t); });
  // Beispiele im Platzhalter durchtippen
  let k = Math.floor(Math.random() * TOPIC_EXAMPLES.length), stop = false;
  inp.addEventListener('focus', () => { stop = true; inp.placeholder = 'z. B. ' + TOPIC_EXAMPLES[k % TOPIC_EXAMPLES.length]; });
  (async () => {
    await new Promise(r => setTimeout(r, 2600));
    while (form.isConnected && !stop) {
      const t = 'Erklär mir … ' + TOPIC_EXAMPLES[k++ % TOPIC_EXAMPLES.length];
      for (let i = 13; i <= t.length && !stop; i++) { inp.placeholder = t.slice(0, i); await new Promise(r => setTimeout(r, 45)); }
      await new Promise(r => setTimeout(r, 2200));
      if (!stop) inp.placeholder = 'Sag mir, was ich dir erklären soll …';
      await new Promise(r => setTimeout(r, 2600));
    }
  })();
  return form;
}

async function topicPrompt() {
  const form = topicForm({ cls: 'askbar inmodal' });
  const p = modal({ title: 'Was soll Max dir erklären?', text: 'Kein Skript nötig: Max schreibt dir ein Kurzskript zum Thema – mit Beispiel, Formeln und typischen Klausurfehlern. Danach gehen Quiz, Karten, Lernpfad und Podcast wie gewohnt. 2 Einheiten.', body: form, actions: [] });
  form.addEventListener('submit', () => document.querySelector('.modal-bg')?.remove());
  setTimeout(() => form.querySelector('input')?.focus(), 80);
  return p;
}

export async function startTopic(topic) {
  if (!shell) { buildShell(); await refreshList(); }
  if (location.hash !== '#/app/neu') location.hash = '#/app/neu';
  shell.title.textContent = 'Max schreibt …';
  shell.tabs.replaceChildren();
  current.key = 'topic';
  const f = h('div', { class: 'face' }), sub = h('div', { class: 'sub' }), bar = h('i');
  shell.view.replaceChildren(h('div', { class: 'view-in' }, h('div', { class: 'ingest' }, f,
    h('h2', { style: { margin: 0, letterSpacing: '-.03em' } }, `Max schreibt dir ein Kurzskript zu „${topic}“`),
    h('div', { class: 'bar' }, bar), sub)));
  const fc = face(f); fc.set('think');
  const lines = ['Ich sortiere kurz meine Gedanken …', ...maxLines('thinking'), 'Beispiel wird durchgerechnet …', 'Ich prüfe die Zahlen zweimal …', 'Typische Klausurfehler kommen rein …'];
  let i = 0; const t0 = Date.now();
  const iv = setInterval(() => {
    if (!sub.isConnected) return clearInterval(iv);
    const s = (Date.now() - t0) / 1000;
    bar.style.width = Math.min(92, 100 * (1 - Math.exp(-s / 22))) + '%';
    if (Math.round(s * 4) % 12 === 0) sub.textContent = lines[i++ % lines.length];
  }, 250);
  sub.textContent = lines[0];
  try {
    const r = await ask('topic', { opts: { topic, spice: getSpice() } });
    const pages = (r.data?.pages || []).map(String).filter(x => x.trim().length > 20);
    if (pages.length < 2) throw Object.assign(new Error('Max hat sich verhaspelt. Versuch es nochmal.'), { code: 'format' });
    clearInterval(iv); bar.style.width = '100%'; fc.set('happy');
    const name = String(r.data.title || topic).slice(0, 80);
    const d = await createDoc({ name, pages, chars: pages.join('').length, generated: true, topic });
    current.key = '';
    ls.set('tutor.pendingAsk', `Erklär mir „${topic}“ von Grund auf – mit Beispiel an der Tafel.`);
    location.hash = `#/app/${d.id}/tutor`;
  } catch (e) {
    clearInterval(iv); fc.set('sad');
    if (e.code === 'limit') { await apiError(e); go(''); return; }
    sub.textContent = e.message || 'Das hat nicht geklappt.';
    sub.after(h('div', { style: { marginTop: '18px', display: 'flex', gap: '8px', justifyContent: 'center' } },
      h('button', { class: 'btn primary', onclick: () => startTopic(topic) }, 'Nochmal versuchen'), h('button', { class: 'btn', onclick: () => topicPrompt() }, 'Anderes Thema')));
  }
}

// Am Handy einmal freundlich auf Laptop/iPad hinweisen
function mobileTip() {
  if (!matchMedia('(max-width: 760px)').matches || ls.get('tutor.mobileTip')) return;
  const f = h('span', { class: 'mtf' });
  const close = () => { ls.set('tutor.mobileTip', 1); tip.classList.add('out'); setTimeout(() => tip.remove(), 300); };
  const tip = h('div', { class: 'mtip', role: 'status' }, f,
    h('div', {}, h('b', {}, 'Tipp von Max'), h('span', {}, 'Am Laptop oder iPad kann ich dir am besten helfen – da passt die Tafel neben den Chat. Am Handy geht aber auch alles.')),
    h('button', { class: 'iconbtn', 'aria-label': 'Schließen', html: ico('x'), onclick: close }));
  document.body.appendChild(tip);
  face(f, { follow: false });
  setTimeout(() => { if (tip.isConnected) close(); }, 14000);
}
