// Tastenkürzel des Excel-Trainers für Windows (deutsches Excel) und Mac – reine Daten, kein DOM.
// Genutzt vom Trainer (Anzeige je nach Gerät) und von tutor/tools/xl-build.mjs (statischer Spickzettel mit beiden Spalten).
//
// Was der Trainer wirklich annimmt, steht in grid.js (navKey). Zusätzlich zu den angezeigten Kürzeln nimmt er
// die englischen Varianten an (Strg + D, Strg + B), damit niemand an der Tastaturbelegung scheitert.
export const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');

export function keyset(mac) {
  const KEY = { mod: mac ? '⌘' : 'Strg', shift: '⇧', alt: mac ? '⌥' : 'Alt', ctrl: mac ? '⌃' : 'Strg', enter: '↵ Enter', tab: '⇥ Tab', esc: 'Esc', del: mac ? '⌫' : 'Entf', up: '↑', down: '↓', left: '←', right: '→' };
  const COMBO = {
    autosum: 'alt+=', f4: mac ? 'fn+F4' : 'F4', f2: mac ? 'fn+F2' : 'F2',
    fmt4: mac ? 'ctrl+shift+4' : 'mod+shift+4', fmt5: mac ? 'ctrl+shift+5' : 'mod+shift+5',
    bold: mac ? 'mod+B' : 'mod+shift+F', filldown: mac ? 'mod+D' : 'mod+U', fillright: 'mod+R'
  };
  const NOTES = {
    autosumNote: mac ? 'Hier im Trainer: ⌥ + = (deutsche Tastatur: ⌥ + ⇧ + 0). Im echten Excel am Mac heißt das Kürzel ⌘ + ⇧ + T – das belegt im Browser aber Chrome bzw. Safari.' : 'Alt gedrückt halten und = tippen (deutsche Tastatur: Alt + ⇧ + 0). Excel nimmt die Zahlen direkt darüber.',
    fmt4Note: mac ? 'Am Mac mit Control (⌃), nicht mit ⌘ – ⌘ + ⇧ + 4 macht einen Bildschirmfoto-Ausschnitt.' : 'Strg + ⇧ + 4 – auf der 4 liegt das $-Zeichen, Excel macht daraus das Währungsformat.',
    f4Note: mac ? 'Am Mac: fn + F4 (im echten Mac-Excel ⌘ + T – das öffnet im Browser aber einen neuen Tab). Klappt die Taste nicht, tipp die $-Zeichen selbst: $G$1.' : 'F4 setzt die $-Zeichen. Nochmal F4: G$1 – nochmal: $G1 – nochmal: wieder G1. Auf manchen Laptops: Fn + F4.',
    f2Note: mac ? 'Am Mac: fn + F2 oder ⌃ + U.' : 'Auf manchen Laptops: Fn + F2.',
    fdWhy: mac ? 'D wie down.' : 'U wie unten. (Englisches Excel: Strg + D – geht hier auch.)',
    boldWhy: mac ? 'B wie bold.' : 'F wie fett. (Englisches Excel: Strg + B – geht hier auch.)'
  };
  // Kürzel als Liste von Tastenbeschriftungen, z. B. 'mod+shift+4' → ['Strg', '⇧', '4']
  const keys = spec => String(COMBO[spec] || spec).split('+').map(p => KEY[p.toLowerCase()] || (p.length === 1 ? p.toUpperCase() : p));
  const text = spec => keys(spec).join(' + ');
  return { mac, KEY, COMBO, NOTES, keys, text };
}

// Spickzettel: [Aktion, Windows-Kürzel, Mac-Kürzel] (mehrere Kürzel je Zelle möglich)
export const CHEAT = [
  ['Eingabe bestätigen, eine Zelle nach unten', ['enter'], ['enter']],
  ['Eingabe bestätigen, eine Zelle nach rechts', ['tab'], ['tab']],
  ['Zelle bearbeiten (Text bleibt stehen)', ['F2'], ['fn+F2', 'ctrl+U']],
  ['Eingabe abbrechen', ['esc'], ['esc']],
  ['Inhalt löschen', ['del'], ['del']],
  ['Rückgängig', ['mod+Z'], ['mod+Z']],
  ['Kopieren / Einfügen', ['mod+C', 'mod+V'], ['mod+C', 'mod+V']],
  ['Nach unten ausfüllen', ['mod+U'], ['mod+D']],
  ['Nach rechts ausfüllen', ['mod+R'], ['mod+R']],
  ['AutoSumme', ['alt+='], ['mod+shift+T']],
  ['Bezug fixieren ($)', ['F4'], ['mod+T']],
  ['Währungsformat (€)', ['mod+shift+4'], ['ctrl+shift+4']],
  ['Prozentformat', ['mod+shift+5'], ['ctrl+shift+5']],
  ['Fett', ['mod+shift+F'], ['mod+B']],
  ['Ans Ende der Daten springen', ['mod+down', 'mod+right'], ['mod+down', 'mod+right']],
  ['Bis zum Ende der Daten markieren', ['mod+shift+down'], ['mod+shift+down']],
  ['Bereich markieren', ['shift+down'], ['shift+down']]
];
// Wo der Trainer im Browser anders arbeitet als das echte Excel (Browser belegt die Originalkürzel)
export const CHEAT_NOTE_MAC = 'Mac: Zwei Kürzel belegt der Browser – im Trainer gilt deshalb ⌥ + = statt ⌘ + ⇧ + T (AutoSumme) und fn + F4 statt ⌘ + T ($-Bezug). Im echten Excel für Mac funktionieren die Originalkürzel.';
export const CHEAT_NOTE_WIN = 'Windows: Die Kürzel gelten für das deutsche Excel. Englische Varianten wie Strg + D (ausfüllen) und Strg + B (fett) nimmt der Trainer ebenfalls an. Auf vielen Laptops brauchen F2 und F4 zusätzlich die Fn-Taste.';
