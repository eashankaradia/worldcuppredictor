'use client';
import { useEffect, useState } from 'react';
import { getPredictions } from '@/lib/storage';
import { getFixtureById } from '@/lib/fixtures';
import { MatchPrediction } from '@/lib/types';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Record<string, MatchPrediction>>({});

  useEffect(() => {
    setPredictions(getPredictions());
  }, []);

  const entries = Object.values(predictions);

  if (entries.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-white mb-2">No predictions yet</h2>
        <p className="text-gray-400 mb-6">Head to the fixtures and start predicting!</p>
        <a href="/" className="bg-gold-500 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-400 transition-colors">
          View Fixtures
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Predictions</h1>
      <div className="space-y-3">
        {entries.map(pred => {
          const fixture = getFixtureById(pred.fixtureId);
          if (!fixture) return null;
          const bonusCount = pred.goalscorers.length + pred.yellowCards.length;
          return (
            <a
              key={pred.fixtureId}
              href={`/match/${pred.fixtureId}`}
              className="block bg-pitch-900 border border-pitch-700 hover:border-pitch-600 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{fixture.homeTeam.flag}</span>
                  <div>
                    <div className="font-semibold text-white">
                      {fixture.homeTeam.name} vs {fixture.awayTeam.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      Group {fixture.group} · {new Date(fixture.date).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-xl">{fixture.awayTeam.flag}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gold-400">
                    {pred.score.home} – {pred.score.away}
                  </div>
                  {bonusCount > 0 && (
                    <div className="text-xs text-gray-500">{bonusCount} bonus pick{bonusCount > 1 ? 's' : ''}</div>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
