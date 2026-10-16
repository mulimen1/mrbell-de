// FSRS-5 (Free Spaced Repetition Scheduler) – Standardparameter, ohne Abhängigkeiten.
// Karte: s = Stabilität (Tage), d = Schwierigkeit (1–10), last = letzte Wiederholung (ms), due, ivl (Tage), reps, lapses.
const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
const DECAY = -0.5, FACTOR = 19 / 81, DAY = 864e5, MIN = 6e4;
export const RETENTION = 0.9;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const d0 = g => clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10);
export const retrievability = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
const nextIvl = s => s / FACTOR * (Math.pow(RETENTION, 1 / DECAY) - 1);

// Alte SM-2-Karten (ease/ivl) übernehmen
function migrate(c, now) {
  if (c.s != null || !c.reps) return;
  c.s = Math.max(0.5, c.ivl || 0.5);
  c.d = clamp(13 - (c.ease || 2.5) * 3.2, 1, 10);
  c.last = c.due && c.ivl ? c.due - c.ivl * DAY : now;
}

// r: 1 Nochmal · 2 Schwer · 3 Gut · 4 Leicht. examAt: Klausurtermin (ms) – Intervalle enden vorher.
export function review(c, r, now = Date.now(), examAt = 0) {
  migrate(c, now);
  const fresh = c.s == null;
  if (fresh) { c.s = W[r - 1]; c.d = d0(r); }
  else {
    const t = Math.max(0, (now - (c.last || now)) / DAY);
    const R = retrievability(t, c.s);
    const dd = -W[6] * (r - 3), d1 = c.d + dd * (10 - c.d) / 9;
    const D = c.d;
    c.d = clamp(W[7] * d0(4) + (1 - W[7]) * d1, 1, 10);
    if (t < 1) c.s = c.s * Math.exp(W[17] * (r - 3 + W[18]));
    else if (r === 1) c.s = Math.min(c.s, W[11] * Math.pow(D, -W[12]) * (Math.pow(c.s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)));
    else c.s = c.s * (Math.exp(W[8]) * (11 - D) * Math.pow(c.s, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1) * (r === 2 ? W[15] : 1) * (r === 4 ? W[16] : 1) + 1);
  }
  c.s = Math.max(0.1, c.s);
  c.last = now; c.reps = (c.reps || 0) + 1;
  // Kurze Lernschritte: Nochmal → 1 Min., Schwer bei neuer Karte → 10 Min.
  if (r === 1) { c.lapses = (c.lapses || 0) + (fresh ? 0 : 1); c.ivl = 0; c.due = now + MIN; return c; }
  if (r === 2 && fresh) { c.ivl = 0; c.due = now + 10 * MIN; return c; }
  let ivl = Math.max(1, Math.round(nextIvl(c.s)));
  if (r === 2) ivl = Math.max(1, Math.min(ivl, Math.round(c.ivl * 1.2) || 1));
  // Rückwärts vom Klausurtermin: Käme die nächste Wiederholung erst nach der Klausur und säße die Karte dort nicht
  // mehr sicher (unter 95 %), kommt sie vorher noch einmal – zur Hälfte der Restzeit.
  if (examAt && examAt > now) { const left = (examAt - now) / DAY; if (ivl > left && retrievability(left, c.s) < 0.95) ivl = Math.max(1, Math.floor(left / 2)); }
  ivl = Math.min(ivl, 365);
  c.ivl = ivl; c.due = now + ivl * DAY;
  return c;
}
