import { useState, useEffect } from 'react';
import { GAMES_CATALOG } from '../data/gamesCatalog';

// Flagship high-traffic hot games with high concurrent player numbers
const TOP_HOT_BASE_PLAYERS: Record<string, number> = {
  'spribe-aviator': 148,
  'pragmatic-gates-olympus': 136,
  'roulette-3d-pro': 118,
  'pragmatic-sweet-bonanza': 124,
  'evolution-crazy-time': 112,
  'mines-diamond-hunt': 94,
  'ae-dragontiger': 88,
  'card-andar-bahar': 82,
  'card-teen-patti': 86,
  'card-blackjack-pro': 76,
  'card-baccarat-pro': 72,
  'plinko-galaxy-drop': 68,
  'dice-lightning-roll': 64,
  'wingo-lottery-5m': 70,
  'sports-live-cricket': 92,
  'scratch-gold-rush': 58,
  'card-texas-holdem': 66
};

// Internal mutable state for real-time live player simulation
let currentPlayersMap: Record<string, number> = {};
let totalPlatformOnline = 1642;
const listeners = new Set<(map: Record<string, number>, total: number) => void>();

// Map game isHot status
const hotGameIdSet = new Set<string>();
GAMES_CATALOG.forEach(g => {
  if (g.isHot || TOP_HOT_BASE_PLAYERS[g.id]) {
    hotGameIdSet.add(g.id);
  }
});

// Initialize counts with realistic high-for-hot and low-for-other distribution
function initPlayerCounts() {
  const map: Record<string, number> = {};
  GAMES_CATALOG.forEach(game => {
    const isHot = hotGameIdSet.has(game.id);

    if (TOP_HOT_BASE_PLAYERS[game.id]) {
      const base = TOP_HOT_BASE_PLAYERS[game.id];
      const jitter = Math.floor(Math.random() * 9) - 4; // -4 to +4
      map[game.id] = Math.max(50, base + jitter);
    } else if (isHot) {
      // General hot games: 55 to 95 players
      const base = Math.floor(60 + Math.random() * 35);
      const jitter = Math.floor(Math.random() * 7) - 3;
      map[game.id] = Math.max(48, Math.min(105, base + jitter));
    } else {
      // Non-hot / niche games: 5 to 18 players
      const base = Math.floor(6 + Math.random() * 11); // 6 - 16
      const jitter = Math.floor(Math.random() * 5) - 2;
      map[game.id] = Math.max(4, Math.min(20, base + jitter));
    }
  });
  currentPlayersMap = map;
}

initPlayerCounts();

// Periodic realistic fluctuation ticker (every 3.5 seconds)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const allKeys = Object.keys(currentPlayersMap);
    if (allKeys.length === 0) return;

    // Pick 4 to 8 random games to fluctuate
    const numToUpdate = Math.floor(4 + Math.random() * 5);
    for (let i = 0; i < numToUpdate; i++) {
      const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
      const isHot = hotGameIdSet.has(randomKey);
      const current = currentPlayersMap[randomKey] || (isHot ? 65 : 10);
      const delta = Math.random() > 0.48 ? 1 : -1;

      if (isHot) {
        // Hot games fluctuate between 48 and 175
        currentPlayersMap[randomKey] = Math.max(48, Math.min(175, current + delta));
      } else {
        // Other games fluctuate gently between 4 and 22
        currentPlayersMap[randomKey] = Math.max(4, Math.min(22, current + delta));
      }
    }

    // Platform total fluctuates between 1580 and 1720
    totalPlatformOnline = Math.max(1580, Math.min(1720, totalPlatformOnline + (Math.random() > 0.5 ? 3 : -3)));

    // Notify all active React subscribers
    listeners.forEach(cb => cb({ ...currentPlayersMap }, totalPlatformOnline));
  }, 3500);
}

/**
 * Hook to subscribe to live updating player counts
 */
export function useLivePlayers() {
  const [playersMap, setPlayersMap] = useState<Record<string, number>>(() => ({ ...currentPlayersMap }));
  const [totalOnline, setTotalOnline] = useState<number>(totalPlatformOnline);

  useEffect(() => {
    const updateHandler = (newMap: Record<string, number>, newTotal: number) => {
      setPlayersMap(newMap);
      setTotalOnline(newTotal);
    };

    listeners.add(updateHandler);
    return () => {
      listeners.delete(updateHandler);
    };
  }, []);

  const getGamePlayers = (gameId: string): number => {
    return playersMap[gameId] || 27;
  };

  return { playersMap, totalOnline, getGamePlayers };
}

/**
 * Direct lookup without hook
 */
export function getStaticGamePlayers(gameId: string): number {
  return currentPlayersMap[gameId] || 27;
}
