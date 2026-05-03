# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Curve editor golden path: full lifecycle ownership.** The card is now the
  single coherent surface for everything Lightener except the integration
  install itself. New affordances:
  - **Inline "Create group" form** opened from the panel's empty state and
    a "+ New group" button next to the entity selector (admins only). One
    screen for name + lights + optional area + starting curve preset, no
    more leaving the card to walk through HA's 3-step config flow. Drives
    the existing `config_flow.py` over WS, so backend validation is
    unchanged.
  - **Delete this group** in manage mode — two-step confirm that resolves
    the entity's `config_entry_id` and calls `config_entries/remove`. The
    panel auto-selects the next available group or returns to the empty
    state.
  - **Empty state visual** — SVG illustration of a curve graph above the
    "Create your first Lightener group" CTA so new users see what they're
    building toward.
- **Manage lights toggle** in the legend separates editing from setup. By
  default the legend shows just the curves and a quiet "Manage lights"
  button; clicking it reveals trash icons on each row and the "Add light"
  form. Auto-exits after a successful add so returning to the editor is
  one step. Admin-only.
- **Preset button grid in Add light** — replaces the `<select>` with a
  64×40 SVG thumbnail + label per preset. Same `presetPolylinePoints()`
  function used in the Presets panel, so visuals are guaranteed to match.
  2-column on desktop, 1-column on mobile, 44px touch targets.
- **First-time graph hint** — when no curve is selected, the hint reads
  "Select a light, then click its curve to add a control point" instead
  of the previous bare "Select a light to edit its curve". Dismisses on
  first interaction and resets per entity so each new group gets the
  guidance once.
- Card module writes a `window.LIGHTENER_CARD_VERSION` marker at load time so
  the panel can detect stale-card-class mismatches without a server round-trip.

### Fixed

- **Cache invalidation on group create/delete.** `lightener/list_entities`
  has a 5-second TTL cache that previously only invalidated on
  add_light / remove_light. Group create (config-entry import) and group
  delete left stale data in the cache, so the panel showed a missing or
  extra group until the TTL expired. `__init__.py` now invalidates the
  cache in both `async_setup_entry` and `async_unload_entry`.
- **Scoped-mode empty state CTA.** When the panel is opened with
  `?config_entry=...`, the empty-state CTA used to open the create-group
  modal — but a newly created entry has a different `config_entry_id`
  and gets filtered out, leaving the panel empty after "success." The
  scoped-mode empty state now links to HA Integrations instead, matching
  the gating already in place on the header `+ New group` button.
- **Stale config-entry flow on submit error.** If any `flow/configure`
  call failed mid-sequence, the orphaned flow_id was left dangling in
  HA. Submit now calls `config_entries/flow/abort` on the cleanup path
  so flows don't accumulate.
- **TOCTOU on Create group submit.** The `_createGroupSubmitting` flag
  was set after `await`, leaving a window where rapid double-clicks
  could fire two parallel `flow/init` calls. Flag is now set
  synchronously before any awaits.
- **Manage-mode trash icons hidden until hover.** Holdover from before
  manage mode existed — defeated the point of an explicit mode where
  affordances should be visible. Trash icons are now visible on
  non-selected rows in manage mode, hidden on the actively-edited row
  to avoid mis-tap on mobile and reduce clutter.
- **"Delete this group" tap target was 26px tall.** Below the 44px
  touch target floor for a destructive action. Bumped to `min-height: 44px`.
- **Selected light name truncated to "C.." on mobile** in manage mode
  because the editing chip + clear-X + trash icon all fit in one row.
  Trash icon hidden on selected row at all viewports.

### Changed

- Restored the release-native curve editor model: the smooth curve graph and
  sampler are paired with the in-card add/remove light management surface.
- The local dev preview now uses a fake Home Assistant WebSocket backend so the
  card can exercise save, preview, add-light, and remove-light flows on a local
  server.
- Curve editing now shows an explicit "Editing" chip on the selected row so the
  active edit state is visible at a glance. A "Stop editing" button (×) dismisses
  it without navigating away.
- Add-light and Presets panels are now mutually exclusive — opening one
  automatically closes the other.
- The per-light brightness badges in the "Group brightness" scrubber have been
  removed. The scrubber now shows a clean track and position label only.
