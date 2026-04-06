# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2.9.0] - 2026-04-06

### Added

- "Layered Panels" card redesign: graph, scrubber, and legend each sit in their own tinted sub-panel with subtle depth
- Colorblind-safe curve palette: replaced green colors with indigo and brown
- Shape markers in legend (circle, square, diamond, triangle, bar) for color-independent identification
- Loading indicator with pulse animation while curves are being fetched
- "Editing: {name}" label in graph header showing which curve is selected
- Retry buttons on load and save errors with `role="alert"` for screen readers
- Keyboard support: arrow keys on scrubber slider, Enter/Space on legend items, Ctrl+S to save, Esc to cancel
- Live demo via GitHub Pages
- Scenario switcher in dev mode for testing 2-light, 3-light, 20-light, and long entity ID edge cases
- 32 unit tests covering data conversion and interpolation

### Changed

- Scrubber redesigned: gradient track, round thumb, inline value badges replace bar charts
- Legend selection uses accent underline instead of left border
- Card border radius 12px to 16px, refined layered shadow, padding 16px to 20px
- Save button uses consistent #2563EB blue across all themes
- Footer buttons rounded to 8px

### Fixed

- Right-click to remove control points now works (pointerdown was intercepting right-click button)
- Success status uses blue (#2563EB) with checkmark icon instead of green (colorblind-safe)
- Error/success regions use `role="status"`/`role="alert"` and `aria-live` for screen readers
- Retry affordances converted from spans to focusable buttons
- Value badges cap at 2 rows with overflow hidden (prevents layout explosion with 20+ lights)
- Badge names truncate at 80px with ellipsis for long entity IDs
- WebSocket handler validates curve payload types before accessing `.get()` (prevents crash on malformed messages)
- Legend items are keyboard-operable (tabindex, Enter/Space, ArrowUp/ArrowDown)
- Hint text moved inside graph area to avoid axis label overlap

## [2.8.1] - 2026-04-04

### Fixed

- Restored Lightener setup for migrated configurations
- Fixed brightness mapping migration handling to avoid double-wrapping
- Fixed the `configuration.yaml` setup path when using migrated config data

### Added

- Interactive brightness curve editor card (`custom:lightener-curve-card`)
  - Visual editing of per-light brightness curves directly in the HA dashboard
  - Smooth bezier curves with gradient fills
  - Colorblind-accessible dash patterns to distinguish curves
  - Brightness scrubber with real-time bar gauge readouts per light
  - Keyboard shortcuts: Ctrl+S to save, Esc to cancel
  - Unsaved-changes guard (browser prompt before navigating away)
  - Light and dark theme support via Home Assistant CSS custom properties
  - Mobile-responsive layout with touch-optimised controls
- WebSocket API (`lightener/get_curves`, `lightener/save_curves`) for reading and writing brightness configs from the frontend
  - Read access available to all authenticated users (for dashboard display)
  - Write access restricted to Home Assistant administrators

### Changed

- Renamed HACS display name to "Lightener Curve Editor" to avoid confusion with upstream

### Fixed

- Home Assistant 2026.x compatibility (`async_register_static_paths` API)
- Overlapping curves: selected curve now renders on top so all control points stay clickable
- Curve load race condition when Home Assistant sends rapid state updates
- Legend name truncation for long entity names
- Dirty-state indicator not clearing after save
- Small hit targets making control points hard to grab
- Timer leak when card is removed from the DOM

### Also includes

- Recent UI polish, theming, mobile, and release-readiness improvements validated in the release candidate

## [2.4.0] - Upstream

This version matches [fredck/lightener](https://github.com/fredck/lightener) v2.4.0,
from which this fork was created. All upstream functionality is included unchanged.
