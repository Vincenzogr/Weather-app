package com.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.weatherapp.exception.ErrorCode;

import java.util.Map;

/**
 * Corpo JSON uniforme per tutte le risposte di errore.
 * {@code code} è stabile e traducibile dal frontend, {@code error} è il messaggio di fallback.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(int status, ErrorCode code, String error, Map<String, String> fields) {

    public static ApiError of(ErrorCode code, String message) {
        return new ApiError(code.getStatus().value(), code, message, Map.of());
    }

    public static ApiError of(ErrorCode code, String message, Map<String, String> fields) {
        return new ApiError(code.getStatus().value(), code, message, fields);
    }
}
