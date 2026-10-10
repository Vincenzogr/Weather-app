import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AttributionControl, MapContainer, Pane, Rectangle, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LAYERS = [
  { key: 'precipitation_new', labelKey: 'precipitation' },
  { key: 'clouds_new', labelKey: 'clouds' },
  { key: 'temp_new', labelKey: 'temperature' },
  { key: 'wind_new', labelKey: 'wind' },
];

// Le mappe base CARTO ora richiedono una chiave API: si usano le tile OpenStreetMap,
// smorzate da un velo nel colore del tema (un filtro CSS sulle tile crea fessure tra i riquadri).
const BASEMAP = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const WORLD = [[-85, -180], [85, 180]];

const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · '
  + '<a href="https://openweathermap.org/">OpenWeather</a>';

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

/**
 * Radar meteo. Le tile OpenWeatherMap passano dal backend (/api/tiles):
 * la chiave API non compare mai nel browser.
 */
export default function RadarPanel({ lat, lon, cityName }) {
  const { t } = useTranslation();
  const [layer, setLayer] = useState('precipitation_new');
  const center = [lat, lon];

  return (
    <section className="panel radar" aria-labelledby="radar-title">
      <div className="panel__head">
        <h2 id="radar-title" className="panel__title">{t('weather_radar')}</h2>
        <div className="segmented" role="radiogroup" aria-label={t('map_layer')}>
          {LAYERS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={layer === key}
              className={`segmented__option${layer === key ? ' is-active' : ''}`}
              onClick={() => setLayer(key)}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="radar__map">
        <MapContainer
          center={center}
          zoom={7}
          minZoom={3}
          maxZoom={12}
          scrollWheelZoom={false}
          attributionControl={false}
          className="radar__leaflet"
          aria-label={t('radar_map_label', { city: cityName })}
        >
          <Recenter center={center} />
          <AttributionControl prefix='<a href="https://leafletjs.com">Leaflet</a>' />
          <TileLayer url={BASEMAP} attribution={ATTRIBUTION} maxZoom={12} />
          <Rectangle bounds={WORLD} interactive={false} pathOptions={{ className: 'radar__wash', stroke: false }} />
          <Pane name="radar" style={{ zIndex: 450 }}>
            <TileLayer key={layer} url={`/api/tiles/${layer}/{z}/{x}/{y}.png`} opacity={0.85} maxNativeZoom={12} />
          </Pane>
          <Pane name="radar-marker" style={{ zIndex: 460 }}>
            <CircleMarker center={center} radius={7} pathOptions={{ className: 'radar__marker' }} />
          </Pane>
        </MapContainer>
      </div>
    </section>
  );
}
