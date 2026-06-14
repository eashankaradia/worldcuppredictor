import { redirect } from 'next/navigation';
export default function MatchPage() { redirect('/'); }
export function generateStaticParams() { return []; }
