import React, { useState, useEffect } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Trophy, Plus, ShieldCheck, Flame, RotateCcw } from 'lucide-react';

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
  hidden: boolean;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const CARD_DECK = [
  { val: 'A', num: 11 },
  { val: '2', num: 2 },
  { val: '3', num: 3 },
  { val: '4', num: 4 },
  { val: '5', num: 5 },
  { val: '6', num: 6 },
  { val: '7', num: 7 },
  { val: '8', num: 8 },
  { val: '9', num: 9 },
  { val: '10', num: 10 },
  { val: 'J', num: 10 },
  { val: 'Q', num: 10 },
  { val: 'K', num: 10 }
];

export const BlackjackEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const [bet, setBet] = useState(currencyConfig.minBet);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'player_turn' | 'dealer_turn' | 'game_over'>('betting');
  const [resultMessage, setResultMessage] = useState<string>('');
  const [lastWin, setLastWin] = useState<number | null>(null);

  useEffect(() => {
    if (bet < currencyConfig.minBet || bet > currencyConfig.maxBet) {
      setBet(currencyConfig.minBet);
    }
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

  const calculateHandScore = (hand: Card[]): number => {
    const visibleCards = hand.filter(c => !c.hidden);
    let score = visibleCards.reduce((sum, c) => sum + c.num, 0);
    let aces = visibleCards.filter(c => c.value === 'A').length;

    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const isNaturalBlackjack = (hand: Card[]): boolean => {
    if (hand.length !== 2) return false;
    const hasAce = hand.some(c => c.value === 'A');
    const hasTen = hand.some(c => ['10', 'J', 'Q', 'K'].includes(c.value));
    return hasAce && hasTen;
  };

  // Start new round
  const startDeal = () => {
    if (gameState === 'player_turn' || balance < bet) return;
    setResultMessage('');
    setLastWin(null);
    sound.playChip();

    // House edge outcome check
    const outcome = calculateWinOutcome(bet, 2.0);

    let pCard1 = drawCard();
    let pCard2 = drawCard();
    let dCard1 = drawCard();
    let dCard2 = drawCard(true); // Hidden hole card

    if (outcome.isWin && Math.random() < 0.25) {
      // Natural Blackjack
      pCard1 = { suit: '♠', value: 'A', num: 11, color: 'black', hidden: false };
      pCard2 = { suit: '♦', value: 'K', num: 10, color: 'red', hidden: false };
      dCard1 = { suit: '♣', value: '9', num: 9, color: 'black', hidden: false };
    }

    const pHand = [pCard1, pCard2];
    const dHand = [dCard1, dCard2];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    sound.playCardFlip();

    if (isNaturalBlackjack(pHand)) {
      // Natural 21!
      const unhiddenD = dHand.map(c => ({ ...c, hidden: false }));
      setDealerHand(unhiddenD);

      if (isNaturalBlackjack(unhiddenD)) {
        // Push
        setGameState('game_over');
        setResultMessage('🤝 PUSH! Both have Blackjack');
        setLastWin(bet);
        onPlay(bet, 1.0, true);
      } else {
        // Win 3:2
        const winAmt = bet * 2.5 * bonusMultiplier;
        setGameState('game_over');
        setResultMessage('🎉 BLACKJACK! 3:2 Payout!');
        setLastWin(winAmt);
        sound.playWin();
        onPlay(bet, 2.5, true);
      }
    } else {
      setGameState('player_turn');
    }
  };

  // Player Hits
  const handleHit = () => {
    if (gameState !== 'player_turn') return;
    sound.playCardFlip();
    const newCard = drawCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const score = calculateHandScore(newHand);
    if (score > 21) {
      // Bust
      setGameState('game_over');
      setResultMessage('💥 BUST! Score exceeded 21');
      sound.playLose();
      onPlay(bet, 0, false);
    }
  };

  // Player Stands
  const handleStand = () => {
    if (gameState !== 'player_turn') return;
    setGameState('dealer_turn');

    // Reveal dealer's hole card
    let curDealer = dealerHand.map(c => ({ ...c, hidden: false }));
    sound.playCardFlip();

    let dScore = calculateHandScore(curDealer);
    while (dScore < 17) {
      curDealer.push(drawCard());
      dScore = calculateHandScore(curDealer);
    }

    setDealerHand(curDealer);
    const pScore = calculateHandScore(playerHand);

    setGameState('game_over');
    if (dScore > 21) {
      // Dealer busts, player wins
      const winAmt = bet * 2.0 * bonusMultiplier;
      setResultMessage('🎉 DEALER BUST! You Win!');
      setLastWin(winAmt);
      sound.playWin();
      onPlay(bet, 2.0, true);
    } else if (pScore > dScore) {
      // Player higher
      const winAmt = bet * 2.0 * bonusMultiplier;
      setResultMessage(`🎉 YOU WIN! (${pScore} vs ${dScore})`);
      setLastWin(winAmt);
      sound.playWin();
      onPlay(bet, 2.0, true);
    } else if (pScore === dScore) {
      // Push
      setResultMessage(`🤝 PUSH! Tie at ${pScore}`);
      setLastWin(bet);
      onPlay(bet, 1.0, true);
    } else {
      // Dealer higher
      setResultMessage(`Dealer wins (${dScore} vs ${pScore})`);
      sound.playLose();
      onPlay(bet, 0, false);
    }
  };

  // Double Down
  const handleDouble = () => {
    if (gameState !== 'player_turn' || playerHand.length !== 2 || balance < bet * 2) return;
    sound.playChip();
    sound.playCardFlip();

    const doubleBet = bet * 2;
    const newCard = drawCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const pScore = calculateHandScore(newHand);
    if (pScore > 21) {
      setGameState('game_over');
      setResultMessage('💥 BUST on Double Down!');
      sound.playLose();
      onPlay(doubleBet, 0, false);
      return;
    }

    // Dealer draws
    let curDealer = dealerHand.map(c => ({ ...c, hidden: false }));
    let dScore = calculateHandScore(curDealer);
    while (dScore < 17) {
      curDealer.push(drawCard());
      dScore = calculateHandScore(curDealer);
    }
    setDealerHand(curDealer);

    setGameState('game_over');
    if (dScore > 21 || pScore > dScore) {
      const winAmt = doubleBet * 2.0 * bonusMultiplier;
      setResultMessage(`🎉 DOUBLE WIN! ${pScore} vs ${dScore}`);
      setLastWin(winAmt);
      sound.playWin();
      onPlay(doubleBet, 2.0, true);
    } else if (pScore === dScore) {
      setResultMessage(`🤝 PUSH at ${pScore}`);
      setLastWin(doubleBet);
      onPlay(doubleBet, 1.0, true);
    } else {
      setResultMessage(`Dealer wins (${dScore} vs ${pScore})`);
      sound.playLose();
      onPlay(doubleBet, 0, false);
    }
  };

  const pScore = calculateHandScore(playerHand);
  const dScore = calculateHandScore(dealerHand);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Table Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🃏
          </div>
          <div>
            <h3 className="text-white font-black text-sm sm:text-base leading-tight">{game.title}</h3>
            <span className="text-[11px] text-slate-400">Blackjack 21 • Pays 3:2 • Dealer stands on 17</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}
      </div>

      {/* Blackjack Green Felt Table */}
      <div className="w-full bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 border-x-4 border-slate-800 p-4 sm:p-8 flex flex-col items-center justify-between min-h-[340px] relative shadow-inner">
        {/* Felt Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-8xl sm:text-9xl font-black text-emerald-400">21</span>
        </div>

        {/* Dealer Zone */}
        <div className="flex flex-col items-center space-y-2 z-10 w-full">
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1 rounded-full">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Dealer Score:</span>
            <span className="text-xs font-black text-amber-400">{dealerHand.length > 0 ? dScore : '-'}</span>
          </div>

          <div className="flex items-center justify-center gap-2 min-h-[85px] sm:min-h-[110px]">
            {dealerHand.length === 0 ? (
              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400/40">
                DEALER
              </div>
            ) : (
              dealerHand.map((c, i) => (
                <div
                  key={i}
                  className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-2xl flex flex-col justify-between p-1.5 sm:p-2 border-2 transition-transform transform hover:scale-105 ${
                    c.hidden
                      ? 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border-blue-400/40'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {c.hidden ? (
                    <div className="w-full h-full rounded-lg border border-blue-400/30 flex items-center justify-center text-blue-300 font-black text-xs">
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

        {/* Center Felt Announcement Banner */}
        {resultMessage ? (
          <div className="my-2 z-10 py-1.5 px-4 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl animate-fade-in text-center">
            <span className="text-xs sm:text-sm font-black text-amber-300">{resultMessage}</span>
          </div>
        ) : (
          <div className="my-2 z-10 text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400/50">
            Blackjack pays 3 to 2 • Dealer draws to 16, stands on 17
          </div>
        )}

        {/* Player Zone */}
        <div className="flex flex-col items-center space-y-2 z-10 w-full">
          <div className="flex items-center justify-center gap-2 min-h-[85px] sm:min-h-[110px]">
            {playerHand.length === 0 ? (
              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400/40">
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
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Your Score:</span>
            <span className={`text-xs font-black ${pScore > 21 ? 'text-rose-400' : pScore === 21 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {playerHand.length > 0 ? pScore : '-'}
            </span>
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
              disabled={gameState === 'player_turn'}
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

        {/* Action Buttons */}
        {gameState === 'player_turn' ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleHit}
              className="flex-1 sm:w-28 py-2.5 px-3 rounded-xl font-black text-xs uppercase bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>HIT</span>
            </button>
            <button
              onClick={handleStand}
              className="flex-1 sm:w-28 py-2.5 px-3 rounded-xl font-black text-xs uppercase bg-rose-600 hover:bg-rose-500 text-white shadow-lg flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>STAND</span>
            </button>
            {playerHand.length === 2 && balance >= bet * 2 && (
              <button
                onClick={handleDouble}
                className="flex-1 sm:w-28 py-2.5 px-3 rounded-xl font-black text-xs uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
              >
                <Flame className="w-4 h-4" />
                <span>2X DOUBLE</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={startDeal}
            disabled={balance < bet}
            className={`w-full sm:w-48 py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
              balance < bet
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{balance < bet ? 'Low Balance' : `DEAL ${formatCurrency(bet)}`}</span>
          </button>
        )}
      </div>
    </div>
  );
};
