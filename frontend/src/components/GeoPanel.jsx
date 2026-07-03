import React from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Sunset, Activity, Wind, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { unixToTime, getUVLabel, getUVColor } from '../utils/weatherHelpers';

function UVTip({ uv, t }) {
  if (uv == null) return null;
  let tip = '', tipColor = '';
  if (uv <= 2)  { tip = t('uv_tip_low',  '✅ Rischio basso — nessuna protezione necessaria.'); tipColor = '#22c55e'; }
  else if (uv <= 5)  { tip = t('uv_tip_mod',  '🕶️ Rischio moderato — usa crema solare SPF 30.'); tipColor = '#facc15'; }
  else if (uv <= 7)  { tip = t('uv_tip_high', '⚠️ Rischio alto — proteggi la pelle con SPF 50+.'); tipColor = '#f97316'; }
  else if (uv <= 10) { tip = t('uv_tip_vhigh','🚨 Rischio molto alto — evita l\'esposizione diretta.'); tipColor = '#ef4444'; }
  else               { tip = t('uv_tip_ext',  '⛔ Estremo — rimani al chiuso nelle ore centrali.'); tipColor = '#a855f7'; }

  return (
    <div style={{
      marginLeft: 52, marginTop: 8, padding: '8px 12px',
      background: `${tipColor}15`, border: `1px solid ${tipColor}30`,
      borderRadius: 10, fontSize: '0.75rem', color: tipColor, lineHeight: 1.4,
    }}>
      {tip}
    </div>
  );
}

export default function GeoPanel({ weather, forecast, airQuality }) {
  const { t, i18n } = useTranslation();
  if (!weather) return null;

  const uvValue = forecast?.daily?.uv_index_max?.[0];
  const uvColor = getUVColor(uvValue);

  const aqi = airQuality?.current?.european_aqi;
  const pm25 = airQuality?.current?.pm2_5;
  const no2  = airQuality?.current?.nitrogen_dioxide;

  let aqiText = t('aqi_good'), aqiColor = '#22c55e';
  if (aqi > 20) { aqiText = t('aqi_moderate'); aqiColor = '#eab308'; }
  if (aqi > 40) { aqiText = t('aqi_poor');     aqiColor = '#f97316'; }
  if (aqi > 60) { aqiText = t('aqi_bad');      aqiColor = '#ef4444'; }
  if (aqi > 80) { aqiText = t('aqi_very_bad'); aqiColor = '#7f1d1d'; }

  const pressure = weather.main?.pressure;
  const isHighPressure = (pressure ?? 1013) >= 1013;

  const rows = [
    {
      icon: <Sunrise size={20} color="#f59e0b" />,
      iconBg: 'rgba(245,158,11,0.12)',
      label: t('sunrise'),
      value: weather.sys?.sunrise ? unixToTime(weather.sys.sunrise, i18n.language) : '--:--',
    },
    {
      icon: <Sunset size={20} color="#f97316" />,
      iconBg: 'rgba(249,115,22,0.12)',
      label: t('sunset'),
      value: weather.sys?.sunset ? unixToTime(weather.sys.sunset, i18n.language) : '--:--',
    },
    {
      icon: isHighPressure
        ? <TrendingUp size={20} color="#34d399" />
        : <TrendingDown size={20} color="#f87171" />,
      iconBg: isHighPressure ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
      label: t('pressure'),
      value: `${pressure ?? '--'} hPa`,
      badge: pressure != null ? (
        <span className={`pressure-trend ${isHighPressure ? 'high' : 'low'}`}>
          {isHighPressure ? '↑ Alta' : '↓ Bassa'}
        </span>
      ) : null,
    },
  ];

  return (
    <motion.div
      className="glass-panel side-panel"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <p className="panel-title">📍 {t('geo_location')}</p>

      {rows.map((row, i) => (
        <div className="info-row" key={i}>
          <div className="info-icon-wrapper" style={{ background: row.iconBg }}>
            {row.icon}
          </div>
          <div className="info-content" style={{ flex: 1 }}>
            <h4>{row.label}</h4>
            <p>{row.value}</p>
          </div>
          {row.badge && row.badge}
        </div>
      ))}

      {/* UV Index with bar + tip */}
      {uvValue != null && (
        <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
            <div className="info-icon-wrapper" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <span style={{ fontSize: '1.1rem' }}>☀️</span>
            </div>
            <div className="info-content">
              <h4>{t('uv_index')}</h4>
              <p style={{ color: uvColor }}>{uvValue?.toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>— {getUVLabel(uvValue)}</span></p>
            </div>
          </div>
          <div className="uv-bar-track" style={{ marginLeft: 52 }}>
            <div
              className="uv-bar-fill"
              style={{ width: `${Math.min((uvValue / 11) * 100, 100)}%` }}
              role="progressbar"
              aria-valuenow={uvValue}
              aria-valuemin={0}
              aria-valuemax={11}
            />
          </div>
          <UVTip uv={uvValue} t={t} />
        </div>
      )}

      {/* Air Quality (AQI) with bar + dettaglio PM2.5 / NO2 */}
      {aqi != null && (
        <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
            <div className="info-icon-wrapper" style={{ background: `${aqiColor}20` }}>
              <Wind size={20} color={aqiColor} />
            </div>
            <div className="info-content">
              <h4>{t('aqi_title')}</h4>
              <p style={{ color: aqiColor }}>
                {Math.round(aqi)}{' '}
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>— {aqiText}</span>
              </p>
            </div>
          </div>
          <div className="uv-bar-track" style={{ marginLeft: 52 }}>
            <div
              className="uv-bar-fill"
              style={{
                width: `${Math.min(aqi, 100)}%`,
                background: `linear-gradient(90deg, #22c55e, ${aqiColor})`
              }}
              role="progressbar"
              aria-valuenow={aqi}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {/* PM2.5 e NO2 */}
          {(pm25 != null || no2 != null) && (
            <div style={{ marginLeft: 52, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {pm25 != null && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 999 }}>
                  PM2.5: <strong style={{ color: 'var(--text-secondary)' }}>{pm25.toFixed(1)} µg/m³</strong>
                </span>
              )}
              {no2 != null && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 999 }}>
                  NO₂: <strong style={{ color: 'var(--text-secondary)' }}>{no2.toFixed(1)} µg/m³</strong>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
