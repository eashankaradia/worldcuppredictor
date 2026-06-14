export const MAX_PTS = 10;

export function calcPoints(
  pred: { home: number; away: number },
  result: { homeScore: number; awayScore: number },
): number {
  const { home: ph, away: pa } = pred;
  const { homeScore: rh, awayScore: ra } = result;

  // Exact score
  if (ph === rh && pa === ra) return 10;

  const predOutcome = ph > pa ? 'H' : ph < pa ? 'A' : 'D';
  const realOutcome = rh > ra ? 'H' : rh < ra ? 'A' : 'D';
  const totalDiff = Math.abs((ph + pa) - (rh + ra));

  let pts = 0;
  if (predOutcome === realOutcome) pts += 3;
  if (totalDiff === 1) pts += 5;
  else if (totalDiff === 2) pts += 2;
  return pts;
}

export function pointsLabel(pts: number): string {
  if (pts === 10) return '🎯 Exact!';
  if (pts >= 8) return '🔥 Close!';
  if (pts > 0) return '✓ Points';
  return '✕ Nil';
}
