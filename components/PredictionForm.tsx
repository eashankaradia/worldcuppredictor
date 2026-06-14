'use client';
import { useState, useEffect, useCallback } from 'react';
import { Fixture, MatchOdds, GoalscorerPrediction, YellowCardPrediction } from '@/lib/types';
import { fetchOdds } from '@/lib/odds';
import { getPrediction, savePrediction, deletePrediction } from '@/lib/storage';
import ScoreInput from './ScoreInput';
import OddsDisplay from './OddsDisplay';
import BonusSection from './BonusSection';

interface Props {
  fixture: Fixture;
}

export default function PredictionForm({ fixture }: Props) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [odds, setOdds] = useState<MatchOdds | null>(null);
  const [oddsLoading, setOddsLoading] = useState(true);
  const [goalscorers, setGoalscorers] = useState<GoalscorerPrediction[]>([]);
  const [yellowCards, setYellowCards] = useState<YellowCardPrediction[]>([]);
  const [saved, setSaved] = useState(false);
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    const existing = getPrediction(fixture.id);
    if (existing) {
      setHomeScore(existing.score.home);
      setAwayScore(existing.score.away);
      setGoalscorers(existing.goalscorers);
      setYellowCards(existing.yellowCards);
      if (existing.goalscorers.length > 0 || existing.yellowCards.length > 0) setShowBonus(true);
    }

    (async () => {
      setOddsLoading(true);
      const o = await fetchOdds(fixture.id, fixture.homeTeam.name, fixture.awayTeam.name);
      setOdds(o);
      setOddsLoading(false);
    })();
  }, [fixture]);

  const handleSave = useCallback(() => {
    savePrediction({
      fixtureId: fixture.id,
      score: { home: homeScore, away: awayScore },
      goalscorers,
      yellowCards,
      submittedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [fixture.id, homeScore, awayScore, goalscorers, yellowCards]);

  const handleDelete = useCallback(() => {
    deletePrediction(fixture.id);
    setHomeScore(0);
    setAwayScore(0);
    setGoalscorers([]);
    setYellowCards([]);
    setSaved(false);
  }, [fixture.id]);

  const matchDate = new Date(fixture.date);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-pitch-900 border border-pitch-700 rounded-2xl p-6 mb-4">
        <div className="text-center mb-2">
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
            Group {fixture.group} · {fixture.stage}
          </span>
        </div>
        <div className="text-center text-xs text-gray-500 mb-6">
          {matchDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}
          {matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC
        </div>

        <div className="grid grid-cols-3 gap-4 items-center mb-8">
          <ScoreInput
            label={fixture.homeTeam.name}
            flag={fixture.homeTeam.flag}
            value={homeScore}
            onChange={setHomeScore}
          />
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-700">–</div>
          </div>
          <ScoreInput
            label={fixture.awayTeam.name}
            flag={fixture.awayTeam.flag}
            value={awayScore}
            onChange={setAwayScore}
          />
        </div>

        <OddsDisplay
          odds={odds}
          homeScore={homeScore}
          awayScore={awayScore}
          homeTeamName={fixture.homeTeam.name}
          awayTeamName={fixture.awayTeam.name}
          loading={oddsLoading}
        />
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowBonus(!showBonus)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            showBonus
              ? 'bg-pitch-800 border-gold-700 text-gold-400'
              : 'bg-pitch-900 border-pitch-700 text-gray-400 hover:border-pitch-600 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>🎲</span>
            <span className="font-medium">Bonus Predictions</span>
            <span className="text-xs bg-pitch-700 px-2 py-0.5 rounded-full">Optional · Risky</span>
          </div>
          <span className="text-lg">{showBonus ? '▲' : '▼'}</span>
        </button>

        {showBonus && (
          <div className="mt-3">
            <BonusSection
              fixture={fixture}
              goalscorers={goalscorers}
              yellowCards={yellowCards}
              onGoalscorerChange={setGoalscorers}
              onYellowCardChange={setYellowCards}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className={`flex-1 py-3 rounded-xl font-semibold text-lg transition-all ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-gold-500 hover:bg-gold-400 text-black'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Prediction'}
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-3 rounded-xl bg-pitch-800 border border-pitch-700 text-gray-500 hover:text-red-400 hover:border-red-900 transition-colors text-sm"
        >
          Clear
        </button>
      </div>

      <div className="mt-6 bg-pitch-900 border border-pitch-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Points you could earn</h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Exact score ({homeScore}–{awayScore})</span>
            <span className="text-emerald-400 font-semibold">+10 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Correct result</span>
            <span className="text-blue-400 font-semibold">+3 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Off by 1 goal total</span>
            <span className="text-yellow-400 font-semibold">+5 pts</span>
          </div>
          {goalscorers.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">{goalscorers.length} goalscorer{goalscorers.length > 1 ? 's' : ''} (if all correct)</span>
              <span className="text-emerald-400 font-semibold">+{goalscorers.length * 5} pts</span>
            </div>
          )}
          {yellowCards.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">{yellowCards.length} yellow card{yellowCards.length > 1 ? 's' : ''} (if all correct)</span>
              <span className="text-emerald-400 font-semibold">+{yellowCards.length * 3} pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
