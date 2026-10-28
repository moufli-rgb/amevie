import { api } from './api';
import { go } from './router';
import { clearSession, saveSession, type SessionUser } from './session';

/**
 * L'administration ouvre l'espace d'un guide spirituel (sans connaître son mot de passe).
 * La session de l'administrateur reste ouverte à côté : « Revenir à l'administration » la retrouve.
 */
export async function ouvrirEspaceGuide(pastorId: string, page = '', sousPage = '') {
  const r = await api<{ token: string; user: SessionUser }>('auth?action=acces-guide', { method: 'POST', role: 'admin', body: { pastor_id: pastorId } });
  saveSession('pasteur', r.token, r.user);
  go('pasteur', page, sousPage);
}

/** Quitte l'espace du guide et revient à l'administration. */
export function revenirAdministration() {
  clearSession('pasteur');
  go('admin', 'pasteurs');
}
