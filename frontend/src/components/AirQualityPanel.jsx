import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wind, Sun } from 'lucide-react';

export default function AirQualityPanel({ airQuality }) {
  const { t } = useTranslation();

  if (!airQuality || !airQuality.current) return null;

  const aqi = airQuality.current.european_aqi;
  const uv = airQuality.current.uv_index;

  let aqiText = t('aqi_good');
  let aqiColor = '#22c55e'; // green

  if (aqi > 20) { aqiText = t('aqi_moderate'); aqiColor = '#eab308'; } // yellow
  if (aqi > 40) { aqiText = t('aqi_poor'); aqiColor = '#f97316'; } // orange
  if (aqi > 60) { aqiText = t('aqi_bad'); aqiColor = '#ef4444'; } // red
  if (aqi > 80) { aqiText = t('aqi_very_bad'); aqiColor = '#7f1d1d'; } // dark red

  return (
    <div className="card air-quality-panel" style={{ marginTop: '16px' }}>
      <h3 className="card-title">
        <Wind size={16} style={{ marginRight: '8px' }}/>
        {t('aqi_title')}
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '16px' }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: aqiColor }}>
            {Math.round(aqi)}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {aqiText}
          </div>
        </div>

        <div style={{ width: '1px', height: '50px', backgroundColor: 'var(--border-color)' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={28} /> {uv !== null && uv !== undefined ? Math.round(uv) : '--'}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {t('uv_index')}
          </div>
        </div>

      </div>
    </div>
  );
}
