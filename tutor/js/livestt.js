// Live-Mitschrift: Während du sprichst, erscheint dein Text sofort (ElevenLabs Echtzeit, Einmal-Token vom Server).
// Fällt das aus, nimmt der Aufrufer wie bisher die normale Aufnahme.
import { ask } from './api.js';

const WS = 'wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&audio_format=pcm_16000&commit_strategy=manual&token=';
const RATE = 16000;

export function startLive(actx, stream, { onText = () => {} } = {}) {
  let ws = null, dead = false, committed = '', partial = '', sent = 0;
  let queue = [], pend = [], pendN = 0, src = null, proc = null, waitFinal = null, onOpen = null;
  const opened = new Promise(r => { onOpen = r; });
  const text = () => (committed + ' ' + partial).replace(/\s+/g, ' ').trim();

  function b64(i16) {
    const u8 = new Uint8Array(i16.buffer, i16.byteOffset, i16.byteLength);
    let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function push(i16, commit = false) {
    const msg = JSON.stringify({ message_type: 'input_audio_chunk', audio_base_64: i16 ? b64(i16) : '', commit, sample_rate: RATE });
    if (ws && ws.readyState === 1) { ws.send(msg); sent++; } else queue.push(msg);
  }
  function flushPend(commit = false) {
    if (!pendN && !commit) return;
    const out = new Int16Array(pendN); let o = 0;
    for (const p of pend) { out.set(p, o); o += p.length; }
    pend = []; pendN = 0;
    push(out.length ? out : null, commit);
  }

  // Mikro → 16 kHz PCM, alle ~250 ms ein Paket
  try {
    src = actx.createMediaStreamSource(stream);
    proc = actx.createScriptProcessor(4096, 1, 1);
    const ratio = actx.sampleRate / RATE;
    proc.onaudioprocess = e => {
      if (dead) return;
      const inp = e.inputBuffer.getChannelData(0);
      const n = Math.floor(inp.length / ratio), out = new Int16Array(n);
      for (let i = 0; i < n; i++) {
        const a = Math.floor(i * ratio), b = Math.min(inp.length, Math.floor((i + 1) * ratio));
        let s = 0; for (let k = a; k < b; k++) s += inp[k];
        const v = Math.max(-1, Math.min(1, s / Math.max(1, b - a)));
        out[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
      }
      pend.push(out); pendN += n;
      if (pendN >= RATE / 4) flushPend();
    };
    src.connect(proc); proc.connect(actx.destination);
  } catch (e) { dead = true; }

  const ready = (async () => {
    if (dead) throw new Error('audio');
    const r = await ask('live', {});
    if (dead) return;
    ws = new WebSocket(WS + encodeURIComponent(r.token));
    ws.onopen = () => { for (const m of queue) ws.send(m); sent += queue.length; queue = []; onOpen(); };
    ws.onmessage = e => {
      let m; try { m = JSON.parse(e.data); } catch (x) { return; }
      if (m.message_type === 'partial_transcript') { partial = m.text || ''; onText(text()); }
      else if (m.message_type === 'committed_transcript') { committed = (committed + ' ' + (m.text || '')).trim(); partial = ''; onText(text()); if (waitFinal) waitFinal(); }
      else if (/error/i.test(m.message_type || '')) { dead = true; }
    };
    ws.onerror = () => { dead = true; onOpen(); if (waitFinal) waitFinal(); };
    ws.onclose = () => { if (waitFinal) waitFinal(); };
  })().catch(() => { dead = true; onOpen(); });

  function cleanup() {
    try { proc && (proc.onaudioprocess = null); proc && proc.disconnect(); src && src.disconnect(); } catch (e) {}
    try { ws && ws.readyState <= 1 && ws.close(); } catch (e) {}
  }
  return {
    // Aufnahme fertig: letzten Rest schicken, auf den endgültigen Text warten. null = Live hat nicht geklappt.
    async finish() {
      if (dead) { cleanup(); return text() || null; }
      await Promise.race([opened, new Promise(r => setTimeout(r, 3500))]);
      if (dead || !ws || ws.readyState !== 1) { cleanup(); return text() || null; }
      const got = new Promise(r => { waitFinal = r; });
      flushPend(true);
      await Promise.race([got, new Promise(r => setTimeout(r, 3000))]);
      cleanup();
      return text() || null;
    },
    cancel() { dead = true; cleanup(); },
    get text() { return text(); },
  };
}
