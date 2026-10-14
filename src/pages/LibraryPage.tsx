import { useEffect } from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { LibraryView } from '@/components/LibraryView';
import { PageBanner } from '@/components/public/PageBanner';
import type { ImgName } from '@/components/Img';
import { TYPES, TYPE_COULEURS, type TypeContenu } from '@/lib/contenus';

const BANNIERES: Record<TypeContenu | 'tous', ImgName> = {
  tous: 'bible_mains', parole: 'croix_aube', enseignement: 'bible_cafe', document: 'bible_nature', contenu: 'priere_femme',
};

export function LibraryPage({ page, id }: { page: string; id: string }) {
  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);
  const type = (page in TYPES ? page : 'tous') as TypeContenu | 'tous';
  const pasteurId = page === 'pasteur' && id ? id : undefined;
  return (
    <>
      <PublicHeader actif={type === 'parole' ? '/#bibliotheque/parole' : type === 'document' ? '/#bibliotheque/document' : '/#bibliotheque'} transparent />
      <PageBanner image={BANNIERES[type]} surtitre="Bibliothèque" teinte={type === 'tous' ? 'bg-primary' : TYPE_COULEURS[type].bg}
        titre={type === 'tous' ? 'Paroles, enseignements & documents' : TYPES[type].pluriel}
        texte={<>Les contenus <strong>Gratuits</strong> sont ouverts à tous. Les contenus marqués <strong>Premium</strong> 🔒 sont réservés aux abonnés.</>} />
      <main className="gutter mx-auto min-h-[50svh] max-w-7xl pb-24 pt-10">
        <div><LibraryView key={`${type}-${pasteurId}`} initialType={type} pasteurId={pasteurId} /></div>
      </main>
      <PublicFooter />
    </>
  );
}
