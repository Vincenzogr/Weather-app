/**
 * Chiave di una città salvata (preferiti e recenti): "Roma,IT#3169070".
 * OpenWeatherMap traduce il nome della città nella lingua scelta ("Roma", "Rome",
 * "ローマ"): l'ID dopo "#" permette di riconoscerla in qualsiasi lingua.
 */
export function cityKey(weather) {
  const country = weather.sys?.country ? `,${weather.sys.country}` : '';
  const id = weather.id ? `#${weather.id}` : '';
  return `${weather.name}${country}${id}`;
}

/** La parte usata per cercare la città ("Roma,IT"). */
export const cityQuery = (key) => key.split('#')[0];

/** Il nome da mostrare ("Roma"). */
export const cityLabel = (key) => cityQuery(key).split(',')[0];

const cityId = (key) => {
  const i = key.indexOf('#');
  return i >= 0 ? key.slice(i + 1) : null;
};

export function sameCity(a, b) {
  if (!a || !b) return false;
  const idA = cityId(a);
  const idB = cityId(b);
  if (idA && idB) return idA === idB;
  return cityQuery(a).toLowerCase() === cityQuery(b).toLowerCase();
}
