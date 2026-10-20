import React, { useState, useEffect } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Dices, Trophy } from 'lucide-react';

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
  const [dice, setDice] = useState<number[]>([4, 3, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedBet, setSelectedBet] = useState<'down' | 'seven' | 'up' | 'small' | 'big' | 'triple'>('up');
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
      setDice([
        Math.floor(1 + Math.random() * 6),
        Math.floor(1 + Math.random() * 6),
        Math.floor(1 + Math.random() * 6)
      ]);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 90);
  };

  const finalizeRoll = () => {
    const theoreticalMult = selectedBet === 'triple' ? 30 : selectedBet === 'seven' ? 5 : 2;
    const outcome = calculateWinOutcome(betAmount, theoreticalMult);

    let d1: number, d2: number, d3: number;

    const generateRandomRoll = () => [
      Math.floor(1 + Math.random() * 6),
      Math.floor(1 + Math.random() * 6),
      Math.floor(1 + Math.random() * 6)
    ];

    const checkCondition = (r1: number, r2: number, r3: number) => {
      const tot = r1 + r2 + r3;
      const trip = r1 === r2 && r2 === r3;
      if (selectedBet === 'down') return tot < 7;
      if (selectedBet === 'seven') return tot === 7;
      if (selectedBet === 'up') return tot > 7;
      if (selectedBet === 'small') return tot >= 4 && tot <= 10 && !trip;
      if (selectedBet === 'big') return tot >= 11 && tot <= 17 && !trip;
      if (selectedBet === 'triple') return trip;
      return false;
    };

    // Find combination matching outcome
    let attempts = 0;
    do {
      [d1, d2, d3] = generateRandomRoll();
      attempts++;
    } while (checkCondition(d1, d2, d3) !== outcome.isWin && attempts < 100);

    // Fallbacks if loop exhausted
    if (checkCondition(d1, d2, d3) !== outcome.isWin) {
      if (outcome.isWin) {
        if (selectedBet === 'down') [d1, d2, d3] = [1, 2, 2];
        else if (selectedBet === 'seven') [d1, d2, d3] = [2, 2, 3];
        else if (selectedBet === 'up') [d1, d2, d3] = [4, 5, 4];
        else if (selectedBet === 'small') [d1, d2, d3] = [2, 3, 4];
        else if (selectedBet === 'big') [d1, d2, d3] = [5, 4, 6];
        else if (selectedBet === 'triple') [d1, d2, d3] = [4, 4, 4];
      } else {
        if (selectedBet === 'down') [d1, d2, d3] = [4, 4, 4];
        else if (selectedBet === 'seven') [d1, d2, d3] = [2, 3, 4];
        else if (selectedBet === 'up') [d1, d2, d3] = [1, 2, 2];
        else if (selectedBet === 'small') [d1, d2, d3] = [5, 5, 5];
        else if (selectedBet === 'big') [d1, d2, d3] = [2, 2, 2];
        else if (selectedBet === 'triple') [d1, d2, d3] = [1, 2, 3];
      }
    }

    setDice([d1, d2, d3]);
    setIsRolling(false);

    if (outcome.isWin) {
      setLastWin(betAmount * outcome.multiplier * bonusMultiplier);
    } else {
      setLastWin(null);
    }

    onPlay(betAmount, outcome.multiplier, outcome.isWin);
  };

  const totalSum = dice.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      {/* Title Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🎲
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{game.title}</h3>
            <span className="text-xs text-slate-400">3D Physics Simulation • {game.provider}</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-4 py-1.5 rounded-full font-black text-sm flex items-center space-x-2 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* 3D Dice Felt Table */}
      <div className="w-full bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 border-x-4 border-slate-800 p-8 flex flex-col items-center justify-center shadow-inner relative overflow-hidden min-h-[260px]">
        {/* Felt Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-9xl">
          🎲
        </div>

        {/* 3 Dice Elements */}
        <div className="flex items-center justify-center space-x-6 z-10">
          {dice.map((val, idx) => (
            <div
              key={idx}
              className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-slate-100 via-white to-slate-200 rounded-2xl p-2 shadow-2xl border-2 border-slate-300 relative transition-transform transform ${
                isRolling ? 'rotate-12 scale-95 blur-[0.5px]' : 'hover:scale-105'
              }`}
            >
              {DOT_POSITIONS[val].map((pos, pIdx) => (
                <div
                  key={pIdx}
                  className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-600 rounded-full shadow-inner transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos[0]}%`, top: `${pos[1]}%` }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Result Callout */}
        <div className="mt-6 z-10 flex items-center space-x-3 bg-slate-900/90 border border-slate-700/60 px-5 py-2 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Sum:</span>
          <span className="text-2xl font-black text-amber-400">{totalSum}</span>
          <span className="text-xs text-slate-400 font-mono">({dice.join(' + ')})</span>
        </div>
      </div>

      {/* Betting Controls & Options */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Bet Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {[
            { id: 'down', label: '2-6 (Under 7)', mult: '2x' },
            { id: 'seven', label: 'Exact 7', mult: '5x' },
            { id: 'up', label: '8-12 (Over 7)', mult: '2x' },
            { id: 'small', label: 'Small (4-10)', mult: '2x' },
            { id: 'big', label: 'Big (11-17)', mult: '2x' },
            { id: 'triple', label: 'Any Triple', mult: '30x' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedBet(opt.id as any)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedBet === opt.id
                  ? 'bg-amber-500 border-yellow-300 text-slate-950 font-black shadow-lg scale-102 ring-2 ring-yellow-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 font-bold'
              }`}
            >
              <span className="text-xs">{opt.label}</span>
              <span className="text-[10px] text-amber-300 font-black bg-slate-950/60 px-2 py-0.5 rounded-full mt-1">
                {opt.mult}
              </span>
            </button>
          ))}
        </div>

        {/* Stake & Roll Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Bet:</span>
            {currencyConfig.betPresets.slice(0, 5).map(val => (
              <button
                key={val}
                onClick={() => {
                  setBetAmount(val);
                  sound.playChip();
                }}
                disabled={isRolling}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                  betAmount === val
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>

          <button
            onClick={rollDice}
            disabled={isRolling || balance < betAmount}
            className={`w-full sm:w-48 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
              isRolling
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : balance < betAmount
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
            }`}
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>
              {isRolling
                ? 'Rolling...'
                : balance < betAmount
                ? 'Low Balance'
                : `ROLL ${formatCurrency(betAmount)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
