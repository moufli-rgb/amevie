import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  CreditCard,
  MessageSquare,
  Share2,
  BookOpen,
  ArrowRight,
  Bookmark,
  Shield,
  Clock,
  Sparkles,
  LogOut,
  Users,
  Settings,
  Flame,
  CheckCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    userProfile,
    prayers,
    savedPrayerIds,
    userSubscription,
    setCurrentPage,
    setActivePrayerModal,
    setCurrentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'recent'>('overview');

  const firstName = currentUser?.name?.split(' ')[0] || 'Marie';
  const dailyPrayer = prayers.find((p) => p.isDailyFeatured) || prayers[0];
  const savedPrayersList = prayers.filter((p) => savedPrayerIds.includes(p.id));

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Déconnexion réussie', 'info');
    setCurrentPage('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Dashboard Layout with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Menu */}
          <aside className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
            {/* User profile compact badge */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256'}
                alt={currentUser?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
              />
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Marie Dupont'}
                </h3>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
                  {currentUser?.role === 'admin' ? 'Guide Jean · Fondateur & Responsable de la communauté' : 'Membre engagé'}
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-amber-400 text-slate-950 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Tableau de bord</span>
              </button>

              <button
                onClick={() => setCurrentPage('prayers')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Prières quotidiennes</span>
              </button>

              <button
                onClick={() => setCurrentPage('pricing')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Mes abonnements</span>
              </button>

              <button
                onClick={() => setCurrentPage('community')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Communauté</span>
              </button>

              <button
                onClick={() => setCurrentPage('resources')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Ressources</span>
              </button>

              <button
                onClick={() => setCurrentPage('settings')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Paramètres</span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Espace Guide & Admin</span>
                </button>
              )}
            </nav>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* Header Greeting */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Bonjour, {firstName} !
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Que Dieu continue de te guider.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Série de prière : {userProfile.prayerStreakDays} jours consécutifs</span>
                </div>
              </div>
            </div>

            {/* 4 Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Stat 1 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Jours de prière
                </span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  7
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold mt-1 inline-block">
                  +1 aujourd'hui
                </span>
              </div>

              {/* Stat 2 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Abonnements actifs
                </span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  2
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 inline-block">
                  Mensuel + WhatsApp
                </span>
              </div>

              {/* Stat 3 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Messages reçus
                </span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  12
                </div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
                  Témoignages & réponses
                </span>
              </div>

              {/* Stat 4 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Partages WhatsApp
                </span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  5
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold mt-1 inline-block">
                  Prières transmises
                </span>
              </div>

            </div>

            {/* Prière du jour & Bloc Abonnement Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Bloc Prière du jour (Span 7) */}
              <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Prière du jour
                    </span>
                    <span className="text-slate-400">{dailyPrayer.category}</span>
                  </div>

                  <div className="my-4">
                    <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {dailyPrayer.title}
                    </h3>
                    <blockquote className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border-l-3 border-amber-400 text-xs sm:text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      « {dailyPrayer.scriptureText} »
                    </blockquote>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                      {dailyPrayer.scriptureRef}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActivePrayerModal(dailyPrayer)}
                  className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lire la prière complète</span>
                </button>
              </div>

              {/* Bloc Abonnement (Span 5) */}
              <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Prochain abonnement
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      {userSubscription.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div className="my-4 space-y-2">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {userSubscription.planName}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Expire le <strong className="text-slate-800 dark:text-slate-200">{userSubscription.nextRenewalDate}</strong>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mode : {userSubscription.paymentMethod}
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                      Accès illimité aux prières, audios et vidéos spirituelles.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentPage('pricing')}
                  className="w-full py-3 rounded-xl font-semibold text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-white flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>Gérer mon abonnement</span>
                </button>
              </div>

            </div>

            {/* Prières enregistrées & Raccourcis */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Mes prières enregistrées ({savedPrayersList.length})</span>
                </h3>
                <button
                  onClick={() => setCurrentPage('prayers')}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  Voir tout
                </button>
              </div>

              {savedPrayersList.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">
                  Vous n'avez pas encore enregistré de prières. Cliquez sur l'icône marque-page dans la page Prières !
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedPrayersList.map((prayer) => (
                    <div
                      key={prayer.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div className="overflow-hidden pr-3">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                          {prayer.category}
                        </span>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {prayer.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{prayer.scriptureRef}</p>
                      </div>
                      <button
                        onClick={() => setActivePrayerModal(prayer)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shrink-0 cursor-pointer"
                      >
                        Lire
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </main>
        </div>

      </div>
    </div>
  );
};
