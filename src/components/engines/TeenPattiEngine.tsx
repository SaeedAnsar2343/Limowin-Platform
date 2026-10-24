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

interface HandRank {
  rank: number; // 6: Trio, 5: Pure Seq, 4: Seq, 3: Color, 2: Pair, 1: High
  name: string;
  mult: number;
}

export const TeenPattiEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<string>('');
  const timerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

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

  const evaluateHand = (cards: Card[]): HandRank => {
    const nums = cards.map(c => c.num).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);
    const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

    // Check Trail / Trio (Three of a Kind)
    if (nums[0] === nums[1] && nums[1] === nums[2]) {
      return { rank: 6, name: `Trio of ${cards[0].value}'s`, mult: 25.0 };
    }

    // Check Straight (Sequence) including A-2-3 or Q-K-A
    const isNormalStraight = nums[0] + 1 === nums[1] && nums[1] + 1 === nums[2];
    const isAcesLowStraight = nums[0] === 2 && nums[1] === 3 && nums[2] === 14;
    const isStraight = isNormalStraight || isAcesLowStraight;

    // Pure Sequence (Straight Flush)
    if (isFlush && isStraight) {
      return { rank: 5, name: 'Pure Sequence (Straight Flush)', mult: 10.0 };
    }

    // Normal Sequence
    if (isStraight) {
      return { rank: 4, name: 'Sequence (Straight)', mult: 5.0 };
    }

    // Color (Flush)
    if (isFlush) {
      return { rank: 3, name: 'Color (Flush)', mult: 3.0 };
    }

    // Pair
    if (nums[0] === nums[1] || nums[1] === nums[2]) {
      const pairVal = nums[1];
      const valStr = CARD_DECK.find(d => d.num === pairVal)?.val || '';
      return { rank: 2, name: `Pair of ${valStr}'s`, mult: 2.0 };
    }

    // High Card
    const highVal = CARD_DECK.find(d => d.num === nums[2])?.val || 'High';
    return { rank: 1, name: `High Card ${highVal}`, mult: 1.9 };
  };

  const playRound = () => {
    if (isPlaying || balance < bet) return;
    setIsPlaying(true);
    setRoundResult('');
    setLastWin(null);
    sound.playChip();

    const outcome = calculateWinOutcome(bet, 2.0);

    // Deal cards
    let pCards = [drawCard(), drawCard(), drawCard()];
    let dCards = [drawCard(true), drawCard(true), drawCard(true)];

    if (outcome.isWin) {
      // Give player a solid winning hand (Pure Sequence or Pair)
      pCards = [
        { suit: '♠', value: 'Q', num: 12, color: 'black' },
        { suit: '♠', value: 'K', num: 13, color: 'black' },
        { suit: '♠', value: 'A', num: 14, color: 'black' }
      ];
      dCards = [
        { suit: '♣', value: 'J', num: 11, color: 'black', hidden: true },
        { suit: '♠', value: '8', num: 8, color: 'black', hidden: true },
        { suit: '♦', value: '5', num: 5, color: 'red', hidden: true }
      ];
    } else {
      // Dealer holds higher hand (Pair of Kings vs High Card)
      pCards = [
        { suit: '♥', value: '9', num: 9, color: 'red' },
        { suit: '♦', value: '6', num: 6, color: 'red' },
        { suit: '♣', value: '3', num: 3, color: 'black' }
      ];
      dCards = [
        { suit: '♠', value: 'K', num: 13, color: 'black', hidden: true },
        { suit: '♦', value: 'K', num: 13, color: 'red', hidden: true },
        { suit: '♣', value: '10', num: 10, color: 'black', hidden: true }
      ];
    }

    setPlayerHand(pCards);
    setDealerHand(dCards);
    sound.playCardFlip();

    // Showdown after delay
    timerRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      // Reveal dealer cards
      const revealedDealer = dCards.map(c => ({ ...c, hidden: false }));
      setDealerHand(revealedDealer);
      sound.playCardFlip();

      const pRank = evaluateHand(pCards);
      const dRank = evaluateHand(revealedDealer);

      setIsPlaying(false);

      if (outcome.isWin) {
        const mult = pRank.mult || 2.0;
        const winAmt = bet * mult * bonusMultiplier;
        setRoundResult(`🎉 YOU WIN with ${pRank.name}!`);
        setLastWin(winAmt);
        sound.playWin();
        onPlay(bet, mult, true);
      } else {
        setRoundResult(`Dealer wins with ${dRank.name}`);
        sound.playLose();
        onPlay(bet, 0, false);
      }
    }, 1200);
  };

  const pEval = playerHand.length === 3 ? evaluateHand(playerHand) : null;
  const dEval = dealerHand.length === 3 && !dealerHand[0].hidden ? evaluateHand(dealerHand) : null;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🂡
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">Indian 3-Card Teen Patti • Trail pays up to 25x</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Teen Patti Crimson Velvet Table */}
      <div className="w-full bg-gradient-to-b from-rose-950 via-slate-950 to-rose-950 border-x-4 border-slate-800 p-4 sm:p-8 flex flex-col items-center justify-between min-h-[350px] relative shadow-inner">
        {/* Dealer Zone */}
        <div className="flex flex-col items-center space-y-2 z-10 w-full">
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1 rounded-full">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Dealer Hand:</span>
            <span className="text-xs font-black text-amber-400">{dEval ? dEval.name : 'Face Down'}</span>
          </div>

          <div className="flex items-center justify-center gap-2 min-h-[90px] sm:min-h-[115px]">
            {dealerHand.length === 0 ? (
              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-rose-500/30 flex items-center justify-center text-[10px] text-rose-400/40">
                DEALER
              </div>
            ) : (
              dealerHand.map((c, i) => (
                <div
                  key={i}
                  className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-2xl flex flex-col justify-between p-1.5 sm:p-2 border-2 transition-transform ${
                    c.hidden
                      ? 'bg-gradient-to-br from-red-950 via-rose-950 to-slate-900 border-rose-500/40'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {c.hidden ? (
                    <div className="w-full h-full rounded-lg border border-rose-400/30 flex items-center justify-center text-rose-300 font-black text-xs">
                      🂠
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs sm:text-sm font-black leading-none">
                        <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                        <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                      </div>
                      <div className={`text-xl sm:text-2xl self-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                        {c.suit}
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm font-black leading-none rotate-180">
                        <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                        <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Round Announcement */}
        {roundResult ? (
          <div className="my-2 z-10 py-1.5 px-4 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl animate-fade-in text-center">
            <span className="text-xs sm:text-sm font-black text-amber-300">{roundResult}</span>
          </div>
        ) : (
          <div className="my-2 z-10 flex items-center space-x-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-300/60">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Trail &gt; Pure Sequence &gt; Sequence &gt; Color &gt; Pair</span>
          </div>
        )}

        {/* Player Zone */}
        <div className="flex flex-col items-center space-y-2 z-10 w-full">
          <div className="flex items-center justify-center gap-2 min-h-[90px] sm:min-h-[115px]">
            {playerHand.length === 0 ? (
              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-rose-500/30 flex items-center justify-center text-[10px] text-rose-400/40">
                PLAYER
              </div>
            ) : (
              playerHand.map((c, i) => (
                <div
                  key={i}
                  className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-2xl flex flex-col justify-between p-1.5 sm:p-2 border-2 border-slate-300 bg-white transition-transform transform hover:scale-105"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black leading-none">
                    <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                    <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                  </div>
                  <div className={`text-xl sm:text-2xl self-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                    {c.suit}
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black leading-none rotate-180">
                    <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                    <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1 rounded-full">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Your Hand:</span>
            <span className="text-xs font-black text-amber-400">{pEval ? pEval.name : '-'}</span>
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
                setBet(val);
                sound.playChip();
              }}
              disabled={isPlaying}
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

        <button
          onClick={playRound}
          disabled={isPlaying || balance < bet}
          className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            isPlaying
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : balance < bet
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>{isPlaying ? 'Dealing...' : balance < bet ? 'Low Balance' : `PLAY ${formatCurrency(bet)}`}</span>
        </button>
      </div>
    </div>
  );
};
