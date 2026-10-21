import React, { useState, useEffect, useRef } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Trophy, Shuffle, Sparkles } from 'lucide-react';

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
const VALUES = [
  { val: 'A', num: 1 },
  { val: '2', num: 2 },
  { val: '3', num: 3 },
  { val: '4', num: 4 },
  { val: '5', num: 5 },
  { val: '6', num: 6 },
  { val: '7', num: 7 },
  { val: '8', num: 8 },
  { val: '9', num: 9 },
  { val: '10', num: 10 },
  { val: 'J', num: 11 },
  { val: 'Q', num: 12 },
  { val: 'K', num: 13 }
];

export const AndarBaharEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [betSide, setBetSide] = useState<'ANDAR' | 'BAHAR'>('ANDAR');
  const [chip, setChip] = useState(currencyConfig.minBet);
  const [jokerCard, setJokerCard] = useState<Card | null>({ suit: '♥', value: '7', num: 7, color: 'red' });
  const [andarCards, setAndarCards] = useState<Card[]>([]);
  const [baharCards, setBaharCards] = useState<Card[]>([]);
  const [isDealing, setIsDealing] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winningSide, setWinningSide] = useState<'ANDAR' | 'BAHAR' | null>(null);
  const [roadmap, setRoadmap] = useState<('A' | 'B')[]>(['A', 'B', 'A', 'A', 'B', 'A']);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (chip < currencyConfig.minBet || chip > currencyConfig.maxBet) {
      setChip(currencyConfig.minBet);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [currencyConfig]);

  const drawCard = (forceVal?: string): Card => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    let valObj = forceVal
      ? VALUES.find(v => v.val === forceVal) || VALUES[0]
      : VALUES[Math.floor(Math.random() * VALUES.length)];
    return {
      suit,
      value: valObj.val,
      num: valObj.num,
      color: suit === '♥' || suit === '♦' ? 'red' : 'black'
    };
  };

  const startRound = () => {
    if (isDealing || balance < chip) return;
    setIsDealing(true);
    setWinningSide(null);
    setLastWin(null);
    setAndarCards([]);
    setBaharCards([]);
    sound.playChip();

    // 1. Pick Joker card
    const joker = drawCard();
    setJokerCard(joker);
    sound.playCardFlip();

    // 2. Secret house edge outcome
    const targetMult = betSide === 'ANDAR' ? 1.9 : 2.0;
    const outcome = calculateWinOutcome(chip, targetMult);

    const winner: 'ANDAR' | 'BAHAR' = outcome.isWin
      ? betSide
      : (betSide === 'ANDAR' ? 'BAHAR' : 'ANDAR');

    // Number of cards to deal before match (between 3 and 11 cards)
    const totalCardsBeforeMatch = Math.floor(3 + Math.random() * 8);

    const sequence: { side: 'ANDAR' | 'BAHAR'; card: Card }[] = [];
    let curSide: 'ANDAR' | 'BAHAR' = 'ANDAR';

    for (let i = 0; i < totalCardsBeforeMatch; i++) {
      // Non-matching card
      let nonMatch: Card;
      do {
        nonMatch = drawCard();
      } while (nonMatch.value === joker.value);

      sequence.push({ side: curSide, card: nonMatch });
      curSide = curSide === 'ANDAR' ? 'BAHAR' : 'ANDAR';
    }

    // Finally the winning card matching Joker
    const matchingCard = drawCard(joker.value);
    sequence.push({ side: winner, card: matchingCard });

    // Animate deals step by step
    let step = 0;
    const playNextCard = () => {
      if (step < sequence.length) {
        const item = sequence[step];
        sound.playCardFlip();
        if (item.side === 'ANDAR') {
          setAndarCards(prev => [...prev, item.card]);
        } else {
          setBaharCards(prev => [...prev, item.card]);
        }
        step++;
        timerRef.current = window.setTimeout(playNextCard, 280);
      } else {
        // Finish round
        setWinningSide(winner);
        setIsDealing(false);
        setRoadmap(prev => [...prev.slice(-9), winner === 'ANDAR' ? 'A' : 'B']);

        if (outcome.isWin) {
          const winAmt = chip * targetMult * bonusMultiplier;
          setLastWin(winAmt);
          sound.playWin();
          onPlay(chip, targetMult, true);
        } else {
          sound.playLose();
          onPlay(chip, 0, false);
        }
      }
    };

    timerRef.current = window.setTimeout(playNextCard, 500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            👑
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">Indian Andar Bahar • Joker Match Wins</span>
          </div>
        </div>

        {/* Roadmap */}
        <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-bold mr-1">Road:</span>
          {roadmap.slice(-6).map((r, i) => (
            <span
              key={i}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                r === 'A' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
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

      {/* Andar Bahar Velvet Table */}
      <div className="w-full bg-gradient-to-b from-amber-950/70 via-slate-950 to-amber-950/70 border-x-4 border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-between min-h-[350px] relative shadow-inner">
        {/* Center Joker / Trump Card Display */}
        <div className="flex flex-col items-center z-10">
          <div className="flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JOKER CARD (TRUMP)</span>
          </div>

          {jokerCard && (
            <div className="w-18 h-26 sm:w-22 sm:h-32 rounded-xl shadow-2xl flex flex-col justify-between p-2 border-2 border-yellow-400 bg-white ring-4 ring-yellow-400/30 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between text-xs sm:text-sm font-black leading-none">
                <span className={jokerCard.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{jokerCard.value}</span>
                <span className={jokerCard.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{jokerCard.suit}</span>
              </div>
              <div className={`text-2xl sm:text-3xl self-center ${jokerCard.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                {jokerCard.suit}
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-black leading-none rotate-180">
                <span className={jokerCard.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{jokerCard.value}</span>
                <span className={jokerCard.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{jokerCard.suit}</span>
              </div>
            </div>
          )}
        </div>

        {/* Andar & Bahar Deal Lanes */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-2xl mt-4 z-10">
          {/* ANDAR LANE */}
          <div
            onClick={() => !isDealing && setBetSide('ANDAR')}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
              betSide === 'ANDAR'
                ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            } ${winningSide === 'ANDAR' ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-black text-rose-400">ANDAR (1.9x)</span>
              {betSide === 'ANDAR' && (
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-black">
                  BET {formatCurrency(chip)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto min-h-[70px] p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 no-scrollbar">
              {andarCards.length === 0 ? (
                <span className="text-[11px] text-slate-500 m-auto">Waiting for deal...</span>
              ) : (
                andarCards.map((c, i) => (
                  <div
                    key={i}
                    className={`w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-white border border-slate-300 shadow-md flex flex-col justify-between p-1 shrink-0 ${
                      c.value === jokerCard?.value ? 'ring-2 ring-yellow-400 animate-bounce' : ''
                    }`}
                  >
                    <span className={`text-[10px] font-black ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                      {c.value}
                    </span>
                    <span className={`text-xs self-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                      {c.suit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BAHAR LANE */}
          <div
            onClick={() => !isDealing && setBetSide('BAHAR')}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
              betSide === 'BAHAR'
                ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            } ${winningSide === 'BAHAR' ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-black text-blue-400">BAHAR (2.0x)</span>
              {betSide === 'BAHAR' && (
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black">
                  BET {formatCurrency(chip)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto min-h-[70px] p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 no-scrollbar">
              {baharCards.length === 0 ? (
                <span className="text-[11px] text-slate-500 m-auto">Waiting for deal...</span>
              ) : (
                baharCards.map((c, i) => (
                  <div
                    key={i}
                    className={`w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-white border border-slate-300 shadow-md flex flex-col justify-between p-1 shrink-0 ${
                      c.value === jokerCard?.value ? 'ring-2 ring-yellow-400 animate-bounce' : ''
                    }`}
                  >
                    <span className={`text-[10px] font-black ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                      {c.value}
                    </span>
                    <span className={`text-xs self-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                      {c.suit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
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
