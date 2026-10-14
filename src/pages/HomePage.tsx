import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight, BadgeCheck, BookOpen, Check, Crown, Download, HandHeart, Lock, MessageCircle, Sparkles, UserPlus, Wallet,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Img } from '@/components/Img';
import { HeroSlides, Mosaique, Thematiques } from '@/components/public/HomeExtras';
import { ContentCard } from '@/components/ContentCard';
import { WhatsAppButton } from '@/components/Premium';
import { Reveal, SectionTitle } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Empty';
import { useData } from '@/dashboard/useData';
import { SITE } from '@/config/site';
import { hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';
import { TYPES, type Contenu } from '@/lib/contenus';

interface Accueil {
  parole: { id: string; title: string; content: string; bible_ref: string; pastors: { prenom: string; nom: string } | null } | null;
  derniers: Contenu[];
  documents: Contenu[];
  total: number;
}
interface PasteurPublic { id: string; prenom: string; nom: string; eglise: string | null; publications: number }

const GRATUIT = [
  'La Parole du jour et les Paroles de Dieu gratuites',
  'Les enseignements et contenus marqués « Gratuit »',
  'Les documents gratuits à télécharger',
  'Vos demandes de prière, lues par les pasteurs',
];
const PREMIUM = [
  'Tous les enseignements et contenus Premium',
  'Téléchargement de tous les documents',
  'Ma bibliothèque : vos favoris toujours sous la main',
  'Les nouveautés Premium dès leur publication',
];

const ETAPES = [
  { icon: UserPlus, titre: 'Créez votre compte', texte: 'Gratuit, en une minute.' },
  { icon: MessageCircle, titre: 'Écrivez sur WhatsApp', texte: 'Bouton « Faire mon abonnement ».' },
  { icon: Wallet, titre: 'Réglez votre abonnement', texte: 'Directement avec l’administrateur.' },
  { icon: BadgeCheck, titre: 'Accès activé', texte: `Premium pendant ${SITE.dureeAbonnement}.` },
];

export function HomePage({ ancre }: { ancre: string }) {
  const { user } = useVisitor();
  const { data, loading } = useData<Accueil>(`contents?scope=accueil&u=${user?.id ?? ''}`, 'visiteur');
  const pasteurs = useData<{ pastors: PasteurPublic[] }>('pastors?scope=public', 'visiteur').data?.pastors ?? [];
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
              {SITE.description} Commencez gratuitement, passez Premium quand vous le souhaitez.
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
              « {parole?.content?.slice(0, 320) ?? SITE.versetSecours.texte} »
            </blockquote>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] font-bold tracking-wide text-primary">
                {parole?.bible_ref ?? SITE.versetSecours.reference}
                {parole?.pastors && <span className="font-normal text-ink/55"> · partagé par Pst {parole.pastors.prenom} {parole.pastors.nom}</span>}
              </p>
              {parole && <a href={hrefOf('contenu', parole.id)} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline">Méditer <ArrowRight className="h-4 w-4" /></a>}
            </div>
          </Reveal>
        </section>

        {/* ====================== Thématiques illustrées ====================== */}
        <Thematiques />

        {/* ====================== Gratuit / Premium ====================== */}
        <section id="offres" className="gutter mx-auto max-w-6xl scroll-mt-20 py-20 sm:py-28">
          <SectionTitle centre surtitre="Gratuit & Premium" titre={<>Commencez librement, <em className="italic text-primary">allez plus loin</em></>}
            texte="Les fonctionnalités Premium sont signalées par une couronne ou un cadenas partout sur le site." />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal className="rounded-[28px] bg-fond p-7 shadow-doux ring-1 ring-ligne sm:p-9">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl">Gratuit</h3>
                <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-ink/70">0 FCFA</span>
              </div>
              <p className="mt-2 text-[14.5px] text-ink/60">Avec un simple compte.</p>
              <ul className="mt-6 space-y-3">
                {GRATUIT.map((t) => (
                  <li key={t} className="flex gap-3 text-[14.5px]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-3 w-3" strokeWidth={3} /></span>{t}</li>
                ))}
              </ul>
              {!user && <a href={hrefOf('inscription')} className="mt-8 inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold ring-1 ring-ligne hover:bg-surface">Créer mon compte</a>}
            </Reveal>
            <Reveal delay={0.1} className="relative overflow-hidden rounded-[28px] bg-secondary p-7 text-white shadow-haut sm:p-9">
              <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-2xl text-white"><Crown className="h-6 w-6 text-accent" /> Premium</h3>
                <span className="rounded-full bg-accent px-3 py-1 text-[12px] font-bold text-ink">{SITE.dureeAbonnement}</span>
              </div>
              <p className="relative mt-2 text-[14.5px] text-white/70">Tout le Gratuit, plus :</p>
              <ul className="relative mt-6 space-y-3">
                {PREMIUM.map((t) => (
                  <li key={t} className="flex gap-3 text-[14.5px] text-white/90"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-ink"><Lock className="h-3 w-3" /></span>{t}</li>
                ))}
              </ul>
              <div className="relative mt-8 flex flex-wrap items-center gap-3">
                <WhatsAppButton />
                <a href={hrefOf('abonnement')} className="text-[13.5px] font-semibold text-white/80 underline-offset-4 hover:underline">Comment ça marche ?</a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ====================== Derniers contenus ====================== */}
        <section className="bg-surface/70 py-20 sm:py-28">
          <div className="gutter mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionTitle surtitre="Bibliothèque" titre="Publié récemment par nos pasteurs" />
              <Reveal><a href={hrefOf('bibliotheque')} className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline">Tout voir <ArrowRight className="h-4 w-4" /></a></Reveal>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {loading && !data ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />) :
                data?.derniers.length ? data.derniers.map((c, i) => <ContentCard key={c.id} c={c} i={i} />) : (
                  <p className="col-span-full rounded-3xl border border-dashed border-ligne p-10 text-center text-ink/55">Les premiers contenus arrivent bientôt.</p>
                )}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {(Object.keys(TYPES) as (keyof typeof TYPES)[]).map((t) => {
                const I = TYPES[t].icon;
                return (
                  <a key={t} href={hrefOf('bibliotheque', t)} className="inline-flex items-center gap-2 rounded-full bg-fond px-4 py-2 text-[13px] font-semibold ring-1 ring-ligne transition hover:ring-primary/40">
                    <I className="h-4 w-4 text-primary" /> {TYPES[t].pluriel}
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================== Documents ====================== */}
        {!!data?.documents.length && (
          <section className="gutter mx-auto max-w-6xl pt-20 sm:pt-28">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionTitle surtitre="Documents" titre="À lire, à écouter, à garder" texte="Livrets, études, audios : téléchargez les documents partagés par les pasteurs." />
              <Reveal><a href={hrefOf('bibliotheque', 'document')} className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline">Tous les documents <ArrowRight className="h-4 w-4" /></a></Reveal>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.documents.map((c, i) => <ContentCard key={c.id} c={c} i={i} />)}
            </div>
          </section>
        )}

        {/* ====================== Espace pasteur ====================== */}
        <section className="gutter mx-auto max-w-6xl py-20 sm:py-28">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
            <Reveal className="relative">
              <Img name="spiritual_bible_study" className="aspect-[4/3] rounded-[28px] shadow-haut" sizes="(min-width:768px) 50vw, 100vw" />
              <div className="absolute -bottom-5 right-5 rounded-2xl bg-fond px-5 py-3 shadow-haut ring-1 ring-ligne">
                <p className="font-script text-2xl leading-none text-primary">Partager la Parole</p>
              </div>
            </Reveal>
            <div>
              <SectionTitle surtitre="Espace pasteur" titre="Un espace simple pour publier" texte="Les pasteurs disposent de leur propre tableau de bord pour nourrir la communauté." />
              <ul className="mt-6 space-y-3">
                {['Publier une Parole de Dieu en quelques secondes', 'Partager enseignements, méditations et prières', 'Ajouter des documents (PDF, audio, présentations…)', 'Choisir pour chaque publication : Gratuit ou Premium'].map((t) => (
                  <li key={t} className="flex gap-3 text-[14.5px]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-3 w-3" strokeWidth={3} /></span>{t}</li>
                ))}
              </ul>
              <a href={hrefOf('pasteur')} className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold ring-1 ring-ligne hover:bg-surface">
                Accéder à l’espace pasteur <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ====================== Comment s'abonner ====================== */}
        <section className="bg-surface/70 py-20 sm:py-28"><div className="gutter mx-auto max-w-6xl">
          <SectionTitle centre surtitre="Abonnement" titre="Devenir Premium en 4 étapes" texte="Pas de paiement en ligne : tout se fait simplement avec l’administrateur sur WhatsApp." />
          <ol className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div aria-hidden className="absolute left-[12%] right-[12%] top-7 hidden h-px origin-left bg-ligne lg:block"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
            {ETAPES.map((e, i) => {
              const I = e.icon;
              return (
                <Reveal as="li" key={e.titre} delay={i * 0.12} className="relative text-center">
                  <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-on-primary shadow-doux ring-8 ring-fond">
                    <I className="h-6 w-6" />
                    <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-accent text-mini font-bold text-ink">{i + 1}</span>
                  </span>
                  <h3 className="mt-5 text-lg">{e.titre}</h3>
                  <p className="mt-1 text-[14px] text-ink/60">{e.texte}</p>
                </Reveal>
              );
            })}
          </ol>
          <Reveal className="mt-12 text-center"><WhatsAppButton size="lg" /></Reveal>
        </div></section>

        {/* ====================== Pasteurs ====================== */}
        {!!pasteurs.length && (
          <section className="gutter mx-auto max-w-6xl py-20">
            <SectionTitle centre surtitre="Nos pasteurs" titre="Ils partagent la Parole" />
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {pasteurs.slice(0, 8).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.05} className="flex items-center gap-3 rounded-2xl bg-fond px-4 py-3 shadow-doux ring-1 ring-ligne">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-serif text-primary">{p.prenom[0]}{p.nom[0]}</span>
                  <span>
                    <a href={hrefOf('bibliotheque', 'pasteur', p.id)} className="block text-[14px] font-bold">Pst {p.prenom} {p.nom}</a>
                    <span className="block text-mini text-ink/55">{[p.eglise, `${p.publications} publication${p.publications > 1 ? 's' : ''}`].filter(Boolean).join(' · ')}</span>
                  </span>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ====================== Mosaïque de photos ====================== */}
        <Mosaique />

        {/* ====================== Appel final ====================== */}
        <section className="gutter mx-auto max-w-7xl pb-20 sm:pb-28">
          <Reveal className="relative overflow-hidden rounded-[32px]">
            <Img name="community_fellowship" className="absolute inset-0 h-full w-full" decorative />
            <div className="absolute inset-0 bg-gradient-to-r from-nuit/90 via-nuit/70 to-nuit/30" />
            <div className="relative max-w-xl p-8 text-white sm:p-14">
              <p className="surtitre text-accent">Une communauté de foi</p>
              <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.8rem)] text-white">Vous n’êtes pas seul sur le chemin</h2>
              <p className="mt-3 text-[15px] text-white/80">Déposez une demande de prière : nos pasteurs la portent avec vous. C’est gratuit.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={user ? hrefOf('espace', 'prieres') : hrefOf('inscription')} className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-ink">
                  <HandHeart className="h-4 w-4" /> Demander une prière
                </a>
                <a href={hrefOf('bibliotheque', 'document')} className="inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold ring-1 ring-white/40 hover:bg-white/10">
                  <Download className="h-4 w-4" /> Documents
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
