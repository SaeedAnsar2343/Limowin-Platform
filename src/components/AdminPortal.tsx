import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GAMES_CATALOG } from '../data/gamesCatalog';
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Gift,
  Gamepad2,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Share2,
  Image as ImageIcon,
  Check,
  X,
  Search,
  Plus,
  Trash2,
  Ban,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Percent,
  AlertCircle,
  MessageCircle,
  Send,
  Smartphone,
  Sparkles,
  Bot
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    siteSettings,
    updateSiteSettings,
    paymentGateways,
    updatePaymentGateways,
    depositBonusConfig,
    updateDepositBonusConfig,
    promotions,
    addPromotion,
    deletePromotion,
    gameOverrides,
    updateGameBonus,
    allUsers,
    toggleBlockUser,
    adjustUserBalance,
    allDeposits,
    approveDeposit,
    rejectDeposit,
    allWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    chatMessages,
    sendChatMessage,
    markChatAsRead,
    currency,
    formatCurrency,
    setActiveModal,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'settings' | 'payments' | 'promotions' | 'games' | 'deposits' | 'withdrawals' | 'users' | 'support' | 'affiliates' | 'media'
  >('overview');

  // Form states
  const [siteForm, setSiteForm] = useState({ ...siteSettings });
  const [gatewayForm, setGatewayForm] = useState({ ...paymentGateways });
  const [bonusConfigForm, setBonusConfigForm] = useState({ ...depositBonusConfig });

  const [gameSearch, setGameSearch] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('ae-dragontiger');
  const [gameBonusMult, setGameBonusMult] = useState(1.2);
  const [gameCustomRtp, setGameCustomRtp] = useState(97.0);

  // Live support chat state
  const [selectedChatUserId, setSelectedChatUserId] = useState<string>('user-demo-1');
  const [adminReplyText, setAdminReplyText] = useState('');

  // New promo form
  const [newPromo, setNewPromo] = useState({
    title: '',
    subtitle: '',
    code: '',
    bonusPercent: 100,
    maxAmount: 2000,
    minDeposit: 20,
    turnover: 10,
    badge: 'EXCLUSIVE',
    category: 'All Games'
  });

  // Balance adjustment modal
  const [adjustingUser, setAdjustingUser] = useState<string | null>(null);
  const [newBal, setNewBal] = useState(1000);
  const [newBonusBal, setNewBonusBal] = useState(200);

  // Stats calculation
  const totalDeposited = allDeposits
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalWithdrawn = allWithdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const pendingDeposits = allDeposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'pending');
  const unreadMessagesCount = chatMessages.filter(m => !m.read && m.sender === 'user').length;

  const filteredGames = GAMES_CATALOG.filter(g =>
    g.title.toLowerCase().includes(gameSearch.toLowerCase()) ||
    g.provider.toLowerCase().includes(gameSearch.toLowerCase()) ||
    g.category.toLowerCase().includes(gameSearch.toLowerCase())
  );

  // Group chat users
  const chatUserIds = Array.from(new Set(chatMessages.map(m => m.userId).filter(id => id !== 'all')));
  if (!chatUserIds.includes('user-demo-1')) chatUserIds.push('user-demo-1');

  const activeChatMessages = chatMessages.filter(
    m => m.userId === selectedChatUserId || (m.userId === 'all' && selectedChatUserId === 'all')
  );

  const handleAdminSendReply = async () => {
    if (!adminReplyText.trim()) return;
    await sendChatMessage(adminReplyText, true, selectedChatUserId);
    setAdminReplyText('');
    showToast('Reply dispatched to player!', 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
            👑
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black">{siteSettings.siteName} Master Admin Portal</h1>
              <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firebase Connected: pelican-pass</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Real-time Site Control, Financial Gateways, 200+ Games & Live VIP Support Desk
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
        >
          Exit Admin Mode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm sticky top-24 space-y-1">
            {[
              { id: 'overview', label: 'Dashboard & Financials', icon: LayoutDashboard },
              { id: 'settings', label: 'Site Name & Brand', icon: Settings },
              { id: 'payments', label: 'Gateways: UPI, GPay & Crypto', icon: CreditCard },
              { id: 'promotions', label: 'Deposit Bonus & Promos', icon: Gift },
              { id: 'games', label: '200+ Games & Bonuses', icon: Gamepad2 },
              { id: 'deposits', label: `Pending Deposits (${pendingDeposits.length})`, icon: ArrowDownLeft, badge: pendingDeposits.length },
              { id: 'withdrawals', label: `Pending Withdrawals (${pendingWithdrawals.length})`, icon: ArrowUpRight, badge: pendingWithdrawals.length },
              { id: 'support', label: `Live VIP Chat (${unreadMessagesCount})`, icon: MessageCircle, badge: unreadMessagesCount },
              { id: 'users', label: 'User Control & Blocks', icon: Users },
              { id: 'affiliates', label: 'Referral & Affiliate System', icon: Share2 },
              { id: 'media', label: 'Images & Banners', icon: ImageIcon }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'support') {
                      markChatAsRead(selectedChatUserId);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all text-left ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Platform Financials & Real-time Metrics</h2>
                  <p className="text-xs text-slate-500">Global overview across all games, deposits, and player withdrawals.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/30 rounded-2xl">
                    <span className="text-xs font-bold text-emerald-800 uppercase block">Total Deposits Approved</span>
                    <span className="text-2xl font-black text-emerald-600 mt-1 block">{formatCurrency(totalDeposited)}</span>
                    <span className="text-[10px] text-slate-500 mt-2 block font-medium">Real cash processed</span>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/30 rounded-2xl">
                    <span className="text-xs font-bold text-blue-800 uppercase block">Total Payouts Approved</span>
                    <span className="text-2xl font-black text-blue-600 mt-1 block">{formatCurrency(totalWithdrawn)}</span>
                    <span className="text-[10px] text-slate-500 mt-2 block font-medium">Player withdrawals sent</span>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-2xl">
                    <span className="text-xs font-bold text-amber-800 uppercase block">Pending Actions</span>
                    <span className="text-2xl font-black text-amber-600 mt-1 block">
                      {pendingDeposits.length + pendingWithdrawals.length}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                      {pendingDeposits.length} deposits • {pendingWithdrawals.length} payouts
                    </span>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 rounded-2xl">
                    <span className="text-xs font-bold text-purple-800 uppercase block">Registered Players</span>
                    <span className="text-2xl font-black text-purple-600 mt-1 block">{allUsers.length}</span>
                    <span className="text-[10px] text-slate-500 mt-2 block font-medium">Firebase cloud synced</span>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Need to approve pending deposits or withdrawals?</h3>
                    <p className="text-xs text-slate-500">Instant 1-click approvals credit funds directly to player wallets.</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('deposits')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Review Deposits ({pendingDeposits.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('withdrawals')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Review Withdrawals ({pendingWithdrawals.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SITE NAME & BRAND */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Global Site Name & Brand Settings</h2>
                  <p className="text-xs text-slate-500">
                    Changing the site name here instantly updates headers, footers, legal policies, auth modals, and document title.
                  </p>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Site Name (Global Dynamic Value)</label>
                    <input
                      type="text"
                      value={siteForm.siteName}
                      onChange={e => setSiteForm({ ...siteForm, siteName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-black focus:outline-amber-500"
                    />
                    <span className="text-[11px] text-slate-400">Currently: "{siteSettings.siteName}"</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Site Tagline / Headline</label>
                    <input
                      type="text"
                      value={siteForm.siteTagline}
                      onChange={e => setSiteForm({ ...siteForm, siteTagline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Ribbon Banner</label>
                    <input
                      type="text"
                      value={siteForm.bannerAnnouncement}
                      onChange={e => setSiteForm({ ...siteForm, bannerAnnouncement: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={siteForm.supportEmail}
                        onChange={e => setSiteForm({ ...siteForm, supportEmail: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Support Telegram</label>
                      <input
                        type="text"
                        value={siteForm.supportTelegram}
                        onChange={e => setSiteForm({ ...siteForm, supportTelegram: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => updateSiteSettings(siteForm)}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      Save & Apply Global Site Name
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PAYMENT GATEWAYS (Includes UPI, GPay & Crypto) */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Deposit Gateways & Banking Details</h2>
                  <p className="text-xs text-slate-500">
                    Configure your official crypto deposit addresses, bank credentials, UPI Pay, and Google Pay (GPay). These update live on the customer cashier!
                  </p>
                </div>

                <div className="space-y-6 max-w-2xl">
                  {/* UPI FastPay */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <span>⚡ UPI FastPay (Indian Rail)</span>
                      </span>
                      <span className="text-xs text-emerald-600 font-bold">Enabled</span>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Official UPI VPA ID</label>
                      <input
                        type="text"
                        value={gatewayForm.upiFastPay.upiId}
                        onChange={e =>
                          setGatewayForm({
                            ...gatewayForm,
                            upiFastPay: { ...gatewayForm.upiFastPay, upiId: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Instructions for User</label>
                      <input
                        type="text"
                        value={gatewayForm.upiFastPay.instructions}
                        onChange={e =>
                          setGatewayForm({
                            ...gatewayForm,
                            upiFastPay: { ...gatewayForm.upiFastPay, instructions: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Google Pay (GPay) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span>Google Pay (GPay Official Fast Rail)</span>
                      </span>
                      <span className="text-xs text-blue-600 font-bold">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">GPay UPI ID</label>
                        <input
                          type="text"
                          value={gatewayForm.gpayFastPay.upiId}
                          onChange={e =>
                            setGatewayForm({
                              ...gatewayForm,
                              gpayFastPay: { ...gatewayForm.gpayFastPay, upiId: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">GPay Phone Number</label>
                        <input
                          type="text"
                          value={gatewayForm.gpayFastPay.phone}
                          onChange={e =>
                            setGatewayForm({
                              ...gatewayForm,
                              gpayFastPay: { ...gatewayForm.gpayFastPay, phone: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* USDT TRC-20 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                      <span>USDT TRC-20 Deposit Destination (International)</span>
                      <span className="text-xs text-emerald-600 font-bold">Enabled</span>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Tron Wallet Address</label>
                      <input
                        type="text"
                        value={gatewayForm.cryptoUsdtTrc20.address}
                        onChange={e =>
                          setGatewayForm({
                            ...gatewayForm,
                            cryptoUsdtTrc20: { ...gatewayForm.cryptoUsdtTrc20, address: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Bank Wire */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="font-bold text-sm text-slate-900">Bank Transfer Details</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={gatewayForm.bankWireTransfer.bankName}
                          onChange={e =>
                            setGatewayForm({
                              ...gatewayForm,
                              bankWireTransfer: { ...gatewayForm.bankWireTransfer, bankName: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Account Holder</label>
                        <input
                          type="text"
                          value={gatewayForm.bankWireTransfer.accountName}
                          onChange={e =>
                            setGatewayForm({
                              ...gatewayForm,
                              bankWireTransfer: { ...gatewayForm.bankWireTransfer, accountName: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={gatewayForm.bankWireTransfer.accountNumber}
                          onChange={e =>
                            setGatewayForm({
                              ...gatewayForm,
                              bankWireTransfer: { ...gatewayForm.bankWireTransfer, accountNumber: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">IFSC / SWIFT</label>
                        <input
                          type="text"
                          value={gatewayForm.bankWireTransfer.ifscSwift}
                          onChange={e =>
                            setGatewayForm({
                              ...gatewayForm,
                              bankWireTransfer: { ...gatewayForm.bankWireTransfer, ifscSwift: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => updatePaymentGateways(gatewayForm)}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow"
                  >
                    Save All Payment Gateways
                  </button>
                </div>
              </div>
            )}

            {/* 4. PROMOTIONS & DEPOSIT BONUS MANAGER */}
            {activeTab === 'promotions' && (
              <div className="space-y-8">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Deposit Bonus & Promotions Settings</h2>
                  <p className="text-xs text-slate-500">
                    Set up real automated deposit bonuses for both currencies (Fixed Amount or Percentage). Also manage custom promo codes.
                  </p>
                </div>

                {/* DEDICATED DUAL-CURRENCY DEPOSIT BONUS ENGINE */}
                <div className="p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300 rounded-3xl space-y-6 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h3 className="font-black text-base text-slate-900">
                      Automated Deposit Bonus Engine (Dual Currency Config)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INR Bonus Settings */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-black text-sm text-slate-900">🇮🇳 Indian Rupee (INR) Bonus</span>
                        <input
                          type="checkbox"
                          checked={bonusConfigForm.inr.enabled}
                          onChange={e =>
                            setBonusConfigForm({
                              ...bonusConfigForm,
                              inr: { ...bonusConfigForm.inr, enabled: e.target.checked }
                            })
                          }
                          className="w-4 h-4 text-amber-500 rounded"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Bonus Calculation Type</label>
                          <select
                            value={bonusConfigForm.inr.type}
                            onChange={e =>
                              setBonusConfigForm({
                                ...bonusConfigForm,
                                inr: { ...bonusConfigForm.inr, type: e.target.value as any }
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                          >
                            <option value="fixed">Fixed Cash Amount (₹)</option>
                            <option value="percent">Percentage Match (%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            {bonusConfigForm.inr.type === 'fixed' ? 'Fixed Bonus (₹)' : 'Bonus Match (%)'}
                          </label>
                          <input
                            type="number"
                            value={bonusConfigForm.inr.value}
                            onChange={e =>
                              setBonusConfigForm({
                                ...bonusConfigForm,
                                inr: { ...bonusConfigForm.inr, value: Number(e.target.value) }
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black"
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-xl">
                        Preview: If user deposits ₹1,000, they get{' '}
                        <strong className="text-emerald-600">
                          {bonusConfigForm.inr.type === 'fixed'
                            ? `+₹${bonusConfigForm.inr.value}`
                            : `+₹${((1000 * bonusConfigForm.inr.value) / 100).toFixed(0)} (${bonusConfigForm.inr.value}%)`}
                        </strong>{' '}
                        bonus funds! (5 games required to withdraw).
                      </div>
                    </div>

                    {/* USD Bonus Settings */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-black text-sm text-slate-900">🌐 International USD / USDT Bonus</span>
                        <input
                          type="checkbox"
                          checked={bonusConfigForm.usd.enabled}
                          onChange={e =>
                            setBonusConfigForm({
                              ...bonusConfigForm,
                              usd: { ...bonusConfigForm.usd, enabled: e.target.checked }
                            })
                          }
                          className="w-4 h-4 text-amber-500 rounded"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Bonus Calculation Type</label>
                          <select
                            value={bonusConfigForm.usd.type}
                            onChange={e =>
                              setBonusConfigForm({
                                ...bonusConfigForm,
                                usd: { ...bonusConfigForm.usd, type: e.target.value as any }
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                          >
                            <option value="fixed">Fixed Cash Amount ($)</option>
                            <option value="percent">Percentage Match (%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            {bonusConfigForm.usd.type === 'fixed' ? 'Fixed Bonus ($)' : 'Bonus Match (%)'}
                          </label>
                          <input
                            type="number"
                            value={bonusConfigForm.usd.value}
                            onChange={e =>
                              setBonusConfigForm({
                                ...bonusConfigForm,
                                usd: { ...bonusConfigForm.usd, value: Number(e.target.value) }
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black"
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-xl">
                        Preview: If user deposits $50, they get{' '}
                        <strong className="text-emerald-600">
                          {bonusConfigForm.usd.type === 'fixed'
                            ? `+$${bonusConfigForm.usd.value}`
                            : `+$${((50 * bonusConfigForm.usd.value) / 100).toFixed(2)} (${bonusConfigForm.usd.value}%)`}
                        </strong>{' '}
                        bonus funds! (5 games required to withdraw).
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => updateDepositBonusConfig(bonusConfigForm)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black rounded-xl shadow"
                  >
                    Save & Activate Dual Currency Deposit Bonuses
                  </button>
                </div>

                {/* Additional Promotions Creator */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="font-bold text-sm text-slate-900">Add Custom Campaign Promotion</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Title (e.g. Weekend Mega Reload)"
                      value={newPromo.title}
                      onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. WEEKEND100)"
                      value={newPromo.code}
                      onChange={e => setNewPromo({ ...newPromo, code: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Bonus Percent (%)"
                      value={newPromo.bonusPercent}
                      onChange={e => setNewPromo({ ...newPromo, bonusPercent: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newPromo.title) return showToast('Promo title required', 'error');
                      addPromotion(newPromo);
                      setNewPromo({
                        title: '',
                        subtitle: '',
                        code: '',
                        bonusPercent: 100,
                        maxAmount: 2000,
                        minDeposit: 20,
                        turnover: 10,
                        badge: 'EXCLUSIVE',
                        category: 'All Games'
                      });
                    }}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish Promotion</span>
                  </button>
                </div>

                {/* Current Promotions List */}
                <div className="space-y-3">
                  {promotions.map(p => (
                    <div
                      key={p.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{p.title}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                            {p.badge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Code: <strong className="font-mono text-slate-800">{p.code}</strong> • Bonus: {p.bonusPercent}% • Rollover: {p.turnover}x
                        </div>
                      </div>
                      <button
                        onClick={() => deletePromotion(p.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. 200+ GAMES & BONUSES */}
            {activeTab === 'games' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">200+ Games Bonus & RTP Multiplier Manager</h2>
                  <p className="text-xs text-slate-500">
                    Adjust the payout bonus multiplier or custom RTP for each individual game in the catalog.
                  </p>
                </div>

                {/* Quick Editor Bar */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-amber-900">Selected Game: {selectedGameId}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={gameBonusMult}
                      onChange={e => setGameBonusMult(Number(e.target.value))}
                      className="w-24 px-2 py-1 rounded border border-amber-300 text-xs font-bold"
                    />
                    <span className="text-xs text-slate-600 font-mono">Multiplier</span>
                  </div>

                  <button
                    onClick={() => updateGameBonus(selectedGameId, gameBonusMult, gameCustomRtp)}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow"
                  >
                    Save Multiplier
                  </button>
                </div>

                {/* Search Games */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search from 210 games catalog..."
                    value={gameSearch}
                    onChange={e => setGameSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                {/* Games Table */}
                <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3">Game Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Provider</th>
                        <th className="p-3">RTP Display</th>
                        <th className="p-3">Bonus Boost</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredGames.slice(0, 50).map(g => {
                        const override = gameOverrides[g.id];
                        const mult = override ? override.bonusMultiplier : (g.bonusMultiplier || 1.0);
                        return (
                          <tr key={g.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{g.title}</td>
                            <td className="p-3 capitalize text-slate-500">{g.category}</td>
                            <td className="p-3 text-slate-500">{g.provider}</td>
                            <td className="p-3 font-mono font-bold text-emerald-600">{g.rtp}%</td>
                            <td className="p-3 font-black text-amber-600">{mult.toFixed(1)}x</td>
                            <td className="p-3">
                              <button
                                onClick={() => {
                                  setSelectedGameId(g.id);
                                  setGameBonusMult(mult);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px]"
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. PENDING DEPOSITS */}
            {activeTab === 'deposits' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Player Deposit Approvals</h2>
                  <p className="text-xs text-slate-500">
                    Verify incoming deposits. Click Approve to immediately credit the player balance + bonus funds.
                  </p>
                </div>

                <div className="space-y-3">
                  {allDeposits.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">No deposit requests recorded yet.</div>
                  ) : (
                    allDeposits.map(d => (
                      <div
                        key={d.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900">{d.userName}</span>
                            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-mono text-slate-700">
                              {d.userEmail}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              d.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              d.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Method: <strong>{d.method}</strong> • Amount: <strong className="text-slate-900">{formatCurrency(d.amount)}</strong>
                            {d.bonusAmount > 0 && (
                              <span className="text-amber-700 font-bold ml-1.5">(+{formatCurrency(d.bonusAmount)} Bonus)</span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Ref: {d.txHash} • {new Date(d.createdAt).toLocaleString()}</div>
                        </div>

                        {d.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveDeposit(d.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs"
                            >
                              Approve Deposit
                            </button>
                            <button
                              onClick={() => rejectDeposit(d.id, 'Transaction not found')}
                              className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 7. PENDING WITHDRAWALS */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Player Withdrawal Approvals</h2>
                  <p className="text-xs text-slate-500">
                    Verify payout details. Click Approve once the funds have been dispatched to the user.
                  </p>
                </div>

                <div className="space-y-3">
                  {allWithdrawals.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">No withdrawal requests recorded yet.</div>
                  ) : (
                    allWithdrawals.map(w => (
                      <div
                        key={w.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900">{w.userName}</span>
                            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-mono text-slate-700">
                              {w.userEmail}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              w.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              w.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {w.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Method: <strong>{w.method}</strong> • Amount: <strong className="text-slate-900">{formatCurrency(w.amount)}</strong>
                          </div>
                          <div className="text-[11px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-1.5 break-all">
                            Destination: {w.details}
                          </div>
                        </div>

                        {w.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveWithdrawal(w.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs"
                            >
                              Approve & Dispatch
                            </button>
                            <button
                              onClick={() => rejectWithdrawal(w.id, 'Account details incorrect')}
                              className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 8. LIVE VIP SUPPORT CHAT DESK */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Live VIP Support & Concierge Desk</h2>
                  <p className="text-xs text-slate-500">
                    Real-time two-way chat directly connected with players. Respond live to questions and deposit verifications.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-200 rounded-3xl overflow-hidden min-h-[460px]">
                  {/* Left Column: Player list */}
                  <div className="bg-slate-50 border-r border-slate-200 p-4 space-y-2">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                      Active Inquiries
                    </span>
                    {chatUserIds.map(uid => {
                      const userObj = allUsers.find(u => u.id === uid) || { name: 'Player', email: uid };
                      const userMsgs = chatMessages.filter(m => m.userId === uid);
                      const lastMsg = userMsgs[userMsgs.length - 1];
                      const unread = userMsgs.filter(m => !m.read && m.sender === 'user').length;
                      const isSelected = selectedChatUserId === uid;

                      return (
                        <button
                          key={uid}
                          onClick={() => {
                            setSelectedChatUserId(uid);
                            markChatAsRead(uid);
                          }}
                          className={`w-full p-3 rounded-2xl text-left transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                              : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">{userObj.name}</span>
                            {unread > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black">
                                {unread} new
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate mt-1 ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                            {lastMsg ? lastMsg.message : 'No messages yet'}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Live Conversation */}
                  <div className="md:col-span-2 flex flex-col justify-between bg-white p-4">
                    <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-900">
                          Chatting with: {allUsers.find(u => u.id === selectedChatUserId)?.name || selectedChatUserId}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ID: {selectedChatUserId}
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Live Connected
                      </span>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-72">
                      {activeChatMessages.map(m => {
                        const isAdmin = m.sender === 'admin';
                        return (
                          <div
                            key={m.id}
                            className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                              isAdmin
                                ? 'bg-slate-900 text-white rounded-br-xs font-medium'
                                : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
                            }`}>
                              <div className="flex items-center justify-between text-[10px] font-bold opacity-60 mb-1 space-x-2">
                                <span>{isAdmin ? 'Official Admin Desk' : m.userName}</span>
                                <span className="font-mono">
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap">{m.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Admin Reply Input */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type official reply to player..."
                        value={adminReplyText}
                        onChange={e => setAdminReplyText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAdminSendReply();
                        }}
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={handleAdminSendReply}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. USER CONTROL & BLOCKS */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">User Control & Player Moderation</h2>
                  <p className="text-xs text-slate-500">
                    Instantly block/unblock fraudulent accounts and adjust real cash / bonus balances.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="p-3">Player</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Real Cash</th>
                        <th className="p-3">Bonus Funds</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{u.name}</td>
                          <td className="p-3 font-mono text-slate-500">{u.email}</td>
                          <td className="p-3 uppercase text-[10px] font-black">{u.role}</td>
                          <td className="p-3 font-black text-emerald-600">{formatCurrency(u.balance)}</td>
                          <td className="p-3 font-black text-yellow-600">{formatCurrency(u.bonusBalance)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3 space-x-2">
                            <button
                              onClick={() => {
                                setAdjustingUser(u.id);
                                setNewBal(u.balance);
                                setNewBonusBal(u.bonusBalance);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px]"
                            >
                              Adjust Funds
                            </button>
                            <button
                              onClick={() => toggleBlockUser(u.id, u.status)}
                              className={`px-2.5 py-1 rounded font-bold text-[10px] text-white ${
                                u.status === 'active' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                              }`}
                            >
                              {u.status === 'active' ? 'Block User' : 'Unblock'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Adjust Modal Box */}
                {adjustingUser && (
                  <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl space-y-3">
                    <div className="font-bold text-sm text-slate-900">Adjust Balance for User {adjustingUser}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">New Real Cash Balance</label>
                        <input
                          type="number"
                          value={newBal}
                          onChange={e => setNewBal(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">New Bonus Balance</label>
                        <input
                          type="number"
                          value={newBonusBal}
                          onChange={e => setNewBonusBal(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          adjustUserBalance(adjustingUser, newBal, newBonusBal);
                          setAdjustingUser(null);
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                      >
                        Apply Adjustment
                      </button>
                      <button
                        onClick={() => setAdjustingUser(null)}
                        className="px-4 py-2 bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 10. REFERRAL & AFFILIATE SYSTEM */}
            {activeTab === 'affiliates' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Referral & Affiliate Program System</h2>
                  <p className="text-xs text-slate-500">Multi-tier commission rules, referral leaderboard, and affiliate rewards.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                    <div className="text-xs font-bold text-amber-800">Tier 1 Commission</div>
                    <div className="text-2xl font-black text-amber-700 mt-1">15%</div>
                    <div className="text-[11px] text-amber-600 mt-1">1 to 10 Referrals</div>
                  </div>
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center">
                    <div className="text-xs font-bold text-indigo-800">Tier 2 Commission</div>
                    <div className="text-2xl font-black text-indigo-700 mt-1">25%</div>
                    <div className="text-[11px] text-indigo-600 mt-1">11 to 50 Referrals</div>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                    <div className="text-xs font-bold text-purple-800">Tier 3 VIP Master</div>
                    <div className="text-2xl font-black text-purple-700 mt-1">35%</div>
                    <div className="text-[11px] text-purple-600 mt-1">50+ Referrals</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="font-bold text-sm text-slate-900 mb-2">Top Affiliates Overview</div>
                  <div className="space-y-2">
                    {allUsers.map(u => (
                      <div key={u.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-900">{u.name}</strong> ({u.referralCode})
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-slate-500">{u.referralCount} Invites</span>
                          <span className="font-bold text-emerald-600">{formatCurrency(u.referralEarnings)} Paid</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 11. MEDIA & IMAGES */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900">Adaptive Media & Images Manager</h2>
                  <p className="text-xs text-slate-500">
                    Update hero banners, site logo, and promotional posters in real time.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Site Logo URL</label>
                    <input
                      type="text"
                      value={siteForm.logoUrl}
                      onChange={e => setSiteForm({ ...siteForm, logoUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {['welcome-bonus.png', 'vip-cashback.png', 'sports-accumulator.png', 'crypto-deposit.png', 'referral-affiliate.png'].map(b => (
                      <div key={b} className="border border-slate-200 rounded-2xl p-2 bg-slate-50">
                        <img src={`/assets/banners/${b}`} alt="" className="w-full h-24 object-cover rounded-xl" />
                        <div className="text-[11px] font-bold text-slate-700 mt-2 truncate">{b}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
