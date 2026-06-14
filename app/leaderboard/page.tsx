'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPredictions } from '@/lib/storage';
import { getFixtureById } from '@/lib/fixtures';
import { MatchPrediction } from '@/lib/types';

export default function LeaderboardPage() {
  const [predictions, setPredictions] = useState<Record<string, MatchPrediction>>({});

  useEffect(() => {
    setPredictions(getPredictions());
  }, []);

  const entries = Object.values(predictions);
  const totalPredicted = entries.length;

  // Potential max points (for display, not actual scored yet - results not in)
  const potentialBase = totalPredicted * 10; // if all exact scores
  const bonusCount = entries.reduce(
    (sum, p) => sum + p.goalscorers.length + p.yellowCards.length,
    0
  );

  if (entries.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-white mb-2">No predictions yet</h2>
        <p className="text-gray-400 mb-6">Make predictions to see your leaderboard!</p>
        <a href="/" className="bg-gold-500 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-400 transition-colors">
          View Fixtures
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">My Predictions</h1>
      <p className="text-gray-500 text-sm mb-6">Scores will be calculated once match results are in.</p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-pitch-900 border border-pitch-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gold-400">{totalPredicted}</div>
          <div className="text-xs text-gray-500 mt-1">Matches Predicted</div>
        </div>
        <div className="bg-pitch-900 border border-pitch-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{potentialBase}</div>
          <div className="text-xs text-gray-500 mt-1">Max Base Points</div>
        </div>
        <div className="bg-pitch-900 border border-pitch-700 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{bonusCount}</div>
          <div className="text-xs text-gray-500 mt-1">Bonus Picks</div>
        </div>
      </div>

      <div className="space-y-3">
        {entries.map(pred => {
          const fixture = getFixtureById(pred.fixtureId);
          if (!fixture) return null;
          const bonusPicks = pred.goalscorers.length + pred.yellowCards.length;
          return (
            <a
              key={pred.fixtureId}
              href={`/match/${pred.fixtureId}`}
              className="block bg-pitch-900 border border-pitch-700 hover:border-pitch-600 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xl">{fixture.homeTeam.flag}</div>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">
                      {fixture.homeTeam.name} <span className="text-gray-600">vs</span> {fixture.awayTeam.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Group {fixture.group} · {new Date(fixture.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="text-xl">{fixture.awayTeam.flag}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gold-400">
                    {pred.score.home} – {pred.score.away}
                  </div>
                  <div className="text-xs text-gray-600">
                    {bonusPicks > 0 ? `+${bonusPicks} bonus` : 'No bonus'}
                  </div>
                </div>
              </div>
              {(pred.goalscorers.length > 0 || pred.yellowCards.length > 0) && (
                <div className="mt-3 pt-3 border-t border-pitch-800 flex flex-wrap gap-2">
                  {pred.goalscorers.map((g, i) => (
                    <span key={i} className="text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full">
                      ⚽ {g.playerName} ({g.team === 'home' ? fixture.homeTeam.name.split(' ')[0] : fixture.awayTeam.name.split(' ')[0]})
                    </span>
                  ))}
                  {pred.yellowCards.map((y, i) => (
                    <span key={i} className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-900 px-2 py-0.5 rounded-full">
                      🟨 {y.playerName} ({y.team === 'home' ? fixture.homeTeam.name.split(' ')[0] : fixture.awayTeam.name.split(' ')[0]})
                    </span>
                  ))}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
