import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Send,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { sendContactMessage } = useApp();

  const [fullName, setFullName] = useState('Marie Dupont');
  const [email, setEmail] = useState('marie@priereetvie.com');
  const [subject, setSubject] = useState('Demande de prière ou renseignement');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendContactMessage(fullName, email, subject, message);
    setSubmitted(true);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header matching mockup */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            Écoute & Assistance
          </span>
          <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contactez-nous
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Une question ? Une suggestion ? Notre équipe est là pour vous écouter.
          </p>
        </div>

        {/* 2 Columns: Contact details & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Info (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
              <h3 className="font-serif-title text-xl font-bold text-slate-900 dark:text-white">
                Nos coordonnées directes
              </h3>

              <div className="space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Email</h4>
                    <p className="text-xs text-slate-500">contact@ameetvie.com</p>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400">Réponse sous 24h</span>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Téléphone</h4>
                    <p className="text-xs text-slate-500">+229 01 23 45 67</p>
                    <span className="text-[11px] text-slate-400">Lun - Sam : 8h00 - 18h00</span>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">WhatsApp</h4>
                    <p className="text-xs text-slate-500">+229 01 23 45 67</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Canal d'intercession direct</span>
                  </div>
                </div>

                {/* Adresse */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Secrétariat</h4>
                    <p className="text-xs text-slate-500">Boulevard de la Marina, Cotonou, Bénin</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Prayer Line Note */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider block">
                Besoin d'intercession urgente ?
              </span>
              <p className="text-slate-300 leading-relaxed">
                Notre cellule d'intercesseurs prie pour vos intentions chaque jour à 5h00 et 21h00. N'hésitez pas à nous confier votre situation.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form (Span 7) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm">
            <h3 className="font-serif-title text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Laissez-nous un message
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Remplissez le formulaire ci-dessous et nous vous recontacterons au plus vite.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ex: Marie Dupont"
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sujet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet de votre message"
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez-nous en quoi nous pouvons vous aider ou vous accompagner..."
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer le message</span>
              </button>
            </form>

            {submitted && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  Merci ! Votre message a été transmis à Guide Jean (Fondateur & Responsable de la communauté) et à notre équipe de guides spirituels. Que la paix et la lumière vous accompagnent.
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
