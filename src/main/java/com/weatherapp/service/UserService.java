package com.weatherapp.service;

import com.weatherapp.dto.RegisterRequest;
import com.weatherapp.exception.ErrorCode;
import com.weatherapp.exception.WeatherException;
import com.weatherapp.model.Role;
import com.weatherapp.model.User;
import com.weatherapp.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Registrazione utenti e gestione delle città preferite.
 */
@Service
public class UserService {

    public static final int MAX_FAVORITES = 10;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public User register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new WeatherException(ErrorCode.EMAIL_TAKEN, "L'email è già in uso");
        }
        User user = new User(request.name().trim(), email, passwordEncoder.encode(request.password()), Role.ROLE_USER);
        try {
            return userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            // Due registrazioni simultanee con la stessa email: vince il vincolo UNIQUE.
            throw new WeatherException(ErrorCode.EMAIL_TAKEN, "L'email è già in uso", e);
        }
    }

    @Transactional(readOnly = true)
    public User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new WeatherException(ErrorCode.UNAUTHORIZED, "Utente non trovato"));
    }

    @Transactional(readOnly = true)
    public List<String> getFavorites(Long userId) {
        return sorted(getUser(userId));
    }

    @Transactional
    public List<String> addFavorite(Long userId, String city) {
        User user = getUser(userId);
        String name = city.trim().replaceAll("\\s+", " ");
        boolean alreadyPresent = user.getFavorites().stream().anyMatch(existing -> existing.equalsIgnoreCase(name));
        if (!alreadyPresent) {
            if (user.getFavorites().size() >= MAX_FAVORITES) {
                throw new WeatherException(ErrorCode.FAVORITES_LIMIT,
                        "Hai raggiunto il limite massimo di preferiti (" + MAX_FAVORITES + ")");
            }
            user.getFavorites().add(name);
        }
        return sorted(user);
    }

    @Transactional
    public List<String> removeFavorite(Long userId, String city) {
        User user = getUser(userId);
        String name = city == null ? "" : city.trim();
        user.getFavorites().removeIf(existing -> existing.equalsIgnoreCase(name));
        return sorted(user);
    }

    private static List<String> sorted(User user) {
        return user.getFavorites().stream()
                .sorted(Comparator.comparing(s -> s.toLowerCase(Locale.ROOT)))
                .toList();
    }
}
