import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, onUnauthorized, tokenStore } from '../api/client';
import { AuthContext } from './AuthContext';

/**
 * Sessione utente basata su JWT.
 * Al caricamento il token salvato viene verificato con /api/auth/me,
 * così l'utente resta connesso dopo un refresh della pagina.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(() => Boolean(tokenStore.get()));

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    onUnauthorized(clearSession);
    return () => onUnauthorized(null);
  }, [clearSession]);

  useEffect(() => {
    if (!tokenStore.get()) return;
    let active = true;
    api.get('/auth/me')
      .then(({ data }) => active && setUser(data))
      .catch(() => active && clearSession())
      .finally(() => active && setRestoring(false));
    return () => { active = false; };
  }, [clearSession]);

  const startSession = useCallback((data) => {
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return startSession(data);
  }, [startSession]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return startSession(data);
  }, [startSession]);

  const value = useMemo(
    () => ({ user, restoring, login, register, logout: clearSession }),
    [user, restoring, login, register, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
