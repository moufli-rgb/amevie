import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  CreditCard,
  Receipt,
  Bookmark,
  MessageSquare,
  Bell,
  Edit2,
  Check,
  Calendar,
  Phone,
  Mail,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    userProfile,
    updateUserProfile,
    userSubscription,
    payments,
    prayers,
    savedPrayerIds,
    communityPosts,
    notifications,
    setActivePrayerModal,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'subscriptions' | 'payments' | 'saved' | 'posts' | 'notifications'
  >('subscriptions');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bioInput, setBioInput] = useState(userProfile.bio || '');
  const [churchInput, setChurchInput] = useState(userProfile.church || '');
  const [cityInput, setCityInput] = useState(userProfile.city || '');

  const userSavedPrayers = prayers.filter((p) => savedPrayerIds.includes(p.id));
  const userPosts = communityPosts.filter((p) => p.userId === currentUser?.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      bio: bioInput,
      church: churchInput,
      city: cityInput,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Card Header matching mockup */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256'}
                alt={currentUser?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-md"
              />
              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {currentUser?.name || 'Marie Dupont'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
                    {currentUser?.role === 'admin' ? 'Guide Jean · Fondateur & Responsable de la communauté' : 'Membre'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    {currentUser?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    {currentUser?.phone || '+229 01 23 45 67'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Inscrit(e) le {currentUser?.createdAt || '15/01/2026'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 max-w-xl">
                  « {userProfile.bio || 'Passionnée par la prière et la méditation de la Parole.'} »
                </p>
              </div>
            </div>

            {/* Modifier mon profil Button */}
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Modifier mon profil</span>
            </button>
          </div>

          {/* Edit Form Drawer */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Modifier mes informations personnelles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Ville</label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Communauté / Voie spirituelle</label>
                  <input
                    type="text"
                    value={churchInput}
                    onChange={(e) => setChurchInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Bio / Verset de coeur</label>
                  <input
                    type="text"
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 cursor-pointer"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 5 Required Sub-sections Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-x-auto">
          {[
            { id: 'subscriptions', icon: CreditCard, label: 'Mes abonnements' },
            { id: 'payments', icon: Receipt, label: 'Mes paiements' },
            { id: 'saved', icon: Bookmark, label: 'Mes prières enregistrées' },
            { id: 'posts', icon: MessageSquare, label: 'Mes publications' },
            { id: 'notifications', icon: Bell, label: 'Mes notifications' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-section Contents */}
        
        {/* 1. Mes abonnements */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
            <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white">
              Abonnement actuel
            </h3>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Plan en cours
                </span>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Formule {userSubscription.planName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Débuté le {userSubscription.startDate} · Prochain renouvellement le{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{userSubscription.nextRenewalDate}</strong>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Moyen de paiement enregistré : {userSubscription.paymentMethod}
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                  {userSubscription.amount.toFixed(2)} €/mois
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-1">
                  Statut : {userSubscription.status === 'active' ? 'Actif' : 'Suspendu'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Mes paiements */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white mb-6">
              Historique des paiements & Factures
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="pb-3">Facture</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Montant</th>
                    <th className="pb-3">Méthode</th>
                    <th className="pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3.5 font-mono font-medium text-slate-900 dark:text-white">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-3.5">{p.date}</td>
                      <td className="py-3.5 font-bold tabular-nums">
                        {p.amount.toFixed(2)} {p.currency}
                      </td>
                      <td className="py-3.5">{p.paymentMethod}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Réglé
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Mes prières enregistrées */}
        {activeTab === 'saved' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white mb-6">
              Prières sauvegardées ({userSavedPrayers.length})
            </h3>

            {userSavedPrayers.length === 0 ? (
              <p className="text-xs text-slate-500">Aucune prière enregistrée pour l'instant.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userSavedPrayers.map((prayer) => (
                  <div
                    key={prayer.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="overflow-hidden pr-4">
                      <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                        {prayer.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {prayer.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{prayer.scriptureRef}</p>
                    </div>
                    <button
                      onClick={() => setActivePrayerModal(prayer)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 shrink-0 cursor-pointer"
                    >
                      Lire
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Mes publications */}
        {activeTab === 'posts' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white mb-6">
              Mes publications dans la communauté
            </h3>

            {userPosts.length === 0 ? (
              <p className="text-xs text-slate-500">Vous n'avez pas encore publié dans la communauté.</p>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-amber-600 dark:text-amber-400">{post.category}</span>
                      <span>{post.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{post.content}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>{post.likesCount} J'aime</span>
                      <span>·</span>
                      <span>{post.commentsCount} commentaires</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Mes notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white mb-6">
              Mes notifications
            </h3>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-4"
                >
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
