// Excel-Vorlagen als eigenständige Werkzeugseiten bauen (ohne App-JS, ohne Anmeldung, ohne Limit).
//
// Aufruf (aus dem Repo-Wurzelordner):
//   ESBUILD=/pfad/zu/node_modules/esbuild/lib/main.js node tutor/tools/xl-build.mjs
//
// Was das Skript macht:
//   1. bündelt tutor/tools/xl/seite.js (importiert die Vorlagen und die Rechen-/Export-Logik aus tutor/js/xl/) nach tutor/tools/xl/xl-<hash>.js
//      und tutor/tools/xl/seite.css nach tutor/tools/xl/xl-<hash>.css. Rechenmodul (/tutor/vendor/xlcalc@2.mjs) und ExcelJS bleiben extern und laden lokal nach.
//   2. erzeugt statisch (SEO, auch ohne JavaScript lesbar):
//        tutor/tools/excel-vorlagen.html            → https://www.bwlmax.de/tools/excel-vorlagen
//        tutor/tools/excel-vorlage-<id>.html (je Vorlage) → https://www.bwlmax.de/tools/excel-vorlage-<id>
//      mit Eingaben, Beispielergebnissen und der kompletten Formel-Tabelle „So rechnet die Datei“.
//   2b. bündelt den Excel-Trainer (tutor/tools/xl/trainer-seite.js + trainer-seite.css → tutor/tools/xl/xt-<hash>.js/.css) und schreibt
//        tutor/tools/excel-trainer.html                → https://www.bwlmax.de/tools/excel-trainer
//      (Lernpfad, Spickzettel und Testzahlen statisch; der Trainer selbst ist derselbe wie in der App, aber ohne Max und ohne App-JS).
//      Testzahlen kommen aus tutor/tools/xl/trainer-pruefung.json (Playwright-Lauf außerhalb des Repos, /home/claude/w/tests-werkzeuge/trainer/).
//   3. liest die Prüfzahlen aus tutor/tools/xl/pruefung.json (geschrieben vom Prüflauf außerhalb des Repos:
//      LibreOffice-Neuberechnung, Python-Referenz, Dateiprüfung). Ohne diese Datei bricht das Skript ab – es werden nie Zahlen erfunden.
//
// Wiederholbar: Ein neuer Lauf überschreibt nur seine eigenen Dateien (excel-vorlage*.html, xl/xl-*.js, xl/xl-*.css)
// und löscht nur eigene Dateien, die nicht mehr gebraucht werden (alte Bundles, Seiten entfernter Vorlagen).
// Nach Änderungen in tutor/js/xl/ (Vorlagen) neu bauen – und den Prüflauf wiederholen, damit pruefung.json stimmt.
const { build } = await import(process.env.ESBUILD || 'esbuild');
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const TUTOR = path.dirname(TOOLS);
const XL = path.join(TOOLS, 'xl');
const SITE = 'https://www.bwlmax.de';
const { TEMPLATES, CATS } = await import(pathToFileURL(path.join(TUTOR, 'js/xl/templates.js')).href);
const { show, deFormula, labelOf, sortRefs, bounds, colL, split } = await import(pathToFileURL(path.join(TUTOR, 'js/xl/core.js')).href);
const E = await import(pathToFileURL(path.join(TUTOR, 'vendor/xlcalc@2.mjs')).href);
const { LESSONS, LEVELS } = await import(pathToFileURL(path.join(TUTOR, 'js/xl/lessons.js')).href);
const { keyset, CHEAT, CHEAT_NOTE_MAC, CHEAT_NOTE_WIN } = await import(pathToFileURL(path.join(TUTOR, 'js/xl/keys.js')).href);
const TPF = path.join(XL, 'trainer-pruefung.json');
if (!fs.existsSync(TPF)) throw new Error('tutor/tools/xl/trainer-pruefung.json fehlt – erst den Trainer-Testlauf ausführen (tests-werkzeuge/trainer).');
const TP = JSON.parse(fs.readFileSync(TPF, 'utf8'));
const PF = path.join(XL, 'pruefung.json');
if (!fs.existsSync(PF)) throw new Error('tutor/tools/xl/pruefung.json fehlt – erst den Prüflauf ausführen.');
const P = JSON.parse(fs.readFileSync(PF, 'utf8'));
for (const t of TEMPLATES) if (!P.je[t.id]) throw new Error('Prüfzahlen fehlen für ' + t.id + ' – Prüflauf wiederholen.');

// ---------- 1. Bundles ----------
const old = fs.readdirSync(XL).filter(f => /^(xl|xt)-[A-Za-z0-9]+\.(js|css)$/.test(f));
const rj = await build({ absWorkingDir: TUTOR, entryPoints: ['tools/xl/seite.js'], bundle: true, format: 'esm', outdir: XL, entryNames: 'xl-[hash]',
  minify: true, metafile: true, external: ['/tutor/*'], target: ['es2020'], logLevel: 'warning', legalComments: 'none' });
const jsFile = path.basename(Object.keys(rj.metafile.outputs).find(k => k.endsWith('.js')));
const rc = await build({ absWorkingDir: TUTOR, entryPoints: ['tools/xl/seite.css'], bundle: false, minify: true, outdir: XL, entryNames: 'xl-[hash]', metafile: true, logLevel: 'warning', legalComments: 'none' });
const cssFile = path.basename(Object.keys(rc.metafile.outputs).find(k => k.endsWith('.css')));
const tj = await build({ absWorkingDir: TUTOR, entryPoints: ['tools/xl/trainer-seite.js'], bundle: true, format: 'esm', outdir: XL, entryNames: 'xt-[hash]',
  minify: true, metafile: true, external: ['/tutor/*'], target: ['es2020'], logLevel: 'warning', legalComments: 'none' });
const xtJs = path.basename(Object.keys(tj.metafile.outputs).find(k => k.endsWith('.js')));
const tc = await build({ absWorkingDir: TUTOR, entryPoints: ['tools/xl/trainer-seite.css'], bundle: false, minify: true, outdir: XL, entryNames: 'xt-[hash]', metafile: true, logLevel: 'warning', legalComments: 'none' });
const xtCss = path.basename(Object.keys(tc.metafile.outputs).find(k => k.endsWith('.css')));
// Der Trainer darf kein App-JS mitbringen (nur tutor/js/xl/* und die Seite selbst)
for (const k of Object.keys(tj.metafile.inputs)) if (!/^(js\/xl\/(trainer|grid|lessons|keys|dom|core)\.js|tools\/xl\/trainer-seite\.js)$/.test(k)) throw new Error('Unerwarteter Baustein im Trainer-Bundle: ' + k);
for (const f of old) if (![jsFile, cssFile, xtJs, xtCss].includes(f)) fs.unlinkSync(path.join(XL, f));
const JS = '/tutor/tools/xl/' + jsFile, CSS = '/tutor/tools/xl/' + cssFile;
const XT_JS = '/tutor/tools/xl/' + xtJs, XT_CSS = '/tutor/tools/xl/' + xtCss;

