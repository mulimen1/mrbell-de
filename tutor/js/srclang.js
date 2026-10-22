// Sprache von Skript/Notizen erkennen und festlegen, in welcher Sprache Max Inhalte erstellt.
// Standard: in der Sprache des Materials. Ist es nicht Deutsch, fragt Max vorher kurz nach.
import { h } from './util.js';
import { L, getOutLang } from './i18n.js';

// code → [Deutsch, Englisch, eigener Name]
export const LANGS = {
  de: ['Deutsch', 'German', 'Deutsch'], en: ['Englisch', 'English', 'English'], fr: ['Französisch', 'French', 'Français'], es: ['Spanisch', 'Spanish', 'Español'],
  it: ['Italienisch', 'Italian', 'Italiano'], nl: ['Niederländisch', 'Dutch', 'Nederlands'], pt: ['Portugiesisch', 'Portuguese', 'Português'], pl: ['Polnisch', 'Polish', 'Polski'],
  tr: ['Türkisch', 'Turkish', 'Türkçe'], ru: ['Russisch', 'Russian', 'Русский'], uk: ['Ukrainisch', 'Ukrainian', 'Українська'], ar: ['Arabisch', 'Arabic', 'العربية'],
  zh: ['Chinesisch', 'Chinese', '中文'], ja: ['Japanisch', 'Japanese', '日本語'], ko: ['Koreanisch', 'Korean', '한국어'], vi: ['Vietnamesisch', 'Vietnamese', 'Tiếng Việt'],
  hi: ['Hindi', 'Hindi', 'हिन्दी'], fa: ['Persisch', 'Persian', 'فارسی'], sv: ['Schwedisch', 'Swedish', 'Svenska'], da: ['Dänisch', 'Danish', 'Dansk'], no: ['Norwegisch', 'Norwegian', 'Norsk'],
  fi: ['Finnisch', 'Finnish', 'Suomi'], cs: ['Tschechisch', 'Czech', 'Čeština'], ro: ['Rumänisch', 'Romanian', 'Română'], el: ['Griechisch', 'Greek', 'Ελληνικά'], hu: ['Ungarisch', 'Hungarian', 'Magyar'],
  id: ['Indonesisch', 'Indonesian', 'Bahasa Indonesia'], th: ['Thai', 'Thai', 'ไทย'], he: ['Hebräisch', 'Hebrew', 'עברית'], bg: ['Bulgarisch', 'Bulgarian', 'Български'], hr: ['Kroatisch', 'Croatian', 'Hrvatski'], sr: ['Serbisch', 'Serbian', 'Srpski']
};
export const langName = c => (LANGS[c] ? L(LANGS[c][0], LANGS[c][1]) : c);

// Häufige kurze Wörter je Sprache (lateinische Schrift)
const SW = {
  de: 'der die das und ist nicht mit sich auf für ein eine dem den des von zu im auch wird werden als bei oder wenn sind aus nach wie über kann',
  en: 'the and of to is in that for are with as on be this by or from at it an which not have can was will their these',
  fr: 'le la les et des est une un du que dans pour pas sur par au sont avec il ce qui plus aux ou',
  es: 'el la los las y de que en un una es por con para del se como más al su lo sus',
  it: 'il la le di che e un una per non sono con del della dei gli è si al nel anche',
  nl: 'de het een en van is dat niet op te zijn met voor als bij ook door wordt aan',
  pt: 'o a os as e de que em um uma para com não do da dos das por se mais ao',
  pl: 'i w nie się na z do to jest że o jak ale po co od przez dla są',
  tr: 've bir bu da de için ile ne olarak daha çok gibi olan ama değil',
  sv: 'och att det är som en på för av med den till inte har de om',
  da: 'og at det er som en på for af med den til ikke har de om',
  no: 'og at det er som en på for av med den til ikke har de om',
  fi: 'ja on että ei se ovat mutta kun tai myös joka hän',
  cs: 'a je v se na že to s z do o jako pro ale není',
  ro: 'și de la în pe cu care este un o nu din pentru mai',
  hu: 'a az és hogy nem is egy van meg de ez csak',
  id: 'dan yang di ini itu dengan untuk dari dalam tidak akan pada adalah',
  vi: 'và của là có không được các những cho với trong này',
  hr: 'i je u se na da su za od koji ne kao ali',
};
const SWS = Object.fromEntries(Object.entries(SW).map(([k, v]) => [k, new Set(v.split(' '))]));

