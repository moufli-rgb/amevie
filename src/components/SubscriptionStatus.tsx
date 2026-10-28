import { CalendarClock, Crown, Lock } from 'lucide-react';
import type { Abonnement } from '@/lib/session';
import { formatDate } from '@/lib/format';
import { PayButton } from './Premium';

const LIBELLE = { actif: 'Actif', expire: 'Expiré', desactive: 'Désactivé', aucun: 'Aucun abonnement' } as const;

/** Carte d'état de l'abonnement du visiteur. */
export function SubscriptionStatus({ a }: { a?: Abonnement }) {
  const statut = a?.statut ?? 'aucun';
  const actif = statut === 'actif';
  return (
    <div className={`relative overflow-hidden rounded-[28px] p-6 shadow-haut sm:p-8 ${actif ? 'bg-secondary text-white' : 'bg-fond ring-1 ring-ligne'}`}>
      {actif && <div aria-hidden className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/35 blur-3xl" />}
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${actif ? 'bg-accent text-ink' : 'bg-surface text-ink/60'}`}>
            {actif ? <Crown className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </span>
          <div>
            <p className={`surtitre ${actif ? 'text-white/65' : 'text-ink/50'}`}>Mon abonnement</p>
            <p className={`mt-1 font-serif text-2xl ${actif ? 'text-white' : ''}`}>
              {actif ? `Premium ${a?.type ? `· ${a.type}` : ''}` : LIBELLE[statut]}
            </p>
            {actif ? (
              <p className="mt-1 flex items-center gap-1.5 text-[14px] text-white/80"><CalendarClock className="h-4 w-4" />
                Jusqu’au {formatDate(a?.date_expiration)} · {a?.jours_restants} jour{(a?.jours_restants ?? 0) > 1 ? 's' : ''} restant{(a?.jours_restants ?? 0) > 1 ? 's' : ''}
              </p>
            ) : statut === 'expire' ? (
              <p className="mt-1 text-[14px] text-ink/65">Votre accès Premium a expiré le {formatDate(a?.date_expiration)}. Les fonctionnalités gratuites restent disponibles.</p>
            ) : statut === 'desactive' ? (
              <p className="mt-1 text-[14px] text-ink/65">Votre accès Premium a été désactivé par l’administration. Vous pouvez payer un nouveau mois pour le réactiver.</p>
            ) : (
              <p className="mt-1 text-[14px] text-ink/65">Vous profitez des fonctionnalités gratuites. Passez Premium pour tout débloquer.</p>
            )}
          </div>
        </div>
        {!actif && <PayButton label={statut === 'expire' ? 'Renouveler en crypto' : 'Payer en crypto'} />}
        {actif && (a?.jours_restants ?? 99) <= 5 && <PayButton label="Prolonger d’un mois" />}
      </div>
    </div>
  );
}