// ---------- Hilfen ----------
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = o => JSON.stringify(o).replace(/</g, '\\u003c');
const nf = n => new Intl.NumberFormat('de-DE').format(n);
const norm = x => String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
const catName = k => (CATS.find(c => c[0] === k) || [, k])[1];
const stand = new Date(P.stand + 'T12:00:00Z');
const standLang = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(stand);
const TM = 'Microsoft und Excel sind Marken der Microsoft Corporation. BWL Max steht in keiner Verbindung zu Microsoft und wird von Microsoft weder unterstützt noch gesponsert.';
const url = id => '/tools/excel-vorlage-' + id;
const FILE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 1.5h8.3l5.3 5.3v13.7a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#1D6F42"/><path d="M14.5 1.5v3.6a1.7 1.7 0 0 0 1.7 1.7h3.6z" fill="#8fd1ac"/><path d="M8 11.5h8M8 14.5h8M8 17.5h8M11 10v9" stroke="#fff" stroke-width="1.3" fill="none"/></svg>';
const TOP = `<div class="bmw-top">
<span class="bmw-brand"><img src="/tutor/img/max-face-logo.png?v=1" width="44" height="44" alt=""><span class="bmw-bn">BWL Max</span></span>
<button type="button" class="bmw-theme" id="bmw-theme" aria-pressed="false" aria-label="Dunkles Design einschalten" title="Dunkles Design einschalten"><svg class="bmw-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg><svg class="bmw-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg></button>
</div>`;
const FOOT = '<footer>Bereitgestellt von BWL Max · <a href="/tutor/legal/impressum.html">Impressum</a> · <a href="/tutor/legal/datenschutz.html">Datenschutz</a></footer>';
const head = ({ title, desc, canon, jsonld, css2 }) => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="/tutor/tools/bm-werkzeug.js?v=5"></script>
<link rel="preload" href="/tutor/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${canon}">
<script type="application/ld+json">${ld(jsonld)}</script>
<meta name="color-scheme" content="light">
<link rel="stylesheet" href="${CSS}">${css2 ? `\n<link rel="stylesheet" href="${css2}">` : ''}
<link rel="stylesheet" href="/tutor/tools/bm-werkzeug.css?v=3">
</head>
<body>
<div class="wrap">
${TOP}`;
const PUBLISHER = { '@type': 'Organization', name: 'BWL Max', url: SITE + '/' };

// Zulässige Werte einer Eingabe (wie die Datenüberprüfung in der Datei)
function allowed(c) {
  if (c.fmt === 'txt' || typeof c.v === 'string') return 'Text';
  const whole = c.fmt === 'int' || c.fmt === 'stk' || c.int;
  const f = v => show(v, c.fmt === 'stk' ? 'int' : c.fmt);
  let r = c.min != null && c.max != null ? (c.min === 0 && c.max === 1 && whole ? '0 oder 1' : f(c.min) + ' bis ' + f(c.max)) : c.min != null ? 'ab ' + f(c.min) : c.max != null ? 'bis ' + f(c.max) : 'beliebig';
  if (whole && r !== '0 oder 1') r += ', ganze Zahl';
  if (c.v == null) r += '; darf leer bleiben';
  return r;
}
const liste = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1];
const cleanLab = s => String(s || '').replace(/^[=+−\-–]\s+/, '').trim();

// Statische Tabellen-Vorschau (wird mit JavaScript durch die live rechnende ersetzt)
function staticSheet(t, spec, values) {
  const cells = spec.cells, { rows, cols } = bounds(cells);
  const span = {}, covered = new Set();
  (spec.merges || []).forEach(m => { const [a, b] = m.split(':'); const A = split(a), B = split(b); if (!A || !B) return; span[a] = { cs: B.c - A.c + 1, rs: B.r - A.r + 1 }; for (let r = A.r; r <= B.r; r++) for (let c = A.c; c <= B.c; c++) if (r !== A.r || c !== A.c) covered.add(colL(c) + r); });
  const widths = (spec.cols || []).map(w => Math.max(54, Math.round(w * 7.4)));
  let o = '<div class="xl-win"><div class="xl-wbar"><span class="xlw-fi">' + FILE_SVG + '</span><b class="xl-fn">' + esc(t.file) + '</b></div><div class="xl-scroll"><table class="xl-t"><caption class="xlw-sr">Tabellenblatt „' + esc(spec.name) + '“ mit Beispielwerten</caption><colgroup><col style="width:42px">';
  for (let c = 1; c <= cols; c++) o += '<col style="width:' + (widths[c - 1] || 110) + 'px">';
  o += '</colgroup><thead><tr><th class="xl-corner" scope="col"><span class="xlw-sr">Zeile</span></th>';
  for (let c = 1; c <= cols; c++) o += '<th class="xl-ch" scope="col">' + colL(c) + '</th>';
  o += '</tr></thead><tbody>';
  for (let r = 1; r <= rows; r++) {
    o += '<tr><th class="xl-rh" scope="row">' + r + '</th>';
    for (let c = 1; c <= cols; c++) {
      const ref = colL(c) + r; if (covered.has(ref)) continue;
      const x = cells[ref] || {}, sp = span[ref] || {};
      const cls = 'xs-' + (x.s || 'empty') + (x.fmt && x.fmt !== 'txt' && ['in', 'out', 'res', 'tot'].includes(x.s) ? ' num' : '');
      const v = x.f != null ? values[ref] : x.v;
      const neg = typeof v === 'number' && v < -5e-10 && x.fmt && (x.fmt === 'eur' || x.fmt === 'eur0') ? ' neg' : '';
      o += '<td class="' + cls + neg + '"' + (sp.cs > 1 ? ' colspan="' + sp.cs + '"' : '') + (sp.rs > 1 ? ' rowspan="' + sp.rs + '"' : '') + '>' + esc(show(v, x.fmt)) + '</td>';
    }
    o += '</tr>';
  }
  return o + '</tbody></table></div></div>';
}
function thumb(t) {
  const s = t.build(), { rows, cols } = bounds(s.cells), R = Math.min(rows, 14), C = Math.min(cols, 6);
  let g = '';
  for (let r = 3; r <= R; r++) for (let c = 1; c <= C; c++) { const x = s.cells[colL(c) + r]; g += '<i class="' + (x ? 'k-' + (x.s || 'txt') : 'k-e') + '"></i>'; }
  return '<div class="xlw-thw" aria-hidden="true"><div class="xlw-thbar">' + FILE_SVG + '<span>' + esc(t.file) + '</span></div><div class="xlw-thumb" style="grid-template-columns:repeat(' + C + ',1fr)">' + g + '</div></div>';
}

// ---------- 2. Vorlagenseiten ----------
const info = {};
for (const t of TEMPLATES) {
  const spec = t.build(), cells = spec.cells;
  const { values, errors } = E.evaluate(cells);
  if (errors.length) throw new Error(t.id + ': ' + JSON.stringify(errors.slice(0, 3)));
  const ins = sortRefs(Object.keys(cells).filter(k => cells[k].s === 'in'));
  const forms = sortRefs(Object.keys(cells).filter(k => cells[k].f != null));
  const res = [...t.key, ...sortRefs(Object.keys(cells).filter(k => cells[k].s === 'res' && !t.key.includes(k)))];
  info[t.id] = { nin: ins.length, nf: forms.length, res };
}
// Beschriftung der Ergebnis-Kacheln: Zeilenbeschriftung, bei Mehrdeutigkeit mit Spaltenkopf
// (z. B. „Rentabilität – Anlage A“, „EBIT – Marge (vom Umsatz)“); gleich in tools/xl/seite.js (Live-Vorschau)
function keyLabels(cells, values, keys) {
  const txt = ref => { const x = cells[ref]; if (!x) return ''; const v = x.f != null ? values[ref] : x.v; return v == null || typeof v === 'object' ? '' : String(v).trim(); };
  const info = keys.map(k => {
    const p = split(k), a = cells['A' + p.r], av = a && a.s !== 'sec' ? txt('A' + p.r) : '';
    let base = String(labelOf(cells, k) || k), fb = /\(Zeile \d+\)$/.test(base);
    if (av && (fb || base !== av)) { fb = true; base = av; }
    let hd = '', n = 0;
    for (let r = p.r - 1; r >= 1; r--) { const x = cells[colL(p.c) + r]; if (x && x.s === 'th') { hd = txt(colL(p.c) + r); break; } }
    for (let c = 2; c <= 40; c++) { const x = cells[colL(c) + p.r]; if (x && (x.f != null || typeof x.v === 'number')) n++; }
    return { p, base: base.replace(/^[=+−\-–]\s+/, ''), hd, fb, tab: n >= 2 };
  });
  return info.map(o => {
    const dup = info.filter(q => q.base === o.base).length > 1;
    return o.hd && !/^(Betrag|Wert)$/.test(o.hd) && o.hd !== o.base && (dup || o.fb || (o.p.c > 2 && o.tab)) ? o.base + ' – ' + o.hd : o.base;
  });
}
function detail(t) {
  const spec = t.build(), cells = spec.cells, { values } = E.evaluate(cells), p = P.je[t.id], G = P.gesamt;
  const { nin, nf: nForm, res } = info[t.id];
  const ins = sortRefs(Object.keys(cells).filter(k => cells[k].s === 'in'));
  const forms = sortRefs(Object.keys(cells).filter(k => cells[k].f != null));
  const notes = sortRefs(Object.keys(cells).filter(k => cells[k].s === 'note')).map(k => cells[k].v);
  const lab = k => cleanLab(labelOf(cells, k)) || k;
  const keyLabs = keyLabels(cells, values, t.key), keyLab = k => keyLabs[t.key.indexOf(k)];
  const resLabs = keyLabels(cells, values, res);
  // gleiche Zeilenbeschriftung bei mehreren Eingaben (z. B. Verteilungsschlüssel): Spaltenkopf dazuschreiben
  const cnt = {}; ins.forEach(k => { const l = lab(k); cnt[l] = (cnt[l] || 0) + 1; });
  const colHead = k => { const q = split(k); for (let r = q.r - 1; r >= 1; r--) { const x = cells[colL(q.c) + r]; if (x && x.s === 'th' && typeof x.v === 'string' && x.v.trim()) return x.v.trim(); } return ''; };
  const inLab = k => { const l = lab(k); if (cnt[l] < 2) return l; const hd = colHead(k); return hd && hd !== l ? l + ' · ' + hd : l + ' (' + k + ')'; };
  const canon = SITE + url(t.id);
  const title = `${t.title} – Excel-Vorlage mit allen Formeln`;
  const desc = `${t.desc} Kostenlose Excel-Vorlage (.xlsx) ohne Anmeldung: live rechnende Vorschau, Download mit eigenen Werten, alle ${nForm} Formeln offengelegt und gegengerechnet.`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'DigitalDocument', name: t.title + ' (Excel-Vorlage)', description: t.desc, url: canon, inLanguage: 'de-DE',
    encodingFormat: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', isAccessibleForFree: true, dateModified: P.stand, publisher: PUBLISHER,
    about: catName(t.cat), isPartOf: { '@type': 'CollectionPage', name: 'Excel-Vorlagen für BWL und Wirtschaftswissenschaften', url: SITE + '/tools/excel-vorlagen' } };
  const rel = TEMPLATES.filter(x => x.cat === t.cat && x.id !== t.id);
  const refLabs = p.refZellen.map(k => lab(k) + ' (' + k + ')');
  const okLO = p.loAbweichungen === 0, okRef = p.refAbweichungen === 0;
  let h = head({ title, desc, canon, jsonld });
  h += `
