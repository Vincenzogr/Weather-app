import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDayName, formatTempShort, getWeatherCodeInfo } from '../utils/weatherHelpers';

export default function ForecastStrip({ forecast, selectedDay, onSelectDay, unit = 'C' }) {
  const { t, i18n } = useTranslation();
  if (!forecast) return null;

  const stripRef    = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX,    setStartX]     = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - stripRef.current.offsetLeft);
    setScrollLeft(stripRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp    = () => setIsDragging(false);
  const handleMouseMove  = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - stripRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    stripRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      className="glass-panel"
      style={{ padding: '16px' }}
    >
      <div
        className="forecast-strip"
        ref={stripRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        role="listbox"
        aria-label="Previsioni settimanali"
      >
        {forecast.daily.time.map((date, i) => {
          const code = forecast.daily.weathercode?.[i] ?? 0;
          const { emoji } = getWeatherCodeInfo(code);
          const rainProb = forecast.daily.precipitation_probability_max?.[i];
          const isToday  = i === 0;

          return (
            <motion.div
              key={date}
              className={`forecast-day ${selectedDay === i ? 'active' : ''}`}
              onClick={() => onSelectDay(i)}
              role="option"
              aria-selected={selectedDay === i}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <span className="forecast-day-name">
                {isToday ? t('today') : getDayName(date, i18n.language)}
              </span>
              <span className="forecast-day-icon" aria-label={emoji}>{emoji}</span>
              <span className="forecast-temp-max">
                {formatTempShort(forecast.daily.temperature_2m_max[i], unit)}
              </span>
              <span className="forecast-temp-min">
                {formatTempShort(forecast.daily.temperature_2m_min[i], unit)}
              </span>
              {rainProb != null && rainProb > 0 && (
                <span className="forecast-rain-prob">
                  <Droplets size={10} />
                  {rainProb}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
