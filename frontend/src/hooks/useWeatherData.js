import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorCode, isCanceled } from '../api/client';

const STALE_AFTER_MS = 10 * 60 * 1000;

/**
 * Carica meteo attuale, previsioni e qualità dell'aria per una città
 * ({ city: "Roma,IT" }) o per coordinate ({ lat, lon }).
 *
 * - Una nuova ricerca annulla quella ancora in corso: nessun risultato vecchio
 *   può sovrascrivere quello nuovo.
 * - Previsioni e qualità dell'aria partono in parallelo dalle coordinate del meteo.
 * - Al cambio lingua e al ritorno sulla scheda dopo 10 minuti i dati si aggiornano.
 */
export function useWeatherData(lang) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null });
  const controllerRef = useRef(null);
  const queryRef = useRef(null);

  const load = useCallback(async (query) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    queryRef.current = query;
    const { signal } = controller;

    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const params = query.city ? { city: query.city, lang } : { lat: query.lat, lon: query.lon, lang };
      const { data: weather } = await api.get('/weather', { params, signal });
      const coords = { lat: weather.coord.lat, lon: weather.coord.lon };

      const [forecast, air] = await Promise.allSettled([
        api.get('/forecast', { params: coords, signal }),
        api.get('/air-quality', { params: coords, signal }),
      ]);
      if (forecast.status === 'rejected') throw forecast.reason;

      setState({
        status: 'success',
        error: null,
        data: {
          weather,
          forecast: forecast.value.data,
          air: air.status === 'fulfilled' ? air.value.data : null,
          loadedAt: Date.now(),
        },
      });
      return weather;
    } catch (error) {
      if (isCanceled(error) || signal.aborted) return null;
      setState((prev) => ({ ...prev, status: 'error', error: errorCode(error) }));
      return null;
    }
  }, [lang]);

  // Lingua cambiata: le descrizioni di OpenWeatherMap vanno richieste di nuovo.
  const langRef = useRef(lang);
  useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;
    if (queryRef.current) load(queryRef.current);
  }, [lang, load]);

  // Scheda tornata visibile con dati vecchi: aggiorna in silenzio.
  const loadedAt = state.data?.loadedAt;
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && queryRef.current && loadedAt
          && Date.now() - loadedAt > STALE_AFTER_MS) {
        load(queryRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load, loadedAt]);

  const retry = useCallback(() => {
    if (queryRef.current) load(queryRef.current);
  }, [load]);

  return { ...state, load, retry };
}
