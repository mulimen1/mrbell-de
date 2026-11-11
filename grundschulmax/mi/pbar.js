/* Partner-Leiste von Mission Internet: schwebt unten, sobald man als Partnerin eingeloggt ist (localStorage mi.partner).
   Wechsel zwischen Partnerbereich, Kurs und Startseite. Gleiche Datei für missioninternet.de und getmissioninternet.com (Sprache aus <html lang>). */
(function () {
  var d = document;
  try { localStorage.removeItem('mi.pz'); sessionStorage.removeItem('mi.pz'); } catch (e) {}
  if (!d.getElementById('mipb-css')) {
    var s = d.createElement('style'); s.id = 'mipb-css';
    s.textContent = '.mipb{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:95;display:flex;align-items:center;gap:4px;padding:5px;border-radius:999px;background:rgba(10,10,11,.92);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 18px 40px -14px rgba(10,10,11,.6),inset 0 1px 0 rgba(255,255,255,.14);font:600 14px/1 Geist,G,system-ui,-apple-system,sans-serif;max-width:calc(100vw - 24px)}' +
      '.mipb b{display:inline-flex;align-items:center;gap:7px;padding:0 10px 0 12px;color:#fff;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.75;white-space:nowrap}.mipb b i{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.25)}' +
      '.mipb a{display:inline-flex;align-items:center;height:38px;padding:0 15px;border-radius:999px;color:#e4e4e7;text-decoration:none;white-space:nowrap;transition:background .2s,color .2s}.mipb a:hover{background:rgba(255,255,255,.12);color:#fff}.mipb a.on{background:#fff;color:#0a0a0b}' +
      '@media (max-width:420px){.mipb b{display:none}.mipb a{padding:0 13px;font-size:13.5px}}@media print{.mipb{display:none}}body.mipbon{padding-bottom:76px}';
    (d.head || d.documentElement).appendChild(s);
  }
  function render() {
    var old = d.querySelector('.mipb'); if (old) old.parentNode.removeChild(old); d.body.classList.remove('mipbon');
    var P = null; try { P = JSON.parse(localStorage.getItem('mi.partner') || 'null'); } catch (e) {}
    if (!P || !P.tc) return;
    var en = (d.documentElement.lang || '').slice(0, 2) === 'en', A = en ? '/partner-area' : '/partnerbereich';
    var p = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
    var L = en ? ['Partner', 'Overview', 'Course', 'Website'] : ['Partner', 'Übersicht', 'Kurs', 'Startseite'];
    var cur = p === A ? 1 : p === '/app' ? 2 : p === '/' ? 3 : 0;
    var u = [A, '/app#code=' + encodeURIComponent(P.tc), '/'];
    var n = d.createElement('nav'); n.className = 'mipb'; n.setAttribute('aria-label', 'Partner');
    n.innerHTML = '<b><i></i>' + L[0] + '</b>' + [1, 2, 3].map(function (k) { return '<a href="' + u[k - 1] + '"' + (cur === k ? ' class="on" aria-current="page"' : '') + '>' + L[k] + '</a>'; }).join('');
    d.body.appendChild(n); d.body.classList.add('mipbon');
  }
  window.MIPB = render;
  if (d.body) render(); else d.addEventListener('DOMContentLoaded', render);
})();
