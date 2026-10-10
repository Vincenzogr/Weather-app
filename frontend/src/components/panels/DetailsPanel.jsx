import { useTranslation } from 'react-i18next';
import { compassIndex, dewPoint, formatDistance, formatTemp, formatWind, msToKmh } from '../../utils/weather';

function Compass({ deg, label }) {
  // La freccia indica dove soffia il vento (opposto alla provenienza).
  return (
    <svg className="compass" viewBox="-30 -30 60 60" role="img" aria-label={label}>
      <circle r="26" className="compass__ring" />
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1="0" y1="-26" x2="0" y2="-21" transform={`rotate(${a})`} className="compass__tick" />
      ))}
      <text y="-14" className="compass__n">N</text>
      <g style={{ transform: `rotate(${(deg ?? 0) + 180}deg)` }} className="compass__needle">
        <path d="M0 -20 L5 2 L0 -2 L-5 2 Z" />
        <line x1="0" y1="-2" x2="0" y2="16" />
      </g>
    </svg>
  );
}

/** Misure attuali dalla stazione OpenWeatherMap. */
export default function DetailsPanel({ weather, units }) {
  const { t } = useTranslation();
  const main = weather.main ?? {};
  const wind = weather.wind ?? {};
  const compass = t('compass', { returnObjects: true });
  const dir = wind.deg != null && Array.isArray(compass) ? compass[compassIndex(wind.deg)] : '';
  const dew = dewPoint(main.temp, main.humidity);

  return (
    <section className="panel details" aria-labelledby="details-title">
      <h2 id="details-title" className="panel__title">{t('current_details')}</h2>

      <div className="details__wind">
        <Compass deg={wind.deg} label={`${t('wind_from')} ${dir}`} />
        <div>
          <p className="details__wind-speed">{formatWind(msToKmh(wind.speed ?? 0), units)} <span>{dir}</span></p>
          {wind.gust != null && (
            <p className="panel__note">{t('gusts')} {formatWind(msToKmh(wind.gust), units)}</p>
          )}
        </div>
      </div>

      <dl className="stat-grid">
        <div>
          <dt>{t('pressure')}</dt>
          <dd>{main.pressure ?? '–'} <span className="unit">hPa</span></dd>
        </div>
        <div>
          <dt>{t('visibility')}</dt>
          <dd>{formatDistance(weather.visibility, units)}</dd>
        </div>
        <div>
          <dt>{t('dew_point')}</dt>
          <dd>{dew != null ? formatTemp(dew, units) : '–'}</dd>
        </div>
        <div>
          <dt>{t('cloud_cover')}</dt>
          <dd>{weather.clouds?.all ?? '–'}%</dd>
        </div>
      </dl>
    </section>
  );
}
