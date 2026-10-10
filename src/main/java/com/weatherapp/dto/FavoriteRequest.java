package com.weatherapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FavoriteRequest(@NotBlank @Size(max = 100) String city) {
}