- The "Preview all lights" button has moved into the scrubber panel header,
  inline with the "Group brightness" label, saving vertical space and keeping
  the preview control contextually next to the scrubber it controls.
- The scrubber label is now "Group brightness" (was "At brightness") and the
  preview button now reads "Preview all lights" / "Previewing all lights" to
  make it unambiguous that the preview controls the entire group — not just a
  selected individual light.
- Control points in the curve graph now render above the scrubber's dim overlay
  so they remain fully visible and clickable regardless of scrubber position.
  Control points at 100% brightness no longer show a clipped arc at the top edge.
- Editing label increased from 10 px to 11 px on desktop; hidden on mobile to
  prevent truncation against narrow graph widths.
- `scripts/sync-version` now validates the new TypeScript source constant
  (`CARD_VERSION` in `js/src/lightener-curve-card.ts`) and the built bundle
  alongside the existing manifest/panel-JS check, ensuring all four sources
  stay in sync.

### Fixed

- Non-zero origin points now save and reload end-to-end, preserving dim-floor
  curves created by dragging the 0% control point vertically.
- WebSocket curve saves now reject booleans, floats, missing brightness payloads,
  and out-of-range points before mutating config entry data.
- Options-flow updates now roll back config entry data when the follow-up reload
  fails.
- Read-only curve endpoints now filter entities through Home Assistant read
  permissions before returning data.
- After a HACS upgrade the browser no longer serves the old card from the ES
  module cache. The panel JS URL now carries `?v=<version>` so the browser
  fetches a fresh copy on every upgrade.
- If a stale card class was already registered in the browser's custom element
  registry before the fresh module loaded, the panel now detects the version
  mismatch and reloads the page once (gated via `sessionStorage`) to flush the
  old class and let the new bundle take over.
- Remove-confirmation card now wraps long light names instead of truncating them
  on narrow cards.
- Touch targets for Add/Cancel, remove, and edit-clear icons are now 44 px
  minimum on mobile, preventing accidental mis-taps on small screens.
- Badge text color now uses the actual rendered surface color to compute
  contrast, correcting an incorrect white-on-white appearance in dark mode.
- Entity-picker `Promise.race` chain now has a `.catch()` guard so a rejected
  `loadCardHelpers` promise no longer produces an unhandled rejection warning.
- Animated elements now respect `prefers-reduced-motion`: the live-preview dot
  pulse and scrubber animations are disabled when the OS requests reduced motion.
- `scripts/sync-version` now exits with a clear error message when the manifest
  is missing, the version key is absent, or the CARD_VERSION constant count is
  not exactly 1 in the bundle.

## [2.15.0] - 2026-04-25

### Added

- **In-card light management** — admin users can now add and remove lights from a
  Lightener group directly from the curve editor card. New manage panel with entity
  picker (or plain text fallback), preset selection, inline remove-confirm row, and
  pending-state guards. Uses new admin-gated WebSocket commands `add_light` /
  `remove_light`.
- Clicking any light badge in the "At brightness" scrubber now controls that
  individual light directly, setting it to the interpolated brightness at the current
  scrubber position.
- `getGridOptions()` implemented — the card declares its preferred grid size
  (12 columns × 9 rows, min 6 × 6) to HA's Sections dashboard so it auto-sizes
  correctly on first drop.

### Changed

- Curve rendering is now clipped to the graph plot area — curves and control points
  no longer bleed outside the graph boundary. Uses a per-instance unique `clipPath`
  ID to support multiple cards on one dashboard.
- Legend row hover and selected states now use the HA primary-color tint (matching
  sidebar hover) instead of a grey overlay.
- Selected legend row uses a filled background instead of an absolutely-positioned
  bottom line marker.
- Browser focus ring on legend rows suppressed; replaced with a rounded `box-shadow`
  ring that respects `border-radius`.
- Native browser tooltip (`title` attribute) removed from legend rows — it was
  appearing as a dark overlay on hover. Full name preserved via `aria-label` for
  screen readers.
- Curve endpoint control point is now removable: `Space`, `Delete`, and right-click
  work on the last point the same as on interior points. The minimum 2-point guard
  still applies.
