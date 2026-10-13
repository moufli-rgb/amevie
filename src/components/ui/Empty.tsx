import type { ReactNode } from 'react';
import { motion } from 'motion/react';

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center rounded-3xl border border-dashed border-ligne px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/8 text-primary">{icon}</div>
      <h3 className="mt-4 text-lg">{title}</h3>
      {text && <p className="mt-1.5 max-w-sm text-sm text-ink/60">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface ${className}`} />;
}
