# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: recruiters, clients and fellow developers who open the app to judge the author's full-stack and design craft. They arrive with little context, explore for a few minutes, and try a handful of cities, the language switcher, the theme toggle and the login/favorites flow.

Secondary audience: the author and acquaintances using it as a real weather dashboard.

## Product Purpose

A full-stack weather dashboard (Spring Boot backend + React frontend) by Granata Vincenzo. It exists as a portfolio piece: success means a visitor leaves convinced the author can ship a polished, correct, secure, production-shaped web application, and the data shown is accurate enough to trust.

## Positioning

A data-rich weather explorer: one screen brings together current conditions, 7-day and hourly forecasts, a weather radar, air quality, UV, sun path and moon phase, and context-aware tips, backed by the author's own API layer (caching, auth, favorites sync) rather than calling third-party APIs from the browser.

## Operating Context

- Typical session: explore the data for one or more cities. The design must organize a lot of data so it reads well, rather than reduce it to a glance.
- Visitors evaluate on desktop first, then often resize or open on a phone.
- Data sources: OpenWeatherMap (current weather, reverse geocoding, map tiles), Open-Meteo (geocoding, forecast, air quality), Pexels (background photos). Keys live server-side.

## Capabilities and Constraints

Binding (confirmed by the user, must survive any redesign):

- All current functions: city search with autocomplete, GPS location, current conditions, 7-day forecast, hourly chart (temperature / rain / wind), radar map with selectable layers, air quality (AQI), UV index, sun arc and moon phase, weather tips, recent cities, favorites with login/registration (JWT), °C/°F toggle, light/dark theme.
- Six languages: Italian (default), English, French, German, Spanish, Japanese.
- Weather-driven background photos from Pexels remain part of the experience.

Technical: React 19 + Vite frontend built into Spring Boot's static resources; Spring Boot 3.5 backend with Spring Security, JPA (H2), JWT.

Not binding: the name "Meteo App" may change.

## Evidence on Hand

- README.md with the feature list and stack.
- No testimonials, users, metrics or press exist. Do not fabricate any.

## Product Principles

1. Correct before pretty: times shown in the city's local timezone, units honored everywhere, no field rendered from data the backend never requested.
2. Dense but legible: many data points, each with a clear place in the hierarchy; the visitor can explore without hunting.
3. Every language is first-class: no hardcoded Italian strings outside the locale files.
4. Production-shaped: secure defaults, graceful errors and empty states, nothing that only works on the author's machine.
5. Show craft in details: motion, states and responsive behavior are part of the portfolio claim.

## Accessibility & Inclusion

No specific standard was mandated. Default target: WCAG 2.2 AA contrast, full keyboard operability, reduced-motion support.
