# TODOs

## Design Review Findings (2026-04-12)

Source: /plan-design-review on branch florianhorner/fix-cog-blank

### P1 — Usability

- [x] **Sticky footer for narrow screens (<1100px)**
  When the workspace stacks to single-column, save/cancel/undo buttons end up far
  below the graph. Add a sticky footer with subtle top border (transparent bg,
  `border-top: 1px solid var(--divider-color)`) so actions stay within reach.
  Affects: `js/src/lightener-curve-card.ts` (embedded mode styles + render)
  Why: The editing flow is drag-point → save. If save is offscreen, the flow breaks.
  **Completed:** v2.12.0 (2026-04-12)

- [x] **Unsaved changes guard on entity switch**
  When switching entities with dirty (unsaved) curve edits, changes are silently lost.
  Add an inline confirmation bar in the control-row: "Unsaved changes. Save / Discard"
  (not a native confirm() dialog — those block the HA UI thread).
  Affects: `custom_components/lightener/frontend/lightener-panel.js`, `js/src/lightener-curve-card.ts`
  Why: Silently losing work undermines trust in the editor.
  **Completed:** v2.12.0 (2026-04-12)

- [x] **Proper empty state with guidance**
  "No Lightener entities found." is bare text. Design a warm empty state:
  explain what Lightener is, how to set up a group, and link to the HA integration
  page. This IS the onboarding for new users.
  Affects: `custom_components/lightener/frontend/lightener-panel.js`
  Why: Empty state is the first impression for new installs.
  **Completed:** v2.12.0 (2026-04-12)

- [x] **"+N more" overflow indicator for scrubber badges**
  Value badges are silently clipped with `overflow: hidden` and max-height cap.
  With 5+ visible curves, some badges disappear with no indication. Show "+N more"
  when badges overflow.
  Affects: `js/src/components/curve-scrubber.ts`
  Why: Scrubber preview is a trust feature. Hiding values breaks that trust.
  **Completed:** v2.12.0 (2026-04-12)

### P1 — Polish

- [x] **Change "Tap to retry" to "Retry"**
  Error retry buttons say "Tap to retry" — phone language on a desktop/tablet panel.
  Change to "Retry".
  Affects: `js/src/lightener-curve-card.ts` (render method, 2 occurrences)
  **Completed:** v2.12.0 (2026-04-12)

- [x] **Add section label "Lights" to legend component**
  The graph has "Brightness Curves", the scrubber has "Preview at brightness",
  but the legend has no heading. Add a small label matching the scrubber style
  (10px uppercase, secondary text color).
  Affects: `js/src/components/curve-legend.ts`
  **Completed:** v2.11.0 (2026-04-12)

- [x] **Add skeleton placeholder during curve loading**
  Replace "Loading curves..." pulsing text with a skeleton showing graph outline
  (axis lines, faint grid) that holds visual space and communicates "graph is coming."
  Affects: `js/src/lightener-curve-card.ts`
  **Completed:** v2.12.0 (2026-04-12)

- [x] **Add dynamic SVG `<desc>` for screen readers**
  The graph SVG has `role="img"` but no `<desc>`. Add a dynamic description like
  "3 curves: Ceiling Light at 75%, Sofa Lamp at 50%, LED Strip at 100%" so screen
  reader users get curve state without visual access.
  Affects: `js/src/components/curve-graph.ts`
  **Completed:** v2.11.0 (2026-04-12)

### P2 — Accessibility

- [x] **Keyboard-accessible graph point editing**
  Graph control points can only be moved by pointer drag. Keyboard-only users cannot
  edit curves. Needs: focus management on individual SVG points, arrow key movement
  with snap-to-grid, Enter/Space for add/remove. Significant effort.
  Affects: `js/src/components/curve-graph.ts`
  **Completed:** v2.12.0 (2026-04-12)

### P2 — Design System

