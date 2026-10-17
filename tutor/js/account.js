// Konto: E-Mail + Passwort (Registrieren mit Bestätigungscode, Passwort vergessen per Code). Neues Konto = Free (Inner Circle nur mit Abo).
// Beim Server liegen E-Mail-Adresse und Passwort-Hash. Skripte bleiben auf dem Gerät.
import { aboReady } from './abo.js';
import { h, ico, toast, ls, modal } from './util.js';
import { ask, setAccount, getAccount, onAccount, getSession } from './api.js';
import { face } from './face.js';
import { L, LOCALE } from './i18n.js';
import { getNick, setNick, nickField, greetSplash } from './nick.js';

const fmtDate = ts => new Date(ts).toLocaleDateString(LOCALE, { day: 'numeric', month: L('numeric', 'short') });
// Ende der Inner-Circle-Zeit ohne den Puffer, den der Server bei Abos anhängt (sonst „8 Tage“ statt 7)
export const proEnd = a => (a && a.proUntil ? a.proUntil - (a.sub ? 6 * 36e5 : 0) : 0);
export const proDaysLeft = a => (a && a.pro) ? Math.max(1, Math.ceil((proEnd(a) - Date.now()) / 864e5)) : 0;

function shell() {
  const bg = h('div', { class: 'modal-bg' });
  const box = h('div', { class: 'modal login', role: 'dialog', 'aria-modal': 'true' });
  const fEl = h('div', { class: 'lface' });
  bg.appendChild(box); document.body.appendChild(bg);
  const fc = face(fEl, {});
  return { bg, box, fEl, fc };
}

// Passwort-Feld mit Auge zum Anzeigen
function pwField(auto, ph) {
  const inp = h('input', { class: 'field', type: 'password', autocomplete: auto, placeholder: ph, minlength: auto === 'new-password' ? 8 : null, required: true, 'aria-label': ph });
  const eye = h('button', { class: 'leye', type: 'button', 'aria-label': L('Passwort anzeigen', 'Show password'), html: EYE });
  eye.addEventListener('click', () => { const on = inp.type === 'password'; inp.type = on ? 'text' : 'password'; eye.classList.toggle('on', on); eye.setAttribute('aria-label', on ? L('Passwort verbergen', 'Hide password') : L('Passwort anzeigen', 'Show password')); inp.focus(); });
  return { el: h('div', { class: 'lpw' }, inp, eye), inp };
}
const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/><path class="sl" d="M4 4l16 16"/></svg>';

// Spam-Hinweis: gerade landen viele Mails noch im Spam – mit Knopf direkt zum richtigen Postfach
const MAILHOST = [[/gmail\.com|googlemail\.com/, 'Gmail', 'https://mail.google.com/mail/u/0/#spam'], [/outlook\.|hotmail\.|live\.|msn\./, 'Outlook', 'https://outlook.live.com/mail/0/junkemail'],
  [/gmx\./, 'GMX', 'https://www.gmx.net/'], [/web\.de$/, 'WEB.DE', 'https://web.de/'], [/icloud\.com|me\.com|mac\.com/, 'iCloud Mail', 'https://www.icloud.com/mail'], [/yahoo\./, 'Yahoo Mail', 'https://mail.yahoo.com/'], [/aol\./, 'AOL Mail', 'https://mail.aol.com/']];
