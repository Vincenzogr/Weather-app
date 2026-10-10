import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Star } from 'lucide-react';
import SkyChart from './SkyChart';
import WeatherGlyph from '../WeatherGlyph';
import { moonIllumination } from '../../utils/astro';
import { skyPaths } from '../../utils/timeline';
import { compassIndex, formatDay, formatTemp, formatTime, formatWind } from '../../utils/weather';

const DAY_MS = 86_400_000;

/**
 * Il primo colpo d'occhio: il cielo della città nell'ora mostrata,
 * con sole e luna nella loro posizione e la temperatura sull'orizzonte.
 */
export default function SkyHero({
  data, timeline, cursor, moment, units, photo, isFavorite, onToggleFavorite, onBackToNow, busy,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { weather, forecast } = data;
  const { lat, lon } = weather.coord;
  const offset = timeline.offset;
  const day = timeline.days[cursor.live ? 0 : cursor.day] ?? timeline.days[0];

  const paths = useMemo(() => skyPaths(day, lat, lon), [day, lat, lon]);
  const moon = useMemo(() => moonIllumination(moment.epoch), [moment.epoch]);

  const cursorX = Math.min(1, Math.max(0, (moment.epoch - day.start) / DAY_MS));
  const events = [
    day.sunrise && { kind: 'sunrise', x: (day.sunrise - day.start) / DAY_MS, time: day.sunrise },
    day.sunset && { kind: 'sunset', x: (day.sunset - day.start) / DAY_MS, time: day.sunset },
  ].filter(Boolean);

  const max = forecast.daily.temperature_2m_max?.[day.index];
  const min = forecast.daily.temperature_2m_min?.[day.index];
  const compass = t('compass', { returnObjects: true });
  const windDir = moment.windDeg != null && Array.isArray(compass) ? ` ${compass[compassIndex(moment.windDeg)]}` : '';
  const starsOpacity = Math.max(0, (moment.sky.darkness - 0.45) / 0.55) * (1 - (moment.cloudCover ?? 0) / 110);

  const dateLabel = formatDay(moment.epoch, offset, lang, { weekday: 'long', day: 'numeric', month: 'long' });
  const timeLabel = formatTime(moment.epoch, offset, lang);

  return (
    <section className={`sky${busy ? ' is-busy' : ''}`} aria-labelledby="city-heading">
      {photo && (
        <div className="sky__photo">
          <img src={photo.src} alt="" decoding="async" />
        </div>
      )}

      <SkyChart
        paths={paths}
        cursorX={cursorX}
        sunAlt={moment.sunAlt}
        moonAlt={moment.moonAlt}
        moonPhase={moon.phase}
        moonFraction={moon.fraction}
        southern={lat < 0}
        starsOpacity={starsOpacity}
        events={events}
      />

      <div className="sky__inner container">
        <header className="sky__place">
          <div className="sky__title-row">
            <h1 id="city-heading" className="sky__city">
              {weather.name}
              {weather.sys?.country && <span className="sky__country">{weather.sys.country}</span>}
            </h1>
            <button
              type="button"
              className={`icon-button sky__favorite${isFavorite ? ' is-active' : ''}`}
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? t('favorite_remove') : t('favorite_add')}
              title={isFavorite ? t('favorite_remove') : t('favorite_add')}
            >
              <Star size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
          <p className="sky__clock">
            <span className="sky__date">{dateLabel}</span>
            <time className="sky__time">{timeLabel}</time>
            <span className="sky__mode">{cursor.live ? t('local_time_now') : t('forecast_for_hour')}</span>
          </p>
        </header>

        <div className="sky__reading">
          <p className="sky__condition">
            <WeatherGlyph category={moment.category} night={moment.sky.isNight} size={22} />
            <span>{moment.condition}</span>
          </p>
          <p className="sky__temp" aria-label={`${t('temperature')} ${formatTemp(moment.temp, units)}`}>
            {formatTemp(moment.temp, units).replace('°', '')}
            <span className="sky__deg" aria-hidden="true">°{units === 'imperial' ? 'F' : 'C'}</span>
          </p>
          {!cursor.live && (
            <button type="button" className="sky__back" onClick={onBackToNow}>
              <RotateCcw size={16} aria-hidden="true" />
              {t('back_to_now')}
            </button>
          )}
        </div>

        <div className="sky__land">
          <ul className="sky__events" aria-label={t('sun_times')}>
            {events.map((event) => (
              <li key={event.kind} style={{ '--x': event.x }}>
                <span>{t(event.kind)}</span> {formatTime(event.time, offset, lang)}
              </li>
            ))}
          </ul>

          <dl className="sky__facts">
            <div>
              <dt>{t('feels_like')}</dt>
              <dd>{formatTemp(moment.feelsLike, units)}</dd>
            </div>
            <div>
              <dt>{t('max_min')}</dt>
              <dd>{formatTemp(max, units)} <span className="sky__muted">/ {formatTemp(min, units)}</span></dd>
            </div>
            <div>
              <dt>{t('rain_chance')}</dt>
              <dd>{moment.precipProbability ?? 0}%</dd>
            </div>
            <div>
              <dt>{t('wind')}</dt>
              <dd>{formatWind(moment.windKmh, units)}{windDir}</dd>
            </div>
            <div>
              <dt>{t('humidity')}</dt>
              <dd>{moment.humidity ?? '–'}%</dd>
            </div>
          </dl>
        </div>
      </div>

      {photo && (
        <p className="sky__credit">
          {t('photo_by')}{' '}
          <a href={photo.photographerUrl ?? photo.pageUrl} target="_blank" rel="noreferrer">{photo.photographer}</a>
          {' · '}
          <a href={photo.pageUrl ?? 'https://www.pexels.com'} target="_blank" rel="noreferrer">Pexels</a>
        </p>
      )}
    </section>
  );
}
