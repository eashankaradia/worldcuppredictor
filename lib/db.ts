import { supabase } from './supabase';
import { Player, DBPrediction } from './types';

export async function getOrCreatePlayer(username: string): Promise<Player> {
  const { data: existing } = await supabase
    .from('players')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (existing) return existing as Player;

  const { data, error } = await supabase
    .from('players')
    .insert({ username })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Player;
}

export async function upsertPrediction(
  playerId: string,
  fixtureId: string,
  homeScore: number,
  awayScore: number,
): Promise<DBPrediction> {
  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      { player_id: playerId, fixture_id: fixtureId, home_score: homeScore, away_score: awayScore },
      { onConflict: 'player_id,fixture_id' },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DBPrediction;
}

export async function getPredictionsForFixture(fixtureId: string): Promise<DBPrediction[]> {
  const { data } = await supabase
    .from('predictions')
    .select('*, players(username)')
    .eq('fixture_id', fixtureId)
    .order('submitted_at');
  return (data ?? []) as DBPrediction[];
}

export async function getMyPredictions(playerId: string): Promise<DBPrediction[]> {
  const { data } = await supabase
    .from('predictions')
    .select('*')
    .eq('player_id', playerId)
    .order('submitted_at');
  return (data ?? []) as DBPrediction[];
}

export async function getAllPredictions(): Promise<DBPrediction[]> {
  const { data } = await supabase
    .from('predictions')
    .select('*, players(username)');
  return (data ?? []) as DBPrediction[];
}
