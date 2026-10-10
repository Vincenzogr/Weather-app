/**
 * Utility meteo: unità di misura, codici WMO, ora locale della città,
 * scale di qualità dell'aria e UV.
 */

// ── Unità ─────────────────────────────────────────────────────────────

export const toFahrenheit = (c) => (c * 9) / 5 + 32;
export const msToKmh = (ms) => ms * 3.6;

export function tempValue(celsius, units) {
  if (celsius == null || Number.isNaN(celsius)) return null;
  return Math.round(units === 'imperial' ? toFahrenheit(celsius) : celsius);
}

/** "18°" — la scala (C/F) è dichiarata una volta nelle impostazioni. */
export function formatTemp(celsius, units) {
  const v = tempValue(celsius, units);
  return v == null ? '–' : `${v}°`;
}

export function windValue(kmh, units) {
  return Math.round(units === 'imperial' ? kmh * 0.621371 : kmh);
}

export function formatWind(kmh, units) {
  if (kmh == null) return '–';
  return `${windValue(kmh, units)} ${units === 'imperial' ? 'mph' : 'km/h'}`;
}

export function formatDistance(meters, units) {
  if (meters == null) return '–';
  if (units === 'imperial') return `${(meters / 1609.34).toFixed(1)} mi`;
  return meters >= 10000 ? `${Math.round(meters / 1000)} km` : `${(meters / 1000).toFixed(1)} km`;
}

export function formatPrecip(mm, units) {
  if (mm == null) return '–';
  if (units === 'imperial') return `${(mm / 25.4).toFixed(2)} in`;
  return `${mm < 10 ? mm.toFixed(1) : Math.round(mm)} mm`;
}

// ── Condizioni ────────────────────────────────────────────────────────

/** Codice WMO (Open-Meteo) → categoria visiva + chiave di traduzione. */
export function wmoInfo(code) {
  if (code === 0) return { category: 'clear', key: 'wmo_clear' };
  if (code === 1) return { category: 'few-clouds', key: 'wmo_mainly_clear' };
  if (code === 2) return { category: 'few-clouds', key: 'wmo_partly_cloudy' };
  if (code === 3) return { category: 'overcast', key: 'wmo_overcast' };
  if (code === 45 || code === 48) return { category: 'mist', key: 'wmo_fog' };
  if (code >= 51 && code <= 55) return { category: 'drizzle', key: 'wmo_drizzle' };
  if (code === 56 || code === 57) return { category: 'drizzle', key: 'wmo_freezing_drizzle' };
  if (code === 61) return { category: 'rain', key: 'wmo_rain_light' };
  if (code === 63) return { category: 'rain', key: 'wmo_rain' };
  if (code === 65) return { category: 'rain', key: 'wmo_rain_heavy' };
  if (code === 66 || code === 67) return { category: 'rain', key: 'wmo_freezing_rain' };
  if (code === 71) return { category: 'snow', key: 'wmo_snow_light' };
  if (code === 73) return { category: 'snow', key: 'wmo_snow' };
  if (code === 75) return { category: 'snow', key: 'wmo_snow_heavy' };
  if (code === 77) return { category: 'snow', key: 'wmo_snow_grains' };
  if (code === 80 || code === 81) return { category: 'rain', key: 'wmo_showers' };
  if (code === 82) return { category: 'rain', key: 'wmo_showers_heavy' };
  if (code === 85 || code === 86) return { category: 'snow', key: 'wmo_snow_showers' };
  if (code === 95) return { category: 'thunder', key: 'wmo_thunder' };
  if (code === 96 || code === 99) return { category: 'thunder', key: 'wmo_thunder_hail' };
  return { category: 'clear', key: 'wmo_unknown' };
}

/** Condizione attuale OpenWeatherMap → categoria visiva. */
export function owmCategory(weather) {
  const id = weather?.weather?.[0]?.id;
  if (!id) return 'clear';
  if (id >= 200 && id < 300) return 'thunder';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'mist';
  if (id === 800) return 'clear';
  if (id === 801 || id === 802) return 'few-clouds';
  return 'overcast';
}

