// Hinweis unter jeder Stelle, an der man ein Konto anlegt: AGB + Datenschutzerklärung (öffnen in neuem Tab, Anmeldung bleibt offen)
import { h } from './util.js';
import { L } from './i18n.js';

const url = n => (/(^|\.)bwlmax\.de$/.test(location.hostname) ? '/' + n : '/tutor/legal/' + n + '.html');
const a = (t, n) => h('a', { href: url(n), target: '_blank', rel: 'noopener' }, t);

// reg = Registrieren (mit „akzeptierst“), sonst kurzer Hinweis für Anmelden/Google
export function legalNote(reg = true) {
  return h('p', { class: 'lterms' }, ...(reg
    ? [L('Mit der Registrierung akzeptierst du die ', 'By signing up you accept the '), a(L('AGB', 'Terms'), 'agb'), L('. Wie wir mit deinen Daten umgehen, steht in der ', '. How we handle your data is explained in the '), a(L('Datenschutzerklärung', 'Privacy Policy'), 'datenschutz'), '.']
    : [L('Es gelten unsere ', 'Our '), a(L('AGB', 'Terms'), 'agb'), L(' und die ', ' and '), a(L('Datenschutzerklärung', 'Privacy Policy'), 'datenschutz'), L('.', ' apply.')]));
}
