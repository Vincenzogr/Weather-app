import { useCallback, useRef, useState } from 'react';
import { CircleAlert, Check, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToastContext } from './ToastContext';

const ICONS = { info: Info, success: Check, error: CircleAlert };

export function ToastProvider({ children }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, { tone = 'info', duration = 4200 } = {}) => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { id, message, tone }]);
    window.setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map(({ id, message, tone }) => {
          const Icon = ICONS[tone] ?? Info;
          return (
            <div key={id} className={`toast toast--${tone}`}>
              <Icon size={18} aria-hidden="true" />
              <span>{message}</span>
              <button type="button" className="icon-button icon-button--small" onClick={() => dismiss(id)}
                aria-label={t('close')}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
