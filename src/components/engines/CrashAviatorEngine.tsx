import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Rocket, Trophy } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

export const CrashAviatorEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed' | 'cashed'>('idle');
  const [crashPoint, setCrashPoint] = useState(1.0);
  const [lastWin, setLastWin] = useState<number | null>(null);

  // Dynamic craft detection based on actual game
  const titleLower = (game.title + ' ' + game.id).toLowerCase();
  const isAviator = titleLower.includes('aviator');
  const isJetX = titleLower.includes('jet') || titleLower.includes('fighter');
  const isSpaceman = titleLower.includes('spaceman') || titleLower.includes('astronaut');
  const vehicleEmoji = isAviator ? '🛩️' : isJetX ? '✈️' : isSpaceman ? '👨‍🚀' : '🚀';
  const vehicleName = isAviator ? 'Propeller Airplane' : isJetX ? 'Supersonic Jet' : isSpaceman ? 'Spaceman Astronaut' : 'Cosmic Rocket';

  useEffect(() => {
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const multiplierRef = useRef(1.0);

  const startFlight = () => {
    if (gameState === 'flying' || balance < bet) return;
    setGameState('flying');
    setLastWin(null);
    multiplierRef.current = 1.0;
    setMultiplier(1.0);
    sound.playChip();
    sound.playRocketThrust();

    // Determine outcome using secret house edge
    const outcome = calculateWinOutcome(bet, 5.0);
    let cp = 1.0;

    if (outcome.isWin) {
      cp = Math.max(1.8, Number((outcome.multiplier * (1.15 + Math.random() * 0.3)).toFixed(2)));
    } else {
      cp = Number((1.05 + Math.random() * 0.28).toFixed(2));
    }
    setCrashPoint(cp);

    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // Exponential curve
      const currentMult = 1.0 + Math.pow(elapsed * 0.9, 1.8);
      multiplierRef.current = currentMult;
      setMultiplier(currentMult);

      if (currentMult >= cp) {
        setGameState('crashed');
        sound.playBounce();
        onPlay(bet, 0, false);
      } else {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);
  };

  const cashOut = () => {
    if (gameState !== 'flying') return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const winMult = multiplierRef.current;
    setGameState('cashed');
    const winAmt = bet * winMult * bonusMultiplier;
    setLastWin(winAmt);
    sound.playWin();
    onPlay(bet, winMult, true);
  };

  // Draw 2D flight curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (gameState === 'flying' || gameState === 'cashed' || gameState === 'crashed') {
      const progress = Math.min((multiplier - 1.0) / 4.0, 1.0);
      const startX = 40;
      const startY = h - 40;
      const endX = startX + progress * (w - 100);
      const endY = startY - Math.pow(progress, 1.5) * (h - 100);

      // Gradient under curve
      const grad = ctx.createLinearGradient(0, startY, 0, endY);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.0)');
      grad.addColorStop(1, gameState === 'crashed' ? 'rgba(100, 116, 139, 0.2)' : isAviator ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)');

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.4, startY, endX, endY);
      ctx.lineTo(endX, startY);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Curve Stroke
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.4, startY, endX, endY);
      ctx.strokeStyle = gameState === 'crashed' ? '#94a3b8' : isAviator ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Vehicle Marker
      ctx.save();
      ctx.translate(endX, endY);
      ctx.rotate(-Math.PI / 4);
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gameState === 'crashed' ? '💥' : vehicleEmoji, 0, 0);
      ctx.restore();
    }
  }, [multiplier, gameState, isAviator, vehicleEmoji]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-lg">
            {vehicleEmoji}
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">{vehicleName} Flight Multiplier • {game.provider}</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Flight Canvas Window */}
      <div className="w-full bg-slate-950 border-x-4 border-slate-800 p-3 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px] sm:min-h-[300px]">
        <canvas
          ref={canvasRef}
          width={640}
          height={260}
          className="w-full max-w-2xl h-[220px] sm:h-[260px] rounded-xl"
        />

        {/* Center Multiplier HUD */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <span
            className={`text-5xl sm:text-7xl font-black tracking-tighter drop-shadow-2xl transition-colors ${
              gameState === 'crashed'
                ? 'text-rose-500'
                : gameState === 'cashed'
                ? 'text-emerald-400'
                : 'text-white'
            }`}
          >
            {multiplier.toFixed(2)}x
          </span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1 text-slate-400">
            {gameState === 'crashed'
              ? 'FLEW AWAY!'
              : gameState === 'cashed'
              ? 'CASHED OUT!'
              : gameState === 'flying'
              ? 'IN FLIGHT...'
              : 'PLACE BET TO LAUNCH'}
          </span>
        </div>
      </div>

      {/* Betting Console - 100% Mobile Fitting & Zero Overlap */}
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
              disabled={gameState === 'flying'}
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

        {/* Launch or Cashout button */}
        {gameState === 'flying' ? (
          <button
            onClick={cashOut}
            className="w-full sm:w-56 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 animate-pulse"
          >
            <Trophy className="w-4 h-4" />
            <span>CASH OUT {formatCurrency(bet * multiplier)}</span>
          </button>
        ) : (
          <button
            onClick={startFlight}
            disabled={balance < bet}
            className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
              balance < bet
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>{balance < bet ? 'Low Balance' : `BET ${formatCurrency(bet)}`}</span>
          </button>
        )}
      </div>
    </div>
  );
};
