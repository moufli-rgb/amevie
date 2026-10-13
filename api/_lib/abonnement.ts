/**
 * Règles d'abonnement (table « subscriptions »).
 *  - Durée par défaut : 1 mois (10 octobre → 10 novembre).
 *  - Expiration automatique : dès que end_date est dépassée, l'abonnement est
 *    considéré « expiré » par le serveur (accès Premium coupé immédiatement),
 *    puis enregistré « expire » en base (fonction expire_subscriptions()).
 */
import { db, check } from './supabase.js';

export const TYPES_ABONNEMENT = ['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel', 'Famille', 'Offert'] as const;
export type StatutAbonnement = 'actif' | 'expire' | 'desactive' | 'aucun';

export interface SubscriptionRow {
  id: string;
  user_id: string;
  type: string;
  duration_months: number;
  start_date: string;
  end_date: string;
  status: 'actif' | 'expire' | 'desactive';
  note: string | null;
  activated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Ajoute n mois en gardant le même jour (31 janv. + 1 mois → 28/29 févr.). */
export function ajouterMois(depart: Date, n: number): Date {
  const d = new Date(depart.getTime());
  const jour = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const dernier = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(jour, dernier));
  return d;
}

/** Statut réel, calculé à chaque requête. */
export function statutReel(a: Pick<SubscriptionRow, 'status' | 'end_date'> | null | undefined, now = Date.now()): StatutAbonnement {
  if (!a) return 'aucun';
  if (a.status === 'desactive') return 'desactive';
  if (a.status === 'expire') return 'expire';
  return Date.parse(a.end_date) > now ? 'actif' : 'expire';
}

export function joursRestants(a: Pick<SubscriptionRow, 'end_date'> | null | undefined, now = Date.now()): number {
  if (!a) return 0;
  return Math.max(0, Math.ceil((Date.parse(a.end_date) - now) / 86_400_000));
}

/** Enregistre « expire » pour tous les abonnements échus (silencieux en cas d'échec). */
export async function marquerExpires(): Promise<void> {
  try { await db().rpc('expire_subscriptions'); } catch { /* le calcul en direct reste la référence */ }
}

/** Abonnement le plus récent d'un utilisateur. */
export async function abonnementCourant(userId: string): Promise<SubscriptionRow | null> {
  const { data, error } = await db().from('subscriptions').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  check(error, 'subscriptions');
  const a = (data as SubscriptionRow) ?? null;
  if (a && a.status === 'actif' && statutReel(a) === 'expire') {
    // Bascule automatique en « expiré »
    await db().from('subscriptions').update({ status: 'expire', updated_at: new Date().toISOString() }).eq('id', a.id);
    a.status = 'expire';
  }
  return a;
}

/** Résumé envoyé au client. */
export function resume(a: SubscriptionRow | null) {
  const statut = statutReel(a);
  return {
    id: a?.id ?? null,
    statut,
    premium: statut === 'actif',
    type: a?.type ?? null,
    duree_mois: a?.duration_months ?? null,
    date_debut: a?.start_date ?? null,
    date_expiration: a?.end_date ?? null,
    jours_restants: statut === 'actif' ? joursRestants(a) : 0,
  };
}
