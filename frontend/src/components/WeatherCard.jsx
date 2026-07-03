import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WeatherIcon from './WeatherIcon';
import { owmToCategory, formatTempShort, formatSpeed, getWindDirection, getFormattedDate } from '../utils/weatherHelpers';

export default function WeatherCard({ weather, forecast, unit = 'C', isFavorite, onToggleFavorite }) {
  const { t, i18n } = useTranslation();
  if (!weather) return null;

  const category = owmToCategory(weather);
  const windDeg  = weather.wind?.deg ?? 0;
  const windDir  = getWindDirection(windDeg);
  const tempMax  = forecast?.daily?.temperature_2m_max?.[0];
  const tempMin  = forecast?.daily?.temperature_2m_min?.[0];

  return (
    <motion.div
      className="glass-panel current-weather"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Pulsante favoriti */}
      {onToggleFavorite && (
        <button
          className={`favorite-btn${isFavorite ? ' active' : ''}`}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? t('remove_favorite', 'Rimuovi dai preferiti') : t('add_favorite', 'Aggiungi ai preferiti')}
          title={isFavorite ? t('remove_favorite', 'Rimuovi dai preferiti') : t('add_favorite', 'Aggiungi ai preferiti')}
        >
          <Star size={20} fill={isFavorite ? '#f59e0b' : 'none'} color={isFavorite ? '#f59e0b' : 'currentColor'} />
        </button>
      )}

      {/* City name */}
      <div className="city-name">
        <MapPin size={18} />
        <h2>{weather.name}, {weather.sys?.country}</h2>
      </div>

      {/* Date */}
      <p className="current-date">{getFormattedDate(i18n.language)}</p>

      {/* Animated weather icon with float */}
      <div className="weather-icon-float">
        <WeatherIcon category={category} size={110} />
      </div>

      {/* Temperature — gradient XL */}
      <div className="temp-gradient">
        {formatTempShort(weather.main.temp, unit)}
      </div>

      {/* Min / Max */}
      {tempMax != null && tempMin != null && (
        <div className="temp-minmax">
          <span className="max">↑ {formatTempShort(tempMax, unit)}</span>
          <span className="min">↓ {formatTempShort(tempMin, unit)}</span>
        </div>
      )}

      {/* Condition pill */}
      <div className="weather-condition-pill">
        {weather.weather?.[0]?.description}
      </div>

      {/* Feels like */}
      <p className="feels-like">
        {t('feels_like')} {formatTempShort(weather.main.feels_like, unit)}
      </p>

      {/* Quick stats */}
      <div className="weather-quick-stats">
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <span style={{ fontSize: '1.2rem' }}>💧</span>
          </div>
          <p className="quick-stat-label">{t('humidity')}</p>
          <p className="quick-stat-value">{weather.main.humidity}%</p>
        </div>

        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <span style={{ fontSize: '1.2rem' }}>💨</span>
          </div>
          <p className="quick-stat-label">{t('wind')}</p>
          <p className="quick-stat-value">
            {formatSpeed(weather.wind?.speed ?? 0, unit)}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 3 }}>
              {windDir}
            </span>
          </p>
        </div>

        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <span style={{ fontSize: '1.2rem' }}>👁</span>
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
