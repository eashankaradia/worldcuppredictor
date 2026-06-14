'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ALL_FIXTURES, GROUPS } from '@/lib/fixtures';
import { getStoredPlayer, storePlayer } from '@/lib/storage';
import { getMyPredictions } from '@/lib/db';
import { fetchResults, getMatchStatus } from '@/lib/results';
import { MatchResult, Player } from '@/lib/types';
import UsernameGate from '@/components/UsernameGate';

type StatusFilter = 'all' | 'upcoming' | 'live' | 'finished';

export default function Lobby() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [init, setInit] = useState(true);
  const [results, setResults] = useState<Record<string, MatchResult>>({});
  const [myIds, setMyIds] = useState<Set<string>>(new Set());
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const loadData = useCallback(async (p: Player) => {
    const [preds, r] = await Promise.all([getMyPredictions(p.id), fetchResults()]);
    setMyIds(new Set(preds.map(x => x.fixture_id)));
    setResults(r);
  }, []);

  useEffect(() => {
    const stored = getStoredPlayer();
    if (stored) { setPlayer(stored); loadData(stored); }
    setInit(false);
    fetchResults().then(setResults);
  }, [loadData]);

  if (init) return null;
  if (!player) return <UsernameGate onPlayer={p => { setPlayer(p); loadData(p); }} />;

  const fixtures = ALL_FIXTURES.filter(f => {
    const status = getMatchStatus(f, results[f.id]);
    if (groupFilter !== 'all' && f.group !== groupFilter) return false;
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    return true;
  });

  const statusOpts: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: '🔵 Soon' },
    { key: 'live', label: '🟢 Live' },
    { key: 'finished', label: '✓ Done' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-bold text-white">Fixtures</h1>
          <p className="text-[10px] text-gray-600">{myIds.size}/{ALL_FIXTURES.length} predicted</p>
        </div>
        <div className="flex bg-pitch-900 border border-pitch-800 rounded-lg p-0.5 gap-0.5">
          {statusOpts.map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === key ? 'bg-pitch-700 text-white' : 'text-gray-600 hover:text-gray-400'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <button onClick={() => setGroupFilter('all')}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            groupFilter === 'all' ? 'bg-gold-500 text-black' : 'bg-pitch-800 text-gray-500 hover:text-gray-300'
          }`}>All</button>
        {GROUPS.map(g => (
          <button key={g} onClick={() => setGroupFilter(g)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              groupFilter === g ? 'bg-gold-500 text-black' : 'bg-pitch-800 text-gray-500 hover:text-gray-300'
            }`}>{g}</button>
        ))}
      </div>

      <div className="space-y-1">
        {fixtures.map(f => {
          const result = results[f.id];
          const status = getMatchStatus(f, result);
          const predicted = myIds.has(f.id);
          return (
            <Link key={f.id} href={`/match/${f.id}`}>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-pitch-800 bg-pitch-900 hover:border-pitch-700 hover:bg-pitch-800 transition-all">
                <span className="text-base shrink-0">{f.homeTeam.flag}</span>
                <span className="text-sm text-gray-200 flex-1 truncate">{f.homeTeam.name}</span>

                <div className="text-center shrink-0 w-16">
                  {result?.completed ? (
                    <span className="font-bold text-gold-400 text-sm">{result.homeScore}–{result.awayScore}</span>
                  ) : status === 'live' ? (
                    <span className="text-emerald-400 text-xs font-semibold">🟢 Live</span>
                  ) : (
                    <span className="text-gray-700 text-xs">
                      {new Date(f.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>

                <span className="text-sm text-gray-200 flex-1 truncate text-right">{f.awayTeam.name}</span>
                <span className="text-base shrink-0">{f.awayTeam.flag}</span>
                <div className="w-5 text-right shrink-0">
                  {predicted
                    ? <span className="text-emerald-400 text-xs">✓</span>
                    : <span className="text-gold-600 text-xs">›</span>}
                </div>
              </div>
            </Link>
          );
        })}
        {fixtures.length === 0 && (
          <div className="text-center py-12 text-gray-600 text-sm">No matches for this filter</div>
        )}
      </div>
    </div>
  );
}
