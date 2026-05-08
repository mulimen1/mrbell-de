#!/usr/bin/env python3
import os, sys

f = 'index.html'
c = open(f, 'r', encoding='utf-8').read()
print(f'Geladen: {len(c)} bytes')
n = 0

# FIX 1: Remove Google Fonts preconnect + stylesheet links (lines 2484-2486)
old1 = '<link rel="preconnect" href="https://fonts.googleapis.com">'
old2 = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'

if old1 in c:
    c = c.replace(old1, '', 1)
    n += 1
    print('FIX 1a OK: preconnect googleapis removed')

if old2 in c:
    c = c.replace(old2, '', 1)
    n += 1
    print('FIX 1b OK: preconnect gstatic removed')

# Remove the CSS link (long line with both fonts)
idx = c.find('fonts.googleapis.com/css2?family=Inter')
if idx > 0:
    # Find the full <link> tag
    start = c.rfind('<link', max(0, idx - 200), idx)
    end = c.find('>', idx) + 1
    old_link = c[start:end]
    c = c.replace(old_link, '', 1)
    n += 1
    print('FIX 1c OK: Google Fonts CSS link removed')
    print(f'  Removed: {old_link[:80]}...')

# FIX 2: Add local @font-face declarations
# Insert right after <style> or at the beginning of first <style> block
font_face = """
/* Self-hosted fonts (DSGVO-konform, kein Google-Tracking) */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-VariableFont_opsz_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Playfair Display';
  src: url('/fonts/PlayfairDisplay-VariableFont_wght.ttf') format('truetype');
  font-weight: 400 900;
  font-style: normal;
  font-display: swap;
}
"""

# Find the first <style> tag and insert after it
style_idx = c.find('<style>')
if style_idx > 0:
    insert_pos = style_idx + len('<style>')
    c = c[:insert_pos] + font_face + c[insert_pos:]
    n += 1
    print('FIX 2 OK: @font-face declarations added after first <style>')
else:
    print('FIX 2 SKIP: no <style> tag found')

open(f, 'w', encoding='utf-8').write(c)
print(f'\n{n} Fixes angewendet')

# Check if fonts directory exists
if not os.path.exists('fonts'):
    os.makedirs('fonts')
    print('\nfonts/ directory created - copy font files there!')

print('\nNaechste Schritte:')
print('1. cp ~/Downloads/Inter-VariableFont_opsz_wght.ttf fonts/')
print('2. cp ~/Downloads/PlayfairDisplay-VariableFont_wght.ttf fonts/')
print('   ODER aus dem push-Ordner oder wo sie liegen')
print('3. git add . && git commit -m "fix: self-host fonts DSGVO" && git push')
