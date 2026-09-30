#!/usr/bin/env python3
"""
MR. BELL — DEPLOY ALL FIXES
============================
Dieses Script:
1. Fixt 4 Code-Bugs in index.html (BUG-3, BUG-4, BUG-5, DSGVO-Link)
2. Kopiert 8 API-Dateien nach /api/
3. Kopiert 3 Legal-Pages ins Root (agb, datenschutz, dsgvo)

USAGE:
  cd ~/Documents/mrbell-de
  python3 deploy_all.py
  git add . && git commit -m "fix: all bugs + api + legal pages" && git push --force
"""

import os, sys, shutil

REPO = os.getcwd()
print(f"Arbeite in: {REPO}")

# Prüfe ob wir im richtigen Ordner sind
if not os.path.exists(os.path.join(REPO, 'index.html')):
    print("ERROR: index.html nicht gefunden! Bist du in ~/Documents/mrbell-de/ ?")
    sys.exit(1)

DOWNLOADS = os.path.expanduser("~/Downloads")
fixes = 0

# ============================================================
# SCHRITT 1: index.html Code-Bugs fixen
# ============================================================
print("\n=== SCHRITT 1: index.html patchen ===")

content = open('index.html', 'r', encoding='utf-8').read()
print(f"index.html geladen ({len(content)} bytes)")

# BUG-3: Bell-Chat Fehlermeldung sichtbar machen
old_3 = "    } catch (e) {\n      console.error('BellChat send error:', e);\n      showError('Hoppla, kurz hat die Verbindung gehakt. Versuch es nochmal.');"
new_3 = "    } catch (e) {\n      console.error('BellChat send error:', e);\n      addBotMessage('Verbindung fehlgeschlagen \\u2014 bitte versuche es erneut oder schreibe uns direkt an kontakt@mrbell.de');"
if old_3 in content:
    content = content.replace(old_3, new_3, 1)
    fixes += 1
    print("BUG-3 \\u2713 Bell-Chat Fehler-Bubble")
else:
    print("BUG-3 \\u2717 nicht gefunden")

# BUG-4a: Test-Chat System-Prompt (nicht immer "geschlossen")
old_4a = "Tu so, als w\\u00e4re das Unternehmen aktuell GESCHLOSSEN. Du bist der digitale Assistent der au\\u00dferhalb der \\u00d6ffnungszeiten Anfragen entgegennimmt. Deine Hauptaufgabe ist NICHT, sofort Termine zu vergeben oder verbindliche Ausk\\u00fcnfte zu geben \\u2014 sondern Anfragen aufzunehmen und an das Team weiterzuleiten."
# Versuche mit echten Unicode-Zeichen
old_4a_real = "Tu so, als w\u00e4re das Unternehmen aktuell GESCHLOSSEN. Du bist der digitale Assistent der au\u00dferhalb der \u00d6ffnungszeiten Anfragen entgegennimmt. Deine Hauptaufgabe ist NICHT, sofort Termine zu vergeben oder verbindliche Ausk\u00fcnfte zu geben \u2014 sondern Anfragen aufzunehmen und an das Team weiterzuleiten."
new_4a = "Du bist der digitale Assistent des Unternehmens. Falls \u00d6ffnungszeiten konfiguriert sind, tu so als w\u00e4re gerade au\u00dferhalb der \u00d6ffnungszeiten. Falls keine \u00d6ffnungszeiten gesetzt sind, tu so als w\u00e4rest du ein verf\u00fcgbarer Assistent der Anfragen entgegennimmt. Deine Hauptaufgabe: Anfragen aufnehmen, nach Name und Wunschtermin fragen, und an das Team weiterleiten."

if old_4a_real in content:
    content = content.replace(old_4a_real, new_4a, 1)
    fixes += 1
    print("BUG-4a \\u2713 Test-Chat System-Prompt")
else:
    print("BUG-4a \\u2717 nicht gefunden")

# BUG-4b: Greeting Du (kein "geschlossen")
old_4b = "const greetingDu = `Hi! \\ud83d\\udc4b Wir haben gerade leider geschlossen, aber ich bin der digitale Assistent von ${bizName}. Ich kann deine Anfrage entgegennehmen und an das Team weiterleiten \\u2014 wie kann ich dir helfen?`;"
old_4b_real = "const greetingDu = `Hi! \U0001f44b Wir haben gerade leider geschlossen, aber ich bin der digitale Assistent von ${bizName}. Ich kann deine Anfrage entgegennehmen und an das Team weiterleiten \u2014 wie kann ich dir helfen?`;"
new_4b = "const greetingDu = `Hi! \U0001f44b Ich bin der digitale Assistent von ${bizName}. Ich kann deine Anfrage entgegennehmen und an das Team weiterleiten \u2014 wie kann ich dir helfen?`;"

if old_4b_real in content:
    content = content.replace(old_4b_real, new_4b, 1)
    fixes += 1
    print("BUG-4b \\u2713 Greeting Du")
else:
    print("BUG-4b \\u2717 nicht gefunden")