// ── Ora locale della città ────────────────────────────────────────────
// Le date vengono spostate dell'offset della città e formattate in UTC:
// così l'ora mostrata è quella del luogo, non quella del browser.

export function shiftDate(epochMs, offsetSec) {
  return new Date(epochMs + offsetSec * 1000);
}

export function formatTime(epochMs, offsetSec, lang) {
  return new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    .format(shiftDate(epochMs, offsetSec));
}

export function formatHour(epochMs, offsetSec, lang) {
  return new Intl.DateTimeFormat(lang, { hour: '2-digit', timeZone: 'UTC' })
    .format(shiftDate(epochMs, offsetSec));
}

export function formatDay(epochMs, offsetSec, lang, options) {
  return new Intl.DateTimeFormat(lang, { timeZone: 'UTC', ...options })
    .format(shiftDate(epochMs, offsetSec));
}

/** "2026-10-10T14:00" (ora locale della città) → epoch ms. */
export function parseLocalIso(iso, offsetSec) {
  const [date, time = '00:00'] = iso.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return Date.UTC(y, m - 1, d, hh, mm) - offsetSec * 1000;
}

/** Ora del giorno (0–23) del momento dato nel fuso della città. */
export function localHour(epochMs, offsetSec) {
  return shiftDate(epochMs, offsetSec).getUTCHours();
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

// ── Grandezze derivate e scale ────────────────────────────────────────

export function compassIndex(deg) {
  return Math.round(((deg % 360) + 360) % 360 / 45) % 8;
}

/** Punto di rugiada (formula di Magnus). */
export function dewPoint(tempC, humidity) {
  if (tempC == null || !humidity) return null;
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}

// Indice europeo di qualità dell'aria (EEA): fasce e colori ufficiali.
export const AQI_LEVELS = [
  { max: 20, key: 'aqi_good', color: '#50F0E6' },
  { max: 40, key: 'aqi_fair', color: '#50CCAA' },
  { max: 60, key: 'aqi_moderate', color: '#F0E641' },
  { max: 80, key: 'aqi_poor', color: '#FF5050' },
  { max: 100, key: 'aqi_very_poor', color: '#960032' },
  { max: Infinity, key: 'aqi_extremely_poor', color: '#7D2181' },
];

export function aqiLevel(aqi) {
  if (aqi == null) return null;
  const index = AQI_LEVELS.findIndex((l) => aqi <= l.max);
  return { ...AQI_LEVELS[index], index };
}

// Indice UV (OMS): fasce e colori ufficiali.
export const UV_LEVELS = [
  { max: 2, key: 'uv_low', color: '#4EB400' },
  { max: 5, key: 'uv_moderate', color: '#F7E400' },
  { max: 7, key: 'uv_high', color: '#F88700' },
  { max: 10, key: 'uv_very_high', color: '#D8001D' },
  { max: Infinity, key: 'uv_extreme', color: '#998CFF' },
];

export function uvLevel(uv) {
  if (uv == null) return null;
  const index = UV_LEVELS.findIndex((l) => uv <= l.max + 0.5);
  return { ...UV_LEVELS[index], index };
}

/** Colore di una temperatura (°C) per le barre min/max: dal freddo al caldo. */
const TEMP_STOPS = [
  [-15, '#7B8CFF'], [-5, '#5B9BF0'], [5, '#4BB7C9'], [15, '#7CC67A'], [22, '#F2C14E'], [30, '#F08A3C'], [38, '#E0473A'],
];

export function tempGradient(minC, maxC) {
  const span = Math.max(1, maxC - minC);
  const stops = TEMP_STOPS.map(([c, color]) => `${color} ${(((c - minC) / span) * 100).toFixed(1)}%`);
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}
