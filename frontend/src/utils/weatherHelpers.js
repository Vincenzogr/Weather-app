/**
 * Weather utility helpers
 */

// UV index label
export function getUVLabel(uv) {
  if (uv == null) return 'N/D';
  if (uv <= 2)  return 'Basso';
  if (uv <= 5)  return 'Moderato';
  if (uv <= 7)  return 'Alto';
  if (uv <= 10) return 'Molto alto';
  return 'Estremo';
}

// UV index color
export function getUVColor(uv) {
  if (uv == null) return '#94a3b8';
  if (uv <= 2)  return '#22c55e';
  if (uv <= 5)  return '#facc15';
  if (uv <= 7)  return '#f97316';
  if (uv <= 10) return '#ef4444';
  return '#a855f7';
}

// Short localized day name
export function getDayName(dateStr, lang = 'it', short = true) {
  const d = new Date(dateStr + 'T12:00:00');
  return new Intl.DateTimeFormat(lang, { weekday: short ? 'short' : 'long' }).format(d);
}

// City local time from OWM timezone offset (seconds)
export function getCityLocalTime(timezoneOffset, lang = 'it') {
  const utcMs   = Date.now() + new Date().getTimezoneOffset() * 60000;
  const cityMs  = utcMs + timezoneOffset * 1000;
  return new Date(cityMs).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
}

// Unix timestamp → HH:MM (UTC)
export function unixToTime(unix, lang = 'it') {
  return new Date(unix * 1000).toLocaleTimeString(lang, {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });
}

// Today's date in current language
export function getFormattedDate(lang = 'it') {
  return new Date().toLocaleDateString(lang, {
    weekday: 'long', day: 'numeric', month: 'long'
  });
}

// Wind direction in degrees → Italian compass label
export function getWindDirection(deg) {
  if (deg == null) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(deg / 45) % 8];
}

// Temperature conversion helpers
export function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

export function formatTemp(celsius, unit) {
  if (unit === 'F') return `${celsiusToFahrenheit(celsius)}°F`;
  return `${Math.round(celsius)}°C`;
}

export function formatTempShort(celsius, unit) {
  if (unit === 'F') return `${celsiusToFahrenheit(celsius)}°`;
  return `${Math.round(celsius)}°`;
}

// Speed conversion helpers
export function mpsToKmh(mps) {
  return Math.round(mps * 3.6);
}

export function kmhToMph(kmh) {
  return Math.round(kmh * 0.621371);
}

export function formatSpeed(mps, unit) {
  const kmh = mpsToKmh(mps);
  if (unit === 'F') return `${kmhToMph(kmh)} mph`;
  return `${kmh} km/h`;
}

/**
 * Map Open-Meteo weathercode → { emoji, label, category }
 * Ref: https://open-meteo.com/en/docs#weathervariables
 */
export function getWeatherCodeInfo(code) {
  const map = {
    0:  { emoji: '☀️', label: 'Sereno',               category: 'clear' },
    1:  { emoji: '🌤️', label: 'Prevalentemente sereno', category: 'few-clouds' },
    2:  { emoji: '⛅',  label: 'Parzialmente nuvoloso', category: 'few-clouds' },
    3:  { emoji: '☁️', label: 'Coperto',               category: 'overcast' },
    45: { emoji: '🌫️', label: 'Nebbia',                category: 'mist' },
    48: { emoji: '🌫️', label: 'Nebbia con brina',      category: 'mist' },
    51: { emoji: '🌦️', label: 'Pioviggine leggera',    category: 'drizzle' },
    53: { emoji: '🌦️', label: 'Pioviggine moderata',   category: 'drizzle' },
    55: { emoji: '🌦️', label: 'Pioviggine intensa',    category: 'drizzle' },
    61: { emoji: '🌧️', label: 'Pioggia leggera',       category: 'rain' },
    63: { emoji: '🌧️', label: 'Pioggia moderata',      category: 'rain' },
    65: { emoji: '🌧️', label: 'Pioggia intensa',       category: 'rain' },
    71: { emoji: '❄️', label: 'Neve leggera',           category: 'snow' },
    73: { emoji: '❄️', label: 'Neve moderata',          category: 'snow' },
    75: { emoji: '❄️', label: 'Neve intensa',           category: 'snow' },
    77: { emoji: '🌨️', label: 'Granelli di neve',      category: 'snow' },
    80: { emoji: '🌦️', label: 'Rovesci leggeri',       category: 'rain' },
    81: { emoji: '🌦️', label: 'Rovesci moderati',      category: 'rain' },
    82: { emoji: '🌦️', label: 'Rovesci intensi',       category: 'rain' },
    85: { emoji: '🌨️', label: 'Rovesci di neve',       category: 'snow' },
    86: { emoji: '🌨️', label: 'Rovesci di neve intensa', category: 'snow' },
    95: { emoji: '⛈️', label: 'Temporale',              category: 'thunder' },
    96: { emoji: '⛈️', label: 'Temporale con grandine', category: 'thunder' },
    99: { emoji: '⛈️', label: 'Temporale forte con grandine', category: 'thunder' },
  };
  return map[code] ?? { emoji: '🌡️', label: 'Meteo', category: 'clear' };
}

/**
 * Map OWM weather.main → category for WeatherIcon
 */
export function owmToCategory(weatherData) {
  if (!weatherData) return 'clear';
  const id   = weatherData.weather?.[0]?.id;
  const icon = weatherData.weather?.[0]?.icon ?? '';
  const isNight = icon.endsWith('n');

  if (!id) return 'clear';
  if (id >= 200 && id < 300) return 'thunder';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'mist';
  if (id === 800) return isNight ? 'night' : 'clear';
  if (id === 801) return isNight ? 'night' : 'few-clouds';
  if (id >= 802) return 'overcast';
  return 'clear';
}