<header>
<p class="xlw-crumb"><a href="/tools/excel-vorlagen">Excel-Vorlagen</a> · ${esc(catName(t.cat))}</p>
<h1>Excel-Vorlage: ${esc(t.title)}</h1>
<p class="lead">${esc(t.desc)} Die Datei rechnet mit echten Excel-Formeln: Die blauen Felder sind Eingaben, alle anderen Zellen berechnet die Tabelle selbst. Hier lässt sich die Vorlage direkt ausprobieren und mit den eigenen Werten als .xlsx-Datei herunterladen.</p>
<p class="small">Ohne Anmeldung und ohne Limit. Vorschau und Datei entstehen direkt in deinem Browser, deine Eingaben werden weder gespeichert noch übertragen.</p>
<ul class="xlw-facts" aria-label="Kurzinfo"><li><b>${nin}</b> Eingabefelder</li><li><b>${nForm}</b> Formeln</li><li>2 Tabellenblätter</li><li>Format .xlsx</li></ul>
</header>

<nav class="toc" aria-label="Inhalt">
<strong>Inhalt</strong>
<ol>
<li><a href="#vorlage">Vorschau und Download</a></li>
<li><a href="#wofuer">Wofür die Vorlage gedacht ist</a></li>
<li><a href="#eingaben">Eingaben</a></li>
<li><a href="#ergebnisse">Ergebnisse</a></li>
<li><a href="#formeln">So rechnet die Datei (alle Formeln)</a></li>
<li><a href="#gegengerechnet">So haben wir gegengerechnet</a></li>
<li><a href="#vertrauen">Darauf kannst du dich verlassen</a></li>
<li><a href="#verwandt">Verwandte Vorlagen</a></li>
</ol>
</nav>

