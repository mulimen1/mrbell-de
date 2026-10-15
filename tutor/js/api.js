// Verbindung zur KI. Es geht nur der benötigte Textausschnitt raus – gespeichert wird dort nichts.
import { ls, uid } from './util.js';
import { S } from './state.js';
import { lang, getOutLang } from './i18n.js';

export const API_URL = (window.TUTOR_API || 'https://hub.mrbell.de/n8n/webhook/tutor-ki-7c41e2');

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

export async function ask(action, payload = {}, { signal } = {}) {
  const extra = {};
  const ses = getSession(); if (ses) extra.session = ses;
  if (payload.material != null && S.doc?.generated) extra.src = 'max';
  const body = JSON.stringify({ action, device: device(), ui: lang, lang: getOutLang(), ...extra, ...payload });
  let res;
  try {
    res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError('offline', 'Keine Verbindung zu Max. Prüf dein Internet oder versuch es gleich nochmal.');
  }
  let j = null;
  try { j = await res.json(); } catch (e) {}
  if (!res.ok || !j) throw new ApiError('server', 'Max ist gerade nicht erreichbar. Versuch es in ein paar Minuten nochmal.');
  if (j.quota) setQuota(j.quota);
  if ('account' in j) { if (j.account || ses) setAccount(j.account, j.account ? ses : null); }
  if (!j.ok) throw new ApiError(j.error || 'error', j.message || 'Das hat nicht geklappt.');
  return j;
}

export async function ping() {
  try { await ask('ping'); return true; } catch (e) { return false; }
}
