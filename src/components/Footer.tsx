import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Award, HeartHandshake, Headphones, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { siteSettings, setActivePolicy, setActiveModal, currency } = useApp();

  const site = siteSettings.siteName;

  const openPolicy = (policyKey: string) => {
    setActivePolicy(policyKey);
    setActiveModal('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-300 pt-14 pb-16 sm:pb-12 border-t border-slate-800/80 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Vision */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveModal(null)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-md border border-amber-300">
                👑
              </div>
              <span className="font-black text-xl text-white tracking-tight">{site} 3D</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {site} is the world's premier 3D casino gaming platform featuring 200+ live dealer tables, high-RTP feature buy slots, and instant payouts via Indian UPI &amp; International USDT.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-xs font-black text-rose-500">
                18+
              </span>
              <span className="text-[11px] text-slate-400 font-bold">Strictly 18+ Only • Play Responsibly</span>
            </div>
          </div>

          {/* Quick Games & Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
              <span>Gaming Portfolios</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">Live Dealer Casino (AE Sexy &amp; Ezugi)</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">3D Feature Buy Slots &amp; Megaways</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">Dragon Tiger, Andar Bahar &amp; Baccarat</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">SABA Sports &amp; 9Wickets Cricket Exchange</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">Aviator Crash 3D &amp; Plinko Galaxy</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">WINGO 1-Min &amp; K3 Dice Lottery</li>
            </ul>
          </div>

          {/* Guides & Assistance */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Banking &amp; Player Guides</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => openPolicy('how-to-deposit')} className="text-slate-400 hover:text-amber-400 text-left">
                  How to Deposit Money
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('how-to-withdraw')} className="text-slate-400 hover:text-amber-400 text-left">
                  How to Withdraw Money (5 Lac Max)
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('banking-assistance')} className="text-slate-400 hover:text-amber-400 text-left">
                  Banking Assistance &amp; Verification
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('faqs')} className="text-slate-400 hover:text-amber-400 text-left">
                  Frequently Asked Questions (FAQs)
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('vision')} className="text-slate-400 hover:text-amber-400 text-left">
                  {site} Global Vision &amp; Fair Play
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Regulatory */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Policy &amp; Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => openPolicy('responsible-gaming')} className="text-slate-400 hover:text-amber-400 text-left">
                  Responsible Gaming Policy
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('compliance')} className="text-slate-400 hover:text-amber-400 text-left">
                  Compliance &amp; AML Security
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('privacy')} className="text-slate-400 hover:text-amber-400 text-left">
                  Privacy Note &amp; Data Protection
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('underage')} className="text-slate-400 hover:text-amber-400 text-left">
                  Underage Gaming Policy (18+)
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('terms')} className="text-slate-400 hover:text-amber-400 text-left">
                  Terms &amp; Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Actual Supported Currencies & Payment Rails Highlight Strip */}
        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">
                Actual Supported Currencies &amp; Payment Rails
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Multi-currency platform with instant regional auto-detection
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-black flex items-center space-x-1.5">
                <span>🇮🇳</span>
                <span>INR (₹ Indian Rupee)</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black flex items-center space-x-1.5">
                <span>🌐</span>
                <span>USD ($ / USDT Tether)</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <span className="text-amber-400 font-black">⚡</span>
              <span>UPI Pay (Instant)</span>
            </span>
            <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <span className="text-blue-400 font-black">📱</span>
              <span>Google Pay (GPay)</span>
            </span>
            <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <span className="text-purple-400 font-black">💜</span>
              <span>PhonePe FastPay</span>
            </span>
            <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <span className="text-emerald-400 font-black">🪙</span>
              <span>USDT (TRC-20 Fast)</span>
            </span>
            <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <span className="text-indigo-400 font-black">💎</span>
              <span>USDT (ERC-20)</span>
            </span>
            <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <span className="text-slate-400 font-black">🏦</span>
              <span>Bank Wire / IMPS</span>
            </span>
          </div>
        </div>

        {/* Trust & Certifications */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SHA-256 Certified RNG Gaming Engine. Regulated and audited independently.</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-bold">
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>256-Bit SSL Encrypted</span>
            </span>
            <span>BeGambleAware Verified</span>
            <span>GamCare Approved</span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-center text-xs text-slate-500 pt-2">
          &copy; {new Date().getFullYear()} {site} Gaming International Ltd. All rights reserved. Gaming can be addictive, please play responsibly.
        </div>
      </div>
    </footer>
  );
};
