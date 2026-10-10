import { useCallback, useState } from 'react';
import { storage } from '../utils/storage';

/** useState che ricorda il valore tra una visita e l'altra. */
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => storage.get(key, initialValue));

  const update = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      storage.set(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, update];
}