<section id="vorlage" class="xlw-win-wrap" aria-labelledby="h-vorlage">
<h2 id="h-vorlage">Vorschau und Download</h2>
<p class="small noprint">Blaue Felder anklicken und eigene Werte eintragen (z. B. <code>50.000</code> oder <code>8 %</code>) – alle Ergebnisse rechnen sofort neu. Der Knopf „Excel-Datei herunterladen“ speichert die Datei mit den gerade eingetragenen Werten.</p>
<div class="xlw" id="xl-app" data-id="${t.id}">
<div class="xl-keys">${t.key.map(k => `<div class="xl-key"><small>${esc(keyLab(k))}</small><b>${esc(show(values[k], cells[k].fmt))}</b></div>`).join('')}</div>
${staticSheet(t, spec, values)}
<p class="xlw-nojs">Die live rechnende Vorschau und der Download brauchen JavaScript. Ohne JavaScript siehst du hier die Vorlage mit Beispielwerten; alle Formeln stehen unten.</p>
</div>
<div id="xl-leiste"></div>
<p class="small">Die Datei hat zwei Blätter: „${esc(spec.name)}“ (Eingaben blau, alle übrigen Zellen mit Blattschutz ohne Kennwort – er lässt sich jederzeit aufheben) und „So rechnet die Datei“ mit jeder Formel in deutscher Schreibweise und einer Erklärung. Geöffnet und neu berechnet haben wir die Datei in ${esc(P.libreoffice)} (siehe <a href="#gegengerechnet">Prüfung</a>).</p>
</section>

<section id="wofuer" aria-labelledby="h-wofuer">
<h2 id="h-wofuer">Wofür die Vorlage gedacht ist</h2>
<p>${esc(t.desc)} Die Vorlage gehört zum Bereich ${esc(catName(t.cat))} und ist für Übungsaufgaben, Klausurvorbereitung und kleine Praxisrechnungen gedacht. Du trägst ${nin} Werte ein; die Datei berechnet daraus unter anderem ${liste(keyLabs.map(x => '„' + esc(x) + '“'))}.</p>
${notes.length ? `<h3>Hinweise aus der Datei</h3>\n<ul class="xlw-notes">${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
</section>

<section id="eingaben" aria-labelledby="h-eingaben">
<h2 id="h-eingaben">Eingaben</h2>
<p class="small">Die blauen Felder der Datei. Die Spalte „Wert“ zeigt die Beispielwerte und folgt deinen Eingaben in der Vorschau. Zulässige Werte prüft die Datei selbst (Datenüberprüfung).</p>
<div class="tw"><table class="dec">
<caption class="xlw-sr">Eingabefelder der Vorlage</caption>
<thead><tr><th scope="col">Eingabe</th><th scope="col">Zelle</th><th scope="col" class="xlw-v">Wert</th><th scope="col">Zulässig</th></tr></thead>
<tbody>
${ins.map(k => `<tr><td>${esc(inLab(k))}</td><td><code>${k}</code></td><td class="xlw-v" data-xi="${k}">${cells[k].v == null ? '(leer)' : esc(show(cells[k].v, cells[k].fmt))}</td><td>${esc(allowed(cells[k]))}</td></tr>`).join('\n')}
</tbody></table></div>
</section>

<section id="ergebnisse" aria-labelledby="h-ergebnisse">
<h2 id="h-ergebnisse">Ergebnisse</h2>
<p class="small">Die wichtigsten Ergebniszellen (in der Datei grün). Die Werte gelten für die Beispielwerte und rechnen mit deinen Eingaben in der Vorschau mit.</p>
<div class="tw"><table class="dec">
<caption class="xlw-sr">Ergebniszellen der Vorlage</caption>
<thead><tr><th scope="col">Ergebnis</th><th scope="col">Zelle</th><th scope="col" class="xlw-v">Wert</th></tr></thead>
<tbody>
${res.map((k, i) => `<tr><td>${esc(t.key.includes(k) ? keyLab(k) : resLabs[i])}</td><td><code>${k}</code></td><td class="xlw-v"><b data-xv="${k}">${esc(show(values[k], cells[k].fmt))}</b></td></tr>`).join('\n')}
</tbody></table></div>
</section>

<section id="formeln" aria-labelledby="h-formeln">
<h2 id="h-formeln">So rechnet die Datei</h2>
<p>Alle ${nForm} Formeln des Blatts „${esc(spec.name)}“, so wie sie im deutschen Excel erscheinen (Funktionsnamen auf Deutsch, Semikolon als Trennzeichen). Dieselbe Tabelle steht in der Datei auf dem Blatt „So rechnet die Datei“.</p>
<div class="tw xlw-ftw"><table class="dec xlw-ft">
<caption class="xlw-sr">Formeln der Vorlage mit Erklärung</caption>
<thead><tr><th scope="col">Zelle</th><th scope="col">Was</th><th scope="col">Formel</th><th scope="col">Erklärung</th></tr></thead>
<tbody>
${forms.map(k => `<tr><td>${k}</td><td>${esc(labelOf(cells, k))}</td><td class="xlw-f">${esc(deFormula(cells[k].f))}</td><td>${spec.explain && spec.explain[k] ? `<small>${esc(spec.explain[k])}</small>` : ''}</td></tr>`).join('\n')}
</tbody></table></div>
</section>

<section id="gegengerechnet" aria-labelledby="h-gegengerechnet">
<h2 id="h-gegengerechnet">So haben wir gegengerechnet</h2>
<p>Automatischer Prüflauf vom ${standLang}. Neben den Beispielwerten wurden ${p.zufall} zufällige Eingabesätze erzeugt (jede von null verschiedene Zahl um bis zu ±40&nbsp;% verändert, Schalter wie 0/1 zufällig gesetzt, Grenzen der Datei eingehalten). Für jeden der ${p.saetze} Sätze hat die Rechenengine dieser Seite die Werte berechnet und die .xlsx-Datei genau so erzeugt wie beim Download.</p>
<ul class="xlw-check">
<li><b>${nf(p.loVergleiche)} Formelergebnisse · ${nf(p.loAbweichungen)} Abweichungen</b><span>Alle ${p.dateien} Dateien in ${esc(P.libreoffice)} geöffnet und vollständig neu berechnet; jede der ${nForm} Formelzellen mit dem Wert der Vorschau verglichen (relative Toleranz 10<sup>−9</sup>).</span></li>
<li><b>${nf(p.refVergleiche)} Referenzwerte · ${nf(p.refAbweichungen)} Abweichungen</b><span>Kernergebnisse unabhängig in Python mit den Lehrbuchformeln nachgerechnet, ohne die Excel-Formeln zu verwenden: ${refLabs.map(esc).join(', ')}.</span></li>
<li><b>${nf(p.dateienOk)} von ${nf(p.dateien)} Dateien fehlerfrei</b><span>ZIP-Paket intakt, alle XML-Teile wohlgeformt, Öffnen mit LibreOffice und openpyxl ohne Fehler; das Blatt „So rechnet die Datei“ enthält genau die ${nForm} Formeln.</span></li>
</ul>
<p class="small">${okLO && okRef ? 'Keine Abweichung gefunden.' : 'Gefundene Abweichungen werden geprüft und korrigiert.'} Über alle ${P.vorlagen} Vorlagen: ${nf(G.dateien)} Dateien, ${nf(G.formelVergleiche)} Formelergebnisse in LibreOffice, ${nf(G.refVergleiche)} Referenzwerte – ${nf(G.loAbweichungen + G.refAbweichungen)} Abweichungen. Microsoft Excel selbst und Google Tabellen waren nicht Teil dieses automatischen Prüflaufs; die Datei nutzt nur Standardfunktionen des .xlsx-Formats.</p>
</section>

<section class="bmw-trust" id="vertrauen" aria-labelledby="h-vertrauen">
<h2 id="h-vertrauen">Darauf kannst du dich verlassen</h2>
<ul>
<li><b>Rechnet nur in deinem Browser</b><span>Vorschau und Excel-Datei entstehen auf deinem Gerät. Deine Eingaben werden nicht übertragen und nicht gespeichert. Keine Anmeldung, keine Cookies, keine Werbung.</span></li>
<li><b>Formeln offen gelegt</b><span>Alle ${nForm} Formeln stehen im Abschnitt <a href="#formeln">So rechnet die Datei</a> und in der Datei auf einem eigenen Blatt. Nichts ist versteckt oder gesperrt, der Blattschutz hat kein Kennwort.</span></li>
<li><b>Gegengerechnet</b><span>${nf(p.loVergleiche)} Formelergebnisse in LibreOffice neu berechnet, ${nf(p.refVergleiche)} Kernwerte unabhängig in Python nachgerechnet – ${nf(p.loAbweichungen + p.refAbweichungen)} Abweichungen. Details unter <a href="#gegengerechnet">So haben wir gegengerechnet</a>.</span></li>
<li><b>Fehler gefunden?</b><span>Schreib uns an <a href="mailto:kontakt@bwlmax.de">kontakt@bwlmax.de</a> – wir korrigieren schnell.</span></li>
</ul>
<p class="bmw-stand">Stand: ${standLang} · Anonyme Aufrufzählung ohne Cookies (nur Seite und verweisende Website).</p>
</section>

<section id="verwandt" aria-labelledby="h-verwandt">
<h2 id="h-verwandt">Verwandte Vorlagen: ${esc(catName(t.cat))}</h2>
<ul class="xlw-rel">
${rel.map(x => `<li><a href="${url(x.id)}">${esc(x.title)}</a><p>${esc(x.desc)}</p></li>`).join('\n')}
</ul>
<p><a href="/tools/excel-vorlagen">Alle ${TEMPLATES.length} Excel-Vorlagen im Überblick</a></p>
</section>

<p class="xlw-tm">${TM}</p>
${FOOT}
</div>
<script type="module" src="${JS}"></script>
</body>
</html>
`;
  return h;
}

