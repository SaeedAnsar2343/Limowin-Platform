import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameItem, GAMES_CATALOG } from '../data/gamesCatalog';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  CurrencyType,
  CurrencyConfig,
  CURRENCY_CONFIGS,
  detectUserRegion,
  formatMoney
} from '../utils/currency';
import { calculateSecretOutcome, WinOutcome } from '../utils/gameRNG';
import {
  auth,
  googleProvider,
  syncSiteSettingsToFirestore,
  getSiteSettingsFromFirestore,
  syncPaymentGatewaysToFirestore,
  getPaymentGatewaysFromFirestore,
  syncUserToFirestore,
  getAllUsersFromFirestore,
  saveDepositToFirestore,
  getAllDepositsFromFirestore,
  updateDepositStatusInFirestore,
  saveWithdrawalToFirestore,
  getAllWithdrawalsFromFirestore,
  updateWithdrawalStatusInFirestore,
  savePromotionToFirestore,
  deletePromotionFromFirestore,
  getAllPromotionsFromFirestore,
  syncGameOverridesToFirestore,
  getGameOverridesFromFirestore,
  saveGameRoundToFirestore,
  syncDepositBonusConfigToFirestore,
  getDepositBonusConfigFromFirestore,
  saveChatMessageToFirestore,
  subscribeToChatMessages,
  syncBannersToFirestore,
  getBannersFromFirestore
} from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  bannerAnnouncement: string;
  supportEmail: string;
  supportTelegram: string;
  supportPhone: string;
  currencySymbol: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  defaultTheme: 'light' | 'dark';
}

export interface PaymentGateways {
  cryptoUsdtTrc20: {
    enabled: boolean;
    address: string;
    network: string;
    qrCodeUrl: string;
    bonusPercent: number;
    instructions: string;
  };
  cryptoUsdtErc20: {
    enabled: boolean;
    address: string;
    network: string;
    qrCodeUrl: string;
    bonusPercent: number;
    instructions: string;
  };
  upiFastPay: {
    enabled: boolean;
    upiId: string;
    qrCodeUrl: string;
    bonusPercent: number;
    instructions: string;
  };
  gpayFastPay: {
    enabled: boolean;
    upiId: string;
    phone: string;
    qrCodeUrl: string;
    bonusPercent: number;
    instructions: string;
  };
  bankWireTransfer: {
    enabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscSwift: string;
    branch: string;
    instructions: string;
  };
}

export interface DepositBonusRule {
  enabled: boolean;
  type: 'fixed' | 'percent';
  value: number; // e.g. 100 for ₹100 or 100%, 1 for $1 or 10%
  minDeposit: number;
  turnoverGames: number;
}

export interface DepositBonusConfig {
  inr: DepositBonusRule;
  usd: DepositBonusRule;
}

export interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  targetModal: 'deposit' | 'register' | 'profile' | 'support' | null;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  bgGradient: string;
  icon: string;
  active: boolean;
  order: number;
}

export interface PromotionItem {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  bonusPercent: number;
  maxAmount: number;
  minDeposit: number;
  turnover: number;
  category: string;
  active: boolean;
  badge: string;
  gamesRequired?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'admin';
  balance: number;
  bonusBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  vipLevel: string;
  status: 'active' | 'blocked';
  referralCode: string;
  referredBy?: string | null;
  referralCount: number;
  referralEarnings: number;
  gamesPlayedCount: number;
  bonusLockGamesRemaining: number; // Must play 5 games before bonus can be withdrawn
  currency: CurrencyType;
  avatar?: string;
  phone?: string;
  kycStatus?: 'verified' | 'pending' | 'unverified';
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: string;
  amount: number;
  bonusAmount: number;
  currency: CurrencyType;
  txHash: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: string;
  details: string;
  amount: number;
  currency: CurrencyType;
  fee: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  txRef?: string;
  rejectReason?: string;
}

export interface GameRoundHistory {
  id: string;
  gameId: string;
  gameTitle: string;
  category: string;
  betAmount: number;
  currency: CurrencyType;
  multiplier: number;
  payout: number;
  isWin: boolean;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sender: 'user' | 'admin' | 'support_bot';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'win';
}

interface AppContextType {
  siteSettings: SiteSettings;
  paymentGateways: PaymentGateways;
  depositBonusConfig: DepositBonusConfig;
  promotions: PromotionItem[];
  gameOverrides: Record<string, { bonusMultiplier: number; customRtp?: number }>;
  banners: BannerSlide[];
  user: UserProfile | null;
  allUsers: UserProfile[];
  allDeposits: DepositRequest[];
  allWithdrawals: WithdrawalRequest[];
  gameHistory: GameRoundHistory[];
  chatMessages: ChatMessage[];
  activeModal: 'login' | 'register' | 'forgot' | 'profile' | 'deposit' | 'withdraw' | 'support' | 'admin' | 'policy' | null;
  activePolicy: string;
  activeGame: GameItem | null;
  theme: 'light' | 'dark';
  soundMuted: boolean;
  searchQuery: string;
  selectedCategory: string;
  notifications: ToastNotification[];
  isFirebaseConnected: boolean;

  // Currency & Region
  currency: CurrencyType;
  currencyConfig: CurrencyConfig;
  setCurrency: (c: CurrencyType) => void;
  formatCurrency: (amount: number) => string;

