// Podcast: Zwei Stimmen sprechen über das Skript (Sprachausgabe des Geräts, kostenlos & offline)
import { LANGS } from '../srclang.js';
import { starBtn } from '../me.js';
import { h, ico, uid, toast, modal, ls } from '../util.js';
import { ask } from '../api.js';
import { save } from '../state.js';
import { forWhole, forChapter } from '../retrieve.js';
import { loading, apiError, costBtn, moreOpts, freshen, isGuest, lockedPreview, lockedRest, GUEST_CARDS, GUEST_QUIZ } from '../ui.js';
import { SPICE, getSpice } from '../max.js';
import { getOutLang, setOutLang, L } from '../i18n.js';
import { autoOpts, srcPicker, goSource } from '../create.js';
import { dlBtn, optsPodcast } from '../export.js';
import { savedToast } from '../lib.js';

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
  const want = ctx.arg && ctx.arg.startsWith('p-') ? ctx.doc.podcasts.find(p => p.id === ctx.arg.slice(2)) : null;
  if (want) history.replaceState(null, '', location.hash.replace(/\/p-[^/]*$/, ''));
  const pod = want || ctx.doc.podcasts[ctx.doc.podcasts.length - 1];
  const auto = ctx.arg === 'auto'; if (auto) history.replaceState(null, '', location.hash.replace(/\/auto$/, ''));
  if (auto) {
    const o = await autoOpts('podcast', ctx.doc); if (!wrap.isConnected) return;
    if (!o) { wrap.remove(); return render(root, Object.assign({}, ctx, { arg: null })); }
    generate(wrap, ctx, o.len === 'lang' ? 'lang' : 'kurz', o.focus >= 0 && ctx.doc.path?.chapters[o.focus] ? o.focus : -1, [1, 2, 3].includes(o.tone) ? o.tone : getSpice(), o.lang === 'en' || o.lang === 'de' ? o.lang : getOutLang(), o.voice || ls.get('tutor.podVoice', 'max'));
  } else if (pod) player(wrap, ctx, pod); else intro(wrap, ctx);
  return () => { try { synth && synth.cancel(); } catch (e) {} };
}

const MAXV = [['max', L('Max · beim Aperol', 'Max · over Aperol')], ['feiern', L('Max · nach dem Feiern', 'Max · after the party')]];
let previewAudio = null;
function previewBtn(voice, getLang) {
  const b = h('button', { class: 'pv', type: 'button', title: L('So klinge ich', 'This is how I sound'), 'aria-label': L('Hörprobe abspielen', 'Play voice sample'), html: ico('play') });
  b.addEventListener('click', e => {
    e.stopPropagation();
    if (previewAudio && !previewAudio.paused && previewAudio._v === voice) { previewAudio.pause(); b.innerHTML = ico('play'); return; }
    if (previewAudio) previewAudio.pause();
    document.querySelectorAll('.pv').forEach(x => x.innerHTML = ico('play'));
    previewAudio = new Audio(`/tutor/audio/${voice}-${getLang()}.mp3?v=2`); previewAudio._v = voice;
    previewAudio.onended = () => { b.innerHTML = ico('play'); };
    b.innerHTML = ico('pause');
    previewAudio.play().catch(() => { b.innerHTML = ico('play'); });
  });
  return b;
}

