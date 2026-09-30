#!/usr/bin/env python3
"""
MR. BELL — 3 Blocker Fixes
Lege diese Datei neben deine index.html und fuehre aus:
  python3 fix.py
"""

import os, sys

path = 'index.html'

# Suche die Datei
if not os.path.exists(path):
    # Versuch im mrbell-de Ordner
    candidates = [
        os.path.expanduser('~/mrbell-de/index.html'),
        os.path.expanduser('~/Desktop/index.html'),
        os.path.expanduser('~/Downloads/index_LAUNCH.html'),
    ]
    for c in candidates:
        if os.path.exists(c):
            path = c
            break

if not os.path.exists(path):
    print(f'ERROR: {path} nicht gefunden!')
    print('Lege fix.py in den gleichen Ordner wie index.html')
    sys.exit(1)

content = open(path, 'r', encoding='utf-8').read()
print(f'Datei geladen: {path} ({len(content)} bytes)')
fixes = 0

# ============================================================
# FIX A: startStripeCheckoutSelfService - Plan-Erkennung
# ============================================================
OLD_A = '// 2. Welcher Plan wurde gew\u00e4hlt?\n  let planType;\n  if (typeof bundleState !== \'undefined\') {\n    if (bundleState.pioneer6) planType = \'pioneer_6\';\n    else if (bundleState.pioneer3) planType = \'pioneer_3\';\n    else if (bundleState.standard) planType = \'standard\';\n  }\n  if (!planType) {\n    alert(\'Bitte w\u00e4hlen Sie einen Plan aus (Pioneer 6 Mo, Pioneer 3 Mo oder Standard).\');\n    return;\n  }'

NEW_A = '// 2. Plan? (FIX A: formData.selectedPlan + bundleState fallback)\n  let planType;\n  if (formData.selectedPlan === \'pioneer6\' || formData.selectedPlan === \'pioneer\') planType = \'pioneer_6\';\n  else if (formData.selectedPlan === \'pioneer3\') planType = \'pioneer_3\';\n  else if (formData.selectedPlan === \'standard\') planType = \'standard\';\n  if (!planType && typeof bundleState !== \'undefined\') {\n    if (bundleState.pioneer6) planType = \'pioneer_6\';\n    else if (bundleState.pioneer3) planType = \'pioneer_3\';\n    else if (bundleState.standard) planType = \'standard\';\n  }\n  if (!planType) {\n    alert(\'Bitte w\u00e4hlen Sie einen Plan aus (Pioneer 6 Mo, Pioneer 3 Mo oder Standard).\');\n    return;\n  }'

if OLD_A in content:
    content = content.replace(OLD_A, NEW_A, 1)
    fixes += 1
    print('FIX A \u2713 Plan-Erkennung gefixt')
else:
    print('FIX A \u2717 Pattern nicht gefunden!')

# ============================================================
# FIX B: bizMail -> bizEmail (kommt 2x vor)
# ============================================================
OLD_B = "const email = (formData.bizMail || formData.companyEmail || '').trim();"
NEW_B = "const email = (formData.bizEmail || formData.bizMail || formData.companyEmail || '').trim();"

n = content.count(OLD_B)
if n > 0:
    content = content.replace(OLD_B, NEW_B)
    fixes += n
    print(f'FIX B \u2713 bizEmail gefixt ({n}x)')
else:
    print('FIX B \u2717 Pattern nicht gefunden!')

# ============================================================
# FIX C: Payment ohne Plan -> redirect statt 99eur Setup
# ============================================================
OLD_C = "// 99\u20ac-only flow (kein Plan gew\u00e4hlt) \u2014 sollte hier eigentlich nicht landen, aber safe\n    if (planLabel) planLabel.textContent = 'Gef\u00fchrtes Setup';\n    if (planPrice) planPrice.textContent = '99\u20ac';\n    if (strike) strike.classList.add('hidden');\n    if (badge)  badge.classList.add('hidden');\n    if (note)   note.textContent = 'einmalig \u00b7 R\u00fcckerstattung nur bei Buchung von Pioneer 6 Monate (nach 6 Mo)';\n  }"

NEW_C = """// FIX C: Kein Plan -> redirect zur Auswahl
    if (planLabel) planLabel.textContent = 'Kein Plan ausgewählt';
    if (planPrice) planPrice.textContent = '—';
    if (strike) strike.classList.add('hidden');
    if (badge)  badge.classList.add('hidden');
    if (note)   note.textContent = 'Bitte zuerst einen Plan auswählen';
    setTimeout(function() {
      alert('Bitte wählen Sie zuerst einen Plan aus (Pioneer oder Standard).');
      if (typeof switchView === 'function') switchView('step-bundle-pricing');
    }, 300);
    return;
  }"""

if OLD_C in content:
    content = content.replace(OLD_C, NEW_C, 1)
    fixes += 1
    print('FIX C \u2713 Payment-Redirect gefixt')
else:
    print('FIX C \u2717 Pattern nicht gefunden!')

# ============================================================
# Speichern
# ============================================================
open(path, 'w', encoding='utf-8').write(content)
print(f'\nDone: {fixes} fixes angewendet auf {path}')
print(f'Jetzt: git add . && git commit -m "fix: 3 stripe blocker" && git push')
