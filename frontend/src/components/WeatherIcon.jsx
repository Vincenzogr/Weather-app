import React from 'react';

/**
 * Animated SVG weather icons based on category.
 * Categories: clear | night | few-clouds | overcast | drizzle | rain | snow | mist | thunder
 */
export default function WeatherIcon({ category = 'clear', size = 80 }) {
  const half = size / 2;

  switch (category) {
    // ── Clear day (sun with rotating rays) ─────────────────────────
    case 'clear':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Sereno">
          {/* Rotating rays */}
          <g className="wi-sun-rays" style={{ transformOrigin: '40px 40px' }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="40" y1="13"
                x2="40" y2="5"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${angle} 40 40)`}
              />
            ))}
          </g>
          {/* Sun circle */}
          <circle cx="40" cy="40" r="14" fill="#fbbf24" />
          <circle cx="40" cy="40" r="14" fill="url(#sunGrad)" />
          <defs>
            <radialGradient id="sunGrad" cx="40%" cy="35%" r="60%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
        </svg>
      );

    // ── Clear night (moon) ──────────────────────────────────────────
    case 'night':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Notte serena">
          <path
            className="wi-moon"
            d="M50 20 Q28 24 28 42 Q28 60 50 62 Q32 66 24 50 Q18 32 32 22 Q40 16 50 20Z"
            fill="#fbbf24"
          />
          {/* Stars */}
          {[[62, 18, 2.5], [66, 36, 1.8], [57, 28, 1.4], [58, 48, 2], [70, 28, 1.2]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#e2e8f0" opacity="0.8"
              style={{ animation: `moon-glow ${1.5 + i * 0.3}s ease-in-out infinite` }}
            />
          ))}
        </svg>
      );

    // ── Few clouds (sun + cloud) ────────────────────────────────────
    case 'few-clouds':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Poco nuvoloso">
          {/* Mini sun */}
          <g className="wi-sun-rays" style={{ transformOrigin: '28px 28px' }}>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <line key={i} x1="28" y1="14" x2="28" y2="8"
                stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"
                transform={`rotate(${angle} 28 28)`}
              />
            ))}
          </g>
          <circle cx="28" cy="28" r="10" fill="#fbbf24" />
          {/* Cloud */}
          <g className="wi-cloud">
            <ellipse cx="46" cy="50" rx="18" ry="12" fill="#94a3b8" />
            <ellipse cx="38" cy="52" rx="12" ry="9"  fill="#94a3b8" />
            <ellipse cx="56" cy="52" rx="10" ry="8"  fill="#94a3b8" />
            <ellipse cx="46" cy="42" rx="12" ry="10" fill="#cbd5e1" />
            <rect x="28" y="50" width="36" height="14" rx="0" fill="#94a3b8" />
          </g>
        </svg>
      );

    // ── Overcast (cloud) ────────────────────────────────────────────
    case 'overcast':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Coperto">
          <g className="wi-cloud">
            <ellipse cx="40" cy="46" rx="24" ry="14" fill="#64748b" />
            <ellipse cx="28" cy="48" rx="14" ry="10" fill="#64748b" />
            <ellipse cx="52" cy="48" rx="13" ry="10" fill="#64748b" />
            <ellipse cx="40" cy="36" rx="18" ry="13" fill="#94a3b8" />
            <ellipse cx="28" cy="40" rx="12" ry="10" fill="#94a3b8" />
            <rect x="16" y="46" width="48" height="16" rx="0" fill="#64748b" />
          </g>
        </svg>
      );

    // ── Drizzle ─────────────────────────────────────────────────────
    case 'drizzle':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Pioviggine">
          {/* Cloud */}
          <g className="wi-cloud">
            <ellipse cx="40" cy="34" rx="20" ry="13" fill="#94a3b8" />
            <ellipse cx="28" cy="38" rx="13" ry="9"  fill="#94a3b8" />
            <ellipse cx="52" cy="38" rx="12" ry="9"  fill="#94a3b8" />
            <rect x="20" y="36" width="40" height="12" rx="0" fill="#94a3b8" />
          </g>
          {/* Drops */}
          {[[30, 52], [40, 56], [50, 52], [35, 60]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2" ry="4" fill="#818cf8"
              className="wi-rain-drop" style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>
      );

    // ── Rain ────────────────────────────────────────────────────────
    case 'rain':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Pioggia">
          {/* Cloud */}
          <g className="wi-cloud">
            <ellipse cx="40" cy="32" rx="22" ry="14" fill="#64748b" />
            <ellipse cx="26" cy="36" rx="14" ry="10" fill="#64748b" />
            <ellipse cx="54" cy="36" rx="13" ry="10" fill="#64748b" />
            <rect x="18" y="34" width="44" height="12" rx="0" fill="#64748b" />
          </g>
          {/* Drops */}
          {[[26, 52, 0], [36, 56, 0.15], [46, 52, 0.3], [56, 56, 0.05], [31, 62, 0.22]].map(([x, y, delay], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2.5" ry="5" fill="#38bdf8"
              className="wi-rain-drop" style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </svg>
      );

    // ── Snow ────────────────────────────────────────────────────────
    case 'snow':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Neve">
          {/* Cloud */}
          <g className="wi-cloud">
            <ellipse cx="40" cy="30" rx="22" ry="14" fill="#94a3b8" />
            <ellipse cx="26" cy="34" rx="14" ry="10" fill="#94a3b8" />
            <ellipse cx="54" cy="34" rx="13" ry="10" fill="#94a3b8" />
            <rect x="18" y="32" width="44" height="12" rx="0" fill="#94a3b8" />
          </g>
          {/* Snowflakes */}
          {[[30, 54], [42, 58], [54, 54]].map(([x, y], i) => (
            <text key={i} x={x} y={y} fontSize="12" textAnchor="middle" fill="#e2e8f0"
              className="wi-snow-flake" style={{ animationDelay: `${i * 0.5}s` }}>
              ❄
            </text>
          ))}
        </svg>
      );

    // ── Mist / Fog ──────────────────────────────────────────────────
    case 'mist':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Nebbia">
          {[28, 38, 48, 58].map((y, i) => (
            <line key={i} x1="12" y1={y} x2="68" y2={y}
              stroke="#94a3b8" strokeWidth="5" strokeLinecap="round"
              className="wi-mist-line" style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </svg>
      );

    // ── Thunderstorm ────────────────────────────────────────────────
    case 'thunder':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Temporale">
          {/* Dark cloud */}
          <g className="wi-cloud">
            <ellipse cx="40" cy="30" rx="24" ry="14" fill="#374151" />
            <ellipse cx="24" cy="34" rx="15" ry="10" fill="#374151" />
            <ellipse cx="56" cy="34" rx="14" ry="10" fill="#374151" />
            <rect x="14" y="32" width="52" height="14" rx="0" fill="#374151" />
          </g>
          {/* Lightning bolt */}
          <path
            className="wi-thunder"
            d="M44 44 L36 60 L42 60 L38 75 L54 56 L46 56 L52 44 Z"
            fill="#fbbf24"
          />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="weather-icon" aria-label="Meteo">
          <circle cx="40" cy="40" r="20" fill="#fbbf24" />
        </svg>
      );
  }
}
