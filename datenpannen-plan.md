# Datenpannen-Reaktionsplan (Art. 33, 34 DSGVO) — Mr. Bell

**Verantwortlicher:** Trading Ben Deschler
kontakt@mrbell.de · +49 176 20690319

**Stand:** 05.05.2026

---

## 1. Was ist eine Datenpanne?

Eine "Verletzung des Schutzes personenbezogener Daten" liegt vor, wenn:
- Daten **unbefugt offengelegt** werden (Leak)
- Daten **unbefugt verändert** werden
- Daten **verloren gehen** oder zerstört werden
- Daten **unbefugt zugegriffen** werden

**Beispiele bei Mr. Bell:**
- Ein API-Key wird versehentlich öffentlich gepostet (z.B. in GitHub-Commit)
- Ein Pioneer-Kunde sieht Daten eines anderen Pioneer-Kunden im Dashboard
- Airtable-Workspace wird durch Phishing kompromittiert
- WhatsApp-Konversationen sind versehentlich öffentlich abrufbar
- Datenbank-Provider (n8n, Airtable, etc.) meldet einen eigenen Sicherheitsvorfall

---

## 2. Sofort-Maßnahmen (innerhalb 1 Stunde nach Erkennung)

### Schritt 1: Vorfall stoppen
- Betroffene Systeme sofort vom Netz nehmen oder Zugang sperren
- Kompromittierte API-Keys sofort revoken (Anthropic, Stripe, 360dialog, GitHub)
- Neue Keys generieren, Vercel Environment Variables aktualisieren

### Schritt 2: Beweise sichern
- Screenshots aller relevanten Logs (n8n, Airtable, Stripe, Vercel)
- Zeitstempel notieren: Wann erstmals erkannt? Wie lange schon offen?
- Welche Daten waren betroffen? Welche Personen?

### Schritt 3: Bewertung
- **Liegt ein Risiko für Betroffene vor?**
  - Niedriges Risiko (z.B. nur interner Test-Key kurz im Klartext): Dokumentieren, kein Behörden-Meldebedarf.
  - Hohes Risiko (Endkunden-Daten leakten, Pioneer-Vertragsdaten kompromittiert): WEITER ZU SCHRITT 4.

---

## 3. Meldung an Aufsichtsbehörde (Art. 33 DSGVO)

**Zuständige Behörde:**
Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI BW)
Königstraße 10a, 70173 Stuttgart
Tel: 0711 / 615541-0
Web: baden-wuerttemberg.datenschutz.de
Email: poststelle@lfdi.bwl.de

**Frist:** 72 Stunden nach Kenntnis der Datenpanne

**Inhalt der Meldung:**
1. Art der Verletzung
2. Kategorien und ungefähre Anzahl der betroffenen Personen
3. Kategorien und ungefähre Anzahl der betroffenen Datensätze
4. Wahrscheinliche Folgen der Verletzung
5. Ergriffene Gegenmaßnahmen
6. Kontaktdaten des Verantwortlichen

**Tool:** Online-Meldeportal auf baden-wuerttemberg.datenschutz.de oder per Email.

---

## 4. Information der Betroffenen (Art. 34 DSGVO)

**Wann?** Wenn die Verletzung "voraussichtlich ein hohes Risiko für die persönlichen Rechte und Freiheiten" der Betroffenen zur Folge hat.

**Wie?** Email an betroffene Pioneer-Kunden und/oder Endkunden.

**Frist:** Unverzüglich (parallel zur Meldung an Behörde).

**Inhalt:**
- Klare und einfache Sprache
- Beschreibung der Verletzung
- Welche Daten betroffen waren
- Welche Maßnahmen ergriffen wurden
- Was die Betroffenen selbst tun sollten (z.B. Passwörter ändern)
- Kontaktdaten für Rückfragen

**Template-Email:**
```
Betreff: Wichtiger Sicherheitshinweis — Mr. Bell

Sehr geehrte/r [Name],

am [Datum] wurde uns ein Sicherheitsvorfall bekannt, bei dem
folgende Ihrer Daten betroffen sein könnten: [Datenkategorien].

Wir haben sofort folgende Maßnahmen ergriffen: [Maßnahmen].

Wir empfehlen Ihnen: [konkrete Schritte für Betroffene].

Bei Fragen: kontakt@mrbell.de · +49 176 20690319

Mit freundlichen Grüßen
Ben Deschler — Mr. Bell
```

---

## 5. Dokumentation jeder Datenpanne (Art. 33 Abs. 5 DSGVO)

Für **jeden** Vorfall (auch nicht meldepflichtige) wird ein Eintrag in `datenpannen-log.md` angelegt:

| Datum | Vorfall | Betroffene | Daten | Risiko | Behörde gemeldet? | Betroffene informiert? | Status |
|-------|---------|------------|-------|--------|-------------------|------------------------|--------|

**Aufbewahrung:** 3 Jahre.

---

## 6. Präventive Maßnahmen

- Wöchentliche Sichtprüfung der API-Key-Logs (Anthropic Console, Stripe Dashboard, GitHub Security)
- Monatliche Überprüfung der Auftragsverarbeiter auf bekannte Sicherheitsvorfälle
- Bitwarden-2FA niemals deaktivieren
- Keine API-Keys in Code-Commits — Git-Hooks (z.B. `gitleaks`) prüfen das automatisch

---

## 7. Eskalations-Kontakte (für Schweregrad-Stufen)

**Stufe 1 (geringer Vorfall, intern lösbar):** Ben Deschler — kontakt@mrbell.de

**Stufe 2 (Behördenmeldung notwendig):**
- Datenschutzbehörde Baden-Württemberg (siehe oben)
- ggf. IT-Sicherheits-Anwalt: noch zu mandatieren ab Pioneer #5

**Stufe 3 (Major-Incident, viele Betroffene):**
- Cyber-Versicherung kontaktieren (Hiscox/exali — neu abzuschließen ab Pioneer #1)
- Pressemitteilung erwägen wenn öffentliches Interesse

---

**Letzte Überprüfung:** 05.05.2026
**Nächste Überprüfung:** 05.05.2027 oder nach erstem Vorfall.
