import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Bomb, Gem, Trophy } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

export const MinesEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [minesCount, setMinesCount] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mineLocations, setMineLocations] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameOver, setGameOver] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const plannedOutcomeRef = useRef<{ isWin: boolean; maxSafeClicks: number }>({ isWin: false, maxSafeClicks: 1 });

  useEffect(() => {
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  const startGame = () => {
    if (balance < bet) return;
    sound.playChip();
    setLastWin(null);

    // Calculate secret outcome
    const outcome = calculateWinOutcome(bet, 3.5);
    plannedOutcomeRef.current = {
      isWin: outcome.isWin,
      maxSafeClicks: outcome.isWin ? Math.floor(3 + Math.random() * 4) : Math.floor(1 + Math.random() * 2)
    };

    // Generate random mines
    const mines: number[] = [];
    while (mines.length < minesCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!mines.includes(idx)) mines.push(idx);
    }
    setMineLocations(mines);
    setRevealed([]);
    setMultiplier(1.0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const clickTile = (index: number) => {
    if (!isPlaying || revealed.includes(index) || gameOver) return;

    const currentClicks = revealed.length + 1;
    const hitMine = mineLocations.includes(index) || (!plannedOutcomeRef.current.isWin && currentClicks > plannedOutcomeRef.current.maxSafeClicks);

    if (hitMine) {
      // Hit a bomb!
      sound.playBounce();
      setGameOver(true);
      setIsPlaying(false);

      // Ensure index is shown as mine
      const updatedMines = mineLocations.includes(index) ? mineLocations : [...mineLocations, index];
      setMineLocations(updatedMines);
      setRevealed(Array.from({ length: 25 }, (_, i) => i)); // reveal all
      onPlay(bet, 0, false);
    } else {
      // Uncovered Diamond
      sound.playWin();
      const newRevealed = [...revealed, index];
      setRevealed(newRevealed);

      // Multiplier increases per diamond
      const nextMult = Number((1.0 + newRevealed.length * (0.25 + minesCount * 0.15)).toFixed(2));
      setMultiplier(nextMult);
    }
  };

  const cashOut = () => {
    if (!isPlaying || revealed.length === 0) return;
    setIsPlaying(false);
    setGameOver(true);
    sound.playJackpot();
    const winAmt = bet * multiplier * bonusMultiplier;
    setLastWin(winAmt);
    onPlay(bet, multiplier, true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center shadow-2xl">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bomb className="w-5 h-5 text-rose-500" />
            <span className="text-white font-bold">{game.title} (5x5 Grid)</span>
          </div>

          {lastWin !== null && lastWin > 0 && (
            <div className="bg-emerald-900 text-emerald-300 px-4 py-1 rounded-full font-black text-xs flex items-center space-x-1.5 animate-bounce shadow-lg">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>CASHED OUT +{formatCurrency(lastWin)}!</span>
            </div>
          )}

          {isPlaying && (
            <div className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-black">
              Current: {multiplier.toFixed(2)}x ({formatCurrency(bet * multiplier * bonusMultiplier)})
            </div>
          )}
        </div>

        {/* 5x5 Mines Grid */}
        <div className="grid grid-cols-5 gap-2.5 w-full max-w-sm">
          {Array.from({ length: 25 }).map((_, idx) => {
            const isRev = revealed.includes(idx);
            const isMine = mineLocations.includes(idx);

            return (
              <button
                key={idx}
                onClick={() => clickTile(idx)}
                disabled={!isPlaying || (isRev && !gameOver)}
                className={`h-14 sm:h-16 rounded-xl font-black text-xl flex items-center justify-center transition-all ${
                  !isRev
                    ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700/60 shadow-inner'
                    : isMine
                    ? 'bg-rose-900/90 border border-rose-500 text-rose-200'
                    : 'bg-emerald-900/80 border border-emerald-400 text-emerald-300'
                }`}
              >
                {isRev ? (
                  isMine ? (
                    <Bomb className="w-6 h-6 animate-bounce text-rose-400" />
                  ) : (
                    <Gem className="w-6 h-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  )
                ) : (
                  <span className="text-slate-600 text-xs">?</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Console */}
        <div className="w-full mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Bet:</span>
            {currencyConfig.betPresets.slice(0, 5).map(val => (
              <button
                key={val}
                onClick={() => {
                  setBet(val);
                  sound.playChip();
                }}
                disabled={isPlaying}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                  bet === val
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>

          {isPlaying && revealed.length > 0 ? (
            <button
              onClick={cashOut}
              className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center space-x-1.5"
            >
              <Gem className="w-4 h-4" />
              <span>CASH OUT {formatCurrency(bet * multiplier * bonusMultiplier)}</span>
            </button>
          ) : (
            <button
              onClick={startGame}
              disabled={isPlaying || balance < bet}
              className={`py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                balance < bet
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
              }`}
            >
              {balance < bet ? 'Low Balance' : `START ${formatCurrency(bet)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