function spamBox(email) {
  const dom = String(email).split('@')[1] || '', host = MAILHOST.find(([re]) => re.test(dom));
  return h('div', { class: 'lspam', role: 'note' },
    h('span', { class: 'lsi', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".7" fill="currentColor"/></svg>' }),
    h('div', {}, h('b', {}, L('Keine Mail? Schau im Spam-Ordner nach.', 'No email? Check your spam folder.')),
      h('p', {}, L('Weil BWL Max noch neu ist, landen viele Mails gerade im Spam. Markier sie dort als „Kein Spam“ – dann kommen die nächsten direkt an.', 'Because BWL Max is still new, many emails land in spam right now. Mark ours as “Not spam” – then the next ones arrive directly.')),
      host ? h('a', { class: 'btn sm', href: host[2], target: '_blank', rel: 'noopener' }, L(`${host[1]} öffnen`, `Open ${host[1]}`), h('span', { html: ico('right') })) : null));
}

// mode: 'login' (E-Mail + Passwort) · 'register' (Konto erstellen, Mail bestätigen) · 'reset' (Passwort vergessen)
export function openLogin({ title, mode = 'login' } = {}) {
  return new Promise(resolve => {
    const { bg, box, fEl, fc } = shell();
    const close = v => { if (bg.classList.contains('out')) return; bg.classList.add('out'); setTimeout(() => bg.remove(), 320); document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(false); };
    document.addEventListener('keydown', onKey);
    bg.addEventListener('click', e => { if (e.target === bg) close(false); });
    const x = () => h('button', { class: 'iconbtn lx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close(false) });
    let email = ls.get('tutor.lastEmail', '') || getAccount()?.email || '', pw = '';
    let firstTitle = title;
    const head = (t, sub) => { const tt = firstTitle || t; firstTitle = null; return [x(), fEl, h('h3', {}, tt), sub ? h('p', {}, sub) : null]; };
    const mailInp = () => h('input', { class: 'field', type: 'email', autocomplete: 'email', inputmode: 'email', placeholder: L('E-Mail-Adresse', 'Email address'), value: email, 'aria-label': L('E-Mail-Adresse', 'Email address'), required: true });
    const link = (txt, fn) => h('button', { class: 'llink', type: 'button', onclick: fn }, txt);
    const busyBtn = (btn, on, label) => { btn.disabled = on; btn.textContent = on ? L('Einen Moment …', 'One moment …') : label; };

    // ---------- Anmelden ----------
    const login = () => {
      const em = mailInp(), p = pwField('current-password', L('Passwort', 'Password'));
      const LBL = L('Anmelden', 'Sign in');
      const btn = h('button', { class: 'btn primary lg lbtn', type: 'submit' }, LBL);
      const err = h('div', { class: 'lerr', role: 'alert' });
      const form = h('form', { class: 'lstack' }, em, p.el, h('div', { class: 'lrow' }, link(L('Passwort vergessen?', 'Forgot password?'), () => { email = em.value.trim(); reset(); })), btn);
      form.addEventListener('submit', async e => {
        e.preventDefault(); email = em.value.trim(); if (!email || !p.inp.value) return;
        busyBtn(btn, true, LBL); err.replaceChildren(); fc.set('think');
        try {
          const r = await ask('pwlogin', { opts: { email, password: p.inp.value } });
          ls.set('tutor.lastEmail', email); setAccount(r.account, r.session); success(r);
        } catch (e2) {
          fc.pulse('sad'); busyBtn(btn, false, LBL);
          err.replaceChildren(e2.message || L('Das hat nicht geklappt.', 'That didn’t work.'));
          if (e2.code === 'no_pw') err.append(' ', link(L('Jetzt Passwort festlegen →', 'Set a password now →'), () => reset()));
          if (e2.code === 'bad_login') { p.inp.value = ''; p.inp.focus(); }
        }
      });
      box.replaceChildren(...head(L('Anmelden', 'Sign in'), L('Schön, dass du wieder da bist.', 'Good to have you back.')), form, err,
        h('div', { class: 'lalt' }, L('Noch kein Konto? ', 'No account yet? '), link(L('Konto erstellen', 'Create account'), () => register())));
      fc.set('idle'); setTimeout(() => (email ? p.inp : em).focus(), 60);
    };

    // ---------- Konto erstellen ----------
    const register = () => {
      const em = mailInp(), p = pwField('new-password', L('Passwort (mind. 8 Zeichen)', 'Password (min. 8 characters)'));
      const LBL = L('Konto erstellen', 'Create account');
      const btn = h('button', { class: 'btn primary lg lbtn', type: 'submit' }, LBL);
      const hint = h('div', { class: 'lhint' }, h('span', { class: 'lck', html: ico('check') }), L('Mindestens 8 Zeichen', 'At least 8 characters'));
      p.inp.addEventListener('input', () => hint.classList.toggle('ok', p.inp.value.length >= 8));
      const err = h('div', { class: 'lerr', role: 'alert' });
      const form = h('form', { class: 'lstack' }, em, p.el, hint, btn);
      form.addEventListener('submit', async e => {
        e.preventDefault(); email = em.value.trim(); pw = p.inp.value;
        if (pw.length < 8) { err.textContent = L('Dein Passwort braucht mindestens 8 Zeichen.', 'Your password needs at least 8 characters.'); p.inp.focus(); return; }
        busyBtn(btn, true, LBL); err.replaceChildren(); fc.set('think');
        try { await ask('login', { opts: { email, password: pw, mode: 'register' } }); ls.set('tutor.lastEmail', email); codeStep('register'); }
        catch (e2) { fc.pulse('sad'); busyBtn(btn, false, LBL); err.replaceChildren(e2.message); if (e2.code === 'exists') err.append(' ', link(L('Zur Anmeldung →', 'Go to sign in →'), () => login())); }
      });
      box.replaceChildren(...head(L('Konto erstellen', 'Create your account'), L('Kostenlos und in 30 Sekunden. Alles, was du ohne Konto gemacht hast, bleibt erhalten.', 'Free and done in 30 seconds. Everything you did without an account stays.')), form, err,
        h('div', { class: 'lalt' }, L('Schon ein Konto? ', 'Already have an account? '), link(L('Anmelden', 'Sign in'), () => login())),
        h('div', { class: 'lfine' }, h('span', { html: ico('lock') }), L('Passwort wird verschlüsselt gespeichert. Deine Skripte bleiben auf deinem Gerät.', 'Your password is stored encrypted. Your slides stay on your device.')));
      fc.set('idle'); setTimeout(() => em.focus(), 60);
    };

    // ---------- Passwort vergessen ----------
    const reset = () => {
      const em = mailInp(), p = pwField('new-password', L('Neues Passwort (mind. 8 Zeichen)', 'New password (min. 8 characters)'));
      const LBL = L('Code schicken', 'Send code');
      const btn = h('button', { class: 'btn primary lg lbtn', type: 'submit' }, LBL);
      const err = h('div', { class: 'lerr', role: 'alert' });
      const form = h('form', { class: 'lstack' }, em, p.el, btn);
      form.addEventListener('submit', async e => {
        e.preventDefault(); email = em.value.trim(); pw = p.inp.value;
        if (pw.length < 8) { err.textContent = L('Dein neues Passwort braucht mindestens 8 Zeichen.', 'Your new password needs at least 8 characters.'); p.inp.focus(); return; }
        busyBtn(btn, true, LBL); err.replaceChildren(); fc.set('think');
        try { await ask('login', { opts: { email, password: pw, mode: 'reset' } }); ls.set('tutor.lastEmail', email); codeStep('reset'); }
        catch (e2) { fc.pulse('sad'); busyBtn(btn, false, LBL); err.replaceChildren(e2.message); if (e2.code === 'no_account') err.append(' ', link(L('Konto erstellen →', 'Create account →'), () => register())); }
      });
      box.replaceChildren(...head(L('Neues Passwort', 'New password'), L('Gib deine E-Mail und ein neues Passwort ein. Wir schicken dir einen Code zur Bestätigung.', 'Enter your email and a new password. We’ll send you a code to confirm.')), form, err,
        h('div', { class: 'lalt' }, link(L('← Zurück zur Anmeldung', '← Back to sign in'), () => login())));
      fc.set('idle'); setTimeout(() => (email ? p.inp : em).focus(), 60);
    };

    // ---------- Code aus der Mail ----------
    const codeStep = m => {
      const inp = h('input', { class: 'field code', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: 6, placeholder: '······', 'aria-label': L('Code aus der E-Mail', 'Code from the email') });
      const err = h('div', { class: 'lerr', role: 'alert' });
      const again = h('button', { class: 'btn sm ghost', type: 'button', disabled: true }, L('Neuen Code schicken', 'Send a new code'));
      let busy = false;
      const go = async () => {
        const code = inp.value.replace(/\D/g, '');
        if (code.length < 6 || busy) return;
        busy = true; inp.disabled = true; fc.set('think'); err.textContent = '';
        try { const r = await ask('verify', { opts: { email, code } }); setAccount(r.account, r.session); pw = ''; success(r, m); }
        catch (e) {
          busy = false; inp.disabled = false; inp.value = ''; fc.pulse('sad'); err.textContent = e.message;
          inp.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 300 });
          if (e.code === 'code_expired') again.disabled = false;
          inp.focus();
        }
      };
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 6); if (inp.value.length === 6) go(); });
      again.addEventListener('click', async () => {
        again.disabled = true;
        try { await ask('login', { opts: { email, password: pw, mode: m } }); toast(L('Neuer Code ist unterwegs.', 'A new code is on its way.')); } catch (e) { err.textContent = e.message; }
        setTimeout(() => { again.disabled = false; }, 30000);
      });
      setTimeout(() => { again.disabled = false; }, 30000);
      box.replaceChildren(x(), fEl, h('h3', {}, m === 'register' ? L('Bestätige deine E-Mail', 'Confirm your email') : L('Check dein Postfach', 'Check your inbox')),
        h('p', {}, L('Wir haben dir einen 6-stelligen Code an ', 'We sent a 6-digit code to '), h('b', {}, email), L(' geschickt.', '.')),
        spamBox(email),
        inp, err,
        h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('button', { class: 'btn sm ghost', type: 'button', onclick: () => (m === 'reset' ? reset() : register()) }, L('Andere E-Mail', 'Different email')), again));
      fc.set('idle'); setTimeout(() => inp.focus(), 60);
    };

    // ---------- Geschafft ----------
    const success = (r, m) => {
      fc.set('happy');
      const goal = r.fresh ? goalQuestion() : null;
      const had = getNick(r.account), nf = had ? null : nickField('');
      const finish = () => {
        if (nf) { const v = nf.value(); if (!v.ok) return; if (v.nick) setNick(v.nick, r.account); }
        goal && goal.save(); close(true);
        if (!location.hash || location.hash === '#/' || location.hash === '#' || location.hash === '#/app/me') location.hash = '#/app/tutor';
        const n = getNick(r.account);
        try { sessionStorage.setItem('tutor.greetAt', String(Date.now())); } catch (e) {}
        // Neues Konto: einmal das große Willkommen (mit echter Nutzernummer) – sonst die normale Begrüßung
        if (r.fresh) setTimeout(() => import('./welcome.js').then(m => m.welcomeFirst({ nick: n, nr: +r.nr || 0 })), 380);
        else if (n) setTimeout(() => greetSplash(n), 380);
      };
      // Bekannt + Spitzname vorhanden: direkt rein, ohne Zwischenschritt
      if (!r.fresh && had && m !== 'reset') { finish(); return; }
      box.replaceChildren(fEl, h('h3', {}, r.fresh ? L('Willkommen im Club.', 'Welcome to the club.') : m === 'reset' ? L('Neues Passwort gespeichert.', 'New password saved.') : L('Da bist du ja wieder.', 'There you are again.')),
        h('p', {}, r.fresh
          ? L('Dein Konto steht. Alles ist freigeschaltet, dein Fortschritt wird gespeichert – und ich hab heute noch richtig Lust.', 'Your account is ready. Everything’s unlocked, your progress is saved – and I’m in a great mood today.')
          : m === 'reset' ? L('Ab jetzt meldest du dich damit an. Andere Geräte haben wir sicherheitshalber abgemeldet.', 'Use it to sign in from now on. For safety we signed out your other devices.')
          : r.account.pro ? L(`Inner Circle läuft noch bis ${fmtDate(proEnd(r.account))}.`, `Inner Circle runs until ${fmtDate(proEnd(r.account))}.`) : L('Du bist angemeldet.', 'You’re signed in.')),
        nf && nf.el, goal && goal.el,
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: finish }, L('Los geht’s', 'Let’s go'))));
      setTimeout(() => box.querySelector('.btn.primary')?.focus(), 60);
    };

    ({ register, reset }[mode] || login)();
  });
}
export const openRegister = (o = {}) => openLogin(Object.assign({}, o, { mode: 'register' }));

