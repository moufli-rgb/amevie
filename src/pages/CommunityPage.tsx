import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Flag,
  Send,
  Sparkles,
  Tag,
  Hash,
  ChevronDown,
  Check,
} from 'lucide-react';
import { NewPostModal } from '../components/common/NewPostModal';
import { CommunityCategory } from '../types';

export const CommunityPage: React.FC = () => {
  const {
    communityPosts,
    toggleLikePost,
    addCommentToPost,
    reportPost,
    currentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Tous' | CommunityCategory>('Tous');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  const tabs: ('Tous' | CommunityCategory)[] = ['Tous', 'Témoignages', 'Questions', 'Sujets de prière'];

  const filteredPosts = communityPosts.filter((post) => {
    if (activeTab === 'Tous') return post.status !== 'hidden';
    return post.category === activeTab && post.status !== 'hidden';
  });

  const popularTags = [
    '#Témoignages',
    '#SujetsDePrière',
    '#Questions',
    '#VieChrétienne',
    '#Encouragements',
  ];

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;
    addCommentToPost(postId, comment);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleSharePost = (content: string, author: string) => {
    const text = `Témoignage partagé par ${author} sur Âme & Vie :\n\n"${content}"\n\nRejoignez la communauté : ameetvie.com`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Publication copiée dans le presse-papier !');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              Fraternité & Soutien
            </span>
            <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Communauté
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Échange, partage et soutien entre croyants.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
            <img
              src="/src/assets/images/community_fellowship_1791833062947.jpg"
              alt="Communauté chrétienne"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Layout with Main Feed and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Feed (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tabs & Create Post Button Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-x-auto">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Exact CTA: "Créer une publication" */}
              <button
                onClick={() => setIsNewPostOpen(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Créer une publication</span>
              </button>
            </div>

            {/* Posts Feed */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-serif-title text-lg font-bold text-slate-700 dark:text-slate-300">
                  Aucune publication dans cette rubrique
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Soyez le premier à partager un témoignage ou une demande de prière !
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => {
                  const isCommentsOpen = expandedCommentsPostId === post.id;
                  return (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      {/* Post Author Bar */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.userAvatar}
                            alt={post.userName}
                            className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {post.userName}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {post.category}
                              </span>
                              <span>·</span>
                              <span>{post.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tag category badge */}
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {post.category}
                        </span>
                      </div>

                      {/* Post Content */}
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-5 whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Post Actions: J'aime, Commenter, Partager, Signaler */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          
                          {/* 1. J'aime */}
                          <button
                            onClick={() => toggleLikePost(post.id)}
                            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                              post.likedByCurrentUser
                                ? 'text-rose-500 font-bold'
                                : 'hover:text-rose-500'
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                post.likedByCurrentUser ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                            <span>{post.likesCount} J'aime</span>
                          </button>

                          {/* 2. Commenter */}
                          <button
                            onClick={() =>
                              setExpandedCommentsPostId(isCommentsOpen ? null : post.id)
                            }
                            className="flex items-center gap-1.5 hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentsCount} Commenter</span>
                          </button>

                          {/* 3. Partager */}
                          <button
                            onClick={() => handleSharePost(post.content, post.userName)}
                            className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Partager</span>
                          </button>
                        </div>

                        {/* 4. Signaler */}
                        <button
                          onClick={() => reportPost(post.id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Signaler un contenu inapproprié"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Signaler</span>
                        </button>
                      </div>

                      {/* Expanded Comments Section */}
                      {isCommentsOpen && (
                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                          
                          {/* Existing Comments */}
                          {post.comments.length > 0 ? (
                            <div className="space-y-3">
                              {post.comments.map((comm) => (
                                <div
                                  key={comm.id}
                                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                                >
                                  <img
                                    src={comm.userAvatar}
                                    alt={comm.userName}
                                    className="w-7 h-7 rounded-full object-cover shrink-0"
                                  />
                                  <div className="flex-1 text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-slate-900 dark:text-white">
                                        {comm.userName}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {comm.createdAt}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300">
                                      {comm.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              Soyez le premier à commenter cette publication.
                            </p>
                          )}

                          {/* Write Comment Box */}
                          <form
                            onSubmit={(e) => handleCommentSubmit(post.id, e)}
                            className="flex items-center gap-2 pt-2"
                          >
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                              }
                              placeholder="Écrire un mot d'encouragement ou une prière..."
                              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <button
                              type="submit"
                              className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer"
                              title="Envoyer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar (Span 4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Sujets populaires Sidebar Box matching mockup */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-serif-title text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-500" />
                <span>Sujets populaires</span>
              </h3>

              <div className="flex flex-col gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (tag === '#Témoignages') setActiveTab('Témoignages');
                      else if (tag === '#SujetsDePrière') setActiveTab('Sujets de prière');
                      else if (tag === '#Questions') setActiveTab('Questions');
                      else showToast(`Filtrage par le sujet ${tag}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer text-left"
                  >
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{tag}</span>
                    <span className="text-slate-400 text-[11px]">Explorer</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fellowship Encouragement Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-6 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Verset fraternel
              </span>
              <p className="font-serif-title italic text-sm text-slate-200 leading-relaxed">
                « Portez les fardeaux les uns des autres, et vous accomplirez ainsi la loi de Christ. »
              </p>
              <span className="text-xs text-amber-300 font-semibold block">
                Galates 6:2
              </span>
            </div>

          </aside>
        </div>

      </div>

      {/* New Post Modal */}
      <NewPostModal isOpen={isNewPostOpen} onClose={() => setIsNewPostOpen(false)} />
    </div>
  );
};
