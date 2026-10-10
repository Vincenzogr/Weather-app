import { useTranslation } from 'react-i18next';
import { Sunrise, Sunset } from 'lucide-react';
import LevelScale from './LevelScale';
import MoonDisc from '../sky/MoonDisc';
import { moonIllumination, moonPhaseKey } from '../../utils/astro';
import { UV_LEVELS, formatDuration, formatTime, uvLevel } from '../../utils/weather';

/** Sole e UV del giorno scelto, fase lunare del momento mostrato. */
export default function SunMoonPanel({ forecast, timeline, dayIndex, air, epoch, southern }) {
  const { t, i18n } = useTranslation();
  const day = timeline.days[dayIndex] ?? timeline.days[0];
  const offset = timeline.offset;
  const uvMax = forecast.daily.uv_index_max?.[day.index];
  const uvNow = dayIndex === 0 ? air?.current?.uv_index : null;
  const shown = uvNow ?? uvMax;
  const level = uvLevel(shown);
  const moon = moonIllumination(epoch);
  const dayLength = day.sunrise && day.sunset ? (day.sunset - day.sunrise) / 60_000 : null;

  return (
    <section className="panel sun-moon" aria-labelledby="sun-title">
      <h2 id="sun-title" className="panel__title">{t('sun_moon_uv')}</h2>

      <dl className="sun-moon__times">
        <div>
          <dt><Sunrise size={16} aria-hidden="true" />{t('sunrise')}</dt>
          <dd>{day.sunrise ? formatTime(day.sunrise, offset, i18n.language) : '–'}</dd>
        </div>
        <div>
          <dt><Sunset size={16} aria-hidden="true" />{t('sunset')}</dt>
          <dd>{day.sunset ? formatTime(day.sunset, offset, i18n.language) : '–'}</dd>
        </div>
        <div>
          <dt>{t('day_length')}</dt>
          <dd>{dayLength != null ? formatDuration(dayLength) : '–'}</dd>
        </div>
      </dl>

      {level && (
        <div className="sun-moon__uv">
          <p className="reading">
            <span className="reading__value">{shown.toFixed(1)}</span>
            <span className="reading__label">
              <span className="swatch" style={{ background: level.color }} aria-hidden="true" />
              {t('uv_index')} · {t(level.key)}
            </span>
          </p>
          <LevelScale
            levels={UV_LEVELS}
            index={level.index}
            fraction={0.5}
            label={`${t('uv_index')}: ${shown.toFixed(1)}, ${t(level.key)}`}
          />
          {uvNow != null && uvMax != null && (
            <p className="panel__note">{t('uv_now_max', { now: uvNow.toFixed(1), max: uvMax.toFixed(1) })}</p>
          )}
        </div>
      )}

      <div className="sun-moon__moon">
        <MoonDisc phase={moon.phase} size={44} southern={southern} className="moon-disc moon-disc--panel" />
        <div>
          <p className="sun-moon__phase">{t(moonPhaseKey(moon.phase))}</p>
          <p className="panel__note">{t('moon_illuminated', { value: Math.round(moon.fraction * 100) })}</p>
        </div>
      </div>
    </section>
  );
}
