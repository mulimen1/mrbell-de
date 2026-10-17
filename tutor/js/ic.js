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

// Upload bei leerem Kontingent: Skript ist sicher abgelegt, Max kümmert sich drum, sobald wieder Antworten da sind
export function quotaWait(name = '') {
  return new Promise(async resolve => {
    const { aboReady } = await import('./abo.js');
    let gone = false;
    const close = v => { if (gone) return; gone = true; bg.classList.add('out'); document.removeEventListener('keydown', onKey); setTimeout(() => bg.remove(), 340); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    const f = h('span', { class: 'icx-face' });
    const nm = name.length > 60 ? name.slice(0, 59) + '…' : name;
    const box = h('div', { class: 'modal icx icw', role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Skript gespeichert', 'Slides saved') },
      h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close(null) }),
      h('span', { class: 'icx-shine', 'aria-hidden': 'true' }),
      h('div', { class: 'icx-top' }, f, h('div', { class: 'icw-ok' }, h('span', { html: ico('check') }), L('Sicher abgelegt', 'Safely stored'))),
      h('h3', { class: 'icw-h' }, nm ? L(`„${nm}“ ist gespeichert.`, `“${nm}” is saved.`) : L('Dein Skript ist gespeichert.', 'Your slides are saved.')),
      h('p', { class: 'icx-lead' }, L('Dein Kontingent für heute ist aufgebraucht. Hochladen und speichern geht trotzdem immer – ich kümmere mich drum, sobald du wieder Antworten hast.', 'You’ve used up today’s answers. Uploading and saving always works – I’ll get on it as soon as you have answers again.')),
      h('div', { class: 'icw-opts' },
        h('div', { class: 'icw-o' }, h('span', { class: 'icx-bi', html: ico('clock') }), h('span', {}, h('b', {}, L('Morgen ab 0:00 Uhr', 'Tomorrow from midnight')), h('small', {}, L('Ich begrüß dich direkt mit diesem Skript.', 'I’ll greet you with these slides straight away.')))),
        h('div', { class: 'icw-o' }, h('span', { class: 'icx-bi', html: ico('spark') }), h('span', {}, h('b', { class: 'ic-lt' }, L('Sofort – im Inner Circle', 'Right now – in the Inner Circle')), h('small', {}, aboReady() ? L('Ohne Tageslimit, 7 Tage gratis.', 'No daily limit, 7 days free.') : L('Ohne Tageslimit – startet in Kürze.', 'No daily limit – opening soon.'))))),
      h('div', { class: 'icw-row' },
        h('button', { class: 'btn lg icw-ok-b', type: 'button', onclick: () => close('ok') }, L('Alles klar', 'Got it')),
        h('button', { class: 'btn primary lg ic-btn', type: 'button', onclick: async () => { close('ic'); setTimeout(() => innerCircle({ reason: L('Dein Skript wartet schon.', 'Your slides are waiting.'), later: L('Dann morgen', 'Tomorrow then') }), 360); } }, L('Inner Circle ansehen', 'See the Inner Circle'))));
    const bg = h('div', { class: 'modal-bg icx-bg', onclick: e => { if (e.target === bg) close(null); } }, box);
    document.body.appendChild(bg);
    document.addEventListener('keydown', onKey);
    try { const { face } = await import('./face.js'); face(f, { follow: false }); } catch (e) {}
    setTimeout(() => box.querySelector('.icw-ok-b')?.focus({ preventScroll: true }), 60);
  });
}

