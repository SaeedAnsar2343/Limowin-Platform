import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { RotateCw, Trophy } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const Roulette3D: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [selectedBetType, setSelectedBetType] = useState<string>('red');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [chipValue, setChipValue] = useState<number>(currencyConfig.minBet);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([17, 32, 0, 7, 24]);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (chipValue < currencyConfig.minBet || chipValue > currencyConfig.maxBet) {
      setChipValue(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  // Draw 3D-styled Roulette Wheel Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((wheelRotation * Math.PI) / 180);

    const sliceAngle = (2 * Math.PI) / ROULETTE_NUMBERS.length;

    // Draw slices
    ROULETTE_NUMBERS.forEach((num, i) => {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();

      if (num === 0) {
        ctx.fillStyle = '#15803d'; // Green 0
      } else if (RED_NUMBERS.includes(num)) {
        ctx.fillStyle = '#dc2626'; // Red
      } else {
        ctx.fillStyle = '#1e293b'; // Black
      }
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Number text
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(num.toString(), radius - 12, 4);
      ctx.restore();
    });

    // Center Gold Turret
    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#ca8a04');
    grad.addColorStop(1, '#854d0e');
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Fixed Ball Marker on Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY - radius + 10, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [wheelRotation]);

  const spinWheel = () => {
    if (isSpinning || balance < chipValue) return;
    setIsSpinning(true);
    setWinningNumber(null);
    setLastWin(null);
    sound.playChip();

    // Calculate outcome using secret house edge
    const theoreticalMult = selectedBetType === 'number' ? 36.0 : 2.0;
    const outcome = calculateWinOutcome(chipValue, theoreticalMult);

    // Pick target number physically consistent with outcome
    let targetNum: number;
    const blackNumbers = ROULETTE_NUMBERS.filter(n => n !== 0 && !RED_NUMBERS.includes(n));

    if (outcome.isWin) {
      if (selectedBetType === 'number' && selectedNumber !== null) {
        targetNum = selectedNumber;
      } else if (selectedBetType === 'red') {
        targetNum = RED_NUMBERS[Math.floor(Math.random() * RED_NUMBERS.length)];
      } else if (selectedBetType === 'black') {
        targetNum = blackNumbers[Math.floor(Math.random() * blackNumbers.length)];
      } else if (selectedBetType === 'even') {
        const evens = ROULETTE_NUMBERS.filter(n => n !== 0 && n % 2 === 0);
        targetNum = evens[Math.floor(Math.random() * evens.length)];
      } else {
        const odds = ROULETTE_NUMBERS.filter(n => n % 2 !== 0);
        targetNum = odds[Math.floor(Math.random() * odds.length)];
      }
    } else {
      // Pick a losing number
      if (selectedBetType === 'number') {
        const others = ROULETTE_NUMBERS.filter(n => n !== selectedNumber);
        targetNum = others[Math.floor(Math.random() * others.length)];
      } else if (selectedBetType === 'red') {
        targetNum = blackNumbers[Math.floor(Math.random() * blackNumbers.length)];
      } else if (selectedBetType === 'black') {
        targetNum = RED_NUMBERS[Math.floor(Math.random() * RED_NUMBERS.length)];
      } else if (selectedBetType === 'even') {
        const odds = ROULETTE_NUMBERS.filter(n => n % 2 !== 0);
        targetNum = odds[Math.floor(Math.random() * odds.length)];
      } else {
        const evens = ROULETTE_NUMBERS.filter(n => n !== 0 && n % 2 === 0);
        targetNum = evens[Math.floor(Math.random() * evens.length)];
      }
    }

    const targetIdx = ROULETTE_NUMBERS.indexOf(targetNum);
    const sliceDeg = 360 / ROULETTE_NUMBERS.length;
    const spins = 5 + Math.floor(Math.random() * 4);
    const targetDeg = 360 * spins + targetIdx * sliceDeg;

    const startTime = performance.now();
    const duration = 2400;
    const currentRot = wheelRotation;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setWheelRotation(currentRot + targetDeg * ease);

      if (progress < 1) {
        if (Math.random() > 0.6) sound.playBounce();
        requestAnimationFrame(animate);
      } else {
        setWinningNumber(targetNum);
        setIsSpinning(false);
        setHistory(prev => [targetNum, ...prev.slice(0, 7)]);

        if (outcome.isWin) {
          setLastWin(chipValue * outcome.multiplier * bonusMultiplier);
        } else {
          setLastWin(null);
        }

        onPlay(chipValue, outcome.multiplier, outcome.isWin);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      {/* Header with History */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🎡
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{game.title}</h3>
            <span className="text-xs text-slate-400">Live 3D Physics • {game.provider}</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-4 py-1.5 rounded-full font-black text-sm flex items-center space-x-2 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}

        {/* Recent Results Ribbon */}
        <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 font-bold mr-1">History:</span>
          {history.map((num, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                num === 0
                  ? 'bg-emerald-600 text-white'
                  : RED_NUMBERS.includes(num)
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-white'
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Main Wheel & Betting Layout */}
      <div className="w-full bg-slate-950 border-x border-slate-800 p-3 sm:p-6 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8">
        {/* Wheel Canvas */}
        <div className="relative flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full shadow-[0_0_40px_rgba(245,158,11,0.25)] border-4 border-amber-500/40"
          />
          {winningNumber !== null && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-950 border-2 border-yellow-400 text-white flex flex-col items-center justify-center shadow-2xl animate-pulse">
              <span className="text-[10px] text-yellow-400 uppercase font-black">Landed</span>
              <span className="text-xl font-black">{winningNumber}</span>
            </div>
          )}
        </div>

        {/* Betting Board */}
        <div className="flex-1 w-full max-w-md space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Step 1: Choose Your Bet Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedBetType('red');
                  setSelectedNumber(null);
                }}
                className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-2 ${
                  selectedBetType === 'red'
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-md'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50'
                }`}
              >
                <span>🔴 RED (2x)</span>
              </button>

              <button
                onClick={() => {
                  setSelectedBetType('black');
                  setSelectedNumber(null);
                }}
                className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-2 ${
                  selectedBetType === 'black'
                    ? 'bg-slate-800 text-white ring-2 ring-slate-400 shadow-md border border-slate-600'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-900'
                }`}
              >
                <span>⚫ BLACK (2x)</span>
              </button>

              <button
                onClick={() => {
                  setSelectedBetType('even');
                  setSelectedNumber(null);
                }}
                className={`py-2 px-3 rounded-xl font-black text-xs transition-all ${
                  selectedBetType === 'even'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                EVEN (2x)
              </button>

              <button
                onClick={() => {
                  setSelectedBetType('odd');
                  setSelectedNumber(null);
                }}
                className={`py-2 px-3 rounded-xl font-black text-xs transition-all ${
                  selectedBetType === 'odd'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ODD (2x)
              </button>
            </div>

            {/* Direct Number Picker */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 mb-1.5 block">
                Or Bet Single Number (36x Payout):
              </span>
              <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto pr-1">
                {ROULETTE_NUMBERS.map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setSelectedBetType('number');
                      setSelectedNumber(n);
                    }}
                    className={`h-7 rounded text-xs font-black transition-all ${
                      selectedBetType === 'number' && selectedNumber === n
                        ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300'
                        : n === 0
                        ? 'bg-emerald-900 text-emerald-300 hover:bg-emerald-800'
                        : RED_NUMBERS.includes(n)
                        ? 'bg-rose-950 text-rose-300 hover:bg-rose-900'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Console - 100% Mobile Fitting & Zero Overlap */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase mr-1 shrink-0">Chip:</span>
          {currencyConfig.betPresets.slice(0, 5).map(val => (
            <button
              key={val}
              onClick={() => {
                setChipValue(val);
                sound.playChip();
              }}
              disabled={isSpinning}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full font-black text-xs shrink-0 transition-all border-2 flex items-center justify-center ${
                chipValue === val
                  ? 'bg-amber-500 border-yellow-200 text-slate-950 scale-105 shadow-lg shadow-amber-500/30 ring-2 ring-yellow-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {val >= 1000 ? `${val / 1000}k` : val}
            </button>
          ))}
        </div>

        {/* Spin Wheel Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || balance < chipValue}
          className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            isSpinning
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : balance < chipValue
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>
            {isSpinning
              ? 'Spinning...'
              : balance < chipValue
              ? 'Low Balance'
              : `SPIN ${formatCurrency(chipValue)}`}
          </span>
        </button>
      </div>
    </div>
  );
};
