package com.weatherapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * La password è limitata a 72 caratteri perché BCrypt ignora i byte successivi.
 */
public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 50) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 72) String password
) {
}
