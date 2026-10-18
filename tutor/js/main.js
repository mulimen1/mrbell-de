// Einstieg: Landingpage (mit Animationen) + Router
import { $, $$, h, sleep, ico, ls } from './util.js';
import { face } from './face.js';
import { mountApp, startUpload, startSample, topicForm, tryFeature, viaMax, startTopic } from './app.js';
import { landingTopic } from './themen.js';
import { openLogin, openAccount, verifyLink, askNick } from './account.js';
import { greetOnLoad, getNick } from './nick.js';
import { onAccount, getAccount } from './api.js';
import { applyThemeButtons } from './theme.js';
import { lines as maxLines } from './max.js';
import { EN, L, setLang, lang } from './i18n.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let topicEntry = false;
// ---------- Landing ----------
let landingReady = false;
function initLanding() {
  if (landingReady) return; landingReady = true;

  // Englische Fassung: Texte aus data-en-* übernehmen (vor dem Wort-Zerlegen)
  document.documentElement.lang = lang;
  if (EN) {
    $$('#landing [data-en]').forEach(el => { el.textContent = el.dataset.en; });
    $$('#landing [data-en-html]').forEach(el => { el.innerHTML = el.dataset.enHtml; });
    $$('#landing [data-en-ph]').forEach(el => { el.placeholder = el.dataset.enPh; });
    $$('#landing [data-en-aria]').forEach(el => { el.setAttribute('aria-label', el.dataset.enAria); });
    $$('#landing [data-en-title]').forEach(el => { el.title = el.dataset.enTitle; });
  }
  // Themen-Einstieg (Google-Anzeige/Link mit ?thema=…): Überschrift passt zur Suche, Max erklärt gleich danach
  const TH = EN ? null : landingTopic();
  if (TH) {
    const h1 = $('#hero h1');
    // Zeile 1 das Thema, Zeile 2 „einfach erklärt.“ – Schrift schrumpft bei langen Begriffen, damit nichts abgeschnitten wird
    if (h1) { h1.textContent = TH.name + ' '; h1.appendChild(h('span', { class: 'soft' }, 'einfach erklärt.')); h1.classList.add('h1-topic'); h1.style.setProperty('--k', String(Math.min(1, 22 / Math.max(TH.name.length, 16)))); }
    document.title = `${TH.name} einfach erklärt · BWL Max`;
  }
  // Sprachumschalter
  $$('[data-setlang]').forEach(b => { b.classList.toggle('on', b.dataset.setlang === lang); b.setAttribute('aria-pressed', b.dataset.setlang === lang); b.addEventListener('click', () => { if (b.dataset.setlang !== lang) setLang(b.dataset.setlang); }); });

  // Nach dem Wort-Erscheinen: Wörter wieder normaler Fließtext (sauberes Markieren ohne Kästchen)
  function settle(el) {
    if (!el.hasAttribute?.('data-split')) return;
    const n = el.querySelectorAll('.wi').length;
    clearTimeout(el._st); el._st = setTimeout(() => { if (el.classList.contains('in')) el.classList.add('settled'); }, n * 55 + 1000);
  }
  // Überschriften in Wörter zerlegen (für das Wort-für-Wort-Erscheinen)
  $$('[data-split]').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            frag.appendChild(h('span', { class: 'w' }, h('span', { class: 'wi', style: { '--i': i++ } }, part)));
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
  });

  // Gesichter
  $$('#landing [data-face]').forEach(el => face(el));
  // Max-Assistent ein-/ausblenden (Fußzeile)
  const foot = $('#landing footer.foot div:last-child');
  if (foot) {
    const tg = h('button', { class: 'asst-tg', type: 'button' });
    const lab = () => import('./assistant.js').then(m => { tg.textContent = m.isAssistantEnabled() ? L('Max ausblenden', 'Hide Max') : L('Max einblenden', 'Show Max'); });
    tg.addEventListener('click', () => import('./assistant.js').then(m => m.setAssistantEnabled(!m.isAssistantEnabled())));
    addEventListener('asst:change', lab); lab();
    foot.prepend(tg);
  }
  const row = $('#maxrow');
  if (row) {
    const sts = ['idle', 'smug', 'happy'];
    const fs = sts.map((st, k) => { const d = h('div', { class: 'reveal', style: { transitionDelay: k * 90 + 'ms' } }); row.appendChild(d); const f = face(d); setTimeout(() => f.set(st), 400); return f; });
    const sp = $$('.spicebar span'); let si = 1;
    setInterval(() => { if (!sp[0]?.isConnected) return; si = (si + 1) % 3; sp.forEach((x, k) => x.classList.toggle('on', k === si)); fs.forEach((f, k) => f.set(k === si ? (si === 2 ? 'smug' : si === 1 ? 'happy' : 'idle') : 'idle')); }, 2200);
  }

  // Was Max kann – direkt im Hero sichtbar
  const fr = $('#featrow');
  if (fr) {
    // Die drei stärksten zuerst und größer, der Rest dezent
    const TOP = [['board', L('Erklärt an der Tafel', 'Explains on the whiteboard'), 'tutor', L('Dein Skript, live erklärt', 'Your slides, explained live')], ['calendar', L('Klausurplan', 'Exam plan'), 'plan', L('Tag für Tag bis zur Klausur', 'Day by day to your exam')], ['quiz', L('Quiz in 6 Formaten', 'Quizzes in 6 formats'), 'quiz', L('Wie in der echten Klausur', 'Just like the real exam')]];
    const REST = [['whistle', L('BWL-Trainer', 'Business trainer'), 'trainer'], ['trophy', L('Wochen-Challenge', 'Weekly challenge'), 'challenge'], ['brain', L('Lernzettel & Mindmap', 'Study sheet & mind map'), 'zettel'], ['mic', L('Sprechen', 'Talk'), 'voice'], ['cards', L('Karteikarten', 'Flashcards'), 'karten'], ['path', L('Lernpfad', 'Study path'), 'pfad'], ['pod', 'Podcast', 'podcast']];
    const rowT = h('div', { class: 'feattop' }), rowR = h('div', { class: 'featrest' });
    TOP.forEach(([ic, t, key, sub], k) => rowT.appendChild(h('button', { class: 'feat big', type: 'button', title: L('Ausprobieren', 'Try it'), style: { '--k': k }, onclick: () => tryFeature(key) }, h('span', { class: 'fi', html: ico(ic) }), h('span', { class: 'ft' }, h('b', {}, t), h('small', {}, sub)))));
    REST.forEach(([ic, t, key], k) => (key === 'pfad' && rowR.appendChild(h('span', { class: 'fbreak', 'aria-hidden': 'true' })), rowR).appendChild(h('button', { class: 'feat', type: 'button', title: L('Ausprobieren', 'Try it'), style: { '--k': k + 3 }, onclick: () => tryFeature(key) }, h('span', { html: ico(ic) }), t, key === 'challenge' ? h('span', { class: 'lockb', 'data-lockb': '', title: L('Mit kostenlosem Konto', 'With a free account'), html: ico('lock') }) : null)));
    onAccount(a => document.querySelectorAll('#featrow [data-lockb]').forEach(x => { x.hidden = !!a; }));
    fr.append(rowT, rowR);
    // Umrandung läuft durch alle Funktionen: erst die drei großen, dann die kleinen (die Zeile wischt mit)
    const fs = [...rowT.children, ...rowR.children].filter(x => x.tagName === "BUTTON"); let fi = 0;
    if (!reduce) setInterval(() => {
      if (!fr.isConnected || document.hidden) return;
      const cur = fs[fi];
      fs.forEach(x => x.classList.toggle('hl', x === cur));
      if (rowR.scrollWidth > rowR.clientWidth + 2) {
        const left = rowR.contains(cur) ? Math.max(0, cur.offsetLeft - rowR.offsetLeft - (rowR.clientWidth - cur.offsetWidth) / 2) : 0;
        rowR.scrollTo({ left, behavior: 'smooth' });
      }
      fi = (fi + 1) % fs.length;
    }, 1400);
  }

  // Ohne Skript: Max erklärt ein Thema
  $('#topicSlot')?.appendChild(topicForm());
  // … und beim Themen-Einstieg legt Max direkt los (einmal pro Besuch und Thema)
  if (TH) {
    let done = ''; try { done = sessionStorage.getItem('tutor.themaDone') || ''; } catch (e) {}
    const go = async () => {
      try { sessionStorage.setItem('tutor.themaDone', TH.slug); } catch (e) {}
      if (!(await viaMax(a => a.ask(TH.ask)))) startTopic(TH.name);
    };
    // erst wenn die Seite wirklich zu sehen ist (Tab im Hintergrund geöffnet → warten)
    const later = () => setTimeout(go, reduce ? 400 : 1700);
    if (done !== TH.slug) { if (document.hidden) document.addEventListener('visibilitychange', function v() { if (!document.hidden) { document.removeEventListener('visibilitychange', v); later(); } }); else later(); }
  }

  // Mit Max sprechen (direkt aus der Sprechblase)
  $$('[data-voice]').forEach(b => b.addEventListener('click', async () => { const { talkToMax } = await import('./app.js'); talkToMax(); }));

  // Anmelden (dezent in der Navigation)
  const nl = $('[data-login]');
  if (nl) nl.addEventListener('click', () => getAccount() ? openAccount() : openLogin());
  const nr = $('[data-register]');
  if (nr) nr.addEventListener('click', () => getAccount() ? (location.hash = '#/app/tutor') : openLogin({ mode: 'register' }));
  onAccount(a => { if (a) { let z = null; try { z = sessionStorage.getItem('tutor.after'); } catch (e) {} if (z && /^\/[a-z]+$/.test(z)) { sessionStorage.removeItem('tutor.after'); setTimeout(() => { location.href = z; }, 700); } }
    if (nl) nl.hidden = !!a; if (nr) nr.textContent = a ? L('Mein Bereich', 'My space') : L('Konto erstellen', 'Create account'); });


  // Begrüßung tippen (Sprechblase)
  const g = $('#greet');
  const bub = g.closest('.bubble');
  const lines = maxLines('greet');
  let li = 0;
  (async function type() {
    await sleep(900);
    while (g.isConnected) {
      const t = lines[li++ % lines.length];
      if (bub && !reduce) bub.animate([{ transform: 'scale(.92)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
      for (let i = 0; i <= t.length; i++) { g.replaceChildren(t.slice(0, i), h('span', { class: 'cur' })); await sleep(28 + Math.random() * 30); }
      await sleep(3400);
      for (let i = t.length; i >= 0; i -= 2) { g.replaceChildren(t.slice(0, i), h('span', { class: 'cur' })); await sleep(12); }
      await sleep(250);
    }
  })();

  // Wellen im Podcast-Pin
  const w = $('.pin .wave'); if (w) for (let i = 0; i < 38; i++) w.appendChild(h('i', { style: { '--h': (25 + Math.random() * 75) + '%', animationDelay: (i * 47 % 900) + 'ms' } }));

  // Intro: alles erscheint nacheinander
  $$('[data-in]').forEach(el => { const d = reduce ? 0 : 120 + (+el.dataset.in) * 110; setTimeout(() => { el.classList.add('in'); settle(el); }, d); });

  // Scroll: Erscheinen, Karten fliegen aus verschiedenen Richtungen ein
  $$('.pin.fly').forEach((p, k) => { p.style.setProperty('--fx', (k % 2 ? 1 : -1) * (40 + (k * 37) % 80) + 'px'); p.style.setProperty('--fr', ((k % 3) - 1) * 7 + 'deg'); p.style.transitionDelay = (k % 3) * 90 + 'ms'; });
  $$('.step3.reveal, .privacy li.reveal, .plan.reveal, .faq details.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; });
  // Erscheinen beim Runterscrollen; scrollt man wieder hoch, verschwinden die Elemente unterhalb
  // (nie die, die man gerade sieht) – beim nächsten Runterscrollen erscheinen sie neu.
  // In beide Richtungen: Was oben oder unten ganz aus dem Bild ist, versteckt sich wieder
  // und erscheint neu, sobald man zurückscrollt (von oben kommend fliegt es von oben rein).
  const io = new IntersectionObserver(es => es.forEach(e => {
    const el = e.target;
    if (e.isIntersecting && e.intersectionRatio >= .12) { el.classList.add('in'); settle(el); return; }
    if (e.isIntersecting || el.matches('details[open]')) return;
    const above = e.boundingClientRect.bottom <= 0;
    if (!above && e.boundingClientRect.top < innerHeight * .9) return;
    el.classList.remove('in', 'settled'); el.classList.toggle('up', above);
  }), { threshold: [0, .12, .14] });
  $$('.reveal, .pin.fly, h2[data-split]').forEach(el => io.observe(el));

  // Fortschrittsbalken + Nav
  const bar = $('#scrollbar'), nav = $('#nav');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav.classList.toggle('scrolled', scrollY > 8);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Lichtkegel im Hero folgt der Maus
  // Punkte und Lichtschein liegen über der ganzen Seite und folgen der Maus
  const bg = $('#pagebg');
  let mx = innerWidth / 2, my = innerHeight * .3, tx = mx, ty = my, run = false;
  const step = () => { mx += (tx - mx) * .18; my += (ty - my) * .18; bg.style.setProperty('--mx', mx.toFixed(1) + 'px'); bg.style.setProperty('--my', my.toFixed(1) + 'px'); if (Math.abs(tx - mx) + Math.abs(ty - my) > .5) requestAnimationFrame(step); else run = false; };
  addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; tx = e.clientX; ty = e.clientY; if (!run) { run = true; requestAnimationFrame(step); } }, { passive: true });
  bg.style.setProperty('--mx', mx + 'px'); bg.style.setProperty('--my', my + 'px');

  // Magnet-Knöpfe
  if (!reduce && matchMedia('(pointer: fine)').matches) $$('.magnet').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); const x = (e.clientX - r.left - r.width / 2) * .25, y = (e.clientY - r.top - r.height / 2) * .35; b.style.transform = `translate(${x}px, ${y}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  // FAQ: immer nur eine offen, weich auf- und zuklappen
  const faqs = $$('.faq details');
  const expand = d => { const a = d.querySelector('.ans'); d.open = true; const hgt = a.scrollHeight; a.animate([{ height: '0px', opacity: 0 }, { height: hgt + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' }); };
  const collapse = d => { const a = d.querySelector('.ans'); const hgt = a.scrollHeight; const an = a.animate([{ height: hgt + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'ease-in' }); an.onfinish = () => { d.open = false; }; };
  faqs.forEach(d => d.querySelector('summary').addEventListener('click', e => {
    e.preventDefault();
    const willOpen = !d.open;
    faqs.forEach(o => { if (o !== d && o.open) collapse(o); });
    willOpen ? expand(d) : collapse(d);
  }));

  // Upload
  const drop = $('#drop'), inp = $('#fileHero');
  inp.addEventListener('change', () => { if (inp.files.length) startUpload([...inp.files]); inp.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', e => { const f = e.dataTransfer?.files; if (f && f.length) startUpload([...f]); });
  $$('[data-sample]').forEach(b => b.addEventListener('click', () => startSample()));
}

// ---------- Router ----------
async function route() {
  let hash = location.hash || '#/';
  const lm = hash.match(/^#\/login\/([A-Za-z0-9_-]{20,60})\/(\d{6})$/);
  if (lm) { history.replaceState(null, '', location.pathname + '#/app'); hash = '#/app'; verifyLink(lm[1], lm[2]); }
  // Direkt zur Anmeldung (z. B. von bwlmax.de/zahlen) – danach geht’s dorthin zurück
  if (hash === '#/anmelden') { history.replaceState(null, '', location.pathname + '#/'); hash = '#/'; if (getAccount()) { const z = sessionStorage.getItem('tutor.after'); if (z) { sessionStorage.removeItem('tutor.after'); location.href = z; return; } } else setTimeout(() => openLogin(), 350); }
  // Angemeldet: keine Startseite, direkt in den eigenen Bereich
  if (getAccount() && (hash === '#/' || hash === '#' || hash === '#/app' || hash === '#/app/')) { history.replaceState(null, '', location.pathname + location.search + '#/app/tutor'); hash = '#/app/tutor'; }
  // Themen-Einstieg (Google-Anzeige: ?thema=…): immer direkt in den großen Tutor-Raum – auch bei englischem Browser
  if (hash === '#/' || hash === '#') {
    const T = landingTopic();
    let done = ''; try { done = sessionStorage.getItem('tutor.themaDone') || ''; } catch (e) {}
    if (T && done !== T.slug) {
      try { sessionStorage.setItem('tutor.themaDone', T.slug); sessionStorage.setItem('tutor.topicHead', T.name); sessionStorage.setItem('tutor.stay', String(Date.now())); } catch (e) {}
      ls.set('tutor.pendingAsk', { t: T.ask, board: T.name === 'BWL' ? L('Dein BWL-Überblick', 'Your business overview') : T.name, show: T.show || `Erklär mir „${T.name}“.`, wait: T.wait || `${T.name} – kommt sofort. Ich bau dir die Tafel jetzt live: erst das Prinzip, dann die Formel, dann ein durchgerechnetes Beispiel.` });
      history.replaceState(null, '', location.pathname + location.search + '#/app/tutor'); hash = '#/app/tutor';
      topicEntry = true;
    }
  }
  const inApp = hash.startsWith('#/app');
  $('#landing').classList.toggle('hidden', inApp);
  $('#app').classList.toggle('hidden', !inApp);
  document.body.style.overflow = inApp ? 'hidden' : '';
  if (inApp) {
    const parts = hash.slice(2).split('/').filter(Boolean);
    await mountApp(parts.slice(1));
  } else {
    document.title = L('BWL Max – dein Tutor für BWL, VWL & Rechnungswesen', 'BWL Max – your tutor for business, economics & accounting');
    if (EN) document.querySelector('meta[name="description"]')?.setAttribute('content', 'Upload your course material – slides, notes or past exams – and learn with BWL Max, the AI tutor that writes on the whiteboard: explanations, quizzes, flashcards, study paths, podcasts and a practice trainer. Free, no sign-up.');
    initLanding();
    import('./assistant.js').then(m => m.mountAssistant && m.mountAssistant()).catch(e => console.warn(e));
  }
  applyThemeButtons();
  // Erst zeigen, wenn alles übersetzt/zerlegt ist – kein kurzes Aufblitzen von Rohtext
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('preload')));
}
addEventListener('hashchange', route);
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (href.startsWith('#/')) return;
  e.preventDefault();
  document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
});
route();
// Angemeldet: Max begrüßt mit Spitznamen (oder fragt einmal danach)
setTimeout(() => {
  if (/^#\/login\//.test(location.hash) || topicEntry) return;   // Thema-Einstieg: keine Begrüßung dazwischen, Max erklärt sofort
  const a = getAccount(); if (!a) return;
  // Spitzname nur lokal (von früher)? Einmal ans Konto hängen, damit er überall gilt
  if (!a.nick && getNick(a)) import('./nick.js').then(m => m.setNick(getNick(a), a)).catch(() => {});
  let asked = false; try { asked = !!localStorage.getItem('tutor.nickAsked'); } catch (e) {}
  if (getNick(a) || asked) greetOnLoad();
  else { try { localStorage.setItem('tutor.nickAsked', '1'); } catch (e) {} askNick(); }
}, 1200);
window.addEventListener('unhandledrejection', e => { console.error(e.reason); });

// ⌘K / Strg+K / „/“: Suche und Befehle
import('./palette.js').then(m => m.bindPalette()).catch(() => {});

// Inner Circle buchbar, sobald Stripe eingerichtet ist; Rückkehr nach 3-D Secure abholen
import('./abo.js').then(async m => {
  m.resumeAbo();
  await m.loadPk();   // Schlüssel beim Start holen – sonst sieht kein neuer Nutzer den Inner Circle als buchbar
  if (!m.aboReady()) return;
  const pb = $('.plan.pro button'); if (!pb) return;
  pb.disabled = false; pb.textContent = L('7 Tage gratis testen', 'Try 7 days free'); pb.addEventListener('click', () => m.openAbo());
  $('.plan.pro .badge')?.remove();
}).catch(() => {});
import('./hint.js').then(m => m.scheduleHint()).catch(() => {});
