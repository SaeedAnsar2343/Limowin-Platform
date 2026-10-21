import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Play, RotateCcw, Zap, Trophy, Sparkles } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

interface SymbolDef {
  icon: string;
  name: string;
  mult: number;
  weight: number;
}

const getSlotTheme = (game: GameItem) => {
  const text = (game.title + ' ' + game.id).toLowerCase();

  if (text.includes('olympus') || text.includes('zeus') || text.includes('princess') || text.includes('god') || text.includes('gates')) {
    return {
      name: 'Greek Olympus Myth',
      borderStyle: 'border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.25)]',
      gradient: 'from-amber-950/60 via-slate-950 to-indigo-950/70',
      watermark: '⚡',
      symbols: [
        { icon: '⚡', name: 'Zeus Lightning', mult: 250, weight: 1 },
        { icon: '👑', name: 'Golden Crown', mult: 100, weight: 3 },
        { icon: '💍', name: 'Ruby Ring', mult: 50, weight: 6 },
        { icon: '⏳', name: 'Hourglass', mult: 25, weight: 10 },
        { icon: '🏆', name: 'Golden Goblet', mult: 10, weight: 15 },
        { icon: '💎', name: 'Blue Sapphire', mult: 5, weight: 20 },
        { icon: '🔮', name: 'Amethyst Gem', mult: 3, weight: 25 },
        { icon: '🏺', name: 'Greek Amphora', mult: 2, weight: 30 }
      ]
    };
  }

  if (text.includes('bonanza') || text.includes('sugar') || text.includes('sweet') || text.includes('candy') || text.includes('fruit')) {
    return {
      name: 'Sweet Bonanza Sugar',
      borderStyle: 'border-pink-500/50 shadow-[0_0_40px_rgba(236,72,153,0.25)]',
      gradient: 'from-pink-950/60 via-slate-950 to-purple-950/70',
      watermark: '🍭',
      symbols: [
        { icon: '🍭', name: 'Spiral Lollipop', mult: 250, weight: 1 },
        { icon: '🍬', name: 'Red Heart Candy', mult: 100, weight: 3 },
        { icon: '🍇', name: 'Purple Bonbon', mult: 50, weight: 6 },
        { icon: '🍉', name: 'Sugar Watermelon', mult: 25, weight: 10 },
        { icon: '🍎', name: 'Crisp Apple', mult: 10, weight: 15 },
        { icon: '🍌', name: 'Sweet Banana', mult: 5, weight: 20 },
        { icon: '🫐', name: 'Blue Berry Gummy', mult: 3, weight: 25 },
        { icon: '🍒', name: 'Sweet Cherry', mult: 2, weight: 30 }
      ]
    };
  }

  if (text.includes('gem') || text.includes('fortune') || text.includes('ace') || text.includes('blossom') || text.includes('koi') || text.includes('dragon') || text.includes('wealth') || text.includes('bowl')) {
    return {
      name: 'Imperial Fortune Asian',
      borderStyle: 'border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)]',
      gradient: 'from-amber-950/70 via-slate-950 to-red-950/70',
      watermark: '🪙',
      symbols: [
        { icon: '🦅', name: 'Golden Garuda', mult: 250, weight: 1 },
        { icon: '🐉', name: 'Golden Dragon', mult: 100, weight: 3 },
        { icon: '🪙', name: 'Gold Sycee Ingot', mult: 50, weight: 6 },
        { icon: '🏮', name: 'Imperial Lantern', mult: 25, weight: 10 },
        { icon: '🪓', name: 'Jade War Axe', mult: 10, weight: 15 },
        { icon: '💎', name: 'Royal Jade Gem', mult: 5, weight: 20 },
        { icon: '🧧', name: 'Red Money Packet', mult: 3, weight: 25 },
        { icon: '🎋', name: 'Lucky Bamboo', mult: 2, weight: 30 }
      ]
    };
  }

  if (text.includes('money') || text.includes('777') || text.includes('diamond') || text.includes('piggy') || text.includes('vegas') || text.includes('cash') || text.includes('hustler')) {
    return {
      name: 'Vegas 777 Money Vault',
      borderStyle: 'border-yellow-400/60 shadow-[0_0_40px_rgba(250,204,21,0.3)]',
      gradient: 'from-emerald-950/60 via-slate-950 to-amber-950/70',
      watermark: '💵',
      symbols: [
        { icon: '7️⃣', name: 'Triple Jackpot 7', mult: 250, weight: 1 },
        { icon: '💎', name: 'Giant Blue Diamond', mult: 100, weight: 3 },
        { icon: '💰', name: 'Full Money Bag', mult: 50, weight: 6 },
        { icon: '💵', name: 'Cash Dollar Stack', mult: 25, weight: 10 },
        { icon: '🔔', name: 'Golden Bell', mult: 10, weight: 15 },
        { icon: '🍀', name: 'Four-Leaf Clover', mult: 5, weight: 20 },
        { icon: '🪙', name: 'Gold Bullion', mult: 3, weight: 25 },
        { icon: '🎰', name: 'Mini Slot', mult: 2, weight: 30 }
      ]
    };
  }

  if (text.includes('buffalo') || text.includes('wolf') || text.includes('wild') || text.includes('safari') || text.includes('beast')) {
    return {
      name: 'Wild Buffalo Safari',
      borderStyle: 'border-amber-600/50 shadow-[0_0_40px_rgba(217,119,6,0.25)]',
      gradient: 'from-stone-950 via-slate-950 to-amber-950/80',
      watermark: '🦬',
      symbols: [
        { icon: '🦬', name: 'Golden Thunder Buffalo', mult: 250, weight: 1 },
        { icon: '🦅', name: 'Bald Eagle Wild', mult: 100, weight: 3 },
        { icon: '🐺', name: 'Howling Wolf', mult: 50, weight: 6 },
        { icon: '🐆', name: 'Golden Cougar', mult: 25, weight: 10 },
        { icon: '🦌', name: 'Wild Elk', mult: 10, weight: 15 },
        { icon: '🌵', name: 'Desert Cactus', mult: 5, weight: 20 },
        { icon: '🏜️', name: 'Red Canyon', mult: 3, weight: 25 },
        { icon: '🪙', name: 'Gold Nugget', mult: 2, weight: 30 }
      ]
    };
  }

  if (text.includes('book') || text.includes('egypt') || text.includes('dead') || text.includes('pharaoh') || text.includes('tomb') || text.includes('mask')) {
    return {
      name: 'Ancient Egyptian Pyramid',
      borderStyle: 'border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)]',
      gradient: 'from-amber-950/80 via-slate-950 to-yellow-950/70',
      watermark: '👁️',
      symbols: [
        { icon: '📜', name: 'Book of Ra Sacred', mult: 250, weight: 1 },
        { icon: '👑', name: 'Pharaoh Gold Mask', mult: 100, weight: 3 },
        { icon: '⚱️', name: 'Golden Anubis', mult: 50, weight: 6 },
        { icon: '👁️', name: 'Eye of Horus', mult: 25, weight: 10 },
        { icon: '🪲', name: 'Sacred Scarab', mult: 10, weight: 15 },
        { icon: '🏺', name: 'Egyptian Urn', mult: 5, weight: 20 },
        { icon: '⚰️', name: 'Golden Sarcophagus', mult: 3, weight: 25 },
        { icon: '🪙', name: 'Hieroglyph Coin', mult: 2, weight: 30 }
      ]
    };
  }

  // Default Classic Fruit Slot
  return {
    name: 'Classic Royale 3D',
    borderStyle: 'border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)]',
    gradient: 'from-slate-900 via-slate-950 to-slate-900',
    watermark: '👑',
    symbols: [
      { icon: '👑', name: 'Crown Wild', mult: 250, weight: 1 },
      { icon: '7️⃣', name: 'Lucky Seven', mult: 100, weight: 3 },
      { icon: '💎', name: 'Blue Diamond', mult: 50, weight: 6 },
      { icon: '⭐', name: 'Golden Star', mult: 25, weight: 10 },
      { icon: '🔔', name: 'Vegas Bell', mult: 10, weight: 15 },
      { icon: '🍇', name: 'Grape Bunch', mult: 5, weight: 20 },
      { icon: '🍋', name: 'Fresh Lemon', mult: 3, weight: 25 },
      { icon: '🍒', name: 'Royal Cherry', mult: 2, weight: 30 }
    ]
  };
};

