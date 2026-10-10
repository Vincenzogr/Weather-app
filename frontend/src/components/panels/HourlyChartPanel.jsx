import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Line, Bar } from 'react-chartjs-2';
import {
  BarElement, CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip,
} from 'chart.js';
import { Droplets, Thermometer, Wind } from 'lucide-react';
import { formatPrecip, tempValue, windValue } from '../../utils/weather';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

const MODES = [
  { key: 'temp', labelKey: 'temperature', icon: Thermometer },
  { key: 'rain', labelKey: 'precipitation', icon: Droplets },
  { key: 'wind', labelKey: 'wind', icon: Wind },
];

/** Linea verticale sull'ora scelta con lo slider. */
const selectedHourPlugin = {
  id: 'selectedHour',
  afterDatasetsDraw(chart, _args, options) {
    if (options.index == null) return;
    const x = chart.scales.x.getPixelForValue(options.index);
    const { top, bottom } = chart.chartArea;
    const { ctx } = chart;
    ctx.save();
    ctx.strokeStyle = options.color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  },
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Andamento orario del giorno scelto. La scala della temperatura è quella
 * dell'intera settimana, così passando da un giorno all'altro il grafico non "mente".
 */
export default function HourlyChartPanel({ forecast, timeline, dayIndex, selectedHour, units, theme }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('temp');
  const { hourly, daily } = forecast;
  const day = timeline.days[dayIndex] ?? timeline.days[0];

  const { labels, values, precipMm } = useMemo(() => {
    const idx = day.hours;
    return {
      labels: idx.map((i) => hourly.time[i].slice(11, 16)),
      values: idx.map((i) => {
        if (mode === 'temp') return tempValue(hourly.temperature_2m[i], units);
        if (mode === 'rain') return hourly.precipitation_probability?.[i] ?? 0;
        return windValue(hourly.wind_speed_10m?.[i] ?? 0, units);
      }),
      precipMm: idx.map((i) => hourly.precipitation?.[i] ?? 0),
    };
  }, [day, hourly, mode, units]);

  const colors = useMemo(() => ({
    temp: cssVar('--series-temp'),
    rain: cssVar('--series-rain'),
    wind: cssVar('--series-wind'),
    ink: cssVar('--ink-2'),
    line: cssVar('--chart-line'),
    surface: cssVar('--tooltip-bg'),
    cursor: cssVar('--chart-cursor'),
    inkStrong: cssVar('--ink'),
  // theme cambia le variabili CSS: ricalcola i colori
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [theme]);

  const unitSuffix = mode === 'temp' ? '°' : mode === 'rain' ? '%' : units === 'imperial' ? ' mph' : ' km/h';
  const color = colors[mode];

  const yRange = mode === 'temp'
    ? {
      min: Math.floor((tempValue(Math.min(...daily.temperature_2m_min), units) - 1) / 5) * 5,
      max: Math.ceil((tempValue(Math.max(...daily.temperature_2m_max), units) + 1) / 5) * 5,
    }
    : mode === 'rain' ? { min: 0, max: 100 } : { min: 0, suggestedMax: units === 'imperial' ? 20 : 30 };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      selectedHour: { index: selectedHour, color: colors.cursor },
      tooltip: {
        backgroundColor: colors.surface,
        titleColor: colors.ink,
        bodyColor: colors.inkStrong,
        borderColor: colors.line,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { family: 'Archivo Variable', size: 12 },
        bodyFont: { family: 'Archivo Variable', size: 14, weight: '600' },
        callbacks: {
          label: (ctx) => {
            const base = `${ctx.parsed.y}${unitSuffix}`;
            return mode === 'rain' ? `${base} · ${formatPrecip(precipMm[ctx.dataIndex], units)}` : base;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: colors.line },
        ticks: { color: colors.ink, font: { family: 'Archivo Variable', size: 11 }, maxTicksLimit: 8, maxRotation: 0 },
      },
      y: {
        ...yRange,
        grid: { color: colors.line },
        border: { display: false },
        ticks: {
          color: colors.ink, font: { family: 'Archivo Variable', size: 11 }, maxTicksLimit: 5,
          callback: (v) => `${v}${mode === 'wind' ? '' : unitSuffix}`,
        },
      },
    },
  };

  const dataset = {
    labels,
    datasets: [mode === 'rain'
      ? { data: values, backgroundColor: color, borderRadius: 3, maxBarThickness: 14 }
      : {
        data: values,
        borderColor: color,
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        fill: true,
        backgroundColor: (ctx) => {
          const { chartArea, ctx: c } = ctx.chart;
          if (!chartArea) return 'transparent';
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, `${color}55`);
          g.addColorStop(1, `${color}00`);
          return g;
        },
      }],
  };

  const Chart = mode === 'rain' ? Bar : Line;

  return (
    <section className="panel chart-panel" aria-labelledby="chart-title">
      <div className="panel__head">
        <h2 id="chart-title" className="panel__title">{t('hourly_trend')}</h2>
        <div className="segmented" role="tablist" aria-label={t('hourly_trend')}>
          {MODES.map(({ key, labelKey, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              className={`segmented__option${mode === key ? ' is-active' : ''}`}
              onClick={() => setMode(key)}
            >
              <Icon size={14} aria-hidden="true" />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-panel__canvas" role="img" aria-label={`${t('hourly_trend')}: ${t(MODES.find((m) => m.key === mode).labelKey)}`}>
        <Chart data={dataset} options={options} plugins={[selectedHourPlugin]} />
      </div>
    </section>
  );
}
