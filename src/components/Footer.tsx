import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Award, HeartHandshake, Headphones, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { siteSettings, setActivePolicy, setActiveModal } = useApp();

  const site = siteSettings.siteName;

  const openPolicy = (policyKey: string) => {
    setActivePolicy(policyKey);
    setActiveModal('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Vision */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                👑
              </div>
              <span className="font-black text-xl text-white tracking-tight">{site}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {site} is the premier destination for next-generation 3D casino gaming, live interactive dealer tables, and lightning-fast cryptocurrency and fiat payouts. Play responsibly.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-rose-500">
                18+
              </span>
              <span className="text-[11px] text-slate-400 font-bold">Strictly 18+ Only</span>
            </div>
          </div>

          {/* Quick Games & Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Gaming Portfolios</h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">Live Dealer Casino (AE Sexy &amp; Ezugi)</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">3D Feature Buy Slots &amp; Megaways</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">Andar Bahar, Dragon Tiger &amp; 7 Up 7 Down</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">SABA &amp; 9Wickets Sportsbook</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">WINGO 1-Min &amp; K3 Dice Lottery</li>
              <li className="text-slate-400 hover:text-amber-400 cursor-pointer">Aviator 3D &amp; Plinko Galaxy</li>
            </ul>
          </div>

          {/* Guides & Assistance */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Banking &amp; Guides</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => openPolicy('how-to-deposit')} className="text-slate-400 hover:text-amber-400 text-left">
                  How to Deposit Money
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('how-to-withdraw')} className="text-slate-400 hover:text-amber-400 text-left">
                  How to Withdraw Money
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('banking-assistance')} className="text-slate-400 hover:text-amber-400 text-left">
                  Banking Assistance &amp; Limits
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('faqs')} className="text-slate-400 hover:text-amber-400 text-left">
                  Frequently Asked Questions (FAQs)
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('vision')} className="text-slate-400 hover:text-amber-400 text-left">
                  {site} Global Vision &amp; Mission
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
                  Compliance &amp; AML Policy
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('privacy')} className="text-slate-400 hover:text-amber-400 text-left">
                  Privacy Note &amp; Security
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

        {/* Banking Badges Strip */}
        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-400">Supported Currencies &amp; Payment Rails:</div>
          <div className="flex flex-wrap items-center gap-2">
            {['USDT TRC20', 'USDT ERC20', 'UPI FastPay', 'Bank Transfer', 'Visa', 'Mastercard', 'Bitcoin', 'Ethereum'].map(pay => (
              <span
                key={pay}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700"
              >
                {pay}
              </span>
            ))}
          </div>
        </div>

        {/* Trust & Certifications */}
        <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>SHA-256 Certified RNG Gaming Engine. Regulated and audited independently.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>256-Bit SSL Encrypted</span>
            <span>BeGambleAware Verified</span>
            <span>GamCare Approved</span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-center text-xs text-slate-500 pt-4">
          &copy; {new Date().getFullYear()} {site} Gaming International Ltd. All rights reserved. Gaming can be addictive, please play responsibly.
        </div>
      </div>
    </footer>
  );
};
