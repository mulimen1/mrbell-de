// BWL Max: Sprüche je nach Arroganz-Level (1 = seriös, 2 = spicy, 3 = voll Sylt)
import { ls } from './util.js';

export const SPICE = [[1, 'Seriös'], [2, 'Spicy'], [3, 'Voll Sylt']];
export const getSpice = () => { const v = +ls.get('tutor.spice', 2); return v >= 1 && v <= 3 ? v : 2; };
export const setSpice = v => ls.set('tutor.spice', v);
export const NAME = 'BWL Max';

const L = {
  greet: {
    1: ['Hey. Wie kann ich dir heute helfen?', 'Welche Vorlesung nehmen wir uns vor?', 'Bereit? Lad dein Skript hoch.'],
    2: ['Moin. Porsche steht, Skript bitte.', 'Kurz Quarter-Zip gerichtet. Was lernen wir?', 'Ich hab um 14 Uhr Tennis. Bis dahin: du.', 'Bilanz? Bilanziere ich im Schlaf.', 'Lad hoch. Ich mach das schon.'],
    3: ['Papa sagt, ich soll was Soziales machen. Also helf ich dir.', 'Moin aus Kampen. Was steht an?', 'Ohne meinen Porsche komm ich nicht zur Uni. Ohne mich du nicht durch die Klausur.', 'Ich hab Deckungsbeitrag schon im Kindergarten gerechnet.', 'Network ist Net Worth. Also: Skript her.']
  },
  welcome: {
    1: d => `Hey! Ich hab „${d}“ gelesen. Frag mich, was du nicht verstehst – ich erklär’s dir an der Tafel. Oder soll ich dich abfragen?`,
    2: d => `Moin. „${d}“ hab ich durch – schneller als mein Flat White kalt wird. Frag mich, was hakt, ich schreib’s dir an die Tafel. Oder soll ich dich abfragen?`,
    3: d => `So. „${d}“ gelesen, zwischen Golf und Brunch. Was verstehst du nicht? Ich erklär’s dir an der Tafel – kostenlos, ich bin heute großzügig.`
  },
  thinking: {
    1: ['Einen Moment …', 'Ich lese nach …', 'Ich denke kurz nach …'],
    2: ['Kurz nachdenken …', 'Ich check das mal …', 'Moment, ich rechne …', 'Excel im Kopf läuft …'],
    3: ['Ich frag kurz meinen Vermögensberater …', 'Moment, ich parke nur noch den Porsche …', 'Excel im Kopf läuft …', 'Ich rechne. Mit Stil.']
  },
  right: {
    1: ['Richtig.', 'Genau so.', 'Sitzt.', 'Stark.'],
    2: ['Richtig. Fast so gut wie ich.', 'Sauber. Das gibt Rendite.', 'Sitzt. Next.', 'Stark. Ich bin beeindruckt. Fast.'],
    3: ['Korrekt. Du darfst mit nach Sylt.', 'Sauber. Papa wäre stolz. Auf mich.', 'Richtig. Ich hätt’s schneller gehabt.', 'Exzellent. Das ist Holding-Niveau.']
  },
  wrong: {
    1: ['Noch nicht ganz.', 'Knapp daneben.', 'Fast.'],
    2: ['Knapp daneben. Passiert den Besten. Mir nicht, aber egal.', 'Nope. Aber wir kriegen das hin.', 'Noch nicht ganz. Schau dir die Erklärung an.'],
    3: ['Autsch. Aber keine Sorge, ich hab auch mal falsch geparkt.', 'Leider nein. Das kostet dich einen Flat White.', 'Daneben. Wir arbeiten dran – ich bin ja da.']
  },
  limit: {
    1: 'Für heute ist dein KI-Limit voll. Um 0:00 Uhr geht’s weiter. Bis dahin kannst du mit deinen Quizzen, Karteikarten und dem Trainer üben – das kostet nichts.',
    2: 'Heute hab ich genug gearbeitet – um 0:00 Uhr bin ich wieder da. Bis dahin: Quizze, Karteikarten und Trainer gehen weiter, gratis.',
    3: 'Feierabend. Ich bin auf’m Golfplatz. Um 0:00 Uhr bin ich zurück. Bis dahin: Karteikarten, Quizze und Trainer gehen gratis weiter.'
  },
  done: {
    1: ['Gut gemacht.', 'Stark.'],
    2: ['Läuft bei dir.', 'Gute Performance. Fast wie mein Depot.'],
    3: ['Das ist Unternehmensberatungs-Niveau.', 'So sieht ein künftiger Partner aus.']
  }
};
const pick = a => a[Math.floor(Math.random() * a.length)];
export function say(kind, arg) {
  const s = getSpice();
  const v = L[kind]?.[s] ?? L[kind]?.[2];
  if (typeof v === 'function') return v(arg);
  if (Array.isArray(v)) return pick(v);
  return v;
}
export function lines(kind) { return L[kind]?.[getSpice()] || []; }
