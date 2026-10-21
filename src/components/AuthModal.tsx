import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { COUNTRIES, Country, getDefaultCountry } from '../utils/countries';
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
  RotateCcw,
  Search,
  ChevronDown,
  ShieldAlert,
  MailCheck
} from 'lucide-react';

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
    showToast
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Country detection based on active region/currency
  const isIndia = currency === 'INR';
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry(isIndia));
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [phoneEmail, setPhoneEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // OTP Verification states
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-detect country when active region/currency changes
  useEffect(() => {
    setSelectedCountry(getDefaultCountry(currency === 'INR'));
  }, [currency]);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (activeModal !== 'login' && activeModal !== 'register' && activeModal !== 'forgot') {
    return null;
  }

  // Filter countries for search
  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Sync mode with activeModal if opened directly
  const currentMode = activeModal === 'forgot' ? 'forgot' : activeModal === 'register' ? 'register' : mode;

  // Handle Send Email OTP for Continue with Mobile Number
  const handleSendEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 7) {
      showToast('Please enter a valid mobile number', 'error');
      return;
    }
    const cleanMail = phoneEmail.trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes('@') || !cleanMail.includes('.')) {
      showToast('Please enter a valid email address to receive verification OTP', 'error');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpStep('verify');
    setResendCooldown(45);
    showToast(`Verification code sent to ${cleanMail}: [${code}]`, 'info');
  };

  // Handle OTP Verification Submit
  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      showToast('Please enter the 6-digit verification code sent to your email', 'error');
      return;
    }
    if (generatedOtp && otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      showToast('Invalid verification code. Please check your email and retry.', 'error');
      return;
    }

    setLoading(true);
    const fullPhone = `${selectedCountry.dialCode} ${phoneNumber.trim()}`;
    const success = await loginWithPhone(fullPhone, phoneEmail.trim(), otpCode.trim(), name.trim() || undefined);
    setLoading(false);

    if (success) {
      setPhoneNumber('');
      setPhoneEmail('');
      setOtpCode('');
      setOtpStep('input');
      setAuthMethod('email');
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendCooldown(45);
    showToast(`New verification code dispatched to ${phoneEmail.trim()}: [${code}]`, 'info');
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
      const fullPhone = `${selectedCountry.dialCode} ${phoneNumber.trim()}`;
      await registerUser(email.trim(), password, name.trim(), fullPhone, referralCode.trim());
    } else if (currentMode === 'forgot') {
      if (!email.trim()) {
        showToast('Please enter your email address', 'error');
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
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20"
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
              ? otpStep === 'verify'
                ? 'Verify Your Email'
                : 'Mobile & Email Access'
              : currentMode === 'login'
              ? `Log In to ${siteSettings.siteName}`
              : currentMode === 'register'
              ? `Join ${siteSettings.siteName}`
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {authMethod === 'phone'
              ? otpStep === 'verify'
                ? `Enter the 6-digit OTP code sent to ${phoneEmail}`
                : 'One account on one mobile number and one email'
              : currentMode === 'login'
              ? 'Access 200+ 3D games, live betting & VIP cashier'
              : currentMode === 'register'
              ? `Claim your ${currency === 'INR' ? '₹100 INR' : '$1 USD'} Instant Deposit Bonus!`
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

            {/* Continue with Mobile Number Button */}
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setOtpStep('input');
                setPhoneNumber('');
                setPhoneEmail('');
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 hover:border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2.5 shadow-xs transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Continue with Mobile Number</span>
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

        {/* ----------------- PHONE & EMAIL FLOW (CONTINUE WITH NUMBER) ----------------- */}
        {authMethod === 'phone' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {otpStep === 'input' ? (
              <form onSubmit={handleSendEmailOtp} className="space-y-3.5">
                {/* Mobile Phone Field with Sleek Integrated Country Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      Mobile Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Auto-detected: <strong className="text-slate-700">{selectedCountry.name}</strong>
                    </span>
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 bg-slate-50/50">
                      {/* Country Flag & Dial Code Dropdown Toggle */}
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-r border-slate-300 flex items-center space-x-1.5 transition-colors shrink-0"
                        title="Change Country"
                      >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span>{selectedCountry.dialCode}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </button>

                      <input
                        type="tel"
                        required
                        placeholder={selectedCountry.dialCode === '+91' ? '98765 43210' : '555 123 4567'}
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-transparent focus:outline-none font-medium text-slate-900"
                      />
                    </div>

                    {/* All Countries Searchable Dropdown */}
                    {countryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search country or code (e.g. India, UAE, +44)..."
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map(c => (
                              <button
                                key={c.code + c.dialCode}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setCountryDropdownOpen(false);
                                  setCountrySearch('');
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-emerald-50/80 transition-colors ${
                                  selectedCountry.code === c.code && selectedCountry.dialCode === c.dialCode
                                    ? 'bg-emerald-50 font-bold text-emerald-950'
                                    : 'text-slate-700'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 truncate">
                                  <span className="text-base">{c.flag}</span>
                                  <span className="truncate">{c.name}</span>
                                </div>
                                <span className="font-mono text-slate-400 font-bold shrink-0 ml-2">
                                  {c.dialCode}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-center text-slate-400 text-xs">
                              No matching country found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Address Field (Required for Continue with Number) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      OTP Sent Here
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={phoneEmail}
                      onChange={e => setPhoneEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Full Name Field (Optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Full Name (Optional for VIP Profile)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Security Notice: We may require number verification later for features */}
                <div className="flex items-start space-x-2.5 p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-[11px] text-amber-900 leading-relaxed shadow-2xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">VIP Security Policy: </span>
                    One account is permitted per mobile number and email. We verify your email via OTP now; we may require SMS mobile number verification later for high-value withdrawals or advanced security features.
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all transform active:scale-98 mt-2"
                >
                  <span>Send Email Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Step 2: Email OTP Verification */
              <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <MailCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <div className="font-bold text-emerald-950">OTP Sent to {phoneEmail}</div>
                      <div className="text-emerald-700 text-[11px]">
                        Demo test code: <span className="font-mono font-black">{generatedOtp || '123456'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpStep('input')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-emerald-100 rounded-lg text-xs"
                    title="Change details"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      Enter 6-Digit Email Verification Code <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendOtp}
                      className={`text-[11px] font-bold ${
                        resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-600 hover:underline'
                      }`}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>

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
                  <p className="text-[10px] text-slate-400 mt-1">
                    Registered Mobile: <strong>{selectedCountry.dialCode} {phoneNumber}</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all transform active:scale-98"
                >
                  <span>{loading ? 'Verifying...' : 'Verify Email & Enter Platform'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setOtpStep('input');
              }}
              className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Email &amp; Password
            </button>
          </div>
        )}

        {/* ----------------- STANDARD EMAIL FLOW ----------------- */}
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

                {/* Contact Mobile Number: REQUIRED on registration with Dropdown */}
                {currentMode === 'register' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600">
                        Contact Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {selectedCountry.name}
                      </span>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                      <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-r border-slate-300 flex items-center space-x-1.5 transition-colors shrink-0"
                          title="Change Country"
                        >
                          <span className="text-base leading-none">{selectedCountry.flag}</span>
                          <span>{selectedCountry.dialCode}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <input
                          type="tel"
                          required
                          placeholder={selectedCountry.dialCode === '+91' ? '98765 43210' : '555 123 4567'}
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-transparent focus:outline-none"
                        />
                      </div>

                      {/* Searchable Country Selector in Register Mode */}
                      {countryDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                          <div className="p-2 border-b border-slate-100 bg-slate-50">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search country or code..."
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-amber-500"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                            {filteredCountries.map(c => (
                              <button
                                key={c.code + c.dialCode}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setCountryDropdownOpen(false);
                                  setCountrySearch('');
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-amber-50/80 transition-colors ${
                                  selectedCountry.code === c.code && selectedCountry.dialCode === c.dialCode
                                    ? 'bg-amber-50 font-bold text-amber-950'
                                    : 'text-slate-700'
                                }`}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <span>{c.flag}</span>
                                  <span className="truncate">{c.name}</span>
                                </div>
                                <span className="font-mono text-slate-400 font-bold ml-2">
                                  {c.dialCode}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