function intro(wrap, ctx) {
  const { doc } = ctx;
  let len = 'kurz', focus = -1, tone = getSpice(), plang = (ctx.doc && (ctx.doc.outLang || ctx.doc.srcLang)) || getOutLang(), mvoice = ls.get('tutor.podVoice', 'max');
  const TONE_HINT = L({ 1: 'Komplett sachlich – wie eine gute Vorlesung zum Anhören.', 2: 'Locker, mit ein paar Sprüchen von Max.', 3: 'Max dreht auf: Sylt, Porsche, Papas Holding. Fachlich trotzdem exakt.' }, { 1: 'Strictly factual – like a good lecture to listen to.', 2: 'Relaxed, with a few quips from Max.', 3: 'Max goes all out: Sylt, the Porsche, Daddy’s holding company. Still spot-on content-wise.' });
  const hint = h('div', { class: 'eyebrow', style: { marginTop: '8px', textTransform: 'none', letterSpacing: 0 } }, TONE_HINT[tone]);
  const tones = SPICE.map(([k, l]) => { const c = h('button', { class: 'chip' + (k === tone ? ' on' : '') }, l); c.addEventListener('click', () => { tone = k; tones.forEach(x => x.classList.toggle('on', x === c)); hint.textContent = TONE_HINT[k]; }); return c; });
  const langs = [['de', L('Deutsch', 'German')], ['en', 'English']].concat(!['de', 'en'].includes(plang) && LANGS[plang] ? [[plang, LANGS[plang][2]]] : []).map(([k, l]) => { const c = h('button', { class: 'chip' + (k === plang ? ' on' : '') }, l); c.addEventListener('click', () => { plang = k; langs.forEach(x => x.classList.toggle('on', x === c)); }); return c; });
  const mvs = MAXV.map(([k, l]) => { const c = h('span', { class: 'chip vchip' + (k === mvoice ? ' on' : ''), role: 'button', tabindex: 0 }, l, previewBtn(k, () => plang)); c.addEventListener('click', () => { mvoice = k; ls.set('tutor.podVoice', k); mvs.forEach(x => x.classList.toggle('on', x === c)); }); return c; });
  const lisa = h('span', { class: 'chip vchip on fixed' }, 'Lisa', previewBtn('lisa', () => plang));
  const sel = h('select', { class: 'field' }, h('option', { value: -1 }, L('Ganzes Skript', 'Whole script')), (doc.path?.chapters || []).map((c, i) => h('option', { value: i }, `${i + 1}. ${c.title}`)));
  sel.addEventListener('change', () => focus = +sel.value);
  // Stoff frei wählen: dieses oder ein anderes Skript, ein Thema oder eine eigene Datei
  const pick = srcPicker(doc, { onChange: () => { scopeBox.hidden = !pick.here(); } });
  const scopeBox = h('div', {}, h('label', { class: 'l' }, L('Umfang', 'Scope')), sel);
  const create = () => { if (pick.here()) return generate(wrap, ctx, len, focus, tone, plang, mvoice); if (pick.check()) return; goSource('podcast', pick.get(), { len, focus: -1, tone, lang: plang, voice: mvoice }); };
  const lens = [['kurz', L('Kurz · ~5 Min.', 'Short · ~5 min')], ['lang', L('Lang · ~10 Min.', 'Long · ~10 min')]].map(([k, l]) => { const c = h('button', { class: 'chip' + (k === len ? ' on' : '') }, l); c.addEventListener('click', () => { len = k; lens.forEach(x => x.classList.toggle('on', x === c)); }); return c; });
  wrap.replaceChildren(
    h('div', { class: 'pod' },
      h('div', { class: 'cover' }, h('div', { class: 'eyebrow', style: { color: 'inherit', opacity: .7 } }, L('BWL Max · KI-Podcast', 'BWL Max · AI podcast')), h('h3', {}, doc.name), wave()),
      h('div', {},
        h('div', { class: 'eyebrow' }, 'Podcast'), h('h2', { style: { fontSize: '30px', letterSpacing: '-.03em', margin: '6px 0 8px' } }, L('Dein Skript zum Anhören', 'Your slides as audio')),
        h('p', { style: { color: 'var(--mute)', marginTop: 0 } }, L('Lisa erklärt, Max fragt nach – mit echten Stimmen, Beispielen und den typischen Fehlern. Perfekt für Bahn, Gym oder Spaziergang.', 'Lisa explains, Max asks follow-ups – with real voices, examples and the classic mistakes. Perfect for the train, the gym or a walk.')),
        h('div', { class: 'setup', style: { marginTop: '18px' } },
          h('div', { class: 'sp-row' }, h('label', { class: 'l' }, L('Stoff', 'Material')), pick.el),
          h('div', { class: 'grid' }, scopeBox, h('div', {}, h('label', { class: 'l' }, L('Länge', 'Length')), h('div', { class: 'chips' }, lens))),
          moreOpts(
            h('div', { class: 'grid' },
              h('div', {}, h('label', { class: 'l' }, L('Sprache der Folge', 'Episode language')), h('div', { class: 'chips' }, langs)),
              h('div', {}, h('label', { class: 'l' }, L('Stimmen · ▶ zum Reinhören', 'Voices · ▶ to preview')), h('div', { class: 'chips' }, mvs, lisa))),
            h('div', { style: { marginTop: '14px' } }, h('label', { class: 'l' }, L('Ton', 'Tone')), h('div', { class: 'chips' }, tones), hint)),
          h('div', { class: 'qactions' }, h('span', { class: 'sp' }), costBtn(L('Folge erstellen', 'Create episode'), 'podcast', create, 'btn primary lg'))))),
    doc.podcasts.length ? h('div', { style: { marginTop: '26px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, L('Deine Folgen', 'Your episodes')),
      h('div', { class: 'list' }, [...doc.podcasts].reverse().map(p => h('div', { class: 'li', onclick: () => player(wrap, ctx, p) }, h('span', { html: ico('pod') }), starBtn(() => ({ typ: 'podcast', titel: p.title, doc: doc.id, docName: doc.name, ref: p.id || p.title }), { cls: 'sm bare' }), h('div', { class: 'gr' }, h('b', {}, p.title), h('span', {}, L(`${p.lines.length} Abschnitte · ~${minutes(p)} Min.${p.lang === 'en' ? ' · English' : ''}`, `${p.lines.length} segments · ~${minutes(p)} min${p.lang === 'de' ? ' · German' : ''}`))))))) : null);
}
const minutes = p => Math.max(1, Math.round(p.lines.reduce((a, l) => a + l.t.split(/\s+/).length, 0) / 150));
function wave() { const w = h('div', { class: 'wave' }); for (let i = 0; i < 30; i++) w.appendChild(h('i', { style: { '--h': (25 + Math.random() * 75) + '%', animationDelay: (i * 53 % 900) + 'ms', animationPlayState: 'paused' } })); return w; }

async function generate(wrap, ctx, len, focus, tone = 2, plang = getOutLang(), mvoice = 'max') {
  if (isGuest()) return lockedPreview(wrap, { kind: 'podcast', title: L('Dein Podcast – mit kostenlosem Konto', 'Your podcast – with a free account'), onUnlock: () => generate(wrap, ctx, len, focus, tone, plang, mvoice), back: () => intro(wrap, ctx) });
  const { doc } = ctx;
  const ch = focus >= 0 ? doc.path.chapters[focus] : null;
  const ld = loading(wrap, L('Lisa und Max nehmen auf …', 'Lisa and Max are recording …'), L(['Schreibe das Skript', 'Baue Beispiele ein', 'Max sucht sich eine knifflige Frage', 'Fast fertig'], ['Writing the script', 'Adding examples', 'Max is picking a tricky question', 'Almost done']), 'podcast');
  try {
    const r = await ask('podcast', { material: ch ? forChapter(doc, ch) : forWhole(doc), docName: doc.name, lang: plang, opts: { length: len, focus: ch ? ch.title : '', spice: tone } }, { signal: ld.signal });
    const lines = (r.data?.lines || []).filter(l => l && l.t).map(l => ({ s: /max/i.test(l.s) ? 'Max' : 'Lisa', t: String(l.t) }));
    if (lines.length < 4) throw new Error(L('Die Folge ist nicht vollständig angekommen. Versuch es nochmal.', 'The episode didn’t arrive completely. Please try again.'));
    const p = { id: uid(), title: r.data.title || L('Folge', 'Episode'), lines, created: Date.now(), lang: plang, voice: mvoice, len, tone, focus: ch ? ch.title : null, real: true, audio: [] };
    doc.podcasts.push(p); save(doc);
    ld.stop(); player(wrap, ctx, p); freshen(wrap); savedToast('podcasts');
  } catch (e) { ld.stop(false); intro(wrap, ctx); apiError(e, () => generate(wrap, ctx, len, focus, tone, plang, mvoice)); }
}

function player(wrap, ctx, p) {
  const { doc } = ctx;
  const V = pickVoices();
  p.audio ||= [];
  let idx = 0, playing = false, rate = 1, token = 0;
  const real = () => p.real !== false && p.voice;
  const audio = new Audio(); audio.preload = 'auto';
  const pending = new Map();
  const playBtn = h('button', { class: 'play', 'aria-label': L('Abspielen', 'Play'), html: ico('play') });
  const track = h('i');
  const status = h('div', { class: 'eyebrow pstat', style: { marginTop: '10px', textTransform: 'none', letterSpacing: 0 } });
  const tbar = h('div', { class: 'ptrack', onclick: e => { const r = tbar.getBoundingClientRect(); seek(Math.floor((e.clientX - r.left) / r.width * p.lines.length)); } }, track);
  const lines = p.lines.map((l, k) => h('div', { class: 'line', onclick: () => seek(k) }, h('span', { class: 'who' }, l.s), h('span', {}, l.t)));
  const script = h('div', { class: 'script' }, lines);
  const w = wave();
  const rates = [0.9, 1, 1.25, 1.5].map(r => { const c = h('button', { class: 'chip' + (r === rate ? ' on' : '') }, L(r.toString().replace('.', ','), r.toString()) + '×'); c.addEventListener('click', () => { rate = r; audio.playbackRate = r; rates.forEach(x => x.classList.toggle('on', x === c)); if (playing && !real()) seek(idx); }); return c; });
  wrap.replaceChildren(
    h('button', { class: 'btn sm ghost', style: { marginBottom: '12px' }, onclick: () => { stop(); intro(wrap, ctx); } }, h('span', { html: ico('left') }), L('Alle Folgen', 'All episodes')),
    h('div', { class: 'pod' },
      h('div', {}, h('div', { class: 'cover' }, h('div', { class: 'eyebrow', style: { color: 'inherit', opacity: .7 } }, L('BWL Max · KI-Podcast', 'BWL Max · AI podcast')), h('h3', {}, p.title), w),
        h('div', { class: 'player' }, playBtn, tbar), status,
        h('div', { class: 'chips', style: { marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' } }, rates),
        h('div', { style: { marginTop: '12px', display: 'flex', gap: '6px', alignItems: 'center' } },
          starBtn(() => ({ typ: 'podcast', titel: p.title, doc: ctx.doc.id, docName: ctx.doc.name, ref: p.id || p.title })),
          dlBtn(() => optsPodcast(p, doc), { cls: 'btn sm ghost' }),
          h('button', { class: 'btn sm ghost', onclick: async () => { const ok = await modal({ title: L('Folge löschen?', 'Delete episode?'), text: p.title, actions: [{ label: L('Abbrechen', 'Cancel'), value: false }, { label: L('Löschen', 'Delete'), value: true, primary: true }] }); if (ok) { stop(); doc.podcasts = doc.podcasts.filter(x => x !== p); save(doc); intro(wrap, ctx); } } }, h('span', { html: ico('trash') }), L('Löschen', 'Delete')))),
      script));
  const setStatus = () => { status.textContent = real() ? L(`Echte Stimmen: Lisa & ${p.voice === 'feiern' ? 'Max nach dem Feiern' : 'Max'}`, `Real voices: Lisa & ${p.voice === 'feiern' ? 'Max after the party' : 'Max'}`) : (synth && voices().length ? L('Gratis-Stimme deines Browsers', 'Your browser’s free voice') : L('Dein Browser hat keine Stimme – lies einfach mit.', 'Your browser has no voice – just read along.')); };
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
      playing = false; setUI(); toast(e?.message || L('Abspielen hat nicht geklappt.', 'Playback didn’t work.'));
    }
  };
  // ---- Gratis-Stimme des Browsers ----
  const speak = () => {
    if (!synth) { toast(L('Dein Browser kann nicht vorlesen.', 'Your browser can’t read aloud.')); playing = false; setUI(); return; }
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
