import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Smartphone,
  KeyRound,
  RotateCcw
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' }
];

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    siteSettings,
    loginUser,
    loginWithGoogle,
    loginWithPhone,
    registerUser,
    resetPassword,
    currency,
    formatCurrency,
    showToast
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Phone states (auto-detect country code based on active currency/region)
  const defaultDialCode = currency === 'INR' ? '+91' : '+1';
  const [dialCode, setDialCode] = useState(defaultDialCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync dial code if currency changes
  useEffect(() => {
    setDialCode(currency === 'INR' ? '+91' : '+1');
  }, [currency]);

  if (activeModal !== 'login' && activeModal !== 'register' && activeModal !== 'forgot') {
    return null;
  }

  // Sync mode with activeModal if opened directly
  const currentMode = activeModal === 'forgot' ? 'forgot' : activeModal === 'register' ? 'register' : mode;

  // Handle Phone SMS OTP Request
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 8) {
      showToast('Please enter a valid mobile number', 'error');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    showToast(`Verification code sent to ${dialCode} ${cleanNum}: [${code}]`, 'info');
  };

  // Handle Phone Verification Submit
  const handleVerifyPhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }
    if (generatedOtp && otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      showToast('Invalid verification code. Please check and retry.', 'error');
      return;
    }
    setLoading(true);
    const fullPhone = `${dialCode} ${phoneNumber.trim()}`;
    const success = await loginWithPhone(fullPhone, otpCode, name.trim() || undefined);
    setLoading(false);
    if (success) {
      setPhoneNumber('');
      setOtpCode('');
      setOtpSent(false);
      setAuthMethod('email');
    }
  };

  // Handle Standard Email Login / Register / Forgot
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (currentMode === 'login') {
      if (!email.trim()) {
        showToast('Please enter your email address', 'error');
        setLoading(false);
        return;
      }
      await loginUser(email.trim(), password);
    } else if (currentMode === 'register') {
      if (!email.trim() || !password) {
        showToast('Please provide both email and password', 'error');
        setLoading(false);
        return;
      }
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 7) {
        showToast('Contact mobile number is strictly required for VIP registration', 'error');
        setLoading(false);
        return;
      }
      const fullPhone = `${dialCode} ${phoneNumber.trim()}`;
      await registerUser(email.trim(), password, name.trim(), fullPhone, referralCode.trim());
    } else if (currentMode === 'forgot') {
      if (!email.trim()) {
        showToast('Please enter your email', 'error');
        setLoading(false);
        return;
      }
      await resetPassword(email.trim());
      setResetSent(true);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md mb-3 border border-amber-300">
            👑
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {authMethod === 'phone'
              ? 'Mobile Verification'
              : currentMode === 'login'
              ? `Log In to ${siteSettings.siteName}`
              : currentMode === 'register'
              ? `Join ${siteSettings.siteName}`
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {authMethod === 'phone'
              ? `Instant login with SMS OTP (${dialCode === '+91' ? 'India' : 'International'})`
              : currentMode === 'login'
              ? 'Access 200+ 3D games, live betting & VIP cashier'
              : currentMode === 'register'
              ? `Claim your ${currency === 'INR' ? '₹100 INR' : '$1 USD'} Instant Deposit Bonus upon registration!`
              : 'We will send a secure recovery link to your inbox'}
          </p>
        </div>

        {/* Tab switchers if not forgot & not in phone auth mode */}
        {currentMode !== 'forgot' && authMethod === 'email' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
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
              Register (Instant Bonus)
            </button>
          </div>
        )}

        {/* 1-Click Fast Auth Options: Google & Mobile Number */}
        {currentMode !== 'forgot' && authMethod === 'email' && (
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-3 shadow-xs transition-all"
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

            {/* Mobile Number Fast Signup / Login Button */}
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setOtpSent(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 hover:border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2.5 shadow-xs transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Continue with Mobile Number ({dialCode})</span>
            </button>

            <div className="flex items-center space-x-3 text-slate-300 pt-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                or with email address
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </div>
        )}

        {/* ----------------- PHONE AUTH FLOW ----------------- */}
        {authMethod === 'phone' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Select Country / Region
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {COUNTRY_CODES.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setDialCode(c.code)}
                        className={`py-1.5 px-2.5 rounded-xl border text-left text-xs font-bold flex items-center space-x-2 transition-all ${
                          dialCode === c.code
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate">{c.code} {c.country}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Full Name (Optional for VIP Profile)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 bg-slate-50/50">
                    <span className="px-3 py-2.5 bg-slate-100 text-slate-700 font-black text-xs border-r border-slate-300 flex items-center">
                      {dialCode}
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder={dialCode === '+91' ? '98765 43210' : '555 123 4567'}
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-transparent focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    We will send a 6-digit one-time SMS verification code to verify your VIP player account.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all transform active:scale-98"
                >
                  <span>Send SMS Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneLogin} className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <div className="text-xs">
                      <div className="font-bold text-emerald-950">Code Sent to {dialCode} {phoneNumber}</div>
                      <div className="text-emerald-700 text-[11px]">
                        Demo test code: <span className="font-mono font-black">{generatedOtp || '123456'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-emerald-100 rounded-lg text-xs"
                    title="Change phone number"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Enter 6-Digit SMS Code *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      placeholder="e.g. 789456"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-center text-base tracking-widest font-mono font-bold focus:outline-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all transform active:scale-98"
                >
                  <span>{loading ? 'Verifying OTP...' : 'Verify & Enter Platform'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setOtpSent(false);
              }}
              className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Email &amp; Password
            </button>
          </div>
        )}

        {/* ----------------- EMAIL AUTH FLOW ----------------- */}
        {authMethod === 'email' && (
          <>
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
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Full Name *
                    </label>
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
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email Address *
                  </label>
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

                {/* Contact Mobile Number: REQUIRED on registration (No coming soon!) */}
                {currentMode === 'register' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600">
                        Contact Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {dialCode === '+91' ? '🇮🇳 India Code' : '🇺🇸 USA Code'}
                      </span>
                    </div>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 bg-slate-50/50">
                      <select
                        value={dialCode}
                        onChange={e => setDialCode(e.target.value)}
                        className="px-2 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs border-r border-slate-300 focus:outline-none"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder={dialCode === '+91' ? '98765 43210' : '555 123 4567'}
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {currentMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600">
                        Password *
                      </label>
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
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Referral Code (Optional)
                    </label>
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
          </>
        )}
      </div>
    </div>
  );
};
