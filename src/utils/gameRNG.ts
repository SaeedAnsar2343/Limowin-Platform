// Secret Game Outcome & House Edge Controller
// Note: Never expose this algorithm in the user interface.

export interface WinOutcome {
  isWin: boolean;
  multiplier: number;
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

/**
 * Calculates win/loss and payout multiplier based on strict house rules:
 * - First 3 bets/deals: Exactly 2 wins randomly selected out of the 3 (1 loss).
 * - Next 4 bets (bets 4, 5, 6, 7): 100% loss (accumulating 7 bets total).
 * - Bets 8, 9, 10: Exactly ONE random win among the 8th, 9th, or 10th bet, other two are losses.
 * - Bets 11+ (Recurring 10-bet cycles):
 *   - 7 consecutive losses (bets 1..7 of cycle).
 *   - Exactly ONE random win among bets 8, 9, 10 of cycle.
 */
export function calculateSecretOutcome(
  betAmount: number,
  currency: 'INR' | 'USD',
  gamesPlayedCount: number,
  maxTheoreticalMultiplier: number = 2.0
): WinOutcome {
  let isWin = false;

  // Phase 1: First 3 bets (gamesPlayedCount = 0, 1, 2)
  // Exactly 2 wins out of 3 bets (1 loss slot randomly chosen from 0, 1, 2)
  if (gamesPlayedCount < 3) {
    const lossSlot = getOrInitSlot('limowin_rng_init_loss_slot', 0, 2);
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
    const winSlotFirstCycle = getOrInitSlot('limowin_rng_win_slot_c1', 7, 9);
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
      const cycleKey = `limowin_rng_win_slot_c${cycleNum}`;
      const chosenWinStep = getOrInitSlot(cycleKey, 7, 9);
      isWin = stepInCycle === chosenWinStep;
    }
  }

  // Calculate multiplier
  if (!isWin) {
    return { isWin: false, multiplier: 0 };
  }

  // When won, calculate realistic multiplier appropriate for the game
  let mult = 2.0;

  // Fixed odds games:
  if (maxTheoreticalMultiplier === 36.0) {
    // Single number roulette
    mult = 36.0;
  } else if (maxTheoreticalMultiplier === 3.0) {
    // Dozens, columns
    mult = 3.0;
  } else if (maxTheoreticalMultiplier === 2.0 || maxTheoreticalMultiplier === 2.5) {
    // Red/Black, Even/Odd, Blackjack, Baccarat, Dragon Tiger
    mult = maxTheoreticalMultiplier;
  } else if (maxTheoreticalMultiplier > 3.0) {
    // Slots, Aviator, Plinko, Mines: dynamic random multiplier
    const minM = 1.6;
    const maxM = Math.min(maxTheoreticalMultiplier, 4.5);
    mult = Number((minM + Math.random() * (maxM - minM)).toFixed(2));
  } else {
    mult = Number((1.5 + Math.random() * 0.7).toFixed(2));
  }

  return { isWin: true, multiplier: mult };
}
