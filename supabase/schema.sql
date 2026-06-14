-- ACCA Battle WC 2026 — Supabase Schema
-- Paste this into your Supabase SQL Editor and run it.

create extension if not exists "uuid-ossp";

-- Players
create table if not exists players (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  created_at timestamptz default now()
);

-- Predictions (one per player per fixture)
create table if not exists predictions (
  id uuid default uuid_generate_v4() primary key,
  player_id uuid references players(id) on delete cascade not null,
  fixture_id text not null,
  home_score integer not null check (home_score >= 0 and home_score <= 20),
  away_score integer not null check (away_score >= 0 and away_score <= 20),
  submitted_at timestamptz default now(),
  unique(player_id, fixture_id)
);

create index if not exists predictions_fixture_idx on predictions(fixture_id);
create index if not exists predictions_player_idx on predictions(player_id);

-- Row Level Security (open for the game — no auth needed)
alter table players enable row level security;
alter table predictions enable row level security;

drop policy if exists "public select players" on players;
drop policy if exists "public insert players" on players;
drop policy if exists "public select predictions" on predictions;
drop policy if exists "public insert predictions" on predictions;
drop policy if exists "public update predictions" on predictions;

create policy "public select players"     on players     for select to anon using (true);
create policy "public insert players"     on players     for insert to anon with check (true);
create policy "public select predictions" on predictions for select to anon using (true);
create policy "public insert predictions" on predictions for insert to anon with check (true);
create policy "public update predictions" on predictions for update to anon using (true);

-- Enable realtime on predictions table
alter publication supabase_realtime add table predictions;
