import { createClient, type SupabaseClient, type PostgrestError } from '@supabase/supabase-js';
import { env } from './env.js';
import { ApiError } from './errors.js';

let client: SupabaseClient | null = null;

/** Client Supabase côté serveur (clé service_role, contourne la RLS). */
export function db(): SupabaseClient {
  if (!client) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env();
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}

/** Client « public » utilisé uniquement pour vérifier un email/mot de passe admin. */
export function authClient(): SupabaseClient {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = env();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Une table est-elle absente ? (erreurs PostgREST / PostgreSQL) */
export function isMissingTable(error: Pick<PostgrestError, 'code' | 'message'> | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /could not find the table|relation .* does not exist/i.test(error.message ?? '')
  );
}

/**
 * Transforme une erreur Supabase en ApiError lisible.
 * Si une table manque : message clair au lieu d'une erreur technique.
 */
export function check(error: PostgrestError | null, table?: string): void {
  if (!error) return;
  if (isMissingTable(error)) {
    throw new ApiError(
      503,
      `La table « ${table ?? 'demandée'} » n'existe pas encore dans Supabase. Exécutez le script supabase/schema.sql dans le SQL Editor.`,
      'TABLE_MANQUANTE',
    );
  }
  if (error.code === '23505') {
    throw new ApiError(409, 'Cet enregistrement existe déjà.', 'DOUBLON');
  }
  console.error('[supabase]', error.code, error.message);
  throw new ApiError(500, 'Une erreur est survenue avec la base de données.');
}
