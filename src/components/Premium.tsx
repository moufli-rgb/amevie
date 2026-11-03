import { motion } from 'motion/react';
import { Bitcoin, Check, Crown, Gem, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { go, hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';
import { ACCES, type Acces } from '@/lib/contenus';

/* ------------------------------------------------------------------ Tarifs (formules + produits) */
export type FormuleId = 'essentiel' | 'premium' | 'premium_plus';
export interface Formule { id: FormuleId; nom: string; prix: number; niveau: number; description: string; avantages: string[] }
export interface Portefeuille { id: string; label: string; adresse: string; note?: string }
export interface Tarif {
  actif: boolean; auto: boolean; prix: number; prix_document?: number; devise: string; taux_fcfa?: number;
  formules?: Formule[]; manuel: { actif: boolean; portefeuilles: Portefeuille[] };
}
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
/** Équivalent indicatif en francs CFA (taux réglé par l'administration). */
export const enFcfa = (prix: number, t: Tarif | null) =>
  t?.taux_fcfa && prix ? `≈ ${(Math.round((prix * t.taux_fcfa) / 50) * 50).toLocaleString('fr-FR')} F CFA` : '';
export const prixProduit = (c: { price?: number | null }, t: Tarif | null) => c.price ?? t?.prix_document ?? 0;

/* ------------------------------------------------------------------ Badges d'accès */
const tailles = (small: boolean) => (small ? 'px-2 py-0.5 text-mini' : 'px-2.5 py-1 text-[12px]');
export function PremiumBadge({ verrouille = false, small = false, label = 'Premium' }: { verrouille?: boolean; small?: boolean; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-accent/18 font-bold text-ink ring-1 ring-accent/40 ${tailles(small)}`}>
      {verrouille ? <Lock className="h-3 w-3" /> : <Crown className="h-3 w-3" />} {label}
    </span>
  );
}
export function GratuitBadge({ small = false }: { small?: boolean }) {
  return <span className={`inline-flex items-center rounded-full bg-surface font-semibold text-ink/70 ring-1 ring-ligne ${tailles(small)}`}>Gratuit</span>;
}
/** Badge selon l'accès : Gratuit, Essentiel / Premium / Premium Plus (compris dans la formule), ou prix à l'unité. */
export function AccesBadge({ c, small = false }: { c: { access: Acces; locked?: boolean; price?: number | null }; small?: boolean }) {
  const tarif = useTarif();
  if (c.access === 'gratuit') return <GratuitBadge small={small} />;
  if (c.access === 'payant') {
    const achete = !c.locked;
    const p = prixProduit(c, tarif);
    return (
      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-bold ring-1 ${achete ? 'bg-[color-mix(in_oklab,var(--couleur-succes)_14%,var(--couleur-fond))] text-succes ring-succes/30' : 'bg-primary/12 text-primary ring-primary/30'} ${tailles(small)}`}>
        <ShoppingBag className="h-3 w-3" /> {achete ? 'Acheté' : p ? `${p.toLocaleString('fr-FR')} ${(tarif?.devise ?? 'usd').toUpperCase()}` : 'À l’unité'}
      </span>
    );
  }
  return <PremiumBadge verrouille={c.locked} small={small} label={ACCES[c.access].court} />;
}
/** @deprecated garder pour compatibilité */
export function PayantBadge({ achete = false, small = false }: { achete?: boolean; small?: boolean }) {
  return <AccesBadge c={{ access: 'payant', locked: !achete }} small={small} />;
}

/* ------------------------------------------------------------------ Bouton de paiement */
/**
 * Bouton « Payer en crypto » : ouvre le choix du moyen de paiement (automatique ou envoi direct).
 *  - document : un produit vendu à l'unité (livre, programme, pack) ;
 *  - formule  : un mois d'abonnement Essentiel, Premium ou Premium Plus (Premium par défaut).
 * Sans compte : renvoie vers la création de compte.
 */
export function PayButton({ className = '', label, size = 'md', document, formule = 'premium', variante = 'plein' }: {
  className?: string; label?: string; size?: 'md' | 'lg'; document?: { id: string; title: string; price?: number | null }; formule?: FormuleId; variante?: 'plein' | 'clair';
}) {
  const { user } = useVisitor();
  const tarif = useTarif();
  const [ouvert, setOuvert] = useState(false);
  const f = tarif?.formules?.find((x) => x.id === formule);
  const montant = document ? prixProduit(document, tarif) : f?.prix ?? tarif?.prix ?? 0;
  const prix = tarif && montant ? prixAffiche({ prix: montant, devise: tarif.devise }) : '';
  const texte = label ?? (document ? 'Acheter' : `Choisir ${f?.nom ?? 'Premium'}`);
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <motion.button type="button" onClick={() => (user ? setOuvert(true) : go('inscription'))} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
        className={`group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold shadow-doux transition hover:brightness-110 ${variante === 'clair' ? 'bg-fond text-ink ring-1 ring-ligne' : 'bg-gradient-to-r from-primary via-[color-mix(in_oklab,var(--couleur-principale)_70%,var(--couleur-accent))] to-accent text-on-primary'} ${size === 'lg' ? 'h-13 px-7 text-[15px]' : 'h-11 px-5 text-sm'}`}>
        {variante === 'plein' && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-reflet bg-gradient-to-r from-transparent via-white/35 to-transparent" />}
        <Bitcoin className="h-4.5 w-4.5 shrink-0 transition group-hover:rotate-12" />
        <span className="whitespace-nowrap">{texte}</span>
        {prix && <span className={`rounded-md px-1.5 py-0.5 text-mini font-bold ${variante === 'clair' ? 'bg-surface' : 'bg-white/20'}`}>{prix}</span>}
      </motion.button>
      {ouvert && (
        <Suspense fallback={null}>
          <PaiementModal tarif={tarif} document={document} formule={f} onClose={() => setOuvert(false)} />
        </Suspense>
      )}
    </span>
  );
}
const PaiementModal = lazy(() => import('./PaiementModal'));

