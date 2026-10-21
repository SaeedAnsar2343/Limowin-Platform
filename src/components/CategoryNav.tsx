import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Sparkles, Tv, Dices, Trophy, Spade, Ticket } from 'lucide-react';

export const CategoryNav: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useApp();

  const categories = [
    { id: 'all', label: 'ALL GAMES', icon: Sparkles },
    { id: 'hot', label: 'HOT GAMES', icon: Flame, isHot: true },
    { id: 'live', label: 'LIVE CASINO', icon: Tv },
    { id: 'slot', label: 'SLOTS', icon: Dices },
    { id: 'sports', label: 'SPORTS', icon: Trophy },
    { id: 'card', label: 'CARD GAMES', icon: Spade },
    { id: 'lottery', label: 'LOTTERY & CRASH', icon: Ticket }
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 shadow-2xs sticky top-16 sm:top-18 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-x-auto py-2 sm:py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 scale-102 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${cat.isHot ? 'text-rose-500 animate-pulse' : isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
