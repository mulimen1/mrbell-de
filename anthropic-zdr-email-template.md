# Anthropic Zero-Data-Retention (ZDR) Antrag

**Email-Adresse:** privacy@anthropic.com
**CC:** support@anthropic.com (optional)
**Betreff:** Zero Data Retention Request for EU-based Production Account

---

## Email-Template (Englisch — Anthropic antwortet auf Englisch)

```
Subject: Zero Data Retention Request for EU-based Production Account

Hello Anthropic Privacy Team,

I am writing to request Zero Data Retention (ZDR) for our Anthropic API
production account.

Account details:
- Organization name: Trading Ben Deschler (Mr. Bell SaaS)
- Account email: [DEINE-ACCOUNT-EMAIL@mrbell.de]
- Organization ID: [ZU FINDEN IN ANTHROPIC CONSOLE → SETTINGS → ORG ID]
- Primary contact: Ben Deschler · kontakt@mrbell.de

Background:
We operate Mr. Bell, a B2B SaaS for German small and medium-sized service
businesses, providing a WhatsApp AI assistant powered by Claude Haiku 4.5.
Our customers are located in Germany and the European Union and are
subject to the General Data Protection Regulation (GDPR / DSGVO).

Our use case involves processing customer inquiries (B2C interactions
between our business customers and their end-customers) via the Anthropic
API. Some inputs may contain personal data such as names, phone numbers,
and appointment requests. To minimize the data processing footprint and
comply with our customers' GDPR requirements, we kindly request:

1. Activation of Zero Data Retention (ZDR) for all API calls from our
   organization.
2. Confirmation in writing that input and output data will not be retained
   beyond the duration of the API call (no 30-day logging).
3. If applicable, an updated Data Processing Addendum (DPA) reflecting
   ZDR terms.

We have already signed your standard Data Processing Addendum dated
[DATUM EINFÜGEN aus deinen Records].

Please let us know what additional information you need from us to process
this request, and what the typical timeline for activation is.

Thank you for your support.

Best regards,
Ben Deschler
Trading Ben Deschler (Sole Proprietor)
Scheibenstr. 2, 76530 Baden-Baden, Germany
kontakt@mrbell.de · +49 176 20690319
```

---

## Anleitung

### Vor dem Senden:

1. **Account-Email einsetzen:** Die Email mit der dein Anthropic-Account angelegt wurde.

2. **Organization ID finden:**
   - Login bei console.anthropic.com
   - Settings → Organization → "Organization ID" kopieren (sieht aus wie `org_xxxxxxxxxxxx`)

3. **Datum des AVV einsetzen:**
   - Wann hast du den DPA mit Anthropic abgeschlossen?
   - Falls unsicher: schreib einfach "previously signed via your standard Trust Center process"

### Nach dem Senden:

- Anthropic antwortet typischerweise innerhalb von 5-14 Werktagen.
- Sie schicken meist ein Formular oder zusätzliche Fragen.
- ZDR ist in der Regel verfügbar für API-Kunden mit signiertem DPA.
- Bei größeren Anfragen kann Anthropic einen separaten ZDR-Vertrag verlangen.

### Was nach Aktivierung passiert:

- Alle API-Calls werden ab Aktivierungs-Datum nicht mehr 30 Tage geloggt
- Trust & Safety Monitoring weiterhin in Echtzeit (für Missbrauchsschutz)
- Du bekommst eine schriftliche Bestätigung
- Diese Bestätigung legst du in `dsgvo/avvs/anthropic-zdr-confirmation.pdf` ab

### In Datenschutzerklärung anpassen nach ZDR-Aktivierung:

Aktuell steht (oder sollte stehen):
> "Anthropic loggt API-Inputs zur Missbrauchserkennung 30 Tage."

Nach ZDR ändern auf:
> "Anthropic verarbeitet API-Inputs ausschließlich zur Antwortgenerierung. Eine Speicherung erfolgt nicht (Zero Data Retention vereinbart, Stand: [DATUM])."

---

**Wichtig:** ZDR macht deinen Stack DSGVO-rechtlich deutlich sauberer, ist aber kein vollständiger Ersatz für SCCs (die du eh hast). Es ist ein zusätzlicher Schutz.
