import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'ACCA Battle · WC 2026',
  description: 'WC 2026 score prediction battle — predict, compete, win',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pitch-950 text-gray-100">
        <NavBar />
        <main className="max-w-3xl mx-auto px-4 py-5">{children}</main>
      </body>
    </html>
  );
}