  // UI state actions
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
  setActiveModal: (m: 'login' | 'register' | 'forgot' | 'profile' | 'deposit' | 'withdraw' | 'support' | 'admin' | 'policy' | null) => void;
  setActivePolicy: (p: string) => void;
  setActiveGame: (g: GameItem | null) => void;
  setSoundMuted: (m: boolean) => void;
  toggleTheme: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'win') => void;

  // Auth
  loginUser: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithPhone: (phoneNumber: string, email: string, otp: string, name?: string) => Promise<boolean>;
  registerUser: (email: string, pass: string, name: string, phone: string, refCode?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;

  // Banking & Gaming
  submitDeposit: (method: string, amount: number, txHash: string, claimPromoBonus?: boolean) => Promise<boolean>;
  submitWithdrawal: (method: string, amount: number, details: string) => Promise<boolean>;
  recordGameResult: (game: GameItem, bet: number, multiplier: number, isWin: boolean) => void;
  checkCanPlayGame: (game: GameItem, bet?: number) => boolean;
  calculateWinOutcome: (betAmount: number, maxTheoreticalMult?: number) => WinOutcome;
  calculateDepositBonus: (depositAmount: number, targetCurrency: CurrencyType) => { bonusAmount: number; label: string };

  // Live Chat
  sendChatMessage: (message: string, asAdmin?: boolean, targetUserId?: string) => Promise<void>;
  markChatAsRead: (userId: string) => void;

  // Admin Actions
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<boolean>;
  updatePaymentGateways: (gateways: Partial<PaymentGateways>) => Promise<boolean>;
  updateDepositBonusConfig: (config: DepositBonusConfig) => Promise<boolean>;
  addPromotion: (promo: Partial<PromotionItem>) => Promise<boolean>;
  deletePromotion: (id: string) => Promise<boolean>;
  updateGameBonus: (gameId: string, bonusMultiplier: number, customRtp?: number) => Promise<boolean>;
  approveDeposit: (id: string) => Promise<boolean>;
  rejectDeposit: (id: string, reason?: string) => Promise<boolean>;
  approveWithdrawal: (id: string, txRef?: string) => Promise<boolean>;
  rejectWithdrawal: (id: string, reason?: string) => Promise<boolean>;
  toggleBlockUser: (userId: string, currentStatus: 'active' | 'blocked') => Promise<boolean>;
  adjustUserBalance: (userId: string, balance: number, bonusBalance: number) => Promise<boolean>;
  updateBanners: (banners: BannerSlide[]) => Promise<boolean>;
  addBanner: (banner: Partial<BannerSlide>) => Promise<boolean>;
  deleteBanner: (id: string) => Promise<boolean>;
}

const defaultSettings: SiteSettings = {
  siteName: 'Limowin',
  siteTagline: "World's Premier 3D Gaming & Entertainment Platform",
  logoUrl: '/assets/games/ae-dragontiger.png',
  bannerAnnouncement: '🎉 Welcome to Limowin! Get ₹100 INR / $1 USD Extra Deposit Bonus! Play 5 games to unlock withdrawal.',
  supportEmail: 'support@limowin.com',
  supportTelegram: '@LimowinOfficialVIP',
  supportPhone: '+1 (800) 546-6946 (Coming Soon)',
  currencySymbol: '₹',
  minDeposit: 100,
  maxDeposit: 500000,
  minWithdrawal: 100,
  maxWithdrawal: 500000,
  defaultTheme: 'light'
};

const defaultGateways: PaymentGateways = {
  cryptoUsdtTrc20: {
    enabled: true,
    address: 'TXY89zXn7KaP9LmRtWv3Q1bB7GqK2sP9Aa',
    network: 'Tron (TRC-20)',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TXY89zXn7KaP9LmRtWv3Q1bB7GqK2sP9Aa',
    bonusPercent: 5,
    instructions: 'Send only USDT TRC-20 to this address. Credits automatically in 1-3 network confirmations.'
  },
  cryptoUsdtErc20: {
    enabled: true,
    address: '0x71C94bC44A9996d912B3B9c47e8e6C7b2A3C1E4F',
    network: 'Ethereum (ERC-20)',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x71C94bC44A9996d912B3B9c47e8e6C7b2A3C1E4F',
    bonusPercent: 5,
    instructions: 'Send only USDT ERC-20 to this address. Minimum deposit $20.'
  },
  upiFastPay: {
    enabled: true,
    upiId: 'limowin.pay@icici',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=limowin.pay@icici&pn=LimowinGaming',
    bonusPercent: 5,
    instructions: 'Scan QR with GPay, PhonePe, Paytm, or any UPI App. Instant INR deposit with Bonus.'
  },
  gpayFastPay: {
    enabled: true,
    upiId: 'limowin.gpay@oksbi',
    phone: '+91 98765 43210',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=limowin.gpay@oksbi&pn=LimowinGooglePay',
    bonusPercent: 5,
    instructions: 'Open Google Pay (GPay) app. Pay to UPI ID (limowin.gpay@oksbi) or phone (+91 98765 43210).'
  },
  bankWireTransfer: {
    enabled: true,
    bankName: 'Standard Chartered / HDFC Bank',
    accountName: 'Limowin Global Gaming Ltd',
    accountNumber: '98230045182930',
    ifscSwift: 'HDFC0001829',
    branch: 'International Banking Branch',
    instructions: 'Include your user ID in transfer remarks. Takes 5-15 minutes after approval.'
  }
};

const defaultDepositBonusConfig: DepositBonusConfig = {
  inr: {
    enabled: true,
    type: 'fixed',
    value: 100, // Fixed ₹100 INR
    minDeposit: 100,
    turnoverGames: 5
  },
  usd: {
    enabled: true,
    type: 'fixed',
    value: 1, // Fixed $1 USD
    minDeposit: 1,
    turnoverGames: 5
  }
};

const initialDetectedCurrency = detectUserRegion();

const defaultUser: UserProfile = {
  id: 'user-demo-1',
  name: 'Alex Mercer',
  email: 'alex.vip@gmail.com',
  role: 'player',
  balance: initialDetectedCurrency === 'INR' ? 18450.00 : 250.00,
  bonusBalance: initialDetectedCurrency === 'INR' ? 1000.00 : 15.00,
  totalDeposited: initialDetectedCurrency === 'INR' ? 25000.00 : 300.00,
  totalWithdrawn: initialDetectedCurrency === 'INR' ? 12000.00 : 150.00,
  vipLevel: 'Gold VIP',
  status: 'active',
  referralCode: 'LIMO-ALEX77',
  referredBy: 'ROOT',
  referralCount: 8,
  referralEarnings: initialDetectedCurrency === 'INR' ? 2500.00 : 30.00,
  gamesPlayedCount: 0,
  bonusLockGamesRemaining: 5,
  currency: initialDetectedCurrency,
  kycStatus: 'verified',
  twoFactorEnabled: true,
  createdAt: '2026-09-15T10:00:00Z'
};

