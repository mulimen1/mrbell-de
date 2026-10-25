// Show-Modus (nur Gründer-Konto): Max zeigt groß und animiert, was BWL Max mit einem Skript macht – zum Filmen.
// Start im Tutor-Eingabefeld: „/show“ (schwarz/Navy), „/show neon“, „/show hell“ oder „/show kosten“ (Mikro → Übersicht Kostenrechnung, auch mit neon/hell). Steuerung: Enter/Leertaste/→ weiter, ← zurück,
// R Szene neu, T hell/dunkel, M Ton aus, Esc beenden. Getippter Text erscheint groß als deine Frage, Enter geht weiter.
// Inhalte stammen aus dem Skript „Banking and FinTech – Chapter 1: Conceptual foundations“ (HSB). Zahlen nur aus dem Skript.
import { face } from './face.js';
import { ask } from './api.js';
import { getVoice } from './voice.js';
import { getMic, releaseMic } from './mic.js';

const S = [
  { id: 'intro', say: 'Banking und FinTech, Kapitel eins? Gib her. Ich hab es gelesen, bevor du Hallo sagen konntest.' },
  { id: 'scan', say: 'Einundzwanzig Folien. Zehn Begriffe, die in der Klausur kommen. Der Rest ist Deko.' },
  { id: 'tafel', say: 'Warum gibt es Banken überhaupt? Ohne Bank: fünf mal fünf, also fünfundzwanzig Verträge. Mit Bank: fünf plus fünf, also zehn. Das ist der ganze Trick.' },
  { id: 'zahlen', say: 'Achtundfünfzig Prozent. Von jedem Euro, den eine deutsche Bank verdient, gehen achtundfünfzig Cent für Kosten drauf. Und die Filialen? Werden jedes Jahr weniger.' },
  { id: 'mindmap', say: 'Die Transformationsfunktion. Liquidität, Information, Risiko. Wenn du diesen Baum kannst, hast du das halbe Kapitel.' },
  { id: 'karten', say: 'Karteikarten. Vorne die Frage, hinten die Antwort. Genau so, wie sie in der Klausur gefragt wird.' },
  { id: 'quiz', say: 'Jetzt du. Drei Fragen. Die dritte ist eine Falle. Natürlich.' },
  { id: 'mitschrift', say: 'Deine Mitschrift sieht aus wie ein Tatort? Ich mach daraus was, das man lesen kann.' },
  { id: 'podcast', say: 'Und für die Bahn: sechs Minuten Podcast. Lernen, ohne auf den Bildschirm zu schauen.' },
  { id: 'sprechen', say: 'Kein Bock zu tippen? Dann red einfach mit mir. Ich hör zu. Meistens.' },
  { id: 'outro', say: 'Kapitel eins sitzt. Kapitel zwei morgen. Gleiche Uhrzeit.' }
];
const TABS = ['Tutor', 'Lernen', 'Mitschrift', 'Fächer', 'Transkript'];
const TAB_OF = { mindmap: 'Lernen', karten: 'Lernen', quiz: 'Lernen', podcast: 'Lernen', mitschrift: 'Mitschrift' };
const TERMS = ['KWG', 'BaFin', 'Kreditinstitut', 'Finanzdienstleistungsinstitut', 'Bankgeschäfte', 'Transformationsfunktion', 'Asymmetrische Information', 'Transaktionskosten', 'Delegated Monitoring', 'Diamond 1984', 'Diversifikation', 'FinTech'];
const SLIDES = ['Banking and FinTech', 'Structure', 'Key Figures', 'Structure', 'Credit institution (KWG)', 'Banking transactions', 'Financial services institution', 'Financial services §1 1b', 'Scientific concept', 'Assortment-oriented', 'Function-oriented', 'Terminological summary', 'Existence of banks', 'Neoclassical approaches', 'Diamond model', 'Delegated monitoring', 'Diversification', 'Financial services market', 'Structural change', 'Challenges today', 'Preview: FinTech'];
const CARDS = [
  ['Was ist ein Kreditinstitut nach § 1 Abs. 1 KWG?', 'Ein Unternehmen, das Bankgeschäfte gewerbsmäßig betreibt. Im Zweifel entscheidet die BaFin.'],
  ['Was ist ein Finanzdienstleistungsinstitut?', 'Kein Kreditinstitut, erbringt aber gewerbsmäßig Finanzdienstleistungen für andere (§ 1 Abs. 1a KWG).'],
  ['Delegated Monitoring (Diamond, 1984)?', 'Die Bank überwacht die Kreditnehmer stellvertretend für viele kleine Anleger. Diversifikation senkt ihr eigenes Ausfallrisiko.'],
  ['Asymmetrische Information?', 'Eine Seite einer Transaktion weiß mehr als die andere – ein Grund, warum es Banken gibt.']
];
const QUIZ = [
  ['Wer entscheidet im Zweifel, ob ein Bankgeschäft vorliegt?', ['BaFin', 'EZB', 'Bundesbank'], 0, 'Steht so in § 1 Abs. 1 KWG.'],
  ['10 Kapitalnehmer, 10 Kapitalgeber – wie viele Verträge mit einer Bank dazwischen?', ['100', '20', '10'], 1, 'Mit Intermediär n + m = 10 + 10 = 20 statt n × m = 100.'],
  ['Factoring ist laut KWG …', ['ein Bankgeschäft (§ 1 Abs. 1)', 'eine Finanzdienstleistung (§ 1 Abs. 1a)', 'gar nicht geregelt'], 1, 'Die Falle: Factoring klingt nach Kredit, steht aber bei den Finanzdienstleistungen.']
];

