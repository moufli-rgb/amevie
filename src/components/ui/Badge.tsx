import type { ReactNode } from 'react';

type Tone = 'actif' | 'attente' | 'neutre' | 'rejet';
const tones: Record<Tone, string> = {
  actif: 'bg-[color-mix(in_oklab,var(--couleur-succes)_12%,var(--couleur-fond))] text-[color-mix(in_oklab,var(--couleur-succes)_85%,var(--couleur-texte))]',
  attente: 'bg-accent/15 text-ink',
  neutre: 'bg-surface text-ink/70',
  rejet: 'bg-[color-mix(in_oklab,var(--couleur-erreur)_10%,var(--couleur-fond))] text-[color-mix(in_oklab,var(--couleur-erreur)_85%,var(--couleur-texte))]',
};

export function Badge({ tone = 'neutre', children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-mini font-semibold ${tones[tone]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${tone === 'attente' ? 'bg-accent' : 'bg-current'}`} />}
      {children}
    </span>
  );
}

export function StatutBadge({ actif }: { actif: boolean }) {
  return <Badge tone={actif ? 'actif' : 'attente'}>{actif ? 'Actif' : 'En attente'}</Badge>;
}
