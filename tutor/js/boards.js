// Sofort-Tafeln für Themen-Einstiege (Google-Anzeigen: bwlmax.de/?thema=…).
// Statt 25–30 s auf die KI zu warten, kommt eine einmal vorab erzeugte (und geprüfte) Tafel aus tutor/boards/<slug>.json.
// Sie läuft durch genau denselben Weg wie eine Live-Tafel (assistant.js → answer()), nur ohne Server-Aufruf –
// verbraucht also kein Gast-Kontingent. Erst die Rückfrage geht live an die KI, mit dem Tafelinhalt im Verlauf.
import { lang, getOutLang } from './i18n.js';
import { repairDeep } from './math.js';

// Slugs mit gespeicherter Tafel (deutsch). Neue Tafel: JSON nach tutor/boards/ legen und hier eintragen.
export const INSTANT = new Set(['kapitalwert', 'buchungssatz', 'deckungsbeitrag', 'break-even', 'bilanz', 'guv', 'swot', 'abschreibung', 'marketing-mix', 'zuschlagskalkulation', 'bwl', 'kostenrechnung', 'zinsfuss', 'amortisation', 'optimale-bestellmenge', 'abc-analyse', 'porter', 'bcg-matrix', 'preiselastizitaet', 'rechtsformen', 'rentabilitaet', 'aktiva-passiva', 'eroeffnungsbilanz', 'bilanzanalyse', 'swot-beispiel', 'swot-matrix', 'swot-vorlage', 'opportunitaetskosten', 'balanced-scorecard', 'produktlebenszyklus', 'ansoff-matrix', 'fuehrungsstile', 'leverage', 'annuitaet', 'bab', 'rueckstellungen', 'eigenkapitalrentabilitaet', 'grenzkosten', 'angebot-und-nachfrage', 'barwert-abzinsen', 'bestandskonten-erfolgskonten', 'bruttoinlandsprodukt', 'cashflow', 'divisionskalkulation', 'doppelte-buchfuehrung', 'eigenkapitalquote', 'einzelkosten-gemeinkosten', 'finanzierungsarten', 'fixe-und-variable-kosten', 'gewinnvergleichsrechnung', 'inflation', 'inventur-inventar', 'kalkulatorische-kosten', 'kostenvergleichsrechnung', 'liquiditaetsgrade', 'make-or-buy', 'maschinenstundensatz', 'optimales-produktionsprogramm', 'organisationsformen', 'pestel-analyse', 'rechnungsabgrenzungsposten', 'skonto-buchen', 'smart-ziele', 'tilgungsplan', 'umsatzsteuer-vorsteuer-buchen', 'zinseszins', 'latente-steuern', 'buchungssaetze-uebungen', 'aufwand-und-kosten', 'plankostenrechnung', 'wacc', 'konsumentenrente-produzentenrente']);

// Nur deutsch gespeichert – englische Oberfläche/Ausgabe nimmt weiter den Live-Weg
export const hasInstant = slug => !!slug && INSTANT.has(slug) && lang === 'de' && getOutLang() === 'de';

