package com.weatherapp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.weatherapp.dto.ApiError;
import com.weatherapp.exception.ErrorCode;
import com.weatherapp.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_WEATHER_ENDPOINTS = {
            "/api/weather", "/api/coordinates", "/api/forecast", "/api/air-quality",
            "/api/reverse-geocode", "/api/background", "/api/tiles/**"
    };

    private static final String[] FRONTEND_FILES = {
            "/", "/index.html", "/assets/**", "/fonts/**", "/*.svg", "/*.png", "/*.ico", "/*.webmanifest"
    };

    private final JwtAuthFilter jwtAuthFilter;
    private final ObjectMapper objectMapper;
    private final boolean h2ConsoleEnabled;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          ObjectMapper objectMapper,
                          @Value("${spring.h2.console.enabled:false}") boolean h2ConsoleEnabled) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.objectMapper = objectMapper;
        this.h2ConsoleEnabled = h2ConsoleEnabled;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** Il filtro JWT gira solo dentro la catena di Spring Security, non come filtro servlet autonomo. */
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // API stateless con token Bearer nell'header: niente cookie di sessione, quindi CSRF non si applica.
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, ex) ->
                                writeError(response, ErrorCode.UNAUTHORIZED, "Autenticazione richiesta"))
                        .accessDeniedHandler((request, response, ex) ->
                                writeError(response, ErrorCode.FORBIDDEN, "Accesso negato")))
                .headers(headers -> {
                    headers.referrerPolicy(policy -> policy
                            .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                    // La console H2 (solo profilo dev) vive in un iframe della stessa origine.
                    headers.frameOptions(frame -> {
                        if (h2ConsoleEnabled) frame.sameOrigin(); else frame.deny();
                    });
                })
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                            .requestMatchers(HttpMethod.GET, PUBLIC_WEATHER_ENDPOINTS).permitAll()
                            .requestMatchers("/api/auth/me", "/api/user/**").authenticated()
                            .requestMatchers("/error").permitAll()
                            .requestMatchers(HttpMethod.GET, FRONTEND_FILES).permitAll();
                    if (h2ConsoleEnabled) {
                        auth.requestMatchers(PathRequest.toH2Console()).permitAll();
                    }
                    auth.anyRequest().denyAll();
                });

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeError(HttpServletResponse response, ErrorCode code, String message) throws IOException {
        response.setStatus(code.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), ApiError.of(code, message));
    }
}
