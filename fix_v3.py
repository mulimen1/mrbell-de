#!/usr/bin/env python3
"""
MR. BELL — FIX V3: Test-Chat Prompt-Bug + Popup + fehlende Pages
cd ~/Documents/mrbell-de && python3 fix_v3.py
git add . && git commit -m "fix: test-chat prompt, popup, missing pages" && git push
"""
import os, sys

path = 'index.html'
if not os.path.exists(path):
    print(f'ERROR: {path} nicht gefunden!')
    sys.exit(1)

content = open(path, 'r', encoding='utf-8').read()
print(f'index.html geladen ({len(content)} bytes)')
fixes = 0

# ============================================================
# FIX 1: buildTestChatSystemPrompt — KOMPLETT ERSETZEN
# Der hours-Bug (Object statt Array) + plz/zip + Prompt-Härtung
# ============================================================

OLD_FUNC = '''function buildTestChatSystemPrompt() {
  const bizName = formData.bizName || formData.companyName || 'das Unternehmen';
  const branche = formData.industry || formData.branche || '';
  const isDu = formData.anrede === 'du';
  const anredeForm = isDu ? 'Du' : 'Sie';
  const tonfall = formData.tonfall || 'professionell';
  const adresse = (formData.street && formData.plz && formData.city)
    ? `${formData.street}, ${formData.plz} ${formData.city}`
    : '';
  const services = (formData.services || []).filter(s => s && s.name).map(s => `\u2022 ${s.name}${s.price ? ` \u2014 ${s.price}` : ''}`).join('\\n');
  const faqs = (formData.faqs || []).filter(f => f && f.q && f.a).map(f => `Q: ${f.q}\\nA: ${f.a}`).join('\\n\\n');
  const hours = (formData.hours || []).filter(h => h && h.day).map(h => `${h.day}: ${h.times || 'geschlossen'}`).join('\\n');
  const customPrompt = formData.botPrompt || '';'''

NEW_FUNC = '''function buildTestChatSystemPrompt() {
  const bizName = formData.bizName || formData.companyName || 'das Unternehmen';
  const branche = formData.industry || formData.branche || '';
  const isDu = formData.anrede === 'du';
  const anredeForm = isDu ? 'Du' : 'Sie';
  const tonfall = formData.tonfall || 'professionell';
  // FIX: zip statt plz
  const zipCode = formData.zip || formData.plz;
  const adresse = (formData.street && zipCode && formData.city)
    ? `${formData.street}, ${zipCode} ${formData.city}` : '';
  const services = (formData.services || []).filter(s => s && s.name).map(s => `\u2022 ${s.name}${s.price ? ` \u2014 ${s.price}` : ''}`).join('\\n');
  const faqs = (formData.faqs || []).filter(f => f && f.q && f.a).map(f => `Q: ${f.q}\\nA: ${f.a}`).join('\\n\\n');
  // FIX: hours ist Object {mo:"9-18",...} NICHT Array
  const dayNames = {mo:'Mo',di:'Di',mi:'Mi',do:'Do',fr:'Fr',sa:'Sa',so:'So'};
  let hours = '';
  if (formData.hours) {
    if (Array.isArray(formData.hours)) {
      hours = formData.hours.filter(h => h && h.day).map(h => `${h.day}: ${h.times || 'geschlossen'}`).join('\\n');
    } else if (typeof formData.hours === 'object') {
      hours = Object.entries(formData.hours).filter(([k,v]) => v).map(([k,v]) => `${dayNames[k]||k}: ${v}`).join('\\n');
    }
  }
  const customPrompt = formData.botPrompt || '';'''

if OLD_FUNC in content:
    content = content.replace(OLD_FUNC, NEW_FUNC, 1)
    fixes += 1
    print('FIX 1a \u2713 buildTestChatSystemPrompt hours+plz gefixt')
