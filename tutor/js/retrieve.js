// Passenden Ausschnitt der Vorlesung für die KI wählen (läuft im Browser).
const FULL_LIMIT = 60000;      // bis hierhin geht das ganze Skript mit (wird gecacht -> günstig)
const CHUNK_LIMIT = 30000;

const STOP = new Set('der die das und oder ein eine einer eines einem einen ist sind war wird werden mit von zu im in am an auf für bei aus als auch nicht nur noch wie was wer wo es sie er ich du wir ihr man den dem des sich so dass da dann wenn aber bzw z b zb kann können muss soll über unter nach vor durch um mehr sehr hier the of and to a in is'.split(' '));
const tok = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9äöüß]+/).filter(w => w.length > 2 && !STOP.has(w));

const tag = (p, i) => `[S. ${i + 1}]\n${p}`;

export function fullText(doc) { return doc.pages.map(tag).join('\n'); }

export function forChat(doc, query) {
  const all = fullText(doc);
  if (all.length <= FULL_LIMIT) return all;
  return topPages(doc, query, CHUNK_LIMIT + 10000);
}

export function forRange(doc, from, to, limit = CHUNK_LIMIT) {
  const a = Math.max(1, from | 0), b = Math.min(doc.pages.length, to | 0 || doc.pages.length);
  let out = '';
  for (let i = a - 1; i < b; i++) { const t = tag(doc.pages[i], i); if (out.length + t.length > limit) break; out += t + '\n'; }
  return out || tag(doc.pages[a - 1] || '', a - 1);
}

// Für Quiz/Karten etc. ohne Kapitel: ganzes Skript, wenn es passt – sonst gleichmäßig verteilte Seiten
export function forWhole(doc, limit = FULL_LIMIT) {
  const all = fullText(doc);
  if (all.length <= limit) return all;
  const n = doc.pages.length, per = Math.floor(limit / n);
  return doc.pages.map((p, i) => tag(p.slice(0, Math.max(300, per)), i)).join('\n').slice(0, limit);
}

export function outline(doc, limit = 50000) {
  const n = doc.pages.length;
  const per = Math.max(140, Math.min(900, Math.floor(limit / Math.max(1, n))));
  return doc.pages.map((p, i) => `[S. ${i + 1}] ${p.replace(/\s+/g, ' ').slice(0, per)}`).join('\n').slice(0, limit);
}

export function topPages(doc, query, limit = CHUNK_LIMIT) {
  const q = tok(query);
  const N = doc.pages.length;
  const toks = doc.pages.map(tok);
  const df = new Map();
  toks.forEach(ts => new Set(ts).forEach(w => df.set(w, (df.get(w) || 0) + 1)));
  const avg = toks.reduce((a, t) => a + t.length, 0) / Math.max(1, N);
  const scores = toks.map((ts, i) => {
    const tf = new Map(); ts.forEach(w => tf.set(w, (tf.get(w) || 0) + 1));
    let s = 0;
    for (const w of q) {
      // auch Teilwörter (Komposita!) zählen
      let f = tf.get(w) || 0;
      if (!f && w.length > 5) for (const [k, v] of tf) if (k.includes(w) || w.includes(k) && k.length > 5) f += v * .6;
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(w) || 1) + .5) / ((df.get(w) || 1) + .5));
      s += idf * (f * 2.2) / (f + 1.2 * (.25 + .75 * ts.length / (avg || 1)));
    }
    return { i, s };
  });
  scores.sort((a, b) => b.s - a.s);
  const pick = new Set();
  for (const { i, s } of scores) { if (s <= 0 && pick.size >= 3) break; pick.add(i); if (i > 0) pick.add(i - 1); if (pick.size >= 40) break; }
  if (!pick.size) for (let i = 0; i < Math.min(N, 8); i++) pick.add(i);
  const order = [...pick].sort((a, b) => a - b);
  let out = '';
  for (const i of order) { const t = tag(doc.pages[i], i); if (out.length + t.length > limit) continue; out += t + '\n'; }
  return out;
}

// Für Kapitel: ganzes Skript, wenn es klein genug ist (dann greift der Cache), sonst nur die Kapitelseiten
export function forChapter(doc, ch) {
  const all = fullText(doc);
  if (all.length <= FULL_LIMIT) return all;
  const [a, b] = Array.isArray(ch?.pages) ? ch.pages : [1, doc.pages.length];
  return forRange(doc, Math.max(1, a - 1), b + 1);
}
