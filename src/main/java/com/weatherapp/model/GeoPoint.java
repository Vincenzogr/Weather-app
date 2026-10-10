package com.weatherapp.model;

import com.weatherapp.exception.ErrorCode;
import com.weatherapp.exception.WeatherException;

/**
 * Coppia latitudine/longitudine validata.
 * Le coordinate sono arrotondate a 3 decimali (~100 m): abbastanza precise
 * per il meteo e utili per riusare le risposte in cache tra richieste vicine.
 */
public record GeoPoint(double lat, double lon) {

    public GeoPoint {
        if (!Double.isFinite(lat) || lat < -90 || lat > 90) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Latitudine non valida");
        }
        if (!Double.isFinite(lon) || lon < -180 || lon > 180) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Longitudine non valida");
        }
        lat = Math.round(lat * 1000d) / 1000d;
        lon = Math.round(lon * 1000d) / 1000d;
    }

    public static GeoPoint of(Double lat, Double lon) {
        if (lat == null || lon == null) {
            throw new WeatherException(ErrorCode.INVALID_PARAMETER, "Parametri 'lat' e 'lon' obbligatori");
        }
        return new GeoPoint(lat, lon);
    }
}
