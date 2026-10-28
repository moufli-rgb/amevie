import { motion } from 'motion/react';
import { Bitcoin, Crown, Lock } from 'lucide-react';
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { SITE } from '@/config/site';
import { api } from '@/lib/api';
import { go, hrefOf } from '@/lib/router';
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

/** Tarif public et moyens de paiement (lus une fois par visite). */
export interface Portefeuille { id: string; label: string; adresse: string; note?: string }
export interface Tarif { actif: boolean; auto: boolean; prix: number; devise: string; manuel: { actif: boolean; portefeuilles: Portefeuille[] } }
const TARIF_VIDE: Tarif = { actif: false, auto: false, prix: 0, devise: 'usd', manuel: { actif: false, portefeuilles: [] } };
let tarifCache: Promise<Tarif> | null = null;
export function rechargerTarif() { tarifCache = null; }
export function useTarif() {
  const [t, setT] = useState<Tarif | null>(null);
  useEffect(() => {
    tarifCache ??= api<Tarif>('payments?scope=tarif').then((v) => ({ ...TARIF_VIDE, ...v, manuel: v.manuel ?? TARIF_VIDE.manuel })).catch(() => TARIF_VIDE);
    let vivant = true;
    tarifCache.then((v) => vivant && setT(v));
    return () => { vivant = false; };
  }, []);
  return t;
}
export const prixAffiche = (t: { prix: number; devise: string } | null) =>
  t && t.prix ? `${t.prix.toLocaleString('fr-FR')} ${t.devise.toUpperCase()}` : '';

/**
 * Bouton « Payer en crypto » : ouvre le choix du moyen de paiement
 *  - automatique (NOWPayments : la personne choisit sa crypto, accès ouvert tout seul) ;
 *  - envoi direct à l'adresse de l'administration, puis validation dans le tableau de bord.
 * Sans compte : renvoie vers la création de compte.
 */
export function PayButton({ className = '', label = 'Payer mon abonnement en crypto', size = 'md' }: { className?: string; label?: string; size?: 'md' | 'lg' }) {
  const { user } = useVisitor();
  const tarif = useTarif();
  const [ouvert, setOuvert] = useState(false);
  const prix = prixAffiche(tarif);
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <motion.button type="button" onClick={() => (user ? setOuvert(true) : go('inscription'))} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
        className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary via-[color-mix(in_oklab,var(--couleur-principale)_70%,var(--couleur-accent))] to-accent font-semibold text-on-primary shadow-doux transition hover:brightness-110 ${size === 'lg' ? 'h-13 px-7 text-[15px]' : 'h-11 px-5 text-sm'}`}>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-reflet bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <Bitcoin className="h-4.5 w-4.5 shrink-0 transition group-hover:rotate-12" />
        <span className="whitespace-nowrap">{label}</span>
        {prix && <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-mini font-bold">{prix}</span>}
      </motion.button>
      {ouvert && (
        <Suspense fallback={null}>
          <PaiementModal tarif={tarif} onClose={() => setOuvert(false)} />
        </Suspense>
      )}
    </span>
  );
}
const PaiementModal = lazy(() => import('./PaiementModal'));

/** Logos texte des principales cryptomonnaies acceptées (le visiteur peut en choisir bien d'autres). */
export function CryptosAcceptees({ className = '' }: { className?: string }) {
  const liste = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'TRX', 'LTC', 'XRP', 'DOGE', 'TON', '+300'];
  return (
    <div className={`flex flex-wrap justify-center gap-1.5 ${className}`}>
      {liste.map((c, i) => (
        <motion.span key={c} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
          className="rounded-full bg-surface px-2.5 py-1 text-mini font-bold text-ink/70 ring-1 ring-ligne">{c}</motion.span>
      ))}
    </div>
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
        {texte ?? <>Ce contenu est réservé aux abonnés. Payez votre abonnement en cryptomonnaie (la devise de votre choix) : votre accès Premium s’active automatiquement pour {SITE.dureeAbonnement}.</>}
      </p>
      <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {user ? <PayButton /> : (
          <>
            <a href={hrefOf('inscription')} className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary">Créer mon compte gratuit</a>
            <a href={hrefOf('connexion')} className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold ring-1 ring-ligne hover:bg-surface">J’ai déjà un compte</a>
          </>
        )}
      </div>
      {!user && <p className="relative mt-4 text-mini text-ink/55">Créez d’abord votre compte, puis payez en cryptomonnaie : l’accès est activé tout seul.</p>}
      {children}
    </motion.div>
  );
}
