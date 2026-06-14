# NOTES.md — AI Handoff Log

> **To any AI reading this (Claude, ChatGPT, Codex, etc.):**
> This file is the shared handoff log. **When you make changes, add an entry at the top of the changelog below.** Include: date, what you changed, what files were touched, and what’s next. This lets the next AI (or human) pick up exactly where you left off without re-reading the whole codebase.

---

## Project: ACCA Battle — WC 2026 Predictor

**Repo:** `eashankaradia/worldcuppredictor`  
**Active branch:** `claude/exciting-franklin-3rgllr`  
**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase (PostgreSQL + Realtime) · The Odds API  
**Deployment:** Not yet deployed — connect to Vercel. See `SUPABASE_SETUP.md` for Supabase setup.

---

## What This App Is

**ACCA Battle** is a multiplayer WC 2026 score prediction game:

- Players enter a username → stored in Supabase `players` table
- Browse 72 group stage fixtures, click a match → predict the exact score
- Odds for the selected scoreline shown live as you adjust the score (The Odds API)
- Submit prediction → stored in Supabase `predictions` table
- Other players’ predictions visible after you’ve submitted (or after kickoff)
- Realtime: when someone submits a prediction, all players on the match page see it live (Supabase Realtime)
- Leaderboard: all players ranked by earned pts (+ max potential), filterable by match or whole tournament
- My Picks page: all your predictions vs actual scores, points breakdown

### Scoring
| Outcome | Points |
|---|---|
| Exact score | 10 |
| Correct result + off by 1 total goal | 8 (3+5) |
| Correct result + off by 2 total goals | 5 (3+2) |
| Correct result only | 3 |
| Off by 1 total goal (wrong result) | 5 |
| Off by 2 total goals (wrong result) | 2 |
| Nothing | 0 |

---

## Architecture

```
app/
  layout.tsx              # Root layout with <NavBar />
  page.tsx                # Match lobby (fixture list with filters)
  match/[id]/page.tsx     # Match detail — prediction form + all players’ picks
  leaderboard/page.tsx    # Tournament leaderboard (filterable by match)
  me/page.tsx             # My predictions vs results
  predictions/page.tsx    # Redirects to /me
  globals.css             # Tailwind base + dark theme

components/
  NavBar.tsx              # Sticky header with nav links + username badge
  UsernameGate.tsx        # Username entry screen (shown if no player in localStorage)
  BattleBoard.tsx         # Old component — not used, safe to delete
  MatchCard.tsx           # Old component — not used
  PredictionForm.tsx      # Old component — not used
  OddsDisplay.tsx         # Old component — not used
  ScoreInput.tsx          # Old component — not used
  BonusSection.tsx        # Old component — not used
  ui/button.tsx           # Old primitive — not used
  ui/card.tsx             # Old primitive — not used
  ui/badge.tsx            # Old primitive — not used

lib/
  supabase.ts             # Supabase client (NEXT_PUBLIC_SUPABASE_URL + ANON_KEY)
  db.ts                   # DB operations: getOrCreatePlayer, upsertPrediction, getPredictionsForFixture, etc.
  results.ts              # Fetch live scores from Odds API /scores/ endpoint (same API key)
  scoring.ts              # calcPoints(), MAX_PTS=10, pointsLabel()
  fixtures.ts             # 72 WC 2026 group stage fixtures — teams are plausible placeholders
  odds.ts                 # Fetch odds from Odds API (unchanged from original)
  types.ts                # All TypeScript types
  storage.ts              # localStorage: player identity only (prediction storage is Supabase)
  utils.ts                # cn() helper

supabase/
  schema.sql              # Run this in Supabase SQL Editor to set up the database

SUPABASE_SETUP.md         # Step-by-step Supabase + Vercel setup guide
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ODDS_API_KEY=your-odds-api-key   # same key for odds + scores
```

---

## Key Data Flows

1. **Username entry** → `getOrCreatePlayer(username)` → `players` table → stored in `localStorage` as `acca_player_v2`
2. **Match prediction** → `upsertPrediction(playerId, fixtureId, homeScore, awayScore)` → `predictions` table
3. **Score changes** → React state → odds cache lookup → live display updates
4. **Realtime** → Supabase channel on `predictions` filtered by `fixture_id` → triggers `load()` refresh
5. **Results** → `fetchResults()` calls Odds API `/scores/?daysFrom=3` → matches to fixtures by team name
6. **Leaderboard** → `getAllPredictions()` + `fetchResults()` → `useMemo` computes rows per player

---

## Known Issues / TODO

- [ ] **Scores endpoint limited to last 3 days** — Odds API free tier only returns 3 days of scores. Matches older than 3 days won’t show results. Could cache results in Supabase or upgrade API plan.
- [ ] **Team name matching** — Odds API team names may not match fixture names exactly. `lib/results.ts` does basic normalisation but may miss some teams.
- [ ] **Fixture data is placeholder** — WC 2026 full qualified team list wasn’t confirmed at build time. Update `lib/fixtures.ts`.
- [ ] **Old components** — `BattleBoard`, `MatchCard`, `PredictionForm`, `OddsDisplay`, `ScoreInput`, `BonusSection`, `ui/*` are unused but kept so build doesn’t break. Safe to delete.
- [ ] **No admin/results entry** — Results come from Odds API only. If API doesn’t cover a match, results won’t show.
- [ ] **Not deployed yet** — See `SUPABASE_SETUP.md`.

---

## Changelog

### 2026-06-14 — Claude (claude-sonnet-4-6) — v3: Full multiplayer rebuild
- **Supabase added**: `players` + `predictions` tables, open RLS policies, realtime enabled
- **Per-match predictions**: Each match has its own prediction form. No more ACCA slip across multiple matches.
- **Multiplayer**: All players’ predictions visible after you’ve submitted (or after kickoff)
- **Realtime**: Match page subscribes to Supabase Realtime — new predictions appear live
- **Live results**: `lib/results.ts` fetches scores from The Odds API `/scores/` endpoint (same key)
- **Leaderboard** (`/leaderboard`): Ranked table with earned pts + max potential, filterable by match
- **My Picks** (`/me`): All your predictions vs actual scores with points breakdown
- **NavBar**: Sticky header with Fixtures / Board / Me links + username badge
- **Username gate**: Shows on any page if no player stored; creates/fetches player in Supabase
- **Scoring**: Exact 10, correct result 3, off-by-1 total 5, off-by-2 total 2 (stackable). No yellow cards.
- **Files changed**: almost everything — see Architecture section above for current state
- **New files**: `lib/supabase.ts`, `lib/db.ts`, `lib/results.ts`, `components/NavBar.tsx`, `components/UsernameGate.tsx`, `supabase/schema.sql`, `SUPABASE_SETUP.md`
- **Unchanged**: `lib/fixtures.ts`, `lib/odds.ts`, `lib/utils.ts`, config files

### 2026-06-14 — Claude (claude-sonnet-4-6) — v2: ACCA Battle redesign
- Pivoted from individual match predictions to ACCA slip-style game
- Added player name entry, ACCA slip panel, battle board
- (This version is superseded by v3 above)

### 2026-06-14 — Claude (claude-sonnet-4-6) — v1: Initial build
- Created entire Next.js app from scratch (repo was empty)
- 72 WC 2026 group stage fixtures, The Odds API for odds, scoring logic

---

*Add your entry above this line when you make changes.*
