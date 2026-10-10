---
version: 1
slug: "frontend-src-app-jsx"
primary_target: "frontend/src/App.jsx"
related_targets: []
---

# Weather dashboard (single page)

Scope: the whole single-page React app in frontend/src (search, sky hero, hour scrubber, week, hourly chart, air/UV/details, tips, radar, auth dialog, settings). Visitor mode: Operate.

Audience and task: portfolio visitors (recruiters, developers) exploring the data for a few cities, switching language, theme and units, trying login and favorites. Constraints: every current function, six languages, Pexels background photos, light/dark theme.

Chosen direction: "Cielo vivo" (sky field). Memorable moment: dragging the hour scrubber recolors the sky and moves the sun or moon along its real arc.

Unresolved: product name stays "Meteo App" unless the user renames it.

## Direction contract

THESIS: The dashboard is the sky above the searched city at that hour. The page takes its color from the sun's real position and the cloud cover. It refuses the category's fixed dark-glass gradient with translucent tiles.

OWN-WORLD: A computed sky field (night indigo, blue-hour violet, golden horizon, day blue, overcast grey) drenches the hero. Every surface below is a solid, dilute tint of the same sky with hairline sky-tinted rules and no decorative blur. Archivo variable: light condensed numerals for temperatures, regular widths for UI. Sun-gold marks selection and the scrubber handle. Lucide line icons in one stroke.

STORY: Search a city, see its sky now with the sun or moon at its real position, read the temperature on the horizon, scrub the hours to watch sky and values change, compare the week on one shared scale, check air, UV and radar, save favorites after logging in.

FIRST VIEWPORT: Top bar (name left, search center, settings right). Below it a full-bleed sky band about 55vh tall: city heading and local time top-left; condition and the huge temperature lower-left on the horizon; the sun/moon arc spanning the band with sunrise and sunset at its ends; the Pexels photo blended into the horizon with its credit. Directly below, the 24-hour scrubber strip driven by a native range input. Primary action: search.

FORM: Sky field, position 1 on my ordered list of seven, taken as IMPECCABLE'S PICK; seed key b719ec6a. Build path: code-led.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