// „/show kosten“: Du drückst aufs Mikro, Max wird groß und hört zu, disst dich kurz und baut live eine Übersicht zur Kostenrechnung.
// Läuft nach dem Mikro von allein durch (auto); Enter/→ springt weiter, Esc beendet.
const KR = [
  { id: 'kstart', say: '' },
  { id: 'kroast', say: 'Kostenrechnung. An einem Sonntag. Freiwillig. Respekt. Kein Stress, ich erklär es dir an der Tafel. Schau zu und versuch mitzukommen.', auto: true, keepYou: true },
  { id: 'kmap', say: 'Kostenrechnung stellt genau drei Fragen. Kostenarten: Welche Kosten hab ich? Kostenstellen: Wo sind sie entstanden? Kostenträger: Wofür, also für welches Produkt? Drei Fragen. Selbst du schaffst das.', auto: true },
  { id: 'kfluss', say: 'Einzelkosten wie Material gehen direkt aufs Produkt. Gemeinkosten wie Miete und Strom laufen erst über die Kostenstellen und kommen per Zuschlag drauf. Schreib dir das auf. Nein, ernsthaft.', auto: true },
  { id: 'kende', say: 'Die Tafel kriegst du als PDF, gratis. Kostenrechnung in einer Minute. Dein Prof braucht dafür ein Semester.' }
];
const CSS = `
.sh{position:fixed;inset:0;z-index:2147483000;overflow:hidden;font-family:var(--sans,system-ui);cursor:default;
 --g:#2f5584;--g2:#9db7da;--bg:#000;--ink:#f4f7ff;--mute:#8a93a8;--card:rgba(255,255,255,.05);--line:rgba(140,170,255,.22);--ok:#2fd27a;--no:#ff4d5e;
 background:radial-gradient(1200px 700px at 70% 30%,rgba(31,58,95,.30),transparent 62%),radial-gradient(900px 600px at 15% 85%,rgba(31,58,95,.18),transparent 60%),#000;color:var(--ink)}
.sh.light{--g:#1f3a5f;--g2:#3d6299;--bg:#ffffff;--ink:#0b1220;--mute:#5d6678;--card:rgba(31,58,95,.05);--line:rgba(31,58,95,.18);
 background:radial-gradient(1200px 700px at 70% 30%,rgba(31,58,95,.10),transparent 60%),radial-gradient(900px 600px at 15% 85%,rgba(61,98,153,.08),transparent 60%),#fff}
.sh.mouse{cursor:default}
.sh.neon{--g:#4f8dff;--g2:#7cc4ff;--bg:#030509;background:radial-gradient(1200px 700px at 70% 30%,rgba(79,141,255,.16),transparent 60%),radial-gradient(900px 600px at 15% 85%,rgba(124,196,255,.10),transparent 60%),#030509}
.sh.neon .grid{opacity:.18}
.sh.neon .max{filter:drop-shadow(0 0 40px rgba(79,141,255,.35))}
.sh.neon .tag i{background:var(--g);box-shadow:0 0 16px var(--g)}
.sh.neon .chip{background:rgba(79,141,255,.14);box-shadow:0 0 24px -6px var(--g)}
.sh.neon .scanl{box-shadow:0 0 30px 8px var(--g2)}
.sh.neon .sl{background:linear-gradient(135deg,rgba(79,141,255,.25),rgba(124,196,255,.06))}
.sh.neon .cover,.sh.neon .fc .ba{background:linear-gradient(135deg,var(--g),var(--g2));box-shadow:0 0 60px -10px var(--g)}
.sh.neon .mic .core{box-shadow:0 0 80px var(--g)}
.sh.neon .qz .o.ok{box-shadow:0 0 40px -10px var(--ok)}
.sh.neon .you{box-shadow:0 20px 60px -20px var(--g)}
.sh .grid{position:absolute;inset:-50%;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:64px 64px;opacity:.08;transform:perspective(900px) rotateX(58deg) translateY(10%);animation:shg 22s linear infinite;mask-image:radial-gradient(closest-side,#000,transparent)}
@keyframes shg{to{background-position:0 640px}}
.sh .max{position:absolute;left:3vw;bottom:calc(118px + 7vh);width:26vh;height:26vh;transition:all .9s cubic-bezier(.16,1,.3,1);filter:drop-shadow(0 20px 50px rgba(0,0,0,.6))}
.sh.light .max{filter:drop-shadow(0 20px 40px rgba(31,58,95,.25))}
.sh .max.big{left:50%;bottom:50%;width:56vh;height:56vh;transform:translate(-50%,50%)}
.sh .max.in{animation:shin 1.2s cubic-bezier(.2,1.4,.4,1) both}
@keyframes shin{from{transform:translate(-50%,160%) scale(.4) rotate(-14deg);opacity:0}}
.sh .ring{position:absolute;inset:-12%;border-radius:50%;border:2px solid var(--g);opacity:0;}
.sh .max.talk .ring{animation:shring 1.4s ease-out infinite}
.sh .max.talk .ring.r2{animation-delay:.7s}
@keyframes shring{0%{transform:scale(.85);opacity:.7}100%{transform:scale(1.35);opacity:0}}
.sh .sub{position:absolute;left:50%;bottom:calc(118px + 1.5vh);transform:translateX(-50%);width:min(1300px,88vw);text-align:center;font-weight:750;font-size:clamp(22px,2.6vw,46px);line-height:1.2;letter-spacing:-.02em;text-shadow:0 4px 30px rgba(0,0,0,.6)}
.sh.light .sub{text-shadow:none}
.sh .sub.shside{left:calc(3vw + 29vh);right:4vw;width:auto;transform:none;text-align:left;font-size:clamp(20px,2.2vw,40px)}
.sh .mf>*:not(svg){display:none!important}
.sh .net svg{max-height:22vh}
.sh .board .h1{font-size:clamp(30px,3.4vw,64px);margin-bottom:2vh}
.sh .board{padding:3vh 2.4vw}
.sh .board .eq{margin-top:1.6vh;font-size:clamp(26px,3vw,56px)}
.sh .sub span{opacity:.28;transition:opacity .15s,color .15s}.sh .sub span.on{opacity:1}.sh .sub span.hot{color:var(--g2)}
.sh.light .sub span.hot{color:var(--g)}
.sh .stage{position:absolute;left:calc(3vw + 29vh);right:3vw;top:calc(76px + 2vh);bottom:calc(118px + 15vh);display:grid;place-items:center}
.sh .stage.full{left:3vw}
.sh .max.big{bottom:calc(50% + 30px)}
.sh .h1{font-weight:800;font-size:clamp(34px,4.4vw,84px);letter-spacing:-.04em;line-height:1;margin:0 0 3vh}
.sh .h1 em{font-style:normal;color:var(--g2)}.sh.light .h1 em{color:var(--g)}
.sh .tag{display:inline-flex;align-items:center;gap:10px;font:600 15px var(--mono,monospace);letter-spacing:.12em;text-transform:uppercase;color:var(--mute);margin-bottom:2vh}
.sh .tag i{width:10px;height:10px;border-radius:50%;background:var(--g2)}
.sh .pop{animation:shpop .7s cubic-bezier(.2,1.4,.4,1) both}
@keyframes shpop{from{opacity:0;transform:translateY(24px) scale(.85)}}
.sh .fade{animation:shfade .8s ease both}@keyframes shfade{from{opacity:0}}
.sh .glass{background:var(--card);border:1px solid var(--line);border-radius:26px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 30px 80px -30px rgba(0,0,0,.6)}
.sh.light .glass{background:#fff;box-shadow:0 30px 80px -30px rgba(31,58,95,.35)}
/* Scan */
.sh .slides{display:grid;grid-template-columns:repeat(7,1fr);gap:14px;width:min(1200px,100%);position:relative}
.sh .sl{aspect-ratio:4/3;border-radius:12px;padding:10px;font:650 12px/1.25 var(--sans);color:var(--ink);background:linear-gradient(135deg,rgba(31,58,95,.55),rgba(31,58,95,.12));border:1px solid var(--line);display:flex;align-items:flex-end}
.sh.light .sl{background:linear-gradient(135deg,rgba(31,58,95,.12),#fff)}
.sh .scanl{position:absolute;left:-2%;right:-2%;height:4px;top:0;background:linear-gradient(90deg,transparent,var(--g2),transparent);box-shadow:0 0 14px 2px rgba(157,183,218,.35);animation:shscan 2.2s ease-in-out .9s 2 alternate both}
@keyframes shscan{from{top:0}to{top:100%}}
.sh .chips{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:4vh;max-width:1200px}
.sh .chip{padding:12px 20px;border-radius:999px;font-weight:750;font-size:clamp(15px,1.25vw,22px);border:1.5px solid var(--g);background:rgba(31,58,95,.35)}
.sh.light .chip{background:rgba(31,58,95,.06);box-shadow:none}
/* Tafel */
.sh .board{width:min(1250px,100%);padding:4vh 3vw;position:relative}
.sh .net{display:grid;grid-template-columns:1fr 1fr;gap:4vw}
.sh .net svg{width:100%;height:auto;overflow:visible}
.sh .net h3{margin:0 0 1vh;font-size:clamp(18px,1.6vw,28px);font-weight:750}
.sh .net small{color:var(--mute);font:600 15px var(--mono,monospace)}
.sh .eq{margin-top:3vh;text-align:center;font-weight:800;font-size:clamp(30px,3.6vw,68px);letter-spacing:-.03em}
.sh .eq b{color:var(--g2)}.sh.light .eq b{color:var(--g)}
.sh .draw{stroke-dasharray:var(--L);stroke-dashoffset:var(--L);animation:shdraw 1.1s ease forwards}
@keyframes shdraw{to{stroke-dashoffset:0}}
/* Zahlen */
.sh .kpis{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:2vw;width:min(1300px,100%)}
.sh .kpi{padding:3.5vh 2vw}
.sh .kpi .v{font-weight:800;font-size:clamp(48px,6vw,118px);letter-spacing:-.05em;line-height:1}
.sh .kpi .l{color:var(--mute);font-weight:650;font-size:clamp(14px,1.15vw,20px);margin-top:1.2vh}
.sh .kpi .s{font:600 12px var(--mono,monospace);color:var(--mute);margin-top:1.5vh;opacity:.8}
.sh .gauge{width:100%;max-width:300px;display:block;margin:0 auto 1vh}
.sh .bars{display:flex;align-items:flex-end;gap:10px;height:16vh;margin-top:2vh}
.sh .bars i{flex:1;border-radius:8px 8px 3px 3px;background:linear-gradient(180deg,var(--g2),var(--g));transform-origin:bottom;animation:shbar 1s cubic-bezier(.16,1,.3,1) both}
@keyframes shbar{from{transform:scaleY(0)}}
/* Mindmap */
.sh .mm{width:min(1300px,100%);height:100%}
.sh .mm text{font-family:var(--sans);font-weight:750;fill:var(--ink)}
.sh .mm .nd{animation:shpop .7s cubic-bezier(.2,1.4,.4,1) both}
/* Karten */
.sh .cards{display:grid;grid-template-columns:repeat(2,1fr);gap:2vw;width:min(1200px,100%)}
.sh .fc{perspective:1400px;height:24vh}
.sh .fc .in{position:relative;width:100%;height:100%;transition:transform .9s cubic-bezier(.2,1,.3,1);transform-style:preserve-3d}
.sh .fc.flip .in{transform:rotateY(180deg)}
.sh .fc .fa{background:#0d1424;border:1px solid var(--line)}.sh.light .fc .fa{background:#fff;box-shadow:0 20px 50px -25px rgba(31,58,95,.4)}
.sh .fc .fa,.sh .fc .ba{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:grid;place-items:center;text-align:center;padding:2vw;font-weight:750;font-size:clamp(17px,1.5vw,28px);line-height:1.3;border-radius:24px}
.sh .fc .ba{transform:rotateY(180deg);background:var(--g);color:#fff;font-weight:650}
/* Quiz */
.sh .qz{width:min(1150px,100%);padding:4vh 3vw}
.sh .qz .q{font-weight:800;font-size:clamp(24px,2.6vw,48px);letter-spacing:-.02em;line-height:1.15;margin-bottom:3vh}
.sh .qz .o{display:flex;align-items:center;gap:18px;padding:2vh 1.6vw;margin-top:1.4vh;border-radius:18px;border:1.5px solid var(--line);font-weight:700;font-size:clamp(18px,1.7vw,32px);transition:all .35s}
.sh .qz .o b{display:grid;place-items:center;width:2.2em;height:2.2em;border-radius:12px;background:var(--card);border:1px solid var(--line);font-size:.8em}
.sh .qz .o.ok{border-color:var(--ok);background:rgba(47,210,122,.14)}
.sh .qz .o.no{border-color:var(--no);background:rgba(255,77,94,.14);animation:shshake .4s}
@keyframes shshake{25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}
.sh .qz .why{margin-top:2.4vh;color:var(--mute);font-weight:600;font-size:clamp(15px,1.3vw,24px)}
.sh .timer{position:absolute;right:3vw;top:3vh;width:9vh;height:9vh}
.sh .conf{position:absolute;width:12px;height:18px;top:-20px;border-radius:3px;animation:shconf 2.4s linear forwards}
@keyframes shconf{to{transform:translate(var(--dx),110vh) rotate(720deg)}}
.sh .qn{position:absolute;left:3vw;top:3vh;font:700 16px var(--mono,monospace);color:var(--mute);letter-spacing:.1em}
/* Mitschrift */
.sh .ms{display:grid;grid-template-columns:1fr 1fr;gap:3vw;width:min(1350px,100%);align-items:stretch}
.sh .paper{padding:4vh 2.4vw;border-radius:20px;background:#fdfcf7;color:#1b2435;font-family:'BM Fueller','Caveat',cursive;font-size:clamp(22px,2vw,38px);line-height:1.35;transform:rotate(-1.5deg);box-shadow:0 30px 70px -30px rgba(0,0,0,.7);position:relative}
.sh .paper s{opacity:.6}.sh .paper .ar{color:#c0392b}
.sh .clean{padding:4vh 2.4vw}
.sh .clean h4{margin:0 0 1.4vh;font-size:clamp(20px,1.8vw,32px);font-weight:800;color:var(--g2)}.sh.light .clean h4{color:var(--g)}
.sh .clean li{margin:1vh 0;font-weight:600;font-size:clamp(16px,1.35vw,25px)}
.sh .tw{opacity:0;transform:translateX(-14px);animation:shtw .7s ease forwards}
@keyframes shtw{to{opacity:1;transform:none}}
.sh .arrow{font-size:6vh;color:var(--g2);align-self:center}
/* Podcast */
.sh .pod{width:min(1150px,100%);padding:5vh 3vw;display:grid;gap:3vh}
.sh .pod .top{display:flex;align-items:center;gap:2vw}
.sh .cover{width:16vh;height:16vh;border-radius:22px;background:var(--g);display:grid;place-items:center;color:#fff;font-weight:800;font-size:3vh;text-align:center;line-height:1.05;box-shadow:0 20px 50px -20px rgba(0,0,0,.6)}
.sh .wave{display:flex;align-items:center;gap:5px;height:16vh}
.sh .wave i{flex:1;border-radius:99px;background:linear-gradient(180deg,var(--g2),var(--g));height:20%;animation:shwave 1s ease-in-out infinite alternate}
@keyframes shwave{to{height:var(--h)}}
.sh .prog{height:8px;border-radius:99px;background:var(--line);overflow:hidden}.sh .prog i{display:block;height:100%;width:0;background:var(--g2);animation:shprog 14s linear forwards}
@keyframes shprog{to{width:38%}}
/* Sprechen */
.sh .mic{position:relative;width:34vh;height:34vh;display:grid;place-items:center}
.sh .mic .c{position:absolute;inset:0;border-radius:50%;border:3px solid var(--g);animation:shring 1.8s ease-out infinite}
.sh .mic .c:nth-child(2){animation-delay:.6s}.sh .mic .c:nth-child(3){animation-delay:1.2s}
.sh .mic .core{width:13vh;height:13vh;border-radius:50%;background:linear-gradient(135deg,var(--g),var(--g2));display:grid;place-items:center;box-shadow:0 20px 60px -15px rgba(0,0,0,.7)}
.sh .mic svg{width:6vh;height:6vh;color:#fff}
/* Outro */
.sh .max .lv{position:absolute;inset:-8%;border-radius:50%;background:radial-gradient(circle,rgba(79,141,255,.45),rgba(79,141,255,.12) 45%,transparent 68%);opacity:0;transform:scale(calc(1 + var(--lv,0) * .7));transition:opacity .4s,transform .08s linear;pointer-events:none}
.sh.listen .max .lv{opacity:1}
.sh.listen .max .ring{animation:shring 1.4s ease-out infinite}.sh.listen .max .ring.r2{animation-delay:.7s}
.sh .typer .mk{cursor:pointer;transition:background .3s,transform .2s}.sh .typer .mk.rec{background:#e5484d;animation:shrec 1.2s ease-in-out infinite}
@keyframes shrec{50%{box-shadow:0 0 0 10px rgba(229,72,77,.18)}}
.sh .fly{animation:shfly 1.05s cubic-bezier(.18,1.25,.35,1) both}
@keyframes shfly{0%{opacity:0;transform:translate(var(--fx),var(--fy)) scale(.15) rotate(var(--fr));filter:blur(8px)}55%{opacity:1;filter:blur(0)}75%{transform:translate(0,0) scale(1.1) rotate(0)}100%{transform:none}}
.sh .burst{fill:none;stroke:var(--g2);stroke-width:3;opacity:0;animation:shburst .9s ease-out forwards}
@keyframes shburst{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(2.4)}}
.sh .mm .cap{font-weight:650;fill:var(--mute)}
.sh .mm .pulse{fill:var(--g2);filter:drop-shadow(0 0 6px var(--g2))}
.sh.light .mm .pulse{fill:var(--g)}
.sh .kf{width:min(1300px,100%);height:100%}
.sh .kf text{font-family:var(--sans);font-weight:750;fill:var(--ink)}
.sh .kf .hd{font-size:26px;font-weight:800}
.sh .kf .sm{font-size:16px;font-weight:650;fill:var(--mute)}
.sh .kf .chip rect{fill:var(--card);stroke:var(--g2);stroke-width:2}
.sh .kf .tok rect{fill:var(--g);stroke:var(--g2);stroke-width:2}.sh .kf .tok text{fill:#fff;font-size:17px}
.sh .kf .tok.z rect{fill:#2fd27a;stroke:#2fd27a}.sh .kf .tok.z text{fill:#04130a}
.sh .kf .cell{fill:var(--card);stroke:var(--line);stroke-width:1.5}
.sh .kf .cell.on{fill:var(--g);transition:fill .5s}
.sh{--tfbg:rgba(255,255,255,.025);--dot:rgba(255,255,255,.09)}.sh.light{--tfbg:#fff;--dot:rgba(31,58,95,.16)}
.sh .tf{width:100%;height:100%;display:grid;grid-template-rows:auto 1fr;border:1px solid var(--line);border-radius:26px;overflow:hidden;background:var(--tfbg);box-shadow:0 30px 80px -40px rgba(0,0,0,.45)}
.sh .tf .tbb{display:flex;align-items:center;gap:12px;padding:12px 16px 12px 20px;border-bottom:1px solid var(--line);font-weight:750;font-size:17px}
.sh .tf .tbb .ic{width:30px;height:30px;border-radius:9px;background:var(--g);display:grid;place-items:center}.sh .tf .tbb .ic svg{width:17px;height:17px;color:#fff}
.sh .tf .tbb .tt{flex:1;min-width:0}.sh .tf .tbb .cnt{font:600 13px var(--mono,monospace);color:var(--mute)}
.sh .tf .tbb .dl{width:42px;height:42px;border-radius:12px;border:1px solid var(--line);display:grid;place-items:center;color:var(--ink);transition:background .3s,color .3s}.sh .tf .tbb .dl svg{width:19px;height:19px}
.sh .tf .tbb .dl.hit{background:var(--g);color:#fff}
.sh .tf .ta{min-height:0;display:grid;place-items:center;padding:1.2vh 1.2vw;background-image:radial-gradient(var(--dot) 1.2px,transparent 1.5px);background-size:24px 24px}
.sh .pdfc{position:absolute;right:3vw;top:100px;z-index:5;display:flex;align-items:center;gap:14px;padding:14px 18px 14px 14px;border-radius:20px;cursor:pointer}
.sh .pdfc .pi{width:46px;height:54px;border-radius:10px;background:#e5484d;color:#fff;font:800 13px var(--sans);display:grid;place-items:center}
.sh .pdfc b{display:block;font-size:16px}.sh .pdfc small{color:var(--mute);font-weight:650;font-size:13.5px}
.sh .pdfc .ok{width:28px;height:28px;border-radius:50%;background:#2fd27a;color:#04130a;display:grid;place-items:center;font-weight:900}
.sh .out{text-align:center}
.sh .out .h1{font-size:clamp(50px,7vw,140px)}
.sh .url{font:700 clamp(16px,1.4vw,24px) var(--mono,monospace);color:var(--mute);letter-spacing:.08em}
/* Du-Eingabe */
.sh .you{position:absolute;right:3vw;top:96px;z-index:4;max-width:min(760px,60vw);padding:2vh 1.6vw;border-radius:22px 22px 6px 22px;font-weight:700;font-size:clamp(20px,2vw,36px);background:linear-gradient(135deg,var(--g),var(--g2));color:#fff;box-shadow:0 20px 60px -20px rgba(0,0,0,.6);animation:shpop .5s cubic-bezier(.2,1.4,.4,1) both}
.sh .tbar{position:absolute;left:0;right:0;top:0;height:76px;display:flex;align-items:center;gap:10px;padding:0 3vw;border-bottom:1px solid var(--line);background:rgba(0,0,0,.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);z-index:3}
.sh.light .tbar{background:rgba(255,255,255,.75)}
.sh .tbar .br{display:flex;align-items:center;gap:10px;font-weight:800;font-size:20px;margin-right:18px}
.sh .tbar .br .bf{width:38px;height:38px}
.sh .tbar .br small{font:700 9.5px var(--mono,monospace);letter-spacing:.1em;padding:2px 6px;border:1px solid var(--line);border-radius:6px;color:var(--mute)}
.sh .tbar .tb{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:999px;font-weight:700;font-size:16px;color:var(--mute);transition:all .35s}
.sh .tbar .tb.on{background:var(--g);color:#fff}
.sh .tbar .sp{flex:1}
.sh .tbar .doc{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px;border-radius:12px;border:1px solid var(--line);font:600 13px var(--sans);color:var(--ink)}
.sh .tbar .doc i{width:8px;height:8px;border-radius:50%;background:var(--ok)}
.sh .typer{position:absolute;left:50%;transform:translateX(-50%);bottom:24px;width:min(1180px,86vw);height:86px;display:flex;align-items:center;gap:14px;padding:0 12px 0 16px;border-radius:28px;font-size:clamp(18px,1.5vw,26px);font-weight:600;z-index:3}
.sh .typer .att{display:inline-flex;align-items:center;gap:8px;height:52px;padding:0 16px;border-radius:16px;border:1.5px dashed var(--line);font-size:15px;font-weight:700;color:var(--ink);white-space:nowrap}
.sh .typer .ph{color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh .typer .tx{white-space:nowrap;overflow:hidden}
.sh .typer .fl{flex:1;min-width:0;display:flex;align-items:center}
.sh .typer .mk{display:inline-flex;align-items:center;gap:10px;height:58px;padding:0 24px;border-radius:999px;background:var(--g);color:#fff;font-weight:750;font-size:17px;white-space:nowrap}
.sh .typer .mk svg{width:20px;height:20px}
.sh .typer .snd{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:var(--g);color:#fff;transition:transform .2s}
.sh .typer .snd.go{animation:shsend .5s ease}
@keyframes shsend{40%{transform:scale(.85)}70%{transform:scale(1.12)}}
.sh .typer .snd svg{width:24px;height:24px}
.sh .typer .cur{width:3px;height:1.2em;background:var(--ink);margin-left:2px;animation:shblink 1s steps(1) infinite;flex:none}
@keyframes shblink{50%{opacity:0}}
.sh .mcur{position:absolute;left:0;top:0;z-index:6;pointer-events:none;opacity:0;transition:transform .95s cubic-bezier(.65,0,.25,1),opacity .4s;will-change:transform}
.sh .mcur.on{opacity:1}
.sh .mcur svg{width:42px;height:42px;display:block;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))}
.sh .mcur b{position:absolute;left:30px;top:38px;padding:6px 14px;border-radius:10px 10px 10px 3px;background:var(--g);color:#fff;font:800 17px var(--sans);white-space:nowrap;box-shadow:0 8px 20px -8px rgba(0,0,0,.5)}
.sh.neon .mcur b{box-shadow:0 0 22px -4px var(--g)}
.sh .mcur .rp{position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;border:3px solid var(--g2);opacity:0}
.sh .mcur.click .rp{animation:shrip .55s ease-out}
.sh .mcur.click svg{transform:scale(.86);transition:transform .12s}
@keyframes shrip{from{opacity:.9;transform:scale(.4)}to{opacity:0;transform:scale(2.4)}}
.sh .hl{outline:3px solid var(--g2);outline-offset:6px;border-radius:14px;transition:outline-color .3s}
.sh .hint{position:absolute;right:16px;bottom:4px;font:600 11px var(--mono,monospace);color:var(--mute);opacity:0;transition:opacity .3s}
.sh.mouse .hint{opacity:.7}
`;

