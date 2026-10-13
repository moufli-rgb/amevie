import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useRoute } from '@/lib/router';
import { VisitorProvider } from '@/lib/visitor';
import { LoadingScreen } from '@/components/LoadingScreen';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { PastorsPage } from '@/pages/PastorsPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { ContentPage } from '@/pages/ContentPage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { LoginPage, RegisterPage } from '@/pages/VisitorAuthPages';
import { SITE } from '@/config/site';

// Espaces connectés chargés à la demande (pages publiques plus légères)
const VisitorSpace = lazy(() => import('@/spaces/VisitorSpace'));
const PasteurSpace = lazy(() => import('@/spaces/PasteurSpace'));
const AdminSpace = lazy(() => import('@/spaces/AdminSpace'));

const TITRES: Record<string, string> = {
  accueil: SITE.slogan, apropos: 'À propos', pasteurs: 'Pasteurs', bibliotheque: 'Contenus', contenu: 'Contenu',
  abonnement: 'Abonnement', connexion: 'Connexion', inscription: 'Créer un compte', espace: 'Mon espace',
  pasteur: 'Espace pasteur', admin: 'Administration',
};

export default function App() {
  const route = useRoute();
  useEffect(() => { document.title = `${SITE.nom} · ${TITRES[route.espace]}`; }, [route.espace]);

  // Compte une visite anonyme par session (statistique « Visiteurs du site »)
  useEffect(() => {
    try {
      if (sessionStorage.getItem('ameetvie.visite')) return;
      sessionStorage.setItem('ameetvie.visite', '1');
    } catch { /* stockage indisponible : on compte quand même */ }
    fetch('/api/auth?action=visite', { method: 'POST' }).catch(() => {});
  }, []);

  let page;
  switch (route.espace) {
    case 'apropos': page = <AboutPage />; break;
    case 'pasteurs': page = <PastorsPage />; break;
    case 'bibliotheque': page = <LibraryPage page={route.page} id={route.id} />; break;
    case 'contenu': page = <ContentPage id={route.page} />; break;
    case 'abonnement': page = <SubscriptionPage />; break;
    case 'connexion': page = <LoginPage />; break;
    case 'inscription': page = <RegisterPage />; break;
    case 'espace': page = <VisitorSpace page={route.page} />; break;
    case 'pasteur': page = <PasteurSpace page={route.page} id={route.id} />; break;
    case 'admin': page = <AdminSpace page={route.page} id={route.id} />; break;
    default: page = <HomePage ancre={route.page} />;
  }
  // Clé de transition : les espaces connectés gèrent eux-mêmes leurs sous-pages
  const cle = ['espace', 'pasteur', 'admin'].includes(route.espace) ? route.espace : `${route.espace}/${route.page}`;

  return (
    // Respecte le réglage « réduire les animations » du système
    <MotionConfig reducedMotion="user">
      <VisitorProvider>
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <motion.div key={cle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {page}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </VisitorProvider>
    </MotionConfig>
  );
}
