import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Rocket, Trophy, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

interface SmokeParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
}

export const CrashAviatorEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed' | 'cashed'>('idle');
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [autoCashout, setAutoCashout] = useState(false);
  const [autoCashoutVal, setAutoCashoutVal] = useState<number>(2.0);
  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1.0);
  const [history, setHistory] = useState<number[]>([1.45, 2.80, 1.12, 14.25, 3.10, 1.95, 5.40]);

  // Craft identification
  const titleLower = (game.title + ' ' + game.id).toLowerCase();
  const isAviator = titleLower.includes('aviator');
  const isJetX = titleLower.includes('jet') || titleLower.includes('fighter');
  const isSpaceman = titleLower.includes('spaceman') || titleLower.includes('astronaut');
  const craftName = isAviator ? 'Aviator Monoplane' : isJetX ? 'Supersonic Jet' : isSpaceman ? 'Spaceman' : 'Cosmic Rocket';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const multiplierRef = useRef<number>(1.0);
  const crashPointRef = useRef<number>(1.0);
  const isMountedRef = useRef<boolean>(true);
  const smokeParticlesRef = useRef<SmokeParticle[]>([]);
  const plannedIsWinRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
    return () => {
      isMountedRef.current = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currencyConfig]);

  // Draw initial canvas
  useEffect(() => {
    drawFrame(1.0, 'idle');
  }, []);

  // Primary High-Performance Canvas Renderer
  const drawFrame = (currentMult: number, state: 'idle' | 'flying' | 'crashed' | 'cashed') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Dark Airfield Radar Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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

    const startX = 35;
    const startY = h - 35;

    // Ground tarmac line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(w, startY);
    ctx.stroke();

    if (state === 'idle') {
      // Idle plane parked at runway
      drawCraft(ctx, startX + 25, startY - 12, 0, false);
      return;
    }

    // Aerodynamic flight curve math
    const normalizedProgress = Math.min((currentMult - 1.0) / 4.5, 1.0);
    const endX = startX + normalizedProgress * (w - 110);
    const endY = startY - Math.pow(normalizedProgress, 1.4) * (h - 90);
    const angle = -Math.atan2(startY - endY, endX - startX) * 0.75;

    // 2. Trailing Red Altitude Gradient underneath curve
    const gradient = ctx.createLinearGradient(0, startY, 0, endY);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.0)');
    gradient.addColorStop(1, state === 'crashed' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(239, 68, 68, 0.28)');

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (endX - startX) * 0.45, startY, endX, endY);
    ctx.lineTo(endX, startY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 3. Glowing Flight Curve Line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (endX - startX) * 0.45, startY, endX, endY);
    ctx.strokeStyle = state === 'crashed' ? '#64748b' : '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = state === 'crashed' ? 'transparent' : 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = state === 'crashed' ? 0 : 12;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // 4. Update and render smoke particles
    if (state === 'flying' && Math.random() < 0.6) {
      smokeParticlesRef.current.push({
        x: endX - 15,
        y: endY + 4,
        size: 3 + Math.random() * 4,
        alpha: 0.6,
        vx: -1.5 - Math.random() * 2,
        vy: 0.5 - Math.random()
      });
    }

    smokeParticlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.size += 0.2;
      p.alpha -= 0.02;

      if (p.alpha > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    smokeParticlesRef.current = smokeParticlesRef.current.filter(p => p.alpha > 0);

    // 5. Draw Craft or Explosion
    if (state === 'crashed') {
      ctx.save();
      ctx.translate(endX, endY);
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', 0, 0);
      ctx.restore();
    } else {
      drawCraft(ctx, endX, endY, angle, true);
    }
  };

  // Vector Drawing of Aviator Propeller Airplane
  const drawCraft = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, isPropellerSpinning: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (isAviator) {
      // Crimson Monoplane Fuselage
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cockpit Windshield
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.ellipse(6, -3, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main Red Wings
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(-4, -14);
      ctx.lineTo(8, 0);
      ctx.lineTo(-4, 14);
      ctx.closePath();
      ctx.fill();

      // Tail Fin
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-26, -9);
      ctx.lineTo(-22, 0);
      ctx.closePath();
      ctx.fill();

      // Nose Cone & Propeller
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(22, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      if (isPropellerSpinning) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(24, 0, 2, 12, performance.now() * 0.05, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (isJetX) {
      // Supersonic Fighter Jet
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.lineTo(-18, -10);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-18, 10);
      ctx.closePath();
      ctx.fill();

      // Afterburner flame
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-12, -3);
      ctx.lineTo(-24 - Math.random() * 8, 0);
      ctx.lineTo(-12, 3);
      ctx.closePath();
      ctx.fill();
    } else {
      // Rocket
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚀', 0, 0);
    }

    ctx.restore();
  };

  // Start Flight Launch
  const startFlight = () => {
    if (gameState === 'flying' || balance < bet) return;
    setGameState('flying');
    setLastWin(null);
    multiplierRef.current = 1.0;
    setDisplayMultiplier(1.0);
    smokeParticlesRef.current = [];
    sound.playChip();
    sound.playRocketThrust();

    // Calculate crash point with house edge
    const outcome = calculateWinOutcome(bet, 5.0);
    plannedIsWinRef.current = outcome.isWin;
    let targetCrashPoint = 1.0;

    if (outcome.isWin) {
      targetCrashPoint = Math.max(2.1, Number((outcome.multiplier * (1.1 + Math.random() * 0.4)).toFixed(2)));
    } else {
      targetCrashPoint = Number((1.01 + Math.random() * 0.15).toFixed(2));
    }

    crashPointRef.current = targetCrashPoint;
    const startTime = performance.now();
    let lastUiUpdate = 0;

    const loop = (now: number) => {
      if (!isMountedRef.current) return;
      const elapsed = (now - startTime) / 1000;
      // Realistic parabolic multiplier acceleration
      const curMult = 1.0 + Math.pow(elapsed * 0.95, 1.75);
      multiplierRef.current = curMult;

      // Throttle React state update to ~15fps for UI numbers while Canvas runs at full 60fps
      if (now - lastUiUpdate > 65) {
        setDisplayMultiplier(curMult);
        lastUiUpdate = now;
      }

      // Check Auto-Cashout
      if (autoCashout && curMult >= autoCashoutVal) {
        cashOut();
        return;
      }

      // Check Crash
      if (curMult >= targetCrashPoint) {
        multiplierRef.current = targetCrashPoint;
        setDisplayMultiplier(targetCrashPoint);
        setGameState('crashed');
        drawFrame(targetCrashPoint, 'crashed');
        sound.playBounce();
        setHistory(prev => [Number(targetCrashPoint.toFixed(2)), ...prev.slice(0, 9)]);
        onPlay(bet, 0, false);
      } else {
        drawFrame(curMult, 'flying');
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);
  };

  // Instant Sub-Millisecond Cash Out
  const cashOut = () => {
    if (gameState !== 'flying') return;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    if (!plannedIsWinRef.current) {
      // Craft lost before user cashed out
      setGameState('crashed');
      multiplierRef.current = 1.0;
      setDisplayMultiplier(1.0);
      drawFrame(1.0, 'crashed');
      sound.playBounce();
      setHistory(prev => [1.0, ...prev.slice(0, 9)]);
      onPlay(bet, 0, false);
      return;
    }

    const winMult = Number(multiplierRef.current.toFixed(2));
    setGameState('cashed');
    drawFrame(winMult, 'cashed');

    const winAmt = bet * winMult * bonusMultiplier;
    setLastWin(winAmt);
    setDisplayMultiplier(winMult);
    sound.playWin();
    setHistory(prev => [winMult, ...prev.slice(0, 9)]);
    onPlay(bet, winMult, true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Table Header with Recent Multipliers Ribbon */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-lg">
            ✈️
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">{craftName} • High-Precision Real Flight</span>
          </div>
        </div>

        {/* Real Aviator Recent Multipliers Bar */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-md bg-slate-950 p-1.5 rounded-xl border border-slate-800 no-scrollbar">
          {history.map((h, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 whitespace-nowrap ${
                h >= 10.0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : h >= 2.0
                  ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                  : 'bg-blue-950 text-blue-300 border border-blue-500/30'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Flight Canvas Window */}
      <div className="w-full bg-slate-950 border-x-4 border-slate-800 p-2 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px] sm:min-h-[300px]">
        <canvas
          ref={canvasRef}
          width={640}
          height={260}
          className="w-full max-w-2xl h-[220px] sm:h-[260px] rounded-xl bg-slate-950"
        />

        {/* Center Multiplier HUD */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
          <span
            className={`text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] transition-colors ${
              gameState === 'crashed'
                ? 'text-rose-500 animate-pulse'
                : gameState === 'cashed'
                ? 'text-emerald-400'
                : 'text-white'
            }`}
          >
            {displayMultiplier.toFixed(2)}x
          </span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1 text-slate-300 drop-shadow">
            {gameState === 'crashed'
              ? 'FLEW AWAY!'
              : gameState === 'cashed'
              ? 'CASHED OUT!'
              : gameState === 'flying'
              ? 'IN FLIGHT...'
              : 'PLACE BET TO TAKE OFF'}
          </span>
        </div>
      </div>

      {/* Auto Cashout Strip */}
      <div className="w-full bg-slate-950/80 border-x-4 border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoCashout(!autoCashout)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              autoCashout
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            <span>Auto Cash Out</span>
          </button>
          {autoCashout && (
            <div className="flex items-center space-x-1">
              {[1.5, 2.0, 3.0, 5.0].map(val => (
                <button
                  key={val}
                  onClick={() => setAutoCashoutVal(val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-black ${
                    autoCashoutVal === val
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {val.toFixed(1)}x
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase hidden sm:inline">
          {autoCashout ? `Auto Cash at ${autoCashoutVal}x` : 'Manual Cashout Active'}
        </span>
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

        {/* Launch or Instant Cashout Button */}
        {gameState === 'flying' ? (
          <button
            onClick={cashOut}
            className="w-full sm:w-56 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 animate-pulse cursor-pointer transform active:scale-95"
          >
            <Trophy className="w-4 h-4" />
            <span>CASH OUT {formatCurrency(bet * multiplierRef.current)}</span>
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
