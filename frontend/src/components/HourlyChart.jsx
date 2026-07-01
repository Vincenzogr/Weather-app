import React, { useState, useMemo } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TABS = [
  { key: 'temp',  label: 'Temperatura', icon: Thermometer, color: '#38bdf8', bg: 'rgba(56,189,248,0.15)',  unit: '°' },
  { key: 'rain',  label: 'Pioggia',     icon: Droplets,    color: '#818cf8', bg: 'rgba(129,140,248,0.15)', unit: '%' },
  { key: 'wind',  label: 'Vento',       icon: Wind,        color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', unit: '' },
];

export default function HourlyChart({ forecast, selectedDay, unit = 'C' }) {
  const [chartMode, setChartMode] = useState('temp');

  const chartData = useMemo(() => {
    if (!forecast) return null;
    const startIndex = selectedDay * 24;
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
    datasets: [{
      label: tab.label,
      data:  chartData.rawData,
      borderColor: tab.color,
      backgroundColor: tab.bg,
      pointBackgroundColor: tab.color,
      pointBorderColor: 'transparent',
      pointRadius: 3,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.45,
      borderWidth: 2.5,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13, 25, 41, 0.92)',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        bodyFont: { family: 'Outfit', size: 15, weight: '700' },
        titleFont: { family: 'Inter', size: 11 },
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}${tab.unit} ${tab.label}`,
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
      <div className="chart-header">
        <span className="chart-title">Andamento orario — {tab.label}</span>
        <div className="chart-tabs" role="tablist">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                id={`chart-tab-${t.key}`}
                className={`chart-tab ${chartMode === t.key ? 'active' : ''}`}
                onClick={() => setChartMode(t.key)}
                role="tab"
                aria-selected={chartMode === t.key}
              >
                <Icon size={12} style={{ display: 'inline', marginRight: 4 }} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="chart-canvas-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
