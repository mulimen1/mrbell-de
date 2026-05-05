# Google Fonts lokal hosten — Anleitung

**Zeit:** ~10 Minuten
**Schwierigkeit:** Easy

## Warum?

Aktuell lädt deine Website Schriftarten direkt vom Google-Server. Dabei wird die IP-Adresse jedes Besuchers an Google übermittelt — **DSGVO-Verstoß** (LG München, 3 O 17493/20). Ergebnis: Abmahnungen mit ~100€ pro Fall.

**Lösung:** Schriftarten selbst auf mrbell.de hosten. Kein Google-Verkehr mehr.

---

## Was ich schon geändert habe

In `index.html`, `erfolg.html`, `abbruch.html` habe ich die Google-Font-Links durch lokale `@font-face`-Regeln ersetzt. Sie zeigen jetzt auf `/fonts/playfair-display-XXX.woff2` und `/fonts/inter-XXX.woff2`.

**Aber: Die Font-Dateien selbst musst du noch herunterladen und ins Repo packen.**

---

## Schritt 1 — Font-Files herunterladen

1. Geh auf **gwfh.mranftl.com** (Google Webfonts Helper)
2. Suche **"Playfair Display"** — auswählen
3. Charakter-Sets: **"latin"** (reicht für DE/EN, kleinerer File-Size)
4. Styles auswählen:
   - 400 regular
   - 500 medium
   - 600 semi-bold
   - 700 bold
   - 800 extra-bold
   - 900 black
   - 400 italic
   - 500 italic
5. **Format:** Modern Browsers (woff2 only) — wir brauchen kein woff für IE
6. **Customize folder prefix:** auf `/fonts/` setzen
7. Klick auf **"Download files"** → ZIP wird gespeichert
8. ZIP entpacken — du kriegst `.woff2`-Dateien
9. Datei-Namen anpassen damit sie zu meinen `@font-face`-Regeln passen:
   - `playfair-display-v36-latin-regular.woff2` → `playfair-display-400.woff2`
   - `playfair-display-v36-latin-500.woff2` → `playfair-display-500.woff2`
   - usw.
   - `playfair-display-v36-latin-italic.woff2` → `playfair-display-400-italic.woff2`

10. Wiederhole alles für **Inter**:
    - 300 light
    - 400 regular
    - 500 medium
    - 600 semi-bold
    - 700 bold
    - Datei-Namen → `inter-300.woff2`, `inter-400.woff2`, ..., `inter-700.woff2`

---

## Schritt 2 — Files ins Repo legen

In deinem `mulimen1/mrbell-de` Repo:

1. Erstelle einen Ordner `public/fonts/` (Vercel servt alles aus `public/` automatisch unter Root-Pfad).
   - Falls du keine Next.js-Struktur mehr hast (du hast ja auf Static umgestellt): einfach Ordner `fonts/` im Root.
2. Alle WOFF2-Files dort reinkopieren.
3. Git: `git add fonts/ && git commit -m "Add local fonts (DSGVO)" && git push`

Vercel deployed automatisch. Files sind dann unter `https://mrbell.de/fonts/playfair-display-400.woff2` erreichbar.

---

## Schritt 3 — Testen

1. mrbell.de öffnen
2. Browser-DevTools → Network-Tab → Filter "Font"
3. Refresh
4. Du solltest sehen: alle Font-Requests gehen an `mrbell.de/fonts/...` — KEINE an `fonts.gstatic.com` oder `fonts.googleapis.com`

---

## Schritt 4 — Fallback (falls noch was lädt)

Falls Browser-DevTools noch Verbindungen zu Google zeigt:
- Suche im Repo nach `googleapis.com` oder `gstatic.com` — wahrscheinlich noch ein Tracking-Tool oder eingebettete Iframes
- Auch eingebettete YouTube-Videos oder Google-Maps-Embeds sind DSGVO-Probleme — die brauchen einen 2-Klick-Loader

---

## Datei-Liste die du am Ende haben solltest

```
public/fonts/
├── playfair-display-400.woff2
├── playfair-display-500.woff2
├── playfair-display-600.woff2
├── playfair-display-700.woff2
├── playfair-display-800.woff2
├── playfair-display-900.woff2
├── playfair-display-400-italic.woff2
├── playfair-display-500-italic.woff2
├── inter-300.woff2
├── inter-400.woff2
├── inter-500.woff2
├── inter-600.woff2
└── inter-700.woff2
```

**Geschätzte Größe gesamt:** ~400-500 KB (browser cached das nach erstem Besuch)

---

## Optional: Performance-Optimierung

Im `<head>` von `index.html` kannst du diese Zeile ergänzen, dann lädt der Browser kritische Fonts vor:

```html
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/playfair-display-700.woff2" as="font" type="font/woff2" crossorigin>
```

Macht die Seite einen Tick schneller, ist aber nicht zwingend.

---

**Dauer Total:** ~10 Min Download + 2 Min Git-Push + 1 Min Test = **15 Min und dein Fonts-Problem ist weg**.
