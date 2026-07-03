import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { mpsToKmh } from '../utils/weatherHelpers';

function buildTips(weather, forecast, airQuality, t) {
  const tips = [];
  const temp      = weather?.main?.temp ?? 20;
  const humidity  = weather?.main?.humidity ?? 50;
  const windSpeed = mpsToKmh(weather?.wind?.speed ?? 0);
  const uvValue   = forecast?.daily?.uv_index_max?.[0] ?? 0;
  const rainProb  = forecast?.daily?.precipitation_probability_max?.[0] ?? 0;
  const aqi       = airQuality?.current?.european_aqi ?? 0;

  if (uvValue > 8) {
    tips.push({ emoji: '☀️', text: t('tip_uv_extreme', 'Indice UV estremamente alto — usa protezione solare SPF 50+ e limita l\'esposizione diretta.'), type: 'warning' });
  } else if (uvValue > 5) {
    tips.push({ emoji: '🕶️', text: t('tip_uv_high', 'Indice UV elevato — usa protezione solare e occhiali da sole.'), type: 'caution' });
  }

  if (aqi > 60) {
    tips.push({ emoji: '😷', text: t('tip_aqi_bad', 'Qualità dell\'aria scarsa — evita attività fisiche intense all\'aperto.'), type: 'warning' });
  } else if (aqi > 40) {
    tips.push({ emoji: '🌬️', text: t('tip_aqi_moderate', 'Qualità dell\'aria moderata — le persone sensibili dovrebbero limitare l\'esposizione.'), type: 'caution' });
  }

  if (rainProb > 75) {
    tips.push({ emoji: '🌧️', text: t('tip_rain_high', 'Alta probabilità di pioggia — porta un ombrello e pianifica i tuoi spostamenti.'), type: 'info' });
  } else if (rainProb > 50) {
    tips.push({ emoji: '🌦️', text: t('tip_rain_moderate', 'Possibili precipitazioni nel corso della giornata — tieniti aggiornato.'), type: 'info' });
  }

  if (windSpeed > 60) {
    tips.push({ emoji: '💨', text: t('tip_wind_strong', 'Vento molto forte — attenzione alla guida e agli oggetti non ancorati.'), type: 'warning' });
  } else if (windSpeed > 40) {
    tips.push({ emoji: '🍃', text: t('tip_wind_moderate', 'Vento sostenuto previsto — attenzione nelle aree esposte.'), type: 'caution' });
  }

  if (temp < 0) {
    tips.push({ emoji: '🥶', text: t('tip_temp_freezing', 'Temperature sotto lo zero — rischio di ghiaccio sulle strade. Guida con prudenza.'), type: 'warning' });
  } else if (temp < 5) {
    tips.push({ emoji: '🧥', text: t('tip_temp_cold', 'Temperature molto basse — copriti bene con abiti a strati.'), type: 'cold' });
  } else if (temp > 35) {
    tips.push({ emoji: '🔥', text: t('tip_temp_hot', 'Caldo intenso — idratati frequentemente ed evita le ore più calde.'), type: 'warning' });
  }

  if (humidity > 80 && temp > 20) {
    tips.push({ emoji: '💧', text: t('tip_humidity', 'Umidità elevata — la sensazione di caldo sarà accentuata. Cerca luoghi freschi e ventilati.'), type: 'caution' });
  }

  return tips.slice(0, 3);
}

export default function WeatherTips({ weather, forecast, airQuality }) {
  const { t } = useTranslation();
  const tips = useMemo(() => buildTips(weather, forecast, airQuality, t), [weather, forecast, airQuality, t]);

  if (!weather || tips.length === 0) return null;

  return (
    <motion.div
      className="glass-panel weather-tips"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="tips-header">
        💡 {t('weather_tips', 'Suggerimenti Meteo')}
      </div>
      <AnimatePresence>
        {tips.map((tip, i) => (
          <motion.div
            key={`${tip.type}-${i}`}
            className={`tip-item tip-${tip.type}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className="tip-emoji">{tip.emoji}</span>
            <span className="tip-text">{tip.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
