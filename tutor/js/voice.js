// Mit Max sprechen: Mikro → Abschrift (ElevenLabs) → Max antwortet → Antwort wird vorgelesen.
// Aufnahme stoppt automatisch, wenn man aufhört zu reden. Nichts wird gespeichert außer im eigenen Lernstand.
import { h, ico, ls, toast } from './util.js';
import { face } from './face.js';
import { ask } from './api.js';
import { save } from './state.js';
import { forChat } from './retrieve.js';
import { apiError, typeOut, syncOut } from './ui.js';
import { startLive } from './livestt.js';
import { liveWave } from './wave.js';
import { sanitize, richText } from './sanitize.js';
import { getSpice, thinkLines } from './max.js';
import { getOutLang, setOutLang, L } from './i18n.js';
import { getMic, releaseMic as freeMic } from './mic.js';
import { keepBoards } from './lib.js';

export const VOICES = [
  ['max', L('Max beim Aperol', 'Max over Aperol'), L('Anfang 20, entspannt auf der Terrasse', 'early 20s, relaxed on the terrace')],
  ['feiern', L('Max nach dem Feiern', 'Max after the party'), L('tief, etwas verkatert', 'deep, a bit hungover')],
  ['stimmbruch', L('Max vor dem Stimmbruch', 'Max before his voice broke'), L('hell und jung – die tiefe Stimme kommt noch', 'high and young – the deep voice is still coming')],
];
// Hörprobe: jede Stimme stellt sich kurz vor (Play-Knopf im Stimmen-Chip)
let sampleAudio = null;
export function voiceSample(voice) {
  const b = h('button', { class: 'pv', type: 'button', title: L('So klinge ich', 'This is how I sound'), 'aria-label': L('Hörprobe abspielen', 'Play voice sample'), html: ico('play') });
  b.addEventListener('click', e => {
    e.stopPropagation();
    if (sampleAudio && !sampleAudio.paused && sampleAudio._v === voice) { sampleAudio.pause(); b.innerHTML = ico('play'); b.classList.remove('on'); return; }
    if (sampleAudio) sampleAudio.pause();
    document.querySelectorAll('.pv').forEach(x => { x.innerHTML = ico('play'); x.classList.remove('on'); });
    sampleAudio = new Audio(`/tutor/audio/${voice}-${getOutLang() === 'en' ? 'en' : 'de'}.mp3?v=3`); sampleAudio._v = voice;
    sampleAudio.onended = sampleAudio.onpause = () => { b.innerHTML = ico('play'); b.classList.remove('on'); };
    b.innerHTML = ico('pause'); b.classList.add('on');
    sampleAudio.play().catch(() => { b.innerHTML = ico('play'); b.classList.remove('on'); });
  });
  return b;
}
export function voiceChip(k, label, desc, onPick) {
  const c = h('span', { class: 'chip vchip', role: 'button', tabindex: 0, title: desc, 'data-v': k }, label, voiceSample(k));
  const pick = () => onPick(k, c);
  c.addEventListener('click', pick);
  c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  return c;
}
export const getVoice = () => { const v = ls.get('tutor.voice', 'max'); return VOICES.some(x => x[0] === v) ? v : 'max'; };

const parse = raw => {
  const boards = [];
  let text = String(raw || '').replace(/```tafel[ \t]*([^\n]*)\n([\s\S]*?)(```|$)/g, (_, t, html) => { boards.push({ title: t.trim() || L('Tafel', 'Whiteboard'), html: html.trim() }); return '\n'; });
  text = text.replace(/\[\[[a-z:]+\]\]/g, '').replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return { text, boards };
};
const forHistory = raw => String(raw).replace(/```tafel[ \t]*([^\n]*)\n[\s\S]*?```/g, (_, t) => L(`[An die Tafel geschrieben: ${t.trim() || 'Tafel'}]`, `[Written on the whiteboard: ${t.trim() || 'Whiteboard'}]`)).slice(0, 3000);
const b64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
// stilles WAV, um Audio auf iPhone per Tipp freizuschalten
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

