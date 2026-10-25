import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, RefreshCcw, ArrowRight, X, ShieldAlert, Sparkles } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export const ZeroBalanceRescueModal: React.FC = () => {
  const { activeModal, setActiveModal, currency } = useApp();

  if (activeModal !== 'zeroBalanceRescue') return null;

  const handleDepositNow = () => {
    sound.playChip();
    setActiveModal('deposit');
  };

  const handleClose = () => {
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-950 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>VIP Loss Shield Protection</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-wide">
          👑 Ran Out of Chips? <br />
          <span className="text-amber-400">Claim 50% VIP Reload</span>
        </h2>

        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
          Don't leave the table on a loss! The House Concierge has granted your account a <span className="text-amber-300 font-bold">50% Instant Bankroll Reload Booster</span> on your next deposit.
        </p>

        {/* Visual Pill */}
        <div className="my-5 p-4 bg-slate-950/70 border border-indigo-500/30 rounded-2xl flex items-center justify-center space-x-3 shadow-inner">
          <RefreshCcw className="w-6 h-6 text-amber-400 animate-spin" />
          <div className="text-left">
            <span className="text-sm font-black text-white block">
              +50% Extra Reload Balance
            </span>
            <span className="text-[11px] text-slate-400">
              {currency === 'INR' ? 'Deposit ₹500 & Play with ₹750!' : 'Deposit $20 & Play with $30!'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDepositNow}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
        >
          <span>Reload Balance &amp; Win Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleClose}
          className="mt-3 text-xs text-slate-500 hover:text-slate-400 underline transition-colors"
        >
          Close and return to games
        </button>
      </div>
    </div>
  );
};
