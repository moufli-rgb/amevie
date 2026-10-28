import type { Req } from './http.js';
import { ApiError, MSG_INTERDIT, MSG_SESSION } from './errors.js';
import { verifySession, type Role } from './crypto.js';
import { db, check } from './supabase.js';
import { abonnementCourant, resume, type SubscriptionRow } from './abonnement.js';

/** Utilisateur authentifié, relu depuis la base à chaque requête. */
export interface Actor {
  id: string;
  role: Role;
  name: string;
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string | null;
  eglise?: string | null;
  bio?: string | null;
  /** Visiteur uniquement : abonnement courant et droit Premium (calculés côté serveur) */
  abonnement?: SubscriptionRow | null;
  premium?: boolean;
  /** Guide ouvert par l'administration : nom de l'administrateur */
  via_admin?: string;
}

function bearer(req: Req): string | null {
  const h = req.headers.authorization;
  if (!h || typeof h !== 'string' || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

/**
 * Vérifie le jeton ET l'état du compte en base.
 * Compte suspendu, désactivé ou supprimé → bloqué immédiatement.
 */
export async function getActor(req: Req): Promise<Actor> {
  const payload = verifySession(bearer(req));
  if (!payload) throw new ApiError(401, MSG_SESSION, 'SESSION');

  if (payload.role === 'admin') {
    const { data, error } = await db().from('admin_users').select('user_id, email, display_name').eq('user_id', payload.sub).maybeSingle();
    check(error, 'admin_users');
    if (!data) throw new ApiError(401, MSG_SESSION, 'SESSION');
    return { id: data.user_id, role: 'admin', name: data.display_name || data.email, email: data.email };
  }

  if (payload.role === 'pasteur') {
    const { data, error } = await db()
      .from('pastors')
      .select('id, nom, prenom, email, telephone, eglise, bio, is_active')
      .eq('id', payload.sub)
      .maybeSingle();
    check(error, 'pastors');
    if (!data) throw new ApiError(401, MSG_SESSION, 'SESSION');
    // Accès ouvert par l'administration : l'administrateur doit toujours exister
    let viaAdmin: string | undefined;
    if (payload.adm) {
      const a = await db().from('admin_users').select('email, display_name').eq('user_id', payload.adm).maybeSingle();
      check(a.error, 'admin_users');
      if (!a.data) throw new ApiError(401, MSG_SESSION, 'SESSION');
      viaAdmin = a.data.display_name || a.data.email;
    } else if (!data.is_active) {
      throw new ApiError(403, 'Votre compte de guide spirituel est désactivé. Contactez l’administration.', 'COMPTE_INACTIF');
    }
    const { is_active: _s, ...rest } = data;
    return { ...rest, role: 'pasteur', name: `${data.prenom} ${data.nom}`.trim(), ...(viaAdmin ? { via_admin: viaAdmin } : {}) };
  }

  const { data, error } = await db()
    .from('users')
    .select('id, nom, prenom, email, telephone, is_active')
    .eq('id', payload.sub)
    .maybeSingle();
  check(error, 'users');
  if (!data) throw new ApiError(401, MSG_SESSION, 'SESSION');
  if (!data.is_active) throw new ApiError(403, 'Votre compte est désactivé. Contactez l’administration.', 'COMPTE_INACTIF');
  const abonnement = await abonnementCourant(data.id);
  const { is_active: _s, ...rest } = data;
  return { ...rest, role: 'visiteur', name: `${data.prenom} ${data.nom}`, abonnement, premium: resume(abonnement).premium };
}

/** Exige l'un des rôles indiqués. */
export async function requireRole(req: Req, ...roles: Role[]): Promise<Actor> {
  const actor = await getActor(req);
  if (!roles.includes(actor.role)) throw new ApiError(403, MSG_INTERDIT, 'ROLE');
  return actor;
}

/** Utilisateur facultatif (pages publiques) : null si aucun jeton ou jeton invalide. */
export async function optionalActor(req: Req): Promise<Actor | null> {
  if (!bearer(req)) return null;
  try { return await getActor(req); } catch { return null; }
}

/** Exige un abonnement Premium actif (contrôle serveur). */
export function requirePremium(actor: Actor) {
  if (actor.role === 'admin' || actor.role === 'pasteur') return;
  if (!actor.premium) {
    throw new ApiError(402, 'Cette fonctionnalité est réservée aux abonnés. Faites votre abonnement pour la débloquer.', 'ABONNEMENT_REQUIS');
  }
}

/** Version publique de l'utilisateur (renvoyée au client). */
export function publicUser(a: Actor) {
  const { abonnement, ...rest } = a;
  return a.role === 'visiteur' ? { ...rest, abonnement: resume(abonnement ?? null) } : rest;
}
