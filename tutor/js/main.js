// Einstieg: Landingpage (mit Animationen) + Router
import { $, $$, h, sleep, ico } from './util.js';
import { face } from './face.js';
import { mountApp, startUpload, startSample, topicForm, tryFeature } from './app.js';
import { openLogin, openAccount, verifyLink } from './account.js';
import { onAccount, getAccount } from './api.js';
import { applyThemeButtons } from './theme.js';
import { lines as maxLines } from './max.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Landing ----------
let landingReady = false;
function initLanding() {
  if (landingReady) return; landingReady = true;

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
    const F = [['board', 'Erklärt an der Tafel', 'tutor'], ['quiz', 'Quiz in 6 Formaten', 'quiz'], ['cards', 'Karteikarten', 'karten'], ['path', 'Lernpfad', 'pfad'], ['pod', 'Podcast', 'podcast'], ['brain', 'Lernzettel & Mindmap', 'zettel'], ['mic', 'Sprechen', 'voice'], ['calc', 'BWL-Trainer', 'trainer']];
    F.forEach(([ic, t, key], k) => fr.appendChild(h('button', { class: 'feat', type: 'button', title: 'Ausprobieren', style: { '--k': k }, onclick: () => tryFeature(key) }, h('span', { html: ico(ic) }), t)));
    const fs = [...fr.children]; let fi = 0;
    if (!reduce) setInterval(() => { if (!fr.isConnected || document.hidden) return; fs.forEach((x, k) => x.classList.toggle('hl', k === fi)); fi = (fi + 1) % fs.length; }, 1500);
  }

  // Ohne Skript: Max erklärt ein Thema
  $('#topicSlot')?.appendChild(topicForm());

  // Mit Max sprechen (direkt aus der Sprechblase)
  $$('[data-voice]').forEach(b => b.addEventListener('click', async () => { const { openVoice } = await import('./voice.js'); openVoice({}); }));

  // Anmelden (dezent in der Navigation)
  const nl = $('[data-login]');
  if (nl) { nl.addEventListener('click', () => getAccount() ? openAccount() : openLogin()); onAccount(a => { nl.textContent = a ? 'Konto' : 'Anmelden'; }); }

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
  $$('[data-in]').forEach(el => { const d = reduce ? 0 : 120 + (+el.dataset.in) * 110; setTimeout(() => el.classList.add('in'), d); });

  // Scroll: Erscheinen, Karten fliegen aus verschiedenen Richtungen ein
  $$('.pin.fly').forEach((p, k) => { p.style.setProperty('--fx', (k % 2 ? 1 : -1) * (40 + (k * 37) % 80) + 'px'); p.style.setProperty('--fr', ((k % 3) - 1) * 7 + 'deg'); p.style.transitionDelay = (k % 3) * 90 + 'ms'; });
  $$('.step3.reveal, .privacy li.reveal, .plan.reveal, .faq details.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; });
  // Erscheinen beim Runterscrollen; scrollt man wieder hoch, verschwinden die Elemente unterhalb
  // (nie die, die man gerade sieht) – beim nächsten Runterscrollen erscheinen sie neu.
  // In beide Richtungen: Was oben oder unten ganz aus dem Bild ist, versteckt sich wieder
  // und erscheint neu, sobald man zurückscrollt (von oben kommend fliegt es von oben rein).
  const io = new IntersectionObserver(es => es.forEach(e => {
    const el = e.target;
    if (e.isIntersecting && e.intersectionRatio >= .12) { el.classList.add('in'); return; }
    if (e.isIntersecting || el.matches('details[open]')) return;
    const above = e.boundingClientRect.bottom <= 0;
    if (!above && e.boundingClientRect.top < innerHeight * .9) return;
    el.classList.remove('in'); el.classList.toggle('up', above);
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
  inp.addEventListener('change', () => { if (inp.files[0]) startUpload(inp.files[0]); inp.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', e => { const f = e.dataTransfer?.files?.[0]; if (f) startUpload(f); });
  $$('[data-sample]').forEach(b => b.addEventListener('click', () => startSample()));
}

// ---------- Router ----------
async function route() {
  let hash = location.hash || '#/';
  const lm = hash.match(/^#\/login\/([A-Za-z0-9_-]{20,60})\/(\d{6})$/);
  if (lm) { history.replaceState(null, '', location.pathname + '#/app'); hash = '#/app'; verifyLink(lm[1], lm[2]); }
  const inApp = hash.startsWith('#/app');
  $('#landing').classList.toggle('hidden', inApp);
  $('#app').classList.toggle('hidden', !inApp);
  document.body.style.overflow = inApp ? 'hidden' : '';
  if (inApp) {
    const parts = hash.slice(2).split('/').filter(Boolean);
    await mountApp(parts.slice(1));
  } else {
    document.title = 'BWL Max – dein KI-Tutor für BWL, VWL & Rechnungswesen';
    initLanding();
  }
  applyThemeButtons();
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
window.addEventListener('unhandledrejection', e => { console.error(e.reason); });
