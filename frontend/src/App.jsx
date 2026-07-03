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
import LanguageSwitcher     from './components/LanguageSwitcher';
import SkeletonLoader       from './components/SkeletonLoader';
import SunArcWidget         from './components/SunArcWidget';
import MeteoGrid            from './components/MeteoGrid';
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

// ── Dynamic background class based on weather ─────────────────────
function getWeatherBgClass(weather, isLightMode) {
  if (isLightMode || !weather) return '';
  const id   = weather.weather?.[0]?.id;
  const icon = weather.weather?.[0]?.icon ?? '';
  const isNight = icon.endsWith('n');

  if (!id) return '';
  if (id >= 200 && id < 300) return 'bg-storm';
  if (id >= 300 && id < 600) return 'bg-rain';
  if (id >= 600 && id < 700) return 'bg-snow';
  if (id >= 700 && id < 800) return 'bg-fog';
  if (id === 800) return isNight ? 'bg-clear-night' : 'bg-clear-day';
  if (id >= 801 && id <= 804) return isNight ? 'bg-clear-night' : 'bg-cloudy';
  return '';
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

  // Dynamic weather background class
  useEffect(() => {
    const bgClasses = ['bg-clear-day','bg-clear-night','bg-rain','bg-storm','bg-snow','bg-fog','bg-cloudy'];
    bgClasses.forEach(c => document.body.classList.remove(c));
    const cls = getWeatherBgClass(weather, isLightMode);
    if (cls) document.body.classList.add(cls);
  }, [weather, isLightMode]);

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
        <div className="top-bar-controls" style={{ display: 'flex', gap: '8px' }}>
          <LanguageSwitcher />

          <button
            id="theme-toggle"
            className="control-btn"
            onClick={() => setIsLightMode(v => !v)}
            aria-label={isLightMode ? t('theme_switch_dark') : t('theme_switch_light')}
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
            {isLightMode ? t('theme_dark') : t('theme_light')}
          </button>

          <button
            id="unit-toggle"
            className="control-btn"
            onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
            aria-label={`Passa a ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          >
            <Thermometer size={16} />
            °{unit === 'C' ? 'F' : 'C'}
          </button>
        </div>

        <header className="app-header">
          <h1 className="app-title">🌦 {t('app_title')}</h1>
          <p className="app-subtitle">{t('app_subtitle')}</p>
        </header>

        <div style={{ width: 140 }} />
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
              <MeteoGrid weather={weather} forecast={forecast} airQuality={airQuality} unit={unit} />
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

    </div>
  );
}
