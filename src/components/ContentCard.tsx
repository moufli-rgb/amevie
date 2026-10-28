import { motion } from 'motion/react';
import { Eye, Lock, Paperclip, PlayCircle } from 'lucide-react';
import { RELIGIONS, RELIGION_IMAGES, TYPES, TYPE_COULEURS, TYPE_IMAGES, auteur, type Contenu } from '@/lib/contenus';
import { Img, imagePour, type ImgName } from './Img';
import { formatDateCourte } from '@/lib/format';
import { hrefOf } from '@/lib/router';
import { GratuitBadge, PremiumBadge } from './Premium';

/** Carte d'un contenu de la bibliothèque. */
export function ContentCard({ c, i = 0 }: { c: Contenu; i?: number }) {
  const T = TYPES[c.type];
  const Icon = T.icon;
  const C = TYPE_COULEURS[c.type];
  const image = imagePour(c.id, (c.religion && c.religion !== 'chretien' ? RELIGION_IMAGES[c.religion] : TYPE_IMAGES[c.type]) as unknown as ImgName[]);
  return (
    <motion.a href={hrefOf('contenu', c.id)}
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.55, delay: Math.min(i, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-fond shadow-doux ring-1 ring-ligne transition-shadow hover:shadow-haut">
      {/* Bandeau illustré, teinté à la couleur du type */}
      <div className="relative h-36 overflow-hidden">
        <Img name={image} className="h-full w-full transition-transform duration-700 group-hover:scale-105" sizes="(min-width:1024px) 400px, 100vw" decorative />
        <div className={`absolute inset-0 ${C.bg} opacity-45 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/92 py-1 pl-1 pr-3 text-[12px] font-bold text-ink backdrop-blur">
            <span className={`grid h-6 w-6 place-items-center rounded-full ${C.bg} text-white`}><Icon className="h-3.5 w-3.5" /></span>
            {c.category ?? T.label}
          </span>
          <span className="rounded-full bg-white/92 backdrop-blur">{c.access === 'premium' ? <PremiumBadge verrouille={c.locked} small /> : <GratuitBadge small />}</span>
        </div>
        {c.religion && c.religion !== 'chretien' && (
          <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full ${RELIGIONS[c.religion].bg} px-2.5 py-1 text-mini font-bold text-white shadow-doux`}>
            <span aria-hidden>{RELIGIONS[c.religion].symbole}</span> {RELIGIONS[c.religion].court}
          </span>
        )}
        {c.locked && <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur"><Lock className="h-4 w-4" /></span>}
      </div>
      <div className="flex flex-1 flex-col p-5 pt-4 sm:px-6">
      <h3 className="line-clamp-2 text-[1.2rem] leading-snug group-hover:text-primary">{c.title}</h3>
      {c.bible_ref && <p className={`mt-1 text-[13px] font-semibold italic ${C.text}`}>{c.bible_ref}</p>}
      {c.description && <p className="mt-2 line-clamp-3 text-[14px] text-ink/65">{c.description}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-mini text-ink/50">
        <span className="truncate">{auteur(c)} · {formatDateCourte(c.created_at)}</span>
        <span className="flex shrink-0 items-center gap-2">
          {c.has_file && <Paperclip className="h-3.5 w-3.5" />}
          {c.has_video && <PlayCircle className="h-3.5 w-3.5" />}
          {c.locked ? <Lock className="h-3.5 w-3.5 text-accent" /> : <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{c.views}</span>}
        </span>
      </div>
      </div>
    </motion.a>
  );
}
