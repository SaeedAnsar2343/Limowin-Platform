import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Gamepad2,
  Share2,
  Copy,
  Check,
  Shield,
  Sparkles,
  Award,
  AlertTriangle,
  Play,
  UserCheck,
  Lock,
  MessageCircle,
  TrendingUp,
  CreditCard,
  Smartphone
} from 'lucide-react';

export const CustomerProfileModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    user,
    siteSettings,
    paymentGateways,
    depositBonusConfig,
    calculateDepositBonus,
    submitDeposit,
    submitWithdrawal,
    allDeposits,
    allWithdrawals,
    gameHistory,
    currency,
    currencyConfig,
    formatCurrency,
    showToast
  } = useApp();

  const [tab, setTab] = useState<'profile' | 'deposit' | 'withdraw' | 'transactions' | 'games' | 'affiliate'>('deposit');

  // Sync initial tab if opened via 'deposit' or 'withdraw' or 'profile'
  const currentTab = activeModal === 'deposit' ? 'deposit' : activeModal === 'withdraw' ? 'withdraw' : tab;

  // Deposit Form - Default based on currency (INR => UPI Pay, USD => TRC20)
  const [depositMethod, setDepositMethod] = useState<'upi' | 'gpay' | 'usdt_trc20' | 'usdt_erc20' | 'bank'>(
    currency === 'INR' ? 'upi' : 'usdt_trc20'
  );
  const [depositAmount, setDepositAmount] = useState<number>(currency === 'INR' ? 1000 : 50);
  const [depositTxHash, setDepositTxHash] = useState('');
  const [claimPromoBonus, setClaimPromoBonus] = useState(true);
  const [copied, setCopied] = useState(false);

  // Withdraw Form - Default based on currency (INR => UPI, USD => crypto TRC20)
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'gpay' | 'crypto' | 'bank'>(
    currency === 'INR' ? 'upi' : 'crypto'
  );
  const [withdrawAmount, setWithdrawAmount] = useState<number>(currency === 'INR' ? 1000 : 50);
  const [withdrawDetails, setWithdrawDetails] = useState('');

  // Auto-switch default payment method when currency changes
  useEffect(() => {
    if (currency === 'INR') {
      setDepositMethod('upi');
      setWithdrawMethod('upi');
      setDepositAmount(1000);
      setWithdrawAmount(1000);
    } else {
      setDepositMethod('usdt_trc20');
      setWithdrawMethod('crypto');
      setDepositAmount(50);
      setWithdrawAmount(50);
    }
  }, [currency]);

  if (activeModal !== 'profile' && activeModal !== 'deposit' && activeModal !== 'withdraw') {
    return null;
  }

  if (!user) {
    return null;
  }

  // Reverse row: large amount first and small after for quick preset select as requested!
  const depositPresetsReversed = currency === 'INR'
    ? [10000, 5000, 2500, 1000, 500, 200, 100]
    : [500, 250, 100, 50, 25, 10, 5, 1];

  const withdrawPresetsReversed = currency === 'INR'
    ? [500000, 200000, 100000, 50000, 25000, 10000, 5000, 1000, 500, 100]
    : [5000, 2500, 1000, 500, 250, 100, 50, 25, 10];

  const userDeposits = allDeposits.filter(d => d.userId === user.id || d.userEmail === user.email);
  const userWithdrawals = allWithdrawals.filter(w => w.userId === user.id || w.userEmail === user.email);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic deposit bonus calculation
  const calculatedBonus = calculateDepositBonus(depositAmount, currency);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositTxHash) {
      showToast('Please enter the transaction reference / UTR / hash', 'error');
      return;
    }
    const methodName =
      depositMethod === 'upi' ? 'UPI Pay (Instant)' :
      depositMethod === 'gpay' ? 'Google Pay (GPay)' :
      depositMethod === 'usdt_trc20' ? 'USDT (TRC-20)' :
      depositMethod === 'usdt_erc20' ? 'USDT (ERC-20)' :
      'Bank Transfer';

    await submitDeposit(methodName, depositAmount, depositTxHash, claimPromoBonus);
    setDepositTxHash('');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawDetails) {
      showToast('Please provide your payout account details', 'error');
      return;
    }
    const methodName =
      withdrawMethod === 'upi' ? 'UPI FastPay' :
      withdrawMethod === 'gpay' ? 'Google Pay (GPay)' :
      withdrawMethod === 'crypto' ? 'USDT (TRC-20)' :
      'Bank Transfer';

    await submitWithdrawal(methodName, withdrawAmount, withdrawDetails);
    setWithdrawDetails('');
  };

  const hasBonusLock = (user.bonusLockGamesRemaining || 0) > 0 && user.bonusBalance > 0;
  const gamesPlayed = Math.max(0, 5 - (user.bonusLockGamesRemaining || 0));

  // Compute VIP stats
  const totalRounds = gameHistory.length;
  const wonRounds = gameHistory.filter(g => g.isWin).length;
  const winRate = totalRounds > 0 ? ((wonRounds / totalRounds) * 100).toFixed(1) : '68.4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar - Fully Responsive for Mobile & Desktop */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 p-4 sm:p-6 text-white shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shrink-0">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-xl sm:text-2xl font-black text-amber-400">
                  {user.name.charAt(0)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black truncate">{user.name}</h2>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow shrink-0">
                    {user.vipLevel}
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full items-center space-x-1">
                    <UserCheck className="w-3 h-3 text-emerald-400 inline" />
                    <span>KYC Level 1</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                  {user.email} • {currency === 'INR' ? '🇮🇳 India (INR)' : '🌐 International (USD)'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real Cash & Bonus Balances: Responsive 2-column grid on mobile, spacious inline on desktop */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 pt-3 border-t border-slate-800/80">
            <div className="bg-slate-950/80 border border-slate-700/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-inner">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block leading-none">REAL CASH</span>
              <span className="text-base sm:text-xl font-black text-emerald-400 leading-tight">
                {formatCurrency(user.balance)}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-700/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-inner">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block leading-none">BONUS FUNDS</span>
              <span className="text-base sm:text-xl font-black text-yellow-400 leading-tight">
                {formatCurrency(user.bonusBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Horizontal Scroll Touch-Friendly */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 flex space-x-1.5 sm:space-x-2 overflow-x-auto shrink-0 no-scrollbar">
          {[
            { id: 'deposit', label: 'Deposit Money', icon: ArrowDownCircle },
            { id: 'withdraw', label: 'Withdraw Funds', icon: ArrowUpCircle },
            { id: 'profile', label: 'VIP Card & Security', icon: Award },
            { id: 'transactions', label: 'Banking History', icon: History },
            { id: 'games', label: 'Betting Records', icon: Gamepad2 },
            { id: 'affiliate', label: 'Referral & Affiliate', icon: Share2 }
          ].map(t => {
            const Icon = t.icon;
            const isActive = currentTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`py-3 sm:py-3.5 px-3 sm:px-4 font-black text-xs border-b-2 flex items-center space-x-1.5 sm:space-x-2 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-amber-500 text-slate-900 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* 1. DEPOSIT MONEY */}
          {currentTab === 'deposit' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add Funds to Your Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant deposit gateway ({currencyConfig.code}). Select payment method:
                </p>
              </div>

              {/* Method Pickers: If INR, default is UPI Pay, second is GPay. If USD, default is TRC20 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {currency === 'INR' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDepositMethod('upi')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        depositMethod === 'upi'
                          ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/30 scale-102'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">⚡</span>
                      <span className="text-xs block">UPI Pay (Fast)</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">Default • Instant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositMethod('gpay')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        depositMethod === 'gpay'
                          ? 'border-blue-500 bg-blue-50/70 text-slate-950 font-black shadow-sm ring-2 ring-blue-400/30 scale-102'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">📱</span>
                      <span className="text-xs block">Google Pay (GPay)</span>
                      <span className="text-[10px] text-blue-600 font-bold block">1-Click Fast</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositMethod('bank')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        depositMethod === 'bank'
                          ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/30 scale-102'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">🏦</span>
                      <span className="text-xs block">Bank Transfer</span>
                      <span className="text-[10px] text-slate-500 font-bold block">NEFT / RTGS</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDepositMethod('usdt_trc20')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        depositMethod === 'usdt_trc20'
                          ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/30 scale-102'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">🪙</span>
                      <span className="text-xs block">USDT (TRC-20)</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">Default • Lowest Fee</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositMethod('usdt_erc20')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        depositMethod === 'usdt_erc20'
                          ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/30 scale-102'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">💎</span>
                      <span className="text-xs block">USDT (ERC-20)</span>
                      <span className="text-[10px] text-purple-600 font-bold block">Ethereum Rail</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositMethod('bank')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        depositMethod === 'bank'
                          ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/30 scale-102'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">🏦</span>
                      <span className="text-xs block">Bank Wire</span>
                      <span className="text-[10px] text-slate-500 font-bold block">SWIFT Transfer</span>
                    </button>
                  </>
                )}
              </div>

              {/* Dynamic Destination Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                {depositMethod === 'upi' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={paymentGateways.upiFastPay.qrCodeUrl}
                      alt="UPI QR"
                      className="w-28 h-28 rounded-xl border border-slate-300 p-1 bg-white shadow-xs"
                    />
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <div className="text-xs font-bold text-slate-500">Official UPI ID:</div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-xs font-black text-slate-900 flex items-center justify-between">
                        <span>{paymentGateways.upiFastPay.upiId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentGateways.upiFastPay.upiId)}
                          className="p-1 hover:bg-slate-100 rounded ml-2 shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">{paymentGateways.upiFastPay.instructions}</p>
                    </div>
                  </div>
                )}

                {depositMethod === 'gpay' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={paymentGateways.gpayFastPay.qrCodeUrl}
                      alt="GPay QR"
                      className="w-28 h-28 rounded-xl border border-slate-300 p-1 bg-white shadow-xs"
                    />
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <div className="text-xs font-bold text-slate-500">Google Pay (GPay) Official Number / UPI:</div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-xs font-black text-slate-900 flex items-center justify-between">
                        <span>{paymentGateways.gpayFastPay.upiId} ({paymentGateways.gpayFastPay.phone})</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentGateways.gpayFastPay.upiId)}
                          className="p-1 hover:bg-slate-100 rounded ml-2 shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">{paymentGateways.gpayFastPay.instructions}</p>
                    </div>
                  </div>
                )}

                {depositMethod === 'usdt_trc20' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={paymentGateways.cryptoUsdtTrc20.qrCodeUrl}
                      alt="TRC20 QR"
                      className="w-28 h-28 rounded-xl border border-slate-300 p-1 bg-white shadow-xs"
                    />
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <div className="text-xs font-bold text-slate-500">Official USDT TRC-20 Address:</div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 break-all flex items-center justify-between">
                        <span>{paymentGateways.cryptoUsdtTrc20.address}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentGateways.cryptoUsdtTrc20.address)}
                          className="p-1 hover:bg-slate-100 rounded ml-2 shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">{paymentGateways.cryptoUsdtTrc20.instructions}</p>
                    </div>
                  </div>
                )}

                {depositMethod === 'usdt_erc20' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={paymentGateways.cryptoUsdtErc20.qrCodeUrl}
                      alt="ERC20 QR"
                      className="w-28 h-28 rounded-xl border border-slate-300 p-1 bg-white shadow-xs"
                    />
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <div className="text-xs font-bold text-slate-500">Official USDT ERC-20 Address:</div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 break-all flex items-center justify-between">
                        <span>{paymentGateways.cryptoUsdtErc20.address}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentGateways.cryptoUsdtErc20.address)}
                          className="p-1 hover:bg-slate-100 rounded ml-2 shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">{paymentGateways.cryptoUsdtErc20.instructions}</p>
                    </div>
                  </div>
                )}

                {depositMethod === 'bank' && (
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-800">Admin Bank Account Details:</div>
                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                      <div>Bank: <strong>{paymentGateways.bankWireTransfer.bankName}</strong></div>
                      <div>Holder: <strong>{paymentGateways.bankWireTransfer.accountName}</strong></div>
                      <div>Account No: <strong className="font-mono">{paymentGateways.bankWireTransfer.accountNumber}</strong></div>
                      <div>IFSC/SWIFT: <strong className="font-mono">{paymentGateways.bankWireTransfer.ifscSwift}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Deposit Promotion Opt-in Banner */}
              <div
                onClick={() => setClaimPromoBonus(!claimPromoBonus)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  claimPromoBonus
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={claimPromoBonus}
                  onChange={e => setClaimPromoBonus(e.target.checked)}
                  className="mt-1 w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-xs text-slate-900">
                      🎁 Claim {calculatedBonus.label}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      BONUS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Bonus calculation is configured dynamically by Admin. Credits instantly upon deposit approval!
                  </p>
                  <p className="text-[10px] text-amber-800 font-bold mt-1">
                    ⚠️ Promotional condition: You must play any 5 games before withdrawing bonus funds.
                  </p>
                </div>
              </div>

              {/* Amount and Submission Form with MANUAL INPUT and REVERSED PRESET ROW (Large First, Small After) */}
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-800">
                      Deposit Amount ({currencyConfig.symbol} {currencyConfig.code})
                    </label>
                    <span className="text-[11px] text-slate-400 font-bold">
                      Type manually or pick quick preset
                    </span>
                  </div>

                  {/* Manual Amount Input Field */}
                  <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-lg">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      type="number"
                      min={currency === 'INR' ? 100 : 1}
                      max={500000}
                      required
                      placeholder={`Enter custom amount (e.g. ${currency === 'INR' ? '1500' : '75'})`}
                      value={depositAmount || ''}
                      onChange={e => setDepositAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-300 text-base font-black text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 shadow-xs"
                    />
                  </div>

                  {/* Reversed Quick Presets: Large Amount First, Small After */}
                  <div className="flex flex-wrap gap-2">
                    {depositPresetsReversed.map(val => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setDepositAmount(val)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                          depositAmount === val
                            ? 'bg-amber-500 text-slate-950 scale-105 shadow-md ring-2 ring-yellow-400'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {formatCurrency(val)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Transaction Hash / UTR / Reference ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR: 432890123 / Hash: 7f8b91a24d0819c991b16e00234acfe1"
                    value={depositTxHash}
                    onChange={e => setDepositTxHash(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Confirm Deposit Request ({formatCurrency(depositAmount)} {claimPromoBonus && calculatedBonus.bonusAmount > 0 ? `+ ${formatCurrency(calculatedBonus.bonusAmount)} Bonus` : ''})
                </button>
              </form>
            </div>
          )}

          {/* 2. WITHDRAW FUNDS (Min 100, Max 5 Lac Per Transaction) */}
          {currentTab === 'withdraw' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Request Withdrawal</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Available balance: <strong className="text-emerald-600 font-black">{formatCurrency(user.balance)}</strong>
                  </p>
                </div>
                <div className="text-right text-[11px] bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                  <span className="text-slate-500 font-bold block">Transaction Limit:</span>
                  <span className="font-black text-slate-900">
                    Min {formatCurrency(currencyConfig.minWithdrawal)} • Max {formatCurrency(currencyConfig.maxWithdrawal)} (5 Lac)
                  </span>
                </div>
              </div>

              {/* 5-Game Bonus Playthrough Notice */}
              {hasBonusLock && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>⚠️ Promotional Playthrough Requirement Active</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    You have claimed a promotional bonus ({formatCurrency(user.bonusBalance)}). As per platform fair play policy, you cannot withdraw bonus funds until you play at least <strong>5 games</strong>.
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Requirement Progress:</span>
                      <span className="text-amber-800 font-black">{gamesPlayed} of 5 games completed</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(gamesPlayed / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-amber-800 font-semibold block text-right">
                      {user.bonusLockGamesRemaining} game{user.bonusLockGamesRemaining > 1 ? 's' : ''} remaining to unlock withdrawal
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center space-x-1.5 shadow"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Games Now to Unlock</span>
                  </button>
                </div>
              )}

              {/* Method Selection (INR => UPI Pay default, GPay second. USD => Crypto default) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {currency === 'INR' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('upi')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        withdrawMethod === 'upi'
                          ? 'border-blue-500 bg-blue-50/70 text-slate-950 font-black shadow-sm ring-2 ring-blue-400/30'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">⚡</span>
                      <span className="text-xs block">UPI FastPay</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">Default</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('gpay')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        withdrawMethod === 'gpay'
                          ? 'border-blue-500 bg-blue-50/70 text-slate-950 font-black shadow-sm ring-2 ring-blue-400/30'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">📱</span>
                      <span className="text-xs block">Google Pay (GPay)</span>
                      <span className="text-[10px] text-blue-600 font-bold block">Fast</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('bank')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        withdrawMethod === 'bank'
                          ? 'border-blue-500 bg-blue-50/70 text-slate-950 font-black shadow-sm ring-2 ring-blue-400/30'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">🏦</span>
                      <span className="text-xs block">Bank Transfer</span>
                      <span className="text-[10px] text-slate-500 font-bold block">IMPS</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('crypto')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        withdrawMethod === 'crypto'
                          ? 'border-blue-500 bg-blue-50/70 text-slate-950 font-black shadow-sm ring-2 ring-blue-400/30'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">🪙</span>
                      <span className="text-xs block">USDT TRC-20</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">Default</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('bank')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        withdrawMethod === 'bank'
                          ? 'border-blue-500 bg-blue-50/70 text-slate-950 font-black shadow-sm ring-2 ring-blue-400/30'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block mb-1">🏦</span>
                      <span className="text-xs block">Bank Account</span>
                      <span className="text-[10px] text-slate-500 font-bold block">SWIFT</span>
                    </button>
                  </>
                )}
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-800">
                      Withdrawal Amount ({currencyConfig.symbol} {currencyConfig.code})
                    </label>
                    <span className="text-[11px] text-slate-500 font-bold">
                      Min {formatCurrency(currencyConfig.minWithdrawal)} • Max {formatCurrency(currencyConfig.maxWithdrawal)} (5 Lac)
                    </span>
                  </div>

                  <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-lg">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      type="number"
                      min={currencyConfig.minWithdrawal}
                      max={Math.min(user.balance, currencyConfig.maxWithdrawal)}
                      required
                      value={withdrawAmount || ''}
                      onChange={e => setWithdrawAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-300 text-base font-black text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 shadow-xs"
                    />
                  </div>

                  {/* Reversed presets */}
                  <div className="flex flex-wrap gap-2">
                    {withdrawPresetsReversed.map(val => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setWithdrawAmount(val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          withdrawAmount === val
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {formatCurrency(val)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {withdrawMethod === 'crypto'
                      ? 'Your USDT TRC-20 Address'
                      : withdrawMethod === 'bank'
                      ? 'Bank Name, Account Number & IFSC / SWIFT'
                      : withdrawMethod === 'gpay'
                      ? 'Google Pay Number or GPay UPI ID'
                      : 'Your UPI VPA ID'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      withdrawMethod === 'crypto'
                        ? 'TXY89zXn7KaP9LmRtWv3Q1bB7GqK2sP9Aa'
                        : withdrawMethod === 'bank'
                        ? 'HDFC Bank, Acc: 5010023891823, IFSC: HDFC000182'
                        : withdrawMethod === 'gpay'
                        ? '+91 98765 43210 or yourname@oksbi'
                        : 'yourname@okhdfcbank'
                    }
                    value={withdrawDetails}
                    onChange={e => setWithdrawDetails(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={user.balance < withdrawAmount || withdrawAmount < currencyConfig.minWithdrawal || withdrawAmount > currencyConfig.maxWithdrawal}
                  className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  Confirm Withdrawal Request ({formatCurrency(withdrawAmount)})
                </button>
              </form>
            </div>
          )}

          {/* 3. VIP CARD & SECURITY (High-End Realistic Profile) */}
          {currentTab === 'profile' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Luxury Gold VIP Membership Card */}
              <div className="w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 border-2 border-amber-400/50 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-black tracking-widest text-sm uppercase text-amber-400">
                      {siteSettings.siteName} VIP CLUB
                    </span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-3 py-1 rounded-full shadow">
                    {user.vipLevel}
                  </span>
                </div>

                <div className="mt-8">
                  <span className="text-[11px] text-slate-400 font-mono tracking-widest block uppercase">
                    Card Holder
                  </span>
                  <span className="text-xl font-black tracking-wide">{user.name}</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Member ID</span>
                    <span className="text-amber-300 font-bold">{user.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Daily Limit</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(currencyConfig.maxWithdrawal)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Cashback</span>
                    <span className="text-amber-400 font-bold">12.5%</span>
                  </div>
                </div>
              </div>

              {/* VIP Benefits & Security Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <UserCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block">KYC Status</span>
                  <span className="text-xs font-black text-slate-900">Verified L1</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <Shield className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block">2FA Security</span>
                  <span className="text-xs font-black text-slate-900">Active</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block">Win Rate</span>
                  <span className="text-xs font-black text-slate-900">{winRate}%</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block">Rounds Played</span>
                  <span className="text-xs font-black text-slate-900">{user.gamesPlayedCount || 0}</span>
                </div>
              </div>

              {/* Contact VIP Support Quick Bar */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-black shadow-xs">
                    💬
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Dedicated VIP Concierge</h4>
                    <p className="text-[11px] text-slate-500">24/7 dedicated support host available for high-tier players.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('support')}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                >
                  Open Chat
                </button>
              </div>
            </div>
          )}

          {/* 4. TRANSACTION HISTORY */}
          {currentTab === 'transactions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Banking & Payment Records</h3>
                <p className="text-xs text-slate-500 mt-0.5">All deposits and withdrawals processed on your account.</p>
              </div>

              <div className="space-y-3">
                {[...userDeposits, ...userWithdrawals].length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">No transactions recorded yet.</div>
                ) : (
                  [...userDeposits, ...userWithdrawals].map((item: any, i) => {
                    const isDeposit = 'bonusAmount' in item;
                    return (
                      <div
                        key={i}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isDeposit ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isDeposit ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              {isDeposit ? `Deposit via ${item.method}` : `Withdrawal via ${item.method}`}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {new Date(item.createdAt).toLocaleString()} • Ref: {item.id}
                              {isDeposit && item.bonusAmount > 0 && (
                                <span className="text-amber-700 font-bold ml-1">
                                  (+{formatCurrency(item.bonusAmount)} Bonus)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-black text-sm ${isDeposit ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isDeposit ? `+${formatCurrency(item.amount)}` : `-${formatCurrency(item.amount)}`}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase inline-block mt-0.5 ${
                            item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 5. BETTING RECORDS */}
          {currentTab === 'games' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Live Gaming & Bet History</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track every spin, roll, and match round played.</p>
              </div>

              <div className="space-y-2">
                {gameHistory.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">No games played yet. Launch any 3D game to start winning!</div>
                ) : (
                  gameHistory.map(g => (
                    <div
                      key={g.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900">{g.gameTitle}</strong>
                        <div className="text-[10px] text-slate-400 font-mono">{g.timestamp}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black ${g.isWin ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {g.isWin ? `+${formatCurrency(g.payout)} (${g.multiplier.toFixed(1)}x)` : `-${formatCurrency(g.betAmount)}`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 6. REFERRAL & AFFILIATE */}
          {currentTab === 'affiliate' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-lg font-black text-slate-900">Refer & Earn Program</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Share your link. Earn up to 30% lifetime revenue share on every single bet your friends place.
                </p>
              </div>

              {/* Referral Link Copy Box */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-amber-900">Your Exclusive Invitation Link:</span>
                <div className="p-2.5 bg-white rounded-xl border border-amber-300 font-mono text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>https://{siteSettings.siteName.toLowerCase()}.com/join?ref={user.referralCode}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`https://${siteSettings.siteName.toLowerCase()}.com/join?ref=${user.referralCode}`)}
                    className="p-1 hover:bg-slate-100 rounded ml-2 shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs font-bold text-slate-500 uppercase">Friends Invited</span>
                  <span className="text-2xl font-black text-slate-900 block mt-1">{user.referralCount}</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs font-bold text-slate-500 uppercase">Commissions Paid</span>
                  <span className="text-2xl font-black text-emerald-600 block mt-1">
                    {formatCurrency(user.referralEarnings)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
