import { ApiError } from './errors.js';

/**
 * Lecture des variables d'environnement serveur.
 * ⚠️ Aucune de ces variables ne doit porter le préfixe VITE_ :
 * elles ne doivent jamais être envoyées au navigateur.
 */
export function env() {
  const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
  const PDG_AUTH_SECRET = process.env.PDG_AUTH_SECRET ?? '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new ApiError(503, "Le serveur n'est pas encore configuré (variables Supabase manquantes).", 'CONFIG');
  }
  if (PDG_AUTH_SECRET.length < 32) {
    throw new ApiError(503, "Le serveur n'est pas encore configuré (PDG_AUTH_SECRET doit contenir au moins 32 caractères).", 'CONFIG');
  }
  return { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, PDG_AUTH_SECRET };
}
