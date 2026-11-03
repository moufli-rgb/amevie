/**
 * Pages de l'espace membre : Bibliothèque spirituelle (par communauté), documents, programmes,
 * audios et vidéos, carnet personnel, mes achats.
 */
import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, NotebookPen, Pencil, Plus, Save, ShoppingBag, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { go, hrefOf } from '@/lib/router';
import { formatDate } from '@/lib/format';
import { RELIGIONS, THEMES, estReligion, type Contenu, type Religion } from '@/lib/contenus';
import { Img, type ImgName } from '@/components/Img';
import { LibraryView } from '@/components/LibraryView';
import { Field, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { EmptyState, Skeleton } from '@/components/ui/Empty';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/dashboard/Shell';
import { Card, LoadError } from '@/dashboard/Widgets';
import { useData } from '@/dashboard/useData';

/* ------------------------------------------------------------------ Les trois espaces */
const ESPACES: { r: Religion; titre: string; image: ImgName; rubriques: string }[] = [
  { r: 'chretien', titre: 'Espace chrétien', image: 'af_eglise_femmes', rubriques: 'Prières · Bible · Méditations · Programmes' },
  { r: 'musulman', titre: 'Espace musulman', image: 'af_hijab_groupe', rubriques: 'Douas · Coran · Rappels · Programmes' },
  { r: 'universel', titre: 'Espace universel', image: 'af_meditation', rubriques: 'Développement personnel · Gratitude · Motivation · Paix intérieure' },
];

export function EspacesCommunautes({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-4 ${compact ? 'sm:grid-cols-3' : 'md:grid-cols-3'}`}>
      {ESPACES.map((e, i) => {
        const R = RELIGIONS[e.r];
        return (
          <motion.a key={e.r} href={hrefOf('espace', 'spirituelle', e.r)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}
            className="group flex flex-col overflow-hidden rounded-3xl bg-fond shadow-doux ring-1 ring-ligne">
            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0"><Img name={e.image} className="h-full w-full transition-transform duration-700 group-hover:scale-105" sizes="(min-width:768px) 33vw, 100vw" decorative /></div>
              <div className={`absolute inset-0 ${R.bg} opacity-30 mix-blend-multiply`} />
              <span className={`absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-xl ${R.bg} text-lg text-white shadow-doux`}>{R.symbole}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-xl">{e.titre}</h3>
              <p className="mt-1 text-[13.5px] text-ink/60">{e.rubriques}</p>
              <span className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-[14px] font-semibold ${R.text}`}>Entrer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </motion.a>
        );
      })}
    </div>
  );
}

