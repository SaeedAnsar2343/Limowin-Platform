import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { HeroBanner } from './components/HeroBanner';
import { GameGrid } from './components/GameGrid';
import { Footer } from './components/Footer';
import { PlayModal } from './components/PlayModal';
import { AuthModal } from './components/AuthModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { LiveSupportModal } from './components/LiveSupportModal';
import { AdminPortal } from './components/AdminPortal';
import { PolicyPages } from './components/PolicyPages';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CheckCircle2, AlertCircle, Info, Trophy, Headphones } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeModal, setActiveModal, notifications, theme, user } = useApp();

  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'saeed.samadelivery@gmail.com');

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 pb-20 md:pb-0 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Global Navigation */}
      <Navbar />

      {/* Categories Bar */}
      <CategoryNav />

      {/* Main Body */}
      <main className="flex-1">
        {activeModal === 'admin' ? (
          isSuperAdmin ? (
            <AdminPortal />
          ) : (
            <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-3xl border border-rose-200 shadow-2xl text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-inner">
                🛡️
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Super Admin Access Only</h2>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                This operations portal is restricted exclusively to authorized platform administration (<span className="font-bold text-slate-700">saeed.samadelivery@gmail.com</span>). Unauthorized access is prohibited.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveModal('login')}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Log In to Admin Account
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  Return to Games Lobby
                </button>
              </div>
            </div>
          )
        ) : activeModal === 'policy' ? (
          <PolicyPages />
        ) : (
          <>
            <HeroBanner />
            <GameGrid />
          </>
        )}
      </main>

      {/* Floating 24/7 Live Support Button (Desktop Only - mobile has sticky bottom nav) */}
      <button
        onClick={() => setActiveModal('support')}
        className="hidden md:flex fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 px-4 py-3 rounded-2xl shadow-xl items-center space-x-2 font-black text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 border border-yellow-300"
      >
        <Headphones className="w-4 h-4 fill-current" />
        <span>24/7 VIP Support</span>
      </button>

      {/* Mobile Bottom Navigation Bar (Sticky for Smartphone & Mobile Gaming) */}
      <MobileBottomNav />

      {/* Global Modals */}
      <PlayModal />
      <AuthModal />
      <CustomerProfileModal />
      <LiveSupportModal />

      {/* Toast Notifications System */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-3.5 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2.5 animate-in slide-in-from-left duration-200 ${
              n.type === 'win'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-yellow-300'
                : n.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : n.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {n.type === 'win' && <Trophy className="w-4 h-4 fill-current" />}
            {n.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {n.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {n.type === 'info' && <Info className="w-4 h-4" />}
            <span>{n.message}</span>
          </div>
        ))}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
