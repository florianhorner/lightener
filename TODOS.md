# TODOs

## Design Review Findings (2026-04-12)

Source: /plan-design-review on branch florianhorner/fix-cog-blank

### P1 — Usability

- [ ] **Sticky footer for narrow screens (<1100px)**
  When the workspace stacks to single-column, save/cancel/undo buttons end up far
  below the graph. Add a sticky footer with subtle top border (transparent bg,
  `border-top: 1px solid var(--divider-color)`) so actions stay within reach.
  Affects: `js/src/lightener-curve-card.ts` (embedded mode styles + render)
  Why: The editing flow is drag-point → save. If save is offscreen, the flow breaks.

- [ ] **Unsaved changes guard on entity switch**
  When switching entities with dirty (unsaved) curve edits, changes are silently lost.
  Add an inline confirmation bar in the control-row: "Unsaved changes. Save / Discard"
  (not a native confirm() dialog — those block the HA UI thread).
  Affects: `custom_components/lightener/frontend/lightener-panel.js`, `js/src/lightener-curve-card.ts`
  Why: Silently losing work undermines trust in the editor.

- [ ] **Proper empty state with guidance**
  "No Lightener entities found." is bare text. Design a warm empty state:
  explain what Lightener is, how to set up a group, and link to the HA integration
  page. This IS the onboarding for new users.
  Affects: `custom_components/lightener/frontend/lightener-panel.js`
  Why: Empty state is the first impression for new installs.

- [ ] **"+N more" overflow indicator for scrubber badges**
  Value badges are silently clipped with `overflow: hidden` and max-height cap.
  With 5+ visible curves, some badges disappear with no indication. Show "+N more"
  when badges overflow.
  Affects: `js/src/components/curve-scrubber.ts`
  Why: Scrubber preview is a trust feature. Hiding values breaks that trust.

### P1 — Polish

- [ ] **Change "Tap to retry" to "Retry"**
  Error retry buttons say "Tap to retry" — phone language on a desktop/tablet panel.
  Change to "Retry".
  Affects: `js/src/lightener-curve-card.ts` (render method, 2 occurrences)

- [ ] **Add section label "Lights" to legend component**
  The graph has "Brightness Curves", the scrubber has "Preview at brightness",
  but the legend has no heading. Add a small label matching the scrubber style
  (10px uppercase, secondary text color).
  Affects: `js/src/components/curve-legend.ts`

- [ ] **Add skeleton placeholder during curve loading**
  Replace "Loading curves..." pulsing text with a skeleton showing graph outline
  (axis lines, faint grid) that holds visual space and communicates "graph is coming."
  Affects: `js/src/lightener-curve-card.ts`

- [ ] **Add dynamic SVG `<desc>` for screen readers**
  The graph SVG has `role="img"` but no `<desc>`. Add a dynamic description like
  "3 curves: Ceiling Light at 75%, Sofa Lamp at 50%, LED Strip at 100%" so screen
  reader users get curve state without visual access.
  Affects: `js/src/components/curve-graph.ts`

### P2 — Accessibility

- [ ] **Keyboard-accessible graph point editing**
  Graph control points can only be moved by pointer drag. Keyboard-only users cannot
  edit curves. Needs: focus management on individual SVG points, arrow key movement
  with snap-to-grid, Enter/Space for add/remove. Significant effort.
  Affects: `js/src/components/curve-graph.ts`

### P2 — Design System

- [ ] **Create DESIGN.md via /design-consultation**
  No design system document exists. Design decisions (colors, spacing, typography,
  component patterns) are scattered across component CSS. Run /design-consultation
  to capture the implicit system and establish tokens for future work.
