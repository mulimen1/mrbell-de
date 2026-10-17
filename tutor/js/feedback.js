// Feedback: Was fehlt, was nervt, Ideen – und Bewertungen (die dürfen mit Einwilligung auf die Website).
// Ben liest jedes einzelne selbst (in „Zahlen“).
import { h, toast, ls, ico } from './util.js';
import { ask } from './api.js';
import { L } from './i18n.js';

const KINDS = () => [
  ['fehlt', L('Was fehlt mir?', 'What’s missing?'), L('Welche Funktion würdest du dir wünschen? Was hat dir beim Lernen gefehlt?', 'Which feature would you love? What did you miss while studying?')],
  ['nervt', L('Was nervt?', 'What’s annoying?'), L('Was hakt, ist umständlich oder kaputt? Je genauer, desto schneller ist es weg.', 'What’s clunky, broken or annoying? The more precise, the faster it’s gone.')],
  ['idee', L('Idee', 'Idea'), L('Deine Idee für BWL Max – egal wie groß oder klein.', 'Your idea for BWL Max – big or small.')],
  ['bewertung', L('Bewerten', 'Rate'), L('Was hat dir geholfen? (z. B. „Hat mir in Kostenrechnung echt den Arsch gerettet“)', 'What helped? (e.g. “Totally saved my butt in cost accounting”)')],
];

export function feedbackButton(cls = 'btn sm ghost') {
  return h('button', { class: cls, onclick: () => openFeedback('bewertung') }, L('★ Wie findest du Max?', '★ What do you think of Max?'));
}

export function openFeedback(start = 'fehlt') {
  let kind = KINDS().some(k => k[0] === start) ? start : 'fehlt', stars = 0;
  const text = h('textarea', { class: 'field', rows: 4, maxlength: 1200 });
  const starEls = [1, 2, 3, 4, 5].map(n => {
    const b = h('button', { class: 'fbstar', type: 'button', 'aria-label': n + L(' Sterne', n === 1 ? ' star' : ' stars') }, '★');
    b.addEventListener('click', () => { stars = n; starEls.forEach((s, k) => s.classList.toggle('on', k < n)); check(); });
    return b;
  });
  const name = h('input', { class: 'field', placeholder: L('Vorname (optional)', 'First name (optional)'), maxlength: 40 });
  const info = h('input', { class: 'field', placeholder: L('Studiengang / Uni (optional)', 'Degree / university (optional)'), maxlength: 80 });
  const consent = h('input', { type: 'checkbox' });
  const rate = h('div', { class: 'fb-rate' }, h('div', { class: 'fbstars' }, starEls),
    h('div', { class: 'fb-who' }, name, info),
    h('label', { class: 'fbconsent' }, consent, h('span', {}, L('Darf mit Vorname und Studiengang auf der Website stehen.', 'May be shown on the website with my first name and degree.'))));
  const send = h('button', { class: 'btn primary', type: 'button', disabled: true }, L('Abschicken', 'Send'));
  const check = () => { send.disabled = kind === 'bewertung' ? !stars : text.value.trim().length < 3; };
  text.addEventListener('input', check);
  const tabs = h('div', { class: 'fb-kinds', role: 'tablist' });
  const paint = () => {
    const k = KINDS().find(x => x[0] === kind);
    tabs.replaceChildren(...KINDS().map(([id, t]) => h('button', { type: 'button', role: 'tab', class: 'fb-kind' + (id === kind ? ' on' : ''), 'aria-selected': id === kind ? 'true' : 'false', onclick: () => { kind = id; paint(); text.focus(); } }, t)));
    text.placeholder = k[2];
    rate.hidden = kind !== 'bewertung';
    check();
  };
  const bg = h('div', { class: 'modal-bg' });
  const close = () => bg.remove();
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  const onKey = e => { if (e.key === 'Escape') { close(); removeEventListener('keydown', onKey); } };
  addEventListener('keydown', onKey);
  bg.appendChild(h('div', { class: 'modal fb-modal', role: 'dialog', 'aria-modal': 'true' },
    h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: close }),
    h('div', { class: 'eyebrow' }, L('Feedback · Beta', 'Feedback · Beta')),
    h('h3', {}, L('Sag uns ehrlich, was du denkst.', 'Tell us honestly what you think.')),
    h('p', { class: 'fb-sub' }, L('BWL Max ist frisch gestartet und wird mit dir besser. Wir lesen jedes Feedback selbst.', 'BWL Max just launched and gets better with you. We read every single piece of feedback ourselves.')),
    tabs, text, rate,
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: close }, L('Abbrechen', 'Cancel')), send)));
  paint();
  send.addEventListener('click', async () => {
    send.disabled = true; send.textContent = L('Sende …', 'Sending …');
    try {
      await ask('feedback', { opts: { kind, stars: kind === 'bewertung' ? stars : 0, text: text.value.trim(), name: kind === 'bewertung' ? name.value.trim() : '', info: kind === 'bewertung' ? info.value.trim() : '', consent: kind === 'bewertung' && consent.checked } });
      ls.set('tutor.feedbackGiven', Date.now());
      close();
      toast(kind === 'bewertung' ? L('Danke! Max tut so, als wär’s ihm egal. Ist es nicht.', 'Thanks! Max acts like he doesn’t care. He does.') : L('Danke – ist angekommen. Wir lesen jedes einzelne.', 'Thanks – got it. We read every single one.'), 3600);
    } catch (e) {
      send.disabled = false; send.textContent = L('Abschicken', 'Send');
      toast(e.code === 'dupe' || e.code === 'bad' ? e.message : L('Hat nicht geklappt. Versuch es später nochmal.', 'That didn’t work. Try again later.'));
    }
  });
  document.body.appendChild(bg);
  setTimeout(() => text.focus(), 60);
}
