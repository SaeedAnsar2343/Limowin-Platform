import React, { useState, useEffect } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Dices, Trophy, Sparkles } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [25, 75], [75, 25], [75, 75]],
  5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
  6: [[25, 20], [25, 50], [25, 80], [75, 20], [75, 50], [75, 80]]
};

export const DiceGame3D: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();

  const titleLower = (game.title + ' ' + game.id).toLowerCase();
  const is7Up7Down = titleLower.includes('7 up') || titleLower.includes('seven up');
  const isCoinToss = titleLower.includes('coin');
  const numDice = isCoinToss ? 1 : is7Up7Down ? 2 : 3;

  const [dice, setDice] = useState<number[]>(is7Up7Down ? [3, 4] : isCoinToss ? [1] : [4, 3, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedBet, setSelectedBet] = useState<string>(is7Up7Down ? 'up' : isCoinToss ? 'heads' : 'small');
  const [betAmount, setBetAmount] = useState(currencyConfig.minBet);
  const [lastWin, setLastWin] = useState<number | null>(null);

  useEffect(() => {
    if (betAmount < currencyConfig.minBet || betAmount > currencyConfig.maxBet) {
      setBetAmount(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  const rollDice = () => {
    if (isRolling || balance < betAmount) return;
    setIsRolling(true);
    setLastWin(null);
    sound.playDiceRoll();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDice(Array.from({ length: numDice }).map(() => Math.floor(1 + Math.random() * (isCoinToss ? 2 : 6))));
      rollCount++;
      if (rollCount > 9) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 85);
  };

  const finalizeRoll = () => {
    let theoreticalMult = 2.0;
    if (is7Up7Down) {
      theoreticalMult = selectedBet === 'seven' ? 5.0 : 2.0;
    } else if (isCoinToss) {
      theoreticalMult = 1.95;
    } else {
      theoreticalMult = selectedBet === 'triple' ? 30.0 : 2.0;
    }

    const outcome = calculateWinOutcome(betAmount, theoreticalMult);

    let finalDice: number[] = [];

    if (isCoinToss) {
      const isHeads = outcome.isWin ? selectedBet === 'heads' : selectedBet !== 'heads';
      finalDice = [isHeads ? 1 : 2];
    } else if (is7Up7Down) {
      // 2 Dice
      let d1 = 3, d2 = 4;
      if (outcome.isWin) {
        if (selectedBet === 'down') [d1, d2] = [2, 3]; // sum 5
        else if (selectedBet === 'seven') [d1, d2] = [3, 4]; // sum 7
        else [d1, d2] = [5, 4]; // sum 9
      } else {
        if (selectedBet === 'down') [d1, d2] = [4, 5]; // sum 9
        else if (selectedBet === 'seven') [d1, d2] = [2, 4]; // sum 6
        else [d1, d2] = [1, 3]; // sum 4
      }
      finalDice = [d1, d2];
    } else {
      // 3 Dice (Sic Bo)
      let d1 = 4, d2 = 3, d3 = 5;
      if (outcome.isWin) {
        if (selectedBet === 'triple') [d1, d2, d3] = [5, 5, 5];
        else if (selectedBet === 'small') [d1, d2, d3] = [2, 3, 4]; // 9
        else [d1, d2, d3] = [5, 4, 5]; // 14
      } else {
        if (selectedBet === 'triple') [d1, d2, d3] = [1, 2, 4];
        else if (selectedBet === 'small') [d1, d2, d3] = [5, 5, 4]; // 14
        else [d1, d2, d3] = [2, 2, 3]; // 7
      }
      finalDice = [d1, d2, d3];
    }

    setDice(finalDice);
    setIsRolling(false);

    if (outcome.isWin) {
      const winAmt = betAmount * theoreticalMult * bonusMultiplier;
      setLastWin(winAmt);
      sound.playWin();
      onPlay(betAmount, theoreticalMult, true);
    } else {
      sound.playLose();
      onPlay(betAmount, 0, false);
    }
  };

  const totalSum = isCoinToss ? 0 : dice.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Table Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🎲
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">
              {isCoinToss ? '3D Heads or Tails' : is7Up7Down ? '2-Dice 7 Up 7 Down' : '3-Dice Sic Bo Dome'} • {game.provider}
            </span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* 3D Dice Felt Table */}
      <div className="w-full bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 border-x-4 border-slate-800 p-4 sm:p-8 flex flex-col items-center justify-center shadow-inner relative overflow-hidden min-h-[220px] sm:min-h-[260px]">
        {/* Felt Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-9xl">
          {isCoinToss ? '🪙' : '🎲'}
        </div>

        {/* Dice / Coin Elements */}
        {isCoinToss ? (
          <div
            className={`w-28 h-28 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 border-4 border-yellow-200 shadow-2xl flex items-center justify-center text-slate-950 font-black text-3xl transition-transform ${
              isRolling ? 'rotate-180 scale-90 blur-[0.5px]' : 'hover:scale-105'
            }`}
          >
            {dice[0] === 1 ? 'HEADS' : 'TAILS'}
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3 sm:space-x-6 z-10">
            {dice.map((val, idx) => (
              <div
                key={idx}
                className={`w-16 h-16 sm:w-22 sm:h-22 bg-gradient-to-tr from-slate-100 via-white to-slate-200 rounded-2xl p-2 shadow-2xl border-2 border-slate-300 relative transition-transform transform ${
                  isRolling ? 'rotate-12 scale-95 blur-[0.5px]' : 'hover:scale-105'
                }`}
              >
                {DOT_POSITIONS[val].map((pos, pIdx) => (
                  <div
                    key={pIdx}
                    className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-rose-600 rounded-full shadow-inner transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pos[0]}%`, top: `${pos[1]}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Result Callout */}
        {!isCoinToss && (
          <div className="mt-5 z-10 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/60 px-4 py-1.5 rounded-2xl shadow-lg">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase">Total Sum:</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">{totalSum}</span>
            <span className="text-xs text-slate-400 font-mono">({dice.join(' + ')})</span>
          </div>
        )}
      </div>

      {/* Betting Options */}
      <div className="w-full bg-slate-900 border-x-4 border-slate-800 p-3 sm:p-4">
        {isCoinToss ? (
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onClick={() => setSelectedBet('heads')}
              className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedBet === 'heads'
                  ? 'bg-amber-500 border-yellow-300 text-slate-950 font-black ring-2 ring-yellow-400 shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="text-xs font-black">🪙 HEADS (1.95x)</span>
            </button>
            <button
              onClick={() => setSelectedBet('tails')}
              className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedBet === 'tails'
                  ? 'bg-amber-500 border-yellow-300 text-slate-950 font-black ring-2 ring-yellow-400 shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="text-xs font-black">🪙 TAILS (1.95x)</span>
            </button>
          </div>
        ) : is7Up7Down ? (
          <div className="grid grid-cols-3 gap-2.5 max-w-lg mx-auto">
            <button
              onClick={() => setSelectedBet('down')}
              className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedBet === 'down'
                  ? 'bg-blue-600 border-blue-400 text-white font-black ring-2 ring-blue-300 shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="text-xs font-black">7 DOWN (2-6)</span>
              <span className="text-[10px] opacity-80">Payout 2x</span>
            </button>

            <button
              onClick={() => setSelectedBet('seven')}
              className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedBet === 'seven'
                  ? 'bg-amber-500 border-yellow-300 text-slate-950 font-black ring-2 ring-yellow-300 shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="text-xs font-black">LUCKY 7 (Exact)</span>
              <span className="text-[10px] opacity-80 font-black text-amber-200">Payout 5x</span>
            </button>

            <button
              onClick={() => setSelectedBet('up')}
              className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedBet === 'up'
                  ? 'bg-rose-600 border-rose-400 text-white font-black ring-2 ring-rose-300 shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="text-xs font-black">7 UP (8-12)</span>
              <span className="text-[10px] opacity-80">Payout 2x</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { id: 'small', label: 'Small (4-10)', mult: '2x' },
              { id: 'big', label: 'Big (11-17)', mult: '2x' },
              { id: 'triple', label: 'Any Triple', mult: '30x' },
              { id: 'down', label: 'Under 7', mult: '2x' },
              { id: 'seven', label: 'Exact 7', mult: '5x' },
              { id: 'up', label: 'Over 7', mult: '2x' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedBet(opt.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  selectedBet === opt.id
                    ? 'bg-amber-500 border-yellow-300 text-slate-950 font-black shadow-lg ring-2 ring-yellow-400 scale-102'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span className="text-[11px] font-black">{opt.label}</span>
                <span className="text-[10px] opacity-75">{opt.mult}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Control Console - 100% Mobile Fitting & Zero Overlap */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Bet presets: horizontally scrollable, compact, zero overlap */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase mr-1 shrink-0">Bet:</span>
          {currencyConfig.betPresets.slice(0, 5).map(val => (
            <button
              key={val}
              onClick={() => {
                setBetAmount(val);
                sound.playChip();
              }}
              disabled={isRolling}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-xs shrink-0 whitespace-nowrap transition-all ${
                betAmount === val
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-102 ring-2 ring-yellow-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {formatCurrency(val).replace('.00', '')}
            </button>
          ))}
        </div>

        <button
          onClick={rollDice}
          disabled={isRolling || balance < betAmount}
          className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            isRolling
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : balance < betAmount
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'Rolling...' : balance < betAmount ? 'Low Balance' : `ROLL ${formatCurrency(betAmount)}`}</span>
        </button>
      </div>
    </div>
  );
};
