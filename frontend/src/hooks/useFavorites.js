import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, errorCode } from '../api/client';
import { sameCity } from '../utils/cityKey';

/**
 * Città preferite salvate sul server per l'utente connesso.
 * Lo stato è legato all'id utente: al logout la lista sparisce da sola.
 */
export function useFavorites(user) {
  const [state, setState] = useState({ userId: null, list: [] });
  const userId = user?.id ?? null;

  useEffect(() => {
    if (userId == null) return;
    let active = true;
    api.get('/user/favorites')
      .then(({ data }) => active && setState({ userId, list: data }))
      .catch(() => active && setState({ userId, list: [] }));
    return () => { active = false; };
  }, [userId]);

  const loaded = userId != null && state.userId === userId;
  const favorites = useMemo(() => (loaded ? state.list : []), [loaded, state.list]);

  /** Ritorna { added: boolean } oppure lancia { code } in caso di errore. */
  const toggle = useCallback(async (city) => {
    const existing = favorites.find((f) => sameCity(f, city));
    const exists = Boolean(existing);
    try {
      const { data } = exists
        ? await api.delete('/user/favorites', { params: { city: existing } })
        : await api.post('/user/favorites', { city });
      // La risposta del server è la lista aggiornata dell'utente del token.
      setState((prev) => ({ ...prev, list: data }));
      return { added: !exists };
    } catch (error) {
      throw { code: errorCode(error) };
    }
  }, [favorites]);

  const isFavorite = useCallback((city) => favorites.some((f) => sameCity(f, city)), [favorites]);

  return { favorites, loaded, toggle, isFavorite };
}
