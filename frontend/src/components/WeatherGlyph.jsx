import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun,
} from 'lucide-react';

const DAY = {
  clear: Sun,
  'few-clouds': CloudSun,
  overcast: Cloud,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  thunder: CloudLightning,
  snow: CloudSnow,
  mist: CloudFog,
};

const NIGHT = { ...DAY, clear: Moon, 'few-clouds': CloudMoon };

/** Icona della condizione meteo, nello stesso tratto di tutte le altre icone. */
export default function WeatherGlyph({ category, night = false, size = 20, label, className }) {
  const Icon = (night ? NIGHT : DAY)[category] ?? Sun;
  return (
    <Icon
      size={size}
      strokeWidth={1.75}
      className={className}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
