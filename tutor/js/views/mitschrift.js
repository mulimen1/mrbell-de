// Mitschrift: in der Vorlesung einfach drauflos tippen – Max macht daraus eine saubere,
// handschriftliche Mitschrift (Füller oder Druckschrift) mit Skizzen. Wird als Unterlage im Fach gespeichert,
// damit Karteikarten, Quiz & Co. direkt daraus entstehen können.
import { h, ico, ls, toast, ago, uid } from '../util.js';
import { msSwitch } from '../msswitch.js';
import { L } from '../i18n.js';
import { detectLang, askLang } from '../srclang.js';
import { S, createDoc, openDoc, save, saveNow, refreshList } from '../state.js';
import { ask } from '../api.js';
import * as M from '../me.js';
import { formula, rich, flat, sketch, canDraw, underline, box } from '../msdraw.js';
import { forWhole } from '../retrieve.js';
import { linkMitschriften } from '../mslink.js';
import { palette, blattDefault, blattPicker, applyBlatt, inkOf, smartTextarea, toggleBullet } from '../mspal.js';
import { pad, drawingEl, drawingJpeg } from '../mspad.js';

const DKEY = 'tutor.ms.draft';
let cssOn = false;
function css() { if (cssOn || document.querySelector('link[data-ms]')) return; cssOn = true; document.head.appendChild(h('link', { rel: 'stylesheet', href: '/tutor/css/mitschrift.css?v=16', 'data-ms': '1' })); }

const MS_SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z" fill="currentColor"/><path d="M18.5 14.5c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z" fill="currentColor" opacity=".7"/></svg>';
export async function render(root, { id = '' } = {}) {
  css();
  const wrap = h('div', { class: 'view-in ms' }); root.appendChild(wrap);
  if (id && !/^neu/.test(id)) {
    const d = await openDoc(id);
    if (!d || !d.ms) { toast(L('Diese Mitschrift gibt es auf diesem Gerät nicht mehr.', 'This note is no longer on this device.')); location.replace('#/app/mitschrift'); return; }
    return d.ms.draft ? editor(wrap, d) : sheetView(wrap, d);
  }
  if (/^neu/.test(id)) return editor(wrap, null);
  // Ohne Adresse: am offenen Entwurf weiterschreiben
  const cur = (ls.get(DKEY, {}) || {}).docId;
  const known = cur && S.list.find(x => x.id === cur && x.ms && x.ms.draft);
  return editor(wrap, known ? await openDoc(cur) : null);
}

