// Videos & Audios abschreiben: Tonspur im Browser herauslösen (ohne das ganze Video hochzuladen),
// in Stücke von ~1,4 MB teilen und nacheinander/parallel abschreiben lassen (Server: Aktion „transcribe“).
//  • MP4/MOV/M4A (iPhone, Zoom, Panopto …): AAC-Spur direkt aus der Datei (mp4box.js, BSD-3) → ADTS-Stücke, kein Neukodieren
//  • MP3: an Frame-Grenzen geteilt
//  • alles andere (WAV, WebM, OGG …): bis 200 MB im Browser dekodiert → 16 kHz mono WAV-Stücke
import { L } from './i18n.js';
import { ask } from './api.js';

export const isMedia = f => !!f && (/^(video|audio)\//.test(f.type || '') || /\.(mp4|m4v|mov|m4a|mp3|wav|aac|webm|ogg|oga|opus|flac|mkv|3gp)$/i.test(f.name || ''));
export const MEDIA_ACCEPT = 'video/*,audio/*,.mp4,.mov,.m4v,.m4a,.mp3,.wav,.aac,.webm,.ogg,.opus,.flac,.mkv';
const MAXB = 1.4e6;
const FREQ = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];

let mp4boxP = null;
function loadMp4box() {
  if (window.MP4Box) return Promise.resolve(window.MP4Box);
  return mp4boxP ||= new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/tutor/js/lib/mp4box.min.js'; s.onload = () => res(window.MP4Box); s.onerror = () => rej(new Error('mp4box')); document.head.appendChild(s); });
}
const rd = async (file, a, b) => new Uint8Array(await file.slice(a, b).arrayBuffer());

// ---------- MP4/MOV: AAC-Spur → ADTS ----------
async function* fromMp4(file) {
  // Oberste Boxen ablaufen, ftyp + moov holen (moov darf auch am Ende stehen)
  let off = 0, ftyp = null, moov = null;
  while (off < file.size && !(ftyp && moov)) {
    const hd = await rd(file, off, off + 16); if (hd.length < 8) break;
    const dv = new DataView(hd.buffer); let size = dv.getUint32(0); const type = String.fromCharCode(...hd.slice(4, 8));
    if (size === 1) size = Number(dv.getBigUint64(8)); else if (size === 0) size = file.size - off;
    if (size < 8) break;
    if (type === 'ftyp') ftyp = await rd(file, off, off + size);
    if (type === 'moov') { if (size > 200e6) throw new Error('moov'); moov = await rd(file, off, off + size); }
    off += size;
  }
  if (!moov) throw new Error('nomoov');
  const MP4Box = await loadMp4box();
  const buf = new Uint8Array((ftyp ? ftyp.length : 0) + moov.length); if (ftyp) buf.set(ftyp, 0); buf.set(moov, ftyp ? ftyp.length : 0);
  const ab = buf.buffer; ab.fileStart = 0;
  const mp4 = MP4Box.createFile();
  let info = null; mp4.onReady = i => { info = i; }; mp4.onError = () => {};
  mp4.appendBuffer(ab); mp4.flush();
  if (!info) throw new Error('noinfo');
  const tr = (info.audioTracks || [])[0];
  if (!tr) throw Object.assign(new Error(L('In dem Video ist keine Tonspur.', 'This video has no audio track.')), { user: true });
  if (!/^mp4a/.test(tr.codec)) throw new Error('codec');
  const ot = parseInt((tr.codec.split('.')[2] || '2'), 10) || 2;
  let rate = tr.audio.sample_rate, ch = tr.audio.channel_count || 2;
  const prof = ot === 5 || ot === 29 ? 2 : Math.min(4, Math.max(1, ot));   // HE-AAC: als LC mit halber Rate
  if ((ot === 5 || ot === 29) && rate > 24000) rate = rate / 2;
  let fi = FREQ.indexOf(rate); if (fi < 0) fi = 4;
  if (ch > 7) ch = 2;
  const samples = mp4.getTrackSamplesInfo(tr.id);
  if (!samples || !samples.length) throw new Error('nosamples');
  const ts = tr.timescale || samples[0].timescale || 1;
  const adts = len => { const n = len + 7; return [0xFF, 0xF1, ((prof - 1) << 6) | (fi << 2) | (ch >> 2), ((ch & 3) << 6) | (n >> 11), (n >> 3) & 0xFF, ((n & 7) << 5) | 0x1F, 0xFC]; };
  let i = 0;
  while (i < samples.length) {
    // Gruppe bis ~1,4 MB Ton; die Datei wird nur in diesem Bereich gelesen
    let j = i, bytes = 0, dur = 0;
    while (j < samples.length && bytes + samples[j].size + 7 <= MAXB) { bytes += samples[j].size + 7; dur += samples[j].duration; j++; }
    if (j === i) j = i + 1;
    const out = new Uint8Array(bytes || samples[i].size + 7); let p = 0;
    // zusammenhängende Leseblöcke (Video-Daten dazwischen werden übersprungen, Blöcke max. 32 MB)
    let k = i;
    while (k < j) {
      let a = samples[k].offset, b = a + samples[k].size, m = k + 1;
      while (m < j && samples[m].offset >= b && samples[m].offset + samples[m].size - a < 32e6) { b = samples[m].offset + samples[m].size; m++; }
      const blk = await rd(file, a, b);
      for (let q = k; q < m; q++) { const s = samples[q]; out.set(adts(s.size), p); p += 7; out.set(blk.subarray(s.offset - a, s.offset - a + s.size), p); p += s.size; }
      k = m;
    }
    yield { blob: new Blob([out.subarray(0, p)], { type: 'audio/aac' }), sec: dur / ts, start: samples[i].dts / ts };
    i = j;
  }
}

