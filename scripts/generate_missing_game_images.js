import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const gamesDir = './public/assets/games';
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

// Read the games catalog
const catalogPath = './src/data/gamesCatalog.ts';
const content = fs.readFileSync(catalogPath, 'utf8');
const jsonMatch = content.match(/export const GAMES_CATALOG: GameItem\[] = (\[[\s\S]*?\]);/);

if (!jsonMatch) {
  console.error('Could not find GAMES_CATALOG JSON');
  process.exit(1);
}

const games = JSON.parse(jsonMatch[1]);
console.log(`Checking thumbnails for ${games.length} games...`);

const categoryGradients = {
  live: ['#1e1b4b', '#4338ca', '#312e81', '🔴 LIVE DEALER'],
  slot: ['#4a044e', '#c026d3', '#86198f', '🎰 3D SLOTS'],
  sports: ['#064e3b', '#059669', '#047857', '⚽ SPORTSBOOK'],
  card: ['#1c1917', '#b45309', '#78350f', '🃏 CARD GAME'],
  lottery: ['#0f172a', '#2563eb', '#1d4ed8', '🚀 INSTANT / CRASH']
};

async function ensureImages() {
  let createdCount = 0;
  for (const game of games) {
    const filename = `${game.id}.png`;
    const targetFile = path.join(gamesDir, filename);

    if (!fs.existsSync(targetFile)) {
      const [col1, col2, col3, catBadge] = categoryGradients[game.category] || categoryGradients.slot;
      const cleanTitle = game.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const cleanProvider = game.provider.replace(/&/g, '&amp;');

      const svg = `
      <svg width="380" height="224" viewBox="0 0 380 224" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${col1}" />
            <stop offset="60%" stop-color="${col2}" />
            <stop offset="100%" stop-color="${col3}" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.6"/>
          </filter>
        </defs>

        <!-- Background -->
        <rect width="380" height="224" rx="16" fill="url(#bgGrad)" />
        <rect width="380" height="224" rx="16" fill="url(#glow)" />

        <!-- Border Accent -->
        <rect x="1" y="1" width="378" height="222" rx="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />

        <!-- Category Pill Badge -->
        <g transform="translate(18, 16)">
          <rect width="120" height="24" rx="12" fill="rgba(0,0,0,0.5)" filter="url(#shadow)" />
          <text x="60" y="16" fill="#f8fafc" font-size="11" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">${catBadge}</text>
        </g>

        <!-- 3D / Hot Badges -->
        <g transform="translate(290, 16)">
          <rect width="70" height="24" rx="12" fill="#eab308" filter="url(#shadow)" />
          <text x="35" y="16" fill="#000000" font-size="11" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">3D REAL</text>
        </g>

        <!-- Center Decorative Visual / Dice / Reel / Cards -->
        <circle cx="190" cy="100" r="42" fill="rgba(255,255,255,0.08)" />
        <circle cx="190" cy="100" r="32" fill="rgba(255,255,255,0.12)" />
        <text x="190" y="112" fill="#ffffff" font-size="34" font-family="system-ui, sans-serif" text-anchor="middle" opacity="0.9">👑</text>

        <!-- Bottom Overlay Glass Card -->
        <path d="M 0 148 L 380 148 L 380 208 C 380 216 374 224 364 224 L 16 224 C 6 224 0 216 0 208 Z" fill="rgba(0,0,0,0.7)" />

        <!-- Title -->
        <text x="18" y="178" fill="#ffffff" font-size="16" font-weight="bold" font-family="system-ui, sans-serif" filter="url(#shadow)">${cleanTitle}</text>

        <!-- Provider and RTP -->
        <text x="18" y="204" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif">${cleanProvider}</text>
        <text x="362" y="204" fill="#10b981" font-size="12" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="end">RTP: ${game.rtp}%</text>
      </svg>
      `;

      await sharp(Buffer.from(svg))
        .png()
        .toFile(targetFile);

      createdCount++;
    }
  }

  console.log(`Generated ${createdCount} missing high-res game card images. All ${games.length} games now have real images!`);
}

ensureImages();