- [x] **Create DESIGN.md via /design-consultation**
  No design system document exists. Design decisions (colors, spacing, typography,
  component patterns) are scattered across component CSS. Run /design-consultation
  to capture the implicit system and establish tokens for future work.
  **Completed:** v2.12.0 (2026-04-12)

## Adversarial Review Findings (2026-04-12)

Source: /challenge mode adversarial review

### P1 — Production Safety (Critical crash/data loss risks)

- [x] **Guard division by zero in range scaling**
  `js/src/utils/interpolation.ts:14` in `scaleRangedValue()` divides by `(b - a)` without
  checking if sourceRange endpoints are identical. If ever triggered, results in `Infinity`
  or `NaN` propagating through curve sampling, crashing brightness interpolation.
  Fix: Add early return if `sourceRange[0] === sourceRange[1]`.
  Priority: P1 (reliability blocker)
  **Completed:** v2.13.1 (2026-04-13)

- [x] **Guard SVG coordinate transform inversion**
  `js/src/components/curve-graph.ts:186-192` calls `ctm.inverse()` without null check.
  On edge-case SVG containers (zero-scaled, degenerate), inverse() could fail or return
  unexpected results, breaking all graph interactions.
  Fix: Wrap in try/catch + NaN guard.
  Priority: P1 (interaction blocker)
  **Completed:** v2.13.1 (2026-04-13)

- [x] **Race condition: entity change during save**
  `js/src/lightener-curve-card.ts`. If user switches entity while save is in flight,
  post-save state update would corrupt the new entity's editor.
  Fix: Capture entityId before async call; bail if it changed after await.
  Priority: P1 (data integrity)
  **Completed:** v2.13.1 (2026-04-13)

- [x] **Guard localStorage access in entity persistence**
  `custom_components/lightener/frontend/lightener-panel.js:160-162`. Direct localStorage
  calls without try/catch. In private browsing or quota-exceeded scenarios, throws uncaught
  error and breaks entity selection persistence.
  Fix: Wrap all localStorage reads/writes in try/catch with silent fallback.
  Priority: P1 (reliability)
  **Completed:** v2.13.1 (2026-04-13)

### P2 — Reliability (Edge case crashes, memory/focus leaks)

- [x] **Timer leak on component destruction**
  Scrubber click-preview `setTimeout` (1500ms) had no cleanup. `_saveSuccessTimer` and
  `_longPressTimer` were already handled.
  Fix: Added `_clickPreviewTimer` field to scrubber; clear in `disconnectedCallback`.
  Priority: P2 (reliability)
  **Completed:** v2.13.1 (2026-04-13)

- [x] **Missing error context in save failures**
  `custom_components/lightener/frontend/lightener-panel.js`. `await saveCurves()` with
  no error logging. Save fails with generic message — real error lost to console.
  Fix: Added try/catch with `console.error` around the save call in the panel.
  Priority: P2 (debuggability)
  **Completed:** v2.13.1 (2026-04-13)

- [x] **Focus management missing in keyboard editing**
  After keyboard point-add/remove, the DOM re-renders and focus is lost.
  Fix: Call `_refocusHitCircle()` via `updateComplete.then()` after structural keyboard actions.
  Priority: P2 (accessibility)
  **Completed:** v2.13.1 (2026-04-13)

- [x] **Hard-coded URL for integrations link**
  `custom_components/lightener/frontend/lightener-panel.js`. Empty state link href was
  `/config/integrations` — breaks with HA reverse-proxy path prefixes.
  Fix: Build URL from `this._hass?.config?.frontend_url` + path.
  Priority: P2 (reverse-proxy compatibility)
  **Completed:** v2.13.1 (2026-04-13)

- [x] **Entity dropdown double-click race condition**
  `custom_components/lightener/frontend/lightener-panel.js`. Second click while switch pending
  overwrote `_pendingEntity`, silently losing the selection.
  Fix: Ignore entity-change events when `_pendingEntity` is already set.
  Priority: P2 (UX/reliability)
  **Completed:** v2.13.1 (2026-04-13)
