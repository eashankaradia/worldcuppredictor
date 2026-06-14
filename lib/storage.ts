import { MatchPrediction, PlayerSlip } from './types';

// ─── Legacy storage (keeps old components happy) ──────────────────────────────
const LEGACY_KEY = 'wc26_predictions';

function loadLegacy(): Record<string, MatchPrediction> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}'); } catch { return {}; }
}

export function getPredictions(): Record<string, MatchPrediction> { return loadLegacy(); }
export function getPrediction(id: string): MatchPrediction | null { return loadLegacy()[id] ?? null; }
export function savePrediction(p: MatchPrediction): void {
  const all = loadLegacy(); all[p.fixtureId] = p;
  localStorage.setItem(LEGACY_KEY, JSON.stringify(all));
}
export function deletePrediction(id: string): void {
  const all = loadLegacy(); delete all[id];
  localStorage.setItem(LEGACY_KEY, JSON.stringify(all));
}
export function clearAllPredictions(): void { localStorage.removeItem(LEGACY_KEY); }

// ─── ACCA Battle storage ─────────────────────────────────────────────────────
const BATTLE_KEY = 'acca_battle_v1';
const PLAYER_KEY = 'acca_current_player';

function loadBattle(): Record<string, PlayerSlip> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(BATTLE_KEY) || '{}'); } catch { return {}; }
}
function saveBattle(b: Record<string, PlayerSlip>): void {
  localStorage.setItem(BATTLE_KEY, JSON.stringify(b));
}

export function getCurrentPlayer(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PLAYER_KEY);
}
export function setCurrentPlayer(name: string): void {
  localStorage.setItem(PLAYER_KEY, name);
}
export function getSlip(playerName: string): PlayerSlip {
  return loadBattle()[playerName] ?? { playerName, picks: [], locked: false };
}
export function saveSlip(slip: PlayerSlip): void {
  const b = loadBattle(); b[slip.playerName] = slip; saveBattle(b);
}
export function lockSlip(playerName: string): void {
  const b = loadBattle();
  if (b[playerName]) { b[playerName].locked = true; b[playerName].lockedAt = new Date().toISOString(); saveBattle(b); }
}
export function unlockSlip(playerName: string): void {
  const b = loadBattle();
  if (b[playerName]) { b[playerName].locked = false; delete b[playerName].lockedAt; saveBattle(b); }
}
export function getAllSlips(): PlayerSlip[] {
  return Object.values(loadBattle());
}
export function clearBattle(): void { localStorage.removeItem(BATTLE_KEY); }
