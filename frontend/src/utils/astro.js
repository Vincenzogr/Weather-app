/**
 * Posizione di sole e luna e illuminazione lunare.
 * Formule astronomiche semplificate (Astronomy Answers, le stesse usate dalla
 * libreria suncalc, BSD-2-Clause): precisione di circa un grado, più che
 * sufficiente per disegnare il percorso nel cielo e colorarlo.
 */

const rad = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = rad * 23.4397;

const toDays = (ms) => ms / DAY_MS - 0.5 + J1970 - J2000;

const rightAscension = (l, b) =>
  Math.atan2(Math.sin(l) * Math.cos(OBLIQUITY) - Math.tan(b) * Math.sin(OBLIQUITY), Math.cos(l));
const declination = (l, b) =>
  Math.asin(Math.sin(b) * Math.cos(OBLIQUITY) + Math.cos(b) * Math.sin(OBLIQUITY) * Math.sin(l));
const altitude = (H, phi, dec) =>
  Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
const siderealTime = (d, lw) => rad * (280.16 + 360.9856235 * d) - lw;

function sunCoords(d) {
  const M = rad * (357.5291 + 0.98560028 * d);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + rad * 102.9372 + Math.PI;
  return { dec: declination(L, 0), ra: rightAscension(L, 0) };
}

function moonCoords(d) {
  const L = rad * (218.316 + 13.176396 * d);
  const M = rad * (134.963 + 13.064993 * d);
  const F = rad * (93.272 + 13.22935 * d);
  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  return { ra: rightAscension(l, b), dec: declination(l, b), dist: 385001 - 20905 * Math.cos(M) };
}

/** Altitudine del sole in gradi (negativa sotto l'orizzonte). */
export function sunAltitude(ms, lat, lon) {
  const d = toDays(ms);
  const c = sunCoords(d);
  const H = siderealTime(d, rad * -lon) - c.ra;
  return altitude(H, rad * lat, c.dec) / rad;
}

/** Altitudine della luna in gradi, con correzione per la rifrazione. */
export function moonAltitude(ms, lat, lon) {
  const d = toDays(ms);
  const c = moonCoords(d);
  const H = siderealTime(d, rad * -lon) - c.ra;
  let h = altitude(H, rad * lat, c.dec);
  h += (rad * 0.017) / Math.tan(h + (rad * 10.26) / (h + rad * 5.1));
  return h / rad;
}

/**
 * Illuminazione lunare.
 * phase: 0 = nuova, 0.25 = primo quarto, 0.5 = piena, 0.75 = ultimo quarto.
 */
export function moonIllumination(ms) {
  const d = toDays(ms);
  const s = sunCoords(d);
  const m = moonCoords(d);
  const SUN_DIST = 149_598_000;
  const phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
  const inc = Math.atan2(SUN_DIST * Math.sin(phi), m.dist - SUN_DIST * Math.cos(phi));
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra),
  );
  return {
    fraction: (1 + Math.cos(inc)) / 2,
    phase: 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI,
  };
}

const MOON_PHASES = [
  'moon_new', 'moon_waxing_crescent', 'moon_first_quarter', 'moon_waxing_gibbous',
  'moon_full', 'moon_waning_gibbous', 'moon_last_quarter', 'moon_waning_crescent',
];

/** Chiave di traduzione della fase lunare. */
export function moonPhaseKey(phase) {
  return MOON_PHASES[Math.round(phase * 8) % 8];
}
