// Semester-/Monatsticket kaufen: eigener Bezahlschritt mit dem Stripe Payment Element (Einmalzahlung, kein Abo).
import { h, ico, toast, ls } from './util.js';
import { getAccount, setAccount, getSession } from './api.js';
import { L, LOCALE } from './i18n.js';

// Öffentlicher Stripe-Schlüssel (pk_…) kommt vom Server, sobald Ben alles eingerichtet hat. Leer = noch nicht buchbar.
const HUB = 'https://hub.mrbell.de/api/bwlmax/';
let PK = window.BM_STRIPE_PK || ls.get('tutor.stripePk', '') || '';
export const aboReady = () => !!PK;
let pkP = null;
export function loadPk(force) {
  if (pkP && !force) return pkP;
  pkP = fetch(HUB + 'stripe/pk', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ session: getSession() || '' }), cache: 'no-store' })   // Sitzung: im Testmodus bekommt nur Ben den Schlüssel
    .then(r => r.json()).then(j => { if (j && j.ok) { PK = j.pk || ''; ls.set('tutor.stripePk', PK); } return PK; })
    .catch(() => PK);
  return pkP;
}
// Abo-Vorgänge laufen über den eigenen Server (Stripe-Schlüssel bleiben dort)
export async function hub(op, extra) {
  let r;
  try { r = await fetch(HUB + 'abo', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(Object.assign({ session: getSession(), op }, extra || {})), cache: 'no-store' }); }
  catch (e) { throw new Error(L('Keine Verbindung. Prüf dein Internet und versuch es nochmal.', 'No connection. Check your internet and try again.')); }
  const j = await r.json().catch(() => null);
  if (!j || !j.ok) throw new Error((j && j.fehler) || L('Das hat gerade nicht geklappt.', 'That didn’t work just now.'));
  return j;
}
export async function cancelAbo() { const r = await hub('cancel'); if (r.account) setAccount(r.account); return r; }
const legal = n => (/(^|\.)bwlmax\.de$/.test(location.hostname) ? '/' + n : '/tutor/legal/' + n + '.html');
const fmtDay = t => new Date(t).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });

let stripeP = null;
function loadStripe() {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (stripeP) return stripeP;
  stripeP = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'https://js.stripe.com/v3/'; s.async = true;
    s.onload = () => (window.Stripe ? res(window.Stripe) : rej(new Error('stripe')));
    s.onerror = () => { stripeP = null; rej(new Error('stripe')); };
    document.head.appendChild(s);
  });
  return stripeP;
}
const dark = () => (document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);

// Tickets: Einmalzahlung, kein Abo – enden von selbst. Preise hier nur zur Anzeige, maßgeblich ist der Server.
export const TICKETS = {
  semester: { name: () => L('Semesterticket', 'Semester ticket'), monate: 6, cent: 4900, dauer: () => L('6 Monate', '6 months'), pro: () => L('≈ 8,17 € im Monat', '≈ €8.17 a month') },
  monat: { name: () => L('Monatsticket', 'Month ticket'), monate: 1, cent: 1199, dauer: () => L('1 Monat', '1 month'), pro: () => L('einmalig', 'one-off') },
};
const eur = c => (c / 100).toFixed(2).replace('.', L(',', '.')) + ' €';
const eurKurz = c => (c % 100 ? eur(c) : (c / 100) + ' €');
// gleicher Tag n Monate später (wie der Server)
function plusMonate(t, n) { const d = new Date(t), tag = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(tag, max)); return d.getTime(); }

