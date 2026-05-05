# Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)

**Verantwortlicher:** Trading Ben Deschler
Scheibenstr. 2, 76530 Baden-Baden
kontakt@mrbell.de · +49 176 20690319

**Stand:** 05.05.2026

---

## VT-001: Onboarding neuer Pioneer-Kunden (Website-Formular)

**Zweck:** Erfassung der Stammdaten für Bot-Setup
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung/-erfüllung)
**Betroffene:** Geschäftsführer/Inhaber kleiner und mittlerer deutscher Dienstleistungsunternehmen
**Datenkategorien:**
- Firmenname, Branche
- Geschäftsadresse
- Email-Adresse, Telefonnummer
- Öffnungszeiten, Dienstleistungen mit Preisen, FAQs

**Empfänger:** Vercel Inc. (Hosting, USA mit SCCs), Airtable Inc. (Datenspeicherung, USA mit SCCs)
**Übermittlung in Drittländer:** Ja, USA. Rechtsgrundlage: EU-Standardvertragsklauseln (SCCs).
**Speicherdauer:** Bis 90 Tage nach Vertragsende. Rechnungsdaten 10 Jahre (§ 147 AO).
**Technische und organisatorische Maßnahmen:** Siehe TOMs-Dokument.

---

## VT-002: Zahlungsabwicklung (Stripe)

**Zweck:** Abwicklung von Abonnement-Zahlungen und einmaligen Setup-Gebühren
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO
**Betroffene:** Pioneer-Kunden (B2B)
**Datenkategorien:**
- Name, Email, Rechnungsadresse
- Zahlungsmittel (Kreditkarte/SEPA — keine Speicherung bei uns, nur bei Stripe)
- Transaktionshistorie

**Empfänger:** Stripe Payments Europe Ltd (Irland, EU)
**Übermittlung in Drittländer:** Stripe-Mutter ist USA. EU-SCCs greifen.
**Speicherdauer:** 10 Jahre (§ 147 AO Aufbewahrungspflicht für Rechnungen).
**TOMs:** Stripe-PCI-DSS Level 1 zertifiziert. Keine Speicherung von Kartendaten beim Verantwortlichen.

---

## VT-003: WhatsApp-Bot-Betrieb (Endkunden-Kommunikation)

**Zweck:** Automatisierte Beantwortung von Kundenanfragen via WhatsApp Business
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Kunde des Pioneer-Kunden initiiert Kontakt) i.V.m. Art. 28 DSGVO (Auftragsverarbeitung)
**Betroffene:** Endkunden des Pioneer-Kunden (Privatpersonen oder Geschäftskunden)
**Datenkategorien:**
- WhatsApp-Telefonnummer (pseudonymisiert)
- Inhalt der Konversation
- Zeitstempel
- ggf. Name (wenn vom Endkunden mitgeteilt)

**Empfänger:**
- 360dialog GmbH (Berlin) — WhatsApp Business Provider
- Anthropic PBC (USA) — KI-Verarbeitung der Anfragen
- n8n Cloud (Frankfurt) — Workflow-Orchestrierung
- Airtable Inc. (USA) — Logging und Pioneer-Kunden-Dashboard

**Übermittlung in Drittländer:** USA (Anthropic, Airtable). EU-SCCs.
**Speicherdauer:**
- Bei Anthropic: Inputs werden 30 Tage zur Missbrauchserkennung geloggt (Zero-Data-Retention beantragt).
- Bei n8n / Airtable: 30 Tage Konversationslog, dann Anonymisierung.
- 360dialog: gemäß deren AVV.

**Pflichthinweis an Endkunden:** Beim Erstkontakt mit dem Bot wird automatisch ein Disclaimer mit Datenschutz-Link gesendet.

---

## VT-004: Email-Kommunikation (Resend)

**Zweck:** Versand von Bestätigungs-, Rechnungs- und Service-Mails an Pioneer-Kunden
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO
**Betroffene:** Pioneer-Kunden
**Datenkategorien:** Email, Name, Inhalt der Mail
**Empfänger:** Resend Inc. (USA, EU-SCCs)
**Speicherdauer:** 30 Tage Versand-Logs bei Resend, danach anonymisiert.

---

## VT-005: Calendly-Termin-Buchung (Geführtes Setup)

**Zweck:** Termin-Vereinbarung für 30-Min Video-Setup-Calls
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO
**Betroffene:** Pioneer-Kunden
**Datenkategorien:** Name, Email, gewählter Termin, ggf. zusätzliche Notizen
**Empfänger:** Calendly LLC (USA, EU-SCCs)
**Speicherdauer:** Bis 90 Tage nach Termin.

---

## VT-006: Cookie / Web-Tracking (geplant)

**Zweck:** Reichweitenmessung und Marketing-Optimierung
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung über Cookie-Banner)
**Betroffene:** Website-Besucher
**Datenkategorien:** IP-Adresse (anonymisiert), Klickverhalten, Geräte-Info
**Empfänger:** Google Analytics 4, Meta Pixel
**Übermittlung in Drittländer:** USA (mit SCCs).
**Speicherdauer:** Standard 14 Monate (GA4), 90 Tage (Meta).
**Status:** In Implementierung (Cookie-Banner via eRecht24 in Phase 2).

---

## Aktualisierungs-Log

| Datum | Änderung |
|-------|----------|
| 05.05.2026 | Initiale Erstellung |

---

**Verantwortlicher Ansprechpartner für Datenschutz:** Ben Deschler · kontakt@mrbell.de
