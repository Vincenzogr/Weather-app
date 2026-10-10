import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from './auth/useAuth';
import { useWeatherData } from './hooks/useWeatherData';
import { useFavorites } from './hooks/useFavorites';
import { useBackgroundPhoto } from './hooks/useBackgroundPhoto';
import { usePersistentState } from './hooks/usePersistentState';
import { useNow } from './hooks/useNow';
import { useToast } from './components/toast/ToastContext';

import BrandMark from './components/top/BrandMark';
import SearchBar from './components/top/SearchBar';
import SettingsMenu from './components/top/SettingsMenu';
import CityChips from './components/top/CityChips';
import SkyHero from './components/sky/SkyHero';
import EmptyHero from './components/sky/EmptyHero';
import HourScrubber from './components/sky/HourScrubber';
import WeekPanel from './components/panels/WeekPanel';
import TipsPanel from './components/panels/TipsPanel';
import AirPanel from './components/panels/AirPanel';
import SunMoonPanel from './components/panels/SunMoonPanel';
import DetailsPanel from './components/panels/DetailsPanel';
import AuthDialog from './components/AuthDialog';

import { buildTimeline, momentView } from './utils/timeline';
import { computeSky } from './utils/sky';
import { sunAltitude } from './utils/astro';
import { formatTemp, localHour } from './utils/weather';
import { cityKey as keyOfCity, cityLabel, sameCity } from './utils/cityKey';

const HourlyChartPanel = lazy(() => import('./components/panels/HourlyChartPanel'));
const RadarPanel = lazy(() => import('./components/panels/RadarPanel'));

const LIVE = { live: true, day: 0, hour: 0 };
const MAX_RECENT = 6;

/** Cielo di chi visita, quando non c'è ancora una città: posizione stimata dal fuso orario. */
function visitorSkyAt(now) {
  const lat = 42;
  const lon = -new Date(now).getTimezoneOffset() / 4;
  const sunAlt = sunAltitude(now, lat, lon);
  const rising = sunAltitude(now + 600_000, lat, lon) > sunAlt;
  const sky = computeSky({ sunAlt, rising, category: 'few-clouds', cloudCover: 20 });
  return { lat, lon, now, sky, starsOpacity: Math.max(0, (sky.darkness - 0.45) / 0.55) };
}

