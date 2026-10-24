import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Sparkles, TrendingUp, Zap } from 'lucide-react';

interface WinnerEvent {
  id: string;
  userName: string;
  avatar: string;
  gameTitle: string;
  amountINR: number;
  amountUSD: number;
  multiplier: number;
  timeAgo: string;
}

const SEED_WINNERS: WinnerEvent[] = [
  { id: 'w1', userName: 'Rahul S.', avatar: '🇮🇳', gameTitle: 'Gates of Olympus', amountINR: 14200, amountUSD: 170, multiplier: 14.2, timeAgo: 'Just now' },
  { id: 'w2', userName: 'David M.', avatar: '🇺🇸', gameTitle: 'Spribe Aviator', amountINR: 8500, amountUSD: 102, multiplier: 4.8, timeAgo: '12s ago' },
  { id: 'w3', userName: 'Amit K.', avatar: '🇮🇳', gameTitle: 'Roulette 3D Pro', amountINR: 18000, amountUSD: 216, multiplier: 36.0, timeAgo: '28s ago' },
  { id: 'w4', userName: 'Vikram P.', avatar: '🇮🇳', gameTitle: 'Sweet Bonanza', amountINR: 6400, amountUSD: 77, multiplier: 8.5, timeAgo: '41s ago' },
  { id: 'w5', userName: 'Elena R.', avatar: '💎', gameTitle: 'Crazy Time VIP', amountINR: 25000, amountUSD: 300, multiplier: 25.0, timeAgo: '55s ago' },
  { id: 'w6', userName: 'Sanjay T.', avatar: '🇮🇳', gameTitle: 'Teen Patti 20-20', amountINR: 4200, amountUSD: 50, multiplier: 3.2, timeAgo: '1m ago' },
  { id: 'w7', userName: 'Marcus C.', avatar: '🇺🇸', gameTitle: 'Blackjack Royale', amountINR: 12000, amountUSD: 144, multiplier: 2.5, timeAgo: '1m ago' },
  { id: 'w8', userName: 'Pooja B.', avatar: '🇮🇳', gameTitle: 'Mines Diamond Hunt', amountINR: 9800, amountUSD: 118, multiplier: 5.6, timeAgo: '2m ago' }
];

export const LiveWinnersTicker: React.FC = () => {
  const { currency, formatCurrency } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % SEED_WINNERS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const winner = SEED_WINNERS[currentIdx];
  const winAmount = currency === 'INR' ? winner.amountINR : winner.amountUSD;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-1.5">
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800/90 rounded-2xl px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shadow-md overflow-hidden">
        {/* Left Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[10px] sm:text-xs font-black uppercase text-amber-400 flex items-center space-x-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400 fill-current" />
            <span className="hidden sm:inline">LIVE RECENT WINNERS</span>
            <span className="sm:hidden">WINS</span>
          </span>
        </div>

        {/* Center Live Winner Animated Slide */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div
            key={winner.id}
            className="flex items-center space-x-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300 truncate"
          >
            <span className="text-base">{winner.avatar}</span>
            <span className="font-bold text-white truncate">{winner.userName}</span>
            <span className="text-slate-500 hidden md:inline">won on</span>
            <span className="text-amber-300 font-bold hidden sm:inline truncate">{winner.gameTitle}</span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black px-2 py-0.5 rounded-full text-[11px] shrink-0">
              +{formatCurrency(winAmount)} ({winner.multiplier.toFixed(1)}x)
            </span>
            <span className="text-[10px] text-slate-500 hidden lg:inline">{winner.timeAgo}</span>
          </div>
        </div>

        {/* Right High Roller Tag */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Real-time Certified Payouts</span>
        </div>
      </div>
    </div>
  );
};
