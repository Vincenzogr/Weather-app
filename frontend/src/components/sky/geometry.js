/** Posizione dell'orizzonte nel riquadro del cielo (frazione dell'altezza). */
export const HORIZON = 0.74;

/**
 * Altitudine (gradi) → posizione verticale (0 = alto, 1 = basso) nel riquadro del cielo.
 * `scale` riduce l'altezza dell'arco sugli schermi stretti, dove le 24 ore occupano
 * pochi pixel in orizzontale: così l'arco resta un arco e non diventa una punta.
 */
export function altToY(alt, scale = 1) {
  if (alt >= 0) return HORIZON - (Math.min(alt, 75) / 75) * (HORIZON - 0.1) * scale;
  return HORIZON + (Math.min(-alt, 30) / 30) * (1 - HORIZON);
}

/** Fattore d'altezza dell'arco in base alla larghezza del cielo (1 da ~1100px in su). */
export function arcScale(width) {
  return Math.min(1, Math.max(0.4, width / 1100));
}
