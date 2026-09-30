/* Mr. Bell — Website-Pings.
   Einbinden mit:  <script defer src="/mb-mess.js"></script>

   Gemeldet wird genau sechserlei:
     Seite geoeffnet · Nach unten gescrollt · Video gestartet
     Laenger als 30 Sekunden · Mr. Bell testen geklickt · Termin geklickt

   KEINE Cookies. KEIN localStorage. KEIN sessionStorage. Kein Fingerprinting.
   Die Sitzungsnummer ist eine Zufallszahl im Arbeitsspeicher und mit dem
   Schliessen des Tabs weg. Es wird nichts auf dem Geraet gespeichert und
   nichts von dort ausgelesen - § 25 TDDDG ist nicht beruehrt, ein
   Einwilligungsbanner also nicht erforderlich. Fuer die uebermittelten Daten
   gilt Art. 6 Abs. 1 lit. f DSGVO.

   Eigenen Besuch stummschalten:  mrbell.de/?mrbell=intern
   Wieder mitzaehlen:             mrbell.de/?mrbell=extern
*/
(function () {
  'use strict';

  var ZIEL = 'https://mrbell.app.n8n.cloud/webhook/mb-ping';

  var such = location.search || '';
  try {
    if (/[?&]mrbell=intern/.test(such)) localStorage.setItem('mb-intern', '1');
    if (/[?&]mrbell=extern/.test(such)) localStorage.removeItem('mb-intern');
  } catch (e) {}
  try { if (localStorage.getItem('mb-intern') === '1') return; } catch (e) {}

  var SID = (function () {
    try {
      var a = new Uint8Array(4); crypto.getRandomValues(a);
      return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    } catch (e) { return String(Math.random()).slice(2, 10); }
  })();

  var START = Date.now();
  var SCHON = {};

  function geraet() {
    var u = navigator.userAgent || '';
    if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(u)) return 'Tablet';
    if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(u)) return 'Handy';
    return 'Rechner';
  }

  function herkunft() {
    if (/[?&](brief|mb)=/.test(such)) return 'Brief';
    var r = document.referrer || '';
    if (!r) return 'Direkt';
    try {
      var h = new URL(r).hostname.replace(/^www\./, '');
      if (h === location.hostname) return 'Direkt';
      if (/google\./.test(h)) return 'Google';
      if (/bing\./.test(h)) return 'Bing';
      if (/duckduckgo\./.test(h)) return 'DuckDuckGo';
      if (/(facebook|instagram|linkedin|t\.co|twitter|x\.com)/.test(h)) return h;
      return h;
    } catch (e) { return 'Direkt'; }
  }

  function ping(ereignis, detail) {
    if (SCHON[ereignis]) return;          // jedes Ereignis genau einmal pro Besuch
    SCHON[ereignis] = 1;
    var txt = JSON.stringify({
      sitzung: SID,
      ereignis: ereignis,
      detail: detail || '',
      herkunft: herkunft(),
      geraet: geraet()
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ZIEL, new Blob([txt], { type: 'text/plain;charset=UTF-8' }));
      } else {
        fetch(ZIEL, { method: 'POST', mode: 'no-cors', keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: txt });
      }
    } catch (e) {}
  }

  /* 1. Seite geoeffnet */
  ping('Seite geöffnet');

  /* 2. Nach unten gescrollt — sobald ein Viertel der Seite hinter ihm liegt */
  function tiefe() {
    var h = document.documentElement;
    var ganz = h.scrollHeight - window.innerHeight;
    if (ganz <= 0) return 0;
    return Math.round((window.pageYOffset || h.scrollTop) / ganz * 100);
  }
  var wartet = false;
  window.addEventListener('scroll', function () {
    if (wartet || SCHON['Nach unten gescrollt']) return;
    wartet = true;
    setTimeout(function () {
      wartet = false;
      var t = tiefe();
      if (t >= 25) ping('Nach unten gescrollt', t + '%');
    }, 300);
  }, { passive: true });

  /* 3. Video gestartet */
  try {
    var film = document.getElementById('film');
    if (film) film.addEventListener('play', function () { ping('Video gestartet'); });
  } catch (e) {}

  /* 4. Laenger als 30 Sekunden */
  setTimeout(function () {
    if (document.visibilityState !== 'hidden') ping('Länger als 30 Sekunden');
  }, 30000);

  /* 5. + 6. Klicks */
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/wa\.me/.test(href)) ping('Mr. Bell testen geklickt');
    else if (/zeeg\.me/.test(href)) ping('Termin geklickt');
  }, true);
})();
