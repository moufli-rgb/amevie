import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ApiError } from './errors.js';

export type Req = VercelRequest;
export type Res = VercelResponse;
type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type Handlers = Partial<Record<Method, (req: Req, res: Res) => Promise<unknown>>>;

/**
 * Enveloppe commune à toutes les routes :
 * - n'accepte que les méthodes prévues (405 sinon) ;
 * - réponses jamais mises en cache ;
 * - erreurs prévues → message français ; erreurs imprévues → message générique.
 */
export function route(handlers: Handlers) {
  return async (req: Req, res: Res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const method = (req.method ?? 'GET').toUpperCase() as Method;
    const fn = handlers[method];
    if (!fn) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      return res.status(405).json({ error: 'Méthode non autorisée.' });
    }
    try {
      const data = await fn(req, res);
      if (!res.headersSent) res.status(200).json(data ?? { ok: true });
    } catch (e) {
      if (e instanceof ApiError) {
        return res.status(e.status).json({ error: e.message, code: e.code, ...(e.extra ?? {}) });
      }
      console.error('[api] erreur imprévue', e);
      return res.status(500).json({ error: 'Une erreur inattendue est survenue. Réessayez dans un instant.' });
    }
  };
}

/** Adresse IP du client (derrière le proxy Vercel). */
export function clientIp(req: Req): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd ?? '').split(',')[0].trim();
  return first || (req.headers['x-real-ip'] as string) || req.socket?.remoteAddress || 'inconnue';
}

export function query(req: Req, key: string): string | undefined {
  const v = req.query?.[key];
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === 'string' && s.length <= 200 ? s : undefined;
}

/** Envoie une réponse avec un statut précis (ex. 201). */
export function send(res: Res, status: number, data: unknown) {
  res.status(status).json(data);
}
