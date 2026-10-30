// Rechtliche Seiten: Kopf als farbige Fläche, Nummern der Abschnitte als Abzeichen, Inhaltsverzeichnis (ab 4 Abschnitten)
(function () {
  var m = document.querySelector('main'); if (!m || m.dataset.lg) return; m.dataset.lg = '1';
  var head = document.createElement('div'); head.className = 'lg-head';
  ['.lg-eyebrow', 'h1', '.lg-date', '.lg-lead'].forEach(function (s) { var e = m.querySelector(':scope > ' + s); if (e) head.appendChild(e); });
  m.insertBefore(head, m.firstChild);
  var hs = [].slice.call(m.querySelectorAll('h2'));
  hs.forEach(function (h, i) {
    if (!h.id) h.id = 'abschnitt-' + (i + 1);
    var f = h.firstChild, mm = f && f.nodeType === 3 && f.nodeValue.match(/^\s*(\d+\s?[a-z]?)\.\s+/);
    var n = document.createElement('span'); n.setAttribute('aria-hidden', 'true');
    if (mm) { n.className = 'lg-n'; n.textContent = mm[1].replace(/\s/g, ''); f.nodeValue = f.nodeValue.slice(mm[0].length); h.dataset.nr = n.textContent; }
    else n.className = 'lg-n lg-dot';
    h.insertBefore(n, h.firstChild);
  });
  var nr = hs.filter(function (h) { return h.dataset.nr; });
  if (nr.length >= 4 && !m.querySelector('.lg-toc')) {
    var nav = document.createElement('nav'); nav.className = 'lg-nav'; nav.setAttribute('aria-label', 'Inhalt');
    nr.forEach(function (h) { var a = document.createElement('a'); a.href = '#' + h.id; var b = document.createElement('b'); b.textContent = h.dataset.nr; a.appendChild(b); a.appendChild(document.createTextNode(h.textContent.replace(/^\s*\d+\s?[a-z]?/, '').trim())); nav.appendChild(a); });
    head.after(nav);
  }
})();
