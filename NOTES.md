# NOTES.md — AI Handoff Log

> **To any AI reading this (Claude, ChatGPT, Codex, etc.):**
> This file is the shared handoff log. **When you make changes, add an entry at the top of the changelog below.** Include: date, what you changed, what files were touched, and what's next. This lets the next AI (or human) pick up exactly where you left off without re-reading the whole codebase.

---

## Project: ACCA Battle — WC 2026 Predictor

**Repo:** `eashankaradia/worldcuppredictor`
**Active branch:** `claude/exciting-franklin-3rgllr`
**Stack:** Next.js 14 · TypeScript · Tailwind CSS · localStorage (no backend)
**Not yet deployed** — owner needs to connect to Vercel (auto-detects Next.js, no config needed)

---

## What This App Is

**ACCA Battle** is a World Cup 2026 score prediction game styled like a bookmaker's accumulator (ACCA) slip.

- Players enter their name and build a slip by picking WC 2026 matches and predicting exact scores
- As they select scores, live betting odds are shown for that prediction (via The Odds API, with mock fallback)
- When happy with their slip, they lock it in
- The **Battle Board** shows all players' slips side-by-side — whoever has the most accurate predictions wins
- Points: exact score +10, correct result +3, off by 1 goal total +5, off by 2 goals +2

---

## Architecture

```
app/
  layout.tsx          # "ACCA Battle · WC 2026" nav header
  page.tsx            # Main page — name entry → build slip → battle board (tabs)
  match/[id]/page.tsx # Redirects to / (old route, no longer used)
  predictions/page.tsx# Redirects to /
  leaderboard/page.tsx# Redirects to /
  globals.css         # Tailwind base + dark theme vars

components/
  BattleBoard.tsx     # Shows all players' slips ranked, with lock status
  MatchCard.tsx       # Old component (not used in current UI, kept for compat)
  PredictionForm.tsx  # Old component (not used, kept for compat)
  OddsDisplay.tsx     # Old component (not used, kept for compat)
  ScoreInput.tsx      # Old component (not used, kept for compat)
  BonusSection.tsx    # Old component (not used, kept for compat)
  ui/button.tsx       # Button primitive
  ui/card.tsx         # Card primitive
  ui/badge.tsx        # Badge primitive

lib/
  fixtures.ts         # 72 WC 2026 group stage matches (12 groups × 6 matches)
                      # Teams are plausible placeholders — not all officially confirmed
  odds.ts             # Fetches from The Odds API; falls back to mock odds
                      # Env var: NEXT_PUBLIC_ODDS_API_KEY (optional)
  scoring.ts          # Scoring logic (kept from original, not wired to UI yet)
  storage.ts          # localStorage: ACCA battle slips + legacy prediction storage
  types.ts            # All TypeScript types (SlipPick, PlayerSlip + legacy types)
  utils.ts            # cn() helper
```

---

## Key Data Flows

1. **Name entry** → `setCurrentPlayer(name)` → stored in `localStorage` under key `acca_current_player`
2. **Slip** → stored in `localStorage` under `acca_battle_v1` as `Record<playerName, PlayerSlip>`
3. **Adding a match** → calls `fetchOdds()` → caches result in React state (`oddsCache`)
4. **Score change** → updates React state + saves to localStorage; odds display updates from cache
5. **Lock slip** → sets `slip.locked = true` in localStorage; redirects to Battle tab
6. **Battle Board** → reads all slips from `getAllSlips()` on tab switch

---

## Known Issues / TODO

- [ ] **Results not wired up** — scoring logic exists in `lib/scoring.ts` but actual match results aren't fed in yet. Battle board shows slips but no points yet.
- [ ] **No real-time sync** — multiple players need to be on the same device, or each sees only their own slip (localStorage is per-browser). A backend/shared state would fix this.
- [ ] **Fixtures are placeholders** — WC 2026 full qualified team list wasn't confirmed at build time. Edit `lib/fixtures.ts` to update teams.
- [ ] **Old components** — `MatchCard`, `PredictionForm`, `OddsDisplay`, `ScoreInput`, `BonusSection` are unused but kept so the build doesn't break. Can be deleted once confirmed not needed.
- [ ] **No deployment** — owner to connect repo to Vercel.

---

## Changelog

### 2026-06-14 — Claude (claude-sonnet-4-6)
- **Initial build**: Created entire Next.js app from scratch (repo was empty)
- **First version**: Individual prediction game — browse 72 matches, predict scores, bonus goalscorer/yellow card picks
- **Redesign**: Pivoted to ACCA Battle concept on owner's request
  - Replaced multi-page app with single-page tabbed UI
  - Added player name entry screen
  - Added ACCA slip panel with inline score pickers and live odds per pick
  - Added ACCA multiplier display (combined odds across all picks)
  - Added Battle Board showing all players' locked/building slips
  - Rewrote `lib/storage.ts` to support multi-player slip storage
  - Updated `lib/types.ts` with `SlipPick` and `PlayerSlip` types
  - Old routes (`/match/[id]`, `/predictions`, `/leaderboard`) now redirect to `/`
- **Files changed**: `app/layout.tsx`, `app/page.tsx`, `lib/types.ts`, `lib/storage.ts`, `components/BattleBoard.tsx`, redirect pages
- **Files unchanged**: `lib/fixtures.ts`, `lib/odds.ts`, `lib/scoring.ts`, `lib/utils.ts`, all config files

---

*Add your entry above this line when you make changes.*
