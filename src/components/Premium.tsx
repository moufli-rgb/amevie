import { motion } from 'motion/react';
import { Crown, Lock, MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { SITE, lienWhatsApp } from '@/config/site';
import { hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';

/** Indicateur « Premium » (cadenas si verrouillé). */
export function PremiumBadge({ verrouille = false, small = false }: { verrouille?: boolean; small?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-accent/18 font-bold text-ink ring-1 ring-accent/40 ${small ? 'px-2 py-0.5 text-mini' : 'px-2.5 py-1 text-[12px]'}`}>
      {verrouille ? <Lock className="h-3 w-3" /> : <Crown className="h-3 w-3" />} Premium
    </span>
  );
}
export function GratuitBadge({ small = false }: { small?: boolean }) {
  return <span className={`inline-flex items-center rounded-full bg-surface font-semibold text-ink/70 ring-1 ring-ligne ${small ? 'px-2 py-0.5 text-mini' : 'px-2.5 py-1 text-[12px]'}`}>Gratuit</span>;
}

/** Bouton « Faire mon abonnement » → WhatsApp avec message automatique. */
export function WhatsAppButton({ className = '', label = 'Faire mon abonnement', size = 'md' }: { className?: string; label?: string; size?: 'md' | 'lg' }) {
  const { user } = useVisitor();
  return (
    <a href={lienWhatsApp(user?.email)} target="_blank" rel="noopener noreferrer"
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-whatsapp font-semibold text-white shadow-doux transition hover:brightness-110 active:scale-[0.98] ${size === 'lg' ? 'h-13 px-7 text-[15px]' : 'h-11 px-5 text-sm'} ${className}`}>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-reflet bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <MessageCircle className="h-4.5 w-4.5 shrink-0" /> <span className="whitespace-nowrap">{label}</span>
    </a>
  );
}

/** Encart « Abonnement requis » affiché à la place d'une fonctionnalité Premium. */
export function Paywall({ titre = 'Abonnement requis', texte, children }: { titre?: string; texte?: ReactNode; children?: ReactNode }) {
  const { user } = useVisitor();
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] bg-fond p-6 text-center shadow-haut ring-1 ring-accent/40 sm:p-10">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-[50%] bg-accent/15 blur-2xl" />
      <motion.span initial={{ scale: 0.6, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-on-primary shadow-doux">
        <Lock className="h-7 w-7" />
      </motion.span>
      <h3 className="relative mt-5 text-2xl">{titre}</h3>
      <p className="relative mx-auto mt-2 max-w-md text-[15px] text-ink/70">
        {texte ?? <>Ce contenu est réservé aux abonnés. Faites votre abonnement sur WhatsApp : l’administrateur active votre accès Premium pour {SITE.dureeAbonnement} dès réception du paiement.</>}
      </p>
      <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {user ? <WhatsAppButton /> : (
          <>
            <a href={hrefOf('inscription')} className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary">Créer mon compte gratuit</a>
            <a href={hrefOf('connexion')} className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold ring-1 ring-ligne hover:bg-surface">J’ai déjà un compte</a>
          </>
        )}
      </div>
      {!user && <p className="relative mt-4 text-mini text-ink/55">Créez d’abord votre compte, puis faites votre abonnement sur WhatsApp.</p>}
      {children}
    </motion.div>
  );
}
