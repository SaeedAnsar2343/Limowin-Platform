import React, { useState, useEffect } from 'react';
import { GameItem } from '../../data/gamesCatalog';
import { sound } from '../../utils/soundEffects';
import { useApp } from '../../context/AppContext';
import { Trophy, Activity, Play } from 'lucide-react';

interface Props {
  game: GameItem;
  balance: number;
  bonusMultiplier: number;
  onPlay: (bet: number, multiplier: number, isWin: boolean) => void;
}

export const SportsMatchEngine: React.FC<Props> = ({ game, balance, bonusMultiplier, onPlay }) => {
  const { currencyConfig, formatCurrency, calculateWinOutcome } = useApp();
  const isCricket = game.id.includes('cricket') || game.id.includes('9wickets') || game.id.includes('ipl');
  const [stake, setStake] = useState(currencyConfig.minBet);
  const [selectedOdd, setSelectedOdd] = useState<{ market: string; team: string; odds: number }>({
    market: 'Match Winner',
    team: isCricket ? 'Royal Challengers' : 'Manchester City',
    odds: 1.85
  });
  const [commentary, setCommentary] = useState<string>('Match in progress. High pressure in the middle!');
  const [score, setScore] = useState({
    teamA: isCricket ? 178 : 2,
    teamB: isCricket ? 172 : 1,
    time: isCricket ? '18.4 Overs' : '78\''
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  useEffect(() => {
    if (stake < currencyConfig.minBet || stake > currencyConfig.maxBet) {
      setStake(currencyConfig.minBet);
    }
  }, [currencyConfig]);

  useEffect(() => {
    const comments = isCricket
      ? [
          'Over 18.2: Smashed through covers for FOUR! Superb timing.',
          'Over 18.3: Yorker on middle stump, dug out for a single.',
          'Over 18.4: Massive SIX over deep mid-wicket! Crowd erupts!',
          'Over 18.5: Swing and a miss! Excellent slower bouncer.'
        ]
      : [
          '74\': Counter-attack down the right flank, cross blocked for corner.',
          '76\': Header glanced towards goal, fingertips save by the keeper!',
          '78\': GOAL! Stunning curling shot right into the top corner!',
          '80\': Dangerous free-kick awarded 25 yards out.'
        ];

    let idx = 0;
    const interval = setInterval(() => {
      setCommentary(comments[idx % comments.length]);
      idx++;
    }, 4000);
    return () => clearInterval(interval);
  }, [isCricket]);

  const placeBet = () => {
    if (isSimulating || balance < stake) return;
    setIsSimulating(true);
    setLastWin(null);
    sound.playChip();

    setTimeout(() => {
      setIsSimulating(false);
      // Secret outcome calculation
      const outcome = calculateWinOutcome(stake, selectedOdd.odds);

      if (outcome.isWin) {
        setLastWin(stake * outcome.multiplier * bonusMultiplier);
        sound.playWin();
      } else {
        setLastWin(null);
        sound.playBounce();
      }

      onPlay(stake, outcome.multiplier, outcome.isWin);
    }, 1400);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none">
      {/* Stadium Virtual Board */}
      <div className="w-full bg-slate-950 border border-slate-800 rounded-t-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Match Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              LIVE IN-PLAY: {game.title}
            </span>
          </div>

          {lastWin !== null && lastWin > 0 && (
            <div className="bg-emerald-900 text-emerald-300 px-4 py-1 rounded-full font-black text-xs flex items-center space-x-1.5 animate-bounce shadow-lg">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>BET WON +{formatCurrency(lastWin)}!</span>
            </div>
          )}

          <span className="text-xs bg-rose-950/80 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full font-bold">
            {score.time}
          </span>
        </div>

        {/* Live Scoreboard */}
        <div className="grid grid-cols-3 gap-4 items-center text-center my-4">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">{isCricket ? '🏏' : '⚽'}</span>
            <span className="text-white font-black text-base">{isCricket ? 'Royal Challengers' : 'Manchester City'}</span>
            <span className="text-3xl font-black text-amber-400 mt-1">{score.teamA}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">VERSUS</span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full mt-2">
              LIVE ODDS
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">{isCricket ? '🏆' : '⚽'}</span>
            <span className="text-white font-black text-base">{isCricket ? 'Super Kings' : 'Real Madrid'}</span>
            <span className="text-3xl font-black text-amber-400 mt-1">{score.teamB}</span>
          </div>
        </div>

        {/* Live Commentary Feed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center space-x-3 text-xs text-slate-300">
          <Activity className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
          <span className="font-mono">{commentary}</span>
        </div>
      </div>

      {/* Markets Selection */}
      <div className="w-full bg-slate-900 border-x-4 border-slate-800 p-3 sm:p-6 space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Select Betting Market:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { market: 'Match Winner', team: isCricket ? 'Royal Challengers' : 'Manchester City', odds: 1.85 },
            { market: 'Match Tie / Draw', team: 'Draw', odds: 3.40 },
            { market: 'Match Winner', team: isCricket ? 'Super Kings' : 'Real Madrid', odds: 2.10 }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOdd(item)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                selectedOdd.team === item.team
                  ? 'bg-amber-500 border-yellow-300 text-slate-950 font-black shadow-lg ring-2 ring-yellow-400 scale-102'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
              }`}
            >
              <div className="text-left">
                <span className="text-[10px] block opacity-70 uppercase font-bold">{item.market}</span>
                <span className="text-xs font-black">{item.team}</span>
              </div>
              <span className="text-sm font-black bg-slate-950/60 px-2.5 py-1 rounded-xl">
                {item.odds}x
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Betting Console */}
      <div className="w-full bg-slate-900 border-4 border-t-0 border-slate-800 rounded-b-2xl p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1">Stake:</span>
          {currencyConfig.betPresets.slice(0, 5).map(val => (
            <button
              key={val}
              onClick={() => {
                setStake(val);
                sound.playChip();
              }}
              disabled={isSimulating}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                stake === val
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {formatCurrency(val)}
            </button>
          ))}
        </div>

        <button
          onClick={placeBet}
          disabled={isSimulating || balance < stake}
          className={`w-full sm:w-56 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
            isSimulating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : balance < stake
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-yellow-500/25'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>
            {isSimulating
              ? 'Placing Bet...'
              : balance < stake
              ? 'Low Balance'
              : `PLACE BET (${formatCurrency(stake)})`}
          </span>
        </button>
      </div>
    </div>
  );
};
