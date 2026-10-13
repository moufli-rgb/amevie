import { useState, type CSSProperties } from 'react';

/**
 * Images du site (public/images/site), en WebP 640 / 1376 px.
 * Pour remplacer une image : remplacez les deux fichiers WebP du même nom.
 */
export const IMAGES = {
  hero_prayer_light: 'Mains jointes en prière à la lumière des bougies',
  daily_prayer_verse: 'Une Bible ouverte sur une table, au soleil du matin',
  community_fellowship: 'Des amis réunis dans la joie, Bible à la main',
  spiritual_bible_study: 'Bible, carnet de notes et bougie pour un temps d’étude',
} as const;
export type ImgName = keyof typeof IMAGES;

export function Img({ name, className = '', imgClassName = '', sizes = '100vw', priority, decorative, style }: {
  name: ImgName; className?: string; imgClassName?: string; sizes?: string; priority?: boolean; decorative?: boolean; style?: CSSProperties;
}) {
  const [ok, setOk] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: 'linear-gradient(135deg, color-mix(in oklab, var(--couleur-principale) 70%, black), var(--couleur-accent))', ...style }}>
      <img
        src={`/images/site/${name}-1376.webp`}
        srcSet={`/images/site/${name}-640.webp 640w, /images/site/${name}-1376.webp 1376w`}
        sizes={sizes}
        alt={decorative ? '' : IMAGES[name]}
        aria-hidden={decorative || undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setOk(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ok ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        draggable={false}
      />
    </div>
  );
}