export const SlotGame3D: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [isSpinning, setIsSpinning] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winLine, setWinLine] = useState<number | null>(null);
  const [autoSpin, setAutoSpin] = useState(false);
  const autoSpinRef = useRef(false);

  autoSpinRef.current = autoSpin;

  const currentTheme = getSlotTheme(game);
  const symbols = currentTheme.symbols;

  const [reels, setReels] = useState<string[][]>([
    [symbols[0].icon, symbols[1].icon, symbols[2].icon],
    [symbols[3].icon, symbols[4].icon, symbols[5].icon],
    [symbols[6].icon, symbols[0].icon, symbols[3].icon],
    [symbols[2].icon, symbols[5].icon, symbols[4].icon],
    [symbols[1].icon, symbols[6].icon, symbols[7].icon]
  ]);

  useEffect(() => {
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  const getRandomSymbol = (): SymbolDef => {
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const s of symbols) {
      if (rand < s.weight) return s;
      rand -= s.weight;
    }
    return symbols[0];
  };

  const spin = () => {
    if (isSpinning || balance < bet) return;
    setIsSpinning(true);
    setLastWin(null);
    setWinLine(null);
    sound.playChip();

    const spinDuration = turbo ? 400 : 1000;
    const intervalTime = turbo ? 40 : 80;

    // Spin animation ticks
    const interval = setInterval(() => {
      sound.playReelTick();
      setReels(prev =>
        prev.map(() => [
          getRandomSymbol().icon,
          getRandomSymbol().icon,
          getRandomSymbol().icon
        ])
      );
    }, intervalTime);

    setTimeout(() => {
      clearInterval(interval);

      // Secret House Edge Outcome
      const outcome = calculateWinOutcome(bet, 20.0);
      let finalReels: string[][];
      let winMultiplier = 0;

      if (outcome.isWin) {
        // Player wins: pick matching middle or top line
        winMultiplier = outcome.multiplier;
        const winningSym = getRandomSymbol();
        const rowToMatch = Math.random() > 0.5 ? 1 : 0; // Middle or top line

        finalReels = [
          [getRandomSymbol().icon, getRandomSymbol().icon, getRandomSymbol().icon],
          [getRandomSymbol().icon, getRandomSymbol().icon, getRandomSymbol().icon],
          [getRandomSymbol().icon, getRandomSymbol().icon, getRandomSymbol().icon],
          [getRandomSymbol().icon, getRandomSymbol().icon, getRandomSymbol().icon],
          [getRandomSymbol().icon, getRandomSymbol().icon, getRandomSymbol().icon]
        ];

        // 3 to 5 reels match
        const matchCount = winMultiplier > 10 ? 5 : winMultiplier > 4 ? 4 : 3;
        for (let c = 0; c < matchCount; c++) {
          finalReels[c][rowToMatch] = winningSym.icon;
        }

        setWinLine(rowToMatch);
        const winAmount = bet * winMultiplier * bonusMultiplier;
        setLastWin(winAmount);
        sound.playWin();
      } else {
        // Losing spin
        finalReels = [
          [symbols[0].icon, symbols[1].icon, symbols[2].icon],
          [symbols[3].icon, symbols[4].icon, symbols[5].icon],
          [symbols[6].icon, symbols[7].icon, symbols[1].icon],
          [symbols[2].icon, symbols[3].icon, symbols[4].icon],
          [symbols[5].icon, symbols[6].icon, symbols[7].icon]
        ];
        // Jumble to avoid accidental match
        for (let c = 0; c < 5; c++) {
          for (let r = 0; r < 3; r++) {
            finalReels[c][r] = symbols[(c * 3 + r + Math.floor(Math.random() * 3)) % symbols.length].icon;
          }
        }
        setLastWin(null);
        sound.playLose();
      }

      setReels(finalReels);
      setIsSpinning(false);
      onPlay(bet, winMultiplier, outcome.isWin);

      if (autoSpinRef.current) {
        setTimeout(() => {
          if (autoSpinRef.current) spin();
        }, 1200);
      }
    }, spinDuration);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🎰
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">
              Theme: {currentTheme.name} • RTP {game.rtp}%
            </span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Thematic 3D Glass Reels Window */}
      <div className={`w-full bg-gradient-to-b ${currentTheme.gradient} border-x-4 border-slate-800 p-2 sm:p-6 shadow-2xl relative overflow-hidden`}>
        {/* Neon Light Bars */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* Thematic Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 text-9xl">
          {currentTheme.watermark}
        </div>

        {/* Payline Marker in Middle */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-yellow-400/30 pointer-events-none z-10" />

        {/* 5-Reel Display */}
        <div className="grid grid-cols-5 gap-1 sm:gap-3 relative z-10">
          {reels.map((col, colIdx) => (
            <div
              key={colIdx}
              className={`flex flex-col space-y-1 sm:space-y-2 bg-gradient-to-b from-slate-900 to-slate-800 p-1 sm:p-2 rounded-xl border ${
                isSpinning ? 'border-amber-400/50 blur-[0.4px]' : 'border-slate-700'
              } shadow-inner transition-all duration-75`}
            >
              {col.map((sym, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`h-14 sm:h-24 flex items-center justify-center text-2xl sm:text-5xl rounded-lg bg-gradient-to-b from-slate-800 to-slate-900/90 shadow border border-slate-700/60 transition-transform ${
                    winLine === rowIdx && lastWin ? 'scale-105 border-yellow-400 ring-2 ring-yellow-400/50 bg-amber-950/40' : ''
                  }`}
                >
                  <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">{sym}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Control Console - 100% Mobile Fitting & Zero Overlap */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Bet presets: horizontally scrollable, compact, zero overlap */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase mr-1 shrink-0">Bet:</span>
          {currencyConfig.betPresets.slice(0, 5).map(val => (
            <button
              key={val}
              onClick={() => {
                setBet(val);
                sound.playChip();
              }}
              disabled={isSpinning}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-xs shrink-0 whitespace-nowrap transition-all ${
                bet === val
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-102 ring-2 ring-yellow-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {formatCurrency(val).replace('.00', '')}
            </button>
          ))}
        </div>

        {/* Quick Features & Big Spin */}
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
          <button
            onClick={() => setTurbo(!turbo)}
            className={`flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              turbo
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${turbo ? 'fill-amber-400' : ''}`} />
            <span>Turbo</span>
          </button>

          <button
            onClick={() => setAutoSpin(!autoSpin)}
            className={`flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              autoSpin
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoSpin ? 'animate-spin' : ''}`} />
            <span>{autoSpin ? 'Stop' : 'Auto'}</span>
          </button>

          <button
            onClick={spin}
            disabled={isSpinning || balance < bet}
            className={`flex-1 sm:w-44 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-1.5 transition-all transform active:scale-95 ${
              isSpinning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : balance < bet
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 hover:shadow-yellow-500/25'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isSpinning ? 'Spinning...' : balance < bet ? 'Low Balance' : `SPIN ${formatCurrency(bet)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
