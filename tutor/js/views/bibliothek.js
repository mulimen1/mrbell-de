// Bibliothek: alles an einem Ort – deine Unterlagen und alles, was Max daraus gebaut hat.
// Nur Bereiche, die es wirklich gibt (kein leerer „Podcasts“-Ordner). Jeder Bereich: klare Überschrift,
// darunter nach Skript sortiert, neueste zuerst. Filter-Chips und Suche erst, wenn es etwas zu filtern gibt.
import { h, ico, ago, modal, ls, toast } from '../util.js';
import { libSwitch } from '../msswitch.js';
import { L } from '../i18n.js';
import { S, removeDoc, mastery, saveNow, refreshList, onChange } from '../state.js';
import { dueCards } from './cards.js';
import * as M from '../me.js';
import { looseBoards, setLooseBoards } from '../lib.js';
import * as E from '../export.js';
import { getAccount } from '../api.js';

const KIND = { vorlesung: L('Vorlesung', 'Lecture'), uebung: L('Übung', 'Exercise'), altklausur: L('Altklausur', 'Past exam'), mitschrift: L('Mitschrift', 'Notes'), zusammenfassung: L('Zusammenfassung', 'Summary'), sonstiges: '' };
// Reihenfolge der Bereiche
export const TYPES = [
  ['unterlagen', L('Unterlagen', 'Materials'), 'file'],
  ['mitschriften', L('Mitschriften', 'Notes'), 'pen'],
  ['videos', L('Video-Transkripte', 'Video transcripts'), 'video'],
  ['karten', L('Karteikarten', 'Flashcards'), 'cards'],
  ['quiz', L('Quiz', 'Quizzes'), 'quiz'],
  ['zettel', L('Lernzettel', 'Study sheets'), 'note'],
  ['podcasts', 'Podcasts', 'pod'],
  ['tafeln', L('Tafeln', 'Boards'), 'board'],
];
// Test (nur Bens Konto): jede Bereichsart mit eigener Icon-Farbe
const TONE = { alles: 'orange', gemerkt: 'yellow', unterlagen: 'blue', mitschriften: 'indigo', videos: 'red', karten: 'cyan', quiz: 'purple', zettel: 'yellow', podcasts: 'pink', tafeln: 'green' };
const BEN = () => !!document.documentElement.dataset.nv;
const PREVIEW = 4; // in „Alles“: so viele je Bereich, Rest über „Alle anzeigen“
const live = d => (S.doc && S.doc.id === d.id ? S.doc : d);
const NO_DOC = { id: '', name: L('Ohne Skript', 'No slides') };
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const fromHere = () => { try { sessionStorage.setItem('tutor.backTo', 'bibliothek'); } catch (e) {} };
const datum = t => (t ? new Date(t).toLocaleDateString(document.documentElement.lang === 'en' ? 'en-GB' : 'de-DE', { day: 'numeric', month: 'short' }) : '');
const short = (s, n = 44) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

async function inRoom(fn) {
  location.hash = '#/app/tutor';
  for (let k = 0; k < 40; k++) { await new Promise(r => setTimeout(r, 100)); if (document.querySelector('.asst.stage')) break; }
  try { const m = await import('../assistant.js'); const api = m.mountAssistant(); if (api) fn(api); } catch (e) {}
}

