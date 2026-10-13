import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

/** Apparition douce au défilement. */
export function Reveal({
  children, delay = 0, y = 28, className = '', as = 'div', once = true,
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'section' | 'li' | 'article'; once?: boolean }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/** Sur-titre de section + titre serif. */
export function SectionTitle({ surtitre, titre, texte, centre = false, inverse = false }: {
  surtitre: string; titre: ReactNode; texte?: ReactNode; centre?: boolean; inverse?: boolean;
}) {
  return (
    <Reveal className={`max-w-2xl ${centre ? 'mx-auto text-center' : ''}`}>
      <p className={`surtitre ${inverse ? 'text-white/75' : 'text-accent'}`}>{surtitre}</p>
      <h2 className={`mt-3 text-[clamp(1.9rem,4.2vw,3.1rem)] ${inverse ? 'text-white' : 'text-ink'}`}>{titre}</h2>
      {texte && <p className={`mt-4 text-[15px] sm:text-base ${inverse ? 'text-white/80' : 'text-ink/70'}`}>{texte}</p>}
    </Reveal>
  );
}