export function detectLang(text) {
  const t = String(text || '').slice(0, 20000);
  if (t.replace(/\s/g, '').length < 30) return '';
  const cnt = re => (t.match(re) || []).length;
  const letters = cnt(/\p{L}/gu) || 1;
  // Schriften mit eigener Schrift
  const scripts = [['ko', /[가-힯ᄀ-ᇿ]/g], ['ja', /[぀-ヿ]/g], ['zh', /[一-鿿]/g], ['ar', /[؀-ۿ]/g], ['he', /[֐-׿]/g],
    ['th', /[฀-๿]/g], ['hi', /[ऀ-ॿ]/g], ['el', /[Ͱ-Ͽ]/g], ['ru', /[Ѐ-ӿ]/g]];
  const sc = scripts.map(([k, re]) => [k, cnt(re)]);
  const ko = sc[0][1], ja = sc[1][1], zh = sc[2][1];
  if (ko / letters > .15) return 'ko';
  if (ja / letters > .05) return 'ja';
  if (zh / letters > .15) return 'zh';
  const ar = sc[3][1];
  if (ar / letters > .2) return /[پچژگ]/.test(t) ? 'fa' : 'ar';
  for (const [k, n] of sc.slice(4)) if (n / letters > .2) {
    if (k === 'ru') return /[їєі]/.test(t) ? 'uk' : /[ђћџ]/.test(t) ? 'sr' : 'ru';
    return k;
  }
  // Lateinische Schrift: Stoppwörter zählen
  const words = t.toLowerCase().match(/\p{L}+/gu) || [];
  const score = {};
  for (const w of words.slice(0, 4000)) for (const k in SWS) if (SWS[k].has(w)) score[k] = (score[k] || 0) + 1;
  // Umlaute/Sonderzeichen als Zusatz
  score.de = (score.de || 0) + cnt(/[äöüß]/gi) * .3;
  score.tr = (score.tr || 0) + cnt(/[ğışİ]/g) * .5;
  score.pl = (score.pl || 0) + cnt(/[ąęłńśźż]/g) * .5;
  score.cs = (score.cs || 0) + cnt(/[ěřůčš]/g) * .4;
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] < 4) return '';
  if (best[0] === 'no' && score.da >= best[1]) return 'da';
  return best[0];
}

// Ausgabe-Sprache für ein Skript: gewählt > erkannt > Einstellung
export const docOut = d => (d && (d.outLang || d.srcLang)) || getOutLang();

// Auswahlzeile: erkannte Sprache, Deutsch, Englisch (+ weitere im Menü)
export function langPicker(src, cur, onPick) {
  const opts = [...new Set([src, 'de', 'en'].filter(c => c && LANGS[c]))];
  const w = h('div', { class: 'ik-seg sl-seg', role: 'radiogroup' });
  const sel = h('select', { class: 'sl-more', 'aria-label': L('Andere Sprache', 'Other language') },
    h('option', { value: '' }, L('Andere …', 'Other …')),
    Object.keys(LANGS).filter(c => !opts.includes(c)).map(c => h('option', { value: c }, `${LANGS[c][2]} · ${langName(c)}`)));
  const paint = () => { w.querySelectorAll('button').forEach(b => { const on = b.dataset.v === cur; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); }); sel.value = opts.includes(cur) ? '' : cur; };
  opts.forEach(c => w.append(h('button', { type: 'button', role: 'radio', 'data-v': c, onclick: () => { cur = c; paint(); onPick(c); } }, c === src && c !== 'de' ? `${langName(c)} · ${L('erkannt', 'detected')}` : langName(c))));
  sel.addEventListener('change', () => { if (sel.value) { cur = sel.value; paint(); onPick(cur); } });
  w.append(sel);
  paint();
  return w;
}

// Kurz nachfragen (nur wenn das Material nicht auf Deutsch ist). Gibt den gewählten Code zurück.
export async function askLang(src, { what } = {}) {
  if (!src || src === 'de') return src || getOutLang();
  const { modal } = await import('./util.js');
  let pick = src;
  const body = h('div', { class: 'sl-ask' }, langPicker(src, src, c => { pick = c; }));
  const r = await modal({ cls: 'sl-modal', eyebrow: L(`${langName(src)} erkannt`, `${langName(src)} detected`), title: L('In welcher Sprache soll ich’s dir erstellen?', 'Which language should I create it in?'),
    text: what || L('Standard ist die Sprache deines Materials. Du kannst das später jederzeit ändern.', 'Default is the language of your material. You can change it any time.'), body,
    actions: [{ label: L('Weiter', 'Continue'), value: 'ok', primary: true }] });
  return r === 'ok' || r ? pick : src;
}
