import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Eye, EyeOff, LoaderCircle, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { errorCode } from '../api/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Accesso e registrazione in un <dialog> nativo: focus intrappolato,
 * Esc per chiudere e ritorno del focus al pulsante che l'ha aperto.
 */
export default function AuthDialog({ open, reason, onClose, onSuccess }) {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const dialogRef = useRef(null);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const ids = { title: useId(), name: useId(), email: useId(), password: useId() };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const reset = () => {
    setForm({ name: '', email: '', password: '' });
    setErrors({});
    setFormError('');
    setShowPassword(false);
    setSubmitting(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const update = (field) => (event) => {
    setForm((f) => ({ ...f, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (mode === 'register' && form.name.trim().length < 2) next.name = t('auth_error_name');
    if (!EMAIL_RE.test(form.email.trim())) next.email = t('auth_error_email');
    if (form.password.length < 8) next.password = t('auth_error_password');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = mode === 'login'
        ? await login(form.email.trim(), form.password)
        : await register(form.name.trim(), form.email.trim(), form.password);
      reset();
      onSuccess(user, mode);
    } catch (error) {
      const code = errorCode(error);
      const fields = error?.response?.data?.fields;
      if (fields) {
        setErrors({
          name: fields.name && t('auth_error_name'),
          email: fields.email && t('auth_error_email'),
          password: fields.password && t('auth_error_password'),
        });
      }
      setFormError(t(`errors.${code}`, { defaultValue: t('errors.INTERNAL_ERROR') }));
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setErrors({});
    setFormError('');
  };

  const isLogin = mode === 'login';

  return (
    <dialog
      ref={dialogRef}
      className="auth"
      aria-labelledby={ids.title}
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClick={(event) => { if (event.target === dialogRef.current) close(); }}
    >
      <form className="auth__body" onSubmit={submit} noValidate>
        <div className="auth__head">
          <h2 id={ids.title} className="auth__title">{isLogin ? t('auth_login_title') : t('auth_register_title')}</h2>
          <button type="button" className="icon-button" onClick={close} aria-label={t('close')}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="auth__lead">{reason === 'favorite' ? t('auth_reason_favorite') : t('auth_lead')}</p>

        {formError && (
          <p className="auth__error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            {formError}
          </p>
        )}

        {!isLogin && (
          <div className="field">
            <label htmlFor={ids.name} className="field__label">{t('auth_name')}</label>
            <input id={ids.name} className="input" type="text" autoComplete="name" value={form.name}
              onChange={update('name')} aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${ids.name}-err` : undefined} />
            {errors.name && <p id={`${ids.name}-err`} className="field__error">{errors.name}</p>}
          </div>
        )}

        <div className="field">
          <label htmlFor={ids.email} className="field__label">{t('auth_email')}</label>
          <input id={ids.email} className="input" type="email" autoComplete="email" inputMode="email"
            value={form.email} onChange={update('email')} aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${ids.email}-err` : undefined} />
          {errors.email && <p id={`${ids.email}-err`} className="field__error">{errors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor={ids.password} className="field__label">{t('auth_password')}</label>
          <div className="input-wrap">
            <input id={ids.password} className="input" type={showPassword ? 'text' : 'password'}
              autoComplete={isLogin ? 'current-password' : 'new-password'} value={form.password}
              onChange={update('password')} aria-invalid={Boolean(errors.password)}
              aria-describedby={`${ids.password}-hint${errors.password ? ` ${ids.password}-err` : ''}`} />
            <button type="button" className="icon-button input-wrap__action" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t('password_hide') : t('password_show')} aria-pressed={showPassword}>
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          <p id={`${ids.password}-hint`} className="field__hint">{t('auth_password_hint')}</p>
          {errors.password && <p id={`${ids.password}-err`} className="field__error">{errors.password}</p>}
        </div>

        <button type="submit" className="button button--primary button--block" disabled={submitting}>
          {submitting && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
          {isLogin ? t('auth_login_btn') : t('auth_register_btn')}
        </button>

        <p className="auth__switch">
          {isLogin ? t('auth_no_account') : t('auth_has_account')}{' '}
          <button type="button" className="link-button" onClick={switchMode}>
            {isLogin ? t('auth_switch_register') : t('auth_switch_login')}
          </button>
        </p>
      </form>
    </dialog>
  );
}
