import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { Role } from '@/lib/session';

/** Chargement de données depuis l'API avec rechargement. */
export function useData<T>(path: string | null, role: Role) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);
  const seq = useRef(0);

  const reload = useCallback(async () => {
    if (!path) return;
    const n = ++seq.current;
    setLoading(true);
    try {
      const d = await api<T>(path, { role });
      if (n === seq.current) { setData(d); setError(null); }
    } catch (e) {
      if (n === seq.current) setError(e instanceof Error ? e.message : 'Erreur inconnue.');
    } finally {
      if (n === seq.current) setLoading(false);
    }
  }, [path, role]);

  useEffect(() => { reload(); }, [reload]);
  return { data, setData, error, loading, reload };
}
