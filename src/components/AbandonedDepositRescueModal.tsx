import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Timer, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export const AbandonedDepositRescueModal: React.FC = () => {
  const { activeModal, setActiveModal, formatCurrency, currency } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(180); // 3 minutes urgency countdown

  useEffect(() => {
    if (activeModal !== 'abandonedRescue') return;
    setSecondsLeft(180);
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeModal]);

  if (activeModal !== 'abandonedRescue') return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const bonusAmount = currency === 'INR' ? '₹500 INR' : '$15 USD';

  const handleClaim = () => {
    sound.playChip();
    setActiveModal('deposit');
  };

  const handleClose = () => {
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Saeed's VIP Concierge Desk</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-wide">
          ⚡ WAIT! Don't Miss Your <span className="text-amber-400">+25% FLASH BOOST</span>
        </h2>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Super Admin Saeed has authorized a special <span className="text-amber-300 font-bold">Extra +25% Real Cash Match</span> ({bonusAmount}) if you complete your deposit before the timer expires!
        </p>

        {/* Urgency Countdown Box */}
        <div className="my-5 p-3.5 bg-slate-950/80 border border-amber-500/40 rounded-2xl flex items-center justify-center space-x-3 shadow-inner">
          <Timer className="w-5 h-5 text-rose-400 animate-pulse" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Offer Expires In
            </span>
            <span className="text-2xl font-black font-mono text-rose-400 tracking-wider">
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-1.5 text-left text-xs text-slate-300 mb-6 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant UPI, GPay &amp; USDT Auto-Approval</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Valid on all 200+ 3D live games</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClaim}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
        >
          <span>Claim +25% Flash Match Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleClose}
          className="mt-3 text-xs text-slate-500 hover:text-slate-400 underline transition-colors"
        >
          No thanks, I will forfeit this match
        </button>
      </div>
    </div>
  );
};
