// Einstieg: Landingpage (mit Animationen) + Router
import { $, $$, h, sleep } from './util.js';
import { face } from './face.js';
import { mountApp, startUpload, startSample } from './app.js';
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

  // Begrüßung tippen
  const g = $('#greet');
  const lines = maxLines('greet');
  let li = 0;
  (async function type() {
    await sleep(900);
    while (g.isConnected) {
      const t = lines[li++ % lines.length];
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
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
  }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
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
  const hero = $('#hero');
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); hero.style.setProperty('--mx', (e.clientX - r.left) + 'px'); hero.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });

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
  const hash = location.hash || '#/';
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
