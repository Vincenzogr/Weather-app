import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

/**
 * Custom hook for fetching weather data.
 * Returns { weather, forecast, loading, error, handleSearch }
 */
export function useWeatherData() {
  const { i18n } = useTranslation();
  const [weather,    setWeather]    = useState(null);
  const [forecast,   setForecast]   = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const handleSearch = useCallback(async (cityName) => {
    const city = (cityName || '').trim();
    if (!city) return;

    setLoading(true);
    setError('');
    setWeather(null);
    setForecast(null);
    setAirQuality(null);

    try {
      const lang = i18n.language || 'it';
      // 1. Current weather (OWM)
      const wRes = await axios.get(`/api/weather?city=${encodeURIComponent(city)}&lang=${lang}`);
      setWeather(wRes.data);

      // 2. Coordinates for Open-Meteo
      const cityOnly = city.split(',')[0].trim();
      const cRes = await axios.get(`/api/coordinates?city=${encodeURIComponent(cityOnly)}&lang=${lang}`);
      const results = cRes.data.results;
      if (!results || results.length === 0) {
        throw new Error(`Città "${city}" non trovata nelle previsioni`);
      }
      const { latitude, longitude } = results[0];

      // 3. 7-day forecast (Open-Meteo)
      const fRes = await axios.get(`/api/forecast?lat=${latitude}&lon=${longitude}`);
      setForecast(fRes.data);

      // 4. Air Quality (Open-Meteo)
      try {
        const aqiRes = await axios.get(`/api/air-quality?lat=${latitude}&lon=${longitude}`);
        setAirQuality(aqiRes.data);
      } catch (e) {
        console.warn("Impossibile recuperare i dati AQI", e);
      }

      return wRes.data.name; // return canonical city name
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Errore durante la ricerca della città.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  return { weather, forecast, airQuality, loading, error, handleSearch };
}
