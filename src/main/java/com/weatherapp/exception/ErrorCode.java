package com.weatherapp.exception;

import org.springframework.http.HttpStatus;

/**
 * Codici di errore stabili restituiti dall'API.
 * Il frontend li usa come chiave di traduzione, così i messaggi
 * vengono mostrati nella lingua scelta dall'utente.
 */
public enum ErrorCode {
    INVALID_PARAMETER(HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST),
    CITY_NOT_FOUND(HttpStatus.NOT_FOUND),
    NOT_FOUND(HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED),
    FORBIDDEN(HttpStatus.FORBIDDEN),
    EMAIL_TAKEN(HttpStatus.CONFLICT),
    FAVORITES_LIMIT(HttpStatus.UNPROCESSABLE_ENTITY),
    TOO_MANY_ATTEMPTS(HttpStatus.TOO_MANY_REQUESTS),
    UPSTREAM_ERROR(HttpStatus.BAD_GATEWAY),
    UPSTREAM_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE),
    SERVICE_NOT_CONFIGURED(HttpStatus.SERVICE_UNAVAILABLE),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR);

    private final HttpStatus status;

    ErrorCode(HttpStatus status) {
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
