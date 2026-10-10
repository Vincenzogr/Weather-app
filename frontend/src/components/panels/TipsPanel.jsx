import { useTranslation } from 'react-i18next';
import {
  Check, Droplets, Glasses, ShieldAlert, Shirt, ThermometerSnowflake, ThermometerSun, Umbrella, Wind, CloudRain,
} from 'lucide-react';

function buildTips({ temp, humidity, uvMax, aqi, rainMax, windMax, maxTemp }) {
  const tips = [];
  if (uvMax > 8) tips.push({ key: 'tip_uv_extreme', icon: ShieldAlert, tone: 'warning' });
  else if (uvMax > 5) tips.push({ key: 'tip_uv_high', icon: Glasses, tone: 'caution' });

  if (aqi > 60) tips.push({ key: 'tip_aqi_bad', icon: ShieldAlert, tone: 'warning' });
  else if (aqi > 40) tips.push({ key: 'tip_aqi_moderate', icon: Wind, tone: 'caution' });

  if (rainMax > 75) tips.push({ key: 'tip_rain_high', icon: Umbrella, tone: 'info' });
  else if (rainMax > 50) tips.push({ key: 'tip_rain_moderate', icon: CloudRain, tone: 'info' });

  if (windMax > 60) tips.push({ key: 'tip_wind_strong', icon: Wind, tone: 'warning' });
  else if (windMax > 40) tips.push({ key: 'tip_wind_moderate', icon: Wind, tone: 'caution' });

  if (temp < 0) tips.push({ key: 'tip_temp_freezing', icon: ThermometerSnowflake, tone: 'warning' });
  else if (temp < 5) tips.push({ key: 'tip_temp_cold', icon: Shirt, tone: 'caution' });
  else if (maxTemp > 35) tips.push({ key: 'tip_temp_hot', icon: ThermometerSun, tone: 'warning' });

  if (humidity > 80 && temp > 20) tips.push({ key: 'tip_humidity', icon: Droplets, tone: 'caution' });

  const order = { warning: 0, caution: 1, info: 2 };
  return tips.sort((a, b) => order[a.tone] - order[b.tone]).slice(0, 3);
}

/** Avvisi pratici per oggi, dal più importante. */
export default function TipsPanel({ weather, forecast, air }) {
  const { t } = useTranslation();
  const { daily } = forecast;
  const tips = buildTips({
    temp: weather.main?.temp ?? 15,
    humidity: weather.main?.humidity ?? 50,
    uvMax: daily.uv_index_max?.[0] ?? 0,
    aqi: air?.current?.european_aqi ?? 0,
    rainMax: daily.precipitation_probability_max?.[0] ?? 0,
    windMax: daily.wind_speed_10m_max?.[0] ?? 0,
    maxTemp: daily.temperature_2m_max?.[0] ?? 20,
  });

  return (
    <section className="panel tips" aria-labelledby="tips-title">
      <h2 id="tips-title" className="panel__title">{t('tips_today')}</h2>
      {tips.length === 0 ? (
        <p className="tips__calm">
          <Check size={18} aria-hidden="true" />
          {t('tips_none')}
        </p>
      ) : (
        <ul className="tips__list">
          {tips.map(({ key, icon: Icon, tone }) => (
            <li key={key} className={`tip tip--${tone}`}>
              <span className="tip__icon"><Icon size={18} strokeWidth={1.75} aria-hidden="true" /></span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
