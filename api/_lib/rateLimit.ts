import { ApiError } from './errors.js';
import { db, isMissingTable } from './supabase.js';

/**
 * Limitation des tentatives de connexion, stockée dans Supabase (table login_attempts)
 * pour fonctionner sur toutes les instances serverless.
 * Repli en mémoire si la table n'existe pas encore.
 *
 *  - par nom : 5 échecs / 15 min  → blocage 15 min
 *  - par IP  : 20 échecs / 15 min → blocage 15 min
 */
const FENETRE_MS = 15 * 60 * 1000;
const BLOCAGE_MS = 15 * 60 * 1000;

export interface LimitKey { key: string; max: number }

export function loginKeys(scope: string, ip: string, normalizedName: string): LimitKey[] {
  return [
    { key: `${scope}:ip:${ip}`, max: 20 },
    { key: `${scope}:nom:${normalizedName.slice(0, 120)}`, max: 5 },
  ];
}

interface Row { key: string; attempts: number; first_attempt_at: string; blocked_until: string | null }
const memoire = new Map<string, Row>();
let tableAbsente = false;

async function read(keys: string[]): Promise<Row[]> {
  if (!tableAbsente) {
    const { data, error } = await db().from('login_attempts').select('*').in('key', keys);
    if (!error) return (data ?? []) as Row[];
    if (isMissingTable(error)) tableAbsente = true;
    else console.error('[rateLimit]', error.message);
  }
  return keys.map((k) => memoire.get(k)).filter(Boolean) as Row[];
}

async function write(row: Row): Promise<void> {
  if (!tableAbsente) {
    const { error } = await db().from('login_attempts').upsert(row);
    if (!error) return;
    if (isMissingTable(error)) tableAbsente = true;
  }
  memoire.set(row.key, row);
}

/** Refuse (429) si l'une des clés est bloquée. */
export async function assertNotLimited(keys: LimitKey[]): Promise<void> {
  const rows = await read(keys.map((k) => k.key));
  const now = Date.now();
  const bloque = rows.find((r) => r.blocked_until && Date.parse(r.blocked_until) > now);
  if (bloque) {
    const minutes = Math.ceil((Date.parse(bloque.blocked_until!) - now) / 60000);
    throw new ApiError(429, `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`, 'LIMITE');
  }
}

/** Enregistre un échec de connexion. */
export async function registerFailure(keys: LimitKey[]): Promise<void> {
  const rows = await read(keys.map((k) => k.key));
  const now = Date.now();
  for (const k of keys) {
    const r = rows.find((x) => x.key === k.key);
    const fresh = !r || now - Date.parse(r.first_attempt_at) > FENETRE_MS;
    const attempts = fresh ? 1 : r!.attempts + 1;
    await write({
      key: k.key,
      attempts,
      first_attempt_at: fresh ? new Date(now).toISOString() : r!.first_attempt_at,
      blocked_until: attempts >= k.max ? new Date(now + BLOCAGE_MS).toISOString() : null,
    });
  }
}

/** Réinitialise le compteur « nom » après une connexion réussie. */
export async function resetName(keys: LimitKey[]): Promise<void> {
  const nameKeys = keys.filter((k) => k.key.includes(':nom:')).map((k) => k.key);
  nameKeys.forEach((k) => memoire.delete(k));
  if (!tableAbsente && nameKeys.length) await db().from('login_attempts').delete().in('key', nameKeys);
}