else:
    print('FIX 1a \u2717 Funktion nicht gefunden — versuche alternativen Match')
    # Fallback: nur die hours-Zeile fixen
    old_hours = "const hours = (formData.hours || []).filter(h => h && h.day).map(h => `${h.day}: ${h.times || 'geschlossen'}`).join('\\n');"
    new_hours = """const dayNames = {mo:'Mo',di:'Di',mi:'Mi',do:'Do',fr:'Fr',sa:'Sa',so:'So'};
  let hours = '';
  if (formData.hours) {
    if (Array.isArray(formData.hours)) {
      hours = formData.hours.filter(h => h && h.day).map(h => `${h.day}: ${h.times || 'geschlossen'}`).join('\\n');
    } else if (typeof formData.hours === 'object') {
      hours = Object.entries(formData.hours).filter(([k,v]) => v).map(([k,v]) => `${dayNames[k]||k}: ${v}`).join('\\n');
    }
  }"""
    if old_hours in content:
        content = content.replace(old_hours, new_hours, 1)
        fixes += 1
        print('FIX 1a \u2713 hours-Zeile einzeln gefixt')
    else:
        print('FIX 1a \u2717 AUCH hours-Zeile nicht gefunden!')

    # plz fix separat
    old_plz = "const adresse = (formData.street && formData.plz && formData.city)"
    new_plz = "const zipCode = formData.zip || formData.plz;\n  const adresse = (formData.street && zipCode && formData.city)"
    if old_plz in content:
        content = content.replace(old_plz, new_plz, 1)
        # auch den Body der adresse fixen
        content = content.replace(
            "? `${formData.street}, ${formData.plz} ${formData.city}`",
            "? `${formData.street}, ${zipCode} ${formData.city}`",
            1
        )
        fixes += 1
        print('FIX 1b \u2713 plz->zip gefixt')

# ============================================================
# FIX 1c: Prompt-Härtung — "IGNORIERE Firmenname-Assoziationen"
# ============================================================
OLD_PROMPT_HEADER = "return `Du bist der digitale WhatsApp-Assistent von ${bizName}${branche ? ` (Branche: ${branche})` : ''}."
NEW_PROMPT_HEADER = """return `Du bist der digitale WhatsApp-Assistent von ${bizName}${branche ? ` (Branche: ${branche})` : ''}.

KRITISCHE REGEL:
${branche ? `- Die Branche ist: ${branche}. IGNORIERE Assoziationen die der Firmenname ausloesen koennte.` : ''}
- Antworte AUSSCHLIESSLICH basierend auf den unten gelisteten Daten (Services, FAQ, Oeffnungszeiten).
- ERFINDE NIE Services, Preise oder Antworten die nicht unten stehen.
- Wenn etwas nicht in den Daten steht: "Das frage ich kurz beim Team nach.""""

if OLD_PROMPT_HEADER in content:
    content = content.replace(OLD_PROMPT_HEADER, NEW_PROMPT_HEADER, 1)
    fixes += 1
    print('FIX 1c \u2713 Prompt-Haertung eingefuegt')
else:
    print('FIX 1c \u2717 Prompt-Header nicht gefunden')

# ============================================================
# FIX 2: Daten-Popup — max-height + scroll + sticky footer
# ============================================================
OLD_POPUP = '<div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" style="animation: data-modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1); max-height: min(85vh, 680px); display: flex; flex-direction: column;">'
NEW_POPUP = '<div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" style="animation: data-modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1); max-height: 80vh; display: flex; flex-direction: column;">'

if OLD_POPUP in content:
    content = content.replace(OLD_POPUP, NEW_POPUP, 1)
    fixes += 1
    print('FIX 2a \u2713 Popup max-height auf 80vh')
else:
    print('FIX 2a \u2717 Popup-Pattern nicht gefunden')

# Body scrollbar machen
OLD_POPUP_BODY = '<div class="px-5 py-4 space-y-3.5" style="flex: 1 1 auto; overflow-y: auto; min-height: 0; -webkit-overflow-scrolling: touch;">'
NEW_POPUP_BODY = '<div class="px-5 py-4 space-y-3.5" style="flex: 1 1 auto; overflow-y: auto; min-height: 0; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;">'

