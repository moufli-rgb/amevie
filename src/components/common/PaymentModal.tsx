import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, CreditCard, Lock, Check } from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { paymentModal, closePaymentModal, processSubscription } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<'Carte bancaire' | 'PayPal' | 'Orange Money / Wave'>('Carte bancaire');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState('Marie Dupont');
  const [phoneMoney, setPhoneMoney] = useState('+229 01 23 45 67');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!paymentModal.isOpen || !paymentModal.plan) return null;

  const plan = paymentModal.plan;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      processSubscription(plan.id, selectedMethod);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title text-xl font-bold">Paiement sécurisé</h3>
              <p className="text-xs text-slate-400">Âme & Vie · Transaction chiffrée SSL 256-bit</p>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan summary badge */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Abonnement sélectionné
            </span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Plan {plan.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {plan.interval === 'an' ? 'Facturé annuellement' : plan.interval === 'mois' ? 'Facturé mensuellement' : 'Sans frais'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {plan.price === 0 ? '0 €' : `${plan.price.toFixed(2)} €`}
            </div>
            <span className="text-xs text-slate-500">/{plan.interval}</span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePay} className="p-6 space-y-5">
          {plan.price > 0 ? (
            <>
              {/* Payment Methods Choice */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Moyen de paiement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('Carte bancaire')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedMethod === 'Carte bancaire'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Carte bancaire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('PayPal')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedMethod === 'PayPal'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-blue-500 text-sm">PayPal</span>
                    <span>Compte PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('Orange Money / Wave')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedMethod === 'Orange Money / Wave'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-orange-500 text-sm">Wave / OM</span>
                    <span>Mobile Money</span>
                  </button>
                </div>
              </div>

              {/* Conditional Inputs */}
              {selectedMethod === 'Carte bancaire' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nom sur la carte
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Numéro de carte
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2 pl-10 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'PayPal' && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-2">
                  <p className="font-semibold">Redirection sécurisée vers PayPal</p>
                  <p>
                    Vous serez redirigé vers l'interface officielle PayPal pour autoriser votre paiement récurrent de {plan.price.toFixed(2)} €/{plan.interval}.
                  </p>
                </div>
              )}

              {selectedMethod === 'Orange Money / Wave' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Numéro de téléphone Mobile Money (Wave / OM / MTN)
                    </label>
                    <input
                      type="tel"
                      value={phoneMoney}
                      onChange={(e) => setPhoneMoney(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Un message de validation USSD ou une notification Wave apparaîtra sur votre téléphone pour confirmer le débit.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
              <p className="font-semibold mb-1">Plan 100% Gratuit</p>
              <p>Aucune carte bancaire requise. Accédez immédiatement aux prières quotidiennes et à la communauté.</p>
            </div>
          )}

          {/* Security guarantee */}
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Paiement protégé · Résiliation possible à tout moment en 1 clic</span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Traitement sécurisé en cours...</span>
            ) : plan.price === 0 ? (
              <span>Commencer gratuitement</span>
            ) : (
              <span>Payer {plan.price.toFixed(2)} € ({selectedMethod})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
