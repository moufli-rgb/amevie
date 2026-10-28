import { useMemo, useState } from 'react';
import { BookMarked } from 'lucide-react';
import { ContentCard } from './ContentCard';
import { EmptyState, Skeleton } from './ui/Empty';
import { LoadError, SearchInput, Tabs } from '@/dashboard/Widgets';
import { useData } from '@/dashboard/useData';
import { RELIGIONS, TYPES, type Contenu, type Religion, type TypeContenu } from '@/lib/contenus';
import { normalize } from '@/lib/normalize';
import { useVisitor } from '@/lib/visitor';

type FiltreType = 'tous' | TypeContenu;
type FiltreAcces = 'tous' | 'gratuit' | 'premium';
type FiltreReligion = 'toutes' | Religion;

/** Bibliothèque filtrable (pages publiques et espace visiteur). */
export function LibraryView({ initialType = 'tous', initialReligion = 'toutes', pasteurId }: { initialType?: FiltreType; initialReligion?: FiltreReligion; pasteurId?: string }) {
  const { user } = useVisitor();
  const path = `contents?u=${user?.id ?? ''}${pasteurId ? `&pastor=${pasteurId}` : ''}`;
  const { data, error, loading, reload } = useData<{ contents: Contenu[] }>(path, 'visiteur');
  const [type, setType] = useState<FiltreType>(initialType);
  const [acces, setAcces] = useState<FiltreAcces>('tous');
  const [religion, setReligion] = useState<FiltreReligion>(initialReligion);
  const [q, setQ] = useState('');

  const liste = useMemo(() => {
    const nq = normalize(q);
    return (data?.contents ?? []).filter((c) =>
      (type === 'tous' || c.type === type) && (acces === 'tous' || c.access === acces) &&
      (religion === 'toutes' || (c.religion ?? 'chretien') === religion) &&
      (!nq || normalize(`${c.title} ${c.description ?? ''} ${c.bible_ref ?? ''} ${c.category ?? ''} ${c.pastors?.prenom ?? ''} ${c.pastors?.nom ?? ''}`).includes(nq)));
  }, [data, type, acces, religion, q]);

  const dansReligion = (c: Contenu) => religion === 'toutes' || (c.religion ?? 'chretien') === religion;
  const compte = (t: FiltreType) => (data?.contents ?? []).filter((c) => dansReligion(c) && (t === 'tous' || c.type === t)).length;
  const compteR = (r: Religion) => (data?.contents ?? []).filter((c) => (c.religion ?? 'chretien') === r).length;

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Religion" className="flex flex-wrap gap-2">
          {(['toutes', ...(Object.keys(RELIGIONS) as Religion[])] as FiltreReligion[]).map((r) => {
            const actif = religion === r;
            const R = r === 'toutes' ? null : RELIGIONS[r];
            return (
              <button key={r} type="button" onClick={() => setReligion(r)} aria-pressed={actif}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold ring-1 transition active:scale-[0.97] ${actif ? `${R ? R.bg : 'bg-ink'} text-white ring-transparent shadow-doux` : `bg-fond text-ink/75 ring-ligne hover:ring-ink/30`}`}>
                {R && <span aria-hidden className={actif ? 'text-white' : R.text}>{R.symbole}</span>}
                {R ? R.label : 'Toutes les traditions'}
                {R && <span className={`rounded-full px-1.5 text-mini ${actif ? 'bg-white/25' : 'bg-surface'}`}>{compteR(r as Religion)}</span>}
              </button>
            );
          })}
        </div>
        <Tabs id="lib-type" value={type} onChange={setType} options={[
          { value: 'tous', label: 'Tout', badge: undefined },
          ...(Object.keys(TYPES) as TypeContenu[]).map((t) => ({ value: t, label: TYPES[t].pluriel, badge: compte(t) || undefined })),
        ]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs id="lib-acces" value={acces} onChange={setAcces} options={[
            { value: 'tous', label: 'Tous les accès' }, { value: 'gratuit', label: 'Gratuits' }, { value: 'premium', label: 'Premium' },
          ]} />
          <SearchInput value={q} onChange={setQ} placeholder="Titre, verset, guide…" />
        </div>
      </div>
      <div className="mt-8">
        {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-56" />)}</div>
        ) : liste.length === 0 ? (
          <EmptyState icon={<BookMarked className="h-6 w-6" />} title="Aucun contenu" text={q ? 'Essayez une autre recherche.' : 'Aucun contenu ne correspond à ces filtres pour le moment.'} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 paysage:grid-cols-2">
            {liste.map((c, i) => <ContentCard key={c.id} c={c} i={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
