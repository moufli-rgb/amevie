import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';

export type AlertKind = 'error' | 'success' | 'info' | 'pending';
export interface AlertMsg { kind: AlertKind; text: string }

const icons = { error: AlertCircle, success: CheckCircle2, info: Info, pending: Clock };
// Teintes sémantiques (erreur rouge, succès vert) mélangées au thème
const tones: Record<AlertKind, string> = {
  error: 'bg-[color-mix(in_oklab,var(--couleur-erreur)_10%,var(--couleur-fond))] text-[color-mix(in_oklab,var(--couleur-erreur)_80%,var(--couleur-texte))] ring-[color-mix(in_oklab,var(--couleur-erreur)_25%,transparent)]',
  success: 'bg-[color-mix(in_oklab,var(--couleur-succes)_10%,var(--couleur-fond))] text-[color-mix(in_oklab,var(--couleur-succes)_80%,var(--couleur-texte))] ring-[color-mix(in_oklab,var(--couleur-succes)_25%,transparent)]',
  info: 'bg-primary/6 text-ink ring-primary/15',
  pending: 'bg-accent/12 text-ink ring-accent/30',
};

/** Message d'erreur / de succès animé. */
export function Alert({ msg }: { msg: AlertMsg | null }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {msg && (
        <motion.div
          key={msg.text}
          role={msg.kind === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: msg.kind === 'error' ? [0, -6, 6, -3, 3, 0] : 0 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-[13.5px] font-medium ring-1 ${tones[msg.kind]}`}
        >
          {(() => { const I = icons[msg.kind]; return <I className="mt-0.5 h-4 w-4 shrink-0" />; })()}
          <span>{msg.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
