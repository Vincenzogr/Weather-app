package com.weatherapp;

import java.io.*;
import java.net.*;
import java.net.http.*;
import java.util.Properties;

/**
 * WeatherService — gestisce tutte le chiamate alle API esterne.
 *
 * API utilizzate:
 * - OpenWeatherMap: meteo attuale (richiede API key)
 * - Open-Meteo Geocoding: conversione città → coordinate (gratuita)
 * - Open-Meteo Forecast: previsioni 7 giorni + UV index (gratuita)
 *
 * La API key è caricata da WEB-INF/config.properties
 * e NON è hardcodata nel codice sorgente.
 */
public class WeatherService {

    private static final String OWM_BASE_URL =
        "https://api.openweathermap.org/data/2.5/weather";
    private static final String GEO_URL =
        "https://geocoding-api.open-meteo.com/v1/search";
    private static final String FORECAST_URL =
        "https://api.open-meteo.com/v1/forecast";

    private final HttpClient httpClient;
    private final String owmApiKey;

    /**
     * Costruttore: carica la API key dal file config.properties.
     * @param configPath path assoluto al file config.properties
     * @throws WeatherException se il file non esiste o la key è mancante
     */
    public WeatherService(String configPath) throws WeatherException {
        this.httpClient = HttpClient.newHttpClient();

        try {
            Properties props = new Properties();
            try (InputStream input = new FileInputStream(configPath)) {
                props.load(input);
            }

            this.owmApiKey = props.getProperty("openweathermap.api.key");

            if (owmApiKey == null || owmApiKey.trim().isEmpty()) {
                throw new WeatherException(
                    "API key OpenWeatherMap non trovata in config.properties", 500
                );
            }

        } catch (IOException e) {
            throw new WeatherException(
                "Impossibile leggere config.properties: " + e.getMessage(), 500, e
            );
        }
    }

    /**
     * Recupera il meteo attuale per una città tramite OpenWeatherMap.
     * @param city nome della città (es. "Roma" o "Rome, IT")
     * @return JSON grezzo della risposta OpenWeatherMap
     * @throws WeatherException se la città non esiste o la API fallisce
     */
    public String getWeather(String city) throws WeatherException {
        // Validazione input
        if (city == null || city.trim().isEmpty()) {
            throw new WeatherException("Nome città non può essere vuoto", 400);
        }

        try {
            String url = String.format(
                "%s?q=%s&appid=%s&units=metric&lang=it",
                OWM_BASE_URL,
                URLEncoder.encode(city.trim(), "UTF-8"),
                owmApiKey
            );

            HttpResponse<String> response = sendRequest(url);

            // 401 = API key non valida
            if (response.statusCode() == 401) {
                throw new ApiException("OpenWeatherMap",
                    "API key non valida o non ancora attiva", 401);
            }

            // 404 = città non trovata
            if (response.statusCode() == 404) {
                throw new ApiException("OpenWeatherMap",
                    "Città '" + city + "' non trovata", 404);
            }

            // Altri errori
            if (response.statusCode() != 200) {
                throw new ApiException("OpenWeatherMap",
                    "Errore API: " + response.statusCode(), response.statusCode());
            }

            return response.body();

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new WeatherException(
                "Errore di rete durante il meteo: " + e.getMessage(), 503, e
            );
        }
    }

    /**
     * Recupera le coordinate geografiche di una città tramite Open-Meteo Geocoding.
     * @param city nome della città
     * @return JSON con latitudine e longitudine
     * @throws WeatherException se la città non esiste o la API fallisce
     */
    public String getCoordinates(String city) throws WeatherException {
        if (city == null || city.trim().isEmpty()) {
            throw new WeatherException("Nome città non può essere vuoto", 400);
        }

        try {
            String url = String.format(
                "%s?name=%s&count=1&language=it&format=json",
                GEO_URL,
                URLEncoder.encode(city.trim(), "UTF-8")
            );

            HttpResponse<String> response = sendRequest(url);

            if (response.statusCode() != 200) {
                throw new ApiException("Open-Meteo Geocoding",
                    "Errore geocoding: " + response.statusCode(),
                    response.statusCode());
            }

            return response.body();

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new WeatherException(
                "Errore di rete durante il geocoding: " + e.getMessage(), 503, e
            );
        }
    }

    /**
     * Recupera le previsioni meteo per 7 giorni tramite Open-Meteo.
     * Include temperature orarie, weathercode giornaliero e UV index.
     * @param latitude  latitudine della città
     * @param longitude longitudine della città
     * @return JSON con previsioni orarie e giornaliere
     * @throws WeatherException se le coordinate non sono valide o la API fallisce
     */
    public String getForecast(String latitude, String longitude) throws WeatherException {
        if (latitude == null || longitude == null) {
            throw new WeatherException("Latitudine e longitudine obbligatorie", 400);
        }

        try {
            String url = String.format(
                "%s?latitude=%s&longitude=%s" +
                "&hourly=temperature_2m,weathercode" +
                "&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max" +
                "&timezone=auto&forecast_days=7",
                FORECAST_URL,
                latitude.trim(),
                longitude.trim()
            );

            HttpResponse<String> response = sendRequest(url);

            if (response.statusCode() != 200) {
                throw new ApiException("Open-Meteo Forecast",
                    "Errore previsioni: " + response.statusCode(),
                    response.statusCode());
            }

            return response.body();

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new WeatherException(
                "Errore di rete durante le previsioni: " + e.getMessage(), 503, e
            );
        }
    }

    /**
     * Metodo privato helper: invia una richiesta HTTP GET.
     * Centralizza la logica di invio per evitare duplicazioni.
     * @param url URL completo con parametri
     * @return HttpResponse con il body come stringa
     */
    private HttpResponse<String> sendRequest(String url)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Accept", "application/json")
            .GET()
            .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}