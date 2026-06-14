# Supabase Setup

## 1. Create a free project
Go to [supabase.com](https://supabase.com) → New Project. Free tier is fine.

## 2. Run the schema
In your Supabase project → **SQL Editor** → paste `supabase/schema.sql` → **Run**.

## 3. Get your keys
**Settings → API**:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Add to `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Same Odds API key used for odds + live scores
NEXT_PUBLIC_ODDS_API_KEY=your-odds-api-key
```

## 5. Deploy on Vercel
Add the same 3 env vars under **Settings → Environment Variables**.

That’s it — the game is live.
