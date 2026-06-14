export interface Team {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  flag: string; // emoji flag
  group: string;
}

export interface Fixture {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string; // ISO string
  venue: string;
  stage: 'Group' | 'R32' | 'R16' | 'QF' | 'SF' | 'F';
  group?: string;
}

export interface ScorePrediction {
  home: number;
  away: number;
}

export interface GoalscorerPrediction {
  team: 'home' | 'away';
  playerName: string;
}

export interface YellowCardPrediction {
  team: 'home' | 'away';
  playerName: string;
}

export interface MatchPrediction {
  fixtureId: string;
  score: ScorePrediction;
  goalscorers: GoalscorerPrediction[];
  yellowCards: YellowCardPrediction[];
  submittedAt: string;
}

export interface MatchResult {
  fixtureId: string;
  score: ScorePrediction;
  goalscorers: { team: 'home' | 'away'; playerName: string }[];
  yellowCards: { team: 'home' | 'away'; playerName: string }[];
}

export interface ScoreBreakdown {
  base: number;
  goalscorers: number;
  yellowCards: number;
  total: number;
  details: string[];
}

export interface OddsOutcome {
  name: string;
  price: number; // decimal odds
}

export interface MatchOdds {
  fixtureId: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  // correct score odds if available
  correctScore?: Record<string, number>;
  bookmaker: string;
  lastUpdated: string;
}
