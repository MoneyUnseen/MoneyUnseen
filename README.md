# MoneyUnseen - Gamified Subscription Tracker

> Track your subscriptions. Earn XP. See what your money could buy.

## 🎮 What This Is

A privacy-first, gamified subscription tracker that helps you:
- Track all your subscriptions in one place
- Earn XP for smart money decisions
- Build streaks by staying subscription-free
- Visualize what you could do with saved money

**No bank login required. Your data stays on your device.**

## ✨ Features

### Core Tracking
- Add subscriptions manually (name, cost, frequency, category)
- Automatic monthly cost calculations
- Active vs. canceled subscription tracking
- Beautiful purple gradient UI

### Gamification
- **XP System**: Earn points for every action
  - Add subscription: +10 XP
  - Cancel subscription: +50 XP (+ bonus for expensive ones)
  - Monthly review: +25 XP
- **Level System**: Progress from "Subscription Apprentice" to "MoneyUnseen Legend"
- **Streak Tracking**: Days without new subscriptions
- **Confetti Celebrations**: Visual rewards for milestones

### Goal Visualization
- Choose your savings goal (vacation, investment, family)
- See how long until you reach your goal
- Track yearly savings potential
- Visual progress bars and stats

## 🛠️ Tech Stack

- **React 18** + **TypeScript** - Type-safe component architecture
- **Tailwind CSS** - Utility-first styling
- **IndexedDB** - Browser-based data storage (privacy-first)
- **Vite** - Lightning-fast dev server & build tool

## 📦 Getting Started

### Prerequisites
- Node.js 18+ (download from [nodejs.org](https://nodejs.org))
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - Navigate to `http://localhost:3000`
   - App will reload on changes

### Build for Production

```bash
npm run build
```

Output will be in `dist/` folder, ready to deploy.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite
4. Deploy!

### Deploy to Netlify

1. Push code to GitHub
2. Import on [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`

## 📊 Data Storage

**Privacy-First Design:**
- All data stored in browser's IndexedDB
- No server, no cloud, no accounts required
- Data never leaves your device
- Export option available (coming soon)

**What's stored:**
- Subscriptions list
- User profile (XP, level, goals)
- XP action history

**Note:** Clearing browser data will delete your subscriptions. Use export feature before clearing.

## 🎯 User Journey

### First Time User
1. App loads with default goal (vacation)
2. Add first 3 subscriptions
3. See total monthly spend
4. Visualize what savings could buy
5. Earn +30 XP

### Returning User
1. View updated XP and streak
2. Review subscriptions
3. Cancel unused ones
4. Earn XP and level up
5. Track progress to goal

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core subscription tracking
- ✅ XP system
- ✅ Streak counter
- ✅ Goal visualization
- ✅ Confetti celebrations

### Phase 2 (Next 2 weeks)
- [ ] AI pattern recognition
- [ ] Monthly review prompts
- [ ] Alternative cost suggestions
- [ ] Export to CSV
- [ ] Premium unlock (€4.99)

### Phase 3 (Month 2)
- [ ] Monthly savings reports
- [ ] Advanced analytics
- [ ] Custom categories
- [ ] Email reminders
- [ ] Social sharing

## 🎨 Customization

### Change Brand Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Your custom purple shades
  }
}
```

### Modify XP Values

Edit `src/types/index.ts`:
```typescript
export const XP_VALUES = {
  addSubscription: 10,  // Change these
  cancelSubscription: 50,
  // ...
}
```

## 🐛 Troubleshooting

**"Module not found" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**IndexedDB errors:**
- Check browser console
- Clear browser data and retry
- IndexedDB not supported in private/incognito mode

**Build fails:**
```bash
npm run build -- --debug
```

## 📝 License

Private - All rights reserved (for now)

## 🤝 Contributing

This is a solo project for now, but feedback welcome!

## 📧 Contact

- Email: hello@moneyunseen.com
- Instagram: @moneyunseen
- Facebook: /moneyunseen

---

**Built with 💜 to help people see their money clearly.**
