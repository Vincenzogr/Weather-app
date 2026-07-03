import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Thermometer, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { useWeatherData }   from './hooks/useWeatherData';
import SearchBar            from './components/SearchBar';
import RecentCities         from './components/RecentCities';
import WeatherCard          from './components/WeatherCard';
import ForecastStrip        from './components/ForecastStrip';
import HourlyChart          from './components/HourlyChart';
import GeoPanel             from './components/GeoPanel';
import LocalPanel           from './components/LocalPanel';
import SettingsMenu         from './components/SettingsMenu';
import AuthModal            from './components/AuthModal';
import SkeletonLoader       from './components/SkeletonLoader';
import SunArcWidget         from './components/SunArcWidget';
import WeatherTips          from './components/WeatherTips';

// ── Persistent recent cities ──────────────────────────────────────
function useRecentCities() {
  const [recentCities, setRecentCities] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentCities') ?? '[]'); }
    catch { return []; }
  });

  const addCity = useCallback((city) => {
    setRecentCities(prev => {
      const updated = [city, ...prev.filter(c => c !== city)].slice(0, 5);
      localStorage.setItem('recentCities', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return [recentCities, addCity];
}

// ── Favorites hook ────────────────────────────────────────────────
function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favoriteCities') ?? '[]'); }
    catch { return []; }
  });

  const toggleFavorite = useCallback((city) => {
    setFavorites(prev => {
      const exists = prev.includes(city);
      const updated = exists ? prev.filter(c => c !== city) : [city, ...prev].slice(0, 10);
      localStorage.setItem('favoriteCities', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return [favorites, toggleFavorite];
}

// ── Dynamic background ────────────────────────────────────────────────────────────
function useDynamicBackground(weather, isLightMode) {
  useEffect(() => {
    if (!weather) return;
    const desc = (weather.weather?.[0]?.description ?? '').toLowerCase();
    let query = 'clear sky';
    if (desc.includes('pioggia') || desc.includes('rovesci') || desc.includes('pioviggine')) query = 'rain';
    else if (desc.includes('neve'))                query = 'snow winter';
    else if (desc.includes('temporale'))           query = 'thunderstorm lightning';
    else if (desc.includes('nebbia'))              query = 'fog mist atmospheric';
    else if (desc.includes('nuvoloso') || desc.includes('coperto')) query = 'cloudy overcast';

    query += isLightMode ? ' day nature' : ' night city lights';

    axios.get(`/api/background?query=${encodeURIComponent(query)}`)
      .then(res => {
        const photos = res.data?.photos;
        if (photos && photos.length > 0) {
          const idx = Math.floor(Math.random() * Math.min(3, photos.length));
          document.body.style.backgroundImage = `url('${photos[idx].src.landscape}')`;
        }
      })
      .catch(() => {
        document.body.style.backgroundImage = '';
      });
  }, [weather, isLightMode]);
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const { t, i18n } = useTranslation();
  const { weather, forecast, airQuality, loading, error, handleSearch } = useWeatherData();
  const [recentCities, addCity] = useRecentCities();
  const [favorites, toggleFavorite] = useFavorites();

  const [selectedDay, setSelectedDay] = useState(0);
  const [isLightMode, setIsLightMode] = useState(false);
  const [unit,        setUnit]        = useState('C');
  const [owmKey,      setOwmKey]      = useState('');

  // Fake Auth State
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fetch OWM key for map tiles
  useEffect(() => {
    axios.get('/api/config')
      .then(res => setOwmKey(res.data?.owmApiKey ?? ''))
      .catch(() => {});
  }, []);

  // Theme class
  useEffect(() => {
    document.body.classList.toggle('light-mode', isLightMode);
  }, [isLightMode]);

  // Dynamic background
  useDynamicBackground(weather, isLightMode);

  // Update document title
  useEffect(() => {
    if (weather) {
      document.title = `${Math.round(weather.main?.temp)}° ${weather.name} — Meteo App`;
    } else {
      document.title = '🌦️ Meteo App — Previsioni in Tempo Reale';
    }
  }, [weather]);

  // Reset selected day on new city
  useEffect(() => { setSelectedDay(0); }, [weather]);

  const onSearch = useCallback(async (city) => {
    const canonical = await handleSearch(city);
    if (canonical) addCity(canonical);
  }, [handleSearch, addCity]);

  const isFavorite = weather ? favorites.includes(weather.name) : false;

  const showResults = weather && forecast && !loading;

  return (
    <div className="app-container">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="top-bar">
        <div className="top-bar-controls">
          <SettingsMenu 
            isLightMode={isLightMode} 
            setIsLightMode={setIsLightMode} 
            unit={unit} 
            setUnit={setUnit} 
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={() => setUser(null)}
          />
        </div>

        <header className="app-header">
          <h1 className="app-title">🌦 {t('app_title')}</h1>
          <p className="app-subtitle">{t('app_subtitle')}</p>
        </header>

        <div></div>
      </div>

      {/* ── Search (with GPS integrated) ─────────────────────────── */}
      <SearchBar onSearch={onSearch} />

      {/* ── Favorites bar ────────────────────────────────────────── */}
      {favorites.length > 0 && (
        <div className="favorites-bar">
          <span className="favorites-label">⭐ {t('favorites', 'Preferiti')}</span>
          {favorites.map(city => (
            <button key={city} className="favorite-chip" onClick={() => onSearch(city)}>
              ⭐ {city}
            </button>
          ))}
        </div>
      )}

      {/* ── Recent cities ────────────────────────────────────────── */}
      <RecentCities cities={recentCities} onSelect={onSearch} />

      {/* ── Error ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-message"
            role="alert"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AlertTriangle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skeleton loading ─────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SkeletonLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Weather results ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {showResults && (
          <motion.div
            key={weather.id}
            className="weather-layout"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Left — Geographic info & Sun Arc */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <GeoPanel weather={weather} forecast={forecast} airQuality={airQuality} />
              <SunArcWidget weather={weather} />
            </div>

            {/* Center — Main data */}
            <div className="center-panel">
              <WeatherCard
                weather={weather}
                forecast={forecast}
                unit={unit}
                isFavorite={isFavorite}
                onToggleFavorite={() => toggleFavorite(weather.name)}
              />
              <WeatherTips weather={weather} forecast={forecast} airQuality={airQuality} />
              <ForecastStrip
                forecast={forecast}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                unit={unit}
              />
              <HourlyChart
                forecast={forecast}
                selectedDay={selectedDay}
                unit={unit}
              />
            </div>

            {/* Right — Local info + radar */}
            <div>
              <LocalPanel weather={weather} owmKey={owmKey} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={(userData) => {
          setUser(userData);
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
}
