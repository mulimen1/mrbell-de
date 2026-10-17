// Inner Circle abschließen: eigener Bezahlschritt mit dem Stripe Payment Element.
// Der Bestellbutton heißt „Jetzt zahlungspflichtig abonnieren“ (§ 312j BGB) – deshalb kein gehostetes Stripe Checkout.
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

export async function openAbo() {
  await loadPk();
  if (!aboReady()) { toast(L('Der Inner Circle startet in Kürze.', 'The Inner Circle opens soon.')); return; }
  const a = getAccount();
  if (!a) { const m = await import('./account.js'); m.openLogin({ mode: 'register', title: L('Erst ein kostenloses Konto – dann geht’s in den Inner Circle', 'Free account first – then into the Inner Circle') }); return; }
  if (a.pro && a.sub) { toast(L('Du bist schon im Inner Circle.', 'You’re already in the Inner Circle.')); return; }

  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape' && !busy) close(); };
  let busy = false;
  const pe = h('div', { class: 'abo-pe' }, h('div', { class: 'abo-skel' }), h('div', { class: 'abo-skel' }), h('div', { class: 'abo-skel short' }));
  const err = h('p', { class: 'abo-err', role: 'alert' });
  // Sofort sichtbar: heute 0,00 €, Abbuchung erst nach 7 Tagen – der Server bestätigt das gleich (ohne Test: 7,99 €)
  const today = h('b', {}, '0,00 €'), later = h('span', {}, L(`Ab ${fmtDay(Date.now() + 7 * 864e5)}`, `From ${fmtDay(Date.now() + 7 * 864e5)}`)), laterVal = h('b', {}, '7,99 € / ' + L('Monat', 'month'));
  const trialNote = h('p', { class: 'abo-small' });
  const btn = h('button', { class: 'btn primary lg abo-buy ic-btn', type: 'button', disabled: true }, L('Jetzt zahlungspflichtig abonnieren', 'Subscribe now with obligation to pay'));
  const box = h('div', { class: 'modal abo', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Max’s Inner Circle' },
    h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => { if (!busy) close(); } }),
    h('div', { class: 'eyebrow' }, L('7 Tage kostenlos testen', 'Try 7 days free')),
    h('h3', { class: 'ic-name' }, 'Max’s Inner Circle'),
    h('ul', { class: 'abo-feat' }, [L('Max ohne Limit (Fair Use)', 'Max without limits (fair use)'), L('Probeklausuren im Klausur-Stil', 'Mock exams in real exam style'), L('Längere Podcasts mit echten Stimmen', 'Longer podcasts with real voices'), L('Sync über alle Geräte', 'Sync across all devices')].map(t => h('li', {}, h('span', { html: ico('check') }), t))),
    h('div', { class: 'abo-price' },
      h('div', {}, h('span', {}, L('Heute', 'Today')), today),
      h('div', {}, later, laterVal),
      h('small', {}, L('Endpreis. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', 'Final price. No VAT charged under § 19 UStG (small business).'))),
    pe, err,
    trialNote,
    h('p', { class: 'abo-small' }, L('Es gelten unsere ', 'Our '), h('a', { href: legal('agb'), target: '_blank', rel: 'noopener' }, L('AGB', 'terms')), L('. Infos zu deinem Widerrufsrecht stehen in der ', ' apply. Information on your right of withdrawal is in the '), h('a', { href: legal('widerruf'), target: '_blank', rel: 'noopener' }, L('Widerrufsbelehrung', 'withdrawal notice')), '.'),
    btn);
  const bg = h('div', { class: 'modal-bg', onclick: e => { if (e.target === bg && !busy) close(); } }, box);
  document.body.appendChild(bg); document.addEventListener('keydown', onKey);

  let st;
  try {
    st = await hub('start');
    if (st.already) { if (st.account) setAccount(st.account); close(); toast(L('Du bist schon im Inner Circle.', 'You’re already in the Inner Circle.')); return; }
    if (!st.trialEnd) box.querySelector('.eyebrow').textContent = L('Monatlich kündbar', 'Cancel monthly');
  } catch (e) { err.textContent = e.message || L('Das hat gerade nicht geklappt.', 'That didn’t work just now.'); pe.replaceChildren(); return; }
  const trialEnd = st.trialEnd ? st.trialEnd * 1000 : 0;
  today.textContent = trialEnd ? '0,00 €' : '7,99 €';
  later.textContent = trialEnd ? L(`Ab ${fmtDay(trialEnd)}`, `From ${fmtDay(trialEnd)}`) : L('Danach jeden Monat', 'Then every month');
  trialNote.textContent = trialEnd
    ? L(`Kündigst du bis zum ${fmtDay(trialEnd)}, zahlst du nichts – die Inner-Circle-Vorteile enden dann sofort mit der Kündigung. Danach monatlich zum Monatsende kündbar.`, `Cancel by ${fmtDay(trialEnd)} and you pay nothing – Inner Circle benefits end immediately when you cancel. After that, cancel any time at the end of the month.`)
    : L('Monatlich zum Monatsende kündbar.', 'Cancel any time at the end of the month.');
  ls.set('tutor.aboSub', st.sub);

  let stripe, elements;
  try {
    const Stripe = await loadStripe();
    stripe = Stripe(PK, { locale: document.documentElement.lang === 'en' ? 'en' : 'de' });
    const d = dark();
    elements = stripe.elements({ clientSecret: st.clientSecret, appearance: { theme: d ? 'night' : 'stripe', variables: { colorPrimary: d ? '#f5f5f5' : '#0a0a0a', colorBackground: d ? '#0b0b0c' : '#ffffff', colorText: d ? '#f5f5f5' : '#0a0a0a', borderRadius: '14px', fontFamily: 'Geist, -apple-system, Segoe UI, Helvetica, Arial, sans-serif', spacingUnit: '4px' } } });
    const el = elements.create('payment', { layout: 'tabs' });
    pe.replaceChildren(); el.mount(pe);
    el.on('ready', () => { btn.disabled = false; });
  } catch (e) { err.textContent = L('Der Bezahlschritt lädt gerade nicht. Prüf dein Internet oder versuch es gleich nochmal.', 'The payment step won’t load right now. Check your connection and try again.'); return; }

  btn.addEventListener('click', async () => {
    if (busy) return; busy = true; btn.disabled = true; err.textContent = ''; btn.classList.add('busy');
    const confirmParams = { return_url: location.origin + location.pathname + '#/app/me' };
    const res = st.mode === 'setup'
      ? await stripe.confirmSetup({ elements, redirect: 'if_required', confirmParams })
      : await stripe.confirmPayment({ elements, redirect: 'if_required', confirmParams });
    if (res.error) { busy = false; btn.disabled = false; btn.classList.remove('busy'); err.textContent = res.error.message || L('Die Zahlung hat nicht geklappt.', 'The payment didn’t work.'); return; }
    try {
      await checkAbo(st.sub);
      box.replaceChildren(
        h('div', { class: 'abo-done' }, h('div', { class: 'abo-ok', html: ico('check') }),
          h('h3', {}, L('Willkommen im Inner Circle.', 'Welcome to the Inner Circle.')),
          h('p', {}, trialEnd ? L(`Dein Test läuft bis zum ${fmtDay(trialEnd)}. Die Bestätigung kommt per E-Mail.`, `Your trial runs until ${fmtDay(trialEnd)}. Confirmation is on its way by email.`) : L('Die Bestätigung kommt per E-Mail.', 'Confirmation is on its way by email.')),
          h('button', { class: 'btn primary lg', type: 'button', onclick: close }, L('Los geht’s', 'Let’s go'))));
    } catch (e) { busy = false; err.textContent = L('Bezahlung angekommen, Freischaltung hängt noch kurz. Lad die Seite in einer Minute neu.', 'Payment received, unlocking takes a moment. Reload the page in a minute.'); }
  });
}

