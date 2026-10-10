---
name: Meteo App
description: A weather dashboard that takes its color from the real sky above the searched city at the hour shown.
colors:
  sky-day-top: "#2569cc"
  sky-day-horizon: "#8cc0f0"
  sky-night-top: "#060b2b"
  sky-night-horizon: "#142057"
  ground-floor: "#070c24"
  sun-gold: "#ffc94d"
  sun-deep: "#e39b12"
  ink-light: "#0f1b2d"
  ink-2-light: "#455166"
  ink-3-light: "#59657a"
  page-base-light: "#f2f4f8"
  surface-light: "#ffffff"
  surface-2-light: "#f5f7fa"
  line-light: "#dde2ea"
  focus-light: "#1f5bc4"
  ink-dark: "#eef2f8"
  ink-2-dark: "#b7c1d1"
  ink-3-dark: "#9aa6b8"
  page-base-dark: "#080c24"
  surface-dark: "#0e1330"
  surface-2-dark: "#151b3c"
  line-dark: "#252b4c"
  link-dark: "#9cc0ff"
  land-ink: "#f5f7fa"
  land-ink-2: "#c9d0db"
  series-temp: "#e07a2e"
  series-rain: "#2f6fd6"
  series-wind: "#13897d"
  tone-warning: "#b42318"
  tone-warning-bg: "#fde8e6"
  tone-caution: "#8a5a00"
  tone-caution-bg: "#fdf1d6"
  tone-info: "#1f5bc4"
  tone-info-bg: "#e3edfc"
typography:
  display:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', 'Hiragino Sans', 'Yu Gothic UI', 'Noto Sans JP', sans-serif"
    fontSize: "clamp(4.5rem, 10vw, 6rem)"
    fontWeight: 260
    lineHeight: 0.8
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 72"
  headline:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)"
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 90"
  reading:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 76"
    fontFeature: "'tnum'"
  title:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 650
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  value:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.5
    fontFeature: "'tnum'"
  label:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  hairline-swatch: "3px"
  segment: "7px"
  sm: "10px"
  field: "12px"
  md: "14px"
  dialog: "16px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 40px)"
  container: "1240px"
  gap-tight: "8px"
  gap-panel: "14px"
  gap-grid: "20px"
  panel-pad: "20px 22px 22px"
components:
  button-primary:
    backgroundColor: "{colors.ink-light}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "44px"
  button-primary-dark:
    backgroundColor: "{colors.sun-gold}"
    textColor: "#1b1404"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "44px"
  button-quiet:
    backgroundColor: "{colors.surface-2-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "44px"
  icon-button:
    rounded: "{rounded.sm}"
    size: "44px"
  chip:
    rounded: "{rounded.pill}"
    padding: "0 13px"
    height: "34px"
  input:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  segmented-option-active:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.segment}"
    padding: "0 12px"
    height: "34px"
  panel:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.md}"
    padding: "{spacing.panel-pad}"
  dialog:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.dialog}"
    padding: "22px 24px 24px"
---

# Design System: Meteo App

## Overview

**Creative North Star: "Cielo vivo" (the living sky)**

The page is the sky above the searched city at the hour on screen. Its colors are not chosen per theme; they are computed per hour from the sun's real altitude, the weather condition and the cloud cover, then written as custom properties on `<html>` and animated through registered `@property` colors. A full-bleed sky band carries the city, the local time, the sun or moon on its real arc, and the temperature resting on the horizon. Below the horizon a deep ground band of the same sky holds the secondary readings and the 24-hour scrubber; dragging the scrubber recolors the whole page.

Everything beneath the sky is solid: dilute tints of the live sky on page, surfaces and hairline rules, no translucent tiles and no decorative blur. Density is high and deliberate (week, hourly chart, air, UV, sun and moon, details, radar, tips), organized into flat panels with one shared type family whose width axis does the expressive work: condensed light numerals for readings, regular widths for interface text. Sun-gold is the one warm voice and it means "here": selection, the current hour, the scrubber handle, the city marker.

The world rejects the weather-app category's fixed dark-glass gradient with translucent cards. Theme is auto (follows the city's real sky: dark when the sun is below about -6 degrees), light or dark, exposed as `html[data-theme]`; `html[data-sky-top-ink]` records whether the upper sky needs light or dark text.

