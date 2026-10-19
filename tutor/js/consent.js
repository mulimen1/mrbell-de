// BWL Max — Cookie-Banner & Analyse (nur mit Einwilligung). Eigenständig, ohne Abhängigkeiten.
// Gezählt werden nur Ereignisse (z. B. „Quiz erstellt“), nie Inhalte. Ohne Einwilligung wird nichts gesetzt und nichts gesendet.
(function () {
  if (window.BM) return;
  var KEY = 'bm.consent', EN = /^en/.test(document.documentElement.lang || '');
  var T = function (de, en) { return EN ? en : de; };
  var get = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  var hasCookie = function () { return /(?:^|;\s*)bm_analyse=a[0-9a-f]{12}/.test(document.cookie); };
  var sec = location.protocol === 'https:' ? '; Secure' : '';
  function setCookie() { var id = 'a'; var r = new Uint8Array(6); crypto.getRandomValues(r); for (var i = 0; i < 6; i++) id += ('0' + r[i].toString(16)).slice(-2); document.cookie = 'bm_analyse=' + id + '; Max-Age=31536000; Path=/; SameSite=Lax' + sec; }
  function delCookie() { document.cookie = 'bm_analyse=; Max-Age=0; Path=/; SameSite=Lax' + sec; }
  var ok = function () { return get() === 'ja' && hasCookie(); };
  // Seite ohne Skript-IDs (Skript-Kennungen fallen raus)
  function seite() { var p = location.pathname.replace(/^\/tutor\/?/, '/'); var h = location.hash.replace(/^#\/?/, '').split('/'); if (h[0] === 'app') { if (h[1] && !/^(neu|trainer)$/.test(h[1])) h[1] = 'skript'; return (p + '#/' + h.slice(0, 3).join('/')).slice(0, 60); } return p.slice(0, 60); }
  // ---------- Google Ads: Conversion-Messung (nur mit Einwilligung) ----------
  // id = Conversion-ID (AW-…), signup/ask = Conversion-Labels. Leer = aus. Gemeldet werden nur zwei Ereignisse, nie Inhalte.
  var ADS = { id: '', signup: '', ask: '' };
  var firstUrl = location.href;   // Einstiegs-URL mit Klick-Kennung (gclid) merken, bevor die App die Adresse ändert
  function ads() {
    if (!ADS.id || !ok() || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ADS.id, { page_location: firstUrl });
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ADS.id); document.head.appendChild(s);
  }
  function conv(label) { if (!ADS.id || !label || !ok()) return; ads(); try { window.gtag('event', 'conversion', { send_to: ADS.id + '/' + label }); } catch (e) {} }
  var sent = {};
  function track(ereignis, detail, once) {
    if (!ok()) return;
    if (ereignis === 'Konto erstellt') conv(ADS.signup);
    if (ereignis === 'Max gefragt') { var fk = 'bm.ads.ask'; var done = false; try { done = !!localStorage.getItem(fk); } catch (e) {} if (!done) { try { localStorage.setItem(fk, '1'); } catch (e) {} conv(ADS.ask); } }
    var k = ereignis + '|' + (detail || ''); if (once && sent[k]) return; sent[k] = 1;
    var body = JSON.stringify({ ereignis: String(ereignis).slice(0, 40), detail: String(detail || '').slice(0, 60), seite: seite() });
    try { fetch('/bm', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: body, keepalive: true, credentials: 'same-origin' }).catch(function () {}); } catch (e) {}
  }

  // ---------- Banner ----------
  var css = '.bmc{position:fixed;z-index:120;left:20px;bottom:20px;width:min(400px,calc(100vw - 32px));background:var(--panel,#0b0b0c);color:var(--ink,#f5f5f5);border:1px solid var(--line2,#2e2e33);border-radius:22px;padding:20px 20px 18px;box-shadow:0 30px 80px -20px rgba(0,0,0,.55),0 2px 6px rgba(0,0,0,.2);font:400 14.5px/1.5 Geist,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;animation:bmcin .6s cubic-bezier(.16,1,.3,1) both}'
    + '.bmc.out{animation:bmcout .32s cubic-bezier(.4,0,1,1) forwards}'
    + '@keyframes bmcin{from{opacity:0;transform:translateY(16px) scale(.97)}}@keyframes bmcout{to{opacity:0;transform:translateY(12px) scale(.97)}}'
    + '.bmc h3{margin:0 0 6px;font-size:16px;letter-spacing:-.01em;font-weight:700}.bmc p{margin:0 0 14px;color:var(--ink2,#d4d4d8)}.bmc p a{color:inherit;text-underline-offset:3px}'
    + '.bmc .r{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bmc button{height:44px;border-radius:999px;font:650 14px Geist,-apple-system,sans-serif;cursor:pointer;border:1px solid var(--line2,#2e2e33);background:transparent;color:inherit;transition:transform .15s,filter .15s}'
    + '.bmc button:active{transform:scale(.97)}.bmc button.y{background:var(--inv,#f5f5f5);color:var(--onInv,#000);border-color:var(--inv,#f5f5f5)}.bmc button:hover{filter:brightness(1.08)}'
    + '.bmc .s{display:none}'
    // Handy: schmale Leiste unten (über der Navigationsleiste), ein, zwei Zeilen Text + zwei gleich große Knöpfe
    + '@media(max-width:600px),(pointer:coarse) and (max-height:500px){.bmc{left:12px;right:12px;bottom:calc(8px + env(safe-area-inset-bottom,0px));width:auto;max-width:560px;margin:0 auto;padding:18px 16px 16px;border-radius:22px;font-size:14px;line-height:1.45}'
    + 'html.m-boardpage .bmc{bottom:calc(84px + env(safe-area-inset-bottom,0px))!important}.bmc p{margin:0 0 14px;color:var(--ink2,#d4d4d8)}.bmc .r{gap:6px}.bmc button{height:44px;font-size:14px;white-space:nowrap;padding:0 8px}}'
    + '@media (prefers-reduced-motion:reduce){.bmc,.bmc.out{animation:none}}';
  var box = null;
  function legal() { return /(^|\.)bwlmax\.de$/.test(location.hostname) ? '/datenschutz#analyse' : '/tutor/legal/datenschutz.html#analyse'; }
  function close(v) {
    if (v === 'ja') { if (!hasCookie()) setCookie(); set('ja'); track('Analyse erlaubt'); start(); }
    else { set('nein'); delCookie(); }
    if (box) { var b = box; box = null; b.classList.add('out'); setTimeout(function () { b.remove(); }, 340); }
    document.documentElement.classList.remove('bmc-open');
  }
  function open() {
    if (box) return;
    if (!document.getElementById('bmc-css')) { var s = document.createElement('style'); s.id = 'bmc-css'; s.textContent = css; document.head.appendChild(s); }
    box = document.createElement('div'); box.className = 'bmc'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', T('Cookie-Einstellungen', 'Cookie settings'));
    box.innerHTML = '<h3>' + T('Cookies', 'Cookies') + '</h3>'
      + '<p><span class="l">' + T('BWL Max nutzt Cookies, um anonym zu messen, welche Funktionen genutzt werden – damit Max besser wird – und ob unsere Google-Anzeigen ankommen. Was du schreibst, sagst oder hochlädst, wird nie gespeichert. ', 'BWL Max uses cookies to measure anonymously which features get used – so Max gets better – and whether our Google ads work. What you type, say or upload is never stored. ')
      + '</span><span class="s">' + T('Cookies für Nutzungsstatistik und Anzeigenmessung? Deine Inhalte werden nie gespeichert. ', 'Cookies for usage stats and ad measurement? Your content is never stored. ')
      + '</span><a href="' + legal() + '">' + T('Mehr dazu', 'Learn more') + '</a></p>'
      + '<div class="r"><button type="button" data-v="nein">' + T('Ablehnen', 'Decline') + '</button><button type="button" class="y" data-v="ja">' + T('<span class="l">Cookies akzeptieren</span><span class="s">Akzeptieren</span>', '<span class="l">Accept cookies</span><span class="s">Accept</span>') + '</button></div>';
    box.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) close(b.dataset.v); });
    document.body.appendChild(box); document.documentElement.classList.add('bmc-open');
    place();
  }
  // Handy: über der unteren Navigationsleiste der App (auf der Startseite gibt es keine)
  function place() {
    if (!box) return;
    var bb = document.querySelector('.bbar'), r = bb && bb.getBoundingClientRect();
    box.style.bottom = r && r.height && r.top < innerHeight && matchMedia('(max-width:600px),(pointer:coarse) and (max-height:500px)').matches ? (innerHeight - r.top + 8) + 'px' : '';
  }
  addEventListener('resize', place); addEventListener('hashchange', function () { setTimeout(place, 60); });

  // ---------- automatische Ereignisse (nur mit Einwilligung) ----------
  var started = false;
  function start() {
    if (started || !ok()) return; started = true;
    ads();
    setTimeout(function () { track('Länger als 30 Sekunden', '', true); }, 30000);
    var onScroll = function () {
      var land = document.getElementById('landing'); if (land && land.classList.contains('hidden')) return;
      var h = document.documentElement.scrollHeight - innerHeight; if (h < 200) return;
      var p = scrollY / h;
      if (p >= .5) track('Gescrollt', '50 %', true);
      if (p >= .97) track('Gescrollt', '100 %', true);
    };
    addEventListener('scroll', onScroll, { passive: true });
    var lastTab = '';
    var onHash = function () {
      var h = location.hash.replace(/^#\/?/, '').split('/'); if (h[0] !== 'app') return;
      var tab = h[1] === 'trainer' ? 'trainer' : h[1] && h[1] !== 'neu' ? (h[2] || 'uebersicht') : '';
      if (!tab || tab === lastTab) return; lastTab = tab;
      if (tab === 'trainer') track('Trainer geöffnet'); else track('Bereich geöffnet', tab);
    };
    addEventListener('hashchange', onHash); onHash();
  }

  window.BM = { track: track, open: open, ok: ok };
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-consent-open]')) { e.preventDefault(); open(); } });
  var init = function () { var c = get(); if (c === 'ja' && !hasCookie()) setCookie(); if (c !== 'ja' && c !== 'nein') setTimeout(open, 900); else start(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
