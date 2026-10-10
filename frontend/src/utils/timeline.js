import { moonAltitude, sunAltitude } from './astro';
import { computeSky } from './sky';
import { localHour, msToKmh, owmCategory, parseLocalIso, wmoInfo } from './weather';

const HOUR_MS = 3_600_000;

/** Raggruppa le ore delle previsioni per giorno (ora locale della città). */
export function buildTimeline(forecast) {
  const offset = forecast.utc_offset_seconds ?? 0;
  const { daily, hourly } = forecast;
  const days = daily.time.map((date, index) => ({
    index,
    date,
    start: parseLocalIso(`${date}T00:00`, offset),
    sunrise: daily.sunrise?.[index] ? parseLocalIso(daily.sunrise[index], offset) : null,
    sunset: daily.sunset?.[index] ? parseLocalIso(daily.sunset[index], offset) : null,
    hours: [],
  }));
  const byDate = new Map(days.map((day) => [day.date, day]));
  hourly.time.forEach((iso, i) => {
    byDate.get(iso.slice(0, 10))?.hours.push(i);
  });
  return { offset, days };
}

/** Indice dell'ora corrente negli array orari (o il più vicino). */
export function currentHourIndex(timeline, now) {
  const day = timeline.days[0];
  if (!day || day.hours.length === 0) return 0;
  const hour = localHour(now, timeline.offset);
  return day.hours[Math.min(hour, day.hours.length - 1)];
}

const capitalize = (text) => (text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : text);

/**
 * Ciò che il cielo mostra in un momento: "ora" usa il meteo osservato
 * (OpenWeatherMap), un'ora scelta con lo slider usa le previsioni orarie.
 */
export function momentView({ data, timeline, cursor, now, t }) {
  const { weather, forecast: { hourly } } = data;
  const lat = weather.coord.lat;
  const lon = weather.coord.lon;

  let index;
  let epoch;
  if (cursor.live) {
    index = currentHourIndex(timeline, now);
    epoch = now;
  } else {
    const day = timeline.days[cursor.day] ?? timeline.days[0];
    index = day.hours[Math.min(cursor.hour, day.hours.length - 1)];
    epoch = parseLocalIso(hourly.time[index], timeline.offset);
  }

  const code = hourly.weather_code?.[index];
  const hourlyInfo = wmoInfo(code);

  const view = cursor.live
    ? {
      temp: weather.main?.temp,
      feelsLike: weather.main?.feels_like,
      humidity: weather.main?.humidity,
      windKmh: msToKmh(weather.wind?.speed ?? 0),
      windDeg: weather.wind?.deg,
      category: owmCategory(weather),
      condition: capitalize(weather.weather?.[0]?.description),
      cloudCover: weather.clouds?.all,
    }
    : {
      temp: hourly.temperature_2m?.[index],
      feelsLike: hourly.apparent_temperature?.[index],
      humidity: hourly.relative_humidity_2m?.[index],
      windKmh: hourly.wind_speed_10m?.[index],
      windDeg: null,
      category: hourlyInfo.category,
      condition: t(hourlyInfo.key),
      cloudCover: hourly.cloud_cover?.[index],
    };

  const sunAlt = sunAltitude(epoch, lat, lon);
  const rising = sunAltitude(epoch + 10 * 60_000, lat, lon) > sunAlt;
  const sky = computeSky({ sunAlt, rising, category: view.category, cloudCover: view.cloudCover });

  return {
    ...view,
    index,
    epoch,
    precipProbability: hourly.precipitation_probability?.[index],
    sunAlt,
    moonAlt: moonAltitude(epoch, lat, lon),
    sky,
  };
}

/**
 * Percorso di sole e luna lungo le 24 ore di un giorno, campionato ogni 15 minuti.
 * x = frazione del giorno (0–1), alt = altitudine in gradi.
 */
export function skyPaths(day, lat, lon) {
  const samples = 96;
  const sun = [];
  const moon = [];
  for (let i = 0; i <= samples; i++) {
    const ms = day.start + (i / samples) * 24 * HOUR_MS;
    sun.push({ x: i / samples, alt: sunAltitude(ms, lat, lon) });
    moon.push({ x: i / samples, alt: moonAltitude(ms, lat, lon) });
  }
  return { sun, moon };
}