// ---------- MP3: an Frame-Grenzen teilen ----------
async function* fromMp3(file, total) {
  let off = 0; const n = file.size;
  // ID3-Kopf überspringen
  const h = await rd(file, 0, 10); if (h[0] === 0x49 && h[1] === 0x44 && h[2] === 0x33) off = 10 + ((h[6] & 0x7f) << 21 | (h[7] & 0x7f) << 14 | (h[8] & 0x7f) << 7 | (h[9] & 0x7f));
  const start0 = off;
  while (off < n) {
    let end = Math.min(n, off + MAXB);
    if (end < n) { const look = await rd(file, end, Math.min(n, end + 8192)); let s = 0; while (s < look.length - 1 && !(look[s] === 0xFF && (look[s + 1] & 0xE0) === 0xE0)) s++; end += s; }
    const part = file.slice(off, end);
    const frac = (end - off) / Math.max(1, n - start0);
    yield { blob: new Blob([part], { type: 'audio/mpeg' }), sec: total ? total * frac : (end - off) / 16000, start: total ? total * (off - start0) / Math.max(1, n - start0) : 0 };
    off = end;
  }
}

// ---------- Rest: im Browser dekodieren → 16 kHz mono WAV ----------
async function* fromDecode(file) {
  if (file.size > 200e6) throw Object.assign(new Error(L('Dieses Format kann ich bei so großen Dateien nicht lesen. Speicher das Video als MP4 oder den Ton als MP3/M4A – das geht bis zu mehreren Stunden.', 'I can’t read this format at this size. Save the video as MP4 or the audio as MP3/M4A – that works for several hours.')), { user: true });
  const AC = window.AudioContext || window.webkitAudioContext; const ac = new AC();
  let buf; try { buf = await ac.decodeAudioData(await file.arrayBuffer()); } finally { try { ac.close(); } catch (e) {} }
  const R = 16000, len = Math.ceil(buf.duration * R);
  const off = new OfflineAudioContext(1, len, R); const src = off.createBufferSource(); src.buffer = buf; src.connect(off.destination); src.start();
  const pcm = (await off.startRendering()).getChannelData(0);
  const per = Math.floor((MAXB - 44) / 2);
  for (let s = 0; s < pcm.length; s += per) {
    const e = Math.min(pcm.length, s + per), n = e - s, ab = new ArrayBuffer(44 + n * 2), dv = new DataView(ab);
    const w = (o, str) => { for (let i = 0; i < str.length; i++) dv.setUint8(o + i, str.charCodeAt(i)); };
    w(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, R, true); dv.setUint32(28, R * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const v = Math.max(-1, Math.min(1, pcm[s + i])); dv.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7FFF, true); }
    yield { blob: new Blob([ab], { type: 'audio/wav' }), sec: n / R, start: s / R };
  }
}

