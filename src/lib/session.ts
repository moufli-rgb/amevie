/**
 * Session côté navigateur : jeton signé stocké en sessionStorage
 * (effacé à la fermeture de l'onglet). Une clé par rôle.
 */
export type Role = 'admin' | 'pasteur' | 'visiteur';

export interface Abonnement {
  id?: string | null;
  statut: 'actif' | 'expire' | 'desactive' | 'aucun';
  premium: boolean;
  type: string | null;
  duree_mois: number | null;
  date_debut: string | null;
  date_expiration: string | null;
  jours_restants: number;
}

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email?: string;
  nom?: string;
  prenom?: string;
  telephone?: string | null;
  eglise?: string | null;
  bio?: string | null;
  premium?: boolean;
  abonnement?: Abonnement;
  /** compatibilité avec la coque des tableaux de bord */
  site_name?: string;
}

const KEY = (role: Role) => `ameetvie.session.${role}`;

export function saveSession(role: Role, token: string, user: SessionUser) {
  try { sessionStorage.setItem(KEY(role), JSON.stringify({ token, user })); } catch { /* stockage indisponible */ }
}
export function loadSession(role: Role): { token: string; user: SessionUser } | null {
  try {
    const raw = sessionStorage.getItem(KEY(role));
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && typeof v.token === 'string' ? v : null;
  } catch { return null; }
}
export function clearSession(role: Role) {
  try { sessionStorage.removeItem(KEY(role)); } catch { /* ignoré */ }
}
