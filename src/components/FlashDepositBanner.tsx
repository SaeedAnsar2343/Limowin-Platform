import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Clock, ArrowRight, X, Sparkles } from 'lucide-react';

export const FlashDepositBanner: React.FC = () => {
  const { user, currency, formatCurrency, setActiveModal } = useApp();
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('limowin_flash_timer');
        if (stored) {
          const val = parseInt(stored, 10);
          if (val > 0) return val;
        }
      }
    } catch {}
    return 15 * 60; // 15 minutes default
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('limowin_flash_dismissed') === 'true';
      }
    } catch {}
    return false;
  });

  // Ticking countdown
  useEffect(() => {
    if (isDismissed || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        const next = Math.max(0, prev - 1);
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('limowin_flash_timer', next.toString());
          }
        } catch {}
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isDismissed, secondsLeft]);

  // Only show for non-depositing players who haven't dismissed
  if (isDismissed || secondsLeft <= 0 || (user && (user.totalDeposited || 0) > 0)) {
    return null;
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const bonusExample = currency === 'INR' ? '₹500 → Get ₹1,500' : '$10 → Get $30';

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('limowin_flash_dismissed', 'true');
      }
    } catch {}
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 py-2 sm:py-2.5 px-3 sm:px-4 shadow-lg border-b border-amber-400 select-none relative overflow-hidden transition-all">
      {/* Subtle shining light effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Urgency Badge & Offer */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="flex items-center space-x-1 bg-slate-950 text-amber-300 px-2 sm:px-2.5 py-0.5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-wider shrink-0 shadow-xs">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-current animate-bounce" />
            <span>15-MIN FLASH</span>
          </div>

          <div className="flex items-center space-x-1.5 font-black text-slate-950 truncate">
            <span className="hidden sm:inline">💥</span>
            <span className="truncate">
              <strong>+200% FIRST DEPOSIT MATCH:</strong> Deposit {bonusExample} + 5 Free Spins!
            </span>
          </div>
        </div>

        {/* Right: Countdown Timer & CTA Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 ml-auto sm:ml-0">
          {/* Animated Countdown */}
          <div className="flex items-center space-x-1 bg-slate-900/90 text-yellow-300 px-2 sm:px-3 py-1 rounded-xl font-mono font-black text-xs sm:text-sm border border-yellow-400/50 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeFormatted}</span>
          </div>

          {/* Deposit Trigger */}
          <button
            onClick={() => setActiveModal('deposit')}
            className="flex items-center space-x-1 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95 border border-amber-400/40"
          >
            <span>Claim Bonus</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </button>

          {/* Close / Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-800 hover:text-slate-950 hover:bg-black/10 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
