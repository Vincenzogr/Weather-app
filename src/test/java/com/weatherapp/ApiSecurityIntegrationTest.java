package com.weatherapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test end-to-end di autenticazione, preferiti, validazione e formato degli errori.
 * Nessuna chiamata verso le API esterne: i casi meteo testati falliscono prima, in validazione.
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:apitest;DB_CLOSE_DELAY=-1",
        "jwt.secret=test-secret-che-e-lungo-almeno-trentadue-byte"
})
@AutoConfigureMockMvc
class ApiSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }

    private String register(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Ada","email":"%s","password":"password-sicura"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.user.name").value("Ada"))
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("token").asText();
    }

    @Test
    @DisplayName("Registrazione → login → /me con il token")
    void registerLoginAndRestoreSession() throws Exception {
        String email = uniqueEmail();
        register(email);

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"password-sicura"}
                                """.formatted(email.toUpperCase())))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    @DisplayName("Email duplicata → 409 EMAIL_TAKEN")
    void duplicateEmail() throws Exception {
        String email = uniqueEmail();
        register(email);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Bob","email":"%s","password":"un'altra-password"}
                                """.formatted(email)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_TAKEN"));
    }

    @Test
    @DisplayName("Password errata → 401 INVALID_CREDENTIALS (non più 500)")
    void wrongPassword() throws Exception {
        String email = uniqueEmail();
        register(email);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"sbagliata-123"}
                                """.formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    @DisplayName("Registrazione con dati non validi → 400 con i campi in errore")
    void invalidRegistration() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"A\",\"email\":\"non-una-email\",\"password\":\"corta\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fields.email").exists())
                .andExpect(jsonPath("$.fields.password").exists())
                .andExpect(jsonPath("$.fields.name").exists());
    }

    @Test
    @DisplayName("Endpoint protetti senza token → 401 JSON; token falso → 401")
    void protectedEndpoints() throws Exception {
        mockMvc.perform(get("/api/user/favorites"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer non.un.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Preferiti: aggiunta, duplicati ignorati, ordine alfabetico, rimozione")
    void favoritesLifecycle() throws Exception {
        String token = "Bearer " + register(uniqueEmail());

        for (String city : new String[]{"Torino", "milano", "Torino", "  Bari  "}) {
            mockMvc.perform(post("/api/user/favorites").header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"city\":\"" + city + "\"}"))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(get("/api/user/favorites").header("Authorization", token))
                .andExpect(jsonPath("$", contains("Bari", "milano", "Torino")));

        mockMvc.perform(delete("/api/user/favorites").param("city", "TORINO").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        mockMvc.perform(post("/api/user/favorites").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"city\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("Parametri meteo non validi → 400 senza chiamare servizi esterni")
    void weatherValidation() throws Exception {
        mockMvc.perform(get("/api/forecast").param("lat", "200").param("lon", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"));
        mockMvc.perform(get("/api/forecast").param("lat", "abc").param("lon", "10"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/weather"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/tiles/evil_layer/3/1/1.png"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"));
    }

    @Test
    @DisplayName("La vecchia /api/config che esponeva la chiave OWM non esiste più")
    void configEndpointRemoved() throws Exception {
        mockMvc.perform(get("/api/config"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Header di sicurezza presenti")
    void securityHeaders() throws Exception {
        mockMvc.perform(get("/api/weather"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
    }
}
