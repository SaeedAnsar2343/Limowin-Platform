import fs from 'fs';

// Generate 210 games
const rawGames = [
  // --- LIVE CASINO (40) ---
  { id: 'ae-dragontiger', title: 'AE-DragonTiger', category: 'live', provider: 'AE Sexy', rtp: 96.5, minBet: 10, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'ae-baccarat-classic', title: 'AE-Baccarat Classic', category: 'live', provider: 'AE Sexy', rtp: 98.9, minBet: 10, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.1 },
  { id: 'ezugi-ott-andar-bahar', title: 'Ezugi-OTT Andar Bahar', category: 'live', provider: 'Ezugi', rtp: 97.8, minBet: 10, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'ae-roulette', title: 'AE-Roulette', category: 'live', provider: 'AE Sexy', rtp: 97.3, minBet: 10, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'ae-sicbo', title: 'AE-SicBo', category: 'live', provider: 'AE Sexy', rtp: 97.2, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.15 },
  { id: 'ae-baccarat-insurance', title: 'AE-Baccarat Insurance', category: 'live', provider: 'AE Sexy', rtp: 98.7, minBet: 20, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'ae-red-blue-duel', title: 'AE-Red Blue Duel', category: 'live', provider: 'AE Sexy', rtp: 96.8, minBet: 10, maxBet: 15000, isHot: false, is3D: true, bonusMultiplier: 1.1 },
  { id: 'ae-baccarat-pro', title: 'AE-Baccarat Pro', category: 'live', provider: 'AE Sexy', rtp: 98.9, minBet: 50, maxBet: 100000, isHot: true, is3D: true, bonusMultiplier: 1.5 },
  { id: 'ae-baccarat-vip', title: 'AE-Baccarat VIP Lounge', category: 'live', provider: 'AE Sexy', rtp: 98.9, minBet: 100, maxBet: 200000, isHot: false, is3D: true, bonusMultiplier: 1.4 },
  { id: 'ae-baccarat-speed', title: 'AE-Speed Baccarat', category: 'live', provider: 'AE Sexy', rtp: 98.8, minBet: 10, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'ae-dragontiger-2', title: 'AE-Dragon Tiger Supreme', category: 'live', provider: 'AE Sexy', rtp: 96.5, minBet: 10, maxBet: 25000, isHot: false, is3D: true, bonusMultiplier: 1.1 },
  { id: 'ae-sicbo-2', title: 'AE-SicBo Lightning', category: 'live', provider: 'AE Sexy', rtp: 97.5, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'ae-roulette-vip', title: 'AE-Roulette French VIP', category: 'live', provider: 'AE Sexy', rtp: 98.6, minBet: 50, maxBet: 50000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'ezugi-ez-live', title: 'Ezugi-EZ LIVE Table', category: 'live', provider: 'Ezugi', rtp: 99.2, minBet: 10, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'ezugi-gold-blackjack-5', title: 'Ezugi-Gold Blackjack 5', category: 'live', provider: 'Ezugi', rtp: 99.4, minBet: 50, maxBet: 75000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'ezugi-italian-roulette', title: 'Ezugi-Italian Roulette', category: 'live', provider: 'Ezugi', rtp: 97.3, minBet: 10, maxBet: 40000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'ezugi-casino-holdem', title: 'Ezugi-Casino Holdem', category: 'live', provider: 'Ezugi', rtp: 97.8, minBet: 20, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'ezugi-baccarat', title: 'Ezugi-Baccarat Super 6', category: 'live', provider: 'Ezugi', rtp: 98.9, minBet: 10, maxBet: 60000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'ezugi-sic-bo', title: 'Ezugi-Sic Bo Golden Bowl', category: 'live', provider: 'Ezugi', rtp: 97.2, minBet: 10, maxBet: 20000, isHot: false, is3D: true, bonusMultiplier: 1.1 },
  { id: 'ezugi-bet-on-numbers-hd', title: 'Ezugi-Bet On Numbers HD', category: 'live', provider: 'Ezugi', rtp: 96.0, minBet: 10, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'lightning-roulette-3d', title: 'Lightning Roulette 500x', category: 'live', provider: 'Evolution', rtp: 97.3, minBet: 10, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.5 },
  { id: 'crazy-time-3d', title: 'Crazy Time 3D Wheel', category: 'live', provider: 'Evolution', rtp: 96.1, minBet: 10, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.5 },
  { id: 'monopoly-live-3d', title: 'Monopoly Live 3D Board', category: 'live', provider: 'Evolution', rtp: 96.2, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'mega-ball-100x', title: 'Mega Ball 100x Multiplier', category: 'live', provider: 'Evolution', rtp: 95.4, minBet: 10, maxBet: 15000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'speed-baccarat-a', title: 'Speed Baccarat Gold A', category: 'live', provider: 'Evolution', rtp: 98.9, minBet: 20, maxBet: 80000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'speed-baccarat-b', title: 'Speed Baccarat Diamond B', category: 'live', provider: 'Evolution', rtp: 98.9, minBet: 20, maxBet: 80000, isHot: false, is3D: true, bonusMultiplier: 1.1 },
  { id: 'vip-platinum-blackjack', title: 'VIP Platinum Blackjack Salon', category: 'live', provider: 'Evolution', rtp: 99.5, minBet: 200, maxBet: 300000, isHot: true, is3D: true, bonusMultiplier: 1.6 },
  { id: 'salon-prive-roulette', title: 'Salon Privé French Roulette', category: 'live', provider: 'Evolution', rtp: 98.6, minBet: 500, maxBet: 500000, isHot: false, is3D: true, bonusMultiplier: 1.8 },
  { id: 'dragon-tiger-live-studio', title: 'Dragon Tiger Live Studio', category: 'live', provider: 'Evolution', rtp: 96.3, minBet: 10, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'super-andar-bahar-live', title: 'Super Andar Bahar 4000x', category: 'live', provider: 'Evolution', rtp: 97.8, minBet: 10, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'teen-patti-live-express', title: 'Teen Patti Live Express', category: 'live', provider: 'Ezugi', rtp: 97.4, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'one-blackjack-pragmatic', title: 'ONE Blackjack Azure', category: 'live', provider: 'Pragmatic Live', rtp: 99.3, minBet: 10, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'peek-baccarat-live', title: 'Peek Baccarat High Roller', category: 'live', provider: 'Evolution', rtp: 98.8, minBet: 50, maxBet: 100000, isHot: false, is3D: true, bonusMultiplier: 1.3 },
  { id: 'cash-or-crash-live', title: 'Cash or Crash 50,000x', category: 'live', provider: 'Evolution', rtp: 99.6, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.5 },
  { id: 'football-studio-dice', title: 'Football Studio Dice Live', category: 'live', provider: 'Evolution', rtp: 97.7, minBet: 10, maxBet: 15000, isHot: false, is3D: true, bonusMultiplier: 1.1 },
  { id: 'fan-tan-live-3d', title: 'Fan Tan Ancient Beads Live', category: 'live', provider: 'Evolution', rtp: 98.7, minBet: 10, maxBet: 20000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'bac-bo-live-dice', title: 'Bac Bo Live Dice Baccarat', category: 'live', provider: 'Evolution', rtp: 98.8, minBet: 10, maxBet: 35000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'golden-wealth-baccarat', title: 'Golden Wealth Baccarat Pot', category: 'live', provider: 'Evolution', rtp: 98.8, minBet: 10, maxBet: 40000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'lightning-dice-1000x', title: 'Lightning Dice 1000x Tower', category: 'live', provider: 'Evolution', rtp: 96.6, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'mega-sic-bo-deluxe', title: 'Mega Sic Bo 1000x Multipliers', category: 'live', provider: 'Pragmatic Live', rtp: 97.2, minBet: 10, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.3 },

  // --- SLOTS (65) ---
  { id: 'winning-mask-ii', title: 'Winning Mask II', category: 'slot', provider: 'Dragoon Soft', rtp: 96.8, minBet: 1, maxBet: 5000, isHot: true, is3D: true, bonusMultiplier: 1.25, buyFeature: true },
  { id: 'piggy-bank', title: 'Piggy Bank Smash', category: 'slot', provider: 'Dragoon Soft', rtp: 96.5, minBet: 1, maxBet: 5000, isHot: true, is3D: true, bonusMultiplier: 1.2, buyFeature: true },
  { id: 'koi-trio', title: 'Koi Trio Fortune', category: 'slot', provider: 'JILI', rtp: 97.1, minBet: 1, maxBet: 8000, isHot: true, is3D: true, bonusMultiplier: 1.3, buyFeature: true },
  { id: 'magic-ace-wild-lock', title: 'Magic Ace WILD LOCK', category: 'slot', provider: 'JILI', rtp: 97.0, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.4, buyFeature: true },
  { id: 'blossom-of-wealth', title: 'Blossom of Wealth', category: 'slot', provider: 'Dragoon Soft', rtp: 96.7, minBet: 1, maxBet: 6000, isHot: true, is3D: true, bonusMultiplier: 1.2, buyFeature: true },
  { id: 'fruity-bonanza', title: 'Fruity Bonanza', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 12000, isHot: true, is3D: true, bonusMultiplier: 1.35, buyFeature: true },
  { id: 'trump-card', title: 'Trump Card Hustler', category: 'slot', provider: 'JILI', rtp: 96.4, minBet: 1, maxBet: 5000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'fruity-bonanza-combo', title: 'Fruity Bonanza Combo', category: 'slot', provider: 'Pragmatic Play', rtp: 96.6, minBet: 1, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.4, buyFeature: true },
  { id: 'treasure-bowl-x-huge', title: 'Treasure Bowl X-Huge', category: 'slot', provider: 'JILI', rtp: 97.2, minBet: 2, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.45, buyFeature: true },
  { id: 'lucky-diamond', title: 'Lucky Diamond Deluxe', category: 'slot', provider: 'Dragoon Soft', rtp: 96.3, minBet: 1, maxBet: 5000, isHot: false, is3D: true, bonusMultiplier: 1.1 },
  { id: 'fortune-jewel', title: 'Fortune Jewel Empress', category: 'slot', provider: 'JILI', rtp: 96.9, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'dragon-soar-hyper-wild', title: 'Dragon Soar - Hyper Wild X10', category: 'slot', provider: 'JILI', rtp: 97.4, minBet: 2, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.5, buyFeature: true },
  { id: 'magic-ace', title: 'Magic Ace Original', category: 'slot', provider: 'JILI', rtp: 97.0, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3, buyFeature: true },
  { id: 'money-tree-hyper-wild', title: 'Money Tree - Hyper Wild', category: 'slot', provider: 'JILI', rtp: 96.8, minBet: 1, maxBet: 8000, isHot: true, is3D: true, bonusMultiplier: 1.25, buyFeature: true },
  { id: 'fushen-coming', title: 'Fushen Coming - Dragoon Soft', category: 'slot', provider: 'Dragoon Soft', rtp: 96.9, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'infinity-rings', title: 'Infinity Rings 200x', category: 'slot', provider: 'JILI', rtp: 97.1, minBet: 1, maxBet: 12000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'sweet-bonanza-1000', title: 'Sweet Bonanza 1000', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.5, buyFeature: true },
  { id: 'gates-of-olympus', title: 'Gates of Olympus Zeus 5000x', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.5, buyFeature: true },
  { id: 'sugar-rush-3d', title: 'Sugar Rush 3D Gummy', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.4, buyFeature: true },
  { id: 'starlight-princess-1000', title: 'Starlight Princess 1000', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.45, buyFeature: true },
  { id: 'big-bass-bonanza-splash', title: 'Big Bass Splash 4000x', category: 'slot', provider: 'Pragmatic Play', rtp: 96.7, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3, buyFeature: true },
  { id: 'buffalo-king-megaways', title: 'Buffalo King Megaways', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 2, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.35, buyFeature: true },
  { id: 'the-dog-house-megaways', title: 'The Dog House Megaways', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 12000, isHot: true, is3D: true, bonusMultiplier: 1.3, buyFeature: true },
  { id: 'wolf-gold-wild', title: 'Wolf Gold Sunset Jackpots', category: 'slot', provider: 'Pragmatic Play', rtp: 96.0, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'book-of-dead-anubis', title: 'Book of Dead Rich Wilde', category: 'slot', provider: 'Play\'n GO', rtp: 96.2, minBet: 1, maxBet: 8000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'starburst-xxx-3d', title: 'Starburst XXXtreme 3D', category: 'slot', provider: 'NetEnt', rtp: 96.3, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'gonzos-quest-megaways', title: 'Gonzo\'s Quest Megaways', category: 'slot', provider: 'Red Tiger', rtp: 96.0, minBet: 1, maxBet: 12000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'fire-joker-freeze', title: 'Fire Joker Freeze', category: 'slot', provider: 'Play\'n GO', rtp: 96.2, minBet: 1, maxBet: 6000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'legacy-of-egypt', title: 'Legacy of Egypt Pyramids', category: 'slot', provider: 'Play\'n GO', rtp: 96.5, minBet: 1, maxBet: 7000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'reactoonz-gargantoon', title: 'Reactoonz 2 Quantum', category: 'slot', provider: 'Play\'n GO', rtp: 96.2, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'money-train-4', title: 'Money Train 4 Bandit 150,000x', category: 'slot', provider: 'Relax Gaming', rtp: 96.1, minBet: 2, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.6, buyFeature: true },
  { id: 'san-quentin-xways', title: 'San Quentin xWays 150,000x', category: 'slot', provider: 'NoLimit City', rtp: 96.0, minBet: 2, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.7, buyFeature: true },
  { id: 'razor-shark-coins', title: 'Razor Shark Algae Coins', category: 'slot', provider: 'Push Gaming', rtp: 96.7, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'jammin-jars-2', title: 'Jammin\' Jars 2 Giga Jar', category: 'slot', provider: 'Push Gaming', rtp: 96.4, minBet: 1, maxBet: 12000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'wild-west-gold-megaways', title: 'Wild West Gold Megaways', category: 'slot', provider: 'Pragmatic Play', rtp: 96.4, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.25, buyFeature: true },
  { id: 'fruit-party-2-peaches', title: 'Fruit Party 2 Wild Tumblers', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3, buyFeature: true },
  { id: 'madame-destiny-megaways', title: 'Madame Destiny Megaways', category: 'slot', provider: 'Pragmatic Play', rtp: 96.6, minBet: 1, maxBet: 12000, isHot: false, is3D: true, bonusMultiplier: 1.25, buyFeature: true },
  { id: 'juicy-fruits-multihold', title: 'Juicy Fruits Multihold', category: 'slot', provider: 'Pragmatic Play', rtp: 96.0, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'gems-bonanza-colossal', title: 'Gems Bonanza Colossal Symbols', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'floating-dragon-megaways', title: 'Floating Dragon Megaways', category: 'slot', provider: 'Pragmatic Play', rtp: 96.7, minBet: 1, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.35, buyFeature: true },
  { id: 'chilli-heat-megaways', title: 'Chilli Heat Megaways Fiesta', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'great-rhino-deluxe', title: 'Great Rhino Deluxe Respin', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 8000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'john-hunter-scarab-queen', title: 'John Hunter Tomb of Scarab', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 8000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'release-the-kraken-2', title: 'Release the Kraken 2', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 12000, isHot: true, is3D: true, bonusMultiplier: 1.3, buyFeature: true },
  { id: 'pyramid-bonanza', title: 'Pyramid Bonanza Gods', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.35, buyFeature: true },
  { id: 'aztec-gems-deluxe', title: 'Aztec Gems Deluxe Totem', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'lucky-lightning-zeus', title: 'Lucky Lightning Respins', category: 'slot', provider: 'Pragmatic Play', rtp: 96.4, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: '5-lions-megaways-gold', title: '5 Lions Megaways Gold', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.35, buyFeature: true },
  { id: 'hand-of-midas-touch', title: 'Hand of Midas Touch', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 12000, isHot: true, is3D: true, bonusMultiplier: 1.3, buyFeature: true },
  { id: 'extra-juicy-megaways', title: 'Extra Juicy Megaways', category: 'slot', provider: 'Pragmatic Play', rtp: 96.4, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'wild-booster-boost', title: 'Wild Booster Super Spin', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'emerald-king-rainbow', title: 'Emerald King Rainbow Road', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 8000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'hot-fiesta-mariachi', title: 'Hot Fiesta Mariachi Pinata', category: 'slot', provider: 'Pragmatic Play', rtp: 96.6, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.25, buyFeature: true },
  { id: 'mysterious-egypt-eye', title: 'Mysterious Egypt Horus Eye', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 8000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'congo-cash-gorilla', title: 'Congo Cash Jewel Board', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'voodoo-magic-potion', title: 'Voodoo Magic Mystery Spins', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'spartan-king-shield', title: 'Spartan King 2x2 Wild', category: 'slot', provider: 'Pragmatic Play', rtp: 96.6, minBet: 1, maxBet: 8000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'cowboys-gold-sheriff', title: 'Cowboys Gold Money Collect', category: 'slot', provider: 'Pragmatic Play', rtp: 96.5, minBet: 1, maxBet: 8000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'return-of-the-dead', title: 'Return of the Dead Pharaoh', category: 'slot', provider: 'Pragmatic Play', rtp: 96.7, minBet: 1, maxBet: 8000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'wild-walker-zombies', title: 'Wild Walker Roaming Reels', category: 'slot', provider: 'Pragmatic Play', rtp: 96.6, minBet: 1, maxBet: 8000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'star-bounty-lasers', title: 'Star Bounty Respin Cascades', category: 'slot', provider: 'Pragmatic Play', rtp: 96.6, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'ultra-hold-and-spin', title: 'Ultra Hold and Spin Diamonds', category: 'slot', provider: 'Pragmatic Play', rtp: 96.7, minBet: 1, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'fortune-ox-pgsoft', title: 'Fortune Ox Year of Wealth', category: 'slot', provider: 'PG Soft', rtp: 96.8, minBet: 1, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'fortune-tiger-pgsoft', title: 'Fortune Tiger Golden Claws', category: 'slot', provider: 'PG Soft', rtp: 96.8, minBet: 1, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'fortune-mouse-pgsoft', title: 'Fortune Mouse Lucky Cheese', category: 'slot', provider: 'PG Soft', rtp: 96.9, minBet: 1, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.4 },

  // --- CARD GAMES (45) ---
  { id: 'newjl-card', title: 'NEWJL CARD Royale', category: 'card', provider: 'JILI', rtp: 98.2, minBet: 5, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'andar-bahar', title: 'Andar Bahar Classic', category: 'card', provider: 'JILI', rtp: 97.8, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: '7-up-7-down', title: '7 Up 7 Down Lightning', category: 'card', provider: 'JILI', rtp: 97.5, minBet: 10, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'poker-roulette', title: 'Poker Roulette Combo', category: 'card', provider: 'JILI', rtp: 97.3, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'coin-toss', title: 'Coin Toss 3D Heads Tails', category: 'card', provider: 'JILI', rtp: 98.5, minBet: 5, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.15 },
  { id: 'triple-chance', title: 'Triple Chance Wheel Cards', category: 'card', provider: 'JILI', rtp: 97.0, minBet: 10, maxBet: 15000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'sic-bo', title: 'Sic Bo 3D Golden Dice', category: 'card', provider: 'JILI', rtp: 97.2, minBet: 10, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'thai-hi-lo-2', title: 'Thai Hi Lo 2 Island Dice', category: 'card', provider: 'KingMaker', rtp: 97.6, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: '32-cards', title: '32 Cards Fast Action', category: 'card', provider: 'KingMaker', rtp: 97.9, minBet: 10, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'colour-game', title: 'Colour Game Mega Bonus', category: 'card', provider: 'JILI', rtp: 97.4, minBet: 10, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'speedy-andar-bahar', title: 'Speedy Andar Bahar', category: 'card', provider: 'JILI', rtp: 97.8, minBet: 10, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'tai-xiu', title: 'Tai Xiu Vietnam Dice', category: 'card', provider: 'KingMaker', rtp: 97.2, minBet: 10, maxBet: 20000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: '7-up-7-down-rush', title: '7 Up 7 Down Rush Turbo', category: 'card', provider: 'JILI', rtp: 97.5, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'thai-fish-prawn-crab', title: 'Thai Fish Prawn Crab', category: 'card', provider: 'KingMaker', rtp: 96.9, minBet: 10, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'european-roulette', title: 'European Roulette Pro 3D', category: 'card', provider: 'Betsoft', rtp: 97.3, minBet: 10, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'fish-prawn-crab-2', title: 'Fish Prawn Crab 2 Dice', category: 'card', provider: 'KingMaker', rtp: 96.9, minBet: 10, maxBet: 15000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'dragon-tiger-2', title: 'Dragon Tiger 2 Speed', category: 'card', provider: 'JILI', rtp: 96.5, minBet: 10, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'bonus-dice', title: 'Bonus Dice Electric Roll', category: 'card', provider: 'JILI', rtp: 97.1, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'burmese-6-animals', title: 'Burmese 6 Animals Forest', category: 'card', provider: 'KingMaker', rtp: 96.7, minBet: 10, maxBet: 10000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'dragon-tiger-classic', title: 'Dragon Tiger Classic Gold', category: 'card', provider: 'KingMaker', rtp: 96.5, minBet: 10, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'teen-patti-pro-3d', title: 'Teen Patti Pro 3D Table', category: 'card', provider: 'KingMaker', rtp: 97.5, minBet: 10, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'texas-holdem-bonus', title: 'Texas Hold\'em Bonus Poker', category: 'card', provider: 'Evolution', rtp: 97.9, minBet: 20, maxBet: 40000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'caribbean-stud-jackpot', title: 'Caribbean Stud Progressive', category: 'card', provider: 'Evolution', rtp: 97.2, minBet: 20, maxBet: 30000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'three-card-poker-3d', title: 'Three Card Poker Pair Plus', category: 'card', provider: 'Evolution', rtp: 97.6, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'blackjack-single-deck', title: 'Blackjack Single Deck 3:2', category: 'card', provider: 'Betsoft', rtp: 99.7, minBet: 25, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'blackjack-double-exposure', title: 'Blackjack Double Exposure', category: 'card', provider: 'Play\'n GO', rtp: 99.3, minBet: 20, maxBet: 40000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'pontoon-21-pro', title: 'Pontoon 21 Pro British', category: 'card', provider: 'Betsoft', rtp: 99.6, minBet: 20, maxBet: 30000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'red-dog-poker-3d', title: 'Red Dog Poker 3D Spread', category: 'card', provider: 'Betsoft', rtp: 97.1, minBet: 10, maxBet: 15000, isHot: false, is3D: true, bonusMultiplier: 1.1 },
  { id: 'casino-war-royale', title: 'Casino War High Card War', category: 'card', provider: 'Betsoft', rtp: 97.2, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.15 },
  { id: 'pai-gow-poker-fortune', title: 'Pai Gow Poker Dragon Hand', category: 'card', provider: 'Betsoft', rtp: 97.3, minBet: 25, maxBet: 25000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'dragon-bonus-baccarat', title: 'Dragon Bonus Baccarat 30:1', category: 'card', provider: 'Ezugi', rtp: 98.9, minBet: 20, maxBet: 60000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'russian-poker-3d', title: 'Russian Poker 6-Card Draw', category: 'card', provider: 'KingMaker', rtp: 98.1, minBet: 20, maxBet: 30000, isHot: false, is3D: true, bonusMultiplier: 1.25 },
  { id: 'oasis-poker-pro', title: 'Oasis Poker Card Exchange', category: 'card', provider: 'Betsoft', rtp: 98.9, minBet: 15, maxBet: 20000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'high-low-classic-cards', title: 'High Low Higher Lower Card', category: 'card', provider: 'Spribe', rtp: 97.0, minBet: 5, maxBet: 10000, isHot: true, is3D: true, bonusMultiplier: 1.15 },
  { id: 'in-between-poker', title: 'In Between Card Post', category: 'card', provider: 'KingMaker', rtp: 97.4, minBet: 10, maxBet: 15000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'royal-baccarat-3d', title: 'Royal Baccarat 3D Squeeze', category: 'card', provider: 'Betsoft', rtp: 98.9, minBet: 50, maxBet: 100000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'super-6-baccarat-zero', title: 'Super 6 Baccarat Commission Free', category: 'card', provider: 'KingMaker', rtp: 98.8, minBet: 20, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'blackjack-switch-3d', title: 'Blackjack Switch Two Hands', category: 'card', provider: 'Betsoft', rtp: 99.4, minBet: 25, maxBet: 40000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'perfect-pairs-blackjack', title: 'Perfect Pairs 21+3 Blackjack', category: 'card', provider: 'Evolution', rtp: 99.4, minBet: 20, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'spanish-21-deluxe', title: 'Spanish 21 No Tens Blackjack', category: 'card', provider: 'Betsoft', rtp: 99.2, minBet: 20, maxBet: 30000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'multihand-blackjack-pro', title: 'Multi-Hand Blackjack 5 Seats', category: 'card', provider: 'Pragmatic Play', rtp: 99.5, minBet: 20, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'card-roulette-3d-spin', title: 'Card Roulette 3D Spin', category: 'card', provider: 'JILI', rtp: 97.3, minBet: 10, maxBet: 20000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'lucky-7-card-game', title: 'Lucky 7 Card Deck Duel', category: 'card', provider: 'KingMaker', rtp: 97.8, minBet: 10, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'jhandi-munda-traditional', title: 'Jhandi Munda Crown & Anchor', category: 'card', provider: 'KingMaker', rtp: 97.1, minBet: 10, maxBet: 15000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'ak47-teen-patti-rush', title: 'AK47 Teen Patti Rush', category: 'card', provider: 'KingMaker', rtp: 97.4, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.3 },

  // --- SPORTS BETTING (30) ---
  { id: '9wickets', title: '9WICKETS Cricket Exchange', category: 'sports', provider: '9Wickets', rtp: 95.0, minBet: 50, maxBet: 500000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'bti-sports', title: 'BTI SPORTS Global Sportsbook', category: 'sports', provider: 'BTi Sports', rtp: 95.5, minBet: 20, maxBet: 200000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'soul-exchange', title: 'SOUL Exchange Match Odds', category: 'sports', provider: 'Soul Exch', rtp: 96.0, minBet: 50, maxBet: 300000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'saba-sports', title: 'SABA SPORTS In-Play Arena', category: 'sports', provider: 'Saba Sports', rtp: 95.2, minBet: 20, maxBet: 250000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'awc-trc-horse-racing', title: 'AWC TRC Live Horse Derby', category: 'sports', provider: 'AWC TRC', rtp: 94.8, minBet: 20, maxBet: 100000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'awc-sv388-cockfight', title: 'AWC SV388 Live Cockfight Arena', category: 'sports', provider: 'SV388', rtp: 95.0, minBet: 20, maxBet: 150000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'icc-cricket-world-cup', title: 'ICC Cricket World Cup Live', category: 'sports', provider: '9Wickets', rtp: 95.5, minBet: 20, maxBet: 300000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'ipl-t20-cricket-match', title: 'IPL T20 Cricket Live Over/Under', category: 'sports', provider: '9Wickets', rtp: 95.5, minBet: 20, maxBet: 400000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'uefa-champions-league', title: 'UEFA Champions League Football', category: 'sports', provider: 'Saba Sports', rtp: 95.8, minBet: 20, maxBet: 250000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'premier-league-soccer', title: 'English Premier League EPL', category: 'sports', provider: 'BTi Sports', rtp: 95.8, minBet: 20, maxBet: 250000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'la-liga-spain-football', title: 'La Liga Spain Soccer', category: 'sports', provider: 'BTi Sports', rtp: 95.5, minBet: 20, maxBet: 200000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'nba-basketball-playoffs', title: 'NBA Basketball Championship', category: 'sports', provider: 'Saba Sports', rtp: 95.4, minBet: 20, maxBet: 200000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'fifa-esoccer-virtual', title: 'FIFA eSoccer 8-Min Battle', category: 'sports', provider: 'Saba Sports', rtp: 95.0, minBet: 10, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'grand-slam-tennis-open', title: 'Wimbledon Grand Slam Tennis', category: 'sports', provider: 'BTi Sports', rtp: 95.2, minBet: 20, maxBet: 100000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'formula-1-grand-prix', title: 'Formula 1 Pole Position Derby', category: 'sports', provider: 'BTi Sports', rtp: 94.9, minBet: 25, maxBet: 100000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'pro-kabaddi-league', title: 'Pro Kabaddi League Live Raid', category: 'sports', provider: '9Wickets', rtp: 95.1, minBet: 20, maxBet: 150000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'ufc-mma-fight-night', title: 'UFC MMA World Championship', category: 'sports', provider: 'Soul Exch', rtp: 95.0, minBet: 25, maxBet: 150000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'heavyweight-boxing-title', title: 'World Heavyweight Boxing', category: 'sports', provider: 'BTi Sports', rtp: 95.0, minBet: 20, maxBet: 100000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'cs2-major-championship', title: 'Counter-Strike 2 Major Esports', category: 'sports', provider: 'Saba Sports', rtp: 95.2, minBet: 10, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'dota-2-international', title: 'Dota 2 The International Aegis', category: 'sports', provider: 'Saba Sports', rtp: 95.2, minBet: 10, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.2 },
  { id: 'league-of-legends-worlds', title: 'League of Legends Worlds Cup', category: 'sports', provider: 'Saba Sports', rtp: 95.2, minBet: 10, maxBet: 50000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'valorant-champions-tour', title: 'Valorant Champions Tour VCT', category: 'sports', provider: 'Saba Sports', rtp: 95.1, minBet: 10, maxBet: 40000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'table-tennis-pro-cup', title: 'Table Tennis Moscow Pro League', category: 'sports', provider: 'BTi Sports', rtp: 95.0, minBet: 10, maxBet: 30000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'ice-hockey-nhl-stanley', title: 'NHL Ice Hockey Stanley Cup', category: 'sports', provider: 'BTi Sports', rtp: 95.3, minBet: 20, maxBet: 100000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'american-football-nfl', title: 'NFL Super Bowl American Football', category: 'sports', provider: 'BTi Sports', rtp: 95.5, minBet: 20, maxBet: 200000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'baseball-mlb-world-series', title: 'MLB World Series Baseball', category: 'sports', provider: 'BTi Sports', rtp: 95.3, minBet: 20, maxBet: 100000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'golf-masters-championship', title: 'The Masters Tournament Golf', category: 'sports', provider: 'BTi Sports', rtp: 94.8, minBet: 25, maxBet: 50000, isHot: false, is3D: true, bonusMultiplier: 1.25 },
  { id: 'volleyball-world-nations', title: 'FIVB Volleyball Nations League', category: 'sports', provider: 'Saba Sports', rtp: 95.0, minBet: 15, maxBet: 50000, isHot: false, is3D: true, bonusMultiplier: 1.15 },
  { id: 'virtual-football-league', title: 'Virtual Premier Football 3D', category: 'sports', provider: 'Saba Sports', rtp: 95.6, minBet: 5, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'greyhound-racing-live', title: 'Greyhound Fast Track Derby', category: 'sports', provider: 'AWC TRC', rtp: 94.7, minBet: 10, maxBet: 50000, isHot: false, is3D: true, bonusMultiplier: 1.2 },

  // --- LOTTERY & INSTANT / CRASH (30) ---
  { id: 'wingo', title: 'WINGO 1-Min Color Prediction', category: 'lottery', provider: 'Limowin Games', rtp: 98.0, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'wingo-3min', title: 'WINGO 3-Min Royal Draw', category: 'lottery', provider: 'Limowin Games', rtp: 98.2, minBet: 5, maxBet: 100000, isHot: true, is3D: true, bonusMultiplier: 1.45 },
  { id: 'wingo-5min', title: 'WINGO 5-Min Fortune Draw', category: 'lottery', provider: 'Limowin Games', rtp: 98.5, minBet: 10, maxBet: 200000, isHot: false, is3D: true, bonusMultiplier: 1.5 },
  { id: 'k3-lottery', title: 'K3 Lottery 3-Dice 1-Min', category: 'lottery', provider: 'Limowin Games', rtp: 97.9, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'k3-lottery-3min', title: 'K3 Lottery 3-Min High Dice', category: 'lottery', provider: 'Limowin Games', rtp: 98.1, minBet: 5, maxBet: 100000, isHot: false, is3D: true, bonusMultiplier: 1.45 },
  { id: '5d-lottery-draw', title: '5D Lottery Speed Draw', category: 'lottery', provider: 'Limowin Games', rtp: 97.5, minBet: 5, maxBet: 50000, isHot: false, is3D: true, bonusMultiplier: 1.35 },
  { id: 'gold-rooster-lottery', title: 'Gold Rooster Lottery', category: 'lottery', provider: 'Sikwin', rtp: 97.6, minBet: 5, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'lucky-scratch', title: 'Lucky Scratch Card 777', category: 'lottery', provider: 'Limowin Games', rtp: 96.5, minBet: 10, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'lucky-scratch-golden-egg', title: 'Lucky Scratch Golden Egg', category: 'lottery', provider: 'Limowin Games', rtp: 96.8, minBet: 20, maxBet: 40000, isHot: false, is3D: true, bonusMultiplier: 1.4 },
  { id: 'lucky-scratch-cash-buster', title: 'Cash Buster Scratch 100,000x', category: 'lottery', provider: 'Limowin Games', rtp: 96.7, minBet: 50, maxBet: 100000, isHot: true, is3D: true, bonusMultiplier: 1.5 },
  { id: 'aviator-crash-3d', title: 'Aviator 3D Jet Multiplier', category: 'lottery', provider: 'Spribe', rtp: 97.0, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.5 },
  { id: 'jetx-rocket-crash', title: 'JetX Galaxy Rocket Crash', category: 'lottery', provider: 'SmartSoft', rtp: 97.0, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.45 },
  { id: 'spaceman-3d-interstellar', title: 'Spaceman 3D Moon Cash', category: 'lottery', provider: 'Pragmatic Play', rtp: 96.5, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'plinko-3d-galaxy', title: 'Plinko 3D High Volatility 1000x', category: 'lottery', provider: 'Spribe', rtp: 99.0, minBet: 5, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'plinko-classic-pegs', title: 'Plinko Classic Peg Board', category: 'lottery', provider: 'BGaming', rtp: 98.9, minBet: 5, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'mines-gold-sweeper', title: 'Mines Gold 5x5 Vault Sweeper', category: 'lottery', provider: 'Spribe', rtp: 97.0, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.45 },
  { id: 'mines-diamond-danger', title: 'Mines Diamond Danger 24 Bombs', category: 'lottery', provider: 'BGaming', rtp: 97.2, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.5 },
  { id: 'dice-3d-high-roller', title: 'Dice 3D High Roller Slider', category: 'lottery', provider: 'Spribe', rtp: 97.0, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'coin-flip-3d-deluxe', title: 'Coin Flip 3D Double or Nothing', category: 'lottery', provider: 'Spribe', rtp: 98.0, minBet: 5, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.25 },
  { id: 'wheel-of-fortune-cash', title: 'Wheel of Fortune Instant Spin', category: 'lottery', provider: 'Limowin Games', rtp: 96.8, minBet: 5, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
  { id: 'tower-legend-dragons', title: 'Tower Legend Dragon Climb', category: 'lottery', provider: 'Limowin Games', rtp: 97.0, minBet: 5, maxBet: 25000, isHot: false, is3D: true, bonusMultiplier: 1.3 },
  { id: 'limbo-rocket-10000x', title: 'Limbo Rocket 10,000x Sky', category: 'lottery', provider: 'Limowin Games', rtp: 98.0, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.4 },
  { id: 'hilo-classic-card-flip', title: 'HiLo Classic Cards Up/Down', category: 'lottery', provider: 'Spribe', rtp: 97.0, minBet: 5, maxBet: 25000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'keno-deluxe-80-balls', title: 'Keno Deluxe 80 Balls', category: 'lottery', provider: 'Limowin Games', rtp: 96.0, minBet: 5, maxBet: 15000, isHot: false, is3D: true, bonusMultiplier: 1.25 },
  { id: 'bingo-75-live-hall', title: 'Bingo 75 Golden Hall', category: 'lottery', provider: 'Pragmatic Play', rtp: 95.8, minBet: 5, maxBet: 20000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'bingo-90-mega-jackpot', title: 'Bingo 90 Mega Jackpot', category: 'lottery', provider: 'Pragmatic Play', rtp: 96.0, minBet: 5, maxBet: 25000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'crypto-crash-solana', title: 'Crypto Moon Crash 3D', category: 'lottery', provider: 'Limowin Games', rtp: 97.5, minBet: 5, maxBet: 50000, isHot: true, is3D: true, bonusMultiplier: 1.45 },
  { id: 'turbo-dice-blitz', title: 'Turbo Dice 6-Sided Blitz', category: 'lottery', provider: 'Limowin Games', rtp: 97.2, minBet: 5, maxBet: 30000, isHot: false, is3D: true, bonusMultiplier: 1.2 },
  { id: 'goal-mine-football-kick', title: 'Goal Mine Goalkeeper Rush', category: 'lottery', provider: 'Evoplay', rtp: 96.0, minBet: 5, maxBet: 20000, isHot: true, is3D: true, bonusMultiplier: 1.3 },
  { id: 'penalty-shootout-3d', title: 'Penalty Shootout 3D World Cup', category: 'lottery', provider: 'Evoplay', rtp: 96.0, minBet: 5, maxBet: 30000, isHot: true, is3D: true, bonusMultiplier: 1.35 },
];

console.log('Total games prepared:', rawGames.length);

const gamesList = rawGames.map(g => {
  let engineType = 'slot';
  if (g.category === 'live') {
    if (g.id.includes('roulette')) engineType = 'roulette';
    else if (g.id.includes('sicbo') || g.id.includes('sic-bo') || g.id.includes('dice') || g.id.includes('numbers')) engineType = 'dice';
    else engineType = 'card';
  } else if (g.category === 'slot') {
    engineType = 'slot';
  } else if (g.category === 'card') {
    if (g.id.includes('roulette')) engineType = 'roulette';
    else if (g.id.includes('dice') || g.id.includes('sic-bo') || g.id.includes('7-up') || g.id.includes('coin-toss') || g.id.includes('fish-prawn') || g.id.includes('hi-lo') || g.id.includes('tai-xiu')) engineType = 'dice';
    else engineType = 'card';
  } else if (g.category === 'sports') {
    engineType = 'sports';
  } else if (g.category === 'lottery') {
    if (g.id.includes('wingo') || g.id.includes('k3') || g.id.includes('5d') || g.id.includes('bingo') || g.id.includes('keno') || g.id.includes('gold-rooster')) engineType = 'wingo';
    else if (g.id.includes('aviator') || g.id.includes('jetx') || g.id.includes('spaceman') || g.id.includes('crash') || g.id.includes('limbo')) engineType = 'crash';
    else if (g.id.includes('plinko')) engineType = 'plinko';
    else if (g.id.includes('mines') || g.id.includes('goal-mine')) engineType = 'mines';
    else if (g.id.includes('scratch')) engineType = 'scratch';
    else engineType = 'dice';
  }

  return {
    ...g,
    image: '/assets/games/' + g.id + '.png',
    engineType,
    description: 'Experience ultra realistic 3D ' + g.title + ' powered by ' + g.provider + ' with ' + g.rtp + '% RTP.'
  };
});

const tsContent = `// Real and Playable 200+ Games Catalog
export interface GameItem {
  id: string;
  title: string;
  category: 'live' | 'slot' | 'sports' | 'card' | 'lottery';
  provider: string;
  rtp: number;
  minBet: number;
  maxBet: number;
  isHot?: boolean;
  isNew?: boolean;
  is3D?: boolean;
  buyFeature?: boolean;
  bonusMultiplier: number;
  image: string;
  engineType: 'slot' | 'roulette' | 'dice' | 'card' | 'crash' | 'plinko' | 'mines' | 'wingo' | 'sports' | 'scratch';
  description?: string;
}

export const GAMES_CATALOG: GameItem[] = ` + JSON.stringify(gamesList, null, 2) + `;\n`;

fs.writeFileSync('./src/data/gamesCatalog.ts', tsContent);
console.log('Successfully wrote src/data/gamesCatalog.ts with ' + gamesList.length + ' games.');