- When a curve has no explicit 100 control point, the UI saves an explicit
  `(100, last_target)` entry so the curve flattens at the last configured level on
  reload.
- ARIA labels on graph points now use two categories — origin (Y-only, no remove)
  and all other points (free move + remove) — replacing the prior three-way
  distinction.

### Fixed

- `<ha-entity-picker>` now loads correctly in the card editor and the add-light
  form. HA lazy-registers this custom element; if the lightener card is the first
  on the page to reference it, the element was never defined and rendered blank.
  We now force registration via `loadCardHelpers()` / `hui-entities-card`, with a
  plain text fallback and a post-timeout upgrade subscription so a late registration
  is never permanently missed.
- Badge overflow count in the "At brightness" scrubber no longer shows "+N more"
  incorrectly on first render. Measurement is deferred to after first paint via
  `requestAnimationFrame`, and a `tallestBadge` floor prevents the container from
  collapsing during font-swap races.
- "At brightness" scrubber label casing corrected (was ALL CAPS).
- Badge pill background strengthened in light mode for better visibility.
- Badge click in scrubber correctly skips hidden (visibility-off) lights.
- Curve graph rendering and preview sampling now use the same piecewise-linear
  interpolation as the backend brightness map, so scrubber values, previewed
  brightness, and saved behavior no longer diverge.
- Preview restore correctly handles on/off-only lights (no brightness attribute):
  they are restored with `turn_on` without a brightness argument.
- Save-success timer is cleared before re-arming on rapid successive saves,
  preventing a status flap when saves complete inside the 2-second display window.

### Security

- Release workflow now validates the tag name against a strict semver regex before
  use and passes it via `strenv()` instead of shell interpolation, closing a CI
  script injection vector in the `yq` version-patching step.
- `ws_list_entities` access control decision documented: the endpoint intentionally
  omits `require_admin` so non-admin users can view curves in read-only mode via
  the sidebar panel. `config_entry_id` is intentionally included because the panel
  uses it for per-entry filtering.

## [2.14.0] - 2026-04-17

### Added

- **Preview toggle** — new "Preview" button in the card header lets you push the live brightness to all lights in the group while you shape the curve, without holding the scrubber. Lights restore automatically when preview is stopped, the card is navigated away from, or the entity changes
- **Origin point Y-drag** — the leftmost control point (brightness at 0% input) can now be dragged vertically to set a dim floor, with a dashed stroke and `ns-resize` cursor to indicate constrained movement
- **Badge overflow** — when the light-selector bar is too narrow to show all badges, excess ones collapse behind a "+N more" button with `aria-expanded` toggle

### Changed

- Save-lifecycle state machine extracted into a pure TypeScript reducer (`save-lifecycle.ts`) — three ad-hoc `@state` booleans collapsed into one `SaveState` + selectors, making save logic testable in isolation
- Brightness helpers extracted from `light.py` into a dedicated `brightness.py` module — identical behaviour, cleaner module boundaries
- Coverage gates hardened: Python floor raised to 90% (baseline 94.74%), JS thresholds set at 75/65/75/75 (baseline 82.52/73.76/83.47/80.52)

### Fixed

- Preview stops on `disconnectedCallback` — lights no longer stuck at preview brightness after navigating away
- Preview scrubber indicator now defaults to 50% when preview starts before the scrubber has been touched, so the graph stays in sync with what lights receive
- Preview throttle now fires a trailing-edge send so the final scrubber position always reaches lights, even after rapid movement
- Rapid preview toggle after an entity switch no longer sends stale brightness restore targets
- Origin control point is now protected from accidental long-press deletion on mobile
- Badge overflow measurement skipped while expanded, fixing an infinite expand/collapse flicker loop
- ARIA labels on keyboard-editable control points now correctly distinguish origin (Y-only) and all other points (free move + remove) — previously all said "Space removes"
- Focus-visible styles added to Preview, Presets, and preset-option buttons for keyboard accessibility
- Division by zero in `scaleRangedValue` when source range is degenerate — now returns target range start instead of `NaN`
- Floating promise anti-pattern in `curve-graph.ts`: `.updateComplete.then()` calls now guarded with `.catch(() => {})` to prevent unhandled rejections on disconnect
- Undo stack for old entity cleared on entity-switch bail path, preventing stale undo history from a previous entity being replayable after switch-back
- Config flow: `_area_filter` internal key regression test added

