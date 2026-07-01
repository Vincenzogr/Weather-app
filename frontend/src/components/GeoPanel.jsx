import React from 'react';
import { Sunrise, Sunset, Activity } from 'lucide-react';
import { unixToTime, getUVLabel, getUVColor } from '../utils/weatherHelpers';

export default function GeoPanel({ weather, forecast }) {
  if (!weather) return null;

  const uvValue = forecast?.daily?.uv_index_max?.[0];
  const uvColor = getUVColor(uvValue);
  const uvFill  = uvValue != null ? Math.min((uvValue / 11) * 100, 100) : 0;

  const rows = [
    {
      icon: <Sunrise size={20} color="#f59e0b" />,
      iconBg: 'rgba(245, 158, 11, 0.12)',
      label: 'Alba (UTC)',
      value: unixToTime(weather.sys?.sunrise),
    },
    {
      icon: <Sunset size={20} color="#f97316" />,
      iconBg: 'rgba(249, 115, 22, 0.12)',
      label: 'Tramonto (UTC)',
      value: unixToTime(weather.sys?.sunset),
    },
    {
      icon: <Activity size={20} color="#38bdf8" />,
      iconBg: 'rgba(56, 189, 248, 0.12)',
      label: 'Pressione',
      value: `${weather.main?.pressure} hPa`,
    },
  ];

  return (
    <div className="glass-panel side-panel">
      <p className="panel-title">📍 Dettagli Geografici</p>

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
              <h4>Indice UV</h4>
              <p style={{ color: uvColor }}>{uvValue?.toFixed(1)} — {getUVLabel(uvValue)}</p>
            </div>
          </div>
          <div className="uv-bar-track" style={{ marginLeft: 52 }}>
            <div
              className="uv-bar-fill"
              style={{ width: `${uvFill}%` }}
              role="progressbar"
              aria-valuenow={uvValue}
              aria-valuemin={0}
              aria-valuemax={11}
            />
          </div>
        </div>
      )}
    </div>
  );
}
