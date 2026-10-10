import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import WeatherGlyph from '../WeatherGlyph';
import { formatDay, formatTemp, parseLocalIso, wmoInfo } from '../../utils/weather';

/**
 * Le 24 ore del giorno scelto, allineate all'asse del cielo sopra.
 * Mouse e penna trascinano; il tocco seleziona con un tap (lo scorrimento
 * orizzontale resta libero); da tastiera si usa lo slider nativo.
 */
export default function HourScrubber({ forecast, timeline, cursor, liveHour, onScrub, units }) {
  const { t, i18n } = useTranslation();
  const trackRef = useRef(null);
  const scrollerRef = useRef(null);
  const dragging = useRef(false);

  const dayIndex = cursor.live ? 0 : cursor.day;
  const day = timeline.days[dayIndex] ?? timeline.days[0];
  const { hourly } = forecast;
  const selectedHour = cursor.live ? liveHour : Math.min(cursor.hour, day.hours.length - 1);
  const isToday = dayIndex === 0;

  const hours = day.hours.map((index, h) => {
    const code = hourly.weather_code?.[index];
    return {
      h,
      label: hourly.time[index].slice(11, 13),
      temp: hourly.temperature_2m?.[index],
      rain: hourly.precipitation_probability?.[index] ?? 0,
      category: wmoInfo(code).category,
      night: hourly.is_day?.[index] === 0,
      conditionKey: wmoInfo(code).key,
    };
  });

  // Tiene l'ora scelta al centro quando la striscia scorre (schermi stretti):
  // subito al primo disegno, poi con uno scorrimento morbido; anche al ridimensionamento.
  const centered = useRef(false);
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    const center = (behavior) => {
      const cell = scroller.querySelector(`[data-hour="${selectedHour}"]`);
      if (!cell || scroller.scrollWidth <= scroller.clientWidth) return;
      const target = cell.offsetLeft - scroller.clientWidth / 2 + cell.offsetWidth / 2;
      scroller.scrollTo({ left: target, behavior });
    };
    center(centered.current ? 'smooth' : 'auto');
    centered.current = true;
    const observer = new ResizeObserver(() => center('auto'));
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [selectedHour, dayIndex]);

  const hourFromPointer = (event) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    return Math.min(hours.length - 1, Math.max(0, Math.floor(ratio * hours.length)));
  };

  const select = (hour) => onScrub({ day: dayIndex, hour });

  const onPointerDown = (event) => {
    if (event.pointerType === 'touch') return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    select(hourFromPointer(event));
  };
  const onPointerMove = (event) => {
    if (dragging.current) select(hourFromPointer(event));
  };
  const onPointerUp = () => { dragging.current = false; };
  const onClick = (event) => {
    if (event.nativeEvent.pointerType === 'touch' || event.detail === 0) select(hourFromPointer(event));
  };

  const current = hours[selectedHour];
  const dayLabel = isToday
    ? t('today')
    : formatDay(parseLocalIso(`${day.date}T12:00`, timeline.offset), timeline.offset, i18n.language,
      { weekday: 'long', day: 'numeric', month: 'long' });
  const valueText = current
    ? `${current.label}:00, ${formatTemp(current.temp, units)}, ${t(current.conditionKey)}, ${t('rain_chance')} ${current.rain}%`
    : '';

  return (
    <section className="scrubber" aria-labelledby="scrubber-title">
      <div className="container">
        <div className="scrubber__head">
          <h2 id="scrubber-title" className="scrubber__title">{t('hour_by_hour')} · <span>{dayLabel}</span></h2>
          <p className="scrubber__hint">{t('scrubber_hint')}</p>
        </div>

        <div className="scrubber__scroller" ref={scrollerRef}>
          <div
            className="scrubber__track"
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={onClick}
          >
            <ol className="scrubber__hours" aria-hidden="true">
              {hours.map((hour) => {
                const past = isToday && hour.h < liveHour;
                const classes = ['scrubber__hour'];
                if (past) classes.push('is-past');
                if (hour.h === selectedHour) classes.push('is-selected');
                if (isToday && hour.h === liveHour) classes.push('is-now');
                return (
                  <li key={hour.h} className={classes.join(' ')} data-hour={hour.h}>
                    <span className="scrubber__time">{hour.label}</span>
                    <WeatherGlyph category={hour.category} night={hour.night} size={18} />
                    <span className="scrubber__temp">{formatTemp(hour.temp, units)}</span>
                    <span className="scrubber__rain">{hour.rain >= 10 ? `${hour.rain}%` : ''}</span>
                  </li>
                );
              })}
            </ol>
            <input
              type="range"
              className="scrubber__range"
              min={0}
              max={hours.length - 1}
              step={1}
              value={selectedHour}
              onChange={(event) => select(Number(event.target.value))}
              aria-label={t('choose_hour')}
              aria-valuetext={valueText}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
