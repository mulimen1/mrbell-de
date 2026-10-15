// Podcast: Zwei Stimmen sprechen über das Skript (Sprachausgabe des Geräts, kostenlos & offline)
import { h, ico, uid, toast, modal } from '../util.js';
import { ask } from '../api.js';
import { save } from '../state.js';
import { forWhole, forChapter } from '../retrieve.js';
import { loading, apiError, costBtn } from '../ui.js';

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
  return { Lena: a, Max: b };
}

export async function render(root, ctx) {
  const wrap = h('div', { class: 'view-in' });
  root.appendChild(wrap);
  if (synth && !synth.getVoices().length) await new Promise(r => { const t = setTimeout(r, 1200); synth.addEventListener('voiceschanged', () => { clearTimeout(t); r(); }, { once: true }); });
  const pod = ctx.doc.podcasts[ctx.doc.podcasts.length - 1];
  if (pod) player(wrap, ctx, pod); else intro(wrap, ctx);
  return () => { try { synth && synth.cancel(); } catch (e) {} };
}

function intro(wrap, ctx) {
  const { doc } = ctx;
  let len = 'kurz', focus = -1;
  const sel = h('select', { class: 'field' }, h('option', { value: -1 }, 'Ganzes Skript'), (doc.path?.chapters || []).map((c, i) => h('option', { value: i }, `${i + 1}. ${c.title}`)));
  sel.addEventListener('change', () => focus = +sel.value);
  const lens = [['kurz', 'Kurz · ~5 Min.'], ['lang', 'Lang · ~10 Min.']].map(([k, l]) => { const c = h('button', { class: 'chip' + (k === len ? ' on' : '') }, l); c.addEventListener('click', () => { len = k; lens.forEach(x => x.classList.toggle('on', x === c)); }); return c; });
  wrap.replaceChildren(
    h('div', { class: 'pod' },
      h('div', { class: 'cover' }, h('div', { class: 'eyebrow', style: { color: 'inherit', opacity: .7 } }, 'Tutor · Podcast'), h('h3', {}, doc.name), wave()),
      h('div', {},
        h('div', { class: 'eyebrow' }, 'Podcast'), h('h2', { style: { fontSize: '30px', letterSpacing: '-.03em', margin: '6px 0 8px' } }, 'Dein Skript zum Anhören'),
        h('p', { style: { color: 'var(--mute)', marginTop: 0 } }, 'Lena erklärt, Max fragt nach – mit Beispielen und den typischen Fehlern. Perfekt für Bahn, Gym oder Spaziergang.'),
        h('div', { class: 'setup', style: { marginTop: '18px' } },
          h('div', { class: 'grid' }, h('div', {}, h('label', { class: 'l' }, 'Thema'), sel), h('div', {}, h('label', { class: 'l' }, 'Länge'), h('div', { class: 'chips' }, lens))),
          h('div', { class: 'qactions' }, h('span', { class: 'sp' }), costBtn('Folge erstellen', 'podcast', () => generate(wrap, ctx, len, focus), 'btn primary lg'))),
        !voices().length ? h('p', { class: 'eyebrow', style: { marginTop: '14px' } }, 'Hinweis: Dein Browser hat keine deutsche Stimme – du kannst das Skript trotzdem lesen.') : null)),
    doc.podcasts.length ? h('div', { style: { marginTop: '26px' } }, h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'Deine Folgen'),
      h('div', { class: 'list' }, [...doc.podcasts].reverse().map(p => h('div', { class: 'li', onclick: () => player(wrap, ctx, p) }, h('span', { html: ico('pod') }), h('div', { class: 'gr' }, h('b', {}, p.title), h('span', {}, `${p.lines.length} Abschnitte · ~${minutes(p)} Min.`)))))) : null);
}
const minutes = p => Math.max(1, Math.round(p.lines.reduce((a, l) => a + l.t.split(/\s+/).length, 0) / 150));
function wave() { const w = h('div', { class: 'wave' }); for (let i = 0; i < 30; i++) w.appendChild(h('i', { style: { '--h': (25 + Math.random() * 75) + '%', animationDelay: (i * 53 % 900) + 'ms', animationPlayState: 'paused' } })); return w; }

async function generate(wrap, ctx, len, focus) {
  const { doc } = ctx;
  const ch = focus >= 0 ? doc.path.chapters[focus] : null;
  const ld = loading(wrap, 'Lena und Max nehmen auf …', ['Schreibe das Skript', 'Baue Beispiele ein', 'Max sucht sich eine knifflige Frage', 'Fast fertig']);
  try {
    const r = await ask('podcast', { material: ch ? forChapter(doc, ch) : forWhole(doc), docName: doc.name, opts: { length: len, focus: ch ? ch.title : '' } });
    const lines = (r.data?.lines || []).filter(l => l && l.t).map(l => ({ s: /max/i.test(l.s) ? 'Max' : 'Lena', t: String(l.t) }));
    if (lines.length < 4) throw new Error('Die Folge ist nicht vollständig angekommen. Versuch es nochmal.');
    const p = { id: uid(), title: r.data.title || 'Folge', lines, created: Date.now() };
    doc.podcasts.push(p); save(doc);
    ld.stop(); player(wrap, ctx, p);
  } catch (e) { ld.stop(); intro(wrap, ctx); apiError(e, () => generate(wrap, ctx, len, focus)); }
}

