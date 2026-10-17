// Zahlen – Bens Überblick über BWL Max, direkt in der App (nur für den Admin sichtbar; der Server prüft das Konto).
// Eine Quelle: das Dashboard aus /tutor/zahlen.html wird im Shadow DOM eingebettet – gleiche Anmeldung wie die App,
// kein zweites Login, kein eigener Speicher (das war das Problem der separaten Handy-Web-App).
import { h, ico, modal, toast } from '../util.js';
import { getSession } from '../api.js';
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

// ---------- Bezahlung (Stripe) – nur Ben: Schlüssel selbst eintragen, Rest richtet der Server ein ----------
const HUB = 'https://hub.mrbell.de/api/bwlmax/stripe/';
async function hubPost(p, b) {
  const r = await fetch(HUB + p, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(Object.assign({ session: getSession() }, b || {})), cache: 'no-store' });
  const j = await r.json().catch(() => null);
  if (!j) throw new Error(L('Server gerade nicht erreichbar.', 'Server unreachable right now.'));
  return j;
}
function payCard() {
  const card = h('section', { class: 'zl-pay' });
  const paint = st => {
    if (!st || !st.ok) { card.hidden = !st || st.fehler === 'kein Zugriff'; if (st && !card.hidden) card.replaceChildren(h('div', { class: 'zp-row' }, h('span', { class: 'zp-ic', html: ico('lock') }), h('div', { class: 'zp-tx' }, h('b', {}, L('Bezahlung', 'Payments')), h('small', {}, st.fehler || '')))); return; }
    card.hidden = false;
    const step = (on, t) => h('span', { class: 'zp-step' + (on ? ' on' : '') }, h('i', { html: on ? ico('check') : '' }), t);
    card.classList.toggle('ready', !!st.bereit);
    card.replaceChildren(
      h('div', { class: 'zp-row' },
        h('span', { class: 'zp-ic', html: ico(st.bereit ? 'check' : 'lock') }),
        h('div', { class: 'zp-tx' },
          h('b', {}, st.bereit ? L('Inner Circle ist buchbar', 'Inner Circle is live') : L('Bezahlung einrichten', 'Set up payments')),
          h('small', {}, st.bereit ? [st.konto || 'Stripe', st.mode === 'test' ? L('Testmodus', 'test mode') : 'live', st.preis, L(`${st.test} Tage Test mit Karte`, `${st.test}-day trial with card`)].filter(Boolean).join(' · ')
            : L('Trag einmal deine zwei Stripe-Schlüssel ein – Produkt, Preis und Benachrichtigungen lege ich dann automatisch an.', 'Enter your two Stripe keys once – I’ll create product, price and notifications automatically.'))),
        h('div', { class: 'zp-act' },
          st.sk ? h('button', { class: 'btn sm ghost', type: 'button', onclick: async e => { e.currentTarget.disabled = true; try { paint(await hubPost('setup')); toast(L('Geprüft.', 'Checked.')); } catch (x) { toast(x.message); } } }, L('Prüfen', 'Check')) : null,
          h('button', { class: 'btn sm' + (st.sk ? ' ghost' : ' primary'), type: 'button', onclick: () => keys(paint) }, st.sk ? L('Schlüssel ändern', 'Change keys') : L('Schlüssel eintragen', 'Enter keys')))),
      st.bereit ? null : h('div', { class: 'zp-steps' }, step(st.pk && st.sk, L('Schlüssel', 'Keys')), step(st.produkt, L('Produkt 7,99 €', 'Product €7.99')), step(st.webhook, L('Benachrichtigung', 'Webhook')), step(st.pro, L('Freischaltung', 'Unlocking'))));
  };
  hubPost('status').then(paint).catch(() => { card.hidden = true; });
  card.hidden = true;
  return card;
}
async function keys(paint) {
  const inp = (ph, name) => h('input', { class: 'field zp-in', type: 'password', name, placeholder: ph, autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off' });
  const pk = inp('pk_live_…', 'pk'), sk = inp('sk_live_…', 'sk');
  const err = h('p', { class: 'zp-err', role: 'alert' });
  const body = h('div', { class: 'zp-form' },
    h('p', { class: 'zp-help' }, L('In Stripe: unten links ', 'In Stripe: bottom left '), h('b', {}, L('Entwickler/innen → API-Schlüssel', 'Developers → API keys')), L('. Beide kopieren und hier einfügen. Sie gehen direkt verschlüsselt an deinen Server und werden nie wieder angezeigt.', '. Copy both and paste them here. They go straight to your server, encrypted in transit, and are never shown again.')),
    h('label', {}, h('span', {}, L('Veröffentlichbarer Schlüssel', 'Publishable key')), pk),
    h('label', {}, h('span', {}, L('Geheimer Schlüssel', 'Secret key')), sk), err);
  const r = await modal({ cls: 'ik-modal zp-modal', eyebrow: 'Stripe', title: L('Schlüssel eintragen', 'Enter keys'), body,
    actions: [{ label: L('Abbrechen', 'Cancel'), value: null }, { label: L('Speichern & einrichten', 'Save & set up'), value: 'ok', primary: true }],
    onAction: v => {
      if (v !== 'ok') return true;
      const b = { pk: pk.value.trim(), sk: sk.value.trim() };
      if (!b.pk || !b.sk) { err.textContent = L('Bitte beide Schlüssel einfügen.', 'Please paste both keys.'); return false; }
      const btn = document.querySelector('.zp-modal .btn.primary'); if (btn) { btn.disabled = true; btn.textContent = L('Richte ein …', 'Setting up …'); }
      hubPost('keys', b).then(j => {
        pk.value = ''; sk.value = '';
        if (!j.ok) { err.textContent = j.fehler || L('Das hat nicht geklappt.', 'That didn’t work.'); if (btn) { btn.disabled = false; btn.textContent = L('Speichern & einrichten', 'Save & set up'); } if (j.pk !== undefined) paint(j); return; }
        paint(j); document.querySelector('.zp-modal')?.closest('.modal-bg')?.remove();
        toast(j.bereit ? L('Fertig – der Inner Circle ist jetzt buchbar.', 'Done – the Inner Circle is now live.') : L('Gespeichert.', 'Saved.'), 4200);
        import('../abo.js').then(m => m.loadPk(true)).catch(() => {});
      }).catch(x => { err.textContent = x.message; if (btn) { btn.disabled = false; btn.textContent = L('Speichern & einrichten', 'Save & set up'); } });
      return false;
    } });
  pk.value = ''; sk.value = '';
  return r;
}

export async function render(root) {
  const host = h('div', { class: 'zl-host' });
  const wrap = h('div', { class: 'view-in zl' }, payCard(), host);
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
