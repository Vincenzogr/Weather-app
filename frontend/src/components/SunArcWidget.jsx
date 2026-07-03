import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { unixToTime } from '../utils/weatherHelpers';

// Calcola la fase lunare con la formula di Meeus
function getMoonPhase() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  let y = year, m = month;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;

  const daysSinceNew = (JD - 2451549.5) % 29.53058867;
  const phase = daysSinceNew < 0 ? daysSinceNew + 29.53058867 : daysSinceNew;
  return phase;
}

function getMoonIcon(phase) {
  if (phase < 1.85)  return { icon: '🌑', nameKey: 'moon_new' };
  if (phase < 5.53)  return { icon: '🌒', nameKey: 'moon_waxing_crescent' };
  if (phase < 9.22)  return { icon: '🌓', nameKey: 'moon_first_quarter' };
  if (phase < 12.91) return { icon: '🌔', nameKey: 'moon_waxing_gibbous' };
  if (phase < 16.61) return { icon: '🌕', nameKey: 'moon_full' };
  if (phase < 20.30) return { icon: '🌖', nameKey: 'moon_waning_gibbous' };
  if (phase < 23.99) return { icon: '🌗', nameKey: 'moon_last_quarter' };
  if (phase < 27.68) return { icon: '🌘', nameKey: 'moon_waning_crescent' };
  return { icon: '🌑', nameKey: 'moon_new' };
}

// Calcola il punto sull arco SVG in base all ora corrente
function getSunPosition(sunrise, sunset) {
  const now = Date.now() / 1000;
  if (now <= sunrise) return 0;
  if (now >= sunset) return 1;
  return (now - sunrise) / (sunset - sunrise);
}

// Converte la posizione (0-1) in coordinate x,y sul semicerchio
function arcPoint(t, cx, cy, rx, ry) {
  const angle = Math.PI - t * Math.PI; // da PI a 0 (da sinistra a destra)
  return {
    x: cx + rx * Math.cos(angle),
    y: cy - ry * Math.sin(angle),
  };
}

export default function SunArcWidget({ weather }) {
  const { t, i18n } = useTranslation();
  if (!weather?.sys?.sunrise) return null;

  const { sunrise, sunset } = weather.sys;
  const sunPos = getSunPosition(sunrise, sunset);
  const moonPhase = useMemo(() => getMoonPhase(), []);
  const { icon: moonIcon, nameKey: moonNameKey } = getMoonIcon(moonPhase);

  const sunriseStr = unixToTime(sunrise, i18n.language);
  const sunsetStr  = unixToTime(sunset, i18n.language);

  // Durata del giorno
  const durationMin = Math.round((sunset - sunrise) / 60);
  const durationH   = Math.floor(durationMin / 60);
  const durationM   = durationMin % 60;

  // SVG arc parameters
  const cx = 140, cy = 110, rx = 115, ry = 90;
  const sunPt = arcPoint(sunPos, cx, cy, rx, ry);
  const arcPath = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;

  // Active arc (solo la porzione percorsa)
  const activePt = arcPoint(Math.min(sunPos, 1), cx, cy, rx, ry);
  const largeArc = sunPos > 0.5 ? 1 : 0;
  const activeArcPath = sunPos > 0
    ? `M ${cx - rx} ${cy} A ${rx} ${ry} 0 ${largeArc} 1 ${activePt.x} ${activePt.y}`
    : '';

  const isDaytime = sunPos > 0 && sunPos < 1;

  return (
    <motion.div
      className="glass-panel sun-arc-widget"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="sun-arc-header">
        ☀️ {t('sun_arc_title', 'Posizione Solare')}
      </div>

      <div className="sun-arc-svg-wrap">
        <svg className="sun-arc-svg" viewBox="0 0 280 130" aria-label="Arco solare">
          <defs>
            <linearGradient id="sunArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path d={arcPath} className="sun-arc-path" />

          {/* Active arc */}
          {activeArcPath && (
            <path d={activeArcPath} className="sun-arc-path-active" strokeDasharray="400" />
          )}

          {/* Horizon line */}
          <line x1={cx - rx - 10} y1={cy} x2={cx + rx + 10} y2={cy}
            stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Sunrise dot */}
          <circle cx={cx - rx} cy={cy} r={4} fill="#f59e0b" opacity="0.7" />
          {/* Sunset dot */}
          <circle cx={cx + rx} cy={cy} r={4} fill="#f97316" opacity="0.7" />

          {/* Sun position indicator */}
          {isDaytime && (
            <g className="sun-dot">
              <circle cx={sunPt.x} cy={sunPt.y} r={10} fill="#fbbf24" opacity="0.25" />
              <circle cx={sunPt.x} cy={sunPt.y} r={6} fill="#fbbf24" />
              <circle cx={sunPt.x} cy={sunPt.y} r={3} fill="#fff" opacity="0.8" />
            </g>
          )}
        </svg>
      </div>

      <div className="sun-times">
        <div className="sun-time-item">
          <span className="sun-time-label">🌅 {t('sunrise', 'Alba')}</span>
          <span className="sun-time-value">{sunriseStr}</span>
        </div>
        <div className="sun-time-item">
          <span className="day-duration">{durationH}h {durationM}m</span>
          <span className="sun-time-label" style={{ textAlign: 'center', fontSize: '0.6rem' }}>{t('day_duration', 'Durata giorno')}</span>
        </div>
        <div className="sun-time-item">
          <span className="sun-time-label">🌇 {t('sunset', 'Tramonto')}</span>
          <span className="sun-time-value">{sunsetStr}</span>
        </div>
      </div>

      {/* Moon Phase */}
      <div className="moon-phase-row">
        <div className="moon-phase-icon">{moonIcon}</div>
        <div className="moon-phase-info">
          <span className="moon-phase-label">{t('moon_phase', 'Fase Lunare')}</span>
          <span className="moon-phase-name">{t(moonNameKey, moonNameKey.replace('moon_', '').replace(/_/g, ' '))}</span>
        </div>
      </div>
    </motion.div>
  );
}
