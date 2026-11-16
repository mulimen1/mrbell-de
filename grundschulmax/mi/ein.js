/* Einstieg (Startseite oben und /tiktok): Eltern spielen eine echte Spiel-Chat-Szene selbst durch, sehen den Kursplan
   und schalten Tag 1 gratis frei (nur E-Mail, keine Zahlungsdaten). Danach: Link fürs Laptop/iPad (Mail + Teilen-Knopf)
   oder direkt hier starten. Kauf erst nach Tag 1 in der App. */
(function () {
  var root = document.getElementById('ein'); if (!root) return;
  var EN = document.documentElement.lang === 'en';
  var K_URL = 'https://hub.mrbell.de/n8n/webhook/gsm-konto-6w3c', PU = 'https://hub.mrbell.de/n8n/webhook/mi-partner-c53197';
  var $ = function (s, r) { return (r || root).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || root).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ev = function (e, x) { try { if (window.UBev) window.UBev(e, x); } catch (er) {} };
  var px = function (tt, fb, p) { try { if (window.GSC) { if (tt && GSC.tt) GSC.tt(tt, p || {}); if (fb && GSC.fb) GSC.fb('track', fb, p && p.value ? { value: p.value, currency: p.currency } : {}); } } catch (er) {} };
  var mob = function () { return matchMedia('(max-width: 899px)').matches; };
  var touch = /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);
  var ARR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.5"/><path d="M10.3 3.9L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>';
  var MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>';

  var T = EN ? {
    eye: 'Real scene · game chat', of: ' of 3', you: 'You are 11 now and playing in Blockworld.', nx: 'Next message', res: 'See the result',
    sc: [
      { m: 'hey you play really good 😊 im 12 too', q: 'Luca_12 writes to you. What do you answer?', o: [['“thanks 😊 you too!”', 0], ['Don\'t answer at all', 0]],
        f: ['Totally normal. Almost every kid answers kindly here. That is exactly what predators count on: first praise, then trust.', 'Careful, good. Many kids answer anyway, because it feels like a nice teammate.'], h: 'Still harmless?' },
      { m: 'ill give you 800 diamonds 🎁 just send me your number and we chat on whatsapp', q: 'What do you do?', o: [['Send the number, it\'s a gift', 0], ['Stay in the game, no number', 1], ['Ask Mom or Dad', 1]],
        f: ['Warning sign missed. A gift plus moving to a private chat is one of the most common grooming tricks.', 'Spotted it: a gift plus “let\'s chat privately” is a classic warning sign.', 'Spotted it: a gift plus “let\'s chat privately” is a classic warning sign.'], h: 'Warning sign' },
      { m: 'but dont tell your parents 🤫 theyll take your phone away', q: 'And now?', o: [['Keep it secret, or there\'s trouble', 0], ['Show Mom or Dad right away', 1]],
        f: ['This is exactly how kids stay silent. Fear of losing the phone beats the bad feeling.', 'Right. But honestly: would your kid dare to, if they were afraid of losing their phone?'], h: 'The strongest warning sign' }],
    rh: function (n) { return n === 2 ? 'You spotted both warning signs.' : n === 1 ? 'You spotted 1 of 2 warning signs.' : 'You missed both warning signs.'; },
    rt: 'From the outside, as an adult, it is easier. Your kid is in the middle of the game, wants to be nice, and the gift is tempting. That is why one talk is often not enough: the reflex has to be practiced.',
    br: 'Exactly this is what your kid practices in the Internet & AI License: scene by scene, until the reflex sticks.',
    plan: 'How your kid practices it · 5 days · about 30 min each', days: [['Day 1', 'Strangers in game chats and emergency pass', 1], ['Day 2', 'Scams and fake giveaways', 0], ['Day 3', 'AI voices and fake pictures', 0], ['Day 4', 'Class chats and bullying', 0], ['Day 5', 'Final test and certificate', 0]],
    free: 'Free', price: 'After Day 1: all 5 days for $59, one-time, no subscription.',
    fh: 'Day 1 is free.', fs: 'With your kid on a laptop or iPad, about 30 minutes. No payment details.', fl: 'Your email address', fph: 'name@example.com',
    opt: 'Yes, send me up to 3 emails with tips and reminders about the course over the next days. Unsubscribe anytime.',
    fb: 'Start Day 1 for free', fb2: 'with your kid on a laptop or iPad', fsm: 'We send you a link so you can continue on any device. Our <a href="/privacy" target="_blank" rel="noopener">privacy policy</a> applies.',
    ferr: 'Please enter a valid email address.', fnet: 'That did not work. Please try again.',
    sh: 'Day 1 is unlocked!', ss: function (m) { return 'We sent the link to <b>' + esc(m) + '</b>. Best: do Day 1 together on a laptop or iPad.'; },
    shm: 'Send to Mac or iPad', shc: 'Copy link', shd: 'Link copied. Open it on the laptop or iPad.', here: 'Start here on the phone', go: 'Start Day 1 now',
    doi: 'Please confirm the tips emails with one click in the same email. Without it, we will not send any.',
    wh: 'Welcome back!', ws: function (m) { return 'We sent a sign-in link to <b>' + esc(m) + '</b>. Open the email on the device your kid learns on.'; }, wb: 'Sign in here with a code',
    ph: 'You already have the license', ps: function (m) { return 'We sent a sign-in link to <b>' + esc(m) + '</b>. One tap and you are back in the course.'; }, pb: 'Go to the course',
    back: 'Already started? Continue', spam: 'No email? Please also check your spam folder.', shTitle: 'Mission Internet: Day 1', shText: 'Start Day 1 of the Internet & AI License on this device:'
  } : {
    eye: 'Echte Szene · Spiel-Chat', of: ' von 3', you: 'Sie sind jetzt 11 und spielen Blockwelt.', nx: 'Nächste Nachricht', res: 'Zum Ergebnis',
    sc: [
      { m: 'hey du spielst voll gut 😊 ich bin auch 12', q: 'Luca_12 schreibt Ihnen. Was antworten Sie?', o: [['„danke 😊 du auch!“', 0], ['Gar nicht antworten', 0]],
        f: ['Ganz normal. Fast jedes Kind antwortet hier freundlich. Genau darauf setzen Täter: erst Lob, dann Vertrauen.', 'Vorsichtig, gut. Viele Kinder antworten trotzdem, weil es sich wie ein netter Mitspieler anfühlt.'], h: 'Noch harmlos?' },
      { m: 'ich schenk dir 800 diamanten 🎁 gib mir einfach deine nummer, dann schreiben wir auf whatsapp', q: 'Was machen Sie?', o: [['Nummer schicken, ist ja ein Geschenk', 0], ['Im Spiel bleiben, keine Nummer', 1], ['Mama oder Papa fragen', 1]],
        f: ['Warnsignal übersehen. Ein Geschenk plus der Wechsel in einen privaten Chat ist eine der häufigsten Maschen beim Cybergrooming.', 'Richtig erkannt: Ein Geschenk plus „lass uns privat schreiben“ ist ein typisches Warnsignal.', 'Richtig erkannt: Ein Geschenk plus „lass uns privat schreiben“ ist ein typisches Warnsignal.'], h: 'Warnsignal' },
      { m: 'aber sag deinen eltern nix 🤫 die nehmen dir sonst das handy weg', q: 'Und jetzt?', o: [['Geheim halten, sonst gibt es Ärger', 0], ['Sofort Mama oder Papa zeigen', 1]],
        f: ['Genau so schweigen Kinder. Die Angst vor dem Handyverbot ist stärker als das ungute Gefühl.', 'Richtig. Aber ehrlich: Würde Ihr Kind sich das trauen, wenn es Angst vor einem Handyverbot hat?'], h: 'Das stärkste Warnsignal' }],
    rh: function (n) { return n === 2 ? 'Sie haben beide Warnsignale erkannt.' : n === 1 ? 'Sie haben 1 von 2 Warnsignalen erkannt.' : 'Beide Warnsignale sind durchgerutscht.'; },
    rt: 'Mit Abstand und als Erwachsener ist das leichter. Ihr Kind sitzt mitten im Spiel, will nett sein, und das Geschenk lockt. Deshalb reicht ein Gespräch oft nicht: Der Reflex muss geübt werden.',
    br: 'Genau das übt Ihr Kind im Internet- und KI-Führerschein: Szene für Szene, bis der Reflex sitzt.',
    plan: 'So übt es Ihr Kind · 5 Tage · je etwa 30 Min.', days: [['Tag 1', 'Fremde im Spiel-Chat und Notfall-Pass', 1], ['Tag 2', 'Abzocke und Fake-Gewinnspiele', 0], ['Tag 3', 'KI-Stimmen und Fake-Bilder', 0], ['Tag 4', 'Klassenchat und Mobbing', 0], ['Tag 5', 'Prüfung und Urkunde', 0]],
    free: 'Gratis', price: 'Nach Tag 1: alle 5 Tage für 69 € einmalig, kein Abo.',
    fh: 'Tag 1 ist kostenlos.', fs: 'Mit Ihrem Kind am Laptop oder iPad, etwa 30 Minuten. Ohne Zahlungsdaten.', fl: 'Ihre E-Mail-Adresse', fph: 'name@beispiel.de',
    opt: 'Ja, schicken Sie mir in den nächsten Tagen bis zu 3 E-Mails mit Tipps und Erinnerungen zum Kurs. Jederzeit abbestellbar.',
    fb: 'Tag 1 gratis starten', fb2: 'mit Ihrem Kind am Laptop oder iPad', fsm: 'Wir schicken Ihnen einen Link, mit dem Sie auf jedem Gerät weitermachen. Es gilt unsere <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a>.',
    ferr: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', fnet: 'Das hat nicht geklappt. Bitte gleich nochmal versuchen.',
    sh: 'Tag 1 ist freigeschaltet!', ss: function (m) { return 'Den Link haben wir an <b>' + esc(m) + '</b> geschickt. Am besten machen Sie Tag 1 gemeinsam am Laptop oder iPad.'; },
    shm: 'An Mac oder iPad senden', shc: 'Link kopieren', shd: 'Link kopiert. Öffnen Sie ihn am Laptop oder iPad.', here: 'Hier am Handy starten', go: 'Tag 1 jetzt starten',
    doi: 'Bitte bestätigen Sie die Tipps-E-Mails noch mit einem Klick in derselben E-Mail. Ohne Bestätigung schicken wir keine.',
    wh: 'Willkommen zurück!', ws: function (m) { return 'Wir haben Ihnen einen Anmelde-Link an <b>' + esc(m) + '</b> geschickt. Öffnen Sie die E-Mail auf dem Gerät, auf dem Ihr Kind lernt.'; }, wb: 'Hier mit Code anmelden',
    ph: 'Sie haben den Führerschein schon', ps: function (m) { return 'Wir haben Ihnen einen Anmelde-Link an <b>' + esc(m) + '</b> geschickt. Ein Tipp, und Sie sind wieder im Kurs.'; }, pb: 'Zum Führerschein',
    back: 'Schon angefangen? Weitermachen', spam: 'Keine E-Mail da? Bitte auch im Spam-Ordner nachschauen.', shTitle: 'Mission Internet: Tag 1', shText: 'Tag 1 des Internet- und KI-Führerscheins auf diesem Gerät starten:'
  };

  /* Creator-Code (?p=CODE oder TikTok-Aktion) für den Preis nach Tag 1 */
  var REF = ''; try { REF = (location.search.match(/[?&]p=([A-Za-z0-9]{3,12})(&|$)/) || [])[1] || sessionStorage.getItem('mi.ref') || ''; REF = REF.toUpperCase(); if (!REF && window.EIN_REF) REF = window.EIN_REF; if (REF) sessionStorage.setItem('mi.ref', REF); } catch (e) {}
  var AD = ''; try { AD = sessionStorage.getItem('gsm.ad') || ''; } catch (e) {}
  var PRICE = window.EIN_PRICE || T.price;
  if (REF && !window.EIN_PRICE && !EN) fetch(PU, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'code', code: REF }) }).then(function (r) { return r.json(); }).then(function (r) {
    if (!r || !r.ok || !r.preis) return; PRICE = 'Nach Tag 1: alle 5 Tage für ' + r.preis + ' € statt 69 € mit Code ' + esc(r.code || REF) + ', einmalig, kein Abo.'; var e = $('.ein-pr'); if (e) e.textContent = PRICE; }).catch(function () {});

  var st = { i: 0, a: [], score: 0 };
  root.innerHTML = '<div class="ein-g"><div class="ein-scr" aria-hidden="true"><div class="ein-bg"></div><div class="ein-hud"><span>Blockwelt</span><em>Server 3</em></div><div class="ein-chat"><div class="ein-tabs"><b>' + (EN ? 'All' : 'Alle') + '</b><span>' + (EN ? 'Friends' : 'Freunde') + '</span></div><div class="ein-msgs"></div></div></div>' +
    '<div class="ein-card" aria-live="polite"></div></div>' + (window.EIN_NOBACK ? '' : '<a class="ein-back" href="/app#fuehrerschein">' + T.back + ARR + '</a>');
  var card = $('.ein-card'), msgs = $('.ein-msgs'), scr = $('.ein-scr');
  var seen = 0;
  function bubble(text, typing) {
    var p = document.createElement('p'); p.className = 'ein-m';
    p.innerHTML = '<b>Luca_12:</b> <span>' + (typing ? '<i class="ein-typ"><u></u><u></u><u></u></i>' : esc(text)) + '</span>';
    msgs.appendChild(p); while (msgs.children.length > 3) msgs.removeChild(msgs.firstChild); return p;
  }
  function q() {
    var S = T.sc[st.i];
    card.innerHTML = '<div class="ein-k"><span>' + T.eye + '</span><i>' + (st.i + 1) + T.of + '</i></div>' + (st.i === 0 ? '<p class="ein-you">' + T.you + '</p>' : '') +
      '<div class="ein-quote"><b>Luca_12</b><span>' + esc(S.m) + '</span></div><h3 class="ein-q">' + S.q + '</h3><div class="ein-o">' +
      S.o.map(function (o, k) { return '<button type="button" data-k="' + k + '"><i>' + 'ABC'.charAt(k) + '</i><span>' + esc(o[0]) + '</span></button>'; }).join('') + '</div><div class="ein-f" hidden></div>';
    var p = bubble('', true); setTimeout(function () { p.querySelector('span').textContent = S.m; }, seen ? 650 : 900); seen++;
    $$('.ein-o button').forEach(function (b) { b.onclick = function () { answer(+b.dataset.k); }; });
  }
  function answer(k) {
    var S = T.sc[st.i], good = S.o[k][1], sc = st.i > 0; if (st.a.length > st.i) return; st.a.push(k); if (sc && good) st.score++;
    $$('.ein-o button').forEach(function (b, j) { b.disabled = true; if (j === k) b.classList.add(sc ? (good ? 'ok' : 'no') : 'pick'); else if (sc && S.o[j][1] && !good) b.classList.add('hint'); });
    var f = $('.ein-f'); f.hidden = false; f.className = 'ein-f ' + (sc ? (good ? 'ok' : 'no') : 'n');
    f.innerHTML = '<div><small>' + (sc ? (good ? OK : WARN) : '') + esc(S.h) + '</small><p>' + esc(S.f[k]) + '</p></div><button type="button" class="ein-nx">' + (st.i < 2 ? T.nx : T.res) + ARR + '</button>';
    ev('Einstieg Szene', (st.i + 1) + ' · ' + 'ABC'.charAt(k) + (sc ? (good ? ' · erkannt' : ' · übersehen') : ''));
    if (st.i === 0) px('ViewContent', 'ViewContent', { contents: [{ content_id: 'szene', content_name: 'Szene beantwortet' }], content_type: 'product' });
    $('.ein-nx').onclick = function () { if (st.i < 2) { st.i++; q(); if (mob()) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } else res(); };
    if (mob()) setTimeout(function () { var r = f.getBoundingClientRect(); if (r.bottom > innerHeight - 8) scrollBy({ top: r.bottom - innerHeight + 24, behavior: 'smooth' }); }, 60);
  }
  function res() {
    ev('Einstieg Ergebnis', st.score + ' von 2'); root.classList.add('ein-done');
    card.innerHTML = '<div class="ein-res"><div class="ein-k"><span>' + (EN ? 'Your result' : 'Ihr Ergebnis') + '</span></div><h3 class="ein-rh">' + T.rh(st.score) + '</h3><p class="ein-rt">' + T.rt + '</p></div>' +
      '<div class="ein-plan"><small>' + T.plan + '</small><ol>' + T.days.map(function (d) { return '<li class="' + (d[2] ? 'on' : 'lk') + '"><b>' + d[0] + '</b><span>' + esc(d[1]) + '</span><em>' + (d[2] ? T.free : LOCK) + '</em></li>'; }).join('') + '</ol><p class="ein-pr">' + esc(PRICE) + '</p></div>' +
      '<form class="ein-form" novalidate><h3>' + T.fh + '</h3><p>' + T.fs + '</p><label class="ein-fl"><span>' + T.fl + '</span><input type="email" name="email" autocomplete="email" inputmode="email" placeholder="' + T.fph + '" required></label>' +
      '<label class="ein-ck"><input type="checkbox" name="optin"><span>' + T.opt + '</span></label><p class="ein-err" hidden></p><button type="submit" class="ein-go ein-go2"><span>' + T.fb + '<small>' + T.fb2 + '</small></span>' + ARR + '</button><p class="ein-sm">' + T.fsm + '</p></form>';
    var top = root.getBoundingClientRect().top; if (top < 0 || mob()) scrollBy({ top: top - (mob() ? 70 : 90), behavior: 'smooth' });
    var form = $('.ein-form'), em = form.email, err = $('.ein-err');
    em.addEventListener('focus', function () { if (!form._f) { form._f = 1; ev('Einstieg E-Mail angetippt', ''); } });
    form.onsubmit = function (e) {
      e.preventDefault(); err.hidden = true; var v = em.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { err.textContent = T.ferr; err.hidden = false; em.focus(); return; }
      var b = $('.ein-go'); if (b.disabled) return; b.disabled = true; b.classList.add('wait');
      var body = { mode: 'tag1', email: v, optin: !!form.optin.checked, ad: AD, ref: REF, w: touch ? 'handy' : 'gross' }; if (EN) body.lang = 'en';
      fetch(K_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }).then(function (r) {
        if (!r || !r.ok) throw r;
        ev('Einstieg E-Mail', (r.paid ? 'schon gekauft' : r.neu ? 'neu' : 'bestehend') + (body.optin ? ' · Tipps ja' : '') + (touch ? ' · Handy' : ' · Laptop/Tablet'));
        if (!r.paid) px('CompleteRegistration', 'Lead', { contents: [{ content_id: 'tag1', content_name: 'Tag 1 gratis' }], content_type: 'product' });
        done(r, v, body.optin);
      }).catch(function (r) { b.disabled = false; b.classList.remove('wait'); err.textContent = (r && r.grund) || T.fnet; err.hidden = false; });
    };
  }
  function keep(r, mail) {
    try {
      if (r.token) { localStorage.setItem('gsm-token', r.token); localStorage.setItem('gsm-kmail', mail); }
      if (r.code) { localStorage.setItem('gsm-abo', JSON.stringify({ code: r.code, paid: true, status: 'tag1', plan: 'fp', checked: Date.now() })); localStorage.setItem('gsm-fs-mailok', '1'); localStorage.removeItem('mi-demo'); }
    } catch (e) {}
  }
  function done(r, mail, optin) {
    var c;
    if (r.paid) c = '<div class="ein-ok"><span class="ein-ic">' + MAIL + '</span><h3>' + T.ph + '</h3><p>' + T.ps(mail) + '</p><p class="ein-sp">' + T.spam + '</p></div>';
    else if (!r.token) c = '<div class="ein-ok"><span class="ein-ic">' + MAIL + '</span><h3>' + T.wh + '</h3><p>' + T.ws(mail) + '</p><p class="ein-sp">' + T.spam + '</p><a class="ein-go sec" href="/app#anmelden">' + T.wb + ARR + '</a></div>';
    else {
      keep(r, mail);
      var canShare = touch && !!navigator.share && !!r.ml;
      c = '<div class="ein-ok"><span class="ein-ic ok">' + OK + '</span><h3>' + T.sh + '</h3><p>' + T.ss(mail) + '</p>' +
        (touch ? (r.ml ? '<button type="button" class="ein-go" data-a="share">' + SHARE + '<span>' + (canShare ? T.shm : T.shc) + '</span></button>' : '') + '<a class="ein-go ' + (r.ml ? 'sec' : '') + '" data-a="here" href="/app#fuehrerschein"><span>' + T.here + '</span>' + ARR + '</a>'
          : '<a class="ein-go" data-a="here" href="/app#fuehrerschein"><span>' + T.go + '</span>' + ARR + '</a>') +
        (optin ? '<p class="ein-doi">' + MAIL + '<span>' + T.doi + '</span></p>' : '') + '<p class="ein-sp">' + T.spam + '</p><p class="ein-msg" hidden></p></div>';
    }
    card.innerHTML = c; card.classList.add('ein-fin');
    var top = root.getBoundingClientRect().top; if (top < 0) scrollBy({ top: top - 80, behavior: 'smooth' });
    var sh = $('[data-a=share]'); if (sh) sh.onclick = function () {
      ev('Einstieg Start', 'An Laptop/iPad senden');
      if (navigator.share && touch) { navigator.share({ title: T.shTitle, text: T.shText, url: r.ml }).catch(function () {}); return; }
      try { navigator.clipboard.writeText(r.ml).then(function () { var m = $('.ein-msg'); m.textContent = T.shd; m.hidden = false; }); } catch (e) {}
    };
    var h = $('[data-a=here]'); if (h) h.addEventListener('click', function () { ev('Einstieg Start', touch ? 'Hier am Handy' : 'Hier am Laptop/Tablet'); });
  }
  /* Schon angefangen: mit Konto direkt in den Kurs, sonst zur Anmeldung */
  var bk = root.querySelector('.ein-back'); if (bk) bk.addEventListener('click', function (e) { var t = ''; try { t = localStorage.getItem('gsm-token') || ''; } catch (er) {} ev('Klick', 'Schon angefangen · ' + (t ? 'mit Konto' : 'Anmelden')); if (!t) bk.setAttribute('href', '/app#anmelden'); });
  /* Erste Szene startet, sobald der Block zu sehen ist */
  var started = false; function go() { if (started) return; started = true; root.classList.add('ein-on'); q(); }
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { if (es.some(function (x) { return x.isIntersecting; })) { io.disconnect(); go(); } }, { threshold: .15 }); io.observe(root); } else go();
  /* Alle anderen „Gratis testen“-Knöpfe der Seite führen jetzt hierher */
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href="/app#test/los"], a[href="/app#test"], a[href="#ein"]'); if (!a || root.contains(a)) return; e.preventDefault(); ev('Gratis testen geklickt', (a.getAttribute('data-ft') || 'Knopf') + ' → Einstieg'); var t = root.getBoundingClientRect().top + scrollY - (mob() ? 64 : 90); scrollTo({ top: t, behavior: 'smooth' }); var f = $('.ein-form input[type=email]'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 600); }, true);
})();
