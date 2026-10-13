import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, LayoutGroup } from 'motion/react';
import { LayoutGrid, Lock, LogOut, Menu, Plus, X, Zap, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { go, type Espace } from '@/lib/router';
import { initiales } from '@/lib/format';
import type { SessionUser } from '@/lib/session';

export interface NavItem { id: string; label: string; icon: LucideIcon; badge?: number; lock?: boolean }
export interface NavSection { titre: string; items: NavItem[] }
export interface QuickAction { label: string; icon: LucideIcon; onClick: () => void }

interface Props {
  espace: Espace;
  user: SessionUser;
  roleLabel: string;
  sections: NavSection[];
  active: string;
  bottom: [string, string, string]; // 3 rubriques de la barre du bas (+ « Toutes »)
  quickActions: QuickAction[];
  onLogout: () => void;
  children: ReactNode;
}

/* -------------------------------------------------------------------------- */
/* Feuille animée (bas de l'écran) — se ferme d'un geste vers le bas          */
/* -------------------------------------------------------------------------- */
function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-[28px] bg-fond px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-haut"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 330 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 90 || i.velocity.y > 500) onClose(); }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ligne" />
            <h3 className="mb-4 text-lg">{title}</h3>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* Liens de navigation (barre latérale et tiroir)                             */
/* -------------------------------------------------------------------------- */
function NavLinks({ sections, active, onPick, pillId }: { sections: NavSection[]; active: string; onPick: (id: string) => void; pillId: string }) {
  return (
    <LayoutGroup id={pillId}>
      <nav className="space-y-6" aria-label="Menu de l'espace">
        {sections.map((s) => (
          <div key={s.titre}>
            <p className="mb-2 px-3 text-mini font-bold uppercase tracking-[0.16em] text-ink/40">{s.titre}</p>
            <ul className="space-y-0.5">
              {s.items.map((it) => {
                const on = it.id === active;
                const I = it.icon;
                return (
                  <li key={it.id}>
                    <button onClick={() => onPick(it.id)} aria-current={on ? 'page' : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition-colors ${on ? 'text-on-primary' : 'text-ink/70 hover:bg-surface hover:text-ink'}`}>
                      {/* Pastille animée qui glisse d'un lien à l'autre */}
                      {on && <motion.span layoutId="pastille" className="absolute inset-0 rounded-xl bg-primary shadow-doux" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                      <I className="relative h-[18px] w-[18px] shrink-0" />
                      <span className="relative flex-1 truncate">{it.label}</span>
                      {it.lock && <Lock className={`relative h-3.5 w-3.5 ${on ? '' : 'text-accent'}`} aria-label="Premium" />}
                      {!!it.badge && (
                        <span className={`relative min-w-5 rounded-full px-1.5 py-0.5 text-center text-mini font-bold ${on ? 'bg-on-primary text-primary' : 'bg-accent text-on-primary'}`}>
                          {it.badge > 99 ? '99+' : it.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </LayoutGroup>
  );
}

function Avatar({ name, className = 'h-10 w-10' }: { name: string; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-accent/20 font-bold text-ink ring-2 ring-fond ${className}`}>
      <span className="text-[13px]">{initiales(name)}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
export function Shell({ espace, user, roleLabel, sections, active, bottom, quickActions, onLogout, children }: Props) {
  const [drawer, setDrawer] = useState(false);
  const [quick, setQuick] = useState(false);       // feuille « action rapide » (mobile)
  const [quickPop, setQuickPop] = useState(false); // menu « action rapide » (ordinateur)
  const [toutes, setToutes] = useState(false);

  const all = sections.flatMap((s) => s.items);
  const pick = (id: string) => {
    setDrawer(false); setToutes(false);
    go(espace, id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const runQuick = (a: QuickAction) => { setQuick(false); setQuickPop(false); a.onClick(); };

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const userBlock = (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
      <Avatar name={user.name} />
      <div className="min-w-0">
        <p className="truncate text-[14px] font-bold">{user.name}</p>
        <p className="truncate text-mini text-ink/55">{roleLabel}{user.site_name ? ` · ${user.site_name}` : ''}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100svh] bg-surface">
      {/* ===================== Barre latérale (ordinateur) ===================== */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-ligne bg-fond lg:flex">
        <div className="px-5 pb-4 pt-6"><a href="/" aria-label="Retour au site"><Logo /></a></div>
        <div className="space-y-3 px-4">
          {userBlock}
          {quickActions.length > 0 && (
            <div className="relative">
              <button onClick={() => setQuickPop((o) => !o)} aria-expanded={quickPop}
                className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-sm font-semibold text-on-primary shadow-doux transition hover:brightness-110">
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-reflet bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <Zap className="h-4 w-4" /> Action rapide
              </button>
              <AnimatePresence>
                {quickPop && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setQuickPop(false)} />
                    <motion.ul
                      initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl bg-fond p-1.5 shadow-haut ring-1 ring-ligne">
                      {quickActions.map((a) => {
                        const I = a.icon;
                        return (
                          <li key={a.label}>
                            <button onClick={() => runQuick(a)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold hover:bg-surface">
                              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/8 text-primary"><I className="h-4 w-4" /></span>{a.label}
                            </button>
                          </li>
                        );
                      })}
                    </motion.ul>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="mt-6 flex-1 overflow-y-auto px-4 pb-4"><NavLinks sections={sections} active={active} onPick={pick} pillId="sidebar" /></div>
        <div className="border-t border-ligne p-4">
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-ink/70 transition hover:bg-surface hover:text-ink">
            <LogOut className="h-[18px] w-[18px]" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ===================== En-tête (mobile / tablette) ===================== */}
      <header className="sticky top-0 z-30 border-b border-ligne bg-fond/80 pt-safe backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <div className="gutter flex h-16 items-center gap-2 paysage:h-12">
          <button onClick={() => setDrawer(true)} aria-label="Ouvrir le menu" className="-ml-2 grid h-10 w-10 place-items-center rounded-xl hover:bg-surface"><Menu className="h-5 w-5" /></button>
          <a href="/" className="min-w-0 flex-1" aria-label="Retour au site"><Logo compact sousTitre={false} /></a>
          {quickActions.length > 0 && (
            <button onClick={() => setQuick(true)} aria-label="Action rapide" className="grid h-10 w-10 place-items-center rounded-xl bg-primary/8 text-primary"><Zap className="h-[18px] w-[18px]" /></button>
          )}
          <button onClick={() => pick('profil')} aria-label="Mon profil"><Avatar name={user.name} className="h-9 w-9" /></button>
        </div>
      </header>

      {/* ===================== Tiroir latéral (mobile) ===================== */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-fond pb-safe pl-safe pt-safe shadow-haut"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0.5, right: 0 }}
              onDragEnd={(_, i) => { if (i.offset.x < -80 || i.velocity.x < -500) setDrawer(false); }}
            >
              <div className="flex items-center justify-between px-4 py-4">
                <Logo compact />
                <button onClick={() => setDrawer(false)} aria-label="Fermer le menu" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-surface"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-4">{userBlock}</div>
              <div className="mt-5 flex-1 overflow-y-auto px-4 pb-4"><NavLinks sections={sections} active={active} onPick={pick} pillId="drawer" /></div>
              <div className="border-t border-ligne p-4">
                <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-ink/70 hover:bg-surface">
                  <LogOut className="h-[18px] w-[18px]" /> Se déconnecter
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== Contenu ===================== */}
      <main className="lg:pl-[272px]">
        <div className="mx-auto max-w-6xl gutter pb-[calc(var(--hauteur-barre-bas)+2.5rem+env(safe-area-inset-bottom))] pt-5 sm:pt-8 lg:px-10 lg:pb-12 lg:pt-10 paysage:pb-24 paysage:pt-4">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ===================== Barre du bas flottante (mobile) ===================== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden" aria-label="Navigation rapide">
        <LayoutGroup id="barre-bas">
          <div className="mx-auto flex h-[var(--hauteur-barre-bas)] max-w-md items-center justify-around rounded-[22px] bg-fond/90 px-2 shadow-haut ring-1 ring-ligne backdrop-blur-xl paysage:h-14 paysage:max-w-lg">
            {[bottom[0], bottom[1], '+', bottom[2], 'toutes'].map((id) => {
              if (id === '+') {
                return (
                  <motion.button key="plus" whileTap={{ scale: 0.9 }} onClick={() => setQuick(true)} aria-label="Action rapide"
                    className="-mt-7 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-on-primary shadow-haut ring-4 ring-fond paysage:-mt-4 paysage:h-11 paysage:w-11">
                    <Plus className="h-6 w-6" />
                  </motion.button>
                );
              }
              const item = id === 'toutes' ? { id: 'toutes', label: 'Rubriques', icon: LayoutGrid } : all.find((x) => x.id === id);
              if (!item) return null;
              const on = id === 'toutes' ? toutes : active === id && !toutes;
              const I = item.icon;
              return (
                <button key={id} onClick={() => (id === 'toutes' ? setToutes(true) : pick(id))} aria-current={on ? 'page' : undefined}
                  className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-mini font-semibold ${on ? 'text-primary' : 'text-ink/50'}`}>
                  {on && <motion.span layoutId="pill-bas" className="absolute top-1.5 h-1 w-6 rounded-full bg-primary paysage:top-1" />}
                  <span className="relative">
                    <I className="h-[21px] w-[21px]" />
                    {'badge' in item && !!item.badge && <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-fond" />}
                  </span>
                  <span className="max-w-full truncate px-0.5 paysage:hidden">{item.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </nav>

      {/* Feuille « Action rapide » */}
      <Sheet open={quick} onClose={() => setQuick(false)} title="Action rapide">
        <div className="grid grid-cols-2 gap-3 paysage:grid-cols-4">
          {quickActions.map((a, k) => {
            const I = a.icon;
            return (
              <motion.button key={a.label} onClick={() => runQuick(a)}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * k }}
                className="flex flex-col items-start gap-3 rounded-2xl bg-surface p-4 text-left text-[13.5px] font-semibold active:scale-[0.98]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-on-primary"><I className="h-5 w-5" /></span>
                {a.label}
              </motion.button>
            );
          })}
        </div>
      </Sheet>

      {/* Feuille « Toutes les rubriques » */}
      <Sheet open={toutes} onClose={() => setToutes(false)} title="Toutes les rubriques">
        <div className="space-y-5">
          {sections.map((s) => (
            <div key={s.titre}>
              <p className="mb-2 text-mini font-bold uppercase tracking-[0.16em] text-ink/40">{s.titre}</p>
              <div className="grid grid-cols-3 gap-2 paysage:grid-cols-6">
                {s.items.map((it, k) => {
                  const I = it.icon;
                  const on = it.id === active;
                  return (
                    <motion.button key={it.id} onClick={() => pick(it.id)}
                      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.03 * k }}
                      className={`relative flex flex-col items-center gap-2 rounded-2xl p-3 text-center text-mini font-semibold ${on ? 'bg-primary text-on-primary' : 'bg-surface text-ink/80'}`}>
                      <I className="h-5 w-5" />
                      <span className="leading-tight">{it.label}</span>
                      {!!it.badge && <span className="absolute right-2 top-2 rounded-full bg-accent px-1.5 text-mini font-bold text-on-primary">{it.badge}</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
          <button onClick={onLogout} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-ink/70 ring-1 ring-ligne">
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </div>
      </Sheet>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* En-tête de page                                                            */
/* -------------------------------------------------------------------------- */
export function PageHeader({ titre, texte, actions }: { titre: string; texte?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.6rem,3.4vw,2.2rem)]">{titre}</h1>
        {texte && <p className="mt-1 text-[14px] text-ink/60">{texte}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
