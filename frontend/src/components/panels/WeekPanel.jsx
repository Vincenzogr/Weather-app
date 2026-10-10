import { useTranslation } from 'react-i18next';
import { Droplets, Wind } from 'lucide-react';
import WeatherGlyph from '../WeatherGlyph';
import {
  formatDay, formatPrecip, formatTemp, formatWind, parseLocalIso, tempGradient, wmoInfo,
} from '../../utils/weather';

/**
 * I 7 giorni su un'unica scala di temperatura: le barre min/max si
 * confrontano a colpo d'occhio e il colore dice quanto fa caldo.
 */
export default function WeekPanel({ forecast, timeline, selectedDay, onSelectDay, units, currentTemp }) {
  const { t, i18n } = useTranslation();
  const { daily } = forecast;
  const mins = daily.temperature_2m_min;
  const maxs = daily.temperature_2m_max;
  const weekMin = Math.floor(Math.min(...mins));
  const weekMax = Math.ceil(Math.max(...maxs));
  const span = Math.max(1, weekMax - weekMin);
  const gradient = tempGradient(weekMin, weekMax);

  return (
    <section className="panel week" aria-labelledby="week-title">
      <div className="panel__head">
        <h2 id="week-title" className="panel__title">{t('next_7_days')}</h2>
        <p className="panel__note">{t('week_scale_note', { min: formatTemp(weekMin, units), max: formatTemp(weekMax, units) })}</p>
      </div>

      <ol className="week__list">
        {timeline.days.map((day) => {
          const i = day.index;
          const info = wmoInfo(daily.weather_code?.[i]);
          const left = (mins[i] - weekMin) / span;
          const width = Math.max(0.04, (maxs[i] - mins[i]) / span);
          const noon = parseLocalIso(`${day.date}T12:00`, timeline.offset);
          const name = i === 0 ? t('today') : i === 1 ? t('tomorrow')
            : formatDay(noon, timeline.offset, i18n.language, { weekday: 'long' });
          const date = formatDay(noon, timeline.offset, i18n.language, { day: 'numeric', month: 'short' });
          const rain = daily.precipitation_probability_max?.[i] ?? 0;
          const precip = daily.precipitation_sum?.[i] ?? 0;
          const selected = i === selectedDay;
          const nowPos = i === 0 && currentTemp != null
            ? Math.min(1, Math.max(0, (currentTemp - mins[i]) / Math.max(0.1, maxs[i] - mins[i])))
            : null;

          return (
            <li key={day.date}>
              <button
                type="button"
                className={`week__row${selected ? ' is-selected' : ''}`}
                onClick={() => onSelectDay(i)}
                aria-pressed={selected}
              >
                <span className="week__day">
                  <span className="week__name">{name}</span>
                  <span className="week__date">{date}</span>
                </span>
                <span className="week__cond">
                  <WeatherGlyph category={info.category} size={22} />
                  <span className="week__label">{t(info.key)}</span>
                </span>
                <span className={`week__rain${rain >= 50 ? ' is-wet' : ''}`}>
                  <Droplets size={14} aria-hidden="true" />
                  <span>{rain}%</span>
                  {precip >= 0.1 && <span className="week__mm">{formatPrecip(precip, units)}</span>}
                </span>
                <span className="week__wind">
                  <Wind size={14} aria-hidden="true" />
                  <span>{formatWind(daily.wind_speed_10m_max?.[i], units)}</span>
                </span>
                <span className="week__min">
                  <span className="visually-hidden">{t('min')} </span>{formatTemp(mins[i], units)}
                </span>
                <span className="week__bar" aria-hidden="true">
                  <span
                    className="week__range"
                    style={{
                      left: `${left * 100}%`,
                      width: `${width * 100}%`,
                      backgroundImage: gradient,
                      backgroundSize: `${100 / width}% 100%`,
                      backgroundPosition: width < 1 ? `${(left / (1 - width)) * 100}% 0` : '0 0',
                    }}
                  >
                    {nowPos != null && <span className="week__now" style={{ left: `${nowPos * 100}%` }} />}
                  </span>
                </span>
                <span className="week__max">
                  <span className="visually-hidden">{t('max')} </span>{formatTemp(maxs[i], units)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
