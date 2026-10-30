// Alles Erstellte im Konto: Podcasts, Karteikarten, Quiz, Lernzettel, Tafeln, Lernpfad, Mitschriften, Max-Kurzskripte, Fortschritt.
// Hochgeladenes (Skripte, Vorlesungen, Video-Transkripte) bleibt als Text NUR auf dem Gerät – im Konto steht nur Name + was daraus erstellt wurde.
// Lokal bleibt alles wie bisher in IndexedDB. Ist man angemeldet, wird es zusätzlich im eigenen Konto abgelegt
// (nur für diese Person, Server-Speicher „Konto“, eigener Platz „w“) und auf jedem Gerät zusammengeführt.
// Nicht synchronisiert: Chatverlauf, vertonte Podcast-Audios (werden beim Abspielen neu geholt), Beispiel-Skript.
import { ls } from './util.js';
import { L } from './i18n.js';
import { docs } from './db.js';
import { S, emit, refreshList, docWrites, migrate } from './state.js';
import { ask, getAccount, onAccount } from './api.js';
import { looseBoards, setLooseBoards } from './lib.js';

const TOMB = 'tutor.werke.tomb', INFO = 'tutor.werke.info', MAXB = 2800000;
const tombs = () => ls.get(TOMB, {}) || {};
const email = () => { const a = getAccount(); return a && a.email ? String(a.email).toLowerCase() : ''; };

// Für das Konto: ohne Chat und ohne Audio-Schnipsel (groß, jederzeit neu erzeugbar)
const ownText = d => !!(d.generated || d.kind === 'mitschrift');   // von Max oder der Person selbst geschrieben
function slim(d) {
  const o = Object.assign({}, d);
  delete o.chat; delete o.owner;
  if (!ownText(d)) {
    delete o.pages; o.ohneText = true;
    if (o.video) o.video = Object.assign({}, o.video, { lines: [] });
    if (Array.isArray(o.pathSrc)) o.pathSrc = o.pathSrc.map(x => x && x.kind !== 'topic' ? { name: x.name, kind: 'topic', weight: x.weight } : x);
  } else delete o.ohneText;
  if (Array.isArray(o.podcasts)) o.podcasts = o.podcasts.map(p => { const q = Object.assign({}, p); delete q.audio; return q; });
  return o;
}

