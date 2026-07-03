import React from 'react';
import { Sunrise, Sunset, Activity, Wind } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { unixToTime, getUVLabel, getUVColor } from '../utils/weatherHelpers';

export default function GeoPanel({ weather, forecast, airQuality }) {
  const { t, i18n } = useTranslation();
  if (!weather) return null;

  const uvValue = forecast?.daily?.uv_index_max?.[0];
  const uvColor = getUVColor(uvValue);

  const aqi = airQuality?.current?.european_aqi;
  let aqiText = t('aqi_good');
  let aqiColor = '#22c55e'; // green

  if (aqi > 20) { aqiText = t('aqi_moderate'); aqiColor = '#eab308'; }
  if (aqi > 40) { aqiText = t('aqi_poor'); aqiColor = '#f97316'; }
  if (aqi > 60) { aqiText = t('aqi_bad'); aqiColor = '#ef4444'; }
  if (aqi > 80) { aqiText = t('aqi_very_bad'); aqiColor = '#7f1d1d'; }

  const rows = [
    {
      icon: <Sunrise size={20} color="#f59e0b" />,
      iconBg: 'rgba(245, 158, 11, 0.12)',
      label: t('sunrise'),
      value: weather.sys?.sunrise ? `${unixToTime(weather.sys.sunrise, i18n.language)}` : '--:--',
    },
    {
      icon: <Sunset size={20} color="#f97316" />,
      iconBg: 'rgba(249, 115, 22, 0.12)',
      label: t('sunset'),
      value: weather.sys?.sunset ? `${unixToTime(weather.sys.sunset, i18n.language)}` : '--:--',
    },
    {
      icon: <Activity size={20} color="#38bdf8" />,
      iconBg: 'rgba(56, 189, 248, 0.12)',
      label: t('pressure'),
      value: `${weather.main?.pressure ?? '--'} hPa`,
    },
  ];

  return (
    <div className="glass-panel side-panel">
      <p className="panel-title">📍 {t('geo_location')}</p>

      {rows.map((row, i) => (
        <div className="info-row" key={i}>
          <div className="info-icon-wrapper" style={{ background: row.iconBg }}>
            {row.icon}
          </div>
          <div className="info-content">
            <h4>{row.label}</h4>
            <p>{row.value}</p>
          </div>
        </div>
      ))}

      {/* UV Index with bar */}
      {uvValue != null && (
        <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
            <div className="info-icon-wrapper" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <span style={{ fontSize: '1.1rem' }}>☀️</span>
            </div>
            <div className="info-content">
              <h4>{t('uv_index')}</h4>
              <p style={{ color: uvColor }}>{uvValue?.toFixed(1)}</p>
            </div>
          </div>
          <div className="uv-bar-track" style={{ marginLeft: 52 }}>
            <div
              className="uv-bar-fill"
              style={{ width: `${Math.min((uvValue / 11) * 100, 100)}%` }}
              role="progressbar"
            />
          </div>
        </div>
      )}

      {/* Air Quality (AQI) with bar */}
      {aqi != null && (
        <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
            <div className="info-icon-wrapper" style={{ background: `${aqiColor}20` }}>
              <Wind size={20} color={aqiColor} />
            </div>
            <div className="info-content">
              <h4>{t('aqi_title')}</h4>
              <p style={{ color: aqiColor }}>{Math.round(aqi)} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>— {aqiText}</span></p>
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
            />
          </div>
        </div>
      )}

    </div>
  );
}
