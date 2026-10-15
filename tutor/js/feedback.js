// „Wie findest du Max?“ – echte Bewertungen sammeln (freiwillig, mit Einwilligung für die Website)
import { h, toast, ls } from './util.js';
import { ask } from './api.js';
import { L } from './i18n.js';

export function feedbackButton(cls = 'btn sm ghost') {
  return h('button', { class: cls, onclick: openFeedback }, L('★ Wie findest du Max?', '★ What do you think of Max?'));
}

export function openFeedback() {
  let stars = 0;
  const starEls = [1, 2, 3, 4, 5].map(n => {
    const b = h('button', { class: 'fbstar', type: 'button', 'aria-label': n + L(' Sterne', n === 1 ? ' star' : ' stars') }, '★');
    b.addEventListener('click', () => { stars = n; starEls.forEach((s, k) => s.classList.toggle('on', k < n)); send.disabled = false; });
    return b;
  });
  const text = h('textarea', { class: 'field', rows: 4, placeholder: L('Was hat dir geholfen? Was nervt? (z. B. „Hat mir in Kostenrechnung echt den Arsch gerettet“)', 'What helped? What’s annoying? (e.g. “Totally saved my butt in cost accounting”)') });
  const name = h('input', { class: 'field', placeholder: L('Vorname (optional)', 'First name (optional)'), maxlength: 40 });
  const info = h('input', { class: 'field', placeholder: L('Studiengang / Uni (optional)', 'Degree / university (optional)'), maxlength: 80 });
  const consent = h('input', { type: 'checkbox' });
  const send = h('button', { class: 'btn primary', disabled: true }, L('Abschicken', 'Send'));
  const bg = h('div', { class: 'modal-bg' });
  const close = () => bg.remove();
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  bg.appendChild(h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
    h('h3', {}, L('Wie findest du Max?', 'What do you think of Max?')),
    h('p', {}, L('Ehrliches Feedback hilft uns am meisten – auch Kritik.', 'Honest feedback helps us most – criticism included.')),
    h('div', { class: 'fbstars' }, starEls),
    text,
    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' } }, name, info),
    h('label', { class: 'fbconsent' }, consent, h('span', {}, L('Darf mit Vorname und Studiengang auf der Website stehen.', 'May be shown on the website with my first name and degree.'))),
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: close }, L('Abbrechen', 'Cancel')), send)));
  send.addEventListener('click', async () => {
    send.disabled = true; send.textContent = L('Sende …', 'Sending …');
    try {
      await ask('feedback', { opts: { stars, text: text.value.trim(), name: name.value.trim(), info: info.value.trim(), consent: consent.checked } });
      ls.set('tutor.feedbackGiven', Date.now());
      close(); toast(L('Danke! Max tut so, als wär’s ihm egal. Ist es nicht.', 'Thanks! Max acts like he doesn’t care. He does.'));
    } catch (e) {
      send.disabled = false; send.textContent = L('Abschicken', 'Send');
      toast(e.code === 'dupe' ? e.message : L('Hat nicht geklappt. Versuch es später nochmal.', 'That didn’t work. Try again later.'));
    }
  });
  document.body.appendChild(bg);
}
