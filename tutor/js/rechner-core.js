// BWL-Rechner im Browser – dieselben geprüften Formeln wie Max' Rechenwerkzeuge auf dem Server (gegen Excel/formulajs getestet).
export const R = (x, d = 4) => (typeof x === 'number' && isFinite(x)) ? Math.round(x * 10 ** d) / 10 ** d : x;
export const num = (v, name, opt) => {
  if (v === undefined || v === null || v === '') { if (opt) return undefined; throw new Error(`„${name}“ fehlt`); }
  let n = v;
  if (typeof v !== 'number') { let t = String(v).replace(/\s|€|%/g, ''); if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); else if (!t.includes('.')) t = t.replace(',', '.'); n = Number(t); }
  if (!isFinite(n)) throw new Error(`„${name}“ ist keine Zahl: ${v}`);
  return n;
};
const arr = (v, name) => { if (!Array.isArray(v) || !v.length) throw new Error(`„${name}“ muss eine Liste von Zahlen sein`); if (v.length > 200) throw new Error(`„${name}“: höchstens 200 Werte`); return v.map((x, i) => num(x, name + '[' + i + ']')); };

// ---- sicherer Formel-Parser (kein eval) ----
export function evalFormel(src, vars) {
  const s = String(src || '').replace(/×|·/g, '*').replace(/÷|:/g, '/').replace(/−|–/g, '-').replace(/\s+/g, '');
  if (!s) throw new Error('leere Formel');
  if (s.length > 400) throw new Error('Formel zu lang');
  let i = 0;
  const F = { sqrt: Math.sqrt, wurzel: Math.sqrt, ln: Math.log, log: Math.log10, lg: Math.log10, exp: Math.exp, abs: Math.abs, floor: Math.floor, ceil: Math.ceil,
    round: (x, n = 0) => Math.round(x * 10 ** n) / 10 ** n, min: Math.min, max: Math.max, pow: Math.pow, sum: (...a) => a.reduce((p, c) => p + c, 0) };
  const C = { pi: Math.PI, e: Math.E };
  const peek = () => s[i];
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = s[i++]; const r = term(); v = o === '+' ? v + r : v - r; } return v; }
  function term() { let v = unary(); while (peek() === '*' || peek() === '/') { const o = s[i++]; const r = unary(); if (o === '/' && r === 0) throw new Error('Division durch 0'); v = o === '*' ? v * r : v / r; } return v; }
  function unary() { if (peek() === '-') { i++; return -unary(); } if (peek() === '+') { i++; return unary(); } return power(); }
  function power() { const b = postfix(); if (peek() === '^') { i++; const e = unary(); return Math.pow(b, e); } return b; }
  function postfix() { let v = atom(); while (peek() === '%') { i++; v = v / 100; } return v; }
  function atom() {
    const c = peek();
    if (c === '(') { i++; const v = expr(); if (s[i++] !== ')') throw new Error('Klammer fehlt'); return v; }
    const m = /^(\d+(?:\.\d+)?(?:e[+-]?\d+)?)/i.exec(s.slice(i));
    if (m) { i += m[1].length; return Number(m[1]); }
    const id = /^([a-zA-ZäöüÄÖÜß_][\wäöüÄÖÜß]*)/.exec(s.slice(i));
    if (id) {
      i += id[1].length; const n = id[1];
      if (peek() === '(') {
        const f = F[n.toLowerCase()]; if (!f) throw new Error('unbekannte Funktion ' + n);
        i++; const args = []; if (peek() !== ')') { args.push(expr()); while (peek() === ',' || peek() === ';') { i++; args.push(expr()); } }
        if (s[i++] !== ')') throw new Error('Klammer fehlt nach ' + n); return f(...args);
      }
      if (vars && Object.prototype.hasOwnProperty.call(vars, n)) return vars[n];
      if (C[n.toLowerCase()] !== undefined) return C[n.toLowerCase()];
      throw new Error('unbekannter Name ' + n);
    }
    throw new Error('Zeichen nicht erlaubt an Stelle ' + (i + 1) + ': ' + (c || 'Ende'));
  }
  const v = expr();
  if (i < s.length) throw new Error('Rest nicht verstanden: ' + s.slice(i, i + 20));
  if (!isFinite(v)) throw new Error('Ergebnis ist nicht endlich');
  return v;
}

