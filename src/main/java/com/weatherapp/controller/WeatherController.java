package com.weatherapp.controller;

import com.weatherapp.dto.BackgroundPhoto;
import com.weatherapp.exception.ErrorCode;
import com.weatherapp.exception.WeatherException;
import com.weatherapp.model.GeoPoint;
import com.weatherapp.model.SkyCondition;
import com.weatherapp.service.WeatherService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;

/**
 * API pubblica dei dati meteo. Tutte le chiamate verso servizi esterni
 * passano dal backend: il browser non vede mai le chiavi API.
 */
@RestController
@RequestMapping("/api")
public class WeatherController {

    private static final String JSON_UTF8 = "application/json;charset=UTF-8";

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    /** Meteo attuale per nome città ({@code city}) oppure per coordinate ({@code lat}/{@code lon}). */
    @GetMapping(value = "/weather", produces = JSON_UTF8)
    public ResponseEntity<String> getWeather(@RequestParam(required = false) String city,
                                             @RequestParam(required = false) Double lat,
                                             @RequestParam(required = false) Double lon,
                                             @RequestParam(required = false) String lang) {
        String language = WeatherService.normalizeLanguage(lang);
        if (lat != null || lon != null) {
            return ok(weatherService.getWeatherByCoordinates(GeoPoint.of(lat, lon), language), Duration.ofMinutes(5));
        }
        if (city == null || city.isBlank()) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Parametro 'city' oppure 'lat'/'lon' obbligatorio");
        }
        return ok(weatherService.getWeatherByCity(city, language), Duration.ofMinutes(5));
    }

    /** Ricerca città per l'autocompletamento (Open-Meteo Geocoding). */
    @GetMapping(value = "/coordinates", produces = JSON_UTF8)
    public ResponseEntity<String> searchCities(@RequestParam String city,
                                               @RequestParam(required = false) String lang) {
        return ok(weatherService.searchCities(city, WeatherService.normalizeLanguage(lang)), Duration.ofHours(1));
    }

    @GetMapping(value = "/reverse-geocode", produces = JSON_UTF8)
    public ResponseEntity<String> reverseGeocode(@RequestParam Double lat,
                                                 @RequestParam Double lon,
                                                 @RequestParam(required = false) String lang) {
        return ok(weatherService.getReverseGeocode(GeoPoint.of(lat, lon), WeatherService.normalizeLanguage(lang)),
                Duration.ofHours(1));
    }

    @GetMapping(value = "/forecast", produces = JSON_UTF8)
    public ResponseEntity<String> getForecast(@RequestParam Double lat, @RequestParam Double lon) {
        return ok(weatherService.getForecast(GeoPoint.of(lat, lon)), Duration.ofMinutes(15));
    }

    @GetMapping(value = "/air-quality", produces = JSON_UTF8)
    public ResponseEntity<String> getAirQuality(@RequestParam Double lat, @RequestParam Double lon) {
        return ok(weatherService.getAirQuality(GeoPoint.of(lat, lon)), Duration.ofMinutes(15));
    }

    /** Foto di sfondo per una condizione del cielo (clear, rain, snow, ...) di giorno o di notte. */
    @GetMapping("/background")
    public ResponseEntity<List<BackgroundPhoto>> getBackground(@RequestParam(required = false) String condition,
                                                               @RequestParam(defaultValue = "false") boolean night) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
                .body(weatherService.getBackgrounds(SkyCondition.parse(condition), night));
    }

    /** Proxy delle tile radar OpenWeatherMap. */
    @GetMapping("/tiles/{layer}/{z}/{x}/{y}.png")
    public ResponseEntity<byte[]> getMapTile(@PathVariable String layer,
                                             @PathVariable int z,
                                             @PathVariable int x,
                                             @PathVariable int y) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
                .contentType(MediaType.IMAGE_PNG)
                .body(weatherService.getMapTile(layer, z, x, y));
    }

    private static ResponseEntity<String> ok(String body, Duration maxAge) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(maxAge).cachePublic())
                .body(body);
    }
}
