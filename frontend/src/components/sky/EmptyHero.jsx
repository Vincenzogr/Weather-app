import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderCircle, LocateFixed, RotateCcw } from 'lucide-react';
import SkyChart from './SkyChart';
import { moonAltitude, moonIllumination, sunAltitude } from '../../utils/astro';
import { skyPaths } from '../../utils/timeline';

const SUGGESTIONS = [
  { label: 'Roma', query: 'Rome,IT' },
  { label: 'Tokyo', query: 'Tokyo,JP' },
  { label: 'Reykjavík', query: 'Reykjavik,IS' },
  { label: 'New York', query: 'New York,US' },
  { label: 'Cape Town', query: 'Cape Town,ZA' },
];

const DAY_MS = 86_400_000;

/**
 * Prima visita, caricamento iniziale o errore senza dati:
 * il cielo di chi guarda (posizione stimata dal fuso orario) e un invito a cercare.
 */
export default function EmptyHero({ status, error, query, onSearch, onLocate, locating, onRetry, visitorSky }) {
  const { t } = useTranslation();
  const { lat, lon, now } = visitorSky;

  const view = useMemo(() => {
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const day = { start: midnight.getTime() };
    return {
      paths: skyPaths(day, lat, lon),
      cursorX: (now - day.start) / DAY_MS,
      sunAlt: sunAltitude(now, lat, lon),
      moonAlt: moonAltitude(now, lat, lon),
      moonPhase: moonIllumination(now).phase,
      moonFraction: moonIllumination(now).fraction,
    };
  }, [lat, lon, now]);

  const loading = status === 'loading';
  const retryable = error && !['CITY_NOT_FOUND', 'INVALID_PARAMETER'].includes(error);

  return (
    <section className="sky sky--empty" aria-labelledby="empty-heading">
      <SkyChart {...view} southern={lat < 0} starsOpacity={visitorSky.starsOpacity} events={[]} />
      <div className="sky__inner container">
        <div className="sky__intro">
          <h1 id="empty-heading" className="sky__headline">{t('empty_title')}</h1>
          <p className="sky__lead">{t('empty_lead')}</p>

          {loading && (
            <p className="sky__status" role="status">
              <LoaderCircle size={18} className="spin" aria-hidden="true" />
              {t('loading_city', { city: query?.split(',')[0] ?? '' })}
            </p>
          )}

          {error && !loading && (
            <div className="sky__problem" role="alert">
              <p>{t(`errors.${error}`, { defaultValue: t('errors.INTERNAL_ERROR') })}</p>
              {retryable && (
                <button type="button" className="button button--on-sky" onClick={onRetry}>
                  <RotateCcw size={16} aria-hidden="true" />
                  {t('retry')}
                </button>
              )}
            </div>
          )}

          <div className="sky__try">
            <span className="sky__try-label">{t('try_with')}</span>
            <ul className="sky__try-list">
              {SUGGESTIONS.map((s) => (
                <li key={s.query}>
                  <button type="button" className="chip chip--on-sky" onClick={() => onSearch(s.query)} disabled={loading}>
                    {s.label}
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="chip chip--on-sky" onClick={onLocate} disabled={locating || loading}>
                  {locating ? <LoaderCircle size={14} className="spin" aria-hidden="true" />
                    : <LocateFixed size={14} aria-hidden="true" />}
                  {t('use_my_location')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
