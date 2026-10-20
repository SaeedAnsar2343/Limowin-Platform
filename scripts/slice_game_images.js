import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = './public/assets/games';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sliceGrids() {
  // 1. Live Casino grid: 1024x587 -> 5 cols, 4 rows
  // Grid region: roughly y: 55 to 540, x: 22 to 1002
  const liveGrid = './public/assets/reference/media_1792530578723_d7c1c15a.png';
  const liveNames = [
    'ae-dragontiger', 'ae-baccarat-classic', 'ezugi-ott-andar-bahar', 'ae-roulette', 'ae-sicbo',
    'ae-baccarat-insurance', 'ae-red-blue-duel', 'ae-baccarat-pro', 'ae-baccarat-vip', 'ae-baccarat-speed',
    'ae-dragontiger-2', 'ae-sicbo-2', 'ae-roulette-vip', 'ezugi-ez-live', 'ezugi-gold-blackjack-5',
    'ezugi-italian-roulette', 'ezugi-casino-holdem', 'ezugi-baccarat', 'ezugi-sic-bo', 'ezugi-bet-on-numbers-hd'
  ];

  const liveStartX = 20;
  const liveStartY = 58;
  const liveCardW = 190;
  const liveCardH = 112;
  const liveGapX = 8;
  const liveGapY = 10;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      const left = Math.round(liveStartX + c * (liveCardW + liveGapX));
      const top = Math.round(liveStartY + r * (liveCardH + liveGapY));
      const name = liveNames[idx] || `live-game-${idx}`;
      try {
        await sharp(liveGrid)
          .extract({ left: Math.min(left, 1024 - liveCardW), top: Math.min(top, 587 - liveCardH), width: liveCardW, height: liveCardH })
          .toFile(path.join(outDir, `${name}.png`));
      } catch (err) {
        console.error(`Error slicing live ${name}:`, err.message);
      }
    }
  }

  // 2. Slots grid: 1024x592 -> 5 cols, 4 rows
  const slotGrid = './public/assets/reference/media_1792530644925_fb9c769b.png';
  const slotNames = [
    'winning-mask-ii', 'piggy-bank', 'koi-trio', 'magic-ace-wild-lock', 'blossom-of-wealth',
    'fruity-bonanza', 'trump-card', 'fruity-bonanza-combo', 'treasure-bowl-x-huge', 'lucky-diamond',
    'fortune-jewel', 'dragon-soar-hyper-wild', 'magic-ace', 'money-tree-hyper-wild', 'gold-rooster-lottery',
    'fushen-coming', 'infinity-rings', 'wingo', 'lucky-scratch', 'k3-lottery'
  ];

  const slotStartX = 20;
  const slotStartY = 64;
  const slotCardW = 190;
  const slotCardH = 112;
  const slotGapX = 8;
  const slotGapY = 10;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      const left = Math.round(slotStartX + c * (slotCardW + slotGapX));
      const top = Math.round(slotStartY + r * (slotCardH + slotGapY));
      const name = slotNames[idx] || `slot-game-${idx}`;
      try {
        await sharp(slotGrid)
          .extract({ left: Math.min(left, 1024 - slotCardW), top: Math.min(top, 592 - slotCardH), width: slotCardW, height: slotCardH })
          .toFile(path.join(outDir, `${name}.png`));
      } catch (err) {
        console.error(`Error slicing slot ${name}:`, err.message);
      }
    }
  }

  // 3. Sports grid: 1024x478 -> 3 cols, 2 rows
  const sportsGrid = './public/assets/reference/media_1792530659127_027f4bcf.png';
  const sportsNames = [
    '9wickets', 'bti-sports', 'soul-exchange',
    'saba-sports', 'awc-trc-horse-racing', 'awc-sv388-cockfight'
  ];
  const sportsStartX = 20;
  const sportsStartY = 75;
  const sportsCardW = 320;
  const sportsCardH = 175;
  const sportsGapX = 14;
  const sportsGapY = 20;

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const left = Math.round(sportsStartX + c * (sportsCardW + sportsGapX));
      const top = Math.round(sportsStartY + r * (sportsCardH + sportsGapY));
      const name = sportsNames[idx] || `sports-${idx}`;
      try {
        await sharp(sportsGrid)
          .extract({ left: Math.min(left, 1024 - sportsCardW), top: Math.min(top, 478 - sportsCardH), width: sportsCardW, height: sportsCardH })
          .toFile(path.join(outDir, `${name}.png`));
      } catch (err) {
        console.error(`Error slicing sports ${name}:`, err.message);
      }
    }
  }

  // 4. Cardgames grid: 1024x664 -> 5 cols, 4 rows
  const cardGrid = './public/assets/reference/media_1792530673587_663b96b6.jpg';
  const cardNames = [
    'newjl-card', 'andar-bahar', '7-up-7-down', 'poker-roulette', 'coin-toss',
    'triple-chance', 'sic-bo', 'thai-hi-lo-2', '32-cards', 'colour-game',
    'speedy-andar-bahar', 'tai-xiu', '7-up-7-down-rush', 'thai-fish-prawn-crab', 'european-roulette',
    'fish-prawn-crab-2', 'dragon-tiger-2', 'bonus-dice', 'burmese-6-animals', 'dragon-tiger-classic'
  ];
  const cardStartX = 20;
  const cardStartY = 100;
  const cardCardW = 190;
  const cardCardH = 118;
  const cardGapX = 8;
  const cardGapY = 12;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      const left = Math.round(cardStartX + c * (cardCardW + cardGapX));
      const top = Math.round(cardStartY + r * (cardCardH + cardGapY));
      const name = cardNames[idx] || `card-game-${idx}`;
      try {
        await sharp(cardGrid)
          .extract({ left: Math.min(left, 1024 - cardCardW), top: Math.min(top, 664 - cardCardH), width: cardCardW, height: cardCardH })
          .toFile(path.join(outDir, `${name}.png`));
      } catch (err) {
        console.error(`Error slicing card ${name}:`, err.message);
      }
    }
  }

  console.log('All slices successfully generated in', outDir);
}

sliceGrids();
