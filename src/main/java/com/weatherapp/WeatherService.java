package com.weatherapp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * WeatherService — gestisce tutte le chiamate alle API esterne.
 *
 * Utilizza RestClient (Spring 3.2+) per chiamate HTTP semplificate
 * e @Cacheable per evitare chiamate ripetute.
 */
@Service
public class WeatherService {

    private static final String OWM_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
    private static final String GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
    private static final String FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

    private final RestClient restClient;
    private final String owmApiKey;
    private final String pexelsApiKey;

    public WeatherService(
            RestClient.Builder restClientBuilder,
            @Value("${openweathermap.api.key:}") String owmApiKey,
            @Value("${pexels.api.key:}") String pexelsApiKey) throws WeatherException {

        this.restClient = restClientBuilder.build();
        this.owmApiKey = owmApiKey;
        this.pexelsApiKey = pexelsApiKey;

        if (this.owmApiKey == null || this.owmApiKey.trim().isEmpty()) {
            throw new WeatherException(
                "API key OpenWeatherMap non trovata in application.properties", 500
            );
        }
    }

    @Cacheable("backgrounds")
    public String getBackground(String query) throws WeatherException {
        if (query == null || query.trim().isEmpty()) {
            throw new WeatherException("Query non può essere vuota", 400);
        }

        if (this.pexelsApiKey == null || this.pexelsApiKey.trim().isEmpty()) {
            // Return empty JSON array if no key
            return "{\"photos\":[]}";
        }

        String url = String.format("https://api.pexels.com/v1/search?query=%s&per_page=1&orientation=landscape",
                URLEncoder.encode(query.trim(), StandardCharsets.UTF_8)
        );

        return restClient.get()
                .uri(url)
                .header("Authorization", this.pexelsApiKey)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    int status = response.getStatusCode().value();
                    throw new ApiException("Immagini", "Impossibile recuperare lo sfondo (" + status + ")", status);
                })
                .body(String.class);
    }

    @Cacheable("config")
    public String getConfig() {
        return "{\"owmApiKey\": \"" + (this.owmApiKey != null ? this.owmApiKey : "") + "\"}";
    }

    @Cacheable("reverse-geocode")
    public String getReverseGeocode(String lat, String lon) throws WeatherException {
        if (lat == null || lon == null) {
            throw new WeatherException("Latitudine e longitudine obbligatorie", 400);
        }

        String url = String.format("https://api.openweathermap.org/geo/1.0/reverse?lat=%s&lon=%s&limit=1&appid=%s",
                lat.trim(),
                lon.trim(),
                owmApiKey
        );

        return restClient.get()
                .uri(url)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    int status = response.getStatusCode().value();
                    throw new ApiException("Localizzazione", "Impossibile localizzare la posizione (" + status + ")", status);
                })
                .body(String.class);
    }

    @Cacheable("weather_v2")
    public String getWeather(String city) throws WeatherException {
        if (city == null || city.trim().isEmpty()) {
            throw new WeatherException("Nome città non può essere vuoto", 400);
        }

        // OWM supports "q=Roma,IT" — comma must NOT be percent-encoded
        String encodedCity = URLEncoder.encode(city.trim(), StandardCharsets.UTF_8)
                .replace("%2C", ",");   // restore comma for country-code format

        String url = String.format("%s?q=%s&appid=%s&units=metric&lang=it",
                OWM_BASE_URL,
                encodedCity,
                owmApiKey
        );

        return restClient.get()
                .uri(url)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    int status = response.getStatusCode().value();
                    if (status == 401) throw new ApiException("Meteo", "Servizio momentaneamente non disponibile (errore di configurazione)", 401);
                    if (status == 404) throw new ApiException("Meteo", "Città '" + city + "' non trovata", 404);
                    throw new ApiException("Meteo", "Impossibile recuperare i dati meteo (" + status + ")", status);
                })
                .body(String.class);
    }

    @Cacheable("coordinates")
    public String getCoordinates(String city) throws WeatherException {
        if (city == null || city.trim().isEmpty()) {
            throw new WeatherException("Nome città non può essere vuoto", 400);
        }

        String url = String.format("%s?name=%s&count=6&language=it&format=json",
                GEO_URL,
                URLEncoder.encode(city.trim(), StandardCharsets.UTF_8)
        );

        return restClient.get()
                .uri(url)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    int status = response.getStatusCode().value();
                    throw new ApiException("Ricerca", "Impossibile elaborare la ricerca della città (" + status + ")", status);
                })
                .body(String.class);
    }

    @Cacheable("forecast_v2")
    public String getForecast(String latitude, String longitude) throws WeatherException {
        if (latitude == null || longitude == null) {
            throw new WeatherException("Latitudine e longitudine obbligatorie", 400);
        }

        String url = String.format("%s?latitude=%s&longitude=%s" +
                        "&hourly=temperature_2m,precipitation_probability,windspeed_10m,weathercode" +
                        "&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max" +
                        "&timezone=auto&forecast_days=7",
                FORECAST_URL,
                latitude.trim(),
                longitude.trim()
        );

        return restClient.get()
                .uri(url)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    int status = response.getStatusCode().value();
                    throw new ApiException("Previsioni", "Impossibile scaricare le previsioni (" + status + ")", status);
                })
                .body(String.class);
    }
}