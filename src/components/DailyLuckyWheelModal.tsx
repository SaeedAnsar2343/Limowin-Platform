import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy, Clock, ShieldCheck, Flame, Gift } from 'lucide-react';

interface WheelSector {
  label: string;
  inrAmount: number;
  usdAmount: number;
  isSpins?: boolean;
  spinsCount?: number;
  color: string;
  textColor: string;
}

const SECTORS: WheelSector[] = [
  { label: '₹10 / $0.20', inrAmount: 10, usdAmount: 0.2, color: '#1e293b', textColor: '#f8fafc' },
  { label: '5 Free Spins', inrAmount: 15, usdAmount: 0.3, isSpins: true, spinsCount: 5, color: '#f59e0b', textColor: '#0f172a' },
  { label: '₹25 / $0.50', inrAmount: 25, usdAmount: 0.5, color: '#047857', textColor: '#ffffff' },
  { label: '₹5 / $0.10', inrAmount: 5, usdAmount: 0.1, color: '#334155', textColor: '#f8fafc' },
  { label: '10 Free Spins', inrAmount: 30, usdAmount: 0.6, isSpins: true, spinsCount: 10, color: '#8b5cf6', textColor: '#ffffff' },
  { label: '₹50 VIP', inrAmount: 50, usdAmount: 1.0, color: '#d97706', textColor: '#0f172a' },
  { label: '₹15 / $0.30', inrAmount: 15, usdAmount: 0.3, color: '#0369a1', textColor: '#ffffff' },
  { label: '₹100 MEGA', inrAmount: 100, usdAmount: 2.0, color: '#dc2626', textColor: '#ffffff' }
];

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DailyLuckyWheelModal: React.FC = () => {
  const { activeModal, setActiveModal, user, claimDailyWheelReward, currency, formatCurrency, showToast } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningSector, setWinningSector] = useState<WheelSector | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [canSpin, setCanSpin] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Check cooldown timer
  useEffect(() => {
    isMountedRef.current = true;

    const checkTimer = () => {
      if (!user) {
        setCanSpin(true);
        setTimeLeftStr('');
        return;
      }

      // Check lastDailySpinTime from user or localStorage
      const savedTime = user.lastDailySpinTime || Number(localStorage.getItem(`limowin_last_spin_${user.id}`) || 0);
      const now = Date.now();
      const elapsed = now - savedTime;

      if (savedTime > 0 && elapsed < COOLDOWN_MS) {
        setCanSpin(false);
        const rem = COOLDOWN_MS - elapsed;
        const hours = Math.floor(rem / (1000 * 60 * 60));
        const mins = Math.floor((rem % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((rem % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
      } else {
        setCanSpin(true);
        setTimeLeftStr('');
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [user, activeModal]);

  // Draw initial canvas wheel
  useEffect(() => {
    if (activeModal === 'dailyWheel') {
      drawWheel(rotationRef.current);
    }
  }, [activeModal]);

  const drawWheel = (angleRad: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 14;

    ctx.clearRect(0, 0, width, height);

    // Outer Chrome Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    const ringGrad = ctx.createRadialGradient(centerX, centerY, radius - 4, centerX, centerY, radius + 10);
    ringGrad.addColorStop(0, '#f59e0b');
    ringGrad.addColorStop(0.5, '#fbbf24');
    ringGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = ringGrad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;

    const sliceAngle = (2 * Math.PI) / SECTORS.length;

    // Draw Segments
    SECTORS.forEach((sec, i) => {
      const startA = angleRad + i * sliceAngle;
      const endA = startA + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startA, endA);
      ctx.closePath();
      ctx.fillStyle = sec.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Sector Text & Emblems
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startA + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = sec.textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(sec.label, radius - 16, 4);
      ctx.restore();
    });

    // Outer Bulb Lights
    const bulbCount = 24;
    for (let b = 0; b < bulbCount; b++) {
      const bAngle = angleRad + (b * 2 * Math.PI) / bulbCount;
      const bx = centerX + (radius + 5) * Math.cos(bAngle);
      const by = centerY + (radius + 5) * Math.sin(bAngle);

      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, 2 * Math.PI);
      ctx.fillStyle = b % 2 === 0 ? '#fef08a' : '#ffffff';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Center Golden Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 32);
    hubGrad.addColorStop(0, '#fef08a');
    hubGrad.addColorStop(0.7, '#d97706');
    hubGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'black 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', centerX, centerY + 5);

    // Flapper at Top
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY - radius - 12);
    ctx.lineTo(centerX + 10, centerY - radius - 12);
    ctx.lineTo(centerX, centerY - radius + 10);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;
    if (!user) {
      setActiveModal('login');
      return;
    }

    setIsSpinning(true);
    setWinningSector(null);
    sound.playChip();
    sound.playWheelSpin();

    // Select reward with house edge distribution (teasers: ₹10, ₹15, 5 Free Spins most frequent)
    const weights = [0.35, 0.25, 0.12, 0.10, 0.08, 0.05, 0.04, 0.01];
    let rand = Math.random();
    let targetIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      if (rand < weights[i]) {
        targetIdx = i;
        break;
      }
      rand -= weights[i];
    }

    const sliceAngle = (2 * Math.PI) / SECTORS.length;
    // Flapper is at angle 3*PI/2 (top)
    const targetAngle = (3 * Math.PI) / 2 - (targetIdx * sliceAngle + sliceAngle / 2);
    const extraSpins = 6 + Math.floor(Math.random() * 3);
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
        const landedSector = SECTORS[targetIdx];
        setWinningSector(landedSector);

        // Sound & Confetti
        sound.playJackpot();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

        // Credit to bonus balance with 5-game playthrough lock
        const rewardAmt = currency === 'INR' ? landedSector.inrAmount : landedSector.usdAmount;
        claimDailyWheelReward(rewardAmt);
        setCanSpin(false);

        showToast(
          `🎉 Won ${landedSector.label}! Credited to Bonus Balance (Play 5 games to unlock withdrawal).`,
          'win'
        );
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  if (activeModal !== 'dailyWheel') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 text-white relative overflow-hidden flex flex-col items-center">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1 mb-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5 text-yellow-400" />
            <span>Daily Free Check-In Wheel</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200">
            SPIN &amp; WIN REAL CASH
          </h3>
          <p className="text-xs text-slate-400">
            Free spin available every 24 hours. Wager on 5 games to unlock cash for withdrawal!
          </p>
        </div>

        {/* Wheel Canvas Stage */}
        <div className="relative my-2">
          <canvas
            ref={canvasRef}
            width={310}
            height={310}
            className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-full drop-shadow-[0_0_35px_rgba(245,158,11,0.25)]"
          />

          {/* Winning Reward Banner Overlay */}
          {winningSector && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-slate-950/95 border-2 border-yellow-400 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce z-20">
              <span className="text-[10px] text-yellow-400 font-black uppercase tracking-wider">
                🎉 YOU WON!
              </span>
              <span className="text-sm sm:text-base font-black text-white whitespace-nowrap">
                {winningSector.label}
              </span>
            </div>
          )}
        </div>

        {/* Action Button & Cooldown */}
        <div className="w-full mt-4 space-y-2.5">
          {canSpin ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all transform active:scale-98 flex items-center justify-center space-x-2 ${
                isSpinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isSpinning ? 'SPINNING WHEEL...' : 'SPIN FOR FREE NOW'}</span>
            </button>
          ) : (
            <div className="w-full p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex flex-col items-center text-center space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Next Free Spin Available In:</span>
              </div>
              <span className="text-lg font-black text-white font-mono tracking-wider">
                {timeLeftStr || '24h 00m 00s'}
              </span>
              <span className="text-[10px] text-slate-400">
                Check back daily to claim rewards &amp; boost your balance!
              </span>
            </div>
          )}

          {/* Playthrough Lock Transparency Assurance */}
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fair Play Guaranteed • 5-Game Playthrough Unlock Rule</span>
          </div>
        </div>
      </div>
    </div>
  );
};