function mediaDuration(file) {
  return new Promise(res => {
    const el = document.createElement(/^video/.test(file.type) ? 'video' : 'audio'); const u = URL.createObjectURL(file); let done = false;
    const fin = v => { if (done) return; done = true; URL.revokeObjectURL(u); res(isFinite(v) ? v : 0); };
    el.preload = 'metadata'; el.onloadedmetadata = () => fin(el.duration); el.onerror = () => fin(0); setTimeout(() => fin(0), 6000); el.src = u;
  });
}
const b64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
const mmss = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };

// Hauptfunktion: liefert Seiten (je Stück eine, mit Zeitmarke) – onProg(0..1, Text)
export async function transcribe(file, onProg = () => {}, { signal } = {}) {
  const name = (file.name || L('Video', 'Video')).replace(/\.[^.]+$/, '');
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const total = await mediaDuration(file);
  onProg(0.01, L('Ich hol den Ton aus der Datei …', 'Extracting the audio …'));
  let gen;
  const mp4ish = /^(mp4|m4v|mov|m4a|3gp)$/.test(ext) || /mp4|quicktime|m4a/.test(file.type || '');
  if (mp4ish) gen = fromMp4(file);
  else if (ext === 'mp3' || file.type === 'audio/mpeg') gen = fromMp3(file, total);
  else gen = fromDecode(file);
  // Stücke einsammeln (mp4: Fehler → Fallback Dekodieren)
  const parts = [];
  try { for await (const p of gen) parts.push(p); }
  catch (e) { if (e.user) throw e; if (!mp4ish) throw e; parts.length = 0; for await (const p of fromDecode(file)) parts.push(p); }
  if (!parts.length) throw Object.assign(new Error(L('In der Datei ist kein Ton.', 'There’s no audio in this file.')), { user: true });
  const dur = total || parts.reduce((a, p) => a + p.sec, 0);
  // Abschreiben: drei gleichzeitig, mit Wiederholung
  const texts = new Array(parts.length).fill(null); let next = 0, done = 0, err = null;
  const one = async i => {
    const p = parts[i]; const audio = await b64(p.blob);
    for (let t = 0; ; t++) {
      if (signal && signal.aborted) throw Object.assign(new Error('abort'), { name: 'AbortError' });
      try { const r = await ask('transcribe', { audio, mime: p.blob.type, sec: Math.round(p.sec) }, { signal }); texts[i] = String(r.text || '').trim(); return; }
      catch (e) {
        if (e.code === 'stt' || e.code === 'stt_empty') { texts[i] = ''; return; }   // Stille
        if (e.name === 'AbortError' || ['need_account', 'limit', 'cap', 'busy'].includes(e.code) || t >= 2) throw e;
        await new Promise(r => setTimeout(r, 1500 * (t + 1)));
      }
    }
  };
  const worker = async () => { while (next < parts.length && !err) { const i = next++; try { await one(i); } catch (e) { err = err || e; return; } done++; onProg(0.05 + 0.95 * done / parts.length, L(`Ich schreib mit … ${mmss(Math.min(dur, parts[i].start + parts[i].sec))} von ${mmss(dur)}`, `Transcribing … ${mmss(Math.min(dur, parts[i].start + parts[i].sec))} of ${mmss(dur)}`)); } };
  onProg(0.05, L(`Ich schreib mit … 0:00 von ${mmss(dur)}`, `Transcribing … 0:00 of ${mmss(dur)}`));
  await Promise.all([worker(), worker(), worker()]);
  if (err) throw err;
  const pages = parts.map((p, i) => texts[i] ? `[${mmss(p.start)}–${mmss(p.start + p.sec)}] ${texts[i]}` : '').filter(Boolean);
  if (!pages.length) throw Object.assign(new Error(L('Ich hab in der Aufnahme keine Sprache gehört.', 'I didn’t hear any speech in the recording.')), { user: true });
  return { name, pages, chars: pages.reduce((a, x) => a + x.length, 0), dur, media: true };
}
