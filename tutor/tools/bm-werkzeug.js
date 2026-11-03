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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('storage', function (e) { if (e.key === KEY) set(e.newValue, false); });
})();
