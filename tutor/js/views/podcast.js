// Podcast: Zwei Stimmen sprechen über das Skript (Sprachausgabe des Geräts, kostenlos & offline)
import { h, ico, uid, toast, modal, ls } from '../util.js';
import { ask } from '../api.js';
import { save } from '../state.js';
import { forWhole, forChapter } from '../retrieve.js';
import { loading, apiError, costBtn } from '../ui.js';
import { SPICE, getSpice } from '../max.js';
import { getOutLang, setOutLang } from '../i18n.js';

const synth = window.speechSynthesis;
function voices() { return synth ? synth.getVoices().filter(v => /^de(-|_|$)/i.test(v.lang)) : []; }
function pickVoices() {
  const vs = voices();
  const score = (v, female) => {
    const n = v.name.toLowerCase(); let s = 0;
    if (/neural|natural|premium|enhanced|online|google/.test(n)) s += 3;
    const fem = /anna|helena|petra|katja|marlene|vicki|hedda|amala|seraphina|elke|female|frau|sabine|steffi|ingrid|louisa|conny|gisela|katharina|tanja|klara|leonie/.test(n);
    const mal = /markus|yannick|martin|hans|conrad|stefan|killian|male|florian|bernd|christoph|ralf|jonas|kasper|klaus|viktor|reed|eddy|grandpa/.test(n);
    if (female && fem) s += 5; if (!female && mal) s += 5; if (female && mal) s -= 4; if (!female && fem) s -= 4;
    if (/de-de/i.test(v.lang)) s += 1;
    return s;
  };
  const a = [...vs].sort((x, y) => score(y, true) - score(x, true))[0] || null;
  const b = [...vs].filter(v => v !== a).sort((x, y) => score(y, false) - score(x, false))[0] || a;
  return { Lisa: a, Lena: a, Max: b };
}

export async function render(root, ctx) {
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  if (synth && !synth.getVoices().length) await new Promise(r => { const t = setTimeout(r, 1200); synth.addEventListener('voiceschanged', () => { clearTimeout(t); r(); }, { once: true }); });
  const pod = ctx.doc.podcasts[ctx.doc.podcasts.length - 1];
  const auto = ctx.arg === 'auto'; if (auto) history.replaceState(null, '', location.hash.replace(/\/auto$/, ''));
  if (auto) generate(wrap, ctx, 'kurz', -1, getSpice(), getOutLang(), ls.get('tutor.podVoice', 'max')); else if (pod) player(wrap, ctx, pod); else intro(wrap, ctx);
  return () => { try { synth && synth.cancel(); } catch (e) {} };
}

const MAXV = [['max', 'Max · klassisch'], ['feiern', 'Max · nach dem Feiern']];
let previewAudio = null;
function previewBtn(voice, getLang) {
  const b = h('button', { class: 'pv', type: 'button', title: 'So klinge ich', 'aria-label': 'Hörprobe abspielen', html: ico('play') });
  b.addEventListener('click', e => {
    e.stopPropagation();
    if (previewAudio && !previewAudio.paused && previewAudio._v === voice) { previewAudio.pause(); b.innerHTML = ico('play'); return; }
    if (previewAudio) previewAudio.pause();
    document.querySelectorAll('.pv').forEach(x => x.innerHTML = ico('play'));
    previewAudio = new Audio(`/tutor/audio/${voice}-${getLang()}.mp3`); previewAudio._v = voice;
    previewAudio.onended = () => { b.innerHTML = ico('play'); };
    b.innerHTML = ico('pause');
    previewAudio.play().catch(() => { b.innerHTML = ico('play'); });
  });
  return b;
}

