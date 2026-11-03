import { motion } from 'motion/react';
import { Bitcoin, Check, Crown, Gem, Heart, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import { Img, type ImgName } from './Img';
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
export function PayButton({ className = '', label, size = 'md', document, formule = 'premium', variante = 'plein', sansPrix = false }: {
  sansPrix?: boolean; className?: string; label?: string; size?: 'md' | 'lg'; document?: { id: string; title: string; price?: number | null }; formule?: FormuleId; variante?: 'plein' | 'clair';
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
        {prix && !sansPrix && <span className={`rounded-md px-1.5 py-0.5 text-mini font-bold ${variante === 'clair' ? 'bg-surface' : 'bg-white/20'}`}>{prix}</span>}
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

/* ------------------------------------------------------------------ Les formules (Gratuit + 3 payantes) */
const ICONES: Record<FormuleId | 'gratuit', typeof Crown> = { gratuit: Heart, essentiel: Sparkles, premium: Crown, premium_plus: Gem };
const PHOTOS: Record<FormuleId | 'gratuit', ImgName> = { gratuit: 'af_meditation', essentiel: 'af_priere_femme', premium: 'af_louange', premium_plus: 'af_famille_joie' };
const GRATUIT_AVANTAGES = ['La Parole du jour', 'Les prières et contenus gratuits', 'Les documents gratuits', 'Vos demandes de prière'];

function CarteFormule({ id, nom, prix, devise, fcfa, description, avantages, vedette, active, i, action }: {
  id: FormuleId | 'gratuit'; nom: string; prix: number; devise: string; fcfa: string; description: string; avantages: string[]; vedette: boolean; active: boolean; i: number; action: ReactNode;
}) {
  const I = ICONES[id];
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col overflow-hidden rounded-[28px] shadow-doux transition-shadow hover:shadow-haut ${vedette ? 'bg-secondary text-white ring-2 ring-accent' : 'bg-fond ring-1 ring-ligne'}`}>
      <div className="relative h-36 overflow-hidden">
        <Img name={PHOTOS[id]} className="h-full w-full transition-transform duration-[1.2s] group-hover:scale-110" sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw" decorative />
        <div className={`absolute inset-0 bg-gradient-to-t ${vedette ? 'from-secondary' : 'from-fond'} via-transparent to-black/10`} />
        {vedette && !active && <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-mini font-bold text-ink shadow-doux">Le plus choisi</span>}
        {active && <span className="absolute right-4 top-4 rounded-full bg-succes px-3 py-1 text-mini font-bold text-white shadow-doux">Votre formule</span>}
        <span className={`absolute -bottom-0 left-6 grid h-12 w-12 place-items-center rounded-2xl shadow-doux ${vedette ? 'bg-accent text-ink' : id === 'gratuit' ? 'bg-surface text-primary ring-1 ring-ligne' : 'bg-primary text-on-primary'}`}><I className="h-5 w-5" /></span>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-4">
        <h3 className={`text-2xl ${vedette ? 'text-white' : ''}`}>{nom}</h3>
        <p className={`mt-1 min-h-[2.6em] text-[13.5px] ${vedette ? 'text-white/70' : 'text-ink/60'}`}>{description}</p>
        <p className={`mt-4 flex items-baseline gap-1.5 font-serif ${vedette ? 'text-white' : ''}`}>
          <span className="text-5xl leading-none">{prix.toLocaleString('fr-FR')}</span><span className="text-xl">{devise === 'USD' ? '$' : devise}</span>
          <span className={`ml-1 font-sans text-[13px] ${vedette ? 'text-white/60' : 'text-ink/50'}`}>{prix ? '/ mois' : 'pour toujours'}</span>
        </p>
        <p className={`mt-1 h-5 text-[12.5px] ${vedette ? 'text-white/55' : 'text-ink/45'}`}>{prix ? fcfa : '0 F CFA · sans carte, sans crypto'}</p>
        <ul className="mt-5 flex-1 space-y-2.5">
          {avantages.map((a) => (
            <li key={a} className={`flex gap-2.5 text-[14px] ${vedette ? 'text-white/90' : 'text-ink/80'}`}>
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${vedette ? 'bg-accent text-ink' : 'bg-primary/12 text-primary'}`}><Check className="h-3 w-3" strokeWidth={3} /></span>{a}
            </li>
          ))}
        </ul>
        <div className="mt-6">{action}</div>
      </div>
    </motion.div>
  );
}

/** Les quatre cartes : Gratuit (0 $) puis Essentiel, Premium, Premium Plus avec leur prix. */
export function FormulesCartes({ formuleActive, gratuit = true }: { formuleActive?: string | null; gratuit?: boolean }) {
  const tarif = useTarif();
  const { user } = useVisitor();
  const formules = tarif?.formules ?? [];
  const devise = (tarif?.devise ?? 'usd').toUpperCase();
  const grille = `grid gap-5 sm:grid-cols-2 ${gratuit ? 'xl:grid-cols-4' : 'lg:grid-cols-3'}`;
  if (!formules.length) return <div className={grille}>{[0, 1, 2, 3].slice(0, gratuit ? 4 : 3).map((i) => <div key={i} className="h-[30rem] animate-pulse rounded-[28px] bg-surface" />)}</div>;
  const gratuitActif = !!user && !formuleActive;
  return (
    <div className={grille}>
      {gratuit && (
        <CarteFormule id="gratuit" nom="Gratuit" prix={0} devise={devise} fcfa="" description="Pour découvrir, avec un simple compte." avantages={GRATUIT_AVANTAGES}
          vedette={false} active={gratuitActif} i={0}
          action={user
            ? <span className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-surface text-sm font-semibold text-ink/60 ring-1 ring-ligne">{gratuitActif ? 'Votre accès actuel' : 'Toujours inclus'}</span>
            : <a href={hrefOf('inscription')} className="inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-ligne transition hover:bg-surface">Créer mon compte gratuit</a>} />
      )}
      {formules.map((f, k) => {
        const vedette = f.id === 'premium';
        const active = formuleActive === f.id;
        return (
          <CarteFormule key={f.id} id={f.id} nom={f.nom} prix={f.prix} devise={devise} fcfa={enFcfa(f.prix, tarif)} description={f.description} avantages={f.avantages}
            vedette={vedette} active={active} i={k + (gratuit ? 1 : 0)}
            action={<PayButton className="w-full" formule={f.id} label={active ? 'Prolonger d’un mois' : `Choisir ${f.nom}`} variante={vedette ? 'plein' : 'clair'} sansPrix />} />
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
