import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Thermometer, AlertTriangle } from 'lucide-react';
import axios from 'axios';

import { useWeatherData } from './hooks/useWeatherData';
import SearchBar       from './components/SearchBar';
import RecentCities    from './components/RecentCities';
import WeatherCard     from './components/WeatherCard';
import ForecastStrip   from './components/ForecastStrip';
import HourlyChart     from './components/HourlyChart';
import GeoPanel        from './components/GeoPanel';
import LocalPanel      from './components/LocalPanel';
import SkeletonLoader  from './components/SkeletonLoader';

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

// ── Dynamic background ────────────────────────────────────────────
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
  const { weather, forecast, loading, error, handleSearch } = useWeatherData();
  const [recentCities, addCity] = useRecentCities();

  const [selectedDay,  setSelectedDay]  = useState(0);
  const [isLightMode,  setIsLightMode]  = useState(false);
  const [unit,         setUnit]         = useState('C'); // 'C' | 'F'
  const [owmKey,       setOwmKey]       = useState('');

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

  // Update document title dynamically
  useEffect(() => {
    if (weather) {
      document.title = `${Math.round(weather.main?.temp)}° ${weather.name} — Meteo App`;
    } else {
      document.title = '🌦️ Meteo App — Previsioni in Tempo Reale';
    }
  }, [weather]);

  // Reset selected day when new city loads
  useEffect(() => {
    setSelectedDay(0);
  }, [weather]);

  const onSearch = useCallback(async (city) => {
    const canonical = await handleSearch(city);
    if (canonical) addCity(canonical);
  }, [handleSearch, addCity]);

  // Geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await axios.get(
          `/api/reverse-geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        );
        if (res.data && res.data.length > 0) {
          onSearch(res.data[0].name);
        }
      } catch {
        // silently ignore
      }
    }, () => {/* user denied or unavailable */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showResults = weather && forecast && !loading;

  return (
    <div className="app-container">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="top-bar">
        {/* Controls left */}
        <div className="top-bar-controls">
          <button
            id="theme-toggle"
            className="control-btn"
            onClick={() => setIsLightMode(v => !v)}
            aria-label={isLightMode ? 'Passa al tema scuro' : 'Passa al tema chiaro'}
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
            {isLightMode ? 'Scuro' : 'Chiaro'}
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

        {/* Header center */}
        <header className="app-header">
          <h1 className="app-title">🌦 Meteo App</h1>
          <p className="app-subtitle">Previsioni in tempo reale per tutto il mondo</p>
        </header>

        {/* Spacer right */}
        <div style={{ width: 140 }} />
      </div>

      {/* ── Search ───────────────────────────────────────────────── */}
      <SearchBar onSearch={onSearch} />

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
            {/* Left — Geographic info */}
            <GeoPanel weather={weather} forecast={forecast} />

            {/* Center — Main data */}
            <div className="center-panel">
              <WeatherCard  weather={weather} unit={unit} />
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
            <LocalPanel weather={weather} owmKey={owmKey} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
