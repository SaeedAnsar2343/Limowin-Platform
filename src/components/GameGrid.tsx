import React, { useState, useMemo } from 'react';
import { GAMES_CATALOG, GameItem } from '../data/gamesCatalog';
import { useApp } from '../context/AppContext';
import { GameCard } from './GameCard';
import { Flame, ChevronLeft, ChevronRight, Filter, Search, Sparkles } from 'lucide-react';

export const GameGrid: React.FC = () => {
  const { selectedCategory, searchQuery } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [hotIndex, setHotIndex] = useState(0);

  const ITEMS_PER_PAGE = 20; // 5 columns x 4 rows matching screenshot!

  // Providers list
  const providers = useMemo(() => {
    const list = Array.from(new Set(GAMES_CATALOG.map(g => g.provider)));
    return ['all', ...list];
  }, []);

  // Filtered games
  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter(game => {
      // Category match
      if (selectedCategory === 'hot') {
        if (!game.isHot) return false;
      } else if (selectedCategory !== 'all') {
        if (game.category !== selectedCategory) return false;
      }

      // Provider match
      if (selectedProvider !== 'all' && game.provider !== selectedProvider) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          game.title.toLowerCase().includes(q) ||
          game.provider.toLowerCase().includes(q) ||
          game.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [selectedCategory, selectedProvider, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE) || 1;
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Hot Games for top carousel
  const hotGames = useMemo(() => GAMES_CATALOG.filter(g => g.isHot), []);

  const nextHot = () => {
    setHotIndex(prev => (prev + 4 >= hotGames.length ? 0 : prev + 4));
  };

  const prevHot = () => {
    setHotIndex(prev => (prev - 4 < 0 ? Math.max(0, hotGames.length - 4) : prev - 4));
  };

  return (
    <div id="games-section" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* 1. HOT GAMES CAROUSEL (Matching User Screenshot 2) */}
      {!searchQuery && selectedCategory === 'all' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-black text-lg text-slate-900 tracking-wide">Hot Game</h3>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={prevHot}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextHot}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors border border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {hotGames.slice(hotIndex, hotIndex + 4).map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* 2. MAIN "ALL GAME" SECTION (Matching User Screenshot 1 & 3) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 tracking-wide capitalize">
                {selectedCategory === 'all' ? 'All Game' : `${selectedCategory} Games`}
              </h3>
              <span className="text-[11px] text-slate-400 font-bold">
                Showing {filteredGames.length} playable 3D games
              </span>
            </div>
          </div>

          {/* Provider Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProvider}
              onChange={e => {
                setSelectedProvider(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-amber-500"
            >
              <option value="all">All Providers ({providers.length - 1})</option>
              {providers.filter(p => p !== 'all').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5-Column Game Grid (matches screenshot 5 cols x 4 rows) */}
        {paginatedGames.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-base">No Games Found</h4>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or provider filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {paginatedGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}

        {/* Pagination Controls matching screenshot (< 1 2 3 4 >) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1.5 pt-6 pb-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 flex items-center justify-center text-xs font-black transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(totalPages, 8) }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 8 && (
              <>
                <span className="text-slate-400 px-1 text-xs">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 rounded-lg text-xs font-black border border-slate-200 ${
                    currentPage === totalPages ? 'bg-amber-500 text-slate-950' : 'bg-white text-slate-600'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 flex items-center justify-center text-xs font-black transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