const IC_MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const wait = ms => new Promise(r => setTimeout(r, ms));

let root = null;
export function isShowCmd(t) { return /^\/show\b/i.test(String(t || '').trim()); }

export function startShow(arg) {
  if (root) return;
  const a = String(arg || ''), kosten = /kosten/i.test(a), light = /hell|light|weiß|weiss|white/i.test(a) || (kosten && !/dunkel|dark|schwarz|neon/i.test(a)), neon = /neon/i.test(a), L = kosten ? KR : S;   // „/show kosten“ startet weiß
  const host = el('div'); host.style.cssText = 'position:fixed;inset:0;z-index:2147483000';
  const sr = host.attachShadow({ mode: 'open' });
  const faceCss = [...document.querySelectorAll('style')].map(x => x.textContent).find(t => t.includes('.fz-mouth')) || '';
  const st0 = el('style'); st0.textContent = CSS + '\n' + faceCss; sr.appendChild(st0);
  root = el('div', 'sh' + (light ? ' light' : '') + (neon && !light ? ' neon' : ''));
  root.innerHTML = '<div class="grid"></div><div class="stage"></div><div class="max big"><div class="lv"></div><div class="ring"></div><div class="ring r2"></div><div class="mf" style="width:100%;height:100%"></div></div><div class="tbar"><span class="br"><span class="bf"></span>BWL Max <small>BETA</small></span>' + TABS.map(t => '<span class="tb" data-t="' + t + '">' + t + '</span>').join('') + '<span class="sp"></span><span class="doc"><i></i>Chapter_1_Conceptual_Foundations.pdf · 21 Folien</span></div><div class="sub"></div><div class="typer glass"><span class="att">+ Dokument</span><span class="fl"><span class="ph">Frag Max zu Kapitel 1 – z. B. „Erklär mir Delegated Monitoring“</span><span class="tx"></span><span class="cur"></span></span><span class="mk">' + IC_MIC + 'Sprich mit Max</span><span class="snd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div><div class="mcur"><span class="rp"></span><svg viewBox="0 0 24 24"><path d="M4 2.5l15 9.2-6.6 1.3 3.9 7.2-2.9 1.5-3.9-7.3L4.6 19z" fill="#fff" stroke="#0b1220" stroke-width="1.4" stroke-linejoin="round"/></svg><b>Max</b></div><div class="hint">Enter / Leertaste weiter · ← zurück · R neu · T hell/dunkel · N Neon · M Ton · Esc Ende</div>';
  sr.appendChild(root); document.body.appendChild(host);
  const stage = root.querySelector('.stage'), maxEl = root.querySelector('.max'), sub = root.querySelector('.sub'), typer = root.querySelector('.typer'), typTx = typer.querySelector('.tx');
  const fc = face(root.querySelector('.mf'), { follow: true }); face(root.querySelector('.bf'), { follow: true });
  const ph = typer.querySelector('.ph'), snd = typer.querySelector('.snd'), mk = typer.querySelector('.mk');
  if (kosten) { const d = root.querySelector('.doc'); if (d) d.remove(); ph.textContent = 'Frag Max irgendwas aus BWL – oder drück aufs Mikro'; }
  const tab = id => root.querySelectorAll('.tb').forEach(b => b.classList.toggle('on', b.dataset.t === (TAB_OF[id] || 'Tutor')));
  try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}

  let idx = -1, typed = '', muted = false, tok = 0, mouseT = 0;
  const audio = new Audio();
  const cache = new Map();
  const voice = getVoice();
  const tts = text => { if (!cache.has(text)) cache.set(text, ask('tts', { text, opts: { voice } }).then(r => { const bin = atob(r.audio); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return URL.createObjectURL(new Blob([u8], { type: r.mime || 'audio/mpeg' })); }).catch(() => null)); return cache.get(text); };
  L.forEach(s => s.say && tts(s.say));   // alles vorladen, damit jeder Take sofort startet

  // Untertitel Wort für Wort, im Takt der Stimme
  async function say(text, my) {
    const words = text.split(/\s+/);
    sub.innerHTML = words.map(w => '<span class="' + (/\d|Prozent|Bank|Trick|Falle|Risiko|Podcast|Kapitel|Kosten|Respekt|Sonntag|Semester|Zuschlag|direkt|ernsthaft/i.test(w) ? 'hot' : '') + '">' + w + '</span>').join(' ');
    const spans = [...sub.children];
    const url = muted ? null : await tts(text);
    if (my !== tok) return;
    maxEl.classList.add('talk'); fc.set('talk');
    let dur = Math.max(1.6, words.length * 0.36);
    if (url) { audio.src = url; try { await audio.play(); } catch (e) {} await new Promise(r => { if (audio.duration) r(); else audio.onloadedmetadata = r; setTimeout(r, 800); }); if (audio.duration && isFinite(audio.duration)) dur = audio.duration; }
    const t0 = performance.now();
    await new Promise(res => {
      const step = () => { if (my !== tok) return res(); const p = (performance.now() - t0) / (dur * 1000); const n = Math.min(spans.length, Math.ceil(p * spans.length)); spans.forEach((s, i) => s.classList.toggle('on', i < n)); if (p < 1) requestAnimationFrame(step); else res(); };
      requestAnimationFrame(step);
    });
    if (my !== tok) return;
    maxEl.classList.remove('talk'); fc.set('smug'); setTimeout(() => { if (my === tok) fc.set('idle'); }, 1400);
  }

  // Max' Mauszeiger: fährt zu dem, was er gerade erklärt, und klickt
  const mcur = root.querySelector('.mcur');
  function curTo(sel, opt = {}) {
    const t = typeof sel === 'string' ? root.querySelector(sel) : sel; if (!t) return;
    const r = t.getBoundingClientRect(), R = root.getBoundingClientRect();
    const x = r.left - R.left + r.width * (opt.fx != null ? opt.fx : .5), y = r.top - R.top + r.height * (opt.fy != null ? opt.fy : .5);
    mcur.classList.add('on'); mcur.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    if (opt.hl) { root.querySelectorAll('.hl').forEach(e => e.classList.remove('hl')); t.classList.add('hl'); }
  }
  function curClick() { mcur.classList.remove('click'); void mcur.offsetWidth; mcur.classList.add('click'); }
  function path(my, steps) { steps.forEach(([ms, sel, opt, click]) => setTimeout(() => { if (my !== tok) return; curTo(sel, opt || {}); if (click) setTimeout(() => { if (my === tok) curClick(); }, 950); }, ms)); }
  const curOff = () => { mcur.classList.remove('on'); root.querySelectorAll('.hl').forEach(e => e.classList.remove('hl')); };
  function setMax(mode) { sub.classList.toggle('shside', mode === 'small'); maxEl.classList.toggle('big', mode === 'big'); stage.classList.toggle('full', mode === 'hide'); maxEl.style.opacity = mode === 'hide' ? '0' : '1'; }

  const IC_BOARD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
  const IC_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';
  const tafel = (page, inner, first) => '<div class="tf' + (first ? ' pop' : '') + '"><div class="tbb"><span class="ic">' + IC_BOARD + '</span><span class="tt">Tafel · Kostenrechnung</span><span class="cnt">' + page + ' / 2</span><span class="dl" title="Herunterladen (PDF)">' + IC_DL + '</span></div><div class="ta">' + inner + '</div></div>';
  // Echte PDF der Tafel (wie überall in der App: Druckfenster → Als PDF sichern)
  const PDF_HTML = '<h2 class="tt">Kostenrechnung – Übersicht</h2><p>Die Kostenrechnung beantwortet drei Fragen:</p><h3>1. Kostenartenrechnung – Welche Kosten?</h3><ul><li><b>Einzelkosten</b> lassen sich einem Produkt direkt zurechnen (z. B. Material, Fertigungslohn).</li><li><b>Gemeinkosten</b> fallen für mehrere Produkte an (z. B. Miete, Strom).</li></ul><h3>2. Kostenstellenrechnung – Wo entstanden?</h3><ul><li>Gemeinkosten werden im <b>BAB</b> (Betriebsabrechnungsbogen) auf Kostenstellen verteilt.</li><li>Daraus ergeben sich <b>Zuschlagssätze</b> auf die Einzelkosten.</li></ul><h3>3. Kostenträgerrechnung – Wofür?</h3><ul><li><b>Kalkulation</b> (Stückrechnung): Selbstkosten und Preis pro Stück.</li><li><b>Kostenträgerzeitrechnung</b>: Kosten und Ergebnis pro Periode.</li></ul><h3>Merksatz</h3><p>Einzelkosten gehen direkt aufs Produkt, Gemeinkosten erst über die Kostenstellen und dann per Zuschlag.</p>';
  const pdfNow = () => import('./export.js').then(E => E.boardsPdf([{ title: 'Kostenrechnung – Übersicht', html: PDF_HTML }], 'Kostenrechnung – Übersicht')).catch(() => {});

  const SCENES = {
    intro(my) { setMax('big'); maxEl.classList.remove('in'); void maxEl.offsetWidth; maxEl.classList.add('in'); stage.innerHTML = ''; },
    scan(my) {
      setMax('small');
      stage.innerHTML = '<div style="width:100%;display:grid;justify-items:center"><div class="tag fade"><i></i>Skript gelesen · 21 Folien · Banking and FinTech</div><div class="slides">' + SLIDES.map((t, i) => '<div class="sl pop" style="animation-delay:' + (i * 45) + 'ms">' + (i + 1) + ' · ' + t + '</div>').join('') + '<div class="scanl"></div></div><div class="chips"></div></div>';
      const ch = stage.querySelector('.chips');
      TERMS.forEach((t, i) => setTimeout(() => { if (my !== tok) return; ch.appendChild(el('span', 'chip pop', t)); }, 2600 + i * 220));
    },
    tafel(my) {
      setMax('small');
      const W = 520, H = 330, n = 5, ys = [...Array(n)].map((_, i) => 30 + i * 67);
      let a = '', b = '';
      ys.forEach(y1 => ys.forEach(y2 => { a += '<line class="draw" style="--L:420;animation-delay:' + (Math.random() * 900 + 400) + 'ms" x1="120" y1="' + y1 + '" x2="400" y2="' + y2 + '" stroke="currentColor" stroke-width="1.6" opacity=".55"/>'; }));
      ys.forEach(y => { b += '<line class="draw" style="--L:300;animation-delay:2400ms" x1="120" y1="' + y + '" x2="260" y2="165" stroke="currentColor" stroke-width="2.4"/><line class="draw" style="--L:300;animation-delay:2700ms" x1="400" y1="' + y + '" x2="260" y2="165" stroke="currentColor" stroke-width="2.4"/>'; });
      const box = (x, y, t) => '<rect x="' + (x - 58) + '" y="' + (y - 17) + '" width="116" height="34" rx="9" fill="var(--card)" stroke="var(--g)" stroke-width="1.5"/><text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">' + t + '</text>';
      const sideL = ys.map((y, i) => box(60, y, 'Nehmer ' + (i + 1))).join(''), sideR = ys.map((y, i) => box(460, y, 'Geber ' + (i + 1))).join('');
      const nm = n * n, npm = n + n;   // feste Rechnung, keine KI
      stage.innerHTML = '<div class="board glass fade"><div class="tag"><i></i>An der Tafel · Neoklassischer Ansatz</div><div class="h1">Warum gibt es <em>Banken?</em></div><div class="net"><div><h3>Ohne Bank</h3><small>n × m Verträge</small><svg viewBox="0 0 ' + W + ' ' + H + '" style="color:var(--mute)">' + a + sideL + sideR + '</svg></div><div><h3>Mit Bank</h3><small>n + m Verträge</small><svg viewBox="0 0 ' + W + ' ' + H + '" style="color:var(--g2)">' + b + sideL + sideR + '<g class="pop" style="animation-delay:2.2s"><rect x="195" y="140" width="130" height="50" rx="14" fill="var(--g)"/><text x="260" y="171" text-anchor="middle" font-size="17" font-weight="800" fill="#fff">Bank</text></g></svg></div></div><div class="eq pop" style="animation-delay:3.6s">' + n + ' × ' + n + ' = <b>' + nm + '</b> &nbsp;→&nbsp; ' + n + ' + ' + n + ' = <b>' + npm + '</b></div></div>';
    },
    zahlen(my) {
      setMax('small');
      stage.innerHTML = '<div style="width:100%;display:grid;justify-items:center"><div class="tag fade"><i></i>Key Figures aus deinem Skript</div><div class="kpis">'
        + '<div class="kpi glass pop"><svg class="gauge" viewBox="0 0 200 110"><path d="M15 100 A85 85 0 0 1 185 100" fill="none" stroke="var(--line)" stroke-width="16" stroke-linecap="round"/><path class="gz" d="M15 100 A85 85 0 0 1 185 100" fill="none" stroke="url(#shgr)" stroke-width="16" stroke-linecap="round" style="stroke-dasharray:267;stroke-dashoffset:267;transition:stroke-dashoffset 2s cubic-bezier(.16,1,.3,1)"/><defs><linearGradient id="shgr"><stop offset="0" stop-color="var(--g)"/><stop offset="1" stop-color="var(--g2)"/></linearGradient></defs></svg><div class="v"><span data-n="58">0</span> %</div><div class="l">Cost-Income-Ratio, deutsche Banken</div><div class="s">Q3 2025 · ECB/Statista</div></div>'
        + '<div class="kpi glass pop" style="animation-delay:.25s"><div class="v"><span data-n="127000">0</span></div><div class="l">Bankfilialen in der EU-27</div><div class="bars">' + [100, 97.5].map((h, i) => '<i style="height:' + h + '%;animation-delay:' + (0.6 + i * 0.3) + 's;opacity:' + (i ? 1 : .45) + '"></i>').join('') + '</div><div class="s">2024 · −2,5 % ggü. Vorjahr · EBF</div></div>'
        + '<div class="kpi glass pop" style="animation-delay:.5s"><svg viewBox="0 0 240 140" style="width:100%"><polyline class="draw" style="--L:400;animation-delay:.9s" points="10,30 60,55 110,85 150,105 190,100 230,60" fill="none" stroke="var(--g2)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="230" cy="60" r="7" fill="var(--g2)" class="pop" style="animation-delay:2s"/></svg><div class="l" style="font-size:clamp(18px,1.6vw,30px);font-weight:800;color:var(--ink)">EZB-Zinsen</div><div class="l">2024 bis Mitte 2025 gesenkt, Juni 2026 wieder erhöht</div><div class="s">Verlauf schematisch · ECB</div></div>'
        + '</div></div>';
      setTimeout(() => { const g = stage.querySelector('.gz'); if (g) g.style.strokeDashoffset = String(267 * (1 - 0.58)); }, 400);
      stage.querySelectorAll('[data-n]').forEach(s => { const to = +s.dataset.n, t0 = performance.now() + 300; const f = t => { if (my !== tok) return; const p = Math.max(0, Math.min(1, (t - t0) / 1800)), e = 1 - Math.pow(1 - p, 3); s.textContent = Math.round(to * e).toLocaleString('de-DE'); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    },
    mindmap(my) {
      setMax('small');
      const N = [['Transformations-funktion', 600, 70, 0], ['Liquidität', 270, 200, 1], ['Information', 600, 200, 1], ['Risiko', 930, 200, 1], ['Fristen', 160, 330, 2], ['Losgrößen', 380, 330, 2], ['horizontal', 820, 330, 2], ['vertikal', 1040, 330, 2], ['positiv', 70, 450, 3], ['negativ', 250, 450, 3], ['Aktivseite', 950, 450, 3], ['Passivseite', 1130, 450, 3]];
      const E = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [3, 6], [3, 7], [4, 8], [4, 9], [7, 10], [7, 11]];
      let s = '<svg class="mm" viewBox="-20 0 1240 500" preserveAspectRatio="xMidYMid meet">';
      E.forEach(([a, b], i) => { const A = N[a], B = N[b]; s += '<path class="draw" style="--L:400;animation-delay:' + (300 + B[3] * 700) + 'ms" d="M' + A[1] + ' ' + (A[2] + 26) + ' C' + A[1] + ' ' + (A[2] + 70) + ',' + B[1] + ' ' + (B[2] - 70) + ',' + B[1] + ' ' + (B[2] - 26) + '" fill="none" stroke="var(--g2)" stroke-width="3" opacity=".8"/>'; });
      N.forEach(([t, x, y, d], i) => { const w = d === 0 ? 260 : d === 1 ? 200 : d === 2 ? 160 : 150, hh = d === 0 ? 62 : 50; const lines = t.split('-'); s += '<g class="nd" style="animation-delay:' + (d * 700) + 'ms;transform-origin:' + x + 'px ' + y + 'px"><rect x="' + (x - w / 2) + '" y="' + (y - hh / 2) + '" width="' + w + '" height="' + hh + '" rx="16" fill="' + (d === 0 ? 'var(--g)' : 'var(--card)') + '" stroke="var(--g)" stroke-width="2"/><text x="' + x + '" y="' + (y + (lines.length > 1 ? -2 : 7)) + '" text-anchor="middle" font-size="' + (d === 0 ? 22 : d === 1 ? 21 : 18) + '" style="fill:' + (d === 0 ? '#fff' : 'var(--ink)') + '">' + (lines.length > 1 ? lines[0] + '-</text><text x="' + x + '" y="' + (y + 20) + '" text-anchor="middle" font-size="22" style="fill:#fff">' + lines[1] : t) + '</text></g>'; });
      stage.innerHTML = '<div style="width:100%;height:100%;display:grid;grid-template-rows:auto 1fr;justify-items:center"><div class="tag fade"><i></i>Mindmap · Function-oriented definition</div>' + s + '</svg></div>';
    },
    karten(my) {
      setMax('small');
      stage.innerHTML = '<div style="width:100%;display:grid;justify-items:center"><div class="tag fade"><i></i>Karteikarten · Kapitel 1</div><div class="cards">' + CARDS.map((c, i) => '<div class="fc pop" style="animation-delay:' + (i * 150) + 'ms"><div class="in"><div class="fa">' + c[0] + '</div><div class="ba">' + c[1] + '</div></div></div>').join('') + '</div></div>';
      stage.querySelectorAll('.fc').forEach((c, i) => setTimeout(() => { if (my === tok) c.classList.add('flip'); }, 2950 + i * 1300));
    },
    quiz(my) {
      setMax('small');
      let qi = 0;
      const draw = () => {
        const [q, os, ok, why] = QUIZ[qi];
        stage.innerHTML = '<div class="qz glass pop" style="position:relative"><div class="qn">FRAGE ' + (qi + 1) + ' / 3' + (qi === 2 ? ' · FALLE' : '') + '</div><svg class="timer" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="20" cy="20" r="17" fill="none" stroke="var(--g2)" stroke-width="4" stroke-linecap="round" transform="rotate(-90 20 20)" style="stroke-dasharray:107;stroke-dashoffset:0;transition:stroke-dashoffset 12s linear" class="tm"/></svg><div class="q" style="margin-top:3vh">' + q + '</div>' + os.map((o, i) => '<div class="o" data-i="' + i + '"><b>' + (i + 1) + '</b>' + o + '</div>').join('') + '<div class="why"></div></div>';
        setTimeout(() => { const t = stage.querySelector('.tm'); if (t) t.style.strokeDashoffset = '107'; }, 60);
        stage.querySelectorAll('.o').forEach(o => o.onclick = () => pick(+o.dataset.i));
      };
      const pick = i => {
        const [, , ok, why] = QUIZ[qi]; const os = stage.querySelectorAll('.o'); if (!os.length || stage.querySelector('.o.ok')) return;
        os[ok].classList.add('ok'); if (i !== ok) { os[i].classList.add('no'); fc.pulse('smug', 1600); } else { fc.pulse('happy', 1600); confetti(); }
        stage.querySelector('.why').textContent = why;
      };
      quizApi = { pick, next: () => { if (!stage.querySelector('.o.ok')) return false; if (qi < 2) { qi++; draw(); return true; } return false; } };
      draw();
    },
    mitschrift(my) {
      setMax('small');
      stage.innerHTML = '<div style="width:100%;display:grid;justify-items:center"><div class="tag fade"><i></i>Mitschrift umwandeln</div><div class="ms">'
        + '<div class="paper pop">Banken = Transf.fkt <span class="ar">→</span> Liq / Info / Risiko ??<br><s>Fristen pos.</s> Fristen: pos. + neg.<br>Diamond <u>1984</u>!! deleg. Monitoring<br>ohne Bank n·m, mit n+m <span class="ar">(Klausur!)</span><br>Factoring = FDL <s>nicht Bank</s> ✓</div>'
        + '<div class="clean glass pop" style="animation-delay:.9s"><h4>Kapitel 1 · Sauber</h4><ul style="margin:0;padding-left:1.2em">'
        + ['Transformationsfunktion: Liquidität, Information, Risiko', 'Fristentransformation: positiv und negativ', 'Delegated Monitoring nach Diamond (1984)', 'Verträge: ohne Bank n × m, mit Bank n + m', 'Factoring: Finanzdienstleistung (§ 1 Abs. 1a KWG)'].map((t, i) => '<li class="tw" style="animation-delay:' + (1.4 + i * 0.75) + 's">' + t + '</li>').join('') + '</ul></div></div></div>';
    },
    podcast(my) {
      setMax('small');
      stage.innerHTML = '<div class="pod glass pop"><div class="top"><div class="cover">BWL<br>Max<br>Pod</div><div style="flex:1;min-width:0"><div class="tag" style="margin:0 0 1vh"><i></i>Podcast · 6 Min</div><div class="h1" style="margin:0;font-size:clamp(28px,3vw,56px)">Warum es <em>Banken</em> gibt</div><div style="color:var(--mute);font-weight:650;margin-top:1vh">Kapitel 1 · Banking and FinTech</div></div></div><div class="wave">' + [...Array(64)].map((_, i) => '<i style="--h:' + (25 + Math.abs(Math.sin(i * 1.7)) * 75) + '%;animation-delay:' + (i % 8) * 0.09 + 's"></i>').join('') + '</div><div class="prog"><i></i></div></div>';
    },
    sprechen(my) {
      setMax('small');
      stage.innerHTML = '<div style="display:grid;justify-items:center;gap:4vh"><div class="tag fade"><i></i>Sprich mit Max</div><div class="mic"><div class="c"></div><div class="c"></div><div class="c"></div><div class="core">' + IC_MIC + '</div></div><div class="wave" style="width:min(700px,60vw);height:8vh">' + [...Array(40)].map((_, i) => '<i style="--h:' + (30 + Math.abs(Math.cos(i * 1.3)) * 70) + '%;animation-delay:' + (i % 6) * 0.11 + 's"></i>').join('') + '</div></div>';
    },
    kstart(my) { setMax('small'); stage.innerHTML = '<div class="out fade"><div class="h1">Was lernen wir <em>heute?</em></div></div>'; },
    kroast(my) { setMax('big'); stage.innerHTML = ''; fc.pulse('smug', 2600); },
    kmap(my) {
      setMax('small');
      // [Text, x, y, Ebene, Einflug-Zeit ms, Untertitel]
      const N = [['Kostenrechnung', 600, 60, 0, 200], ['Kostenarten', 200, 190, 1, 2300, 'Welche Kosten?'], ['Kostenstellen', 600, 190, 1, 4700, 'Wo entstanden?'], ['Kostenträger', 990, 190, 1, 7000, 'Wofür?'],
        ['Einzelkosten', 100, 335, 2, 2900], ['Gemeinkosten', 300, 335, 2, 3300], ['BAB', 510, 335, 2, 5300], ['Zuschläge', 690, 335, 2, 5700], ['Kalkulation', 890, 335, 2, 7600], ['Pro Periode', 1090, 335, 2, 8000],
        ['Material', 100, 455, 3, 3600], ['Miete & Strom', 300, 455, 3, 4000], ['Stückpreis', 890, 455, 3, 8500], ['Ergebnis', 1090, 455, 3, 8900]];
      const E = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [2, 7], [3, 8], [3, 9], [4, 10], [5, 11], [8, 12], [9, 13]];
      let s = '<svg class="mm" viewBox="-20 0 1240 520" preserveAspectRatio="xMidYMid meet">', pl = '';
      E.forEach(([a, b], i) => { const A = N[a], B = N[b], d = 'M' + A[1] + ' ' + (A[2] + 26) + ' C' + A[1] + ' ' + (A[2] + 75) + ',' + B[1] + ' ' + (B[2] - 75) + ',' + B[1] + ' ' + (B[2] - 26), t = B[4] - 350;
        s += '<path class="draw" style="--L:420;animation-delay:' + t + 'ms" d="' + d + '" fill="none" stroke="var(--g2)" stroke-width="3" opacity=".75"/>';
        pl += '<circle class="pulse" r="5" opacity="0"><set attributeName="opacity" to="1" begin="' + (t + 900) / 1000 + 's"/><animateMotion dur="' + (1.6 + (i % 3) * .3) + 's" begin="' + (t + 900) / 1000 + 's" repeatCount="indefinite" path="' + d + '"/></circle>'; });
      N.forEach(([t, x, y, d, ms, cap], i) => { const w = d === 0 ? 300 : d === 1 ? 240 : 170, hh = d === 0 ? 70 : d === 1 ? 58 : 50, fx = (-x - 200 + Math.random() * 200) + 'px', fy = (380 - y + Math.random() * 160) + 'px', fr = (Math.random() * 40 - 20) + 'deg';
        s += '<circle class="burst" cx="' + x + '" cy="' + y + '" r="' + (w / 2.6) + '" style="animation-delay:' + (ms + 650) + 'ms;transform-origin:' + x + 'px ' + y + 'px"/>'
          + '<g class="fly" style="--fx:' + fx + ';--fy:' + fy + ';--fr:' + fr + ';animation-delay:' + ms + 'ms;transform-origin:' + x + 'px ' + y + 'px"><rect x="' + (x - w / 2) + '" y="' + (y - hh / 2) + '" width="' + w + '" height="' + hh + '" rx="16" fill="' + (d === 0 ? 'var(--g)' : 'var(--card)') + '" stroke="var(--g)" stroke-width="2"/>'
          + '<text x="' + x + '" y="' + (y + (d === 0 ? 10 : 8)) + '" text-anchor="middle" font-size="' + (d === 0 ? 30 : d === 1 ? 25 : d === 2 ? 20 : 18) + '" style="fill:' + (d === 0 ? '#fff' : 'var(--ink)') + '">' + t.replace('&', '&amp;') + '</text>'
          + (cap ? '<text class="cap" x="' + x + '" y="' + (y + 52) + '" text-anchor="middle" font-size="17">' + cap + '</text>' : '') + '</g>'; });
      stage.innerHTML = tafel(1, s + pl + '</svg>', true);
      try { stage.querySelector('svg').setCurrentTime(0); } catch (e) {}
    },
    kfluss(my) {
      setMax('small');
      const col = (x, t, sm) => '<g class="fly" style="--fx:-300px;--fy:200px;--fr:-8deg;animation-delay:' + (x / 3) + 'ms;transform-origin:' + (x + 140) + 'px 250px"><rect x="' + x + '" y="40" width="280" height="440" rx="26" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/><text class="hd" x="' + (x + 140) + '" y="90" text-anchor="middle">' + t + '</text><text class="sm" x="' + (x + 140) + '" y="118" text-anchor="middle">' + sm + '</text></g>';
      const chip = (x, y, t, ms) => '<g class="chip fly" style="--fx:-120px;--fy:60px;--fr:6deg;animation-delay:' + ms + 'ms;transform-origin:' + x + 'px ' + y + 'px"><rect x="' + (x - 95) + '" y="' + (y - 24) + '" width="190" height="48" rx="14"/><text x="' + x + '" y="' + (y + 7) + '" text-anchor="middle" font-size="19">' + t + '</text></g>';
      const tk = (cls, t, w, path, b, dur) => '<g class="tok ' + cls + '" opacity="0"><set attributeName="opacity" to="1" begin="' + b + 's"/><rect x="' + (-w / 2) + '" y="-21" width="' + w + '" height="42" rx="13"/><text x="0" y="6" text-anchor="middle">' + t + '</text><animateMotion dur="' + dur + 's" begin="' + b + 's" fill="freeze" calcMode="spline" keySplines=".6 0 .3 1" keyTimes="0;1" path="' + path + '"/><animate attributeName="opacity" from="1" to="0" dur=".35s" begin="' + (b + dur + .15) + 's" fill="freeze"/></g>';
      let cells = ''; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells += '<rect class="cell" data-c="' + (r * 3 + c) + '" x="' + (530 + c * 50) + '" y="' + (230 + r * 50) + '" width="42" height="42" rx="8"/>';
      const s = '<svg class="kf" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid meet">'
        + col(40, 'Kostenarten', 'Was kostet es?') + col(460, 'Kostenstellen', 'Wo fällt es an?') + col(880, 'Kostenträger', 'Wofür?')
        + chip(180, 190, 'Material', 600) + chip(180, 260, 'Lohn', 800) + chip(180, 360, 'Miete', 1000) + chip(180, 430, 'Strom', 1200)
        + '<g class="fly" style="--fx:0px;--fy:120px;--fr:0deg;animation-delay:1300ms;transform-origin:600px 300px">' + cells + '<text class="sm" x="605" y="410" text-anchor="middle">BAB</text></g>'
        + '<g class="fly" style="--fx:200px;--fy:100px;--fr:10deg;animation-delay:1500ms;transform-origin:1020px 300px"><rect x="925" y="230" width="190" height="140" rx="22" fill="var(--g)"/><text x="1020" y="285" text-anchor="middle" font-size="24" style="fill:#fff">Produkt</text><text x="1020" y="330" text-anchor="middle" font-size="22" style="fill:#fff"><tspan class="kpr">0</tspan> €</text></g>'
        + '<path d="M280 190 C 520 60, 760 60, 925 270" fill="none" stroke="var(--g2)" stroke-width="2.5" stroke-dasharray="8 8" opacity=".55" class="draw" style="--L:900;animation-delay:2000ms"/>'
        + '<path d="M280 395 C 380 395, 420 300, 525 300" fill="none" stroke="var(--g2)" stroke-width="2.5" stroke-dasharray="8 8" opacity=".55" class="draw" style="--L:400;animation-delay:4300ms"/>'
        + '<path d="M685 300 C 780 300, 840 330, 925 320" fill="none" stroke="#2fd27a" stroke-width="2.5" stroke-dasharray="8 8" opacity=".7" class="draw" style="--L:400;animation-delay:7000ms"/>'
        + tk('', 'Material', 150, 'M180 190 C 520 60, 760 60, 1020 270', 2.2, 1.6) + tk('', 'Lohn', 110, 'M180 260 C 520 120, 760 120, 1020 300', 2.7, 1.6)
        + tk('', 'Miete', 120, 'M180 360 C 380 360, 420 300, 600 300', 4.4, 1.3) + tk('', 'Strom', 120, 'M180 430 C 380 430, 420 320, 600 320', 4.9, 1.3)
        + tk('z', '+ Zuschlag', 170, 'M640 300 C 780 300, 840 330, 1020 345', 7.1, 1.3)
        + '</svg>';
      stage.innerHTML = tafel(2, s, false);
      try { stage.querySelector('svg').setCurrentTime(0); } catch (e) {}
      const cl = [...stage.querySelectorAll('.cell')];
      cl.forEach((c, i) => setTimeout(() => { if (my === tok) c.classList.add('on'); }, 5600 + i * 140));
      const pr = stage.querySelector('.kpr'), cnt = (from, to, at) => setTimeout(() => { const t0 = performance.now(); const f = t => { if (my !== tok) return; const p = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - p, 3); pr.textContent = Math.round(from + (to - from) * e); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }, at);
      cnt(0, 18, 3600); cnt(18, 30, 4100); cnt(30, 48, 8300);
      setTimeout(() => { if (my === tok) { fc.pulse('happy', 1400); } }, 8600);
    },
    kende(my) {
      setMax('small');
      // Tafel bleibt stehen, Max klickt auf Download, die PDF fliegt rein und bleibt
      setTimeout(() => { if (my !== tok) return; const d = stage.querySelector('.dl'); if (d) { curTo(d); setTimeout(() => { if (my !== tok) return; curClick(); d.classList.add('hit'); const c = el('div', 'pdfc glass pop', '<span class="pi">PDF</span><span><b>Kostenrechnung_Tafel.pdf</b><small>2 Seiten · heruntergeladen</small></span><span class="ok">✓</span>'); c.onclick = pdfNow; root.appendChild(c); }, 1000); } }, 500);
      setTimeout(() => { if (my !== tok) return; curOff(); stage.innerHTML = '<div class="out pop"><div class="h1">Kostenrechnung <em>sitzt.</em></div><div class="tag" style="justify-content:center;margin:1.5vh 0 2.5vh;font-size:clamp(16px,1.5vw,26px);color:var(--ink)">Für BWL- &amp; Wiwi-Studenten</div><div class="url">bwlmax.de</div></div>'; confetti(); }, 5200);
    },
    outro(my) {
      setMax('big');
      stage.innerHTML = '';
      setTimeout(() => { if (my !== tok) return; setMax('small'); stage.innerHTML = '<div class="out pop"><div class="h1">Kapitel 1 <em>sitzt.</em></div><div class="url">bwlmax.de</div></div>'; confetti(); }, 2600);
    }
  };
  let quizApi = null;

  function confetti() {
    const cols = ['#2f5584', '#9db7da', '#2fd27a', '#ffffff', '#c9d6ea'];
    for (let i = 0; i < 70; i++) { const c = el('i', 'conf'); c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % cols.length]; c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px'); c.style.animationDelay = Math.random() * 0.4 + 's'; root.appendChild(c); setTimeout(() => c.remove(), 3200); }
  }

  async function go(i) {
    if (i < 0) i = 0; if (i >= L.length) { stop(); return; }
    idx = i; const my = ++tok; quizApi = null;
    try { audio.pause(); } catch (e) {}
    maxEl.classList.remove('talk'); fc.set('idle'); sub.innerHTML = '';
    if (!L[i].keepYou) root.querySelectorAll('.you').forEach(x => x.remove());
    root.querySelectorAll('.pdfc').forEach(x => x.remove());
    tab(L[i].id); curOff(); SCENES[L[i].id](my);
    const P = {
      scan: [[400, '.slides', { fx: .15, fy: .2 }], [1500, '.slides', { fx: .85, fy: .8 }], [3400, '.chips', { fx: .3 }]],
      tafel: [[700, '.net > div:first-child svg', {}], [2600, '.net > div:last-child svg', { fx: .5, fy: .5 }, true], [4200, '.eq', { fx: .75 }]],
      zahlen: [[600, '.kpi:nth-child(1) .v', {}], [2600, '.kpi:nth-child(2) .v', {}], [4600, '.kpi:nth-child(3) svg', { fx: .95, fy: .45 }]],
      mindmap: [[500, '.mm', { fx: .5, fy: .14 }], [2200, '.mm', { fx: .23, fy: .4 }], [3800, '.mm', { fx: .77, fy: .4 }], [5400, '.mm', { fx: .86, fy: .9 }]],
      karten: [[1900, '.fc:nth-child(1)', {}, true], [3200, '.fc:nth-child(2)', {}, true], [4500, '.fc:nth-child(3)', {}, true], [5800, '.fc:nth-child(4)', {}, true]],
      quiz: [[600, '.qz .q', { fx: .1 }], [2200, '.qz .o[data-i="0"]', { fx: .2 }], [3000, '.qz .o[data-i="1"]', { fx: .2 }], [3800, '.qz .o[data-i="2"]', { fx: .2 }], [4800, '.timer', {}]],
      mitschrift: [[500, '.paper', { fx: .3, fy: .3 }], [1700, '.paper', { fx: .6, fy: .7 }], [2600, '.clean', { fx: .2, fy: .25 }], [4200, '.clean', { fx: .4, fy: .8 }]],
      podcast: [[700, '.cover', {}, true], [2200, '.wave', { fx: .3 }], [3600, '.prog', { fx: .38 }]],
      sprechen: [[700, '.mic .core', {}, true]],
      kmap: [[400, '.mm', { fx: .5, fy: .12 }], [2400, '.mm', { fx: .177, fy: .37 }, true], [3700, '.mm', { fx: .097, fy: .88 }], [4800, '.mm', { fx: .5, fy: .37 }, true], [6000, '.mm', { fx: .427, fy: .64 }], [7100, '.mm', { fx: .815, fy: .37 }, true], [8700, '.mm', { fx: .895, fy: .88 }]],
      kfluss: [[700, '.kf', { fx: .15, fy: .37 }], [2300, '.kf', { fx: .85, fy: .55 }, true], [4300, '.kf', { fx: .15, fy: .76 }], [5600, '.kf', { fx: .5, fy: .58 }, true], [7300, '.kf', { fx: .62, fy: .58 }], [8400, '.kf', { fx: .85, fy: .62 }, true]]
    }[L[i].id];
    if (P) path(my, P);
    await wait(i === 0 ? 900 : 500);
    if (my !== tok || !L[i].say) return;
    await say(L[i].say, my);
    if (L[i].auto && my === tok) { await wait(700); if (my === tok) go(i + 1); }
  }

  // Mikro (Show): Max wird groß, hört zu, Pegel pulsiert; zweiter Klick oder Enter beendet. Erkannter Satz erscheint als deine Frage.
  let rec = null, listening = false, ana = null, raf = 0, chunks = [];
  async function listen() {
    if (listening) return endListen();
    listening = true; tok++; try { audio.pause(); } catch (e) {}
    root.classList.add('listen'); mk.classList.add('rec'); stage.innerHTML = ''; curOff();
    setMax('big'); maxEl.classList.remove('in'); void maxEl.offsetWidth; maxEl.classList.add('in'); fc.set('idle'); fc.lookAt(0, 30, 900);
    sub.innerHTML = '<span class="on">Ich hör dir zu …</span>';
    try {
      const st = await getMic(); if (!listening) { releaseMic(); return; }
      const ac = new (window.AudioContext || window.webkitAudioContext)(), src = ac.createMediaStreamSource(st); ana = ac.createAnalyser(); ana.fftSize = 512; src.connect(ana);
      const buf = new Uint8Array(ana.fftSize); const loop = () => { if (!listening) { try { ac.close(); } catch (e) {} return; } ana.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128)); maxEl.style.setProperty('--lv', Math.min(1, m / 50).toFixed(2)); raf = requestAnimationFrame(loop); }; loop();
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
      chunks = []; rec = new MediaRecorder(st, mime ? { mimeType: mime } : undefined); rec.ondataavailable = e => e.data && e.data.size && chunks.push(e.data); rec.start(250);
    } catch (e) { rec = null; }
  }
  async function endListen() {
    if (!listening) return; listening = false; cancelAnimationFrame(raf); maxEl.style.setProperty('--lv', '0');
    root.classList.remove('listen'); mk.classList.remove('rec'); sub.innerHTML = '';
    let text = '';
    if (rec) {
      const r = rec; rec = null;
      const blob = await new Promise(res => { r.onstop = () => res(new Blob(chunks, { type: r.mimeType || 'audio/webm' })); try { r.stop(); } catch (e) { res(null); } });
      releaseMic();
      if (blob && blob.size > 2000) { try { const b64 = await new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(String(f.result).split(',')[1] || ''); f.onerror = rej; f.readAsDataURL(blob); }); const q = await Promise.race([ask('stt', { audio: b64, mime: blob.type }), wait(5000).then(() => null)]); text = (q && q.text || '').trim(); } catch (e) {} }
    }
    if (!text) text = kosten ? 'Hey Max, erstell mir eine Übersicht zur Kostenrechnung.' : '';
    if (text) { const b = el('div', 'you', text.replace(/[<>&]/g, '')); root.appendChild(b); }
    setTimeout(() => next(), 700);
  }
  mk.addEventListener('click', listen);

  function next() { if (quizApi && quizApi.next()) return; go(idx + 1); }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); stop(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); return; }
    if (!typed && quizApi && /^[1-3]$/.test(e.key)) { e.preventDefault(); quizApi.pick(+e.key - 1); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (listening) { endListen(); return; }
      if (typed.trim()) { const t = typed.trim(); typed = ''; typTx.textContent = ''; ph.style.display = ''; snd.classList.remove('go'); void snd.offsetWidth; snd.classList.add('go'); const b = el('div', 'you', t.replace(/[<>&]/g, '')); root.appendChild(b); setTimeout(() => next(), 900); return; }
      next(); return;
    }
    if (e.key === ' ' && !typed) { e.preventDefault(); next(); return; }
    if (!typed && !e.metaKey && !e.ctrlKey) {
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); go(idx); return; }
      if (e.key === 't' || e.key === 'T') { e.preventDefault(); root.classList.toggle('light'); return; }
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); root.classList.toggle('neon'); return; }
      if (e.key === 'm' || e.key === 'M') { e.preventDefault(); muted = !muted; if (muted) try { audio.pause(); } catch (x) {} return; }
    }
    if (e.key === 'Backspace') { e.preventDefault(); typed = typed.slice(0, -1); }
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) { e.preventDefault(); typed += e.key; }
    else return;
    typTx.textContent = typed; ph.style.display = typed ? 'none' : ''; fc.lookAt(0, 20, 600);
  }
  const onMove = () => { root.classList.add('mouse'); clearTimeout(mouseT); mouseT = setTimeout(() => root && root.classList.remove('mouse'), 1500); };
  addEventListener('keydown', onKey, true);
  root.addEventListener('mousemove', onMove);

  function stop() {
    tok++; try { audio.pause(); } catch (e) {}
    if (listening) { listening = false; try { rec && rec.stop(); } catch (e) {} releaseMic(); }
    removeEventListener('keydown', onKey, true);
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    cache.forEach(p => p.then(u => u && URL.revokeObjectURL(u)));
    host.remove(); root = null;
  }
  go(0);
}
