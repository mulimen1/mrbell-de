// Lokaler Speicher (IndexedDB): Alles bleibt auf diesem Gerät.
const DB = 'tutor', VER = 1;
let dbp = null;
function open() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    let r;
    try { r = indexedDB.open(DB, VER); } catch (e) { rej(e); return; }
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('docs')) d.createObjectStore('docs', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const d = await open();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode), s = t.objectStore(store);
    let out; const r = fn(s);
    if (r) r.onsuccess = () => { out = r.result; };
    t.oncomplete = () => res(out);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}
// Fallback, falls IndexedDB nicht geht (privater Modus): im Speicher
const mem = { docs: new Map(), kv: new Map() };
let memMode = false;
async function safe(fn, fb) { if (memMode) return fb(); try { return await fn(); } catch (e) { memMode = true; console.warn('IndexedDB nicht verfügbar, nutze Arbeitsspeicher', e); return fb(); } }

export const docs = {
  all: () => safe(() => tx('docs', 'readonly', s => s.getAll()), () => [...mem.docs.values()]).then(a => (a || []).sort((x, y) => (y.used || y.created) - (x.used || x.created))),
  get: id => safe(() => tx('docs', 'readonly', s => s.get(id)), () => mem.docs.get(id)),
  put: doc => safe(() => tx('docs', 'readwrite', s => s.put(doc)), () => mem.docs.set(doc.id, doc)),
  del: id => safe(() => tx('docs', 'readwrite', s => s.delete(id)), () => mem.docs.delete(id)),
};
export const kv = {
  get: k => safe(() => tx('kv', 'readonly', s => s.get(k)), () => mem.kv.get(k)),
  set: (k, v) => safe(() => tx('kv', 'readwrite', s => s.put(v, k)), () => mem.kv.set(k, v)),
};
export async function wipe() {
  try { indexedDB.deleteDatabase(DB); } catch (e) {}
  try { Object.keys(localStorage).filter(k => k.startsWith('tutor.')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  mem.docs.clear(); mem.kv.clear(); dbp = null;
}
export async function exportAll() {
  const all = await docs.all();
  return new Blob([JSON.stringify({ app: 'tutor', v: 1, at: Date.now(), docs: all })], { type: 'application/json' });
}
export async function importAll(file) {
  const j = JSON.parse(await file.text());
  if (!j || j.app !== 'tutor' || !Array.isArray(j.docs)) throw new Error('Keine Tutor-Sicherung');
  for (const d of j.docs) if (d && d.id && Array.isArray(d.pages)) await docs.put(d);
  return j.docs.length;
}
