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

## Design Review Findings (2026-04-28)

Source: /design-review on master branch — cross-model (Claude + Codex GPT-5.4 + subagent)

### P1 — Accessibility (card component)

- [ ] **Warning orange `#f59e0b` fails WCAG AA on white**
  `js/src/components/curve-footer.ts:36-40` — the warning/dirty state uses orange that
  reads at ~2.15:1 on white. Replace with `--warning-color` token (already `#ffa726`)
  and verify it reaches 3:1 for UI components.
  Priority: P1 (WCAG AA violation on save confirmation flow)

- [ ] **Legend SVG with `role="button"` — replace with real `<button>`**
  `js/src/components/curve-legend.ts:792-806` — an `<svg>` uses `role="button"` instead
  of wrapping in a `<button>`. Real button: free keyboard focus, Enter/Space fire events,
  `tabindex` managed correctly, pointer semantics correct.
  Priority: P1 (a11y — synthetic buttons break screen reader and keyboard patterns)

### P2 — Accessibility (card component)

- [ ] **Scrubber "Preview on lights" button has no 44px touch minimum**
  `js/src/components/curve-scrubber.ts:43-61` — preview button falls below 44×44px.
  Add `min-width: 44px; min-height: 44px` or equivalent padding.
  Priority: P2 (touch accessibility)

- [ ] **Legend eye/trash affordances only 32×32 on mobile**
  `js/src/components/curve-legend.ts:472-489` — mobile touch targets should be ≥44px.
  Priority: P2 (touch accessibility)

### P2 — Design System Consistency

- [ ] **`--divider` and `--divider-color` used interchangeably across components**
  `curve-legend.ts` reads `--divider-color` directly (7 uses), bypassing the `--divider`
  alias defined in `lightener-curve-card.ts:293`. Fallback values also diverge:
  `rgba(0,0,0,0.12)` (light-biased) vs `rgba(127,127,127,0.2)` (neutral). Normalize to
  `--divider` everywhere so single-theme theming works correctly.
  Affects: `js/src/components/curve-legend.ts`, `js/src/components/curve-scrubber.ts`
  Priority: P2 (token consistency)

- [ ] **`--graph-bg` token defined but never consumed by `curve-graph.ts`**
  `lightener-curve-card.ts:293` defines `--graph-bg` but `curve-graph.ts` has zero
  references to it. The graph background cannot be themed. Either bridge the token into
  the canvas/SVG render pass or remove the dead token from the spec.
  Affects: `js/src/components/curve-graph.ts`, DESIGN.md
  Priority: P2 (dead token — theming gap)

- [ ] **Hardcoded `#2563eb` accent color scattered instead of tokenized**
  `curve-footer.ts:59-64`, `curve-scrubber.ts:64-82,130-167`, `lightener-curve-card.ts:402,577-587,619-623`
  all hardcode `#2563eb`. Extract to a `--accent-color` or `--product-color` CSS variable
  in `:host` so all interactive affordances share one changeable source.
  Priority: P2 (token consistency / theming)

- [ ] **Breakpoint fragmentation: 5 different values across files with no shared constants**
  Demo: 860px · Card: 1100px / 700px · Sub-components: 500px.
  None are shared. DESIGN.md has no breakpoint section.
  Add a breakpoint inventory to DESIGN.md and consider CSS custom media queries or
  a JS constant shared across components.
  Affects: `docs/index.html:291`, `js/src/lightener-curve-card.ts:511-556`,
  `js/src/components/curve-graph.ts:141`, `js/src/components/curve-legend.ts:465`,
  `js/src/components/curve-footer.ts:84`
  Priority: P2 (consistency — responsive pivots don't align)

- [ ] **DESIGN.md does not document `--secondary-text` token or breakpoints**
  The card defines `--secondary-text` in `:host` but it's absent from DESIGN.md.
  Breakpoints section missing entirely. Update DESIGN.md so it reflects all live tokens.
  Priority: P2 (docs lag implementation)

### P3 — Demo Page Polish

- [ ] **"Centered everything" on demo page — consider left-aligning secondary content**
  `docs/index.html:71-80,127-128` — the full page including hint pills and footer links
  are center-aligned. Centering every element including hint pills creates a monotone
  composition without hierarchy. Consider left-aligning pills or staggering card labels.
  Priority: P3 (subtle visual hierarchy)
