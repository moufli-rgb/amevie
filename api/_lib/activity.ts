import { db } from './supabase.js';
import type { Role } from './crypto.js';

/** Ajoute une ligne au journal « activity_logs » (ne bloque jamais la requête). */
export async function logActivite(e: {
  role: Role | 'systeme';
  user_id?: string | null;
  nom?: string | null;
  action: string;
  cible_type?: string | null;
  cible_id?: string | null;
  cible_titre?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { error } = await db().from('activity_logs').insert({
      user_id: e.user_id ?? null,
      actor_role: e.role,
      actor_name: e.nom ?? null,
      action: e.action,
      target_type: e.cible_type ?? null,
      target_id: e.cible_id ?? null,
      target_title: e.cible_titre ?? null,
      details: e.details ?? {},
    });
    if (error) console.warn('[activité]', error.message);
  } catch (err) {
    console.warn('[activité]', err);
  }
}
