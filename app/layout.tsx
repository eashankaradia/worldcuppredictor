import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ACCA Battle · WC 2026',
  description: 'Build your ACCA slip and compete on World Cup 2026 score predictions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pitch-950 text-gray-100">
        <header className="bg-pitch-900 border-b border-pitch-800 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-11 flex items-center gap-2">
            <span className="text-base">⚔️</span>
            <span className="font-bold text-sm text-white">ACCA Battle</span>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-gray-600">WC 2026</span>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-5">{children}</main>
      </body>
    </html>
  );
}
