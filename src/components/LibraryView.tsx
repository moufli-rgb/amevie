import { useMemo, useState } from 'react';
import { BookMarked } from 'lucide-react';
import { ContentCard } from './ContentCard';
import { EmptyState, Skeleton } from './ui/Empty';
import { LoadError, SearchInput, Tabs } from '@/dashboard/Widgets';
import { useData } from '@/dashboard/useData';
import { RELIGIONS, TYPES, type Contenu, type Religion, type Theme, type TypeContenu } from '@/lib/contenus';
import { normalize } from '@/lib/normalize';
import { useVisitor } from '@/lib/visitor';

type FiltreType = 'tous' | TypeContenu;
type FiltreAcces = 'tous' | 'gratuit' | 'formules' | 'payant';
type FiltreReligion = 'toutes' | Religion;

/** Bibliothèque filtrable (pages publiques et espace visiteur). */
export function LibraryView({ initialType = 'tous', initialReligion = 'toutes', pasteurId, filtre, themes, fixerReligion = false, vide }: {
  initialType?: FiltreType; initialReligion?: FiltreReligion; pasteurId?: string;
  /** Filtre supplémentaire (ex. audios et vidéos, mes achats) */
  filtre?: (c: Contenu) => boolean;
  /** Rubriques d'une communauté (Prières, Bible…) */
  themes?: Theme[];
  /** Masque le choix de la religion (déjà choisie) */
  fixerReligion?: boolean;
  vide?: string;
}) {
  const { user } = useVisitor();
  const path = `contents?u=${user?.id ?? ''}${pasteurId ? `&pastor=${pasteurId}` : ''}`;
  const { data, error, loading, reload } = useData<{ contents: Contenu[] }>(path, 'visiteur');
  const [type, setType] = useState<FiltreType>(initialType);
  const [acces, setAcces] = useState<FiltreAcces>('tous');
  const [religion, setReligion] = useState<FiltreReligion>(initialReligion);
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<string>('tous');

  const liste = useMemo(() => {
    const nq = normalize(q);
    const th = themes?.find((t) => t.id === theme);
    return (data?.contents ?? []).filter((c) =>
      (!filtre || filtre(c)) && (!th || th.test(c)) &&
      (type === 'tous' || c.type === type) && (acces === 'tous' || (acces === 'formules' ? ['essentiel', 'premium', 'premium_plus'].includes(c.access) : c.access === acces)) &&
      (religion === 'toutes' || (c.religion ?? 'chretien') === religion) &&
      (!nq || normalize(`${c.title} ${c.description ?? ''} ${c.bible_ref ?? ''} ${c.category ?? ''} ${c.pastors?.prenom ?? ''} ${c.pastors?.nom ?? ''}`).includes(nq)));
  }, [data, type, acces, religion, q, filtre, themes, theme]);

  const dansReligion = (c: Contenu) => religion === 'toutes' || (c.religion ?? 'chretien') === religion;
  const compte = (t: FiltreType) => (data?.contents ?? []).filter((c) => dansReligion(c) && (t === 'tous' || c.type === t)).length;
  const compteR = (r: Religion) => (data?.contents ?? []).filter((c) => (c.religion ?? 'chretien') === r).length;

  return (
    <div>
      <div className="flex flex-col gap-3">
        {themes && (
          <div role="group" aria-label="Rubriques" className="flex flex-wrap gap-2">
            {[{ id: 'tous', label: 'Tout' }, ...themes].map((t) => (
              <button key={t.id} type="button" onClick={() => setTheme(t.id)} aria-pressed={theme === t.id}
                className={`h-10 rounded-full px-4 text-[13.5px] font-semibold ring-1 transition active:scale-[0.97] ${theme === t.id ? 'bg-ink text-fond ring-transparent' : 'bg-fond text-ink/75 ring-ligne hover:ring-ink/30'}`}>{t.label}</button>
            ))}
          </div>
        )}
        {!fixerReligion && <div role="group" aria-label="Religion" className="flex flex-wrap gap-2">
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
        </div>}
        <Tabs id="lib-type" value={type} onChange={setType} options={[
          { value: 'tous', label: 'Tout', badge: undefined },
          ...(Object.keys(TYPES) as TypeContenu[]).map((t) => ({ value: t, label: TYPES[t].pluriel, badge: compte(t) || undefined })),
        ]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs id="lib-acces" value={acces} onChange={setAcces} options={[
            { value: 'tous', label: 'Tous les accès' }, { value: 'gratuit', label: 'Gratuits' }, { value: 'formules', label: 'Dans les formules' }, { value: 'payant', label: 'À l’unité' },
          ]} />
          <SearchInput value={q} onChange={setQ} placeholder="Titre, verset, guide…" />
        </div>
      </div>
      <div className="mt-8">
        {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-56" />)}</div>
        ) : liste.length === 0 ? (
          <EmptyState icon={<BookMarked className="h-6 w-6" />} title="Aucun contenu" text={q ? 'Essayez une autre recherche.' : vide ?? 'Aucun contenu ne correspond à ces filtres pour le moment.'} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 paysage:grid-cols-2">
            {liste.map((c, i) => <ContentCard key={c.id} c={c} i={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
