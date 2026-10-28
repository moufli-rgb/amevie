import { useEffect } from 'react';
import { BadgeCheck, Bitcoin, Check, Crown, ShieldCheck, UserPlus, Wallet } from 'lucide-react';
import { PageBanner } from '@/components/public/PageBanner';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { CryptosAcceptees, PayButton, prixAffiche, useTarif } from '@/components/Premium';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { Reveal, SectionTitle } from '@/components/ui/Reveal';
import { SITE } from '@/config/site';
import { hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';

const FAQ = [
  ['Comment se passe le paiement ?', 'Cliquez sur « Payer mon abonnement en crypto » : une page de paiement sécurisée s’ouvre. Choisissez la cryptomonnaie que vous voulez (Bitcoin, Ethereum, USDT, BNB, Solana, TRON… plus de 300 au choix), puis envoyez le montant indiqué depuis votre portefeuille ou votre plateforme d’échange.'],
  ['Quand mon accès est-il activé ?', 'Automatiquement, dès que le réseau a confirmé votre paiement (en général quelques minutes). Revenez sur le site : votre accès Premium est débloqué, sans aucune démarche.'],
  ['Je préfère envoyer moi-même la crypto', 'C’est possible : choisissez « Envoyer moi-même ». Le site affiche l’adresse de l’administration (avec un QR code). Envoyez le montant, collez le numéro de la transaction, et l’administration valide votre accès après vérification.'],
  ['Puis-je payer avec n’importe quelle cryptomonnaie ?', 'Oui. Le prix est fixé en une seule devise, et la page de paiement calcule tout de suite le montant exact dans la cryptomonnaie que vous choisissez.'],
  ['Combien de temps dure l’abonnement ?', `${SITE.dureeAbonnement}. Par exemple : activé le 10 octobre, il expire le 10 novembre. À cette date, l’accès Premium se coupe automatiquement ; le gratuit reste accessible.`],
  ['Comment renouveler ?', 'Payez à nouveau un mois, même avant la fin : le nouveau mois s’ajoute à la suite de votre abonnement en cours, vous ne perdez aucun jour.'],
];

export function SubscriptionPage() {
  const { user } = useVisitor();
  const tarif = useTarif();
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <>
      <PublicHeader actif="/#abonnement" transparent />
      <PageBanner image="lumiere" surtitre="Abonnement Premium" teinte="bg-accent"
        titre={<>Tout Ame & Vie, <em className="italic text-accent">sans limite</em></>}
        texte={<>Un abonnement de {SITE.dureeAbonnement}{prixAffiche(tarif) ? ` pour ${prixAffiche(tarif)}` : ''}, payé dans la cryptomonnaie de votre choix et activé automatiquement.</>} />
      <main className="pb-24 pt-10">
        <div className="gutter mx-auto max-w-5xl">

          {user && <div className="mt-10"><SubscriptionStatus a={user.abonnement} /></div>}

          <div className="mt-12 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <Reveal className="relative overflow-hidden rounded-[28px] bg-secondary p-8 text-white shadow-haut sm:p-10">
              <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
              <h2 className="relative flex items-center gap-2 text-3xl text-white"><Crown className="h-7 w-7 text-accent" /> Premium</h2>
              <p className="relative mt-2 text-white/70">Durée : {SITE.dureeAbonnement} · renouvelable</p>
              {prixAffiche(tarif) && <p className="relative mt-4 font-serif text-5xl text-white">{prixAffiche(tarif)}<span className="ml-2 font-sans text-base text-white/60">/ mois</span></p>}
              <ul className="relative mt-7 space-y-3.5">
                {['Tous les enseignements et contenus Premium', 'Téléchargement de tous les documents', 'Ma bibliothèque : enregistrez vos contenus favoris', 'Toutes les fonctionnalités gratuites'].map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] text-white/90"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-ink"><Check className="h-3 w-3" strokeWidth={3} /></span>{t}</li>
                ))}
              </ul>
              <div className="relative mt-9">
                {user ? <PayButton size="lg" /> : (
                  <div className="flex flex-col gap-3 xl:flex-row">
                    <a href={hrefOf('inscription')} className="inline-flex h-12 whitespace-nowrap items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-ink">1. Créer mon compte</a>
                    <PayButton size="lg" label="2. Payer en crypto" />
                  </div>
                )}
                <p className="mt-4 flex items-center gap-2 text-mini text-white/60"><ShieldCheck className="h-4 w-4" /> Paiement sécurisé · aucune donnée bancaire demandée</p>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="rounded-[28px] bg-fond p-8 shadow-doux ring-1 ring-ligne sm:p-10">
              <h2 className="text-2xl">Comment ça marche</h2>
              <ol className="mt-6 space-y-5">
                {[
                  { icon: UserPlus, t: 'Créez votre compte gratuit' },
                  { icon: Bitcoin, t: 'Cliquez sur « Payer en crypto » et choisissez votre cryptomonnaie' },
                  { icon: Wallet, t: 'Envoyez le montant affiché depuis votre portefeuille' },
                  { icon: BadgeCheck, t: `Votre accès Premium s’active tout seul pour ${SITE.dureeAbonnement}` },
                ].map((e, i) => (
                  <li key={e.t} className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-on-primary"><e.icon className="h-[18px] w-[18px]" /></span>
                    <p className="pt-2 text-[14.5px]"><strong className="mr-1 text-primary">{i + 1}.</strong>{e.t}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-7 text-mini font-semibold text-ink/50">Cryptomonnaies acceptées</p>
              <CryptosAcceptees className="mt-2 !justify-start" />
            </Reveal>
          </div>

          <section className="mt-20">
            <SectionTitle centre surtitre="Questions fréquentes" titre="Bon à savoir" />
            <div className="mx-auto mt-10 max-w-3xl space-y-3">
              {FAQ.map(([q, r], i) => (
                <Reveal key={q} delay={i * 0.05}>
                  <details className="group rounded-2xl bg-fond p-5 shadow-doux ring-1 ring-ligne [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                      {q}<span className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-[14.5px] text-ink/70">{r}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
