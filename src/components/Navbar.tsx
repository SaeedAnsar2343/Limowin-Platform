import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  PlusCircle,
  Headphones,
  Shield,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Gift
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveModal(null)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-md border border-amber-300">
            👑
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl text-slate-900 tracking-tight leading-none flex items-center space-x-1">
              <span>{siteSettings.siteName}</span>
              <span className="text-amber-500 text-xs font-black px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">
                3D
              </span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 hidden sm:inline">
              Play &amp; Win Real Cash
            </span>
          </div>
        </div>

        {/* Global Search Bar for 200+ Games */}
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

        {/* Right Navigation & User Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Currency Switcher (Auto Region Detected INR vs USD) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2 py-1 rounded-lg transition-all ${
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
              className={`px-2 py-1 rounded-lg transition-all ${
                currency === 'USD'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="US Dollar / USDT (Auto-detected Outside India)"
            >
              $ USD
            </button>
          </div>

          {/* Admin Switch Pill */}
          <button
            onClick={() => setActiveModal('admin')}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
            title="Open Admin Portal"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin</span>
          </button>

          {/* Customer Support Trigger */}
          <button
            onClick={() => setActiveModal('support')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200"
            title="Live Customer Support"
          >
            <Headphones className="w-4 h-4 text-amber-600" />
          </button>

          {/* User Auth / Profile Section */}
          {user ? (
            <div className="flex items-center space-x-2.5">
              {/* Wallet Balance Pill */}
              <div
                onClick={() => setActiveModal('profile')}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-2xl cursor-pointer border border-slate-200 transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                  {currency === 'INR' ? '₹' : '$'}
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-bold text-slate-500 leading-none">BALANCE</span>
                  <span className="text-xs font-black text-slate-900 leading-tight">
                    {formatCurrency(user.balance)}
                  </span>
                </div>
              </div>

              {/* Deposit Action Button */}
              <button
                onClick={() => setActiveModal('deposit')}
                className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wide bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all transform active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Deposit</span>
              </button>

              {/* User Dropdown Avatar */}
              <div
                onClick={() => setActiveModal('profile')}
                className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-all border border-amber-300"
                title="My Profile & History"
              >
                {user.name.charAt(0)}
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveModal('login')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Log In
              </button>
              <button
                onClick={() => setActiveModal('register')}
                className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wide bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
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
