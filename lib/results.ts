import { MatchResult, Fixture } from './types';
import { ALL_FIXTURES } from './fixtures';

const API_KEY = process.env.NEXT_PUBLIC_ODDS_API_KEY;

interface OddsScoreEvent {
  id: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  completed: boolean;
  scores: { name: string; score: string | null }[] | null;
}

function norm(s: string): string {
  return s.toLowerCase()
    .replace(/united states of america/g, 'united states')
    .replace(/\busa\b/g, 'united states')
    .replace(/ivory coast/g, "côte d'ivoire")
    .replace(/republic of/g, '')
    .trim();
}

function teamsMatch(apiName: string, fixtureName: string): boolean {
  const a = norm(apiName);
  const b = norm(fixtureName);
  return a === b || a.startsWith(b.split(' ')[0]) || b.startsWith(a.split(' ')[0]);
}

export async function fetchResults(): Promise<Record<string, MatchResult>> {
  if (!API_KEY) return {};
  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/scores/?apiKey=${API_KEY}&daysFrom=3`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return {};
    const events: OddsScoreEvent[] = await res.json();
    const results: Record<string, MatchResult> = {};

    for (const event of events) {
      if (!event.scores) continue;
      const fixture = ALL_FIXTURES.find(f =>
        teamsMatch(event.home_team, f.homeTeam.name) &&
        teamsMatch(event.away_team, f.awayTeam.name)
      );
      if (!fixture) continue;
      const h = event.scores.find(s => teamsMatch(s.name, fixture.homeTeam.name));
      const a = event.scores.find(s => teamsMatch(s.name, fixture.awayTeam.name));
      if (h?.score != null && a?.score != null) {
        results[fixture.id] = {
          homeScore: parseInt(h.score),
          awayScore: parseInt(a.score),
          completed: event.completed,
        };
      }
    }
    return results;
  } catch {
    return {};
  }
}

export function getMatchStatus(fixture: Fixture, result?: MatchResult): 'upcoming' | 'live' | 'finished' {
  if (result?.completed) return 'finished';
  const kickoff = new Date(fixture.date).getTime();
  const now = Date.now();
  if (now < kickoff) return 'upcoming';
  if (now < kickoff + 110 * 60 * 1000) return 'live';
  return 'finished';
}
