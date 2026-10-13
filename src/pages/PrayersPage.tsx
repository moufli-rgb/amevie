import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Bookmark,
  Share2,
  Clock,
  Heart,
  Search,
  Sparkles,
} from 'lucide-react';
import { PrayerCategory } from '../types';

export const PrayersPage: React.FC = () => {
  const {
    prayers,
    savedPrayerIds,
    toggleSavePrayer,
    toggleLikePrayer,
    setActivePrayerModal,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('Toutes');
  const [activeTradition, setActiveTradition] = useState<string>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');

  const filterCategories = ['Toutes', 'Matin', 'Midi', 'Soir', 'Ma journée', 'Soirée'];
  const filterTraditions = ['Toutes', 'Chrétienne', 'Méditation & Contemplation', 'Sagesse Universelle & Paix'];

  const filteredPrayers = prayers.filter((prayer) => {
    const matchesCategory =
      activeFilter === 'Toutes' || prayer.category.toLowerCase() === activeFilter.toLowerCase();
    const matchesTradition =
      activeTradition === 'Toutes' || (prayer.tradition && prayer.tradition === activeTradition);
    const matchesSearch =
      prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.scriptureRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTradition && matchesSearch;
  });

  const handleShare = (title: string, desc: string, scripture: string) => {
    const text = `« ${title} » - Âme & Vie\n${scripture}\n${desc}\nRetrouvez la prière complète sur : ameetvie.com`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Prière copiée pour partage sur WhatsApp ou SMS !');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header matching mockup */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              Recueillement, Prières & Méditation
            </span>
            <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Prières quotidiennes
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Chaque jour, une nouvelle prière pour nourrir ta foi et élever ton âme.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <img
              src="/src/assets/images/daily_prayer_verse_1791833039552.jpg"
              alt="Bible"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              {filterCategories.map((cat) => {
                const isActive = activeFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search box */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Rechercher une prière ou méditation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Spiritual Traditions Sub-filter */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Tradition spirituelle :
            </span>
            {filterTraditions.map((trad) => {
              const isSelected = activeTradition === trad;
              return (
                <button
                  key={trad}
                  onClick={() => setActiveTradition(trad)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-400'
                  }`}
                >
                  {trad}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prayers List */}
        {filteredPrayers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-serif-title text-lg font-bold text-slate-700 dark:text-slate-300">
              Aucune prière trouvée
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Essayez une autre catégorie ou modifiez votre recherche.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrayers.map((prayer) => {
              const isSaved = savedPrayerIds.includes(prayer.id);
              return (
                <div
                  key={prayer.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:border-amber-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  <div className="space-y-1.5 flex-1 pr-0 sm:pr-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded">
                        {prayer.category}
                      </span>
                      {prayer.tradition && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                          {prayer.tradition}
                        </span>
                      )}
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-medium">{prayer.scriptureRef}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-400 text-[11px]">{prayer.readTime}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">Par {prayer.author}</span>
                    </div>

                    <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white">
                      {prayer.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                      {prayer.description}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => toggleLikePrayer(prayer.id)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                      title="J'aime"
                    >
                      <Heart className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleSavePrayer(prayer.id)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-amber-400'
                      }`}
                      title={isSaved ? 'Enregistrée' : 'Enregistrer cette prière'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-950' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleShare(prayer.title, prayer.description, prayer.scriptureRef)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer"
                      title="Partager sur WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActivePrayerModal(prayer)}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs cursor-pointer ml-1"
                    >
                      Lire
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
