package com.weatherapp.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/**
 * Emissione e verifica dei token JWT (HS256).
 *
 * Il segreto arriva da {@code jwt.secret} (variabile d'ambiente JWT_SECRET).
 * Se manca o è troppo corto viene generata una chiave casuale all'avvio:
 * sicuro per lo sviluppo, ma i token non sopravvivono a un riavvio.
 */
@Component
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MIN_SECRET_BYTES = 32;
    private static final String ISSUER = "weather-app";

    private final SecretKey signingKey;
    private final Duration expiration;

    public JwtService(@Value("${jwt.secret:}") String secret,
                      @Value("${jwt.expiration:PT24H}") Duration expiration) {
        this.expiration = expiration;
        byte[] secretBytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < MIN_SECRET_BYTES) {
            log.warn("jwt.secret assente o più corto di {} byte: uso una chiave casuale (i login scadono al riavvio)",
                    MIN_SECRET_BYTES);
            this.signingKey = Jwts.SIG.HS256.key().build();
        } else {
            this.signingKey = Keys.hmacShaKeyFor(secretBytes);
        }
    }

    public String generateToken(UserDetailsImpl user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(ISSUER)
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(signingKey)
                .compact();
    }

    /** Ritorna l'email contenuta nel token se firma, emittente e scadenza sono validi. */
    public Optional<String> validateAndGetSubject(String token) {
        try {
            String subject = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return Optional.ofNullable(subject);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Token JWT non valido: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public long getExpirationSeconds() {
        return expiration.toSeconds();
    }
}
