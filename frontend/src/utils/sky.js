import { mix, contrast } from './color';

/**
 * Il colore del cielo in funzione dell'altitudine reale del sole,
 * della condizione meteo e della copertura nuvolosa.
 *
 * Le tappe seguono i momenti che chiunque riconosce: notte, ora blu,
 * crepuscolo, ora dorata, giorno. Alba e tramonto hanno toni diversi.
 */

// [altitudine in gradi, cielo all'alba, cielo al tramonto]
const CLEAR_STOPS = [
  [-18, { top: '#060B2B', horizon: '#142057' }, { top: '#060B2B', horizon: '#142057' }],
  [-12, { top: '#0A1236', horizon: '#1E2C6B' }, { top: '#0B0F34', horizon: '#252767' }],
  [-6,  { top: '#121D4E', horizon: '#53579C' }, { top: '#1A1748', horizon: '#764C8E' }],
  [-2,  { top: '#29397E', horizon: '#C98584' }, { top: '#33306F', horizon: '#DD7462' }],
  [3,   { top: '#4568AE', horizon: '#F4B27C' }, { top: '#4A55A0', horizon: '#F39663' }],
  [10,  { top: '#3878C8', horizon: '#B9D5EE' }, { top: '#3A73C2', horizon: '#C9D2E6' }],
  [30,  { top: '#2569CC', horizon: '#8CC0F0' }, { top: '#2569CC', horizon: '#8CC0F0' }],
];

// Tinta verso cui la condizione meteo spinge il cielo, di giorno e di notte.
const WEATHER_TINTS = {
  overcast: { day: { top: '#6B7889', horizon: '#B5BEC9' }, night: { top: '#121735', horizon: '#2A3159' } },
  drizzle:  { day: { top: '#5B6878', horizon: '#A2ADBA' }, night: { top: '#0F1431', horizon: '#252C52' } },
  rain:     { day: { top: '#465363', horizon: '#8995A4' }, night: { top: '#0C112B', horizon: '#1F264A' } },
  thunder:  { day: { top: '#2C2A3E', horizon: '#6A6481' }, night: { top: '#0B0923', horizon: '#262046' } },
  snow:     { day: { top: '#93A2B4', horizon: '#E1E7EE' }, night: { top: '#171D3A', horizon: '#3D4768' } },
  mist:     { day: { top: '#939DA8', horizon: '#D0D5DB' }, night: { top: '#161B33', horizon: '#383E5C' } },
};

const INK_DARK = '#0D1726';
const INK_LIGHT = '#FFFFFF';
const MIN_CONTRAST = 4.6;
// Testo secondario sul terreno (--land-ink-2 in index.css).
const LAND_INK_2 = '#C9D0DB';
// Più margine sul terreno: ospita anche la percentuale di pioggia (azzurra) e la cella oraria scelta.
const LAND_CONTRAST = 5;

const worstContrast = (ink, probes) => Math.min(...probes.map((c) => contrast(ink, c)));
const pickInk = (probes) => (worstContrast(INK_LIGHT, probes) >= worstContrast(INK_DARK, probes) ? INK_LIGHT : INK_DARK);

function clearSky(alt, rising) {
  const pick = (stop) => (rising ? stop[1] : stop[2]);
  if (alt <= CLEAR_STOPS[0][0]) return pick(CLEAR_STOPS[0]);
  for (let i = 1; i < CLEAR_STOPS.length; i++) {
    const [a1] = CLEAR_STOPS[i];
    if (alt <= a1) {
      const [a0] = CLEAR_STOPS[i - 1];
      const t = (alt - a0) / (a1 - a0);
      const from = pick(CLEAR_STOPS[i - 1]);
      const to = pick(CLEAR_STOPS[i]);
      return { top: mix(from.top, to.top, t), horizon: mix(from.horizon, to.horizon, t) };
    }
  }
  return pick(CLEAR_STOPS[CLEAR_STOPS.length - 1]);
}

function weatherStrength(category, cloudCover) {
  const c = Math.min(100, Math.max(0, cloudCover ?? 0)) / 100;
  switch (category) {
    case 'clear':      return { tint: 'overcast', s: c * 0.3 };
    case 'few-clouds': return { tint: 'overcast', s: 0.12 + c * 0.35 };
    case 'overcast':   return { tint: 'overcast', s: 0.45 + c * 0.4 };
    case 'drizzle':    return { tint: 'drizzle', s: 0.68 };
    case 'rain':       return { tint: 'rain', s: 0.8 };
    case 'thunder':    return { tint: 'thunder', s: 0.86 };
    case 'snow':       return { tint: 'snow', s: 0.74 };
    case 'mist':       return { tint: 'mist', s: 0.78 };
    default:           return { tint: 'overcast', s: c * 0.3 };
  }
}

/**
 * @param {object} p
 * @param {number} p.sunAlt     altitudine del sole in gradi
 * @param {boolean} p.rising    true prima del mezzogiorno solare (toni dell'alba)
 * @param {string} p.category   clear | few-clouds | overcast | drizzle | rain | thunder | snow | mist
 * @param {number} p.cloudCover copertura nuvolosa 0–100
 */
export function computeSky({ sunAlt, rising, category, cloudCover }) {
  const base = clearSky(sunAlt, rising);
  // 0 con il sole sopra 3°, 1 sotto i -10°: decide la tinta notturna e il tema automatico.
  const darkness = Math.min(1, Math.max(0, (3 - sunAlt) / 13));

  const { tint, s } = weatherStrength(category, cloudCover);
  const t = WEATHER_TINTS[tint];
  const tintTop = mix(t.day.top, t.night.top, darkness);
  const tintHorizon = mix(t.day.horizon, t.night.horizon, darkness);

  let top = mix(base.top, tintTop, s);
  let horizon = mix(base.horizon, tintHorizon, s);

  // Inchiostro del testo: scelto separatamente per la parte alta del cielo
  // (testata, nome della città) e per quella vicina all'orizzonte (temperatura).
  // Nei toni intermedi (crepuscolo) il cielo viene appena scurito o schiarito
  // finché il testo non raggiunge il contrasto AA (4.5:1).
  const topProbes = () => [top, mix(top, horizon, 0.35)];
  const readProbes = () => [mix(top, horizon, 0.55), horizon];
  const inkTop = pickInk(topProbes());
  for (let i = 0; i < 20 && worstContrast(inkTop, topProbes()) < MIN_CONTRAST; i++) {
    top = mix(top, inkTop === INK_LIGHT ? '#020611' : '#FFFFFF', 0.06);
  }
  const ink = pickInk(readProbes());
  for (let i = 0; i < 20 && worstContrast(ink, readProbes()) < MIN_CONTRAST; i++) {
    horizon = mix(horizon, ink === INK_LIGHT ? '#020611' : '#FFFFFF', 0.06);
  }
  // Terreno sotto l'orizzonte: una tinta profonda dello stesso cielo, scurita
  // solo quanto basta perché anche il testo secondario resti leggibile.
  let ground = mix(horizon, top, 0.35);
  for (let i = 0; i < 40 && contrast(LAND_INK_2, ground) < LAND_CONTRAST; i++) {
    ground = mix(ground, '#070C24', 0.07);
  }

  return {
    top,
    horizon,
    ground,
    ink,
    inkTop,
    darkness,
    isNight: sunAlt < -6,
  };
}
