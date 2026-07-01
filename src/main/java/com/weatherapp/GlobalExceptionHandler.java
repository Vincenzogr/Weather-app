package com.weatherapp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Gestore globale degli errori.
 * Intercetta le eccezioni lanciate in qualsiasi punto (es. WeatherService)
 * e le converte automaticamente in risposte JSON uniformi.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApiException(ApiException ex) {
        return buildErrorResponse(ex.getStatusCode(), ex.getMessage());
    }

    @ExceptionHandler(WeatherException.class)
    public ResponseEntity<Map<String, String>> handleWeatherException(WeatherException ex) {
        return buildErrorResponse(ex.getStatusCode(), ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        return buildErrorResponse(500, "Errore interno del server: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, String>> buildErrorResponse(int status, String message) {
        Map<String, String> errorBody = new HashMap<>();
        errorBody.put("error", message);
        return ResponseEntity.status(status).body(errorBody);
    }
}
