import { memo, useEffect, useMemo, useRef, useState } from 'react';
import MoonDisc from './MoonDisc';
import { HORIZON, altToY, arcScale } from './geometry';

function toPath(points, scale) {
  return points
    .map((p, i) => `${i ? 'L' : 'M'}${(p.x * 1000).toFixed(1)} ${(altToY(p.alt, scale) * 1000).toFixed(1)}`)
    .join(' ');
}

// Stelle in posizioni fisse (generatore pseudo-casuale con seme): sempre le stesse.
const STARS = (() => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 70 }, () => ({
    x: rand() * 100,
    y: rand() * HORIZON * 92,
    r: rand() < 0.15 ? 1.4 : 0.8,
    o: 0.35 + rand() * 0.65,
  }));
})();

const Stars = memo(function Stars() {
  return (
    <svg className="sky__stars" width="100%" height="100%" aria-hidden="true">
      {STARS.map((s, i) => (
        <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} opacity={s.o} />
      ))}
    </svg>
  );
});

/**
 * Il giorno disegnato come cielo: asse orizzontale = 24 ore locali,
 * asse verticale = altitudine. Sole e luna seguono i loro percorsi reali.
 */
export default function SkyChart({
  paths, cursorX, sunAlt, moonAlt, moonPhase, moonFraction = 1, southern, starsOpacity, events,
}) {
  const rootRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setScale(arcScale(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const sunPath = useMemo(() => toPath(paths.sun, scale), [paths, scale]);
  const moonPath = useMemo(() => toPath(paths.moon, scale), [paths, scale]);
  const sunY = altToY(sunAlt, scale);
  const moonY = altToY(moonAlt, scale);

  return (
    <div className="sky__chart" aria-hidden="true" ref={rootRef}>
      {starsOpacity > 0 && (
        <div className="sky__stars-wrap" style={{ opacity: starsOpacity }}>
          <Stars />
        </div>
      )}

      <svg className="sky__paths" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <clipPath id="sky-above">
            <rect x="0" y="0" width="1000" height={HORIZON * 1000} />
          </clipPath>
        </defs>
        <path d={moonPath} className="sky__moon-path" clipPath="url(#sky-above)" />
        <path d={sunPath} className="sky__sun-path sky__sun-path--below" />
        <path d={sunPath} className="sky__sun-path" clipPath="url(#sky-above)" />
        <line x1="0" x2="1000" y1={HORIZON * 1000} y2={HORIZON * 1000} className="sky__horizon" />
        <line x1={cursorX * 1000} x2={cursorX * 1000} y1="40" y2={HORIZON * 1000} className="sky__cursor" />
      </svg>

      {events.map((event) => (
        <span key={event.kind} className={`sky__event sky__event--${event.kind}`}
          style={{ left: `${event.x * 100}%`, top: `${HORIZON * 100}%` }} />
      ))}

      <span className="sky__knob" style={{ left: `${cursorX * 100}%`, top: `${HORIZON * 100}%` }} />

      {moonAlt > -1 && (moonFraction > 0.03 ? (
        <span className="sky__body sky__body--moon" style={{ left: `${cursorX * 100}%`, top: `${moonY * 100}%` }}>
          <MoonDisc phase={moonPhase} size={26} southern={southern} className="moon-disc" />
        </span>
      ) : (
        // Luna nuova: invisibile anche nel cielo vero, se ne segna solo il contorno.
        <span className="sky__body sky__body--new-moon" style={{ left: `${cursorX * 100}%`, top: `${moonY * 100}%` }} />
      ))}
      {sunAlt > -1 && (
        <span className="sky__body sky__body--sun" style={{ left: `${cursorX * 100}%`, top: `${sunY * 100}%` }} />
      )}
    </div>
  );
}
