// Lernseiten (bwlmax.de/lernen/…): zählen (anonym, wie am Google-Einstieg) und beim Verlassen einmal das „Du willst schon gehen?“-Fenster
// mit dem traurigen Max und den vier stärksten Gründen – ein Klick führt direkt zur kostenlosen Anmeldung (mit Google) samt Tafel zum Thema.
const me = document.querySelector('script[data-slug]');
const D = (me && me.dataset) || {};
const slug = D.slug || '', thema = D.thema || 'bwl', name = D.name || 'BWL';
const tr = (e, d) => { try { window.BM && window.BM.track(e, d); } catch (x) {} };
tr('Lernseite geöffnet', slug);
document.querySelectorAll('[data-k]').forEach(a => a.addEventListener('click', () => tr('Lernseite Karte', slug + ':' + a.dataset.k)));
document.querySelectorAll('.lm-tn, .lm-cta').forEach(a => a.addEventListener('click', () => tr('Lernseite Karte', slug + ':nav')));

const IC = {
  exam: '<path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 12l2 2 4-4"/>',
  cards: '<rect x="3" y="7" width="14" height="12" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>'
};
const ico = k => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
const XLS = '<svg class="xls" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 1.5h8.3l5.3 5.3v13.7a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#1D6F42"/><path d="M14.5 1.5v3.6a1.7 1.7 0 0 0 1.7 1.7h3.6z" fill="#8fd1ac"/><text x="12" y="17.6" text-anchor="middle" font-size="7.4" font-weight="800" fill="#fff" font-family="Arial,Helvetica,sans-serif">XLS</text></svg>';
const YT = '<img src="/tutor/img/brands/youtube.svg" alt="" width="22" height="22">';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function exitOffer() {
  if (document.querySelector('.lmx-bg')) return;
  tr('Lernseite Verlassen-Hinweis', slug);
  const row = (i, b, s) => `<li><span class="i">${i}</span><span><b>${b}</b><small>${s}</small></span></li>`;
  const bg = document.createElement('div');
  bg.className = 'lmx-bg';
  bg.innerHTML = `<div class="lmx" role="dialog" aria-modal="true" aria-label="Du willst schon gehen?">
    <button class="lmx-x" type="button" aria-label="Schließen">${ico('x')}</button>
    <div class="lmx-face"></div>
    <h3>Du willst schon gehen?</h3>
    <p>Schade – für dein BWL-/Wiwi-Studium wartet noch so viel. Kostenlos, mit Google in zwei Klicks.</p>
    <ul>${row(XLS, 'Excel-Helfer', '60 Vorlagen + Trainer')}${row(ico('exam'), 'Klausurfragen', 'zu „' + esc(name) + '“ mit Musterlösung')}${row(YT, 'Video → Lernzettel', 'Link rein, fertig')}${row(ico('cards'), 'Karteikarten & Podcast', 'aus deinen Folien')}</ul>
    <a class="lmx-go" href="/?thema=${encodeURIComponent(thema)}&konto=1&utm_source=seo&utm_medium=lernen&utm_campaign=${encodeURIComponent(slug)}-verlassen">Kostenlos weiterlernen</a>
    <button class="lmx-no" type="button">Nein danke, ich lese weiter</button>
  </div>`;
  const close = () => { bg.classList.add('out'); setTimeout(() => bg.remove(), 260); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  bg.querySelector('.lmx-x').onclick = close; bg.querySelector('.lmx-no').onclick = close;
  bg.querySelector('.lmx-go').addEventListener('click', () => tr('Lernseite Karte', slug + ':verlassen'));
  document.addEventListener('keydown', onKey);
  document.body.appendChild(bg);
  // Trauriger Max (dieselbe Figur wie in der App); klappt das nicht, bleibt das Bild
  const fEl = bg.querySelector('.lmx-face');
  import('/tutor/js/face.js').then(m => { const f = m.face(fEl, { follow: false }); setTimeout(() => { try { f.set('sad'); } catch (e) {} }, 250); })
    .catch(() => { fEl.innerHTML = '<img src="/tutor/img/max-fav-192.png?v=8" alt="" width="92" height="92" style="border-radius:50%">'; });
}

// Am Laptop: Maus verlässt das Fenster nach oben (Tab schließen / zurück) – einmal pro Besuch, frühestens nach 8 Sekunden
if (matchMedia('(pointer: fine) and (min-width: 761px)').matches) {
  const t0 = Date.now();
  let shown = false; try { shown = !!sessionStorage.getItem('bm.lmExit'); } catch (e) {}
  const onOut = e => {
    if (shown || e.clientY > 8 || e.relatedTarget || Date.now() - t0 < 8000) return;
    shown = true; try { sessionStorage.setItem('bm.lmExit', '1'); } catch (x) {}
    document.removeEventListener('mouseout', onOut);
    exitOffer();
  };
  document.addEventListener('mouseout', onOut);
}

// ---------- Anmelden direkt auf der Lernseite (Google oder E-Mail mit Code) – man verlässt die Seite nie ----------
const getAcc = () => { try { return JSON.parse(localStorage.getItem('tutor.account') || 'null'); } catch (e) { return null; } };
export function authModal({ title = 'Kostenlos weiterlernen', sub = 'Mit Google in zwei Klicks – du bleibst auf dieser Seite.', why = 'Lernseite', onDone } = {}) {
  if (document.querySelector('.lms-bg')) return;
  tr('Anmeldefenster gesehen', why);
  const bg = document.createElement('div'); bg.className = 'lms-bg';
  bg.innerHTML = `<div class="lms" role="dialog" aria-modal="true" aria-label="Anmelden"><button class="lmx-x" type="button" aria-label="Schließen">${ico('x')}</button><div class="lmx-face"></div><div class="lms-body"></div></div>`;
  const body = bg.querySelector('.lms-body');
  const close = () => { bg.classList.add('out'); setTimeout(() => bg.remove(), 260); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  bg.querySelector('.lmx-x').onclick = close;
  document.body.appendChild(bg);
  let fc = null; const fEl = bg.querySelector('.lmx-face');
  import('/tutor/js/face.js').then(m => { fc = m.face(fEl, { follow: false }); }).catch(() => { fEl.innerHTML = '<img src="/tutor/img/max-fav-192.png?v=8" alt="" width="92" height="92" style="border-radius:50%">'; });
  const mood = (m, pulse) => { try { fc && (pulse ? fc.pulse(m) : fc.set(m)); } catch (e) {} };
  let api = null, ts = null; const mods = () => Promise.all([import('/tutor/js/api.js'), import('/tutor/js/turnstile.js')]).then(([a, t]) => { api = a; ts = t; });
  const ready = mods();
  const done = r => { try { if (r.account?.email) localStorage.setItem('tutor.lastEmail', JSON.stringify(r.account.email)); } catch (e) {} mood('happy'); setTimeout(() => { close(); onDone && onDone(r.account || getAcc()); }, 450); };
  let email = ''; try { email = JSON.parse(localStorage.getItem('tutor.lastEmail') || '""') || ''; } catch (e) {}
  let pw = '';
  const H = (t, ss) => `<h3>${t}</h3>${ss ? `<p>${ss}</p>` : ''}`;
  const gBox = () => { const g = document.createElement('div'); g.className = 'lms-g'; import('/tutor/js/google.js').then(m => m.googleButton(g, r => { tr('Anmeldung begonnen', 'Google'); done(r); })).catch(() => { g.hidden = true; }); return g; };
  const busy = (b, on, lbl) => { b.disabled = on; b.textContent = on ? 'Einen Moment …' : lbl; };
  const view = (mode, first) => {
    const reg = mode === 'register';
    body.innerHTML = (first ? H(title, sub) : H(reg ? 'Kostenloses Konto erstellen' : 'Anmelden', reg ? 'Kostenlos und in 30 Sekunden.' : 'Schön, dass du wieder da bist.'))
      + `<div class="lms-gw"></div><div class="lms-or"><span>oder mit E-Mail</span></div>
      <form class="lms-f"><input class="lms-in" type="email" autocomplete="email" inputmode="email" placeholder="E-Mail-Adresse" required>
      <input class="lms-in" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" placeholder="${reg ? 'Passwort (mind. 8 Zeichen)' : 'Passwort'}" required>
      <div class="lms-ts"></div><button class="lms-go" type="submit">${reg ? 'Konto erstellen' : 'Anmelden'}</button></form>
      <div class="lms-err" role="alert"></div>
      <div class="lms-alt">${reg ? 'Schon ein Konto? <button type="button" class="lms-l">Anmelden</button>' : 'Noch kein Konto? <button type="button" class="lms-l">Konto erstellen</button> · <a href="/#/app/tutor" target="_blank" rel="noopener">Passwort vergessen?</a>'}</div>`;
    body.querySelector('.lms-gw').append(gBox());
    const [em, pi] = body.querySelectorAll('.lms-in'), f = body.querySelector('form'), btn = body.querySelector('.lms-go'), err = body.querySelector('.lms-err'), LBL = btn.textContent;
    em.value = email;
    body.querySelector('.lms-l').onclick = () => view(reg ? 'login' : 'register');
    if (reg) ready.then(() => ts.preload());
    f.addEventListener('submit', async e => {
      e.preventDefault(); email = em.value.trim(); pw = pi.value;
      if (!email || !pw) return;
      if (reg && pw.length < 8) { err.textContent = 'Dein Passwort braucht mindestens 8 Zeichen.'; pi.focus(); return; }
      busy(btn, true, LBL); err.textContent = ''; mood('think');
      try {
        await ready;
        if (reg) {
          tr('Anmeldung begonnen', 'E-Mail');
          const t = await ts.token(body.querySelector('.lms-ts'));
          await api.ask('login', { opts: { email, password: pw, mode: 'register', ts: t } });
          code();
        } else {
          const r = await api.ask('pwlogin', { opts: { email, password: pw } });
          api.setAccount(r.account, r.session); done(r);
        }
      } catch (e2) {
        mood('sad', true); busy(btn, false, LBL); err.textContent = e2.message || 'Das hat nicht geklappt.';
        if (e2.code === 'exists') { const l = document.createElement('button'); l.type = 'button'; l.className = 'lms-l'; l.textContent = ' Zur Anmeldung →'; l.onclick = () => view('login'); err.append(l); }
      }
    });
    mood('idle');
    if (matchMedia('(pointer: fine)').matches) setTimeout(() => (email ? pi : em).focus(), 80);
  };
  const code = () => {
    body.innerHTML = H('Bestätige deine E-Mail', `Wir haben dir einen 6-stelligen Code an <b>${esc(email)}</b> geschickt. Keine Mail? Schau im Spam-Ordner nach.`)
      + `<input class="lms-in lms-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="······" aria-label="Code aus der E-Mail"><div class="lms-err" role="alert"></div><div class="lms-ts"></div>
      <div class="lms-alt"><button type="button" class="lms-l lms-back">Andere E-Mail</button> · <button type="button" class="lms-l lms-again" disabled>Neuen Code schicken</button></div>`;
    const inp = body.querySelector('.lms-code'), err = body.querySelector('.lms-err'), again = body.querySelector('.lms-again');
    let busyC = false;
    body.querySelector('.lms-back').onclick = () => view('register');
    setTimeout(() => { again.disabled = false; }, 30000);
    again.onclick = async () => { again.disabled = true; try { const t = await ts.token(body.querySelector('.lms-ts')); await api.ask('login', { opts: { email, password: pw, mode: 'register', ts: t } }); err.textContent = 'Neuer Code ist unterwegs.'; } catch (e) { err.textContent = e.message; } setTimeout(() => { again.disabled = false; }, 30000); };
    inp.addEventListener('input', async () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0, 6);
      if (inp.value.length < 6 || busyC) return;
      busyC = true; inp.disabled = true; mood('think'); err.textContent = '';
      try { const r = await api.ask('verify', { opts: { email, code: inp.value } }); api.setAccount(r.account, r.session); pw = ''; done(r); }
      catch (e) { busyC = false; inp.disabled = false; inp.value = ''; mood('sad', true); err.textContent = e.message; inp.focus(); }
    });
    mood('idle'); setTimeout(() => inp.focus(), 80);
  };
  view(email ? 'login' : 'register', true);
}

