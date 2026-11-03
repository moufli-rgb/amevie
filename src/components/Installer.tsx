/**
 * « Installer l'application » : Ame & Vie s'installe comme une vraie application
 * sur téléphone Android, iPhone / iPad et ordinateur (Windows, Mac, Linux), sans passer par un store.
 *  - Chrome, Edge, Samsung Internet… : la fenêtre d'installation du navigateur s'ouvre directement ;
 *  - iPhone / iPad (Safari) et les autres cas : instructions pas à pas.
 */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Download, Laptop, MoreVertical, PlusSquare, Share, Smartphone } from 'lucide-react';
import { Modal } from './ui/Modal';

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
let invite: BeforeInstallPromptEvent | null = null;
const abonnes = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); invite = e as BeforeInstallPromptEvent; abonnes.forEach((f) => f()); });
  window.addEventListener('appinstalled', () => { invite = null; abonnes.forEach((f) => f()); });
}

type Appareil = 'android' | 'iphone' | 'pc';
function appareil(): Appareil {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iphone';
  if (/Android/i.test(ua)) return 'android';
  return 'pc';
}
const dejaInstallee = () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

function useInstallation() {
  const [, maj] = useState(0);
  useEffect(() => { const f = () => maj((n) => n + 1); abonnes.add(f); return () => { abonnes.delete(f); }; }, []);
  return { peutDirect: !!invite, installee: typeof window !== 'undefined' && dejaInstallee() };
}

const ETAPES: Record<Appareil, { titre: string; icone: typeof Smartphone; etapes: { icone: typeof Share; texte: string }[] }> = {
  android: {
    titre: 'Téléphone Android', icone: Smartphone, etapes: [
      { icone: MoreVertical, texte: 'Ouvrez le site dans Chrome, puis touchez le menu ⋮ en haut à droite.' },
      { icone: Download, texte: 'Touchez « Installer l’application » (ou « Ajouter à l’écran d’accueil »).' },
      { icone: Check, texte: 'Confirmez : l’icône Ame & Vie apparaît sur votre écran d’accueil.' },
    ],
  },
  iphone: {
    titre: 'iPhone et iPad', icone: Smartphone, etapes: [
      { icone: Share, texte: 'Ouvrez le site dans Safari, puis touchez le bouton Partager (carré avec une flèche vers le haut).' },
      { icone: PlusSquare, texte: 'Faites défiler et touchez « Sur l’écran d’accueil ».' },
      { icone: Check, texte: 'Touchez « Ajouter » : Ame & Vie s’ouvre ensuite comme une application.' },
    ],
  },
  pc: {
    titre: 'Ordinateur (Windows, Mac)', icone: Laptop, etapes: [
      { icone: Download, texte: 'Dans Chrome ou Edge, cliquez sur l’icône d’installation à droite de la barre d’adresse.' },
      { icone: MoreVertical, texte: 'Ou ouvrez le menu ⋮ (ou …) puis « Installer Ame & Vie » / « Applications → Installer ce site ».' },
      { icone: Check, texte: 'L’application s’ouvre dans sa propre fenêtre et se retrouve dans le menu Démarrer ou le Dock.' },
    ],
  },
};

function Instructions({ onClose }: { onClose: () => void }) {
  const [onglet, setOnglet] = useState<Appareil>(() => appareil());
  const E = ETAPES[onglet];
  return (
    <Modal open onClose={onClose} title="Installer Ame & Vie">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ETAPES) as Appareil[]).map((a) => (
            <button key={a} type="button" onClick={() => setOnglet(a)} aria-pressed={onglet === a}
              className={`h-10 rounded-full px-4 text-[13.5px] font-semibold ring-1 transition ${onglet === a ? 'bg-primary text-on-primary ring-transparent' : 'bg-fond ring-ligne hover:ring-primary/40'}`}>{ETAPES[a].titre}</button>
          ))}
        </div>
        <ol className="space-y-4">
          {E.etapes.map((e, i) => (
            <motion.li key={`${onglet}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><e.icone className="h-[18px] w-[18px]" /></span>
              <p className="pt-2 text-[14.5px]"><strong className="mr-1 text-primary">{i + 1}.</strong>{e.texte}</p>
            </motion.li>
          ))}
        </ol>
        <p className="rounded-2xl bg-surface px-4 py-3 text-mini text-ink/60">Gratuit, sans store et sans mise à jour à faire : l’application se met à jour toute seule. Vos connexions restent protégées.</p>
      </div>
    </Modal>
  );
}

/** Bouton « Installer l'application ». */
export function BoutonInstaller({ className = '', clair = false, label = 'Installer l’application' }: { className?: string; clair?: boolean; label?: string }) {
  const { installee } = useInstallation();
  const [aide, setAide] = useState(false);
  if (installee) return null;
  async function installer() {
    if (invite) {
      await invite.prompt();
      await invite.userChoice.catch(() => null);
      invite = null; abonnes.forEach((f) => f());
    } else setAide(true);
  }
  return (
    <>
      <button type="button" onClick={installer}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition active:scale-[0.98] ${clair ? 'bg-white text-ink hover:bg-white/90' : 'bg-ink text-fond hover:opacity-90'} ${className}`}>
        <Download className="h-4 w-4" /> {label}
      </button>
      {aide && <Instructions onClose={() => setAide(false)} />}
    </>
  );
}

/** Bandeau « Installez Ame & Vie sur votre téléphone, PC ou iPhone ». */
export function BandeauInstaller({ className = '' }: { className?: string }) {
  const { installee } = useInstallation();
  if (installee) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`relative overflow-hidden rounded-[28px] bg-secondary p-6 text-white shadow-haut sm:p-8 ${className}`}>
      <div aria-hidden className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/30 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <img src="/icons/icon-192.png" alt="" className="h-14 w-14 shrink-0 rounded-2xl shadow-doux" />
          <div>
            <p className="text-xl font-semibold text-white">Installez Ame & Vie sur votre appareil</p>
            <p className="mt-1 text-[14.5px] text-white/75">Sur téléphone Android, iPhone, iPad ou ordinateur : une icône sur votre écran, l’application à portée de main, même avec une petite connexion.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-mini font-semibold text-white/85">
              {['📱 Android', '🍎 iPhone / iPad', '💻 PC & Mac'].map((t) => <span key={t} className="rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/20">{t}</span>)}
            </div>
          </div>
        </div>
        <BoutonInstaller clair className="shrink-0" />
      </div>
    </motion.div>
  );
}
