import { createContext, useContext } from 'react';

export const ToastContext = createContext(() => {});

/** notify(message, { tone: 'info' | 'success' | 'error' }) */
export function useToast() {
  return useContext(ToastContext);
}
