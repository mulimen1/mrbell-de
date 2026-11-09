/* BWL Max – eigenständige Werkzeugseiten: Hell/Dunkel-Umschalter.
   Standard ist immer hell (unabhängig vom System). Die Wahl wird lokal gemerkt.
   Wird synchron im <head> geladen, damit das Theme vor dem ersten Rendern steht. */
(function () {
  var KEY = 'bm-werkzeug-theme';
  var root = document.documentElement;
  var theme = 'light';
  try { if (localStorage.getItem(KEY) === 'dark') theme = 'dark'; } catch (e) {}
  root.setAttribute('data-theme', theme);

  function sync() {
    var b = document.getElementById('bmw-theme');
    if (!b) return;
    var dark = theme === 'dark';
    var label = dark ? 'Helles Design einschalten' : 'Dunkles Design einschalten';
    b.setAttribute('aria-pressed', dark ? 'true' : 'false');
    b.setAttribute('aria-label', label);
    b.setAttribute('title', label);
  }
  function set(t, save) {
    theme = t === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    if (save) { try { localStorage.setItem(KEY, theme); } catch (e) {} }
    sync();
  }
  function init() {
    var b = document.getElementById('bmw-theme');
    if (b) b.addEventListener('click', function () { set(theme === 'dark' ? 'light' : 'dark', true); });
    sync();
    /* Abschnittsfarben: Überschriften der Reihe nach Blau, Orange, Lila, Pink */
    var hs = document.querySelectorAll('h2');
    for (var i = 0; i < hs.length; i++) hs[i].setAttribute('data-bmw-c', String(i % 4));
    zaehlen();
  }
  /* Anonymer Aufrufzähler: nur Seite + Herkunfts-Domain, keine Cookies, nichts auf dem Gerät gespeichert */
  function zaehlen() {
    try {
      if (!/(^|\.)bwlmax\.de$/.test(location.hostname)) return;
      var ref = ''; try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
      var d = JSON.stringify({ s: location.pathname, r: ref }), u = 'https://hub.mrbell.de/api/bwlmax/werkzeug';
      if (navigator.sendBeacon && navigator.sendBeacon(u, new Blob([d], { type: 'text/plain' }))) return;
      fetch(u, { method: 'POST', body: d, mode: 'no-cors', keepalive: true, credentials: 'omit' }).catch(function () {});
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('storage', function (e) { if (e.key === KEY) set(e.newValue, false); });
})();

/* ===== Gemeinsame Bausteine (window.BMW) – v3 =====
   BMW.leiste(el, {teilen, drucken})  Knopfleiste unter einem Rechner
   BMW.teilen({key, root, run, get, set})  Eingaben stecken nur im Link (#b=…), werden nie an uns übertragen
   BMW.drucken(scope)  druckt nur diesen Abschnitt (Aufgabe + Lösungsweg) auf A4
   BMW.uebung(mount, {titel, neu})  Übungsmodus: Aufgabe würfeln, selbst rechnen, prüfen, Lösungsweg
   BMW.zahl(text)  deutsche Zahl lesen ("1.234,5" → 1234.5), sonst NaN
   BMW.meldung(text)  kurze Rückmeldung unten (aria-live) */
(function () {
  var W = window.BMW = window.BMW || {};
  var d = document;
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  W.el = el;

  /* ---------- Meldung ---------- */
  var toastEl, toastT;
  W.meldung = function (txt) {
    if (!toastEl) { toastEl = el('div', 'bmw-toast'); toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); d.body.appendChild(toastEl); }
    toastEl.textContent = txt; toastEl.classList.add('on'); clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  };

  /* ---------- Zahlen ---------- */
  W.zahl = function (t) {
    if (typeof t === 'number') return t;
    var s = String(t == null ? '' : t).trim().replace(/\s| | |€|%/g, '').replace(/[−–]/g, '-');
    if (!s) return NaN;
    if (/^[+-]?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^[+-]?\d*,\d+$/.test(s) || /^[+-]?\d+,$/.test(s)) s = s.replace(',', '.');
    else if (/,/.test(s)) return NaN;
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  };
  W.fmt = function (x, nk) {
    if (!isFinite(x)) return String(x);
    nk = nk == null ? 2 : nk;
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: nk }).format(Math.abs(x) < 0.5 * Math.pow(10, -nk) ? 0 : x);
  };

  /* ---------- Link teilen ---------- */
  function b64e(o) { var j = JSON.stringify(o); return btoa(unescape(encodeURIComponent(j))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return JSON.parse(decodeURIComponent(escape(atob(s)))); }
  function felder(root) { return Array.prototype.slice.call(root.querySelectorAll('input[id],select[id],textarea[id]')).filter(function (x) { return x.type !== 'button' && x.type !== 'submit' && !x.closest('.bmw-ueb') && !x.hasAttribute('data-bmw-nicht'); }); }
  var reg = {};
  W.teilen = function (o) {
    var key = o.key || 'x';
    var get = o.get || function () { var r = {}; felder(o.root).forEach(function (x) { r[x.id] = (x.type === 'checkbox' || x.type === 'radio') ? !!x.checked : x.value; }); return r; };
    var set = o.set || function (v) { felder(o.root).forEach(function (x) { if (!(x.id in v)) return; if (x.type === 'checkbox' || x.type === 'radio') x.checked = !!v[x.id]; else if (x.tagName === 'SELECT' && !Array.prototype.some.call(x.options, function (o) { return o.value === String(v[x.id]); })) return; else x.value = v[x.id]; x.dispatchEvent(new Event('input', { bubbles: true })); x.dispatchEvent(new Event('change', { bubbles: true })); }); };
    reg[key] = { get: get, set: set, run: o.run, root: o.root };
    return function () {
      var u = location.href.split('#')[0] + '#b=' + key + '.' + b64e(get());
      var ok = function () { W.meldung('Link kopiert – die Eingaben stecken nur im Link, bei uns wird nichts gespeichert.'); };
      try { history.replaceState(null, '', u); } catch (e) {}
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(u).then(ok, function () { W.meldung('Link steht jetzt in der Adresszeile – von dort kopieren.'); });
      else W.meldung('Link steht jetzt in der Adresszeile – von dort kopieren.');
    };
  };
  function ausLink() {
    var m = /^#b=([a-z0-9_-]+)\.([A-Za-z0-9_-]+)$/i.exec(location.hash || '');
    if (!m || !reg[m[1]]) return;
    var r = reg[m[1]];
    try { r.set(b64d(m[2])); if (r.run) r.run(); if (r.root && r.root.scrollIntoView) setTimeout(function () { r.root.scrollIntoView({ block: 'start' }); }, 60); }
    catch (e) { W.meldung('Der Link ist unvollständig – es werden die Beispielwerte gezeigt.'); }
  }
  /* Seiten registrieren ihre Rechner synchron am Ende von <body>; danach einmal den Link auswerten */
  if (d.readyState === 'complete') setTimeout(ausLink, 0); else window.addEventListener('load', function () { setTimeout(ausLink, 0); });

  /* ---------- Drucken ---------- */
  W.drucken = function (scope) {
    if (!scope) { window.print(); return; }
    var hid = [], n = scope;
    while (n && n.parentElement && n !== d.body) {
      Array.prototype.forEach.call(n.parentElement.children, function (c) { if (c !== n && !c.classList.contains('bmw-top') && c.tagName !== 'SCRIPT' && c.tagName !== 'STYLE') { c.classList.add('bmw-ph'); hid.push(c); } });
      n = n.parentElement;
    }
    d.documentElement.classList.add('bmw-printing');
    var done = function () { hid.forEach(function (c) { c.classList.remove('bmw-ph'); }); d.documentElement.classList.remove('bmw-printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1500);
  };

  /* ---------- Knopfleiste ---------- */
  var IC = {
    link: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
    druck: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>',
    wuerfel: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>'
  };
  W.IC = IC;
  function knopf(ic, txt, fn) { var b = el('button', 'bmw-k'); b.type = 'button'; b.innerHTML = IC[ic] + '<span></span>'; b.lastChild.textContent = txt; b.addEventListener('click', fn); return b; }
  W.knopf = knopf;
  W.leiste = function (ziel, o) {
    var bar = el('div', 'bmw-leiste noprint');
    if (o.teilen) bar.appendChild(knopf('link', o.teilenText || 'Beispiel als Link teilen', o.teilen));
    if (o.drucken !== false) bar.appendChild(knopf('druck', o.druckText || 'Drucken / als PDF', function () { W.drucken(o.druckScope || null); }));
    if (o.vor) ziel.parentNode.insertBefore(bar, ziel); else ziel.appendChild(bar);
    return bar;
  };

  /* ---------- Übungsmodus ----------
     neu() liefert { text: HTML der Aufgabe, felder: [{key, label, einheit, wert, tol (absolut), rel (relativ), nk}], loesung: HTML, nachher?(box) }
     Optional: felder[i].wahl = ['A','B'] → Auswahl statt Zahl (wert = richtige Option). */
  W.uebung = function (mount, o) {
    var box = el('div', 'bmw-ueb'), top = el('div', 'bmw-ueb-kopf'), h = el('h3', null, o.titel || 'Übungsmodus: selbst rechnen');
    var stand = el('span', 'bmw-ueb-stand'); stand.setAttribute('aria-live', 'polite');
    top.appendChild(h); top.appendChild(stand); box.appendChild(top);
    var hinweis = el('p', 'bmw-ueb-hin', o.hinweis || 'Neue Aufgabe würfeln, selbst rechnen, Ergebnis eintragen – das Werkzeug prüft und zeigt bei Bedarf den kompletten Lösungsweg.');
    box.appendChild(hinweis);
    var auf = el('div', 'bmw-ueb-auf'), form = el('form', 'bmw-ueb-form'), fb = el('div', 'bmw-ueb-fb'), los = el('div', 'bmw-ueb-los');
    fb.setAttribute('aria-live', 'polite'); los.hidden = true;
    var btns = el('div', 'bmw-ueb-btns');
    var uid = 'u' + Math.random().toString(36).slice(2, 7); form.id = uid + '-f';
    var bPruef = el('button', 'primary', 'Prüfen'); bPruef.type = 'submit'; bPruef.setAttribute('form', form.id);
    var bLos = el('button', null, 'Lösungsweg zeigen'); bLos.type = 'button';
    var bNeu = knopf('wuerfel', 'Neue Aufgabe', function () { start(); });
    btns.appendChild(bPruef); btns.appendChild(bLos); btns.appendChild(bNeu);
    box.appendChild(auf); box.appendChild(form); box.appendChild(btns); box.appendChild(fb); box.appendChild(los);
    mount.appendChild(box);
    var cur = null, n = 0, ok = 0, gezaehlt = false;
    function zeigeStand() { stand.textContent = n ? ok + ' von ' + n + ' richtig' : ''; }
    function start() {
      cur = o.neu(); gezaehlt = false; fb.textContent = ''; fb.className = 'bmw-ueb-fb'; los.hidden = true; los.innerHTML = ''; bLos.textContent = 'Lösungsweg zeigen';
      auf.innerHTML = cur.text; form.innerHTML = '';
      cur.felder.forEach(function (f, i) {
        var lab = el('label', 'bmw-ueb-f'), sp = el('span', null, f.label), id = uid + '-' + i, inp;
        if (f.wahl) { inp = el('select'); var o0 = el('option', null, 'bitte wählen'); o0.value = ''; inp.appendChild(o0); f.wahl.forEach(function (w) { var op = el('option', null, w); op.value = w; inp.appendChild(op); }); }
        else { inp = el('input'); inp.type = 'text'; inp.inputMode = 'decimal'; inp.autocomplete = 'off'; inp.spellcheck = false; }
        inp.id = id; inp.setAttribute('data-bmw-nicht', '1'); lab.htmlFor = id;
        lab.appendChild(sp);
        var wr = el('span', 'bmw-ueb-in'); wr.appendChild(inp); if (f.einheit) wr.appendChild(el('em', null, f.einheit));
        lab.appendChild(wr); var st = el('i', 'bmw-ueb-st'); st.setAttribute('aria-hidden', 'true'); lab.appendChild(st);
        form.appendChild(lab); f._in = inp; f._st = st; f._lab = lab;
      });
      if (o.nachher) o.nachher(auf);
      if (cur.nachher) cur.nachher(auf);
      zeigeStand();
    }
    function richtig(f) {
      if (f.wahl) return f._in.value === f.wert;
      var x = W.zahl(f._in.value); if (!isFinite(x)) return null;
      var tol = f.tol != null ? f.tol : 0, rel = f.rel != null ? f.rel : 0;
      var nk = f.nk != null ? f.nk : 2; if (f.tol == null && f.rel == null) tol = 0.5 * Math.pow(10, -nk) + 1e-9;
      return Math.abs(x - f.wert) <= Math.max(tol, rel * Math.abs(f.wert));
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (!cur) return;
      var alle = true, leer = false;
      cur.felder.forEach(function (f) { var r = richtig(f); f._lab.classList.remove('ok', 'bad'); f._in.removeAttribute('aria-invalid'); if (r === null || (f.wahl && !f._in.value)) { leer = true; alle = false; return; } f._lab.classList.add(r ? 'ok' : 'bad'); f._st.textContent = r ? '✓' : '✗'; if (!r) { alle = false; f._in.setAttribute('aria-invalid', 'true'); } });
      if (leer && !alle) { fb.className = 'bmw-ueb-fb warn'; fb.textContent = 'Bitte alle Felder als Zahl ausfüllen (Komma oder Punkt als Dezimalzeichen).'; return; }
      if (!gezaehlt) { n++; if (alle) ok++; gezaehlt = true; }
      fb.className = 'bmw-ueb-fb ' + (alle ? 'ok' : 'bad');
      fb.textContent = alle ? 'Richtig! Alles stimmt.' : 'Noch nicht ganz – die markierten Felder stimmen nicht. Nochmal rechnen oder den Lösungsweg ansehen.';
      zeigeStand();
    });
    bLos.addEventListener('click', function () {
      if (!cur) return;
      if (!los.hidden) { los.hidden = true; bLos.textContent = 'Lösungsweg zeigen'; return; }
      los.innerHTML = cur.loesung; los.hidden = false; bLos.textContent = 'Lösungsweg ausblenden';
      if (!gezaehlt) { n++; gezaehlt = true; zeigeStand(); }
      if (o.nachher) o.nachher(los);
      if (cur.nachherLoesung) cur.nachherLoesung(los);
    });
    start();
    return { neu: start };
  };
  W.zufall = function (a, b, schritt) { schritt = schritt || 1; var k = Math.floor(Math.random() * (Math.floor((b - a) / schritt) + 1)); return +(a + k * schritt).toFixed(10); };
  W.wahl = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
})();
