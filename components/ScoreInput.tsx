'use client';

interface Props {
  label: string;
  flag: string;
  value: number;
  onChange: (val: number) => void;
}

export default function ScoreInput({ label, flag, value, onChange }: Props) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-2">{flag}</div>
      <div className="text-sm font-medium text-gray-300 mb-3 leading-tight">{label}</div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))
          }
          className="w-10 h-10 rounded-full bg-pitch-800 border border-pitch-600 text-gray-300 hover:bg-pitch-700 hover:text-white transition-colors text-xl font-bold"
        >
          −
        </button>
        <div className="w-14 h-14 rounded-xl bg-pitch-800 border-2 border-gold-500 flex items-center justify-center">
          <span className="text-3xl font-bold text-gold-400">{value}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-10 h-10 rounded-full bg-pitch-800 border border-pitch-600 text-gray-300 hover:bg-pitch-700 hover:text-white transition-colors text-xl font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
