/**
 * Effets vivants du site public : lucioles, mot qui change, compteurs animés,
 * bande de versets qui défile, barre de progression de lecture, bouton « haut de page ».
 * Tous respectent « prefers-reduced-motion » (animations coupées si l'appareil le demande).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { ArrowUp, BookOpen, Download, Sparkles, Users } from 'lucide-react';

/* ------------------------------------------------------------------ Lucioles */
export function Lucioles({ nombre = 22 }: { nombre?: number }) {
  const reduit = useReducedMotion();
  const points = useMemo(() => Array.from({ length: nombre }, (_, i) => ({
    id: i,
    x: (i * 37 + 11) % 100,
    taille: 2 + ((i * 7) % 5),
    duree: 9 + ((i * 13) % 9),
    delai: (i * 0.7) % 6,
    derive: ((i % 2 ? 1 : -1) * (10 + (i * 5) % 30)),
  })), [nombre]);
  if (reduit) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {points.map((p) => (
        <motion.span key={p.id}
          className="absolute bottom-[-10px] rounded-full bg-accent shadow-[0_0_12px_3px_color-mix(in_oklab,var(--couleur-accent)_70%,transparent)]"
          style={{ left: `${p.x}%`, width: p.taille, height: p.taille }}
          animate={{ y: ['0vh', '-95vh'], x: [0, p.derive, 0], opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: p.duree, delay: p.delai, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Mot qui change */
export function MotTournant({ mots, className = '', intervalle = 2600 }: { mots: string[]; className?: string; intervalle?: number }) {
  const [i, setI] = useState(0);
  const reduit = useReducedMotion();
  useEffect(() => {
    if (reduit) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % mots.length), intervalle);
    return () => window.clearInterval(t);
  }, [mots.length, intervalle, reduit]);
  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={mots[i]} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="col-start-1 row-start-1 whitespace-nowrap">
          {mots[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------ Compteur animé */
function Compteur({ valeur, suffixe = '' }: { valeur: number; suffixe?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const vu = useInView(ref, { once: true, margin: '-40px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!vu) return;
    const c = animate(0, valeur, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [vu, valeur]);
  return <span ref={ref}>{n.toLocaleString('fr-FR')}{suffixe}</span>;
}

export function Compteurs({ contenus, documents, guides }: { contenus: number; documents: number; guides: number }) {
  const items = [
    { icon: BookOpen, valeur: contenus, label: 'publications', teinte: 'bg-parole' },
    { icon: Download, valeur: documents, label: 'livres & documents', teinte: 'bg-document' },
    { icon: Users, valeur: guides, label: guides > 1 ? 'guides spirituels' : 'guide spirituel', teinte: 'bg-enseignement' },
    { icon: Sparkles, valeur: 24, suffixe: 'h/24', label: 'accessible partout', teinte: 'bg-contenu' },
  ];
  return (
    <section className="gutter mx-auto max-w-6xl py-10 sm:py-14">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {items.map((it, i) => (
          <motion.div key={it.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6 }} whileHover={{ y: -4, rotate: i % 2 ? 0.6 : -0.6 }}
            className="relative overflow-hidden rounded-3xl bg-fond p-5 shadow-doux ring-1 ring-ligne sm:p-6">
            <div aria-hidden className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${it.teinte} opacity-15 blur-xl`} />
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${it.teinte} text-white shadow-doux`}><it.icon className="h-5 w-5" /></span>
            <p className="mt-4 font-serif text-[2.4rem] leading-none text-ink"><Compteur valeur={it.valeur} suffixe={it.suffixe} /></p>
            <p className="mt-1.5 text-[13.5px] text-ink/60">{it.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Bande de versets */
const VERSETS = [
  ['L’Éternel est mon berger : je ne manquerai de rien.', 'Psaume 23:1'],
  ['Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.', 'Psaume 119:105'],
  ['Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.', 'Matthieu 11:28'],
  ['Je puis tout par celui qui me fortifie.', 'Philippiens 4:13'],
  ['Car Dieu a tant aimé le monde qu’il a donné son Fils unique.', 'Jean 3:16'],
  ['Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.', '1 Pierre 5:7'],
];
export function BandeVersets() {
  const liste = [...VERSETS, ...VERSETS];
  return (
    <section aria-label="Versets" className="relative overflow-hidden border-y border-ligne bg-secondary py-5 text-white">
      <div className="flex w-max animate-defilement gap-10 hover:[animation-play-state:paused]">
        {liste.map(([t, r], i) => (
          <p key={i} className="flex shrink-0 items-center gap-3 whitespace-nowrap text-[15px]">
            <span className="text-accent">✦</span>
            <span className="font-serif italic text-white/90">« {t} »</span>
            <span className="text-mini font-bold uppercase tracking-wider text-accent">{r}</span>
          </p>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-secondary to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-secondary to-transparent" />
    </section>
  );
}

/* ------------------------------------------------------------------ Progression + haut de page */
export function ProgressionLecture() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });
  const [haut, setHaut] = useState(false);
  useEffect(() => {
    const on = () => setHaut(window.scrollY > 900);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <>
      <motion.div aria-hidden style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-accent to-primary" />
      <AnimatePresence>
        {haut && (
          <motion.button key="haut" type="button" aria-label="Revenir en haut de la page"
            initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ y: -3 }} whileTap={{ scale: 0.92 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary shadow-haut">
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
