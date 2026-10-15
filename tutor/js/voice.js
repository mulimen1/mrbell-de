// Mit Max sprechen: Mikro → Abschrift (ElevenLabs) → Max antwortet → Antwort wird vorgelesen.
// Aufnahme stoppt automatisch, wenn man aufhört zu reden. Nichts wird gespeichert außer im eigenen Lernstand.
import { h, ico, ls, toast } from './util.js';
import { face } from './face.js';
import { ask } from './api.js';
import { save } from './state.js';
import { forChat } from './retrieve.js';
import { apiError } from './ui.js';
import { sanitize, richText } from './sanitize.js';
import { getSpice } from './max.js';
import { getOutLang, setOutLang } from './i18n.js';

export const VOICES = [
  ['max', 'Max', 'Anfang 20, ganz normal'],
  ['feiern', 'Max nach dem Feiern', 'tief, etwas verkatert'],
  ['stimmbruch', 'Max vor dem Stimmbruch', 'hell (Frauenstimme)'],
];
export const getVoice = () => { const v = ls.get('tutor.voice', 'max'); return VOICES.some(x => x[0] === v) ? v : 'max'; };

const parse = raw => {
  const boards = [];
  let text = String(raw || '').replace(/```tafel[ \t]*([^\n]*)\n([\s\S]*?)(```|$)/g, (_, t, html) => { boards.push({ title: t.trim() || 'Tafel', html: html.trim() }); return '\n'; });
  text = text.replace(/\[\[[a-z:]+\]\]/g, '').replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return { text, boards };
};
const forHistory = raw => String(raw).replace(/```tafel[ \t]*([^\n]*)\n[\s\S]*?```/g, (_, t) => `[An die Tafel geschrieben: ${t.trim() || 'Tafel'}]`).slice(0, 3000);
const b64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
// stilles WAV, um Audio auf iPhone per Tipp freizuschalten
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

