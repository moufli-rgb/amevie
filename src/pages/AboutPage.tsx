import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Heart,
  Shield,
  Users,
  Compass,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  const valuesList = [
    { title: 'Foi', desc: 'Une confiance inébranlable en la grâce transcendante et la puissance de la parole de vérité.' },
    { title: 'Amour', desc: 'L\'amour universel et inconditionnel manifesté dans chacune de nos interactions et prières.' },
    { title: 'Respect', desc: 'L\'accueil bienveillant de chacun, dans le respect de son cheminement et de sa tradition spirituelle.' },
    { title: 'Partage', desc: 'La mise en commun de témoignages, de ressources et d\'encouragements pour édifier la communauté.' },
    { title: 'Service', desc: 'Le dévouement désintéressé pour soutenir les plus vulnérables et fortifier les fidèles.' },
    { title: 'Bienveillance', desc: 'Une attitude d\'écoute fraternelle, de douceur et d\'espérance communicative.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header matching mockup */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            Notre Identité & Vocation
          </span>
          <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            À propos de Âme & Vie
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Notre mission est d'aider chacun à développer une vie spirituelle féconde, nourrir son âme et grandir dans la foi, la sérénité et la paix grâce à la prière, à la méditation, à l'enseignement et à la communauté.
          </p>
        </div>

        {/* 3 Core Pillars: Vision, Mission, Valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 1. Notre vision */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white">
              Notre vision
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Voir chaque âme, à travers la richesse de sa tradition spirituelle et de son cheminement intérieur, connectée au Créateur et soutenue par une communauté priante, fraternelle et éclairée.
            </p>
          </div>

          {/* 2. Notre mission */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white">
              Notre mission
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sous l'accompagnement de Guide Jean (Fondateur & Responsable de la communauté) et de l'équipe des guides spirituels, diffuser des prières et méditations quotidiennes, des audios apaisants et bâtir un sanctuaire d'intercession et d'élévation.
            </p>
          </div>

          {/* 3. Nos valeurs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white">
              Nos valeurs
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Foi, amour, respect, partage, service et bienveillance. Ces six piliers guident notre gouvernance et l'ensemble de nos publications.
            </p>
          </div>

        </div>

        {/* Biblical Verse Callout matching mockup */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 text-center space-y-4 shadow-xl">
          <blockquote className="font-serif-title italic text-xl sm:text-2xl text-amber-200 max-w-2xl mx-auto leading-relaxed">
            « Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux. »
          </blockquote>
          <p className="text-xs font-bold text-amber-400 tracking-widest uppercase">
            Matthieu 18:20
          </p>
        </div>

        {/* Detailed Values Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-serif-title text-2xl font-bold text-slate-900 dark:text-white">
              Nos 6 valeurs fondamentales
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ce qui anime notre coeur et nos actions au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {valuesList.map((val) => (
              <div
                key={val.title}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{val.title}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Join CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => setCurrentPage('community')}
            className="px-8 py-3.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Rejoindre notre communauté fraternelle</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
