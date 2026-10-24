import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { RotateCw, Trophy, Sparkles, PlusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

// European Roulette Wheel Standard Order (37 pockets: 0 to 36)
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// 3 Rows of 12 numbers for standard European board layout
const ROW_1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
const ROW_2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const ROW_3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

type BetType =
  | 'number'
  | 'red'
  | 'black'
  | 'even'
  | 'odd'
  | 'low' // 1-18
  | 'high' // 19-36
  | 'dozen1' // 1-12
  | 'dozen2' // 13-24
  | 'dozen3' // 25-36
  | 'col1' // Row 3
  | 'col2' // Row 2
  | 'col3'; // Row 1

export const Roulette3D: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome, setActiveModal } = useApp();

  const [selectedBetType, setSelectedBetType] = useState<BetType>('red');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [chipValue, setChipValue] = useState<number>(currencyConfig.minBet);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([17, 32, 0, 7, 24]);

  // Persistent Animation References (Prevents React re-render thrashing & Canvas blanking)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const wheelRotationRef = useRef<number>(0);
  const ballPosRef = useRef<{ angle: number; radiusRatio: number }>({ angle: -Math.PI / 2, radiusRatio: 0.76 });
  const isSpinningRef = useRef<boolean>(false);

  // Synchronize chip value with currency config
  useEffect(() => {
    if (chipValue < currencyConfig.minBet || chipValue > currencyConfig.maxBet) {
      setChipValue(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  // Render high performance Canvas directly without React state overhead
  const drawWheel = useCallback((rotationDeg: number, ball: { angle: number; radiusRatio: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 8;
    const rimRadius = outerRadius - 14;
    const pocketOuter = rimRadius - 18;
    const pocketInner = pocketOuter - 38;
    const turretRadius = pocketInner - 6;

    ctx.clearRect(0, 0, width, height);

    // 1. Outer Mahogany / Dark Wood Bowl
    const bowlGrad = ctx.createRadialGradient(centerX, centerY, pocketInner, centerX, centerY, outerRadius);
    bowlGrad.addColorStop(0, '#2d1810');
    bowlGrad.addColorStop(0.7, '#1b0d07');
    bowlGrad.addColorStop(1, '#0f0502');
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = bowlGrad;
    ctx.fill();

    // Outer Gold Ring Bezel
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();

    // 2. Ball Track Ring (Dark Gunmetal Finish)
    const trackGrad = ctx.createRadialGradient(centerX, centerY, pocketOuter, centerX, centerY, rimRadius);
    trackGrad.addColorStop(0, '#111827');
    trackGrad.addColorStop(1, '#1f2937');
    ctx.beginPath();
    ctx.arc(centerX, centerY, rimRadius, 0, 2 * Math.PI);
    ctx.fillStyle = trackGrad;
    ctx.fill();

    // Deflector diamond pins
    for (let f = 0; f < 8; f++) {
      const deflAngle = (f * Math.PI) / 4;
      const dx = centerX + (rimRadius - 7) * Math.cos(deflAngle);
      const dy = centerY + (rimRadius - 7) * Math.sin(deflAngle);
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#facc15';
      ctx.fill();
    }

    // 3. Rotating Wheel Head
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationDeg * Math.PI) / 180);

    const sliceAngle = (2 * Math.PI) / ROULETTE_NUMBERS.length;

    // Draw Pockets & Number Slices
    ROULETTE_NUMBERS.forEach((num, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(0, 0, pocketOuter, startAngle, endAngle);
      ctx.arc(0, 0, pocketInner, endAngle, startAngle, true);
      ctx.closePath();

      if (num === 0) {
        ctx.fillStyle = '#16a34a'; // Vibrant green
      } else if (RED_NUMBERS.includes(num)) {
        ctx.fillStyle = '#dc2626'; // Deep casino red
      } else {
        ctx.fillStyle = '#0f172a'; // Deep slate black
      }
      ctx.fill();

      // Metallic separator fret
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Number text
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(num.toString(), pocketOuter - 6, 4);
      ctx.restore();
    });

    // Inner brass ring holding the pockets
    ctx.beginPath();
    ctx.arc(0, 0, pocketInner, 0, 2 * Math.PI);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. Center Golden Turret Spindle (Polished 3D Cone)
    const coneGrad = ctx.createRadialGradient(-5, -5, 2, 0, 0, turretRadius);
    coneGrad.addColorStop(0, '#fef9c3');
    coneGrad.addColorStop(0.3, '#facc15');
    coneGrad.addColorStop(0.7, '#ca8a04');
    coneGrad.addColorStop(1, '#854d0e');

    ctx.beginPath();
    ctx.arc(0, 0, turretRadius, 0, 2 * Math.PI);
    ctx.fillStyle = coneGrad;
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Brass Turret 4-Point Handles
    for (let arm = 0; arm < 4; arm++) {
      ctx.save();
      ctx.rotate((arm * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(turretRadius - 4, -2);
      ctx.lineTo(turretRadius - 4, 2);
      ctx.lineTo(0, 6);
      ctx.fillStyle = '#fde047';
      ctx.fill();
      ctx.restore();
    }

    // Central Spindle Cap
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    ctx.restore();

    // 5. Animated Silver Ball
    const currentRadius = pocketOuter * ball.radiusRatio;
    const bx = centerX + currentRadius * Math.cos(ball.angle);
    const by = centerY + currentRadius * Math.sin(ball.angle);

    // Ball shadow
    ctx.beginPath();
    ctx.arc(bx + 2, by + 2, 5.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Silver Pearl Sphere
    const ballGrad = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 5.5);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.5, '#e2e8f0');
    ballGrad.addColorStop(1, '#94a3b8');

    ctx.beginPath();
    ctx.arc(bx, by, 5.5, 0, 2 * Math.PI);
    ctx.fillStyle = ballGrad;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = isSpinningRef.current ? 6 : 2;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 6. Top Needle Indicator (Gold Arrow Pointing Down to Top-Center at 270°)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - outerRadius - 4);
    ctx.lineTo(centerX - 8, centerY - outerRadius - 16);
    ctx.lineTo(centerX + 8, centerY - outerRadius - 16);
    ctx.closePath();
    ctx.fillStyle = '#facc15';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, []);

  // Initial draw & handle component mount
  useEffect(() => {
    drawWheel(wheelRotationRef.current, ballPosRef.current);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawWheel]);

  // Check if a number matches the selected bet type
  const checkMatchesBet = (num: number, bType: BetType, sNum: number | null): boolean => {
    if (bType === 'number') return num === sNum;
    if (num === 0) return false;
    if (bType === 'red') return RED_NUMBERS.includes(num);
    if (bType === 'black') return !RED_NUMBERS.includes(num);
    if (bType === 'even') return num % 2 === 0;
    if (bType === 'odd') return num % 2 !== 0;
    if (bType === 'low') return num >= 1 && num <= 18;
    if (bType === 'high') return num >= 19 && num <= 36;
    if (bType === 'dozen1') return num >= 1 && num <= 12;
    if (bType === 'dozen2') return num >= 13 && num <= 24;
    if (bType === 'dozen3') return num >= 25 && num <= 36;
    if (bType === 'col1') return ROW_3.includes(num);
    if (bType === 'col2') return ROW_2.includes(num);
    if (bType === 'col3') return ROW_1.includes(num);
    return false;
  };

  const getTheoreticalMultiplier = (bType: BetType): number => {
    if (bType === 'number') return 36.0;
    if (bType === 'dozen1' || bType === 'dozen2' || bType === 'dozen3' || bType === 'col1' || bType === 'col2' || bType === 'col3') {
      return 3.0;
    }
    return 2.0;
  };

  const spinWheel = () => {
    if (isSpinningRef.current || balance < chipValue) return;

    // Cancel any stray animation loop
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const currentBetNum = selectedBetType === 'number' ? (selectedNumber !== null ? selectedNumber : 17) : null;
    if (selectedBetType === 'number' && selectedNumber === null) {
      setSelectedNumber(17);
    }

    isSpinningRef.current = true;
    setIsSpinning(true);
    setWinningNumber(null);
    setLastWin(null);

    sound.playChip();
    sound.playWheelSpin();

    const theoreticalMult = getTheoreticalMultiplier(selectedBetType);

    // Centralized House Outcome calculation
    const outcome = calculateWinOutcome(chipValue, theoreticalMult);

    let targetNum: number;
    const matchingNumbers = ROULETTE_NUMBERS.filter(n => checkMatchesBet(n, selectedBetType, currentBetNum));
    const nonMatchingNumbers = ROULETTE_NUMBERS.filter(n => !checkMatchesBet(n, selectedBetType, currentBetNum));

    if (outcome.isWin) {
      if (matchingNumbers.length > 0) {
        targetNum = matchingNumbers[Math.floor(Math.random() * matchingNumbers.length)];
      } else {
        targetNum = currentBetNum !== null ? currentBetNum : 17;
      }
    } else {
      // Psychological Near-Miss Engine:
      // If player picked a straight number, land in the adjacent pocket directly beside it!
      if (currentBetNum !== null) {
        const betIdx = ROULETTE_NUMBERS.indexOf(currentBetNum);
        if (betIdx !== -1) {
          const adjacentOffsets = [-1, 1];
          const offset = adjacentOffsets[Math.floor(Math.random() * adjacentOffsets.length)];
          const nearIdx = (betIdx + offset + ROULETTE_NUMBERS.length) % ROULETTE_NUMBERS.length;
          targetNum = ROULETTE_NUMBERS[nearIdx];
        } else {
          targetNum = nonMatchingNumbers[Math.floor(Math.random() * nonMatchingNumbers.length)] || 0;
        }
      } else {
        targetNum = nonMatchingNumbers[Math.floor(Math.random() * nonMatchingNumbers.length)] || 0;
      }
    }

    const targetIdx = ROULETTE_NUMBERS.indexOf(targetNum);
    const sliceAngleDeg = 360 / ROULETTE_NUMBERS.length;
    const targetPocketAngle = targetIdx * sliceAngleDeg + sliceAngleDeg / 2;

    // Pointer is at Top (270° in standard canvas rotation)
    const pointerAngle = 270;
    let delta = (pointerAngle - targetPocketAngle) % 360;
    if (delta < 0) delta += 360;

    const spins = 5 + Math.floor(Math.random() * 3);
    const currentRotMod = wheelRotationRef.current % 360;
    let extraRotation = delta - currentRotMod;
    if (extraRotation <= 0) extraRotation += 360;
    const finalWheelTarget = wheelRotationRef.current + 360 * spins + extraRotation;

    const startTime = performance.now();
    const duration = 3000;
    const startRot = wheelRotationRef.current;

    let bounceClickPlayed = false;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic-out easing for wheel deceleration
      const wheelEase = 1 - Math.pow(1 - progress, 3.2);
      const currentWheelAngle = startRot + (finalWheelTarget - startRot) * wheelEase;
      wheelRotationRef.current = currentWheelAngle;

      // Ball Physics: Starts fast counter-clockwise on outer track, then drops into pocket
      const ballSpins = 7.0;
      const ballInitialSpeed = (ballSpins * 2 * Math.PI) * (1 - Math.pow(progress, 1.8));
      const targetBallAngleRad = -Math.PI / 2;

      let radiusRatio = 0.95;
      if (progress > 0.65) {
        const dropProgress = (progress - 0.65) / 0.35;
        radiusRatio = 0.95 - 0.19 * (1 - Math.pow(1 - dropProgress, 2));
      }

      if (progress > 0.82 && !bounceClickPlayed) {
        bounceClickPlayed = true;
        sound.playBounce();
      }

      const currentBallAngle = targetBallAngleRad - ballInitialSpeed;
      ballPosRef.current = { angle: currentBallAngle, radiusRatio };

      // Draw directly on Canvas without invoking React Virtual DOM re-renders
      drawWheel(currentWheelAngle, ballPosRef.current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin Finished: Normalize wheel rotation to [0, 360) so degrees never explode
        wheelRotationRef.current = finalWheelTarget % 360;
        ballPosRef.current = { angle: -Math.PI / 2, radiusRatio: 0.76 };
        drawWheel(wheelRotationRef.current, ballPosRef.current);

        isSpinningRef.current = false;
        setIsSpinning(false);
        setWinningNumber(targetNum);
        setHistory(prev => [targetNum, ...prev.slice(0, 9)]);

        sound.playBallDrop();

        if (outcome.isWin) {
          const winAmt = chipValue * outcome.multiplier * bonusMultiplier;
          setLastWin(winAmt);
          sound.playJackpot();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
          setLastWin(null);
          sound.playLose();
        }

        onPlay(chipValue, outcome.multiplier, outcome.isWin);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-2 sm:p-4 select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xl shadow-inner">
            🎡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-extrabold text-base sm:text-lg tracking-wide">{game.title}</h3>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded border border-amber-500/30">
                EUROPEAN 3D
              </span>
            </div>
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <span>Single 0 • 97.3% RTP</span>
            </span>
          </div>
        </div>

        {/* Win Banner */}
        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900/90 border border-emerald-500 text-emerald-300 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm flex items-center space-x-2 animate-bounce shadow-lg shadow-emerald-950/60">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}

        {/* Landed Numbers History */}
        <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-500 font-bold mr-1 hidden sm:inline">History:</span>
          {history.slice(0, 7).map((num, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                num === 0
                  ? 'bg-emerald-600 text-white'
                  : RED_NUMBERS.includes(num)
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-white border border-slate-700'
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Main Wheel Canvas & Complete European Betting Board */}
      <div className="w-full bg-slate-950 border-x border-slate-800 p-3 sm:p-5 flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Left Side: 3D Animated Wheel */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full shadow-[0_0_50px_rgba(234,179,8,0.22)] border-4 border-amber-600/40"
          />

          {/* Landed Number Spotlight Indicator */}
          {winningNumber !== null && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-slate-950/95 border-2 border-yellow-400 text-white flex flex-col items-center justify-center shadow-2xl animate-pulse">
              <span className="text-[10px] text-yellow-400 uppercase font-extrabold tracking-wider">Landed</span>
              <span
                className={`text-2xl font-black ${
                  winningNumber === 0
                    ? 'text-emerald-400'
                    : RED_NUMBERS.includes(winningNumber)
                    ? 'text-rose-400'
                    : 'text-slate-200'
                }`}
              >
                {winningNumber}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Full European Casino Table Layout */}
        <div className="w-full flex-1 max-w-xl space-y-2.5">
          {/* Active Bet Badge Summary */}
          <div className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-bold">Selected Bet:</span>
            <div className="flex items-center space-x-2 font-black">
              <span className="text-amber-400 uppercase">
                {selectedBetType === 'number'
                  ? `Number ${selectedNumber ?? 'None'} (36x)`
                  : selectedBetType === 'red'
                  ? 'Red (2x)'
                  : selectedBetType === 'black'
                  ? 'Black (2x)'
                  : selectedBetType === 'even'
                  ? 'Even (2x)'
                  : selectedBetType === 'odd'
                  ? 'Odd (2x)'
                  : selectedBetType === 'low'
                  ? '1 to 18 (2x)'
                  : selectedBetType === 'high'
                  ? '19 to 36 (2x)'
                  : selectedBetType === 'dozen1'
                  ? '1st 12 (3x)'
                  : selectedBetType === 'dozen2'
                  ? '2nd 12 (3x)'
                  : selectedBetType === 'dozen3'
                  ? '3rd 12 (3x)'
                  : selectedBetType === 'col1'
                  ? 'Column 1 (3x)'
                  : selectedBetType === 'col2'
                  ? 'Column 2 (3x)'
                  : 'Column 3 (3x)'}
              </span>
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[11px]">
                {formatCurrency(chipValue)}
              </span>
            </div>
          </div>

          {/* Table Grid: Green 0 + 3 Rows x 12 Columns */}
          <div className="bg-emerald-950/70 p-2 sm:p-3 rounded-2xl border-2 border-emerald-700/50 shadow-inner">
            <div className="flex gap-1">
              {/* Green Zero */}
              <button
                onClick={() => {
                  setSelectedBetType('number');
                  setSelectedNumber(0);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`w-10 sm:w-12 rounded-xl flex items-center justify-center text-sm font-black transition-all border ${
                  selectedBetType === 'number' && selectedNumber === 0
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200 scale-105 z-10 shadow-lg'
                    : 'bg-emerald-800 text-white border-emerald-600/60 hover:bg-emerald-700'
                }`}
              >
                0
              </button>

              {/* 36 Numbers Grid: Rows 1, 2, 3 */}
              <div className="flex-1 grid grid-rows-3 gap-1">
                {/* Row 1 (Numbers 3 to 36) */}
                <div className="grid grid-cols-12 gap-1">
                  {ROW_1.map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        setSelectedBetType('number');
                        setSelectedNumber(n);
                        sound.playChip();
                      }}
                      disabled={isSpinning}
                      className={`h-7 sm:h-8 rounded text-[11px] sm:text-xs font-black transition-all border ${
                        selectedBetType === 'number' && selectedNumber === n
                          ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200 scale-105 z-10 shadow-lg'
                          : RED_NUMBERS.includes(n)
                          ? 'bg-rose-700 hover:bg-rose-600 text-white border-rose-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* Row 2 (Numbers 2 to 35) */}
                <div className="grid grid-cols-12 gap-1">
                  {ROW_2.map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        setSelectedBetType('number');
                        setSelectedNumber(n);
                        sound.playChip();
                      }}
                      disabled={isSpinning}
                      className={`h-7 sm:h-8 rounded text-[11px] sm:text-xs font-black transition-all border ${
                        selectedBetType === 'number' && selectedNumber === n
                          ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200 scale-105 z-10 shadow-lg'
                          : RED_NUMBERS.includes(n)
                          ? 'bg-rose-700 hover:bg-rose-600 text-white border-rose-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* Row 3 (Numbers 1 to 34) */}
                <div className="grid grid-cols-12 gap-1">
                  {ROW_3.map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        setSelectedBetType('number');
                        setSelectedNumber(n);
                        sound.playChip();
                      }}
                      disabled={isSpinning}
                      className={`h-7 sm:h-8 rounded text-[11px] sm:text-xs font-black transition-all border ${
                        selectedBetType === 'number' && selectedNumber === n
                          ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200 scale-105 z-10 shadow-lg'
                          : RED_NUMBERS.includes(n)
                          ? 'bg-rose-700 hover:bg-rose-600 text-white border-rose-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2:1 Column Bets */}
              <div className="w-10 sm:w-12 grid grid-rows-3 gap-1">
                <button
                  onClick={() => {
                    setSelectedBetType('col3');
                    setSelectedNumber(null);
                    sound.playChip();
                  }}
                  disabled={isSpinning}
                  className={`rounded text-[10px] sm:text-xs font-extrabold border ${
                    selectedBetType === 'col3'
                      ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200'
                      : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60 hover:bg-emerald-800'
                  }`}
                >
                  2:1
                </button>
                <button
                  onClick={() => {
                    setSelectedBetType('col2');
                    setSelectedNumber(null);
                    sound.playChip();
                  }}
                  disabled={isSpinning}
                  className={`rounded text-[10px] sm:text-xs font-extrabold border ${
                    selectedBetType === 'col2'
                      ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200'
                      : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60 hover:bg-emerald-800'
                  }`}
                >
                  2:1
                </button>
                <button
                  onClick={() => {
                    setSelectedBetType('col1');
                    setSelectedNumber(null);
                    sound.playChip();
                  }}
                  disabled={isSpinning}
                  className={`rounded text-[10px] sm:text-xs font-extrabold border ${
                    selectedBetType === 'col1'
                      ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200'
                      : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60 hover:bg-emerald-800'
                  }`}
                >
                  2:1
                </button>
              </div>
            </div>

            {/* Dozens Bets (1st 12, 2nd 12, 3rd 12 - 3x Payout) */}
            <div className="grid grid-cols-3 gap-1 mt-1 pl-10 sm:pl-12 pr-10 sm:pr-12">
              <button
                onClick={() => {
                  setSelectedBetType('dozen1');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[11px] sm:text-xs font-black uppercase transition-all border ${
                  selectedBetType === 'dozen1'
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200 shadow-md'
                    : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60 hover:bg-emerald-800'
                }`}
              >
                1st 12 (3x)
              </button>
              <button
                onClick={() => {
                  setSelectedBetType('dozen2');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[11px] sm:text-xs font-black uppercase transition-all border ${
                  selectedBetType === 'dozen2'
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200 shadow-md'
                    : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60 hover:bg-emerald-800'
                }`}
              >
                2nd 12 (3x)
              </button>
              <button
                onClick={() => {
                  setSelectedBetType('dozen3');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[11px] sm:text-xs font-black uppercase transition-all border ${
                  selectedBetType === 'dozen3'
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200 shadow-md'
                    : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60 hover:bg-emerald-800'
                }`}
              >
                3rd 12 (3x)
              </button>
            </div>

            {/* Outside Bets (1-18, Even, Red, Black, Odd, 19-36 - 2x Payout) */}
            <div className="grid grid-cols-6 gap-1 mt-1 pl-10 sm:pl-12 pr-10 sm:pr-12">
              <button
                onClick={() => {
                  setSelectedBetType('low');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[10px] sm:text-xs font-extrabold uppercase border ${
                  selectedBetType === 'low'
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                }`}
              >
                1 to 18
              </button>

              <button
                onClick={() => {
                  setSelectedBetType('even');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[10px] sm:text-xs font-extrabold uppercase border ${
                  selectedBetType === 'even'
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                }`}
              >
                EVEN
              </button>

              <button
                onClick={() => {
                  setSelectedBetType('red');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[10px] sm:text-xs font-black uppercase flex items-center justify-center space-x-1 border ${
                  selectedBetType === 'red'
                    ? 'bg-rose-600 text-white ring-2 ring-yellow-300 border-yellow-300 shadow-md'
                    : 'bg-rose-900/80 text-rose-200 border-rose-700/60 hover:bg-rose-800'
                }`}
              >
                <span>🔴 RED</span>
              </button>

              <button
                onClick={() => {
                  setSelectedBetType('black');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[10px] sm:text-xs font-black uppercase flex items-center justify-center space-x-1 border ${
                  selectedBetType === 'black'
                    ? 'bg-slate-800 text-white ring-2 ring-yellow-300 border-yellow-300 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <span>⚫ BLACK</span>
              </button>

              <button
                onClick={() => {
                  setSelectedBetType('odd');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[10px] sm:text-xs font-extrabold uppercase border ${
                  selectedBetType === 'odd'
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                }`}
              >
                ODD
              </button>

              <button
                onClick={() => {
                  setSelectedBetType('high');
                  setSelectedNumber(null);
                  sound.playChip();
                }}
                disabled={isSpinning}
                className={`py-1.5 rounded text-[10px] sm:text-xs font-extrabold uppercase border ${
                  selectedBetType === 'high'
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 border-yellow-200'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                }`}
              >
                19 to 36
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Console - Chips & Spin Action */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Chip Selection Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase mr-1 shrink-0">Chips:</span>
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
          {/* Quick Double Bet Button */}
          <button
            onClick={() => {
              setChipValue(prev => Math.min(currencyConfig.maxBet, prev * 2));
              sound.playChip();
            }}
            disabled={isSpinning || chipValue >= currencyConfig.maxBet}
            className="px-2.5 h-10 sm:h-11 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 shrink-0"
          >
            2X
          </button>
        </div>

        {/* Spin / Deposit Action Button */}
        {balance < chipValue ? (
          <button
            onClick={() => setActiveModal('deposit')}
            className="w-full sm:w-56 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 text-white shadow-emerald-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Deposit to Spin</span>
          </button>
        ) : (
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`w-full sm:w-56 py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
              isSpinning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/30'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Spinning Wheel...' : `SPIN ${formatCurrency(chipValue)}`}</span>
          </button>
        )}
      </div>
    </div>
  );
};
