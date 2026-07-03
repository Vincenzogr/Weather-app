import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Sun, Moon, Thermometer, User as UserIcon, LogOut, LogIn } from 'lucide-react';

const languages = [
  { code: 'it', label: 'IT', flag: 'https://flagcdn.com/w20/it.png' },
  { code: 'en', label: 'EN', flag: 'https://flagcdn.com/w20/gb.png' },
  { code: 'fr', label: 'FR', flag: 'https://flagcdn.com/w20/fr.png' },
  { code: 'de', label: 'DE', flag: 'https://flagcdn.com/w20/de.png' },
  { code: 'es', label: 'ES', flag: 'https://flagcdn.com/w20/es.png' },
  { code: 'ja', label: 'JA', flag: 'https://flagcdn.com/w20/jp.png' }
];

export default function SettingsMenu({ isLightMode, setIsLightMode, unit, setUnit, user, onOpenAuth, onLogout }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button 
        className="control-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Impostazioni"
        style={{ padding: '10px 14px' }}
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: '8px',
          background: 'var(--glass-bg)', borderRadius: '12px', padding: '14px',
          boxShadow: 'var(--glass-shadow)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px',
          border: '1px solid var(--glass-border)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
          minWidth: '240px'
        }}>
          {/* User Section */}
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <UserIcon size={18} color="var(--accent)" />
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{user.name}</span>
              </div>
              <button
                className="control-btn"
                style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#fca5a5' }}
                onClick={() => { onLogout(); setIsOpen(false); }}
              >
                <LogOut size={16} />
                {t('logout', 'Esci')}
              </button>
            </div>
          ) : (
            <button
              className="control-btn"
              style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--accent)', border: 'none', color: '#fff' }}
              onClick={() => { onOpenAuth(); setIsOpen(false); }}
            >
              <LogIn size={16} />
              {t('login_register', 'Accedi / Registrati')}
            </button>
          )}

          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }}></div>

          {/* Theme Toggle */}
          <button
            className="control-btn"
            style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
            onClick={() => { setIsLightMode(v => !v); setIsOpen(false); }}
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
            {isLightMode ? t('theme_dark', 'Tema Scuro') : t('theme_light', 'Tema Chiaro')}
          </button>

          {/* Unit Toggle */}
          <button
            className="control-btn"
            style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
            onClick={() => { setUnit(u => u === 'C' ? 'F' : 'C'); setIsOpen(false); }}
          >
            <Thermometer size={16} />
            °{unit === 'C' ? 'F' : 'C'} ({unit === 'C' ? t('switch_to_f', 'Passa a Fahrenheit') : t('switch_to_c', 'Passa a Celsius')})
          </button>
          
          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }}></div>

          {/* Languages */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', paddingLeft: '4px', fontWeight: 600 }}>
            {t('language', 'Lingua')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setIsOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                  background: i18n.language === lang.code ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)', 
                  border: i18n.language === lang.code ? '1px solid rgba(56,189,248,0.4)' : '1px solid var(--glass-border)',
                  color: i18n.language === lang.code ? 'var(--accent)' : 'var(--text-primary)',
                  cursor: 'pointer', borderRadius: '8px', width: '100%', textAlign: 'left',
                  fontWeight: i18n.language === lang.code ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { if(i18n.language !== lang.code) e.currentTarget.style.background = 'var(--glass-bg-hover)' }}
                onMouseLeave={(e) => { if(i18n.language !== lang.code) e.currentTarget.style.background = 'var(--bg-secondary)' }}
              >
                <img src={lang.flag} alt={lang.label} width="16" style={{ borderRadius: '2px' }} />
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