**Key Characteristics:**
- Sky colors are computed data, never fixed palette picks; contrast is guaranteed by the algorithm, not by luck.
- One family, Archivo variable (wdth 62-125, wght 100-900), self-hosted; width and weight carry the hierarchy.
- Solid surfaces tinted by the live sky; hairline rules; soft two-layer shadows only.
- Sun-gold marks selection and "now"; it is rare everywhere else.
- Lucide line icons in a single stroke (1.75).
- Motion follows the sky: 700ms sky transitions, 1.2s for the live tint, one expo-out easing; all of it collapses under reduced motion.

## Colors

A computed sky over a cool, near-neutral ground, with a single sun-gold accent and data-series hues kept apart from the brand.

### Primary
- **Computed Sky** (anchors: Day Blue top and Day Horizon at sun altitude 30 degrees and above; Night Indigo top and horizon at -18 degrees and below): the hero field. Intermediate stops (blue hour violet, dusk rose, golden horizon) are interpolated per altitude, with separate dawn and dusk tones, then pushed toward weather tints (overcast grey, drizzle, rain, thunder violet, snow, mist) by condition and cloud cover. Delivered as `--sky-top`, `--sky-horizon`, `--sky-ground`, `--sky-ink`, `--sky-ink-top`; `--live-top` and `--live-horizon` carry the real current sky regardless of the scrubbed hour and tint the rest of the page.

### Secondary
- **Sun Gold**: the single accent. Selection (selected week row via a 16-20% mix into the surface), the current-hour time in the scrubber, the scrubber selection underline and focus ring, the sky knob, the sun disc, the radar city marker, the favorite star, the dark-theme primary button and focus ring, text selection.
- **Sun Deep**: the darker end of the sun's radial fill and gold strokes.

### Tertiary
- **Data series** (temperature orange, rain blue, wind teal; lifted variants in dark theme): chart lines and wet-day emphasis only. They are data encodings, not brand color.
- **Tones** (warning, caution, info, each with a tinted background): tip icon tiles, auth errors, toasts.

### Neutral
- **Night Ink**: primary text and the light-theme primary button.
- **Ink 2 / Ink 3**: secondary and tertiary text (dt labels, units, notes, footer).
- **Page / Surface / Surface 2 / Line**: each is a fixed base mixed in oklab with the live sky. Light theme: page = horizon 14% into the page base, surface = horizon 5% into white, line = sky top 12% into the line base. Dark theme: page = sky top 26% into the indigo base, surface 18%, surface 2 26%, line = horizon 16% into the line base.
- **Ground Floor**: the indigo the ground band is darkened toward; also the dark page base.
- **Land Ink / Land Ink 2**: text on the ground band and scrubber.

### Named Rules
**The Computed Sky Rule.** Sky colors come from `computeSky()` (sun altitude, dawn or dusk, condition, cloud cover). Never hardcode a sky color on a surface; read the custom properties.

**The Guaranteed Ink Rule.** Text on the sky picks white or dark ink by worst-case contrast across sampled probes, and the sky itself is nudged darker or lighter in 6% steps until text reaches 4.6:1. The upper sky (city, masthead) and the horizon zone (temperature) are solved separately.

**The Ground Band Rule.** Below the horizon (74% of the band) the sky becomes ground: a deep tint of the same sky (horizon mixed 35% toward top), darkened toward Ground Floor only until secondary land text reaches 5:1. This is a cited adaptation for legibility, not a second palette; do not lighten it for looks.

**The Same Sky Below Rule.** Every surface under the hero is a solid, dilute tint of the live sky. No glass, no translucency over content, no decorative blur.

**The One Sun Rule.** Sun-gold means selection, "now" or "here". Do not spend it on decoration or headings.

## Typography

**Display Font:** Archivo Variable (with system-ui and CJK fallbacks: Hiragino Sans, Yu Gothic UI, Noto Sans JP)
**Body Font:** Archivo Variable (same stack)

**Character:** A single grotesque used across its width axis: narrow, light, oversized numerals for readings; slightly condensed semibold for place names; regular width for everything you operate.

### Hierarchy
- **Display** (260, clamp(4.5rem, 10vw, 6rem), 0.8, width 72%, -0.04em): the current temperature on the horizon. The degree sign is a 0.3em regular-width superscript.
- **Headline** (650, clamp(1.75rem, 3.6vw, 2.75rem), 1.05, width 90%): the city name on the sky; country code follows at 0.42em, regular width, slightly tracked. The empty-state headline uses 600, clamp(2.25rem, 5.2vw, 4rem), width 86%.
- **Reading** (300, 2.75rem, width 76%, tabular): panel hero numbers (AQI, UV).
- **Title** (650, 1.0625rem, -0.01em): panel titles; the dialog title is 1.5rem at width 92%.
- **Value** (600, 1.0625rem, tabular): every measured value in definition lists; 1rem on mobile.
- **Body** (400, 1rem, 1.5): interface text; leads cap at 52ch.
- **Label** (400, 0.8125rem): dt labels and panel notes; 0.75rem for dates, hints and land labels; 0.6875rem for credits and rain percentages.