/* ------------------------------------------------------------------ Les trois formules */
const ICONES: Record<FormuleId, typeof Crown> = { essentiel: Sparkles, premium: Crown, premium_plus: Gem };
export function FormulesCartes({ formuleActive }: { formuleActive?: string | null }) {
  const tarif = useTarif();
  const formules = tarif?.formules ?? [];
  if (!formules.length) return <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-[28px] bg-surface" />)}</div>;
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {formules.map((f, i) => {
        const I = ICONES[f.id];
        const vedette = f.id === 'premium';
        const active = formuleActive === f.id;
        return (
          <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className={`relative flex flex-col overflow-hidden rounded-[28px] p-7 shadow-doux ${vedette ? 'bg-secondary text-white shadow-haut md:-translate-y-3' : 'bg-fond ring-1 ring-ligne'}`}>
            {vedette && <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />}
            {vedette && <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1 text-mini font-bold text-ink">Le plus choisi</span>}
            {active && <span className="absolute right-5 top-5 rounded-full bg-succes px-3 py-1 text-mini font-bold text-white">Votre formule</span>}
            <span className={`relative grid h-12 w-12 place-items-center rounded-2xl ${vedette ? 'bg-accent text-ink' : 'bg-primary/10 text-primary'}`}><I className="h-5 w-5" /></span>
            <h3 className={`relative mt-4 text-2xl ${vedette ? 'text-white' : ''}`}>{f.nom}</h3>
            <p className={`relative mt-1 text-[14px] ${vedette ? 'text-white/70' : 'text-ink/60'}`}>{f.description}</p>
            <p className={`relative mt-5 font-serif text-5xl ${vedette ? 'text-white' : ''}`}>{f.prix.toLocaleString('fr-FR')} <span className="text-2xl">{(tarif?.devise ?? 'usd').toUpperCase()}</span></p>
            <p className={`relative text-[13px] ${vedette ? 'text-white/60' : 'text-ink/50'}`}>par mois · {enFcfa(f.prix, tarif)}</p>
            <ul className="relative mt-6 flex-1 space-y-2.5">
              {f.avantages.map((a) => (
                <li key={a} className={`flex gap-2.5 text-[14.5px] ${vedette ? 'text-white/90' : 'text-ink/80'}`}>
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${vedette ? 'bg-accent text-ink' : 'bg-primary/12 text-primary'}`}><Check className="h-3 w-3" strokeWidth={3} /></span>{a}
                </li>
              ))}
            </ul>
            <PayButton className="relative mt-7 w-full" formule={f.id} label={active ? 'Prolonger d’un mois' : `Choisir ${f.nom}`} variante={vedette ? 'plein' : 'clair'} />
          </motion.div>
        );
      })}
    </div>
  );
}

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

/** Encart « Formule requise » affiché à la place d'un contenu compris dans une formule supérieure. */
export function Paywall({ titre, texte, children, acces = 'premium' }: { titre?: string; texte?: ReactNode; children?: ReactNode; acces?: Acces }) {
  const { user } = useVisitor();
  const formule: FormuleId = acces === 'essentiel' ? 'essentiel' : acces === 'premium_plus' ? 'premium_plus' : 'premium';
  const nom = ACCES[acces]?.court ?? 'Premium';
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] bg-fond p-6 text-center shadow-haut ring-1 ring-accent/40 sm:p-10">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-[50%] bg-accent/15 blur-2xl" />
      <motion.span initial={{ scale: 0.6, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-on-primary shadow-doux">
        <Lock className="h-7 w-7" />
      </motion.span>
      <h3 className="relative mt-5 text-2xl">{titre ?? `Compris dans la formule ${nom}`}</h3>
      <p className="relative mx-auto mt-2 max-w-md text-[15px] text-ink/70">
        {texte ?? <>Ce contenu est compris dans la formule <strong>{nom}</strong> (et les formules supérieures). Une fois abonné, vous ne le payez jamais une seconde fois.</>}
      </p>
      <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {user ? (
          <>
            <PayButton formule={formule} />
            <a href={hrefOf('abonnement')} className="text-[14px] font-semibold text-primary hover:underline">Comparer les formules</a>
          </>
        ) : (
          <>
            <a href={hrefOf('inscription')} className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary">Créer mon compte gratuit</a>
            <a href={hrefOf('connexion')} className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold ring-1 ring-ligne hover:bg-surface">J’ai déjà un compte</a>
          </>
        )}
      </div>
      {!user && <p className="relative mt-4 text-mini text-ink/55">Créez d’abord votre compte, puis choisissez votre formule.</p>}
      {children}
    </motion.div>
  );
}
