// Neue, größere Design-Umbauten erst nur für Ben (Gründer-Konto) – danach für alle freischalten.
// Freischalten für alle: ALL = true. Zum Testen auf einem anderen Gerät: localStorage 'tutor.beta' = '1'.
import { getAccount } from './api.js';

const ALL = true;
const FOUNDER = ['bendeschler0@gmail.com'];
// Zum Ansehen ohne Konto (z. B. Landingpage im privaten Fenster): Link mit ?beta=1 (aus: ?beta=0)
try { const q = new URLSearchParams(location.search).get('beta'); if (q === '1') localStorage.setItem('tutor.beta', '1'); if (q === '0') localStorage.removeItem('tutor.beta'); } catch (e) {}
export function beta() {
  if (ALL) return true;
  try { if (localStorage.getItem('tutor.beta') === '1') return true; } catch (e) {}
  const a = getAccount();
  return !!(a && FOUNDER.includes(String(a.email || '').toLowerCase()));
}

// Neue Übersicht ohne Chat (Werkzeuge zuerst) – erst nur für Ben bzw. mit ?beta=1, danach HOME_ALL = true
const HOME_ALL = false;
export function homeBeta() {
  if (HOME_ALL) return true;
  try { if (localStorage.getItem('tutor.beta') === '1') return true; } catch (e) {}
  const a = getAccount();
  return !!(a && FOUNDER.includes(String(a.email || '').toLowerCase()));
}
