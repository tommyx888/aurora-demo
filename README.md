# 🚀 Digital Evolution — Interaktívne Demo

> **Komplexný HR & Employee Experience Platform Demo**
> Postavené pre Digital Evolution s.r.o. ako predajný nástroj a showcase.

## 🎯 Čo to je?

Interaktívne demo HR/Employee platformy, ktoré ukazuje potenciálnym klientom, čo všetko vie Digital Evolution postaviť. Klient si môže **bez registrácie** vyskúšať:

### 🔥 Hero moduly (plne interaktívne)
1. **🤖 Onboarding s AI Buddy "Eva"** — sprevádza nového zamestnanca
2. **🌡️ Skill Heatmap** — vizualizácia kompetencií tímu s AI insights
3. **📊 Admin Dashboard** — štatistiky, grafy, real-time metriky
4. **🎯 Recruiting Tracker** — kanban pipeline pre kandidátov

### ✨ Stub moduly (krásne, klikateľné)
5. **📝 Žiadanky & Schvaľovanie**
6. **🌳 Interaktívny Orgchart**
7. **💬 Pulse Surveys**
8. **📰 Firemný Newsletter**
9. **📅 Events & Birthdays**

## 🎨 Theme Switcher
3 vizuálne štýly — klient si môže prepínať:
- **Modern Mint** (čistý minimalizmus, Linear/Vercel feel)
- **Playful Coral** (hravý, Notion/Slack feel)
- **Corporate Navy** (profi, BambooHR/Workday feel)
- **🪄 Tvoj branding** — nahraj logo a auto-paleta sa vygeneruje

## 🪄 Branding Studio (KILLER FEATURE)

Klient nahrá svoje logo (drag & drop) a:
- **AI extrahuje 5-6 dominantných farieb** (k-means na canvas)
- **Vygeneruje plnú paletu** (primary, secondary, accenty, light/dark variants)
- **Aplikuje na celé demo za 1 sekundu** — sidebar logo, tlačidlá, badges
- **Ukáže jemné CTA** "Páči sa ti to v tvojich farbách? Mám záujem"
- **Branding sa zachová** v localStorage (klient sa môže vrátiť)

Ako to predáva: klient počas pitch meetingu vidí <em>svoj</em> logo + svoje farby na celom HR systéme. Wow moment.

## 🚀 Spustenie lokálne

```bash
# 1. Inštalácia závislostí
npm install

# 2. Spustenie dev servera
npm run dev

# 3. Otvor v prehliadači
# http://localhost:5173
```

## 🤖 AI Chatbot (voliteľné)

Demo má 2 režimy AI chatbota:
- **Fake mode** (default) — predprogramované odpovede, funguje hneď
- **Live mode** — reálne Claude API odpovede

Pre Live mode pridaj API key:
```bash
# Vytvor .env.local
echo "VITE_ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

## 📦 Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + custom design system
- **Framer Motion** — animácie
- **Recharts** — grafy
- **Lucide Icons**
- **Anthropic Claude API** (voliteľne)

## 🌐 Deploy na Vercel

```bash
npm run build
# Drag & drop /dist do Vercel
# alebo: vercel --prod
```

Custom doména: `demo.digitalevolution.sk`

## 💰 Pitch Script

Pozri `PITCH_SCRIPT.md` pre návod, čo hovoriť klientovi pri predvádzaní každého modulu.

## 📊 Lead Generation

Každý "Stub" modul má tlačidlo **"Chcem to v mojej firme"** ktoré otvorí lead capture form. Leady sa ukladajú do localStorage (v produkcii: Supabase/Resend).

## 🥚 Easter Eggs

- **Konami code** (↑↑↓↓←→←→BA) → konfety + secret message
- **5x klik na logo** → "Made with ❤️ by Digital Evolution"
- **Ctrl+K** → Command palette
- **Tlačidlo "Zničiť firmu"** v admin settings (vtipný 404)

---

**Built by Tomáš Šurin · Digital Evolution s.r.o.**
🔗 [digitalevolution.sk](https://digitalevolution.sk)
