import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Eye, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { getCityLocalTime } from '../utils/weatherHelpers';

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
    </div>
  );
}
