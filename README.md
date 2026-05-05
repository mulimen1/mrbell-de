# Mr. Bell — Onboarding-Website

WhatsApp AI-Assistent für deutsche kleine und mittlere Dienstleistungsunternehmen.

**Live:** https://mrbell.de
**Stack:** Static HTML + Tailwind CDN · Vercel Serverless Functions · Stripe · Anthropic Claude · n8n Cloud · 360dialog

---

## 📁 Repo-Struktur

```
mrbell-de/
├── index.html              # Hauptseite (Welcome + Onboarding-Flow)
├── erfolg.html             # Stripe Success Page
├── abbruch.html            # Stripe Cancel Page
├── api/
│   ├── stripe-checkout.ts  # Erstellt Stripe Checkout Sessions
│   ├── stripe-webhook.ts   # Verarbeitet Stripe Events
│   └── test-chat.ts        # Demo-Chat-API (Claude Haiku 4.5)
├── fonts/                  # Lokale WOFF2-Fonts (DSGVO-konform)
├── dsgvo/                  # Datenschutz-Dokumentation
├── vercel.json             # Vercel Config (EU-Region, Headers)
├── package.json            # Stripe + Anthropic SDK Dependencies
└── .gitignore
```

---

## 🚀 Erstes Deploy

### 1. Repo nach GitHub pushen

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:mulimen1/mrbell-de.git
git push -u origin main
```

### 2. Vercel verbinden

1. [vercel.com/new](https://vercel.com/new) → Import `mulimen1/mrbell-de`
2. **Framework Preset:** "Other" (NICHT Next.js!)
3. **Build Command:** leer lassen
4. **Output Directory:** `.` (root)
5. **Install Command:** `npm install`

### 3. Environment Variables setzen

In Vercel Project Settings → Environment Variables (für **Production + Preview + Development**):

| Variable | Wert | Zweck |
|----------|------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_...` (Sandbox) bzw. `sk_live_...` | Stripe-API |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook-Signatur |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (Key "websitekey") | Test-Chat-API |
| `N8N_PROVISION_WEBHOOK_URL` | n8n Webhook | Auto-Provisioning nach Kauf |

### 4. Stripe Webhook anlegen

1. Stripe Dashboard → Developers → Webhooks → "Add endpoint"
2. **URL:** `https://mrbell.de/api/stripe-webhook`
3. **Events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Signing Secret kopieren → in Vercel als `STRIPE_WEBHOOK_SECRET`

### 5. Custom Domain verbinden

In Vercel Project → Settings → Domains → `mrbell.de` hinzufügen.

---

## 💰 Pricing & Stripe Setup

### Aktive Stripe Products & Prices (Sandbox)

| Plan | Preis | Price-ID | Mindestlaufzeit |
|------|-------|----------|-----------------|
| Pioneer 6 Mo | 49,99€/Mo | `price_1TTjRbQ4E1Gs5uQEEwn0Um4o` | 6 Monate |
| Pioneer 3 Mo | 59,99€/Mo | `price_1TTjSlQ4E1Gs5uQELqLHGRea` | 3 Monate |
| Standard | 69,99€/Mo | `price_1TTjTbQ4E1Gs5uQEEASdLuhe` | 0 (monatlich) |
| Geführtes Setup | 99€ einmalig | `price_1TTjWKQ4E1Gs5uQE5gZ8vWrQ` | — |

### 99€ Refund-Logik

99€ Setup wird **erstattet**, wenn:
- Kunde innerhalb **30 Tagen** nach Setup-Kauf einen **Pioneer-6-Plan** abschließt UND
- die **6 Monate komplett erfüllt** wurden.

Refund wird **manuell** ausgelöst über Stripe Dashboard. Webhook trackt nur die Bedingungen in der Customer-Metadata.

---

## 🔤 Lokale Fonts (DSGVO)

`index.html` lädt Fonts via `@font-face` aus `/fonts/`. Die WOFF2-Files müssen **manuell** runtergeladen werden:

1. [gwfh.mranftl.com](https://gwfh.mranftl.com) → "Playfair Display" + "Inter" auswählen
2. Charset: latin · Format: WOFF2 · Folder Prefix: `/fonts/`
3. ZIP entpacken → Files umbenennen nach Schema:
   - `playfair-display-{400,500,600,700,800,900}.woff2`
   - `playfair-display-{400,500}-italic.woff2`
   - `inter-{300,400,500,600,700}.woff2`
4. In `fonts/` ablegen → `git add fonts/ && git push`

Vollständige Anleitung: `dsgvo/google-fonts-anleitung.md`

---

## 🛡️ DSGVO-Compliance

Siehe `dsgvo/` Ordner:
- `README.md` — Übersicht + To-Do-Liste
- `toms.md` — Technisch-Organisatorische Maßnahmen (Art. 32)
- `verarbeitungsverzeichnis.md` — Art. 30 Verzeichnis
- `datenpannen-plan.md` — Reaktionsplan Art. 33/34
- `anthropic-zdr-email-template.md` — Anthropic ZDR-Antrag
- `google-fonts-anleitung.md` — Lokale Font-Hosting

---

## 🧪 Lokales Testen

```bash
# Vercel CLI installieren
npm i -g vercel

# Lokal starten (mit echten ENV-Vars von Vercel)
vercel dev

# Stripe CLI für Webhook-Tests
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

### Stripe Test-Cards

- **Success:** `4242 4242 4242 4242` · CVC `123` · MM/YY beliebig in der Zukunft
- **3D-Secure:** `4000 0027 6000 3184`
- **Declined:** `4000 0000 0000 9995`

---

## 📞 Kontakt & Support

- **Email:** kontakt@mrbell.de
- **Telefon:** +49 176 20690319
- **Verantwortlicher:** Trading Ben Deschler · Scheibenstr. 2, 76530 Baden-Baden

---

**Letzte Aktualisierung:** 05.05.2026
