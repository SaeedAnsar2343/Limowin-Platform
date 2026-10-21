import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  PlusCircle,
  Headphones,
  Shield,
  Search,
  User,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    siteSettings,
    user,
    logout,
    setActiveModal,
    searchQuery,
    setSearchQuery,
    currency,
    setCurrency,
    formatCurrency
  } = useApp();

  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'saeed.samadelivery@gmail.com');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors shadow-xs w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0"
          onClick={() => setActiveModal(null)}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg sm:text-xl shadow-md border border-amber-300 shrink-0">
            👑
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base sm:text-xl text-slate-900 tracking-tight leading-none flex items-center space-x-1">
              <span>{siteSettings.siteName}</span>
              <span className="text-amber-500 text-[10px] sm:text-xs font-black px-1 sm:px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">
                3D
              </span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 hidden sm:inline">
              Play &amp; Win Real Cash
            </span>
          </div>
        </div>

        {/* Global Search Bar for 200+ Games (Desktop Only) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search 200+ 3D games, providers, slots..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-150 border border-transparent focus:border-amber-400 focus:bg-white text-xs font-medium text-slate-800 transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Right Navigation & User Controls - 100% Mobile Fitting */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Currency Switcher (Auto Region Detected INR vs USD) */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs transition-all ${
                currency === 'INR'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Indian Rupee (Auto-detected in India)"
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs transition-all ${
                currency === 'USD'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="US Dollar / USDT (Auto-detected Outside India)"
            >
              $ USD
            </button>
          </div>

          {/* Admin Switch Pill - ONLY visible to Super Admin (saeed.samadelivery@gmail.com) */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveModal('admin')}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black transition-all border border-amber-300 shadow-xs shrink-0"
              title="Open Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">Admin Portal</span>
            </button>
          )}

          {/* Customer Support Trigger (Desktop Only - mobile uses bottom bar) */}
          <button
            onClick={() => setActiveModal('support')}
            className="hidden sm:flex p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 shrink-0"
            title="Live Customer Support"
          >
            <Headphones className="w-4 h-4 text-amber-600" />
          </button>

          {/* User Auth / Profile Section */}
          {user ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Wallet Balance Pill */}
              <div
                onClick={() => setActiveModal('profile')}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl cursor-pointer border border-slate-200 transition-all shrink-0"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px] sm:text-xs shrink-0">
                  {currency === 'INR' ? '₹' : '$'}
                </div>
                <div className="flex flex-col text-right">
                  <span className="hidden sm:block text-[9px] font-bold text-slate-500 leading-none">BALANCE</span>
                  <span className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">
                    {formatCurrency(user.balance)}
                  </span>
                </div>
              </div>

              {/* Deposit Action Button (Desktop Only - mobile uses center bottom bar) */}
              <button
                onClick={() => setActiveModal('deposit')}
                className="hidden sm:flex px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wide bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md shadow-emerald-600/20 items-center space-x-1.5 transition-all transform active:scale-95 shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Deposit</span>
              </button>

              {/* User Dropdown Avatar */}
              <div
                onClick={() => setActiveModal('profile')}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 transition-all border border-amber-300 text-xs sm:text-sm shrink-0"
                title="My Profile & History"
              >
                {user.name.charAt(0)}
              </div>

              {/* Logout (Desktop Only - mobile has logout inside profile) */}
              <button
                onClick={logout}
                className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <button
                onClick={() => setActiveModal('login')}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all shrink-0"
              >
                Log In
              </button>
              <button
                onClick={() => setActiveModal('register')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-xs uppercase tracking-wide bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20 transition-all transform active:scale-95 shrink-0"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
