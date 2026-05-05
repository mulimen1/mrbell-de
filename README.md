# DSGVO-Compliance-Paket — Mr. Bell

**Stand:** 05.05.2026

Dieses Paket enthält alle DSGVO-Pflichtdokumente die du für Mr. Bell brauchst, plus konkrete Action-Items.

---

## 📋 Was hier drin ist

1. **`toms.md`** — Technisch-Organisatorische Maßnahmen (Art. 32 DSGVO)
2. **`verarbeitungsverzeichnis.md`** — Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)
3. **`datenpannen-plan.md`** — Reaktionsplan bei Datenleaks (Art. 33/34 DSGVO)
4. **`anthropic-zdr-email-template.md`** — Vorlage für Zero-Data-Retention-Antrag bei Anthropic
5. **`README.md`** — diese Datei

---

## ⚡ Sofort-To-Dos (in dieser Reihenfolge)

### Diese Woche

- [ ] **Anthropic ZDR-Email rausschicken** — Template in `anthropic-zdr-email-template.md`. Vorher: Account-Email + Org-ID einsetzen.
- [ ] **Google Fonts lokal hosten** — Anleitung in `google-fonts-anleitung.md`. Dauert 10 Min.
- [ ] **TOMs als PDF abspeichern** — `toms.md` in Word/Google Doc kopieren, ein PDF generieren, im verschlüsselten Cloud-Speicher ablegen.
- [ ] **Vercel auf EU-Region prüfen:** Vercel Dashboard → Project → Settings → Functions → Region. Falls nicht "Frankfurt fra1" oder "Dublin dub1" → umstellen.

### Nächste Woche

- [ ] **AVVs holen:** Calendly, n8n Cloud, Airtable, Google Workspace
- [ ] **eRecht24 Datenschutz-Lücken fixen** (Telefon, WhatsApp/360dialog, Resend, Google Sheets)
- [ ] **Cookie-Banner aktivieren** — eRecht24 Premium hat ein fertiges Tool
- [ ] **Verarbeitungsverzeichnis + Datenpannen-Plan ausdrucken** und im Ordner ablegen

### Vor Pioneer #1 Live

- [ ] **Endkunden-Disclaimer in n8n-Workflow einbauen:** Beim Erstkontakt einer neuen Telefonnummer wird automatisch eine Nachricht gesendet wie:
  ```
  Hinweis: Diese Konversation wird mit einem KI-Assistenten beantwortet.
  Datenschutz: [Link zu Pioneer-Datenschutzerklärung]
  Anbieter: Mr. Bell · kontakt@mrbell.de
  ```
- [ ] **Telefonnummer-Pseudonymisierung** in n8n: Phone-Number → SHA-256 Hash vor Anthropic-Call
- [ ] **Hiscox/exali IT-Versicherung neu abschließen** (war 04.05. widerrufen)

---

## ❓ Wann muss eine Datenpanne gemeldet werden?

Faustregel: **Wenn die Daten in falsche Hände geraten könnten und das den Betroffenen schaden kann.**

- ✅ Meldepflicht: Endkunden-Telefonnummern + Konversationen geleakt → Behörde innerhalb 72h
- ✅ Meldepflicht: Pioneer-Kunden-Stripe-Daten kompromittiert → Behörde + Pioneer informieren
- ❌ Keine Meldepflicht: API-Test-Key kurz im Klartext geloggt, sofort revoked, niemand sah ihn

Bei Unsicherheit: Lieber melden als nicht.

---

## 📞 Wichtige Kontakte

**Datenschutzbehörde Baden-Württemberg** (deine zuständige Aufsichtsbehörde)
- Web: baden-wuerttemberg.datenschutz.de
- Email: poststelle@lfdi.bwl.de
- Tel: 0711 / 615541-0
- Adresse: Königstraße 10a, 70173 Stuttgart

**Anthropic Privacy:** privacy@anthropic.com
**Stripe DPA:** über stripe.com/legal/dpa
**Anwalt für IT-Recht (zu suchen):** ab Pioneer #5

---

## 🔄 Wartung

- TOMs jährlich überprüfen (oder bei wesentlichen Stack-Änderungen)
- Verarbeitungsverzeichnis bei jedem neuen Tool/Service erweitern
- Datenpannen-Plan jährlich auf Aktualität prüfen
- Bei Mitarbeiteraufnahme: TOMs erweitern um Rollentrennung

---

**Letzte Aktualisierung:** 05.05.2026
**Verantwortlicher:** Ben Deschler · kontakt@mrbell.de
