import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import { env } from './env.js';

/* ---------------------------------------------------------------------------
 * Mots de passe : scrypt + sel aléatoire de 16 octets.
 * Format stocké : scrypt$N$r$p$<sel base64>$<hash base64>
 * ------------------------------------------------------------------------- */
const N = 16384, R = 8, P = 1, KEYLEN = 64;

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

/** Hachage factice : permet un temps de réponse identique si le compte n'existe pas. */
let dummyHash: string | null = null;
export async function dummyVerify(password: string): Promise<void> {
  if (!dummyHash) dummyHash = await hashPassword('mot-de-passe-factice');
  await verifyPassword(password, dummyHash);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [algo, n, r, p, saltB64, hashB64] = stored.split('$');
    if (algo !== 'scrypt') return false;
    const expected = Buffer.from(hashB64, 'base64');
    const actual = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024,
    });
    // Comparaison en temps constant
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------------------------
 * Sessions : jeton signé HMAC-SHA256, valable 7 jours.
 * Format : v1.<payload base64url>.<signature base64url>
 * ------------------------------------------------------------------------- */
export type Role = 'admin' | 'pasteur' | 'visiteur';
export interface SessionPayload {
  sub: string;   // id du compte
  role: Role;
  name: string;
  iat: number;   // émis à (secondes)
  exp: number;   // expire à (secondes)
  /** Accès de l'administration à l'espace d'un guide : id de l'administrateur */
  adm?: string;
}

export const SESSION_DUREE_S = 7 * 24 * 60 * 60;

const b64url = (b: Buffer) => b.toString('base64url');
const sign = (data: string) => createHmac('sha256', env().PDG_AUTH_SECRET).update(data).digest();

export function signSession(p: Omit<SessionPayload, 'iat' | 'exp'>, dureeS = SESSION_DUREE_S): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { ...p, iat: now, exp: now + dureeS };
  const body = `v1.${b64url(Buffer.from(JSON.stringify(payload)))}`;
  return `${body}.${b64url(sign(body))}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = sign(body);
  let given: Buffer;
  try { given = Buffer.from(parts[2], 'base64url'); } catch { return null; }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as SessionPayload;
    if (!p || typeof p.sub !== 'string' || !['admin', 'pasteur', 'visiteur'].includes(p.role)) return null;
    if (typeof p.exp !== 'number' || p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch {
    return null;
  }
}
