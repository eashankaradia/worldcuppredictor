import { Fixture, MatchPrediction } from '@/lib/types';

interface Props {
  fixture: Fixture;
  prediction: MatchPrediction | null;
}

export default function MatchCard({ fixture, prediction }: Props) {
  const { homeTeam, awayTeam, date, group } = fixture;
  const matchDate = new Date(date);
  const isPast = matchDate < new Date();

  return (
    <a
      href={`/match/${fixture.id}`}
      className="block bg-pitch-900 border border-pitch-700 hover:border-gold-500/50 rounded-xl p-4 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-center min-w-[90px]">
            <div className="text-3xl mb-1">{homeTeam.flag}</div>
            <div className="text-xs font-medium text-gray-300 leading-tight">{homeTeam.name}</div>
          </div>

          <div className="flex-1 text-center">
            {prediction ? (
              <div>
                <div className="text-2xl font-bold text-gold-400">
                  {prediction.score.home} – {prediction.score.away}
                </div>
                <div className="text-xs text-emerald-400 mt-1">✓ Predicted</div>
              </div>
            ) : (
              <div>
                <div className="text-gray-600 text-2xl font-bold">vs</div>
                <div className="text-xs text-gray-600 mt-1">
                  {isPast ? 'Past' : matchDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            )}
          </div>

          <div className="text-center min-w-[90px]">
            <div className="text-3xl mb-1">{awayTeam.flag}</div>
            <div className="text-xs font-medium text-gray-300 leading-tight">{awayTeam.name}</div>
          </div>
        </div>

        <div className="ml-4 text-right">
          <div className="text-xs text-gray-500">Group {group}</div>
          <div className="text-xs text-gray-600 mt-0.5">
            {matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC
          </div>
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              prediction
                ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800'
                : 'bg-pitch-800 text-gray-500 border border-pitch-700 group-hover:border-gold-700 group-hover:text-gold-500'
            }`}>
              {prediction ? 'Edit' : 'Predict'}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