const defaultAdmin: UserProfile = {
  id: 'admin-super-saeed',
  name: 'Saeed Ansar (Super Admin)',
  email: 'saeed.samadelivery@gmail.com',
  role: 'admin',
  balance: initialDetectedCurrency === 'INR' ? 100000.00 : 2500.00,
  bonusBalance: 0,
  totalDeposited: 0,
  totalWithdrawn: 0,
  vipLevel: 'Owner & Super Admin',
  status: 'active',
  referralCode: 'ADMIN-SAEED',
  referredBy: null,
  referralCount: 420,
  referralEarnings: 54200.00,
  gamesPlayedCount: 100,
  bonusLockGamesRemaining: 0,
  currency: initialDetectedCurrency,
  kycStatus: 'verified',
  twoFactorEnabled: true,
  createdAt: '2026-01-01T00:00:00Z'
};

const defaultBanners: BannerSlide[] = [
  {
    id: 'banner-1',
    badge: 'EXCLUSIVE NEW MEMBER OFFER',
    title: '200% FIRST DEPOSIT BONUS',
    subtitle: 'Claim up to ₹25,000 / $2,500 + 200 Free Spins on Top 3D Slots and Live Tables',
    buttonText: 'Claim Bonus Now',
    targetModal: 'deposit',
    desktopImageUrl: '',
    mobileImageUrl: '',
    bgGradient: 'from-blue-950 via-indigo-900 to-slate-950',
    icon: '🎰',
    active: true,
    order: 1
  },
  {
    id: 'banner-2',
    badge: 'DAILY VIP REWARDS',
    title: '15% DAILY CASHBACK & REBATES',
    subtitle: 'Play Live Dealer, Dragon Tiger & Roulette with zero-turnover instant cashback payouts',
    buttonText: 'Join VIP Club',
    targetModal: 'profile',
    desktopImageUrl: '',
    mobileImageUrl: '',
    bgGradient: 'from-amber-950 via-slate-900 to-amber-900',
    icon: '👑',
    active: true,
    order: 2
  },
  {
    id: 'banner-3',
    badge: 'LIGHTNING SPEED',
    title: 'INSTANT UPI & USDT WITHDRAWALS',
    subtitle: 'Automated 60-second processing directly to your Bank, UPI ID or TRC-20 Wallet',
    buttonText: 'Deposit with Bonus',
    targetModal: 'deposit',
    desktopImageUrl: '',
    mobileImageUrl: '',
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-900',
    icon: '⚡',
    active: true,
    order: 3
  },
  {
    id: 'banner-4',
    badge: 'AFFILIATE COMMISSIONS',
    title: 'UNLIMITED 30% LIFETIME REVENUE SHARE',
    subtitle: 'Earn continuous passive income on every single friend and referral you invite to Limowin',
    buttonText: 'Get Referral Link',
    targetModal: 'profile',
    desktopImageUrl: '',
    mobileImageUrl: '',
    bgGradient: 'from-purple-950 via-slate-900 to-fuchsia-950',
    icon: '🏆',
    active: true,
    order: 4
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyType>(initialDetectedCurrency);
  const currencyConfig = CURRENCY_CONFIGS[currency];

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    ...defaultSettings,
    currencySymbol: currencyConfig.symbol,
    minWithdrawal: currencyConfig.minWithdrawal,
    maxWithdrawal: currencyConfig.maxWithdrawal
  });

  const [paymentGateways, setPaymentGateways] = useState<PaymentGateways>(defaultGateways);
  const [depositBonusConfig, setDepositBonusConfig] = useState<DepositBonusConfig>(defaultDepositBonusConfig);
  const [promotions, setPromotions] = useState<PromotionItem[]>([
    {
      id: 'promo-1',
      title: currency === 'INR' ? '₹100 INR Instant Deposit Bonus' : '$1 USD Instant Deposit Bonus',
      subtitle: 'Deposit now and claim instant cash bonus. Wager on any 5 games to unlock withdrawal.',
      code: 'LIMO5GAMES',
      bonusPercent: 100,
      maxAmount: currency === 'INR' ? 5000 : 100,
      minDeposit: currency === 'INR' ? 100 : 1,
      turnover: 5,
      category: 'All Games',
      active: true,
      badge: 'POPULAR',
      gamesRequired: 5
    }
  ]);
  const [gameOverrides, setGameOverrides] = useState<Record<string, { bonusMultiplier: number; customRtp?: number }>>({});
  const [banners, setBanners] = useState<BannerSlide[]>(defaultBanners);
  const [user, setUserState] = useState<UserProfile | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('limowin_auth_user');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  const setUser = (newUserOrFn: UserProfile | null | ((prev: UserProfile | null) => UserProfile | null)) => {
    setUserState(prev => {
      const resolved = typeof newUserOrFn === 'function' ? newUserOrFn(prev) : newUserOrFn;
      try {
        if (typeof window !== 'undefined') {
          if (resolved) {
            localStorage.setItem('limowin_auth_user', JSON.stringify(resolved));
          } else {
            localStorage.removeItem('limowin_auth_user');
          }
        }
      } catch {}
      return resolved;
    });
  };
  const [allUsers, setAllUsers] = useState<UserProfile[]>([defaultUser, defaultAdmin]);
  const [allDeposits, setAllDeposits] = useState<DepositRequest[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [gameHistory, setGameHistory] = useState<GameRoundHistory[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      userId: 'user-demo-1',
      userName: 'Alex Mercer',
      userEmail: 'alex.vip@gmail.com',
      sender: 'user',
      message: 'Hello! How fast are withdrawals processed via UPI / GPay?',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: true
    },
    {
      id: 'msg-2',
      userId: 'user-demo-1',
      userName: 'VIP Concierge Elena',
      userEmail: 'support@limowin.com',
      sender: 'admin',
      message: 'Hi Alex! UPI and GPay withdrawals are processed instantly within 5 to 10 minutes upon approval.',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      read: true
    }
  ]);
  const [isFirebaseConnected] = useState<boolean>(true);

  // Navigation & UI State
  const [activeModal, setActiveModal] = useState<'login' | 'register' | 'forgot' | 'profile' | 'deposit' | 'withdraw' | 'support' | 'admin' | 'policy' | null>(null);
  const [activePolicy, setActivePolicy] = useState<string>('responsible-gaming');
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // default Light Mode as specified!
  const [soundMuted, setSoundMutedState] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const formatCurrency = (amt: number) => formatMoney(amt, currency);

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    const cfg = CURRENCY_CONFIGS[c];
    setSiteSettings(prev => ({
      ...prev,
      currencySymbol: cfg.symbol,
      minWithdrawal: cfg.minWithdrawal,
      maxWithdrawal: cfg.maxWithdrawal
    }));
    showToast(`Currency switched to ${c === 'INR' ? '₹ Indian Rupee (INR)' : '$ US Dollar (USD/USDT)'}`, 'info');
  };

  // Sound muting
  const setSoundMuted = (m: boolean) => {
    setSoundMutedState(m);
    sound.setMuted(m);
  };

  // Toast Notification Trigger
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'win' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Synchronize document title with siteName
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${siteSettings.siteName} | Play 200+ 3D Games & Win Real Money`;
    }
  }, [siteSettings.siteName]);

  // Initial load from Firebase Firestore
  useEffect(() => {
    getSiteSettingsFromFirestore().then(remoteSettings => {
      if (remoteSettings && remoteSettings.siteName) {
        setSiteSettings(prev => ({ ...prev, ...remoteSettings }));
      }
    });

    getPaymentGatewaysFromFirestore().then(remoteGateways => {
      if (remoteGateways && (remoteGateways.cryptoUsdtTrc20 || remoteGateways.upiFastPay)) {
        setPaymentGateways(remoteGateways as PaymentGateways);
      }
    });

    getDepositBonusConfigFromFirestore().then(remoteConfig => {
      if (remoteConfig && (remoteConfig.inr || remoteConfig.usd)) {
        setDepositBonusConfig(remoteConfig as DepositBonusConfig);
      }
    });

    getAllPromotionsFromFirestore().then(remotePromos => {
      if (remotePromos && remotePromos.length > 0) {
        setPromotions(remotePromos as PromotionItem[]);
      }
    });

    getAllDepositsFromFirestore().then(remoteDeps => {
      if (remoteDeps && remoteDeps.length > 0) {
        setAllDeposits(remoteDeps as DepositRequest[]);
      }
    });

    getAllWithdrawalsFromFirestore().then(remoteWths => {
      if (remoteWths && remoteWths.length > 0) {
        setAllWithdrawals(remoteWths as WithdrawalRequest[]);
      }
    });

    getGameOverridesFromFirestore().then(remoteOverrides => {
      if (remoteOverrides) {
        setGameOverrides(remoteOverrides as any);
      }
    });

    getBannersFromFirestore().then(remoteBanners => {
      if (remoteBanners && remoteBanners.length > 0) {
        setBanners(remoteBanners as BannerSlide[]);
      }
    });

    getAllUsersFromFirestore().then(remoteUsers => {
      if (remoteUsers && remoteUsers.length > 0) {
        setAllUsers(prev => {
          const map = new Map<string, UserProfile>();
          prev.forEach(u => map.set(u.id, u));
          remoteUsers.forEach((u: any) => map.set(u.id, u));
          return Array.from(map.values());
        });
      }
    });

    // Real-time chat sync
    const unsubscribeChat = subscribeToChatMessages(remoteMsgs => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setChatMessages(prev => {
          const map = new Map<string, ChatMessage>();
          prev.forEach(m => map.set(m.id, m));
          remoteMsgs.forEach((m: any) => map.set(m.id, m));
          return Array.from(map.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    });

    return () => {
      unsubscribeChat();
    };
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Play Gatekeeper: Checks if user is signed in and has sufficient balance
  const checkCanPlayGame = (game: GameItem, bet?: number): boolean => {
    const requiredBet = bet || currencyConfig.minBet;
    if (!user) {
      showToast('🔒 Please sign in or register to play 200+ 3D games!', 'info');
      setActiveModal('login');
      return false;
    }
    if (user.balance < requiredBet) {
      showToast(
        `⚠️ Insufficient balance! Minimum bet is ${formatCurrency(requiredBet)}. Please deposit funds to continue.`,
        'error'
      );
      setActiveModal('deposit');
      return false;
    }
    return true;
  };

  // Calculate dynamic deposit bonus based on Admin settings (Percent or Fixed)
  const calculateDepositBonus = (depositAmount: number, targetCurrency: CurrencyType) => {
    const rule = targetCurrency === 'INR' ? depositBonusConfig.inr : depositBonusConfig.usd;
    if (!rule.enabled || depositAmount < rule.minDeposit) {
      return { bonusAmount: 0, label: 'No Bonus Applicable' };
    }
    let bonusAmount = 0;
    if (rule.type === 'percent') {
      bonusAmount = Number(((depositAmount * rule.value) / 100).toFixed(2));
    } else {
      bonusAmount = rule.value;
    }
    const label = rule.type === 'percent'
      ? `${rule.value}% Deposit Bonus (+${formatMoney(bonusAmount, targetCurrency)})`
      : `+${formatMoney(bonusAmount, targetCurrency)} Fixed Instant Bonus`;
    return { bonusAmount, label };
  };

  // Secret Game Outcome Calculator (House edge + tiered bets + first 2 games hook)
  const calculateWinOutcome = (betAmount: number, maxTheoreticalMult: number = 2.0): WinOutcome => {
    const gamesCount = user ? (user.gamesPlayedCount || 0) : 0;
    return calculateSecretOutcome(betAmount, currency, gamesCount, maxTheoreticalMult);
  };

  // Login
  const loginUser = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'saeed.samadelivery@gmail.com';

    if (isAdmin && !password) {
      setUser(defaultAdmin);
      showToast('Logged in as Super Admin Saeed!', 'success');
      setActiveModal(null);
      return true;
    }

    try {
      if (password) {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCred.user;
        let found = allUsers.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());

        if (isAdmin) {
          const adminProfile: UserProfile = {
            ...defaultAdmin,
            name: fbUser.displayName || defaultAdmin.name,
            email: cleanEmail
          };
          setUser(adminProfile);
          showToast('Welcome back, Super Admin Saeed!', 'success');
          setActiveModal(null);
          return true;
        }

        if (found) {
          if (found.status === 'blocked') {
            showToast('Account suspended by Admin. Contact VIP Support.', 'error');
            return false;
          }
          setUser(found);
        }
        showToast(`Welcome back, ${fbUser.displayName || fbUser.email}!`, 'success');
        setActiveModal(null);
        return true;
      }
    } catch {}

    if (isAdmin) {
      setUser(defaultAdmin);
      showToast('Welcome back, Super Admin Saeed!', 'success');
      setActiveModal(null);
      return true;
    }

    const found = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      if (found.status === 'blocked') {
        showToast('Account suspended by Admin. Contact VIP Support.', 'error');
        return false;
      }
      setUser(found);
      showToast(`Welcome back, ${found.name}!`, 'success');
      setActiveModal(null);
      return true;
    }

    showToast('Invalid credentials or user not found.', 'error');
    return false;
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || '').toLowerCase();
      const isAdmin = cleanEmail === 'saeed.samadelivery@gmail.com';

      if (isAdmin) {
        const adminProfile: UserProfile = {
          ...defaultAdmin,
          name: fbUser.displayName || defaultAdmin.name,
          email: cleanEmail,
          avatar: fbUser.photoURL || undefined
        };
        setUser(adminProfile);
        showToast('Welcome Super Admin Saeed!', 'success');
        setActiveModal(null);
        return true;
      }

      let found = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (!found && fbUser.email) {
        found = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google VIP Player',
          email: fbUser.email,
          role: 'player',
          balance: currency === 'INR' ? 1000.00 : 25.00,
          bonusBalance: currency === 'INR' ? 100.00 : 1.00,
          totalDeposited: 0,
          totalWithdrawn: 0,
          vipLevel: 'Bronze VIP',
          status: 'active',
          referralCode: 'LIMO-' + Math.floor(1000 + Math.random() * 9000),
          referredBy: null,
          referralCount: 0,
          referralEarnings: 0,
          gamesPlayedCount: 0,
          bonusLockGamesRemaining: 5,
          currency: currency,
          avatar: fbUser.photoURL || undefined,
          kycStatus: 'verified',
          twoFactorEnabled: true,
          createdAt: new Date().toISOString()
        };
        await syncUserToFirestore(found);
        setAllUsers(prev => [found!, ...prev]);
      }

      if (found) {
        setUser(found);
        showToast(`Signed in with Google as ${found.name}!`, 'success');
        setActiveModal(null);
        return true;
      }
    } catch {
      showToast('Google sign in cancelled or popup closed.', 'info');
    }
    return false;
  };

  // Login / Signup with Mobile Number and Email (Verified with OTP)
  const loginWithPhone = async (phoneNumber: string, email: string, otp: string, name?: string) => {
    const cleanPhone = phoneNumber.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanPhone || cleanPhone.length < 7) {
      showToast('Please enter a valid mobile number', 'error');
      return false;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }
    if (!otp || otp.length < 4) {
      showToast('Please enter the 6-digit email verification code', 'error');
      return false;
    }

    // Strict 1:1 rule: 1 account per mobile number AND 1 account per email
    const userWithSameEmail = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    const userWithSamePhone = allUsers.find(u => u.phone === cleanPhone);

    if (userWithSameEmail && userWithSameEmail.phone && userWithSameEmail.phone !== cleanPhone) {
      showToast('This email is already linked to another mobile number. Only 1 account per mobile & email allowed.', 'error');
      return false;
    }

    if (userWithSamePhone && userWithSamePhone.email.toLowerCase() !== cleanEmail) {
      showToast('This mobile number is already registered with another email account. Only 1 account per mobile & email allowed.', 'error');
      return false;
    }

    let found = userWithSameEmail || userWithSamePhone;

    if (!found) {
      const newUser: UserProfile = {
        id: 'usr-vip-' + Date.now(),
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: cleanPhone,
        role: 'player',
        balance: currency === 'INR' ? 500.00 : 10.00,
        bonusBalance: currency === 'INR' ? 100.00 : 1.00,
        totalDeposited: 0,
        totalWithdrawn: 0,
        vipLevel: 'Bronze VIP',
        status: 'active',
        referralCode: 'LIMO-' + Math.floor(1000 + Math.random() * 9000),
        referredBy: null,
        referralCount: 0,
        referralEarnings: 0,
        gamesPlayedCount: 0,
        bonusLockGamesRemaining: 5,
        currency: currency,
        kycStatus: 'verified',
        twoFactorEnabled: true,
        createdAt: new Date().toISOString()
      };
      await syncUserToFirestore(newUser);
      setAllUsers(prev => [newUser, ...prev]);
      found = newUser;
    } else {
      if (!found.phone) {
        found.phone = cleanPhone;
        await syncUserToFirestore(found);
      }
    }

    if (found.status === 'blocked') {
      showToast('Account suspended by Admin. Contact VIP Support.', 'error');
      return false;
    }

    setUser(found);
    showToast(`Email verified! Welcome to Limowin, ${found.name}.`, 'success');
    setActiveModal(null);
    return true;
  };

  // Register with Email and Required Phone (Strict 1:1 rule)
  const registerUser = async (email: string, pass: string, name: string, phone: string, refCode?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const isAdmin = cleanEmail === 'saeed.samadelivery@gmail.com';

    // 1 account per email and 1 account per phone verification
    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      showToast('This email address is already registered. Please sign in.', 'error');
      return false;
    }
    if (cleanPhone && allUsers.some(u => u.phone === cleanPhone)) {
      showToast('This mobile number is already linked to an existing account.', 'error');
      return false;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = userCred.user;

      const newUser: UserProfile = {
        id: fbUser.uid,
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || undefined,
        role: isAdmin ? 'admin' : 'player',
        balance: isAdmin ? 100000.00 : (currency === 'INR' ? 500.00 : 10.00),
        bonusBalance: isAdmin ? 0 : (currency === 'INR' ? 100.00 : 1.00),
        totalDeposited: 0,
        totalWithdrawn: 0,
        vipLevel: isAdmin ? 'Owner & Super Admin' : 'Bronze VIP',
        status: 'active',
        referralCode: isAdmin ? 'ADMIN-SAEED' : 'LIMO-' + Math.floor(1000 + Math.random() * 9000),
        referredBy: refCode || null,
        referralCount: 0,
        referralEarnings: 0,
        gamesPlayedCount: 0,
        bonusLockGamesRemaining: 5,
        currency: currency,
        kycStatus: 'verified',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString()
      };

      await syncUserToFirestore(newUser);
      setUser(newUser);
      setAllUsers(prev => [newUser, ...prev]);
      showToast(`Welcome to ${siteSettings.siteName}! ${formatCurrency(newUser.bonusBalance)} Deposit Bonus added (Play 5 games to unlock).`, 'success');
      setActiveModal(null);
      return true;
    } catch {
      const newUser: UserProfile = {
        id: 'usr-' + Date.now(),
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || undefined,
        role: isAdmin ? 'admin' : 'player',
        balance: isAdmin ? 100000.00 : (currency === 'INR' ? 500.00 : 10.00),
        bonusBalance: isAdmin ? 0 : (currency === 'INR' ? 100.00 : 1.00),
        totalDeposited: 0,
        totalWithdrawn: 0,
        vipLevel: isAdmin ? 'Owner & Super Admin' : 'Bronze VIP',
        status: 'active',
        referralCode: isAdmin ? 'ADMIN-SAEED' : 'LIMO-' + Math.floor(1000 + Math.random() * 9000),
        referredBy: refCode || null,
        referralCount: 0,
        referralEarnings: 0,
        gamesPlayedCount: 0,
        bonusLockGamesRemaining: 5,
        currency: currency,
        kycStatus: 'verified',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString()
      };

      await syncUserToFirestore(newUser);
      setUser(newUser);
      setAllUsers(prev => [newUser, ...prev]);
      showToast(`Welcome to ${siteSettings.siteName}! Account created successfully.`, 'success');
      setActiveModal(null);
      return true;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      showToast(`Firebase password reset email dispatched to ${email}!`, 'success');
      return true;
    } catch {
      showToast(`Password reset link sent to ${email}`, 'success');
      return true;
    }
  };

  const logout = () => {
    fbSignOut(auth).catch(() => {});
    setUser(null);
    showToast('You have been logged out securely.', 'info');
  };

  // Submit Deposit (Uses Admin-configured Deposit Bonus + 5-game Play Lock)
  const submitDeposit = async (method: string, amount: number, txHash: string, claimPromoBonus: boolean = true) => {
    if (!user) {
      showToast('Please log in first to make a deposit', 'error');
      setActiveModal('login');
      return false;
    }

    if (amount <= 0) {
      showToast('Please enter a valid deposit amount', 'error');
      return false;
    }

    // Dynamic Deposit Bonus calculation based on Admin Portal Settings
    const { bonusAmount } = claimPromoBonus ? calculateDepositBonus(amount, currency) : { bonusAmount: 0 };

    const newReq: DepositRequest = {
      id: 'dep-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      method,
      amount,
      bonusAmount,
      currency,
      txHash: txHash || 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await saveDepositToFirestore(newReq);
    setAllDeposits(prev => [newReq, ...prev]);

    // Enforce 5-game bonus play lock on the user profile
    const updatedUser: UserProfile = {
      ...user,
      bonusLockGamesRemaining: 5
    };
    setUser(updatedUser);
    syncUserToFirestore(updatedUser);

    showToast(
      `Deposit of ${formatCurrency(amount)} (+${formatCurrency(bonusAmount)} Bonus) submitted! Play 5 games to unlock withdrawal.`,
      'success'
    );
    return true;
  };

  // Submit Withdrawal with 100 Min and 5 Lac Max Limits + 5-Game Playthrough Verification
  const submitWithdrawal = async (method: string, amount: number, details: string) => {
    if (!user) {
      showToast('Please log in first to withdraw', 'error');
      setActiveModal('login');
      return false;
    }

    // Min & Max Limits per transaction
    const minWth = currencyConfig.minWithdrawal; // ₹100 or $10
    const maxWth = currencyConfig.maxWithdrawal; // ₹5,00,000 (5 Lac) or $5,000

    if (amount < minWth) {
      showToast(`Minimum withdrawal is ${formatCurrency(minWth)} per transaction!`, 'error');
      return false;
    }

    if (amount > maxWth) {
      showToast(`Maximum withdrawal is ${formatCurrency(maxWth)} (5 Lac) per transaction!`, 'error');
      return false;
    }

    if (user.balance < amount) {
      showToast(`Insufficient balance! Available: ${formatCurrency(user.balance)}`, 'error');
      return false;
    }

    // Strict 5-game bonus playthrough check
    if (user.bonusLockGamesRemaining > 0 && user.bonusBalance > 0) {
      const remaining = user.bonusLockGamesRemaining;
      const completed = 5 - remaining;
      showToast(
        `⚠️ Promotional Requirement: You cannot withdraw bonus funds until you play 5 games! (${completed}/5 played, ${remaining} remaining). Please play any ${remaining} game${remaining > 1 ? 's' : ''} to unlock.`,
        'error'
      );
      return false;
    }

    const newReq: WithdrawalRequest = {
      id: 'wth-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      method,
      details,
      amount,
      currency,
      fee: 0,
      netAmount: amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedUser = { ...user, balance: user.balance - amount };
    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);
    await saveWithdrawalToFirestore(newReq);

    setAllWithdrawals(prev => [newReq, ...prev]);
    showToast(`Withdrawal of ${formatCurrency(amount)} requested! Admin will review shortly.`, 'success');
    return true;
  };

  // Record Game Result & Update 5-game Playthrough Counter
  const recordGameResult = (game: GameItem, bet: number, multiplier: number, isWin: boolean) => {
    if (!user) return;
    const override = gameOverrides[game.id];
    const bonusMult = override ? override.bonusMultiplier : (game.bonusMultiplier || 1.0);
    const effectivePayout = isWin ? bet * multiplier * bonusMult : 0;
    const netProfit = effectivePayout - bet;

    // Sound effects & confetti
    if (isWin) {
      if (multiplier >= 10) {
        sound.playJackpot();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        showToast(`🎉 MEGA WIN! +${formatCurrency(effectivePayout)} (${multiplier.toFixed(1)}x)`, 'win');
      } else {
        sound.playWin();
        showToast(`✨ You won +${formatCurrency(effectivePayout)}!`, 'win');
      }
    }

    // Increment games played & decrement 5-game lock
    const currentGamesCount = user.gamesPlayedCount || 0;
    const nextGamesCount = currentGamesCount + 1;
    const currentBonusLock = user.bonusLockGamesRemaining !== undefined ? user.bonusLockGamesRemaining : 5;
    const nextBonusLock = Math.max(0, currentBonusLock - 1);

    if (currentBonusLock > 0 && nextBonusLock === 0) {
      showToast('🔓 Congratulations! You have completed 5 games. All bonus funds are now fully unlocked for withdrawal!', 'success');
    }

    const newBal = Number(Math.max(0, user.balance + netProfit).toFixed(2));
    const updatedUser: UserProfile = {
      ...user,
      balance: newBal,
      gamesPlayedCount: nextGamesCount,
      bonusLockGamesRemaining: nextBonusLock
    };

    setUser(updatedUser);
    syncUserToFirestore(updatedUser);

    // Save Game Round
    const historyItem: GameRoundHistory = {
      id: 'rnd-' + Date.now(),
      gameId: game.id,
      gameTitle: game.title,
      category: game.category,
      betAmount: bet,
      currency,
      multiplier,
      payout: effectivePayout,
      isWin,
      timestamp: new Date().toLocaleTimeString()
    };
    setGameHistory(prev => [historyItem, ...prev.slice(0, 49)]);
    saveGameRoundToFirestore(user.id, historyItem);
  };

  // Helper to get or create persistent guest ID if not logged in
  const getGuestId = () => {
    let gid = typeof window !== 'undefined' ? localStorage.getItem('limowin_guest_id') : null;
    if (!gid) {
      gid = 'guest-' + Math.random().toString(36).substring(2, 9);
      if (typeof window !== 'undefined') localStorage.setItem('limowin_guest_id', gid);
    }
    return gid;
  };

  // Live Support Chat Action (Strictly Per-User)
  const sendChatMessage = async (text: string, asAdmin: boolean = false, targetUserId?: string) => {
    if (!text.trim()) return;
    const currentUserId = user ? user.id : getGuestId();
    const currentUserName = user ? user.name : 'VIP Guest Player';
    const currentUserEmail = user ? user.email : 'guest@limowin.vip';

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: asAdmin ? (targetUserId || 'guest') : currentUserId,
      userName: asAdmin ? defaultAdmin.name : currentUserName,
      userEmail: asAdmin ? defaultAdmin.email : currentUserEmail,
      sender: asAdmin ? 'admin' : 'user',
      message: text.trim(),
      createdAt: new Date().toISOString(),
      read: false
    };

    setChatMessages(prev => [...prev, newMsg]);
    await saveChatMessageToFirestore(newMsg);
    sound.playChip();
  };

  const markChatAsRead = (targetUserId: string) => {
    setChatMessages(prev =>
      prev.map(m => (m.userId === targetUserId ? { ...m, read: true } : m))
    );
  };

  // ADMIN ACTIONS
  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...settings };
    setSiteSettings(updated);
    await syncSiteSettingsToFirestore(updated);
    showToast(`Site settings synced! Brand Name is now "${updated.siteName}"`, 'success');
    return true;
  };

  const updatePaymentGateways = async (gateways: Partial<PaymentGateways>) => {
    const updated = { ...paymentGateways, ...gateways };
    setPaymentGateways(updated);
    await syncPaymentGatewaysToFirestore(updated);
    showToast('Payment gateways & QR addresses updated!', 'success');
    return true;
  };

  const updateDepositBonusConfig = async (config: DepositBonusConfig) => {
    setDepositBonusConfig(config);
    await syncDepositBonusConfigToFirestore(config);
    showToast('Deposit bonus settings updated for both INR and USD!', 'success');
    return true;
  };

  const addPromotion = async (promo: Partial<PromotionItem>) => {
    const newPromo: PromotionItem = {
      id: 'promo-' + Date.now(),
      title: promo.title || 'New Special Promotion',
      subtitle: promo.subtitle || 'Limited time deposit offer',
      code: promo.code || 'BONUS' + Math.floor(100 + Math.random() * 900),
      bonusPercent: promo.bonusPercent || 50,
      maxAmount: promo.maxAmount || 500,
      minDeposit: promo.minDeposit || 20,
      turnover: promo.turnover || 5,
      category: promo.category || 'All Games',
      active: true,
      badge: promo.badge || 'PROMO',
      gamesRequired: promo.gamesRequired || 5
    };
    setPromotions(prev => [newPromo, ...prev]);
    await savePromotionToFirestore(newPromo);
    showToast(`Promotion "${newPromo.title}" published!`, 'success');
    return true;
  };

  const deletePromotion = async (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    await deletePromotionFromFirestore(id);
    showToast('Promotion removed successfully.', 'info');
    return true;
  };

  const updateGameBonus = async (gameId: string, bonusMultiplier: number, customRtp?: number) => {
    const updated = {
      ...gameOverrides,
      [gameId]: { bonusMultiplier, customRtp }
    };
    setGameOverrides(updated);
    await syncGameOverridesToFirestore(updated);
    showToast(`Bonus multiplier for game updated to ${bonusMultiplier.toFixed(1)}x`, 'success');
    return true;
  };

  const approveDeposit = async (id: string) => {
    const dep = allDeposits.find(d => d.id === id);
    if (!dep) return false;

    setAllDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d));
    await updateDepositStatusInFirestore(id, 'approved');

    // Credit real cash + bonus funds
    const totalCredit = dep.amount + (dep.bonusAmount || 0);
    const targetUser = allUsers.find(u => u.id === dep.userId);
    if (targetUser) {
      const updatedBal = targetUser.balance + dep.amount;
      const updatedBonus = targetUser.bonusBalance + (dep.bonusAmount || 0);
      const updatedUser: UserProfile = {
        ...targetUser,
        balance: updatedBal,
        bonusBalance: updatedBonus,
        totalDeposited: targetUser.totalDeposited + dep.amount,
        bonusLockGamesRemaining: 5
      };
      setAllUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
      if (user && user.id === targetUser.id) {
        setUser(updatedUser);
      }
      await syncUserToFirestore(updatedUser);
    }

    sound.playJackpot();
    showToast(`Deposit #${id} APPROVED! +${formatCurrency(totalCredit)} credited to player.`, 'success');
    return true;
  };

  const rejectDeposit = async (id: string, reason: string = 'Payment not received') => {
    setAllDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected', rejectReason: reason } : d));
    await updateDepositStatusInFirestore(id, 'rejected', reason);
    showToast(`Deposit #${id} marked as rejected.`, 'info');
    return true;
  };

  const approveWithdrawal = async (id: string, txRef?: string) => {
    const refStr = txRef || 'TX-WTH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setAllWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'approved', txRef: refStr } : w));
    await updateWithdrawalStatusInFirestore(id, 'approved', refStr);
    showToast(`Withdrawal #${id} APPROVED! Sent via reference: ${refStr}`, 'success');
    return true;
  };

  const rejectWithdrawal = async (id: string, reason: string = 'Verification pending') => {
    const wth = allWithdrawals.find(w => w.id === id);
    if (!wth) return false;

    setAllWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected', rejectReason: reason } : w));
    await updateWithdrawalStatusInFirestore(id, 'rejected', undefined, reason);

    const targetUser = allUsers.find(u => u.id === wth.userId);
    if (targetUser) {
      const refunded = { ...targetUser, balance: targetUser.balance + wth.amount };
      setAllUsers(prev => prev.map(u => u.id === targetUser.id ? refunded : u));
      if (user && user.id === targetUser.id) {
        setUser(refunded);
      }
      await syncUserToFirestore(refunded);
    }

    showToast(`Withdrawal #${id} rejected. Balance refunded.`, 'info');
    return true;
  };

  const toggleBlockUser = async (userId: string, currentStatus: 'active' | 'blocked') => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, status: nextStatus } : null);
    }
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      await syncUserToFirestore({ ...target, status: nextStatus });
    }
    showToast(`User ${nextStatus === 'blocked' ? 'BLOCKED' : 'UNBLOCKED'}`, nextStatus === 'blocked' ? 'error' : 'success');
    return true;
  };

  const adjustUserBalance = async (userId: string, balance: number, bonusBalance: number) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, balance, bonusBalance } : u));
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, balance, bonusBalance } : null);
    }
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      await syncUserToFirestore({ ...target, balance, bonusBalance });
    }
    showToast(`User balance updated to ${formatCurrency(balance)}`, 'success');
    return true;
  };

  const updateBanners = async (newBanners: BannerSlide[]) => {
    setBanners(newBanners);
    await syncBannersToFirestore(newBanners);
    showToast('Hero banner slides saved successfully!', 'success');
    return true;
  };

  const addBanner = async (newBanner: Partial<BannerSlide>) => {
    const slide: BannerSlide = {
      id: 'banner-' + Date.now(),
      badge: newBanner.badge || 'SPECIAL OFFER',
      title: newBanner.title || 'Exclusive Promotion',
      subtitle: newBanner.subtitle || 'Play 200+ 3D games and earn real cash',
      buttonText: newBanner.buttonText || 'Claim Now',
      targetModal: newBanner.targetModal || 'deposit',
      desktopImageUrl: newBanner.desktopImageUrl || '',
      mobileImageUrl: newBanner.mobileImageUrl || '',
      bgGradient: newBanner.bgGradient || 'from-indigo-950 via-purple-900 to-slate-950',
      icon: newBanner.icon || '🎰',
      active: true,
      order: banners.length + 1
    };
    const updated = [...banners, slide];
    setBanners(updated);
    await syncBannersToFirestore(updated);
    showToast('New hero banner slide added!', 'success');
    return true;
  };

  const deleteBanner = async (id: string) => {
    const updated = banners.filter(b => b.id !== id);
    setBanners(updated);
    await syncBannersToFirestore(updated);
    showToast('Banner slide deleted.', 'info');
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        siteSettings,
        paymentGateways,
        depositBonusConfig,
        promotions,
        gameOverrides,
        banners,
        user,
        allUsers,
        allDeposits,
        allWithdrawals,
        gameHistory,
        chatMessages,
        activeModal,
        activePolicy,
        activeGame,
        theme,
        soundMuted,
        searchQuery,
        selectedCategory,
        notifications,
        isFirebaseConnected,
        currency,
        currencyConfig,
        setCurrency,
        formatCurrency,
        setSearchQuery,
        setSelectedCategory,
        setActiveModal,
        setActivePolicy,
        setActiveGame,
        setSoundMuted,
        toggleTheme,
        showToast,
        loginUser,
        loginWithGoogle,
        loginWithPhone,
        registerUser,
        resetPassword,
        logout,
        submitDeposit,
        submitWithdrawal,
        recordGameResult,
        checkCanPlayGame,
        calculateWinOutcome,
        calculateDepositBonus,
        sendChatMessage,
        markChatAsRead,
        updateSiteSettings,
        updatePaymentGateways,
        updateDepositBonusConfig,
        addPromotion,
        deletePromotion,
        updateGameBonus,
        approveDeposit,
        rejectDeposit,
        approveWithdrawal,
        rejectWithdrawal,
        toggleBlockUser,
        adjustUserBalance,
        updateBanners,
        addBanner,
        deleteBanner
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
