import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLivePlayers } from '../services/livePlayersService';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { siteSettings, banners, setActiveModal } = useApp();
  const { totalOnline } = useLivePlayers();
  const [currentIdx, setCurrentIdx] = useState(0);

  const activeBanners = banners.filter(b => b.active !== false);

  // Auto advance carousel
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % activeBanners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIdx % activeBanners.length];

  const handleAction = (target?: string | null) => {
    if (target === 'deposit') setActiveModal('deposit');
    else if (target === 'register') setActiveModal('register');
    else if (target === 'profile') setActiveModal('profile');
    else if (target === 'support') setActiveModal('support');
    else setActiveModal('deposit');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 pb-2">
      {/* Banner Carousel Card - Optimized Resolution for Both Mobile & Desktop */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 h-[210px] sm:h-[270px] md:h-[310px] lg:h-[340px] bg-slate-950 group">
        {activeBanners.map((b, idx) => {
          const isSelected = idx === (currentIdx % activeBanners.length);
          const hasCustomImage = b.desktopImageUrl || b.mobileImageUrl;

          return (
            <div
              key={b.id || idx}
              onClick={() => handleAction(b.targetModal)}
              className={`absolute inset-0 transition-all duration-700 cursor-pointer ${
                isSelected ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 pointer-events-none scale-102'
              }`}
            >
              {hasCustomImage ? (
                /* Custom High-Res Image provided via Admin Portal */
                <picture className="w-full h-full block">
                  {b.mobileImageUrl && (
                    <source media="(max-width: 640px)" srcSet={b.mobileImageUrl} />
                  )}
                  {b.desktopImageUrl && (
                    <source media="(min-width: 641px)" srcSet={b.desktopImageUrl} />
                  )}
                  <img
                    src={b.desktopImageUrl || b.mobileImageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-102"
                  />
                </picture>
              ) : (
                /* Dynamic High-End 3D Casino Card Banner (Default or Custom Gradient) */
                <div
                  className={`w-full h-full bg-gradient-to-r ${b.bgGradient || 'from-indigo-950 via-purple-900 to-slate-950'} flex items-center justify-between p-5 sm:p-8 md:p-12 relative overflow-hidden`}
                >
                  {/* Subtle Background Glows */}
                  <div className="absolute -top-16 -left-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Left Content Column */}
                  <div className="relative z-10 max-w-xl text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md mb-2 sm:mb-3 border border-yellow-300">
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>{b.badge || 'EXCLUSIVE OFFER'}</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-md">
                      {b.title}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-slate-300 text-xs sm:text-sm md:text-base font-medium mt-1 sm:mt-2.5 line-clamp-2 max-w-lg leading-relaxed">
                      {b.subtitle}
                    </p>

                    {/* CTA Button */}
                    <div className="mt-3.5 sm:mt-5 flex items-center space-x-3">
                      <button
                        type="button"
                        className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wide bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center space-x-2 transition-all transform active:scale-95 border border-yellow-200"
                      >
                        <span>{b.buttonText || 'Claim Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-400 font-bold">
                        <span>•</span>
                        <span>Instant Payouts</span>
                        <span>•</span>
                        <span>256-Bit SSL</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Graphic 3D Element */}
                  <div className="hidden sm:flex relative z-10 shrink-0 items-center justify-center pr-2 md:pr-6">
                    <div className="w-28 h-28 md:w-44 md:h-44 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-5xl md:text-7xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                      {b.icon || '🎰'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Carousel Arrow Controls (Visible on hover on desktop, easy touch on mobile) */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={e => {
                e.stopPropagation();
                setCurrentIdx(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1));
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                setCurrentIdx(prev => (prev + 1) % activeBanners.length);
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Indicator dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 sm:space-x-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={e => {
                  e.stopPropagation();
                  setCurrentIdx(idx);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  idx === (currentIdx % activeBanners.length)
                    ? 'w-6 sm:w-8 bg-amber-400 shadow-sm'
                    : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Live Announcement Ribbon Bar - Ultra Clean Mobile & Desktop */}
      <div className="mt-2.5 sm:mt-3 bg-gradient-to-r from-amber-500/10 via-yellow-400/20 to-amber-500/10 border border-amber-300/60 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-hidden flex-1 mr-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
            📢
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
            {siteSettings.bannerAnnouncement}
          </span>
        </div>

        {/* Live Active Online Counter Pill */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-black shrink-0 shadow-sm mr-2 sm:mr-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{totalOnline.toLocaleString()} Live Players</span>
        </div>

        <div className="hidden md:flex items-center space-x-3 text-[11px] font-bold text-slate-600 shrink-0">
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
