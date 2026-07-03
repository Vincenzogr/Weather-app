import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Wind, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDayName, formatTempShort, getWeatherCodeInfo, formatSpeed } from '../utils/weatherHelpers';

export default function ForecastStrip({ forecast, selectedDay, onSelectDay, unit = 'C' }) {
  const { t, i18n } = useTranslation();
  const [expandedDay, setExpandedDay] = useState(null);

  if (!forecast) return null;

  const handleClick = (i) => {
    onSelectDay(i);
    setExpandedDay(prev => prev === i ? null : i);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px' }}>
      <p className="panel-title" style={{ marginBottom: 12 }}>
        📅 {t('weekly_forecast', 'Previsioni Settimanali')}
      </p>
      <div className="forecast-accordion" role="list" aria-label={t('weekly_forecast', 'Previsioni settimanali')}>
        {forecast.daily.time.map((date, i) => {
          const code     = forecast.daily.weathercode?.[i] ?? 0;
          const { emoji } = getWeatherCodeInfo(code);
          const rainProb = forecast.daily.precipitation_probability_max?.[i];
          const rainMm   = forecast.daily.precipitation_sum?.[i] ?? 0;
          const windKmh  = forecast.daily.windspeed_10m_max?.[i] ?? 0;
          const humidity = forecast.daily.precipitation_hours?.[i] ?? 0;
          const isToday  = i === 0;
          const isOpen   = expandedDay === i;
          const isActive = selectedDay === i;

          return (
            <div
              key={date}
              className={`forecast-accordion-item${isActive ? ' active' : ''}`}
              role="listitem"
            >
              <motion.div
                className="forecast-accordion-header"
                onClick={() => handleClick(i)}
                whileTap={{ scale: 0.99 }}
                aria-expanded={isOpen}
              >
                <span className="forecast-acc-day">
                  {isToday ? t('today') : getDayName(date, i18n.language, true)}
                </span>
                <span className="forecast-acc-icon" aria-label={emoji}>{emoji}</span>

                <div className="forecast-acc-temps">
                  <span className="forecast-acc-max" style={{ color: '#f87171' }}>
                    {formatTempShort(forecast.daily.temperature_2m_max[i], unit)}
                  </span>
                  <span className="forecast-acc-min">
                    {formatTempShort(forecast.daily.temperature_2m_min[i], unit)}
                  </span>
                </div>

                {rainProb != null && rainProb > 0 && (
                  <span className="forecast-acc-rain">
                    <Droplets size={10} />
                    {rainProb}%
                  </span>
                )}

                <ChevronDown
                  size={16}
                  className="forecast-acc-chevron"
                  aria-hidden="true"
                />
              </motion.div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="forecast-accordion-detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="forecast-detail-grid">
                      <div className="forecast-detail-item">
                        <span className="forecast-detail-label">💨 {t('wind', 'Vento')}</span>
                        <span className="forecast-detail-value">
                          {unit === 'F' ? `${Math.round(windKmh * 0.621371)} mph` : `${Math.round(windKmh)} km/h`}
                        </span>
                      </div>
                      <div className="forecast-detail-item">
                        <span className="forecast-detail-label">💧 {t('rain', 'Pioggia')}</span>
                        <span className="forecast-detail-value">
                          {rainMm > 0 ? `${rainMm.toFixed(1)} mm` : t('no_rain', '—')}
                        </span>
                      </div>
                      <div className="forecast-detail-item">
                        <span className="forecast-detail-label">🌧 {t('rain_prob', 'Prob.')}</span>
                        <span className="forecast-detail-value">{rainProb ?? 0}%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