async function gz(s) {
  if (typeof CompressionStream !== 'function') return 'j:' + s;
  const buf = await new Response(new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
  const u = new Uint8Array(buf); let b = '';
  for (let i = 0; i < u.length; i += 0x8000) b += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return 'g:' + btoa(b);
}
async function ungz(s) {
  s = String(s || '');
  if (s.startsWith('j:')) return JSON.parse(s.slice(2));
  if (!s.startsWith('g:')) return null;
  const bin = atob(s.slice(2)), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return JSON.parse(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
}

// Eigene Skripte: noch ohne Besitzer (offline erstellt) → gehören der angemeldeten Person
const mine = (d, em) => d && !d.sample && (!d.owner || d.owner === em);

let running = false, again = false, lastRun = 0, t = 0;
export async function syncWerke() {
  const em = email();
  if (!em) return;
  if (running) { again = true; return; }
  running = true; lastRun = Date.now();
  try {
    const r = await ask('konto', { opts: { op: 'get', slot: 'w' } });
    if (!r || r.slot !== 'w') return;   // Server kennt den eigenen Platz noch nicht → nichts tun (schützt „Mein Bereich“)
    const R = (r.daten ? await ungz(r.daten) : null) || {};
    const rd = Array.isArray(R.docs) ? R.docs : [], rt = R.tomb || {};
    const lt = tombs(), tomb = Object.assign({}, rt);
    for (const [k, v] of Object.entries(lt)) tomb[k] = Math.max(tomb[k] || 0, v);
    let changed = false;
    const local = new Map((await docs.all()).map(d => [d.id, d]));
    // 1) Gelöschtes übernehmen
    for (const [id, at] of Object.entries(tomb)) {
      const l = local.get(id);
      if (l && mine(l, em) && (l.used || l.created || 0) <= at) { await docs.del(id); local.delete(id); if (S.doc && S.doc.id === id) S.doc = null; changed = true; }
    }
    // 2) Neues/Neueres vom Konto übernehmen
    for (const x of rd) {
      if (!x || !x.id || (tomb[x.id] || 0) >= (x.used || x.created || 0)) continue;
      const l = local.get(x.id);
      if (l && !mine(l, em)) continue;
      if (l && (l.used || 0) >= (x.used || 0)) continue;
      const n = migrate(Object.assign({}, x, { owner: em, chat: l ? l.chat || [] : [] }));
      if (x.ohneText) {
        if (l && Array.isArray(l.pages) && !l.ohneText) {   // Original liegt hier → behalten
          n.pages = l.pages; n.chars = l.chars; n.pathSrc = l.pathSrc; delete n.ohneText;
          if (l.video) n.video = Object.assign({}, x.video || {}, { lines: l.video.lines || [] });
        } else n.pages = [L(`Thema: ${x.name}\n(Das Original-Skript liegt auf dem Gerät, auf dem es hochgeladen wurde. Lade es hier nochmal hoch, um wieder mit dem Originaltext zu arbeiten. Bis dahin: aus Fachwissen erklären, auf BWL-Klausurniveau.)`, `Topic: ${x.name}\n(The original material is on the device it was uploaded on. Upload it here again to work with the original text. Until then: explain from subject knowledge, at exam level.)`)];
      }
      if (l && Array.isArray(l.podcasts)) n.podcasts.forEach(p => { const o = l.podcasts.find(q => q.id === p.id); if (o && o.audio) p.audio = o.audio; });
      if (S.doc && S.doc.id === n.id) { Object.assign(S.doc, n); await docs.put(S.doc); } else await docs.put(n);
      local.set(n.id, n); changed = true;
    }
    // 3) Besitz festhalten für alles, was auf diesem Gerät ohne Konto entstand
    for (const d of local.values()) if (!d.sample && !d.owner) { d.owner = em; await docs.put(d); }
    // 4) Tafeln ohne Skript: neuere Liste gewinnt
    const la = ls.get('tutor.lib.boardsAt', 0) || 0;
    if (Array.isArray(R.loose) && (R.looseAt || 0) > la) { setLooseBoards(R.loose, true); ls.set('tutor.lib.boardsAt', R.looseAt); changed = true; }
    ls.set(TOMB, tomb);
    if (changed) { await refreshList(); emit(); }
    // 5) Zurückschreiben, wenn dieses Gerät etwas hat, das im Konto fehlt oder älter ist
    const out = [...local.values()].filter(d => mine(d, em));
    const rmap = new Map(rd.map(x => [x.id, x.used || 0]));
    const looseAt = Math.max(la, R.looseAt || 0);
    const dirty = out.some(d => (rmap.get(d.id) ?? -1) < (d.used || 0)) || rd.some(x => !local.has(x.id) && !tomb[x.id])
      || Object.keys(tomb).some(k => !(k in rt)) || la > (R.looseAt || 0);
    if (!dirty) { ls.set(INFO, { at: Date.now(), err: '' }); return; }
    const keep = rd.filter(x => !local.has(x.id) && !tomb[x.id]);   // im Konto, hier (noch) nicht – nicht verlieren
    const body = { v: 1, at: Date.now(), docs: [...out.map(slim), ...keep], tomb, loose: looseBoards(), looseAt };
    const s = await gz(JSON.stringify(body));
    if (s.length > MAXB) { ls.set(INFO, { at: Date.now(), err: 'zu groß' }); return; }
    const w = await ask('konto', { opts: { op: 'put', slot: 'w', daten: s } });
    ls.set(INFO, { at: Date.now(), err: w && w.ok === false ? (w.message || 'Fehler') : '' });
  } catch (e) { ls.set(INFO, { at: Date.now(), err: (e && e.message) || 'Fehler' }); }
  finally { running = false; if (again) { again = false; setTimeout(syncWerke, 1500); } }
}

const soon = (ms = 4000) => { clearTimeout(t); t = setTimeout(syncWerke, ms); };
let started = false;
export function startWerke() {
  if (started) return; started = true;
  // Browser bitten, die lokalen Daten nicht von selbst zu löschen (Safari räumt sonst nach 7 Tagen ohne Besuch auf)
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => {}); } catch (e) {}
  docWrites.add(({ del } = {}) => { if (del) { const tb = tombs(); tb[del] = Date.now(); ls.set(TOMB, tb); } soon(); });
  onAccount(a => { if (a) soon(800); });
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - lastRun > 60e3) soon(300); });
  addEventListener('pagehide', () => { if (t) { clearTimeout(t); syncWerke(); } });
}
