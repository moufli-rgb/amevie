import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeOff, ExternalLink, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Role } from '@/lib/session';
import { TYPES, auteur, type Contenu, type TypeContenu } from '@/lib/contenus';
import { formatDateCourte } from '@/lib/format';
import { normalize } from '@/lib/normalize';
import { hrefOf } from '@/lib/router';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState, Skeleton } from '@/components/ui/Empty';
import { GratuitBadge, PremiumBadge } from '@/components/Premium';
import { LoadError, SearchInput, Tabs } from './Widgets';
import { useData } from './useData';

type FType = 'tous' | TypeContenu;
type FStatut = 'tous' | 'publie' | 'brouillon';

/**
 * Gestion des publications : pasteur (les siennes) ou administrateur (toutes).
 * Classement par type, statut et accès + recherche.
 */
export function ContentsManager({ role, onEdit, onNew }: {
  role: Role; onEdit: (id: string) => void; onNew?: () => void;
}) {
  const scope = role === 'admin' ? 'admin' : 'mine';
  const { data, setData, error, loading, reload } = useData<{ contents: Contenu[] }>(`contents?scope=${scope}`, role);
  const [type, setType] = useState<FType>('tous');
  const [statut, setStatut] = useState<FStatut>('tous');
  const [q, setQ] = useState('');
  const [suppr, setSuppr] = useState<Contenu | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<AlertMsg | null>(null);

  const items = data?.contents ?? [];
  const liste = useMemo(() => {
    const nq = normalize(q);
    return items.filter((c) => (type === 'tous' || c.type === type)
      && (statut === 'tous' || (statut === 'publie') === c.is_published)
      && (!nq || normalize(`${c.title} ${c.bible_ref ?? ''} ${c.category ?? ''} ${auteur(c)}`).includes(nq)));
  }, [items, type, statut, q]);

  async function supprimer() {
    if (!suppr) return;
    setBusy(true);
    try {
      await api(`contents?id=${suppr.id}`, { method: 'DELETE', role });
      setData({ contents: items.filter((c) => c.id !== suppr.id) });
      setFlash({ kind: 'success', text: 'Publication supprimée.' });
    } catch (e) { setFlash({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
    finally { setBusy(false); setSuppr(null); }
  }

  async function basculer(c: Contenu) {
    try {
      const r = await api<{ content: Contenu }>(`contents?id=${c.id}`, { method: 'PATCH', role, body: { is_published: !c.is_published } });
      setData({ contents: items.map((x) => (x.id === c.id ? { ...x, ...r.content } : x)) });
      setFlash({ kind: 'success', text: r.content.is_published ? 'Publication en ligne.' : 'Publication retirée du site.' });
    } catch (e) { setFlash({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
  }

  const count = (t: FType) => items.filter((c) => t === 'tous' || c.type === t).length;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs id={`ct-${role}`} value={type} onChange={setType} options={[
            { value: 'tous', label: 'Tout', badge: count('tous') || undefined },
            ...(Object.keys(TYPES) as TypeContenu[]).map((t) => ({ value: t as FType, label: TYPES[t].pluriel, badge: count(t) || undefined })),
          ]} />
          {onNew && <Button icon={<Plus className="h-4 w-4" />} onClick={onNew} shine>Nouvelle publication</Button>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs id={`cs-${role}`} value={statut} onChange={setStatut} options={[{ value: 'tous', label: 'Tous' }, { value: 'publie', label: 'Publiés' }, { value: 'brouillon', label: 'Non publiés' }]} />
          <SearchInput value={q} onChange={setQ} placeholder={role === 'admin' ? 'Titre, pasteur…' : 'Rechercher…'} />
        </div>
      </div>
      <div className="mb-4"><Alert msg={flash} /></div>

      {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : liste.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title={items.length ? 'Aucun résultat' : 'Aucune publication'}
          text={items.length ? 'Modifiez les filtres.' : 'Publiez votre première Parole de Dieu, un enseignement ou un document.'}
          action={!items.length && onNew ? <Button icon={<Plus className="h-4 w-4" />} onClick={onNew}>Nouvelle publication</Button> : undefined} />
      ) : (
        <motion.ul layout className="space-y-3">
          <AnimatePresence initial={false}>
            {liste.map((c, i) => {
              const T = TYPES[c.type];
              return (
                <motion.li key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.03 } }} exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4 rounded-3xl bg-fond p-4 shadow-doux ring-1 ring-ligne sm:flex-row sm:items-center sm:p-5">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><T.icon className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[15px] font-bold">{c.title}</p>
                        {c.access === 'premium' ? <PremiumBadge small /> : <GratuitBadge small />}
                        <Badge tone={c.is_published ? 'actif' : 'neutre'}>{c.is_published ? 'Publié' : 'Non publié'}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-ink/55">
                        {c.category ?? T.label}{c.bible_ref ? ` · ${c.bible_ref}` : ''}{role === 'admin' ? ` · ${auteur(c)}` : ''} · {formatDateCourte(c.created_at)} · {c.views} vue{c.views > 1 ? 's' : ''}{c.has_file ? ' · 📎' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:justify-end">
                    <a href={hrefOf('contenu', c.id)} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-ink/70 hover:bg-surface"><ExternalLink className="h-3.5 w-3.5" />Voir</a>
                    <Button size="sm" variant="secondary" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => onEdit(c.id)}>Modifier</Button>
                    <Button size="sm" variant="ghost" icon={c.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} onClick={() => basculer(c)}>
                      {c.is_published ? 'Retirer' : 'Publier'}
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setSuppr(c)}>Supprimer</Button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
      <ConfirmDialog open={!!suppr} onClose={() => setSuppr(null)} onConfirm={supprimer} loading={busy} danger title="Supprimer cette publication ?" confirmLabel="Supprimer"
        message={<>« {suppr?.title} » et son fichier éventuel seront supprimés définitivement.</>} />
    </div>
  );
}