const npv = (i, I0, cfs) => -I0 + cfs.reduce((p, c, t) => p + c / Math.pow(1 + i, t + 1), 0);

export const TOOLS_IMPL = {
  rechne(a) {
    const list = Array.isArray(a.ausdruecke) ? a.ausdruecke : [{ name: 'x', formel: a.formel }];
    if (!list.length || list.length > 40) throw new Error('1–40 Ausdrücke');
    const vars = {}, out = [];
    for (const e of list) {
      const name = String(e.name || ('x' + (out.length + 1))).replace(/[^\wäöüÄÖÜß]/g, '_');
      const v = evalFormel(e.formel, vars); vars[name] = v; out.push({ name, formel: e.formel, ergebnis: R(v, 6) });
    }
    return { ergebnisse: out };
  },
  kapitalwert(a) {
    const i = num(a.zinssatz_prozent, 'zinssatz_prozent') / 100, I0 = num(a.anschaffungsauszahlung, 'anschaffungsauszahlung'), cfs = arr(a.zahlungen, 'zahlungen').slice();
    const rw = num(a.restwert, 'restwert', true); if (rw) cfs[cfs.length - 1] += rw;
    const rows = cfs.map((c, t) => { const f = 1 / Math.pow(1 + i, t + 1); return { jahr: t + 1, zahlung: R(c, 2), abzinsungsfaktor: R(f, 6), barwert: R(c * f, 2) }; });
    const sb = cfs.reduce((p, c, t) => p + c / Math.pow(1 + i, t + 1), 0), kw = sb - I0;
    return { kapitalwert: R(kw, 2), summe_barwerte: R(sb, 2), anschaffungsauszahlung: I0, jahre: rows,
      urteil: kw > 0 ? 'vorteilhaft (C0 > 0)' : kw < 0 ? 'nicht vorteilhaft (C0 < 0)' : 'indifferent (C0 = 0)',
      formel: 'C0 = −I0 + Σ CFt · (1 + i)^−t' + (rw ? ' (Restwert im letzten Jahr enthalten)' : '') };
  },
  interner_zinsfuss(a) {
    const I0 = num(a.anschaffungsauszahlung, 'anschaffungsauszahlung'), cfs = arr(a.zahlungen, 'zahlungen').slice();
    const rw = num(a.restwert, 'restwert', true); if (rw) cfs[cfs.length - 1] += rw;
    let lo = -0.99, hi = 10, flo = npv(lo, I0, cfs), fhi = npv(hi, I0, cfs), irr = null;
    if (flo * fhi <= 0) { for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2, fm = npv(m, I0, cfs); if (Math.abs(fm) < 1e-9) { lo = hi = m; break; } if (flo * fm <= 0) { hi = m; fhi = fm; } else { lo = m; flo = fm; } } irr = (lo + hi) / 2; }
    const res = { interner_zinsfuss_prozent: irr == null ? null : R(irr * 100, 4), hinweis: irr == null ? 'Kein interner Zinsfuß zwischen −99 % und 1000 % gefunden.' : 'exakt (numerisch) bestimmt; Kapitalwert bei diesem Zins ≈ 0' };
    const vz = Array.isArray(a.versuchszinssaetze_prozent) ? a.versuchszinssaetze_prozent.map(x => num(x, 'versuchszinssaetze_prozent')) : null;
    if (vz && vz.length === 2) {
      const [p1, p2] = vz, c1 = npv(p1 / 100, I0, cfs), c2 = npv(p2 / 100, I0, cfs);
      const r = p1 - c1 * (p2 - p1) / (c2 - c1);
      res.interpolation = { i1_prozent: p1, kapitalwert_1: R(c1, 2), i2_prozent: p2, kapitalwert_2: R(c2, 2), ergebnis_prozent: R(r, 4), formel: 'r ≈ i1 − C1 · (i2 − i1) / (C2 − C1) (lineare Interpolation, Näherung)' };
    }
    return res;
  },
  annuitaet(a) {
    const K = num(a.kapital, 'kapital'), i = num(a.zinssatz_prozent, 'zinssatz_prozent') / 100, n = Math.round(num(a.laufzeit_jahre, 'laufzeit_jahre'));
    if (n < 1 || n > 100) throw new Error('laufzeit_jahre 1–100');
    const q = 1 + i, kwf = i === 0 ? 1 / n : (Math.pow(q, n) * i) / (Math.pow(q, n) - 1), A = K * kwf;
    const out = { annuitaet: R(A, 2), kapitalwiedergewinnungsfaktor: R(kwf, 6), formel: 'A = K · (q^n · i) / (q^n − 1), q = 1 + i' };
    if (a.tilgungsplan) { let rs = K; out.tilgungsplan = []; for (let t = 1; t <= Math.min(n, 40); t++) { const z = rs * i, tg = A - z; out.tilgungsplan.push({ jahr: t, restschuld_anfang: R(rs, 2), zinsen: R(z, 2), tilgung: R(tg, 2), annuitaet: R(A, 2), restschuld_ende: R(Math.abs(rs - tg) < 0.005 ? 0 : rs - tg, 2) }); rs -= tg; } }
    return out;
  },
  finanzmathe(a) {
    const art = String(a.art || ''), B = num(a.betrag, 'betrag'), i0 = num(a.zinssatz_prozent, 'zinssatz_prozent') / 100;
    const m = Math.max(1, Math.round(num(a.perioden_pro_jahr, 'perioden_pro_jahr', true) || 1)), i = i0 / m;
    if (art === 'effektivzins') { const eff = Math.pow(1 + i, m) - 1; return { effektiver_jahreszins_prozent: R(eff * 100, 6), formel: 'i_eff = (1 + i_nom/m)^m − 1' }; }
    const n = art === 'ewige_rente' ? 0 : num(a.jahre, 'jahre') * m, q = 1 + i, vor = !!a.vorschuessig;
    let f, name, formel;
    switch (art) {
      case 'endwert': f = Math.pow(q, n); name = 'Aufzinsungsfaktor'; formel = 'Kn = K0 · q^n'; break;
      case 'barwert': f = Math.pow(q, -n); name = 'Abzinsungsfaktor'; formel = 'K0 = Kn · q^−n'; break;
      case 'rentenbarwert': f = (Math.pow(q, n) - 1) / (Math.pow(q, n) * i) * (vor ? q : 1); name = 'Rentenbarwertfaktor' + (vor ? ' (vorschüssig)' : ''); formel = 'R0 = r · (q^n − 1) / (q^n · i)' + (vor ? ' · q' : ''); break;
      case 'rentenendwert': f = (Math.pow(q, n) - 1) / i * (vor ? q : 1); name = 'Rentenendwertfaktor' + (vor ? ' (vorschüssig)' : ''); formel = 'Rn = r · (q^n − 1) / i' + (vor ? ' · q' : ''); break;
      case 'ewige_rente': f = 1 / i * (vor ? q : 1); name = 'Kehrwert des Zinssatzes'; formel = 'R0 = r / i' + (vor ? ' · q' : ''); break;
      default: throw new Error('art: endwert | barwert | rentenbarwert | rentenendwert | ewige_rente | effektivzins');
    }
    if (art !== 'ewige_rente' && i === 0) throw new Error('Zinssatz 0 – bitte direkt rechnen');
    return { ergebnis: R(B * f, 2), faktor: R(f, 6), faktor_name: name, formel, perioden: n, zins_je_periode_prozent: R(i * 100, 6) };
  },
  abschreibung(a) {
    const AK = num(a.anschaffungskosten, 'anschaffungskosten'), N = Math.round(num(a.nutzungsdauer_jahre, 'nutzungsdauer_jahre')), RW = num(a.restwert, 'restwert', true) || 0;
    if (N < 1 || N > 60) throw new Error('nutzungsdauer_jahre 1–60');
    const met = String(a.methode || 'linear'), m1 = Math.min(12, Math.max(1, Math.round(num(a.monate_erstes_jahr, 'monate_erstes_jahr', true) || 12)));
    const rows = []; let bw = AK;
    if (met === 'linear') {
      const afa = (AK - RW) / N; let t = 1;
      if (m1 < 12) { const x = afa * m1 / 12; rows.push({ jahr: 1, buchwert_anfang: R(bw, 2), abschreibung: R(x, 2), buchwert_ende: R(bw - x, 2) }); bw -= x; t = 2; }
      for (; bw - RW > 0.005 && t <= N + 1; t++) { const x = Math.min(afa, bw - RW); rows.push({ jahr: t, buchwert_anfang: R(bw, 2), abschreibung: R(x, 2), buchwert_ende: R(bw - x, 2) }); bw -= x; }
      return { methode: 'linear', jaehrliche_abschreibung: R(afa, 2), plan: rows, formel: 'AfA = (AK − Restwert) / Nutzungsdauer' + (m1 < 12 ? '; erstes Jahr zeitanteilig ' + m1 + '/12' : '') };
    }
    if (met === 'geometrisch_degressiv') {
      const p = num(a.satz_prozent, 'satz_prozent') / 100, wechsel = a.wechsel_linear !== false; let gewechselt = false, lin = 0;
      for (let t = 1; t <= N; t++) {
        const rest = N - t + 1; const deg = bw * p * (t === 1 ? m1 / 12 : 1);
        if (!gewechselt && wechsel && (bw - RW) / rest >= deg - 1e-9) { gewechselt = true; lin = (bw - RW) / rest; }
        const x = t === N ? bw - RW : (gewechselt ? lin : deg);
        rows.push({ jahr: t, buchwert_anfang: R(bw, 2), abschreibung: R(x, 2), buchwert_ende: R(bw - x, 2), methode: gewechselt ? 'linear (Wechsel)' : 'degressiv' }); bw -= x;
      }
      const w = rows.find(r => r.methode !== 'degressiv');
      return { methode: 'geometrisch-degressiv' + (wechsel ? ' mit Wechsel zur linearen AfA' : ''), plan: rows, wechseljahr: w ? w.jahr : null,
        formel: 'AfA_t = Restbuchwert · Satz; Wechsel, sobald Restbuchwert / Restnutzungsdauer ≥ degressiver Betrag' + (wechsel ? '' : ' (ohne Wechsel; Rest im letzten Jahr)') };
    }
    if (met === 'arithmetisch_degressiv') {
      const S = N * (N + 1) / 2, D = (AK - RW) / S;
      for (let t = 1; t <= N; t++) { const x = D * (N - t + 1); rows.push({ jahr: t, buchwert_anfang: R(bw, 2), abschreibung: R(x, 2), buchwert_ende: R(bw - x, 2) }); bw -= x; }
      return { methode: 'arithmetisch-degressiv (digital)', degressionsbetrag: R(D, 2), plan: rows, formel: 'D = (AK − RW) / (N·(N+1)/2); AfA_t = D · (N − t + 1)' };
    }
    if (met === 'leistung') {
      const G = num(a.leistung_gesamt, 'leistung_gesamt'), L = arr(a.leistung_je_jahr, 'leistung_je_jahr'), satz = (AK - RW) / G;
      L.forEach((l, t) => { const x = Math.min(l * satz, bw - RW); rows.push({ jahr: t + 1, leistung: l, buchwert_anfang: R(bw, 2), abschreibung: R(x, 2), buchwert_ende: R(bw - x, 2) }); bw -= x; });
      return { methode: 'leistungsabhängig', abschreibung_je_einheit: R(satz, 6), plan: rows, formel: 'AfA_t = (AK − RW) / Gesamtleistung · Leistung_t' };
    }
    throw new Error('methode: linear | geometrisch_degressiv | arithmetisch_degressiv | leistung');
  },
  break_even(a) {
    const Kf = num(a.fixkosten, 'fixkosten'), p = num(a.preis, 'preis'), kv = num(a.variable_stueckkosten, 'variable_stueckkosten'), db = p - kv;
    if (db <= 0) return { db_stueck: R(db, 2), hinweis: 'Deckungsbeitrag je Stück ≤ 0 – es gibt keine Gewinnschwelle.' };
    const x = Kf / db, out = { db_stueck: R(db, 4), db_quote_prozent: R(db / p * 100, 4), break_even_menge: R(x, 4), break_even_menge_aufgerundet: Math.ceil(x - 1e-9), break_even_umsatz: R(x * p, 2), formel: 'x_BE = Kf / (p − kv); U_BE = x_BE · p' };
    const M = num(a.menge, 'menge', true);
    if (M !== undefined) Object.assign(out, { menge: M, umsatz: R(M * p, 2), variable_kosten: R(M * kv, 2), gesamtkosten: R(Kf + M * kv, 2), deckungsbeitrag_gesamt: R(M * db, 2), gewinn: R(M * db - Kf, 2), sicherheitsabstand_prozent: R((M - x) / M * 100, 4) });
    const Z = num(a.zielgewinn, 'zielgewinn', true);
    if (Z !== undefined) Object.assign(out, { menge_fuer_zielgewinn: R((Kf + Z) / db, 4), formel_ziel: 'x = (Kf + G) / (p − kv)' });
    return out;
  },
  deckungsbeitrag(a) {
    if (!Array.isArray(a.produkte) || !a.produkte.length || a.produkte.length > 30) throw new Error('produkte: Liste mit 1–30 Produkten');
    const P = a.produkte.map((x, k) => { const p = num(x.preis, 'preis'), kv = num(x.variable_stueckkosten, 'variable_stueckkosten'); const e = num(x.engpass_verbrauch, 'engpass_verbrauch', true);
      return { name: String(x.name || 'Produkt ' + (k + 1)).slice(0, 40), preis: p, kv, db: p - kv, max_menge: num(x.menge, 'menge', true), e, rel: e ? (p - kv) / e : null }; });
    const Kf = num(a.fixkosten, 'fixkosten', true), cap = num(a.engpass_kapazitaet, 'engpass_kapazitaet', true);
    const out = { produkte: P.map(x => ({ name: x.name, db_stueck: R(x.db, 4), relativer_db: x.rel == null ? null : R(x.rel, 4) })) };
    if (cap !== undefined) {
      if (P.some(x => !x.e)) throw new Error('Für den Engpass braucht jedes Produkt engpass_verbrauch');
      const order = P.filter(x => x.db > 0).sort((u, v) => v.rel - u.rel); let rest = cap, sum = 0; const prog = [];
      for (const x of order) { const maxM = x.max_menge === undefined ? Infinity : x.max_menge; const m = Math.min(maxM, Math.floor(rest / x.e + 1e-9)); prog.push({ name: x.name, rang: prog.length + 1, menge: m, engpass_verbrauch: R(m * x.e, 4), db_gesamt: R(m * x.db, 2) }); rest -= m * x.e; sum += m * x.db; }
      Object.assign(out, { optimales_programm: prog, engpass_rest: R(rest, 4), db_gesamt: R(sum, 2), regel: 'Rangfolge nach relativem DB (DB je Engpasseinheit); Produkte mit DB ≤ 0 werden nicht produziert' });
    } else if (P.every(x => x.max_menge !== undefined)) {
      const sum = P.reduce((s, x) => s + (x.db > 0 ? x.db * x.max_menge : 0), 0);
      Object.assign(out, { rangfolge_nach_db: P.slice().sort((u, v) => v.db - u.db).map(x => x.name), db_gesamt: R(sum, 2), hinweis: 'ohne Engpass: alle Produkte mit positivem DB bis zur Absatzgrenze' });
    }
    if (Kf !== undefined && out.db_gesamt !== undefined) out.betriebsergebnis = R(out.db_gesamt - Kf, 2);
    return out;
  },
  zuschlagskalkulation(a) {
    const g = (k) => num(a[k], k, true) || 0;
    const MEK = num(a.materialeinzelkosten, 'materialeinzelkosten'), MGK = MEK * g('mgk_prozent') / 100, MK = MEK + MGK;
    const FL = g('fertigungseinzelkosten'), FGK = FL * g('fgk_prozent') / 100, SEKF = g('sondereinzelkosten_fertigung'), FK = FL + FGK + SEKF, HK = MK + FK;
    const VW = HK * g('vwgk_prozent') / 100, VT = HK * g('vtgk_prozent') / 100, SEKV = g('sondereinzelkosten_vertrieb'), SK = HK + VW + VT + SEKV;
    const GW = SK * g('gewinn_prozent') / 100, BVP = SK + GW, ab = (g('kundenskonto_prozent') + g('vertreterprovision_prozent')) / 100;
    const ZVP = BVP / (1 - ab), SKO = ZVP * g('kundenskonto_prozent') / 100, PROV = ZVP * g('vertreterprovision_prozent') / 100, LVP = ZVP / (1 - g('kundenrabatt_prozent') / 100), RAB = LVP - ZVP;
    const r = x => R(x, 2);
    return { schema: [
      ['Materialeinzelkosten', r(MEK)], ['+ Materialgemeinkosten', r(MGK)], ['= Materialkosten', r(MK)],
      ['Fertigungseinzelkosten', r(FL)], ['+ Fertigungsgemeinkosten', r(FGK)], ['+ Sondereinzelkosten der Fertigung', r(SEKF)], ['= Fertigungskosten', r(FK)],
      ['= Herstellkosten', r(HK)], ['+ Verwaltungsgemeinkosten', r(VW)], ['+ Vertriebsgemeinkosten', r(VT)], ['+ Sondereinzelkosten des Vertriebs', r(SEKV)], ['= Selbstkosten', r(SK)],
      ['+ Gewinn', r(GW)], ['= Barverkaufspreis', r(BVP)], ['+ Kundenskonto (i. H.)', r(SKO)], ['+ Vertreterprovision (i. H.)', r(PROV)], ['= Zielverkaufspreis', r(ZVP)],
      ['+ Kundenrabatt (i. H.)', r(RAB)], ['= Listenverkaufspreis (netto)', r(LVP)]].filter(x => x[1] !== 0 || /^=/.test(x[0]) || x[0] === 'Materialeinzelkosten'),
      hinweis: 'VwGK und VtGK auf Basis der Herstellkosten; Skonto/Provision im Hundert vom Zielverkaufspreis, Rabatt im Hundert vom Listenverkaufspreis' };
  },
  einkommensteuer(a) {
    const T = {
      2024: [11784, 17005, 66760, 277825, 954.80, 181.19, 991.21, 10636.31, 18971.06],
      2025: [12096, 17443, 68480, 277825, 932.30, 176.64, 1015.13, 10911.92, 19246.67],
      2026: [12348, 17799, 69878, 277825, 914.51, 173.10, 1034.87, 11135.63, 19470.38] };
    const j = Math.round(num(a.jahr, 'jahr', true) || 2026); const t = T[j]; if (!t) throw new Error('jahr: 2024, 2025 oder 2026');
    const split = !!a.splitting, zv0 = Math.floor(num(a.zve, 'zve')), zv = split ? Math.floor(zv0 / 2) : zv0;
    const est = x => { x = Math.floor(x); if (x <= t[0]) return 0; if (x <= t[1]) { const y = (x - t[0]) / 1e4; return Math.floor((t[4] * y + 1400) * y); } if (x <= t[2]) { const z = (x - t[1]) / 1e4; return Math.floor((t[5] * z + 2397) * z + t[6]); } if (x <= t[3]) return Math.floor(0.42 * x - t[7]); return Math.floor(0.45 * x - t[8]); };
    const e = est(zv) * (split ? 2 : 1), zone = zv <= t[0] ? 1 : zv <= t[1] ? 2 : zv <= t[2] ? 3 : zv <= t[3] ? 4 : 5;
    const grenz = zone === 1 ? 0 : zone === 2 ? (2 * t[4] * (zv - t[0]) / 1e4 + 1400) / 1e4 : zone === 3 ? (2 * t[5] * (zv - t[1]) / 1e4 + 2397) / 1e4 : zone === 4 ? 0.42 : 0.45;
    return { jahr: j, tarif: split ? 'Splittingtarif' : 'Grundtarif', zu_versteuerndes_einkommen: zv0, einkommensteuer: e, durchschnittssteuersatz_prozent: zv0 ? R(e / zv0 * 100, 2) : 0, grenzsteuersatz_prozent: R(grenz * 100, 2), tarifzone: zone, grundfreibetrag: t[0],
      quelle: '§ 32a Abs. 1 EStG (Fassung für ' + j + ')', hinweis: 'ohne Solidaritätszuschlag und Kirchensteuer' };
  },
  statistik(a) {
    const x = arr(a.werte, 'werte'), h = Array.isArray(a.haeufigkeiten) ? arr(a.haeufigkeiten, 'haeufigkeiten') : null;
    if (h && h.length !== x.length) throw new Error('haeufigkeiten muss gleich lang sein wie werte');
    const w = h || x.map(() => 1), n = w.reduce((s, c) => s + c, 0), mean = x.reduce((s, v, k) => s + v * w[k], 0) / n;
    const ss = x.reduce((s, v, k) => s + w[k] * (v - mean) ** 2, 0);
    const flat = []; x.forEach((v, k) => { for (let c = 0; c < Math.min(w[k], 10000); c++) flat.push(v); }); flat.sort((p, q) => p - q);
    const med = flat.length % 2 ? flat[(flat.length - 1) / 2] : (flat[flat.length / 2 - 1] + flat[flat.length / 2]) / 2;
    const cnt = {}; flat.forEach(v => cnt[v] = (cnt[v] || 0) + 1); const mx = Math.max(...Object.values(cnt)); const modus = Object.keys(cnt).filter(k => cnt[k] === mx).map(Number);
    const out = { n, mittelwert: R(mean, 6), median: R(med, 6), modus: mx > 1 ? modus : null, minimum: flat[0], maximum: flat[flat.length - 1], spannweite: R(flat[flat.length - 1] - flat[0], 6),
      varianz_grundgesamtheit: R(ss / n, 6), std_grundgesamtheit: R(Math.sqrt(ss / n), 6), varianz_stichprobe: n > 1 ? R(ss / (n - 1), 6) : null, std_stichprobe: n > 1 ? R(Math.sqrt(ss / (n - 1)), 6) : null,
      variationskoeffizient: mean ? R(Math.sqrt(ss / n) / Math.abs(mean), 6) : null };
    if (Array.isArray(a.y_werte)) {
      const y = arr(a.y_werte, 'y_werte'); if (y.length !== x.length || h) throw new Error('y_werte: gleich viele Werte wie werte, ohne haeufigkeiten');
      const my = y.reduce((s, v) => s + v, 0) / y.length, sxy = x.reduce((s, v, k) => s + (v - mean) * (y[k] - my), 0), syy = y.reduce((s, v) => s + (v - my) ** 2, 0);
      const b = sxy / ss, r = sxy / Math.sqrt(ss * syy);
      Object.assign(out, { mittelwert_y: R(my, 6), kovarianz_grundgesamtheit: R(sxy / n, 6), kovarianz_stichprobe: n > 1 ? R(sxy / (n - 1), 6) : null, korrelation_r: R(r, 6), regression: { steigung_b: R(b, 6), achsenabschnitt_a: R(my - b * mean, 6), bestimmtheitsmass_r2: R(r * r, 6), formel: 'ŷ = a + b·x (Kleinste Quadrate)' } });
    }
    return out;
  }
};


