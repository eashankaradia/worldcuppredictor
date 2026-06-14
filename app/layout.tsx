import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WC 2026 Predictor',
  description: 'Predict World Cup 2026 match scores and win points',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pitch-950 text-gray-100">
        <nav className="bg-pitch-900 border-b border-pitch-700 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-2xl">🏆</span>
              <span className="text-gold-400">WC 2026</span>
              <span className="text-gray-300">Predictor</span>
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">Fixtures</a>
              <a href="/predictions" className="text-gray-400 hover:text-white transition-colors">My Predictions</a>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-pitch-800 mt-16 py-6 text-center text-xs text-gray-600">
          WC 2026 Predictor · Odds via The Odds API (mock data when no key is set)
        </footer>
      </body>
    </html>
  );
}
