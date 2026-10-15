// Konto: Anmeldung per E-Mail-Code (kein Passwort). Neues Konto = 7 Tage Pro.
// Gespeichert wird beim Server nur die E-Mail-Adresse. Skripte bleiben auf dem Gerät.
import { h, ico, toast, ls, modal } from './util.js';
import { ask, setAccount, getAccount, onAccount, getSession } from './api.js';
import { face } from './face.js';

const fmtDate = ts => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' });
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
    const x = () => h('button', { class: 'iconbtn lx', type: 'button', 'aria-label': 'Schließen', html: ico('x'), onclick: () => close(false) });
    let email = ls.get('tutor.lastEmail', '');

    const step1 = () => {
      const inp = h('input', { class: 'field', type: 'email', autocomplete: 'email', inputmode: 'email', placeholder: 'du@uni.de', value: email, 'aria-label': 'E-Mail-Adresse', required: true });
      const btn = h('button', { class: 'btn primary', type: 'submit' }, 'Code schicken');
      const err = h('div', { class: 'lerr', role: 'alert' });
      const form = h('form', { class: 'lform' }, inp, btn);
      form.addEventListener('submit', async e => {
        e.preventDefault(); email = inp.value.trim(); if (!email) return;
        btn.disabled = true; btn.textContent = 'Sende …'; err.textContent = ''; fc.set('think');
        try { const r = await ask('login', { opts: { email } }); ls.set('tutor.lastEmail', email); step2(r.isNew); }
        catch (e2) { fc.pulse('sad'); err.textContent = e2.message; btn.disabled = false; btn.textContent = 'Code schicken'; }
      });
      box.replaceChildren(x(), fEl, h('h3', {}, title || 'Kostenlos anmelden'),
        h('p', {}, 'Kein Passwort, kein Newsletter. Du bekommst einen Code per Mail – und fürs neue Konto ', h('b', {}, '7 Tage Pro'), ' geschenkt.'),
        form, err,
        h('div', { class: 'lfine' }, h('span', { html: ico('lock') }), 'Wir speichern nur deine E-Mail-Adresse. Deine Skripte bleiben auf deinem Gerät.'));
      fc.set('idle');
      setTimeout(() => inp.focus(), 60);
    };

    const step2 = () => {
      const inp = h('input', { class: 'field code', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: 6, placeholder: '······', 'aria-label': 'Code aus der E-Mail' });
      const err = h('div', { class: 'lerr', role: 'alert' });
      const again = h('button', { class: 'btn sm ghost', type: 'button', disabled: true }, 'Neuen Code schicken');
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
        try { await ask('login', { opts: { email } }); toast('Neuer Code ist unterwegs.'); } catch (e) { err.textContent = e.message; }
        setTimeout(() => { again.disabled = false; }, 30000);
      });
      setTimeout(() => { again.disabled = false; }, 30000);
      box.replaceChildren(x(), fEl, h('h3', {}, 'Check dein Postfach'),
        h('p', {}, 'Der Code ist unterwegs an ', h('b', {}, email), '. Nichts da? Schau kurz im Spam-Ordner.'),
        inp, err,
        h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('button', { class: 'btn sm ghost', type: 'button', onclick: step1 }, 'Andere E-Mail'), again));
      fc.set('idle');
      setTimeout(() => inp.focus(), 60);
    };

    const success = r => {
      fc.set('happy');
      box.replaceChildren(fEl, h('h3', {}, r.fresh ? 'Willkommen im Club.' : 'Da bist du ja wieder.'),
        h('p', {}, r.fresh
          ? `7 Tage Pro – geht aufs Haus. Also auf Papas. Bis ${fmtDate(r.account.proUntil)} lernst du ohne Tageslimit.`
          : r.account.pro ? `Pro läuft noch bis ${fmtDate(r.account.proUntil)}.` : 'Du bist angemeldet.'),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => close(true) }, 'Los geht’s')));
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
    toast(r.fresh ? 'Willkommen im Club. 7 Tage Pro gehen aufs Haus.' : 'Angemeldet. Schön, dass du wieder da bist.', 4000);
    return true;
  } catch (e) {
    toast(e.message || 'Der Link hat nicht geklappt.', 4000);
    return false;
  }
}

export async function openAccount() {
  const a = getAccount();
  if (!a) return openLogin();
  const body = h('div', { class: 'accbox' },
    h('div', { class: 'accrow' }, h('span', {}, 'E-Mail'), h('b', {}, a.email)),
    h('div', { class: 'accrow' }, h('span', {}, 'Tarif'), h('b', {}, a.pro ? `Pro · noch ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'Tag' : 'Tage'} (bis ${fmtDate(a.proUntil)})` : 'Free · 40 Einheiten pro Tag')),
    h('div', { class: 'accrow' }, h('span', {}, 'Dabei seit'), h('b', {}, new Date(a.since).toLocaleDateString('de-DE'))));
  const r = await modal({ title: 'Dein Konto', text: 'Dein Lernstand liegt weiter auf diesem Gerät. Gespeichert ist bei uns nur deine E-Mail-Adresse.', body,
    actions: [{ label: 'Konto löschen', value: 'del' }, { label: 'Abmelden', value: 'out' }, { label: 'Fertig', value: null, primary: true }] });
  if (r === 'out') { try { await ask('logout'); } catch (e) {} setAccount(null, null); toast('Abgemeldet. Max wartet.'); }
  if (r === 'del') {
    const ok = await modal({ title: 'Konto wirklich löschen?', text: 'Deine E-Mail-Adresse wird bei uns gelöscht und du wirst überall abgemeldet. Dein Lernstand auf diesem Gerät bleibt.', actions: [{ label: 'Abbrechen', value: false }, { label: 'Löschen', value: true, primary: true }] });
    if (ok) {
      try { await ask('deleteaccount'); setAccount(null, null); toast('Konto gelöscht.'); }
      catch (e) { toast(e.message || 'Hat nicht geklappt.'); }
    }
  }
}

// Unauffälliger Konto-Knopf (Seitenleiste)
export function accountChip() {
  const el = h('button', { class: 'accchip', type: 'button', onclick: () => getAccount() ? openAccount() : openLogin() });
  onAccount(a => {
    if (!el.isConnected && el.dataset.init) return;
    el.dataset.init = 1;
    if (!a) el.replaceChildren(h('span', { class: 'av', html: ico('lock') }), h('span', { class: 'tx' }, h('b', {}, 'Anmelden'), h('small', {}, '7 Tage Pro geschenkt')));
    else el.replaceChildren(h('span', { class: 'av' }, (a.email[0] || '?').toUpperCase()), h('span', { class: 'tx' }, h('b', {}, a.email), h('small', {}, a.pro ? `Pro · noch ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'Tag' : 'Tage'}` : 'Free')));
  });
  return el;
}

// Beim Start: Sitzung prüfen (kostet nichts)
let checked = false;
export function refreshAccount() {
  if (checked || !getSession()) return; checked = true;
  ask('ping').catch(() => {});
}
