import { loadSession, type Role } from './session';

/** Erreur renvoyée par l'API (message déjà en français). */
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public data?: Record<string, unknown>) {
    super(message);
  }
}

interface Options {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  role?: Role; // ajoute le jeton de ce rôle
}

/** Appel JSON vers les fonctions Vercel /api. */
export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.role) {
    const s = loadSession(opts.role);
    if (s) headers.Authorization = `Bearer ${s.token}`;
  }
  let res: Response;
  try {
    res = await fetch(`/api/${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Connexion impossible. Vérifiez votre accès à Internet.');
  }
  let data: Record<string, unknown> = {};
  const text = await res.text();
  try { data = text ? JSON.parse(text) : {}; } catch {
    // Pas de JSON : souvent l'API n'est pas démarrée (npm run dev sans vercel dev)
    if (!res.ok) throw new ApiError(res.status, res.status === 404
      ? "Le serveur n'est pas joignable. En local, lancez « vercel dev » pour activer l'API."
      : 'Réponse inattendue du serveur.');
  }
  if (!res.ok) {
    throw new ApiError(res.status, (data.error as string) || 'Une erreur est survenue.', data.code as string | undefined, data);
  }
  return data as T;
}