// ---------- Übersicht ----------
function overview() {
  const G = P.gesamt, cats = CATS.filter(([k]) => TEMPLATES.some(t => t.cat === k));
  const canon = SITE + '/tools/excel-vorlagen';
  const title = `Excel-Vorlagen für BWL: ${TEMPLATES.length} Vorlagen mit offenen Formeln (.xlsx)`;
  const desc = `${TEMPLATES.length} kostenlose Excel-Vorlagen für BWL und Wirtschaftswissenschaften – Investition, Finanzierung, Kostenrechnung, Controlling, Jahresabschluss, Logistik und Marketing. Ohne Anmeldung, alle Formeln offengelegt und gegengerechnet.`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Excel-Vorlagen für BWL und Wirtschaftswissenschaften', description: desc, url: canon, inLanguage: 'de-DE', isAccessibleForFree: true, dateModified: P.stand, publisher: PUBLISHER,
    mainEntity: { '@type': 'ItemList', numberOfItems: TEMPLATES.length, itemListElement: TEMPLATES.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + url(t.id), name: t.title })) } };
  let h = head({ title, desc, canon, jsonld });
  h += `
<header>
<h1>Excel-Vorlagen für BWL und Wirtschaftswissenschaften</h1>
<p class="lead">${TEMPLATES.length} Excel-Vorlagen zu Standardrechnungen aus dem Studium – von Kapitalwert und Tilgungsplan über Zuschlagskalkulation und Plankostenrechnung bis zu Kapitalflussrechnung, ABC-Analyse und Preis-Absatz-Funktion. Jede Vorlage rechnet mit echten Excel-Formeln: blaue Felder ausfüllen, alles andere rechnet die Tabelle. Auf jeder Seite lässt sich die Vorlage im Browser ausprobieren und mit eigenen Werten herunterladen; alle Formeln sind dort offengelegt und erklärt.</p>
<p class="small">Ohne Anmeldung und ohne Limit. Vorschau und Dateien entstehen direkt in deinem Browser, deine Eingaben werden weder gespeichert noch übertragen.</p>
<ul class="xlw-facts" aria-label="Kurzinfo"><li><b>${TEMPLATES.length}</b> Vorlagen</li><li><b>${cats.length}</b> Bereiche</li><li><b>${nf(G.formelzellenVorlagen)}</b> Formeln offengelegt</li><li>Format .xlsx</li></ul>
<p class="xlw-tr">Excel selbst lernen? Der kostenlose <a href="/tools/excel-trainer">Excel-Trainer</a> führt in ${LESSONS.length} Lektionen von der ersten Formel bis zu Kapitalwert und Tilgungsplan – mit echten Tastenkürzeln für Windows und Mac.</p>
</header>

<section id="vorlagen" aria-labelledby="h-vorlagen">
<h2 id="h-vorlagen">Vorlagen nach Bereich</h2>
<div class="xlw-filter noprint" id="xfilter" hidden>
<label class="xlw-sr" for="xq">Vorlage suchen</label>
<input type="search" id="xq" placeholder="Vorlage suchen – z. B. Kapitalwert, BAB, Skonto, Andler …" autocomplete="off" data-bmw-nicht="1">
<div class="xlw-chips" role="group" aria-label="Bereich wählen">
<button type="button" data-fc="" aria-pressed="true">Alle <small>${TEMPLATES.length}</small></button>
${cats.map(([k, n]) => `<button type="button" data-fc="${k}" aria-pressed="false">${esc(n)} <small>${TEMPLATES.filter(t => t.cat === k).length}</small></button>`).join('\n')}
</div>
<p class="xlw-hits" id="xhits" aria-live="polite"></p>
</div>
${cats.map(([k, n]) => `<div class="xlw-cat" data-cat="${k}">
<h3 id="b-${k}">${esc(n)} <span class="small">(${TEMPLATES.filter(t => t.cat === k).length})</span></h3>
<ul class="xlw-grid">
${TEMPLATES.filter(t => t.cat === k).map(t => `<li data-q="${esc(norm(t.title + ' ' + t.desc + ' ' + t.id + ' ' + n))}"><a class="xlw-card" href="${url(t.id)}">${thumb(t)}<span class="xlw-cm"><span class="xlw-cc">${esc(n)}</span><b>${esc(t.title)}</b><p>${esc(t.desc)}</p><small>${info[t.id].nin} Eingaben · ${info[t.id].nf} Formeln</small></span></a></li>`).join('\n')}
</ul>
</div>`).join('\n')}
</section>

<section id="gegengerechnet" aria-labelledby="h-gegengerechnet">
<h2 id="h-gegengerechnet">So haben wir gegengerechnet</h2>
<p>Automatischer Prüflauf vom ${standLang}: Für jede Vorlage wurden die Beispielwerte und ${P.je[TEMPLATES[0].id].zufall} zufällige Eingabesätze durchgerechnet und die .xlsx-Dateien so erzeugt wie beim Download.</p>
<ul class="xlw-check">
<li><b>${nf(G.dateien)} Dateien · ${nf(G.formelVergleiche)} Formelergebnisse · ${nf(G.loAbweichungen)} Abweichungen</b><span>Alle Dateien in ${esc(P.libreoffice)} vollständig neu berechnet und jede Formelzelle mit dem Wert der Browser-Vorschau verglichen (relative Toleranz 10<sup>−9</sup>).</span></li>
<li><b>${nf(G.refVergleiche)} Referenzwerte · ${nf(G.refAbweichungen)} Abweichungen</b><span>Die Kernergebnisse jeder Vorlage unabhängig in Python mit den Lehrbuchformeln nachgerechnet – ohne die Excel-Formeln zu verwenden.</span></li>
<li><b>${nf(G.dateienOk)} von ${nf(G.dateien)} Dateien fehlerfrei</b><span>ZIP-Paket intakt, alle ${nf(G.xmlTeile)} XML-Teile wohlgeformt, Öffnen mit LibreOffice und openpyxl ohne Fehler.</span></li>
</ul>
<p class="small">Die Zahlen je Vorlage stehen auf der jeweiligen Seite. Microsoft Excel selbst und Google Tabellen waren nicht Teil dieses automatischen Prüflaufs; die Dateien nutzen nur Standardfunktionen des .xlsx-Formats.</p>
</section>

<section class="bmw-trust" id="vertrauen" aria-labelledby="h-vertrauen">
<h2 id="h-vertrauen">Darauf kannst du dich verlassen</h2>
<ul>
<li><b>Rechnet nur in deinem Browser</b><span>Vorschau und Excel-Dateien entstehen auf deinem Gerät. Deine Eingaben werden nicht übertragen und nicht gespeichert. Keine Anmeldung, keine Cookies, keine Werbung.</span></li>
<li><b>Formeln offen gelegt</b><span>Jede Vorlagenseite listet alle Formeln mit Erklärung; in der Datei stehen sie zusätzlich auf dem Blatt „So rechnet die Datei“.</span></li>
<li><b>Gegengerechnet</b><span>${nf(G.formelVergleiche)} Formelergebnisse in LibreOffice neu berechnet, ${nf(G.refVergleiche)} Kernwerte unabhängig in Python nachgerechnet – ${nf(G.loAbweichungen + G.refAbweichungen)} Abweichungen (<a href="#gegengerechnet">Details</a>).</span></li>
<li><b>Fehler gefunden?</b><span>Schreib uns an <a href="mailto:kontakt@bwlmax.de">kontakt@bwlmax.de</a> – wir korrigieren schnell.</span></li>
</ul>
<p class="bmw-stand">Stand: ${standLang} · Anonyme Aufrufzählung ohne Cookies (nur Seite und verweisende Website).</p>
</section>

<p class="xlw-tm">${TM}</p>
${FOOT}
</div>
<script>
(function () {
  var box = document.getElementById('xfilter'); if (!box) return; box.hidden = false;
  var q = document.getElementById('xq'), hits = document.getElementById('xhits'), cur = '';
  var chips = Array.prototype.slice.call(box.querySelectorAll('[data-fc]')), cats = Array.prototype.slice.call(document.querySelectorAll('.xlw-cat'));
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/\\u00df/g, 'ss'); }
  function draw() {
    var t = norm(q.value.trim()), w = t ? t.split(/\\s+/) : [], n = 0;
    cats.forEach(function (c) {
      var any = 0, okCat = !cur || c.getAttribute('data-cat') === cur;
      Array.prototype.forEach.call(c.querySelectorAll('li[data-q]'), function (li) {
        var s = li.getAttribute('data-q'), ok = okCat && w.every(function (x) { return s.indexOf(x) >= 0; });
        li.hidden = !ok; if (ok) { any++; n++; }
      });
      c.hidden = !any;
    });
    hits.textContent = (t || cur) ? (n ? n + (n === 1 ? ' Vorlage' : ' Vorlagen') + (t ? ' gefunden' : ' in diesem Bereich') : 'Keine Vorlage gefunden – anderen Suchbegriff versuchen oder „Alle“ wählen.') : '';
  }
  chips.forEach(function (b) { b.addEventListener('click', function () { cur = b.getAttribute('data-fc'); chips.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); draw(); }); });
  q.addEventListener('input', draw);
  if (q.value) draw();
})();
</script>
</body>
</html>
`;
  return h;
}

