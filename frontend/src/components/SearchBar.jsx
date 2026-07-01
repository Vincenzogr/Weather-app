import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import axios from 'axios';

export default function SearchBar({ onSearch }) {
  const [cityInput,   setCityInput]   = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused,   setIsFocused]   = useState(false);
  const inputRef = useRef(null);

  // Debounced autocomplete
  useEffect(() => {
    const delay = setTimeout(() => {
      if (cityInput.trim().length > 2) {
        axios
          .get(`/api/coordinates?city=${encodeURIComponent(cityInput.trim())}`)
          .then(res => setSuggestions(res.data.results || []))
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 450);
    return () => clearTimeout(delay);
  }, [cityInput]);

  const handleSubmit = (cityQuery, displayName) => {
    const city = (cityQuery || cityInput).trim();
    if (!city) return;
    // Show just the city name in the input (without country code)
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

  return (
    <div className="search-section">
      <div className="search-container">
        <div className="search-wrapper">
          {/* Left icon */}
          <Search size={18} className="search-icon-left" />

          <input
            ref={inputRef}
            id="city-search-input"
            type="text"
            className="search-input"
            placeholder="Cerca una città..."
            value={cityInput}
            aria-label="Cerca una città"
            autoComplete="off"
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
          />

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && isFocused && (
              <motion.div
                className="autocomplete-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                {suggestions.slice(0, 6).map((s) => (
                  <div
                    key={`${s.id ?? s.name}-${s.latitude}`}
                    className="suggestion-item"
                    role="option"
                    onMouseDown={() => {
                      // Pass "Roma,IT" to OWM for disambiguation (use country_code, not country)
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
          aria-label="Cerca meteo"
        >
          <Search size={16} />
          Cerca
        </button>
      </div>
    </div>
  );
}
