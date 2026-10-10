import { useTranslation } from 'react-i18next';
import { History, Star } from 'lucide-react';
import { cityLabel, cityQuery, sameCity } from '../../utils/cityKey';

/** Preferiti (dal server) e città recenti (da questo browser). */
export default function CityChips({ favorites, recent, onSelect }) {
  const { t } = useTranslation();
  const recentOnly = recent.filter((r) => !favorites.some((f) => sameCity(f, r)));

  if (favorites.length === 0 && recentOnly.length === 0) return null;

  return (
    <nav className="chips container" aria-label={t('saved_cities')}>
      {favorites.length > 0 && (
        <ul className="chips__group" aria-label={t('favorites')}>
          {favorites.map((city) => (
            <li key={`f-${city}`}>
              <button type="button" className="chip chip--favorite" onClick={() => onSelect(cityQuery(city))}>
                <Star size={14} aria-hidden="true" />
                {cityLabel(city)}
              </button>
            </li>
          ))}
        </ul>
      )}
      {recentOnly.length > 0 && (
        <ul className="chips__group" aria-label={t('recent')}>
          {recentOnly.map((city) => (
            <li key={`r-${city}`}>
              <button type="button" className="chip" onClick={() => onSelect(cityQuery(city))}>
                <History size={14} aria-hidden="true" />
                {cityLabel(city)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
