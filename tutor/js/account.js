// Konto: Anmeldung per E-Mail-Code (kein Passwort). Neues Konto = 7 Tage Pro.
// Gespeichert wird beim Server nur die E-Mail-Adresse. Skripte bleiben auf dem Gerät.
import { h, ico, toast, ls, modal } from './util.js';
import { ask, setAccount, getAccount, onAccount, getSession } from './api.js';
import { face } from './face.js';
import { L, LOCALE } from './i18n.js';

const fmtDate = ts => new Date(ts).toLocaleDateString(LOCALE, { day: 'numeric', month: L('numeric', 'short') });
export const proDaysLeft = a => (a && a.pro) ? Math.max(1, Math.ceil((a.proUntil - Date.now()) / 864e5)) : 0;

function shell() {
  const bg = h('div', { class: 'modal-bg' });
  const box = h('div', { class: 'modal login', role: 'dialog', 'aria-modal': 'true' });
  const fEl = h('div', { class: 'lface' });
  bg.appendChild(box); document.body.appendChild(bg);
  const fc = face(fEl, {});
  return { bg, box, fEl, fc };
}

export function openLogin({ title } = {}) {
  return new Promise(resolve => {
    const { bg, box, fEl, fc } = shell();
    const close = v => { bg.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(false); };
    document.addEventListener('keydown', onKey);
    bg.addEventListener('click', e => { if (e.target === bg) close(false); });
    const x = () => h('button', { class: 'iconbtn lx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close(false) });
    let email = ls.get('tutor.lastEmail', '');

    const step1 = () => {
      const inp = h('input', { class: 'field', type: 'email', autocomplete: 'email', inputmode: 'email', placeholder: L('du@uni.de', 'you@uni.ac.uk'), value: email, 'aria-label': L('E-Mail-Adresse', 'Email address'), required: true });
      const btn = h('button', { class: 'btn primary', type: 'submit' }, L('Code schicken', 'Send code'));
      const err = h('div', { class: 'lerr', role: 'alert' });
      const form = h('form', { class: 'lform' }, inp, btn);
      form.addEventListener('submit', async e => {
        e.preventDefault(); email = inp.value.trim(); if (!email) return;
        btn.disabled = true; btn.textContent = L('Sende …', 'Sending …'); err.textContent = ''; fc.set('think');
        try { const r = await ask('login', { opts: { email } }); ls.set('tutor.lastEmail', email); step2(r.isNew); }
        catch (e2) { fc.pulse('sad'); err.textContent = e2.message; btn.disabled = false; btn.textContent = L('Code schicken', 'Send code'); }
      });
      box.replaceChildren(x(), fEl, h('h3', {}, title || L('Kostenlos anmelden', 'Sign in for free')),
        h('p', {}, L('Kein Passwort, kein Newsletter. Du bekommst einen Code per Mail – und fürs neue Konto ', 'No password, no newsletter. You get a code by email – and a new account comes with '), h('b', {}, L('7 Tage Pro', '7 days of Pro')), L(' geschenkt.', ' on the house.')),
        form, err,
        h('div', { class: 'lfine' }, h('span', { html: ico('lock') }), L('Wir speichern nur deine E-Mail-Adresse. Deine Skripte bleiben auf deinem Gerät.', 'We only store your email address. Your slides stay on your device.')));
      fc.set('idle');
      setTimeout(() => inp.focus(), 60);
    };

    const step2 = () => {
      const inp = h('input', { class: 'field code', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: 6, placeholder: '······', 'aria-label': L('Code aus der E-Mail', 'Code from the email') });
      const err = h('div', { class: 'lerr', role: 'alert' });
      const again = h('button', { class: 'btn sm ghost', type: 'button', disabled: true }, L('Neuen Code schicken', 'Send a new code'));
      let busy = false;
      const go = async () => {
        const code = inp.value.replace(/\D/g, '');
        if (code.length < 6 || busy) return;
        busy = true; inp.disabled = true; fc.set('think'); err.textContent = '';
        try {
          const r = await ask('verify', { opts: { email, code } });
          setAccount(r.account, r.session);
          success(r);
        } catch (e) {
          busy = false; inp.disabled = false; inp.value = ''; fc.pulse('sad'); err.textContent = e.message;
          inp.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 300 });
          if (e.code === 'code_expired') again.disabled = false;
          inp.focus();
        }
      };
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 6); if (inp.value.length === 6) go(); });
      again.addEventListener('click', async () => {
        again.disabled = true;
        try { await ask('login', { opts: { email } }); toast(L('Neuer Code ist unterwegs.', 'A new code is on its way.')); } catch (e) { err.textContent = e.message; }
        setTimeout(() => { again.disabled = false; }, 30000);
      });
      setTimeout(() => { again.disabled = false; }, 30000);
      box.replaceChildren(x(), fEl, h('h3', {}, L('Check dein Postfach', 'Check your inbox')),
        h('p', {}, L('Der Code ist unterwegs an ', 'The code is on its way to '), h('b', {}, email), L('. Nichts da? Schau kurz im Spam-Ordner.', '. Nothing there? Take a quick look in your spam folder.')),
        inp, err,
        h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('button', { class: 'btn sm ghost', type: 'button', onclick: step1 }, L('Andere E-Mail', 'Different email')), again));
      fc.set('idle');
      setTimeout(() => inp.focus(), 60);
    };

    const success = r => {
      fc.set('happy');
      box.replaceChildren(fEl, h('h3', {}, r.fresh ? L('Willkommen im Club.', 'Welcome to the club.') : L('Da bist du ja wieder.', 'There you are again.')),
        h('p', {}, r.fresh
          ? L(`7 Tage Pro – geht aufs Haus. Also auf Papas. Bis ${fmtDate(r.account.proUntil)} lernst du ohne Tageslimit.`, `7 days of Pro – on the house. Well, on Papa’s. Until ${fmtDate(r.account.proUntil)} you learn with no daily limit.`)
          : r.account.pro ? L(`Pro läuft noch bis ${fmtDate(r.account.proUntil)}.`, `Pro runs until ${fmtDate(r.account.proUntil)}.`) : L('Du bist angemeldet.', 'You’re signed in.')),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => close(true) }, L('Los geht’s', 'Let’s go'))));
      setTimeout(() => box.querySelector('.btn.primary')?.focus(), 60);
    };

    step1();
  });
}

