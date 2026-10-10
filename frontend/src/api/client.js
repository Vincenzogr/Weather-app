import axios from 'axios';
import { storage } from '../utils/storage';

const TOKEN_KEY = 'meteo.token';

export const tokenStore = {
  get: () => storage.get(TOKEN_KEY, null),
  set: (token) => storage.set(TOKEN_KEY, token),
  clear: () => storage.remove(TOKEN_KEY),
};

export const api = axios.create({ baseURL: '/api', timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let unauthorizedHandler = null;

/** Chiamato quando il server rifiuta un token salvato (scaduto o revocato). */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && tokenStore.get() && !url.startsWith('/auth/login')) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

/**
 * Codice d'errore stabile, usato come chiave di traduzione (errors.<CODE>).
 * Il backend restituisce { status, code, error, fields }.
 */
export function errorCode(error) {
  if (axios.isCancel(error)) return 'CANCELED';
  if (error?.response?.data?.code) return error.response.data.code;
  if (error?.code === 'ECONNABORTED') return 'UPSTREAM_UNAVAILABLE';
  if (!error?.response) return 'NETWORK_ERROR';
  return 'INTERNAL_ERROR';
}

export const isCanceled = (error) => axios.isCancel(error);