const cache = new Map();
// Lädt die gespeicherte Antwort genau so, wie der Server sie liefert ({ ok, text, model, tools, … }); null bei Fehler
export function loadInstant(slug) {
  if (!hasInstant(slug)) return Promise.resolve(null);
  if (!cache.has(slug)) {
    const p = fetch(new URL(`../boards/${slug}.json`, import.meta.url), { credentials: 'same-origin' })
      .then(r => (r.ok ? r.json() : null))
      .then(j => (j && j.ok && typeof j.text === 'string' && /```tafel/.test(j.text) ? j : null))
      .catch(() => null);
    cache.set(slug, p);
    p.then(j => { if (!j) cache.delete(slug); });   // Fehler nicht merken – nächster Versuch darf neu laden
  }
  return cache.get(slug);
}

// Tafel als Klartext (Formeln bleiben als LaTeX), damit Max bei der Rückfrage weiß, was an der Tafel steht
function boardText(html) {
  let doc; try { doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html'); } catch (e) { return ''; }
  const root = doc.body.firstElementChild; if (!root) return '';
  root.querySelectorAll('script,style,svg').forEach(n => n.replaceWith(doc.createTextNode(' [Grafik] ')));
  root.querySelectorAll('br').forEach(n => n.replaceWith(doc.createTextNode('\n')));
  root.querySelectorAll('td,th').forEach(n => n.append(doc.createTextNode(' | ')));
  root.querySelectorAll('li').forEach(n => n.prepend(doc.createTextNode('• ')));
  root.querySelectorAll('h1,h2,h3,h4,p,li,tr,div,table,ul,ol').forEach(n => n.append(doc.createTextNode('\n')));
  // Rechnungen, Tabellen, Ergebnisse vollständig; lange Fließtexte gekürzt – so passt die ganze Tafel ins Budget
  const FULL = /\b(calc|result|formel|bs|step|tkonto|kpis)\b/;
  return [...root.children].map(el => {
    let t = el.textContent.replace(/\u00ad/g, '').replace(/\\text\{ ?€\}/g, '€').replace(/\\([(\[]) /g, '\\$1').replace(/ \\([)\]])/g, '\\$1')
      .replace(/[ \t]+/g, ' ').replace(/ *\| *\n/g, '\n').replace(/ *\n */g, '\n').replace(/\n{2,}/g, '\n').trim();
    if (!t || el.classList.contains('source')) return '';
    const cap = el.tagName === 'TABLE' || el.querySelector('table') || FULL.test(el.className) ? 700 : /^H\d$/.test(el.tagName) ? 100 : 150;
    return t.length > cap ? t.slice(0, cap - 1) + '…' : t;
  }).filter(Boolean).join('\n');
}

// Rückfrage-Kontext: ```kontext-Block bleibt in forHistory() erhalten (nur ```tafel/```zeigen werden ersetzt),
// parse() blendet ihn in der Anzeige aus. forHistory kürzt auf 2400 Zeichen → Platz dafür einrechnen.
function withContext(text) {
  const m = text.match(/```tafel[ \t]*([^\n]*)\n([\s\S]*?)```/);
  if (!m) return text;
  const intro = text.replace(/```tafel[\s\S]*?```/g, '').trim();
  const room = Math.max(600, 2300 - intro.length - 160);
  let body = boardText(m[2]); if (body.length > room) body = body.slice(0, room - 1) + '…';
  return `${text}\n\`\`\`kontext\n[Inhalt deiner Tafel „${m[1].trim()}“ – die steht gerade groß vor dem Nutzer, Rückfragen beziehen sich darauf:\n${body}]\n\`\`\``;
}

// Hook für assistant.js submit(): beim Themen-Einstieg mit gespeicherter Tafel die Server-Antwort ersetzen.
// Gibt null zurück (→ Live-Weg), wenn nichts da ist oder das Laden hakt.
export async function instantReply(o) {
  if (!o || !o.entry || !hasInstant(o.slug)) return null;
  const j = await Promise.race([loadInstant(o.slug), new Promise(r => setTimeout(() => r(null), 3000))]);
  if (!j) return null;
  const r = repairDeep(JSON.parse(JSON.stringify(j)));   // dieselbe Formel-Reparatur wie api.js ask()
  delete r.quota; delete r.account;
  r.text = withContext(String(r.text));
  r.instant = true;
  try { if (window.BM) window.BM.track('Max gefragt', 'Sofort-Tafel'); } catch (e) {}
  return r;
}

// Klausurfragen-Tafel zum Thema (vorgefertigt, boards/klausur-<slug>.json) – null, wenn es keine gibt
const kcache = new Map();
export async function examReply(slug) {
  if (!slug || lang !== 'de' || getOutLang() !== 'de') return null;
  if (!kcache.has(slug)) kcache.set(slug, fetch(new URL(`../boards/klausur-${slug}.json`, import.meta.url), { credentials: 'same-origin' }).then(r => (r.ok ? r.json() : null)).then(j => (j && j.ok && /```tafel/.test(j.text || '') ? j : null)).catch(() => null));
  const j = await Promise.race([kcache.get(slug), new Promise(r => setTimeout(() => r(null), 3000))]);
  if (!j) { kcache.delete(slug); return null; }
  const r = repairDeep(JSON.parse(JSON.stringify(j)));
  delete r.quota; delete r.account;
  r.instant = true;
  return r;
}