/** Bibliothèque spirituelle : 1. choisir sa communauté, 2. parcourir ses rubriques. */
export function BibliothequeSpirituelle({ religion }: { religion: string }) {
  if (!estReligion(religion)) {
    return (
      <div className="space-y-6">
        <PageHeader titre="Bibliothèque spirituelle" texte="1. Choisissez votre communauté. Vous pourrez en changer à tout moment." />
        <EspacesCommunautes />
      </div>
    );
  }
  const R = RELIGIONS[religion];
  const e = ESPACES.find((x) => x.r === religion)!;
  return (
    <div className="space-y-6">
      <button onClick={() => go('espace', 'spirituelle')} className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink/60 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Changer de communauté</button>
      <div className="relative overflow-hidden rounded-[28px] text-white shadow-haut">
        <div className="absolute inset-0"><Img name={e.image} className="h-full w-full" sizes="100vw" decorative /></div>
        <div className={`absolute inset-0 ${R.bg} opacity-55 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10" />
        <div className="relative p-7 sm:p-9">
          <p className="surtitre text-white/75">Bibliothèque spirituelle</p>
          <h1 className="mt-2 flex items-center gap-3 text-[clamp(1.8rem,4vw,2.6rem)] text-white"><span aria-hidden>{R.symbole}</span>{e.titre}</h1>
          <p className="mt-2 max-w-xl text-[15px] text-white/85">{e.rubriques}</p>
        </div>
      </div>
      <LibraryView key={religion} initialReligion={religion} fixerReligion themes={THEMES[religion]} />
    </div>
  );
}

/* ------------------------------------------------------------------ Rubriques simples */
export function DocumentsPage() {
  return <div><PageHeader titre="Bibliothèque de documents" texte="Livres, livrets et PDF. Ceux compris dans votre formule s’ouvrent directement ; les autres s’achètent à l’unité." /><LibraryView initialType="document" /></div>;
}
export function ProgrammesPage() {
  return (
    <div>
      <PageHeader titre="Programmes spirituels" texte="Parcours de 7, 14, 30 ou 40 jours et packs de prières. Un programme à part : chacun l’achète une fois et le garde pour toujours." />
      <LibraryView initialType="programme" vide="Aucun programme pour le moment : revenez bientôt." />
    </div>
  );
}
const estMedia = (c: Contenu) => !!c.has_video || !!c.video_url || /^(audio|video)\//.test(c.file_type ?? '');
export function AudiosVideosPage() {
  return <div><PageHeader titre="Audios et vidéos" texte="Enseignements, louanges et méditations à écouter ou à regarder." /><LibraryView filtre={estMedia} vide="Aucun audio ni vidéo pour le moment." /></div>;
}
export function MesAchatsPage() {
  return (
    <div>
      <PageHeader titre="Mes achats" texte="Les livres, programmes et packs que vous avez achetés : ils sont à vous pour toujours." />
      <LibraryView filtre={(c) => c.access === 'payant' && !c.locked} vide="Vous n’avez encore rien acheté. Découvrez les programmes et les livres." />
      <a href={hrefOf('espace', 'programmes')} className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-primary"><ShoppingBag className="h-4 w-4" /> Voir les programmes et packs</a>
    </div>
  );
}

/* ------------------------------------------------------------------ Carnet personnel */
interface Note { id: string; titre: string; texte: string; humeur: string | null; created_at: string; updated_at: string }
const HUMEURS: { id: string; label: string; emoji: string }[] = [
  { id: 'paix', label: 'Paix', emoji: '🕊️' }, { id: 'joie', label: 'Joie', emoji: '😊' }, { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
  { id: 'espoir', label: 'Espoir', emoji: '🌱' }, { id: 'fatigue', label: 'Fatigue', emoji: '😮‍💨' }, { id: 'tristesse', label: 'Tristesse', emoji: '😢' }, { id: 'inquietude', label: 'Inquiétude', emoji: '😟' },
];

export function CarnetPage() {
  const { data, setData, error, loading, reload } = useData<{ notes: Note[] }>('profile?scope=notes', 'visiteur');
  const [edition, setEdition] = useState<Note | 'nouvelle' | null>(null);
  const [f, setF] = useState({ titre: '', texte: '', humeur: '' });
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [busy, setBusy] = useState(false);
  const [suppr, setSuppr] = useState<Note | null>(null);
  const notes = data?.notes ?? [];

  const ouvrir = (n: Note | 'nouvelle') => {
    setEdition(n); setMsg(null);
    setF(n === 'nouvelle' ? { titre: `Notes du ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`, texte: '', humeur: '' } : { titre: n.titre, texte: n.texte, humeur: n.humeur ?? '' });
  };
  async function enregistrer(e: FormEvent) {
    e.preventDefault();
    if (!f.titre.trim()) return setMsg({ kind: 'error', text: 'Donnez un titre à votre note.' });
    setBusy(true); setMsg(null);
    try {
      const body = { titre: f.titre, texte: f.texte, humeur: f.humeur || null };
      if (edition === 'nouvelle') {
        const r = await api<{ note: Note }>('profile?scope=notes', { method: 'POST', role: 'visiteur', body });
        setData({ notes: [r.note, ...notes] });
      } else if (edition) {
        const r = await api<{ note: Note }>(`profile?scope=notes&id=${edition.id}`, { method: 'PATCH', role: 'visiteur', body });
        setData({ notes: notes.map((n) => (n.id === r.note.id ? r.note : n)) });
      }
      setEdition(null);
    } catch (err) { setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Erreur.' }); }
    finally { setBusy(false); }
  }
  async function supprimer() {
    if (!suppr) return;
    await api(`profile?scope=notes&id=${suppr.id}`, { method: 'DELETE', role: 'visiteur' });
    setData({ notes: notes.filter((n) => n.id !== suppr.id) }); setSuppr(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader titre="Mon carnet personnel" texte="Vos pensées, prières et ce que vous retenez de vos lectures. Visible par vous seul."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => ouvrir('nouvelle')}>Nouvelle note</Button>} />
      <AnimatePresence>
        {edition && (
          <motion.form key="edition" onSubmit={enregistrer} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-4 rounded-3xl bg-fond p-5 shadow-haut ring-1 ring-primary/30 sm:p-6">
            <div className="flex items-center justify-between"><p className="font-semibold">{edition === 'nouvelle' ? 'Nouvelle note' : 'Modifier la note'}</p>
              <button type="button" onClick={() => setEdition(null)} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface"><X className="h-4 w-4" /></button></div>
            <Field label="Titre" value={f.titre} onChange={(e) => setF((s) => ({ ...s, titre: e.target.value }))} maxLength={160} />
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">Comment je me sens</span>
              <div className="flex flex-wrap gap-2">
                {HUMEURS.map((h) => (
                  <button key={h.id} type="button" onClick={() => setF((s) => ({ ...s, humeur: s.humeur === h.id ? '' : h.id }))} aria-pressed={f.humeur === h.id}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ring-1 transition ${f.humeur === h.id ? 'bg-primary text-on-primary ring-transparent' : 'bg-surface ring-ligne'}`}><span aria-hidden>{h.emoji}</span>{h.label}</button>
                ))}
              </div>
            </div>
            <TextArea label="Ma note" rows={8} value={f.texte} onChange={(e) => setF((s) => ({ ...s, texte: e.target.value }))} maxLength={20000}
              placeholder="Ce que j’ai lu, ce que je ressens, ma prière du jour…" />
            <Alert msg={msg} />
            <Button type="submit" loading={busy} icon={<Save className="h-4 w-4" />}>Enregistrer</Button>
          </motion.form>
        )}
      </AnimatePresence>
      {error ? <LoadError message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-48" /> : !notes.length ? (
        <EmptyState icon={<NotebookPen className="h-6 w-6" />} title="Votre carnet est vide" text="Écrivez votre première note : une prière, une pensée, un verset qui vous a touché." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((n, i) => {
            const h = HUMEURS.find((x) => x.id === n.humeur);
            return (
              <motion.article key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }}
                className="flex flex-col rounded-3xl bg-fond p-5 shadow-doux ring-1 ring-ligne">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[1.1rem] leading-snug">{n.titre}</h3>
                  {h && <span title={h.label} className="text-xl" aria-label={h.label}>{h.emoji}</span>}
                </div>
                <p className="mt-1 text-mini text-ink/50">{formatDate(n.created_at)}</p>
                <p className="mt-3 line-clamp-5 whitespace-pre-line text-[14px] text-ink/75">{n.texte || '—'}</p>
                <div className="mt-auto flex gap-2 pt-4">
                  <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => ouvrir(n)}>Modifier</Button>
                  <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setSuppr(n)}>Supprimer</Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
      <Card><p className="text-[13.5px] text-ink/60">🔒 Votre carnet est privé : ni les guides spirituels ni l’administration ne peuvent le lire.</p></Card>
      <ConfirmDialog open={!!suppr} onClose={() => setSuppr(null)} onConfirm={supprimer} danger title="Supprimer cette note ?" confirmLabel="Supprimer" message="Elle sera effacée définitivement." />
    </div>
  );
}
