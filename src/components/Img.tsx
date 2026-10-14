import { useState, type CSSProperties } from 'react';
import imagesData from '@/config/images.json';

/**
 * Images du site, en WebP 640 / 1376 px (public/images/site).
 * Liste centralisée : src/config/images.json.
 *  1. copie locale (téléchargée avant le build) ;
 *  2. sinon lien Unsplash direct ;
 *  3. sinon dégradé aux couleurs du thème.
 */
type Entree = { alt: string; unsplash?: string };
const DATA = imagesData.images as Record<string, Entree>;
export type ImgName = keyof typeof imagesData.images;
export const IMAGES = Object.fromEntries(Object.entries(DATA).map(([k, v]) => [k, v.alt])) as Record<ImgName, string>;

/** Images d'illustration, utilisées en rotation (cartes, bandeaux). */
export const ROTATION: ImgName[] = [
  'croix_aube', 'bible_mains', 'louange', 'bible_cafe', 'priere_femme', 'chorale',
  'lumiere', 'bible_nature', 'celebration', 'croix_colline', 'enfant_bible', 'coucher_soleil',
];
/** Choisit toujours la même image pour un même texte (ex. identifiant d'un contenu). */
export function imagePour(cle: string, liste: ImgName[] = ROTATION): ImgName {
  let h = 0;
  for (let i = 0; i < cle.length; i++) h = (h * 31 + cle.charCodeAt(i)) >>> 0;
  return liste[h % liste.length];
}

function sources(nom: string, etape: number): { src: string; srcSet: string } | null {
  if (etape === 0) {
    return { src: `/images/site/${nom}-1376.webp`, srcSet: `/images/site/${nom}-640.webp 640w, /images/site/${nom}-1376.webp 1376w` };
  }
  const id = DATA[nom]?.unsplash;
  if (etape === 1 && id) {
    const u = (w: number) => `https://images.unsplash.com/${id}?w=${w}&q=74&fm=webp&fit=crop&auto=format`;
    return { src: u(1376), srcSet: `${u(640)} 640w, ${u(1376)} 1376w` };
  }
  return null;
}

export function Img({ name, className = '', imgClassName = '', sizes = '100vw', priority, decorative, style }: {
  name: ImgName; className?: string; imgClassName?: string; sizes?: string; priority?: boolean; decorative?: boolean; style?: CSSProperties;
}) {
  const [etape, setEtape] = useState(0);
  const [ok, setOk] = useState(false);
  const s = sources(name, etape);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: 'linear-gradient(135deg, color-mix(in oklab, var(--couleur-principale) 70%, black), var(--couleur-accent))', ...style }}>
      {s && (
        <img
          key={etape}
          src={s.src}
          srcSet={s.srcSet}
          sizes={sizes}
          alt={decorative ? '' : IMAGES[name]}
          aria-hidden={decorative || undefined}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setOk(true)}
          onError={() => { setOk(false); setEtape((e) => e + 1); }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ok ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          draggable={false}
        />
      )}
    </div>
  );
}
