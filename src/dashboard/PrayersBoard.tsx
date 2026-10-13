import { useState } from 'react';
import { motion } from 'motion/react';
import { HandHeart } from 'lucide-react';
import { api } from '@/lib/api';
import type { Role } from '@/lib/session';
import { depuis } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, Skeleton } from '@/components/ui/Empty';
import { LoadError, Tabs } from './Widgets';
import { useData } from './useData';

interface Priere { id: string; subject: string; message: string; anonymous: boolean; status: 'nouvelle' | 'en_priere' | 'exaucee'; handled_by: string | null; created_at: string; auteur: string | null }
const STATUTS = {
  nouvelle: { label: 'Nouvelle', tone: 'attente' as const },
  en_priere: { label: 'En prière', tone: 'neutre' as const },
  exaucee: { label: 'Exaucée', tone: 'actif' as const },
};

/** Demandes de prière reçues (pasteurs et administrateur). */
export function PrayersBoard({ role }: { role: Role }) {
  const { data, setData, error, loading, reload } = useData<{ prayers: Priere[] }>('prayers', role);
  const [filtre, setFiltre] = useState<'tous' | Priere['status']>('nouvelle');
  const items = data?.prayers ?? [];
  const liste = items.filter((p) => filtre === 'tous' || p.status === filtre);

  async function changer(p: Priere, status: Priere['status']) {
    const r = await api<{ handled_by: string }>(`prayers?id=${p.id}`, { method: 'PATCH', role, body: { status } });
    setData({ prayers: items.map((x) => (x.id === p.id ? { ...x, status, handled_by: r.handled_by } : x)) });
  }

  return (
    <div>
      <div className="mb-5">
        <Tabs id={`pr-${role}`} value={filtre} onChange={setFiltre} options={[
          { value: 'nouvelle', label: 'Nouvelles', badge: items.filter((p) => p.status === 'nouvelle').length || undefined },
          { value: 'en_priere', label: 'En prière' }, { value: 'exaucee', label: 'Exaucées' }, { value: 'tous', label: 'Toutes' },
        ]} />
      </div>
      {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-40" /> : liste.length === 0 ? (
        <EmptyState icon={<HandHeart className="h-6 w-6" />} title="Aucune demande" text="Les demandes de prière des visiteurs apparaîtront ici." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {liste.map((p, i) => (
            <motion.article key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }}
              className="flex flex-col rounded-3xl bg-fond p-5 shadow-doux ring-1 ring-ligne">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg">{p.subject}</h3>
                  <p className="text-mini text-ink/55">{p.auteur} · {depuis(p.created_at)}{p.handled_by ? ` · suivie par ${p.handled_by}` : ''}</p>
                </div>
                <Badge tone={STATUTS[p.status].tone}>{STATUTS[p.status].label}</Badge>
              </div>
              <p className="mt-3 flex-1 whitespace-pre-line text-[14.5px] text-ink/75">{p.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(STATUTS) as Priere['status'][]).filter((s) => s !== p.status).map((s) => (
                  <button key={s} onClick={() => changer(p, s)} className="rounded-xl bg-surface px-3 py-2 text-[13px] font-semibold hover:bg-ligne/60">
                    Marquer « {STATUTS[s].label} »
                  </button>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
