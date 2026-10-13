import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Img, type ImgName } from '@/components/Img';
import { formatNombre } from '@/lib/format';

/** Bannière d'accueil avec photo et zoom lent. */
export function WelcomeBanner({ photo = 'daily_prayer_verse', surtitre, titre, texte, children }: {
  photo?: ImgName; surtitre: string; titre: ReactNode; texte?: ReactNode; children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-black shadow-doux">
      <motion.div className="absolute inset-0" initial={{ scale: 1 }} animate={{ scale: 1.12 }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}>
        <Img name={photo} className="h-full w-full" sizes="(min-width:1024px) 900px, 100vw" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
      <div className="relative flex min-h-[200px] flex-col justify-end p-6 text-white sm:min-h-[230px] sm:p-8 paysage:min-h-[150px] paysage:p-5">
        <p className="surtitre text-white/70">{surtitre}</p>
        <h1 className="mt-2 text-[clamp(1.7rem,3.6vw,2.5rem)] text-white">{titre}</h1>
        {texte && <p className="mt-2 max-w-xl text-[14.5px] text-white/80">{texte}</p>}
        {children && <div className="mt-5 flex flex-wrap gap-2">{children}</div>}
      </div>
    </section>
  );
}

export interface Stat { label: string; value: number | null | undefined; icon: LucideIcon; hint?: string; onClick?: () => void }

/** Grille de statistiques animées. */
export function StatGrid({ stats, cols = 'sm:grid-cols-3' }: { stats: Stat[]; cols?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${cols} paysage:grid-cols-3`}>
      {stats.map((s, i) => {
        const I = s.icon;
        const Comp = s.onClick ? motion.button : motion.div;
        return (
          <Comp key={s.label} onClick={s.onClick}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}
            whileHover={s.onClick ? { y: -3 } : undefined}
            className="rounded-3xl bg-fond p-4 text-left shadow-doux ring-1 ring-ligne sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/8 text-primary"><I className="h-[18px] w-[18px]" /></span>
              {s.hint && <span className="truncate text-mini font-semibold text-ink/45">{s.hint}</span>}
            </div>
            <p className="mt-4 font-serif text-[1.9rem] leading-none sm:text-[2.2rem]">{s.value === null ? '—' : formatNombre(s.value ?? 0)}</p>
            <p className="mt-1.5 truncate text-[13px] font-semibold text-ink/60">{s.label}</p>
          </Comp>
        );
      })}
    </div>
  );
}

/** Carte blanche arrondie. */
export function Card({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-fond p-5 shadow-doux ring-1 ring-ligne sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg sm:text-xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Onglets avec pastille animée. */
export function Tabs<T extends string>({ value, onChange, options, id }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string; badge?: number }[]; id: string;
}) {
  return (
    <div className="no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-fond p-1 shadow-doux ring-1 ring-ligne" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} onClick={() => onChange(o.value)}
          className={`relative shrink-0 rounded-xl px-4 py-2 text-[13.5px] font-semibold transition-colors ${o.value === value ? 'text-on-primary' : 'text-ink/65 hover:text-ink'}`}>
          {o.value === value && <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-xl bg-primary" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="relative flex items-center gap-2">
            {o.label}
            {!!o.badge && <span className={`rounded-full px-1.5 text-mini font-bold ${o.value === value ? 'bg-on-primary text-primary' : 'bg-accent text-on-primary'}`}>{o.badge}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Champ de recherche compact. */
export function SearchInput({ value, onChange, placeholder = 'Rechercher…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">{placeholder}</span>
      <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type="search"
        className="h-11 w-full rounded-xl border border-ligne bg-fond pl-10 pr-3 text-[14px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/12" />
    </label>
  );
}

/** Bloc d'erreur de chargement (ex. table manquante). */
export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl bg-accent/10 p-5 text-[14px] ring-1 ring-accent/30">
      <p className="font-semibold">Impossible de charger les données</p>
      <p className="mt-1 text-ink/70">{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-3 text-[13px] font-bold text-primary underline-offset-4 hover:underline">Réessayer</button>}
    </div>
  );
}
