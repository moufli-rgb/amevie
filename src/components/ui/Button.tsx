import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary shadow-doux hover:brightness-110',
  secondary: 'bg-surface text-ink ring-1 ring-ligne hover:bg-ligne/60',
  ghost: 'text-ink/75 hover:bg-surface hover:text-ink',
  danger: 'bg-[color-mix(in_oklab,var(--couleur-erreur)_88%,var(--couleur-texte))] text-white hover:brightness-110',
  light: 'bg-white text-ink hover:bg-white/90',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  shine?: boolean; // reflet animé
}

/** Bouton commun. Le bouton principal peut porter un reflet animé. */
export function Button({ variant = 'primary', loading, icon, size = 'md', shine, className = '', children, disabled, ...rest }: Props) {
  const h = size === 'lg' ? 'h-12 px-6 text-[15px]' : size === 'sm' ? 'h-9 px-3.5 text-[13px]' : 'h-11 px-5 text-sm';
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${h} ${styles[variant]} ${className}`}
    >
      {shine && !disabled && !loading && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-reflet bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      )}
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span className="relative">{children}</span>
    </button>
  );
}

export function IconButton({ label, children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
      {...(rest as object)}
      className={`grid h-10 w-10 place-items-center rounded-xl text-ink/75 transition-colors hover:bg-surface hover:text-ink ${className}`}
    >
      {children}
    </motion.button>
  );
}
