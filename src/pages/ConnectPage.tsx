import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  Mail,
  QrCode,
  CheckCircle2,
  Bell,
  Sparkles,
  Smartphone,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const ConnectPage: React.FC = () => {
  const { subscribeWhatsApp, subscribeEmail, showToast } = useApp();

  const [waPhone, setWaPhone] = useState('+229 01 23 45 67');
  const [waName, setWaName] = useState('Marie Dupont');
  const [emailInput, setEmailInput] = useState('');
  const [waSuccess, setWaSuccess] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = subscribeWhatsApp(waPhone, waName);
    if (success) {
      setWaSuccess(true);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = subscribeEmail(emailInput);
    if (success) {
      setEmailSuccess(true);
      setEmailInput('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header matching mockup */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            Communications & Actualités
          </span>
          <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reste connecté
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Reçois tes prières et nos actualités directement où tu le souhaites.
          </p>
        </div>

        {/* 2 Main Columns matching mockup: WhatsApp & Email */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: WhatsApp */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif-title text-2xl font-bold text-slate-900 dark:text-white">
                    WhatsApp
                  </h3>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    Diffusion quotidienne à 6h00
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Reçois nos prières, rappels et messages directement sur WhatsApp.
              </p>

              {/* QR Code representation as seen on mockup */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Scanne le QR Code
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ou renseigne ton numéro ci-dessous pour être ajouté à la communauté Âme & Vie sur WhatsApp.
                  </p>
                </div>
              </div>

              {/* WhatsApp Form */}
              <form onSubmit={handleWhatsAppSubmit} className="space-y-3.5 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ton prénom ou nom
                  </label>
                  <input
                    type="text"
                    value={waName}
                    onChange={(e) => setWaName(e.target.value)}
                    placeholder="ex: Marie Dupont"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro WhatsApp (avec indicatif)
                  </label>
                  <input
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="+229 01 23 45 67 ou +33 6 12 34 56 78"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>S'abonner à WhatsApp</span>
                </button>
              </form>

              {waSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Vous êtes bien inscrit à la chaîne de prière WhatsApp !</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-4">
              Aucun spam. Message unique le matin avec la méditation du jour.
            </p>
          </div>

          {/* Card 2: Email */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm flex flex-col justify-between hover:border-amber-500/50 transition-all">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif-title text-2xl font-bold text-slate-900 dark:text-white">
                    Emails
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    Newsletter & enseignements
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Reçois nos newsletters, ressources et nouveautés par email.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 mb-6 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>La prière inspirée du jour dans ta boîte de réception</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Résumés hebdomadaires des articles et enseignements</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Accès aux guides d'étude biblique en avant-première</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ton adresse email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>S'inscrire</span>
                </button>
              </form>

              {emailSuccess && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Inscription confirmée ! Vérifiez votre boîte de réception.</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-4">
              Désinscription en 1 clic à tout moment via le lien au bas de chaque email.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
