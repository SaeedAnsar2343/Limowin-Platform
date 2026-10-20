// Region Detection & Multi-Currency Engine (INR vs USD / USDT)

export type CurrencyType = 'INR' | 'USD';

export interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  name: string;
  minBet: number;
  maxBet: number;
  betPresets: number[];
  depositPresets: number[]; // Large first, small after as requested!
  withdrawPresets: number[];
  minWithdrawal: number;
  maxWithdrawal: number;
  conversionRate: number; // 1 USD = 85 INR
}

export const CURRENCY_CONFIGS: Record<CurrencyType, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    minBet: 100,
    maxBet: 10000,
    betPresets: [100, 200, 500, 1000, 2500, 5000, 10000],
    // Reverse row: large amount first and small after for quick preset select
    depositPresets: [10000, 5000, 2500, 1000, 500, 200, 100],
    withdrawPresets: [500000, 200000, 100000, 50000, 25000, 10000, 5000, 1000, 500, 100],
    minWithdrawal: 100, // minimum ₹100
    maxWithdrawal: 500000, // maximum ₹5,00,000 (5 Lac) per transaction!
    conversionRate: 85
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar / USDT',
    minBet: 1,
    maxBet: 500,
    betPresets: [1, 5, 10, 25, 50, 100, 250, 500],
    // Reverse row: large amount first and small after
    depositPresets: [500, 250, 100, 50, 25, 10, 5, 1],
    withdrawPresets: [5000, 2500, 1000, 500, 250, 100, 50, 25, 10],
    minWithdrawal: 10, // minimum $10
    maxWithdrawal: 5000, // maximum $5,000
    conversionRate: 1
  }
};

/**
 * Detect region: If inside India (Asia/Kolkata, Asia/Calcutta, IST, or Indian language), return 'INR'.
 * If outside India, return 'USD'.
 */
export function detectUserRegion(): CurrencyType {
  try {
    if (typeof Intl !== 'undefined') {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (
        timeZone.includes('Calcutta') ||
        timeZone.includes('Kolkata') ||
        timeZone.includes('India') ||
        timeZone === 'Asia/Kolkata' ||
        timeZone === 'Asia/Calcutta'
      ) {
        return 'INR';
      }
    }

    if (typeof navigator !== 'undefined') {
      const languages = navigator.languages || [navigator.language];
      for (const lang of languages) {
        if (lang && (lang.includes('-IN') || lang.startsWith('hi') || lang.startsWith('ta') || lang.startsWith('te') || lang.startsWith('bn'))) {
          return 'INR';
        }
      }
    }
  } catch (e) {
    console.warn('Region detection fallback:', e);
  }

  // Default international region: USD
  return 'USD';
}

/**
 * Format monetary amount with proper symbol and decimal places
 */
export function formatMoney(amount: number, currency: CurrencyType = 'USD'): string {
  const cfg = CURRENCY_CONFIGS[currency];
  const safeAmt = Number(amount) || 0;
  if (currency === 'INR') {
    return `${cfg.symbol}${safeAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${cfg.symbol}${safeAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
