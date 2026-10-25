// Neue, größere Design-Umbauten erst nur für Ben (Gründer-Konto) – danach für alle freischalten.
// Freischalten für alle: ALL = true. Zum Testen auf einem anderen Gerät: localStorage 'tutor.beta' = '1'.
import { getAccount } from './api.js';

const ALL = false;
const FOUNDER = ['bendeschler0@gmail.com'];
export function beta() {
  if (ALL) return true;
  try { if (localStorage.getItem('tutor.beta') === '1') return true; } catch (e) {}
  const a = getAccount();
  return !!(a && FOUNDER.includes(String(a.email || '').toLowerCase()));
}
