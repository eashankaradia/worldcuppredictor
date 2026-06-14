'use client';
import { useState } from 'react';
import { GoalscorerPrediction, YellowCardPrediction, Fixture } from '@/lib/types';

interface Props {
  fixture: Fixture;
  goalscorers: GoalscorerPrediction[];
  yellowCards: YellowCardPrediction[];
  onGoalscorerChange: (g: GoalscorerPrediction[]) => void;
  onYellowCardChange: (y: YellowCardPrediction[]) => void;
}

export default function BonusSection({ fixture, goalscorers, yellowCards, onGoalscorerChange, onYellowCardChange }: Props) {
  const [newGoalscorerName, setNewGoalscorerName] = useState('');
  const [newGoalscorerTeam, setNewGoalscorerTeam] = useState<'home' | 'away'>('home');
  const [newYellowName, setNewYellowName] = useState('');
  const [newYellowTeam, setNewYellowTeam] = useState<'home' | 'away'>('home');

  const addGoalscorer = () => {
    if (!newGoalscorerName.trim()) return;
    onGoalscorerChange([...goalscorers, { team: newGoalscorerTeam, playerName: newGoalscorerName.trim() }]);
    setNewGoalscorerName('');
  };

  const removeGoalscorer = (i: number) => {
    onGoalscorerChange(goalscorers.filter((_, idx) => idx !== i));
  };

  const addYellowCard = () => {
    if (!newYellowName.trim()) return;
    onYellowCardChange([...yellowCards, { team: newYellowTeam, playerName: newYellowName.trim() }]);
    setNewYellowName('');
  };

  const removeYellowCard = (i: number) => {
    onYellowCardChange(yellowCards.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="bg-pitch-900 border border-pitch-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">⚽</span>
          <h3 className="font-semibold text-white">Goalscorer Predictions</h3>
          <span className="ml-auto text-xs text-emerald-400 font-medium">+5 correct</span>
          <span className="text-xs text-red-400 font-medium">-3 wrong</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Optional · risky but rewarding</p>

        {goalscorers.map((g, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="text-sm">{g.team === 'home' ? fixture.homeTeam.flag : fixture.awayTeam.flag}</span>
            <span className="text-sm text-gray-300 flex-1">{g.playerName}</span>
            <span className="text-xs text-gray-500">{g.team === 'home' ? fixture.homeTeam.name : fixture.awayTeam.name}</span>
            <button onClick={() => removeGoalscorer(i)} className="text-red-500 hover:text-red-400 text-xs px-2">✕</button>
          </div>
        ))}

        <div className="flex gap-2 mt-2">
          <select
            value={newGoalscorerTeam}
            onChange={e => setNewGoalscorerTeam(e.target.value as 'home' | 'away')}
            className="bg-pitch-800 border border-pitch-600 rounded-lg px-2 py-2 text-sm text-gray-300 w-28"
          >
            <option value="home">{fixture.homeTeam.flag} {fixture.homeTeam.name.split(' ')[0]}</option>
            <option value="away">{fixture.awayTeam.flag} {fixture.awayTeam.name.split(' ')[0]}</option>
          </select>
          <input
            type="text"
            placeholder="Player name"
            value={newGoalscorerName}
            onChange={e => setNewGoalscorerName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoalscorer()}
            className="flex-1 bg-pitch-800 border border-pitch-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold-500"
          />
          <button
            onClick={addGoalscorer}
            className="bg-pitch-700 hover:bg-pitch-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-pitch-900 border border-pitch-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🟨</span>
          <h3 className="font-semibold text-white">Yellow Card Predictions</h3>
          <span className="ml-auto text-xs text-emerald-400 font-medium">+3 correct</span>
          <span className="text-xs text-red-400 font-medium">-2 wrong</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Optional · risky but rewarding</p>

        {yellowCards.map((y, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="text-sm">{y.team === 'home' ? fixture.homeTeam.flag : fixture.awayTeam.flag}</span>
            <span className="text-sm text-gray-300 flex-1">{y.playerName}</span>
            <span className="text-xs text-gray-500">{y.team === 'home' ? fixture.homeTeam.name : fixture.awayTeam.name}</span>
            <button onClick={() => removeYellowCard(i)} className="text-red-500 hover:text-red-400 text-xs px-2">✕</button>
          </div>
        ))}

        <div className="flex gap-2 mt-2">
          <select
            value={newYellowTeam}
            onChange={e => setNewYellowTeam(e.target.value as 'home' | 'away')}
            className="bg-pitch-800 border border-pitch-600 rounded-lg px-2 py-2 text-sm text-gray-300 w-28"
          >
            <option value="home">{fixture.homeTeam.flag} {fixture.homeTeam.name.split(' ')[0]}</option>
            <option value="away">{fixture.awayTeam.flag} {fixture.awayTeam.name.split(' ')[0]}</option>
          </select>
          <input
            type="text"
            placeholder="Player name"
            value={newYellowName}
            onChange={e => setNewYellowName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addYellowCard()}
            className="flex-1 bg-pitch-800 border border-pitch-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold-500"
          />
          <button
            onClick={addYellowCard}
            className="bg-pitch-700 hover:bg-pitch-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
