// BWL Max: Sprüche je nach Arroganz-Level (1 = seriös, 2 = spicy, 3 = voll Sylt)
import { ls } from './util.js';

export const SPICE = [[1, 'Seriös'], [2, 'Spicy'], [3, 'Voll Sylt']];
export const getSpice = () => { const v = +ls.get('tutor.spice', 2); return v >= 1 && v <= 3 ? v : 2; };
export const setSpice = v => ls.set('tutor.spice', v);
export const NAME = 'BWL Max';

const L = {
  greet: {
    1: ['Hi, ich bin Max. Ich erkläre dir deine Vorlesung an der Tafel.', 'Aus deinem Skript mache ich Quiz, Karteikarten und einen Podcast.', 'Klausur bald? Ich baue dir einen Lernpfad.', 'Kein Skript da? Sag mir das Thema, ich schreibe dir eins.', 'Du kannst auch einfach mit mir reden.'],
    2: ['Moin, ich bin Max. Ich erklär dir deine Vorlesung. An der Tafel.', 'Gib mir dein Skript – ich mach Quiz, Karten und Podcast draus.', 'Klausur bald? Ich bau dir den Lernpfad. Papa hätte einen Berater geholt.', 'Kein Skript? Sag mir das Thema, ich schreib dir eins.', 'Lieber reden statt tippen? Klick hier drunter. Ich klinge gut.'],
    3: ['Moin aus Kampen. Ich bin Max und erklär dir jede Vorlesung.', 'Skript rein, Quiz raus. Effizienz hab ich von Papa.', 'Karteikarten, Podcast, Lernpfad – mach ich zwischen zwei Golfrunden.', 'Kein Skript? Nenn mir ein Thema. Ich diktier dir eins.', 'Reden geht auch. Wie ein Podcast, nur mit besserem Haar.']
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
