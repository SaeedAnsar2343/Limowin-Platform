import React, { useState, useEffect } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Layers, Trophy, Shuffle } from 'lucide-react';

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

export const CardGameEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const isDragonTiger = game.id.includes('dragon') || game.title.toLowerCase().includes('dragon');
  const isAndarBahar = game.id.includes('andar') || game.title.toLowerCase().includes('andar');

  const [sideA, setSideA] = useState<Card[]>([
    { suit: '♠', value: 'K', num: 13, color: 'black' }
  ]);
  const [sideB, setSideB] = useState<Card[]>([
    { suit: '♥', value: 'Q', num: 12, color: 'red' }
  ]);
  const [isDealing, setIsDealing] = useState(false);
  const [betSide, setBetSide] = useState<'A' | 'B' | 'TIE'>('A');
  const [chip, setChip] = useState(currencyConfig.minBet);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [roadmap, setRoadmap] = useState<('A' | 'B' | 'T')[]>(['A', 'B', 'B', 'A', 'A', 'B']);

  useEffect(() => {
    if (chip < currencyConfig.minBet || chip > currencyConfig.maxBet) {
      setChip(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  const getLabelA = () => {
    if (isDragonTiger) return 'DRAGON';
    if (isAndarBahar) return 'ANDAR';
    return 'PLAYER';
  };

  const getLabelB = () => {
    if (isDragonTiger) return 'TIGER';
    if (isAndarBahar) return 'BAHAR';
    return 'BANKER';
  };

  const drawCardWithNum = (targetNum?: number): Card => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    let valObj = targetNum !== undefined
      ? VALUES.find(v => v.num === targetNum) || VALUES[0]
      : VALUES[Math.floor(Math.random() * VALUES.length)];
    return {
      suit,
      value: valObj.val,
      num: valObj.num,
      color: suit === '♥' || suit === '♦' ? 'red' : 'black'
    };
  };

  const dealRound = () => {
    if (isDealing || balance < chip) return;
    setIsDealing(true);
    setLastWin(null);
    sound.playChip();

    const theoreticalMult = betSide === 'TIE' ? 8.0 : 2.0;
    const outcome = calculateWinOutcome(chip, theoreticalMult);

    let cardANum = Math.floor(2 + Math.random() * 11); // 2-12
    let cardBNum: number;

    if (outcome.isWin) {
      if (betSide === 'A') {
        cardBNum = Math.max(1, cardANum - Math.floor(1 + Math.random() * 3));
      } else if (betSide === 'B') {
        cardBNum = Math.min(13, cardANum + Math.floor(1 + Math.random() * 3));
      } else {
        cardBNum = cardANum;
      }
    } else {
      if (betSide === 'A') {
        cardBNum = Math.min(13, cardANum + Math.floor(1 + Math.random() * 3));
      } else if (betSide === 'B') {
        cardBNum = Math.max(1, cardANum - Math.floor(1 + Math.random() * 3));
      } else {
        cardBNum = cardANum > 1 ? cardANum - 1 : cardANum + 1;
      }
    }

    const cardA = drawCardWithNum(cardANum);
    const cardB = drawCardWithNum(cardBNum);

    setTimeout(() => {
      sound.playCardFlip();
      setSideA([cardA]);
    }, 400);

    setTimeout(() => {
      sound.playCardFlip();
      setSideB([cardB]);

      setIsDealing(false);
      let outcomeSymbol: 'A' | 'B' | 'T' = cardA.num > cardB.num ? 'A' : cardB.num > cardA.num ? 'B' : 'T';
      setRoadmap(prev => [...prev.slice(1), outcomeSymbol]);

      if (outcome.isWin) {
        setLastWin(chip * outcome.multiplier * bonusMultiplier);
      } else {
        setLastWin(null);
      }

      onPlay(chip, outcome.multiplier, outcome.isWin);
    }, 950);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      {/* Table Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            🃏
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{game.title}</h3>
            <span className="text-xs text-slate-400">Live Studio Engine • {game.provider}</span>
          </div>
        </div>

        {lastWin !== null && lastWin > 0 && (
          <div className="bg-emerald-900 text-emerald-300 px-4 py-1.5 rounded-full font-black text-sm flex items-center space-x-2 animate-bounce shadow-lg">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>WIN +{formatCurrency(lastWin)}!</span>
          </div>
        )}

        {/* Live Roadmap */}
        <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 font-bold mr-1">Roadmap:</span>
          {roadmap.map((res, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                res === 'A'
                  ? 'bg-rose-600 text-white'
                  : res === 'B'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {res}
            </div>
          ))}
        </div>
      </div>

      {/* 3D Casino Felt Green Table */}
      <div className="w-full bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 border-x-4 border-slate-800 p-8 shadow-inner relative overflow-hidden">
        <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
          {/* Side A Card (Dragon/Andar/Player) */}
          <div className="flex flex-col items-center space-y-3">
            <span className="font-black text-sm tracking-wider text-rose-400 uppercase bg-slate-950/80 px-4 py-1 rounded-full border border-rose-500/30">
              {getLabelA()}
            </span>
            <div
              className={`w-28 h-40 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-3 flex flex-col justify-between transition-transform transform ${
                isDealing ? 'scale-95 blur-[0.4px]' : 'hover:scale-105'
              }`}
            >
              <div
                className={`text-lg font-black leading-none ${
                  sideA[0]?.color === 'red' ? 'text-rose-600' : 'text-slate-950'
                }`}
              >
                {sideA[0]?.value}
                <span className="block text-sm">{sideA[0]?.suit}</span>
              </div>
              <div
                className={`text-4xl text-center self-center ${
                  sideA[0]?.color === 'red' ? 'text-rose-600' : 'text-slate-950'
                }`}
              >
                {sideA[0]?.suit}
              </div>
              <div
                className={`text-lg font-black text-right leading-none ${
                  sideA[0]?.color === 'red' ? 'text-rose-600' : 'text-slate-950'
                }`}
              >
                {sideA[0]?.value}
              </div>
            </div>
          </div>

          {/* Side B Card (Tiger/Bahar/Banker) */}
          <div className="flex flex-col items-center space-y-3">
            <span className="font-black text-sm tracking-wider text-blue-400 uppercase bg-slate-950/80 px-4 py-1 rounded-full border border-blue-500/30">
              {getLabelB()}
            </span>
            <div
              className={`w-28 h-40 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-3 flex flex-col justify-between transition-transform transform ${
                isDealing ? 'scale-95 blur-[0.4px]' : 'hover:scale-105'
              }`}
            >
              <div
                className={`text-lg font-black leading-none ${
                  sideB[0]?.color === 'red' ? 'text-rose-600' : 'text-slate-950'
                }`}
              >
                {sideB[0]?.value}
                <span className="block text-sm">{sideB[0]?.suit}</span>
              </div>
              <div
                className={`text-4xl text-center self-center ${
                  sideB[0]?.color === 'red' ? 'text-rose-600' : 'text-slate-950'
                }`}
              >
                {sideB[0]?.suit}
              </div>
              <div
                className={`text-lg font-black text-right leading-none ${
                  sideB[0]?.color === 'red' ? 'text-rose-600' : 'text-slate-950'
                }`}
              >
                {sideB[0]?.value}
              </div>
            </div>
          </div>
        </div>

        {/* Tie Zone Marker */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setBetSide('TIE')}
            className={`px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
              betSide === 'TIE'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400 shadow-lg'
                : 'bg-slate-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-950'
            }`}
          >
            TIE (8x Payout)
          </button>
        </div>
      </div>

      {/* Control Console */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Bet Selection Tiles */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <button
            onClick={() => setBetSide('A')}
            className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
              betSide === 'A'
                ? 'bg-rose-600 border-rose-400 text-white font-black shadow-lg scale-102 ring-2 ring-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <span className="text-xs font-black">{getLabelA()} (2x)</span>
            <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-full">1:1</span>
          </button>

          <button
            onClick={() => setBetSide('B')}
            className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
              betSide === 'B'
                ? 'bg-blue-600 border-blue-400 text-white font-black shadow-lg scale-102 ring-2 ring-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <span className="text-xs font-black">{getLabelB()} (2x)</span>
            <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-full">1:1</span>
          </button>
        </div>

        {/* Chip row & Deal */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Chip:</span>
            {currencyConfig.betPresets.slice(0, 5).map(val => (
              <button
                key={val}
                onClick={() => {
                  setChip(val);
                  sound.playChip();
                }}
                disabled={isDealing}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                  chip === val
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>

          <button
            onClick={dealRound}
            disabled={isDealing || balance < chip}
            className={`w-full sm:w-48 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
              isDealing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : balance < chip
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
            }`}
          >
            <Shuffle className="w-5 h-5" />
            <span>
              {isDealing ? 'Dealing...' : balance < chip ? 'Low Balance' : `DEAL ${formatCurrency(chip)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
