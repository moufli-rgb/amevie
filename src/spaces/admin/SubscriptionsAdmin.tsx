import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CreditCard, Settings2 } from 'lucide-react';
import type { Abonnement } from '@/lib/session';
import { formatDate, formatDateCourte } from '@/lib/format';
import { normalize } from '@/lib/normalize';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { EmptyState, Skeleton } from '@/components/ui/Empty';
import { PageHeader } from '@/dashboard/Shell';
import { LoadError, SearchInput, Tabs } from '@/dashboard/Widgets';
import { useData } from '@/dashboard/useData';
import { StatutAboBadge, SubscriptionPanel, type StatutAbo } from './common';

interface Sub {
  id: string; user_id: string; type: string; duration_months: number; start_date: string; end_date: string; status: string; note: string | null;
  activated_by: string | null; statut_reel: Exclude<StatutAbo, 'aucun'>; jours_restants: number; courant: boolean;
  users: { nom: string; prenom: string; email: string; telephone: string | null } | null;
}

/** Vers le format attendu par le panneau de gestion. */
const versAbonnement = (s: Sub): Abonnement => ({
  id: s.id, statut: s.statut_reel, premium: s.statut_reel === 'actif', type: s.type, duree_mois: s.duration_months,
  date_debut: s.start_date, date_expiration: s.end_date, jours_restants: s.jours_restants,
});

/** Section dédiée aux abonnements + alertes d'expiration. */
export function SubscriptionsAdmin({ onChange }: { onChange: () => void }) {
  const { data, error, loading, reload } = useData<{ subscriptions: Sub[]; alertes: Sub[]; types: string[] }>('subscriptions', 'admin');
  const [filtre, setFiltre] = useState<'tous' | 'actif' | 'expire' | 'desactive'>('tous');
  const [historique, setHistorique] = useState(false);
  const [q, setQ] = useState('');
  const [ouvert, setOuvert] = useState<Sub | null>(null);
  const [flash, setFlash] = useState<AlertMsg | null>(null);

  const subs = data?.subscriptions ?? [];
  const liste = useMemo(() => {
    const nq = normalize(q);
    return subs.filter((s) => (historique || s.courant) && (filtre === 'tous' || s.statut_reel === filtre)
      && (!nq || normalize(`${s.users?.prenom ?? ''} ${s.users?.nom ?? ''} ${s.users?.email ?? ''} ${s.type}`).includes(nq)));
  }, [subs, filtre, q, historique]);
  const n = (f: StatutAbo) => subs.filter((s) => s.courant && s.statut_reel === f).length;

  return (
    <div>
      <PageHeader titre="Abonnements" texte="L’expiration est automatique : à la date de fin, l’accès Premium est coupé et l’abonnement passe « Expiré »." />

      {!!data?.alertes.length && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl bg-accent/12 p-5 ring-1 ring-accent/40">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-5 w-5" /> {data.alertes.length} abonnement{data.alertes.length > 1 ? 's' : ''} expire{data.alertes.length > 1 ? 'nt' : ''} dans les 7 prochains jours</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.alertes.map((a) => (
              <li key={a.id}>
                <button onClick={() => setOuvert(a)} className="rounded-full bg-fond px-3 py-1.5 text-[13px] font-semibold ring-1 ring-ligne hover:ring-primary/40">
                  {a.users?.prenom} {a.users?.nom} · {a.jours_restants === 0 ? "aujourd’hui" : `J-${a.jours_restants}`} ({formatDateCourte(a.end_date)})
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs id="filtre-abos" value={filtre} onChange={setFiltre} options={[
          { value: 'tous', label: 'Tous' }, { value: 'actif', label: 'Actifs', badge: n('actif') || undefined },
          { value: 'expire', label: 'Expirés', badge: n('expire') || undefined }, { value: 'desactive', label: 'Désactivés' },
        ]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-[13.5px] font-semibold text-ink/70">
            <input type="checkbox" checked={historique} onChange={(e) => setHistorique(e.target.checked)} className="h-4 w-4 accent-[var(--couleur-principale)]" />
            Inclure l’historique
          </label>
          <SearchInput value={q} onChange={setQ} placeholder="Visiteur, type…" />
        </div>
      </div>

      <div className="mb-4"><Alert msg={flash} /></div>
      {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-64" /> : liste.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-6 w-6" />} title="Aucun abonnement" text="Activez un abonnement depuis la page « Visiteurs »." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {liste.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 9) * 0.03 }}
              className={`flex flex-col rounded-3xl bg-fond p-5 shadow-doux ring-1 ${s.statut_reel === 'actif' && s.jours_restants <= 7 ? 'ring-accent/60' : 'ring-ligne'} ${!s.courant ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold">{s.users ? `${s.users.prenom} ${s.users.nom}` : '—'}</p>
                  <p className="truncate text-[13px] text-ink/55">{s.users?.email}</p>
                </div>
                <StatutAboBadge s={s.statut_reel} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-y-1 text-[13px]">
                <dt className="text-ink/50">Type</dt><dd className="font-semibold">{s.type} · {s.duration_months} mois</dd>
                <dt className="text-ink/50">Début</dt><dd>{formatDate(s.start_date)}</dd>
                <dt className="text-ink/50">Expiration</dt><dd className="font-semibold">{formatDate(s.end_date)}</dd>
                {s.statut_reel === 'actif' && <><dt className="text-ink/50">Reste</dt><dd>{s.jours_restants} jour{s.jours_restants > 1 ? 's' : ''}</dd></>}
                {s.activated_by && <><dt className="text-ink/50">Activé par</dt><dd className="truncate">{s.activated_by}</dd></>}
              </dl>
              {s.note && <p className="mt-2 rounded-xl bg-surface px-3 py-2 text-[12.5px] text-ink/70">{s.note}</p>}
              {s.courant ? (
                <Button size="sm" variant="secondary" className="mt-4 self-start" icon={<Settings2 className="h-3.5 w-3.5" />} onClick={() => setOuvert(s)}>Gérer</Button>
              ) : <p className="mt-4 text-mini text-ink/45">Ancien abonnement (historique)</p>}
            </motion.div>
          ))}
        </div>
      )}

      {ouvert && (
        <Modal open onClose={() => setOuvert(null)} title={`Abonnement · ${ouvert.users?.prenom ?? ''} ${ouvert.users?.nom ?? ''}`} wide>
          <SubscriptionPanel userId={ouvert.user_id} abonnement={versAbonnement(ouvert)} types={data?.types} onChange={(a) => { reload(); onChange(); setOuvert(null); setFlash({ kind: 'success', text: `Abonnement mis à jour : ${a.statut === 'actif' ? `actif jusqu’au ${formatDate(a.date_expiration)}` : a.statut === 'desactive' ? 'désactivé' : a.statut}.` }); }} />
        </Modal>
      )}
    </div>
  );
}
