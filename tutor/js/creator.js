// Creator Mode (TikTok-Sketche) – nur für die Konten des Gründers.
// Die Sketche liefert der Server ausschließlich an freigeschaltete Konten (Aktion „creator“); im Code steht keiner.
// Ablauf: „/sketch intro“ startet → jede weitere Eingabe muss zum nächsten Schritt passen → feste Antwort, keine KI.
// Nach dem letzten Schritt ist die Session vorbei und Max ist wieder der normale Tutor.
import { ask, getSession } from './api.js';

let SK = null, loading = null, cur = null, idx = 0;
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
// Spracherkennung schreibt Wörter mal mit Bindestrich, mal getrennt, mal zusammen – verglichen wird ohne Leer- und Satzzeichen
const comp = s => norm(s).replace(/[^a-z0-9äöüß]/g, '');

export function load() {
  if (SK || !getSession()) return Promise.resolve(!!SK);
  if (!loading) loading = ask('creator', {}).then(r => { SK = Array.isArray(r.sketches) ? r.sketches : null; return !!SK; }).catch(() => false).finally(() => { loading = null; });
  return loading;
}
export const active = () => !!cur;
export const isCmd = t => /^\/sketch\b/i.test(String(t || '').trim());

// Liefert null (→ normaler Tutor), { msg } (nur Statuszeile) oder { step, prefetch } (feste Szene)
export function handle(text) {
  if (!SK) return null;
  const t = norm(text);
  if (isCmd(t)) {
    const arg = t.slice(7).trim();
    if (['stop', 'ende', 'reset', 'aus'].includes(arg)) { cur = null; idx = 0; delete document.documentElement.dataset.creatorLabel; return { msg: arg === 'reset' ? 'Sketch zurückgesetzt – neuer Take mit /sketch …' : 'Sketch beendet – Max ist wieder der normale Tutor.' }; }
    const sk = SK.find(s => s.id === arg);
    if (!sk) return { msg: 'Sketche: ' + SK.map(s => '/sketch ' + s.id).join(' · ') };
    cur = sk; idx = 0;
    if (sk.pairs) { document.documentElement.dataset.creatorLabel = 'BWL Max'; }   // Screenshots: Markenname unter Max' Kopf
    else delete document.documentElement.dataset.creatorLabel;
    if (sk.pairs) return { msg: `${sk.name} an – ${sk.steps.length} vorbereitete Antworten. /sketch stop schaltet aus.` };
    if (sk.steps[0] && sk.steps[0].start) return next(sk.steps.slice(1));
    return { msg: `Sketch „${sk.name}“ bereit.`, prefetch: sk.steps };
  }
  if (!cur) return null;
  // X-Modus (pairs): feste Antworten auf bestimmte Fragen, in beliebiger Reihenfolge; alles andere geht normal an die KI
  if (cur.pairs) { const hit = cur.steps.find(st => (st.when || []).some(w => comp(t).includes(comp(w)))); return hit ? { step: hit, prefetch: [] } : null; }
  const st = cur.steps[idx];
  if (!st || !(st.when || []).some(w => comp(t).includes(comp(w)))) return { msg: `Gehört: „${String(text).slice(0, 60)}“ – Sketch wartet auf: „${st ? st.hint : ''}“`, miss: true };
  return next([]);
}
function next(prefetch) {
  const st = cur.steps[idx++];
  if (idx >= cur.steps.length) cur = null;   // letzter Schritt → wieder normaler Tutor
  return { step: st, prefetch };
}
