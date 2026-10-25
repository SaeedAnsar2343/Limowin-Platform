import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Target, CheckCircle2, Trophy, ArrowRight, X, Sparkles, ShieldCheck, Flame } from 'lucide-react';
import { GAMES_CATALOG } from '../data/gamesCatalog';

interface Mission {
  id: string;
  title: string;
  gameId: string;
  gameTitle: string;
  targetCount: number;
  inrReward: number;
  usdReward: number;
  icon: string;
  description: string;
}

const DAILY_MISSIONS: Mission[] = [
  {
    id: 'm-aviator',
    title: 'Aviator High Flyer',
    gameId: 'spribe-aviator',
    gameTitle: 'Spribe Aviator',
    targetCount: 5,
    inrReward: 20,
    usdReward: 0.4,
    icon: '🚀',
    description: 'Play 5 rounds of Aviator to earn instant bonus cash!'
  },
  {
    id: 'm-roulette',
    title: 'Roulette Strategist',
    gameId: 'roulette-3d-pro',
    gameTitle: 'European Roulette 3D',
    targetCount: 5,
    inrReward: 25,
    usdReward: 0.5,
    icon: '🎡',
    description: 'Spin 5 rounds of 3D Roulette table to unlock rewards.'
  },
  {
    id: 'm-deposit',
    title: 'Daily Bankroll Booster',
    gameId: 'deposit',
    gameTitle: 'Any Deposit',
    targetCount: 1,
    inrReward: 50,
    usdReward: 1.0,
    icon: '💰',
    description: 'Make any real cash deposit today to claim bonus match.'
  }
];

export const DailyMissionsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    user,
    gameHistory,
    currency,
    formatCurrency,
    claimDailyWheelReward,
    setActiveGame,
    showToast
  } = useApp();

  const [claimedIds, setClaimedIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined' && user) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const stored = localStorage.getItem(`limowin_claimed_missions_${user.id}_${todayStr}`);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return [];
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  // Compute progress for each mission from gameHistory
  const getMissionProgress = (mission: Mission): number => {
    if (!user) return 0;
    if (mission.id === 'm-deposit') {
      return (user.totalDeposited || 0) > 0 ? 1 : 0;
    }
    const matchingRounds = gameHistory.filter(g => g.gameId === mission.gameId);
    return Math.min(mission.targetCount, matchingRounds.length);
  };

  const handleClaim = (mission: Mission) => {
    if (!user) {
      setActiveModal('login');
      return;
    }
    if (claimedIds.includes(mission.id)) return;

    const reward = currency === 'INR' ? mission.inrReward : mission.usdReward;
    claimDailyWheelReward(reward);

    sound.playJackpot();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const updated = [...claimedIds, mission.id];
    setClaimedIds(updated);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`limowin_claimed_missions_${user.id}_${todayStr}`, JSON.stringify(updated));
      }
    } catch {}

    showToast(`🎯 Claimed ${formatCurrency(reward)} Bonus from ${mission.title}! (Play 5 games to unlock)`, 'win');
  };

  const handleGoToGame = (mission: Mission) => {
    if (mission.id === 'm-deposit') {
      setActiveModal('deposit');
      return;
    }
    const found = GAMES_CATALOG.find(g => g.id === mission.gameId);
    if (found) {
      setActiveModal(null);
      setActiveGame(found);
    }
  };

  if (activeModal !== 'dailyQuests') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 text-white relative overflow-hidden flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg">
            🎯
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-black text-white">Daily Missions &amp; Quests</h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Resets Daily
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete simple daily tasks to stack cash bonuses into your wallet!
            </p>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-3 my-2">
          {DAILY_MISSIONS.map(m => {
            const currentProgress = getMissionProgress(m);
            const isCompleted = currentProgress >= m.targetCount;
            const isClaimed = claimedIds.includes(m.id);
            const reward = currency === 'INR' ? m.inrReward : m.usdReward;
            const progressPercent = Math.min(100, (currentProgress / m.targetCount) * 100);

            return (
              <div
                key={m.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-amber-500/30 transition-all flex flex-col space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <h4 className="text-sm font-black text-white leading-tight">{m.title}</h4>
                      <p className="text-[11px] text-slate-400">{m.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 block">
                      +{formatCurrency(reward)}
                    </span>
                  </div>
                </div>

                {/* Progress bar & Action */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-700/50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-mono font-bold text-slate-300">
                        {currentProgress} / {m.targetCount}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {isClaimed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[11px] font-black uppercase flex items-center space-x-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Claimed</span>
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(m)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-[11px] font-black uppercase tracking-wider shadow-md transition-all transform active:scale-95 shrink-0 animate-bounce"
                    >
                      Claim {formatCurrency(reward)}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGoToGame(m)}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold uppercase transition-all flex items-center space-x-1 shrink-0"
                    >
                      <span>Play Now</span>
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Playthrough rule: 5 games on any title unlocks cash</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400">Date: {todayStr}</span>
        </div>
      </div>
    </div>
  );
};
