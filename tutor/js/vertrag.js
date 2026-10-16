// BWL Max — Kündigungs- und Widerrufsformular (§ 312k / § 356a BGB). Ohne Login, eigenständig.
(function () {
  var form = document.querySelector('[data-vertrag]'); if (!form) return;
  var API = 'https://hub.mrbell.de/n8n/webhook/tutor-ki-7c41e2';
  var action = form.dataset.vertrag;
  var $ = function (s) { return document.querySelector(s); };
  var ls = function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  var dev = ls('tutor.device'); if (!dev) { dev = 'g' + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12); try { localStorage.setItem('tutor.device', JSON.stringify(dev)); } catch (e) {} }
  var acc = ls('tutor.account'); if (acc && acc.email && form.email) form.email.value = acc.email;
  var sync = function () {
    var g = $('[data-grund]'), d = $('[data-datum]');
    if (g) g.classList.toggle('hide', !(form.art && form.art.value === 'ausserordentlich'));
    if (d) d.classList.toggle('hide', !(form.wann && form.wann.value === 'datum'));
  };
  form.addEventListener('change', sync); sync();
  $('[data-print]') && $('[data-print]').addEventListener('click', function () { window.print(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('[data-err]'), btn = form.querySelector('button[type=submit]');
    var name = form.name.value.trim(), email = form.email.value.trim();
    if (name.length < 2) { err.textContent = 'Bitte gib deinen Namen an.'; form.name.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = 'Bitte gib die E-Mail-Adresse deines Kontos an.'; form.email.focus(); return; }
    var opts = { name: name, email: email };
    if (action === 'kuendigung') {
      opts.art = form.art.value; opts.grund = form.grund.value.trim(); opts.wann = form.wann.value; opts.datum = form.datum.value;
      if (opts.art === 'ausserordentlich' && opts.grund.length < 3) { err.textContent = 'Bitte nenn kurz den Grund.'; form.grund.focus(); return; }
      if (opts.wann === 'datum' && !opts.datum) { err.textContent = 'Bitte wähl ein Datum.'; form.datum.focus(); return; }
    }
    err.textContent = ''; btn.disabled = true;
    var body = { action: action, device: dev, ui: 'de', opts: opts };
    var ses = ls('tutor.session'); if (ses) body.session = ses;
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        btn.disabled = false;
        if (!j || !j.ok) { err.textContent = (j && j.message) || 'Das hat gerade nicht geklappt. Versuch es gleich nochmal oder schreib an kontakt@bwlmax.de.'; return; }
        $('[data-beleg]').textContent = j.beleg || '';
        $('#formular').classList.add('hide');
        var d = $('[data-done]'); d.classList.add('on'); d.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function () { btn.disabled = false; err.textContent = 'Keine Verbindung. Prüf dein Internet oder schreib an kontakt@bwlmax.de.'; });
  });
})();