// Ohne Konto führt kein Knopf auf der Lernseite weg: Kopfzeile und Karten öffnen die Anmeldung hier – danach geht's dorthin, wo man hinwollte
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a.lm-tn, a.lm-c, a.lm-cta, a.lm-live, a.lm-side, a.ln-max, a.lmx-go');
  if (!a || getAcc() || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  const href = a.getAttribute('href'), exit = a.classList.contains('lmx-go');
  if (exit) { const x = document.querySelector('.lmx-bg'); if (x) x.remove(); }
  authModal({ title: 'Kostenlos weiterlernen', sub: `Mit Google in zwei Klicks – dann erklärt dir Max „${esc(name)}“ und alles andere.`, why: 'Lernseite ' + (a.dataset.k || (a.classList.contains('lm-tn') ? 'Kopf' : exit ? 'Verlassen' : 'Knopf')),
    onDone: () => { if (!exit) location.href = href; } });
}, true);

// 3-Fragen-Test (wie am Google-Einstieg): Ergebnis sofort – welche falsch war und warum, sehen Gäste nach dem kostenlosen Konto.
// Nach der Anmeldung schickt die App zurück auf diese Seite (?test=<Antworten>), dann wird hier sofort aufgelöst.
(() => {
  const box = document.querySelector('.lm-check'); if (!box) return;
  let acc = null; try { acc = JSON.parse(localStorage.getItem('tutor.account') || 'null'); } catch (e) {}
  const qs = [...box.querySelectorAll('.lm-q')].map(el => ({ el, r: +el.dataset.r, pick: -1, btns: [...el.querySelectorAll('.lm-o')], why: el.querySelector('.lm-why') }));
  const go = box.querySelector('.lm-go'), sum = box.querySelector('.lm-sum');
  const PRAISE = ['Stark – genau so.', 'Sitzt.', 'Respekt – die erwischt fast jeden.'];
  qs.forEach(q => q.btns.forEach((b, i) => b.addEventListener('click', () => {
    if (box.classList.contains('done')) return;
    q.pick = i; q.btns.forEach((x, j) => x.classList.toggle('on', j === i));
    go.disabled = qs.some(x => x.pick < 0);
  })));
  const reveal = () => {
    box.classList.add('open');
    qs.forEach((q, i) => {
      const ok = q.pick === q.r;
      q.btns.forEach(b => b.classList.remove('ok', 'no'));
      q.btns[q.pick].classList.add(ok ? 'ok' : 'no'); q.btns[q.r].classList.add('ok');
      if (ok && !q.why.dataset.p) { q.why.insertAdjacentHTML('afterbegin', `<b>${PRAISE[i % 3]}</b> `); q.why.dataset.p = '1'; }
      q.why.hidden = false; q.why.classList.remove('blur');
    });
    sum.querySelectorAll('.lm-lock').forEach(x => x.remove());
    if (qs.every(q => q.pick === q.r)) sum.append(el('a', 'lm-cta2', 'Jetzt die echten Klausuraufgaben →')).href = `/?thema=${encodeURIComponent(thema)}&ziel=quiz&utm_source=seo&utm_medium=lernen&utm_campaign=${encodeURIComponent(slug)}-test`;
  };
  const el = (tag, cls, html) => { const x = document.createElement(tag); x.className = cls; x.innerHTML = html; return x; };
  // Erst nur das Ergebnis: alle gewählten Antworten grün, Erklärungen verschwommen. „Auflösung ansehen“: mit Konto sofort, sonst kostenlos anmelden – danach landet man genau hier wieder und sieht sie.
  const check = () => {
    if (box.classList.contains('done')) return;
    box.classList.add('done');
    const n = qs.length, score = qs.filter(q => q.pick === q.r).length, all = score === n;
    tr('Lernseite Karte', `${slug}:test-${score}/${n}`);
    qs.forEach(q => { q.btns.forEach(b => { b.disabled = true; b.classList.remove('on'); }); q.btns[q.pick].classList.add('ok'); q.why.hidden = false; q.why.classList.add('blur'); });
    go.parentElement.hidden = true;
    sum.replaceChildren(el('p', 'lm-score', `<b>${score} von ${n} richtig.</b> ` + (all ? 'Stark – das sitzt.' : n - score === 1 ? 'Fast. Eine hat dich erwischt.' : score ? 'Zwei haben dich erwischt.' : 'Gut, dass das jetzt passiert und nicht in der Klausur.')));
    sum.hidden = false;
    if (!acc) sum.append(el('p', 'lm-hint lm-lock', 'Welche richtig und welche falsch war – und warum – siehst du mit kostenlosem Konto. Mit Google in zwei Klicks – du bleibst auf dieser Seite.'));
    const a = sum.appendChild(el('a', 'lm-cta2 lm-lock', acc ? 'Auflösung ansehen' : 'Kostenlos anmelden für die Auflösung'));
    if (acc) { a.href = '#'; a.addEventListener('click', e => { e.preventDefault(); reveal(); }); }
    else {
      const back = `/lernen/${slug}?test=${qs.map(q => q.pick).join('')}`;
      a.href = `/?thema=${encodeURIComponent(thema)}&konto=1&zurueck=${encodeURIComponent(back)}&utm_source=seo&utm_medium=lernen&utm_campaign=${encodeURIComponent(slug)}-test`;
      a.addEventListener('click', e => { e.preventDefault(); tr('Lernseite Karte', slug + ':test-frei'); signIn(); });
    }
  };
  const signIn = () => authModal({ title: 'Kostenlos anmelden für die Auflösung', sub: 'Mit Google in zwei Klicks – du bleibst hier und siehst sofort, welche richtig war und warum.', why: 'Lernseite Test',
    onDone: a => { acc = a; tr('Lernseite Karte', slug + ':test-angemeldet'); reveal(); setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300); } });
  go.addEventListener('click', check);
  // Zurück von der Anmeldung: Antworten wieder eintragen und auflösen
  // Die Seite öffnet immer oben – nie direkt am Test (auch nicht über alte #test-Links)
  if (location.hash === '#test') { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} scrollTo(0, 0); }
  const pre = new URLSearchParams(location.search).get('test');
  if (pre && /^\d+$/.test(pre) && pre.length === qs.length && acc) {
    qs.forEach((q, i) => { q.pick = Math.min(+pre[i], q.btns.length - 1); q.btns[q.pick].classList.add('on'); });
    check(); reveal();
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }
})();
