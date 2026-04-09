package com.weatherapp;

/**
 * Eccezione per errori delle API esterne (OpenWeatherMap, Open-Meteo).
 * Estende WeatherException aggiungendo il nome dell'API che ha fallito.
 */
public class ApiException extends WeatherException {

    private final String apiName;

    public ApiException(String apiName, String message, int statusCode) {
        super(message, statusCode);
        this.apiName = apiName;
    }

    public String getApiName() {
        return apiName;
    }

    @Override
    public String toString() {
        return "[" + apiName + "] " + getMessage() + " (status: " + getStatusCode() + ")";
    }
}