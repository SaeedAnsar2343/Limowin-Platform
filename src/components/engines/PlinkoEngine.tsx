import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Play, Trophy } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

const MULTIPLIERS = [16, 9, 2, 1.4, 0.4, 0.2, 0.4, 1.4, 2, 9, 16];

export const PlinkoEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [isDropping, setIsDropping] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  const dropBall = () => {
    if (isDropping || balance < bet) return;
    setIsDropping(true);
    setLastWin(null);
    sound.playChip();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate outcome using secret house edge
    const outcome = calculateWinOutcome(bet, 16.0);

    // Target bucket index:
    // If loss: index 4, 5, or 6 (multipliers 0.4, 0.2, 0.4)
    // If win: outer buckets (0, 1, 2, 3, 7, 8, 9, 10)
    let targetBucketIdx: number;
    if (outcome.isWin) {
      const winningBuckets = [2, 3, 7, 8];
      if (outcome.multiplier >= 9) winningBuckets.push(1, 9);
      if (outcome.multiplier >= 15) winningBuckets.push(0, 10);
      targetBucketIdx = winningBuckets[Math.floor(Math.random() * winningBuckets.length)];
    } else {
      const losingBuckets = [4, 5, 6];
      targetBucketIdx = losingBuckets[Math.floor(Math.random() * losingBuckets.length)];
    }

    const bucketWidth = canvas.width / MULTIPLIERS.length;
    const targetX = targetBucketIdx * bucketWidth + bucketWidth / 2;

    let posX = canvas.width / 2;
    let posY = 20;
    let velX = (Math.random() - 0.5) * 1.5;
    let velY = 2;
    const gravity = 0.35;
    const rows = 9;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Pegs
      for (let r = 0; r < rows; r++) {
        const pegsInRow = r + 3;
        const spacingX = canvas.width / (pegsInRow + 1);
        const y = 50 + r * 28;

        for (let c = 1; c <= pegsInRow; c++) {
          const x = c * spacingX;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = '#f8fafc';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Peg collision
          const dist = Math.hypot(posX - x, posY - y);
          if (dist < 10) {
            velY *= -0.52;
            velX += (Math.random() - 0.5) * 3;
            sound.playBounce();
          }
        }
      }

      // Smooth guidance toward target bucket as ball nears bottom
      if (posY > 140) {
        const diffX = targetX - posX;
        velX += diffX * 0.02;
      }

      // Update ball physics
      velY += gravity;
      posX += velX;
      posY += velY;

      // Keep within bounds
      if (posX < 10) posX = 10;
      if (posX > canvas.width - 10) posX = canvas.width - 10;

      // Draw Ball
      ctx.beginPath();
      ctx.arc(posX, posY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (posY < canvas.height - 25) {
        requestAnimationFrame(animate);
      } else {
        // Landed in bucket
        setIsDropping(false);
        const finalBucket = Math.min(
          MULTIPLIERS.length - 1,
          Math.max(0, Math.floor((posX / canvas.width) * MULTIPLIERS.length))
        );
        const mult = MULTIPLIERS[finalBucket] || 1.0;
        const finalIsWin = outcome.isWin && mult >= 1.0;

        if (finalIsWin) {
          setLastWin(bet * mult * bonusMultiplier);
        } else {
          setLastWin(null);
        }
        onPlay(bet, finalIsWin ? mult : 0, finalIsWin);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      {/* Table Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            ⚪
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{game.title}</h3>
            <span className="text-xs text-slate-400">Peg Gravity Physics • {game.provider}</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-4 py-1.5 rounded-full font-black text-sm flex items-center space-x-2 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Plinko Board Canvas & Buckets */}
      <div className="w-full bg-slate-950 border-x-4 border-slate-800 p-2 sm:p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={480}
          height={320}
          className="w-full max-w-[480px] h-auto aspect-[3/2] rounded-xl bg-slate-900/60 border border-slate-800"
        />

        {/* Bucket multiplier labels */}
        <div className="grid grid-cols-11 gap-1 w-full max-w-[480px] mt-2">
          {MULTIPLIERS.map((m, idx) => (
            <div
              key={idx}
              className={`py-1 text-center text-[10px] sm:text-xs font-black rounded-lg border ${
                m >= 9
                  ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                  : m >= 2
                  ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                  : m >= 1
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {m}x
            </div>
          ))}
        </div>
      </div>

      {/* Betting Console */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Chips */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1">Bet:</span>
          {currencyConfig.betPresets.slice(0, 5).map(val => (
            <button
              key={val}
              onClick={() => {
                setBet(val);
                sound.playChip();
              }}
              disabled={isDropping}
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

        {/* Drop Ball button */}
        <button
          onClick={dropBall}
          disabled={isDropping || balance < bet}
          className={`w-full sm:w-48 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            isDropping
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : balance < bet
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{isDropping ? 'Dropping...' : balance < bet ? 'Low Balance' : `DROP ${formatCurrency(bet)}`}</span>
        </button>
      </div>
    </div>
  );
};
