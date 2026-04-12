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

- [x] **Unsaved changes guard on entity switch**
  When switching entities with dirty (unsaved) curve edits, changes are silently lost.
  Add an inline confirmation bar in the control-row: "Unsaved changes. Save / Discard"
  (not a native confirm() dialog — those block the HA UI thread).
  Affects: `custom_components/lightener/frontend/lightener-panel.js`, `js/src/lightener-curve-card.ts`
  Why: Silently losing work undermines trust in the editor.

- [x] **Proper empty state with guidance**
  "No Lightener entities found." is bare text. Design a warm empty state:
  explain what Lightener is, how to set up a group, and link to the HA integration
  page. This IS the onboarding for new users.
  Affects: `custom_components/lightener/frontend/lightener-panel.js`
  Why: Empty state is the first impression for new installs.

- [x] **"+N more" overflow indicator for scrubber badges**
  Value badges are silently clipped with `overflow: hidden` and max-height cap.
  With 5+ visible curves, some badges disappear with no indication. Show "+N more"
  when badges overflow.
  Affects: `js/src/components/curve-scrubber.ts`
  Why: Scrubber preview is a trust feature. Hiding values breaks that trust.

### P1 — Polish

- [x] **Change "Tap to retry" to "Retry"**
  Error retry buttons say "Tap to retry" — phone language on a desktop/tablet panel.
  Change to "Retry".
  Affects: `js/src/lightener-curve-card.ts` (render method, 2 occurrences)

- [x] **Add section label "Lights" to legend component**
  The graph has "Brightness Curves", the scrubber has "Preview at brightness",
  but the legend has no heading. Add a small label matching the scrubber style
  (10px uppercase, secondary text color).
  Affects: `js/src/components/curve-legend.ts`

- [x] **Add skeleton placeholder during curve loading**
  Replace "Loading curves..." pulsing text with a skeleton showing graph outline
  (axis lines, faint grid) that holds visual space and communicates "graph is coming."
  Affects: `js/src/lightener-curve-card.ts`

- [x] **Add dynamic SVG `<desc>` for screen readers**
  The graph SVG has `role="img"` but no `<desc>`. Add a dynamic description like
  "3 curves: Ceiling Light at 75%, Sofa Lamp at 50%, LED Strip at 100%" so screen
  reader users get curve state without visual access.
  Affects: `js/src/components/curve-graph.ts`

### P2 — Accessibility

- [x] **Keyboard-accessible graph point editing**
  Graph control points can only be moved by pointer drag. Keyboard-only users cannot
  edit curves. Needs: focus management on individual SVG points, arrow key movement
  with snap-to-grid, Enter/Space for add/remove. Significant effort.
  Affects: `js/src/components/curve-graph.ts`

### P2 — Design System

- [x] **Create DESIGN.md via /design-consultation**
  No design system document exists. Design decisions (colors, spacing, typography,
  component patterns) are scattered across component CSS. Run /design-consultation
  to capture the implicit system and establish tokens for future work.

## Adversarial Review Findings (2026-04-12)

Source: /challenge mode adversarial review

### P1 — Production Safety (Critical crash/data loss risks)

- [ ] **Guard division by zero in range scaling**
  `js/src/utils/interpolation.ts:14` in `scaleRangedValue()` divides by `(b - a)` without
  checking if sourceRange endpoints are identical. If ever triggered, results in `Infinity`
  or `NaN` propagating through curve sampling, crashing brightness interpolation.
  Fix: Add early return if `sourceRange[0] === sourceRange[1]`.
  Priority: P1 (reliability blocker)

- [ ] **Guard SVG coordinate transform inversion**
  `js/src/components/curve-graph.ts:186-192` calls `ctm.inverse()` without null check.
  On edge-case SVG containers (zero-scaled, degenerate), inverse() could fail or return
  unexpected results, breaking all graph interactions.
  Fix: Add `if (!inv) return null` after line 188.
  Priority: P1 (interaction blocker)

- [ ] **Race condition: entity change during save**
  `js/src/lightener-curve-card.ts:948-963`. If user switches entity while save is in flight,
  `_tryLoadCurves()` reloads for the OLD entity after save completes. Results in data
  corruption: wrong entity's data loads into the new entity editor.
  Fix: Capture `this._entityId` before the async call; validate it hasn't changed before
  reloading. Pass captured entity ID to `_tryLoadCurves()` to detect mismatch.
  Priority: P1 (data integrity)

- [ ] **Guard localStorage access in entity persistence**
  `custom_components/lightener/frontend/lightener-panel.js:160-162`. Direct localStorage
  calls without try/catch. In private browsing or quota-exceeded scenarios, throws uncaught
  error and breaks entity selection persistence.
  Fix: Wrap lines 160-162 in try/catch with silent fallback.
  Priority: P1 (reliability)

### P2 — Reliability (Edge case crashes, memory/focus leaks)

- [ ] **Timer leak on component destruction**
  Multiple `setTimeout` calls without guaranteed cleanup: `_saveSuccessTimer` (line 205),
  `_longPressTimer` (graph.ts line 41), scrubber click timeout (line 260). If panel unmounts
  during animation, timers fire on destroyed components causing warnings/errors.
  Fix: Add `_isDestroyed` flag; check it in all timer callbacks before executing state updates.
  Priority: P2 (reliability)

- [ ] **Missing error context in save failures**
  `custom_components/lightener/frontend/lightener-panel.js:177`. `await saveCurves()` with
  no error logging. Save fails with generic "Save failed. Check connection." — real error
  (permission denied, integration error) is lost to console, hard to debug.
  Fix: Log `err` to console with full context before returning false.
  Priority: P2 (debuggability)

- [ ] **Focus management missing in keyboard editing**
  `js/src/components/curve-graph.ts:212-227`. New keyboard support (`_onPointFocus`,
  `_onPointBlur`) tracks focused point in data but doesn't manage DOM focus. Screen reader
  users see no focus indication; keyboard nav flow is unclear.
  Fix: Call `.focus()` on the hit-circle SVG element when `_focusedPoint` changes.
  Priority: P2 (accessibility)

- [ ] **Hard-coded URL for integrations link**
  `custom_components/lightener/frontend/lightener-panel.js:246`. Empty state link href is
  `/config/integrations` with no dynamic URL construction. Breaks if HA is behind reverse
  proxy with path prefix (e.g., `/ha/config/integrations`).
  Fix: Build from `this._hass.config?.frontend_url || '/'` + path.
  Priority: P2 (reverse-proxy compatibility)

- [ ] **Entity dropdown double-click race condition**
  `custom_components/lightener/frontend/lightener-panel.js:315-319`. If user clicks entity
  dropdown twice while dirty, `_pendingEntity` overwrites on second click. Second entity is
  lost; UI shows first pending entity. Confusing UX, silent data loss of selection.
  Fix: Ignore entity change events while a switch is already pending (`_pendingEntity` is set).
  Priority: P2 (UX/reliability)
