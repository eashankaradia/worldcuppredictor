'use client';
import { useState, useEffect } from 'react';
import { getOrCreatePlayer } from '@/lib/db';
import { storePlayer, getStoredPlayer } from '@/lib/storage';
import { Player } from '@/lib/types';
import { isConfigured } from '@/lib/supabase';

interface Props { onPlayer: (p: Player) => void; }

export default function UsernameGate({ onPlayer }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = getStoredPlayer();
    if (stored) onPlayer(stored);
    setChecking(false);
  }, [onPlayer]);

  if (checking) return null;

  if (!isConfigured) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-sm w-full bg-pitch-900 border border-red-900/60 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-bold text-white mb-2">Supabase not configured</h2>
          <p className="text-gray-500 text-sm">Follow the setup guide in <code className="text-gold-400">SUPABASE_SETUP.md</code></p>
        </div>
      </div>
    );
  }

  const join = async () => {
    const name = input.trim();
    if (!name) return;
    setLoading(true); setError('');
    try {
      const player = await getOrCreatePlayer(name);
      storePlayer(player);
      onPlayer(player);
    } catch {
      setError('Could not connect. Check your Supabase setup.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-xs">
        <div className="text-center mb-7">
          <div className="text-5xl mb-3">⚔️</div>
          <h1 className="text-2xl font-bold text-white">ACCA Battle</h1>
          <p className="text-gray-600 text-xs mt-1">WC 2026 · Predict scores · Beat your mates</p>
        </div>
        <div className="bg-pitch-900 border border-pitch-700 rounded-2xl p-5 space-y-3">
          <input
            autoFocus
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && join()}
            placeholder="Enter your username…"
            className="w-full bg-pitch-800 border border-pitch-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={join} disabled={!input.trim() || loading}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
            {loading ? 'Joining…' : 'Join Battle →'}
          </button>
        </div>
      </div>
    </div>
  );
}