let open = false;
export function openVoice({ doc = null, onClose } = {}) {
  if (open) return; open = true;
  const canRec = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  const history = doc ? null : [];
  let state = 'idle', stream = null, rec = null, chunks = [], actx = null, raf = 0, ctrl = null, voice = getVoice();
  const audio = new Audio(); audio.preload = 'auto';

  // ---------- Oberfläche ----------
  const fEl = h('div', { class: 'vface' });
  const ring = h('div', { class: 'vring' });
  const status = h('div', { class: 'vstatus', 'aria-live': 'polite' });
  const you = h('div', { class: 'vyou' });
  const said = h('div', { class: 'vsaid' });
  const boardBox = h('div', { class: 'vboard' });
  const mic = h('button', { class: 'vmic', type: 'button', 'aria-label': 'Sprechen' }, h('span', { html: ico('mic') }));
  const typeIn = h('input', { class: 'field', placeholder: 'Lieber tippen? Frag hier …', 'aria-label': 'Frage tippen', maxlength: 600 });
  const typeForm = h('form', { class: 'vtype' }, typeIn, h('button', { class: 'btn', type: 'submit' }, 'Senden'));
  const chips = VOICES.map(([k, l, d]) => {
    const c = h('button', { class: 'chip' + (k === voice ? ' on' : ''), type: 'button', title: d }, l);
    c.addEventListener('click', () => { voice = k; ls.set('tutor.voice', k); chips.forEach(x => x.classList.toggle('on', x === c)); });
    return c;
  });
  const lbs = [['de', 'DE'], ['en', 'EN']].map(([k, l]) => { const b = h('button', { type: 'button', class: k === getOutLang() ? 'on' : '' }, l); b.addEventListener('click', () => { setOutLang(k); lbs.forEach(x => x.classList.toggle('on', x === b)); }); return b; });
  const langSeg = h('div', { class: 'seg', title: 'Sprache, in der Max antwortet' }, lbs);
  const closeBtn = h('button', { class: 'iconbtn vclose', type: 'button', 'aria-label': 'Schließen', html: ico('x') });
  const ov = h('div', { class: 'voice', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Mit Max sprechen' },
    h('div', { class: 'vtop' }, h('div', { class: 'vchips' }, h('span', { class: 'eyebrow' }, 'Stimme'), chips), langSeg, closeBtn),
    h('div', { class: 'vmain' },
      h('div', { class: 'vstage' }, ring, fEl),
      status, you, said, boardBox),
    h('div', { class: 'vbottom' }, mic, h('div', { class: 'vhint' }, doc ? `Max kennt „${doc.name}“ · 2 Einheiten pro Antwort` : 'Frag Max alles aus BWL, VWL & Rechnungswesen · 2 Einheiten pro Antwort'), typeForm));
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  const fc = face(fEl, {});
  requestAnimationFrame(() => ov.classList.add('in'));

  const setState = (s, msg) => {
    state = s; ov.dataset.state = s;
    status.textContent = msg ?? ({ idle: canRec ? 'Tipp aufs Mikro und frag los.' : 'Dein Browser kann hier nicht aufnehmen – tipp deine Frage unten ein.', listen: 'Ich höre zu …', think: 'Max denkt nach …', speak: 'Max spricht … (tippen zum Unterbrechen)' })[s];
    fc.set(s === 'think' ? 'think' : s === 'speak' ? 'talk' : 'idle');
    mic.setAttribute('aria-label', s === 'listen' ? 'Aufnahme beenden' : s === 'speak' ? 'Unterbrechen und sprechen' : 'Sprechen');
  };
  setState('idle');
  if (!canRec) mic.disabled = true;
  if (!doc) said.replaceChildren(h('p', {}, 'Moin. Frag mich, was du willst – Kapitalwert, Bilanz, Elastizität. Mit deinem Skript wird’s noch besser.'));

  // ---------- Aufnahme ----------
  async function startListen() {
    try { audio.pause(); } catch (e) {}
    try { audio.src = SILENT; audio.play().catch(() => {}); } catch (e) {}
    if (!stream) {
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
      catch (e) { setState('idle', 'Ich darf dein Mikro nicht benutzen. Erlaub es oben in der Adressleiste – oder tipp unten.'); fc.pulse('sad'); return; }
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
    if (rec?._cancel) { setState('idle', 'Ich hab nichts gehört. Tipp nochmal aufs Mikro.'); return; }
    const blob = new Blob(chunks, { type: mime });
    if (blob.size < 1500) { setState('idle', 'Das war zu kurz. Nochmal?'); return; }
    setState('think', 'Ich hör mir das kurz an …');
    try {
      const r = await ask('stt', { audio: await b64(blob), mime });
      await answer(r.text);
    } catch (e) { fail(e); }
  }

  // ---------- Antwort ----------
  async function answer(text) {
    text = String(text || '').trim(); if (!text) return;
    you.replaceChildren(h('span', { class: 'eyebrow' }, 'Du'), h('p', {}, text));
    said.replaceChildren(); boardBox.replaceChildren();
    setState('think');
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
      if (doc) { p.boards.forEach(b => doc.boards.push({ ...b, at: Date.now() })); if (doc.chat.length > 80) doc.chat = doc.chat.slice(-80); save(doc); }
      said.replaceChildren(h('span', { class: 'eyebrow' }, 'Max'), h('p', {}, richText(p.text)));
      if (p.boards.length) { const b = p.boards[0]; const t = h('div', { class: 'tafel' }); t.appendChild(sanitize(b.html)); boardBox.replaceChildren(h('div', { class: 'eyebrow' }, 'An der Tafel · ' + b.title), t); }
      await speak(p.text);
    } catch (e) {
      if (e?.name === 'AbortError') return;
      const msgs = doc ? doc.chat : history; if (msgs[msgs.length - 1]?.role === 'user') msgs.pop();
      fail(e);
    } finally { ctrl = null; }
  }
  async function speak(text) {
    if (!text) { setState('idle'); return; }
    try {
      const r = await ask('tts', { text, opts: { voice } });
      const bin = atob(r.audio); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: r.mime || 'audio/mpeg' }));
      audio.src = url;
      setState('speak');
      audio.onended = () => { URL.revokeObjectURL(url); if (state === 'speak') { setState('idle', 'Noch was? Tipp aufs Mikro.'); fc.pulse('happy', 900); } };
      await audio.play().catch(() => { setState('idle', 'Tipp aufs Mikro, um weiterzureden. (Ton war blockiert)'); });
    } catch (e) {
      setState('idle', e?.code === 'voice_busy' || e?.code === 'cap' ? e.message : 'Vorlesen hat nicht geklappt – die Antwort steht oben.');
    }
  }
  function fail(e) {
    fc.pulse('sad', 1400);
    if (e?.code === 'limit') { setState('idle', 'Tageslimit erreicht.'); apiError(e); return; }
    setState('idle', e?.message || 'Das hat nicht geklappt. Nochmal?');
  }

  // ---------- Bedienung ----------
  mic.addEventListener('click', () => {
    if (state === 'listen') return stopListen();
    if (state === 'think') return;
    if (state === 'speak') { audio.pause(); }
    startListen();
  });
  typeForm.addEventListener('submit', e => { e.preventDefault(); const t = typeIn.value.trim(); if (!t || state === 'think') return; typeIn.value = ''; if (state === 'speak') audio.pause(); try { audio.src = SILENT; audio.play().catch(() => {}); } catch (x) {} answer(t); });
  const close = () => {
    open = false;
    try { stopListen(true); } catch (e) {}
    try { audio.pause(); } catch (e) {}
    ctrl && ctrl.abort();
    stream && stream.getTracks().forEach(t => t.stop());
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
export function voiceButton({ doc, cls = 'btn', label = 'Mit Max sprechen', onClose } = {}) {
  return h('button', { class: cls, type: 'button', onclick: () => openVoice({ doc: typeof doc === 'function' ? doc() : doc, onClose }) }, h('span', { html: ico('mic') }), label);
}
