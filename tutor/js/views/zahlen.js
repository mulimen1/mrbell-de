// Zahlen – Bens Überblick über BWL Max, direkt in der App (nur für den Admin sichtbar; der Server prüft das Konto).
// Eine Quelle: das Dashboard aus /tutor/zahlen.html wird im Shadow DOM eingebettet – gleiche Anmeldung wie die App,
// kein zweites Login, kein eigener Speicher (das war das Problem der separaten Handy-Web-App).
import { h } from '../util.js';
import { L } from '../i18n.js';

export const ADMIN = ['bendeschler0@gmail.com'];
export const isAdmin = acc => !!(acc && ADMIN.includes(String(acc.email || '').toLowerCase()));

let src = null;
async function source() {
  if (src) return src;
  const html = await (await fetch('/tutor/zahlen.html', { cache: 'no-store' })).text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const css = [...doc.querySelectorAll('style')].map(s => s.textContent).join('\n')
    .replace(/@font-face\s*{[^}]*}/g, '')                         // Schriften lädt die App schon
    .replace(/:root\s*{/g, ':host {')
    .replace(/html,\s*body\s*{/g, ':host {')
    .replace(/(^|\n)body\s*{[^}]*}/g, '')
    .replace(/@media \(max-width:/g, '@container zl (max-width:');  // in der App zählt die Breite des Bereichs, nicht des Fensters
  const script = [...doc.querySelectorAll('script')].map(s => s.textContent).join('\n');
  const head = doc.querySelector('header.top')?.outerHTML || '';
  src = { css, script, head };
  return src;
}

export async function render(root) {
  const host = h('div', { class: 'zl-host' });
  const wrap = h('div', { class: 'view-in zl' }, host);
  root.appendChild(wrap);
  let s;
  try { s = await source(); }
  catch (e) { host.replaceWith(h('div', { class: 'empty' }, h('h2', {}, L('Zahlen gerade nicht erreichbar', 'Numbers unavailable right now')), h('p', {}, L('Lad die Seite gleich nochmal.', 'Reload in a moment.')))); return; }
  if (!wrap.isConnected) return;
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${s.css}
    :host { display: block; background: transparent; --bg: transparent; }
    .top { position: relative; background: none; backdrop-filter: none; -webkit-backdrop-filter: none; border-bottom: 0; }
    .top-in, .wrap { padding-left: 0; padding-right: 0; }
    .wrap { padding-top: 6px; }
    .brand img { display: none; }
    .zlc { container: zl / inline-size; }
  </style><div class="zlc">${s.head}<main class="wrap" id="app"></main></div>`;
  window.__zlStop && window.__zlStop();
  window.__zlRoot = shadow;
  const sc = document.createElement('script');
  sc.textContent = s.script;
  document.head.appendChild(sc);
  sc.remove();
  window.__zlRoot = null;
  return () => { try { window.__zlStop && window.__zlStop(); } catch (e) {} };
}
