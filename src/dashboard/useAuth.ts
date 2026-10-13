import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { clearSession, loadSession, saveSession, type Role, type SessionUser } from '@/lib/session';

const INTERVALLE_MS = 30_000; // vérification de session toutes les 30 s

/**
 * Gère la session d'un espace :
 *  - restaure le jeton (sessionStorage) et le vérifie auprès du serveur ;
 *  - revérifie toutes les 30 s : compte désactivé ou supprimé = déconnexion.
 */
export function useAuth(role: Role) {
  const [user, setUser] = useState<SessionUser | null>(() => loadSession(role)?.user ?? null);
  const [checking, setChecking] = useState(() => !!loadSession(role));
  const [notice, setNotice] = useState<string | null>(null);
  const mounted = useRef(true);

  const logout = useCallback((message?: string) => {
    clearSession(role);
    setUser(null);
    setNotice(message ?? null);
  }, [role]);

  const verify = useCallback(async () => {
    const s = loadSession(role);
    if (!s) { setChecking(false); return; }
    try {
      const { user: fresh } = await api<{ user: SessionUser }>('auth', { role });
      if (!mounted.current) return;
      if (fresh.role !== role) { logout(); return; }
      saveSession(role, s.token, fresh);
      setUser(fresh);
    } catch (e) {
      if (!mounted.current) return;
      // Erreur réseau : on garde la session et on réessaiera
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) logout(e.message);
    } finally {
      if (mounted.current) setChecking(false);
    }
  }, [role, logout]);

  useEffect(() => {
    mounted.current = true;
    verify();
    return () => { mounted.current = false; };
  }, [verify]);

  useEffect(() => {
    if (!user) return;
    const id = window.setInterval(verify, INTERVALLE_MS);
    const onFocus = () => verify();
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, [user, verify]);

  const login = useCallback((token: string, u: SessionUser) => {
    saveSession(role, token, u);
    setNotice(null);
    setUser(u);
    // Complète le profil (site normalisé, téléphone…)
    setTimeout(verify, 0);
  }, [role, verify]);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((u) => {
      if (!u) return u;
      const next = { ...u, ...patch };
      const s = loadSession(role);
      if (s) saveSession(role, s.token, next);
      return next;
    });
  }, [role]);

  return { user, checking, notice, login, logout, updateUser };
}