## [2.13.0] - 2026-04-12

### Added

- **Curve presets** — new "Presets" button in the card header opens a one-click picker with four named curves: Linear, Dim accent, Late starter, and Night mode. Each shows a miniature curve preview. Applies to the selected light only, or all lights if nothing is selected. Fully undoable with Ctrl+Z.

### Fixed

- Presets panel closes automatically when you drag a point, cancel edits, or switch entities — no orphaned panel after navigating away
- Clicking a preset while a save is already in flight is now ignored — previously the UI could fall out of sync with what was actually saved
- Clicking a preset before curves have loaded no longer creates a phantom undo entry
- Config flow: removed unsupported `description` field from curve preset select options, fixing a crash in pytest on HA 2024.11+

## [2.12.0] - 2026-04-12

### Added

- Config flow: area filter step between name and light picker — select a room first to narrow 100+ lights down to the relevant subset on mobile
- Config flow: mode descriptions on all four curve presets (Linear, Dim accent, Late starter, Night mode) shown as radio cards with plain-language explanations
- Brightness preview: "Previewing live — release to restore original brightness" notice shown in the status area while the scrubber is held
- Keyboard-accessible graph point editing: focus curve points, move them with arrow keys, add with `Enter`, remove with `Space`
- `DESIGN.md` documenting UI tokens, component patterns, and accessibility expectations for the editor

### Changed

- Scrubber preview throttle increased from ~16ms (60fps RAF) to 300ms minimum interval, capping at ~3 commands/sec per light to prevent Zigbee/Matter/MQTT command backlog buildup
- Graph hint text updated: "Select a light below — each gets its own curve" to clarify that curves are per-light
- Editor panel empty state now explains what Lightener is, how to create a group, and links straight to Home Assistant Integrations
- Embedded narrow-screen layout now keeps save and cancel actions in a sticky footer directly below the graph stack
- Curve loading now uses a graph-shaped skeleton instead of pulsing text

### Fixed

- SVG adds `user-select: none; -webkit-user-select: none` to prevent iOS from selecting text or triggering native gestures during long-press on control points
- Entity switching in the sidebar panel no longer drops dirty curve edits silently; it now requires inline save or discard confirmation
- Scrubber badge overflow now shows a `+N more` indicator instead of silently clipping extra values

## [2.11.0] - 2026-04-12

### Added

- Embedded workspace layout: 2-column grid (graph+scrubber | legend+footer) when the curve card is hosted in the editor panel, single-column stack on narrow screens
- "Lights" section label on the legend component for scannable hierarchy
- Dynamic SVG `<desc>` element for screen reader curve summary (e.g. "3 curves: Ceiling Light, Sofa Lamp, LED Strip")
- Design review TODOs (TODOS.md) with 10 tracked improvement items

### Changed

- Editor panel shell: wider max-width (1360px), styled control-row with gradient surface, responsive breakpoints at 900px
- Panel DOM construction is now one-time: `shadowRoot.innerHTML` only runs on first render, preventing card-mount wipe on hass updates
- Panel uses ES module import (`import()`) instead of script tag injection for curve card loading
- Entity picker filters by `config_entry_id` when deep-linked via `?config_entry=...` URL param
- Error retry buttons changed from "Tap to retry" to "Retry"
- CSS custom properties (`--curve-graph-max-height`, `--curve-legend-max-height`, `--curve-scrubber-badges-max-height`) for component sizing in embedded mode

### Fixed

- Card mount cleared when no entity is selected (previously showed stale card)
- Panel entity loading race condition with config_entry filtering

## [2.10.0] - 2026-04-12

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
- Sidebar panel curve editor no longer goes blank after entity list loads: the shadow DOM structure is now built once and updated in-place, so the card mount point is never wiped by subsequent `hass` updates
- `lightener/list_entities` WebSocket response now includes `config_entry_id` so the panel can filter entities by config entry when opened from the integration config flow
- 16 new Vitest unit tests for the sidebar panel (`lightener-panel.test.ts`) covering entity selection, card lifecycle, and config-entry filtering

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
