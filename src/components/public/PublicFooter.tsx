import { Bitcoin } from 'lucide-react';
import { Logo } from '../Logo';
import { SITE } from '@/config/site';

export function PublicFooter() {
  return (
    <footer className="border-t border-ligne bg-surface/60">
      <div className="gutter mx-auto grid max-w-7xl gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-[14px] text-ink/65">{SITE.description}</p>
          <a href="/#abonnement" className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline">
            <Bitcoin className="h-4 w-4" /> Abonnement payable en cryptomonnaie
          </a>
        </div>
        <div>
          <p className="surtitre text-ink/45">Découvrir</p>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            <li><a className="text-ink/75 hover:text-primary" href="/#bibliotheque">Bibliothèque</a></li>
            <li><a className="text-ink/75 hover:text-primary" href="/#bibliotheque/parole">Paroles de Dieu</a></li>
            <li><a className="text-ink/75 hover:text-primary" href="/#bibliotheque/enseignement">Enseignements</a></li>
            <li><a className="text-ink/75 hover:text-primary" href="/#bibliotheque/document">Documents</a></li>
          </ul>
        </div>
        <div>
          <p className="surtitre text-ink/45">Mon compte</p>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            <li><a className="text-ink/75 hover:text-primary" href="/#inscription">Créer un compte</a></li>
            <li><a className="text-ink/75 hover:text-primary" href="/#connexion">Connexion</a></li>
            <li><a className="text-ink/75 hover:text-primary" href="/#abonnement">Abonnement Premium</a></li>
            <li><a className="text-ink/75 hover:text-primary" href="/#guide">Espace guide spirituel</a></li>
          </ul>
        </div>
      </div>
      <div className="gutter mx-auto max-w-7xl border-t border-ligne py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-mini text-ink/50">
        © {new Date().getFullYear()} {SITE.nom} · {SITE.slogan}
      </div>
    </footer>
  );
}