// ---------- Excel-Trainer ----------
function trainerPage() {
  const canon = SITE + '/tools/excel-trainer';
  const nSteps = LESSONS.reduce((a, l) => a + l.steps.length, 0), nMini = LESSONS.filter(l => l.steps.some(s => s.mini)).length;
  const title = 'Excel-Trainer: Excel lernen mit BWL-Aufgaben – kostenlos im Browser';
  const desc = `Kostenloser Excel-Trainer für Studierende: ${LESSONS.length} Lektionen in 3 Stufen, von der ersten Formel über SVERWEIS und WENN bis Kapitalwert und Tilgungsplan. Echte Tastenkürzel für Windows und Mac, sofortige Rückmeldung, ohne Anmeldung.`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'LearningResource', name: 'Excel-Trainer für BWL und Wirtschaftswissenschaften', description: desc, url: canon, inLanguage: 'de-DE', isAccessibleForFree: true,
    learningResourceType: 'Interaktive Übung', educationalLevel: 'Hochschule', teaches: LEVELS.flatMap(l => l.can || []), dateModified: TP.stand, publisher: PUBLISHER };
  const K = { win: keyset(false), mac: keyset(true) };
  const kb = (ks, spec) => ks.keys(spec).map(k => `<kbd class="xk">${esc(k)}</kbd>`).join('+');
  const cell = (ks, list) => list.map(sp => kb(ks, sp)).join(' <span class="small">oder</span> ');
  const tpls = [...new Map(LESSONS.filter(l => l.tpl).map(l => [l.tpl[0], l])).values()];
  for (const l of tpls) if (!TEMPLATES.some(t => t.id === l.tpl[0])) throw new Error('Lektion ' + l.id + ': Vorlage fehlt: ' + l.tpl[0]);
  const tTitle = id => TEMPLATES.find(t => t.id === id).title;
  const standT = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(TP.stand + 'T12:00:00Z'));
  const W = TP.laeufe;
  if (TP.entwurf) throw new Error('trainer-pruefung.json ist ein Entwurf – erst den Testlauf ausführen.');
  let h = head({ title, desc, canon, jsonld, css2: XT_CSS });
  h += `
<header>
<p class="xlw-crumb"><a href="/tools/excel-vorlagen">Excel-Vorlagen</a> · Excel-Trainer</p>
<h1>Excel-Trainer: Excel lernen mit BWL-Aufgaben</h1>
<p class="lead">Ein Excel-Nachbau im Browser: Du tippst selbst, nutzt echte Tastenkürzel und bekommst zu jedem Schritt sofort Rückmeldung. ${LESSONS.length} Lektionen in drei Stufen führen von der ersten Formel über $-Bezüge, WENN und SVERWEIS bis zu Kapitalwert, Tilgungsplan und Deckungsbeitragsrechnung. Jede Lektion endet mit einer kleinen Aufgabe aus dem Wiwi-Studium.</p>
<p class="small">Kostenlos, ohne Anmeldung. Der Trainer läuft komplett in deinem Browser, deine Eingaben werden nicht übertragen.</p>
<ul class="xlw-facts" aria-label="Kurzinfo"><li><b>${LESSONS.length}</b> Lektionen</li><li><b>3</b> Stufen</li><li><b>${nSteps}</b> geprüfte Schritte</li><li>Kürzel für Windows und Mac</li></ul>
</header>

<nav class="toc" aria-label="Inhalt">
<strong>Inhalt</strong>
<ol>
<li><a href="#trainer">Trainer starten</a></li>
<li><a href="#lernpfad">Was du lernst</a></li>
<li><a href="#spickzettel">Tastenkürzel-Spickzettel (Windows und Mac)</a></li>
<li><a href="#so-gehts">So funktioniert der Trainer</a></li>
<li><a href="#vorlagen">Passende Excel-Vorlagen</a></li>
<li><a href="#getestet">So haben wir getestet</a></li>
<li><a href="#vertrauen">Darauf kannst du dich verlassen</a></li>
</ol>
</nav>

<section id="trainer" aria-labelledby="h-trainer">
<h2 id="h-trainer">Trainer</h2>
<div class="xt-mount" id="xt-app">
<p class="xlw-nojs">Der Trainer braucht JavaScript. Ohne JavaScript siehst du unten den Lernpfad und den Spickzettel.</p>
</div>
</section>

<section id="lernpfad" aria-labelledby="h-lernpfad">
<h2 id="h-lernpfad">Was du lernst</h2>
<p>Drei Stufen mit je fünf bis sechs Lektionen. Jeder Schritt wird am echten Zustand der Tabelle geprüft – zählt also nur, wenn Werte, Formeln oder Formate wirklich stimmen und, wo es ums Kürzel geht, das Kürzel auch benutzt wurde.</p>
<ul class="xtp-path">
${LEVELS.map(lv => `<li style="--lc:${lv.col}"><span class="xtp-lvn" style="color:${lv.col}">Stufe ${lv.n}</span><h3>${esc(lv.title)}</h3><p class="small">${esc(lv.sub)}</p>
<ol>${LESSONS.filter(l => l.lvl === lv.n).map(l => `<li><a href="#lektion-${l.id}">${esc(l.title)}</a>${l.challenge ? ' (Challenge)' : ''}<br><small>${esc(l.desc)}</small></li>`).join('')}</ol>
<p class="small"><b>Danach kannst du:</b></p><ul>${(lv.can || []).map(c => `<li>${esc(c)}</li>`).join('')}</ul></li>`).join('\n')}
</ul>
</section>

<section id="spickzettel" aria-labelledby="h-spickzettel">
<h2 id="h-spickzettel">Tastenkürzel-Spickzettel</h2>
<p>Die wichtigsten Excel-Kürzel aus dem Trainer – links für das deutsche Excel unter Windows, rechts für Excel am Mac. <button type="button" class="xtp-print noprint" id="xt-print" hidden>Spickzettel drucken</button></p>
<div class="tw"><table class="dec xtp-keys">
<caption class="xlw-sr">Excel-Tastenkürzel für Windows und Mac</caption>
<thead><tr><th scope="col">Aktion</th><th scope="col">Windows</th><th scope="col">Mac</th></tr></thead>
<tbody>
${CHEAT.map(([a, w, m]) => `<tr><td>${esc(a)}</td><td>${cell(K.win, w)}</td><td>${cell(K.mac, m)}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small">${esc(CHEAT_NOTE_WIN)}</p>
<p class="small">${esc(CHEAT_NOTE_MAC)}</p>
</section>

