'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredPlayer } from '@/lib/storage';
import { getMyPredictions } from '@/lib/db';
import { fetchResults } from '@/lib/results';
import { calcPoints, MAX_PTS, pointsLabel } from '@/lib/scoring';
import { getFixtureById } from '@/lib/fixtures';
import { DBPrediction, MatchResult, Player } from '@/lib/types';
import UsernameGate from '@/components/UsernameGate';

export default function MePage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [init, setInit] = useState(true);
  const [preds, setPreds] = useState<DBPrediction[]>([]);
  const [results, setResults] = useState<Record<string, MatchResult>>({});
  const [loading, setLoading] = useState(true);

  const load = async (p: Player) => {
    const [myPreds, r] = await Promise.all([getMyPredictions(p.id), fetchResults()]);
    setPreds(myPreds); setResults(r); setLoading(false);
  };

  useEffect(() => {
    const stored = getStoredPlayer();
    if (stored) { setPlayer(stored); load(stored); } else setLoading(false);
    setInit(false);
  }, []);

  if (init) return null;
  if (!player) return <UsernameGate onPlayer={p => { setPlayer(p); load(p); }} />;

  const earned = preds.reduce((s, p) => {
    const r = results[p.fixture_id];
    return s + (r?.completed ? calcPoints({ home: p.home_score, away: p.away_score }, r) : 0);
  }, 0);
  const potential = preds.reduce((s, p) => {
    const r = results[p.fixture_id];
    return s + (r?.completed ? calcPoints({ home: p.home_score, away: p.away_score }, r) : MAX_PTS);
  }, 0);

  return (
    <div>
      <h1 className="font-bold text-white text-lg mb-4">📋 My Predictions</h1>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Predicted', value: preds.length, sub: `of 72` },
          { label: 'Earned', value: earned, sub: 'pts' },
          { label: 'Max left', value: potential, sub: 'pts' },
        ].map(s => (
          <div key={s.label} className="bg-pitch-900 border border-pitch-800 rounded-xl p-3 text-center">
            <div className="font-bold text-white text-xl">{s.value}</div>
            <div className="text-[10px] text-gray-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading…</div>
      ) : preds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-sm mb-3">No predictions yet</p>
          <Link href="/" className="text-gold-400 text-sm">Browse fixtures →</Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {preds.map(pred => {
            const fixture = getFixtureById(pred.fixture_id);
            if (!fixture) return null;
            const r = results[pred.fixture_id];
            const pts = r?.completed ? calcPoints({ home: pred.home_score, away: pred.away_score }, r) : null;
            return (
              <Link key={pred.id} href={`/match/${pred.fixture_id}`}>
                <div className="bg-pitch-900 border border-pitch-800 hover:border-pitch-700 rounded-xl p-3 flex items-center gap-3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm">
                      <span>{fixture.homeTeam.flag}</span>
                      <span className="text-gray-300 truncate">{fixture.homeTeam.name}</span>
                      <span className="text-gray-700 text-xs">vs</span>
                      <span className="text-gray-300 truncate">{fixture.awayTeam.name}</span>
                      <span>{fixture.awayTeam.flag}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-0.5">
                      Group {fixture.group} · {new Date(fixture.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">
                      <span className="text-gold-400">{pred.home_score}–{pred.away_score}</span>
                      {r?.completed && (
                        <span className="text-gray-600 font-normal ml-1 text-xs">({r.homeScore}–{r.awayScore})</span>
                      )}
                    </div>
                    {pts !== null ? (
                      <div className={`text-xs font-bold mt-0.5 ${
                        pts === 10 ? 'text-gold-400' : pts > 0 ? 'text-emerald-400' : 'text-gray-600'
                      }`}>{pointsLabel(pts)} · {pts}pts</div>
                    ) : (
                      <div className="text-[10px] text-gray-600 mt-0.5">max 10pts</div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
