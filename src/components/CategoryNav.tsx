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
    <div className="w-full bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 scale-102 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${cat.isHot ? 'text-rose-500 animate-pulse' : isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
