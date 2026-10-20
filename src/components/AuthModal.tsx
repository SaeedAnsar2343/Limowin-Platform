import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    siteSettings,
    loginUser,
    loginWithGoogle,
    registerUser,
    resetPassword,
    showToast
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (activeModal !== 'login' && activeModal !== 'register' && activeModal !== 'forgot') {
    return null;
  }

  // Sync mode with activeModal if opened directly
  const currentMode = activeModal === 'forgot' ? 'forgot' : activeModal === 'register' ? 'register' : mode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (currentMode === 'login') {
      await loginUser(email || 'alex.vip@gmail.com', password);
    } else if (currentMode === 'register') {
      if (!email || !password) {
        showToast('Please provide email and password', 'error');
        setLoading(false);
        return;
      }
      await registerUser(email, password, name, referralCode);
    } else if (currentMode === 'forgot') {
      if (!email) {
        showToast('Please enter your email', 'error');
        setLoading(false);
        return;
      }
      await resetPassword(email);
      setResetSent(true);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md mb-3">
            👑
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentMode === 'login' && `Log In to ${siteSettings.siteName}`}
            {currentMode === 'register' && `Join ${siteSettings.siteName}`}
            {currentMode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentMode === 'login' && 'Enter your credentials to access your games & wallet'}
            {currentMode === 'register' && 'Sign up today and claim your $500 Welcome Bonus!'}
            {currentMode === 'forgot' && 'We will send a secure recovery link to your inbox'}
          </p>
        </div>

        {/* Tab switchers if not forgot */}
        {currentMode !== 'forgot' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              onClick={() => {
                setMode('login');
                setActiveModal('login');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                currentMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setActiveModal('register');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                currentMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register (Free Bonus)
            </button>
          </div>
        )}

        {/* Google 1-Click Button */}
        {currentMode !== 'forgot' && (
          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-3 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-3 shadow-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center space-x-3 text-slate-300">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">or with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </div>
        )}

        {/* Form Body */}
        {resetSent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Check Your Inbox</h3>
            <p className="text-xs text-slate-500">
              We have dispatched a password reset instruction link to <strong>{email}</strong>.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('login');
                setActiveModal('login');
              }}
              className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {currentMode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-amber-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Mobile Number with "Coming Soon" badge as requested */}
            {currentMode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600">Mobile Phone</label>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                    📱 Phone Signup: Coming Soon
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    disabled
                    placeholder="+1 (555) 000-0000 (Available Soon)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {currentMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600">Password</label>
                  {currentMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setActiveModal('forgot');
                      }}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            {currentMode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Referral Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. LIMO-VIP"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase bg-slate-50/50"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-yellow-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-98 mt-2"
            >
              <span>
                {loading
                  ? 'Verifying...'
                  : currentMode === 'login'
                  ? 'Access Account'
                  : currentMode === 'register'
                  ? 'Create VIP Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Logins for Pair Programming review */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Quick testing:</span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => loginUser('alex.vip@gmail.com')}
              className="font-bold text-amber-600 hover:underline"
            >
              Demo Player ($18k)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => loginUser('admin@limowin.com')}
              className="font-bold text-purple-600 hover:underline"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
