# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Structured observability layer (`observability.py`): every `turn_on`, `turn_off`, and WebSocket call now emits trace spans, counters, histograms, and structured log events that can be consumed by any log aggregator

### Changed

- `async_update_group_state` now uses an O(1) dict lookup (`_entities_by_id`) instead of a nested O(n) scan, with early exit once the common-level intersection empties — faster state convergence when controlling many lights
- Brightness map construction is now cached via `lru_cache`: lights sharing an identical curve config reuse precomputed maps instead of rebuilding them at startup
- Test dependency bumps: pytest 8→9, pytest-asyncio, pytest-homeassistant-custom-component (includes pycares constraint update)
- JS dev dependency bumps: `@rollup/plugin-terser` 0.4→1.0 (fixes high-severity CVEs in serialize-javascript), vitest 4.1.2→4.1.4 (fixes path-traversal and WebSocket file-read CVEs in vite)

### Fixed

- `async_update_group_state` early-exit no longer skips `is_lightener_change` context detection for unprocessed entities; brightness display after a Lightener-initiated change now correctly uses the preferred level even when levels intersection empties before all entities are visited

### Added

- Visual card configuration editor (`lightener-curve-card-editor`) with HA-native entity picker and optional custom title
- Live light preview: scrubbing the brightness slider pushes interpolated brightness to physical lights in real-time via `light.turn_on`/`turn_off`; brightness restores on release
- Card header now renders from `config.title` with "Brightness Curves" as default
- `DEFAULT_BRIGHTNESS` constant in `const.py` for consistent default curves across config flow and light platform
- Built-in config-flow curve presets (`linear`, `dim_accent`, `late_starter`, `night_mode`) for onboarding without manual curve authoring
- Dedicated Home Assistant sidebar panel (`/lightener-editor`) that hosts the curve editor without requiring manual dashboard card setup
- New `lightener/list_entities` websocket API for panel entity discovery
- Undo support for curve edits (footer undo button and Ctrl/Cmd+Z shortcut)
- Shared graph math module (`graph-math.ts`) with geometry/interpolation helpers reused by graph and scrubber
- 44 new Vitest unit tests (`card-logic.test.ts` and `graph-math.test.ts`) covering undo flow, interaction guards, and curve math
- Release workflow zip validation step that fails when a nested `custom_components/` path is present or `manifest.json` is missing at zip root

### Changed

- Config flow simplified: name your device, pick lights, done — no more text-based brightness mapping
- Options flow simplified: add or remove lights in one step; existing brightness curves are preserved
- Config and options flows now include a starter curve preset selector; selected preset is applied to newly added lights only
- Both flows now guide users to the Lightener Curve Editor card for visual curve editing
- Flow descriptions now point to both the sidebar panel and dashboard card for visual editing
- Config and options flow now show curve preset label ("Starting curve preset") in both setup and edit flows
- Scrubber now emits position events and stays in sync with the graph, including a vertical guide and per-curve value dots
- Curve legend shape markers now use shared constants from graph math utilities for consistent rendering
- Graph and scrubber now sample values through the same smooth-curve interpolation path for consistent badge and graph readouts

### Removed

- Text-based per-light brightness mapping step (replaced by visual curve editor card)

### Fixed

- Graph SVG reference now uses Lit `@query` decorator so drag and double-click work correctly if the graph panel unmounts and remounts during a loading cycle
- Removed a duplicated interpolation code path so graph and scrubber value sampling no longer drift from each other
- Mobile editing behavior now supports long-press point removal while preserving drag interactions
- Undo/cancel animations now preserve each curve's live visibility state instead of restoring stale visibility from snapshots
- Global keyboard shortcuts are now scoped to the card focus context, avoiding accidental save/undo/cancel when focus is outside the card
- WebSocket curve saves now reject unknown entities and malformed per-entity brightness payload shapes
- Release workflow now injects tag version via shell env expansion so manifest version updates resolve reliably
- Integration setup now tolerates sidebar panel registration failures without blocking startup
- Badge text contrast: yellow and orange curve badges now use darkened text to pass WCAG AA
- SVG axis labels and hints scale to 12px on mobile (was 9-10px)
- Control point hit circles use dynamic radius via `matchMedia` for reliable 44px+ touch targets on all mobile WebViews
- Hint text now reads "Dbl-click to add, Right-click or long-press to remove" (was touch-only phrasing)
- Success message fades in and out smoothly instead of disappearing abruptly
- `beforeunload` dialog now works in Firefox (added `returnValue`)
- Legend eye toggle now includes `aria-pressed` for screen reader toggle state
- Sidebar panel entity picker now uses DOM API instead of innerHTML, preventing XSS via crafted entity names
- GitHub Actions `hassfest` and `hacs/action` pinned to commit SHAs instead of mutable branch refs

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
