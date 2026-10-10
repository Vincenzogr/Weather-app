package com.weatherapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.weatherapp.config.CacheConfig;
import com.weatherapp.dto.BackgroundPhoto;
import com.weatherapp.exception.ApiException;
import com.weatherapp.exception.ErrorCode;
import com.weatherapp.exception.WeatherException;
import com.weatherapp.model.GeoPoint;
import com.weatherapp.model.SkyCondition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * WeatherService — gestisce tutte le chiamate alle API esterne.
 *
 * Gli URL sono costruiti con {@link UriComponentsBuilder} (nessuna concatenazione
 * di input utente), ogni risposta è messa in cache con una scadenza
 * (vedi {@link CacheConfig}) e le chiavi API non lasciano mai il server.
 */
@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

    private static final String OWM_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
    private static final String OWM_REVERSE_URL = "https://api.openweathermap.org/geo/1.0/reverse";
    private static final String OWM_TILE_URL = "https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png";
    private static final String GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
    private static final String FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
    private static final String AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
    private static final String PEXELS_URL = "https://api.pexels.com/v1/search";

    private static final String HOURLY_FIELDS = String.join(",",
            "temperature_2m", "apparent_temperature", "precipitation_probability", "precipitation",
            "wind_speed_10m", "weather_code", "is_day", "relative_humidity_2m", "cloud_cover");
    private static final String DAILY_FIELDS = String.join(",",
            "weather_code", "temperature_2m_max", "temperature_2m_min", "uv_index_max",
            "precipitation_probability_max", "precipitation_sum", "wind_speed_10m_max",
            "wind_direction_10m_dominant", "sunrise", "sunset");
    private static final String AIR_FIELDS = String.join(",",
            "european_aqi", "uv_index", "pm2_5", "pm10", "nitrogen_dioxide", "ozone");

    public static final Set<String> SUPPORTED_LANGUAGES = Set.of("it", "en", "fr", "de", "es", "ja");
    public static final Set<String> MAP_LAYERS = Set.of(
            "precipitation_new", "temp_new", "wind_new", "clouds_new", "pressure_new");
    private static final String DEFAULT_LANGUAGE = "it";
    private static final int MAX_CITY_LENGTH = 100;
    private static final int MAX_TILE_ZOOM = 12;

    private final RestClient restClient;
    private final String owmApiKey;
    private final String pexelsApiKey;

    public WeatherService(
            RestClient.Builder restClientBuilder,
            @Value("${openweathermap.api.key:}") String owmApiKey,
            @Value("${pexels.api.key:}") String pexelsApiKey) {

        this.restClient = restClientBuilder.build();
        this.owmApiKey = cleanKey(owmApiKey);
        this.pexelsApiKey = cleanKey(pexelsApiKey);

        if (this.owmApiKey == null) {
            log.warn("API key OpenWeatherMap mancante: imposta OPENWEATHERMAP_API_KEY o application-secret.properties");
        }
        if (this.pexelsApiKey == null) {
            log.info("API key Pexels mancante: lo sfondo fotografico sarà disattivato");
        }
    }

    // ── Meteo attuale (OpenWeatherMap) ────────────────────────────────────

    @Cacheable(CacheConfig.WEATHER)
    public String getWeatherByCity(String city, String lang) {
        String query = normalizeCity(city);
        URI uri = UriComponentsBuilder.fromUriString(OWM_WEATHER_URL)
                .queryParam("q", query)          // OWM accetta "Roma,IT": la virgola resta letterale
                .queryParam("appid", requireOwmKey())
                .queryParam("units", "metric")
                .queryParam("lang", lang)
                .build().encode().toUri();

        return restClient.get().uri(uri).retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    int status = response.getStatusCode().value();
                    if (status == 404) {
                        throw new ApiException("Meteo", ErrorCode.CITY_NOT_FOUND,
                                "Città '" + query + "' non trovata", status);
                    }
                    throw upstreamError("Meteo", status, "Impossibile recuperare i dati meteo");
                })
                .body(String.class);
    }

    @Cacheable(CacheConfig.WEATHER)
    public String getWeatherByCoordinates(GeoPoint point, String lang) {
        URI uri = UriComponentsBuilder.fromUriString(OWM_WEATHER_URL)
                .queryParam("lat", point.lat())
                .queryParam("lon", point.lon())
                .queryParam("appid", requireOwmKey())
                .queryParam("units", "metric")
                .queryParam("lang", lang)
                .build().encode().toUri();
        return fetch(uri, "Meteo", "Impossibile recuperare i dati meteo");
    }

    @Cacheable(CacheConfig.REVERSE_GEOCODING)
    public String getReverseGeocode(GeoPoint point, String lang) {
        URI uri = UriComponentsBuilder.fromUriString(OWM_REVERSE_URL)
                .queryParam("lat", point.lat())
                .queryParam("lon", point.lon())
                .queryParam("limit", 1)
                .queryParam("appid", requireOwmKey())
                .queryParam("lang", lang)
                .build().encode().toUri();
        return fetch(uri, "Localizzazione", "Impossibile localizzare la posizione");
    }

    // ── Open-Meteo: ricerca città, previsioni, qualità dell'aria ─────────

    @Cacheable(CacheConfig.GEOCODING)
    public String searchCities(String city, String lang) {
        // Rimuove il codice paese se presente (es. "Rome, IT" → "Rome")
        String name = normalizeCity(city).split(",")[0].trim();
        URI uri = UriComponentsBuilder.fromUriString(GEO_URL)
                .queryParam("name", name)
                .queryParam("count", 6)
                .queryParam("language", lang)
                .queryParam("format", "json")
                .build().encode().toUri();
        return fetch(uri, "Ricerca", "Impossibile elaborare la ricerca della città");
    }

    @Cacheable(CacheConfig.FORECAST)
    public String getForecast(GeoPoint point) {
        URI uri = UriComponentsBuilder.fromUriString(FORECAST_URL)
                .queryParam("latitude", point.lat())
                .queryParam("longitude", point.lon())
                .queryParam("hourly", HOURLY_FIELDS)
                .queryParam("daily", DAILY_FIELDS)
                .queryParam("timezone", "auto")
                .queryParam("forecast_days", 7)
                .build().encode().toUri();
        return fetch(uri, "Previsioni", "Impossibile scaricare le previsioni");
    }

    @Cacheable(CacheConfig.AIR_QUALITY)
    public String getAirQuality(GeoPoint point) {
        URI uri = UriComponentsBuilder.fromUriString(AIR_QUALITY_URL)
                .queryParam("latitude", point.lat())
                .queryParam("longitude", point.lon())
                .queryParam("current", AIR_FIELDS)
                .queryParam("timezone", "auto")
                .build().encode().toUri();
        return fetch(uri, "Qualità Aria", "Impossibile scaricare i dati della qualità dell'aria");
    }

    // ── Sfondi (Pexels) ───────────────────────────────────────────────────

    @Cacheable(CacheConfig.BACKGROUNDS)
    public List<BackgroundPhoto> getBackgrounds(SkyCondition condition, boolean night) {
        if (pexelsApiKey == null) {
            return List.of();
        }
        URI uri = UriComponentsBuilder.fromUriString(PEXELS_URL)
                .queryParam("query", condition.query(night))
                .queryParam("per_page", 6)
                .queryParam("orientation", "landscape")
                .build().encode().toUri();

        JsonNode body = restClient.get().uri(uri)
                .header("Authorization", pexelsApiKey)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw upstreamError("Immagini", response.getStatusCode().value(), "Impossibile recuperare lo sfondo");
                })
                .body(JsonNode.class);

        List<BackgroundPhoto> photos = new ArrayList<>();
        if (body != null) {
            for (JsonNode photo : body.path("photos")) {
                String src = photo.path("src").path("large2x").asText(null);
                if (src == null) continue;
                photos.add(new BackgroundPhoto(
                        src,
                        photo.path("alt").asText(""),
                        photo.path("avg_color").asText(null),
                        photo.path("photographer").asText(""),
                        photo.path("photographer_url").asText(null),
                        photo.path("url").asText(null)));
            }
        }
        return List.copyOf(photos);
    }

    // ── Tile radar (proxy: la chiave OWM non arriva al browser) ──────────

    @Cacheable(CacheConfig.MAP_TILES)
    public byte[] getMapTile(String layer, int z, int x, int y) {
        if (!MAP_LAYERS.contains(layer)) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Layer mappa non supportato");
        }
        if (z < 0 || z > MAX_TILE_ZOOM) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Zoom non valido");
        }
        int max = 1 << z;
        if (x < 0 || y < 0 || x >= max || y >= max) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Coordinate tile non valide");
        }
        URI uri = UriComponentsBuilder.fromUriString(OWM_TILE_URL)
                .queryParam("appid", requireOwmKey())
                .buildAndExpand(layer, z, x, y)
                .encode().toUri();

        return restClient.get().uri(uri).retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw upstreamError("Radar", response.getStatusCode().value(), "Impossibile caricare la mappa radar");
                })
                .body(byte[].class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /** Riduce la lingua richiesta a una di quelle supportate (default: italiano). */
    public static String normalizeLanguage(String lang) {
        if (lang == null || lang.length() < 2) {
            return DEFAULT_LANGUAGE;
        }
        String code = lang.substring(0, 2).toLowerCase(Locale.ROOT);
        return SUPPORTED_LANGUAGES.contains(code) ? code : DEFAULT_LANGUAGE;
    }

    private static String normalizeCity(String city) {
        if (city == null || city.isBlank()) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Nome città non può essere vuoto");
        }
        String trimmed = city.trim().replaceAll("\\s+", " ");
        if (trimmed.length() > MAX_CITY_LENGTH) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Nome città troppo lungo");
        }
        return trimmed;
    }

    private String fetch(URI uri, String apiName, String failureMessage) {
        return restClient.get().uri(uri).retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw upstreamError(apiName, response.getStatusCode().value(), failureMessage);
                })
                .body(String.class);
    }

    private static ApiException upstreamError(String apiName, int status, String message) {
        if (status == 401 || status == 403) {
            return new ApiException(apiName, ErrorCode.SERVICE_NOT_CONFIGURED,
                    "Servizio momentaneamente non disponibile (errore di configurazione)", status);
        }
        if (status == 429 || status >= 500) {
            return new ApiException(apiName, ErrorCode.UPSTREAM_UNAVAILABLE,
                    message + ": servizio esterno non disponibile, riprova tra poco", status);
        }
        return new ApiException(apiName, ErrorCode.UPSTREAM_ERROR, message + " (" + status + ")", status);
    }

    private String requireOwmKey() {
        if (owmApiKey == null) {
            throw new WeatherException(ErrorCode.SERVICE_NOT_CONFIGURED,
                    "API key OpenWeatherMap non configurata sul server");
        }
        return owmApiKey;
    }

    private static String cleanKey(String key) {
        if (key == null || key.isBlank() || key.startsWith("IL_TUO_")) {
            return null;
        }
        return key.trim();
    }
}
