// Secret Game Outcome & House Edge Controller
// Note: Never expose this algorithm in the user interface.

export interface WinOutcome {
  isWin: boolean;
  multiplier: number;
}

/**
 * Calculates win/loss and payout multiplier based on strict house rules:
 * - Brand new players on their first 2 games with small/initial bet: guaranteed small random win (1.5x - 2.5x).
 * - Initial/minimum bets: ~10% win probability.
 * - Mid-size bets: 2% to 5% random win probability.
 * - Large bets (USD >= $50 or INR >= ₹4,000): strictly 1% win probability.
 */
export function calculateSecretOutcome(
  betAmount: number,
  currency: 'INR' | 'USD',
  gamesPlayedCount: number,
  maxTheoreticalMultiplier: number = 2.0
): WinOutcome {
  const isINR = currency === 'INR';
  const isLargeBet = isINR ? betAmount >= 4000 : betAmount >= 50;
  const isSmallBet = isINR ? betAmount <= 500 : betAmount <= 5;

  // 1. Hook rule: Brand new user's first 2 games with initial bet
  if (gamesPlayedCount < 2 && isSmallBet) {
    const mult = Number((1.4 + Math.random() * 0.9).toFixed(2)); // 1.4x - 2.3x
    return { isWin: true, multiplier: mult };
  }

  // 2. Determine win probability
  let winChancePercent: number;

  if (isLargeBet) {
    // Large bets strictly 1% chance
    winChancePercent = 1.0;
  } else if (isSmallBet) {
    // Initial bet has 10% chance
    winChancePercent = 10.0;
  } else {
    // In between bets: random 2% to 5%
    winChancePercent = 2.0 + Math.random() * 3.0; // 2.0% - 5.0%
  }

  const roll = Math.random() * 100;
  const isWin = roll < winChancePercent;

  if (!isWin) {
    return { isWin: false, multiplier: 0 };
  }

  // If won, calculate conservative realistic multiplier
  let mult = 1.5;
  if (maxTheoreticalMultiplier > 2.0) {
    mult = Number((1.5 + Math.random() * (Math.min(maxTheoreticalMultiplier, 5.0) - 1.5)).toFixed(2));
  } else {
    mult = Number((1.4 + Math.random() * 0.6).toFixed(2));
  }

  return { isWin: true, multiplier: mult };
}