function PanelFallback({ className }) {
  return <div className={`panel panel--loading ${className}`} aria-hidden="true" />;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const notify = useToast();
  const { user, logout } = useAuth();
  const { status, data, error, load, retry } = useWeatherData(i18n.resolvedLanguage);
  const { favorites, loaded: favoritesLoaded, toggle: toggleFavoriteCity, isFavorite } = useFavorites(user);

  const [theme, setTheme] = usePersistentState('meteo.theme', 'auto');
  const [units, setUnits] = usePersistentState('meteo.units', 'metric');
  const [recent, setRecent] = usePersistentState('meteo.recent', []);
  const [cursor, setCursor] = useState(LIVE);
  const [authState, setAuthState] = useState({ open: false, reason: null, pendingFavorite: null });
  const [locating, setLocating] = useState(false);
  const [lastQuery, setLastQuery] = useState(null);
  const searchRef = useRef(null);
  const pendingFavorite = useRef(null);
  const now = useNow();

  // ── Dati derivati ───────────────────────────────────────────────────
  const timeline = useMemo(() => (data ? buildTimeline(data.forecast) : null), [data]);
  const liveMoment = useMemo(
    () => (data && timeline ? momentView({ data, timeline, cursor: LIVE, now, t }) : null),
    [data, timeline, now, t],
  );
  const moment = useMemo(() => {
    if (!data || !timeline) return null;
    return cursor.live ? liveMoment : momentView({ data, timeline, cursor, now, t });
  }, [data, timeline, cursor, liveMoment, now, t]);
  const liveHour = timeline ? localHour(now, timeline.offset) : 0;
  const visitorSky = useMemo(() => visitorSkyAt(now), [now]);

  const shownSky = moment?.sky ?? visitorSky.sky;
  const realSky = liveMoment?.sky ?? visitorSky.sky;
  const resolvedTheme = theme === 'auto' ? (realSky.darkness > 0.5 ? 'dark' : 'light') : theme;

  const photo = useBackgroundPhoto(
    liveMoment?.category,
    liveMoment?.sky.isNight ?? false,
    data?.weather?.name,
  );

  // ── Effetti sul documento: colori del cielo, tema, titolo ───────────
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.style.setProperty('--sky-top', shownSky.top);
    root.style.setProperty('--sky-horizon', shownSky.horizon);
    root.style.setProperty('--sky-ground', shownSky.ground);
    root.style.setProperty('--sky-ink', shownSky.ink);
    root.style.setProperty('--sky-ink-top', shownSky.inkTop);
    root.dataset.skyTopInk = shownSky.inkTop === '#FFFFFF' ? 'light' : 'dark';
    root.style.setProperty('--live-top', realSky.top);
    root.style.setProperty('--live-horizon', realSky.horizon);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', shownSky.top);
  }, [resolvedTheme, shownSky, realSky]);

  useEffect(() => {
    document.title = data && liveMoment
      ? `${formatTemp(liveMoment.temp, units)} ${data.weather.name} · ${t('app_title')}`
      : `${t('app_title')} · ${t('app_tagline')}`;
  }, [data, liveMoment, units, t]);

  // ── Azioni ──────────────────────────────────────────────────────────
  const rememberCity = useCallback((weather) => {
    const key = keyOfCity(weather);
    setRecent((list) => [key, ...list.filter((c) => !sameCity(c, key))].slice(0, MAX_RECENT));
  }, [setRecent]);

  const search = useCallback(async (city) => {
    setLastQuery(city);
    setCursor(LIVE);
    const weather = await load({ city });
    if (weather) rememberCity(weather);
  }, [load, rememberCity]);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      notify(t('errors.GEO_UNAVAILABLE'), { tone: 'error' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setCursor(LIVE);
        setLastQuery(null);
        const weather = await load({ lat: coords.latitude, lon: coords.longitude });
        setLocating(false);
        if (weather) rememberCity(weather);
      },
      (geoError) => {
        setLocating(false);
        notify(t(geoError.code === 1 ? 'errors.GEO_DENIED' : 'errors.GEO_UNAVAILABLE'), { tone: 'error' });
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }, [load, notify, rememberCity, t]);

  // Chi torna trova l'ultima città cercata.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (recent[0]) search(recent[0].split('#')[0]);
  }, [recent, search]);

  // Errore con dati già a schermo: avviso discreto, i dati restano.
  useEffect(() => {
    if (error && data) notify(t(`errors.${error}`, { defaultValue: t('errors.INTERNAL_ERROR') }), { tone: 'error' });
  }, [error, data, notify, t]);

  // "/" porta alla ricerca.
  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target.tagName;
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !event.target.isContentEditable) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const selectDay = useCallback((day) => {
    setCursor(day === 0 ? LIVE : { live: false, day, hour: liveHour });
  }, [liveHour]);

  const scrub = useCallback(({ day, hour }) => {
    setCursor(day === 0 && hour === liveHour ? LIVE : { live: false, day, hour });
  }, [liveHour]);

  const cityKey = data ? keyOfCity(data.weather) : null;
  const cityIsFavorite = cityKey ? isFavorite(cityKey) : false;

  const applyFavorite = useCallback(async (city) => {
    try {
      const { added } = await toggleFavoriteCity(city);
      notify(t(added ? 'favorite_added' : 'favorite_removed', { city: cityLabel(city) }), { tone: 'success' });
    } catch ({ code }) {
      notify(t(`errors.${code}`, { defaultValue: t('errors.INTERNAL_ERROR') }), { tone: 'error' });
    }
  }, [toggleFavoriteCity, notify, t]);

  const onToggleFavorite = useCallback(() => {
    if (!cityKey) return;
    if (!user) {
      setAuthState({ open: true, reason: 'favorite', pendingFavorite: cityKey });
      return;
    }
    applyFavorite(cityKey);
  }, [cityKey, user, applyFavorite]);

  const onAuthSuccess = useCallback((signedIn, mode) => {
    pendingFavorite.current = authState.pendingFavorite;
    setAuthState({ open: false, reason: null, pendingFavorite: null });
    notify(t(mode === 'register' ? 'welcome_new' : 'welcome_back', { name: signedIn.name }), { tone: 'success' });
  }, [authState.pendingFavorite, notify, t]);

  // Il preferito chiesto prima del login si salva quando la lista dell'utente è caricata.
  useEffect(() => {
    const city = pendingFavorite.current;
    if (!city || !user || !favoritesLoaded) return;
    pendingFavorite.current = null;
    if (!isFavorite(city)) applyFavorite(city);
  }, [user, favoritesLoaded, isFavorite, applyFavorite]);

  const onLogout = useCallback(() => {
    logout();
    notify(t('logged_out'));
  }, [logout, notify, t]);

  const busy = status === 'loading';
  const dayIndex = cursor.live ? 0 : cursor.day;
  const selectedHour = cursor.live ? liveHour : cursor.hour;

  return (
    <>
      <a className="skip-link" href="#dashboard">{t('skip_to_content')}</a>

      <header className="masthead">
        <div className="topbar container">
          <a className="brand" href="/" aria-label={t('app_title')}>
            <BrandMark />
            <span className="brand__name">{t('app_title')}</span>
          </a>
          <SearchBar onSearch={search} onLocate={locate} locating={locating} inputRef={searchRef} />
          <SettingsMenu
            user={user}
            onLogin={() => setAuthState({ open: true, reason: null, pendingFavorite: null })}
            onLogout={onLogout}
            theme={theme}
            setTheme={setTheme}
            units={units}
            setUnits={setUnits}
          />
        </div>
        <CityChips favorites={favorites} recent={recent} onSelect={search} />
      </header>

      <main>
        {data && moment ? (
          <>
            <SkyHero
              data={data}
              timeline={timeline}
              cursor={cursor}
              moment={moment}
              units={units}
              photo={photo}
              isFavorite={cityIsFavorite}
              onToggleFavorite={onToggleFavorite}
              onBackToNow={() => setCursor(LIVE)}
              busy={busy}
            />
            <HourScrubber
              forecast={data.forecast}
              timeline={timeline}
              cursor={cursor}
              liveHour={liveHour}
              onScrub={scrub}
              units={units}
            />

            <div id="dashboard" className="dashboard container" aria-busy={busy} tabIndex={-1}>
              <div className="dashboard__main">
                <WeekPanel
                  forecast={data.forecast}
                  timeline={timeline}
                  selectedDay={dayIndex}
                  onSelectDay={selectDay}
                  units={units}
                  currentTemp={liveMoment?.temp}
                />
                <Suspense fallback={<PanelFallback className="chart-panel" />}>
                  <HourlyChartPanel
                    forecast={data.forecast}
                    timeline={timeline}
                    dayIndex={dayIndex}
                    selectedHour={selectedHour}
                    units={units}
                    theme={resolvedTheme}
                  />
                </Suspense>
                <Suspense fallback={<PanelFallback className="radar" />}>
                  <RadarPanel
                    lat={data.weather.coord.lat}
                    lon={data.weather.coord.lon}
                    cityName={data.weather.name}
                  />
                </Suspense>
              </div>
              <div className="dashboard__side">
                <TipsPanel weather={data.weather} forecast={data.forecast} air={data.air} />
                <AirPanel air={data.air} />
                <SunMoonPanel
                  forecast={data.forecast}
                  timeline={timeline}
                  dayIndex={dayIndex}
                  air={data.air}
                  epoch={moment.epoch}
                  southern={data.weather.coord.lat < 0}
                />
                <DetailsPanel weather={data.weather} units={units} />
              </div>
            </div>
          </>
        ) : (
          <EmptyHero
            status={status}
            error={error}
            query={lastQuery}
            onSearch={search}
            onLocate={locate}
            locating={locating}
            onRetry={retry}
            visitorSky={visitorSky}
          />
        )}
      </main>

      <footer className="footer container">
        <p>{t('footer_sources')}{' '}
          <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeather</a>,{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>,{' '}
          <a href="https://www.pexels.com/" target="_blank" rel="noreferrer">Pexels</a>.
        </p>
        <p>{t('footer_author')}</p>
      </footer>

      <AuthDialog
        open={authState.open}
        reason={authState.reason}
        onClose={() => setAuthState({ open: false, reason: null, pendingFavorite: null })}
        onSuccess={onAuthSuccess}
      />
    </>
  );
}