### Named Rules
**The Width Axis Rule.** Hierarchy is carried by width and weight of the one family. Numbers that are read at a glance go narrow and light; values that are compared go tabular. Do not introduce a second display face.

**The Tabular Numbers Rule.** Times, temperatures, hours and measurements use `tabular-nums` so columns and the scrubber never jitter.

## Layout

A centered container (1240px max, gutter clamp(16px, 4vw, 40px)) under a full-bleed sky. The masthead (brand left, search centered up to 640px, settings right, recent and favorite city chips below) sits on the sky-top color. The sky band is clamp(520px, 62vh, 660px) tall (590px on mobile); the horizon sits at 74%, the place and clock top-left, the condition and temperature lower-left resting on the horizon, sunrise and sunset events and the secondary facts on the ground. The 24-hour scrubber follows on the ground color, each hour at least 44px wide, scrolling horizontally when needed.

The dashboard is a two-column grid (1.7fr main, side min 300px) with 20px gaps and 28px/56px block padding. At 960px and below it becomes one column and panels reorder by urgency: tips, week, hourly chart, air, sun and moon, details, radar. At 720px the search moves to its own row, chips scroll horizontally, sky facts become a three-column grid, the week row drops labels and millimetres, and panel padding tightens to 18px 16px 20px. At 1100px the week row drops wind.

## Elevation & Depth

Depth comes from the sky itself (gradient field, sun glow, moon drop shadow) and from flat panels lifted by a soft two-layer shadow. Shadows are ambient, never structural, and never hard-offset. Dark theme deepens the same shadows rather than adding glows.

### Shadow Vocabulary
- **Panel** (light `0 1px 2px rgb(15 27 45 / 0.05), 0 10px 28px -16px rgb(15 27 45 / 0.22)`; dark `0 1px 2px rgb(0 0 0 / 0.3), 0 14px 32px -18px rgb(0 0 0 / 0.7)`): panels, search field, masthead buttons, map controls.
- **Floating** (light `0 2px 6px rgb(15 27 45 / 0.08), 0 24px 48px -20px rgb(15 27 45 / 0.35)`; dark `0 2px 8px rgb(0 0 0 / 0.35), 0 28px 56px -24px rgb(0 0 0 / 0.8)`): search results, settings panel, toasts, auth dialog.
- **Segment lift** (`0 1px 2px rgb(0 0 0 / 0.1), 0 2px 6px -2px rgb(0 0 0 / 0.12)`): the active option of a segmented control.
- **Sun glow** (`0 0 0 9px rgb(255 205 90 / 0.16), 0 4px 56px 22px rgb(255 190 70 / 0.34)`): the sun disc only.

### Named Rules
**The Flat Panel Rule.** Panels are solid surface with a 1px sky-tinted line and the Panel shadow. Floating shadow is reserved for things that sit above the page (menus, toasts, dialog).

## Shapes

Gently rounded and consistent: 14px for panels and the settings menu, 10px for buttons, inputs, icon buttons and week rows, 12px for the search field, its list, the scrubber track and toasts, 16px for the dialog, 7px inside segmented controls, 999px for chips, the "back to now" pill, scale bands and range bars. Circles mark positions: the sun, the knob on the horizon, the hollow ring markers on the week range bars and level scales (3px ink border on surface). Rules are 1px hairlines in the sky-tinted line color; dividers inside panels use the same.

## Components

