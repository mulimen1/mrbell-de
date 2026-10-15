// „Wie findest du Max?“ – echte Bewertungen sammeln (freiwillig, mit Einwilligung für die Website)
import { h, toast, ls } from './util.js';
import { ask } from './api.js';

export function feedbackButton(cls = 'btn sm ghost') {
  return h('button', { class: cls, onclick: openFeedback }, '★ Wie findest du Max?');
}

export function openFeedback() {
  let stars = 0;
  const starEls = [1, 2, 3, 4, 5].map(n => {
    const b = h('button', { class: 'fbstar', type: 'button', 'aria-label': n + ' Sterne' }, '★');
    b.addEventListener('click', () => { stars = n; starEls.forEach((s, k) => s.classList.toggle('on', k < n)); send.disabled = false; });
    return b;
  });
  const text = h('textarea', { class: 'field', rows: 4, placeholder: 'Was hat dir geholfen? Was nervt? (z. B. „Hat mir in Kostenrechnung echt den Arsch gerettet“)' });
  const name = h('input', { class: 'field', placeholder: 'Vorname (optional)', maxlength: 40 });
  const info = h('input', { class: 'field', placeholder: 'Studiengang / Uni (optional)', maxlength: 80 });
  const consent = h('input', { type: 'checkbox' });
  const send = h('button', { class: 'btn primary', disabled: true }, 'Abschicken');
  const bg = h('div', { class: 'modal-bg' });
  const close = () => bg.remove();
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  bg.appendChild(h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
    h('h3', {}, 'Wie findest du Max?'),
    h('p', {}, 'Ehrliches Feedback hilft uns am meisten – auch Kritik.'),
    h('div', { class: 'fbstars' }, starEls),
    text,
    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' } }, name, info),
    h('label', { class: 'fbconsent' }, consent, h('span', {}, 'Darf mit Vorname und Studiengang auf der Website stehen.')),
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: close }, 'Abbrechen'), send)));
  send.addEventListener('click', async () => {
    send.disabled = true; send.textContent = 'Sende …';
    try {
      await ask('feedback', { opts: { stars, text: text.value.trim(), name: name.value.trim(), info: info.value.trim(), consent: consent.checked } });
      ls.set('tutor.feedbackGiven', Date.now());
      close(); toast('Danke! Max tut so, als wär’s ihm egal. Ist es nicht.');
    } catch (e) {
      send.disabled = false; send.textContent = 'Abschicken';
      toast(e.code === 'dupe' ? e.message : 'Hat nicht geklappt. Versuch es später nochmal.');
    }
  });
  document.body.appendChild(bg);
}
