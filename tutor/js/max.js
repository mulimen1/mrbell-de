// BWL Max: Sprüche je nach Arroganz-Level (1 = seriös, 2 = spicy, 3 = voll Sylt)
import { ls } from './util.js';
import { L, EN } from './i18n.js';

export const SPICE = [[1, L('Seriös', 'Serious')], [2, 'Spicy'], [3, L('Voll Sylt', 'Full Sylt')]];
export const getSpice = () => { const v = +ls.get('tutor.spice', 2); return v >= 1 && v <= 3 ? v : 2; };
export const setSpice = v => ls.set('tutor.spice', v);
export const NAME = 'BWL Max';

const DE = {
  greet: {
    1: ['Hi, ich bin Max. Ich erkläre dir deine Vorlesung an der Tafel.', 'Aus deinem Skript mache ich Quiz, Karteikarten und einen Podcast.', 'Klausur bald? Ich baue dir einen Lernpfad.', 'Kein Skript da? Sag mir das Thema, ich schreibe dir eins.', 'Du kannst auch einfach mit mir reden.'],
    2: ['Moin aus Kampen. Ich bin Max und erklär dir jede Vorlesung.', 'Skript rein, Quiz raus. Effizienz hab ich von Papa.', 'Karteikarten, Podcast, Lernpfad – mach ich zwischen zwei Golfrunden.', 'Reden geht auch. Wie ein Podcast, nur mit besserem Haar.', 'Ich erklär dir das an der Tafel. Ich hab Zeit, der Porsche steht eh in der Werkstatt.', 'Kein Skript dabei? Ich auch nie. Nenn mir das Thema, ich regel das.', 'Deine Klausur ist mein neues Hobby. Polo war mir zu anstrengend.', 'Lernpfad? Hab ich gebaut, bevor du „Lernpfad“ googeln konntest.'],
    3: ['Moin aus Kampen. Ich bin Max und erklär dir jede Vorlesung.', 'Skript rein, Quiz raus. Effizienz hab ich von Papa.', 'Karteikarten, Podcast, Lernpfad – mach ich zwischen zwei Golfrunden.', 'Reden geht auch. Wie ein Podcast, nur mit besserem Haar.', 'Papa wollte einen Berater für dich. Ich bin billiger und hab bessere Haare.', 'Ich hab Bilanzen gelesen, bevor ich lesen konnte. Sagt zumindest Mama.', 'Mein Quarter-Zip kostet mehr als dein Semesterticket. Meine Erklärungen sind trotzdem gratis.', 'Kein Skript? Nenn mir ein Thema. Ich diktier dir eins – vom Boot aus.']
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
const ENG = {
  greet: {
    1: ['Hi, I’m Max. I explain your lecture on the whiteboard.', 'I turn your slides into quizzes, flashcards and a podcast.', 'Exam coming up? I’ll build you a study path.', 'No slides? Tell me the topic and I’ll write you a script.', 'You can also just talk to me.'],
    2: ['Hi from Sylt. I’m Max, and I explain any lecture.', 'Slides in, quiz out. I get the efficiency from my dad.', 'Flashcards, podcast, study path – I do them between two rounds of golf.', 'We can also talk. Like a podcast, just with better hair.', 'I’ll explain it on the whiteboard. I have time, the Porsche is in the shop anyway.', 'No slides? Me neither, ever. Give me the topic, I’ll handle it.', 'Your exam is my new hobby. Polo was too exhausting.', 'Study path? Built it before you could google “study path”.'],
    3: ['Hi from Sylt. I’m Max, and I explain any lecture.', 'Slides in, quiz out. I get the efficiency from my dad.', 'Flashcards, podcast, study path – I do them between two rounds of golf.', 'We can also talk. Like a podcast, just with better hair.', 'Dad wanted to hire you a consultant. I’m cheaper and have better hair.', 'I read balance sheets before I could read. Or so Mum says.', 'My quarter-zip costs more than your semester ticket. My explanations are still free.', 'No slides? Name a topic. I’ll dictate you a script – from the boat.']
  },
  welcome: {
    1: d => `Hey! I’ve read “${d}”. Ask me whatever you don’t get – I’ll explain it on the whiteboard. Or should I quiz you?`,
    2: d => `Hi. Done with “${d}” – faster than my flat white goes cold. Ask me what’s unclear, I’ll put it on the whiteboard. Or should I quiz you?`,
    3: d => `Right. Read “${d}” between golf and brunch. What don’t you get? I’ll explain it on the whiteboard – free, I’m feeling generous today.`
  },
  thinking: {
    1: ['One moment …', 'Looking it up …', 'Thinking …'],
    2: ['Thinking …', 'Let me check …', 'Hold on, calculating …', 'Mental Excel running …'],
    3: ['Quickly asking my wealth manager …', 'Hold on, just parking the Porsche …', 'Mental Excel running …', 'Calculating. With style.']
  },
  right: {
    1: ['Correct.', 'Exactly.', 'Nailed it.', 'Strong.'],
    2: ['Correct. Almost as good as me.', 'Clean. That’s a return.', 'Nailed it. Next.', 'Strong. I’m impressed. Almost.'],
    3: ['Correct. You’re invited to Sylt.', 'Clean. Dad would be proud. Of me.', 'Correct. I’d have been faster.', 'Excellent. That’s holding-company level.']
  },
  wrong: {
    1: ['Not quite.', 'Close.', 'Almost.'],
    2: ['Close. Happens to the best. Not to me, but still.', 'Nope. But we’ll get there.', 'Not quite yet. Check the explanation.'],
    3: ['Ouch. Don’t worry, I’ve parked badly before too.', 'Sadly no. That’ll cost you a flat white.', 'Missed. We’re on it – I’m here, after all.']
  },
  limit: {
    1: 'Your AI limit for today is used up. It resets at midnight. Until then you can practise with your quizzes, flashcards and the trainer – that’s free.',
    2: 'I’ve worked enough today – back at midnight. Until then: quizzes, flashcards and trainer keep working, free.',
    3: 'Clocking off. I’m on the golf course. Back at midnight. Until then: flashcards, quizzes and trainer are free.'
  },
  done: {
    1: ['Well done.', 'Strong.'],
    2: ['You’re on a roll.', 'Good performance. Almost like my portfolio.'],
    3: ['That’s consulting-firm level.', 'This is what a future partner looks like.']
  }
};
const T = EN ? ENG : DE;
const pick = a => a[Math.floor(Math.random() * a.length)];
export function say(kind, arg) {
  const s = getSpice();
  const v = T[kind]?.[s] ?? T[kind]?.[2];
  if (typeof v === 'function') return v(arg);
  if (Array.isArray(v)) return pick(v);
  return v;
}
export function lines(kind) { return T[kind]?.[getSpice()] || []; }
