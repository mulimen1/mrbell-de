/* Mr. Bell — Einwilligung für die eigene Analyse.
   Einbinden mit:  <script defer src="/mb-consent.js"></script>  (vor mb-mess.js)

   - "Ablehnen" und "Analyse erlauben" sind gleichwertig.
   - Erst nach "Analyse erlauben" wird ein Cookie mit einer zufälligen Kennung gesetzt
     (mb_analyse=a + 12 Zeichen, 12 Monate) und mb-mess.js startet.
   - "Ablehnen" speichert nur die Entscheidung (mb_analyse=nein), damit nicht erneut gefragt wird.
   - Widerruf jederzeit über "Cookie-Einstellungen" in der Fußzeile: Kennung wird gelöscht.
   - Es werden keine Dienste Dritter geladen.

   Eigene Besuche nicht mitzählen:  mrbell.de/?mrbell=intern   (wieder mitzählen: ?mrbell=extern)
*/
(function () {
  'use strict';
  var NAME = 'mb_analyse', JAHR = 31536000;

  function lies(n) { var m = new RegExp('(?:^|;\\s*)' + n + '=([^;]*)').exec(document.cookie || ''); return m ? m[1] : null; }
  function setze(n, v, alter) {
    document.cookie = n + '=' + v + '; Max-Age=' + alter + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  }
  function neueKennung() {
    try {
      var a = new Uint8Array(6); crypto.getRandomValues(a);
      return 'a' + Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    } catch (e) { return 'a' + ('000000000000' + Math.floor(Math.random() * 281474976710655).toString(16)).slice(-12); }
  }

  // Eigene Besuche (nur auf ausdrücklichen Wunsch des Betreibers)
  var such = location.search || '';
  if (/[?&]mrbell=intern/.test(such)) setze('mb_intern', '1', JAHR * 5);
  if (/[?&]mrbell=extern/.test(such)) setze('mb_intern', '', 0);

  function erlaubt() { return /^a[0-9a-f]{12}$/.test(lies(NAME) || ''); }
  window.mbAnalyseErlaubt = erlaubt;

  var css =
    '#mbCons{color-scheme:light;position:fixed;z-index:9999;left:24px;bottom:24px;width:min(420px,calc(100vw - 32px));box-sizing:border-box;' +
    'background:#fff;color:#1a1a2e;border:1px solid #e7e4dc;border-radius:16px;padding:20px 20px 18px;' +
    'box-shadow:0 1px 2px rgba(26,26,46,.06),0 12px 32px rgba(26,26,46,.12);font:14px/1.55 Inter,system-ui,-apple-system,sans-serif;' +
    '-webkit-font-smoothing:antialiased;animation:mbConsIn .35s cubic-bezier(.2,.8,.2,1)}' +
    '@keyframes mbConsIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){#mbCons{animation:none}}' +
    '#mbCons h2{margin:0 0 6px;font:inherit;font-size:15px;font-weight:600;letter-spacing:-.005em;color:#1a1a2e}' +
    '#mbCons p{margin:0 0 16px;font-size:13px;line-height:1.55;color:#55546a}' +
    '#mbCons a{color:#c2410c;font-weight:500;text-decoration:underline;text-underline-offset:2px;text-decoration-color:rgba(194,65,12,.35)}' +
    '#mbCons a:hover{text-decoration-color:#c2410c}' +
    '#mbCons .r{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '#mbCons button{appearance:none;font:inherit;font-size:14px;font-weight:600;height:42px;border-radius:10px;cursor:pointer;' +
    'border:1.5px solid #c2410c;background:#fff;color:#c2410c;transition:background .15s,color .15s}' +
    '#mbCons button:hover{background:#c2410c;color:#fff}' +
    '#mbCons button:focus-visible{outline:2px solid #c2410c;outline-offset:2px}' +
    '@media (max-width:520px){#mbCons{left:12px;right:12px;bottom:12px;width:auto;padding:18px 16px 16px}}' +
    '@media (min-width:521px){#mbCons{left:32px;bottom:32px;width:min(500px,calc(100vw - 64px));padding:28px 28px 24px;border-radius:18px}' +
    '#mbCons h2{font-size:19px;margin-bottom:8px}#mbCons p{font-size:15px;margin-bottom:20px}' +
    '#mbCons .r{gap:10px}#mbCons button{height:50px;font-size:16px;border-radius:12px}}';

  function banner() {
    if (document.getElementById('mbCons')) return;
    if (!document.getElementById('mbConsCss')) { var st = document.createElement('style'); st.id = 'mbConsCss'; st.textContent = css; document.head.appendChild(st); }
    var d = document.createElement('div'); d.id = 'mbCons'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-labelledby', 'mbConsT');
    d.innerHTML = '<h2 id="mbConsT">Dürfen wir die Nutzung auswerten?</h2>' +
      '<p>Mit Ihrer Erlaubnis setzen wir ein Cookie, um zu verstehen, wie unsere Seite genutzt wird. ' +
      'Keine Werbung, keine Dienste Dritter, jederzeit widerrufbar. <a href="/datenschutz.html#s15">Datenschutz</a></p>' +
      '<div class="r"><button type="button" data-v="nein">Ablehnen</button><button type="button" data-v="ja">Erlauben</button></div>';
    d.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.getAttribute('data-v') === 'ja') {
        setze(NAME, neueKennung(), JAHR);
        d.remove();
        try { if (window.mbMessStart) window.mbMessStart(true); } catch (x) {}
      } else {
        setze(NAME, 'nein', JAHR);
        d.remove();
      }
    });
    document.body.appendChild(d);
  }

  function fussLink() {
    var nav = document.querySelector('footer nav') || document.querySelector('footer');
    if (!nav || document.getElementById('mbConsLink')) return;
    var a = document.createElement('a'); a.href = '#'; a.id = 'mbConsLink'; a.textContent = 'Cookie-Einstellungen';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var war = erlaubt();
      setze(NAME, '', 0);                 // Kennung bzw. Entscheidung löschen
      if (war) { location.reload(); return; }   // laufende Messung sicher beenden, dann neu fragen
      banner();
    });
    nav.appendChild(a);
  }

  function los() {
    if (lies(NAME) === null || lies(NAME) === '') banner();
    fussLink();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
