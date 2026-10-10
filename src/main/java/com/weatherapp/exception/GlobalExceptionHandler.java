package com.weatherapp.exception;

import com.weatherapp.dto.ApiError;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Gestore globale degli errori.
 * Converte ogni eccezione in un {@link ApiError} JSON uniforme
 * ({@code status}, {@code code}, {@code error}) senza mai esporre dettagli interni.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApiException(ApiException ex) {
        log.warn("Errore API esterna: {}", ex.toString());
        return build(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(WeatherException.class)
    public ResponseEntity<ApiError> handleWeatherException(WeatherException ex) {
        return build(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleBodyValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest()
                .body(ApiError.of(ErrorCode.VALIDATION_ERROR, "Dati non validi", fields));
    }

    @ExceptionHandler({HandlerMethodValidationException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiError> handleParamValidation(Exception ex) {
        return build(ErrorCode.VALIDATION_ERROR, "Parametri non validi");
    }

    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ApiError> handleBadRequest(Exception ex) {
        return build(ErrorCode.INVALID_PARAMETER, "Richiesta non valida");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
        return build(ErrorCode.INVALID_CREDENTIALS, "Email o password non corretti");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex) {
        return build(ErrorCode.UNAUTHORIZED, "Autenticazione richiesta");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        return build(ErrorCode.FORBIDDEN, "Accesso negato");
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ApiError> handleUpstreamIo(ResourceAccessException ex) {
        log.warn("Servizio esterno non raggiungibile: {}", ex.getMessage());
        return build(ErrorCode.UPSTREAM_UNAVAILABLE, "Il servizio meteo non risponde, riprova tra poco");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NoResourceFoundException ex) {
        return build(ErrorCode.NOT_FOUND, "Risorsa non trovata");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return build(ErrorCode.METHOD_NOT_ALLOWED, "Metodo non supportato");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        log.error("Errore non gestito", ex);
        return build(ErrorCode.INTERNAL_ERROR, "Errore interno del server");
    }

    private ResponseEntity<ApiError> build(ErrorCode code, String message) {
        return ResponseEntity.status(code.getStatus()).body(ApiError.of(code, message));
    }
}
