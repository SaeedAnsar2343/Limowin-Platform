import React from 'react';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/soundEffects';
import { Home, Gamepad2, PlusCircle, Headphones, User, Shield } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    user,
    activeModal,
    setActiveModal,
    setSelectedCategory,
    chatMessages
  } = useApp();

  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'saeed.samadelivery@gmail.com');
  const unreadCount = chatMessages.filter(m => !m.read && m.sender === 'admin').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 md:hidden shadow-[0_-8px_35px_rgba(0,0,0,0.45)] safe-bottom text-slate-300">
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {/* 1. Home */}
        <button
          onClick={() => {
            triggerHaptic(15);
            setActiveModal(null);
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeModal === null
              ? 'text-amber-400 font-black scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        {/* 2. Casino / Games */}
        <button
          onClick={() => {
            triggerHaptic(15);
            setActiveModal(null);
            setSelectedCategory('hot');
            const el = document.getElementById('games-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-all"
        >
          <Gamepad2 className="w-5 h-5 mb-0.5 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-tight">200+ Games</span>
        </button>

        {/* 3. Center Highlight: Glowing Glassy Deposit Button */}
        <div className="flex flex-col items-center justify-center relative -top-3.5">
          <button
            onClick={() => {
              triggerHaptic(25);
              if (user) setActiveModal('deposit');
              else setActiveModal('login');
            }}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 via-green-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_0_22px_rgba(16,185,129,0.5)] border-2 border-white/90 transform active:scale-90 transition-all"
            aria-label="Deposit Funds"
          >
            <PlusCircle className="w-6 h-6 stroke-[2.8] text-white" />
          </button>
          <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider mt-0.5 drop-shadow">
            Deposit
          </span>
        </div>

        {/* 4. VIP Support */}
        <button
          onClick={() => {
            triggerHaptic(15);
            setActiveModal('support');
          }}
          className={`flex flex-col items-center justify-center py-1 relative transition-all ${
            activeModal === 'support'
              ? 'text-amber-400 font-black scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Headphones className="w-5 h-5 mb-0.5 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-tight">VIP Chat</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        {/* 5. Profile or Admin / Login */}
        {user ? (
          <button
            onClick={() => {
              triggerHaptic(15);
              setActiveModal('profile');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeModal === 'profile'
                ? 'text-amber-400 font-black scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isSuperAdmin ? (
              <Shield className="w-5 h-5 mb-0.5 text-amber-400 stroke-[2.2]" />
            ) : (
              <User className="w-5 h-5 mb-0.5 stroke-[2.2]" />
            )}
            <span className="text-[10px] font-bold truncate max-w-[55px] tracking-tight">
              {isSuperAdmin ? 'Admin' : 'Profile'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              triggerHaptic(15);
              setActiveModal('login');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeModal === 'login'
                ? 'text-amber-400 font-black scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mb-0.5 stroke-[2.2]" />
            <span className="text-[10px] font-bold tracking-tight">Log In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
