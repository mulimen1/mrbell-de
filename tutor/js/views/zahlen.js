// Zahlen – Bens Überblick über BWL Max, direkt in der App (nur für den Admin sichtbar; der Server prüft das Konto).
// Eine Quelle: das Dashboard aus /tutor/zahlen.html wird im Shadow DOM eingebettet – gleiche Anmeldung wie die App,
// kein zweites Login, kein eigener Speicher (das war das Problem der separaten Handy-Web-App).
import { h, ico, modal, toast } from '../util.js';
import { getSession, ask } from '../api.js';
import { ls } from '../util.js';
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
      st.bereit ? null : h('div', { class: 'zp-steps' }, step(st.pk && st.sk, L('Schlüssel', 'Keys')), step(st.produkt, L('Produkt 11,99 €', 'Product €11.99')), step(st.webhook, L('Benachrichtigung', 'Webhook')), step(st.pro, L('Freischaltung', 'Unlocking'))));
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

// ---------- Promocodes (nur Ben; gespeichert und geprüft auf dem Server) ----------
const dIn = ts => ts ? new Date(ts - new Date(ts).getTimezoneOffset() * 6e4).toISOString().slice(0, 10) : '';
const dOut = (v, end) => v ? Date.parse(v + (end ? 'T23:59:59' : 'T00:00:00')) : 0;
const dShow = ts => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: '2-digit' });
function promoCard() {
  const card = h('section', { class: 'zl-pc', hidden: true });
  let codes = [], editing = null;
  const run = async (opts) => { const r = await ask('promoadmin', { opts }); codes = r.codes || []; return r; };
  const form = c => {
    const isNew = !c;
    const f = { code: h('input', { value: c ? c.code : '', disabled: !isNew, placeholder: 'z. B. UNI7', maxlength: 24, autocapitalize: 'characters' }),
      name: h('input', { value: c ? c.name : '', placeholder: L('Uni / Community', 'University / community'), maxlength: 60 }),
      days: h('input', { type: 'number', min: 1, max: 90, value: c ? c.days : 7 }),
      max: h('input', { type: 'number', min: 0, value: c && c.max ? c.max : '', placeholder: L('unbegrenzt', 'unlimited') }),
      from: h('input', { type: 'date', value: c ? dIn(c.from) : '' }),
      to: h('input', { type: 'date', value: c ? dIn(c.to) : '' }),
      active: h('input', { type: 'checkbox', checked: c ? c.active : false }) };
    const err = h('p', { class: 'zp-err', role: 'alert' });
    const lab = (t, el) => h('label', { class: 'pc-f' }, h('span', {}, t), el);
    const save = h('button', { class: 'btn primary sm', type: 'submit' }, isNew ? L('Code anlegen', 'Create code') : L('Speichern', 'Save'));
    return h('form', { class: 'pc-form', onsubmit: async e => {
      e.preventDefault(); err.textContent = ''; save.disabled = true;
      try { await run({ op: 'save', isNew, code: f.code.value, name: f.name.value, days: +f.days.value, max: +f.max.value || 0, from: dOut(f.from.value), to: dOut(f.to.value, true), active: f.active.checked }); editing = null; paint(); }
      catch (x) { err.textContent = x.message || L('Hat nicht geklappt.', 'That didn’t work.'); save.disabled = false; }
    } },
      h('div', { class: 'pc-grid' }, lab(L('Code', 'Code'), f.code), lab(L('Name / Uni', 'Name / university'), f.name), lab(L('Pro-Tage', 'Pro days'), f.days), lab(L('Max. Einlösungen', 'Max. redemptions'), f.max), lab(L('Gültig ab', 'Valid from'), f.from), lab(L('Gültig bis', 'Valid until'), f.to)),
      h('label', { class: 'pc-act' }, f.active, h('span', {}, L('Aktiv – Code funktioniert sofort', 'Active – code works right away'))),
      err, h('div', { class: 'pc-btns' }, h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { editing = null; paint(); } }, L('Abbrechen', 'Cancel')), save));
  };
  const state = c => !c.active ? L('Aus', 'Off') : c.to && Date.now() > c.to ? L('Abgelaufen', 'Expired') : c.from && Date.now() < c.from ? L('Geplant', 'Scheduled') : c.max && c.n >= c.max ? L('Ausgeschöpft', 'Used up') : L('Aktiv', 'Active');
  const paint = () => {
    card.hidden = false;
    card.replaceChildren(
      h('div', { class: 'zf-h' }, h('b', {}, L('Promocodes', 'Promo codes')), h('small', {}, codes.length ? L(`${codes.length} Codes · ${codes.reduce((s, c) => s + c.n, 0)} Einlösungen`, `${codes.length} codes · ${codes.reduce((s, c) => s + c.n, 0)} redemptions`) : L('Noch keine – leg einen an, sobald eine Uni-Community zusagt.', 'None yet – create one once a university community agrees.')),
        editing ? null : h('button', { class: 'btn sm primary pc-new', type: 'button', onclick: () => { editing = 'new'; paint(); } }, L('+ Neuer Code', '+ New code'))),
      editing === 'new' ? form(null) : null,
      codes.length ? h('div', { class: 'pc-list' }, codes.map(c => editing === c.code ? form(c) : h('div', { class: 'pc-it' + (c.active ? '' : ' off') },
        h('div', { class: 'pc-top' }, h('b', { class: 'pc-code' }, c.code), h('span', { class: 'pc-st' }, state(c)), h('span', { class: 'pc-n' }, L(`${c.n}${c.max ? ' / ' + c.max : ''} eingelöst`, `${c.n}${c.max ? ' / ' + c.max : ''} redeemed`))),
        h('small', {}, [c.name, L(`${c.days} Tage Pro`, `${c.days} days Pro`), c.from ? L('ab ', 'from ') + dShow(c.from) : null, c.to ? L('bis ', 'until ') + dShow(c.to) : null, c.last ? L('zuletzt ', 'last ') + dShow(c.last) : null].filter(Boolean).join(' · ')),
        h('div', { class: 'pc-btns' },
          h('button', { class: 'btn sm ghost', type: 'button', onclick: async e => { e.target.disabled = true; try { await run({ op: 'toggle', code: c.code }); } catch (x) { toast(x.message); } paint(); } }, c.active ? L('Deaktivieren', 'Deactivate') : L('Aktivieren', 'Activate')),
          h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { editing = c.code; paint(); } }, L('Bearbeiten', 'Edit')),
          c.n ? null : h('button', { class: 'btn sm ghost', type: 'button', onclick: async () => { try { await run({ op: 'del', code: c.code }); } catch (x) { toast(x.message); } paint(); } }, L('Löschen', 'Delete')))))) : null);
  };
  run({ op: 'list' }).then(paint).catch(() => {});
  return card;
}

