'use client';
import { PlayerSlip } from '@/lib/types';
import { getFixtureById } from '@/lib/fixtures';

interface Props {
  slips: PlayerSlip[];
  currentPlayer: string;
}

export default function BattleBoard({ slips, currentPlayer }: Props) {
  if (slips.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">⚔️</div>
        <p className="text-sm text-gray-600">No slips locked in yet. Be the first!</p>
      </div>
    );
  }

  const sorted = [...slips].sort((a, b) => {
    if (a.locked !== b.locked) return a.locked ? -1 : 1;
    return b.picks.length - a.picks.length;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-sm text-white">⚔️ Battle Board</h2>
        <span className="text-xs text-gray-600">{slips.length} player{slips.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {sorted.map((slip, idx) => {
          const isMe = slip.playerName === currentPlayer;
          return (
            <div
              key={slip.playerName}
              className={`rounded-xl border overflow-hidden ${
                isMe ? 'border-gold-600/50 bg-gold-500/[0.03]' : 'border-pitch-700 bg-pitch-900'
              }`}
            >
              <div className="px-3 py-2.5 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 w-5 shrink-0">#{idx + 1}</span>
                <span className={`font-semibold text-sm flex-1 truncate ${
                  isMe ? 'text-gold-400' : 'text-white'
                }`}>
                  {slip.playerName}
                  {isMe && <span className="text-[10px] text-gray-600 ml-1.5 font-normal">you</span>}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${
                  slip.locked
                    ? 'text-emerald-400 bg-emerald-900/20 border-emerald-900'
                    : 'text-yellow-500 bg-yellow-900/10 border-yellow-900'
                }`}>
                  {slip.locked ? '🔒 locked' : '✏️ building'}
                </span>
                <span className="text-[10px] text-gray-600 shrink-0">{slip.picks.length}p</span>
              </div>

              {slip.picks.length > 0 && (
                <div className="px-3 pb-2.5 flex flex-wrap gap-1">
                  {slip.picks.map(pick => {
                    const f = getFixtureById(pick.fixtureId);
                    if (!f) return null;
                    return (
                      <span
                        key={pick.fixtureId}
                        className="text-[10px] bg-pitch-800 border border-pitch-700 px-1.5 py-0.5 rounded-md text-gray-400 font-medium"
                      >
                        {f.homeTeam.flag}{pick.homeScore}–{pick.awayScore}{f.awayTeam.flag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-gray-700 mt-5">
        Points calculated once results are confirmed
      </p>
    </div>
  );
}
