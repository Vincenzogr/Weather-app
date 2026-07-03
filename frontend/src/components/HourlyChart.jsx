import React, { useState, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getWeatherCodeInfo, formatTempShort } from '../utils/weatherHelpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TABS = [
  { key: 'temp',  labelKey: 'hourly_temp', icon: Thermometer, color: '#38bdf8', unit: '°' },
  { key: 'rain',  labelKey: 'rain',        icon: Droplets,    color: '#818cf8', unit: '%' },
  { key: 'wind',  labelKey: 'wind',        icon: Wind,        color: '#a78bfa', unit: '' },
];

// Plugin per gradient fill
function buildGradientDataset(ctx, color, labels, rawData, labelStr, unit) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0,   color.replace(')', ',0.35)').replace('rgb', 'rgba'));
  gradient.addColorStop(1,   color.replace(')', ',0.0)').replace('rgb', 'rgba'));
  return {
    label: labelStr,
    data: rawData,
    borderColor: color,
    backgroundColor: gradient,
    pointBackgroundColor: color,
    pointBorderColor: 'transparent',
    pointRadius: 3,
    pointHoverRadius: 6,
    fill: true,
    tension: 0.45,
    borderWidth: 2.5,
  };
}

export default function HourlyChart({ forecast, selectedDay, unit = 'C' }) {
  const { t } = useTranslation();
  const [chartMode, setChartMode] = useState('temp');
  const chartRef = useRef(null);
  const carouselRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const startIndex = selectedDay * 24;

  // Dati per il carosello orario
  const hourlySlots = useMemo(() => {
    if (!forecast) return [];
    return forecast.hourly.time
      .slice(startIndex, startIndex + 24)
      .map((timeStr, i) => {
        const hour = timeStr.split('T')[1]?.slice(0, 5) ?? '';
        const temp = forecast.hourly.temperature_2m?.[startIndex + i] ?? 0;
        const code = forecast.hourly.weathercode?.[startIndex + i] ?? 0;
        const rainP = forecast.hourly.precipitation_probability?.[startIndex + i] ?? 0;
        const { emoji } = getWeatherCodeInfo(code);
        const nowHour = new Date().getHours();
        const slotHour = parseInt(hour.split(':')[0], 10);
        const isCurrent = selectedDay === 0 && slotHour === nowHour;
        return { hour, temp, emoji, rainP, isCurrent };
      });
  }, [forecast, selectedDay]);

  // Dati per il grafico
  const chartData = useMemo(() => {
    if (!forecast) return null;
    const labels = forecast.hourly.time
      .slice(startIndex, startIndex + 24)
      .map(t => t.split('T')[1].slice(0, 5));

    let rawData;
    if (chartMode === 'temp') {
      const temps = forecast.hourly.temperature_2m?.slice(startIndex, startIndex + 24) ?? [];
      rawData = unit === 'F' ? temps.map(t => Math.round((t * 9) / 5 + 32)) : temps.map(Math.round);
    } else if (chartMode === 'rain') {
      rawData = forecast.hourly.precipitation_probability?.slice(startIndex, startIndex + 24) ?? Array(24).fill(0);
    } else {
      const speedData = forecast.hourly.windspeed_10m?.slice(startIndex, startIndex + 24) ?? Array(24).fill(0);
      rawData = unit === 'F' ? speedData.map(v => Math.round(v * 0.621371)) : speedData;
    }
    return { labels, rawData };
  }, [forecast, selectedDay, chartMode, unit]);

  if (!chartData) return null;

  const tab = TABS.find(t => t.key === chartMode);

  const data = {
    labels: chartData.labels,
    datasets: [
      buildGradientDataset(
        chartRef.current?.ctx ?? document.createElement('canvas').getContext('2d'),
        tab.color,
        chartData.labels,
        chartData.rawData,
        t(tab.labelKey),
        tab.unit
      )
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13, 25, 41, 0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(56,189,248,0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        bodyFont: { family: 'Outfit', size: 15, weight: '700' },
        titleFont: { family: 'Inter', size: 11 },
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}${tab.unit} ${t(tab.labelKey)}`,
        }
      }
    },
    scales: {
      x: {
        grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: {
          color: 'rgba(248,250,252,0.4)',
          font: { family: 'Inter', size: 11 },
          maxTicksLimit: 12,
        }
      },
      y: {
        grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: {
          color: 'rgba(248,250,252,0.4)',
          font: { family: 'Inter', size: 11 },
          callback: (v) => `${v}${tab.unit}`,
        }
      }
    },
    interaction: { mode: 'index', intersect: false },
  };

  return (
    <div className="chart-container">
      {/* Carosello 24h */}
      <div 
        className="hourly-carousel" 
        role="list" 
        aria-label="Previsioni orarie"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {hourlySlots.map((slot, i) => (
          <div
            key={i}
            className={`hourly-card${slot.isCurrent ? ' current-hour' : ''}`}
            role="listitem"
          >
            <span className="hourly-time">{slot.hour}</span>
            <span className="hourly-icon">{slot.emoji}</span>
            <span className="hourly-temp">{formatTempShort(slot.temp, unit)}</span>
            {slot.rainP > 0 && (
              <span className="hourly-rain">💧{slot.rainP}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Header grafico */}
      <div className="chart-header">
        <span className="chart-title">{t('hourly_trend')} — {t(tab.labelKey)}</span>
        <div className="chart-tabs" role="tablist">
          {TABS.map(tItem => {
            const Icon = tItem.icon;
            return (
              <button
                key={tItem.key}
                id={`chart-tab-${tItem.key}`}
                className={`chart-tab ${chartMode === tItem.key ? 'active' : ''}`}
                onClick={() => setChartMode(tItem.key)}
                role="tab"
                aria-selected={chartMode === tItem.key}
              >
                <Icon size={12} style={{ display: 'inline', marginRight: 4 }} />
                {t(tItem.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="chart-canvas-wrapper">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}
