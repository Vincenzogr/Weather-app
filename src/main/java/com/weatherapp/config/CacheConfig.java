package com.weatherapp.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Cache in memoria con scadenza per ogni tipo di dato.
 * Senza TTL il meteo resterebbe congelato fino al riavvio del server.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String WEATHER = "weather";
    public static final String FORECAST = "forecast";
    public static final String AIR_QUALITY = "air-quality";
    public static final String GEOCODING = "geocoding";
    public static final String REVERSE_GEOCODING = "reverse-geocoding";
    public static final String BACKGROUNDS = "backgrounds";
    public static final String MAP_TILES = "map-tiles";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setAllowNullValues(false);
        register(manager, WEATHER, Duration.ofMinutes(10), 1_000);
        register(manager, FORECAST, Duration.ofMinutes(30), 1_000);
        register(manager, AIR_QUALITY, Duration.ofMinutes(30), 1_000);
        register(manager, GEOCODING, Duration.ofHours(24), 5_000);
        register(manager, REVERSE_GEOCODING, Duration.ofHours(24), 2_000);
        register(manager, BACKGROUNDS, Duration.ofHours(6), 100);
        register(manager, MAP_TILES, Duration.ofMinutes(10), 3_000);
        return manager;
    }

    private static void register(CaffeineCacheManager manager, String name, Duration ttl, long maxSize) {
        manager.registerCustomCache(name, Caffeine.newBuilder()
                .expireAfterWrite(ttl)
                .maximumSize(maxSize)
                .recordStats()
                .build());
    }
}
