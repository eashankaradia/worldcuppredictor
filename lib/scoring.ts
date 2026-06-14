import { MatchPrediction, MatchResult, ScoreBreakdown } from './types';

export function calculateScore(prediction: MatchPrediction, result: MatchResult): ScoreBreakdown {
  const { score: pred, goalscorers: predGoals, yellowCards: predYellows } = prediction;
  const { score: actual, goalscorers: actualGoals, yellowCards: actualYellows } = result;

  const details: string[] = [];
  let base = 0;

  if (pred.home === actual.home && pred.away === actual.away) {
    base = 10;
    details.push('✅ Exact score! +10 pts');
  } else {
    const predResult = getResult(pred);
    const actualResult = getResult(actual);
    const totalDiff = Math.abs((pred.home + pred.away) - (actual.home + actual.away));
    const goalDiff = Math.abs((pred.home - pred.away) - (actual.home - actual.away));

    if (predResult === actualResult) {
      base += 3;
      details.push('✅ Correct result! +3 pts');
    }

    if (totalDiff === 1) {
      base += 5;
      details.push('🎯 Off by 1 goal total! +5 pts');
    } else if (totalDiff === 2) {
      base += 2;
      details.push('🎯 Off by 2 goals total! +2 pts');
    }
  }

  let goalscorersPoints = 0;
  for (const pg of predGoals) {
    const match = actualGoals.find(
      ag => ag.team === pg.team && ag.playerName.toLowerCase() === pg.playerName.toLowerCase()
    );
    if (match) {
      goalscorersPoints += 5;
      details.push(`⚽ Correct goalscorer ${pg.playerName}! +5 pts`);
    } else {
      goalscorersPoints -= 3;
      details.push(`❌ Wrong goalscorer ${pg.playerName}: -3 pts`);
    }
  }

  let yellowCardPoints = 0;
  for (const py of predYellows) {
    const match = actualYellows.find(
      ay => ay.team === py.team && ay.playerName.toLowerCase() === py.playerName.toLowerCase()
    );
    if (match) {
      yellowCardPoints += 3;
      details.push(`🟨 Correct yellow card ${py.playerName}! +3 pts`);
    } else {
      yellowCardPoints -= 2;
      details.push(`❌ Wrong yellow card ${py.playerName}: -2 pts`);
    }
  }

  return {
    base,
    goalscorers: goalscorersPoints,
    yellowCards: yellowCardPoints,
    total: base + goalscorersPoints + yellowCardPoints,
    details,
  };
}

function getResult(score: { home: number; away: number }): 'H' | 'D' | 'A' {
  if (score.home > score.away) return 'H';
  if (score.home < score.away) return 'A';
  return 'D';
}

export function getScoreOddsLabel(home: number, away: number, odds: number): string {
  if (odds <= 0) return '';
  const implied = ((1 / odds) * 100).toFixed(1);
  return `${odds.toFixed(2)}x (${implied}% implied)`;
}

export function getResultLabel(home: number, away: number): string {
  if (home > away) return 'Home Win';
  if (home < away) return 'Away Win';
  return 'Draw';
}
