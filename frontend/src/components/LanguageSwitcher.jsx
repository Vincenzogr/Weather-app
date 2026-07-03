import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const languages = [
  { code: 'it', label: 'IT', flag: 'https://flagcdn.com/w20/it.png' },
  { code: 'en', label: 'EN', flag: 'https://flagcdn.com/w20/gb.png' },
  { code: 'fr', label: 'FR', flag: 'https://flagcdn.com/w20/fr.png' },
  { code: 'de', label: 'DE', flag: 'https://flagcdn.com/w20/de.png' },
  { code: 'es', label: 'ES', flag: 'https://flagcdn.com/w20/es.png' },
  { code: 'ja', label: 'JA', flag: 'https://flagcdn.com/w20/jp.png' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button 
        className="control-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
      >
        <img src={currentLang.flag} alt={currentLang.label} width="16" style={{ borderRadius: '2px' }} />
        {currentLang.label}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: '8px',
          background: 'var(--panel-bg)', borderRadius: '12px', padding: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '4px',
          border: '1px solid var(--border-color)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
        }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setIsOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
                background: 'transparent', border: 'none', color: 'var(--text-primary)',
                cursor: 'pointer', borderRadius: '6px', width: '100%', textAlign: 'left',
                fontWeight: currentLang.code === lang.code ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <img src={lang.flag} alt={lang.label} width="16" style={{ borderRadius: '2px' }} />
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
