import { useEffect } from 'react';
import { BadgeCheck, Bitcoin, ShieldCheck, ShoppingBag, UserPlus, Wallet } from 'lucide-react';
import { PageBanner } from '@/components/public/PageBanner';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { CryptosAcceptees, FormulesCartes, useTarif } from '@/components/Premium';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { Reveal, SectionTitle } from '@/components/ui/Reveal';
import { SITE } from '@/config/site';
import { hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';

const FAQ = [
  ['Comment se passe le paiement ?', 'Cliquez sur « Payer mon abonnement en crypto » : une page de paiement sécurisée s’ouvre. Choisissez la cryptomonnaie que vous voulez (Bitcoin, Ethereum, USDT, BNB, Solana, TRON… plus de 300 au choix), puis envoyez le montant indiqué depuis votre portefeuille ou votre plateforme d’échange.'],
  ['Quand mon accès est-il activé ?', 'Automatiquement, dès que le réseau a confirmé votre paiement (en général quelques minutes). Revenez sur le site : votre accès Premium est débloqué, sans aucune démarche.'],
  ['Et les livres, programmes et packs ?', 'Les documents marqués Essentiel, Premium ou Premium Plus sont compris dans la formule correspondante : vous ne les payez jamais deux fois. Les livres, programmes (7, 14, 30, 40 jours) et packs marqués « À l’unité » sont un programme à part : chacun les achète séparément, abonné ou non, et les garde pour toujours.'],
  ['Quelle différence entre les formules ?', 'Essentiel donne l’essentiel du quotidien, Premium ouvre tout le contenu de votre communauté (enseignements, audios, vidéos), Premium Plus ajoute les contenus et documents exclusifs Premium Plus. Changer de formule est possible à tout moment.'],
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
      <PageBanner image="af_louange" surtitre="Abonnement" teinte="bg-accent"
        titre={<>Gratuit pour commencer, <em className="italic text-accent">Premium pour aller loin</em></>}
        texte={<>0 $ avec un simple compte{tarif?.formules?.length ? `, puis de ${Math.min(...tarif.formules.map((f) => f.prix))} à ${Math.max(...tarif.formules.map((f) => f.prix))} $ par mois` : ''}, payés dans la cryptomonnaie de votre choix.</>} />
      <main className="pb-24 pt-10">
        <div className="gutter mx-auto max-w-5xl">

          {user && <div className="mt-10"><SubscriptionStatus a={user.abonnement} /></div>}

          <section className="mt-14">
            <SectionTitle centre surtitre="Nos formules" titre="Choisissez votre accompagnement" texte="Chaque formule ouvre les contenus de son niveau et des niveaux inférieurs. Un document compris dans votre formule ne se paie jamais deux fois." />
            <div className="mx-auto mt-12 xl:-mx-24"><FormulesCartes formuleActive={user?.abonnement?.formule ?? null} /></div>
            <p className="mt-6 flex items-center justify-center gap-2 text-mini text-ink/55"><ShieldCheck className="h-4 w-4" /> Paiement sécurisé en cryptomonnaie · aucune donnée bancaire demandée</p>
          </section>

          <Reveal className="mt-12 flex flex-col items-start gap-4 rounded-[28px] bg-surface/70 p-7 ring-1 ring-ligne sm:flex-row sm:items-center">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary"><ShoppingBag className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="text-[16px] font-bold">Programmes, packs et livres : un programme à part</p>
              <p className="mt-1 text-[14px] text-ink/65">Programmes de 7, 14, 30 ou 40 jours, packs de prières, packs de fête et livres sont vendus à l’unité, pour tout le monde, abonné ou non.</p>
            </div>
            <a href={hrefOf('bibliotheque', 'programme')} className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary">Voir les programmes</a>
          </Reveal>

          <div className="mx-auto mt-12 max-w-2xl">
            <Reveal delay={0.1} className="rounded-[28px] bg-fond p-8 shadow-doux ring-1 ring-ligne sm:p-10">
              <h2 className="text-2xl">Comment ça marche</h2>
              <ol className="mt-6 space-y-5">
                {[
                  { icon: UserPlus, t: 'Créez votre compte gratuit' },
                  { icon: Bitcoin, t: 'Choisissez votre formule et votre cryptomonnaie' },
                  { icon: Wallet, t: 'Envoyez le montant affiché depuis votre portefeuille' },
                  { icon: BadgeCheck, t: `Votre formule s’active pour ${SITE.dureeAbonnement}` },
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