function intro(wrap, ctx) {
  const { doc } = ctx;
  let len = 'kurz', focus = -1, tone = getSpice(), plang = getOutLang(), mvoice = ls.get('tutor.podVoice', 'max');
  const TONE_HINT = { 1: 'Komplett sachlich – wie eine gute Vorlesung zum Anhören.', 2: 'Locker, mit ein paar Sprüchen von Max.', 3: 'Max dreht auf: Sylt, Porsche, Papas Holding. Fachlich trotzdem exakt.' };
  const hint = h('div', { class: 'eyebrow', style: { marginTop: '8px', textTransform: 'none', letterSpacing: 0 } }, TONE_HINT[tone]);
  const tones = SPICE.map(([k, l]) => { const c = h('button', { class: 'chip' + (k === tone ? ' on' : '') }, l); c.addEventListener('click', () => { tone = k; tones.forEach(x => x.classList.toggle('on', x === c)); hint.textContent = TONE_HINT[k]; }); return c; });
  const langs = [['de', 'Deutsch'], ['en', 'English']].map(([k, l]) => { const c = h('button', { class: 'chip' + (k === plang ? ' on' : '') }, l); c.addEventListener('click', () => { plang = k; langs.forEach(x => x.classList.toggle('on', x === c)); }); return c; });
  const mvs = MAXV.map(([k, l]) => { const c = h('span', { class: 'chip vchip' + (k === mvoice ? ' on' : ''), role: 'button', tabindex: 0 }, l, previewBtn(k, () => plang)); c.addEventListener('click', () => { mvoice = k; ls.set('tutor.podVoice', k); mvs.forEach(x => x.classList.toggle('on', x === c)); }); return c; });
  const lisa = h('span', { class: 'chip vchip on fixed' }, 'Lisa', previewBtn('lisa', () => plang));
  const sel = h('select', { class: 'field' }, h('option', { value: -1 }, 'Ganzes Skript'), (doc.path?.chapters || []).map((c, i) => h('option', { value: i }, `${i + 1}. ${c.title}`)));
  sel.addEventListener('change', () => focus = +sel.value);
  const lens = [['kurz', 'Kurz · ~5 Min.'], ['lang', 'Lang · ~10 Min.']].map(([k, l]) => { const c = h('button', { class: 'chip' + (k === len ? ' on' : '') }, l); c.addEventListener('click', () => { len = k; lens.forEach(x => x.classList.toggle('on', x === c)); }); return c; });
  wrap.replaceChildren(
    h('div', { class: 'pod' },
      h('div', { class: 'cover' }, h('div', { class: 'eyebrow', style: { color: 'inherit', opacity: .7 } }, 'BWL Max · Podcast'), h('h3', {}, doc.name), wave()),
      h('div', {},
        h('div', { class: 'eyebrow' }, 'Podcast'), h('h2', { style: { fontSize: '30px', letterSpacing: '-.03em', margin: '6px 0 8px' } }, 'Dein Skript zum Anhören'),
        h('p', { style: { color: 'var(--mute)', marginTop: 0 } }, 'Lisa erklärt, Max fragt nach – mit echten Stimmen, Beispielen und den typischen Fehlern. Perfekt für Bahn, Gym oder Spaziergang.'),
        h('div', { class: 'setup', style: { marginTop: '18px' } },
          h('div', { class: 'grid' }, h('div', {}, h('label', { class: 'l' }, 'Thema'), sel), h('div', {}, h('label', { class: 'l' }, 'Länge'), h('div', { class: 'chips' }, lens))),
          h('div', { class: 'grid', style: { marginTop: '14px' } },
            h('div', {}, h('label', { class: 'l' }, 'Sprache der Folge'), h('div', { class: 'chips' }, langs)),
            h('div', {}, h('label', { class: 'l' }, 'Stimmen · ▶ zum Reinhören'), h('div', { class: 'chips' }, mvs, lisa))),
          h('div', { style: { marginTop: '14px' } }, h('label', { class: 'l' }, 'Ton'), h('div', { class: 'chips' }, tones), hint),
          h('div', { class: 'qactions' }, h('span', { class: 'sp' }), costBtn('Folge erstellen', 'podcast', () => generate(wrap, ctx, len, focus, tone, plang, mvoice), 'btn primary lg'))))),
    doc.podcasts.length ? h('div', { style: { marginTop: '26px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Deine Folgen'),
      h('div', { class: 'list' }, [...doc.podcasts].reverse().map(p => h('div', { class: 'li', onclick: () => player(wrap, ctx, p) }, h('span', { html: ico('pod') }), h('div', { class: 'gr' }, h('b', {}, p.title), h('span', {}, `${p.lines.length} Abschnitte · ~${minutes(p)} Min.${p.lang === 'en' ? ' · English' : ''}`)))))) : null);
}
const minutes = p => Math.max(1, Math.round(p.lines.reduce((a, l) => a + l.t.split(/\s+/).length, 0) / 150));
function wave() { const w = h('div', { class: 'wave' }); for (let i = 0; i < 30; i++) w.appendChild(h('i', { style: { '--h': (25 + Math.random() * 75) + '%', animationDelay: (i * 53 % 900) + 'ms', animationPlayState: 'paused' } })); return w; }

async function generate(wrap, ctx, len, focus, tone = 2, plang = getOutLang(), mvoice = 'max') {
  const { doc } = ctx;
  const ch = focus >= 0 ? doc.path.chapters[focus] : null;
  const ld = loading(wrap, 'Lisa und Max nehmen auf …', ['Schreibe das Skript', 'Baue Beispiele ein', 'Max sucht sich eine knifflige Frage', 'Fast fertig']);
  try {
    const r = await ask('podcast', { material: ch ? forChapter(doc, ch) : forWhole(doc), docName: doc.name, lang: plang, opts: { length: len, focus: ch ? ch.title : '', spice: tone } });
    const lines = (r.data?.lines || []).filter(l => l && l.t).map(l => ({ s: /max/i.test(l.s) ? 'Max' : 'Lisa', t: String(l.t) }));
    if (lines.length < 4) throw new Error('Die Folge ist nicht vollständig angekommen. Versuch es nochmal.');
    const p = { id: uid(), title: r.data.title || 'Folge', lines, created: Date.now(), lang: plang, voice: mvoice, real: true, audio: [] };
    doc.podcasts.push(p); save(doc);
    ld.stop(); player(wrap, ctx, p);
  } catch (e) { ld.stop(); intro(wrap, ctx); apiError(e, () => generate(wrap, ctx, len, focus, tone, plang, mvoice)); }
}

function player(wrap, ctx, p) {
  const { doc } = ctx;
  const V = pickVoices();
  p.audio ||= [];
  let idx = 0, playing = false, rate = 1, token = 0;
  const real = () => p.real !== false && p.voice;
  const audio = new Audio(); audio.preload = 'auto';
  const pending = new Map();
  const playBtn = h('button', { class: 'play', 'aria-label': 'Abspielen', html: ico('play') });
  const track = h('i');
  const status = h('div', { class: 'eyebrow pstat', style: { marginTop: '10px', textTransform: 'none', letterSpacing: 0 } });
  const tbar = h('div', { class: 'ptrack', onclick: e => { const r = tbar.getBoundingClientRect(); seek(Math.floor((e.clientX - r.left) / r.width * p.lines.length)); } }, track);
  const lines = p.lines.map((l, k) => h('div', { class: 'line', onclick: () => seek(k) }, h('span', { class: 'who' }, l.s), h('span', {}, l.t)));
  const script = h('div', { class: 'script' }, lines);
  const w = wave();
  const rates = [0.9, 1, 1.25, 1.5].map(r => { const c = h('button', { class: 'chip' + (r === rate ? ' on' : '') }, r.toString().replace('.', ',') + '×'); c.addEventListener('click', () => { rate = r; audio.playbackRate = r; rates.forEach(x => x.classList.toggle('on', x === c)); if (playing && !real()) seek(idx); }); return c; });
  wrap.replaceChildren(
    h('button', { class: 'btn sm ghost', style: { marginBottom: '12px' }, onclick: () => { stop(); intro(wrap, ctx); } }, h('span', { html: ico('left') }), 'Alle Folgen'),
    h('div', { class: 'pod' },
      h('div', {}, h('div', { class: 'cover' }, h('div', { class: 'eyebrow', style: { color: 'inherit', opacity: .7 } }, 'BWL Max · Podcast'), h('h3', {}, p.title), w),
        h('div', { class: 'player' }, playBtn, tbar), status,
        h('div', { class: 'chips', style: { marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' } }, rates),
        h('div', { style: { marginTop: '12px', display: 'flex', gap: '6px' } },
          h('button', { class: 'btn sm ghost', onclick: () => { const t = p.lines.map(l => `${l.s}: ${l.t}`).join('\n\n'); const a = h('a', { href: URL.createObjectURL(new Blob([p.title + '\n\n' + t], { type: 'text/plain' })), download: p.title + '.txt' }); document.body.appendChild(a); a.click(); a.remove(); } }, h('span', { html: ico('download') }), 'Skript'),
          h('button', { class: 'btn sm ghost', onclick: async () => { const ok = await modal({ title: 'Folge löschen?', text: p.title, actions: [{ label: 'Abbrechen', value: false }, { label: 'Löschen', value: true, primary: true }] }); if (ok) { stop(); doc.podcasts = doc.podcasts.filter(x => x !== p); save(doc); intro(wrap, ctx); } } }, h('span', { html: ico('trash') }), 'Löschen'))),
      script));
  const setStatus = () => { status.textContent = real() ? `Echte Stimmen: Lisa & ${p.voice === 'feiern' ? 'Max nach dem Feiern' : 'Max'}` : (synth && voices().length ? 'Gratis-Stimme deines Browsers' : 'Dein Browser hat keine Stimme – lies einfach mit.'); };
  const setUI = () => {
    playBtn.innerHTML = ico(playing ? 'pause' : 'play');
    w.querySelectorAll('i').forEach(i => i.style.animationPlayState = playing ? 'running' : 'paused');
    lines.forEach((l, k) => l.classList.toggle('now', k === idx && (playing || idx > 0)));
    track.style.width = (100 * idx / p.lines.length) + '%';
    setStatus();
  };
  // ---- echte Stimmen (ElevenLabs), Zeile für Zeile, gecacht ----
  const fetchLine = k => {
    if (p.audio[k]) return Promise.resolve(p.audio[k]);
    if (pending.has(k)) return pending.get(k);
    const l = p.lines[k];
    const pr = ask('podtts', { text: l.t, lang: p.lang || 'de', opts: { pod: p.id, voice: l.s === 'Max' ? p.voice : 'lisa' } })
      .then(r => { p.audio[k] = r.audio; save(doc); pending.delete(k); return r.audio; })
      .catch(e => { pending.delete(k); throw e; });
    pending.set(k, pr); return pr;
  };
  const playReal = async () => {
    const my = ++token;
    if (idx >= p.lines.length) { playing = false; idx = 0; setUI(); return; }
    setUI(); lines[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    try {
      const b64 = await fetchLine(idx);
      if (my !== token || !playing) return;
      for (let j = 1; j <= 2; j++) if (idx + j < p.lines.length) fetchLine(idx + j).catch(() => {});
      const bin = atob(b64); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: 'audio/mpeg' }));
      audio.src = url; audio.playbackRate = rate;
      audio.onended = () => { URL.revokeObjectURL(url); if (my !== token || !playing) return; idx++; setTimeout(playReal, 120); };
      await audio.play();
    } catch (e) {
      if (my !== token) return;
      if (e?.code === 'pod_cap' || e?.code === 'voice_busy') { toast(e.message, 5000); p.real = false; save(doc); setUI(); speak(); return; }
      playing = false; setUI(); toast(e?.message || 'Abspielen hat nicht geklappt.');
    }
  };
  // ---- Gratis-Stimme des Browsers ----
  const speak = () => {
    if (!synth) { toast('Dein Browser kann nicht vorlesen.'); playing = false; setUI(); return; }
    const my = ++token;
    if (idx >= p.lines.length) { playing = false; idx = 0; setUI(); return; }
    const l = p.lines[idx];
    const u = new SpeechSynthesisUtterance(l.t.replace(/€/g, p.lang === 'en' ? ' euros' : ' Euro').replace(/%/g, p.lang === 'en' ? ' percent' : ' Prozent'));
    u.lang = p.lang === 'en' ? 'en-GB' : 'de-DE';
    const v = p.lang === 'en' ? null : V[l.s]; if (v) u.voice = v;
    u.rate = rate; u.pitch = (V.Lisa === V.Max || p.lang === 'en') ? (l.s === 'Max' ? .85 : 1.15) : 1;
    u.onend = () => { if (my !== token || !playing) return; idx++; setUI(); setTimeout(speak, 220); };
    u.onerror = () => { if (my !== token) return; playing = false; setUI(); };
    synth.speak(u);
    lines[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setUI();
  };
  const go = () => (real() ? playReal() : speak());
  const stop = () => { token++; playing = false; try { audio.pause(); } catch (e) {} try { synth && synth.cancel(); } catch (e) {} setUI(); };
  const seek = k => { stop(); idx = Math.max(0, Math.min(p.lines.length - 1, k)); playing = true; go(); };
  playBtn.addEventListener('click', () => { if (playing) stop(); else { playing = true; go(); } });
  const keep = setInterval(() => { if (!wrap.isConnected) { clearInterval(keep); stop(); } }, 1000);
  setUI();
}