// reason: kurzer Satz, warum das Blatt kommt (z. B. Text vom Server). Liefert 'abo', 'later' oder null.
export function innerCircle({ reason = '', later = '' } = {}) {
  return new Promise(async resolve => {
    const { aboReady, openAbo } = await import('./abo.js');
    const ready = aboReady();
    // Schließen mit Abgang: Karte sinkt weich weg, Hintergrund klart auf
    let gone = false;
    const close = v => { if (gone) return; gone = true; bg.classList.add('out'); document.removeEventListener('keydown', onKey); setTimeout(() => bg.remove(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 340); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    const f = h('span', { class: 'icx-face' });
    const cta = h('button', { class: 'btn primary lg ic-btn icx-cta', type: 'button', disabled: ready ? null : true, onclick: () => { close('abo'); openAbo(); } },
      ready ? L('7 Tage gratis testen', 'Try 7 days free') : L('Bald verfügbar', 'Coming soon'));
    const box = h('div', { class: 'modal icx', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Max’s Inner Circle' },
      h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close(null) }),
      h('div', { class: 'icx-top' }, f, h('div', { class: 'icx-why' }, reason || L('Für heute hast du alles rausgeholt.', 'You’ve used everything for today.'))),
      h('h3', { class: 'ic-lt icx-title' }, 'Max’s Inner Circle'),
      h('span', { class: 'icx-shine', 'aria-hidden': 'true' }),
      h('p', { class: 'icx-lead' }, L('Lern weiter, wann du willst – ohne Tageslimit.', 'Keep learning whenever you want – no daily limit.')),
      h('ul', { class: 'icx-ben' }, BEN().map(([ic, t, s], i) => h('li', { style: { '--i': String(i) } }, h('span', { class: 'icx-bi', html: ico(ic) }), h('span', {}, h('b', {}, t), h('small', {}, s))))),
      h('div', { class: 'icx-price' }, h('b', {}, L('7 Tage gratis', '7 days free')), h('span', {}, L('danach 7,99 € im Monat', 'then €7.99 a month'))),
      cta,
      ready ? null : h('p', { class: 'icx-soon' }, L('Der Inner Circle startet in Kürze.', 'The Inner Circle opens soon.')),
      h('button', { class: 'icx-later', type: 'button', onclick: () => close('later') }, later || L('Morgen weiter – neue Antworten ab 0:00 Uhr', 'Carry on tomorrow – new answers from midnight')));
    const bg = h('div', { class: 'modal-bg icx-bg', onclick: e => { if (e.target === bg) close(null); } }, box);
    document.body.appendChild(bg);
    document.addEventListener('keydown', onKey);
    try { const { face } = await import('./face.js'); face(f, { follow: false }); } catch (e) {}
    setTimeout(() => (ready ? cta : box.querySelector('.icx-later')).focus({ preventScroll: true }), 60);
  });
}

// Kündigen im Konto: erst klar zeigen, was wegfällt (im Test: sofort), dann ein zweites Mal bestätigen.
// Der gesetzliche Kündigungsbutton unter „Verträge kündigen“ (§ 312k BGB) bleibt davon unberührt und einfach.
// Liefert true, wenn wirklich gekündigt werden soll.
export function cancelFlow({ trial = false, end = 0 } = {}) {
  return new Promise(async resolve => {
    let gone = false, fc = null;
    const close = v => { if (gone) return; gone = true; bg.classList.add('out'); document.removeEventListener('keydown', onKey); setTimeout(() => bg.remove(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 340); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(false); };
    const day = t => t ? new Date(t).toLocaleDateString(L('de-DE', 'en-GB'), { day: 'numeric', month: 'long' }) : '';
    const LOSE = [
      ['chat', L('Max ohne Tageslimit', 'Max without a daily limit'), L('Zurück auf 40 Einheiten pro Tag', 'Back to 40 credits a day')],
      ['exam', L('Probeklausuren', 'Mock exams'), L('Fallen weg', 'Gone')],
      ['pod', L('Längere Podcasts', 'Longer podcasts'), L('Fallen weg', 'Gone')],
      ['refresh', L('Sync auf allen Geräten', 'Sync on all devices'), L('Fällt weg', 'Gone')],
    ];
    const f = h('span', { class: 'icx-face' });
    const box = h('div', { class: 'modal icx icc', role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Inner Circle kündigen', 'Cancel the Inner Circle') });
    const keep = () => { close(false); import('./util.js').then(m => m.toast(L('Schön, dass du bleibst.', 'Glad you’re staying.'), 2600)); };
    const step1 = () => box.replaceChildren(
      h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close(false) }),
      h('div', { class: 'icx-top' }, f, h('div', { class: 'icx-why' }, trial ? L(`Dein kostenloser Test läuft noch bis ${day(end)}.`, `Your free trial runs until ${day(end)}.`) : L(`Bezahlt bis ${day(end)}.`, `Paid until ${day(end)}.`))),
      h('h3', { class: 'icc-h' }, trial ? L('Kündigst du jetzt, ist alles sofort weg.', 'Cancel now and it’s all gone instantly.') : L(`Ab ${day(end)} ist alles weg.`, `From ${day(end)}, it’s all gone.`)),
      h('p', { class: 'icx-lead' }, trial ? L(`Nicht erst am ${day(end)} – sondern in diesem Moment. Das verlierst du:`, `Not on ${day(end)} – right now. Here’s what you lose:`) : L('Bis dahin bleibt alles, wie es ist. Danach verlierst du:', 'Until then nothing changes. After that you lose:')),
      h('ul', { class: 'icx-ben icc-lose' }, LOSE.map(([ic, t, s], i) => h('li', { style: { '--i': String(i) } }, h('span', { class: 'icx-bi', html: ico(ic) }), h('span', {}, h('b', {}, t), h('small', {}, s))))),
      trial ? h('div', { class: 'icc-tip' }, h('b', {}, L('Tipp:', 'Tip:')), ' ', L(`Nutz den Test einfach weiter und kündige erst kurz vor dem ${day(end)} – bis dahin zahlst du nichts. Den kostenlosen Test gibt es nur einmal.`, `Keep using the trial and cancel just before ${day(end)} – you pay nothing until then. The free trial is one-time only.`)) : null,
      h('button', { class: 'btn primary lg ic-btn icx-cta', type: 'button', onclick: keep }, L('Inner Circle behalten', 'Keep the Inner Circle')),
      h('button', { class: 'icx-later icc-go', type: 'button', onclick: step2 }, L('Trotzdem kündigen', 'Cancel anyway')));
    const step2 = () => {
      box.classList.add('icc-2');
      box.replaceChildren(
        h('button', { class: 'iconbtn mx', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x'), onclick: () => close(false) }),
        h('div', { class: 'icx-top' }, f, h('div', { class: 'icx-why' }, L('Letzter Schritt', 'Last step'))),
        h('h3', { class: 'icc-h' }, L('Wirklich kündigen?', 'Really cancel?')),
        h('p', { class: 'icx-lead' }, trial ? L('Alle Vorteile enden sofort, und der kostenlose Test lässt sich nicht noch einmal starten.', 'All benefits end right away, and the free trial can’t be started again.') : L(`Dein Inner Circle endet am ${day(end)}. Danach wird nichts mehr abgebucht.`, `Your Inner Circle ends on ${day(end)}. Nothing is charged after that.`)),
        h('div', { class: 'icc-row' },
          h('button', { class: 'btn lg icc-yes', type: 'button', onclick: () => close(true) }, L('Ja, jetzt kündigen', 'Yes, cancel now')),
          h('button', { class: 'btn primary lg ic-btn', type: 'button', onclick: keep }, L('Doch behalten', 'Keep it'))));
      try { fc && fc.pulse && fc.pulse('sad', 1800); } catch (e) {}
      setTimeout(() => box.querySelector('.ic-btn')?.focus({ preventScroll: true }), 60);
    };
    step1();
    const bg = h('div', { class: 'modal-bg icx-bg', onclick: e => { if (e.target === bg) close(false); } }, box);
    document.body.appendChild(bg);
    document.addEventListener('keydown', onKey);
    try { const { face } = await import('./face.js'); fc = face(f, { follow: false }); setTimeout(() => fc.pulse && fc.pulse('sad', 1600), 500); } catch (e) {}
    setTimeout(() => box.querySelector('.icx-cta')?.focus({ preventScroll: true }), 60);
  });
}
