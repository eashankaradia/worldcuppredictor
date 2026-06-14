import { Player } from './types';

const KEY = 'acca_player_v2';

export function getStoredPlayer(): Player | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; }
}

export function storePlayer(p: Player): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearStoredPlayer(): void {
  localStorage.removeItem(KEY);
}

// ─── Legacy stubs ───────────────────────────────────────────────────────────────────
export function getPredictions() { return {}; }
export function getPrediction() { return null; }
export function savePrediction() {}
export function deletePrediction() {}
export function clearAllPredictions() {}
export function getSlip() { return { playerName: '', picks: [], locked: false }; }
export function saveSlip() {}
export function lockSlip() {}
export function unlockSlip() {}
export function getAllSlips() { return []; }
export function setCurrentPlayer() {}
export function getCurrentPlayer() { return null; }
export function clearBattle() {}