// Nach Bezahlung (auch nach 3-D-Secure-Umleitung): Freischaltung beim Server abholen
export async function checkAbo(sub) {
  // Stripe hängt die Karte ein paar Sekunden später ans Abo – kurz nachfassen, bis die Freischaltung da ist
  let r = null;
  for (let i = 0; i < 6; i++) {
    r = await hub('check', { sub: sub || ls.get('tutor.aboSub') });
    if (r.account && r.account.pro) break;
    await new Promise(x => setTimeout(x, 1500));
  }
  if (r && r.account) setAccount(r.account);
  if (!(r && r.account && r.account.pro)) throw new Error('pending');
  ls.set('tutor.aboSub', null);
  return r;
}
// Rückkehr von Stripe (3-D Secure): ?setup_intent=…/?payment_intent=… in der URL
export function resumeAbo() {
  const q = new URLSearchParams(location.search);
  if (!(q.get('setup_intent') || q.get('payment_intent')) || !ls.get('tutor.aboSub')) return;
  history.replaceState(null, '', location.pathname + location.hash);
  checkAbo().then(r => { if (r.account?.pro) toast(L('Willkommen im Inner Circle.', 'Welcome to the Inner Circle.'), 4000); }).catch(() => toast(L('Freischaltung hängt noch kurz – lad die Seite gleich neu.', 'Unlocking takes a moment – reload shortly.')));
}