<section id="so-gehts" aria-labelledby="h-so-gehts">
<h2 id="h-so-gehts">So funktioniert der Trainer</h2>
<ul>
<li><b>Selbst machen statt zuschauen:</b> Die Aufgabe steht rechts, die Zielzelle ist gelb markiert. Du klickst, tippst und nutzt Kürzel wie im echten Excel – mit Formeln auf Deutsch (<code>SUMME</code>, <code>WENN</code>, <code>SVERWEIS</code>) und Semikolon als Trennzeichen.</li>
<li><b>Sofortige Rückmeldung:</b> Typische Fehler (Ergebnis eingetippt statt Formel, Klammer vergessen, Bedingung vertauscht, falsche Zelle) erkennt der Trainer und sagt, was nicht stimmt. Bei Bedarf gibt es einen Tipp oder die Lösung.</li>
<li><b>BWL-Bezug:</b> Jede Lektion endet mit einer Mini-Aufgabe aus dem Studium – Bruttobetrag, gewogener Durchschnitt, Zielerreichung, CAGR, Investitionsentscheidung, Programmentscheidung.</li>
<li><b>Sterne und Fortschritt:</b> Drei Sterne gibt es ohne Tipp und mit höchstens einem Fehlversuch. Der Fortschritt bleibt nur in diesem Browser gespeichert (lokaler Speicher, kein Cookie) und lässt sich jederzeit löschen.</li>
<li><b>Am besten am Laptop oder PC:</b> Viele Schritte üben Tastenkürzel. Auf dem Handy lassen sich die Lektionen ansehen und antippen, Kürzel-Schritte aber nur mit „Lösung zeigen“ abschließen.</li>
<li><b>Grenzen:</b> Der Trainer ist ein eigener Nachbau für die Übungen, kein vollständiges Excel. Er rechnet die Funktionen aus den Lektionen und meldet ehrlich, wenn er eine Funktion nicht kennt.</li>
</ul>
</section>

