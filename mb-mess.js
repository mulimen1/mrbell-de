/* Mr. Bell — Analyse im Browser (Version 3).
   Einbinden mit:  <script defer src="/mb-mess.js"></script>  (nach mb-consent.js)

   Läuft NUR nach "Analyse erlauben" (Cookie mb_analyse = Zufallskennung).
   Ohne Einwilligung tut dieses Skript nichts, außer eine im Demo-Chat abgeschickte
   Frage samt Antwort zu melden (window.mbChat), die der Besucher selbst sendet.
   Seitenaufrufe und Klicks auf WhatsApp / Termin / E-Mail zählt der Server (middleware.js).
   Ziel aller Meldungen: /p auf der eigenen Domain. Kennung und Ort ergänzt der Server.
*/
(function () {
  'use strict';
  var ZIEL = '/p';
  var SEITE = location.pathname || '/';

  function senden(d, abschied) {
    var txt = JSON.stringify(d);
    try {
      if (abschied && navigator.sendBeacon && navigator.sendBeacon(ZIEL, new Blob([txt], { type: 'text/plain;charset=UTF-8' }))) return;
      fetch(ZIEL, { method: 'POST', keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: txt }).catch(function () {});
    } catch (e) {}
  }

  // Demo-Chat: immer (der Besucher schickt die Frage selbst ab; Hinweis steht unter dem Feld)
  window.mbChat = function (frage, antwort) {
    senden({ ereignis: 'Demo-Chat-Frage', detail: '1. Frage', seite: SEITE, frage: String(frage || '').slice(0, 600), antwort: String(antwort || '').slice(0, 2000) });
  };

  var gestartet = false;
  function erlaubt() { try { return !!(window.mbAnalyseErlaubt && window.mbAnalyseErlaubt()); } catch (e) { return false; } }

  function start(geradeErlaubt) {
    if (gestartet || !erlaubt()) return;
    gestartet = true;
    var SCHON = {};
    function ping(ereignis, detail, mehrfach, abschied) {
      var key = ereignis + '|' + (detail || '');
      if (!mehrfach && SCHON[key]) return;
      SCHON[key] = 1;
      if (!erlaubt()) return;                       // Widerruf greift sofort
      senden({ ereignis: ereignis, detail: detail || '', seite: SEITE }, abschied);
    }
    if (geradeErlaubt) ping('Analyse erlaubt');

    /* Scrolltiefe 25 / 50 / 75 / 100 */
    function tiefe() {
      var h = document.documentElement, ganz = h.scrollHeight - window.innerHeight;
      if (ganz <= 0) return 100;
      return Math.round((window.pageYOffset || h.scrollTop) / ganz * 100);
    }
    var wartet = false;
    function scroll() {
      if (wartet) return; wartet = true;
      setTimeout(function () {
        wartet = false;
        var t = tiefe();
        [25, 50, 75, 100].forEach(function (s) { if (t >= (s === 100 ? 98 : s)) ping('Gescrollt', s + ' %'); });
      }, 250);
    }
    window.addEventListener('scroll', scroll, { passive: true });

    /* Ganz unten: Fußzeile sichtbar */
    try {
      var fuss = document.querySelector('footer');
      if (fuss && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting && (window.pageYOffset || document.documentElement.scrollTop) > 200) { ping('Ganz unten angekommen'); io.disconnect(); } });
        }, { threshold: 0.3 });
        io.observe(fuss);
      }
    } catch (e) {}

    /* Länger als 30 Sekunden (sichtbar) und Verweildauer */
    var SICHTBAR = 0, SEIT = document.visibilityState === 'visible' ? Date.now() : 0, gemeldet = 0;
    function sek() { return Math.round((SICHTBAR + (SEIT ? Date.now() - SEIT : 0)) / 1000); }
    var dreissig = setInterval(function () { if (sek() >= 30) { ping('Länger als 30 Sekunden'); clearInterval(dreissig); } }, 2000);
    function verweil() {
      var s = sek();
      if (s >= 5 && s - gemeldet >= 10 && gemeldet < 7200) { gemeldet = s; ping('Verweildauer', s + ' s', true, true); }
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') { if (SEIT) { SICHTBAR += Date.now() - SEIT; SEIT = 0; } verweil(); }
      else if (!SEIT) SEIT = Date.now();
    });
    window.addEventListener('pagehide', function () { if (SEIT) { SICHTBAR += Date.now() - SEIT; SEIT = 0; } verweil(); });

    /* Video */
    try {
      var film = document.getElementById('film');
      if (film) {
        film.addEventListener('play', function () { ping('Video gestartet'); });
        film.addEventListener('timeupdate', function () {
          if (!film.duration || !isFinite(film.duration)) return;
          var p = film.currentTime / film.duration * 100;
          [25, 50, 75].forEach(function (s) { if (p >= s) ping('Video angesehen', s + ' %'); });
          if (p >= 97) ping('Video angesehen', '100 %');
        });
        film.addEventListener('ended', function () { ping('Video angesehen', '100 %'); });
      }
    } catch (e) {}

    /* FAQ */
    document.addEventListener('click', function (ev) {
      var q = ev.target && ev.target.closest ? ev.target.closest('.faq .fq') : null;
      if (!q) return;
      setTimeout(function () { if (q.getAttribute('aria-expanded') === 'true') ping('FAQ aufgeklappt', (q.textContent || '').trim().slice(0, 60)); }, 0);
    }, true);

    /* Demo-Chat geöffnet */
    document.addEventListener('focusin', function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest('#chatDemo textarea')) ping('Demo-Chat geöffnet');
    });
  }
  window.mbMessStart = start;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { start(false); });
  else start(false);
})();
