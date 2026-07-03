import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Eye, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { getCityLocalTime, getWindDirection, formatSpeed } from '../utils/weatherHelpers';

function CompassRose({ deg }) {
  return (
    <div className="compass-wrapper" style={{ width: 44, height: 44, margin: '0' }}>
      <svg className="compass-svg" viewBox="0 0 52 52" style={{ width: 44, height: 44 }}>
        <circle cx="26" cy="26" r="24" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        {[['N',26,6],['S',26,46],['E',46,28],['O',6,28]].map(([l,x,y]) => (
          <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.35)" fontSize="7" fontWeight="700" fontFamily="Inter,sans-serif">{l}</text>
        ))}
        <g style={{ transformOrigin: '26px 26px', transform: `rotate(${deg}deg)`, transition: 'transform 1s cubic-bezier(0.25,0.46,0.45,0.94)' }}>
          <polygon points="26,8 22,26 26,23 30,26" fill="#38bdf8" />
          <polygon points="26,44 22,26 26,29 30,26" fill="rgba(255,255,255,0.25)" />
        </g>
        <circle cx="26" cy="26" r="3" fill="#38bdf8" />
      </svg>
    </div>
  );
}

// Fix leaflet default icon
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// MapUpdater: syncs map view when city changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 10, { animate: true });
  }, [center, map]);
  return null;
}

const MAP_LAYERS = [
  { key: 'precipitation_new', icon: '🌧', labelKey: 'rain' },
  { key: 'temp_new',          icon: '🌡', labelKey: 'temp' },
  { key: 'wind_new',          icon: '💨', labelKey: 'wind' },
  { key: 'clouds_new',        icon: '☁',  labelKey: 'clouds' },
];

export default function LocalPanel({ weather, owmKey }) {
  const { t, i18n } = useTranslation();
  const [activeLayer, setActiveLayer] = useState('precipitation_new');

  if (!weather) return null;

  const localTime = getCityLocalTime(weather.timezone, i18n.language);
  const center    = [weather.coord?.lat ?? 0, weather.coord?.lon ?? 0];
  const humidity  = weather.main?.humidity;
  const feelsLike = weather.main?.feels_like;
  const windDeg   = weather.wind?.deg ?? 0;
  const windDir   = getWindDirection(windDeg);
  const windSpeed = weather.wind?.speed ?? 0;
  // unit from context or just default to km/h or m/s? 
  // WeatherHelpers formatSpeed uses unit. Let's pass 'C' (metric) or accept it as prop.
  // We'll just show default metric speed.
  
  return (
    <div className="glass-panel side-panel">
      <p className="panel-title">🕐 {t('local_info')}</p>

      {/* Local time */}
      <div className="info-row">
        <div className="info-icon-wrapper" style={{ background: 'rgba(52, 211, 153, 0.12)' }}>
          <Clock size={20} color="#34d399" />
        </div>
        <div className="info-content">
          <h4>{t('local_time')}</h4>
          <p>{localTime}</p>
        </div>
      </div>

      {/* Humidity */}
      <div className="info-row">
        <div className="info-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.12)' }}>
          <span style={{ fontSize: '1.1rem' }}>💧</span>
        </div>
        <div className="info-content">
          <h4>{t('relative_humidity')}</h4>
          <p>{humidity}%</p>
        </div>
      </div>

      {/* Dew point estimate */}
      <div className="info-row">
        <div className="info-icon-wrapper" style={{ background: 'rgba(129, 140, 248, 0.12)' }}>
          <Eye size={20} color="#818cf8" />
        </div>
        <div className="info-content">
          <h4>{t('cloudiness')}</h4>
          <p>{weather.clouds?.all ?? 0}%</p>
          <small>{weather.clouds?.all >= 75 ? t('overcast') : weather.clouds?.all >= 25 ? t('partly_cloudy') : t('clear_sky')}</small>
        </div>
      </div>

      {/* Map */}
      <div className="map-section-title">
        <Layers size={13} />
        {t('weather_radar')}
      </div>

      {/* Map layer toggle buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {MAP_LAYERS.map(layer => (
          <button
            key={layer.key}
            className={`map-layer-btn ${activeLayer === layer.key ? 'active' : ''}`}
            onClick={() => setActiveLayer(layer.key)}
            aria-pressed={activeLayer === layer.key}
          >
            {layer.icon} {t(layer.labelKey)}
          </button>
        ))}
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={8}
          style={{ height: 200, width: '100%', borderRadius: 12 }}
          zoomControl={false}
          attributionControl={false}
        >
          <MapUpdater center={center} />

          {/* Base tile */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* Weather layer (OWM tiles) */}
          {owmKey && (
            <TileLayer
              key={activeLayer}
              url={`https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${owmKey}`}
              opacity={0.75}
            />
          )}

          {/* City marker */}
          <Marker position={center}>
            <Popup>
              <strong>{weather.name}</strong><br />
              {Math.round(weather.main?.temp)}°C
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Wind with compass added below map */}
      <div className="info-row" style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
          <CompassRose deg={windDeg} />
          <div className="info-content">
            <h4>{t('wind', 'Vento')}</h4>
            <p style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              {formatSpeed(windSpeed, 'C')}
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{windDir}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
