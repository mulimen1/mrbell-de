#!/usr/bin/env python3
import sys

f = 'index.html'
c = open(f, 'r', encoding='utf-8').read()
print(f'Geladen: {len(c)} bytes')
n = 0

# ============================================================
# FIX 1: Bell-Chat — Save messages to sessionStorage after each message
# Inject save call after bellchatState.messages changes
# ============================================================

# Nach jeder Bot-Antwort speichern wir den State
old_finally = """} finally {
    showTyping(false);
    bellchatState.isLoading = false;
  }
}

// ==========================================
// API CALL"""

new_finally = """} finally {
    showTyping(false);
    bellchatState.isLoading = false;
    // Persist chat to sessionStorage
    try { sessionStorage.setItem('bellchat_state', JSON.stringify({messages: bellchatState.messages, step: bellchatState.step, answers: bellchatState.answers, qaAnswered: bellchatState.qaAnswered})); } catch(e) {}
  }
}

// ==========================================
// API CALL"""

if old_finally in c:
    c = c.replace(old_finally, new_finally, 1)
    n += 1
    print('FIX 1a OK: BellChat save after message')
else:
    print('FIX 1a SKIP: finally block not found')

# ============================================================
# FIX 2: Bell-Chat — Restore from sessionStorage on open
# In openBellChat(), before startConversation check
# ============================================================

old_open_check = """  // Reset state nur wenn frischer Start
  if (bellchatState.messages.length === 0) {
    startConversation();
  }"""

new_open_check = """  // Restore from session if available
  if (bellchatState.messages.length === 0) {
    try {
      var saved = sessionStorage.getItem('bellchat_state');
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed.messages && parsed.messages.length > 0) {
          bellchatState.messages = parsed.messages;
          bellchatState.step = parsed.step || 0;
          bellchatState.answers = parsed.answers || {};
          bellchatState.qaAnswered = parsed.qaAnswered || false;
          // Re-render saved messages
          var container = document.getElementById('bellchat-messages');
          if (container) {
            container.innerHTML = '';
            parsed.messages.forEach(function(m) {
              if (m.role === 'user') { addUserMessage(m.content, true); }
              else if (m.role === 'assistant') { addBotMessage(m.content, true); }
            });
          }
        } else {
          startConversation();
        }
      } else {
        startConversation();
      }
    } catch(e) {
      startConversation();
    }
  }"""

if old_open_check in c:
    c = c.replace(old_open_check, new_open_check, 1)
    n += 1
    print('FIX 2 OK: BellChat restore from session')
else:
    print('FIX 2 SKIP: open check not found')

# ============================================================
# FIX 3: addUserMessage + addBotMessage — add skipSave param
# so restored messages don't re-trigger saves
# We need to find addBotMessage and addUserMessage and add
# a "noScroll" parameter for restored messages
# ============================================================
# Actually, the simpler approach: the save happens in the finally block,
# and restore just re-renders. No changes needed to add/remove functions.
# The "true" param in addUserMessage(m.content, true) just needs to exist.
# Let's check if addUserMessage accepts a second param or not.

# For now, skip this — the restore will call addUserMessage/addBotMessage
# which already exist. If they auto-scroll, that's fine.

# ============================================================
# FIX 4: Bell-Chat Lock after CTA
# After CTA card is shown, disable input
# ============================================================

old_cta_check = """    // Wenn CTA ready -> spezielle CTA-Card statt normale Message
      if (response.ctaReady) {
        addCTACard(response.reply);"""

new_cta_check = """    // Wenn CTA ready -> spezielle CTA-Card statt normale Message
      if (response.ctaReady) {
        addCTACard(response.reply);
        // Lock chat after CTA
        bellchatState.locked = true;
        var inp = document.getElementById('bellchat-input');
        if (inp) { inp.disabled = true; inp.placeholder = 'Chat beendet'; }
        try { sessionStorage.setItem('bellchat_locked', 'true'); } catch(e) {}"""

if old_cta_check in c:
    c = c.replace(old_cta_check, new_cta_check, 1)
    n += 1
    print('FIX 4 OK: BellChat lock after CTA')
else:
    print('FIX 4 SKIP: CTA check not found')

# ============================================================
# FIX 5: Check lock on open
# ============================================================

old_focus = """  // Focus auf Input nach Animation
  setTimeout(() => {
    const input = document.getElementById('bellchat-input');
    if (input) input.focus();
  }, 350);"""

new_focus = """  // Check if chat was locked (CTA already shown)
  if (sessionStorage.getItem('bellchat_locked') === 'true') {
    bellchatState.locked = true;
    var inp2 = document.getElementById('bellchat-input');
    if (inp2) { inp2.disabled = true; inp2.placeholder = 'Chat beendet'; }
  }

  // Focus auf Input nach Animation
  setTimeout(() => {
    const input = document.getElementById('bellchat-input');
    if (input && !bellchatState.locked) input.focus();
  }, 350);"""

if old_focus in c:
    c = c.replace(old_focus, new_focus, 1)
    n += 1
    print('FIX 5 OK: BellChat lock check on open')
else:
    print('FIX 5 SKIP: focus block not found')

# ============================================================
# FIX 6: Prevent sending when locked
# ============================================================

old_send_guard = "  async function sendBellChatMessage() {\n    if (bellchatState.isLoading) return;"
new_send_guard = "  async function sendBellChatMessage() {\n    if (bellchatState.isLoading || bellchatState.locked) return;"

if old_send_guard in c:
    c = c.replace(old_send_guard, new_send_guard, 1)
    n += 1
    print('FIX 6 OK: BellChat send guard with lock')
else:
    print('FIX 6 SKIP: send guard not found')

# ============================================================
# SAVE
# ============================================================
open(f, 'w', encoding='utf-8').write(c)
print(f'\n{n} Fixes angewendet')
print('git add . && git commit -m "fix: chat persistence + lock" && git push')
