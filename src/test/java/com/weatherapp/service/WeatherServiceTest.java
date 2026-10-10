package com.weatherapp.service;

import com.weatherapp.dto.BackgroundPhoto;
import com.weatherapp.exception.ApiException;
import com.weatherapp.exception.ErrorCode;
import com.weatherapp.exception.WeatherException;
import com.weatherapp.model.GeoPoint;
import com.weatherapp.model.SkyCondition;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;

import java.io.IOException;
import java.util.List;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/**
 * Test unitari per WeatherService.
 * Utilizza @RestClientTest per testare il client HTTP senza fare vere richieste.
 */
@RestClientTest(WeatherService.class)
@TestPropertySource(properties = {
        "openweathermap.api.key=TEST_KEY",
        "pexels.api.key=PEXELS_TEST_KEY"
})
class WeatherServiceTest {

    private static final String OWM_WEATHER = "https://api.openweathermap.org/data/2.5/weather";

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private MockRestServiceServer mockServer;

    @Test
    @DisplayName("getWeatherByCity con città vuota deve lanciare WeatherException con status 400")
    void testGetWeatherCittaVuota() {
        WeatherException ex = assertThrows(WeatherException.class, () -> weatherService.getWeatherByCity("  ", "it"));
        assertEquals(ErrorCode.INVALID_PARAMETER, ex.getCode());
        assertEquals(400, ex.getStatusCode());
    }

    @Test
    @DisplayName("getWeatherByCity deve ritornare il JSON se la chiamata ha successo")
    void testGetWeatherSuccess() {
        mockServer.expect(requestTo(startsWith(OWM_WEATHER)))
                .andRespond(withSuccess("{\"name\":\"Roma\"}", MediaType.APPLICATION_JSON));

        assertEquals("{\"name\":\"Roma\"}", weatherService.getWeatherByCity("Roma", "it"));
        mockServer.verify();
    }

    @Test
    @DisplayName("Il codice paese resta 'Roma,IT' e i caratteri speciali vengono codificati")
    void testCityQueryEncoding() {
        mockServer.expect(requestTo(allOf(
                        containsString("q=Roma,IT"),
                        containsString("lang=it"),
                        containsString("units=metric"))))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        weatherService.getWeatherByCity("Roma,IT", "it");

        mockServer.reset();
        mockServer.expect(requestTo(containsString("q=Rome%26appid%3Dx")))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        weatherService.getWeatherByCity("Rome&appid=x", "it");
        mockServer.verify();
    }

    @Test
    @DisplayName("getWeatherByCity deve lanciare CITY_NOT_FOUND (404) se la città non esiste")
    void testGetWeatherNotFound() {
        mockServer.expect(requestTo(startsWith(OWM_WEATHER)))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        ApiException ex = assertThrows(ApiException.class, () -> weatherService.getWeatherByCity("CittaInesistente", "it"));
        assertEquals(ErrorCode.CITY_NOT_FOUND, ex.getCode());
        assertEquals(404, ex.getStatusCode());
        assertEquals("Meteo", ex.getApiName());
        mockServer.verify();
    }

    @Test
    @DisplayName("Una chiave OWM rifiutata (401) diventa SERVICE_NOT_CONFIGURED, non un errore dell'utente")
    void testUpstreamUnauthorized() {
        mockServer.expect(requestTo(startsWith(OWM_WEATHER)))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        ApiException ex = assertThrows(ApiException.class, () -> weatherService.getWeatherByCity("Roma", "it"));
        assertEquals(ErrorCode.SERVICE_NOT_CONFIGURED, ex.getCode());
        assertEquals(503, ex.getStatusCode());
        assertEquals(401, ex.getUpstreamStatus());
    }

