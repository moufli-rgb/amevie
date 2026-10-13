import { motion } from 'motion/react';
import { Eye, Lock, Paperclip, PlayCircle } from 'lucide-react';
import { TYPES, auteur, type Contenu } from '@/lib/contenus';
import { formatDateCourte } from '@/lib/format';
import { hrefOf } from '@/lib/router';
import { GratuitBadge, PremiumBadge } from './Premium';

/** Carte d'un contenu de la bibliothèque. */
export function ContentCard({ c, i = 0 }: { c: Contenu; i?: number }) {
  const T = TYPES[c.type];
  const Icon = T.icon;
  return (
    <motion.a href={hrefOf('contenu', c.id)}
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.55, delay: Math.min(i, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-fond p-5 shadow-doux ring-1 ring-ligne transition-shadow hover:shadow-haut sm:p-6">
      {c.locked && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0" />}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-primary">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10"><Icon className="h-4 w-4" /></span>
          {c.category ?? T.label}
        </span>
        {c.access === 'premium' ? <PremiumBadge verrouille={c.locked} small /> : <GratuitBadge small />}
      </div>
      <h3 className="mt-4 line-clamp-2 text-[1.2rem] leading-snug group-hover:text-primary">{c.title}</h3>
      {c.bible_ref && <p className="mt-1 text-[13px] font-semibold italic text-accent">{c.bible_ref}</p>}
      {c.description && <p className="mt-2 line-clamp-3 text-[14px] text-ink/65">{c.description}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-mini text-ink/50">
        <span className="truncate">{auteur(c)} · {formatDateCourte(c.created_at)}</span>
        <span className="flex shrink-0 items-center gap-2">
          {c.has_file && <Paperclip className="h-3.5 w-3.5" />}
          {c.has_video && <PlayCircle className="h-3.5 w-3.5" />}
          {c.locked ? <Lock className="h-3.5 w-3.5 text-accent" /> : <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{c.views}</span>}
        </span>
      </div>
    </motion.a>
  );
}
