package com.weatherapp.controller;

import com.weatherapp.dto.AuthResponse;
import com.weatherapp.dto.LoginRequest;
import com.weatherapp.dto.RegisterRequest;
import com.weatherapp.dto.UserResponse;
import com.weatherapp.exception.ErrorCode;
import com.weatherapp.exception.WeatherException;
import com.weatherapp.model.User;
import com.weatherapp.security.JwtService;
import com.weatherapp.security.LoginAttemptService;
import com.weatherapp.security.UserDetailsImpl;
import com.weatherapp.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttempts;

    public AuthController(AuthenticationManager authenticationManager, UserService userService,
                          JwtService jwtService, LoginAttemptService loginAttempts) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
        this.loginAttempts = loginAttempts;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        String client = http.getRemoteAddr();
        if (loginAttempts.isBlocked(client)) {
            throw new WeatherException(ErrorCode.TOO_MANY_ATTEMPTS, "Troppi tentativi falliti, riprova tra qualche minuto");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    UserService.normalizeEmail(request.email()), request.password()));
        } catch (AuthenticationException e) {
            loginAttempts.recordFailure(client);
            throw e;
        }
        loginAttempts.recordSuccess(client);

        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
        return issueToken(user);
    }

    /** Crea l'account e autentica subito l'utente, senza un secondo passaggio di login. */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(issueToken(UserDetailsImpl.build(user)));
    }

    /** Ripristina la sessione al caricamento della pagina a partire dal token salvato. */
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserDetailsImpl principal) {
        return new UserResponse(principal.getId(), principal.getName(), principal.getEmail());
    }

    private AuthResponse issueToken(UserDetailsImpl user) {
        return AuthResponse.bearer(
                jwtService.generateToken(user),
                jwtService.getExpirationSeconds(),
                new UserResponse(user.getId(), user.getName(), user.getEmail()));
    }
}
