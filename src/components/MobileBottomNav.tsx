import React from 'react';
import { useApp } from '../context/AppContext';
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 md:hidden shadow-2xl safe-bottom">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Home */}
        <button
          onClick={() => {
            setActiveModal(null);
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeModal === null
              ? 'text-amber-500 font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* 2. Casino / Games */}
        <button
          onClick={() => {
            setActiveModal(null);
            setSelectedCategory('hot');
            const el = document.getElementById('games-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Gamepad2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">Games</span>
        </button>

        {/* 3. Center Highlight: Deposit Button */}
        <div className="flex flex-col items-center justify-center relative -top-3">
          <button
            onClick={() => {
              if (user) setActiveModal('deposit');
              else setActiveModal('login');
            }}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 via-green-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 border-2 border-white transform active:scale-95 transition-all"
            aria-label="Deposit Funds"
          >
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider mt-1">
            Deposit
          </span>
        </div>

        {/* 4. VIP Support */}
        <button
          onClick={() => setActiveModal('support')}
          className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
            activeModal === 'support'
              ? 'text-amber-500 font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Headphones className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">Support</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        {/* 5. Profile or Admin / Login */}
        {user ? (
          <button
            onClick={() => {
              if (isSuperAdmin && activeModal !== 'admin') {
                setActiveModal('profile');
              } else {
                setActiveModal('profile');
              }
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeModal === 'profile'
                ? 'text-amber-500 font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isSuperAdmin ? (
              <Shield className="w-5 h-5 mb-0.5 text-amber-600" />
            ) : (
              <User className="w-5 h-5 mb-0.5" />
            )}
            <span className="text-[10px] font-bold truncate max-w-[55px]">
              {isSuperAdmin ? 'Admin' : 'Profile'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setActiveModal('login')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeModal === 'login'
                ? 'text-amber-500 font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">Log In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
