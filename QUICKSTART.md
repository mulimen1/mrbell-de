# ⚡ Schnellstart — Repo neu hochladen & Stripe-Test

Diese Anleitung führt dich durch den kompletten Reset und den ersten echten Stripe-Test-Kauf.

---

## 1. GitHub Repo neu pushen

```bash
# Im aktuellen Repo-Verzeichnis (mulimen1/mrbell-de)
cd ~/path/to/mrbell-de

# Alle alten Files löschen (vorsicht!)
git rm -rf .

# Neue Files aus dem Bundle kopieren
# (vom heruntergeladenen Bundle ins Repo)
cp -r /pfad/zum/bundle/* .

# Commit + Push
git add .
git commit -m "Clean reset: static + serverless setup" 
git push origin main --force
```

---

## 2. Vercel-Settings prüfen

In Vercel Project Settings:

### Build & Development
- **Framework Preset:** "Other" (NICHT Next.js)
- **Build Command:** leer
- **Output Directory:** `.`
- **Install Command:** `npm install`
- **Node Version:** 22.x (oder 20.x)

### Functions Region
- Settings → Functions → **Frankfurt (fra1)** auswählen
- (vercel.json setzt das schon, aber doppelt prüfen)

### Domains
- `mrbell.de` und `www.mrbell.de` müssen aktiv sein

---

## 3. Environment Variables in Vercel

Settings → Environment Variables → für **Production + Preview + Development**:

| Variable | Wert | Wo finden? |
|----------|------|-----------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Dashboard → Developers → API Keys → Secret key (**TEST MODE!**) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Nach Webhook-Setup in Schritt 4 |
| `ANTHROPIC_API_KEY` | dein "websitekey" | Anthropic Console → API Keys |
| `N8N_PROVISION_WEBHOOK_URL` | (optional) | Aus n8n Webhook-Trigger-Node URL kopieren |

**Nach Setzen → Redeploy triggern!**

---

## 4. Stripe Webhook anlegen

Stripe Dashboard (TEST-MODUS!) → Developers → Webhooks → **Add endpoint**

- **Endpoint URL:** `https://mrbell.de/api/stripe-webhook`
- **API Version:** Latest
- **Events to send:**
  - ✅ `checkout.session.completed`
  - ✅ `customer.subscription.created`
  - ✅ `customer.subscription.updated`
  - ✅ `customer.subscription.deleted`
  - ✅ `invoice.paid`
  - ✅ `invoice.payment_failed`
- **Klick "Add endpoint"**
- Auf der Detail-Seite des Webhooks: **"Reveal Signing Secret"** → kopieren
- In Vercel als `STRIPE_WEBHOOK_SECRET` einsetzen → **Redeploy**

---

## 5. Erster Test-Durchlauf

### Test A: 99€ Geführtes Setup

1. Auf `https://mrbell.de` gehen
2. Hero-CTA klicken → Bell-Chat öffnet sich
3. Bot durchklicken bis "Geführtes Setup gewünscht"
4. Calendly-Termin wählen → Email eingeben (z.B. `test@example.com`)
5. Code eingeben (Demo-Code: `123456`)
6. Auf der Stripe-Pay-Seite: **"99€ jetzt zahlen"** klicken
7. → Du wirst zu `checkout.stripe.com` weitergeleitet
8. Test-Karte eingeben: **`4242 4242 4242 4242`**, MM/YY beliebig in Zukunft, CVC `123`
9. AGB akzeptieren → Bezahlen
10. → Redirect zu `https://mrbell.de/erfolg.html?session_id=...&plan=setup_only`

**Was du in Stripe Dashboard sehen solltest:**
- Payments → Eine erfolgreiche 99€-Zahlung
- Customers → Neuer Kunde mit der Test-Email
- Invoices → Eine Rechnung
- Webhooks → `checkout.session.completed` Event mit Status 200

### Test B: Pioneer 6 Monate (49,99€/Mo Subscription)

1. Auf `https://mrbell.de` → Bundle-Builder → Pioneer 6 Monate auswählen
2. Onboarding-Flow durchklicken bis "Sichere Zahlung"
3. AGB-Checkbox setzen → "Sichere Zahlung" klicken
4. → Stripe Checkout
5. Test-Karte `4242 4242 4242 4242`
6. Bezahlen
7. → Redirect zu `erfolg.html`

**Was du sehen solltest:**
- Stripe Dashboard → Subscriptions → Eine aktive Pioneer-6-Subscription mit 5 Tagen Trial
- Customer → metadata: `plan=pioneer_6`, `companyName=...`

---

## 6. Echtgeld-Live-Schalten (später!)

Erst nach erfolgreichem Sandbox-Test:

1. Stripe Dashboard → **Toggle "Test mode" → "Live mode"**
2. Live-API-Keys aus Stripe → Vercel ENV updaten:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
3. **Live-Webhook neu anlegen** (separater Endpoint im Live-Modus!)
   - URL: `https://mrbell.de/api/stripe-webhook`
   - Events: gleiche 6 wie oben
   - Live-Webhook-Signing-Secret → Vercel ENV `STRIPE_WEBHOOK_SECRET` updaten
4. **Live-Price-IDs** anlegen (gleiche 4 Produkte, neue IDs im Live-Modus)
5. Im Code in `api/stripe-checkout.ts` Zeile 18-23 die `PRICE_IDS` durch die Live-IDs ersetzen
6. Redeploy

---

## 🐛 Wenn was nicht klappt

### "Unable to verify signature" im Webhook
- `STRIPE_WEBHOOK_SECRET` falsch oder von anderem Webhook
- Webhook im richtigen Modus (Test vs Live) prüfen

### "Stripe Checkout failed: STRIPE_SECRET_KEY fehlt"
- ENV Variable in Vercel nicht gesetzt → Settings → Environment Variables
- Nach Setzen muss neu deployed werden

### 404 nach `git push`
- Vercel Project Settings → Build & Development Settings:
  - Framework Preset = "Other"
  - Output Directory = `.`
- vercel.json muss `"outputDirectory": "."` haben

### "Keine Email" beim Stripe-Click
- Bei Pioneer-Test: Email-Schritt im Onboarding nicht ausgefüllt
- Bei guided 99€: Calendly-Email muss vorhanden sein

---

## 📊 Was im Webhook-Handler passiert (zur Info)

Bei `checkout.session.completed`:
1. Wenn `plan = setup_only` → Customer-Metadata setzen mit Refund-Eligibility-Tracking
2. Wenn `plan = pioneer_6` UND vorheriger setup_only innerhalb 30 Tagen → "Refund-eligible" markieren
3. n8n-Webhook triggern für Auto-Provisioning des n8n-Workflows + 360dialog-Setup

Bei `customer.subscription.deleted`:
1. Wenn Pioneer-6 vor 6 Monaten gekündigt → Refund-Eligibility entfernen

---

**Status nach erfolgreicher Stripe-Sandbox-Tests:**
- ✅ Frontend ruft Backend
- ✅ Backend erstellt Stripe-Sessions
- ✅ Stripe-Hosted-Checkout funktioniert
- ✅ Erfolgs-/Abbruch-Pages
- ✅ Webhook-Events kommen an

→ Bereit für Live-Schaltung
