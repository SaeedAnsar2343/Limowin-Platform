import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Trophy, Shuffle } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  num: number;
  color: 'red' | 'black';
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const CARD_DECK = [
  { val: 'A', num: 1 },
  { val: '2', num: 2 },
  { val: '3', num: 3 },
  { val: '4', num: 4 },
  { val: '5', num: 5 },
  { val: '6', num: 6 },
  { val: '7', num: 7 },
  { val: '8', num: 8 },
  { val: '9', num: 9 },
  { val: '10', num: 0 },
  { val: 'J', num: 0 },
  { val: 'Q', num: 0 },
  { val: 'K', num: 0 }
];

export const BaccaratEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [betSide, setBetSide] = useState<'PLAYER' | 'BANKER' | 'TIE'>('PLAYER');
  const [chip, setChip] = useState(currencyConfig.minBet);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [isDealing, setIsDealing] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<string>('');
  const [roadmap, setRoadmap] = useState<('P' | 'B' | 'T')[]>(['P', 'B', 'B', 'P', 'T', 'B', 'P']);
  const timerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (chip < currencyConfig.minBet || chip > currencyConfig.maxBet) {
      setChip(currencyConfig.minBet);
    }
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currencyConfig]);

  const drawCard = (): Card => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const def = CARD_DECK[Math.floor(Math.random() * CARD_DECK.length)];
    return {
      suit,
      value: def.val,
      num: def.num,
      color: suit === '♥' || suit === '♦' ? 'red' : 'black'
    };
  };

  const getBaccaratPoints = (cards: Card[]): number => {
    return cards.reduce((sum, c) => sum + c.num, 0) % 10;
  };

  const startRound = () => {
    if (isDealing || balance < chip) return;
    setIsDealing(true);
    setRoundResult('');
    setLastWin(null);
    sound.playChip();

    const targetMult = betSide === 'TIE' ? 9.0 : betSide === 'BANKER' ? 1.95 : 2.0;
    const outcome = calculateWinOutcome(chip, targetMult);

    // Initial 2 cards each
    let pCards = [drawCard(), drawCard()];
    let bCards = [drawCard(), drawCard()];

    let pPoints = getBaccaratPoints(pCards);
    let bPoints = getBaccaratPoints(bCards);

    // Natural 8 or 9
    const isNatural = pPoints >= 8 || bPoints >= 8;

    if (!isNatural) {
      // Player draws 3rd card if 0-5
      let player3rdCard: Card | null = null;
      if (pPoints <= 5) {
        player3rdCard = drawCard();
        pCards.push(player3rdCard);
        pPoints = getBaccaratPoints(pCards);
      }

      // Banker drawing rules
      if (!player3rdCard) {
        if (bPoints <= 5) {
          bCards.push(drawCard());
          bPoints = getBaccaratPoints(bCards);
        }
      } else {
        const p3 = player3rdCard.num;
        if (
          bPoints <= 2 ||
          (bPoints === 3 && p3 !== 8) ||
          (bPoints === 4 && [2, 3, 4, 5, 6, 7].includes(p3)) ||
          (bPoints === 5 && [4, 5, 6, 7].includes(p3)) ||
          (bPoints === 6 && [6, 7].includes(p3))
        ) {
          bCards.push(drawCard());
          bPoints = getBaccaratPoints(bCards);
        }
      }
    }

    // Force outcome based on calculateWinOutcome
    if (outcome.isWin) {
      if (betSide === 'PLAYER') {
        pPoints = 9;
        bPoints = Math.floor(Math.random() * 8);
      } else if (betSide === 'BANKER') {
        bPoints = 9;
        pPoints = Math.floor(Math.random() * 8);
      } else {
        pPoints = 8;
        bPoints = 8;
      }
    } else {
      if (betSide === 'PLAYER') {
        bPoints = 8;
        pPoints = Math.floor(Math.random() * 7);
      } else if (betSide === 'BANKER') {
        pPoints = 8;
        bPoints = Math.floor(Math.random() * 7);
      }
    }

    setPlayerCards(pCards);
    setBankerCards(bCards);
    sound.playCardFlip();

    timerRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsDealing(false);
      let winner: 'PLAYER' | 'BANKER' | 'TIE';

      if (pPoints > bPoints) winner = 'PLAYER';
      else if (bPoints > pPoints) winner = 'BANKER';
      else winner = 'TIE';

      setRoadmap(prev => [...prev.slice(-9), winner === 'PLAYER' ? 'P' : winner === 'BANKER' ? 'B' : 'T']);

      const isWin = (winner === betSide) || outcome.isWin;

      if (isWin) {
        const mult = betSide === 'TIE' ? 9.0 : betSide === 'BANKER' ? 1.95 : 2.0;
        const winAmt = chip * mult * bonusMultiplier;
        setRoundResult(`🎉 ${winner} WINS! (${pPoints} vs ${bPoints})`);
        setLastWin(winAmt);
        sound.playWin();
        onPlay(chip, mult, true);
      } else {
        setRoundResult(`${winner} WINS (${pPoints} vs ${bPoints})`);
        sound.playLose();
        onPlay(chip, 0, false);
      }
    }, 900);
  };

  const pPoints = getBaccaratPoints(playerCards);
  const bPoints = getBaccaratPoints(bankerCards);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            ⚜️
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">Punto Banco Baccarat • Natural 9 • Banker 1:0.95</span>
          </div>
        </div>

        {/* Roadmap Bead Plate */}
        <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-bold mr-1">Bead:</span>
          {roadmap.slice(-6).map((r, i) => (
            <span
              key={i}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                r === 'P' ? 'bg-blue-600 text-white' : r === 'B' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {r}
            </span>
          ))}
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Baccarat Royal Blue Felt Table */}
      <div className="w-full bg-gradient-to-b from-blue-950 via-slate-950 to-blue-950 border-x-4 border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-between min-h-[350px] relative shadow-inner">
        {/* Felt Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-8xl sm:text-9xl font-black text-blue-400">9</span>
        </div>

        {/* Both Hands Split: Player vs Banker */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl z-10 my-auto">
          {/* PLAYER (PUNTO) */}
          <div className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-slate-900/60 border border-blue-500/30">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-blue-400">PLAYER</span>
              <span className="text-xs font-black bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40">
                {playerCards.length > 0 ? `${pPoints} pts` : '-'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 min-h-[90px] sm:min-h-[115px]">
              {playerCards.length === 0 ? (
                <div className="w-14 h-20 sm:w-18 sm:h-26 rounded-xl border-2 border-dashed border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400/40">
                  PLAYER
                </div>
              ) : (
                playerCards.map((c, i) => (
                  <div
                    key={i}
                    className="w-14 h-20 sm:w-18 sm:h-26 rounded-xl shadow-xl flex flex-col justify-between p-1.5 border border-slate-300 bg-white"
                  >
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-black leading-none">
                      <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                      <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                    </div>
                    <div className={`text-lg sm:text-xl self-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                      {c.suit}
                    </div>
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-black leading-none rotate-180">
                      <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                      <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BANKER (BANCO) */}
          <div className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-slate-900/60 border border-rose-500/30">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-rose-400">BANKER</span>
              <span className="text-xs font-black bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40">
                {bankerCards.length > 0 ? `${bPoints} pts` : '-'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 min-h-[90px] sm:min-h-[115px]">
              {bankerCards.length === 0 ? (
                <div className="w-14 h-20 sm:w-18 sm:h-26 rounded-xl border-2 border-dashed border-rose-500/30 flex items-center justify-center text-[10px] text-rose-400/40">
                  BANKER
                </div>
              ) : (
                bankerCards.map((c, i) => (
                  <div
                    key={i}
                    className="w-14 h-20 sm:w-18 sm:h-26 rounded-xl shadow-xl flex flex-col justify-between p-1.5 border border-slate-300 bg-white"
                  >
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-black leading-none">
                      <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                      <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                    </div>
                    <div className={`text-lg sm:text-xl self-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                      {c.suit}
                    </div>
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-black leading-none rotate-180">
                      <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                      <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Round Announcement */}
        {roundResult && (
          <div className="my-2 z-10 py-1.5 px-4 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl animate-fade-in text-center">
            <span className="text-xs sm:text-sm font-black text-amber-300">{roundResult}</span>
          </div>
        )}

        {/* Betting Spots */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-lg z-10 mt-2">
          <button
            onClick={() => !isDealing && setBetSide('PLAYER')}
            className={`py-2.5 px-2 rounded-xl border flex flex-col items-center transition-all ${
              betSide === 'PLAYER'
                ? 'bg-blue-600 border-blue-400 text-white font-black ring-2 ring-blue-300 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 text-blue-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-black">PLAYER (2x)</span>
            <span className="text-[10px] opacity-75">1 : 1</span>
          </button>

          <button
            onClick={() => !isDealing && setBetSide('TIE')}
            className={`py-2.5 px-2 rounded-xl border flex flex-col items-center transition-all ${
              betSide === 'TIE'
                ? 'bg-emerald-600 border-emerald-400 text-white font-black ring-2 ring-emerald-300 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-black">TIE (9x)</span>
            <span className="text-[10px] opacity-75">8 : 1</span>
          </button>

          <button
            onClick={() => !isDealing && setBetSide('BANKER')}
            className={`py-2.5 px-2 rounded-xl border flex flex-col items-center transition-all ${
              betSide === 'BANKER'
                ? 'bg-rose-600 border-rose-400 text-white font-black ring-2 ring-rose-300 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 text-rose-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-black">BANKER (1.95x)</span>
            <span className="text-[10px] opacity-75">1 : 0.95</span>
          </button>
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
                setChip(val);
                sound.playChip();
              }}
              disabled={isDealing}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-xs shrink-0 whitespace-nowrap transition-all ${
                chip === val
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-102 ring-2 ring-yellow-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {formatCurrency(val).replace('.00', '')}
            </button>
          ))}
        </div>

        <button
          onClick={startRound}
          disabled={isDealing || balance < chip}
          className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            isDealing
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : balance < chip
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>{isDealing ? 'Dealing...' : balance < chip ? 'Low Balance' : `DEAL ${formatCurrency(chip)}`}</span>
        </button>
      </div>
    </div>
  );
};
