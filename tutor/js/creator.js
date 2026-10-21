// Creator Mode (TikTok-Sketche) – nur für die Konten des Gründers.
// Die Sketche liefert der Server ausschließlich an freigeschaltete Konten (Aktion „creator“); im Code steht keiner.
// Ablauf: „/sketch intro“ startet → jede weitere Eingabe muss zum nächsten Schritt passen → feste Antwort, keine KI.
// Nach dem letzten Schritt ist die Session vorbei und Max ist wieder der normale Tutor.
import { ask, getSession } from './api.js';

let SK = null, loading = null, cur = null, idx = 0, last = null;   // last: zuletzt gespielter Sketch – → startet ihn neu (nächster Take)
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
// Spracherkennung schreibt Wörter mal mit Bindestrich, mal getrennt, mal zusammen – verglichen wird ohne Leer- und Satzzeichen
const comp = s => norm(s).replace(/[^a-z0-9äöüß]/g, '');

let denied = false;   // Server sagt „kein Creator-Konto“ → nicht bei jeder Frage neu fragen
export function load() {
  if (SK || denied || !getSession()) return Promise.resolve(!!SK);
  if (!loading) loading = ask('creator', {}).then(r => { SK = Array.isArray(r.sketches) ? r.sketches : null; if (SK && SK.some(s => s.design)) document.documentElement.dataset.creatorPink = '1'; if (SK) { try { document.cookie = 'mb_intern=1; max-age=31536000; path=/; secure; samesite=lax'; } catch (e) {} }   // Ben selbst nicht mitzählen return !!SK; }).catch(e => { if (e && e.code === 'origin') denied = true; return false; }).finally(() => { loading = null; });
  return loading;
}
export const active = () => !!cur;
// Sketch Designwechsel: Gelb → empörter Satz, zurück zu Grün (nur direkt nach Gelb) → Pointe. Sonst nichts.
export function designLine(from, to) {
  const d = (SK || []).find(s => s.design); if (!d) return null;
  if (to === 'gelb' && from !== 'gelb') return d.design.gelb || null;
  if (to === 'gruen' && from === 'gelb') return d.design.gruen || null;
  return null;
}
export const sequential = () => !!(cur && !cur.pairs);
export const canKey = () => !!((cur && !cur.pairs) || last);
// Nächster Take per Taste: ist der Sketch durch, beginnt er wieder von vorn
export function keyNext() { if (!cur && last) { cur = last; idx = 0; } return cur && !cur.pairs ? next([]) : null; }
export const isCmd = t => /^\/sketch\b/i.test(String(t || '').trim());

// Liefert null (→ normaler Tutor), { msg } (nur Statuszeile) oder { step, prefetch } (feste Szene)
export function handle(text) {
  if (!SK) return null;
  const t = norm(text);
  if (isCmd(t)) {
    const arg = t.slice(7).trim();
    if (['stop', 'ende', 'reset', 'aus'].includes(arg)) { cur = null; idx = 0; if (arg !== 'reset') last = null; delete document.documentElement.dataset.creatorLabel; return { msg: arg === 'reset' ? 'Sketch zurückgesetzt – neuer Take mit /sketch …' : 'Sketch beendet – Max ist wieder der normale Tutor.' }; }
    const sk = SK.find(s => s.id === arg);
    if (!sk) return { msg: 'Sketche: ' + SK.map(s => '/sketch ' + s.id).join(' · ') };
    if (sk.design) return { msg: 'Designwechsel ist immer bereit: Farbe auf Gelb, dann zurück auf Grün.' };
    cur = sk; idx = 0; last = sk.pairs ? null : sk;
    if (sk.pairs) { document.documentElement.dataset.creatorLabel = 'BWL Max'; }   // Screenshots: Markenname unter Max' Kopf
    else delete document.documentElement.dataset.creatorLabel;
    if (sk.pairs) return { msg: `${sk.name} an – ${sk.steps.length} vorbereitete Antworten. /sketch stop schaltet aus.` };
    if (sk.steps[0] && sk.steps[0].start) return next(sk.steps.slice(1));
    if (sk.armed) return { msg: `„${sk.name}“ scharf – ich warte auf deinen Satz an Max.`, prefetch: sk.steps, prep: (sk.steps.find(x => x.plan) || {}).plan };
    return { msg: `Sketch „${sk.name}“ bereit.`, prefetch: sk.steps };
  }
  // Startsatz („Darf ich vorstellen …“) startet den Sketch von selbst – kein /sketch nötig, auch nicht nach Neuladen
  if (!cur) {
    const sk = SK.find(x => !x.pairs && !x.armed && x.steps[0] && (x.steps[0].when || []).some(w => comp(t).includes(comp(w))));
    if (!sk) return null;
    cur = sk; idx = 0; last = sk; delete document.documentElement.dataset.creatorLabel;
    return next(sk.steps.slice(1));
  }
  // X-Modus (pairs): feste Antworten auf bestimmte Fragen, in beliebiger Reihenfolge; alles andere geht normal an die KI
  if (cur.pairs) { const hit = cur.steps.find(st => (st.when || []).some(w => comp(t).includes(comp(w)))); return hit ? { step: hit, prefetch: [] } : null; }
  // Scharfer Sketch (z. B. Lernplan): wartet auf den Satz an Max – alles andere (Satz in die Kamera, Reaktion danach) wird ignoriert
  if (cur.armed && idx === 0) {
    const st = cur.steps[0];
    if ((st.when || []).some(w => comp(t).includes(comp(w)))) return next([]);
    return { msg: 'Bereit – sag deinen Satz an Max.', miss: true };
  }
  // Sketch läuft: egal was gehört wurde – der nächste Schritt kommt (keine Spracherkennung, die den Take ruiniert)
  return next([]);
}
function next(prefetch) {
  const st = cur.steps[idx++];
  if (idx >= cur.steps.length) { if (cur.armed) idx = 0; else cur = null; }   // letzter Schritt → normaler Tutor; scharfe Sketche bleiben scharf für den nächsten Take
  return { step: st, prefetch };
}