if OLD_POPUP_BODY in content:
    content = content.replace(OLD_POPUP_BODY, NEW_POPUP_BODY, 1)
    fixes += 1
    print('FIX 2b \u2713 Popup scroll-behavior')
else:
    print('FIX 2b \u2717 Popup-Body nicht gefunden')

# Header shrink-0
OLD_POPUP_HEADER = '    <!-- Header (sticky innerhalb des Scroll-Containers via separater Bereich vor Scroll-Box) -->\n    <div class="px-5 pt-4 pb-3 border-b border-anthracite/8 relative bg-white" style="flex: 0 0 auto;">'
NEW_POPUP_HEADER = '    <!-- Header (sticky) -->\n    <div class="px-5 pt-4 pb-3 border-b border-anthracite/8 relative bg-white" style="flex: 0 0 auto; flex-shrink: 0;">'

if OLD_POPUP_HEADER in content:
    content = content.replace(OLD_POPUP_HEADER, NEW_POPUP_HEADER, 1)
    fixes += 1
    print('FIX 2c \u2713 Popup header shrink-0')
else:
    print('FIX 2c \u2717 Popup-Header nicht gefunden')

# Footer shrink-0
OLD_POPUP_FOOTER = '    <div class="px-5 py-3 bg-cream/50 border-t border-anthracite/8 flex flex-col sm:flex-row items-center gap-2 justify-between" style="flex: 0 0 auto;">'
NEW_POPUP_FOOTER = '    <div class="px-5 py-3 bg-cream/50 border-t border-anthracite/8 flex flex-col sm:flex-row items-center gap-2 justify-between" style="flex: 0 0 auto; flex-shrink: 0;">'

if OLD_POPUP_FOOTER in content:
    content = content.replace(OLD_POPUP_FOOTER, NEW_POPUP_FOOTER, 1)
    fixes += 1
    print('FIX 2d \u2713 Popup footer shrink-0')
else:
    print('FIX 2d \u2717 Popup-Footer nicht gefunden')

# ============================================================
# SPEICHERN
# ============================================================
open(path, 'w', encoding='utf-8').write(content)
print(f'\n{fixes} Fixes auf index.html angewendet')

# ============================================================
# FIX 3: Fehlende Pages anlegen (abbruch.html)
# ============================================================
print('\n=== Fehlende Pages ===')

# abbruch.html — Stripe Cancel-URL Fallback
abbruch = '''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bezahlung abgebrochen — Mr. Bell</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', sans-serif; background: #fafaf7; color: #1a1a2e; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
  .card { max-width: 480px; background: white; border-radius: 24px; padding: 3rem 2.5rem; text-align: center; box-shadow: 0 20px 60px -15px rgba(26,26,46,0.1); border: 1px solid rgba(26,26,46,0.08); }
  h1 { font-family: 'Playfair Display', serif; font-size: 2rem; margin: 0 0 1rem; }
  p { color: rgba(26,26,46,0.6); line-height: 1.6; margin: 0 0 2rem; }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.875rem 2rem; background: #C2410C; color: white; border-radius: 12px; text-decoration: none; font-weight: 600; transition: all 0.2s; }
  .btn:hover { background: #a3370a; transform: translateY(-1px); }
  .icon { width: 64px; height: 64px; margin: 0 auto 1.5rem; background: rgba(194,65,12,0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
  </div>
  <h1>Bezahlung abgebrochen</h1>
  <p>Kein Problem — es wurde nichts berechnet. Sie k\\u00f6nnen jederzeit zur\\u00fcckkehren und Ihren Mr. Bell einrichten.</p>
  <a href="https://mrbell.de/#payment" class="btn">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    Zur\\u00fcck zur Bezahlung
  </a>
  <br><br>
  <a href="https://mrbell.de" style="color: rgba(26,26,46,0.5); font-size: 0.875rem;">Zur\\u00fcck zur Startseite</a>
</div>
</body>
</html>'''

