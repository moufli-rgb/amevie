import { useEffect } from 'react';
import { ArrowRight, Church, Users } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Reveal } from '@/components/ui/Reveal';
import { EmptyState, Skeleton } from '@/components/ui/Empty';
import { useData } from '@/dashboard/useData';
import { hrefOf } from '@/lib/router';

interface P { id: string; prenom: string; nom: string; eglise: string | null; bio: string | null; publications: number }

/** Page publique « Pasteurs ». */
export function PastorsPage() {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  const { data, loading } = useData<{ pastors: P[] }>('pastors?scope=public', 'visiteur');
  const liste = data?.pastors ?? [];
  return (
    <>
      <PublicHeader actif="/#pasteurs" />
      <main className="gutter mx-auto min-h-[70svh] max-w-6xl pb-24 pt-28 sm:pt-32">
        <Reveal>
          <p className="surtitre text-accent">Pasteurs</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.4rem)]">Ceux qui partagent la Parole</h1>
          <p className="mt-3 max-w-2xl text-[15px] text-ink/65">Chaque pasteur est vérifié par l’administration avant de pouvoir publier.</p>
        </Reveal>
        <div className="mt-10">
          {loading && !data ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}</div>
          ) : liste.length === 0 ? (
            <EmptyState icon={<Users className="h-6 w-6" />} title="Bientôt ici" text="Les pasteurs apparaîtront dès la validation de leur compte." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {liste.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 6) * 0.06} className="flex flex-col rounded-3xl bg-fond p-6 shadow-doux ring-1 ring-ligne">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary font-serif text-lg text-on-primary">{p.prenom[0]}{p.nom[0]}</span>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl">Pst {p.prenom} {p.nom}</h2>
                      {p.eglise && <p className="flex items-center gap-1.5 truncate text-[13px] text-ink/55"><Church className="h-3.5 w-3.5" />{p.eglise}</p>}
                    </div>
                  </div>
                  {p.bio && <p className="mt-4 line-clamp-4 text-[14.5px] text-ink/70">{p.bio}</p>}
                  <a href={hrefOf('bibliotheque', 'pasteur', p.id)} className="mt-auto inline-flex items-center gap-2 pt-5 text-[14px] font-semibold text-primary hover:underline">
                    {p.publications} publication{p.publications > 1 ? 's' : ''} <ArrowRight className="h-4 w-4" />
                  </a>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
