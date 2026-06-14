'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAllPredictions } from '@/lib/db';
import { fetchResults } from '@/lib/results';
import { calcPoints, MAX_PTS } from '@/lib/scoring';
import { getStoredPlayer } from '@/lib/storage';
import { ALL_FIXTURES, getFixtureById } from '@/lib/fixtures';
import { DBPrediction, MatchResult, Player } from '@/lib/types';
import UsernameGate from '@/components/UsernameGate';

export default function Leaderboard() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [init, setInit] = useState(true);
  const [allPreds, setAllPreds] = useState<DBPrediction[]>([]);
  const [results, setResults] = useState<Record<string, MatchResult>>({});
  const [matchFilter, setMatchFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredPlayer();
    setPlayer(stored);
    setInit(false);
    Promise.all([getAllPredictions(), fetchResults()]).then(([preds, r]) => {
      setAllPreds(preds); setResults(r); setLoading(false);
    });
  }, []);

  const rows = useMemo(() => {
    const filtered = matchFilter === 'all' ? allPreds : allPreds.filter(p => p.fixture_id === matchFilter);
    const byPlayer: Record<string, { username: string; preds: DBPrediction[] }> = {};
    for (const pred of filtered) {
      const u = pred.players?.username ?? 'Unknown';
      if (!byPlayer[pred.player_id]) byPlayer[pred.player_id] = { username: u, preds: [] };
      byPlayer[pred.player_id].preds.push(pred);
    }
    return Object.entries(byPlayer).map(([pid, { username, preds }]) => {
      let earned = 0, potential = 0;
      for (const pred of preds) {
        const r = results[pred.fixture_id];
        if (r?.completed) {
          const pts = calcPoints({ home: pred.home_score, away: pred.away_score }, r);
          earned += pts; potential += pts;
        } else {
          potential += MAX_PTS;
        }
      }
      return { pid, username, count: preds.length, earned, potential };
    }).sort((a, b) => b.earned - a.earned || b.potential - a.potential);
  }, [allPreds, results, matchFilter]);

  if (init) return null;
  if (!player) return <UsernameGate onPlayer={p => { setPlayer(p); }} />;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <h1 className="font-bold text-white text-lg mb-4">🏆 Leaderboard</h1>

      {/* Match filter */}
      <div className="overflow-x-auto mb-4">
        <div className="flex gap-1 pb-1 min-w-max">
          <button onClick={() => setMatchFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              matchFilter === 'all' ? 'bg-gold-500 text-black' : 'bg-pitch-800 text-gray-500 hover:text-gray-300'
            }`}>All Matches</button>
          {ALL_FIXTURES.map(f => (
            <button key={f.id} onClick={() => setMatchFilter(f.id)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                matchFilter === f.id ? 'bg-gold-500 text-black' : 'bg-pitch-800 text-gray-600 hover:text-gray-400'
              }`}>{f.homeTeam.flag}{f.awayTeam.flag}</button>
          ))}
        </div>
      </div>

      {/* Fixture label for match filter */}
      {matchFilter !== 'all' && (() => {
        const f = getFixtureById(matchFilter);
        return f ? (
          <div className="mb-3 text-sm text-gray-400">
            {f.homeTeam.flag} {f.homeTeam.name} vs {f.awayTeam.name} {f.awayTeam.flag}
          </div>
        ) : null;
      })()}

      {loading ? (
        <div className="text-center py-12 text-gray-600 text-sm">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-sm mb-3">No predictions yet</p>
          <Link href="/" className="text-gold-400 text-sm">Browse fixtures →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, idx) => {
            const isMe = row.pid === player.id;
            return (
              <div key={row.pid} className={`rounded-xl border p-3 flex items-center gap-3 ${
                isMe ? 'border-gold-600/50 bg-gold-500/5' : 'border-pitch-700 bg-pitch-900'
              }`}>
                <div className="text-lg w-8 text-center shrink-0">
                  {idx < 3 ? medals[idx] : <span className="text-xs font-bold text-gray-600">#{idx+1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${
                    isMe ? 'text-gold-400' : idx === 0 ? 'text-white' : 'text-gray-200'
                  }`}>
                    {row.username}{isMe && <span className="text-[10px] text-gray-600 ml-1.5 font-normal">you</span>}
                  </div>
                  <div className="text-[10px] text-gray-600">{row.count} prediction{row.count !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-white">
                    {row.earned}
                    <span className="text-xs text-gray-600 font-normal ml-0.5">pts</span>
                  </div>
                  <div className="text-[10px] text-gray-600">max {row.potential}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
