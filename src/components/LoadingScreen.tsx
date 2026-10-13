import { motion } from 'motion/react';
import { Emblem } from './Logo';
import { SITE } from '@/config/site';

/** Écran de chargement : logo qui pulse. */
export function LoadingScreen({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-fond" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/25"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
            <Emblem className="h-16 w-16" />
          </motion.div>
        </div>
        <p className="font-serif text-lg text-ink">{SITE.nom}</p>
        <p className="text-mini text-ink/55">{label}</p>
      </div>
    </div>
  );
}
