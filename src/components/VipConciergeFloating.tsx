import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Send, X, ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';

export const VipConciergeFloating: React.FC = () => {
  const { siteSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // If disabled by Admin in settings, do not render
  if (siteSettings.vipConciergeEnabled === false) {
    return null;
  }

  const rawPhone = siteSettings.vipWhatsappNumber || siteSettings.supportPhone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  const rawTg = siteSettings.vipTelegramUsername || siteSettings.supportTelegram || 'LimowinOfficialVIP';
  const cleanTg = rawTg.replace('@', '').trim();

  const prefillMsg = encodeURIComponent(
    siteSettings.vipConciergeMessage ||
      'Hello VIP Concierge, I need assistance with my Limowin account & deposit.'
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${prefillMsg}`;
  const telegramUrl = `https://t.me/${cleanTg}`;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 select-none font-sans">
      {/* Expanded Concierge Card */}
      {isOpen && (
        <div className="mb-3 w-[290px] sm:w-[320px] bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl p-4 text-white animate-fade-in relative overflow-hidden">
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-md">
                👑
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">VIP Concierge</h4>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Direct 24/7 Priority Manager</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-300 my-3 leading-relaxed">
            Need instant manual deposit, withdrawal acceleration, or exclusive VIP reload bonuses? Connect with your dedicated host:
          </p>

          {/* Action Channels */}
          <div className="space-y-2">
            {/* WhatsApp Direct */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all transform active:scale-98 group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <PhoneCall className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black leading-tight">Chat on WhatsApp</span>
                  <span className="block text-[10px] text-emerald-100 font-medium">
                    {rawPhone}
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-200">
                Fast
              </span>
            </a>

            {/* Telegram Direct */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950/40 transition-all transform active:scale-98 group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black leading-tight">Message on Telegram</span>
                  <span className="block text-[10px] text-sky-100 font-medium">
                    @{cleanTg}
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-sky-900/80 text-sky-200">
                24/7
              </span>
            </a>
          </div>

          {/* Footer Security Assurance */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Official Encrypted VIP Support Channel</span>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3.5 py-2.5 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-amber-500/50 hover:border-amber-400 text-white shadow-2xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 group ring-1 ring-amber-500/20"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>

        <div className="flex items-center space-x-1.5">
          <span className="text-sm">👑</span>
          <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
            VIP Desk
          </span>
        </div>

        <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
          <span className="text-[11px] text-emerald-400 font-black">WA</span>
          <span className="text-[10px] text-slate-500">•</span>
          <span className="text-[11px] text-sky-400 font-black">TG</span>
        </div>
      </button>
    </div>
  );
};
