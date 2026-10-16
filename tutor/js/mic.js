// Ein Mikrofon für die ganze Sitzung: einmal erlauben, dann nicht bei jeder Frage neu.
// Zwischen zwei Fragen wird die Spur nur stummgeschaltet; nach ein paar Minuten Ruhe (oder wenn der Tab weg ist) geht das Mikro ganz aus.
import { ls, toast } from './util.js';
import { L } from './i18n.js';

const IDLE = 20 * 60e3;   // so lange bleibt das Mikro nach der letzten Frage bereit (stumm) – keine neue Browser-Nachfrage
const CONS = { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } };
let st = null, users = 0, idleT = 0, pending = null;
const alive = s => !!s && s.getAudioTracks().some(t => t.readyState === 'live');

export async function getMic() {
  clearTimeout(idleT);
  if (!alive(st)) {
    if (!pending) pending = navigator.mediaDevices.getUserMedia(CONS).finally(() => { pending = null; });
    st = await pending;
    st.getAudioTracks().forEach(t => t.addEventListener('ended', () => { if (st && !alive(st)) { st = null; users = 0; } }));
    hint();
  }
  users++;
  st.getAudioTracks().forEach(t => { t.enabled = true; });
  return st;
}
export function releaseMic() {
  users = Math.max(0, users - 1);
  if (!st || users > 0) return;
  st.getAudioTracks().forEach(t => { t.enabled = false; });
  clearTimeout(idleT); idleT = setTimeout(stopMic, IDLE);
}
export function stopMic() {
  clearTimeout(idleT);
  try { st && st.getTracks().forEach(t => t.stop()); } catch (e) {}
  st = null; users = 0;
}
addEventListener('pagehide', stopMic);
document.addEventListener('visibilitychange', () => { if (document.hidden && !users) { clearTimeout(idleT); idleT = setTimeout(() => { if (document.hidden && !users) stopMic(); }, 3 * 60e3); } else if (!document.hidden && st && !users) { clearTimeout(idleT); idleT = setTimeout(stopMic, IDLE); } });

// Fragt der Browser trotzdem jedes Mal? Dann einmal erklären, wie man es dauerhaft erlaubt.
async function hint() {
  try {
    const p = await navigator.permissions?.query({ name: 'microphone' });
    if (!p || p.state === 'granted') return;
    // Fragt der Browser wiederholt nach: beim 2. und 5. Mal erklären, wie man es dauerhaft erlaubt
    const n = (ls.get('tutor.micAsks', 0) || 0) + 1; ls.set('tutor.micAsks', n);
    if (n !== 2 && n !== 5) return;
    const safari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
    setTimeout(() => toast(safari
      ? L('Damit Safari nicht jedes Mal fragt: oben im Menü Safari › Einstellungen für bwlmax.de … › Mikrofon: Erlauben.', 'So Safari stops asking: menu Safari › Settings for bwlmax.de … › Microphone: Allow.')
      : L('Tipp: Damit dein Browser nicht jedes Mal fragt – beim Mikrofon „Bei Besuchen der Website zulassen“ wählen (Schloss-Symbol in der Adressleiste).', 'Tip: so your browser stops asking – choose “Allow while visiting the site” for the microphone (lock icon in the address bar).'), 9000), 1200);
  } catch (e) {}
}
