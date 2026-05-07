# PR #74 Runtime Artifact

**Captured:** 2026-05-08 against rebuilt #74 bundle served from `docs/index.html` on localhost.
**Bundle source:** `custom_components/lightener/frontend/lightener-curve-card.js` from this branch.

## Smoke gates

| Gate | Result |
|------|--------|
| Bundle loads from rollup output | HTTP 200 |
| Card renders in light + dark mode | See `74-card-load.png` |
| Hint text matches CHANGELOG entry | "Select a light, then double-click its curve to add a control point" |
| Presets panel opens (auto-open target surface) | See `74-presets-open.png` — Linear / Dim accent / Late starter / Night mode all render |
| Console errors | Zero (2 expected warnings about `<ha-entity-picker>` not loaded — demo harness has no HA frontend) |

## Coverage gaps (out of headless reach)

- `_autoOpenedEntities` Set behavior on first-load → covered by `js/src/lightener-curve-card.test.ts` unit tests (4 new in this PR).
- "Create group" modal sans preset selector → lives in `lightener-panel.js` (panel-level, not card-level); demo doesn't mount the panel.
- HA flow success page markdown CTA (`description="open_editor"`) → Python-side, requires HA restart to validate.

These gaps are accepted for the dev tag; full validation lands when Florian installs the dev.6 release on prod (post-tag, with HA restart).
