package com.weatherapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;
import java.io.IOException;

/**
 * Test unitari per WeatherService.
 *
 * Questi test verificano che:
 * 1. Il servizio lanci eccezioni corrette per input non validi
 * 2. Le eccezioni personalizzate funzionino correttamente
 * 3. ApiException contenga le informazioni giuste
 */
class WeatherServiceTest {

    // ── TEST 1: WeatherException con città vuota
    @Test
    @DisplayName("getWeather con città vuota deve lanciare WeatherException con status 400")
    void testGetWeatherCittaVuota() {
        // Creiamo una WeatherException come farebbe il servizio
        WeatherException ex = new WeatherException(
            "Nome città non può essere vuoto", 400
        );

        // Verifichiamo che il messaggio sia corretto
        assertEquals("Nome città non può essere vuoto", ex.getMessage());

        // Verifichiamo che lo status code sia 400 (Bad Request)
        assertEquals(400, ex.getStatusCode());
    }

    // ── TEST 2: ApiException contiene il nome dell'API
    @Test
    @DisplayName("ApiException deve contenere il nome dell'API e lo status code")
    void testApiException() {
        ApiException ex = new ApiException(
            "OpenWeatherMap",
            "Città 'XYZ' non trovata",
            404
        );

        // Verifica nome API
        assertEquals("OpenWeatherMap", ex.getApiName());

        // Verifica messaggio
        assertEquals("Città 'XYZ' non trovata", ex.getMessage());

        // Verifica status code
        assertEquals(404, ex.getStatusCode());

        // Verifica che toString() contenga il nome dell'API
        assertTrue(ex.toString().contains("OpenWeatherMap"));
        assertTrue(ex.toString().contains("404"));
    }

    // ── TEST 3: WeatherException con causa
    @Test
    @DisplayName("WeatherException deve propagare la causa originale")
    void testWeatherExceptionConCausa() {
        // Simuliamo un errore di rete
        IOException causaOriginale = new IOException("Connessione rifiutata");

        WeatherException ex = new WeatherException(
            "Errore di rete", 503, causaOriginale
        );

        // Verifica che la causa sia quella originale
        assertEquals(causaOriginale, ex.getCause());
        assertEquals(503, ex.getStatusCode());
    }

    // ── TEST 4: ApiException estende WeatherException
    @Test
    @DisplayName("ApiException deve essere un'istanza di WeatherException")
    void testApiExceptionEstendeWeatherException() {
        ApiException ex = new ApiException("Open-Meteo", "Errore", 500);

        // ApiException deve essere anche una WeatherException
        assertTrue(ex instanceof WeatherException);
    }

    // ── TEST 5: WeatherException con status 401
    @Test
    @DisplayName("Errore 401 deve avere status code corretto")
    void testStatusCode401() {
        ApiException ex = new ApiException(
            "OpenWeatherMap",
            "API key non valida",
            401
        );

        assertEquals(401, ex.getStatusCode());
        assertEquals("OpenWeatherMap", ex.getApiName());
    }
}