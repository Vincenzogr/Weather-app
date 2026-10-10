package com.weatherapp.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Limita i tentativi di login falliti per indirizzo IP (protezione brute-force).
 * Dopo {@value #MAX_FAILURES} errori l'IP resta bloccato finché la finestra
 * di {@code BLOCK_WINDOW} non scade senza nuovi errori.
 */
@Component
public class LoginAttemptService {

    static final int MAX_FAILURES = 10;
    private static final Duration BLOCK_WINDOW = Duration.ofMinutes(15);

    private final Cache<String, AtomicInteger> failures = Caffeine.newBuilder()
            .expireAfterWrite(BLOCK_WINDOW)
            .maximumSize(10_000)
            .build();

    public boolean isBlocked(String clientKey) {
        AtomicInteger count = failures.getIfPresent(clientKey);
        return count != null && count.get() >= MAX_FAILURES;
    }

    public void recordFailure(String clientKey) {
        AtomicInteger count = failures.get(clientKey, key -> new AtomicInteger());
        count.incrementAndGet();
        failures.put(clientKey, count); // rinnova la finestra a ogni errore
    }

    public void recordSuccess(String clientKey) {
        failures.invalidate(clientKey);
    }
}
