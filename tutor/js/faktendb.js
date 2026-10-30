// Faktendatenbank: geprüfte Kernaussagen je Thema (tutor/data/fakten/<slug>.json, jede Aussage mit Quelle).
// 1) belegeFuer(text): passende Aussagen + Quellen auswählen (lokal, ohne KI, schnell)
// 2) dbPruefung(text, raw): Max gleicht seine Antwort mit genau diesen Aussagen ab (ein kleiner interner KI-Aufruf).
//    Läuft NACH der Anzeige; findet er einen Widerspruch, wird das Siegel sofort zur gut sichtbaren Warnung mit der richtigen Aussage.
const BASE = '/tutor/data/fakten/';
let IDX = null; const THEMA = new Map();
const norm = s => String(s || '').toLowerCase().replace(/\\\(|\\\)|<[^>]+>/g, ' ').replace(/[^a-zäöüß0-9%§ ]+/g, ' ').replace(/\s+/g, ' ');

export async function index() {
  if (IDX) return IDX;
  try { const r = await fetch(BASE + '_index.json'); IDX = r.ok ? await r.json() : []; } catch (e) { IDX = []; }
  return IDX;
}
async function thema(slug) {
  if (THEMA.has(slug)) return THEMA.get(slug);
  const p = fetch(BASE + slug + '.json').then(r => r.ok ? r.json() : null).catch(() => null);
  THEMA.set(slug, p); return p;
}
export async function themaDaten(slug) { return thema(slug); }

// Treffer zählen: Themenname/Slug zählt viel, Schlagworte wenig. Kurze Wörter nur als ganze Wörter.
function treffer(t, w) { if (!w || w.length < 3) return false; return w.length < 6 ? new RegExp('(^| )' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '( |$)').test(t) : t.includes(w); }

// Thema zählt, wenn sein Name im Text steht (5 Punkte) oder mindestens 3 seiner Schlagworte
export async function themenFuer(text, max = 2) {
  const t = ' ' + norm(text) + ' ', idx = await index();
  return idx.map(x => ({ x, s: (x.n || []).reduce((a, w) => a + (treffer(t, w) ? 5 : 0), 0) + (x.w || []).reduce((a, w) => a + (treffer(t, w) ? 1 : 0), 0) }))
    .filter(o => o.s >= 3).sort((a, b) => b.s - a.s).slice(0, max).map(o => o.x.t);
}

export async function belegeFuer(text, max = 8) {
  const slugs = await themenFuer(text);
  if (!slugs.length) return [];
  const t = ' ' + norm(text) + ' ', out = [];
  for (const s of slugs) {
    const d = await thema(s); if (!d) continue;
    for (const a of d.aussagen || []) {
      const sc = (a.schlagworte || []).reduce((n, w) => n + (treffer(t, norm(w).trim()) ? 1 : 0), 0) + (a.art === 'definition' ? 0.5 : 0);
      out.push({ id: a.id, thema: d.name, art: a.art, aussage: a.aussage, quelle: a.quelle || {}, sc });
    }
  }
  return out.sort((a, b) => b.sc - a.sc).slice(0, max);
}

// Kurzname der Quellen fürs Siegel (z. B. „Gabler · HGB § 253“)
export function quellenKurz(belege, n = 2) {
  const seen = []; for (const b of belege) { const q = b.quelle && b.quelle.name; if (q && !seen.includes(q)) seen.push(q); }
  return seen.slice(0, n).join(' · ') + (seen.length > n ? ` +${seen.length - n}` : '');
}

// KI-Abgleich: nur Widersprüche zu den belegten Aussagen melden (keine Stilkritik). Ergebnis {ok, geprueft, widersprueche:[{zitat, id, richtig, quelle}]}
export async function dbPruefung(text, belege, raw, { timeout = 20000 } = {}) {
  if (!belege.length || !raw) return { ok: true, geprueft: 0, widersprueche: [] };
  const liste = belege.map(b => `[${b.id}] ${b.aussage}`).join('\n');
  const prompt = `FAKTENPRÜFUNG (interne Prüfung, keine Erklärung an den Nutzer). Unten stehen geprüfte Aussagen aus seriösen Quellen und ein Antworttext. Prüfe NUR, ob der Antworttext einer der geprüften Aussagen inhaltlich WIDERSPRICHT (falsche Zahl, falscher Grenzwert, falsche Definition, falsche Formel, falsche Rechtslage). Vereinfachungen, fehlende Details, andere Beispiele und Stil sind KEIN Widerspruch. Antworte AUSSCHLIESSLICH mit JSON: {"widersprueche":[{"zitat":"wörtliche Stelle aus dem Antworttext (max. 160 Zeichen)","id":"ID der geprüften Aussage"}]} – leer, wenn es keinen Widerspruch gibt.\n\nGEPRÜFTE AUSSAGEN:\n${liste}\n\nANTWORTTEXT:\n${String(text).slice(0, 6000)}`;
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await raw('chat', { messages: [{ role: 'user', content: prompt }], opts: { voice: false, assistant: true, entry: true, rechenkorrektur: true } }, { signal: ctrl.signal });
    const m = /\{[\s\S]*\}/.exec(String(r.text || '')); if (!m) return { ok: null, geprueft: belege.length, widersprueche: [] };
    const obj = JSON.parse(m[0]);
    const w = (obj.widersprueche || []).map(x => { const b = belege.find(y => y.id === x.id); return b && x.zitat && norm(text).includes(norm(x.zitat).trim().slice(0, 30)) ? { zitat: String(x.zitat).slice(0, 200), id: b.id, richtig: b.aussage, quelle: b.quelle } : null; }).filter(Boolean);
    return { ok: !w.length, geprueft: belege.length, widersprueche: w };
  } catch (e) { return { ok: null, geprueft: belege.length, widersprueche: [] }; } finally { clearTimeout(to); }
}
