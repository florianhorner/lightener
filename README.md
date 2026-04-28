# Lightener Curve Editor

[![GitHub Release][releases-shield]][releases]
[![hacs][hacsbadge]][hacs]

A fork of [fredck/lightener](https://github.com/fredck/lightener) that adds an interactive brightness curve editor card for Home Assistant. Everything from upstream is included unchanged — this fork layers the visual editor on top.

**[Try the live demo](https://florianhorner.github.io/lightener-curve-editor/)** — no install needed.

![Lightener Curve Editor — light and dark mode side by side](.github/assets/lightener-curve-editor-screenshot.png)

## Curve Editor Card (`custom:lightener-curve-card`)

A visual editor for per-light brightness curves, directly in your HA dashboard — no more typing number pairs by hand.

- **Drag control points** on smooth bezier curves to shape each light's response
- **Double-click to add** a point, **right-click to remove** one
- **Brightness scrubber** with gradient track and position label — drag to preview each light's output at any brightness level
- **Scrubber + graph sync**: moving the scrubber shows a vertical indicator and per-curve dots directly on the graph
- **Live light preview**: the **Preview** button pushes real brightness to all lights while you shape curves; dragging the scrubber also pushes live brightness. Lights restore automatically when you stop
- **Curve presets**: one-click presets panel (Linear, Dim accent, Late starter, Night mode) with miniature SVG previews — applies to selected light or all lights, fully undoable
- **Explicit edit mode**: selecting a curve shows an "Editing" chip and a × button to exit without navigating away
- **Dim floor via origin drag**: drag the leftmost control point vertically to set a non-zero dim floor
- **Colorblind-accessible**: dash patterns + shape markers distinguish curves without relying on color alone
- **Keyboard navigation**: arrow keys on the scrubber, Ctrl+S to save, Ctrl+Z to undo, Esc to cancel
- **Mobile-friendly**: touch-optimised controls with 44px touch targets, long-press to delete
- **Admin-only editing**: non-admin users see curves in read-only mode
- **Theme-aware**: adapts to both HA light and dark modes
- **Scales from 2 to 20+ lights**: legend rows and curve labels truncate cleanly at any card width

### WebSocket API

- `lightener/get_curves` — read brightness configs (all authenticated users)
- `lightener/save_curves` — write brightness configs (admin only)
- `lightener/list_entities` — list available Lightener entities (used by the sidebar panel)

## Installing

1. In HACS, go to the three-dot menu → **Custom repositories**
2. Add `florianhorner/lightener-curve-editor` as an Integration
3. Search for "Lightener Curve Editor" and install it
4. Restart Home Assistant
5. Add a card to your dashboard:

```yaml
type: custom:lightener-curve-card
entity: light.your_lightener_device
```

The fork also registers a **Lightener Editor** sidebar panel at `/lightener-editor` — use it to pick a Lightener entity and edit curves without adding a dashboard card first.

To switch back to upstream: remove this repo from HACS custom repositories and reinstall "Lightener" from the default HACS store. All Lightener devices and automations remain unaffected.

## Documentation

- [CHANGELOG.md](CHANGELOG.md) — release history
- [CONTRIBUTING.md](CONTRIBUTING.md) — local setup, tooling, and workflow
- [SECURITY.md](SECURITY.md) — vulnerability reporting policy
- [DESIGN.md](DESIGN.md) — UI tokens, patterns, and accessibility baseline
- [CLAUDE.md](CLAUDE.md) — repository notes for AI-assisted contributors

## Local Development

```sh
scripts/setup-python   # Python venv + deps
scripts/test-python    # backend pytest
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow including `scripts/ha-sync` for direct deployment to a test HA instance.

[hacs]: https://github.com/hacs/integration
[hacsbadge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge

[releases-shield]: https://img.shields.io/github/release/florianhorner/lightener-curve-editor.svg?style=for-the-badge&include_prereleases
[releases]: https://github.com/florianhorner/lightener-curve-editor/releases
