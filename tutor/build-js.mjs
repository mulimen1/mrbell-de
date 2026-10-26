// JS-Bundle bauen: tutor/js/main.js (+ alles, was es lädt) → tutor/jsb/ (wenige, minifizierte Dateien mit Hash im Namen)
// Danach zeigt index.html auf das neue Bundle und lädt die Teile, die beim Start sowieso gebraucht werden, parallel vor.
// Aufruf: node tutor/build-js.mjs   (danach für die Lernseiten: python3 /home/claude/seo/build.py)
// WICHTIG: Nach jeder Änderung in tutor/js/ neu bauen – live läuft nur tutor/jsb/.
// Alte Dateien in jsb/ bleiben liegen (offene Tabs laden evtl. noch alte Teile nach).
const { build } = await import(process.env.ESBUILD || 'esbuild');   // esbuild liegt nicht im Repo: ESBUILD=/pfad/zu/esbuild/lib/main.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const T = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(T, 'jsb');
// Beim Start (Startseite, Themen-Einstieg, Lernseite) immer geladen → vorladen statt nacheinander nachladen
const BOOT = ['js/main.js', 'js/assistant.js', 'js/dock.js', 'js/me.js', 'js/views/room.js', 'js/views/lernen.js', 'js/views/zahlen.js',
  'js/abo.js', 'js/dress.js', 'js/hint.js', 'js/palette.js', 'js/mslink.js', 'js/comeback.js'];

const r = await build({
  absWorkingDir: T, entryPoints: ['js/main.js'], bundle: true, splitting: true, format: 'esm', outdir: OUT,
  entryNames: '[name]-[hash]', chunkNames: 'c-[hash]', minify: true, metafile: true, external: ['/tutor/*'],
  target: ['es2020'], logLevel: 'warning', legalComments: 'none',
});
const outs = r.metafile.outputs, rel = k => path.relative(T, path.resolve(T, k)).split(path.sep).join('/');
const byEntry = {}; for (const [k, v] of Object.entries(outs)) if (v.entryPoint) byEntry[v.entryPoint] = k;
const main = byEntry['js/main.js']; if (!main) throw new Error('main fehlt');
const pre = new Set();
const walk = k => { if (pre.has(k)) return; pre.add(k); for (const i of outs[k].imports || []) if (i.kind === 'import-statement' && outs[i.path]) walk(i.path); };
for (const e of BOOT) { const k = byEntry[e]; if (k) walk(k); else console.warn('nicht im Bundle:', e); }
pre.delete(main);
const url = k => '/tutor/' + rel(k);
const tags = [...pre].map(k => `<link rel="modulepreload" href="${url(k)}">`).join('');
const ix = path.join(T, 'index.html'); let h = fs.readFileSync(ix, 'utf8');
h = h.replace(/<script type="module" src="\/tutor\/js(b)?\/main[^"]*"><\/script>/, `<script type="module" src="${url(main)}"></script>`);
if (!h.includes(url(main))) throw new Error('main-Script in index.html nicht gefunden');
if (/<!--jsb-->[\s\S]*?<!--\/jsb-->/.test(h)) h = h.replace(/<!--jsb-->[\s\S]*?<!--\/jsb-->/, `<!--jsb-->${tags}<!--/jsb-->`);
else h = h.replace(`<script type="module" src="${url(main)}"></script>`, m => `<!--jsb-->${tags}<!--/jsb-->` + m);
fs.writeFileSync(ix, h);
console.log('Bundle:', url(main), '·', Object.keys(outs).length, 'Dateien ·', pre.size, 'vorgeladen');
