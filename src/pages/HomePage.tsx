import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  Users,
  Compass,
  ArrowRight,
  Heart,
  Bookmark,
  Share2,
  CheckCircle2,
  Quote,
  MessageCircle,
  Calendar,
  Shield,
  Smartphone,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    setCurrentPage,
    prayers,
    setActivePrayerModal,
    savedPrayerIds,
    toggleSavePrayer,
    openPaymentModal,
    plans,
    showToast,
  } = useApp();

  const dailyPrayer = prayers.find((p) => p.isDailyFeatured) || prayers[0];
  const recentPrayers = prayers.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-20 lg:py-28 border-b border-slate-800">
        {/* Background ambient image overlay with warm golden dawn */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
          <img
            src="/src/assets/images/hero_prayer_light_1791833027256.jpg"
            alt="Prière et recueillement chrétien"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-amber-950/40 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Âme & Vie · Prières & Méditations</span>
              </div>

              <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Ta vie spirituelle à portée de main
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Rejoins une communauté de foi et d'élévation, reçois des prières et méditations quotidiennes, accède à des ressources spirituelles et reste connecté avec Dieu et ta paix intérieure, où que tu sois.
              </p>

              {/* Exact CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setCurrentPage('register')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Commencer maintenant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 border border-slate-700 bg-slate-900/60 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  Se connecter
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center gap-8 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Prières matinales quotidiennes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Communauté 100% fraternelle</span>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Daily Card "Dieu t'écoute toujours" */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Verset & Prière du jour
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Aujourd'hui</span>
                </div>

                <div className="my-5">
                  <h3 className="font-serif-title text-2xl font-bold text-white mb-2">
                    Dieu t'écoute toujours
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold mb-3">
                    Proverbes 3:5-6
                  </p>
                  <blockquote className="text-sm text-slate-300 italic border-l-2 border-amber-400 pl-3 leading-relaxed">
                    « Confie-toi en l'Éternel de tout ton coeur, et ne t'appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers. »
                  </blockquote>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 mb-5">
                  <span className="font-semibold text-white block mb-0.5">Prière du matin :</span>
                  « Seigneur, merci pour ce nouveau jour et le souffle de vie renouvelé... »
                </div>

                <button
                  onClick={() => setActivePrayerModal(dailyPrayer)}
                  className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lire la prière du jour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR PILLARS PRESENTATION */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Prières quotidiennes */}
            <div
              onClick={() => setCurrentPage('prayers')}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-amber-400 transition-all cursor-pointer group hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white mb-2">
                Prières quotidiennes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Chaque matin, midi et soir, une méditation biblique et une prière inspirée pour renouveler ta foi.
              </p>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Découvrir <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 2. Communauté chrétienne */}
            <div
              onClick={() => setCurrentPage('community')}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-amber-400 transition-all cursor-pointer group hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white mb-2">
                Communauté chrétienne
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Partage tes témoignages, pose tes questions de foi et dépose tes sujets de prière fraternelle.
              </p>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Rejoindre <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 3. Ressources spirituelles */}
            <div
              onClick={() => setCurrentPage('resources')}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-amber-400 transition-all cursor-pointer group hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white mb-2">
                Ressources spirituelles
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Articles spirituels, méditations audio, vidéos d'enseignement et guides téléchargeables.
              </p>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Explorer <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 4. Suivi & accompagnement */}
            <div
              onClick={() => setCurrentPage('dashboard')}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-amber-400 transition-all cursor-pointer group hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white mb-2">
                Suivi & accompagnement
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Mesure tes jours de prière consécutifs, sauvegarde tes méditations favorites et progresse.
              </p>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir mon suivi <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 3. PRIÈRES DU JOUR GRID */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Nourrir ta foi au quotidien
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
                Prières quotidiennes
              </h2>
            </div>
            <button
              onClick={() => setCurrentPage('prayers')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Consulter toutes les prières</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPrayers.map((prayer) => {
              const isSaved = savedPrayerIds.includes(prayer.id);
              return (
                <div
                  key={prayer.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-semibold px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-700 dark:text-amber-300">
                        {prayer.category}
                      </span>
                      <span className="text-slate-500">{prayer.readTime}</span>
                    </div>

                    <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                      {prayer.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {prayer.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setActivePrayerModal(prayer)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer"
                    >
                      Lire
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSavePrayer(prayer.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Enregistrer"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(prayer.title + ' - ' + prayer.description);
                          showToast('Prière prête à être partagée !');
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Partager"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. WHATSAPP & EMAIL CONNECT CALLOUT */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider uppercase mb-3">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Reste connecté avec Dieu partout</span>
              </div>
              <h2 className="font-serif-title text-3xl font-bold mb-4">
                Reçois chaque matin ta prière sur WhatsApp ou par email
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-lg mb-6">
                Plus de 15 000 membres et chercheurs de paix débutent leur journée avec nos prières et méditations inspirées directement sur leur messagerie favorite.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentPage('connect')}
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>S'abonner à WhatsApp</span>
                </button>
                <button
                  onClick={() => setCurrentPage('connect')}
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  Newsletter par email
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center flex flex-col items-center">
              <img
                src="/src/assets/images/daily_prayer_verse_1791833039552.jpg"
                alt="Bible ouverte"
                className="w-full h-44 object-cover rounded-xl mb-4"
              />
              <p className="font-serif-title italic text-sm text-amber-200">
                « Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. »
              </p>
              <span className="text-xs text-slate-500 mt-1">Psaume 119:105</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SUMMARY CTA */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Soutien & Mission
          </span>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1 mb-4">
            Choisissez votre abonnement
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-10">
            Accédez à plus de contenu et soutenez notre mission pour nourrir les âmes et propager la paix et la foi.
          </p>

          <button
            onClick={() => setCurrentPage('pricing')}
            className="px-8 py-3.5 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Voir les formules d'abonnement (à partir de 0 €)
          </button>
        </div>
      </section>

    </div>
  );
};
