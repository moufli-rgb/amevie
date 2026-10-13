import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Video,
  Headphones,
  Download,
  Play,
  Pause,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  X,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { ResourceArticle, ResourceVideo, ResourceAudio } from '../types';

export const ResourcesPage: React.FC = () => {
  const { articles, videos, audios, showToast } = useApp();
  const [activeCategory, setActiveCategory] = useState<'Articles' | 'Vidéos' | 'Audio' | 'Guides'>('Articles');
  const [selectedArticle, setSelectedArticle] = useState<ResourceArticle | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ResourceVideo | null>(null);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<ResourceAudio | null>(null);

  const guidesList = [
    {
      id: 'g-1',
      title: 'Guide d\'intimité spirituelle : 21 jours de jeûne & prière',
      description: 'Un plan biblique quotidien complet avec versets, requêtes et thèmes de méditation.',
      pages: '32 pages',
      format: 'PDF Téléchargeable',
      downloadCount: 4200,
    },
    {
      id: 'g-2',
      title: 'Comprendre et mémoriser les Psaumes de délivrance',
      description: 'Recueil commenté des 15 psaumes fondamentaux pour le combat spirituel et la paix.',
      pages: '24 pages',
      format: 'PDF Téléchargeable',
      downloadCount: 2850,
    },
    {
      id: 'g-3',
      title: 'Bâtir un autel de prière familial inébranlable',
      description: 'Manuel pratique pour conduire les temps de dévotion avec ses enfants et son conjoint.',
      pages: '18 pages',
      format: 'PDF Téléchargeable',
      downloadCount: 1940,
    },
  ];

  const handleDownloadGuide = (title: string) => {
    showToast(`Téléchargement initié pour "${title}" (PDF)`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header matching mockup */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              Méditation, Sagesse & Bibliothèque Spirituelle
            </span>
            <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Ressources spirituelles
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Des outils pour grandir dans ta foi et élever ton âme.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
            <img
              src="/src/assets/images/spiritual_bible_study_1791833052033.jpg"
              alt="Étude spirituelle"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 4 Required Categories Segmented Control */}
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs mb-8 overflow-x-auto">
          {[
            { id: 'Articles', icon: FileText, label: 'Articles' },
            { id: 'Vidéos', icon: Video, label: 'Vidéos' },
            { id: 'Audio', icon: Headphones, label: 'Audio' },
            { id: 'Guides', icon: Download, label: 'Guides' },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Content */}
        
        {/* 1. ARTICLES */}
        {activeCategory === 'Articles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <div
                key={art.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {art.imageUrl && (
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{art.category}</span>
                        {art.tradition && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                            {art.tradition}
                          </span>
                        )}
                      </div>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Par {art.author}</span>
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer"
                  >
                    Voir les articles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. VIDÉOS */}
        {activeCategory === 'Vidéos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative group cursor-pointer" onClick={() => setSelectedVideo(vid)}>
                  <img
                    src={vid.thumbnailUrl || '/src/assets/images/community_fellowship_1791833062947.jpg'}
                    alt={vid.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-xs">
                    {vid.duration}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                      Enseignement & Méditation
                    </span>
                    {vid.tradition && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                        {vid.tradition}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                    {vid.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-medium">Par {vid.speaker}</span>
                    <button
                      onClick={() => setSelectedVideo(vid)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Voir les documents
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. AUDIO */}
        {activeCategory === 'Audio' && (
          <div className="space-y-4">
            {audios.map((aud) => {
              const isPlaying = activeAudioPlaying?.id === aud.id;
              return (
                <div
                  key={aud.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <button
                      onClick={() => {
                        if (isPlaying) {
                          setActiveAudioPlaying(null);
                          showToast('Audio mis en pause');
                        } else {
                          setActiveAudioPlaying(aud);
                          showToast(`Lecture de : ${aud.title}`);
                        }
                      }}
                      className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
                        <span className="font-bold text-amber-600 dark:text-amber-400">{aud.category}</span>
                        {aud.tradition && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                            {aud.tradition}
                          </span>
                        )}
                        <span>·</span>
                        <span>{aud.duration}</span>
                        <span>·</span>
                        <span>{aud.narrator}</span>
                      </div>
                      <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white">
                        {aud.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {aud.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isPlaying && (
                      <span className="text-xs font-bold text-amber-500 animate-pulse">
                        En lecture...
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setActiveAudioPlaying(aud);
                        showToast(`Session audio démarrée : ${aud.title}`);
                      }}
                      className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                    >
                      Voir les audios
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. GUIDES */}
        {activeCategory === 'Guides' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guidesList.map((guide) => (
              <div
                key={guide.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {guide.format} · {guide.pages}
                  </span>
                  <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {guide.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {guide.downloadCount.toLocaleString()} téléchargements
                  </span>
                  <button
                    onClick={() => handleDownloadGuide(guide.title)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Article Reader Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative p-6 sm:p-8 bg-slate-900 text-white border-b border-slate-800 flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase">{selectedArticle.category}</span>
                  <h3 className="font-serif-title text-2xl font-bold mt-1">{selectedArticle.title}</h3>
                  <p className="text-xs text-slate-400 mt-2">Par {selectedArticle.author} · {selectedArticle.date}</p>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {selectedArticle.content}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Fermer la lecture
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm truncate">{selectedVideo.title}</h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img
                  src={selectedVideo.thumbnailUrl || '/src/assets/images/community_fellowship_1791833062947.jpg'}
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                  <span className="text-xs font-medium text-slate-200 bg-black/60 px-3 py-1 rounded-full">
                    Lecture vidéo en haute définition (1080p)
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-serif-title text-xl font-bold mb-2">{selectedVideo.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedVideo.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <span>Intervenant : {selectedVideo.speaker}</span>
                  <span>{selectedVideo.views} vues</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
