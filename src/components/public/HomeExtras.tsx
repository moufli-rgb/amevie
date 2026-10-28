import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Img, type ImgName } from '../Img';
import { Reveal, SectionTitle } from '../ui/Reveal';
import { RELIGIONS, TYPES, TYPE_COULEURS, type TypeContenu } from '@/lib/contenus';
import { hrefOf } from '@/lib/router';

/** Fond du héros : fondu enchaîné entre plusieurs photos, avec zoom lent. */
const HERO: ImgName[] = ['hero_prayer_light', 'croix_aube', 'louange', 'bible_mains'];
export function HeroSlides() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % HERO.length), 7000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div key={HERO[i]} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }}>
          <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: 'linear' }}>
            <Img name={HERO[i]} className="h-full w-full" priority />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-6 right-6 z-10 hidden gap-1.5 sm:flex" aria-hidden>
        {HERO.map((h, k) => <span key={h} className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? 'w-6 bg-white' : 'w-1.5 bg-white/45'}`} />)}
      </div>
    </>
  );
}

/** Quatre grandes tuiles illustrées, une par type de contenu. */
const THEMES: { type: TypeContenu; image: ImgName; texte: string }[] = [
  { type: 'parole', image: 'croix_colline', texte: 'Un verset chaque jour pour éclairer vos pas.' },
  { type: 'enseignement', image: 'bible_cafe', texte: 'Des messages pour grandir dans la foi.' },
  { type: 'document', image: 'bible_nature', texte: 'Guides, plans de lecture, livrets à télécharger.' },
  { type: 'contenu', image: 'priere_femme', texte: 'Prières, méditations, louange et témoignages.' },
];
export function Thematiques() {
  return (
    <section className="gutter mx-auto max-w-7xl pt-20 sm:pt-28">
      <SectionTitle centre surtitre="Explorer" titre={<>Que cherchez-vous <em className="italic text-primary">aujourd’hui</em> ?</>} />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {THEMES.map((t, k) => {
          const T = TYPES[t.type];
          const C = TYPE_COULEURS[t.type];
          const I = T.icon;
          return (
            <motion.a key={t.type} href={hrefOf('bibliotheque', t.type)}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: k * 0.1, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -6 }}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[28px] p-6 text-white shadow-doux sm:aspect-[3/4]">
              <Img name={t.image} className="absolute inset-0 h-full w-full transition-transform duration-[1.2s] group-hover:scale-110" sizes="(min-width:1024px) 25vw, 50vw" decorative />
              <div className={`absolute inset-0 ${C.bg} opacity-55 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-35`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <span className={`absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl ${C.bg} shadow-doux`}><I className="h-5 w-5" /></span>
              <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight className="h-5 w-5" /></span>
              <div className="relative">
                <h3 className="text-2xl text-white">{T.pluriel}</h3>
                <p className="mt-1.5 text-[14px] text-white/85">{t.texte}</p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}

/** Mosaïque de photos « La foi au quotidien ». */
const MOSAIQUE: { image: ImgName; cls: string; legende: string }[] = [
  { image: 'chorale', cls: 'col-span-2 row-span-2', legende: 'Louer ensemble' },
  { image: 'enfant_bible', cls: '', legende: 'Transmettre' },
  { image: 'lumiere', cls: '', legende: 'Adorer' },
  { image: 'celebration', cls: 'col-span-2', legende: 'Partager' },
  { image: 'coucher_soleil', cls: '', legende: 'Contempler' },
  { image: 'spiritual_bible_study', cls: '', legende: 'Méditer' },
];
export function Mosaique() {
  return (
    <section className="gutter mx-auto max-w-7xl py-20 sm:py-28">
      <SectionTitle centre surtitre="La foi au quotidien" titre="Prier, méditer, partager" texte="Ame & Vie accompagne chaque moment de votre marche avec Dieu." />
      <div className="mt-12 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:gap-4 md:grid-cols-4">
        {MOSAIQUE.map((m, k) => (
          <Reveal key={m.image} delay={k * 0.07} className={`group relative overflow-hidden rounded-3xl ${m.cls}`}>
            <Img name={m.image} className="h-full w-full transition-transform duration-[1.2s] group-hover:scale-110" sizes="(min-width:768px) 50vw, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-4 font-script text-2xl text-white drop-shadow sm:text-3xl">{m.legende}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Trois traditions */
const TRADITIONS = [
  { r: 'chretien', image: 'croix_aube', texte: 'La Bible, les Évangiles, la prière et la louange.' },
  { r: 'musulman', image: 'islam_nuit', texte: 'Le Coran, les beaux noms d’Allah, la prière et le jeûne.' },
  { r: 'universel', image: 'universel_aube', texte: 'Sagesses du monde, méditation, gratitude et paix intérieure.' },
] as const;
export function Traditions() {
  return (
    <section className="gutter mx-auto max-w-7xl py-16 sm:py-24">
      <SectionTitle centre surtitre="Trois chemins" titre={<>Une plateforme <em className="italic text-primary">pour chacun</em></>}
        texte="Choisissez votre tradition : la bibliothèque n’affiche que ses contenus et ses livres. Vous pouvez aussi tout parcourir." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {TRADITIONS.map((t, i) => {
          const R = RELIGIONS[t.r];
          return (
            <motion.a key={t.r} href={hrefOf('bibliotheque', t.r)} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -6 }}
              className="group relative flex min-h-[19rem] flex-col justify-end overflow-hidden rounded-[28px] p-6 text-white shadow-haut">
              <div className="absolute inset-0"><Img name={t.image} className="h-full w-full transition-transform duration-700 group-hover:scale-105" sizes="(min-width:768px) 33vw, 100vw" decorative /></div>
              <div className={`absolute inset-0 ${R.bg} opacity-35 mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <span className={`relative grid h-12 w-12 place-items-center rounded-2xl ${R.bg} text-xl shadow-doux`}>{R.symbole}</span>
              <h3 className="relative mt-4 text-2xl text-white">{R.label}</h3>
              <p className="relative mt-1 text-[14.5px] text-white/80">{t.texte}</p>
              <span className="relative mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white">Explorer <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span></span>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