// Link aus der Mail: #/login/<ek>/<code>
export async function verifyLink(ek, code) {
  try {
    const r = await ask('verify', { opts: { ek, code } });
    setAccount(r.account, r.session);
    toast(r.fresh ? L('Willkommen im Club. 7 Tage Pro gehen aufs Haus.', 'Welcome to the club. 7 days of Pro are on the house.') : L('Angemeldet. Schön, dass du wieder da bist.', 'Signed in. Good to have you back.'), 4000);
    return true;
  } catch (e) {
    toast(e.message || L('Der Link hat nicht geklappt.', 'The link didn’t work.'), 4000);
    return false;
  }
}

export async function openAccount() {
  const a = getAccount();
  if (!a) return openLogin();
  const body = h('div', { class: 'accbox' },
    h('div', { class: 'accrow' }, h('span', {}, L('E-Mail', 'Email')), h('b', {}, a.email)),
    h('div', { class: 'accrow' }, h('span', {}, L('Tarif', 'Plan')), h('b', {}, a.pro ? L(`Pro · noch ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'Tag' : 'Tage'} (bis ${fmtDate(a.proUntil)})`, `Pro · ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'day' : 'days'} left (until ${fmtDate(a.proUntil)})`) : L('Free · 40 Einheiten pro Tag', 'Free · 40 credits per day'))),
    h('div', { class: 'accrow' }, h('span', {}, L('Dabei seit', 'Member since')), h('b', {}, new Date(a.since).toLocaleDateString(LOCALE))));
  const r = await modal({ title: L('Dein Konto', 'Your account'), text: L('Dein Lernstand liegt weiter auf diesem Gerät. Gespeichert ist bei uns nur deine E-Mail-Adresse.', 'Your progress stays on this device. All we store is your email address.'), body,
    actions: [{ label: L('Konto löschen', 'Delete account'), value: 'del' }, { label: L('Abmelden', 'Sign out'), value: 'out' }, { label: L('Fertig', 'Done'), value: null, primary: true }] });
  if (r === 'out') { try { await ask('logout'); } catch (e) {} setAccount(null, null); toast(L('Abgemeldet. Max wartet.', 'Signed out. Max will wait.')); }
  if (r === 'del') {
    const ok = await modal({ title: L('Konto wirklich löschen?', 'Really delete your account?'), text: L('Deine E-Mail-Adresse wird bei uns gelöscht und du wirst überall abgemeldet. Dein Lernstand auf diesem Gerät bleibt.', 'We delete your email address and sign you out everywhere. Your progress on this device stays.'), actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] });
    if (ok) {
      try { await ask('deleteaccount'); setAccount(null, null); toast(L('Konto gelöscht.', 'Account deleted.')); }
      catch (e) { toast(e.message || L('Hat nicht geklappt.', 'That didn’t work.')); }
    }
  }
}

// Unauffälliger Konto-Knopf (Seitenleiste)
export function accountChip() {
  const el = h('button', { class: 'accchip', type: 'button', onclick: () => getAccount() ? openAccount() : openLogin() });
  onAccount(a => {
    if (!el.isConnected && el.dataset.init) return;
    el.dataset.init = 1;
    if (!a) el.replaceChildren(h('span', { class: 'av', html: ico('lock') }), h('span', { class: 'tx' }, h('b', {}, L('Anmelden', 'Sign in')), h('small', {}, L('7 Tage Pro geschenkt', '7 days of Pro free'))));
    else el.replaceChildren(h('span', { class: 'av' }, (a.email[0] || '?').toUpperCase()), h('span', { class: 'tx' }, h('b', {}, a.email), h('small', {}, a.pro ? L(`Pro · noch ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'Tag' : 'Tage'}`, `Pro · ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'day' : 'days'} left`) : 'Free')));
  });
  return el;
}

// Beim Start: Sitzung prüfen (kostet nichts)
let checked = false;
export function refreshAccount() {
  if (checked || !getSession()) return; checked = true;
  ask('ping').catch(() => {});
}
