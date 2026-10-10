package com.weatherapp.exception;

/**
 * Eccezione applicativa dell'app meteo.
 * Porta con sé un {@link ErrorCode} (che determina lo status HTTP)
 * e un messaggio leggibile usato come fallback dal frontend.
 */
public class WeatherException extends RuntimeException {

    private final ErrorCode code;

    public WeatherException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public WeatherException(ErrorCode code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public ErrorCode getCode() {
        return code;
    }

    public int getStatusCode() {
        return code.getStatus().value();
    }
}
