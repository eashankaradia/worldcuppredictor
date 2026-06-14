'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getStoredPlayer } from '@/lib/storage';

export default function NavBar() {
  const [username, setUsername] = useState<string | null>(null);
  const path = usePathname();

  useEffect(() => { setUsername(getStoredPlayer()?.username ?? null); }, [path]);

  const links = [
    { href: '/', label: 'Fixtures' },
    { href: '/leaderboard', label: '🏆 Board' },
    { href: '/me', label: '📋 Me' },
  ];

  return (
    <header className="bg-pitch-900 border-b border-pitch-800 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-11 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm">⚔️</span>
          <span className="font-bold text-sm text-white">ACCA Battle</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                path === href ? 'text-white bg-pitch-700' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {label}
            </Link>
          ))}
          {username && (
            <span className="ml-1 text-[10px] font-semibold text-gold-400 bg-pitch-800 border border-pitch-700 px-2 py-0.5 rounded-full truncate max-w-[80px]">
              {username}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