### Buttons
- **Shape:** gently rounded (10px), 44px minimum height, 0 18px padding, 600 weight at 0.9375rem.
- **Primary:** Night Ink with white text in light theme; Sun Gold with dark brown ink (#1b1404) in dark theme. Hover mixes 14% sun into the background. On the masthead the primary button inverts to the sky ink color with text taken from the sky.
- **Quiet:** Surface 2 with a line border and ink text; hover darkens by an ink mix.
- **Icon button:** 44px square (32px small), transparent, hover tints 12% of currentColor; the framed variant adds a 14% fill and an inset hairline.
- **Active:** pressed buttons move down 1px.

### Chips
- **Style:** pill (999px), 34px tall, currentColor at 10% fill and 26% border, so they work on sky and on surface alike. Hover raises the fill to 20%. Favorite chips fill their star with Sun Gold.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Surface (sky-tinted), 1px line border.
- **Shadow Strategy:** Panel shadow (see Elevation).
- **Internal Padding:** 20px 22px 22px (18px 16px 20px on mobile); 14px under the title.
- Loading panels shimmer between Surface and Surface 2.

### Inputs / Fields
- **Style:** 44px, 1px line border, 10px radius, Surface background, ink text at 1rem.
- **Focus:** 2px solid focus outline, offset 0, border goes transparent. Light focus is blue (#1f5bc4); dark focus is Sun Gold.
- **Error:** border and message in the warning tone; field-level messages at 0.875rem/550.
- **Search field (on the sky):** its background, line and ink are mixed from the live sky top (dark navy mix when the upper sky takes light text, near-white when it takes dark text); 46px input with a leading search icon; focus ring uses the sky ink.

### Navigation
- **Masthead:** sky-top background with sky-ink text; brand is a small sun-and-horizon mark plus the name at 700, width 92%. Settings open a 320px panel (14px radius, Floating shadow) with account, segmented controls for theme, units and language.
- **Segmented control:** Surface 2 track with 3px padding and a line border; options 34px at 0.875rem/500 in Ink 2; the active option becomes Surface, ink, 650 weight, with the segment lift shadow.

### Sky Hero (signature)
The computed sky band: sun path drawn as a 1.5px line at 42% sky ink (the below-horizon portion dashed at 22% land ink), the moon path dotted, the horizon a 35% land-ink hairline, a dashed cursor for the shown hour, a Sun Gold knob ringed in the ground color, the sun as a radial gold disc with its glow and the moon as a drawn phase disc. The Pexels photo is blended in luminosity at 30% opacity, masked away from the text side and above the horizon, with its credit in land ink at 0.6875rem.

### Hour Scrubber (signature)
A 24-column strip on the ground color driven by a native range input. Past hours dim to 62%; the current hour's time is Sun Gold and bold; the selected hour gets a faint horizon-tinted cell with an inset hairline and a 3px Sun Gold underline. Rain chance reads in a light rain blue. Focus draws a 2px Sun Gold ring around the track.

### Week Row and Range Bar
Rows at least 56px, 10px radius, hover Surface 2, selected Sun Gold mix. Each day's min and max sit on one shared scale: an 8px pill track with a gradient range and a hollow ring marking "now" on today.

### Radar Map
OpenStreetMap tiles under a themed SVG wash (Surface at 42% in light; a sky-tinted indigo at 62% in dark). No CSS filters on tiles, and tiles use normal blending to avoid seams at fractional pixel positions. Leaflet controls and attribution are restyled to Surface, line and Ink 3; the city marker is Sun Gold with a navy stroke.

### Toasts and Dialog
Toasts: 12px radius, Surface, line border, Floating shadow, tone-colored leading icon, rise-in 0.32s. Auth dialog: 16px radius, 22px 24px 24px body, backdrop is the live sky top mixed into near-black with a 2px blur (the only blur in the system, and only over a modal backdrop).

## Do's and Don'ts

### Do:
- **Do** read sky colors from `--sky-*` and `--live-*` and let `computeSky()` decide them; extend its stops or weather tints rather than painting a surface by hand.
- **Do** keep text on the sky at 4.6:1 or better and secondary land text at 5:1 on the ground band, solved by the algorithm.
- **Do** build every new surface as a solid fixed base mixed in oklab with the live sky, with a 1px sky-tinted line.
- **Do** use Sun Gold only for selection, "now", the scrubber handle and location markers.
- **Do** set readings in narrow light Archivo and comparable values in tabular figures.
- **Do** draw icons with Lucide at strokeWidth 1.75.
- **Do** animate with the one expo-out easing (cubic-bezier(0.16, 1, 0.3, 1)) and honor reduced motion by removing transitions.
- **Do** keep controls at 44px minimum and the 2px offset focus outline.

### Don't:
- **Don't** reintroduce the fixed dark-glass gradient with translucent tiles or decorative blur.
- **Don't** apply CSS filters to map tiles or let Leaflet's default plus-lighter tile blending through.
- **Don't** lighten the ground band below its 5:1 floor for aesthetic reasons.
- **Don't** spend Sun Gold on headings, decoration or large fills.
- **Don't** use data-series hues (temperature, rain, wind) as brand or status colors.
- **Don't** add hard offset shadows; elevation is soft and ambient.
