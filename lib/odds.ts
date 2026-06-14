import { MatchOdds } from './types';

const API_KEY = process.env.NEXT_PUBLIC_ODDS_API_KEY;
const BASE_URL = 'https://api.the-odds-api.com/v4';

// Mock odds for all possible score lines - used when no API key is set
const MOCK_COMMON_SCORES: Record<string, number> = {
  '0-0': 8.5,
  '1-0': 7.0,
  '0-1': 8.0,
  '1-1': 6.5,
  '2-0': 8.0,
  '0-2': 10.0,
  '2-1': 8.5,
  '1-2': 10.0,
  '2-2': 14.0,
  '3-0': 14.0,
  '0-3': 18.0,
  '3-1': 17.0,
  '1-3': 22.0,
  '3-2': 22.0,
  '2-3': 28.0,
  '3-3': 40.0,
  '4-0': 26.0,
  '0-4': 34.0,
  '4-1': 34.0,
  '1-4': 45.0,
  '4-2': 50.0,
  '2-4': 67.0,
  '4-3': 80.0,
  '3-4': 100.0,
  '5-0': 67.0,
  '0-5': 100.0,
};

function getMockOdds(fixtureId: string): MatchOdds {
  // Generate slightly varied mock odds based on fixture id hash
  const hash = fixtureId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const variance = (hash % 20) / 100; // 0 to 0.19 variance

  const homeWin = 2.0 + variance * 5;
  const draw = 3.2 + variance * 2;
  const awayWin = 2.8 + variance * 4;

  return {
    fixtureId,
    homeWin: parseFloat(homeWin.toFixed(2)),
    draw: parseFloat(draw.toFixed(2)),
    awayWin: parseFloat(awayWin.toFixed(2)),
    correctScore: MOCK_COMMON_SCORES,
    bookmaker: 'Mock Data',
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchOdds(fixtureId: string, homeTeamName: string, awayTeamName: string): Promise<MatchOdds> {
  if (!API_KEY) {
    return getMockOdds(fixtureId);
  }

  try {
    const res = await fetch(
      `${BASE_URL}/sports/soccer_fifa_world_cup/odds/?apiKey=${API_KEY}&regions=uk&markets=h2h,correct_score&oddsFormat=decimal`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );

    if (!res.ok) {
      console.warn('Odds API error, using mock data');
      return getMockOdds(fixtureId);
    }

    const data = await res.json();

    // Find matching event
    const event = data.find((e: Record<string, unknown>) => {
      const home = (e.home_team as string)?.toLowerCase();
      const away = (e.away_team as string)?.toLowerCase();
      return (
        home?.includes(homeTeamName.toLowerCase().split(' ')[0]) ||
        away?.includes(awayTeamName.toLowerCase().split(' ')[0])
      );
    });

    if (!event) return getMockOdds(fixtureId);

    let homeWin = 2.5, draw = 3.2, awayWin = 3.0;
    const correctScore: Record<string, number> = {};

    for (const bookmaker of (event.bookmakers as Record<string, unknown>[]) || []) {
      for (const market of (bookmaker.markets as Record<string, unknown>[]) || []) {
        if ((market.key as string) === 'h2h') {
          const outcomes = market.outcomes as { name: string; price: number }[];
          homeWin = outcomes.find(o => o.name === event.home_team)?.price ?? homeWin;
          draw = outcomes.find(o => o.name === 'Draw')?.price ?? draw;
          awayWin = outcomes.find(o => o.name === event.away_team)?.price ?? awayWin;
        }
        if ((market.key as string) === 'correct_score') {
          const outcomes = market.outcomes as { name: string; price: number }[];
          for (const o of outcomes) {
            correctScore[o.name] = o.price;
          }
        }
      }
      break; // use first bookmaker
    }

    return {
      fixtureId,
      homeWin,
      draw,
      awayWin,
      correctScore: Object.keys(correctScore).length ? correctScore : MOCK_COMMON_SCORES,
      bookmaker: (event.bookmakers as Record<string, unknown>[])?.[0]?.['title'] as string ?? 'Unknown',
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return getMockOdds(fixtureId);
  }
}

export function getScoreOdds(odds: MatchOdds, home: number, away: number): number | null {
  if (!odds.correctScore) return null;
  const key = `${home}-${away}`;
  return odds.correctScore[key] ?? null;
}

export function getResultOdds(odds: MatchOdds, home: number, away: number): number {
  if (home > away) return odds.homeWin;
  if (home < away) return odds.awayWin;
  return odds.draw;
}
