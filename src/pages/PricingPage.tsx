import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Check,
  ShieldCheck,
  CreditCard,
  Sparkles,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { SubscriptionPlan } from '../types';

export const PricingPage: React.FC = () => {
  const { plans, openPaymentModal, userSubscription, showToast } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const paymentLogos = [
    { name: 'VISA', color: 'text-blue-600' },
    { name: 'MasterCard', color: 'text-orange-500' },
    { name: 'PayPal', color: 'text-sky-600' },
    { name: 'Orange Money', color: 'text-orange-600' },
    { name: 'Wave Mobile Money', color: 'text-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            Formules & Soutien Spirituel
          </span>
          <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Choisissez votre abonnement
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Accédez à plus de contenu et soutenez notre mission.
          </p>
        </div>

        {/* 3 Pricing Cards matching exact specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto mb-16">
          
          {plans.map((plan) => {
            const isPopular = plan.id === 'monthly';
            const isCurrent = userSubscription.planId === plan.id && userSubscription.status === 'active';

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between p-8 ${
                  isPopular
                    ? 'border-amber-400 shadow-xl ring-2 ring-amber-400/20 scale-100 md:-translate-y-2'
                    : 'border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className="font-serif-title text-2xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                      {plan.price === 0 ? '0 €' : `${plan.price.toFixed(2)} €`}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      /{plan.interval}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Button */}
                <div>
                  {isCurrent ? (
                    <div className="w-full py-3.5 rounded-xl font-bold text-xs text-center bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Abonnement actuel actif
                    </div>
                  ) : (
                    <button
                      onClick={() => openPaymentModal(plan)}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isPopular
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20'
                          : plan.price === 0
                          ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                          : 'bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 text-white dark:text-slate-950'
                      }`}
                    >
                      {plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        </div>

        {/* Moyens de paiement sécurisés Banner matching mockup */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Paiement sécurisé & chiffré SSL</span>
          </div>

          <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Moyens de paiement acceptés
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-700 dark:text-slate-300">
            {paymentLogos.map((logo) => (
              <div
                key={logo.name}
                className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
              >
                <CreditCard className={`w-4 h-4 ${logo.color}`} />
                <span>{logo.name}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Tous les paiements sont traités avec le plus haut niveau de conformité bancaire. Vous pouvez résilier votre abonnement à tout moment sans aucun frais.
          </p>
        </div>

      </div>
    </div>
  );
};