let open = false;
export function openVoice({ doc = null, onClose } = {}) {
  if (open) return; open = true;
  const canRec = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  const history = doc ? null : [];
  let state = 'idle', stream = null, rec = null, chunks = [], actx = null, raf = 0, ctrl = null, voice = getVoice(), live = null;
  const audio = new Audio(); audio.preload = 'auto';

  // ---------- Oberfläche ----------
  const fEl = h('div', { class: 'vface' });
  const ring = h('div', { class: 'vring' });
  const wave = liveWave(30);
  const vth = h('div', { class: 'thought vth', 'aria-live': 'polite' });
  let gen = 0;
  let vol = Math.max(0, Math.min(1, +ls.get('tutor.vol', 1))), muted = !!ls.get('tutor.muted', false);
  const stopBtn = h('button', { class: 'vstop', type: 'button', title: L('Stopp', 'Stop'), 'aria-label': L('Antwort stoppen', 'Stop answer'), html: '<svg class="ico" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg>' });
  const muteBtn = h('button', { class: 'iconbtn vmute', type: 'button' });
  const volIn = h('input', { type: 'range', min: 0, max: 100, value: Math.round(vol * 100), 'aria-label': L('Lautstärke', 'Volume') });
  const volBox = h('div', { class: 'vvol' }, muteBtn, volIn);
  const applyVol = () => {
    audio.volume = vol; audio.muted = muted || vol === 0;
    muteBtn.innerHTML = muted || vol === 0 ? '<svg class="ico" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>' : '<svg class="ico" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
    muteBtn.setAttribute('aria-label', muted ? L('Ton an', 'Unmute') : L('Stumm', 'Mute'));
    ls.set('tutor.vol', vol); ls.set('tutor.muted', muted);
  };
  muteBtn.addEventListener('click', () => { muted = !muted; if (!muted && vol === 0) { vol = .7; volIn.value = 70; } applyVol(); });
  volIn.addEventListener('input', () => { vol = +volIn.value / 100; muted = vol === 0; applyVol(); });
  const status = h('div', { class: 'vstatus', 'aria-live': 'polite' });
  const you = h('div', { class: 'vyou' });
  const said = h('div', { class: 'vsaid' });
  const boardBox = h('div', { class: 'vboard' });
  const mic = h('button', { class: 'vmic', type: 'button', 'aria-label': L('Sprechen', 'Speak') }, h('span', { html: ico('mic') }));
  const typeIn = h('input', { class: 'field', placeholder: L('Lieber tippen? Frag hier …', 'Rather type? Ask here …'), 'aria-label': L('Frage tippen', 'Type a question'), maxlength: 600 });
  const typeForm = h('form', { class: 'vtype' }, typeIn, h('button', { class: 'btn', type: 'submit' }, L('Senden', 'Send')));
  const chips = VOICES.map(([k, l, d]) => {
    const c = voiceChip(k, l, d, () => { voice = k; ls.set('tutor.voice', k); chips.forEach(x => x.classList.toggle('on', x === c)); });
    if (k === voice) c.classList.add('on');
    return c;
  });
  const lbs = [['de', 'DE'], ['en', 'EN']].map(([k, l]) => { const b = h('button', { type: 'button', class: k === getOutLang() ? 'on' : '' }, l); b.addEventListener('click', () => { setOutLang(k); lbs.forEach(x => x.classList.toggle('on', x === b)); }); return b; });
  const langSeg = h('div', { class: 'seg', title: L('Sprache, in der ich antworte', 'Language I answer in') }, lbs);
  const closeBtn = h('button', { class: 'iconbtn vclose', type: 'button', 'aria-label': L('Schließen', 'Close'), html: ico('x') });
  const ov = h('div', { class: 'voice', role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Sprich mit mir', 'Talk to me') },
    h('div', { class: 'vtop' }, h('div', { class: 'vchips' }, h('span', { class: 'eyebrow' }, L('Stimme', 'Voice')), chips), langSeg, closeBtn),
    h('div', { class: 'vmain' },
      h('div', { class: 'vstage' }, ring, fEl, vth), h('div', { class: 'vwave' }, wave.el),
      status, you, said, boardBox),
    h('div', { class: 'vbottom' }, h('div', { class: 'vctrl' }, stopBtn, mic, volBox), h('div', { class: 'vhint' }, doc ? L(`Max kennt „${doc.name}“ · 2 Einheiten pro Antwort`, `Max knows “${doc.name}” · 2 credits per answer`) : L('Frag mich alles aus BWL, VWL & Rechnungswesen · 2 Einheiten pro Antwort', 'Ask me anything in business, economics & accounting · 2 credits per answer')), typeForm));
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  const fc = face(fEl, {});
  requestAnimationFrame(() => ov.classList.add('in'));

  let vthIv = 0;
  const thinkOn = on => {
    clearInterval(vthIv);
    if (!on) { vth.classList.remove('on'); return; }
    const lines = thinkLines('voice', [L('Einen Moment …', 'One moment …')]); let i = 0;
    const show = () => { vth.textContent = lines[i++ % lines.length]; vth.animate([{ opacity: 0, transform: 'scale(.85) translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' }); };
    vth.classList.add('on'); show(); vthIv = setInterval(show, 2800);
  };
  const setState = (s, msg) => {
    state = s; ov.dataset.state = s;
    status.textContent = msg ?? ({ idle: canRec ? L('Tipp aufs Mikro und frag los.', 'Tap the mic and ask away.') : L('Dein Browser kann hier nicht aufnehmen – tipp deine Frage unten ein.', 'Your browser can’t record here – type your question below.'), listen: L('Max hört zu …', 'Max is listening …'), think: L('Max denkt nach …', 'Max is thinking …'), speak: L('Max redet … (tippen zum Unterbrechen)', 'Max is talking … (tap to interrupt)') })[s];
    fc.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
    thinkOn(s === 'think');
    if (s === 'speak') wave.talk(); else if (s !== 'listen') wave.stop();
    mic.setAttribute('aria-label', s === 'listen' ? L('Aufnahme beenden', 'Stop recording') : s === 'speak' ? L('Unterbrechen und sprechen', 'Interrupt and speak') : L('Sprechen', 'Speak'));
  };
  setState('idle');
  if (!canRec) mic.disabled = true;
  if (!doc) said.replaceChildren(h('p', {}, L('Moin. Frag mich, was du willst – Kapitalwert, Bilanz, Elastizität. Mit deinem Skript wird’s noch besser.', 'Hey. Ask me whatever you want – NPV, balance sheets, elasticity. With your slides it gets even better.')));

  // ---------- Aufnahme ----------
  async function startListen() {
    try { audio.pause(); } catch (e) {}
    try { audio.src = SILENT; audio.play().catch(() => {}); } catch (e) {}
    if (!stream) {
      try { stream = await getMic(); }
      catch (e) { setState('idle', L('Ich darf dein Mikro nicht benutzen. Erlaub es oben in der Adressleiste – oder tipp unten.', 'I’m not allowed to use your mic. Allow it up in the address bar – or type below.')); fc.pulse('sad'); return; }
    }
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(m => MediaRecorder.isTypeSupported?.(m)) || '';
    rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
    chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => onRecorded(rec.mimeType || mime || 'audio/webm');
    rec.start(250);
    setState('listen');
    // Stille erkennen
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    wave.mic(actx, stream);
    live = startLive(actx, stream, { onText: t => { if (t) you.replaceChildren(h('span', { class: 'eyebrow' }, L('Du', 'You')), h('p', { class: 'vlive' }, t)); } });
    const src = actx.createMediaStreamSource(stream), an = actx.createAnalyser(); an.fftSize = 1024; src.connect(an);
    const buf = new Float32Array(an.fftSize);
    const t0 = performance.now(); let floor = 0.008, spoke = false, lastLoud = t0, n = 0;
    const tick = () => {
      if (state !== 'listen') { src.disconnect(); return; }
      an.getFloatTimeDomainData(buf);
      let s = 0; for (const v of buf) s += v * v; const rms = Math.sqrt(s / buf.length);
      const t = performance.now();
      if (t - t0 < 350) { floor = Math.max(floor, rms * 0.9); n++; }
      const loud = rms > Math.max(0.018, floor * 2.6);
      if (loud) { spoke = true; lastLoud = t; }
      ring.style.transform = `scale(${1 + Math.min(.45, rms * 6)})`;
      if (spoke && t - lastLoud > 1300) return stopListen();
      if (!spoke && t - t0 > 9000) { stopListen(true); return; }
      if (t - t0 > 45000) return stopListen();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function stopListen(cancel = false) {
    cancelAnimationFrame(raf); ring.style.transform = '';
    if (!rec || rec.state === 'inactive') return;
    rec._cancel = cancel;
    rec.stop();
  }
  async function onRecorded(mime) {
    const lv = live; live = null;
    if (rec?._cancel) { lv && lv.cancel(); setState('idle', L('Ich hab nichts gehört. Tipp nochmal aufs Mikro.', 'I didn’t hear anything. Tap the mic again.')); return; }
    const blob = new Blob(chunks, { type: mime });
    setState('think', L('Max hört genau hin …', 'Max is listening closely …'));
    if (lv) {
      const my0 = gen;
      const lt = await lv.finish();
      if (my0 !== gen) return;
      if (lt && lt.length > 1) { try { await answer(lt); } catch (e) { fail(e); } return; }
    }
    if (blob.size < 1500) { setState('idle', L('Das war zu kurz. Nochmal?', 'That was too short. Again?')); return; }
    try {
      const r = await ask('stt', { audio: await b64(blob), mime });
      await answer(r.text);
    } catch (e) { fail(e); }
  }

  // ---------- Antwort ----------
  async function answer(text) {
    text = String(text || '').trim(); if (!text) return;
    you.replaceChildren(h('span', { class: 'eyebrow' }, L('Du', 'You')), h('p', {}, text));
    said.replaceChildren(); boardBox.replaceChildren();
    setState('think');
    const my = ++gen;
    ctrl = new AbortController();
    try {
      const msgs = doc ? doc.chat : history;
      msgs.push({ role: 'user', content: text });
      const hist = msgs.slice(-12).map(m => ({ role: m.role, content: m.role === 'assistant' ? forHistory(m.content) : m.content }));
      const payload = { messages: hist, opts: { mode: 'erklaeren', spice: getSpice(), voice: true } };
      if (doc) Object.assign(payload, { material: forChat(doc, text + ' ' + msgs.slice(-3).map(m => m.content).join(' ')), docName: doc.name });
      const r = await ask('chat', payload, { signal: ctrl.signal });
      const raw = r.text || '';
      msgs.push({ role: 'assistant', content: raw });
      const p = parse(raw);
      keepBoards(p.boards, { doc, question: text, answer: p.text });   // jede Tafel automatisch in die Bibliothek
      if (doc) { if (doc.chat.length > 80) doc.chat = doc.chat.slice(-80); save(doc); }
      const sp = h('div', { class: 'vsaid-tx' }, h('span', { class: 'typing' }, h('i'), h('i'), h('i'))); said.replaceChildren(h('span', { class: 'eyebrow' }, 'Max'), sp);
      shownTx = false;
      showTx = au => { if (shownTx) return; shownTx = true; if (au) syncOut(sp, p.text, au); else typeOut(sp, p.text, { alive: () => my === gen }); };
      if (p.boards.length) { const b = p.boards[0]; const t = h('div', { class: 'tafel' }); t.appendChild(sanitize(b.html)); boardBox.replaceChildren(h('div', { class: 'eyebrow' }, L('An der Tafel · ', 'On the whiteboard · ') + b.title), t); }
      if (my !== gen) return;
      await speak(p.text, my);
    } catch (e) {
      if (e?.name === 'AbortError') return;
      const msgs = doc ? doc.chat : history; if (msgs[msgs.length - 1]?.role === 'user') msgs.pop();
      fail(e);
    } finally { ctrl = null; }
  }
  let showTx = () => {}, shownTx = true;
  async function speak(text, my = gen) {
    if (!text) { showTx(null); setState('idle'); return; }
    if (muted || vol === 0) { showTx(null); setState('idle', L('Stumm geschaltet – die Antwort steht oben.', 'Muted – the answer is above.')); return; }
    try {
      const r = await ask('tts', { text, opts: { voice } });
      if (my !== gen) { showTx(null); return; }
      const bin = atob(r.audio); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: r.mime || 'audio/mpeg' }));
      audio.src = url; applyVol();
      setState('speak');
      audio.onended = () => { URL.revokeObjectURL(url); if (state === 'speak') { setState('idle', L('Noch was? Tipp aufs Mikro.', 'Anything else? Tap the mic.')); fc.pulse('happy', 900); } };
      let ok = true;
      await audio.play().catch(() => { ok = false; setState('idle', L('Tipp aufs Mikro, um weiterzureden. (Ton war blockiert)', 'Tap the mic to keep talking. (Sound was blocked)')); });
      showTx(ok ? audio : null);
    } catch (e) {
      showTx(null);
      setState('idle', e?.code === 'voice_busy' || e?.code === 'cap' ? e.message : L('Vorlesen hat nicht geklappt – die Antwort steht oben.', 'Reading aloud didn’t work – the answer is above.'));
    }
  }
  function fail(e) {
    fc.pulse('sad', 1400);
    if (e?.code === 'limit') { setState('idle', L('Tageslimit erreicht.', 'Daily limit reached.')); apiError(e); return; }
    setState('idle', e?.message || L('Das hat nicht geklappt. Nochmal?', 'That didn’t work. Again?'));
  }

  // ---------- Stopp ----------
  const stopAll = () => {
    gen++;
    if (state === 'listen') { stopListen(true); }
    if (ctrl) { ctrl.abort(); ctrl = null; const msgs = doc ? doc.chat : history; if (msgs[msgs.length - 1]?.role === 'user') msgs.pop(); }
    try { audio.pause(); } catch (e) {}
    if (live) { live.cancel(); live = null; }
    showTx(null);
    setState('idle', L('Gestoppt. Frag einfach neu.', 'Stopped. Just ask again.'));
  };
  stopBtn.addEventListener('click', stopAll);
  applyVol();

  // ---------- Bedienung ----------
  mic.addEventListener('click', () => {
    if (state === 'listen') return stopListen();
    if (state === 'think') return;
    if (state === 'speak') { audio.pause(); }
    startListen();
  });
  typeForm.addEventListener('submit', e => { e.preventDefault(); const t = typeIn.value.trim(); if (!t || state === 'think') return; typeIn.value = ''; if (state === 'speak') audio.pause(); try { audio.src = SILENT; audio.play().catch(() => {}); } catch (x) {} answer(t); });
  const close = () => {
    gen++; thinkOn(false);
    open = false;
    try { stopListen(true); } catch (e) {}
    try { audio.pause(); } catch (e) {}
    ctrl && ctrl.abort();
    if (stream) { freeMic(); stream = null; }
    try { actx && actx.close(); } catch (e) {}
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
    ov.classList.remove('in'); setTimeout(() => ov.remove(), 250);
    onClose && onClose();
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  closeBtn.addEventListener('click', close);
  setTimeout(() => (canRec ? mic : typeIn).focus(), 80);
}

// Knopf „Mit Max sprechen“
export function voiceButton({ doc, cls = 'btn', label = L('Sprich mit mir', 'Talk to me'), onClose } = {}) {
  return h('button', { class: cls, type: 'button', onclick: () => openVoice({ doc: typeof doc === 'function' ? doc() : doc, onClose }) }, h('span', { html: ico('mic') }), label);
}
