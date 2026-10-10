import { useTranslation } from 'react-i18next';
import LevelScale from './LevelScale';
import { AQI_LEVELS, aqiLevel } from '../../utils/weather';

const POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5' },
  { key: 'pm10', label: 'PM10' },
  { key: 'nitrogen_dioxide', label: 'NO₂' },
  { key: 'ozone', label: 'O₃' },
];

/** Indice europeo di qualità dell'aria (EAQI) con i principali inquinanti. */
export default function AirPanel({ air }) {
  const { t } = useTranslation();
  const current = air?.current;
  const aqi = current?.european_aqi;
  const level = aqiLevel(aqi);

  return (
    <section className="panel air" aria-labelledby="air-title">
      <div className="panel__head">
        <h2 id="air-title" className="panel__title">{t('air_quality')}</h2>
        <p className="panel__note">{t('aqi_scale_name')}</p>
      </div>

      {level == null ? (
        <p className="panel__empty">{t('air_unavailable')}</p>
      ) : (
        <>
          <p className="reading">
            <span className="reading__value">{Math.round(aqi)}</span>
            <span className="reading__label">
              <span className="swatch" style={{ background: level.color }} aria-hidden="true" />
              {t(level.key)}
            </span>
          </p>
          <LevelScale
            levels={AQI_LEVELS}
            index={level.index}
            fraction={level.index < 5 ? (aqi - level.index * 20) / 20 : 0.5}
            label={`${t('air_quality')}: ${Math.round(aqi)}, ${t(level.key)}`}
          />
          <dl className="stat-grid">
            {POLLUTANTS.map(({ key, label }) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{current[key] != null ? current[key].toFixed(1) : '–'} <span className="unit">µg/m³</span></dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}
