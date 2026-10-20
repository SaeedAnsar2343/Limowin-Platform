import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const bannersDir = './public/assets/banners';
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true });
}

const bannerDefs = [
  {
    filename: 'welcome-bonus.png',
    badge: 'EXCLUSIVE NEW MEMBER OFFER',
    badgeBg: '#eab308',
    badgeText: '#000000',
    title: '200% FIRST DEPOSIT BONUS',
    subtitle: 'Claim up to $2,500 + 200 Free Spins on Top 3D Slots and Live Tables',
    btnText: 'Claim Bonus Now',
    gradStart: '#1e1b4b',
    gradMid: '#3730a3',
    gradEnd: '#0f172a',
    accent: '#fbbf24',
    emoji: '🎰'
  },
  {
    filename: 'vip-cashback.png',
    badge: 'UNLIMITED WEEKLY REWARDS',
    badgeBg: '#10b981',
    badgeText: '#ffffff',
    title: '15% REAL CASHBACK EVERY MONDAY',
    subtitle: 'Zero wagering requirements. Instant payout directly to your real wallet.',
    btnText: 'Explore VIP Club',
    gradStart: '#064e3b',
    gradMid: '#047857',
    gradEnd: '#022c22',
    accent: '#34d399',
    emoji: '💎'
  },
  {
    filename: 'sports-accumulator.png',
    badge: 'CRICKET and FOOTBALL ARENA',
    badgeBg: '#3b82f6',
    badgeText: '#ffffff',
    title: 'SPORTS 100% COMBO ACCUMULATOR BOOST',
    subtitle: 'Bet on IPL, EPL, UEFA Champions League and T20 with guaranteed highest industry odds.',
    btnText: 'Bet On Sports',
    gradStart: '#172554',
    gradMid: '#1e40af',
    gradEnd: '#0f172a',
    accent: '#60a5fa',
    emoji: '🏏'
  },
  {
    filename: 'crypto-deposit.png',
    badge: 'INSTANT ZERO FEE BANKING',
    badgeBg: '#8b5cf6',
    badgeText: '#ffffff',
    title: 'CRYPTO and UPI INSTANT DEPOSIT + 5% EXTRA',
    subtitle: 'Fast 60-second automatic deposits with USDT TRC20, ERC20, UPI and Instant Bank Transfer.',
    btnText: 'Deposit Now',
    gradStart: '#3b0764',
    gradMid: '#581c87',
    gradEnd: '#1e1b4b',
    accent: '#c084fc',
    emoji: '⚡'
  },
  {
    filename: 'referral-affiliate.png',
    badge: 'PARTNERSHIP PROGRAM',
    badgeBg: '#f97316',
    badgeText: '#ffffff',
    title: 'EARN LIFETIME 30% REVENUE SHARE',
    subtitle: 'Share your personal referral link. Earn passive commission every time your friends play.',
    btnText: 'Get Referral Link',
    gradStart: '#451a03',
    gradMid: '#7c2d12',
    gradEnd: '#1c1917',
    accent: '#fb923c',
    emoji: '🤝'
  }
];

async function generateBanners() {
  for (const b of bannerDefs) {
    const svg = `
    <svg width="1200" height="360" viewBox="0 0 1200 360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg_${b.filename.replace('.png','')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${b.gradStart}" />
          <stop offset="50%" stop-color="${b.gradMid}" />
          <stop offset="100%" stop-color="${b.gradEnd}" />
        </linearGradient>
        <radialGradient id="sunburst_${b.filename.replace('.png','')}" cx="80%" cy="50%" r="60%">
          <stop offset="0%" stop-color="${b.accent}" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="360" rx="20" fill="url(#bg_${b.filename.replace('.png','')})" />
      <rect width="1200" height="360" rx="20" fill="url(#sunburst_${b.filename.replace('.png','')})" />
      <rect x="2" y="2" width="1196" height="356" rx="19" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

      <!-- Decorative circles -->
      <circle cx="1020" cy="180" r="140" fill="rgba(255,255,255,0.04)" />
      <circle cx="1020" cy="180" r="90" fill="rgba(255,255,255,0.06)" />
      <text x="1020" y="220" font-size="120" text-anchor="middle" opacity="0.9">${b.emoji}</text>

      <!-- Badge -->
      <g transform="translate(60, 48)">
        <rect width="250" height="32" rx="16" fill="${b.badgeBg}" />
        <text x="125" y="21" fill="${b.badgeText}" font-size="13" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">${b.badge}</text>
      </g>

      <!-- Main Headline -->
      <text x="60" y="145" fill="#ffffff" font-size="40" font-weight="900" font-family="system-ui, sans-serif">${b.title}</text>

      <!-- Subtitle -->
      <text x="60" y="195" fill="#cbd5e1" font-size="20" font-family="system-ui, sans-serif" font-weight="400">${b.subtitle}</text>

      <!-- CTA Button visual -->
      <g transform="translate(60, 245)">
        <rect width="220" height="52" rx="26" fill="${b.accent}" />
        <text x="110" y="32" fill="#0f172a" font-size="16" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">${b.btnText}</text>
      </g>

      <!-- Trust Badges -->
      <g transform="translate(320, 260)">
        <text x="0" y="20" fill="#94a3b8" font-size="14" font-family="system-ui, sans-serif">Licensed and Verified | Instant Payouts | 256-Bit SSL</text>
      </g>
    </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(bannersDir, b.filename));
  }
  console.log('All 5 promotional banners generated successfully!');
}

generateBanners();
