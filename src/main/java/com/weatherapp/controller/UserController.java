package com.weatherapp.controller;

import com.weatherapp.dto.FavoriteRequest;
import com.weatherapp.security.UserDetailsImpl;
import com.weatherapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Città preferite dell'utente autenticato (massimo {@value UserService#MAX_FAVORITES}).
 */
@RestController
@RequestMapping("/api/user/favorites")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<String> getFavorites(@AuthenticationPrincipal UserDetailsImpl principal) {
        return userService.getFavorites(principal.getId());
    }

    @PostMapping
    public List<String> addFavorite(@AuthenticationPrincipal UserDetailsImpl principal,
                                    @Valid @RequestBody FavoriteRequest request) {
        return userService.addFavorite(principal.getId(), request.city());
    }

    @DeleteMapping
    public List<String> removeFavorite(@AuthenticationPrincipal UserDetailsImpl principal,
                                       @RequestParam String city) {
        return userService.removeFavorite(principal.getId(), city);
    }
}
