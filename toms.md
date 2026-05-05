# Technisch-Organisatorische Maßnahmen (TOMs) — Mr. Bell

**Verantwortlicher:** Trading Ben Deschler (Einzelunternehmen)
Scheibenstr. 2, 76530 Baden-Baden
kontakt@mrbell.de · +49 176 20690319

**Stand:** 05.05.2026
**Geltungsbereich:** Alle personenbezogenen Daten, die im Rahmen des Mr. Bell SaaS-Dienstes verarbeitet werden (Pioneer-Kunden + deren Endkunden).

---

## 1. Vertraulichkeit (Art. 32 Abs. 1 lit. b DSGVO)

### 1.1 Zutrittskontrolle (physisch)
- Arbeitsgeräte (MacBook, iPhone) werden ausschließlich vom Verantwortlichen genutzt.
- MacBook ist mit FileVault (vollständige Festplattenverschlüsselung, AES-XTS-256) gesichert.
- iPhone ist mit Face ID + 6-stelligem Passcode gesichert, automatische Sperrung nach 30 Sek.
- Geräte werden nicht unbeaufsichtigt in öffentlichen Räumen gelassen.
- Keine eigenen Server-Räume — alle Datenverarbeitung erfolgt bei Auftragsverarbeitern.

### 1.2 Zugangskontrolle (System)
- Alle Zugänge zu Diensten (Vercel, n8n, Anthropic, Stripe, Airtable, 360dialog, Google) werden in einem Passwort-Manager (Bitwarden) verwaltet.
- Passwörter sind eindeutig, mindestens 16 Zeichen lang und werden zufällig generiert.
- Zwei-Faktor-Authentifizierung (2FA) ist auf allen Accounts aktiviert (TOTP via Authenticator-App).
- Bitwarden selbst ist mit 2FA + Master-Passwort + biometrischer Entsperrung gesichert.

### 1.3 Zugriffskontrolle (Rechte)
- Da nur eine Person (der Verantwortliche) Mr. Bell betreibt, gibt es keine Rollentrennung. Sollten in Zukunft Mitarbeiter hinzukommen, wird das Need-to-Know-Prinzip angewendet.
- API-Keys sind nur in Vercel Environment Variables hinterlegt, nicht in Code-Repositories.
- Stripe Secret Keys und Anthropic API Keys werden nicht im Klartext lokal gespeichert.

### 1.4 Trennungskontrolle
- Kundendaten verschiedener Pioneer-Kunden werden in separaten Airtable-Records mit eindeutigen Kunden-IDs geführt.
- WhatsApp-Bots laufen pro Pioneer-Kunde mit individuellem 360dialog-API-Key.
- n8n-Workflow-Variablen sind kunden-spezifisch isoliert.

### 1.5 Pseudonymisierung
- Endkunden-Telefonnummern werden in n8n-Logs gehasht (SHA-256) und nicht im Klartext gespeichert (Stand: in Implementierung).
- Personenbezogene Daten in Anthropic-API-Calls werden auf das Notwendige reduziert.

---

## 2. Integrität (Art. 32 Abs. 1 lit. b DSGVO)

### 2.1 Weitergabekontrolle
- Datenübertragung erfolgt ausschließlich über TLS 1.2 oder höher (HTTPS).
- Vercel, Anthropic, n8n Cloud, 360dialog, Stripe, Airtable, Google: alle erzwingen HTTPS.
- Keine Datenweitergabe via unverschlüsselter Email.

### 2.2 Eingabekontrolle
- Stripe-Transaktionen werden vollständig protokolliert (unveränderbar im Stripe Dashboard).
- n8n-Workflow-Executions werden mit Zeitstempel geloggt.
- Änderungen an Pioneer-Kunden-Stammdaten werden mit Timestamp in Airtable festgehalten.

---

## 3. Verfügbarkeit und Belastbarkeit (Art. 32 Abs. 1 lit. b DSGVO)

### 3.1 Verfügbarkeitskontrolle
- Backups: Airtable hat eine 7-Tage-Snapshot-Funktion automatisch.
- n8n Cloud erstellt automatische Backups der Workflows (Anbieter-Verantwortung).
- Kritische Konfigurationen (n8n-Workflow-JSON) werden zusätzlich monatlich manuell exportiert und im verschlüsselten Cloud-Speicher abgelegt.
- Code-Repository (GitHub) ist redundant mit lokaler Arbeitskopie.

### 3.2 Wiederherstellbarkeit
- Bei Ausfall von n8n Cloud kann ein Workflow innerhalb von 24h auf einem Self-Hosted n8n wiederhergestellt werden (Plan ab 5+ Pioneer-Kunden).
- Stripe-Kunden- und Subscription-Daten sind permanent bei Stripe gespeichert und über API wiederherstellbar.

---

## 4. Verfahren zur regelmäßigen Überprüfung (Art. 32 Abs. 1 lit. d DSGVO)

### 4.1 Auftragsverarbeiterverträge (AVVs)
Mit folgenden Auftragsverarbeitern bestehen abgeschlossene AVVs:
- Anthropic PBC (USA, EU-SCCs)
- 360dialog GmbH (Berlin, DE)
- Vercel Inc. (USA, EU-SCCs)
- Stripe Payments Europe Ltd (Irland, EU)

In Bearbeitung:
- Calendly LLC
- n8n GmbH (DE)
- Airtable Inc. (USA, EU-SCCs)
- Google LLC (Workspace, EU-SCCs)

### 4.2 Datenpannen-Reaktionsplan
Siehe separates Dokument `datenpannen-plan.md`.

### 4.3 Schulung
- Verantwortlicher hat sich eigenständig in DSGVO-Grundlagen eingearbeitet (Quellen: eRecht24, IHK Karlsruhe, LfDI Baden-Württemberg).
- Bei Mitarbeitendenaufnahme erfolgt verpflichtende DSGVO-Einweisung vor erstem Kundenkontakt.

### 4.4 Überprüfung
- TOMs werden mindestens einmal jährlich (oder bei wesentlichen Änderungen am Stack) überprüft und aktualisiert.
- Nächste Überprüfung: 05.05.2027.

---

## 5. Spezifische Maßnahmen für KI-Verarbeitung (Anthropic)

- Alle Anfragen an die Anthropic API laufen über HTTPS.
- Kein Pioneer-Kunde wird ohne abgeschlossenen AVV mit Anthropic onboarded.
- Bei Anthropic wird Zero-Data-Retention (ZDR) beantragt, um Logging der Inputs zu deaktivieren.
- Endkunden werden beim Erstkontakt mit dem Bot über die KI-Verarbeitung informiert (automatisierter Disclaimer-Versand).
- System-Prompts enthalten nur das für die Aufgabe nötige Minimum an Pioneer-Daten.

---

**Dokument-Verantwortlicher:** Ben Deschler
**Letzte Überprüfung:** 05.05.2026
