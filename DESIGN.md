# Design System

This document captures the current visual system for the Lightener curve editor so future UI work extends a consistent language instead of re-inventing it component by component.

## Principles

- Use layered, tinted panels instead of flat cards. The graph, scrubber, legend, and panel controls each sit on a slightly mixed surface so the editor reads as a workspace rather than a form.
- Keep editing feedback immediate. Dirty state, preview state, save state, and loading state should all be visible in-place without modal dialogs.
- Favor compact, scannable controls. The editor is often used from tablets and narrow dashboards, so labels stay short and actions stay physically close to the graph.
- Make color supportive, not exclusive. Curves use color, dash patterns, shape markers, and labels together so the UI remains legible for colorblind and assistive-tech users.

## Tokens

### Surfaces

- `--card-bg`: primary card surface
- `--panel-bg`: mixed workspace panel surface
- `--graph-bg`: reserved graph background token
- `--divider`: low-contrast structural borders
- `--lightener-panel-surface`: panel shell surface
- `--lightener-panel-border`: panel shell border

### Type

- `--text-xs`: 9px utility labels
- `--text-sm`: 12px status copy and controls
- `--text-md`: 13px list rows
- `--text-lg`: 14px card heading

Typography rules:

- Section labels use uppercase, tight tracking, and secondary text color.
- Main titles use modest weight and slightly negative tracking.
- Status and helper copy should remain short enough to scan in one line when possible.

### Shape

- Outer cards: 16px radius
- Embedded panels and sub-panels: 12px radius
- Buttons: 8px radius in-card, pill radius in panel-level callouts
- Interactive dots: 6px visual point with larger invisible hit target

### Motion

- Success state fades instead of snapping away.
- Undo and cancel use a short cubic ease animation.
- Loading uses a shimmer skeleton that preserves graph space.
- Sticky mobile footer should feel anchored, not floating; use blur and a subtle divider instead of heavy shadows.

## Component Patterns

### Curve Card

- Header is quiet and compact in embedded mode.
- Workspace becomes two columns on wide layouts and a stacked flow on narrow ones.
- On narrow screens, action buttons live in a sticky footer directly below the graph stack.

### Graph

- Show grid, diagonal reference, and axis labels at all times.
- Selected curve stays visually dominant; non-selected curves dim.
- Editing affordances:
  - Pointer drag moves points
  - Double-click adds points
  - Right-click or long-press removes points
  - Keyboard focus on points enables arrow-key movement, `Enter` add, and `Space` remove
- SVGs must include a descriptive `<desc>` summary for screen readers.

### Scrubber

- Track aligns with graph padding so preview position matches the plotted data.
- Value badges are a trust feature; if not all fit, show `+N more` rather than silently clipping.
- Preview state should always be reversible and clearly announced.

### Legend

- Include a section label: `Lights`.
- Each item combines color, shape, name, and visibility affordance.
- Selected state uses an underline accent instead of heavier framing.

### Panel

- The entity selector sits in a distinct control row ahead of the editor workspace.
- Unsaved entity switches use an inline confirmation bar, never a blocking browser dialog.
- Empty states should explain what Lightener is, how to start, and where to go next.

## Accessibility Baseline

- Do not rely on color alone to distinguish curves.
- Keep touch targets at mobile-friendly sizes.
- Provide keyboard paths for scrubber, legend, and graph point editing.
- Use `role="status"` or `role="alert"` for transient save/load feedback where appropriate.

## Change Rule

When adding a new editor surface or control, first decide:

1. Which existing panel pattern it belongs to
2. Which token drives its spacing, shape, and type
3. How its dirty/loading/error state is shown inline
4. What the keyboard and screen-reader path is
