'use client';
import { useState, useEffect } from 'react';
import { ALL_FIXTURES, GROUPS } from '@/lib/fixtures';
import { getPredictions } from '@/lib/storage';
import { Fixture, MatchPrediction } from '@/lib/types';
import MatchCard from '@/components/MatchCard';

export default function HomePage() {
  const [activeGroup, setActiveGroup] = useState('A');
  const [predictions, setPredictions] = useState<Record<string, MatchPrediction>>({});

  useEffect(() => {
    setPredictions(getPredictions());
  }, []);

  const fixtures = ALL_FIXTURES.filter(f => f.group === activeGroup);
  const totalPredicted = Object.keys(predictions).length;
  const totalMatches = ALL_FIXTURES.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">FIFA World Cup 2026</h1>
        <p className="text-gray-400">Predict match scores · Earn points · Win big</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-pitch-800 rounded-full px-4 py-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-gold-400"></span>
          <span className="text-gray-300">{totalPredicted} / {totalMatches} matches predicted</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Scoring Guide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[
            { label: 'Exact Score', pts: '+10', color: 'text-emerald-400' },
            { label: 'Correct Result', pts: '+3', color: 'text-blue-400' },
            { label: 'Off by 1 Goal', pts: '+5', color: 'text-yellow-400' },
            { label: 'Off by 2 Goals', pts: '+2', color: 'text-orange-400' },
          ].map(item => (
            <div key={item.label} className="bg-pitch-900 rounded-lg p-3 border border-pitch-700">
              <div className={`text-xl font-bold ${item.color}`}>{item.pts}</div>
              <div className="text-gray-400 text-xs mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div className="bg-pitch-900 rounded-lg p-3 border border-pitch-700">
            <div className="text-emerald-400 font-bold">⚽ Goalscorer Bonus</div>
            <div className="text-gray-400 text-xs mt-0.5">+5 correct · -3 wrong (optional)</div>
          </div>
          <div className="bg-pitch-900 rounded-lg p-3 border border-pitch-700">
            <div className="text-yellow-400 font-bold">🟨 Yellow Card Bonus</div>
            <div className="text-gray-400 text-xs mt-0.5">+3 correct · -2 wrong (optional)</div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap mb-4">
        {GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeGroup === g
                ? 'bg-gold-500 text-black'
                : 'bg-pitch-800 text-gray-400 hover:text-white hover:bg-pitch-700'
            }`}
          >
            Group {g}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {fixtures.map(fixture => (
          <MatchCard
            key={fixture.id}
            fixture={fixture}
            prediction={predictions[fixture.id] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
