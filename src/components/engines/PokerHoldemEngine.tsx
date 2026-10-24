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
  hidden?: boolean;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const CARD_DECK = [
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
  { val: 'K', num: 13 },
  { val: 'A', num: 14 }
];

export const PokerHoldemEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [playerHole, setPlayerHole] = useState<Card[]>([]);
  const [dealerHole, setDealerHole] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'flop' | 'river' | 'showdown'>('idle');
  const [roundResult, setRoundResult] = useState<string>('');
  const [lastWin, setLastWin] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const plannedOutcomeRef = useRef<{ isWin: boolean; multiplier: number }>({ isWin: false, multiplier: 0 });

  useEffect(() => {
    isMountedRef.current = true;
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currencyConfig]);

  const drawCard = (hidden = false): Card => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const def = CARD_DECK[Math.floor(Math.random() * CARD_DECK.length)];
    return {
      suit,
      value: def.val,
      num: def.num,
      color: suit === '♥' || suit === '♦' ? 'red' : 'black',
      hidden
    };
  };

  const dealInitialHand = () => {
    if (gameState !== 'idle' || balance < bet) return;
    setRoundResult('');
    setLastWin(null);
    sound.playChip();

    const outcome = calculateWinOutcome(bet, 2.5);
    plannedOutcomeRef.current = outcome;

    let pHole = [drawCard(), drawCard()];
    let dHole = [drawCard(true), drawCard(true)];

    if (outcome.isWin) {
      pHole = [
        { suit: '♠', value: 'A', num: 14, color: 'black' },
        { suit: '♥', value: 'K', num: 13, color: 'red' }
      ];
    } else {
      pHole = [
        { suit: '♣', value: 'J', num: 11, color: 'black' },
        { suit: '♦', value: '8', num: 8, color: 'red' }
      ];
    }

    setPlayerHole(pHole);
    setDealerHole(dHole);
    setCommunityCards([]);
    setGameState('flop');
    sound.playCardFlip();

    // Deal Flop after slight pause
    timerRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      const flop = [drawCard(), drawCard(), drawCard()];
      if (outcome.isWin) {
        flop[0] = { suit: '♦', value: 'A', num: 14, color: 'red' };
      }
      setCommunityCards(flop);
      sound.playCardFlip();
      setGameState('river');
    }, 600);
  };

  const finishShowdown = () => {
    if (gameState !== 'river') return;
    sound.playCardFlip();

    // Add Turn & River
    const turn = drawCard();
    const river = drawCard();
    const fullBoard = [...communityCards, turn, river];
    setCommunityCards(fullBoard);

    const outcome = plannedOutcomeRef.current;
    setGameState('showdown');

    // Reveal dealer hole cards with guaranteed visual showdown
    let revealedDealer: Card[];
    if (outcome.isWin) {
      revealedDealer = [
        { suit: '♣', value: '10', num: 10, color: 'black', hidden: false },
        { suit: '♦', value: '7', num: 7, color: 'red', hidden: false }
      ];
      setDealerHole(revealedDealer);
      const mult = 2.5;
      const winAmt = bet * mult * bonusMultiplier;
      setRoundResult('🎉 YOU WIN with Two Pair (Aces & Kings)!');
      setLastWin(winAmt);
      sound.playWin();
      onPlay(bet, mult, true);
    } else {
      revealedDealer = [
        { suit: '♠', value: 'A', num: 14, color: 'black', hidden: false },
        { suit: '♥', value: 'A', num: 14, color: 'red', hidden: false }
      ];
      setDealerHole(revealedDealer);
      setRoundResult('Dealer wins with Pocket Aces (A-A)');
      sound.playLose();
      onPlay(bet, 0, false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            ♠️
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">Texas Hold'em Poker • Flop, Turn & River • 5-Card Showdown</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Poker Table Felt */}
      <div className="w-full bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 border-x-4 border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-between min-h-[360px] relative shadow-inner">
        {/* Dealer Hole Cards */}
        <div className="flex flex-col items-center space-y-1.5 z-10">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Dealer Hand</span>
          <div className="flex items-center gap-2">
            {dealerHole.length === 0 ? (
              <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl border border-dashed border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400/40">
                DEALER
              </div>
            ) : (
              dealerHole.map((c, i) => (
                <div
                  key={i}
                  className={`w-14 h-20 sm:w-16 sm:h-24 rounded-xl shadow-xl flex flex-col justify-between p-1.5 border ${
                    c.hidden
                      ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-400/40'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {c.hidden ? (
                    <div className="w-full h-full rounded border border-indigo-400/20 flex items-center justify-center text-xs text-indigo-300">
                      🂠
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[11px] font-black leading-none">
                        <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                        <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                      </div>
                      <div className={`text-lg self-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>{c.suit}</div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5 Community Cards in Center Board */}
        <div className="flex flex-col items-center my-3 z-10">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-700/60 px-3 py-0.5 rounded-full text-[10px] font-black text-amber-300 mb-2">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>COMMUNITY BOARD (FLOP • TURN • RIVER)</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const card = communityCards[i];
              return (
                <div
                  key={i}
                  className={`w-12 h-18 sm:w-16 sm:h-24 rounded-xl flex flex-col justify-between p-1 sm:p-1.5 border shadow-md transition-all ${
                    card
                      ? 'bg-white border-slate-300 transform scale-102'
                      : 'border-dashed border-emerald-500/30 bg-slate-900/40 text-emerald-500/30 items-center justify-center text-[10px]'
                  }`}
                >
                  {card ? (
                    <>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs font-black leading-none">
                        <span className={card.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{card.value}</span>
                        <span className={card.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{card.suit}</span>
                      </div>
                      <div className={`text-base sm:text-xl self-center ${card.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                        {card.suit}
                      </div>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs font-black leading-none rotate-180">
                        <span className={card.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{card.value}</span>
                        <span className={card.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{card.suit}</span>
                      </div>
                    </>
                  ) : (
                    <span>{i < 3 ? 'FLOP' : i === 3 ? 'TURN' : 'RIVER'}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Round Result Alert */}
        {roundResult && (
          <div className="my-1 z-10 py-1.5 px-4 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl animate-fade-in text-center">
            <span className="text-xs sm:text-sm font-black text-amber-300">{roundResult}</span>
          </div>
        )}

        {/* Player Hole Cards */}
        <div className="flex flex-col items-center space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            {playerHole.length === 0 ? (
              <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl border border-dashed border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400/40">
                YOU
              </div>
            ) : (
              playerHole.map((c, i) => (
                <div
                  key={i}
                  className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl shadow-xl flex flex-col justify-between p-1.5 border border-slate-300 bg-white transform hover:scale-105"
                >
                  <div className="flex items-center justify-between text-[11px] font-black leading-none">
                    <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                    <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                  </div>
                  <div className={`text-lg self-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>{c.suit}</div>
                  <div className="flex items-center justify-between text-[11px] font-black leading-none rotate-180">
                    <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                    <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Your Hole Cards</span>
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
              disabled={gameState === 'river'}
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

        {gameState === 'river' ? (
          <button
            onClick={finishShowdown}
            className="w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 animate-pulse"
          >
            <Shuffle className="w-4 h-4" />
            <span>SHOWDOWN (SEE RIVER)</span>
          </button>
        ) : (
          <button
            onClick={dealInitialHand}
            disabled={balance < bet}
            className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
              balance < bet
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>{balance < bet ? 'Low Balance' : `DEAL ${formatCurrency(bet)}`}</span>
          </button>
        )}
      </div>
    </div>
  );
};
