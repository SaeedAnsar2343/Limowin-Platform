import React from 'react';
import { GameItem } from '../data/gamesCatalog';
import { useApp } from '../context/AppContext';
import { useLivePlayers } from '../services/livePlayersService';
import { Play, Sparkles, Flame, Star, Users } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface Props {
  game: GameItem;
}

export const GameCard: React.FC<Props> = ({ game }) => {
  const { setActiveGame, gameOverrides } = useApp();
  const { getGamePlayers } = useLivePlayers();

  const override = gameOverrides[game.id];
  const bonusMult = override ? override.bonusMultiplier : game.bonusMultiplier;
  const liveCount = getGamePlayers(game.id);

  const handleLaunch = () => {
    sound.playChip();
    setActiveGame(game);
  };

  return (
    <div
      onClick={handleLaunch}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col"
    >
      {/* Thumbnail Aspect Box */}
      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-108"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center space-x-1.5 z-10">
          {game.isHot && (
            <span className="bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-0.5 shadow-sm">
              <Flame className="w-2.5 h-2.5 fill-current" />
              <span>HOT</span>
            </span>
          )}
          {game.is3D && (
            <span className="bg-amber-500/90 backdrop-blur-xs text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              3D
            </span>
          )}
        </div>

        {/* Top Right "BUY" Feature Badge (matching user screenshot 3) */}
        {game.buyFeature && (
          <div className="absolute top-2 right-2 z-10 bg-slate-950/80 backdrop-blur-xs text-yellow-400 border border-yellow-500/40 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-sm">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>BUY</span>
          </div>
        )}

        {/* Live Players Count Badge (Dynamic Real-Time Ticker) */}
        <div className="absolute bottom-2 left-2 z-10 bg-slate-950/85 backdrop-blur-xs text-emerald-400 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{liveCount} playing</span>
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Footer (matching user screenshot layout) */}
      <div className="p-2.5 sm:p-3 bg-white flex flex-col justify-between flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-amber-600 transition-colors">
            {game.title}
          </h4>
        </div>

        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
          <span className="truncate">{game.provider}</span>
          <span className="font-bold text-emerald-600 shrink-0">{game.rtp}%</span>
        </div>

        {bonusMult > 1 && (
          <div className="mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 text-center">
            +{Math.round((bonusMult - 1) * 100)}% Bonus Payout
          </div>
        )}
      </div>
    </div>
  );
};
