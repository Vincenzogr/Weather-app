import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatSpeed, mpsToKmh, getWindDirection, getUVColor } from '../utils/weatherHelpers';

// Calcola il punto di rugiada (formula Magnus)
function calcDewPoint(tempC, humidity) {
  const a = 17.27, b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}

// AQI Gauge circolare SVG
function AqiGauge({ value, color }) {
  const r = 22, circ = 2 * Math.PI * r;
  const pct = Math.min(value / 100, 1);
  const dash = pct * circ;
  return (
    <div className="aqi-gauge-wrap">
      <svg className="aqi-gauge-svg" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.25,0.46,0.45,0.94)' }}
        />
      </svg>
      <span className="aqi-gauge-text">{Math.round(value)}</span>
    </div>
  );
}

// Bussola SVG animata
function CompassRose({ deg }) {
  return (
    <div className="compass-wrapper">
      <svg className="compass-svg" viewBox="0 0 52 52">
        {/* Cerchio esterno */}
        <circle cx="26" cy="26" r="24" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        {/* Segni cardinali */}
        {[['N',26,6],['S',26,46],['E',46,28],['O',6,28]].map(([l,x,y]) => (
          <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.35)" fontSize="7" fontWeight="700" fontFamily="Inter,sans-serif">{l}</text>
        ))}
        {/* Freccia */}
        <g style={{ transformOrigin: '26px 26px', transform: `rotate(${deg}deg)`, transition: 'transform 1s cubic-bezier(0.25,0.46,0.45,0.94)' }}>
          <polygon points="26,8 22,26 26,23 30,26" fill="#38bdf8" />
          <polygon points="26,44 22,26 26,29 30,26" fill="rgba(255,255,255,0.25)" />
        </g>
        <circle cx="26" cy="26" r="3" fill="#38bdf8" />
      </svg>
    </div>
  );
}

export default function MeteoGrid({ weather, forecast, airQuality, unit = 'C' }) {
  const { t } = useTranslation();
  if (!weather) return null;

  const temp       = weather.main?.temp ?? 0;
  const humidity   = weather.main?.humidity ?? 0;
  const pressure   = weather.main?.pressure ?? 1013;
  const visibility = (weather.visibility ?? 0) / 1000;
  const windSpeed  = weather.wind?.speed ?? 0;
  const windDeg    = weather.wind?.deg ?? 0;
  const windDir    = getWindDirection(windDeg);
  const dewPoint   = calcDewPoint(temp, humidity);
  const uvValue    = forecast?.daily?.uv_index_max?.[0];
  const uvColor    = getUVColor(uvValue);
  const rainProb   = forecast?.daily?.precipitation_probability_max?.[0] ?? 0;
  const rainMm     = forecast?.daily?.precipitation_sum?.[0] ?? 0;

  const aqi     = airQuality?.current?.european_aqi;
  let aqiColor  = '#22c55e';
  if (aqi > 20) aqiColor = '#eab308';
  if (aqi > 40) aqiColor = '#f97316';
  if (aqi > 60) aqiColor = '#ef4444';
  if (aqi > 80) aqiColor = '#7f1d1d';

  const pressureTrend = pressure >= 1013 ? 'high' : 'low';

  const cards = [
    {
      id: 'wind',
      label: t('wind', 'Vento'),
      iconBg: 'rgba(56,189,248,0.12)',
      value: formatSpeed(windSpeed, unit),
      sub: windDir,
      visual: <CompassRose deg={windDeg} />,
    },
    {
      id: 'humidity',
      label: t('humidity', 'Umidità'),
      iconBg: 'rgba(56,189,248,0.12)',
      icon: '💧',
      value: `${humidity}%`,
      bar: { pct: humidity / 100, color: '#38bdf8' },
    },
    {
      id: 'pressure',
      label: t('pressure', 'Pressione'),
      iconBg: pressureTrend === 'high' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
      icon: '🔵',
      value: `${pressure}`,
      sub: 'hPa',
      badge: (
        <span className={`pressure-trend ${pressureTrend}`}>
          {pressureTrend === 'high' ? '↑ Alta' : '↓ Bassa'}
        </span>
      ),
    },
    {
      id: 'visibility',
      label: t('visibility', 'Visibilità'),
      iconBg: 'rgba(129,140,248,0.12)',
      icon: '👁',
      value: `${visibility.toFixed(1)} km`,
      bar: { pct: Math.min(visibility / 10, 1), color: '#818cf8' },
    },
    {
      id: 'dewpoint',
      label: t('dew_point', 'Punto Rugiada'),
      iconBg: 'rgba(52,211,153,0.12)',
      icon: '🌡',
      value: `${dewPoint.toFixed(1)}°`,
      sub: 'condensazione',
    },
    {
      id: 'rain',
      label: t('precipitation', 'Precipitazioni'),
      iconBg: 'rgba(99,102,241,0.12)',
      icon: '🌧',
      value: `${rainProb}%`,
      sub: rainMm > 0 ? `${rainMm.toFixed(1)} mm` : t('no_rain', 'Nessuna'),
      bar: { pct: rainProb / 100, color: '#6366f1' },
    },
    uvValue != null ? {
      id: 'uv',
      label: t('uv_index', 'Indice UV'),
      iconBg: 'rgba(251,191,36,0.12)',
      icon: '☀️',
      value: uvValue.toFixed(1),
      bar: { pct: Math.min(uvValue / 11, 1), color: uvColor, rainbow: true },
    } : null,
    aqi != null ? {
      id: 'aqi',
      label: t('aqi_title', 'Qualità Aria'),
      iconBg: `${aqiColor}20`,
      visual: <AqiGauge value={aqi} color={aqiColor} />,
      value: null,
    } : null,
  ].filter(Boolean);

  return (
    <div className="meteo-grid">
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          className="meteo-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {card.visual ? (
              card.visual
            ) : (
              <div className="meteo-card-icon" style={{ background: card.iconBg }}>
                <span style={{ fontSize: '1rem' }}>{card.icon}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span className="meteo-card-label">{card.label}</span>
              {card.value != null && (
                <span className="meteo-card-value">{card.value}</span>
              )}
              {card.sub && <span className="meteo-card-sub">{card.sub}</span>}
              {card.badge && card.badge}
            </div>
          </div>

          {card.bar && (
            <div className="meteo-bar-track">
              <div
                className="meteo-bar-fill"
                style={{
                  width: `${card.bar.pct * 100}%`,
                  background: card.bar.rainbow
                    ? 'linear-gradient(90deg, #22c55e, #facc15, #f97316, #ef4444, #a855f7)'
                    : card.bar.color,
                }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
