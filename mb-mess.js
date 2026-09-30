/* Mr. Bell — Website-Messung.
   Einbinden mit:  <script defer src="/mb-mess.js"></script>

   KEINE Cookies. KEIN localStorage. KEIN sessionStorage. Kein Fingerprinting.
   Die Sitzungsnummer ist eine Zufallszahl im Arbeitsspeicher und mit dem
   Schliessen des Tabs weg. Damit wird weder etwas auf dem Geraet gespeichert
   noch von dort ausgelesen - § 25 TDDDG ist nicht beruehrt, ein Banner also
   nicht noetig. Fuer die uebermittelten Daten gilt Art. 6 Abs. 1 lit. f DSGVO.

   Einzige Ausnahme: der Schalter fuer den eigenen Besuch, den DU selbst
   aufrufst. Er merkt sich nur, dass dieses eine Geraet nicht mitgezaehlt wird.
       stumm:      mrbell.de/?mrbell=intern
       wieder an:  mrbell.de/?mrbell=extern
*/
(function () {
  'use strict';

  var ZIEL = 'https://mrbell.app.n8n.cloud/webhook/mb-mess-9f4c21a7';

  var such = location.search || '';
  function lies(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  try {
    if (/[?&]mrbell=intern/.test(such)) localStorage.setItem('mb-intern', '1');
    if (/[?&]mrbell=extern/.test(such)) localStorage.removeItem('mb-intern');
  } catch (e) {}
  var INTERN = lies('mb-intern') === '1';
  if (INTERN) return;

  // Sitzungsnummer: nur im Arbeitsspeicher.
  var SID = (function () {
    try {
      var a = new Uint8Array(8); crypto.getRandomValues(a);
      return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    } catch (e) { return String(Date.now()) + String(Math.random()).slice(2, 10); }
  })();

  var START = Date.now(), GESENDET = {}, MAX_TIEFE = 0;

  function geraet() {
    var u = navigator.userAgent || '';
    if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(u)) return 'Tablet';
    if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(u)) return 'Handy';
    return 'Rechner';
  }
  function browser() {
    var u = navigator.userAgent || '';
    if (/Edg\//.test(u)) return 'Edge';
    if (/OPR\//.test(u)) return 'Opera';
    if (/Chrome\//.test(u) && !/Chromium/.test(u)) return 'Chrome';
    if (/Firefox\//.test(u)) return 'Firefox';
    if (/Safari\//.test(u)) return 'Safari';
    return 'anderer';
  }
  function herkunft() {
    var r = document.referrer || '';
    if (/[?&]utm_source=/.test(such)) {
      var m = such.match(/[?&]utm_source=([^&]*)/);
      return 'Kampagne: ' + decodeURIComponent(m[1] || '');
    }
    if (/[?&](brief|mb)=/.test(such)) return 'Brief';
    if (!r) return 'Direkt';
    try {
      var h = new URL(r).hostname.replace(/^www\./, '');
      if (h === location.hostname) return 'intern';
      if (/google\./.test(h)) return 'Google';
      if (/bing\./.test(h)) return 'Bing';
      if (/duckduckgo\./.test(h)) return 'DuckDuckGo';
      if (/(facebook|instagram|linkedin|t\.co|twitter|x\.com)/.test(h)) return 'Social: ' + h;
      return h;
    } catch (e) { return 'unbekannt'; }
  }

  function melde(ereignis, wert, einmalig) {
    var schluessel = ereignis + ':' + (wert || '');
    if (einmalig) { if (GESENDET[schluessel]) return; GESENDET[schluessel] = 1; }
    var txt = JSON.stringify({
      sitzung: SID,
      ereignis: ereignis,
      wert: (wert === undefined || wert === null) ? '' : String(wert),
      seite: location.pathname || '/',
      sekunden: Math.round((Date.now() - START) / 1000),
      tiefe: MAX_TIEFE,
      herkunft: herkunft(),
      geraet: geraet(),
      browser: browser(),
      sprache: (navigator.language || '').slice(0, 5),
      breite: window.innerWidth || 0
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

  /* -------- Seitenaufruf -------- */
  melde('seite_geoeffnet');

  /* -------- Scrolltiefe -------- */
  function tiefe() {
    var h = document.documentElement;
    var ganz = h.scrollHeight - window.innerHeight;
    if (ganz <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((window.pageYOffset || h.scrollTop) / ganz * 100)));
  }
  var wartet = false;
  window.addEventListener('scroll', function () {
    if (wartet) return;
    wartet = true;
    setTimeout(function () {
      wartet = false;
      var t = tiefe();
      if (t > MAX_TIEFE) MAX_TIEFE = t;
      [25, 50, 75, 100].forEach(function (m) { if (MAX_TIEFE >= m) melde('gescrollt', m, true); });
    }, 250);
  }, { passive: true });

  /* -------- Abschnitte im Blick -------- */
  var ABSCHNITTE = { testen: 'Mr. Bell testen', koennen: 'Was kann er', bewertungen: 'Bewertungen',
                     kontrolle: 'Ihre Kontrolle', datenschutz: 'Datenschutz', preise: 'Preise', termin: 'Termin' };
  try {
    if ('IntersectionObserver' in window) {
      var beo = new IntersectionObserver(function (liste) {
        liste.forEach(function (e) {
          if (e.isIntersecting && ABSCHNITTE[e.target.id]) melde('abschnitt_gesehen', ABSCHNITTE[e.target.id], true);
        });
      }, { threshold: 0.4 });
      Object.keys(ABSCHNITTE).forEach(function (id) {
        var el = document.getElementById(id); if (el) beo.observe(el);
      });
    }
  } catch (e) {}

  /* -------- Video -------- */
  try {
    var film = document.getElementById('film');
    if (film) {
      var lief = false, marke = 0;
      film.addEventListener('play', function () { lief = true; melde('video_gestartet', '', true); });
      film.addEventListener('timeupdate', function () {
        if (!film.duration) return;
        var p = Math.round(film.currentTime / film.duration * 100);
        [25, 50, 75].forEach(function (m) { if (p >= m && marke < m) { marke = m; melde('video_fortschritt', m, true); } });
      });
      film.addEventListener('ended', function () { melde('video_zuende', Math.round(film.duration || 0), true); });
      film.addEventListener('pause', function () {
        if (!lief || film.ended) return;
        var p = film.duration ? Math.round(film.currentTime / film.duration * 100) : 0;
        if (p >= 98) return;
        melde('video_abgebrochen', p + '% nach ' + Math.round(film.currentTime) + 's');
      });
    }
  } catch (e) {}

  /* -------- Klicks -------- */
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/wa\.me/.test(href)) melde('whatsapp_geklickt');
    else if (/zeeg\.me/.test(href)) melde('termin_geklickt');
    else if (a.id === 'bigPlay') melde('video_knopf');
  }, true);

  /* -------- Abschied -------- */
  var fertig = false;
  function abschied() {
    if (fertig) return; fertig = true;
    melde('verlassen', MAX_TIEFE + '% in ' + Math.round((Date.now() - START) / 1000) + 's');
  }
  window.addEventListener('pagehide', abschied);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') abschied();
  });
})();
