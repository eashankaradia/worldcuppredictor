// ─── Core ────────────────────────────────────────────────────────────────────
export interface Team {
  name: string;
  code: string;
  flag: string;
  group: string;
}

export interface Fixture {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  venue: string;
  stage: 'Group' | 'R32' | 'R16' | 'QF' | 'SF' | 'F';
  group?: string;
}

export interface MatchOdds {
  fixtureId: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  correctScore?: Record<string, number>;
  bookmaker: string;
  lastUpdated: string;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  completed: boolean;
}

export type MatchStatus = 'upcoming' | 'live' | 'finished';

// ─── Database ─────────────────────────────────────────────────────────────
export interface Player {
  id: string;
  username: string;
  created_at: string;
}

export interface DBPrediction {
  id: string;
  player_id: string;
  fixture_id: string;
  home_score: number;
  away_score: number;
  submitted_at: string;
  players?: { username: string };
}

// ─── Legacy stubs (keeps old component files compiling) ───────────────────────────
export interface ScorePrediction { home: number; away: number; }
export interface GoalscorerPrediction { team: 'home' | 'away'; playerName: string; }
export interface YellowCardPrediction { team: 'home' | 'away'; playerName: string; }
export interface MatchPrediction {
  fixtureId: string; score: ScorePrediction;
  goalscorers: GoalscorerPrediction[]; yellowCards: YellowCardPrediction[]; submittedAt: string;
}
export interface SlipPick { fixtureId: string; homeScore: number; awayScore: number; }
export interface PlayerSlip { playerName: string; picks: SlipPick[]; locked: boolean; lockedAt?: string; }
export interface ScoreBreakdown { base: number; goalscorers: number; yellowCards: number; total: number; details: string[]; }
