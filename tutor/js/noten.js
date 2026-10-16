// Notenziel-Rechner nach deutscher Prüfungsordnungs-Logik. Reine Funktionen, rechnet lokal.
// Standard: Σ(Note × ECTS) ÷ Σ ECTS, danach nach der ersten Nachkommastelle abgeschnitten (nicht gerundet).
export const NOTEN = [1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0];
export const PROFILE = {
  ects: { name: 'ECTS-gewichtet (Standard)', mode: 'ects', gesamt: 180, thesis: 12, kolloq: 0 },
  hsb: { name: 'HSB-Muster: 80 % Module · 15 % Thesis · 5 % Kolloquium', mode: 'anteil', gesamt: 180, thesis: 12, kolloq: 3, aThesis: 15, aKolloq: 5 }
};
export const defaultProfil = () => Object.assign({ key: 'ects', stellen: 1 }, PROFILE.ects);

// Abschneiden nach n Nachkommastellen (2,59 → 2,5). Kleiner Puffer gegen Fließkomma-Fehler (2,3 * 10 = 22,999…)
export const cut = (x, n = 1) => Math.floor(x * 10 ** n + 1e-9) / 10 ** n;
export const fmt = (x, n = 1) => (x == null || !isFinite(x)) ? '–' : x.toLocaleString('de-DE', { minimumFractionDigits: n, maximumFractionDigits: n });
export function praedikat(n) {
  if (n == null) return '';
  if (n <= 1.5) return 'sehr gut'; if (n <= 2.5) return 'gut'; if (n <= 3.5) return 'befriedigend'; if (n <= 4.0) return 'ausreichend'; return 'nicht bestanden';
}

// Bisheriger Stand: nur bestandene, benotete Module (Note ≤ 4,0) zählen
export function stand(module) {
  const ok = (module || []).filter(m => +m.ects > 0 && +m.note >= 1 && +m.note <= 4);
  const E = ok.reduce((a, m) => a + +m.ects, 0), G = ok.reduce((a, m) => a + +m.ects * +m.note, 0);
  return { E, G, exakt: E ? G / E : null, n: ok.length };
}

// Endnote aus Modulschnitt M (exakt) und Thesis/Kolloquium-Noten nach Profil
export function endnote(p, M, thesis, kolloq) {
  if (p.mode !== 'anteil') return M;
  const aT = (p.aThesis || 0) / 100, aK = (p.aKolloq || 0) / 100, aM = 1 - aT - aK;
  return aM * M + aT * (thesis ?? M) + aK * (kolloq ?? thesis ?? M);
}

// „Welche Note brauche ich noch?“ – nötiger Schnitt r in allem, was noch offen ist (Thesis eingeschlossen),
// damit die Endnote nach dem Abschneiden höchstens Z ist: exakte Endnote < Z + 0,1.
export function benoetigt(p, module, Z) {
  const s = stand(module), Z1 = Z + 10 ** -(p.stellen || 1);
  if (p.mode !== 'anteil') {
    const Etot = +p.gesamt, Erem = Etot - s.E;
    if (Erem <= 0) return { fertig: true, s, end: s.exakt };
    const r = (Z1 * Etot - s.G) / Erem;
    return wrap(r, s, Erem, x => (s.G + x * Erem) / Etot);
  }
  // Anteile: Module (ohne Thesis/Kolloquium-ECTS) zu aM, Thesis aT, Kolloquium aK; offene Leistungen alle mit r angenommen
  const aT = (p.aThesis || 0) / 100, aK = (p.aKolloq || 0) / 100, aM = 1 - aT - aK;
  const Emod = Math.max(1, +p.gesamt - (+p.thesis || 0) - (+p.kolloq || 0)), Erm = Math.max(0, Emod - s.E);
  const coef = aM * Erm / Emod + aT + aK, cst = aM * s.G / Emod;
  const r = (Z1 - cst) / coef;
  return wrap(r, s, Erm, x => cst + coef * x);
}
function wrap(r, s, Erem, endFor) {
  const best = endFor(1.0), worst = endFor(4.0);
  return { r, s, Erem, machbar: r > 1.0, sicher: r > 4.0, bestMoeglich: cut(best), schlechtestens: cut(worst) };
}

// Wie stark bewegt eine Notenstufe (0,3) in einem Modul mit e ECTS die Endnote?
export function hebel(p, e) {
  if (p.mode !== 'anteil') return 0.3 * e / +p.gesamt;
  const aT = (p.aThesis || 0) / 100, aK = (p.aKolloq || 0) / 100, aM = 1 - aT - aK;
  return 0.3 * aM * e / Math.max(1, +p.gesamt - (+p.thesis || 0) - (+p.kolloq || 0));
}
export function hebelThesis(p) { return p.mode === 'anteil' ? 0.3 * (p.aThesis || 0) / 100 : 0.3 * (+p.thesis || 0) / +p.gesamt; }

// Ein nötiger Schnitt r als greifbare Notenkombination für k offene Module (gleiche ECTS angenommen):
// nur Noten nahe am nötigen Schnitt, möglichst entspannt (höchster Schnitt unter r), möglichst gleichmäßig
export function kombi(r, k) {
  if (!(k > 0) || !(r > 1)) return null;
  if (r > 4) return Array(k).fill(4.0);
  const pool = NOTEN.filter(n => n >= r - 0.75 && n <= r + 0.45);
  let best = null;
  const rec = (sum, arr) => {
    if (arr.length === k) { const m = sum / k; if (m >= r) return; const spread = arr[k - 1] - arr[0];
      if (!best || m > best.m + 1e-9 || (Math.abs(m - best.m) < 1e-9 && spread < best.spread)) best = { m, spread, arr: arr.slice() }; return; }
    for (const n of pool) { if (arr.length && n < arr[arr.length - 1]) continue; arr.push(n); rec(sum + n, arr); arr.pop(); }
  };
  if (k <= 6 && pool.length) rec(0, []);
  return best ? best.arr : null;
}
// Wirkung einer Notenstufe lesbar machen: 0,01 / 0,05 / „unter 0,01“
export const fmtHebel = x => x < 0.005 ? 'unter 0,01' : fmt(x, 2);

// Modifizierte bayerische Formel (ausländische Noten): x = 1 + 3 · (Nmax − Nd) / (Nmax − Nmin), abgeschnitten
export const bayerisch = (Nmax, Nmin, Nd) => Math.min(4, Math.max(1, cut(1 + 3 * (Nmax - Nd) / (Nmax - Nmin))));
