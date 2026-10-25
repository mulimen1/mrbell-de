// Videos → Lernstoff: Link von YouTube (auch Shorts), TikTok oder Instagram einfügen – oder eigene Datei hochladen.
// Max schreibt ab (Server: Hub /api/bwlmax/video, 3 pro Tag kostenlos), erkennt die Sprache und macht daraus,
// was man will: Lernzettel, Mitschrift im Füller-Look, Karteikarten, Quiz, Podcast, Erklärung.
import { h, ico, toast, ls } from '../util.js';
import { L } from '../i18n.js';
import { S, createDoc, save, onChange } from '../state.js';
import { getAccount, getSession } from '../api.js';
import { askLang, langPicker, langName, detectLang } from '../srclang.js';

const HUB = 'https://hub.mrbell.de/api/bwlmax/video';
const LOGO = p => h('img', { class: 'vt-logo vt-' + p, src: `/tutor/img/brands/${p}.svg`, alt: { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram' }[p] || p, width: 20, height: 20 });
export const brandRow = () => h('span', { class: 'vt-brands', 'aria-hidden': 'true' }, LOGO('youtube'));
const mmss = s => { s = Math.max(0, Math.round(s || 0)); const hh = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = String(s % 60).padStart(2, '0'); return hh ? `${hh}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`; };
const PLAT = { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram' };
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Gleiche Video-ID wie der Server (nur zum Wiedererkennen bereits abgeschriebener Videos)
export function videoKey(raw) {
  let u; try { u = new URL(String(raw || '').trim()); } catch (e) { return ''; }
  const host = u.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, ''), seg = u.pathname.split('/').filter(Boolean);
  if (host === 'youtube.com' || host === 'music.youtube.com') { const id = seg[0] === 'watch' ? u.searchParams.get('v') : ['shorts', 'live', 'embed', 'v'].includes(seg[0]) ? seg[1] : ''; return /^[\w-]{11}$/.test(id || '') ? 'youtube:' + id : ''; }
  if (host === 'youtu.be') return /^[\w-]{11}$/.test(seg[0] || '') ? 'youtube:' + seg[0] : '';
  if (host === 'tiktok.com') { const i = seg.indexOf('video'); return i >= 0 && /^\d{8,25}$/.test(seg[i + 1] || '') ? 'tiktok:' + seg[i + 1] : ''; }
  if (host === 'vm.tiktok.com' || host === 'vt.tiktok.com') return seg[0] ? 'tiktok:s:' + seg[0] : '';
  if (host === 'instagram.com') { const k = ['reel', 'reels', 'p', 'tv'].includes(seg[0]) ? 0 : ['reel', 'reels', 'p', 'tv'].includes(seg[1]) ? 1 : -1; return k >= 0 && seg[k + 1] ? 'instagram:' + seg[k + 1] : ''; }
  return '';
}
const keyOf = d => (d && d.video && d.video.platform ? d.video.platform + ':' + d.video.id : '');

async function hub(op, extra) {
  const r = await fetch(HUB, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(Object.assign({ session: getSession() || '', op }, extra || {})), cache: 'no-store' });
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (!j.fehler && !j.ok && r.status >= 400) j.fehler = L('Das hat gerade nicht geklappt.', 'That didn’t work just now.');
  return j;
}

// Was man aus dem Transkript machen kann (nur echte, vorhandene Werkzeuge)
const MAKE = [
  ['zettel', 'note', L('Lernzettel', 'Study sheet'), L('Zusammenfassung auf einer Seite', 'Summary on one page')],
  ['mitschrift', 'pen', L('Mitschrift', 'Notes'), L('Sauber, im Füller-Look', 'Clean, fountain-pen look')],
  ['erklaeren', 'board', L('Erklärung', 'Explanation'), L('Max erklärt’s an der Tafel', 'Max explains on the board')],
  ['pfad', 'path', L('Lernpfad', 'Study path'), L('Kapitel für Kapitel', 'Chapter by chapter')],
  ['karten', 'cards', L('Karteikarten', 'Flashcards'), L('Zum Abfragen', 'To quiz yourself')],
  ['quiz', 'quiz', 'Quiz', L('Mit Erklärung', 'With explanations')],
  ['podcast', 'headphones', 'Podcast', L('Zum Anhören', 'To listen to')],
];

function toText(lines) { return lines.map(l => `[${mmss(l.t)}] ${l.x}`).join('\n'); }
function toPages(lines) {
  const pages = []; let cur = '';
  for (const l of lines) { const t = `[${mmss(l.t)}] ${l.x}\n`; if (cur.length + t.length > 3200 && cur) { pages.push(cur.trim()); cur = ''; } cur += t; }
  if (cur.trim()) pages.push(cur.trim());
  return pages.length ? pages : [''];
}

// Transkript in einer bestimmten Sprache holen (falls es die Spur gibt); zählt am selben Tag nicht doppelt
async function relang(d, c) {
  const v = d.video; if (!v || !v.url) return false;
  if ((v.lang || '').slice(0, 2) === c) return true;
  const { modal } = await import('../util.js');
  const a = await modal({ title: L(`Transkript auf ${langName(c)} neu holen?`, `Fetch the transcript in ${langName(c)}?`), text: L('Das zählt als ein Video-Transkript für heute. Ohne neues Transkript erstelle ich dir alles Neue trotzdem auf ' + langName(c) + '.', 'This counts as one video transcript for today. Without it, I’ll still create everything new in ' + langName(c) + '.'),
    actions: [{ label: L('Nur Inhalte umstellen', 'Just switch outputs'), value: 'no' }, { label: L('Ja, neu holen', 'Yes, fetch it'), value: 'yes', primary: true }] });
  if (a !== 'yes') return false;
  toast(L(`Ich hol das Transkript auf ${langName(c)} …`, `Fetching the transcript in ${langName(c)} …`), 2500);
  const j = await hub('start', { url: v.url, lang: c }).catch(() => ({}));
  let r = j;
  if (j.ok && j.job) { for (let k = 0; k < 200 && r.ok && !r.done; k++) { await new Promise(x => setTimeout(x, 2500)); r = await hub('status', { job: j.job }); } }
  if (!r.ok || !r.done || !r.data || !(r.data.lines || []).length) { toast(r.fehler || L('Das hat nicht geklappt.', 'That didn’t work.'), 4500); return false; }
  if (r.data.langMissing) { toast(L(`Für dieses Video gibt es kein Transkript auf ${langName(c)}. Alles, was ich daraus erstelle, schreibe ich dir trotzdem auf ${langName(c)}.`, `There’s no ${langName(c)} transcript for this video. Everything I create from it will still be in ${langName(c)}.`), 5500); return false; }
  d.video = r.data; d.pages = toPages(r.data.lines); d.chars = r.data.lines.reduce((a, l) => a + l.x.length, 0); d.srcLang = c; save(d);
  return true;
}

// Ergebnis „machen“: vorhandene Werkzeuge mit genau diesem Transkript
function make(d, kind) {
  try { sessionStorage.setItem('tutor.backTo', 'video'); sessionStorage.setItem('tutor.vidOpen', d.id); } catch (e) {}
  if (kind === 'mitschrift') {
    try { sessionStorage.setItem('tutor.msImport', JSON.stringify({ text: (d.pages || []).join('\n\n').slice(0, 30000), lang: d.outLang || d.srcLang || '', name: d.name })); } catch (e) {}
    location.hash = '#/app/mitschrift'; return;
  }
  if (kind === 'erklaeren') {
    ls.set('tutor.room.focus', [d.id]); ls.set('tutor.room.focusAt', Date.now());
    ls.set('tutor.pendingAsk', L('Erklär mir die wichtigsten Inhalte aus diesem Video an der Tafel – Schritt für Schritt, mit Beispiel.', 'Explain the key content of this video on the board – step by step, with an example.'));
    location.hash = '#/app/tutor'; return;
  }
  const tab = { zettel: 'zettel', pfad: 'pfad', karten: 'karten', quiz: 'quiz', podcast: 'podcast' }[kind];
  location.hash = `#/app/${d.id}/${tab}/auto`;
}

// Transkript als PDF (Druckansicht → „Als PDF sichern“)
function pdf(d) {
  const v = d.video || {}, lines = v.lines || [];
  const w = window.open('', '_blank'); if (!w) { toast(L('Bitte Pop-ups für bwlmax.de erlauben.', 'Please allow pop-ups for bwlmax.de.')); return; }
  w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(d.name)}</title><style>
    body{font:15px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111;max-width:760px;margin:40px auto;padding:0 24px}
    h1{font-size:22px;margin:0 0 4px} .m{color:#666;font-size:13px;margin:0 0 24px} p{margin:0 0 10px} b{color:#555;font-variant-numeric:tabular-nums;font-weight:600;margin-right:8px}
    .f{margin-top:28px;color:#999;font-size:12px}</style></head><body>
    <h1>${esc(d.name)}</h1><p class="m">${esc(PLAT[v.platform] || L('Datei', 'File'))}${v.author ? ' · ' + esc(v.author) : ''}${v.dur ? ' · ' + mmss(v.dur) : ''}${v.url ? ' · ' + esc(v.url) : ''}</p>
    ${lines.map(l => `<p><b>${mmss(l.t)}</b>${esc(l.x)}</p>`).join('')}
    <p class="f">Transkript erstellt mit BWL Max · bwlmax.de · nur für eigene Lernzwecke</p>
    <script>setTimeout(()=>print(),300)<\/script></body></html>`);
  w.document.close();
}

// Vollbild-Ansicht
function full(d) {
  const v = d.video || {};
  const close = () => { try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} bg.remove(); removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  const copy = async () => { try { await navigator.clipboard.writeText(toText(v.lines || [])); toast(L('Transkript kopiert.', 'Transcript copied.')); } catch (e) { toast(L('Kopieren ging nicht.', 'Copy failed.')); } };
  const body = h('div', { class: 'vt-fbody' }, (v.lines || []).map(l => h('p', {}, h('span', { class: 'vt-ts' }, mmss(l.t)), l.x)));
  const bg = h('div', { class: 'vt-full', role: 'dialog', 'aria-modal': 'true' },
    h('div', { class: 'vt-fhead' },
      h('div', { class: 'vt-fti' }, v.platform ? LOGO(v.platform) : h('span', { html: ico('file') }), h('b', {}, d.name)),
      h('div', { class: 'vt-fact' },
        h('button', { class: 'btn sm', type: 'button', onclick: copy }, h('span', { html: ico('check') }), L('Kopieren', 'Copy')),
        h('button', { class: 'btn sm', type: 'button', onclick: () => pdf(d) }, h('span', { html: ico('download') }), 'PDF'),
        h('button', { class: 'btn sm', type: 'button', onclick: () => { try { document.fullscreenElement ? document.exitFullscreen() : bg.requestFullscreen(); } catch (e) {} } }, h('span', { html: ico('expand') }), L('Vollbild', 'Full screen')),
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: close }))),
    body);
  document.body.append(bg); addEventListener('keydown', onKey);
}

// Marken-Hinweis als kleines i neben der Überschrift (Hover/Klick öffnet die Erklärung daneben)
const tmInfo = txt => { const pop = h('span', { class: 'tm-pop', role: 'tooltip' }, txt); const b = h('button', { class: 'tm-i', type: 'button', 'aria-label': L('Hinweis zu Marken', 'Trademark notice'), 'aria-expanded': 'false', onclick: e => { e.stopPropagation(); const on = !w.classList.contains('on'); w.classList.toggle('on', on); b.setAttribute('aria-expanded', String(on)); if (on) setTimeout(() => addEventListener('click', () => { w.classList.remove('on'); b.setAttribute('aria-expanded', 'false'); }, { once: true }), 0); } }, 'i'); const place = () => { const r = b.getBoundingClientRect(), W = Math.min(300, innerWidth - 24); pop.style.width = W + 'px'; let x = r.right + 10, y = r.top + r.height / 2 - 40; if (x + W > innerWidth - 12) { x = Math.max(12, Math.min(r.left + r.width / 2 - W / 2, innerWidth - W - 12)); y = r.bottom + 8; } const o = w.getBoundingClientRect(); pop.style.left = (x - o.left) + 'px'; pop.style.top = (Math.max(8, y) - o.top) + 'px'; }; const w = h('span', { class: 'tm-w', onmouseenter: place }, b, pop); b.addEventListener('click', place); b.addEventListener('focus', place); return w; };
const TM = L('YouTube ist eine Marke von Google LLC. BWL Max steht in keiner Verbindung zu YouTube oder Google und wird von ihnen weder unterstützt noch gesponsert.', 'YouTube is a trademark of Google LLC. BWL Max is not affiliated with, endorsed or sponsored by YouTube or Google.');
export function render(root) {
  const wrap = h('div', { class: 'view-in vt' }); root.appendChild(wrap);
  setTimeout(() => wrap.appendChild(h('p', { class: 'foot-tm' }, TM)), 0);
  const fileIn = h('input', { type: 'file', class: 'sr', multiple: true, accept: '.pdf,.pptx,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.heic,.heif,application/pdf,image/*,video/*,audio/*,.mp4,.mov,.m4v,.m4a,.mp3,.wav' });
  fileIn.addEventListener('change', () => { const fl = [...(fileIn.files || [])]; fileIn.value = ''; if (fl.length) upload(fl); });
  const url = h('input', { class: 'vt-url', type: 'url', inputmode: 'url', placeholder: L('YouTube-Link einfügen – auch Shorts', 'Paste a YouTube link – Shorts too'), 'aria-label': L('Video-Link', 'Video link') });
  const go = h('button', { class: 'btn primary vt-go', type: 'button', onclick: () => start() }, L('Abschreiben', 'Transcribe'));
  url.addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
  url.addEventListener('paste', () => setTimeout(() => { if (/^https?:\/\//.test(url.value.trim())) start(); }, 60));
  // Von Max aus dem Chat geschickt („mach mir aus dem Video …“): Link steht schon drin und läuft sofort los
  try { const pre = sessionStorage.getItem('tutor.vid.url'); if (pre) { sessionStorage.removeItem('tutor.vid.url'); url.value = pre; setTimeout(() => start(), 350); } } catch (e) {}
  const status = h('div', { class: 'vt-status', hidden: true, role: 'status' });
  const quotaEl = h('small', { class: 'vt-quota' });
  const listEl = h('div', { class: 'vt-list' });

  const drop = h('div', { class: 'vt-drop', tabindex: 0, role: 'button', 'aria-label': L('Datei oder Link hierher ziehen', 'Drop a file or link here'), onclick: e => { if (e.target === url || e.target === go || url.contains(e.target)) return; fileIn.click(); } },
    h('div', { class: 'vt-dl vt-flow' }, h('span', { class: 'vt-tile' }, LOGO('youtube')), h('span', { class: 'vt-arrow', html: ico('right') }), h('span', { class: 'vt-tile vt-sheet', title: L('Lernzettel', 'Study sheet') }, h('span', { html: ico('note') }), h('small', {}, L('Lernzettel', 'Study sheet')))),
    h('b', {}, L('Link oder Datei hierher ziehen', 'Drop a link or file here')),
    h('small', {}, L('YouTube-Link (auch Shorts) – oder deine eigene Datei: PDF, Foto, Word, PowerPoint, Video, Audio', 'YouTube link (Shorts too) – or your own file: PDF, photo, Word, PowerPoint, video, audio')),
    h('div', { class: 'vt-bar', onclick: e => e.stopPropagation() }, h('span', { class: 'vt-bari', html: ico('video') }), url, go),
    h('button', { class: 'linkbtn vt-own', type: 'button', onclick: e => { e.stopPropagation(); fileIn.click(); } }, L('Eigene Datei auswählen', 'Choose your own file')), fileIn);
  let dn = 0;
  drop.addEventListener('dragenter', e => { e.preventDefault(); dn++; drop.classList.add('over'); });
  drop.addEventListener('dragover', e => e.preventDefault());
  drop.addEventListener('dragleave', () => { if (--dn <= 0) { dn = 0; drop.classList.remove('over'); } });
  drop.addEventListener('drop', e => {
    e.preventDefault(); dn = 0; drop.classList.remove('over');
    const fl = [...(e.dataTransfer?.files || [])]; if (fl.length) return upload(fl);
    const t = (e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain') || '').trim().split(/\s+/)[0];
    if (t) { url.value = t; start(); }
  });

  wrap.append(
    h('header', { class: 'vt-head' },
      h('div', { class: 'eyebrow' }, L('Videos & Dateien → Lernstoff', 'Videos & files → study material')),
      h('h1', {}, L('Aus Lernvideos wird Lernstoff.', 'Turn study videos into study material.'), ' ', brandRow(), tmInfo(TM)),
      h('p', { class: 'vt-sub' }, L('Viele Profs und die besten Lernvideos sind auf YouTube. Mit deinem Konto schreibt Max dir täglich 3 Videos kostenlos ab – und macht daraus, genau wie aus deinen eigenen Dateien, Lernzettel, Mitschrift im Füller-Look, Karteikarten, Quiz oder Podcast.', 'Many profs and the best study videos are on YouTube. With your account Max transcribes 3 videos a day for free – and turns them, just like your own files, into study sheets, fountain-pen notes, flashcards, quizzes or podcasts.'))),
    drop, status, quotaEl,
    h('section', { class: 'vt-sec' }, h('div', { class: 'vt-sh' }, h('h2', {}, L('Deine Video-Transkripte', 'Your video transcripts')), h('a', { class: 'linkbtn', href: '#/app/bibliothek/videos' }, L('In der Bibliothek', 'In the library'))), listEl));

  // ---------- Ohne Konto: kurz sehen, dann unscharf + kostenlos anmelden ----------
  let gateEl = null;
  function gate() {
    if (getAccount() || gateEl) return;
    wrap.classList.add('vt-locked');
    gateEl = h('div', { class: 'vt-gate' }, h('div', { class: 'vt-gatec' },
      h('div', { class: 'vt-dl vt-flow' }, h('span', { class: 'vt-tile' }, LOGO('youtube')), h('span', { class: 'vt-arrow', html: ico('right') }), h('span', { class: 'vt-tile vt-sheet', title: L('Lernzettel', 'Study sheet') }, h('span', { html: ico('note') }), h('small', {}, L('Lernzettel', 'Study sheet')))),
      h('b', {}, L('Video-Transkripte freischalten', 'Unlock video transcripts')),
      h('p', {}, L('Mit kostenlosem Konto: 3 Videos pro Tag abschreiben und daraus Lernzettel, Mitschrift, Karteikarten & Co. machen. Dauert 20 Sekunden.', 'With a free account: transcribe 3 videos a day and turn them into study sheets, notes, flashcards & more. Takes 20 seconds.')),
      h('button', { class: 'btn primary', type: 'button', onclick: async () => { const { openAuth } = await import('../account.js'); await openAuth({ registerTitle: L('Video-Transkripte freischalten', 'Unlock video transcripts'), registerSub: L('Kostenlos. 3 Videos pro Tag.', 'Free. 3 videos a day.') }); if (getAccount()) { wrap.classList.remove('vt-locked'); gateEl.remove(); gateEl = null; loadQuota(); if (url.value.trim()) start(); } } }, L('Kostenlos freischalten', 'Unlock for free'))));
    wrap.append(gateEl);
  }
  if (!getAccount()) setTimeout(gate, 1100);
  // Link von der Startseite übernehmen
  let pre = ''; try { pre = sessionStorage.getItem('tutor.vidUrl') || ''; sessionStorage.removeItem('tutor.vidUrl'); } catch (e) {}
  if (pre) { url.value = pre; if (getAccount()) setTimeout(() => start(), 300); else setTimeout(gate, 600); }

  // ---------- Kontingent ----------
  async function loadQuota() {
    if (!getAccount()) return;
    const j = await hub('quota').catch(() => ({}));
    adminKey(j && j.ok ? !!j.ready : false);
    if (j && j.ok) quotaEl.textContent = j.limit >= 999 ? L('Ohne Limit (Gründer)', 'No limit (founder)') : L(`Heute ${Math.max(0, j.limit - j.used)} von ${j.limit} Video-Transkripten übrig${j.pro ? '' : ' · Eigene Dateien zählen nicht dazu'}`, `${Math.max(0, j.limit - j.used)} of ${j.limit} video transcripts left today${j.pro ? '' : ' · your own files don’t count'}`);
  }
  // Nur Ben: Supadata-Schlüssel direkt hier eintragen (geht nur an unseren Server, wird nie angezeigt)
  let keyBox = null;
  async function adminKey(ready) {
    const { isAdmin } = await import('./zahlen.js').catch(() => ({}));
    if (!isAdmin || !isAdmin(getAccount())) return;
    if (keyBox) keyBox.remove(); wrap.querySelectorAll('.vt-keylink').forEach(x => x.remove());
    const inp = h('input', { class: 'vt-url', type: 'password', autocomplete: 'off', placeholder: L('Supadata-Schlüssel (sd_…)', 'Supadata key (sd_…)'), 'aria-label': 'Supadata' });
    const msg = h('small', {});
    const btn = h('button', { class: 'btn primary vt-go', type: 'button', onclick: async () => {
      const key = inp.value.trim(); if (!key) return;
      btn.disabled = true; msg.textContent = L('Prüfe …', 'Checking …');
      const r = await hub('setkey', { key }).catch(() => ({}));
      btn.disabled = false; inp.value = '';
      msg.textContent = r.ok ? L('Gespeichert und von Supadata bestätigt – Video-Transkripte sind live.', 'Saved and confirmed – video transcripts are live.') : (r.fehler || L('Hat nicht geklappt.', 'Didn’t work.'));
      if (r.ok) setTimeout(() => { keyBox && keyBox.remove(); keyBox = null; loadQuota(); }, 2500);
    } }, L('Speichern', 'Save'));
    keyBox = h('div', { class: 'vt-admin' }, h('b', {}, ready ? L('Supadata-Schlüssel ändern (nur du siehst das)', 'Change Supadata key (only you see this)') : L('Einrichtung: Supadata-Schlüssel eintragen (nur du siehst das)', 'Setup: enter Supadata key (only you see this)')), h('div', { class: 'vt-bar' }, inp, btn), msg);
    if (ready) { const t = h('button', { class: 'linkbtn vt-keylink', type: 'button', onclick: () => { t.replaceWith(keyBox); } }, L('Supadata-Schlüssel ändern', 'Change Supadata key')); quotaEl.after(t); keyBox._t = t; }
    else drop.before(keyBox);
  }
  loadQuota();

  // ---------- Eigene Datei: normaler Upload (mit Spracherkennung), landet ebenfalls hier ----------
  async function upload(fl) {
    if (!getAccount()) return gate();
    ls.set('tutor.upFrom', 'video');
    const m = await import('../app.js'); m.startUpload(fl);
  }

  // ---------- Link abschreiben ----------
  let busy = false;
  const say = (txt, kind) => { status.hidden = !txt; status.className = 'vt-status' + (kind ? ' ' + kind : ''); status.replaceChildren(...(kind === 'run' ? [h('span', { class: 'vt-spin' })] : []), h('span', {}, txt || '')); };
  async function start() {
    const u = url.value.trim(); if (!u || busy) return;
    if (!getAccount()) return gate();
    // Schon abgeschrieben? Nicht einfach nochmal – erst fragen
    const vk = videoKey(u);
    const dup = vk ? S.list.map(x => (S.doc && S.doc.id === x.id ? S.doc : x)).filter(x => keyOf(x) === vk).sort((a, b) => (b.created || 0) - (a.created || 0))[0] : null;
    if (dup) {
      const { modal } = await import('../util.js');
      const a = await modal({ eyebrow: L('Schon abgeschrieben', 'Already transcribed'), title: L('Dieses Video hast du schon transkribiert.', 'You’ve already transcribed this video.'),
        text: L(`„${dup.name.slice(0, 80)}“ vom ${new Date(dup.created).toLocaleDateString('de-DE')} liegt unten bei deinen Transkripten. Nochmal abschreiben zählt als eins deiner Transkripte für heute.`, `“${dup.name.slice(0, 80)}” is below in your transcripts. Transcribing again counts as one of today’s transcripts.`),
        actions: [{ label: L('Nochmal transkribieren', 'Transcribe again'), value: 'again' }, { label: L('Vorhandenes öffnen', 'Open existing'), value: 'open', primary: true }] });
      if (a !== 'again') { url.value = ''; openId = dup.id; draw(); setTimeout(() => listEl.querySelector('.vt-item.open')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120); return; }
    }
    busy = true; go.disabled = true;
    say(L('Max holt sich das Video …', 'Max is fetching the video …'), 'run');
    try {
      let j = await hub('start', { url: u });
      const jobId = j.job;
      if (j.ok && j.job) {
        say(L(`Max hört zu${j.meta && j.meta.title ? ': „' + j.meta.title.slice(0, 60) + '“' : ''} … das dauert bei längeren Videos ein bis zwei Minuten.`, 'Max is listening … longer videos take a minute or two.'), 'run');
        for (let k = 0; k < 400 && j.ok && !j.done; k++) { await new Promise(r => setTimeout(r, 2500)); j = await hub('status', { job: jobId }); }
      }
      if (!j.ok || !j.done) throw new Error(j.fehler || L('Das hat nicht geklappt.', 'That didn’t work.'));
      const v = j.data;
      // Sprache: Standard = Sprache des Videos; nicht Deutsch → kurz fragen
      const src = detectLang(v.lines.slice(0, 40).map(l => l.x).join(' ')) || (v.lang || '').slice(0, 2).toLowerCase();   // Text zählt mehr als die Angabe der Plattform
      const out = src && src !== 'de' ? await askLang(src, { what: L('Ich erstelle dir alles standardmäßig in der Sprache des Videos. Du kannst aber auch eine andere wählen.', 'By default I create everything in the video’s language. You can pick another one too.') }) : (src || 'de');
      const title = (v.title || `${PLAT[v.platform] || 'Video'} · ${new Date().toLocaleDateString('de-DE')}`).slice(0, 120);
      let d;
      if (dup) { d = S.doc && S.doc.id === dup.id ? S.doc : dup; Object.assign(d, { name: title, pages: toPages(v.lines), chars: v.lines.reduce((a, l) => a + l.x.length, 0), video: v, srcLang: src, outLang: out }); save(d); }
      else d = await createDoc({ name: title, pages: toPages(v.lines), chars: v.lines.reduce((a, l) => a + l.x.length, 0), extra: { kind: 'video', from: 'video', video: v, srcLang: src, outLang: out } });
      url.value = ''; say(L(`Fertig: „${title.slice(0, 70)}“ – unten liegt dein Transkript. Wähl, was du daraus machen willst.`, `Done: “${title.slice(0, 70)}” – your transcript is below. Pick what to make from it.`), 'ok');
      if (j.quota) quotaEl.textContent = L(`Heute ${Math.max(0, j.quota.limit - j.quota.used)} von ${j.quota.limit} Video-Transkripten übrig`, `${Math.max(0, j.quota.limit - j.quota.used)} of ${j.quota.limit} left today`);
      openId = d.id; draw();
      setTimeout(() => listEl.querySelector('.vt-item.open')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch (e) {
      say(e.message, 'err');
      if (/Konto/.test(e.message)) gate();
    } finally { busy = false; go.disabled = false; loadQuota(); }
  }

  // ---------- Liste: Transkripte + hier hochgeladene Dateien ----------
  // Zurück von Lernzettel, Quiz & Co.: das zuletzt benutzte Video ist gleich wieder offen und im Blick
  let openId = null; try { openId = sessionStorage.getItem('tutor.vidOpen') || null; sessionStorage.removeItem('tutor.vidOpen'); } catch (e) {}
  const backOpen = !!openId;
  function draw() {
    const seenK = new Set();
    const docs = S.list.map(d => (S.doc && S.doc.id === d.id ? S.doc : d)).filter(d => d.kind === 'video' || d.from === 'video').sort((a, b) => (b.created || 0) - (a.created || 0)).filter(d => { const k = keyOf(d); if (!k) return true; if (seenK.has(k)) return false; seenK.add(k); return true; });
    if (!docs.length) { listEl.replaceChildren(h('div', { class: 'vt-empty' }, L('Noch nichts hier. Füg oben einen Link ein oder zieh eine Datei rein.', 'Nothing here yet. Paste a link above or drop a file.'))); return; }
    listEl.replaceChildren(...docs.slice(0, 40).map(d => {
      const v = d.video || {}, open = d.id === openId;
      const made = [d.summary ? L('Lernzettel', 'Study sheet') : null, (d.decks || []).some(x => (x.cards || []).length) ? L('Karteikarten', 'Flashcards') : null, (d.quizzes || []).length ? 'Quiz' : null, (d.podcasts || []).length ? 'Podcast' : null, d.path?.chapters?.length ? L('Lernpfad', 'Study path') : null].filter(Boolean);
      const meta = [v.platform ? PLAT[v.platform] : L('Eigene Datei', 'Own file'), v.dur ? mmss(v.dur) : null, d.outLang && d.outLang !== 'de' ? langName(d.outLang) : null, new Date(d.created).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })].filter(Boolean).join(' · ');
      const head = h('button', { class: 'vt-ih', type: 'button', onclick: () => { openId = open ? null : d.id; draw(); } },
        v.platform ? LOGO(v.platform) : h('span', { class: 'vt-fi', html: ico('file') }),
        h('span', { class: 'vt-it' }, h('b', {}, d.name), h('small', {}, meta + (made.length ? ' · ' + made.join(', ') : ''))),
        h('span', { class: 'vt-chev', html: ico(open ? 'up' : 'down') }));
      if (!open) return h('div', { class: 'vt-item' }, head);
      const lines = v.lines || (d.pages || []).join('\n').split('\n').filter(Boolean).map(x => ({ t: -1, x }));
      // Transkript immer komplett zum Nachlesen (mit Zeitstempeln), egal was daraus gemacht wird
      const prev = h('div', { class: 'vt-tr' }, h('div', { class: 'vt-trh' }, h('b', {}, L('Transkript', 'Transcript')), h('small', {}, L(`${lines.length} Abschnitte`, `${lines.length} sections`))), h('div', { class: 'vt-prev' }, lines.map(l => h('p', {}, l.t >= 0 ? h('span', { class: 'vt-ts' }, mmss(l.t)) : null, l.x))));
      const langRow = h('div', { class: 'vt-lang' }, h('small', {}, L('Erstellen auf', 'Create in')), langPicker(d.srcLang || 'de', d.outLang || d.srcLang || 'de', async c => { d.outLang = c; save(d); if (d.video && await relang(d, c)) { draw(); toast(L(`Transkript und alles Neue jetzt auf ${langName(c)}.`, `Transcript and everything new now in ${langName(c)}.`)); } else if (!d.video) toast(L(`Alles Neue erstelle ich auf ${langName(c)}.`, `I’ll create everything new in ${langName(c)}.`)); }));
      return h('div', { class: 'vt-item open' }, head,
        h('div', { class: 'vt-ib' },
          h('div', { class: 'vt-acts' },
            d.video ? h('button', { class: 'btn sm', type: 'button', onclick: () => full(d) }, h('span', { html: ico('expand') }), L('Vollbild', 'Full screen')) : null,
            d.video ? h('button', { class: 'btn sm', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(toText(v.lines)); toast(L('Transkript kopiert.', 'Transcript copied.')); } catch (e) {} } }, h('span', { html: ico('check') }), L('Kopieren', 'Copy')) : null,
            d.video ? h('button', { class: 'btn sm', type: 'button', onclick: () => pdf(d) }, h('span', { html: ico('download') }), 'PDF') : h('a', { class: 'btn sm', href: `#/app/${d.id}/hub` }, L('Öffnen', 'Open')),
            v.url ? h('a', { class: 'linkbtn', href: v.url, target: '_blank', rel: 'noopener noreferrer' }, L('Zum Video', 'Open video')) : null),
          langRow,
          h('div', { class: 'vt-mk' }, h('div', { class: 'vt-mkh' }, L('Was soll ich daraus machen?', 'What should I make from it?')),
            h('div', { class: 'vt-mkg' }, MAKE.map(([k, ic, t, s]) => h('button', { class: 'vt-mkb', type: 'button', onclick: () => make(d, k) }, h('span', { class: 'vt-mki', html: ico(ic) }), h('b', {}, t), h('small', {}, s))))),
          prev));
    }));
  }
  draw();
  if (backOpen) setTimeout(() => listEl.querySelector('.vt-item.open')?.scrollIntoView({ block: 'start' }), 80);
  const off = onChange(() => { if (wrap.isConnected) draw(); });
  return () => { if (typeof off === 'function') off(); };
}
