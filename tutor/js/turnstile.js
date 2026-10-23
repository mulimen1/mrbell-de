// Cloudflare Turnstile: unsichtbarer Bot-Check vor allem, was eine Mail verschickt (Konto erstellen, Passwort neu, Code erneut).
// Echte Nutzer sehen meist nichts – nur bei Verdacht erscheint ein kleines Kästchen zum Anklicken.
// Lädt das Skript nicht (Werbeblocker, Netz), geht es ohne Token weiter – dann entscheidet der Server.
const SITE_KEY = '0x4AAAAAAFiffux79CZmPIES';
let loading = null;
function load() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) loading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => (window.turnstile ? res(window.turnstile) : rej(new Error('ts')));
    s.onerror = () => { loading = null; rej(new Error('ts')); };
    document.head.appendChild(s);
  });
  return loading;
}
// Vorladen, sobald ein Formular aufgeht – dann ist der Check beim Klick schon fertig
export function preload() { load().catch(() => {}); }

// Frisches Einmal-Token. host: Element im Formular, in dem das Kästchen bei Bedarf erscheint.
export async function token(host) {
  let ts;
  try { ts = await load(); } catch (e) { return ''; }
  return new Promise(resolve => {
    let id = null, done = false;
    const fin = v => { if (done) return; done = true; clearTimeout(tm); try { if (id !== null) ts.remove(id); } catch (e) {} resolve(v || ''); };
    // Braucht jemand die Klick-Aufgabe, hat er dafür bis zu 2 Minuten
    const tm = setTimeout(() => fin(''), 120000);
    try {
      id = ts.render(host, {
        sitekey: SITE_KEY, appearance: 'interaction-only', execution: 'render', 'refresh-expired': 'never',
        language: document.documentElement.lang === 'en' ? 'en' : 'de',
        callback: t => fin(t), 'error-callback': () => { fin(''); return true; }, 'expired-callback': () => fin(''), 'timeout-callback': () => fin('')
      });
    } catch (e) { fin(''); }
  });
}