    @Test
    @DisplayName("Il meteo per coordinate usa lat/lon arrotondati")
    void testWeatherByCoordinates() {
        mockServer.expect(requestTo(allOf(startsWith(OWM_WEATHER), containsString("lat=41.893"), containsString("lon=12.483"))))
                .andRespond(withSuccess("{\"name\":\"Roma\"}", MediaType.APPLICATION_JSON));

        weatherService.getWeatherByCoordinates(new GeoPoint(41.89321, 12.48277), "en");
        mockServer.verify();
    }

    @Test
    @DisplayName("Le previsioni richiedono anche vento e pioggia giornalieri, alba e tramonto")
    void testForecastFields() {
        mockServer.expect(requestTo(allOf(
                        startsWith("https://api.open-meteo.com/v1/forecast"),
                        containsString("precipitation_sum"),
                        containsString("wind_speed_10m_max"),
                        containsString("sunrise"),
                        containsString("timezone=auto"))))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        weatherService.getForecast(new GeoPoint(45.46, 9.19));
        mockServer.verify();
    }

    @Test
    @DisplayName("Gli sfondi Pexels vengono ridotti ai campi utili, con l'attribuzione")
    void testBackgrounds() {
        String body = """
                {"photos":[{"url":"https://www.pexels.com/photo/1","photographer":"Ada","photographer_url":"https://www.pexels.com/@ada",
                "avg_color":"#4A6B8A","alt":"Rain","src":{"large2x":"https://images.pexels.com/1.jpeg"}}]}
                """;
        mockServer.expect(requestTo(startsWith("https://api.pexels.com/v1/search")))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "PEXELS_TEST_KEY"))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        List<BackgroundPhoto> photos = weatherService.getBackgrounds(SkyCondition.RAIN, false);
        assertEquals(1, photos.size());
        assertEquals("https://images.pexels.com/1.jpeg", photos.get(0).src());
        assertEquals("Ada", photos.get(0).photographer());
        assertEquals("#4A6B8A", photos.get(0).avgColor());
        mockServer.verify();
    }

    @Test
    @DisplayName("Il proxy delle tile rifiuta layer e coordinate non validi senza chiamare OWM")
    void testMapTileValidation() {
        assertEquals(ErrorCode.INVALID_PARAMETER,
                assertThrows(WeatherException.class, () -> weatherService.getMapTile("evil", 3, 1, 1)).getCode());
        assertEquals(ErrorCode.INVALID_PARAMETER,
                assertThrows(WeatherException.class, () -> weatherService.getMapTile("temp_new", 2, 4, 0)).getCode());
        assertEquals(ErrorCode.INVALID_PARAMETER,
                assertThrows(WeatherException.class, () -> weatherService.getMapTile("temp_new", 20, 0, 0)).getCode());
        mockServer.verify();
    }

    @Test
    @DisplayName("La lingua viene ridotta a una di quelle supportate")
    void testNormalizeLanguage() {
        assertEquals("en", WeatherService.normalizeLanguage("en-US"));
        assertEquals("ja", WeatherService.normalizeLanguage("JA"));
        assertEquals("it", WeatherService.normalizeLanguage("xx"));
        assertEquals("it", WeatherService.normalizeLanguage(null));
    }

    @Test
    @DisplayName("ApiException deve contenere il nome dell'API e gli status code")
    void testApiException() {
        ApiException ex = new ApiException("OpenWeatherMap", ErrorCode.CITY_NOT_FOUND, "Città 'XYZ' non trovata", 404);
        assertEquals("OpenWeatherMap", ex.getApiName());
        assertEquals("Città 'XYZ' non trovata", ex.getMessage());
        assertEquals(404, ex.getStatusCode());
        assertEquals(404, ex.getUpstreamStatus());
    }

    @Test
    @DisplayName("WeatherException deve propagare la causa originale")
    void testWeatherExceptionConCausa() {
        IOException causaOriginale = new IOException("Connessione rifiutata");
        WeatherException ex = new WeatherException(ErrorCode.UPSTREAM_UNAVAILABLE, "Errore di rete", causaOriginale);
        assertEquals(causaOriginale, ex.getCause());
        assertEquals(503, ex.getStatusCode());
    }
}
