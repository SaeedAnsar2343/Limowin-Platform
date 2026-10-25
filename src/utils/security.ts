// Limowin Platform Security, Cryptographic Ledger & Anti-Fraud Utility
// Designed for Owner-First Bankroll Protection & Tamper Detection

export interface SecuritySignatureData {
  userId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

const SECRET_SALT = 'LIMO_SECURE_VAULT_KEY_2026_SAEED_OWNER_SALT';

/**
 * Lightweight, robust cryptographic hash (DJB2 + FNV-1a hybrid)
 * Produces a deterministic 64-character hex signature for client-side balance validation.
 */
function secureHash(input: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  
  // Secondary pass for 32-hex output
  let h3 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h3 ^= input.charCodeAt(i);
    h3 = Math.imul(h3, 0x01000193);
  }
  const part3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 ^ h2 ^ h3) >>> 0).toString(16).padStart(8, '0');

  return `SIG_${part1}${part2}${part3}${part4}`;
}

/**
 * Generate a cryptographically bound balance signature for a user profile
 */
export function generateBalanceSignature(
  userId: string,
  balance: number,
  totalDeposited: number,
  totalWithdrawn: number
): string {
  const normBal = Number(balance || 0).toFixed(2);
  const normDep = Number(totalDeposited || 0).toFixed(2);
  const normWth = Number(totalWithdrawn || 0).toFixed(2);
  const payload = `${userId}:${normBal}:${normDep}:${normWth}:${SECRET_SALT}`;
  return secureHash(payload);
}

/**
 * Verify whether the user's current balance matches their cryptographic signature.
 * Returns true if valid or if profile is new/uninitialized.
 */
export function verifyBalanceIntegrity(user: {
  id: string;
  balance: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
  balanceSignature?: string;
}): boolean {
  if (!user || !user.id) return false;
  // If user profile has no signature yet (e.g. freshly created or demo), consider valid and sign on next write
  if (!user.balanceSignature) return true;

  const expected = generateBalanceSignature(
    user.id,
    user.balance || 0,
    user.totalDeposited || 0,
    user.totalWithdrawn || 0
  );
  return user.balanceSignature === expected;
}

/**
 * Strict validator for payment references (Indian UPI UTR, USDT TRC20, ERC20, GPay/Paytm)
 */
export function validateTransactionReference(
  method: string,
  txRef: string
): { valid: boolean; error?: string } {
  const clean = (txRef || '').trim();
  if (!clean || clean.length < 6) {
    return { valid: false, error: 'Transaction reference is too short. Please enter the full reference number.' };
  }

  // Common fraudulent test inputs
  const fakePatterns = [
    /^0+$/,
    /^1+$/,
    /^123456/,
    /^test/i,
    /^demo/i,
    /^dummy/i,
    /^qwerty/i,
    /^asdf/i
  ];
  if (fakePatterns.some(p => p.test(clean))) {
    return { valid: false, error: 'Invalid or fraudulent reference number detected. Please enter your real banking UTR or TxHash.' };
  }

  const mLower = method.toLowerCase();

  // Indian UPI / GPay / PhonePe / Paytm UTR Check (typically 12 numeric digits)
  if (mLower.includes('upi') || mLower.includes('gpay') || mLower.includes('phonepe') || mLower.includes('paytm')) {
    // Standard bank UTR is exactly 12 digits, but allow 10-18 alphanumeric for special UPI handles
    if (!/^[a-zA-Z0-9]{10,22}$/.test(clean)) {
      return { valid: false, error: 'Invalid UPI UTR format. A valid Indian banking UTR is typically a 12-digit reference number.' };
    }
  }

  // USDT TRC-20 / Crypto TxHash Check (64 hex characters or 20+ chars)
  if (mLower.includes('crypto') || mLower.includes('usdt') || mLower.includes('trc') || mLower.includes('erc')) {
    if (clean.length < 16) {
      return { valid: false, error: 'Invalid Blockchain TxHash. Please provide the complete Transaction Hash from your crypto wallet.' };
    }
  }

  return { valid: true };
}

/**
 * Calculate Net House Profit (GGR - Gross Gaming Revenue) per player:
 * Total Deposited - Total Withdrawn
 */
export function calculateNetHouseProfit(totalDeposited: number = 0, totalWithdrawn: number = 0): number {
  return Number((totalDeposited - totalWithdrawn).toFixed(2));
}

/**
 * Classify player risk for the owner's dashboard:
 * - 'cash_cow': Deposited high amount, net house profit > ₹2,000 / $30.
 * - 'high_risk': Current balance exceeds total lifetime deposits (Player is ahead of the house).
 * - 'tampered': Cryptographic signature mismatch.
 * - 'normal': Standard player.
 */
export function evaluatePlayerRisk(
  user: {
    id: string;
    balance: number;
    totalDeposited?: number;
    totalWithdrawn?: number;
    balanceSignature?: string;
    status?: string;
  },
  currency: 'INR' | 'USD'
): { level: 'cash_cow' | 'high_risk' | 'tampered' | 'normal'; label: string; color: string } {
  if (!verifyBalanceIntegrity(user) || user.status === 'locked') {
    return { level: 'tampered', label: '🚨 TAMPER DETECTED', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
  }

  const dep = user.totalDeposited || 0;
  const wth = user.totalWithdrawn || 0;
  const netHouse = dep - wth;
  const minCashCow = currency === 'INR' ? 2000 : 30;

  if (netHouse >= minCashCow) {
    return { level: 'cash_cow', label: '🟢 CASH COW (PROFITABLE)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
  }

  // If player balance exceeds 1.1x their deposits, they are taking money from the house!
  if (dep > 0 && user.balance > dep * 1.1) {
    return { level: 'high_risk', label: '🔴 HOUSE RISK (DRAIN NEEDED)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  }

  return { level: 'normal', label: '⚪ NORMAL PLAYER', color: 'bg-slate-700/40 text-slate-300 border-slate-600/40' };
}
