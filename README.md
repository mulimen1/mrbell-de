# Mr. Bell – Onboarding Website

KI-gestützter WhatsApp-Concierge für mittelständische und kleine deutsche Dienstleister.

**Live:** [mrbell.de](https://mrbell.de)

## Setup

Statische HTML-Site, ohne Build-Pipeline. Wird auf Vercel (Region Frankfurt) gehostet.

```
.
├── index.html          # Hauptseite mit Pricing & Onboarding-Flow
├── impressum.html      # Impressum nach § 5 TMG
├── datenschutz.html    # Datenschutzerklärung (DSGVO Art. 13)
├── agb.html            # Allgemeine Geschäftsbedingungen v3.1
├── widerruf.html       # B2B-Widerrufshinweis
└── vercel.json         # Vercel-Config (Frankfurt + Security-Header)
```

## Pricing-System (v3.1)

| Plan                | Preis        | Mindestlaufzeit | Setup-Refund |
|---------------------|--------------|-----------------|--------------|
| Pioneer 6 Monate    | 49,99 €/Mo   | 6 Monate        | ✅ 99 € nach 6 Mo |
| Pioneer 3 Monate    | 59,99 €/Mo   | 3 Monate        | ❌ |
| Standard            | 69,99 €/Mo   | 1 Monat         | ❌ |
| Geführtes Setup     | 99 € einmalig| –               | – |

## Tech Stack

- **Hosting:** Vercel (Region: `fra1` – Frankfurt)
- **Bot:** n8n + Anthropic Claude Haiku 4.5 + 360dialog (WhatsApp BSP)
- **Storage:** Google Sheets (Master-CRM) + Airtable (Bot-Konfiguration)
- **Payments:** Stripe
- **E-Mail:** Resend
- **Calendar:** Calendly

## Anbieter

Trading Ben Deschler · Scheibenstraße 2 · 76530 Baden-Baden · Deutschland
E-Mail: kontakt@mrbell.de
