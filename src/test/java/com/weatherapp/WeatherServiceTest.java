package com.weatherapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.match.MockRestRequestMatchers;
import org.springframework.test.web.client.response.MockRestResponseCreators;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test unitari per WeatherService.
 * Utilizza @RestClientTest per testare il client HTTP senza fare vere richieste.
 */
@RestClientTest(WeatherService.class)
@TestPropertySource(properties = "openweathermap.api.key=TEST_KEY")
class WeatherServiceTest {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private MockRestServiceServer mockServer;

    @Test
    @DisplayName("getWeather con città vuota deve lanciare WeatherException con status 400")
    void testGetWeatherCittaVuota() {
        WeatherException ex = assertThrows(WeatherException.class, () -> {
            weatherService.getWeather("");
        });
        assertEquals("Nome città non può essere vuoto", ex.getMessage());
        assertEquals(400, ex.getStatusCode());
    }

    @Test
    @DisplayName("getWeather deve ritornare JSON se la chiamata ha successo")
    void testGetWeatherSuccess() {
        mockServer.expect(MockRestRequestMatchers.requestTo(org.hamcrest.Matchers.startsWith("https://api.openweathermap.org/data/2.5/weather")))
            .andRespond(MockRestResponseCreators.withSuccess("{\"name\":\"Roma\"}", MediaType.APPLICATION_JSON));
            
        String response = weatherService.getWeather("Roma");
        assertEquals("{\"name\":\"Roma\"}", response);
        mockServer.verify();
    }

    @Test
    @DisplayName("getWeather deve lanciare ApiException(404) se città non trovata")
    void testGetWeatherNotFound() {
        mockServer.expect(MockRestRequestMatchers.requestTo(org.hamcrest.Matchers.startsWith("https://api.openweathermap.org/data/2.5/weather")))
            .andRespond(MockRestResponseCreators.withStatus(HttpStatus.NOT_FOUND));
            
        ApiException ex = assertThrows(ApiException.class, () -> {
            weatherService.getWeather("CittaInesistente");
        });
        assertEquals(404, ex.getStatusCode());
        assertEquals("OpenWeatherMap", ex.getApiName());
        mockServer.verify();
    }

    @Test
    @DisplayName("ApiException deve contenere il nome dell'API e lo status code")
    void testApiException() {
        ApiException ex = new ApiException("OpenWeatherMap", "Città 'XYZ' non trovata", 404);
        assertEquals("OpenWeatherMap", ex.getApiName());
        assertEquals("Città 'XYZ' non trovata", ex.getMessage());
        assertEquals(404, ex.getStatusCode());
    }

    @Test
    @DisplayName("WeatherException deve propagare la causa originale")
    void testWeatherExceptionConCausa() {
        IOException causaOriginale = new IOException("Connessione rifiutata");
        WeatherException ex = new WeatherException("Errore di rete", 503, causaOriginale);
        assertEquals(causaOriginale, ex.getCause());
        assertEquals(503, ex.getStatusCode());
    }
}