// Neues Konto: kurze, optionale Frage nach dem Ziel (füllt später den Klausurplan vor)
const GOAL_CHIPS = L([[.95, '1,0'], [.9, '1,3'], [.85, '1,7'], [.8, '2,0'], [.75, '2,3'], [.7, '2,7'], [.65, '3,0'], [.5, 'Bestanden']], [[.9, 'Top grade'], [.75, 'Good grade'], [.5, 'Pass']]);
function goalQuestion() {
  const k = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const t = new Date(), tm = new Date(t.getTime() + 864e5), mx = new Date(t.getTime() + 365 * 864e5);
  const prev = ls.get('tutor.goal', null) || {};
  let grade = typeof prev.grade === 'number' ? prev.grade : null;
  const date = h('input', { type: 'date', class: 'field', min: k(tm), max: k(mx), value: prev.examDate && prev.examDate > k(t) ? prev.examDate : '', 'aria-label': L('Datum deiner nächsten Klausur', 'Date of your next exam') });
  const chips = h('div', { class: 'lg-chips' }, GOAL_CHIPS.map(([p, l]) => h('button', { type: 'button', class: 'chip' + (grade != null && Math.abs(grade - p) < .001 ? ' on' : ''), onclick: e => { const on = e.currentTarget.classList.contains('on'); grade = on ? null : p; chips.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', !on && c === e.currentTarget)); } }, l)));
  const el = h('div', { class: 'lgoal' },
    h('b', {}, L('Was ist dein Ziel?', 'What’s your goal?'), h('small', {}, L(' · optional', ' · optional'))),
    h('label', {}, h('span', {}, L('Nächste Klausur', 'Next exam')), date),
    h('div', {}, h('span', { class: 'lg-l' }, L('Wunschnote', 'Target grade')), chips),
    h('p', {}, L('Max baut dir daraus später einen Lernplan bis zur Klausur. Leer lassen geht auch.', 'Max later turns this into a study plan up to your exam. Leaving it empty is fine too.')));
  return { el, save() { const d = /^\d{4}-\d{2}-\d{2}$/.test(date.value) ? date.value : null; if (d || grade != null) ls.set('tutor.goal', { examDate: d, grade }); } };
}

// Link aus der Mail: #/login/<ek>/<code>
export async function verifyLink(ek, code) {
  try {
    const r = await ask('verify', { opts: { ek, code } });
    setAccount(r.account, r.session);
    const n = getNick(r.account); if (n) { try { sessionStorage.setItem('tutor.greetAt', String(Date.now())); } catch (e) {} setTimeout(() => greetSplash(n), 400); } else setTimeout(askNick, 600);
    if (!n) return true;
    toast(r.fresh ? L('Willkommen! Dein Konto ist startklar.', 'Welcome! Your account is ready.') : L('Angemeldet. Schön, dass du wieder da bist.', 'Signed in. Good to have you back.'), 4000);
    return true;
  } catch (e) {
    toast(e.message || L('Der Link hat nicht geklappt.', 'The link didn’t work.'), 4000);
    return false;
  }
}

// Spitzname nachträglich festlegen/ändern
export async function askNick() {
  const a = getAccount(); if (!a) return;
  const nf = nickField(getNick(a));
  const r = await modal({ title: L('Dein Spitzname', 'Your nickname'), text: L('Fiktiv, witzig, echt – alles geht. Nur nichts Beleidigendes oder Anzügliches.', 'Made-up, funny, real – anything goes. Just nothing offensive or dirty.'), body: nf.el,
    actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Speichern', 'Save'), value: true, primary: true }],
    onAction: v => { if (!v) return true; const c = nf.value(); return c.ok; } });
  if (!r) return;
  const c = nf.value(); if (!c.ok) return;
  setNick(c.nick, a); onAccountRefresh();
  if (c.nick) greetSplash(c.nick);
}
function onAccountRefresh() { const a = getAccount(); if (a) setAccount(Object.assign({}, a)); }

export async function openAccount() {
  const a = getAccount();
  if (!a) return openLogin();
  const body = h('div', { class: 'accbox' },
    h('div', { class: 'accrow' }, h('span', {}, L('Spitzname', 'Nickname')), h('b', {}, getNick(a) || '–', ' ', h('button', { class: 'linkbtn', type: 'button', onclick: () => { document.querySelector('.modal-bg')?.remove(); askNick(); } }, getNick(a) ? L('ändern', 'change') : L('festlegen', 'set')))),
    h('div', { class: 'accrow' }, h('span', {}, L('E-Mail', 'Email')), h('b', {}, a.email)),
    h('div', { class: 'accrow' }, h('span', {}, L('Passwort', 'Password')), h('b', {}, a.hasPw === false ? L('noch nicht festgelegt', 'not set yet') : '••••••••', ' ', h('button', { class: 'linkbtn', type: 'button', onclick: () => { document.querySelector('.modal-bg')?.remove(); openLogin({ mode: 'reset', title: a.hasPw === false ? L('Passwort festlegen', 'Set a password') : L('Passwort ändern', 'Change password') }); } }, a.hasPw === false ? L('festlegen', 'set') : L('ändern', 'change')))),
    h('div', { class: 'accrow' }, h('span', {}, L('Tarif', 'Plan')), h('b', {}, a.pro ? h('span', {}, h('span', { class: 'ic-chip' }, h('span', { class: 'ic-lt' }, 'Inner Circle')), L(` noch ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'Tag' : 'Tage'} (bis ${fmtDate(proEnd(a))})`, ` ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'day' : 'days'} left (until ${fmtDate(proEnd(a))})`)) : [L('Free · 40 Einheiten pro Tag', 'Free · 40 credits per day'), ' ', h('button', { class: 'linkbtn', type: 'button', onclick: planSwitch }, L('wechseln', 'change'))])),
    aboRow(a),
    h('div', { class: 'accrow' }, h('span', {}, L('Dabei seit', 'Member since')), h('b', {}, new Date(a.since).toLocaleDateString(LOCALE))));
  const r = await modal({ title: L('Dein Konto', 'Your account'), text: L('Deine Skripte bleiben auf diesem Gerät. Bei uns liegen deine E-Mail-Adresse und dein verschlüsseltes Passwort.', 'Your slides stay on this device. We store your email address and your encrypted password.'), body,
    actions: [{ label: L('Konto löschen', 'Delete account'), value: 'del' }, { label: L('Abmelden', 'Sign out'), value: 'out' }, { label: L('Fertig', 'Done'), value: null, primary: true }] });
  if (r === 'out') { try { await ask('logout'); } catch (e) {} setAccount(null, null); toast(L('Abgemeldet. Max wartet.', 'Signed out. Max will wait.')); location.hash = '#/'; }
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
  const wrap = h('div', { class: 'accwrap' });
  const chip = h('button', { class: 'accchip', type: 'button', onclick: () => openAccount() });
  const guest = h('div', { class: 'accguest' },
    h('div', { class: 'accg-b' },
      h('button', { class: 'btn sm', type: 'button', onclick: () => openLogin() }, L('Anmelden', 'Sign in')),
      h('button', { class: 'btn sm primary', type: 'button', onclick: () => openLogin({ mode: 'register' }) }, L('Konto erstellen', 'Create account'))),
    h('small', {}, L('Kostenlos · dein Fortschritt bleibt gespeichert', 'Free · your progress stays saved')));
  onAccount(a => {
    if (!a) { wrap.replaceChildren(guest); return; }
    chip.classList.toggle('ic', !!a.pro);
    // Einmalig beim Eintritt: Ring und Abzeichen leuchten kurz auf
    const fresh = a.pro && !ls.get('tutor.icHello', 0);
    if (a.pro) ls.set('tutor.icHello', Date.now()); else ls.set('tutor.icHello', 0);
    chip.classList.toggle('ic-new', !!fresh);
    chip.replaceChildren(h('span', { class: 'av' }, ((getNick(a) || a.email)[0] || '?').toUpperCase()), h('span', { class: 'tx' }, h('b', {}, getNick(a) || a.email), h('small', {}, a.pro ? h('span', { class: 'ic-pill' }, h('span', { class: 'ic-lt' }, 'Inner Circle')) : h('span', { class: 'plan-pill' }, 'Free'), a.pro && !a.sub ? L(` noch ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'Tag' : 'Tage'}`, ` ${proDaysLeft(a)} ${proDaysLeft(a) === 1 ? 'day' : 'days'} left`) : '')));
    wrap.replaceChildren(chip);
  });
  return wrap;
}

// Beim Start: Sitzung prüfen (kostet nichts)
let checked = false;
export function refreshAccount() {
  if (checked || !getSession()) return; checked = true;
  ask('ping').catch(() => {});
}

// Abo-Zeile im Konto: Stand + direkt kündigen (der Kündigungsbutton nach § 312k BGB steht zusätzlich auf jeder Seite)
function aboRow(a) {
  if (a.pro && a.sub) {
    const tx = h('span', {}, L('aktiv · 7,99 € / Monat', 'active · €7.99 / month'));
    let trial = false, info = null;
    const btn = h('button', { class: 'linkbtn', type: 'button', onclick: async () => {
      // Erst zeigen, was wegfällt, dann ein zweites Mal bestätigen
      document.querySelector('.modal-bg')?.remove();
      const { cancelFlow } = await import('./ic.js');
      const ok = await cancelFlow({ trial, end: info ? (trial ? info.trialEnd : info.periodEnd) : proEnd(a) });
      if (!ok) return;
      try {
        const m = await import('./abo.js'); const r = await m.cancelAbo();
        toast(r.sofort ? L('Gekündigt. Es wird nichts abgebucht.', 'Cancelled. Nothing will be charged.') : L(`Gekündigt – läuft noch bis ${fmtDate(r.endet)}.`, `Cancelled – runs until ${fmtDate(r.endet)}.`), 4200);
        document.querySelector('.modal-bg')?.remove();
      } catch (e) { toast(e.message, 4200); }
    } }, L('kündigen', 'cancel'));
    import('./abo.js').then(m => m.hub('status')).then(r => {
      const x = r.abo; if (!x) return;
      info = x; trial = x.status === 'trialing';
      tx.textContent = trial ? L(`Test bis ${fmtDate(x.trialEnd)}`, `Trial until ${fmtDate(x.trialEnd)}`)
        : x.cancelAt ? L(`gekündigt · läuft bis ${fmtDate(x.cancelAt)}`, `cancelled · runs until ${fmtDate(x.cancelAt)}`)
        : L(`aktiv · 7,99 € / Monat · nächste Abbuchung ${fmtDate(x.periodEnd)}`, `active · €7.99 / month · next charge ${fmtDate(x.periodEnd)}`);
      if (x.cancelAt) btn.remove();
    }).catch(() => {});
    return h('div', { class: 'accrow' }, h('span', {}, L('Abo', 'Subscription')), h('b', {}, tx, ' ', btn));
  }
  return null;   // Free: Wechsel läuft über „Tarif · wechseln“
}
// Tarif wechseln geht immer – auch wenn das Tageslimit noch nicht erreicht ist
async function planSwitch() {
  document.querySelector('.modal-bg')?.remove();
  const m = await import('./abo.js');
  await m.loadPk(true);
  if (m.aboReady()) return m.openAbo();
  const { innerCircle } = await import('./ic.js');
  innerCircle({ reason: L('Mehr Max, wann du willst.', 'More Max, whenever you want.'), later: L('Schließen', 'Close') });
}