function player(wrap, ctx, p) {
  const { doc } = ctx;
  const V = pickVoices();
  let idx = 0, playing = false, rate = 1.05, token = 0;
  const playBtn = h('button', { class: 'play', 'aria-label': 'Abspielen', html: ico('play') });
  const track = h('i');
  const tbar = h('div', { class: 'ptrack', onclick: e => { const r = tbar.getBoundingClientRect(); seek(Math.floor((e.clientX - r.left) / r.width * p.lines.length)); } }, track);
  const lines = p.lines.map((l, k) => h('div', { class: 'line', onclick: () => seek(k) }, h('span', { class: 'who' }, l.s), h('span', {}, l.t)));
  const script = h('div', { class: 'script' }, lines);
  const w = wave();
  const rates = [0.9, 1.05, 1.25, 1.5].map(r => { const c = h('button', { class: 'chip' + (r === rate ? ' on' : '') }, r.toString().replace('.', ',') + '×'); c.addEventListener('click', () => { rate = r; rates.forEach(x => x.classList.toggle('on', x === c)); if (playing) seek(idx); }); return c; });
  wrap.replaceChildren(
    h('button', { class: 'btn sm ghost', style: { marginBottom: '12px' }, onclick: () => { stop(); intro(wrap, ctx); } }, h('span', { html: ico('left') }), 'Alle Folgen'),
    h('div', { class: 'pod' },
      h('div', {}, h('div', { class: 'cover' }, h('div', { class: 'eyebrow', style: { color: 'inherit', opacity: .7 } }, 'Tutor · Podcast'), h('h3', {}, p.title), w),
        h('div', { class: 'player' }, playBtn, tbar),
        h('div', { class: 'chips', style: { marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' } }, rates),
        h('div', { style: { marginTop: '12px', display: 'flex', gap: '6px' } },
          h('button', { class: 'btn sm ghost', onclick: () => { const t = p.lines.map(l => `${l.s}: ${l.t}`).join('\n\n'); const a = h('a', { href: URL.createObjectURL(new Blob([p.title + '\n\n' + t], { type: 'text/plain' })), download: p.title + '.txt' }); document.body.appendChild(a); a.click(); a.remove(); } }, h('span', { html: ico('download') }), 'Skript'),
          h('button', { class: 'btn sm ghost', onclick: async () => { const ok = await modal({ title: 'Folge löschen?', text: p.title, actions: [{ label: 'Abbrechen', value: false }, { label: 'Löschen', value: true, primary: true }] }); if (ok) { stop(); doc.podcasts = doc.podcasts.filter(x => x !== p); save(doc); intro(wrap, ctx); } } }, h('span', { html: ico('trash') }), 'Löschen')),
        !synth || !voices().length ? h('p', { class: 'eyebrow', style: { marginTop: '12px' } }, 'Keine deutsche Stimme im Browser gefunden – lies einfach mit.') : null),
      script));
  const setUI = () => {
    playBtn.innerHTML = ico(playing ? 'pause' : 'play');
    w.querySelectorAll('i').forEach(i => i.style.animationPlayState = playing ? 'running' : 'paused');
    lines.forEach((l, k) => l.classList.toggle('now', k === idx && (playing || idx > 0)));
    track.style.width = (100 * idx / p.lines.length) + '%';
  };
  const speak = () => {
    if (!synth) { toast('Dein Browser kann nicht vorlesen.'); return; }
    const my = ++token;
    if (idx >= p.lines.length) { playing = false; idx = 0; setUI(); return; }
    const l = p.lines[idx];
    const u = new SpeechSynthesisUtterance(l.t.replace(/€/g, ' Euro').replace(/%/g, ' Prozent'));
    u.lang = 'de-DE';
    const v = V[l.s]; if (v) u.voice = v;
    u.rate = rate; u.pitch = V.Lena === V.Max ? (l.s === 'Lena' ? 1.15 : .85) : 1;
    u.onend = () => { if (my !== token || !playing) return; idx++; setUI(); setTimeout(speak, 220); };
    u.onerror = () => { if (my !== token) return; playing = false; setUI(); };
    synth.speak(u);
    lines[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setUI();
  };
  const stop = () => { token++; playing = false; try { synth && synth.cancel(); } catch (e) {} setUI(); };
  const seek = k => { stop(); idx = Math.max(0, Math.min(p.lines.length - 1, k)); playing = true; speak(); };
  playBtn.addEventListener('click', () => { if (playing) stop(); else { playing = true; speak(); } });
  const keep = setInterval(() => { if (!wrap.isConnected) { clearInterval(keep); stop(); } }, 1000);
  setUI();
}
