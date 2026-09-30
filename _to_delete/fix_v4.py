#!/usr/bin/env python3
import re, sys

f = 'index.html'
c = open(f, 'r', encoding='utf-8').read()
print(f'Geladen: {len(c)} bytes')
n = 0

# FIX 1: Alle "Schritt X von Y" Anzeigen ausblenden
# Variante A: currentStep span (Zeile 4535)
old1 = 'Schritt <span id="currentStep">1</span> <span class="text-anthracite/40">von 14</span>'
if old1 in c:
    c = c.replace(old1, '<span id="currentStep" style="display:none">1</span><span style="display:none">von 14</span>')
    n += 1
    print('FIX 1a OK: Hauptanzeige versteckt')

# Variante B: Alle "Schritt X von Y" spans (hardcoded)
for line_text in ['Schritt 3 von 3', 'Schritt 2 von 3', 'Schritt 1 von 3']:
    count = c.count(line_text)
    if count > 0:
        c = c.replace(line_text, '')
        n += 1
        print(f'FIX 1b OK: "{line_text}" entfernt ({count}x)')

# Variante C: Dynamic step display (Zeile 9679)
old_dyn = '>Schritt <span class="text-anthracite font-semibold">${info.num}</span> von ${info.total}</span>'
if old_dyn in c:
    c = c.replace(old_dyn, ' style="display:none">Schritt ${info.num} von ${info.total}</span>')
    n += 1
    print('FIX 1c OK: Dynamische Anzeige versteckt')

# Variante D: Zeile 9694
old_static = '>Schritt 1 von 3</span>'
if old_static in c:
    c = c.replace(old_static, ' style="display:none">Schritt 1 von 3</span>')
    n += 1
    print('FIX 1d OK: Static 1von3 versteckt')

# FIX 2: Popup max-height fix
old_popup = 'max-height: min(85vh, 680px)'
if old_popup in c:
    c = c.replace(old_popup, 'max-height: 80vh')
    n += 1
    print('FIX 2 OK: Popup max-height 80vh')
else:
    print('FIX 2 SKIP: Pattern nicht gefunden')

# FIX 3: Mapping "Schritt X von 14" Kommentar-Code ausblenden
old_mapping = '// Mapping auf "Schritt X von 14":'
if old_mapping in c:
    print('FIX 3 INFO: Mapping-Kommentar gefunden (kein Fix noetig)')

open(f, 'w', encoding='utf-8').write(c)
print(f'\n{n} Fixes angewendet')
print('git add . && git commit -m "fix: hide step counter + popup" && git push')