// ---------- Bilanzkennzahlen (mit Faustregeln) ----------
TOOLS_IMPL.bilanz = function (a) {
  const g = k => num(a[k], k, true) || 0;
  const AV = g('anlagevermoegen'), VO = g('vorraete'), FO = g('forderungen'), LM = g('liquide_mittel');
  const EK = g('eigenkapital'), LFK = g('langfristiges_fk'), KFK = g('kurzfristiges_fk');
  const UV = VO + FO + LM, BS = AV + UV, FK = LFK + KFK, P = EK + FK;
  const U = num(a.umsatz, 'umsatz', true), JU = num(a.jahresueberschuss, 'jahresueberschuss', true), ZA = g('zinsaufwand');
  if (!BS) throw new Error('Trag mindestens Anlage- oder Umlaufvermögen ein');
  const q = (x, y) => (y ? x / y : null);
  const k = [
    { g: 'Kapitalstruktur', n: 'Eigenkapitalquote', f: 'EK / Gesamtkapital', v: q(EK, P || BS), pct: true, ok: x => x >= 0.3, regel: '≥ 30 % gilt als solide' },
    { g: 'Kapitalstruktur', n: 'Fremdkapitalquote', f: 'FK / Gesamtkapital', v: q(FK, P || BS), pct: true },
    { g: 'Kapitalstruktur', n: 'Verschuldungsgrad', f: 'FK / EK', v: q(FK, EK), ok: x => x <= 2, regel: '≤ 2 : 1 (vertikale Faustregel)', fx: true },
    { g: 'Vermögen', n: 'Anlagenintensität', f: 'AV / Gesamtvermögen', v: q(AV, BS), pct: true },
    { g: 'Fristigkeit', n: 'Anlagendeckungsgrad I', f: 'EK / AV', v: q(EK, AV), pct: true, ok: x => x >= 1, regel: '≥ 100 % (goldene Bilanzregel, eng)' },
    { g: 'Fristigkeit', n: 'Anlagendeckungsgrad II', f: '(EK + langfr. FK) / AV', v: q(EK + LFK, AV), pct: true, ok: x => x >= 1, regel: '≥ 100 % (goldene Bilanzregel, weit)' },
    { g: 'Liquidität', n: 'Liquidität 1. Grades', f: 'liquide Mittel / kurzfr. FK', v: q(LM, KFK), pct: true, ok: x => x >= 0.2, regel: '≥ 20 %' },
    { g: 'Liquidität', n: 'Liquidität 2. Grades', f: '(liquide Mittel + Forderungen) / kurzfr. FK', v: q(LM + FO, KFK), pct: true, ok: x => x >= 1, regel: '≥ 100 % (Quick Ratio)' },
    { g: 'Liquidität', n: 'Liquidität 3. Grades', f: 'Umlaufvermögen / kurzfr. FK', v: q(UV, KFK), pct: true, ok: x => x >= 1.5, regel: '≥ 150–200 % (Current Ratio)' },
    { g: 'Liquidität', n: 'Working Capital', f: 'UV − kurzfr. FK', v: KFK || UV ? UV - KFK : null, eur: true, ok: x => x > 0, regel: 'positiv' }
  ];
  if (JU !== undefined) {
    k.push({ g: 'Rentabilität', n: 'Eigenkapitalrentabilität', f: 'Jahresüberschuss / EK', v: q(JU, EK), pct: true });
    k.push({ g: 'Rentabilität', n: 'Gesamtkapitalrentabilität', f: '(Jahresüberschuss + Zinsaufwand) / Gesamtkapital', v: q(JU + ZA, P || BS), pct: true });
    if (U) { k.push({ g: 'Rentabilität', n: 'Umsatzrendite', f: 'Jahresüberschuss / Umsatz', v: q(JU, U), pct: true }); k.push({ g: 'Rentabilität', n: 'Kapitalumschlag', f: 'Umsatz / Gesamtkapital', v: q(U, P || BS), fx: true }); k.push({ g: 'Rentabilität', n: 'ROI (Du-Pont)', f: 'Umsatzrendite × Kapitalumschlag', v: q(JU, P || BS), pct: true }); }
  }
  return { bilanzsumme_aktiva: R(BS, 2), bilanzsumme_passiva: R(P, 2), umlaufvermoegen: R(UV, 2), fremdkapital: R(FK, 2), ausgeglichen: !P || Math.abs(BS - P) < 0.005, kennzahlen: k.filter(x => x.v != null && isFinite(x.v)).map(x => ({ gruppe: x.g, name: x.n, formel: x.f, wert: R(x.v, 6), prozent: !!x.pct, euro: !!x.eur, faktor: !!x.fx, regel: x.regel || '', ok: x.ok ? x.ok(x.v) : null })) };
};
// ---------- Workload nach ECTS ----------
TOOLS_IMPL.workload = function (a) {
  const E = num(a.ects, 'ects'), h = num(a.stunden_je_ects, 'stunden_je_ects', true) || 30;
  const sws = num(a.sws, 'sws', true) || 0, wo = num(a.vorlesungswochen, 'vorlesungswochen', true) || 14, bis = num(a.wochen_bis_klausur, 'wochen_bis_klausur', true);
  const ges = E * h, pr = sws * wo * 0.75, ss = Math.max(0, ges - pr);
  const out = { gesamt_stunden: R(ges, 1), praesenz_stunden: R(pr, 1), selbststudium_stunden: R(ss, 1), formel: 'Workload = ECTS × Stunden je ECTS; Präsenz = SWS × Wochen × 45 Min.' };
  if (bis) out.pro_woche_bis_klausur = R(ss / bis, 1);
  return out;
};
