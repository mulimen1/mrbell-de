// Max denkt laut: kleine Gedankenblasen je nach Tageszeit. Sylt-Max, aber mit Herz – nie gemein, nie billig.
import { ls } from './util.js';
import { L } from './i18n.js';

const T = (de, en) => L(de, en);
const MORGEN = () => [
  T('Um zehn bin ich zum Brunchen verabredet. Mach hinne.', 'I’ve got brunch at ten. Chop chop.'),
  T('Ohne Flat White bin ich nur zu 80 % genial. Reicht aber für dich.', 'Without a flat white I’m only 80 % genius. Still enough for you.'),
  T('Mein Personal Trainer wartet. Soll er. Der wird pro Stunde bezahlt.', 'My personal trainer is waiting. Let him. He’s paid by the hour.'),
  T('Kurz überlegt: Porsche oder Defender? Hab mich für deine Bilanz entschieden.', 'Quick thought: Porsche or Defender? I picked your balance sheet.'),
  T('Mein Wecker heißt Friedrich und bringt mir den Espresso ans Bett.', 'My alarm clock is called Friedrich and brings me espresso in bed.'),
  T('Sonnenaufgang über Kampen verpasst. War gedanklich beim Kapitalwert.', 'Missed the sunrise over Kampen. Was mentally at the NPV.'),
  T('Avocado-Toast macht nicht reich. Zinseszins schon.', 'Avocado toast won’t make you rich. Compound interest will.'),
  T('Ich bin kein Morgenmensch. Ich bin ein Erfolgsmensch. Großer Unterschied.', 'I’m not a morning person. I’m a winning person. Big difference.'),
  T('Pilates um elf, Tennis um zwölf, du jetzt. Mein Kalender ist voller als die Mensa.', 'Pilates at eleven, tennis at twelve, you now. My calendar is fuller than the canteen.'),
  T('Zweiter Espresso. Mein Puls rechnet gerade schneller als ich.', 'Second espresso. My pulse is calculating faster than I am.'),
  T('Bevor du fragst: Ja, der Mittelscheitel sitzt um die Uhrzeit schon.', 'Before you ask: yes, the middle part is already perfect at this hour.'),
  T('Ich frühstücke nur Sachen, die man auf Französisch bestellen muss.', 'I only eat breakfast you have to order in French.'),
  T('Mama hat gefragt, ob ich schon wach bin. Ich unterrichte, Mama.', 'Mum asked if I’m up yet. I’m teaching, Mum.'),
  T('Kalt duschen, Aktien checken, dir was beibringen. Morgenroutine eines Siegers.', 'Cold shower, check stocks, teach you something. A winner’s morning routine.'),
  T('Mein Smoothie hat mehr gekostet als dein Lehrbuch. Schmeckt trotzdem nach Rasen.', 'My smoothie cost more than your textbook. Still tastes like lawn.'),
  T('Die Konkurrenz schläft noch. Perfekt. Die soll auch weiterschlafen.', 'The competition is still asleep. Perfect. Let them sleep.'),
  T('Wer so früh lernt, hat Disziplin. Oder schlecht geschlafen. Respekt so oder so.', 'Studying this early means discipline. Or bad sleep. Respect either way.'),
  T('Butler fragt, ob ich Eier will. Ich will, dass du die Klausur rockst.', 'The butler asks if I want eggs. I want you to crush that exam.'),
  T('Morgens Soll, mittags Haben, abends Sylt.', 'Debit in the morning, credit at noon, Sylt at night.'),
  T('Noch kein Insta gecheckt. Für dich mach ich Opfer.', 'Haven’t even checked Insta yet. The sacrifices I make for you.'),
];
const MITTAG = () => [
  T('Um zwei hab ich Golf. Mein Caddie ist jetzt schon nervös.', 'Golf at two. My caddie is already nervous.'),
  T('Mittag im Club oder Mensa? Kleiner Scherz. Ich weiß nicht mal, wo die Mensa ist.', 'Lunch at the club or the canteen? Kidding. I don’t even know where the canteen is.'),
  T('Polo fällt heute aus. Das Pferd hat Burnout.', 'Polo’s cancelled today. The horse has burnout.'),
  T('Hunger auf Trüffelpasta. Und auf Wissen. Hauptsächlich Trüffelpasta.', 'Craving truffle pasta. And knowledge. Mostly truffle pasta.'),
  T('Papa ruft an. Bestimmt wegen der Holding. Ich lass klingeln – du gehst vor.', 'Dad’s calling. Probably about the holding. I’ll let it ring – you come first.'),
  T('Siesta wär jetzt geil. Aber Siesta zahlt keine Rendite.', 'A siesta would be great. But siestas don’t pay returns.'),
  T('Mein Handicap ist 12. Deins ist gerade dieses Kapitel. Wir arbeiten an beidem.', 'My handicap is 12. Yours is this chapter. We’re working on both.'),
  T('Kurz auf die Rolex geschaut. Reicht noch für zwei Aufgaben.', 'Glanced at the Rolex. Time for two more tasks.'),
  T('Überlegt, die Mensa zu kaufen. Dann gäb’s endlich Hummer.', 'Thought about buying the canteen. Finally there’d be lobster.'),
  T('Nachmittagstief? Ich hab kein Tief. Ich hab ein Ferienhaus.', 'Afternoon slump? I don’t have slumps. I have a holiday home.'),
  T('Die Yacht wartet im Hafen. Die Klausur leider nicht.', 'The yacht waits in the harbour. The exam sadly doesn’t.'),
  T('Aperol um fünf ist fest eingeplant. Bis dahin: Bilanz.', 'Aperol at five is locked in. Until then: balance sheet.'),
  T('Lunch war leicht: Carpaccio und ein Steuerspartrick.', 'Light lunch: carpaccio and a tax hack.'),
  T('Sitz übrigens auf der Terrasse in Kampen. Dein WLAN ist trotzdem schneller.', 'I’m on the terrace in Kampen, by the way. Your Wi-Fi is still faster.'),
  T('Excel mag ich lieber als die meisten Menschen. Dich natürlich ausgenommen.', 'I like Excel more than most people. Present company excluded.'),
  T('Gerade Mail bekommen: „Ihr Tesla ist bereit.“ Hab keinen bestellt. Papa?', 'Just got an email: “Your Tesla is ready.” I didn’t order one. Dad?'),
  T('Mein Barista kennt meinen Namen. Und meine Kreditkarte. Auswendig.', 'My barista knows my name. And my credit card. By heart.'),
  T('Sonnenbrille auf. Nicht wegen der Sonne. Wegen meiner Brillanz.', 'Sunglasses on. Not for the sun. For my brilliance.'),
  T('Wer mittags lernt, während alle Mittagsschlaf machen, gewinnt. Einfach Mathe.', 'Studying while everyone naps is how you win. Simple maths.'),
  T('Tennislehrer hat abgesagt. Endlich Zeit für das Wichtige: dich.', 'Tennis coach cancelled. Finally time for what matters: you.'),
];
const ABEND = () => [
  T('Eigentlich würd ich jetzt lieber schlafen. Aber Genies schlafen nicht, die laden.', 'Honestly, I’d rather be asleep. But geniuses don’t sleep, they recharge.'),
  T('Um acht hab ich einen Tisch in der Sansibar. Bis dahin sind wir durch, ja?', 'I’ve got a table at Sansibar at eight. We’ll be done by then, right?'),
  T('Netflix hat angerufen. Hab gesagt, wir sind beschäftigt.', 'Netflix called. I said we’re busy.'),
  T('Mama fragt, ob ich zum Essen komme. Nach der Abschreibung, Mama.', 'Mum asks if I’m coming for dinner. After depreciation, Mum.'),
  T('Die anderen sind auf Party. Wir feiern mit Abschreibungen.', 'Everyone else is partying. We party with depreciation.'),
  T('Kamin knistert, Whisky ist zwölf Jahre alt, du lernst. Perfekter Abend.', 'Fire’s crackling, whisky’s twelve years old, you’re studying. Perfect evening.'),
  T('Sonnenuntergang am Roten Kliff? Ich guck lieber auf deine Lernkurve.', 'Sunset at the Red Cliff? I’d rather watch your learning curve.'),
  T('Gähn. Sorry. Liegt nicht an dir. Liegt an der Kostenrechnung.', 'Yawn. Sorry. It’s not you. It’s cost accounting.'),
  T('Nachtschicht. Ich hätte gern einen Zuschlag. In Aktien.', 'Night shift. I’d like a bonus. In shares.'),
  T('Mein Butler hat Feierabend. Ich musste mir die Decke selbst holen. Krass, oder?', 'My butler is off. I had to get my own blanket. Wild, right?'),
  T('Dinner mit Investoren abgesagt. Du bist der bessere Deal.', 'Cancelled dinner with investors. You’re the better deal.'),
  T('Ich zähl keine Schafe. Ich zähl Dividenden.', 'I don’t count sheep. I count dividends.'),
  T('Heute 18 Löcher gelaufen. Meine Beine sind so müde wie deine Formelsammlung.', 'Walked 18 holes today. My legs are as tired as your formula sheet.'),
  T('Champagner steht kalt. Für nach der Klausur. Den guten.', 'Champagne’s on ice. For after the exam. The good stuff.'),
  T('Wollte noch mit dem Boot raus. Dein Skript braucht mich mehr.', 'Wanted to take the boat out. Your slides need me more.'),
  T('Nachts sind alle Bilanzen grau. Deshalb machen wir Licht an.', 'At night all balance sheets look grey. That’s why we turn the lights on.'),
  T('„Eine Runde noch“, hat Papa auch gesagt. Danach hatte er die dritte Villa.', '“One more round,” Dad said too. Afterwards he owned a third villa.'),
  T('Wenn du gleich schlafen gehst, sortiert dein Kopf das alles. Wissenschaft. Und ich.', 'When you go to sleep later, your brain files all this. Science. And me.'),
  T('Pyjama ist Seide, Laune ist gut, Kapitalwert ist positiv. Weiter.', 'Pyjamas: silk. Mood: good. NPV: positive. Carry on.'),
  T('Die Party in Kampen läuft ohne mich. Die werden das überleben. Gerade so.', 'The party in Kampen is going on without me. They’ll survive. Barely.'),
];

// Ein frischer Gedanke passend zur Tageszeit (die letzten 12 kommen nicht gleich wieder)
export function thoughtFor(d = new Date()) {
  const hr = d.getHours();
  const pool = (hr >= 5 && hr < 11 ? MORGEN : hr >= 11 && hr < 17 ? MITTAG : ABEND)();
  const seen = ls.get('tutor.thoughts', []) || [];
  const fresh = pool.filter(x => !seen.includes(x));
  const x = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length || pool.length))];
  ls.set('tutor.thoughts', [x, ...seen].slice(0, 12));
  return x;
}
