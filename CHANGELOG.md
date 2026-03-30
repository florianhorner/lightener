# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Interactive brightness curve editor card (`custom:lightener-curve-card`) built with Lit 3.x
- WebSocket API for curve data management (`lightener/get_curves`, `lightener/save_curves`)
- Smooth bezier curves with gradient fills and colorblind-accessible dash patterns
- Brightness scrubber with real-time bar gauge readouts
- Keyboard shortcuts (Ctrl+S to save, Esc to cancel) and unsaved-changes guard
- Light/dark theme support using Home Assistant CSS custom properties
- Mobile-responsive layout with touch-optimised targets
- Full CI pipeline: ruff, eslint, prettier, mypy, pytest, hassfest, HACS validation
- Pre-commit hooks for ruff and JS lint-staged
- SECURITY.md and GitHub auto-generated release notes config

### Changed

- Renamed HACS display name to avoid confusion with upstream Lightener
- Migrated pytest config from setup.cfg to pyproject.toml
- Consolidated lint config (ruff in pyproject.toml, eslint for TypeScript)

### Fixed

- Home Assistant 2026.x compatibility (`async_register_static_paths` API)
- Missing closing parenthesis in static path registration
- Z-index layering: selected curve now renders on top so all points are clickable
- Curve load race condition prevented via deduplication flag
- Right-click menu, line rendering, hit targets, and font sizing
- Legend name truncation and dirty-state indicator
- Clickable points, right-click delete, and colorblind dash patterns
- Timer leak, field ordering, and platform forwarding
- Double migration guard and unknown entity rejection

## [2.4.0] - Upstream

This version matches [fredck/lightener](https://github.com/fredck/lightener) v2.4.0,
from which this fork was created.
