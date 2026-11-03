import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, BookOpen, Crown, Gem, HandHeart, Heart, Sparkles } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Img } from '@/components/Img';
import { HeroSlides, Traditions } from '@/components/public/HomeExtras';
import { BandeVersets, Lucioles, MotTournant } from '@/components/public/Dynamique';
import { BoutonInstaller } from '@/components/Installer';
import { ContentCard } from '@/components/ContentCard';
import { useTarif } from '@/components/Premium';
import { Reveal, SectionTitle } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Empty';
import { useData } from '@/dashboard/useData';
import { SITE } from '@/config/site';
import { hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';
import { type Contenu } from '@/lib/contenus';

interface Accueil {
  parole: { id: string; title: string; content: string; bible_ref: string; pastors: { prenom: string; nom: string } | null } | null;
  derniers: Contenu[];
  documents: Contenu[];
  total: number;
  total_documents?: number;
}

export function HomePage({ ancre }: { ancre: string }) {
  const { user } = useVisitor();
  const { data, loading } = useData<Accueil>(`contents?scope=accueil&u=${user?.id ?? ''}`, 'visiteur');
  const tarif = useTarif();
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if (!ancre) return;
    const t = setTimeout(() => document.getElementById(ancre)?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearTimeout(t);
  }, [ancre]);

  const parole = data?.parole;
  const titre = 'Nourrir l’âme, éclairer la vie'.split(' ');

  return (
    <>
      <PublicHeader actif="/" transparent />
      <main>
        {/* ====================== Héros ====================== */}
        <section ref={hero} className="relative flex min-h-[92svh] items-end overflow-hidden bg-nuit paysage:min-h-[100svh]">
          <motion.div className="absolute inset-0" style={{ y }}>
            <HeroSlides />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/55 to-nuit/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-nuit/80 via-transparent to-transparent" />
          <Lucioles />

          <motion.div style={{ opacity: fade }} className="gutter relative mx-auto w-full max-w-7xl pb-16 pt-32 sm:pb-24 paysage:pb-8 paysage:pt-20">
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-mini font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Bienvenue sur {SITE.nom}
            </motion.p>
            <h1 className="mt-5 max-w-3xl text-[clamp(2.6rem,7vw,5.4rem)] leading-[1.02] text-white paysage:mt-3 paysage:text-[clamp(2rem,5vw,3rem)]">
              {titre.map((m, i) => (
                <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                  <motion.span className={`inline-block ${m.startsWith('éclairer') ? 'italic text-accent' : ''}`} initial={{ y: '105%' }} animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>{m}</motion.span>
                </span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="mt-5 max-w-xl text-[16px] text-white/80 sm:text-lg paysage:mt-3 paysage:text-sm">
              Prières, Paroles et enseignements chrétiens, musulmans et universels. Gratuit pour commencer.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
              className="mt-4 flex flex-wrap items-baseline gap-x-2 font-serif text-[clamp(1.25rem,2.6vw,1.75rem)] text-white/90 paysage:hidden">
              Une Parole pour <MotTournant className="italic text-accent" mots={['votre foi', 'votre famille', 'vos prières', 'chaque matin', 'les jours difficiles']} />
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row paysage:mt-4">
              {user ? (
                <a href={hrefOf('espace')} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-ink hover:bg-white/90">
                  Mon espace <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <a href={hrefOf('inscription')} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-ink hover:bg-white/90">
                  Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
                </a>
              )}
              <a href={hrefOf('bibliotheque')} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/10">
                <BookOpen className="h-4 w-4" /> Explorer la bibliothèque
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ====================== Parole du jour ====================== */}
        <section className="gutter relative z-10 mx-auto -mt-10 max-w-5xl sm:-mt-14">
          <Reveal className="relative overflow-hidden rounded-[30px] bg-fond p-7 shadow-haut ring-1 ring-ligne sm:p-10">
            <div aria-hidden className="absolute -right-10 -top-10 font-serif text-[12rem] leading-none text-accent/15">“</div>
            <p className="surtitre text-accent">Parole du jour</p>
            <blockquote className="relative mt-3 font-serif text-[clamp(1.35rem,3vw,2rem)] italic leading-snug text-ink">
              « {(parole?.content ? (parole.content.length > 240 ? `${parole.content.slice(0, 240).replace(/\s+\S*$/, '')}…` : parole.content) : SITE.versetSecours.texte).replace(/^[\s«“"]+|[\s»”"]+$/g, '')} »
            </blockquote>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] font-bold tracking-wide text-primary">
                {parole?.bible_ref ?? SITE.versetSecours.reference}
                {parole?.pastors && <span className="font-normal text-ink/55"> · partagé par {`${parole.pastors.prenom} ${parole.pastors.nom}`.trim()}</span>}
              </p>
              {parole && <a href={hrefOf('contenu', parole.id)} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline">Méditer <ArrowRight className="h-4 w-4" /></a>}
            </div>
          </Reveal>
        </section>

        <Traditions />

        <BandeVersets />

        {/* ====================== Formules (aperçu) ====================== */}
        <section id="offres" className="gutter mx-auto max-w-6xl scroll-mt-20 py-20 sm:py-24">
          <SectionTitle centre surtitre="Formules" titre={<>Commencez à <em className="italic text-primary">0 $</em>, allez plus loin quand vous voulez</>} />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { id: 'gratuit', nom: 'Gratuit', prix: 0, icone: Heart },
              ...((tarif?.formules ?? []).map((f) => ({ id: f.id, nom: f.nom, prix: f.prix, icone: f.id === 'essentiel' ? Sparkles : f.id === 'premium' ? Crown : Gem }))),
            ].map((f, i) => {
              const vedette = f.id === 'premium';
              const I = f.icone;
              return (
                <motion.a key={f.id} href={f.id === 'gratuit' && !user ? hrefOf('inscription') : hrefOf('abonnement')}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -6 }}
                  className={`group relative overflow-hidden rounded-[24px] p-5 shadow-doux sm:p-6 ${vedette ? 'bg-secondary text-white ring-2 ring-accent' : 'bg-fond ring-1 ring-ligne'}`}>
                  {vedette && <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-ink">Populaire</span>}
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${vedette ? 'bg-accent text-ink' : 'bg-primary/10 text-primary'}`}><I className="h-[18px] w-[18px]" /></span>
                  <p className={`mt-4 text-[15px] font-bold ${vedette ? 'text-white' : ''}`}>{f.nom}</p>
                  <p className="mt-1 font-serif text-4xl leading-none">{f.prix} <span className="text-xl">$</span><span className={`ml-1 font-sans text-[12px] ${vedette ? 'text-white/60' : 'text-ink/50'}`}>{f.prix ? '/ mois' : ''}</span></p>
                  <span className={`mt-4 inline-flex items-center gap-1 text-[13px] font-semibold ${vedette ? 'text-accent' : 'text-primary'}`}>{f.prix ? 'Choisir' : user ? 'Inclus' : 'Commencer'} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                </motion.a>
              );
            })}
          </div>
          <Reveal className="mt-6 text-center"><a href={hrefOf('abonnement')} className="text-[14px] font-semibold text-primary hover:underline">Comparer les formules en détail →</a></Reveal>
        </section>

        {/* ====================== Derniers contenus ====================== */}
        <section className="bg-surface/70 py-20 sm:py-24">
          <div className="gutter mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionTitle surtitre="Nouveautés" titre="Publié récemment" />
              <Reveal><a href={hrefOf('bibliotheque')} className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline">Toute la bibliothèque <ArrowRight className="h-4 w-4" /></a></Reveal>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {loading && !data ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />) :
                data?.derniers.length ? data.derniers.slice(0, 3).map((c, i) => <ContentCard key={c.id} c={c} i={i} />) : (
                  <p className="col-span-full rounded-3xl border border-dashed border-ligne p-10 text-center text-ink/55">Les premiers contenus arrivent bientôt.</p>
                )}
            </div>
          </div>
        </section>

        {/* ====================== Appel final + installation ====================== */}
        <section className="gutter mx-auto max-w-7xl py-20 sm:py-24">
          <Reveal className="group relative overflow-hidden rounded-[32px]">
            <motion.div className="absolute inset-0" initial={{ scale: 1.1 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: 'easeOut' }}>
              <Img name="af_famille_joie" className="h-full w-full" decorative />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-nuit/90 via-nuit/70 to-nuit/20" />
            <div className="relative max-w-xl p-8 text-white sm:p-14">
              <p className="surtitre text-accent">Vous n’êtes pas seul</p>
              <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.8rem)] text-white">Une communauté qui prie avec vous</h2>
              <p className="mt-3 text-[15px] text-white/80">Déposez une demande de prière, c’est gratuit. Et gardez Ame & Vie sur votre téléphone, PC ou iPhone.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={user ? hrefOf('espace', 'prieres') : hrefOf('inscription')} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-ink hover:bg-white/90">
                  <HandHeart className="h-4 w-4" /> Demander une prière
                </a>
                <BoutonInstaller clair={false} className="!bg-white/15 !text-white ring-1 ring-white/40 backdrop-blur hover:!bg-white/25" label="Installer l’application" />
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
