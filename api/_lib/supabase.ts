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
  const msg = `${error.message ?? ''} ${(error as { details?: string }).details ?? ''} ${(error as { hint?: string }).hint ?? ''}`;
  // Diagnostics de configuration (aucune donnée sensible n'est renvoyée)
  if (error.code === '42501' || /permission denied/i.test(msg)) {
    throw new ApiError(503, "Accès refusé par Supabase : la variable SUPABASE_SERVICE_ROLE_KEY ne contient pas la clé « service_role » (secret). Corrigez-la dans Vercel puis redéployez.", 'CLE_SERVICE');
  }
  if (/invalid api key|jwt|unauthorized|no api key|invalid.*key/i.test(msg) || error.code === 'PGRST301' || error.code === 'PGRST302') {
    throw new ApiError(503, "Supabase refuse la clé : SUPABASE_SERVICE_ROLE_KEY est invalide ou ne vient pas du même projet que SUPABASE_URL. Corrigez-la dans Vercel puis redéployez.", 'CLE_INVALIDE');
  }
  if (/fetch failed|enotfound|getaddrinfo|econnrefused|network/i.test(msg)) {
    throw new ApiError(503, "Impossible de joindre Supabase : vérifiez SUPABASE_URL (https://xxxx.supabase.co) et que le projet Supabase n'est pas en pause.", 'URL_SUPABASE');
  }
  if (error.code === '42883' || error.code === '42703' || error.code === 'PGRST202' || error.code === 'PGRST204') {
    throw new ApiError(503, "La base Supabase n'est pas à jour : exécutez à nouveau tout le script supabase/schema.sql dans le SQL Editor.", 'SCHEMA');
  }
  throw new ApiError(500, `Une erreur est survenue avec la base de données (code ${error.code || 'inconnu'}).`);
}
