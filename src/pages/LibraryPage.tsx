import { useEffect } from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { LibraryView } from '@/components/LibraryView';
import { Reveal } from '@/components/ui/Reveal';
import { TYPES, type TypeContenu } from '@/lib/contenus';

export function LibraryPage({ page, id }: { page: string; id: string }) {
  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);
  const type = (page in TYPES ? page : 'tous') as TypeContenu | 'tous';
  const pasteurId = page === 'pasteur' && id ? id : undefined;
  return (
    <>
      <PublicHeader actif={type === 'parole' ? '/#bibliotheque/parole' : '/#bibliotheque'} />
      <main className="gutter mx-auto min-h-[70svh] max-w-7xl pb-24 pt-28 sm:pt-32">
        <Reveal>
          <p className="surtitre text-accent">Bibliothèque</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.4rem)]">{type === 'tous' ? 'Paroles, enseignements & documents' : TYPES[type].pluriel}</h1>
          <p className="mt-3 max-w-2xl text-[15px] text-ink/65">Les contenus <strong>Gratuits</strong> sont ouverts à tous. Les contenus marqués <strong>Premium</strong> 🔒 sont réservés aux abonnés.</p>
        </Reveal>
        <div className="mt-10"><LibraryView key={`${type}-${pasteurId}`} initialType={type} pasteurId={pasteurId} /></div>
      </main>
      <PublicFooter />
    </>
  );
}
