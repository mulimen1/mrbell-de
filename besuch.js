/* Mr. Bell - Besuchsmeldung. Keine Cookies, keine IP-Speicherung.
   Eigenen Besuch stummschalten: mrbell.de/?mrbell=intern
   Wieder mitzaehlen:            mrbell.de/?mrbell=extern */
(function () {
  try {
    var p = location.search || '';
    try {
      if (/[?&]mrbell=intern/.test(p)) localStorage.setItem('mb-intern', '1');
      if (/[?&]mrbell=extern/.test(p)) localStorage.removeItem('mb-intern');
    } catch (e) {}

    var intern = false;
    try { intern = localStorage.getItem('mb-intern') === '1'; } catch (e) {}

    var daten = {
      seite: location.pathname || '/',
      ref: document.referrer || '',
      par: p,
      ua: navigator.userAgent || '',
      spr: navigator.language || '',
      bs: (screen.width || 0) + 'x' + (screen.height || 0),
      intern: intern
    };

    var ziel = 'https://mrbell.app.n8n.cloud/webhook/besuch-7c1d5a2e-3b94-4f60-a8e1-2d6c9b0f4a73';
    var txt = JSON.stringify(daten);

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ziel, new Blob([txt], { type: 'text/plain;charset=UTF-8' }));
    } else {
      fetch(ziel, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: txt });
    }
  } catch (e) {}
})();
