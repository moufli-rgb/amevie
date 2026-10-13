import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Sparkles } from 'lucide-react';
import { CommunityCategory } from '../../types';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose }) => {
  const { createCommunityPost, currentUser } = useApp();
  const [category, setCategory] = useState<CommunityCategory>('Témoignages');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createCommunityPost(content.trim(), category);
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title text-xl font-bold">Créer une publication</h3>
              <p className="text-xs text-slate-400">Partagez votre foi, vos requêtes et vos encouragements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Type de publication
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Témoignages', 'Questions', 'Sujets de prière'] as CommunityCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Votre message
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                category === 'Témoignages'
                  ? 'Racontez comment Dieu a agi dans votre vie pour fortifier vos frères et soeurs...'
                  : category === 'Sujets de prière'
                  ? 'Exprimez votre sujet d\'intercession avec confiance et sincérité...'
                  : 'Posez votre question sur la Bible ou la marche chrétienne...'
              }
              className="w-full p-3.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Publication en tant que : <strong className="text-slate-800 dark:text-slate-200">{currentUser?.name || 'Visiteur'}</strong>
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
