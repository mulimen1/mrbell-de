// Max’s Inner Circle: das Blatt, das kommt, wenn das Tageskontingent aufgebraucht ist.
// Schwarze Graphit-Karte mit Chromkante, Vorteile auf einen Blick. Buchbar erst, wenn der Stripe-Schlüssel gesetzt ist –
// bis dahin steht am Knopf „Bald verfügbar“.
import { h, ico } from './util.js';
import { L } from './i18n.js';

const BEN = () => [
  ['chat', L('Max ohne Tageslimit', 'Max without a daily limit'), L('Fragen, Tafeln, Erklärungen – so viel du brauchst (Fair Use)', 'Questions, boards, explanations – as much as you need (fair use)')],
  ['exam', L('Probeklausuren', 'Mock exams'), L('Im Klausur-Stil, mit Zeit, Punkten und Note', 'Real exam style, with time, points and a grade')],
  ['pod', L('Längere Podcasts', 'Longer podcasts'), L('Mit echten Stimmen – für Bahn, Gym, Spaziergang', 'With real voices – for the train, gym, a walk')],
  ['refresh', L('Sync auf allen Geräten', 'Sync on all devices'), L('Handy, Laptop, Tablet – alles ist immer da', 'Phone, laptop, tablet – everything’s always there')],
];

// reason: kurzer Satz, warum das Blatt kommt (z. B. Text vom Server). Liefert 'abo', 'later' oder null.
export function innerCircle({ reason = '' } = {}) {
  return new Promise(async resolve => {
    const { aboReady, openAbo } = await import('./abo.js');
    const ready = aboReady();
    const close = v => { bg.classList.add('out'); document.removeEventListener('keydown', onKey); setTimeout(() => bg.remove(), 180); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    const f = h('span', { class: 'icx-face' });
    const cta = h('button', { class: 'btn primary lg ic-btn icx-cta', type: 'button', disabled: ready ? null : true, onclick: () => { close('abo'); openAbo(); } },
      ready ? L('7 Tage gratis testen', 'Try 7 days free') : L('Bald verfügbar', 'Coming soon'));
    const box = h('div', { class: 'modal icx', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Max’s Inner Circle' },
      h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close(null) }),
      h('div', { class: 'icx-top' }, f, h('div', { class: 'icx-why' }, reason || L('Für heute hast du alles rausgeholt.', 'You’ve used everything for today.'))),
      h('h3', { class: 'ic-lt' }, 'Max’s Inner Circle'),
      h('p', { class: 'icx-lead' }, L('Lern weiter, wann du willst – ohne Tageslimit.', 'Keep learning whenever you want – no daily limit.')),
      h('ul', { class: 'icx-ben' }, BEN().map(([ic, t, s], i) => h('li', { style: { '--i': String(i) } }, h('span', { class: 'icx-bi', html: ico(ic) }), h('span', {}, h('b', {}, t), h('small', {}, s))))),
      h('div', { class: 'icx-price' }, h('b', {}, L('7 Tage gratis', '7 days free')), h('span', {}, L('danach 7,99 € im Monat', 'then €7.99 a month'))),
      cta,
      ready ? null : h('p', { class: 'icx-soon' }, L('Der Inner Circle startet in Kürze.', 'The Inner Circle opens soon.')),
      h('button', { class: 'icx-later', type: 'button', onclick: () => close('later') }, L('Morgen weiter – neue Antworten ab 0:00 Uhr', 'Carry on tomorrow – new answers from midnight')));
    const bg = h('div', { class: 'modal-bg icx-bg', onclick: e => { if (e.target === bg) close(null); } }, box);
    document.body.appendChild(bg);
    document.addEventListener('keydown', onKey);
    try { const { face } = await import('./face.js'); face(f, { follow: false }); } catch (e) {}
    setTimeout(() => (ready ? cta : box.querySelector('.icx-later')).focus({ preventScroll: true }), 60);
  });
}
