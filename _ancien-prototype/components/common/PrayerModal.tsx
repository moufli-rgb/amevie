import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bookmark,
  Share2,
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';

export const PrayerModal: React.FC = () => {
  const {
    activePrayerModal,
    setActivePrayerModal,
    savedPrayerIds,
    toggleSavePrayer,
    toggleLikePrayer,
    showToast,
  } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!activePrayerModal) return null;

  const isSaved = savedPrayerIds.includes(activePrayerModal.id);

  const handleShare = () => {
    const textToShare = `« ${activePrayerModal.title} » - Âme & Vie\n\n"${activePrayerModal.scriptureText}" (${activePrayerModal.scriptureRef})\n\n${activePrayerModal.content}\n\nRejoins la communauté : ameetvie.com`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare);
      setCopied(true);
      showToast('Texte de la prière copié dans le presse-papier ! Vous pouvez le partager sur WhatsApp.');
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast('Lien de partage prêt');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with image or gradient */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-amber-400 text-slate-950">
              {activePrayerModal.category}
            </span>
            <button
              onClick={() => {
                setActivePrayerModal(null);
                setIsPlayingAudio(false);
              }}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-slate-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            {activePrayerModal.title}
          </h2>

          <div className="flex items-center gap-3 text-xs text-amber-200/90">
            <span>Par {activePrayerModal.author}</span>
            <span>·</span>
            <span>{activePrayerModal.readTime} de lecture</span>
            <span>·</span>
            <span>{activePrayerModal.date}</span>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* Scripture Verse Callout */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-5">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs tracking-wide uppercase mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Parole de Dieu · {activePrayerModal.scriptureRef}</span>
            </div>
            <blockquote className="font-serif-title italic text-base sm:text-lg text-slate-800 dark:text-amber-100 leading-relaxed">
              « {activePrayerModal.scriptureText} »
            </blockquote>
          </div>

          {/* Audio Player Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsPlayingAudio(!isPlayingAudio);
                  showToast(isPlayingAudio ? 'Audio en pause' : 'Lecture audio de la prière en cours...');
                }}
                className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center hover:bg-amber-300 transition-colors shadow-xs cursor-pointer"
                aria-label={isPlayingAudio ? 'Pause' : 'Écouter'}
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div>
                <p className="font-medium text-xs sm:text-sm">
                  {isPlayingAudio ? 'Écoute méditative guidée...' : 'Écouter cette prière (audio)'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Durée : {activePrayerModal.audioDuration || '3 min'}
                </p>
              </div>
            </div>

            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              {isPlayingAudio ? 'En cours' : 'Prêt'}
            </div>
          </div>

          {/* Full Prayer Content */}
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line font-normal">
            {activePrayerModal.content}
          </div>

          <div className="text-center pt-2">
            <span className="font-serif-title text-xl font-bold tracking-widest text-amber-600 dark:text-amber-400">
              AMEN
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLikePrayer(activePrayerModal.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:border-rose-300 transition-colors text-xs font-semibold cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <span>{activePrayerModal.likesCount} J'aime</span>
            </button>

            <button
              onClick={() => toggleSavePrayer(activePrayerModal.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-950' : ''}`} />
              <span>{isSaved ? 'Enregistrée' : 'Enregistrer'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Partager'}</span>
            </button>

            <button
              onClick={() => {
                setActivePrayerModal(null);
                setIsPlayingAudio(false);
              }}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
