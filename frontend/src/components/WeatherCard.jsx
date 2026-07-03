import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Droplets, Wind, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WeatherIcon from './WeatherIcon';
import { owmToCategory, formatTemp, formatTempShort, formatSpeed, getWindDirection, getFormattedDate } from '../utils/weatherHelpers';

export default function WeatherCard({ weather, unit = 'C' }) {
  const { t, i18n } = useTranslation();
  if (!weather) return null;

  const category = owmToCategory(weather);
  const windDeg  = weather.wind?.deg ?? 0;
  const windDir  = getWindDirection(windDeg);

  return (
    <motion.div
      className="glass-panel current-weather"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* City name */}
      <div className="city-name">
        <MapPin size={18} />
        <h2>{weather.name}, {weather.sys?.country}</h2>
      </div>

      {/* Date */}
      <p className="current-date">{getFormattedDate(i18n.language)}</p>

      {/* Animated weather icon */}
      <div className="weather-icon-container">
        <WeatherIcon category={category} size={96} />
      </div>

      {/* Temperature */}
      <div className="temperature-display">
        {formatTempShort(weather.main.temp, unit)}
      </div>

      {/* Feels like */}
      <p className="feels-like">
        {t('feels_like')} {formatTempShort(weather.main.feels_like, unit)}
      </p>

      {/* Description */}
      <p className="weather-description">
        {weather.weather?.[0]?.description}
      </p>

      {/* Quick stats */}
      <div className="weather-quick-stats">
        {/* Humidity */}
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <Droplets size={22} color="#38bdf8" />
          </div>
          <p className="quick-stat-label">{t('humidity')}</p>
          <p className="quick-stat-value">{weather.main.humidity}%</p>
        </div>

        {/* Wind */}
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <Wind size={22} color="#a78bfa" />
          </div>
          <p className="quick-stat-label">{t('wind')}</p>
          <p className="quick-stat-value">
            {formatSpeed(weather.wind?.speed ?? 0, unit)}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>
              {windDir}
            </span>
          </p>
        </div>

        {/* Visibility */}
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <Eye size={22} color="#34d399" />
          </div>
          <p className="quick-stat-label">{t('visibility')}</p>
          <p className="quick-stat-value">
            {((weather.visibility ?? 0) / 1000).toFixed(1)} km
          </p>
        </div>
      </div>
    </motion.div>
  );
}
