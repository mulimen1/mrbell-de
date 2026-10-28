// Verbindung zur KI. Es geht nur der benötigte Textausschnitt raus – gespeichert wird dort nichts.
import { ls, uid } from './util.js';
import { S } from './state.js';
import { lang, getOutLang, L } from './i18n.js';
import { repairDeep } from './math.js';
import { rechenGate } from './rechengate.js';

export const API_URL = (window.TUTOR_API || 'https://hub.mrbell.de/n8n/webhook/tutor-ki-7c41e2');
// Lange KI-Arbeit läuft in einem eigenen Schritt: erst Auftrag (schnell, zählt Kontingent), dann Ausführung
export const RUN_URL = (window.TUTOR_RUN || API_URL.replace(/tutor-ki-7c41e2$/, 'tutor-run-5b8e31'));

export function device() {
  let d = ls.get('tutor.device');
  if (!d) { d = 'g' + uid().replace(/-/g, '').slice(0, 20); ls.set('tutor.device', d); }
  return d;
}

let quota = ls.get('tutor.quota', null);
const listeners = new Set();
export function onQuota(fn) { listeners.add(fn); fn(quota); return () => listeners.delete(fn); }
function setQuota(q) {
  if (!q) return;
  quota = { ...q, day: new Date().toDateString() };
  ls.set('tutor.quota', quota);
  listeners.forEach(f => f(quota));
}
export function currentQuota() {
  if (quota && quota.day !== new Date().toDateString()) quota = { used: 0, limit: quota.limit, left: quota.limit, day: new Date().toDateString() };
  return quota;
}

export const COST = { topic: 2, chat: 1, quiz: 2, exam: 3, cards: 2, path: 2, lesson: 2, podcast: 3, summary: 2, grade: 1 };

export class ApiError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

// ---------- Konto ----------
let account = ls.get('tutor.account', null);
const accListeners = new Set();
export const getSession = () => ls.get('tutor.session', null);
export const getAccount = () => account;
export function onAccount(fn) { accListeners.add(fn); fn(account); return () => accListeners.delete(fn); }
export function setAccount(a, session) {
  if (session !== undefined) ls.set('tutor.session', session);
  account = a || null; ls.set('tutor.account', account);
  accListeners.forEach(f => { try { f(account); } catch (e) {} });
}

const EV = { analyse: ['Upload eingeordnet'], ocr: ['Foto abgeschrieben'], topic: ['Thema erklärt'], quiz: ['Erstellt', 'Quiz'], exam: ['Erstellt', 'Probeklausur'], cards: ['Erstellt', 'Karteikarten'], path: ['Erstellt', 'Lernpfad'],
  lesson: ['Erstellt', 'Lektion'], podcast: ['Erstellt', 'Podcast'], summary: ['Erstellt', 'Lernzettel & Mindmap'], live: ['Sprechen gestartet'], verify: ['Angemeldet'] };
// images: [{mime, data}] gehen nur im zweiten Schritt mit (Upload-Analyse, Foto-Abschrift)
// Jede Antwort von Max mit Erklärungen/Rechnungen läuft durch das Rechen-Gate (rechengate.js) – ohne Ausnahme.
export async function ask(action, payload = {}, opt = {}) {
  // Kam von der KI nichts zurück (überlastet, Zeitlimit, leere Antwort)? Einmal still nochmal – meist klappt's direkt.
  let j;
  for (let t = 0; ; t++) {
    try { j = await askRaw(action, payload, { ...opt, intern: opt.intern || t > 0 }); break; }
    catch (e) {
      if (t >= 1 || !e || !['ai', 'server', 'job'].includes(e.code) || (opt.signal && opt.signal.aborted)) throw e;
      await new Promise(r => setTimeout(r, 1800));
      if (opt.signal && opt.signal.aborted) throw e;
    }
  }
  return rechenGate(action, payload, j, (a, p, o) => askRaw(a, p, { ...o, intern: true }), { signal: opt.signal });
}
async function askRaw(action, payload = {}, { signal, images, intern } = {}) {
  if (!intern) try { const e = action === 'chat' ? ['Max gefragt', payload.opts && payload.opts.assistant ? 'Assistent' : 'Chat'] : EV[action]; if (e && window.BM) window.BM.track(e[0], e[1] || ''); } catch (x) {}
  const extra = {};
  const ses = getSession(); if (ses) extra.session = ses;
  if (payload.material != null && S.doc?.generated) extra.src = 'max';
  // Inhalte in der Sprache des Skripts (gewählt beim Hochladen; Standard = Sprache des Materials)
  if (payload.material != null && payload.lang == null && action !== 'analyse' && S.doc && (S.doc.outLang || S.doc.srcLang)) extra.lang = S.doc.outLang || S.doc.srcLang;
  const body = JSON.stringify({ action, device: device(), ui: lang, lang: getOutLang(), ...extra, ...payload });
  let j = await post(API_URL, body, signal);
  if (j.ok && j.job) {
    if (j.quota) setQuota(j.quota);
    j = await post(RUN_URL, JSON.stringify(Object.assign({ job: j.job, device: device(), ui: lang }, images && images.length ? { images: images.map(x => ({ mime: x.mime, data: x.data })) } : {})), signal);
  }
  if (j.quota) setQuota(j.quota);
  if ('account' in j) { if (j.account || ses) setAccount(j.account, j.account ? ses : null); }
  // Neues Konto: immer zählen (ohne Einwilligung nur die Anzahl, ohne Kennung und Ort)
  if (action === 'verify' && j.ok && j.fresh) { try { if (window.BM && window.BM.ok()) window.BM.track('Konto erstellt'); else fetch('/bm', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ ereignis: 'Konto erstellt', detail: '', seite: '/' }), keepalive: true, credentials: 'omit' }).catch(() => {}); } catch (x) {} }
  if (!j.ok) throw Object.assign(new ApiError(j.error || 'error', j.message || L('Das hat nicht geklappt.', 'That didn’t work.')), { suggest: j.suggest || '' });
  // Inhaltsfilter: Max hat die Anfrage, das Bild oder das Material abgelehnt
  if (JSON.stringify(j).includes('[[GESPERRT]]')) throw new ApiError('blocked', L('Dabei helfe ich nicht. BWL Max ist zum Lernen da – sexuelle, beleidigende oder extremistische Inhalte verarbeite ich nicht.', 'I can’t help with that. BWL Max is for studying – I don’t process sexual, insulting or extremist content.'));
  // Formel-Rohcode der KI reparieren (einfach escapte Befehle, $…$), bevor irgendetwas angezeigt wird
  return repairDeep(j);
}

async function post(url, body, signal) {
  let res;
  try {
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError('offline', L('Keine Verbindung zu Max. Prüf dein Internet oder versuch es gleich nochmal.', 'Can’t reach Max. Check your internet or try again in a moment.'));
  }
  let j = null;
  try { j = await res.json(); } catch (e) { if (e?.name === 'AbortError') throw e; }
  if (!res.ok || !j) throw new ApiError('server', L('Max ist gerade nicht erreichbar. Versuch es in ein paar Minuten nochmal.', 'Max isn’t available right now. Try again in a few minutes.'));
  return j;
}

export async function ping() {
  try { await ask('ping'); return true; } catch (e) { return false; }
}
