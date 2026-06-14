import { getFixtureById, ALL_FIXTURES } from '@/lib/fixtures';
import { notFound } from 'next/navigation';
import PredictionForm from '@/components/PredictionForm';

export function generateStaticParams() {
  return ALL_FIXTURES.map(f => ({ id: f.id }));
}

export default function MatchPage({ params }: { params: { id: string } }) {
  const fixture = getFixtureById(params.id);
  if (!fixture) notFound();

  return (
    <div>
      <a href="/" className="text-gray-500 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Back to Fixtures
      </a>
      <PredictionForm fixture={fixture} />
    </div>
  );
}