// Alle Einträge eines Bereichs
export function items(type, docs) {
  const out = [];
  for (const d of docs) {
    if (type === 'karten') (d.decks || []).forEach(x => { if (!(x.cards || []).length) return; const due = dueCards({ ...d, decks: [x] }).length; out.push({ exp: () => E.pick(E.optsDeck([x], d)), d, t: x.title, at: x.created || d.created, meta: [L(`${x.cards.length} Karten`, `${x.cards.length} cards`)], pill: due ? L(`${due} fällig`, `${due} due`) : null, hot: due > 0, href: `#/app/${d.id}/karten${x.chapter != null && d.path?.chapters?.[x.chapter] ? '/k' + x.chapter : ''}`, del: () => { d.decks = d.decks.filter(y => y !== x); } }); });
    if (type === 'quiz') (d.quizzes || []).forEach(q => { const best = q.results?.length ? Math.round(100 * Math.max(...q.results.map(r => r.score || 0))) : null; out.push({ exp: () => E.pick(E.optsQuiz(q, d)), d, t: q.title, at: q.created || d.created, ic: q.exam ? 'exam' : 'quiz', meta: [L(`${q.questions.length} Fragen`, `${q.questions.length} questions`), q.diff ? String(q.diff).replace(/^./, c => c.toUpperCase()) : null], pill: best != null ? best + ' %' : L('neu', 'new'), href: `#/app/${d.id}/quiz/q-${encodeURIComponent(q.id)}`, del: () => { d.quizzes = d.quizzes.filter(y => y !== q); } }); });
    if (type === 'zettel' && d.summary) out.push({ exp: () => E.pick(E.optsSummary(d)), d, t: d.summary.title || d.name, at: d.summary.created || d.created, meta: [(d.summary.tldr || []).length ? L(`${d.summary.tldr.length} Kernaussagen`, `${d.summary.tldr.length} key points`) : null, d.summary.len === 'lang' ? L('ausführlich', 'detailed') : d.summary.len === 'kurz' ? L('kurz', 'short') : null], href: `#/app/${d.id}/zettel`, del: () => { d.summary = null; } });
    if (type === 'podcasts') (d.podcasts || []).forEach(p => out.push({ exp: () => E.pick(E.optsPodcast(p, d)), d, t: p.title, at: p.created || d.created, meta: [p.len === 'lang' ? L('~10 Min.', '~10 min') : p.len === 'kurz' ? L('~5 Min.', '~5 min') : null, p.lang === 'en' ? 'English' : 'Deutsch'], href: `#/app/${d.id}/podcast/p-${encodeURIComponent(p.id)}`, del: () => { d.podcasts = d.podcasts.filter(y => y !== p); } }));
    if (type === 'tafeln') (d.boards || []).forEach(b => b && b.html && out.push({ exp: () => E.pick(E.optsBoards([b])), d, t: b.title || L('Tafel', 'Board'), at: b.at || d.created, meta: [b.sum || b.q || null], tip: b.q, first: true, board: b, del: () => { d.boards = d.boards.filter(y => y !== b); } }));
  }
  // Tafeln aus Gesprächen ohne Skript
  if (type === 'tafeln') looseBoards().forEach(b => b && b.html && out.push({ exp: () => E.pick(E.optsBoards([b])), d: NO_DOC, loose: true, t: b.title || L('Tafel', 'Board'), at: b.at || 0, meta: [b.sum || b.q || null], tip: b.q, first: true, board: b, del: () => setLooseBoards(looseBoards().filter(y => !(y.html === b.html && y.at === b.at))) }));
  return out.sort((a, b) => (b.at || 0) - (a.at || 0));
}

