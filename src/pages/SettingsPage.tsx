import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Shield,
  CreditCard,
  Globe,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast, setCurrentUser, setCurrentPage } = useApp();

  const [notifPrayerMorning, setNotifPrayerMorning] = useState(true);
  const [notifPrayerEvening, setNotifPrayerEvening] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  const [privacyPublicProfile, setPrivacyPublicProfile] = useState(true);
  const [privacyShowChurch, setPrivacyShowChurch] = useState(true);

  const [language, setLanguage] = useState('Français (FR)');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleSave = () => {
    showToast('Paramètres mis à jour avec succès !');
  };

  const handleDeleteAccount = () => {
    setCurrentUser(null);
    showToast('Votre compte a été supprimé de la plateforme.', 'error');
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header matching mockup */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            Préférences & Compte
          </span>
          <h1 className="font-serif-title text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Paramètres
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos préférences et votre compte personnel.
          </p>
        </div>

        {/* 1. Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white">
              Notifications
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Prière matinale (6h00)
                </p>
                <p className="text-slate-400">Recevoir le verset et la prière de l'aube</p>
              </div>
              <input
                type="checkbox"
                checked={notifPrayerMorning}
                onChange={(e) => setNotifPrayerMorning(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Prière du soir (20h00)
                </p>
                <p className="text-slate-400">Rappel de recueillement avant la nuit</p>
              </div>
              <input
                type="checkbox"
                checked={notifPrayerEvening}
                onChange={(e) => setNotifPrayerEvening(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Diffusions WhatsApp
                </p>
                <p className="text-slate-400">Recevoir les alertes par messagerie WhatsApp</p>
              </div>
              <input
                type="checkbox"
                checked={notifWhatsApp}
                onChange={(e) => setNotifWhatsApp(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Newsletter & enseignements par email
                </p>
                <p className="text-slate-400">Récapitulatif hebdomadaire et articles</p>
              </div>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Confidentialité */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white">
              Confidentialité
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Visibilité du profil public
                </p>
                <p className="text-slate-400">Permettre aux frères et soeurs de voir votre prénom</p>
              </div>
              <input
                type="checkbox"
                checked={privacyPublicProfile}
                onChange={(e) => setPrivacyPublicProfile(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Afficher ma communauté / paroisse locale
                </p>
                <p className="text-slate-400">Sur vos témoignages et publications de foi</p>
              </div>
              <input
                type="checkbox"
                checked={privacyShowChurch}
                onChange={(e) => setPrivacyShowChurch(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Paiements */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white">
              Paiements
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Mode de paiement enregistré
              </p>
              <p className="text-slate-400">Carte bancaire (•••• 4242) · Expire 12/28</p>
            </div>
            <button
              onClick={() => showToast('Interface de mise à jour bancaire ouverte', 'info')}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
            >
              Modifier
            </button>
          </div>
        </div>

        {/* 4. Langue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif-title text-lg font-bold text-slate-900 dark:text-white">
              Langue
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">Langue de l'interface & prières :</span>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                showToast(`Langue définie sur ${e.target.value}`);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="Français (FR)">Français (FR)</option>
              <option value="English (EN)">English (EN)</option>
              <option value="Español (ES)">Español (ES)</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm cursor-pointer"
          >
            Enregistrer les modifications
          </button>
        </div>

        {/* 5. Supprimer mon compte (Zone de danger) */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-serif-title text-lg font-bold text-rose-700 dark:text-rose-400">
              Supprimer mon compte
            </h3>
          </div>

          <p className="text-xs text-rose-600/90 dark:text-rose-300">
            La suppression de votre compte effacera définitivement vos prières enregistrées, votre historique de dons et vos publications. Cette action est irréversible.
          </p>

          {deleteConfirmOpen ? (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 space-y-3">
              <p className="text-xs font-bold text-rose-600">
                Êtes-vous certain de vouloir supprimer définitivement votre compte ?
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
            >
              Supprimer mon compte
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
