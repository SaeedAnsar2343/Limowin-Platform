import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Play, RotateCcw, Zap, Trophy } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

const SYMBOLS = [
  { icon: '🍒', name: 'Cherry', mult: 2, weight: 30 },
  { icon: '🍋', name: 'Lemon', mult: 3, weight: 25 },
  { icon: '🍇', name: 'Grape', mult: 5, weight: 20 },
  { icon: '🔔', name: 'Bell', mult: 10, weight: 15 },
  { icon: '⭐', name: 'Star', mult: 25, weight: 10 },
  { icon: '💎', name: 'Diamond', mult: 50, weight: 6 },
  { icon: '7️⃣', name: 'Seven', mult: 100, weight: 3 },
  { icon: '👑', name: 'Crown Wild', mult: 250, weight: 1 }
];

export const SlotGame3D: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [isSpinning, setIsSpinning] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['🍒', '🍋', '🍇'],
    ['🔔', '⭐', '💎'],
    ['7️⃣', '🍒', '🔔'],
    ['🍇', '💎', '⭐'],
    ['🍋', '7️⃣', '👑']
  ]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winLine, setWinLine] = useState<number | null>(null);
  const [autoSpin, setAutoSpin] = useState(false);
  const autoSpinRef = useRef(false);

  autoSpinRef.current = autoSpin;

  // Sync bet to currency config min bet if bet is below minimum or above max
  useEffect(() => {
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  const getRandomSymbol = () => {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const s of SYMBOLS) {
      if (rand < s.weight) return s;
      rand -= s.weight;
    }
    return SYMBOLS[0];
  };

  const spin = () => {
    if (isSpinning || balance < bet) return;
    setIsSpinning(true);
    setLastWin(null);
    setWinLine(null);
    sound.playChip();

    const spinDuration = turbo ? 400 : 1100;
    const intervalTime = turbo ? 40 : 80;

    // Spin animation ticks
    const interval = setInterval(() => {
      sound.playReelTick();
      setReels(prev =>
        prev.map(() => [
          getRandomSymbol().icon,
          getRandomSymbol().icon,
          getRandomSymbol().icon
        ])
      );
    }, intervalTime);

    setTimeout(() => {
      clearInterval(interval);

      // Secret House Edge Outcome:
      // Controlled 1% (large bets), 2-5% (mid bets), 10% (small bets), first 2 games hook for new players
      const outcome = calculateWinOutcome(bet, 20.0);
      let finalReels: string[][];
      let winMultiplier = 0;

      if (outcome.isWin) {
        const winningSym = getRandomSymbol();
        const matchCount = Math.random() > 0.4 ? 3 : (Math.random() > 0.6 ? 4 : 5);
        winMultiplier = outcome.multiplier;

        finalReels = Array.from({ length: 5 }, (_, col) => {
          const isMatchCol = col < matchCount;
          return [
            getRandomSymbol().icon,
            isMatchCol ? winningSym.icon : getRandomSymbol().icon,
            getRandomSymbol().icon
          ];
        });
        setWinLine(1); // Middle line hit
        setLastWin(bet * winMultiplier * bonusMultiplier);
      } else {
        // Guaranteed non-matching payline
        const syms = [SYMBOLS[0].icon, SYMBOLS[1].icon, SYMBOLS[2].icon, SYMBOLS[3].icon, SYMBOLS[4].icon];
        finalReels = Array.from({ length: 5 }, (_, col) => [
          getRandomSymbol().icon,
          syms[col % syms.length],
          getRandomSymbol().icon
        ]);
        winMultiplier = 0;
        setWinLine(null);
        setLastWin(null);
      }

      setReels(finalReels);
      setIsSpinning(false);
      onPlay(bet, winMultiplier, outcome.isWin);

      if (autoSpinRef.current) {
        setTimeout(spin, 500);
      }
    }, spinDuration);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      {/* Slot Machine Cabinet Header */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-t-2xl p-4 shadow-xl border-t-2 border-yellow-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xl shadow-md">
            🎰
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-wider">{game.title}</h3>
            <span className="text-xs font-bold text-amber-950 bg-amber-300/60 px-2 py-0.5 rounded-full">
              3D Dynamic Engine • {game.provider}
            </span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-4 py-1.5 rounded-full font-black text-sm flex items-center space-x-2 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* 3D Glass Reels Window */}
      <div className="w-full bg-slate-950 border-x-4 border-slate-800 p-6 shadow-2xl relative overflow-hidden">
        {/* Neon Light Bars */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* Payline Marker in Middle */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-yellow-400/30 pointer-events-none z-10" />

        {/* 5-Reel Display */}
        <div className="grid grid-cols-5 gap-3 relative z-0">
          {reels.map((col, colIdx) => (
            <div
              key={colIdx}
              className={`flex flex-col space-y-2 bg-gradient-to-b from-slate-900 to-slate-800 p-2 rounded-xl border ${
                isSpinning ? 'border-amber-400/50 blur-[0.4px]' : 'border-slate-700'
              } shadow-inner transition-all duration-75`}
            >
              {col.map((sym, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`h-20 sm:h-24 flex items-center justify-center text-4xl sm:text-5xl rounded-lg bg-gradient-to-b from-slate-800 to-slate-900/90 shadow border border-slate-700/60 transition-transform ${
                    winLine === rowIdx && lastWin ? 'scale-105 border-yellow-400 ring-2 ring-yellow-400/50 bg-amber-950/40' : ''
                  }`}
                >
                  <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">{sym}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Control Console */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-4 sm:p-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Bet Selector */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bet Amount ({currencyConfig.code})
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {currencyConfig.betPresets.slice(0, 5).map(val => (
                <button
                  key={val}
                  onClick={() => {
                    setBet(val);
                    sound.playChip();
                  }}
                  disabled={isSpinning}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    bet === val
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Features */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => setTurbo(!turbo)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                turbo
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Zap className={`w-4 h-4 ${turbo ? 'fill-amber-400' : ''}`} />
              <span>Turbo</span>
            </button>

            <button
              onClick={() => setAutoSpin(!autoSpin)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                autoSpin
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${autoSpin ? 'animate-spin' : ''}`} />
              <span>{autoSpin ? 'Stop Auto' : 'Auto Spin'}</span>
            </button>
          </div>

          {/* Big Spin Button */}
          <div className="flex justify-end">
            <button
              onClick={spin}
              disabled={isSpinning || balance < bet}
              className={`w-full sm:w-48 py-3.5 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
                isSpinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : balance < bet
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 hover:shadow-yellow-500/25'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {isSpinning ? 'Spinning...' : balance < bet ? 'Low Balance' : `SPIN ${formatCurrency(bet)}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
