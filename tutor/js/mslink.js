import { S } from './state.js';
import * as M from './me.js';

// Mitschriften ins passende Fach legen – auch rückwirkend, wenn das Fach erst später angelegt wird
export function linkMitschriften() {
  const me = M.getMe(); if (!me.faecher?.length) return;
  const todo = [];
  for (const d of S.list) {
    if (!d.ms || !d.ms.fach || M.fachOf(d.id)) continue;
    const f = M.findFach(d.ms.fach); if (f) todo.push([f.id, d.id]);
  }
  if (!todo.length) return;
  M.updateMe(m => todo.forEach(([fid, did]) => { const f = m.faecher.find(x => x.id === fid); if (f) f.docs = [...new Set([...(f.docs || []), did])]; }));
}

