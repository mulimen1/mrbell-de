// Einstieg: Landingpage + Router
import { $, $$, h, ico, ls, sleep, toast } from './util.js';
import { face } from './face.js';
import { mountApp, startUpload, startSample } from './app.js';
import { applyThemeButtons } from './theme.js';

// ---------- Landing ----------
let landingReady = false;
function initLanding() {
  if (landingReady) return; landingReady = true;
  $$('#landing [data-face]').forEach(el => face(el));
  const heroFace = $('[data-face="hero"]')?.face;
  // Begrüßung tippen
  const g = $('#greet');
  const lines = ['Hey. Wie kann ich dir heute helfen?', 'Welche Vorlesung nehmen wir uns vor?', 'Klausur bald? Lass uns anfangen.'];
  let li = 0;
  (async function type() {
    while (g.isConnected) {
      const t = lines[li++ % lines.length];
      for (let i = 0; i <= t.length; i++) { g.innerHTML = ''; g.append(t.slice(0, i), h('span', { class: 'cur' })); await sleep(34 + Math.random() * 30); }
      await sleep(3200);
      for (let i = t.length; i >= 0; i -= 2) { g.innerHTML = ''; g.append(t.slice(0, i), h('span', { class: 'cur' })); await sleep(14); }
      await sleep(300);
    }
  })();
  // Wellen im Podcast-Pin
  const w = $('.pin .wave'); if (w) for (let i = 0; i < 38; i++) w.appendChild(h('i', { style: { '--h': (25 + Math.random() * 75) + '%', animationDelay: (i * 47 % 900) + 'ms' } }));
  // Einblenden beim Scrollen
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  addEventListener('scroll', () => $('#nav')?.classList.toggle('scrolled', scrollY > 8), { passive: true });
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
    const parts = hash.slice(2).split('/').filter(Boolean); // ['app', id|'trainer', tab]
    await mountApp(parts.slice(1));
  } else {
    initLanding();
    if (hash.length > 2 && !hash.startsWith('#/')) { const t = document.getElementById(hash.slice(1)); t && t.scrollIntoView(); }
  }
  applyThemeButtons();
}
addEventListener('hashchange', route);
// Anker-Links der Landingpage (#funktionen) nicht als Route behandeln
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
