import { ApiError } from './errors.js';

/**
 * Lecture des variables d'environnement serveur.
 * ⚠️ Aucune de ces variables ne doit porter le préfixe VITE_ :
 * elles ne doivent jamais être envoyées au navigateur.
 */
export function env() {
  const lire = (n: string) => (process.env[n] ?? '').trim().replace(/^["']|["']$/g, '');
  const SUPABASE_URL = lire('SUPABASE_URL').replace(/\/+$/, '');
  const SUPABASE_SERVICE_ROLE_KEY = lire('SUPABASE_SERVICE_ROLE_KEY');
  const SUPABASE_ANON_KEY = lire('SUPABASE_ANON_KEY');
  const PDG_AUTH_SECRET = lire('PDG_AUTH_SECRET');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    // Seuls les NOMS des variables manquantes sont indiqués, jamais leurs valeurs.
    const manquantes = [!SUPABASE_URL && 'SUPABASE_URL', !SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean).join(', ');
    const cible = process.env.VERCEL_ENV ? ` — déploiement « ${process.env.VERCEL_ENV} »` : '';
    throw new ApiError(503, `Le serveur n'est pas encore configuré (variables Supabase manquantes : ${manquantes}${cible}).`, 'CONFIG');
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL) && process.env.VERCEL_ENV) {
    throw new ApiError(503, "Le serveur n'est pas encore configuré (SUPABASE_URL doit ressembler à https://xxxx.supabase.co).", 'CONFIG');
  }
  if (PDG_AUTH_SECRET.length < 32) {
    throw new ApiError(503, "Le serveur n'est pas encore configuré (PDG_AUTH_SECRET doit contenir au moins 32 caractères).", 'CONFIG');
  }
  return { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, PDG_AUTH_SECRET };
}
