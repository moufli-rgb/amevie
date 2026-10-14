import { useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Compass, HandHeart, Heart, ShieldCheck, Users } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Img } from '@/components/Img';
import { WhatsAppButton } from '@/components/Premium';
import { Reveal, SectionTitle } from '@/components/ui/Reveal';
import { SITE } from '@/config/site';
import { hrefOf } from '@/lib/router';

const VALEURS = [
  { icon: BookOpen, titre: 'La Parole au centre', texte: 'Chaque contenu s’enracine dans les Écritures.' },
  { icon: Heart, titre: 'La bienveillance', texte: 'Un lieu sûr, accueillant pour les jeunes comme pour les aînés.' },
  { icon: Users, titre: 'La communauté', texte: 'Des pasteurs et des fidèles qui avancent ensemble.' },
  { icon: ShieldCheck, titre: 'La confiance', texte: 'Des données protégées et des pasteurs vérifiés par l’administration.' },
];

export function AboutPage() {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <>
      <PublicHeader actif="/#apropos" />
      <main>
        <section className="relative overflow-hidden bg-nuit pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
          <motion.div className="absolute inset-0 opacity-60" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2 }}>
            <Img name="croix_colline" className="h-full w-full" decorative priority />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/70 to-nuit/40" />
          <div className="gutter relative mx-auto max-w-4xl text-center">
            <Reveal>
              <p className="surtitre text-accent">À propos</p>
              <h1 className="mt-3 text-[clamp(2.3rem,6vw,4.4rem)] text-white">{SITE.nom}, <em className="italic">une maison pour l’âme</em></h1>
              <p className="mx-auto mt-5 max-w-2xl text-[16px] text-white/80 sm:text-lg">{SITE.description}</p>
              <p className="mt-6 font-script text-3xl text-accent">« {SITE.slogan} »</p>
            </Reveal>
          </div>
        </section>

        <section className="gutter mx-auto grid max-w-6xl items-center gap-12 py-20 sm:py-28 md:grid-cols-2">
          <div>
            <SectionTitle surtitre="Notre mission" titre="Rendre la Parole accessible, chaque jour" />
            <Reveal delay={0.1}>
              <p className="mt-5 text-[15.5px] text-ink/70">
                Ame & Vie rassemble en un seul lieu des Paroles de Dieu, des enseignements, des méditations et des documents
                publiés par des pasteurs. Chacun peut y trouver de quoi nourrir sa foi, où qu’il soit, sur téléphone comme sur ordinateur.
              </p>
              <p className="mt-4 text-[15.5px] text-ink/70">
                L’essentiel est gratuit. L’abonnement Premium permet d’aller plus loin et de soutenir la plateforme et ceux qui la font vivre.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="relative pb-10 pr-10">
            <Img name="community_fellowship" className="aspect-[4/3] rounded-[28px] shadow-haut" sizes="(min-width:768px) 50vw, 100vw" />
            <Img name="louange" className="absolute bottom-0 right-0 aspect-square w-[42%] rounded-3xl shadow-haut ring-8 ring-fond" sizes="(min-width:768px) 22vw, 45vw" />
            <span className="absolute -left-3 top-6 rotate-[-6deg] rounded-2xl bg-accent px-4 py-2 font-script text-2xl text-secondary shadow-doux">Une seule famille</span>
          </Reveal>
        </section>

        <section className="bg-surface/70 py-20 sm:py-28">
          <div className="gutter mx-auto max-w-6xl">
            <SectionTitle centre surtitre="Nos valeurs" titre="Ce qui nous guide" />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {VALEURS.map((v, i) => (
                <Reveal key={v.titre} delay={i * 0.08} className="rounded-3xl bg-fond p-6 shadow-doux ring-1 ring-ligne">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><v.icon className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-xl">{v.titre}</h3>
                  <p className="mt-2 text-[14.5px] text-ink/65">{v.texte}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="gutter mx-auto max-w-6xl py-20 sm:py-28">
          <SectionTitle centre surtitre="Trois espaces" titre="Une plateforme, trois rôles" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Compass, titre: 'Visiteurs', texte: 'Lisent, téléchargent, demandent une prière. Premium pour tout débloquer.', href: hrefOf('inscription'), cta: 'Créer un compte' },
              { icon: BookOpen, titre: 'Pasteurs', texte: 'Publient Paroles, enseignements et documents depuis leur espace.', href: hrefOf('pasteur'), cta: 'Espace pasteur' },
              { icon: HandHeart, titre: 'Administration', texte: 'Valide les pasteurs, gère les abonnements et veille sur la plateforme.', href: '', cta: '' },
            ].map((e, i) => (
              <Reveal key={e.titre} delay={i * 0.1} className="flex flex-col rounded-3xl bg-fond p-7 shadow-doux ring-1 ring-ligne">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-on-primary"><e.icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-xl">{e.titre}</h3>
                <p className="mt-2 flex-1 text-[14.5px] text-ink/65">{e.texte}</p>
                {e.href && <a href={e.href} className="mt-5 text-[14px] font-semibold text-primary hover:underline">{e.cta} →</a>}
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 text-center"><WhatsAppButton size="lg" /></Reveal>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
