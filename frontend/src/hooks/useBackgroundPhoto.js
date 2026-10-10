import { useEffect, useState } from 'react';
import { api } from '../api/client';

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Foto Pexels per la condizione del cielo. La scelta tra le foto disponibili
 * dipende dalla città, così la stessa città mostra sempre la stessa immagine.
 * L'immagine viene restituita solo quando è già scaricata (niente comparse a metà).
 */
export function useBackgroundPhoto(condition, night, seed) {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!condition) return;
    let active = true;
    api.get('/background', { params: { condition, night } })
      .then(({ data }) => {
        if (!active || !data?.length) return;
        const choice = data[hash(seed ?? '') % data.length];
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => active && setPhoto(choice);
        img.src = choice.src;
      })
      .catch(() => { /* lo sfondo è un di più: senza foto resta il cielo */ });
    return () => { active = false; };
  }, [condition, night, seed]);

  return photo;
}
