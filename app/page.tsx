'use client';
import { useState, useEffect } from 'react';
import { ALL_FIXTURES, GROUPS } from '@/lib/fixtures';
import {
  getCurrentPlayer, setCurrentPlayer,
  getSlip, saveSlip, lockSlip, unlockSlip, getAllSlips,
} from '@/lib/storage';
import { fetchOdds } from '@/lib/odds';
import { PlayerSlip, SlipPick, MatchOdds, Fixture } from '@/lib/types';
import BattleBoard from '@/components/BattleBoard';

export default function HomePage() {
  const [player, setPlayer] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [tab, setTab] = useState<'slip' | 'battle'>('slip');
  const [activeGroup, setActiveGroup] = useState('A');
  const [slip, setSlip] = useState<PlayerSlip>({ playerName: '', picks: [], locked: false });
  const [oddsCache, setOddsCache] = useState<Record<string, MatchOdds>>({});
  const [allSlips, setAllSlips] = useState<PlayerSlip[]>([]);

  const cacheOdds = (fixtureId: string, homeName: string, awayName: string) => {
    fetchOdds(fixtureId, homeName, awayName).then(odds =>
      setOddsCache(prev => ({ ...prev, [fixtureId]: odds }))
    );
  };

  useEffect(() => {
    const name = getCurrentPlayer();
    if (name) {
      setPlayer(name);
      const existing = getSlip(name);
      setSlip(existing);
      existing.picks.forEach(pick => {
        const f = ALL_FIXTURES.find(x => x.id === pick.fixtureId);
        if (f) cacheOdds(f.id, f.homeTeam.name, f.awayTeam.name);
      });
    }
    setAllSlips(getAllSlips());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const joinBattle = () => {
    const name = nameInput.trim();
    if (!name) return;
    setCurrentPlayer(name);
    setPlayer(name);
    setSlip(getSlip(name));
    setAllSlips(getAllSlips());
  };

  const fixtures = ALL_FIXTURES.filter(f => f.group === activeGroup);
  const isInSlip = (id: string) => slip.picks.some(p => p.fixtureId === id);

  const addToSlip = (fixture: Fixture) => {
    if (isInSlip(fixture.id) || slip.locked) return;
    const pick: SlipPick = { fixtureId: fixture.id, homeScore: 1, awayScore: 0 };
    const updated = { ...slip, picks: [...slip.picks, pick] };
    setSlip(updated);
    saveSlip(updated);
    cacheOdds(fixture.id, fixture.homeTeam.name, fixture.awayTeam.name);
  };

  const removeFromSlip = (fixtureId: string) => {
    if (slip.locked) return;
    const updated = { ...slip, picks: slip.picks.filter(p => p.fixtureId !== fixtureId) };
    setSlip(updated); saveSlip(updated);
  };

  const updateScore = (fixtureId: string, field: 'homeScore' | 'awayScore', val: number) => {
    if (slip.locked) return;
    const updated = {
      ...slip,
      picks: slip.picks.map(p =>
        p.fixtureId === fixtureId ? { ...p, [field]: Math.max(0, Math.min(9, val)) } : p
      ),
    };
    setSlip(updated); saveSlip(updated);
  };

  const handleLock = () => {
    if (!player || slip.picks.length === 0) return;
    lockSlip(player);
    setSlip(prev => ({ ...prev, locked: true, lockedAt: new Date().toISOString() }));
    setAllSlips(getAllSlips());
    setTab('battle');
  };

  const handleUnlock = () => {
    if (!player) return;
    unlockSlip(player);
    setSlip(prev => ({ ...prev, locked: false }));
  };

  const accaMult = slip.picks.reduce((mult, pick) => {
    const odds = oddsCache[pick.fixtureId];
    if (!odds) return mult;
    const key = `${pick.homeScore}-${pick.awayScore}`;
    const o = odds.correctScore?.[key] ??
      (pick.homeScore > pick.awayScore ? odds.homeWin :
       pick.homeScore < pick.awayScore ? odds.awayWin : odds.draw);
    return mult * o;
  }, 1);

  // ── Name entry screen ────────────────────────────────────────────────────────
  if (!player) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-xs">
          <div className="text-center mb-7">
            <div className="text-5xl mb-3">⚔️</div>
            <h1 className="text-2xl font-bold text-white">ACCA Battle</h1>
            <p className="text-gray-600 text-xs mt-1">Pick scores · Build your slip · Compete</p>
          </div>
          <div className="bg-pitch-900 border border-pitch-700 rounded-xl p-5 space-y-3">
            <input
              autoFocus
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && joinBattle()}
              placeholder="Your name…"
              className="w-full bg-pitch-800 border border-pitch-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold-500"
            />
            <button
              onClick={joinBattle}
              disabled={!nameInput.trim()}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-black font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              Join Battle →
            </button>
          </div>
          {allSlips.length > 0 && (
            <p className="text-center text-xs text-gray-600 mt-4">
              {allSlips.length} player{allSlips.length !== 1 ? 's' : ''} already in this battle
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Main app ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Playing as</span>
          <span className="text-xs font-semibold text-gold-400 bg-pitch-800 border border-pitch-700 px-2 py-0.5 rounded-full">
            {player}
          </span>
        </div>
        <div className="flex bg-pitch-900 border border-pitch-800 rounded-lg p-0.5 gap-0.5">
          {(['slip', 'battle'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t === 'battle') setAllSlips(getAllSlips()); }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                tab === t ? 'bg-pitch-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'slip' ? '🎯 Build Slip' : '⚔️ Battle'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Build Slip tab ─────────────────────────────────────────────────── */}
      {tab === 'slip' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-4">

          {/* Match browser */}
          <div>
            <div className="flex gap-1 flex-wrap mb-2">
              {GROUPS.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    activeGroup === g ? 'bg-gold-500 text-black' : 'bg-pitch-800 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="space-y-0.5">
              {fixtures.map(f => {
                const inSlip = isInSlip(f.id);
                return (
                  <div
                    key={f.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      inSlip ? 'bg-pitch-800 border border-gold-700/20' : 'bg-pitch-900 hover:bg-pitch-800'
                    }`}
                  >
                    <span>{f.homeTeam.flag}</span>
                    <span className="text-gray-300 flex-1 truncate">{f.homeTeam.name}</span>
                    <span className="text-gray-700">vs</span>
                    <span className="text-gray-300 flex-1 truncate text-right">{f.awayTeam.name}</span>
                    <span>{f.awayTeam.flag}</span>
                    <span className="text-gray-700 w-12 text-right shrink-0">
                      {new Date(f.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    {!slip.locked && (
                      inSlip ? (
                        <span className="text-gold-500 w-10 text-right text-xs shrink-0">✓</span>
                      ) : (
                        <button
                          onClick={() => addToSlip(f)}
                          className="text-xs bg-pitch-700 hover:bg-pitch-600 text-gray-400 hover:text-white px-1.5 py-0.5 rounded transition-colors w-10 text-center shrink-0"
                        >
                          + add
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACCA Slip panel */}
          <div className="lg:sticky lg:top-14 self-start">
            <div className="bg-pitch-900 border border-pitch-700 rounded-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-pitch-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Your Slip</span>
                <span className="text-xs text-gray-600">{slip.picks.length} pick{slip.picks.length !== 1 ? 's' : ''}</span>
              </div>

              {slip.picks.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-600">Add matches to build your ACCA</div>
              ) : (
                <>
                  <div className="divide-y divide-pitch-800">
                    {slip.picks.map(pick => {
                      const f = ALL_FIXTURES.find(x => x.id === pick.fixtureId);
                      if (!f) return null;
                      const odds = oddsCache[pick.fixtureId];
                      const key = `${pick.homeScore}-${pick.awayScore}`;
                      const pickOdds = odds?.correctScore?.[key] ??
                        (odds
                          ? pick.homeScore > pick.awayScore ? odds.homeWin
                          : pick.homeScore < pick.awayScore ? odds.awayWin
                          : odds.draw
                          : null);

                      return (
                        <div key={pick.fixtureId} className="px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500 truncate max-w-[170px]">
                              {f.homeTeam.flag} {f.homeTeam.name} <span className="text-gray-700">vs</span> {f.awayTeam.name} {f.awayTeam.flag}
                            </span>
                            {!slip.locked && (
                              <button onClick={() => removeFromSlip(pick.fixtureId)} className="text-gray-700 hover:text-red-400 text-xs shrink-0 ml-1 transition-colors">✕</button>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            {slip.locked ? (
                              <span className="font-bold text-sm text-gold-400">{pick.homeScore} – {pick.awayScore}</span>
                            ) : (
                              <div className="flex items-center gap-0.5">
                                <Btn onClick={() => updateScore(pick.fixtureId, 'homeScore', pick.homeScore - 1)}>−</Btn>
                                <Score>{pick.homeScore}</Score>
                                <Btn onClick={() => updateScore(pick.fixtureId, 'homeScore', pick.homeScore + 1)}>+</Btn>
                                <span className="text-gray-700 mx-1 text-xs">–</span>
                                <Btn onClick={() => updateScore(pick.fixtureId, 'awayScore', pick.awayScore - 1)}>−</Btn>
                                <Score>{pick.awayScore}</Score>
                                <Btn onClick={() => updateScore(pick.fixtureId, 'awayScore', pick.awayScore + 1)}>+</Btn>
                              </div>
                            )}
                            {pickOdds != null && (
                              <span className="text-xs text-gold-400 font-semibold ml-auto shrink-0 pl-1">
                                {pickOdds.toFixed(2)}x
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {slip.picks.length > 1 && (
                    <div className="px-3 py-2 border-t border-pitch-800 flex items-center justify-between text-xs">
                      <span className="text-gray-600">ACCA mult.</span>
                      <span className="text-gold-400 font-bold">{accaMult.toFixed(1)}x</span>
                    </div>
                  )}

                  <div className="px-3 py-3 border-t border-pitch-800">
                    {slip.locked ? (
                      <div className="space-y-2">
                        <div className="text-center text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-900 rounded-lg py-1.5">✓ Slip locked</div>
                        <button onClick={handleUnlock} className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors py-0.5">Edit slip</button>
                      </div>
                    ) : (
                      <button
                        onClick={handleLock}
                        disabled={slip.picks.length === 0}
                        className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-black font-bold py-2 rounded-lg text-xs transition-colors"
                      >
                        Lock Slip →
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 bg-pitch-900 border border-pitch-800 rounded-xl px-3 py-2.5 text-xs space-y-1">
              <div className="text-gray-600 font-medium mb-1.5 uppercase tracking-wider text-[10px]">Scoring</div>
              {[
                ['Exact score', '+10'],
                ['Correct result', '+3'],
                ['Off by 1 goal total', '+5'],
                ['Off by 2 goals total', '+2'],
              ].map(([label, pts]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-600">{label}</span>
                  <span className="text-gray-400 font-semibold">{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Battle tab ─────────────────────────────────────────────────────── */}
      {tab === 'battle' && <BattleBoard slips={allSlips} currentPlayer={player} />}
    </div>
  );
}

// Tiny inline controls
function Btn({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className="w-4 h-4 rounded bg-pitch-700 hover:bg-pitch-600 text-gray-400 hover:text-white text-xs flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  );
}
function Score({ children }: { children: number }) {
  return <span className="w-5 text-center font-bold text-white text-xs">{children}</span>;
}
