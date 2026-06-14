import { MatchPrediction } from './types';

const KEY = 'wc26_predictions';

export function getPredictions(): Record<string, MatchPrediction> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getPrediction(fixtureId: string): MatchPrediction | null {
  return getPredictions()[fixtureId] ?? null;
}

export function savePrediction(prediction: MatchPrediction): void {
  const all = getPredictions();
  all[prediction.fixtureId] = prediction;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deletePrediction(fixtureId: string): void {
  const all = getPredictions();
  delete all[fixtureId];
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearAllPredictions(): void {
  localStorage.removeItem(KEY);
}