export function render(root, { tab: want = '' } = {}) {
  const wrap = h('div', { class: 'view-in sk bib' }); root.appendChild(wrap);
  { const sw = libSwitch('bibliothek'); if (sw) root.insertBefore(sw, wrap); }
  let filter = want || ls.get('tutor.bib.tab', 'alles') || 'alles', q = '';
  const setFilter = f => { filter = f; ls.set('tutor.bib.tab', f); history.replaceState(null, '', '#/app/bibliothek/' + f); draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const search = h('input', { class: 'bib-q', type: 'search', placeholder: L('Suchen – Titel, Skript, Thema …', 'Search – title, slides, topic …'), 'aria-label': L('Bibliothek durchsuchen', 'Search the library'), oninput: e => { q = e.target.value; drawBody(); } });
  const chipsEl = h('div', { class: 'bib-tabs', role: 'tablist', 'aria-label': L('Filter', 'Filter') });
  const tools = h('div', { class: 'bib-tools' }, h('div', { class: 'bib-qw' }, h('span', { html: ico('search') }), search));
  const body = h('div', { class: 'bib-list' });
  const head = h('div', { class: 'vh sk-h' },
    h('div', {}, h('div', { class: 'eyebrow' }, L('Bibliothek', 'Library')), h('h2', {}, L('Alles an einem Ort', 'Everything in one place')),
      h('p', {}, L('Deine Unterlagen und alles, was Max daraus für dich gebaut hat.', 'Your materials and everything Max built from them for you.'))),
    h('label', { class: 'btn primary', for: 'fileApp' }, h('span', { html: ico('plus') }), L('Neuer Stoff', 'Add material')));
  // Test Ben: Kopf wie bei den Klausur-Tools – große Überschrift, Text auf Karte, oranger Knopf
  const benHead = () => h('div', { class: 'nvp-bh' },
    h('div', { class: 'kt-head' }, h('div', { class: 'eyebrow' }, L('Fächer & Bibliothek', 'Subjects & library')), h('h1', {}, L('Dein Stoff. ', 'Your material. '), h('span', {}, L('Alles an einem Ort.', 'All in one place.')))),
    h('div', { class: 'nvp-bhr' }, h('p', { class: 'nvp-lead' }, L('Deine Unterlagen und alles, was Max daraus für dich gebaut hat – sauber nach Fach und Skript sortiert.', 'Your materials and everything Max built from them – neatly sorted by subject and slides.')),
      h('label', { class: 'kt-go nvp-go', for: 'fileApp' }, h('span', { html: ico('plus') }), L('Neuer Stoff', 'Add material'))));
  if (BEN()) wrap.classList.add('nvp-bib');
  wrap.append(BEN() ? benHead() : head, chipsEl, tools, body);

  let data = {};
  function collect() {
    const docs = S.list.map(live);
    data = { docs };
    TYPES.forEach(([k]) => { data[k] = k === 'unterlagen' ? docs.filter(d => !d.ms && d.kind !== 'video') : k === 'videos' ? docs.filter(d => d.kind === 'video').sort((a, b) => (b.created || 0) - (a.created || 0)) : k === 'mitschriften' ? docs.filter(d => d.ms).sort((a, b) => (b.used || b.created || 0) - (a.used || a.created || 0)) : items(k, docs); });
  }
  const present = () => TYPES.filter(([k]) => data[k].length);
  const made = () => present().filter(([k]) => k !== 'unterlagen' && k !== 'mitschriften' && k !== 'videos');

  function draw() {
    if (!wrap.isConnected) return;
    collect();
    const have = present();
    // Gemerkt (alles mit Stern) ist ein eigener Bereich der Bibliothek – mit Konto immer da
    const favN = getAccount() ? M.getMe().favs.length : -1;
    const fav = favN >= 0 ? [['gemerkt', L('Gemerkt', 'Saved'), 'star']] : [];
    data.gemerkt = { length: Math.max(0, favN) };
    if (filter !== 'alles' && !have.some(([k]) => k === filter) && !(filter === 'gemerkt' && fav.length)) filter = 'alles';
    // Chips nur, wenn es mehr als einen Bereich gibt; Suche nur, wenn es etwas zu suchen gibt
    const all = [...fav, ...have];
    const one = all.length < 2 && filter !== 'gemerkt';
    chipsEl.hidden = one;
    chipsEl.replaceChildren(...(one ? [] : [['alles', L('Alles', 'All'), 'grid'], ...all].map(([k, t, ic]) => h('button', { type: 'button', role: 'tab', class: 'bib-tab' + (k === filter ? ' on' : ''), 'data-tone': BEN() ? TONE[k] : null, 'aria-selected': k === filter ? 'true' : 'false', onclick: () => k !== filter && setFilter(k) },
      k === 'alles' ? (BEN() ? h('span', { html: ico('apps') }) : null) : h('span', { html: ico(ic) }), h('span', {}, t), k === 'alles' ? null : h('small', {}, String(data[k].length))))));
    const total = have.reduce((a, [k]) => a + data[k].length, 0);
    tools.hidden = total < 4 || filter === 'gemerkt';
    if (tools.hidden && q) { q = ''; search.value = ''; }
    drawBody();
  }

  async function del(it) {
    const ok = await modal({ title: L('Wirklich löschen?', 'Really delete?'), text: L(`„${it.t}“ wird von diesem Gerät gelöscht.`, `“${it.t}” will be deleted from this device.`), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] });
    if (!ok) return;
    it.del(); if (!it.loose) await saveNow(it.d); await refreshList(); draw(); toast(L('Gelöscht', 'Deleted'));
  }

  // ---------- Zeilen ----------
  const itemRow = (it, ic, showDoc) => {
    // Tafel: direkt als Tafel ansehen (blättern durch die Tafeln desselben Skripts) – nicht in den Chat springen
    const open = it.board ? () => { const list = it.loose ? looseBoards() : (it.d.boards || []); const l = list.filter(b => b && b.html); import('../boardview.js').then(m => m.openBoardView(l, Math.max(0, l.findIndex(b => b === it.board || (b.title === it.board.title && b.html === it.board.html))), { docName: it.loose ? '' : it.d.name })); } : () => { fromHere(); location.hash = it.href; };
    return h('div', { class: 'sk-r bib-r', role: 'link', tabindex: 0, onclick: open, onkeydown: e => { if (e.key === 'Enter') open(); } },
      h('span', { class: 'sk-i', html: ico(it.ic || ic) }),
      h('span', { class: 'sk-t', title: it.tip ? L('Deine Frage: ', 'Your question: ') + it.tip : null }, h('b', {}, it.t), h('small', {}, (it.first ? [...it.meta, showDoc ? short(it.d.name, 36) : null] : [showDoc ? short(it.d.name, 36) : null, ...it.meta]).filter(Boolean).join(' · ') || ' ')),
      it.pill ? h('span', { class: 'bib-p' + (it.hot ? ' hot' : '') }, it.pill) : h('span'),
      h('span', { class: 'bib-d', title: it.at ? new Date(it.at).toLocaleString() : '' }, datum(it.at)),
      it.exp ? h('button', { class: 'iconbtn sk-dl', type: 'button', 'aria-label': L('Herunterladen', 'Download'), title: L('Herunterladen', 'Download'), html: ico('download'), onclick: e => { e.stopPropagation(); it.exp(); } }) : h('span'),
      h('button', { class: 'iconbtn sk-del', type: 'button', 'aria-label': L('Löschen', 'Delete'), html: ico('trash'), onclick: e => { e.stopPropagation(); del(it); } }));
  };
  const docRow = d => {
    const due = dueCards(d).length, m = mastery(d);
    const n = (d.decks || []).length + (d.quizzes || []).length + (d.summary ? 1 : 0) + (d.podcasts || []).length;
    const delB = h('button', { class: 'iconbtn sk-del', type: 'button', 'aria-label': L('Löschen', 'Delete'), html: ico('trash'), onclick: async e => { e.preventDefault(); e.stopPropagation(); const ok = await modal({ title: L('Skript löschen?', 'Delete these slides?'), text: L(`„${d.name}“ und alles dazu (Quizze, Karten, Chat) wird von diesem Gerät gelöscht.`, `“${d.name}” and everything with it (quizzes, flashcards, chat) will be deleted from this device.`), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] }); if (ok) { await removeDoc(d.id); draw(); } } });
    return h('a', { class: 'sk-r', href: d.ms ? `#/app/mitschrift/${d.id}` : `#/app/${d.id}/hub`, onclick: fromHere },
      h('span', { class: 'sk-i', html: ico(d.ms ? 'pen' : (d.media || d.video) ? 'video' : d.generated ? 'bulb' : 'file') }),
      h('span', { class: 'sk-t' }, h('b', {}, d.name), h('small', {}, [d.ms && d.ms.draft ? L('Entwurf', 'Draft') : null, KIND[d.kind] || (d.generated ? L('Kurzskript', 'Short script') : d.sample ? L('Beispiel', 'Example') : ''), (d.video ? [{ youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram' }[d.video.platform] || 'Video', d.video.dur ? `${Math.floor(d.video.dur / 60)}:${String(Math.round(d.video.dur % 60)).padStart(2, '0')}` : null].filter(Boolean).join(' · ') : d.pages?.length === 1 ? L('1 Seite', '1 page') : (d.pages?.length || 0) + L(' Seiten', ' pages')), n ? L(`${n} erstellt`, `${n} made`) : null, L('geöffnet ', 'opened ') + ago(d.used || d.created)].filter(Boolean).join(' · '))),
      due ? h('span', { class: 'zb', title: L('fällige Karten', 'cards due') }, String(due)) : h('span'),
      h('span', { class: 'sk-m', title: L('Lernstand', 'Progress') }, h('span', { class: 'zr' }, h('i', { style: { width: m + '%' } })), h('small', {}, m + ' %')),
      h('button', { class: 'iconbtn sk-dl', type: 'button', 'aria-label': L('Alles zu diesem Skript herunterladen', 'Download everything for these slides'), title: L('Herunterladen', 'Download'), html: ico('download'), onclick: e => { e.preventDefault(); e.stopPropagation(); E.pick(E.optsDoc(d)); } }),
      delB);
  };

  // Ein Bereich: Überschrift, darunter nach Skript gruppiert (neueste Gruppe zuerst)
  function section(k, t, ic, list, { limit = 0 } = {}) {
    const all = list;
    const shown = limit ? all.slice(0, limit) : all;
    const sec = (...kids) => h('section', { class: 'bib-sec', 'data-tone': BEN() ? TONE[k] : null }, ...kids);
    const headEl = h('div', { class: 'bib-sh' }, h('span', { class: 'bib-si', html: ico(ic) }), h('h3', {}, t), h('small', {}, String(all.length)), h('span', { style: { flex: 1 } }),
      limit && all.length > limit ? h('button', { class: 'bib-more', type: 'button', onclick: () => setFilter(k) }, L(`Alle ${all.length} anzeigen`, `Show all ${all.length}`), h('span', { html: ico('right') })) : null);
    if (k === 'unterlagen') return sec(headEl, docGroups(shown));
    if (k === 'mitschriften' || k === 'videos') return sec(headEl, h('div', { class: 'sk-g' }, shown.map(docRow)));
    const byDoc = new Map();
    shown.forEach(it => { if (!byDoc.has(it.d.id)) byDoc.set(it.d.id, []); byDoc.get(it.d.id).push(it); });
    const multi = byDoc.size > 1 && !limit;
    const groups = [...byDoc.values()].map(g => h('div', { class: 'sk-g' },
      multi ? h('div', { class: 'zh' }, h('b', {}, short(g[0].d.name, 60)), h('small', {}, g.length === 1 ? L('1 Eintrag', '1 item') : L(`${g.length} Einträge`, `${g.length} items`))) : null,
      g.map(it => itemRow(it, ic, !multi))));
    return sec(headEl, multi ? groups : h('div', { class: 'sk-g' }, shown.map(it => itemRow(it, ic, true))));
  }
  function docGroups(docs) {
    const me = M.getMe();
    const groups = me.faecher.map(f => ({ f, ds: docs.filter(d => (f.docs || []).includes(d.id)) })).filter(g => g.ds.length)
      .sort((a, b) => (a.f.klausur || '9999') < (b.f.klausur || '9999') ? -1 : 1);
    const loose = docs.filter(d => !M.fachOf(d.id));
    if (!groups.length) return h('div', { class: 'sk-g' }, loose.map(docRow));
    const exSub = f => { if (!f.klausur) return ''; const n = Math.round((new Date(f.klausur + 'T12:00') - new Date(M.dayKey() + 'T12:00')) / 864e5); return n < 0 ? M.artName(f.klausurArt) + L(' vorbei', ' over') : `${M.artName(f.klausurArt)} ${n === 0 ? L('heute', 'today') : L(`in ${n} ${n === 1 ? 'Tag' : 'Tagen'}`, `in ${n} day${n === 1 ? '' : 's'}`)}`; };
    const grp = (title, sub, ds) => h('div', { class: 'sk-g' }, h('div', { class: 'zh' }, h('b', {}, title), sub ? h('small', {}, sub) : null), ds.map(docRow));
    return h('div', { class: 'bib-dg' }, groups.map(g => grp(g.f.name, exSub(g.f), g.ds)), loose.length ? grp(L('Ohne Fach', 'No subject'), L('in „Fächer“ zuordnen', 'assign under “Subjects”'), loose) : null);
  }

  function drawBody() {
    if (!wrap.isConnected) return;
    if (filter === 'gemerkt') { const el = h('div', { class: 'bib-favs' }); body.replaceChildren(el); import('./me.js').then(m => m.favsPane(el)); return; }
    // Noch gar nichts hochgeladen
    if (!data.docs.length && !made().length) {
      if (BEN()) { body.replaceChildren(benEmpty(), intro()); return; }
      body.replaceChildren(h('div', { class: 'sk-empty' }, h('label', { class: 'sk-drop', for: 'fileApp' }, h('span', { html: ico('upload') }), h('b', {}, L('Datei, Foto oder Screenshot hier rein', 'Drop a file, photo or screenshot here')), matchMedia('(pointer: coarse), (max-width: 600px)').matches ? null : h('small', {}, L('oder in der App einfach ⌘V / Strg+V', 'or just ⌘V / Ctrl+V in the app'))),
        h('button', { class: 'btn', type: 'button', onclick: () => import('../app.js').then(m => m.topicPrompt()) }, h('span', { html: ico('bulb') }), L('Kein Skript? Nenn mir ein Thema', 'No slides? Give me a topic'))),
        intro());
      return;
    }
    const nq = norm(q.trim());
    const match = (k, it) => !nq || norm(k === 'unterlagen' || k === 'mitschriften' || k === 'videos' ? it.name + ' ' + (M.fachOf(it.id)?.name || '') : it.t + ' ' + it.d.name + ' ' + it.meta.join(' ')).includes(nq);
    const show = TYPES.filter(([k]) => (filter === 'alles' || filter === k)).map(([k, t, ic]) => [k, t, ic, data[k].filter(it => match(k, it))]).filter(x => x[3].length);
    if (!show.length) { body.replaceChildren(h('div', { class: 'bib-none' }, L('Nichts gefunden.', 'Nothing found.'))); return; }
    const out = show.map(([k, t, ic, list]) => section(k, t, ic, list, { limit: filter === 'alles' && !nq ? PREVIEW : 0 }));
    // Noch nichts erstellt? Kurz erklären, was hier landet – statt leerer Ordner
    if (filter === 'alles' && !nq && !made().length) out.push(intro());
    body.replaceChildren(...out);
  }

  // Test Ben: leerer Zustand als Hero-Karte – links erklären + Knöpfe, rechts die Ablagefläche
  function benEmpty() {
    const touch = matchMedia('(pointer: coarse), (max-width: 600px)').matches;
    return h('section', { class: 'nvp-empty' },
      h('div', { class: 'nvp-el' },
        h('span', { class: 'nvp-eb' }, h('span', { class: 'nvp-ebi', html: ico('library') }), L('Noch leer', 'Still empty')),
        h('h2', {}, L('Lad deinen ersten Stoff hoch', 'Upload your first material')),
        h('p', {}, L('Skript, Altklausur, Mitschrift oder einfach ein Foto vom Tafelbild – Max liest alles und baut dir daraus Karteikarten, Quizze und Lernzettel.', 'Slides, past exam, notes or just a photo of the board – Max reads it all and builds flashcards, quizzes and study sheets from it.')),
        h('div', { class: 'kt-btns' },
          h('label', { class: 'kt-go nvp-go', for: 'fileApp' }, h('span', { html: ico('upload') }), L('Datei auswählen', 'Choose file')),
          h('button', { class: 'kt-sec nvp-sec', type: 'button', onclick: () => import('../app.js').then(m => m.topicPrompt()) }, h('span', { html: ico('bulb') }), L('Kein Skript? Nenn mir ein Thema', 'No slides? Give me a topic')))),
      h('label', { class: 'sk-drop nvp-drop', for: 'fileApp' }, h('span', { class: 'nvp-dri', html: ico('upload') }), h('b', {}, L('Datei, Foto oder Screenshot hier rein', 'Drop a file, photo or screenshot here')),
        h('small', {}, touch ? L('PDF, PowerPoint, Word oder Foto', 'PDF, PowerPoint, Word or photo') : L('PDF, PowerPoint, Word, Foto – oder einfach ⌘V / Strg+V', 'PDF, PowerPoint, Word, photo – or just ⌘V / Ctrl+V'))));
  }
  // Erklärung, solange Max noch nichts erstellt hat
  function intro() {
    if (BEN()) {
      const kinds = [['cards', 'cyan', L('Karteikarten', 'Flashcards'), L('Wiederholung genau dann, wenn du sie brauchst', 'Reviews exactly when you need them')], ['quiz', 'purple', L('Quizze', 'Quizzes'), L('Klausurfragen mit Erklärung zu jeder Antwort', 'Exam questions, every answer explained')], ['note', 'yellow', L('Lernzettel', 'Study sheets'), L('Das Wichtigste auf einer Seite', 'The essentials on one page')], ['pod', 'pink', 'Podcasts', L('Dein Stoff zum Anhören, unterwegs', 'Your material to listen to on the go')], ['board', 'blue', L('Tafelbilder', 'Boards'), L('Erklärungen von Max, gespeichert', 'Max’s explanations, saved')]];
      return h('section', { class: 'nvp-intro' },
        h('div', { class: 'nvp-ih' }, h('h3', {}, L('Hier landet alles, was Max für dich erstellt', 'Everything Max makes for you lands here')), h('p', {}, L('Automatisch gespeichert und nach Skript sortiert – sobald du das Erste erstellst, taucht es hier auf.', 'Saved automatically and sorted by slides – as soon as you create your first one, it shows up here.'))),
        h('div', { class: 'nvp-kinds' }, kinds.map(([ic, tone, t, sub]) => h('div', { class: 'nvp-kind', 'data-tone': tone }, h('span', { class: 'nvp-ki', html: ico(ic) }), h('b', {}, t), h('small', {}, sub)))),
        data.docs.length ? h('a', { class: 'kt-go nvp-go', href: '#/app/lernen' }, h('span', { html: ico('spark') }), L('Jetzt etwas erstellen', 'Create something now')) : null);
    }
    const kinds = [['cards', L('Karteikarten', 'Flashcards')], ['quiz', L('Quizze', 'Quizzes')], ['note', L('Lernzettel', 'Study sheets')], ['pod', 'Podcasts'], ['board', L('Tafelbilder', 'Boards')]];
    return h('div', { class: 'bib-intro' },
      h('div', { class: 'bib-ik' }, kinds.map(([ic, t]) => h('span', { class: 'bib-kc' }, h('span', { html: ico(ic) }), t))),
      h('h3', {}, L('Hier landet alles, was Max für dich erstellt', 'Everything Max makes for you lands here')),
      h('p', {}, L('Karteikarten, Quizze, Lernzettel, Podcasts und Tafelbilder – automatisch gespeichert und sauber nach Skript sortiert. Sobald du das Erste erstellst, taucht es hier auf.', 'Flashcards, quizzes, study sheets, podcasts and boards – saved automatically and neatly sorted by slides. As soon as you create your first one, it shows up here.')),
      data.docs.length ? h('a', { class: 'btn primary', href: '#/app/lernen' }, h('span', { html: ico('spark') }), L('Jetzt etwas erstellen', 'Create something now')) : null);
  }

  history.replaceState(null, '', '#/app/bibliothek' + (filter !== 'alles' ? '/' + filter : ''));
  draw();
  // Von der Startseite („Bereits erstellt“) gekommen: genau diesen Eintrag zeigen und kurz aufleuchten lassen
  try {
    const hl = sessionStorage.getItem('tutor.bib.hl');
    if (hl) { sessionStorage.removeItem('tutor.bib.hl'); setTimeout(() => { const r = [...wrap.querySelectorAll('.bib-r, .sk-r')].find(x => x.textContent.includes(hl)); if (r) { r.scrollIntoView({ behavior: 'smooth', block: 'center' }); r.classList.add('bib-hl'); setTimeout(() => r.classList.remove('bib-hl'), 2600); } }, 250); }
  } catch (e) {}
  if (filter === 'alles' && location.hash !== '#/app/bibliothek') history.replaceState(null, '', '#/app/bibliothek');
  // Gleiche Seite, anderer Filter in der Adresse (z. B. Link auf …/bibliothek/tafeln)
  const onHash = () => { const m = location.hash.match(/^#\/app\/bibliothek(?:\/([a-z]+))?$/); if (m && m[1] && m[1] !== filter) { filter = m[1]; ls.set('tutor.bib.tab', filter); draw(); } };
  addEventListener('hashchange', onHash);
  const offMe = M.onMe(() => draw());
  let t = 0; const offS = onChange(() => { clearTimeout(t); t = setTimeout(draw, 80); });
  return () => { clearTimeout(t); removeEventListener('hashchange', onHash); typeof offMe === 'function' && offMe(); typeof offS === 'function' && offS(); };
}
