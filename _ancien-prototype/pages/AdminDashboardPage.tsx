import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Video,
  Headphones,
  MessageSquare,
  CreditCard,
  Receipt,
  MessageCircle,
  Mail,
  Bell,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Shield,
  CheckCircle,
  AlertCircle,
  Search,
  Send,
  Eye,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { Prayer, PrayerCategory, SpiritualTradition } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    users,
    updateUserStatus,
    prayers,
    createPrayer,
    deletePrayer,
    articles,
    createArticle,
    deleteArticle,
    videos,
    createVideo,
    deleteVideo,
    audios,
    createAudio,
    deleteAudio,
    communityPosts,
    moderatePost,
    deletePost,
    plans,
    payments,
    whatsappSubscriptions,
    emailSubscriptions,
    emailCampaigns,
    createEmailCampaign,
    contactMessages,
    markContactMessageRead,
    notifications,
    adminLogs,
    showToast,
  } = useApp();

  type AdminTab =
    | 'dashboard'
    | 'users'
    | 'prayers'
    | 'articles'
    | 'videos'
    | 'audios'
    | 'community'
    | 'subscriptions'
    | 'payments'
    | 'whatsapp'
    | 'emails'
    | 'notifications'
    | 'stats'
    | 'settings';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // New prayer modal state
  const [newPrayerOpen, setNewPrayerOpen] = useState(false);
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerDesc, setPrayerDesc] = useState('');
  const [prayerContent, setPrayerContent] = useState('');
  const [prayerCategory, setPrayerCategory] = useState<PrayerCategory>('Matin');
  const [prayerTradition, setPrayerTradition] = useState<SpiritualTradition>('Chrétienne');
  const [prayerRef, setPrayerRef] = useState('Psaume 23:1');
  const [prayerScripture, setPrayerScripture] = useState('L\'Éternel est mon berger : je ne manquerai de rien.');

  // New article modal state
  const [newArticleOpen, setNewArticleOpen] = useState(false);
  const [artTitle, setArtTitle] = useState('');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artCategory, setArtCategory] = useState('Enseignement');

  // New email campaign state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');

  // Handle Prayer creation
  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerTitle.trim()) return;
    createPrayer({
      title: prayerTitle,
      description: prayerDesc,
      content: prayerContent,
      category: prayerCategory,
      tradition: prayerTradition,
      scriptureRef: prayerRef,
      scriptureText: prayerScripture,
      date: 'Aujourd\'hui',
      readTime: '3 min',
      author: currentUser?.name || 'Guide Jean',
      audioDuration: '3 min',
    });
    setNewPrayerOpen(false);
    setPrayerTitle('');
    setPrayerDesc('');
    setPrayerContent('');
  };

  // Handle Article creation
  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim()) return;
    createArticle({
      title: artTitle,
      excerpt: artExcerpt,
      content: artContent,
      category: artCategory,
      author: currentUser?.name || 'Guide Jean',
      readTime: '4 min',
      date: new Date().toLocaleDateString('fr-FR'),
    });
    setNewArticleOpen(false);
    setArtTitle('');
    setArtExcerpt('');
    setArtContent('');
  };

  // Handle Campaign send
  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !campaignSubject.trim()) return;
    createEmailCampaign(campaignTitle, campaignSubject);
    setCampaignTitle('');
    setCampaignSubject('');
  };

  const navMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users, count: users.length },
    { id: 'prayers', label: 'Prières', icon: BookOpen, count: prayers.length },
    { id: 'articles', label: 'Articles', icon: FileText, count: articles.length },
    { id: 'videos', label: 'Vidéos', icon: Video, count: videos.length },
    { id: 'audios', label: 'Audios', icon: Headphones, count: audios.length },
    { id: 'community', label: 'Communauté', icon: MessageSquare, count: communityPosts.length },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
    { id: 'payments', label: 'Paiements', icon: Receipt, count: payments.length },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, count: whatsappSubscriptions.length },
    { id: 'emails', label: 'Emails', icon: Mail, count: emailSubscriptions.length },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Banner with Admin Identity */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-title text-2xl font-bold text-white">
                  Espace Guide Spirituel & Administration
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Guide Jean · Fondateur & Responsable de la communauté
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Âme & Vie · Gestion centralisée de la plateforme spirituelle et de la communauté
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Connecté : <strong className="text-amber-400">{currentUser?.name}</strong>
            </span>
          </div>
        </div>

        {/* 14 Menu Tabs Grid / Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: TABLEAU DE BORD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Fidèles inscrits</span>
                <div className="text-3xl font-bold font-mono text-white mt-1 tabular-nums">
                  {users.length * 480}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">+12% ce mois</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Prières publiées</span>
                <div className="text-3xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                  {prayers.length}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Toutes catégories</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Abonnés WhatsApp</span>
                <div className="text-3xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                  {whatsappSubscriptions.length * 350 + 1240}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">Diffusion 6h active</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Revenus mensuels</span>
                <div className="text-3xl font-bold font-mono text-white mt-1 tabular-nums">
                  1 845 €
                </div>
                <span className="text-[11px] text-amber-400 mt-1 block">Abonnements récurrents</span>
              </div>
            </div>

            {/* Recent Admin Logs Audit */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
              <h3 className="font-serif-title text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Journal d'audit des actions administratives (admin_logs)</span>
              </h3>
              <div className="space-y-2">
                {adminLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-amber-400 font-bold mr-2">[{log.action}]</span>
                      <span className="text-white font-medium">{log.target}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <div>Par {log.adminName}</div>
                      <div>{log.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: UTILISATEURS ================= */}
        {activeTab === 'users' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-serif-title text-xl font-bold text-white">
                Gestion des utilisateurs ({users.length})
              </h3>
              <span className="text-xs text-slate-400">Rôles et statuts d'accès</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="pb-3">Utilisateur</th>
                    <th className="pb-3">Email & Téléphone</th>
                    <th className="pb-3">Rôle</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-amber-400/40"
                        />
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {u.id}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-slate-400">{u.phone}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-400/20 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {u.status === 'active' ? (
                          <button
                            onClick={() => updateUserStatus(u.id, 'suspended')}
                            className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800 text-[11px] font-semibold cursor-pointer"
                          >
                            Suspendre
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(u.id, 'active')}
                            className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-[11px] font-semibold cursor-pointer"
                          >
                            Réactiver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRIÈRES ================= */}
        {activeTab === 'prayers' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-white">
                  Gestion des prières quotidiennes ({prayers.length})
                </h3>
                <p className="text-xs text-slate-400">Créer, modifier et supprimer des prières</p>
              </div>
              <button
                onClick={() => setNewPrayerOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle prière</span>
              </button>
            </div>

            <div className="space-y-3">
              {prayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="font-bold text-amber-400">{prayer.category}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{prayer.scriptureRef}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{prayer.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{prayer.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deletePrayer(prayer.id)}
                      className="p-2 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs cursor-pointer"
                      title="Supprimer la prière"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal to add prayer */}
            {newPrayerOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreatePrayer}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">Ajouter une prière</h3>
                    <button
                      type="button"
                      onClick={() => setNewPrayerOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Titre</label>
                    <input
                      type="text"
                      value={prayerTitle}
                      onChange={(e) => setPrayerTitle(e.target.value)}
                      placeholder="ex: Prière pour la bénédiction du travail"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Catégorie</label>
                      <select
                        value={prayerCategory}
                        onChange={(e) => setPrayerCategory(e.target.value as PrayerCategory)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                      >
                        {['Matin', 'Midi', 'Soir', 'Ma journée', 'Soirée'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Tradition spirituelle</label>
                      <select
                        value={prayerTradition}
                        onChange={(e) => setPrayerTradition(e.target.value as SpiritualTradition)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                      >
                        <option value="Chrétienne">Chrétienne</option>
                        <option value="Méditation & Contemplation">Méditation & Contemplation</option>
                        <option value="Sagesse Universelle & Paix">Sagesse Universelle & Paix</option>
                        <option value="Prière Silencieuse & Recueillement">Prière Silencieuse & Recueillement</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Référence / Source spirituelle</label>
                    <input
                      type="text"
                      value={prayerRef}
                      onChange={(e) => setPrayerRef(e.target.value)}
                      placeholder="ex: Lamentations 3:22 ou Méditation contemplative"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Verset biblique</label>
                    <input
                      type="text"
                      value={prayerScripture}
                      onChange={(e) => setPrayerScripture(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Courte description</label>
                    <input
                      type="text"
                      value={prayerDesc}
                      onChange={(e) => setPrayerDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Texte intégral de la prière</label>
                    <textarea
                      rows={4}
                      value={prayerContent}
                      onChange={(e) => setPrayerContent(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewPrayerOpen(false)}
                      className="px-4 py-2 text-xs text-slate-400"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950"
                    >
                      Publier la prière
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: ARTICLES ================= */}
        {activeTab === 'articles' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-serif-title text-xl font-bold text-white">
                Articles spirituels ({articles.length})
              </h3>
              <button
                onClick={() => setNewArticleOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel article</span>
              </button>
            </div>

            <div className="space-y-3">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">{art.category}</span>
                    <h4 className="font-bold text-sm text-white">{art.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{art.excerpt}</p>
                  </div>
                  <button
                    onClick={() => deleteArticle(art.id)}
                    className="p-2 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {newArticleOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateArticle}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4"
                >
                  <h3 className="font-bold text-white">Rédiger un article spirituel</h3>
                  <input
                    type="text"
                    placeholder="Titre de l'article"
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="Catégorie (ex: Vie chrétienne, Foi)"
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="Extrait introductif"
                    value={artExcerpt}
                    onChange={(e) => setArtExcerpt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700"
                  />
                  <textarea
                    rows={5}
                    placeholder="Corps complet de l'article..."
                    value={artContent}
                    onChange={(e) => setArtContent(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setNewArticleOpen(false)}
                      className="px-4 py-2 text-xs text-slate-400"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950"
                    >
                      Enregistrer l'article
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: VIDÉOS ================= */}
        {activeTab === 'videos' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-serif-title text-xl font-bold text-white">Vidéos ({videos.length})</h3>
              <button
                onClick={() => {
                  createVideo({
                    title: 'Persévérer dans la prière de foi',
                    description: 'Enseignement puissant sur l\'intercession persévérante selon Luc 18.',
                    duration: '22:15',
                    videoUrl: 'https://youtube.com',
                    thumbnailUrl: '/src/assets/images/community_fellowship_1791833062947.jpg',
                    speaker: 'Guide Jean',
                    views: 450,
                  });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 cursor-pointer"
              >
                + Ajouter une vidéo test
              </button>
            </div>
            <div className="space-y-3">
              {videos.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{v.title}</h4>
                    <p className="text-xs text-slate-400">{v.speaker} · {v.duration} · {v.views} vues</p>
                  </div>
                  <button
                    onClick={() => deleteVideo(v.id)}
                    className="p-2 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: AUDIOS ================= */}
        {activeTab === 'audios' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-serif-title text-xl font-bold text-white">Audios ({audios.length})</h3>
              <button
                onClick={() => {
                  createAudio({
                    title: 'Prière pour le repos de l\'âme',
                    description: 'Intercession guidée pour la paix nocturne et le réconfort.',
                    duration: '10:45',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
                    narrator: 'Guide Jean',
                    category: 'Prières guidées',
                  });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 cursor-pointer"
              >
                + Ajouter un audio test
              </button>
            </div>
            <div className="space-y-3">
              {audios.map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold">{a.category}</span>
                    <h4 className="font-bold text-sm text-white">{a.title}</h4>
                    <p className="text-xs text-slate-400">{a.narrator} · {a.duration}</p>
                  </div>
                  <button
                    onClick={() => deleteAudio(a.id)}
                    className="p-2 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: COMMUNAUTÉ & MODÉRATION ================= */}
        {activeTab === 'community' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-white">
                  Modération de la communauté ({communityPosts.length})
                </h3>
                <p className="text-xs text-slate-400">Valider, masquer ou supprimer des publications</p>
              </div>
            </div>

            <div className="space-y-4">
              {communityPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-white">{post.userName}</span>
                      <span className="text-amber-400">({post.category})</span>
                      {post.isReported && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                          SIGNALÉ PAR LES MEMBRES
                        </span>
                      )}
                      <span className="text-slate-500">· {post.status}</span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl">{post.content}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.status !== 'published' ? (
                      <button
                        onClick={() => moderatePost(post.id, 'published')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold cursor-pointer"
                      >
                        Approuver
                      </button>
                    ) : (
                      <button
                        onClick={() => moderatePost(post.id, 'hidden')}
                        className="px-3 py-1.5 rounded-lg bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-800 text-xs font-semibold cursor-pointer"
                      >
                        Masquer
                      </button>
                    )}

                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 8: ABONNEMENTS ================= */}
        {activeTab === 'subscriptions' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
            <h3 className="font-serif-title text-xl font-bold text-white">
              Gestion des formules d'abonnements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div key={p.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-lg">{p.name}</h4>
                    <span className="text-amber-400 font-mono font-bold">{p.price} €</span>
                  </div>
                  <p className="text-xs text-slate-400">{p.description}</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {p.features.map((f, i) => (
                      <li key={i}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 9: PAIEMENTS ================= */}
        {activeTab === 'payments' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-serif-title text-xl font-bold text-white">
              Registre des paiements ({payments.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">ID Facture</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Montant</th>
                    <th className="pb-3">Mode</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payments.map((pay) => (
                    <tr key={pay.id}>
                      <td className="py-3 font-mono text-amber-400">{pay.invoiceNumber}</td>
                      <td className="py-3 text-white font-medium">{pay.userName}</td>
                      <td className="py-3 font-mono font-bold">{pay.amount.toFixed(2)} €</td>
                      <td className="py-3 text-slate-400">{pay.paymentMethod}</td>
                      <td className="py-3 text-slate-400">{pay.date}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 10: WHATSAPP ================= */}
        {activeTab === 'whatsapp' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-white">
                  Communications WhatsApp ({whatsappSubscriptions.length})
                </h3>
                <p className="text-xs text-slate-400">Liste des abonnés à la prière du matin par WhatsApp</p>
              </div>
              <button
                onClick={() => showToast('Diffusion WhatsApp programmée pour 6h00 demain')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Tester la diffusion
              </button>
            </div>

            <div className="space-y-3">
              {whatsappSubscriptions.map((wa) => (
                <div key={wa.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{wa.name}</h4>
                    <span className="text-xs text-emerald-400 font-mono">{wa.phone}</span>
                  </div>
                  <span className="text-xs text-slate-500">Inscrit le {wa.subscribedAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 11: EMAILS ================= */}
        {activeTab === 'emails' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-serif-title text-xl font-bold text-white">
                Campagnes & Abonnés Email ({emailSubscriptions.length})
              </h3>
            </div>

            {/* Send Campaign Form */}
            <form onSubmit={handleSendCampaign} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm">Nouvelle campagne email</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Titre interne de la campagne"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Objet affiché aux fidèles"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 cursor-pointer"
              >
                Envoyer la campagne à tous les abonnés
              </button>
            </form>

            {/* Campaign history */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Historique des envois
              </h4>
              {emailCampaigns.map((camp) => (
                <div key={camp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-white">{camp.title}</h5>
                    <p className="text-slate-400">« {camp.subject} »</p>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-mono font-bold">{camp.recipientCount} destinataires</span>
                    <div className="text-[10px] text-slate-500">Taux d'ouverture : {camp.openRate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 12: NOTIFICATIONS ================= */}
        {activeTab === 'notifications' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-serif-title text-xl font-bold text-white">
              Système de notifications push & web
            </h3>
            <p className="text-xs text-slate-400">
              Diffusez une alerte instantanée à l'ensemble des membres connectés.
            </p>
            <div className="space-y-3 pt-2">
              {notifications.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="font-bold text-white">{n.title}</div>
                  <div className="text-slate-400">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 13: STATISTIQUES ================= */}
        {activeTab === 'stats' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
            <h3 className="font-serif-title text-xl font-bold text-white">
              Statistiques d'audience & Impact spirituel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">Heure de pointe de prière</span>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-2">05h45 - 06h30</div>
                <p className="text-xs text-slate-500 mt-1">Pic de dévotion matinale</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">Taux de fidélisation</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">87.4%</div>
                <p className="text-xs text-slate-500 mt-1">Membres actifs après 30 jours</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">Pays les plus représentés</span>
                <div className="text-base font-bold text-white mt-2">Bénin, Côte d'Ivoire, France</div>
                <p className="text-xs text-slate-500 mt-1">Communauté francophone</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 14: PARAMÈTRES ADMIN ================= */}
        {activeTab === 'settings' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-serif-title text-xl font-bold text-white">
              Paramètres généraux de l'administration
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900">
                <span>Modération automatique des publications avec mots sensibles</span>
                <span className="text-emerald-400 font-bold">Activée</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900">
                <span>Sauvegarde quotidienne des prières et transactions</span>
                <span className="text-emerald-400 font-bold">Automatique (02h00)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
