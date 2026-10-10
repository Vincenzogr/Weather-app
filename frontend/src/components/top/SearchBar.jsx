import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderCircle, LocateFixed, MapPin, Search } from 'lucide-react';
import { api, isCanceled } from '../../api/client';

/**
 * Ricerca città con autocompletamento (pattern combobox ARIA):
 * frecce per muoversi tra i suggerimenti, Invio per scegliere, Esc per chiudere.
 */
export default function SearchBar({ onSearch, onLocate, locating, inputRef }) {
  const { t, i18n } = useTranslation();
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const blurTimer = useRef(null);

  const query = value.trim();

  useEffect(() => {
    if (query.length < 2) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      api.get('/coordinates', { params: { city: query, lang: i18n.language }, signal: controller.signal })
        .then(({ data }) => {
          setSuggestions(data?.results ?? []);
          setActive(-1);
        })
        .catch((error) => { if (!isCanceled(error)) setSuggestions([]); })
        .finally(() => setLoading(false));
    }, 280);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, i18n.language]);

  const visible = open && query.length >= 2 ? suggestions : [];

  const choose = (place) => {
    const code = place.country_code ?? '';
    setValue(place.name);
    setOpen(false);
    onSearch(code ? `${place.name},${code}` : place.name);
  };

  const submit = (event) => {
    event.preventDefault();
    if (active >= 0 && visible[active]) {
      choose(visible[active]);
    } else if (query) {
      setOpen(false);
      onSearch(query);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' && visible.length) {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % visible.length);
    } else if (event.key === 'ArrowUp' && visible.length) {
      event.preventDefault();
      setActive((i) => (i <= 0 ? visible.length - 1 : i - 1));
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <form className="search" role="search" onSubmit={submit}>
      <div className="search__field">
        <Search size={18} className="search__icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className="search__input"
          value={value}
          placeholder={t('search_placeholder')}
          aria-label={t('search_label')}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible.length > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck="false"
          enterKeyHint="search"
          onChange={(event) => { setValue(event.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => { clearTimeout(blurTimer.current); setOpen(true); }}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120); }}
        />
        {loading && <LoaderCircle size={16} className="search__spinner" aria-hidden="true" />}
        <button
          type="button"
          className="icon-button search__locate"
          onClick={onLocate}
          disabled={locating}
          aria-label={t('use_my_location')}
          title={t('use_my_location')}
        >
          {locating
            ? <LoaderCircle size={18} className="spin" aria-hidden="true" />
            : <LocateFixed size={18} aria-hidden="true" />}
        </button>

        <ul id={listId} role="listbox" className={`search__list${visible.length ? ' is-open' : ''}`}>
          {visible.map((place, i) => (
            <li
              key={`${place.id ?? place.name}-${place.latitude}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`search__option${i === active ? ' is-active' : ''}`}
              onMouseDown={(event) => { event.preventDefault(); choose(place); }}
              onMouseEnter={() => setActive(i)}
            >
              <MapPin size={16} aria-hidden="true" />
              <span className="search__name">{place.name}</span>
              <span className="search__region">{[place.admin1, place.country].filter(Boolean).join(', ')}</span>
            </li>
          ))}
        </ul>
      </div>
      <button type="submit" className="button button--primary search__submit">
        {t('search_action')}
      </button>
    </form>
  );
}
