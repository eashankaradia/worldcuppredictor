# WC 2026 Predictor

A World Cup 2026 prediction game built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **72 group stage fixtures** across 12 groups (A–L), 4 teams each
- **Real betting odds** via [The Odds API](https://the-odds-api.com) — falls back to mock odds when no key is set
- **Live odds display** — updates as you change your score prediction
- **Scoring system**:
  - ✅ Exact score: **+10 pts**
  - ✅ Correct result (win/draw): **+3 pts**
  - 🎯 Off by 1 total goal: **+5 pts**
  - 🎯 Off by 2 total goals: **+2 pts**
- **Optional bonus predictions** (risky!):
  - ⚽ Correct goalscorer: **+5 pts** / Wrong: **-3 pts**
  - 🟨 Correct yellow card: **+3 pts** / Wrong: **-2 pts**
- Predictions saved to **localStorage**

## Setup

```bash
npm install
cp .env.local.example .env.local
# optionally add your Odds API key to .env.local
npm run dev
```

## Odds API

Get a free API key at https://the-odds-api.com (500 requests/month free).

Set it in `.env.local`:
```
NEXT_PUBLIC_ODDS_API_KEY=your_key_here
```

Without a key, the app uses realistic mock odds derived from team strength ratings.