# BUG-4c: Greeting Sie (kein "geschlossen")
old_4c_real = "const greetingSie = `Hallo! \U0001f44b Wir haben aktuell leider geschlossen, aber ich bin der digitale Assistent von ${bizName}. Gerne nehme ich Ihre Anfrage entgegen und leite sie an das Team weiter \u2014 wie kann ich Ihnen helfen?`;"
new_4c = "const greetingSie = `Hallo! \U0001f44b Ich bin der digitale Assistent von ${bizName}. Gerne nehme ich Ihre Anfrage entgegen und leite sie an das Team weiter \u2014 wie kann ich Ihnen helfen?`;"

if old_4c_real in content:
    content = content.replace(old_4c_real, new_4c, 1)
    fixes += 1
    print("BUG-4c \\u2713 Greeting Sie")
else:
    print("BUG-4c \\u2717 nicht gefunden")

# BUG-5: Stripe Debounce — füge Guard am Anfang von startStripeCheckoutSelfService ein
old_5 = "async function startStripeCheckoutSelfService() {\n  // Debounce"
if old_5 not in content:
    # Noch kein Debounce — füge hinzu
    old_5_orig = "async function startStripeCheckoutSelfService() {\n  // 1. AGB-Checkbox"
    new_5 = "async function startStripeCheckoutSelfService() {\n  if (window.__stripeInFlight) return;\n  window.__stripeInFlight = true;\n  const __resetFlight = () => { window.__stripeInFlight = false; };\n  // 1. AGB-Checkbox"
    if old_5_orig in content:
        content = content.replace(old_5_orig, new_5, 1)
        # Button reset bei Fehler — finde die catch-Blöcke
        # Am Ende bei Error: Button reset
        old_5_err = "    if (btn) btn.disabled = false;\n    if (lbl) lbl.textContent = originalLabel;\n    alert('Fehler bei der Weiterleitung zu Stripe: ' + err.message + '\\n\\nBitte versuchen Sie es erneut oder kontaktieren Sie kontakt@mrbell.de');\n  }\n}"
        new_5_err = "    if (btn) btn.disabled = false;\n    if (lbl) lbl.textContent = originalLabel;\n    __resetFlight();\n    alert('Fehler bei der Weiterleitung zu Stripe: ' + err.message + '\\n\\nBitte versuchen Sie es erneut oder kontaktieren Sie kontakt@mrbell.de');\n  }\n}"
        if old_5_err in content:
            content = content.replace(old_5_err, new_5_err, 1)
        fixes += 1
        print("BUG-5a \\u2713 Stripe Self-Service Debounce")
    else:
        print("BUG-5a \\u2717 nicht gefunden")
else:
    print("BUG-5a \\u2713 bereits gefixt")

# DSGVO Footer-Link
old_footer = '          <a href="/datenschutz.html" target="_blank" rel="noopener" class="block text-sm text-anthracite/70 hover:text-wa-500 transition-colors">Datenschutz</a>\n          <a href="/impressum.html"'
new_footer = '          <a href="/datenschutz.html" target="_blank" rel="noopener" class="block text-sm text-anthracite/70 hover:text-wa-500 transition-colors">Datenschutz</a>\n          <a href="/dsgvo.html" target="_blank" rel="noopener" class="block text-sm text-anthracite/70 hover:text-wa-500 transition-colors">DSGVO</a>\n          <a href="/impressum.html"'
if old_footer in content:
    content = content.replace(old_footer, new_footer, 1)
    fixes += 1
    print("FOOTER \\u2713 DSGVO-Link")
else:
    print("FOOTER \\u2717 nicht gefunden")

open('index.html', 'w', encoding='utf-8').write(content)
print(f"\n{fixes} Fixes auf index.html angewendet")

# ============================================================
# SCHRITT 2: API-Dateien kopieren
# ============================================================
print("\n=== SCHRITT 2: API-Dateien ===")

api_dir = os.path.join(REPO, 'api')
os.makedirs(api_dir, exist_ok=True)

api_files = [
    'bell-chat.ts', 'test-chat.ts', 'stripe-checkout.ts', 'stripe-webhook.ts',
    'verify-email.ts', 'save-onboarding.ts', '_sheet.ts', '_resend.ts'
]

copied_api = 0
for f in api_files:
    src = os.path.join(DOWNLOADS, f)
    dst = os.path.join(api_dir, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        copied_api += 1
        print(f"  {f} -> api/{f}")
    else:
        print(f"  {f} NICHT in Downloads gefunden!")

print(f"{copied_api}/{len(api_files)} API-Dateien kopiert")

# ============================================================
# SCHRITT 3: Legal-Pages kopieren
# ============================================================
print("\n=== SCHRITT 3: Legal-Pages ===")

legal_files = ['agb.html', 'datenschutz.html', 'dsgvo.html']
copied_legal = 0
for f in legal_files:
    src = os.path.join(DOWNLOADS, f)
    dst = os.path.join(REPO, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        copied_legal += 1
        print(f"  {f} -> {f}")
    else:
        print(f"  {f} NICHT in Downloads gefunden!")

print(f"{copied_legal}/{len(legal_files)} Legal-Pages kopiert")

# ============================================================
# ZUSAMMENFASSUNG
# ============================================================
print("\n" + "=" * 50)
print(f"FERTIG!")
print(f"  index.html: {fixes} Code-Fixes")
print(f"  API-Dateien: {copied_api} kopiert")
print(f"  Legal-Pages: {copied_legal} kopiert")
print(f"\nJetzt:")
print(f"  git add . && git commit -m \"fix: all bugs + api + legal pages\" && git push --force")
print("=" * 50)
