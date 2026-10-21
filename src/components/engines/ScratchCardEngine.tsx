import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Sparkles, Trophy } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

const SCRATCH_ICONS = ['💎', '👑', '💰', '⭐', '7️⃣', '🍀'];

export const ScratchCardEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [cost, setCost] = useState(currencyConfig.minBet);
  const [isReady, setIsReady] = useState(true);
  const [symbols, setSymbols] = useState<string[]>(['💎', '💎', '💎', '💰', '7️⃣', '⭐', '👑', '🍀', '💰']);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (cost < currencyConfig.minBet || cost > currencyConfig.maxBet) {
      setCost(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  // Initialize Scratch Foil
  const initCard = () => {
    if (balance < cost) return;
    sound.playChip();
    setIsReady(false);
    setLastWin(null);

    // Calculate secret outcome
    const outcome = calculateWinOutcome(cost, 25.0);
    let newSyms: string[] = [];
    let mult = 0;

    if (outcome.isWin) {
      const winIcon = SCRATCH_ICONS[Math.floor(Math.random() * SCRATCH_ICONS.length)];
      mult = outcome.multiplier;
      newSyms = [winIcon, winIcon, winIcon];
      while (newSyms.length < 9) {
        const otherIcons = SCRATCH_ICONS.filter(i => i !== winIcon);
        newSyms.push(otherIcons[Math.floor(Math.random() * otherIcons.length)]);
      }
      newSyms.sort(() => Math.random() - 0.5);
      setLastWin(cost * mult * bonusMultiplier);
    } else {
      // Guaranteed no 3 identical symbols
      const pool = [...SCRATCH_ICONS, ...SCRATCH_ICONS];
      newSyms = [];
      const counts: Record<string, number> = {};
      for (const icon of pool) {
        if (!counts[icon]) counts[icon] = 0;
        if (counts[icon] < 2 && newSyms.length < 9) {
          counts[icon]++;
          newSyms.push(icon);
        }
      }
      while (newSyms.length < 9) {
        newSyms.push(SCRATCH_ICONS[newSyms.length % SCRATCH_ICONS.length]);
      }
      newSyms.sort(() => Math.random() - 0.5);
      mult = 0;
      setLastWin(null);
    }

    setSymbols(newSyms);

    // Draw silver foil
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#64748b');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH HERE TO REVEAL ✨', canvas.width / 2, canvas.height / 2);

    onPlay(cost, mult, outcome.isWin);
  };

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, 2 * Math.PI);
    ctx.fill();

    if (Math.random() > 0.7) sound.playBounce();
  };

  const scratchAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sound.playWin();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      {/* Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🎫
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{game.title}</h3>
            <span className="text-xs text-slate-400">Match 3 Icons to Win • {game.provider}</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-4 py-1.5 rounded-full font-black text-sm flex items-center space-x-2 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Card Scratch Window */}
      <div className="w-full bg-slate-950 border-x-4 border-slate-800 p-3 sm:p-8 flex flex-col items-center justify-center relative shadow-inner">
        <div className="relative w-[270px] sm:w-96 h-[270px] sm:h-96 rounded-2xl overflow-hidden border-4 border-amber-500/40 shadow-2xl">
          {/* Underlying Hidden Symbols (3x3 Grid) */}
          <div className="absolute inset-0 grid grid-cols-3 gap-2 p-3 bg-gradient-to-tr from-slate-900 via-amber-950 to-slate-900">
            {symbols.map((sym, idx) => (
              <div
                key={idx}
                className="bg-slate-800/90 rounded-xl border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner"
              >
                {sym}
              </div>
            ))}
          </div>

          {/* Silver Scratch Foil Surface Canvas */}
          <canvas
            ref={canvasRef}
            width={384}
            height={384}
            onMouseMove={e => {
              if (e.buttons === 1) scratch(e);
            }}
            onTouchMove={scratch}
            className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
          />
        </div>

        {/* Quick Scratch Controls */}
        {!isReady && (
          <button
            onClick={scratchAll}
            className="mt-4 px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700"
          >
            Auto Reveal All
          </button>
        )}
      </div>

      {/* Betting Console - 100% Mobile Fitting & Zero Overlap */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Ticket Cost presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase mr-1 shrink-0">Price:</span>
          {currencyConfig.betPresets.slice(0, 5).map(val => (
            <button
              key={val}
              onClick={() => {
                setCost(val);
                sound.playChip();
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-xs shrink-0 whitespace-nowrap transition-all ${
                cost === val
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-102 ring-2 ring-yellow-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {formatCurrency(val).replace('.00', '')}
            </button>
          ))}
        </div>

        <button
          onClick={initCard}
          disabled={balance < cost}
          className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            balance < cost
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{balance < cost ? 'Low Balance' : `NEW CARD (${formatCurrency(cost)})`}</span>
        </button>
      </div>
    </div>
  );
};
