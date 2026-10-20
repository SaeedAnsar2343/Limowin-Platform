import React, { useState, useEffect } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Clock, Trophy } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

interface DrawRecord {
  period: string;
  number: number;
  color: 'green' | 'red' | 'violet';
  size: 'big' | 'small';
}

export const WingoLotteryEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [timeLeft, setTimeLeft] = useState(25);
  const [betValue, setBetValue] = useState<string | number>('green');
  const [amount, setAmount] = useState(currencyConfig.minBet);
  const [currentPeriod, setCurrentPeriod] = useState(20261021001);
  const [history, setHistory] = useState<DrawRecord[]>([
    { period: '20261021000', number: 7, color: 'green', size: 'big' },
    { period: '20261020999', number: 2, color: 'red', size: 'small' },
    { period: '20261020998', number: 0, color: 'violet', size: 'small' },
    { period: '20261020997', number: 8, color: 'red', size: 'big' }
  ]);
  const [lastWin, setLastWin] = useState<number | null>(null);

  useEffect(() => {
    if (amount < currencyConfig.minBet || amount > currencyConfig.maxBet) {
      setAmount(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          resolveDraw();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [betValue, amount, balance]);

  const resolveDraw = () => {
    if (balance < amount) return;

    const theoreticalMult = typeof betValue === 'number' ? 9.0 : 2.0;
    const outcome = calculateWinOutcome(amount, theoreticalMult);

    let winningNum: number;

    if (outcome.isWin) {
      if (typeof betValue === 'number') {
        winningNum = betValue;
      } else if (betValue === 'green') {
        winningNum = [1, 3, 7, 9][Math.floor(Math.random() * 4)];
      } else if (betValue === 'red') {
        winningNum = [2, 4, 6, 8][Math.floor(Math.random() * 4)];
      } else if (betValue === 'violet') {
        winningNum = Math.random() > 0.5 ? 0 : 5;
      } else if (betValue === 'big') {
        winningNum = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
      } else {
        winningNum = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
      }
    } else {
      if (typeof betValue === 'number') {
        const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== betValue);
        winningNum = pool[Math.floor(Math.random() * pool.length)];
      } else if (betValue === 'green') {
        winningNum = [2, 4, 6, 8, 0][Math.floor(Math.random() * 5)];
      } else if (betValue === 'red') {
        winningNum = [1, 3, 7, 9, 5][Math.floor(Math.random() * 5)];
      } else if (betValue === 'violet') {
        winningNum = [1, 2, 3, 4, 6, 7, 8, 9][Math.floor(Math.random() * 8)];
      } else if (betValue === 'big') {
        winningNum = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
      } else {
        winningNum = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
      }
    }

    let winningColor: 'green' | 'red' | 'violet' = 'green';
    if (winningNum === 0 || winningNum === 5) {
      winningColor = 'violet';
    } else if (winningNum % 2 === 0) {
      winningColor = 'red';
    } else {
      winningColor = 'green';
    }

    const winningSize = winningNum >= 5 ? 'big' : 'small';

    const newRecord: DrawRecord = {
      period: currentPeriod.toString(),
      number: winningNum,
      color: winningColor,
      size: winningSize
    };

    setHistory(prev => [newRecord, ...prev.slice(0, 6)]);
    setCurrentPeriod(prev => prev + 1);

    if (outcome.isWin) {
      setLastWin(amount * outcome.multiplier * bonusMultiplier);
    } else {
      setLastWin(null);
    }

    onPlay(amount, outcome.multiplier, outcome.isWin);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      {/* Top Countdown Banner */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-white font-black text-lg">{game.title} (Fast Draw)</h3>
          </div>
          <span className="text-xs text-slate-400">Period: #{currentPeriod} • {game.provider}</span>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-4 py-1.5 rounded-full font-black text-sm flex items-center space-x-2 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}

        <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-bold uppercase">Time Left:</span>
          <span className="text-xl font-mono font-black text-amber-400">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
        </div>
      </div>

      {/* Color Selection & History */}
      <div className="w-full bg-slate-950 border-x-4 border-slate-800 p-6 space-y-6">
        {/* Color Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setBetValue('green')}
            className={`py-4 rounded-2xl font-black text-sm transition-all border flex flex-col items-center ${
              betValue === 'green'
                ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/30 shadow-lg'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-900 hover:bg-emerald-900/40'
            }`}
          >
            <span>🟢 GREEN (2x)</span>
            <span className="text-[10px] text-emerald-200 mt-1">Odd Numbers (1,3,7,9)</span>
          </button>

          <button
            onClick={() => setBetValue('violet')}
            className={`py-4 rounded-2xl font-black text-sm transition-all border flex flex-col items-center ${
              betValue === 'violet'
                ? 'bg-purple-600 text-white border-purple-400 ring-4 ring-purple-500/30 shadow-lg'
                : 'bg-purple-950/40 text-purple-300 border-purple-900 hover:bg-purple-900/40'
            }`}
          >
            <span>🟣 VIOLET (4.5x)</span>
            <span className="text-[10px] text-purple-200 mt-1">Special (0, 5)</span>
          </button>

          <button
            onClick={() => setBetValue('red')}
            className={`py-4 rounded-2xl font-black text-sm transition-all border flex flex-col items-center ${
              betValue === 'red'
                ? 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-500/30 shadow-lg'
                : 'bg-rose-950/40 text-rose-300 border-rose-900 hover:bg-rose-900/40'
            }`}
          >
            <span>🔴 RED (2x)</span>
            <span className="text-[10px] text-rose-200 mt-1">Even Numbers (2,4,6,8)</span>
          </button>
        </div>

        {/* Number Buttons 0-9 */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Or Pick Direct Number (9x Payout):
          </span>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => setBetValue(num)}
                className={`h-12 rounded-xl font-black text-lg transition-all border flex items-center justify-center ${
                  betValue === num
                    ? 'bg-amber-500 text-slate-950 border-yellow-300 ring-2 ring-yellow-400 shadow-lg scale-105'
                    : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Big / Small Choice */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setBetValue('big')}
            className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
              betValue === 'big'
                ? 'bg-amber-500 text-slate-950 border-yellow-300 ring-2 ring-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            BIG (5-9) • 2x
          </button>
          <button
            onClick={() => setBetValue('small')}
            className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
              betValue === 'small'
                ? 'bg-amber-500 text-slate-950 border-yellow-300 ring-2 ring-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            SMALL (0-4) • 2x
          </button>
        </div>
      </div>

      {/* Bet Control Console */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Bet presets */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1">Bet:</span>
          {currencyConfig.betPresets.slice(0, 5).map(val => (
            <button
              key={val}
              onClick={() => {
                setAmount(val);
                sound.playChip();
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                amount === val
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {formatCurrency(val)}
            </button>
          ))}
        </div>

        <button
          onClick={resolveDraw}
          disabled={balance < amount}
          className={`w-full sm:w-48 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            balance < amount
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <span>{balance < amount ? 'Low Balance' : `BET NOW ${formatCurrency(amount)}`}</span>
        </button>
      </div>
    </div>
  );
};
