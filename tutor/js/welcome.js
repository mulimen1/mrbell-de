// Willkommen im Club: kommt einmal, direkt nach dem Konto-Erstellen und dem Spitznamen.
// Echte Nutzernummer vom Server – „einer der ersten 100“ nur, wenn es stimmt. Danach: Beta, wir brauchen dein Feedback.
import { h, ico, ls } from './util.js';
import { L } from './i18n.js';

export function welcomeFirst({ nick = '', nr = 0 } = {}) {
  if (ls.get('tutor.welcomed', 0)) return Promise.resolve();
  ls.set('tutor.welcomed', Date.now());
  return new Promise(async resolve => {
    const first100 = nr > 0 && nr <= 100;
    let gone = false;
    const close = v => {
      if (gone) return; gone = true;
      bg.classList.add('out'); removeEventListener('keydown', onKey);
      setTimeout(() => { bg.remove(); resolve(v); }, 420);
    };
    const onKey = e => { if (e.key === 'Escape') close(); };
    const f = h('span', { class: 'wl-face' });
    const name = nick ? h('span', { class: 'wl-nick' }, nick) : null;
    const box = h('div', { class: 'wl', role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Willkommen', 'Welcome') },
      h('span', { class: 'icx-shine', 'aria-hidden': 'true' }),
      f,
      first100
        ? h('div', { class: 'wl-badge' }, h('span', { class: 'ic-lt' }, L(`Nutzer Nr. ${nr}`, `Member no. ${nr}`)), h('span', { class: 'wl-dot' }), L('einer der ersten 100', 'one of the first 100'))
        : h('div', { class: 'wl-badge' }, h('span', { class: 'ic-lt' }, 'BWL Max'), h('span', { class: 'wl-dot' }), L('frisch gestartet', 'just launched')),
      h('h2', { class: 'wl-h' }, L('Willkommen', 'Welcome'), name ? [', ', name] : null, '.'),
      h('p', { class: 'wl-lead' }, first100
        ? L('Du gehörst zu den Allerersten bei BWL Max. Danke, dass du dabei bist – wir freuen uns riesig, dass du dein Studium mit Max angehst.', 'You’re one of the very first on BWL Max. Thanks for being here – we’re thrilled you’re tackling your studies with Max.')
        : L('BWL Max ist gerade frisch gestartet. Danke, dass du dabei bist – wir freuen uns riesig, dass du dein Studium mit Max angehst.', 'BWL Max has just launched. Thanks for being here – we’re thrilled you’re tackling your studies with Max.')),
      h('div', { class: 'wl-card' },
        h('span', { class: 'icx-bi', html: ico('chat') }),
        h('div', {},
          h('b', {}, L('Wir bauen BWL Max mit dir.', 'We’re building BWL Max with you.')),
          h('p', {}, matchMedia('(max-width: 760px)').matches
            ? L('Fehlt dir was? Nervt dich was? Hast du eine Idee? Sag es uns – über „Feedback“ unter „Tools“. Wir lesen jedes einzelne selbst.', 'Missing something? Annoyed by something? Got an idea? Tell us – via “Feedback” under “Tools”. We read every single one ourselves.')
            : L('Fehlt dir was? Nervt dich was? Hast du eine Idee? Sag es uns – über „Feedback“ oben rechts oder unten links. Wir lesen jedes einzelne selbst.', 'Missing something? Annoyed by something? Got an idea? Tell us – via “Feedback” top right or bottom left. We read every single one ourselves.')))),
      h('div', { class: 'wl-row' },
        h('button', { class: 'btn lg wl-fb', type: 'button', onclick: () => { close('fb'); setTimeout(() => import('./feedback.js').then(m => m.openFeedback('idee')), 440); } }, L('Feedback geben', 'Give feedback')),
        h('button', { class: 'btn primary lg wl-go', type: 'button', onclick: () => close('go') }, L('Los geht’s', 'Let’s go'), h('span', { html: ico('right') }))));
    const bg = h('div', { class: 'wl-bg' }, box);
    bg.addEventListener('click', e => { if (e.target === bg) close(); });
    document.body.appendChild(bg);
    addEventListener('keydown', onKey);
    try { const { face } = await import('./face.js'); const fc = face(f, { follow: false }); setTimeout(() => fc.pulse && fc.pulse('happy', 1600), 700); } catch (e) {}
    setTimeout(() => box.querySelector('.wl-go')?.focus({ preventScroll: true }), 80);
  });
}
