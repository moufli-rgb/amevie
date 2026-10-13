import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Download, Eye, FileText, Lock, PlayCircle } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { GratuitBadge, Paywall, PremiumBadge } from '@/components/Premium';
import { Button } from '@/components/ui/Button';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Empty';
import { LoadError } from '@/dashboard/Widgets';
import { useData } from '@/dashboard/useData';
import { api, ApiError } from '@/lib/api';
import { TYPES, auteur, tailleFichier, videoEmbed, type Contenu } from '@/lib/contenus';
import { formatDate } from '@/lib/format';
import { go, hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';

export function ContentPage({ id }: { id: string }) {
  const { user } = useVisitor();
  const { data, error, loading, reload, setData } = useData<{ content: Contenu }>(id ? `contents?id=${id}&u=${user?.id ?? ''}` : null, 'visiteur');
  const [msg, setMsg] = useState<AlertMsg | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  const c = data?.content;

  async function telecharger() {
    if (!c) return;
    setBusy(true); setMsg(null);
    try {
      const { url } = await api<{ url: string }>(`files?id=${c.id}`, { role: 'visiteur' });
      window.location.href = url;
    } catch (e) {
      if (e instanceof ApiError && e.code === 'CONNEXION_REQUISE') go('connexion');
      else setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' });
    } finally { setBusy(false); }
  }

  async function basculerFavori() {
    if (!c || !user) return go('connexion');
    if (!user.premium) return setMsg({ kind: 'pending', text: 'Les favoris sont une fonctionnalité Premium. Faites votre abonnement pour enregistrer vos contenus préférés.' });
    try {
      if (c.favorite) await api(`favorites?id=${c.id}`, { method: 'DELETE', role: 'visiteur' });
      else await api('favorites', { method: 'POST', role: 'visiteur', body: { content_id: c.id } });
      setData({ content: { ...c, favorite: !c.favorite } });
    } catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur.' }); }
  }

  const T = c ? TYPES[c.type] : null;
  const embed = videoEmbed(c?.video_url);

  return (
    <>
      <PublicHeader actif="/#bibliotheque" />
      <main className="gutter mx-auto min-h-[70svh] max-w-3xl pb-24 pt-28 sm:pt-32">
        <a href={hrefOf('bibliotheque')} className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink/60 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Bibliothèque</a>
        {error ? <LoadError message={error} onRetry={reload} /> : loading && !c ? (
          <div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-64" /></div>
        ) : c && T ? (
          <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-bold text-primary"><T.icon className="h-3.5 w-3.5" />{c.category ?? T.label}</span>
              {c.access === 'premium' ? <PremiumBadge verrouille={c.locked} /> : <GratuitBadge />}
            </div>
            <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)]">{c.title}</h1>
            {c.bible_ref && <p className="mt-2 font-serif text-xl italic text-accent">{c.bible_ref}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink/55">
              <span className="font-semibold text-ink/75">{auteur(c)}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(c.created_at)}</span>
              <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{c.views} lecture{c.views > 1 ? 's' : ''}</span>
              {user && (
                <button onClick={basculerFavori} className="inline-flex items-center gap-1 font-semibold text-primary">
                  {c.favorite ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {c.favorite ? 'Dans mes favoris' : 'Ajouter aux favoris'}
                  {!user.premium && <Lock className="h-3 w-3 text-accent" />}
                </button>
              )}
            </div>
            {c.description && <p className="mt-6 text-[17px] leading-relaxed text-ink/80">{c.description}</p>}
            <div className="mt-4"><Alert msg={msg} /></div>

            {c.locked ? (
              <div className="mt-8">
                {c.has_file && <p className="mb-4 flex items-center gap-2 text-[14px] text-ink/60"><FileText className="h-4 w-4" />Document joint : {c.file_name} {tailleFichier(c.file_size)}</p>}
                <Paywall />
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                {embed && (
                  <div className="aspect-video overflow-hidden rounded-3xl bg-black shadow-doux">
                    <iframe src={embed} title={c.title} className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
                  </div>
                )}
                {c.video_url && !embed && (
                  <a href={c.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-primary"><PlayCircle className="h-5 w-5" /> Voir la vidéo</a>
                )}
                {c.content && (
                  <div className={`whitespace-pre-line text-[17px] leading-[1.85] text-ink/85 ${c.type === 'parole' ? 'rounded-3xl bg-surface p-7 font-serif text-xl italic' : ''}`}>{c.content}</div>
                )}
                {c.has_file && (
                  <div className="flex flex-col gap-4 rounded-3xl bg-fond p-5 shadow-doux ring-1 ring-ligne sm:flex-row sm:items-center">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><FileText className="h-6 w-6" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{c.file_name}</p>
                      <p className="text-mini text-ink/55">{tailleFichier(c.file_size)}</p>
                    </div>
                    <Button icon={<Download className="h-4 w-4" />} loading={busy} onClick={telecharger}>Télécharger</Button>
                  </div>
                )}
              </div>
            )}
          </motion.article>
        ) : null}
      </main>
      <PublicFooter />
    </>
  );
}
