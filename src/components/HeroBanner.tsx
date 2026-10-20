import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Volume2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { siteSettings, setActiveModal } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);

  const banners = [
    {
      image: '/assets/banners/welcome-bonus.png',
      action: () => setActiveModal('register')
    },
    {
      image: '/assets/banners/vip-cashback.png',
      action: () => setActiveModal('profile')
    },
    {
      image: '/assets/banners/sports-accumulator.png',
      action: () => setActiveModal('deposit')
    },
    {
      image: '/assets/banners/crypto-deposit.png',
      action: () => setActiveModal('deposit')
    },
    {
      image: '/assets/banners/referral-affiliate.png',
      action: () => setActiveModal('profile')
    }
  ];

  // Auto advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
      {/* Banner Carousel Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 aspect-[16/6] sm:aspect-[21/7] max-h-[360px] bg-slate-900 group">
        {banners.map((b, idx) => (
          <div
            key={idx}
            onClick={b.action}
            className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${
              idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={b.image}
              alt="Promo Banner"
              className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-101"
            />
          </div>
        ))}

        {/* Carousel Arrow Controls */}
        <button
          onClick={() => setCurrentIdx(prev => (prev === 0 ? banners.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs border border-white/20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentIdx(prev => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs border border-white/20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicator dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIdx ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Live Announcement Ribbon Bar */}
      <div className="mt-3 bg-gradient-to-r from-amber-500/10 via-yellow-400/20 to-amber-500/10 border border-amber-300/60 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
            📢
          </div>
          <span className="text-xs font-bold text-slate-800 truncate">
            {siteSettings.bannerAnnouncement}
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-[11px] font-bold text-slate-600 shrink-0">
          <div className="flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant USDT / UPI Payouts</span>
          </div>
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SHA-256 Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
