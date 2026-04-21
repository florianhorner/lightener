# Lightener Curve Editor — CLAUDE.md

## What this is

A Home Assistant custom integration (HACS) that controls groups of lights with
per-light brightness curves. Fork of fredck/lightener with an interactive
curve-editor card.

## Quality gates

### Release ZIP structure (critical)

HACS `zip_release: true` extracts the zip **directly** into
`/config/custom_components/lightener/`. If the zip contains a
`custom_components/lightener/` prefix, files land at
`…/lightener/custom_components/lightener/` and HA silently fails with
"Integration not found" — no import error, no traceback, just gone.

**Rule:** The release zip MUST have `manifest.json` at the root. No
`custom_components/` prefix anywhere in the archive.

**Enforcement:** The `release.yml` workflow validates this automatically and
fails the release if the structure is wrong.

**Manual uploads:** Never manually upload a zip to a GitHub release. Always let
the release workflow build it via the `cd … && zip -r ./` pattern. If you must
rebuild manually, run from inside `custom_components/lightener/`:

```bash
cd custom_components/lightener
zip lightener.zip -r ./
# Verify:
unzip -l lightener.zip | grep -c "custom_components/"  # must be 0
```

### Coverage gates

CI enforces minimum coverage on both sides. Gates are floors (not strict
ratchets) set 3-6pp below measured baseline — they catch meaningful
regressions without flagging small refactors.

- **Python:** `pyproject.toml` `[tool.coverage.report] fail_under = 90`
  (baseline ~94.74% after PR-B). Enforced in `.github/workflows/lint.yml`
  pytest job via `--cov-fail-under=90`.
- **Frontend:** `js/vitest.config.ts` thresholds `lines: 75`, `branches: 65`,
  `functions: 75`, `statements: 75` (baseline 82.52/73.76/83.47/80.52).
  `src/lightener-curve-card.ts` is excluded until the god-file is under
  400 lines and can be covered directly.
- **Raising a gate:** run the suite locally (`npm run test:coverage` or
  `scripts/test-python --cov=custom_components/lightener`), confirm the new
  floor has at least ~3pp cushion above the measured number, then bump the
  config. Don't chase the measured baseline exactly — that creates false
  failures on every PR.

### Shipping procedure

1. Bump version in `manifest.json` (the release workflow also patches it from the tag, but keep them in sync)
2. Create a GitHub release with tag `vX.Y.Z`
3. Let the Release workflow run — it builds the zip, validates structure, uploads
4. **Do not** manually re-upload or replace the release zip asset
5. After HACS picks up the new version, test on HA: verify the integration loads (`manifest/get` via websocket must succeed)

## Development

- `conductor.json` — Conductor Mac app config: `setup` runs `scripts/conductor-setup`, `run` button starts `scripts/develop`
- `scripts/conductor-setup` — one-shot workspace bootstrap (macOS-safe local bootstrap or Debian/root system bootstrap, plus JS deps)
- `scripts/setup-python` — create the local Python 3.13 `.venv`, install backend deps, and write `.env.workspace`
- `scripts/setup` — Debian/system bootstrap that installs system packages, then delegates to `scripts/setup-python`
- `scripts/test-python` — canonical backend test command; runs `.venv/bin/python -m pytest`
- `scripts/develop` — run HA locally with the integration
- `scripts/lint` — run linters
- Integration source lives in `custom_components/lightener/`
- Frontend card JS lives in `custom_components/lightener/frontend/`
- Card source (if editing) lives in `js/`
