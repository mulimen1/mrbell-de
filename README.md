# 🔔 Mr. Bell Onboarding Website

Premium Onboarding-Flow für Mr. Bell WhatsApp Bot

## 🚀 Features

✅ Premium Design (mrbell.de Level)  
✅ Animierter WhatsApp Chat Mockup  
✅ Google Sheets Dashboard Preview  
✅ Trust Badges (SSL, DSGVO, Made in Germany)  
✅ Multi-Step Form (16 Steps)  
✅ Progress Bar  
✅ Responsive (Mobile + Desktop)  
✅ Stripe Payment Integration (ready)  

## 🛠 Tech Stack

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Framer Motion (Animations)
- Lucide Icons

## 📦 Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy auf Vercel

### Option 1: Automatisch mit Claude in Chrome

1. Sage Claude in Chrome: "Deploy this to Vercel"
2. Fertig! 🎉

### Option 2: Manuell

1. Push Code zu GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Mr. Bell Onboarding"
git remote add origin [YOUR_GITHUB_REPO]
git push -u origin main
```

2. Gehe zu [vercel.com](https://vercel.com)
3. "New Project" → GitHub Repo auswählen
4. Deploy! 🚀

## 🔧 Domain Setup (onboarding.mrbell.de)

1. In Vercel: Settings → Domains
2. Add Domain: `onboarding.mrbell.de`
3. DNS bei United Domains:
   - Type: CNAME
   - Name: onboarding
   - Value: cname.vercel-dns.com

## 📂 Project Structure

```
mrbell-onboarding/
├── app/
│   ├── page.tsx              # Main onboarding orchestrator
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Step1Welcome.tsx      # Welcome screen mit animations
│   ├── Step2BusinessName.tsx # Business name input
│   ├── Step3Industry.tsx     # Industry dropdown
│   ├── WhatsAppMockup.tsx    # Animated WhatsApp chat
│   ├── SheetsMockup.tsx      # Google Sheets dashboard
│   ├── TrustBadges.tsx       # Trust badges (SSL, DSGVO, etc)
│   └── ProgressBar.tsx       # Progress indicator
├── public/
│   └── mrbell_glocke_2.png   # Mr. Bell logo
└── package.json
```

## 🎨 Branding

- Farben: Weiß (#FFFFFF) + Grün (#10B981)
- Fonts: Playfair Display (Headlines) + Inter (Body)
- Logo: Mr. Bell Glocke (Gold)

## ✅ TODO - Remaining Steps

- [ ] Step 4: WhatsApp Number
- [ ] Step 5: Email
- [ ] Step 6: Website (optional)
- [ ] Step 7: API Check
- [ ] Step 7B: API Info (if no API)
- [ ] Step 8: Opening Hours
- [ ] Step 9: Services
- [ ] Step 10: FAQ
- [ ] Step 11: Address
- [ ] Step 12: API Key (1st entry)
- [ ] Step 13: API Key (2nd entry - validation)
- [ ] Step 14: Dashboard Info
- [ ] Step 15: Payment (Stripe)
- [ ] Step 16: Thank You

## 📧 Support

support@mrbell.de  
WhatsApp: +49 151 4288 6513

---

Made with ❤️ in Germany 🇩🇪
