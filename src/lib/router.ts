import { useEffect, useState } from 'react';

/**
 * Routage par ancre d'URL (liens directs partageables) :
 *   /                     accueil
 *   /#apropos             à propos
 *   /#pasteurs            nos pasteurs
 *   /#bibliotheque        contenus (filtre : /#bibliotheque/parole, /#bibliotheque/document)
 *   /#contenu/<id>        un contenu
 *   /#abonnement          abonnement
 *   /#connexion           connexion visiteur
 *   /#inscription         création de compte visiteur
 *   /#espace/...          espace visiteur
 *   /#pasteur/...         espace pasteur
 *   /#admin/...           espace administrateur (non affiché publiquement)
 */
export type Espace = 'accueil' | 'apropos' | 'pasteurs' | 'bibliotheque' | 'contenu' | 'abonnement' | 'connexion' | 'inscription' | 'espace' | 'pasteur' | 'admin';
const ESPACES: Espace[] = ['apropos', 'pasteurs', 'bibliotheque', 'contenu', 'abonnement', 'connexion', 'inscription', 'espace', 'pasteur', 'admin'];

export interface Route { espace: Espace; page: string; id: string }

export function parseHash(hash: string): Route {
  const [a = '', b = '', c = ''] = decodeURIComponent(hash.replace(/^#\/?/, '')).split('/');
  if ((ESPACES as string[]).includes(a)) return { espace: a as Espace, page: b, id: c };
  return { espace: 'accueil', page: a, id: '' };
}

export function useRoute(): Route {
  const [r, setR] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setR(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

export function hrefOf(espace: Espace, page = '', id = '') {
  if (espace === 'accueil') return page ? `/#${page}` : '/';
  return `/#${[espace, page, id].filter(Boolean).join('/')}`;
}

export function go(espace: Espace, page = '', id = '') {
  const target = hrefOf(espace, page, id).slice(1); // sans « / »
  if (target === '' || target === '/') {
    history.pushState(null, '', window.location.pathname);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (window.location.hash !== target) {
    window.location.hash = target;
  }
  window.scrollTo({ top: 0 });
}