<section id="vorlagen" aria-labelledby="h-vorlagen">
<h2 id="h-vorlagen">Passende Excel-Vorlagen</h2>
<p>Mehrere Lektionen bauen eine Rechnung nach, die es auch als fertige, geprüfte Excel-Vorlage gibt – mit allen Formeln offengelegt:</p>
<ul class="xtp-tpl">
${tpls.map(l => `<li><a href="${url(l.tpl[0])}">${esc(tTitle(l.tpl[0]))}</a> <span class="small">– zur Lektion „${esc(l.title)}“</span></li>`).join('\n')}
</ul>
<p><a href="/tools/excel-vorlagen">Alle ${TEMPLATES.length} Excel-Vorlagen im Überblick</a></p>
</section>

<section id="getestet" aria-labelledby="h-getestet">
<h2 id="h-getestet">So haben wir getestet</h2>
<p>Automatischer Testlauf vom ${standT} in ${esc(TP.browser)}, mit echten Tastatur- und Mauseingaben wie bei einer Nutzerin oder einem Nutzer.</p>
<ul class="xlw-check">
<li><b>2 komplette Durchläufe · ${W.windows.lektionen + W.mac.lektionen} Lektionen · ${nf(W.windows.schritte + W.mac.schritte)} Schritte</b><span>Alle ${LESSONS.length} Lektionen mit allen ${nSteps} Schritten zweimal durchgespielt: einmal mit den Windows-Kürzeln, einmal mit den Mac-Kürzeln.</span></li>
<li><b>${nf(TP.falscheEingaben)} falsche Eingaben · ${nf(TP.falschGewertet)} fälschlich als richtig gewertet</b><span>Zum Beispiel Ergebnis statt Formel, vergessene Klammer, vertauschte Bedingung, falsche Zelle, Punkt statt Komma. Jede wurde abgelehnt, ${TP.mitHinweis === TP.falscheEingaben ? 'jede' : nf(TP.mitHinweis) + ' davon'} mit einem passenden Hinweis.</span></li>
<li><b>${nf(TP.referenzwerte)} Ergebniswerte · ${nf(TP.referenzAbweichungen)} Abweichungen</b><span>Die Werte in der Tabelle nach jeder Lektion mit einer unabhängigen Python-Rechnung verglichen, in beiden Durchläufen (${nf(TP.referenzVergleiche)} Vergleiche) – z. B. Kapitalwert, interner Zinsfuß, Annuität, Tilgungsplan, CAGR.</span></li>
<li><b>${TP.ansichten} Ansichten · ${nf(TP.konsolenfehler)} Fehler · ${nf(TP.fremdeRequests)} externe Anfragen</b><span>Darstellung bei ${TP.breiten.join(', ')} Pixel Breite in hellem und dunklem Design geprüft. Die Seite lädt nichts von fremden Servern.</span></li>
</ul>
<p class="small">Andere Browser (Safari, Firefox) waren nicht Teil des automatischen Laufs. Einige Kürzel belegt der Browser selbst – dafür nennt der Trainer Ersatzkürzel (siehe Spickzettel).</p>
</section>

<section class="bmw-trust" id="vertrauen" aria-labelledby="h-vertrauen">
<h2 id="h-vertrauen">Darauf kannst du dich verlassen</h2>
<ul>
<li><b>Läuft nur in deinem Browser</b><span>Tabelle, Prüfung und Rückmeldungen laufen auf deinem Gerät. Deine Eingaben werden nicht übertragen. Keine Anmeldung, keine Cookies, keine Werbung.</span></li>
<li><b>Fortschritt nur lokal</b><span>Erledigte Lektionen und Sterne speichert der Browser im lokalen Speicher dieses Geräts – nicht bei uns. Ein Klick auf „Fortschritt löschen“ entfernt sie.</span></li>
<li><b>Getestet</b><span>Alle Lektionen komplett mit Windows- und mit Mac-Kürzeln durchgespielt, ${nf(TP.falscheEingaben)} falsche Eingaben, ${nf(TP.referenzwerte)} Werte in Python nachgerechnet – Details unter <a href="#getestet">So haben wir getestet</a>.</span></li>
<li><b>Fehler gefunden?</b><span>Schreib uns an <a href="mailto:kontakt@bwlmax.de">kontakt@bwlmax.de</a> – wir korrigieren schnell.</span></li>
</ul>
<p class="bmw-stand">Stand: ${standT} · Anonyme Aufrufzählung ohne Cookies (nur Seite und verweisende Website).</p>
</section>

<p class="xlw-tm">Der Excel-Trainer ist ein eigener Nachbau von BWL Max – keine Microsoft-Software. ${TM}</p>
${FOOT}
</div>
<script type="module" src="${XT_JS}"></script>
</body>
</html>
`;
  return h;
}

// ---------- schreiben ----------
const want = new Set(['excel-vorlagen.html', ...TEMPLATES.map(t => 'excel-vorlage-' + t.id + '.html')]);
for (const f of fs.readdirSync(TOOLS)) if (/^excel-vorlage-[a-z0-9-]+\.html$/.test(f) && !want.has(f)) fs.unlinkSync(path.join(TOOLS, f));
for (const t of TEMPLATES) {
  if (!/^[a-z0-9-]+$/.test(t.id)) throw new Error('id ist kein gültiger Slug: ' + t.id);
  fs.writeFileSync(path.join(TOOLS, 'excel-vorlage-' + t.id + '.html'), detail(t));
}
fs.writeFileSync(path.join(TOOLS, 'excel-vorlagen.html'), overview());
fs.writeFileSync(path.join(TOOLS, 'excel-trainer.html'), trainerPage());
console.log('Excel-Vorlagen:', TEMPLATES.length + 1, 'Seiten ·', JS, '·', CSS, '· Excel-Trainer:', XT_JS, '·', XT_CSS);