// ---------- Feedback – Ben liest jedes einzelne ----------
const KIND = { fehlt: L('Fehlt', 'Missing'), nervt: L('Nervt', 'Annoying'), idee: L('Idee', 'Idea'), lob: L('Lob', 'Praise'), bewertung: L('Bewertung', 'Rating') };
function fbCard() {
  const card = h('section', { class: 'zl-fb', hidden: true });
  let all = [], open = false;
  const seen = +ls.get('zahlen.fbSeen', 0) || 0;
  const paint = () => {
    const neu = all.filter(x => Date.parse(x.at) > seen).length;
    const list = open ? all : all.slice(0, 4);
    card.hidden = false;
    card.replaceChildren(
      h('div', { class: 'zf-h' }, h('b', {}, 'Feedback'), h('small', {}, all.length ? L(`${all.length} insgesamt`, `${all.length} total`) + (neu ? L(` · ${neu} neu`, ` · ${neu} new`) : '') : L('Noch keins – kommt, sobald die ersten Nutzer schreiben.', 'None yet – it’ll come once the first users write.'))),
      all.length ? h('div', { class: 'zf-list' }, list.map(x => h('div', { class: 'zf-it' + (Date.parse(x.at) > seen ? ' neu' : '') },
        h('div', { class: 'zf-top' }, h('span', { class: 'zf-k' }, KIND[x.kind || 'bewertung'] || x.kind), x.stars ? h('span', { class: 'zf-s' }, '★'.repeat(x.stars)) : null,
          h('span', { class: 'zf-d' }, new Date(x.at).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))),
        x.text ? h('p', {}, x.text) : null,
        x.name || x.info ? h('small', {}, [x.name, x.info].filter(Boolean).join(' · ') + (x.consent ? L(' · darf auf die Website', ' · may go on the website') : '')) : null))) : null,
      all.length > 4 ? h('button', { class: 'btn sm ghost zf-more', type: 'button', onclick: () => { open = !open; paint(); } }, open ? L('Weniger', 'Less') : L(`Alle ${all.length} anzeigen`, `Show all ${all.length}`)) : null);
    ls.set('zahlen.fbSeen', Date.now());
  };
  ask('feedbacklist', { opts: {} }).then(r => { all = (r.data || []).slice().sort((a, b) => Date.parse(b.at) - Date.parse(a.at)); paint(); }).catch(() => {});
  return card;
}

export async function render(root) {
  const host = h('div', { class: 'zl-host' });
  const wrap = h('div', { class: 'view-in zl' }, payCard(), promoCard(), host, fbCard());
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
