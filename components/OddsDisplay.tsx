'use client';
import { MatchOdds } from '@/lib/types';
import { getResultOdds, getScoreOdds } from '@/lib/odds';

interface Props {
  odds: MatchOdds | null;
  homeScore: number;
  awayScore: number;
  homeTeamName: string;
  awayTeamName: string;
  loading: boolean;
}

export default function OddsDisplay({ odds, homeScore, awayScore, homeTeamName, awayTeamName, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-pitch-800 border border-pitch-700 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-pitch-700 rounded w-32 mb-3"></div>
        <div className="flex gap-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-pitch-700 rounded flex-1"></div>)}
        </div>
      </div>
    );
  }

  if (!odds) return null;

  const resultOdds = getResultOdds(odds, homeScore, awayScore);
  const scoreOdds = getScoreOdds(odds, homeScore, awayScore);

  const implied = (o: number) => ((1 / o) * 100).toFixed(1);

  const resultLabel = homeScore > awayScore ? homeTeamName : homeScore < awayScore ? awayTeamName : 'Draw';

  return (
    <div className="bg-pitch-800 border border-pitch-600 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">Live Odds</h3>
        <span className="text-xs text-gray-600">{odds.bookmaker}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: homeTeamName.split(' ')[0], odds: odds.homeWin, active: homeScore > awayScore },
          { label: 'Draw', odds: odds.draw, active: homeScore === awayScore },
          { label: awayTeamName.split(' ')[0], odds: odds.awayWin, active: homeScore < awayScore },
        ].map(item => (
          <div
            key={item.label}
            className={`rounded-lg p-2.5 text-center border transition-all ${
              item.active
                ? 'bg-gold-500/10 border-gold-500 text-gold-400'
                : 'bg-pitch-900 border-pitch-700 text-gray-400'
            }`}
          >
            <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
            <div className={`font-bold text-lg ${item.active ? 'text-gold-400' : 'text-gray-300'}`}>
              {item.odds.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">{implied(item.odds)}%</div>
          </div>
        ))}
      </div>

      <div className={`rounded-lg p-3 border flex items-center justify-between ${
        scoreOdds
          ? 'bg-emerald-900/20 border-emerald-700'
          : 'bg-pitch-900 border-pitch-700'
      }`}>
        <div>
          <div className="text-xs text-gray-500">Your prediction</div>
          <div className="font-semibold text-white">
            {homeScore}–{awayScore} ({resultLabel} win{homeScore === awayScore ? '' : ''})
          </div>
        </div>
        <div className="text-right">
          {scoreOdds ? (
            <>
              <div className="text-emerald-400 font-bold text-xl">{scoreOdds.toFixed(2)}x</div>
              <div className="text-xs text-gray-500">{implied(scoreOdds)}% chance</div>
            </>
          ) : (
            <>
              <div className="text-gray-300 font-bold text-xl">{resultOdds.toFixed(2)}x</div>
              <div className="text-xs text-gray-500">result odds</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
