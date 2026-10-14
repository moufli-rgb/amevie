import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Img, type ImgName } from '../Img';

/** Grand bandeau photo en haut des pages publiques (à utiliser avec <PublicHeader transparent />). */
export function PageBanner({ image, surtitre, titre, texte, teinte = 'bg-primary', children }: {
  image: ImgName; surtitre: string; titre: ReactNode; texte?: ReactNode; teinte?: string; children?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[48svh] items-end overflow-hidden bg-nuit paysage:min-h-[80svh]">
      <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}>
        <Img name={image} className="h-full w-full" priority />
      </motion.div>
      <div className={`absolute inset-0 ${teinte} opacity-40 mix-blend-multiply`} />
      <div className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/50 to-nuit/20" />
      <motion.div className="gutter relative mx-auto w-full max-w-7xl pb-12 pt-32 text-white sm:pb-16"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
        <p className="surtitre text-accent">{surtitre}</p>
        <h1 className="mt-2 max-w-3xl text-[clamp(2.1rem,5.5vw,3.8rem)] text-white">{titre}</h1>
        {texte && <p className="mt-3 max-w-2xl text-[15.5px] text-white/80">{texte}</p>}
        {children}
      </motion.div>
    </section>
  );
}
