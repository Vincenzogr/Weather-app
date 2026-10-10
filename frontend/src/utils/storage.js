/**
 * localStorage con fallback silenzioso: in navigazione privata o con
 * storage bloccato l'app continua a funzionare, solo senza memoria.
 */
export const storage = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage non disponibile */
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* storage non disponibile */
    }
  },
};
