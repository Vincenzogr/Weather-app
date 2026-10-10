import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, Settings2, UserRound } from 'lucide-react';

const LANGUAGES = [
  { code: 'it', name: 'Italiano' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'ja', name: '日本語' },
];


function Segmented({ label, options, value, onChange }) {
  return (
    <fieldset className="settings__group">
      <legend className="settings__label">{label}</legend>
      <div className="segmented segmented--full">
        {options.map((option) => (
          <label key={option.value} className={`segmented__option${value === option.value ? ' is-active' : ''}`}>
            <input
              type="radio"
              className="visually-hidden"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Account, tema, unità e lingua in un unico pannello. */
export default function SettingsMenu({ user, onLogin, onLogout, theme, setTheme, units, setUnits }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  const langId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="settings" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`icon-button icon-button--framed${user ? ' has-user' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('settings')}
        onClick={() => setOpen((v) => !v)}
      >
        {user ? <span className="avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
          : <Settings2 size={20} aria-hidden="true" />}
      </button>

      <div id={panelId} className={`settings__panel${open ? ' is-open' : ''}`} hidden={!open}>
        <div className="settings__account">
          {user ? (
            <>
              <div className="settings__user">
                <UserRound size={18} aria-hidden="true" />
                <div>
                  <p className="settings__name">{user.name}</p>
                  <p className="settings__email">{user.email}</p>
                </div>
              </div>
              <button type="button" className="button button--quiet" onClick={() => { onLogout(); setOpen(false); }}>
                <LogOut size={16} aria-hidden="true" />
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <p className="settings__pitch">{t('login_pitch')}</p>
              <button type="button" className="button button--primary" onClick={() => { onLogin(); setOpen(false); }}>
                <LogIn size={16} aria-hidden="true" />
                {t('login_register')}
              </button>
            </>
          )}
        </div>

        <Segmented
          label={t('theme')}
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'auto', label: t('theme_auto') },
            { value: 'light', label: t('theme_light') },
            { value: 'dark', label: t('theme_dark') },
          ]}
        />
        <p className="settings__help">{t('theme_auto_help')}</p>

        <Segmented
          label={t('units')}
          value={units}
          onChange={setUnits}
          options={[
            { value: 'metric', label: t('units_metric') },
            { value: 'imperial', label: t('units_imperial') },
          ]}
        />

        <div className="settings__group">
          <label className="settings__label" htmlFor={langId}>{t('language')}</label>
          <select
            id={langId}
            className="select"
            value={i18n.resolvedLanguage}
            onChange={(event) => i18n.changeLanguage(event.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
