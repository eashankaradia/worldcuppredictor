'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getFixtureById } from '@/lib/fixtures';
import { getStoredPlayer, storePlayer } from '@/lib/storage';
import { getPredictionsForFixture, upsertPrediction } from '@/lib/db';
import { fetchOdds } from '@/lib/odds';
import { fetchResults, getMatchStatus } from '@/lib/results';
import { calcPoints, pointsLabel } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';
import { DBPrediction, MatchOdds, MatchResult, Player } from '@/lib/types';
import UsernameGate from '@/components/UsernameGate';

export default function MatchPage({ params }: { params: { id: string } }) {
  const fixture = getFixtureById(params.id);
  const [player, setPlayer] = useState<Player | null>(null);
  const [init, setInit] = useState(true);
  const [homeScore, setHomeScore] = useState(1);
  const [awayScore, setAwayScore] = useState(0);
  const [odds, setOdds] = useState<MatchOdds | null>(null);
  const [predictions, setPredictions] = useState<DBPrediction[]>([]);
  const [myPred, setMyPred] = useState<DBPrediction | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (p: Player) => {
    if (!fixture) return;
    const [preds, rs, o] = await Promise.all([
      getPredictionsForFixture(params.id),
      fetchResults(),
      fetchOdds(params.id, fixture.homeTeam.name, fixture.awayTeam.name),
    ]);
    setPredictions(preds);
    const me = preds.find(x => x.player_id === p.id) ?? null;
    setMyPred(me);
    if (me) { setHomeScore(me.home_score); setAwayScore(me.away_score); }
    setResult(rs[params.id] ?? null);
    setOdds(o);
  }, [fixture, params.id]);

  useEffect(() => {
    const stored = getStoredPlayer();
    if (stored) { setPlayer(stored); load(stored); }
    setInit(false);
  }, [load]);

  // Realtime: refresh predictions when anyone submits
  useEffect(() => {
    if (!player) return;
    const ch = supabase
      .channel(`match-${params.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'predictions',
        filter: `fixture_id=eq.${params.id}`,
      }, () => load(player))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [player, params.id, load]);

  const submit = async () => {
    if (!player || !fixture) return;
    setSubmitting(true);
    try {
      await upsertPrediction(player.id, params.id, homeScore, awayScore);
      // Realtime will refresh the list; just update myPred optimistically
      setMyPred({ id: '', player_id: player.id, fixture_id: params.id, home_score: homeScore, away_score: awayScore, submitted_at: new Date().toISOString() });
    } catch (e) { alert('Error saving prediction'); }
    finally { setSubmitting(false); }
  };

  if (init) return null;
  if (!fixture) return <div className="text-center py-20 text-gray-600">Match not found. <Link href="/" className="text-gold-400">Go home</Link></div>;
  if (!player) return <UsernameGate onPlayer={p => { setPlayer(p); load(p); }} />;

  const status = getMatchStatus(fixture, result ?? undefined);
  const canEdit = status === 'upcoming';
  const showAll = !!myPred || status !== 'upcoming';

  const scoreOdds = odds?.correctScore?.[`${homeScore}-${awayScore}`] ?? null;
  const resultOdds = odds
    ? homeScore > awayScore ? odds.homeWin : homeScore < awayScore ? odds.awayWin : odds.draw
    : null;

  const sorted = [...predictions].sort((a, b) => {
    if (result?.completed) {
      return calcPoints({ home: b.home_score, away: b.away_score }, result) -
             calcPoints({ home: a.home_score, away: a.away_score }, result);
    }
    return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
  });

  const myPts = myPred && result?.completed
    ? calcPoints({ home: myPred.home_score, away: myPred.away_score }, result)
    : null;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Fixtures</Link>

      {/* Match header */}
      <div className="bg-pitch-900 border border-pitch-700 rounded-2xl p-5">
        <div className="text-center text-[10px] text-gray-600 mb-4">
          Group {fixture.group} · {new Date(fixture.date).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })}
          {status === 'live' && <span className="ml-2 text-emerald-400 font-semibold">🟢 Live</span>}
          {status === 'finished' && !result?.completed && <span className="ml-2 text-gray-500">Ended</span>}
        </div>
        <div className="grid grid-cols-3 items-center text-center">
          <div>
            <div className="text-5xl mb-1">{fixture.homeTeam.flag}</div>
            <div className="text-sm font-semibold text-white">{fixture.homeTeam.name}</div>
          </div>
          <div>
            {result?.completed ? (
              <div>
                <div className="text-3xl font-bold text-gold-400">{result.homeScore}–{result.awayScore}</div>
                <div className="text-[10px] text-gray-600 mt-1">Full time</div>
              </div>
            ) : <div className="text-xl text-gray-700 font-bold">vs</div>}
          </div>
          <div>
            <div className="text-5xl mb-1">{fixture.awayTeam.flag}</div>
            <div className="text-sm font-semibold text-white">{fixture.awayTeam.name}</div>
          </div>
        </div>
      </div>

      {/* Prediction */}
      <div className="bg-pitch-900 border border-pitch-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Your Prediction</h2>
          {myPred && <span className="text-[10px] text-emerald-400 bg-emerald-900/20 border border-emerald-900 px-2 py-0.5 rounded-full">Submitted</span>}
        </div>

        <div className="grid grid-cols-3 items-center text-center mb-4">
          <div>
            <div className="text-2xl mb-2">{fixture.homeTeam.flag}</div>
            {canEdit ? (
              <Stepper value={homeScore} onChange={setHomeScore} />
            ) : <Score>{myPred?.home_score ?? homeScore}</Score>}
          </div>
          <div className="text-gray-700 font-bold text-lg">–</div>
          <div>
            <div className="text-2xl mb-2">{fixture.awayTeam.flag}</div>
            {canEdit ? (
              <Stepper value={awayScore} onChange={setAwayScore} />
            ) : <Score>{myPred?.away_score ?? awayScore}</Score>}
          </div>
        </div>

        {/* Odds */}
        {odds && canEdit && (
          <div className="bg-pitch-800 rounded-xl p-3 mb-4">
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[
                { label: fixture.homeTeam.name.split(' ')[0], o: odds.homeWin, active: homeScore > awayScore },
                { label: 'Draw', o: odds.draw, active: homeScore === awayScore },
                { label: fixture.awayTeam.name.split(' ')[0], o: odds.awayWin, active: homeScore < awayScore },
              ].map(item => (
                <div key={item.label} className={`text-center rounded-lg p-2 border transition-colors ${
                  item.active ? 'border-gold-500 bg-gold-500/10' : 'border-pitch-700'
                }`}>
                  <div className="text-[9px] text-gray-500 mb-0.5 truncate">{item.label}</div>
                  <div className={`font-bold text-sm ${item.active ? 'text-gold-400' : 'text-gray-300'}`}>
                    {item.o.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-[10px] text-gray-500">
              Score {homeScore}–{awayScore}: 
              <span className="text-gold-400 font-semibold">
                {scoreOdds ? `${scoreOdds.toFixed(2)}x` : resultOdds ? `${resultOdds.toFixed(2)}x (result odds)` : '—'}
              </span>
            </div>
          </div>
        )}

        {canEdit && (
          <button onClick={submit} disabled={submitting}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
            {submitting ? 'Saving…' : myPred ? 'Update Prediction' : 'Submit Prediction'}
          </button>
        )}

        {!canEdit && !myPred && (
          <p className="text-center text-xs text-gray-600">Predictions closed for this match</p>
        )}

        {myPts !== null && (
          <div className={`mt-3 text-center inline-flex w-full items-center justify-center gap-2 py-2 rounded-xl border text-sm font-bold ${
            myPts === 10 ? 'bg-gold-500/10 border-gold-600 text-gold-400' :
            myPts > 0 ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' :
            'bg-pitch-800 border-pitch-700 text-gray-500'
          }`}>
            {pointsLabel(myPts)} · {myPts} pts
          </div>
        )}
      </div>

      {/* All predictions */}
      {showAll && (
        <div className="bg-pitch-900 border border-pitch-700 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-pitch-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">All Predictions</h2>
            <span className="text-[10px] text-gray-600">{predictions.length} players</span>
          </div>
          {sorted.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-600">No predictions yet</div>
          ) : (
            <div className="divide-y divide-pitch-800">
              {sorted.map((pred, idx) => {
                const isMe = pred.player_id === player.id;
                const pts = result?.completed
                  ? calcPoints({ home: pred.home_score, away: pred.away_score }, result)
                  : null;
                return (
                  <div key={pred.id} className={`flex items-center gap-3 px-4 py-2.5 ${
                    isMe ? 'bg-gold-500/5' : ''
                  }`}>
                    {result?.completed && (
                      <span className="text-xs font-bold text-gray-600 w-5">#{idx+1}</span>
                    )}
                    <span className={`text-sm flex-1 ${isMe ? 'text-gold-400 font-semibold' : 'text-gray-300'}`}>
                      {pred.players?.username ?? '—'}{isMe && ' · you'}
                    </span>
                    <span className="font-bold text-sm text-white">{pred.home_score}–{pred.away_score}</span>
                    {pts !== null && (
                      <span className={`text-xs font-bold w-12 text-right ${
                        pts === 10 ? 'text-gold-400' : pts > 0 ? 'text-emerald-400' : 'text-gray-600'
                      }`}>{pts}pts</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!showAll && (
        <p className="text-center text-xs text-gray-600">
          Submit your prediction to see others’
        </p>
      )}
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-lg bg-pitch-800 hover:bg-pitch-700 text-gray-400 hover:text-white text-sm flex items-center justify-center transition-colors">
        −
      </button>
      <span className="w-8 text-center text-xl font-bold text-white">{value}</span>
      <button onClick={() => onChange(Math.min(9, value + 1))}
        className="w-7 h-7 rounded-lg bg-pitch-800 hover:bg-pitch-700 text-gray-400 hover:text-white text-sm flex items-center justify-center transition-colors">
        +
      </button>
    </div>
  );
}

function Score({ children }: { children: number }) {
  return <span className="text-3xl font-bold text-gold-400">{children}</span>;
}