with open('abbruch.html', 'w', encoding='utf-8') as f:
    f.write(abbruch.replace('\\u00f6', '\u00f6').replace('\\u00fc', '\u00fc'))
print('abbruch.html erstellt')

# erfolg.html — Stripe Success-URL
erfolg = '''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zahlung erfolgreich — Mr. Bell</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', sans-serif; background: #fafaf7; color: #1a1a2e; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
  .card { max-width: 520px; background: white; border-radius: 24px; padding: 3rem 2.5rem; text-align: center; box-shadow: 0 20px 60px -15px rgba(26,26,46,0.1); border: 1px solid rgba(26,26,46,0.08); }
  h1 { font-family: 'Playfair Display', serif; font-size: 2.25rem; margin: 0 0 1rem; }
  p { color: rgba(26,26,46,0.6); line-height: 1.6; margin: 0 0 1.5rem; }
  .icon { width: 80px; height: 80px; margin: 0 auto 1.5rem; background: rgba(194,65,12,0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .steps { text-align: left; margin: 2rem 0; }
  .step { display: flex; gap: 1rem; padding: 1rem; border-radius: 12px; border: 1px solid rgba(26,26,46,0.08); margin-bottom: 0.75rem; }
  .step-num { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 600; color: #C2410C; flex-shrink: 0; }
  .step-text strong { color: #1a1a2e; }
  .step-text span { font-size: 0.875rem; color: rgba(26,26,46,0.5); }
  .contact { font-size: 0.875rem; color: rgba(26,26,46,0.5); }
  .contact a { color: #C2410C; text-decoration: none; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
  </div>
  <h1>Geschafft!</h1>
  <p>Vielen Dank f\\u00fcr Ihr Vertrauen. Wir bereiten Mr. Bell jetzt f\\u00fcr Sie vor.</p>
  <div class="steps">
    <div class="step"><div class="step-num">01</div><div class="step-text"><strong>Wir richten Mr. Bell ein</strong><br><span>Dauer: 24-48 Stunden</span></div></div>
    <div class="step"><div class="step-num">02</div><div class="step-text"><strong>Sie erhalten eine Best\\u00e4tigung</strong><br><span>Per Email mit allen Details</span></div></div>
    <div class="step"><div class="step-num">03</div><div class="step-text"><strong>Mr. Bell geht live</strong><br><span>Auf Ihrer WhatsApp-Nummer</span></div></div>
  </div>
  <p class="contact">Fragen? <a href="mailto:kontakt@mrbell.de">kontakt@mrbell.de</a></p>
</div>
</body>
</html>'''

with open('erfolg.html', 'w', encoding='utf-8') as f:
    f.write(erfolg.replace('\\u00fc', '\u00fc').replace('\\u00e4', '\u00e4'))
print('erfolg.html erstellt')

# ============================================================
# FIX 4: Stripe cancel_url und success_url im Backend
# Die stripe-checkout.ts hat /erfolg.html und /abbruch.html
# Prüfen ob die URLs korrekt sind
# ============================================================
stripe_path = 'api/stripe-checkout.ts'
if os.path.exists(stripe_path):
    sc = open(stripe_path, 'r', encoding='utf-8').read()
    # Prüfe ob die URLs auf die richtigen Seiten zeigen
    if 'erfolg.html' in sc:
        print(f'\nStripe success_url zeigt auf erfolg.html \u2713')
    else:
        print(f'\nWARNING: Stripe success_url zeigt NICHT auf erfolg.html!')
    if 'abbruch.html' in sc:
        print(f'Stripe cancel_url zeigt auf abbruch.html \u2713')
    else:
        print(f'WARNING: Stripe cancel_url zeigt NICHT auf abbruch.html!')

print(f'\n{"="*50}')
print(f'FERTIG! Jetzt:')
print(f'git add . && git commit -m "fix: test-chat prompt, popup, missing pages" && git push')
print(f'{"="*50}')