// ---------- Editor ----------
// Jeder Entwurf ist sofort eine echte Mitschrift (Entwurf) – unter „Deine Mitschriften“, in der Bibliothek und im Fach.
// Gespeichert wird beim Tippen (kurz verzögert), beim Verlassen der Seite und beim Schließen des Tabs.
function editor(wrap, doc) {
  const local = ls.get(DKEY, {}) || {};
  const draft = doc ? { video: !!doc.ms.video, fach: doc.ms.fach || '', text: doc.ms.raw || '', stil: doc.ms.stil || 'fueller', at: doc.ms.at || 0, skript: doc.ms.skript || '', blatt: doc.ms.blatt, zeichnung: doc.ms.zeichnung || { strokes: [], h: 1250 }, docId: doc.id }
    : Object.assign({ fach: '', text: '', stil: 'fueller', at: 0, skript: '' }, local.docId ? { fach: local.fach || '', stil: local.stil, skript: local.skript || '', blatt: local.blatt } : local, { docId: null });
  let pT = 0, chain = Promise.resolve();
  const hasContent = () => !!(draft.text.trim() || (draft.zeichnung && draft.zeichnung.strokes && draft.zeichnung.strokes.length));
  const draftName = () => { const l = draft.text.split('\n').map(x => x.trim()).find(Boolean); return l ? (l.length > 48 ? l.slice(0, 46) + '…' : l) : (draft.fach || L('Mitschrift', 'Notes')) + ' – ' + new Date().toLocaleDateString(L('de-DE', 'en-GB'), { day: '2-digit', month: '2-digit' }); };
  const persist = now => {
    clearTimeout(pT);
    const run = () => chain = chain.then(async () => {
      if (!doc && !hasContent()) return;
      const ms = Object.assign({}, doc && doc.ms, { draft: true, video: !!draft.video, raw: draft.text, fach: draft.fach, skript: draft.skript, stil: draft.stil, blatt: draft.blatt, zeichnung: draft.zeichnung, at: Date.now() });
      if (!doc) {
        doc = await createDoc({ name: draftName(), pages: [draft.text || draftName()], chars: draft.text.length, extra: { kind: 'mitschrift', ms } });
        draft.docId = doc.id; ls.set(DKEY, draft); linkMitschriften(); setCount();
        if (/^#\/app\/mitschrift(\/neu[^/]*)?$/.test(location.hash)) history.replaceState(null, '', '#/app/mitschrift/' + doc.id);
      } else { doc.name = draftName(); doc.pages = [draft.text || doc.name]; doc.chars = draft.text.length; doc.ms = ms; await saveNow(doc); }
    }).catch(e => console.warn('Mitschrift sichern', e));
    if (now) return run();
    pT = setTimeout(run, 700);
    return chain;
  };
  const keep = () => { draft.at = Date.now(); ls.set(DKEY, draft); persist(); st.textContent = hasContent() ? L('Wird automatisch gesichert', 'Saved automatically') : ''; };
  const onHide = () => { if (document.visibilityState === 'hidden') persist(true); };
  document.addEventListener('visibilitychange', onHide); addEventListener('pagehide', onHide);

  // Deine Mitschriften: direkt unter der Überschrift aufklappbar (statt ganz unten)
  const listBox = h('div', { class: 'ms-lbox', hidden: true });
  const cnt = h('small', {});
  const setCount = () => { const k = S.list.filter(d => d.ms).length; cnt.textContent = k ? String(k) : ''; cnt.hidden = !k; };
  const listBtn = h('button', { type: 'button', class: 'ms-lbtn', 'aria-expanded': 'false', onclick: () => { listBox.hidden = !listBox.hidden; listBtn.setAttribute('aria-expanded', String(!listBox.hidden)); if (!listBox.hidden) listBox.replaceChildren(list()); } },
    h('span', { html: ico('library') }), L('Deine Mitschriften', 'Your notes'), cnt, h('span', { class: 'ms-lch', html: ico('down') }));
  setCount();
  const saveBtn = h('button', { type: 'button', class: 'ms-lbtn ms-save', onclick: async () => {
    if (!hasContent()) { toast(L('Schreib erst etwas – dann sichere ich es.', 'Write something first – then I’ll save it.')); return; }
    await persist(true); await refreshList(); setCount(); if (!listBox.hidden) listBox.replaceChildren(list());
    toast(L('Gesichert – unter „Deine Mitschriften“ und in der Bibliothek.', 'Saved – under “Your notes” and in the library.'));
  } }, h('span', { html: ico('check') }), L('Notiz sichern', 'Save note'));
  const newBtn = h('button', { type: 'button', class: 'ms-lbtn', onclick: async () => {
    await persist(true); await refreshList();
    ls.set(DKEY, { fach: draft.fach, stil: draft.stil, blatt: draft.blatt, text: '', docId: null });
    location.hash = '#/app/mitschrift/neu-' + Date.now().toString(36);
  } }, h('span', { html: ico('plus') }), L('Neue Mitschrift', 'New note'));
  const headL = h('div', { class: 'ms-hl' },
    h('div', { class: 'ms-ht' }, h('div', { class: 'eyebrow' }, L('Mitschrift', 'Notes')), h('h2', { class: 'ms-h2' }, L('Schreib einfach mit. ', 'Just take notes. '), h('span', {}, L('Max macht’s sauber.', 'Max makes it clean.'))), h('div', { class: 'ms-hbtns' }, listBtn, saveBtn, newBtn)),
      h('p', { class: 'ms-hp' }, L('Tipp in der Vorlesung drauflos oder fotografier Notizen und Tafel. Max macht daraus eine saubere Mitschrift – in Schreibschrift oder Druckschrift, mit Skizzen.', 'Type away during the lecture or snap your notes and the board. Max turns it into clean notes – in cursive or print, with sketches.')));
  const head = h('div', { class: 'ms-head' }, headL);
  { const sw = msSwitch('live'); if (sw) headL.prepend(sw); }

  // Fach: einfach eintippen (muss kein angelegtes Fach sein). Vorhandene Fächer als Abkürzung daneben,
  // ein unbekannter Name bekommt einen kleinen Knopf „Als Fach anlegen“ – freiwillig.
  const fachIn = h('input', { type: 'text', class: 'ms-fin', value: draft.fach, placeholder: L('Fach, z. B. Kostenrechnung', 'Subject, e.g. Cost accounting'), 'aria-label': L('Fach', 'Subject'), autocomplete: 'off',
    oninput: e => { draft.fach = e.target.value.trim(); drawFach(); keep(); } });
  const fachEl = h('div', { class: 'ms-fachw' });
  const fachSlot = h('span', { class: 'ms-fslot' }), fachRow = h('div', { class: 'ms-frow' }, h('small', {}, L('Fach', 'Subject')), fachIn, fachSlot);
  const drawFach = () => {
    const faecher = M.getMe().faecher || [], hit = draft.fach ? M.findFach(draft.fach) : null;
    const add = draft.fach && !hit ? h('button', { type: 'button', class: 'ms-addf', onclick: () => { M.saveFach({ name: draft.fach, kurz: '', klausur: '', ects: '', docs: [], termine: [] }); toast(L(`„${draft.fach}“ ist jetzt ein Fach – deine Mitschriften landen automatisch dort.`, `“${draft.fach}” is now a subject – your notes go there automatically.`)); linkMitschriften(); drawFach(); } }, h('span', { html: ico('plus') }), L('Als Fach anlegen', 'Add as subject')) : null;
    const ok = hit ? h('span', { class: 'ms-fok', title: L('Wird in diesem Fach gespeichert', 'Saved to this subject') }, h('span', { html: ico('check') }), hit.name.toLowerCase() === draft.fach.toLowerCase() ? L('Fach', 'Subject') : hit.name) : null;
    // Das Eingabefeld bleibt stehen (sonst verliert es beim Tippen den Fokus) – nur Häkchen/Knopf daneben wechseln
    fachSlot.replaceChildren(...[ok, add].filter(Boolean));
    if (!fachRow.isConnected || fachRow.parentNode !== fachEl) fachEl.prepend(fachRow);
    [...fachEl.children].forEach(c => { if (c !== fachRow) c.remove(); });
    fachEl.append(
      ...[faecher.length ? h('div', { class: 'ms-fach' }, faecher.filter(f => !hit || f.id !== hit.id).map(f => h('button', { type: 'button', class: 'chip', onclick: () => { draft.fach = fachIn.value = f.name; drawFach(); keep(); } }, f.name))) : null].filter(Boolean),
      ...[skriptRow()].filter(Boolean));
  };
  // Optional: mit einem Skript verbinden – dann kennt Max die Begriffe und Seiten aus der Vorlesung
  const skripte = () => S.list.filter(d => !d.ms && !d.sample && d.pages?.length);
  let pick = false;
  const skriptRow = () => {
    const sel = draft.skript && S.list.find(d => d.id === draft.skript);
    if (sel) return h('div', { class: 'ms-skc' }, h('span', { class: 'ms-ski', html: ico('file') }), h('div', {}, h('small', {}, L('Verbunden mit Skript', 'Linked slides')), h('b', {}, sel.name)), h('button', { type: 'button', class: 'iconbtn', 'aria-label': L('Skript lösen', 'Unlink slides'), html: ico('x'), onclick: () => { draft.skript = ''; keep(); drawFach(); } }));
    if (!pick) return h('button', { type: 'button', class: 'ms-skl', onclick: () => { pick = true; drawFach(); } }, h('span', { html: ico('file') }), L('Mit Skript verbinden', 'Link slides'), h('small', {}, L('optional', 'optional')));
    const all = skripte(), f = draft.fach ? M.findFach(draft.fach) : null;
    const mine = f ? all.filter(d => (f.docs || []).includes(d.id)) : [];
    const list = [...mine, ...all.filter(d => !mine.includes(d))].slice(0, 8);
    const fin = h('input', { type: 'file', class: 'sr', accept: '.pdf,.pptx,.docx,.txt,.md,application/pdf' });
    fin.addEventListener('change', () => { const fl = fin.files[0]; fin.value = ''; if (fl) addSkript(fl); });
    const drop = h('label', { class: 'ms-skd' }, fin, h('span', { html: ico('upload') }), h('div', {}, h('b', {}, L('Skript hierher ziehen oder auswählen', 'Drop slides here or choose a file')), h('small', {}, 'PDF, PowerPoint, Word')));
    ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); e.stopPropagation(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); e.stopPropagation(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => { const fl = e.dataTransfer?.files?.[0]; if (fl) addSkript(fl); });
    return h('div', { class: 'ms-skp' },
      h('div', { class: 'ms-skh' }, h('div', {}, h('b', {}, L('Mit Skript verbinden', 'Link slides')), h('small', {}, L('Max nimmt daraus Fachbegriffe und Seitenzahlen – mehr nicht.', 'Max uses it for terms and page numbers – nothing more.'))), h('button', { type: 'button', class: 'iconbtn', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => { pick = false; drawFach(); } })),
      drop,
      list.length ? h('div', { class: 'ms-skl2' }, list.map(d => h('button', { type: 'button', class: 'ms-sko', onclick: () => { draft.skript = d.id; pick = false; keep(); drawFach(); } }, h('span', { html: ico('file') }), h('span', {}, d.name), M.fachOf(d.id) ? h('small', {}, M.fachOf(d.id).name) : null))) : null);
  };
  // Neues Skript direkt hier: Text lokal auslesen, in der Bibliothek ablegen, verbinden
  async function addSkript(file) {
    try {
      toast(L('Lese dein Skript …', 'Reading your slides …'));
      const { readFile } = await import('../ingest.js');
      const r = await readFile(file);
      const d = await createDoc({ name: r.name, pages: r.pages, chars: r.chars, extra: { kind: 'vorlesung' } });
      const f = draft.fach ? M.findFach(draft.fach) : null;
      if (f) M.updateMe(m => { const x = m.faecher.find(y => y.id === f.id); if (x) x.docs = [...new Set([...(x.docs || []), d.id])]; });
      draft.skript = d.id; pick = false; keep(); drawFach();
      toast(L(`„${r.name}“ ist verbunden und liegt in deiner Bibliothek.`, `“${r.name}” is linked and in your library.`));
    } catch (e) { toast(e.message || L('Das Skript konnte ich nicht lesen.', 'I couldn’t read the slides.'), 4500); }
  }
  drawFach();

  const ta = h('textarea', { class: 'ms-ta', spellcheck: 'false', autocapitalize: 'off', 'aria-label': L('Deine Notizen', 'Your notes'),
    placeholder: L('z. B.\nDB = Umsatz - var Kosten\nbreak even -> Fixkosten / db pro stk\n!! kurzfr. PUG = kv\n\nEinfach so schnell wie möglich – sauber macht’s Max.', 'e.g.\nCM = revenue - var costs\nbreak even -> fixed costs / cm per unit\n!! short-term price floor = vc\n\nAs fast as you like – Max makes it neat.') });
  ta.value = draft.text;
  // Pfeile beim Tippen direkt schön machen
  ta.addEventListener('input', () => {
    const p = ta.selectionStart, v = ta.value, nv = v.replace(/->/g, '→').replace(/=>/g, '⇒').replace(/<-/g, '←');
    if (nv !== v) { ta.value = nv; const d = v.length - nv.length; ta.selectionStart = ta.selectionEnd = Math.max(0, p - d); }
    draft.text = ta.value; keep(); if (go) setGo();
  });
  const changed = () => ta.dispatchEvent(new Event('input'));
  const ins = s => {
    ta.focus(); const a = ta.selectionStart, b = ta.selectionEnd, c = s.indexOf('¦'), t = s.replace('¦', '');
    // Zeilenanfang-Bausteine (Aufzählung, Def., Bsp.) am Textanfang ohne Leerzeile
    const txt = a === 0 || ta.value[a - 1] === '\n' ? t.replace(/^\n/, '') : t;
    ta.setRangeText(txt, a, b, 'end'); if (c >= 0) { const pos = a + (txt.length - (t.length - c)); ta.selectionStart = ta.selectionEnd = pos; }
    changed();
  };
  const cleanup = smartTextarea(ta, changed);
  // Blatt (Papier, Farbe, Tinte) – gilt für dein Notizblatt und für die fertige Mitschrift
  const blatt = Object.assign(blattDefault(), draft.blatt && draft.blatt.v === 3 ? draft.blatt : {});   // ältere Entwürfe: neuer Standard (kariert)
  const paintTa = () => { applyBlatt(ta, blatt); if (zp) { applyBlatt(zp.el.querySelector('.mz-host'), blatt); zp.recolor(); } };
  let zp = null;
  paintTa();
  const bp = blattPicker(blatt, () => { draft.blatt = { ...blatt }; paintTa(); keep(); }); bp.hidden = true;
  // Zeichen & Formen: Laptop rechts daneben, Handy ausklappbar
  const pal = palette(ins);
  // Zeichnen: Maus, Finger oder Apple Pencil – liegt als eigenes Blatt neben dem Getippten
  const z = draft.zeichnung = draft.zeichnung || { strokes: [], h: 1250 };
  draft.blatt = blatt;
  const canGo = () => draft.text.trim().length >= 25 || (z.strokes || []).length > 0;
  const drawBtn = h('button', { type: 'button', class: 'ms-tb ms-drawb', 'aria-expanded': 'false', onclick: () => setDraw(!ed.classList.contains('draw-on')) }, h('span', { html: '<svg class="ico" viewBox="0 0 24 24"><path d="M3 21c3-1 4-3 6-3s2 2 4 2 3-4 6-4"/><path d="m14 4 3 3-8 8H6v-3z"/></svg>' }), L('Zeichnen', 'Draw'));
  function setDraw(on) {
    ed.classList.toggle('draw-on', on); drawBtn.setAttribute('aria-expanded', String(on));
    if (on && !zp) { zp = pad(z, blatt, () => { keep(); setGo(); }); body.appendChild(zp.el); applyBlatt(zp.el.querySelector('.mz-host'), blatt); }
    if (zp) requestAnimationFrame(() => { zp.fit(); if (on && innerWidth < 900) zp.el.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  }
  const camIn = h('input', { type: 'file', accept: 'image/*', multiple: true, class: 'sr' });
  const cam = h('label', { class: 'ms-cam', title: L('Bild von Tafel oder Aufschrieb – wird zur sauberen Mitschrift', 'Photo of the board or your notes – becomes clean notes') }, camIn, h('span', { html: ico('camera') }), h('span', { class: 'ms-camt' }, h('b', {}, L('Bild', 'Photo')), h('small', {}, L('Tafel oder Aufschrieb', 'board or notes'))));
  camIn.addEventListener('change', () => { const fs = [...camIn.files].slice(0, 6); camIn.value = ''; if (fs.length) fromPhotos(fs); });
  // Video oder Aufnahme der Vorlesung: Max schreibt ab und macht direkt die Mitschrift daraus
  const vidIn = h('input', { type: 'file', accept: 'video/*,audio/*,.mp4,.mov,.m4a,.mp3,.wav,.webm', class: 'sr' });
  const vid = h('label', { class: 'ms-cam ms-vid', title: L('Vorlesungsvideo oder Aufnahme – wird zur sauberen Mitschrift', 'Lecture video or recording – becomes clean notes') }, vidIn, h('span', { html: '<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10.5 5-3v9l-5-3z"/></svg>' }), h('span', { class: 'ms-camt' }, h('b', {}, L('Video', 'Video')), h('small', {}, L('Vorlesung oder Aufnahme', 'lecture or recording'))));
  vidIn.addEventListener('change', () => { const f = vidIn.files[0]; vidIn.value = ''; if (f) fromVideo(f); });
  const palBtn = h('button', { type: 'button', class: 'ms-tb ms-palb', 'aria-expanded': 'false', onclick: () => { const open = !ed.classList.contains('pal-open'); if (open && ed.classList.contains('draw-on')) { toast(L('Zeichen & Formen gehen nicht, solange „Zeichnen“ an ist – beende erst das Zeichnen.', 'Symbols don’t work while drawing is on – stop drawing first.')); return; } ed.classList.toggle('pal-open', open); palBtn.setAttribute('aria-expanded', String(open)); } }, h('b', {}, 'Σ→'), L('Zeichen & Formen', 'Symbols'));
  const blattBtn = h('button', { type: 'button', class: 'ms-tb', 'aria-expanded': 'false', onclick: () => { bp.hidden = !bp.hidden; blattBtn.setAttribute('aria-expanded', String(!bp.hidden)); } }, h('i', { class: 'ms-swatch' }), L('Blatt', 'Paper'));
  const tools = h('div', { class: 'ms-tools', role: 'toolbar', 'aria-label': L('Werkzeuge', 'Tools') }, cam, vid,
    h('button', { type: 'button', class: 'ms-tb', onmousedown: e => e.preventDefault(), onclick: () => toggleBullet(ta, changed) }, h('b', {}, '•'), L('Liste', 'List')),
    h('button', { type: 'button', class: 'ms-tb', onmousedown: e => e.preventDefault(), onclick: () => ins('★\uFE0E ') }, h('b', {}, '★\uFE0E'), L('wichtig', 'key')),
    h('button', { type: 'button', class: 'ms-tb', onmousedown: e => e.preventDefault(), onclick: () => ins(' (?) ') }, h('b', {}, '?'), L('unklar', 'unclear')),
    drawBtn, palBtn, blattBtn);

  let stil = draft.stil === 'druck' ? 'druck' : 'fueller';
  // Schrift-Auswahl und „Saubere Mitschrift machen“ gibt es oben und unten – eine Wahl, ein Knopf-Handler
  const mkSeg = () => h('div', { class: 'seg', role: 'radiogroup', 'aria-label': L('Schrift', 'Handwriting') });
  const seg = mkSeg(), segTop = mkSeg();
  const drawSeg = () => [seg, segTop].forEach(sg => sg.replaceChildren(...[['fueller', L('Füller', 'Fountain pen')], ['druck', L('Druckschrift', 'Print')]].map(([k, n]) => h('button', { type: 'button', class: k === stil ? 'on' : '', role: 'radio', 'aria-checked': String(k === stil), onclick: () => { stil = draft.stil = k; drawSeg(); keep(); drawPv(); } }, n))));
  const st = h('span', { class: 'ms-st' });
  const mkGo = cls => h('button', { type: 'button', class: 'btn primary ms-go' + (cls ? ' ' + cls : ''), disabled: !canGo(), title: L('Erst ein paar Zeilen schreiben oder eine Datei hochladen', 'Write a few lines or upload a file first'), onclick: () => make() }, h('span', { class: 'ms-gosp', html: MS_SPK }), L('Mit Max erstellen', 'Create with Max'));
  const go = mkGo(), goTop = mkGo('ms-gotop');
  function setGo() { go.disabled = goTop.disabled = !canGo(); }
  // Klar machen: das Ergebnis schreibt Max (KI) – du wählst nur die Schrift
  const maxLbl = () => h('span', { class: 'ms-maxl' }, h('span', { class: 'ms-maxi', html: MS_SPK }), h('span', {}, h('b', {}, L('Max erstellt dir', 'Max creates')), h('small', {}, L('saubere Mitschrift in', 'clean notes in'))));
  const foot = h('div', { class: 'ms-foot' }, st, maxLbl(), seg, go);
  const topBar = h('div', { class: 'ms-topbar' }, maxLbl(), segTop, h('span', { class: 'ms-tbsp' }), goTop);
  // Vorschau oben rechts: so sieht das Ergebnis aus (echtes Blatt, gleiche Darstellung wie die fertige Mitschrift)
  const PVK = 'tutor.ms.pv';
  let pvOpen = ls.get(PVK, null) == null ? true : !!ls.get(PVK, 0);
  if (ls.get(PVK, null) == null) ls.set(PVK, 0);   // nur beim ersten Mal offen
  const pvBox = h('div', { class: 'ms-pvb' }), pvBody = h('div', { class: 'ms-pvbody' }, pvBox, h('small', { class: 'ms-pvn' }, L('Beispiel: so wird aus deinen schnellen Notizen eine Mitschrift – mit Formel, Merke-Kasten und Skizze.', 'Example: your quick notes become clean notes like this – with formula, key box and sketch.')));
  const pvBtn = h('button', { type: 'button', class: 'ms-pvt', 'aria-expanded': String(pvOpen), onclick: () => { pvOpen = !pvOpen; ls.set(PVK, pvOpen ? 1 : 0); syncPv(); } }, h('span', { html: ico('note') }), L('So sieht deine Mitschrift aus', 'What your notes will look like'), h('span', { class: 'ms-lch', html: ico('down') }));
  const pv = h('aside', { class: 'ms-pv' }, pvBtn, pvBody);
  function syncPv() { pv.classList.toggle('open', pvOpen); pvBtn.setAttribute('aria-expanded', String(pvOpen)); pvBody.hidden = !pvOpen; if (pvOpen) drawPv(); }
  function drawPv() {
    if (!pvOpen) return;
    const sample = { name: 'Break-even', created: Date.now(), ms: { stil, fach: draft.fach || L('Kostenrechnung', 'Cost accounting'), at: Date.now(), blatt: draft.blatt && draft.blatt.v === 3 ? draft.blatt : undefined, data: L(
      { titel: 'Break-even-Analyse', kern: 'Ab welcher Menge deckt der Umsatz alle Kosten?', abschnitte: [{ h: 'Deckungsbeitrag', punkte: ['db = Preis − **variable Stückkosten**', 'Jedes Stück deckt erst Fixkosten, dann Gewinn'], formel: 'x_{BE} = K_f / db', merke: 'Unter dem Break-even macht jedes Stück trotzdem einen positiven DB.', bild: { typ: 'kurve', titel: 'Break-even-Punkt', x: 'Menge', y: '€', linien: [{ name: 'Umsatz', form: 'linear' }, { name: 'Kosten', form: 'linear' }] } }], korrekturen: [], fragen: [] },
      { titel: 'Break-even analysis', kern: 'From which quantity does revenue cover all costs?', abschnitte: [{ h: 'Contribution margin', punkte: ['cm = price − **variable unit cost**', 'Each unit covers fixed costs first, then profit'], formel: 'x_{BE} = FC / cm', merke: 'Below break-even each unit still has a positive CM.', bild: { typ: 'kurve', titel: 'Break-even point', x: 'Quantity', y: '€', linien: [{ name: 'Revenue', form: 'linear' }, { name: 'Costs', form: 'linear' }] } }], korrekturen: [], fragen: [] }) } };
    const p = paper(sample, false); pvBox.replaceChildren(p); fitPv();
  }
  const fitPv = () => { const p = pvBox.firstChild; if (!p) return; const w = pvBox.clientWidth || 300; p.style.setProperty('--pvs', String(w / 640)); };
  const pvRO = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fitPv) : null; if (pvRO) pvRO.observe(pvBox);
  drawSeg();
  const body = h('div', { class: 'ms-body' }, ta, pal);
  // Bilder einfach reinziehen oder einfügen (⌘V) – Dateien wie PDF werden als Skript verbunden
  const takeFiles = fl => { const imgs = fl.filter(f => /^image\//.test(f.type) || /\.(png|jpe?g|webp|heic|heif)$/i.test(f.name || '')); const docs = fl.filter(f => !imgs.includes(f)); fromFiles(fl); };
  ta.addEventListener('dragover', e => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); ta.classList.add('over'); } });
  ta.addEventListener('dragleave', () => ta.classList.remove('over'));
  // Drop aufs Schreibfeld übernimmt die ganze Seite (unten) – sonst käme das Foto doppelt an
  ta.addEventListener('paste', e => { const fl = [...(e.clipboardData?.files || [])]; if (fl.length) { e.preventDefault(); takeFiles(fl); } });
  // Großer Bereich: Mitschrift hochladen (alles: PDF, Foto, Word, PowerPoint, Text, Video/Audio)
  const upIn = h('input', { type: 'file', class: 'sr', multiple: true, accept: '.pdf,.pptx,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.heic,.heif,application/pdf,image/*,video/*,audio/*,.mp4,.mov,.m4v,.m4a,.mp3,.wav' });
  upIn.addEventListener('change', () => { const fl = [...(upIn.files || [])]; upIn.value = ''; if (fl.length) fromFiles(fl); });
  const up = h('div', { class: 'ms-up', role: 'button', tabindex: 0, onclick: () => upIn.click(), onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); upIn.click(); } } },
    h('span', { class: 'ms-upi', html: ico('upload') }),
    h('div', { class: 'ms-upt' }, h('b', {}, L('Mitschrift hochladen', 'Upload notes')), h('small', {}, L('PDF, Foto, Word, PowerPoint, Video – reinziehen oder klicken. Max macht daraus eine saubere Mitschrift, in der Sprache deines Materials.', 'PDF, photo, Word, PowerPoint, video – drop or click. Max turns it into clean notes, in the language of your material.'))),
    h('span', { class: 'ms-upb' }, L('Datei wählen', 'Choose file')), upIn);
  ['dragenter', 'dragover'].forEach(ev => up.addEventListener(ev, e => { if (e.dataTransfer?.types?.includes('Files')) up.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => up.addEventListener(ev, () => up.classList.remove('over')));
  const ed = h('div', { class: 'ms-ed' }, topBar, fachEl, up, tools, bp, body, foot);
  head.append(pv); syncPv();
  // Foto irgendwo auf die Mitschrift-Seite ziehen → große Ablagefläche, loslassen → Max macht die saubere Mitschrift
  const dz = h('div', { class: 'ms-dz', 'aria-hidden': 'true' }, h('div', { class: 'ms-dzi' }, h('span', { html: ico('camera') }), h('b', {}, L('Hier loslassen', 'Drop it here')), h('small', {}, L('PDF, Foto, Word, PowerPoint oder Video – Max macht daraus deine Mitschrift', 'PDF, photo, Word, PowerPoint or video – Max turns it into your notes'))));
  let dzN = 0;
  const hasF = e => !!e.dataTransfer?.types?.includes('Files');
  wrap.addEventListener('dragenter', e => { if (!hasF(e)) return; e.preventDefault(); dzN++; wrap.classList.add('ms-dragging'); });
  wrap.addEventListener('dragover', e => { if (!hasF(e)) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; });
  wrap.addEventListener('dragleave', e => { if (!hasF(e)) return; if (--dzN <= 0) { dzN = 0; wrap.classList.remove('ms-dragging'); } });
  wrap.addEventListener('drop', e => { if (!hasF(e)) return; dzN = 0; wrap.classList.remove('ms-dragging'); ta.classList.remove('over'); const fl = [...(e.dataTransfer?.files || [])]; if (!fl.length) return; e.preventDefault(); e.stopPropagation(); takeFiles(fl); });
  if ((z.strokes || []).length) setTimeout(() => setDraw(false), 0);
  wrap.append(head, listBox, ed, dz);
  // Aus „Videos“: Transkript übernehmen und direkt zur sauberen Mitschrift machen
  try { const imp = JSON.parse(sessionStorage.getItem('tutor.msImport') || 'null'); if (imp && imp.text) { sessionStorage.removeItem('tutor.msImport'); ta.value = imp.text; draft.text = ta.value; if (imp.lang) draft.lang = imp.lang; keep(); setTimeout(() => make(true), 350); } } catch (e) {}
  keep();
  return () => { cleanup(); zp && zp.stop(); pvRO && pvRO.disconnect(); document.removeEventListener('visibilitychange', onHide); removeEventListener('pagehide', onHide); persist(true).then(() => refreshList()); };

  async function fromVideo(file) {
    const { getAccount } = await import('../api.js');
    if (!getAccount()) { import('../ui.js').then(m => m.apiError(Object.assign(new Error(L('Videos und Aufnahmen schreibe ich mit kostenlosem Konto ab.', 'I transcribe videos and recordings with a free account.')), { code: 'need_account' }), () => fromVideo(file))); return; }
    const sub = h('small', {}, L('Ich hol den Ton aus der Datei …', 'Extracting the audio …'));
    const bar = h('i', { class: 'ms-pbar' });
    const busy = h('div', { class: 'ms-busy', role: 'status' },
      h('span', { html: '<svg class="ms-penani" viewBox="0 0 54 40" aria-hidden="true"><path class="w" d="M3 26c5-9 9-9 11 0s6 9 9 0 6-9 9 0 6 9 9 0 6-8 10-2"/></svg>' }),
      h('div', { class: 'grow' }, h('b', {}, L('Max hört sich die Vorlesung an …', 'Max is listening to the lecture …')), sub, h('div', { class: 'ms-pb' }, bar)));
    foot.replaceWith(busy); ta.readOnly = true;
    try {
      const { transcribe } = await import('../transcribe.js');
      const t = await transcribe(file, (p, label) => { sub.textContent = label; bar.style.width = Math.round(p * 100) + '%'; });
      const min = Math.max(1, Math.round(t.dur / 60));
      ta.value = (ta.value.trim() ? ta.value.trim() + '\n\n' : '') + `[${L('Video', 'Video')}: ${t.name} · ${min} ${L('Min.', 'min')}]\n` + t.pages.join('\n');
      draft.text = ta.value; draft.video = true; keep();
      busy.replaceWith(foot); ta.readOnly = false;
      make(true);
    } catch (e) {
      busy.replaceWith(foot); ta.readOnly = false;
      if (e && e.name === 'AbortError') return;
      import('../ui.js').then(m => m.apiError(e, () => fromVideo(file))).catch(() => toast(e.message));
    }
  }

  // Datei(en) → Text → saubere Mitschrift (Sprache wird erkannt, bei Nicht-Deutsch fragt Max kurz)
  async function fromFiles(fl) {
    const isImg = f => /^image\//.test(f.type) || /\.(png|jpe?g|webp|heic|heif|gif)$/i.test(f.name || '');
    const isAv = f => /^(video|audio)\//.test(f.type) || /\.(mp4|mov|m4v|webm|m4a|mp3|wav|aac|ogg)$/i.test(f.name || '');
    const av = fl.find(isAv); if (av) return fromVideo(av);
    const imgs = fl.filter(isImg), docs = fl.filter(f => !isImg(f) && !isAv(f));
    if (!docs.length) return fromPhotos(imgs.slice(0, 9));
    const sub = h('small', {}, L('Ich lese deine Datei …', 'Reading your file …'));
    const busy = h('div', { class: 'ms-busy', role: 'status' },
      h('span', { html: '<svg class="ms-penani" viewBox="0 0 54 40" aria-hidden="true"><path class="w" d="M3 26c5-9 9-9 11 0s6 9 9 0 6-9 9 0 6 9 9 0 6-8 10-2"/></svg>' }),
      h('div', {}, h('b', {}, L('Max liest deine Unterlagen …', 'Max is reading your material …')), sub));
    foot.replaceWith(busy); ta.readOnly = true;
    try {
      const { readFile, pdfPages, imageToJpeg } = await import('../ingest.js');
      let text = '';
      const pics = [];   // Bilder zum Abschreiben: Fotos + Seiten eingescannter PDFs
      for (const f of imgs) pics.push(await imageToJpeg(f));
      for (const f of docs.slice(0, 4)) {
        const r = await readFile(f, () => {}, { soft: true });
        if (r.scan) { const pp = await pdfPages(f); for (let i = 1; i <= Math.min(pp.n, 12) && pics.length < 15; i++) { sub.textContent = L(`Seite ${i} von ${Math.min(pp.n, 12)} …`, `Page ${i} of ${Math.min(pp.n, 12)} …`); pics.push(await pp.render(i)); } pp.close(); }
        else text += (text ? '\n\n' : '') + r.pages.join('\n');
      }
      for (let i = 0; i < pics.length; i += 3) {
        sub.textContent = L(`Ich schreib ab … ${Math.min(i + 3, pics.length)} von ${pics.length}`, `Transcribing … ${Math.min(i + 3, pics.length)} of ${pics.length}`);
        const r = await ask('ocr', { opts: { imgs: Math.min(3, pics.length - i), from: i + 1 } }, { images: pics.slice(i, i + 3) });
        text += '\n\n' + ((r.data && r.data.seiten) || []).map(String).join('\n\n');
      }
      text = text.trim().slice(0, 30000);
      if (text.length < 15) throw new Error(L('Darin konnte ich keinen Text finden.', 'I couldn’t find any text in it.'));
      ta.value = (ta.value.trim() ? ta.value.trim() + '\n\n' : '') + text; draft.text = ta.value; keep();
      busy.replaceWith(foot); ta.readOnly = false;
      make(true);
    } catch (e) {
      busy.replaceWith(foot); ta.readOnly = false;
      import('../ui.js').then(m => m.apiError(e)).catch(() => toast(e.message));
    }
  }

  async function fromPhotos(files) {
    const busy = h('div', { class: 'ms-busy', role: 'status' },
      h('span', { html: '<svg class="ms-penani" viewBox="0 0 54 40" aria-hidden="true"><path class="w" d="M3 26c5-9 9-9 11 0s6 9 9 0 6-9 9 0 6 9 9 0 6-8 10-2"/></svg>' }),
      h('div', {}, h('b', {}, L('Max liest dein Foto …', 'Max is reading your photo …')), h('small', {}, L('Handschrift, Tafel, Folie – danach schreibt er alles sauber ab', 'handwriting, board, slide – then he writes it all up neatly'))));
    foot.replaceWith(busy); ta.readOnly = true;
    try {
      const { imageToJpeg } = await import('../ingest.js');
      let text = '';
      for (let i = 0; i < files.length; i += 3) {
        const images = []; for (const f of files.slice(i, i + 3)) images.push(await imageToJpeg(f));
        const r = await ask('ocr', { opts: { imgs: images.length, from: i + 1 } }, { images });
        text += ((r.data && r.data.seiten) || []).map(String).join('\n\n') + '\n\n';
      }
      text = text.trim();
      if (text.length < 15) throw new Error(L('Darauf konnte ich nichts lesen. Fotografier es gerade von oben und gut beleuchtet.', 'I couldn’t read anything on it. Take the photo straight from above in good light.'));
      ta.value = (ta.value.trim() ? ta.value.trim() + '\n\n' : '') + text; draft.text = ta.value; keep();
      busy.replaceWith(foot); ta.readOnly = false;
      make(true);
    } catch (e) {
      busy.replaceWith(foot); ta.readOnly = false;
      import('../ui.js').then(m => m.apiError(e)).catch(() => toast(e.message));
    }
  }

  // Entwurf wird zur fertigen Mitschrift (gleiches Dokument – kein Doppel)
  async function finalize(name, pages, ms) {
    clearTimeout(pT); await chain;
    if (doc) { doc.name = name; doc.pages = pages; doc.chars = pages.join('').length; doc.ms = ms; doc.used = Date.now(); await saveNow(doc); await refreshList(); }
    else doc = await createDoc({ name, pages, chars: pages.join('').length, extra: { kind: 'mitschrift', ms } });
    linkMitschriften();
    ls.set(DKEY, { fach: draft.fach, text: '', stil: ms.stil, at: 0, skript: draft.skript, blatt: { ...blatt }, docId: null });
    const id = doc.id; doc = null; draft.text = ''; draft.zeichnung = { strokes: [], h: 1250 };   // nichts mehr als Entwurf nachspeichern
    const to = '#/app/mitschrift/' + id;
    import('../lib.js').then(m => m.markMade('mitschrift', { href: to, name })).catch(() => {});
    if (location.hash !== to) { location.hash = to; return; }
    // Adresse ist schon die des Entwurfs: Blatt direkt hier zeigen
    const d = await openDoc(id); window.scrollTo(0, 0); wrap.replaceChildren(); sheetView(wrap, d);
  }

  async function make(photo) {
    const notes = ta.value.trim(), hasZ = (z.strokes || []).length > 0; if (notes.length < 25 && !(photo && notes.length) && !hasZ) return;
    // Sprache der Notizen: Standard = gleiche Sprache; nicht Deutsch → vorher kurz fragen (einmal pro Entwurf)
    const nl = detectLang(notes);
    if (nl && nl !== 'de' && !draft.lang) draft.lang = await askLang(nl, { what: L('Ich schreib deine Mitschrift standardmäßig in der Sprache deiner Notizen. Du kannst aber auch eine andere wählen.', 'By default I write your notes up in the language you took them in. You can pick another one too.') });
    const outL = draft.lang || nl || '';
    const busy = h('div', { class: 'ms-busy', role: 'status' },
      h('span', { html: '<svg class="ms-penani" viewBox="0 0 54 40" aria-hidden="true"><path class="w" d="M3 26c5-9 9-9 11 0s6 9 9 0 6-9 9 0 6 9 9 0 6-8 10-2"/></svg>' }),
      h('div', {}, h('b', {}, L('Max schreibt sauber ab …', 'Max is writing it up …')), h('small', {}, L('ordnet, korrigiert, zeichnet Skizzen – dauert ca. 15 Sekunden', 'sorting, correcting, sketching – takes about 15 seconds'))));
    foot.replaceWith(busy); ta.readOnly = true;
    try {
      const sk = draft.skript && S.list.find(d => d.id === draft.skript);
      // Zeichnung: Handschrift darauf lesen lassen, damit sie in die Mitschrift einfließt
      let fromZ = '';
      if (hasZ) { const img = drawingJpeg(z); if (img) { try { const o = await ask('ocr', { opts: { imgs: 1, from: 1 } }, { images: [img] }); fromZ = String(((o.data && o.data.seiten) || [])[0] || '').trim(); } catch (e) { if (['cap', 'limit'].includes(e.code)) throw e; } } }
      const all = (notes + (fromZ.length > 8 ? '\n\n[Handschriftlich/Skizze]: ' + fromZ : '')).trim();
      if (all.length < 25 && hasZ) {   // nur gezeichnet: ohne KI als Blatt speichern
        const t0 = (draft.fach ? draft.fach + ' – ' : '') + L('Skizze', 'Sketch');
        await finalize(t0, [t0 + (all ? '\n' + all : '')], { data: { titel: t0, kern: all, abschnitte: [], korrekturen: [], fragen: [] }, raw: notes, stil, blatt: { ...blatt }, fach: draft.fach, zeichnung: { strokes: z.strokes, h: z.h }, at: Date.now() });
        return;
      }
      const r = await ask('mitschrift', Object.assign(outL ? { lang: outL } : {}, { opts: Object.assign({ notes: all, fach: draft.fach, stil }, draft.video ? { quelle: 'video' } : {}) }, sk ? { material: forWhole(sk).slice(0, 30000), docName: sk.name } : {}));
      const data = clean(r.data);
      if (!data.abschnitte.length) throw new Error(L('Die Mitschrift kam leer an. Versuch es nochmal.', 'The notes came back empty. Please try again.'));
      const text = asText(data);
      await finalize(data.titel || L('Mitschrift', 'Notes'), [text], { data, raw: notes, stil, blatt: { ...blatt }, zeichnung: hasZ ? { strokes: z.strokes, h: z.h } : undefined, fach: draft.fach, skript: sk ? sk.id : '', foto: !!photo, at: Date.now() });
      try { window.BM && window.BM.track('Mitschrift', stil); } catch (e) {}
    } catch (e) {
      busy.replaceWith(foot); ta.readOnly = false;
      import('../ui.js').then(m => m.apiError(e, make)).catch(() => toast(e.message));
    }
  }
}

function list() {
  const items = S.list.filter(d => d.kind === 'mitschrift' && d.ms).sort((a, b) => ((b.ms.at || b.created || 0) - (a.ms.at || a.created || 0)));
  if (!items.length) return h('p', { class: 'ms-empty' }, L('Du hast noch keine Mitschriften gemacht – schreib einfach unten los.', 'You haven’t made any notes yet – just start writing below.'));
  return h('div', { class: 'ms-list' },
    items.slice(0, 40).map(d => h('a', { class: 'ms-card' + (d.ms.draft ? ' draft' : ''), href: '#/app/mitschrift/' + d.id }, d.ms.draft ? h('i', { class: 'ms-dtag' }, L('Entwurf', 'Draft')) : null, h('b', {}, d.name), h('small', {}, [d.ms.fach, ago(d.ms.at || d.created)].filter(Boolean).join(' · ')))));
}

// KI-Antwort absichern (fehlende Felder, falsche Typen)
const str = (v, n = 400) => (v == null ? '' : String(v)).slice(0, n);
function clean(d) {
  d = d && typeof d === 'object' ? d : {};
  const arr = v => Array.isArray(v) ? v : [];
  return {
    titel: str(d.titel, 120), kern: str(d.kern, 300),
    abschnitte: arr(d.abschnitte).slice(0, 14).map(a => ({ h: str(a && a.h, 120), punkte: arr(a && a.punkte).map(p => str(p, 300)).filter(Boolean).slice(0, 14), formel: str(a && a.formel, 200), legende: str(a && a.legende, 300), merke: str(a && a.merke, 300), bild: a && a.bild && typeof a.bild === 'object' && canDraw(a.bild) ? a.bild : null })).filter(a => a.h || a.punkte.length),
    korrekturen: arr(d.korrekturen).map(x => str(x, 300)).filter(Boolean).slice(0, 6),
    fragen: arr(d.fragen).map(x => str(x, 200)).filter(Boolean).slice(0, 4)
  };
}
function asText(d) {
  const out = [flat(d.titel), flat(d.kern), ''];
  d.abschnitte.forEach(a => { out.push(flat(a.h)); a.punkte.forEach(p => out.push('– ' + flat(p))); if (a.formel) out.push('Formel: ' + flat('\\(' + a.formel.replace(/\\[()[\]]/g, '') + '\\)')); if (a.legende) out.push(flat(a.legende)); if (a.merke) out.push('Merke: ' + flat(a.merke)); out.push(''); });
  if (d.korrekturen.length) out.push('Korrekturen:', ...d.korrekturen.map(x => '– ' + flat(x)));
  return out.join('\n').trim();
}

// ---------- Blatt ----------
function sheetView(wrap, d) {
  const ms = d.ms;
  let showRaw = false;
  const paperHost = h('div');
  const draw = (anim) => { paperHost.replaceChildren(paper(d, anim)); };
  const seg = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': L('Schrift', 'Handwriting') });
  const drawSeg = () => seg.replaceChildren(...[['fueller', L('Füller', 'Fountain pen')], ['druck', L('Druckschrift', 'Print')]].map(([k, n]) => h('button', { type: 'button', class: k === (ms.stil || 'fueller') ? 'on' : '', role: 'radio', 'aria-checked': String(k === ms.stil), onclick: () => { ms.stil = k; save(d); drawSeg(); draw(false); } }, n)));
  drawSeg();
  const raw = h('div', { class: 'ms-raw', hidden: true }, ms.raw || '');
  ms.blatt = Object.assign(blattDefault(), ms.blatt || {});
  const bp = blattPicker(ms.blatt, b => { ms.blatt = { ...b }; save(d); draw(false); }); bp.hidden = true;
  const blattBtn = h('button', { type: 'button', class: 'btn sm', 'aria-expanded': 'false', onclick: () => { bp.hidden = !bp.hidden; blattBtn.setAttribute('aria-expanded', String(!bp.hidden)); } }, h('i', { class: 'ms-swatch' }), L('Blatt', 'Paper'));
  const bar = h('div', { class: 'ms-bar' },
    h('a', { class: 'btn ghost sm grow', href: '#/app/mitschrift' }, h('span', { html: ico('left') }), L('Mitschriften', 'Notes')),
    seg, blattBtn,
    h('button', { type: 'button', class: 'btn sm', onclick: () => printIt() }, h('span', { html: ico('download') }), 'PDF'),
    h('a', { class: 'btn sm', href: `#/app/${d.id}/karten` }, h('span', { html: ico('cards') }), L('Karteikarten', 'Flashcards')),
    h('a', { class: 'btn sm', href: `#/app/${d.id}/quiz` }, h('span', { html: ico('quiz') }), 'Quiz'),
    h('button', { type: 'button', class: 'btn ghost sm', onclick: e => { showRaw = !showRaw; raw.hidden = !showRaw; e.currentTarget.lastChild.textContent = showRaw ? L('Notizen ausblenden', 'Hide notes') : L('Meine Notizen', 'My notes'); } }, h('span', { html: ico('note') }), h('span', {}, L('Meine Notizen', 'My notes'))));
  const sk = ms.skript && S.list.find(x => x.id === ms.skript);
  if (sk) bar.append(h('a', { class: 'btn ghost sm', href: `#/app/${sk.id}/hub` }, h('span', { html: ico('file') }), sk.name.length > 28 ? sk.name.slice(0, 27) + '…' : sk.name));
  wrap.append(bar, bp, paperHost, raw);
  draw(!ms.seen); if (!ms.seen) { ms.seen = 1; save(d); }
  const onR = () => paperHost.querySelectorAll('.ms-f, .ms-merke').forEach(el => el._box && el._box());
  addEventListener('resize', onR);
  return () => removeEventListener('resize', onR);
}

function printIt() {
  document.documentElement.classList.add('ms-printing');
  const off = () => { document.documentElement.classList.remove('ms-printing'); removeEventListener('afterprint', off); };
  addEventListener('afterprint', off);
  setTimeout(() => { window.print(); setTimeout(off, 1500); }, 60);
}

function paper(d, anim) {
  const ms = d.ms, x = ms.data, stil = ms.stil === 'druck' ? 'druck' : 'fueller';
  const blatt = Object.assign(blattDefault(), ms.blatt || {}), ink = inkOf(blatt);
  let i = 0; const A = el => { el.classList.add('ms-a'); el.style.setProperty('--i', i++); return el; };
  const p = h('article', { class: 'ms-paper ' + stil + (anim ? ' ms-in' : '') });
  applyBlatt(p, blatt);
  const date = new Date(ms.at || d.created || Date.now()).toLocaleDateString(L('de-DE', 'en-GB'), { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  p.append(A(h('div', { class: 'ms-meta' }, h('span', {}, ms.fach || ''), h('span', {}, date))));
  p.append(A(h('h1', { class: 'ms-t', html: rich(x.titel || d.name) })), A(h('div', {}, underline(420, 3, ink))));
  if (x.kern) p.append(A(h('p', { class: 'ms-kern', html: rich(x.kern) })));
  x.abschnitte.forEach((a, n) => {
    const sec = h('section', { class: 'ms-sec' });
    if (a.h) sec.append(A(h('h2', { class: 'ms-h', html: `${n + 1}. ` + rich(a.h) })));
    if (a.punkte.length) sec.append(h('ul', {}, a.punkte.map(t => A(h('li', { html: rich(t) })))));
    if (a.formel) { const f = A(h('div', { class: 'ms-f', html: formula(a.formel) })); f._box = box(f, 4 + n, ink); sec.append(h('div', {}, f)); }
    if (a.legende) sec.append(A(h('p', { class: 'ms-leg', html: rich(a.legende) })));
    if (a.merke) { const m = A(h('div', { class: 'ms-merke' }, h('b', {}, L('Merke: ', 'Remember: ')), h('span', { html: rich(a.merke) }))); m._box = box(m, 40 + n, '#c0392b'); sec.append(m); }
    if (a.bild) sec.append(A(h('figure', { class: 'ms-fig' }, sketch(a.bild, ink), a.bild.titel ? h('figcaption', {}, flat(a.bild.titel)) : null)));
    p.append(sec);
  });
  if (ms.zeichnung && ms.zeichnung.strokes && ms.zeichnung.strokes.length) { const cv = drawingEl(ms.zeichnung, ink); if (cv) p.append(A(h('figure', { class: 'ms-fig ms-zf' }, cv, x.abschnitte.length ? h('figcaption', {}, L('Meine Skizze', 'My sketch')) : null))); }
  if (x.korrekturen.length) p.append(A(h('div', { class: 'ms-kor' }, x.korrekturen.map(k => h('p', { html: '✎ ' + rich(k) })))));
  if (x.fragen.length) p.append(A(h('div', { class: 'ms-fr' }, h('h2', { class: 'ms-h' }, L('Check dich selbst', 'Test yourself')), h('ol', {}, x.fragen.map(q => h('li', { html: rich(q) }))))));
  p.append(A(h('div', { class: 'ms-sign' }, 'BWL Max · ' + L('Mitschrift', 'Notes'))));
  // Kästen erst zeichnen, wenn die Schrift geladen ist (sonst passen die Maße nicht)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => p.querySelectorAll('.ms-f, .ms-merke').forEach(el => el._box && el._box()));
  return p;
}
