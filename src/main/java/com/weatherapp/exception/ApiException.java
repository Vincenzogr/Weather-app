package com.weatherapp.exception;

/**
 * Eccezione per errori delle API esterne (OpenWeatherMap, Open-Meteo, Pexels).
 * Estende WeatherException aggiungendo il nome dell'API che ha fallito
 * e lo status HTTP restituito dal servizio esterno.
 */
public class ApiException extends WeatherException {

    private final String apiName;
    private final int upstreamStatus;

    public ApiException(String apiName, ErrorCode code, String message, int upstreamStatus) {
        super(code, message);
        this.apiName = apiName;
        this.upstreamStatus = upstreamStatus;
    }

    public String getApiName() {
        return apiName;
    }

    public int getUpstreamStatus() {
        return upstreamStatus;
    }

    @Override
    public String toString() {
        return "[" + apiName + "] " + getMessage() + " (upstream status: " + upstreamStatus + ")";
    }
}
