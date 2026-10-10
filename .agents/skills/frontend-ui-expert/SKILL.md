---
name: frontend-ui-expert
description: >
  Frontend UI/UX guidance for the Weather App ("Meteo App") project.
  Triggers when the user asks to improve visuals, UI, design, animations,
  layout, responsiveness, components, or aesthetic quality of the app.
  Also triggers for: "migliora la parte visiva", "migliora UI", "rendi piu bello",
  "migliora il design", "ottimizza animazioni", "rendi responsive".
---

# Frontend UI — Weather App ("Cielo vivo")

Read these first; they are the authority and this file only points at them:

- `PRODUCT.md` — users, purpose, binding constraints (all features, 6 languages, Pexels photos, light/dark theme).
- `DESIGN.md` — the visual system ("Cielo vivo"): tokens, typography, components, motion.
- `.impeccable/surfaces/frontend-src-app-jsx.md` — the direction contract for the dashboard.

## The idea in one line

The page takes the color of the searched city's sky at the hour shown: the sky colors come from the
sun's real altitude, the weather condition and the cloud cover (`src/utils/sky.js`), and the sun and
moon are drawn along their real paths (`src/utils/astro.js`). The hour scrubber recolors the sky.

## Architecture

- `src/App.jsx` — state (cursor = live hour or a chosen day/hour), theme (auto/light/dark), units, recents, favorites; writes the `--sky-*` CSS variables on `<html>`.
- `src/components/sky/` — `SkyHero` (first viewport), `SkyChart` (sun/moon paths, stars), `HourScrubber` (24 h strip + native range input), `MoonDisc`, `EmptyHero`.
- `src/components/panels/` — Week (shared temperature scale), HourlyChart (lazy, Chart.js), Radar (lazy, Leaflet + `/api/tiles` proxy), Air (EAQI), SunMoon (UV WHO scale, moon phase), Details, Tips.
- `src/components/top/` — SearchBar (ARIA combobox), SettingsMenu, CityChips; `AuthDialog` uses native `<dialog>`.
- `src/utils/` — `weather.js` (units, WMO codes, EAQI/UV scales, city-local time), `timeline.js`, `cityKey.js` (saved cities keyed by OWM id, language-independent).
- `src/locales/*.json` — 6 languages with identical keys, including `errors.<CODE>` for every backend error code.

## Rules that keep it correct

1. Times are always the city's local time (`formatTime(epoch, offset, lang)`), never the browser's.
2. Units go through `utils/weather.js` (`formatTemp`, `formatWind`, ...). Never hardcode °C or km/h.
3. No hardcoded strings: every label is a translation key present in all six locale files.
4. Colors come from CSS custom properties in `index.css`; sky colors only from `computeSky`, which guarantees 4.5:1 text contrast.
5. Icons are Lucide (stroke 1.75); no emoji as icons.
6. Panels are solid surfaces tinted from the sky (`--surface`, `--line`); no glass blur, no gradient text.
7. Respect `prefers-reduced-motion`; keep content visible by default (no entrance-only reveals).
8. API keys never reach the browser: new external data goes through the Spring Boot backend.

## Workflow

1. Read the component and its CSS block in `index.css`.
2. Change it; keep all six locales in sync.
3. `npm --prefix frontend run lint` and `npm --prefix frontend run build`.
4. Check desktop (1440) and mobile (390) in both themes; check a night city and a day city.
5. `mvn test` for backend changes.
