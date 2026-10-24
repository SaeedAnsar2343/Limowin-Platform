import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Trophy, RotateCw, Sparkles } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

const SEGMENTS = [
  { label: '1x', mult: 1, color: '#3b82f6', textColor: '#ffffff' },
  { label: '2x', mult: 2, color: '#10b981', textColor: '#ffffff' },
  { label: '5x', mult: 5, color: '#f59e0b', textColor: '#000000' },
  { label: '10x', mult: 10, color: '#8b5cf6', textColor: '#ffffff' },
  { label: '1x', mult: 1, color: '#3b82f6', textColor: '#ffffff' },
  { label: '2x', mult: 2, color: '#10b981', textColor: '#ffffff' },
  { label: 'COIN FLIP (20x)', mult: 20, color: '#ef4444', textColor: '#ffffff' },
  { label: '1x', mult: 1, color: '#3b82f6', textColor: '#ffffff' },
  { label: '5x', mult: 5, color: '#f59e0b', textColor: '#000000' },
  { label: 'PACHINKO (50x)', mult: 50, color: '#ec4899', textColor: '#ffffff' },
  { label: '2x', mult: 2, color: '#10b981', textColor: '#ffffff' },
  { label: 'CRAZY TIME (100x)', mult: 100, color: '#eab308', textColor: '#000000' }
];

export const WheelGameShowEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [chosenBet, setChosenBet] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winningSegment, setWinningSegment] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
    return () => {
      isMountedRef.current = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [currencyConfig]);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 15;
    const sliceAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Draw slices
    SEGMENTS.forEach((seg, i) => {
      const start = i * sliceAngle;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(seg.label, radius - 18, 4);

      // Outer peg
      ctx.beginPath();
      ctx.arc(radius - 5, 0, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.restore();
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'black 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', 0, 0);

    ctx.restore();

    // Top Fixed Flapper Pointer
    ctx.beginPath();
    ctx.moveTo(cx - 10, 10);
    ctx.lineTo(cx + 10, 10);
    ctx.lineTo(cx, 28);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel(0);
  }, []);

  const spinWheel = () => {
    if (isSpinning || balance < bet) return;
    setIsSpinning(true);
    setWinningSegment(null);
    setLastWin(null);
    sound.playChip();

    const outcome = calculateWinOutcome(bet, chosenBet);

    // Target segment
    let targetIdx: number;
    if (outcome.isWin) {
      const matchIdxs = SEGMENTS.map((s, idx) => s.mult === chosenBet ? idx : -1).filter(idx => idx !== -1);
      targetIdx = matchIdxs.length > 0 ? matchIdxs[Math.floor(Math.random() * matchIdxs.length)] : 0;
    } else {
      const nonMatchIdxs = SEGMENTS.map((s, idx) => s.mult !== chosenBet ? idx : -1).filter(idx => idx !== -1);
      targetIdx = nonMatchIdxs.length > 0
        ? nonMatchIdxs[Math.floor(Math.random() * nonMatchIdxs.length)]
        : SEGMENTS.findIndex(s => s.mult !== chosenBet);
      if (targetIdx === -1) targetIdx = 0;
    }

    const sliceAngle = (2 * Math.PI) / SEGMENTS.length;
    // Flapper is at angle 3*PI/2 (top)
    const targetAngle = (3 * Math.PI / 2) - (targetIdx * sliceAngle + sliceAngle / 2);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const finalAngle = targetAngle + extraSpins * 2 * Math.PI;

    const startAngle = rotationRef.current % (2 * Math.PI);
    const delta = finalAngle - startAngle;
    const duration = 3800;
    const startTime = performance.now();

    const animate = (time: number) => {
      if (!isMountedRef.current) return;
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const curAngle = startAngle + delta * ease;

      rotationRef.current = curAngle;
      drawWheel(curAngle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const landedSeg = SEGMENTS[targetIdx];
        setWinningSegment(landedSeg.label);

        const isWin = outcome.isWin;
        if (isWin) {
          const winAmt = bet * landedSeg.mult * bonusMultiplier;
          setLastWin(winAmt);
          sound.playWin();
          onPlay(bet, landedSeg.mult, true);
        } else {
          sound.playLose();
          onPlay(bet, 0, false);
        }
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🎡
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">Live Game Show Multiplier Wheel • Bonus up to 100x</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Wheel Stage */}
      <div className="w-full bg-slate-950 border-x-4 border-slate-800 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-center gap-6 shadow-inner">
        {/* 3D Wheel Canvas */}
        <div className="relative flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full shadow-[0_0_50px_rgba(245,158,11,0.2)] border-4 border-amber-500/40"
          />
          {winningSegment && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-1 px-3 rounded-xl bg-slate-950 border border-yellow-400 text-white flex flex-col items-center justify-center shadow-2xl animate-bounce">
              <span className="text-[9px] text-yellow-400 uppercase font-black">Landed</span>
              <span className="text-xs sm:text-sm font-black whitespace-nowrap">{winningSegment}</span>
            </div>
          )}
        </div>

        {/* Game Show Betting Pads */}
        <div className="flex-1 w-full max-w-sm space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Select Your Multiplier Bet:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '1x Blue', mult: 1, bg: 'bg-blue-600', border: 'border-blue-400' },
              { label: '2x Green', mult: 2, bg: 'bg-emerald-600', border: 'border-emerald-400' },
              { label: '5x Gold', mult: 5, bg: 'bg-amber-500 text-slate-950', border: 'border-amber-300' },
              { label: '10x Purple', mult: 10, bg: 'bg-purple-600', border: 'border-purple-400' },
              { label: 'COIN FLIP (20x)', mult: 20, bg: 'bg-rose-600', border: 'border-rose-400' },
              { label: 'CRAZY TIME (100x)', mult: 100, bg: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950', border: 'border-yellow-300' }
            ].map(b => (
              <button
                key={b.mult}
                onClick={() => setChosenBet(b.mult)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  chosenBet === b.mult
                    ? `${b.bg} ${b.border} font-black shadow-lg scale-102 ring-2 ring-white/50`
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-black">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
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
                setBet(val);
                sound.playChip();
              }}
              disabled={isSpinning}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-xs shrink-0 whitespace-nowrap transition-all ${
                bet === val
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-102 ring-2 ring-yellow-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {formatCurrency(val).replace('.00', '')}
            </button>
          ))}
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning || balance < bet}
          className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            isSpinning
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : balance < bet
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Spinning...' : balance < bet ? 'Low Balance' : `SPIN ${formatCurrency(bet)}`}</span>
        </button>
      </div>
    </div>
  );
};
