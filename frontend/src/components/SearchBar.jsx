import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, LocateFixed } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ onSearch, onGeolocate }) {
  const { t, i18n } = useTranslation();
  const [cityInput,   setCityInput]   = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused,   setIsFocused]   = useState(false);
  const [isLocating,  setIsLocating]  = useState(false);
  const inputRef = useRef(null);

  // Debounced autocomplete
  useEffect(() => {
    const delay = setTimeout(() => {
      if (cityInput.trim().length > 2) {
        axios
          .get(`/api/coordinates?city=${encodeURIComponent(cityInput.trim())}&lang=${i18n.language || 'it'}`)
          .then(res => setSuggestions(res.data.results || []))
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 450);
    return () => clearTimeout(delay);
  }, [cityInput, i18n.language]);

  const handleSubmit = (cityQuery, displayName) => {
    const city = (cityQuery || cityInput).trim();
    if (!city) return;
    setCityInput(displayName || city.split(',')[0].trim());
    setSuggestions([]);
    onSearch(city);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
      setIsFocused(false);
    }, 200);
  };

  const handleGPS = () => {
    if (!navigator.geolocation || isLocating) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await axios.get(
            `/api/reverse-geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          if (res.data && res.data.length > 0) {
            const city = res.data[0].name;
            setCityInput(city);
            onSearch(city);
          }
        } catch {
          // silently ignore
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false),
      { timeout: 10000 }
    );
  };

  return (
    <div className="search-section">
      <div className="search-container">
        <div className="search-wrapper">
          {/* Left search icon */}
          <Search size={18} className="search-icon-left" />

          <input
            ref={inputRef}
            id="city-search-input"
            type="text"
            className="search-input"
            placeholder={t('search_placeholder')}
            value={cityInput}
            aria-label={t('search_placeholder')}
            autoComplete="off"
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
          />

          {/* GPS button */}
          <button
            className={`gps-btn${isLocating ? ' locating' : ''}`}
            onClick={handleGPS}
            aria-label={t('geolocate', 'Usa posizione GPS')}
            title={t('geolocate', 'Usa posizione GPS')}
            type="button"
          >
            <LocateFixed size={16} />
          </button>

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && isFocused && (
              <motion.div
                className="autocomplete-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                role="listbox"
              >
                {suggestions.slice(0, 6).map((s) => (
                  <div
                    key={`${s.id ?? s.name}-${s.latitude}`}
                    className="suggestion-item"
                    role="option"
                    onMouseDown={() => {
                      const code = s.country_code ?? s.countryCode ?? '';
                      const query = code ? `${s.name},${code}` : s.name;
                      handleSubmit(query, s.name);
                    }}
                  >
                    <MapPin size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <div>
                      <span className="suggestion-item-name">{s.name}</span>
                      <span className="suggestion-item-detail">
                        {' '}— {[s.admin1, s.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          id="city-search-button"
          className="search-button"
          onClick={() => handleSubmit()}
          aria-label={t('search_placeholder')}
        >
          <Search size={16} />
        </button>
      </div>
    </div>
  );
}
