package com.weatherapp.model;

import java.util.Locale;

/**
 * Condizioni del cielo usate per scegliere la foto di sfondo.
 * Il frontend invia solo la categoria: la query verso Pexels è costruita
 * qui, così l'endpoint non può essere usato come proxy di ricerca libero.
 */
public enum SkyCondition {
    CLEAR("clear blue sky sunny landscape", "clear starry night sky"),
    FEW_CLOUDS("sunny sky with white clouds", "moonlit clouds night sky"),
    OVERCAST("overcast grey sky clouds", "cloudy night city"),
    DRIZZLE("drizzle rain window", "rainy night street lights"),
    RAIN("rain storm clouds landscape", "rainy night street lights"),
    THUNDER("thunderstorm lightning sky", "lightning storm night"),
    SNOW("snowy landscape winter", "snowy night city"),
    MIST("fog mist landscape", "foggy night street");

    private final String dayQuery;
    private final String nightQuery;

    SkyCondition(String dayQuery, String nightQuery) {
        this.dayQuery = dayQuery;
        this.nightQuery = nightQuery;
    }

    public String query(boolean night) {
        return night ? nightQuery : dayQuery;
    }

    /** Accetta sia "few-clouds" sia "FEW_CLOUDS"; ritorna CLEAR per valori sconosciuti. */
    public static SkyCondition parse(String value) {
        if (value == null || value.isBlank()) {
            return CLEAR;
        }
        try {
            return valueOf(value.trim().replace('-', '_').toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return CLEAR;
        }
    }
}
