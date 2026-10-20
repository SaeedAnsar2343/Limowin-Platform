import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  FileText,
  Lock,
  UserCheck,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  HelpCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PolicyProps {
  onClose?: () => void;
}

export const PolicyPages: React.FC<PolicyProps> = () => {
  const { siteSettings, activePolicy, setActivePolicy, setActiveModal } = useApp();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const site = siteSettings.siteName;

  const tabs = [
    { id: 'responsible-gaming', label: 'Responsible Gaming', icon: ShieldAlert },
    { id: 'compliance', label: 'Compliance Policy', icon: CheckCircle },
    { id: 'privacy', label: 'Privacy Note', icon: Lock },
    { id: 'underage', label: 'Underage Gaming (18+)', icon: UserCheck },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'banking-assistance', label: 'Banking Assistance', icon: CreditCard },
    { id: 'how-to-deposit', label: 'How to Deposit', icon: ArrowDownCircle },
    { id: 'how-to-withdraw', label: 'How to Withdraw', icon: ArrowUpCircle },
    { id: 'faqs', label: 'Frequently Asked Questions', icon: HelpCircle },
    { id: 'vision', label: `${site} Vision`, icon: Eye }
  ];

  const renderContent = () => {
    switch (activePolicy) {
      case 'responsible-gaming':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="w-6 h-6 text-amber-500" />
                <span>{site} Responsible Gaming Policy</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Our steadfast commitment to player welfare and responsible enjoyment.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-normal">
                Gambling should be considered a form of paid entertainment, not an investment strategy or primary source of income.
                Never wager money you cannot afford to comfortably lose. If you feel you may be losing control, seek assistance immediately.
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">1. Player Protection Mechanisms</h3>
              <p>
                At {site}, we empower our community with industry-grade self-regulation tools accessible directly from your profile:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Custom Daily, Weekly, & Monthly Deposit Limits:</strong> Set strict ceilings on total deposits within any chosen period.</li>
                <li><strong>Session Time Alerts & Reality Checks:</strong> Automatic notification reminders regarding active duration and net spend.</li>
                <li><strong>Cooling-Off Timeouts:</strong> Temporary lockouts ranging from 24 hours to 30 calendar days.</li>
                <li><strong>Voluntary Self-Exclusion:</strong> Complete multi-month or permanent restriction from accessing any games or marketing materials.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">2. Self-Assessment Diagnostic</h3>
              <p className="text-sm">
                If you answer affirmatively to three or more of the questions below, please contact our 24/7 Player Safety Desk:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                <li>Do you chase after past losses in an effort to break even?</li>
                <li>Has gambling caused friction, disputes, or neglect in personal relationships?</li>
                <li>Do you gamble to escape stress, depression, or boredom?</li>
                <li>Have you ever borrowed funds or liquidated possessions to finance wagers?</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">3. Independent Support Resources</h3>
              <p className="text-sm">
                If you or someone close to you requires confidential professional counseling, we recommend the following certified organizations:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="font-bold text-sm text-slate-900">BeGambleAware</div>
                  <div className="text-xs text-slate-500">www.begambleaware.org</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="font-bold text-sm text-slate-900">GamCare Helpline</div>
                  <div className="text-xs text-slate-500">Free 24/7: 0808 8020 133</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="font-bold text-sm text-slate-900">Gambling Therapy</div>
                  <div className="text-xs text-slate-500">Multilingual global support</div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <span>{site} Regulatory Compliance & AML Policy</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Anti-Money Laundering (AML), Fair Gaming Certification, and International Standards.</p>
            </div>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">1. Anti-Money Laundering (AML) Protocols</h3>
              <p className="text-sm">
                {site} adheres strictly to the guidelines set forth by the Financial Action Task Force (FATF).
                All financial transfers are subject to automated behavioral anomaly tracking and real-time screening against global sanction lists (OFAC, Interpol, and PEP registers).
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">2. Customer Due Diligence (CDD / KYC)</h3>
              <p className="text-sm">
                To guarantee safe, fraud-free transactions, {site} enforces tiered Know Your Customer (KYC) identity verifications:
              </p>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong>Tier 1 (Standard):</strong> Verified Email & Phone confirmation. Daily limits up to $2,000.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong>Tier 2 (Enhanced):</strong> Government-issued Photo ID (Passport / National ID / Driving License). Withdrawals up to $25,000.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong>Tier 3 (VIP High Roller):</strong> Proof of Address (utility bill issued within 90 days) & Source of Wealth documentation for limitless gaming.
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">3. Provably Fair RNG Certification</h3>
              <p className="text-sm">
                Every game hosted on {site} utilizes certified Random Number Generator (RNG) algorithms audited and validated by independent accredited laboratories (eCOGRA, iTech Labs, BMM Testlabs).
                Payout Return to Player (RTP) figures published across all 200+ games match actual statistical outputs over millions of spins.
              </p>
            </section>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <Lock className="w-6 h-6 text-indigo-600" />
                <span>{site} Privacy Note & Data Protection</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">How we securely collect, encrypt, and handle your sensitive personal information.</p>
            </div>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">1. Information We Collect</h3>
              <p className="text-sm">
                When you create an account, deposit, or engage with games on {site}, we securely gather:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Account identifiers: Name, email address, date of birth, and unique username.</li>
                <li>Financial telemetry: Transaction hashes, wallet public addresses, and banking transaction references.</li>
                <li>Technical diagnostics: IP address, device fingerprints, operating system, and geolocation signals to prevent unauthorized account takeovers.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">2. Military-Grade 256-Bit SSL Encryption</h3>
              <p className="text-sm">
                All transmissions between your web browser and the {site} cloud infrastructure are protected using Transport Layer Security (TLS 1.3) with 256-bit AES encryption.
                Sensitive credentials are never stored in plaintext and undergo salted bcrypt cryptographic hashing.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">3. Third-Party Non-Disclosure Guarantee</h3>
              <p className="text-sm">
                {site} maintains a zero-tolerance policy against selling, renting, or trading player information to third-party advertisers.
                Data is shared strictly with approved payment gateways and regulatory authorities where compelled by applicable law.
              </p>
            </section>
          </div>
        );

      case 'underage':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <UserCheck className="w-6 h-6 text-rose-600" />
                <span>{site} Underage Gaming Policy (Strictly 18+)</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Zero-tolerance policy regarding minor participation in real-money wagering.</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black text-xl flex items-center justify-center shrink-0">
                18+
              </div>
              <p className="text-xs text-rose-900 font-medium">
                Participation by persons under the age of 18 (or the legal age of majority in your specific jurisdiction) is strictly unlawful.
                Any accounts discovered belonging to minors will be terminated immediately, with all balances forfeited.
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">1. Verification Checkpoints</h3>
              <p className="text-sm">
                {site} enforces age validation algorithms during sign-up, first deposit, and all withdrawal submissions.
                Random age audits may require instant photo identification upload prior to continuation of play.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">2. Parental Control Recommendations</h3>
              <p className="text-sm">
                If you share internet devices with children or minors in your household, we urge you to deploy parental filtering software:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Net Nanny:</strong> Filtering and blocking software tailored for gaming safety (www.netnanny.com).</li>
                <li><strong>CYBERsitter:</strong> Customizable family internet restrictions (www.cybersitter.com).</li>
                <li><strong>GamBlock:</strong> Dedicated software that completely blocks access to gambling websites across all devices.</li>
              </ul>
            </section>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>{site} Terms & Conditions of Service</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Binding agreement governing your access and use of the platform.</p>
            </div>

            <section className="space-y-2 text-sm">
              <h3 className="text-base font-bold text-slate-900">1. Account Eligibility & One-Account Rule</h3>
              <p>
                Each player is permitted exactly one registered account on {site}. Creating duplicate or multi-accounting schemes to exploit bonuses or manipulate referral tiers will result in immediate permanent banning and confiscation of promotional proceeds.
              </p>
            </section>

            <section className="space-y-2 text-sm">
              <h3 className="text-base font-bold text-slate-900">2. Promotional & Bonus Wagering Requirements</h3>
              <p>
                Promotional credits, deposit matches, and free spin awards are subject to specified turnover conditions (e.g. 15x rollover) before becoming eligible for withdrawal, unless expressly categorized as "No-Wager Cashback".
              </p>
            </section>

            <section className="space-y-2 text-sm">
              <h3 className="text-base font-bold text-slate-900">3. Prohibited Practices & Bot Detection</h3>
              <p>
                The use of automated robotic scripts, AI betting bots, coordinated group syndicates, or exploiting platform latency anomalies is strictly prohibited and constitutes grounds for immediate disqualification.
              </p>
            </section>
          </div>
        );

      case 'banking-assistance':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-emerald-600" />
                <span>{site} Banking & Payment Assistance</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Overview of supported payment rails, transfer speeds, and zero-fee policies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="font-black text-slate-900 text-base mb-1">🪙 Crypto (USDT TRC20 / ERC20)</div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Processing Time: 1 to 5 Minutes</div>
                  <div>• Minimum Deposit: $10</div>
                  <div>• Deposit Fee: 0% Free (+5% Bonus)</div>
                  <div>• Security: Non-custodial direct blockchain transfer</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="font-black text-slate-900 text-base mb-1">⚡ Instant UPI & QR Pay</div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Processing Time: Instant (30 Seconds)</div>
                  <div>• Apps: GPay, PhonePe, Paytm, BHIM</div>
                  <div>• Deposit Fee: 0% Free (+3% Bonus)</div>
                  <div>• Minimum Deposit: $10 (₹500)</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="font-black text-slate-900 text-base mb-1">🏦 Bank Wire / IMPS / NEFT</div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Processing Time: 5 to 15 Minutes</div>
                  <div>• Limit: Up to $50,000 per transaction</div>
                  <div>• Deposit Fee: 0% Free</div>
                  <div>• Dedicated account numbers generated per user</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="font-black text-slate-900 text-base mb-1">💳 Visa & Mastercard / Debit</div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Processing Time: Real-time authorization</div>
                  <div>• Protection: 3D Secure 2.0 OTP verification</div>
                  <div>• Currency: Auto-conversion to USD</div>
                  <div>• Instant balance crediting</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'how-to-deposit':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <ArrowDownCircle className="w-6 h-6 text-emerald-600" />
                <span>How to Deposit Money on {site}</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Simple 3-step illustrated walkthrough to fund your gaming wallet.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Click the Deposit Button & Select Method</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Tap the green <strong>"Deposit"</strong> button on the header navigation. Choose your preferred method: USDT TRC-20, UPI FastPay, or Bank Wire.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Scan QR Code or Copy Official Address</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    The {site} deposit window displays the dynamic, real-time address or QR code configured by Administration. Copy the exact address or scan directly with your wallet app (Binance, TrustWallet, PhonePe, GPay).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Confirm & Enter Transaction Hash / UTR</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Paste your transaction reference or hash into the confirmation box and click <strong>"Submit Deposit"</strong>. Funds and applicable deposit bonuses are credited to your real wallet within 60 seconds!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveModal('deposit')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black rounded-xl shadow-lg hover:from-emerald-500 hover:to-green-500"
              >
                Go to Deposit Portal Now →
              </button>
            </div>
          </div>
        );

      case 'how-to-withdraw':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <ArrowUpCircle className="w-6 h-6 text-blue-600" />
                <span>How to Withdraw Money from {site}</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Fast, guaranteed payouts 24/7 directly to your bank account or crypto wallet.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Open Profile & Select "Withdraw" Tab</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Navigate to your Customer Profile by clicking your balance or profile avatar, then switch to the <strong>"Withdraw"</strong> tab.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Enter Amount and Payout Destination</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Choose whether you wish to receive payout in USDT (TRC-20 / ERC-20) or direct Local Bank Transfer. Input your Bank Account Number & IFSC/SWIFT or your crypto address.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Instant Admin Verification & Payout Dispatch</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Our automated finance desk reviews and approves withdrawals in under 15 minutes around the clock. Track status live in your profile transaction history!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveModal('profile')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-500"
              >
                Open My Profile & Withdrawals →
              </button>
            </div>
          </div>
        );

      case 'faqs':
        const faqs = [
          {
            q: `Is ${site} licensed and safe to play?`,
            a: `${site} operates under an official international interactive gaming license, with provably fair RNG gaming certification and 256-bit military grade SSL encryption for all player transactions and data.`
          },
          {
            q: 'How fast are deposits credited to my balance?',
            a: 'Crypto deposits (USDT TRC20/ERC20) credit automatically in 1 to 3 minutes upon blockchain confirmation. UPI and Instant Bank Transfers are processed in 30 to 60 seconds.'
          },
          {
            q: 'How long does a withdrawal take to hit my bank or wallet?',
            a: 'Approved withdrawals are dispatched within 5 to 15 minutes. Crypto payouts arrive as soon as the network block is validated, and bank transfers reflect promptly according to regional clearing cycles.'
          },
          {
            q: 'What is the minimum deposit and withdrawal limit?',
            a: `The standard minimum deposit is $10 (or local equivalent). Minimum withdrawal is $20, with high roller VIP tier limits extending up to $100,000 per daily transaction.`
          },
          {
            q: 'How does the Referral and Affiliate program work?',
            a: `Every player receives a personal referral link in their Customer Profile. When your friends register and wager, you automatically earn lifetime revenue commissions ranging from 15% up to 35%, paid daily in real cash!`
          },
          {
            q: 'Can I play games in demo mode or only real money?',
            a: `You can practice and explore the gameplay mechanics of all 200+ 3D games freely or wager real cash to win instant withdrawable funds.`
          }
        ];

        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-amber-500" />
                <span>Frequently Asked Questions (FAQ)</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Instant answers to top questions regarding gaming, banking, and security.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((f, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50"
                >
                  <button
                    onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                    className="w-full p-4 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <span>{f.q}</span>
                    {faqOpen === idx ? (
                      <ChevronUp className="w-5 h-5 text-amber-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {faqOpen === idx && (
                    <div className="p-4 bg-white text-sm text-slate-600 border-t border-slate-200 leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'vision':
        return (
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <Eye className="w-6 h-6 text-amber-500" />
                <span>The {site} Global Vision & Mission</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Pioneering the next generation of 3D immersive entertainment and provably fair wealth generation.</p>
            </div>

            <div className="relative p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-xl overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-xs font-black uppercase tracking-widest bg-slate-950/20 px-3 py-1 rounded-full">
                  EXECUTIVE VISION STATEMENT
                </span>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                  "To build the world’s most transparent, thrilling, and player-centric digital gaming ecosystem."
                </h3>
              </div>
            </div>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">1. Our Core Pillars</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="text-2xl">⚡</div>
                  <div className="font-bold text-slate-900">Frictionless Payouts</div>
                  <div className="text-xs text-slate-600">
                    We believe players deserve their winnings instantaneously. Zero delays, zero hidden processing penalties.
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="text-2xl">🎲</div>
                  <div className="font-bold text-slate-900">Provable Fairness</div>
                  <div className="text-xs text-slate-600">
                    RNG mathematical transparency backed by immutable cryptographic proofs across all live and virtual games.
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="text-2xl">🌟</div>
                  <div className="font-bold text-slate-900">3D Immersive Innovation</div>
                  <div className="text-xs text-slate-600">
                    Pushing the boundaries of web graphics with high-fidelity 3D engines, spatial audio, and interactive physics.
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">2. Long-Term Roadmap</h3>
              <p className="text-sm">
                As {site} scales globally, our technology roadmap includes decentralized cross-chain wagering, mobile app rollout with native push telemetry, VIP luxury concierge travel rewards, and proprietary live dealer studio broadcasts.
              </p>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm sticky top-24 space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Legal & Information
            </div>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activePolicy === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePolicy(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all text-left ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-102 font-black'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm min-h-[600px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
