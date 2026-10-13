/** Logo Ame & Vie : flamme dans un cercle + nom en serif. */
export function Emblem({ className = 'h-10 w-10', inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span aria-hidden className={`inline-grid shrink-0 place-items-center rounded-full ${inverse ? 'bg-white/15 text-white ring-1 ring-white/30 backdrop-blur' : 'bg-primary text-on-primary'} ${className}`}>
      <svg viewBox="0 0 40 40" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6c4 5.5 8 9 8 15a8 8 0 0 1-16 0c0-3.5 1.8-6 4-8 .3 3 1.6 4.6 3.2 5.2C18.6 14 18.6 10 20 6Z" />
        <path d="M14 34h12" />
      </svg>
    </span>
  );
}

export function Logo({ inverse = false, compact = false, sousTitre = true }: { inverse?: boolean; compact?: boolean; sousTitre?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Emblem inverse={inverse} className={compact ? 'h-9 w-9' : 'h-10 w-10'} />
      <span className="min-w-0 leading-none">
        <span className={`block truncate font-serif text-[21px] font-semibold tracking-tight ${inverse ? 'text-white' : 'text-ink'}`}>
          Ame <span className="italic text-accent">&amp;</span> Vie
        </span>
        {sousTitre && <span className={`mt-1 block truncate text-mini ${inverse ? 'text-white/75' : 'text-ink/55'}`}>Plateforme spirituelle</span>}
      </span>
    </span>
  );
}
