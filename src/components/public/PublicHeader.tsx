import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Crown, LogIn, Menu, X } from 'lucide-react';
import { Logo } from '../Logo';
import { hrefOf } from '@/lib/router';
import { useVisitor } from '@/lib/visitor';
import { initiales } from '@/lib/format';

/** Navigation publique. Volontairement AUCUN lien vers l'administration. */
const LIENS = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/#apropos' },
  { label: 'Contenus', href: '/#bibliotheque' },
  { label: 'Paroles de Dieu', href: '/#bibliotheque/parole' },
  { label: 'Documents', href: '/#bibliotheque/document' },
  { label: 'Pasteurs', href: '/#pasteurs' },
];

/**
 * En-tête fixe. `transparent` : posé sur une grande photo (accueil), devient opaque au défilement.
 */
export function PublicHeader({ actif, transparent = false }: { actif: string; transparent?: boolean }) {
  const { user } = useVisitor();
  const { scrollY } = useScroll();
  const [defile, setDefile] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setDefile(y > 30));
  useEffect(() => { document.body.style.overflow = ouvert ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [ouvert]);
  useEffect(() => { const c = () => setOuvert(false); window.addEventListener('hashchange', c); return () => window.removeEventListener('hashchange', c); }, []);
  const clair = transparent && !defile && !ouvert;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 pt-safe transition-[background-color,box-shadow] duration-500 ${clair ? 'bg-transparent' : 'bg-fond/85 shadow-[0_1px_0_var(--couleur-ligne)] backdrop-blur-xl backdrop-saturate-150'}`}>
        <div className="gutter mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4 paysage:h-14">
          <a href="/" aria-label="Accueil Ame & Vie" className="min-w-0"><Logo inverse={clair} /></a>
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Navigation principale">
            {LIENS.map((l) => (
              <a key={l.href} href={l.href} className={`relative rounded-full px-3 py-2 text-[13.5px] font-semibold transition-colors ${clair ? 'text-white/85 hover:text-white' : 'text-ink/70 hover:text-ink'}`}>
                {actif === l.href && <motion.span layoutId="nav-ame" className={`absolute inset-0 rounded-full ${clair ? 'bg-white/15' : 'bg-primary/8'}`} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">{l.label}</span>
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <a href={hrefOf('espace')} className={`flex h-10 items-center gap-2 rounded-full pl-1 pr-3.5 text-[13px] font-semibold transition ${clair ? 'bg-white/15 text-white ring-1 ring-white/30' : 'bg-surface text-ink ring-1 ring-ligne hover:bg-ligne/50'}`}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-mini font-bold text-on-primary">{initiales(user.name)}</span>
                <span className="hidden sm:inline">Mon espace</span>
                {user.premium && <Crown className="h-3.5 w-3.5 text-accent" />}
              </a>
            ) : (
              <>
                <a href={hrefOf('connexion')} className={`hidden h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition sm:inline-flex ${clair ? 'text-white ring-1 ring-white/40 hover:bg-white/10' : 'text-ink ring-1 ring-ligne hover:bg-surface'}`}>
                  <LogIn className="h-4 w-4" /> Connexion
                </a>
                <a href={hrefOf('inscription')} className={`inline-flex h-10 items-center rounded-full px-4 text-[13px] font-semibold transition ${clair ? 'bg-white text-ink hover:bg-white/90' : 'bg-primary text-on-primary hover:brightness-110'}`}>
                  Créer un compte
                </a>
              </>
            )}
            <button onClick={() => setOuvert((o) => !o)} aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={ouvert}
              className={`grid h-10 w-10 place-items-center rounded-full xl:hidden ${clair ? 'text-white ring-1 ring-white/40' : 'text-ink ring-1 ring-ligne'}`}>
              {ouvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {ouvert && (
          <motion.div className="fixed inset-0 z-40 overflow-y-auto bg-fond/97 px-6 pb-safe pt-[calc(70px+env(safe-area-inset-top))] backdrop-blur-xl xl:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}>
            <motion.ul className="mt-6 paysage:mt-2 paysage:grid paysage:grid-cols-2 paysage:gap-x-6" initial="h" animate="s"
              variants={{ h: {}, s: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}>
              {[...LIENS, { label: 'Abonnement', href: '/#abonnement' }, ...(user ? [{ label: 'Mon espace', href: '/#espace' }] : [{ label: 'Connexion', href: '/#connexion' }, { label: 'Créer un compte', href: '/#inscription' }])].map((l) => (
                <motion.li key={l.href} variants={{ h: { opacity: 0, y: 16 }, s: { opacity: 1, y: 0 } }}>
                  <a href={l.href} className="flex items-center justify-between border-b border-ligne py-4 font-serif text-[1.6rem] paysage:py-2 paysage:text-xl">
                    {l.label}<span className="text-mini text-ink/40">→</span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
