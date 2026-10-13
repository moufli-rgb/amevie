import type { FormEvent, ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Img, type ImgName } from '@/components/Img';
import { Logo } from '@/components/Logo';
import { Alert, type AlertMsg } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

/**
 * Page de connexion : carte centrée, bandeau avec logo et photo,
 * champs de 48 px, bouton principal avec reflet animé, messages animés.
 * Téléphone en paysage : 2 colonnes (marque à gauche, champs à droite).
 */
export function AuthLayout({
  photo, surtitre, titre, texte, children, msg, loading, submitLabel, onSubmit, footer, retour = true,
}: {
  photo: ImgName; surtitre: string; titre: string; texte: string; children: ReactNode;
  msg: AlertMsg | null; loading: boolean; submitLabel: string; onSubmit: () => void; footer?: ReactNode; retour?: boolean;
}) {
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit(); };

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-surface">
      {/* Fond photo très doux */}
      <div className="absolute inset-0 opacity-[0.07]" aria-hidden><Img name={photo} className="h-full w-full" decorative /></div>

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center gutter py-[max(1.5rem,env(safe-area-inset-top))] paysage:py-3">
        {retour && (
          <a href="/" className="mb-5 inline-flex items-center gap-2 self-center rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink/60 transition hover:bg-fond hover:text-ink paysage:hidden sm:absolute sm:left-6 sm:top-6 sm:mb-0">
            <ArrowLeft className="h-4 w-4" /> Retour au site
          </a>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[460px] overflow-hidden rounded-[28px] bg-fond shadow-haut ring-1 ring-ligne paysage:grid paysage:max-h-[calc(100svh-1.5rem)] paysage:max-w-3xl paysage:grid-cols-[0.9fr_1.1fr]"
        >
          {/* Bandeau : logo + photo */}
          <div className="relative h-44 overflow-hidden paysage:h-auto">
            <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
              <Img name={photo} className="h-full w-full" priority sizes="460px" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
            <div className="relative flex h-full flex-col justify-between p-5">
              <a href="/" aria-label="Accueil"><Logo inverse compact /></a>
              <div>
                <p className="surtitre text-white/70">{surtitre}</p>
                <h1 className="mt-1 text-[1.65rem] text-white paysage:text-xl">{titre}</h1>
              </div>
            </div>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4 p-6 sm:p-7 paysage:max-h-[calc(100svh-1.5rem)] paysage:overflow-y-auto paysage:space-y-3 paysage:p-5">
            <p className="text-[14px] text-ink/65">{texte}</p>
            {children}
            <Alert msg={msg} />
            <Button type="submit" size="lg" shine loading={loading} className="w-full">{submitLabel}</Button>
            {footer && <div className="pt-1 text-center text-mini text-ink/55">{footer}</div>}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
