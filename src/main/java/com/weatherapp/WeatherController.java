package com.weatherapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Equivalent to res.setHeader("Access-Control-Allow-Origin", "*");
public class WeatherController {

    private final WeatherService weatherService;

    @Autowired
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping(value = "/weather", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> getWeather(@RequestParam(required = false) String city) throws WeatherException {
        if (city == null || city.trim().isEmpty()) {
            throw new WeatherException("Parametro 'city' obbligatorio", 400);
        }
        return ResponseEntity.ok(weatherService.getWeather(city));
    }

    @GetMapping(value = "/coordinates", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> getCoordinates(@RequestParam(required = false) String city) throws WeatherException {
        if (city == null || city.trim().isEmpty()) {
            throw new WeatherException("Parametro 'city' obbligatorio", 400);
        }
        // Rimuove il codice paese se presente (es. "Rome, IT" → "Rome")
        String cityOnly = city.split(",")[0].trim();
        return ResponseEntity.ok(weatherService.getCoordinates(cityOnly));
    }

    @GetMapping(value = "/forecast", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> getForecast(@RequestParam(required = false) String lat,
                                              @RequestParam(required = false) String lon) throws WeatherException {
        if (lat == null || lon == null) {
            throw new WeatherException("Parametri 'lat' e 'lon' obbligatori", 400);
        }
        return ResponseEntity.ok(weatherService.getForecast(lat, lon));
    }

    @GetMapping(value = "/background", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> getBackground(@RequestParam(required = false) String query) throws WeatherException {
        if (query == null || query.trim().isEmpty()) {
            throw new WeatherException("Parametro 'query' obbligatorio", 400);
        }
        return ResponseEntity.ok(weatherService.getBackground(query));
    }

    @GetMapping(value = "/config", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> getConfig() {
        return ResponseEntity.ok(weatherService.getConfig());
    }

    @GetMapping(value = "/reverse-geocode", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> getReverseGeocode(@RequestParam(required = false) String lat,
                                                    @RequestParam(required = false) String lon) throws WeatherException {
        if (lat == null || lon == null) {
            throw new WeatherException("Parametri 'lat' e 'lon' obbligatori", 400);
        }
        return ResponseEntity.ok(weatherService.getReverseGeocode(lat, lon));
    }
}
