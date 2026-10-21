import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Volume2, VolumeX, Wallet, ShieldCheck, Flame, Lock, ArrowDownCircle, Sparkles } from 'lucide-react';
import { SlotGame3D } from './engines/SlotGame3D';
import { Roulette3D } from './engines/Roulette3D';
import { DiceGame3D } from './engines/DiceGame3D';
import { CardGameEngine } from './engines/CardGameEngine';
import { BlackjackEngine } from './engines/BlackjackEngine';
import { AndarBaharEngine } from './engines/AndarBaharEngine';
import { TeenPattiEngine } from './engines/TeenPattiEngine';
import { BaccaratEngine } from './engines/BaccaratEngine';
import { PokerHoldemEngine } from './engines/PokerHoldemEngine';
import { WheelGameShowEngine } from './engines/WheelGameShowEngine';
import { CrashAviatorEngine } from './engines/CrashAviatorEngine';
import { PlinkoEngine } from './engines/PlinkoEngine';
import { MinesEngine } from './engines/MinesEngine';
import { WingoLotteryEngine } from './engines/WingoLotteryEngine';
import { SportsMatchEngine } from './engines/SportsMatchEngine';
import { ScratchCardEngine } from './engines/ScratchCardEngine';

export const PlayModal: React.FC = () => {
  const {
    activeGame,
    setActiveGame,
    user,
    soundMuted,
    setSoundMuted,
    recordGameResult,
    gameOverrides,
    siteSettings,
    currency,
    currencyConfig,
    formatCurrency,
    setActiveModal
  } = useApp();

  if (!activeGame) return null;

  const currentBal = user ? user.balance : 0;
  const override = gameOverrides[activeGame.id];
  const effectiveBonusMult = override ? override.bonusMultiplier : (activeGame.bonusMultiplier || 1.0);

  const handlePlayOutcome = (bet: number, multiplier: number, isWin: boolean) => {
    recordGameResult(activeGame, bet, multiplier, isWin);
  };

  const renderEngine = () => {
    const gameKey = (activeGame.title + ' ' + activeGame.id).toLowerCase();

    switch (activeGame.engineType) {
      case 'slot':
        return (
          <SlotGame3D
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'roulette':
        return (
          <Roulette3D
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'dice':
        return (
          <DiceGame3D
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'card':
        // Real game-specific routing:
        if (gameKey.includes('blackjack') || gameKey.includes('pontoon') || gameKey.includes('spanish-21') || gameKey.includes('switch')) {
          return (
            <BlackjackEngine
              game={activeGame}
              balance={currentBal}
              bonusMultiplier={effectiveBonusMult}
              onPlay={handlePlayOutcome}
            />
          );
        }
        if (gameKey.includes('andar') || gameKey.includes('bahar')) {
          return (
            <AndarBaharEngine
              game={activeGame}
              balance={currentBal}
              bonusMultiplier={effectiveBonusMult}
              onPlay={handlePlayOutcome}
            />
          );
        }
        if (gameKey.includes('teen-patti') || gameKey.includes('teen patti') || gameKey.includes('3-patti') || gameKey.includes('ak47')) {
          return (
            <TeenPattiEngine
              game={activeGame}
              balance={currentBal}
              bonusMultiplier={effectiveBonusMult}
              onPlay={handlePlayOutcome}
            />
          );
        }
        if (gameKey.includes('baccarat') || gameKey.includes('punto')) {
          return (
            <BaccaratEngine
              game={activeGame}
              balance={currentBal}
              bonusMultiplier={effectiveBonusMult}
              onPlay={handlePlayOutcome}
            />
          );
        }
        if (
          gameKey.includes('poker') ||
          gameKey.includes('holdem') ||
          gameKey.includes('hold\'em') ||
          gameKey.includes('caribbean') ||
          gameKey.includes('stud') ||
          gameKey.includes('oasis') ||
          gameKey.includes('russian') ||
          gameKey.includes('pai gow')
        ) {
          return (
            <PokerHoldemEngine
              game={activeGame}
              balance={currentBal}
              bonusMultiplier={effectiveBonusMult}
              onPlay={handlePlayOutcome}
            />
          );
        }
        if (
          gameKey.includes('wheel') ||
          gameKey.includes('crazy-time') ||
          gameKey.includes('crazy time') ||
          gameKey.includes('monopoly') ||
          gameKey.includes('mega-ball') ||
          gameKey.includes('mega ball') ||
          gameKey.includes('triple-chance') ||
          gameKey.includes('triple chance')
        ) {
          return (
            <WheelGameShowEngine
              game={activeGame}
              balance={currentBal}
              bonusMultiplier={effectiveBonusMult}
              onPlay={handlePlayOutcome}
            />
          );
        }
        // Default card game: Dragon Tiger duel
        return (
          <CardGameEngine
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'crash':
        return (
          <CrashAviatorEngine
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'plinko':
        return (
          <PlinkoEngine
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'mines':
        return (
          <MinesEngine
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'wingo':
        return (
          <WingoLotteryEngine
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'sports':
        return (
          <SportsMatchEngine
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      case 'scratch':
        return (
          <ScratchCardEngine
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
      default:
        return (
          <SlotGame3D
            game={activeGame}
            balance={currentBal}
            bonusMultiplier={effectiveBonusMult}
            onPlay={handlePlayOutcome}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden my-auto min-h-screen sm:min-h-0 flex flex-col">
        {/* Game Theater Top Bar - 100% Mobile Fitting */}
        <div className="bg-slate-950 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-white font-black text-xs sm:text-sm uppercase tracking-wide truncate">
              {activeGame.title}
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-bold shrink-0">
              {activeGame.provider}
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold shrink-0">
              {currency} MODE
            </span>
            {effectiveBonusMult > 1 && (
              <span className="hidden md:inline-flex text-[10px] bg-rose-950 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold items-center space-x-1 shrink-0">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>{effectiveBonusMult}x Active</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Live Wallet Balance */}
            {user && (
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl shrink-0">
                <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-black text-emerald-400 leading-tight">
                  {formatCurrency(currentBal)}
                </span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
              title={soundMuted ? 'Unmute' : 'Mute'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Close Button - ALWAYS visible on the right */}
            <button
              onClick={() => setActiveGame(null)}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-md shrink-0"
              title="Close Game"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Game Render Body or Strict Login/Deposit Blockers */}
        <div className="p-2 sm:p-6 bg-slate-950/60 overflow-y-auto max-h-[calc(100vh-60px)] sm:max-h-[85vh] flex-1">
          {!user ? (
            /* 1. Strict Login Required Barrier */
            <div className="py-16 px-6 text-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">Player Login Required</h3>
                <p className="text-xs text-slate-400">
                  To play <strong>{activeGame.title}</strong> and win real cash in {currency === 'INR' ? '₹ Indian Rupees' : '$ USD / USDT'}, you must sign in or register an account.
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>New player? Sign up now and get an instant deposit welcome bonus!</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveGame(null);
                    setActiveModal('login');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setActiveGame(null);
                    setActiveModal('register');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20"
                >
                  Create Account &amp; Play
                </button>
              </div>
            </div>
          ) : currentBal < currencyConfig.minBet ? (
            /* 2. Strict Insufficient Balance Barrier */
            <div className="py-16 px-6 text-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <ArrowDownCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">Deposit Balance to Play</h3>
                <p className="text-xs text-slate-400">
                  Your current balance is <strong className="text-rose-400 font-bold">{formatCurrency(currentBal)}</strong>. The minimum bet for {activeGame.title} is <strong className="text-yellow-400 font-bold">{formatCurrency(currencyConfig.minBet)}</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300">
                Deposit with USDT, UPI, or Bank Transfer to start spinning and unlock your promotional bonus.
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveGame(null);
                    setActiveModal('deposit');
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs uppercase shadow-lg shadow-emerald-600/20"
                >
                  Deposit Funds Now
                </button>
              </div>
            </div>
          ) : (
            /* 3. Authorized & Funded - Render 3D Game */
            renderEngine()
          )}
        </div>

        {/* Game Footer Security Badge */}
        <div className="bg-slate-950 px-6 py-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Provably Fair SHA-256 Certified • Licensed Gaming Engine</span>
          </div>
          <div className="text-right">
            <span>Powered by {siteSettings.siteName} Game Server v4.2 ({currency})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
