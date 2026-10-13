import React from 'react';
import { useApp, PageRoute } from '../../context/AppContext';
import { Sparkles, MessageCircle, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentPage, switchUserRole } = useApp();

  const handleNav = (page: PageRoute) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-title text-2xl font-bold tracking-tight text-white">
                  Âme & Vie
                </span>
                <span className="text-xs text-amber-400 font-medium tracking-wide uppercase -mt-1">
                  Prières, Méditations & Élévation
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Rejoins une communauté de foi et d'élévation, reçois des prières et méditations quotidiennes, accède à des ressources spirituelles et nourris ton âme, où que tu sois.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>+229 01 23 45 67</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>WhatsApp : +229 01 23 45 67</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>contact@ameetvie.com</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('prayers')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Prières quotidiennes
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('resources')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Ressources spirituelles
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('community')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Communauté
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('pricing')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Abonnements & Tarifs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Liens utiles */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Plateforme
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('connect')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  WhatsApp & Email
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  À propos de nous
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Contactez-nous
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('dashboard')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Espace Membre
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('settings')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Paramètres
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Administration & Soutien */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Administration
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    switchUserRole('admin');
                    handleNav('admin');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  Accès Espace Admin
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('login')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Se connecter
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('register')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-400"
                >
                  Créer un compte
                </button>
              </li>
            </ul>

            <div className="mt-6 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span className="text-amber-300 font-semibold block mb-1">Âme & Vie</span>
              Une communauté spirituelle ouverte et fraternelle, unie par l'amour, la prière et la quête de paix intérieure.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Âme & Vie. Tous droits réservés.</p>
          <p className="font-medium text-slate-400 italic">
            « Ensemble dans la prière et l'élévation, pour un avenir meilleur. »
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Sagesse & Élévation</span>
            <span>·</span>
            <span>Foi & Méditation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