// Ticket kaufen: 1) Ticket wählen + Sofortstart bestätigen  2) bezahlen (Stripe Payment Element)
// Der Bestellknopf heißt „Jetzt zahlungspflichtig kaufen“ (§ 312j BGB) – deshalb kein gehostetes Stripe Checkout.
export async function openAbo({ ticket = 'semester' } = {}) {
  await loadPk();
  if (!aboReady()) { toast(L('Die Tickets starten in Kürze.', 'Tickets open soon.')); return; }
  const a = getAccount();
  if (!a) { const m = await import('./account.js'); m.openLogin({ mode: 'register', title: L('Erst ein kostenloses Konto – dann dein Semesterticket', 'Free account first – then your semester ticket') }); return; }

  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape' && !busy) close(); };
  let busy = false, wahl = TICKETS[ticket] ? ticket : 'semester', ok = false;
  const laeuft = a.pro && a.proUntil > Date.now() ? a.proUntil : 0;
  const ab = Math.max(Date.now(), laeuft);
  const bisVon = k => plusMonate(ab, TICKETS[k].monate);
  const x = h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => { if (!busy) close(); } });
  const box = h('div', { class: 'modal tk', role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Semesterticket', 'Semester ticket') });
  const bg = h('div', { class: 'modal-bg tk-bg', onclick: e => { if (e.target === bg && !busy) close(); } }, box);
  document.body.appendChild(bg); document.addEventListener('keydown', onKey);

  const kopf = () => h('div', { class: 'tk-head' },
    h('div', { class: 'tk-eyebrow' }, 'BWL Max'),
    h('h3', { class: 'tk-title' }, L('Dein Ticket fürs Semester', 'Your ticket for the semester')),
    h('p', { class: 'tk-claim' }, h('b', {}, L('Kein Abo. Keine Kündigung.', 'No subscription. Nothing to cancel.')), ' ', L('Endet von selbst.', 'Ends on its own.')));

  // ---------- Schritt 1: Ticket wählen ----------
  function schritt1() {
    const opt = k => {
      const T = TICKETS[k];
      const inp = h('input', { type: 'radio', name: 'tk', value: k, checked: wahl === k ? true : null, onchange: () => { wahl = k; } });
      return h('label', { class: 'tk-opt' + (k === 'semester' ? ' best' : '') }, inp,
        k === 'semester' ? h('span', { class: 'tk-badge' }, L('Bestes Angebot', 'Best value')) : null,
        h('span', { class: 'tk-dot' }),
        h('span', { class: 'tk-main' },
          h('b', { class: 'tk-name' }, T.name()),
          h('small', {}, T.dauer() + ' · ' + L(`gilt bis ${fmtDay(bisVon(k))}`, `valid until ${fmtDay(bisVon(k))}`)),
          k === 'semester' ? h('span', { class: 'tk-spar' }, L(`Du sparst ${eur(6 * TICKETS.monat.cent - T.cent)}`, `You save ${eur(6 * TICKETS.monat.cent - T.cent)}`)) : null),
        h('span', { class: 'tk-perf', 'aria-hidden': 'true' }),
        h('span', { class: 'tk-preis' }, h('b', {}, eurKurz(T.cent)), h('small', {}, T.pro())));
    };
    // Knopf bleibt sichtbar aktiv; ohne Häkchen wird nur das Zustimmungsfeld hervorgehoben (kein blasser Knopf)
    const cb = h('input', { type: 'checkbox', onchange: () => { weiter.setAttribute('aria-disabled', String(!cb.checked)); okBox.classList.remove('nudge'); } });
    const okBox = h('label', { class: 'tk-ok' }, cb, h('span', { class: 'tk-box', 'aria-hidden': 'true', html: ico('check') }), h('span', {}, L('Mein Ticket soll sofort starten. Widerrufe ich innerhalb von 14 Tagen, zahle ich nur den Anteil für die Zeit bis zum Widerruf (', 'I want my ticket to start right away. If I withdraw within 14 days, I only pay for the time until withdrawal ('), h('a', { href: legal('widerruf'), target: '_blank', rel: 'noopener' }, L('Widerrufsbelehrung', 'withdrawal notice')), ').'));
    const weiter = h('button', { class: 'btn primary lg tk-go', type: 'button', 'aria-disabled': 'true', onclick: () => {
      if (!cb.checked) { okBox.classList.remove('nudge'); void okBox.offsetWidth; okBox.classList.add('nudge'); cb.focus(); return; }
      schritt2();
    } }, L('Weiter zur Zahlung', 'Continue to payment'), h('span', { html: ico('right') }));
    box.replaceChildren(x, kopf(),
      laeuft ? h('p', { class: 'tk-note' }, L(`Dein aktuelles Ticket läuft noch bis ${fmtDay(laeuft)} – das neue schließt direkt daran an.`, `Your current ticket runs until ${fmtDay(laeuft)} – the new one starts right after.`)) : null,
      h('div', { class: 'tk-opts', role: 'radiogroup', 'aria-label': L('Ticket wählen', 'Choose a ticket') }, opt('semester'), opt('monat')),
      h('ul', { class: 'tk-feat', 'aria-label': L('Mit Ticket', 'With a ticket') }, [L('Deutlich höhere Tageslimits', 'Much higher daily limits'), L('Probeklausuren im Klausur-Stil', 'Mock exams in real exam style'), L('Längere Podcasts mit echten Stimmen', 'Longer podcasts with real voices'), L('Sync auf allen Geräten', 'Sync on all devices')].map(t => h('li', {}, h('span', { html: ico('check') }), t))),
      okBox,
      weiter,
      h('p', { class: 'abo-small tk-small' }, L('Endpreis – nach § 19 UStG fällt keine Mehrwertsteuer an. Es gelten unsere ', 'Final price – no VAT is charged under § 19 UStG. Our '), h('a', { href: legal('agb'), target: '_blank', rel: 'noopener' }, L('AGB', 'terms')), L('.', ' apply.')));
  }

  // ---------- Schritt 2: bezahlen ----------
  async function schritt2() {
    const T = TICKETS[wahl];
    const pe = h('div', { class: 'abo-pe' }, h('div', { class: 'abo-skel' }), h('div', { class: 'abo-skel' }), h('div', { class: 'abo-skel short' }));
    const err = h('p', { class: 'abo-err', role: 'alert' });
    const bis = h('span', {}, L(`${T.dauer()} · gilt bis ${fmtDay(bisVon(wahl))}`, `${T.dauer()} · valid until ${fmtDay(bisVon(wahl))}`));
    const btn = h('button', { class: 'btn primary lg tk-go abo-buy', type: 'button', disabled: true }, L(`Jetzt zahlungspflichtig kaufen · ${eur(T.cent)}`, `Buy now with obligation to pay · ${eur(T.cent)}`));
    box.replaceChildren(x,
      h('button', { class: 'tk-back', type: 'button', onclick: () => { if (!busy) schritt1(); } }, h('span', { html: ico('left') }), L('Ticket ändern', 'Change ticket')),
      h('div', { class: 'tk-sum' }, h('span', { class: 'tk-dot' }), h('span', { class: 'tk-main' }, h('b', { class: 'tk-name' }, T.name()), h('small', {}, bis)), h('span', { class: 'tk-perf', 'aria-hidden': 'true' }), h('span', { class: 'tk-preis' }, h('b', {}, eur(T.cent)), h('small', {}, L('einmalig · kein Abo', 'one-off · no subscription')))),
      pe, err, btn,
      h('p', { class: 'abo-small tk-small' }, L('Endet von selbst – es wird nichts verlängert und nichts nachträglich abgebucht.', 'Ends on its own – nothing renews and nothing is charged later.')));
    let st;
    try {
      st = await hub('start', { ticket: wahl, zustimmung: true });
      bis.textContent = L(`${T.dauer()} · gilt bis ${fmtDay(st.bis)}`, `${T.dauer()} · valid until ${fmtDay(st.bis)}`);
    } catch (e) { err.textContent = e.message || L('Das hat gerade nicht geklappt.', 'That didn’t work just now.'); pe.replaceChildren(); return; }
    ls.set('tutor.aboSub', { bis: st.bis, name: T.name() });
    let stripe, elements;
    try {
      const Stripe = await loadStripe();
      stripe = Stripe(PK, { locale: document.documentElement.lang === 'en' ? 'en' : 'de' });
      const d = dark();
      elements = stripe.elements({ clientSecret: st.clientSecret, appearance: { theme: d ? 'night' : 'stripe', variables: { colorPrimary: '#f2701d', colorBackground: d ? '#1d140e' : '#fffaf3', colorText: d ? '#fff1e3' : '#1b1510', colorTextSecondary: d ? '#c9ae92' : '#7a6650', borderRadius: '14px', fontFamily: 'Geist, -apple-system, Segoe UI, Helvetica, Arial, sans-serif', spacingUnit: '4px' } } });
      const el = elements.create('payment', { layout: 'tabs' });
      pe.replaceChildren(); el.mount(pe);
      el.on('ready', () => { btn.disabled = false; });
    } catch (e) { err.textContent = L('Der Bezahlschritt lädt gerade nicht. Prüf dein Internet oder versuch es gleich nochmal.', 'The payment step won’t load right now. Check your connection and try again.'); return; }
    btn.addEventListener('click', async () => {
      if (busy) return; busy = true; btn.disabled = true; err.textContent = ''; btn.classList.add('busy');
      const res = await stripe.confirmPayment({ elements, redirect: 'if_required', confirmParams: { return_url: location.origin + location.pathname + '#/app/me' } });
      if (res.error) { busy = false; btn.disabled = false; btn.classList.remove('busy'); err.textContent = res.error.message || L('Die Zahlung hat nicht geklappt.', 'The payment didn’t work.'); return; }
      try {
        await checkAbo({ bis: st.bis });
        ok = true; busy = false;
        box.replaceChildren(
          h('div', { class: 'abo-done tk-done' }, h('div', { class: 'abo-ok tk-okic', html: ico('check') }),
            h('h3', {}, L(`Dein ${T.name()} ist aktiv.`, `Your ${T.name()} is active.`)),
            h('p', {}, L(`Gültig bis ${fmtDay(st.bis)}. Die Bestätigung kommt per E-Mail.`, `Valid until ${fmtDay(st.bis)}. Confirmation is on its way by email.`)),
            h('button', { class: 'btn primary lg tk-go', type: 'button', onclick: close }, L('Los geht’s', 'Let’s go'))));
      } catch (e) { busy = false; err.textContent = L('Bezahlung angekommen, Freischaltung hängt noch kurz. Lad die Seite in einer Minute neu.', 'Payment received, unlocking takes a moment. Reload the page in a minute.'); }
    });
  }
  schritt1();
}

// Nach Bezahlung (auch nach 3-D-Secure-Umleitung): Freischaltung beim Server abholen
export async function checkAbo(erw) {
  erw = erw || ls.get('tutor.aboSub') || {};
  const ziel = erw && erw.bis ? erw.bis - 3 * 864e5 : 0;   // Server rechnet bis Tagesende – kleine Abweichung ist ok
  let r = null;
  for (let i = 0; i < 8; i++) {
    r = await hub('check');
    if (r.account && r.account.pro && (!ziel || (r.account.proUntil || 0) >= ziel)) break;
    await new Promise(x => setTimeout(x, 1500));
  }
  if (r && r.account) setAccount(r.account);
  if (!(r && r.account && r.account.pro && (!ziel || (r.account.proUntil || 0) >= ziel))) throw new Error('pending');
  ls.set('tutor.aboSub', null);
  return r;
}
// Rückkehr von Stripe (3-D Secure): ?setup_intent=…/?payment_intent=… in der URL
export function resumeAbo() {
  const q = new URLSearchParams(location.search);
  if (!(q.get('setup_intent') || q.get('payment_intent')) || !ls.get('tutor.aboSub')) return;
  history.replaceState(null, '', location.pathname + location.hash);
  checkAbo().then(r => { if (r.account?.pro) toast(L('Dein Ticket ist aktiv. Viel Erfolg!', 'Your ticket is active. Good luck!'), 4000); }).catch(() => toast(L('Freischaltung hängt noch kurz – lad die Seite gleich neu.', 'Unlocking takes a moment – reload shortly.')));
}
