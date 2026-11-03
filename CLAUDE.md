# Repo-Hinweise

## BWL Max (tutor/): JavaScript wird gebündelt
- Live läuft **tutor/jsb/** (esbuild-Bundle), nicht tutor/js/. index.html und alle Lernseiten (tutor/lernen/*.html) laden `/tutor/jsb/main-<hash>.js`.
- Nach **jeder** Änderung in tutor/js/: `ESBUILD=<pfad>/esbuild/lib/main.js node tutor/build-js.mjs` (aktualisiert index.html), danach `python3 /home/claude/seo/build.py` (kopiert index.html in die Lernseiten). Sonst ist die Änderung nicht live.
- esbuild ist nicht im Repo (kein package.json, damit Vercel nichts baut): `npm i esbuild@0.24.0` in einem Ordner außerhalb des Repos.
- jsb/-Dateien haben Hashes und werden ein Jahr gecacht (vercel.json). Alte jsb-Dateien nicht sofort löschen: offene Tabs laden evtl. noch alte Teile nach.

## BWL Max: Rechner- und Werkzeugseiten sind eigenständig
- tutor/rechner/*.html und tutor/tools/*.html sind PURE Werkzeug-Seiten (Vorlage: tutor/tools/kombinatorik-rechner.html): kein App-JS, kein consent.js/Cookie-Banner, keine Navigation, kein Max, keine Anmeldung, keine Links in die App. Sie werden an Hochschulen für Verlinkungen verschickt.
- Nicht durch Build-Skripte (z. B. seo/build.py) überschreiben und nicht wieder an die App anbinden.
