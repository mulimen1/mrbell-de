// Gedächtnis: Max merkt sich pro Konto eine kurze Notiz (Themen, wo es hakt, Klausurtermine, wie man lernen will).
// Standard an, in „Max einstellen“ abschaltbar. Die Notiz liegt am Konto (nur für diesen Nutzer) und hängt serverseitig an jeder Frage.
// Verlässlich: Neue Nachrichten sammeln sich lokal, bis die Zusammenfassung wirklich gespeichert ist – geht etwas schief
// (Tab zu, offline), wird es beim nächsten Öffnen nachgeholt. Kosten: ein kurzer Haiku-Aufruf pro Gespräch, kein Kontingent.
import { ls } from './util.js';
import { ask, getAccount, onAccount } from './api.js';

const ON = 'tutor.mem.on', PEND = 'tutor.mem.pending';
const MAX_MSG = 30, EVERY = 8, IDLE = 15 * 60e3;

export const memOn = () => ls.get(ON, true) !== false;
const pending = () => { const p = ls.get(PEND, null); return p && Array.isArray(p.m) ? p : { m: [], at: 0, who: '' }; };
const who = () => (getAccount() && getAccount().email) || '';

// Jede Nachricht im Gespräch (vom Tutor aufgerufen)
export function remember(role, content) {
  if (!memOn() || !who()) return;
  const text = String(content || '').replace(/```[\s\S]*?```/g, '[Tafel]').replace(/\[\[[^\]]*\]\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 600);
  if (!text) return;
  let p = pending(); if (p.who && p.who !== who()) p = { m: [], at: 0, who: '' };
  p.m.push([role === 'user' ? 'u' : 'a', text]); p.m = p.m.slice(-MAX_MSG); p.at = Date.now(); p.who = who();
  ls.set(PEND, p);
  if (p.m.filter(x => x[0] === 'u').length >= EVERY) flush();
}

let busy = null;
export function flush() {
  if (busy) return busy;
  const p = pending();
  if (!memOn() || !who() || p.who !== who() || !p.m.some(x => x[0] === 'u')) return Promise.resolve(false);
  const take = p.m.length;
  busy = (async () => {
    try {
      const old = await ask('merken', { opts: { op: 'get' } });
      const verlauf = p.m.map(([r, t]) => (r === 'u' ? 'Studierender: ' : 'Max: ') + t).join('\n').slice(-7000);
      const r = await ask('merken', { opts: { op: 'sum', alt: String(old.text || ''), verlauf } });
      const notiz = String((r.data && r.data.notiz) || '').trim();
      if (notiz) await ask('merken', { opts: { op: 'set', text: notiz } });
      // nur die Nachrichten entfernen, die jetzt drin sind (neue, die währenddessen kamen, bleiben)
      const q = pending(); if (q.who === p.who) { q.m = q.m.slice(take); ls.set(PEND, q); }
      return true;
    } catch (e) { return false; }   // bleibt liegen – nächster Versuch beim nächsten Anlass
    finally { busy = null; }
  })();
  return busy;
}

// Abschalten löscht auch die gespeicherte Notiz
export async function setMemOn(v) {
  ls.set(ON, !!v);
  if (!v) { ls.set(PEND, null); if (who()) { try { await ask('merken', { opts: { op: 'del' } }); } catch (e) {} } }
}
export async function memText() { if (!who()) return ''; try { return String((await ask('merken', { opts: { op: 'get' } })).text || ''); } catch (e) { return ''; } }

// Nachholen: beim Start (wenn das letzte Gespräch eine Weile her ist) und wenn der Tab verlassen wird
onAccount(a => { if (a) setTimeout(() => { const p = pending(); if (p.m.length && Date.now() - p.at > IDLE) flush(); }, 4000); });
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && pending().m.filter(x => x[0] === 'u').length >= 2) flush(); });
