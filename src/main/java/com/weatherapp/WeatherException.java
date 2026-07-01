package com.weatherapp;

/**
 * Eccezione personalizzata per errori dell'app meteo.
 * Invece di usare RuntimeException generica, usiamo questa
 * classe per identificare meglio il tipo di errore.
 */
public class WeatherException extends RuntimeException {

    private final int statusCode;

    public WeatherException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public WeatherException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}